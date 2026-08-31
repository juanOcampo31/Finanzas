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
        // Revisa en segundo plano si hay un respaldo más nuevo en la nube (ver js/sync.js) —
        // no bloquea el desbloqueo ni reemplaza nada sin preguntar primero.
        if(typeof revisarSyncAlDesbloquear==='function') revisarSyncAlDesbloquear();
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
    +(hasRecoveryPhone?'<button class="bcnl" onclick="closeModal();recoverWithPhone()">'+btnIcon('phone')+'Recuperar con mi número de celular</button>':'')
    +(hasDataKey?'<button class="bcnl" onclick="closeModal();recoverWithPreviousPin()">'+btnIcon('undo')+'Intentar con mi PIN anterior</button>':'')
    +'<button class="bcnl" onclick="closeModal();document.getElementById(\'lock-imp-file\').click()">'+btnIcon('download')+'Restaurar desde un backup exportado (.json)</button>'
    +'<button class="bcnl" style="color:var(--red)" onclick="closeModal();confirmWipeAll()">'+btnIcon('trash')+'Borrar todo y empezar de nuevo</button>'
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
// Validación de esquema mínima antes de aceptar un backup importado: antes solo se revisaba
// "es un objeto, no un array" — un JSON con esa forma por fuera pero basura por dentro (ej.
// q1_gastos como string, meses sin nombre) pasaba esa revisión y solo fallaba más adelante, a
// mitad de un render, con un error críptico en vez de un aviso claro al momento de importar.
// Devuelve null si es válido, o un mensaje describiendo el primer problema encontrado.
function validarEsquemaDb(importedDb){
  const keys=Object.keys(importedDb);
  if(!keys.length) return 'El backup no tiene ningún mes.';
  for(var i=0;i<keys.length;i++){
    var mes=importedDb[keys[i]];
    if(!mes||typeof mes!=='object'||Array.isArray(mes)){
      return 'El mes "'+keys[i]+'" no tiene un formato válido.';
    }
    if(typeof mes.nombre!=='string'||!mes.nombre){
      return 'Uno de los meses no tiene un nombre válido.';
    }
    if(mes.q1_gastos!=null && !Array.isArray(mes.q1_gastos)){
      return 'El mes "'+mes.nombre+'" tiene "q1_gastos" corrupto (no es una lista).';
    }
    if(mes.q2_gastos!=null && !Array.isArray(mes.q2_gastos)){
      return 'El mes "'+mes.nombre+'" tiene "q2_gastos" corrupto (no es una lista).';
    }
    if(mes.nomina!=null && typeof mes.nomina!=='object'){
      return 'El mes "'+mes.nombre+'" tiene "nomina" corrupta.';
    }
  }
  return null;
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
      const errorEsquema=validarEsquemaDb(importedDb);
      if(errorEsquema){
        showAlert('El backup no tiene un formato válido: '+errorEsquema); input.value=''; return;
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
   'fin26_datakey','fin26_datakey_prev','fin26_recovery','fin26_enc',
   'fin26','fin26_creditos','fin26_cat_metodos','fin26_cat_tipos','fin26_cat_categorias','fin26m'
  ].forEach(function(k){ localStorage.removeItem(k); });
  location.reload();
}

