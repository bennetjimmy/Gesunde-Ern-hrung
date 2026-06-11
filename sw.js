/* NNG-App Service Worker v2 — sw.js */
const CACHE = 'nng-v2';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });

self.addEventListener('message', e => {
  if (!e.data) return;
  if (e.data.type === 'notify') {
    self.registration.showNotification(e.data.title, e.data.options || {});
  }
  if (e.data.type === 'scheduleAll') {
    (e.data.notifs || []).forEach(n => {
      const delay = Math.max(0, n.delay);
      if (delay < 86400000) setTimeout(() => {
        self.registration.showNotification(n.title, n.options || {});
      }, delay);
    });
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const c of clients) { if ('focus' in c) return c.focus(); }
      return self.clients.openWindow('./');
    })
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
      if (resp && resp.status === 200 && e.request.url.includes('index.html')) {
        caches.open(CACHE).then(c => c.put(e.request, resp.clone()));
      }
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
