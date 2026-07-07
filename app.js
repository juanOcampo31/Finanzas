const FE   = new Set(["2026-01-01", "2026-01-12", "2026-03-23", "2026-04-02", "2026-04-03", "2026-05-01", "2026-05-18", "2026-06-08", "2026-06-15", "2026-06-29", "2026-07-20", "2026-08-07", "2026-08-17", "2026-10-12", "2026-11-02", "2026-11-16", "2026-12-08", "2026-12-25"]);
const INIT = {"0": {"nombre": "Enero", "año": 2026, "q1_gastos": [], "q2_gastos": [], "tarjeta": [], "tcInfo": {"fechaCorte": null, "fechaPago": null}, "nomina": {"basico_total": 5000000, "bonos_total": 500000, "basico_q1": 2500000, "basico_q2": 2500000, "bonos_q1": 250000, "bonos_q2": 250000, "ded_q1": [{"nombre": "Salud", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "Pensión", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "AporteFE", "porcentaje": 0.02, "valor_fijo": null}, {"nombre": "AhorroFE", "porcentaje": null, "valor_fijo": 167500}], "ded_q2": [{"nombre": "F. Solidaridad", "porcentaje": 0.01, "valor_fijo": null}, {"nombre": "Salud", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "Pensión", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "AporteFE", "porcentaje": 0.02, "valor_fijo": null}, {"nombre": "AhorroFE", "porcentaje": null, "valor_fijo": 167500}]}}, "1": {"nombre": "Febrero", "año": 2026, "q1_gastos": [], "q2_gastos": [], "tarjeta": [], "tcInfo": {"fechaCorte": null, "fechaPago": null}, "nomina": {"basico_total": 5000000, "bonos_total": 500000, "basico_q1": 2500000, "basico_q2": 2500000, "bonos_q1": 250000, "bonos_q2": 250000, "ded_q1": [{"nombre": "Salud", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "Pensión", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "AporteFE", "porcentaje": 0.02, "valor_fijo": null}, {"nombre": "AhorroFE", "porcentaje": null, "valor_fijo": 167500}], "ded_q2": [{"nombre": "F. Solidaridad", "porcentaje": 0.01, "valor_fijo": null}, {"nombre": "Salud", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "Pensión", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "AporteFE", "porcentaje": 0.02, "valor_fijo": null}, {"nombre": "AhorroFE", "porcentaje": null, "valor_fijo": 167500}]}}, "2": {"nombre": "Marzo", "año": 2026, "q1_gastos": [], "q2_gastos": [], "tarjeta": [], "tcInfo": {"fechaCorte": null, "fechaPago": null}, "nomina": {"basico_total": 5000000, "bonos_total": 500000, "basico_q1": 2500000, "basico_q2": 2500000, "bonos_q1": 250000, "bonos_q2": 250000, "ded_q1": [{"nombre": "Salud", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "Pensión", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "AporteFE", "porcentaje": 0.02, "valor_fijo": null}, {"nombre": "AhorroFE", "porcentaje": null, "valor_fijo": 167500}], "ded_q2": [{"nombre": "F. Solidaridad", "porcentaje": 0.01, "valor_fijo": null}, {"nombre": "Salud", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "Pensión", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "AporteFE", "porcentaje": 0.02, "valor_fijo": null}, {"nombre": "AhorroFE", "porcentaje": null, "valor_fijo": 167500}]}}, "3": {"nombre": "Abril", "año": 2026, "q1_gastos": [], "q2_gastos": [], "tarjeta": [], "tcInfo": {"fechaCorte": null, "fechaPago": null}, "nomina": {"basico_total": 5000000, "bonos_total": 500000, "basico_q1": 2500000, "basico_q2": 2500000, "bonos_q1": 250000, "bonos_q2": 250000, "ded_q1": [{"nombre": "Salud", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "Pensión", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "AporteFE", "porcentaje": 0.02, "valor_fijo": null}, {"nombre": "AhorroFE", "porcentaje": null, "valor_fijo": 167500}], "ded_q2": [{"nombre": "F. Solidaridad", "porcentaje": 0.01, "valor_fijo": null}, {"nombre": "Salud", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "Pensión", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "AporteFE", "porcentaje": 0.02, "valor_fijo": null}, {"nombre": "AhorroFE", "porcentaje": null, "valor_fijo": 167500}]}}, "4": {"nombre": "Mayo", "año": 2026, "q1_gastos": [], "q2_gastos": [], "tarjeta": [], "tcInfo": {"fechaCorte": null, "fechaPago": null}, "nomina": {"basico_total": 5000000, "bonos_total": 500000, "basico_q1": 2500000, "basico_q2": 2500000, "bonos_q1": 250000, "bonos_q2": 250000, "ded_q1": [{"nombre": "Salud", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "Pensión", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "AporteFE", "porcentaje": 0.02, "valor_fijo": null}, {"nombre": "AhorroFE", "porcentaje": null, "valor_fijo": 167500}], "ded_q2": [{"nombre": "F. Solidaridad", "porcentaje": 0.01, "valor_fijo": null}, {"nombre": "Salud", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "Pensión", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "AporteFE", "porcentaje": 0.02, "valor_fijo": null}, {"nombre": "AhorroFE", "porcentaje": null, "valor_fijo": 167500}]}}, "5": {"nombre": "Junio", "año": 2026, "q1_gastos": [], "q2_gastos": [], "tarjeta": [], "tcInfo": {"fechaCorte": null, "fechaPago": null}, "nomina": {"basico_total": 5000000, "bonos_total": 500000, "basico_q1": 2500000, "basico_q2": 2500000, "bonos_q1": 250000, "bonos_q2": 250000, "ded_q1": [{"nombre": "Salud", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "Pensión", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "AporteFE", "porcentaje": 0.02, "valor_fijo": null}, {"nombre": "AhorroFE", "porcentaje": null, "valor_fijo": 167500}], "ded_q2": [{"nombre": "F. Solidaridad", "porcentaje": 0.01, "valor_fijo": null}, {"nombre": "Salud", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "Pensión", "porcentaje": 0.04, "valor_fijo": null}, {"nombre": "AporteFE", "porcentaje": 0.02, "valor_fijo": null}, {"nombre": "AhorroFE", "porcentaje": null, "valor_fijo": 167500}]}}};

// ── Manejador de errores visible (diagnóstico) ─────────────────────────────────
// Si algo falla durante la carga (ej. una API no soportada por el navegador),
// en vez de quedar en silencio, se muestra un aviso en pantalla con el error real.
(function(){
  function showBootError(msg){
    try{
      var el=document.getElementById('boot-error');
      if(!el){
        el=document.createElement('div');
        el.id='boot-error';
        el.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:#F87171;color:#450a0a;font-size:12px;line-height:1.5;padding:10px 14px;font-family:monospace;white-space:pre-wrap;max-height:40vh;overflow-y:auto';
        document.body.appendChild(el);
      }
      el.textContent='⚠️ Error al cargar la app: '+msg+'\n\nToca para copiar y compartir este mensaje.';
      el.onclick=function(){
        if(navigator.clipboard) navigator.clipboard.writeText(msg).catch(function(){});
      };
    }catch(e){}
  }
  window.addEventListener('error', function(e){
    showBootError((e.message||'Error desconocido')+' — '+(e.filename||'')+':'+(e.lineno||''));
  });
  window.addEventListener('unhandledrejection', function(e){
    showBootError('Promesa rechazada: '+(e.reason&&e.reason.message?e.reason.message:e.reason));
  });
  if(!(window.crypto && window.crypto.subtle)){
    showBootError('Este navegador no soporta Web Crypto (crypto.subtle), necesario para el PIN y el cifrado de backups. Prueba con Chrome o Safari actualizados, fuera de un navegador integrado en otra app (Instagram/Facebook/etc).');
  }
})();

// ── SEGURIDAD: PIN, biometría (WebAuthn) y cifrado de backups (AES-GCM) ────────
let appUnlocked = false;   // controla si la UI está visible o tapada por el lock
let sessionPIN  = null;    // PIN en memoria durante la sesión (nunca se persiste)
let lockMode    = 'unlock';// 'unlock' | 'setup1' | 'setup2'
let lockInput   = '';
let lockFirstPin= '';

function b64enc(buf){ return btoa(String.fromCharCode.apply(null, new Uint8Array(buf))); }
function b64dec(str){ const bin=atob(str); const arr=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i); return arr.buffer; }

async function pbkdf2Key(pin, saltBuf, iterations){
  iterations = iterations || 200000;
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    {name:'PBKDF2', salt:saltBuf, iterations:iterations, hash:'SHA-256'},
    baseKey, {name:'AES-GCM', length:256}, false, ['encrypt','decrypt']
  );
}

// Calcula el material de verificación del PIN (cifra un valor conocido) SIN escribirlo
// todavía a localStorage — permite completar todo el trabajo async/criptográfico que
// puede fallar antes de comprometernos a persistir nada (ver confirmChangePIN).
async function buildPinCheckMaterial(pin){
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12));
  const key  = await pbkdf2Key(pin, salt);
  const ct   = await crypto.subtle.encrypt({name:'AES-GCM', iv:iv}, key, new TextEncoder().encode('FINANZAS_OK'));
  return {salt:b64enc(salt), iv:b64enc(iv), ct:b64enc(ct)};
}
// Guarda el PIN cifrando un valor conocido; así verificamos sin persistir el PIN.
async function pinSetupSave(pin){
  const m = await buildPinCheckMaterial(pin);
  localStorage.setItem('fin26_pin_salt', m.salt);
  localStorage.setItem('fin26_pin_check_iv', m.iv);
  localStorage.setItem('fin26_pin_check_ct', m.ct);
}
function pinIsConfigured(){ return !!localStorage.getItem('fin26_pin_salt'); }
async function pinVerify(pin){
  try{
    const salt = new Uint8Array(b64dec(localStorage.getItem('fin26_pin_salt')));
    const iv   = new Uint8Array(b64dec(localStorage.getItem('fin26_pin_check_iv')));
    const ct   = b64dec(localStorage.getItem('fin26_pin_check_ct'));
    const key  = await pbkdf2Key(pin, salt);
    const pt   = await crypto.subtle.decrypt({name:'AES-GCM', iv:iv}, key, ct);
    return new TextDecoder().decode(pt) === 'FINANZAS_OK';
  }catch(e){ return false; }
}

// Cifrado/descifrado de texto (usado para los backups exportados) — usa el PIN directamente
async function encryptString(plaintext, pin){
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12));
  const key  = await pbkdf2Key(pin, salt);
  const ct   = await crypto.subtle.encrypt({name:'AES-GCM', iv:iv}, key, new TextEncoder().encode(plaintext));
  return {salt:b64enc(salt), iv:b64enc(iv), ct:b64enc(ct), iterations:200000, alg:'PBKDF2-SHA256+AES-GCM-256'};
}
async function decryptString(envelope, pin){
  const salt = new Uint8Array(b64dec(envelope.salt));
  const iv   = new Uint8Array(b64dec(envelope.iv));
  const ct   = b64dec(envelope.ct);
  const key  = await pbkdf2Key(pin, salt, envelope.iterations);
  const pt   = await crypto.subtle.decrypt({name:'AES-GCM', iv:iv}, key, ct);
  return new TextDecoder().decode(pt);
}

// ── UI de la pantalla de bloqueo ────────────────────────────────────────────
function buildKeypadHTML(){
  const keys=['1','2','3','4','5','6','7','8','9','','0','⌫'];
  const bsIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9l-7-8 7-8z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>';
  let h='<div class="lock-keys">';
  keys.forEach(function(k){
    if(k==='⌫') h+='<button class="lock-key" onclick="lockPinBackspace()" aria-label="Borrar dígito">'+bsIcon+'</button>';
    else if(k==='') h+='<div></div>';
    else h+='<button class="lock-key" onclick="lockPinPress(\''+k+'\')">'+k+'</button>';
  });
  h+='</div><button class="lock-confirm" onclick="lockPinConfirm()">Confirmar</button>';
  return h;
}
function renderLockDots(){
  let dots='';
  for(let i=0;i<6;i++){
    dots+='<span class="lock-dot'+(i<lockInput.length?' filled':'')+'"></span>';
  }
  document.getElementById('lockDots').innerHTML=dots;
}
function showLockError(msg){
  const el=document.getElementById('lockError');
  el.textContent=msg;
  const box=document.querySelector('.lock-card');
  box.classList.remove('lock-shake'); void box.offsetWidth; box.classList.add('lock-shake');
}
async function showLockOverlay(mode){
  lockMode = (mode==='setup')?'setup1':'unlock';
  lockInput=''; lockFirstPin='';
  const appEl=document.getElementById('app');
  if(appEl) appEl.style.display='none';
  document.body.style.overflow='auto';
  document.getElementById('lockOverlay').classList.remove('hidden');
  document.getElementById('lockTitle').textContent = (mode==='setup')?'Crea tu PIN':'Ingresa tu PIN';
  document.getElementById('lockSub').textContent = (mode==='setup')?'Protege tu información financiera (4 a 6 dígitos). También se usará para cifrar tus copias de seguridad.':'';
  document.getElementById('lockError').textContent='';
  document.getElementById('lockKeypad').innerHTML = buildKeypadHTML();
  renderLockDots();
  // El enlace de recuperación solo aplica cuando ya hay datos protegidos por desbloquear
  // (no durante la configuración inicial de un PIN nuevo, cuando todavía no hay nada que recuperar).
  document.getElementById('lockRecoveryLink').style.display = (mode!=='setup') ? 'block' : 'none';
}
function hideLockOverlay(){
  document.getElementById('lockOverlay').classList.add('hidden');
  const appEl=document.getElementById('app');
  if(appEl) appEl.style.display='flex';
  document.body.style.overflow='hidden';
}

function lockPinPress(d){
  if(lockInput.length>=6) return;
  lockInput+=d;
  renderLockDots();
  document.getElementById('lockError').textContent='';
  if(lockInput.length===6) setTimeout(lockPinConfirm,150);
}
function lockPinBackspace(){ lockInput=lockInput.slice(0,-1); renderLockDots(); }

async function lockPinConfirm(){
  if(lockInput.length<4){ showLockError('Mínimo 4 dígitos'); return; }
  if(lockMode==='unlock'){
    const ok = await pinVerify(lockInput);
    if(ok){
      const pin=lockInput; sessionPIN=pin; lockInput='';
      try{
        if(!sessionDataKey){ await ensureDataKey(pin); await loadAppData(); }
        clearPinRecoveryBackup(); // el material actual funciona de punta a punta: ya no hace falta el respaldo
        appUnlocked=true; hideLockOverlay(); render();
      }catch(e){
        // Nota: mantenemos sessionPIN (el PIN correcto y ya verificado) en memoria — las
        // opciones de recuperación de abajo lo necesitan para re-envolver la data key una
        // vez restaurado el acceso. No se persiste en ningún momento, solo vive en RAM.
        sessionDataKey=null;
        showLockError('No se pudieron descifrar tus datos. Intenta de nuevo.');
        document.getElementById('lockRecoveryLink').style.display='block';
      }
    } else {
      showLockError('PIN incorrecto'); lockInput=''; renderLockDots();
    }
  } else if(lockMode==='setup1'){
    lockFirstPin=lockInput; lockInput=''; lockMode='setup2';
    document.getElementById('lockTitle').textContent='Confirma tu PIN';
    renderLockDots();
  } else if(lockMode==='setup2'){
    if(lockInput!==lockFirstPin){
      showLockError('Los PIN no coinciden, intenta de nuevo');
      lockInput=''; lockFirstPin=''; lockMode='setup1';
      document.getElementById('lockTitle').textContent='Crea tu PIN';
      renderLockDots(); return;
    }
    await pinSetupSave(lockInput);
    sessionPIN=lockInput; lockInput='';
    await ensureDataKey(sessionPIN);
    await loadAppData();
    appUnlocked=true; hideLockOverlay(); render(); toast('PIN configurado ✓');
  }
}

// Modal genérico para pedir el PIN puntualmente (ej: exportar o importar backups)
function promptPINModal(message){
  return new Promise(function(resolve){
    openModal('<div class="mtitle">'+message+'</div>'
      +'<div class="field"><label>PIN</label><input id="ppm-pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="••••"></div>'
      +'<div class="macts">'
      +'<button class="bcnl" onclick="window._ppmResolve(null)">Cancelar</button>'
      +'<button class="bpri" onclick="window._ppmResolve(document.getElementById(\'ppm-pin\').value.trim())">Confirmar</button>'
      +'</div>');
    window._ppmResolve=function(val){ closeModal(); resolve(val); };
    setTimeout(function(){ const el=document.getElementById('ppm-pin'); if(el) el.focus(); },100);
  });
}

// ── Recuperación de datos desde la pantalla de bloqueo ─────────────────────────
// Se ofrece cuando el PIN es correcto pero los datos guardados no se pueden descifrar
// (p.ej. un cambio de PIN anterior quedó a medias), o simplemente si el usuario no recuerda
// cómo desbloquear y prefiere restaurar desde un backup o empezar de nuevo.
function showRecoveryOptions(){
  const hasDataKey = !!localStorage.getItem('fin26_datakey') || !!localStorage.getItem('fin26_datakey_prev');
  const hasRecoveryPhone = !!localStorage.getItem('fin26_recovery');
  openModal('<div class="mtitle">Recuperar acceso</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:14px">'
    +'Si tu PIN no descifra tus datos guardados (por ejemplo, porque un cambio de PIN anterior '
    +'quedó a medias), elige una opción:</p>'
    +'<div style="display:flex;flex-direction:column;gap:10px">'
    +(hasRecoveryPhone?'<button class="bcnl" onclick="closeModal();recoverWithPhone()">📱 Recuperar con mi número de celular</button>':'')
    +(hasDataKey?'<button class="bcnl" onclick="closeModal();recoverWithPreviousPin()">↩️ Intentar con mi PIN anterior</button>':'')
    +'<button class="bcnl" onclick="closeModal();document.getElementById(\'lock-imp-file\').click()">📥 Restaurar desde un backup exportado (.json)</button>'
    +'<button class="bcnl" style="color:var(--red)" onclick="closeModal();confirmWipeAll()">🗑️ Borrar todo y empezar de nuevo</button>'
    +'</div>'
    +'<div class="macts" style="margin-top:14px"><button class="bcnl" style="grid-column:1/-1" onclick="closeModal()">Cancelar</button></div>');
}
// Recupera el acceso con los últimos 6 dígitos del número de celular registrado en Seguridad
// (fin26_recovery envuelve la MISMA data key que fin26_datakey, solo que con esta clave alterna).
// Al recuperar así se fuerza de inmediato la creación de un PIN nuevo — el PIN anterior se da
// por perdido/no confiable, por eso existe esta vía de recuperación.
async function recoverWithPhone(){
  const raw=localStorage.getItem('fin26_recovery');
  if(!raw){ showAlert('No hay un número de recuperación configurado en este dispositivo.'); return; }
  const code=await promptPINModal('Ingresa los últimos 6 dígitos de tu número de celular registrado');
  if(code===null) return;
  try{
    const dataKey=await unwrapDataKeyFromEnvelope(JSON.parse(raw), code);
    sessionDataKey=dataKey;
    promptNewPinAfterRecovery();
  }catch(e){
    sessionDataKey=null;
    showAlert('Esos dígitos no coinciden con tu número de recuperación registrado.');
  }
}
function promptNewPinAfterRecovery(){
  openModal('<div class="mtitle">Crea un PIN nuevo</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:14px">Recuperaste el acceso con tu número de celular. Por seguridad, define un PIN nuevo para seguir usando la app.</p>'
    +'<div class="field"><label>PIN nuevo (4-6 dígitos)</label><input id="rp-new1" type="password" inputmode="numeric" maxlength="6" placeholder="••••"></div>'
    +'<div class="field"><label>Confirma el PIN nuevo</label><input id="rp-new2" type="password" inputmode="numeric" maxlength="6" placeholder="••••"></div>'
    +'<div class="macts"><button class="bpri" style="grid-column:1/-1" onclick="confirmRecoveryNewPin()">Guardar y continuar</button></div>');
}
async function confirmRecoveryNewPin(){
  const n1=document.getElementById('rp-new1').value.trim();
  const n2=document.getElementById('rp-new2').value.trim();
  if(n1.length<4||n1.length>6){ showAlert('El PIN debe tener entre 4 y 6 dígitos'); return; }
  if(n1!==n2){ showAlert('Los PIN no coinciden'); return; }
  if(!sessionDataKey){ showAlert('Ocurrió un error inesperado. Vuelve a intentar la recuperación.'); return; }
  try{
    await commitNewPin(n1);
    await loadAppData();
    clearPinRecoveryBackup();
    closeModal();
    appUnlocked=true; hideLockOverlay(); render();
    toast('PIN actualizado. Acceso recuperado ✓');
  }catch(e){
    console.error('Error definiendo el PIN tras recuperación por celular', e);
    showAlert('No se pudo guardar el PIN nuevo. Intenta de nuevo.');
  }
}
// Intenta recuperar el acceso desenvolviendo la data key con el PIN que el usuario tenía antes
// de cambiarlo. Lo prueba contra DOS lugares posibles, porque puede tratarse de dos incidentes
// distintos:
//  1) fin26_datakey_prev — el respaldo que confirmChangePIN guarda automáticamente ANTES de
//     reescribir nada (protege cambios de PIN hechos con esta versión de la app).
//  2) fin26_datakey (el actual) — si el cambio de PIN se interrumpió de la forma antigua (antes
//     de este arreglo), el "check" del PIN ya había quedado en el PIN nuevo pero la data key
//     seguía envuelta con el PIN viejo, sin haberse respaldado en ningún lado.
// Si alguno funciona, re-envuelve esa misma data key bajo el PIN actual y así queda consistente,
// sin perder ni un dato.
async function recoverWithPreviousPin(){
  // Para re-envolver la data key hace falta saber cuál es el PIN ACTUAL (el que ya quedó
  // guardado como válido en fin26_pin_salt/check). Si todavía no se verificó en esta sesión
  // (p.ej. se entró directo por el enlace sin intentar desbloquear antes), se pide aquí.
  if(!sessionPIN){
    const cur=await promptPINModal('Primero, ingresa tu PIN actual (el más reciente)');
    if(cur===null) return;
    if(!(await pinVerify(cur))){ showAlert('Ese no es tu PIN actual.'); return; }
    sessionPIN=cur;
  }
  const pin=await promptPINModal('Ahora ingresa el PIN que usabas ANTES de cambiarlo');
  if(pin===null) return;
  const candidates=[localStorage.getItem('fin26_datakey_prev'), localStorage.getItem('fin26_datakey')].filter(Boolean);
  for(const raw of candidates){
    try{
      const dataKey=await unwrapDataKeyFromEnvelope(JSON.parse(raw), pin);
      sessionDataKey=dataKey;
      await wrapAndStoreDataKey(sessionDataKey, sessionPIN);
      await loadAppData();
      clearPinRecoveryBackup();
      appUnlocked=true; hideLockOverlay(); render();
      toast('Acceso recuperado con tu PIN anterior ✓');
      return;
    }catch(e){ /* prueba el siguiente candidato */ }
  }
  sessionDataKey=null;
  showAlert('Ese PIN anterior tampoco pudo descifrar tus datos.');
}
// Restaura los datos desde un backup JSON exportado, disponible incluso con la app bloqueada.
// Genera una data key nueva envuelta bajo el PIN con el que se desbloqueó la pantalla (sessionPIN),
// así se recupera el acceso sin depender del PIN con el que se exportó el backup.
function lockImportBackup(input){
  const file=input.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=async function(e){
    try{
      const parsed=JSON.parse(e.target.result);
      let importedPayload;
      if(parsed.encrypted){
        const pin=await promptPINModal('Ingresa el PIN con el que exportaste este backup');
        if(pin===null){ input.value=''; return; }
        let plain;
        try{ plain=await decryptString(parsed,pin); }
        catch(err){ showAlert('PIN incorrecto o archivo dañado. No se pudo descifrar el backup.'); input.value=''; return; }
        importedPayload=JSON.parse(plain);
      } else {
        importedPayload=parsed; // compatibilidad con backups antiguos sin cifrar
      }
      const importedDb=importedPayload.data||importedPayload;
      if(typeof importedDb!=='object'||Array.isArray(importedDb)){
        showAlert('Archivo no válido. Debe ser un backup exportado desde esta app.'); input.value=''; return;
      }
      if(!sessionPIN){
        const pin=await promptPINModal('Ingresa (o crea) el PIN con el que quieres proteger la app de ahora en adelante');
        if(pin===null){ input.value=''; return; }
        sessionPIN=pin;
        await pinSetupSave(pin);
      }
      db=importedDb;
      Object.keys(db).forEach(function(k){ db[k]=migrateMonth(db[k]); });
      creditos=importedPayload.creditos||{};
      catMetodos=importedPayload.catMetodos||[];
      catTipos=importedPayload.catTipos||[];
      perfilTelefono=importedPayload.telefono||'';
      // Esta ruta genera una data key COMPLETAMENTE NUEVA (la anterior se da por perdida), así
      // que cualquier número de recuperación configurado con la data key vieja ya no sirve.
      // Si el backup traía un teléfono, se reconstruye el envelope de recuperación bajo la
      // nueva data key; si no, se elimina el que hubiera quedado huérfano.
      sessionDataKey=await generateDataKey();
      await wrapAndStoreDataKey(sessionDataKey, sessionPIN);
      const digitsRestored=perfilTelefono.replace(/\D/g,'');
      if(digitsRestored.length>=6){
        const recEnv=await buildDataKeyEnvelope(sessionDataKey, digitsRestored.slice(-6));
        localStorage.setItem('fin26_recovery', JSON.stringify(recEnv));
      } else {
        localStorage.removeItem('fin26_recovery');
      }
      await save();
      clearPinRecoveryBackup();
      appUnlocked=true; hideLockOverlay(); render();
      toast('Datos restaurados desde backup ✓');
    }catch(err){
      showAlert('Error al leer el archivo: '+err.message);
    }
    input.value='';
  };
  reader.readAsText(file);
}
// Último recurso: borra todo (PIN, data key y datos financieros) y vuelve a la pantalla de
// creación de PIN. Requiere escribir una palabra de confirmación para evitar borrados accidentales.
function confirmWipeAll(){
  openModal('<div class="mtitle" style="color:var(--red)">Borrar todos los datos</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:14px">'
    +'Esto borra permanentemente tu PIN y todos tus datos financieros guardados en este dispositivo. '
    +'<b style="color:var(--txt)">No se puede deshacer.</b> Si tienes un backup exportado (.json), usa mejor la opción de restaurar.</p>'
    +'<div class="field"><label>Escribe BORRAR para confirmar</label><input id="wipe-confirm" type="text" placeholder="BORRAR"></div>'
    +'<div class="macts"><button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" style="background:var(--red);color:#fff" onclick="executeWipeAll()">Borrar todo</button></div>');
}
function executeWipeAll(){
  const v=(document.getElementById('wipe-confirm').value||'').trim().toUpperCase();
  if(v!=='BORRAR'){ showAlert('Escribe BORRAR para confirmar.'); return; }
  ['fin26_pin_salt','fin26_pin_check_iv','fin26_pin_check_ct',
   'fin26_pin_salt_prev','fin26_pin_check_iv_prev','fin26_pin_check_ct_prev',
   'fin26_datakey','fin26_datakey_prev','fin26_recovery','fin26_enc','fin26_webauthn_id',
   'fin26','fin26_creditos','fin26_cat_metodos','fin26_cat_tipos','fin26_cat_categorias','fin26m'
  ].forEach(function(k){ localStorage.removeItem(k); });
  location.reload();
}

// Vuelve a bloquear la app al pasar a segundo plano; al volver, exige el PIN de nuevo.
document.addEventListener('visibilitychange', function(){
  if(document.hidden){
    if(appUnlocked) appUnlocked=false;
  } else if(!appUnlocked && pinIsConfigured()){
    showLockOverlay('unlock');
  }
});

function initApp(){
  if(pinIsConfigured()) showLockOverlay('unlock');
  else showLockOverlay('setup');
}

// ── Menú de seguridad (cambiar PIN / número de recuperación / bloquear ahora) ──
function openSecurityMenu(){
  const hasRecoveryPhone = !!localStorage.getItem('fin26_recovery');
  openModal('<div class="mtitle">Seguridad</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:14px">Tu PIN protege el acceso a la app y cifra tus copias de seguridad exportadas.</p>'
    +'<div style="display:flex;flex-direction:column;gap:10px">'
    +'<button class="bcnl" onclick="closeModal();startChangePIN()">🔑 Cambiar PIN</button>'
    +'<button class="bcnl" onclick="closeModal();startSetRecoveryPhone()">📱 '+(hasRecoveryPhone?'Editar':'Configurar')+' número de recuperación</button>'
    +'<button class="bcnl" style="color:var(--red)" onclick="lockNow()">🔒 Bloquear ahora</button>'
    +'</div>'
    +'<div class="macts" style="margin-top:14px"><button class="bcnl" style="grid-column:1/-1" onclick="closeModal()">Cerrar</button></div>');
}
function startChangePIN(){
  openModal('<div class="mtitle">Cambiar PIN</div>'
    +'<div class="field"><label>PIN actual</label><input id="cp-old" type="password" inputmode="numeric" maxlength="6" placeholder="••••"></div>'
    +'<div class="field"><label>Nuevo PIN (4-6 dígitos)</label><input id="cp-new1" type="password" inputmode="numeric" maxlength="6" placeholder="••••"></div>'
    +'<div class="field"><label>Confirma nuevo PIN</label><input id="cp-new2" type="password" inputmode="numeric" maxlength="6" placeholder="••••"></div>'
    +'<p style="font-size:11px;color:var(--amb);margin-bottom:8px">Los backups ya exportados quedaron cifrados con tu PIN anterior; necesitarás ese PIN anterior para restaurarlos.</p>'
    +'<div class="macts"><button class="bcnl" onclick="closeModal()">Cancelar</button><button class="bpri" onclick="confirmChangePIN()">Guardar</button></div>');
}
// Claves de localStorage que forman el "material de PIN" (verificación + data key envuelta).
const PIN_MATERIAL_KEYS = ['fin26_pin_salt','fin26_pin_check_iv','fin26_pin_check_ct','fin26_datakey'];
// Copia el material de PIN actual a claves "_prev" antes de sobrescribirlo, para poder
// ofrecer "recuperar con mi PIN anterior" desde la pantalla de bloqueo si algo sale mal.
function backupPinMaterialForRecovery(){
  PIN_MATERIAL_KEYS.forEach(function(k){
    const v = localStorage.getItem(k);
    if(v!==null) localStorage.setItem(k+'_prev', v); else localStorage.removeItem(k+'_prev');
  });
}
function clearPinRecoveryBackup(){
  PIN_MATERIAL_KEYS.forEach(function(k){ localStorage.removeItem(k+'_prev'); });
}
// Calcula, verifica y persiste de forma segura un PIN nuevo para la data key ya cargada en
// sessionDataKey. Usado tanto por "Cambiar PIN" como por la recuperación con número de celular.
// Lanza si algo falla — en ese caso no se modificó ninguna clave en localStorage.
async function commitNewPin(newPin){
  // 1) Todo el trabajo async/criptográfico —lo único que puede fallar— se hace ANTES de
  //    tocar localStorage, calculando los nuevos envelopes sin persistir nada todavía.
  const newDataKeyEnv = await buildDataKeyEnvelope(sessionDataKey, newPin);
  const newPinCheck   = await buildPinCheckMaterial(newPin);
  // 2) Verificación cruzada: confirmamos que el envelope nuevo realmente se desenvuelve
  //    con newPin antes de comprometernos a guardarlo (nunca guardar un estado que ya sabemos roto).
  await unwrapDataKeyFromEnvelope(newDataKeyEnv, newPin);
  // 3) Respaldamos el material anterior para poder recuperarlo desde la pantalla de bloqueo
  //    si el paso 4 se interrumpe a medias (cierre de la app, sistema operativo, etc).
  backupPinMaterialForRecovery();
  // 4) Escribimos todo junto, sin ningún await entre medio, para minimizar al máximo la
  //    ventana en la que localStorage puede quedar a medio actualizar — la causa raíz del
  //    bug original (el check del PIN y la data key se guardaban en dos pasos separados).
  localStorage.setItem('fin26_datakey', JSON.stringify(newDataKeyEnv));
  localStorage.setItem('fin26_pin_salt', newPinCheck.salt);
  localStorage.setItem('fin26_pin_check_iv', newPinCheck.iv);
  localStorage.setItem('fin26_pin_check_ct', newPinCheck.ct);
  sessionPIN=newPin;
}
async function confirmChangePIN(){
  const oldPin=document.getElementById('cp-old').value.trim();
  const n1=document.getElementById('cp-new1').value.trim();
  const n2=document.getElementById('cp-new2').value.trim();
  if(!(await pinVerify(oldPin))){ showAlert('PIN actual incorrecto'); return; }
  if(n1.length<4||n1.length>6){ showAlert('El nuevo PIN debe tener entre 4 y 6 dígitos'); return; }
  if(n1!==n2){ showAlert('Los PIN nuevos no coinciden'); return; }
  if(!sessionDataKey){ showAlert('No se puede cambiar el PIN en este momento. Cierra y vuelve a abrir la app, e inténtalo de nuevo.'); return; }
  try{
    await commitNewPin(n1);
    closeModal();
    toast('PIN actualizado ✓');
  }catch(e){
    console.error('Error cambiando PIN — no se modificó ninguna información', e);
    showAlert('No se pudo cambiar el PIN de forma segura. No se modificó tu información; intenta de nuevo.');
  }
}

