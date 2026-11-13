# Refinanciación de créditos — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar una funcionalidad de "Refinanciar crédito" en finanzas-pwa: crea un crédito nuevo con el saldo pendiente del original, dejando ajustar plazo/cuota/tasa con una proyección en vivo (resumen + tabla de plan de pagos) antes de guardar, y cierra el crédito original marcándolo como refinanciado.

**Architecture:** Toda la lógica nueva vive en un archivo nuevo, `js/creditos-refinanciar.js`, cargado junto a los demás archivos de `js/creditos-*`. Sigue el mismo patrón ya establecido en el proyecto: una función "pura" que solo toca `creditos`/`db` (`ejecutarRefinanciacion`, mismo estilo que `sincronizarCreditoDesdeGasto`) separada de las funciones de UI que leen el DOM y la llaman. Se modifican 3 archivos existentes (`js/creditos-calculo.js` para una fórmula nueva, `js/creditos-ui.js` para el botón de entrada y los totales, `js/catalogos.js` para que un crédito refinanciado deje de generar cuotas automáticas) más el registro del archivo nuevo en `index.html`/`tests.html`/`js/manifest.json`/`sw.js`.

**Tech Stack:** Vanilla JS (ES5-style function expressions, sin build step), `node:test` vía `test/run-tests.mjs`/`test/sandbox.mjs` para lógica pura, Playwright (servidor estático local) para verificación visual de UI.

**Spec:** `docs/superpowers/specs/2026-10-20-refinanciacion-creditos-design.md`

## Global Constraints

- Sin build step: JS clásico, cargado por `<script src>` en orden fijo (`js/manifest.json` es la fuente de verdad del orden, espejada en `index.html`, `tests.html` y el array `FILES` de `sw.js`).
- Estilo de código: funciones top-level `function nombre(){}`, callbacks como `function(x){...}` (no arrow functions), `var`/`const`/`let` igual que el resto de `js/creditos-*.js` — seguir el estilo ya usado en esos archivos, no introducir un estilo distinto.
- No reintroducir el sistema "ui-kit" (`ui.row`/`ui.btn`/`ui.card`/etc.) — todo el HTML nuevo usa el mismo patrón de estilos inline que `openNewCredito`/`openCreditoDetalle` ya usan.
- Cada archivo tocado debe pasar `node --check <archivo>`.
- `npm test` debe terminar en verde (32 tests existentes + los que agregue este plan) antes de dar cualquier tarea por terminada.
- El saldo que se refinancia es siempre el saldo pendiente **actual** (`calcEstadoCredito(cr).saldoActual`), nunca un valor editable por el usuario.
- La tasa de interés del crédito nuevo se precarga con la del original y es editable; para créditos con `planImportado` (sin `cr.tasa` real) el campo arranca vacío, no con un valor inventado.
- Los dos modos de ajuste ("por # de cuotas" y "por valor de cuota") son mutuamente excluyentes y ambos usan la misma tasa/saldo.

## Review Focus

- Refinanciar un crédito con `planImportado` (sin `cr.tasa`): el campo tasa debe quedar vacío y el flujo debe completarse igual, no romperse ni mostrar `NaN`.
- Una cuota futura marcada `sinpagar` (diferida, cuenta en el progreso visual pero `cr.pagos[idx]` sigue en `false`) debe desvincularse igual que cualquier otra cuota sin pagar — no debe tratarse como "ya resuelta" por estar diferida.
- En modo "por valor de cuota", una cuota que no alcanza a cubrir el interés de la primera cuota del saldo debe bloquear con un mensaje claro, nunca calcular un número de cuotas infinito o negativo en silencio.
- Un crédito ya refinanciado no debe volver a mostrar el botón "Refinanciar" ni sumar en "Saldo total"/"Créditos activos"; el crédito nuevo sí debe aparecer con sus propios números.
- Refinanciar un crédito que ya es resultado de otra refinanciación (tiene su propio `refinanciaDeId`) debe funcionar sin errores.

---

## Task 1: Fórmula inversa de PMT — `calcCuotasDesdeValor`

