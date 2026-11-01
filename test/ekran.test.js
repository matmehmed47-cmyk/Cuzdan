import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { bugunTR, donemBul, ilkAyar } from '../donem.js';

async function uygulamaAc(baslangic, hazirla) {
  const dom = new JSDOM('<!doctype html><main id="uygulama"></main>', { url: 'https://ornek.test/cuzdan/' });
  const { window } = dom;
  if (baslangic) window.localStorage.setItem('cuzdan.v1', baslangic);
  window.confirm = () => true;
  window.scrollTo = () => {};
  hazirla?.(window);
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.localStorage = window.localStorage;
  await import(`../uygulama.js?${Math.random()}`);
  return window;
}

function gonder(window, form) {
  form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
}

const metin = (window) => {
  const yazi = window.document.getElementById('uygulama').textContent;
  assert.doesNotMatch(yazi, /\[object |null|undefined/);
  return yazi;
};

test('kayıtlı fatura: bu dönemde olmayan ödeme tutar sorularak erken ödenir ve geri alınır', async () => {
  const bugun = bugunTR();
  const donem = donemBul(ilkAyar(15), bugun);
  const ay = (d) => d.slice(0, 7);
  const ilkAy = ay(new Date(Date.parse(donem.bitis) + 86400000 * 32).toISOString());
  const baslangic = JSON.stringify({
    surum: 1,
    ad: 'Ev',
    ayar: ilkAyar(15),
    faturalar: [{ id: 'a', ad: 'Su', tur: 'sabit', gun: 10, kurus: 30000, ilkAy }],
    donemler: { [donem.baslangic]: { para: 100000, hareketler: [] } },
  });
  const window = await uygulamaAc(baslangic);
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);

  dugme('Ödemeler').click();
  assert.match(metin(window), /Bu dönem ödemesi olan fatura yok/);
  assert.match(metin(window), /Sıradaki:/);
  dugme('✓ Ödedim').click();
  assert.match(metin(window), /ödemesi için ne kadar ödedin/);
  assert.match(document.getElementById('tutar').value, /^300,00/);
  gonder(window, document.querySelector('form'));

  assert.match(metin(window), /✓ Ödendi/);
  assert.equal(JSON.parse(window.localStorage.getItem('cuzdan.v1')).donemler[donem.baslangic].hareketler[0].ay, ilkAy);
  dugme('Geri al').click();
  assert.equal(JSON.parse(window.localStorage.getItem('cuzdan.v1')).donemler[donem.baslangic].hareketler.length, 0);
});

test('taksit: sıradaki ödeme bu dönemde olmasa da erken ödenir', async () => {
  const bugun = bugunTR();
  const ayar = ilkAyar(15);
  const donem = donemBul(ayar, bugun);
  const ilkAy = new Date(Date.parse(donem.bitis) + 86400000 * 32).toISOString().slice(0, 7);
  const window = await uygulamaAc(JSON.stringify({
    surum: 1,
    ad: 'Ev',
    ayar,
    taksitler: [{ id: 't', ad: 'Tablet', tur: 'sabit', toplam: 2000000, sayi: 4, gun: 1, ilkAy }],
    donemler: { [donem.baslangic]: { para: 1000000, hareketler: [] } },
  }));
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);

  dugme('Ödemeler').click();
  dugme('Taksitler').click();
  dugme('✓ Ödedim').click();
  assert.match(metin(window), /ödemesi için ne kadar ödedin/);
  gonder(window, document.querySelector('form'));

  const [hareket] = JSON.parse(window.localStorage.getItem('cuzdan.v1')).donemler[donem.baslangic].hareketler;
  assert.equal(hareket.ay, ilkAy);
  assert.equal(hareket.kurus, 500000);
  assert.match(metin(window), /1\/4/);
});

test('çan: basınca fatura hatırlatmadan çıkar, yeniden basınca döner', async () => {
  const ayar = ilkAyar(15);
  const { baslangic } = donemBul(ayar, bugunTR());
  const window = await uygulamaAc(JSON.stringify({
    surum: 1,
    ad: 'Ev',
    ayar,
    bildirim: { gunOnce: 3, saat: '09:00', maas: true, gunSonu: false, gunSonuSaat: '21:00', telefon: true },
    faturalar: [{ id: 'a', ad: 'Su', tur: 'sabit', gun: 10, kurus: 30000, ilkAy: '2026-12' }],
    donemler: { [baslangic]: { para: 100000, hareketler: [] } },
  }));
  const { document } = window;
  const kayit = () => JSON.parse(window.localStorage.getItem('cuzdan.v1')).faturalar[0];
  const zil = () => document.querySelector('.zil');

  [...document.querySelectorAll('button')].find((d) => d.textContent === 'Ödemeler').click();
  assert.equal(zil().getAttribute('aria-pressed'), 'true');
  zil().click();
  await new Promise((bitti) => { setTimeout(bitti, 0); });
  assert.equal(kayit().bildirimKapali, true);
  assert.equal(zil().getAttribute('aria-pressed'), 'false');
  zil().click();
  await new Promise((bitti) => { setTimeout(bitti, 0); });
  assert.equal(kayit().bildirimKapali, undefined);
  assert.equal(zil().getAttribute('aria-pressed'), 'true');
});

test('bildirimi kontrol et: hesap yoksa nerede takıldığını söyler', async (t) => {
  const ayar = ilkAyar(15);
  const { baslangic } = donemBul(ayar, bugunTR());
  Object.defineProperty(globalThis.navigator, 'serviceWorker', { configurable: true, value: { register: async () => ({}) } });
  t.after(() => { delete globalThis.navigator.serviceWorker; });
  const window = await uygulamaAc(JSON.stringify({
    surum: 1,
    ad: 'Ev',
    ayar,
    bildirim: { gunOnce: 3, saat: '09:00', maas: true, gunSonu: false, gunSonuSaat: '21:00', telefon: true },
    donemler: { [baslangic]: { para: 100000, hareketler: [] } },
  }), (w) => { w.Notification = { permission: 'granted' }; });
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);

  document.querySelector('[aria-label="Ayarlar"]').click();
  dugme('Hatırlatma ayarları').click();
  dugme('Bildirimi kontrol et').click();
  await new Promise((bitti) => { setTimeout(bitti, 0); });
  assert.match(metin(window), /✓ Bildirim izni var/);
  assert.match(metin(window), /✗ Hesap yok/);
});

test('ilk kurulum: ad, maaş günü ve para ile ana ekrana gelir', async () => {
  const window = await uygulamaAc();
  const { document } = window;

  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Cüzdanına bir ad yaz/);

  document.getElementById('ad').value = 'Ev Bütçesi <b>';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Adım 2/);

  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Maaş gününü seç/);
  document.getElementById('gun').value = '15';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Adım 3/);

  document.getElementById('para').value = 'yanlış';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Tutarı örnekteki gibi yaz/);

  document.getElementById('para').value = '25.000,50';
  gonder(window, document.querySelector('form'));

  assert.equal(document.getElementById('ana-para').textContent, '25.000,50 TL');
  assert.equal(document.querySelector('h1').textContent, 'Ev Bütçesi <b>');
  assert.equal(document.querySelector('h1 b'), null);

  const kayit = JSON.parse(window.localStorage.getItem('cuzdan.v1'));
  assert.equal(kayit.ad, 'Ev Bütçesi <b>');
  assert.equal(Object.values(kayit.donemler)[0].para, 2500050);
});

