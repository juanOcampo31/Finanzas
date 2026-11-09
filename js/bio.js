// ── Desbloqueo con huella (passkey + extensión PRF de WebAuthn) ────────────────────────
// Los datos se cifran con la data key (ver auth.js), no con el PIN: el PIN solo la guarda bajo
// llave en fin26_datakey, igual que los 6 dígitos del celular en fin26_recovery. La huella es una
// TERCERA llave para esa misma data key, opcional y por dispositivo:
//
//  1. Activar (con la app ya desbloqueada): se crea una passkey en el celular con la extensión
//     PRF. Con la huella, esa passkey entrega un secreto de 32 bytes — siempre el mismo para la
//     misma passkey y el mismo prfSalt — que vive en el hardware de seguridad del teléfono y
//     nunca sale sin una huella válida.
//  2. De ese secreto se deriva (HKDF) una clave AES con la que se cifra {data key, PIN} y se
//     guarda en fin26_bio. El PIN va adentro porque la app lo sigue necesitando en memoria para
//     cifrar los respaldos (exportar JSON y la nube, ver encryptString); quien logre abrir esta
//     copia ya tiene la data key de todas formas, así que no se expone nada más.
//  3. Desbloquear: huella → mismo secreto → se abre fin26_bio → data key + PIN en memoria, sin
//     escribir nada.
//
// fin26_bio guarda además el salt actual del PIN y de la data key: si cualquiera de los dos
// cambia (cambio de PIN, recuperación por celular, restaurar desde la nube o desde un archivo —
// todos generan salts nuevos), la copia ya no corresponde y se descarta sola (bioVigente), sin
// tener que acordarse de invalidarla en cada uno de esos caminos.
const BIO_STORAGE_KEY='fin26_bio';
const BIO_HKDF_INFO='finanzas-bio-v1';
const BIO_NOMBRE_PASSKEY='Finanzas – desbloqueo';

function bioSoportado(){
  return !!(window.isSecureContext && window.PublicKeyCredential && navigator.credentials && navigator.credentials.create);
}
// Sensor biométrico disponible y, si el navegador sabe decirlo de antemano, soporte de PRF.
// Si no sabe decirlo (getClientCapabilities es reciente), se descubre al activar.
async function bioDisponibleEnDispositivo(){
  if(!bioSoportado()) return false;
  try{
    if(PublicKeyCredential.getClientCapabilities){
      const caps=await PublicKeyCredential.getClientCapabilities();
      if(caps && caps['extension:prf']===false) return false;
    }
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }catch(e){ return false; }
}

function bioLeer(){
  try{ const raw=localStorage.getItem(BIO_STORAGE_KEY); return raw?JSON.parse(raw):null; }
  catch(e){ return null; }
}
function bioMaterialActual(){
  let dkSalt=null;
  try{ const dk=localStorage.getItem('fin26_datakey'); dkSalt=dk?JSON.parse(dk).salt:null; }catch(e){}
  return {pinSalt:localStorage.getItem('fin26_pin_salt'), dkSalt:dkSalt};
}
function bioVigente(reg){
  const m=bioMaterialActual();
  return !!(reg && m.pinSalt && m.dkSalt && reg.pinSalt===m.pinSalt && reg.dkSalt===m.dkSalt);
}
// 'activo' | 'invalidado' (había una, pero el PIN o la data key cambiaron) | 'no'
function bioEstado(){
  const reg=bioLeer();
  if(!reg) return 'no';
  return bioVigente(reg)?'activo':'invalidado';
}