**Files:**
- Modify: `js/creditos-calculo.js` (agregar función junto a `calcCuotaPMT`, línea ~11)
- Test: `test/run-tests.mjs` (agregar junto a los tests existentes de `calcCuotaPMT`, línea ~37)

**Interfaces:**
- Produces: `calcCuotasDesdeValor(saldo: number, tasa: number, cuotaDeseada: number) -> number` — número entero de cuotas (redondeado hacia arriba) necesario para amortizar `saldo` a una tasa periódica `tasa` (decimal, ej. `0.02` = 2%) pagando `cuotaDeseada` por período. Si `tasa<=0`, es `Math.ceil(saldo/cuotaDeseada)`. Si `cuotaDeseada` no alcanza a cubrir el interés del primer período (`saldo*tasa >= cuotaDeseada`), devuelve `Infinity` (señal de "imposible", en vez de `NaN`). Usada por Task 3 para el modo "por valor de cuota".

- [ ] **Step 1: Escribir los tests que fallan**

```js
test('calcCuotasDesdeValor: tasa 0% divide exacto', () => {
  const { calcCuotasDesdeValor } = freshApp();
  assert.equal(calcCuotasDesdeValor(1200000, 0, 100000), 12);
});
test('calcCuotasDesdeValor: tasa 0% redondea hacia arriba si no divide exacto', () => {
  const { calcCuotasDesdeValor } = freshApp();
  assert.equal(calcCuotasDesdeValor(1000000, 0, 300000), 4);
});
test('calcCuotasDesdeValor: con tasa, es consistente con calcCuotaPMT (P=5,000,000 i=1.5%)', () => {
  const { calcCuotasDesdeValor } = freshApp();
  // mismo caso que el test ya existente "calcCuotaPMT: P=5,000,000 i=1.5% n=24" (cuota ≈ 249,620.51)
  assert.equal(calcCuotasDesdeValor(5000000, 0.015, 249620.51), 24);
});
test('calcCuotasDesdeValor: cuota que no cubre el interés del primer período devuelve Infinity', () => {
  const { calcCuotasDesdeValor } = freshApp();
  // saldo 1,000,000 al 2% mensual = 20,000 de interés; una cuota de 15,000 nunca amortiza
  assert.equal(calcCuotasDesdeValor(1000000, 0.02, 15000), Infinity);
});
```

- [ ] **Step 2: Correr los tests y verificar que fallan**

Run: `npm test`
Expected: 4 FAIL con "calcCuotasDesdeValor is not a function" (o `undefined`)

- [ ] **Step 3: Implementar `calcCuotasDesdeValor(saldo, tasa, cuotaDeseada)` en `js/creditos-calculo.js`**

Fórmula: si `tasa<=0`, `Math.ceil(saldo/cuotaDeseada)`. Si no, despejar `n` de
`cuotaDeseada = saldo*tasa / (1-(1+tasa)^-n)` → `n = -ln(1 - saldo*tasa/cuotaDeseada) / ln(1+tasa)`,
y devolver `Math.ceil(n)`. Si `1 - saldo*tasa/cuotaDeseada <= 0`, devolver `Infinity` antes de llamar a `Math.log` (evita `NaN`). Agregar el mismo tipo de comentario breve que ya acompaña a `calcCuotaPMT` explicando que es su inversa.

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `npm test`
Expected: PASS (36 tests en total)

- [ ] **Step 5: `node --check js/creditos-calculo.js`**

Expected: sin salida (sintaxis válida)

- [ ] **Step 6: Commit**

```bash
git add js/creditos-calculo.js test/run-tests.mjs
git commit -m "feat: agregar calcCuotasDesdeValor (inversa de PMT) para refinanciacion"
```

---

## Task 2: Lógica central de refinanciación — `ejecutarRefinanciacion`

**Files:**
- Create: `js/creditos-refinanciar.js`
- Test: `test/run-tests.mjs`