// Punto medio: NO se bloquea al instante al pasar a segundo plano (cambiar de app, apagar
// pantalla, etc.), pero sí se vuelve a pedir el PIN si al regresar ya pasaron 5+ minutos
// en segundo plano. Menos de 5 min → sigue desbloqueada tal cual la dejaste.
const AUTO_LOCK_MS = 5*60*1000;
let bgHiddenAt = null;
document.addEventListener('visibilitychange', function(){
  if(document.hidden){
    bgHiddenAt = Date.now();
    return;
  }
  if(appUnlocked && bgHiddenAt!=null && (Date.now()-bgHiddenAt) >= AUTO_LOCK_MS){
    appUnlocked=false; sessionPIN=null;
  }
  bgHiddenAt = null;
  if(!appUnlocked && pinIsConfigured()){
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
    +'<button class="bcnl" onclick="closeModal();startChangePIN()">'+btnIcon('key')+'Cambiar PIN</button>'
    +'<button class="bcnl" onclick="closeModal();startSetRecoveryPhone()">'+btnIcon('phone')+(hasRecoveryPhone?'Editar':'Configurar')+' número de recuperación</button>'
    +'<button class="bcnl" style="color:var(--red)" onclick="lockNow()">'+btnIcon('lock')+'Bloquear ahora</button>'
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
    +(perfilTelefono?'<button class="bcnl" style="width:100%;color:var(--red);margin-bottom:10px" onclick="removeRecoveryPhone()">'+btnIcon('trash')+'Quitar número de recuperación</button>':'')
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
// Cada paso de migración de abajo ya es idempotente (revisa si el campo existe antes de
// crearlo), así que hoy es seguro llamar migrateMonth() en cada carga sin gatear nada. Este
// número es solo un rastro explícito de qué forma tiene el objeto — el próximo cambio de
// esquema debería subirlo y, si de verdad hace falta una migración NO idempotente (que no se
// pueda repetir sin efectos), gatearla con `if((m._schemaVersion||0) < N)` en vez de inventar
// otro check ad-hoc de "¿existe este campo?".
const MES_SCHEMA_VERSION = 1;
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

  // ── Ingresos adicionales (aparte de la nómina), asociados a Q1 o Q2 ──────────
  if (!m.ingresos) m.ingresos = {q1:[], q2:[]};
  if (!Array.isArray(m.ingresos.q1)) m.ingresos.q1 = [];
  if (!Array.isArray(m.ingresos.q2)) m.ingresos.q2 = [];
  // Migrar deducciones antiguas (una por cada ingreso, vinculadas por ingresoId) al esquema
  // actual de una sola deducción agrupada por quincena, y recalcular su total.
  if (m.nomina) {
    ['ded_q1','ded_q2'].forEach(function(key){
      if (Array.isArray(m.nomina[key])) m.nomina[key] = m.nomina[key].filter(function(d){return !d.ingresoId;});
    });
  }
  ['q1','q2'].forEach(function(which){ syncIngresosDed(m, which); });

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

  m._schemaVersion = MES_SCHEMA_VERSION;
  return m;
}

let creditos={}; // {id: {nombre, valorPrestamo, pctAval, cuotas, tasa, fechaInicio, frecuencia}}
let catTipos=[]; // [{id, nombre}] catálogo de tipos/nombres de gasto
let catMetodos=[]; // [{id, nombre}] catálogo de formas de pago
let perfilTelefono=''; // número de celular para recuperación (ver Seguridad); viaja cifrado junto al resto de los datos
let db=null; // se puebla en loadAppData(), después de desbloquear con el PIN — nunca antes
let sessionDataKey=null; // CryptoKey AES-256 en memoria; nunca se persiste. Cifra/descifra fin26_enc.
let saveChain=Promise.resolve(); // serializa los guardados para no pisar escrituras si save() se llama varias veces seguidas

// Lee y parsea una clave legacy de localStorage, distinguiendo "no había nada guardado"
// (normal para un usuario nuevo, o una clave que ya se migró) de "había datos pero estaban
// corruptos" (JSON.parse falló) — antes ambos casos caían en silencio al mismo fallback, sin
// forma de notar que se había perdido información real de un usuario existente.
function parseLegacyJSON(key, fallback, label){
  const raw = localStorage.getItem(key);
  if(!raw) return fallback;
  try{
    return JSON.parse(raw);
  }catch(e){
    console.error('Datos legacy corruptos en "'+key+'" ('+label+'):', e);
    toast('Se encontraron datos guardados dañados ('+label+'). Se usó un valor por defecto — si tienes un backup, impórtalo desde el menú.',8000);
    return fallback;
  }
}
// Carga la estructura legacy en texto plano (versiones anteriores al cifrado en reposo).
// Solo se usa la primera vez que un usuario existente se desbloquea tras esta actualización
// (o si no hay ningún dato todavía); loadAppData() la migra a fin26_enc y borra estas claves.
function loadLegacyPlaintext(){
  db = parseLegacyJSON('fin26', null, 'meses');
  if (!db) db = JSON.parse(JSON.stringify(INIT));
  creditos = parseLegacyJSON('fin26_creditos', {}, 'créditos');
  const rawCM = localStorage.getItem('fin26_cat_metodos');
  if(rawCM){
    catMetodos = parseLegacyJSON('fin26_cat_metodos', [], 'métodos de pago');
  } else {
    // Migrar valores por defecto la primera vez
    const defaults=['Nequi','BBVA','PSE','Tarjeta','Retiro','Cuenta','Otro'];
    catMetodos = defaults.map(function(n){ return {id:uid(), nombre:n}; });
  }
  catTipos = parseLegacyJSON('fin26_cat_tipos', [], 'tipos de gasto');
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
  migrarEstadoGastos();
  // Repara gastos huérfanos de un grupo: buildDraftMonth() (crear mes nuevo) tenía un bug
  // donde un gasto ligado por parentId a un grupo (ej. "tarjeta") que vivía en la OTRA
  // quincena quedaba con un parentId apuntando a un id que ya no existía en el mes nuevo —
  // huérfano, invisible para cualquier lógica de grupo. Reengancha cuando todos los grupos
  // candidatos del mes son de la misma tarjeta (tcCardId), para no adivinar mal a cuál tarjeta
  // pertenecía si hubiera varias distintas.
  repararGastosHuerfanosDeGrupo();
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
let curIngQ = 'q1'; // quincena seleccionada actualmente en la pestaña Ingresos
let curNomQ = 'q1'; // quincena seleccionada actualmente en la pestaña Nómina
let summaryOpen = true;                          // resumen del mes (básico/neto/gastos/tarjeta) — expandido por defecto
// Desgloses expandibles de cada bloque del Resumen del mes — todos colapsados por defecto.
// Cada pill además navega a su pestaña correspondiente al seleccionarse (ver selectStat()).
let statBreakdownOpen = {basico:false, ingresos:false, gastos:false, tarjeta:false, dispQ1:false, dispQ2:false};
const STAT_BREAKDOWN_DOM_IDS = {basico:'basicoBreakdown', ingresos:'netoBreakdown', gastos:'gastosBreakdown', tarjeta:'tcBreakdown', dispQ1:'dispQ1Breakdown', dispQ2:'dispQ2Breakdown'};
let lastCreatedId = null;                         // id del último gasto creado, para animación de entrada
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
let curTab = 0;
let homeQ = 'q1'; // quincena seleccionada dentro de la vista Inicio
let homeQAutoDone = false; // ya se aplicó el default automático de homeQ según la fecha de hoy
let tcTipo = 'Compra';

function save(){
  saveChain = saveChain.then(async function(){
    if(!sessionDataKey) return; // no debería pasar: save() solo se usa después de desbloquear
    const envelope = await encryptPayload({db:db, creditos:creditos, catMetodos:catMetodos, catTipos:catTipos, telefono:perfilTelefono});
    localStorage.setItem('fin26_enc', JSON.stringify(envelope));
    // Sincronización automática (ver js/sync.js) — no hace nada si no hay sesión de Google
    // iniciada; función definida en un archivo que carga después de este, de ahí el guard.
    if(typeof programarAutoSyncSubida==='function') programarAutoSyncSubida();
  }).catch(function(e){
    // Antes esto solo quedaba en consola: el usuario seguía viendo su cambio en pantalla (ya
    // aplicado en memoria) sin enterarse de que NO se guardó, y lo perdía al recargar.
    console.error('Error guardando datos cifrados', e);
    var msg=(e&&e.name==='QuotaExceededError')
      ?'No se pudo guardar: el almacenamiento del navegador está lleno. Exporta un backup y libera espacio.'
      :'No se pudieron guardar los últimos cambios. Vuelve a intentarlo.';
    toast(msg,6000);
  });
  return saveChain;
}
function getM()  { return db[curM]; }
function getNom(m) { return m.nomina || {}; }

