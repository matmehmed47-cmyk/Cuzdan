// Hatırlatma planı tek yerde kurulur; aynı liste hem uygulama içinde hem telefon bildiriminde kullanılır.

import { gunEkle, gunFarki } from './donem.js';
import { ayrilanTutar, bekliyorMu, donemKalemleri } from './fatura.js';
import { kalanPara, paraYaz } from './para.js';
import { kenardaPara } from './plan.js';
import { donemTaksitleri } from './taksit.js';

export const VARSAYILAN_AYAR = { gunOnce: 3, saat: '09:00', maas: true, gunSonu: false, gunSonuSaat: '21:00' };
const ILERI_GUN = 35;
const ABONELIK_AY = 3;
const GUN_SONU_ILERI = 3;
const ANAHTAR = 'cuzdan.bildirim';
const EN_COK_KAYIT = 300;

export function bildirimAyari(veri) {
  return { ...VARSAYILAN_AYAR, ...veri.bildirim };
}

function ayFarki(ilk, son) {
  const [y1, a1] = ilk.split('-').map(Number);
  const [y2, a2] = son.split('-').map(Number);
  return (y2 - y1) * 12 + a2 - a1;
}

function zaman(tarih, saat) {
  return Date.parse(`${tarih}T${saat}:00+03:00`);
}

function odemeMetni(kalem, kalanGun, para) {
  const tutar = kalem.kurus === null ? null : paraYaz(kalem.kurus);
  const bas = kalanGun < 0 ? 'Gecikti' : kalanGun === 0 ? 'Bugün son gün' : kalanGun === 1 ? 'Yarın son gün' : `${kalanGun} gün kaldı`;
  if (!tutar) return `${bas}. Tutarı henüz belli değil.`;
  return `${bas}: ${tutar}. Ödenince kalan: ${paraYaz(para - kalem.kurus)}.`;
}

function kalemYazisi(kalem) {
  return kalem.kurus === null ? kalem.ad : `${kalem.ad} ${paraYaz(kalem.kurus)}`;
}

// O güne düşen her ödeme tek bildirimde toplanır; geciken, ödenene kadar her sabah yazar.
function gunlukOzet(kalemler, tarih, ayar, para) {
  const yaklasan = ayar.gunOnce > 0 ? gunEkle(tarih, ayar.gunOnce) : null;
  const gecikti = kalemler.filter((k) => k.vade < tarih);
  const bugunku = kalemler.filter((k) => k.vade === tarih);
  const sonraki = kalemler.filter((k) => k.vade === yaklasan);
  const hepsi = [...gecikti, ...bugunku, ...sonraki];
  if (!hepsi.length) return null;

  const ortak = { anahtar: `ozet:${tarih}`, zaman: zaman(tarih, ayar.saat) };
  if (hepsi.length === 1) {
    return { ...ortak, baslik: hepsi[0].ad, metin: odemeMetni(hepsi[0], gunFarki(tarih, hepsi[0].vade), para) };
  }
  const satirlar = [['Gecikti', gecikti], ['Bugün', bugunku], [`${ayar.gunOnce} gün kaldı`, sonraki]]
    .filter(([, liste]) => liste.length)
    .map(([ad, liste]) => `${ad}: ${liste.map(kalemYazisi).join(', ')}.`);
  return {
    ...ortak,
    baslik: gecikti.length || bugunku.length ? 'Bugünkü ödemeler' : 'Yaklaşan ödemeler',
    metin: `${satirlar.join(' ')} Toplam: ${paraYaz(ayrilanTutar(hepsi))}.`,
  };
}

function bugunHarcamaVar(kayit, bugun) {
  return (kayit.hareketler ?? []).some((h) => h.tur === 'harcama' && h.tarih === bugun);
}

// Kira yenilenmeden bir ay önce söylenir; artış oranı her ay değiştiği için kullanıcı yazar.
export function yeniKira(kurus, oran) {
  return Math.round((kurus * (10000 + oran)) / 10000);
}

