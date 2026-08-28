// ── CRÉDITOS ────────────────────────────────────────────────────────────────
function calcCuotaPMT(valorPrestamo, tasa, cuotas){
  // PMT = P * i / (1 - (1+i)^-n)
  if(tasa<=0) return valorPrestamo/cuotas;
  return valorPrestamo*tasa/(1-Math.pow(1+tasa,-cuotas));
}

function generarFechasCredito(fechaInicioStr, cuotas, frecuencia){
  // frecuencia: 'mensual' o 'quincenal'
  // La fecha de inicio ES la fecha de la primera cuota
  const fechas=[];
  const inicio=new Date(fechaInicioStr+'T12:00:00');
  fechas.push(fechaInicioStr);
  if(frecuencia==='mensual'){
    var esFinDeMes = inicio.getDate() >= 28 || inicio.getDate()===new Date(inicio.getFullYear(),inicio.getMonth()+1,0).getDate();
    var cursor=new Date(inicio.getFullYear(),inicio.getMonth()+1,1);
    for(var k=1;k<cuotas;k++){
      if(esFinDeMes){
        var d=new Date(cursor.getFullYear(),cursor.getMonth()+1,0);
        fechas.push(d.toISOString().slice(0,10));
      } else {
        var d2=new Date(cursor.getFullYear(),cursor.getMonth(),inicio.getDate());
        fechas.push(d2.toISOString().slice(0,10));
      }
      cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);
    }
  } else {
    // Quincenal: la primera cuota es fechaInicio; luego alterna 15 / fin de mes
    var y=inicio.getFullYear(), m=inicio.getMonth();
    var enPrimeraQuincena = inicio.getDate()<15;
    var ultimoDiaInicio=new Date(y,m+1,0).getDate();
    var esFinDeMesInicio = inicio.getDate()>=ultimoDiaInicio;
    // Determinar la siguiente parada después de fechaInicio
    if(enPrimeraQuincena){
      // siguiente es fin de mes de este mismo mes
      var sigEsFinMes=true;
    } else {
      // inicio fue 15 o fin de mes → siguiente es el 15 del próximo mes (si ya pasó fin de mes) o fin de mes si inicio fue justo 15
      if(esFinDeMesInicio){ m++; if(m>11){m=0;y++;} var sigEsFinMes=false; }
      else { var sigEsFinMes=true; } // inicio fue el 15 → siguiente es fin de mes mismo mes
    }
    for(var k=1;k<cuotas;k++){
      if(sigEsFinMes){
        var ultimoDia=new Date(y,m+1,0).getDate();
        fechas.push(new Date(y,m,ultimoDia).toISOString().slice(0,10));
        sigEsFinMes=false;
        m++; if(m>11){m=0;y++;}
      } else {
        fechas.push(new Date(y,m,15).toISOString().slice(0,10));
        sigEsFinMes=true;
      }
    }
  }
  return fechas;
}

// Los gastos ligados a un crédito se nombran/etiquetan como "Mensualidad {nombre}" en vez de
// "Crédito {nombre}" cuando el crédito está marcado como mensualidad (colegio, transporte,
// suscripción...), para que la descripción coincida con lo que realmente es.
function prefijoCredito(cred){ return cred.esMensualidad?'Mensualidad ':'Crédito '; }
function etiquetaCredito(cred){ return cred.esMensualidad?'de la mensualidad':'del crédito'; }

