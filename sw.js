/* NNG-App Service Worker v3 — sw.js */
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

/* Push vom Server empfangen → Notification zeigen */
self.addEventListener('push', e => {
  let data = { title: '🥗 NNG-App', body: 'Erinnerung', tag: 'nng' };
  try { if (e.data) data = { ...data, ...e.data.json() }; } catch (_) {}
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body, tag: data.tag || 'nng',
    icon: 'https://bennetjimmy.github.io/Gesunde-Ern-hrung/favicon.ico',
    badge: 'https://bennetjimmy.github.io/Gesunde-Ern-hrung/favicon.ico',
    vibrate: [150, 50, 150],
    requireInteraction: false
  }));
});

/* Lokale Nachrichten von der App */
self.addEventListener('message', e => {
  if (!e.data) return;
  if (e.data.type === 'notify')
    self.registration.showNotification(e.data.title, e.data.options || {});
  if (e.data.type === 'scheduleAll')
    (e.data.notifs || []).forEach(n => {
      const ms = Math.max(0, n.delay);
      if (ms < 86400000) setTimeout(() =>
        self.registration.showNotification(n.title, n.options || {}), ms);
    });
});

/* Klick → App öffnen */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(cs => { for (const c of cs) if ('focus' in c) return c.focus();
      return self.clients.openWindow('./'); }));
});

/* Offline-Cache */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(c => c || fetch(e.request)
    .then(r => { if (r.status === 200 && e.request.url.includes('index.html'))
      caches.open('nng-v3').then(cache => cache.put(e.request, r.clone())); return r; })
    .catch(() => caches.match('./index.html'))));
});
