// Mide los tokens de la maqueta: contraste WCAG de cada par que se usa de
// verdad y cuánto se parece la marca a los colores de estado (ΔE2000).
//
//   node design-src/contrastes.mjs            → tabla en markdown
//   node design-src/contrastes.mjs --marca=frambuesa
//
// Sale con código 1 si un par queda por debajo de su mínimo, así que sirve de
// verificación y no sólo de informe. Los valores tienen que ser los mismos que
// los de `:root` en Maqueta.html; cuando exista `src/styles/tokens.css`, un
// test tiene que cruzarlos para que no se separen.

const marcas = {
  terracota: {
    marca: '#C2410C', 'marca-hover': '#9A3412', 'marca-tenue': '#FFF1E8',
    'marca-fondo': '#FFF7F2', 'marca-sobre-oscuro': '#F97316',
  },
  frambuesa: {
    marca: '#BE185D', 'marca-hover': '#9D174D', 'marca-tenue': '#FCE7F3',
    'marca-fondo': '#FDF2F8', 'marca-sobre-oscuro': '#F472B6',
  },
};

const base = {
  tinta: '#231A15', texto: '#6B5E55', 'texto-suave': '#7A6D65',
  fondo: '#F7F5F0', panel: '#FFFFFF', borde: '#E8E4DC', 'borde-fuerte': '#D6D0C3',
  perdido: '#B42318', 'perdido-fondo': '#FEE4E2',
  avistado: '#B54708', 'avistado-fondo': '#FEF0C7',
  encontrado: '#175CD3', 'encontrado-fondo': '#D1E9FF',
  adopcion: '#6941C6', 'adopcion-fondo': '#EBE9FE',
  resuelto: '#067647', 'resuelto-fondo': '#DCFAE6',
  grupo: '#231A15',
  whatsapp: '#25D366', 'whatsapp-texto': '#0B3D2E',
  'mapa-tierra': '#F2EFE9', 'mapa-agua': '#D8E6EC',
  blanco: '#FFFFFF',
};

// ── WCAG 2.x ─────────────────────────────────────────────────────────────────
const hexARgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lineal = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminancia = (h) => {
  const [r, g, b] = hexARgb(h).map(lineal);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contraste = (a, b) => {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

// ── CIEDE2000 ────────────────────────────────────────────────────────────────
// Cuánto se parecen dos colores a la vista. Debajo de ~10 se confunden de un
// vistazo; debajo de ~5, lado a lado cuesta distinguirlos.
const aLab = (h) => {
  const [r, g, b] = hexARgb(h).map(lineal);
  const X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const Y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
};
export const deltaE = (h1, h2) => {
  const [L1, a1, b1] = aLab(h1);
  const [L2, a2, b2] = aLab(h2);
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2);
  const Cm = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1, a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const h = (a, b) => { const v = Math.atan2(b, a) / rad; return v < 0 ? v + 360 : v; };
  const h1p = h(a1p, b1), h2p = h(a2p, b2);
  const dL = L2 - L1, dC = C2p - C1p;
  let dh = h2p - h1p;
  if (Math.abs(dh) > 180) dh -= 360 * Math.sign(dh);
  const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin((dh / 2) * rad);
  const Lm = (L1 + L2) / 2, Cmp = (C1p + C2p) / 2;
  let hm = h1p + h2p;
  if (Math.abs(h1p - h2p) > 180) hm += hm < 360 ? 360 : -360;
  hm /= 2;
  const T = 1 - 0.17 * Math.cos((hm - 30) * rad) + 0.24 * Math.cos(2 * hm * rad)
    + 0.32 * Math.cos((3 * hm + 6) * rad) - 0.2 * Math.cos((4 * hm - 63) * rad);
  const SL = 1 + (0.015 * (Lm - 50) ** 2) / Math.sqrt(20 + (Lm - 50) ** 2);
  const SC = 1 + 0.045 * Cmp, SH = 1 + 0.015 * Cmp * T;
  const RT = -2 * Math.sqrt(Cmp ** 7 / (Cmp ** 7 + 25 ** 7))
    * Math.sin(60 * Math.exp(-(((hm - 275) / 25) ** 2)) * rad);
  return Math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 + RT * (dC / SC) * (dH / SH));
};

