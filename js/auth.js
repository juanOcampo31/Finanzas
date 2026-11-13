// ── UI de la pantalla de bloqueo ────────────────────────────────────────────
function buildKeypadHTML(){
  // El PIN siempre tiene 6 dígitos (ver lockPinConfirm) así que no hace falta un botón
  // "Confirmar": al completar el 6° dígito se confirma solo. El espacio que quedaba vacío
  // debajo del 7 ahora lo ocupa el acceso directo con Google.
  const keys=['1','2','3','4','5','6','7','8','9','google','0','⌫'];
  // Mismo lenguaje visual en ambos íconos: trazo 1.7, extremos redondeados, sin relleno,
  // color #CBD5E1 (un poco más tenue que los dígitos en #F1F5F9, para leerse como acción).
  const bsIcon='<svg viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5.5h10.2a1.8 1.8 0 0 1 1.8 1.8v9.4a1.8 1.8 0 0 1-1.8 1.8H9L3.2 12z"/><path d="m11.6 9.4 5.2 5.2M16.8 9.4l-5.2 5.2"/></svg>';
  const googleIcon='<svg viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.66 6.34A8 8 0 1 0 20 12h-8"/></svg>';
  let h='<div class="lock-keys">';
  keys.forEach(function(k){
    if(k==='⌫') h+='<button class="lock-key lock-key-action" onclick="lockPinBackspace()" aria-label="Borrar dígito">'+bsIcon+'</button>';
    else if(k==='google') h+='<button class="lock-key lock-key-action lock-key-google" onclick="syncSignInGoogleDesdeLock()" aria-label="Iniciar sesión con Google">'+googleIcon+'</button>';
    else h+='<button class="lock-key" onclick="lockPinPress(\''+k+'\')">'+k+'</button>';
  });
  h+='</div>';
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
  // Saludo con el nombre del último usuario que inició sesión en este dispositivo — viene de
  // fin26_last_name (ver cacheNombreParaSaludo), guardado en texto plano aparte del resto de
  // datos (que viajan cifrados) justo para poder mostrarlo ANTES de que se ingrese el PIN.
  const primerNombre = (mode==='setup')?'':primerNombreGuardado();
  document.getElementById('lockTitle').textContent = (mode==='setup')?'Crea tu PIN':(primerNombre?('Hola, '+primerNombre):'Ingresa tu PIN');
  document.getElementById('lockSub').textContent = (mode==='setup')?'Protege tu información financiera (6 dígitos). También se usará para cifrar tus copias de seguridad.':(primerNombre?'Ingresa tu PIN de 6 dígitos':'');
  const kicker=document.getElementById('lockKicker');
  if(kicker) kicker.style.display=(mode!=='setup'&&primerNombre)?'none':'';
  document.getElementById('lockError').textContent='';
  document.getElementById('lockKeypad').innerHTML = buildKeypadHTML();
  renderLockDots();
  // El enlace ahora también se muestra al crear un PIN nuevo (antes solo aparecía si ya había
  // datos protegidos por desbloquear): un dispositivo nuevo, sin nada guardado localmente
  // todavía, es justo el caso más común para "recuperar mis datos desde la nube" en vez de
  // arrancar con la app vacía (ver showRecoveryOptions/syncSignInGoogleDesdeLock).
  const recoveryLink=document.getElementById('lockRecoveryLink');
  recoveryLink.textContent = (mode==='setup') ? '¿Ya usas la app en otro dispositivo?' : '¿Problemas para ingresar?';
  recoveryLink.style.display='block';
  // Botón "Usar huella" y, si está activada, el aviso de huella automático (ver js/bio.js).
  if(typeof bioPrepararLock==='function') bioPrepararLock(mode);
}
// Primer nombre a mostrar en el saludo de la pantalla de bloqueo, leído de fin26_last_name
// (texto plano) — perfilNombre en sí vive cifrado y no está disponible hasta ingresar el PIN.
function primerNombreGuardado(){
  try{
    const n=(localStorage.getItem('fin26_last_name')||'').trim();
    if(!n||n==='undefined'||n==='null') return '';
    return n.split(/\s+/)[0];
  }catch(e){ return ''; }
}
function cacheNombreParaSaludo(){
  try{
    const n=(perfilNombre||'').trim();
    if(n) localStorage.setItem('fin26_last_name', n);
    else localStorage.removeItem('fin26_last_name');
  }catch(e){}
}
function hideLockOverlay(){
  document.getElementById('lockOverlay').classList.add('hidden');
  const appEl=document.getElementById('app');
  if(appEl) appEl.style.display='flex';
  document.body.style.overflow='hidden';
  // Todos los caminos que desbloquean la app pasan por acá — revisa en segundo plano si hay un
  // respaldo más nuevo en la nube y habilita la subida automática (ver js/sync.js). No bloquea
  // el desbloqueo ni reemplaza nada sin preguntar primero.
  if(typeof revisarSyncAlDesbloquear==='function') revisarSyncAlDesbloquear();
  if(typeof bioAlDesbloquear==='function') bioAlDesbloquear();
  // Número de recuperación obligatorio (ver exigirNumeroRecuperacion): en el siguiente turno,
  // para que el llamador termine primero lo suyo (appUnlocked=true, closeModal(), render()).
  setTimeout(exigirNumeroRecuperacion,0);
}