// calcAmortizacion() no depende de cr.pagos/pagoDetalle (esos los usa calcEstadoCredito por
// separado), solo de los campos "de forma" del crédito (valor, tasa, cuotas, fecha,
// frecuencia, plan importado) — esos campos solo cambian en saveEditCredito/deleteCredito, así
// que se puede cachear el resultado por id y evitar recalcular la tabla completa (hasta 36+
// filas) muchas veces dentro del mismo render. invalidarAmortCache() se llama ahí cuando
// cambian esos campos.
const _amortCache=new Map();
function invalidarAmortCache(id){ _amortCache.delete(id); }
function calcAmortizacion(cred){
  if(cred.id && _amortCache.has(cred.id)) return _amortCache.get(cred.id);
  const resultado=calcAmortizacionSinCache(cred);
  if(cred.id) _amortCache.set(cred.id,resultado);
  return resultado;
}
function calcAmortizacionSinCache(cred){
  // Si el crédito trae un plan de pagos IMPORTADO (montos exactos de un banco/entidad), se usa
  // tal cual en vez de recalcularlo con la fórmula PMT interna — así el redondeo, seguro y
  // demás conceptos propios del banco no se desalinean con el cálculo genérico de esta app.
  if(cred.planImportado && cred.planImportado.length){
    const rows=cred.planImportado;
    // "valorCuota" representativo = el monto que más se repite (la mayoría de créditos reales
    // tienen una cuota "de crucero" constante, con la primera/última ligeramente distintas).
    const freq={};
    rows.forEach(function(r){ freq[r.valorCuota]=(freq[r.valorCuota]||0)+1; });
    var modaValor=rows[0].valorCuota, modaCount=0;
    Object.keys(freq).forEach(function(v){ if(freq[v]>modaCount){ modaCount=freq[v]; modaValor=Number(v); } });
    const totalCapital=rows.reduce(function(a,r){return a+(r.capital||0);},0);
    return {cuotaPMT:modaValor, valorCuota:modaValor, aval:0, total:cred.valorPrestamo||totalCapital, rows:rows};
  }
  const valorPrestamo=cred.valorPrestamo||0;
  const aval=Math.round(valorPrestamo*((cred.pctAval||0)/100));
  const total=valorPrestamo+aval;
  const tasa=(cred.tasa||0)/100;
  const cuotasContrato=cred.cuotas||1; // plazo originalmente pactado (tope del bucle)
  const cuotaPMT=calcCuotaPMT(total,tasa,cuotasContrato);
  const valorCuota=cred.valorCuotaManual||Math.round(cuotaPMT);
  const fechas=generarFechasCredito(cred.fechaInicio,cuotasContrato,cred.frecuencia||'quincenal');

  const pagos=cred.pagos||[];
  const detalle=cred.pagoDetalle||{};
  // Abonos a capital (solo "abono manual" — el excedente de pagar una cuota de más ya queda
  // reflejado abajo vía pagoDetalle[k].montoPagado, así que no se duplica aquí).
  const abonosPorIdx={};
  (cred.abonos||[]).forEach(function(ab){ abonosPorIdx[ab.idx]=(abonosPorIdx[ab.idx]||0)+ab.monto; });

  var saldo=total;
  if(abonosPorIdx[-1]){ saldo=Math.round((saldo-abonosPorIdx[-1])*100)/100; if(saldo<0) saldo=0; }
  const rows=[];
  for(var k=0;k<cuotasContrato && saldo>0;k++){
    var interes=Math.round(saldo*tasa*100)/100;
    var pagadaReal=pagos[k] && detalle[k] && detalle[k].montoPagado!=null;
    var cuotaReal, capital;
    if(pagadaReal){
      cuotaReal=detalle[k].montoPagado;
      capital=Math.round((cuotaReal-interes)*100)/100;
    } else {
      // Cierra esta cuota exactamente (en vez de usar el valor fijo de la cuota) si es la
      // última pactada por contrato, O si un abono anterior ya redujo tanto el saldo que la
      // cuota fija alcanzaría a pagar de más — sin esto, una cuota que en realidad liquida el
      // crédito antes de tiempo seguía mostrando el valor fijo completo en vez del remanente real.
      var capitalTeorico=Math.round((valorCuota-interes)*100)/100;
      var esCierre=(k===cuotasContrato-1) || capitalTeorico>=saldo;
      if(esCierre){
        cuotaReal=Math.round((saldo+interes)*100)/100;
        capital=saldo;
      } else {
        cuotaReal=valorCuota;
        capital=capitalTeorico;
      }
    }
    saldo=Math.round((saldo-capital)*100)/100;
    if(saldo<0) saldo=0;
    rows.push({
      numero:k+1, fecha:fechas[k], valorCuota:cuotaReal,
      capital:capital, intereses:interes, saldo:saldo
    });
    if(abonosPorIdx[k]){
      saldo=Math.round((saldo-abonosPorIdx[k])*100)/100;
      if(saldo<0) saldo=0;
      rows[rows.length-1].saldo=saldo;
    }
    if(saldo<=0){ saldo=0; break; } // saldado antes de tiempo: plazo real = rows.length
  }
  return {cuotaPMT:Math.round(cuotaPMT), valorCuota:valorCuota, aval:aval, total:total, rows:rows};
}

// Números de cuota (1-based) de un crédito cuyo gasto vinculado se marcó "sinpagar"
// (checkbox "Mover a Q2"/"Sin pagar (recordatorio)") y que todavía no están realmente
// pagadas (cr.pagos[i] false). Representan cuotas que el usuario YA decidió que no se van
// a pagar en su mes original — se movieron, no se van a "finalizar" ahí — así que cuentan
// para el progreso visual (X de Y, %), aunque el saldo real del crédito solo baja cuando
// de verdad se marcan pagadas (ver calcEstadoCredito).
function contarCuotasDiferidas(cred){
  const pagos=cred.pagos||[];
  const nums=new Set();
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    [mes.q1_gastos||[], mes.q2_gastos||[]].forEach(function(list){
      list.forEach(function(g){
        if(g.creditoId===cred.id && g.sinpagar && g.numCuota && !pagos[g.numCuota-1]){
          nums.add(g.numCuota);
        }
      });
    });
  });
  return nums.size;
}

