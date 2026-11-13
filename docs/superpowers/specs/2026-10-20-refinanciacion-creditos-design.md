# Refinanciación de créditos — diseño

## Intención y por qué

Hoy, cuando alguien quiere refinanciar un crédito (ej. el crédito del carro), lo hace a
mano: mira el saldo pendiente, abre una calculadora aparte y prueba valores de cuota o
número de cuotas hasta encontrar algo que le sirva, y luego borra/recrea el crédito en la
app. Esta funcionalidad automatiza eso: toma el saldo pendiente real del crédito actual,
deja simular cómo quedaría con otro plazo/cuota/tasa, muestra la proyección completa
**antes** de guardar nada, y al confirmar crea el crédito nuevo y cierra el viejo marcado
como refinanciado — sin pasos manuales ni books borrados.

## Goals

- Refinanciar un crédito existente generando uno nuevo cuyo monto es el saldo pendiente
  actual del original.
- Permitir ajustar el plan nuevo por **número de cuotas** o por **valor de cuota**
  (modos mutuamente excluyentes: fijas uno, la app calcula el otro con la fórmula PMT ya
  existente en `creditos-calculo.js`).
- Permitir cambiar la tasa de interés, pre-cargada con la del crédito original.
- Mostrar una proyección en vivo (cuotas, valor de cuota, fecha fin, total a pagar) que se
  actualiza mientras el usuario mueve los campos, sin haber guardado nada todavía.
- Al confirmar: crear el crédito nuevo y marcar el original como **refinanciado y
  cerrado** — deja de pedir cuotas futuras, deja de sumar en el saldo total de deuda, pero
  permanece visible en el histórico con un enlace al nuevo crédito.

## Non-goals

- No se toca el abono a capital, congelamiento de cuotas, ni la importación de planes de
  banco — son features independientes que siguen igual.
- No se hace refinanciación "parcial" (solo una parte del saldo) — siempre es sobre el
  saldo pendiente completo del crédito.
- No se permite deshacer una refinanciación con un botón (si el usuario se equivoca, edita
  o borra el crédito nuevo manualmente y el original vuelve a quedar activo — ver sección
  de reversión más abajo).

## Anti-goals (qué sería un fracaso aunque "funcione")

- Que el saldo total de deuda que se muestra en Inicio/Créditos quede duplicado (sumando
  el crédito viejo Y el nuevo) después de refinanciar.
- Que queden cuotas futuras "fantasma" del crédito viejo generándose automáticamente cada
  mes después de refinanciado (el draft mensual de `catalogos.js` ya crea el gasto de la
  próxima cuota de cada crédito activo; el viejo no debe seguir generándolos).
- Que gastos ya creados en meses futuros, ligados a cuotas del crédito viejo que ya no
  existen bajo el nuevo plan, queden huérfanos mostrando una cuota que nunca se va a pagar.

## Decisiones ya tomadas con el usuario

- La tasa de interés del crédito nuevo se puede editar, pero **arranca pre-cargada con la
  tasa del crédito original** (confirmado explícitamente).
- El saldo que se refinancia es el **saldo pendiente actual** (el mismo que ya calcula
  `calcEstadoCredito` hoy), no un valor de un momento histórico.
- Los dos modos de ajuste son "por número de cuotas" y "por valor de cuota" (el usuario lo
  llamó "por tiempo y cuotas").

## Diseño de la UI

**Punto de entrada:** en `openCreditoDetalle(id)` (js/creditos-ui.js), junto a los botones
"Abonar"/"Congelar"/"Editar crédito" que ya existen en esa fila de acciones, se agrega un
botón de texto **"Refinanciar"** (mismo estilo visual que "Editar crédito"). Solo visible
si el crédito está activo (`estado.proximaIdx!==-1`, es decir, tiene saldo pendiente) y no
está ya refinanciado.

**Modal "Refinanciar crédito"** (`abrirRefinanciarCredito(id)`, nuevo archivo o agregado a
creditos-ui.js — el implementador decide dónde encaja mejor):

- Encabezado informativo (no editable): "Saldo a refinanciar: {saldoActual}" — tomado de
  `calcEstadoCredito(cr).saldoActual`.
