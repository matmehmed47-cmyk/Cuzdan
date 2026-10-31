// Söylenen cümleden tutar, kategori ve not çıkarır. Sonuç formu doldurur, kaydı kullanıcı yapar.

const BIRLER = { bir: 1, iki: 2, üç: 3, dört: 4, beş: 5, altı: 6, yedi: 7, sekiz: 8, dokuz: 9 };
const ONLAR = { on: 10, yirmi: 20, otuz: 30, kırk: 40, elli: 50, altmış: 60, yetmiş: 70, seksen: 80, doksan: 90 };
const SAYI_SOZU = new Set([...Object.keys(BIRLER), ...Object.keys(ONLAR), 'yüz', 'bin']);
const DOLGU = new Set(['lira', 'tl', 'türk', 'kuruş', 'aldım', 'harcadım', 'ödedim', 'verdim', 've']);

function sozdenSayi(sozler) {
  let toplam = 0;
  let yerel = 0;
  for (const soz of sozler) {
    if (soz === 'bin') {
      toplam += (yerel || 1) * 1000;
      yerel = 0;
    } else if (soz === 'yüz') {
      yerel = (yerel || 1) * 100;
    } else {
      yerel += BIRLER[soz] ?? ONLAR[soz];
    }
  }
  return toplam + yerel;
}

function rakamdanKurus(soz) {
  const temiz = soz.replace(/tl$|₺/g, '');
  const eslesme = temiz.match(/^(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?$/);
  if (!eslesme) return null;
  return Number(eslesme[1].replaceAll('.', '')) * 100 + Number((eslesme[2] ?? '').padEnd(2, '0') || 0);
}

// Sıradaki sayıyı bulur; rakamla ya da sözle söylenmiş olabilir.
function sayiBul(parcalar, bas) {
  for (let i = bas; i < parcalar.length; i += 1) {
    const rakam = rakamdanKurus(parcalar[i]);
    if (rakam !== null) return { kurus: rakam, bas: i, son: i + 1 };
    if (SAYI_SOZU.has(parcalar[i])) {
      let son = i;
      while (SAYI_SOZU.has(parcalar[son])) son += 1;
      return { kurus: sozdenSayi(parcalar.slice(i, son)) * 100, bas: i, son };
    }
  }
  return null;
}

export function konusmaCoz(metin, kategoriler) {
  const kucuk = String(metin ?? '').toLocaleLowerCase('tr-TR').trim();
  let parcalar = kucuk.split(/\s+/).filter(Boolean);

  const sayi = sayiBul(parcalar, 0);
  let kurus = sayi?.kurus ?? null;
  if (sayi) {
    const kurusSayi = sayiBul(parcalar, sayi.son);
    const kurusKismi = kurusSayi && parcalar[kurusSayi.son] === 'kuruş';
    if (kurusKismi) {
      kurus += kurusSayi.kurus / 100;
      parcalar = parcalar.filter((_, i) => i < kurusSayi.bas || i >= kurusSayi.son);
    }
    parcalar = parcalar.filter((_, i) => i < sayi.bas || i >= sayi.son);
  }

  const kategori = [...kategoriler]
    .sort((a, b) => b.length - a.length)
    .find((ad) => kucuk.includes(ad.toLocaleLowerCase('tr-TR'))) ?? null;
  if (kategori) {
    const sozler = kategori.toLocaleLowerCase('tr-TR').split(/\s+/);
    parcalar = parcalar.filter((p) => !sozler.some((s) => p.includes(s)));
  }

  const not = parcalar.filter((p) => !DOLGU.has(p)).join(' ').slice(0, 80);
  return { kurus: kurus || null, kategori, not };
}
