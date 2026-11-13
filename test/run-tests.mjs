// Runner automatizado con node:test (sin dependencias nuevas — nada de npm install). Corre
// contra el app.js REAL (vía sandbox.mjs), no una copia pegada aparte, así nunca se desactualiza
// en silencio como pasaba con la vieja suite embebida en tests.html.
//
// Uso: node test/run-tests.mjs   (o "npm test" si se corre desde la raíz del proyecto)
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadApp } from './sandbox.mjs';

// Cada test arranca desde un sandbox recién cargado (app.js completo re-ejecutado) — barato
// (milisegundos) y evita que un test que muta `creditos`/`db` (ej. sincronizarCreditoDesdeGasto)
// deje residuos que afecten al siguiente test.
//
// db/creditos/catTipos/catMetodos son `let` de nivel superior en app.js — no propiedades del
// objeto global (igual que en un navegador real) — así que se leen/escriben SIEMPRE a través de
// ctx.__internals (ver sandbox.mjs), nunca asignando ctx.db=... directamente (eso crearía una
// propiedad suelta sin ninguna relación con lo que usan las funciones de adentro).
function freshApp(){
  const ctx = loadApp();
  ctx.__internals.db = structuredClone(ctx.__internals.INIT); // Ene-Jun 2026, básico 5,000,000 — mismos datos de ejemplo que usaba tests.html
  return ctx;
}

// ── calcCuotaPMT ──────────────────────────────────────────────────────────────
test('calcCuotaPMT: tasa 0% reparte en partes iguales', () => {
  const { calcCuotaPMT } = freshApp();
  assert.equal(calcCuotaPMT(1200000, 0, 12), 100000);
});
test('calcCuotaPMT: P=1,000,000 i=2% n=12', () => {
  const { calcCuotaPMT } = freshApp();
  assert.ok(Math.abs(calcCuotaPMT(1000000, 0.02, 12) - 94559.60) <= 0.5);
});
test('calcCuotaPMT: P=5,000,000 i=1.5% n=24', () => {
  const { calcCuotaPMT } = freshApp();
  assert.ok(Math.abs(calcCuotaPMT(5000000, 0.015, 24) - 249620.51) <= 0.5);
});

// ── calcAmortizacion ────────────────────────────────────────────────────────
test('calcAmortizacion: integridad de la tabla completa', () => {
  const { calcAmortizacion } = freshApp();
  const cred = { valorPrestamo: 1000000, pctAval: 2, cuotas: 12, tasa: 2, fechaInicio: '2026-01-15', frecuencia: 'mensual' };
  const amort = calcAmortizacion(cred);
  const sumaCapital = amort.rows.reduce((a, r) => a + r.capital, 0);
  assert.ok(Math.abs(amort.total - sumaCapital) < 2, 'suma de capital == total financiado');
  assert.equal(amort.rows[amort.rows.length - 1].saldo, 0, 'saldo final en 0');
  assert.equal(amort.rows.length, 12, 'una fila por cuota');
});

// ── generarFechasCredito ────────────────────────────────────────────────────
// Comparación por .join(',') en vez de deepEqual: los arrays que devuelve app.js viven en el
// Realm del sandbox de vm, con su propio Array.prototype — assert/strict compara identidad de
// constructor además de estructura, así que un deepEqual entre un array "de acá" y uno "de
// allá" falla aunque el contenido sea idéntico. .join(',') evita el problema de raíz.
test('generarFechasCredito: mensual desde 15-ene, 3 cuotas', () => {
  const { generarFechasCredito } = freshApp();
  assert.equal(generarFechasCredito('2026-01-15', 3, 'mensual').join(','), '2026-01-15,2026-02-15,2026-03-15');
});
test('generarFechasCredito: quincenal desde 05-ene, 3 cuotas', () => {
  const { generarFechasCredito } = freshApp();
  assert.equal(generarFechasCredito('2026-01-05', 3, 'quincenal').join(','), '2026-01-05,2026-01-31,2026-02-15');
});

// ── diasQ2 ──────────────────────────────────────────────────────────────────
test('diasQ2: enero 2026 (31 días) -> 16', () => {
  const { diasQ2 } = freshApp();
  assert.equal(diasQ2(2026, 0), 16);
});
test('diasQ2: febrero 2026 no bisiesto (28 días) -> 13', () => {
  const { diasQ2 } = freshApp();
  assert.equal(diasQ2(2026, 1), 13);
});
test('diasQ2: abril 2026 (30 días) -> 15', () => {
  const { diasQ2 } = freshApp();
  assert.equal(diasQ2(2026, 3), 15);
});

