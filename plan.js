// Büyük masraf için kenara ayrılan para dönemlere bağlı değildir, köşedeki para gibi serbest paradan ayrı durur.

export function kenardaPara(veri) {
  return (veri.kose ?? 0) + (veri.planlar ?? []).reduce((t, p) => t + p.ayrilan, 0);
}

function ayFarki(ilk, son) {
  const [y1, a1] = ilk.split('-').map(Number);
  const [y2, a2] = son.split('-').map(Number);
  return (y2 - y1) * 12 + a2 - a1;
}

// O ay da sayılır: kasımdan ocağa üç kez ayrılabilir.
export function planDurumu(plan, bugun) {
  const kalan = Math.max(plan.hedef - plan.ayrilan, 0);
  const kalanAy = Math.max(ayFarki(bugun.slice(0, 7), plan.ay), 0) + 1;
  return { kalan, kalanAy, aylik: Math.ceil(kalan / kalanAy) };
}

export function planEkle(veri, plan) {
  return { ...veri, planlar: [...(veri.planlar ?? []), { ...plan, ayrilan: 0 }] };
}

export function planAyir(veri, id, kurus) {
  return { ...veri, planlar: veri.planlar.map((p) => (p.id === id ? { ...p, ayrilan: p.ayrilan + kurus } : p)) };
}

export function planKapat(veri, id) {
  return { ...veri, planlar: veri.planlar.filter((p) => p.id !== id) };
}
