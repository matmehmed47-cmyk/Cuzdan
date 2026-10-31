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
  bekleyenTaksitler,
  donemTaksitleri,
  gelecekAylar,
  taksitBitisi,
  taksitDurumu,
  taksitOde,
  taksitOdemeGeriAl,
} from '../taksit.js';
import {
  VARSAYILAN_KATEGORILER,
  geriAldimEkle,
  gelirEkle,
  gelirListesi,
  gelirOzet,
  harcamaEkle,
  harcamaGuncelle,
  harcamaListesi,
  hareketSil,
  kategoriAdDegistir,
  kategoriEkle,
  kategoriSil,
  kategoriToplamlari,
  kaynakEkle,
  ortakListesi,
  ortakOzet,
  siraliKategoriler,
  siraliKaynaklar,
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

  veri = hareketSil(veri, BAS, 0);
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

test('ortak ev: tutar ana paradan düşer, kişi başı ve geri alınan doğru hesaplanır', () => {
  let veri = harcamaEkle(harcamaVerisi(), BAS, { kurus: 12000, not: 'Çamaşır suyu', ortak: true, tarih: BAS });
  veri = harcamaEkle(veri, BAS, { kurus: 30000, not: 'Deterjan', ortak: true, tarih: '2026-10-20' });
  veri = harcamaEkle(veri, BAS, { kurus: 5000, not: 'Elma', tarih: BAS });
  const kayit = veri.donemler[BAS];

  assert.equal(kalanPara(kayit), 53000);
  assert.deepEqual(ortakListesi(kayit).map((h) => h.not), ['Deterjan', 'Çamaşır suyu']);
  assert.deepEqual(ortakOzet(kayit, 3), { harcanan: 42000, geriAlinan: 0, kalan: 42000, kisiBasi: 14000 });
  assert.equal(ortakOzet(kayit, undefined).kisiBasi, null);

  const geri = geriAldimEkle(veri, BAS, { kurus: 14000, tarih: '2026-10-25' });
  assert.equal(kalanPara(geri.donemler[BAS]), 67000);
  assert.equal(ortakOzet(geri.donemler[BAS]).kalan, 28000);
  assert.equal(veriGecerliMi(JSON.parse(JSON.stringify(geri))), true);
});

test('gelir: kaynak sıklığa göre dizilir, geri alınan ek gelir sayılmaz', () => {
  let veri = gelirEkle(harcamaVerisi(), BAS, { kurus: 200000, kaynak: 'Hediye', tarih: BAS });
  veri = geriAldimEkle(veri, BAS, { kurus: 5000, tarih: BAS });
  const kayit = veri.donemler[BAS];
  assert.equal(kalanPara(kayit), 305000);
  assert.equal(gelirListesi(kayit).length, 1);
  assert.deepEqual(gelirOzet(kayit), { baslangic: 100000, ekGelir: 200000, toplam: 300000 });
  assert.equal(siraliKaynaklar(veri)[0], 'Hediye');
  assert.equal(kaynakEkle(veri, 'hediye').ad, 'Hediye');
  assert.equal(kaynakEkle(veri, 'Kermes').veri.kaynaklar.at(-1), 'Kermes');
  assert.equal(veriGecerliMi({ ...veri, kaynaklar: [''] }), false);
});

const tablet = { id: 't', ad: 'Tablet', tur: 'sabit', toplam: 2500000, sayi: 5, gun: 1, ilkAy: '2026-11' };
const taksitVerisi = (taksit = tablet) => ({ surum: 1, ad: 'Ev', ayar: ilkAyar(15), taksitler: [taksit], donemler: { '2026-10-15': { para: 3000000, hareketler: [] } } });

test('taksit: 25.000 TL 5 taksit, ödedikçe kalan azalır, ayrılan bu ayın tutarıdır', () => {
  let veri = taksitVerisi();
  const [kalem] = donemTaksitleri(veri, donem, BUGUN);
  assert.equal(kalem.kurus, 500000);
  assert.equal(ayrilanTutar([kalem]), 500000);
  assert.equal(taksitBitisi(veri, tablet, BUGUN), '2027-03');

  veri = taksitOde(veri, donem.baslangic, kalem, 500000, BUGUN);
  const durum = taksitDurumu(veri, tablet);
  assert.deepEqual([durum.odenen, durum.kalan, durum.odenenAdet], [500000, 2000000, 1]);
  assert.equal(kalanPara(veri.donemler[donem.baslangic]), 2500000);
  assert.deepEqual(donemTaksitleri(veri, donem, BUGUN), []);
  assert.equal(bekleyenTaksitler(veri, tablet, '2026-12-31', BUGUN)[0].ay, '2026-12');

  assert.equal(taksitDurumu(taksitOdemeGeriAl(veri, donem.baslangic, 't', '2026-11'), tablet).kalan, 2500000);
});

test('taksit: az ödenirse kalan yeniden bölünür, kuruş kaybolmaz, son taksitte biter', () => {
  let veri = taksitVerisi({ ...tablet, toplam: 100000, sayi: 3 });
  const t = veri.taksitler[0];
  assert.equal(donemTaksitleri(veri, donem, BUGUN)[0].kurus, 33334);
  assert.equal(bekleyenTaksitler(veri, t, '2027-12-31', BUGUN).reduce((s, k) => s + k.kurus, 0), 100000);

  const [kalem] = donemTaksitleri(veri, donem, BUGUN);
  veri = taksitOde(veri, donem.baslangic, kalem, 20000, BUGUN);
  const sonraki = bekleyenTaksitler(veri, t, '2027-12-31', BUGUN);
  assert.deepEqual(sonraki.map((k) => k.kurus), [40000, 40000]);
  assert.equal(taksitBitisi(veri, t, BUGUN), '2027-01');
});

test('taksit: ödenmeyen devreder ve gecikti olur; değişken taksitin tutarı sorulur', () => {
  const yeniBugun = '2026-12-20';
  const yeniDonem = donemBul(ilkAyar(15), yeniBugun);
  const kalemler = donemTaksitleri(taksitVerisi(), yeniDonem, yeniBugun);
  assert.deepEqual(kalemler.map((k) => [k.ay, k.durum]), [['2026-11', 'gecikti'], ['2026-12', 'gecikti'], ['2027-01', 'bekliyor']]);

  const degisken = { ...tablet, tur: 'degisken', sayi: undefined };
  const veri = taksitVerisi(degisken);
  assert.equal(donemTaksitleri(veri, donem, BUGUN)[0].kurus, null);
  assert.equal(taksitBitisi(veri, degisken, BUGUN), null);
  assert.equal(veriGecerliMi(JSON.parse(JSON.stringify(veri))), true);
});

test('taksit: önceki ödeme sayılır, gelecek aylar toplanır, bozuk kayıt reddedilir', () => {
  const eski = { ...tablet, onceki: 1000000 };
  const veri = taksitVerisi(eski);
  const durum = taksitDurumu(veri, eski);
  assert.deepEqual([durum.odenenAdet, durum.kalan], [2, 1500000]);
  assert.equal(taksitBitisi(veri, eski, BUGUN), '2027-01');
  assert.deepEqual(gelecekAylar(veri, BUGUN).map((a) => a.kurus), [0, 500000, 500000, 500000, 0, 0]);

  assert.equal(veriGecerliMi({ ...veri, taksitler: [{ ...tablet, sayi: undefined }] }), false);
  assert.equal(veriGecerliMi({ ...veri, taksitler: [{ ...tablet, onceki: 2500000 }] }), false);
});

test('ortak ev: yedek doğrulaması bozuk kişi sayısını reddeder', () => {
  const veri = harcamaVerisi();
  assert.equal(veriGecerliMi({ ...veri, ortakKisi: 3 }), true);
  assert.equal(veriGecerliMi({ ...veri, ortakKisi: 1 }), false);
  assert.equal(veriGecerliMi({ ...veri, ortakKisi: '3' }), false);
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

test('birikim miktarı: gram ondalıklı, adet tam, Türkçe yazım', async () => {
  const { miktarCoz, miktarYaz, bugunkuDeger } = await import('../birikim.js');
  assert.equal(miktarCoz('2,5', 'gram'), 2500);
  assert.equal(miktarCoz('0,125', 'gram'), 125);
  assert.equal(miktarCoz('1.250', 'dolar'), 1250000);
  assert.equal(miktarCoz('1,5', 'ceyrek'), null);
  assert.equal(miktarCoz('2', 'ceyrek'), 2000);
  assert.equal(miktarCoz('0', 'gram'), null);
  assert.equal(miktarCoz('abc', 'gram'), null);
  assert.equal(miktarYaz(2500, 'gram'), '2,5 gram');
  assert.equal(miktarYaz(1250000, 'dolar'), '1.250 dolar');
  assert.equal(bugunkuDeger(2500, 6000), 1500000);
});

test('ay ay özet üstüne ekleyerek gider, önceki yıl da sayılır', async () => {
  const { aylikOzet } = await import('../birikim.js');
  const birikimler = [
    { id: '1', tur: 'gram', islem: 'alis', miktar: 3000, tarih: '2026-12-05' },
    { id: '2', tur: 'gram', islem: 'alis', miktar: 2000, tarih: '2027-01-05' },
    { id: '3', tur: 'gram', islem: 'satis', miktar: 1000, tarih: '2027-02-05' },
    { id: '4', tur: 'dolar', islem: 'alis', miktar: 9000, tarih: '2027-02-06' },
  ];
  const ozet = aylikOzet({ birikimler }, 'gram', '2027');
  assert.deepEqual(ozet.aylar.map((a) => a.toplam), [5000, 4000]);
  assert.equal(ozet.alinan, 2000);
  assert.equal(ozet.satilan, 1000);
});

test('satış parayı artırır, birikim alışı azaltır', () => {
  const donem = { para: 1000, hareketler: [{ tur: 'birikim', kurus: 300 }, { tur: 'satis', kurus: 100 }] };
  assert.equal(kalanPara(donem), 800);
});

test('fiyat çözümü bozuk ve sıfır değerleri almaz, hafta sonu kapalıdır', async () => {
  const { fiyatCoz, tcmbCoz, piyasaDurumu } = await import('../piyasa.js');
  assert.equal(fiyatCoz({ USD: { Buying: 1, Selling: 2 } }), null);
  assert.equal(fiyatCoz('bozuk'), null);
  const sonuc = fiyatCoz({ Update_Date: '2026-10-30 10:52:01', USD: { Buying: 0, Selling: 2 }, GRA: { Buying: 5, Selling: 6, Change: 'x' } });
  assert.deepEqual(sonuc, { tarih: '2026-10-30', saat: '10:52', fiyatlar: { GRA: { alis: 5, satis: 6, degisim: null } } });
  assert.equal(tcmbCoz({ tarih: 'dün' }), null);
  assert.equal(piyasaDurumu(null, 0, '2026-10-30'), 'yok');
  const kayit = { tarih: '2026-10-30', alindi: 0 };
  assert.equal(piyasaDurumu(kayit, 60000, '2026-10-30'), 'guncel');
  assert.equal(piyasaDurumu(kayit, 3600000, '2026-10-30'), 'eski');
  assert.equal(piyasaDurumu(kayit, 60000, '2026-10-31'), 'kapali');
});

test('birikimli yedek geçerlidir, bozuk birikim reddedilir', () => {
  const temel = { surum: 1, ad: 'Ev', ayar: ilkAyar(15), donemler: { '2026-10-15': { para: 1, hareketler: [{ tur: 'birikim', kurus: 5, tarih: '2026-10-16', birikimId: 'b1', ad: 'Gram altın' }] } } };
  const kayit = { id: 'b1', tur: 'gram', islem: 'alis', miktar: 1000, tarih: '2026-10-16', kurus: 5, paradan: true };
  assert.equal(veriGecerliMi({ ...temel, birikimler: [kayit] }), true);
  assert.equal(veriGecerliMi({ ...temel, birikimler: [{ ...kayit, tur: 'gumus' }] }), false);
  assert.equal(veriGecerliMi({ ...temel, birikimler: [{ ...kayit, miktar: 0 }] }), false);
});
