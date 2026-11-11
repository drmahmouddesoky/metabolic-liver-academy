/* Metabolic Liver Academy – offline support for the installed app.
   Network first: visitors always get the newest pages when online.
   The last copy of each page is kept so it still opens offline.
   Only this site's own files are ever cached (never another origin). */
var CACHE = 'mla-v2';
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then(function (res) {
    if (res.ok && res.type === 'basic') { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(req).then(function (hit) {
      if (hit) return hit;
      if (req.mode !== 'navigate') return Response.error();
      var scope = self.registration.scope;
      var home = new URL(req.url).pathname.indexOf('/ar/') > -1 ? 'ar/index.html' : 'index.html';
      return caches.match(new URL(home, scope).href).then(function (h) { return h || caches.match(new URL('index.html', scope).href); });
    });
  }));
});
