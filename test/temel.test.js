import test from 'node:test';
import assert from 'node:assert/strict';
import { paraCoz, paraYaz } from '../para.js';
import { bugunTR, donemBul, ilkAyar, maasGunuDegistir, maasKaydir } from '../donem.js';
import { veriGecerliMi, yedekCoz } from '../depo.js';

test('para: Türkçe yazımları doğru çözer', () => {
  const ornekler = [
    ['1.250,50', 125050], ['25.000', 2500000], ['25000', 2500000], ['0,1', 10],
    ['0,10', 10], ['1250.5', 125050], ['1.250', 125000], ['25.000 TL', 2500000],
    ['₺ 100', 10000], ['0', 0], ['1.234.567,89', 123456789],
  ];
  for (const [metin, beklenen] of ornekler) assert.equal(paraCoz(metin), beklenen, metin);
});

test('para: yanlış girişi kabul etmez', () => {
  for (const metin of ['', 'abc', '-5', '1,234', '12.34.56', '1,2,3', '1..2', '99999999999999'])
    assert.equal(paraCoz(metin), null, metin);
});

test('para: yazma ve geri çözme aynı tutarı verir', () => {
  for (const kurus of [0, 1, 10, 99, 100, 125050, 2500000, 123456789]) {
    assert.equal(paraCoz(paraYaz(kurus)), kurus);
  }
  assert.equal(paraYaz(125050), '1.250,50 TL');
  assert.equal(paraYaz(-500), '-5,00 TL');
});

test('dönem: maaş gününden maaş gününe sayar', () => {
  const ayar = ilkAyar(15);
  assert.deepEqual(donemBul(ayar, '2026-10-31'), { baslangic: '2026-10-15', sonraki: '2026-11-15', bitis: '2026-11-14' });
  assert.equal(donemBul(ayar, '2026-11-15').baslangic, '2026-11-15');
  assert.equal(donemBul(ayar, '2026-11-14').baslangic, '2026-10-15');
});

test('dönem: yıl geçişi', () => {
  assert.deepEqual(donemBul(ilkAyar(15), '2027-01-03'), { baslangic: '2026-12-15', sonraki: '2027-01-15', bitis: '2027-01-14' });
});

test('dönem: kısa aylarda son gün sayılır', () => {
  const ayar = ilkAyar(31);
  assert.equal(donemBul(ayar, '2026-11-30').baslangic, '2026-11-30');
  assert.equal(donemBul(ayar, '2027-02-27').sonraki, '2027-02-28');
  assert.equal(donemBul(ayar, '2028-02-29').baslangic, '2028-02-29');
});

test('maaş günü değişimi başlamış dönemi bozmaz', () => {
  const eski = ilkAyar(15);
  const bugun = '2026-10-20';
  const baslangic = donemBul(eski, bugun).baslangic;

  const gec = maasGunuDegistir(eski, 28, bugun);
  assert.deepEqual(donemBul(gec, bugun), { baslangic, sonraki: '2026-10-28', bitis: '2026-10-27' });

  const erken = maasGunuDegistir(eski, 10, bugun);
  assert.deepEqual(donemBul(erken, bugun), { baslangic, sonraki: '2026-11-10', bitis: '2026-11-09' });

  const gecmis = donemBul(gec, '2026-09-20');
  assert.equal(gecmis.baslangic, '2026-09-15');
  assert.equal(gecmis.sonraki, '2026-10-15');
});

test('aynı gün iki kez değişimde son seçim geçerli olur', () => {
  const bugun = '2026-10-20';
  const ayar = maasGunuDegistir(maasGunuDegistir(ilkAyar(15), 28, bugun), 5, bugun);
  assert.equal(ayar.kurallar.length, 2);
  assert.equal(donemBul(ayar, bugun).sonraki, '2026-11-05');
});

test('sıradaki maaş kayınca sadece o dönem değişir', () => {
  const bugun = '2026-10-31';
  const ayar = maasKaydir(ilkAyar(15), bugun, '2026-11-13');
  assert.equal(donemBul(ayar, bugun).sonraki, '2026-11-13');
  assert.deepEqual(donemBul(ayar, '2026-11-20'), { baslangic: '2026-11-13', sonraki: '2026-12-15', bitis: '2026-12-14' });
});

test('kaydırılan maaş normal güne geri alınabilir', () => {
  const bugun = '2026-10-31';
  const kaymis = maasKaydir(ilkAyar(15), bugun, '2026-11-18');
  const geri = maasKaydir(kaymis, bugun, '2026-11-15');
  assert.deepEqual(geri.kaydirma, {});
  assert.equal(donemBul(geri, bugun).sonraki, '2026-11-15');
});

test('maaş bugün yatarsa yeni dönem bugün başlar; uygun olmayan tarih reddedilir', () => {
  const bugun = '2026-11-13';
  const ayar = maasKaydir(ilkAyar(15), bugun, bugun);
  assert.equal(donemBul(ayar, bugun).baslangic, bugun);
  assert.equal(maasKaydir(ilkAyar(15), bugun, '2026-11-12'), null);
  assert.equal(maasKaydir(ilkAyar(15), bugun, '2026-12-15'), null);
});

test('Türkiye tarihi kullanılır', () => {
  assert.equal(bugunTR(new Date('2026-10-30T21:30:00Z')), '2026-10-31');
  assert.equal(bugunTR(new Date('2026-10-30T20:59:00Z')), '2026-10-30');
});

test('yedek doğrulama', () => {
  const dogru = { surum: 1, ad: 'Ev', ayar: ilkAyar(15), donemler: { '2026-10-15': { para: 100 } } };
  assert.equal(veriGecerliMi(dogru), true);
  assert.deepEqual(yedekCoz(JSON.stringify(dogru)), dogru);
  assert.equal(yedekCoz('bozuk'), null);
  assert.equal(yedekCoz('null'), null);
  assert.equal(veriGecerliMi({ ...dogru, ad: '' }), false);
  assert.equal(veriGecerliMi({ ...dogru, donemler: { '2026-10-15': { para: 1.5 } } }), false);
  assert.equal(veriGecerliMi({ ...dogru, ayar: { kurallar: [{ gecerli: '0000-01-01', gun: 32 }], kaydirma: {} } }), false);
});