function b64urlDesdeB64(s){ return s.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
// Le avisa al administrador de contraseñas (Chrome 132+) que esa passkey ya no se usa, para que
// no se acumulen "Finanzas – desbloqueo" viejas cada vez que se reactiva. Si no está soportado,
// la passkey vieja queda ahí sin servir para nada (se puede borrar a mano).
function bioOlvidarPasskey(reg){
  try{
    if(reg && reg.credId && PublicKeyCredential.signalUnknownCredential){
      PublicKeyCredential.signalUnknownCredential({rpId:location.hostname, credentialId:b64urlDesdeB64(reg.credId)}).catch(function(){});
    }
  }catch(e){}
}
function bioDesactivar(){
  const reg=bioLeer();
  localStorage.removeItem(BIO_STORAGE_KEY);
  bioOlvidarPasskey(reg);
}

// Pide la huella y devuelve el secreto PRF (ArrayBuffer de 32 bytes) de esa passkey.
async function bioObtenerSecreto(credId, prfSalt){
  const cred=await navigator.credentials.get({publicKey:{
    challenge:crypto.getRandomValues(new Uint8Array(32)), // no hay servidor que lo verifique: solo se usa el PRF
    allowCredentials:[{type:'public-key', id:credId}],
    userVerification:'required',
    timeout:60000,
    extensions:{prf:{eval:{first:prfSalt}}}
  }});
  const prf=cred && cred.getClientExtensionResults().prf;
  if(!prf || !prf.results || !prf.results.first) throw new Error('Este navegador no entregó la llave de la huella (PRF).');
  return prf.results.first;
}
async function bioClaveDesdeSecreto(secret){
  const base=await crypto.subtle.importKey('raw', secret, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    {name:'HKDF', hash:'SHA-256', salt:new Uint8Array(32), info:new TextEncoder().encode(BIO_HKDF_INFO)},
    base, {name:'AES-GCM', length:256}, false, ['encrypt','decrypt']
  );
}

// ── Activar / desactivar (menú Seguridad) ───────────────────────────────────────────────
function bioBotonSeguridadHtml(){
  if(!bioSoportado()) return '';
  if(bioEstado()==='activo'){
    return '<button class="bcnl" onclick="bioConfirmarDesactivar()">'+btnIcon('fingerprint')+'Desactivar desbloqueo con huella</button>';
  }
  return '<button class="bcnl" onclick="bioActivar()">'+btnIcon('fingerprint')+'Activar desbloqueo con huella</button>';
}

// opts.desdeSugerencia: viene del modal de bioSugerirTrasPin — al terminar se cierra ese modal
// en vez de abrir el menú de Seguridad (que el usuario nunca abrió).
async function bioActivar(opts){
  const desdeSugerencia=!!(opts&&opts.desdeSugerencia);
  if(!sessionDataKey){ showAlert('No se puede activar en este momento. Cierra y vuelve a abrir la app, e inténtalo de nuevo.'); return; }
  let pin=sessionPIN;
  if(!pin){
    pin=await promptPINModal('Confirma tu PIN para activar la huella');
    if(pin===null) return;
    if(!(await pinVerify(pin))){ showAlert('PIN incorrecto'); return; }
    sessionPIN=pin;
  }
  if(!(await bioDisponibleEnDispositivo())){
    showAlert('Este dispositivo o navegador no permite desbloquear con huella. Revisa que tengas una huella registrada en el teléfono y Chrome actualizado.');
    return;
  }
  let cred=null;
  try{
    const prfSalt=crypto.getRandomValues(new Uint8Array(32));
    cred=await navigator.credentials.create({publicKey:{
      challenge:crypto.getRandomValues(new Uint8Array(32)),
      rp:{name:'Finanzas Personales'}, // id = dominio actual por defecto
      user:{id:crypto.getRandomValues(new Uint8Array(16)), name:BIO_NOMBRE_PASSKEY, displayName:BIO_NOMBRE_PASSKEY},
      pubKeyCredParams:[{type:'public-key', alg:-7},{type:'public-key', alg:-257}],
      authenticatorSelection:{authenticatorAttachment:'platform', userVerification:'required', residentKey:'preferred'},
      attestation:'none',
      timeout:60000,
      extensions:{prf:{eval:{first:prfSalt}}}
    }});
    const prf=cred.getClientExtensionResults().prf;
    let secret=prf && prf.results && prf.results.first;
    if(!secret && !(prf && prf.enabled)){
      bioOlvidarPasskey({credId:b64enc(cred.rawId)});
      showAlert('Tu navegador no soporta el desbloqueo con huella para apps web (falta la extensión PRF). Actualiza Chrome e inténtalo de nuevo.');
      return;
    }
    // Varios navegadores (Chrome Android incluido) solo confirman "PRF habilitado" al crear la
    // passkey y entregan el secreto recién al usarla: de ahí el segundo toque del sensor.
    if(!secret){
      toast('Pon el dedo una vez más para terminar',4000);
      secret=await bioObtenerSecreto(cred.rawId, prfSalt);
    }
    const clave=await bioClaveDesdeSecreto(secret);
    const rawDk=await crypto.subtle.exportKey('raw', sessionDataKey);
    const iv=crypto.getRandomValues(new Uint8Array(12));
    const pt=new TextEncoder().encode(JSON.stringify({k:b64enc(rawDk), p:pin}));
    const ct=await crypto.subtle.encrypt({name:'AES-GCM', iv:iv}, clave, pt);
    const m=bioMaterialActual();
    const anterior=bioLeer();
    localStorage.setItem(BIO_STORAGE_KEY, JSON.stringify({
      v:1, credId:b64enc(cred.rawId), prfSalt:b64enc(prfSalt), iv:b64enc(iv), ct:b64enc(ct),
      pinSalt:m.pinSalt, dkSalt:m.dkSalt
    }));
    if(anterior && anterior.credId!==b64enc(cred.rawId)) bioOlvidarPasskey(anterior);
    toast('Desbloqueo con huella activado ✓');
    if(desdeSugerencia) closeModal(); else openSeguridadMenu();
  }catch(e){
    if(cred) bioOlvidarPasskey({credId:b64enc(cred.rawId)}); // passkey creada pero sin terminar: no dejarla huérfana
    if(e && e.name==='NotAllowedError') return; // canceló o se venció el tiempo: no es un error
    console.error('[bio] no se pudo activar', e);
    showAlert('No se pudo activar la huella: '+(e&&e.message?e.message:e));
  }
}

function bioConfirmarDesactivar(){
  showConfirm('Vas a volver a entrar solo con tu PIN en este dispositivo.',function(){
    bioDesactivar();
    bioGuardarPrefSugerencia({nunca:true}); // la quitaste a propósito: no volver a ofrecerla sola
    toast('Desbloqueo con huella desactivado');
    openSeguridadMenu();
  },{title:'Desactivar huella', confirmLabel:'Desactivar'});
}

// ── Sugerencia después de entrar con el PIN ─────────────────────────────────────────────
// Sin esto, la huella solo se encontraba entrando a Seguridad. Ahora, al desbloquear con PIN en
// un dispositivo que la soporta y sin huella activa (o con una que se invalidó al cambiar el
// PIN), se ofrece activarla. "Ahora no" la pospone BIO_SUGERENCIA_ESPERA_MS; "No volver a
// preguntar" (o desactivarla a mano en Seguridad) la apaga para siempre en este dispositivo.
const BIO_SUGERENCIA_KEY='fin26_bio_sugerencia';
const BIO_SUGERENCIA_ESPERA_MS=7*24*60*60*1000;

function bioLeerPrefSugerencia(){
  try{ return JSON.parse(localStorage.getItem(BIO_SUGERENCIA_KEY)||'{}')||{}; }
  catch(e){ return {}; }
}
function bioGuardarPrefSugerencia(pref){
  try{ localStorage.setItem(BIO_SUGERENCIA_KEY, JSON.stringify(pref)); }catch(e){}
}

async function bioSugerirTrasPin(){
  const estado=bioEstado();
  if(estado==='activo') return;
  const pref=bioLeerPrefSugerencia();
  if(pref.nunca) return;
  if(pref.hasta && Date.now()<pref.hasta) return;
  if(!(await bioDisponibleEnDispositivo())) return;
  // Pequeña espera para no taparle la pantalla apenas entra, y para que el aviso de "respaldo
  // más reciente en la nube" (ver js/sync.js), que importa más, salga primero si aplica. Si ya
  // hay cualquier modal abierto, no se sugiere ahora — y como no se registra como "Ahora no",
  // vuelve a ofrecerse en el próximo desbloqueo con PIN.
  setTimeout(function(){
    if(!appUnlocked) return;
    const mbg=document.getElementById('mbg');
    if(mbg && mbg.classList.contains('open')) return;
    const texto=(estado==='invalidado')
      ?'La huella se desactivó porque cambiaste el PIN o restauraste tus datos. ¿La activas de nuevo?'
      :'La próxima vez puedes entrar con tu huella, sin escribir el PIN. El PIN sigue funcionando siempre como respaldo.';
    openModal('<div class="mtitle" style="display:flex;align-items:center;gap:8px">'+icon('fingerprint',20)+'Entrar con huella</div>'
      +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:16px">'+esc(texto)+'</p>'
      +'<div class="macts">'
      +'<button class="bcnl" onclick="bioPosponerSugerencia()">Ahora no</button>'
      +'<button class="bpri" onclick="bioActivar({desdeSugerencia:true})">Activar huella</button>'
      +'</div>'
      +'<button class="lock-link" style="color:var(--mut)" onclick="bioNoVolverASugerir()">No volver a preguntar</button>');
  }, 1500);
}
function bioPosponerSugerencia(){
  bioGuardarPrefSugerencia({hasta:Date.now()+BIO_SUGERENCIA_ESPERA_MS});
  closeModal();
}
function bioNoVolverASugerir(){
  bioGuardarPrefSugerencia({nunca:true});
  closeModal();
  toast('Puedes activarla cuando quieras en Seguridad',4000);
}

// ── Pantalla de bloqueo ─────────────────────────────────────────────────────────────────
let _bioEnCurso=false;
// El aviso de huella automático sale UNA vez por bloqueo: si se cancela, no vuelve a salir solo
// (queda el botón). Sin esto, un aviso del sistema que oculte la página por un instante dispara
// visibilitychange → showLockOverlay → otro aviso, en bucle.
let _bioAutoIntentado=false;
function bioAlDesbloquear(){ _bioAutoIntentado=false; }

function bioPrepararLock(mode){
  const btn=document.getElementById('lockBioBtn');
  if(!btn) return;
  const reg=bioLeer();
  const mostrar=mode!=='setup' && !!reg && bioSoportado();
  btn.style.display=mostrar?'flex':'none';
  if(!mostrar) return;
  if(!bioVigente(reg)){
    bioDesactivar();
    btn.style.display='none';
    document.getElementById('lockSub').textContent='Tu PIN o tus datos cambiaron: ingresa el PIN y vuelve a activar la huella en Seguridad.';
    return;
  }
  if(!_bioAutoIntentado && !_bioEnCurso && document.visibilityState==='visible'){
    _bioAutoIntentado=true;
    setTimeout(bioDesbloquear, 250); // deja que la pantalla de bloqueo termine de pintarse
  }
}

async function bioDesbloquear(){
  if(_bioEnCurso || appUnlocked || lockMode!=='unlock') return;
  const reg=bioLeer();
  if(!reg) return;
  if(!bioVigente(reg)){ bioPrepararLock('unlock'); return; }
  _bioEnCurso=true;
  const necesitaCargar=!sessionDataKey;
  lockSetBusy(true);
  try{
    const secret=await bioObtenerSecreto(b64dec(reg.credId), b64dec(reg.prfSalt));
    const clave=await bioClaveDesdeSecreto(secret);
    const pt=await crypto.subtle.decrypt({name:'AES-GCM', iv:new Uint8Array(b64dec(reg.iv))}, clave, b64dec(reg.ct));
    const datos=JSON.parse(new TextDecoder().decode(pt));
    // extractable:true — igual que unwrapDataKeyFromEnvelope, para poder reenvolverla después
    // (cambio de PIN, número de recuperación, reactivar la huella).
    sessionDataKey=await crypto.subtle.importKey('raw', b64dec(datos.k), 'AES-GCM', true, ['encrypt','decrypt']);
    sessionPIN=datos.p;
    lockInput=''; renderLockDots();
    await completarDesbloqueo(necesitaCargar);
  }catch(e){
    // Si falló algo DESPUÉS de desbloquear (p.ej. al dibujar), la app ya está abierta con la data
    // key buena: borrarla de memoria dejaría la app abierta sin poder guardar.
    if(appUnlocked){ console.error('[bio] error después de desbloquear', e); return; }
    if(necesitaCargar) sessionDataKey=null;
    sessionPIN=null;
    // NotAllowedError = canceló, se venció el tiempo o la huella no coincidió varias veces:
    // queda el teclado del PIN, sin mensaje de error.
    if(!(e && e.name==='NotAllowedError')){
      console.error('[bio] no se pudo desbloquear', e);
      showLockError('No se pudo usar la huella. Ingresa tu PIN.');
    }
  }finally{
    _bioEnCurso=false;
    lockSetBusy(false);
  }
}