- Campo **Nombre** del crédito nuevo, pre-cargado como "{nombre original} (refinanciado)",
  editable.
- Selector de 2 pestañas/pills: **"Por # de cuotas"** / **"Por valor de cuota"** — el modo
  activo determina cuál de los dos campos es el input y cuál es el resultado calculado
  (igual patrón visual a las pestañas Manual/Importar que ya existen en `openNewCredito`).
  - Modo "por cuotas": el usuario escribe el número de cuotas; la app calcula el valor de
    cuota con `calcCuotaPMT(saldoActual, tasa, cuotas)`.
  - Modo "por cuota": el usuario escribe el valor de cuota deseado; la app despeja el
    número de cuotas necesario (fórmula inversa de PMT), lo redondea hacia arriba al
    entero más cercano, y luego recalcula la cuota real con ese número entero de cuotas
    (para que la proyección mostrada sea exactamente la que se va a guardar, sin
    decimales sueltos) — si la tasa es 0, es división simple.
- Campo **Tasa de interés %**, pre-cargado con la tasa del crédito original, editable.
- Campo **Fecha de inicio**, pre-cargado con la fecha de hoy, editable.
- Frecuencia (mensual/quincenal) y tarjeta vinculada: heredadas del crédito original,
  editables igual que en el formulario normal de crédito nuevo (reutilizar
  `frecuenciaFieldHtml`/`tarjetaVinculadaFieldHtml`, ya existentes).
- **Panel de proyección**, siempre visible y recalculado en cada input (sin botón
  "calcular" aparte): número de cuotas, valor de cuota, fecha de la última cuota, total a
  pagar (cuota × n), y total de intereses (total a pagar − saldoActual) — mismo estilo de
  tarjeta que `cr-cuota-sugerida-txt` en `openNewCredito`, pero más completo.
- **Tabla "Plan de pagos"**, debajo del resumen, con una fila por cuota (# cuota, fecha,
  valor de cuota, interés, capital, saldo restante) — igual información y mismo estilo
  visual que la tabla que ya se ve en `openCreditoDetalle` (`rowsHtml`/`amort.rows`), pero
  de un crédito que todavía no existe. Se arma pasándole a `calcAmortizacion` un objeto
  "borrador" (sin `id`, para que no choque con la caché de `_amortCache`) con los valores
  que el usuario va ajustando: `{valorPrestamo:saldoActual, pctAval:0, cuotas, tasa,
  fechaInicio, frecuencia}` — exactamente los mismos campos que ya usa `calcAmortizacion`,
  así se reutiliza tal cual, sin funciones nuevas de cálculo. Se recalcula junto con el
  resto del panel en cada input, con scroll propio si hay muchas cuotas (igual que
  `#cr-list` en el detalle del crédito).
- Botones: "Cancelar" y "Refinanciar" (azul/primario). "Refinanciar" pide una confirmación
  simple (`showConfirm` o similar ya usado en el resto de la app) antes de ejecutar, porque
  cierra el crédito original.

## Qué pasa al confirmar

1. Se crea el crédito nuevo reusando la misma lógica de `saveNewCredito` (mismo objeto de
   datos: nombre, valorPrestamo=saldoActual, aval=0%, cuotas, tasa, fecha, frecuencia,
   tcVinculada, esMensualidad heredado del original), más un campo nuevo:
   `nuevoCredito.refinanciaDeId = idOriginal`.
2. Igual que un crédito nuevo normal, se le crea el gasto de su primera cuota
   (`crearGastoDesdeCredito`), para que el usuario no tenga que hacerlo a mano.
3. El crédito original se marca con tres campos nuevos:
   - `cr.refinanciado = true`
   - `cr.refinanciadoEn` = fecha ISO de hoy
   - `cr.refinanciadoPorId` = id del crédito nuevo
