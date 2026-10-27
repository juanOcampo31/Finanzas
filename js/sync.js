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
  firebase.auth().signInWithPopup(provider).then(function(result){
    // Autocompletar el nombre del perfil con el de la cuenta de Google, solo si todavía no
    // habías puesto uno — nunca pisa un nombre que ya hayas escrito a mano en Perfil.
    var nombreGoogle=result&&result.user?result.user.displayName:null;
    if(nombreGoogle && !(perfilNombre||'').trim()){
      perfilNombre=nombreGoogle;
      save();
      render(); // sin esto, el header detrás del modal de Perfil quedaba con el nombre viejo
                // hasta el próximo render() completo (p.ej. al tocar "Guardar")
    }
    toast('Sesión iniciada ✓');
    openSecurityMenu();
    // Trae (preguntando) lo que haya más nuevo en la nube, o sube lo de este dispositivo si la
    // nube está vacía — sin esto, iniciar sesión no sincronizaba nada hasta el próximo desbloqueo.
    if(result&&result.user) revisarNubeParaUsuario(result.user);
  }).catch(function(e){
    if(e.code==='auth/popup-closed-by-user') return;
    console.error('Error al iniciar sesión con Google', e);
    showAlert('No se pudo iniciar sesión: '+e.message);
  });
}

