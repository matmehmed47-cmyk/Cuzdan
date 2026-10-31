import { hareketToplami, kalanPara, paraCoz, paraYaz, yaklasikAralik } from './para.js';
import {
  bugunTR,
  donemBul,
  gunEkle,
  gunFarki,
  ilkAyar,
  kaydirmaSiniri,
  maasGunuDegistir,
  maasKaydir,
} from './donem.js';
import { kaydet, temizle, yedekCoz, yukle } from './depo.js';
import {
  atlamaGeriAl,
  ayAtla,
  ayrilanTutar,
  baslangicAyi,
  bekliyorMu,
  donemKalemleri,
  faturaEkle,
  faturaGuncelle,
  faturaOde,
  faturaSil,
  odemeGeriAl,
} from './fatura.js';
import {
  bekleyenTaksitler,
  donemTaksitleri,
  gelecekAylar,
  taksitBitisi,
  taksitDurumu,
  taksitEkle,
  taksitGuncelle,
  taksitOde,
  taksitOdemeGeriAl,
  taksitSil,
} from './taksit.js';
import {
  DIGER,
  EK_GELIR,
  KAYITSIZ,
  geriAlinanlar,
  geriAldimEkle,
  gelirEkle,
  gelirListesi,
  gelirOzet,
  harcamaEkle,
  harcamaGuncelle,
  harcamaListesi,
  hareketSil,
  kategoriAdDegistir,
  kategoriEkle,
  kategoriSil,
  kategoriToplamlari,
  kaynakEkle,
  kategoriler,
  ortakListesi,
  ortakOzet,
  siraliKategoriler,
  siraliKaynaklar,
} from './harcama.js';
import {
  TURLER,
  ayAlinanlar,
  aylikOzet,
  birikimEkle,
  birikimSil,
  bugunkuDeger,
  eldeki,
  kullanilanTurler,
  miktarCoz,
  miktarSayi,
  miktarYaz,
  satisEkle,
  turKayitlari,
  yillar,
} from './birikim.js';
import { SIFIRA_BOLME, hesapla, ifadeYaz, kurusaCevir, sayidanParca, sonucYaz, tusla, yeniDurum } from './hesap.js';
import {
  ALTINLAR,
  DOVIZLER,
  ELLE_YENILEME_SURESI,
  KAYNAK,
  KAYNAK_ADI,
  TCMB_DOSYA,
  YENILEME_SURESI,
  fiyatCoz,
  fiyatYaz,
  neAlir,
  piyasaDurumu,
  piyasaKaydet,
  piyasaYukle,
  tcmbCoz,
} from './piyasa.js';

const IKONLAR = {
  ev: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>',
  harcama: '<path d="M4 5h2.2l2 10.5h9.6l1.8-7.5H7"/><circle cx="9.5" cy="19.2" r="1.3"/><circle cx="17" cy="19.2" r="1.3"/>',
  odeme: '<path d="M6 3.5h12v17l-3-1.8-3 1.8-3-1.8-3 1.8z"/><path d="M9.5 8.5h5"/><path d="M9.5 12.5h5"/>',
  birikim: '<ellipse cx="12" cy="6.5" rx="7.5" ry="3"/><path d="M4.5 6.5v5.500c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6.5"/><path d="M4.5 12v5.500c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V12"/>',
  piyasa: '<path d="M4 19.500h16"/><path d="m5 15 4.5-4.5 3.5 3 6-7"/><path d="M14.5 6.500H19V11"/>',
  gelir: '<path d="M12 4v13"/><path d="m6.5 11.5 5.5 5.5 5.5-5.5"/><path d="M5 20.500h14"/>',
  ortak: '<circle cx="9" cy="8.5" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M15.5 5.300a3.5 3.5 0 0 1 0 6.4"/><path d="M17.5 14.400c2.1.8 3.5 3 3.5 5.6"/>',
  gecmis: '<path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M4 4.500v4h4"/><path d="M12 8v4.500l3 1.8"/>',
  ayar: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.900l.1.100a2 2 0 1 1-2.8 2.800l-.1-.1a1.7 1.7 0 0 0-2.9 1.200V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.200l-.1.1a2 2 0 1 1-2.8-2.800l.1-.1a1.7 1.7 0 0 0-1.2-2.900H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.900l-.1-.1a2 2 0 1 1 2.8-2.800l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.500V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.200l.1-.1a2 2 0 1 1 2.8 2.800l-.1.1a1.7 1.7 0 0 0 1.2 2.900h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  geri: '<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>',
  kalem: '<path d="M4 20l1-4.500L16.5 4l3.5 3.500L8.5 19z"/>',
  yenile: '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v4.500h-4.5"/>',
  dolar: '<circle cx="12" cy="12" r="8.5"/><path d="M15 9c-.5-1.2-1.7-1.8-3-1.8-1.7 0-3 .9-3 2.3 0 3.2 6 1.7 6 4.9 0 1.4-1.3 2.3-3 2.3-1.3 0-2.5-.6-3-1.8"/><path d="M12 5.500v13"/>',
  hesap: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8.5 7h7"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
  cuzdan: '<path d="M4 7.500A2.5 2.5 0 0 1 6.5 5H17v3"/><path d="M4 7.500V17a2.5 2.5 0 0 0 2.5 2.500H20V8H6.5"/><circle cx="16" cy="13.8" r="1.1"/>',
};

const kok = document.getElementById('uygulama');
let veri = null;
let uyari = '';
let kurulumTaslak = { adim: 1, ad: '', gun: null };
let kurulumIstemi = null;
let piyasaKaydi = null;
let tcmbKur = null;
let piyasaHata = false;
let piyasaYukleniyor = false;
let sonElleYenileme = 0;
let canliEkran = null;

function el(etiket, ozellikler = {}, ...cocuklar) {
  const dugum = document.createElement(etiket);
  for (const [ad, deger] of Object.entries(ozellikler)) {
    if (ad.startsWith('on')) dugum.addEventListener(ad.slice(2), deger);
    else if (ad === 'sinif') dugum.className = deger;
    else if (ad in dugum && ad !== 'list') dugum[ad] = deger;
    else dugum.setAttribute(ad, deger);
  }
  dugum.append(...cocuklar.flat(Infinity).filter((c) => c !== null && c !== undefined));
  return dugum;
}

function tarihYaz(tarih) {
  const [y, a, g] = tarih.split('-').map(Number);
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, a - 1, g)));
}

function goster(...dugumler) {
  canliEkran = null;
  kok.classList.remove('genis');
  kok.replaceChildren(...dugumler.flat(Infinity).filter(Boolean));
  window.scrollTo?.(0, 0);
}

function sayfa(sekme, ...dugumler) {
  goster(...dugumler, altMenu(sekme));
  kok.classList.add('genis');
}

function ikon(ad) {
  return el('span', { sinif: 'ikon', 'aria-hidden': 'true', innerHTML: `<svg viewBox="0 0 24 24">${IKONLAR[ad]}</svg>` });
}

function altMenu(aktif) {
  const sekmeler = [
    ['ana', 'Ana sayfa', 'ev', anaEkran],
    ['harcama', 'Harcamalar', 'harcama', () => harcamalarEkrani()],
    ['odeme', 'Ödemeler', 'odeme', faturalarEkrani],
    ['birikim', 'Birikim', 'birikim', birikimlerEkrani],
    ['piyasa', 'Piyasa', 'piyasa', piyasaEkrani],
  ];
  return el(
    'nav',
    { sinif: 'alt-menu', 'aria-label': 'Ana menü' },
    sekmeler.map(([kod, ad, simge, ac]) => el(
      'button',
      { type: 'button', onclick: ac, ...(kod === aktif ? { 'aria-current': 'page' } : {}) },
      ikon(simge),
      ad,
    )),
  );
}

function kaydetVeUyar(yeni) {
  veri = yeni;
  uyari = kaydet(veri) ? '' : 'Kayıt yapılamadı. Telefonda yer dolu olabilir, yedeğini indir.';
}

function hataSatiri() {
  return el('p', { sinif: 'hata', role: 'alert', hidden: true });
}

function hataGoster(satir, metin) {
  satir.textContent = metin;
  satir.hidden = false;
}

function tutarAlani(id, etiket, deger = '') {
  return [
    el('label', { htmlFor: id }, etiket),
    el('input', { id, name: id, sinif: 'tutar-kutu', type: 'text', inputMode: 'decimal', autocomplete: 'off', placeholder: 'Örnek: 25.000', value: deger }),
  ];
}

function gunSecici(id, secili) {
  const secenekler = [el('option', { value: '' }, 'Gün seç')];
  for (let gun = 1; gun <= 31; gun += 1) {
    secenekler.push(el('option', { value: String(gun), selected: gun === secili }, `Ayın ${gun}. günü`));
  }
  return el('select', { id }, secenekler);
}

function ikiAlan(...alanlar) {
  return el('div', { sinif: 'alanlar' }, alanlar.map((alan) => el('div', { sinif: 'alan' }, alan)));
}

function degerler(...ciftler) {
  return el('div', { sinif: 'degerler' }, ciftler.filter(Boolean).map(([ad, deger]) => el('div', { sinif: 'deger' }, el('span', {}, ad), el('strong', {}, deger))));
}

function harfRengi(metin) {
  return [...metin].reduce((t, h) => t + h.codePointAt(0), 0) % 6;
}

function kalem(baslik, tutar, alt, dugmeler = null, altSinif = 'ipucu') {
  return el(
    'div',
    { sinif: 'kalem' },
    el('span', { sinif: `harf renk${harfRengi(baslik)}`, 'aria-hidden': 'true' }, baslik.slice(0, 1).toLocaleUpperCase('tr-TR')),
    el('div', { sinif: 'kalem-govde' }, satir(baslik, tutar), alt ? el('p', { sinif: altSinif }, alt) : null),
    dugmeler ? el('div', { sinif: 'kalem-dugme' }, dugmeler) : null,
  );
}

function kisaPara(kurus) {
  return String(Math.round(kurus / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function kisaAyNotu() {
  return el('p', { sinif: 'ipucu' }, 'Ay kısa çekerse maaş, ayın son günü sayılır.');
}

/* İlk kurulum */

function kurulumEkrani() {
  const { adim } = kurulumTaslak;
  const baslik = el(
    'div',
    { sinif: 'karsilama' },
    ikon('cuzdan'),
    el('h1', {}, 'Cüzdan'),
    el('p', { sinif: 'adim' }, `Adım ${adim} / 3`),
    el('div', { sinif: 'noktalar' }, [1, 2, 3].map((n) => el('span', { sinif: n <= adim ? 'dolu' : '' }))),
  );

  if (adim === 1) {
    const hata = hataSatiri();
    const form = el(
      'form',
      {
        onsubmit: (o) => {
          o.preventDefault();
          const ad = form.elements.ad.value.trim();
          if (!ad) return hataGoster(hata, 'Cüzdanına bir ad yaz.');
          kurulumTaslak = { ...kurulumTaslak, ad, adim: 2 };
          kurulumEkrani();
        },
      },
      el('label', { htmlFor: 'ad' }, 'Cüzdanına bir ad ver'),
      el('input', { id: 'ad', name: 'ad', maxLength: 30, placeholder: 'Örnek: Ev Bütçesi', value: kurulumTaslak.ad, autocomplete: 'off' }),
      hata,
      el('button', { type: 'submit' }, 'Devam'),
    );
    return goster(baslik, form);
  }

  if (adim === 2) {
    const hata = hataSatiri();
    const secici = gunSecici('gun', kurulumTaslak.gun);
    const form = el(
      'form',
      {
        onsubmit: (o) => {
          o.preventDefault();
          if (!secici.value) return hataGoster(hata, 'Maaş gününü seç.');
          kurulumTaslak = { ...kurulumTaslak, gun: Number(secici.value), adim: 3 };
          kurulumEkrani();
        },
      },
      el('label', { htmlFor: 'gun' }, 'Maaşın ayın kaçında yatıyor?'),
      secici,
      kisaAyNotu(),
      hata,
      el('button', { type: 'submit' }, 'Devam'),
      el('button', { type: 'button', sinif: 'ikincil', onclick: () => { kurulumTaslak.adim = 1; kurulumEkrani(); } }, 'Geri'),
    );
    return goster(baslik, form);
  }

  const ayar = ilkAyar(kurulumTaslak.gun);
  const donem = donemBul(ayar, bugunTR());
  const hata = hataSatiri();
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const para = paraCoz(form.elements.para.value);
        if (para === null) return hataGoster(hata, 'Tutarı örnekteki gibi yaz: 25.000 ya da 1.250,50');
        kaydetVeUyar({
          surum: 1,
          ad: kurulumTaslak.ad,
          ayar,
          donemler: { [donem.baslangic]: { para, hareketler: [] } },
        });
        anaEkran();
      },
    },
    tutarAlani('para', 'Şu an elinde ne kadar para var?'),
    el('p', { sinif: 'ipucu' }, `Bu dönem: ${tarihYaz(donem.baslangic)} – ${tarihYaz(donem.bitis)}`),
    hata,
    el('button', { type: 'submit' }, 'Cüzdanımı oluştur'),
    el('button', { type: 'button', sinif: 'ikincil', onclick: () => { kurulumTaslak.adim = 2; kurulumEkrani(); } }, 'Geri'),
  );
  return goster(baslik, form);
}

