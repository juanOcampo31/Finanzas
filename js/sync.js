// ── Sincronización en la nube (Firebase) — PRUEBA INICIAL ──────────────────────────────
// Reutiliza EXACTAMENTE el mismo backup cifrado que ya produce exportJSON() (ver
// export-main.js): Firestore solo guarda el envelope {salt, iv, ct, ...} cifrado con el PIN
// (vía encryptString/decryptString, PBKDF2+AES-GCM) — nunca ve un solo dato en texto plano.
// El inicio de sesión con Google identifica DE QUIÉN es cada respaldo (evita que un desconocido
// lea/escriba el documento de otro usuario, ver reglas de Firestore), pero no participa en el
// cifrado: dos dispositivos con la misma cuenta de Google pero PIN distinto no pueden leerse el
// backup entre sí, y eso es intencional.
//
// Por ahora es manual ("Subir a la nube" / "Bajar de la nube" en el menú de Respaldo) — no se
// sube solo en cada save(). Es a propósito: primero se valida que el proceso funcione bien de
// punta a punta antes de automatizarlo.
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

// Construye el mismo envelope cifrado que exportJSON() (ver export-main.js) pero en vez de
// compartirlo/descargarlo como archivo, lo escribe en Firestore bajo el uid de Google actual.
async function subirBackupNube(){
  const user=syncUsuarioActual();
  if(!user){ toast('Inicia sesión con Google primero'); return; }
  const hoy=new Date().toISOString().slice(0,10);
  const payload=JSON.stringify({version:2,fecha:hoy,data:db,creditos:creditos,catMetodos:catMetodos,catTipos:catTipos,telefono:perfilTelefono});
  let pin=sessionPIN;
  if(!pin){
    pin=await promptPINModal('Confirma tu PIN para cifrar el respaldo en la nube');
    if(pin===null) return;
    if(!(await pinVerify(pin))){ showAlert('PIN incorrecto'); return; }
    sessionPIN=pin;
  }
  const envelope=await encryptString(payload,pin);
  const fileObj=Object.assign({encrypted:true, app:'FinanzasPersonales', version:2, fecha:hoy}, envelope);
  try{
    await firebase.firestore().collection('usuarios').doc(user.uid).set({
      backup: fileObj,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
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
