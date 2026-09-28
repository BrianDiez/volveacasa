const pesos = new Intl.NumberFormat('es-UY', {
  style: 'currency', currency: 'UYU', minimumFractionDigits: 0, maximumFractionDigits: 0,
});

/** "$ 3.582" — el diseño usa punto de miles y espacio después del signo. */
export function money(n) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return pesos.format(Number(n)).replace('UYU', '$').replace(/\s+/g, ' ').trim();
}

export function fecha(iso, conHora = false) {
  if (!iso) return '—';
  const d = new Date(iso);
  const base = d.toLocaleDateString('es-UY', { day: 'numeric', month: 'long' });
  if (!conHora) return base;
  return `${base}, ${d.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}`;
}

export function haceCuanto(iso) {
  if (!iso) return '—';
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3.6e6);
  if (h < 1) return 'hace minutos';
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? '1 día' : `${d} días`;
}

export function iniciales(nombre = '') {
  return nombre.trim().split(/\s+/).slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase();
}

/** Color de avatar estable a partir del id/nombre — paleta del diseño. */
const AVATARES = ['#7A63A8', '#B57438', '#3E8578', '#B04A6A', '#3A4A5E', '#14202E'];
export function colorAvatar(clave = '') {
  let h = 0;
  for (let i = 0; i < clave.length; i++) h = (h * 31 + clave.charCodeAt(i)) >>> 0;
  return AVATARES[h % AVATARES.length];
}
