// Elindekini bozdurur (alış), hedefi alırsın (satış). TL'nin fiyatı 1 sayılır.

export const BIRIMLER = [
  { kod: 'TL', ad: 'TL', yazi: 'TL', ondalik: 2 },
  { kod: 'USD', ad: 'Dolar', yazi: 'dolar', ondalik: 2 },
  { kod: 'EUR', ad: 'Euro', yazi: 'euro', ondalik: 2 },
  { kod: 'GRA', ad: 'Gram altın', yazi: 'gram altın', ondalik: 3 },
  { kod: 'CEYREKALTIN', ad: 'Çeyrek altın', yazi: 'çeyrek', ondalik: 2, adetli: true },
  { kod: 'YARIMALTIN', ad: 'Yarım altın', yazi: 'yarım altın', ondalik: 2, adetli: true },
  { kod: 'TAMALTIN', ad: 'Tam altın', yazi: 'tam altın', ondalik: 2, adetli: true },
];

const TL = { alis: 1, satis: 1 };

export const birimBul = (kod) => BIRIMLER.find((b) => b.kod === kod);

function fiyatAl(kod, fiyatBul) {
  return kod === 'TL' ? TL : fiyatBul(kod);
}

// Elindeki miktarla eline ne geçer?
export function cevir(miktar, kaynak, hedef, fiyatBul) {
  const a = fiyatAl(kaynak, fiyatBul);
  const b = fiyatAl(hedef, fiyatBul);
  return a && b ? (miktar * a.alis) / b.satis : null;
}

// Aynı miktarı elde etmek için hedef biriminden ne kadar gerekir?
export function gerekli(miktar, kaynak, hedef, fiyatBul) {
  const a = fiyatAl(kaynak, fiyatBul);
  const b = fiyatAl(hedef, fiyatBul);
  return a && b ? (miktar * a.satis) / b.alis : null;
}
