/* Service worker cho Tingting.
   Chỉ có một việc: giữ bản sao ba file của app để mở được khi mất mạng.
   Không cache font hay bất kỳ thứ gì từ CDN — app không gọi CDN lúc chạy. */

const TEN_HOM = 'tingting-v6';
const CAC_TEP = [
  './', './index.html', './manifest.webmanifest',
  './apple-touch-icon.png', './icon-192.png', './icon-512.png'
];

/** Cài đặt: tải sẵn các tệp của app vào hòm cache. */
self.addEventListener('install', (sk) => {
  sk.waitUntil(
    caches.open(TEN_HOM).then((hom) => hom.addAll(CAC_TEP)).then(() => self.skipWaiting())
  );
});

/** Kích hoạt: dọn các hòm cache của bản cũ để không ăn chỗ vô ích. */
self.addEventListener('activate', (sk) => {
  sk.waitUntil(
    caches.keys()
      .then((ten) => Promise.all(ten.filter((t) => t !== TEN_HOM).map((t) => caches.delete(t))))
      .then(() => self.clients.claim())
  );
});

/** Lấy tệp: ưu tiên mạng để nhận bản mới, mất mạng thì lấy bản trong hòm.
 *  Chỉ đụng vào yêu cầu GET; các phương thức khác để nguyên cho trình duyệt lo. */
self.addEventListener('fetch', (sk) => {
  if (sk.request.method !== 'GET') return;
  sk.respondWith(
    fetch(sk.request)
      .then((tra) => {
        const ban = tra.clone();
        caches.open(TEN_HOM).then((hom) => hom.put(sk.request, ban)).catch(() => {});
        return tra;
      })
      .catch(() => caches.match(sk.request).then((c) => c || caches.match('./index.html')))
  );
});