**Interfaces:**
- Consumes: `calcEstadoCredito(cred)` y `invalidarAmortCache(id)` (`js/creditos-calculo.js`); `crearGastoDesdeCredito(creditoId, ctx)` (`js/gasto-form.js`, `ctx={which,metodo,parentId}`); `calcQuincenaCuota(fechaDate)` (`js/catalogos.js`, devuelve `{año,mes,which}`); `getM()`, `MESES`, `creditos`, `db` (globales existentes, vía `js/state.js`/`js/core.js`).
- Produces: `ejecutarRefinanciacion(idOriginal: string, params: {nombre, cuotas, tasa, fechaInicio, frecuencia, tcVinculada, esMensualidad}) -> string` (el `id` del crédito nuevo, o lanza `Error` con un mensaje legible si `idOriginal` no existe o no tiene saldo pendiente). Usada por Task 3.

- [ ] **Step 1: Escribir los tests que fallan**

```js
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
  assert.throws(function(){ ctx.ejecutarRefinanciacion('cr1', { nombre:'x', cuotas:1, tasa:0, fechaInicio:'2026-02-15', frecuencia:'mensual' }); });
});
test('ejecutarRefinanciacion: encadenar sobre un credito que ya es resultado de otra refinanciacion funciona', () => {
  const ctx = freshApp();
  ctx.__internals.creditos.cr1 = { id:'cr1', nombre:'Carro v2', valorPrestamo:10000000, pctAval:0, cuotas:10, tasa:0, fechaInicio:'2026-03-15', frecuencia:'mensual', pagos:[], refinanciaDeId:'cr0' };
  const nuevoId = ctx.ejecutarRefinanciacion('cr1', { nombre:'Carro v3', cuotas:8, tasa:0, fechaInicio:'2026-04-15', frecuencia:'mensual', tcVinculada:null, esMensualidad:false });
  assert.equal(ctx.__internals.creditos[nuevoId].refinanciaDeId, 'cr1');
});
```

- [ ] **Step 2: Correr los tests y verificar que fallan**

Run: `npm test`
Expected: FAIL con "ejecutarRefinanciacion is not a function"

- [ ] **Step 3: Crear `js/creditos-refinanciar.js` con `ejecutarRefinanciacion(idOriginal, params)`**

Cuerpo (orden fijado por el diseño, no hay decisión abierta aquí):
1. Leer `creditos[idOriginal]`; si no existe, `throw new Error('Crédito original no encontrado')`.
2. `var saldoActual = calcEstadoCredito(crOriginal).saldoActual;` si `!(saldoActual>0)`, `throw new Error('Este crédito no tiene saldo pendiente para refinanciar')`.
3. Construir `nuevoCredito` con `id:'cr_'+Date.now()`, `valorPrestamo:saldoActual`, `pctAval:0`, `pagos:[]`, `refinanciaDeId:idOriginal`, y el resto de campos tomados de `params` (`nombre`, `cuotas`, `tasa`, `fechaInicio`, `frecuencia`, `tcVinculada`, `esMensualidad`) + `valorCuotaManual:null`. Guardarlo en `creditos[nuevoCredito.id]`.
4. Determinar `which` para la primera cuota: `var bucket=calcQuincenaCuota(new Date()); var mActual=getM(); var which=(bucket.año===mActual.año && MESES.indexOf(mActual.nombre)===bucket.mes) ? bucket.which : 'q1';` (si la fecha real no cae dentro del mes actualmente abierto en la app, usar `'q1'` como default razonable). Llamar `crearGastoDesdeCredito(nuevoCredito.id, {which:which, metodo:null, parentId:null})`.
5. Marcar el original: `crOriginal.refinanciado=true; crOriginal.refinanciadoEn=new Date().toISOString().slice(0,10); crOriginal.refinanciadoPorId=nuevoCredito.id;`.
6. Recorrer `Object.keys(db)`; para cada mes, en `q1_gastos`/`q2_gastos`, si `g.creditoId===idOriginal && g.numCuota && !crOriginal.pagos[g.numCuota-1]`, poner `g.creditoId=null; g.numCuota=null;` (mismo patrón que `deleteCredito`, `js/creditos-ui.js:1121-1141`). Igual para `mes.nomina.ded_q1`/`ded_q2` con `d.creditoId`/`d.numCuota`.
7. `invalidarAmortCache(idOriginal);`
8. `return nuevoCredito.id;`

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `npm test`
Expected: PASS (42 tests en total)

