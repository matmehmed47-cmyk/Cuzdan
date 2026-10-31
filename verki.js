// Verki'nin cevapları uygulamanın kendi verisinden hesaplanır; sayıları yapay zekâ değil uygulama bulur.

import { donemBul, gunEkle, gunFarki } from './donem.js';
import { ayrilanTutar, bekliyorMu, donemKalemleri } from './fatura.js';
import { kategoriToplamlari } from './harcama.js';
import { kalanPara, paraYaz } from './para.js';
import { kenardaPara } from './plan.js';
import { donemTaksitleri } from './taksit.js';

export const SORULAR = [
  { kod: 'bugun', soru: 'Bugün ne ödemem lazım?' },
  { kod: 'hafta', soru: 'Bu hafta hangi ödemeler var?' },
  { kod: 'geciken', soru: 'Geciken ödemem var mı?' },
  { kod: 'donem', soru: 'Maaşa kadar ne ödeyeceğim?' },
  { kod: 'serbest', soru: 'Serbest param ne kadar?' },
  { kod: 'gunluk', soru: 'Günde ne kadar harcayabilirim?' },
  { kod: 'kategori', soru: 'Bu dönem en çok nereye harcadım?' },
];

function bekleyenler(veri, donem, bitis, bugun) {
  const sinir = { baslangic: donem.baslangic, bitis };
  return [...donemKalemleri(veri, sinir, bugun), ...donemTaksitleri(veri, sinir, bugun)]
    .filter(bekliyorMu)
    .sort((a, b) => a.vade.localeCompare(b.vade));
}

function odemeSatiri(kalem, bugun) {
  const fark = gunFarki(bugun, kalem.vade);
  const alt = fark < 0 ? `Gecikti · ${-fark} gün` : fark === 0 ? 'Bugün' : fark === 1 ? 'Yarın' : `${fark} gün sonra`;
  return { ad: kalem.ad, tutar: kalem.kurus === null ? 'Tutar belli değil' : `${kalem.tahmin ? '≈ ' : ''}${paraYaz(kalem.kurus)}`, alt };
}

function odemeCevabi(kalemler, bugun, bos, bas) {
  if (!kalemler.length) return { ozet: bos, satirlar: [] };
  const toplam = ayrilanTutar(kalemler);
  const belirsiz = kalemler.some((k) => k.kurus === null);
  return {
    ozet: `${bas(kalemler.length)} Toplam ${paraYaz(toplam)}${belirsiz ? ' (tutarı belli olmayan hariç)' : ''}.`,
    satirlar: kalemler.map((k) => odemeSatiri(k, bugun)),
  };
}

export function serbestParaHesabi(veri, donem, bugun) {
  const kayit = veri.donemler[donem.baslangic];
  const ayrilan = ayrilanTutar([...donemKalemleri(veri, donem, bugun), ...donemTaksitleri(veri, donem, bugun)]);
  const kose = kenardaPara(veri);
  return { eldeki: kalanPara(kayit), ayrilan, kose, serbest: kalanPara(kayit) - ayrilan - kose };
}

export function verkiCevabi(kod, veri, bugun) {
  const donem = donemBul(veri.ayar, bugun);
  const kayit = veri.donemler[donem.baslangic];
  if (!kayit) return { ozet: 'Bu dönemin kaydı yok, önce ana sayfadan parayı gir.', satirlar: [] };

  if (kod === 'bugun') {
    const liste = bekleyenler(veri, donem, bugun, bugun);
    const bugunku = liste.filter((k) => k.vade === bugun);
    const geciken = liste.filter((k) => k.vade < bugun);
    const cevap = odemeCevabi(bugunku, bugun, 'Bugün son günü olan ödemen yok.', (n) => `Bugün ${n} ödemen var.`);
    if (geciken.length) {
      cevap.ozet += ` Ayrıca ${geciken.length} geciken ödemen var.`;
      cevap.satirlar.push(...geciken.map((k) => odemeSatiri(k, bugun)));
    }
    return cevap;
  }
  if (kod === 'hafta') {
    return odemeCevabi(bekleyenler(veri, donem, gunEkle(bugun, 6), bugun), bugun, 'Önümüzdeki 7 günde ödemen yok.', (n) => `Önümüzdeki 7 günde ${n} ödemen var.`);
  }
  if (kod === 'geciken') {
    return odemeCevabi(bekleyenler(veri, donem, bugun, bugun).filter((k) => k.vade < bugun), bugun, 'Geciken ödemen yok.', (n) => `${n} geciken ödemen var.`);
  }
  if (kod === 'donem') {
    return odemeCevabi(bekleyenler(veri, donem, donem.bitis, bugun), bugun, 'Bu dönem ödenecek bir şey kalmadı.', (n) => `Maaşa kadar ${n} ödemen var.`);
  }
  if (kod === 'serbest' || kod === 'gunluk') {
    const hesap = serbestParaHesabi(veri, donem, bugun);
    const satirlar = [
      { ad: 'Elindeki para', tutar: paraYaz(hesap.eldeki) },
      { ad: 'Ödemelere ayrılan', tutar: paraYaz(hesap.ayrilan) },
      ...(hesap.kose ? [{ ad: 'Köşede', tutar: paraYaz(hesap.kose) }] : []),
    ];
    if (kod === 'serbest') return { ozet: `Serbest paran ${paraYaz(hesap.serbest)}.`, satirlar };
    const gun = Math.max(gunFarki(bugun, donem.sonraki), 1);
    if (hesap.serbest <= 0) return { ozet: 'Serbest paran bitti, harcamadan önce ödemelerine bak.', satirlar };
    return { ozet: `Maaşa ${gun} gün var. Günde en fazla ${paraYaz(Math.floor(hesap.serbest / gun))} harcayabilirsin.`, satirlar };
  }
  if (kod === 'kategori') {
    const toplamlar = kategoriToplamlari(kayit);
    if (!toplamlar.length) return { ozet: 'Bu dönem henüz harcama girmedin.', satirlar: [] };
    const toplam = toplamlar.reduce((t, k) => t + k.kurus, 0);
    return {
      ozet: `En çok ${toplamlar[0].ad} için harcadın: ${paraYaz(toplamlar[0].kurus)}.`,
      satirlar: toplamlar.slice(0, 5).map((k) => ({ ad: k.ad, tutar: paraYaz(k.kurus), alt: `Harcamanın %${Math.round((k.kurus * 100) / toplam)}'i` })),
    };
  }
  return { ozet: 'Bunu henüz bilmiyorum.', satirlar: [] };
}
