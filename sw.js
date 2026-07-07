// Sube este n�mero cada vez que despliegues cambios en index.html/CSS/JS.
// Si lo olvidas, los usuarios seguir�n viendo la versi�n anterior offline
// hasta que haya red disponible para revalidar.
const CACHE_VERSION = '1.5';
const CACHE = 'finanzas-' + CACHE_VERSION;
const FILES = ['./', './index.html', './style.css', './app.js', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './fonts/roboto-latin.woff2'];

// La pantalla de login pregunta la versi�n por postMessage para mostrarla �
// as� el n�mero en pantalla siempre coincide con la cach� activa.
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

// Estrategia: cache-first con revalidaci�n en segundo plano (stale-while-revalidate).
// Sirve al instante desde cach� (app shell) y actualiza el cach� con la respuesta
// de red para la pr�xima vez, sin bloquear la carga actual.
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
        .catch(() => cached); // sin red: si hab�a cach�, ya se devolvi� abajo

      return cached || networkFetch;
    })
  );
});
