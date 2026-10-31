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
  assert.match(metin(window), /Hesap sistemi henüz bağlı değil/);

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

  dugme('Tutarı düzelt').click();
  document.getElementById('para').value = '800';
  gonder(window, document.querySelector('form'));
  assert.equal(document.getElementById('ana-para').textContent, '800,00 TL');
  const kayit = JSON.parse(window.localStorage.getItem('cuzdan.v1'));
  assert.equal(kayit.donemler[baslangic].hareketler.length, 3);
  assert.equal(kayit.donemler[baslangic].hareketler[2].kategori, 'Kayıtsız');
  assert.equal(kayit.donemler[baslangic].hareketler[2].kurus, 15050);

  dugme('Tutarı düzelt').click();
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
  document.getElementById('tutar').value = '100';
  dugme('Market').click();
  assert.equal(dugme('Market').getAttribute('aria-pressed'), 'true');
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

  dugme('Ödeme geçmişi ve düzenle').click();
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

test('param ne alır: satış fiyatıyla hesaplar, serbest parayı getirir', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 2150000 } } }), (w) => {
    w.fetch = async (adres) => fiyatCevabi(adres);
  });
  await new Promise((bitti) => setTimeout(bitti, 20));
  const { document } = window;
  const dugme = (m) => [...document.querySelectorAll('button')].find((d) => d.textContent.startsWith(m));
  const kutu = () => document.getElementById('tutar');
  const yaz = (deger) => {
    kutu().value = deger;
    kutu().dispatchEvent(new window.Event('input', { bubbles: true }));
  };

  dugme('Piyasa').click();
  dugme('Param ne alır').click();
  yaz('4.300');
  assert.match(metin(window), /100,00 dolar/);
  yaz('yanlış');
  assert.match(metin(window), /Tutarı örnekteki gibi yaz/);
  assert.equal(document.getElementById('ne-alir').textContent, '');

  dugme('Serbest paramı getir').click();
  assert.equal(kutu().value, '21.500,00 TL');
  assert.match(metin(window), /500,00 dolar/);
  assert.match(metin(window), /2 adet/);
  assert.match(metin(window), /Fiyat yok/);
  assert.match(metin(window), /Yaklaşık hesaptır/);
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
