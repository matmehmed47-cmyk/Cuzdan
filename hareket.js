// Bir dönemin tüm para hareketleri tek listede; sira, kaydın dönem içindeki yeridir ve düzeltmede kullanılır.

import { GIREN_TURLER } from './para.js';

export const GRUPLAR = [
  ['hepsi', 'Hepsi', null],
  ['harcama', 'Harcama', ['harcama']],
  ['gelir', 'Gelir', ['gelir']],
  ['odeme', 'Ödeme', ['fatura', 'taksit']],
  ['birikim', 'Birikim', ['birikim', 'satis']],
  ['borc', 'Borç', ['defter', 'tahsil']],
];

export function girenMi(hareket) {
  return GIREN_TURLER.includes(hareket.tur);
}

export function hareketListesi(kayit, grup = 'hepsi') {
  const turler = GRUPLAR.find(([kod]) => kod === grup)[2];
  return (kayit.hareketler ?? [])
    .map((h, sira) => ({ ...h, sira }))
    .filter((h) => !turler || turler.includes(h.tur))
    .sort((a, b) => b.tarih.localeCompare(a.tarih) || b.sira - a.sira);
}

export function hareketToplamlari(kayit) {
  const liste = kayit.hareketler ?? [];
  const toplam = (kosul) => liste.filter(kosul).reduce((t, h) => t + h.kurus, 0);
  return { giren: toplam(girenMi), cikan: toplam((h) => !girenMi(h)) };
}

export function gunlereAyir(liste) {
  const gunler = new Map();
  for (const hareket of liste) gunler.set(hareket.tarih, [...(gunler.get(hareket.tarih) ?? []), hareket]);
  return [...gunler.entries()];
}
