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
function renderPickerModal(titulo,itemsHtml,extraBtnHtml){
  openModal('<div class="mtitle">'+esc(titulo)+'</div>'
    +'<div style="max-height:340px;overflow-y:auto;margin-bottom:14px">'+itemsHtml+'</div>'
    +(extraBtnHtml||'')
    +'<button class="bcnl" style="width:100%" onclick="cerrarPickerYVolver()">Cancelar</button>');
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
// "Vincular a gasto" (antes "Usar gasto guardado"): mismo patrón de picker que Forma de
// pago/Asociar a crédito, con "+ Crear gasto guardado nuevo" dentro del propio modal. Solo
// aplica al crear un gasto (nunca al editar uno existente), igual que antes.
function abrirPickerGastoGuardado(wh,pid){
  const data=iniciarPickerPending('',wh,pid);
  const current=data.catTipoId||null;
  function fila(tid,label){ return pickerItemRow("elegirGastoGuardado("+(tid?"'"+tid+"'":"''")+")",label,(current||'')===tid); }
  const itemsHtml=fila('','Ninguno')
    +catTipos.map(function(t){return fila(t.id,t.nombre);}).join('');
  renderPickerModal('Vincular a gasto',itemsHtml,pickerExtraBtn('event.preventDefault();abrirNuevoGastoGuardadoDesdePicker()','+ Crear gasto guardado nuevo'));
}
function elegirGastoGuardado(tid){
  if(!_gastoFormPending) return;
  if(!tid){
    _gastoFormPending.data.catTipoId=null;
    reabrirGastoDesdePending();
    return;
  }
  const item=catTipos.find(function(i){return i.id===tid;});
  if(!item) return;
  _gastoFormPending.data.catTipoId=item.id;
  _gastoFormPending.data.nombre=item.nombre;
  if(item.presupuesto) _gastoFormPending.data.presupuesto=item.presupuesto;
  if(item.metodo) _gastoFormPending.data.metodo=item.metodo;
  if(item.cuotas_total) _gastoFormPending.data.cuotas_total=item.cuotas_total;
  reabrirGastoDesdePending();
}
// "+ Crear gasto guardado nuevo" reutiliza el mismo formulario del catálogo de Gastos
// (gastoTemplateForm, usado también en Catálogos), pero Cancelar/Guardar vuelven al picker o
// al formulario de gasto en curso en vez de a la pantalla de Catálogos.
function abrirNuevoGastoGuardadoDesdePicker(){
  openModal('<div class="mtitle">Nuevo gasto guardado</div>'
    +gastoTemplateForm()
    +'<div class="macts">'
    +'<button class="bcnl" onclick="abrirPickerGastoGuardado(\''+(_gastoFormPending?_gastoFormPending.wh:'q1')+'\',\''+(_gastoFormPending?_gastoFormPending.pid:'')+'\')">Cancelar</button>'
    +'<button class="bpri" onclick="guardarNuevoGastoGuardadoDesdePicker()">Guardar</button>'
    +'</div>');
}
function guardarNuevoGastoGuardadoDesdePicker(){
  const nombre=document.getElementById('gt-nombre').value.trim();
  if(!nombre){showAlert('Escribe un nombre');return;}
  if(catTipos.some(function(i){return i.nombre.toLowerCase()===nombre.toLowerCase();})){
    showAlert('Ya existe un gasto con ese nombre');return;
  }
  const item={
    id:uid(),
    nombre:nombre,
    presupuesto:moneyVal('gt-presupuesto')||null,
    metodo:document.getElementById('gt-metodo').value||null,
    cuotas_total:parseInt(document.getElementById('gt-cuotas').value)||0,
    esMensualidad:document.getElementById('gt-mens').checked
  };
  catTipos.push(item);
  save();
  if(_gastoFormPending){
    _gastoFormPending.data.catTipoId=item.id;
    _gastoFormPending.data.nombre=item.nombre;
    if(item.presupuesto) _gastoFormPending.data.presupuesto=item.presupuesto;
    if(item.metodo) _gastoFormPending.data.metodo=item.metodo;
    if(item.cuotas_total) _gastoFormPending.data.cuotas_total=item.cuotas_total;
    reabrirGastoDesdePending();
  } else {
    openGastoTemplates(); toast('Gasto agregado');
  }
}
function openGasto(g,which,parentId){
  const e=g||{nombre:'',presupuesto:0,metodo:'',pagado_real:null,estado:null,pagado_flag:false};
  // isE (¿existe ya el gasto?) se basa en si trae id, no solo en si "g" es un objeto — al
  // reabrir el formulario tras elegir algo en el picker de Forma de pago/Grupo (ver
  // reabrirGastoDesdePending) se pasa un objeto con los datos capturados EN CURSO, que para un
  // gasto todavía no guardado no trae id; si isE se basara en "!!g" quedaría mal marcado como
  // edición (nombre bloqueado, aparecería "Eliminar gasto", etc.) solo por reabrir el formulario.
  const isE=!!(g&&g.id);
  const pid=parentId||'';
  const eid=isE?e.id:'';
  const wh=which||'q1';

  // Si el gasto está ligado a un crédito, "Valor" arranca mostrando el valor de ESA cuota (el
  // valor no lo decide el usuario, lo decide la tabla de amortización). El campo se puede
  // seguir editando: si el usuario escribe un número mayor, mientras la ventana esté abierta se
  // respeta tal cual lo que escribió (no se le pisa el campo en vivo) — solo AL GUARDAR (ver
  // saveG) ese excedente se traslada a "valor real pagado" y el campo vuelve a fijarse en la
  // cuota. Un valor igual o menor no dispara nada especial.
  var creditoLigado=(e.creditoId&&creditos[e.creditoId])?creditos[e.creditoId]:null;
  var cuotaValorActual=null, cuotaNumActual=null, cuotaTotalActual=null;
  if(creditoLigado){
    var amortLigado=calcAmortizacion(creditoLigado);
    cuotaNumActual=e.numCuota||1;
    var rowLigado=amortLigado.rows[cuotaNumActual-1];
    // OJO: rowLigado.valorCuota NO sirve acá si esta cuota ya se pagó con un abono mayor —
    // calcAmortizacionSinCache reemplaza el valor de la fila por el monto REAL pagado
    // (pagoDetalle[k].montoPagado) una vez registrado, así que después de un abono mayor
    // rowLigado.valorCuota deja de ser "la cuota" y pasa a ser "lo que ya pagaste". El valor
    // fijo/teórico de la cuota es amort.valorCuota (constante para todo el plazo, salvo la
    // última cuota si cierra antes por abonos previos — caso borde que no cubre este cálculo).
    cuotaValorActual=amortLigado.valorCuota||(rowLigado?rowLigado.valorCuota:e.presupuesto);
    cuotaTotalActual=amortLigado.rows.length;
  }
  var valorMostrado=creditoLigado?cuotaValorActual:e.presupuesto;
  // Si ya se pagó esta cuota con un valor distinto al fijo (abono mayor), se muestra como dato
  // adicional debajo de "Valor" — que siempre sigue mostrando la cuota, no lo realmente pagado.
  var pagadoRealDistinto=creditoLigado&&e.pagado_real!=null&&e.pagado_real!==cuotaValorActual;

  var defaultMetodo=e.metodo||(catMetodos[0]?catMetodos[0].nombre:'');
  if(!e.id&&pid){
    var parentG=(getM()[wh==='q1'?'q1_gastos':'q2_gastos']||[]).find(function(x){return x.id===pid;});
    if(parentG&&parentG.metodo) defaultMetodo=parentG.metodo;
  }

  const opts=catMetodos.map(function(x){return '<option'+(defaultMetodo===x.nombre?' selected':'')+'>'+esc(x.nombre)+'</option>';}).join('');

  // "Vincular a gasto" (antes "Usar gasto guardado") abre un picker de pantalla completa
  // (abrirPickerGastoGuardado), igual que "Forma de pago"/"Asociar a crédito" — con la lista
  // del catálogo de Gastos y, dentro del mismo picker, "+ Crear gasto guardado nuevo". Solo
  // aplica al crear (incluidos subgastos de un grupo), igual que antes.
  var templateField='';
  if(!isE){
    var templateLabelActual=e.catTipoId?((catTipos.find(function(t){return t.id===e.catTipoId;})||{}).nombre||'Ninguno'):'Ninguno';
    templateField='<div onclick="abrirPickerGastoGuardado(\''+wh+'\',\''+pid+'\')" style="padding:13px 2px;border-top:1px solid var(--brd);display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer">'
      +'<div style="font-size:15px;font-weight:600;color:var(--txt)">Vincular a gasto</div>'
      +'<div style="display:flex;align-items:center;gap:6px">'
      +'<span style="font-size:15px;font-weight:700;color:var(--mut)">'+esc(templateLabelActual)+'</span>'
      +'<span style="font-size:15px;color:var(--mut)">›</span>'
      +'</div></div>';
  }

  // Mover un gasto existente (independiente o de otro grupo) a un grupo desplegable ya
  // creado, sin tener que borrarlo y volver a crearlo como subgasto. No aplica al editar
  // el grupo mismo (no se puede anidar un grupo dentro de otro).
  // "Grupo" abre un picker de pantalla completa (abrirPickerGrupo) en vez de un <select> nativo,
  // igual que "Forma de pago" — más legible con listas largas y consistente con el mockup de
  // rediseño. El <select> real queda oculto solo para que saveG() lo siga leyendo tal cual.
  var moverGrupoField='';
  if(isE && !e.esGrupo){
    const listNow2=wh==='q1'?(getM().q1_gastos||[]):(getM().q2_gastos||[]);
    const gruposNow=listNow2.filter(function(x){return x.esGrupo&&x.id!==eid;});
    if(gruposNow.length>0||e.parentId){
      var grupoOpts='<option value="">— Sin agrupar —</option>'+gruposNow.map(function(gr){
        return '<option value="'+gr.id+'"'+(e.parentId===gr.id?' selected':'')+'>'+esc(nombreGasto(gr))+'</option>';
      }).join('');
      var grupoActual=e.parentId?(gruposNow.find(function(gr){return gr.id===e.parentId;})):null;
      var grupoLabel=grupoActual?nombreGasto(grupoActual):'Sin agrupar';
      moverGrupoField='<select id="g-grupo-destino" style="display:none">'+grupoOpts+'</select>'
        +'<div onclick="abrirPickerGrupo(\''+eid+'\',\''+wh+'\',\''+pid+'\')" style="padding:13px 2px;border-top:1px solid var(--brd);display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer">'
        +'<div style="font-size:15px;font-weight:600;color:var(--txt)">Asociar a grupo</div>'
        +'<div style="display:flex;align-items:center;gap:6px">'
        +'<span style="font-size:15px;font-weight:700;color:var(--mut)">'+esc(grupoLabel)+'</span>'
        +'<span style="font-size:15px;color:var(--mut)">›</span>'
        +'</div></div>';
    }
  }

  // "Asociar a crédito" abre un picker de pantalla completa (abrirPickerCredito), igual que
  // "Forma de pago" — con la lista de créditos y, dentro del mismo picker, "+ Crear crédito
  // nuevo (cuotas fijas)" (antes era un enlace aparte en Más opciones, solo visible cuando no
  // había ningún crédito asociado). El <select> real queda oculto solo para que saveG() lo siga
  // leyendo tal cual (incluido data-cuota, que usaba antes sugerirCuotaCredito()).
  var creditoField='';
  if(!isE){
    var creditoOpts='<option value="">— Ninguno —</option>'+Object.keys(creditos).map(function(cid){
      return '<option value="'+cid+'"'+(e.creditoId===cid?' selected':'')+'>'+esc(creditos[cid].nombre)+'</option>';
    }).join('');
    var creditoLabelActual=(e.creditoId&&creditos[e.creditoId])?creditos[e.creditoId].nombre:'Ninguno';
    creditoField='<select id="g-credito" style="display:none" data-cuota="'+(e.numCuota||'')+'">'+creditoOpts+'</select>'
      +'<div onclick="abrirPickerCredito(\''+wh+'\',\''+pid+'\')" style="padding:13px 2px;border-top:1px solid var(--brd);display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer">'
      +'<div style="font-size:15px;font-weight:600;color:var(--txt)">Asociar a crédito</div>'
      +'<div style="display:flex;align-items:center;gap:6px">'
      +'<span style="font-size:15px;font-weight:700;color:var(--mut)">'+esc(creditoLabelActual)+'</span>'
      +'<span style="font-size:15px;color:var(--mut)">›</span>'
      +'</div></div>';
  }

  const delBtn=isE?'<button class="bdel" onclick="delG(\''+eid+'\',\''+wh+'\')">Eliminar gasto</button>':'';
  // "Convertir en grupo desplegable" es el mismo botón/modal tanto al crear un gasto nuevo como
  // al editar uno existente — antes crear-como-grupo tenía su propio flujo en línea (checkbox
  // "Agrupar subgastos" + vincular tarjeta + autocompletar nombre), duplicando lo que ya hacía
  // convertirGrupo()/saveConvertir() para un gasto ya guardado. Para un gasto nuevo (sin id
  // todavía), convertirEnGrupoDesdeCreacion() primero lo guarda (mismo saveG de siempre) y
  // luego abre convertirGrupo() sobre el que se acaba de crear.
  var grpBtn='';
  if(!isE && !pid){
    grpBtn='<button class="bdel" style="background:var(--acc-d);border-color:var(--acc);color:var(--acc);margin-top:6px" onclick="convertirEnGrupoDesdeCreacion(\''+wh+'\',\''+pid+'\')">Convertir en grupo desplegable</button>';
  } else if(isE&&!e.parentId&&!e.esGrupo){
    grpBtn='<button class="bdel" style="background:var(--acc-d);border-color:var(--acc);color:var(--acc);margin-top:6px" onclick="convertirGrupo(\''+eid+'\',\''+wh+'\')">Convertir en grupo desplegable</button>';
  } else if(e.esGrupo){
    grpBtn='<button class="bdel" style="background:var(--acc-d);border-color:var(--acc);color:var(--acc);margin-top:6px" onclick="convertirGrupo(\''+eid+'\',\''+wh+'\')">Editar grupo / base</button>'
          +'<button class="bdel" style="margin-top:6px" onclick="delGrupo(\''+eid+'\',\''+wh+'\')">Eliminar grupo (y subgastos)</button>';
  }

  // Campo Nombre: al EDITAR un gasto ya existente no se puede renombrar desde aquí (se
  // muestra como texto fijo, sin caja de input) — evita relacionar mal un gasto ya en curso
  // (p.ej. una cuota de crédito o algo vinculado a un catálogo) con un nombre distinto al que
  // tiene en el resto de la app. Al CREAR uno nuevo sigue siendo editable como siempre,
  // incluida la lógica de vínculo a catálogo (readonly + nota para desvincular).
  var nameFieldHtml;
  if(isE){
    // Un gasto ligado a un crédito sigue sin poder renombrarse aquí (su nombre lo fija el
    // crédito, ver prefijoCredito en elegirCredito/crearGastoDesdeCredito) — para cualquier
    // otro gasto ya guardado, el lápiz habilita el input (ver habilitarEdicionNombreGasto).
    var nombreEditBtn=creditoLigado?'':('<button type="button" onclick="habilitarEdicionNombreGasto()" style="background:none;border:none;color:var(--mut);cursor:pointer;display:flex;align-items:center;flex-shrink:0;padding:2px">'+icon('edit',14)+'</button>');
    nameFieldHtml='<div style="padding:13px 2px;border-top:1px solid var(--brd);display:flex;flex-direction:column;gap:3px">'
      +'<div style="font-size:12px;font-weight:600;color:var(--mut)">Nombre</div>'
      +'<div style="display:flex;align-items:center;justify-content:space-between;gap:10px">'
      +'<input id="g-n" value="'+esc(e.nombre)+'" readonly data-cat-tipo-id="'+(e.catTipoId||'')+'" style="font-family:inherit;background:transparent;border:none;outline:none;font-size:17px;font-weight:700;color:var(--txt);padding:0;cursor:default;flex:1;min-width:0">'
      +(creditoLigado?('<span onclick="creditoDetalleDesdeModal=false;closeModal();openCreditoDetalle(\''+e.creditoId+'\')" style="font-size:11px;font-weight:600;color:var(--acc);cursor:pointer;text-decoration:underline;text-underline-offset:2px;white-space:nowrap;flex-shrink:0">Ver detalle '+etiquetaCredito(creditoLigado)+' · '+esc(creditoLigado.nombre)+'</span>'):nombreEditBtn)
      +'</div></div>';
  } else {
    var linkedItem = e.catTipoId ? catTipos.find(function(t){return t.id===e.catTipoId;}) : null;
    if(linkedItem){
      nameFieldHtml = '<div style="padding:13px 2px;border-top:1px solid var(--brd)"><div class="field" style="margin:0"><label>Nombre</label>'
        +'<input id="g-n" value="'+esc(linkedItem.nombre)+'" readonly data-cat-tipo-id="'+linkedItem.id+'" style="opacity:.7;cursor:not-allowed">'
        +'<div id="g-n-note" style="font-size:11px;color:var(--acc);margin-top:4px">Vinculado al catálogo "'+esc(linkedItem.nombre)+'". Para renombrarlo edita el catálogo, o <span onclick="unlinkGastoNameField()" style="text-decoration:underline;cursor:pointer">desvincúlalo aquí</span>.</div>'
        +'</div></div>';
    } else {
      nameFieldHtml = '<div style="padding:13px 2px;border-top:1px solid var(--brd)"><div class="field" style="margin:0"><label>Nombre</label><input id="g-n" value="'+esc(e.nombre)+'" data-cat-tipo-id="" placeholder="Arriendo, Mercado, Luz..."></div></div>';
    }
  }

  // "Crear crédito nuevo": un gasto a cuotas fijas se maneja como un crédito interno con tasa 0
  // (cuota fija, sin interés) — reutiliza todo el motor de amortización/generación mensual de
  // créditos en vez de un contador manual de cuotas. Es un enlace (no un check, porque no es un
  // estado del gasto sino una acción: navega directo a Créditos para crearlo ahí (con su plazo,
  // frecuencia y fecha reales) y, al guardar el crédito, este mismo gasto (en la Q en la que se
  // estaba creando) se agrega automáticamente ya vinculado — no hay que volver a este
  // formulario. El enlace "Ver detalle del crédito" para gastos YA vinculados vive junto al
  // nombre del crédito, debajo de "Valor" (ver valorBlockHtml) — no aquí en Más opciones, porque
  // es la info más relevante de ESE gasto puntual.
  // (El viejo editor manual "Maneja cuotas" — cuotas_total/cuota_actual sin creditoId — se quitó
  // del proceso: con créditos ya cubre ese caso de forma completa, sin duplicar lógica.)

  // Bloque "Valor": número grande centrado con línea de acento debajo, como el mockup de
  // rediseño (Editar Gasto.dc.html, tarjeta 2A). "Valor" siempre representa el valor de la
  // cuota vigente para este período (para un gasto ligado a un crédito, la cuota real de la
  // tabla de amortización; para cualquier otro, el presupuesto de ese gasto en esta quincena).
  // El enlace "Ver detalle del crédito" va junto al nombre del gasto (ver nameFieldHtml), no
  // acá — acá solo queda el subtítulo "Cuota N de M".
  const valorSubtitulo=creditoLigado
    ?('Cuota '+cuotaNumActual+' de '+cuotaTotalActual)
    :'COP · valor de la cuota';
  const valorBlockHtml='<div style="padding:4px 4px 6px;display:flex;flex-direction:column;gap:5px;align-items:center;text-align:center">'
    +'<div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)">Valor</div>'
    +'<div style="display:flex;align-items:baseline;gap:6px;padding-bottom:6px;border-bottom:2px solid var(--acc)">'
    +'<span style="font-size:22px;font-weight:600;color:var(--mut)">$</span>'
    +'<input id="g-p" type="text" inputmode="numeric" value="'+moneyInputFmt(valorMostrado)+'" oninput="maskMoneyInput(this);'
    +(creditoLigado?('mostrarCuotaOriginalSiCambia(this,'+cuotaValorActual+',\''+wh+'\')'):'')
    +'"'
    +' style="font-family:inherit;width:180px;background:transparent;border:none;outline:none;font-size:38px;font-weight:800;color:var(--txt);letter-spacing:-.02em;font-variant-numeric:tabular-nums;text-align:center;padding:0">'
    +'</div>'
    +'<div style="font-size:11px;color:var(--mut)">'+valorSubtitulo
    +(creditoLigado?('<span id="g-cuota-original-line" style="display:none"> · Cuota original: '+cop(cuotaValorActual)+'</span>'):'')
    +(creditoLigado?'<span id="g-pago-extra-span" style="display:none;color:var(--acc);font-weight:600"></span>':'')
    +(pagadoRealDistinto?(' · <span id="g-pagado-real-line" style="color:var(--acc);font-weight:600">Pagaste '+cop(e.pagado_real)+'</span>'):'')
    +'</div>'
    +'</div>';

  // Forma de pago: fila que abre un picker de pantalla completa (abrirPickerFormaPago) con la
  // lista de formas de pago, en vez de un <select> nativo — más legible y es donde ahora vive
  // "+ Nueva forma de pago" (ya no ocupa espacio propio en el formulario de gasto). El <select>
  // real queda oculto solo para que saveG() lo siga leyendo tal cual.
  const formaPagoRowHtml='<select id="g-m" style="display:none">'+opts+'</select>'
    +'<div onclick="abrirPickerFormaPago(\''+eid+'\',\''+wh+'\',\''+pid+'\')" style="padding:13px 2px;border-top:1px solid var(--brd);display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer">'
    +'<div style="font-size:15px;font-weight:600;color:var(--txt)">Forma de pago</div>'
    +'<div style="display:flex;align-items:center;gap:6px">'
    +'<span style="font-size:15px;font-weight:700;color:var(--txt)">'+esc(defaultMetodo)+'</span>'
    +'<span style="font-size:15px;color:var(--mut)">›</span>'
    +'</div></div>';

  // Sección "Estado": campo único de tres valores mutuamente excluyentes — null ("sin
  // definir", el estado por defecto de un gasto nuevo, todavía no revisado), 'sinpagar'
  // (decidí que está pendiente) o 'pagado' (el dinero ya salió). Se muestra como dos tarjetas
  // deseleccionables: tocar la inactiva la activa y apaga la otra; tocar la ACTIVA la
  // desmarca y vuelve a "sin definir". Reemplaza los dos checkboxes independientes de antes
  // (g-pd/g-sp), que permitían guardar el estado imposible "pagado y sin pagar a la vez".
  // El rótulo de la segunda tarjeta cambia según la quincena (labelSinPagar, más abajo): "Mover
  // a Q2" en Q1, "Sin pagar" en Q2. En Q1, seleccionar esa tarjeta guarda el formulario de una
  // vez (mismo saveG de siempre) y por lo tanto abre directo "¿Mover a Q2?" — no hace falta un
  // botón aparte para eso, ver seleccionarEstadoGasto().
  // Altura de las tarjetas igualada a la de los botones de la app (.bpri/.bcnl: padding
  // 11px) — por eso padding vertical chico + altura fija con contenido centrado, en vez del
  // padding amplio de antes (pensado para dos líneas de texto en ambas tarjetas).
  const CARD_ESTADO_BASE='flex:1;height:44px;padding:0 10px;border-radius:14px;background:#0B1526;border:1px solid #22304F;display:flex;flex-direction:column;justify-content:center;gap:2px;align-items:center;cursor:pointer;transition:all 140ms ease;box-sizing:border-box';
  const CARD_SINPAGAR_ON='flex:1;height:44px;padding:0 10px;border-radius:14px;background:#2A1D06;border:1px solid #F59E0B;display:flex;flex-direction:column;justify-content:center;gap:2px;align-items:center;cursor:pointer;transition:all 140ms ease;box-sizing:border-box';
  const CARD_PAGADO_ON='flex:1;height:44px;padding:0 10px;border-radius:14px;background:#062B33;border:1px solid #22D3EE;display:flex;flex-direction:column;justify-content:center;gap:2px;align-items:center;cursor:pointer;transition:all 140ms ease;box-sizing:border-box';
  const estadoInicial=gastoEstado(e);
  const tituloPagadoColor=estadoInicial==='pagado'?'#67E8F9':'#94A3B8';
  const tituloSinPagarColor=estadoInicial==='sinpagar'?'#FBBF24':'#94A3B8';
  // La tarjeta "Sin pagar" muestra un solo rótulo (sin subtítulo aparte): en Q1 dice "Mover a
  // Q2" (la acción que en verdad va a pasar), en Q2 dice "Sin pagar" (no hay adónde moverlo,
  // queda como recordatorio). La primera tarjeta dice "Pagar" cuando todavía no está marcada
  // (invita a la acción) y "Pagado" cuando ya lo está (describe el hecho) — mismo criterio en
  // vivo al seleccionarla/deseleccionarla, ver pintarEstadoGasto().
  const labelSinPagar=wh==='q1'?'Mover a Q2':'Sin pagar';
  const labelPagado=estadoInicial==='pagado'?'Pagado':'Pagar';
  const estadoSectionHtml='<div style="padding:4px 2px 4px">'
    +'<input type="hidden" id="g-estado" value="'+(estadoInicial||'')+'">'
    +'<div style="display:flex;gap:10px">'
    +'<div id="g-card-pagado" onclick="seleccionarEstadoGasto(\'pagado\',\''+wh+'\',\''+eid+'\',\''+pid+'\')" style="'+(estadoInicial==='pagado'?CARD_PAGADO_ON:CARD_ESTADO_BASE)+'">'
    +'<div id="g-card-pagado-titulo" style="font-size:14px;font-weight:800;color:'+tituloPagadoColor+'">'+labelPagado+'</div>'
    +'</div>'
    +'<div id="g-card-sinpagar" onclick="seleccionarEstadoGasto(\'sinpagar\',\''+wh+'\',\''+eid+'\',\''+pid+'\')" style="'+(estadoInicial==='sinpagar'?CARD_SINPAGAR_ON:CARD_ESTADO_BASE)+'">'
    +'<div id="g-card-sinpagar-titulo" style="font-size:14px;font-weight:800;color:'+tituloSinPagarColor+'">'+labelSinPagar+'</div>'
    +'</div>'
    +'</div>'
    +'</div>';

  // Sección "Más opciones": lo que se usa rara vez (asociar/crear/ver crédito, cuotas manuales
  // legacy, convertir en grupo desplegable) vive plegado detrás de un toggle en vez de ocupar
  // espacio en cada edición. Se abre plegada por defecto al crear un gasto nuevo; al editar uno
  // que YA tiene alguno de estos datos, se abre desplegada para no esconder información que ya
  // existe. El "valor real pagado" ya no vive aquí como campo aparte: para un gasto ligado a un
  // crédito se captura escribiendo un valor mayor directamente en "Valor" (se procesa al
  // guardar, ver saveG).
  var masOpcionesInner=creditoField+grpBtn;
  const hayDatosAvanzados=isE&&(!!e.creditoId||!!e.esGrupo);
  const masOpDisplay=hayDatosAvanzados?'block':'none';
  const masOpChevron=hayDatosAvanzados?'⌃':'⌄';
  const masOpcionesSectionHtml=masOpcionesInner?(
    '<div style="border-top:1px solid var(--brd)">'
    +'<div onclick="toggleMasOpciones()" style="padding:16px 2px 8px;display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer">'
    +'<div><div style="font-size:15px;font-weight:700;color:var(--txt)">Más opciones</div>'
    +'<div style="font-size:12px;color:var(--mut);margin-top:2px">Crédito · convertir en grupo</div></div>'
    +'<span id="g-masop-chevron" style="font-size:15px;color:var(--acc);font-weight:800;flex-shrink:0">'+masOpChevron+'</span>'
    +'</div>'
    +'<div id="g-masop-body" style="display:'+masOpDisplay+';padding:2px 2px 12px">'
    +masOpcionesInner
    +'</div></div>'
  ):'';

  // Una sola hoja continua (sin tarjetas ni encabezados de sección), como en el mockup de
  // rediseño: Valor, Estado (justo debajo del valor de la cuota — es lo primero que se decide
  // al revisar un gasto), Nombre, Forma de pago, Grupo, plantilla/agrupar (solo al crear) y
  // Más opciones, separados por líneas finas en vez de tarjetas independientes.
  // "Valor real pagado" ya no es un campo visible del formulario, pero sigue existiendo como
  // dato del gasto (pagado_real) — lo siguen leyendo saveG() y sincronizarCreditoDesdeGasto().
  // Este input oculto solo sirve de valor por defecto al abrir el formulario (y para que los
  // pickers de Forma de pago/Grupo lo preserven vía capturarEstadoFormGasto); saveG() calcula
  // el valor real a guardar directamente a partir de lo escrito en "Valor", no de este campo.
  const realHiddenInput='<input type="hidden" id="g-r" value="'+moneyInputFmt(e.pagado_real)+'">';

  const html='<div class="mtitle">'+(isE?'Editar gasto':'Nuevo gasto')+'</div>'
    +realHiddenInput
    +valorBlockHtml
    +estadoSectionHtml
    +nameFieldHtml
    +formaPagoRowHtml
    +templateField
    +moverGrupoField
    +masOpcionesSectionHtml
    +'<div class="macts"><button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="saveG(\''+eid+'\',\''+wh+'\',\''+pid+'\')">Guardar</button></div>'
    +delBtn;
  openModal(html);
  // Foco + selección automática en "Valor" al abrir el formulario: en móvil dispara el
  // teclado numérico de una vez (el input ya tiene inputmode="numeric") sin que el usuario
  // tenga que tocarlo primero, y con el valor seleccionado alcanza con escribir para
  // reemplazarlo. El setTimeout es necesario porque openModal recién acaba de inyectar el
  // HTML — sin él, el input todavía no está listo para recibir foco en algunos navegadores.
  setTimeout(function(){
    const pEl=document.getElementById('g-p');
    if(pEl){ pEl.focus(); pEl.select(); }
  },50);
}
// Lápiz junto a "Nombre" al editar un gasto ya guardado (ver nameFieldHtml en openGasto):
// el input nace readonly para no permitir renombrar sin querer un gasto que puede estar
// vinculado a un catálogo o a un grupo; tocar el lápiz lo habilita para ese guardado puntual.
function habilitarEdicionNombreGasto(){
  const nEl=document.getElementById('g-n');
  if(!nEl) return;
  nEl.readOnly=false;
  nEl.style.cursor='text';
  nEl.focus();
  nEl.select();
}
function toggleMasOpciones(){
  const body=document.getElementById('g-masop-body');
  const chev=document.getElementById('g-masop-chevron');
  if(!body) return;
  const opening=body.style.display==='none';
  body.style.display=opening?'block':'none';
  if(chev) chev.textContent=opening?'⌃':'⌄';
}

// Al marcar "Crear crédito nuevo" en un gasto nuevo, se abandona este formulario y se abre
// directamente "Nuevo crédito" (con nombre y cuota precargados si ya se habían escrito), para
// que el crédito se cree con sus datos reales (plazo, frecuencia, fecha) en vez de un mini-form
// aparte dentro del gasto. Se guarda en qué Q (y grupo, si aplica) se estaba creando el gasto
// para que, al guardar el crédito, saveNewCredito() cree ahí mismo el gasto ya vinculado —
// el usuario no tiene que volver a este formulario ni usar "Asociar a crédito" manualmente.
let creditoDesdeGastoCtx=null;
function irCrearCreditoDesdeGasto(which,parentId){
  const nombreVal=document.getElementById('g-n')?.value.trim()||'';
  const valorVal=moneyVal('g-p');
  const metodoVal=document.getElementById('g-m')?.value||'';
  creditoDesdeGastoCtx={which:which||'q1',parentId:parentId||null,metodo:metodoVal};
  openNewCredito('manual');
  const crNombre=document.getElementById('cr-nombre');
  if(crNombre&&nombreVal) crNombre.value=nombreVal;
  const crCuotaManual=document.getElementById('cr-cuota-manual');
  if(crCuotaManual&&valorVal>0) setMoneyValue(crCuotaManual,valorVal);
}

// Crea el gasto de la primera cuota de un crédito recién creado, ya vinculado (creditoId/
// numCuota), en la Q donde el usuario venía trabajando — mismo shape que genera
// generarGastosCredito() para los meses siguientes, así el badge "N/M · mes" es consistente.
function crearGastoDesdeCredito(creditoId,ctx){
  const cr=creditos[creditoId]; if(!cr) return;
  const amort=calcAmortizacion(cr);
  const row=amort.rows[0];
  const m=getM(),list=ctx.which==='q1'?m.q1_gastos:m.q2_gastos;
  const gasto={
    id:uid(),nombre:prefijoCredito(cr)+cr.nombre,presupuesto:row.valorCuota,
    metodo:ctx.metodo||(catMetodos[0]?catMetodos[0].nombre:''),
    pagado_real:null,estado:null,pagado_flag:false,sinpagar:false,parentId:ctx.parentId||null,
    cuotas_total:cr.cuotas,cuota_actual:1,creditoId:creditoId,numCuota:1,mensualidad:null
  };
  list.push(gasto);
  lastCreatedId=gasto.id;
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

function saveG(id,which,parentId){
  const m=getM(),list=which==='q1'?m.q1_gastos:m.q2_gastos;
  // Se consume (y limpia) el flag apenas entra la función, no al final: si algo más abajo
  // corta la ejecución con un "return" temprano (nombre vacío, orden de pago bloqueado), el
  // flag no debe quedar pegado en true esperando el próximo guardado que nada tenga que ver.
  const convertirTrasGuardar=_convertirGrupoTrasGuardar;
  _convertirGrupoTrasGuardar=false;
  const nEl=document.getElementById('g-n');
  const nombre=nEl.value.trim();
  const catTipoIdSel=nEl.dataset.catTipoId||null;
  const presup=moneyVal('g-p');
  let real=moneyVal('g-r')||null;
  const metodo=document.getElementById('g-m').value;
  // Estado: campo único ('pagado' | 'sinpagar' | null vía cadena vacía) que viene de las dos
  // tarjetas deseleccionables de Estado (ver openGasto) — reemplaza los checkboxes g-pd/g-sp
  // independientes, que permitían dejar guardado el estado imposible "pagado y sin pagar" a
  // la vez. paid/sinpagar se siguen derivando acá porque el resto de saveG (y sincronizarCreditoDesdeGasto)
  // todavía los usa como booleanos.
  const estadoSelEl=document.getElementById('g-estado');
  let paid=estadoSelEl?estadoSelEl.value==='pagado':false;
  let sinpagar=estadoSelEl?estadoSelEl.value==='sinpagar':false;
  const creditoSel=document.getElementById('g-credito');
  const creditoIdSel=creditoSel?creditoSel.value||null:null;
  if(!nombre){showAlert('Escribe un nombre');return;}
  let gasto;
  if(id){
    gasto=list.find(x=>x.id===id);
    if(gasto){
      const estadoAntes=gastoEstado(gasto);
      // "Valor" de un gasto ligado a un crédito no es libre: lo fija la cuota de la tabla de
      // amortización (ver comentario de creditoLigado en openGasto). Mientras el formulario
      // está abierto se respeta lo que el usuario escriba (no se le pisa el campo en vivo);
      // recién ACÁ, al guardar, si lo escrito supera la cuota se traslada a "valor real pagado"
      // y "Valor" queda fijado en la cuota — sin esto último, cualquier número que se hubiera
      // escrito de más quedaría guardado como presupuesto en vez de como pago real.
      let presupFinal=presup;
      if(gasto.creditoId && creditos[gasto.creditoId]){
        const amortG=calcAmortizacion(creditos[gasto.creditoId]);
        const rowG=amortG.rows[(gasto.numCuota||1)-1];
        // amortG.valorCuota (fijo/teórico) en vez de rowG.valorCuota: si esta cuota ya se pagó
        // con un abono mayor, rowG.valorCuota pasa a ser el monto REAL pagado (ver comentario
        // en openGasto), y pinear presupuesto a eso reintroduciría el mismo dato equivocado.
        const cuotaValorG=amortG.valorCuota||(rowG?rowG.valorCuota:presup);
        // Siempre (no solo si "real" venía vacío): si ya había un abono mayor registrado y el
        // usuario escribe un número distinto, ese nuevo número es el que debe quedar guardado.
        // Escribir un valor mayor a la cuota es, en sí, la señal de que esta cuota se pagó, así
        // que también marca "Pagado" (estado), sin obligar a tocar la tarjeta de Estado aparte.
        if(presup>cuotaValorG){ real=presup; paid=true; sinpagar=false; }
        presupFinal=cuotaValorG;
      }
      gasto.nombre=nombre;gasto.catTipoId=catTipoIdSel||null;gasto.presupuesto=presupFinal;gasto.pagado_real=real;gasto.metodo=metodo;
      setGastoEstado(gasto,paid?'pagado':(sinpagar?'sinpagar':null));
      gasto.fecha_pago=document.getElementById('g-fp')?.value||gasto.fecha_pago||null;
      gasto.comprobante=document.getElementById('g-cmp')?.value.trim()||gasto.comprobante||null;
      const grupoDestinoEl=document.getElementById('g-grupo-destino');
      if(grupoDestinoEl) gasto.parentId=grupoDestinoEl.value||null;
      if(!sincronizarCreditoDesdeGasto(gasto,estadoAntes)) return;
    }
  } else {
    // If this is a subgasto, inherit parent group's metodo
    var finalMetodo=metodo;
    if(parentId){
      var parentG=list.find(function(x){return x.id===parentId;});
      if(parentG&&parentG.metodo) finalMetodo=parentG.metodo;
    }
    gasto={id:uid(),nombre,presupuesto:presup,metodo:finalMetodo,pagado_real:real,estado:paid?'pagado':(sinpagar?'sinpagar':null),pagado_flag:paid,sinpagar,parentId:parentId||null,cuotas_total:0,cuota_actual:0};
    if(catTipoIdSel){ gasto.catTipoId=catTipoIdSel; }
    if(creditoIdSel){
      gasto.creditoId=creditoIdSel;
      // elegirCredito() (picker "Asociar a crédito") calcula la cuota sugerida y la deja en
      // data-cuota del <select> oculto al reabrir el formulario.
      const cuotaDesdeSel=parseInt(creditoSel?.dataset.cuota)||0;
      gasto.numCuota=cuotaDesdeSel||1;
      // cuotas_total/cuota_actual también se completan aquí (aunque el gasto no "maneje
      // cuotas" por sí mismo) para que la fila muestre el badge "N/M · mes" igual que los
      // gastos que genera generarGastosCredito() automáticamente los meses siguientes.
      var crAsoc=creditos[creditoIdSel];
      if(crAsoc){ gasto.cuotas_total=crAsoc.cuotas; gasto.cuota_actual=gasto.numCuota; }
      if(!sincronizarCreditoDesdeGasto(gasto,null)) return;
    }
    list.push(gasto);
    lastCreatedId=gasto.id;
  }
  save(); closeModal(); render();
  setTimeout(function(){ lastCreatedId=null; }, 400);
  // "Convertir en grupo desplegable" sobre un gasto recién creado (ver
  // convertirEnGrupoDesdeCreacion): ya quedó guardado como gasto normal arriba, ahora se abre
  // el mismo modal de convertir/configurar grupo que usa un gasto existente, en vez del toast
  // o la pregunta de mover a Q2.
  if(convertirTrasGuardar){
    convertirGrupo(gasto.id,which);
    return;
  }
  // Si es Q1 y se marcó "Sin pagar", ofrecer crear el gasto en Q2
  if(which==='q1' && sinpagar) {
    ofrecerCopiarQ2(gasto);
  } else {
    toast(id?'Gasto actualizado':(gasto.esGrupo?'Grupo creado ✓':'Gasto agregado'));
  }
}
// Permite marcar "Convertir en grupo desplegable" desde Más opciones al CREAR un gasto nuevo
// (antes solo existía para uno ya guardado): primero lo guarda con el saveG de siempre y luego
// abre convertirGrupo() sobre el que se acaba de crear, en vez de duplicar ese flujo.
let _convertirGrupoTrasGuardar=false;
function convertirEnGrupoDesdeCreacion(wh,pid){
  const nEl=document.getElementById('g-n');
  if(!nEl||!nEl.value.trim()){ showAlert('Escribe un nombre'); return; }
  _convertirGrupoTrasGuardar=true;
  saveG('',wh,pid);
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
  const copia={id:uid(),nombre:g.nombre,catTipoId:g.catTipoId||null,presupuesto:g.presupuesto,metodo:g.metodo,pagado_real:null,estado:null,pagado_flag:false,sinpagar:false};
  // Si el gasto viene de un crédito, la copia en Q2 debe heredar el vínculo (creditoId/numCuota)
  // para que siga representando la misma cuota — de lo contrario el crédito queda con esa cuota
  // pendiente sin ningún gasto que permita marcarla como pagada, y la copia en Q2 pierde toda
  // relación con el crédito. Como la cuota debía pagarse en la quincena anterior (Q1) y no se
  // pagó, aparecerá como "Vencido" tanto en el crédito como en esta fila (ver diasHasta/badge).
  if(g.creditoId){
    copia.creditoId=g.creditoId;
    copia.numCuota=g.numCuota;
    copia.cuotas_total=g.cuotas_total;
    copia.cuota_actual=g.cuota_actual;
  }
  if(g.mensualidad) copia.mensualidad=g.mensualidad;
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
// ── Reordenar manualmente arrastrando (mantener presionado) ─────────────────────────────
// Sin botón ni ícono aparte: mantener presionado sobre el propio gasto/grupo (fuera del
// checkbox/botones, que deben seguir funcionando con un toque normal) durante ~300ms sin
// moverse lo arma para arrastrar; a partir de ahí sigue el dedo/mouse y lo suelta en la
// posición exacta. Usa Pointer Events (mouse y touch por igual). Solo aplica a gastos de nivel
// superior dentro del mismo contenedor (#glist-rows-q1/q2); los subgastos de un grupo no se
// reordenan así (se ubican por parentId, no por posición en el arreglo). Solo tiene sentido —
// y solo se activa— con el criterio "Orden" y sin filtro de método: con otro criterio el orden
// visible ya no es el del arreglo, y con un filtro activo la lista visible no tiene todos los
// gastos (soltar perdería la posición de lo que quedó oculto).
function startDragGasto(e,id,which){
  if((gSort[which]||'orden')!=='orden' || (gFiltro[which]||'todos')!=='todos') return;
  // No armar el arrastre si el toque empezó sobre un control que ya tiene su propio
  // comportamiento de toque (checkbox de pagado, botón editar, flecha de expandir el grupo) —
  // deben seguir respondiendo a un toque normal sin que este listener se los coma.
  if(e.target.closest('.gchk,button,.g-chevron,.g-sub-row,.g-sub-add')) return;
  const row=e.currentTarget;
  const container=document.getElementById('glist-rows-'+which);
  if(!row||!container) return;
  const startX=e.clientX, startY=e.clientY;
  var armed=false;
  // Espera a que el toque se sostenga quieto un momento antes de armar el arrastre — así un
  // toque corto (o el inicio de un scroll) no dispara el reordenamiento por accidente.
  const holdTimer=setTimeout(function(){
    armed=true;
    row.classList.add('g-dragging');
    if(navigator.vibrate) navigator.vibrate(12);
  },300);
  function onMove(ev){
    if(!armed){
      if(Math.abs(ev.clientY-startY)>10||Math.abs(ev.clientX-startX)>10) clearTimeout(holdTimer);
      return;
    }
    ev.preventDefault();
    const target=document.elementFromPoint(ev.clientX,ev.clientY);
    const overRow=target&&target.closest?target.closest('.g-drag-item'):null;
    if(!overRow||overRow===row||overRow.parentElement!==container) return;
    const rect=overRow.getBoundingClientRect();
    const after=ev.clientY>rect.top+rect.height/2;
    container.insertBefore(row, after?overRow.nextSibling:overRow);
  }
  function onUp(){
    clearTimeout(holdTimer);
    document.removeEventListener('pointermove',onMove);
    document.removeEventListener('pointerup',onUp);
    document.removeEventListener('pointercancel',onUp);
    if(armed){
      row.classList.remove('g-dragging');
      // El arrastre terminó en un click sintético sobre esta misma fila (editGasto/toggleGG) —
      // se descarta una sola vez para que soltar no abra el gasto que se acaba de reordenar.
      row.addEventListener('click',function blockClick(ev){
        ev.stopPropagation();
        ev.preventDefault();
        row.removeEventListener('click',blockClick,true);
      },{capture:true,once:true});
      const newOrderIds=Array.prototype.slice.call(container.children).map(function(el){return el.dataset.gid;}).filter(Boolean);
      applyGastoOrder(newOrderIds,which);
    }
  }
  document.addEventListener('pointermove',onMove,{passive:false});
  document.addEventListener('pointerup',onUp);
  document.addEventListener('pointercancel',onUp);
}
// Aplica el orden final (leído del DOM tras soltar) al arreglo guardado: los gastos de nivel
// superior quedan en ese orden; los subgastos (parentId) se dejan tal cual estaban al final —
// su posición no afecta nada, se ubican por parentId, no por índice.
function applyGastoOrder(orderedIds,which){
  const m=getM(),list=which==='q1'?m.q1_gastos:m.q2_gastos;
  const byId={};
  list.forEach(function(g){ byId[g.id]=g; });
  const tops=orderedIds.map(function(id){ return byId[id]; }).filter(Boolean);
  const totalTops=list.filter(function(g){ return !g.parentId; }).length;
  if(tops.length!==orderedIds.length||tops.length!==totalTops) return; // no cuadra, no arriesgar a perder gastos
  const subs=list.filter(function(g){ return g.parentId; });
  const newList=tops.concat(subs);
  if(which==='q1') m.q1_gastos=newList; else m.q2_gastos=newList;
  save();render();
}
function editGasto(id,which){
  const m=getM(),list=which==='q1'?m.q1_gastos:m.q2_gastos;
  const g=list.find(x=>x.id===id);if(g)openGasto(g,which);
}
// Al pagar la cuota N de un crédito, busca si queda alguna cuota ANTERIOR (numCuota menor)
// de ese mismo crédito todavía sin pagar en cualquier mes — pasa cuando el usuario crea
// gastos de cuotas fuera de orden o se salta un mes. Devuelve la más reciente de esas
// pendientes (numCuota más alto por debajo de la que se está pagando), o null si no hay.
function buscarCuotaPendienteAnterior(creditoId,numCuotaPagada){
  var anterior=null;
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    [['q1_gastos','Q1'],['q2_gastos','Q2']].forEach(function(par){
      (mes[par[0]]||[]).forEach(function(g){
        if(g.creditoId===creditoId && g.numCuota && g.numCuota<numCuotaPagada && !g.pagado_flag){
          if(!anterior || g.numCuota>anterior.numCuota){
            anterior={numCuota:g.numCuota,mesNombre:mes.nombre,año:mes.año,which:par[1]};
          }
        }
      });
    });
  });
  return anterior;
}
// Impide pagar una cuota si queda una anterior sin pagar (deben pagarse en orden). La
// decisión se basa en cr.pagos[] (cuotaAnteriorPendiente), la misma fuente de verdad que usa
// toggleCuotaPago desde el detalle del crédito — antes este camino validaba mirando los
// gastos ya creados (buscarCuotaPendienteAnterior), que no bloqueaba si la cuota anterior
// nunca tuvo un gasto asociado. buscarCuotaPendienteAnterior ahora solo enriquece el aviso
// con el mes/quincena donde quedó esa cuota, cuando existe ese dato.
function bloquearPagoFueraDeOrden(g){
  if(!g.creditoId || !g.numCuota) return false;
  const cr=creditos[g.creditoId]; if(!cr) return false;
  const idx=g.numCuota-1;
  const pendNum=cuotaAnteriorPendiente(cr,idx);
  if(pendNum!=null){
    avisoCuotaFueraDeOrden(g.creditoId,pendNum,g.numCuota);
    return true;
  }
  return false;
}
// Mantiene cr.pagos/cr.pagoDetalle sincronizados cuando el estado de pago de un gasto ligado
// a un crédito cambia desde el formulario de edición (saveG) — toggleP/confirmarPago ya lo
// hacían para la lista de gastos, pero editar el gasto directamente (p.ej. ingresar "valor
// real pagado") lo dejaba pagado en el gasto sin reflejarse en la cuota del crédito, y sin
// validar el orden de pago. Devuelve false (y revierte el estado a estadoAntes — null o
// 'sinpagar', lo que fuera antes de este intento de guardado) si el pago se bloquea por haber
// una cuota anterior sin pagar.
function sincronizarCreditoDesdeGasto(gasto,estadoAntes){
  if(!gasto.creditoId||!creditos[gasto.creditoId]||!gasto.numCuota) return true;
  var cr=creditos[gasto.creditoId];
  var idx=gasto.numCuota-1;
  var wasPaidBefore=estadoAntes==='pagado';
  if(gasto.pagado_flag && !wasPaidBefore && bloquearPagoFueraDeOrden(gasto)){
    setGastoEstado(gasto,estadoAntes);
    return false;
  }
  if(gasto.pagado_flag){
    if(!cr.pagos) cr.pagos=[];
    cr.pagos[idx]=true;
    if(!cr.pagoDetalle) cr.pagoDetalle={};
    cr.pagoDetalle[idx]={montoPagado:Math.abs(gasto.pagado_real!=null?gasto.pagado_real:(gasto.presupuesto||0))};
    invalidarAmortCache(gasto.creditoId);
  } else if(wasPaidBefore){
    if(cr.pagos) cr.pagos[idx]=false;
    if(cr.pagoDetalle) delete cr.pagoDetalle[idx];
    invalidarAmortCache(gasto.creditoId);
    // Al desmarcar como pagada una cuota de crédito, "lo realmente pagado" deja de existir —
    // si no se limpia, "Pagaste $X" seguía apareciendo en el formulario aunque la cuota ya no
    // estuviera pagada (quedaba el valor viejo colgado en gasto.pagado_real).
    gasto.pagado_real=null;
  }
  return true;
}
// Núcleo de "marcar pagado"/"desmarcar pagado" de un gasto, extraído de toggleP para que
// toggleGrupoPagado (marcar TODOS los subgastos de un grupo de una vez) pueda reutilizarlo sin
// duplicar la sincronización con crédito/tarjeta — cada llamada solo muta el gasto y el mes
// (m); guardar/renderizar queda a cargo de quien llama (toggleP o toggleGrupoPagado), para no
// guardar/renderizar una vez por subgasto en un toggle masivo.
function marcarGastoPagado(g,m,opts){
  opts=opts||{};
  setGastoEstado(g,'pagado');
  if(g.parentId){
    const allGastos=[...(m.q1_gastos||[]),...(m.q2_gastos||[])];
    const parent=allGastos.find(x=>x.id===g.parentId);
    if(parent&&parent.tcCardId){
      if(opts.sinMovimientoTC){
        // Este gasto queda marcado como pagado (para el checklist del grupo) pero SIN su
        // propio movimiento en la tarjeta — ver toggleGrupoPagado: cuando "Abono TC" (que ya
        // cubre TODO el saldo pendiente) se paga en el mismo lote que otros gastos agregados a
        // mano, crearle además un abono a cada uno de esos otros duplicaría el pago sobre la
        // misma deuda.
        g.tcSinMovimiento=true;
      } else {
        const t=getTC(m,parent.tcCardId);
        const mvId=uid();
        t.movimientos.push({
          id:mvId,
          descripcion:g.nombre,
          tipo:'Abono',
          valor:-Math.abs(g.presupuesto||0),
          fecha:new Date().toISOString().slice(0,10),
          saldo:null
        });
        g.tcMovimientoId=mvId;
        syncTCGrupo(m);
      }
    }
  }
  if(g.creditoId && creditos[g.creditoId]){
    var cr2=creditos[g.creditoId];
    if(!cr2.pagos) cr2.pagos=[];
    cr2.pagos[g.numCuota-1]=true;
    if(!cr2.pagoDetalle) cr2.pagoDetalle={};
    cr2.pagoDetalle[g.numCuota-1]={montoPagado:Math.abs(g.presupuesto||0)};
    invalidarAmortCache(g.creditoId);
  }
}
function desmarcarGastoPagado(g,m){
  setGastoEstado(g,null);
  if(g.creditoId && creditos[g.creditoId]){
    var cr=creditos[g.creditoId];
    if(cr.pagos) cr.pagos[g.numCuota-1]=false;
    if(cr.pagoDetalle){ delete cr.pagoDetalle[g.numCuota-1]; invalidarAmortCache(g.creditoId); }
    // Igual que en sincronizarCreditoDesdeGasto: sin esto, "Pagaste $X" seguía mostrando el
    // valor viejo en el formulario de edición aunque la cuota ya no estuviera pagada.
    g.pagado_real=null;
  }
  if(g.parentId){
    const allGastos=[...(m.q1_gastos||[]),...(m.q2_gastos||[])];
    const parent=allGastos.find(x=>x.id===g.parentId);
    if(parent&&parent.tcCardId){
      if(g.tcSinMovimiento){
        // Este gasto nunca tuvo su propio movimiento (ver marcarGastoPagado): no hay nada que
        // quitar de la tarjeta, solo limpiar la marca.
        g.tcSinMovimiento=false;
      } else {
        const t=getTC(m,parent.tcCardId);
        if(g.tcMovimientoId){
          t.movimientos=t.movimientos.filter(x=>x.id!==g.tcMovimientoId);
        } else {
          // Compatibilidad con abonos creados antes de guardar el id del movimiento en el
          // gasto: se recurre al criterio anterior (más frágil, por coincidencia de nombre)
          // solo como último recurso.
          const abonos=t.movimientos.filter(x=>x.tipo==='Abono'&&x.descripcion.startsWith(g.nombre));
          if(abonos.length>0){
            const last=abonos[abonos.length-1];
            t.movimientos=t.movimientos.filter(x=>x.id!==last.id);
          }
        }
        g.tcMovimientoId=null;
        syncTCGrupo(m);
      }
    }
  }
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
    desmarcarGastoPagado(g,m);
    save();render();
  } else if(g.metodo==='PSE' || g.mensualidad){
    openPagoModal(g,which);
  } else {
    if(bloquearPagoFueraDeOrden(g)) return;
    marcarGastoPagado(g,m);
    save();render();
  }
}
// Checkbox del encabezado de un grupo (ver g-group-head en render.js): antes solo mostraba en
// vivo si ya estaban todos los subgastos pagados, sin acción propia — tocar el grupo no hacía
// nada, había que pagar cada subgasto uno por uno (perdiendo, además, el badge de cuota/crédito
// que buildSubRow no calculaba). Ahora, si falta algún subgasto por pagar, los marca todos
// como pagados de un tirón (reutilizando marcarGastoPagado, así un subgasto ligado a un
// crédito o a la tarjeta sigue sincronizando igual que si se pagara individualmente); si ya
// estaban todos pagados, los desmarca todos. Los que tengan PSE/mensualidad (piden datos
// propios en un modal) o una cuota de crédito fuera de orden se saltan, pero SIN usar
// bloquearPagoFueraDeOrden directamente: esa función dispara su propio showAlert() por cada
// llamada, así que con más de una cuota bloqueada los diálogos se pisaban entre sí (solo
// quedaba visible el último) y cortaban el resto del batch. Acá se revisa el mismo dato
// (cuotaAnteriorPendiente) sin alertar en el loop, se sigue marcando lo que sí se puede, y al
// final se muestra un único aviso con el detalle de todo lo que quedó pendiente.
function toggleGrupoPagado(e,gid,which){
  e.stopPropagation();
  const m=getM(),list=which==='q1'?m.q1_gastos:m.q2_gastos;
  const subs=list.filter(function(x){return x.parentId===gid&&!x.sinpagar;});
  if(!subs.length) return;
  const allPaid=subs.every(function(s){return s.pagado_flag;});
  var pendientesManual=[], bloqueados=[];
  // Si "Abono TC" (el auto-generado que ya cubre TODO el saldo pendiente de la tarjeta, ver
  // syncTCGrupo) está sin pagar y se va a pagar en este mismo lote, los demás gastos del grupo
  // agregados a mano NO deben crear su propio movimiento en la tarjeta — ya quedan cubiertos
  // por el abono consolidado de "Abono TC"; crear uno aparte por cada uno duplicaría el pago
  // sobre la misma deuda (ver marcarGastoPagado, parámetro sinMovimientoTC).
  var abonoTCEnEsteLote=subs.some(function(s){return s.nombre==='Abono TC'&&!s.pagado_flag;});
  subs.forEach(function(s){
    if(allPaid){ desmarcarGastoPagado(s,m); return; }
    if(s.pagado_flag || s.presupuesto<0) return;
    if(s.metodo==='PSE' || s.mensualidad){ pendientesManual.push(nombreGasto(s)); return; }
    if(s.creditoId && s.numCuota && creditos[s.creditoId]){
      var pendNum=cuotaAnteriorPendiente(creditos[s.creditoId],s.numCuota-1);
      if(pendNum!=null){ bloqueados.push(nombreGasto(s)+' (cuota '+pendNum+' sin pagar)'); return; }
    }
    marcarGastoPagado(s,m,{sinMovimientoTC:abonoTCEnEsteLote&&s.nombre!=='Abono TC'});
  });
  save();render();
  if(!allPaid && (pendientesManual.length||bloqueados.length)){
    var partes=[];
    if(bloqueados.length) partes.push('Fuera de orden — '+bloqueados.join(', ')+'.');
    if(pendientesManual.length) partes.push('Requieren pago manual (PSE/mensualidad) — '+pendientesManual.join(', ')+'.');
    showAlert(partes.join(' '),{title:'Algunos gastos no se marcaron como pagados'});
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
    +'<button class="bpri" onclick="confirmarPago(\''+g.id+'\',\''+which+'\')">'+btnIcon('check',13)+'Marcar pagado</button>'
    +'</div>');
}

