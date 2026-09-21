// ── Vista Inicio ───────────────────────────────────────────────────────────────
// Fase 2 de la migración a una arquitectura más modular: separado de render.js — la pestaña
// Inicio (tarjetas Q1/Q2, mini-resumen de tarjeta, "N de M pagados") vive acá.
const DOW_ABBR=['dom','lun','mar','mié','jue','vie','sáb'];
const MESES_ABBR_MIN=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function selectHomeQ(q){
  homeQ=q;
  render();
}

// Panel de tarjetas Q1/Q2 (compartido entre Inicio e Ingresos) — misma tarjeta visual,
// pero el valor grande y su etiqueta son configurables (disponible vs. ingresos).

function buildQCardsHtml(m,activeQ,selectFn,valueLbl,valueQ1,valueQ2,vencQ1,vencQ2,pagadosQ1,pagadosQ2){
  const mi=MESES.indexOf(m.nombre);
  const miSafe=mi>=0?mi:0;
  const {q1,q2}=getPago(m.año,miSafe);
  const ultimoDia=new Date(m.año,miSafe+1,0).getDate();
  const rangoQ1='1–15 '+MESES_ABBR_MIN[miSafe];
  const rangoQ2='16–'+ultimoDia+' '+MESES_ABBR_MIN[miSafe];

  function pagoInfo(dt){
    const d=diasHasta(dt), st=diasStatus(d);
    return {fecha:DOW_ABBR[dt.getDay()]+' '+dt.getDate(), sub:st.txt};
  }
  const pagoQ1=pagoInfo(q1), pagoQ2=pagoInfo(q2);

  // "N de M pagados" (ver calcPagadosIndividualGastos) — opcional: solo Inicio lo pasa como
  // {pagados,total} (Ingresos reutiliza este mismo componente sin ese concepto). Mismo estilo
  // discreto que el rango de fechas ("1–15 oct", no el de la etiqueta "Q1" en negrita) — salvo
  // que esta quincena YA pasó su fecha de pago (yaPagada) y todavía queda algo sin pagar: ahí se
  // resalta en ámbar, porque significa que quedó un pago pendiente de una quincena vieja.
  function qCard(qKey,label,rango,val,pago,venc,pagadosInfo){
    const active=activeQ===qKey;
    // Sin saldo disponible (solo aplica al DISPONIBLE de Inicio, no al total de Ingresos): el
    // número negativo se deja igual que siempre ("-$80.000"), solo cambia la etiqueta de arriba
    // ("DISPONIBLE" → "SIN SALDO DISPONIBLE") para que quede claro de una que es un déficit.
    const sinSaldo=val<0&&valueLbl==='DISPONIBLE';
    // El ícono de alerta ya se muestra junto a "SIN SALDO DISPONIBLE" (la etiqueta de arriba,
    // ver sinSaldo/qcard-disp-lbl) — repetirlo también junto al monto era redundante.
    const vencIcon=(!sinSaldo&&venc&&venc.length)?'<span title="Cuota de crédito vencida" style="color:var(--amb);display:inline-flex;vertical-align:-2px;margin-left:5px">'+icon('alertTriangle',13)+'</span>':'';
    const sepHtml='<div class="qcard-sep"></div>';
    // Misma idea que en Nómina: si esta quincena ya se pagó, el valor y el texto "Pago {fecha}"
    // se muestran en gris en vez de a la par de la que sigue en curso (ver qTab en nomina.js).
    // La palabra "pagado" del sub-texto se deja tal cual estaba (en rojo, el estándar actual).
    const yaPagada=pago.sub==='pagado';
    const valStyle=yaPagada?' style="color:var(--mut)"':'';
    const pagoTxtColor=yaPagada?'var(--mut)':(active?'var(--acc)':'var(--txt)');
    const pagoSubStyle=pago.sub==='pagado'?' style="color:var(--red)"':'';
    var pagadosHtml='';
    if(pagadosInfo&&pagadosInfo.total>0){
      var hayPendientesVencidos=yaPagada&&pagadosInfo.pagados<pagadosInfo.total;
      var pagadosTxt=pagadosInfo.pagados+' de '+pagadosInfo.total+' pagados';
      pagadosHtml=hayPendientesVencidos
        ?(' · <span style="color:var(--amb);font-weight:800;font-size:9.5px">'+btnIcon('alertTriangle',10)+pagadosTxt+'</span>')
        :(' · <span style="font-weight:600;color:var(--mut);font-size:9.5px">'+pagadosTxt+'</span>');
    }
    return '<div class="qcard'+(active?' active':'')+'" onclick="'+selectFn+'(\''+qKey+'\')">'
      +'<div class="qcard-top"><span class="qcard-lbl'+(active?' active':'')+'">'+label+pagadosHtml+'</span><span class="qcard-range">'+rango+'</span></div>'
      +'<div class="qcard-disp-lbl"'+(sinSaldo?' style="color:var(--red);display:flex;align-items:center;gap:4px"':'')+'>'+(sinSaldo?(btnIcon('alertTriangle',10)+'SIN SALDO DISPONIBLE'):valueLbl)+'</div>'
      +'<div class="qcard-disp-val"'+valStyle+'><span class="qcard-cur">$</span>'+(val<0?'-':'')+Math.abs(Math.round(val)).toLocaleString('es-CO')+vencIcon+'</div>'
      +sepHtml
      +'<div class="qcard-pago-row"><span class="qcard-dot'+(active?' active':'')+'"></span><span class="qcard-pago-txt" style="color:'+pagoTxtColor+'">Pago '+pago.fecha+'</span><span class="qcard-pago-sub"'+pagoSubStyle+'>'+pago.sub+'</span></div>'
      +'</div>';
  }
  return '<div class="qcards">'+qCard('q1','Q1',rangoQ1,valueQ1,pagoQ1,vencQ1,pagadosQ1)+qCard('q2','Q2',rangoQ2,valueQ2,pagoQ2,vencQ2,pagadosQ2)+'</div>';
}