/* Ana ekran */

function ustBolum(baslik, geri) {
  return el(
    'header',
    { sinif: 'ust' },
    geri ? el('button', { type: 'button', sinif: 'simge', 'aria-label': 'Geri', onclick: geri }, ikon('geri')) : null,
    el('h1', {}, baslik),
    geri ? null : el('button', { type: 'button', sinif: 'simge', 'aria-label': 'Ayarlar', onclick: ayarlarEkrani }, ikon('ayar')),
  );
}

function bilgiSatiri() {
  return uyari ? el('p', { sinif: 'hata', role: 'alert' }, uyari) : null;
}

function oncekiDonem(baslangic) {
  const tarih = Object.keys(veri.donemler).filter((t) => t < baslangic).sort().at(-1);
  return tarih ? veri.donemler[tarih] : null;
}

function yeniDonemEkrani(donem) {
  const onceki = oncekiDonem(donem.baslangic);
  const devreden = onceki ? kalanPara(onceki) : null;
  const hata = hataSatiri();
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const para = paraCoz(form.elements.para.value);
        if (para === null) return hataGoster(hata, 'Tutarı örnekteki gibi yaz: 25.000 ya da 1.250,50');
        kaydetVeUyar({ ...veri, donemler: { ...veri.donemler, [donem.baslangic]: { para, hareketler: [] } } });
        anaEkran();
      },
    },
    tutarAlani('para', 'Bu dönem elindeki parayı yaz', devreden > 0 ? paraYaz(devreden) : ''),
    devreden === null ? null : el('p', { sinif: 'ipucu' }, `Geçen dönemden devreden: ${paraYaz(devreden)}. Maaşını da ekleyip yazabilirsin.`),
    el('p', { sinif: 'ipucu' }, `${tarihYaz(donem.baslangic)} – ${tarihYaz(donem.bitis)}`),
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
  );
  goster(
    ustBolum(veri.ad),
    bilgiSatiri(),
    el('section', { sinif: 'hero' }, el('h2', {}, 'Yeni ay, temiz sayfa'), el('p', { sinif: 'ipucu' }, 'Yeni dönem başladı. Geçen dönem Geçmiş bölümünde duruyor.')),
    form,
  );
}

function satir(etiket, deger) {
  return el('p', { sinif: 'satir' }, el('span', {}, etiket), el('strong', {}, deger));
}

function anaEkran() {
  const bugun = bugunTR();
  const donem = donemBul(veri.ayar, bugun);
  const kayit = veri.donemler[donem.baslangic];
  if (!kayit) return yeniDonemEkrani(donem);

  const kalanGun = gunFarki(bugun, donem.sonraki);
  const para = kalanPara(kayit);
  const kalemler = [...donemKalemleri(veri, donem, bugun), ...donemTaksitleri(veri, donem, bugun)];
  const bekleyen = kalemler.filter(bekliyorMu).sort((a, b) => a.vade.localeCompare(b.vade));
  const belirsiz = bekleyen.filter((k) => k.kurus === null).length;
  const ayrilan = ayrilanTutar(kalemler);
  const serbest = para - ayrilan;
  const [alt, ust] = yaklasikAralik(serbest);
  const donemGunu = gunFarki(donem.baslangic, donem.sonraki);
  sayfa(
    'ana',
    ustBolum(veri.ad),
    bilgiSatiri(),
    el(
      'div',
      { sinif: 'panel' },
      el(
        'div',
        {},
        el(
          'section',
          { sinif: 'hero' },
          el(
            'div',
            { sinif: 'hero-ust' },
            el('p', { sinif: 'etiket' }, 'Serbest para'),
            el('button', { type: 'button', sinif: 'hayalet', onclick: () => paraDuzelt(donem, kayit) }, ikon('kalem'), 'Tutarı düzelt'),
          ),
          el('p', { sinif: 'tutar', id: 'ana-para' }, paraYaz(serbest)),
          degerler(['Toplam para', paraYaz(para)], ['Ödemelere ayrıldı', paraYaz(ayrilan)]),
          belirsiz ? el('p', { sinif: 'ipucu' }, `${belirsiz} ödemenin tutarı henüz belli değil, hesaba katılmadı.`) : null,
          el('p', { sinif: 'ipucu' }, `Sonraki maaş: ${tarihYaz(donem.sonraki)} (${kalanGun} gün kaldı)`),
          kategoriCubugu(donemGunu - kalanGun, donemGunu),
        ),
        el(
          'div',
          { sinif: 'ikili' },
          el('button', { type: 'button', onclick: () => harcamaFormu(donem) }, '+ Harcama'),
          el('button', { type: 'button', sinif: 'ikincil', onclick: () => gelirFormu(donem) }, '+ Gelir'),
        ),
        el(
          'div',
          { sinif: 'hizli' },
          [
            ['Gelirler', 'gelir', () => gelirlerEkrani()],
            ['Ortak ev', 'ortak', () => ortakEkrani()],
            ['Hesap makinesi', 'hesap', hesapEkrani],
            ['Geçmiş dönemler', 'gecmis', gecmisEkrani],
          ].map(([ad, simge, ac]) => el('button', { type: 'button', sinif: 'hizli-dugme', onclick: ac }, ikon(simge), ad)),
        ),
        el(
          'section',
          { sinif: 'kart' },
          el('p', { sinif: 'etiket' }, 'Maaşa kadar'),
          el('p', { sinif: 'kutu-buyuk' }, serbest < 0 ? `${paraYaz(-serbest)} eksidesin` : `Yaklaşık ${paraYaz(alt)} – ${paraYaz(ust)} kalıyor`),
          el('p', { sinif: 'ipucu' }, `Bu dönem: ${tarihYaz(donem.baslangic)} – ${tarihYaz(donem.bitis)}`),
        ),
      ),
      el(
        'div',
        {},
        piyasaSeridi(),
        birikimOzetKarti(),
        el(
          'section',
          { sinif: 'kart' },
          el('div', { sinif: 'bolum-baslik' }, el('h2', {}, 'Yaklaşan ödemeler'), el('button', { type: 'button', sinif: 'ikincil kucuk', onclick: faturalarEkrani }, 'Tümü')),
          bekleyen.length
            ? bekleyen.slice(0, 5).map((k) => kalemKutusu(k, donem, bugun, anaEkran))
            : el('p', { sinif: 'ipucu' }, veri.faturalar?.length || veri.taksitler?.length ? 'Bu dönem bekleyen ödeme yok.' : 'Henüz ödeme eklemedin.'),
          bekleyen.length > 5 ? el('p', { sinif: 'ipucu' }, `${bekleyen.length - 5} ödeme daha var.`) : null,
        ),
      ),
    ),
    el('p', { sinif: 'ipucu orta bosluk' }, 'Veriler şimdilik sadece bu cihazda duruyor.'),
  );
  canliEkran = anaEkran;
}

function odemeSekmeleri(aktif) {
  return el(
    'div',
    { sinif: 'sekmeler' },
    [['Faturalar', faturalarEkrani], ['Taksitler', taksitlerEkrani]].map(([ad, ac]) => el('button', { type: 'button', 'aria-pressed': String(ad === aktif), onclick: ac }, ad)),
  );
}

/* Faturalar */

function durumYazisi(kalem, bugun) {
  if (kalem.durum === 'odendi') return `✓ Ödendi · ${tarihYaz(kalem.vade)}`;
  if (kalem.durum === 'atlandi') return `Bu ay yok · ${tarihYaz(kalem.vade)}`;
  if (kalem.durum === 'gecikti') return `Gecikti · ${tarihYaz(kalem.vade)}`;
  const kalan = gunFarki(bugun, kalem.vade);
  return kalan === 0 ? 'Bugün' : `${kalan} gün kaldı · ${tarihYaz(kalem.vade)}`;
}

function kalemKutusu(odeme, donem, bugun, geri, tamListe = false) {
  const dugmeler = [];
  if (bekliyorMu(odeme)) {
    dugmeler.push(el('button', { type: 'button', sinif: 'kucuk', onclick: () => (odeme.taksitId ? taksitOdeFormu(odeme, donem, geri) : odemeBaslat(odeme, donem, bugun, geri)) }, '✓ Ödedim'));
    if (tamListe) {
      dugmeler.push(el('button', {
        type: 'button',
        sinif: 'ikincil kucuk',
        onclick: () => {
          kaydetVeUyar(ayAtla(veri, odeme.faturaId, odeme.ay));
          geri();
        },
      }, 'Bu ay yok'));
    }
  } else if (odeme.durum === 'atlandi' || odeme.geriAlinabilir) {
    dugmeler.push(el('button', {
      type: 'button',
      sinif: 'ikincil kucuk',
      onclick: () => {
        const yeni = odeme.durum === 'atlandi'
          ? atlamaGeriAl(veri, odeme.faturaId, odeme.ay)
          : odemeGeriAl(veri, donem.baslangic, odeme);
        kaydetVeUyar(yeni);
        geri();
      },
    }, 'Geri al'));
  }

  return kalem(
    odeme.ad,
    odeme.kurus === null ? 'Tutar belli değil' : paraYaz(odeme.kurus),
    durumYazisi(odeme, bugun),
    dugmeler.length ? dugmeler : null,
    odeme.durum === 'gecikti' ? 'ipucu gecikti' : 'ipucu',
  );
}

function odemeBaslat(kalem, donem, bugun, geri) {
  if (kalem.tur === 'sabit') {
    kaydetVeUyar(faturaOde(veri, donem.baslangic, kalem, kalem.kurus, bugun));
    return geri();
  }
  const hata = hataSatiri();
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const kurus = paraCoz(form.elements.tutar.value);
        if (!kurus) return hataGoster(hata, 'Sıfırdan büyük bir tutar yaz. Örnek: 100 ya da 1.250,50');
        kaydetVeUyar(faturaOde(veri, donem.baslangic, kalem, kurus, bugun));
        geri();
      },
    },
    tutarAlani('tutar', 'Bu ay ne kadar ödedin?', kalem.kurus ? paraYaz(kalem.kurus) : ''),
    hata,
    el('button', { type: 'submit' }, 'Ödedim'),
  );
  goster(ustBolum(kalem.ad, geri), form);
}

function faturalarEkrani() {
  const bugun = bugunTR();
  const donem = donemBul(veri.ayar, bugun);
  if (!veri.donemler[donem.baslangic]) return anaEkran();

  const kalemler = donemKalemleri(veri, donem, bugun);
  const faturalar = veri.faturalar ?? [];
  sayfa(
    'odeme',
    ustBolum('Ödemeler'),
    bilgiSatiri(),
    odemeSekmeleri('Faturalar'),
    el('button', { type: 'button', onclick: () => faturaFormu() }, '+ Fatura ekle'),
    el(
      'div',
      { sinif: 'panel bosluk' },
      el(
        'section',
        { sinif: 'kart' },
        el('h2', {}, 'Bu dönem'),
        kalemler.length
          ? kalemler.map((k) => kalemKutusu(k, donem, bugun, faturalarEkrani, true))
          : el('p', { sinif: 'ipucu' }, 'Bu dönem ödemesi olan fatura yok.'),
        el('p', { sinif: 'ipucu bosluk' }, 'Ödenmeyen fatura sonraki döneme kendiliğinden geçer.'),
      ),
      faturalar.length
        ? el(
            'section',
            { sinif: 'kart' },
            el('h2', {}, 'Kayıtlı faturalar'),
            faturalar.map((f) => kalem(
              f.ad,
              f.kurus ? paraYaz(f.kurus) : 'Değişken',
              `Ayın ${f.gun}. günü · ${f.tur === 'sabit' ? 'Sabit' : 'Değişken'}`,
              el('button', { type: 'button', sinif: 'ikincil kucuk', onclick: () => faturaFormu(f) }, 'Düzenle'),
            )),
          )
        : null,
    ),
  );
}

