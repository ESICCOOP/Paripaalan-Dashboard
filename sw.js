// Paripaalan Dashboard app worker. Keeps the app's own small files
// (this page, icons) so the app opens even on a weak connection; the
// staff data itself always comes live from the Google dashboard and is
// never stored here. Change VERSION after editing any file here.
var VERSION = "pd-app-1";
var FILES = ["./", "index.html", "app-config.js", "manifest.webmanifest",
             "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png",
             "icons/apple-touch-icon.png", "icons/emblem.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Own files only: newest from the network, the kept copy when offline.
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(fetch(req).then(function (res) {
    var copy = res.clone();
    caches.open(VERSION).then(function (c) { c.put(req, copy); });
    return res;
  }).catch(function () {
    return caches.match(req).then(function (hit) { return hit || caches.match("./"); });
  }));
});