test('kayıt varsa ana ekran açılır ve ad değiştirilebilir', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 100000 } } }));
  const { document } = window;

  assert.equal(document.getElementById('ana-para').textContent, '1.000,00 TL');
  assert.doesNotMatch(metin(window), /null|undefined/);
  [...document.querySelectorAll('button')].find((d) => d.textContent === 'Ödemeler').click();
  assert.doesNotMatch(metin(window), /null|undefined/);
  [...document.querySelectorAll('button')].find((d) => d.textContent === 'Ana sayfa').click();
  [...document.querySelectorAll('button')].find((d) => d.textContent === 'Harcamalar').click();
  assert.doesNotMatch(metin(window), /null|undefined/);
  [...document.querySelectorAll('button')].find((d) => d.textContent === 'Ana sayfa').click();
  document.querySelector('[aria-label="Ayarlar"]').click();
  assert.match(metin(window), /Normal maaş günü: ayın 15/);
  assert.match(metin(window), /Hesap açarsan veriler telefon değişince kaybolmaz/);

  [...document.querySelectorAll('button')].find((d) => d.textContent.startsWith('Adını')).click();
  document.getElementById('ad').value = 'Yeni Ad';
  gonder(window, document.querySelector('form'));
  assert.equal(JSON.parse(window.localStorage.getItem('cuzdan.v1')).ad, 'Yeni Ad');
});

test('yeni dönemde para sorulur, eski dönem kaydı silinmez', async () => {
  const ayar = ilkAyar(15);
  const eski = { '2000-01-15': { para: 500 } };
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: eski }));
  const { document } = window;

  assert.match(metin(window), /Yeni ay, temiz sayfa/);
  assert.match(metin(window), /Geçen dönemden devreden: 5,00 TL/);
  assert.equal(document.getElementById('para').value, '5,00 TL');
  document.getElementById('para').value = '1.000';
  gonder(window, document.querySelector('form'));

  const kayit = JSON.parse(window.localStorage.getItem('cuzdan.v1'));
  assert.equal(kayit.donemler['2000-01-15'].para, 500);
  assert.equal(document.getElementById('ana-para').textContent, '1.000,00 TL');
});

test('bozuk veri silinmez, kullanıcı uyarılır', async () => {
  const window = await uygulamaAc('bozuk veri');
  assert.match(metin(window), /Hiçbir şey silinmedi/);
  assert.equal(window.localStorage.getItem('cuzdan.v1'), 'bozuk veri');
});

test('veri silme iki onayla kuruluma döner', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 100 } } }));
  const { document } = window;
  let onay = 0;
  window.confirm = () => { onay += 1; return true; };

  document.querySelector('[aria-label="Ayarlar"]').click();
  document.querySelector('button.tehlike').click();
  assert.equal(onay, 2);
  assert.equal(window.localStorage.getItem('cuzdan.v1'), null);
  assert.match(metin(window), /Adım 1/);
});

test('harcama ve gelir parayı değiştirir, düzeltme geçmişi korur', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { '2000-01-15': { para: 500 }, [baslangic]: { para: 100000, hareketler: [] } } }));
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);

  dugme('+ Harcama').click();
  document.getElementById('tutar').value = '0';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Sıfırdan büyük/);
  document.getElementById('tutar').value = '100';
  gonder(window, document.querySelector('form'));
  assert.equal(document.getElementById('ana-para').textContent, '900,00 TL');

  dugme('+ Gelir').click();
  document.getElementById('tutar').value = '50,50';
  gonder(window, document.querySelector('form'));
  assert.equal(document.getElementById('ana-para').textContent, '950,50 TL');

  dugme('Toplam parayı düzelt').click();
  document.getElementById('para').value = '800';
  gonder(window, document.querySelector('form'));
  assert.equal(document.getElementById('ana-para').textContent, '800,00 TL');
  const kayit = JSON.parse(window.localStorage.getItem('cuzdan.v1'));
  assert.equal(kayit.donemler[baslangic].hareketler.length, 3);
  assert.equal(kayit.donemler[baslangic].hareketler[2].kategori, 'Kayıtsız');
  assert.equal(kayit.donemler[baslangic].hareketler[2].kurus, 15050);

  dugme('Toplam parayı düzelt').click();
  document.getElementById('para').value = '700';
  document.getElementById('kayitsiz').checked = false;
  gonder(window, document.querySelector('form'));
  assert.equal(document.getElementById('ana-para').textContent, '700,00 TL');
  assert.equal(JSON.parse(window.localStorage.getItem('cuzdan.v1')).donemler[baslangic].hareketler.length, 3);

  dugme('Geçmiş dönemler').click();
  assert.match(metin(window), /2000 dönemi/);
  assert.doesNotMatch(metin(window), /2026 dönemi/);
});

test('fatura eklenir, serbest para azalır, ödenince geri alınabilir', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 100000, hareketler: [] } } }));
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);

  assert.match(metin(window), /Henüz ödeme eklemedin/);
  dugme('Ödemeler').click();
  dugme('+ Fatura ekle').click();

  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Faturaya bir ad yaz/);
  document.getElementById('ad').value = 'İnternet';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Ödeme gününü seç/);
  const gun = document.getElementById('gun');
  gun.value = bugunTR().slice(8).replace(/^0/, '');
  gun.dispatchEvent(new window.Event('change'));
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Sabit fatura için tutar yaz/);
  document.getElementById('tutar').value = '300';
  gonder(window, document.querySelector('form'));

  const eklenen = JSON.parse(window.localStorage.getItem('cuzdan.v1'));
  assert.equal(eklenen.faturalar.length, 1);
  assert.equal(eklenen.faturalar[0].kurus, 30000);
  assert.equal(document.querySelectorAll('.zil').length, 2);

  dugme('✓ Ödedim').click();
  assert.match(metin(window), /✓ Ödendi/);
  assert.equal(JSON.parse(window.localStorage.getItem('cuzdan.v1')).donemler[baslangic].hareketler[0].kurus, 30000);

  dugme('Geri al').click();
  assert.match(metin(window), /Bugün/);
  assert.equal(JSON.parse(window.localStorage.getItem('cuzdan.v1')).donemler[baslangic].hareketler.length, 0);

  dugme('Ana sayfa').click();
  assert.equal(document.getElementById('ana-para').textContent, '700,00 TL');
  assert.match(metin(window), /Ödemelere ayrıldı300,00 TL/);
  assert.match(metin(window), /Toplam para1\.000,00 TL/);
});

test('değişken fatura ödenirken tutar sorulur, Geçmiş\'te görünür', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const gun = Number(bugunTR().slice(8));
  const faturalar = [{ id: 'x', ad: 'Elektrik', tur: 'degisken', gun, ilkAy: bugunTR().slice(0, 7) }];
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, faturalar, donemler: { '2000-01-15': { para: 500, hareketler: [{ tur: 'fatura', kurus: 100, tarih: '2000-01-20', faturaId: 'x', ay: '2000-01', ad: 'Eski' }] }, [baslangic]: { para: 100000, hareketler: [] } } }));
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);

  assert.match(metin(window), /1 ödemenin tutarı henüz belli değil/);
  dugme('✓ Ödedim').click();
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Sıfırdan büyük/);
  document.getElementById('tutar').value = '250';
  gonder(window, document.querySelector('form'));
  assert.equal(document.getElementById('ana-para').textContent, '750,00 TL');
  assert.match(metin(window), /Bu dönem bekleyen ödeme yok/);

  dugme('Geçmiş dönemler').click();
  assert.match(metin(window), /✓ Eski: 1,00 TL/);
});