// Mientras se verifica el PIN (PBKDF2 puede tardar casi un segundo en un celular de gama media)
// la pantalla mostraba los 6 puntos llenos sin ningún cambio y parecía trabada: ahora los puntos
// pulsan, el teclado se atenúa (y no acepta toques) y el subtítulo dice "Desbloqueando…".
let lockBusy=false;
let lockSubAntesDeBusy='';
function lockSetBusy(on){
  lockBusy=on;
  const card=document.querySelector('.lock-card');
  if(card) card.classList.toggle('lock-busy', on);
  const sub=document.getElementById('lockSub');
  if(!sub) return;
  if(on){ lockSubAntesDeBusy=sub.textContent; sub.textContent='Desbloqueando…'; }
  else sub.textContent=lockSubAntesDeBusy;
}

function lockPinPress(d){
  if(lockBusy || lockInput.length>=6) return;
  lockInput+=d;
  renderLockDots();
  document.getElementById('lockError').textContent='';
  // Sin la espera fija de 150 ms de antes: el 6° punto se pinta igual, porque todo el trabajo
  // de lockPinConfirm (WebCrypto) es asíncrono y le cede el turno al navegador para dibujar.
  if(lockInput.length===6) lockPinConfirm();
}
function lockPinBackspace(){ if(lockBusy) return; lockInput=lockInput.slice(0,-1); renderLockDots(); }

// Verifica el PIN con UNA sola derivación PBKDF2 en el caso normal. Antes eran dos seguidas
// (pinVerify + ensureDataKey, ~200k iteraciones cada una) aunque desenvolver la data key ya
// prueba el PIN por sí solo: AES-GCM rechaza la clave equivocada.
//  - true: PIN correcto (y, si hacía falta, sessionDataKey ya quedó desenvuelta).
//  - false: PIN incorrecto.
//  - lanza: el PIN SÍ es correcto pero la data key no abre (p.ej. un cambio de PIN
//    interrumpido) — el llamador muestra las opciones de recuperación, igual que antes.
async function verificarPinYAbrirDataKey(pin){
  // Re-bloqueo (la data key sigue en memoria) o dato legacy sin data key todavía: basta pinVerify.
  if(sessionDataKey || !localStorage.getItem('fin26_datakey')) return pinVerify(pin);
  try{
    sessionDataKey=await unwrapDataKey(pin);
    return true;
  }catch(e){
    // AES-GCM falla igual con un PIN incorrecto que con una data key rota: solo en este caso de
    // error se paga la segunda derivación para distinguir uno del otro.
    if(await pinVerify(pin)) throw e;
    return false;
  }
}

// Último tramo de un desbloqueo exitoso, compartido entre el PIN (lockPinConfirm) y la huella
// (bioDesbloquear, js/bio.js): para entonces sessionDataKey y sessionPIN ya están en memoria.
async function completarDesbloqueo(necesitaCargar){
  if(necesitaCargar) await loadAppData();
  clearPinRecoveryBackup(); // el material actual funciona de punta a punta: ya no hace falta el respaldo
  appUnlocked=true; hideLockOverlay(); render(); // hideLockOverlay también revisa la nube
}