- [ ] **Step 5: `node --check js/creditos-refinanciar.js`**

Expected: sin salida

- [ ] **Step 6: Registrar el archivo nuevo en el orden de carga**

Agregar `"js/creditos-refinanciar.js"` justo después de `"js/creditos-congelar.js"` en: `js/manifest.json` (línea 8), `index.html` (línea 91, como `<script src="js/creditos-refinanciar.js"></script>`), `tests.html` (línea 47, igual), y en el array `FILES` de `sw.js` (línea 8, como `'./js/creditos-refinanciar.js'`, junto a `'./js/creditos-congelar.js'`).

- [ ] **Step 7: Correr `npm test` una vez más para confirmar que el sandbox sigue cargando bien con el archivo registrado en `js/manifest.json`**

Run: `npm test`
Expected: PASS (42 tests)

- [ ] **Step 8: Commit**

```bash
git add js/creditos-refinanciar.js js/manifest.json index.html tests.html sw.js test/run-tests.mjs
git commit -m "feat: agregar ejecutarRefinanciacion (logica central de refinanciacion de creditos)"
```

---

## Task 3: Créditos refinanciados dejan de generar cuotas automáticas

**Files:**
- Modify: `js/catalogos.js:659-702` (`generarGastosCredito`)
- Test: `test/run-tests.mjs`

**Interfaces:**
- Consumes: `creditos[crId].refinanciado` (campo agregado en Task 2).
- No produce nada nuevo para otras tareas — es un fix autocontenido.

- [ ] **Step 1: Escribir el test que falla**

```js
test('generarGastosCredito: no genera gasto para un credito refinanciado', () => {
  const ctx = freshApp();
  ctx.__internals.creditos.cr1 = { id:'cr1', nombre:'Carro', valorPrestamo:1200000, pctAval:0, cuotas:12, tasa:0, fechaInicio:'2026-02-15', frecuencia:'mensual', pagos:[], refinanciado:true };
  const nm = ctx.__internals.db[1]; // Febrero 2026
  ctx.generarGastosCredito(nm);
  assert.equal(nm.q1_gastos.length, 0);
  assert.equal(nm.q2_gastos.length, 0);
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm test`
Expected: FAIL (el gasto sí se genera porque la función todavía no filtra por `refinanciado`)

- [ ] **Step 3: Modificar `generarGastosCredito` en `js/catalogos.js`**

