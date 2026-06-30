const CACHE_NAME = 'skywatch-v1';
const STATIC_CACHE = 'skywatch-static';
const API_CACHE = 'skywatch-api';

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const expectedCaches = [CACHE_NAME, STATIC_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => !expectedCaches.includes(k)).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

function shouldCacheApi(url) {
  const u = new URL(url);
  return u.pathname.startsWith('/api/') && u.origin === self.location.origin;
}

function isNavigation(url) {
  try {
    const u = new URL(url);
    return u.origin === self.location.origin && u.pathname === '/';
  } catch {
    return false;
  }
}

function isStatic(url) {
  try {
    const u = new URL(url);
    return u.origin === self.location.origin && (
      u.pathname.match(/\.(js|css|json|png|svg|ico|woff2?)$/) ||
      u.pathname === '/manifest.json' ||
      u.pathname.startsWith('/_next/static/')
    );
  } catch {
    return false;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // API requests: network-first with cache fallback
  if (shouldCacheApi(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cloned = response.clone();
          if (response.ok) {
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, cloned);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || new Response(JSON.stringify({ flights: [], cached: true }), {
              headers: { 'Content-Type': 'application/json' },
            });
          });
        })
    );
    return;
  }

  // Static assets: cache-first
  if (isStatic(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          const cloned = response.clone();
          if (response.ok) {
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, cloned));
          }
          return response;
        });
      })
    );
    return;
  }

  // Navigation: network-first, fallback to cached shell
  if (isNavigation(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cloned = response.clone();
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Default: network-only
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
