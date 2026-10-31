import test from 'node:test';
import assert from 'node:assert/strict';
import { hareketToplami, kalanPara, paraCoz, paraYaz, yaklasikAralik } from '../para.js';
import { bugunTR, donemBul, ilkAyar, maasGunuDegistir, maasKaydir } from '../donem.js';
import { veriGecerliMi, yedekCoz } from '../depo.js';
import {
  atlamaGeriAl,
  ayAtla,
  ayrilanTutar,
  baslangicAyi,
  donemKalemleri,
  faturaGuncelle,
  faturaOde,
  faturaSil,
  odemeGeriAl,
} from '../fatura.js';
import {
  VARSAYILAN_KATEGORILER,
  harcamaEkle,
  harcamaGuncelle,
  harcamaListesi,
  harcamaSil,
  kategoriAdDegistir,
  kategoriEkle,
  kategoriSil,
  kategoriToplamlari,
  siraliKategoriler,
} from '../harcama.js';

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

test('kalan para gelir ve harcamayı hesaba katar', () => {
  const donem = { para: 100000, hareketler: [{ tur: 'harcama', kurus: 30000 }, { tur: 'gelir', kurus: 5000 }] };
  assert.equal(kalanPara(donem), 75000);
  assert.equal(hareketToplami(donem, 'harcama'), 30000);
  assert.equal(kalanPara({ para: 100 }), 100);
  assert.deepEqual(yaklasikAralik(420000), [400000, 450000]);
});

const faturaVerisi = (faturalar) => ({
  surum: 1,
  ad: 'Ev',
  ayar: ilkAyar(15),
  faturalar,
  donemler: { '2026-10-15': { para: 1000000, hareketler: [] } },
});
const kira = { id: 'a', ad: 'Kira', tur: 'sabit', gun: 1, kurus: 500000, ilkAy: '2026-11' };
const elektrik = { id: 'b', ad: 'Elektrik', tur: 'degisken', gun: 20, ilkAy: '2026-10' };
const BUGUN = '2026-10-31';
const donem = donemBul(ilkAyar(15), BUGUN);

test('fatura: bekleyen tutar ayrılır, ödeyince paradan düşer, ayrılan sıfırlanır', () => {
  const veri = faturaVerisi([kira]);
  const [kalem] = donemKalemleri(veri, donem, BUGUN);
  assert.equal(kalem.vade, '2026-11-01');
  assert.equal(kalem.durum, 'bekliyor');
  assert.equal(ayrilanTutar([kalem]), 500000);

  const odendi = faturaOde(veri, donem.baslangic, kalem, kalem.kurus, BUGUN);
  assert.equal(kalanPara(odendi.donemler[donem.baslangic]), 500000);
  const sonra = donemKalemleri(odendi, donem, BUGUN);
  assert.equal(sonra[0].durum, 'odendi');
  assert.equal(ayrilanTutar(sonra), 0);

  assert.equal(faturaOde(odendi, donem.baslangic, kalem, kalem.kurus, BUGUN), odendi);
  const geri = odemeGeriAl(odendi, donem.baslangic, kalem);
  assert.equal(kalanPara(geri.donemler[donem.baslangic]), 1000000);
  assert.equal(donemKalemleri(geri, donem, BUGUN)[0].durum, 'bekliyor');
});

test('fatura: değişken tutar belli değilse ayrılan değişmez, gerçek tutar kaydedilir', () => {
  const veri = faturaVerisi([elektrik]);
  const [kalem] = donemKalemleri(veri, donem, BUGUN);
  assert.equal(kalem.kurus, null);
  assert.equal(kalem.durum, 'gecikti');
  assert.equal(ayrilanTutar([kalem]), 0);
  const odendi = faturaOde(veri, donem.baslangic, kalem, 75000, BUGUN);
  assert.equal(donemKalemleri(odendi, donem, BUGUN)[0].kurus, 75000);
});

