const CACHE_NAME = 'limpopo-connect-v3';
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
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(urlsToCache);
      } catch (e) {
        // Ignore cache errors; app should still load from network
        console.warn('[SW] cache.addAll failed:', e);
      }
      // Activate new SW immediately
      await self.skipWaiting();
    })()
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests and API calls to avoid caching dynamic data
  if (event.request.method !== 'GET' || new URL(event.request.url).pathname.startsWith('/api')) {
    return;
  }
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      try {
        return await fetch(event.request);
      } catch (e) {
        // If navigation request fails and we're offline, try the app shell
        if (event.request.mode === 'navigate') {
          const cache = await caches.open(CACHE_NAME);
          const shell = await cache.match('/');
          if (shell) return shell;
        }
        throw e;
      }
    })()
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => (name !== CACHE_NAME ? caches.delete(name) : Promise.resolve()))
      );
      // Ensure the new SW takes control immediately
      await self.clients.claim();
    })()
  );
});