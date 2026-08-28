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
