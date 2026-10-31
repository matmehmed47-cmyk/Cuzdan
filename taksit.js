// Taksit ödemeleri dönemin hareketlerinde durur; kalan borç her seferinde bu kayıtlardan hesaplanır.

import { ayIleri, vadeBul } from './fatura.js';

export function taksitOdemeleri(veri, id) {
  const liste = [];
  for (const [baslangic, kayit] of Object.entries(veri.donemler)) {
    for (const h of kayit.hareketler ?? []) {
      if (h.tur === 'taksit' && h.taksitId === id) liste.push({ ...h, baslangic });
    }
  }
  return liste.sort((a, b) => a.tarih.localeCompare(b.tarih));
}

export function taksitDurumu(veri, taksit) {
  const odemeler = taksitOdemeleri(veri, taksit.id);
  const onceki = taksit.onceki ?? 0;
  const odenen = onceki + odemeler.reduce((t, h) => t + h.kurus, 0);
  const oncekiAdet = taksit.sayi ? Math.round((onceki * taksit.sayi) / taksit.toplam) : 0;
  return {
    odemeler,
    odenen,
    kalan: Math.max(taksit.toplam - odenen, 0),
    odenenAdet: oncekiAdet + odemeler.length,
  };
}

// Az ya da çok ödenirse kalan borç, kalan taksitlere yeniden bölünür.
export function bekleyenTaksitler(veri, taksit, sinir, bugun) {
  const { odemeler, kalan, odenenAdet } = taksitDurumu(veri, taksit);
  const odenmisAylar = new Set(odemeler.map((h) => h.ay));
  const liste = [];
  let artan = kalan;
  let adet = taksit.sayi ? Math.max(taksit.sayi - odenenAdet, 1) : null;

  for (let ay = taksit.ilkAy; artan > 0 && vadeBul(ay, taksit.gun) <= sinir; ay = ayIleri(ay)) {
    if (odenmisAylar.has(ay)) continue;
    const vade = vadeBul(ay, taksit.gun);
    const kurus = adet ? Math.min(Math.ceil(artan / adet), artan) : null;
    liste.push({ taksitId: taksit.id, ad: taksit.ad, tur: 'taksit', ay, vade, kurus, durum: vade < bugun ? 'gecikti' : 'bekliyor' });
    if (adet) {
      artan -= kurus;
      adet = Math.max(adet - 1, 1);
    }
  }
  return liste;
}

export function donemTaksitleri(veri, donem, bugun) {
  return (veri.taksitler ?? []).flatMap((t) => bekleyenTaksitler(veri, t, donem.bitis, bugun));
}

// Taksit sayısı girilmemişse bitiş tarihi bilinemez.
export function taksitBitisi(veri, taksit, bugun) {
  if (!taksit.sayi) return null;
  return bekleyenTaksitler(veri, taksit, '9999-12-31', bugun).at(-1)?.ay ?? null;
}

export function gelecekAylar(veri, bugun, adet = 6) {
  const aylar = [];
  for (let ay = bugun.slice(0, 7); aylar.length < adet; ay = ayIleri(ay)) aylar.push({ ay, kurus: 0 });
  const sinir = vadeBul(aylar.at(-1).ay, 31);
  for (const taksit of veri.taksitler ?? []) {
    for (const k of bekleyenTaksitler(veri, taksit, sinir, bugun)) {
      const hedef = aylar.find((a) => a.ay === k.ay) ?? aylar[0];
      hedef.kurus += k.kurus ?? 0;
    }
  }
  return aylar;
}

export function taksitEkle(veri, taksit) {
  return { ...veri, taksitler: [...(veri.taksitler ?? []), taksit] };
}

export function taksitGuncelle(veri, id, degisen) {
  return { ...veri, taksitler: veri.taksitler.map((t) => (t.id === id ? { ...t, ...degisen } : t)) };
}

// Ödenmiş kayıtlar dönemlerde kalır; silinen sadece taksit tanımıdır.
export function taksitSil(veri, id) {
  return { ...veri, taksitler: veri.taksitler.filter((t) => t.id !== id) };
}

export function taksitOde(veri, baslangic, kalem, kurus, bugun) {
  const kayit = veri.donemler[baslangic];
  const hareket = { tur: 'taksit', kurus, tarih: bugun, taksitId: kalem.taksitId, ay: kalem.ay, ad: kalem.ad };
  return { ...veri, donemler: { ...veri.donemler, [baslangic]: { ...kayit, hareketler: [...(kayit.hareketler ?? []), hareket] } } };
}

export function taksitOdemeGeriAl(veri, baslangic, id, ay) {
  const kayit = veri.donemler[baslangic];
  const hareketler = kayit.hareketler.filter((h) => !(h.tur === 'taksit' && h.taksitId === id && h.ay === ay));
  return { ...veri, donemler: { ...veri.donemler, [baslangic]: { ...kayit, hareketler } } };
}