4. Se desvincula (mismo patrón que ya usa `deleteCredito` al limpiar referencias:
   `creditoId=null; numCuota=null;`), **sin borrarlo**, cualquier gasto o deducción de
   nómina (`ded_q1`/`ded_q2`, igual que hace `deleteCredito`) ligado a una cuota del
   crédito original cuyo pago **no esté registrado en `cr.pagos[idx]`** — esa es la misma
   fuente de verdad que ya usa `calcEstadoCredito` para `saldoActual`, así no hay
   ambigüedad entre el estado del gasto (`g.estado`) y el estado real del crédito; se
   evalúa cuota por cuota (`idx = numCuota-1`), incluidas las marcadas "sin pagar"
   (diferidas), porque esa deuda sigue sumando en `saldoActual` y por tanto ya quedó
   incluida en el crédito nuevo. El usuario confirmó este comportamiento: el gasto de la
   cuota vigente de este mes (si ya existía) queda así desvinculado — no se borra ni se
   fusiona con el gasto de la primera cuota del crédito nuevo — porque esa obligación ya
   vive en el crédito nuevo.
5. `invalidarAmortCache(idOriginal)` y recalcular/renderizar.

## Casos especiales resueltos

- **Créditos importados de banco (`cr.planImportado`) no tienen una tasa real** (nunca se
  guarda `cr.tasa` para ellos — ver `importCreditoPlan`). El botón "Refinanciar" sigue
  disponible para estos; el campo de tasa en el modal simplemente arranca vacío (no se
  precarga nada) en vez de con un valor inventado, y el usuario escribe la que quiera (o
  la deja en 0, en cuyo caso `calcCuotaPMT` reparte el saldo en cuotas iguales sin interés).
- **Refinanciar un crédito que ya es resultado de otra refinanciación** (tiene su propio
  `refinanciaDeId`) está permitido sin restricción — se trata como cualquier crédito
  activo; encadenar refinanciaciones es un caso válido, no un error.

## Qué deja de pasar con un crédito refinanciado

- El draft mensual automático en `catalogos.js` (~línea 624) que crea el gasto de la
  próxima cuota de cada crédito activo debe **saltarse** los créditos con
  `cr.refinanciado===true`.
- Los totales de "saldo pendiente"/"deuda total" en Inicio y en el resumen de Créditos
  (`js/creditos-ui.js`, `js/render-inicio.js`) deben excluir los créditos refinanciados de
  la suma — solo se cuenta el crédito nuevo.
- En la lista de créditos y en su detalle, un crédito refinanciado muestra una etiqueta
  "Refinanciado" (estilo visual similar al badge "crédito" ya usado en `gasto-estado.js`) y
  un enlace para ir al crédito nuevo (`openCreditoDetalle(cr.refinanciadoPorId)`). Sigue
  siendo visible en la lista (no se oculta ni se borra) para mantener el histórico.
- El botón "Refinanciar" no vuelve a aparecer en un crédito ya refinanciado.

## Reversión (si el usuario se equivoca)

No hay un botón de "deshacer refinanciación" dedicado. Si el usuario borra el crédito
nuevo (`deleteCredito`, que ya existe), el original NO vuelve a activarse automáticamente
en esta primera versión — para revertir, el usuario tendría que quitarle manualmente los
campos `refinanciado`/`refinanciadoPorId` editando datos, lo cual hoy no tiene UI. Esto se
documenta como limitación conocida y no bloquea la v1; si en el futuro hace falta un
"deshacer" con un clic, es una mejora aparte.

## Qué queda a criterio del implementador

- Si el modal de refinanciación vive en `creditos-ui.js` o en un archivo nuevo
  `creditos-refinanciar.js` (si el archivo existente ya es muy largo). Si se crea un
  archivo nuevo, debe agregarse a `js/manifest.json`, `index.html`, `tests.html` y
  `sw.js` (mismo patrón que cualquier archivo de `js/`).
- Detalles exactos de estilos (colores, tamaños) — seguir el lenguaje visual ya usado en
  `openNewCredito`/`openCreditoDetalle` (tarjetas `stdFormHeroCardHtml`, pills, etc.), sin
  introducir un sistema de diseño nuevo (recordatorio: el "ui-kit" fue descartado
  explícitamente por el usuario en una sesión anterior — no reintroducirlo).
- Mensaje exacto de la confirmación antes de refinanciar.
- Redondeo exacto cuando se despeja el número de cuotas en modo "por valor de cuota"
  (hacia arriba, como se describe arriba, es la regla; el texto del mensaje si la cuota
  resultante difiere ligeramente de la pedida queda a su criterio, ej. "con esta cuota
  necesitas 14 pagos en vez de 13.4").
