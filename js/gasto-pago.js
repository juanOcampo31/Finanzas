// ── Marcar gasto pagado / sin pagar (incluida la asociación con movimientos de tarjeta) ─────
// Fase 2 de la migración a una arquitectura más modular: separado de gasto-pickers.js — todo lo
// relacionado con cambiar el ESTADO de un gasto ya creado (pagado/sin pagar, individual o en
// grupo, con o sin tarjeta vinculada) vive acá, a diferencia del formulario en sí (gasto-form.js).
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
        // Si el gasto está asociado a un movimiento puntual (g.tcMovimientoOrigenId, ver
        // tcMovimientoField en openGasto), el abono queda enlazado a esa compra en vez de ser
        // genérico — igual que "Abonar" en la pestaña Tarjeta. Puede ser mayor al valor de esa
        // compra sin problema: el excedente sigue contando en el saldo total de la tarjeta
        // (calcTCSaldo suma todos los abonos igual), solo el desglose de esa compra puntual
        // queda en $0/"Pagado" en vez de un pendiente negativo (ver abonoTCDetailsHtml).
        t.movimientos.push({
          id:mvId,
          descripcion:g.nombre,
          tipo:'Abono',
          valor:-Math.abs(g.presupuesto||0),
          fecha:new Date().toISOString().slice(0,10),
          saldo:null,
          movimientoId:g.tcMovimientoOrigenId||undefined
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
  // Enlace con la Agenda (ver js/agenda.js): si este gasto nació de un recordatorio, pagarlo
  // tilda ese recordatorio y, si era recurrente, genera de una vez el siguiente periodo.
  if(g.agendaId && typeof agSincronizarDesdeGasto==='function') agSincronizarDesdeGasto(g,m,true);
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
  if(g.agendaId && typeof agSincronizarDesdeGasto==='function') agSincronizarDesdeGasto(g,m,false);
}
// Tarjeta a la que pertenece el grupo de este gasto (esGrupo+tcCardId), o null si no vive
// dentro de un grupo así — usado para decidir si al pagar corresponde preguntar a qué
// movimiento se asocia el abono (ver toggleP y abrirAsociarPagosGrupoTC).
function tcCardIdDeGasto(g,m){
  if(!g.parentId) return null;
  const allGastos=[...(m.q1_gastos||[]),...(m.q2_gastos||[])];
  const parent=allGastos.find(function(x){return x.id===g.parentId;});
  return (parent&&parent.tcCardId)?parent.tcCardId:null;
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
    // Si el gasto vive en un grupo vinculado a una tarjeta con compras registradas, se pregunta
    // a qué movimiento corresponde este pago — misma modal de "Asociar pagos a la tarjeta" que
    // usa pagar el grupo entero de un tirón (ver abrirAsociarPagosGrupoTC), reutilizada acá con
    // un solo candidato para que la experiencia sea idéntica sin importar por dónde se pague.
    const tcCardId=tcCardIdDeGasto(g,m);
    if(tcCardId){
      const compras=(getTC(m,tcCardId).movimientos||[]).filter(function(mv){return mv.tipo==='Compra';});
      if(compras.length){
        abrirAsociarPagosGrupoTC([g],compras,which,function(){});
        return;
      }
    }
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
  const grupo=list.find(function(x){return x.id===gid;});
  const subs=list.filter(function(x){return x.parentId===gid&&!x.sinpagar;});
  if(!subs.length) return;
  const allPaid=subs.every(function(s){return s.pagado_flag;});
  if(allPaid){
    subs.forEach(function(s){ desmarcarGastoPagado(s,m); });
    save();render();
    return;
  }
  var candidatos=[], pendientesManual=[], bloqueados=[];
  subs.forEach(function(s){
    if(s.pagado_flag || s.presupuesto<0) return;
    if(s.metodo==='PSE' || s.mensualidad){ pendientesManual.push(nombreGasto(s)); return; }
    if(s.creditoId && s.numCuota && creditos[s.creditoId]){
      var pendNum=cuotaAnteriorPendiente(creditos[s.creditoId],s.numCuota-1);
      if(pendNum!=null){ bloqueados.push(nombreGasto(s)+' (cuota '+pendNum+' sin pagar)'); return; }
    }
    candidatos.push(s);
  });
  function avisoRestantes(){
    if(pendientesManual.length||bloqueados.length){
      var partes=[];
      if(bloqueados.length) partes.push('Fuera de orden — '+bloqueados.join(', ')+'.');
      if(pendientesManual.length) partes.push('Requieren pago manual (PSE/mensualidad) — '+pendientesManual.join(', ')+'.');
      showAlert(partes.join(' '),{title:'Algunos gastos no se marcaron como pagados'});
    }
  }
  if(!candidatos.length){ avisoRestantes(); return; }

  // Si el grupo está ligado a una tarjeta con movimientos "Compra" registrados, se ofrece
  // asociar de una sola vez a qué compra corresponde cada abono del lote — la misma modal que
  // usa toggleP para pagar un solo gasto de este mismo grupo. "Abono TC" ya NO cubre todo el
  // saldo pendiente (syncTCGrupo le resta los demás gastos del grupo sin pagar), así que cada
  // uno, ese incluido, sí debe crear su propio movimiento al pagarse.
  var compras=(grupo&&grupo.tcCardId)?((getTC(m,grupo.tcCardId).movimientos||[]).filter(function(mv){return mv.tipo==='Compra';})):[];
  if(grupo&&grupo.tcCardId&&compras.length){
    abrirAsociarPagosGrupoTC(candidatos,compras,which,avisoRestantes);
    return;
  }

  candidatos.forEach(function(s){ marcarGastoPagado(s,m); });
  save();render();
  avisoRestantes();
}
// Modal de "pagar todo el grupo" cuando la tarjeta tiene compras registradas: por cada gasto del
// lote se puede elegir a qué compra asociarlo, en vez de dejarlo como abono genérico — mismo
// criterio de vinculación que un pago individual, pero para todos a la vez. Cada fila usa un
// botón que abre un picker de pantalla completa (mismo patrón que "Asociar a un gasto ya
// creado" en Agenda, ver agAbrirPickerGastoExistente) en vez de un <select> nativo: en móvil el
// picker nativo de un <select> no se puede tematizar (aparece con el estilo del sistema, no el
// de la app), así que acá se construye la lista a mano para que se vea igual en cualquier
// dispositivo. Solo hay una modal a la vez (openModal reemplaza el contenido, ver ui-core.js),
// así que la selección en curso vive en window._tcgPagoBatch y no en el DOM.
function abrirAsociarPagosGrupoTC(candidatos,compras,which,avisoRestantes){
  window._tcgPagoBatch={candidatos:candidatos,compras:compras,which:which,avisoRestantes:avisoRestantes,seleccion:{}};
  renderAsociarPagosGrupoTC();
}
function renderAsociarPagosGrupoTC(){
  var batch=window._tcgPagoBatch;
  if(!batch) return;
  var filasHtml=batch.candidatos.map(function(s){
    var movId=batch.seleccion[s.id];
    var compraSel=movId?batch.compras.find(function(mv){return mv.id===movId;}):null;
    var label=compraSel?esc(compraSel.descripcion||'Sin descripción'):'Abono genérico';
    return '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid var(--brd)">'
      +'<div style="min-width:0;flex:1;margin-right:8px"><div class="gname" style="font-weight:700">'+esc(nombreGasto(s))+'</div>'
      +'<div class="gmeta">'+cop(s.presupuesto)+'</div></div>'
      +'<button type="button" onclick="abrirElegirMovimientoTCG(\''+s.id+'\')" style="max-width:170px;flex-shrink:0;display:flex;align-items:center;gap:5px;background:var(--surf2);border:1px solid var(--brd);border-radius:8px;padding:6px 10px;cursor:pointer">'
      +'<span style="font-size:12.5px;color:var(--txt);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+label+'</span>'
      +'<span style="color:var(--mut);display:flex;flex-shrink:0">'+icon('chevronDown',12)+'</span>'
      +'</button>'
      +'</div>';
  }).join('');
  openModal('<div class="mtitle">Asociar pagos a la tarjeta</div>'
    +'<p style="font-size:12px;color:var(--mut);margin-bottom:10px">Elige a qué compra corresponde cada abono (opcional).</p>'
    +'<div style="max-height:340px;overflow-y:auto">'+filasHtml+'</div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="cancelarAsociarPagosGrupoTC()">Cancelar</button>'
    +'<button class="bpri" onclick="confirmarAsociarPagosGrupoTC()">Confirmar pagos</button>'
    +'</div>');
}
// Picker de pantalla completa para elegir el movimiento de un gasto puntual del lote — al volver
// (elegir uno o cancelar) se reconstruye renderAsociarPagosGrupoTC() con la selección puesta al día.
function abrirElegirMovimientoTCG(gastoId){
  var batch=window._tcgPagoBatch;
  if(!batch) return;
  var itemsHtml='<div onclick="elegirMovimientoTCG(\''+gastoId+'\',\'\')" style="padding:13px 4px;display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid var(--brd);cursor:pointer">'
    +'<span style="font-size:14px;font-weight:600;color:var(--txt)">Abono genérico</span>'
    +'<span style="font-size:12px;color:var(--mut)">Sin asociar</span></div>'
    +batch.compras.map(function(mv){
      return '<div onclick="elegirMovimientoTCG(\''+gastoId+'\',\''+mv.id+'\')" style="padding:13px 4px;display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid var(--brd);cursor:pointer">'
        +'<span style="font-size:14px;font-weight:600;color:var(--txt)">'+esc(mv.descripcion||'Sin descripción')+'</span>'
        +'<span style="font-size:13px;color:var(--mut);flex-shrink:0">'+cop(Math.abs(mv.valor||0))+'</span></div>';
    }).join('');
  openModal('<div class="mtitle">¿A qué movimiento corresponde?</div>'
    +'<div style="max-height:360px;overflow-y:auto;margin-bottom:14px">'+itemsHtml+'</div>'
    +'<button class="bcnl" style="width:100%" onclick="renderAsociarPagosGrupoTC()">Cancelar</button>');
}
function elegirMovimientoTCG(gastoId,movId){
  var batch=window._tcgPagoBatch;
  if(!batch) return;
  batch.seleccion[gastoId]=movId||'';
  renderAsociarPagosGrupoTC();
}
function cancelarAsociarPagosGrupoTC(){
  window._tcgPagoBatch=null;
  closeModal();
}
function confirmarAsociarPagosGrupoTC(){
  var batch=window._tcgPagoBatch;
  if(!batch){ closeModal(); return; }
  var m=getM(),list=batch.which==='q1'?m.q1_gastos:m.q2_gastos;
  batch.candidatos.forEach(function(s){
    var g=list.find(function(x){return x.id===s.id;});
    if(!g) return;
    g.tcMovimientoOrigenId=batch.seleccion[s.id]||null;
    marcarGastoPagado(g,m);
  });
  window._tcgPagoBatch=null;
  save();closeModal();render();
  if(batch.avisoRestantes) batch.avisoRestantes();
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

  // Si el gasto vive en un grupo de tarjeta, un select en línea (no una modal aparte, ya hay
  // varios campos en este mismo formulario) para asociar el pago a un movimiento puntual —
  // mismo criterio de asociación que el check simple en toggleP/abrirAsociarPagosGrupoTC.
  var tcMovField='';
  var tcCardIdPago=tcCardIdDeGasto(g,getM());
  if(tcCardIdPago){
    var comprasPago=(getTC(getM(),tcCardIdPago).movimientos||[]).filter(function(mv){return mv.tipo==='Compra';});
    var tcMovOptsPago='<option value="">Abono genérico (sin asociar)</option>'+comprasPago.map(function(mv){
      return '<option value="'+mv.id+'"'+(g.tcMovimientoOrigenId===mv.id?' selected':'')+'>'+esc(mv.descripcion||'Sin descripción')+' · '+cop(Math.abs(mv.valor||0))+'</option>';
    }).join('');
    tcMovField='<div class="field"><label>Asociar a movimiento de tarjeta</label><select id="pg-tcmov">'+tcMovOptsPago+'</select></div>';
  }

  openModal('<div class="mtitle">Confirmar pago</div>'
    +'<p style="font-size:13px;color:var(--mut);margin-bottom:10px">'+esc(nombreGasto(g))+' · '+cop(g.presupuesto)+'</p>'
    +cuotaInfo
    +'<div class="field"><label>Valor pagado</label>'
    +'<input id="pg-val" type="text" inputmode="numeric" value="'+moneyInputFmt(g.pagado_real||g.presupuesto)+'" placeholder="'+cop(g.presupuesto)+'" oninput="maskMoneyInput(this)"></div>'
    +mensField
    +tcMovField
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
  const tcMovEl=document.getElementById('pg-tcmov');
  if(tcMovEl) g.tcMovimientoOrigenId=tcMovEl.value||null;
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
      // Igual que en marcarGastoPagado: si el gasto está asociado a un movimiento puntual, el
      // abono queda enlazado a esa compra (puede superar su valor sin problema, ver comentario allá).
      t.movimientos.push({
        id:mvId,
        descripcion:g.nombre+(comp?' ('+comp+')':''),
        tipo:'Abono',
        valor:-montoAbono,
        fecha:fecha||new Date().toISOString().slice(0,10),
        saldo:null,
        movimientoId:g.tcMovimientoOrigenId||undefined
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

// ── Pagos parciales de un gasto (abonos acumulables) ────────────────────────────────────────
// Mismo patrón que los abonos a capital de un crédito (ver openAbonoModal en
// creditos-abonos.js): varios pagos sueltos que se van sumando hasta completar el valor del
// gasto, en vez de tener que marcarlo pagado de una sola vez por el total. Al alcanzar el 100%
// se marca "Pagado" solo, reusando marcarGastoPagado (con sus mismos efectos: movimiento de
// tarjeta si el gasto está en un grupo vinculado, cuota de crédito, sincronía con Agenda).
function abrirAbonosGasto(id,which){
  const m=getM();
  const list=which==='q1'?m.q1_gastos:m.q2_gastos;
  const g=list.find(function(x){return x.id===id;});
  if(!g) return;
  const abonos=g.abonos||[];
  const totalAbonado=abonos.reduce(function(a,ab){return a+(ab.monto||0);},0);
  const valorGasto=Math.abs(g.presupuesto||0);
  const restante=Math.max(0,valorGasto-totalAbonado);
  const abonosOrdenados=abonos.slice().sort(function(a,b){return (a.fecha||'')<(b.fecha||'')?1:-1;});
  const rowsHtml=abonosOrdenados.length?abonosOrdenados.map(function(ab){
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 4px;border-bottom:1px solid var(--brd)">'
      +'<span style="font-size:13px;color:var(--txt)">'+fmtD(ab.fecha)+'</span>'
      +'<div style="display:flex;align-items:center;gap:10px">'
      +'<span style="font-size:13px;font-weight:700;color:var(--txt)">'+cop(ab.monto)+'</span>'
      +'<button onclick="confirmarEliminarAbonoGasto(\''+id+'\',\''+which+'\',\''+ab.id+'\')" style="background:none;border:none;color:var(--red);cursor:pointer;display:flex;align-items:center">'+icon('trash',14)+'</button>'
      +'</div></div>';
  }).join(''):'<div style="padding:20px;text-align:center;color:var(--mut);font-size:12px">Sin pagos parciales todavía.</div>';

  openModal('<div class="mtitle">Pagos parciales</div>'
    +'<p style="font-size:12px;color:var(--mut);margin-bottom:10px;line-height:1.5">'+esc(nombreGasto(g))+' · Pagado <b style="color:var(--txt)">'+cop(totalAbonado)+'</b> de '+cop(valorGasto)+(restante>0?(' · Falta '+cop(restante)):'')+'</p>'
    +'<div style="max-height:300px;overflow-y:auto;border:1px solid var(--brd);border-radius:var(--r2);margin-bottom:14px">'+rowsHtml+'</div>'
    +(restante>0?'<button class="bpri" style="width:100%;margin-bottom:10px" onclick="openNuevoAbonoGasto(\''+id+'\',\''+which+'\')">＋ Agregar pago parcial</button>':'')
    +'<button class="bcnl" style="width:100%" onclick="editGasto(\''+id+'\',\''+which+'\')">Volver</button>');
}
function openNuevoAbonoGasto(id,which){
  openModal('<div class="mtitle">Nuevo pago parcial</div>'
    +'<div class="field"><label>Monto</label><input id="pg-abono-val" type="text" inputmode="numeric" placeholder="Ej: 50.000" oninput="maskMoneyInput(this)"></div>'
    +'<div class="field"><label>Fecha</label><input id="pg-abono-fecha" type="date" value="'+new Date().toISOString().slice(0,10)+'"></div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="abrirAbonosGasto(\''+id+'\',\''+which+'\')">Cancelar</button>'
    +'<button class="bpri" onclick="confirmarAbonoGasto(\''+id+'\',\''+which+'\')">Guardar</button>'
    +'</div>');
}
function confirmarAbonoGasto(id,which){
  const m=getM();
  const list=which==='q1'?m.q1_gastos:m.q2_gastos;
  const g=list.find(function(x){return x.id===id;});
  if(!g) return;
  const monto=moneyVal('pg-abono-val');
  const fecha=document.getElementById('pg-abono-fecha').value||new Date().toISOString().slice(0,10);
  if(!monto||monto<=0){ showAlert('El monto del pago debe ser mayor a 0'); return; }
  if(!g.abonos) g.abonos=[];
  g.abonos.push({id:uid(),monto:monto,fecha:fecha});
  const totalAbonado=g.abonos.reduce(function(a,ab){return a+(ab.monto||0);},0);
  const valorGasto=Math.abs(g.presupuesto||0);
  if(totalAbonado>=valorGasto && gastoEstado(g)!=='pagado'){
    marcarGastoPagado(g,m);
    save();render();closeModal();
    toast('Pago registrado. El gasto quedó pagado por completo.');
    return;
  }
  save();render();
  abrirAbonosGasto(id,which);
  toast('Pago parcial registrado');
}
function confirmarEliminarAbonoGasto(id,which,abonoId){
  showConfirm('¿Eliminar este pago parcial?',function(){
    eliminarAbonoGasto(id,which,abonoId);
  });
}
function eliminarAbonoGasto(id,which,abonoId){
  const m=getM();
  const list=which==='q1'?m.q1_gastos:m.q2_gastos;
  const g=list.find(function(x){return x.id===id;});
  if(!g||!g.abonos) return;
  g.abonos=g.abonos.filter(function(ab){return ab.id!==abonoId;});
  save();render();
  abrirAbonosGasto(id,which);
  toast('Pago parcial eliminado');
}

