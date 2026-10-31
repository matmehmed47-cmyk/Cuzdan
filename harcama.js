// Harcama kaydı dönemin hareketler listesinde durur; düzeltme ve silme için listedeki sırası kullanılır.

export const VARSAYILAN_KATEGORILER = ['Meyve sebze', 'Market', 'Yemek', 'Ulaşım', 'Ev', 'Sağlık', 'Giyim', 'Eğlence'];
export const VARSAYILAN_KAYNAKLAR = ['Ek ders', 'Ek iş', 'Hediye', 'Harçlık', 'Geri gelen borç'];
export const DIGER = 'Diğer';
export const EK_GELIR = 'Ek gelir';
export const KAYITSIZ = 'Kayıtsız';

function ayniAd(a, b) {
  return a.toLocaleLowerCase('tr') === b.toLocaleLowerCase('tr');
}

export function kategoriler(veri) {
  return veri.kategoriler ?? VARSAYILAN_KATEGORILER;
}

// Eşit sayıda kullanılanlar listedeki sırasını korur.
function sikligaGore(veri, liste, alan) {
  const sayac = new Map();
  for (const kayit of Object.values(veri.donemler)) {
    for (const h of kayit.hareketler ?? []) {
      if (h[alan]) sayac.set(h[alan], (sayac.get(h[alan]) ?? 0) + 1);
    }
  }
  return [...liste].sort((a, b) => (sayac.get(b) ?? 0) - (sayac.get(a) ?? 0));
}

export function siraliKategoriler(veri) {
  return sikligaGore(veri, kategoriler(veri), 'kategori');
}

export function siraliKaynaklar(veri) {
  return sikligaGore(veri, veri.kaynaklar ?? VARSAYILAN_KAYNAKLAR, 'kaynak');
}

export function kaynakEkle(veri, ad) {
  const liste = veri.kaynaklar ?? VARSAYILAN_KAYNAKLAR;
  const mevcut = liste.find((k) => ayniAd(k, ad));
  return mevcut ? { veri, ad: mevcut } : { veri: { ...veri, kaynaklar: [...liste, ad] }, ad };
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

export function hareketSil(veri, baslangic, sira) {
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

export function ortakListesi(kayit) {
  return harcamaListesi(kayit).filter((h) => h.ortak);
}

export function geriAlinanlar(kayit) {
  return (kayit.hareketler ?? [])
    .map((h, sira) => ({ ...h, sira }))
    .filter((h) => h.tur === 'gelir' && h.ortak)
    .sort((a, b) => b.tarih.localeCompare(a.tarih) || b.sira - a.sira);
}

// Arkadaşın payını verince tutar gelir olarak paraya eklenir, Ortak ekranında ayrı görünür.
export function geriAldimEkle(veri, baslangic, bilgi) {
  return hareketleriYaz(veri, baslangic, [...(veri.donemler[baslangic].hareketler ?? []), { tur: 'gelir', ortak: true, ...bilgi }]);
}

export function ortakOzet(kayit, kisi) {
  const toplamAl = (liste) => liste.reduce((t, h) => t + h.kurus, 0);
  const harcanan = toplamAl(ortakListesi(kayit));
  const geriAlinan = toplamAl(geriAlinanlar(kayit));
  return { harcanan, geriAlinan, kalan: harcanan - geriAlinan, kisiBasi: kisi ? Math.round(harcanan / kisi) : null };
}

// Ortak evden geri alınan para kendi ekranında durur, ek gelir sayılmaz.
export function gelirListesi(kayit) {
  return (kayit.hareketler ?? [])
    .map((h, sira) => ({ ...h, sira }))
    .filter((h) => h.tur === 'gelir' && !h.ortak)
    .sort((a, b) => b.tarih.localeCompare(a.tarih) || b.sira - a.sira);
}

export function gelirEkle(veri, baslangic, bilgi) {
  return hareketleriYaz(veri, baslangic, [...(veri.donemler[baslangic].hareketler ?? []), { tur: 'gelir', ...bilgi }]);
}

export function gelirOzet(kayit) {
  const ekGelir = gelirListesi(kayit).reduce((t, h) => t + h.kurus, 0);
  return { baslangic: kayit.para, ekGelir, toplam: kayit.para + ekGelir };
}
