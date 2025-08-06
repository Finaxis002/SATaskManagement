const CACHE_NAME = 'static-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/favicon.png',
];

// Install event - Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Serve from cache first, fallback to network
self.addEventListener('fetch', (event) => {
  // Don't cache API requests to prevent authentication issues
  if (event.request.url.includes('/api/')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
  );
});

// Push notification handling
self.addEventListener('push', (event) => {
  const data = event.data.json(); // Assuming the push payload is JSON
  const options = {
    body: data.body || 'No message provided',  // Fallback message if no body provided
    icon: '/favicon.png',
    badge: '/favicon.png',
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'New Reminder', options) // Use the title if available, or fallback to 'New Reminder'
  );
});
