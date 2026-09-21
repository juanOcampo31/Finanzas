// ── Tarjeta: interfaz ─────────────────────────────────────────────────────────
// Fase 2 de la migración a una arquitectura más modular: separado de render.js — todo lo
// relacionado con la pestaña Tarjeta (movimientos, resumen, alta de tarjeta) vive acá.
//
// Chip compacto "✓ $X" de una compra de tarjeta con abonos ligados (ver abonadoChip en renderTC):
// tocarlo despliega/oculta su detalle (abonoTCDetalleHtml) sin reconstruir toda la lista de
// movimientos, mismo patrón que toggleGG.
function toggleTCAbono(movId){
  tcAbonoOpen[movId]=!tcAbonoOpen[movId];
  const w=document.getElementById('tcab-'+movId);
  if(w) w.style.display=tcAbonoOpen[movId]?'block':'none';
}
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

  // ── Selector de tarjetas (píldoras, compartido con el picker de Inicio) —
  // va dentro del mismo panel tc-mini, igual que en Inicio.
  var cardPills=buildTcPickerHtml(m,tcIds,curTC,true);
  const tcMiniHtml=buildTcMiniHtml(m,curTC,null,cardPills);

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

  const headerCard='<div class="card" style="padding:12px 14px;margin-bottom:10px">'
    +'<div style="display:flex;align-items:center;justify-content:space-between">'
    +'<span style="font-size:12px;font-weight:700;color:var(--mut)">Información de la tarjeta</span>'
    +'<button onclick="toggleTCInfo()" style="background:none;border:none;color:var(--mut);cursor:pointer;padding:2px 8px;flex-shrink:0;display:flex;align-items:center">'+icon('dots',18)+'</button>'
    +'</div>'
    +(tcOpen?'<div style="margin-top:8px;border-top:1px solid var(--brd);padding-top:6px">'+infoBody+'</div>':'')
    +'</div>';

  // Créditos marcados como "compra diferida a cuotas" de esta tarjeta (cr.tcVinculada===curTC)
  // — solo informativo/de seguimiento: no afecta el saldo de la tarjeta (que sigue siendo
  // compras−abonos como siempre), pero antes no había ningún lugar donde ver, junto a la
  // tarjeta, qué cuotas fijas diferidas están corriendo sobre ella.
  var creditosVinculados=Object.keys(creditos).filter(function(cid){return creditos[cid].tcVinculada===curTC;});
  var creditosVinculadosHtml='';
  if(creditosVinculados.length){
    var filas=creditosVinculados.map(function(cid){
      var cr=creditos[cid];
      var estado=calcEstadoCredito(cr);
      return '<div onclick="creditoDetalleDesdeModal=false;openCreditoDetalle(\''+cid+'\')" style="display:flex;justify-content:space-between;align-items:center;padding:9px 12px;border-bottom:1px solid var(--brd);cursor:pointer">'
        +'<div><div style="font-size:12px;font-weight:600;color:var(--txt)">'+esc(cr.nombre)+'</div>'
        +'<div style="font-size:10px;color:var(--mut);margin-top:1px">'+estado.pagadasVisual+'/'+estado.amort.rows.length+' cuotas pagadas</div></div>'
        +'<div style="font-size:13px;font-weight:700;color:var(--txt)">'+cop(estado.saldoActual)+'</div>'
        +'</div>';
    }).join('');
    creditosVinculadosHtml='<div style="display:flex;justify-content:space-between;align-items:center;padding:2px 4px 8px"><span style="font-size:15px;font-weight:700;color:var(--txt)">Compras diferidas a cuotas</span></div>'
      +'<div class="card" style="margin-bottom:10px">'+filas+'</div>';
  }

  if(!tc.length) return tcMiniHtml+headerCard+creditosVinculadosHtml+'<div class="empty"><div class="eic" style="display:flex;justify-content:center;color:var(--mut)">'+icon('card',36)+'</div><p>Sin movimientos. Toca + para agregar.</p></div>';

  // Cada movimiento es su propia fila (antes se agrupaban por descripción — un "Gasolina" del
  // 3 y otro del 20 quedaban plegados bajo una sola fila "Gasolina", había que expandirla para
  // ver/editar cada uno) — EXCEPTO los abonos ligados a una compra puntual (movimientoId, ver
  // abrirAbonoMovimiento en tarjeta.js): esos no aparecen como fila propia en la lista general,
  // se resumen en el chip "✓ $X" de su compra (ver abonadoChip) — tocarlo despliega este detalle
  // (total abonado, saldo antes/después, cada abono individual con su botón de eliminar), igual
  // que "Abono a capital" en el detalle de un crédito (ver abonoDetailsHtml en creditos.js), pero
  // con el estado de abierto/cerrado en tcAbonoOpen para no perderlo entre renders (ver toggleTCAbono).
  function abonoTCDetalleHtml(compra,ligados){
    var color='var(--grn)';
    var totalAbonado=ligados.reduce(function(a,y){return a+Math.abs(y.valor||0);},0);
    var saldoAntes=Math.abs(compra.valor||0);
    // Sin Math.max(0,...): si los abonos superan el valor de la compra, el saldo después queda
    // negativo a propósito (un crédito a favor sobre ese movimiento puntual) en vez de quedar
    // oculto en $0 — el excedente de todas formas ya cuenta en el saldo total de la tarjeta.
    var saldoDespues=Math.round((saldoAntes-totalAbonado)*100)/100;
    var saldoDespuesColor=saldoDespues<0?'var(--red)':'var(--txt)';
    var saldoDespuesTxt=saldoDespues<0?('-'+cop(Math.abs(saldoDespues))):cop(saldoDespues);
    var compsHtml=ligados.slice().sort(function(a,b){return a.fecha>b.fecha?-1:a.fecha<b.fecha?1:0;}).map(function(y){
      return '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;padding-top:4px;border-top:1px solid var(--brd)">'
        +'<span>'+esc(y.descripcion||'Abono')+' ('+fmtD(y.fecha)+')</span>'
        +'<span style="display:flex;align-items:center;gap:6px">'
        +'<span style="color:'+color+';font-weight:600">'+cop(Math.abs(y.valor||0))+'</span>'
        +'<button onclick="event.stopPropagation();confirmarEliminarAbonoTC(\''+y.id+'\')" style="background:none;border:1px solid rgba(248,113,113,.4);border-radius:var(--r2);padding:3px 7px;font-size:9px;color:var(--red);cursor:pointer">Eliminar</button>'
        +'</span></div>';
    }).join('');
    return '<div style="padding:8px 10px;background:var(--surf2);border-radius:var(--r2);font-size:11px;color:var(--mut)">'
      +'<div style="display:flex;justify-content:space-between"><span>Total abonado</span><span style="color:'+color+';font-weight:600">'+cop(totalAbonado)+'</span></div>'
      +'<div style="display:flex;justify-content:space-between;margin-top:2px"><span>Saldo antes</span><span>'+cop(saldoAntes)+'</span></div>'
      +'<div style="display:flex;justify-content:space-between;margin-top:2px"><span>Saldo después</span><span style="color:'+saldoDespuesColor+';font-weight:600">'+saldoDespuesTxt+'</span></div>'
      +compsHtml
      +'</div>';
  }

  var abonosPorCompra={};
  tc.forEach(function(x){
    if(x.tipo==='Abono'&&x.movimientoId){
      if(!abonosPorCompra[x.movimientoId]) abonosPorCompra[x.movimientoId]=[];
      abonosPorCompra[x.movimientoId].push(x);
    }
  });
  var idsAgrupados={};
  Object.keys(abonosPorCompra).forEach(function(compraId){
    // Si la compra padre ya no existe (se borró), sus abonos quedan huérfanos — se muestran
    // sueltos como cualquier otro movimiento, en vez de perderse de la lista.
    if(tc.some(function(y){return y.id===compraId;})){
      abonosPorCompra[compraId].forEach(function(a){ idsAgrupados[a.id]=true; });
    } else {
      delete abonosPorCompra[compraId];
    }
  });
  var topMovs=tc.filter(function(x){ return !idsAgrupados[x.id]; });
  var sorted=[...topMovs].sort(function(a,b){return a.fecha>b.fecha?-1:a.fecha<b.fecha?1:0;});
  var grupoRows=sorted.map(function(x){
    var ab=x.tipo==='Abono';
    var ligados=(!ab&&abonosPorCompra[x.id])?abonosPorCompra[x.id]:null;
    var totalAbonado=ligados?ligados.reduce(function(a,y){return a+Math.abs(y.valor||0);},0):0;
    // Sin Math.max(0,...): si lo abonado supera el valor de la compra, saldoMov queda negativo
    // a propósito (crédito a favor sobre ESA compra) en vez de esconderse en $0 — ver
    // abonoTCDetailsHtml, mismo criterio.
    var saldoMov=ligados?Math.round((Math.abs(x.valor||0)-totalAbonado)*100)/100:Math.abs(x.valor||0);

    var extraInfo='', abonarBtn='', abonadoChip='';
    if(!ab){
      if(saldoMov>0){
        abonarBtn='<button onclick="event.stopPropagation();abrirAbonoMovimiento(\''+x.id+'\')" style="background:var(--acc-d);color:var(--acc);border:1px solid var(--acc);border-radius:20px;padding:3px 10px;font-size:11px;font-weight:600;cursor:pointer;flex-shrink:0;white-space:nowrap">Abonar</button>';
      }
      if(ligados&&totalAbonado>0){
        abonadoChip='<span class="tc-abonado-chip" onclick="event.stopPropagation();toggleTCAbono(\''+x.id+'\')">'+icon('check',9)+cop(totalAbonado)+'</span>';
      }
    } else if(x.movimientoId){
      var compraOrigen=tc.find(function(y){return y.id===x.movimientoId;});
      if(compraOrigen) extraInfo='<div style="font-size:10px;color:var(--mut);margin-top:1px">→ '+esc(compraOrigen.descripcion||'')+'</div>';
    }
    // Con abonos ligados, el valor mostrado en la fila es el SALDO de esa compra (lo que queda
    // por pagar, o negativo si se abonó de más), no el valor original — el original se deja
    // tachado, chiquito, como referencia. Ya pagada exacto, se reemplaza por "Pagado".
    var valorOriginalHtml=(ligados&&totalAbonado>0)?'<div style="font-size:10px;color:var(--mut);text-decoration:line-through">'+cop(Math.abs(x.valor||0))+'</div>':'';
    var tcValHtml;
    if(ligados&&saldoMov<0){
      tcValHtml='<div class="tcval a">-'+cop(Math.abs(saldoMov))+' a favor</div>';
    } else if(ligados&&saldoMov===0){
      tcValHtml='<div class="tcval a">Pagado</div>';
    } else {
      tcValHtml='<div class="tcval '+(ab?'a':'c')+'">'+(ab?'-':'+')+cop(saldoMov)+'</div>';
    }
    return '<div class="tc-group">'
      +'<div class="tc-group-head" onclick="editTC(\''+x.id+'\')" style="cursor:pointer">'
      +'<div class="tcic '+(ab?'a':'c')+'">'+icon(ab?'arrowDown':'arrowUp',14)+'</div>'
      +'<div style="flex:1;min-width:0">'
      +'<div class="tcdesc">'+esc(x.descripcion||'Sin descripción')+'</div>'
      +'<div class="tcdate" style="display:flex;align-items:center;gap:6px">'+fmtD(x.fecha)+abonadoChip+'</div>'
      +extraInfo
      +'</div>'
      +'<div style="text-align:right;display:flex;align-items:center;gap:8px">'
      +abonarBtn
      +'<div>'+valorOriginalHtml+tcValHtml+'</div>'
      +'</div>'
      +'</div>'
      +(ligados&&ligados.length?('<div id="tcab-'+x.id+'" style="display:'+(tcAbonoOpen[x.id]?'block':'none')+';padding:0 14px 10px">'+abonoTCDetalleHtml(x,ligados)+'</div>'):'')
      +'</div>';
  }).join('');

  const periodoTotal=compras+abonos;
  const comprasDeg=periodoTotal>0?(compras/periodoTotal)*360:0;
  const icSwap='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';
  const resumenRow='<div style="display:flex;align-items:center;gap:12px;padding:14px;border-top:1px solid var(--brd)">'
    +'<div style="width:34px;height:34px;border-radius:10px;background:var(--acc-d);color:var(--acc);display:flex;align-items:center;justify-content:center;flex-shrink:0">'+icSwap+'</div>'
    +'<div style="flex:1;min-width:0">'
    +'<div style="font-size:11px;color:var(--mut);margin-bottom:3px">Resumen del periodo</div>'
    +'<div style="font-size:13px"><span style="color:var(--mut)">Compras</span> <span style="font-weight:600;color:var(--red)">'+cop(compras)+'</span>'
    +'<span style="color:var(--mut);margin:0 5px">|</span><span style="color:var(--mut)">Abonos</span> <span style="font-weight:600;color:var(--grn)">- '+cop(abonos)+'</span></div>'
    +'</div>'
    +(periodoTotal>0?('<div style="position:relative;width:44px;height:44px;flex-shrink:0">'
      +'<div style="width:100%;height:100%;border-radius:50%;background:conic-gradient(var(--red) '+comprasDeg+'deg,var(--grn) 0deg)"></div>'
      +'<div style="position:absolute;inset:8px;border-radius:50%;background:var(--surf)"></div>'
      +'</div>'):'')
    +'</div>';

  return tcMiniHtml+headerCard+creditosVinculadosHtml
    +'<div style="display:flex;justify-content:space-between;align-items:center;padding:2px 4px 8px">'
    +'<span style="font-size:15px;font-weight:700;color:var(--txt)">Movimientos</span>'
    +'</div>'
    +'<div class="card">'
    +grupoRows
    +resumenRow
    +'</div>';
}

