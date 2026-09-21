// ── Estado compartido de la app ──────────────────────────────────────────────
// Fase 1 de la migración a una arquitectura más modular (ver conversación): antes estas
// variables vivían dispersas al principio de auth.js, mezcladas con las funciones de
// autenticación/cifrado. Se consolidan acá para que quede claro, en un solo lugar, qué estado
// comparte toda la app — sin cambiar todavía cómo se cargan los archivos (siguen siendo
// <script> clásicos: cualquier archivo puede seguir leyendo/reasignando estas variables como
// globals, igual que antes de este cambio).
//
// Reasignaciones directas conocidas de cada variable (auditoría previa a este cambio), fuera de
// donde se declaran: útil como mapa de referencia para cuando llegue la Fase 3 (ES Modules de
// verdad), donde cada una de estas reasignaciones tendrá que pasar a un setter explícito, porque
// un `import` no se puede reasignar directamente.
//   db                 → auth.js, catalogos.js, export-main.js, sync.js
//   creditos           → auth.js, sync.js
//   catTipos           → auth.js, sync.js
//   catMetodos         → auth.js, sync.js
//   perfilTelefono     → auth.js, sync.js
//   perfilNombre       → auth.js, sync.js
//   perfilQ2DiasFijos  → auth.js, catalogos.js, export-main.js, sync.js
//   curM               → auth.js, catalogos.js, export-main.js, sync.js
//   sessionDataKey     → auth.js, sync.js
// El resto (gFiltro, curTC, homeQ, etc.) solo se reasigna hoy desde el mismo archivo dueño de la
// funcionalidad (auth.js/render.js), pero vive acá igual por ser estado compartido de la app.

let creditos={}; // {id: {nombre, valorPrestamo, pctAval, cuotas, tasa, fechaInicio, frecuencia}}
let catTipos=[]; // [{id, nombre}] catálogo de tipos/nombres de gasto
let catMetodos=[]; // [{id, nombre}] catálogo de formas de pago
let perfilTelefono=''; // número de celular para recuperación (ver Seguridad); viaja cifrado junto al resto de los datos
let perfilNombre='';   // nombre del perfil (solo informativo); viaja cifrado junto al resto de los datos, igual que perfilTelefono
// Regla de cálculo de la quincena 2 (ver diasQ2 en nomina-calc.js): por defecto se paga según
// los días reales del mes (13 a 16, según el mes) — pero muchas empresas siempre pagan Q2 como
// si fueran 15 días fijos, sin importar el mes. Editable en Perfil; viaja cifrado como los demás
// datos del perfil, así que aplica igual en todos los dispositivos sincronizados.
let perfilQ2DiasFijos=false;
let db=null; // se puebla en loadAppData() (auth.js), después de desbloquear con el PIN — nunca antes
let sessionDataKey=null; // CryptoKey AES-256 en memoria; nunca se persiste. Cifra/descifra fin26_enc.
let saveChain=Promise.resolve(); // serializa los guardados para no pisar escrituras si save() se llama varias veces seguidas

let curM   = parseInt(localStorage.getItem('fin26m') || '0');
let gFiltro = {'q1':'todos','q2':'todos'}; // filtro por método en Q1/Q2
let gSort      = {'q1':'orden','q2':'orden'};  // orden activo en Q1/Q2
let gFilterOpen= {'q1':false,'q2':false};   // filtros/orden expandido
let headerUserMenuOpen=false;   // panel del menú de usuario (bloque de identidad), en el header
let headerMonthPanelOpen=false; // panel del selector de mes (pastilla derecha), en el header
let igHelpOpen=false;           // panel de ayuda ("?") de Información general — colapsado por defecto
let gGroupOpen  = {};  // group open state: {groupId: bool}
let tcAbonoOpen = {};  // detalle de abonos de una compra de tarjeta expandido: {movimientoId: bool}
let curTC = null; // id de la tarjeta seleccionada actualmente
let tcInfoOpen  = false;                        // info tarjeta expandida
let curIngQ = 'q1'; // quincena seleccionada actualmente en la pestaña Ingresos
let curNomQ = 'q1'; // quincena seleccionada actualmente en la pestaña Nómina
let summaryOpen = true;                          // resumen del mes (básico/neto/gastos/tarjeta) — expandido por defecto
let nomResumenOpen = false;                       // "Resumen de <mes>" en la pestaña Nómina — colapsado por defecto
// Desgloses expandibles de cada bloque del Resumen del mes — todos colapsados por defecto.
// Cada pill además navega a su pestaña correspondiente al seleccionarse (ver selectStat()).
let statBreakdownOpen = {basico:false, ingresos:false, gastos:false, tarjeta:false, dispQ1:false, dispQ2:false};
const STAT_BREAKDOWN_DOM_IDS = {basico:'basicoBreakdown', ingresos:'netoBreakdown', gastos:'gastosBreakdown', tarjeta:'tcBreakdown', dispQ1:'dispQ1Breakdown', dispQ2:'dispQ2Breakdown'};
let lastCreatedId = null;                         // id del último gasto creado, para animación de entrada
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
let curTab = 0;
let homeQ = 'q1'; // quincena seleccionada dentro de la vista Inicio
let homeQAutoDone = false; // ya se aplicó el default automático de homeQ según la fecha de hoy
let curNomQAutoDone = false; // igual que homeQAutoDone, pero para curNomQ (ver homeQParaMes, render.js)
let tcTipo = 'Compra';