function faturaFormu(mevcut = null) {
  const bugun = bugunTR();
  const donem = donemBul(veri.ayar, bugun);
  const hata = hataSatiri();
  const tur = el(
    'select',
    { id: 'tur', onchange: () => etiketYaz() },
    el('option', { value: 'sabit', selected: mevcut?.tur !== 'degisken' }, 'Sabit tutar'),
    el('option', { value: 'degisken', selected: mevcut?.tur === 'degisken' }, 'Değişken tutar'),
  );
  const gun = gunSecici('gun', mevcut?.gun);
  const [tutarEtiketi, tutarKutusu] = tutarAlani('tutar', 'Tutar', mevcut?.kurus ? paraYaz(mevcut.kurus) : '');
  const gecikmeKutusu = el('input', { id: 'gecikme', type: 'checkbox' });
  const gecikmeMetni = el('span');
  const gecikme = el('label', { sinif: 'secim', htmlFor: 'gecikme', hidden: true }, gecikmeKutusu, gecikmeMetni);

  function etiketYaz() {
    tutarEtiketi.textContent = tur.value === 'sabit' ? 'Aylık tutar' : 'Tahmini tutar (boş bırakabilirsin)';
  }

  function gecikmeYaz() {
    const bilgi = gun.value ? baslangicAyi(Number(gun.value), bugun, donem.baslangic) : null;
    gecikme.hidden = Boolean(mevcut) || !bilgi?.gecmisAy;
    gecikmeKutusu.checked = false;
    if (!gecikme.hidden) gecikmeMetni.textContent = `${tarihYaz(bilgi.gecmisTarih)} ödemesi geçti ama henüz ödemedim`;
  }

  gun.addEventListener('change', gecikmeYaz);
  etiketYaz();

  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const ad = form.elements.ad.value.trim();
        if (!ad) return hataGoster(hata, 'Faturaya bir ad yaz.');
        if (!gun.value) return hataGoster(hata, 'Ödeme gününü seç.');
        const yazilan = tutarKutusu.value.trim();
        const kurus = yazilan ? paraCoz(yazilan) : undefined;
        if (kurus === null || kurus === 0) return hataGoster(hata, 'Sıfırdan büyük bir tutar yaz. Örnek: 100 ya da 1.250,50');
        if (tur.value === 'sabit' && kurus === undefined) return hataGoster(hata, 'Sabit fatura için tutar yaz.');

        const bilgiler = { ad, tur: tur.value, gun: Number(gun.value), kurus };
        if (mevcut) {
          kaydetVeUyar(faturaGuncelle(veri, mevcut.id, bilgiler));
        } else {
          const { ilkAy, gecmisAy } = baslangicAyi(bilgiler.gun, bugun, donem.baslangic);
          const id = `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
          kaydetVeUyar(faturaEkle(veri, { id, ...bilgiler, ilkAy: gecikmeKutusu.checked ? gecmisAy : ilkAy }));
        }
        faturalarEkrani();
      },
    },
    el('label', { htmlFor: 'ad' }, 'Fatura adı'),
    el('input', { id: 'ad', name: 'ad', maxLength: 40, placeholder: 'Örnek: Elektrik', value: mevcut?.ad ?? '', autocomplete: 'off' }),
    tutarEtiketi,
    tutarKutusu,
    ikiAlan([el('label', { htmlFor: 'tur' }, 'Tutarı nasıl?'), tur], [el('label', { htmlFor: 'gun' }, 'Son ödeme günü'), gun]),
    el('p', { sinif: 'ipucu' }, 'Değişken: elektrik gibi her ay farklı gelen fatura. Ay kısa çekerse ayın son günü sayılır.'),
    gecikme,
    mevcut ? el('p', { sinif: 'ipucu' }, 'Değişiklik önceki ödemeleri etkilemez.') : null,
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
    mevcut
      ? el('button', {
          type: 'button',
          sinif: 'tehlike',
          onclick: () => {
            if (!window.confirm('Fatura silinsin mi? Ödenmiş kayıtlar Geçmiş bölümünde kalır.')) return;
            kaydetVeUyar(faturaSil(veri, mevcut.id));
            faturalarEkrani();
          },
        }, 'Faturayı sil')
      : null,
  );
  goster(ustBolum(mevcut ? 'Faturayı düzenle' : 'Fatura ekle', faturalarEkrani), form);
}

/* Taksitler */

function ayYaz(ay) {
  const [y, a] = ay.split('-').map(Number);
  return new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, a - 1, 1)));
}

function taksitOdeFormu(kalem, donem, geri) {
  const taksit = veri.taksitler.find((t) => t.id === kalem.taksitId);
  const { kalan } = taksitDurumu(veri, taksit);
  const hata = hataSatiri();
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const kurus = paraCoz(form.elements.tutar.value);
        if (!kurus) return hataGoster(hata, 'Sıfırdan büyük bir tutar yaz. Örnek: 100 ya da 1.250,50');
        if (kurus > kalan) return hataGoster(hata, `Kalan borç ${paraYaz(kalan)}. Daha fazlası yazılamaz.`);
        kaydetVeUyar(taksitOde(veri, donem.baslangic, kalem, kurus, bugunTR()));
        geri();
      },
    },
    tutarAlani('tutar', 'Bu ay ne kadar ödedin?', kalem.kurus ? paraYaz(kalem.kurus) : ''),
    el('p', { sinif: 'ipucu' }, `Kalan borç: ${paraYaz(kalan)}. Farklı tutar ödediysen onu yaz, kalan taksitler yeniden hesaplanır.`),
    hata,
    el('button', { type: 'submit' }, 'Ödedim'),
  );
  goster(ustBolum(kalem.ad, geri), form);
}

function taksitKarti(taksit, donem, bugun) {
  const durum = taksitDurumu(veri, taksit);
  const siradaki = bekleyenTaksitler(veri, taksit, gunEkle(bugun, 400), bugun)[0];
  const bitis = taksitBitisi(veri, taksit, bugun);
  return el(
    'section',
    { sinif: 'kart' },
    el(
      'div',
      { sinif: 'bolum-baslik' },
      el('h2', {}, taksit.ad),
      taksit.sayi ? el('span', { sinif: 'rozet' }, `${Math.min(durum.odenenAdet, taksit.sayi)}/${taksit.sayi}`) : null,
    ),
    degerler(['Ödenen', paraYaz(durum.odenen)], ['Kalan', paraYaz(durum.kalan)]),
    kategoriCubugu(durum.odenen, taksit.toplam),
    durum.kalan === 0
      ? el('p', { sinif: 'ipucu' }, '✓ Tamamlandı')
      : siradaki
        ? el('p', { sinif: siradaki.durum === 'gecikti' ? 'ipucu gecikti' : 'ipucu' }, `${siradaki.durum === 'gecikti' ? 'Gecikti' : 'Sıradaki'}: ${siradaki.kurus === null ? 'Tutar sende' : paraYaz(siradaki.kurus)} · ${tarihYaz(siradaki.vade)}`)
        : null,
    bitis ? el('p', { sinif: 'ipucu' }, `${taksit.tur === 'sabit' ? 'Bitiş' : 'Tahmini bitiş'}: ${ayYaz(bitis)}`) : null,
    el(
      'div',
      { sinif: 'kalem-dugme' },
      siradaki && siradaki.vade <= donem.bitis
        ? el('button', { type: 'button', sinif: 'kucuk', onclick: () => taksitOdeFormu(siradaki, donem, taksitlerEkrani) }, '✓ Ödedim')
        : null,
      el('button', { type: 'button', sinif: 'ikincil kucuk', onclick: () => taksitDetayi(taksit.id) }, 'Ödeme geçmişi ve düzenle'),
    ),
  );
}

function aySutunu(ay, enBuyuk) {
  const dolgu = el('span');
  dolgu.style.height = `${enBuyuk ? Math.round((ay.kurus / enBuyuk) * 100) : 0}%`;
  const [y, a] = ay.ay.split('-').map(Number);
  const adi = new Intl.DateTimeFormat('tr-TR', { month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(y, a - 1, 1)));
  return el(
    'div',
    { sinif: 'sutun', title: `${ayYaz(ay.ay)}: ${paraYaz(ay.kurus)}` },
    el('strong', {}, kisaPara(ay.kurus)),
    el('div', { sinif: 'sutun-kap' }, dolgu),
    adi,
  );
}

function taksitlerEkrani() {
  const bugun = bugunTR();
  const donem = donemBul(veri.ayar, bugun);
  if (!veri.donemler[donem.baslangic]) return anaEkran();

  const taksitler = veri.taksitler ?? [];
  const biten = (t) => taksitDurumu(veri, t).kalan === 0;
  const devam = taksitler.filter((t) => !biten(t));
  const tamam = taksitler.filter(biten);
  const aylar = gelecekAylar(veri, bugun);
  const enBuyuk = Math.max(...aylar.map((a) => a.kurus));
  sayfa(
    'odeme',
    ustBolum('Ödemeler'),
    bilgiSatiri(),
    odemeSekmeleri('Taksitler'),
    el('button', { type: 'button', onclick: () => taksitFormu() }, '+ Taksit ekle'),
    devam.length
      ? el(
          'section',
          { sinif: 'kart bosluk' },
          el('div', { sinif: 'bolum-baslik' }, el('h2', {}, 'Önümüzdeki aylar'), el('span', { sinif: 'rozet' }, `Gelecek ay: ${paraYaz(aylar[1].kurus)}`)),
          el('div', { sinif: 'sutunlar' }, aylar.map((a) => aySutunu(a, enBuyuk))),
        )
      : el('p', { sinif: 'ipucu bosluk' }, 'Devam eden taksit yok.'),
    el('div', { sinif: 'kartlar' }, devam.map((t) => taksitKarti(t, donem, bugun))),
    tamam.length ? el('div', { sinif: 'bolum-baslik' }, el('h2', {}, 'Tamamlandı')) : null,
    el('div', { sinif: 'kartlar' }, tamam.map((t) => taksitKarti(t, donem, bugun))),
  );
}

function taksitDetayi(id) {
  const taksit = veri.taksitler.find((t) => t.id === id);
  const donem = donemBul(veri.ayar, bugunTR());
  const { odemeler } = taksitDurumu(veri, taksit);
  goster(
    ustBolum(taksit.ad, taksitlerEkrani),
    bilgiSatiri(),
    el(
      'section',
      { sinif: 'kart' },
      el('h2', {}, 'Ödeme geçmişi'),
      taksit.onceki ? satir('Uygulamadan önce ödenen', paraYaz(taksit.onceki)) : null,
      odemeler.length
        ? [...odemeler].reverse().map((h) => kalem(
            tarihYaz(h.tarih),
            paraYaz(h.kurus),
            null,
            h.baslangic === donem.baslangic
              ? el('button', {
                  type: 'button',
                  sinif: 'ikincil kucuk',
                  onclick: () => {
                    kaydetVeUyar(taksitOdemeGeriAl(veri, h.baslangic, id, h.ay));
                    taksitDetayi(id);
                  },
                }, 'Geri al')
              : null,
          ))
        : el('p', { sinif: 'ipucu' }, 'Henüz ödeme yok.'),
    ),
    el('button', { type: 'button', sinif: 'ikincil', onclick: () => taksitFormu(taksit) }, 'Taksiti düzenle'),
  );
}

function taksitFormu(mevcut = null) {
  const bugun = bugunTR();
  const donem = donemBul(veri.ayar, bugun);
  const hata = hataSatiri();
  const tur = el(
    'select',
    { id: 'tur' },
    el('option', { value: 'sabit', selected: mevcut?.tur !== 'degisken' }, 'Sabit'),
    el('option', { value: 'degisken', selected: mevcut?.tur === 'degisken' }, 'Değişken'),
  );
  const gun = gunSecici('gun', mevcut?.gun);
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const ad = form.elements.ad.value.trim();
        if (!ad) return hataGoster(hata, 'Ne aldığını yaz.');
        const toplam = paraCoz(form.elements.toplam.value);
        if (!toplam) return hataGoster(hata, 'Toplam tutarı yaz. Örnek: 25.000');
        const sayiMetni = form.elements.sayi.value.trim();
        const sayi = sayiMetni ? Number(sayiMetni) : undefined;
        if (sayi !== undefined && (!Number.isInteger(sayi) || sayi < 1 || sayi > 120)) return hataGoster(hata, 'Taksit sayısı 1 ile 120 arasında olmalı.');
        if (tur.value === 'sabit' && sayi === undefined) return hataGoster(hata, 'Sabit taksit için taksit sayısını yaz.');
        if (!gun.value) return hataGoster(hata, 'Ödeme gününü seç.');
        const oncekiMetni = form.elements.onceki.value.trim();
        const onceki = oncekiMetni ? paraCoz(oncekiMetni) : undefined;
        if (onceki === null || onceki >= toplam) return hataGoster(hata, 'Daha önce ödenen tutar, toplamdan az olmalı.');

        const bilgiler = { ad, toplam, tur: tur.value, sayi, gun: Number(gun.value), onceki: onceki || undefined };
        if (mevcut) {
          kaydetVeUyar(taksitGuncelle(veri, mevcut.id, bilgiler));
        } else {
          const id = `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
          kaydetVeUyar(taksitEkle(veri, { id, ...bilgiler, ilkAy: baslangicAyi(bilgiler.gun, bugun, donem.baslangic).ilkAy }));
        }
        taksitlerEkrani();
      },
    },
    el('label', { htmlFor: 'ad' }, 'Ne aldın?'),
    el('input', { id: 'ad', name: 'ad', maxLength: 40, placeholder: 'Örnek: Tablet', value: mevcut?.ad ?? '', autocomplete: 'off' }),
    tutarAlani('toplam', 'Toplam ödeyeceğin tutar', mevcut ? paraYaz(mevcut.toplam) : ''),
    el('p', { sinif: 'ipucu' }, 'Vade farkı varsa onu da ekle. Ürün fiyatını değil, toplam ödeyeceğin tutarı yaz.'),
    ikiAlan(
      [el('label', { htmlFor: 'tur' }, 'Taksit tipi'), tur],
      [el('label', { htmlFor: 'sayi' }, 'Taksit sayısı'), el('input', { id: 'sayi', name: 'sayi', type: 'text', inputMode: 'numeric', autocomplete: 'off', placeholder: 'Örnek: 5', value: mevcut?.sayi ?? '' })],
    ),
    el('p', { sinif: 'ipucu' }, 'Sabitte tutarı uygulama hesaplar. Değişkende taksit sayısı boş kalabilir, her ödemede tutarı sen yazarsın.'),
    el('label', { htmlFor: 'gun' }, 'Her ayın ödeme günü'),
    gun,
    el('p', { sinif: 'ipucu' }, 'Ay kısa çekerse ayın son günü sayılır.'),
    tutarAlani('onceki', 'Daha önce ödediğin tutar (varsa)', mevcut?.onceki ? paraYaz(mevcut.onceki) : ''),
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
    mevcut
      ? el('button', {
          type: 'button',
          sinif: 'tehlike',
          onclick: () => {
            if (!window.confirm('Taksit silinsin mi? Ödenmiş kayıtlar Geçmiş bölümünde kalır.')) return;
            kaydetVeUyar(taksitSil(veri, mevcut.id));
            taksitlerEkrani();
          },
        }, 'Taksiti sil')
      : null,
  );
  goster(ustBolum(mevcut ? 'Taksiti düzenle' : 'Taksit ekle', mevcut ? () => taksitDetayi(mevcut.id) : taksitlerEkrani), form);
}

