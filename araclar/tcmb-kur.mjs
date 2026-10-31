// Merkez Bankası sayfası telefondan doğrudan okunamaz; bu araç kuru tcmb.json dosyasına yazar.
import { writeFile } from 'node:fs/promises';

const cevap = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml');
if (!cevap.ok) throw new Error(`TCMB cevap vermedi: ${cevap.status}`);
const xml = await cevap.text();

const tarih = /Tarih="(\d{2})\.(\d{2})\.(\d{4})"/.exec(xml);
if (!tarih) throw new Error('Tarih okunamadı');

function kur(kod) {
  const blok = new RegExp(`<Currency[^>]*Kod="${kod}"[\\s\\S]*?</Currency>`).exec(xml)?.[0] ?? '';
  const alis = Number(/<ForexBuying>([\d.]+)</.exec(blok)?.[1]);
  const satis = Number(/<ForexSelling>([\d.]+)</.exec(blok)?.[1]);
  if (!(alis > 0 && satis > 0)) throw new Error(`${kod} okunamadı`);
  return { alis, satis };
}

const sonuc = { tarih: `${tarih[3]}-${tarih[2]}-${tarih[1]}`, USD: kur('USD'), EUR: kur('EUR') };
await writeFile(new URL('../tcmb.json', import.meta.url), `${JSON.stringify(sonuc, null, 2)}\n`);
console.log(sonuc);
