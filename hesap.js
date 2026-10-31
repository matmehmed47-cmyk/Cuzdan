// Hesaplar tam kesirle yapılır; 0,1 + 0,2 gibi işlemlerde ondalık hata oluşmaz.

const EN_BUYUK_KURUS = 999999999999n;
const EN_COK_RAKAM = 15;
const EN_COK_PARCA = 61;
const EN_COK_ONDALIK = 8;
export const SIFIRA_BOLME = 'Sıfıra bölünemez';

function ebob(a, b) {
  let [x, y] = [a < 0n ? -a : a, b];
  while (y) [x, y] = [y, x % y];
  return x;
}

function kesir(pay, payda = 1n) {
  const bolen = ebob(pay, payda) || 1n;
  const isaret = payda < 0n ? -1n : 1n;
  return { pay: (pay * isaret) / bolen, payda: (payda * isaret) / bolen };
}

const topla = (a, b) => kesir(a.pay * b.payda + b.pay * a.payda, a.payda * b.payda);
const cikar = (a, b) => kesir(a.pay * b.payda - b.pay * a.payda, a.payda * b.payda);
const carp = (a, b) => kesir(a.pay * b.pay, a.payda * b.payda);
const bol = (a, b) => kesir(a.pay * b.payda, a.payda * b.pay);

function sayiCoz(metin) {
  const [tam, ondalik = ''] = metin.split(',');
  return kesir(BigInt(tam + ondalik), 10n ** BigInt(ondalik.length));
}

function parcaDegeri(parca) {
  const deger = parca.kesir ?? sayiCoz(parca.metin);
  return parca.yuzde ? carp(deger, kesir(1n, 100n)) : deger;
}

// Toplama ve çıkarmada yüzde, soldaki tutara göre alınır: 1.000 + %10 = 1.100.
export function hesapla(parcalar) {
  const liste = typeof parcalar.at(-1) === 'string' ? parcalar.slice(0, -1) : parcalar;
  if (!liste.length) return null;

  let toplam = null;
  let i = 0;
  while (i < liste.length) {
    const isaret = i === 0 ? '+' : liste[i];
    if (i > 0) i += 1;
    const ilk = liste[i];
    let terim = parcaDegeri(ilk);
    let tekYuzde = Boolean(ilk.yuzde);
    i += 1;
    while (liste[i] === '×' || liste[i] === '÷') {
      const sag = parcaDegeri(liste[i + 1]);
      if (liste[i] === '÷' && sag.pay === 0n) return { hata: SIFIRA_BOLME };
      terim = liste[i] === '×' ? carp(terim, sag) : bol(terim, sag);
      tekYuzde = false;
      i += 2;
    }
    if (toplam === null) toplam = terim;
    else {
      const eklenen = tekYuzde ? carp(toplam, terim) : terim;
      toplam = isaret === '+' ? topla(toplam, eklenen) : cikar(toplam, eklenen);
    }
  }
  return { deger: toplam };
}

