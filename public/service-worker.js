const CACHE_NAME = 'static-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/favicon.png',
];

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only respondWith for safe GET requests to avoid double POST
  if (request.method !== 'GET') return;

  // Optional: Skip API GETs as well
  if (request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request);
    })
  );
});


self.addEventListener('fetch', (event) => {
  console.log(`[SW] Intercepting: ${event.request.method} - ${event.request.url}`);
});
