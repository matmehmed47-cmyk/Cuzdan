// Para her yerde kuruş olarak tam sayı tutulur; ondalık hata oluşmaz.

const EN_BUYUK = 999999999999;

export function paraCoz(metin) {
  const temiz = String(metin ?? '').replace(/₺|tl|\s/gi, '');
  if (!temiz) return null;

  let lira;
  let kurus = '';
  let eslesme;
  if ((eslesme = temiz.match(/^(\d{1,3}(?:\.\d{3})+)(?:,(\d{1,2}))?$/))) {
    lira = eslesme[1].replaceAll('.', '');
    kurus = eslesme[2] ?? '';
  } else if ((eslesme = temiz.match(/^(\d+)(?:[,.](\d{1,2}))?$/))) {
    lira = eslesme[1];
    kurus = eslesme[2] ?? '';
  } else {
    return null;
  }

  const sonuc = Number(lira) * 100 + Number(kurus.padEnd(2, '0') || 0);
  return Number.isSafeInteger(sonuc) && sonuc <= EN_BUYUK ? sonuc : null;
}

export function paraYaz(kurus) {
  const isaret = kurus < 0 ? '-' : '';
  const mutlak = Math.abs(kurus);
  const lira = String(Math.floor(mutlak / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const artan = String(mutlak % 100).padStart(2, '0');
  return `${isaret}${lira},${artan} TL`;
}
