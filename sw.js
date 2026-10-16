const CACHE = 'pointeuse-v3';
const SHELL = ['./', './index.html', './suivi.html', './style.css', './commun.js', './manifest.webmanifest', './icon-180.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('pointeuse-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Pages : réseau d'abord, sinon la même page en cache (sans les paramètres)
  if (req.mode === 'navigate' && url.origin === location.origin) {
    const key = url.origin + url.pathname;
    e.respondWith(
      fetch(req).then(r => {
        if (r && r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(key, c)); }
        return r;
      }).catch(() => caches.match(key).then(hit => hit || caches.match(/suivi\.html$/.test(url.pathname) ? './suivi.html' : './index.html')))
    );
    return;
  }
  // Fichiers du site : réseau d'abord (toujours la dernière version), cache si hors ligne
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req).then(r => {
        if (r && r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); }
        return r;
      }).catch(() => caches.match(req, { ignoreSearch: true }))
    );
    return;
  }
  // Polices : cache d'abord
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(r => {
        if (r && (r.ok || r.type === 'opaque')) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); }
        return r;
      }))
    );
  }
});