function kiraUyarilari(veri, bugun, ayar) {
  const [yil, ay] = bugun.split('-').map(Number);
  const sonraki = ay === 12 ? 1 : ay + 1;
  return (veri.faturalar ?? [])
    .filter((f) => f.cesit === 'kira' && f.yenileme === sonraki)
    .map((f) => {
      const adi = new Intl.DateTimeFormat('tr-TR', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, sonraki - 1, 1)));
      return {
        anahtar: `kira:${f.id}:${yil}`,
        zaman: zaman(`${bugun.slice(0, 7)}-01`, ayar.saat),
        baslik: f.ad,
        metin: f.oran && f.kurus
          ? `${adi} ayında kira yaklaşık ${paraYaz(yeniKira(f.kurus, f.oran))} olabilir.`
          : `${adi} ayında kira yenileniyor. Yeni tutarı faturadan güncellemeyi unutma.`,
      };
    });
}

// Ödenen kalem listeye girmez; bu yüzden tik atılınca bildirimi de durur.
export function bildirimPlani(veri, donem, kayit, bugun, ayar = bildirimAyari(veri)) {
  const sinir = { baslangic: donem.baslangic, bitis: gunEkle(bugun, ILERI_GUN) };
  const kapali = new Set([...(veri.faturalar ?? []), ...(veri.taksitler ?? [])].filter((k) => k.bildirimKapali).map((k) => k.id));
  const kalemler = [...donemKalemleri(veri, sinir, bugun), ...donemTaksitleri(veri, sinir, bugun)]
    .filter((k) => bekliyorMu(k) && !kapali.has(k.faturaId ?? k.taksitId));
  const para = kalanPara(kayit);
  const plan = [];
  for (let i = 0; i <= ILERI_GUN; i += 1) {
    const ozet = gunlukOzet(kalemler, gunEkle(bugun, i), ayar, para);
    if (ozet) plan.push(ozet);
  }

  if (ayar.maas) {
    for (const tarih of [donem.baslangic, donem.sonraki]) {
      if (tarih === donem.sonraki || tarih === bugun) {
        plan.push({ anahtar: `maas:${tarih}`, zaman: zaman(tarih, ayar.saat), baslik: 'Maaş günü', metin: 'Bugün maaş günü, faturalarını gözden geçir.' });
      }
    }
  }

  if (ayar.gunSonu) {
    for (let i = 0; i < GUN_SONU_ILERI; i += 1) {
      if (i > 0 || !bugunHarcamaVar(kayit, bugun)) {
        const tarih = gunEkle(bugun, i);
        plan.push({ anahtar: `gunsonu:${tarih}`, zaman: zaman(tarih, ayar.gunSonuSaat), baslik: 'Gün sonu', metin: 'Bugünkü harcamaları girdin mi?' });
      }
    }
  }

  for (const fatura of veri.faturalar ?? []) {
    if (fatura.cesit !== 'abonelik') continue;
    const ay = bugun.slice(0, 7);
    if (ayFarki(fatura.ilkAy, ay) > 0 && ayFarki(fatura.ilkAy, ay) % ABONELIK_AY === 0) {
      plan.push({ anahtar: `abonelik:${fatura.id}:${ay}`, zaman: zaman(`${ay}-01`, ayar.saat), baslik: fatura.ad, metin: 'Bu aboneliği hâlâ kullanıyor musun? Kullanmıyorsan iptal etmeyi düşünebilirsin.' });
    }
  }

  plan.push(...kiraUyarilari(veri, bugun, ayar));

  const donemKalem = donemKalemleri(veri, donem, bugun);
  const serbest = para - ayrilanTutar([...donemKalem, ...donemTaksitleri(veri, donem, bugun)]) - kenardaPara(veri);
  if (ayar.altSinir && serbest < ayar.altSinir) {
    plan.push({ anahtar: `para:${donem.baslangic}`, zaman: 0, baslik: 'Serbest para', metin: `Serbest paran ${paraYaz(ayar.altSinir)} altına indi: ${paraYaz(serbest)}.` });
  }

  return plan.sort((a, b) => a.zaman - b.zaman);
}

export function gelenler(plan, simdi, gosterilen) {
  return plan.filter((k) => k.zaman <= simdi && !gosterilen.includes(k.anahtar));
}

export function gosterilenYukle() {
  try {
    const liste = JSON.parse(localStorage.getItem(ANAHTAR));
    return Array.isArray(liste) ? liste.filter((k) => typeof k === 'string') : [];
  } catch {
    return [];
  }
}

export function gosterilenKaydet(liste) {
  try {
    localStorage.setItem(ANAHTAR, JSON.stringify([...new Set(liste)].slice(-EN_COK_KAYIT)));
  } catch {
    // Saklanamasa da uygulama çalışır, kart yeniden görünür.
  }
}