Dentro del `forEach` sobre `Object.keys(creditos)` (línea ~659), agregar al inicio del `try`, junto al `if(creditoManejadoPorNomina(crId)) return;` ya existente (línea 665): `if(creditos[crId].refinanciado) return;`.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npm test`
Expected: PASS (43 tests en total)

- [ ] **Step 5: `node --check js/catalogos.js`**

Expected: sin salida

- [ ] **Step 6: Commit**

```bash
git add js/catalogos.js test/run-tests.mjs
git commit -m "fix: creditos refinanciados dejan de generar cuotas automaticas cada mes"
```

---

## Task 4: Modal "Refinanciar crédito" (UI + proyección en vivo)

**Files:**
- Modify: `js/creditos-refinanciar.js` (agregar todo lo de UI al archivo creado en Task 2)
- Modify: `js/creditos-ui.js:826-831` (botón "Refinanciar" en `openCreditoDetalle`)

**Interfaces:**
- Consumes: `ejecutarRefinanciacion` (Task 2), `calcCuotasDesdeValor`/`calcCuotaPMT`/`calcAmortizacion`/`calcEstadoCredito` (`js/creditos-calculo.js`), `frecuenciaFieldHtml(selectId,frecuenciaActual)` y `tarjetaVinculadaFieldHtml(selectedId)` (`js/creditos-ui.js` — ojo: esta última SIEMPRE genera el campo con `id="cr-tc-vinc"` sin importar el argumento, así que se lee de ese mismo id al guardar), `openModal`/`closeModal`/`showAlert`/`esc`/`cop`/`moneyVal` (ya globales), `save()`/`render()`/`toast()` (ya globales).
- Produces: `abrirRefinanciarCredito(id: string)` (entry point, llamado desde el botón nuevo en `openCreditoDetalle`); el resto de funciones de este archivo (`rfSetModo`, `rfRecalcular`, `confirmarRefinanciarCredito`, `ejecutarYGuardarRefinanciacion`) son privadas al flujo, ninguna otra tarea las consume.

- [ ] **Step 1: Agregar estado de módulo y `abrirRefinanciarCredito(id)` en `js/creditos-refinanciar.js`**

Variables de módulo: `let _rfModo='cuotas';` (o `'cuota'`) y `let _rfPendiente=null;` (para pasar los datos validados del formulario a la confirmación, mismo patrón que `creditoDesdeGastoCtx` en `js/creditos-ui.js`).

`abrirRefinanciarCredito(id)`:
- Lee `var cr=creditos[id]; if(!cr) return;`
- `var saldoActual=calcEstadoCredito(cr).saldoActual;`
- Construye el HTML del modal con `openModal(...)`:
  - Título: `'<div class="mtitle">Refinanciar '+esc(cr.nombre)+'</div>'`
  - Línea fija (no editable): `'<div style="font-size:13px;color:var(--mut);margin-bottom:10px">Saldo a refinanciar: <b style="color:var(--txt)">'+cop(saldoActual)+'</b></div>'`
  - Campo `<input id="rf-nombre" value="'+esc(cr.nombre+' (refinanciado)')+'">`
  - Pills de modo (mismo patrón `.trow2`/`.topt` que `pillsHtml` en `openNewCredito`, `js/creditos-ui.js:356-359`): "Por # de cuotas" (`onclick="rfSetModo('cuotas')"`) / "Por valor de cuota" (`onclick="rfSetModo('cuota')"`).
  - Si `_rfModo==='cuotas'`: input numérico `id="rf-cuotas"` (placeholder `cr.cuotas`) + input dinero `id="rf-cuota-resultado"` `disabled` (solo lectura, se llena en `rfRecalcular`).
  - Si `_rfModo==='cuota'`: input dinero `id="rf-cuota"` (editable, `oninput="maskMoneyInput(this);rfRecalcular('"+id+"')"`) + input numérico `id="rf-cuotas-resultado"` `disabled`.
  - Campo tasa: `<input id="rf-tasa" type="number" step="0.01" value="'+(cr.tasa!=null?cr.tasa:'')+'" oninput="rfRecalcular('"+id+"')">`.
  - Campo fecha: reusar `stdFormDateFieldHtml('rf-fecha','Fecha inicio',hoy)` (mismo patrón que `openNewCredito`).
  - `frecuenciaFieldHtml('rf-frec', cr.frecuencia||'quincenal')`.
  - `tarjetaVinculadaFieldHtml(cr.tcVinculada||null)` (genera `id="cr-tc-vinc"`, ver nota de Interfaces).
  - Contenedor vacío para la proyección+tabla: `'<div id="rf-proyeccion"></div>'`.
  - Botones: `'<div class="macts"><button class="bcnl" onclick="closeModal()">Cancelar</button><button class="bpri" onclick="confirmarRefinanciarCredito(\''+id+'\')">Refinanciar</button></div>'`.
  - Todos los inputs relevantes (`rf-nombre` no afecta la proyección, pero `rf-cuotas`/`rf-cuota`/`rf-tasa`/`rf-fecha`/`rf-frec`) llevan `oninput="rfRecalcular('"+id+"')"` (o `onchange` para `rf-fecha`/`rf-frec`, igual que `updateCuotaSugerida()` en `openNewCredito`).
- Al final, llamar `rfRecalcular(id)` una vez para pintar la proyección inicial.

- [ ] **Step 2: Agregar `rfSetModo(modo)` y `rfRecalcular(id)` en el mismo archivo**

`rfSetModo(modo)`: `_rfModo=modo; abrirRefinanciarCredito(idActualDelModal)` — necesita saber qué crédito está abierto; guardarlo también en una variable de módulo `let _rfCreditoId=null;` que `abrirRefinanciarCredito` fija al entrar, así `rfSetModo` no necesita parámetro `id` adicional y puede llamar `abrirRefinanciarCredito(_rfCreditoId)` directamente. Usar `snapshotModalFields()`/`restoreModalFields(snap)` (`js/format-utils.js`, mismo patrón ya usado en `setQ2DiasFijosEnEditor`, `js/tarjeta.js`) alrededor del re-render para no perder lo que el usuario ya escribió en nombre/tasa/fecha al cambiar de modo.

`rfRecalcular(id)`:
- Lee `cr=creditos[id]`, `saldoActual` (igual que en `abrirRefinanciarCredito`).
- Lee `tasaPct=parseFloat(document.getElementById('rf-tasa').value)||0; var tasa=tasaPct/100;`
- Si `_rfModo==='cuotas'`: `var cuotas=parseInt(document.getElementById('rf-cuotas').value)||0;` si `cuotas>0`, `var cuotaResultado=calcCuotaPMT(saldoActual,tasa,cuotas);` y pintarla en `#rf-cuota-resultado` (vía `setMoneyValue` o `.value=cop(...)`, igual que hace `updateCuotaSugerida`).
- Si `_rfModo==='cuota'`: `var cuotaDeseada=moneyVal('rf-cuota');` si `cuotaDeseada>0`, `var cuotas=calcCuotasDesdeValor(saldoActual,tasa,cuotaDeseada);` — si `!isFinite(cuotas)`, mostrar en `#rf-proyeccion` un mensaje de error (mismo tono que la validación de `cuotaManual` en `saveNewCredito`, `js/creditos-ui.js:457-460`: "Esta cuota no alcanza a cubrir el interés...") y `return` sin seguir. Si es finito, recalcular `var cuotaResultado=calcCuotaPMT(saldoActual,tasa,cuotas);` (la cuota real con el número entero de cuotas) y pintar `cuotas` en `#rf-cuotas-resultado`.
- Con `cuotas`/`cuotaResultado`/`tasa` ya resueltos, armar el borrador: `var credBorrador={valorPrestamo:saldoActual,pctAval:0,cuotas:cuotas,tasa:tasaPct,fechaInicio:document.getElementById('rf-fecha').value||hoy,frecuencia:document.getElementById('rf-frec').value||cr.frecuencia};` (sin `id`, para que `calcAmortizacion` no lo cachee) y `var amort=calcAmortizacion(credBorrador);`.
- Pintar en `#rf-proyeccion`: un resumen (cuotas, valor de cuota, fecha de la última fila `amort.rows[amort.rows.length-1].fecha`, total a pagar `amort.rows.length*cuotaResultado` o `amort.total`, intereses `amort.total-saldoActual`) con el mismo estilo que `cr-cuota-sugerida-txt`, seguido de una tabla HTML simple (una fila por `amort.rows[i]`: número, fecha, valor de cuota, interés, capital, saldo) dentro de un contenedor con `max-height` + `overflow-y:auto` (mismo patrón que `#cr-list` en `openCreditoDetalle`, `js/creditos-ui.js:846`).