// Mini-tarjeta compacta de crédito (compartida entre Inicio y la pestaña Tarjeta).
function buildTcMiniHtml(m,tid,onclickAttr,pickerHtml){
  const card=m.tarjetas[tid];
  if(!card) return '';
  const info=card.info||{};
  const saldo=calcTCSaldo(m,tid);
  const cupo=info.cupo;
  const dispTc=cupo?Math.max(cupo-saldo,0):null;
  var fechaPagoTxt='';
  if(info.fechaPago){
    const fp=new Date(info.fechaPago+'T12:00:00');
    fechaPagoTxt=fp.getDate()+' '+MESES_ABBR_MIN[fp.getMonth()];
  }
  var fechaCorteTxt='';
  if(info.fechaCorte){
    const fc=new Date(info.fechaCorte+'T12:00:00');
    fechaCorteTxt=fc.getDate()+' '+MESES_ABBR_MIN[fc.getMonth()];
  }
  var footParts=[];
  if(dispTc!=null) footParts.push('Cupo libre <span style="color:var(--grn)">'+cop(dispTc)+'</span>');
  if(fechaCorteTxt) footParts.push('Corte '+fechaCorteTxt);
  return '<div class="tc-mini"'+(onclickAttr?' onclick="'+onclickAttr+'"':'')+'>'
    +(pickerHtml||'')
    +'<div class="tc-mini-row">'
    +'<div class="tc-mini-chip">'+(info.marca?esc(info.marca.slice(0,4).toUpperCase()):'TC')+'</div>'
    +'<div class="tc-mini-mid">'
    +'<div class="tc-mini-name">'+esc(card.nombre||('Tarjeta '+(info.marca||'')))+'</div>'
    +(fechaPagoTxt?'<div class="tc-mini-due">Paga antes del '+fechaPagoTxt+'</div>':'')
    +'</div>'
    +'<div class="tc-mini-right"><div class="tc-mini-lbl">SALDO</div><div class="tc-mini-val">'+cop(saldo)+'</div></div>'
    +(onclickAttr?'<div class="tc-mini-chev">'+icon('chevronRight',16)+'</div>':'')
    +'</div>'
    +(footParts.length?'<div class="tc-mini-foot">'+footParts.join(' · ')+'</div>':'')
    +'</div>';
}

