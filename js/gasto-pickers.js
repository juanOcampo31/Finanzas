// Fase 2 de la migración a una arquitectura más modular: este archivo se dividió (antes tenía
// 1195 líneas) — solo quedan los pickers de pantalla completa (Forma de pago, Grupo, Crédito) y
// sus helpers genéricos. El resto vive en archivos por dominio: gasto-form.js (el formulario
// Editar/Nuevo gasto en sí), gasto-pago.js (marcar pagado/toggle, incluido el flujo de
// asociar movimiento de tarjeta) y gasto-drag.js (reordenar arrastrando).

// ── Helpers genéricos para los pickers de pantalla completa del formulario de gasto ─────────
// Los 4 pickers (Forma de pago, Grupo, Crédito, Gasto guardado) comparten el mismo esqueleto:
// capturar _gastoFormPending, listar filas "label + check si es la actual", un botón opcional
// de "crear nuevo" con borde punteado, y "Cancelar" que vuelve al formulario. Lo único que
// cambia entre ellos es DE DÓNDE sale la lista y QUÉ pasa al elegir un ítem (ver cada elegirX),
// así que solo se generaliza el armado de HTML — no el onSelect, que sí varía en cada caso.
function iniciarPickerPending(eid,wh,pid){
  const isE=!!eid;
  const baseG=isE?buscarGastoPorId(eid,wh):null;
  _gastoFormPending={data:capturarEstadoFormGasto(baseG,isE),wh:wh,pid:pid,eid:eid};
  return _gastoFormPending.data;
}
function pickerItemRow(onclickAttr,label,selected){
  return '<div onclick="'+onclickAttr+'" style="padding:13px 4px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--brd);cursor:pointer">'
    +'<span style="font-size:15px;font-weight:'+(selected?'700':'500')+';color:'+(selected?'var(--acc)':'var(--txt)')+'">'+esc(label)+'</span>'
    +(selected?('<span style="color:var(--acc);display:flex">'+icon('check',16)+'</span>'):'')
    +'</div>';
}
// `cancelOnclick` es opcional: por defecto vuelve al formulario de GASTO en curso
// (cerrarPickerYVolver, ver ui-core.js), que es el único caso que tenía este picker al
// generalizarse. Cualquier otro formulario que lo reutilice (Agenda, Tarjeta, Crédito...) debe
// pasar su propio "volver" (ej. una función tipo agRestaurarSnapshot) en vez de dejarlo con el
// default, o "Cancelar" terminaría cerrando el modal sin reabrir su formulario de origen.
function renderPickerModal(titulo,itemsHtml,extraBtnHtml,cancelOnclick){
  openModal('<div class="mtitle">'+esc(titulo)+'</div>'
    +'<div style="max-height:340px;overflow-y:auto;margin-bottom:14px">'+itemsHtml+'</div>'
    +(extraBtnHtml||'')
    +'<button class="bcnl" style="width:100%" onclick="'+(cancelOnclick||'cerrarPickerYVolver()')+'">Cancelar</button>');
}
function pickerExtraBtn(onclickAttr,label){
  return '<button onclick="'+onclickAttr+'" style="width:100%;background:none;border:1px dashed var(--brd2);border-radius:var(--r2);padding:11px;color:var(--acc);font-size:13px;cursor:pointer;margin-bottom:14px">'+esc(label)+'</button>';
}
function abrirPickerFormaPago(eid,wh,pid){
  const data=iniciarPickerPending(eid,wh,pid);
  const current=data.metodo;
  const itemsHtml=catMetodos.map(function(m,i){
    return pickerItemRow('elegirFormaPago('+i+')',m.nombre,m.nombre===current);
  }).join('');
  renderPickerModal('Forma de pago',itemsHtml,pickerExtraBtn('abrirNuevaFormaPagoDesdePicker()','+ Nueva forma de pago'));
}
function elegirFormaPago(idx){
  const m=catMetodos[idx];
  if(!m||!_gastoFormPending) return;
  _gastoFormPending.data.metodo=m.nombre;
  reabrirGastoDesdePending();
}
// "+ Nueva forma de pago" ya no vive en el formulario de gasto en sí (ver formaPagoRowHtml):
// ahora es una acción dentro del picker de Forma de pago, y al guardar vuelve directo al
// formulario de gasto con la nueva forma ya seleccionada, en vez de perder lo que se llevaba
// editado (como pasaba antes con openNewMetodoInline/saveNewMetodoInline).
function abrirNuevaFormaPagoDesdePicker(){
  openModal('<div class="mtitle">Nueva forma de pago</div>'
    +'<div class="field"><label>Nombre</label><input id="cat-nombre" placeholder="Ej: Daviplata, Efectivo..."></div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="abrirPickerFormaPago(\''+(_gastoFormPending?_gastoFormPending.eid:'')+'\',\''+(_gastoFormPending?_gastoFormPending.wh:'q1')+'\',\''+(_gastoFormPending?_gastoFormPending.pid:'')+'\')">Cancelar</button>'
    +'<button class="bpri" onclick="guardarNuevaFormaPagoDesdePicker()">Guardar</button>'
    +'</div>');
}
function guardarNuevaFormaPagoDesdePicker(){
  const nombre=document.getElementById('cat-nombre').value.trim();
  if(!nombre){showAlert('Escribe un nombre');return;}
  if(catMetodos.some(function(i){return i.nombre.toLowerCase()===nombre.toLowerCase();})){
    showAlert('Ya existe esa forma de pago');return;
  }
  catMetodos.push({id:uid(),nombre:nombre});
  save();
  if(_gastoFormPending){ _gastoFormPending.data.metodo=nombre; reabrirGastoDesdePending(); }
  else { closeModal(); toast('Agregado.'); }
}
function abrirPickerGrupo(eid,wh,pid){
  const data=iniciarPickerPending(eid,wh,pid);
  const listNow2=wh==='q1'?(getM().q1_gastos||[]):(getM().q2_gastos||[]);
  const gruposNow=(listNow2||[]).filter(function(x){return x.esGrupo&&x.id!==eid;});
  const current=data.parentId||null;
  function fila(gid,label){ return pickerItemRow("elegirGrupo('"+gid+"')",label,(current||'')===gid); }
  const itemsHtml=fila('','Sin agrupar')
    +gruposNow.map(function(gr){return fila(gr.id,nombreGasto(gr));}).join('');
  renderPickerModal('Asociar a grupo',itemsHtml);
}
function elegirGrupo(gid){
  if(!_gastoFormPending) return;
  _gastoFormPending.data.parentId=gid||null;
  reabrirGastoDesdePending();
}
function abrirPickerCredito(wh,pid){
  const data=iniciarPickerPending('',wh,pid);
  const current=data.creditoId||null;
  function fila(cid,label){ return pickerItemRow("elegirCredito("+(cid?"'"+cid+"'":"''")+")",label,(current||'')===cid); }
  const itemsHtml=fila('','Ninguno')
    +Object.keys(creditos).map(function(cid){return fila(cid,creditos[cid].nombre);}).join('');
  renderPickerModal('Asociar a crédito',itemsHtml,pickerExtraBtn('event.preventDefault();irCrearCreditoDesdeGastoPicker()','+ Crear crédito nuevo (cuotas fijas)'));
}
function elegirCredito(cid){
  if(!_gastoFormPending) return;
  if(!cid){
    _gastoFormPending.data.creditoId=null;
    _gastoFormPending.data.numCuota=null;
    reabrirGastoDesdePending();
    return;
  }
  const cr=creditos[cid]; if(!cr) return;
  // Misma regla que antes usaba sugerirCuotaCredito(): primera cuota sin pagar y sin gasto (ni
  // deducción de nómina) ya creado para ella — evita repetir una cuota que otro gasto ya cubre.
  const amort=calcAmortizacion(cr);
  const pagos=cr.pagos||[];
  const usadas=cuotasOcupadasCredito(cid,null);
  var idx=amort.rows.findIndex(function(r,i){return !pagos[i]&&!usadas[r.numero];});
  if(idx===-1) idx=amort.rows.findIndex(function(r,i){return !pagos[i];});
  if(idx===-1) idx=amort.rows.length-1;
  const row=amort.rows[idx];
  _gastoFormPending.data.creditoId=cid;
  _gastoFormPending.data.numCuota=row.numero;
  _gastoFormPending.data.nombre=prefijoCredito(cr)+cr.nombre;
  _gastoFormPending.data.presupuesto=row.valorCuota;
  reabrirGastoDesdePending();
}
// "+ Crear crédito nuevo" dentro del picker de "Asociar a crédito": mismo flujo que ya existía
// (irCrearCreditoDesdeGasto) — abandona este formulario y abre "Nuevo crédito"; al guardarlo,
// el gasto se crea solo, ya vinculado (ver crearGastoDesdeCredito). Toma nombre/valor/metodo de
// _gastoFormPending en vez de leer el DOM del formulario de gasto, porque ese formulario ya no
// está abierto (estamos parados en el picker, que lo reemplazó).
function irCrearCreditoDesdeGastoPicker(){
  const pending=_gastoFormPending;
  const nombreVal=pending?(pending.data.nombre||''):'';
  const valorVal=pending?(pending.data.presupuesto||0):0;
  const wh=pending?pending.wh:'q1', pid=pending?pending.pid:'';
  creditoDesdeGastoCtx={which:wh,parentId:pid||null,metodo:pending?(pending.data.metodo||''):''};
  openNewCredito('manual');
  const crNombre=document.getElementById('cr-nombre');
  if(crNombre&&nombreVal) crNombre.value=nombreVal;
  const crCuotaManual=document.getElementById('cr-cuota-manual');
  if(crCuotaManual&&valorVal>0) setMoneyValue(crCuotaManual,valorVal);
}
