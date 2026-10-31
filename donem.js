// Tarihler 'YYYY-AA-GG' metni olarak tutulur. Bu metinler sıralanabilir.

const IS_GUNU_MS = 86400000;
const GENIS_ARALIK = 100;

function tarihYap(yil, ay, gun) {
  return `${yil}-${String(ay).padStart(2, '0')}-${String(gun).padStart(2, '0')}`;
}

export function bugunTR(an = new Date()) {
  const parcalar = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(an);
  const al = (tur) => Number(parcalar.find((p) => p.type === tur).value);
  return tarihYap(al('year'), al('month'), al('day'));
}

export function gunEkle(tarih, adet) {
  const [y, a, g] = tarih.split('-').map(Number);
  const sonuc = new Date(Date.UTC(y, a - 1, g) + adet * IS_GUNU_MS);
  return tarihYap(sonuc.getUTCFullYear(), sonuc.getUTCMonth() + 1, sonuc.getUTCDate());
}

export function gunFarki(ilk, son) {
  const sayi = (t) => {
    const [y, a, g] = t.split('-').map(Number);
    return Date.UTC(y, a - 1, g);
  };
  return Math.round((sayi(son) - sayi(ilk)) / IS_GUNU_MS);
}

export function ayinGunu(yil, ay, gun) {
  const ayUzunlugu = new Date(Date.UTC(yil, ay, 0)).getUTCDate();
  return tarihYap(yil, ay, Math.min(gun, ayUzunlugu));
}

export function ilkAyar(gun) {
  return { kurallar: [{ gecerli: '0000-01-01', gun }], kaydirma: {} };
}

function maasGunleri(ayar, bas, bit) {
  const kurallar = [...ayar.kurallar].sort((a, b) => a.gecerli.localeCompare(b.gecerli));
  const gunler = new Set();
  let [yil, ay] = gunEkle(bas, -62).split('-').map(Number);
  const [sonYil, sonAy] = gunEkle(bit, 62).split('-').map(Number);

  while (yil < sonYil || (yil === sonYil && ay <= sonAy)) {
    kurallar.forEach((kural, sira) => {
      const sonraki = kurallar[sira + 1];
      const aday = ayinGunu(yil, ay, kural.gun);
      if (aday >= kural.gecerli && (!sonraki || aday < sonraki.gecerli)) {
        gunler.add(ayar.kaydirma[aday] ?? aday);
      }
    });
    ay += 1;
    if (ay > 12) {
      ay = 1;
      yil += 1;
    }
  }
  return [...gunler].filter((g) => g >= bas && g <= bit).sort();
}

export function donemBul(ayar, bugun) {
  const gunler = maasGunleri(ayar, gunEkle(bugun, -GENIS_ARALIK), gunEkle(bugun, GENIS_ARALIK));
  const baslangic = gunler.filter((g) => g <= bugun).at(-1);
  const sonraki = gunler.find((g) => g > bugun);
  return { baslangic, sonraki, bitis: gunEkle(sonraki, -1) };
}

// Yeni gün yarından itibaren geçerli olur: başlamış dönem bozulmaz, sonraki maaş yeni günde gelir.
export function maasGunuDegistir(ayar, yeniGun, bugun) {
  const yarin = gunEkle(bugun, 1);
  const eskiler = ayar.kurallar.filter((k) => k.gecerli < yarin);
  if (eskiler.at(-1)?.gun === yeniGun && eskiler.length === ayar.kurallar.length) return ayar;
  return { ...ayar, kurallar: [...eskiler, { gecerli: yarin, gun: yeniGun }] };
}

export function kaydirmaSiniri(ayar, bugun) {
  const { sonraki } = donemBul(ayar, bugun);
  const sonrakiDonem = donemBul(ayar, sonraki);
  return { enErken: bugun, enGec: gunEkle(sonrakiDonem.sonraki, -1), sonraki };
}

// Sadece sıradaki maaşı taşır; sonraki aylarda normal gün geçerlidir.
export function maasKaydir(ayar, bugun, yeniTarih) {
  const { enErken, enGec, sonraki } = kaydirmaSiniri(ayar, bugun);
  if (yeniTarih < enErken || yeniTarih > enGec) return null;

  const asilGun =
    Object.keys(ayar.kaydirma).find((asil) => ayar.kaydirma[asil] === sonraki) ?? sonraki;
  const kaydirma = { ...ayar.kaydirma };
  if (yeniTarih === asilGun) delete kaydirma[asilGun];
  else kaydirma[asilGun] = yeniTarih;
  return { ...ayar, kaydirma };
}
