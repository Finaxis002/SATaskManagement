self.addEventListener('push', function (event) {
  const options = {
    body: event.data.text(),
    icon: '/icon.png',
    badge: '/badge.png'
  };

  event.waitUntil(
    self.registration.showNotification('New Reminder', options)
  );
});