// ── básicoQ1 / básicoQ2 ─────────────────────────────────────────────────────
test('basicoQ1/basicoQ2: enero, básico total 5,000,000', () => {
  const { basicoQ1, basicoQ2 } = freshApp();
  const mEnero = { nombre: 'Enero', año: 2026, nomina: { basico_total: 5000000 } };
  assert.equal(basicoQ1(mEnero), 2500000);
  assert.equal(basicoQ2(mEnero), 2666667);
});

// ── calcNeto ────────────────────────────────────────────────────────────────
test('calcNeto: base 1,000,000 - 4% salud + 50,000 bono', () => {
  const { calcNeto } = freshApp();
  const neto = calcNeto(1000000, [{ nombre: 'Salud', porcentaje: 0.04 }, { nombre: 'Bono', valor_fijo: 50000, tipo: 'suma' }]);
  assert.equal(neto, 1010000);
});

// ── getPago (ajuste por fin de semana / festivo) ────────────────────────────
test('getPago: enero 2026 sin ajuste', () => {
  const { getPago } = freshApp();
  const p = getPago(2026, 0);
  assert.equal(p.q1.toISOString().slice(0, 10), '2026-01-15');
  assert.equal(p.q2.toISOString().slice(0, 10), '2026-01-30');
});
test('getPago: febrero 2026, 15 cae domingo -> ajusta a 13 (viernes)', () => {
  const { getPago } = freshApp();
  assert.equal(getPago(2026, 1).q1.toISOString().slice(0, 10), '2026-02-13');
});
test('getPago: junio 2026, 15 es festivo -> ajusta a 12', () => {
  const { getPago } = freshApp();
  assert.equal(getPago(2026, 5).q1.toISOString().slice(0, 10), '2026-06-12');
});

// ── calcPrimaMes ────────────────────────────────────────────────────────────
test('calcPrimaMes: junio paga 6 meses x (5,000,000 x 30/360)', () => {
  const ctx = freshApp();
  assert.equal(ctx.calcPrimaMes(ctx.__internals.db[5]), 2500000);
});
test('calcPrimaMes: enero no genera prima', () => {
  const ctx = freshApp();
  assert.equal(ctx.calcPrimaMes(ctx.__internals.db[0]), 0);
});

// ── migrateMonth ────────────────────────────────────────────────────────────
test('migrateMonth: repara un mes viejo/incompleto', () => {
  const { migrateMonth } = freshApp();
  const migrado = migrateMonth({ nombre: 'Prueba', año: 2026 });
  assert.equal(typeof migrado.nomina, 'object');
  assert.equal(migrado.nomina.basico_total, 0);
  assert.ok(migrado.tarjetas && migrado.tarjetas.tc1, 'crea al menos una tarjeta por defecto');
  assert.ok(Array.isArray(migrado.q1_gastos) && Array.isArray(migrado.q2_gastos));
});

// ── cop / esc / nombreGasto ─────────────────────────────────────────────────
test('cop: formatea con separador de miles es-CO', () => {
  const { cop } = freshApp();
  assert.equal(cop(1234567), '$1.234.567');
  assert.equal(cop(null), '$0');
});
test('esc: escapa HTML del texto de usuario', () => {
  const { esc } = freshApp();
  assert.equal(esc('<script>'), '&lt;script&gt;');
});
test('nombreGasto: un gasto vinculado a catálogo muestra el nombre ACTUAL del catálogo', () => {
  const ctx = freshApp();
  ctx.__internals.catTipos = [{ id: 'catX', nombre: 'Arriendo actualizado' }];
  assert.equal(ctx.nombreGasto({ nombre: 'Arriendo viejo', catTipoId: 'catX' }), 'Arriendo actualizado');
  assert.equal(ctx.nombreGasto({ nombre: 'Gasto libre' }), 'Gasto libre');
});