async function lockPinConfirm(){
  if(lockInput.length!==6){ showLockError('El PIN debe tener 6 dígitos'); return; }
  if(lockMode==='unlock'){
    const pin=lockInput;
    const necesitaCargar=!sessionDataKey;
    lockSetBusy(true);
    try{
      if(!(await verificarPinYAbrirDataKey(pin))){
        showLockError('PIN incorrecto'); lockInput=''; renderLockDots();
        return;
      }
      sessionPIN=pin; lockInput='';
      if(necesitaCargar && !sessionDataKey) await ensureDataKey(pin); // solo dato legacy: crea la data key por primera vez
      await completarDesbloqueo(necesitaCargar);
      // Solo tras entrar con PIN (no con huella ni por recuperación): ofrece activar la huella
      // si este dispositivo la soporta y todavía no está activa (ver js/bio.js).
      if(typeof bioSugerirTrasPin==='function') bioSugerirTrasPin();
    }catch(e){
      // Nota: mantenemos sessionPIN (el PIN correcto y ya verificado) en memoria — las
      // opciones de recuperación de abajo lo necesitan para re-envolver la data key una
      // vez restaurado el acceso. No se persiste en ningún momento, solo vive en RAM.
      sessionPIN=pin; lockInput=''; renderLockDots();
      sessionDataKey=null;
      showLockError('No se pudieron descifrar tus datos. Intenta de nuevo.');
      document.getElementById('lockRecoveryLink').style.display='block';
    }finally{
      lockSetBusy(false);
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
    // Primera vez de verdad (nada guardado ni cifrado ni en texto plano todavía) — en vez de
    // arrancar en silencio con Enero y los valores de ejemplo (INIT, en core.js), se pregunta
    // mes/año, quincena actual y básico real (ver abrirAsistentePrimeraConfiguracion). Para
    // cualquier otro caso (recuperación, dato legacy existente) el flujo sigue igual que antes.
    const esPrimeraVezDeVerdad = !localStorage.getItem('fin26_enc') && !localStorage.getItem('fin26');
    if(esPrimeraVezDeVerdad && typeof abrirAsistentePrimeraConfiguracion==='function'){
      // El modal se abre ENCIMA de la pantalla de bloqueo (igual que "Recuperar acceso"), sin
      // ocultarla todavía — recién al confirmar el asistente hay un mes armado para mostrar
      // (ver confirmarPrimeraConfiguracion), así que ese es el momento de destaparla.
      abrirAsistentePrimeraConfiguracion();
    } else {
      await loadAppData();
      appUnlocked=true; hideLockOverlay(); render(); toast('PIN configurado ✓');
    }
  }
}

// ── Asistente de primera configuración ──────────────────────────────────────────
// Reemplaza el arranque silencioso en Enero con valores de ejemplo (INIT, en core.js) la
// primera vez de verdad que alguien usa la app: se pregunta el mes/año reales, en qué quincena
// está ahora mismo (no siempre coincide con la fecha del sistema — puede estar cargando datos
// atrasados), cómo recibe su plata (tipo de ingreso) y, si tiene nómina, su básico/mesada. Las
// deducciones NO se imponen: se ofrecen como plantillas marcables según el tipo (empleado: Salud
// y Pensión 4%; pensionado: Salud 12%) y se pueden editar o agregar después desde Nómina.
let fpQuincenaSel='q1';
let fpTipoSel='empleado';
// Plantillas de deducción ofrecidas en el asistente, por tipo de ingreso (marcadas por defecto).
const FP_PLANTILLAS_DED={
  empleado:[{id:'salud',nombre:'Salud',porcentaje:0.04,txt:'Salud (4%)'},{id:'pension',nombre:'Pensión',porcentaje:0.04,txt:'Pensión (4%)'}],
  pensionado:[{id:'salud12',nombre:'Salud',porcentaje:0.12,txt:'Salud (12%) · revisa el % que te descuentan'}],
  independiente:[]
};
function abrirAsistentePrimeraConfiguracion(previo){
  const hoy=new Date();
  previo=previo||{};
  if(!previo.mantenerQuincena) fpQuincenaSel=hoy.getDate()<=15?'q1':'q2';
  const mesSel=previo.mes!=null?previo.mes:hoy.getMonth();
  const mesOpts=MESES.map(function(nm,i){return '<option value="'+i+'"'+(i===mesSel?' selected':'')+'>'+nm+'</option>';}).join('');
  const plantillas=FP_PLANTILLAS_DED[fpTipoSel]||[];
  const nominaHtml=fpTipoSel==='independiente'
    ?'<p style="font-size:11.5px;color:var(--mut);line-height:1.5;margin-bottom:12px">Sin nómina: registra lo que te entra en la pestaña <b style="color:var(--txt)">Ingresos</b> (puedes marcar los que se repiten cada mes).</p>'
    :('<div class="field"><label>'+(fpTipoSel==='pensionado'?'Mesada mensual':'Básico mensual')+'</label><input id="fp-basico" type="text" inputmode="numeric" placeholder="Ej: 2.500.000" value="'+(previo.basico?moneyInputFmt(previo.basico):'')+'" oninput="maskMoneyInput(this)"></div>'
      +(plantillas.length?('<div class="field"><label>Descuentos de nómina</label>'
        +plantillas.map(function(pl){
          return '<label style="display:flex;align-items:center;gap:9px;font-size:13.5px;color:var(--txt);font-weight:600;margin:4px 0"><input type="checkbox" class="fp-ded" data-id="'+pl.id+'" checked style="width:18px;height:18px;accent-color:var(--acc)">'+esc(pl.txt)+'</label>';
        }).join('')
        +'<p style="font-size:11px;color:var(--mut);line-height:1.5;margin-top:4px">Desmarca los que no aplican. Puedes agregar o editar descuentos después en Nómina.</p></div>'):''));
  openModal('<div class="mtitle">Configura tu primer mes</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:14px">Antes de empezar, cuéntanos desde cuándo vas a llevar tus finanzas acá y cómo recibes tu plata.</p>'
    +'<div class="field"><label>¿Cómo recibes tu plata?</label>'+tipoIngresoOpcionesHtml(fpTipoSel,'setFPTipo')+'</div>'
    +'<div class="field"><label>Mes</label><select id="fp-mes">'+mesOpts+'</select></div>'
    +'<div class="field"><label>Año</label><input id="fp-anio" type="text" inputmode="numeric" maxlength="4" value="'+(previo.anio||hoy.getFullYear())+'"></div>'
    +'<div class="field"><label>¿En qué quincena estás ahora?</label>'
    +'<div class="trow2">'
    +'<button class="topt'+(fpQuincenaSel==='q1'?' sa':'')+'" id="fp-q1" onclick="setFPQuincena(\'q1\')">Quincena 1</button>'
    +'<button class="topt'+(fpQuincenaSel==='q2'?' sa':'')+'" id="fp-q2" onclick="setFPQuincena(\'q2\')">Quincena 2</button>'
    +'</div></div>'
    +nominaHtml
    +'<div class="macts"><button class="bpri" style="grid-column:1/-1" onclick="confirmarPrimeraConfiguracion()">Empezar</button></div>');
}
// Cambiar el tipo reabre el asistente (cambia qué campos aplican) sin perder lo ya escrito.
function setFPTipo(t){
  const mesEl=document.getElementById('fp-mes'), anioEl=document.getElementById('fp-anio');
  const previo={mantenerQuincena:true, mes:mesEl?parseInt(mesEl.value,10):null, anio:anioEl?anioEl.value:'', basico:moneyVal('fp-basico')||0};
  fpTipoSel=normalizarTipoIngreso(t);
  abrirAsistentePrimeraConfiguracion(previo);
}
function setFPQuincena(q){
  fpQuincenaSel=q;
  document.getElementById('fp-q1').className='topt'+(q==='q1'?' sa':'');
  document.getElementById('fp-q2').className='topt'+(q==='q2'?' sa':'');
}
async function confirmarPrimeraConfiguracion(){
  const mesIdx=parseInt(document.getElementById('fp-mes').value)||0;
  const anio=parseInt(document.getElementById('fp-anio').value)||0;
  if(!anio||anio<2000||anio>2100){ showAlert('Ingresa un año válido'); return; }
  const conNomina=fpTipoSel!=='independiente';
  const basico=conNomina?(moneyVal('fp-basico')||0):0;
  if(conNomina && basico<=0){ showAlert(fpTipoSel==='pensionado'?'Ingresa tu mesada mensual':'Ingresa tu básico mensual'); return; }
  // Solo las plantillas que quedaron marcadas (ninguna si es independiente).
  const marcadas={};
  document.querySelectorAll('.fp-ded').forEach(function(el){ if(el.checked) marcadas[el.dataset.id]=true; });
  const plantillasElegidas=(FP_PLANTILLAS_DED[fpTipoSel]||[]).filter(function(pl){ return marcadas[pl.id]; });
  function dedSaludPension(){
    return plantillasElegidas.map(function(pl){ return {nombre:pl.nombre,porcentaje:pl.porcentaje,valor_fijo:null}; });
  }
  perfilTipoIngreso=normalizarTipoIngreso(fpTipoSel);
  const mes={
    nombre:MESES[mesIdx], año:anio,
    q1_gastos:[], q2_gastos:[],
    tarjeta:[], tcInfo:{fechaCorte:null,fechaPago:null},
    nomina:{
      basico_total:basico, bonos_total:0,
      basico_q1:0, basico_q2:0, bonos_q1:0, bonos_q2:0,
      ded_q1:dedSaludPension(), ded_q2:dedSaludPension(),
      // Si ya arranca en la quincena 2, la Q1 de este mes pasó sin quedar registrada en la app
      // (no hay gastos ni básico reales que trackear ahí) — basicoQ1() la deja en 0 en vez de
      // la mitad del básico, y eso a su vez afecta el "Actual" de prima/cesantías en
      // Información general (ver openInfoGeneral en catalogos.js).
      q1NoTrackeada: fpQuincenaSel==='q2'
    }
  };
  mes.nomina.basico_q1=basicoQ1(mes);
  mes.nomina.basico_q2=basicoQ2(mes);
  db={0:mes};
  creditos={};
  catMetodos=METODOS_PAGO_INICIALES.map(function(n){return {id:uid(),nombre:n};});
  catTipos=[];
  Object.keys(db).forEach(function(k){ db[k]=migrateMonth(db[k]); });
  migrarEstadoGastos();
  repararGastosHuerfanosDeGrupo();
  curM=0; curTab=0;
  homeQ=fpQuincenaSel; homeQAutoDone=true; // respeta la quincena elegida — sin esto, el primer render() la recalcularía sola
  await save();
  appUnlocked=true; hideLockOverlay(); closeModal(); render();
  toast('¡Todo listo! ✓');
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
    +'quedó a medias), o si es la primera vez que abres la app en este dispositivo y ya tienes '
    +'datos guardados en otro, elige una opción:</p>'
    +'<div style="display:flex;flex-direction:column;gap:10px">'
    +(typeof syncSignInGoogleDesdeLock==='function'?'<button class="bpri" onclick="syncSignInGoogleDesdeLock()">'+btnIcon('refresh')+'Iniciar sesión con Google y recuperar de la nube</button>':'')
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
    +'<div class="field"><label>PIN nuevo (6 dígitos)</label><input id="rp-new1" type="password" inputmode="numeric" maxlength="6" placeholder="••••••"></div>'
    +'<div class="field"><label>Confirma el PIN nuevo</label><input id="rp-new2" type="password" inputmode="numeric" maxlength="6" placeholder="••••"></div>'
    +'<div class="macts"><button class="bpri" style="grid-column:1/-1" onclick="confirmRecoveryNewPin()">Guardar y continuar</button></div>');
}
async function confirmRecoveryNewPin(){
  const n1=document.getElementById('rp-new1').value.trim();
  const n2=document.getElementById('rp-new2').value.trim();
  if(n1.length!==6){ showAlert('El PIN debe tener 6 dígitos'); return; }
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
      perfilNombre=importedPayload.nombre||'';
      perfilQ2DiasFijos=!!importedPayload.q2DiasFijos;
      perfilPago=normalizarPerfilPago(importedPayload.pago);
      perfilTipoIngreso=normalizarTipoIngreso(importedPayload.tipoIngreso);
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
   'fin26_datakey','fin26_datakey_prev','fin26_recovery','fin26_bio','fin26_bio_sugerencia','fin26_enc',
   'fin26','fin26_creditos','fin26_cat_metodos','fin26_cat_tipos','fin26_cat_categorias','fin26m'
  ].forEach(function(k){ localStorage.removeItem(k); });
  location.reload();
}

