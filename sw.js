/* GreenLog service worker: giữ vỏ app để mở nhanh, dữ liệu luôn lấy mới */
const BAN = 'greenlog-v0.2.1';
const VO = ['./', 'index.html', 'css/app.css', 'js/config.js', 'js/api.js', 'js/core.js', 'js/app.js', 'js/m-noibo.js', 'js/m-nghiepvu.js', 'js/m-kehoach.js', 'js/m-quanly.js', 'js/menu.js', 'js/demo-data.json',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/GreenLog_Logo_Ngang.svg'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(BAN).then((c) => c.addAll(VO))); self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== BAN).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  // mạng trước, mất mạng thì dùng bản đã lưu
  e.respondWith(fetch(e.request).then((r) => { const c = r.clone(); caches.open(BAN).then((ca) => ca.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request)));
});
