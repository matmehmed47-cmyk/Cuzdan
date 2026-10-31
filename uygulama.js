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

const kok = document.getElementById('uygulama');
let veri = null;
let uyari = '';
let kurulumTaslak = { adim: 1, ad: '', gun: null };
let kurulumIstemi = null;

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
  kok.replaceChildren(...dugumler.flat(Infinity).filter(Boolean));
  window.scrollTo?.(0, 0);
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
    el('input', { id, name: id, type: 'text', inputMode: 'decimal', autocomplete: 'off', placeholder: 'Örnek: 25.000', value: deger }),
  ];
}

function gunSecici(id, secili) {
  const secenekler = [el('option', { value: '' }, 'Gün seç')];
  for (let gun = 1; gun <= 31; gun += 1) {
    secenekler.push(el('option', { value: String(gun), selected: gun === secili }, `Ayın ${gun}. günü`));
  }
  return el('select', { id }, secenekler);
}

function kisaAyNotu() {
  return el('p', { sinif: 'ipucu' }, 'Ay kısa çekerse maaş, ayın son günü sayılır.');
}

/* İlk kurulum */

function kurulumEkrani() {
  const { adim } = kurulumTaslak;
  const baslik = el('p', { sinif: 'adim' }, `Adım ${adim} / 3`);

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
    geri ? el('button', { type: 'button', sinif: 'simge', 'aria-label': 'Geri', onclick: geri }, '‹') : null,
    el('h1', {}, baslik),
    geri ? null : el('button', { type: 'button', sinif: 'simge', 'aria-label': 'Ayarlar', onclick: ayarlarEkrani }, '⚙'),
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
    el('section', { sinif: 'kart vurgulu' }, el('h2', {}, 'Yeni ay, temiz sayfa'), el('p', {}, 'Yeni dönem başladı. Geçen dönem Geçmiş bölümünde duruyor.')),
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
  goster(
    ustBolum(veri.ad),
    bilgiSatiri(),
    el(
      'section',
      { sinif: 'kart vurgulu' },
      el('p', { sinif: 'etiket' }, 'Serbest para'),
      el('p', { sinif: 'tutar', id: 'ana-para' }, paraYaz(serbest)),
      satir('Toplam para', paraYaz(para)),
      satir('Ödemelere ayrıldı', paraYaz(ayrilan)),
      belirsiz ? el('p', { sinif: 'ipucu' }, `${belirsiz} ödemenin tutarı henüz belli değil, hesaba katılmadı.`) : null,
      el('button', { type: 'button', sinif: 'ikincil', onclick: () => paraDuzelt(donem, kayit) }, 'Tutarı düzelt'),
    ),
    el(
      'div',
      { sinif: 'ikili' },
      el('button', { type: 'button', onclick: () => harcamaFormu(donem) }, '+ Harcama'),
      el('button', { type: 'button', onclick: () => gelirFormu(donem) }, '+ Gelir'),
    ),
    el(
      'section',
      { sinif: 'kart' },
      el('p', { sinif: 'etiket' }, 'Maaşa kadar'),
      el('p', {}, serbest < 0 ? `${paraYaz(-serbest)} eksidesin` : `Yaklaşık ${paraYaz(alt)} – ${paraYaz(ust)} kalıyor`),
      el('p', { sinif: 'ipucu' }, `Sonraki maaş: ${tarihYaz(donem.sonraki)} (${kalanGun} gün kaldı)`),
      el('p', { sinif: 'ipucu' }, `Bu dönem: ${tarihYaz(donem.baslangic)} – ${tarihYaz(donem.bitis)}`),
    ),
    el(
      'section',
      { sinif: 'kart' },
      el('h2', {}, 'Yaklaşan ödemeler'),
      bekleyen.length
        ? bekleyen.slice(0, 5).map((k) => kalemKutusu(k, donem, bugun, anaEkran))
        : el('p', { sinif: 'ipucu' }, veri.faturalar?.length || veri.taksitler?.length ? 'Bu dönem bekleyen ödeme yok.' : 'Henüz ödeme eklemedin.'),
      bekleyen.length > 5 ? el('p', { sinif: 'ipucu' }, `${bekleyen.length - 5} ödeme daha var.`) : null,
      el('button', { type: 'button', sinif: 'ikincil bosluk', onclick: faturalarEkrani }, 'Faturalar'),
      el('button', { type: 'button', sinif: 'ikincil', onclick: taksitlerEkrani }, 'Taksitler'),
    ),
    el('button', { type: 'button', sinif: 'ikincil', onclick: () => harcamalarEkrani() }, 'Harcamalar'),
    el('button', { type: 'button', sinif: 'ikincil', onclick: () => gelirlerEkrani() }, 'Gelirler'),
    el('button', { type: 'button', sinif: 'ikincil', onclick: () => ortakEkrani() }, 'Ortak ev'),
    el('button', { type: 'button', sinif: 'ikincil', onclick: gecmisEkrani }, 'Geçmiş dönemler'),
    el('p', { sinif: 'ipucu orta bosluk' }, 'Veriler şimdilik sadece bu cihazda duruyor.'),
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

function kalemKutusu(kalem, donem, bugun, geri, tamListe = false) {
  const dugmeler = [];
  if (bekliyorMu(kalem)) {
    dugmeler.push(el('button', { type: 'button', onclick: () => (kalem.taksitId ? taksitOdeFormu(kalem, donem, geri) : odemeBaslat(kalem, donem, bugun, geri)) }, '✓ Ödedim'));
    if (tamListe) {
      dugmeler.push(el('button', {
        type: 'button',
        sinif: 'ikincil',
        onclick: () => {
          kaydetVeUyar(ayAtla(veri, kalem.faturaId, kalem.ay));
          geri();
        },
      }, 'Bu ay yok'));
    }
  } else if (kalem.durum === 'atlandi' || kalem.geriAlinabilir) {
    dugmeler.push(el('button', {
      type: 'button',
      sinif: 'ikincil',
      onclick: () => {
        const yeni = kalem.durum === 'atlandi'
          ? atlamaGeriAl(veri, kalem.faturaId, kalem.ay)
          : odemeGeriAl(veri, donem.baslangic, kalem);
        kaydetVeUyar(yeni);
        geri();
      },
    }, 'Geri al'));
  }

  return el(
    'div',
    { sinif: 'kalem' },
    satir(kalem.ad, kalem.kurus === null ? 'Tutar belli değil' : paraYaz(kalem.kurus)),
    el('p', { sinif: kalem.durum === 'gecikti' ? 'ipucu gecikti' : 'ipucu' }, durumYazisi(kalem, bugun)),
    dugmeler.length ? el('div', { sinif: dugmeler.length > 1 ? 'ikili' : '' }, dugmeler) : null,
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
  goster(
    ustBolum('Faturalar', anaEkran),
    bilgiSatiri(),
    el('button', { type: 'button', onclick: () => faturaFormu() }, '+ Fatura ekle'),
    el(
      'section',
      { sinif: 'kart bosluk' },
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
          faturalar.map((f) => el(
            'div',
            { sinif: 'kalem' },
            satir(f.ad, f.kurus ? paraYaz(f.kurus) : 'Değişken'),
            el('p', { sinif: 'ipucu' }, `Ayın ${f.gun}. günü · ${f.tur === 'sabit' ? 'Sabit' : 'Değişken'}`),
            el('button', { type: 'button', sinif: 'ikincil', onclick: () => faturaFormu(f) }, 'Düzenle'),
          )),
        )
      : null,
  );
}

function faturaFormu(mevcut = null) {
  const bugun = bugunTR();
  const donem = donemBul(veri.ayar, bugun);
  const hata = hataSatiri();
  const tur = el(
    'select',
    { id: 'tur', onchange: () => etiketYaz() },
    el('option', { value: 'sabit', selected: mevcut?.tur !== 'degisken' }, 'Her ay aynı tutar (sabit)'),
    el('option', { value: 'degisken', selected: mevcut?.tur === 'degisken' }, 'Tutar değişiyor (elektrik gibi)'),
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
    el('label', { htmlFor: 'tur' }, 'Tutarı nasıl?'),
    tur,
    tutarEtiketi,
    tutarKutusu,
    el('label', { htmlFor: 'gun' }, 'Son ödeme günü'),
    gun,
    el('p', { sinif: 'ipucu' }, 'Ay kısa çekerse ayın son günü sayılır.'),
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
    satir(taksit.ad, taksit.sayi ? `${Math.min(durum.odenenAdet, taksit.sayi)}/${taksit.sayi}` : ''),
    satir('Ödenen', paraYaz(durum.odenen)),
    satir('Kalan', paraYaz(durum.kalan)),
    kategoriCubugu(durum.odenen, taksit.toplam),
    durum.kalan === 0
      ? el('p', { sinif: 'ipucu' }, '✓ Tamamlandı')
      : siradaki
        ? el('p', { sinif: siradaki.durum === 'gecikti' ? 'ipucu gecikti' : 'ipucu' }, `${siradaki.durum === 'gecikti' ? 'Gecikti' : 'Sıradaki'}: ${siradaki.kurus === null ? 'Tutar sende' : paraYaz(siradaki.kurus)} · ${tarihYaz(siradaki.vade)}`)
        : null,
    bitis ? el('p', { sinif: 'ipucu' }, `${taksit.tur === 'sabit' ? 'Bitiş' : 'Tahmini bitiş'}: ${ayYaz(bitis)}`) : null,
    siradaki && siradaki.vade <= donem.bitis
      ? el('button', { type: 'button', onclick: () => taksitOdeFormu(siradaki, donem, taksitlerEkrani) }, '✓ Ödedim')
      : null,
    el('button', { type: 'button', sinif: 'ikincil', onclick: () => taksitDetayi(taksit.id) }, 'Ödeme geçmişi ve düzenle'),
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
  goster(
    ustBolum('Taksitler', anaEkran),
    bilgiSatiri(),
    el('button', { type: 'button', onclick: () => taksitFormu() }, '+ Taksit ekle'),
    devam.length
      ? el(
          'section',
          { sinif: 'kart vurgulu bosluk' },
          el('h2', {}, 'Önümüzdeki aylar'),
          el('p', { sinif: 'ipucu' }, `Gelecek ay: ${paraYaz(aylar[1].kurus)}`),
          aylar.map((a) => [satir(ayYaz(a.ay), paraYaz(a.kurus)), enBuyuk ? kategoriCubugu(a.kurus, enBuyuk) : null]),
        )
      : el('p', { sinif: 'ipucu bosluk' }, 'Devam eden taksit yok.'),
    devam.map((t) => taksitKarti(t, donem, bugun)),
    tamam.length ? el('h2', { sinif: 'bosluk' }, 'Tamamlandı') : null,
    tamam.map((t) => taksitKarti(t, donem, bugun)),
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
        ? [...odemeler].reverse().map((h) => el(
            'div',
            { sinif: 'kalem' },
            satir(tarihYaz(h.tarih), paraYaz(h.kurus)),
            h.baslangic === donem.baslangic
              ? el('button', {
                  type: 'button',
                  sinif: 'ikincil',
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
    el('option', { value: 'sabit', selected: mevcut?.tur !== 'degisken' }, 'Her ay aynı tutar (sabit)'),
    el('option', { value: 'degisken', selected: mevcut?.tur === 'degisken' }, 'Her ay farklı tutar (değişken)'),
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
    el('label', { htmlFor: 'tur' }, 'Taksit tipi'),
    tur,
    el('label', { htmlFor: 'sayi' }, 'Taksit sayısı (değişkende boş bırakabilirsin)'),
    el('input', { id: 'sayi', name: 'sayi', type: 'text', inputMode: 'numeric', autocomplete: 'off', placeholder: 'Örnek: 5', value: mevcut?.sayi ?? '' }),
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

function harcamaFormu(donem, mevcut = null, geri = anaEkran, ortakBaslangic = false) {
  const bugun = bugunTR();
  const hata = hataSatiri();
  const adlar = siraliKategoriler(veri);
  if (mevcut?.kategori && !adlar.includes(mevcut.kategori)) adlar.unshift(mevcut.kategori);
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
    tutarAlani('tutar', 'Tutar', mevcut ? paraYaz(mevcut.kurus) : ''),
    el('p', { sinif: 'etiket' }, 'Kategori'),
    secici.kutu,
    secici.yeniKutu,
    el('p', { sinif: 'ipucu' }, `Kategori seçmezsen “${DIGER}” sayılır.`),
    el('label', { htmlFor: 'not' }, 'Not (isteğe bağlı)'),
    notKutusu,
    el('label', { sinif: 'secim', htmlFor: 'ortak' }, ortakKutusu, el('span', {}, 'Ortak ev için aldım')),
    el('label', { htmlFor: 'tarih' }, 'Tarih'),
    el('input', { id: 'tarih', name: 'tarih', type: 'date', min: donem.baslangic, max: bugun, value: mevcut?.tarih ?? bugun }),
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
  goster(
    ustBolum('Harcamalar', tarih ? gecmisEkrani : anaEkran),
    bilgiSatiri(),
    el(
      'section',
      { sinif: 'kart vurgulu' },
      el('p', { sinif: 'etiket' }, tarih ? `${tarihYaz(tarih)} dönemi` : 'Bu dönem'),
      el('p', { sinif: 'tutar' }, paraYaz(toplam)),
      el('p', { sinif: 'ipucu' }, 'Fatura ödemeleri bu toplama dahil değil.'),
    ),
    tarih ? null : el('button', { type: 'button', onclick: () => harcamaFormu(donem, null, yenile) }, '+ Harcama'),
    toplamlar.length
      ? el(
          'section',
          { sinif: 'kart bosluk' },
          el('h2', {}, 'Kategoriler'),
          toplamlar.map((k) => [satir(k.ad, paraYaz(k.kurus)), kategoriCubugu(k.kurus, toplam)]),
        )
      : null,
    el(
      'section',
      { sinif: 'kart bosluk' },
      el('h2', {}, 'Kayıtlar'),
      kayitlar.length
        ? kayitlar.map((h) => el(
            'div',
            { sinif: 'kalem' },
            satir(h.kategori ?? DIGER, paraYaz(h.kurus)),
            el('p', { sinif: 'ipucu' }, [h.ortak ? 'Ortak ev' : null, h.not, tarihYaz(h.tarih)].filter(Boolean).join(' · ')),
            tarih ? null : el('button', { type: 'button', sinif: 'ikincil', onclick: () => harcamaFormu(donem, h, yenile) }, 'Düzenle'),
          ))
        : el('p', { sinif: 'ipucu' }, 'Henüz harcama yok.'),
    ),
    tarih ? null : el('button', { type: 'button', sinif: 'ikincil', onclick: kategorilerEkrani }, 'Kategorileri düzenle'),
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
      kategoriler(veri).map((ad) => el(
        'div',
        { sinif: 'kalem' },
        el('p', {}, el('strong', {}, ad)),
        el(
          'div',
          { sinif: 'ikili' },
          el('button', { type: 'button', sinif: 'ikincil', onclick: () => kategoriAdEkrani(ad) }, 'Ad değiştir'),
          el('button', {
            type: 'button',
            sinif: 'tehlike',
            onclick: () => {
              if (!window.confirm(`“${ad}” silinsin mi? Eski kayıtlar bu adla kalır.`)) return;
              kaydetVeUyar(kategoriSil(veri, ad));
              kategorilerEkrani();
            },
          }, 'Sil'),
        ),
      )),
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
      { sinif: 'kart vurgulu' },
      el('p', { sinif: 'etiket' }, tarih ? `${tarihYaz(tarih)} dönemi` : 'Bu dönem ev için aldıkların'),
      el('p', { sinif: 'tutar', id: 'ortak-toplam' }, paraYaz(ozet.harcanan)),
      ozet.kisiBasi !== null ? satir(`Kişi başı (${veri.ortakKisi} kişi)`, paraYaz(ozet.kisiBasi)) : null,
      ozet.geriAlinan ? satir('Geri aldım', paraYaz(ozet.geriAlinan)) : null,
      ozet.geriAlinan ? satir('Sende kalan masraf', paraYaz(ozet.kalan)) : null,
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
        ? liste.map((h) => el(
            'div',
            { sinif: 'kalem' },
            satir(h.not ?? h.kategori ?? DIGER, paraYaz(h.kurus)),
            el('p', { sinif: 'ipucu' }, tarihYaz(h.tarih)),
            tarih ? null : el('button', { type: 'button', sinif: 'ikincil', onclick: () => harcamaFormu(donem, h, yenile) }, 'Düzenle'),
          ))
        : el('p', { sinif: 'ipucu' }, 'Henüz ortak harcama yok.'),
    ),
    alinanlar.length
      ? el(
          'section',
          { sinif: 'kart' },
          el('h2', {}, 'Geri aldıkların'),
          alinanlar.map((h) => el(
            'div',
            { sinif: 'kalem' },
            satir(h.not ?? 'Geri aldım', paraYaz(h.kurus)),
            el('p', { sinif: 'ipucu' }, tarihYaz(h.tarih)),
            tarih
              ? null
              : el('button', {
                  type: 'button',
                  sinif: 'tehlike',
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
    el('label', { htmlFor: 'not' }, 'Not (isteğe bağlı)'),
    el('input', { id: 'not', name: 'not', maxLength: 80, placeholder: 'Örnek: 3 saat özel ders', value: mevcut?.not ?? '', autocomplete: 'off' }),
    el('label', { htmlFor: 'tarih' }, 'Tarih'),
    el('input', { id: 'tarih', name: 'tarih', type: 'date', min: donem.baslangic, max: bugun, value: mevcut?.tarih ?? bugun }),
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
      { sinif: 'kart vurgulu' },
      el('p', { sinif: 'etiket' }, tarih ? `${tarihYaz(tarih)} dönemi` : 'Bu dönem'),
      satir('Dönem başı parası', paraYaz(ozet.baslangic)),
      satir(EK_GELIR, paraYaz(ozet.ekGelir)),
      satir('Toplam', paraYaz(ozet.toplam)),
      el('p', { sinif: 'ipucu' }, 'Dönem başı parası, maaşla birlikte yazdığın tutardır.'),
    ),
    tarih ? null : el('button', { type: 'button', onclick: () => gelirFormu(donem, null, yenile) }, '+ Gelir'),
    el(
      'section',
      { sinif: 'kart bosluk' },
      el('h2', {}, 'Kayıtlar'),
      liste.length
        ? liste.map((h) => el(
            'div',
            { sinif: 'kalem' },
            satir(h.kaynak ?? EK_GELIR, paraYaz(h.kurus)),
            el('p', { sinif: 'ipucu' }, [h.not, tarihYaz(h.tarih)].filter(Boolean).join(' · ')),
            tarih ? null : el('button', { type: 'button', sinif: 'ikincil', onclick: () => gelirFormu(donem, h, yenile) }, 'Düzenle'),
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
      satir('Başlangıç parası', paraYaz(kayit.para)),
      satir('Gelir', paraYaz(hareketToplami(kayit, 'gelir'))),
      satir('Harcama', paraYaz(hareketToplami(kayit, 'harcama'))),
      satir('Faturalar', paraYaz(hareketToplami(kayit, 'fatura'))),
      satir('Taksitler', paraYaz(hareketToplami(kayit, 'taksit'))),
      (kayit.hareketler ?? []).filter((h) => h.tur === 'fatura' || h.tur === 'taksit').map((h) => el('p', { sinif: 'ipucu' }, `✓ ${h.ad}: ${paraYaz(h.kurus)}`)),
      satir('Dönem sonu', paraYaz(kalanPara(kayit))),
      hareketToplami(kayit, 'harcama')
        ? el('button', { type: 'button', sinif: 'ikincil bosluk', onclick: () => harcamalarEkrani(tarih) }, 'Harcamaları gör')
        : null,
      gelirListesi(kayit).length
        ? el('button', { type: 'button', sinif: 'ikincil', onclick: () => gelirlerEkrani(tarih) }, 'Gelirleri gör')
        : null,
      ortakListesi(kayit).length
        ? el('button', { type: 'button', sinif: 'ikincil', onclick: () => ortakEkrani(tarih) }, 'Ortak ev listesini gör')
        : null,
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
      el('button', { type: 'button', sinif: 'ikincil', onclick: maasGunuEkrani }, 'Maaş gününü değiştir'),
      el('button', { type: 'button', sinif: 'ikincil', onclick: () => kaydirmaEkrani(bugun) }, 'Sadece sıradaki maaş farklı günde'),
    ),
    el(
      'section',
      { sinif: 'kart' },
      el('h2', {}, 'Yedek'),
      el('button', { type: 'button', sinif: 'ikincil', onclick: yedekIndir }, 'Yedeği indir'),
      el('label', { sinif: 'dosya' }, 'Yedekten yükle', el('input', { type: 'file', accept: 'application/json,.json', onchange: yedekYukle })),
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
  return veri ? anaEkran() : kurulumEkrani();
}

window.addEventListener('beforeinstallprompt', (olay) => {
  olay.preventDefault();
  kurulumIstemi = olay;
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && kok.querySelector('#ana-para')) anaEkran();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

baslat();
