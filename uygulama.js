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
import { kaydet, temizle, veriGecerliMi, yedekCoz, yukle } from './depo.js';
import {
  BulutHatasi,
  VAPID_ACIK,
  abonelikKaydet,
  baglantiOturumu,
  cikisYap,
  esitlemeDurumu,
  esitlemeYaz,
  girisYap,
  gonderilenleriOku,
  hesapSil,
  kayitOl,
  oturum,
  planGonder,
  sifreBaglantisi,
  sifreDegistir,
  uzagaYaz,
  uzaktanOku,
  verkiSor,
} from './bulut.js';
import {
  atlamaGeriAl,
  ayAtla,
  ayGeri,
  ayIleri,
  ayrilanTutar,
  baslangicAyi,
  bekliyorMu,
  donemKalemleri,
  faturaEkle,
  faturaGuncelle,
  faturaOde,
  faturaSil,
  ileriKalemler,
  kartOdemeTarihi,
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
import {
  bildirimAyari,
  bildirimPlani,
  gelenler,
  yeniKira,
  gosterilenKaydet,
  gosterilenYukle,
} from './bildirim.js';
import { kenardaPara, planAyir, planDurumu, planEkle, planKapat } from './plan.js';
import { defterDurumu, defterEkle, defterOde, defterOdemeSil, defterOzet, defterSil } from './defter.js';
import { GRUPLAR, girenMi, gunlereAyir, hareketListesi, hareketToplamlari } from './hareket.js';
import { acilisGoster } from './acilis.js';
import { sesAyarla, sesCal } from './sesler.js';
import { imzaSvg } from './imza.js';
import { BIRIMLER, birimBul, cevir, gerekli } from './cevirici.js';
import { ilkSutun, takvimAyi } from './takvim.js';
import { SORULAR, soruAnla, verkiCevabi, verkiOzeti } from './verki.js';
import { konusmaCoz } from './ses.js';
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
  fiyatDegistiMi,
  fiyatYaz,
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
  verki: '<path d="M6 9c0-2.500 1-4.200 2.500-5.300l1.500 1.800h4l1.500-1.800C17 4.800 18 6.500 18 9v7a6 6 0 0 1-12 0z"/><circle cx="9.500" cy="10.500" r="2.200"/><circle cx="14.500" cy="10.500" r="2.200"/><circle cx="9.800" cy="10.500" r=".7"/><circle cx="14.200" cy="10.500" r=".7"/><path d="M12 12.600l-1 1.700h2z"/><path d="M9.500 17.500c1.300.8 3.700.8 5 0"/>',
  zil: '<path d="M6 10a6 6 0 1 1 12 0c0 5 2 6.500 2 6.500H4s2-1.500 2-6.500z"/><path d="M10 20a2.200 2.200 0 0 0 4 0"/>',
  zilKapali: '<path d="M6 10a6 6 0 1 1 12 0c0 5 2 6.500 2 6.500H4s2-1.500 2-6.500z"/><path d="M10 20a2.200 2.200 0 0 0 4 0"/><path d="m4 3.500 16 17"/>',
  kalem: '<path d="M4 20l1-4.500L16.5 4l3.5 3.500L8.5 19z"/>',
  yenile: '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v4.500h-4.5"/>',
  dolar: '<circle cx="12" cy="12" r="8.5"/><path d="M15 9c-.5-1.2-1.7-1.8-3-1.8-1.7 0-3 .9-3 2.3 0 3.2 6 1.7 6 4.9 0 1.4-1.3 2.3-3 2.3-1.3 0-2.5-.6-3-1.8"/><path d="M12 5.500v13"/>',
  gonder: '<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/>',
  mikrofon: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0"/><path d="M12 18v3"/>',
  defter: '<path d="M6 3.500h11a2 2 0 0 1 2 2v15H7.500A2.5 2.5 0 0 1 5 18V4.500a1 1 0 0 1 1-1z"/><path d="M5 18a2.5 2.5 0 0 1 2.5-2.500H19"/><path d="M9.5 8h5"/>',
  plan: '<rect x="4" y="5" width="16" height="15.5" rx="2.5"/><path d="M4 10h16"/><path d="M8.5 3v4M15.5 3v4"/><path d="m9 15 2 2 4-4"/>',
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
let aktifGeri = null;
let sonrakiGeri = null;
let bandSayaci = null;
let esitlemeSayaci = null;
let esitleniyor = false;

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
  aktifGeri = sonrakiGeri;
  sonrakiGeri = null;
  kok.classList.remove('genis', 'verki-sayfa');
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
    el('button', { type: 'button', sinif: 'verki-dugme', 'aria-label': 'Verki', onclick: () => verkiEkrani() }, ikon('verki')),
    sekmeler.map(([kod, ad, simge, ac]) => el(
      'button',
      { type: 'button', onclick: ac, ...(kod === aktif ? { 'aria-current': 'page' } : {}) },
      ikon(simge),
      ad,
    )),
  );
}

let verkiSohbeti = [];
const HITAP_ANAHTAR = 'cuzdan.verkihitap';

function hitapOku() {
  try {
    return localStorage.getItem(HITAP_ANAHTAR) ?? '';
  } catch {
    return '';
  }
}

function hitapYaz(ad) {
  try {
    if (ad) localStorage.setItem(HITAP_ANAHTAR, ad);
    else localStorage.removeItem(HITAP_ANAHTAR);
  } catch {
    // Saklanamazsa Verki bu oturumda hitabı unutur, sohbet yine çalışır.
  }
}

// Kullanıcının yazdığı hitap kısa ve düz kalır; isim gibi kısa bir söz olmalı.
function hitapTemizle(metin) {
  return metin.replace(/[^\p{L}\p{N} ]/gu, '').trim().slice(0, 20);
}

function verkiEkrani() {
  const bugun = bugunTR();
  const liste = el('div', { sinif: 'verki-sohbet', 'aria-live': 'polite' });
  const durum = el('p', { sinif: 'ipucu', role: 'status' });
  const kutu = el('textarea', { id: 'verki-soru', name: 'verki-soru', rows: 1, autocomplete: 'off', enterKeyHint: 'send', placeholder: 'Verki’ye yaz…' });
  const gonderDugme = el('button', { type: 'submit', sinif: 'verki-gonder', 'aria-label': 'Gönder' }, ikon('gonder'));

  const balon = (m) => {
    const icerik = el(
      'div',
      { sinif: m.rol === 'verki' ? 'verki-balon verki' : 'verki-balon sen' },
      m.yaziyor ? el('span', { sinif: 'yaziyor', 'aria-label': 'Yazıyor' }, el('i'), el('i'), el('i')) : el('p', {}, m.metin),
      (m.satirlar ?? []).length ? el('div', { sinif: 'verki-satirlar' }, m.satirlar.map((s) => kalem(s.ad, s.tutar, s.alt ?? null))) : null,
    );
    return m.rol === 'verki'
      ? el('div', { sinif: 'verki-satir' }, el('span', { sinif: 'verki-mini', 'aria-hidden': 'true' }, ikon('verki')), icerik)
      : el('div', { sinif: 'verki-satir sen' }, icerik);
  };
  const ekle = (m) => {
    const dugum = balon(m);
    liste.append(dugum);
    dugum.scrollIntoView?.({ block: 'end', behavior: 'smooth' });
    return dugum;
  };
  const verkiDedi = (m) => {
    verkiSohbeti.push({ rol: 'verki', ...m });
    return ekle({ rol: 'verki', ...m });
  };
  const yerelCevap = (kod) => {
    const cevap = verkiCevabi(kod, veri, bugun);
    return { metin: cevap.ozet, satirlar: cevap.satirlar };
  };

  const hitapSec = (metin) => {
    const ad = hitapTemizle(metin);
    if (!ad) {
      verkiDedi({ metin: 'Bunu hitap olarak anlayamadım. Sana "Hocam" ya da adın gibi kısa bir şekilde söyle.' });
      return;
    }
    hitapYaz(ad);
    liste.querySelector('.verki-hitaplar')?.remove();
    verkiDedi({ metin: `Memnun oldum ${ad}! Ödemelerini, serbest paranı, harcamalarını sorabilirsin. Yaz ya da mikrofona dokunup söyle.` });
  };

  // Hazır sorular ve internetsiz durum uygulamanın kendi hesabıyla, serbest sohbet yapay zekâyla cevaplanır.
  const sor = async (metin, hazirKod = null) => {
    const temiz = metin.trim();
    if (!temiz || gonderDugme.disabled) return;
    kutu.value = '';
    kutu.style.height = 'auto';
    durum.textContent = '';
    verkiSohbeti.push({ rol: 'kullanici', metin: temiz });
    ekle({ rol: 'kullanici', metin: temiz });
    if (!hitapOku() && !hazirKod) {
      hitapSec(temiz);
      return;
    }
    const kod = hazirKod ?? (oturum() ? null : soruAnla(temiz));
    if (kod) {
      verkiDedi(yerelCevap(kod));
      return;
    }
    if (!oturum()) {
      verkiDedi({ metin: 'Serbest sohbet için hesapla giriş yapman lazım (Ayarlar). Şimdilik aşağıdaki hazır sorulara cevap verebilirim.' });
      return;
    }
    gonderDugme.disabled = true;
    const bekleme = ekle({ rol: 'verki', yaziyor: true });
    try {
      const gecmis = verkiSohbeti.slice(-9).map((m) => ({ rol: m.rol, metin: m.metin }));
      const { cevap } = await verkiSor(gecmis, verkiOzeti(veri, bugun), hitapOku());
      bekleme.remove();
      verkiDedi({ metin: cevap });
    } catch (hata) {
      bekleme.remove();
      const yedek = soruAnla(temiz);
      verkiDedi(yedek ? { ...yerelCevap(yedek), metin: `${hata.message} Elimdeki kayıtlardan bakayım: ${yerelCevap(yedek).metin}` } : { metin: hata.message });
    } finally {
      gonderDugme.disabled = false;
    }
  };

  // Yazı satır sonunda aşağı kayar; kutu 5 satıra kadar büyür, sonra içinde kaydırılır.
  const boyutla = () => {
    kutu.style.height = 'auto';
    kutu.style.height = `${Math.min(kutu.scrollHeight, 120)}px`;
  };
  kutu.addEventListener('input', boyutla);
  kutu.addEventListener('keydown', (olay) => {
    if (olay.key === 'Enter' && !olay.shiftKey) {
      olay.preventDefault();
      sor(kutu.value);
    }
  });
  // Klavye açılınca yazma çubuğu klavyenin üstünde kalsın.
  const gorunum = window.visualViewport;
  const klavyeyeUy = () => {
    if (gorunum) kok.style.setProperty('--klavye', `${Math.max(0, window.innerHeight - gorunum.height - gorunum.offsetTop)}px`);
  };
  gorunum?.addEventListener('resize', klavyeyeUy);
  gorunum?.addEventListener('scroll', klavyeyeUy);

  const Tanima = sesDestegi();
  const mikrofon = Tanima
    ? el('button', {
        type: 'button',
        sinif: 'verki-mikrofon',
        'aria-label': 'Sesle sor',
        onclick: (olay) => {
          const dugme = olay.currentTarget;
          if (dugme.classList.contains('dinliyor')) {
            dugme.tanima?.stop();
            return;
          }
          const tanima = new Tanima();
          dugme.tanima = tanima;
          tanima.lang = 'tr-TR';
          tanima.interimResults = false;
          tanima.maxAlternatives = 1;
          const bitir = () => {
            dugme.classList.remove('dinliyor');
            kutu.placeholder = 'Verki’ye yaz…';
          };
          tanima.onresult = (sonuc) => {
            bitir();
            sor(sonuc.results[0][0].transcript);
          };
          tanima.onerror = () => {
            bitir();
            durum.textContent = 'Ses alınamadı. Mikrofon iznini kontrol et ya da yaz.';
          };
          tanima.onend = () => {
            if (dugme.classList.contains('dinliyor')) {
              bitir();
              durum.textContent = 'Bir şey duymadım. Tekrar dene.';
            }
          };
          dugme.classList.add('dinliyor');
          kutu.placeholder = 'Dinliyorum, konuş…';
          durum.textContent = '';
          titret(10);
          tanima.start();
        },
      }, ikon('mikrofon'))
    : null;

  for (const m of verkiSohbeti) liste.append(balon(m));
  if (!verkiSohbeti.length) {
    const hitap = hitapOku();
    if (!hitap) {
      liste.append(balon({ rol: 'verki', metin: 'Merhaba, ben Verki, cüzdanının baykuşu. Sana nasıl hitap edeyim? Aşağıdan seç ya da adını yaz.' }));
      liste.append(el('div', { sinif: 'verki-hitaplar' }, ['Hocam', 'Kral', 'Abi', 'Dostum'].map((ad) => el('button', { type: 'button', sinif: 'verki-soru', onclick: () => { verkiSohbeti.push({ rol: 'kullanici', metin: ad }); ekle({ rol: 'kullanici', metin: ad }); hitapSec(ad); } }, ad))));
    } else {
      liste.append(balon({
        rol: 'verki',
        metin: oturum() ? `Merhaba ${hitap}! Ödemelerini, serbest paranı, harcamalarını sorabilirsin. Yaz ya da mikrofona dokunup söyle, anlarım.` : `Merhaba ${hitap}! Aşağıdaki hazır sorulara cevap verebilirim. Serbest sohbet için hesapla giriş yapman lazım (Ayarlar).`,
      }));
    }
  }

  goster(
    ustBolum('Verki', anaEkran),
    el(
      'section',
      { sinif: 'verki-tanitim' },
      el('span', { sinif: 'verki-simge', 'aria-hidden': 'true' }, ikon('verki')),
      el('div', {}, el('h2', {}, 'Merhaba, ben Verki'), el('p', {}, 'Paranı senin için okurum, sorularını cevaplarım.')),
    ),
    el('div', { sinif: 'verki-sorular' }, SORULAR.map(({ kod, soru }) => el('button', { type: 'button', sinif: 'verki-soru', onclick: () => sor(soru, kod) }, soru))),
    liste,
    durum,
    hitapOku() ? el('button', { type: 'button', sinif: 'metin-dugme verki-not', onclick: () => { hitapYaz(''); verkiSohbeti = []; verkiEkrani(); } }, `Hitap: ${hitapOku()} · değiştir`) : null,
    oturum() ? el('p', { sinif: 'ipucu orta verki-not' }, 'Yazdığın soru ve bu dönemin özeti (ödemeler, harcama toplamları) cevap için Google Gemini’ye gider. İsim ve e-postan gitmez. Günde 30 soru sınırı var.') : null,
    el('form', { sinif: 'verki-yaz', onsubmit: (olay) => { olay.preventDefault(); sor(kutu.value); } }, kutu, mikrofon, gonderDugme),
  );
  kok.classList.add('verki-sayfa');
  klavyeyeUy();
}