// ── validarEsquemaDb (import de backups) ────────────────────────────────────
test('validarEsquemaDb: acepta un db válido', () => {
  const ctx = freshApp();
  assert.equal(ctx.validarEsquemaDb(ctx.__internals.INIT), null);
});
test('validarEsquemaDb: rechaza un db vacío', () => {
  const { validarEsquemaDb } = freshApp();
  assert.match(validarEsquemaDb({}), /ningún mes/);
});
test('validarEsquemaDb: rechaza un mes sin nombre', () => {
  const { validarEsquemaDb } = freshApp();
  assert.match(validarEsquemaDb({ 0: { año: 2026 } }), /nombre válido/);
});
test('validarEsquemaDb: rechaza q1_gastos corrupto (no es lista)', () => {
  const { validarEsquemaDb } = freshApp();
  assert.match(validarEsquemaDb({ 0: { nombre: 'Enero', q1_gastos: 'no soy una lista' } }), /q1_gastos.*corrupto/);
});
test('validarEsquemaDb: rechaza un mes que no es objeto', () => {
  const { validarEsquemaDb } = freshApp();
  assert.match(validarEsquemaDb({ 0: 'no soy un mes' }), /formato válido/);
});

// ── gastoEstado / setGastoEstado (campo único pagado|sinpagar|null) ─────────
test('setGastoEstado + gastoEstado: guarda y lee el mismo valor (round-trip)', () => {
  const { setGastoEstado, gastoEstado } = freshApp();
  const g = {};
  setGastoEstado(g, 'pagado');
  assert.equal(gastoEstado(g), 'pagado');
  assert.equal(g.pagado_flag, true);
  assert.equal(g.sinpagar, false);

  setGastoEstado(g, 'sinpagar');
  assert.equal(gastoEstado(g), 'sinpagar');
  assert.equal(g.pagado_flag, false);
  assert.equal(g.sinpagar, true);

  setGastoEstado(g, null);
  assert.equal(gastoEstado(g), null);
  assert.equal(g.pagado_flag, false);
  assert.equal(g.sinpagar, false);
});
test('gastoEstado: sin campo `estado` (dato legacy), cae a los flags viejos', () => {
  const { gastoEstado } = freshApp();
  assert.equal(gastoEstado({ pagado_flag: true, sinpagar: false }), 'pagado');
  assert.equal(gastoEstado({ pagado_flag: false, sinpagar: true }), 'sinpagar');
  assert.equal(gastoEstado({ pagado_flag: false, sinpagar: false }), null);
  // Estado imposible (ambos true, ya no se puede producir desde la UI) — gana pagado.
  assert.equal(gastoEstado({ pagado_flag: true, sinpagar: true }), 'pagado');
});

// ── migrarEstadoGastos (migración única e idempotente pagado_flag/sinpagar -> estado) ──
test('migrarEstadoGastos: asigna estado a gastos legacy sin tocar los ya migrados', () => {
  const ctx = freshApp();
  const legacyPagado = { pagado_flag: true, sinpagar: false };
  const legacySinPagar = { pagado_flag: false, sinpagar: true };
  const legacyNinguno = { pagado_flag: false, sinpagar: false };
  const legacyAmbos = { pagado_flag: true, sinpagar: true };
  const yaMigrado = { estado: 'sinpagar', pagado_flag: true, sinpagar: false }; // inconsistente a propósito
  ctx.__internals.db = { 0: { nombre: 'Enero', q1_gastos: [legacyPagado, legacySinPagar, legacyNinguno, legacyAmbos, yaMigrado], q2_gastos: [] } };
  ctx.migrarEstadoGastos();
  assert.equal(legacyPagado.estado, 'pagado');
  assert.equal(legacySinPagar.estado, 'sinpagar');
  assert.equal(legacyNinguno.estado, null);
  assert.equal(legacyAmbos.estado, 'pagado', 'estado imposible legacy resuelve a pagado');
  assert.equal(yaMigrado.estado, 'sinpagar', 'uno que YA tenía estado no se vuelve a tocar (idempotente)');
});

