// ── CRÉDITOS: interfaz (listas, modales de crear/editar/eliminar) ───────────
// Fase 2 de la migración a una arquitectura más modular: mitad "de interfaz" de lo que antes era
// creditos.js — arma HTML y maneja los modales. Los cálculos de amortización (PMT,
// congelamientos, saldo) viven en creditos-calculo.js; Abonos y Congelar cuota se separaron a
// sus propios archivos (creditos-abonos.js, creditos-congelar.js) por ser features chicas y
// autocontenidas dentro de este dominio.

// Vista de la pestaña Créditos: hero con saldo total + 3 stats (cuotas del mes,
// activos, próximo pago — este último con el mismo pill expandible que ya existía en
// openCreditosMenu), y debajo la lista "Mis créditos" con las tarjetas de siempre
// (anillo de progreso + "Ver detalles del crédito" abre el modal openCreditoDetalle).
function renderCreditos(m){
  const ids=Object.keys(creditos);
  const ringColors=['var(--acc)','var(--pur)','var(--grn)','var(--amb)'];

  if(!ids.length){
    return '<div class="nom-resumen"><div class="nom-resumen-lbl">Saldo total que debo</div>'
      +'<div class="nom-resumen-val"><span class="nom-resumen-cur">$</span>0</div></div>'
      +'<div class="empty"><div class="eic" style="display:flex;justify-content:center;color:var(--mut)">'+icon('dollar',36)+'</div><p>Sin créditos. Toca + para crear uno.</p></div>';
  }

  const mi=MESES.indexOf(m.nombre);
  const miSafe=mi>=0?mi:0;

  var infos=ids.map(function(id,i){
    var cr=creditos[id];
    var estado=calcEstadoCredito(cr);
    var amort=estado.amort, pagadas=estado.pagadasVisual, saldoActual=estado.saldoActual, proximaIdx=estado.proximaIdx;
    var activo=proximaIdx!==-1;
    var totalCuotas=amort.rows.length;
    var pct=totalCuotas>0?Math.round(pagadas/totalCuotas*100):0;
    var cuotasFaltantes=Math.max(totalCuotas-pagadas,0);
    var cuotasDelMes=amort.rows.reduce(function(a,r,i){
      if(cr.pagos&&cr.pagos[i]) return a;
      var f=new Date(r.fecha+'T12:00:00');
      return (f.getFullYear()===m.año&&f.getMonth()===miSafe)?a+r.valorCuota:a;
    },0);
    return {id:id,cr:cr,amort:amort,pagadas:pagadas,saldoActual:saldoActual,proximaIdx:proximaIdx,activo:activo,pct:pct,cuotasFaltantes:cuotasFaltantes,cuotasDelMes:cuotasDelMes,color:ringColors[i%ringColors.length]};
  });

  var infosOrdenados=infos.slice().sort(function(a,b){
    if(a.activo!==b.activo) return a.activo?-1:1;
    if(!a.activo) return 0;
    return a.cuotasFaltantes-b.cuotasFaltantes;
  });

  var activos=infos.filter(function(x){return x.activo;});
  var saldoTotal=infos.reduce(function(a,x){return a+x.saldoActual;},0);
  var cuotasMes=infos.reduce(function(a,x){return a+x.cuotasDelMes;},0);
  var activosCount=activos.length;

  var proximo=activos.reduce(function(best,x){
    var f=x.amort.rows[x.proximaIdx].fecha;
    return (!best||f<best.fecha)?{fecha:f,nombre:x.cr.nombre}:best;
  },null);
  var proximoFmt=proximo?new Date(proximo.fecha+'T12:00:00').toLocaleDateString('es-CO',{day:'2-digit',month:'short'}):'—';

  var proximoPagoList=activos.map(function(x){
    var row=x.amort.rows[x.proximaIdx];
    var dias=diasHasta(row.fecha+'T12:00:00');
    var st=diasStatus(dias);
    if(dias<0) st=Object.assign({},st,{txt:'Vencido'});
    return {id:x.id,nombre:x.cr.nombre,fecha:row.fecha,valorCuota:row.valorCuota,pct:x.pct,dias:dias,st:st};
  });
  proximoPagoList.sort(function(a,b){ return a.dias-b.dias; });
  var proximoPagoExpandHtml=proximoPagoList.map(function(p){
    var f=new Date(p.fecha+'T12:00:00').toLocaleDateString('es-CO',{day:'2-digit',month:'short'});
    return '<div class="cal-event" onclick="creditoDetalleDesdeModal=false;openCreditoDetalle(\''+p.id+'\')">'
      +'<div class="cal-ev-left">'
      +'<div class="cal-ev-dot" style="background:var(--'+(p.st.dcls==='du'?'red':p.st.dcls==='ds'?'amb':'grn')+')"></div>'
      +'<div>'
      +'<div class="cal-ev-name">'+esc(p.nombre)+'</div>'
      +'<div class="cal-ev-sub">'+f+' · '+p.pct+'% completado</div>'
      +'</div></div>'
      +'<div class="cal-ev-right">'
      +'<div class="cal-ev-amt">'+cop(p.valorCuota)+'</div>'
      +'<div class="cal-ev-status '+p.st.dcls+'">'+p.st.txt+'</div>'
      +'</div></div>';
  }).join('');

  // Mismo formato de encabezado que "Resumen del mes" en Nómina (ver nom-resumen en nomina.js) y
  // los mismos "3 totales" que ya usan Gastos y ese resumen (glist-totals) — antes este panel
  // tenía su propio juego de clases (cred-hero-*) casi idéntico, duplicado sin necesidad.
  var heroHtml='<div class="nom-resumen">'
    +'<div class="nom-resumen-lbl">Saldo total que debo</div>'
    +'<div class="nom-resumen-val"><span class="nom-resumen-cur">$</span>'+Math.round(saldoTotal).toLocaleString('es-CO')+'</div>'
    +'<div class="glist-totals" style="padding:6px 0 0;margin-top:6px;border-top:1px solid var(--brd)">'
    +'<div class="glist-tot"><div class="glist-tot-lbl" style="color:var(--red)">CUOTAS DEL MES</div><div class="glist-tot-val" style="color:var(--red)">'+cop(cuotasMes)+'</div></div>'
    +'<div class="glist-div"></div>'
    +'<div class="glist-tot"><div class="glist-tot-lbl">CRÉDITOS ACTIVOS</div><div class="glist-tot-val">'+activosCount+'</div></div>'
    +'<div class="glist-div"></div>'
    +'<div class="glist-tot" style="cursor:pointer" onclick="toggleCredProxPago()"><div class="glist-tot-lbl" style="color:var(--acc)">PRÓXIMO PAGO</div><div class="glist-tot-val" style="color:var(--acc)">'+proximoFmt+'</div>'
    +(activos.length?'<div style="font-size:9px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+activos.length+(activos.length===1?' crédito ▾':' créditos ▾')+'</div>':'')
    +'</div>'
    +'</div>'
    +'</div>'
    +(activos.length?'<div class="cal-event-list" id="credpp-expand" style="display:none;margin:10px 0 0">'+proximoPagoExpandHtml+'</div>':'');

  var listHtml=infosOrdenados.map(function(x){
    var cr=x.cr,amort=x.amort;
    var proximaFecha=x.proximaIdx!==-1?new Date(amort.rows[x.proximaIdx].fecha+'T12:00:00').toLocaleDateString('es-CO',{day:'2-digit',month:'short'}):'—';
    var proximaCuotaVal=x.proximaIdx!==-1?amort.rows[x.proximaIdx].valorCuota:0;
    var frecLbl=(cr.frecuencia==='mensual')?'Mensual':'Quincenal';
    var mensPill=cr.esMensualidad?'<span style="font-size:9px;font-weight:700;background:var(--pur-d);color:var(--pur);padding:1px 7px;border-radius:10px;margin-left:6px;vertical-align:middle">MENSUALIDAD</span>':'';
    return '<div onclick="creditoDetalleDesdeModal=false;openCreditoDetalle(\''+x.id+'\')" style="cursor:pointer;background:var(--surf2);border:1px solid var(--brd2);border-radius:var(--r);padding:11px;margin:0 14px 10px">'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:7px">'
      +'<div style="display:flex;align-items:baseline;gap:6px;min-width:0;overflow:hidden">'
      +'<span style="font-size:14px;font-weight:700;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(cr.nombre)+'</span>'+mensPill
      +'<span style="font-size:11px;color:var(--mut);flex-shrink:0">'+frecLbl+'</span></div>'
      +'<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;padding:3px 9px;border-radius:20px;flex-shrink:0;margin-left:8px;'+(x.activo?'background:var(--grn-d);color:var(--grn)':'background:var(--brd2);color:var(--mut)')+'">'+(x.activo?'Activo':'Pagado')+'</div>'
      +'</div>'
      +'<div style="display:flex;align-items:center;gap:12px">'
      +'<div style="position:relative;width:64px;height:64px;flex-shrink:0">'
      +'<div style="width:100%;height:100%;border-radius:50%;background:conic-gradient('+x.color+' '+(x.pct*3.6)+'deg,var(--brd) 0deg)"></div>'
      +'<div style="position:absolute;inset:6px;border-radius:50%;background:var(--surf2);display:flex;flex-direction:column;align-items:center;justify-content:center">'
      +'<div style="font-size:14px;font-weight:800;color:var(--txt)">'+x.pct+'%</div>'
      +'<div style="font-size:9px;color:var(--mut)">'+x.pagadas+'/'+amort.rows.length+'</div>'
      +'</div></div>'
      +'<div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:6px;min-width:0">'
      +'<div><div style="font-size:9px;color:var(--mut);text-transform:uppercase">Saldo actual</div><div style="font-size:13px;font-weight:700;color:var(--txt)">'+cop(x.saldoActual)+'</div>'
      +'<div style="font-size:9px;color:var(--mut);margin-top:4px">Deuda inicial</div><div style="font-size:12px;color:var(--mut)">'+cop(amort.total)+'</div></div>'
      +'<div><div style="font-size:9px;color:var(--mut);text-transform:uppercase">Próximo pago</div><div style="font-size:13px;font-weight:700;color:'+x.color+'">'+proximaFecha+'</div>'
      +'<div style="font-size:9px;color:var(--mut);margin-top:4px">Valor cuota</div><div style="font-size:12px;color:var(--mut)">'+cop(proximaCuotaVal)+'</div></div>'
      +'</div>'
      +'</div>'
      +'</div>';
  }).join('');

  return '<div class="home-view">'+heroHtml
    +'<div class="glist-card">'
    +'<div class="glist-head"><span class="glist-title">Mis créditos</span><span class="glist-sub">toca para ver la amortización</span></div>'
    +'<div class="cred-list">'+listHtml+'</div>'
    +'</div>'
    +'</div>';
}

function openCreditosMenu(){
  creditoDesdeGastoCtx=null; // se entra aquí por la vía normal, no desde "+ Crear crédito nuevo" de un gasto
  const ids=Object.keys(creditos);
  const ringColors=['var(--acc)','var(--pur)','var(--grn)','var(--amb)'];

  var infos=ids.map(function(id,i){
    var cr=creditos[id];
    var estado=calcEstadoCredito(cr);
    var amort=estado.amort, pagadas=estado.pagadasVisual, saldoActual=estado.saldoActual, proximaIdx=estado.proximaIdx;
    var activo=proximaIdx!==-1;
    var totalCuotas=amort.rows.length;
    var pct=totalCuotas>0?Math.round(pagadas/totalCuotas*100):0;
    var cuotasFaltantes=Math.max(totalCuotas-pagadas,0);
    return {id:id,cr:cr,amort:amort,pagadas:pagadas,saldoActual:saldoActual,proximaIdx:proximaIdx,activo:activo,pct:pct,cuotasFaltantes:cuotasFaltantes,color:ringColors[i%ringColors.length]};
  });

  // Orden de la lista de créditos: activos primero (los pagados/completados al final), y
  // entre los activos, del más cerca de finalizar (menos cuotas faltantes) al más lejano.
  var infosOrdenados=infos.slice().sort(function(a,b){
    if(a.activo!==b.activo) return a.activo?-1:1;
    if(!a.activo) return 0;
    return a.cuotasFaltantes-b.cuotasFaltantes;
  });

  var activos=infos.filter(function(x){return x.activo;});
  var saldoTotal=activos.reduce(function(a,x){return a+x.saldoActual;},0);
  var proximo=activos.reduce(function(best,x){
    var f=x.amort.rows[x.proximaIdx].fecha;
    return (!best||f<best.fecha)?{fecha:f,nombre:x.cr.nombre}:best;
  },null);
  var proximoFmt=proximo?new Date(proximo.fecha+'T12:00:00').toLocaleDateString('es-CO',{day:'2-digit',month:'short'}):'—';

  // Próximo pago (pill expandible): colapsado muestra cantidad de créditos con pago
  // pendiente + la fecha más cercana; expandido lista cada crédito con su próxima cuota,
  // ordenados por cuánto falta para esa fecha (de la más cercana a la más lejana) —
  // como los "días" de una cuota vencida son negativos, quedan primero automáticamente.
  var proximoPagoList=activos.map(function(x){
    var row=x.amort.rows[x.proximaIdx];
    var dias=diasHasta(row.fecha+'T12:00:00');
    // diasStatus() asume que una fecha pasada ya fue pagada (válido para Q1/Q2 de
    // nómina), pero acá solo llegan cuotas SIN marcar como pagadas (pagos[i] false),
    // así que si la fecha ya pasó, la cuota está vencida, no pagada.
    var st=diasStatus(dias);
    if(dias<0) st=Object.assign({},st,{txt:'Vencido'});
    return {id:x.id,nombre:x.cr.nombre,fecha:row.fecha,valorCuota:row.valorCuota,pct:x.pct,dias:dias,st:st};
  });
  proximoPagoList.sort(function(a,b){ return a.dias-b.dias; });
  var proximoPagoExpandHtml=proximoPagoList.map(function(p){
    var f=new Date(p.fecha+'T12:00:00').toLocaleDateString('es-CO',{day:'2-digit',month:'short'});
    return '<div class="cal-event" onclick="creditoDetalleDesdeModal=true;closeModal();openCreditoDetalle(\''+p.id+'\')">'
      +'<div class="cal-ev-left">'
      +'<div class="cal-ev-dot" style="background:var(--'+(p.st.dcls==='du'?'red':p.st.dcls==='ds'?'amb':'grn')+')"></div>'
      +'<div>'
      +'<div class="cal-ev-name">'+esc(p.nombre)+'</div>'
      +'<div class="cal-ev-sub">'+f+' · '+p.pct+'% completado</div>'
      +'</div></div>'
      +'<div class="cal-ev-right">'
      +'<div class="cal-ev-amt">'+cop(p.valorCuota)+'</div>'
      +'<div class="cal-ev-status '+p.st.dcls+'">'+p.st.txt+'</div>'
      +'</div></div>';
  }).join('');

  var headerHtml='<div class="summary" style="border-radius:var(--r2);margin-bottom:'+(activos.length?'0':'14px')+'">'
    +'<div class="stat"><div class="slbl">Activos</div><div class="sval sb">'+activos.length+'</div></div>'
    +'<div class="stat"><div class="slbl">Saldo total</div><div class="sval">'+cop(saldoTotal)+'</div></div>'
    +'<div class="stat" style="cursor:pointer" onclick="toggleCredProxPago()"><div class="slbl">Próximo pago</div><div class="sval sb">'+proximoFmt+'</div>'+(activos.length?'<div style="font-size:9px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+activos.length+(activos.length===1?' crédito ▾':' créditos ▾')+'</div>':'')+'</div>'
    +'</div>'
    +(activos.length?'<div class="cal-event-list" id="credpp-expand" style="display:none;margin:0 0 14px">'+proximoPagoExpandHtml+'</div>':'');

  var listHtml=infosOrdenados.length?infosOrdenados.map(function(x){
    var cr=x.cr,amort=x.amort;
    var proximaFecha=x.proximaIdx!==-1?new Date(amort.rows[x.proximaIdx].fecha+'T12:00:00').toLocaleDateString('es-CO',{day:'2-digit',month:'short'}):'—';
    var proximaCuotaVal=x.proximaIdx!==-1?amort.rows[x.proximaIdx].valorCuota:0;
    var frecLbl=(cr.frecuencia==='mensual')?'Mensual':'Quincenal';
    var mensPill=cr.esMensualidad?'<span style="font-size:9px;font-weight:700;background:var(--pur-d);color:var(--pur);padding:1px 7px;border-radius:10px;margin-left:6px;vertical-align:middle">MENSUALIDAD</span>':'';
    return '<div onclick="creditoDetalleDesdeModal=true;openCreditoDetalle(\''+x.id+'\')" style="cursor:pointer;background:var(--surf2);border:1px solid var(--brd2);border-radius:var(--r);padding:11px;margin-bottom:10px">'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:7px">'
      +'<div style="display:flex;align-items:baseline;gap:6px;min-width:0;overflow:hidden">'
      +'<span style="font-size:14px;font-weight:700;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(cr.nombre)+'</span>'+mensPill
      +'<span style="font-size:11px;color:var(--mut);flex-shrink:0">'+frecLbl+'</span></div>'
      +'<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;padding:3px 9px;border-radius:20px;flex-shrink:0;margin-left:8px;'+(x.activo?'background:var(--grn-d);color:var(--grn)':'background:var(--brd2);color:var(--mut)')+'">'+(x.activo?'Activo':'Pagado')+'</div>'
      +'</div>'
      +'<div style="display:flex;align-items:center;gap:12px">'
      +'<div style="position:relative;width:64px;height:64px;flex-shrink:0">'
      +'<div style="width:100%;height:100%;border-radius:50%;background:conic-gradient('+x.color+' '+(x.pct*3.6)+'deg,var(--brd) 0deg)"></div>'
      +'<div style="position:absolute;inset:6px;border-radius:50%;background:var(--surf2);display:flex;flex-direction:column;align-items:center;justify-content:center">'
      +'<div style="font-size:14px;font-weight:800;color:var(--txt)">'+x.pct+'%</div>'
      +'<div style="font-size:9px;color:var(--mut)">'+x.pagadas+'/'+amort.rows.length+'</div>'
      +'</div></div>'
      +'<div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:6px;min-width:0">'
      +'<div><div style="font-size:9px;color:var(--mut);text-transform:uppercase">Saldo actual</div><div style="font-size:13px;font-weight:700;color:var(--txt)">'+cop(x.saldoActual)+'</div>'
      +'<div style="font-size:9px;color:var(--mut);margin-top:4px">Deuda inicial</div><div style="font-size:12px;color:var(--mut)">'+cop(amort.total)+'</div></div>'
      +'<div><div style="font-size:9px;color:var(--mut);text-transform:uppercase">Próximo pago</div><div style="font-size:13px;font-weight:700;color:'+x.color+'">'+proximaFecha+'</div>'
      +'<div style="font-size:9px;color:var(--mut);margin-top:4px">Valor cuota</div><div style="font-size:12px;color:var(--mut)">'+cop(proximaCuotaVal)+'</div></div>'
      +'</div>'
      +'</div>'
      +'</div>';
  }).join(''):'<div class="empty"><div class="eic" style="display:flex;justify-content:center;color:var(--mut)">'+icon('dollar',36)+'</div><p>Sin créditos. Crea uno nuevo.</p></div>';

  openModal('<div class="mtitle">Créditos</div>'
    +(infos.length?headerHtml:'')
    +listHtml
    +'<div class="macts" style="margin-top:14px">'
    +'<button class="bcnl" onclick="closeModal()">Cerrar</button>'
    +'<button class="bpri" onclick="openNewCredito()">＋ Nuevo crédito</button>'
    +'</div>');
}

function toggleCredProxPago(){
  const el=document.getElementById('credpp-expand');
  if(!el) return;
  el.style.display=el.style.display==='none'?'block':'none';
}

// Selector opcional para marcar que este crédito es en realidad una compra diferida a
// cuotas de una tarjeta (ej. "diferido a 12 meses" en el datáfono) — solo para mostrarlo
// junto a esa tarjeta y no perder de vista que esa cuota ya está "comprometida" cada mes; no
// afecta el cálculo del saldo de la tarjeta (que sigue siendo compras-abonos como siempre).
// Fila+picker de pantalla completa (mismo estándar que "Asociar a crédito" en el formulario de
// gasto) en vez de un <select> nativo — el <select> real queda oculto solo para que
// saveNewCredito()/saveEditCredito() lo sigan leyendo tal cual.
function tarjetaVinculadaFieldHtml(selectedId){
  const m=getM();
  const ids=listTCIds(m);
  if(!ids.length) return '';
  const opts='<option value="">— Ninguna —</option>'+ids.map(function(tid){
    var t=m.tarjetas[tid];
    return '<option value="'+tid+'"'+(selectedId===tid?' selected':'')+'>'+esc(t.nombre)+'</option>';
  }).join('');
  const actual=selectedId&&m.tarjetas[selectedId]?m.tarjetas[selectedId].nombre:'Ninguna';
  return '<div style="margin:10px 0 4px"><label style="display:block;font-size:12px;color:var(--mut);margin-bottom:5px;font-weight:500">¿Es una compra diferida a cuotas de una tarjeta? (opcional)</label>'
    +'<select id="cr-tc-vinc" style="display:none">'+opts+'</select>'
    +stdFormCardHtml(stdFormRowHtml('bank','var(--pur-d)','var(--pur)','Vincular a tarjeta',actual,"crAbrirPickerTarjetaVinc('cr-tc-vinc')",false))
    +'</div>';
}
// "Frecuencia de pago" solo tiene 2 valores posibles, igual que Manual/Importar en "Nuevo
// crédito" — así que en vez del patrón fila+picker de pantalla completa (pensado para listas
// más largas, como Vincular a tarjeta) usa el mismo par de píldoras .trow2, con selección
// instantánea (sin navegar a ninguna pantalla, ver crSetFrecuencia). Usado tanto en "Nuevo
// crédito" (cr-frec) como en "Editar crédito" (cr-edit-frec).
function frecuenciaFieldHtml(selectId,frecuenciaActual){
  const esMensual=frecuenciaActual==='mensual';
  return '<div style="margin:10px 0 4px"><label style="display:block;font-size:12px;color:var(--mut);margin-bottom:5px;font-weight:500">Frecuencia de pago</label>'
    +'<select id="'+selectId+'" style="display:none"><option value="quincenal"'+(esMensual?'':' selected')+'>Quincenal</option><option value="mensual"'+(esMensual?' selected':'')+'>Mensual</option></select>'
    +'<div class="trow2">'
    +'<button type="button" class="topt'+(esMensual?'':' sc')+'" onclick="crSetFrecuencia(\''+selectId+'\',\'quincenal\')">Quincenal</button>'
    +'<button type="button" class="topt'+(esMensual?' sa':'')+'" onclick="crSetFrecuencia(\''+selectId+'\',\'mensual\')">Mensual</button>'
    +'</div></div>';
}
function crSetFrecuencia(selectId,val){
  const sel=document.getElementById(selectId);
  if(sel) sel.value=val;
  const wrap=sel?sel.nextElementSibling:null;
  if(!wrap) return;
  const btns=wrap.querySelectorAll('button');
  if(btns[0]) btns[0].className='topt'+(val==='quincenal'?' sc':'');
  if(btns[1]) btns[1].className='topt'+(val==='mensual'?' sa':'');
}
// El picker de pantalla completa de "Vincular a tarjeta" reabre el formulario que lo llamó —
// crPickerReturnToFn se fija justo antes de construir ese formulario (ver openNewCredito/
// editCredito) — y restaura TODO lo demás tecleado vía snapshotModalFields/restoreModalFields
// (ver format-utils.js), ya que openModal reemplaza el formulario entero al mostrar el picker.
let crPickerReturnToFn=null;
let crPickerSnapshot=null;
function crVolverDesdePicker(){
  if(crPickerReturnToFn) crPickerReturnToFn();
  restoreModalFields(crPickerSnapshot);
  crPickerSnapshot=null;
  updateCuotaSugerida();
}
function crAbrirPickerTarjetaVinc(selectId){
  crPickerSnapshot=snapshotModalFields();
  const m=getM();
  const ids=listTCIds(m);
  const current=document.getElementById(selectId).value;
  const itemsHtml=pickerItemRow("crElegirTarjetaVinc('"+selectId+"','')",'Ninguna',current==='')
    +ids.map(function(tid){
      return pickerItemRow("crElegirTarjetaVinc('"+selectId+"','"+tid+"')",m.tarjetas[tid].nombre,current===tid);
    }).join('');
  renderPickerModal('Vincular a tarjeta',itemsHtml,null,'crVolverDesdePicker()');
}
function crElegirTarjetaVinc(selectId,tid){
  if(crPickerSnapshot) crPickerSnapshot[selectId]=tid;
  crVolverDesdePicker();
}

function openNewCredito(modo){
  modo = modo==='importar' ? 'importar' : 'manual';
  const pillsHtml='<div class="trow2" style="margin-bottom:10px">'
    +'<button class="topt'+(modo==='manual'?' sc':'')+'" onclick="openNewCredito(\'manual\')">Manual</button>'
    +'<button class="topt'+(modo==='importar'?' sa':'')+'" onclick="openNewCredito(\'importar\')">'+btnIcon('download')+'Importar</button>'
    +'</div>';

  if(modo==='importar'){
    // El flujo de importar plan de banco es independiente del de "crear crédito desde un
    // gasto" (ese solo aplica al alta manual) — se limpia el contexto para no dejarlo colgado.
    creditoDesdeGastoCtx=null;
    openModal('<div class="mtitle">Nuevo crédito</div>'
      +pillsHtml
      +formatoPlanoCreditoHtml()
      +'<input type="file" id="cr-import-file" accept=".json" style="display:none" onchange="importCreditoPlan(this)">'
      +'<button class="bpri" style="width:100%;margin-top:10px" onclick="document.getElementById(\'cr-import-file\').click()">'+btnIcon('download')+'Elegir archivo JSON</button>'
      +'<div class="macts" style="margin-top:14px"><button class="bcnl" style="grid-column:1/-1" onclick="openCreditosMenu()">Cancelar</button></div>');
    return;
  }

  crPickerReturnToFn=function(){ openNewCredito(modo); };
  const frecActual=(crPickerSnapshot&&('cr-frec' in crPickerSnapshot))?crPickerSnapshot['cr-frec']:'quincenal';
  const tcVincActual=(crPickerSnapshot&&('cr-tc-vinc' in crPickerSnapshot))?crPickerSnapshot['cr-tc-vinc']:'';

  const hoy=new Date().toISOString().slice(0,10);
  const fechaActualNew=(crPickerSnapshot&&('cr-fecha' in crPickerSnapshot))?crPickerSnapshot['cr-fecha']:hoy;
  openModal('<div class="mtitle">Nuevo crédito</div>'
    +pillsHtml
    +stdFormHeroCardHtml(stdFormNombreValorHtml('cr-nombre','','Ej: Crédito electrodomésticos','cr-valor',0,'COP · valor del préstamo','var(--pur)','updateCuotaSugerida()'))
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
    +'<div class="field" style="margin:0"><label>% AVAL</label><input id="cr-aval" type="number" step="0.01" placeholder="Ej: 2" oninput="updateCuotaSugerida()"></div>'
    +'<div class="field" style="margin:0"><label>Cuotas</label><input id="cr-cuotas" type="number" placeholder="Ej: 36" oninput="updateCuotaSugerida()"></div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;align-items:end">'
    +'<div class="field" style="margin:0"><label>Tasa de interés %</label><input id="cr-tasa" type="number" step="0.01" placeholder="Ej: 2.0" oninput="updateCuotaSugerida()"></div>'
    +stdFormDateFieldHtml('cr-fecha','Fecha inicio',fechaActualNew)
    +'</div>'
    +frecuenciaFieldHtml('cr-frec',frecActual)
    +'<div class="field" style="margin-top:8px"><label>Valor de cuota manual (opcional)</label>'
    +'<input id="cr-cuota-manual" type="text" inputmode="numeric" placeholder="Se sugiere automáticamente" oninput="maskMoneyInput(this)">'
    +'<div id="cr-cuota-sugerida-txt" style="font-size:11px;color:var(--acc);margin-top:4px"></div>'
    +'</div>'
    +'<div class="cbx-row" style="margin-top:2px"><input type="checkbox" id="cr-esmens"'+(creditoDesdeGastoCtx?' checked':'')+'>'
    +'<label for="cr-esmens" style="font-size:13px;color:var(--txt)">Es una mensualidad (colegio, transporte, suscripción...)</label></div>'
    +tarjetaVinculadaFieldHtml(tcVincActual||null)
    +'<div class="macts">'
    +'<button class="bcnl" onclick="creditoDesdeGastoCtx=null;closeModal()">Cancelar</button>'
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
  var valorPrestamo=moneyVal('cr-valor');
  const pctAval=parseFloat(document.getElementById('cr-aval').value)||0;
  const cuotas=parseInt(document.getElementById('cr-cuotas').value)||0;
  const tasa=parseFloat(document.getElementById('cr-tasa').value)||0;
  const fechaInicio=document.getElementById('cr-fecha').value;
  const frecuencia=document.getElementById('cr-frec').value;
  const cuotaManual=moneyVal('cr-cuota-manual')||null;
  const esMensualidad=document.getElementById('cr-esmens')?.checked||false;
  const tcVincEl=document.getElementById('cr-tc-vinc');
  const tcVinculada=tcVincEl&&tcVincEl.value?tcVincEl.value:null;
  // Si no se indicó el valor total del préstamo pero sí la cuota fija, se calcula el valor
  // total a partir de la cuota (cuota × cuotas, descontando el AVAL) — así basta con conocer
  // uno de los dos para crear el crédito (ej. gastos a cuotas fijas donde solo se sabe la cuota).
  if(!valorPrestamo && cuotaManual && cuotas){
    valorPrestamo=Math.round(cuotaManual*cuotas/(1+pctAval/100));
  }
  if(!nombre){showAlert('Escribe un nombre');return;}
  if(!fechaInicio){showAlert('Elige una fecha de inicio');return;}
  if(!Number.isInteger(cuotas)||cuotas<=0){showAlert('El número de cuotas debe ser un entero mayor a 0');return;}
  if(!valorPrestamo||valorPrestamo<=0){showAlert('Completa el valor del préstamo o la cuota manual');return;}
  if(tasa<0){showAlert('La tasa de interés no puede ser negativa');return;}
  if(pctAval<0){showAlert('El % de AVAL no puede ser negativo');return;}
  // Si se indicó una cuota manual, debe alcanzar a cubrir al menos el interés de la primera
  // cuota — de lo contrario el saldo aumentaría en cada cuota en vez de bajar y el crédito
  // nunca terminaría de pagarse (esto antes no se validaba en absoluto).
  if(cuotaManual){
    const totalTest=valorPrestamo+Math.round(valorPrestamo*(pctAval/100));
    const interesPrimera=Math.round(totalTest*(tasa/100)*100)/100;
    if(cuotaManual<=interesPrimera){
      showAlert('La cuota manual ('+cop(cuotaManual)+') no alcanza a cubrir el interés de la primera cuota ('+cop(interesPrimera)+'). El saldo aumentaría en vez de disminuir. Aumenta la cuota o reduce la tasa.');
      return;
    }
  }
  const id='cr_'+Date.now();
  const nuevoCredito={
    id:id, nombre:nombre, valorPrestamo:valorPrestamo, pctAval:pctAval,
    cuotas:cuotas, tasa:tasa, fechaInicio:fechaInicio, frecuencia:frecuencia,
    valorCuotaManual:cuotaManual, esMensualidad:esMensualidad, tcVinculada:tcVinculada, pagos:[]
  };
  // Las validaciones de arriba cubren los casos previsibles (cuotas/valor/tasa inválidos), pero
  // calcAmortizacion()/crearGastoDesdeCredito() pueden seguir lanzando ante una combinación no
  // anticipada — sin este try/catch, el crédito quedaba a medio crear (creditos[id] ya escrito)
  // sin guardar ni cerrar el modal, y sin ningún mensaje de qué pasó.
  try{
    creditos[id]=nuevoCredito;
    // Si el crédito se creó desde "+ Crear crédito nuevo" en un gasto, se le agrega ahí mismo
    // el gasto de la primera cuota ya vinculado, en vez de mandar al usuario a la sección de
    // Créditos y hacerlo volver a asociarlo manualmente.
    if(creditoDesdeGastoCtx){
      const ctx=creditoDesdeGastoCtx; creditoDesdeGastoCtx=null;
      crearGastoDesdeCredito(id,ctx);
      save();closeModal();render();
      toast('Crédito creado y gasto agregado');
    } else {
      save();closeModal();openCreditosMenu();toast('Crédito creado');
    }
  }catch(err){
    delete creditos[id];
    console.error('Error creando crédito:',err);
    showAlert('No se pudo crear el crédito con esos datos. Revisa los valores e intenta de nuevo.');
  }
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
  try{
    creditos[id]={
      id:id, nombre:nombre, valorPrestamo:plano.valorPrestamo, pctAval:0,
      cuotas:plano.cuotas, tasa:0, fechaInicio:plano.fechaInicio, frecuencia:'quincenal',
      valorCuotaManual:null, pagos:[], planImportado:plano.rows
    };
    save();closeModal();openCreditosMenu();toast('Plan de pagos importado ✓');
    window._importedPlano=null;
  }catch(err){
    delete creditos[id];
    console.error('Error importando plan de crédito:',err);
    showAlert('No se pudo importar el plan de pagos. Revisa que el archivo tenga el formato esperado.');
  }
}

let creditoOcultarPagadas=true;
let _pendingEditCredito=null; // {id, apply()} — cambios de saveEditCredito pendientes de confirmar cuando hay abonos registrados
// true cuando se entró al detalle del crédito desde el modal "Créditos" (openCreditosMenu,
// atajo del dashboard); false cuando se entró desde la pestaña Créditos/tarjeta (vista de
// fondo, no modal). El botón "Volver" del detalle lo usa para decidir si debe reabrir ese
// modal o simplemente cerrarse y dejar ver la pestaña que ya estaba detrás — antes siempre
// reabría el modal, así que volver desde la pestaña mostraba un modal de créditos encima.
let creditoDetalleDesdeModal=false;
// Comparte la misma decisión con el botón "Volver" del pie del detalle y el "‹ Créditos" fijo
// del encabezado de la ventana (index.html, #wbg .wback) — antes este último tenía su propio
// onclick="closeWindow();openCreditosMenu()" hardcodeado, así que siempre forzaba el modal
// aunque se hubiera entrado al detalle desde la pestaña Créditos/tarjeta.
function volverDesdeCreditoDetalle(){
  closeWindow();
  if(creditoDetalleDesdeModal) openCreditosMenu(); else render();
}

function openCreditoDetalle(id){
  const cr=creditos[id]; if(!cr) return;
  const estado=calcEstadoCredito(cr);
  const amort=estado.amort, pagadas=estado.pagadasVisual, saldoActual=estado.saldoActual;
  const pagos=cr.pagos||[];
  const ocultar=creditoOcultarPagadas;

  var activoCr=estado.proximaIdx!==-1;
  var proximaFechaHdr=activoCr?new Date(amort.rows[estado.proximaIdx].fecha+'T12:00:00').toLocaleDateString('es-CO',{day:'2-digit',month:'short'}):'—';
  var proximaCuotaValHdr=activoCr?amort.rows[estado.proximaIdx].valorCuota:0;

  var proximaIdx=estado.proximaIdx;
  if(proximaIdx===-1) proximaIdx=amort.rows.length-1;

  var totalCuotas=amort.rows.length;
  var cuotasPendientes=Math.max(totalCuotas-pagadas,0);
  var pctProgreso=totalCuotas>0?Math.round(pagadas/totalCuotas*100):0;
  var fechaFinFmt=amort.rows.length?new Date(amort.rows[amort.rows.length-1].fecha+'T12:00:00').toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}):'';

  const esImportadoCr=!!(cr.planImportado&&cr.planImportado.length);

  // Abonos manuales que se aplicaron ANTES de la primera cuota (idx===-1) no quedan "sobre"
  // ninguna fila — se anclan visualmente a la fila 0 (ver eventosAbono más abajo).
  var abonosAntesDeTodo=(cr.abonos||[]).filter(function(ab){return ab.idx===-1;});
  var abonoAntesDeTodo=abonosAntesDeTodo.reduce(function(a,x){return a+x.monto;},0);

  // Cada "evento" agrupa 1+ componentes que ocurrieron en el mismo punto (misma cuota o antes
  // de la primera). Si hay más de un componente, se listan por separado con su propio botón de
  // eliminar para que el usuario pueda indicar CUÁL de los abonos quiere devolver.
  // Panel de abono: mismo ancho y padding horizontal que la fila de la cuota (no un texto
  // pequeño metido dentro de la columna de info), para que se lea como parte del mismo bloque.
  function abonoDetailsHtml(ev){
    var color=ev.color||'var(--grn)';
    var compsHtml=ev.componentes.map(function(c){
      return '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;padding-top:4px;border-top:1px solid var(--brd)">'
        +'<span>'+c.etiqueta+'</span>'
        +'<span style="display:flex;align-items:center;gap:6px">'
        +'<span style="color:'+color+';font-weight:600">'+cop(c.monto)+'</span>'
        +'<button onclick="confirmarEliminarComponenteAbono(\''+id+'\','+ev.idx+','+(c.abId?"'"+c.abId+"'":'null')+')" style="background:none;border:1px solid rgba(248,113,113,.4);border-radius:var(--r2);padding:3px 7px;font-size:9px;color:var(--red);cursor:pointer">Eliminar</button>'
        +'</span></div>';
    }).join('');
    return '<details style="padding:9px 12px;border-bottom:1px solid var(--brd);background:rgba(0,0,0,.12)" onclick="event.stopPropagation()">'
      +'<summary style="font-size:11px;color:'+color+';font-weight:600;cursor:pointer">'+btnIcon('dollar',12)+ev.etiqueta+'</summary>'
      +'<div style="margin-top:6px;padding:8px 10px;background:var(--surf2);border-radius:var(--r2);font-size:11px;color:var(--mut)">'
      +'<div style="display:flex;justify-content:space-between"><span>Total abonado</span><span style="color:'+color+';font-weight:600">'+cop(ev.monto)+'</span></div>'
      +'<div style="display:flex;justify-content:space-between;margin-top:2px"><span>Saldo antes</span><span>'+cop(ev.saldoAntes)+'</span></div>'
      +'<div style="display:flex;justify-content:space-between;margin-top:2px"><span>Saldo después</span><span style="color:var(--txt);font-weight:600">'+cop(ev.saldoDespues)+'</span></div>'
      +compsHtml
      +'</div></details>';
  }

  var rowsHtml=amort.rows.map(function(r,i){
    var pagado=!!pagos[i];
    if(ocultar && pagado) return '';
    var esProxima=(i===proximaIdx);
    var fechaFmt=new Date(r.fecha+'T12:00:00').toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'});

    var eventosAbono=[];
    if(i===0 && abonoAntesDeTodo>0){
      eventosAbono.push({
        idx:-1, monto:abonoAntesDeTodo, saldoAntes:amort.total,
        saldoDespues:Math.max(0,Math.round((amort.total-abonoAntesDeTodo)*100)/100),
        etiqueta:'Abono a capital aplicado antes de la primera cuota',
        componentes:abonosAntesDeTodo.map(function(ab,n){
          return {abId:ab.id, monto:ab.monto, etiqueta:'Abono manual #'+(n+1)+' ('+ab.fecha+')'};
        })
      });
    }
    // Excedente (Caso 1): esta cuota se pagó por más del valor fijo de la cuota — el exceso ya
    // se aplicó a capital dentro de r.valorCuota/r.saldo (ver calcAmortizacionSinCache).
    var det=cr.pagoDetalle&&cr.pagoDetalle[i];
    var excedenteAqui=(!esImportadoCr && pagado && det && det.montoPagado!=null && amort.valorCuota && (det.montoPagado-amort.valorCuota)>1)
      ? (det.montoPagado-amort.valorCuota) : 0;
    // Abono(s) manual(es) (Caso 2) aplicados justo después de esta cuota — puede haber más de uno.
    var abonosManualesAqui=(cr.abonos||[]).filter(function(ab){return ab.idx===i;});
    var abonoManualAqui=abonosManualesAqui.reduce(function(a,x){return a+x.monto;},0);
    // Excedente y abono(s) manual(es) se agrupan en un solo desplegable (si una cuota tuviera
    // varios, poco común, se suman para el resumen pero cada uno se lista y elimina por separado).
    if(excedenteAqui>0 || abonoManualAqui>0){
      var saldoAntesCombo;
      if(excedenteAqui>0){
        var saldoPrevioFila=i>0?amort.rows[i-1].saldo:amort.total;
        saldoAntesCombo=Math.max(0,Math.round((saldoPrevioFila-(amort.valorCuota-r.intereses))*100)/100);
      } else {
        saldoAntesCombo=Math.round((r.saldo+abonoManualAqui)*100)/100;
      }
      var componentes=[];
      if(excedenteAqui>0){
        componentes.push({abId:null, monto:excedenteAqui, etiqueta:'Excedente del pago de esta cuota'});
      }
      abonosManualesAqui.forEach(function(ab,n){
        componentes.push({abId:ab.id, monto:ab.monto, etiqueta:'Abono manual #'+(n+1)+' ('+ab.fecha+')'});
      });
      eventosAbono.push({
        idx:i,
        monto:excedenteAqui+abonoManualAqui,
        saldoAntes:saldoAntesCombo,
        saldoDespues:r.saldo,
        etiqueta:'Abono a capital',
        color:'var(--amb)',
        componentes:componentes
      });
    }
    var abonoPanelesHtml=eventosAbono.map(abonoDetailsHtml).join('');

    // Insignia "❄ +N" cuando esta cuota tiene un congelamiento aplicado (ver openCongelarModal)
    // — tocarla ofrece deshacerlo, igual que un abono a capital se puede eliminar.
    var congeladaAqui=(cr.congelamientos||[]).find(function(c){return c.idx===i;});
    var congeladaBadge=congeladaAqui
      ?'<span onclick="event.stopPropagation();confirmarQuitarCongelamiento(\''+id+'\',\''+congeladaAqui.id+'\')" style="font-size:9px;font-weight:700;background:var(--acc-d);color:var(--acc);padding:1px 6px;border-radius:10px;margin-left:5px;vertical-align:middle;cursor:pointer">'+icon('snowflake',9)+' +'+congeladaAqui.periodos+'</span>'
      :'';

    return '<div id="cr-row-'+i+'" style="display:flex;align-items:center;gap:9px;padding:7px 12px;border-bottom:1px solid var(--brd);'+(esProxima?'background:var(--acc-d)':'')+'">'
      +'<div onclick="toggleCuotaPago(\''+id+'\','+i+')" style="width:22px;height:22px;border-radius:50%;border:2px solid '+(pagado?'var(--grn)':'var(--mut)')+';display:flex;align-items:center;justify-content:center;cursor:pointer;background:'+(pagado?'var(--grn)':'transparent')+';flex-shrink:0">'+(pagado?'<span style="color:#fff;display:flex">'+icon('check',12)+'</span>':'<span style="font-size:10px;color:var(--mut)">'+r.numero+'</span>')+'</div>'
      +'<div style="flex:1;min-width:0">'
      +'<div style="font-size:12px;font-weight:600;color:var(--txt)">Cuota '+r.numero+' de '+totalCuotas+congeladaBadge+'</div>'
      +'<div style="font-size:10px;color:var(--mut);margin-top:1px">'+fechaFmt+' · saldo '+cop(r.saldo)+'</div>'
      +'<div style="font-size:10px;margin-top:1px"><span style="color:var(--grn)">Capital '+cop(r.capital)+'</span> · <span style="color:var(--red)">Interés '+cop(r.intereses)+'</span></div>'
      +'</div>'
      +'<div style="text-align:right;flex-shrink:0;display:flex;align-items:center;gap:6px">'
      +'<div style="font-size:13px;font-weight:700;color:var(--txt)">'+cop(r.valorCuota)+'</div>'
      +'</div>'
      +'</div>'
      +abonoPanelesHtml;
  }).join('');

  if(ocultar && !rowsHtml){
    rowsHtml='<div style="padding:24px;text-align:center;color:var(--grn);font-size:13px;display:flex;align-items:center;justify-content:center;gap:6px">'+icon('check',14)+'Todas las cuotas están pagadas</div>';
  }

  const puedeAbonar=activoCr && !esImportadoCr;
  var abonoBtnHtml=puedeAbonar
    ?'<button onclick="openAbonoModal(\''+id+'\')" style="background:none;border:none;color:var(--mut);cursor:pointer;font-size:12px">'+btnIcon('dollar',13)+'Abonar a capital</button>'
    :'';
  // Congelar solo tiene sentido con un plan calculado por esta app (no uno importado del banco,
  // donde las fechas ya vienen dadas) y con una cuota siguiente que empujar (ver
  // openCongelarModal/generarFechasCredito).
  var congelarBtnHtml=puedeAbonar
    ?'<button onclick="openCongelarModal(\''+id+'\')" style="background:none;border:none;color:var(--mut);cursor:pointer;font-size:12px">'+btnIcon('snowflake',13)+'Congelar cuota</button>'
    :'';
  const mActual=getM();
  const tcVincNombre=(cr.tcVinculada && mActual.tarjetas && mActual.tarjetas[cr.tcVinculada])?mActual.tarjetas[cr.tcVinculada].nombre:null;
  const tcVincBadge=tcVincNombre?'<div style="font-size:11px;color:var(--mut);margin-bottom:6px">Vinculado a tarjeta: <b style="color:var(--txt)">'+esc(tcVincNombre)+'</b></div>':'';
  var frecLbl=(cr.frecuencia==='mensual')?'Mensual':'Quincenal';
  var mensPill=cr.esMensualidad?'<span style="font-size:9px;font-weight:700;background:var(--pur-d);color:var(--pur);padding:1px 7px;border-radius:10px;margin-left:6px;vertical-align:middle">MENSUALIDAD</span>':'';
  var creditoHeaderHtml='<div style="background:var(--surf2);border:1px solid var(--brd2);border-radius:var(--r);padding:11px;margin-bottom:8px">'
    +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:7px">'
    +'<div style="display:flex;align-items:baseline;gap:6px;min-width:0;overflow:hidden">'
    +'<span style="font-size:15px;font-weight:700;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(cr.nombre)+'</span>'+mensPill
    +'<span style="font-size:11px;color:var(--mut);flex-shrink:0">'+frecLbl+'</span></div>'
    +'<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;padding:3px 9px;border-radius:20px;flex-shrink:0;margin-left:8px;'+(activoCr?'background:var(--grn-d);color:var(--grn)':'background:var(--brd2);color:var(--mut)')+'">'+(activoCr?'Activo':'Pagado')+'</div>'
    +'</div>'
    +'<div style="display:flex;align-items:center;gap:12px">'
    +'<div style="position:relative;width:66px;height:66px;flex-shrink:0">'
    +'<div style="width:100%;height:100%;border-radius:50%;background:conic-gradient(var(--acc) '+(pctProgreso*3.6)+'deg,var(--brd) 0deg)"></div>'
    +'<div style="position:absolute;inset:6px;border-radius:50%;background:var(--surf2);display:flex;flex-direction:column;align-items:center;justify-content:center">'
    +'<div style="font-size:14px;font-weight:800;color:var(--txt)">'+pctProgreso+'%</div>'
    +'<div style="font-size:9px;color:var(--mut)">'+pagadas+'/'+totalCuotas+'</div>'
    +'</div></div>'
    +'<div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:6px;min-width:0">'
    +'<div><div style="font-size:9px;color:var(--mut);text-transform:uppercase">Saldo actual</div><div style="font-size:13px;font-weight:700;color:var(--txt)">'+cop(saldoActual)+'</div>'
    +'<div style="font-size:9px;color:var(--mut);margin-top:4px">Valor total del crédito</div><div style="font-size:12px;color:var(--mut)">'+cop(amort.total)+'</div></div>'
    +'<div><div style="font-size:9px;color:var(--mut);text-transform:uppercase">'+(activoCr?'Próximo pago':'Cuota')+'</div><div style="font-size:13px;font-weight:700;color:var(--acc)">'+proximaFechaHdr+'</div>'
    +'<div style="font-size:9px;color:var(--mut);margin-top:4px">Cuota del mes</div><div style="font-size:12px;color:var(--mut)">'+cop(proximaCuotaValHdr)+'</div></div>'
    +'</div>'
    +'</div>'
    +'</div>';
  openWindow(tcVincBadge
    +'<div style="display:flex;justify-content:flex-end;flex-wrap:wrap;gap:14px;margin-bottom:4px">'
    +abonoBtnHtml
    +congelarBtnHtml
    +'<button onclick="editCredito(\''+id+'\')" style="background:none;border:none;color:var(--mut);cursor:pointer;font-size:12px">'+btnIcon('edit',13)+'Editar crédito</button>'
    +'</div>'
    +creditoHeaderHtml
    +'<div style="margin-bottom:7px">'
    +'<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--mut);margin-bottom:3px">'
    +'<span>'+(cuotasPendientes>0?cuotasPendientes+' cuotas pendientes':'Crédito pagado')+'</span>'
    +(cuotasPendientes>0?'<span>Termina '+fechaFinFmt+'</span>':'')
    +'</div>'
    +'<div style="height:5px;background:var(--brd);border-radius:4px;overflow:hidden">'
    +'<div style="height:100%;width:'+pctProgreso+'%;background:var(--acc);border-radius:4px"></div>'
    +'</div>'
    +'</div>'
    +'<div style="display:flex;justify-content:flex-end;margin-bottom:4px">'
    +'<button onclick="toggleOcultarPagadas(\''+id+'\')" style="background:none;border:1px solid var(--brd2);border-radius:20px;padding:4px 10px;font-size:11px;color:var(--mut);cursor:pointer">'
    +(ocultar?'Mostrar pagadas':'Ocultar pagadas')+'</button>'
    +'</div>'
    +'<div id="cr-list" style="max-height:380px;overflow-y:auto;border:1px solid var(--brd);border-radius:var(--r2)">'+rowsHtml+'</div>'
    +'<div class="macts" style="margin-top:10px">'
    +'<button class="bcnl" onclick="volverDesdeCreditoDetalle()">Volver</button>'
    +'<button class="bpri" style="background:var(--red);color:#fff" onclick="confirmDeleteCredito(\''+id+'\')">Eliminar</button>'
    +'</div>');

  setTimeout(function(){
    var el=document.getElementById('cr-row-'+proximaIdx);
    if(el) el.scrollIntoView({block:'center'});
  },50);
}

// Editor completo del crédito — antes solo se podía renombrar (editNombreCredito), y
// corregir cualquier otro dato (valor, tasa, cuotas, fecha...) obligaba a borrar y recrear el
// crédito, perdiendo el historial de pagos (cr.pagos[]) y dejando gastos huérfanos.
function editCredito(id){
  const cr=creditos[id]; if(!cr) return;
  const pagadas=(cr.pagos||[]).filter(Boolean).length;
  const warnPagos=pagadas>0
    ?'<div style="font-size:12px;color:var(--amb);background:var(--amb-d);border-radius:var(--r2);padding:8px 10px;margin-bottom:12px;line-height:1.5">Este crédito ya tiene <b>'+pagadas+' cuota(s) pagada(s)</b>. Si cambias el valor, la tasa, el plazo o la fecha de inicio, la tabla de amortización se recalcula desde cero — las cuotas marcadas como pagadas siguen en su mismo número, pero podrían no coincidir exactamente con lo que ya pagaste. Revisa el detalle después de guardar.</div>'
    :'';
  crPickerReturnToFn=function(){ editCredito(id); };
  const frecActual=(crPickerSnapshot&&('cr-edit-frec' in crPickerSnapshot))?crPickerSnapshot['cr-edit-frec']:(cr.frecuencia||'quincenal');
  const tcVincActual=(crPickerSnapshot&&('cr-tc-vinc' in crPickerSnapshot))?crPickerSnapshot['cr-tc-vinc']:(cr.tcVinculada||'');
  const fechaActualEdit=(crPickerSnapshot&&('cr-edit-fecha' in crPickerSnapshot))?crPickerSnapshot['cr-edit-fecha']:cr.fechaInicio;
  openModal('<div class="mtitle">Editar crédito</div>'
    +warnPagos
    +stdFormHeroCardHtml(stdFormNombreValorHtml('cr-edit-nombre',cr.nombre,'','cr-edit-valor',cr.valorPrestamo,'COP · valor del préstamo','var(--pur)'))
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
    +'<div class="field" style="margin:0"><label>% AVAL</label><input id="cr-edit-aval" type="number" step="0.01" value="'+(cr.pctAval||0)+'"></div>'
    +'<div class="field" style="margin:0"><label>Cuotas</label><input id="cr-edit-cuotas" type="number" value="'+cr.cuotas+'"></div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;align-items:end">'
    +'<div class="field" style="margin:0"><label>Tasa de interés %</label><input id="cr-edit-tasa" type="number" step="0.01" value="'+(cr.tasa||0)+'"></div>'
    +stdFormDateFieldHtml('cr-edit-fecha','Fecha inicio',fechaActualEdit)
    +'</div>'
    +frecuenciaFieldHtml('cr-edit-frec',frecActual)
    +'<div class="field" style="margin-top:8px"><label>Valor de cuota manual (opcional)</label>'
    +'<input id="cr-edit-cuota-manual" type="text" inputmode="numeric" value="'+(cr.valorCuotaManual?moneyInputFmt(cr.valorCuotaManual):'')+'" placeholder="Se sugiere automáticamente" oninput="maskMoneyInput(this)"></div>'
    +'<div class="cbx-row" style="margin-top:2px"><input type="checkbox" id="cr-edit-esmens"'+(cr.esMensualidad?' checked':'')+'>'
    +'<label for="cr-edit-esmens" style="font-size:13px;color:var(--txt)">Es una mensualidad (colegio, transporte, suscripción...)</label></div>'
    +tarjetaVinculadaFieldHtml(tcVincActual||null)
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openCreditoDetalle(\''+id+'\')">Cancelar</button>'
    +'<button class="bpri" onclick="saveEditCredito(\''+id+'\')">Guardar</button>'
    +'</div>');
}
function saveEditCredito(id){
  const cr=creditos[id]; if(!cr) return;
  const nombre=document.getElementById('cr-edit-nombre').value.trim();
  const valorPrestamo=moneyVal('cr-edit-valor');
  const pctAval=parseFloat(document.getElementById('cr-edit-aval').value)||0;
  const cuotas=parseInt(document.getElementById('cr-edit-cuotas').value)||0;
  const tasa=parseFloat(document.getElementById('cr-edit-tasa').value)||0;
  const fechaInicio=document.getElementById('cr-edit-fecha').value;
  const frecuencia=document.getElementById('cr-edit-frec').value;
  const cuotaManual=moneyVal('cr-edit-cuota-manual')||null;
  const esMensualidad=document.getElementById('cr-edit-esmens')?.checked||false;
  const tcVincEl=document.getElementById('cr-tc-vinc');
  const tcVinculada=tcVincEl&&tcVincEl.value?tcVincEl.value:null;

  if(!nombre){showAlert('Escribe un nombre');return;}
  if(!Number.isInteger(cuotas)||cuotas<=0){showAlert('El número de cuotas debe ser un entero mayor a 0');return;}
  if(!valorPrestamo||valorPrestamo<=0){showAlert('El valor del préstamo debe ser mayor a 0');return;}
  if(tasa<0){showAlert('La tasa de interés no puede ser negativa');return;}
  if(pctAval<0){showAlert('El % de AVAL no puede ser negativo');return;}
  if(!fechaInicio){showAlert('Elige una fecha de inicio');return;}

  const pagadas=(cr.pagos||[]).filter(Boolean).length;
  if(cuotas<pagadas){showAlert('Ya tienes '+pagadas+' cuota(s) marcadas como pagadas — no puedes bajar el número de cuotas por debajo de esa cantidad. Desmarca cuotas pagadas primero si de verdad quieres reducir el plazo.');return;}

  if(cuotaManual){
    const totalTest=valorPrestamo+Math.round(valorPrestamo*(pctAval/100));
    const interesPrimera=Math.round(totalTest*(tasa/100)*100)/100;
    if(cuotaManual<=interesPrimera){
      showAlert('La cuota manual ('+cop(cuotaManual)+') no alcanza a cubrir el interés de la primera cuota ('+cop(interesPrimera)+'). El saldo aumentaría en vez de disminuir. Aumenta la cuota o reduce la tasa.');
      return;
    }
  }

  const nombreViejo=cr.nombre;
  // Snapshot para poder revertir si algo de abajo lanza — a diferencia de crear un crédito
  // nuevo (donde basta con borrar creditos[id]), acá cr YA es un objeto en uso; sin revertir,
  // un error a mitad de camino dejaba el crédito con campos nuevos pero sin invalidar/guardar,
  // en un estado a medias que solo se notaba al ver números raros más adelante.
  function aplicarCambiosEdicion(){
    const snapshot={nombre:cr.nombre,valorPrestamo:cr.valorPrestamo,pctAval:cr.pctAval,cuotas:cr.cuotas,
      tasa:cr.tasa,fechaInicio:cr.fechaInicio,frecuencia:cr.frecuencia,valorCuotaManual:cr.valorCuotaManual,
      esMensualidad:cr.esMensualidad,tcVinculada:cr.tcVinculada};
    try{
      cr.nombre=nombre; cr.valorPrestamo=valorPrestamo; cr.pctAval=pctAval;
      cr.cuotas=cuotas; cr.tasa=tasa; cr.fechaInicio=fechaInicio; cr.frecuencia=frecuencia;
      cr.valorCuotaManual=cuotaManual; cr.esMensualidad=esMensualidad; cr.tcVinculada=tcVinculada;
      invalidarAmortCache(id); // los campos que definen la tabla de amortización cambiaron

      // Igual que antes al renombrar: actualizar el nombre en los gastos ya generados que lo referencian
      if(nombreViejo!==nombre){
        Object.keys(db).forEach(function(k){
          var mes=db[k];
          [mes.q1_gastos||[], mes.q2_gastos||[]].forEach(function(list){
            list.forEach(function(g){
              if(g.creditoId===id && g.nombre===prefijoCredito(cr)+nombreViejo){
                g.nombre=prefijoCredito(cr)+nombre;
              }
            });
          });
        });
      }
      save();render();openCreditoDetalle(id);toast('Crédito actualizado');
    }catch(err){
      Object.assign(cr,snapshot);
      invalidarAmortCache(id);
      console.error('Error editando crédito:',err);
      showAlert('No se pudo guardar el cambio con esos datos. Se dejó el crédito como estaba.');
    }
  }

  // Los abonos a capital (cr.abonos) están anclados a la estructura de cuotas anterior — si el
  // usuario cambia valor/tasa/plazo/fecha, esos índices dejan de tener sentido. Se avisa y se
  // limpia el historial de abonos antes de aplicar los cambios (los pagos ya marcados no se pierden).
  if(cr.abonos && cr.abonos.length){
    _pendingEditCredito={id:id, apply:aplicarCambiosEdicion};
    openModal('<div class="mtitle">¿Editar crédito?</div>'
      +'<p style="font-size:13px;color:var(--mut);margin-bottom:16px">Este crédito tiene <b>'+cr.abonos.length+' abono(s) a capital</b> registrados. Editar los datos del crédito elimina el historial de esos abonos (el saldo de las cuotas ya pagadas no se pierde, pero el registro del abono sí). ¿Continuar?</p>'
      +'<div class="macts">'
      +'<button class="bcnl" onclick="editCredito(\''+id+'\')">Cancelar</button>'
      +'<button class="bpri" style="background:var(--red);color:#fff" onclick="confirmarEditCreditoConAbonos(\''+id+'\')">Continuar</button>'
      +'</div>');
    return;
  }
  aplicarCambiosEdicion();
}

function confirmarEditCreditoConAbonos(id){
  const cr=creditos[id]; if(!cr) return;
  if(!_pendingEditCredito || _pendingEditCredito.id!==id) return;
  cr.abonos=[];
  _pendingEditCredito.apply();
  _pendingEditCredito=null;
}

function toggleOcultarPagadas(id){
  creditoOcultarPagadas=!creditoOcultarPagadas;
  openCreditoDetalle(id);
}


function toggleCuotaPago(id,idx){
  const cr=creditos[id]; if(!cr) return;
  if(!cr.pagos) cr.pagos=[];
  const marcandoComoPagada=!cr.pagos[idx];
  // Misma regla que toggleP/confirmarPago: no se puede pagar una cuota si queda una
  // anterior sin pagar (antes solo se validaba desde la lista de gastos, no desde aquí).
  if(marcandoComoPagada){
    var pendNum=cuotaAnteriorPendiente(cr,idx);
    if(pendNum!=null){ avisoCuotaFueraDeOrden(id,pendNum,idx+1); return; }
  }
  cr.pagos[idx]=marcandoComoPagada;
  if(marcandoComoPagada){
    if(!cr.pagoDetalle) cr.pagoDetalle={};
    var amort=calcAmortizacion(cr);
    cr.pagoDetalle[idx]={montoPagado:amort.rows[idx]?amort.rows[idx].valorCuota:0};
  } else if(cr.pagoDetalle){
    delete cr.pagoDetalle[idx];
    invalidarAmortCache(id); // por si el pago tenía un monto real distinto al teórico (abono)
  }
  // Sincronizar el gasto correspondiente en Q1/Q2 si existe en algún mes
  const numCuota=idx+1;
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    [mes.q1_gastos||[], mes.q2_gastos||[]].forEach(function(list){
      var g=list.find(function(x){return x.creditoId===id&&x.numCuota===numCuota;});
      if(g){ setGastoEstado(g,cr.pagos[idx]?'pagado':null); }
    });
  });
  save();
  render(); // actualizar Q1/Q2 de fondo si el gasto cambió
  openCreditoDetalle(id);
}