function kaydetVeUyar(yeni) {
  veri = yeni;
  uyari = kaydet(veri) ? '' : 'Kayıt yapılamadı. Telefonda yer dolu olabilir, yedeğini indir.';
  planYaz();
  esitleIste();
}

// Sadece önemli anlarda: tek kısa kayıt, iki kısa tamamlanma. Desteklemeyen telefonda sessizce geçer.
function titret(kalip = 14) {
  if (veri?.titresim !== false) window.navigator?.vibrate?.(kalip);
}

function tamamlandi() {
  sesCal('kazanc');
  titret([14, 70, 14]);
}

// Gece altını yalnız koyu çalışır; zümrüt varsayılandır, kaydedilmez.
const TEMA_RENGI = { zumrut: '#0a4238', gece: '#0c0c0a', lacivert: '#12264f' };

function gorunumUygula() {
  const kok_ = document.documentElement;
  const mod = veri?.renk === 'gece' ? 'dark' : { acik: 'light', koyu: 'dark' }[veri?.mod];
  if (mod) kok_.dataset.theme = mod;
  else delete kok_.dataset.theme;
  if (veri?.renk) kok_.dataset.renk = veri.renk;
  else delete kok_.dataset.renk;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', TEMA_RENGI[veri?.renk ?? 'zumrut']);
}

// Yanlış dokunuşu tek hamlede geri almak için önceki kaydı birkaç saniye tutar.
function bandGoster(metin, onceki, ekran) {
  document.querySelector('.kayit-bandi')?.remove();
  clearTimeout(bandSayaci);
  titret();
  const bant = el(
    'div',
    { sinif: 'kayit-bandi', role: 'status' },
    el('span', {}, metin),
    el('button', {
      type: 'button',
      onclick: () => {
        bant.remove();
        kaydetVeUyar(onceki);
        ekran();
      },
    }, 'Geri al'),
  );
  document.body.append(bant);
  bandSayaci = setTimeout(() => bant.remove(), 6000);
  bandSayaci.unref?.();
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
    el('img', { src: 'ikon/logo.svg', alt: '' }),
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
      el('button', { type: 'button', sinif: 'ikincil', onclick: () => girisEkrani('giris', kurulumEkrani) }, 'Hesabım var, giriş yap'),
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
  sonrakiGeri = geri ?? null;
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
    el('section', { sinif: 'hero' }, el('h2', {}, 'Yeni ay, temiz sayfa'), el('p', { sinif: 'ipucu' }, 'Bugün maaş günü, faturalarını gözden geçir. Geçen dönem Geçmiş bölümünde duruyor.')),
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
  const kenarda = kenardaPara(veri);
  const serbest = para - ayrilan - kenarda;
  const [alt, ust] = yaklasikAralik(serbest);
  const donemGunu = gunFarki(donem.baslangic, donem.sonraki);
  sayfa(
    'ana',
    ustBolum(veri.ad),
    bilgiSatiri(),
    hatirlatmaKartlari(donem, kayit, bugun),
    el(
      'div',
      { sinif: 'panel' },
      el(
        'div',
        {},
        el(
          'section',
          { sinif: 'hero' },
          el('p', { sinif: 'etiket' }, 'Serbest para'),
          el('p', { sinif: 'tutar', id: 'ana-para' }, paraYaz(serbest)),
          degerler(['Toplam para', paraYaz(para)], ['Ödemelere ayrıldı', paraYaz(ayrilan)], kenarda ? ['Kenarda duran', paraYaz(kenarda)] : null),
          belirsiz ? el('p', { sinif: 'ipucu' }, `${belirsiz} ödemenin tutarı henüz belli değil, hesaba katılmadı.`) : null,
          el('p', { sinif: 'ipucu' }, `Dönemin ${donemGunu - kalanGun + 1}. günü · Sonraki maaş: ${tarihYaz(donem.sonraki)} (${kalanGun} gün kaldı)`),
          kategoriCubugu(donemGunu - kalanGun, donemGunu),
          el(
            'div',
            { sinif: 'hero-dugmeler' },
            el('button', { type: 'button', sinif: 'hayalet', onclick: () => hareketlerEkrani() }, ikon('gecmis'), 'Bu ayki hareketler'),
            el('button', { type: 'button', sinif: 'hayalet', onclick: () => paraDuzelt(donem, kayit) }, ikon('kalem'), 'Toplam parayı düzelt'),
          ),
        ),
        el(
          'div',
          { sinif: 'ikili' },
          el('button', { type: 'button', onclick: () => harcamaFormu(donem) }, '+ Harcama'),
          el('button', { type: 'button', sinif: 'ikincil', onclick: () => gelirFormu(donem) }, '+ Gelir'),
        ),
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
      el(
        'div',
        {},
        el(
          'div',
          { sinif: 'hizli' },
          [
            ['Gelirler', 'gelir', () => gelirlerEkrani()],
            ['Ortak ev', 'ortak', () => ortakEkrani()],
            ['Alacak-verecek', 'defter', defterEkrani],
            ['Masraf planı', 'plan', planlarEkrani],
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
        piyasaSeridi(),
        birikimOzetKarti(),
      ),
    ),
    el('p', { sinif: 'ipucu orta bosluk' }, oturum() ? `Hesabına kaydediliyor · ${oturum().eposta}` : 'Veriler sadece bu cihazda. Ayarlar bölümünden hesap açabilirsin.'),
    el('button', { type: 'button', sinif: 'imza-dugme', 'aria-label': 'Hakkında', onclick: () => hakkindaEkrani(anaEkran) }, imzaCiz()),
  );
  canliEkran = anaEkran;
}

function odemeSekmeleri(aktif) {
  return el(
    'div',
    { sinif: 'sekmeler' },
    [['Faturalar', faturalarEkrani], ['Taksitler', taksitlerEkrani], ['Takvim', () => takvimEkrani()]].map(([ad, ac]) => el('button', { type: 'button', 'aria-pressed': String(ad === aktif), onclick: ac }, ad)),
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

// Çan kaydı hatırlatmaya alır; telefon bildirimi kapalıysa izni ilk basışta ister.
function zilDugmesi(kayit, guncelle, geri) {
  const acik = Boolean(veri.bildirim?.telefon) && !kayit.bildirimKapali;
  return el('button', {
    type: 'button',
    sinif: acik ? 'zil acik' : 'zil',
    'aria-pressed': String(acik),
    'aria-label': `${kayit.ad} hatırlatması`,
    onclick: async () => {
      if (!acik && !veri.bildirim?.telefon && !(await telefonIzni())) {
        uyari = 'Bildirim izni alınamadı. Telefonun ayarlarından Cüzdan için bildirimi aç.';
        return geri();
      }
      kaydetVeUyar(guncelle(veri, kayit.id, { bildirimKapali: acik ? true : undefined }));
      geri();
    },
  }, ikon(acik ? 'zil' : 'zilKapali'));
}

function zilIpucu() {
  const metin = veri.bildirim?.telefon && !oturum()
    ? 'Uygulama kapalıyken saatinde gelmesi için Ayarlar\'dan hesap aç.'
    : 'Çan açıksa günü gelince telefonuna bildirim gelir.';
  return el('p', { sinif: 'ipucu bosluk' }, metin);
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
      dugmeler.push(zilDugmesi(veri.faturalar.find((f) => f.id === odeme.faturaId), faturaGuncelle, geri));
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
    odeme.kurus === null ? 'Tutar belli değil' : `${odeme.tahmin ? '≈ ' : ''}${paraYaz(odeme.kurus)}`,
    `${durumYazisi(odeme, bugun)}${odeme.tahmin && bekliyorMu(odeme) ? ' · Geçen ayın tutarı' : ''}`,
    dugmeler.length ? dugmeler : null,
    odeme.durum === 'gecikti' ? 'ipucu gecikti' : 'ipucu',
  );
}

function odemeBaslat(kalem, donem, bugun, geri) {
  const onceki = veri;
  const erken = kalem.vade > donem.bitis;
  if (kalem.tur === 'sabit' && !erken) {
    kaydetVeUyar(faturaOde(veri, donem.baslangic, kalem, kalem.kurus, bugun));
    geri();
    return bandGoster(`${kalem.ad} ödendi`, onceki, geri);
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
        bandGoster(`${kalem.ad} ödendi`, onceki, geri);
      },
    },
    tutarAlani('tutar', erken ? `${ayYaz(kalem.ay)} ödemesi için ne kadar ödedin?` : 'Bu ay ne kadar ödedin?', kalem.kurus ? paraYaz(kalem.kurus) : ''),
    hata,
    el('button', { type: 'submit' }, 'Ödedim'),
  );
  goster(ustBolum(kalem.ad, geri), form);
}

function faturalarEkrani() {
  const bugun = bugunTR();
  const donem = donemBul(veri.ayar, bugun);
  if (!veri.donemler[donem.baslangic]) return anaEkran();

  const ileri = ileriKalemler(veri, donem, bugun);
  const kalemler = [...donemKalemleri(veri, donem, bugun), ...ileri.filter((k) => k.geriAlinabilir && k.vade > donem.bitis)];
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
            faturalar.map((f) => {
              const siradaki = ileri.find((k) => k.faturaId === f.id && bekliyorMu(k));
              return kalem(
                f.ad,
                f.kurus ? paraYaz(f.kurus) : 'Değişken',
                `${faturaAltYazisi(f, bugun)}${siradaki ? ` · Sıradaki: ${tarihYaz(siradaki.vade)}` : ''}`,
                [
                  siradaki ? el('button', { type: 'button', sinif: 'kucuk', onclick: () => odemeBaslat(siradaki, donem, bugun, faturalarEkrani) }, '✓ Ödedim') : null,
                  el('button', { type: 'button', sinif: 'ikincil kucuk', onclick: () => faturaFormu(f) }, 'Düzenle'),
                  zilDugmesi(f, faturaGuncelle, faturalarEkrani),
                ],
              );
            }),
            zilIpucu(),
          )
        : null,
    ),
  );
}