// ── sincronizarCreditoDesdeGasto (el punto más delicado: mantiene cr.pagos/pagoDetalle
// sincronizados con el estado del gasto, y bloquea pagar fuera de orden) ─────────────────
test('sincronizarCreditoDesdeGasto: gasto sin creditoId no hace nada y devuelve true', () => {
  const ctx = freshApp();
  const gasto = { pagado_flag: true };
  assert.equal(ctx.sincronizarCreditoDesdeGasto(gasto, null), true);
});
test('sincronizarCreditoDesdeGasto: marcar pagada la primera cuota sincroniza el crédito', () => {
  const ctx = freshApp();
  ctx.__internals.creditos.cr1 = { id: 'cr1', valorPrestamo: 1200000, cuotas: 12, tasa: 0, fechaInicio: '2026-01-15', frecuencia: 'mensual', pagos: [] };
  const gasto = { creditoId: 'cr1', numCuota: 1, pagado_flag: true, presupuesto: 100000 };
  const ok = ctx.sincronizarCreditoDesdeGasto(gasto, null);
  assert.equal(ok, true);
  assert.equal(ctx.__internals.creditos.cr1.pagos[0], true);
  assert.ok(ctx.__internals.creditos.cr1.pagoDetalle[0].montoPagado > 0);
});
test('sincronizarCreditoDesdeGasto: bloquea pagar la cuota 2 si la 1 sigue pendiente', () => {
  const ctx = freshApp();
  ctx.__internals.creditos.cr1 = { id: 'cr1', valorPrestamo: 1200000, cuotas: 12, tasa: 0, fechaInicio: '2026-01-15', frecuencia: 'mensual', pagos: [] };
  const gasto = { creditoId: 'cr1', numCuota: 2, pagado_flag: true, presupuesto: 100000 };
  const ok = ctx.sincronizarCreditoDesdeGasto(gasto, null);
  assert.equal(ok, false, 'debe bloquear el pago fuera de orden');
  assert.equal(gasto.pagado_flag, false, 'revierte el flag del gasto al bloquear');
  assert.equal(ctx.__internals.creditos.cr1.pagos[1], undefined, 'no marca la cuota 2 en el crédito');
});
test('sincronizarCreditoDesdeGasto: desmarcar una cuota pagada limpia cr.pagos y pagoDetalle', () => {
  const ctx = freshApp();
  ctx.__internals.creditos.cr1 = { id: 'cr1', valorPrestamo: 1200000, cuotas: 12, tasa: 0, fechaInicio: '2026-01-15', frecuencia: 'mensual', pagos: [true], pagoDetalle: { 0: { montoPagado: 100000 } } };
  const gasto = { creditoId: 'cr1', numCuota: 1, pagado_flag: false, pagado_real: 100000 };
  const ok = ctx.sincronizarCreditoDesdeGasto(gasto, 'pagado');
  assert.equal(ok, true);
  assert.equal(ctx.__internals.creditos.cr1.pagos[0], false);
  assert.equal(ctx.__internals.creditos.cr1.pagoDetalle[0], undefined);
  assert.equal(gasto.pagado_real, null, 'limpia el valor real pagado al desmarcar');
});