// ── Número de recuperación (últimos 6 dígitos del celular) ────────────────────
// Además del PIN, la data key también puede envolverse bajo una clave derivada de los
// últimos 6 dígitos de un número de celular que el usuario define aquí. Sirve como respaldo
// permanente: si el PIN queda inservible (p.ej. por un cambio de PIN fallido), esos 6 dígitos
// permiten recuperar el acceso desde la pantalla de bloqueo y de inmediato definir un PIN nuevo.
// El número se guarda cifrado junto al resto de los datos (perfilTelefono, dentro de fin26_enc);
// nunca se guarda en texto plano en localStorage.
function startSetRecoveryPhone(){
  openModal('<div class="mtitle">Número de recuperación</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:14px">'
    +'Si alguna vez tu PIN no logra descifrar tus datos (por ejemplo, tras un cambio de PIN que falló), '
    +'podrás recuperar el acceso ingresando los <b style="color:var(--txt)">últimos 6 dígitos</b> de este número, '
    +'y de inmediato se te pedirá definir un PIN nuevo. '
    +'<b style="color:var(--amb)">Cualquiera que conozca estos 6 dígitos podrá recuperar el acceso a tus datos</b>, así que elige un número que solo tú sepas de memoria.</p>'
    +'<div class="field"><label>Número de celular</label><input id="rp-phone" type="tel" inputmode="numeric" maxlength="15" placeholder="Ej: 3001234567" value="'+(perfilTelefono||'').replace(/"/g,'&quot;')+'"></div>'
    +(perfilTelefono?'<button class="bcnl" style="width:100%;color:var(--red);margin-bottom:10px" onclick="removeRecoveryPhone()">🗑️ Quitar número de recuperación</button>':'')
    +'<div class="macts"><button class="bcnl" onclick="closeModal()">Cancelar</button><button class="bpri" onclick="confirmSetRecoveryPhone()">Guardar</button></div>');
}
async function confirmSetRecoveryPhone(){
  const raw=(document.getElementById('rp-phone').value||'').trim();
  const digits=raw.replace(/\D/g,'');
  if(digits.length<6){ showAlert('Ingresa un número de celular válido (al menos 6 dígitos).'); return; }
  if(!sessionDataKey){ showAlert('No se puede configurar en este momento. Intenta de nuevo.'); return; }
  const code=digits.slice(-6);
  try{
    // Igual que con el PIN: se calcula y verifica el envelope ANTES de persistir nada.
    const env=await buildDataKeyEnvelope(sessionDataKey, code);
    await unwrapDataKeyFromEnvelope(env, code);
    localStorage.setItem('fin26_recovery', JSON.stringify(env));
    perfilTelefono=raw;
    await save();
    closeModal();
    toast('Número de recuperación guardado ✓');
  }catch(e){
    console.error('Error guardando número de recuperación', e);
    showAlert('No se pudo guardar el número de recuperación. Intenta de nuevo.');
  }
}
function removeRecoveryPhone(){
  localStorage.removeItem('fin26_recovery');
  perfilTelefono='';
  save();
  closeModal();
  toast('Número de recuperación eliminado');
}

function lockNow(){
  closeModal();
  appUnlocked=false; sessionPIN=null;
  showLockOverlay('unlock');
}

// ── Migración automática de estructura antigua ────────────────────────────────
function migrateMonth(m) {
  if (!m.nomina) {
    const q1 = m.nom_q1 || {}, q2 = m.nom_q2 || {};
    const bt  = (q1.basico || 0) + (q2.basico || 0);
    const bon = q1.bonos || 0;
    m.nomina = {
      basico_total: bt, bonos_total: bon,
      basico_q1: q1.basico || Math.round(bt/2),
      basico_q2: q2.basico || Math.round(bt/2),
      bonos_q1: Math.round(bon/2), bonos_q2: Math.round(bon/2),
      ded_q1: (q1.deducciones || []).map(d=>({nombre:d.nombre||'',porcentaje:d.porcentaje||null,valor_fijo:d.valor_fijo||null})),
      ded_q2: (q2.deducciones || []).map(d=>({nombre:d.nombre||'',porcentaje:d.porcentaje||null,valor_fijo:d.valor_fijo||null})),
    };
    delete m.nom_q1; delete m.nom_q2;
  }
  const nom = m.nomina;
  if (!nom.basico_total)  nom.basico_total  = 0;
  if (!nom.bonos_total)   nom.bonos_total   = 0;
  if (nom.basico_q1 == null) nom.basico_q1  = Math.round(nom.basico_total/2);
  if (nom.basico_q2 == null) nom.basico_q2  = Math.round(nom.basico_total/2);
  if (nom.bonos_q1  == null) nom.bonos_q1   = Math.round(nom.bonos_total/2);
  if (nom.bonos_q2  == null) nom.bonos_q2   = Math.round(nom.bonos_total/2);
  if (!Array.isArray(nom.ded_q1)) nom.ded_q1 = [];
  if (!Array.isArray(nom.ded_q2)) nom.ded_q2 = [];
  if (!Array.isArray(m.q1_gastos)) m.q1_gastos = [];
  if (!Array.isArray(m.q2_gastos)) m.q2_gastos = [];

  // ── Migración a múltiples tarjetas ────────────────────────────────────────
  if (!m.tarjetas) {
    m.tarjetas = {};
    // Migrar tarjeta única legacy a "tc1"
    const legacyTc = Array.isArray(m.tarjeta) ? m.tarjeta : [];
    const legacyInfo = m.tcInfo || {fechaCorte:null, fechaPago:null, cupo:null};
    m.tarjetas['tc1'] = {
      id: 'tc1',
      nombre: 'Tarjeta',
      movimientos: legacyTc,
      info: {fechaCorte: legacyInfo.fechaCorte||null, fechaPago: legacyInfo.fechaPago||null, cupo: legacyInfo.cupo||null}
    };
    delete m.tarjeta;
    delete m.tcInfo;
    // Migrar gastos vinculados: tcLinked:true → tcCardId:'tc1'
    [m.q1_gastos, m.q2_gastos].forEach(function(list){
      list.forEach(function(g){
        if (g.esGrupo && g.tcLinked) { g.tcCardId = 'tc1'; }
      });
    });
  }
  // Asegurar que cada tarjeta tenga estructura completa
  Object.keys(m.tarjetas).forEach(function(tid){
    var t = m.tarjetas[tid];
    if (!Array.isArray(t.movimientos)) t.movimientos = [];
    if (!t.info) t.info = {fechaCorte:null, fechaPago:null, cupo:null};
    if (t.info.cupo === undefined) t.info.cupo = null;
    if (!t.nombre) t.nombre = 'Tarjeta';
  });

  return m;
}

let creditos={}; // {id: {nombre, valorPrestamo, pctAval, cuotas, tasa, fechaInicio, frecuencia}}
let catTipos=[]; // [{id, nombre}] catálogo de tipos/nombres de gasto
let catMetodos=[]; // [{id, nombre}] catálogo de formas de pago
let perfilTelefono=''; // número de celular para recuperación (ver Seguridad); viaja cifrado junto al resto de los datos
let db=null; // se puebla en loadAppData(), después de desbloquear con el PIN — nunca antes
let sessionDataKey=null; // CryptoKey AES-256 en memoria; nunca se persiste. Cifra/descifra fin26_enc.
let saveChain=Promise.resolve(); // serializa los guardados para no pisar escrituras si save() se llama varias veces seguidas

// Carga la estructura legacy en texto plano (versiones anteriores al cifrado en reposo).
// Solo se usa la primera vez que un usuario existente se desbloquea tras esta actualización
// (o si no hay ningún dato todavía); loadAppData() la migra a fin26_enc y borra estas claves.
function loadLegacyPlaintext(){
  try {
    const raw = localStorage.getItem('fin26');
    db = raw ? JSON.parse(raw) : null;
  } catch(e) { db = null; }
  if (!db) db = JSON.parse(JSON.stringify(INIT));
  try {
    const rawC = localStorage.getItem('fin26_creditos');
    creditos = rawC ? JSON.parse(rawC) : {};
  } catch(e) { creditos = {}; }
  try {
    const rawCM = localStorage.getItem('fin26_cat_metodos');
    if(rawCM){
      catMetodos = JSON.parse(rawCM);
    } else {
      // Migrar valores por defecto la primera vez
      const defaults=['Nequi','BBVA','PSE','Tarjeta','Retiro','Cuenta','Otro'];
      catMetodos = defaults.map(function(n){ return {id:uid(), nombre:n}; });
    }
  } catch(e) { catMetodos = []; }
  try {
    const rawCT = localStorage.getItem('fin26_cat_tipos');
    catTipos = rawCT ? JSON.parse(rawCT) : [];
  } catch(e) { catTipos = []; }
}

// Genera la clave AES-256 que cifra los datos financieros en reposo (fin26_enc).
async function generateDataKey(){
  return crypto.subtle.generateKey({name:'AES-GCM', length:256}, true, ['encrypt','decrypt']);
}
// Calcula el envelope de la data key envuelta con el PIN, SIN persistirlo todavía
// (mismo motivo que buildPinCheckMaterial: separar el cálculo, que puede fallar, de la escritura).
async function buildDataKeyEnvelope(dataKey, pin){
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12));
  const pinKey = await pbkdf2Key(pin, salt);
  const rawKey = await crypto.subtle.exportKey('raw', dataKey);
  const ct = await crypto.subtle.encrypt({name:'AES-GCM', iv:iv}, pinKey, rawKey);
  return {salt:b64enc(salt), iv:b64enc(iv), ct:b64enc(ct)};
}
// Envuelve (cifra) la data key con una clave derivada del PIN y la persiste.
async function wrapAndStoreDataKey(dataKey, pin){
  const env = await buildDataKeyEnvelope(dataKey, pin);
  localStorage.setItem('fin26_datakey', JSON.stringify(env));
}
// Desenvuelve un envelope de data key (ya sea el guardado o uno calculado en memoria) con el PIN dado.
// Lanza si el PIN no coincide con ese envelope — nunca hay que tratar eso como "no existe",
// porque generar una data key nueva en ese caso deja los datos ya cifrados sin forma de
// recuperarse (fue exactamente el bug que corrompió el acceso al cambiar el PIN).
async function unwrapDataKeyFromEnvelope(env, pin){
  const salt = new Uint8Array(b64dec(env.salt));
  const iv   = new Uint8Array(b64dec(env.iv));
  const ct   = b64dec(env.ct);
  const pinKey = await pbkdf2Key(pin, salt);
  const rawKey = await crypto.subtle.decrypt({name:'AES-GCM', iv:iv}, pinKey, ct); // lanza si el PIN no coincide
  // extractable:true — necesario para poder reenvolver esta misma data key bajo un PIN
  // nuevo en confirmChangePIN() (exportKey exige que la clave sea extraíble).
  return crypto.subtle.importKey('raw', rawKey, 'AES-GCM', true, ['encrypt','decrypt']);
}
// Desenvuelve la data key guardada en localStorage usando el PIN. Devuelve null SOLO si
// todavía no existe ninguna data key guardada (usuario nuevo).
async function unwrapDataKey(pin){
  const raw = localStorage.getItem('fin26_datakey');
  if(!raw) return null;
  return unwrapDataKeyFromEnvelope(JSON.parse(raw), pin);
}
// Asegura que sessionDataKey exista: la desenvuelve si ya hay una guardada (debe funcionar
// con el PIN correcto — si falla, propaga el error), o crea una nueva SOLO si es la primera
// vez que se guarda algo (no existe ninguna data key en absoluto).
async function ensureDataKey(pin){
  const yaExiste = !!localStorage.getItem('fin26_datakey');
  if(!yaExiste){
    sessionDataKey = await generateDataKey();
    await wrapAndStoreDataKey(sessionDataKey, pin);
    return;
  }
  sessionDataKey = await unwrapDataKey(pin); // si el PIN no coincide, lanza — no genera una nueva
}

async function encryptPayload(obj){
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const pt = new TextEncoder().encode(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt({name:'AES-GCM', iv:iv}, sessionDataKey, pt);
  return {iv:b64enc(iv), ct:b64enc(ct)};
}
async function decryptPayload(envelope){
  const iv = new Uint8Array(b64dec(envelope.iv));
  const ct = b64dec(envelope.ct);
  const pt = await crypto.subtle.decrypt({name:'AES-GCM', iv:iv}, sessionDataKey, ct);
  return JSON.parse(new TextDecoder().decode(pt));
}

// Carga db/creditos/catálogos ya descifrados con sessionDataKey (o migra datos legacy en
// texto plano la primera vez). Requiere que ensureDataKey() ya se haya ejecutado.
async function loadAppData(){
  const encRaw = localStorage.getItem('fin26_enc');
  if(encRaw){
    const payload = await decryptPayload(JSON.parse(encRaw)); // lanza si la clave no coincide
    db = payload.db; creditos = payload.creditos||{}; catMetodos = payload.catMetodos||[]; catTipos = payload.catTipos||[]; perfilTelefono = payload.telefono||'';
  } else {
    loadLegacyPlaintext();
  }
  Object.keys(db).forEach(k => { db[k] = migrateMonth(db[k]); });
  await save();
  localStorage.removeItem('fin26');
  localStorage.removeItem('fin26_creditos');
  localStorage.removeItem('fin26_cat_metodos');
  localStorage.removeItem('fin26_cat_tipos');
}

let curM   = parseInt(localStorage.getItem('fin26m') || '0');
let gFiltro = {'q1':'todos','q2':'todos'}; // filtro por método en Q1/Q2
let gSort      = {'q1':'orden','q2':'orden'};  // orden activo en Q1/Q2
let gFilterOpen= {'q1':false,'q2':false};   // filtros/orden expandido
let gGroupOpen  = {};  // group open state: {groupId: bool}
let curTC = null; // id de la tarjeta seleccionada actualmente
let tcInfoOpen  = false;                        // info tarjeta expandida
let summaryOpen = true;                          // resumen del mes (básico/neto/gastos/tarjeta) — expandido por defecto
// Desgloses expandibles de cada bloque del Resumen del mes — todos colapsados por defecto.
let statBreakdownOpen = {tarjeta:false, neto:false, gastos:false, dispQ1:false, dispQ2:false};
const STAT_BREAKDOWN_DOM_IDS = {tarjeta:'tcBreakdown', neto:'netoBreakdown', gastos:'gastosBreakdown', dispQ1:'dispQ1Breakdown', dispQ2:'dispQ2Breakdown'};
let lastCreatedId = null;                         // id del último gasto creado, para animación de entrada
let nomDedOpen  = {'q1':false,'q2':false};      // deducciones nómina expandidas
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
let curTab = 0;
let tcTipo = 'Compra';

function save(){
  saveChain = saveChain.then(async function(){
    if(!sessionDataKey) return; // no debería pasar: save() solo se usa después de desbloquear
    const envelope = await encryptPayload({db:db, creditos:creditos, catMetodos:catMetodos, catTipos:catTipos, telefono:perfilTelefono});
    localStorage.setItem('fin26_enc', JSON.stringify(envelope));
  }).catch(function(e){ console.error('Error guardando datos cifrados', e); });
  return saveChain;
}
function getM()  { return db[curM]; }
function getNom(m) { return m.nomina || {}; }

// ── CRÉDITOS ────────────────────────────────────────────────────────────────
function calcCuotaPMT(valorPrestamo, tasa, cuotas){
  // PMT = P * i / (1 - (1+i)^-n)
  if(tasa<=0) return valorPrestamo/cuotas;
  return valorPrestamo*tasa/(1-Math.pow(1+tasa,-cuotas));
}

function generarFechasCredito(fechaInicioStr, cuotas, frecuencia){
  // frecuencia: 'mensual' o 'quincenal'
  // La fecha de inicio ES la fecha de la primera cuota
  const fechas=[];
  const inicio=new Date(fechaInicioStr+'T12:00:00');
  fechas.push(fechaInicioStr);
  if(frecuencia==='mensual'){
    var esFinDeMes = inicio.getDate() >= 28 || inicio.getDate()===new Date(inicio.getFullYear(),inicio.getMonth()+1,0).getDate();
    var cursor=new Date(inicio.getFullYear(),inicio.getMonth()+1,1);
    for(var k=1;k<cuotas;k++){
      if(esFinDeMes){
        var d=new Date(cursor.getFullYear(),cursor.getMonth()+1,0);
        fechas.push(d.toISOString().slice(0,10));
      } else {
        var d2=new Date(cursor.getFullYear(),cursor.getMonth(),inicio.getDate());
        fechas.push(d2.toISOString().slice(0,10));
      }
      cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);
    }
  } else {
    // Quincenal: la primera cuota es fechaInicio; luego alterna 15 / fin de mes
    var y=inicio.getFullYear(), m=inicio.getMonth();
    var enPrimeraQuincena = inicio.getDate()<15;
    var ultimoDiaInicio=new Date(y,m+1,0).getDate();
    var esFinDeMesInicio = inicio.getDate()>=ultimoDiaInicio;
    // Determinar la siguiente parada después de fechaInicio
    if(enPrimeraQuincena){
      // siguiente es fin de mes de este mismo mes
      var sigEsFinMes=true;
    } else {
      // inicio fue 15 o fin de mes → siguiente es el 15 del próximo mes (si ya pasó fin de mes) o fin de mes si inicio fue justo 15
      if(esFinDeMesInicio){ m++; if(m>11){m=0;y++;} var sigEsFinMes=false; }
      else { var sigEsFinMes=true; } // inicio fue el 15 → siguiente es fin de mes mismo mes
    }
    for(var k=1;k<cuotas;k++){
      if(sigEsFinMes){
        var ultimoDia=new Date(y,m+1,0).getDate();
        fechas.push(new Date(y,m,ultimoDia).toISOString().slice(0,10));
        sigEsFinMes=false;
        m++; if(m>11){m=0;y++;}
      } else {
        fechas.push(new Date(y,m,15).toISOString().slice(0,10));
        sigEsFinMes=true;
      }
    }
  }
  return fechas;
}

function calcAmortizacion(cred){
  // Si el crédito trae un plan de pagos IMPORTADO (montos exactos de un banco/entidad), se usa
  // tal cual en vez de recalcularlo con la fórmula PMT interna — así el redondeo, seguro y
  // demás conceptos propios del banco no se desalinean con el cálculo genérico de esta app.
  if(cred.planImportado && cred.planImportado.length){
    const rows=cred.planImportado;
    // "valorCuota" representativo = el monto que más se repite (la mayoría de créditos reales
    // tienen una cuota "de crucero" constante, con la primera/última ligeramente distintas).
    const freq={};
    rows.forEach(function(r){ freq[r.valorCuota]=(freq[r.valorCuota]||0)+1; });
    var modaValor=rows[0].valorCuota, modaCount=0;
    Object.keys(freq).forEach(function(v){ if(freq[v]>modaCount){ modaCount=freq[v]; modaValor=Number(v); } });
    const totalCapital=rows.reduce(function(a,r){return a+(r.capital||0);},0);
    return {cuotaPMT:modaValor, valorCuota:modaValor, aval:0, total:cred.valorPrestamo||totalCapital, rows:rows};
  }
  const valorPrestamo=cred.valorPrestamo||0;
  const aval=Math.round(valorPrestamo*((cred.pctAval||0)/100));
  const total=valorPrestamo+aval;
  const tasa=(cred.tasa||0)/100;
  const cuotas=cred.cuotas||1;
  const cuotaPMT=calcCuotaPMT(total,tasa,cuotas);
  const valorCuota=cred.valorCuotaManual||Math.round(cuotaPMT);
  const fechas=generarFechasCredito(cred.fechaInicio,cuotas,cred.frecuencia||'quincenal');
  const hoy=new Date(); hoy.setHours(0,0,0,0);

  var saldo=total;
  const rows=[];
  for(var k=0;k<cuotas;k++){
    var interes=Math.round(saldo*tasa*100)/100;
    var esUltima=(k===cuotas-1);
    var cuotaReal=esUltima?(saldo+interes):valorCuota;
    var capital=Math.round((cuotaReal-interes)*100)/100;
    if(esUltima){ capital=saldo; cuotaReal=Math.round((saldo+interes)*100)/100; }
    saldo=Math.round((saldo-capital)*100)/100;
    if(saldo<0) saldo=0;
    var fechaPago=new Date(fechas[k]+'T12:00:00');
    var pagado=fechaPago<hoy;
    rows.push({
      numero:k+1, fecha:fechas[k], valorCuota:cuotaReal,
      capital:capital, intereses:interes, saldo:saldo,
      pagadoSugerido:pagado
    });
  }
  return {cuotaPMT:Math.round(cuotaPMT), valorCuota:valorCuota, aval:aval, total:total, rows:rows};
}

function openCreditosMenu(){
  const ids=Object.keys(creditos);
  var listHtml=ids.length?ids.map(function(id){
    var cr=creditos[id];
    var amort=calcAmortizacion(cr);
    var pagadas=(cr.pagos||[]).filter(function(p){return p;}).length;
    var saldoActual=amort.rows.length?amort.rows[Math.min(pagadas,amort.rows.length-1)].saldo:0;
    if(pagadas>=cr.cuotas) saldoActual=0;
    var pct=cr.cuotas>0?Math.round(pagadas/cr.cuotas*100):0;
    return '<div onclick="openCreditoDetalle(\''+id+'\')" style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--brd);cursor:pointer">'
      +'<div style="flex:1">'
      +'<div style="font-size:14px;font-weight:600;color:var(--txt)">'+esc(cr.nombre)+'</div>'
      +'<div style="font-size:11px;color:var(--mut);margin-top:2px">'+pagadas+'/'+cr.cuotas+' cuotas · '+cop(amort.valorCuota)+' c/u</div>'
      +'<div style="height:4px;background:var(--brd);border-radius:4px;margin-top:6px;overflow:hidden;width:200px">'
      +'<div style="height:100%;width:'+pct+'%;background:var(--acc);border-radius:4px"></div></div>'
      +'</div>'
      +'<div style="text-align:right">'
      +'<div style="font-size:13px;font-weight:700;color:var(--txt)">'+cop(saldoActual)+'</div>'
      +'<div style="font-size:10px;color:var(--mut)">saldo</div>'
      +'</div>'
      +'</div>';
  }).join(''):'<div class="empty"><div class="eic">💵</div><p>Sin créditos. Crea uno nuevo.</p></div>';

  openModal('<div class="mtitle">Créditos</div>'
    +listHtml
    +'<div class="macts" style="margin-top:14px">'
    +'<button class="bcnl" onclick="closeModal()">Cerrar</button>'
    +'<button class="bpri" onclick="openNewCredito()">＋ Nuevo crédito</button>'
    +'</div>');
}

function openNewCredito(modo){
  modo = modo==='importar' ? 'importar' : 'manual';
  const pillsHtml='<div class="trow2" style="margin-bottom:14px">'
    +'<button class="topt'+(modo==='manual'?' sc':'')+'" onclick="openNewCredito(\'manual\')">Manual</button>'
    +'<button class="topt'+(modo==='importar'?' sa':'')+'" onclick="openNewCredito(\'importar\')">📥 Importar</button>'
    +'</div>';

  if(modo==='importar'){
    openModal('<div class="mtitle">Nuevo crédito</div>'
      +pillsHtml
      +formatoPlanoCreditoHtml()
      +'<input type="file" id="cr-import-file" accept=".json" style="display:none" onchange="importCreditoPlan(this)">'
      +'<button class="bpri" style="width:100%;margin-top:10px" onclick="document.getElementById(\'cr-import-file\').click()">📥 Elegir archivo JSON</button>'
      +'<div class="macts" style="margin-top:14px"><button class="bcnl" style="grid-column:1/-1" onclick="openCreditosMenu()">Cancelar</button></div>');
    return;
  }

  const hoy=new Date().toISOString().slice(0,10);
  openModal('<div class="mtitle">Nuevo crédito</div>'
    +pillsHtml
    +'<div class="field"><label>Nombre</label><input id="cr-nombre" placeholder="Ej: Crédito electrodomésticos"></div>'
    +'<div class="field"><label>Valor del préstamo</label><input id="cr-valor" type="text" inputmode="numeric" placeholder="Ej: 3.050.000" oninput="maskMoneyInput(this);updateCuotaSugerida()"></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
    +'<div class="field" style="margin:0"><label>% AVAL</label><input id="cr-aval" type="number" step="0.01" placeholder="Ej: 2" oninput="updateCuotaSugerida()"></div>'
    +'<div class="field" style="margin:0"><label>Cuotas</label><input id="cr-cuotas" type="number" placeholder="Ej: 36" oninput="updateCuotaSugerida()"></div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">'
    +'<div class="field" style="margin:0"><label>Tasa de interés %</label><input id="cr-tasa" type="number" step="0.01" placeholder="Ej: 2.0" oninput="updateCuotaSugerida()"></div>'
    +'<div class="field" style="margin:0"><label>Fecha inicio</label><input id="cr-fecha" type="date" value="'+hoy+'"></div>'
    +'</div>'
    +'<div class="field" style="margin-top:12px"><label>Frecuencia de pago</label>'
    +'<select id="cr-frec"><option value="quincenal">Quincenal</option><option value="mensual">Mensual</option></select></div>'
    +'<div class="field"><label>Valor de cuota manual (opcional)</label>'
    +'<input id="cr-cuota-manual" type="text" inputmode="numeric" placeholder="Se sugiere automáticamente" oninput="maskMoneyInput(this)">'
    +'<div id="cr-cuota-sugerida-txt" style="font-size:11px;color:var(--acc);margin-top:4px"></div>'
    +'</div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="saveNewCredito()">Crear</button>'
    +'</div>');
}

function updateCuotaSugerida(){
  const valor=moneyVal('cr-valor');
  const pctAval=parseFloat(document.getElementById('cr-aval')?.value)||0;
  const cuotas=parseInt(document.getElementById('cr-cuotas')?.value)||0;
  const tasaPct=parseFloat(document.getElementById('cr-tasa')?.value)||0;
  const txtEl=document.getElementById('cr-cuota-sugerida-txt');
  const inputManual=document.getElementById('cr-cuota-manual');
  if(!txtEl) return;
  if(valor>0 && cuotas>0){
    const aval=Math.round(valor*(pctAval/100));
    const total=valor+aval;
    const tasa=tasaPct/100;
    const pmt=calcCuotaPMT(total,tasa,cuotas);
    const pmtRedondeado=Math.round(pmt);
    txtEl.innerHTML='AVAL: '+cop(aval)+' · Total: '+cop(total)+'<br>Cuota sugerida: '+cop(pmtRedondeado);
    if(inputManual) inputManual.placeholder=cop(pmtRedondeado)+' (sugerida)';
  } else {
    txtEl.textContent='';
    if(inputManual) inputManual.placeholder='Se sugiere automáticamente';
  }
}

function saveNewCredito(){
  const nombre=document.getElementById('cr-nombre').value.trim();
  const valorPrestamo=moneyVal('cr-valor');
  const pctAval=parseFloat(document.getElementById('cr-aval').value)||0;
  const cuotas=parseInt(document.getElementById('cr-cuotas').value)||1;
  const tasa=parseFloat(document.getElementById('cr-tasa').value)||0;
  const fechaInicio=document.getElementById('cr-fecha').value;
  const frecuencia=document.getElementById('cr-frec').value;
  const cuotaManual=moneyVal('cr-cuota-manual')||null;
  if(!nombre||!valorPrestamo||!cuotas||!fechaInicio){showAlert('Completa nombre, valor, cuotas y fecha de inicio');return;}
  const id='cr_'+Date.now();
  creditos[id]={
    id:id, nombre:nombre, valorPrestamo:valorPrestamo, pctAval:pctAval,
    cuotas:cuotas, tasa:tasa, fechaInicio:fechaInicio, frecuencia:frecuencia,
    valorCuotaManual:cuotaManual, pagos:[]
  };
  save();closeModal();openCreditosMenu();toast('Crédito creado');
}

// HTML con un ejemplo del JSON aceptado, para estandarizar cómo se prepara/exporta el archivo
// antes de importarlo (formato fijo: cliente.nombre, planPagos[], totales.capital). Se muestra
// inline dentro de la pastilla "Importar" de "Nuevo crédito", no como modal aparte.
function formatoPlanoCreditoHtml(){
  const ejemplo=`{
  "cliente": { "nombre": "Nombre del titular" },
  "planPagos": [
    { "cuota": 1, "fecha": "2026-28-02", "abonoCapital": 102536, "abonoInteres": 76734,
      "seguroVida": 856, "otrosConceptos": 0, "capitalizacion": 0,
      "valorCuota": 180126, "saldoParcial": 7897464 },
    { "cuota": 2, "fecha": "2026-15-03", "abonoCapital": 103415, "abonoInteres": 66838,
      "seguroVida": 845, "otrosConceptos": 0, "capitalizacion": 0,
      "valorCuota": 171098, "saldoParcial": 7794049 }
  ],
  "totales": { "capital": 8000000 }
}`;
  const ejemploHtml=ejemplo.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return '<p style="font-size:12px;color:var(--mut);line-height:1.6;margin-bottom:10px">'
    +'El archivo debe tener esta forma. Las filas con <b style="color:var(--txt)">cuota -1 o 0</b> (desembolso) se ignoran automáticamente. '
    +'La <b style="color:var(--txt)">fecha</b> se espera como "AAAA-DD-MM" (día antes que mes, como suelen venir estos extractos), no como fecha ISO estándar.</p>'
    +'<pre style="background:var(--bg);border:1px solid var(--brd);border-radius:var(--r2);padding:10px;font-size:11px;color:var(--txt);white-space:pre;overflow:auto;max-height:280px">'+ejemploHtml+'</pre>';
}