- [ ] **Step 3: Agregar `confirmarRefinanciarCredito(id)` y `ejecutarYGuardarRefinanciacion()`**

`confirmarRefinanciarCredito(id)`:
- Validar igual que `saveNewCredito` (mismos mensajes de estilo, vía `showAlert`): nombre no vacío, fecha no vacía, `cuotas` entero > 0, tasa >= 0, y si el modo es "por valor de cuota" que el resultado de `calcCuotasDesdeValor` sea finito (si no, `showAlert(...)` y `return` — no debe llegar aquí si `rfRecalcular` ya bloqueó, pero se revalida por si el usuario no disparó `oninput`).
- Si todo es válido, guardar en `_rfPendiente` el objeto `params` completo (`nombre, cuotas, tasa, fechaInicio, frecuencia, tcVinculada, esMensualidad`) leído de los campos del formulario (`esMensualidad`/`tcVinculada` heredados de `cr` si no hay control propio en el form — reusar el valor de `creditos[id]`, el diseño no pide un checkbox nuevo para esto en el modal de refinanciación, se hereda tal cual).
- Abrir un modal de confirmación simple (mismo patrón que `confirmDeleteCredito`): título `'¿Refinanciar '+esc(cr.nombre)+'?'`, texto explicando que el crédito actual quedará cerrado y marcado como refinanciado, botones Cancelar (`onclick="abrirRefinanciarCredito('"+id+"')"`, para volver al formulario sin perder nada ya que se re-arma desde `creditos[id]` tal cual estaba) / Confirmar (`onclick="ejecutarYGuardarRefinanciacion('"+id+"')"`).