test('harcama kategori ve notla eklenir, düzeltilir, silinir', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const eski = { tur: 'harcama', kurus: 100, tarih: '2000-01-20', kategori: 'Market' };
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { '2000-01-15': { para: 500, hareketler: [eski] }, [baslangic]: { para: 100000, hareketler: [] } } }));
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);
  const kayitlar = () => JSON.parse(window.localStorage.getItem('cuzdan.v1')).donemler[baslangic].hareketler;

  dugme('+ Harcama').click();
  dugme('Market').click();
  assert.equal(dugme('Market').getAttribute('aria-pressed'), 'true');
  document.getElementById('tutar').value = '100';
  document.getElementById('not').value = '2 kilo elma';
  document.getElementById('tarih').value = '1999-01-01';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /bugün arasında olmalı/);
  document.getElementById('tarih').value = bugunTR();
  gonder(window, document.querySelector('form'));
  assert.equal(document.getElementById('ana-para').textContent, '900,00 TL');
  assert.equal(kayitlar()[0].kategori, 'Market');
  assert.equal(kayitlar()[0].not, '2 kilo elma');

  dugme('+ Harcama').click();
  document.getElementById('tutar').value = '50';
  dugme('+ Yeni kategori').click();
  assert.equal(document.getElementById('yeni-kategori').hidden, false);
  document.getElementById('yeni-kategori').value = 'Kırtasiye';
  gonder(window, document.querySelector('form'));
  assert.equal(kayitlar()[1].kategori, 'Kırtasiye');

  dugme('+ Harcama').click();
  assert.ok(dugme('Kırtasiye'));
  assert.equal(dugme('Market').compareDocumentPosition(dugme('Yemek')) & window.Node.DOCUMENT_POSITION_FOLLOWING, window.Node.DOCUMENT_POSITION_FOLLOWING);
  document.querySelector('[aria-label="Geri"]').click();

  dugme('Harcamalar').click();
  assert.match(metin(window), /2 kilo elma/);
  assert.match(metin(window), /Market100,00 TL/);
  assert.match(metin(window), /150,00 TL/);

  [...document.querySelectorAll('button')].filter((d) => d.textContent === 'Düzenle').at(-1).click();
  assert.equal(document.getElementById('tutar').value, '100,00 TL');
  document.getElementById('tutar').value = '120';
  gonder(window, document.querySelector('form'));
  assert.equal(kayitlar()[0].kurus, 12000);
  assert.equal(kayitlar()[0].not, '2 kilo elma');

  [...document.querySelectorAll('button')].filter((d) => d.textContent === 'Düzenle').at(-1).click();
  dugme('Harcamayı sil').click();
  assert.equal(kayitlar().length, 1);

  [...document.querySelectorAll('button')].find((d) => d.textContent === 'Ana sayfa').click();
  assert.equal(document.getElementById('ana-para').textContent, '950,00 TL');

  dugme('Geçmiş dönemler').click();
  dugme('Harcamaları gör').click();
  assert.match(metin(window), /Market1,00 TL/);
  assert.equal(dugme('Düzenle'), undefined);
  assert.equal(dugme('+ Harcama'), undefined);
});

test('kategoriler ekranı: ekle, ad değiştir, sil', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 1000, hareketler: [{ tur: 'harcama', kurus: 100, tarih: bugunTR(), kategori: 'Market' }] } } }));
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);
  const kayit = () => JSON.parse(window.localStorage.getItem('cuzdan.v1'));

  dugme('Harcamalar').click();
  dugme('Kategorileri düzenle').click();
  document.getElementById('ad').value = 'Kırtasiye';
  gonder(window, document.querySelector('form'));
  assert.equal(kayit().kategoriler.at(-1), 'Kırtasiye');

  const satirDugmesi = (ad, yazi) => [...document.querySelectorAll('.kalem')]
    .find((k) => k.querySelector('.satir span').textContent === ad)
    .querySelector(`button.${yazi}`);
  satirDugmesi('Market', 'ikincil').click();
  document.getElementById('ad').value = 'Bakkal';
  gonder(window, document.querySelector('form'));
  assert.equal(kayit().donemler[baslangic].hareketler[0].kategori, 'Bakkal');

  satirDugmesi('Bakkal', 'tehlike').click();
  assert.equal(kayit().kategoriler.includes('Bakkal'), false);
  assert.equal(kayit().donemler[baslangic].hareketler[0].kategori, 'Bakkal');
});

test('ortak ev: buradan yazılır, ana paradan düşer, geri alınır, Geçmiş\'te kalır', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const eski = { tur: 'harcama', kurus: 2000, tarih: '2000-01-20', not: 'Eski sabun', ortak: true };
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { '2000-01-15': { para: 5000, hareketler: [eski] }, [baslangic]: { para: 100000, hareketler: [] } } }));
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);
  const kayit = () => JSON.parse(window.localStorage.getItem('cuzdan.v1'));

  dugme('Ortak ev').click();
  assert.match(metin(window), /Henüz ortak harcama yok/);
  assert.doesNotMatch(metin(window), /null|undefined/);
  assert.doesNotMatch(metin(window), /Eski sabun/);

  dugme('+ Ortak harcama').click();
  assert.equal(document.getElementById('ortak').checked, true);
  assert.equal(dugme('Ev').getAttribute('aria-pressed'), 'true');
  assert.equal(document.getElementById('not').placeholder, 'Örnek: Çamaşır suyu');
  document.getElementById('tutar').value = '300';
  document.getElementById('not').value = 'Çamaşır suyu';
  gonder(window, document.querySelector('form'));
  assert.equal(document.getElementById('ortak-toplam').textContent, '300,00 TL');
  assert.match(metin(window), /Çamaşır suyu300,00 TL/);

  const secici = document.getElementById('ortak-kisi');
  secici.value = '3';
  secici.dispatchEvent(new window.Event('change'));
  assert.equal(kayit().ortakKisi, 3);
  assert.match(metin(window), /Kişi başı \(3 kişi\)100,00 TL/);

  dugme('Geri aldım').click();
  document.getElementById('tutar').value = '100';
  document.getElementById('not').value = 'Ali';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Sende kalan masraf200,00 TL/);
  assert.match(metin(window), /Ali100,00 TL/);

  dugme('Düzenle').click();
  assert.equal(document.getElementById('ortak').checked, true);
  document.getElementById('ortak').checked = false;
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Henüz ortak harcama yok/);
  dugme('Sil').click();
  assert.equal(kayit().donemler[baslangic].hareketler.length, 1);

  document.querySelector('[aria-label="Geri"]').click();
  assert.equal(document.getElementById('ana-para').textContent, '700,00 TL');

  dugme('+ Harcama').click();
  document.getElementById('tutar').value = '50';
  document.getElementById('ortak').checked = true;
  gonder(window, document.querySelector('form'));
  assert.equal(kayit().donemler[baslangic].hareketler[1].ortak, true);

  dugme('Geçmiş dönemler').click();
  dugme('Ortak ev listesini gör').click();
  assert.match(metin(window), /Eski sabun/);
  assert.equal(dugme('+ Ortak harcama'), undefined);
  assert.equal(dugme('Düzenle'), undefined);
  assert.equal(document.getElementById('ortak-kisi'), null);
});

