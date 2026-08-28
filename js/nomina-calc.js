// ── Cálculo nómina — bonos SOLO informativos, NO se incluyen en el cálculo ───
// Q1 = basico_total / 2
// Q2 = basico_total / 30 × dias_Q2  (días desde el 16 hasta fin de mes)
// Las deducciones porcentuales se aplican solo sobre el básico quincenal

function diasQ2(año, mesIdx) {
  // Días del mes
  const diasMes = new Date(año, mesIdx + 1, 0).getDate();
  // Febrero bisiesto: diasMes=29 → diasQ2=14; normal: 28 → 13
  // Meses de 30 días → 15; meses de 31 días → 16
  return diasMes - 15;
}

function basicoQ1(m) {
  const n = getNom(m);
  return Math.round((n.basico_total || 0) / 2);
}

function basicoQ2(m) {
  const n = getNom(m);
  const mi = MESES.indexOf(m.nombre);
  const dias = mi >= 0 ? diasQ2(m.año, mi) : 15;
  return Math.round((n.basico_total || 0) / 30 * dias);
}

function calcNeto(bq, deds) {
  const base = bq || 0;
  let ajuste = 0;
  for (const d of (deds||[])) {
    // tipo: 'resta' (default) o 'suma'
    const signo = (d.tipo === 'suma') ? 1 : -1;
    const val = d.porcentaje ? base * d.porcentaje : (d.valor_fijo || 0);
    ajuste += signo * val;
  }
  return base + ajuste;
}
function netoQ1(m) { return calcNeto(basicoQ1(m), getNom(m).ded_q1); }
function netoQ2(m) { return calcNeto(basicoQ2(m), getNom(m).ded_q2); }

// Total de gastos activos (no "sin pagar") de una quincena, consciente de grupos: si el grupo
// tiene base propia (vinculado a tarjeta o monto manual) se usa esa; si no, se suman sus subgastos.
// Compartido entre renderGastos() y calcDisponibleQuincena() para no duplicar esta lógica.
// excludeTarjetaVinculada: en Q1 el SALDO de tarjeta (la "base" sincronizada con calcTCSaldo)
// se muestra solo como información — no debe restar del total ni del disponible ahí, porque el
// abono real solo ocurre en la quincena de pago (Q2). Pero los subgastos que sí se hayan
// agregado manualmente a ese grupo (ej. "Gasolina" pagada con la tarjeta) son gastos reales de
// la quincena y deben seguir contando, así que se ignora solo la base, nunca los subgastos.
//
// Un gasto con presupuesto NEGATIVO es un saldo a favor (reembolso/abono, no una deuda —
// toggleP() ya bloquea marcarlo como pagado) y debe RESTAR del total, no sumarse en valor
// absoluto — de lo contrario un reembolso aumentaría el total de gastos en vez de reducirlo.
function calcTotalGrupoAware(activos, subMap, excludeTarjetaVinculada){
  return activos.reduce(function(a,x){
    if(x.esGrupo){
      var usaBase=!(excludeTarjetaVinculada && x.tcCardId);
      var base=(usaBase && x.presupuesto>0)?x.presupuesto:0;
      if(base>0) return a+base;
      return a+(subMap[x.id]||[]).filter(function(s){return !s.sinpagar;}).reduce(function(b,s){return b+(s.presupuesto||0);},0);
    }
    return a+(x.presupuesto||0);
  },0);
}
// Total de gastos activos de una quincena completa (mismo criterio consciente de grupos que
// calcTotalGrupoAware). Compartido entre el Resumen del mes (Gastos Q1/Q2) y calcDisponibleQuincena.
function calcTotalQuincena(m, which){
  const gastos=which==='q1'?(m.q1_gastos||[]):(m.q2_gastos||[]);
  const subMap={};
  const topGastosAll=[];
  for(const g of gastos){
    if(g.parentId){ if(!subMap[g.parentId]) subMap[g.parentId]=[]; subMap[g.parentId].push(g); }
    else topGastosAll.push(g);
  }
  const activos=topGastosAll.filter(function(x){return !x.sinpagar;});
  return calcTotalGrupoAware(activos, subMap, which==='q1');
}
// Total de ingresos adicionales (aparte de la nómina) registrados en la pestaña Ingresos
// para una quincena dada. El total vive también como UNA sola deducción tipo "Suma" bloqueada
// en ded_q1/ded_q2 (ver syncIngresosDed), agrupando todos los ingresos de esa quincena en un
// único renglón — así ya está incluido en netoQ1()/netoQ2() y no se vuelve a sumar en
// calcDisponibleQuincena (evitaría contarlo dos veces).
function calcIngresosQuincena(m, which){
  const lista=(m.ingresos&&m.ingresos[which])||[];
  return lista.reduce(function(a,x){return a+Math.abs(x.valor||0);},0);
}
// Disponible de una quincena = neto de nómina (ya incluye los ingresos adicionales vía su
// deducción tipo Suma) menos el total de gastos activos.
function calcDisponibleQuincena(m, which){
  const netoQ=which==='q1'?netoQ1(m):netoQ2(m);
  return netoQ-calcTotalQuincena(m,which);
}
// Cuotas de crédito vencidas dentro de una quincena: gastos ligados a un crédito, sin
// marcar como pagados ni "sin pagar" (movidos a la otra quincena), cuya propia fecha de
// amortización ya pasó. Se evalúa por la fecha de CADA cuota, no por si es "la próxima
// pendiente" del crédito según cr.pagos (ese cruce puede desincronizarse y hacía que una
// cuota con fecha futura, ej. 31 de julio, apareciera vencida solo por depender del
// estado de otra cuota del mismo crédito).
function calcVencidosQuincena(m, which){
  const gastos=which==='q1'?(m.q1_gastos||[]):(m.q2_gastos||[]);
  const out=[];
  gastos.forEach(function(g){
    if(!g.creditoId || !creditos[g.creditoId]) return;
    if(g.pagado_flag || g.sinpagar) return;
    var cr=creditos[g.creditoId];
    var rowRef=calcAmortizacion(cr).rows[g.numCuota-1];
    if(!rowRef) return;
    if(diasHasta(rowRef.fecha+'T12:00:00')>=0) return;
    out.push({id:g.id,nombre:g.nombre,valorCuota:rowRef.valorCuota,numCuota:g.numCuota,cuotasTotal:g.cuotas_total||cr.cuotas});
  });
  return out;
}
// Crea, actualiza o elimina la ÚNICA deducción tipo "Suma" en Nómina que agrupa el total de
// todos los ingresos de una quincena (en vez de una deducción por cada ingreso). Se llama
// cada vez que se guarda o borra un ingreso.
function syncIngresosDed(m, which){
  const nom=getNom(m);
  const key=which==='q1'?'ded_q1':'ded_q2';
  const list=nom[key]||(nom[key]=[]);
  const idx=list.findIndex(function(d){return d.esIngresos;});
  const total=calcIngresosQuincena(m,which);
  if(total>0){
    const entry={nombre:'Ingresos',porcentaje:null,valor_fijo:total,tipo:'suma',esIngresos:true};
    if(idx>=0) list[idx]=entry; else list.push(entry);
  } else if(idx>=0){
    list.splice(idx,1);
  }
}

