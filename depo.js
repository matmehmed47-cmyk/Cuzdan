const ANAHTAR = 'cuzdan.v1';
const TARIH = /^\d{4}-\d{2}-\d{2}$/;

export function veriGecerliMi(veri) {
  if (!veri || typeof veri !== 'object' || veri.surum !== 1) return false;
  if (typeof veri.ad !== 'string' || !veri.ad.trim() || veri.ad.length > 30) return false;

  const ayar = veri.ayar;
  if (!ayar || !Array.isArray(ayar.kurallar) || !ayar.kurallar.length) return false;
  const kurallarDogru = ayar.kurallar.every(
    (k) => TARIH.test(k?.gecerli) && Number.isInteger(k?.gun) && k.gun >= 1 && k.gun <= 31,
  );
  if (!kurallarDogru) return false;
  if (!ayar.kaydirma || typeof ayar.kaydirma !== 'object') return false;
  const kaydirmaDogru = Object.entries(ayar.kaydirma).every(
    ([asil, yeni]) => TARIH.test(asil) && TARIH.test(yeni),
  );
  if (!kaydirmaDogru) return false;

  if (!veri.donemler || typeof veri.donemler !== 'object') return false;
  return Object.entries(veri.donemler).every(
    ([tarih, donem]) => TARIH.test(tarih) && Number.isSafeInteger(donem?.para) && donem.para >= 0,
  );
}

export function yukle() {
  try {
    const metin = localStorage.getItem(ANAHTAR);
    if (!metin) return { veri: null, bozuk: false };
    const veri = JSON.parse(metin);
    return veriGecerliMi(veri) ? { veri, bozuk: false } : { veri: null, bozuk: true };
  } catch {
    return { veri: null, bozuk: true };
  }
}

export function kaydet(veri) {
  try {
    localStorage.setItem(ANAHTAR, JSON.stringify(veri));
    return true;
  } catch {
    return false;
  }
}

export function temizle() {
  try {
    localStorage.removeItem(ANAHTAR);
    return true;
  } catch {
    return false;
  }
}

export function yedekCoz(metin) {
  try {
    const veri = JSON.parse(metin);
    return veriGecerliMi(veri) ? veri : null;
  } catch {
    return null;
  }
}