function syncSignOut(){
  firebase.auth().signOut().then(function(){
    clearTimeout(_autoSyncUploadTimer);
    _syncEstado='pendiente'; _subidaEnEspera=false; // al volver a iniciar sesión se compara de nuevo
    toast('Sesión cerrada');
    openSecurityMenu();
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
  const payload=JSON.stringify({version:2,fecha:hoy,data:db,creditos:creditos,catMetodos:catMetodos,catTipos:catTipos,telefono:perfilTelefono,nombre:perfilNombre,q2DiasFijos:perfilQ2DiasFijos});
  const envelope=await encryptString(payload,pin);
  const fileObj=Object.assign({encrypted:true, app:'FinanzasPersonales', version:2, fecha:hoy}, envelope);
  await firebase.firestore().collection('usuarios').doc(user.uid).set({
    backup: fileObj,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  localStorage.setItem('fin26_last_sync_at', String(Date.now()));
}

// En pausa (la nube tiene algo más nuevo, ver revisarNubeParaUsuario) se pide confirmación
// explícita: subir ahí reemplaza lo que se hizo en el otro dispositivo.
function subirBackupNube(){
  if(syncEnPausa()){
    showConfirm('La nube tiene un respaldo más reciente que este dispositivo. Si subes ahora, lo reemplazas con los datos de aquí y se pierde lo que hiciste en el otro dispositivo.',function(){
      subirBackupNubeConfirmado();
    },{title:'¿Reemplazar el respaldo de la nube?', confirmLabel:'Subir y reemplazar'});
    return;
  }
  return subirBackupNubeConfirmado();
}
async function subirBackupNubeConfirmado(){
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
    _subidaEnEspera=false;
    syncMarcarListo();
    toast('Respaldo subido a la nube ✓');
    closeModal();
  }catch(e){
    console.error('Error al subir el respaldo a la nube', e);
    showAlert('No se pudo subir el respaldo: '+e.message);
  }
}

// ── Recuperar desde la nube ANTES de desbloquear (ver "¿Ya usas la app en otro dispositivo?"
// en showRecoveryOptions, auth.js) — para un dispositivo nuevo que todavía no tiene PIN ni
// datos locales: inicia sesión con Google y, si hay un respaldo, arma el PIN/data key de ESTE
// dispositivo con el mismo PIN que descifra ese respaldo, en vez de arrancar con la app vacía.
function syncSignInGoogleDesdeLock(){
  if(typeof firebase==='undefined'){ showAlert('No se pudo cargar el servicio de sincronización.'); return; }
  closeModal();
  const provider=new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(function(){
    return bajarBackupNubeDesdeLock();
  }).catch(function(e){
    if(e.code==='auth/popup-closed-by-user') return;
    console.error('Error al iniciar sesión con Google', e);
    showAlert('No se pudo iniciar sesión: '+e.message);
  });
}
// Mismo patrón que lockImportBackup (auth.js), fuente Firestore en vez de un archivo: pide el
// PIN con el que se protegió ese respaldo para descifrarlo, y arma una data key COMPLETAMENTE
// NUEVA para este dispositivo (nunca intenta reutilizar/desenvolver una que ya hubiera acá —
// en un dispositivo nuevo no existe ninguna, y en uno con un PIN roto la anterior se da por
// perdida de todas formas), envuelta bajo ese mismo PIN.
async function bajarBackupNubeDesdeLock(){
  const user=syncUsuarioActual();
  if(!user){ showAlert('No se pudo confirmar la sesión de Google.'); return; }
  try{
    const snap=await firebase.firestore().collection('usuarios').doc(user.uid).get();
    if(!snap.exists){ showAlert('No hay ningún respaldo en la nube para esta cuenta de Google.'); return; }
    const data=snap.data();
    if(!data||!data.backup){ showAlert('El respaldo en la nube está vacío o dañado.'); return; }
    const pin=await promptPINModal('Ingresa el PIN con el que se protegió ese respaldo');
    if(pin===null) return;
    let plain;
    try{
      plain=await decryptString(data.backup,pin);
    }catch(err){
      showAlert('PIN incorrecto o respaldo dañado. No se pudo descifrar.');
      return;
    }
    const importedPayload=JSON.parse(plain);
    const importedDb=importedPayload.data||importedPayload;
    if(typeof importedDb!=='object'||Array.isArray(importedDb)){
      showAlert('Respaldo no válido. Debe venir de esta misma app.');
      return;
    }
    const errorEsquema=validarEsquemaDb(importedDb);
    if(errorEsquema){
      showAlert('El respaldo en la nube no tiene un formato válido: '+errorEsquema);
      return;
    }
    sessionPIN=pin;
    if(!pinIsConfigured()) await pinSetupSave(pin);
    db=importedDb;
    Object.keys(db).forEach(function(k){ db[k]=migrateMonth(db[k]); });
    creditos=importedPayload.creditos||{};
    catMetodos=importedPayload.catMetodos||[];
    catTipos=importedPayload.catTipos||[];
    perfilTelefono=importedPayload.telefono||'';
    // Si el respaldo en la nube no traía un nombre guardado (p.ej. viene de antes de que
    // existiera el campo Perfil), se usa el de la cuenta de Google como respaldo — mismo
    // criterio que syncSignInGoogle(), nunca pisa uno que el respaldo sí traiga.
    perfilNombre=importedPayload.nombre||user.displayName||'';
    perfilQ2DiasFijos=!!importedPayload.q2DiasFijos;
    sessionDataKey=await generateDataKey();
    await wrapAndStoreDataKey(sessionDataKey, sessionPIN);
    const digitsRestored=perfilTelefono.replace(/\D/g,'');
    if(digitsRestored.length>=6){
      const recEnv=await buildDataKeyEnvelope(sessionDataKey, digitsRestored.slice(-6));
      localStorage.setItem('fin26_recovery', JSON.stringify(recEnv));
    } else {
      localStorage.removeItem('fin26_recovery');
    }
    migrarEstadoGastos();
    repararGastosHuerfanosDeGrupo();
    const keys=Object.keys(db).map(Number).sort(function(a,b){return a-b;});
    curM=keys.length?keys[keys.length-1]:0;
    curTab=0; homeQ=homeQParaMes(db[curM]); curNomQ=homeQ;
    localStorage.setItem('fin26_last_sync_at', String(Date.now()));
    await save();
    clearPinRecoveryBackup();
    appUnlocked=true; hideLockOverlay(); render();
    toast('Datos recuperados de la nube ✓');
  }catch(e){
    console.error('Error al recuperar el respaldo de la nube desde el bloqueo', e);
    showAlert('No se pudo recuperar el respaldo: '+e.message);
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
// Estado de la comparación contra la nube:
//  - 'pendiente': todavía no se sabe si la nube tiene algo más nuevo (arranque, o recién
//    desbloqueado/iniciada sesión) — ningún save() de arranque (ej. el de loadAppData()) puede
//    subir datos locales sin comparar antes. La subida no se pierde: queda en espera
//    (_subidaEnEspera) y sale apenas se resuelva la comparación (ver syncMarcarListo).
//  - 'listo': comparado; los saves normales suben solos.
//  - 'pausado': la nube tiene algo más nuevo que este dispositivo y todavía no lo has traído —
//    NO se sube nada automáticamente (pisaría lo que hiciste en el otro dispositivo) hasta que
//    importes ese respaldo o toques "Subir ahora" a propósito.
// Antes era un booleano que solo apagaba revisarSyncAlDesbloquear() desde el desbloqueo normal
// con PIN: entrar por cualquier otro camino (recuperar de la nube, primer PIN, restaurar archivo)
// lo dejaba en true toda la sesión y ningún cambio se subía jamás, sin ningún aviso.
let _syncEstado='pendiente';
let _subidaEnEspera=false;
let _avisoPausaMostrado=false;

function syncEnPausa(){ return _syncEstado==='pausado'; }

// Llamada también desde confirmImport (export-main.js): al reemplazar los datos locales con un
// respaldo, ya no hay nada más nuevo en la nube que proteger.
function syncMarcarListo(){
  _syncEstado='listo';
  _avisoPausaMostrado=false;
  if(_subidaEnEspera){ _subidaEnEspera=false; ejecutarAutoSubida(); }
}

function ejecutarAutoSubida(){
  if(!syncUsuarioActual()) return;
  if(!sessionPIN){ _subidaEnEspera=true; return; } // se bloqueó entre medio: sube al desbloquear
  construirYSubirBackup(sessionPIN).then(function(){
    toast('☁️ Sincronizado');
  }).catch(function(e){
    console.error('[sync] auto-subida falló', e);
    _subidaEnEspera=true; // reintenta con la próxima comparación/desbloqueo
    toast('⚠️ No se pudo sincronizar con la nube'+(navigator.onLine===false?' (sin conexión)':'')+'. Se reintentará.',5000);
  });
}

function programarAutoSyncSubida(){
  const user=syncUsuarioActual();
  if(!user) return; // sin sesión de Google no hay nada que subir
  clearTimeout(_autoSyncUploadTimer);
  _autoSyncUploadTimer=setTimeout(function(){
    if(_syncEstado==='pendiente'){ _subidaEnEspera=true; return; }
    if(_syncEstado==='pausado'){
      if(!_avisoPausaMostrado){
        _avisoPausaMostrado=true;
        toast('☁️ Sincronización en pausa: hay datos más nuevos en la nube. Revísalos en Mi perfil.',6000);
      }
      return;
    }
    ejecutarAutoSubida();
  }, 4000);
}

// Compara la nube contra lo último que este dispositivo subió/bajó y deja _syncEstado resuelto.
// Compartida entre el desbloqueo (revisarSyncAlDesbloquear) y el inicio de sesión con Google
// desde Mi perfil (syncSignInGoogle) — antes este último no revisaba ni subía nada, así que
// iniciar sesión en un segundo dispositivo no traía los datos del primero.
function revisarNubeParaUsuario(user){
  _syncEstado='pendiente';
  return firebase.firestore().collection('usuarios').doc(user.uid).get().then(function(snap){
    const data=snap.exists?snap.data():null;
    if(!data||!data.backup){
      // Nube vacía para esta cuenta: este dispositivo es la fuente, se sube de una vez.
      _subidaEnEspera=true;
      syncMarcarListo();
      return;
    }
    const remoteMs=(data.updatedAt&&data.updatedAt.toMillis)?data.updatedAt.toMillis():0;
    const localMs=parseInt(localStorage.getItem('fin26_last_sync_at')||'0');
    // Margen de 2s: evita que el propio reloj del servidor (unos ms distinto al de este
    // dispositivo) dispare el aviso sobre un backup que en realidad subió este mismo dispositivo.
    if(remoteMs<=localMs+2000){ syncMarcarListo(); return; }
    _syncEstado='pausado';
    _subidaEnEspera=false;
    const fecha=new Date(remoteMs).toLocaleString('es-CO',{dateStyle:'short',timeStyle:'short'});
    showConfirm('Hay un respaldo más reciente en la nube (subido el '+fecha+', probablemente desde otro dispositivo). ¿Quieres revisarlo? Mientras no lo traigas, los cambios de este dispositivo no se suben, para no borrar los del otro.',function(){
      procesarBackupParseado(data.backup,'Respaldo en la nube ('+(data.backup.fecha||'')+')');
    },{title:'Respaldo más reciente disponible', confirmLabel:'Revisar', cancelLabel:'Ahora no', danger:false});
  }).catch(function(e){
    // Sin red o error de Firestore: no se puede saber si la nube es más nueva, así que se
    // queda en 'pendiente' (las subidas esperan) y se reintenta en el próximo desbloqueo.
    console.error('[sync] no se pudo revisar la nube', e);
    toast('⚠️ No se pudo revisar la nube'+(navigator.onLine===false?' (sin conexión)':'')+'.',5000);
  });
}

// ── Automático: revisar al desbloquear si hay algo más nuevo en la nube ─────────────────
// Se llama desde hideLockOverlay() (auth.js), o sea en TODOS los caminos que desbloquean la
// app (PIN normal, primer PIN, recuperar de la nube, restaurar archivo, PIN anterior, número
// de recuperación) — antes solo desde el desbloqueo normal con PIN. No bloquea
// la app mientras responde — si Firebase tarda o falla, la app sigue funcionando normal, solo
// no se ofrece el aviso de "hay algo más nuevo".
//
// OJO: no se puede leer firebase.auth().currentUser directamente acá (síncrono) — el
// desbloqueo con PIN pasa casi apenas carga la página, y Firebase todavía no ha terminado de
// restaurar la sesión de Google guardada (currentUser da null unos instantes aunque SÍ sigas
// con sesión iniciada). onAuthStateChanged() es la forma correcta de esperar a que ese estado
// quede resuelto (con sesión o sin ella) antes de decidir si hay algo que revisar.
function revisarSyncAlDesbloquear(){
  if(typeof firebase==='undefined') return;
  const unsub=firebase.auth().onAuthStateChanged(function(user){
    unsub(); // solo interesa la primera resolución del estado, no quedarse escuchando cambios futuros acá
    if(!user) return; // sin sesión no se sube nada; syncSignInGoogle hará la revisión al iniciarla
    revisarNubeParaUsuario(user);
  });
}