/* Harcamalar */

function cipSecici(adlar, ilk, yeniId, yeniAd) {
  let secili = ilk;
  const yeniKutu = el('input', { id: yeniId, maxLength: 20, placeholder: `Yeni ${yeniAd} adı`, autocomplete: 'off', hidden: true });

  function cipleriYaz() {
    for (const cip of cipler) cip.setAttribute('aria-pressed', String(cip.textContent === secili));
    if (secili) {
      yeniKutu.hidden = true;
      yeniKutu.value = '';
    }
  }

  const cipler = adlar.map((ad) => el('button', {
    type: 'button',
    sinif: 'cip',
    'aria-pressed': String(ad === secili),
    onclick: () => {
      secili = secili === ad ? null : ad;
      cipleriYaz();
    },
  }, ad));
  const yeniDugme = el('button', {
    type: 'button',
    sinif: 'cip',
    onclick: () => {
      secili = null;
      cipleriYaz();
      yeniKutu.hidden = false;
      yeniKutu.focus();
    },
  }, `+ Yeni ${yeniAd}`);

  return {
    kutu: el('div', { sinif: 'kategoriler' }, cipler, yeniDugme),
    yeniKutu,
    secili: () => secili,
    yazilan: () => yeniKutu.value.trim(),
  };
}

function harcamaFormu(donem, mevcut = null, geri = anaEkran, ortakBaslangic = false, ilkTutar = '') {
  const bugun = bugunTR();
  const hata = hataSatiri();
  const adlar = siraliKategoriler(veri);
  if (mevcut?.kategori && !adlar.includes(mevcut.kategori)) adlar.unshift(mevcut.kategori);
  const [tutarEtiketi, tutarKutusu] = tutarAlani('tutar', 'Tutar', mevcut ? paraYaz(mevcut.kurus) : ilkTutar);
  const ilkSecim = mevcut?.kategori ?? (!mevcut && ortakBaslangic && adlar.includes('Ev') ? 'Ev' : null);
  const secici = cipSecici(adlar, ilkSecim, 'yeni-kategori', 'kategori');

  const notKutusu = el('input', { id: 'not', name: 'not', maxLength: 80, value: mevcut?.not ?? '', autocomplete: 'off' });
  const notOrnegi = () => {
    notKutusu.placeholder = ortakKutusu.checked ? 'Örnek: Çamaşır suyu' : 'Örnek: 2 kilo elma';
  };
  const ortakKutusu = el('input', { id: 'ortak', type: 'checkbox', checked: mevcut?.ortak ?? ortakBaslangic, onchange: notOrnegi });
  notOrnegi();

  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const kurus = paraCoz(form.elements.tutar.value);
        if (!kurus) return hataGoster(hata, 'Sıfırdan büyük bir tutar yaz. Örnek: 100 ya da 1.250,50');
        const tarih = form.elements.tarih.value;
        if (!tarih || tarih < donem.baslangic || tarih > bugun) {
          return hataGoster(hata, `Tarih ${tarihYaz(donem.baslangic)} ile bugün arasında olmalı.`);
        }

        let yeni = veri;
        let kategori = secici.secili() ?? undefined;
        const yazilan = secici.yazilan();
        if (yazilan) ({ veri: yeni, ad: kategori } = kategoriEkle(veri, yazilan));
        const bilgi = { kurus, kategori, not: notKutusu.value.trim() || undefined, tarih, ortak: ortakKutusu.checked || undefined };
        kaydetVeUyar(mevcut ? harcamaGuncelle(yeni, donem.baslangic, mevcut.sira, bilgi) : harcamaEkle(yeni, donem.baslangic, bilgi));
        geri();
      },
    },
    tutarEtiketi,
    el(
      'div',
      { sinif: 'tutar-satir' },
      tutarKutusu,
      el('button', { type: 'button', sinif: 'simge', 'aria-label': 'Hesap makinesi', onclick: () => hesapAc(tutarKutusu) }, ikon('hesap')),
    ),
    el('p', { sinif: 'etiket' }, 'Kategori'),
    secici.kutu,
    secici.yeniKutu,
    el('p', { sinif: 'ipucu' }, `Kategori seçmezsen “${DIGER}” sayılır.`),
    ikiAlan(
      [el('label', { htmlFor: 'not' }, 'Not (isteğe bağlı)'), notKutusu],
      [el('label', { htmlFor: 'tarih' }, 'Tarih'), el('input', { id: 'tarih', name: 'tarih', type: 'date', min: donem.baslangic, max: bugun, value: mevcut?.tarih ?? bugun })],
    ),
    el('label', { sinif: 'secim', htmlFor: 'ortak' }, ortakKutusu, el('span', {}, 'Ortak ev için aldım')),
    el('p', { sinif: 'ipucu' }, 'Sadece bu dönemin günleri seçilebilir.'),
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
    mevcut
      ? el('button', {
          type: 'button',
          sinif: 'tehlike',
          onclick: () => {
            if (!window.confirm('Bu harcama silinsin mi? Tutarı paraya geri eklenir.')) return;
            kaydetVeUyar(hareketSil(veri, donem.baslangic, mevcut.sira));
            geri();
          },
        }, 'Harcamayı sil')
      : null,
  );
  goster(ustBolum(mevcut ? 'Harcamayı düzenle' : 'Harcama ekle', geri), form);
}

function kategoriCubugu(kurus, toplam) {
  const dolgu = el('span');
  dolgu.style.width = `${Math.round((kurus / toplam) * 100)}%`;
  return el('div', { sinif: 'cubuk' }, dolgu);
}

// Tarih verilirse geçmiş dönem salt okunur gösterilir.
function harcamalarEkrani(tarih = null) {
  const donem = donemBul(veri.ayar, bugunTR());
  const baslangic = tarih ?? donem.baslangic;
  const kayit = veri.donemler[baslangic];
  if (!kayit) return anaEkran();

  const yenile = () => harcamalarEkrani();
  const kayitlar = harcamaListesi(kayit);
  const toplamlar = kategoriToplamlari(kayit);
  const toplam = toplamlar.reduce((t, k) => t + k.kurus, 0);
  const ac = tarih ? goster : (...dugumler) => sayfa('harcama', ...dugumler);
  ac(
    ustBolum('Harcamalar', tarih ? gecmisEkrani : null),
    bilgiSatiri(),
    el(
      'div',
      { sinif: 'panel' },
      el(
        'div',
        {},
        el(
          'section',
          { sinif: 'hero' },
          el('p', { sinif: 'etiket' }, tarih ? `${tarihYaz(tarih)} dönemi` : 'Bu dönem'),
          el('p', { sinif: 'tutar' }, paraYaz(toplam)),
          el('p', { sinif: 'ipucu' }, 'Fatura ödemeleri bu toplama dahil değil.'),
        ),
        tarih ? null : el('button', { type: 'button', onclick: () => harcamaFormu(donem, null, yenile) }, '+ Harcama'),
        toplamlar.length
          ? el(
              'section',
              { sinif: 'kart bosluk' },
              el(
                'div',
                { sinif: 'bolum-baslik' },
                el('h2', {}, 'Kategoriler'),
                tarih ? null : el('button', { type: 'button', sinif: 'ikincil kucuk', onclick: kategorilerEkrani }, 'Kategorileri düzenle'),
              ),
              el(
                'div',
                { sinif: 'izgara' },
                toplamlar.map((k) => el(
                  'div',
                  { sinif: 'mini' },
                  el('p', { sinif: 'etiket' }, k.ad),
                  el('p', { sinif: 'kutu-buyuk' }, paraYaz(k.kurus)),
                  kategoriCubugu(k.kurus, toplam),
                )),
              ),
            )
          : null,
      ),
      el(
        'section',
        { sinif: 'kart' },
        el('h2', {}, 'Kayıtlar'),
        kayitlar.length
          ? kayitlar.map((h) => kalem(
              h.kategori ?? DIGER,
              paraYaz(h.kurus),
              [h.ortak ? 'Ortak ev' : null, h.not, tarihYaz(h.tarih)].filter(Boolean).join(' · '),
              tarih ? null : el('button', { type: 'button', sinif: 'ikincil kucuk', onclick: () => harcamaFormu(donem, h, yenile) }, 'Düzenle'),
            ))
          : el('p', { sinif: 'ipucu' }, 'Henüz harcama yok.'),
        tarih || toplamlar.length ? null : el('button', { type: 'button', sinif: 'ikincil bosluk', onclick: kategorilerEkrani }, 'Kategorileri düzenle'),
      ),
    ),
  );
}

function kategorilerEkrani() {
  const hata = hataSatiri();
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const ad = form.elements.ad.value.trim();
        if (!ad) return hataGoster(hata, 'Kategoriye bir ad yaz.');
        kaydetVeUyar(kategoriEkle(veri, ad).veri);
        kategorilerEkrani();
      },
    },
    el('label', { htmlFor: 'ad' }, 'Yeni kategori'),
    el('input', { id: 'ad', name: 'ad', maxLength: 20, placeholder: 'Örnek: Kırtasiye', autocomplete: 'off' }),
    hata,
    el('button', { type: 'submit' }, 'Ekle'),
  );
  goster(
    ustBolum('Kategoriler', () => harcamalarEkrani()),
    bilgiSatiri(),
    el(
      'section',
      { sinif: 'kart' },
      kategoriler(veri).map((ad) => kalem(ad, '', null, [
        el('button', { type: 'button', sinif: 'ikincil kucuk', onclick: () => kategoriAdEkrani(ad) }, 'Ad değiştir'),
        el('button', {
          type: 'button',
          sinif: 'tehlike kucuk',
          onclick: () => {
            if (!window.confirm(`“${ad}” silinsin mi? Eski kayıtlar bu adla kalır.`)) return;
            kaydetVeUyar(kategoriSil(veri, ad));
            kategorilerEkrani();
          },
        }, 'Sil'),
      ])),
    ),
    form,
  );
}

function kategoriAdEkrani(eski) {
  const hata = hataSatiri();
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const ad = form.elements.ad.value.trim();
        if (!ad) return hataGoster(hata, 'Kategoriye bir ad yaz.');
        kaydetVeUyar(kategoriAdDegistir(veri, eski, ad));
        kategorilerEkrani();
      },
    },
    el('label', { htmlFor: 'ad' }, 'Yeni ad'),
    el('input', { id: 'ad', name: 'ad', maxLength: 20, value: eski, autocomplete: 'off' }),
    el('p', { sinif: 'ipucu' }, 'Eski kayıtlar da yeni adı alır.'),
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
  );
  goster(ustBolum('Ad değiştir', kategorilerEkrani), form);
}

