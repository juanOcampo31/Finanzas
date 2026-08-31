// ── Sincronización en la nube (Firebase) ────────────────────────────────────────────────
// Reutiliza EXACTAMENTE el mismo backup cifrado que ya produce exportJSON() (ver
// export-main.js): Firestore solo guarda el envelope {salt, iv, ct, ...} cifrado con el PIN
// (vía encryptString/decryptString, PBKDF2+AES-GCM) — nunca ve un solo dato en texto plano.
// El inicio de sesión con Google identifica DE QUIÉN es cada respaldo (evita que un desconocido
// lea/escriba el documento de otro usuario, ver reglas de Firestore), pero no participa en el
// cifrado: dos dispositivos con la misma cuenta de Google pero PIN distinto no pueden leerse el
// backup entre sí, y eso es intencional.
//
// Automático de punta a punta (sin pasar por el menú de Respaldo):
//  - Sube sola, con debounce, cada vez que save() guarda localmente (ver programarAutoSyncSubida,
//    llamada desde save() en auth.js).
//  - Al desbloquear con el PIN, revisa si hay un backup más nuevo en la nube que el que este
//    dispositivo subió/bajó por última vez, y si lo hay PREGUNTA antes de traerlo (ver
//    revisarSyncAlDesbloquear, llamada desde lockPinConfirm() en auth.js) — nunca reemplaza
//    datos locales en silencio.
// Con un solo usuario editando en un dispositivo a la vez esto es seguro; si llegaras a editar
// en dos dispositivos AL MISMO TIEMPO sin que ninguno alcance a sincronizar, gana el que suba
// de último (no hay fusión de cambios) — riesgo aceptado para el alcance actual de esta prueba.
const firebaseConfig = {
  apiKey: "AIzaSyCThC_eOoxyn5V6lefpwqqkpE2esjnX3z8",
  authDomain: "finanzas-personales-d7d20.firebaseapp.com",
  projectId: "finanzas-personales-d7d20",
  storageBucket: "finanzas-personales-d7d20.firebasestorage.app",
  messagingSenderId: "866583066688",
  appId: "1:866583066688:web:15ebe9b152d5d7b37b07a5"
};
// `typeof firebase!=='undefined'` (no solo un try/catch) porque este archivo también se carga
// en el sandbox de Node de los tests (ver js/manifest.json), donde el SDK de Firebase no existe
// — sin este guard, esta línea de nivel superior rompería la carga de TODO el paquete de
// scripts ahí, no solo la sincronización.
if(typeof firebase!=='undefined'){
  firebase.initializeApp(firebaseConfig);
}

function syncUsuarioActual(){
  return (typeof firebase!=='undefined')?firebase.auth().currentUser:null;
}

// "hace 2 min" / "hace 3 h" / "ayer" / "23 ago" a partir de fin26_last_sync_at (ver
// construirYSubirBackup) — usado en el menú de Respaldo para mostrar cuándo fue la última
// sincronización sin tener que abrir la consola de Firebase.
function formatoUltimaSync(ms){
  if(!ms) return null;
  const diffMs=Date.now()-ms;
  if(diffMs<60000) return 'hace un momento';
  const min=Math.floor(diffMs/60000);
  if(min<60) return 'hace '+min+' min';
  const horas=Math.floor(min/60);
  if(horas<24) return 'hace '+horas+' h';
  const dias=Math.floor(horas/24);
  if(dias===1) return 'ayer';
  if(dias<7) return 'hace '+dias+' días';
  return new Date(ms).toLocaleDateString('es-CO',{day:'numeric',month:'short'});
}

function syncSignInGoogle(){
  if(typeof firebase==='undefined'){ showAlert('No se pudo cargar el servicio de sincronización.'); return; }
  const provider=new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(function(){
    toast('Sesión iniciada ✓');
    openBackupMenu();
  }).catch(function(e){
    if(e.code==='auth/popup-closed-by-user') return;
    console.error('Error al iniciar sesión con Google', e);
    showAlert('No se pudo iniciar sesión: '+e.message);
  });
}

function syncSignOut(){
  firebase.auth().signOut().then(function(){
    toast('Sesión cerrada');
    openBackupMenu();
  });
}

