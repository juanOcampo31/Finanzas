// ── Navegación ────────────────────────────────────────────────────────────────
function sw(i){curTab=i;render();}

// ── Modal ─────────────────────────────────────────────────────────────────────
function openModal(h){document.getElementById('mc').innerHTML=h;document.getElementById('mbg').classList.add('open');}
function closeModal(){document.getElementById('mbg').classList.remove('open');}
function closeBg(e){if(e.target===document.getElementById('mbg'))closeModal();}

// Ventana de pantalla completa (a diferencia del modal, que es un popup tipo bottom-sheet) —
// usada para vistas que se sienten como una pantalla propia (ej: detalle de un crédito) en
// vez de un diálogo momentáneo. Se cierra el modal al abrirla para no dejarlo colgado detrás.
function openWindow(h){closeModal();document.getElementById('wc').innerHTML=h;document.getElementById('wbg').classList.add('open');}
function closeWindow(){document.getElementById('wbg').classList.remove('open');}

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
  if(curTab===0)openGasto(null,homeQ);
  else if(curTab===1)openIngresoModal(null,curIngQ);
  else if(curTab===2)openTCModal(null);
  else if(curTab===3)addDed(curNomQ==='q1'?'Nómina Q1':'Nómina Q2');
  else openNewCredito();
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
  openGasto(data,wh,pid);
}
function cerrarPickerYVolver(){
  if(_gastoFormPending) reabrirGastoDesdePending(); else closeModal();
}
