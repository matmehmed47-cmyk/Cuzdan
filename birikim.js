// Birikimler dönemlere bağlı değildir, hiç sıfırlanmaz. Miktar binde bir birimle tam sayı tutulur (2,5 gram = 2500).

export const TURLER = {
  gram: { ad: 'Gram altın', birim: 'gram', kod: 'GRA', ondalik: 3, altin: true },
  ceyrek: { ad: 'Çeyrek altın', birim: 'adet', kod: 'CEYREKALTIN', ondalik: 0, altin: true },
  yarim: { ad: 'Yarım altın', birim: 'adet', kod: 'YARIMALTIN', ondalik: 0, altin: true },
  tam: { ad: 'Tam altın', birim: 'adet', kod: 'TAMALTIN', ondalik: 0, altin: true },
  cumhuriyet: { ad: 'Cumhuriyet altını', birim: 'adet', kod: 'CUMHURIYETALTINI', ondalik: 0, altin: true },
  dolar: { ad: 'Dolar', birim: 'dolar', kod: 'USD', ondalik: 2, altin: false },
  euro: { ad: 'Euro', birim: 'euro', kod: 'EUR', ondalik: 2, altin: false },
};

const EN_BUYUK = 999999999999;

export function miktarCoz(metin, tur) {
  const temiz = String(metin ?? '').replace(/\s/g, '');
  const { ondalik } = TURLER[tur];
  const eslesme =
    temiz.match(/^(\d{1,3}(?:\.\d{3})+)(?:,(\d+))?$/) ?? temiz.match(/^(\d+)(?:[,.](\d+))?$/);
  if (!eslesme) return null;
  const kesir = eslesme[2] ?? '';
  if (kesir.length > ondalik) return null;
  const sonuc = Number(eslesme[1].replaceAll('.', '')) * 1000 + Number(kesir.padEnd(3, '0'));
  return sonuc > 0 && Number.isSafeInteger(sonuc) && sonuc <= EN_BUYUK ? sonuc : null;
}

export function miktarSayi(miktar) {
  const tam = String(Math.floor(miktar / 1000)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const kesir = String(miktar % 1000).padStart(3, '0').replace(/0+$/, '');
  return kesir ? `${tam},${kesir}` : tam;
}

export function miktarYaz(miktar, tur) {
  return `${miktarSayi(miktar)} ${TURLER[tur].birim}`;
}

function isaretli(kayit) {
  return kayit.islem === 'satis' ? -kayit.miktar : kayit.miktar;
}

export function eldeki(veri, tur) {
  return (veri.birikimler ?? []).filter((b) => b.tur === tur).reduce((t, b) => t + isaretli(b), 0);
}

export function turKayitlari(veri, tur) {
  return (veri.birikimler ?? [])
    .filter((b) => b.tur === tur)
    .sort((a, b) => b.tarih.localeCompare(a.tarih));
}

export function kullanilanTurler(veri) {
  return Object.keys(TURLER).filter((tur) => veri.birikimler?.some((b) => b.tur === tur));
}

// Alış fiyatı kullanılır: elindekini bozdurursan alacağın para budur.
export function bugunkuDeger(miktar, fiyat) {
  return Math.round((miktar * fiyat) / 10);
}

function hareketEkle(veri, baslangic, hareket) {
  const kayit = veri.donemler[baslangic];
  const hareketler = [...(kayit.hareketler ?? []), hareket];
  return { ...veri, donemler: { ...veri.donemler, [baslangic]: { ...kayit, hareketler } } };
}

// baslangic verilmezse eski birikimdir, paradan düşmez.
export function birikimEkle(veri, baslangic, kayit) {
  const yeni = { ...veri, birikimler: [...(veri.birikimler ?? []), { ...kayit, islem: 'alis', paradan: baslangic ? true : undefined }] };
  if (!baslangic) return yeni;
  return hareketEkle(yeni, baslangic, {
    tur: 'birikim',
    kurus: kayit.kurus,
    tarih: kayit.tarih,
    birikimId: kayit.id,
    ad: TURLER[kayit.tur].ad,
  });
}

export function satisEkle(veri, baslangic, kayit) {
  if (kayit.miktar > eldeki(veri, kayit.tur)) return null;
  const yeni = { ...veri, birikimler: [...(veri.birikimler ?? []), { ...kayit, islem: 'satis', paradan: true }] };
  return hareketEkle(yeni, baslangic, {
    tur: 'satis',
    kurus: kayit.kurus,
    tarih: kayit.tarih,
    birikimId: kayit.id,
    ad: TURLER[kayit.tur].ad,
  });
}

// Silinince elde eksi miktar kalacaksa işlem yapılmaz, null döner.
export function birikimSil(veri, id) {
  const kayit = veri.birikimler.find((b) => b.id === id);
  if (kayit.islem === 'alis' && eldeki(veri, kayit.tur) < kayit.miktar) return null;
  const donemler = Object.fromEntries(
    Object.entries(veri.donemler).map(([tarih, donem]) => [
      tarih,
      donem.hareketler?.some((h) => h.birikimId === id)
        ? { ...donem, hareketler: donem.hareketler.filter((h) => h.birikimId !== id) }
        : donem,
    ]),
  );
  return { ...veri, donemler, birikimler: veri.birikimler.filter((b) => b.id !== id) };
}

export function yillar(veri, tur) {
  return [...new Set(turKayitlari(veri, tur).map((b) => b.tarih.slice(0, 4)))].sort().reverse();
}

// Her ayın satırında o aya kadarki toplam da gelir; böylece önceki aylar üstüne eklenerek görünür.
export function aylikOzet(veri, tur, yil) {
  const aylar = new Map();
  for (const kayit of turKayitlari(veri, tur)) {
    const ay = kayit.tarih.slice(0, 7);
    const satir = aylar.get(ay) ?? { ay, alinan: 0, satilan: 0 };
    satir[kayit.islem === 'satis' ? 'satilan' : 'alinan'] += kayit.miktar;
    aylar.set(ay, satir);
  }
  let toplam = 0;
  const sirali = [...aylar.values()].sort((a, b) => a.ay.localeCompare(b.ay));
  const hepsi = sirali.map((satir) => {
    toplam += satir.alinan - satir.satilan;
    return { ...satir, toplam };
  });
  const secili = hepsi.filter((s) => s.ay.startsWith(yil));
  return {
    aylar: secili,
    alinan: secili.reduce((t, s) => t + s.alinan, 0),
    satilan: secili.reduce((t, s) => t + s.satilan, 0),
  };
}

export function ayAlinanlar(veri, ay) {
  return Object.keys(TURLER)
    .map((tur) => ({
      tur,
      miktar: (veri.birikimler ?? [])
        .filter((b) => b.tur === tur && b.islem === 'alis' && b.tarih.startsWith(ay))
        .reduce((t, b) => t + b.miktar, 0),
    }))
    .filter((k) => k.miktar > 0);
}