// ── Importar plan de pagos de un crédito (JSON exacto de un banco/entidad) ──────
// Formato esperado: {cliente:{nombre}, planPagos:[{cuota, fecha, abonoCapital, abonoInteres,
// seguroVida, otrosConceptos, capitalizacion, valorCuota, saldoParcial}], totales:{capital,...}}
// Ojo: la "fecha" del banco viene como "AAAA-DD-MM" (día antes que mes), no ISO estándar.
function convertirFechaPlanoBanco(fechaStr){
  const partes=(fechaStr||'').split('-');
  if(partes.length!==3) return null;
  const anio=partes[0], dia=partes[1], mes=partes[2];
  return anio+'-'+mes+'-'+dia;
}
function parsePlanoImportado(jsonObj){
  if(!jsonObj||!Array.isArray(jsonObj.planPagos)) return null;
  const rows=jsonObj.planPagos
    .filter(function(p){ return p.cuota>=1; }) // excluye filas de desembolso (cuota -1, 0)
    .map(function(p){
      // El seguro, otros conceptos y la capitalización se suman al bucket "intereses" para
      // que capital+intereses siga siendo igual al valor real de la cuota (mismo criterio que
      // usa el cálculo interno de esta app, que no desglosa seguro por separado).
      const intereses=Math.round(((p.abonoInteres||0)+(p.seguroVida||0)+(p.otrosConceptos||0)+(p.capitalizacion||0))*100)/100;
      return {
        numero:p.cuota,
        fecha:convertirFechaPlanoBanco(p.fecha),
        valorCuota:p.valorCuota||0,
        capital:p.abonoCapital||0,
        intereses:intereses,
        saldo:p.saldoParcial||0
      };
    })
    .sort(function(a,b){ return a.numero-b.numero; });
  if(!rows.length) return null;
  const totales=jsonObj.totales||{};
  const capitalTotal=totales.capital||rows.reduce(function(a,r){return a+r.capital;},0);
  return {
    nombreSugerido:(jsonObj.cliente&&jsonObj.cliente.nombre)?jsonObj.cliente.nombre:'',
    valorPrestamo:capitalTotal,
    cuotas:rows.length,
    fechaInicio:rows[0].fecha,
    rows:rows
  };
}
function normalizarJSONPlano(text){
  // Corrige artefactos comunes al compartir/copiar el archivo (BOM de móviles,
  // o una llave "{" duplicada al inicio) que de otro modo rompen JSON.parse
  // aunque el contenido real del plano esté correcto.
  return text.replace(/^﻿/,'').replace(/^(\s*\{\s*){2,}/,'{').trim();
}
function importCreditoPlan(input){
  const file=input.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=function(e){
    try{
      const parsed=JSON.parse(normalizarJSONPlano(e.target.result));
      const plano=parsePlanoImportado(parsed);
      if(!plano){ showAlert('El archivo no tiene el formato esperado (falta "planPagos").'); input.value=''; return; }
      window._importedPlano=plano;
      openModal('<div class="mtitle">Importar plan de pagos</div>'
        +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:14px">'
        +'Se encontraron <b style="color:var(--txt)">'+plano.rows.length+' cuotas</b>, capital '+cop(plano.valorPrestamo)+'.<br>'
        +'Los montos de cada cuota (capital, interés, saldo) se usarán exactamente como vienen en el archivo, sin recalcularlos.</p>'
        +'<div class="field"><label>Nombre del crédito</label>'
        +'<input id="cip-nombre" value="'+esc(plano.nombreSugerido||'')+'" placeholder="Ej: Crédito Bancolombia"></div>'
        +'<div class="macts"><button class="bcnl" onclick="openNewCredito(\'importar\')">Cancelar</button>'
        +'<button class="bpri" onclick="confirmImportCreditoPlan()">Importar</button></div>');
    }catch(err){
      showAlert('Error al leer el archivo: '+err.message);
    }
    input.value='';
  };
  reader.readAsText(file);
}
function confirmImportCreditoPlan(){
  const plano=window._importedPlano;
  if(!plano) return;
  const nombre=(document.getElementById('cip-nombre').value||'').trim();
  if(!nombre){ showAlert('Escribe un nombre'); return; }
  const id='cr_'+Date.now();
  creditos[id]={
    id:id, nombre:nombre, valorPrestamo:plano.valorPrestamo, pctAval:0,
    cuotas:plano.cuotas, tasa:0, fechaInicio:plano.fechaInicio, frecuencia:'quincenal',
    valorCuotaManual:null, pagos:[], planImportado:plano.rows
  };
  save();closeModal();openCreditosMenu();toast('Plan de pagos importado ✓');
  window._importedPlano=null;
}

let creditoOcultarPagadas=true;

function openCreditoDetalle(id){
  const cr=creditos[id]; if(!cr) return;
  const amort=calcAmortizacion(cr);
  const pagos=cr.pagos||[];
  const ocultar=creditoOcultarPagadas;

  var pagadas=pagos.filter(function(p){return p;}).length;
  var saldoActual=pagadas>=amort.rows.length?0:(pagadas>0?amort.rows[pagadas-1].saldo:amort.total);
  var proximaIdx=amort.rows.findIndex(function(r,i){return !pagos[i];});
  if(proximaIdx===-1) proximaIdx=amort.rows.length-1;

  var cuotasPendientes=Math.max(cr.cuotas-pagadas,0);
  var pctProgreso=cr.cuotas>0?Math.round(pagadas/cr.cuotas*100):0;
  var fechaFinFmt=amort.rows.length?new Date(amort.rows[amort.rows.length-1].fecha+'T12:00:00').toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}):'';

  var rowsHtml=amort.rows.map(function(r,i){
    var pagado=!!pagos[i];
    if(ocultar && pagado) return '';
    var esProxima=(i===proximaIdx);
    var fechaFmt=new Date(r.fecha+'T12:00:00').toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'});
    return '<div id="cr-row-'+i+'" style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid var(--brd);'+(esProxima?'background:var(--acc-d)':'')+'">'
      +'<div onclick="toggleCuotaPago(\''+id+'\','+i+')" style="width:24px;height:24px;border-radius:50%;border:2px solid '+(pagado?'var(--grn)':'var(--mut)')+';display:flex;align-items:center;justify-content:center;cursor:pointer;background:'+(pagado?'var(--grn)':'transparent')+';flex-shrink:0">'+(pagado?'<span style="color:#fff;font-size:13px">✓</span>':'<span style="font-size:10px;color:var(--mut)">'+r.numero+'</span>')+'</div>'
      +'<div style="flex:1;min-width:0">'
      +'<div style="font-size:12px;font-weight:600;color:var(--txt)">Cuota '+r.numero+' de '+cr.cuotas+'</div>'
      +'<div style="font-size:10px;color:var(--mut);margin-top:1px">'+fechaFmt+' · saldo '+cop(r.saldo)+'</div>'
      +'<div style="font-size:10px;margin-top:1px"><span style="color:var(--grn)">Capital '+cop(r.capital)+'</span> · <span style="color:var(--red)">Interés '+cop(r.intereses)+'</span></div>'
      +'</div>'
      +'<div style="text-align:right;flex-shrink:0;display:flex;align-items:center;gap:6px">'
      +'<div style="font-size:13px;font-weight:700;color:var(--txt)">'+cop(r.valorCuota)+'</div>'
      +'</div>'
      +'</div>';
  }).join('');

  if(ocultar && !rowsHtml){
    rowsHtml='<div style="padding:24px;text-align:center;color:var(--grn);font-size:13px">✓ Todas las cuotas están pagadas</div>';
  }

  openModal('<div class="mtitle">'+esc(cr.nombre)+'</div>'
    +'<div style="display:flex;justify-content:flex-end;margin-bottom:6px">'
    +'<button onclick="editNombreCredito(\''+id+'\')" style="background:none;border:none;color:var(--mut);cursor:pointer;font-size:12px">✎ Editar nombre</button>'
    +'</div>'
    +'<div style="display:flex;gap:8px;margin-bottom:10px">'
    +'<div style="flex:1;background:var(--surf2);border-radius:var(--r2);padding:8px 10px"><div style="font-size:9px;color:var(--mut);text-transform:uppercase">Cuota</div><div style="font-size:14px;font-weight:700;color:var(--acc)">'+cop(amort.valorCuota)+'</div></div>'
    +'<div style="flex:1;background:var(--surf2);border-radius:var(--r2);padding:8px 10px"><div style="font-size:9px;color:var(--mut);text-transform:uppercase">Saldo</div><div style="font-size:14px;font-weight:700;color:var(--txt)">'+cop(saldoActual)+'</div></div>'
    +'<div style="flex:1;background:var(--surf2);border-radius:var(--r2);padding:8px 10px"><div style="font-size:9px;color:var(--mut);text-transform:uppercase">Progreso</div><div style="font-size:14px;font-weight:700;color:var(--txt)">'+pagadas+'/'+cr.cuotas+'</div></div>'
    +'</div>'
    +'<div style="margin-bottom:10px">'
    +'<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--mut);margin-bottom:4px">'
    +'<span>'+(cuotasPendientes>0?cuotasPendientes+' cuotas pendientes':'Crédito pagado')+'</span>'
    +(cuotasPendientes>0?'<span>Termina '+fechaFinFmt+'</span>':'')
    +'</div>'
    +'<div style="height:6px;background:var(--brd);border-radius:4px;overflow:hidden">'
    +'<div style="height:100%;width:'+pctProgreso+'%;background:var(--acc);border-radius:4px"></div>'
    +'</div>'
    +'</div>'
    +'<div style="display:flex;justify-content:flex-end;margin-bottom:6px">'
    +'<button onclick="toggleOcultarPagadas(\''+id+'\')" style="background:none;border:1px solid var(--brd2);border-radius:20px;padding:4px 10px;font-size:11px;color:var(--mut);cursor:pointer">'
    +(ocultar?'Mostrar pagadas':'Ocultar pagadas')+'</button>'
    +'</div>'
    +'<div id="cr-list" style="max-height:380px;overflow-y:auto;border:1px solid var(--brd);border-radius:var(--r2)">'+rowsHtml+'</div>'
    +'<div class="macts" style="margin-top:14px">'
    +'<button class="bcnl" onclick="openCreditosMenu()">Volver</button>'
    +'<button class="bpri" style="background:var(--red);color:#fff" onclick="confirmDeleteCredito(\''+id+'\')">Eliminar</button>'
    +'</div>');

  setTimeout(function(){
    var el=document.getElementById('cr-row-'+proximaIdx);
    if(el) el.scrollIntoView({block:'center'});
  },50);
}

function editNombreCredito(id){
  const cr=creditos[id]; if(!cr) return;
  openModal('<div class="mtitle">Editar crédito</div>'
    +'<div class="field"><label>Nombre del crédito</label><input id="cr-edit-nombre" value="'+esc(cr.nombre)+'"></div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openCreditoDetalle(\''+id+'\')">Cancelar</button>'
    +'<button class="bpri" onclick="saveNombreCredito(\''+id+'\')">Guardar</button>'
    +'</div>');
}
function saveNombreCredito(id){
  const cr=creditos[id]; if(!cr) return;
  const nuevoNombre=document.getElementById('cr-edit-nombre').value.trim();
  if(!nuevoNombre){showAlert('Escribe un nombre');return;}
  const nombreViejo=cr.nombre;
  cr.nombre=nuevoNombre;
  // Actualizar el nombre en los gastos ya generados que referencian este crédito
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    [mes.q1_gastos||[], mes.q2_gastos||[]].forEach(function(list){
      list.forEach(function(g){
        if(g.creditoId===id && g.nombre==='Crédito '+nombreViejo){
          g.nombre='Crédito '+nuevoNombre;
        }
      });
    });
  });
  save();render();openCreditoDetalle(id);toast('Crédito actualizado');
}

function toggleOcultarPagadas(id){
  creditoOcultarPagadas=!creditoOcultarPagadas;
  openCreditoDetalle(id);
}


function toggleCuotaPago(id,idx){
  const cr=creditos[id]; if(!cr) return;
  if(!cr.pagos) cr.pagos=[];
  cr.pagos[idx]=!cr.pagos[idx];
  // Sincronizar el gasto correspondiente en Q1/Q2 si existe en algún mes
  const numCuota=idx+1;
  let encontrado=false;
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    [mes.q1_gastos||[], mes.q2_gastos||[]].forEach(function(list){
      var g=list.find(function(x){return x.creditoId===id&&x.numCuota===numCuota;});
      if(g){ g.pagado_flag=cr.pagos[idx]; encontrado=true; }
    });
  });
  save();
  render(); // actualizar Q1/Q2 de fondo si el gasto cambió
  openCreditoDetalle(id);
}

function confirmDeleteCredito(id){
  const cr=creditos[id]; if(!cr) return;
  openModal('<div class="mtitle">¿Eliminar '+esc(cr.nombre)+'?</div>'
    +'<p style="font-size:13px;color:var(--mut);margin-bottom:16px">Esta acción no se puede deshacer.</p>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openCreditoDetalle(\''+id+'\')">Cancelar</button>'
    +'<button class="bpri" style="background:var(--red);color:#fff" onclick="deleteCredito(\''+id+'\')">Eliminar</button>'
    +'</div>');
}

function deleteCredito(id){
  delete creditos[id];
  save();closeModal();toast('Crédito eliminado');
}

function calcPrimaMes(m){
  // Si el mes actual es Junio o Diciembre, calcula la prima del semestre correspondiente
  const mi=MESES.indexOf(m.nombre);
  if(mi!==5 && mi!==11) return 0; // solo Junio(5) o Diciembre(11)
  const año=m.año;
  const mesesDelAño={};
  const bonosDelAño={};
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    if(mes.año===año){
      var idx=MESES.indexOf(mes.nombre);
      if(idx>=0){
        mesesDelAño[idx]=mes.nomina?mes.nomina.basico_total||0:0;
        bonosDelAño[idx]=mes.nomina?mes.nomina.bonos_total||0:0;
      }
    }
  });
  var ultimoBasico=null;
  var basicoConSugerido={};
  for(var i=0;i<=11;i++){
    if(mesesDelAño[i]!==undefined){ basicoConSugerido[i]=mesesDelAño[i]; ultimoBasico=mesesDelAño[i]; }
    else if(ultimoBasico!==null){ basicoConSugerido[i]=ultimoBasico; }
    else { basicoConSugerido[i]=0; }
  }
  var inicio = mi===5 ? 0 : 6;
  var fin = mi===5 ? 5 : 11;
  var prima=0;
  for(var i=inicio;i<=fin;i++){ prima += (basicoConSugerido[i]*30)/360; }
  return Math.round(prima);
}

// Escapa texto ingresado por el usuario antes de insertarlo como HTML (nombres de
// gastos, tarjetas, créditos, etc.) para evitar que caracteres como < > " rompan el
// marcado o inyecten HTML/JS accidentalmente.
// Resuelve el nombre a mostrar de un gasto: si está vinculado a una plantilla del
// catálogo (catTipoId), siempre usa el nombre ACTUAL de esa plantilla — así ambos
// quedan sincronizados sin depender de coincidencias de texto. Si la plantilla fue
// eliminada, o el gasto es de libre ingreso (sin catTipoId), usa su propio nombre.
function nombreGasto(g){
  if(g && g.catTipoId){
    var t=catTipos.find(function(i){return i.id===g.catTipoId;});
    if(t) return t.nombre;
  }
  return g?g.nombre:'';
}

