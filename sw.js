const SURUM = 'cuzdan-6';
const DOSYALAR = [
  './',
  './index.html',
  './stil.css',
  './uygulama.js',
  './para.js',
  './donem.js',
  './depo.js',
  './fatura.js',
  './harcama.js',
  './manifest.webmanifest',
  './ikon/ikon-180.png',
  './ikon/ikon-192.png',
  './ikon/ikon-512.png',
];

self.addEventListener('install', (olay) => {
  olay.waitUntil(caches.open(SURUM).then((onbellek) => onbellek.addAll(DOSYALAR)));
  self.skipWaiting();
});

self.addEventListener('activate', (olay) => {
  olay.waitUntil(
    caches
      .keys()
      .then((adlar) => Promise.all(adlar.filter((ad) => ad !== SURUM).map((ad) => caches.delete(ad))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (olay) => {
  if (olay.request.method !== 'GET') return;
  olay.respondWith(
    fetch(olay.request)
      .then((cevap) => {
        if (cevap.ok && new URL(olay.request.url).origin === self.location.origin) {
          const kopya = cevap.clone();
          caches.open(SURUM).then((onbellek) => onbellek.put(olay.request, kopya));
        }
        return cevap;
      })
      .catch(() => caches.match(olay.request)),
  );
});
