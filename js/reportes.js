// ── Reportes: balance de una quincena (Descripción / Ingresos / Gastos) ─────────────────────
// Una sola tabla de 3 columnas, tipo libro contable: cada movimiento ocupa una fila con su
// descripción y el monto en la columna que le corresponde (Ingresos o Gastos), en vez de dos
// listas separadas lado a lado. Los grupos de gastos nunca aparecen como una sola línea — se
// muestra cada subgasto por su propio nombre (salvo un grupo "con base propia", como el saldo de
// una tarjeta: ahí no hay un detalle más fino que mostrar sin descuadrar el total, ver abajo).
// Reutiliza exactamente los mismos cálculos que ya usan Nómina/Gastos (netoQ1/netoQ2,
// sumDeducciones, calcTotalGrupoAware) para que los números SIEMPRE coincidan con esas pestañas —
// nunca se recalculan de cero acá.
let repQ='q1';

function openReportes(which){
  repQ=which||homeQ||'q1';
  openModal(reportesHtml());
}
function selectRepQ(q){
  repQ=q;
  openModal(reportesHtml());
}

function reportesHtml(){
  const m=getM();
  const wh=repQ;
  const gastos=(wh==='q1'?m.q1_gastos:m.q2_gastos)||[];
  const nom=getNom(m);
  const bq=wh==='q1'?basicoQ1(m):basicoQ2(m);
  const auxq=wh==='q1'?auxTransporteQ1(m):auxTransporteQ2(m);
  const deds=(wh==='q1'?nom.ded_q1:nom.ded_q2)||[];
  const ingList=(m.ingresos&&m.ingresos[wh])||[];
  const netoQ=wh==='q1'?netoQ1(m):netoQ2(m);
  const dedQ=sumDeducciones(bq,deds);

  // ── Lado Ingresos: desglosado (básico, auxilio, cada ingreso adicional) con las
  // deducciones restadas en una sola línea — la suma de este lado da exactamente netoQ.
  var ingresoRows=[{nombre:'Básico quincenal',val:bq}];
  if(auxq>0) ingresoRows.push({nombre:'Auxilio de transporte',val:auxq});
  ingList.forEach(function(x){ ingresoRows.push({nombre:x.nombre,val:x.valor}); });
  if(dedQ>0) ingresoRows.push({nombre:'Deducciones de nómina',val:-dedQ});

  // ── Gastos: nunca se muestra la fila del grupo en sí — siempre se expande a cada subgasto con
  // su propio nombre, incluidos los grupos "con base propia" (ej. el saldo de una tarjeta,
  // vinculado a tcCardId). Para esos, la base (calcTCSaldo) no siempre coincide con la suma de
  // sus subgastos manuales — el saldo de la tarjeta puede incluir compras que nunca se
  // registraron como un subgasto individual — así que, si sobra algo de la base después de
  // restar los subgastos ya listados, se agrega una línea "{grupo} · otros movimientos" con ese
  // resto, para que la suma de filas de este grupo siga cuadrando exacto con calcTotalGrupoAware
  // (nomina-calc.js), el mismo total que usan Nómina/Gastos.
  const subMap={};
  const topGastosAll=[];
  gastos.forEach(function(g){
    if(g.parentId){ if(!subMap[g.parentId]) subMap[g.parentId]=[]; subMap[g.parentId].push(g); }
    else topGastosAll.push(g);
  });
  const activos=topGastosAll.filter(function(x){return !x.sinpagar;});
  const totalGastos=calcTotalGrupoAware(activos,subMap,wh==='q1');
  var gastoRows=[];
  activos.forEach(function(g){
    if(g.esGrupo){
      var usaBase=!(wh==='q1' && g.tcCardId);
      var base=(usaBase && g.presupuesto>0)?g.presupuesto:0;
      var subs=(subMap[g.id]||[]).filter(function(s){return !s.sinpagar;});
      var sumSubs=0;
      subs.forEach(function(s){
        if(s.presupuesto){ gastoRows.push({nombre:nombreGasto(s),val:s.presupuesto}); sumSubs+=s.presupuesto; }
      });
      if(base>0){
        var resto=Math.round((base-sumSubs)*100)/100;
        if(resto>0) gastoRows.push({nombre:nombreGasto(g)+' · otros movimientos',val:resto});
      }
    } else if(g.presupuesto){
      gastoRows.push({nombre:nombreGasto(g),val:g.presupuesto});
    }
  });

  const saldo=netoQ-totalGastos;
  const saldoColor=saldo>=0?'var(--grn)':'var(--red)';
  const saldoBg=saldo>=0?'var(--grn-d)':'var(--red-d)';

  // Una sola tabla: cada fila trae su descripción y el monto en SOLO una de las dos columnas
  // (la otra queda vacía) — es lo que hace que de un vistazo se vea si una línea es plata que
  // entró o que salió, sin tener que leer dos listas aparte.
  function fila3(nombre,ingVal,gasVal,extraCls){
    var esNegIng=ingVal!=null&&ingVal<0;
    return '<div class="rep-row3'+(extraCls?' '+extraCls:'')+'">'
      +'<div class="rep-row3-desc">'+esc(nombre)+'</div>'
      +'<div class="rep-row3-ing"'+(esNegIng?' style="color:var(--red)"':'')+'>'+(ingVal!=null?((esNegIng?'-':'')+cop(Math.abs(ingVal))):'')+'</div>'
      +'<div class="rep-row3-gas">'+(gasVal!=null?cop(gasVal):'')+'</div>'
      +'</div>';
  }

  var rowsHtml=ingresoRows.map(function(r){ return fila3(r.nombre,r.val,null); }).join('')
    +gastoRows.map(function(r){ return fila3(r.nombre,null,r.val); }).join('');
  if(!ingresoRows.length&&!gastoRows.length){
    rowsHtml='<div class="rep-row3"><div class="rep-row3-desc" style="color:var(--mut)">Sin movimientos</div><div class="rep-row3-ing"></div><div class="rep-row3-gas"></div></div>';
  }
  const headHtml='<div class="rep-row3 rep-row3-head">'
    +'<div class="rep-row3-desc">Descripción</div>'
    +'<div class="rep-row3-ing" style="color:var(--grn)">Ingresos</div>'
    +'<div class="rep-row3-gas" style="color:var(--red)">Gastos</div>'
    +'</div>';
  const totalHtml=fila3('Total',netoQ,totalGastos,'rep-row3-total');

  const mi=MESES.indexOf(m.nombre);
  const rango=wh==='q1'?('1–15 '+MESES_ABBR_MIN[mi>=0?mi:0]):((16)+'–'+new Date(m.año,(mi>=0?mi:0)+1,0).getDate()+' '+MESES_ABBR_MIN[mi>=0?mi:0]);

  return '<div class="mtitle">Balance '+m.nombre.toLowerCase()+'</div>'
    +'<div class="trow2" style="margin-bottom:10px">'
    +'<button class="topt'+(wh==='q1'?' sc':'')+'" onclick="selectRepQ(\'q1\')">Q1</button>'
    +'<button class="topt'+(wh==='q2'?' sa':'')+'" onclick="selectRepQ(\'q2\')">Q2</button>'
    +'</div>'
    +'<div style="text-align:center;font-size:11px;color:var(--mut);font-weight:600;margin:-4px 0 10px">'+rango+'</div>'
    +'<div class="rep-tcard">'
    +headHtml
    +rowsHtml
    +totalHtml
    +'</div>'
    +'<div class="rep-saldo" style="background:'+saldoBg+'">'
    +'<div class="rep-saldo-lbl" style="color:'+saldoColor+'">'+(saldo>=0?'SALDO A FAVOR':'SALDO EN CONTRA')+'</div>'
    +'<div class="rep-saldo-val" style="color:'+saldoColor+'">'+(saldo<0?'-':'')+cop(Math.abs(saldo))+'</div>'
    +'</div>'
    +'<div class="macts" style="margin-top:14px"><button class="bcnl" style="grid-column:1/-1" onclick="closeModal()">Cerrar</button></div>';
}