function esc(s){
  if(s==null) return '';
  return String(s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

// Escapa texto de usuario para insertarlo dentro de un argumento de string simple
// ('...') dentro de un atributo onclick="..." (comillas dobles). No basta con esc():
// el navegador decodifica entidades HTML del atributo ANTES de compilarlo como JS,
// así que una comilla simple codificada como &#39; vuelve a ser ' y rompe el string.
// Por eso la comilla simple se escapa como \' (secuencia de escape JS, no entidad),
// mientras que la comilla doble sí se codifica como entidad para proteger el atributo.
function escJS(s){
  if(s==null) return '';
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;');
}

function cop(v) {
  if (v == null || isNaN(v)) return '$0';
  return '$' + Math.round(Math.abs(v)).toLocaleString('es-CO');
}
// ── Máscara de moneda para inputs (sin símbolo $, solo puntos de miles) ────────
// Los campos de dinero usan type="text" + inputmode="numeric" (un <input type="number">
// nativo no admite puntos de miles) y llaman a esto en su "oninput" para formatear mientras
// se escribe. moneyVal() hace el camino inverso al leer el valor guardado.
function moneyInputFmt(v){
  // 0 se trata igual que vacío (mismo criterio que usaban estos campos antes: "valor||''"),
  // así un gasto nuevo no arranca con un "0" que haya que borrar para empezar a escribir.
  return v?Math.round(v).toLocaleString('es-CO'):'';
}
function maskMoneyInput(el){
  const digits=el.value.replace(/\D/g,'');
  el.value=digits?Number(digits).toLocaleString('es-CO'):'';
  el.setSelectionRange(el.value.length, el.value.length);
}
function setMoneyValue(el, v){
  if(!el) return;
  el.value=moneyInputFmt(v);
}
function moneyVal(id){
  const el=document.getElementById(id);
  if(!el) return 0;
  const digits=(el.value||'').replace(/\D/g,'');
  return digits?parseInt(digits):0;
}
function uid()  { return Math.random().toString(36).slice(2,9); }
function fmtD(d) {
  if (!d) return '';
  const [,m,day] = d.split('-');
  return parseInt(day)+' '+['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][parseInt(m)-1];
}
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(()=>t.classList.remove('show'), 2200);
}

// ── Fechas de pago ────────────────────────────────────────────────────────────
function isFest(d) { return FE.has(d.toISOString().slice(0,10)); }
function isWknd(d) { return d.getDay()===0||d.getDay()===6; }
function prevBiz(d) {
  let x=new Date(d); x.setDate(x.getDate()-1);
  while(isWknd(x)||isFest(x)) x.setDate(x.getDate()-1);
  return x;
}
function getPago(año,mi) {
  let q1=new Date(año,mi,15);
  if(isWknd(q1)||isFest(q1)) { q1=prevBiz(q1); }
  let q2=new Date(año,mi+1,0);
  while(isWknd(q2)||isFest(q2)) q2=prevBiz(q2);
  return {q1,q2};
}
function diasHasta(dt) {
  const h=new Date(); h.setHours(0,0,0,0);
  const t=new Date(dt); t.setHours(0,0,0,0);
  return Math.round((t-h)/86400000);
}
function diasStatus(dias){
  if(dias<0)       return {cls:'urgent',dcls:'du',txt:'pagado'};
  if(dias===0)     return {cls:'urgent',dcls:'du',txt:'¡Hoy!'};
  if(dias<=3)      return {cls:'urgent',dcls:'du',txt:'en '+dias+(dias===1?' día':' días')};
  if(dias<=7)      return {cls:'soon',  dcls:'ds',txt:'en '+dias+' días'};
  return           {cls:'ok',     dcls:'do',txt:'en '+dias+' días'};
}

function renderPagosBanner(q1dt,q2dt,mInfo){
  const d1=diasHasta(q1dt), d2=diasHasta(q2dt);
  const s1=diasStatus(d1), s2=diasStatus(d2);
  const f1=q1dt.toLocaleDateString('es-CO',{day:'numeric',month:'short'});
  const f2=q2dt.toLocaleDateString('es-CO',{day:'numeric',month:'short'});

  const icBank='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="21" x2="21" y2="21"/><line x1="5" y1="21" x2="5" y2="10"/><line x1="9" y1="21" x2="9" y2="10"/><line x1="15" y1="21" x2="15" y2="10"/><line x1="19" y1="21" x2="19" y2="10"/><polygon points="12 2 21 9 3 9"/></svg>';
  const icInfo='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  const icCal='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';

  // Créditos: suma de TODAS las cuotas cuya fecha cae en el mes visible, sin filtrar
  // por "pagado". Las cuotas de deducción de nómina se marcan pagadas de inmediato al
  // crear/avanzar la deducción (ver saveDed/avanzarDeduccionesCredito), así que filtrar
  // por pagos[] las dejaba fuera del total aunque sí correspondan a este mes.
  // Un crédito quincenal aporta sus 2 cuotas del mes; uno mensual, solo 1.
  var creditoIds=Object.keys(creditos);
  var credLinea2='Sin créditos';
  if(creditoIds.length>0){
    var sumaCuotas=0, hayCuotasMes=false;
    creditoIds.forEach(function(cid){
      var cr=creditos[cid];
      var amort=calcAmortizacion(cr);
      amort.rows.forEach(function(row){
        var fecha=new Date(row.fecha+'T12:00:00');
        if(mInfo && fecha.getFullYear()===mInfo.año && fecha.getMonth()===mInfo.mes){
          sumaCuotas += row.valorCuota;
          hayCuotasMes=true;
        }
      });
    });
    credLinea2 = hayCuotasMes ? cop(sumaCuotas) : 'Al día';
  }

  function miniCard(icon,label,fecha,sub,onclick,dcls){
    return '<div class="pcard-mini" onclick="'+onclick+'">'
      +'<div class="pcard-mini-ic">'+icon+'</div>'
      +'<div class="pcard-mini-lbl">'+label+(sub?' <span class="pcard-mini-sub'+(dcls?' '+dcls:'')+'">'+sub+'</span>':'')+'</div>'
      +'<div class="pcard-mini-val">'+(fecha||'')+'</div>'
      +'</div>';
  }

  // Tarjeta combinada Q1+Q2 — ocupa 2 columnas, dividida en mitades
  const pagosCombo='<div class="pcard-mini pcard-mini-double" onclick="togglePCal(\'cal-combo\')">'
    +'<div style="flex:1;display:flex;flex-direction:column;align-items:center;min-width:0">'
    +'<div class="pcard-mini-ic">'+icCal+'</div>'
    +'<div class="pcard-mini-lbl">Pago Q1 <span class="pcard-mini-sub'+(s1.dcls?' '+s1.dcls:'')+'">'+s1.txt+'</span></div>'
    +'<div class="pcard-mini-val">'+f1+'</div>'
    +'</div>'
    +'<div style="width:1px;background:var(--brd2);align-self:stretch;margin:2px 4px"></div>'
    +'<div style="flex:1;display:flex;flex-direction:column;align-items:center;min-width:0">'
    +'<div class="pcard-mini-ic">'+icCal+'</div>'
    +'<div class="pcard-mini-lbl">Pago Q2 <span class="pcard-mini-sub'+(s2.dcls?' '+s2.dcls:'')+'">'+s2.txt+'</span></div>'
    +'<div class="pcard-mini-val">'+f2+'</div>'
    +'</div>'
    +'</div>';

  return '<div class="pcard-grid">'
    +pagosCombo
    +miniCard(icBank,'Créditos',credLinea2,null,'openCreditosMenu()','')
    +miniCard(icInfo,'Info general','Ver',null,'openInfoGeneral()','')
    +'</div>'
    +'<div class="pcard-cal" id="cal-combo" style="display:none;margin:0 16px 8px">'+buildMonthCal(q1dt,q2dt)+'</div>';
}

function togglePCal(id){
  const el=document.getElementById(id);
  if(!el) return;
  const open=el.style.display==='none';
  el.style.display=open?'block':'none';
}

function buildMonthCal(q1dt, q2dt){
  const año=q1dt.getFullYear(), mes=q1dt.getMonth();
  const p1=q1dt.getDate(), p2=q2dt.getDate();
  const hoy=new Date(); hoy.setHours(0,0,0,0);
  const diasMes=new Date(año,mes+1,0).getDate();
  let primerDia=new Date(año,mes,1).getDay();
  primerDia=primerDia===0?6:primerDia-1;
  const dows=['L','M','X','J','V','S','D'];
  const mesNombre=q1dt.toLocaleDateString('es-CO',{month:'long',year:'numeric'});
  let html='<div style="text-align:center;font-size:11px;font-weight:600;color:var(--mut);margin-bottom:4px;text-transform:capitalize">'+mesNombre+'</div>';
  html+='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;font-size:11px">';
  dows.forEach(function(d){
    html+='<div style="text-align:center;color:var(--mut);padding:2px 0;font-weight:600;font-size:10px">'+d+'</div>';
  });
  for(var i=0;i<primerDia;i++) html+='<div></div>';
  for(var d=1;d<=diasMes;d++){
    const isP1=d===p1, isP2=d===p2;
    const isToday=hoy.getFullYear()===año&&hoy.getMonth()===mes&&hoy.getDate()===d;
    const isPast=new Date(año,mes,d)<hoy;
    const fechaActual=new Date(año,mes,d);
    const esFestivo=isFest(fechaActual);
    var bg='transparent', color=isPast?'rgba(148,163,184,.3)':'var(--mut)', fw='400', border='none', br='3px', dotColor=null;
    if(esFestivo && !isP1 && !isP2){ color=isPast?'rgba(248,113,113,.4)':'var(--red)'; dotColor='var(--red)'; }
    if(isP1&&isP2){
      color='var(--pur)'; fw='700'; dotColor='var(--pur)';
    } else if(isP1){
      // Q1 always cyan regardless of past
      color='var(--acc)'; fw='700'; dotColor='var(--acc)';
    } else if(isP2){
      color=isPast?'rgba(52,211,153,.5)':'var(--grn)'; fw='700'; dotColor=isPast?'rgba(52,211,153,.5)':'var(--grn)';
    } else if(isToday){
      border='1px solid var(--acc)'; color='var(--acc)'; fw='600'; br='50%';
    }
    var dayDot=dotColor?'<div style="width:3px;height:3px;border-radius:50%;background:'+dotColor+';margin:0 auto;margin-top:-2px"></div>':'';
    html+='<div style="text-align:center;line-height:22px;height:22px;border-radius:'+br+';background:'+bg+';border:'+border+';color:'+color+';font-weight:'+fw+'">'+d+dayDot+'</div>';
  }
  html+='</div>';
  // Compact legend
  html+='<div style="display:flex;gap:8px;margin-top:6px;font-size:10px;color:var(--mut);align-items:center;flex-wrap:wrap">'
    +'<span style="display:inline-flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:50%;background:var(--acc);display:inline-block"></span>Q1 ('+p1+')</span>'
    +'<span style="display:inline-flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:50%;background:var(--grn);display:inline-block"></span>Q2 ('+p2+')</span>'
    +'<span style="display:inline-flex;align-items:center;gap:3px"><span style="width:6px;height:6px;border-radius:50%;background:var(--red);display:inline-block"></span>Festivo</span>'
    +'</div>';
  return html;
}

// ── Cálculo nómina — bonos SOLO informativos, NO se incluyen en el cálculo ───
// Q1 = basico_total / 2
// Q2 = basico_total / 30 × dias_Q2  (días desde el 16 hasta fin de mes)
// Las deducciones porcentuales se aplican solo sobre el básico quincenal

function diasQ2(año, mesIdx) {
  // Días del mes
  const diasMes = new Date(año, mesIdx + 1, 0).getDate();
  // Febrero bisiesto: diasMes=29 → diasQ2=14; normal: 28 → 13
  // Meses de 30 días → 15; meses de 31 días → 16
  return diasMes - 15;
}

function basicoQ1(m) {
  const n = getNom(m);
  return Math.round((n.basico_total || 0) / 2);
}

function basicoQ2(m) {
  const n = getNom(m);
  const mi = MESES.indexOf(m.nombre);
  const dias = mi >= 0 ? diasQ2(m.año, mi) : 15;
  return Math.round((n.basico_total || 0) / 30 * dias);
}

function calcNeto(bq, deds) {
  const base = bq || 0;
  let ajuste = 0;
  for (const d of (deds||[])) {
    // tipo: 'resta' (default) o 'suma'
    const signo = (d.tipo === 'suma') ? 1 : -1;
    const val = d.porcentaje ? base * d.porcentaje : (d.valor_fijo || 0);
    ajuste += signo * val;
  }
  return base + ajuste;
}
function netoQ1(m) { return calcNeto(basicoQ1(m), getNom(m).ded_q1); }
function netoQ2(m) { return calcNeto(basicoQ2(m), getNom(m).ded_q2); }

// Total de gastos activos (no "sin pagar") de una quincena, consciente de grupos: si el grupo
// tiene base propia (vinculado a tarjeta o monto manual) se usa esa; si no, se suman sus subgastos.
// Compartido entre renderGastos() y calcDisponibleQuincena() para no duplicar esta lógica.
// excludeTarjetaVinculada: en Q1 el SALDO de tarjeta (la "base" sincronizada con calcTCSaldo)
// se muestra solo como información — no debe restar del total ni del disponible ahí, porque el
// abono real solo ocurre en la quincena de pago (Q2). Pero los subgastos que sí se hayan
// agregado manualmente a ese grupo (ej. "Gasolina" pagada con la tarjeta) son gastos reales de
// la quincena y deben seguir contando, así que se ignora solo la base, nunca los subgastos.
function calcTotalGrupoAware(activos, subMap, excludeTarjetaVinculada){
  return activos.reduce(function(a,x){
    if(x.esGrupo){
      var usaBase=!(excludeTarjetaVinculada && x.tcCardId);
      var base=(usaBase && x.presupuesto>0)?x.presupuesto:0;
      if(base>0) return a+base;
      return a+(subMap[x.id]||[]).filter(function(s){return !s.sinpagar;}).reduce(function(b,s){return b+Math.abs(s.presupuesto||0);},0);
    }
    return a+Math.abs(x.presupuesto||0);
  },0);
}
// Total de gastos activos de una quincena completa (mismo criterio consciente de grupos que
// calcTotalGrupoAware). Compartido entre el Resumen del mes (Gastos Q1/Q2) y calcDisponibleQuincena.
function calcTotalQuincena(m, which){
  const gastos=which==='q1'?(m.q1_gastos||[]):(m.q2_gastos||[]);
  const subMap={};
  const topGastosAll=[];
  for(const g of gastos){
    if(g.parentId){ if(!subMap[g.parentId]) subMap[g.parentId]=[]; subMap[g.parentId].push(g); }
    else topGastosAll.push(g);
  }
  const activos=topGastosAll.filter(function(x){return !x.sinpagar;});
  return calcTotalGrupoAware(activos, subMap, which==='q1');
}
// Disponible de una quincena = neto de nómina de esa quincena menos el total de gastos activos.
function calcDisponibleQuincena(m, which){
  const netoQ=which==='q1'?netoQ1(m):netoQ2(m);
  return netoQ-calcTotalQuincena(m,which);
}

// ── Render principal ──────────────────────────────────────────────────────────
function render() {
  const m=getM();
  document.getElementById('lm').textContent = m.nombre;
  document.getElementById('ly').textContent = ' '+m.año;
  localStorage.setItem('fin26m', curM);

  const mi = MESES.indexOf(m.nombre);
  const {q1,q2} = getPago(m.año, mi>=0?mi:0);
  document.getElementById('pbanner').innerHTML = renderPagosBanner(q1,q2,{año:m.año,mes:mi>=0?mi:0});

  const nom = getNom(m);
  const n1=netoQ1(m), n2=netoQ2(m), tNom=n1+n2;
  const gastosQ1=calcTotalQuincena(m,'q1');
  const gastosQ2=calcTotalQuincena(m,'q2');
  const tGas=gastosQ1+gastosQ2;
  const tc=Object.values(m.tarjetas||{}).flatMap(function(t){return t.movimientos||[];});
  const tcSaldo=tc.filter(x=>x.tipo==='Compra').reduce((a,x)=>a+Math.abs(x.valor||0),0)
              -tc.filter(x=>x.tipo==='Abono').reduce((a,x)=>a+Math.abs(x.valor||0),0);
  // El disponible por quincena vive también en el Resumen del mes (siempre visible, sin
  // importar la pestaña activa) además del badge "Disp" dentro de cada pestaña Q1/Q2.
  const dispQ1=calcDisponibleQuincena(m,'q1');
  const dispQ2=calcDisponibleQuincena(m,'q2');
  const dispQ1Cls=dispQ1>=0?'sg':'sr';
  const dispQ2Cls=dispQ2>=0?'sg':'sr';
  // Chevrons de cada bloque expandible del resumen (▲ abierto / ▼ cerrado).
  const chv=function(key){ return statBreakdownOpen[key]?'▲':'▼'; };

  document.getElementById('summary').innerHTML=`
    <div class="stat"><div class="slbl">Básico mes</div><div class="sval sb">${cop(nom.basico_total)}</div></div>
    <div class="stat" onclick="toggleStatBreakdown('neto')" style="cursor:pointer">
      <div class="slbl" style="display:flex;justify-content:space-between;align-items:center">Neto mes<span style="font-size:8px">${chv('neto')}</span></div>
      <div class="sval sg">${cop(tNom)}</div>
    </div>
    <div class="stat" onclick="toggleStatBreakdown('gastos')" style="cursor:pointer">
      <div class="slbl" style="display:flex;justify-content:space-between;align-items:center">Gastos<span style="font-size:8px">${chv('gastos')}</span></div>
      <div class="sval sr">${cop(tGas)}</div>
    </div>
    <div class="stat" onclick="toggleStatBreakdown('tarjeta')" style="cursor:pointer">
      <div class="slbl" style="display:flex;justify-content:space-between;align-items:center">Tarjeta<span style="font-size:8px">${chv('tarjeta')}</span></div>
      <div class="sval sa">${cop(tcSaldo)}</div>
    </div>
    <div class="stat" onclick="toggleStatBreakdown('dispQ1')" style="cursor:pointer">
      <div class="slbl" style="display:flex;justify-content:space-between;align-items:center">Disponible Q1<span style="font-size:8px">${chv('dispQ1')}</span></div>
      <div class="sval ${dispQ1Cls}">${dispQ1<0?'-':''}${cop(Math.abs(dispQ1))}</div>
    </div>
    <div class="stat" onclick="toggleStatBreakdown('dispQ2')" style="cursor:pointer">
      <div class="slbl" style="display:flex;justify-content:space-between;align-items:center">Disponible Q2<span style="font-size:8px">${chv('dispQ2')}</span></div>
      <div class="sval ${dispQ2Cls}">${dispQ2<0?'-':''}${cop(Math.abs(dispQ2))}</div>
    </div>`;

  document.getElementById('summary').style.display = summaryOpen ? 'grid' : 'none';
  const chevEl = document.getElementById('summary-chevron');
  if (chevEl) chevEl.textContent = summaryOpen ? '▲' : '▼';

  // Fila simple de 2 líneas (label izq. / valor der.) para los desgloses de Neto, Gastos y
  // Disponible — mismo estándar visual .trow/.tlbl/.tval que ya usa el resto de la app.
  function breakdownRow(label, value, color, borderBottom){
    return '<div class="trow" style="background:none;padding:6px 0;'+(borderBottom?'border-bottom:1px solid var(--brd)':'')+'">'
      +'<span class="tlbl">'+label+'</span>'
      +'<span class="tval" style="font-size:13px;color:'+color+'">'+value+'</span></div>';
  }
  const netoBreakdownHtml=breakdownRow('Neto Q1',cop(n1),'var(--grn)',true)+breakdownRow('Neto Q2',cop(n2),'var(--grn)',false);
  const gastosBreakdownHtml=breakdownRow('Gastos Q1',cop(gastosQ1),'var(--red)',true)+breakdownRow('Gastos Q2',cop(gastosQ2),'var(--red)',false);
  const dispQ1BreakdownHtml=breakdownRow('Neto Q1',cop(n1),'var(--grn)',true)+breakdownRow('Gastos Q1',cop(gastosQ1),'var(--red)',false);
  const dispQ2BreakdownHtml=breakdownRow('Neto Q2',cop(n2),'var(--grn)',true)+breakdownRow('Gastos Q2',cop(gastosQ2),'var(--red)',false);
  [['neto',netoBreakdownHtml],['gastos',gastosBreakdownHtml],['dispQ1',dispQ1BreakdownHtml],['dispQ2',dispQ2BreakdownHtml]].forEach(function(pair){
    var key=pair[0], html=pair[1];
    var el=document.getElementById(STAT_BREAKDOWN_DOM_IDS[key]);
    if(el){
      el.innerHTML=html;
      el.style.display=(summaryOpen&&statBreakdownOpen[key])?'block':'none';
    }
  });

  // Carrusel de tarjetas (pendiente + disponible de cada una), oculto por defecto y
  // desplegado al tocar el bloque "Tarjeta" del resumen — evita saturar la vista compacta.
  const tcIdsAll=listTCIds(m);
  const tcBreakdownHtml=tcIdsAll.length?(
    '<div style="font-size:10px;color:var(--mut);font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">Tarjetas</div>'
    +'<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch">'
    +tcIdsAll.map(function(tid){
      var card=m.tarjetas[tid];
      var saldoTc=calcTCSaldo(m,tid);
      var marca=card.info&&card.info.marca;
      var cupo=card.info&&card.info.cupo;
      var dispTc=cupo?cupo-saldoTc:null;
      var showDisp=!!cupo;
      var lbl=showDisp?'Disponible':'Pendiente';
      var val=showDisp?dispTc:saldoTc;
      var valColor=showDisp?(val>=0?'var(--grn)':'var(--red)'):'var(--red)';
      return '<div onclick="goToTarjeta(\''+tid+'\')" style="flex-shrink:0;width:136px;background:var(--surf2);border-radius:12px;padding:10px 12px;border-left:3px solid '+tcBrandColor(marca)+';cursor:pointer">'
        +'<div style="min-height:16px;margin-bottom:12px">'+tcBrandBadgeHtml(marca)+'</div>'
        +'<div style="font-size:12px;font-weight:700;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:8px">'+esc(card.nombre)+'</div>'
        +'<div style="font-size:9px;color:var(--mut);text-transform:uppercase;letter-spacing:.04em">'+lbl+'</div>'
        +'<div style="font-size:13px;font-weight:700;color:'+valColor+'">'+(val<0?'-':'')+cop(Math.abs(val))+'</div>'
        +'</div>';
    }).join('')
    +'</div>'
  ):'<div style="padding:8px 0;font-size:12px;color:var(--mut)">Sin tarjetas</div>';
  const tcBreakdownEl=document.getElementById('tcBreakdown');
  if(tcBreakdownEl){
    tcBreakdownEl.innerHTML=tcBreakdownHtml;
    tcBreakdownEl.style.display=(summaryOpen&&statBreakdownOpen.tarjeta)?'block':'none';
  }

  document.querySelectorAll('.tab').forEach((t,i)=>t.classList.toggle('active',i===curTab));
  // If month picker modal is open, refresh its content
  const mbg=document.getElementById('mbg');
  if(mbg&&mbg.classList.contains('open')){
    const mtitle=document.getElementById('mc')?.querySelector('.mtitle');
    if(mtitle&&mtitle.textContent==='Seleccionar mes') openMonthPicker();
  }
  const el=document.getElementById('scroll');
  if      (curTab===0) el.innerHTML=renderGastos(m.q1_gastos||[],'q1');
  else if (curTab===1) el.innerHTML=renderGastos(m.q2_gastos||[],'q2');
  else if (curTab===2) el.innerHTML=renderTC(m);
  else                 el.innerHTML=renderNom(m);
}

// ── Gastos ───────────────────────────────────────────────────────────────────
function toggleGFilter(which){
  gFilterOpen[which]=!gFilterOpen[which];
  var m=getM();
  document.getElementById('scroll').innerHTML=renderGastos(which==='q1'?m.q1_gastos||[]:m.q2_gastos||[],which);
}

function setGSort(which,s){
  gSort[which]=s;
  // Re-render
  var m=getM();
  document.getElementById('scroll').innerHTML=renderGastos(which==='q1'?m.q1_gastos||[]:m.q2_gastos||[],which);
}

function sortGastos(gastos,which){
  var s=gSort[which]||'orden';
  var arr=gastos.slice(); // shallow copy to avoid mutating original

  // Orden secundario según selección del usuario
  if(s==='nombre')  arr.sort(function(a,b){return a.nombre.localeCompare(b.nombre,'es');});
  else if(s==='monto-asc')  arr.sort(function(a,b){return Math.abs(a.presupuesto||0)-Math.abs(b.presupuesto||0);});
  else if(s==='monto-desc') arr.sort(function(a,b){return Math.abs(b.presupuesto||0)-Math.abs(a.presupuesto||0);});
  else if(s==='metodo') arr.sort(function(a,b){return (a.metodo||'').localeCompare(b.metodo||'','es');});
  // 'orden' = mantiene el orden original como base

  // Orden primario automático: pendientes primero, pagados al final, sin pagar al fondo del todo
  // Se aplica SIEMPRE, sin importar el criterio elegido arriba (sort estable conserva el orden secundario dentro de cada grupo)
  arr.sort(function(a,b){
    var va=a.sinpagar?2:a.pagado_flag?1:0;
    var vb=b.sinpagar?2:b.pagado_flag?1:0;
    return va-vb;
  });

  return arr;
}

function setGFiltro(which,f){
  gFiltro[which]=f;
  document.querySelectorAll('.g-pill-'+which).forEach(function(el){
    el.style.background=el.dataset.f===f?'var(--acc)':'var(--surf2)';
    el.style.color=el.dataset.f===f?'#0F172A':'var(--mut)';
  });
  var m=getM();
  document.getElementById('scroll').innerHTML=renderGastos(which==='q1'?m.q1_gastos||[]:m.q2_gastos||[],which);
}

function renderGastos(gastos,which) {
  if(!gastos.length) return '<div class="empty"><div class="eic">📋</div><p>Sin gastos. Toca + para agregar.</p></div>';

  // Collect unique methods for filter pills
  var metodos=['todos'];
  gastos.forEach(function(g){
    if(g.metodo&&metodos.indexOf(g.metodo)<0) metodos.push(g.metodo);
    // Also from subgastos (they have parentId)
  });
  var activeFiltro=gFiltro[which]||'todos';

  const subMap={};
  const topGastosAll=[];
  for(const g of gastos){
    if(g.parentId){ if(!subMap[g.parentId]) subMap[g.parentId]=[]; subMap[g.parentId].push(g); }
    else topGastosAll.push(g);
  }

  // Apply method filter — groups shown only if metodo or any subgasto matches
  var topGastosFiltered=activeFiltro==='todos'?topGastosAll:topGastosAll.filter(function(g){
    if(!g.esGrupo) return g.metodo===activeFiltro;
    // For groups: show if group metodo matches OR any subgasto metodo matches
    if(g.metodo===activeFiltro) return true;
    return (subMap[g.id]||[]).some(function(s){return s.metodo===activeFiltro;});
  });
  const topGastos=sortGastos(topGastosFiltered,which);

  const activos=topGastosAll.filter(function(x){return !x.sinpagar;});
  const total=calcTotalGrupoAware(activos, subMap, which==='q1');
  const pagado=activos.reduce(function(a,x){
    if(x.esGrupo){
      // "pagado" de un grupo siempre se calcula sumando sus subgastos ya pagados (nunca la
      // base) — así que un grupo vinculado a tarjeta en Q1 ya solo suma lo que sí es un gasto
      // real ahí (ej. "Gasolina" pagada con la tarjeta), consistente con calcTotalGrupoAware.
      var paid=(subMap[x.id]||[]).filter(function(s){return !s.sinpagar&&s.pagado_flag;}).reduce(function(b,s){return b+Math.abs(s.presupuesto||0);},0);
      return a+paid;
    }
    return x.pagado_flag?a+Math.abs(x.presupuesto||0):a;
  },0);
  const sinPagarTotal=topGastosAll.filter(function(x){return x.sinpagar;}).reduce(function(a,x){return a+Math.abs(x.presupuesto||0);},0);
  const pct=total>0?Math.round(pagado/total*100):0;
  const bc=pct<40?'pbok':pct<75?'pbw':'pbo';
  const netoQ=which==='q1'?netoQ1(getM()):netoQ2(getM());
  const disp=netoQ-total;

  function buildSubRow(s,wh){
    var sp=s.pagado_flag,st=s.sinpagar;
    var sd=(s.pagado_real!=null&&s.pagado_real!==s.presupuesto)?s.presupuesto-s.pagado_real:null;
    var sdh=sd!==null?' · <span style="color:var(--'+(sd>0?'grn':'red')+')\">'+(sd>0?'Sobró':'Faltó')+' '+cop(Math.abs(sd))+'</span>':'';
    var chkCls=sp?'paid':st?'nopag':'';
    var nameCls=sp?'pd':st?'np':'';
    var amtCls=sp?'pa':'';
    var nopagBadge=st?'<span class="nopag-badge">Sin pagar</span>':'';
    var chkTxt=sp?'✓':st?'→':'';
    return '<div class="g-sub-row">'
      +'<div class="gchk '+chkCls+'" onclick="toggleP(event,\''+s.id+'\',\''+wh+'\')">'+chkTxt+'</div>'
      +'<div class="ginfo" onclick="editGasto(\''+s.id+'\',\''+wh+'\')" style="cursor:pointer">'
      +'<div class="gname '+nameCls+'">'+esc(nombreGasto(s))+nopagBadge+'</div>'
      +'<div class="gmeta">'+esc(s.metodo||'')+sdh+'</div></div>'
      +'<div style="text-align:right"><div class="gamt '+amtCls+'" onclick="editGasto(\''+s.id+'\',\''+wh+'\')" style="cursor:pointer'+(s.presupuesto<0?';color:var(--grn)':'')+'">'+cop(s.presupuesto)+'</div></div>'
      +'</div>'
  }

  var gastoRowGiCounter=0; // índice único para ids de DOM (gg-/gc-)
  function buildGastoRowHtml(g){
    var gi=gastoRowGiCounter++;
    if(g.esGrupo){
      var subs=subMap[g.id]||[];
      // Base del grupo: si tiene presupuesto propio (ej. saldo tarjeta), usarlo; si no, sumar subgastos
      var base=(g.presupuesto!==null&&g.presupuesto!==undefined&&g.tcLinked)?g.presupuesto:(g.presupuesto>0?g.presupuesto:0);
      var subsPagados=subs.filter(function(s){return s.pagado_flag&&!s.sinpagar;}).reduce(function(a,s){return a+Math.abs(s.presupuesto||0);},0);
      var subsPendientes=subs.filter(function(s){return !s.pagado_flag&&!s.sinpagar;}).reduce(function(a,s){return a+Math.abs(s.presupuesto||0);},0);
      // Si tiene base propia: pendiente = base - pagado; si no: pendiente = suma subgastos no pagados
      var totalGrupo=g.tcLinked?base:(base>0?base:subsPendientes+subsPagados);
      var pendiente=base>0?base-subsPagados:subsPendientes;
      var allPaid=subs.length>0&&subs.filter(function(s){return !s.sinpagar;}).every(function(s){return s.pagado_flag;});
      var countBadge=subs.length>0?'<span class="tc-count">'+subs.length+'</span>':'';
      var subRowsHtml=subs.map(function(s){return buildSubRow(s,which);}).join('');
      var addBtn='<div class="g-sub-add" onclick="openGasto(null,\''+which+'\',\''+g.id+'\')">＋ Agregar al grupo</div>';

      var deudaRow='';
      var grpChk=allPaid?'paid':'';
      var grpTxt=allPaid?'✓':'';
      // Mostrar lo pagado si hay subgastos pagados
      var pendienteHtml=subsPagados>0
        ?'<div style="font-size:10px;color:var(--grn);margin-top:1px">Pag: '+cop(subsPagados)+'</div>'
        :'';
      return '<div class="g-group">'
        +'<div class="g-group-head" onclick="toggleGG(\''+g.id+'\',\'gg-'+gi+'\',\'gc-'+gi+'\')">'
        +'<div class="gchk '+grpChk+'">'+grpTxt+'</div>'
        +'<div class="ginfo"><div class="gname">'+esc(nombreGasto(g))+countBadge+(g.tcLinked?'<span style="font-size:10px;color:var(--acc);margin-left:5px">⟳</span>':'')+' </div><div class="gmeta">'+esc(g.metodo||'')+'</div></div>'
        +'<div style="text-align:right;display:flex;align-items:center;gap:6px">'
        +'<div><div class="gamt '+(g.tcLinked&&totalGrupo<0?'a':'')+'">'+(g.tcLinked&&totalGrupo<0?'-':'')+cop(Math.abs(totalGrupo))+'</div>'+pendienteHtml+'</div>'
        +'<button onclick="event.stopPropagation();editGasto(\''+g.id+'\',' +'\''+which+'\');" style="background:none;border:none;color:var(--mut);font-size:15px;padding:4px 6px;cursor:pointer;flex-shrink:0">✎</button>'
        +'<div class="g-chevron" id="gc-'+gi+'">›</div></div>'
        +'</div>'
        +'<div id="gg-'+gi+'" style="display:'+(gGroupOpen[g.id]?'block':'none')+'"><div class="g-sub-wrap">'+subRowsHtml+deudaRow+addBtn+'</div></div>'
        +'</div>';
    }
    var p=g.pagado_flag,tras=g.sinpagar;
    var diff=(g.pagado_real!=null&&g.pagado_real!==g.presupuesto)?g.presupuesto-g.pagado_real:null;
    var dh=diff!==null?' · <span style="color:var(--'+(diff>0?'grn':'red')+')\">'+(diff>0?'Sobró':'Faltó')+' '+cop(Math.abs(diff))+'</span>':'';
    var gCls=(tras?'grow-nopag':'')+(g.id===lastCreatedId?' gnew':'');
    var cuotaBadge='';
    var mensBadge='';
    if(g.mensualidad){
      var mp2=g.mensualidad.split('-');
      var mNames=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      var mLabel=mNames[parseInt(mp2[1])-1]; // only month, no year
      mensBadge='<span style="font-size:10px;font-weight:600;background:var(--pur-d);color:var(--pur);padding:1px 6px;border-radius:10px;margin-left:4px;vertical-align:middle">'+mLabel+'</span>';
    }
    var compBadge=g.comprobante&&g.pagado_flag?'<span style="font-size:10px;color:var(--mut);margin-left:4px">🧾 '+esc(g.comprobante)+'</span>':'';
    if(g.cuotas_total>0&&g.cuota_actual>0){
      var cuotaColor=g.pagado_flag?'var(--grn)':'var(--amb)';
      cuotaBadge='<span style="font-size:10px;font-weight:600;background:var(--surf2);color:'+cuotaColor+';padding:1px 6px;border-radius:10px;margin-left:4px;vertical-align:middle">'+g.cuota_actual+'/'+g.cuotas_total+'</span>';
    }
    var chkCls=p?'paid':tras?'nopag':'';
    var namCls=p?'pd':tras?'np':'';
    var amtCls=p?'pa':'';
    var nopag=tras?'<span class="nopag-badge">Sin pagar</span>':'';
    var chkTxt=p?'✓':tras?'→':'';
    var realLine=g.pagado_real!=null&&g.pagado_real!==g.presupuesto?'Real: '+cop(g.pagado_real):esc(g.metodo||'');
    return '<div class="grow '+gCls+'" onclick="editGasto(\''+g.id+'\',\''+which+'\')">'
      +'<div class="gchk '+chkCls+'" onclick="toggleP(event,\''+g.id+'\',\''+which+'\')">'+ chkTxt +'</div>'
      +'<div class="ginfo"><div class="gname '+namCls+'">'+esc(nombreGasto(g))+cuotaBadge+mensBadge+nopag+'</div><div class="gmeta">'+esc(g.metodo||'')+dh+compBadge+'</div></div>'
      +'<div style="text-align:right"><div class="gamt '+amtCls+'">'+cop(g.presupuesto)+'</div><div class="gmth">'+realLine+'</div></div>'
      +'</div>';
  }

  var rows=topGastos.map(function(g){ return buildGastoRowHtml(g); }).join('');

  var spNote=sinPagarTotal>0?'<span style="color:var(--amb);font-size:11px;font-weight:500;margin-left:6px">· '+cop(sinPagarTotal)+' sin pagar</span>':'';
  var dispColor=disp>=0?'grn':'red';
  var dispTxt=(disp<0?'-':'')+cop(disp);
  var qLabel=which==='q1'?'1':'2';

  // Filter pills by método
  var pillsHtml='<div style="position:relative"><div style="display:flex;gap:6px;overflow-x:auto;padding:8px 14px 6px 14px;scrollbar-width:none;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory">'
    +metodos.map(function(m){
      var active=m===activeFiltro;
      var label=m==='todos'?'Todos':esc(m);
      var mTotal=m==='todos'?total:topGastosAll.filter(function(g){return !g.esGrupo&&g.metodo===m&&!g.sinpagar;}).reduce(function(a,g){return a+Math.abs(g.presupuesto||0);},0);
      var pillOnClick='onclick="setGFiltro(\''+which+'\''+',\''+escJS(m)+'\')"';
      return '<button class="g-pill-'+which+'" data-f="'+esc(m)+'" '+pillOnClick+' style="'
        +'flex-shrink:0;padding:4px 10px;border-radius:20px;border:none;cursor:pointer;font-size:11px;font-weight:600;white-space:nowrap;scroll-snap-align:start;'
        +'background:'+(active?'var(--acc)':'var(--surf2)')+';color:'+(active?'#0F172A':'var(--mut)')+';">'
        +label+(mTotal>0?' <span style="opacity:.7">'+cop(mTotal)+'</span>':'')+'</button>';
    }).join('')+'</div></div>';

  // Collapsible filter + sort panel
  var isOpen=gFilterOpen[which]||false;
  var activeSort=gSort[which]||'orden';
  var hasBadge=(activeFiltro!=='todos'||activeSort!=='orden');

  var panelHtml='';
  if(isOpen){
    var sortOpts=[{k:'orden',lbl:'Orden'},{k:'nombre',lbl:'Nombre'},
      {k:'monto-desc',lbl:'Mayor $'},{k:'monto-asc',lbl:'Menor $'},{k:'metodo',lbl:'F. Pago'}];
    var filterPills=metodos.map(function(m){
      var active=m===activeFiltro;
      var lbl=m==='todos'?'Todos':esc(m);
      var mTotal=m==='todos'?total:topGastosAll.filter(function(g){return !g.esGrupo&&g.metodo===m&&!g.sinpagar;}).reduce(function(a,g){return a+Math.abs(g.presupuesto||0);},0);
      return '<button class="g-pill-'+which+'" data-f="'+esc(m)+'" onclick="setGFiltro(\''+which+'\',\''+escJS(m)+'\')" style="flex-shrink:0;padding:3px 9px;border-radius:20px;border:none;cursor:pointer;font-size:11px;font-weight:600;white-space:nowrap;background:'+(active?'var(--acc)':'var(--surf2)')+';color:'+(active?'#0F172A':'var(--mut)')+';">'+lbl+(mTotal>0?' <span style="opacity:.7">'+cop(mTotal)+'</span>':'')+'</button>';
    }).join('');
    var sortPills=sortOpts.map(function(opt){
      var isA=opt.k===activeSort;
      return '<button onclick="setGSort(\''+which+'\',\''+opt.k+'\')" style="flex-shrink:0;padding:3px 9px;border-radius:20px;border:none;cursor:pointer;font-size:11px;font-weight:600;white-space:nowrap;background:'+(isA?'var(--acc)':'var(--surf2)')+';color:'+(isA?'#0F172A':'var(--mut)')+';">'+opt.lbl+'</button>';
    }).join('');
    panelHtml='<div style="border-bottom:1px solid var(--brd);background:var(--bg);padding:6px 0">'
      +'<div style="padding:0 14px 4px"><div style="font-size:10px;color:var(--mut);font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">Filtrar</div>'
      +'<div style="display:flex;gap:5px;overflow-x:auto;scrollbar-width:none">'+filterPills+'</div></div>'
      +'<div style="padding:6px 14px 2px"><div style="font-size:10px;color:var(--mut);font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">Ordenar</div>'
      +'<div style="display:flex;gap:5px;overflow-x:auto;scrollbar-width:none">'+sortPills+'</div></div>'
      +'</div>';
  }
  var sortPillsHtml=panelHtml;

  return '<div class="card">'
    +'<div class="chead">'
    +'<div><div class="ctitle">Quincena '+qLabel+'</div>'
    +'<div style="font-size:11px;color:var(--mut);margin-top:2px">Neto: <span style="color:var(--grn);font-weight:600">'+cop(netoQ)+'</span></div></div>'
    +'<div style="display:flex;gap:8px;align-items:center">'
    +'<span class="badge br">'+cop(total)+'</span>'
    +'<span class="badge bg">Disp: '+(disp<0?'-':'')+cop(disp)+'</span>'
    +'</div>'
    +'</div>'
    +sortPillsHtml
    +'<div style="padding:6px 14px 0;display:flex;justify-content:space-between;align-items:center">'
    +'<span style="font-size:10px;color:var(--mut);font-weight:600;text-transform:uppercase;letter-spacing:.04em">Progreso de pagos</span>'
    +'<div style="display:flex;align-items:center;gap:8px">'
    +'<span style="font-size:11px;font-weight:700;color:var(--txt)">'+pct+'%</span>'
    +'<button onclick="toggleGFilter(\''+which+'\')" style="background:none;border:1px solid var(--brd2);border-radius:20px;padding:2px 8px;font-size:10px;cursor:pointer;color:var(--mut);display:flex;align-items:center;gap:4px">'
    +(hasBadge?'<span style="width:5px;height:5px;border-radius:50%;background:var(--acc);display:inline-block"></span>':'')
    +'Filtrar '+(isOpen?'▲':'▼')
    +'</button>'
    +'</div>'
    +'</div>'
    +'<div class="pw"><div class="pb '+bc+'" style="width:'+pct+'%"></div></div>'
    +rows
    +'<div class="trow"><span class="tlbl">Pagado '+pct+'%</span>'
    +'<span class="tval"><span style="color:var(--grn)">'+cop(pagado)+'</span> <span style="color:var(--mut);font-size:12px;font-weight:400">/ '+cop(total)+'</span>'+spNote+'</span></div>'
    +'</div>';
}
// ── CALENDARIO ───────────────────────────────────────────────────────────────
let calSelDay = null;



function toggleGG(groupId,wrapId,chevId){
  gGroupOpen[groupId]=!gGroupOpen[groupId];
  const w=document.getElementById(wrapId),ch=document.getElementById(chevId);
  if(!w||!ch) return;
  const open=gGroupOpen[groupId];
  w.style.display=open?'block':'none';
  ch.style.transform=open?'rotate(90deg)':'rotate(0)';
  ch.style.color=open?'var(--acc)':'var(--mut)';
}

function convertirGrupo(id,which){
  const m=getM(),list=which==='q1'?m.q1_gastos:m.q2_gastos;
  const g=list.find(x=>x.id===id); if(!g)return;
  window._cvtId=id; window._cvtWhich=which;
  const isLinked=!!g.tcCardId;
  const baseVal=(!isLinked&&g.presupuesto)?g.presupuesto:'';
  const fieldStyle=isLinked?'opacity:.4;pointer-events:none':'';
  const tcIds=listTCIds(m);
  const cardOptStyle=isLinked?'':'opacity:.4;pointer-events:none';
  const cardOpts=tcIds.map(function(tid){
    var card=m.tarjetas[tid];
    var saldo=calcTCSaldo(m,tid);
    var sel=(g.tcCardId===tid)?' selected':'';
    return '<option value="'+tid+'"'+sel+'>'+esc(card.nombre)+' ('+cop(saldo)+')</option>';
  }).join('');
  openModal('<div class="mtitle">'+(g.esGrupo?'Editar grupo':'Convertir en grupo')+'</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:14px">'
    +'Los subgastos pagados se descuentan del total mostrando el saldo pendiente.</p>'
    +'<div class="cbx-row"><input type="checkbox" id="grp-linked"'+(isLinked?' checked':'')
    +' onchange="var f=document.getElementById(\'grp-base-field\');var c=document.getElementById(\'grp-card-field\');'
    +'f.style.opacity=this.checked?\'0.4\':\'1\';f.style.pointerEvents=this.checked?\'none\':\'auto\';'
    +'c.style.opacity=this.checked?\'1\':\'0.4\';c.style.pointerEvents=this.checked?\'auto\':\'none\';">'
    +'<label for="grp-linked" style="font-size:13px;color:var(--acc)">Vincular saldo de tarjeta</label></div>'
    +'<div class="field" id="grp-card-field" style="'+cardOptStyle+'">'
    +'<label>Tarjeta vinculada</label>'
    +'<select id="grp-card">'+cardOpts+'</select></div>'
    +'<div class="field" id="grp-base-field" style="'+fieldStyle+'">'
    +'<label>Monto base manual</label>'
    +'<input id="grp-base" type="text" inputmode="numeric" value="'+moneyInputFmt(baseVal)+'" placeholder="Ej: 1.209.417" oninput="maskMoneyInput(this)"></div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="saveConvertir()">'+(g.esGrupo?'Guardar':'Convertir')+'</button>'
    +'</div>');
}
function saveConvertir(){
  const id=window._cvtId, which=window._cvtWhich;
  const m=getM(),list=which==='q1'?m.q1_gastos:m.q2_gastos;
  const g=list.find(x=>x.id===id); if(!g)return;
  const linkedEl=document.getElementById('grp-linked');
  const linked=linkedEl?linkedEl.checked:false;
  g.esGrupo=true;
  if(linked){
    const cardSel=document.getElementById('grp-card');
    const tcId=cardSel?cardSel.value:listTCIds(m)[0];
    g.tcCardId=tcId;
    g.tcLinked=true; // legacy compat flag
    g.presupuesto=calcTCSaldo(m,tcId);
    syncTCGrupo(m); // creates Abono TC automatically
  } else {
    g.tcCardId=null;
    g.tcLinked=false;
    g.presupuesto=moneyVal('grp-base');
  }
  save();closeModal();render();toast(nombreGasto(g)+' convertido en grupo');
}
// ── Tarjeta ───────────────────────────────────────────────────────────────────
function renderTC(m) {
  if(!m.tarjetas) m.tarjetas={};
  const tcIds=listTCIds(m);
  if(tcIds.length===0){
    // Crear primera tarjeta automáticamente
    getTC(m,'tc1'); save();
    return renderTC(getM());
  }
  if(!curTC || !m.tarjetas[curTC]) curTC=tcIds[0];

  const t=getTC(m,curTC);
  const tc=t.movimientos||[];
  const info=t.info||{fechaCorte:null,fechaPago:null,cupo:null};
  const sugerida=calcFechaSugerida(info.fechaPago);
  const tcOpen=tcInfoOpen;

  function fmtInfoDate(s){
    if(!s) return '<span style="color:var(--mut);font-style:italic">No definida</span>';
    const d=new Date(s+'T12:00:00');
    return d.toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric'});
  }

  // ── Selector de tarjetas (píldoras) ──────────────────────────────────────
  var cardPills='<div style="display:flex;gap:6px;overflow-x:auto;padding:10px 14px 8px;scrollbar-width:none;-webkit-overflow-scrolling:touch">'
    +tcIds.map(function(tid){
      var card=m.tarjetas[tid];
      var active=tid===curTC;
      var cardSaldo=calcTCSaldo(m,tid);
      return '<button onclick="selectTC(\''+tid+'\')" style="flex-shrink:0;padding:5px 12px;border-radius:20px;border:none;cursor:pointer;font-size:12px;font-weight:600;white-space:nowrap;'
        +'background:'+(active?'var(--acc)':'var(--surf2)')+';color:'+(active?'#0F172A':'var(--mut)')+';">'
        +esc(card.nombre)+' <span style="opacity:.75">'+cop(cardSaldo)+'</span></button>';
    }).join('')
    +'<button onclick="openNewCard()" style="flex-shrink:0;padding:5px 12px;border-radius:20px;border:1px dashed var(--brd2);background:none;cursor:pointer;font-size:12px;font-weight:600;color:var(--acc)">＋ Nueva</button>'
    +'</div>';

  // Disponible de tarjeta (agregado): suma de (cupo - saldo) de las tarjetas con cupo configurado.
  // Si ninguna tarjeta tiene cupo definido, no se muestra nada (no hay límite con qué calcularlo).
  const tarjetasConCupo=tcIds.filter(function(tid){return m.tarjetas[tid].info&&m.tarjetas[tid].info.cupo;});
  const tcDisponibleTotal=tarjetasConCupo.length
    ?tarjetasConCupo.reduce(function(a,tid){return a+(m.tarjetas[tid].info.cupo-calcTCSaldo(m,tid));},0)
    :null;
  const dispTotalRow=tcDisponibleTotal===null?'':(
    '<div style="padding:0 14px 10px;display:flex;justify-content:space-between;align-items:center">'
    +'<span style="font-size:10px;color:var(--mut);font-weight:600;text-transform:uppercase;letter-spacing:.04em">Disponible tarjeta</span>'
    +'<span style="font-size:13px;font-weight:700;color:var(--'+(tcDisponibleTotal>=0?'grn':'red')+')">'+(tcDisponibleTotal<0?'-':'')+cop(Math.abs(tcDisponibleTotal))+'</span>'
    +'</div>'
  );

  const compras=tc.filter(function(x){return x.tipo==='Compra';}).reduce(function(a,x){return a+Math.abs(x.valor||0);},0);
  const abonos =tc.filter(function(x){return x.tipo==='Abono';}).reduce(function(a,x){return a+Math.abs(x.valor||0);},0);
  const saldo=compras-abonos;

  const cupoDisp=info.cupo?info.cupo-saldo:null;
  const cupoRows=info.cupo
    ?'<div class="nrow"><span class="nlbl">Cupo total</span><span class="nval g">'+cop(info.cupo)+'</span></div>'
     +'<div class="nrow" style="background:rgba(0,0,0,.15)"><span class="nlbl">Cupo disponible</span>'
     +'<span class="nval" style="color:var(--'+(cupoDisp>=0?'grn':'red')+')">'+cop(cupoDisp)+'</span></div>'
    :'';
  const fechaRows=''
    +'<div class="nrow"><span class="nlbl">Fecha de corte</span><span class="nval">'+fmtInfoDate(info.fechaCorte)+'</span></div>'
    +'<div class="nrow"><span class="nlbl">Fecha de pago</span><span class="nval">'+fmtInfoDate(info.fechaPago)+'</span></div>'
    +'<div class="nrow" style="background:rgba(0,0,0,.15)"><span class="nlbl">Fecha sugerida de pago</span>'
    +'<span class="nval" style="color:var(--acc)">'+(sugerida?fmtInfoDate(sugerida):'<span style="color:var(--mut);font-style:italic">Define fecha de pago</span>')+'</span></div>';
  const infoBody=tcOpen?(cupoRows+fechaRows
    +'<div class="trow" style="justify-content:flex-end;border-top:1px solid var(--brd)">'
    +'<button class="nedit" style="padding:4px 12px;font-size:12px;color:var(--red)" onclick="confirmDeleteCard(\''+curTC+'\')">Eliminar tarjeta</button>'
    +'</div>'):'';

  const infoCard='<div class="card" style="margin-bottom:10px">'
    +'<div class="chead" onclick="toggleTCInfo()" style="cursor:pointer">'
    +'<span class="ctitle">Info de '+esc(t.nombre)+'</span>'
    +'<div style="display:flex;align-items:center;gap:8px">'
    +(tcOpen?'':'<span style="font-size:11px;color:var(--mut)">'+(info.fechaPago?fmtInfoDate(info.fechaPago):'Sin definir')+'</span>')
    +'<button onclick="event.stopPropagation();editTCInfo()" style="background:none;border:none;color:var(--mut);cursor:pointer;font-size:14px;padding:2px 6px">✎</button>'
    +'<span style="color:var(--mut);font-size:14px">'+(tcOpen?'▲':'▼')+'</span>'
    +'</div>'
    +'</div>'
    +infoBody
    +'</div>';

  if(!tc.length) return cardPills+dispTotalRow+infoCard+'<div class="empty"><div class="eic">💳</div><p>Sin movimientos. Toca + para agregar.</p></div>';

  var grupos={};
  var sorted=[...tc].sort(function(a,b){return a.fecha>b.fecha?-1:a.fecha<b.fecha?1:0;});
  sorted.forEach(function(x){
    var key=x.descripcion||'Sin descripción';
    if(!grupos[key]) grupos[key]=[];
    grupos[key].push(x);
  });
  var gruposArr=Object.entries(grupos).map(function(entry){
    var nombre=entry[0], items=entry[1];
    var total=items.reduce(function(a,x){return a+Math.abs(x.valor||0);},0);
    var tipo=items[0].tipo;
    var firstFecha=items[0]?items[0].fecha:'';
    return {nombre:nombre,items:items,total:total,tipo:tipo,firstFecha:firstFecha};
  }).sort(function(a,b){return a.firstFecha>b.firstFecha?-1:a.firstFecha<b.firstFecha?1:0;});

  var grupoRows=gruposArr.map(function(g,gi){
    var ab=g.tipo==='Abono';
    var detalles=g.items.map(function(x){
      return '<div class="tc-detail" onclick="editTC(\''+x.id+'\')">'
        +'<div style="font-size:12px;color:var(--mut)">'+fmtD(x.fecha)+'</div>'
        +'<div style="font-size:12px;font-weight:600;color:var(--'+(ab?'grn':'red')+')">'+(ab?'-':'+')+cop(Math.abs(x.valor||0))+'</div>'
        +'</div>';
    }).join('');
    var countBadge=g.items.length>1?'<span class="tc-count">'+g.items.length+'</span>':'';
    var dateRange=g.items.length===1?fmtD(g.items[0].fecha):fmtD(g.items[0].fecha)+' – '+fmtD(g.items[g.items.length-1].fecha);
    return '<div class="tc-group" id="tcg-'+gi+'">'
      +'<div class="tc-group-head" onclick="toggleTCG('+gi+')">'
      +'<div class="tcic '+(ab?'a':'c')+'">'+(ab?'↓':'↑')+'</div>'
      +'<div style="flex:1;min-width:0">'
      +'<div class="tcdesc">'+esc(g.nombre)+countBadge+'</div>'
      +'<div class="tcdate">'+dateRange+'</div>'
      +'</div>'
      +'<div style="text-align:right;display:flex;align-items:center;gap:8px">'
      +'<div class="tcval '+(ab?'a':'c')+'">'+(ab?'-':'+')+cop(g.total)+'</div>'
      +'<div class="tc-chevron" id="tcc-'+gi+'">›</div>'
      +'</div>'
      +'</div>'
      +'<div class="tc-detail-wrap" id="tcd-'+gi+'" style="display:none">'+detalles+'</div>'
      +'</div>';
  }).join('');

  return cardPills+dispTotalRow+infoCard+'<div class="card">'
    +'<div class="chead">'
    +'<span class="ctitle">'+esc(t.nombre)+'</span>'
    +'<div style="display:flex;gap:8px;align-items:center">'
    +'<span class="badge '+(saldo<0?'br':'ba')+'">Saldo '+(saldo<0?'-':'')+cop(Math.abs(saldo))+'</span>'
    +(info.cupo?'<span class="badge '+(cupoDisp>=0?'bg':'br')+'">Disp: '+(cupoDisp<0?'-':'')+cop(Math.abs(cupoDisp))+'</span>':'')
    +'</div>'
    +'</div>'
    +grupoRows
    +'<div class="trow"><span class="tlbl">Compras · Abonos</span>'
    +'<span class="tval"><span style="color:var(--red)">'+cop(compras)+'</span> · <span style="color:var(--grn)">'+cop(abonos)+'</span></span></div>'
    +'</div>';
}

function selectTC(tid){
  curTC=tid;
  document.getElementById('scroll').innerHTML=renderTC(getM());
}

// Marcas disponibles para el "logo" simple mostrado en el carrusel de tarjetas del resumen.
const TC_MARCAS=['Ninguna','Visa','Mastercard','Amex'];
function openNewCard(){
  const marcaOpts=TC_MARCAS.map(function(mk){return '<option value="'+mk+'">'+mk+'</option>';}).join('');
  openModal('<div class="mtitle">Nueva tarjeta</div>'
    +'<div class="field"><label>Nombre de la tarjeta</label>'
    +'<input id="newcard-nombre" placeholder="Ej: BBVA, Falabella, Visa..."></div>'
    +'<div class="field"><label>Marca (opcional)</label><select id="newcard-marca">'+marcaOpts+'</select></div>'
    +'<div class="field"><label>Últimos 4 dígitos (opcional)</label>'
    +'<input id="newcard-ultimos4" maxlength="4" inputmode="numeric" placeholder="Ej: 9537"></div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="saveNewCard()">Crear</button>'
    +'</div>');
}
function saveNewCard(){
  const nombre=document.getElementById('newcard-nombre').value.trim();
  if(!nombre){showAlert('Escribe un nombre');return;}
  const marcaSel=document.getElementById('newcard-marca');
  const marca=marcaSel&&marcaSel.value!=='Ninguna'?marcaSel.value:null;
  const ultimos4=(document.getElementById('newcard-ultimos4').value||'').trim().replace(/\D/g,'').slice(-4)||null;
  const m=getM();
  const tid='tc'+(Object.keys(m.tarjetas||{}).length+1)+'_'+Date.now();
  if(!m.tarjetas) m.tarjetas={};
  m.tarjetas[tid]={id:tid,nombre:nombre,movimientos:[],info:{fechaCorte:null,fechaPago:null,cupo:null,marca:marca,ultimos4:ultimos4}};
  curTC=tid;
  save();closeModal();render();toast('Tarjeta creada');
}
function confirmDeleteCard(tid){
  const m=getM();
  const ids=listTCIds(m);
  if(ids.length<=1){
    showAlert('Debe quedar al menos una tarjeta.');
    return;
  }
  const card=m.tarjetas[tid];
  openModal('<div class="mtitle">¿Eliminar '+esc(card.nombre)+'?</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:16px">'
    +'Se eliminarán los movimientos de esta tarjeta. Los gastos vinculados quedarán sin tarjeta asociada. Esta acción <b style="color:var(--red)">no se puede deshacer</b>.</p>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" style="background:var(--red);color:#fff" onclick="deleteCard(\''+tid+'\')">Eliminar</button>'
    +'</div>');
}
function deleteCard(tid){
  const m=getM();
  delete m.tarjetas[tid];
  // Unlink gastos pointing to this card
  [m.q1_gastos||[],m.q2_gastos||[]].forEach(function(list){
    list.forEach(function(g){ if(g.tcCardId===tid){ g.tcCardId=null; } });
  });
  const ids=listTCIds(m);
  curTC=ids[0]||null;
  save();closeModal();render();toast('Tarjeta eliminada');
}

function toggleTCG(gi) {
  const wrap=document.getElementById('tcd-'+gi);
  const chev=document.getElementById('tcc-'+gi);
  const open=wrap.style.display==='none';
  wrap.style.display=open?'block':'none';
  chev.style.transform=open?'rotate(90deg)':'rotate(0deg)';
  chev.style.color=open?'var(--acc)':'var(--mut)';
}

// ── Nómina ───────────────────────────────────────────────────────────────────
function syncPrimaDed(m){
  const mi=MESES.indexOf(m.nombre);
  const nom=getNom(m);
  if(!nom.ded_q1) nom.ded_q1=[];
  if(!nom.ded_q2) nom.ded_q2=[];
  const prima=calcPrimaMes(m);

  // Junio: Prima va en Q2. Diciembre: Prima va en Q1. Otros meses: sin prima.
  const dedsQ2SinPrima=nom.ded_q2.filter(function(d){return d.nombre!=='Prima';});
  const dedsQ1SinPrima=nom.ded_q1.filter(function(d){return d.nombre!=='Prima';});

  if(mi===5 && prima>0){
    // Junio: agregar/actualizar Prima en Q2
    nom.ded_q2=dedsQ2SinPrima.concat([{nombre:'Prima',porcentaje:null,valor_fijo:prima,tipo:'suma'}]);
    nom.ded_q1=dedsQ1SinPrima;
  } else if(mi===11 && prima>0){
    // Diciembre: agregar/actualizar Prima en Q1
    nom.ded_q1=dedsQ1SinPrima.concat([{nombre:'Prima',porcentaje:null,valor_fijo:prima,tipo:'suma'}]);
    nom.ded_q2=dedsQ2SinPrima;
  } else {
    // Otro mes: remover Prima si existía
    nom.ded_q1=dedsQ1SinPrima;
    nom.ded_q2=dedsQ2SinPrima;
  }
}

function renderNom(m) {
  const nom=getNom(m);
  syncPrimaDed(m);
  const n1=netoQ1(m), n2=netoQ2(m);

  function block(lbl, bq, bonq, deds) {
    const neto=calcNeto(bq,deds);
    const isQ1=lbl.includes('Q1');
    const dedKey=isQ1?'q1':'q2';
    const dedOpen=nomDedOpen[dedKey]||false;
    const drows=(deds||[]).map((d,i)=>{
      _dedTipo = d.tipo || 'resta';
      const isSuma = d.tipo === 'suma';
      const val = d.porcentaje ? bq * d.porcentaje : (d.valor_fijo || 0);
      const display = isSuma ? val : -val;
      const cls = isSuma ? 'g' : 'r';
      const sign = isSuma ? '+' : '-';
      const credBadge=(d.creditoId&&creditos[d.creditoId])?`<span class="npct" style="color:var(--acc)">🏦 Cuota ${d.numCuota}/${creditos[d.creditoId].cuotas}</span>`:'';
      return `<div class="nrow">
        <span class="nlbl">
          <span style="font-size:11px;font-weight:700;color:var(--${isSuma?'grn':'red'})">${sign}</span>
          ${d.nombre}${d.porcentaje?`<span class="npct">${(d.porcentaje*100).toFixed(0)}%</span>`:''}${credBadge}
          <button class="nedit" onclick="editDed(event,'${lbl}',${i})">✎</button>
        </span>
        <span class="nval ${cls}">${isSuma?'+':''}${cop(display)}</span>
      </div>`;
    }).join('');
    return `<div class="card">
      <div class="chead"><span class="ctitle">${lbl}</span><span class="badge bg">${cop(neto)}</span></div>
      <div class="nom-grid">
        <div class="ncard">
          <div class="ncard-lbl">Básico quincenal</div>
          <div class="ncard-val" style="color:var(--acc)">${cop(bq)}</div>
          <div class="ncard-sub">Mes: ${cop(nom.basico_total)}</div>
        </div>
        <div class="ncard">
          <div class="ncard-lbl">Bonos quincenal</div>
          <div class="ncard-val" style="color:var(--pur)">${cop(bonq)}</div>
          <div class="ncard-sub">Mes: ${cop(nom.bonos_total)}</div>
          <div class="ncard-tag">Solo informativo</div>
        </div>
      </div>
      <div class="nrow"><span class="nlbl">Base de cálculo</span><span class="nval g">${cop(bq)}</span></div>
      <div class="sdiv" onclick="toggleNomDed('${dedKey}')" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center">
        <span>Deducciones</span><span style="font-size:11px;margin-right:4px">${dedOpen?'▲':'▼'}</span>
      </div>
      ${dedOpen?drows:''}
      ${dedOpen?`<div class="nrow" style="justify-content:flex-end"><button class="nedit" style="padding:4px 12px;font-size:12px" onclick="addDed('${lbl}')">+ Deducción</button></div>`:''}
      <div class="nrow ntot"><span class="nlbl">Neto a recibir</span><span class="nval g">${cop(neto)}</span></div>
    </div>`;
  }
  const resumen = `<div class="card" style="margin-bottom:10px">
    <div class="chead"><span class="ctitle">Resumen mensual</span><span class="badge bb">${cop(nom.basico_total)}</span></div>
    <div class="nom-grid">
      <div class="ncard">
        <div class="ncard-lbl">Básico total</div>
        <div class="ncard-val" style="color:var(--acc)">${cop(nom.basico_total)}</div>
        <div class="ncard-sub">Q1: ${cop(basicoQ1(m))} · Q2: ${cop(basicoQ2(m))}</div>
      </div>
      <div class="ncard">
        <div class="ncard-lbl">Bonos total</div>
        <div class="ncard-val" style="color:var(--pur)">${cop(nom.bonos_total)}</div>
        <div class="ncard-sub">Q1: ${cop(nom.bonos_q1)} · Q2: ${cop(nom.bonos_q2)}</div>
        <div class="ncard-tag">Solo informativo</div>
      </div>
    </div>
    <div class="nrow"><span class="nlbl">Neto Q1</span><span class="nval g">${cop(n1)}</span></div>
    <div class="nrow"><span class="nlbl">Neto Q2</span><span class="nval g">${cop(n2)}</span></div>
    <div class="nrow ntot"><span class="nlbl">Neto total mes</span><span class="nval g">${cop(n1+n2)}</span></div>
    <div class="nrow" style="justify-content:flex-end;border-top:1px solid var(--brd)">
      <button class="nedit" style="padding:4px 12px;font-size:12px" onclick="editBasico()">✎ Editar básico y bonos</button>
    </div>
  </div>`;
  return resumen
    + block('Nómina Q1', basicoQ1(m), nom.bonos_q1||0, nom.ded_q1||[])
    + block('Nómina Q2', basicoQ2(m), nom.bonos_q2||0, nom.ded_q2||[]);
}

// ── Navegación ────────────────────────────────────────────────────────────────
function prevM(){if(curM>0){curM--;gFiltro={q1:'todos',q2:'todos'};gSort={q1:'orden',q2:'orden'};gFilterOpen={q1:false,q2:false};curTab=0;curTC=null;render();}}
function nextM(){const mx=Math.max(...Object.keys(db).map(Number));if(curM<mx){curM++;gFiltro={q1:'todos',q2:'todos'};gSort={q1:'orden',q2:'orden'};gFilterOpen={q1:false,q2:false};curTab=0;curTC=null;render();}}
function sw(i){curTab=i;render();}

// ── Modal ─────────────────────────────────────────────────────────────────────
function openModal(h){document.getElementById('mc').innerHTML=h;document.getElementById('mbg').classList.add('open');}
function closeModal(){document.getElementById('mbg').classList.remove('open');}
function closeBg(e){if(e.target===document.getElementById('mbg'))closeModal();}

// ── Reemplazo consistente de alert()/confirm() nativos con el estilo propio de la app ──
function showAlert(message,opts){
  opts=opts||{};
  openModal('<div class="mtitle">'+esc(opts.title||'Aviso')+'</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:16px">'+esc(message)+'</p>'
    +'<div class="macts"><button class="bpri" style="grid-column:1/-1" onclick="closeModal()">Aceptar</button></div>');
}
function showConfirm(message,onYes,opts){
  opts=opts||{};
  const danger=opts.danger!==false;
  window._confirmYes=onYes;
  openModal('<div class="mtitle">'+esc(opts.title||'Confirmar')+'</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:16px">'+esc(message)+'</p>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="closeModal()">'+esc(opts.cancelLabel||'Cancelar')+'</button>'
    +'<button class="bpri"'+(danger?' style="background:var(--red);color:#fff"':'')+' onclick="runConfirmYes()">'+esc(opts.confirmLabel||'Eliminar')+'</button>'
    +'</div>');
}
function runConfirmYes(){
  const fn=window._confirmYes;
  closeModal();
  window._confirmYes=null;
  if(fn) fn();
}

// ── FAB ───────────────────────────────────────────────────────────────────────
function onFab(){
  if(curTab===0)openGasto(null,'q1');
  else if(curTab===1)openGasto(null,'q2');
  else if(curTab===2)openTCModal(null);
  else addDed('Nómina Q1');
}

// ── CRUD Gastos ───────────────────────────────────────────────────────────────
function sugerirCuotaCredito(){
  const sel=document.getElementById('g-credito');
  if(!sel) return;
  const crId=sel.value;
  if(!crId){
    // "Ninguno" seleccionado: limpiar marcas pero dejar lo que el usuario ya escribió
    return;
  }
  const cr=creditos[crId]; if(!cr) return;
  const amort=calcAmortizacion(cr);
  const pagos=cr.pagos||[];
  // Buscar la primera cuota NO pagada
  var idx=amort.rows.findIndex(function(r,i){return !pagos[i];});
  if(idx===-1) idx=amort.rows.length-1; // todas pagadas: sugerir la última
  const row=amort.rows[idx];

  const nEl=document.getElementById('g-n');
  const pEl=document.getElementById('g-p');
  const ctEl=document.getElementById('g-ct');
  const caEl=document.getElementById('g-ca');
  if(nEl) nEl.value='Crédito '+cr.nombre;
  if(pEl) setMoneyValue(pEl,row.valorCuota);
  if(ctEl) ctEl.value=cr.cuotas;
  if(caEl) caEl.value=row.numero;
}

function openGasto(g,which,parentId){
  const e=g||{nombre:'',presupuesto:0,metodo:'',pagado_real:null,pagado_flag:false};
  const isE=!!g;
  const pid=parentId||'';
  const eid=isE?e.id:'';
  const wh=which||'q1';

  const spLabel=wh==='q1'?'Mover a Q2':'Sin pagar (recordatorio)';
  const spChecked=e.sinpagar?' checked':'';
  const pdChecked=e.pagado_flag?' checked':'';
  var defaultMetodo=e.metodo||(catMetodos[0]?catMetodos[0].nombre:'');
  var suggestedCuota=e.cuota_actual||0;
  if(!e.id&&!suggestedCuota&&e.cuotas_total>0){
    var prevKey2=curM-1;
    if(prevKey2>=0&&db[prevKey2]){
      var pList=wh==='q1'?db[prevKey2].q1_gastos:db[prevKey2].q2_gastos;
      var pG=pList&&pList.find(function(x){return x.nombre===e.nombre&&x.cuotas_total>0;});
      if(pG&&pG.pagado_flag&&pG.cuota_actual) suggestedCuota=pG.cuota_actual+1;
      else suggestedCuota=1;
    } else { suggestedCuota=1; }
  }
  if(!e.id&&pid){
    var parentG=(getM()[wh==='q1'?'q1_gastos':'q2_gastos']||[]).find(function(x){return x.id===pid;});
    if(parentG&&parentG.metodo) defaultMetodo=parentG.metodo;
  }

  const opts=catMetodos.map(function(x){return '<option'+(defaultMetodo===x.nombre?' selected':'')+'>'+esc(x.nombre)+'</option>';}).join('');

  // Selector opcional de plantilla de gasto (catálogo de Gastos) — en creación, incluidos subgastos de un grupo
  var templateField='';
  if(!isE && catTipos.length>0){
    var tplOpts='<option value="">— Escribir libremente —</option>'+catTipos.map(function(t){
      return '<option value="'+t.id+'">'+esc(t.nombre)+'</option>';
    }).join('');
    templateField='<div class="field" style="margin-bottom:0"><label>Usar gasto guardado</label>'
      +'<select id="g-template" onchange="aplicarPlantillaGasto()">'+tplOpts+'</select></div>';
  }

  // Checks con su lista/campo mostrado DEBAJO del checkbox (no en línea).
  var creditoField='';
  const creditoIds=Object.keys(creditos);
  if(!isE && creditoIds.length>0){
    var creditoOpts='<option value="">— Selecciona un crédito —</option>'+creditoIds.map(function(cid){
      var cr=creditos[cid];
      return '<option value="'+cid+'">'+esc(cr.nombre)+'</option>';
    }).join('');
    creditoField='<div class="cbx-row"><input type="checkbox" id="g-escredito" onchange="toggleCreditoField()">'
      +'<label for="g-escredito" style="font-size:13px;color:var(--txt)">Crédito</label></div>'
      +'<div class="field" id="g-credito-field" style="display:none;margin:-2px 0 10px">'
      +'<select id="g-credito" onchange="sugerirCuotaCredito()">'+creditoOpts+'</select></div>';
  }

  // Crear directamente como grupo desplegable (antes había que crear el gasto, editarlo y
  // luego "Convertir en grupo desplegable" en un tercer modal — esto lo colapsa a un solo paso).
  // "Vincular saldo de tarjeta" y la tarjeta misma quedan indentadas para reflejar
  // que dependen de "Agrupar subgastos" (jerarquía visual: check → sub-check → select).
  var grupoCreacionField='';
  if(!isE && !pid){
    const mNow=getM();
    const tcIdsNow=listTCIds(mNow);
    var cardOptsNow=tcIdsNow.map(function(tid){
      var card=mNow.tarjetas[tid];
      var saldo=calcTCSaldo(mNow,tid);
      return '<option value="'+tid+'">'+esc(card.nombre)+' ('+cop(saldo)+')</option>';
    }).join('');
    grupoCreacionField='<div class="cbx-row"><input type="checkbox" id="g-esgrupo" onchange="toggleGrupoCreacionField()">'
      +'<label for="g-esgrupo" style="font-size:13px;color:var(--acc)">Agrupar subgastos</label></div>'
      +(tcIdsNow.length>0
        ?('<div class="cbx-row" id="g-grp-linked-row" style="display:none">'
          +'<input type="checkbox" id="g-grp-linked" onchange="toggleGrupoLinkedField()">'
          +'<label for="g-grp-linked" style="font-size:13px;color:var(--acc)">Vincular saldo de tarjeta</label></div>'
          +'<div class="field" id="g-grp-card-field" style="display:none;margin:-2px 0 10px">'
          +'<select id="g-grp-card" onchange="applyTCNombreGasto()">'+cardOptsNow+'</select></div>')
        :'');
  }

  const delBtn=isE?'<button class="bdel" onclick="delG(\''+eid+'\',\''+wh+'\')">Eliminar gasto</button>':'';
  var grpBtn='';
  if(isE&&!e.parentId&&!e.esGrupo){
    grpBtn='<button class="bdel" style="background:var(--acc-d);border-color:var(--acc);color:var(--acc);margin-top:6px" onclick="convertirGrupo(\''+eid+'\',\''+wh+'\')">Convertir en grupo desplegable</button>';
  } else if(isE&&e.esGrupo){
    grpBtn='<button class="bdel" style="background:var(--acc-d);border-color:var(--acc);color:var(--acc);margin-top:6px" onclick="convertirGrupo(\''+eid+'\',\''+wh+'\')">Editar grupo / base</button>'
          +'<button class="bdel" style="margin-top:6px" onclick="delGrupo(\''+eid+'\',\''+wh+'\')">Eliminar grupo (y subgastos)</button>';
  }

  // Campo Nombre: si el gasto está vinculado a una plantilla del catálogo, se bloquea
  // para garantizar que siempre coincida con el catálogo (integridad). Se puede
  // desvincular manualmente si se necesita un nombre libre para este gasto puntual.
  var linkedItem = e.catTipoId ? catTipos.find(function(t){return t.id===e.catTipoId;}) : null;
  var nameFieldHtml;
  if(linkedItem){
    nameFieldHtml = '<div class="field" style="margin:0"><label>Nombre</label>'
      +'<input id="g-n" value="'+esc(linkedItem.nombre)+'" readonly data-cat-tipo-id="'+linkedItem.id+'" style="opacity:.7;cursor:not-allowed">'
      +'<div id="g-n-note" style="font-size:11px;color:var(--acc);margin-top:4px">Vinculado al catálogo "'+esc(linkedItem.nombre)+'". Para renombrarlo edita el catálogo, o <span onclick="unlinkGastoNameField()" style="text-decoration:underline;cursor:pointer">desvincúlalo aquí</span>.</div>'
      +'</div>';
  } else {
    nameFieldHtml = '<div class="field" style="margin:0"><label>Nombre</label><input id="g-n" value="'+esc(e.nombre)+'" data-cat-tipo-id="" placeholder="Arriendo, Mercado, Luz..."></div>';
  }

  // "Maneja cuotas": antes "Total cuotas"/"Cuota actual" se mostraban siempre; ahora quedan
  // ocultas detrás de este check, igual que el resto de los checks de Características.
  const manejaCuotasChecked=e.cuotas_total>0;
  const cuotasField='<div class="cbx-row"><input type="checkbox" id="g-esCuotas"'+(manejaCuotasChecked?' checked':'')+' onchange="toggleCuotasField()">'
    +'<label for="g-esCuotas" style="font-size:13px;color:var(--txt)">Maneja cuotas</label></div>'
    +'<div id="g-cuotas-row" style="display:'+(manejaCuotasChecked?'grid':'none')+';grid-template-columns:1fr 1fr;gap:8px;margin:-4px 0 8px">'
    +'<div class="field" style="margin:0"><label>Total cuotas</label><input id="g-ct" type="number" min="0" value="'+(e.cuotas_total||'')+'" placeholder="Ej: 10"></div>'
    +'<div class="field" style="margin:0"><label>Cuota actual</label><input id="g-ca" type="number" min="1" value="'+( suggestedCuota||'')+'" placeholder="Auto"></div>'
    +'</div>';

  // Ícono pequeño en el encabezado de cada tarjeta, referente a su contenido.
  function cheadIcon(emoji, titulo){
    return '<div class="chead"><div style="display:flex;align-items:center;gap:8px">'
      +'<div class="tcic" style="width:26px;height:26px;font-size:13px;background:var(--acc-d);color:var(--acc)">'+emoji+'</div>'
      +'<span class="ctitle">'+titulo+'</span></div></div>';
  }

  // Sección "Información del gasto": Nombre/Valor y Valor real/Forma de pago en 2 columnas;
  // "Usar gasto guardado" queda como última fila, de ancho completo.
  const infoGastoCard='<div class="card" style="margin-bottom:12px">'
    +cheadIcon('📄','Información del gasto')
    +'<div style="padding:4px 14px 12px">'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'
    +nameFieldHtml
    +'<div class="field" style="margin:0"><label>Valor</label><input id="g-p" type="text" inputmode="numeric" value="'+moneyInputFmt(e.presupuesto)+'" oninput="maskMoneyInput(this)"></div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'
    +'<div class="field" style="margin:0"><label>Valor real pagado (opcional)</label><input id="g-r" type="text" inputmode="numeric" value="'+moneyInputFmt(e.pagado_real)+'" oninput="maskMoneyInput(this)"></div>'
    +'<div class="field" style="margin:0"><label>Forma de pago</label><select id="g-m">'+opts+'</select>'
    +'<button onclick="event.preventDefault();openNewMetodoInline()" style="background:none;border:none;color:var(--acc);font-size:11px;cursor:pointer;margin-top:4px;padding:0">+ Nueva forma de pago</button></div>'
    +'</div>'
    +templateField
    +'</div></div>';

  // Sección "Características del gasto": crédito, mensualidad, cuotas.
  const caracteristicasInner='<div style="padding:4px 14px 12px">'
    +creditoField
    +'<div class="cbx-row"><input type="checkbox" id="g-esmens"'+(e.mensualidad?' checked':'')+' onchange="toggleMensField()">'
    +'<label for="g-esmens" style="font-size:13px;color:var(--txt)">Mensualidad</label></div>'
    +'<div class="field" id="g-mens-field" style="'+(e.mensualidad?'':'display:none;')+'margin:-2px 0 10px">'
    +'<input id="g-mens" type="month" value="'+(e.mensualidad||'')+'"></div>'
    +cuotasField
    +'</div>';

  // Sección "Organización del gasto": agrupar en un grupo desplegable (solo al crear un gasto
  // de nivel superior). Se omite por completo si no aplica (edición, subgastos).
  const showOrganizacion=!!grupoCreacionField;
  const organizacionInner=showOrganizacion?('<div style="padding:4px 14px 12px">'+grupoCreacionField+'</div>'):'';

  // Características y Organización van lado a lado; si Organización no aplica, Características
  // ocupa el ancho completo en vez de dejar una columna vacía.
  const caracteristicasCard='<div class="card" style="'+(showOrganizacion?'margin-bottom:0;height:100%;box-sizing:border-box':'margin-bottom:12px')+'">'
    +cheadIcon('⚙️','Características del gasto')
    +caracteristicasInner+'</div>';
  const organizacionCard=showOrganizacion?(
    '<div class="card" style="margin-bottom:0;height:100%;box-sizing:border-box">'
    +cheadIcon('📁','Organización del gasto')
    +organizacionInner+'</div>'
  ):'';
  const caracOrgRow=showOrganizacion
    ?('<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;align-items:stretch">'+caracteristicasCard+organizacionCard+'</div>')
    :caracteristicasCard;

  // Sección "Estado del gasto": pagado / sin pagar.
  const estadoCard='<div class="card" style="margin-bottom:12px">'
    +cheadIcon('🚩','Estado del gasto')
    +'<div style="padding:4px 14px 12px">'
    +'<div class="cbx-row"><input type="checkbox" id="g-pd"'+pdChecked+'><label for="g-pd" style="font-size:13px;color:var(--txt)">Pagado</label></div>'
    +'<div class="cbx-row"><input type="checkbox" id="g-sp"'+spChecked+'><label for="g-sp" style="font-size:13px;color:var(--amb)">'+spLabel+'</label></div>'
    +'</div></div>';

  const html='<div class="mtitle">'+(isE?'Editar gasto':'Nuevo gasto')+'</div>'
    +infoGastoCard
    +caracOrgRow
    +estadoCard
    +'<div class="macts"><button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="saveG(\''+eid+'\',\''+wh+'\',\''+pid+'\')">Guardar</button></div>'
    +delBtn+grpBtn;
  openModal(html);
}

function toggleCuotasField(){
  const chk=document.getElementById('g-esCuotas');
  const row=document.getElementById('g-cuotas-row');
  if(!chk||!row) return;
  row.style.display=chk.checked?'grid':'none';
}

function toggleMensField(){
  const chk=document.getElementById('g-esmens');
  const wrap=document.getElementById('g-mens-field');
  const field=document.getElementById('g-mens');
  if(!chk||!wrap||!field) return;
  wrap.style.display=chk.checked?'block':'none';
  if(chk.checked && !field.value){
    var now=new Date();
    var y=now.getFullYear(), m=now.getMonth()+2;
    if(m>12){m=1;y++;}
    field.value=y+'-'+(m<10?'0':'')+m;
  }
}

function toggleGrupoCreacionField(){
  const chk=document.getElementById('g-esgrupo');
  const row=document.getElementById('g-grp-linked-row');
  if(!chk) return;
  // Si no hay tarjetas creadas todavía, esta fila ni siquiera existe en el formulario.
  if(row) row.style.display=chk.checked?'flex':'none';
}
function toggleGrupoLinkedField(){
  const chk=document.getElementById('g-grp-linked');
  const cardField=document.getElementById('g-grp-card-field');
  if(!chk) return;
  if(cardField) cardField.style.display=chk.checked?'block':'none';
  // Si se vincula a una tarjeta, el valor lo calcula el saldo de la tarjeta —
  // el campo "Valor" de arriba se ignora al guardar, así que se atenúa visualmente.
  const presupField=document.getElementById('g-p')?document.getElementById('g-p').closest('.field'):null;
  if(presupField){
    presupField.style.opacity=chk.checked?'.4':'1';
    presupField.style.pointerEvents=chk.checked?'none':'auto';
  }
  // Un gasto vinculado al saldo de una tarjeta siempre se paga con "Tarjeta" — se fija ese
  // método automáticamente (creándolo en el catálogo si todavía no existe) y se bloquea el
  // selector mientras esté vinculado, para que quede consistente con la tarjeta elegida.
  const metodoSel=document.getElementById('g-m');
  const metodoField=metodoSel?metodoSel.closest('.field'):null;
  if(metodoField){
    metodoField.style.opacity=chk.checked?'.4':'1';
    metodoField.style.pointerEvents=chk.checked?'none':'auto';
  }
  if(chk.checked && metodoSel){
    let tarjetaMetodo=catMetodos.find(function(x){return x.nombre.toLowerCase()==='tarjeta';});
    if(!tarjetaMetodo){
      tarjetaMetodo={id:uid(),nombre:'Tarjeta'};
      catMetodos.push(tarjetaMetodo);
      save();
    }
    let opt=Array.from(metodoSel.options).find(function(o){return o.value.toLowerCase()==='tarjeta';});
    if(!opt){
      opt=document.createElement('option');
      opt.value=tarjetaMetodo.nombre; opt.textContent=tarjetaMetodo.nombre;
      metodoSel.appendChild(opt);
    }
    metodoSel.value=tarjetaMetodo.nombre;
  }
  // El nombre del gasto se autocompleta con "Tarjeta {MARCA}-{últimos 4}" mientras esté
  // vinculado a una tarjeta, y se bloquea igual que al usar una plantilla del catálogo.
  if(chk.checked){ applyTCNombreGasto(); } else { unlockTCNombreGasto(); }
}
// Arma el nombre a partir de la tarjeta seleccionada: "Tarjeta VISA-9537" si hay marca y
// últimos 4 dígitos, o variantes más cortas si falta alguno de los dos datos.
function tcDisplayName(card){
  var marca=card.info&&card.info.marca;
  var ult4=card.info&&card.info.ultimos4;
  if(marca&&ult4) return 'Tarjeta '+marca.toUpperCase()+'-'+ult4;
  if(marca) return 'Tarjeta '+marca.toUpperCase();
  if(ult4) return 'Tarjeta '+card.nombre+'-'+ult4;
  return 'Tarjeta '+card.nombre;
}
function applyTCNombreGasto(){
  const cardSel=document.getElementById('g-grp-card');
  const nEl=document.getElementById('g-n');
  if(!cardSel||!nEl) return;
  const card=getM().tarjetas[cardSel.value];
  if(!card) return;
  // Si el nombre venía vinculado a una plantilla del catálogo de Gastos, se desvincula:
  // ahora el nombre lo define la tarjeta, no la plantilla.
  nEl.dataset.catTipoId='';
  const plantillaNote=document.getElementById('g-n-note');
  if(plantillaNote) plantillaNote.remove();
  nEl.value=tcDisplayName(card);
  nEl.readOnly=true;
  nEl.style.opacity='.7';
  nEl.style.cursor='not-allowed';
  let note=document.getElementById('g-n-note-tc');
  if(!note){
    note=document.createElement('div');
    note.id='g-n-note-tc';
    note.style.cssText='font-size:11px;color:var(--acc);margin-top:4px';
    nEl.parentElement.appendChild(note);
  }
  note.textContent='Nombre asignado automáticamente según la tarjeta vinculada.';
}
function unlockTCNombreGasto(){
  const nEl=document.getElementById('g-n');
  if(!nEl) return;
  nEl.readOnly=false;
  nEl.style.opacity='1';
  nEl.style.cursor='text';
  const note=document.getElementById('g-n-note-tc');
  if(note) note.remove();
}
function toggleCreditoField(){
  const chk=document.getElementById('g-escredito');
  const field=document.getElementById('g-credito-field');
  if(!chk||!field) return;
  field.style.display=chk.checked?'block':'none';
  if(!chk.checked){
    const sel=document.getElementById('g-credito');
    if(sel) sel.value='';
  }
}

function aplicarPlantillaGasto(){
  const sel=document.getElementById('g-template');
  const nEl=document.getElementById('g-n');
  if(!sel||!nEl) return;
  if(!sel.value){
    // "Escribir libremente": liberar el campo por completo
    nEl.readOnly=false;
    nEl.style.opacity='1';
    nEl.style.cursor='text';
    nEl.dataset.catTipoId='';
    const oldNote=document.getElementById('g-n-note-dyn');
    if(oldNote) oldNote.remove();
    return;
  }
  const item=catTipos.find(function(i){return i.id===sel.value;});
  if(!item) return;
  const pEl=document.getElementById('g-p');
  const mEl=document.getElementById('g-m');
  const ctEl=document.getElementById('g-ct');
  nEl.value=item.nombre;
  nEl.readOnly=true;
  nEl.style.opacity='.7';
  nEl.style.cursor='not-allowed';
  nEl.dataset.catTipoId=item.id;
  if(pEl&&item.presupuesto) setMoneyValue(pEl,item.presupuesto);
  if(mEl&&item.metodo) mEl.value=item.metodo;
  if(ctEl&&item.cuotas_total){
    ctEl.value=item.cuotas_total;
    const cuotasChk=document.getElementById('g-esCuotas');
    if(cuotasChk){ cuotasChk.checked=true; toggleCuotasField(); }
  }
  if(item.esMensualidad){
    document.getElementById('g-esmens').checked=true;
    toggleMensField();
  }
  let note=document.getElementById('g-n-note-dyn');
  if(!note){
    note=document.createElement('div');
    note.id='g-n-note-dyn';
    note.style.cssText='font-size:11px;color:var(--acc);margin-top:4px';
    nEl.parentElement.appendChild(note);
  }
  note.textContent='Nombre vinculado al catálogo — coincidirá siempre con "'+item.nombre+'".';
}

function unlinkGastoNameField(){
  const nEl=document.getElementById('g-n');
  if(!nEl) return;
  nEl.readOnly=false;
  nEl.style.opacity='1';
  nEl.style.cursor='text';
  nEl.dataset.catTipoId='';
  const note=document.getElementById('g-n-note');
  if(note) note.remove();
}

function openNewMetodoInline(){
  openModal('<div class="mtitle">Nueva forma de pago</div>'
    +'<div class="field"><label>Nombre</label><input id="cat-nombre" placeholder="Ej: Daviplata, Efectivo..."></div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="saveNewMetodoInline()">Guardar</button>'
    +'</div>');
}

function saveNewMetodoInline(){
  const nombre=document.getElementById('cat-nombre').value.trim();
  if(!nombre){showAlert('Escribe un nombre');return;}
  if(catMetodos.some(function(i){return i.nombre.toLowerCase()===nombre.toLowerCase();})){
    showAlert('Ya existe esa forma de pago');return;
  }
  catMetodos.push({id:uid(),nombre:nombre});
  save();
  closeModal();
  toast('Agregado. Vuelve a abrir el formulario para usarlo.');
}

function saveG(id,which,parentId){
  const m=getM(),list=which==='q1'?m.q1_gastos:m.q2_gastos;
  const nEl=document.getElementById('g-n');
  const nombre=nEl.value.trim();
  const catTipoIdSel=nEl.dataset.catTipoId||null;
  const presup=moneyVal('g-p');
  const real=moneyVal('g-r')||null;
  const metodo=document.getElementById('g-m').value;
  const paid=document.getElementById('g-pd').checked;
  const manejaCuotas=document.getElementById('g-esCuotas')?.checked||false;
  const cuotas_total=manejaCuotas?(parseInt(document.getElementById('g-ct').value)||0):0;
  const cuota_actual_input=manejaCuotas?(parseInt(document.getElementById('g-ca').value)||0):0;
  const mensualidad=document.getElementById('g-mens')?.value||null;
  const sinpagar=document.getElementById('g-sp')?.checked||false;
  const creditoSel=document.getElementById('g-credito');
  const creditoIdSel=creditoSel?creditoSel.value||null:null;
  if(!nombre){showAlert('Escribe un nombre');return;}
  let gasto;
  if(id){
    gasto=list.find(x=>x.id===id);
    if(gasto){gasto.nombre=nombre;gasto.catTipoId=catTipoIdSel||null;gasto.presupuesto=presup;gasto.pagado_real=real;gasto.metodo=metodo;gasto.pagado_flag=paid;gasto.sinpagar=sinpagar;
      gasto.cuotas_total=cuotas_total||0;
      gasto.cuota_actual=cuota_actual_input||gasto.cuota_actual||0;
      gasto.fecha_pago=document.getElementById('g-fp')?.value||gasto.fecha_pago||null;
      gasto.comprobante=document.getElementById('g-cmp')?.value.trim()||gasto.comprobante||null;
      gasto.mensualidad=mensualidad;
    }
  } else {
    // If this is a subgasto, inherit parent group's metodo
    var finalMetodo=metodo;
    if(parentId){
      var parentG=list.find(function(x){return x.id===parentId;});
      if(parentG&&parentG.metodo) finalMetodo=parentG.metodo;
    }
    // Auto-suggest cuota_actual: look for same gasto name in previous month
    var cuota_auto = cuota_actual_input;
    if(!cuota_auto && cuotas_total>0){
      // Find prev month
      var prevKey=curM-1;
      if(prevKey>=0&&db[prevKey]){
        var prevList=which==='q1'?db[prevKey].q1_gastos:db[prevKey].q2_gastos;
        var prevG=prevList&&prevList.find(function(x){return x.nombre===nombre&&x.cuotas_total>0;});
        if(prevG&&prevG.pagado_flag&&prevG.cuota_actual) cuota_auto=prevG.cuota_actual+1;
        else cuota_auto=1;
      } else { cuota_auto=1; }
    }
    gasto={id:uid(),nombre,presupuesto:presup,metodo:finalMetodo,pagado_real:real,pagado_flag:paid,sinpagar,parentId:parentId||null,cuotas_total:cuotas_total||0,cuota_actual:cuota_auto||0,mensualidad:mensualidad||null};
    if(catTipoIdSel){ gasto.catTipoId=catTipoIdSel; }
    if(creditoIdSel){
      gasto.creditoId=creditoIdSel;
      gasto.numCuota=cuota_auto||cuotas_total;
    }
    // Crear directamente como grupo desplegable (checkbox "Asociar a grupo desplegable" en
    // el propio formulario de creación), en vez de tener que crear el gasto, editarlo y luego
    // usar "Convertir en grupo desplegable" en un modal aparte.
    const esGrupoChk=document.getElementById('g-esgrupo');
    if(esGrupoChk&&esGrupoChk.checked){
      gasto.esGrupo=true;
      const linkedChk=document.getElementById('g-grp-linked');
      if(linkedChk&&linkedChk.checked){
        const cardSel=document.getElementById('g-grp-card');
        const tcId=cardSel?cardSel.value:listTCIds(m)[0];
        gasto.tcCardId=tcId;
        gasto.tcLinked=true;
        gasto.presupuesto=calcTCSaldo(m,tcId);
      }
    }
    list.push(gasto);
    lastCreatedId=gasto.id;
    if(gasto.esGrupo&&gasto.tcCardId) syncTCGrupo(m); // crea el subgasto "Abono TC" automáticamente
  }
  save(); closeModal(); render();
  setTimeout(function(){ lastCreatedId=null; }, 400);
  // Si es Q1 y se marcó "Sin pagar", ofrecer crear el gasto en Q2
  if(which==='q1' && sinpagar) {
    ofrecerCopiarQ2(gasto);
  } else {
    toast(id?'Gasto actualizado':(gasto.esGrupo?'Grupo creado ✓':'Gasto agregado'));
  }
}

function ofrecerCopiarQ2(g) {
  openModal('<div class="mtitle">¿Mover a Q2?</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.6;margin-bottom:16px">'
    +'El gasto <b style="color:var(--txt)">'+esc(nombreGasto(g))+'</b> se marcó como sin pagar.<br>'
    +'¿Deseas crearlo también en la quincena 2 para recordar que quedó pendiente?</p>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="closeModal();toast(\'Gasto guardado\')">No, solo Q1</button>'
    +'<button class="bpri" onclick="copiarGastoQ2(\''+g.id+'\')">Sí, agregar a Q2</button>'
    +'</div>');
}
function copiarGastoQ2(id) {
  const m=getM();
  const g=m.q1_gastos.find(x=>x.id===id);
  if(!g){closeModal();return;}
  const copia={id:uid(),nombre:g.nombre,catTipoId:g.catTipoId||null,presupuesto:g.presupuesto,metodo:g.metodo,pagado_real:null,pagado_flag:false,sinpagar:false};
  m.q2_gastos.push(copia);
  save(); closeModal(); render(); toast('Copiado a Q2');
}
function delGrupo(id,which){
  showConfirm('¿Eliminar el grupo y todos sus subgastos?',function(){
    const m=getM(), k=which==='q1'?'q1_gastos':'q2_gastos';
    m[k]=m[k].filter(x=>x.id!==id&&x.parentId!==id);
    save();closeModal();render();toast('Grupo eliminado');
  });
}
function delG(id,which){
  showConfirm('¿Eliminar este gasto?',function(){
    const m=getM(),k=which==='q1'?'q1_gastos':'q2_gastos';
    m[k]=m[k].filter(x=>x.id!==id);
    save();closeModal();render();toast('Gasto eliminado');
  });
}
function editGasto(id,which){
  const m=getM(),list=which==='q1'?m.q1_gastos:m.q2_gastos;
  const g=list.find(x=>x.id===id);if(g)openGasto(g,which);
}
function toggleP(e,id,which){
  e.stopPropagation();
  const m=getM(),list=which==='q1'?m.q1_gastos:m.q2_gastos;
  const g=list.find(x=>x.id===id);
  if(!g) return;
  if(!g.pagado_flag && g.presupuesto<0){
    toast('Saldo a favor — no hay deuda que pagar');
    return;
  }
  if(g.pagado_flag){
    g.pagado_flag=false;
    if(g.creditoId && creditos[g.creditoId]){
      var cr=creditos[g.creditoId];
      if(cr.pagos) cr.pagos[g.numCuota-1]=false;
    }
    if(g.parentId){
      const allGastos=[...(m.q1_gastos||[]),...(m.q2_gastos||[])];
      const parent=allGastos.find(x=>x.id===g.parentId);
      if(parent&&parent.tcCardId){
        const t=getTC(m,parent.tcCardId);
        const abonos=t.movimientos.filter(x=>x.tipo==='Abono'&&x.descripcion.startsWith(g.nombre));
        if(abonos.length>0){
          const last=abonos[abonos.length-1];
          t.movimientos=t.movimientos.filter(x=>x.id!==last.id);
          syncTCGrupo(m);
        }
      }
    }
    save();render();
  } else if(g.metodo==='PSE' || g.mensualidad){
    openPagoModal(g,which);
  } else {
    g.pagado_flag=true;
    if(g.parentId){
      const allGastos=[...(m.q1_gastos||[]),...(m.q2_gastos||[])];
      const parent=allGastos.find(x=>x.id===g.parentId);
      if(parent&&parent.tcCardId){
        const t=getTC(m,parent.tcCardId);
        t.movimientos.push({
          id:uid(),
          descripcion:g.nombre,
          tipo:'Abono',
          valor:-Math.abs(g.presupuesto||0),
          fecha:new Date().toISOString().slice(0,10),
          saldo:null
        });
        syncTCGrupo(m);
      }
    }
    if(g.creditoId && creditos[g.creditoId]){
      var cr2=creditos[g.creditoId];
      if(!cr2.pagos) cr2.pagos=[];
      cr2.pagos[g.numCuota-1]=true;
    }
    save();render();
  }
}

function openPagoModal(g,which){
  const hoy=new Date().toISOString().slice(0,10);

  // Cuota info
  var cuotaInfo='';
  if(g.cuotas_total>0&&g.cuota_actual>0){
    cuotaInfo='<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding:8px 12px;background:var(--bg);border-radius:var(--r2)">'
      +'<span style="font-size:12px;color:var(--mut)">Cuota</span>'
      +'<span style="font-size:16px;font-weight:700;color:var(--acc)">'+g.cuota_actual+' / '+g.cuotas_total+'</span>'
      +'</div>';
  }

  // Mensualidad field — keep existing month, only suggest next if not set
  var mensSugerida=g.mensualidad||'';
  if(!mensSugerida){
    // No mensualidad set — suggest next month
    var now=new Date();
    var y=now.getFullYear(),m=now.getMonth()+2;
    if(m>12){m=1;y++;}
    mensSugerida=y+'-'+(m<10?'0':'')+m;
  }
  // If mensualidad exists, keep it as-is (user can edit if needed)
  var mNames=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  // Mensualidad field (solo si el gasto realmente tiene mensualidad activada)
  var mensField='';
  if(g.mensualidad){
    mensField='<div class="field"><label>Mensualidad de</label>'
      +'<div style="display:flex;gap:8px;align-items:center">'
      +'<input id="pg-mens" type="month" value="'+mensSugerida+'" style="flex:1">'
      +'</div></div>';
  }

  openModal('<div class="mtitle">Confirmar pago</div>'
    +'<p style="font-size:13px;color:var(--mut);margin-bottom:10px">'+esc(nombreGasto(g))+' · '+cop(g.presupuesto)+'</p>'
    +cuotaInfo
    +'<div class="field"><label>Valor pagado</label>'
    +'<input id="pg-val" type="text" inputmode="numeric" value="'+moneyInputFmt(g.pagado_real||g.presupuesto)+'" placeholder="'+cop(g.presupuesto)+'" oninput="maskMoneyInput(this)"></div>'
    +mensField
    +'<div class="field"><label>Fecha de pago</label>'
    +'<input id="pg-fecha" type="date" value="'+(g.fecha_pago||hoy)+'"></div>'
    +'<div class="field"><label>Comprobante / referencia (opcional)</label>'
    +'<input id="pg-comp" type="text" value="'+(g.comprobante||'')+'" placeholder="Ej: REF-12345, captura, número..."></div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="confirmarPago(\''+g.id+'\',\''+which+'\')">✓ Marcar pagado</button>'
    +'</div>');
}

function confirmarPago(id,which){
  const m=getM(),list=which==='q1'?m.q1_gastos:m.q2_gastos;
  const g=list.find(x=>x.id===id);
  if(!g) return;
  const val=moneyVal('pg-val')||null;
  const fecha=document.getElementById('pg-fecha').value||null;
  const comp=document.getElementById('pg-comp').value.trim()||null;
  const mensEl=document.getElementById('pg-mens');
  const mens=mensEl?mensEl.value||null:null;
  g.pagado_flag=true;
  g.pagado_real=val;
  g.fecha_pago=fecha;
  g.comprobante=comp;
  if(mens!==null) g.mensualidad=mens;

  if(g.creditoId && creditos[g.creditoId]){
    var cr=creditos[g.creditoId];
    if(!cr.pagos) cr.pagos=[];
    cr.pagos[g.numCuota-1]=true;
  }

  if(g.parentId){
    const allGastos=[...(m.q1_gastos||[]),...(m.q2_gastos||[])];
    const parent=allGastos.find(x=>x.id===g.parentId);
    if(parent&&parent.tcCardId){
      const t=getTC(m,parent.tcCardId);
      const montoAbono=val||Math.abs(g.presupuesto||0);
      t.movimientos.push({
        id:uid(),
        descripcion:g.nombre+(comp?' ('+comp+')':''),
        tipo:'Abono',
        valor:-montoAbono,
        fecha:fecha||new Date().toISOString().slice(0,10),
        saldo:null
      });
      syncTCGrupo(m);
    }
  }

  save();closeModal();render();toast('Pago registrado');
}

// ── CRUD Tarjeta ──────────────────────────────────────────────────────────────
function openTCModal(tc){
  const isE=tc!==null;
  const t=tc||{descripcion:'',tipo:'Compra',fecha:new Date().toISOString().slice(0,10),valor:0,saldo:null};
  tcTipo=t.tipo;
  const eid=isE?t.id:'';
  const cCls=t.tipo==='Compra'?' sc':'', aCls=t.tipo==='Abono'?' sa':'';
  const valStr=moneyInputFmt(Math.abs(t.valor||0));
  // A diferencia de los demás campos, aquí el 0 es un saldo resultante válido y distinto de
  // "vacío" (sin definir), así que no se usa moneyInputFmt (que trata 0 como vacío).
  const saldoStr=t.saldo!=null?Math.round(t.saldo).toLocaleString('es-CO'):'';
  const delBtn=isE?'<button class="bdel" onclick="delTC(\''+eid+'\')">Eliminar movimiento</button>':'';
  openModal('<div class="mtitle">'+(isE?'Editar movimiento':'Nuevo movimiento')+'</div>'
    +'<div class="trow2">'
    +'<button class="topt'+cCls+'" id="oc" onclick="setTC(\'Compra\')">↑ Compra</button>'
    +'<button class="topt'+aCls+'" id="oa" onclick="setTC(\'Abono\')">↓ Abono</button>'
    +'</div>'
    +'<div class="field"><label>Descripción</label><input id="tc-d" value="'+esc(t.descripcion)+'" placeholder="Gasolina, UNE..."></div>'
    +'<div class="field"><label>Valor</label><input id="tc-v" type="text" inputmode="numeric" value="'+valStr+'" oninput="maskMoneyInput(this)"></div>'
    +'<div class="field"><label>Fecha</label><input id="tc-f" type="date" value="'+t.fecha+'"></div>'
    +'<div class="field"><label>Saldo resultante (opcional)</label><input id="tc-s" type="text" inputmode="numeric" value="'+saldoStr+'" oninput="maskMoneyInput(this)"></div>'
    +'<div class="macts"><button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="saveTC(\''+eid+'\')">Guardar</button></div>'
    +delBtn);
}
function setTC(tipo){
  tcTipo=tipo;
  document.getElementById('oc').className='topt'+(tipo==='Compra'?' sc':'');
  document.getElementById('oa').className='topt'+(tipo==='Abono'?' sa':'');
}
function calcFechaSugerida(fechaPagoStr){
  // La fecha de pago se guarda con un día fijo (ej. día 15).
  // La fecha sugerida = último día del mes en que cae la Q2 del mes actual del gasto.
  // Ej: mes actual = Junio, pago el día 15 → sugerida = último día de Junio (30 jun)
  // porque el pago del siguiente mes (15 Jul) se debe hacer con Q2 de Junio.
  if(!fechaPagoStr) return null;
  const fp = new Date(fechaPagoStr+'T12:00:00');
  const diaFP = fp.getDate(); // día del mes en que se paga (ej. 15)

  // Get current month from the active month in the app
  const MESES_IDX = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const mesActual = db && db[curM] ? MESES_IDX.indexOf(db[curM].nombre) : new Date().getMonth();
  const añoActual = db && db[curM] ? db[curM].año : new Date().getFullYear();

  // Payment date this cycle: same day, but in the NEXT month relative to current month
  // because Q2 of current month pays for next month's bill
  var mesPago = mesActual + 1; // next month (0-indexed)
  var añoPago = añoActual;
  if(mesPago > 11){ mesPago = 0; añoPago++; }

  // Fecha sugerida = último día de MES ACTUAL (= Q2 del mes actual)
  const ultimoDiaMesActual = new Date(añoActual, mesActual + 1, 0).getDate();
  const sug = new Date(añoActual, mesActual, ultimoDiaMesActual);
  return sug.toISOString().slice(0,10);
}

function toggleSummary(){
  summaryOpen=!summaryOpen;
  document.getElementById('summary').style.display = summaryOpen ? 'grid' : 'none';
  document.getElementById('summary-chevron').textContent = summaryOpen ? '▲' : '▼';
  Object.keys(STAT_BREAKDOWN_DOM_IDS).forEach(function(key){
    var el=document.getElementById(STAT_BREAKDOWN_DOM_IDS[key]);
    if(el) el.style.display=(summaryOpen&&statBreakdownOpen[key])?'block':'none';
  });
}
function toggleStatBreakdown(key){
  statBreakdownOpen[key]=!statBreakdownOpen[key];
  render();
}
// Selecciona la tarjeta tocada en el carrusel del resumen y salta directo a la pestaña Tarjeta.
function goToTarjeta(tid){
  curTC=tid;
  sw(2);
}
// "Logo" simple (sin imágenes externas, todo CSS/texto) para cada marca de tarjeta.
function tcBrandBadgeHtml(marca){
  if(marca==='Visa') return '<div style="font-style:italic;font-weight:800;font-size:14px;color:#fff;letter-spacing:.3px">VISA</div>';
  if(marca==='Mastercard') return '<div style="display:flex;align-items:center">'
    +'<div style="width:16px;height:16px;border-radius:50%;background:#EB001B"></div>'
    +'<div style="width:16px;height:16px;border-radius:50%;background:#F79E1B;margin-left:-7px;opacity:.85"></div></div>';
  if(marca==='Amex') return '<div style="display:inline-block;background:#2E77BC;color:#fff;font-weight:700;font-size:9px;padding:2px 5px;border-radius:3px;letter-spacing:.3px">AMEX</div>';
  return '';
}
function tcBrandColor(marca){
  if(marca==='Visa') return '#3B5FE0';
  if(marca==='Mastercard') return '#F79E1B';
  if(marca==='Amex') return '#2E77BC';
  return 'var(--acc)';
}

function toggleTCInfo(){
  tcInfoOpen=!tcInfoOpen;
  document.getElementById('scroll').innerHTML=renderTC(getM());
}

function editTCInfo(){
  const m=getM(), t=getTC(m), info=t.info||{fechaCorte:null,fechaPago:null,cupo:null,marca:null,ultimos4:null};
  const marcaActual=info.marca||'Ninguna';
  const marcaOpts=TC_MARCAS.map(function(mk){return '<option value="'+mk+'"'+(mk===marcaActual?' selected':'')+'>'+mk+'</option>';}).join('');
  openModal('<div class="mtitle">Editar tarjeta</div>'
    +'<div class="field"><label>Nombre de la tarjeta</label>'
    +'<input id="tci-nombre" value="'+esc(t.nombre)+'" placeholder="Ej: BBVA, Falabella..."></div>'
    +'<div class="field"><label>Marca (opcional)</label><select id="tci-marca">'+marcaOpts+'</select></div>'
    +'<div class="field"><label>Últimos 4 dígitos (opcional)</label>'
    +'<input id="tci-ultimos4" maxlength="4" inputmode="numeric" value="'+(info.ultimos4||'')+'" placeholder="Ej: 9537"></div>'
    +'<div class="field"><label>Cupo total</label>'
    +'<input id="tci-cupo" type="text" inputmode="numeric" value="'+moneyInputFmt(info.cupo)+'" placeholder="Ej: 5.000.000" oninput="maskMoneyInput(this)"></div>'
    +'<div class="field"><label>Fecha de corte</label>'
    +'<input id="tci-corte" type="date" value="'+(info.fechaCorte||'')+'"></div>'
    +'<div class="field"><label>Fecha de pago</label>'
    +'<input id="tci-pago" type="date" value="'+(info.fechaPago||'')+'"></div>'
    +'<p style="font-size:12px;color:var(--mut);margin-top:4px;line-height:1.5">'
    +'La <b style="color:var(--txt)">fecha sugerida</b> se calcula automáticamente como la quincena (día 15 o fin de mes) inmediatamente anterior a tu fecha de pago.</p>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="saveTCInfo()">Guardar</button>'
    +'</div>');
}
function saveTCInfo(){
  const m=getM(); const t=getTC(m);
  const nombre=document.getElementById('tci-nombre').value.trim();
  if(nombre) t.nombre=nombre;
  const marcaSel=document.getElementById('tci-marca');
  t.info.marca=marcaSel&&marcaSel.value!=='Ninguna'?marcaSel.value:null;
  t.info.ultimos4=(document.getElementById('tci-ultimos4').value||'').trim().replace(/\D/g,'').slice(-4)||null;
  t.info.cupo=moneyVal('tci-cupo')||null;
  t.info.fechaCorte=document.getElementById('tci-corte').value||null;
  t.info.fechaPago=document.getElementById('tci-pago').value||null;
  save();closeModal();render();toast('Tarjeta actualizada');
}

function calcTCSaldo(m, tcId){
  tcId = tcId || 'tc1';
  var t = (m.tarjetas && m.tarjetas[tcId]) || {movimientos:[]};
  var tc = t.movimientos || [];
  var compras=tc.filter(function(x){return x.tipo==='Compra';}).reduce(function(a,x){return a+Math.abs(x.valor||0);},0);
  var abonos =tc.filter(function(x){return x.tipo==='Abono';}).reduce(function(a,x){return a+Math.abs(x.valor||0);},0);
  return Math.round((compras-abonos)*100)/100;
}
// Sincroniza TODOS los grupos vinculados a cualquier tarjeta (en Q1 y en Q2, si existen en
// ambas). El "Abono TC" (el pago real) solo se crea/actualiza en Q2, porque la fecha sugerida
// de pago siempre cae ahí (ver calcFechaSugerida: siempre es el último día del mes). Si el
// mismo grupo también existe en Q1 (por ejemplo para llevar el seguimiento del saldo ahí),
// su presupuesto se sigue sincronizando, pero no genera su propio "Abono TC" — y si quedó uno
// de una versión anterior de la app (que sí los creaba en ambas quincenas), se elimina.
function syncTCGrupo(m){
  [{which:'q1',list:m.q1_gastos||[]},{which:'q2',list:m.q2_gastos||[]}].forEach(function(entry){
    var which=entry.which, list=entry.list;
    var gruposLigados=list.filter(function(g){return g.esGrupo&&g.tcCardId;});
    if(which==='q1'){
      gruposLigados.forEach(function(g){
        var idx=list.findIndex(function(s){return s.parentId===g.id&&s.nombre==='Abono TC';});
        if(idx>=0) list.splice(idx,1);
      });
    }
    gruposLigados.forEach(function(g){
      var saldo=calcTCSaldo(m, g.tcCardId);
      g.presupuesto=saldo;
      if(which!=='q2') return;
      var abonoGasto=list.find(function(s){return s.parentId===g.id&&s.nombre==='Abono TC';});
      if(abonoGasto){
        if(!abonoGasto.pagado_flag) abonoGasto.presupuesto=saldo;
      } else {
        list.push({
          id:uid(),nombre:'Abono TC',presupuesto:saldo,
          metodo:g.metodo||'BBVA',pagado_real:null,pagado_flag:false,
          sinpagar:false,parentId:g.id,esGrupo:false,tcLinked:false,
          cuotas_total:0,cuota_actual:0
        });
      }
    });
  });
}
function getTC(m, tcId){
  tcId = tcId || curTC || 'tc1';
  if(!m.tarjetas) m.tarjetas = {};
  if(!m.tarjetas[tcId]) m.tarjetas[tcId] = {id:tcId, nombre:'Tarjeta', movimientos:[], info:{fechaCorte:null,fechaPago:null,cupo:null,marca:null,ultimos4:null}};
  return m.tarjetas[tcId];
}
function listTCIds(m){
  return Object.keys(m.tarjetas||{});
}
function saveTC(id){
  const m=getM(); const t=getTC(m);
  const desc=document.getElementById('tc-d').value.trim();
  const val=moneyVal('tc-v');
  const fecha=document.getElementById('tc-f').value;
  const saldo=document.getElementById('tc-s').value!==''?moneyVal('tc-s'):null;
  if(!desc){showAlert('Escribe una descripción');return;}
  const valor=tcTipo==='Abono'?-Math.abs(val):Math.abs(val);
  if(id){const mv=t.movimientos.find(x=>x.id===id);if(mv){mv.descripcion=desc;mv.tipo=tcTipo;mv.valor=valor;mv.fecha=fecha;mv.saldo=saldo;}}
  else t.movimientos.push({id:uid(),descripcion:desc,tipo:tcTipo,valor,fecha,saldo});
  syncTCGrupo(m);
  save();closeModal();render();toast(id?'Movimiento actualizado':'Movimiento agregado');
}
function delTC(id){
  showConfirm('¿Eliminar este movimiento?',function(){
    const m=getM(); const t=getTC(m);
    t.movimientos=(t.movimientos||[]).filter(x=>x.id!==id);
    syncTCGrupo(m);
    save();closeModal();render();toast('Eliminado');
  });
}
function editTC(id){
  const m=getM(),t=getTC(m),mv=(t.movimientos||[]).find(x=>x.id===id);
  if(mv){tcTipo=mv.tipo;openTCModal(mv);}
}

// ── Editar básico y bonos ─────────────────────────────────────────────────────
function editBasico(){
  const m=getM(), n=getNom(m);
  const mi=MESES.indexOf(m.nombre), dias=mi>=0?diasQ2(m.año,mi):15;
  const infoTxt='Q1 = básico ÷ 2 &nbsp;·&nbsp; Q2 = básico ÷ 30 × '+dias+' días ('+m.nombre+')';
  openModal('<div class="mtitle">Editar básico y bonos</div>'
    +'<p style="font-size:12px;color:var(--mut);line-height:1.5;margin-bottom:14px">'
    +'Ingresa los valores <b style="color:var(--txt)">totales del mes</b>. Los bonos son solo informativos.<br><br>'
    +'<b style="color:var(--txt)">'+infoTxt+'</b></p>'
    +'<div class="field"><label>Básico total mes</label>'
    +'<input id="b-bt" type="text" inputmode="numeric" value="'+moneyInputFmt(n.basico_total)+'" oninput="maskMoneyInput(this)"></div>'
    +'<div class="field"><label>Bonos total mes (solo informativo)</label>'
    +'<input id="b-bon" type="text" inputmode="numeric" value="'+moneyInputFmt(n.bonos_total)+'" oninput="maskMoneyInput(this)"></div>'
    +'<div class="macts"><button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="saveBasico()">Guardar</button></div>');
}
function saveBasico(){
  const m=getM(),n=m.nomina;
  const bt =moneyVal('b-bt');
  const bon=moneyVal('b-bon');
  n.basico_total=bt; n.bonos_total=bon;
  // Q1 y Q2 se calculan automáticamente con la fórmula
  n.basico_q1=basicoQ1({nombre:m.nombre,año:m.año,nomina:{basico_total:bt}});
  n.basico_q2=basicoQ2({nombre:m.nombre,año:m.año,nomina:{basico_total:bt}});
  n.bonos_q1=Math.round(bon/2); n.bonos_q2=Math.round(bon/2);
  save();closeModal();render();toast('Nómina actualizada');
}

// ── CRUD Deducciones ──────────────────────────────────────────────────────────
function toggleNomDed(key){
  nomDedOpen[key]=!nomDedOpen[key];
  document.getElementById('scroll').innerHTML=renderNom(getM());
}

// Selector opcional "crédito por deducción de nómina" (ej. libranzas tipo "PrestaFE"): al
// elegir un crédito, sugiere (sin bloquear) el valor de su próxima cuota pendiente.
function dedCreditoFieldHtml(selectedId){
  const ids=Object.keys(creditos);
  if(!ids.length) return '';
  const opts='<option value="">— Ninguno —</option>'+ids.map(function(cid){
    var cr=creditos[cid];
    return '<option value="'+cid+'"'+(selectedId===cid?' selected':'')+'>'+esc(cr.nombre)+'</option>';
  }).join('');
  return '<div class="field"><label>¿Es cuota de un crédito por nómina? (opcional)</label>'
    +'<select id="d-credito" onchange="sugerirValorDedCredito()">'+opts+'</select></div>';
}
function sugerirValorDedCredito(){
  const sel=document.getElementById('d-credito');
  if(!sel||!sel.value) return;
  const cr=creditos[sel.value]; if(!cr) return;
  const amort=calcAmortizacion(cr);
  const pagos=cr.pagos||[];
  var idx=amort.rows.findIndex(function(r,i){return !pagos[i];});
  if(idx===-1) idx=amort.rows.length-1;
  const row=amort.rows[idx];
  const vEl=document.getElementById('d-v');
  if(vEl) setMoneyValue(vEl,row.valorCuota);
  const nEl=document.getElementById('d-n');
  if(nEl && !nEl.value.trim()) nEl.value=cr.nombre;
}
// Encuentra la cuota libre más próxima de un crédito para vincularla a una deducción de
// nómina, sin chocar con OTRA deducción del mismo mes ya vinculada al mismo crédito (caso de
// un crédito quincenal con una deducción en Q1 y otra en Q2, cada una en su propia cuota).
function siguienteCuotaLibreCredito(creditoId, nom, which, excludeIdx){
  const cr=creditos[creditoId]; if(!cr) return null;
  const amort=calcAmortizacion(cr);
  const pagos=cr.pagos||[];
  const usadas={};
  ['ded_q1','ded_q2'].forEach(function(key){
    (nom[key]||[]).forEach(function(d,idx){
      if(key===(which==='q1'?'ded_q1':'ded_q2') && idx===excludeIdx) return; // es la misma deducción que se está guardando
      if(d.creditoId===creditoId && d.numCuota) usadas[d.numCuota]=true;
    });
  });
  for(var k=0;k<amort.rows.length;k++){
    var numero=amort.rows[k].numero;
    if(!pagos[k] && !usadas[numero]) return numero;
  }
  return amort.rows.length?amort.rows[amort.rows.length-1].numero:null;
}
function editDed(e,lbl,i){
  e.stopPropagation();
  const n=getNom(getM()),deds=lbl.includes('Q1')?n.ded_q1:n.ded_q2,d=deds[i];
  _dedTipo=d.tipo||'resta';
  const isSuma=d.tipo==='suma';
  const rCls=!isSuma?' sc':'', sCls=isSuma?' sa':'';
  openModal('<div class="mtitle">Editar deducción</div>'
    +'<div class="field"><label>Nombre</label><input id="d-n" value="'+esc(d.nombre)+'"></div>'
    +'<div class="trow2">'
    +'<button class="topt'+rCls+'" id="d-resta" onclick="setDedTipo(\'resta\')">− Resta</button>'
    +'<button class="topt'+sCls+'" id="d-suma" onclick="setDedTipo(\'suma\')">+ Suma</button>'
    +'</div>'
    +'<div class="field"><label>Porcentaje (ej: 0.04 = 4%)</label><input id="d-p" type="number" step="0.001" value="'+(d.porcentaje||'')+'"></div>'
    +'<div class="field"><label>Valor fijo</label><input id="d-v" type="text" inputmode="numeric" value="'+moneyInputFmt(d.valor_fijo)+'" oninput="maskMoneyInput(this)"></div>'
    +dedCreditoFieldHtml(d.creditoId||null)
    +'<div class="macts"><button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="saveDed(\''+lbl+'\','+i+')">Guardar</button></div>'
    +'<button class="bdel" onclick="delDed(\''+lbl+'\','+i+')">Eliminar deducción</button>');
}
function addDed(lbl){
  _dedTipo='resta';
  openModal('<div class="mtitle">Nueva deducción / ingreso</div>'
    +'<div class="field"><label>Nombre</label><input id="d-n" placeholder="Prima, Salud, Bono..."></div>'
    +'<div class="trow2">'
    +'<button class="topt sc" id="d-resta" onclick="setDedTipo(\'resta\')">− Resta</button>'
    +'<button class="topt" id="d-suma" onclick="setDedTipo(\'suma\')">+ Suma</button>'
    +'</div>'
    +'<div class="field"><label>Porcentaje (ej: 0.04 = 4%)</label><input id="d-p" type="number" step="0.001"></div>'
    +'<div class="field"><label>Valor fijo</label><input id="d-v" type="text" inputmode="numeric" oninput="maskMoneyInput(this)"></div>'
    +dedCreditoFieldHtml(null)
    +'<div class="macts"><button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="saveDed(\''+lbl+'\',-1)">Agregar</button></div>');
}
let _dedTipo = 'resta';
function setDedTipo(t) {
  _dedTipo = t;
  const r=document.getElementById('d-resta'), s=document.getElementById('d-suma');
  if(r) r.className = 'topt' + (t==='resta'?' sc':'');
  if(s) s.className = 'topt' + (t==='suma'?' sa':'');
}
function saveDed(lbl,i){
  const n=getNom(getM()),deds=lbl.includes('Q1')?n.ded_q1:n.ded_q2;
  const nombre=document.getElementById('d-n').value.trim();
  const pct=parseFloat(document.getElementById('d-p').value)||null;
  const vf=moneyVal('d-v')||null;
  if(!nombre){showAlert('Escribe un nombre');return;}
  const entry={nombre,porcentaje:pct,valor_fijo:vf,tipo:_dedTipo};
  const credSel=document.getElementById('d-credito');
  const creditoId=credSel&&credSel.value?credSel.value:null;
  if(creditoId){
    entry.creditoId=creditoId;
    entry.numCuota=siguienteCuotaLibreCredito(creditoId, n, lbl.includes('Q1')?'q1':'q2', i);
    // Es una deducción de nómina: se paga sola cada periodo, no requiere confirmación manual
    // como un gasto — así que la cuota que le corresponde se marca pagada de una vez.
    if(entry.numCuota){
      const cr=creditos[creditoId];
      if(cr){ if(!cr.pagos) cr.pagos=[]; cr.pagos[entry.numCuota-1]=true; }
    }
  }
  if(i===-1)deds.push(entry);
  else deds[i]=entry;
  save();closeModal();render();toast('Guardado');
}
function delDed(lbl,i){
  showConfirm('¿Eliminar esta deducción?',function(){
    const n=getNom(getM()),deds=lbl.includes('Q1')?n.ded_q1:n.ded_q2;
    deds.splice(i,1);save();closeModal();render();toast('Eliminada');
  });
}

// ── Nuevo mes ─────────────────────────────────────────────────────────────────
// ── CATÁLOGOS: Tipos de gasto y Formas de pago ────────────────────────────────
function openCatalogosMenu(){
  openModal('<div class="mtitle">Catálogos</div>'
    +'<div style="display:flex;flex-direction:column">'
    +'<div onclick="openGastoTemplates()" style="display:flex;align-items:center;justify-content:space-between;padding:14px 4px;border-bottom:1px solid var(--brd);cursor:pointer">'
    +'<span style="font-size:14px;color:var(--txt)">Gastos</span>'
    +'<span style="font-size:11px;color:var(--mut)">'+catTipos.length+' ítem(s) ›</span></div>'
    +'<div onclick="openCatList(\'metodos\')" style="display:flex;align-items:center;justify-content:space-between;padding:14px 4px;cursor:pointer">'
    +'<span style="font-size:14px;color:var(--txt)">Formas de pago</span>'
    +'<span style="font-size:11px;color:var(--mut)">'+catMetodos.length+' ítem(s) ›</span></div>'
    +'</div>'
    +'<div class="macts" style="margin-top:14px"><button class="bcnl" style="grid-column:1/-1" onclick="closeModal()">Cerrar</button></div>');
}

function getCat(tipo){ return tipo==='tipos'?catTipos:catMetodos; }
function setCat(tipo,arr){ if(tipo==='tipos') catTipos=arr; else catMetodos=arr; }
function catLabel(tipo){ return tipo==='tipos'?'Gasto':'Forma de pago'; }

// ── Catálogo de Formas de pago (simple: solo nombre) ──────────────────────────
function openCatList(tipo){
  const arr=getCat(tipo);
  const rowsHtml=arr.length?arr.map(function(item){
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 4px;border-bottom:1px solid var(--brd)">'
      +'<span style="font-size:13px;color:var(--txt)">'+esc(item.nombre)+'</span>'
      +'<div style="display:flex;gap:8px">'
      +'<button onclick="editCatItem(\''+tipo+'\',\''+item.id+'\')" style="background:none;border:none;color:var(--mut);cursor:pointer;font-size:13px">✎</button>'
      +'<button onclick="deleteCatItem(\''+tipo+'\',\''+item.id+'\')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:13px">🗑</button>'
      +'</div></div>';
  }).join(''):'<div style="padding:20px;text-align:center;color:var(--mut);font-size:12px">Sin elementos. Agrega el primero.</div>';

  openModal('<div class="mtitle">'+catLabel(tipo)+'s</div>'
    +'<div style="max-height:320px;overflow-y:auto;border:1px solid var(--brd);border-radius:var(--r2);margin-bottom:14px">'+rowsHtml+'</div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openCatalogosMenu()">Volver</button>'
    +'<button class="bpri" onclick="openNewCatItem(\''+tipo+'\')">＋ Agregar</button>'
    +'</div>');
}

function openNewCatItem(tipo){
  openModal('<div class="mtitle">Nueva: '+catLabel(tipo)+'</div>'
    +'<div class="field"><label>Nombre</label><input id="cat-nombre" placeholder="Ej: Daviplata, Efectivo..."></div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openCatList(\''+tipo+'\')">Cancelar</button>'
    +'<button class="bpri" onclick="saveNewCatItem(\''+tipo+'\')">Guardar</button>'
    +'</div>');
}

function saveNewCatItem(tipo){
  const nombre=document.getElementById('cat-nombre').value.trim();
  if(!nombre){showAlert('Escribe un nombre');return;}
  const arr=getCat(tipo);
  if(arr.some(function(i){return i.nombre.toLowerCase()===nombre.toLowerCase();})){
    showAlert('Ya existe ese ítem');return;
  }
  arr.push({id:uid(),nombre:nombre});
  setCat(tipo,arr);
  save();openCatList(tipo);toast('Agregado');
}

function editCatItem(tipo,id){
  const arr=getCat(tipo);
  const item=arr.find(function(i){return i.id===id;});
  if(!item) return;
  openModal('<div class="mtitle">Editar: '+catLabel(tipo)+'</div>'
    +'<div class="field"><label>Nombre</label><input id="cat-edit-nombre" value="'+esc(item.nombre)+'"></div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openCatList(\''+tipo+'\')">Cancelar</button>'
    +'<button class="bpri" onclick="saveEditCatItem(\''+tipo+'\',\''+id+'\')">Guardar</button>'
    +'</div>');
}

function saveEditCatItem(tipo,id){
  const nuevoNombre=document.getElementById('cat-edit-nombre').value.trim();
  if(!nuevoNombre){showAlert('Escribe un nombre');return;}
  const arr=getCat(tipo);
  const item=arr.find(function(i){return i.id===id;});
  if(!item) return;
  const nombreViejo=item.nombre;
  item.nombre=nuevoNombre;
  setCat(tipo,arr);
  if(tipo==='metodos'){
    // La forma de pago se guarda como texto en cada gasto (no por id), así que
    // al renombrarla hay que propagar el cambio a los gastos existentes.
    Object.keys(db).forEach(function(k){
      var mes=db[k];
      [mes.q1_gastos||[], mes.q2_gastos||[]].forEach(function(list){
        list.forEach(function(g){ if(g.metodo===nombreViejo) g.metodo=nuevoNombre; });
      });
    });
  }
  // 'tipos' se referencia por id (catTipoId), así que renombrar el catálogo no requiere
  // tocar los gastos existentes.
  save();render();openCatList(tipo);toast('Actualizado');
}

function deleteCatItem(tipo,id){
  showConfirm('¿Eliminar este ítem del catálogo? Los gastos ya creados quedan desvinculados, conservando su último nombre.',function(){
    const arr=getCat(tipo).filter(function(i){return i.id!==id;});
    setCat(tipo,arr);
    if(tipo==='tipos'){
      // Los gastos que estaban vinculados a esta plantilla se desvinculan (ya no hay
      // nada con qué sincronizarlos); conservan el último nombre que tenían.
      Object.keys(db).forEach(function(k){
        var mes=db[k];
        [mes.q1_gastos||[], mes.q2_gastos||[]].forEach(function(list){
          list.forEach(function(g){ if(g.catTipoId===id){ g.catTipoId=null; } });
        });
      });
      save();render();openGastoTemplates();toast('Eliminado');
    } else {
      save();openCatList(tipo);toast('Eliminado');
    }
  });
}

// ── Catálogo de Gastos (plantillas completas: presupuesto, método, cuotas, mensualidad) ──
function seedGastosDesdeUltimoMes(){
  const keys=Object.keys(db).map(Number);
  if(!keys.length){ toast('No hay meses creados aún'); return; }
  const lastKey=Math.max(...keys);
  const lm=db[lastKey];
  const todos=[...(lm.q1_gastos||[]),...(lm.q2_gastos||[])].filter(function(g){
    return !g.parentId && !g.esGrupo && !g.creditoId; // excluir subgastos, grupos y cuotas de crédito
  });

  var agregados=0, omitidos=0, metodosNuevos=0;
  todos.forEach(function(g){
    // Asegurar que la forma de pago usada exista en su catálogo
    if(g.metodo){
      var metodoExiste=catMetodos.some(function(m){return m.nombre.toLowerCase()===g.metodo.toLowerCase();});
      if(!metodoExiste){
        catMetodos.push({id:uid(),nombre:g.metodo});
        metodosNuevos++;
      }
    }
    var yaExiste=catTipos.some(function(t){return t.nombre.toLowerCase()===g.nombre.toLowerCase();});
    if(yaExiste){ omitidos++; return; }
    catTipos.push({
      id:uid(),
      nombre:g.nombre,
      presupuesto:g.presupuesto||null,
      metodo:g.metodo||null,
      cuotas_total:0, // no copiamos cuotas: cada plantilla es genérica, no atada a un avance específico
      esMensualidad:!!g.mensualidad
    });
    agregados++;
  });

  save();
  openGastoTemplates();
  var msg=agregados+' gasto(s) agregado(s)';
  if(omitidos) msg+=' · '+omitidos+' ya existían';
  if(metodosNuevos) msg+=' · '+metodosNuevos+' forma(s) de pago nuevas';
  toast(msg);
}

function openGastoTemplates(){
  const rowsHtml=catTipos.length?catTipos.map(function(item){
    var detalle=[];
    if(item.presupuesto) detalle.push(cop(item.presupuesto));
    if(item.metodo) detalle.push(esc(item.metodo));
    if(item.cuotas_total>0) detalle.push(item.cuotas_total+' cuotas');
    if(item.esMensualidad) detalle.push('mensualidad');
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 4px;border-bottom:1px solid var(--brd)">'
      +'<div style="min-width:0">'
      +'<div style="font-size:13px;color:var(--txt)">'+esc(item.nombre)+'</div>'
      +(detalle.length?'<div style="font-size:10px;color:var(--mut);margin-top:1px">'+detalle.join(' · ')+'</div>':'')
      +'</div>'
      +'<div style="display:flex;gap:8px;flex-shrink:0">'
      +'<button onclick="editGastoTemplate(\''+item.id+'\')" style="background:none;border:none;color:var(--mut);cursor:pointer;font-size:13px">✎</button>'
      +'<button onclick="deleteCatItem(\'tipos\',\''+item.id+'\')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:13px">🗑</button>'
      +'</div></div>';
  }).join(''):'<div style="padding:20px;text-align:center;color:var(--mut);font-size:12px">Sin gastos guardados. Crea plantillas para reutilizar al registrar gastos.</div>';

  openModal('<div class="mtitle">Gastos (plantillas)</div>'
    +'<p style="font-size:12px;color:var(--mut);line-height:1.5;margin-bottom:12px">Guarda gastos frecuentes con su valor, forma de pago y cuotas para no escribirlos cada vez. Son opcionales: en el formulario siempre puedes escribir un nombre libre.</p>'
    +'<div style="display:flex;justify-content:flex-end;margin-bottom:8px">'
    +'<button onclick="seedGastosDesdeUltimoMes()" style="background:var(--surf2);border:1px solid var(--brd2);border-radius:20px;padding:5px 12px;font-size:11px;color:var(--acc);cursor:pointer">↻ Crear desde el último mes</button>'
    +'</div>'
    +'<div style="max-height:320px;overflow-y:auto;border:1px solid var(--brd);border-radius:var(--r2);margin-bottom:14px">'+rowsHtml+'</div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openCatalogosMenu()">Volver</button>'
    +'<button class="bpri" onclick="openNewGastoTemplate()">＋ Agregar</button>'
    +'</div>');
}

function gastoTemplateForm(item){
  item = item || {nombre:'',presupuesto:'',metodo:'',cuotas_total:'',esMensualidad:false};
  const metodoOpts='<option value="">— Ninguna —</option>'+catMetodos.map(function(m){
    return '<option'+(item.metodo===m.nombre?' selected':'')+'>'+esc(m.nombre)+'</option>';
  }).join('');
  return '<div class="field"><label>Nombre</label><input id="gt-nombre" value="'+esc(item.nombre)+'" placeholder="Ej: Arriendo, Mercado..."></div>'
    +'<div class="field"><label>Presupuesto (opcional)</label><input id="gt-presupuesto" type="text" inputmode="numeric" value="'+moneyInputFmt(item.presupuesto)+'" placeholder="Ej: 950.000" oninput="maskMoneyInput(this)"></div>'
    +'<div class="field"><label>Forma de pago asociada (opcional)</label><select id="gt-metodo">'+metodoOpts+'</select></div>'
    +'<div class="field"><label>Cuotas (opcional)</label><input id="gt-cuotas" type="number" min="0" value="'+(item.cuotas_total||'')+'" placeholder="Ej: 10"></div>'
    +'<div class="cbx-row"><input type="checkbox" id="gt-mens"'+(item.esMensualidad?' checked':'')+'>'
    +'<label for="gt-mens" style="font-size:13px;color:var(--txt)">Es una mensualidad (pago adelantado al mes siguiente)</label></div>';
}

function openNewGastoTemplate(){
  openModal('<div class="mtitle">Nuevo gasto</div>'
    +gastoTemplateForm()
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openGastoTemplates()">Cancelar</button>'
    +'<button class="bpri" onclick="saveNewGastoTemplate()">Guardar</button>'
    +'</div>');
}

function saveNewGastoTemplate(){
  const nombre=document.getElementById('gt-nombre').value.trim();
  if(!nombre){showAlert('Escribe un nombre');return;}
  if(catTipos.some(function(i){return i.nombre.toLowerCase()===nombre.toLowerCase();})){
    showAlert('Ya existe un gasto con ese nombre');return;
  }
  catTipos.push({
    id:uid(),
    nombre:nombre,
    presupuesto:moneyVal('gt-presupuesto')||null,
    metodo:document.getElementById('gt-metodo').value||null,
    cuotas_total:parseInt(document.getElementById('gt-cuotas').value)||0,
    esMensualidad:document.getElementById('gt-mens').checked
  });
  save();openGastoTemplates();toast('Gasto agregado');
}

function editGastoTemplate(id){
  const item=catTipos.find(function(i){return i.id===id;});
  if(!item) return;
  openModal('<div class="mtitle">Editar gasto</div>'
    +gastoTemplateForm(item)
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openGastoTemplates()">Cancelar</button>'
    +'<button class="bpri" onclick="saveEditGastoTemplate(\''+id+'\')">Guardar</button>'
    +'</div>');
}

function saveEditGastoTemplate(id){
  const item=catTipos.find(function(i){return i.id===id;});
  if(!item) return;
  const nuevoNombre=document.getElementById('gt-nombre').value.trim();
  if(!nuevoNombre){showAlert('Escribe un nombre');return;}
  item.nombre=nuevoNombre;
  item.presupuesto=moneyVal('gt-presupuesto')||null;
  item.metodo=document.getElementById('gt-metodo').value||null;
  item.cuotas_total=parseInt(document.getElementById('gt-cuotas').value)||0;
  item.esMensualidad=document.getElementById('gt-mens').checked;
  // Integridad estricta: solo se actualizan los gastos VINCULADOS a esta plantilla
  // (catTipoId === id). Los gastos de libre ingreso, aunque tengan un nombre parecido,
  // nunca se tocan porque no comparten ese vínculo.
  var actualizados=0;
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    [mes.q1_gastos||[], mes.q2_gastos||[]].forEach(function(list){
      list.forEach(function(g){
        if(g.catTipoId===id){ g.nombre=nuevoNombre; actualizados++; }
      });
    });
  });
  save();render();openGastoTemplates();
  toast(actualizados>0?('Actualizado · '+actualizados+' gasto(s) vinculado(s) sincronizado(s)'):'Actualizado');
}


