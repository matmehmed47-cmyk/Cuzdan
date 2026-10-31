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

  assert.match(metin(window), /Yeni dönem başladı/);
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