test('ek gelir kaynak ve notla eklenir, düzeltilir, silinir, Geçmiş\'te kalır', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const eski = { tur: 'gelir', kurus: 700, tarih: '2000-01-20', kaynak: 'Hediye' };
  const ortak = { tur: 'gelir', kurus: 300, tarih: bugunTR(), ortak: true };
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { '2000-01-15': { para: 500, hareketler: [eski] }, [baslangic]: { para: 100000, hareketler: [ortak] } } }));
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);
  const kayitlar = () => JSON.parse(window.localStorage.getItem('cuzdan.v1')).donemler[baslangic].hareketler;

  dugme('+ Gelir').click();
  document.getElementById('tutar').value = '2.000';
  dugme('Ek ders').click();
  document.getElementById('not').value = '3 saat';
  gonder(window, document.querySelector('form'));
  assert.equal(document.getElementById('ana-para').textContent, '3.003,00 TL');
  assert.equal(kayitlar()[1].kaynak, 'Ek ders');

  dugme('+ Gelir').click();
  document.getElementById('tutar').value = '100';
  dugme('+ Yeni kaynak').click();
  document.getElementById('yeni-kaynak').value = 'Kermes';
  gonder(window, document.querySelector('form'));
  assert.equal(JSON.parse(window.localStorage.getItem('cuzdan.v1')).kaynaklar.at(-1), 'Kermes');

  dugme('Gelirler').click();
  assert.doesNotMatch(metin(window), /null|undefined/);
  assert.match(metin(window), /Ek gelir2\.100,00 TL/);
  assert.match(metin(window), /Toplam3\.100,00 TL/);
  assert.match(metin(window), /3 saat/);

  [...document.querySelectorAll('button')].filter((d) => d.textContent === 'Düzenle').at(-1).click();
  document.getElementById('tutar').value = '1.000';
  gonder(window, document.querySelector('form'));
  assert.equal(kayitlar()[1].kurus, 100000);
  assert.equal(kayitlar()[1].tur, 'gelir');
  assert.equal(kayitlar()[1].not, '3 saat');

  [...document.querySelectorAll('button')].filter((d) => d.textContent === 'Düzenle').at(-1).click();
  dugme('Geliri sil').click();
  assert.equal(kayitlar().length, 2);

  document.querySelector('[aria-label="Geri"]').click();
  dugme('Geçmiş dönemler').click();
  dugme('Gelirleri gör').click();
  assert.match(metin(window), /Hediye7,00 TL/);
  assert.equal(dugme('Düzenle'), undefined);
  assert.equal(dugme('+ Gelir'), undefined);
});

test('taksit eklenir, ayrılır, ödenir, geri alınır, biter', async () => {
  const ayar = ilkAyar(15);
  const bugun = bugunTR();
  const baslangic = donemBul(ayar, bugun).baslangic;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 3000000, hareketler: [] } } }));
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);
  const kayit = () => JSON.parse(window.localStorage.getItem('cuzdan.v1'));

  dugme('Ödemeler').click();
  dugme('Taksitler').click();
  assert.doesNotMatch(metin(window), /null|undefined/);
  dugme('+ Taksit ekle').click();
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Ne aldığını yaz/);
  document.getElementById('ad').value = 'Tablet';
  document.getElementById('toplam').value = '10.000';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /taksit sayısını yaz/);
  document.getElementById('sayi').value = '2';
  document.getElementById('gun').value = String(Number(bugun.slice(8)));
  gonder(window, document.querySelector('form'));

  assert.equal(kayit().taksitler[0].toplam, 1000000);
  assert.match(metin(window), /Tablet0\/2/);
  assert.match(metin(window), /Kalan10\.000,00 TL/);
  assert.match(metin(window), /Önümüzdeki aylar/);
  assert.doesNotMatch(metin(window), /null|undefined/);

  dugme('✓ Ödedim').click();
  assert.equal(document.getElementById('tutar').value, '5.000,00 TL');
  document.getElementById('tutar').value = '20.000';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Daha fazlası yazılamaz/);
  document.getElementById('tutar').value = '4.000';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Tablet1\/2/);
  assert.match(metin(window), /Kalan6\.000,00 TL/);
  assert.equal(kayit().donemler[baslangic].hareketler[0].tur, 'taksit');

  dugme('Geçmiş ve düzenle').click();
  dugme('Geri al').click();
  assert.equal(kayit().donemler[baslangic].hareketler.length, 0);
  assert.match(metin(window), /Henüz ödeme yok/);
  dugme('Taksiti düzenle').click();
  document.getElementById('onceki').value = '10.000';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /toplamdan az olmalı/);
  dugme('Taksiti sil').click();
  assert.equal(kayit().taksitler.length, 0);
});

test('para eksiye düşerse açıkça yazar', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 100, hareketler: [{ tur: 'harcama', kurus: 300, tarih: baslangic }] } } }));
  assert.match(metin(window), /2,00 TL eksidesin/);
});

function fiyatCevabi(adres) {
  const govde = adres.endsWith('tcmb.json')
    ? { tarih: '2026-10-30', USD: { alis: 40, satis: 41 }, EUR: { alis: 50, satis: 51 } }
    : {
        Update_Date: `${bugunTR()} 10:52:01`,
        USD: { Buying: 42, Selling: 43, Change: 0.07 },
        EUR: { Buying: 52, Selling: 53, Change: -0.26 },
        GRA: { Buying: 6000, Selling: 6100, Change: -3.5 },
        CEYREKALTIN: { Buying: 10000, Selling: 10200, Change: 0 },
        ONS: { Buying: 0, Selling: 0, Change: 1 },
      };
  return { ok: true, json: async () => govde };
}

test('birikim eklenir, paradan düşer, harcama sayılmaz, satılır, silinir', async () => {
  const ayar = ilkAyar(15);
  const bugun = bugunTR();
  const baslangic = donemBul(ayar, bugun).baslangic;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 5000000 } } }), (w) => {
    w.fetch = async (adres) => fiyatCevabi(adres);
  });
  await new Promise((bitti) => setTimeout(bitti, 20));
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);
  const kayit = () => JSON.parse(window.localStorage.getItem('cuzdan.v1'));

  dugme('Birikim').click();
  dugme('+ Birikim ekle').click();
  document.getElementById('miktar').value = '2,5';
  document.getElementById('tutar').value = '15.000';
  gonder(window, document.querySelector('form'));
  assert.equal(kayit().birikimler[0].miktar, 2500);
  assert.match(metin(window), /2,5 gram/);
  assert.match(metin(window), /15\.000,00 TL/);

  document.querySelector('[aria-label="Geri"]').click();
  assert.equal(document.getElementById('birikim-deger').textContent, '15.000,00 TL');
  dugme('Ana sayfa').click();
  assert.equal(document.getElementById('ana-para').textContent, '35.000,00 TL');
  assert.match(metin(window), /Piyasa kapalı|Güncel/);
  dugme('Harcamalar').click();
  assert.match(metin(window), /Bu dönem0,00 TL/);

  dugme('Birikim').click();
  [...document.querySelectorAll('button.varlik')][0].click();
  dugme('Sattım').click();
  document.getElementById('miktar').value = '3';
  document.getElementById('tutar').value = '20.000';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Daha fazlası satılamaz/);
  document.getElementById('miktar').value = '1';
  document.getElementById('tutar').value = '6.000';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /1,5 gram/);
  assert.match(metin(window), /yılında 2,5 gram aldın, 1 gram sattın/);

  const sil = (ad) => [...document.querySelectorAll('.kalem')].find((k) => k.textContent.startsWith(ad)).querySelector('button').click();
  sil('AAlış');
  assert.match(metin(window), /sonrasında satış kaydı var/);
  sil('SSatış');
  sil('AAlış');
  assert.deepEqual(kayit().birikimler, []);
  assert.deepEqual(kayit().donemler[baslangic].hareketler, []);
});

test('eski birikim paradan düşmez, çeyrek küsuratlı yazılamaz', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 100000 } } }));
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);

  dugme('Birikim').click();
  dugme('+ Birikim ekle').click();
  dugme('Çeyrek altın').click();
  assert.match(metin(window), /Kaç adet/);
  document.getElementById('miktar').value = '1,5';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Adet tam sayı/);
  document.getElementById('miktar').value = '2';
  document.getElementById('eski').click();
  document.getElementById('tarih').value = '2024-03-01';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Mart 2024/);
  assert.match(metin(window), /Paradan düşmedi/);
  document.querySelector('[aria-label="Geri"]').click();
  dugme('Ana sayfa').click();
  assert.equal(document.getElementById('ana-para').textContent, '1.000,00 TL');
});

