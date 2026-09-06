/* 猫咪生活报 · Service Worker — 网络优先，离线兜底 */
const CACHE = "catpaper-v3";
const ASSETS = [
  "./workbench-mobile.html",
  "./manifest.json",
  "./sw.js",
  "assets/icon-2.png",
  "assets/icon-2-192.png",
  "assets/apple-touch-icon.png",
  "assets/greet-banner.jpg",
  "assets/avatar.jpg"
];

// 安装：预缓存 + 立即激活
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// 激活：清除旧缓存 + 立即接管
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// fetch：网络优先（HTML/JS/CSS/JSON），缓存优先（图片）
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const isHTML = url.pathname.endsWith(".html") || url.pathname.endsWith("/") ;
  const isStatic = url.pathname.endsWith(".js") || url.pathname.endsWith(".json") || url.pathname.endsWith(".css");
  
  if (isHTML || isStatic) {
    // 网络优先：先从服务器取最新版
    e.respondWith(
      fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return resp;
      }).catch(() => caches.match(e.request))
    );
  } else {
    // 图片：缓存优先，快
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return resp;
      }))
    );
  }
});
