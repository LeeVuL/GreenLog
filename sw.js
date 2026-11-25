/* GreenLog service worker: giữ vỏ app để mở nhanh, dữ liệu luôn lấy mới */
const BAN = 'greenlog-v0.4.2';
const VO = ['./', 'index.html', 'css/app.css', 'js/config.js', 'js/api.js', 'js/core.js', 'js/icons.js', 'js/icons-v04.js', 'js/v03-nen.js', 'js/app.js', 'js/m-noibo.js', 'js/m-nghiepvu.js', 'js/m-kehoach.js', 'js/m-quanly.js', 'js/v03-viec.js', 'js/v03-them.js', 'js/menu.js', 'css/v04.css', 'js/v04-nen.js', 'js/v04-tongquan.js', 'js/v04-viec.js', 'js/v04-cay.js', 'js/v04-hop.js', 'js/v04-hopdx.js', 'js/v04-khtuan.js', 'js/v04-ngay.js', 'js/v04-ca.js', 'js/v04-nhap.js', 'js/v04-cum.js', 'js/v042-nen.js', 'js/v042-ca.js', 'js/v042-may.js', 'js/v042-xuat.js', 'js/v042-baocao.js', 'js/v042-nguoi.js', 'js/v042-link.js', 'js/v042-huongdan.js', 'l.html', 'js/v04-hoso.js', 'js/v04-daotao.js', 'js/v04-sopmau.js', 'js/v04-racthat.js', 'js/v04-anhdm.js', 'data/anh-thu.json', 'slides/sop-phun-01.html', 'js/lib/jszip.min.js', 'js/v04-baocao.js', 'js/i18n-en.js', 'img/hoso/mvp.svg', 'img/hoso/pqc.svg', 'js/demo-data.json',
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