function faturaAltYazisi(fatura, bugun) {
  const temel = `Ayın ${fatura.gun}. günü · ${fatura.tur === 'sabit' ? 'Sabit' : 'Değişken'}`;
  if (fatura.cesit === 'abonelik') return `${temel} · Abonelik`;
  if (fatura.cesit === 'kira') {
    const ay = ayYaz(`2026-${String(fatura.yenileme).padStart(2, '0')}`).split(' ')[0];
    return `${temel} · Yenileme: ${ay}${fatura.oran && fatura.kurus ? ` · Yeni kira yaklaşık ${paraYaz(yeniKira(fatura.kurus, fatura.oran))}` : ''}`;
  }
  if (fatura.cesit !== 'kart') return temel;
  return `${temel} · Hesap kesim: ayın ${fatura.kesim}. günü · Bugünkü alışveriş ${tarihYaz(kartOdemeTarihi(fatura.kesim, fatura.gun, bugun))} tarihinde ödenir`;
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
  const cesit = el(
    'select',
    { id: 'cesit', onchange: () => cesitYaz() },
    el('option', { value: '' }, 'Normal fatura'),
    el('option', { value: 'kart', selected: mevcut?.cesit === 'kart' }, 'Kredi kartı'),
    el('option', { value: 'abonelik', selected: mevcut?.cesit === 'abonelik' }, 'Abonelik'),
    el('option', { value: 'kira', selected: mevcut?.cesit === 'kira' }, 'Kira'),
  );
  const kesim = gunSecici('kesim', mevcut?.kesim);
  const kesimAlani = el('div', { sinif: 'alan' }, el('label', { htmlFor: 'kesim' }, 'Hesap kesim günü'), kesim);
  const aySecici = el('select', { id: 'yenileme' }, [el('option', { value: '' }, 'Ay seç'), ...Array.from({ length: 12 }, (_, i) => el('option', { value: String(i + 1), selected: mevcut?.yenileme === i + 1 }, ayYaz(`2026-${String(i + 1).padStart(2, '0')}`).split(' ')[0]))]);
  const yenilemeAlani = el('div', { sinif: 'alan' }, el('label', { htmlFor: 'yenileme' }, 'Yenileme ayı'), aySecici);
  const oranKutusu = el('input', { id: 'oran', type: 'text', inputMode: 'decimal', autocomplete: 'off', placeholder: 'Örnek: 31,49', value: mevcut?.oran ? String(mevcut.oran / 100).replace('.', ',') : '' });
  const oranAlani = el('div', { sinif: 'alanlar' }, el('div', { sinif: 'alan' }, el('label', { htmlFor: 'oran' }, 'Tahmini artış oranı % (isteğe bağlı)'), oranKutusu));
  const cesitNotu = el('p', { sinif: 'ipucu' });
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

  function cesitYaz() {
    kesimAlani.hidden = cesit.value !== 'kart';
    yenilemeAlani.hidden = cesit.value !== 'kira';
    oranAlani.hidden = cesit.value !== 'kira';
    if (cesit.value === 'kart' && !mevcut) tur.value = 'degisken';
    etiketYaz();
    cesitNotu.textContent = { kart: 'Ekstre tutarını ödeme sırasında yazarsın, her ay değişebilir.', abonelik: 'Üç ayda bir “Hâlâ kullanıyor musun?” diye sorulur.', kira: 'Yenilemeden bir ay önce söylenir. Oran her ay değiştiği için güncel kira artış tavanını sen yaz.', '': '' }[cesit.value];
  }

  gun.addEventListener('change', gecikmeYaz);
  cesitYaz();

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
        if (cesit.value === 'kart' && !kesim.value) return hataGoster(hata, 'Hesap kesim gününü seç.');
        if (cesit.value === 'kira' && !aySecici.value) return hataGoster(hata, 'Yenileme ayını seç.');
        const oranMetni = cesit.value === 'kira' ? oranKutusu.value.trim().replace(',', '.') : '';
        const oran = oranMetni ? Math.round(Number(oranMetni) * 100) : undefined;
        if (oran !== undefined && !(oran > 0 && oran <= 100000)) return hataGoster(hata, 'Oranı sayı olarak yaz. Örnek: 31,49');

        const bilgiler = {
          ad,
          tur: tur.value,
          gun: Number(gun.value),
          kurus,
          cesit: cesit.value || undefined,
          kesim: cesit.value === 'kart' ? Number(kesim.value) : undefined,
          yenileme: cesit.value === 'kira' ? Number(aySecici.value) : undefined,
          oran,
        };
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
    el('div', { sinif: 'alanlar' }, el('div', { sinif: 'alan' }, el('label', { htmlFor: 'cesit' }, 'Türü'), cesit), kesimAlani, yenilemeAlani),
    oranAlani,
    cesitNotu,
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
        const onceki = veri;
        kaydetVeUyar(taksitOde(veri, donem.baslangic, kalem, kurus, bugunTR()));
        geri();
        bandGoster(`${kalem.ad} ödendi`, onceki, geri);
        if (kurus === kalan) tamamlandi();
      },
    },
    tutarAlani('tutar', kalem.vade > donem.bitis ? `${ayYaz(kalem.ay)} ödemesi için ne kadar ödedin?` : 'Bu ay ne kadar ödedin?', kalem.kurus ? paraYaz(kalem.kurus) : ''),
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
      el(
        'div',
        { sinif: 'baslik-sag' },
        taksit.sayi ? el('span', { sinif: 'rozet' }, `${Math.min(durum.odenenAdet, taksit.sayi)}/${taksit.sayi}`) : null,
        durum.kalan > 0 ? zilDugmesi(taksit, taksitGuncelle, taksitlerEkrani) : null,
      ),
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
      siradaki
        ? el('button', { type: 'button', sinif: 'kucuk', onclick: () => taksitOdeFormu(siradaki, donem, taksitlerEkrani) }, '✓ Ödedim')
        : null,
      el('button', { type: 'button', sinif: 'ikincil kucuk', onclick: () => taksitDetayi(taksit.id) }, 'Geçmiş ve düzenle'),
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
    { sinif: 'sutun', title: `${ayYaz(ay.ay.slice(0, 7))}: ${paraYaz(ay.kurus)}` },
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

/* Bu ayki hareketler */

function hareketSatiri(h, donem, yenile) {
  const icerik = [
    el('span', { sinif: 'hareket-ad' }, el('strong', {}, hareketYazisi(h)), el('span', { sinif: 'ipucu' }, [HAREKET_TURU[h.tur], h.not].filter(Boolean).join(' · '))),
    el('span', { sinif: `hareket-tutar${girenMi(h) ? ' giren' : ''}` }, `${girenMi(h) ? '+' : '−'} ${paraYaz(h.kurus)}`),
  ];
  if (donem && h.tur === 'harcama') return el('button', { type: 'button', sinif: 'hareket', onclick: () => harcamaFormu(donem, h, yenile) }, icerik);
  if (donem && h.tur === 'gelir') return el('button', { type: 'button', sinif: 'hareket', onclick: () => gelirFormu(donem, h, yenile) }, icerik);
  return el('div', { sinif: 'hareket' }, icerik);
}

// Tarih verilirse geçmiş dönem salt okunur gösterilir.
function hareketlerEkrani(tarih = null, grup = 'hepsi') {
  const donem = donemBul(veri.ayar, bugunTR());
  const baslangic = tarih ?? donem.baslangic;
  const kayit = veri.donemler[baslangic];
  if (!kayit) return anaEkran();

  const yenile = () => hareketlerEkrani(null, grup);
  const { giren, cikan } = hareketToplamlari(kayit);
  const gunler = gunlereAyir(hareketListesi(kayit, grup));
  goster(
    ustBolum('Hareketler', tarih ? gecmisEkrani : anaEkran),
    bilgiSatiri(),
    el(
      'section',
      { sinif: 'hero' },
      el('p', { sinif: 'etiket' }, tarih ? `${tarihYaz(tarih)} dönemi` : 'Bu dönem'),
      degerler(['Giren', paraYaz(giren)], ['Çıkan', paraYaz(cikan)]),
      el('p', { sinif: 'ipucu' }, `Dönem başı parası: ${paraYaz(kayit.para)} · Kalan: ${paraYaz(kalanPara(kayit))}`),
    ),
    el('div', { sinif: 'kategoriler' }, GRUPLAR.map(([kod, ad]) => el('button', {
      type: 'button',
      sinif: 'cip',
      'aria-pressed': String(kod === grup),
      onclick: () => hareketlerEkrani(tarih, kod),
    }, ad))),
    gunler.length
      ? gunler.map(([gun, liste]) => el(
          'section',
          { sinif: 'kart bosluk' },
          el('h2', {}, tarihYaz(gun)),
          liste.map((h) => hareketSatiri(h, tarih ? null : donem, yenile)),
        ))
      : el('p', { sinif: 'ipucu orta bosluk' }, 'Bu dönemde kayıt yok.'),
    tarih ? null : el('p', { sinif: 'ipucu orta bosluk' }, 'Harcama ve gelire dokunup düzeltebilirsin. Diğerleri kendi ekranından düzeltilir.'),
  );
}

/* Takvim */

const HAREKET_TURU = { harcama: 'Harcama', gelir: 'Gelir', fatura: 'Fatura ödendi', taksit: 'Taksit ödendi', birikim: 'Birikime gitti', satis: 'Birikim satışı', defter: 'Para verildi', tahsil: 'Para alındı' };

function hareketYazisi(h) {
  if (h.tur === 'harcama') return h.kategori ?? DIGER;
  if (h.tur === 'gelir') return h.kaynak ?? EK_GELIR;
  return h.ad;
}

function takvimEkrani(ay = bugunTR().slice(0, 7), secili = bugunTR()) {
  const bugun = bugunTR();
  const gunler = takvimAyi(veri, ay, bugun);
  const gun = gunler.find((g) => g.tarih === secili) ?? gunler[0];
  const ayAc = (yeni) => takvimEkrani(yeni, `${yeni}-01`);
  sayfa(
    'odeme',
    ustBolum('Ödemeler'),
    odemeSekmeleri('Takvim'),
    el(
      'div',
      { sinif: 'panel' },
      el(
        'section',
        { sinif: 'kart' },
        el(
          'div',
          { sinif: 'takvim-ust' },
          el('button', { type: 'button', sinif: 'ikincil kucuk', 'aria-label': 'Önceki ay', onclick: () => ayAc(ayGeri(ay)) }, '‹'),
          el('h2', {}, ayYaz(ay)),
          el('button', { type: 'button', sinif: 'ikincil kucuk', 'aria-label': 'Sonraki ay', onclick: () => ayAc(ayIleri(ay)) }, '›'),
        ),
        el(
          'div',
          { sinif: 'takvim' },
          ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((ad) => el('span', { sinif: 'takvim-baslik' }, ad)),
          Array.from({ length: ilkSutun(ay) }, () => el('span')),
          gunler.map((g) => el(
            'button',
            {
              type: 'button',
              sinif: `takvim-gun${g.tarih === bugun ? ' bugun' : ''}`,
              'aria-pressed': String(g.tarih === gun.tarih),
              'aria-label': tarihYaz(g.tarih),
              'data-tarih': g.tarih,
              onclick: () => takvimEkrani(ay, g.tarih),
            },
            String(g.gun),
            el(
              'span',
              { sinif: 'isaretler' },
              g.maas ? el('i', { sinif: 'maas' }) : null,
              g.odemeler.length ? el('i', { sinif: 'odeme' }) : null,
              g.hareketler.length ? el('i') : null,
            ),
          )),
        ),
        el(
          'div',
          { sinif: 'takvim-not' },
          [['maas', 'Maaş'], ['odeme', 'Ödeme'], ['', 'İşlem']].map(([sinif, ad]) => el('span', {}, el('span', { sinif: 'isaretler' }, el('i', { sinif: sinif })), ad)),
        ),
      ),
      el(
        'section',
        { sinif: 'kart' },
        el('h2', {}, tarihYaz(gun.tarih)),
        gun.maas ? el('p', { sinif: 'ipucu' }, 'Maaş günü, yeni dönem başlıyor.') : null,
        gun.odemeler.map((k) => kalem(k.ad, k.kurus === null ? 'Tutar belli değil' : paraYaz(k.kurus), k.durum === 'gecikti' ? 'Gecikti' : 'Ödenecek', null, k.durum === 'gecikti' ? 'ipucu gecikti' : 'ipucu')),
        gun.hareketler.map((h) => kalem(hareketYazisi(h), paraYaz(h.kurus), HAREKET_TURU[h.tur])),
        gun.maas || gun.odemeler.length || gun.hareketler.length ? null : el('p', { sinif: 'ipucu' }, 'Bu gün kayıt yok.'),
      ),
    ),
  );
}

/* Harcamalar */

