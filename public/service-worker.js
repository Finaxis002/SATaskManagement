// public/service-worker.js
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: './vite.svg',
    badge: './vite.svg'
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});