// Construye el mismo envelope cifrado que exportJSON() y lo escribe en Firestore bajo el uid de
// Google actual — compartido entre la subida manual (menú de Respaldo) y la automática
// (programarAutoSyncSubida). Registra fin26_last_sync_at (hora local aproximada de este
// dispositivo) para que revisarSyncAlDesbloquear sepa si ya tiene lo último o no.
async function construirYSubirBackup(pin){
  const user=syncUsuarioActual();
  if(!user) return;
  const hoy=new Date().toISOString().slice(0,10);
  const payload=JSON.stringify({version:2,fecha:hoy,data:db,creditos:creditos,catMetodos:catMetodos,catTipos:catTipos,telefono:perfilTelefono});
  const envelope=await encryptString(payload,pin);
  const fileObj=Object.assign({encrypted:true, app:'FinanzasPersonales', version:2, fecha:hoy}, envelope);
  await firebase.firestore().collection('usuarios').doc(user.uid).set({
    backup: fileObj,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  localStorage.setItem('fin26_last_sync_at', String(Date.now()));
}

async function subirBackupNube(){
  const user=syncUsuarioActual();
  if(!user){ toast('Inicia sesión con Google primero'); return; }
  let pin=sessionPIN;
  if(!pin){
    pin=await promptPINModal('Confirma tu PIN para cifrar el respaldo en la nube');
    if(pin===null) return;
    if(!(await pinVerify(pin))){ showAlert('PIN incorrecto'); return; }
    sessionPIN=pin;
  }
  try{
    await construirYSubirBackup(pin);
    toast('Respaldo subido a la nube ✓');
    closeModal();
  }catch(e){
    console.error('Error al subir el respaldo a la nube', e);
    showAlert('No se pudo subir el respaldo: '+e.message);
  }
}

// Trae el envelope guardado en Firestore y lo procesa con el mismo camino que un backup JSON
// importado desde archivo (ver procesarBackupParseado en export-main.js): pide el PIN, descifra,
// valida el esquema y muestra la confirmación de "reemplazar todo" antes de aplicar nada.
async function bajarBackupNube(){
  const user=syncUsuarioActual();
  if(!user){ toast('Inicia sesión con Google primero'); return; }
  try{
    const snap=await firebase.firestore().collection('usuarios').doc(user.uid).get();
    if(!snap.exists){ showAlert('Todavía no hay ningún respaldo en la nube para esta cuenta.'); return; }
    const data=snap.data();
    if(!data||!data.backup){ showAlert('El respaldo en la nube está vacío o dañado.'); return; }
    await procesarBackupParseado(data.backup,'Respaldo en la nube ('+(data.backup.fecha||'')+')');
  }catch(e){
    console.error('Error al bajar el respaldo de la nube', e);
    showAlert('No se pudo bajar el respaldo: '+e.message);
  }
}

// ── Automático: subir con debounce tras cada save() ─────────────────────────────────────
let _autoSyncUploadTimer=null;
// Empieza en true para que ningún save() de arranque (ej. el que hace loadAppData() al
// desbloquear) alcance a subir datos locales TODAVÍA no comparados contra la nube — se apaga
// apenas revisarSyncAlDesbloquear() resuelve esa comparación (ver ahí). El resto de la sesión
// queda en false, así que los saves normales sí programan su subida.
let _syncCheckPendiente=true;
function programarAutoSyncSubida(){
  const user=syncUsuarioActual();
  if(!user || !sessionPIN) return; // sin sesión de Google o sin PIN en memoria, no hay nada que subir
  clearTimeout(_autoSyncUploadTimer);
  _autoSyncUploadTimer=setTimeout(function(){
    if(_syncCheckPendiente) return; // todavía no se resolvió si había algo más nuevo en la nube
    construirYSubirBackup(sessionPIN).then(function(){
      toast('☁️ Sincronizado');
    }).catch(function(e){
      console.error('[sync] auto-subida falló', e);
    });
  }, 4000);
}

// ── Automático: revisar al desbloquear si hay algo más nuevo en la nube ─────────────────
// Se llama justo después de un desbloqueo exitoso (ver lockPinConfirm en auth.js). No bloquea
// la app mientras responde — si Firebase tarda o falla, la app sigue funcionando normal, solo
// no se ofrece el aviso de "hay algo más nuevo".
//
// OJO: no se puede leer firebase.auth().currentUser directamente acá (síncrono) — el
// desbloqueo con PIN pasa casi apenas carga la página, y Firebase todavía no ha terminado de
// restaurar la sesión de Google guardada (currentUser da null unos instantes aunque SÍ sigas
// con sesión iniciada). onAuthStateChanged() es la forma correcta de esperar a que ese estado
// quede resuelto (con sesión o sin ella) antes de decidir si hay algo que revisar.
function revisarSyncAlDesbloquear(){
  if(typeof firebase==='undefined'){ _syncCheckPendiente=false; return; }
  const unsub=firebase.auth().onAuthStateChanged(function(user){
    unsub(); // solo interesa la primera resolución del estado, no quedarse escuchando cambios futuros acá
    if(!user){ _syncCheckPendiente=false; return; }
    firebase.firestore().collection('usuarios').doc(user.uid).get().then(function(snap){
      _syncCheckPendiente=false;
      if(!snap.exists) return;
      const data=snap.data();
      if(!data||!data.backup||!data.updatedAt||!data.updatedAt.toMillis) return;
      const remoteMs=data.updatedAt.toMillis();
      const localMs=parseInt(localStorage.getItem('fin26_last_sync_at')||'0');
      // Margen de 2s: evita que el propio reloj del servidor (unos ms distinto al de este
      // dispositivo) dispare el aviso sobre un backup que en realidad subió este mismo dispositivo.
      if(remoteMs<=localMs+2000) return;
      const fecha=new Date(remoteMs).toLocaleString('es-CO',{dateStyle:'short',timeStyle:'short'});
      showConfirm('Hay un respaldo más reciente en la nube (subido el '+fecha+', probablemente desde otro dispositivo). ¿Quieres revisarlo?',function(){
        procesarBackupParseado(data.backup,'Respaldo en la nube ('+(data.backup.fecha||'')+')');
      },{title:'Respaldo más reciente disponible', confirmLabel:'Revisar', cancelLabel:'Ahora no', danger:false});
    }).catch(function(e){
      _syncCheckPendiente=false;
      console.error('[sync] no se pudo revisar la nube al desbloquear', e);
    });
  });
}
