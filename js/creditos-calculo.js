// ── CRÉDITOS: cálculo (amortización, PMT, congelamientos) ───────────────────
// Fase 2 de la migración a una arquitectura más modular: este archivo es la mitad "pura" de lo
// que antes era creditos.js — solo matemática de amortización, sin abrir ningún modal ni tocar
// el DOM. La mitad de interfaz (modales, listas, botones) vive en creditos-ui.js/
// creditos-abonos.js/creditos-congelar.js. Se dividió así (y no por feature como Abonos/
// Congelar) porque calcAmortizacion() es el corazón que todas las demás partes consultan.
function calcCuotaPMT(valorPrestamo, tasa, cuotas){
  // PMT = P * i / (1 - (1+i)^-n)
  if(tasa<=0) return valorPrestamo/cuotas;
  return valorPrestamo*tasa/(1-Math.pow(1+tasa,-cuotas));
}

// congelamientos: [{idx, periodos}] — "congelar" una cuota (ver openCongelarModal) no agrega
// cuotas nuevas ni cambia cuántas hay, solo empuja su fecha (y la de todas las que siguen)
// `periodos` pasos más adelante de lo normal — un mes extra por periodo si es mensual, una
// quincena extra si es quincenal. idx es el mismo índice 0-based que usan pagos[]/abonos[].
function extraPeriodosEnCuota(congelamientos,idx){
  return (congelamientos||[]).filter(function(c){return c.idx===idx;}).reduce(function(a,c){return a+(c.periodos||0);},0);
}
// Un paso de la alternación quincenal (15 / fin de mes) a partir de una posición (y,m,sigEsFinMes)
// — devuelve la fecha de ESE paso y la posición ya lista para el siguiente. Compartido entre el
// bucle normal y el congelamiento en la cuota 0 (avanzar el ancla misma, ver más abajo), para no
// duplicar la alternación en dos sitios que antes podían desincronizarse.
function siguientePasoQuincena(y,m,sigEsFinMes){
  if(sigEsFinMes){
    var ultimo=new Date(y,m+1,0).getDate();
    var fecha=new Date(y,m,ultimo);
    var m2=m+1, y2=y; if(m2>11){m2=0;y2++;}
    return {fecha:fecha, y:y2, m:m2, sigEsFinMes:false};
  }
  return {fecha:new Date(y,m,15), y:y, m:m, sigEsFinMes:true};
}
function generarFechasCredito(fechaInicioStr, cuotas, frecuencia, congelamientos){
  // frecuencia: 'mensual' o 'quincenal'
  // La fecha de inicio ES la fecha de la primera cuota — salvo que la cuota 0 misma tenga un
  // congelamiento (idx:0): en ese caso el ancla se empuja `periodos` pasos antes de generar nada
  // más, así congelar la primera cuota funciona igual que congelar cualquier otra (antes esto no
  // tenía ningún efecto: el bucle que aplica congelamientos empezaba en k=1, y la cuota 0 siempre
  // quedaba fija en fechaInicioStr tal cual, ignorando silenciosamente el congelamiento).
  const fechas=[];
  const inicio=new Date(fechaInicioStr+'T12:00:00');
  const extra0=extraPeriodosEnCuota(congelamientos,0);
  if(frecuencia==='mensual'){
    var esFinDeMes = inicio.getDate() >= 28 || inicio.getDate()===new Date(inicio.getFullYear(),inicio.getMonth()+1,0).getDate();
    var inicioEfectivo=inicio;
    if(extra0>0){
      var y0=inicio.getFullYear(), m0=inicio.getMonth();
      for(var e0=0;e0<extra0;e0++){ m0++; if(m0>11){m0=0;y0++;} }
      inicioEfectivo = esFinDeMes ? new Date(y0,m0+1,0) : new Date(y0,m0,inicio.getDate());
    }
    fechas.push(inicioEfectivo.toISOString().slice(0,10));
    var cursor=new Date(inicioEfectivo.getFullYear(),inicioEfectivo.getMonth()+1,1);
    for(var k=1;k<cuotas;k++){
      var extra=extraPeriodosEnCuota(congelamientos,k);
      for(var e=0;e<extra;e++){ cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1); }
      if(esFinDeMes){
        var d=new Date(cursor.getFullYear(),cursor.getMonth()+1,0);
        fechas.push(d.toISOString().slice(0,10));
      } else {
        var d2=new Date(cursor.getFullYear(),cursor.getMonth(),inicioEfectivo.getDate());
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
    var fechaInicioEfectiva=fechaInicioStr;
    for(var e0q=0;e0q<extra0;e0q++){
      var pasoInicio=siguientePasoQuincena(y,m,sigEsFinMes);
      fechaInicioEfectiva=pasoInicio.fecha.toISOString().slice(0,10);
      y=pasoInicio.y; m=pasoInicio.m; sigEsFinMes=pasoInicio.sigEsFinMes;
    }
    fechas.push(fechaInicioEfectiva);
    for(var k=1;k<cuotas;k++){
      var extraQ=extraPeriodosEnCuota(congelamientos,k);
      for(var eq=0;eq<extraQ;eq++){
        var pasoSkip=siguientePasoQuincena(y,m,sigEsFinMes);
        y=pasoSkip.y; m=pasoSkip.m; sigEsFinMes=pasoSkip.sigEsFinMes;
      }
      var pasoReal=siguientePasoQuincena(y,m,sigEsFinMes);
      fechas.push(pasoReal.fecha.toISOString().slice(0,10));
      y=pasoReal.y; m=pasoReal.m; sigEsFinMes=pasoReal.sigEsFinMes;
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
  const fechas=generarFechasCredito(cred.fechaInicio,cuotasContrato,cred.frecuencia||'quincenal',cred.congelamientos);

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
