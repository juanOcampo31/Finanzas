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
  // Antes, si localStorage no estaba disponible (modo incógnito estricto, cookies bloqueadas),
  // la app fallaba más adelante con un error críptico solo visible vía el handler genérico de
  // arriba. Se detecta temprano con un mensaje claro y accionable.
  try{
    var testKey='fin26_ls_test';
    window.localStorage.setItem(testKey,'1');
    window.localStorage.removeItem(testKey);
  }catch(e){
    showBootError('Este navegador no permite guardar datos localmente (localStorage bloqueado). Sal del modo incógnito/privado o revisa la configuración de cookies/almacenamiento del sitio, y recarga la página.');
  }
})();

// Detección de multi-pestaña: cada pestaña mantiene su propio estado en memoria (db,
// creditos, etc.) y sobrescribe fin26_enc entero en cada save() — "el último que guarda gana"
// sin ningún aviso. No se intenta fusionar ni recargar automáticamente (podría perder cambios
// sin guardar en ESTA pestaña); solo se avisa para que el usuario decida recargar a mano.
window.addEventListener('storage', function(e){
  if(e.key!=='fin26_enc' || !e.newValue) return;
  if(typeof sessionDataKey!=='undefined' && sessionDataKey){
    toast('Esta app se modificó desde otra pestaña — recarga esta pestaña antes de seguir para no perder cambios.',8000);
  }
});

// ── SEGURIDAD: PIN y cifrado de backups (AES-GCM) ──────────────────────────────
// (No hay biometría/WebAuthn implementada — solo PIN. Si se agrega a futuro, debe ser un
// segundo factor de conveniencia sobre este PIN, no un reemplazo: WebAuthn no produce
// material criptográfico portable para derivar la data key entre dispositivos.)
let appUnlocked = false;   // controla si la UI está visible o tapada por el lock
let sessionPIN  = null;    // PIN en memoria durante la sesión (nunca se persiste)
let lockMode    = 'unlock';// 'unlock' | 'setup1' | 'setup2'
let lockInput   = '';
let lockFirstPin= '';

function b64enc(buf){ return btoa(String.fromCharCode.apply(null, new Uint8Array(buf))); }
function b64dec(str){ const bin=atob(str); const arr=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i); return arr.buffer; }

// Antes este número vivía duplicado (aquí y en encryptString) — con riesgo de que se
// actualizara uno y no el otro. El envelope guarda su propio "iterations" para descifrar
// datos viejos aunque este valor cambie a futuro; esta constante es solo el default para
// cifrar cosas NUEVAS.
const PBKDF2_ITERATIONS = 200000;
async function pbkdf2Key(pin, saltBuf, iterations){
  iterations = iterations || PBKDF2_ITERATIONS;
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
  return {salt:b64enc(salt), iv:b64enc(iv), ct:b64enc(ct), iterations:PBKDF2_ITERATIONS, alg:'PBKDF2-SHA256+AES-GCM-256'};
}
async function decryptString(envelope, pin){
  const salt = new Uint8Array(b64dec(envelope.salt));
  const iv   = new Uint8Array(b64dec(envelope.iv));
  const ct   = b64dec(envelope.ct);
  const key  = await pbkdf2Key(pin, salt, envelope.iterations);
  const pt   = await crypto.subtle.decrypt({name:'AES-GCM', iv:iv}, key, ct);
  return new TextDecoder().decode(pt);
}

