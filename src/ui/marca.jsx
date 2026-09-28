/**
 * La marca de Volvé a casa y el crédito a bagayí.
 *
 * El isotipo es el de la maqueta aprobada (una casita con una huella): es
 * provisorio, el vectorial final lo trae el dueño (BRIEF §10.2). Va en SVG y
 * no como imagen para que escale sin pixelarse y tome el color de la marca.
 */
export function Isotipo({ tam = 28 }) {
  return (
    <span aria-hidden="true" style={{
      width: tam, height: tam, borderRadius: Math.round(tam * 0.28), flex: 'none',
      background: 'var(--marca)', display: 'grid', placeItems: 'center',
    }}>
      <svg width={Math.round(tam * 0.78)} height={Math.round(tam * 0.78)} viewBox="0 0 32 32">
        <path d="M5 15.2L16 6l11 9.2V26.3a1.7 1.7 0 01-1.7 1.7H6.7A1.7 1.7 0 015 26.3z" fill="#fff" />
        <g fill="var(--marca)">
          <ellipse cx="16" cy="22.2" rx="3.9" ry="3.2" />
          <circle cx="11.3" cy="17.6" r="1.6" /><circle cx="14.3" cy="15.3" r="1.6" />
          <circle cx="17.7" cy="15.3" r="1.6" /><circle cx="20.7" cy="17.6" r="1.6" />
        </g>
      </svg>
    </span>
  );
}

/** El logo en línea: isotipo + «volvé a casa». */
export function Logo({ tam = 28, tamTexto = 19 }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 9,
      fontFamily: 'var(--display)', fontWeight: 700, fontSize: tamTexto,
      letterSpacing: '-0.02em', color: 'inherit',
    }}>
      <Isotipo tam={tam} />
      volvé a casa
    </span>
  );
}

/**
 * El logo de bagayí, con la geometría de su vectorial
 * (`bagayi/public/bagayi-icon.svg`). Sobre fondo oscuro el trazo va en blanco
 * y la caja sin relleno, como hace bagayí en su barra.
 */
export function LogoBagayi({ alto = 18, oscuro = false }) {
  const trazo = oscuro ? '#fff' : '#122033';
  const caja = oscuro ? 'none' : '#fff';
  const solapa = oscuro ? 'none' : '#EAF7F1';
  return (
    <svg width={Math.round((alto * 440) / 360)} height={alto} viewBox="0 0 440 360"
      fill="none" aria-hidden="true" style={{ flex: 'none' }}>
      <path fill="#078A55" d="M105 91h62l-7 73h-48z" />
      <ellipse cx="136" cy="91" rx="31" ry="9" fill="#078A55" />
      <ellipse cx="136" cy="91" rx="21" ry="5" fill={oscuro ? 'var(--tinta)' : '#F7F5F0'} />
      <path fill="#2B7897" d="M188 65c0-12 9-21 21-21h27c12 0 21 9 21 21v16c0 7 6 14 8 22l7 59c1 8-5 14-13 14h-73c-8 0-14-6-13-14l7-59c1-8 8-15 8-22z" />
      <rect x="205" y="29" width="39" height="18" rx="9" fill="#2B7897" />
      <path fill="#8B78B9" d="M291 107c0-10 8-18 18-18h49c10 0 18 8 18 18v55c0 8-6 14-14 14h-57c-8 0-14-6-14-14z" />
      <path fill="#8B78B9" d="M312 91V69h-11c-6 0-10-5-8-11 1-4 5-7 10-7h34c5 0 9 3 10 7 2 6-2 11-8 11h-10v22z" />
      <g stroke={trazo} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round">
        <path d="M73 163L5 210l68 43v-90z" fill={solapa} />
        <path d="M363 163l68 47-68 43v-90z" fill={solapa} />
        <path d="M73 163h290v142c0 12-10 22-22 22H95c-12 0-22-10-22-22z" fill={caja} />
        <path d="M73 163h290" fill="none" />
      </g>
      <path d="M205 199C195 207 193 220 186 228C181 234 184 243 180 251C176 260 181 270 187 276C193 282 201 282 207 288C215 296 225 294 234 291C244 289 252 281 258 273C265 264 274 258 272 247C270 238 263 232 258 225C251 216 243 212 235 207C226 201 216 194 205 199Z"
        fill="none" stroke="#078A55" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * El link a bagayí desde el pie. Lleva UTM para medir cuánta gente llega
 * desde acá (BRIEF §4 y §12, métrica de marca).
 */
export const URL_BAGAYI = 'https://bagayo.vercel.app/?utm_source=volveacasa&utm_medium=referral&utm_campaign=un-proyecto-de-bagayi';

/** «Un proyecto de bagayí», con el logo chico de bagayí. */
export function CreditoBagayi({ oscuro = true }) {
  return (
    <span className="credito-bagayi">
      Un proyecto de
      <a href={URL_BAGAYI} target="_blank" rel="noopener noreferrer">
        <LogoBagayi alto={17} oscuro={oscuro} />
        <strong>bagayí</strong>
        <span className="solo-lectores">(se abre en otra pestaña)</span>
      </a>
    </span>
  );
}
