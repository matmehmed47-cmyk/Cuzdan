// Borç: ben ödeyeceğim. Alacak: bana ödenecek. Kayıt parayı değiştirmez, para yalnız kullanıcı isterse hareket olur.

function hareketEkle(veri, baslangic, hareket) {
  const kayit = veri.donemler[baslangic];
  return {
    ...veri,
    donemler: { ...veri.donemler, [baslangic]: { ...kayit, hareketler: [...(kayit.hareketler ?? []), hareket] } },
  };
}

export function defterDurumu(kayit) {
  const odenen = (kayit.odemeler ?? []).reduce((t, o) => t + o.kurus, 0);
  return { odenen, kalan: Math.max(kayit.kurus - odenen, 0) };
}

export function defterOzet(veri) {
  const toplam = (yon) => (veri.defter ?? []).filter((k) => k.yon === yon).reduce((t, k) => t + defterDurumu(k).kalan, 0);
  return { borc: toplam('borc'), alacak: toplam('alacak') };
}

// baslangic verilirse para o an el değiştirmiştir: alacak verince paradan düşer, borç alınca paraya eklenir.
export function defterEkle(veri, kayit, baslangic = null) {
  const yeni = { ...veri, defter: [...(veri.defter ?? []), kayit] };
  if (!baslangic) return yeni;
  return hareketEkle(yeni, baslangic, {
    tur: kayit.yon === 'alacak' ? 'defter' : 'tahsil',
    kurus: kayit.kurus,
    tarih: kayit.tarih,
    defterId: kayit.id,
    ad: kayit.kisi,
  });
}

export function defterOde(veri, id, odeme, baslangic = null) {
  const kayit = veri.defter.find((k) => k.id === id);
  if (odeme.kurus > defterDurumu(kayit).kalan) return null;
  const yeni = {
    ...veri,
    defter: veri.defter.map((k) => (k.id === id ? { ...k, odemeler: [...(k.odemeler ?? []), odeme] } : k)),
  };
  if (!baslangic) return yeni;
  return hareketEkle(yeni, baslangic, {
    tur: kayit.yon === 'borc' ? 'defter' : 'tahsil',
    kurus: odeme.kurus,
    tarih: odeme.tarih,
    defterId: id,
    odemeId: odeme.id,
    ad: kayit.kisi,
  });
}

function hareketleriCikar(veri, kosul) {
  const donemler = Object.fromEntries(
    Object.entries(veri.donemler).map(([tarih, donem]) => [
      tarih,
      donem.hareketler?.some(kosul) ? { ...donem, hareketler: donem.hareketler.filter((h) => !kosul(h)) } : donem,
    ]),
  );
  return { ...veri, donemler };
}

export function defterOdemeSil(veri, id, odemeId) {
  const yeni = {
    ...veri,
    defter: veri.defter.map((k) => (k.id === id ? { ...k, odemeler: k.odemeler.filter((o) => o.id !== odemeId) } : k)),
  };
  return hareketleriCikar(yeni, (h) => h.defterId === id && h.odemeId === odemeId);
}

export function defterSil(veri, id) {
  return hareketleriCikar({ ...veri, defter: veri.defter.filter((k) => k.id !== id) }, (h) => h.defterId === id);
}
