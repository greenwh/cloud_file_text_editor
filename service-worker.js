// =================================================================
// FINAL SERVICE WORKER - Uses Cache-First Strategy
// =================================================================

const CACHE_NAME = 'onedrive-text-editor-cache-v25'; // Fixed CodeMirror 6 imports by replacing basicSetup with manual extensions

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

// On fetch, use a cache-first strategy for assets, network-only for APIs
self.addEventListener('fetch', event => {
  // We only want to process GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  const requestUrl = new URL(event.request.url);

  // *** START OF FIX ***
  // If the request is for the Microsoft Graph API or ESM CDN, always fetch from the network.
  if (requestUrl.hostname === 'graph.microsoft.com' || requestUrl.hostname === 'esm.sh') {
    // Respond with a network request. Do not cache the result.
    event.respondWith(fetch(event.request));
    return;
  }
  // *** END OF FIX ***

  // For all other requests (our app assets), use the cache-first strategy.
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // Return the cached response if it exists
        if (response) {
          return response;
        }

        // Otherwise, fetch from the network
        return fetch(event.request).then(networkResponse => {
          // Cache the new response for app assets
          cache.put(event.request, networkResponse.clone());
          // and return it to the page
          return networkResponse;
        });
      });
    })
  );
});
