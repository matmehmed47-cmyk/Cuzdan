// Her ödeme fatura kimliği ve 'YYYY-AA' ile eşleşir; ödeme günü değişse de ay aynı kaldığı için kayıt kaybolmaz.

import { ayinGunu, gunEkle } from './donem.js';

const ILERI_GUN = 400;

export function ayIleri(ay) {
  const [y, a] = ay.split('-').map(Number);
  return a === 12 ? `${y + 1}-01` : `${y}-${String(a + 1).padStart(2, '0')}`;
}

export function ayGeri(ay) {
  const [y, a] = ay.split('-').map(Number);
  return a === 1 ? `${y - 1}-12` : `${y}-${String(a - 1).padStart(2, '0')}`;
}

export function vadeBul(ay, gun) {
  const [y, a] = ay.split('-').map(Number);
  return ayinGunu(y, a, gun);
}

function odemeDizini(veri) {
  const dizin = new Map();
  for (const [baslangic, kayit] of Object.entries(veri.donemler)) {
    for (const hareket of kayit.hareketler ?? []) {
      if (hareket.tur === 'fatura') dizin.set(`${hareket.faturaId}|${hareket.ay}`, { hareket, baslangic });
    }
  }
  return dizin;
}

export function bekliyorMu(kalem) {
  return kalem.durum === 'gecikti' || kalem.durum === 'bekliyor';
}

// Ödenmeyen fatura kendiliğinden sonraki döneme geçer: ilk aydan bu dönemin sonuna kadar her ay taranır.
export function donemKalemleri(veri, donem, bugun) {
  const odemeler = odemeDizini(veri);
  const kalemler = [];

  for (const fatura of veri.faturalar ?? []) {
    let sonTutar = null;
    for (let ay = fatura.ilkAy; vadeBul(ay, fatura.gun) <= donem.bitis; ay = ayIleri(ay)) {
      const vade = vadeBul(ay, fatura.gun);
      const odeme = odemeler.get(`${fatura.id}|${ay}`);
      const temel = { faturaId: fatura.id, ad: fatura.ad, tur: fatura.tur, ay, vade };
      // Tutarı boş fatura geçen ayın tutarıyla ayrılır, yoksa serbest para olduğundan fazla görünür.
      const tutar = { kurus: fatura.kurus ?? sonTutar, tahmin: fatura.kurus === undefined && sonTutar !== null };

      if (odeme) {
        sonTutar = odeme.hareket.kurus;
        const buDonemde = odeme.baslangic === donem.baslangic;
        if (buDonemde || vade >= donem.baslangic) {
          kalemler.push({ ...temel, kurus: odeme.hareket.kurus, durum: 'odendi', geriAlinabilir: buDonemde });
        }
      } else if (fatura.atlanan?.includes(ay)) {
        if (vade >= donem.baslangic) kalemler.push({ ...temel, ...tutar, durum: 'atlandi' });
      } else {
        kalemler.push({ ...temel, ...tutar, durum: vade < bugun ? 'gecikti' : 'bekliyor' });
      }
    }
  }

  return kalemler.sort((a, b) => Number(bekliyorMu(b)) - Number(bekliyorMu(a)) || a.vade.localeCompare(b.vade));
}

// Faturayı erken ödemek için bu dönemin ötesindeki aylar da görünür.
export function ileriKalemler(veri, donem, bugun) {
  return donemKalemleri(veri, { baslangic: donem.baslangic, bitis: gunEkle(bugun, ILERI_GUN) }, bugun);
}

export function ayrilanTutar(kalemler) {
  return kalemler.filter(bekliyorMu).reduce((toplam, k) => toplam + (k.kurus ?? 0), 0);
}

// Bu dönemde günü geçmiş bir ödeme varsa onu da sorabilmek için gecmisAy döner.
export function baslangicAyi(gun, bugun, baslangic) {
  const buAy = bugun.slice(0, 7);
  const gelecek = vadeBul(buAy, gun) >= bugun;
  const gecmisAy = gelecek ? ayGeri(buAy) : buAy;
  const gecmisTarih = vadeBul(gecmisAy, gun);
  return {
    ilkAy: gelecek ? buAy : ayIleri(buAy),
    gecmisAy: gecmisTarih >= baslangic ? gecmisAy : null,
    gecmisTarih,
  };
}

// Bugünkü kart alışverişi sıradaki ekstreye girer; son ödeme günü kesimden sonraki ilk o gündür.
export function kartOdemeTarihi(kesim, gun, bugun) {
  const buAy = bugun.slice(0, 7);
  const kesimAyi = vadeBul(buAy, kesim) >= bugun ? buAy : ayIleri(buAy);
  const odeme = vadeBul(kesimAyi, gun);
  return odeme > vadeBul(kesimAyi, kesim) ? odeme : vadeBul(ayIleri(kesimAyi), gun);
}

export function faturaEkle(veri, fatura) {
  return { ...veri, faturalar: [...(veri.faturalar ?? []), fatura] };
}

export function faturaGuncelle(veri, id, degisen) {
  return { ...veri, faturalar: veri.faturalar.map((f) => (f.id === id ? { ...f, ...degisen } : f)) };
}

// Ödenmiş kayıtlar dönemlerde kalır; silinen sadece fatura tanımıdır.
export function faturaSil(veri, id) {
  return { ...veri, faturalar: veri.faturalar.filter((f) => f.id !== id) };
}

export function faturaOde(veri, baslangic, kalem, kurus, bugun) {
  if (odemeDizini(veri).has(`${kalem.faturaId}|${kalem.ay}`)) return veri;
  const kayit = veri.donemler[baslangic];
  const hareket = { tur: 'fatura', kurus, tarih: bugun, faturaId: kalem.faturaId, ay: kalem.ay, ad: kalem.ad };
  const hareketler = [...(kayit.hareketler ?? []), hareket];
  return { ...veri, donemler: { ...veri.donemler, [baslangic]: { ...kayit, hareketler } } };
}

export function odemeGeriAl(veri, baslangic, kalem) {
  const kayit = veri.donemler[baslangic];
  const hareketler = kayit.hareketler.filter(
    (h) => !(h.tur === 'fatura' && h.faturaId === kalem.faturaId && h.ay === kalem.ay),
  );
  return { ...veri, donemler: { ...veri.donemler, [baslangic]: { ...kayit, hareketler } } };
}

export function ayAtla(veri, id, ay) {
  const fatura = veri.faturalar.find((f) => f.id === id);
  return faturaGuncelle(veri, id, { atlanan: [...(fatura.atlanan ?? []), ay] });
}

export function atlamaGeriAl(veri, id, ay) {
  const fatura = veri.faturalar.find((f) => f.id === id);
  return faturaGuncelle(veri, id, { atlanan: fatura.atlanan.filter((a) => a !== ay) });
}