test('fatura: ödenmeyen sonraki döneme geçer, ödenen bir daha çıkmaz', () => {
  const veri = faturaVerisi([kira]);
  const yeniBugun = '2026-11-20';
  const yeniDonem = donemBul(ilkAyar(15), yeniBugun);
  veri.donemler[yeniDonem.baslangic] = { para: 0, hareketler: [] };

  const kalemler = donemKalemleri(veri, yeniDonem, yeniBugun);
  assert.deepEqual(kalemler.map((k) => [k.ay, k.durum]), [['2026-11', 'gecikti'], ['2026-12', 'bekliyor']]);

  const odendi = faturaOde(veri, donem.baslangic, kalemler[0], 500000, yeniBugun);
  assert.deepEqual(donemKalemleri(odendi, yeniDonem, yeniBugun).map((k) => k.ay), ['2026-12']);
});

test('fatura: "bu ay yok" ayrılanı azaltır, geri alınabilir', () => {
  const veri = faturaVerisi([kira]);
  const atlandi = ayAtla(veri, 'a', '2026-11');
  const kalemler = donemKalemleri(atlandi, donem, BUGUN);
  assert.equal(kalemler[0].durum, 'atlandi');
  assert.equal(ayrilanTutar(kalemler), 0);
  assert.equal(donemKalemleri(atlamaGeriAl(atlandi, 'a', '2026-11'), donem, BUGUN)[0].durum, 'bekliyor');
});

test('fatura: düzenleme önceki ödemeyi değiştirmez, gün değişince aynı ay tekrar çıkmaz', () => {
  const veri = faturaVerisi([kira]);
  const [kalem] = donemKalemleri(veri, donem, BUGUN);
  const odendi = faturaOde(veri, donem.baslangic, kalem, kalem.kurus, BUGUN);
  const degisti = faturaGuncelle(odendi, 'a', { kurus: 600000, gun: 5 });
  const kalemler = donemKalemleri(degisti, donem, BUGUN);
  assert.equal(kalemler.length, 1);
  assert.equal(kalemler[0].durum, 'odendi');
  assert.equal(kalemler[0].kurus, 500000);
});

test('fatura: silinince ödenmiş kayıt dönemde kalır', () => {
  const veri = faturaVerisi([kira]);
  const [kalem] = donemKalemleri(veri, donem, BUGUN);
  const silindi = faturaSil(faturaOde(veri, donem.baslangic, kalem, kalem.kurus, BUGUN), 'a');
  assert.deepEqual(donemKalemleri(silindi, donem, BUGUN), []);
  assert.equal(hareketToplami(silindi.donemler[donem.baslangic], 'fatura'), 500000);
  assert.equal(veriGecerliMi(silindi), true);
});

test('fatura: kısa ayda son gün, ilk ödeme ayı seçimi', () => {
  const subat = donemBul(ilkAyar(15), '2027-02-20');
  const veri = faturaVerisi([{ ...kira, gun: 31, ilkAy: '2027-02' }]);
  assert.equal(donemKalemleri(veri, subat, '2027-02-20')[0].vade, '2027-02-28');

  assert.deepEqual(baslangicAyi(20, BUGUN, donem.baslangic), { ilkAy: '2026-11', gecmisAy: '2026-10', gecmisTarih: '2026-10-20' });
  assert.equal(baslangicAyi(31, BUGUN, donem.baslangic).ilkAy, '2026-10');
  assert.equal(baslangicAyi(5, BUGUN, donem.baslangic).gecmisAy, null);
});

const harcamaVerisi = () => ({
  surum: 1,
  ad: 'Ev',
  ayar: ilkAyar(15),
  donemler: { '2026-10-15': { para: 100000, hareketler: [] } },
});
const BAS = '2026-10-15';

test('harcama: ekleme, düzeltme ve silme parayı doğru değiştirir', () => {
  let veri = harcamaEkle(harcamaVerisi(), BAS, { kurus: 10000, kategori: 'Market', not: '2 kilo elma', tarih: '2026-10-20' });
  veri = harcamaEkle(veri, BAS, { kurus: 5000, tarih: '2026-10-25' });
  assert.equal(kalanPara(veri.donemler[BAS]), 85000);

  const liste = harcamaListesi(veri.donemler[BAS]);
  assert.deepEqual(liste.map((h) => h.kurus), [5000, 10000]);

  veri = harcamaGuncelle(veri, BAS, liste[1].sira, { kurus: 20000, kategori: 'Ev', not: undefined, tarih: '2026-10-21' });
  assert.equal(kalanPara(veri.donemler[BAS]), 75000);
  assert.equal(veri.donemler[BAS].hareketler[0].tur, 'harcama');
  assert.equal(veri.donemler[BAS].hareketler[0].kategori, 'Ev');

  veri = harcamaSil(veri, BAS, 0);
  assert.equal(kalanPara(veri.donemler[BAS]), 95000);
  assert.equal(veriGecerliMi(JSON.parse(JSON.stringify(veri))), true);
});

