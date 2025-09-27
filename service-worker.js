// =================================================================
// FINAL SERVICE WORKER - Uses Cache-First Strategy
// =================================================================

const CACHE_NAME = 'onedrive-text-editor-cache-v6'; // Incremented cache name

// On install, activate immediately
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// On fetch, use a cache-first strategy
self.addEventListener('fetch', event => {
  // We only want to cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // Return the cached response if it exists
        if (response) {
          return response;
        }

        // Otherwise, fetch from the network
        return fetch(event.request).then(networkResponse => {
          // Cache the new response
          cache.put(event.request, networkResponse.clone());
          // and return it to the page
          return networkResponse;
        });
      });
    })
  );
});