function openOverflowMenu(){
  const icCloud='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>';
  const icTrash='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';
  const icList='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>';
  const icLock='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  openModal('<div class="mtitle">Más opciones</div>'
    +'<div style="display:flex;flex-direction:column">'
    +'<div onclick="closeModal();openCatalogosMenu()" style="display:flex;align-items:center;gap:14px;padding:14px 4px;border-bottom:1px solid var(--brd);cursor:pointer;color:var(--acc)">'
    +icList+'<span style="font-size:14px;color:var(--txt)">Catálogos</span></div>'
    +'<div onclick="closeModal();openBackupMenu()" style="display:flex;align-items:center;gap:14px;padding:14px 4px;border-bottom:1px solid var(--brd);cursor:pointer;color:var(--acc)">'
    +icCloud+'<span style="font-size:14px;color:var(--txt)">Respaldar información</span></div>'
    +'<div onclick="closeModal();openSecurityMenu()" style="display:flex;align-items:center;gap:14px;padding:14px 4px;border-bottom:1px solid var(--brd);cursor:pointer;color:var(--acc)">'
    +icLock+'<span style="font-size:14px;color:var(--txt)">Seguridad</span></div>'
    +'<div onclick="closeModal();openDeleteMonth()" style="display:flex;align-items:center;gap:14px;padding:14px 4px;cursor:pointer;color:var(--red)">'
    +icTrash+'<span style="font-size:14px;color:var(--red)">Eliminar mes</span></div>'
    +'</div>'
    +'<div class="macts" style="margin-top:14px"><button class="bcnl" style="grid-column:1/-1" onclick="closeModal()">Cerrar</button></div>');
}

