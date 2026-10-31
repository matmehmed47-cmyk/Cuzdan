import { hareketToplami, kalanPara, paraCoz, paraYaz, yaklasikAralik } from './para.js';
import {
  bugunTR,
  donemBul,
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
  dugum.append(...cocuklar.flat().filter((c) => c !== null && c !== undefined));
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
  kok.replaceChildren(...dugumler);
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
  const kalemler = donemKalemleri(veri, donem, bugun);
  const bekleyen = kalemler.filter(bekliyorMu);
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
      satir('Faturalara ayrıldı', paraYaz(ayrilan)),
      belirsiz ? el('p', { sinif: 'ipucu' }, `${belirsiz} faturanın tutarı henüz belli değil, hesaba katılmadı.`) : null,
      el('button', { type: 'button', sinif: 'ikincil', onclick: () => paraDuzelt(donem, kayit) }, 'Tutarı düzelt'),
    ),
    el(
      'div',
      { sinif: 'ikili' },
      el('button', { type: 'button', onclick: () => hareketEkrani('harcama', donem, kayit) }, '+ Harcama'),
      el('button', { type: 'button', onclick: () => hareketEkrani('gelir', donem, kayit) }, '+ Gelir'),
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
        : el('p', { sinif: 'ipucu' }, veri.faturalar?.length ? 'Bu dönem bekleyen ödeme yok.' : 'Henüz fatura eklemedin.'),
      bekleyen.length > 5 ? el('p', { sinif: 'ipucu' }, `${bekleyen.length - 5} ödeme daha var.`) : null,
      el('button', { type: 'button', sinif: 'ikincil bosluk', onclick: faturalarEkrani }, 'Faturalar'),
    ),
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
    dugmeler.push(el('button', { type: 'button', onclick: () => odemeBaslat(kalem, donem, bugun, geri) }, '✓ Ödedim'));
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

function hareketEkrani(tur, donem, kayit) {
  const baslik = tur === 'gelir' ? 'Gelir ekle' : 'Harcama ekle';
  const hata = hataSatiri();
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const kurus = paraCoz(form.elements.tutar.value);
        if (!kurus) return hataGoster(hata, 'Sıfırdan büyük bir tutar yaz. Örnek: 100 ya da 1.250,50');
        const hareketler = [...(kayit.hareketler ?? []), { tur, kurus, tarih: bugunTR() }];
        kaydetVeUyar({ ...veri, donemler: { ...veri.donemler, [donem.baslangic]: { ...kayit, hareketler } } });
        anaEkran();
      },
    },
    tutarAlani('tutar', 'Tutar'),
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
  );
  goster(ustBolum(baslik, anaEkran), form);
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
      (kayit.hareketler ?? []).filter((h) => h.tur === 'fatura').map((h) => el('p', { sinif: 'ipucu' }, `✓ ${h.ad}: ${paraYaz(h.kurus)}`)),
      satir('Dönem sonu', paraYaz(kalanPara(kayit))),
    );
  });
  const icerik = kartlar.length ? kartlar : [el('p', { sinif: 'ipucu' }, 'Henüz geçmiş dönem yok.')];
  goster(ustBolum('Geçmiş dönemler', anaEkran), ...icerik);
}

function paraDuzelt(donem, kayit) {
  const hata = hataSatiri();
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const yeni = paraCoz(form.elements.para.value);
        if (yeni === null) return hataGoster(hata, 'Tutarı örnekteki gibi yaz: 25.000 ya da 1.250,50');
        const para = kayit.para + yeni - kalanPara(kayit);
        kaydetVeUyar({ ...veri, donemler: { ...veri.donemler, [donem.baslangic]: { ...kayit, para } } });
        anaEkran();
      },
    },
    tutarAlani('para', 'Elindeki para', paraYaz(Math.max(kalanPara(kayit), 0))),
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