`ejecutarYGuardarRefinanciacion(id)`:
- `try{ var nuevoId=ejecutarRefinanciacion(id,_rfPendiente); _rfPendiente=null; save();closeModal();openCreditoDetalle(nuevoId);toast('Crédito refinanciado ✓'); }catch(err){ console.error('Error refinanciando crédito:',err); showAlert('No se pudo refinanciar: '+err.message); }` (mismo estilo try/catch que `saveNewCredito`).

- [ ] **Step 4: Agregar el botón "Refinanciar" en `openCreditoDetalle` (`js/creditos-ui.js:826-831`)**

En la fila de acciones (`abonoBtnHtml+congelarBtnHtml+'<button ... Editar crédito</button>'`), agregar antes del botón "Editar crédito": `(activoCr&&!cr.refinanciado?'<button onclick="abrirRefinanciarCredito(\''+id+'\')" style="background:none;border:none;color:var(--mut);cursor:pointer;font-size:12px">'+btnIcon('refresh',13)+'Refinanciar</button>':'')`.

- [ ] **Step 5: `node --check js/creditos-refinanciar.js` y `node --check js/creditos-ui.js`**

Expected: sin salida en ambos

- [ ] **Step 6: Correr `npm test` (regresión, no se tocó lógica pura en este paso)**

Run: `npm test`
Expected: PASS (43 tests, sin cambios respecto a Task 3)

- [ ] **Step 7: Verificación visual con Playwright (servidor estático local, mismo flujo ya usado en esta sesión)**

Abrir la app, crear o usar un crédito de prueba con saldo pendiente, abrir su detalle, tocar "Refinanciar" y confirmar en capturas:
- El modal muestra el saldo fijo, los dos modos cambian correctamente de input/resultado, la proyección y la tabla de plan de pagos se actualizan al cambiar cuotas/cuota/tasa/fecha.
- Con un crédito que tenga `planImportado` (si hay uno de prueba disponible) o simulando `cr.tasa` indefinido, el campo tasa arranca vacío, no en "0" ni "NaN".
- Con una cuota deliberadamente baja (menor al interés del período), aparece el mensaje de error y no dos números sin sentido.
- Al confirmar, el modal de confirmación aparece, y tras aceptar, se abre el detalle del crédito nuevo con los valores correctos.

- [ ] **Step 8: Commit**

```bash
git add js/creditos-refinanciar.js js/creditos-ui.js
git commit -m "feat: modal de refinanciacion de credito con proyeccion en vivo y plan de pagos"
```

---

## Task 5: Reflejar "Refinanciado" en listas/resumen y excluir de los totales

**Files:**
- Modify: `js/creditos-ui.js` (`renderCreditos` líneas 25-62 y 112-139; `openCreditosMenu` líneas 173-193 y 237-264; `openCreditoDetalle` línea 809)

**Interfaces:**
- Consumes: `cr.refinanciado`/`cr.refinanciadoPorId` (campos agregados en Task 2).
- Produces: `creditoEstadoPillHtml(cr, activo)` — nueva función compartida en `js/creditos-ui.js` que devuelve el HTML completo del pill de estado (antes duplicado 3 veces), ahora con 3 estados posibles ("Activo"/"Pagado"/"Refinanciado"). No la consume ninguna otra tarea de este plan.

