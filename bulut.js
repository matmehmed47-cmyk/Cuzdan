// Sunucuyla konuşan tek dosya. Yayın anahtarı gizli değildir; erişimi veritabanı kuralları sınırlar.

const ADRES = 'https://gdvkpezwxlyhlueihiqv.supabase.co';
const ANAHTAR = 'sb_publishable_BR84w6rXInIsB82M6psoWg_GlTH8dGi';
const GERI_DONUS = 'https://matmehmed47-cmyk.github.io/Cuzdan/';
export const VAPID_ACIK = 'BNl3Fy-b1z3ZaYaCfEWnxK3molMak9QYgf4Np_RIfddoFgvyuq96UJS4bANue_iNjGWbrmqO74nwcykUltNB2dM';
const OTURUM = 'cuzdan.oturum';
const ESITLEME = 'cuzdan.esitleme';

export class BulutHatasi extends Error {
  constructor(metin, kod) {
    super(metin);
    this.kod = kod;
  }
}

const HATALAR = {
  invalid_credentials: 'E-posta ya da şifre yanlış.',
  user_already_exists: 'Bu e-postayla zaten hesap var. Giriş yapmayı dene.',
  email_exists: 'Bu e-postayla zaten hesap var. Giriş yapmayı dene.',
  weak_password: 'Şifre en az 8 karakter olmalı.',
  validation_failed: 'E-posta adresini kontrol et.',
  email_address_invalid: 'E-posta adresini kontrol et.',
  over_email_send_rate_limit: 'Çok sık denendi. Bir saat sonra yeniden dene.',
  over_request_rate_limit: 'Çok sık denendi. Biraz sonra yeniden dene.',
};

function oku(ad) {
  try {
    return JSON.parse(localStorage.getItem(ad));
  } catch {
    return null;
  }
}

function yaz(ad, deger) {
  try {
    if (deger === null) localStorage.removeItem(ad);
    else localStorage.setItem(ad, JSON.stringify(deger));
  } catch {
    // Yazılamazsa oturum bir sonraki açılışta yeniden istenir.
  }
}

export const oturum = () => oku(OTURUM);
export const esitlemeDurumu = () => oku(ESITLEME) ?? { surum: 0, kirli: false };
export const esitlemeYaz = (durum) => yaz(ESITLEME, durum);

function oturumKaydet(cevap) {
  const yeni = {
    erisim: cevap.access_token,
    yenileme: cevap.refresh_token,
    bitis: Date.now() + cevap.expires_in * 1000,
    id: cevap.user.id,
    eposta: cevap.user.email,
  };
  yaz(OTURUM, yeni);
  return yeni;
}

async function istek(yol, ayar = {}, erisim = null) {
  let cevap;
  try {
    cevap = await window.fetch(ADRES + yol, {
      ...ayar,
      headers: { apikey: ANAHTAR, 'Content-Type': 'application/json', ...(erisim ? { Authorization: `Bearer ${erisim}` } : {}), ...ayar.headers },
    });
  } catch {
    throw new BulutHatasi('İnternet bağlantısı yok.', 'baglanti');
  }
  const metin = await cevap.text();
  const govde = metin ? JSON.parse(metin) : null;
  if (!cevap.ok) {
    const kod = govde?.error_code ?? govde?.code ?? govde?.error ?? String(cevap.status);
    throw new BulutHatasi(HATALAR[kod] ?? 'İşlem yapılamadı, yeniden dene.', kod);
  }
  return govde;
}

export async function kayitOl(eposta, sifre) {
  const cevap = await istek('/auth/v1/signup', { method: 'POST', body: JSON.stringify({ email: eposta, password: sifre }) });
  return oturumKaydet(cevap);
}

