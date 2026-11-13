// ── Cálculo nómina — bonos SOLO informativos, NO se incluyen en el cálculo ───
// Q1 = basico_total / 2
// Q2 = basico_total / 30 × dias_Q2  (días desde el 16 hasta fin de mes)
// Las deducciones porcentuales se aplican solo sobre el básico quincenal

function diasQ2(año, mesIdx) {
  // Editable en Información general (perfilQ2DiasFijos, ver catalogos.js): muchas empresas siempre pagan la
  // quincena 2 como 15 días fijos, sin importar los días reales del mes — a diferencia del
  // cálculo por defecto de acá abajo, que sí varía según el mes (13 a 16 días).
  if(typeof perfilQ2DiasFijos!=='undefined' && perfilQ2DiasFijos) return 15;
  // Días del mes
  const diasMes = new Date(año, mesIdx + 1, 0).getDate();
  // Febrero bisiesto: diasMes=29 → diasQ2=14; normal: 28 → 13
  // Meses de 30 días → 15; meses de 31 días → 16
  return diasMes - 15;
}

function basicoQ1(m) {
  const n = getNom(m);
  // q1NoTrackeada (ver confirmarPrimeraConfiguracion en auth.js): el primer mes real de la app,
  // cuando el usuario indicó que empezaba a usarla ya en la quincena 2 — la Q1 de ese mes pasó
  // sin quedar registrada, así que no tiene sentido mostrarla/contarla como la mitad del básico
  // (nunca se recibió/gastó dentro de la app). Es un caso puntual del primer mes, no algo que
  // deba heredarse a los meses siguientes (buildDraftMonth lo limpia al crear el próximo mes).
  if(n.q1NoTrackeada) return 0;
  return Math.round((n.basico_total || 0) / 2);
}

function basicoQ2(m) {
  const n = getNom(m);
  const mi = MESES.indexOf(m.nombre);
  const dias = mi >= 0 ? diasQ2(m.año, mi) : 15;
  return Math.round((n.basico_total || 0) / 30 * dias);
}