// ── ejecutarRefinanciacion ───────────────────────────────────────────────────
test('ejecutarRefinanciacion: crea credito nuevo con el saldo pendiente y cierra el original', () => {
  const ctx = freshApp();
  ctx.__internals.creditos.cr1 = { id:'cr1', nombre:'Carro', valorPrestamo:12000000, pctAval:0, cuotas:12, tasa:0, fechaInicio:'2026-01-15', frecuencia:'mensual', pagos:[true,true] };
  const nuevoId = ctx.ejecutarRefinanciacion('cr1', { nombre:'Carro (refinanciado)', cuotas:10, tasa:0, fechaInicio:'2026-03-15', frecuencia:'mensual', tcVinculada:null, esMensualidad:false });
  const nuevo = ctx.__internals.creditos[nuevoId];
  assert.ok(nuevo);
  assert.equal(nuevo.valorPrestamo, 10000000);
  assert.equal(nuevo.pctAval, 0);
  assert.equal(nuevo.refinanciaDeId, 'cr1');
  assert.equal(ctx.__internals.creditos.cr1.refinanciado, true);
  assert.equal(ctx.__internals.creditos.cr1.refinanciadoPorId, nuevoId);
  assert.equal(typeof ctx.__internals.creditos.cr1.refinanciadoEn, 'string');
});
test('ejecutarRefinanciacion: desvincula el gasto de una cuota sin pagar, no toca las pagadas', () => {
  const ctx = freshApp();
  ctx.__internals.creditos.cr1 = { id:'cr1', nombre:'Carro', valorPrestamo:12000000, pctAval:0, cuotas:12, tasa:0, fechaInicio:'2026-01-15', frecuencia:'mensual', pagos:[true] };
  ctx.__internals.db[0].q1_gastos.push({ id:'g1', nombre:'Crédito Carro', presupuesto:1000000, creditoId:'cr1', numCuota:1, pagado_flag:true });
  ctx.__internals.db[0].q2_gastos.push({ id:'g2', nombre:'Crédito Carro', presupuesto:1000000, creditoId:'cr1', numCuota:2, pagado_flag:false });
  ctx.ejecutarRefinanciacion('cr1', { nombre:'Carro (refinanciado)', cuotas:10, tasa:0, fechaInicio:'2026-03-15', frecuencia:'mensual', tcVinculada:null, esMensualidad:false });
  assert.equal(ctx.__internals.db[0].q1_gastos.find(function(g){return g.id==='g1';}).creditoId, 'cr1');
  const g2=ctx.__internals.db[0].q2_gastos.find(function(g){return g.id==='g2';});
  assert.equal(g2.creditoId, null);
  assert.equal(g2.numCuota, null);
});
test('ejecutarRefinanciacion: desvincula tambien una deduccion de nomina sin pagar', () => {
  const ctx = freshApp();
  ctx.__internals.creditos.cr1 = { id:'cr1', nombre:'Libranza', valorPrestamo:6000000, pctAval:0, cuotas:12, tasa:0, fechaInicio:'2026-01-15', frecuencia:'mensual', pagos:[] };
  ctx.__internals.db[0].nomina.ded_q1.push({ nombre:'Crédito Libranza', creditoId:'cr1', numCuota:1 });
  ctx.ejecutarRefinanciacion('cr1', { nombre:'Libranza (refinanciada)', cuotas:12, tasa:0, fechaInicio:'2026-02-15', frecuencia:'mensual', tcVinculada:null, esMensualidad:false });
  const d=ctx.__internals.db[0].nomina.ded_q1.find(function(x){return x.nombre==='Crédito Libranza';});
  assert.equal(d.creditoId, null);
});
test('ejecutarRefinanciacion: una cuota diferida (sinpagar) sin registrar en cr.pagos tambien se desvincula', () => {
  const ctx = freshApp();
  ctx.__internals.creditos.cr1 = { id:'cr1', nombre:'Carro', valorPrestamo:12000000, pctAval:0, cuotas:12, tasa:0, fechaInicio:'2026-01-15', frecuencia:'mensual', pagos:[] };
  ctx.__internals.db[0].q1_gastos.push({ id:'g1', nombre:'Crédito Carro', presupuesto:1000000, creditoId:'cr1', numCuota:1, sinpagar:true, pagado_flag:false });
  ctx.ejecutarRefinanciacion('cr1', { nombre:'Carro (refinanciado)', cuotas:12, tasa:0, fechaInicio:'2026-02-15', frecuencia:'mensual', tcVinculada:null, esMensualidad:false });
  assert.equal(ctx.__internals.db[0].q1_gastos.find(function(g){return g.id==='g1';}).creditoId, null);
});
test('ejecutarRefinanciacion: un credito sin saldo pendiente lanza error', () => {
  const ctx = freshApp();
  ctx.__internals.creditos.cr1 = { id:'cr1', nombre:'Carro', valorPrestamo:1000000, pctAval:0, cuotas:1, tasa:0, fechaInicio:'2026-01-15', frecuencia:'mensual', pagos:[true] };
  assert.throws(function(){ ctx.ejecutarRefinanciacion('cr1', { nombre:'x', cuotas:1, tasa:0, fechaInicio:'2026-02-15', frecuencia:'mensual' }); }, /saldo pendiente/);
});
test('ejecutarRefinanciacion: encadenar sobre un credito que ya es resultado de otra refinanciacion funciona', () => {
  const ctx = freshApp();
  ctx.__internals.creditos.cr1 = { id:'cr1', nombre:'Carro v2', valorPrestamo:10000000, pctAval:0, cuotas:10, tasa:0, fechaInicio:'2026-03-15', frecuencia:'mensual', pagos:[], refinanciaDeId:'cr0' };
  const nuevoId = ctx.ejecutarRefinanciacion('cr1', { nombre:'Carro v3', cuotas:8, tasa:0, fechaInicio:'2026-04-15', frecuencia:'mensual', tcVinculada:null, esMensualidad:false });
  assert.equal(ctx.__internals.creditos[nuevoId].refinanciaDeId, 'cr1');
});
test('ejecutarRefinanciacion: respeta la cuota manual tal cual, sin recalcularla', () => {
  const ctx = freshApp();
  ctx.__internals.creditos.cr1 = { id:'cr1', nombre:'Carro', valorPrestamo:12000000, pctAval:0, cuotas:12, tasa:0, fechaInicio:'2026-01-15', frecuencia:'mensual', pagos:[] };
  const nuevoId = ctx.ejecutarRefinanciacion('cr1', { nombre:'Carro (refinanciado)', cuotas:12, tasa:0, fechaInicio:'2026-02-15', frecuencia:'mensual', tcVinculada:null, esMensualidad:false, valorCuotaManual:2000000 });
  assert.equal(ctx.__internals.creditos[nuevoId].valorCuotaManual, 2000000);
});
test('ejecutarRefinanciacion: una cuota manual mayor a la sugerida liquida el credito antes del plazo pactado', () => {
  const ctx = freshApp();
  ctx.__internals.creditos.cr1 = { id:'cr1', nombre:'Carro', valorPrestamo:12000000, pctAval:0, cuotas:12, tasa:0, fechaInicio:'2026-01-15', frecuencia:'mensual', pagos:[] };
  // Saldo 12,000,000 a 12 cuotas sin interés sugiere 1,000,000/cuota — con 2,000,000 debería
  // liquidarse en 6, no en las 12 pactadas.
  const nuevoId = ctx.ejecutarRefinanciacion('cr1', { nombre:'Carro (refinanciado)', cuotas:12, tasa:0, fechaInicio:'2026-02-15', frecuencia:'mensual', tcVinculada:null, esMensualidad:false, valorCuotaManual:2000000 });
  const amort = ctx.calcAmortizacion(ctx.__internals.creditos[nuevoId]);
  assert.equal(amort.rows.length, 6);
});

