// ── Nómina ───────────────────────────────────────────────────────────────────
function syncPrimaDed(m){
  const mi=MESES.indexOf(m.nombre);
  const nom=getNom(m);
  if(!nom.ded_q1) nom.ded_q1=[];
  if(!nom.ded_q2) nom.ded_q2=[];
  const prima=calcPrimaMes(m);

  // Junio: Prima va en Q2. Diciembre: Prima va en Q1. Otros meses: sin prima.
  const dedsQ2SinPrima=nom.ded_q2.filter(function(d){return d.nombre!=='Prima';});
  const dedsQ1SinPrima=nom.ded_q1.filter(function(d){return d.nombre!=='Prima';});

  if(mi===5 && prima>0){
    // Junio: agregar/actualizar Prima en Q2
    nom.ded_q2=dedsQ2SinPrima.concat([{nombre:'Prima',porcentaje:null,valor_fijo:prima,tipo:'suma'}]);
    nom.ded_q1=dedsQ1SinPrima;
  } else if(mi===11 && prima>0){
    // Diciembre: agregar/actualizar Prima en Q1
    nom.ded_q1=dedsQ1SinPrima.concat([{nombre:'Prima',porcentaje:null,valor_fijo:prima,tipo:'suma'}]);
    nom.ded_q2=dedsQ2SinPrima;
  } else {
    // Otro mes: remover Prima si existía
    nom.ded_q1=dedsQ1SinPrima;
    nom.ded_q2=dedsQ2SinPrima;
  }
}

const DOW_FULL=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

// Suma de las deducciones tipo 'resta' de una quincena (mismo criterio que calcNeto,
// pero sin las 'suma' — esas son ingresos ya contados aparte — para poder mostrar
// "Devengado"/"Deducciones" como dos totales que sí cuadran con el neto real.
function sumDeducciones(bq,deds){
  return (deds||[]).filter(function(d){return d.tipo!=='suma';}).reduce(function(a,d){
    return a+(d.porcentaje?bq*d.porcentaje:(d.valor_fijo||0));
  },0);
}