// Pastillas para elegir qué tarjeta mostrar — compartidas entre Inicio y la pestaña
// Tarjeta (misma variable curTC, así la selección queda sincronizada entre ambas vistas).
// El botón "＋ Nueva" solo se incluye cuando showNew=true (solo en la pestaña Tarjeta).
function buildTcPickerHtml(m,tcIds,activeTid,showNew){
  if(tcIds.length<2 && !showNew) return '';
  const pillsHtml=tcIds.map(function(tid){
    var t=m.tarjetas[tid];
    var active=tid===activeTid;
    var cardSaldo=calcTCSaldo(m,tid);
    return '<button onclick="event.stopPropagation();selectTC(\''+tid+'\')" style="flex-shrink:0;padding:5px 12px;border-radius:20px;border:none;cursor:pointer;font-size:12px;font-weight:600;white-space:nowrap;background:'+(active?'var(--acc)':'var(--surf2)')+';color:'+(active?'#06202B':'var(--mut)')+'">'+esc(t.nombre)+' <span style="opacity:.75">'+cop(cardSaldo)+'</span></button>';
  }).join('');
  const newBtn=showNew?'<button onclick="event.stopPropagation();abrirNuevaTarjeta()" style="flex-shrink:0;padding:5px 12px;border-radius:20px;border:1px dashed var(--brd2);background:none;cursor:pointer;font-size:12px;font-weight:600;color:var(--acc)">＋ Nueva</button>':'';
  return '<div style="display:flex;gap:6px;overflow-x:auto;margin-bottom:6px;scrollbar-width:none;-webkit-overflow-scrolling:touch">'+pillsHtml+newBtn+'</div>';
}

// Cuenta cada gasto INDIVIDUAL de una quincena, incluidos los que viven dentro de un grupo (un
// grupo en sí mismo, esGrupo, nunca cuenta — solo sus subgastos) — usado tanto en el badge de
// la tarjeta Q1/Q2 de Inicio como en el encabezado de la lista de gastos (ver renderGastos), así
// ambos coinciden siempre. "sinpagar" (mover a Q2/recordatorio) cuenta como resuelto/pagado.
function calcPagadosIndividualGastos(gastos){
  const subMap={};
  const topGastosAll=[];
  (gastos||[]).forEach(function(g){
    if(g.parentId){ if(!subMap[g.parentId]) subMap[g.parentId]=[]; subMap[g.parentId].push(g); }
    else topGastosAll.push(g);
  });
  function contarPagados(list){
    return list.filter(function(x){ return x.sinpagar||x.pagado_flag; }).length;
  }
  const total=topGastosAll.reduce(function(a,x){
    return a+(x.esGrupo?(subMap[x.id]||[]).length:1);
  },0);
  const pagados=topGastosAll.reduce(function(a,x){
    return a+(x.esGrupo?contarPagados(subMap[x.id]||[]):(x.sinpagar||x.pagado_flag?1:0));
  },0);
  return {pagados:pagados, total:total};
}
function renderInicio(m){
  const cQ1=calcPagadosIndividualGastos(m.q1_gastos), cQ2=calcPagadosIndividualGastos(m.q2_gastos);
  const qcardsHtml=buildQCardsHtml(m,homeQ,'selectHomeQ','DISPONIBLE',calcDisponibleQuincena(m,'q1'),calcDisponibleQuincena(m,'q2'),calcVencidosQuincena(m,'q1'),calcVencidosQuincena(m,'q2'),cQ1,cQ2);

  // Tarjeta de crédito (reutiliza los mismos datos de la pestaña Tarjeta y la selección
  // actual de tarjeta, curTC, para mostrar la misma que se eligió ahí o desde el picker).
  // Solo tarjetas REALES (ver tcEsPlaceholder, tarjeta.js) — si el usuario nunca creó
  // ninguna, no tiene sentido mostrar el panel con el "tc1" vacío que migrateMonth crea
  // por defecto en todo mes nuevo.
  const tcIds=listTCIdsReales(m);
  const homeTid=(curTC&&tcIds.indexOf(curTC)>=0)?curTC:tcIds[0];
  const tcHtml=tcIds.length?buildTcMiniHtml(m,homeTid,'sw(2)',buildTcPickerHtml(m,tcIds,homeTid,false)):'';

  const list=homeQ==='q1'?(m.q1_gastos||[]):(m.q2_gastos||[]);
  const listHtml=renderGastos(list,homeQ);

  return '<div class="home-view">'+qcardsHtml+tcHtml+listHtml+'</div>';
}