test('piyasa fiyatları gösterilir, kaynak bozulunca son fiyat kalır', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  let bozuk = false;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 100 } } }), (w) => {
    w.fetch = async (adres) => {
      if (bozuk && !adres.endsWith('tcmb.json')) throw new Error('bağlantı yok');
      return fiyatCevabi(adres);
    };
  });
  await new Promise((bitti) => setTimeout(bitti, 20));
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);

  assert.match(metin(window), /43,0000/);
  dugme('Piyasa').click();
  assert.match(metin(window), /6\.100,00 TL/);
  assert.match(metin(window), /Alış: 6\.000,00/);
  assert.match(metin(window), /▼ %3,50/);
  assert.match(metin(window), /Merkez Bankası kuru/);
  assert.match(metin(window), /41,0000 TL/);
  assert.match(metin(window), /Yaklaşık fiyat/);
  assert.doesNotMatch(metin(window), /ONS/);

  bozuk = true;
  dugme('Yenile').click();
  await new Promise((bitti) => setTimeout(bitti, 20));
  assert.match(metin(window), /son bilinen fiyat/);
  assert.match(metin(window), /6\.100,00 TL/);
});

test('çevirici: iki yönde alış-satışla hesaplar, serbest parayı getirir, yazarken bozulmaz', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 2150000 } } }), (w) => {
    w.fetch = async (adres) => fiyatCevabi(adres);
  });
  await new Promise((bitti) => setTimeout(bitti, 20));
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);
  const kutu = () => document.getElementById('cevirici-miktar');
  const sonuc = () => document.getElementById('cevirici-sonuc')?.textContent;
  const yaz = (deger) => {
    kutu().value = deger;
    kutu().dispatchEvent(new window.Event('input', { bubbles: true }));
  };

  dugme('Piyasa').click();
  yaz('100');
  assert.equal(sonuc(), '4.200,00 TL');
  assert.match(metin(window), /100,00 dolar bozdurursan/);
  assert.match(metin(window), /100,00 dolar almak için gereken: 4\.300,00 TL/);
  assert.match(metin(window), /Dolar: alış 42,0000 · satış 43,0000/);
  assert.match(metin(window), /ekran fiyatı/);

  document.querySelector('[aria-label="Yönü değiştir"]').click();
  assert.equal(sonuc(), '2,33 dolar');
  assert.equal(kutu().value, '100');
  assert.match(metin(window), /100,00 TL ile alırsın/);

  yaz('yanlış');
  assert.match(metin(window), /Tutarı örnekteki gibi yaz/);
  assert.equal(sonuc(), undefined);

  dugme('Serbest param').click();
  assert.equal(kutu().value, '21.500,00 TL');
  assert.equal(sonuc(), '500,00 dolar');
  assert.match(metin(window), /2 adet/);
  assert.match(metin(window), /Fiyat yok/);

  document.getElementById('cevirici-hedef').value = 'GRA';
  document.getElementById('cevirici-hedef').dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.match(metin(window), /işçiliği tam yansıtmaz/);
});

test('hesap makinesi: ekran, son işlemler, harcamaya aktarma, formu bozmadan aktarma', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 100000 } } }));
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);
  const bas = (tuslar) => [...tuslar].forEach((t) => document.querySelector(`[data-tus="${t}"]`).click());
  const sonuc = () => document.getElementById('hesap-sonuc').textContent;

  dugme('Hesap makinesi').click();
  assert.equal(sonuc(), '0');
  assert.equal(dugme('Harcamaya aktar').disabled, true);
  bas('5÷0');
  assert.equal(sonuc(), 'Sıfıra bölünemez');
  assert.equal(dugme('Harcamaya aktar').disabled, true);
  bas('C3×45=');
  assert.equal(sonuc(), '135');
  assert.match(metin(window), /3 × 45/);

  dugme('Harcamaya aktar').click();
  assert.equal(document.getElementById('tutar').value, '135,00 TL');
  document.querySelector('details').open = true;
  dugme('Market').click();
  document.getElementById('not').value = 'Domates';
  document.querySelector('[aria-label="Hesap makinesi"]').click();
  bas('2×50=');
  dugme('Tutara aktar').click();
  assert.equal(document.querySelector('.hesap-perde'), null);
  assert.equal(document.getElementById('tutar').value, '100,00 TL');
  assert.equal(document.getElementById('not').value, 'Domates');
  gonder(window, document.querySelector('form'));

  const kayit = JSON.parse(window.localStorage.getItem('cuzdan.v1'));
  assert.deepEqual(
    [kayit.donemler[baslangic].hareketler[0].kurus, kayit.donemler[baslangic].hareketler[0].kategori],
    [10000, 'Market'],
  );
  assert.equal(document.getElementById('ana-para').textContent, '900,00 TL');
});

test('hatırlatma kartı ana ekranda çıkar, Tamam deyince kaybolur, ayarlar kaydolur', async () => {
  const ayar = ilkAyar(15);
  const bugun = bugunTR();
  const baslangic = donemBul(ayar, bugun).baslangic;
  const window = await uygulamaAc(JSON.stringify({
    surum: 1,
    ad: 'Ev',
    ayar,
    bildirim: { gunOnce: 0, saat: '00:00', maas: false, gunSonu: true, gunSonuSaat: '00:00' },
    donemler: { [baslangic]: { para: 100000 } },
  }));
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);
  const kayit = () => JSON.parse(window.localStorage.getItem('cuzdan.v1'));

  assert.match(metin(window), /Bugünkü harcamaları girdin mi/);
  dugme('Tamam').click();
  assert.doesNotMatch(metin(window), /Bugünkü harcamaları girdin mi/);

  document.querySelector('[aria-label="Ayarlar"]').click();
  dugme('Hatırlatma ayarları').click();
  assert.match(metin(window), /Bu cihaz telefon bildirimini desteklemiyor/);
  document.getElementById('gun-once').value = '5';
  document.getElementById('saat').value = '10:30';
  document.getElementById('alt-sinir').value = 'yanlış';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Sıfırdan büyük bir tutar/);
  document.getElementById('alt-sinir').value = '1.000';
  gonder(window, document.querySelector('form'));
  assert.equal(kayit().bildirim.gunOnce, 5);
  assert.equal(kayit().bildirim.saat, '10:30');
  assert.equal(kayit().bildirim.altSinir, 100000);
});

test('hatırlatma ayarı yoksa da açılır', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 100 } } }));
  assert.match(metin(window), /Serbest para/);
});