// Calcula el estado financiero REAL de un crédito: recorre las cuotas en orden y solo
// reduce el saldo con las que están realmente marcadas como pagadas (cr.pagos[i]), usando el
// monto realmente pagado (cr.pagoDetalle[i].montoPagado) cuando se registró uno distinto al
// valor teórico de la cuota. A diferencia de asumir que "pagadas = las primeras N cuotas",
// esto sigue siendo correcto aunque una cuota se haya pagado fuera de orden.
function calcEstadoCredito(cred){
  // El saldo real, los montos pagados y los abonos a capital ya se incorporan dentro de
  // calcAmortizacionSinCache al generar amort.rows — aquí solo se LEE ese resultado (una sola
  // fuente de verdad), en vez de volver a recalcularlo, para no aplicar dos veces un abono.
  const amort=calcAmortizacion(cred);
  const pagos=cred.pagos||[];
  var pagadas=0;
  amort.rows.forEach(function(row,i){ if(pagos[i]) pagadas++; });

  var proximaIdx=amort.rows.findIndex(function(r,i){return !pagos[i];});
  var saldoActual;
  if(proximaIdx===-1) saldoActual=amort.rows.length?amort.rows[amort.rows.length-1].saldo:0;
  else if(proximaIdx===0) saldoActual=amort.total;
  else saldoActual=amort.rows[proximaIdx-1].saldo;

  var pagadasVisual=Math.min(amort.rows.length, pagadas+contarCuotasDiferidas(cred));
  return {amort:amort,pagadas:pagadas,pagadasVisual:pagadasVisual,saldoActual:saldoActual,proximaIdx:proximaIdx};
}

// Fuente única de verdad para "¿hay una cuota anterior sin pagar?" — se basa en cr.pagos[]
// directamente (no en los gastos ya creados), así toggleCuotaPago (detalle del crédito) y
// toggleP/confirmarPago (lista de gastos) aplican EXACTAMENTE la misma regla de orden.
function cuotaAnteriorPendiente(cred,idx){
  const pagos=cred.pagos||[];
  for(var j=0;j<idx;j++){ if(!pagos[j]) return j+1; }
  return null;
}
function avisoCuotaFueraDeOrden(creditoId,numPendiente,numCuotaPagada){
  var detalle=buscarCuotaPendienteAnterior(creditoId,numCuotaPagada);
  var ubicacion=detalle?(' en '+detalle.mesNombre+' '+detalle.año+' · '+detalle.which):'';
  showAlert('No puedes marcar esta cuota como pagada: la cuota '+numPendiente+' de este crédito sigue sin pagar'+ubicacion+'. Las cuotas deben pagarse en orden.',{title:'Cuota anterior pendiente'});
}

// Cuotas de un crédito que YA tienen un gasto o una deducción de nómina asociada, en
// cualquier mes — se usa tanto al sugerir la cuota de un gasto nuevo como al vincular una
// deducción de nómina, para que ninguno de los dos caminos reutilice una cuota que el otro
// ya tomó (antes cada uno solo miraba su propio universo: gastos O deducciones, no ambos).
function cuotasOcupadasCredito(creditoId, excluir){
  const usadas={};
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    (mes.q1_gastos||[]).concat(mes.q2_gastos||[]).forEach(function(g){
      if(g.creditoId===creditoId && g.numCuota) usadas[g.numCuota]=true;
    });
    var nom=mes.nomina;
    if(nom){
      ['ded_q1','ded_q2'].forEach(function(key){
        (nom[key]||[]).forEach(function(d,idx){
          if(excluir && excluir.mes===k && excluir.key===key && excluir.idx===idx) return;
          if(d.creditoId===creditoId && d.numCuota) usadas[d.numCuota]=true;
        });
      });
    }
  });
  return usadas;
}

