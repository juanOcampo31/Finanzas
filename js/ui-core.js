// ── Navegación ────────────────────────────────────────────────────────────────
function sw(i){curTab=i;headerUserMenuOpen=false;headerMonthPanelOpen=false;registrarUsoTab(i);render();}

// ── Orden de la barra inferior por uso ───────────────────────────────────────
// Inicio (0) y Nómina (3) quedan SIEMPRE en las dos primeras posiciones; el resto (Agenda,
// Ingresos, Tarjeta, Créditos) se ordena de la más reciente a la menos reciente según la
// última vez que se abrió cada una (guardado por dispositivo en localStorage). El orden se
// aplica una sola vez al abrir la app (ver render()), no en cada toque: si los botones se
// reacomodaran apenas se toca uno, cambiarían de lugar debajo del dedo.
const TAB_USO_KEY='fin26_tab_uso';
const TABS_FIJAS=['0','3'];
let tabsOrdenadas=false;
function leerUsoTabs(){
  try{ return JSON.parse(localStorage.getItem(TAB_USO_KEY))||{}; }catch(e){ return {}; }
}
function registrarUsoTab(i){
  if(TABS_FIJAS.indexOf(String(i))>=0) return;
  const uso=leerUsoTabs();
  uso[i]=Date.now();
  try{ localStorage.setItem(TAB_USO_KEY,JSON.stringify(uso)); }catch(e){}
}
function ordenarTabsPorUso(){
  const bar=document.querySelector('.tabs');
  if(!bar || typeof bar.querySelectorAll!=='function' || typeof bar.appendChild!=='function') return;
  const botones=Array.prototype.slice.call(bar.querySelectorAll('.tab'));
  if(!botones.length) return;
  const uso=leerUsoTabs();
  const clave=function(b){ return b.dataset.tabs||''; };
  const fijas=TABS_FIJAS.map(function(t){ return botones.find(function(b){ return clave(b)===t; }); }).filter(Boolean);
  const resto=botones
    .filter(function(b){ return TABS_FIJAS.indexOf(clave(b))<0; })
    .map(function(b,idx){ return {b:b, idx:idx, t:uso[clave(b)]||0}; })
    .sort(function(a,b){ return (b.t-a.t) || (a.idx-b.idx); }) // nunca usadas: orden original
    .map(function(x){ return x.b; });
  fijas.concat(resto).forEach(function(b){ bar.appendChild(b); });
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function openModal(h){document.getElementById('mc').innerHTML=h;document.getElementById('mbg').classList.add('open');}
// Número de recuperación obligatorio (ver exigirNumeroRecuperacion en auth.js): mientras falte,
// cerrar cualquier modal vuelve a mostrar el que lo pide, y tocar el fondo no lo cierra. Si un
// flujo cierra y abre otro modal enseguida (p.ej. showConfirm → acción), ese nuevo lo tapa y al
// cerrarlo vuelve a aparecer el del número.
function closeModal(){
  document.getElementById('mbg').classList.remove('open');
  if(typeof faltaNumeroRecuperacion==='function' && faltaNumeroRecuperacion()) exigirNumeroRecuperacion();
}
function closeBg(e){
  if(e.target!==document.getElementById('mbg')) return;
  if(typeof faltaNumeroRecuperacion==='function' && faltaNumeroRecuperacion()) return;
  closeModal();
}

// Ventana de pantalla completa (a diferencia del modal, que es un popup tipo bottom-sheet) —
// usada para vistas que se sienten como una pantalla propia (ej: detalle de un crédito) en
// vez de un diálogo momentáneo. Se cierra el modal al abrirla para no dejarlo colgado detrás.
function openWindow(h){closeModal();document.getElementById('wc').innerHTML=h;document.getElementById('wbg').classList.add('open');}
function closeWindow(){document.getElementById('wbg').classList.remove('open');}

// ── Guía "Cómo funciona" (docs/ayuda.html) ─────────────────────────────────────────
// Se muestra en un iframe a pantalla completa, por encima de todo, en vez de navegar a la
// página: navegar descargaría la app y al volver pediría el PIN otra vez. `seccion` es el id
// de una sección de docs/ayuda.html (quincenas, nomina, ingresos, gastos, hormiga, tarjeta, creditos, agenda, meses, seguridad) para
// abrir directo ahí — así cualquier pantalla puede poner un "?" que lleve a su explicación.
function abrirAyuda(seccion){
  render(); // cierra el menú de usuario de fondo (headerUserMenuOpen ya quedó en false)
  let bg=document.getElementById('ayudaBg');
  if(!bg){
    bg=document.createElement('div');
    bg.id='ayudaBg';
    bg.className='ayuda-bg';
    bg.innerHTML='<div class="ayuda-bar"><span>Cómo funciona</span>'
      +'<button type="button" onclick="cerrarAyuda()" aria-label="Cerrar guía">'+icon('x',18)+'</button></div>'
      +'<iframe id="ayudaFrame" title="Cómo funciona"></iframe>';
    document.body.appendChild(bg);
  }
  document.getElementById('ayudaFrame').src='docs/ayuda.html'+(seccion?('#'+seccion):'');
  bg.classList.add('open');
}
function cerrarAyuda(){
  const bg=document.getElementById('ayudaBg');
  if(bg) bg.classList.remove('open');
}

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
  if(curTab===0)openGasto(null,homeQ); // los gastos hormiga se agregan desde su propia tarjeta en Inicio (js/hormiga.js)
  else if(curTab===1)openIngresoModal(null,curIngQ);
  else if(curTab===2)openTCModal(null);
  else if(curTab===3)addDed(curNomQ==='q1'?'Nómina Q1':'Nómina Q2');
  else if(curTab===4)openNewCredito();
  else agAbrirNuevo();
}