test('N bölümü: takvim, hedef, köşe, kredi kartı, sesli giriş, geçmiş grafiği', async () => {
  const ayar = ilkAyar(15);
  const bugun = bugunTR();
  const baslangic = donemBul(ayar, bugun).baslangic;
  let tanima;
  const window = await uygulamaAc(JSON.stringify({
    surum: 1,
    ad: 'Ev',
    ayar,
    donemler: {
      '2000-01-15': { para: 500, hareketler: [{ tur: 'harcama', kurus: 200, tarih: '2000-01-16' }] },
      [baslangic]: { para: 100000, hareketler: [{ tur: 'harcama', kurus: 30000, tarih: bugun, kategori: 'Market' }] },
    },
  }), (w) => {
    w.webkitSpeechRecognition = class {
      start() { tanima = this; }
    };
  });
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);
  const kayit = () => JSON.parse(window.localStorage.getItem('cuzdan.v1'));

  dugme('Ödemeler').click();
  dugme('Takvim').click();
  assert.match(metin(window), /Market/);
  document.querySelector('[aria-label="Sonraki ay"]').click();
  assert.match(metin(window), /Pzt/);
  dugme('Faturalar').click();

  dugme('+ Fatura ekle').click();
  document.getElementById('ad').value = 'Kart';
  document.getElementById('cesit').value = 'kart';
  document.getElementById('cesit').dispatchEvent(new window.Event('change'));
  assert.equal(document.getElementById('tur').value, 'degisken');
  document.getElementById('gun').value = '20';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Hesap kesim gününü seç/);
  document.getElementById('kesim').value = '10';
  gonder(window, document.querySelector('form'));
  assert.equal(kayit().faturalar[0].kesim, 10);
  assert.match(metin(window), /Bugünkü alışveriş/);

  dugme('Harcamalar').click();
  dugme('Aylık hedef koy').click();
  document.getElementById('tutar').value = '200';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /100,00 TL üstünde/);
  assert.match(metin(window), /Geçen döneme göre 298,00 TL fazla/);
  assert.doesNotMatch(metin(window), /başarısız/i);

  document.querySelector('[aria-label="Ayarlar"]').click();
  dugme('Köşeye para ayır').click();
  document.getElementById('tutar').value = '100';
  gonder(window, document.querySelector('form'));
  document.querySelector('[aria-label="Geri"]').click();
  assert.match(metin(window), /Kenarda duran/);
  assert.equal(document.getElementById('ana-para').textContent, '600,00 TL');

  dugme('+ Harcama').click();
  document.querySelector('[aria-label="Sesle yaz"]').click();
  assert.match(metin(window), /Dinliyorum/);
  tanima.onresult({ results: [[{ transcript: 'market iki yüz lira domates' }]] });
  assert.equal(document.getElementById('tutar').value, '200,00 TL');
  assert.equal(document.getElementById('not').value, 'domates');
  assert.equal(kayit().donemler[baslangic].hareketler.length, 1);
  gonder(window, document.querySelector('form'));
  assert.equal(kayit().donemler[baslangic].hareketler.at(-1).kategori, 'Market');

  dugme('Geçmiş dönemler').click();
  assert.match(metin(window), /Dönem dönem giden para/);
});

function sahteSunucu(kayit = null) {
  const durum = { kayit, yazma: 0, plan: null };
  const cevap = (govde, ok = true) => ({ ok, status: ok ? 200 : 400, text: async () => JSON.stringify(govde) });
  durum.fetch = async (adres, ayar = {}) => {
    if (typeof adres === 'string' && !adres.includes('supabase.co')) return fiyatCevabi(adres);
    if (adres.includes('/auth/v1/signup') || adres.includes('/auth/v1/token')) {
      const govde = JSON.parse(ayar.body);
      if (govde.password === 'yanlis-sifre') return cevap({ error_code: 'invalid_credentials' }, false);
      return cevap({ access_token: 'a', refresh_token: 'b', expires_in: 3600, user: { id: 'u1', email: govde.email } });
    }
    if (adres.includes('/auth/v1/logout')) return cevap(null);
    if (adres.includes('rpc/cuzdan_kaydet')) {
      const { yeni, beklenen } = JSON.parse(ayar.body);
      if ((durum.kayit?.surum ?? 0) !== beklenen) return cevap(-1);
      durum.kayit = { veri: yeni, surum: beklenen + 1 };
      durum.yazma += 1;
      return cevap(durum.kayit.surum);
    }
    if (adres.includes('rpc/hesabimi_sil')) {
      durum.kayit = null;
      return cevap(null);
    }
    if (adres.includes('/rest/v1/cuzdanlar')) return cevap(durum.kayit ? [durum.kayit] : []);
    if (adres.includes('bildirim_planlari')) {
      if (ayar.method === 'POST') durum.plan = JSON.parse(ayar.body).plan;
      return cevap(ayar.method === 'POST' ? null : []);
    }
    return cevap([]);
  };
  return durum;
}

const bekle = (ms = 30) => new Promise((bitti) => setTimeout(bitti, ms));

test('hesap: açılır, mevcut veri yüklenir, değişiklik gider, çıkışta cihaz temizlenir', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const sunucu = sahteSunucu();
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 100000 } } }), (w) => {
    w.fetch = sunucu.fetch;
  });
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);

  document.querySelector('[aria-label="Ayarlar"]').click();
  dugme('Hesap aç').click();
  document.getElementById('eposta').value = 'yok';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /E-posta adresini yaz/);
  document.getElementById('eposta').value = 'a@b.com';
  document.getElementById('sifre').value = 'kisa';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /en az 8 karakter/);
  document.getElementById('sifre').value = 'uzun-sifre-1';
  gonder(window, document.querySelector('form'));
  await bekle();
  assert.equal(sunucu.kayit.surum, 1);
  assert.equal(sunucu.kayit.veri.ad, 'Ev');
  assert.match(metin(window), /a@b\.com ile giriş yapıldı/);

  document.querySelector('[aria-label="Geri"]').click();
  assert.ok(JSON.parse(window.localStorage.getItem('cuzdan.esitleme')).surum === 1);

  document.querySelector('[aria-label="Ayarlar"]').click();
  dugme('Çıkış yap').click();
  await bekle();
  assert.equal(window.localStorage.getItem('cuzdan.v1'), null);
  assert.equal(window.localStorage.getItem('cuzdan.oturum'), null);
  assert.match(metin(window), /Adım 1/);

  dugme('Hesabım var, giriş yap').click();
  document.getElementById('eposta').value = 'a@b.com';
  document.getElementById('sifre').value = 'yanlis-sifre';
  gonder(window, document.querySelector('form'));
  await bekle();
  assert.match(metin(window), /E-posta ya da şifre yanlış/);
  document.getElementById('sifre').value = 'uzun-sifre-1';
  dugme('Giriş yap').disabled = false;
  gonder(window, document.querySelector('form'));
  await bekle();
  assert.equal(document.getElementById('ana-para').textContent, '1.000,00 TL');
});

test('hesap: iki farklı kayıt varsa kullanıcı seçer, sessizce silinmez', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const uzak = { surum: 1, ad: 'Hesaptaki', ayar, donemler: { [baslangic]: { para: 500000 } } };
  const sunucu = sahteSunucu({ veri: uzak, surum: 3 });
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Cihaz', ayar, donemler: { [baslangic]: { para: 100000 } } }), (w) => {
    w.fetch = sunucu.fetch;
  });
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);

  document.querySelector('[aria-label="Ayarlar"]').click();
  dugme('Giriş yap').click();
  document.getElementById('eposta').value = 'a@b.com';
  document.getElementById('sifre').value = 'uzun-sifre-1';
  gonder(window, document.querySelector('form'));
  await bekle();
  assert.match(metin(window), /İki farklı kayıt var/);
  assert.match(metin(window), /Hesaptaki/);
  assert.match(metin(window), /Cihaz/);
  assert.equal(sunucu.yazma, 0);

  dugme('Bu cihazdakini kullan').click();
  await bekle();
  assert.equal(sunucu.kayit.surum, 4);
  assert.equal(sunucu.kayit.veri.ad, 'Cihaz');
  assert.equal(document.getElementById('ana-para').textContent, '1.000,00 TL');
});

test('hesap: başka cihazdaki yeni kayıt açılışta gelir, internet yokken kayıt bekler', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const yerel = { surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 100000 } } };
  const sunucu = sahteSunucu({ veri: { ...yerel, donemler: { [baslangic]: { para: 700000 } } }, surum: 5 });
  const window = await uygulamaAc(JSON.stringify(yerel), (w) => {
    w.fetch = sunucu.fetch;
    w.localStorage.setItem('cuzdan.oturum', JSON.stringify({ erisim: 'a', yenileme: 'b', bitis: Date.now() + 3600000, id: 'u1', eposta: 'a@b.com' }));
    w.localStorage.setItem('cuzdan.esitleme', JSON.stringify({ surum: 4, kirli: false }));
  });
  await bekle();
  const { document } = window;
  assert.equal(document.getElementById('ana-para').textContent, '7.000,00 TL');
  assert.equal(JSON.parse(window.localStorage.getItem('cuzdan.esitleme')).surum, 5);
  assert.match(metin(window), /Hesabına kaydediliyor/);
});

