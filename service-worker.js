const CACHE_NAME = 'gestion-pro-v5.1.0';
const urlsToCache = [
  './',
  './index.html',
  './premium.js',
  './qrcode.min.js',
  './html5-qrcode.min.js',
  './html2canvas.min.js',
  './manifest.json',
  './launchericon-192x192.png',
  './launchericon-512x512.png'
];

// Fichiers critiques qui doivent TOUJOURS être pris depuis le réseau en priorité
const NETWORK_FIRST_FILES = ['index.html', 'premium.js', '/'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(urlsToCache.map(url => cache.add(url).catch(err => console.log('⚠️ Ignoré:', url, err.message)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(cacheNames.map(cacheName => {
      if (cacheWhitelist.indexOf(cacheName) === -1) {
        console.log('🗑️ Suppression ancien cache:', cacheName);
        return caches.delete(cacheName);
      }
    }))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;

  const url = event.request.url;
  const isNetworkFirst = NETWORK_FIRST_FILES.some(f => url.endsWith(f) || url.includes(f + '?'));

  if (isNetworkFirst) {
    // Stratégie Network First : essaie le réseau, sinon le cache
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Stratégie Cache First pour les autres ressources (images, libs)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type === 'opaque') return response;
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {cache.put(event.request, responseClone);});
          return response;
        }).catch(() => {
          if (event.request.mode === 'navigate') return caches.match('./index.html');
        });
      })
  );
});