// ── Los pares que se usan ────────────────────────────────────────────────────
// [primer plano, fondo, mínimo, para qué]. 4.5 es texto (AA); 3 es un gráfico
// o un ícono (WCAG 1.4.11), que es lo que pide un marcador contra el mapa.
const pares = [
  ['blanco', 'marca', 4.5, 'botón primario'],
  ['blanco', 'marca-hover', 4.5, 'botón primario, hover'],
  ['marca', 'fondo', 4.5, 'link sobre el fondo'],
  ['marca', 'panel', 4.5, 'link sobre una tarjeta'],
  ['marca', 'marca-tenue', 4.5, 'botón suave'],
  ['marca-sobre-oscuro', 'tinta', 4.5, 'acción sobre la barra oscura'],
  ['tinta', 'fondo', 4.5, 'títulos'],
  ['texto', 'fondo', 4.5, 'texto'],
  ['texto', 'panel', 4.5, 'texto en tarjeta'],
  ['texto-suave', 'fondo', 4.5, 'texto suave'],
  ['texto-suave', 'panel', 4.5, 'texto suave en tarjeta'],
  ['blanco', 'tinta', 4.5, 'texto sobre la barra y el pie'],
  ['perdido', 'perdido-fondo', 4.5, 'insignia PERDIDO'],
  ['avistado', 'avistado-fondo', 4.5, 'insignia AVISTADO'],
  ['encontrado', 'encontrado-fondo', 4.5, 'insignia ENCONTRADO'],
  ['adopcion', 'adopcion-fondo', 4.5, 'insignia EN ADOPCIÓN'],
  ['resuelto', 'resuelto-fondo', 4.5, 'insignia ¡VOLVIÓ A CASA!'],
  ['blanco', 'perdido', 4.5, 'cinta sobre la foto'],
  ['blanco', 'avistado', 4.5, 'cinta sobre la foto'],
  ['blanco', 'encontrado', 4.5, 'cinta sobre la foto'],
  ['blanco', 'adopcion', 4.5, 'cinta sobre la foto'],
  ['blanco', 'resuelto', 4.5, 'cinta sobre la foto'],
  ['whatsapp-texto', 'whatsapp', 4.5, 'botón Contactar por WhatsApp'],
  ...['perdido', 'avistado', 'encontrado', 'adopcion', 'grupo'].flatMap((t) => [
    [t, 'mapa-tierra', 3, 'marcador sobre tierra'],
    [t, 'mapa-agua', 3, 'marcador sobre agua'],
  ]),
  ['blanco', 'grupo', 4.5, 'número del grupo'],
];

// La marca contra los estados con los que se puede confundir.
const parecidos = ['perdido', 'avistado', 'adopcion', 'resuelto'];

const arg = process.argv.find((a) => a.startsWith('--marca='));
const elegidas = arg ? [arg.split('=')[1]] : Object.keys(marcas);
let fallas = 0;

for (const nombre of elegidas) {
  const t = { ...base, ...marcas[nombre] };
  console.log(`\n### Marca ${nombre} (${t.marca})\n`);
  console.log('| Par | Colores | Contraste | Mínimo | Uso |');
  console.log('|---|---|---|---|---|');
  for (const [a, b, min, uso] of pares) {
    const c = contraste(t[a], t[b]);
    const ok = c >= min;
    if (!ok) fallas++;
    console.log(`| \`${a}\` / \`${b}\` | ${t[a]} / ${t[b]} | ${c.toFixed(2)}${ok ? '' : ' ✗'} | ${min} | ${uso} |`);
  }
  console.log('\n| Marca contra | ΔE2000 | Lectura |');
  console.log('|---|---|---|');
  for (const e of parecidos) {
    const d = deltaE(t.marca, t[e]);
    const lectura = d < 5 ? 'se confunden lado a lado' : d < 10 ? 'se confunden de un vistazo' : d < 20 ? 'parientes, se distinguen' : 'distintos';
    console.log(`| ${e} ${t[e]} | ${d.toFixed(1)} | ${lectura} |`);
  }
}

if (fallas) {
  console.error(`\n${fallas} par(es) por debajo del mínimo.`);
  process.exit(1);
}
