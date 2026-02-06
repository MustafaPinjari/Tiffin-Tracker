const CACHE_NAME = 'tiffin-tracker-v2'; // Updated version to clear old cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Only cache files that exist, skip missing icons
        return cache.addAll(urlsToCache.filter(url => {
          // Skip caching in development mode (when localhost is detected)
          if (self.location.hostname === 'localhost') {
            return url === '/' || url === '/manifest.json';
          }
          return true;
        }));
      })
      .catch(error => {
        console.log('Cache install failed:', error);
        // Don't fail the install if caching fails
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  // Skip caching for development files
  if (event.request.url.includes('@vite') || 
      event.request.url.includes('@react-refresh') ||
      event.request.url.includes('src/') ||
      event.request.url.includes('.tsx') ||
      event.request.url.includes('.ts') ||
      event.request.url.includes('node_modules')) {
    return; // Let the browser handle these requests normally
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(error => {
          console.log('Fetch failed for:', event.request.url, error);
          // Return a basic response for failed fetches
          if (event.request.destination === 'image') {
            // Return empty response for missing images
            return new Response('', { status: 404 });
          }
          throw error;
        });
      })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'order') {
    // Open the app and navigate to home
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  } else if (event.action === 'skip') {
    // Send message to main thread to update status
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        if (clientList.length > 0) {
          clientList[0].postMessage({
            action: 'skip',
            date: new Date().toISOString().split('T')[0]
          });
        }
      })
    );
  } else {
    // Default click - open the app
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      // Remove icon references since we don't have them
      actions: [
        { action: 'order', title: '📱 Order Now' },
        { action: 'skip', title: '❌ Skip Today' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});