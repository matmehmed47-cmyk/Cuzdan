import { TURLER } from './birikim.js';

const ANAHTAR = 'cuzdan.v1';
const TARIH = /^\d{4}-\d{2}-\d{2}$/;
const AY = /^\d{4}-(0[1-9]|1[0-2])$/;

function faturaHareketi(h) {
  return h?.tur === 'fatura' && typeof h.faturaId === 'string' && AY.test(h.ay) && typeof h.ad === 'string';
}

function taksitHareketi(h) {
  return h?.tur === 'taksit' && typeof h.taksitId === 'string' && AY.test(h.ay) && typeof h.ad === 'string';
}

function birikimHareketi(h) {
  return (h?.tur === 'birikim' || h?.tur === 'satis') && typeof h.birikimId === 'string' && typeof h.ad === 'string';
}

function hareketlerGecerli(hareketler) {
  if (hareketler === undefined) return true;
  return (
    Array.isArray(hareketler) &&
    hareketler.every(
      (h) =>
        (h?.tur === 'harcama' || h?.tur === 'gelir' || faturaHareketi(h) || taksitHareketi(h) || birikimHareketi(h)) &&
        TARIH.test(h.tarih) &&
        Number.isSafeInteger(h.kurus) &&
        h.kurus > 0 &&
        (h.kategori === undefined || (typeof h.kategori === 'string' && h.kategori.length <= 20)) &&
        (h.not === undefined || (typeof h.not === 'string' && h.not.length <= 80)) &&
        (h.ortak === undefined || h.ortak === true) &&
        (h.kaynak === undefined || (typeof h.kaynak === 'string' && h.kaynak.length <= 20)),
    )
  );
}

function ortakKisiGecerli(kisi) {
  return kisi === undefined || (Number.isInteger(kisi) && kisi >= 2 && kisi <= 20);
}

function taksitlerGecerli(taksitler) {
  if (taksitler === undefined) return true;
  return (
    Array.isArray(taksitler) &&
    taksitler.every(
      (t) =>
        typeof t?.id === 'string' &&
        t.id &&
        typeof t.ad === 'string' &&
        t.ad.trim() &&
        t.ad.length <= 40 &&
        (t.tur === 'sabit' || t.tur === 'degisken') &&
        Number.isSafeInteger(t.toplam) &&
        t.toplam > 0 &&
        Number.isInteger(t.gun) &&
        t.gun >= 1 &&
        t.gun <= 31 &&
        AY.test(t.ilkAy) &&
        (t.sayi === undefined || (Number.isInteger(t.sayi) && t.sayi >= 1 && t.sayi <= 120)) &&
        (t.tur === 'degisken' || t.sayi !== undefined) &&
        (t.onceki === undefined || (Number.isSafeInteger(t.onceki) && t.onceki > 0 && t.onceki < t.toplam)),
    )
  );
}

function birikimlerGecerli(birikimler) {
  if (birikimler === undefined) return true;
  return (
    Array.isArray(birikimler) &&
    birikimler.every(
      (b) =>
        typeof b?.id === 'string' &&
        b.id &&
        Object.hasOwn(TURLER, b.tur) &&
        (b.islem === 'alis' || b.islem === 'satis') &&
        Number.isSafeInteger(b.miktar) &&
        b.miktar > 0 &&
        TARIH.test(b.tarih) &&
        (b.kurus === undefined || (Number.isSafeInteger(b.kurus) && b.kurus > 0)) &&
        (b.paradan === undefined || b.paradan === true) &&
        (!b.paradan || b.kurus !== undefined),
    )
  );
}

function bildirimGecerli(b) {
  if (b === undefined) return true;
  const saat = /^([01]\d|2[0-3]):[0-5]\d$/;
  return (
    typeof b === 'object' &&
    b !== null &&
    Number.isInteger(b.gunOnce) &&
    b.gunOnce >= 0 &&
    b.gunOnce <= 7 &&
    saat.test(b.saat) &&
    saat.test(b.gunSonuSaat) &&
    typeof b.maas === 'boolean' &&
    typeof b.gunSonu === 'boolean' &&
    (b.telefon === undefined || typeof b.telefon === 'boolean') &&
    (b.altSinir === undefined || (Number.isSafeInteger(b.altSinir) && b.altSinir > 0))
  );
}

function kategorilerGecerli(kategoriler) {
  if (kategoriler === undefined) return true;
  return (
    Array.isArray(kategoriler) &&
    kategoriler.every((k) => typeof k === 'string' && k.trim() && k.length <= 20)
  );
}

function faturalarGecerli(faturalar) {
  if (faturalar === undefined) return true;
  return (
    Array.isArray(faturalar) &&
    faturalar.every(
      (f) =>
        typeof f?.id === 'string' &&
        f.id &&
        typeof f.ad === 'string' &&
        f.ad.trim() &&
        f.ad.length <= 40 &&
        (f.tur === 'sabit' || f.tur === 'degisken') &&
        Number.isInteger(f.gun) &&
        f.gun >= 1 &&
        f.gun <= 31 &&
        AY.test(f.ilkAy) &&
        (f.kurus === undefined || (Number.isSafeInteger(f.kurus) && f.kurus > 0)) &&
        (f.tur === 'degisken' || f.kurus !== undefined) &&
        (f.atlanan === undefined || (Array.isArray(f.atlanan) && f.atlanan.every((a) => AY.test(a)))),
    )
  );
}

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

  if (!faturalarGecerli(veri.faturalar) || !kategorilerGecerli(veri.kategoriler)) return false;
  if (!ortakKisiGecerli(veri.ortakKisi) || !kategorilerGecerli(veri.kaynaklar)) return false;
  if (!taksitlerGecerli(veri.taksitler) || !birikimlerGecerli(veri.birikimler) || !bildirimGecerli(veri.bildirim)) return false;
  if (!veri.donemler || typeof veri.donemler !== 'object') return false;
  return Object.entries(veri.donemler).every(
    ([tarih, donem]) => TARIH.test(tarih) && Number.isSafeInteger(donem?.para) && hareketlerGecerli(donem.hareketler),
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
