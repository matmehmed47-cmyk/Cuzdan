// Fiyatlar para kaydı değildir; yaklaşık gösterim için ondalık sayı olarak tutulur.

export const KAYNAK = 'https://finans.truncgil.com/v4/today.json';
export const KAYNAK_ADI = 'Trunçgil Finans';
export const TCMB_DOSYA = './tcmb.json';
export const YENILEME_SURESI = 5 * 60 * 1000;
export const ELLE_YENILEME_SURESI = 30 * 1000;
const GUNCEL_SURE = 15 * 60 * 1000;
const ANAHTAR = 'cuzdan.piyasa';

export const DOVIZLER = [
  { kod: 'USD', ad: 'Dolar', kisa: '$' },
  { kod: 'EUR', ad: 'Euro', kisa: '€' },
];

export const ALTINLAR = [
  { kod: 'GRA', ad: 'Gram altın' },
  { kod: 'CEYREKALTIN', ad: 'Çeyrek altın' },
  { kod: 'YARIMALTIN', ad: 'Yarım altın' },
  { kod: 'TAMALTIN', ad: 'Tam altın' },
  { kod: 'CUMHURIYETALTINI', ad: 'Cumhuriyet altını' },
  { kod: 'ATAALTIN', ad: 'Ata altın' },
  { kod: 'HAS', ad: 'Has altın (gram)' },
  { kod: 'YIA', ad: '22 ayar bilezik (gram)' },
];

const fiyatMi = (sayi) => Number.isFinite(sayi) && sayi > 0;

export function fiyatCoz(json) {
  const zaman = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})/.exec(json?.Update_Date ?? '');
  if (!zaman) return null;
  const fiyatlar = {};
  for (const { kod } of [...DOVIZLER, ...ALTINLAR]) {
    const kalem = json[kod];
    if (fiyatMi(kalem?.Buying) && fiyatMi(kalem?.Selling)) {
      fiyatlar[kod] = {
        alis: kalem.Buying,
        satis: kalem.Selling,
        degisim: Number.isFinite(kalem.Change) ? kalem.Change : null,
      };
    }
  }
  return Object.keys(fiyatlar).length ? { tarih: zaman[1], saat: zaman[2], fiyatlar } : null;
}

export function tcmbCoz(json) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(json?.tarih ?? '')) return null;
  const fiyatlar = {};
  for (const { kod } of DOVIZLER) {
    const kalem = json[kod];
    if (fiyatMi(kalem?.alis) && fiyatMi(kalem?.satis)) fiyatlar[kod] = { alis: kalem.alis, satis: kalem.satis, degisim: null };
  }
  return Object.keys(fiyatlar).length ? { tarih: json.tarih, fiyatlar } : null;
}

export function haftaSonuMu(tarih) {
  const [y, a, g] = tarih.split('-').map(Number);
  const gun = new Date(Date.UTC(y, a - 1, g)).getUTCDay();
  return gun === 0 || gun === 6;
}

// Resmî tatiller bilinmez; o günler de güncel görünebilir.
export function piyasaDurumu(kayit, simdi, bugun) {
  if (!kayit) return 'yok';
  if (haftaSonuMu(bugun)) return 'kapali';
  return simdi - kayit.alindi <= GUNCEL_SURE && kayit.tarih === bugun ? 'guncel' : 'eski';
}

export function fiyatYaz(sayi, ondalik = 2) {
  return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik }).format(sayi);
}

// Kullanıcı TL verip satın aldığı için satış fiyatı kullanılır.
export function neAlir(kurus, fiyat) {
  return kurus / 100 / fiyat;
}

export function piyasaYukle() {
  try {
    const kayit = JSON.parse(localStorage.getItem(ANAHTAR));
    return kayit?.fiyatlar && Number.isFinite(kayit.alindi) ? kayit : null;
  } catch {
    return null;
  }
}

export function piyasaKaydet(kayit) {
  try {
    localStorage.setItem(ANAHTAR, JSON.stringify(kayit));
  } catch {
    // Saklanamasa da fiyat ekranda görünür.
  }
}