function cipSecici(adlar, ilk, yeniId, yeniAd, secilince = null) {
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
      if (secili) secilince?.();
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
    sec: (ad) => {
      secili = ad;
      cipleriYaz();
    },
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
  const secici = cipSecici(adlar, ilkSecim, 'yeni-kategori', 'kategori', () => {
    // Yeni harcamada tutar yazılıysa kategoriye dokunmak kaydı bitirir; ayrıntı açıksa Kaydet beklenir.
    if (!mevcut && !ortakBaslangic && !secenekler.open && paraCoz(tutarKutusu.value)) kaydet_();
  });

  const notKutusu = el('input', { id: 'not', name: 'not', maxLength: 80, value: mevcut?.not ?? '', autocomplete: 'off' });
  const notOrnegi = () => {
    notKutusu.placeholder = ortakKutusu.checked ? 'Örnek: Çamaşır suyu' : 'Örnek: 2 kilo elma';
  };
  const surprizKutusu = el('input', { id: 'surpriz', type: 'checkbox', checked: mevcut?.surpriz ?? false });
  const sesDurumu = el('p', { sinif: 'ipucu', role: 'status' }, sesDestegi() ? 'Mikrofona dokunup “market 250 lira” diyebilirsin.' : 'Yazmak istemezsen klavyedeki mikrofonla söyleyebilirsin.');
  const ortakKutusu = el('input', { id: 'ortak', type: 'checkbox', checked: mevcut?.ortak ?? ortakBaslangic, onchange: notOrnegi });
  notOrnegi();

  function kaydet_() {
    const kurus = paraCoz(form.elements.tutar.value);
    if (!kurus) return hataGoster(hata, 'Sıfırdan büyük bir tutar yaz. Örnek: 100 ya da 1.250,50');
    const tarih = form.elements.tarih.value;
    if (!tarih || tarih < donem.baslangic || tarih > bugun) {
      return hataGoster(hata, `Tarih ${tarihYaz(donem.baslangic)} ile bugün arasında olmalı.`);
    }

    const onceki = veri;
    let yeni = veri;
    let kategori = secici.secili() ?? undefined;
    const yazilan = secici.yazilan();
    if (yazilan) ({ veri: yeni, ad: kategori } = kategoriEkle(veri, yazilan));
    const bilgi = { kurus, kategori, not: notKutusu.value.trim() || undefined, tarih, ortak: ortakKutusu.checked || undefined, surpriz: surprizKutusu.checked || undefined };
    kaydetVeUyar(mevcut ? harcamaGuncelle(yeni, donem.baslangic, mevcut.sira, bilgi) : harcamaEkle(yeni, donem.baslangic, bilgi));
    geri();
    if (!mevcut) bandGoster(`${paraYaz(kurus)} kaydedildi`, onceki, geri);
  }

  const secenekler = el(
    'details',
    { sinif: 'secenekler', open: Boolean(mevcut) || ortakBaslangic },
    el('summary', {}, 'Diğer seçenekler (not, tarih)'),
    ikiAlan(
      [el('label', { htmlFor: 'not' }, 'Not (isteğe bağlı)'), notKutusu],
      [el('label', { htmlFor: 'tarih' }, 'Tarih'), el('input', { id: 'tarih', name: 'tarih', type: 'date', min: donem.baslangic, max: bugun, value: mevcut?.tarih ?? bugun })],
    ),
    el('label', { sinif: 'secim', htmlFor: 'ortak' }, ortakKutusu, el('span', {}, 'Ortak ev için aldım')),
    el('label', { sinif: 'secim', htmlFor: 'surpriz' }, surprizKutusu, el('span', {}, 'Beklenmedik bir harcamaydı (sürpriz)')),
    el('p', { sinif: 'ipucu' }, 'Sadece bu dönemin günleri seçilebilir.'),
  );

  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        kaydet_();
      },
    },
    tutarEtiketi,
    el(
      'div',
      { sinif: 'tutar-satir' },
      tutarKutusu,
      el('button', { type: 'button', sinif: 'simge', 'aria-label': 'Hesap makinesi', onclick: () => hesapAc(tutarKutusu) }, ikon('hesap')),
      sesDugmesi(adlar, tutarKutusu, secici, notKutusu, sesDurumu),
    ),
    sesDurumu,
    el('p', { sinif: 'etiket' }, 'Kategori'),
    secici.kutu,
    secici.yeniKutu,
    el('p', { sinif: 'ipucu' }, `Tutarı yazıp kategoriye dokununca kaydedilir. Kategori seçmezsen “${DIGER}” sayılır.`),
    secenekler,
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
  if (!mevcut && !ilkTutar) tutarKutusu.focus();
}

function sesDestegi() {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function sesDugmesi(adlar, tutarKutusu, secici, notKutusu, durum) {
  const Tanima = sesDestegi();
  if (!Tanima) return null;
  return el('button', {
    type: 'button',
    sinif: 'simge',
    'aria-label': 'Sesle yaz',
    onclick: () => {
      const tanima = new Tanima();
      tanima.lang = 'tr-TR';
      tanima.interimResults = false;
      tanima.maxAlternatives = 1;
      tanima.onresult = (olay) => {
        const metin = olay.results[0][0].transcript;
        const { kurus, kategori, not } = konusmaCoz(metin, adlar);
        if (kurus) tutarKutusu.value = paraYaz(kurus);
        if (kategori) secici.sec(kategori);
        if (not) notKutusu.value = not;
        durum.textContent = kurus ? `Duyduğum: “${metin}”. Kontrol edip Kaydet'e bas.` : `Tutarı anlayamadım: “${metin}”. Yeniden dene ya da elle yaz.`;
      };
      tanima.onerror = () => {
        durum.textContent = 'Ses alınamadı. Mikrofon iznini kontrol et ya da elle yaz.';
      };
      durum.textContent = 'Dinliyorum…';
      tanima.start();
    },
  }, ikon('mikrofon'));
}

function kategoriCubugu(kurus, toplam) {
  const dolgu = el('span');
  dolgu.style.width = `${Math.round((kurus / toplam) * 100)}%`;
  return el('div', { sinif: 'cubuk' }, dolgu);
}

function surprizToplami(kayit) {
  return (kayit.hareketler ?? []).filter((h) => h.tur === 'harcama' && h.surpriz).reduce((t, h) => t + h.kurus, 0);
}

// Hedef aşılınca da yargılamaz; sadece durumu söyler.
function hedefSatirlari(toplam, baslangic) {
  const onceki = oncekiDonem(baslangic);
  const fark = onceki ? toplam - hareketToplami(onceki, 'harcama') : null;
  return [
    veri.hedef
      ? [
          el('p', { sinif: 'ipucu bosluk' }, toplam <= veri.hedef ? `Hedefin ${paraYaz(veri.hedef)}. ${paraYaz(veri.hedef - toplam)} duruyor.` : `Hedefin ${paraYaz(veri.hedef)}. ${paraYaz(toplam - veri.hedef)} üstünde.`),
          kategoriCubugu(Math.min(toplam, veri.hedef), veri.hedef),
        ]
      : null,
    fark === null || fark === 0 ? null : el('p', { sinif: 'ipucu' }, `Geçen döneme göre ${paraYaz(Math.abs(fark))} ${fark < 0 ? 'az' : 'fazla'}.`),
  ];
}

function tutarAyarEkrani(baslik, etiket, aciklama, mevcut, kaydetFn, geri) {
  const hata = hataSatiri();
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const yazilan = form.elements.tutar.value.trim();
        const kurus = yazilan ? paraCoz(yazilan) : undefined;
        if (kurus === null || kurus === 0) return hataGoster(hata, 'Sıfırdan büyük bir tutar yaz. Örnek: 5.000');
        kaydetFn(kurus);
        geri();
      },
    },
    tutarAlani('tutar', etiket, mevcut ? paraYaz(mevcut) : ''),
    el('p', { sinif: 'ipucu' }, aciklama),
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
  );
  goster(ustBolum(baslik, geri), form);
}

function hedefEkrani() {
  tutarAyarEkrani(
    'Aylık hedef',
    'Bir dönemde en çok ne kadar harcamak istersin?',
    'İsteğe bağlı tek sayı. Kaldırmak için kutuyu boş bırak. Faturalar dahil değil.',
    veri.hedef,
    (kurus) => kaydetVeUyar({ ...veri, hedef: kurus }),
    () => harcamalarEkrani(),
  );
}

function koseEkrani() {
  tutarAyarEkrani(
    'Köşedeki para',
    'Beklenmedik giderler için ne kadar ayıralım?',
    'Bu tutar serbest paradan ayrı durur, ana ekranda ayrı satırda görünür. Kaldırmak için kutuyu boş bırak.',
    veri.kose,
    (kurus) => kaydetVeUyar({ ...veri, kose: kurus }),
    ayarlarEkrani,
  );
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
          tarih ? null : hedefSatirlari(toplam, baslangic),
          surprizToplami(kayit) ? el('p', { sinif: 'ipucu' }, `Sürpriz harcamalar: ${paraYaz(surprizToplami(kayit))}`) : null,
        ),
        tarih ? null : el('div', { sinif: 'ikili' },
          el('button', { type: 'button', onclick: () => harcamaFormu(donem, null, yenile) }, '+ Harcama'),
          el('button', { type: 'button', sinif: 'ikincil', onclick: hedefEkrani }, veri.hedef ? 'Hedefi değiştir' : 'Aylık hedef koy')),
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
              [h.surpriz ? 'Sürpriz' : null, h.ortak ? 'Ortak ev' : null, h.not, tarihYaz(h.tarih)].filter(Boolean).join(' · '),
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
        const onceki = veri;
        kaydetVeUyar(mevcut ? harcamaGuncelle(yeni, donem.baslangic, mevcut.sira, bilgi) : gelirEkle(yeni, donem.baslangic, bilgi));
        geri();
        if (!mevcut) bandGoster(`${paraYaz(kurus)} eklendi`, onceki, geri);
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
        surprizToplami(kayit) ? ['Sürpriz harcamalar', paraYaz(surprizToplami(kayit))] : null,
      ),
      (kayit.hareketler ?? []).filter((h) => h.tur === 'fatura' || h.tur === 'taksit').map((h) => el('p', { sinif: 'ipucu' }, `✓ ${h.ad}: ${paraYaz(h.kurus)}`)),
      el(
        'div',
        { sinif: 'kalem-dugme' },
        kayit.hareketler?.length
          ? el('button', { type: 'button', sinif: 'ikincil kucuk', onclick: () => hareketlerEkrani(tarih) }, 'Hareketleri gör')
          : null,
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
  const sutunlar = Object.keys(veri.donemler).sort().slice(-6).map((tarih) => ({
    ay: tarih,
    kurus: ['harcama', 'fatura', 'taksit'].reduce((t, tur) => t + hareketToplami(veri.donemler[tarih], tur), 0),
  }));
  const enBuyuk = Math.max(...sutunlar.map((s) => s.kurus));
  goster(
    ustBolum('Geçmiş dönemler', anaEkran),
    sutunlar.length > 1
      ? el(
          'section',
          { sinif: 'kart' },
          el('h2', {}, 'Dönem dönem giden para'),
          el('div', { sinif: 'sutunlar', style: `grid-template-columns: repeat(${sutunlar.length}, minmax(0, 1fr))` }, sutunlar.map((s) => aySutunu(s, enBuyuk))),
          el('p', { sinif: 'ipucu bosluk' }, 'Harcama, fatura ve taksit toplamı. Son sütun bu dönem.'),
        )
      : null,
    ...icerik,
  );
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
    el('p', { sinif: 'ipucu' }, `Uygulamaya göre toplam paran: ${paraYaz(kalanPara(kayit))}. Elinde ve bankada gerçekte ne kadar para olduğunu yaz.`),
    tutarAlani('para', 'Gerçek toplam param', paraYaz(Math.max(kalanPara(kayit), 0))),
    el('label', { sinif: 'secim', htmlFor: 'kayitsiz' }, kayitsiz, el('span', {}, `Para azaldıysa farkı “${KAYITSIZ}” harcama olarak yaz`)),
    el('p', { sinif: 'ipucu' }, 'Yanlış tutar girdiysen bu kutuyu boş bırak.'),
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
  );
  goster(ustBolum('Toplam parayı düzelt', anaEkran), form);
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
        sesCal('kazanc');
        titret();
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
  const zaman = fiyatZamani();
  const metin = { guncel: `Güncel · ${zaman}`, kapali: `Piyasa kapalı · Son fiyat ${zaman}`, eski: `Son fiyat · ${zaman}` }[durum];
  return el('p', { sinif: `durum${durum === 'guncel' ? ' guncel' : ''}` }, metin);
}

function fiyatZamani() {
  if (!piyasaKaydi.degisti) return piyasaKaydi.tarih === bugunTR() ? piyasaKaydi.saat : `${tarihYaz(piyasaKaydi.tarih)} ${piyasaKaydi.saat}`;
  const saat = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' }).format(piyasaKaydi.degisti);
  const gun = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(piyasaKaydi.degisti);
  return gun === bugunTR() ? saat : `${tarihYaz(gun)} ${saat}`;
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
    ceviriciKarti(),
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
  return kalanPara(kayit) - ayrilanTutar([...donemKalemleri(veri, donem, bugun), ...donemTaksitleri(veri, donem, bugun)]) - kenardaPara(veri);
}

const cevirici = { miktar: '', kaynak: 'USD', hedef: 'TL' };
let ceviriciYaz = null;