test('O bölümü: alacak-verecek, masraf planı, kira, sürpriz harcama', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 1000000 } } }));
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);
  const kayit = () => JSON.parse(window.localStorage.getItem('cuzdan.v1'));
  const ana = () => document.getElementById('ana-para').textContent;

  dugme('Alacak-verecek').click();
  dugme('+ Borcum var').click();
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Kişinin adını yaz/);
  document.getElementById('kisi').value = 'Abim';
  document.getElementById('tutar').value = '10.000';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Borcum.*10\.000,00 TL/);
  dugme('Aç').click();
  dugme('Ödeme yaptım').click();
  assert.equal(document.getElementById('tutar').value, '10.000,00 TL');
  document.getElementById('tutar').value = '20.000';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Daha fazlası yazılamaz/);
  document.getElementById('tutar').value = '4.000';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /6\.000,00 TL/);
  document.querySelector('[aria-label="Geri"]').click();
  document.querySelector('[aria-label="Geri"]').click();
  assert.equal(ana(), '6.000,00 TL');

  dugme('Masraf planı').click();
  dugme('+ Masraf ekle').click();
  document.getElementById('ad').value = 'Okul';
  document.getElementById('tutar').value = '5.000';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /1 ay kaldı, ayda 5\.000,00 TL/);
  dugme('Para ayır').click();
  document.getElementById('tutar').value = '2.000';
  gonder(window, document.querySelector('form'));
  document.querySelector('[aria-label="Geri"]').click();
  assert.equal(ana(), '4.000,00 TL');
  assert.match(metin(window), /Kenarda duran/);
  dugme('Masraf planı').click();
  dugme('Planı kapat').click();
  document.querySelector('[aria-label="Geri"]').click();
  assert.equal(ana(), '6.000,00 TL');

  dugme('+ Harcama').click();
  document.getElementById('tutar').value = '500';
  document.getElementById('surpriz').click();
  gonder(window, document.querySelector('form'));
  assert.equal(kayit().donemler[baslangic].hareketler.at(-1).surpriz, true);
  dugme('Harcamalar').click();
  assert.match(metin(window), /Sürpriz harcamalar: 500,00 TL/);

  dugme('Ödemeler').click();
  dugme('+ Fatura ekle').click();
  document.getElementById('ad').value = 'Kira';
  document.getElementById('cesit').value = 'kira';
  document.getElementById('cesit').dispatchEvent(new window.Event('change'));
  document.getElementById('tutar').value = '30.000';
  document.getElementById('gun').value = '5';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Yenileme ayını seç/);
  document.getElementById('yenileme').value = '3';
  document.getElementById('oran').value = 'yanlış';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /Oranı sayı olarak yaz/);
  document.getElementById('oran').value = '31,49';
  gonder(window, document.querySelector('form'));
  assert.equal(kayit().faturalar[0].oran, 3149);
  assert.match(metin(window), /Yenileme: Mart · Yeni kira yaklaşık 39\.447,00 TL/);
});

test('hareketler ekranı: hepsi tek yerde, filtre, düzeltme, geçmiş dönem', async () => {
  const ayar = ilkAyar(15);
  const bugun = bugunTR();
  const baslangic = donemBul(ayar, bugun).baslangic;
  const window = await uygulamaAc(JSON.stringify({
    surum: 1,
    ad: 'Ev',
    ayar,
    donemler: {
      '2000-01-15': { para: 500, hareketler: [{ tur: 'harcama', kurus: 200, tarih: '2000-01-16', kategori: 'Eski' }] },
      [baslangic]: { para: 1000000, hareketler: [
        { tur: 'harcama', kurus: 250000, tarih: bugun, kategori: 'Market', not: 'Haftalık' },
        { tur: 'gelir', kurus: 200000, tarih: bugun, kaynak: 'Ek ders' },
        { tur: 'fatura', kurus: 85000, tarih: bugun, ad: 'Elektrik', faturaId: 'f', ay: bugun.slice(0, 7) },
      ] },
    },
  }));
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);
  const satir = (m) => [...document.querySelectorAll('.hareket')].find((d) => d.textContent.includes(m));

  dugme('Bu ayki hareketler').click();
  assert.match(metin(window), /Giren2\.000,00 TL/);
  assert.match(metin(window), /Çıkan3\.350,00 TL/);
  assert.match(metin(window), /− 2\.500,00 TL/);
  assert.match(metin(window), /\+ 2\.000,00 TL/);
  assert.equal(satir('Elektrik').tagName, 'DIV');

  dugme('Ödeme').click();
  assert.ok(satir('Elektrik'));
  assert.equal(satir('Market'), undefined);
  dugme('Birikim').click();
  assert.match(metin(window), /Bu dönemde kayıt yok/);

  dugme('Hepsi').click();
  satir('Market').click();
  document.getElementById('tutar').value = '3.000';
  gonder(window, document.querySelector('form'));
  assert.match(metin(window), /− 3\.000,00 TL/);

  document.querySelector('[aria-label="Geri"]').click();
  dugme('Geçmiş dönemler').click();
  dugme('Hareketleri gör').click();
  assert.match(metin(window), /Eski/);
  assert.equal(satir('Eski').tagName, 'DIV');
});

test('imza: ana ekranda küçük, Hakkında sayfasında ad ile birlikte', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 100 } } }));
  const { document } = window;

  assert.equal(document.querySelectorAll('.imza-dugme svg path').length, 1);
  document.querySelector('[aria-label="Hakkında"]').click();
  assert.match(metin(window), /Mehmetnur Özkoç/);
  assert.match(metin(window), /Matematik Öğretmeni/);
  assert.ok(document.querySelector('.imza.canli'));
  document.querySelector('[aria-label="İmzayı yeniden çiz"]').click();
  assert.ok(document.querySelector('.imza.canli'));
  document.querySelector('[aria-label="Geri"]').click();
  assert.ok(document.getElementById('ana-para'));
});

test('hızlı harcama: kategoriye dokununca kaydolur, geri al bandıyla geri alınır', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const window = await uygulamaAc(JSON.stringify({
    surum: 1,
    ad: 'Ev',
    ayar,
    faturalar: [{ id: 'k', ad: 'Kira', tur: 'sabit', gun: Number(bugunTR().slice(8)), ilkAy: bugunTR().slice(0, 7), kurus: 10000 }],
    donemler: { [baslangic]: { para: 100000 } },
  }));
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);
  const hareket = () => JSON.parse(window.localStorage.getItem('cuzdan.v1')).donemler[baslangic].hareketler ?? [];

  dugme('+ Harcama').click();
  assert.equal(document.activeElement, document.getElementById('tutar'));
  dugme('Market').click();
  assert.equal(hareket().length, 0);
  dugme('Market').click();
  document.getElementById('tutar').value = '250';
  dugme('Market').click();
  assert.equal(hareket().length, 1);
  assert.equal(hareket()[0].kategori, 'Market');
  assert.match(document.querySelector('.kayit-bandi').textContent, /250,00 TL kaydedildi/);

  dugme('Geri al').click();
  assert.equal(hareket().length, 0);
  assert.equal(document.querySelector('.kayit-bandi'), null);
  assert.equal(document.getElementById('ana-para').textContent, '900,00 TL');

  dugme('✓ Ödedim').click();
  assert.equal(hareket().length, 1);
  assert.match(document.querySelector('.kayit-bandi').textContent, /Kira ödendi/);
  dugme('Geri al').click();
  assert.equal(hareket().length, 0);
});