// ── generarGastosCredito (draft mensual de créditos) ──────────────────────────
test('generarGastosCredito: no genera gasto para un credito refinanciado', () => {
  const ctx = freshApp();
  ctx.__internals.creditos.cr1 = { id:'cr1', nombre:'Carro', valorPrestamo:1200000, pctAval:0, cuotas:12, tasa:0, fechaInicio:'2026-02-15', frecuencia:'mensual', pagos:[], refinanciado:true };
  const nm = ctx.__internals.db[1]; // Febrero 2026
  ctx.generarGastosCredito(nm);
  assert.equal(nm.q1_gastos.length, 0);
  assert.equal(nm.q2_gastos.length, 0);
});

// ── Gastos hormiga (js/hormiga.js) ──────────────────────────────────────────
test('gastos hormiga: se suman por quincena y no afectan el disponible', () => {
  const ctx = freshApp();
  const m = ctx.getM(); ctx.migrateMonth(m);
  const d1 = ctx.calcDisponibleQuincena(m, 'q1'), d2 = ctx.calcDisponibleQuincena(m, 'q2');
  m.hormiga.q1.push({ id: 'a', monto: 5500, nota: 'Café', fecha: '2026-01-03' });
  m.hormiga.q1.push({ id: 'b', monto: 4000, nota: 'cafe', fecha: '2026-01-10' });
  assert.equal(ctx.calcHormigaQuincena(m, 'q1'), 9500);
  assert.equal(ctx.calcDisponibleQuincena(m, 'q1'), d1);
  assert.equal(ctx.calcDisponibleQuincena(m, 'q2'), d2);
  const r = ctx.hormigaResumen(m.hormiga.q1);
  assert.equal(r.conceptos.length, 1, '"Café" y "cafe" se agrupan como el mismo concepto');
});
test('gastos hormiga: el mes nuevo arranca sin registros', () => {
  const ctx = freshApp();
  const db = ctx.__internals.db;
  Object.values(db).forEach(m => ctx.migrateMonth(m));
  const ultimo = db[Math.max(...Object.keys(db).map(Number))];
  ultimo.hormiga.q1.push({ id: 'x', monto: 1000, nota: 'a', fecha: '2026-06-02' });
  const draft = ctx.buildDraftMonth();
  assert.equal(draft.nm.hormiga.q1.length + draft.nm.hormiga.q2.length, 0);
  assert.equal(ultimo.hormiga.q1.length, 1, 'el mes anterior conserva los suyos');
});

