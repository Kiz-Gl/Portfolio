// Service Worker for offline functionality
const CACHE_NAME = 'portfolio-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/404.html',
  '/assets/css/styles.css',
  '/assets/css/skins/color-1.css',
  '/assets/css/skins/color-2.css',
  '/assets/js/common.js',
  '/assets/js/security.js',
  '/assets/js/main.js',
  '/assets/js/sri-validator.js',
  '/assets/img/profile.png',
  'https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css'
];

// Install event - cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network with improved error handling
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the response from cache
        if (response) {
          return response;
        }

        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Handle 404 responses for navigation requests
            if (response.status === 404 && event.request.mode === 'navigate') {
              return caches.match('/404.html');
            }
            
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache API calls or external resources
                if (event.request.url.indexOf('http') === 0) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(error => {
            console.log('Fetch failed:', error);
            
            // If fetch fails (offline), show the offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            // For other resource types that fail, try to return something useful
            const url = new URL(event.request.url);
            const extension = url.pathname.split('.').pop();
            
            // For image requests, could return a placeholder
            if (/jpe?g|png|gif|svg|webp/i.test(extension)) {
              // Return a placeholder image or null
              return new Response('Not available offline', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            }
          });
      })
  );
});

// This event listener is redundant and causes conflicts with the one above
// Instead, we'll improve the main fetch event handler to handle both offline and 404 cases