function binlik(tam) {
  return tam.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Yarım ve üstü yukarı yuvarlanır.
function yuvarla(deger, basamak) {
  const carpan = 10n ** BigInt(basamak);
  const mutlak = deger.pay < 0n ? -deger.pay : deger.pay;
  const sonuc = (mutlak * carpan * 2n + deger.payda) / (deger.payda * 2n);
  return deger.pay < 0n ? -sonuc : sonuc;
}

export function sonucYaz(deger) {
  const sayi = yuvarla(deger, EN_COK_ONDALIK);
  const mutlak = String(sayi < 0n ? -sayi : sayi).padStart(EN_COK_ONDALIK + 1, '0');
  const tam = mutlak.slice(0, -EN_COK_ONDALIK);
  const ondalik = mutlak.slice(-EN_COK_ONDALIK).replace(/0+$/, '');
  return `${sayi < 0n ? '-' : ''}${binlik(tam)}${ondalik ? `,${ondalik}` : ''}`;
}

export function kurusaCevir(deger) {
  const kurus = yuvarla(deger, 2);
  return kurus > 0n && kurus <= EN_BUYUK_KURUS ? Number(kurus) : null;
}

function parcaYaz(parca) {
  if (typeof parca === 'string') return parca === '-' ? '−' : parca;
  if (parca.kesir) return `${parca.yuzde ? '%' : ''}${parca.metin}`;
  const [tam, ...ondalik] = parca.metin.split(',');
  return `${parca.yuzde ? '%' : ''}${[binlik(tam), ...ondalik].join(',')}`;
}

export function ifadeYaz(parcalar) {
  return parcalar.map(parcaYaz).join(' ');
}

export function yeniDurum() {
  return { parcalar: [], bitti: false };
}

function rakamEkle(durum, rakam) {
  const parcalar = durum.bitti ? [] : durum.parcalar;
  const son = parcalar.at(-1);
  if (son === undefined || typeof son === 'string') {
    return parcalar.length < EN_COK_PARCA ? { parcalar: [...parcalar, { metin: rakam }], bitti: false } : durum;
  }
  if (son.yuzde || son.kesir) return durum;
  if (son.metin.replace(',', '').length >= EN_COK_RAKAM) return durum;
  const metin = son.metin === '0' ? rakam : son.metin + rakam;
  return { parcalar: [...parcalar.slice(0, -1), { metin }], bitti: false };
}

function virgulEkle(durum) {
  const parcalar = durum.bitti ? [] : durum.parcalar;
  const son = parcalar.at(-1);
  if (son === undefined || typeof son === 'string') {
    return parcalar.length < EN_COK_PARCA ? { parcalar: [...parcalar, { metin: '0,' }], bitti: false } : durum;
  }
  if (son.yuzde || son.kesir || son.metin.includes(',')) return durum;
  return { parcalar: [...parcalar.slice(0, -1), { metin: `${son.metin},` }], bitti: false };
}

function islemEkle(durum, islem) {
  const son = durum.parcalar.at(-1);
  if (son === undefined) return durum;
  if (typeof son === 'string') return { parcalar: [...durum.parcalar.slice(0, -1), islem], bitti: false };
  return { parcalar: [...durum.parcalar, islem], bitti: false };
}

function yuzdeEkle(durum) {
  const son = durum.parcalar.at(-1);
  if (son === undefined || typeof son === 'string' || son.yuzde) return durum;
  return { parcalar: [...durum.parcalar.slice(0, -1), { ...son, yuzde: true }], bitti: false };
}

function sil(durum) {
  if (durum.bitti) return yeniDurum();
  const son = durum.parcalar.at(-1);
  if (son === undefined) return durum;
  const onceki = durum.parcalar.slice(0, -1);
  if (typeof son === 'string' || son.kesir && !son.yuzde) return { parcalar: onceki, bitti: false };
  if (son.yuzde) return { parcalar: [...onceki, { ...son, yuzde: false }], bitti: false };
  const metin = son.metin.slice(0, -1);
  return { parcalar: metin ? [...onceki, { metin }] : onceki, bitti: false };
}

function esittir(durum) {
  const sonuc = hesapla(durum.parcalar);
  if (!sonuc || sonuc.hata) return durum;
  return { parcalar: [{ metin: sonucYaz(sonuc.deger), kesir: sonuc.deger }], bitti: true };
}

export function tusla(durum, tus) {
  if (/^\d$/.test(tus)) return rakamEkle(durum, tus);
  if (tus === ',') return virgulEkle(durum);
  if (tus === '%') return yuzdeEkle(durum);
  if (tus === 'C') return yeniDurum();
  if (tus === '⌫') return sil(durum);
  if (tus === '=') return esittir(durum);
  return islemEkle(durum, tus);
}

export function sayidanParca(metin) {
  return { parcalar: [{ metin, kesir: sayiCoz(metin.replaceAll('.', '')) }], bitti: true };
}
