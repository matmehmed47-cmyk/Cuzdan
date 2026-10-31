import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { bugunTR, donemBul, ilkAyar } from '../donem.js';

async function uygulamaAc(baslangic) {
  const dom = new JSDOM('<!doctype html><main id="uygulama"></main>', { url: 'https://ornek.test/cuzdan/' });
  const { window } = dom;
  if (baslangic) window.localStorage.setItem('cuzdan.v1', baslangic);
  window.confirm = () => true;
  window.scrollTo = () => {};
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.localStorage = window.localStorage;
  await import(`../uygulama.js?${Math.random()}`);
  return window;
}

function gonder(window, form) {
  form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
}

const metin = (window) => window.document.getElementById('uygulama').textContent;

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
  assert.equal(kayit.donemler[baslangic].hareketler.length, 2);

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

  assert.match(metin(window), /Henüz fatura eklemedin/);
  dugme('Faturalar').click();
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

  document.querySelector('[aria-label="Geri"]').click();
  assert.equal(document.getElementById('ana-para').textContent, '700,00 TL');
  assert.match(metin(window), /Faturalara ayrıldı300,00 TL/);
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

  assert.match(metin(window), /1 faturanın tutarı henüz belli değil/);
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

test('para eksiye düşerse açıkça yazar', async () => {
  const ayar = ilkAyar(15);
  const baslangic = donemBul(ayar, bugunTR()).baslangic;
  const window = await uygulamaAc(JSON.stringify({ surum: 1, ad: 'Ev', ayar, donemler: { [baslangic]: { para: 100, hareketler: [{ tur: 'harcama', kurus: 300, tarih: baslangic }] } } }));
  assert.match(metin(window), /2,00 TL eksidesin/);
});