export async function girisYap(eposta, sifre) {
  return oturumKaydet(await istek('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email: eposta, password: sifre }) }));
}

async function erisimAl() {
  const simdiki = oturum();
  if (!simdiki) throw new BulutHatasi('Giriş gerekli.', 'oturum');
  if (simdiki.bitis - Date.now() > 60000) return simdiki;
  try {
    return oturumKaydet(await istek('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: simdiki.yenileme }) }));
  } catch (hata) {
    if (hata.kod !== 'baglanti') yaz(OTURUM, null);
    throw hata;
  }
}

export async function cikisYap() {
  const simdiki = oturum();
  yaz(OTURUM, null);
  yaz(ESITLEME, null);
  if (simdiki) await istek('/auth/v1/logout', { method: 'POST' }, simdiki.erisim).catch(() => {});
}

export function sifreBaglantisi(eposta) {
  return istek(`/auth/v1/recover?redirect_to=${encodeURIComponent(GERI_DONUS)}`, { method: 'POST', body: JSON.stringify({ email: eposta }) });
}

export async function sifreDegistir(sifre, erisim = null) {
  const anahtar = erisim ?? (await erisimAl()).erisim;
  await istek('/auth/v1/user', { method: 'PUT', body: JSON.stringify({ password: sifre }) }, anahtar);
}

export async function baglantiOturumu(erisim, yenileme) {
  const kullanici = await istek('/auth/v1/user', {}, erisim);
  return oturumKaydet({ access_token: erisim, refresh_token: yenileme, expires_in: 3000, user: kullanici });
}

export async function uzaktanOku() {
  const { erisim } = await erisimAl();
  const satirlar = await istek('/rest/v1/cuzdanlar?select=veri,surum', {}, erisim);
  return satirlar[0] ?? null;
}

// Başka cihaz araya girdiyse -1 döner.
export async function uzagaYaz(veri, beklenen) {
  const { erisim } = await erisimAl();
  return istek('/rest/v1/rpc/cuzdan_kaydet', { method: 'POST', body: JSON.stringify({ yeni: veri, beklenen }) }, erisim);
}

export async function hesapSil() {
  const { erisim } = await erisimAl();
  await istek('/rest/v1/rpc/hesabimi_sil', { method: 'POST', body: '{}' }, erisim);
  yaz(OTURUM, null);
  yaz(ESITLEME, null);
}

export async function planGonder(plan) {
  const { erisim, id } = await erisimAl();
  await istek('/rest/v1/bildirim_planlari?on_conflict=kullanici', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ kullanici: id, plan, guncellendi: new Date().toISOString() }),
  }, erisim);
}

// Verki sohbeti: soru ve dönem özeti sunucuya gider, anahtar yalnız sunucuda durur.
export async function verkiSor(mesajlar, ozet) {
  const { erisim } = await erisimAl();
  let cevap;
  try {
    cevap = await window.fetch(`${ADRES}/functions/v1/verki`, {
      method: 'POST',
      headers: { apikey: ANAHTAR, 'Content-Type': 'application/json', Authorization: `Bearer ${erisim}` },
      body: JSON.stringify({ mesajlar, ozet }),
    });
  } catch {
    throw new BulutHatasi('İnternet bağlantısı yok.', 'baglanti');
  }
  const govde = await cevap.json().catch(() => null);
  if (!cevap.ok || !govde?.cevap) {
    const kod = govde?.hata ?? String(cevap.status);
    throw new BulutHatasi(kod === 'sinir' ? 'Bugünkü soru hakkın doldu, yarın yine sorabilirsin.' : 'Verki şu an cevap veremiyor.', kod);
  }
  return govde;
}

export async function verkiDefteriOku() {
  const { erisim } = await erisimAl();
  return istek('/rest/v1/verki_defteri?select=id,metin&order=id', {}, erisim);
}

export async function verkiDefteriSil(id) {
  const { erisim } = await erisimAl();
  await istek(`/rest/v1/verki_defteri?id=eq.${Number(id)}`, { method: 'DELETE' }, erisim);
}

export async function gonderilenleriOku() {
  const { erisim } = await erisimAl();
  const satirlar = await istek('/rest/v1/bildirim_planlari?select=gonderilen', {}, erisim);
  return satirlar[0]?.gonderilen ?? [];
}

export async function abonelikKaydet(abonelik) {
  const { erisim, id } = await erisimAl();
  const { endpoint, keys } = abonelik.toJSON();
  await istek('/rest/v1/bildirim_abonelikleri?on_conflict=endpoint', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ endpoint, kullanici: id, p256dh: keys.p256dh, auth: keys.auth }),
  }, erisim);
}