function birimSecici(id, deger, degisince) {
  return el('select', { id, 'aria-label': id === 'cevirici-kaynak' ? 'Elimdeki birim' : 'Almak istediğim birim', onchange: (o) => degisince(o.target.value) }, BIRIMLER.map((b) => el('option', { value: b.kod, selected: b.kod === deger }, b.ad)));
}

function miktarYazisi(sayi, birim) {
  return `${fiyatYaz(sayi, birim.ondalik)} ${birim.yazi}`;
}

function fiyatSatiri(kod) {
  const fiyat = kod === 'TL' ? null : fiyatBul(kod);
  if (!fiyat) return null;
  const ondalik = dovizMi(kod) ? 4 : 2;
  return `${birimBul(kod).ad}: alış ${fiyatYaz(fiyat.alis, ondalik)} · satış ${fiyatYaz(fiyat.satis, ondalik)}`;
}

function sonucSatirlari(miktar) {
  const kaynak = birimBul(cevirici.kaynak);
  const hedef = birimBul(cevirici.hedef);
  const gelen = cevir(miktar, kaynak.kod, hedef.kod, fiyatBul);
  const giden = gerekli(miktar, kaynak.kod, hedef.kod, fiyatBul);
  if (gelen === null) return [el('p', { sinif: 'ipucu' }, 'Fiyat yok, internete bağlanınca hesaplanır.')];
  const yazi = miktarYazisi(miktar, kaynak);
  const bozdurma = kaynak.kod === 'TL' ? `${yazi} ile alırsın` : `${yazi} bozdurursan`;
  const ters = kaynak.kod === 'TL' ? `${yazi} elde etmek için bozduracağın` : `${yazi} almak için gereken`;
  return [
    el('p', { sinif: 'etiket' }, bozdurma),
    el('p', { sinif: 'cevirici-sonuc', id: 'cevirici-sonuc' }, miktarYazisi(gelen, hedef)),
    hedef.adetli ? el('p', { sinif: 'ipucu' }, `Tam adet olarak: ${Math.floor(gelen)}`) : null,
    el('p', { sinif: 'ipucu' }, `${ters}: ${miktarYazisi(giden, hedef)}`),
    [cevirici.kaynak, cevirici.hedef].map(fiyatSatiri).filter(Boolean).map((m) => el('p', { sinif: 'ipucu' }, m)),
  ];
}

function hepsiListesi(miktar) {
  if (cevirici.kaynak !== 'TL') return null;
  return el(
    'div',
    { sinif: 'izgara bosluk' },
    BIRIMLER.filter((b) => b.kod !== 'TL').map((b) => {
      const sonuc = cevir(miktar, 'TL', b.kod, fiyatBul);
      return el(
        'div',
        { sinif: 'mini' },
        el('p', { sinif: 'etiket' }, b.ad),
        el('p', { sinif: 'kutu-buyuk' }, sonuc === null ? 'Fiyat yok' : b.adetli ? `${Math.floor(sonuc)} adet` : miktarYazisi(sonuc, b)),
      );
    }),
  );
}

function ceviriciKarti() {
  const bugun = bugunTR();
  const donem = donemBul(veri.ayar, bugun);
  const kayit = veri.donemler[donem.baslangic];
  const serbest = kayit ? serbestPara(donem, kayit, bugun) : 0;
  const hata = hataSatiri();
  const sonuc = el('div', { id: 'cevirici-alani' });
  const kutu = el('input', {
    id: 'cevirici-miktar',
    sinif: 'tutar-kutu',
    type: 'text',
    inputMode: 'decimal',
    autocomplete: 'off',
    placeholder: 'Tutar',
    'aria-label': 'Elimdeki tutar',
    value: cevirici.miktar,
    oninput: (o) => {
      cevirici.miktar = o.target.value;
      hesapla();
    },
  });

  function hesapla() {
    const kurus = paraCoz(cevirici.miktar);
    hata.hidden = true;
    if (cevirici.miktar.trim() && !kurus) hataGoster(hata, 'Tutarı örnekteki gibi yaz: 25.000 ya da 1.250,50');
    sonuc.replaceChildren(...(kurus ? [sonucSatirlari(kurus / 100), hepsiListesi(kurus / 100)] : []).flat(Infinity).filter(Boolean));
  }

  ceviriciYaz = hesapla;
  const yeniden = (degisen) => {
    Object.assign(cevirici, degisen);
    piyasaEkrani();
  };
  const hizli = (tutar) => yeniden({ miktar: tutar });
  hesapla();
  return el(
    'section',
    { sinif: 'kart cevirici' },
    el('h2', {}, 'Çevirici'),
    el('label', { htmlFor: 'cevirici-miktar' }, 'Elimdeki'),
    el('div', { sinif: 'cevirici-satir' }, kutu, birimSecici('cevirici-kaynak', cevirici.kaynak, (kod) => yeniden({ kaynak: kod }))),
    el('button', {
      type: 'button',
      sinif: 'simge cevirici-yon',
      'aria-label': 'Yönü değiştir',
      onclick: () => yeniden({ kaynak: cevirici.hedef, hedef: cevirici.kaynak }),
    }, '⇅'),
    el('label', { htmlFor: 'cevirici-hedef' }, 'Almak istediğim'),
    birimSecici('cevirici-hedef', cevirici.hedef, (kod) => yeniden({ hedef: kod })),
    el(
      'div',
      { sinif: 'kategoriler bosluk' },
      ['100', '1.000', '10.000'].map((t) => el('button', { type: 'button', sinif: 'cip', onclick: () => hizli(t) }, t)),
      serbest > 0
        ? el('button', { type: 'button', sinif: 'cip', onclick: () => yeniden({ miktar: paraYaz(serbest), kaynak: 'TL', hedef: cevirici.hedef === 'TL' ? 'USD' : cevirici.hedef }) }, 'Serbest param')
        : null,
    ),
    hata,
    el('div', { sinif: 'bosluk' }, sonuc),
    el('p', { sinif: 'ipucu bosluk' }, 'Yaklaşık hesaptır, ekran fiyatı kullanılır. Banka, döviz bürosu ve kuyumcuda alış-satış farkı daha büyüktür. İşlemden önce o yerin fiyatını sor.'),
    birimBul(cevirici.kaynak).kod.endsWith('ALTIN') || birimBul(cevirici.hedef).kod.endsWith('ALTIN') || [cevirici.kaynak, cevirici.hedef].includes('GRA')
      ? el('p', { sinif: 'ipucu' }, 'Altın fiyatı işçiliği tam yansıtmaz.')
      : null,
  );
}