function openInfoGeneral(){
  // Recolectar el básico de cada mes del año actual (Enero a Diciembre)
  const año=getM().año;
  const mesesDelAño={};
  const bonosDelAño={};
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    if(mes.año===año){
      var idx=MESES.indexOf(mes.nombre);
      if(idx>=0){
        mesesDelAño[idx]=mes.nomina?mes.nomina.basico_total||0:0;
        bonosDelAño[idx]=mes.nomina?mes.nomina.bonos_total||0:0;
      }
    }
  });

  // Para meses sin crear, sugerir el básico del último mes existente anterior
  var basicoConSugerido={};
  var bonoConSugerido={};
  var ultimoBasico=null;
  var ultimoBono=null;
  var esSugerido={};
  for(var i=0;i<=11;i++){
    if(mesesDelAño[i]!==undefined){
      basicoConSugerido[i]=mesesDelAño[i];
      bonoConSugerido[i]=bonosDelAño[i]||0;
      ultimoBasico=mesesDelAño[i];
      ultimoBono=bonosDelAño[i]||0;
      esSugerido[i]=false;
    } else if(ultimoBasico!==null){
      basicoConSugerido[i]=ultimoBasico;
      bonoConSugerido[i]=ultimoBono;
      esSugerido[i]=true;
    } else {
      basicoConSugerido[i]=0;
      bonoConSugerido[i]=0;
      esSugerido[i]=true;
    }
  }

  // Construir tabla de los 12 meses: Mes | Básico | Prom. Mensual (aporte a prima)
  var tableRows=MESES.map(function(nombre,i){
    var basico=basicoConSugerido[i];
    var bono=bonoConSugerido[i];
    var sugerido=esSugerido[i];
    var aportePrima=(basico*30)/360;
    // % de cambio del básico respecto al mes anterior
    var cambioBasicoHtml='';
    if(i>0 && !sugerido && !esSugerido[i-1]){
      var basicoAnterior=basicoConSugerido[i-1];
      if(basicoAnterior>0 && basico!==basicoAnterior){
        var pctB=((basico-basicoAnterior)/basicoAnterior)*100;
        var subioB=pctB>0;
        cambioBasicoHtml='<span style="font-size:10px;font-weight:700;color:var(--'+(subioB?'grn':'red')+');margin-left:6px">'
          +(subioB?'▲':'▼')+' '+Math.abs(pctB).toFixed(1)+'%</span>';
      }
    }
    // % de cambio del bono respecto al mes anterior
    var cambioBonoHtml='';
    if(i>0 && !sugerido && !esSugerido[i-1]){
      var bonoAnterior=bonoConSugerido[i-1];
      if(bonoAnterior>0 && bono!==bonoAnterior){
        var pctBo=((bono-bonoAnterior)/bonoAnterior)*100;
        var subioBo=pctBo>0;
        cambioBonoHtml='<span style="font-size:10px;font-weight:700;color:var(--'+(subioBo?'grn':'red')+');margin-left:6px">'
          +(subioBo?'▲':'▼')+' '+Math.abs(pctBo).toFixed(1)+'%</span>';
      }
    }
    return '<tr style="border-bottom:1px solid var(--brd)">'
      +'<td style="padding:7px 10px;font-size:12px;color:var(--txt)">'+nombre+(sugerido?'<span style="font-size:9px;color:var(--amb);margin-left:4px">(sug.)</span>':'')+'</td>'
      +'<td style="padding:7px 10px;font-size:12px;text-align:right;color:'+(sugerido?'var(--mut)':'var(--txt)')+'">'+cop(basico)+cambioBasicoHtml+'</td>'
      +'<td style="padding:7px 10px;font-size:12px;text-align:right;color:var(--acc);font-weight:600">'+cop(aportePrima)+'</td>'
      +'<td style="padding:7px 10px;font-size:12px;text-align:right;color:'+(sugerido?'var(--mut)':'var(--pur)')+'">'+cop(bono)+cambioBonoHtml+'</td>'
      +'</tr>';
  }).join('');
  var tableHtml='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse">'
    +'<thead><tr style="border-bottom:1px solid var(--brd2)">'
    +'<th style="padding:6px 10px;font-size:10px;color:var(--mut);text-align:left;text-transform:uppercase;letter-spacing:.04em">Mes</th>'
    +'<th style="padding:6px 10px;font-size:10px;color:var(--mut);text-align:right;text-transform:uppercase;letter-spacing:.04em">Básico</th>'
    +'<th style="padding:6px 10px;font-size:10px;color:var(--mut);text-align:right;text-transform:uppercase;letter-spacing:.04em">Prom. Mensual</th>'
    +'<th style="padding:6px 10px;font-size:10px;color:var(--mut);text-align:right;text-transform:uppercase;letter-spacing:.04em">Bonos</th>'
    +'</tr></thead><tbody>'+tableRows+'</tbody></table></div>';

  // Prima primer semestre: (Enero*30/360) + (Febrero*30/360) + ... + (Junio*30/360)
  var primaS1=0, s1TieneSugeridos=false;
  for(var i=0;i<=5;i++){
    primaS1 += (basicoConSugerido[i]*30)/360;
    if(esSugerido[i]) s1TieneSugeridos=true;
  }
  // Prima segundo semestre: (Julio*30/360) + ... + (Diciembre*30/360)
  var primaS2=0, s2TieneSugeridos=false;
  for(var i=6;i<=11;i++){
    primaS2 += (basicoConSugerido[i]*30)/360;
    if(esSugerido[i]) s2TieneSugeridos=true;
  }
  primaS1=Math.round(primaS1);
  primaS2=Math.round(primaS2);

  // Cesantías: suma de los 12 promedios mensuales (básico*30/360) de todo el año
  var sumaCesantias=0, añoTieneSugeridos=false;
  for(var i=0;i<=11;i++){
    sumaCesantias += (basicoConSugerido[i]*30)/360;
    if(esSugerido[i]) añoTieneSugeridos=true;
  }
  var cesantias=Math.round(sumaCesantias);
  var interesesCesantias=Math.round(cesantias*0.12);
  var avisoAño=añoTieneSugeridos?'<div style="font-size:11px;color:var(--amb);margin-top:2px">⚠ Incluye meses sugeridos (sin crear aún)</div>':'';

  var resumenPills='<div class="card" style="margin-bottom:10px">'
    +'<div class="chead"><span class="ctitle">Resumen anual</span></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px">'
    +'<button onclick="toggleFormula(\'fx-primaj\')" style="background:var(--surf2);border:none;border-radius:var(--r2);padding:10px;text-align:left;cursor:pointer">'
    +'<div style="font-size:10px;color:var(--mut);text-transform:uppercase;letter-spacing:.04em">Prima Junio</div>'
    +'<div style="font-size:15px;font-weight:700;color:var(--txt);margin-top:2px">'+cop(primaS1)+'</div>'
    +'</button>'
    +'<button onclick="toggleFormula(\'fx-primad\')" style="background:var(--surf2);border:none;border-radius:var(--r2);padding:10px;text-align:left;cursor:pointer">'
    +'<div style="font-size:10px;color:var(--mut);text-transform:uppercase;letter-spacing:.04em">Prima Diciembre</div>'
    +'<div style="font-size:15px;font-weight:700;color:var(--txt);margin-top:2px">'+cop(primaS2)+'</div>'
    +'</button>'
    +'<button onclick="toggleFormula(\'fx-cesantias\')" style="background:var(--surf2);border:none;border-radius:var(--r2);padding:10px;text-align:left;cursor:pointer">'
    +'<div style="font-size:10px;color:var(--mut);text-transform:uppercase;letter-spacing:.04em">Cesantías</div>'
    +'<div style="font-size:15px;font-weight:700;color:var(--txt);margin-top:2px">'+cop(cesantias)+'</div>'
    +'</button>'
    +'<button onclick="toggleFormula(\'fx-intereses\')" style="background:var(--surf2);border:none;border-radius:var(--r2);padding:10px;text-align:left;cursor:pointer">'
    +'<div style="font-size:10px;color:var(--mut);text-transform:uppercase;letter-spacing:.04em">Int. cesantías</div>'
    +'<div style="font-size:15px;font-weight:700;color:var(--txt);margin-top:2px">'+cop(interesesCesantias)+'</div>'
    +'</button>'
    +'</div>'
    +'<div id="fx-primaj" style="display:none;padding:0 16px 10px;font-size:11px;color:var(--acc)">Enero a Junio: Σ (básico × 30 ÷ 360)'+(s1TieneSugeridos?' · incluye meses sugeridos':'')+'</div>'
    +'<div id="fx-primad" style="display:none;padding:0 16px 10px;font-size:11px;color:var(--acc)">Julio a Diciembre: Σ (básico × 30 ÷ 360)'+(s2TieneSugeridos?' · incluye meses sugeridos':'')+'</div>'
    +'<div id="fx-cesantias" style="display:none;padding:0 16px 10px;font-size:11px;color:var(--acc)">Enero a Diciembre: Σ (básico × 30 ÷ 360)'+(añoTieneSugeridos?' · incluye meses sugeridos':'')+'</div>'
    +'<div id="fx-intereses" style="display:none;padding:0 16px 10px;font-size:11px;color:var(--acc)">Cesantías × 0.12 = '+cop(cesantias)+' × 0.12</div>'
    +'</div>';

  openModal('<div class="mtitle">Información general '+año+'</div>'
    +'<p style="font-size:12px;color:var(--mut);line-height:1.5;margin-bottom:14px">'
    +'Básico mensual de cada mes del año y cálculo de prima de servicios (básico ÷ 30, sumado por semestre). Los meses sin crear toman el básico del último mes existente como sugerencia.</p>'
    +'<div class="card" style="margin-bottom:10px">'
    +'<div class="chead"><span class="ctitle">Básico por mes</span></div>'
    +tableHtml
    +'</div>'
    +resumenPills
    +'<div class="macts" style="margin-top:14px"><button class="bcnl" style="grid-column:1/-1" onclick="closeModal()">Cerrar</button></div>');
}

