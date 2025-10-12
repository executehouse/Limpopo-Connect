const CACHE_NAME = 'limpopo-connect-v2';
const urlsToCache = [
  '/',
  '/business-directory',
  '/events',
  '/marketplace',
  '/tourism',
  '/news',
  '/connections',
  '/manifest.json',
  '/vite.svg'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests and API calls to avoid caching dynamic data
  if (event.request.method !== 'GET' || new URL(event.request.url).pathname.startsWith('/api')) {
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});