// Punto medio: NO se bloquea al instante al pasar a segundo plano (cambiar de app, apagar
// pantalla, etc.), pero sí se vuelve a pedir el PIN si al regresar ya pasaron 3+ minutos
// en segundo plano. Menos de 3 min → sigue desbloqueada tal cual la dejaste.
const AUTO_LOCK_MS = 3*60*1000;
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
// "Perfil": nombre (informativo) + accesos a lo que antes vivía en "Seguridad" — cambiar la
// contraseña (PIN) y el número de recuperación quedan asociados acá porque son, en la práctica,
// las credenciales del mismo perfil. Se mantiene el nombre de función por compatibilidad con
// quien ya la llamaba (renderHeaderUserMenu, ver js/render.js), solo cambió el título/contenido del modal.
function openSecurityMenu(){
  openModal('<div class="mtitle">Perfil</div>'
    +'<div class="field"><label>Nombre</label><input id="perfil-nombre" value="'+esc(perfilNombre||'')+'" placeholder="Tu nombre"></div>'
    +'<button class="bcnl" style="width:100%;margin:2px 0 8px;display:flex;align-items:center;gap:8px;text-align:left" onclick="openTipoIngreso()">'+icon('dollar',16)
    +'<span style="flex:1;min-width:0"><span style="display:block">Tipo de ingreso</span><span style="display:block;font-size:11.5px;color:var(--mut);font-weight:600">'+esc(TIPO_INGRESO_INFO[normalizarTipoIngreso(perfilTipoIngreso)].titulo)+'</span></span>'+icon('chevronRight',15)+'</button>'
    +'<button class="bcnl" style="width:100%;margin:2px 0 12px;display:flex;align-items:center;gap:8px;text-align:left" onclick="openDiasPago()">'+icon('cal',16)
    +'<span style="flex:1;min-width:0"><span style="display:block">Días de pago</span><span style="display:block;font-size:11.5px;color:var(--mut);font-weight:600">'+esc(textoDiasPago())+'</span></span>'+icon('chevronRight',15)+'</button>'
    +(typeof backupNubeSectionHtml==='function'?backupNubeSectionHtml():'')
    +'<div style="margin-top:14px"><button class="bcnl" style="width:100%;color:var(--red)" onclick="lockNow()">'+btnIcon('lock')+'Cerrar sesión</button></div>'
    +'<div class="macts" style="margin-top:14px"><button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="guardarPerfilNombre()">Guardar</button></div>');
}
// ── Tipo de ingreso (ver perfilTipoIngreso en state.js, tieneNomina en nomina-calc.js) ──
const TIPO_INGRESO_INFO={
  empleado:{titulo:'Empleado', desc:'Recibo salario por nómina, con prima y cesantías.'},
  pensionado:{titulo:'Pensionado', desc:'Recibo una mesada. Sin prima ni cesantías.'},
  independiente:{titulo:'Independiente', desc:'No tengo nómina: mi plata entra por la pestaña Ingresos.'}
};
function tipoIngresoOpcionesHtml(sel,onclickFn){
  return TIPOS_INGRESO.map(function(t){
    const on=t===sel, info=TIPO_INGRESO_INFO[t];
    return '<button type="button" onclick="'+onclickFn+'(\''+t+'\')" style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;width:100%;text-align:left;padding:11px 14px;border-radius:12px;cursor:pointer;font-family:inherit;margin-bottom:8px;'
      +'background:'+(on?'var(--acc-d)':'var(--surf)')+';border:1.5px solid '+(on?'var(--acc)':'var(--brd2)')+'">'
      +'<span style="font-size:14px;font-weight:800;color:'+(on?'var(--acc)':'var(--txt)')+'">'+info.titulo+'</span>'
      +'<span style="font-size:12px;color:var(--mut)">'+info.desc+'</span></button>';
  }).join('');
}
function openTipoIngreso(){
  openModal('<div class="mtitle">Tipo de ingreso</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:12px">Define cómo calcula la app tu plata disponible. Tus datos no se borran al cambiarlo.</p>'
    +tipoIngresoOpcionesHtml(normalizarTipoIngreso(perfilTipoIngreso),'guardarTipoIngreso')
    +'<div class="macts" style="margin-top:6px"><button class="bcnl" style="grid-column:1/-1" onclick="openSecurityMenu()">Volver</button></div>');
}
function guardarTipoIngreso(t){
  perfilTipoIngreso=normalizarTipoIngreso(t);
  if(!tieneNomina() && curTab===3) curTab=0;
  save(); render(); openSecurityMenu();
  toast('Tipo de ingreso: '+TIPO_INGRESO_INFO[perfilTipoIngreso].titulo);
}

