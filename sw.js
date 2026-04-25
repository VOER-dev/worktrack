// ── BUMP THIS NUMBER every time you upload a new version of the app ──
// Change v2 → v3 → v4 etc. This forces all phones to download the update.
const CACHE = 'worktrack-v10';
const ASSETS = ['/index.html', '/manifest.json'];

// INSTALL: cache all assets fresh
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ACTIVATE: delete ALL old caches so employees don't get stale version
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// FETCH: network first, fall back to cache
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(cached => cached || caches.match('/index.html')))
  );
});

// MESSAGE: allow the app to manually trigger an update check
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
