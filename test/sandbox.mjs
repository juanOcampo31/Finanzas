// Sandbox mínimo para correr app.js REAL (sin copiarlo/pegarlo aparte) fuera de un navegador,
// usando solo node:vm (sin dependencias nuevas: nada de jsdom/puppeteer). La idea no es simular
// un DOM de verdad, sino dar un "agujero negro" que absorba cualquier llamada a document/*
// sin lanzar, para poder ejercitar la lógica pura del archivo (cálculos de crédito, validación
// de esquema, sincronización de estado de gasto, etc.) tal como vive en producción.
//
// app.js debe cargarse con window.__SKIP_AUTOSTART__=true ya puesto (ver ese guard al final del
// archivo) para que no intente desbloquear con PIN, tocar localStorage de verdad ni registrar
// un service worker — ninguno de esos caminos aplica corriendo por fuera del navegador.
//
// app.js se dividió en varios archivos bajo js/ (uno por dominio) que se cargan como <script>
// separados en index.html/tests.html, en el mismo orden relativo en que vivían dentro del
// app.js original (necesario: código de nivel superior de un archivo puede depender de que uno
// anterior ya haya corrido). Ese orden vive en un único lugar — js/manifest.json — y tanto
// index.html/tests.html como este sandbox deben usar exactamente ese orden. Si cambias el orden
// acá, cámbialo también en js/manifest.json y en los <script> de index.html/tests.html.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT_DIR, 'js', 'manifest.json');

function makeFakeElement(){
  const el = {
    style: {},
    dataset: {},
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    children: [],
    options: [],
    value: '',
    checked: false,
    textContent: '',
    innerHTML: '',
    files: [],
    addEventListener(){},
    removeEventListener(){},
    appendChild(child){ return child; },
    removeChild(){},
    remove(){},
    focus(){},
    click(){},
    setSelectionRange(){},
    getAttribute(){ return null; },
    setAttribute(){},
    closest(){ return makeFakeElement(); },
    querySelector(){ return makeFakeElement(); },
    querySelectorAll(){ return []; },
  };
  return el;
}

function makeFakeLocalStorage(){
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: (k) => { store.delete(k); },
    clear: () => { store.clear(); },
    get length(){ return store.size; },
  };
}

// Carga app.js en un contexto vm nuevo y devuelve ese contexto (todas las `function`/`let`/
// `var` de nivel superior del archivo quedan como propiedades del objeto retornado, listas
// para usarse en las pruebas — igual que quedarían como globals si el script corriera en un
// navegador de verdad).
export function loadApp(){
  const files = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const src = files
    .map((f) => fs.readFileSync(path.join(ROOT_DIR, f), 'utf8'))
    .join('\n');
  const fakeDocument = {
    getElementById(){ return makeFakeElement(); },
    createElement(){ return makeFakeElement(); },
    querySelector(){ return makeFakeElement(); },
    querySelectorAll(){ return []; },
    addEventListener(){},
    removeEventListener(){},
    visibilityState: 'visible',
  };
  const sandbox = {
    console,
    Math, Date, JSON, RegExp, Error, Array, Object, Map, Set, Promise,
    TextEncoder, TextDecoder,
    crypto: globalThis.crypto,
    localStorage: makeFakeLocalStorage(),
    document: fakeDocument,
    navigator: {},
    location: { reload(){} },
    fetch: undefined,
    setTimeout, clearTimeout, setInterval, clearInterval,
  };
  sandbox.window = sandbox;
  sandbox.window.__SKIP_AUTOSTART__ = true;
  sandbox.window.addEventListener = () => {};
  sandbox.window.removeEventListener = () => {};
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'app.js' });
  // Puente hacia el estado de nivel superior de app.js (db, creditos, catTipos, catMetodos):
  // están declarados con `let`, así que — igual que en un <script> normal de navegador — NO
  // quedan como propiedades del objeto global (a diferencia de `var`/`function`, que sí). Sin
  // este puente, algo como sandbox.db = {...} desde afuera crearía una propiedad suelta sin
  // ninguna relación con el `let db` que usan las funciones de app.js por dentro. Este segundo
  // script corre en el MISMO contexto (misma cadena de scopes) que app.js, así que sí puede
  // referenciar esos bindings directamente — como si fuera la siguiente etiqueta <script> de la
  // misma página — y expone getters/setters reales sobre ellos.
  // INIT/FE también son `const` de nivel superior (mismo problema que db/creditos/etc. — no
  // quedan como propiedad del objeto global), pero nunca se reasignan, así que solo hacen
  // falta como getters (no como setters) acá.
  vm.runInContext(
    'globalThis.__internals = {' +
    '  get db(){ return db; }, set db(v){ db = v; },' +
    '  get creditos(){ return creditos; }, set creditos(v){ creditos = v; },' +
    '  get catTipos(){ return catTipos; }, set catTipos(v){ catTipos = v; },' +
    '  get catMetodos(){ return catMetodos; }, set catMetodos(v){ catMetodos = v; },' +
    '  get INIT(){ return INIT; },' +
    '  get FE(){ return FE; }' +
    '};',
    sandbox,
    { filename: 'app-test-bridge.js' }
  );
  return sandbox;
}
