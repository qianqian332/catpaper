/* 猫咪生活报 · Service Worker — 离线缓存 */
const CACHE = "catpaper-v1";
const ASSETS = [
  "./workbench-mobile.html",
  "./manifest.json",
  "assets/app-icon.jpg",
  "assets/greet-banner.jpg",
  "assets/avatar.jpg"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return resp;
    }).catch(() => caches.match("./workbench-mobile.html")))
  );
});
