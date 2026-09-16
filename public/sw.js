// Force reload on version change
const CACHE_VERSION = 'v1.0.3';
const CACHE_NAME = `raven-tutorials-${CACHE_VERSION}`;

self.addEventListener('install', (event) => {
  console.log('Service Worker installing:', CACHE_VERSION);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      // Force reload all open pages
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          console.log('Force reloading client');
          client.postMessage({ type: 'FORCE_RELOAD' });
        });
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Don't cache, always fetch fresh
  event.respondWith(fetch(event.request));
});