function selectTC(tid){
  curTC=tid;
  render();
}

// Marcas disponibles para el "logo" simple mostrado en el carrusel de tarjetas del resumen.
const TC_MARCAS=['Ninguna','Visa','Mastercard','Amex'];
// Marca elegida mientras el formulario "Nueva tarjeta" está abierto — vive fuera del propio
// <select> (que ya no existe: ver abrirPickerMarcaNewCard) para sobrevivir a la ida y vuelta del
// picker de pantalla completa, mismo patrón que agFormFormaPago en Agenda.
let tcNewCardMarca=null;
let tcNewCardSnapshot=null;
function abrirNuevaTarjeta(){
  tcNewCardMarca=null;
  tcNewCardSnapshot=null;
  openNewCard();
}
// Mismo estándar visual que "Editar/Nuevo gasto" (encabezado X + título, filas de detalle con
// ícono/picker de pantalla completa, footer Guardar/Cancelar) — ver stdForm* en format-utils.js.
function openNewCard(){
  const marcaActual=tcNewCardMarca||'Ninguna';
  const headerHtml=stdFormHeaderHtml('Nueva tarjeta');
  const detallesCardHtml=stdFormCardHtml(stdFormRowHtml('card','var(--acc-d)','var(--acc)','Marca',marcaActual,'abrirPickerMarcaNewCard()',false));
  const footerHtml=stdFormFooterHtml('saveNewCard()','Crear');
  openModal(headerHtml
    +stdFormHeroCardHtml('<div class="field" style="margin:0"><label>Nombre de la tarjeta</label>'
      +'<input id="newcard-nombre" value="'+esc((tcNewCardSnapshot&&tcNewCardSnapshot.nombre)||'')+'" placeholder="Ej: BBVA, Falabella, Visa..."></div>')
    +detallesCardHtml
    +'<div class="field"><label>Últimos 4 dígitos (opcional)</label>'
    +'<input id="newcard-ultimos4" maxlength="4" inputmode="numeric" value="'+esc((tcNewCardSnapshot&&tcNewCardSnapshot.ultimos4)||'')+'" placeholder="Ej: 9537"></div>'
    +footerHtml);
  tcNewCardSnapshot=null;
}
function abrirPickerMarcaNewCard(){
  tcNewCardSnapshot={
    nombre:document.getElementById('newcard-nombre')?document.getElementById('newcard-nombre').value:'',
    ultimos4:document.getElementById('newcard-ultimos4')?document.getElementById('newcard-ultimos4').value:''
  };
  const current=tcNewCardMarca||'Ninguna';
  const itemsHtml=TC_MARCAS.map(function(mk){return pickerItemRow("elegirMarcaNewCard('"+mk+"')",mk,mk===current);}).join('');
  renderPickerModal('Marca',itemsHtml,null,'openNewCard()');
}
function elegirMarcaNewCard(mk){
  tcNewCardMarca=mk;
  openNewCard();
}
function saveNewCard(){
  const nombre=document.getElementById('newcard-nombre').value.trim();
  if(!nombre){showAlert('Escribe un nombre');return;}
  const marca=tcNewCardMarca&&tcNewCardMarca!=='Ninguna'?tcNewCardMarca:null;
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

