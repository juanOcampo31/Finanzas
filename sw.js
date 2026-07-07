// Sube este número cada vez que despliegues cambios en index.html/CSS/JS.
// Si lo olvidas, los usuarios seguirán viendo la versión anterior offline
// hasta que haya red disponible para revalidar.
const CACHE_VERSION = '1.1';
const CACHE = 'finanzas-' + CACHE_VERSION;
const FILES = ['./', './index.html', './style.css', './app.js', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './fonts/roboto-latin.woff2'];

// La pantalla de login pregunta la versión por postMessage para mostrarla —
// así el número en pantalla siempre coincide con la caché activa.
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'GET_VERSION' && e.source) {
    e.source.postMessage({ type: 'VERSION', version: CACHE_VERSION });
  }
});

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : null))))
      .then(() => self.clients.claim())
  );
});

// Estrategia: cache-first con revalidación en segundo plano (stale-while-revalidate).
// Sirve al instante desde caché (app shell) y actualiza el caché con la respuesta
// de red para la próxima vez, sin bloquear la carga actual.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request)
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy));
          }
          return response;
        })
        .catch(() => cached); // sin red: si había caché, ya se devolvió abajo

      return cached || networkFetch;
    })
  );
});