// ── Días de pago de la nómina (ver getPago en format-utils.js) ────────────────
function textoDiasPago(){
  const p=normalizarPerfilPago(perfilPago);
  return 'Q1 el '+p.diaQ1+' · Q2 '+(p.diaQ2?('el '+p.diaQ2):'el último día')+' · festivo: hábil '+p.ajuste;
}
function openDiasPago(){
  const p=normalizarPerfilPago(perfilPago);
  const opts=function(desde,hasta,sel){
    var h='';
    for(var d=desde;d<=hasta;d++) h+='<option value="'+d+'"'+(d===sel?' selected':'')+'>'+d+'</option>';
    return h;
  };
  window._diasPagoAjuste=p.ajuste;
  openModal('<div class="mtitle">Días de pago</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:14px">Qué día te pagan cada quincena. Se usa para las fechas de pago de Inicio, Nómina y la Agenda, en todos los meses.</p>'
    +'<div class="field"><label>Pago de la Q1</label><select id="dp-q1">'+opts(1,15,p.diaQ1)+'</select></div>'
    +'<div class="field"><label>Pago de la Q2</label><select id="dp-q2"><option value="0"'+(p.diaQ2?'':' selected')+'>Último día del mes</option>'+opts(16,31,p.diaQ2)+'</select></div>'
    +'<div class="field"><label>Si cae en fin de semana o festivo</label>'
    +'<div class="trow2">'
    +'<button class="topt'+(p.ajuste==='anterior'?' sa':'')+'" id="dp-ant" onclick="setAjusteDiasPago(\'anterior\')">Día hábil anterior</button>'
    +'<button class="topt'+(p.ajuste==='siguiente'?' sa':'')+'" id="dp-sig" onclick="setAjusteDiasPago(\'siguiente\')">Día hábil siguiente</button>'
    +'</div></div>'
    +'<p style="font-size:11.5px;color:var(--mut);line-height:1.5;margin-bottom:4px">Si eliges un día que el mes no tiene (por ejemplo 31 en un mes de 30), se toma el último día de ese mes.</p>'
    +'<div class="macts" style="margin-top:12px"><button class="bcnl" onclick="openSecurityMenu()">Cancelar</button>'
    +'<button class="bpri" onclick="guardarDiasPago()">Guardar</button></div>');
}
function setAjusteDiasPago(v){
  window._diasPagoAjuste=v;
  document.getElementById('dp-ant').className='topt'+(v==='anterior'?' sa':'');
  document.getElementById('dp-sig').className='topt'+(v==='siguiente'?' sa':'');
}
function guardarDiasPago(){
  perfilPago=normalizarPerfilPago({
    diaQ1:document.getElementById('dp-q1').value,
    diaQ2:document.getElementById('dp-q2').value,
    ajuste:window._diasPagoAjuste
  });
  save(); render(); openSecurityMenu();
  toast('Días de pago actualizados ✓');
}
function guardarPerfilNombre(){
  perfilNombre=(document.getElementById('perfil-nombre').value||'').trim();
  save();closeModal();render();toast('Perfil actualizado ✓');
}
// Agrupa el PIN (cambiarlo, número de recuperación) y el respaldo manual (exportar/importar
// JSON, antes en su propio menú "Respaldar información") — todo lo relacionado a proteger y
// resguardar los datos, separado de "Mi perfil" (nombre, sincronización con Google y cerrar sesión).
function openSeguridadMenu(){
  const hasRecoveryPhone = !!localStorage.getItem('fin26_recovery');
  openModal('<div class="mtitle">Seguridad</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:14px">Tu PIN protege el acceso a la app y cifra tus copias de seguridad.</p>'
    +'<div style="display:flex;flex-direction:column;gap:10px">'
    +'<button class="bcnl" onclick="closeModal();startChangePIN()">'+btnIcon('key')+'Cambiar contraseña (PIN)</button>'
    +'<button class="bcnl" onclick="closeModal();startSetRecoveryPhone()">'+btnIcon('phone')+(hasRecoveryPhone?'Editar':'Configurar')+' número de recuperación</button>'
    +(typeof bioBotonSeguridadHtml==='function'?bioBotonSeguridadHtml():'')
    +'</div>'
    +'<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--brd)">'
    +'<p style="font-size:11px;color:var(--mut);margin-bottom:10px">Exporta tus datos para guardarlos en Drive, WhatsApp o email, o importa un backup para restaurarlos.</p>'
    +'<div style="display:flex;flex-direction:column;gap:10px">'
    +'<button class="bpri" onclick="exportJSON()" style="display:flex;align-items:center;justify-content:center;gap:8px">'+icon('upload',16)+' Exportar / compartir backup</button>'
    +'<button class="bcnl" onclick="document.getElementById(\'imp-file\').click();closeModal()" style="display:flex;align-items:center;justify-content:center;gap:8px">'+icon('download',16)+' Importar backup JSON</button>'
    +'</div></div>'
    +'<div class="macts" style="margin-top:14px"><button class="bcnl" onclick="closeModal()">Cerrar</button></div>');
}
// Se guarda de inmediato (no espera al botón "Guardar" del modal, que solo aplica al Nombre) —
// afecta basicoQ2()/netoQ2() de TODOS los meses de una vez (ver diasQ2 en nomina-calc.js), así
// que conviene que quede claro en el toque mismo que ya se aplicó, reabriendo el modal con el
// toggle correcto en vez de dejarlo pendiente de "Guardar".
function startChangePIN(){
  openModal('<div class="mtitle">Cambiar PIN</div>'
    +'<div class="field"><label>PIN actual</label><input id="cp-old" type="password" inputmode="numeric" maxlength="6" placeholder="••••"></div>'
    +'<div class="field"><label>Nuevo PIN (6 dígitos)</label><input id="cp-new1" type="password" inputmode="numeric" maxlength="6" placeholder="••••••"></div>'
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
  if(n1.length!==6){ showAlert('El nuevo PIN debe tener 6 dígitos'); return; }
  if(n1!==n2){ showAlert('Los PIN nuevos no coinciden'); return; }
  if(!sessionDataKey){ showAlert('No se puede cambiar el PIN en este momento. Cierra y vuelve a abrir la app, e inténtalo de nuevo.'); return; }
  try{
    await commitNewPin(n1);
    closeModal();
    // La copia de la huella guarda el PIN viejo (ver js/bio.js): ya no sirve. Reactivarla pide
    // poner el dedo de nuevo, así que no se hace sola — solo se avisa.
    if(typeof bioEstado==='function' && bioEstado()!=='no'){
      bioDesactivar();
      toast('PIN actualizado ✓ Vuelve a activar la huella en Seguridad.',6000);
    } else {
      toast('PIN actualizado ✓');
    }
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
//
// Es OBLIGATORIO: sin él, un error con el PIN deja los datos sin forma de recuperarlos. Por eso
// ya no existe la opción de quitarlo (solo de cambiarlo), y si la app está desbloqueada sin
// número (usuario nuevo, o uno que ya existía antes de esta regla, o un backup importado sin
// teléfono) se pide en un modal que no se puede cerrar hasta guardarlo (ver
// exigirNumeroRecuperacion; closeModal/closeBg en ui-core.js lo respetan).
function faltaNumeroRecuperacion(){
  return appUnlocked && !!sessionDataKey && !localStorage.getItem('fin26_recovery');
}
function exigirNumeroRecuperacion(){
  if(!faltaNumeroRecuperacion()) return;
  startSetRecoveryPhone({obligatorio:true});
}
function startSetRecoveryPhone(opts){
  const obligatorio=!!(opts&&opts.obligatorio);
  const intro=obligatorio
    ?('<b style="color:var(--txt)">Necesitamos un número de celular para proteger tus datos.</b> '
      +'Si alguna vez tu PIN no logra descifrarlos (por ejemplo, tras un cambio de PIN que falló), '
      +'con los <b style="color:var(--txt)">últimos 6 dígitos</b> de este número recuperas el acceso y defines un PIN nuevo. '
      +'Sin él, tus datos podrían quedar sin forma de recuperarse. ')
    :('Si alguna vez tu PIN no logra descifrar tus datos (por ejemplo, tras un cambio de PIN que falló), '
      +'podrás recuperar el acceso ingresando los <b style="color:var(--txt)">últimos 6 dígitos</b> de este número, '
      +'y de inmediato se te pedirá definir un PIN nuevo. ');
  const acciones=obligatorio
    ?'<div class="macts"><button class="bpri" style="grid-column:1/-1" onclick="confirmSetRecoveryPhone()">Guardar y continuar</button></div>'
    :'<div class="macts"><button class="bcnl" onclick="closeModal()">Cancelar</button><button class="bpri" onclick="confirmSetRecoveryPhone()">Guardar</button></div>';
  openModal('<div class="mtitle">Número de recuperación</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:14px">'
    +intro
    +'<b style="color:var(--amb)">Cualquiera que conozca estos 6 dígitos podrá recuperar el acceso a tus datos</b>, así que usa un número que solo tú sepas de memoria.</p>'
    +'<div class="field"><label>Número de celular</label><input id="rp-phone" type="tel" inputmode="numeric" maxlength="15" placeholder="Ej: 3001234567" value="'+(perfilTelefono||'').replace(/"/g,'&quot;')+'"></div>'
    +acciones);
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
  if (!nom.aux_transporte_total) nom.aux_transporte_total = 0;
  if (nom.basico_q1 == null) nom.basico_q1  = Math.round(nom.basico_total/2);
  if (nom.basico_q2 == null) nom.basico_q2  = Math.round(nom.basico_total/2);
  if (nom.bonos_q1  == null) nom.bonos_q1   = Math.round(nom.bonos_total/2);
  if (nom.bonos_q2  == null) nom.bonos_q2   = Math.round(nom.bonos_total/2);
  if (nom.aux_transporte_q1 == null) nom.aux_transporte_q1 = Math.round(nom.aux_transporte_total/2);
  if (nom.aux_transporte_q2 == null) nom.aux_transporte_q2 = Math.round(nom.aux_transporte_total/2);
  if (!Array.isArray(nom.ded_q1)) nom.ded_q1 = [];
  if (!Array.isArray(nom.ded_q2)) nom.ded_q2 = [];
  if (!Array.isArray(m.q1_gastos)) m.q1_gastos = [];
  if (!Array.isArray(m.q2_gastos)) m.q2_gastos = [];
  if (!Array.isArray(m.agenda)) m.agenda = []; // ver js/agenda.js — recordatorios/tareas manuales de este mes
  // Gastos hormiga (ver js/hormiga.js): compras pequeñas sueltas, por quincena.
  if (!m.hormiga || typeof m.hormiga !== 'object') m.hormiga = {q1:[], q2:[]};
  if (!Array.isArray(m.hormiga.q1)) m.hormiga.q1 = [];
  if (!Array.isArray(m.hormiga.q2)) m.hormiga.q2 = [];

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
  limpiarDedIngresosLegacy(m); // los ingresos ya no viven como deducción en Nómina

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

// db/creditos/catTipos/catMetodos/perfilTelefono/perfilNombre/perfilQ2DiasFijos/sessionDataKey/
// saveChain se movieron a js/state.js (cargado antes que este archivo) — siguen siendo globals
// comunes, solo que ahora declaradas en un único lugar en vez de acá mezcladas con el código de
// autenticación/cifrado.

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
    const defaults=METODOS_PAGO_INICIALES;
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
// Devuelve el JSON descifrado como TEXTO (no el objeto) — loadAppData lo compara contra lo que
// guardaría save() para saber si las migraciones cambiaron algo.
async function decryptPayloadTexto(envelope){
  const iv = new Uint8Array(b64dec(envelope.iv));
  const ct = b64dec(envelope.ct);
  const pt = await crypto.subtle.decrypt({name:'AES-GCM', iv:iv}, sessionDataKey, ct);
  return new TextDecoder().decode(pt);
}
// Lo que se cifra en fin26_enc — compartido entre save() y la comparación de loadAppData(),
// para que ambos generen exactamente el mismo JSON (mismo orden de campos).
function datosParaGuardar(){
  return {db:db, creditos:creditos, catMetodos:catMetodos, catTipos:catTipos, telefono:perfilTelefono, nombre:perfilNombre, q2DiasFijos:perfilQ2DiasFijos, pago:perfilPago, tipoIngreso:perfilTipoIngreso};
}

// Carga db/creditos/catálogos ya descifrados con sessionDataKey (o migra datos legacy en
// texto plano la primera vez). Requiere que ensureDataKey() ya se haya ejecutado.
async function loadAppData(){
  const encRaw = localStorage.getItem('fin26_enc');
  let textoOriginal = null;
  if(encRaw){
    textoOriginal = await decryptPayloadTexto(JSON.parse(encRaw)); // lanza si la clave no coincide
    const payload = JSON.parse(textoOriginal);
    db = payload.db; creditos = payload.creditos||{}; catMetodos = payload.catMetodos||[]; catTipos = payload.catTipos||[]; perfilTelefono = payload.telefono||''; perfilNombre = payload.nombre||''; perfilQ2DiasFijos = !!payload.q2DiasFijos; perfilPago = normalizarPerfilPago(payload.pago); perfilTipoIngreso = normalizarTipoIngreso(payload.tipoIngreso);
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
  // Antes se volvía a cifrar y escribir TODO en cada desbloqueo (y eso además programaba una
  // subida a la nube), aunque las migraciones casi nunca cambian nada. Ahora solo se guarda si
  // el resultado difiere de lo que ya estaba cifrado, o si se acaban de migrar datos legacy.
  if(textoOriginal===null || JSON.stringify(datosParaGuardar())!==textoOriginal) await save();
  else cacheNombreParaSaludo(); // lo único de save() que sí hace falta en cada carga
  localStorage.removeItem('fin26');
  localStorage.removeItem('fin26_creditos');
  localStorage.removeItem('fin26_cat_metodos');
  localStorage.removeItem('fin26_cat_tipos');
}

// curM/gFiltro/gSort/gFilterOpen/headerUserMenuOpen/headerMonthPanelOpen/igHelpOpen/gGroupOpen/
// tcAbonoOpen/curTC/tcInfoOpen/curIngQ/curNomQ/summaryOpen/nomResumenOpen/statBreakdownOpen/
// STAT_BREAKDOWN_DOM_IDS/lastCreatedId/MESES/curTab/homeQ/homeQAutoDone/curNomQAutoDone/tcTipo
// también se movieron a js/state.js — ver ese archivo para la lista completa de estado
// compartido de la app.

function save(){
  saveChain = saveChain.then(async function(){
    if(!sessionDataKey) return; // no debería pasar: save() solo se usa después de desbloquear
    const envelope = await encryptPayload(datosParaGuardar());
    localStorage.setItem('fin26_enc', JSON.stringify(envelope));
    cacheNombreParaSaludo();
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

