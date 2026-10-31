// Sesler dosyadan çalınır. Tarayıcı dokunuştan önce sese izin vermeyebilir; o zaman sessizce geçilir.

const DOSYALAR = { acilis: './ses/acilis.mp3', kazanc: './ses/kazanc.mp3' };
const tamponlar = {};
let baglam = null;
let acik = true;

export function sesAyarla(durum) {
  acik = durum;
}

async function hazirla() {
  const Baglam = window.AudioContext ?? window.webkitAudioContext;
  if (!Baglam || !window.fetch) return false;
  baglam ??= new Baglam();
  await Promise.all(
    Object.entries(DOSYALAR).map(async ([ad, yol]) => {
      if (tamponlar[ad]) return;
      const cevap = await window.fetch(yol);
      tamponlar[ad] = await baglam.decodeAudioData(await cevap.arrayBuffer());
    }),
  );
  return true;
}

export async function sesCal(ad) {
  if (!acik) return false;
  try {
    if (!(await hazirla())) return false;
    if (baglam.state === 'suspended') await Promise.race([baglam.resume(), new Promise((bitti) => { setTimeout(bitti, 200); })]);
    if (baglam.state !== 'running') return false;
    const kaynak = baglam.createBufferSource();
    kaynak.buffer = tamponlar[ad];
    kaynak.connect(baglam.destination);
    kaynak.start();
    return true;
  } catch {
    return false;
  }
}