// ── CRUD Gastos ───────────────────────────────────────────────────────────────

// Contexto temporal para los pickers de "Forma de pago" y "Grupo" del formulario de gasto: la
// app solo tiene UN modal a la vez (openModal reemplaza todo #mc, no apila), así que abrir un
// picker sobre el formulario de gasto pierde ese formulario. En vez de eso, se captura lo que
// el usuario ya había escrito/marcado (capturarEstadoFormGasto), se guarda acá mientras el
// picker está abierto, y al elegir una opción se reabre openGasto con esos datos + la elección
// nueva — como si nunca se hubiera ido del formulario.
let _gastoFormPending=null;
function buscarGastoPorId(id,which){
  const list=which==='q1'?(getM().q1_gastos||[]):(getM().q2_gastos||[]);
  return (list||[]).find(function(x){return x.id===id;});
}
function capturarEstadoFormGasto(baseG,isE){
  const data=Object.assign({},baseG||{});
  const nEl=document.getElementById('g-n');
  if(nEl){ if(!isE) data.nombre=nEl.value; data.catTipoId=nEl.dataset.catTipoId||null; }
  if(document.getElementById('g-p')) data.presupuesto=moneyVal('g-p');
  if(document.getElementById('g-r')) data.pagado_real=moneyVal('g-r')||null;
  const mEl=document.getElementById('g-m'); if(mEl) data.metodo=mEl.value;
  const estadoEl=document.getElementById('g-estado');
  if(estadoEl) setGastoEstado(data,estadoEl.value||null);
  const gEl=document.getElementById('g-grupo-destino'); if(gEl) data.parentId=gEl.value||null;
  const crEl=document.getElementById('g-credito');
  if(crEl){ data.creditoId=crEl.value||null; data.numCuota=parseInt(crEl.dataset.cuota)||null; }
  return data;
}
function reabrirGastoDesdePending(){
  if(!_gastoFormPending) return;
  const {data,wh,pid}=_gastoFormPending;
  _gastoFormPending=null;
  openGasto(data,wh,pid,true); // skipFocus: es un re-render, no una apertura nueva del formulario
}
function cerrarPickerYVolver(){
  if(_gastoFormPending) reabrirGastoDesdePending(); else closeModal();
}
