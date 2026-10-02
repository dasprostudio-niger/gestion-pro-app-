const CACHE_NAME = 'gestion-pro-v5.1.1';
const urlsToCache = [
  './',
  './index.html',
  './index-ios.html',
  './premium.js',
  './qrcode.min.js',
  './html5-qrcode.min.js',
  './html2canvas.min.js',
  './manifest.json',
  './manifest-ios.json',
  './launchericon-48x48.png',
  './launchericon-72x72.png',
  './launchericon-96x96.png',
  './launchericon-144x144.png',
  './launchericon-192x192.png',
  './launchericon-512x512.png'
];

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
  if (event.request.url.startsWith('http://127.0.0.1')) return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).then(res => {
          if (!res || res.status !== 200 || res.type === 'opaque') return res;
          const responseClone = res.clone();
          caches.open(CACHE_NAME).then(cache => { cache.put(event.request, responseClone); });
          return res;
        }).catch(() => {
          if (event.request.mode === 'navigate') {
            const url = event.request.url;
            if (url.includes('index-ios')) return caches.match('./index-ios.html');
            return caches.match('./index.html');
          }
        });
      })
  );
});