test('harcama: kategori toplamları büyükten küçüğe, kategorisiz Diğer sayılır', () => {
  let veri = harcamaEkle(harcamaVerisi(), BAS, { kurus: 100, kategori: 'Market', tarih: BAS });
  veri = harcamaEkle(veri, BAS, { kurus: 200, kategori: 'Market', tarih: BAS });
  veri = harcamaEkle(veri, BAS, { kurus: 500, tarih: BAS });
  assert.deepEqual(kategoriToplamlari(veri.donemler[BAS]), [{ ad: 'Diğer', kurus: 500 }, { ad: 'Market', kurus: 300 }]);
});

test('kategori: sık kullanılan öne geçer, aynı ad çoğalmaz', () => {
  let veri = harcamaEkle(harcamaVerisi(), BAS, { kurus: 100, kategori: 'Giyim', tarih: BAS });
  assert.equal(siraliKategoriler(veri)[0], 'Giyim');
  assert.equal(siraliKategoriler(veri)[1], VARSAYILAN_KATEGORILER[0]);

  const ayni = kategoriEkle(veri, 'MARKET');
  assert.equal(ayni.ad, 'Market');
  assert.equal(ayni.veri, veri);
  assert.equal(kategoriEkle(veri, 'diğer').ad, undefined);

  const yeni = kategoriEkle(veri, 'Kırtasiye');
  assert.equal(yeni.veri.kategoriler.at(-1), 'Kırtasiye');
  assert.equal(VARSAYILAN_KATEGORILER.includes('Kırtasiye'), false);
});

test('kategori: ad değişince eski kayıtlar da değişir, silince kayıt kalır', () => {
  const veri = harcamaEkle(harcamaVerisi(), BAS, { kurus: 100, kategori: 'Market', tarih: BAS });

  const degisti = kategoriAdDegistir(veri, 'Market', 'Bakkal');
  assert.equal(degisti.donemler[BAS].hareketler[0].kategori, 'Bakkal');
  assert.equal(degisti.kategoriler.includes('Market'), false);

  const birlesti = kategoriAdDegistir(veri, 'Market', 'ev');
  assert.equal(birlesti.donemler[BAS].hareketler[0].kategori, 'Ev');
  assert.equal(birlesti.kategoriler.filter((k) => k === 'Ev').length, 1);

  const silindi = kategoriSil(veri, 'Market');
  assert.equal(silindi.kategoriler.includes('Market'), false);
  assert.equal(silindi.donemler[BAS].hareketler[0].kategori, 'Market');
});

test('harcama: yedek doğrulaması uzun not ve bozuk kategoriyi reddeder', () => {
  const eski = harcamaVerisi();
  const hareket = (ek) => ({ ...eski, donemler: { [BAS]: { para: 0, hareketler: [{ tur: 'harcama', kurus: 1, tarih: BAS, ...ek }] } } });
  assert.equal(veriGecerliMi(hareket({ kategori: 'Market', not: 'elma' })), true);
  assert.equal(veriGecerliMi(hareket({ not: 'x'.repeat(81) })), false);
  assert.equal(veriGecerliMi(hareket({ kategori: 5 })), false);
  assert.equal(veriGecerliMi({ ...eski, kategoriler: ['Market', ''] }), false);
});

test('fatura: yedek doğrulaması bozuk faturayı reddeder, eski yedeği kabul eder', () => {
  const eski = { surum: 1, ad: 'Ev', ayar: ilkAyar(15), donemler: {} };
  assert.equal(veriGecerliMi(eski), true);
  assert.equal(veriGecerliMi({ ...eski, faturalar: [kira, elektrik] }), true);
  assert.equal(veriGecerliMi({ ...eski, faturalar: [{ ...kira, kurus: undefined }] }), false);
  assert.equal(veriGecerliMi({ ...eski, faturalar: [{ ...kira, ilkAy: '2020-13' }] }), false);
  assert.equal(veriGecerliMi({ ...eski, faturalar: [{ ...kira, gun: 32 }] }), false);
});