function canliTazele() {
  if (!canliEkran) return;
  // Çeviriciye yazarken ekran yenilenmesin, yalnız sonuç güncellensin.
  if (document.activeElement?.id === 'cevirici-miktar') return ceviriciYaz?.();
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
  if (fiyatlar) {
    const simdi = Date.now();
    piyasaKaydi = { ...fiyatlar, alindi: simdi, degisti: fiyatDegistiMi(piyasaKaydi, fiyatlar) ? simdi : piyasaKaydi.degisti ?? simdi };
  }
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

/* Alacak-verecek */

function defterKimligi(on) {
  return `${on}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function defterSatiri(k) {
  const { kalan, odenen } = defterDurumu(k);
  return kalem(
    k.kisi,
    paraYaz(kalan),
    [k.yon === 'borc' ? 'Borcum' : 'Alacağım', odenen ? `Toplam ${paraYaz(k.kurus)}` : null, k.not].filter(Boolean).join(' · '),
    el('button', { type: 'button', sinif: 'ikincil kucuk', onclick: () => defterDetayi(k.id) }, 'Aç'),
  );
}

function defterEkrani() {
  const defter = veri.defter ?? [];
  const ozet = defterOzet(veri);
  const acik = defter.filter((k) => defterDurumu(k).kalan > 0);
  const kapanan = defter.filter((k) => defterDurumu(k).kalan === 0);
  goster(
    ustBolum('Alacak-verecek', anaEkran),
    bilgiSatiri(),
    el(
      'section',
      { sinif: 'hero' },
      el('p', { sinif: 'etiket' }, 'Durum'),
      degerler(['Borcum', paraYaz(ozet.borc)], ['Alacağım', paraYaz(ozet.alacak)]),
      el('p', { sinif: 'ipucu' }, 'Bu liste sadece sende görünür.'),
    ),
    el(
      'div',
      { sinif: 'ikili' },
      el('button', { type: 'button', onclick: () => defterFormu('borc') }, '+ Borcum var'),
      el('button', { type: 'button', sinif: 'ikincil', onclick: () => defterFormu('alacak') }, '+ Alacağım var'),
    ),
    el(
      'section',
      { sinif: 'kart' },
      el('h2', {}, 'Açık kayıtlar'),
      acik.length ? acik.map(defterSatiri) : el('p', { sinif: 'ipucu' }, 'Açık kayıt yok.'),
    ),
    kapanan.length ? el('section', { sinif: 'kart' }, el('h2', {}, 'Kapananlar'), kapanan.map(defterSatiri)) : null,
  );
}

function defterFormu(yon) {
  const bugun = bugunTR();
  const donem = donemBul(veri.ayar, bugun);
  const borc = yon === 'borc';
  const hata = hataSatiri();
  const paraKutusu = el('input', { id: 'para-degisti', type: 'checkbox' });
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const kisi = form.elements.kisi.value.trim();
        if (!kisi) return hataGoster(hata, 'Kişinin adını yaz.');
        const kurus = paraCoz(form.elements.tutar.value);
        if (!kurus) return hataGoster(hata, 'Sıfırdan büyük bir tutar yaz. Örnek: 10.000');
        const kayit = { id: defterKimligi('d'), kisi, yon, kurus, tarih: bugun, not: form.elements.not.value.trim() || undefined };
        kaydetVeUyar(defterEkle(veri, kayit, paraKutusu.checked && veri.donemler[donem.baslangic] ? donem.baslangic : null));
        defterEkrani();
      },
    },
    el('label', { htmlFor: 'kisi' }, borc ? 'Kime borcun var?' : 'Kimden alacağın var?'),
    el('input', { id: 'kisi', name: 'kisi', maxLength: 40, placeholder: 'Örnek: Abim', autocomplete: 'off' }),
    tutarAlani('tutar', 'Tutar'),
    el('label', { htmlFor: 'not' }, 'Not (isteğe bağlı)'),
    el('input', { id: 'not', name: 'not', maxLength: 80, autocomplete: 'off' }),
    el('label', { sinif: 'secim', htmlFor: 'para-degisti' }, paraKutusu, el('span', {}, borc ? 'Parayı şimdi aldım, parama ekle' : 'Parayı şimdi verdim, paramdan düş')),
    el('p', { sinif: 'ipucu' }, 'Eski bir borçsa bu kutuyu boş bırak, sadece listeye yazılır.'),
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
  );
  goster(ustBolum(borc ? 'Borç ekle' : 'Alacak ekle', defterEkrani), form);
}

function defterDetayi(id) {
  const kayit = veri.defter.find((k) => k.id === id);
  const { kalan, odenen } = defterDurumu(kayit);
  const borc = kayit.yon === 'borc';
  goster(
    ustBolum(kayit.kisi, defterEkrani),
    bilgiSatiri(),
    el(
      'section',
      { sinif: 'hero' },
      el('p', { sinif: 'etiket' }, borc ? 'Kalan borcum' : 'Kalan alacağım'),
      el('p', { sinif: 'tutar' }, paraYaz(kalan)),
      degerler(['Toplam', paraYaz(kayit.kurus)], [borc ? 'Ödediğim' : 'Aldığım', paraYaz(odenen)]),
      kategoriCubugu(odenen, kayit.kurus),
    ),
    kalan ? el('button', { type: 'button', onclick: () => defterOdemeFormu(id) }, borc ? 'Ödeme yaptım' : 'Para aldım') : null,
    el(
      'section',
      { sinif: 'kart bosluk' },
      el('h2', {}, 'Ödemeler'),
      kayit.odemeler?.length
        ? [...kayit.odemeler].reverse().map((o) => kalem(tarihYaz(o.tarih), paraYaz(o.kurus), null, el('button', {
            type: 'button',
            sinif: 'tehlike kucuk',
            onclick: () => {
              if (!window.confirm('Bu ödeme silinsin mi? Paraya işlendiyse o işlem de geri alınır.')) return;
              kaydetVeUyar(defterOdemeSil(veri, id, o.id));
              defterDetayi(id);
            },
          }, 'Sil')))
        : el('p', { sinif: 'ipucu' }, 'Henüz ödeme yok.'),
    ),
    kayit.not ? el('p', { sinif: 'ipucu' }, kayit.not) : null,
    el('button', {
      type: 'button',
      sinif: 'tehlike',
      onclick: () => {
        if (!window.confirm('Kayıt silinsin mi? Paraya işlenen tutarlar da geri alınır.')) return;
        kaydetVeUyar(defterSil(veri, id));
        defterEkrani();
      },
    }, 'Kaydı sil'),
  );
}

function defterOdemeFormu(id) {
  const bugun = bugunTR();
  const donem = donemBul(veri.ayar, bugun);
  const kayit = veri.defter.find((k) => k.id === id);
  const { kalan } = defterDurumu(kayit);
  const borc = kayit.yon === 'borc';
  const hata = hataSatiri();
  const paraKutusu = el('input', { id: 'para-degisti', type: 'checkbox', checked: true });
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const kurus = paraCoz(form.elements.tutar.value);
        if (!kurus) return hataGoster(hata, 'Sıfırdan büyük bir tutar yaz. Örnek: 1.000');
        if (kurus > kalan) return hataGoster(hata, `Kalan ${paraYaz(kalan)}. Daha fazlası yazılamaz.`);
        const donemVar = paraKutusu.checked && veri.donemler[donem.baslangic];
        kaydetVeUyar(defterOde(veri, id, { id: defterKimligi('o'), kurus, tarih: bugun }, donemVar ? donem.baslangic : null));
        if (kurus === kalan) tamamlandi();
        defterDetayi(id);
      },
    },
    tutarAlani('tutar', borc ? 'Ne kadar ödedin?' : 'Ne kadar aldın?', paraYaz(kalan)),
    el('p', { sinif: 'ipucu' }, `Kalan: ${paraYaz(kalan)}`),
    el('label', { sinif: 'secim', htmlFor: 'para-degisti' }, paraKutusu, el('span', {}, borc ? 'Paramdan düş' : 'Parama ekle')),
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
  );
  goster(ustBolum(kayit.kisi, () => defterDetayi(id)), form);
}

/* Büyük masraf planı */

function planKarti(plan, bugun) {
  const { kalan, kalanAy, aylik } = planDurumu(plan, bugun);
  return el(
    'section',
    { sinif: 'kart' },
    el('div', { sinif: 'bolum-baslik' }, el('h2', {}, plan.ad), el('span', { sinif: 'rozet' }, ayYaz(plan.ay))),
    degerler(['Ayrılan', paraYaz(plan.ayrilan)], ['Kalan', paraYaz(kalan)]),
    kategoriCubugu(Math.min(plan.ayrilan, plan.hedef), plan.hedef),
    el('p', { sinif: 'ipucu' }, kalan ? `${kalanAy} ay kaldı, ayda ${paraYaz(aylik)} ayırman yeterli.` : '✓ Tutar tamam.'),
    el(
      'div',
      { sinif: 'kalem-dugme' },
      kalan ? el('button', { type: 'button', sinif: 'kucuk', onclick: () => planAyirFormu(plan.id) }, 'Para ayır') : null,
      el('button', {
        type: 'button',
        sinif: 'ikincil kucuk',
        onclick: () => {
          if (!window.confirm('Plan kapatılsın mı? Ayrılan para serbest paraya döner. Masrafı yaptıysan harcama olarak yazmayı unutma.')) return;
          kaydetVeUyar(planKapat(veri, plan.id));
          planlarEkrani();
        },
      }, 'Planı kapat'),
    ),
  );
}

function planlarEkrani() {
  const bugun = bugunTR();
  const planlar = veri.planlar ?? [];
  goster(
    ustBolum('Masraf planı', anaEkran),
    bilgiSatiri(),
    el(
      'section',
      { sinif: 'hero' },
      el('p', { sinif: 'etiket' }, 'Masraflar için ayrılan'),
      el('p', { sinif: 'tutar' }, paraYaz(planlar.reduce((t, p) => t + p.ayrilan, 0))),
      el('p', { sinif: 'ipucu' }, 'Bu para serbest paradan ayrı durur, dönem değişse de korunur.'),
    ),
    el('button', { type: 'button', onclick: planFormu }, '+ Masraf ekle'),
    planlar.length
      ? el('div', { sinif: 'kartlar bosluk' }, planlar.map((p) => planKarti(p, bugun)))
      : el('p', { sinif: 'ipucu orta bosluk' }, 'Örneğin okul masrafı için “Eylül: 30.000 TL” yazabilirsin. Her ay ne kadar ayıracağını gösterir.'),
  );
}

function planFormu() {
  const bugun = bugunTR();
  const hata = hataSatiri();
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const ad = form.elements.ad.value.trim();
        if (!ad) return hataGoster(hata, 'Masrafa bir ad yaz.');
        const hedef = paraCoz(form.elements.tutar.value);
        if (!hedef) return hataGoster(hata, 'Sıfırdan büyük bir tutar yaz. Örnek: 30.000');
        const ay = form.elements.ay.value;
        if (!/^\d{4}-\d{2}$/.test(ay) || ay < bugun.slice(0, 7)) return hataGoster(hata, 'Bu ay ya da ileri bir ay seç.');
        kaydetVeUyar(planEkle(veri, { id: defterKimligi('p'), ad, hedef, ay }));
        planlarEkrani();
      },
    },
    el('label', { htmlFor: 'ad' }, 'Masraf adı'),
    el('input', { id: 'ad', name: 'ad', maxLength: 40, placeholder: 'Örnek: Okul masrafı', autocomplete: 'off' }),
    tutarAlani('tutar', 'Tahmini tutar'),
    el('label', { htmlFor: 'ay' }, 'Hangi ayda lazım?'),
    el('input', { id: 'ay', name: 'ay', type: 'month', min: bugun.slice(0, 7), value: bugun.slice(0, 7) }),
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
  );
  goster(ustBolum('Masraf ekle', planlarEkrani), form);
}

function planAyirFormu(id) {
  const plan = veri.planlar.find((p) => p.id === id);
  const { kalan, aylik } = planDurumu(plan, bugunTR());
  const hata = hataSatiri();
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const kurus = paraCoz(form.elements.tutar.value);
        if (!kurus) return hataGoster(hata, 'Sıfırdan büyük bir tutar yaz. Örnek: 1.000');
        if (kurus > kalan) return hataGoster(hata, `Kalan ${paraYaz(kalan)}. Daha fazlası ayrılamaz.`);
        kaydetVeUyar(planAyir(veri, id, kurus));
        if (kurus === kalan) tamamlandi();
        planlarEkrani();
      },
    },
    tutarAlani('tutar', 'Ne kadar ayıralım?', paraYaz(aylik)),
    el('p', { sinif: 'ipucu' }, 'Bu tutar serbest paradan ayrılır ama harcama sayılmaz.'),
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
  );
  goster(ustBolum(plan.ad, planlarEkrani), form);
}

/* Hatırlatmalar */

function hatirlatmaKartlari(donem, kayit, bugun) {
  const gelen = gelenler(bildirimPlani(veri, donem, kayit, bugun), Date.now(), gosterilenYukle());
  return gelen.slice(0, 1).map((k) => el(
    'section',
    { sinif: 'hatirlatma', role: 'status' },
    el(
      'div',
      {},
      el('p', {}, el('strong', {}, k.baslik)),
      el('p', { sinif: 'ipucu' }, k.metin),
      gelen.length > 1 ? el('p', { sinif: 'ipucu' }, `${gelen.length - 1} hatırlatma daha var.`) : null,
    ),
    el('button', {
      type: 'button',
      sinif: 'ikincil kucuk',
      onclick: () => {
        gosterilenKaydet([...gosterilenYukle(), k.anahtar]);
        anaEkran();
      },
    }, 'Tamam'),
  ));
}

function guncelPlan() {
  if (!veri?.bildirim?.telefon) return null;
  const bugun = bugunTR();
  const donem = donemBul(veri.ayar, bugun);
  const kayit = veri.donemler[donem.baslangic];
  if (!kayit) return null;
  const gosterilen = gosterilenYukle();
  return bildirimPlani(veri, donem, kayit, bugun).filter((k) => !gosterilen.includes(k.anahtar));
}

const BILDIRIM_DURUM = 'cuzdan.bildirimdurum';
const DENEME = 'cuzdan.deneme';
const DENEME_SURESI = 10 * 60 * 1000;
let bildirimSuruyor = false;
let bildirimSayaci;

function bildirimDurumuYaz(durum) {
  try {
    localStorage.setItem(BILDIRIM_DURUM, JSON.stringify({ ...durum, zaman: Date.now() }));
  } catch {
    // Yazılamasa da bildirim gönderimi etkilenmez.
  }
}

function bildirimDurumuOku() {
  try {
    return JSON.parse(localStorage.getItem(BILDIRIM_DURUM));
  } catch {
    return null;
  }
}

// Kontrol düğmesinin denemesi, uygulama araya girip planı yenilese de ilk 10 dakika planda kalır.
function denemeKalemi() {
  try {
    const kalem = JSON.parse(localStorage.getItem(DENEME));
    return kalem && Date.now() - kalem.zaman < DENEME_SURESI ? [kalem] : [];
  } catch {
    return [];
  }
}

// Veri eşitlemesinden bağımsızdır; eşitleme takılsa da telefon ve plan sunucuya yazılır.
async function bildirimEsitle() {
  if (bildirimSuruyor || !window.fetch || !oturum() || !veri?.bildirim?.telefon || window.Notification?.permission !== 'granted') return;
  bildirimSuruyor = true;
  try {
    await arkaPlanKaydi();
    if (!(await telefonAbonesi())) throw new Error('Bu cihaz sunucu bildirimini desteklemiyor.');
    await planGonder([...(guncelPlan() ?? []), ...denemeKalemi()]);
    bildirimDurumuYaz({ tamam: true });
  } catch (h) {
    bildirimDurumuYaz({ tamam: false, hata: String(h?.message ?? h).slice(0, 120) });
  } finally {
    bildirimSuruyor = false;
  }
}

function bildirimEsitleIste() {
  clearTimeout(bildirimSayaci);
  bildirimSayaci = setTimeout(bildirimEsitle, 1500);
  bildirimSayaci.unref?.();
}

function planYaz() {
  bildirimEsitleIste();
  const plan = guncelPlan();
  if (!plan || !window.caches) return;
  window.caches.open('cuzdan-bildirim').then((o) => o.put('bildirim-plan', new Response(JSON.stringify(plan)))).catch(() => {});
}

// Telefonda gösterilen hatırlatma, uygulama açılınca bir daha kart olarak çıkmasın.
async function gosterilenleriAl() {
  try {
    const cevap = await (await window.caches?.open('cuzdan-bildirim'))?.match('bildirim-gosterilen');
    const yerel = cevap ? await cevap.json() : [];
    const uzak = oturum() && veri?.bildirim?.telefon ? await gonderilenleriOku() : [];
    if (!yerel.length && !uzak.length) return;
    gosterilenKaydet([...gosterilenYukle(), ...yerel, ...uzak]);
    canliTazele();
  } catch {
    // Okunamazsa kart görünür, zararı yok.
  }
}

async function arkaPlanKaydi() {
  try {
    const kayit = await navigator.serviceWorker.ready;
    await kayit.periodicSync?.register('cuzdan-hatirlat', { minInterval: 6 * 60 * 60 * 1000 });
  } catch {
    // Telefon izin vermezse hatırlatmalar uygulama açılınca görünür.
  }
}

async function telefonAbonesi() {
  if (!oturum() || !('serviceWorker' in navigator)) return false;
  const kayit = await navigator.serviceWorker.ready;
  if (!kayit.pushManager) return false;
  const anahtar = Uint8Array.from(atob(VAPID_ACIK.replaceAll('-', '+').replaceAll('_', '/')), (h) => h.charCodeAt(0));
  const abonelik = (await kayit.pushManager.getSubscription()) ?? (await kayit.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: anahtar }));
  await abonelikKaydet(abonelik);
  return true;
}

async function telefonIzni() {
  if (!('Notification' in window && 'serviceWorker' in navigator)) return false;
  if ((await window.Notification.requestPermission()) !== 'granted') return false;
  kaydetVeUyar({ ...veri, bildirim: { ...bildirimAyari(veri), telefon: true } });
  await arkaPlanKaydi();
  await telefonAbonesi().catch(() => {});
  return true;
}

function hatirlatmaEkrani() {
  const ayar = bildirimAyari(veri);
  const destek = 'Notification' in window && 'serviceWorker' in navigator;
  const iphone = /iPhone|iPad|iPod/.test(navigator.userAgent ?? '');
  const arkaPlan = typeof window.ServiceWorkerRegistration === 'function' && 'periodicSync' in window.ServiceWorkerRegistration.prototype;
  const hata = hataSatiri();
  const gunler = [[0, 'Sadece son gün'], [1, '1 gün önce'], [2, '2 gün önce'], [3, '3 gün önce'], [5, '5 gün önce'], [7, '7 gün önce']];
  const gunOnce = el('select', { id: 'gun-once' }, gunler.map(([g, ad]) => el('option', { value: String(g), selected: g === ayar.gunOnce }, ad)));
  const saat = el('input', { id: 'saat', type: 'time', value: ayar.saat });
  const maas = el('input', { id: 'maas', type: 'checkbox', checked: ayar.maas });
  const gunSonu = el('input', { id: 'gun-sonu', type: 'checkbox', checked: ayar.gunSonu });
  const gunSonuSaat = el('input', { id: 'gun-sonu-saat', type: 'time', value: ayar.gunSonuSaat });
  const [sinirEtiketi, sinirKutusu] = tutarAlani('alt-sinir', 'Serbest para şunun altına inince söyle (isteğe bağlı)', ayar.altSinir ? paraYaz(ayar.altSinir) : '');
  const durum = el('p', { sinif: 'ipucu', role: 'status' }, telefonDurumu());
  const kontrol = el('div', { role: 'status' });

  function telefonDurumu() {
    if (!destek) return iphone ? 'iPhone’da önce uygulamayı ana ekrana eklemelisin.' : 'Bu cihaz telefon bildirimini desteklemiyor.';
    if (window.Notification.permission === 'denied') return 'Bildirim izni kapalı. Telefonun ayarlarından açabilirsin.';
    if (!ayar.telefon) return 'Telefon bildirimi kapalı.';
    if (oturum()) {
      const son = bildirimDurumuOku();
      if (son?.tamam === false) return `Sunucuya yazılamadı: ${son.hata}. “Bildirimi kontrol et”e bas.`;
      if (son?.tamam) return `Açık. Sunucuya son yazılma: ${new Date(son.zaman).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}. Kapalıyken de seçtiğin saatte gelir.`;
      return 'Açık. Sunucuya henüz yazılmadı. “Bildirimi kontrol et”e bas.';
    }
    return arkaPlan
      ? 'Açık. Tam saatinde gelmesi için hesap aç; şimdilik saati telefon belirler.'
      : 'Açık. Bu cihaz kapalı uygulamadan bildirim çalıştıramıyor; hatırlatma açınca görünür.';
  }

  async function telefonuAc() {
    if (!(await telefonIzni())) {
      durum.textContent = 'İzin verilmedi. Hatırlatmalar uygulamayı açınca görünmeye devam eder.';
      return;
    }
    hatirlatmaEkrani();
  }

  async function denemeGonder() {
    (await navigator.serviceWorker.ready).showNotification('Cüzdan', { body: 'Deneme bildirimi. Hatırlatmalar böyle görünecek.', icon: 'ikon/ikon-192.png' });
  }

  // Hangi adımda takıldığını gösterir; son adımda sunucudan gerçek bir bildirim ister.
  async function bildirimKontrol() {
    kontrol.replaceChildren();
    const yaz = (metin) => kontrol.append(el('p', { sinif: 'ipucu' }, metin));
    if (window.Notification.permission !== 'granted') {
      yaz('✗ Bildirim izni yok');
      return yaz('Telefonun ayarlarından Cüzdan için bildirimi aç.');
    }
    yaz('✓ Bildirim izni var');
    if (!oturum()) {
      yaz('✗ Hesap yok');
      return yaz('Uygulama kapalıyken bildirim gelmesi için Ayarlar\'dan hesap aç.');
    }
    yaz('✓ Hesap açık');
    try {
      if (!(await telefonAbonesi())) return yaz('✗ Bu cihaz sunucu bildirimini desteklemiyor.');
      yaz('✓ Telefon sunucuya kayıtlı');
      localStorage.setItem(DENEME, JSON.stringify({ anahtar: `deneme:${Date.now()}`, zaman: Date.now(), baslik: 'Cüzdan', metin: 'Sunucudan deneme bildirimi. Bildirimlerin çalışıyor.' }));
      await planGonder([...(guncelPlan() ?? []), ...denemeKalemi()]);
      yaz('✓ Deneme sunucuya gönderildi');
      yaz('Uygulamayı kapat. 5 dakika içinde bildirim gelmeli.');
    } catch (h) {
      yaz(`✗ Hata: ${h?.message ?? h}`);
    }
  }

  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const yazilan = sinirKutusu.value.trim();
        const altSinir = yazilan ? paraCoz(yazilan) : undefined;
        if (altSinir === null || altSinir === 0) return hataGoster(hata, 'Sıfırdan büyük bir tutar yaz. Örnek: 1.000');
        if (!saat.value || !gunSonuSaat.value) return hataGoster(hata, 'Saati seç.');
        kaydetVeUyar({
          ...veri,
          bildirim: {
            gunOnce: Number(gunOnce.value),
            saat: saat.value,
            maas: maas.checked,
            gunSonu: gunSonu.checked,
            gunSonuSaat: gunSonuSaat.value,
            altSinir,
            telefon: ayar.telefon,
          },
        });
        ayarlarEkrani();
      },
    },
    ikiAlan([el('label', { htmlFor: 'gun-once' }, 'Ne zaman söylesin?'), gunOnce], [el('label', { htmlFor: 'saat' }, 'Saat'), saat]),
    el('p', { sinif: 'ipucu' }, 'Ödeme olan sabah tek bildirimde toplanır. Geciken ödeme, ödeyene kadar her sabah yazar.'),
    el('label', { sinif: 'secim', htmlFor: 'maas' }, maas, el('span', {}, 'Maaş gününde söyle')),
    el('label', { sinif: 'secim', htmlFor: 'gun-sonu' }, gunSonu, el('span', {}, 'Gün sonunda harcamaları sor')),
    ikiAlan([el('label', { htmlFor: 'gun-sonu-saat' }, 'Gün sonu saati'), gunSonuSaat]),
    sinirEtiketi,
    sinirKutusu,
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
  );
  goster(
    ustBolum('Hatırlatmalar', ayarlarEkrani),
    bilgiSatiri(),
    form,
    el(
      'section',
      { sinif: 'kart bosluk' },
      el('h2', {}, 'Telefon bildirimi'),
      durum,
      el('div', { sinif: 'kalem-dugme' },
        destek && !ayar.telefon && window.Notification.permission !== 'denied'
          ? el('button', { type: 'button', sinif: 'kucuk', onclick: telefonuAc }, 'Bildirimi aç')
          : null,
        destek && ayar.telefon
          ? el('button', { type: 'button', sinif: 'ikincil kucuk', onclick: denemeGonder }, 'Deneme bildirimi')
          : null,
        destek && ayar.telefon
          ? el('button', { type: 'button', sinif: 'ikincil kucuk', onclick: bildirimKontrol }, 'Bildirimi kontrol et')
          : null,
        destek && ayar.telefon
          ? el('button', {
              type: 'button',
              sinif: 'ikincil kucuk',
              onclick: () => {
                kaydetVeUyar({ ...veri, bildirim: { ...ayar, telefon: false } });
                window.caches?.delete('cuzdan-bildirim').catch(() => {});
                hatirlatmaEkrani();
              },
            }, 'Kapat')
          : null),
      kontrol,
    ),
  );
}

/* Hesap */

function epostaAlani() {
  return [
    el('label', { htmlFor: 'eposta' }, 'E-posta'),
    el('input', { id: 'eposta', name: 'eposta', type: 'email', autocomplete: 'email', inputMode: 'email' }),
  ];
}

function hataMetni(hata) {
  return hata instanceof BulutHatasi ? hata.message : 'İşlem yapılamadı, yeniden dene.';
}

function girisEkrani(mod, geri) {
  const yeni = mod === 'kayit';
  const hata = hataSatiri();
  const gonderDugme = el('button', { type: 'submit' }, yeni ? 'Hesap aç' : 'Giriş yap');
  const form = el(
    'form',
    {
      onsubmit: async (o) => {
        o.preventDefault();
        const eposta = form.elements.eposta.value.trim();
        const sifre = form.elements.sifre.value;
        if (!eposta.includes('@')) return hataGoster(hata, 'E-posta adresini yaz.');
        if (sifre.length < 8) return hataGoster(hata, 'Şifre en az 8 karakter olmalı.');
        gonderDugme.disabled = true;
        try {
          await (yeni ? kayitOl(eposta, sifre) : girisYap(eposta, sifre));
          await girisSonrasi();
        } catch (h) {
          gonderDugme.disabled = false;
          hataGoster(hata, hataMetni(h));
        }
      },
    },
    epostaAlani(),
    el('label', { htmlFor: 'sifre' }, 'Şifre'),
    el('input', { id: 'sifre', name: 'sifre', type: 'password', autocomplete: yeni ? 'new-password' : 'current-password' }),
    yeni ? el('p', { sinif: 'ipucu' }, 'En az 8 karakter. Bilgilerin hesabına kaydedilir, başka kullanıcılar göremez.') : null,
    hata,
    gonderDugme,
    el('button', { type: 'button', sinif: 'ikincil', onclick: () => girisEkrani(yeni ? 'giris' : 'kayit', geri) }, yeni ? 'Hesabım var, giriş yap' : 'Yeni hesap aç'),
    yeni ? null : el('button', { type: 'button', sinif: 'ikincil', onclick: () => sifreUnuttumEkrani(geri) }, 'Şifremi unuttum'),
  );
  goster(ustBolum(yeni ? 'Hesap aç' : 'Giriş yap', geri), form);
}

function sifreUnuttumEkrani(geri) {
  const hata = hataSatiri();
  const form = el(
    'form',
    {
      onsubmit: async (o) => {
        o.preventDefault();
        const eposta = form.elements.eposta.value.trim();
        if (!eposta.includes('@')) return hataGoster(hata, 'E-posta adresini yaz.');
        try {
          await sifreBaglantisi(eposta);
          goster(ustBolum('Şifremi unuttum', geri), el('section', { sinif: 'kart' }, el('p', {}, 'E-postana bağlantı gönderdik. Gelmezse gereksiz kutusuna da bak.')));
        } catch (h) {
          hataGoster(hata, hataMetni(h));
        }
      },
    },
    epostaAlani(),
    hata,
    el('button', { type: 'submit' }, 'Bağlantı gönder'),
  );
  goster(ustBolum('Şifremi unuttum', () => girisEkrani('giris', geri)), form);
}

function yeniSifreEkrani(erisim, yenileme) {
  const hata = hataSatiri();
  const form = el(
    'form',
    {
      onsubmit: async (o) => {
        o.preventDefault();
        const sifre = form.elements.sifre.value;
        if (sifre.length < 8) return hataGoster(hata, 'Şifre en az 8 karakter olmalı.');
        try {
          await sifreDegistir(sifre, erisim);
          await baglantiOturumu(erisim, yenileme);
          await girisSonrasi();
        } catch (h) {
          hataGoster(hata, hataMetni(h));
        }
      },
    },
    el('label', { htmlFor: 'sifre' }, 'Yeni şifre'),
    el('input', { id: 'sifre', name: 'sifre', type: 'password', autocomplete: 'new-password' }),
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
  );
  goster(el('header', { sinif: 'ust' }, el('h1', {}, 'Yeni şifre')), form);
}

function veriOzeti(kayit) {
  const hareket = Object.values(kayit.donemler).reduce((t, d) => t + (d.hareketler?.length ?? 0), 0);
  const son = Object.values(kayit.donemler).flatMap((d) => d.hareketler ?? []).map((h) => h.tarih).sort().at(-1);
  return `${kayit.ad}: ${hareket} kayıt${son ? `, son kayıt ${tarihYaz(son)}` : ''}`;
}

function uzaktanAl(uzak) {
  veri = uzak.veri;
  kaydet(veri);
  gorunumUygula();
  sesAyarla(veri.ses !== false);
  esitlemeYaz({ surum: uzak.surum, kirli: false });
  planYaz();
}

async function girisSonrasi() {
  sesCal('acilis');
  const uzak = await uzaktanOku();
  if (!uzak) {
    esitlemeYaz({ surum: 0, kirli: Boolean(veri) });
    if (!veri) return kurulumEkrani();
    await esitle();
    bildirimEsitle();
    return ayarlarEkrani();
  }
  if (!veriGecerliMi(uzak.veri)) throw new BulutHatasi('Hesaptaki kayıt okunamadı.', 'veri');
  if (!veri || JSON.stringify(veri) === JSON.stringify(uzak.veri)) {
    uzaktanAl(uzak);
    return anaEkran();
  }
  cakismaEkrani(uzak);
}

// İki farklı kayıt varsa hangisinin kalacağına kullanıcı karar verir; sessizce silinmez.
function cakismaEkrani(uzak) {
  const hata = hataSatiri();
  goster(
    el('header', { sinif: 'ust' }, el('h1', {}, 'İki farklı kayıt var')),
    el('section', { sinif: 'kart' }, el('p', {}, 'Bu cihazdaki kayıt ile hesabındaki kayıt farklı. Hangisi kalsın?')),
    el(
      'div',
      { sinif: 'izgara' },
      el('div', { sinif: 'kart' }, el('h2', {}, 'Bu cihaz'), el('p', { sinif: 'ipucu' }, veriOzeti(veri))),
      el('div', { sinif: 'kart' }, el('h2', {}, 'Hesabım'), el('p', { sinif: 'ipucu' }, veriOzeti(uzak.veri))),
    ),
    hata,
    el('button', { type: 'button', sinif: 'ikincil', onclick: yedekIndir }, 'Önce bu cihazın yedeğini indir'),
    el('button', {
      type: 'button',
      onclick: () => {
        uzaktanAl(uzak);
        anaEkran();
      },
    }, 'Hesabımdakini kullan'),
    el('button', {
      type: 'button',
      sinif: 'ikincil',
      onclick: async () => {
        esitlemeYaz({ surum: uzak.surum, kirli: true });
        await esitle();
        if (esitlemeDurumu().kirli) return hataGoster(hata, 'Kaydedilemedi, internetini kontrol et.');
        anaEkran();
      },
    }, 'Bu cihazdakini kullan'),
  );
}

function esitleIste() {
  if (!oturum()) return;
  esitlemeYaz({ ...esitlemeDurumu(), kirli: true });
  clearTimeout(esitlemeSayaci);
  esitlemeSayaci = setTimeout(esitle, 1500);
  esitlemeSayaci.unref?.();
}

async function esitle() {
  if (!window.fetch || !oturum() || !veri || esitleniyor) return;
  esitleniyor = true;
  try {
    const durum = esitlemeDurumu();
    if (durum.kirli) {
      const gonderilen = veri;
      const surum = await uzagaYaz(gonderilen, durum.surum);
      if (surum === -1) {
        const uzak = await uzaktanOku();
        if (uzak) return cakismaEkrani(uzak);
        esitlemeYaz({ surum: 0, kirli: true });
        return;
      }
      esitlemeYaz({ surum, kirli: veri !== gonderilen });
      if (veri !== gonderilen) esitleIste();
    } else {
      const uzak = await uzaktanOku();
      if (uzak && uzak.surum > durum.surum && veriGecerliMi(uzak.veri)) {
        uzaktanAl(uzak);
        canliTazele();
      }
    }
  } catch {
    // İnternet yoksa kayıt cihazda bekler, bağlantı gelince gönderilir.
  } finally {
    esitleniyor = false;
  }
}

async function cikisEkrani() {
  await esitle();
  if (esitlemeDurumu().kirli) {
    uyari = 'Son değişiklikler henüz hesabına gitmedi. İnternete bağlanıp yeniden dene.';
    return ayarlarEkrani();
  }
  if (!window.confirm('Çıkış yapılsın mı? Veriler hesabında kalır, bu cihazdan kaldırılır.')) return;
  await cikisYap();
  temizle();
  veri = null;
  gorunumUygula();
  kurulumTaslak = { adim: 1, ad: '', gun: null };
  kurulumEkrani();
}

async function hesabiSil() {
  if (!window.confirm('Hesabın ve hesaptaki tüm veriler silinecek. Önce yedek almanı öneririm. Emin misin?')) return;
  if (!window.confirm('Son onay: Silinen hesap geri gelmez.')) return;
  try {
    await hesapSil();
  } catch (h) {
    uyari = hataMetni(h);
    return ayarlarEkrani();
  }
  temizle();
  veri = null;
  uyari = '';
  kurulumTaslak = { adim: 1, ad: '', gun: null };
  kurulumEkrani();
}

/* Hakkında */

function imzaCiz(canli = false) {
  return el('span', {
    sinif: `imza${canli ? ' canli' : ''}`,
    role: 'img',
    'aria-label': 'Mehmetnur Özkoç imzası',
    innerHTML: imzaSvg({ canli, altin: canli }),
  });
}

function hakkindaEkrani(geri) {
  const kart = el('button', {
    type: 'button',
    sinif: 'imza-kart',
    'aria-label': 'İmzayı yeniden çiz',
    onclick: () => hakkindaEkrani(geri),
  }, imzaCiz(true));
  goster(
    ustBolum('Hakkında', geri),
    el(
      'section',
      { sinif: 'hero orta imza-bolum' },
      kart,
      el('p', { sinif: 'imza-ad' }, 'Mehmetnur Özkoç'),
      el('p', { sinif: 'ipucu' }, 'Matematik Öğretmeni'),
      el('p', { sinif: 'bosluk' }, 'Cüzdan’ı kendim ve yakınlarım için tasarladım. Ücretsiz, reklamsız, sade.'),
    ),
    el('p', { sinif: 'ipucu orta bosluk' }, '2026'),
  );
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
      el('h2', {}, 'Görünüm'),
      el(
        'div',
        { sinif: 'renkler' },
        [['zumrut', 'Zümrüt'], ['gece', 'Gece altını'], ['lacivert', 'Lacivert']].map(([kod, ad]) => el('button', {
          type: 'button',
          sinif: `renk-kutu renk-${kod}`,
          'aria-pressed': String((veri.renk ?? 'zumrut') === kod),
          onclick: () => {
            kaydetVeUyar({ ...veri, renk: kod === 'zumrut' ? undefined : kod });
            gorunumUygula();
            ayarlarEkrani();
          },
        }, el('span', { sinif: 'renk-ornek', 'aria-hidden': 'true' }), ad)),
      ),
      veri.renk === 'gece'
        ? el('p', { sinif: 'ipucu bosluk' }, 'Gece altını her zaman koyu görünür.')
        : el(
            'div',
            { sinif: 'kategoriler bosluk' },
            [[undefined, 'Otomatik'], ['acik', 'Açık'], ['koyu', 'Koyu']].map(([kod, ad]) => el('button', {
              type: 'button',
              sinif: 'cip',
              'aria-pressed': String(veri.mod === kod),
              onclick: () => {
                kaydetVeUyar({ ...veri, mod: kod });
                gorunumUygula();
                ayarlarEkrani();
              },
            }, ad)),
          ),
    ),
    el(
      'section',
      { sinif: 'kart' },
      el('h2', {}, 'Ses ve titreşim'),
      el('label', { sinif: 'secim', htmlFor: 'ses' }, el('input', {
        id: 'ses',
        type: 'checkbox',
        checked: veri.ses !== false,
        onchange: (o) => {
          kaydetVeUyar({ ...veri, ses: o.target.checked });
          sesAyarla(o.target.checked);
          if (o.target.checked) sesCal('kazanc');
        },
      }), el('span', {}, 'Sikke seslerini çal')),
      el('label', { sinif: 'secim', htmlFor: 'titresim' }, el('input', {
        id: 'titresim',
        type: 'checkbox',
        checked: veri.titresim !== false,
        onchange: (o) => {
          kaydetVeUyar({ ...veri, titresim: o.target.checked });
          if (o.target.checked) titret();
        },
      }), el('span', {}, 'Önemli anlarda titreşim')),
      el('p', { sinif: 'ipucu' }, 'Ses açılışta ve bir şey tamamlanınca çalar. Titreşim kayıt yapılınca kısa bir kez gelir. iPhone’da titreşim çalışmayabilir.'),
    ),
    el(
      'section',
      { sinif: 'kart' },
      el('h2', {}, 'Köşedeki para'),
      el('p', { sinif: 'ipucu' }, veri.kose ? `Ayrılan: ${paraYaz(veri.kose)}` : 'Beklenmedik giderler için ayrı bir tutar tutabilirsin.'),
      el('button', { type: 'button', sinif: 'ikincil', onclick: koseEkrani }, veri.kose ? 'Tutarı değiştir' : 'Köşeye para ayır'),
    ),
    el(
      'section',
      { sinif: 'kart' },
      el('h2', {}, 'Hatırlatmalar'),
      el('p', { sinif: 'ipucu' }, veri.bildirim?.telefon ? 'Telefon bildirimi açık.' : 'Hatırlatmalar uygulamayı açınca görünür.'),
      el('button', { type: 'button', sinif: 'ikincil', onclick: hatirlatmaEkrani }, 'Hatırlatma ayarları'),
    ),
    el(
      'section',
      { sinif: 'kart' },
      el('h2', {}, 'Uygulama'),
      el(
        'div',
        { sinif: 'ikili' },
        uygulamaIcinde() ? null : el('button', { type: 'button', sinif: 'ikincil', onclick: kurulumRehberi }, 'Ana ekrana ekle'),
        el('button', { type: 'button', sinif: 'ikincil', onclick: () => hakkindaEkrani(ayarlarEkrani) }, 'Hakkında'),
      ),
    ),
    el(
      'section',
      { sinif: 'kart' },
      el('h2', {}, 'Hesap'),
      oturum()
        ? [
            el('p', { sinif: 'ipucu' }, `${oturum().eposta} ile giriş yapıldı. Veriler hesabına kaydediliyor.`),
            el('button', { type: 'button', sinif: 'ikincil', onclick: cikisEkrani }, 'Çıkış yap'),
            el('button', { type: 'button', sinif: 'tehlike', onclick: hesabiSil }, 'Hesabımı sil'),
          ]
        : [
            el('p', { sinif: 'ipucu' }, 'Hesap açarsan veriler telefon değişince kaybolmaz, tablet ve telefonda aynı görünür.'),
            el('button', { type: 'button', onclick: () => girisEkrani('kayit', ayarlarEkrani) }, 'Hesap aç'),
            el('button', { type: 'button', sinif: 'ikincil', onclick: () => girisEkrani('giris', ayarlarEkrani) }, 'Giriş yap'),
            el('button', { type: 'button', sinif: 'tehlike', onclick: verileriSil }, 'Bu cihazdaki verileri sil'),
          ],
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
    ? el('button', { type: 'button', onclick: uygulamayiYukle }, 'Uygulamayı yükle')
    : el('p', { sinif: 'ipucu' }, 'Yükleme hazır değil. Sayfayı kapatıp yeniden aç, olmazsa Chrome’u güncelle.');

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
    el('ol', {}, ['Bu sayfayı Chrome ile aç.', 'Uygulamayı yükle düğmesine dokun.', 'Üç noktadaki menüyü kullanma, orada “zaten yüklü” yazabilir.'].map((s) => el('li', {}, s))),
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
  planYaz();
  gosterilenleriAl();
  esitle();
  bildirimEsitle();

  const baglanti = new URLSearchParams(window.location.hash.slice(1));
  if (baglanti.get('type') === 'recovery' && baglanti.get('access_token')) {
    window.history.replaceState?.(null, '', window.location.pathname);
    return yeniSifreEkrani(baglanti.get('access_token'), baglanti.get('refresh_token'));
  }
  return veri ? anaEkran() : kurulumEkrani();
}

// Chrome 154-156'da üç nokta menüsü aynı sitedeki başka uygulama yüzünden "zaten yüklü" der; bu düğme o kontrolü atlar.
const kurulumDugmesi = el('button', { type: 'button', sinif: 'kurulum-dugmesi', hidden: true, onclick: () => uygulamayiYukle() }, 'Uygulamayı yükle');
document.body.append(kurulumDugmesi);

function uygulamaIcinde() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function kurulumDugmesiYaz() {
  kurulumDugmesi.hidden = !kurulumIstemi || uygulamaIcinde();
}

async function uygulamayiYukle() {
  const istem = kurulumIstemi;
  if (!istem) return kurulumRehberi();
  kurulumIstemi = null;
  kurulumDugmesiYaz();
  try {
    await istem.prompt();
  } catch {
    // Chrome olayı yeniden gönderince düğme geri gelir.
  }
}

window.addEventListener('beforeinstallprompt', (olay) => {
  kurulumIstemi = olay;
  kurulumDugmesiYaz();
});

window.addEventListener('appinstalled', () => {
  kurulumIstemi = null;
  kurulumDugmesiYaz();
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  gosterilenleriAl();
  esitle();
  bildirimEsitle();
  if (kok.querySelector('#ana-para')) anaEkran();
  if (Date.now() - (piyasaKaydi?.alindi ?? 0) > YENILEME_SURESI) piyasaYenile();
});

window.addEventListener('online', esitle);

// Telefonun geri tuşu ekrandaki geri düğmesiyle aynı işi yapar; ana ekrandayken uygulamadan çıkar.
window.addEventListener('popstate', () => {
  const perde = kok.querySelector('.hesap-perde');
  if (perde) perde.remove();
  else if (aktifGeri) aktifGeri();
  else if (veri && !kok.querySelector('#ana-para')) anaEkran();
  else return window.history.back();
  window.history.pushState({ cuzdan: true }, '');
});
window.history.pushState({ cuzdan: true }, '');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

baslat();
gorunumUygula();
sesAyarla(veri?.ses !== false);
acilisGoster();
window.cuzdanHazir = true;
try {
  sessionStorage.removeItem('cuzdan.onarim');
} catch {
  // Onarım işareti silinemezse bir sonraki hatada uyarı daha erken çıkar.
}
