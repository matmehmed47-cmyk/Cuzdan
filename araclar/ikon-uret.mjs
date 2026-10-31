import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const ZEMIN = [23, 107, 91];
const CUZDAN = [244, 246, 244];
const KOPCA = [23, 107, 91];

function crc(tampon) {
  let deger = ~0;
  for (const bayt of tampon) {
    deger ^= bayt;
    for (let i = 0; i < 8; i += 1) deger = (deger >>> 1) ^ (0xedb88320 & -(deger & 1));
  }
  return ~deger >>> 0;
}

function parca(tur, icerik) {
  const uzunluk = Buffer.alloc(4);
  uzunluk.writeUInt32BE(icerik.length);
  const gövde = Buffer.concat([Buffer.from(tur), icerik]);
  const kontrol = Buffer.alloc(4);
  kontrol.writeUInt32BE(crc(gövde));
  return Buffer.concat([uzunluk, gövde, kontrol]);
}

function renk(x, y) {
  const cuzdanIci = x >= 0.2 && x <= 0.8 && y >= 0.3 && y <= 0.72;
  const kopca = x >= 0.62 && x <= 0.8 && y >= 0.45 && y <= 0.57;
  if (kopca) return KOPCA;
  return cuzdanIci ? CUZDAN : ZEMIN;
}

function png(boyut) {
  const satirlar = Buffer.alloc((boyut * 3 + 1) * boyut);
  let konum = 0;
  for (let y = 0; y < boyut; y += 1) {
    satirlar[konum] = 0;
    konum += 1;
    for (let x = 0; x < boyut; x += 1) {
      const [k, y2, m] = renk((x + 0.5) / boyut, (y + 0.5) / boyut);
      satirlar[konum] = k;
      satirlar[konum + 1] = y2;
      satirlar[konum + 2] = m;
      konum += 3;
    }
  }
  const bilgi = Buffer.alloc(13);
  bilgi.writeUInt32BE(boyut, 0);
  bilgi.writeUInt32BE(boyut, 4);
  bilgi[8] = 8;
  bilgi[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    parca('IHDR', bilgi),
    parca('IDAT', deflateSync(satirlar)),
    parca('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(new URL('../ikon/', import.meta.url), { recursive: true });
for (const boyut of [180, 192, 512]) {
  writeFileSync(new URL(`../ikon/ikon-${boyut}.png`, import.meta.url), png(boyut));
}
