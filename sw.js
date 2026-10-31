const SURUM = 'cuzdan-34';
const BILDIRIM = 'cuzdan-bildirim';
const EN_ESKI = 2 * 24 * 60 * 60 * 1000;
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
  './taksit.js',
  './birikim.js',
  './piyasa.js',
  './hesap.js',
  './bildirim.js',
  './takvim.js',
  './ses.js',
  './bulut.js',
  './plan.js',
  './defter.js',
  './hareket.js',
  './imza.js',
  './acilis.js',
  './cevirici.js',
  './sesler.js',
  './ses/acilis.mp3',
  './ses/kazanc.mp3',
  './ikon/logo.svg',
  './manifest.webmanifest',
  './ikon/ikon-180.png',
  './ikon/ikon-192.png',
  './ikon/ikon-512.png',
];

self.addEventListener('install', (olay) => {
  // Tarayıcı önbelleğindeki eski dosyalar yeni sürüme karışmasın diye hepsi sunucudan alınır.
  olay.waitUntil(caches.open(SURUM).then((onbellek) => onbellek.addAll(DOSYALAR.map((yol) => new Request(yol, { cache: 'reload' })))));
  self.skipWaiting();
});

self.addEventListener('activate', (olay) => {
  olay.waitUntil(
    caches
      .keys()
      .then((adlar) => Promise.all(adlar.filter((ad) => ad !== SURUM && ad !== BILDIRIM).map((ad) => caches.delete(ad))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (olay) => {
  if (olay.request.method !== 'GET') return;
  const ayni = new URL(olay.request.url).origin === self.location.origin;
  olay.respondWith(
    fetch(ayni ? new Request(olay.request, { cache: 'no-cache' }) : olay.request)
      .then((cevap) => {
        if (cevap.ok && new URL(olay.request.url).origin === self.location.origin) {
          const kopya = cevap.clone();
          caches.open(SURUM).then((onbellek) => onbellek.put(olay.request, kopya));
        }
        return cevap;
      })
      .catch(() => caches.match(olay.request, { ignoreSearch: true })),
  );
});

async function jsonOku(onbellek, ad) {
  const cevap = await onbellek.match(ad);
  return cevap ? cevap.json() : [];
}

// Uygulama kapalıyken telefonun izin verdiği aralıklarla çalışır; plan uygulama açıkken yazılır.
async function hatirlat() {
  const onbellek = await caches.open(BILDIRIM);
  const plan = await jsonOku(onbellek, 'bildirim-plan');
  const gosterilen = await jsonOku(onbellek, 'bildirim-gosterilen');
  const simdi = Date.now();
  const gelen = plan.filter((k) => k.zaman <= simdi && k.zaman > simdi - EN_ESKI && !gosterilen.includes(k.anahtar));
  for (const kalem of gelen) {
    await self.registration.showNotification(kalem.baslik, { body: kalem.metin, tag: kalem.anahtar, icon: 'ikon/ikon-192.png' });
  }
  if (gelen.length) {
    await onbellek.put('bildirim-gosterilen', new Response(JSON.stringify([...gosterilen, ...gelen.map((k) => k.anahtar)].slice(-300))));
  }
}

async function gosterildi(anahtar) {
  const onbellek = await caches.open(BILDIRIM);
  const gosterilen = await jsonOku(onbellek, 'bildirim-gosterilen');
  await onbellek.put('bildirim-gosterilen', new Response(JSON.stringify([...gosterilen, anahtar].slice(-300))));
}

self.addEventListener('push', (olay) => {
  const kalem = olay.data?.json();
  if (!kalem) return;
  olay.waitUntil(
    self.registration
      .showNotification(kalem.baslik, { body: kalem.metin, tag: kalem.anahtar, icon: 'ikon/ikon-192.png' })
      .then(() => gosterildi(kalem.anahtar)),
  );
});

self.addEventListener('periodicsync', (olay) => {
  if (olay.tag === 'cuzdan-hatirlat') olay.waitUntil(hatirlat());
});

self.addEventListener('notificationclick', (olay) => {
  olay.notification.close();
  olay.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((pencereler) => pencereler[0]?.focus() ?? self.clients.openWindow('./')),
  );
});