// ── Créditos: un abono que salda el crédito quita las cuotas pendientes ──────
test('créditos: abono que salda quita los gastos de cuotas que ya no existen (y vuelven al quitarlo)', async () => {
  const ctx = freshApp();
  const { default: vm } = await import('node:vm');
  vm.runInContext('appUnlocked=true;', ctx);
  ctx.save = () => {}; ctx.render = () => {}; ctx.toast = () => {};
  const db = ctx.__internals.db;
  Object.values(db).forEach(m => ctx.migrateMonth(m));
  const keys = Object.keys(db).map(Number).sort((a, b) => a - b);
  ctx.__internals.creditos = { cr1: { id: 'cr1', nombre: 'Moto', valorPrestamo: 1000000, pctAval: 0, cuotas: 4, tasa: 0, fechaInicio: '2026-01-20', frecuencia: 'mensual', valorCuotaManual: null, pagos: [] } };
  const cr = ctx.__internals.creditos.cr1;
  const gasto = (num, pagado) => ({ id: 'g' + num, nombre: 'Crédito Moto', presupuesto: 250000, creditoId: 'cr1', numCuota: num, pagado_flag: pagado, estado: pagado ? 'pagado' : null });
  keys.slice(0, 4).forEach((k, i) => db[k].q2_gastos.push(gasto(i + 1, i === 0)));
  const vivos = () => keys.flatMap(k => db[k].q2_gastos).filter(g => g.creditoId === 'cr1').map(g => g.numCuota).join(',');
  cr.pagos[0] = true; cr.pagoDetalle = { 0: { montoPagado: 250000 } };
  cr.abonos = [{ id: 'ab', idx: 0, fecha: '2026-01-21', monto: 750000 }];
  ctx.invalidarAmortCache('cr1');
  await new Promise(r => setTimeout(r, 10));
  assert.equal(vivos(), '1', 'solo queda la cuota ya pagada');
  cr.abonos = [];
  ctx.invalidarAmortCache('cr1');
  await new Promise(r => setTimeout(r, 10));
  assert.equal(vivos(), '1,2,3,4', 'al quitar el abono vuelven a su lugar');
});

// ── Festivos de Colombia (calculados para cualquier año) ─────────────────────
test('festivos: 2026 coincide exactamente con la lista oficial que antes estaba fija', () => {
  const { festivosColombia } = freshApp();
  const oficial2026 = ['2026-01-01','2026-01-12','2026-03-23','2026-04-02','2026-04-03','2026-05-01','2026-05-18','2026-06-08','2026-06-15','2026-06-29','2026-07-20','2026-08-07','2026-08-17','2026-10-12','2026-11-02','2026-11-16','2026-12-08','2026-12-25'];
  assert.equal([...festivosColombia(2026)].sort().join(','), oficial2026.join(','));
});
test('festivos: 2027 (Pascua 28-mar, traslados Emiliani)', () => {
  const { festivosColombia } = freshApp();
  const oficial2027 = ['2027-01-01','2027-01-11','2027-03-22','2027-03-25','2027-03-26','2027-05-01','2027-05-10','2027-05-31','2027-06-07','2027-07-05','2027-07-20','2027-08-07','2027-08-16','2027-10-18','2027-11-01','2027-11-15','2027-12-08','2027-12-25'];
  assert.equal([...festivosColombia(2027)].sort().join(','), oficial2027.join(','));
});
test('getPago: noviembre 2027, 15 es festivo (lunes) -> se corre al viernes 12', () => {
  const { getPago } = freshApp();
  assert.equal(getPago(2027, 10).q1.toISOString().slice(0, 10), '2027-11-12');
});

// ── Sin datos personales en el código ───────────────────────────────────────
test('cuota de crédito nueva toma la forma de pago de la cuota anterior (o vacía)', () => {
  const ctx = freshApp();
  const db = ctx.__internals.db;
  assert.equal(ctx.metodoCuotaCredito('cr1'), '');
  db[0].q2_gastos.push({ id: 'a', creditoId: 'cr1', numCuota: 1, metodo: 'Daviplata' });
  db[1].q2_gastos.push({ id: 'b', creditoId: 'cr1', numCuota: 2, metodo: 'Efectivo' });
  assert.equal(ctx.metodoCuotaCredito('cr1'), 'Efectivo');
});