/* Ortak ev */

function kisiSecici() {
  const secenekler = [el('option', { value: '' }, 'Bölme')];
  for (let kisi = 2; kisi <= 10; kisi += 1) {
    secenekler.push(el('option', { value: String(kisi), selected: kisi === veri.ortakKisi }, `${kisi} kişi`));
  }
  return el('select', {
    id: 'ortak-kisi',
    onchange: (o) => {
      kaydetVeUyar({ ...veri, ortakKisi: o.target.value ? Number(o.target.value) : undefined });
      ortakEkrani();
    },
  }, secenekler);
}

// Tarih verilirse geçmiş dönem salt okunur gösterilir.
function ortakEkrani(tarih = null) {
  const donem = donemBul(veri.ayar, bugunTR());
  const baslangic = tarih ?? donem.baslangic;
  const kayit = veri.donemler[baslangic];
  if (!kayit) return anaEkran();

  const yenile = () => ortakEkrani();
  const liste = ortakListesi(kayit);
  const alinanlar = geriAlinanlar(kayit);
  const ozet = ortakOzet(kayit, veri.ortakKisi);
  goster(
    ustBolum('Ortak ev', tarih ? gecmisEkrani : anaEkran),
    bilgiSatiri(),
    el(
      'section',
      { sinif: 'hero' },
      el('p', { sinif: 'etiket' }, tarih ? `${tarihYaz(tarih)} dönemi` : 'Bu dönem ev için aldıkların'),
      el('p', { sinif: 'tutar', id: 'ortak-toplam' }, paraYaz(ozet.harcanan)),
      ozet.kisiBasi !== null || ozet.geriAlinan
        ? degerler(
            ozet.kisiBasi !== null ? [`Kişi başı (${veri.ortakKisi} kişi)`, paraYaz(ozet.kisiBasi)] : null,
            ozet.geriAlinan ? ['Geri aldım', paraYaz(ozet.geriAlinan)] : null,
            ozet.geriAlinan ? ['Sende kalan masraf', paraYaz(ozet.kalan)] : null,
          )
        : null,
      el('p', { sinif: 'ipucu' }, 'Bu liste sadece sende görünür. Tutarlar ana paradan düşer.'),
    ),
    tarih
      ? null
      : el(
          'div',
          { sinif: 'ikili' },
          el('button', { type: 'button', onclick: () => harcamaFormu(donem, null, yenile, true) }, '+ Ortak harcama'),
          el('button', { type: 'button', sinif: 'ikincil', onclick: () => geriAldimFormu(donem) }, 'Geri aldım'),
        ),
    el(
      'section',
      { sinif: 'kart' },
      el('h2', {}, 'Alınanlar'),
      liste.length
        ? liste.map((h) => kalem(
            h.not ?? h.kategori ?? DIGER,
            paraYaz(h.kurus),
            tarihYaz(h.tarih),
            tarih ? null : el('button', { type: 'button', sinif: 'ikincil kucuk', onclick: () => harcamaFormu(donem, h, yenile) }, 'Düzenle'),
          ))
        : el('p', { sinif: 'ipucu' }, 'Henüz ortak harcama yok.'),
    ),
    alinanlar.length
      ? el(
          'section',
          { sinif: 'kart' },
          el('h2', {}, 'Geri aldıkların'),
          alinanlar.map((h) => kalem(
            h.not ?? 'Geri aldım',
            paraYaz(h.kurus),
            tarihYaz(h.tarih),
            tarih
              ? null
              : el('button', {
                  type: 'button',
                  sinif: 'tehlike kucuk',
                  onclick: () => {
                    if (!window.confirm('Bu kayıt silinsin mi? Tutar paradan düşer.')) return;
                    kaydetVeUyar(hareketSil(veri, donem.baslangic, h.sira));
                    ortakEkrani();
                  },
                }, 'Sil'),
          )),
        )
      : null,
    tarih
      ? null
      : el(
          'section',
          { sinif: 'kart' },
          el('label', { htmlFor: 'ortak-kisi' }, 'Evde kaç kişi var?'),
          kisiSecici(),
          el('p', { sinif: 'ipucu bosluk' }, 'İstersen toplam eşit bölünür. Yeni dönemde liste temizlenir, eskisi Geçmiş bölümünde kalır.'),
        ),
  );
}

function geriAldimFormu(donem) {
  const hata = hataSatiri();
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const kurus = paraCoz(form.elements.tutar.value);
        if (!kurus) return hataGoster(hata, 'Sıfırdan büyük bir tutar yaz. Örnek: 100 ya da 1.250,50');
        kaydetVeUyar(geriAldimEkle(veri, donem.baslangic, { kurus, not: form.elements.not.value.trim() || undefined, tarih: bugunTR() }));
        ortakEkrani();
      },
    },
    tutarAlani('tutar', 'Ne kadar geri aldın?'),
    el('label', { htmlFor: 'not' }, 'Kimden? (isteğe bağlı)'),
    el('input', { id: 'not', name: 'not', maxLength: 80, autocomplete: 'off' }),
    el('p', { sinif: 'ipucu' }, 'Bu tutar paraya eklenir.'),
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
  );
  goster(ustBolum('Geri aldım', () => ortakEkrani()), form);
}

/* Gelirler */

function gelirFormu(donem, mevcut = null, geri = anaEkran) {
  const bugun = bugunTR();
  const hata = hataSatiri();
  const adlar = siraliKaynaklar(veri);
  if (mevcut?.kaynak && !adlar.includes(mevcut.kaynak)) adlar.unshift(mevcut.kaynak);
  const secici = cipSecici(adlar, mevcut?.kaynak ?? null, 'yeni-kaynak', 'kaynak');

  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const kurus = paraCoz(form.elements.tutar.value);
        if (!kurus) return hataGoster(hata, 'Sıfırdan büyük bir tutar yaz. Örnek: 100 ya da 1.250,50');
        const tarih = form.elements.tarih.value;
        if (!tarih || tarih < donem.baslangic || tarih > bugun) {
          return hataGoster(hata, `Tarih ${tarihYaz(donem.baslangic)} ile bugün arasında olmalı.`);
        }

        let yeni = veri;
        let kaynak = secici.secili() ?? undefined;
        if (secici.yazilan()) ({ veri: yeni, ad: kaynak } = kaynakEkle(veri, secici.yazilan()));
        const bilgi = { kurus, kaynak, not: form.elements.not.value.trim() || undefined, tarih };
        kaydetVeUyar(mevcut ? harcamaGuncelle(yeni, donem.baslangic, mevcut.sira, bilgi) : gelirEkle(yeni, donem.baslangic, bilgi));
        geri();
      },
    },
    tutarAlani('tutar', 'Tutar', mevcut ? paraYaz(mevcut.kurus) : ''),
    el('p', { sinif: 'etiket' }, 'Nereden geldi?'),
    secici.kutu,
    secici.yeniKutu,
    el('p', { sinif: 'ipucu' }, `Seçmezsen “${EK_GELIR}” yazılır.`),
    ikiAlan(
      [el('label', { htmlFor: 'not' }, 'Not (isteğe bağlı)'), el('input', { id: 'not', name: 'not', maxLength: 80, placeholder: 'Örnek: Özel ders', value: mevcut?.not ?? '', autocomplete: 'off' })],
      [el('label', { htmlFor: 'tarih' }, 'Tarih'), el('input', { id: 'tarih', name: 'tarih', type: 'date', min: donem.baslangic, max: bugun, value: mevcut?.tarih ?? bugun })],
    ),
    el('p', { sinif: 'ipucu' }, 'Bu tutar serbest paraya eklenir.'),
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
    mevcut
      ? el('button', {
          type: 'button',
          sinif: 'tehlike',
          onclick: () => {
            if (!window.confirm('Bu gelir silinsin mi? Tutar paradan düşer.')) return;
            kaydetVeUyar(hareketSil(veri, donem.baslangic, mevcut.sira));
            geri();
          },
        }, 'Geliri sil')
      : null,
  );
  goster(ustBolum(mevcut ? 'Geliri düzenle' : 'Gelir ekle', geri), form);
}

// Tarih verilirse geçmiş dönem salt okunur gösterilir.
function gelirlerEkrani(tarih = null) {
  const donem = donemBul(veri.ayar, bugunTR());
  const baslangic = tarih ?? donem.baslangic;
  const kayit = veri.donemler[baslangic];
  if (!kayit) return anaEkran();

  const yenile = () => gelirlerEkrani();
  const liste = gelirListesi(kayit);
  const ozet = gelirOzet(kayit);
  goster(
    ustBolum('Gelirler', tarih ? gecmisEkrani : anaEkran),
    bilgiSatiri(),
    el(
      'section',
      { sinif: 'hero' },
      el('p', { sinif: 'etiket' }, tarih ? `${tarihYaz(tarih)} dönemi · Toplam` : 'Bu dönem · Toplam'),
      el('p', { sinif: 'tutar' }, paraYaz(ozet.toplam)),
      degerler(['Dönem başı parası', paraYaz(ozet.baslangic)], [EK_GELIR, paraYaz(ozet.ekGelir)]),
      el('p', { sinif: 'ipucu' }, 'Dönem başı parası, maaşla birlikte yazdığın tutardır.'),
    ),
    tarih ? null : el('button', { type: 'button', onclick: () => gelirFormu(donem, null, yenile) }, '+ Gelir'),
    el(
      'section',
      { sinif: 'kart bosluk' },
      el('h2', {}, 'Kayıtlar'),
      liste.length
        ? liste.map((h) => kalem(
            h.kaynak ?? EK_GELIR,
            paraYaz(h.kurus),
            [h.not, tarihYaz(h.tarih)].filter(Boolean).join(' · '),
            tarih ? null : el('button', { type: 'button', sinif: 'ikincil kucuk', onclick: () => gelirFormu(donem, h, yenile) }, 'Düzenle'),
          ))
        : el('p', { sinif: 'ipucu' }, 'Henüz ek gelir yok.'),
    ),
  );
}

function gecmisEkrani() {
  const guncel = donemBul(veri.ayar, bugunTR()).baslangic;
  const tarihler = Object.keys(veri.donemler).filter((t) => t < guncel).sort().reverse();
  const kartlar = tarihler.map((tarih) => {
    const kayit = veri.donemler[tarih];
    return el(
      'section',
      { sinif: 'kart' },
      el('h2', {}, `${tarihYaz(tarih)} dönemi`),
      degerler(
        ['Başlangıç parası', paraYaz(kayit.para)],
        ['Dönem sonu', paraYaz(kalanPara(kayit))],
        ['Gelir', paraYaz(hareketToplami(kayit, 'gelir'))],
        ['Harcama', paraYaz(hareketToplami(kayit, 'harcama'))],
        ['Faturalar', paraYaz(hareketToplami(kayit, 'fatura'))],
        ['Taksitler', paraYaz(hareketToplami(kayit, 'taksit'))],
        hareketToplami(kayit, 'birikim') ? ['Birikime gitti', paraYaz(hareketToplami(kayit, 'birikim'))] : null,
        hareketToplami(kayit, 'satis') ? ['Birikim satışı', paraYaz(hareketToplami(kayit, 'satis'))] : null,
      ),
      (kayit.hareketler ?? []).filter((h) => h.tur === 'fatura' || h.tur === 'taksit').map((h) => el('p', { sinif: 'ipucu' }, `✓ ${h.ad}: ${paraYaz(h.kurus)}`)),
      el(
        'div',
        { sinif: 'kalem-dugme' },
        hareketToplami(kayit, 'harcama')
          ? el('button', { type: 'button', sinif: 'ikincil kucuk', onclick: () => harcamalarEkrani(tarih) }, 'Harcamaları gör')
          : null,
        gelirListesi(kayit).length
          ? el('button', { type: 'button', sinif: 'ikincil kucuk', onclick: () => gelirlerEkrani(tarih) }, 'Gelirleri gör')
          : null,
        ortakListesi(kayit).length
          ? el('button', { type: 'button', sinif: 'ikincil kucuk', onclick: () => ortakEkrani(tarih) }, 'Ortak ev listesini gör')
          : null,
      ),
    );
  });
  const icerik = kartlar.length ? kartlar : [el('p', { sinif: 'ipucu' }, 'Henüz geçmiş dönem yok.')];
  goster(ustBolum('Geçmiş dönemler', anaEkran), ...icerik);
}