function confirmDeleteCredito(id){
  const cr=creditos[id]; if(!cr) return;
  openModal('<div class="mtitle">¿Eliminar '+esc(cr.nombre)+'?</div>'
    +'<p style="font-size:13px;color:var(--mut);margin-bottom:16px">Esta acción no se puede deshacer. Los gastos y deducciones de nómina ya creados que apuntan a este crédito no se borran, pero quedan desvinculados (sin número de cuota ni progreso asociado).</p>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openCreditoDetalle(\''+id+'\')">Cancelar</button>'
    +'<button class="bpri" style="background:var(--red);color:#fff" onclick="deleteCredito(\''+id+'\')">Eliminar</button>'
    +'</div>');
}

// Al eliminar un crédito, los gastos (q1_gastos/q2_gastos) y deducciones de nómina
// (ded_q1/ded_q2) que lo referencian quedaban con un creditoId apuntando a nada — sin romper
// la UI (todos los usos ya validan creditos[g.creditoId]), pero perdiendo en silencio el
// número de cuota y el badge de progreso. Se desvinculan explícitamente en vez de dejarlos
// huérfanos.
function deleteCredito(id){
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    [mes.q1_gastos||[], mes.q2_gastos||[]].forEach(function(list){
      list.forEach(function(g){
        if(g.creditoId===id){ g.creditoId=null; g.numCuota=null; }
      });
    });
    var nom=mes.nomina;
    if(nom){
      ['ded_q1','ded_q2'].forEach(function(key){
        (nom[key]||[]).forEach(function(d){
          if(d.creditoId===id){ d.creditoId=null; d.numCuota=null; }
        });
      });
    }
  });
  delete creditos[id];
  invalidarAmortCache(id);
  save();closeModal();closeWindow();openCreditosMenu();toast('Crédito eliminado');
}