function toggleFormula(id){
  const el=document.getElementById(id);
  if(!el) return;
  el.style.display=el.style.display==='none'?'block':'none';
}

function openMonthPicker(){
  const keys=Object.keys(db).map(Number).sort(function(a,b){return a-b;});
  const monthList=keys.map(function(k){
    const mes=db[k];
    const isCur=k===curM;
    const activos=[...(mes.q1_gastos||[]),...(mes.q2_gastos||[])].filter(function(g){return !g.sinpagar&&!g.esGrupo;});
    const total=activos.reduce(function(a,g){return a+Math.abs(g.presupuesto||0);},0);
    const pagado=activos.filter(function(g){return g.pagado_flag;}).reduce(function(a,g){return a+Math.abs(g.presupuesto||0);},0);
    const pct=total>0?Math.round(pagado/total*100):0;
    const barColor=pct===100?'var(--grn)':pct>50?'var(--amb)':'var(--surf2)';
    return '<div onclick="goToMonth('+k+')" style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--brd);cursor:pointer'+(isCur?'':';opacity:.85')+';">'
      +'<div style="flex:1">'
      +'<div style="font-size:13px;font-weight:'+(isCur?'700':'500')+';color:'+(isCur?'var(--acc)':'var(--txt)')+'">'+mes.nombre+' '+mes.año+'</div>'
      +'<div style="height:4px;background:var(--brd);border-radius:4px;margin-top:5px;overflow:hidden">'
      +'<div style="height:100%;width:'+pct+'%;background:'+barColor+';border-radius:4px;transition:width .3s"></div>'
      +'</div>'
      +'</div>'
      +'<div style="text-align:right;flex-shrink:0">'
      +'<div style="font-size:12px;font-weight:600;color:'+(isCur?'var(--acc)':'var(--mut)')+'">'+pct+'%</div>'
      +'<div style="font-size:10px;color:var(--mut)">'+(isCur?'actual':'')+'</div>'
      +'</div>'
      +'</div>';
  }).join('');
  openModal('<div class="mtitle">Seleccionar mes</div>'+monthList);
}