function confirmarPago(id,which){
  const m=getM(),list=which==='q1'?m.q1_gastos:m.q2_gastos;
  const g=list.find(x=>x.id===id);
  if(!g) return;
  if(bloquearPagoFueraDeOrden(g)) return;
  const val=moneyVal('pg-val')||null;
  if(val!=null && val<=0){ showAlert('El valor pagado debe ser mayor a 0'); return; }
  const fecha=document.getElementById('pg-fecha').value||null;
  const comp=document.getElementById('pg-comp').value.trim()||null;
  const mensEl=document.getElementById('pg-mens');
  const mens=mensEl?mensEl.value||null:null;
  setGastoEstado(g,'pagado');
  g.pagado_real=val;
  g.fecha_pago=fecha;
  g.comprobante=comp;
  if(mens!==null) g.mensualidad=mens;

  const montoAbono=val||Math.abs(g.presupuesto||0);
  var excedenteAbono=0;

  if(g.creditoId && creditos[g.creditoId]){
    var cr=creditos[g.creditoId];
    // Valor teórico vigente ANTES de registrar este pago, para detectar si se pagó de más
    // (hay que leerlo antes de mutar pagoDetalle, porque después amort.rows ya reflejaría el
    // monto real pagado en vez del teórico).
    var valorTeoricoAntes=null;
    if(!(cr.planImportado && cr.planImportado.length)){
      var amortAntes=calcAmortizacion(cr);
      var rowAntes=amortAntes.rows[g.numCuota-1];
      valorTeoricoAntes=rowAntes?rowAntes.valorCuota:null;
    }
    if(!cr.pagos) cr.pagos=[];
    cr.pagos[g.numCuota-1]=true;
    // Registra el monto REALMENTE pagado (puede ser distinto al valor teórico de la cuota:
    // pago parcial o abono extra) para que calcAmortizacion/calcEstadoCredito recalculen el
    // saldo y el plazo con el pago real en vez de asumir siempre el valor de cuota completo.
    if(!cr.pagoDetalle) cr.pagoDetalle={};
    cr.pagoDetalle[g.numCuota-1]={montoPagado:montoAbono};
    invalidarAmortCache(g.creditoId); // el monto real de esta cuota cambió

    if(valorTeoricoAntes!=null && montoAbono-valorTeoricoAntes>1){
      excedenteAbono=montoAbono-valorTeoricoAntes;
    }
  }

  if(g.parentId){
    const allGastos=[...(m.q1_gastos||[]),...(m.q2_gastos||[])];
    const parent=allGastos.find(x=>x.id===g.parentId);
    if(parent&&parent.tcCardId){
      const t=getTC(m,parent.tcCardId);
      const mvId=uid();
      t.movimientos.push({
        id:mvId,
        descripcion:g.nombre+(comp?' ('+comp+')':''),
        tipo:'Abono',
        valor:-montoAbono,
        fecha:fecha||new Date().toISOString().slice(0,10),
        saldo:null
      });
      g.tcMovimientoId=mvId;
      syncTCGrupo(m);
    }
  }

  save();closeModal();render();
  if(excedenteAbono>0){
    toast('Pago registrado. El excedente de '+cop(excedenteAbono)+' se aplicó como abono a capital y redujo el plazo del crédito.', 6000);
  } else {
    toast('Pago registrado');
  }
}

