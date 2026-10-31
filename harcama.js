// Harcama kaydı dönemin hareketler listesinde durur; düzeltme ve silme için listedeki sırası kullanılır.

export const VARSAYILAN_KATEGORILER = ['Market', 'Yemek', 'Ulaşım', 'Ev', 'Sağlık', 'Giyim', 'Eğlence'];
export const DIGER = 'Diğer';
export const KAYITSIZ = 'Kayıtsız';

function ayniAd(a, b) {
  return a.toLocaleLowerCase('tr') === b.toLocaleLowerCase('tr');
}

export function kategoriler(veri) {
  return veri.kategoriler ?? VARSAYILAN_KATEGORILER;
}

// Eşit sayıda kullanılanlar listedeki sırasını korur.
export function siraliKategoriler(veri) {
  const sayac = new Map();
  for (const kayit of Object.values(veri.donemler)) {
    for (const h of kayit.hareketler ?? []) {
      if (h.tur === 'harcama' && h.kategori) sayac.set(h.kategori, (sayac.get(h.kategori) ?? 0) + 1);
    }
  }
  return [...kategoriler(veri)].sort((a, b) => (sayac.get(b) ?? 0) - (sayac.get(a) ?? 0));
}

export function kategoriEkle(veri, ad) {
  if (ayniAd(ad, DIGER)) return { veri, ad: undefined };
  const liste = kategoriler(veri);
  const mevcut = liste.find((k) => ayniAd(k, ad));
  return mevcut ? { veri, ad: mevcut } : { veri: { ...veri, kategoriler: [...liste, ad] }, ad };
}

export function kategoriAdDegistir(veri, eski, yeni) {
  const hedef = kategoriler(veri).find((k) => k !== eski && ayniAd(k, yeni)) ?? yeni;
  const liste = [...new Set(kategoriler(veri).map((k) => (k === eski ? hedef : k)))];
  const donemler = Object.fromEntries(
    Object.entries(veri.donemler).map(([tarih, kayit]) => [
      tarih,
      kayit.hareketler
        ? { ...kayit, hareketler: kayit.hareketler.map((h) => (h.kategori === eski ? { ...h, kategori: hedef } : h)) }
        : kayit,
    ]),
  );
  return { ...veri, kategoriler: liste, donemler };
}

// Eski kayıtlar silinen kategorinin adıyla kalır.
export function kategoriSil(veri, ad) {
  return { ...veri, kategoriler: kategoriler(veri).filter((k) => k !== ad) };
}

function hareketleriYaz(veri, baslangic, hareketler) {
  return { ...veri, donemler: { ...veri.donemler, [baslangic]: { ...veri.donemler[baslangic], hareketler } } };
}

export function harcamaEkle(veri, baslangic, bilgi) {
  return hareketleriYaz(veri, baslangic, [...(veri.donemler[baslangic].hareketler ?? []), { tur: 'harcama', ...bilgi }]);
}

export function harcamaGuncelle(veri, baslangic, sira, bilgi) {
  const hareketler = veri.donemler[baslangic].hareketler.map((h, i) => (i === sira ? { ...h, ...bilgi } : h));
  return hareketleriYaz(veri, baslangic, hareketler);
}

export function harcamaSil(veri, baslangic, sira) {
  return hareketleriYaz(veri, baslangic, veri.donemler[baslangic].hareketler.filter((_, i) => i !== sira));
}

export function harcamaListesi(kayit) {
  return (kayit.hareketler ?? [])
    .map((h, sira) => ({ ...h, sira }))
    .filter((h) => h.tur === 'harcama')
    .sort((a, b) => b.tarih.localeCompare(a.tarih) || b.sira - a.sira);
}

export function kategoriToplamlari(kayit) {
  const toplamlar = new Map();
  for (const h of harcamaListesi(kayit)) {
    const ad = h.kategori ?? DIGER;
    toplamlar.set(ad, (toplamlar.get(ad) ?? 0) + h.kurus);
  }
  return [...toplamlar].map(([ad, kurus]) => ({ ad, kurus })).sort((a, b) => b.kurus - a.kurus);
}
