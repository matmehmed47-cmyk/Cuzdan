import { paraCoz, paraYaz } from './para.js';
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
          donemler: { [donem.baslangic]: { para } },
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

function yeniDonemEkrani(donem) {
  const hata = hataSatiri();
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const para = paraCoz(form.elements.para.value);
        if (para === null) return hataGoster(hata, 'Tutarı örnekteki gibi yaz: 25.000 ya da 1.250,50');
        kaydetVeUyar({ ...veri, donemler: { ...veri.donemler, [donem.baslangic]: { para } } });
        anaEkran();
      },
    },
    tutarAlani('para', 'Bu dönem elindeki parayı yaz'),
    el('p', { sinif: 'ipucu' }, `${tarihYaz(donem.baslangic)} – ${tarihYaz(donem.bitis)}`),
    hata,
    el('button', { type: 'submit' }, 'Kaydet'),
  );
  goster(ustBolum(veri.ad), bilgiSatiri(), el('h2', {}, 'Yeni dönem başladı'), form);
}

function anaEkran() {
  const bugun = bugunTR();
  const donem = donemBul(veri.ayar, bugun);
  const kayit = veri.donemler[donem.baslangic];
  if (!kayit) return yeniDonemEkrani(donem);

  const kalanGun = gunFarki(bugun, donem.sonraki);
  goster(
    ustBolum(veri.ad),
    bilgiSatiri(),
    el(
      'section',
      { sinif: 'kart vurgulu' },
      el('p', { sinif: 'etiket' }, 'Param'),
      el('p', { sinif: 'tutar', id: 'ana-para' }, paraYaz(kayit.para)),
      el('button', { type: 'button', sinif: 'ikincil', onclick: () => paraDuzelt(donem, kayit) }, 'Tutarı düzelt'),
    ),
    el(
      'section',
      { sinif: 'kart' },
      el('p', { sinif: 'etiket' }, 'Bu dönem'),
      el('p', {}, `${tarihYaz(donem.baslangic)} – ${tarihYaz(donem.bitis)}`),
      el('p', { sinif: 'ipucu' }, `Sonraki maaş: ${tarihYaz(donem.sonraki)} (${kalanGun} gün kaldı)`),
    ),
    el('p', { sinif: 'ipucu orta' }, 'Veriler şimdilik sadece bu cihazda duruyor.'),
  );
}

function paraDuzelt(donem, kayit) {
  const hata = hataSatiri();
  const form = el(
    'form',
    {
      onsubmit: (o) => {
        o.preventDefault();
        const para = paraCoz(form.elements.para.value);
        if (para === null) return hataGoster(hata, 'Tutarı örnekteki gibi yaz: 25.000 ya da 1.250,50');
        kaydetVeUyar({ ...veri, donemler: { ...veri.donemler, [donem.baslangic]: { ...kayit, para } } });
        anaEkran();
      },
    },
    tutarAlani('para', 'Elindeki para', paraYaz(kayit.para)),
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