// ── Auxilio de transporte ────────────────────────────────────────────────────
// A diferencia de los bonos (solo informativos), el auxilio de transporte SÍ es dinero real
// que el empleado recibe (cuenta para el neto/devengado) y SÍ afecta la base de prima y
// cesantías (ver calcPrimaMes y sumaCesantias en catalogos.js) — pero, a
// diferencia del básico, NO es base de las deducciones porcentuales de salud/pensión: por
// eso se suma DESPUÉS de calcNeto() (que solo recibe el básico como base), nunca dentro de él.
// Se divide 50/50 entre quincenas (mismo criterio que los bonos, no el de días reales del
// básico) para mantener la misma convención simple ya usada en el resto de la nómina.
function auxTransporteQ1(m) {
  const n = getNom(m);
  if (n.q1NoTrackeada) return 0;
  return Math.round((n.aux_transporte_total || 0) / 2);
}
function auxTransporteQ2(m) {
  const n = getNom(m);
  return Math.round((n.aux_transporte_total || 0) / 2);
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
// ── Tipo de ingreso (Mi perfil → Tipo de ingreso, ver perfilTipoIngreso en state.js) ──
// Independiente: no hay nómina — el neto es 0 y el disponible sale solo de los Ingresos (la
// pestaña Nómina se oculta). Pensionado: hay nómina (la mesada), pero no prima ni cesantías.
const TIPOS_INGRESO=['empleado','pensionado','independiente'];
function normalizarTipoIngreso(t){ return TIPOS_INGRESO.indexOf(t)>=0?t:'empleado'; }
function tieneNomina(){ return typeof perfilTipoIngreso==='undefined' || perfilTipoIngreso!=='independiente'; }
function tienePrestaciones(){ return typeof perfilTipoIngreso==='undefined' || perfilTipoIngreso==='empleado'; }

function netoQ1(m) { if(!tieneNomina()) return 0; return calcNeto(basicoQ1(m), getNom(m).ded_q1) + auxTransporteQ1(m); }
function netoQ2(m) { if(!tieneNomina()) return 0; return calcNeto(basicoQ2(m), getNom(m).ded_q2) + auxTransporteQ2(m); }

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
// para una quincena dada. Se suman DIRECTO al disponible (ver calcDisponibleQuincena) — antes
// se disfrazaban de deducción tipo "Suma" dentro de Nómina para entrar al neto, lo que
// mezclaba el salario con la plata extra y confundía (ver limpiarDedIngresosLegacy).
function calcIngresosQuincena(m, which){
  const lista=(m.ingresos&&m.ingresos[which])||[];
  return lista.reduce(function(a,x){return a+Math.abs(x.valor||0);},0);
}
// Total de gastos hormiga (compras pequeñas sueltas: café, domicilios... ver js/hormiga.js)
// registrados en una quincena. Viven aparte de q1_gastos/q2_gastos (que son los gastos
// PLANEADOS), en m.hormiga.q1/q2.
function calcHormigaQuincena(m, which){
  const lista=(m.hormiga&&m.hormiga[which])||[];
  return lista.reduce(function(a,x){return a+Math.abs(x.monto||0);},0);
}
// Disponible de una quincena = neto de nómina + ingresos adicionales − gastos activos −
// gastos hormiga (plata que sí salió, aunque no esté en la lista de gastos planeados).
function calcDisponibleQuincena(m, which){
  const netoQ=which==='q1'?netoQ1(m):netoQ2(m);
  return netoQ+calcIngresosQuincena(m,which)-calcTotalQuincena(m,which);
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
// Antes, el total de ingresos de cada quincena vivía como una deducción tipo "Suma" bloqueada
// (esIngresos) dentro de Nómina. Ahora los ingresos suman directo al disponible, así que esa
// deducción se quita (migrateMonth la limpia en cada carga; si quedara, se contaría dos veces).
function limpiarDedIngresosLegacy(m){
  const nom=getNom(m);
  ['ded_q1','ded_q2'].forEach(function(key){
    if(Array.isArray(nom[key])) nom[key]=nom[key].filter(function(d){return !d.esIngresos;});
  });
}

// Fase 2 de la migración a una arquitectura más modular: calcPrimaMes vivía antes en
// creditos.js por accidente histórico (no tiene nada que ver con créditos) — se mueve acá, con
// el resto del cálculo de nómina.
function calcPrimaMes(m){
  // Si el mes actual es Junio o Diciembre, calcula la prima del semestre correspondiente
  const mi=MESES.indexOf(m.nombre);
  if(mi!==5 && mi!==11) return 0; // solo Junio(5) o Diciembre(11)
  if(!tienePrestaciones()) return 0; // pensionado o independiente: no hay prima
  const año=m.año;
  const mesesDelAño={};
  const auxDelAño={};
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    if(mes.año===año){
      var idx=MESES.indexOf(mes.nombre);
      if(idx>=0){
        mesesDelAño[idx]=mes.nomina?mes.nomina.basico_total||0:0;
        auxDelAño[idx]=mes.nomina?mes.nomina.aux_transporte_total||0:0;
      }
    }
  });
  var ultimoBasico=null, ultimoAux=null;
  var basicoConSugerido={}, auxConSugerido={};
  for(var i=0;i<=11;i++){
    if(mesesDelAño[i]!==undefined){
      basicoConSugerido[i]=mesesDelAño[i]; ultimoBasico=mesesDelAño[i];
      auxConSugerido[i]=auxDelAño[i]; ultimoAux=auxDelAño[i];
    } else if(ultimoBasico!==null){
      basicoConSugerido[i]=ultimoBasico; auxConSugerido[i]=ultimoAux;
    } else {
      basicoConSugerido[i]=0; auxConSugerido[i]=0;
    }
  }
  var inicio = mi===5 ? 0 : 6;
  var fin = mi===5 ? 5 : 11;
  // El auxilio de transporte SÍ hace base de prima (a diferencia de los bonos, que son solo
  // informativos y nunca entraron en este cálculo) — ver auxTransporteQ1/Q2 más arriba.
  var prima=0;
  for(var i=inicio;i<=fin;i++){ prima += ((basicoConSugerido[i]+auxConSugerido[i])*30)/360; }
  return Math.round(prima);
}