function paraDuzelt(donem, kayit) {
  const hata = hataSatiri();
  const kayitsiz = el('input', { id: 'kayitsiz', type: 'checkbox', checked: true });
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const yeni = paraCoz(form.elements.para.value);
        if (yeni === null) return hataGoster(hata, 'Tutarı örnekteki gibi yaz: 25.000 ya da 1.250,50');
        const fark = yeni - kalanPara(kayit);
        if (fark < 0 && kayitsiz.checked) {
          kaydetVeUyar(harcamaEkle(veri, donem.baslangic, { kurus: -fark, kategori: KAYITSIZ, tarih: bugunTR() }));
        } else {
          kaydetVeUyar({ ...veri, donemler: { ...veri.donemler, [donem.baslangic]: { ...kayit, para: kayit.para + fark } } });
        }
        anaEkran();
      },
    },
    tutarAlani('para', 'Elindeki para', paraYaz(Math.max(kalanPara(kayit), 0))),
    el('label', { sinif: 'secim', htmlFor: 'kayitsiz' }, kayitsiz, el('span', {}, `Para azaldıysa farkı “${KAYITSIZ}” harcama olarak yaz`)),
    el('p', { sinif: 'ipucu' }, 'Yanlış tutar girdiysen bu kutuyu boş bırak.'),
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
  );
  goster(ustBolum('Tutarı düzelt', anaEkran), form);
}

/* Birikimlerim */

function fiyatBul(kod) {
  return piyasaKaydi?.fiyatlar[kod] ?? tcmbKur?.fiyatlar[kod] ?? null;
}

function degerBul(tur, miktar) {
  const fiyat = fiyatBul(TURLER[tur].kod);
  return fiyat ? bugunkuDeger(miktar, fiyat.alis) : null;
}

function toplamDeger() {
  return kullanilanTurler(veri).reduce((t, tur) => t + (degerBul(tur, eldeki(veri, tur)) ?? 0), 0);
}

function birikimOzetKarti() {
  const turler = kullanilanTurler(veri).filter((tur) => eldeki(veri, tur) > 0);
  if (!turler.length) return null;
  return el(
    'button',
    { type: 'button', sinif: 'varlik altin kart', onclick: birikimlerEkrani },
    el('p', { sinif: 'etiket' }, 'Birikimlerin · bugünkü yaklaşık değer'),
    el('p', { sinif: 'kutu-buyuk' }, paraYaz(toplamDeger())),
    el('p', { sinif: 'ipucu' }, turler.slice(0, 3).map((tur) => (TURLER[tur].birim === 'adet' ? `${miktarSayi(eldeki(veri, tur))} ${TURLER[tur].ad.toLocaleLowerCase('tr-TR')}` : miktarYaz(eldeki(veri, tur), tur))).join(' · ')),
  );
}

function birikimlerEkrani() {
  const bugun = bugunTR();
  const donem = donemBul(veri.ayar, bugun);
  const kayit = veri.donemler[donem.baslangic];
  if (!kayit) return anaEkran();

  const turler = kullanilanTurler(veri);
  const buAy = ayAlinanlar(veri, bugun.slice(0, 7));
  const fiyatsiz = turler.some((tur) => eldeki(veri, tur) > 0 && !fiyatBul(TURLER[tur].kod));
  sayfa(
    'birikim',
    ustBolum('Birikimlerim'),
    bilgiSatiri(),
    el(
      'section',
      { sinif: 'hero altin' },
      el('p', { sinif: 'etiket' }, 'Bugünkü yaklaşık değer'),
      el('p', { sinif: 'tutar', id: 'birikim-deger' }, paraYaz(toplamDeger())),
      degerler(
        ['Bu ay aldıkların', buAy.length ? buAy.map((k) => miktarYaz(k.miktar, k.tur)).join(', ') : 'Henüz yok'],
        ['Bu dönem birikime gitti', paraYaz(hareketToplami(kayit, 'birikim'))],
      ),
      fiyatsiz ? el('p', { sinif: 'ipucu' }, 'Bazı fiyatlar alınamadı, toplama katılmadı.') : null,
    ),
    el('button', { type: 'button', onclick: () => birikimFormu() }, '+ Birikim ekle'),
    turler.length
      ? [
          el('div', { sinif: 'bolum-baslik' }, el('h2', {}, 'Neler var?')),
          el(
            'div',
            { sinif: 'izgara' },
            turler.map((tur) => {
              const miktar = eldeki(veri, tur);
              const deger = degerBul(tur, miktar);
              return el(
                'button',
                { type: 'button', sinif: `varlik${TURLER[tur].altin ? ' altin' : ''}`, onclick: () => birikimDetayi(tur) },
                ikon(TURLER[tur].altin ? 'birikim' : 'dolar'),
                el('p', { sinif: 'etiket' }, TURLER[tur].ad),
                el('p', { sinif: 'kutu-buyuk' }, miktarYaz(miktar, tur)),
                el('p', { sinif: 'ipucu' }, deger === null ? 'Fiyat yok' : `≈ ${paraYaz(deger)}`),
              );
            }),
          ),
        ]
      : el('p', { sinif: 'ipucu orta bosluk' }, 'Henüz birikim eklemedin. Eklediklerin hiç sıfırlanmaz, ay ay üstüne eklenir.'),
    el('p', { sinif: 'ipucu orta bosluk' }, 'Değer, güncel alış fiyatıyla hesaplanan yaklaşık tutardır. Kuyumcu ve banka fiyatı farklı olabilir.'),
  );
  canliEkran = birikimlerEkrani;
}

function birikimDetayi(tur, yil = null) {
  const bilgi = TURLER[tur];
  const donem = donemBul(veri.ayar, bugunTR());
  const miktar = eldeki(veri, tur);
  const deger = degerBul(tur, miktar);
  const secenekler = yillar(veri, tur);
  const seciliYil = yil ?? secenekler[0];
  const ozet = aylikOzet(veri, tur, seciliYil);
  const satisVar = ozet.aylar.some((a) => a.satilan);
  goster(
    ustBolum(bilgi.ad, birikimlerEkrani),
    bilgiSatiri(),
    el(
      'section',
      { sinif: `hero${bilgi.altin ? ' altin' : ''}` },
      el('p', { sinif: 'etiket' }, 'Toplam'),
      el('p', { sinif: 'tutar' }, miktarYaz(miktar, tur)),
      el('p', { sinif: 'ipucu' }, deger === null ? 'Güncel fiyat yok' : `Bugünkü yaklaşık değer: ${paraYaz(deger)}`),
    ),
    el(
      'div',
      { sinif: 'ikili' },
      el('button', { type: 'button', onclick: () => birikimFormu(tur, () => birikimDetayi(tur)) }, '+ Ekle'),
      el('button', { type: 'button', sinif: 'ikincil', disabled: miktar === 0, onclick: () => satisFormu(tur, donem) }, 'Sattım'),
    ),
    el(
      'section',
      { sinif: 'kart' },
      el('h2', {}, 'Ay ay'),
      secenekler.length > 1
        ? el('div', { sinif: 'kategoriler' }, secenekler.map((y) => el('button', { type: 'button', sinif: 'cip', 'aria-pressed': String(y === seciliYil), onclick: () => birikimDetayi(tur, y) }, y)))
        : null,
      el(
        'table',
        { sinif: 'tablo bosluk' },
        el('thead', {}, el('tr', {}, el('th', {}, 'Ay'), el('th', {}, 'Alınan'), satisVar ? el('th', {}, 'Satılan') : null, el('th', {}, 'Toplam'))),
        el('tbody', {}, ozet.aylar.map((a) => el(
          'tr',
          {},
          el('td', {}, ayYaz(a.ay)),
          el('td', {}, a.alinan ? miktarSayi(a.alinan) : '–'),
          satisVar ? el('td', {}, a.satilan ? miktarSayi(a.satilan) : '–') : null,
          el('td', {}, miktarSayi(a.toplam)),
        ))),
      ),
      el('p', { sinif: 'ipucu bosluk' }, `${seciliYil} yılında ${miktarYaz(ozet.alinan, tur)} aldın${ozet.satilan ? `, ${miktarYaz(ozet.satilan, tur)} sattın` : ''}.`),
    ),
    el(
      'section',
      { sinif: 'kart' },
      el('h2', {}, 'Kayıtlar'),
      turKayitlari(veri, tur).map((k) => kalem(
        `${k.islem === 'satis' ? 'Satış' : 'Alış'}: ${miktarYaz(k.miktar, tur)}`,
        k.kurus ? paraYaz(k.kurus) : '',
        [tarihYaz(k.tarih), k.islem === 'alis' && !k.paradan ? 'Paradan düşmedi' : null].filter(Boolean).join(' · '),
        el('button', {
          type: 'button',
          sinif: 'tehlike kucuk',
          onclick: () => {
            if (!window.confirm('Bu kayıt silinsin mi? Paraya işlendiyse o işlem de geri alınır.')) return;
            const yeni = birikimSil(veri, k.id);
            if (!yeni) {
              uyari = 'Bu alış silinemez, çünkü sonrasında satış kaydı var. Önce satışı sil.';
              return birikimDetayi(tur, seciliYil);
            }
            kaydetVeUyar(yeni);
            return yeni.birikimler.some((b) => b.tur === tur) ? birikimDetayi(tur) : birikimlerEkrani();
          },
        }, 'Sil'),
      )),
    ),
  );
}