function renderNom(m) {
  const nom=getNom(m);
  syncPrimaDed(m);
  const mi=MESES.indexOf(m.nombre);
  const miSafe=mi>=0?mi:0;
  const bas1=basicoQ1(m), bas2=basicoQ2(m);
  const aux1=auxTransporteQ1(m), aux2=auxTransporteQ2(m);
  const ing1=calcIngresosQuincena(m,'q1'), ing2=calcIngresosQuincena(m,'q2');
  const ded1=sumDeducciones(bas1,nom.ded_q1), ded2=sumDeducciones(bas2,nom.ded_q2);
  const n1=netoQ1(m), n2=netoQ2(m);
  const dev1=bas1+aux1+ing1, dev2=bas2+aux2+ing2;
  const mesDev=dev1+dev2, mesDed=ded1+ded2;
  const diasQ1c=15, diasQ2c=diasQ2(m.año,miSafe);
  const {q1:fechaQ1,q2:fechaQ2}=getPago(m.año,miSafe);

  const which=curNomQ;
  const isQ1=which==='q1';
  const bq=isQ1?bas1:bas2, bonq=isQ1?(nom.bonos_q1||0):(nom.bonos_q2||0), auxq=isQ1?aux1:aux2;
  const ingQ=isQ1?ing1:ing2, dedQ=isQ1?ded1:ded2, devQ=isQ1?dev1:dev2, netoQ=isQ1?n1:n2;
  const diasQ=isQ1?diasQ1c:diasQ2c;
  const deds=(isQ1?nom.ded_q1:nom.ded_q2)||[];
  const lbl=isQ1?'Nómina Q1':'Nómina Q2';
  const fechaQ=isQ1?fechaQ1:fechaQ2;
  const diasPago=diasHasta(fechaQ);

  // Mismo texto y formato que usa el "Pago {fecha}" de las tarjetas Q1/Q2 en Inicio (ver qCard
  // en render.js) — antes acá se mostraba una fecha distinta ("· 30 sep") y una frase propia
  // ("Llega el miércoles 30 · en 13 días") en el hero, dos formatos para lo mismo.
  function pagoInfoNom(dt){
    const d=diasHasta(dt), st=diasStatus(d);
    return {fecha:DOW_ABBR[dt.getDay()]+' '+dt.getDate(), sub:st.txt};
  }
  const pagoQ1=pagoInfoNom(fechaQ1), pagoQ2=pagoInfoNom(fechaQ2);
  const pagoHero=isQ1?pagoQ1:pagoQ2;

  // La barra reemplaza los 3 números sueltos (Devengado/Deducciones/Extras) por una proporción
  // visual de un vistazo — "Extras" (bonos+ingresos) se quitó del resumen del mes porque
  // duplicaba info (los ingresos ya cuentan dentro de "Devengado", y los bonos ya se ven en su
  // propia fila dentro de "Devengados" más abajo). El panel sigue colapsado/expandido con el
  // mismo toggleNomResumen()/nomResumenOpen de siempre.
  const totalBarraMes=mesDev+mesDed;
  const pctDevBarra=totalBarraMes>0?(mesDev/totalBarraMes*100):0;
  const pctDedBarra=totalBarraMes>0?(mesDed/totalBarraMes*100):0;
  const pctDedTextoMes=mesDev>0?Math.round(mesDed/mesDev*100):0;

  const resumenHtml='<div class="nom-resumen">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;cursor:pointer" onclick="toggleNomResumen()">'
    +'<div class="nom-resumen-title">Resumen de '+m.nombre.toLowerCase()+'</div>'
    +'<div style="display:flex;align-items:center;gap:6px">'
    +'<div class="nom-resumen-sub">'+(diasQ1c+diasQ2c)+' días · 2 pagos</div>'
    +'<span id="nom-resumen-chev" style="display:flex;align-items:center;justify-content:center;width:14px;height:14px;flex-shrink:0;color:var(--mut);transform:rotate('+(nomResumenOpen?'180deg':'0deg')+');transition:transform .15s ease">'+icon('chevronDown',13)+'</span>'
    +'</div>'
    +'</div>'
    +'<div id="nom-resumen-body" style="display:'+(nomResumenOpen?'block':'none')+'">'
    +'<div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:8px">'
    +'<div><div class="nom-resumen-lbl">Neto del mes</div>'
    +'<div class="nom-resumen-val"><span class="nom-resumen-cur">$</span>'+Math.round(n1+n2).toLocaleString('es-CO')+'</div></div>'
    +'<div style="text-align:right;font-size:10.5px;font-weight:700;color:var(--mut);line-height:1.6">'
    +'<div>Q1 <span style="color:var(--txt)">'+cop(n1)+'</span></div>'
    +'<div>Q2 <span style="color:var(--txt)">'+cop(n2)+'</span></div>'
    +'</div>'
    +'</div>'
    +'<div class="nom-bar"><div class="nom-bar-dev" style="width:'+pctDevBarra+'%"></div><div class="nom-bar-ded" style="width:'+pctDedBarra+'%"></div></div>'
    +'<div class="nom-legend">'
    +'<span><span class="nom-legend-dot" style="background:var(--grn)"></span>Devengado <b style="color:var(--grn)">'+cop(mesDev)+'</b></span>'
    +'<span><span class="nom-legend-dot" style="background:var(--red)"></span>Deducciones <b style="color:var(--red)">'+cop(mesDed)+'</b> · '+pctDedTextoMes+'%</span>'
    +'</div>'
    +'<div class="nom-resumen-edit" onclick="editBasico()">'+btnIcon('edit',12)+'Editar básico y bonos</div>'
    +'</div>'
    +'</div>';

  // Mismos "qcards" de Q1/Q2 que usa Inicio (ver buildQCardsHtml en render.js) — antes esta
  // pestaña tenía su propio diseño de pastillas (nomq-tab), ahora reutiliza el componente
  // completo para que se vean idénticas, solo con "NETO" en vez de "DISPONIBLE".
  const tabsHtml=buildQCardsHtml(m,curNomQ,'selectNomQ','NETO',n1,n2);

  var devRows='<div class="nom-row"><div class="nom-row-info"><div class="nom-row-name">Básico quincenal <span class="nom-row-nota-inline">· '+diasQ+' días</span></div></div><div class="nom-row-val">'+cop(bq)+'</div></div>';
  if(auxq>0){
    devRows+='<div class="nom-row"><div class="nom-row-info"><div class="nom-row-name">Auxilio de transporte <span class="nom-row-nota-inline">· No es base de deducciones</span></div></div><div class="nom-row-val">'+cop(auxq)+'</div></div>';
  }
  if(bonq>0){
    devRows+='<div class="nom-row"><div class="nom-row-info"><div class="nom-row-name">Bonos <span class="nom-row-nota-inline">· no cuenta para el neto</span></div></div><div class="nom-row-val" style="color:var(--mut)">'+cop(bonq)+'</div></div>';
  }
  const ingList=(m.ingresos&&m.ingresos[which])||[];
  devRows+=ingList.map(function(x){
    return '<div class="nom-row" onclick="editIngreso(\''+x.id+'\',\''+which+'\')" style="cursor:pointer"><div class="nom-row-info"><div class="nom-row-name">'+esc(x.nombre)+' <span class="nom-row-nota-inline">· '+fmtD(x.fecha)+'</span></div></div><div class="nom-row-val">'+cop(x.valor)+'</div></div>';
  }).join('');

  var dedRows=deds.map(function(d,i){
    if(d.esIngresos) return null; // el agregado automático de Ingresos ya se lista arriba en "Devengados"
    const esSuma=d.tipo==='suma';
    const val=d.porcentaje?bq*d.porcentaje:(d.valor_fijo||0);
    const base=d.porcentaje?Math.round(d.porcentaje*100)+'%':'Fijo';
    const credBadge=(d.creditoId&&creditos[d.creditoId])?' · Cuota '+d.numCuota+'/'+calcAmortizacion(creditos[d.creditoId]).rows.length:'';
    return '<div class="nom-row" onclick="editDed(event,\''+lbl+'\','+i+')" style="cursor:pointer">'
      +'<div class="nom-row-info"><div class="nom-row-name">'+esc(d.nombre)+' <span class="nom-row-badge">'+base+credBadge+'</span></div></div>'
      +'<div class="nom-row-val">'+(esSuma?'+':'-')+cop(val)+'</div>'
      +'</div>';
  }).filter(Boolean).join('');

  // "Neto a recibir" + Devengados + Deducciones ahora viven en una sola tarjeta (antes eran 3:
  // el mini-hero reutilizado de Tarjeta + un .nom-panel por sección) — separadas por una línea
  // fina en vez de tener cada una su propio borde/margen. "Días" se quitó del hero (ya se ve en
  // el rango de fechas de la tarjeta Q1/Q2 de arriba, no hacía falta repetirlo una 3ra vez).
  const cardHtml='<div class="nom-panel">'
    +'<div class="nom-card-hero">'
    +'<div><div class="nom-card-hero-lbl">Neto a recibir · '+which.toUpperCase()+'</div>'
    +'<div class="nom-card-hero-due" style="color:'+(diasPago<0?'var(--mut)':'var(--acc)')+'">Pago '+pagoHero.fecha+' <span style="color:'+(pagoHero.sub==='pagado'?'var(--red)':'var(--mut)')+'">'+pagoHero.sub+'</span></div>'
    +'</div>'
    +'<div class="nom-card-hero-val"'+(diasPago<0?' style="color:var(--mut)"':'')+'>'+cop(netoQ)+'</div>'
    +'</div>'
    +'<div class="nom-sec-head dev"><span class="nom-sec-title"><span class="nom-legend-dot" style="background:var(--grn)"></span>Devengados</span><span class="nom-sec-val">'+cop(devQ)+'</span></div>'
    +devRows
    +'<div class="nom-sec-head ded"><span class="nom-sec-title"><span class="nom-legend-dot" style="background:var(--red)"></span>Deducciones</span><span class="nom-sec-val">-'+cop(dedQ)+'</span></div>'
    +dedRows
    +'<div class="glist-add nom-add-dashed" onclick="addDed(\''+lbl+'\')">+ Agregar deducción o devengado</div>'
    +'</div>';

  return '<div class="home-view">'+resumenHtml+tabsHtml
    +'<div class="nom-lists">'+cardHtml+'</div>'
    +'</div>';
}
function selectNomQ(q){
  curNomQ=q;
  render();
}
// Colapsa/expande la tarjeta "Resumen de <mes>" al inicio de la pestaña Nómina.
function toggleNomResumen(){
  nomResumenOpen=!nomResumenOpen;
  const body=document.getElementById('nom-resumen-body');
  const chev=document.getElementById('nom-resumen-chev');
  if(body) body.style.display=nomResumenOpen?'block':'none';
  if(chev) chev.style.transform='rotate('+(nomResumenOpen?'180deg':'0deg')+')';
}