// Vista de la pestaña Créditos: hero con saldo total + 3 stats (cuotas del mes,
// activos, próximo pago — este último con el mismo pill expandible que ya existía en
// openCreditosMenu), y debajo la lista "Mis créditos" con las tarjetas de siempre
// (anillo de progreso + "Ver detalles del crédito" abre el modal openCreditoDetalle).
function renderCreditos(m){
  const ids=Object.keys(creditos);
  const ringColors=['var(--acc)','var(--pur)','var(--grn)','var(--amb)'];

  if(!ids.length){
    return '<div class="cred-hero"><div class="cred-hero-lbl">Saldo total que debo</div>'
      +'<div class="cred-hero-val"><span class="cred-hero-cur">$</span>0</div></div>'
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

  var heroHtml='<div class="cred-hero">'
    +'<div class="cred-hero-lbl">Saldo total que debo</div>'
    +'<div class="cred-hero-val"><span class="cred-hero-cur">$</span>'+Math.round(saldoTotal).toLocaleString('es-CO')+'</div>'
    +'<div class="cred-hero-stats">'
    +'<div class="cred-hero-stat"><div class="cred-hero-stat-lbl" style="color:var(--red)">Cuotas del mes</div><div class="cred-hero-stat-val" style="color:var(--red)">'+cop(cuotasMes)+'</div></div>'
    +'<div class="glist-div"></div>'
    +'<div class="cred-hero-stat"><div class="cred-hero-stat-lbl">Créditos activos</div><div class="cred-hero-stat-val">'+activosCount+'</div></div>'
    +'<div class="glist-div"></div>'
    +'<div class="cred-hero-stat" style="cursor:pointer" onclick="toggleCredProxPago()"><div class="cred-hero-stat-lbl" style="color:var(--acc)">Próximo pago</div><div class="cred-hero-stat-val" style="color:var(--acc)">'+proximoFmt+'</div>'
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
    return '<div style="background:var(--surf2);border:1px solid var(--brd2);border-radius:var(--r);padding:14px;margin:0 14px 12px">'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">'
      +'<div><div style="font-size:15px;font-weight:700;color:var(--txt)">'+esc(cr.nombre)+mensPill+'</div>'
      +'<div style="font-size:11px;color:var(--mut);margin-top:2px">'+frecLbl+'</div></div>'
      +'<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;padding:3px 9px;border-radius:20px;'+(x.activo?'background:var(--grn-d);color:var(--grn)':'background:var(--brd2);color:var(--mut)')+'">'+(x.activo?'Activo':'Pagado')+'</div>'
      +'</div>'
      +'<div style="display:flex;align-items:center;gap:14px;padding-bottom:10px;border-bottom:1px solid var(--brd)">'
      +'<div style="position:relative;width:80px;height:80px;flex-shrink:0">'
      +'<div style="width:100%;height:100%;border-radius:50%;background:conic-gradient('+x.color+' '+(x.pct*3.6)+'deg,var(--brd) 0deg)"></div>'
      +'<div style="position:absolute;inset:7px;border-radius:50%;background:var(--surf2);display:flex;flex-direction:column;align-items:center;justify-content:center">'
      +'<div style="font-size:16px;font-weight:800;color:var(--txt)">'+x.pct+'%</div>'
      +'<div style="font-size:8px;color:var(--mut)">Completado</div>'
      +'</div></div>'
      +'<div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:8px;min-width:0">'
      +'<div><div style="font-size:9px;color:var(--mut);text-transform:uppercase">Saldo actual</div><div style="font-size:14px;font-weight:700;color:var(--txt)">'+cop(x.saldoActual)+'</div>'
      +'<div style="font-size:9px;color:var(--mut);margin-top:6px">Deuda inicial</div><div style="font-size:12px;color:var(--mut)">'+cop(amort.total)+'</div></div>'
      +'<div><div style="font-size:9px;color:var(--mut);text-transform:uppercase">Próximo pago</div><div style="font-size:14px;font-weight:700;color:'+x.color+'">'+proximaFecha+'</div>'
      +'<div style="font-size:9px;color:var(--mut);margin-top:6px">Valor cuota</div><div style="font-size:12px;color:var(--mut)">'+cop(proximaCuotaVal)+'</div></div>'
      +'</div>'
      +'</div>'
      +'<div style="margin-top:10px">'
      +'<div style="height:4px;background:var(--brd);border-radius:4px;overflow:hidden">'
      +'<div style="height:100%;width:'+x.pct+'%;background:'+x.color+';border-radius:4px"></div></div>'
      +'<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--mut);margin-top:5px">'
      +'<span>'+x.pagadas+' / '+amort.rows.length+' cuotas pagadas</span>'
      +'<span>'+(x.cuotasFaltantes>0?'Faltan '+x.cuotasFaltantes+' cuotas':'Completado')+'</span>'
      +'</div></div>'
      +'<button onclick="creditoDetalleDesdeModal=false;openCreditoDetalle(\''+x.id+'\')" style="width:100%;margin-top:10px;background:var(--surf);border:1px solid var(--brd2);border-radius:var(--r2);padding:9px;font-size:12px;color:var(--txt);cursor:pointer;display:flex;justify-content:space-between;align-items:center">Ver detalles del crédito <span style="color:var(--mut);display:flex">'+icon('chevronRight',15)+'</span></button>'
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
    return '<div style="background:var(--surf2);border:1px solid var(--brd2);border-radius:var(--r);padding:14px;margin-bottom:12px">'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">'
      +'<div><div style="font-size:15px;font-weight:700;color:var(--txt)">'+esc(cr.nombre)+mensPill+'</div>'
      +'<div style="font-size:11px;color:var(--mut);margin-top:2px">'+frecLbl+'</div></div>'
      +'<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;padding:3px 9px;border-radius:20px;'+(x.activo?'background:var(--grn-d);color:var(--grn)':'background:var(--brd2);color:var(--mut)')+'">'+(x.activo?'Activo':'Pagado')+'</div>'
      +'</div>'
      +'<div style="display:flex;align-items:center;gap:14px;padding-bottom:10px;border-bottom:1px solid var(--brd)">'
      +'<div style="position:relative;width:80px;height:80px;flex-shrink:0">'
      +'<div style="width:100%;height:100%;border-radius:50%;background:conic-gradient('+x.color+' '+(x.pct*3.6)+'deg,var(--brd) 0deg)"></div>'
      +'<div style="position:absolute;inset:7px;border-radius:50%;background:var(--surf2);display:flex;flex-direction:column;align-items:center;justify-content:center">'
      +'<div style="font-size:16px;font-weight:800;color:var(--txt)">'+x.pct+'%</div>'
      +'<div style="font-size:8px;color:var(--mut)">Completado</div>'
      +'</div></div>'
      +'<div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:8px;min-width:0">'
      +'<div><div style="font-size:9px;color:var(--mut);text-transform:uppercase">Saldo actual</div><div style="font-size:14px;font-weight:700;color:var(--txt)">'+cop(x.saldoActual)+'</div>'
      +'<div style="font-size:9px;color:var(--mut);margin-top:6px">Deuda inicial</div><div style="font-size:12px;color:var(--mut)">'+cop(amort.total)+'</div></div>'
      +'<div><div style="font-size:9px;color:var(--mut);text-transform:uppercase">Próximo pago</div><div style="font-size:14px;font-weight:700;color:'+x.color+'">'+proximaFecha+'</div>'
      +'<div style="font-size:9px;color:var(--mut);margin-top:6px">Valor cuota</div><div style="font-size:12px;color:var(--mut)">'+cop(proximaCuotaVal)+'</div></div>'
      +'</div>'
      +'</div>'
      +'<div style="margin-top:10px">'
      +'<div style="height:4px;background:var(--brd);border-radius:4px;overflow:hidden">'
      +'<div style="height:100%;width:'+x.pct+'%;background:'+x.color+';border-radius:4px"></div></div>'
      +'<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--mut);margin-top:5px">'
      +'<span>'+x.pagadas+' / '+amort.rows.length+' cuotas pagadas</span>'
      +'<span>'+(x.cuotasFaltantes>0?'Faltan '+x.cuotasFaltantes+' cuotas':'Completado')+'</span>'
      +'</div></div>'
      +'<button onclick="creditoDetalleDesdeModal=true;openCreditoDetalle(\''+x.id+'\')" style="width:100%;margin-top:10px;background:var(--surf);border:1px solid var(--brd2);border-radius:var(--r2);padding:9px;font-size:12px;color:var(--txt);cursor:pointer;display:flex;justify-content:space-between;align-items:center">Ver detalles del crédito <span style="color:var(--mut);display:flex">'+icon('chevronRight',15)+'</span></button>'
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
function tarjetaVinculadaFieldHtml(selectedId){
  const m=getM();
  const ids=listTCIds(m);
  if(!ids.length) return '';
  const opts='<option value="">— Ninguna —</option>'+ids.map(function(tid){
    var t=m.tarjetas[tid];
    return '<option value="'+tid+'"'+(selectedId===tid?' selected':'')+'>'+esc(t.nombre)+'</option>';
  }).join('');
  return '<div class="field"><label>¿Es una compra diferida a cuotas de una tarjeta? (opcional)</label>'
    +'<select id="cr-tc-vinc">'+opts+'</select></div>';
}

function openNewCredito(modo){
  modo = modo==='importar' ? 'importar' : 'manual';
  const pillsHtml='<div class="trow2" style="margin-bottom:14px">'
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

  const hoy=new Date().toISOString().slice(0,10);
  openModal('<div class="mtitle">Nuevo crédito</div>'
    +pillsHtml
    +'<div class="field"><label>Nombre</label><input id="cr-nombre" placeholder="Ej: Crédito electrodomésticos"></div>'
    +'<div class="field"><label>Valor del préstamo</label><input id="cr-valor" type="text" inputmode="numeric" placeholder="Ej: 3.050.000" oninput="maskMoneyInput(this);updateCuotaSugerida()"></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
    +'<div class="field" style="margin:0"><label>% AVAL</label><input id="cr-aval" type="number" step="0.01" placeholder="Ej: 2" oninput="updateCuotaSugerida()"></div>'
    +'<div class="field" style="margin:0"><label>Cuotas</label><input id="cr-cuotas" type="number" placeholder="Ej: 36" oninput="updateCuotaSugerida()"></div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">'
    +'<div class="field" style="margin:0"><label>Tasa de interés %</label><input id="cr-tasa" type="number" step="0.01" placeholder="Ej: 2.0" oninput="updateCuotaSugerida()"></div>'
    +'<div class="field" style="margin:0"><label>Fecha inicio</label><input id="cr-fecha" type="date" value="'+hoy+'"></div>'
    +'</div>'
    +'<div class="field" style="margin-top:12px"><label>Frecuencia de pago</label>'
    +'<select id="cr-frec"><option value="quincenal">Quincenal</option><option value="mensual">Mensual</option></select></div>'
    +'<div class="field"><label>Valor de cuota manual (opcional)</label>'
    +'<input id="cr-cuota-manual" type="text" inputmode="numeric" placeholder="Se sugiere automáticamente" oninput="maskMoneyInput(this)">'
    +'<div id="cr-cuota-sugerida-txt" style="font-size:11px;color:var(--acc);margin-top:4px"></div>'
    +'</div>'
    +'<div class="cbx-row"><input type="checkbox" id="cr-esmens"'+(creditoDesdeGastoCtx?' checked':'')+'>'
    +'<label for="cr-esmens" style="font-size:13px;color:var(--txt)">Es una mensualidad (colegio, transporte, suscripción...)</label></div>'
    +tarjetaVinculadaFieldHtml(null)
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

    return '<div id="cr-row-'+i+'" style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid var(--brd);'+(esProxima?'background:var(--acc-d)':'')+'">'
      +'<div onclick="toggleCuotaPago(\''+id+'\','+i+')" style="width:24px;height:24px;border-radius:50%;border:2px solid '+(pagado?'var(--grn)':'var(--mut)')+';display:flex;align-items:center;justify-content:center;cursor:pointer;background:'+(pagado?'var(--grn)':'transparent')+';flex-shrink:0">'+(pagado?'<span style="color:#fff;display:flex">'+icon('check',13)+'</span>':'<span style="font-size:10px;color:var(--mut)">'+r.numero+'</span>')+'</div>'
      +'<div style="flex:1;min-width:0">'
      +'<div style="font-size:12px;font-weight:600;color:var(--txt)">Cuota '+r.numero+' de '+totalCuotas+'</div>'
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
  const mActual=getM();
  const tcVincNombre=(cr.tcVinculada && mActual.tarjetas && mActual.tarjetas[cr.tcVinculada])?mActual.tarjetas[cr.tcVinculada].nombre:null;
  const tcVincBadge=tcVincNombre?'<div style="font-size:11px;color:var(--mut);margin-bottom:6px">Vinculado a tarjeta: <b style="color:var(--txt)">'+esc(tcVincNombre)+'</b></div>':'';
  var frecLbl=(cr.frecuencia==='mensual')?'Mensual':'Quincenal';
  var mensPill=cr.esMensualidad?'<span style="font-size:9px;font-weight:700;background:var(--pur-d);color:var(--pur);padding:1px 7px;border-radius:10px;margin-left:6px;vertical-align:middle">MENSUALIDAD</span>':'';
  var creditoHeaderHtml='<div style="background:var(--surf2);border:1px solid var(--brd2);border-radius:var(--r);padding:14px;margin-bottom:14px">'
    +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">'
    +'<div><div style="font-size:15px;font-weight:700;color:var(--txt)">'+esc(cr.nombre)+mensPill+'</div>'
    +'<div style="font-size:11px;color:var(--mut);margin-top:2px">'+frecLbl+'</div></div>'
    +'<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;padding:3px 9px;border-radius:20px;'+(activoCr?'background:var(--grn-d);color:var(--grn)':'background:var(--brd2);color:var(--mut)')+'">'+(activoCr?'Activo':'Pagado')+'</div>'
    +'</div>'
    +'<div style="display:flex;align-items:center;gap:14px">'
    +'<div style="position:relative;width:80px;height:80px;flex-shrink:0">'
    +'<div style="width:100%;height:100%;border-radius:50%;background:conic-gradient(var(--acc) '+(pctProgreso*3.6)+'deg,var(--brd) 0deg)"></div>'
    +'<div style="position:absolute;inset:7px;border-radius:50%;background:var(--surf2);display:flex;flex-direction:column;align-items:center;justify-content:center">'
    +'<div style="font-size:16px;font-weight:800;color:var(--txt)">'+pctProgreso+'%</div>'
    +'<div style="font-size:8px;color:var(--mut)">Completado</div>'
    +'</div></div>'
    +'<div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:8px;min-width:0">'
    +'<div><div style="font-size:9px;color:var(--mut);text-transform:uppercase">Saldo actual</div><div style="font-size:14px;font-weight:700;color:var(--txt)">'+cop(saldoActual)+'</div>'
    +'<div style="font-size:9px;color:var(--mut);margin-top:6px">Valor total del crédito</div><div style="font-size:12px;color:var(--mut)">'+cop(amort.total)+'</div></div>'
    +'<div><div style="font-size:9px;color:var(--mut);text-transform:uppercase">'+(activoCr?'Próximo pago':'Cuota')+'</div><div style="font-size:14px;font-weight:700;color:var(--acc)">'+proximaFechaHdr+'</div>'
    +'<div style="font-size:9px;color:var(--mut);margin-top:6px">Cuota del mes</div><div style="font-size:12px;color:var(--mut)">'+cop(proximaCuotaValHdr)+'</div></div>'
    +'</div>'
    +'</div>'
    +'</div>';
  openWindow(tcVincBadge
    +'<div style="display:flex;justify-content:flex-end;gap:14px;margin-bottom:6px">'
    +abonoBtnHtml
    +'<button onclick="editCredito(\''+id+'\')" style="background:none;border:none;color:var(--mut);cursor:pointer;font-size:12px">'+btnIcon('edit',13)+'Editar crédito</button>'
    +'</div>'
    +creditoHeaderHtml
    +'<div style="margin-bottom:10px">'
    +'<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--mut);margin-bottom:4px">'
    +'<span>'+(cuotasPendientes>0?cuotasPendientes+' cuotas pendientes':'Crédito pagado')+'</span>'
    +(cuotasPendientes>0?'<span>Termina '+fechaFinFmt+'</span>':'')
    +'</div>'
    +'<div style="height:6px;background:var(--brd);border-radius:4px;overflow:hidden">'
    +'<div style="height:100%;width:'+pctProgreso+'%;background:var(--acc);border-radius:4px"></div>'
    +'</div>'
    +'</div>'
    +'<div style="display:flex;justify-content:flex-end;margin-bottom:6px">'
    +'<button onclick="toggleOcultarPagadas(\''+id+'\')" style="background:none;border:1px solid var(--brd2);border-radius:20px;padding:4px 10px;font-size:11px;color:var(--mut);cursor:pointer">'
    +(ocultar?'Mostrar pagadas':'Ocultar pagadas')+'</button>'
    +'</div>'
    +'<div id="cr-list" style="max-height:380px;overflow-y:auto;border:1px solid var(--brd);border-radius:var(--r2)">'+rowsHtml+'</div>'
    +'<div class="macts" style="margin-top:14px">'
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
  openModal('<div class="mtitle">Editar crédito</div>'
    +warnPagos
    +'<div class="field"><label>Nombre</label><input id="cr-edit-nombre" value="'+esc(cr.nombre)+'"></div>'
    +'<div class="field"><label>Valor del préstamo</label><input id="cr-edit-valor" type="text" inputmode="numeric" value="'+moneyInputFmt(cr.valorPrestamo)+'" oninput="maskMoneyInput(this)"></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
    +'<div class="field" style="margin:0"><label>% AVAL</label><input id="cr-edit-aval" type="number" step="0.01" value="'+(cr.pctAval||0)+'"></div>'
    +'<div class="field" style="margin:0"><label>Cuotas</label><input id="cr-edit-cuotas" type="number" value="'+cr.cuotas+'"></div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">'
    +'<div class="field" style="margin:0"><label>Tasa de interés %</label><input id="cr-edit-tasa" type="number" step="0.01" value="'+(cr.tasa||0)+'"></div>'
    +'<div class="field" style="margin:0"><label>Fecha inicio</label><input id="cr-edit-fecha" type="date" value="'+cr.fechaInicio+'"></div>'
    +'</div>'
    +'<div class="field" style="margin-top:12px"><label>Frecuencia de pago</label>'
    +'<select id="cr-edit-frec"><option value="quincenal"'+(cr.frecuencia!=='mensual'?' selected':'')+'>Quincenal</option><option value="mensual"'+(cr.frecuencia==='mensual'?' selected':'')+'>Mensual</option></select></div>'
    +'<div class="field"><label>Valor de cuota manual (opcional)</label>'
    +'<input id="cr-edit-cuota-manual" type="text" inputmode="numeric" value="'+(cr.valorCuotaManual?moneyInputFmt(cr.valorCuotaManual):'')+'" placeholder="Se sugiere automáticamente" oninput="maskMoneyInput(this)"></div>'
    +'<div class="cbx-row"><input type="checkbox" id="cr-edit-esmens"'+(cr.esMensualidad?' checked':'')+'>'
    +'<label for="cr-edit-esmens" style="font-size:13px;color:var(--txt)">Es una mensualidad (colegio, transporte, suscripción...)</label></div>'
    +tarjetaVinculadaFieldHtml(cr.tcVinculada||null)
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

// Abono adicional a capital, independiente de pagar una cuota puntual: reduce el saldo y por
// lo tanto el número de cuotas restantes (la cuota fija no cambia), ver calcAmortizacionSinCache.
function openAbonoModal(id){
  const cr=creditos[id]; if(!cr) return;
  if(cr.planImportado && cr.planImportado.length){
    showAlert('Los créditos con plan de pagos importado no admiten abonos a capital.');
    return;
  }
  const estado=calcEstadoCredito(cr);
  if(estado.proximaIdx===-1){ showAlert('Este crédito ya está pagado.'); return; }
  openModal('<div class="mtitle">Abonar a capital</div>'
    +'<p style="font-size:13px;color:var(--mut);margin-bottom:10px">Saldo actual: <b>'+cop(estado.saldoActual)+'</b>. El abono reduce el número de cuotas restantes; el valor de la cuota fija no cambia.</p>'
    +'<div class="field"><label>Monto del abono</label>'
    +'<input id="ab-val" type="text" inputmode="numeric" placeholder="Ej: 500.000" oninput="maskMoneyInput(this)"></div>'
    +'<div class="field"><label>Fecha del abono</label>'
    +'<input id="ab-fecha" type="date" value="'+new Date().toISOString().slice(0,10)+'"></div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openCreditoDetalle(\''+id+'\')">Cancelar</button>'
    +'<button class="bpri" onclick="confirmarAbono(\''+id+'\')">Confirmar abono</button>'
    +'</div>');
}
function confirmarAbono(id){
  const cr=creditos[id]; if(!cr) return;
  const monto=moneyVal('ab-val');
  const fecha=document.getElementById('ab-fecha').value||new Date().toISOString().slice(0,10);
  if(!monto||monto<=0){ showAlert('El monto del abono debe ser mayor a 0'); return; }
  const estado=calcEstadoCredito(cr);
  if(monto>estado.saldoActual){
    showAlert('El abono ('+cop(monto)+') no puede ser mayor al saldo actual del crédito ('+cop(estado.saldoActual)+').');
    return;
  }
  if(!cr.abonos) cr.abonos=[];
  const idxAplicacion=estado.proximaIdx-1; // última cuota ya pagada (-1 si ninguna)
  const abono={id:uid(), idx:idxAplicacion, fecha:fecha, monto:monto};
  try{
    cr.abonos.push(abono);
    invalidarAmortCache(id);
    save();render();openCreditoDetalle(id);
    toast('Abono de '+cop(monto)+' registrado. El plazo del crédito se redujo.');
  }catch(err){
    cr.abonos=cr.abonos.filter(function(ab){return ab.id!==abono.id;});
    invalidarAmortCache(id);
    console.error('Error registrando abono:',err);
    showAlert('No se pudo registrar el abono. Intenta de nuevo.');
  }
}

// abId identifica un abono manual puntual (cr.abonos) a eliminar; abId===null identifica el
// excedente de esa cuota (Caso 1, no vive en cr.abonos sino en cr.pagoDetalle). Cuando una
// cuota tiene varios componentes, esto permite indicar exactamente cuál se quiere devolver.
function confirmarEliminarComponenteAbono(id,idx,abId){
  showConfirm('Se eliminará este abono a capital. El plazo del crédito puede volver a alargarse. ¿Continuar?',function(){
    eliminarComponenteAbono(id,idx,abId);
  });
}
function eliminarComponenteAbono(id,idx,abId){
  const cr=creditos[id]; if(!cr) return;
  if(abId){
    if(cr.abonos) cr.abonos=cr.abonos.filter(function(ab){return ab.id!==abId;});
  } else if(idx>=0 && cr.pagos && cr.pagos[idx] && cr.pagoDetalle && cr.pagoDetalle[idx] && cr.pagoDetalle[idx].montoPagado!=null){
    // Era el excedente de esta cuota: resetea el monto pagado al valor teórico de la cuota fija.
    const amortAntes=calcAmortizacion(cr);
    var teorico=amortAntes.valorCuota;
    if(cr.pagoDetalle[idx].montoPagado-teorico>1){
      cr.pagoDetalle[idx]={montoPagado:teorico};
    }
  }
  invalidarAmortCache(id);
  save();render();openCreditoDetalle(id);
  toast('Abono eliminado');
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

function calcPrimaMes(m){
  // Si el mes actual es Junio o Diciembre, calcula la prima del semestre correspondiente
  const mi=MESES.indexOf(m.nombre);
  if(mi!==5 && mi!==11) return 0; // solo Junio(5) o Diciembre(11)
  const año=m.año;
  const mesesDelAño={};
  const bonosDelAño={};
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    if(mes.año===año){
      var idx=MESES.indexOf(mes.nombre);
      if(idx>=0){
        mesesDelAño[idx]=mes.nomina?mes.nomina.basico_total||0:0;
        bonosDelAño[idx]=mes.nomina?mes.nomina.bonos_total||0:0;
      }
    }
  });
  var ultimoBasico=null;
  var basicoConSugerido={};
  for(var i=0;i<=11;i++){
    if(mesesDelAño[i]!==undefined){ basicoConSugerido[i]=mesesDelAño[i]; ultimoBasico=mesesDelAño[i]; }
    else if(ultimoBasico!==null){ basicoConSugerido[i]=ultimoBasico; }
    else { basicoConSugerido[i]=0; }
  }
  var inicio = mi===5 ? 0 : 6;
  var fin = mi===5 ? 5 : 11;
  var prima=0;
  for(var i=inicio;i<=fin;i++){ prima += (basicoConSugerido[i]*30)/360; }
  return Math.round(prima);
}

// Escapa texto ingresado por el usuario antes de insertarlo como HTML (nombres de
// gastos, tarjetas, créditos, etc.) para evitar que caracteres como < > " rompan el
// marcado o inyecten HTML/JS accidentalmente.
// Resuelve el nombre a mostrar de un gasto: si está vinculado a una plantilla del
// catálogo (catTipoId), siempre usa el nombre ACTUAL de esa plantilla — así ambos
// quedan sincronizados sin depender de coincidencias de texto. Si la plantilla fue
// eliminada, o el gasto es de libre ingreso (sin catTipoId), usa su propio nombre.
function nombreGasto(g){
  if(g && g.catTipoId){
    var t=catTipos.find(function(i){return i.id===g.catTipoId;});
    if(t) return t.nombre;
  }
  return g?g.nombre:'';
}

function esc(s){
  if(s==null) return '';
  return String(s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

// Escapa texto de usuario para insertarlo dentro de un argumento de string simple
// ('...') dentro de un atributo onclick="..." (comillas dobles). No basta con esc():
// el navegador decodifica entidades HTML del atributo ANTES de compilarlo como JS,
// así que una comilla simple codificada como &#39; vuelve a ser ' y rompe el string.
// Por eso la comilla simple se escapa como \' (secuencia de escape JS, no entidad),
// mientras que la comilla doble sí se codifica como entidad para proteger el atributo.
function escJS(s){
  if(s==null) return '';
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;');
}

function cop(v) {
  if (v == null || isNaN(v)) return '$0';
  return '$' + Math.round(Math.abs(v)).toLocaleString('es-CO');
}