function birikimKimligi() {
  return `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function birikimFormu(ilkTur = 'gram', geri = birikimlerEkrani) {
  const bugun = bugunTR();
  const donem = donemBul(veri.ayar, bugun);
  const hata = hataSatiri();
  let tur = ilkTur;
  const miktarEtiketi = el('label', { htmlFor: 'miktar' });
  const fiyatNotu = el('p', { sinif: 'ipucu' });
  const cipler = Object.entries(TURLER).map(([kod, bilgi]) => el('button', {
    type: 'button',
    sinif: 'cip',
    'aria-pressed': String(kod === tur),
    'data-tur': kod,
    onclick: () => {
      tur = kod;
      turYaz();
    },
  }, bilgi.ad));
  const eskiKutu = el('input', { id: 'eski', type: 'checkbox', onchange: () => eskiYaz() });
  const tarihKutu = el('input', { id: 'tarih', name: 'tarih', type: 'date', max: bugun, value: bugun });
  const [tutarEtiketi, tutarKutusu] = tutarAlani('tutar', 'Ödediğin tutar');
  const tarihNotu = el('p', { sinif: 'ipucu' });

  function turYaz() {
    const { birim, kod } = TURLER[tur];
    for (const cip of cipler) cip.setAttribute('aria-pressed', String(cip.dataset.tur === tur));
    miktarEtiketi.textContent = birim === 'adet' ? 'Kaç adet?' : `Kaç ${birim}?`;
    const fiyat = fiyatBul(kod);
    fiyatNotu.textContent = fiyat ? `Şu anki satış fiyatı: ${fiyatYaz(fiyat.satis, kod === 'USD' || kod === 'EUR' ? 4 : 2)} TL` : '';
  }

  function eskiYaz() {
    tutarEtiketi.textContent = eskiKutu.checked ? 'Ödediğin tutar (bilmiyorsan boş bırak)' : 'Ödediğin tutar';
    tarihKutu.min = eskiKutu.checked ? '' : donem.baslangic;
    tarihNotu.textContent = eskiKutu.checked ? 'Eski birikim paranı değiştirmez, sadece listeye eklenir.' : 'Tutar paradan düşer, harcama sayılmaz. Tarih bu dönemden olmalı.';
  }

  turYaz();
  eskiYaz();

  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const miktar = miktarCoz(form.elements.miktar.value, tur);
        if (miktar === null) {
          return hataGoster(hata, TURLER[tur].ondalik ? 'Sıfırdan büyük bir miktar yaz. Örnek: 2,5' : 'Adet tam sayı olmalı. Örnek: 2');
        }
        const yazilan = tutarKutusu.value.trim();
        const kurus = yazilan ? paraCoz(yazilan) : undefined;
        if (kurus === null || kurus === 0 || (!eskiKutu.checked && kurus === undefined)) {
          return hataGoster(hata, 'Ödediğin tutarı yaz. Örnek: 15.000');
        }
        const tarih = tarihKutu.value;
        if (!tarih || tarih > bugun || (!eskiKutu.checked && tarih < donem.baslangic)) {
          return hataGoster(hata, eskiKutu.checked ? 'Tarih bugünden ileri olamaz.' : `Tarih ${tarihYaz(donem.baslangic)} ile bugün arasında olmalı.`);
        }
        kaydetVeUyar(birikimEkle(veri, eskiKutu.checked ? null : donem.baslangic, { id: birikimKimligi(), tur, miktar, kurus, tarih }));
        birikimDetayi(tur);
      },
    },
    el('p', { sinif: 'etiket' }, 'Ne aldın?'),
    el('div', { sinif: 'kategoriler' }, cipler),
    ikiAlan(
      [miktarEtiketi, el('input', { id: 'miktar', name: 'miktar', sinif: 'tutar-kutu', type: 'text', inputMode: 'decimal', autocomplete: 'off', placeholder: 'Örnek: 3' })],
      [el('label', { htmlFor: 'tarih' }, 'Tarih'), tarihKutu],
    ),
    fiyatNotu,
    tutarEtiketi,
    tutarKutusu,
    el('label', { sinif: 'secim', htmlFor: 'eski' }, eskiKutu, el('span', {}, 'Paradan düşme (eski birikim)')),
    tarihNotu,
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
  );
  goster(ustBolum('Birikim ekle', geri), form);
}

function satisFormu(tur, donem) {
  const bugun = bugunTR();
  const elde = eldeki(veri, tur);
  const hata = hataSatiri();
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const miktar = miktarCoz(form.elements.miktar.value, tur);
        if (miktar === null) return hataGoster(hata, TURLER[tur].ondalik ? 'Sıfırdan büyük bir miktar yaz. Örnek: 2,5' : 'Adet tam sayı olmalı. Örnek: 2');
        if (miktar > elde) return hataGoster(hata, `Elinde ${miktarYaz(elde, tur)} var. Daha fazlası satılamaz.`);
        const kurus = paraCoz(form.elements.tutar.value);
        if (!kurus) return hataGoster(hata, 'Eline geçen tutarı yaz. Örnek: 15.000');
        const tarih = form.elements.tarih.value;
        if (!tarih || tarih < donem.baslangic || tarih > bugun) {
          return hataGoster(hata, `Tarih ${tarihYaz(donem.baslangic)} ile bugün arasında olmalı.`);
        }
        kaydetVeUyar(satisEkle(veri, donem.baslangic, { id: birikimKimligi(), tur, miktar, kurus, tarih }));
        birikimDetayi(tur);
      },
    },
    ikiAlan(
      [el('label', { htmlFor: 'miktar' }, TURLER[tur].birim === 'adet' ? 'Kaç adet sattın?' : `Kaç ${TURLER[tur].birim} sattın?`), el('input', { id: 'miktar', name: 'miktar', sinif: 'tutar-kutu', type: 'text', inputMode: 'decimal', autocomplete: 'off' })],
      [el('label', { htmlFor: 'tarih' }, 'Tarih'), el('input', { id: 'tarih', name: 'tarih', type: 'date', min: donem.baslangic, max: bugun, value: bugun })],
    ),
    el('p', { sinif: 'ipucu' }, `Elinde ${miktarYaz(elde, tur)} var.`),
    tutarAlani('tutar', 'Eline geçen tutar'),
    el('p', { sinif: 'ipucu' }, 'Bu tutar serbest paraya eklenir.'),
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
  );
  goster(ustBolum(`${TURLER[tur].ad} sattım`, () => birikimDetayi(tur)), form);
}

/* Piyasa */

function dovizMi(kod) {
  return DOVIZLER.some((d) => d.kod === kod);
}

function durumSatiri() {
  const durum = piyasaDurumu(piyasaKaydi, Date.now(), bugunTR());
  if (durum === 'yok') return el('p', { sinif: 'durum' }, piyasaHata ? 'Fiyat alınamadı' : 'Fiyatlar bekleniyor');
  const zaman = piyasaKaydi.tarih === bugunTR() ? piyasaKaydi.saat : `${tarihYaz(piyasaKaydi.tarih)} ${piyasaKaydi.saat}`;
  const metin = { guncel: `Güncel · ${zaman}`, kapali: `Piyasa kapalı · Son fiyat ${zaman}`, eski: `Son fiyat · ${zaman}` }[durum];
  return el('p', { sinif: `durum${durum === 'guncel' ? ' guncel' : ''}` }, metin);
}

function degisimYazisi(fiyat) {
  if (fiyat.degisim === null) return null;
  const yon = fiyat.degisim > 0 ? 'artis' : fiyat.degisim < 0 ? 'dusus' : '';
  const isaret = fiyat.degisim > 0 ? '▲ ' : fiyat.degisim < 0 ? '▼ ' : '';
  return el('p', { sinif: `degisim ${yon}` }, `${isaret}%${fiyatYaz(Math.abs(fiyat.degisim))}`);
}

function piyasaSeridi() {
  return [
    el('div', { sinif: 'bolum-baslik' }, el('h2', {}, 'Piyasa'), durumSatiri()),
    el(
      'div',
      { sinif: 'serit' },
      [...DOVIZLER, ...ALTINLAR.slice(0, 2)].map(({ kod, ad }) => {
        const fiyat = fiyatBul(kod);
        return el(
          'button',
          { type: 'button', sinif: 'varlik', 'aria-label': `${ad} fiyatı`, onclick: piyasaEkrani },
          el('p', { sinif: 'etiket' }, ad),
          el('p', { sinif: 'fiyat' }, fiyat ? fiyatYaz(fiyat.satis, dovizMi(kod) ? 4 : 2) : '–'),
          fiyat ? degisimYazisi(fiyat) : null,
        );
      }),
    ),
  ];
}

function fiyatKarti({ kod, ad }) {
  const fiyat = piyasaKaydi?.fiyatlar[kod] ?? null;
  const ondalik = dovizMi(kod) ? 4 : 2;
  return el(
    'div',
    { sinif: 'kart' },
    el('p', { sinif: 'etiket' }, ad),
    el('p', { sinif: 'fiyat' }, fiyat ? `${fiyatYaz(fiyat.satis, ondalik)} TL` : '–'),
    fiyat ? el('p', { sinif: 'ipucu' }, `Alış: ${fiyatYaz(fiyat.alis, ondalik)}`) : null,
    fiyat ? degisimYazisi(fiyat) : null,
  );
}

function piyasaEkrani() {
  sayfa(
    'piyasa',
    ustBolum('Piyasa'),
    el(
      'div',
      { sinif: 'bolum-baslik' },
      durumSatiri(),
      el('button', {
        type: 'button',
        sinif: 'ikincil kucuk',
        disabled: piyasaYukleniyor,
        onclick: () => {
          if (Date.now() - sonElleYenileme < ELLE_YENILEME_SURESI) return;
          sonElleYenileme = Date.now();
          piyasaYenile();
        },
      }, ikon('yenile'), piyasaYukleniyor ? 'Yenileniyor' : 'Yenile'),
    ),
    piyasaHata && piyasaKaydi ? el('p', { sinif: 'ipucu', role: 'status' }, 'Yeni fiyat alınamadı, son bilinen fiyat gösteriliyor.') : null,
    el('button', { type: 'button', onclick: paramNeAlirEkrani }, 'Param ne alır?'),
    el('div', { sinif: 'bolum-baslik' }, el('h2', {}, 'Döviz')),
    el('div', { sinif: 'izgara' }, DOVIZLER.map(fiyatKarti)),
    el('div', { sinif: 'bolum-baslik' }, el('h2', {}, 'Altın')),
    el('div', { sinif: 'izgara' }, ALTINLAR.map(fiyatKarti)),
    tcmbKur
      ? el(
          'section',
          { sinif: 'kart bosluk' },
          el('h2', {}, 'Merkez Bankası kuru'),
          degerler(...DOVIZLER.filter(({ kod }) => tcmbKur.fiyatlar[kod]).map(({ kod, ad }) => [ad, `${fiyatYaz(tcmbKur.fiyatlar[kod].satis, 4)} TL`])),
          el('p', { sinif: 'ipucu' }, `Resmî döviz satış kuru · ${tarihYaz(tcmbKur.tarih)}. Günde bir açıklanır.`),
        )
      : null,
    el('p', { sinif: 'ipucu orta bosluk' }, `Büyük yazılan satış fiyatıdır. Yaklaşık fiyattır, 5 dakikada bir yenilenir. Banka, döviz bürosu ve kuyumcu fiyatları farklı olabilir. Kaynak: ${KAYNAK_ADI}.`),
  );
  canliEkran = piyasaEkrani;
}

function serbestPara(donem, kayit, bugun) {
  return kalanPara(kayit) - ayrilanTutar([...donemKalemleri(veri, donem, bugun), ...donemTaksitleri(veri, donem, bugun)]);
}

function paramNeAlirEkrani() {
  const bugun = bugunTR();
  const donem = donemBul(veri.ayar, bugun);
  const kayit = veri.donemler[donem.baslangic];
  if (!kayit) return anaEkran();

  const serbest = serbestPara(donem, kayit, bugun);
  const kalemler = [
    ['USD', 'Dolar', (m) => `${fiyatYaz(m)} dolar`],
    ['EUR', 'Euro', (m) => `${fiyatYaz(m)} euro`],
    ['GRA', 'Gram altın', (m) => `${fiyatYaz(m)} gram`],
    ['CEYREKALTIN', 'Çeyrek altın', (m) => `${Math.floor(m)} adet`],
    ['YARIMALTIN', 'Yarım altın', (m) => `${Math.floor(m)} adet`],
    ['TAMALTIN', 'Tam altın', (m) => `${Math.floor(m)} adet`],
  ];
  const [etiket, kutu] = tutarAlani('tutar', 'Ne kadar paran var?');
  const hata = hataSatiri();
  const sonuc = el('div', { sinif: 'izgara bosluk', id: 'ne-alir' });

  function hesapla() {
    const kurus = paraCoz(kutu.value);
    hata.hidden = true;
    if (kutu.value.trim() && !kurus) hataGoster(hata, 'Tutarı örnekteki gibi yaz: 25.000 ya da 1.250,50');
    sonuc.replaceChildren(...(kurus ? kalemler : []).map(([kod, ad, yaz]) => {
      const fiyat = fiyatBul(kod);
      return el(
        'div',
        { sinif: 'mini' },
        el('p', { sinif: 'etiket' }, ad),
        el('p', { sinif: 'kutu-buyuk' }, fiyat ? yaz(neAlir(kurus, fiyat.satis)) : 'Fiyat yok'),
      );
    }));
  }

  kutu.addEventListener('input', hesapla);
  goster(
    ustBolum('Param ne alır?', piyasaEkrani),
    el(
      'form',
      { onsubmit: (o) => o.preventDefault() },
      etiket,
      kutu,
      hata,
      el('button', {
        type: 'button',
        sinif: 'ikincil',
        disabled: serbest <= 0,
        onclick: () => {
          kutu.value = paraYaz(serbest);
          hesapla();
        },
      }, `Serbest paramı getir (${paraYaz(serbest)})`),
    ),
    sonuc,
    el('p', { sinif: 'ipucu orta bosluk' }, 'Yaklaşık hesaptır, güncel satış fiyatı kullanılır. Banka, döviz bürosu ve kuyumcu fiyatları farklı olabilir.'),
  );
}

function canliTazele() {
  if (!canliEkran) return;
  const konum = window.scrollY ?? 0;
  canliEkran();
  window.scrollTo?.(0, konum);
}

async function jsonGetir(adres) {
  const denetim = new AbortController();
  const sure = setTimeout(() => denetim.abort(), 10000);
  try {
    const cevap = await window.fetch(adres, { cache: 'no-store', signal: denetim.signal });
    if (!cevap.ok) throw new Error(String(cevap.status));
    return await cevap.json();
  } finally {
    clearTimeout(sure);
  }
}

async function piyasaYenile() {
  if (!window.fetch || piyasaYukleniyor) return;
  piyasaYukleniyor = true;
  canliTazele();
  const [asil, resmi] = await Promise.allSettled([jsonGetir(KAYNAK), jsonGetir(TCMB_DOSYA)]);
  const fiyatlar = asil.status === 'fulfilled' ? fiyatCoz(asil.value) : null;
  const kur = resmi.status === 'fulfilled' ? tcmbCoz(resmi.value) : null;
  if (kur) tcmbKur = kur;
  if (fiyatlar) piyasaKaydi = { ...fiyatlar, alindi: Date.now() };
  piyasaHata = !fiyatlar;
  if (piyasaKaydi) piyasaKaydet({ ...piyasaKaydi, tcmb: tcmbKur });
  piyasaYukleniyor = false;
  canliTazele();
}

function piyasaBaslat() {
  piyasaKaydi = piyasaYukle();
  tcmbKur = piyasaKaydi?.tcmb ?? null;
  if (!window.fetch) return;
  piyasaYenile();
  const sayac = setInterval(() => {
    if (document.visibilityState !== 'hidden') piyasaYenile();
  }, YENILEME_SURESI);
  sayac.unref?.();
}

/* Hesap makinesi */

const HESAP_ANAHTAR = 'cuzdan.hesap';

function hesapGecmisi() {
  try {
    const liste = JSON.parse(localStorage.getItem(HESAP_ANAHTAR));
    return Array.isArray(liste) ? liste.filter((k) => typeof k?.ifade === 'string' && typeof k?.sonuc === 'string') : [];
  } catch {
    return [];
  }
}

function hesapGecmisineEkle(kayit) {
  try {
    localStorage.setItem(HESAP_ANAHTAR, JSON.stringify([kayit, ...hesapGecmisi()].slice(0, 5)));
  } catch {
    // Geçmiş tutulamasa da hesap çalışır.
  }
}

function hesapPaneli(aktarYazisi, aktar) {
  let durum = yeniDurum();
  const ifade = el('p', { sinif: 'hesap-ifade' });
  const sonuc = el('p', { sinif: 'hesap-sonuc', role: 'status', id: 'hesap-sonuc' });
  const aktarDugme = el('button', { type: 'button', onclick: () => aktar(paraYaz(hesaplananKurus())) }, aktarYazisi);
  const gecmis = el('div');

  function hesaplananKurus() {
    const cevap = hesapla(durum.parcalar);
    return cevap?.deger ? kurusaCevir(cevap.deger) : null;
  }

  function ciz() {
    const cevap = hesapla(durum.parcalar);
    ifade.textContent = durum.bitti ? '' : ifadeYaz(durum.parcalar);
    sonuc.textContent = cevap?.hata ?? (cevap ? sonucYaz(cevap.deger) : '0');
    sonuc.className = cevap?.hata === SIFIRA_BOLME ? 'hesap-sonuc uyari' : 'hesap-sonuc';
    aktarDugme.disabled = hesaplananKurus() === null;
    gecmis.replaceChildren(...hesapGecmisi().map((k) => el(
      'button',
      {
        type: 'button',
        sinif: 'hesap-gecmis',
        onclick: () => {
          durum = sayidanParca(k.sonuc);
          ciz();
        },
      },
      el('span', {}, k.ifade),
      el('strong', {}, k.sonuc),
    )));
  }

  function bas(tus) {
    if (tus === '=' && !durum.bitti) {
      const cevap = hesapla(durum.parcalar);
      if (cevap?.deger) hesapGecmisineEkle({ ifade: ifadeYaz(durum.parcalar), sonuc: sonucYaz(cevap.deger) });
    }
    durum = tusla(durum, tus);
    ciz();
  }

  const tuslar = [
    ['C', 'islem', 'Temizle'], ['⌫', 'islem', 'Son rakamı sil'], ['%', 'islem', 'Yüzde'], ['÷', 'islem', 'Böl'],
    ['7'], ['8'], ['9'], ['×', 'islem', 'Çarp'],
    ['4'], ['5'], ['6'], ['-', 'islem', 'Çıkar', '−'],
    ['1'], ['2'], ['3'], ['+', 'islem', 'Topla'],
    ['0', 'genis-tus'], [','], ['=', 'esit', 'Eşittir'],
  ];
  ciz();
  return el(
    'div',
    {},
    el('div', { sinif: 'hesap-ekran' }, ifade, sonuc),
    el('div', { sinif: 'tuslar' }, tuslar.map(([tus, sinif, ad, yazi]) => el(
      'button',
      { type: 'button', sinif: sinif ?? '', 'data-tus': tus, 'aria-label': ad ?? tus, onclick: () => bas(tus) },
      yazi ?? tus,
    ))),
    aktarDugme,
    el('div', { sinif: 'bosluk' }, gecmis),
  );
}

function hesapEkrani() {
  const donem = donemBul(veri.ayar, bugunTR());
  if (!veri.donemler[donem.baslangic]) return anaEkran();
  goster(
    ustBolum('Hesap makinesi', anaEkran),
    hesapPaneli('Harcamaya aktar', (tutar) => harcamaFormu(donem, null, anaEkran, false, tutar)),
  );
}

// Form ekranda kaldığı için yazılan kategori ve not kaybolmaz.
function hesapAc(kutu) {
  const kapat = () => perde.remove();
  const pano = el(
    'div',
    { sinif: 'hesap-pano', role: 'dialog', 'aria-label': 'Hesap makinesi' },
    el(
      'div',
      { sinif: 'ust' },
      el('h2', {}, 'Hesap makinesi'),
      el('button', { type: 'button', sinif: 'ikincil kucuk', onclick: kapat }, 'Kapat'),
    ),
    hesapPaneli('Tutara aktar', (tutar) => {
      kutu.value = tutar;
      kapat();
    }),
  );
  const perde = el('div', { sinif: 'hesap-perde' }, pano);
  kok.append(perde);
}

/* Ayarlar */

function ayarlarEkrani() {
  const bugun = bugunTR();
  const son = veri.ayar.kurallar.at(-1);
  goster(
    ustBolum('Ayarlar', anaEkran),
    bilgiSatiri(),
    el(
      'section',
      { sinif: 'kart' },
      el('h2', {}, 'Cüzdan'),
      el('button', { type: 'button', sinif: 'ikincil', onclick: adDegistir }, `Adını değiştir (${veri.ad})`),
    ),
    el(
      'section',
      { sinif: 'kart' },
      el('h2', {}, 'Maaş'),
      el('p', { sinif: 'ipucu' }, `Normal maaş günü: ayın ${son.gun}. günü`),
      el(
        'div',
        { sinif: 'ikili' },
        el('button', { type: 'button', sinif: 'ikincil', onclick: maasGunuEkrani }, 'Maaş gününü değiştir'),
        el('button', { type: 'button', sinif: 'ikincil', onclick: () => kaydirmaEkrani(bugun) }, 'Sadece sıradaki maaş farklı günde'),
      ),
    ),
    el(
      'section',
      { sinif: 'kart' },
      el('h2', {}, 'Yedek'),
      el(
        'div',
        { sinif: 'ikili' },
        el('button', { type: 'button', sinif: 'ikincil', onclick: yedekIndir }, 'Yedeği indir'),
        el('label', { sinif: 'dosya' }, 'Yedekten yükle', el('input', { type: 'file', accept: 'application/json,.json', onchange: yedekYukle })),
      ),
    ),
    el(
      'section',
      { sinif: 'kart' },
      el('h2', {}, 'Uygulama'),
      el('button', { type: 'button', sinif: 'ikincil', onclick: kurulumRehberi }, 'Ana ekrana ekle'),
    ),
    el(
      'section',
      { sinif: 'kart' },
      el('h2', {}, 'Hesap'),
      el('p', { sinif: 'ipucu' }, 'Hesap sistemi henüz bağlı değil. Silme işlemi sadece bu cihazdaki verileri siler.'),
      el('button', { type: 'button', sinif: 'tehlike', onclick: verileriSil }, 'Bu cihazdaki verileri sil'),
    ),
  );
}

function adDegistir() {
  const hata = hataSatiri();
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const ad = form.elements.ad.value.trim();
        if (!ad) return hataGoster(hata, 'Cüzdanına bir ad yaz.');
        kaydetVeUyar({ ...veri, ad });
        ayarlarEkrani();
      },
    },
    el('label', { htmlFor: 'ad' }, 'Cüzdan adı'),
    el('input', { id: 'ad', name: 'ad', maxLength: 30, value: veri.ad, autocomplete: 'off' }),
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
  );
  goster(ustBolum('Cüzdan adı', ayarlarEkrani), form);
}

function maasGunuEkrani() {
  const hata = hataSatiri();
  const secici = gunSecici('gun', veri.ayar.kurallar.at(-1).gun);
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        if (!secici.value) return hataGoster(hata, 'Maaş gününü seç.');
        kaydetVeUyar({ ...veri, ayar: maasGunuDegistir(veri.ayar, Number(secici.value), bugunTR()) });
        ayarlarEkrani();
      },
    },
    el('label', { htmlFor: 'gun' }, 'Yeni maaş günü'),
    secici,
    el('p', { sinif: 'ipucu' }, 'Geçmiş kayıtlar değişmez. Sıradaki dönem yeni günde başlar.'),
    kisaAyNotu(),
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
  );
  goster(ustBolum('Maaş günü', ayarlarEkrani), form);
}

function kaydirmaEkrani(bugun) {
  const { enErken, enGec, sonraki } = kaydirmaSiniri(veri.ayar, bugun);
  const hata = hataSatiri();
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const yeni = maasKaydir(veri.ayar, bugun, form.elements.tarih.value);
        if (!yeni) return hataGoster(hata, 'Seçilen tarih bu dönem için uygun değil.');
        kaydetVeUyar({ ...veri, ayar: yeni });
        ayarlarEkrani();
      },
    },
    el('label', { htmlFor: 'tarih' }, 'Sıradaki maaş hangi gün yatacak?'),
    el('input', { id: 'tarih', name: 'tarih', type: 'date', min: enErken, max: enGec, value: sonraki, required: true }),
    el('p', { sinif: 'ipucu' }, `Şu an görünen: ${tarihYaz(sonraki)}. Sonraki aylarda normal gün geçerli olur.`),
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
  );
  goster(ustBolum('Sıradaki maaş', ayarlarEkrani), form);
}

function yedekIndir() {
  const dosya = new Blob([JSON.stringify(veri, null, 2)], { type: 'application/json' });
  const adres = URL.createObjectURL(dosya);
  const bag = el('a', { href: adres, download: `cuzdan-yedek-${bugunTR()}.json` });
  document.body.append(bag);
  bag.click();
  bag.remove();
  URL.revokeObjectURL(adres);
}

async function yedekYukle(olay) {
  const dosya = olay.target.files[0];
  if (!dosya) return;
  const yeni = yedekCoz(await dosya.text());
  if (!yeni) {
    uyari = 'Bu dosya geçerli bir Cüzdan yedeği değil. Mevcut verilerin değişmedi.';
    return ayarlarEkrani();
  }
  if (!window.confirm('Bu cihazdaki veriler yedekle değiştirilecek. Devam edilsin mi?')) return;
  kaydetVeUyar(yeni);
  anaEkran();
}

function verileriSil() {
  if (!window.confirm('Bu cihazdaki tüm Cüzdan verileri silinecek. Önce yedek almanı öneririm. Emin misin?')) return;
  if (!window.confirm('Son onay: Silinen veriler geri gelmez.')) return;
  if (!temizle()) {
    uyari = 'Veriler silinemedi.';
    return ayarlarEkrani();
  }
  veri = null;
  uyari = '';
  kurulumTaslak = { adim: 1, ad: '', gun: null };
  kurulumEkrani();
}

function kurulumRehberi() {
  const iphone = /iPhone|iPad|iPod/.test(navigator.userAgent ?? '');
  const androidDugme = kurulumIstemi
    ? el('button', {
        type: 'button',
        onclick: async () => {
          kurulumIstemi.prompt();
          await kurulumIstemi.userChoice;
          kurulumIstemi = null;
          kurulumRehberi();
        },
      }, 'Şimdi ekle')
    : null;

  const iphoneKarti = el(
    'section',
    { sinif: 'kart' },
    el('h2', {}, 'iPhone'),
    el('ol', {}, ['Bu sayfayı Safari ile aç.', 'Alttaki Paylaş düğmesine dokun.', '“Ana Ekrana Ekle” seçeneğine dokun.', 'Sağ üstten “Ekle” de.'].map((s) => el('li', {}, s))),
    el('p', { sinif: 'ipucu' }, 'Bildirimler için iOS 16.4 veya daha yeni sürüm gerekir.'),
  );
  const androidKarti = el(
    'section',
    { sinif: 'kart' },
    el('h2', {}, 'Android'),
    androidDugme,
    el('ol', {}, ['Bu sayfayı Chrome ile aç.', 'Sağ üstteki üç noktaya dokun.', '“Ana ekrana ekle” ya da “Uygulamayı yükle” seçeneğine dokun.'].map((s) => el('li', {}, s))),
  );

  goster(ustBolum('Ana ekrana ekle', ayarlarEkrani), iphone ? iphoneKarti : androidKarti, iphone ? androidKarti : iphoneKarti);
}

/* Başlangıç */

function baslat() {
  const { veri: kayitli, bozuk } = yukle();
  if (bozuk) {
    return goster(
      el('h1', {}, 'Cüzdan'),
      el('p', { sinif: 'hata', role: 'alert' }, 'Kayıtlı veriler okunamadı. Hiçbir şey silinmedi. Yedeğin varsa yükleyebilirsin.'),
      el('label', { sinif: 'dosya' }, 'Yedekten yükle', el('input', {
        type: 'file',
        accept: 'application/json,.json',
        onchange: async (o) => {
          const yeni = yedekCoz(await o.target.files[0].text());
          if (!yeni) return;
          kaydetVeUyar(yeni);
          anaEkran();
        },
      })),
    );
  }
  veri = kayitli;
  piyasaBaslat();
  return veri ? anaEkran() : kurulumEkrani();
}

window.addEventListener('beforeinstallprompt', (olay) => {
  olay.preventDefault();
  kurulumIstemi = olay;
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (kok.querySelector('#ana-para')) anaEkran();
  if (Date.now() - (piyasaKaydi?.alindi ?? 0) > YENILEME_SURESI) piyasaYenile();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

baslat();
