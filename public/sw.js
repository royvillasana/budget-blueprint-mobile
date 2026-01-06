// Service Worker para caching de assets y mejora de performance
const CACHE_VERSION = 'v1';
const CACHE_NAME = `budget-blueprint-${CACHE_VERSION}`;

// Assets para pre-cache (critical assets)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
];

// Rutas de la API que NO deben cachearse
const API_ROUTES = [
  'https://supabase.co',
  'https://api.openai.com',
];

// Install event - pre-cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching critical assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete old cache versions
            return cacheName.startsWith('budget-blueprint-') && cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip caching for API routes
  if (API_ROUTES.some(apiUrl => url.href.includes(apiUrl))) {
    return event.respondWith(fetch(request));
  }

  // Skip caching for POST, PUT, DELETE requests
  if (request.method !== 'GET') {
    return event.respondWith(fetch(request));
  }

  // Strategy: Cache-first for static assets, Network-first for HTML
  const isNavigationRequest = request.mode === 'navigate';

  if (isNavigationRequest) {
    // Network-first strategy for HTML pages
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request).then((response) => {
            return response || caches.match('/index.html');
          });
        })
    );
  } else {
    // Cache-first strategy for static assets (JS, CSS, images, fonts)
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Only cache same-origin requests
          if (url.origin !== location.origin) {
            return response;
          }

          // Clone the response before caching
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        });
      })
    );
  }
});

// Message event - allow clients to trigger cache refresh
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        console.log('[SW] Cache cleared');
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});
