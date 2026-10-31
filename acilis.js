// Açılış: logo parça parça kurulur, imza yazılır, sonra uygulama açılır. Dokununca hemen geçilir.

import { IMZA } from './imza.js';

const SURE = 3000;
const KISA_SURE = 900;
const IMZA_BAS = 1.6;
const IMZA_HIZ = 0.3;

const LOGO = `<svg class="a-logo" viewBox="0 0 320 300" aria-hidden="true">
  <defs>
    <linearGradient id="a-altin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbe9a9"/><stop offset=".5" stop-color="#ecc659"/><stop offset="1" stop-color="#c9952a"/></linearGradient>
    <linearGradient id="a-cep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d5a4d"/><stop offset="1" stop-color="#083a31"/></linearGradient>
    <clipPath id="a-kes"><rect width="320" height="232"/></clipPath>
  </defs>
  <g clip-path="url(#a-kes)">
    <g class="a-para">
      <circle cx="160" cy="134" r="88" fill="url(#a-altin)"/>
      <circle cx="160" cy="134" r="74" fill="none" stroke="#0a4238" stroke-opacity=".3" stroke-width="4"/>
      <path class="a-toplam" pathLength="1" d="M196 96h-68l40 38-40 38h68" fill="none" stroke="#0a4238" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </g>
  <g class="a-cep">
    <path d="M44 176c34 14 198 14 232 0v74a26 26 0 0 1-26 26H70a26 26 0 0 1-26-26z" fill="url(#a-cep)" stroke="#fff" stroke-opacity=".18" stroke-width="3"/>
    <path class="a-dikis" d="M60 196c30 10 170 10 200 0" fill="none" stroke="#ecc659" stroke-width="3" stroke-dasharray="9 8" stroke-linecap="round"/>
  </g>
</svg>`;

function imzaYolu() {
  const cizgiler = IMZA.cizgiler
    .map(({ yol, bas, sure }) => `<path pathLength="1" d="${yol}" style="--bas:${(IMZA_BAS + bas * IMZA_HIZ).toFixed(2)}s;--sure:${(sure * IMZA_HIZ).toFixed(3)}s"/>`)
    .join('');
  return `<span class="imza canli"><svg viewBox="0 0 ${IMZA.genislik} ${IMZA.yukseklik}">${cizgiler}</svg></span>`;
}

export function acilisGoster() {
  const perde = document.getElementById('acilis') ?? document.body.appendChild(document.createElement('div'));
  perde.id = 'acilis';
  perde.className = 'acilis';
  perde.setAttribute('role', 'img');
  perde.setAttribute('aria-label', 'Cüzdan, Mehmetnur Özkoç');
  perde.innerHTML = `${LOGO}${imzaYolu()}<p class="a-ad">Mehmetnur Özkoç</p>`;

  const sade = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let bitti = false;
  const kapat = () => {
    if (bitti) return;
    bitti = true;
    perde.classList.add('bitti');
    const sil = setTimeout(() => perde.remove(), 320);
    sil.unref?.();
  };
  perde.addEventListener('click', kapat);
  const sayac = setTimeout(kapat, sade ? KISA_SURE : SURE);
  sayac.unref?.();
}