function goToMonth(k){
  curM=k;
  gFiltro={q1:'todos',q2:'todos'};
  gSort={q1:'orden',q2:'orden'};
  gFilterOpen={q1:false,q2:false};
  curTC=null;
  closeModal();render();
}

function openDeleteMonth(){
  const keys=Object.keys(db).map(Number);
  const m=getM();
  // Can't delete if only one month left
  if(keys.length<=1){
    openModal('<div class="mtitle">No se puede eliminar</div>'
      +'<p style="font-size:13px;color:var(--mut);margin-bottom:16px">Debe quedar al menos un mes en la app.</p>'
      +'<div class="macts"><button class="bcnl" style="grid-column:1/-1" onclick="closeModal()">Cerrar</button></div>');
    return;
  }
  // Build list of all months
  const monthList=keys.sort(function(a,b){return a-b;}).map(function(k){
    const mes=db[k];
    const gastos=(mes.q1_gastos||[]).length+(mes.q2_gastos||[]).length;
    const tc=Object.values(mes.tarjetas||{}).reduce(function(a,t){return a+(t.movimientos||[]).length;},0);
    const isCur=k===curM;
    return '<div onclick="confirmDeleteMonth('+k+')" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--brd);cursor:pointer'+(isCur?';background:var(--acc-d);margin:0 -18px;padding:10px 18px':'')+';">'
      +'<div>'
      +'<div style="font-size:13px;font-weight:600;color:var(--txt)">'+mes.nombre+' '+mes.año+(isCur?' <span style="font-size:10px;color:var(--acc)">actual</span>':'')+'</div>'
      +'<div style="font-size:11px;color:var(--mut);margin-top:1px">'+gastos+' gastos · '+tc+' mov. tarjeta</div>'
      +'</div>'
      +'<span style="color:var(--red);font-size:16px;padding-left:12px">🗑</span>'
      +'</div>';
  }).join('');
  openModal('<div class="mtitle">Eliminar mes</div>'
    +'<p style="font-size:12px;color:var(--mut);margin-bottom:12px">Selecciona el mes que deseas eliminar. Esta acción no se puede deshacer.</p>'
    +monthList);
}

function confirmDeleteMonth(key){
  const mes=db[key];
  openModal('<div class="mtitle">¿Eliminar '+mes.nombre+'?</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:16px">'
    +'Se eliminarán todos los datos de <b style="color:var(--txt)">'+mes.nombre+' '+mes.año+'</b> incluyendo gastos, tarjeta y nómina. Esta acción <b style="color:var(--red)">no se puede deshacer</b>.</p>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openDeleteMonth()">Cancelar</button>'
    +'<button class="bpri" style="background:var(--red);color:#fff" onclick="deleteMonth('+key+')">Eliminar</button>'
    +'</div>');
}

function deleteMonth(key){
  const keys=Object.keys(db).map(Number);
  if(keys.length<=1){closeModal();return;}
  delete db[key];
  // Reindex to keep keys sequential
  const sorted=Object.keys(db).map(Number).sort(function(a,b){return a-b;});
  const newDb={};
  sorted.forEach(function(k,i){ newDb[i]=db[k]; });
  db=newDb;
  // Adjust curM
  const newKeys=Object.keys(db).map(Number);
  curM=Math.min(curM,Math.max(...newKeys));
  gFiltro={q1:'todos',q2:'todos'};
  gSort={q1:'orden',q2:'orden'};
  gFilterOpen={q1:false,q2:false};
  save();closeModal();render();toast('Mes eliminado');
}

function openNewMonth(){
  const keys=Object.keys(db).map(Number),last=Math.max(...keys),lm=db[last];
  const sig=MESES[MESES.indexOf(lm.nombre)+1]||('Mes '+(last+2));
  openModal('<div class="mtitle">Nuevo mes</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:16px">'
    +'Se creará <b style="color:var(--txt)">'+sig+' '+lm.año+'</b> copiando la estructura de <b style="color:var(--txt)">'+lm.nombre+'</b>. Los gastos quedan pendientes y la tarjeta empieza vacía.</p>'
    +'<div class="macts"><button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="createMonth()">Crear '+sig+'</button></div>');
}
function generarGastosCredito(nm){
  // Para cada crédito activo, revisar si alguna cuota cae en el mes nm
  const mi=MESES.indexOf(nm.nombre);
  const año=nm.año;
  if(!Array.isArray(nm.q1_gastos)) nm.q1_gastos=[];
  if(!Array.isArray(nm.q2_gastos)) nm.q2_gastos=[];
  Object.keys(creditos).forEach(function(crId){
    var cr=creditos[crId];
    var amort=calcAmortizacion(cr);
    amort.rows.forEach(function(row,idx){
      var fecha=new Date(row.fecha+'T12:00:00');
      if(fecha.getFullYear()===año && fecha.getMonth()===mi){
        var dia=fecha.getDate();
        var which=dia<=15?'q1':'q2';
        var list=which==='q1'?nm.q1_gastos:nm.q2_gastos;
        // Evitar duplicar: revisar en AMBAS listas (q1 y q2) del mes
        var yaExiste=nm.q1_gastos.some(function(g){return g.creditoId===crId&&g.numCuota===row.numero;})
                  || nm.q2_gastos.some(function(g){return g.creditoId===crId&&g.numCuota===row.numero;});
        if(!yaExiste){
          list.push({
            id:uid(),
            nombre:'Crédito '+cr.nombre,
            presupuesto:row.valorCuota,
            metodo:'Nequi',
            pagado_real:null,
            pagado_flag:!!(cr.pagos&&cr.pagos[idx]),
            sinpagar:false,
            parentId:null,
            esGrupo:false,
            cuotas_total:cr.cuotas,
            cuota_actual:row.numero,
            creditoId:crId,
            numCuota:row.numero,
            fecha_pago:null,
            comprobante:null
          });
        }
      }
    });
  });
}

function buildDraftMonth(){
  const keys=Object.keys(db).map(Number),last=Math.max(...keys),lm=db[last];
  const nk=last+1;
  const nm=migrateMonth(JSON.parse(JSON.stringify(lm)));
  nm.nombre=MESES[MESES.indexOf(lm.nombre)+1]||('Mes '+(nk+1));

  function advanceDate(dateStr){
    if(!dateStr) return null;
    const d = new Date(dateStr+'T12:00:00');
    d.setMonth(d.getMonth()+1);
    return d.toISOString().slice(0,10);
  }
  Object.keys(nm.tarjetas||{}).forEach(function(tid){
    var t=nm.tarjetas[tid];
    t.movimientos=[];
    t.info={
      fechaCorte: advanceDate(t.info?.fechaCorte),
      fechaPago:  advanceDate(t.info?.fechaPago),
      cupo:       t.info?.cupo||null
    };
  });

  function copyGastos(gastos) {
    const idMap = {};
    const mapped = gastos
      .filter(function(g){
        if(g.creditoId) return false;
        if(g.cuotas_total>0&&g.cuota_actual>=g.cuotas_total&&g.pagado_flag) return false;
        return true;
      })
      .map(function(g){
        const newId = uid();
        if(g.esGrupo) idMap[g.id] = newId;
        var nxtCuota = g.cuotas_total>0&&g.pagado_flag&&g.cuota_actual ? g.cuota_actual+1 : g.cuota_actual||0;
        var nxtMens = null;
        if(g.mensualidad){
          if(g.pagado_flag){
            var mp=g.mensualidad.split('-');
            var mY=parseInt(mp[0]),mM=parseInt(mp[1]);
            mM++; if(mM>12){mM=1;mY++;}
            nxtMens=mY+'-'+(mM<10?'0':'')+mM;
          } else {
            nxtMens=g.mensualidad;
          }
        }
        return Object.assign({},g,{
          id: newId,
          pagado_flag: false,
          pagado_real: null,
          cuota_actual: nxtCuota,
          fecha_pago: null,
          comprobante: null,
          mensualidad: nxtMens
        });
      });
    return mapped.map(function(g){
      if(g.parentId && idMap[g.parentId]){
        return Object.assign({},g,{parentId: idMap[g.parentId]});
      }
      return g;
    });
  }

  nm.q1_gastos = copyGastos(nm.q1_gastos);
  nm.q2_gastos = copyGastos(nm.q2_gastos);

  var prevLinkedGroups=(lm.q2_gastos||[]).filter(function(g){return g.esGrupo&&g.tcCardId;});
  prevLinkedGroups.forEach(function(prevG){
    var stillExists=nm.q2_gastos.some(function(g){return g.esGrupo&&g.tcCardId===prevG.tcCardId;});
    if(!stillExists){
      nm.q2_gastos.push({
        id:uid(),
        nombre:prevG.nombre,
        presupuesto:0,
        metodo:prevG.metodo||'BBVA',
        pagado_real:null,
        pagado_flag:false,
        sinpagar:false,
        parentId:null,
        esGrupo:true,
        tcLinked:true,
        tcCardId:prevG.tcCardId,
        cuotas_total:0,
        cuota_actual:0
      });
    }
  });

  generarGastosCredito(nm);
  syncTCGrupo(nm);
  avanzarDeduccionesCredito(nm);

  return {nk:nk, nm:nm};
}

// Créditos por deducción de nómina (ej. libranzas tipo "PrestaFE"): una deducción con
// creditoId+numCuota representa la cuota de un crédito descontada directo de la nómina.
// Al crear el mes siguiente, la cuota del mes que se cierra se da por descontada (se marca
// pagada en el crédito) y la deducción avanza a la siguiente cuota automáticamente. Si el
// crédito ya se terminó de pagar, la deducción se retira sola (ya no aplica ese descuento).
function avanzarDeduccionesCredito(nm){
  const nom=nm.nomina; if(!nom) return;
  ['ded_q1','ded_q2'].forEach(function(key){
    const list=nom[key]||[];
    for(var idx=list.length-1; idx>=0; idx--){
      var d=list[idx];
      if(!d.creditoId || !d.numCuota) continue;
      var cr=creditos[d.creditoId];
      if(!cr) continue; // el crédito fue eliminado: se deja la deducción tal cual, sin poder avanzarla
      if(!cr.pagos) cr.pagos=[];
      cr.pagos[d.numCuota-1]=true;
      var siguiente=d.numCuota+1;
      if(siguiente>(cr.cuotas||0)){
        list.splice(idx,1);
        continue;
      }
      var amort=calcAmortizacion(cr);
      var row=amort.rows.find(function(r){return r.numero===siguiente;});
      d.numCuota=siguiente;
      if(row) d.valor_fijo=row.valorCuota;
      // La nueva cuota asignada también se da por pagada de una vez (deducción de nómina
      // automática), consistente con lo que ya hace saveDed() al crear el vínculo.
      cr.pagos[siguiente-1]=true;
    }
  });
}

function createMonth(){
  const draft=buildDraftMonth();
  window._draftMonth=draft.nm;
  window._draftKey=draft.nk;
  openMonthReview();
}

function openMonthReview(){
  const nm=window._draftMonth;
  if(!nm) return;

  function rowsForList(list,which){
    return list.filter(function(g){return !g.parentId;}).map(function(g,i){
      var otraQ=which==='q1'?'q2':'q1';
      var grupoTag=g.esGrupo?'<span style="font-size:9px;color:var(--acc);margin-left:4px">grupo</span>':'';
      var credTag=g.creditoId?'<span style="font-size:9px;color:var(--pur);margin-left:4px">crédito</span>':'';
      return '<div style="display:flex;align-items:center;gap:6px;padding:6px 10px;border-bottom:1px solid var(--brd)">'
        +'<div style="flex:1;min-width:0">'
        +'<div style="font-size:12px;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(nombreGasto(g))+grupoTag+credTag+'</div>'
        +'<div style="font-size:10px;color:var(--mut)">'+cop(g.presupuesto)+'</div>'
        +'</div>'
        +'<button onclick="moveDraftGasto(\''+g.id+'\',\''+which+'\',\''+otraQ+'\')" title="Mover a '+otraQ.toUpperCase()+'" style="background:var(--surf2);border:1px solid var(--brd2);border-radius:50%;width:26px;height:26px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--acc);cursor:pointer;font-size:13px;padding:0">→</button>'
        +'<button onclick="deleteDraftGasto(\''+g.id+'\',\''+which+'\')" title="Eliminar de esta carga" style="background:var(--red-d);border:1px solid rgba(248,113,113,.35);border-radius:50%;width:26px;height:26px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--red);cursor:pointer;font-size:12px;padding:0">🗑</button>'
        +'</div>';
    }).join('');
  }

  const q1Html=rowsForList(nm.q1_gastos||[],'q1');
  const q2Html=rowsForList(nm.q2_gastos||[],'q2');
  const totalQ1=(nm.q1_gastos||[]).filter(function(g){return !g.parentId;}).reduce(function(a,g){return a+Math.abs(g.presupuesto||0);},0);
  const totalQ2=(nm.q2_gastos||[]).filter(function(g){return !g.parentId;}).reduce(function(a,g){return a+Math.abs(g.presupuesto||0);},0);

  openModal('<div class="mtitle">Revisar '+nm.nombre+'</div>'
    +'<p style="font-size:11px;color:var(--mut);line-height:1.4;margin-bottom:10px">Mueve entre quincenas o elimina lo que no aplique antes de crear el mes.</p>'
    +'<div style="border:1px solid var(--brd);border-radius:var(--r2);margin-bottom:10px;overflow:hidden">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:var(--surf2)">'
    +'<span style="font-size:11px;font-weight:700;color:var(--acc);text-transform:uppercase">Q1</span>'
    +'<span style="font-size:11px;font-weight:700;color:var(--txt)">'+cop(totalQ1)+'</span></div>'
    +'<div style="max-height:150px;overflow-y:auto">'
    +(q1Html||'<div style="padding:12px;text-align:center;color:var(--mut);font-size:11px">Sin gastos en Q1</div>')
    +'</div></div>'
    +'<div style="border:1px solid var(--brd);border-radius:var(--r2);margin-bottom:14px;overflow:hidden">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:var(--surf2)">'
    +'<span style="font-size:11px;font-weight:700;color:var(--grn);text-transform:uppercase">Q2</span>'
    +'<span style="font-size:11px;font-weight:700;color:var(--txt)">'+cop(totalQ2)+'</span></div>'
    +'<div style="max-height:150px;overflow-y:auto">'
    +(q2Html||'<div style="padding:12px;text-align:center;color:var(--mut);font-size:11px">Sin gastos en Q2</div>')
    +'</div></div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="cancelMonthReview()">Cancelar</button>'
    +'<button class="bpri" onclick="confirmCreateMonth()">Crear '+nm.nombre+'</button>'
    +'</div>');
}

function moveDraftGasto(id,fromQ,toQ){
  const nm=window._draftMonth; if(!nm) return;
  const fromList=fromQ==='q1'?nm.q1_gastos:nm.q2_gastos;
  const toList=toQ==='q1'?nm.q1_gastos:nm.q2_gastos;
  const idx=fromList.findIndex(function(g){return g.id===id;});
  if(idx===-1) return;
  const g=fromList[idx];
  if(g.esGrupo){
    const subs=fromList.filter(function(s){return s.parentId===g.id;});
    fromList.splice(idx,1);
    toList.push(g);
    subs.forEach(function(s){
      const sIdx=fromList.findIndex(function(x){return x.id===s.id;});
      if(sIdx!==-1){ fromList.splice(sIdx,1); toList.push(s); }
    });
  } else {
    fromList.splice(idx,1);
    toList.push(g);
  }
  openMonthReview();
}

function deleteDraftGasto(id,which){
  const nm=window._draftMonth; if(!nm) return;
  const list=which==='q1'?nm.q1_gastos:nm.q2_gastos;
  const idx=list.findIndex(function(g){return g.id===id;});
  if(idx===-1) return;
  const g=list[idx];
  if(g.esGrupo){
    showConfirm('¿Eliminar el grupo "'+nombreGasto(g)+'" y sus subgastos de esta carga? Esto no afecta meses anteriores.',function(){
      const filtered=list.filter(function(x){return x.id!==g.id && x.parentId!==g.id;});
      if(which==='q1') nm.q1_gastos=filtered; else nm.q2_gastos=filtered;
      openMonthReview();
    });
  } else {
    showConfirm('¿Eliminar "'+nombreGasto(g)+'" de esta carga? Esto no afecta meses anteriores.',function(){
      list.splice(idx,1);
      openMonthReview();
    });
  }
}

function cancelMonthReview(){
  window._draftMonth=null;
  window._draftKey=null;
  closeModal();
}

function confirmCreateMonth(){
  const nm=window._draftMonth, nk=window._draftKey;
  if(!nm||nk==null) return;
  db[nk]=nm;
  save();curM=nk;curTab=0;
  gFiltro={q1:'todos',q2:'todos'};
  gSort={q1:'orden',q2:'orden'};
  gFilterOpen={q1:false,q2:false};
  window._draftMonth=null;
  window._draftKey=null;
  closeModal();render();toast(nm.nombre+' creado');
}

// ── Exportar CSV ──────────────────────────────────────────────────────────────
function openBackupMenu(){
  openModal('<div class="mtitle">Respaldo de datos</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:16px">'
    +'Exporta tus datos para guardarlos en Drive, WhatsApp o email.<br>'
    +'Importa un backup para restaurar tus datos.</p>'
    +'<div style="display:flex;flex-direction:column;gap:10px">'
    +'<button class="bpri" onclick="exportJSON()" style="display:flex;align-items:center;justify-content:center;gap:8px">'
    +'<span style="font-size:16px">📤</span> Exportar / compartir backup</button>'
    +'<button class="bcnl" onclick="document.getElementById(\'imp-file\').click();closeModal()" style="display:flex;align-items:center;justify-content:center;gap:8px">'
    +'<span style="font-size:16px">📥</span> Importar backup JSON</button>'
    +'</div>');
}

async function exportJSON(){
  const hoy=new Date().toISOString().slice(0,10);
  const payload=JSON.stringify({version:2,fecha:hoy,data:db,creditos:creditos,catMetodos:catMetodos,catTipos:catTipos,telefono:perfilTelefono});
  let pin=sessionPIN;
  if(!pin){
    pin=await promptPINModal('Confirma tu PIN para cifrar el backup');
    if(pin===null) return;
    if(!(await pinVerify(pin))){ showAlert('PIN incorrecto'); return; }
    sessionPIN=pin;
  }
  const envelope=await encryptString(payload,pin);
  const fileObj=Object.assign({encrypted:true, app:'FinanzasPersonales', version:2, fecha:hoy}, envelope);
  const fileName='finanzas_backup_'+hoy+'.json';
  const contenido=JSON.stringify(fileObj,null,2);
  const blob=new Blob([contenido],{type:'application/json'});
  // Para COMPARTIR (WhatsApp/Gmail/Mensajes) se usa .txt + text/plain en vez de .json +
  // application/json: muchas apps (sobre todo WhatsApp) filtran por tipo de archivo en su
  // "intent" de compartir y no reconocen application/json como adjunto válido, así que ni
  // siquiera aparecen en el panel — text/plain sí lo reconoce prácticamente cualquier app.
  // El contenido es exactamente el mismo backup cifrado, solo cambia la extensión/tipo.
  const shareFileName='finanzas_backup_'+hoy+'.txt';
  const shareBlob=new Blob([contenido],{type:'text/plain'});
  const shareFile=new File([shareBlob], shareFileName, {type:'text/plain'});
  if(!window.isSecureContext){
    // Web Share API exige HTTPS (o localhost); en http:// simple ni siquiera existe.
    toast('Necesitas abrir la app por HTTPS para poder compartir. Se descargará el archivo.');
  } else if(!navigator.share){
    toast('Este navegador no soporta compartir archivos. Se descargará el archivo.');
  } else if(navigator.canShare && !navigator.canShare({files:[shareFile]})){
    toast('Este navegador no permite compartir este tipo de archivo. Se descargará el archivo.');
  } else {
    try{
      await navigator.share({files:[shareFile], title:'Backup Finanzas Personales', text:'Backup cifrado de Finanzas Personales ('+hoy+')'});
      toast('Backup cifrado compartido ✓');
      return;
    }catch(e){
      if(e.name==='AbortError') return; // el usuario cerró el share sheet sin elegir nada
      console.error('Error al compartir el backup', e);
      toast('No se pudo abrir compartir ('+e.name+'). Se descargará el archivo.');
    }
  }
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=fileName;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Backup cifrado exportado ✓');
}

function importJSON(input){
  const file=input.files[0];
  if(!file){return;}
  const reader=new FileReader();
  reader.onload=async function(e){
    try{
      const parsed=JSON.parse(e.target.result);
      let importedPayload;
      if(parsed.encrypted){
        let pin=sessionPIN;
        if(!pin){
          pin=await promptPINModal('Ingresa tu PIN para restaurar el backup');
          if(pin===null){ input.value=''; return; }
        }
        let plain;
        try{
          plain=await decryptString(parsed,pin);
        }catch(err){
          showAlert('PIN incorrecto o archivo dañado. No se pudo descifrar el backup.');
          input.value=''; return;
        }
        sessionPIN=pin;
        importedPayload=JSON.parse(plain);
      } else {
        importedPayload=parsed; // compatibilidad con backups antiguos sin cifrar
      }
      const importedDb=importedPayload.data||importedPayload;
      if(typeof importedDb!=='object'||Array.isArray(importedDb)){
        showAlert('Archivo no válido. Debe ser un backup exportado desde esta app.');
        input.value=''; return;
      }
      window._importedDb=importedDb;
      window._importedExtra={
        creditos: importedPayload.creditos||null,
        catMetodos: importedPayload.catMetodos||null,
        catTipos: importedPayload.catTipos||null,
        telefono: importedPayload.telefono||null
      };
      openModal('<div class="mtitle">Importar backup</div>'
        +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:16px">'
        +'Archivo: <b style="color:var(--txt)">'+file.name+'</b><br>'
        +'Meses encontrados: <b style="color:var(--txt)">'+Object.keys(importedDb).length+'</b><br><br>'
        +'<b style="color:var(--red)">¿Reemplazar todos los datos actuales?</b> Esta acción no se puede deshacer.</p>'
        +'<div class="macts">'
        +'<button class="bcnl" onclick="closeModal()">Cancelar</button>'
        +'<button class="bpri" style="background:var(--red);color:#fff" onclick="confirmImport()">Reemplazar todo</button>'
        +'</div>');
    } catch(err){
      showAlert('Error al leer el archivo: '+err.message);
    }
    input.value='';
  };
  reader.readAsText(file);
}

function confirmImport(){
  if(!window._importedDb){closeModal();return;}
  db=window._importedDb;
  // Migrate all months
  Object.keys(db).forEach(function(k){ db[k]=migrateMonth(db[k]); });
  if(window._importedExtra){
    if(window._importedExtra.creditos) creditos=window._importedExtra.creditos;
    if(window._importedExtra.catMetodos) catMetodos=window._importedExtra.catMetodos;
    if(window._importedExtra.catTipos) catTipos=window._importedExtra.catTipos;
    if(window._importedExtra.telefono) perfilTelefono=window._importedExtra.telefono;
  }
  // Reset navigation
  const keys=Object.keys(db).map(Number).sort(function(a,b){return a-b;});
  curM=keys[keys.length-1]; // go to last month
  curTab=0;
  gFiltro={q1:'todos',q2:'todos'};
  gSort={q1:'orden',q2:'orden'};
  gFilterOpen={q1:false,q2:false};
  save();closeModal();render();
  toast('Datos importados correctamente ✓');
  window._importedDb=null;
  window._importedExtra=null;
}

function exportCSV(){
  const m=getM(),nom=getNom(m);
  const rows=[['Sección','Nombre','Presupuesto','Método','Pagado Real','Estado','Fecha']];
  for(const g of(m.q1_gastos||[]))rows.push(['Q1',nombreGasto(g),g.presupuesto,g.metodo,g.pagado_real||'',g.pagado_flag?'Pagado':'Pendiente','']);
  for(const g of(m.q2_gastos||[]))rows.push(['Q2',nombreGasto(g),g.presupuesto,g.metodo,g.pagado_real||'',g.pagado_flag?'Pagado':'Pendiente','']);
  Object.values(m.tarjetas||{}).forEach(function(tc){(tc.movimientos||[]).forEach(function(t){rows.push([tc.nombre,t.descripcion,Math.abs(t.valor||0),t.tipo,'','',t.fecha]);});});
  rows.push(['Nomina','Basico Total',nom.basico_total,'','','',''],['Nomina','Bonos Total (informativo)',nom.bonos_total,'','','','']);
  for(const d of(nom.ded_q1||[]))rows.push(['NominaQ1',d.nombre,d.valor_fijo||'',d.porcentaje?(d.porcentaje*100).toFixed(0)+'%':'','','','']);
  for(const d of(nom.ded_q2||[]))rows.push(['NominaQ2',d.nombre,d.valor_fijo||'',d.porcentaje?(d.porcentaje*100).toFixed(0)+'%':'','','','']);
  const csv=rows.map(r=>r.map(c=>'"'+String(c||'').replace(/"/g,'""')+'"').join(',')).join('\n');
  const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'})),download:'Finanzas_'+m.nombre+'_2026.csv'});
  a.click();toast('Exportado · Ábrelo en Excel');
}

initApp();

if('serviceWorker' in navigator){
  // En PWA instalada (standalone) el navegador no siempre revisa si hay un sw.js
  // nuevo por su cuenta, y aunque lo detecte, la pestaña ya abierta no se refresca
  // sola — por eso forzamos reg.update() al abrir/enfocar la app y recargamos una
  // sola vez cuando el nuevo service worker toma control.
  var swRefrescando=false;
  navigator.serviceWorker.addEventListener('controllerchange', function(){
    if(swRefrescando) return;
    swRefrescando=true;
    window.location.reload();
  });

  navigator.serviceWorker.register('sw.js').then(function(reg){
    reg.update();
    document.addEventListener('visibilitychange', function(){
      if(document.visibilityState==='visible') reg.update();
    });
  }).catch(()=>{});

  navigator.serviceWorker.addEventListener('message', function(e){
    if(e.data && e.data.type==='VERSION'){
      var el=document.getElementById('lockVersion');
      if(el) el.textContent='V '+e.data.version+' • Powered by Felipe Ocampo';
    }
  });
  navigator.serviceWorker.ready.then(function(reg){
    if(reg.active) reg.active.postMessage({type:'GET_VERSION'});
  }).catch(function(){});
}