test('telefonun geri tuşu ekranlar arasında geri götürür', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 100 } } }));
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);
  const geriTusu = () => window.dispatchEvent(new window.PopStateEvent('popstate'));

  dugme('Masraf planı').click();
  dugme('+ Masraf ekle').click();
  assert.match(metin(window), /Masraf ekle/);
  geriTusu();
  assert.match(metin(window), /Masraflar için ayrılan/);
  geriTusu();
  assert.ok(document.getElementById('ana-para'));

  dugme('Piyasa').click();
  geriTusu();
  assert.ok(document.getElementById('ana-para'));

  dugme('+ Harcama').click();
  document.querySelector('[aria-label="Hesap makinesi"]').click();
  assert.ok(document.querySelector('.hesap-perde'));
  geriTusu();
  assert.equal(document.querySelector('.hesap-perde'), null);
  assert.ok(document.getElementById('tutar'));
});

test('açılış ekranı logo, imza ve adı gösterir, dokununca kapanır', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 100 } } }));
  const { document } = window;
  const perde = document.getElementById('acilis');
  assert.ok(perde.querySelector('.a-para'));
  assert.ok(perde.querySelector('.a-cep'));
  assert.ok(perde.querySelectorAll('.imza path').length > 5);
  assert.match(perde.textContent, /Mehmetnur Özkoç/);
  assert.ok(document.getElementById('ana-para'));
  perde.click();
  assert.ok(perde.classList.contains('bitti'));
});

test('sesler: ayardan kapatılır, kapalıyken çalınmaz, ses sistemi yoksa uygulama bozulmaz', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const calan = [];
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 100000 } } }), (w) => {
    w.fetch = async (adres) => (String(adres).endsWith('.mp3') ? { arrayBuffer: async () => new ArrayBuffer(8) } : fiyatCevabi(adres));
    w.AudioContext = class {
      state = 'running';
      destination = {};
      decodeAudioData = async () => ({});
      createBufferSource() {
        return { connect() {}, start() { calan.push(1); } };
      }
    };
  });
  await new Promise((bitti) => setTimeout(bitti, 900));
  assert.ok(calan.length >= 1);
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);
  const kayit = () => JSON.parse(window.localStorage.getItem('cuzdan.v1'));

  document.querySelector('[aria-label="Ayarlar"]').click();
  assert.equal(document.getElementById('ses').checked, true);
  document.getElementById('ses').click();
  assert.equal(kayit().ses, false);

  const onceki = calan.length;
  document.querySelector('[aria-label="Geri"]').click();
  dugme('Birikim').click();
  dugme('+ Birikim ekle').click();
  document.getElementById('miktar').value = '1';
  document.getElementById('tutar').value = '100';
  gonder(window, document.querySelector('form'));
  await new Promise((bitti) => setTimeout(bitti, 20));
  assert.equal(calan.length, onceki);

  document.querySelector('[aria-label="Geri"]').click();
  dugme('Ana sayfa').click();
  document.querySelector('[aria-label="Ayarlar"]').click();
  document.getElementById('ses').click();
  await new Promise((bitti) => setTimeout(bitti, 20));
  assert.equal(calan.length, onceki + 1);
  assert.equal(kayit().ses, true);
});

test('tema ve titreşim: seçilir, kaydedilir, yeniden açılışta uygulanır, kapatılır', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const titresim = [];
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 100000 } } }), (w) => {
    w.navigator.vibrate = (k) => titresim.push(k);
  });
  const { document } = window;
  const kok = document.documentElement;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);
  const kayit = () => JSON.parse(window.localStorage.getItem('cuzdan.v1'));

  document.querySelector('[aria-label="Ayarlar"]').click();
  dugme('Koyu').click();
  assert.equal(kok.dataset.theme, 'dark');
  assert.equal(kayit().mod, 'koyu');
  dugme('Lacivert').click();
  assert.equal(kok.dataset.renk, 'lacivert');
  assert.equal(kok.dataset.theme, 'dark');
  dugme('Otomatik').click();
  assert.equal(kok.dataset.theme, undefined);
  dugme('Gece altını').click();
  assert.equal(kok.dataset.theme, 'dark');
  assert.match(metin(window), /her zaman koyu/);
  dugme('Zümrüt').click();
  assert.equal(kok.dataset.renk, undefined);
  assert.equal(kayit().renk, undefined);
  dugme('Koyu').click();
  dugme('Otomatik').click();
  assert.equal(kok.dataset.theme, undefined);

  document.querySelector('[aria-label="Geri"]').click();
  dugme('+ Harcama').click();
  document.getElementById('tutar').value = '100';
  dugme('Market').click();
  assert.deepEqual(titresim, [14]);

  document.querySelector('[aria-label="Ayarlar"]').click();
  document.getElementById('titresim').click();
  assert.equal(kayit().titresim, false);
  document.querySelector('[aria-label="Geri"]').click();
  dugme('+ Harcama').click();
  document.getElementById('tutar').value = '100';
  dugme('Market').click();
  assert.deepEqual(titresim, [14]);
});

test('tema yedekte doğrulanır, eski veriyle uygulama açılır', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, renk: 'lacivert', mod: 'acik', titresim: false, donemler: { [baslangic]: { para: 100 } } }));
  assert.equal(window.document.documentElement.dataset.renk, 'lacivert');
  assert.equal(window.document.documentElement.dataset.theme, 'light');
  assert.ok(window.document.getElementById('ana-para'));
});

test('yükleme düğmesi: olay gelince çıkar, basınca yükleme penceresi açılır', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 100 } } }));
  const { document } = window;
  const dugme = document.querySelector('.kurulum-dugmesi');
  assert.equal(dugme.hidden, true);

  let acildi = 0;
  const olay = new window.Event('beforeinstallprompt', { cancelable: true });
  olay.prompt = async () => { acildi += 1; };
  window.dispatchEvent(olay);
  assert.equal(olay.defaultPrevented, false);
  assert.equal(dugme.hidden, false);

  dugme.click();
  assert.equal(acildi, 1);
  assert.equal(dugme.hidden, true);
  window.dispatchEvent(new window.Event('appinstalled'));
  assert.equal(dugme.hidden, true);
});

test('verki: yapay zekâ harcama anlayınca uygulama kaydı yazar, Geri al siler', async () => {
  const bugun = bugunTR();
  const donem = donemBul(ilkAyar(15), bugun);
  const baslangic = JSON.stringify({ surum: 1, ad: 'Ev', ayar: ilkAyar(15), donemler: { [donem.baslangic]: { para: 100000, hareketler: [] } } });
  const window = await uygulamaAc(baslangic, (w) => {
    w.localStorage.setItem('cuzdan.oturum', JSON.stringify({ erisim: 'a', yenileme: 'b', bitis: Date.now() + 3600000, id: 'u1', eposta: 'a@b.com' }));
    w.fetch = async (adres) => ({
      ok: true,
      status: 200,
      text: async () => '[]',
      json: async () => (String(adres).includes('/functions/v1/verki')
        ? { cevap: 'Kaydettim: Market 50,00 TL.', islem: { tutar: 50, kategori: 'Market', tarih: bugun, not: '' }, defter: null }
        : []),
    });
  });
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent === m);
  document.querySelector('.verki-dugme').click();
  const kutu = document.getElementById('verki-soru');
  kutu.value = '50 TL market harcaması yaptım';
  gonder(window, document.querySelector('.verki-yaz'));
  await new Promise((r) => setTimeout(r, 50));

  const kayit = JSON.parse(window.localStorage.getItem('cuzdan.v1')).donemler[donem.baslangic].hareketler;
  assert.equal(kayit.length, 1);
  assert.equal(kayit[0].kurus, 5000);
  assert.equal(kayit[0].kategori, 'Market');
  assert.match(metin(window), /Kaydettim: Market 50,00 TL/);
  dugme('Geri al').click();
  assert.equal(JSON.parse(window.localStorage.getItem('cuzdan.v1')).donemler[donem.baslangic].hareketler.length, 0);
});
