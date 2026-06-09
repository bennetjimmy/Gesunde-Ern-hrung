/* NNG-App Service Worker — sw.js
   Hochladen in dasselbe GitHub-Repo wie index.html */

const CACHE = 'nng-v1';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});

/* Empfängt Nachrichten von der App und zeigt Notifications */
self.addEventListener('message', function(e) {
  if (!e.data) return;

  if (e.data.type === 'notify') {
    e.waitUntil(
      self.registration.showNotification(e.data.title, e.data.options || {})
    );
  }

  if (e.data.type === 'schedule') {
    /* Verzögerte Notification (delay in Millisekunden) */
    const delay = e.data.delay || 0;
    const title = e.data.title || 'NNG-App';
    const opts  = e.data.options || {};
    setTimeout(function() {
      self.registration.showNotification(title, opts);
    }, delay);
  }
});

/* Klick auf Notification -> App öffnen / fokussieren */
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow('./');
    })
  );
});

/* Optional: App-Shell cachen für Offline-Nutzung */
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(resp) {
        if (resp && resp.status === 200 && e.request.url.includes('index.html')) {
          var clone = resp.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        }
        return resp;
      });
    }).catch(function() { return caches.match('./index.html'); })
  );
});