// ── Días de pago configurables (Mi perfil → Días de pago) ───────────────────
test('getPago: días configurables y corrimiento al día hábil siguiente', () => {
  const ctx = freshApp();
  const f = d => d.toISOString().slice(0, 10);
  // Por defecto: igual que siempre (15 / último día / hábil anterior)
  assert.equal(f(ctx.getPago(2026, 5).q1), '2026-06-12');
  // Q1 el 10, Q2 el 25
  ctx.__internals.perfilPago = { diaQ1: 10, diaQ2: 25, ajuste: 'anterior' };
  assert.equal(f(ctx.getPago(2026, 2).q1), '2026-03-10'); // martes
  assert.equal(f(ctx.getPago(2026, 2).q2), '2026-03-25'); // miércoles
  // Junio 15 de 2026 es festivo (lunes): con "siguiente" pasa al martes 16
  ctx.__internals.perfilPago = { diaQ1: 15, diaQ2: 0, ajuste: 'siguiente' };
  assert.equal(f(ctx.getPago(2026, 5).q1), '2026-06-16');
  // Q2 el 31 en un mes de 30 días → último día (30 sep 2026, miércoles)
  ctx.__internals.perfilPago = { diaQ1: 15, diaQ2: 31, ajuste: 'anterior' };
  assert.equal(f(ctx.getPago(2026, 8).q2), '2026-09-30');
  // Datos viejos/inválidos → valores por defecto
  assert.equal(JSON.stringify(ctx.normalizarPerfilPago(undefined)), JSON.stringify({ diaQ1: 15, diaQ2: 0, ajuste: 'anterior' }));
  assert.equal(JSON.stringify(ctx.normalizarPerfilPago({ diaQ1: 40, diaQ2: 3, ajuste: 'x' })), JSON.stringify({ diaQ1: 15, diaQ2: 0, ajuste: 'anterior' }));
});

// ── Ingresos directo al disponible y tipo de ingreso ────────────────────────
test('ingresos: suman directo al disponible y la deducción vieja "Ingresos" se limpia (sin doble conteo)', () => {
  const ctx = freshApp();
  const m = ctx.__internals.db[0];
  m.ingresos = { q1: [{ id: 'i1', nombre: 'Venta', valor: 300000, fecha: '2026-01-05' }], q2: [] };
  // Así quedaba guardado antes: el total también como deducción "Suma" dentro de Nómina
  m.nomina.ded_q1.push({ nombre: 'Ingresos', porcentaje: null, valor_fijo: 300000, tipo: 'suma', esIngresos: true });
  ctx.migrateMonth(m);
  assert.equal(m.nomina.ded_q1.some(d => d.esIngresos), false);
  const neto = ctx.netoQ1(m);
  assert.equal(ctx.calcDisponibleQuincena(m, 'q1'), neto + 300000 - ctx.calcTotalQuincena(m, 'q1'));
});
test('tipo de ingreso: independiente sin nómina, pensionado sin prima', () => {
  const ctx = freshApp();
  const db = ctx.__internals.db;
  Object.values(db).forEach(m => ctx.migrateMonth(m));
  const junio = db[5];
  assert.ok(ctx.calcPrimaMes(junio) > 0, 'empleado: hay prima');
  ctx.__internals.perfilTipoIngreso = 'pensionado';
  assert.equal(ctx.calcPrimaMes(junio), 0);
  assert.ok(ctx.netoQ1(junio) > 0, 'pensionado: sí hay nómina (mesada)');
  ctx.__internals.perfilTipoIngreso = 'independiente';
  assert.equal(ctx.netoQ1(junio), 0);
  junio.ingresos.q1.push({ id: 'x', nombre: 'Proyecto', valor: 2000000, fecha: '2026-06-03' });
  assert.equal(ctx.calcDisponibleQuincena(junio, 'q1'), 2000000 - ctx.calcTotalQuincena(junio, 'q1'));
  assert.equal(ctx.normalizarTipoIngreso('otro'), 'empleado');
});
test('ingresos al crear mes: solo los que se repiten, con la fecha del mes nuevo', () => {
  const ctx = freshApp();
  const db = ctx.__internals.db;
  Object.values(db).forEach(m => ctx.migrateMonth(m));
  const ultimo = db[5]; // Junio
  ultimo.ingresos = {
    q1: [{ id: 'a', nombre: 'Arriendo', valor: 800000, fecha: '2026-06-05', repetir: true },
         { id: 'b', nombre: 'Venta única', valor: 100000, fecha: '2026-06-07', repetir: false }],
    q2: [{ id: 'c', nombre: 'Legado (sin campo)', valor: 50000, fecha: '2026-06-30' }]
  };
  const nm = ctx.buildDraftMonth().nm; // Julio
  assert.equal(nm.ingresos.q1.map(x => x.nombre + '@' + x.fecha).join(','), 'Arriendo@2026-07-05');
  assert.equal(nm.ingresos.q2.map(x => x.nombre + '@' + x.fecha).join(','), 'Legado (sin campo)@2026-07-30');
});