- [ ] **Step 1: Agregar `creditoEstadoPillHtml(cr, activo)` en `js/creditos-ui.js`**

```js
function creditoEstadoPillHtml(cr, activo){
  var style = cr.refinanciado ? 'background:var(--pur-d);color:var(--pur)'
    : activo ? 'background:var(--grn-d);color:var(--grn)'
    : 'background:var(--brd2);color:var(--mut)';
  var label = cr.refinanciado ? 'Refinanciado' : (activo ? 'Activo' : 'Pagado');
  return '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;padding:3px 9px;border-radius:20px;flex-shrink:0;margin-left:8px;'+style+'">'+label+'</div>';
}
function refinanciadoLinkHtml(cr){
  if(!cr.refinanciado || !creditos[cr.refinanciadoPorId]) return '';
  return '<div style="font-size:11px;margin-top:4px"><span onclick="event.stopPropagation();openCreditoDetalle(\''+cr.refinanciadoPorId+'\')" style="color:var(--acc);cursor:pointer;text-decoration:underline;text-underline-offset:2px">Ver crédito nuevo →</span></div>';
}
```

- [ ] **Step 2: Usar `creditoEstadoPillHtml`/`refinanciadoLinkHtml` en los 3 lugares que hoy arman el pill a mano**

Reemplazar el `'<div style="font-size:10px;...'+(x.activo?...)+'</div>'` de `renderCreditos` (línea ~123) por `creditoEstadoPillHtml(cr,x.activo)`, agregando `refinanciadoLinkHtml(cr)` justo después del `</div>` que cierra la fila del encabezado de la tarjeta (antes del bloque del anillo de progreso). Igual en `openCreditosMenu` (línea ~248) y en `openCreditoDetalle` (línea ~809, usando `activoCr` en vez de `x.activo`).

- [ ] **Step 3: Corregir qué cuenta como "activo" y qué entra en los totales**

En `renderCreditos` (línea 29) y en `openCreditosMenu` (línea 177), cambiar `var activo=proximaIdx!==-1;` por `var activo=proximaIdx!==-1 && !cr.refinanciado;`. Además, en `renderCreditos`, cambiar `var saldoTotal=infos.reduce(function(a,x){return a+x.saldoActual;},0);` (línea 61) por `var saldoTotal=infos.reduce(function(a,x){return x.cr.refinanciado?a:a+x.saldoActual;},0);`, y `var cuotasMes=infos.reduce(function(a,x){return a+x.cuotasDelMes;},0);` (línea 62) por la misma exclusión (`return x.cr.refinanciado?a:a+x.cuotasDelMes;`). (`openCreditosMenu` no necesita este segundo cambio porque su `saldoTotal` ya se calcula sobre `activos`, que hereda la exclusión del paso anterior.)

- [ ] **Step 4: `node --check js/creditos-ui.js`**

Expected: sin salida

- [ ] **Step 5: Correr `npm test` (regresión)**

Run: `npm test`
Expected: PASS (43 tests, sin cambios)

- [ ] **Step 6: Verificación visual con Playwright**

Con un crédito refinanciado de prueba (seguir el flujo de Task 4 o setear los campos a mano en `localStorage`/consola): confirmar en capturas que en la pestaña Créditos y en el menú de créditos el crédito viejo aparece con el pill morado "Refinanciado" y el enlace "Ver crédito nuevo", que "Saldo total"/"Créditos activos" NO lo cuentan, y que el crédito nuevo aparece normal con el pill "Activo".

- [ ] **Step 7: Commit**

```bash
git add js/creditos-ui.js
git commit -m "feat: mostrar creditos refinanciados como cerrados y excluirlos de los totales"
```

---

## Al terminar todas las tareas

Correr `.\bump-version.ps1` (una sola vez, al final de todo el plan, no por tarea) y avisar los archivos a subir — siguiendo el flujo estándar ya usado en el resto de esta sesión para finanzas-pwa.
