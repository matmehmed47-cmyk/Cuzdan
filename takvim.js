// Ödenmemiş ödemeler vade gününde, yapılmış işlemler kendi tarihinde görünür.

import { donemBul } from './donem.js';
import { bekliyorMu, donemKalemleri } from './fatura.js';
import { donemTaksitleri } from './taksit.js';

function ayGunSayisi(ay) {
  const [y, a] = ay.split('-').map(Number);
  return new Date(Date.UTC(y, a, 0)).getUTCDate();
}

// Pazartesi 0, pazar 6 olacak şekilde ayın ilk gününün sütunu.
export function ilkSutun(ay) {
  const [y, a] = ay.split('-').map(Number);
  return (new Date(Date.UTC(y, a - 1, 1)).getUTCDay() + 6) % 7;
}

export function takvimAyi(veri, ay, bugun) {
  const adet = ayGunSayisi(ay);
  const sinir = { baslangic: `${ay}-01`, bitis: `${ay}-${String(adet).padStart(2, '0')}` };
  const odemeler = [...donemKalemleri(veri, sinir, bugun), ...donemTaksitleri(veri, sinir, bugun)]
    .filter((k) => bekliyorMu(k) && k.vade >= sinir.baslangic);
  const hareketler = Object.values(veri.donemler).flatMap((d) => d.hareketler ?? []);

  return Array.from({ length: adet }, (_, i) => {
    const tarih = `${ay}-${String(i + 1).padStart(2, '0')}`;
    return {
      tarih,
      gun: i + 1,
      maas: donemBul(veri.ayar, tarih).baslangic === tarih,
      odemeler: odemeler.filter((k) => k.vade === tarih),
      hareketler: hareketler.filter((h) => h.tarih === tarih),
    };
  });
}
