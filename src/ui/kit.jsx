/* Primitivas del sistema visual de Volvé a casa.
   Salen de `bagayi/src/ui/kit.jsx` con los valores de la maqueta aprobada
   (design-src/Maqueta.html) — no cambiar sin tocar la maqueta. */
import { useEffect, useRef, useState } from 'react';
import { colorAvatar, iniciales } from '../lib/format';
import { Isotipo } from './marca';

/* ── Botón ──────────────────────────────────────────────────────────────── */
/*
 * La marca va SÓLO en acciones. El primario es frambuesa lleno; el secundario,
 * blanco con borde neutro (en la maqueta, «Compartir» al lado de
 * «Contactar»): así el primario se distingue sin competir con los colores de
 * estado. WhatsApp tiene su verde con texto oscuro, porque con blanco da 1,98.
 */
const BOTON = {
  primario:   { background: 'var(--marca)', color: '#fff', border: '0' },
  oscuro:     { background: 'var(--tinta)', color: '#fff', border: '0' },
  secundario: { background: 'var(--panel)', color: 'var(--tinta)', border: '1px solid var(--borde-fuerte)' },
  suave:      { background: 'var(--marca-tenue)', color: 'var(--marca)', border: '0' },
  fantasma:   { background: 'transparent', color: 'var(--texto)', border: '1px solid var(--borde)' },
  peligro:    { background: 'var(--panel)', color: 'var(--error)', border: '1px solid var(--borde-fuerte)' },
  whatsapp:   { background: 'var(--whatsapp)', color: 'var(--whatsapp-texto)', border: '0' },
};

export function Boton({
  variante = 'primario', ancho, chico, children, style, disabled, type = 'button', ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      style={{
        height: chico ? 38 : 48,
        padding: chico ? '0 14px' : '0 20px',
        borderRadius: 'var(--r-pastilla)',
        fontSize: chico ? 13.5 : 15,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        whiteSpace: 'nowrap',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: ancho ? '100%' : undefined,
        transition: 'background .12s, border-color .12s',
        ...BOTON[variante],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── Badge ──────────────────────────────────────────────────────────────── */
/*
 * Para rótulos neutros («Vencido el 12/9», «Hay recompensa»). Los estados de
 * un aviso NO van acá: van con la clase `.insignia` y su `t-<tipo>`, que
 * lleva texto e ícono además del color.
 */
export function Badge({ children, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 12, fontWeight: 600, padding: '3px 9px',
      borderRadius: 999, whiteSpace: 'nowrap',
      background: 'var(--gris-suave)', color: 'var(--tinta)', ...style,
    }}>{children}</span>
  );
}

/* ── Campo de formulario ────────────────────────────────────────────────── */
export function Campo({ etiqueta, ayuda, error, children, requerido }) {
  return (
    <label style={{ display: 'block' }}>
      {etiqueta && (
        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 7 }}>
          {etiqueta}{requerido && <span style={{ color: 'var(--error)' }}> *</span>}
        </div>
      )}
      {children}
      {ayuda && !error && (
        <div style={{ fontSize: 12.5, color: 'var(--texto-suave)', marginTop: 6 }}>{ayuda}</div>
      )}
      {error && (
        <div style={{ fontSize: 12.5, color: 'var(--error)', marginTop: 6 }}>{error}</div>
      )}
    </label>
  );
}

/* 16 px en los campos: con menos, iOS hace zoom al enfocarlos. */
const ENTRADA = {
  width: '100%', height: 50, padding: '0 14px',
  borderRadius: 12, border: '1px solid var(--borde-fuerte)',
  background: 'var(--panel)', fontSize: 16, outline: 'none',
};

export const Entrada = (p) => <input {...p} style={{ ...ENTRADA, ...p.style }} />;
export const Area = (p) => (
  <textarea {...p} style={{ ...ENTRADA, height: 'auto', minHeight: 104, padding: '12px 14px', resize: 'vertical', lineHeight: 1.5, ...p.style }} />
);

/*
 * La flecha del desplegable, dibujada por nosotros (sin `appearance: none`,
 * Windows pega su botón gris contra el borde redondeado). Es una `url()` con un
 * SVG adentro y ahí no entran las variables CSS: el color es el de
 * `--texto-suave` escrito a mano. Si cambia el token, cambia acá.
 */
const FLECHA_SELECT = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1.5L6 6.5L11 1.5' stroke='%237A6D65' stroke-width='1.6' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>";

export const Selector = (p) => (
  <select {...p} style={{
    ...ENTRADA,
    cursor: 'pointer',
    appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
    backgroundImage: `url("${FLECHA_SELECT}")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: 32,
    ...p.style,
  }} />
);

/* ── Radio en tarjeta (Publicar: tipo, cuándo) ──────────────────────────── */
export function OpcionRadio({ activa, deshabilitada, onClick, children }) {
  return (
    <label
      onClick={deshabilitada ? undefined : onClick}
      style={{
        display: 'flex', gap: 13, alignItems: 'center', padding: '14px 15px',
        borderRadius: 14,
        border: activa ? '1.5px solid var(--marca)' : '1.5px solid var(--borde)',
        background: activa ? 'var(--marca-fondo)' : 'var(--panel)',
        cursor: deshabilitada ? 'not-allowed' : 'pointer',
        opacity: deshabilitada ? 0.55 : 1,
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>{children}</span>
      <span style={{
        width: 22, height: 22, borderRadius: '50%', flex: 'none',
        border: activa ? '7px solid var(--marca)' : '2px solid var(--borde-fuerte)',
        background: 'var(--panel)',
      }} />
    </label>
  );
}

/* ── Avatar ─────────────────────────────────────────────────────────────── */
export function Avatar({ nombre = '', id = '', tam = 38, src }) {
  const forma = { width: tam, height: tam, flex: 'none', borderRadius: '50%' };

  if (src) {
    return <img src={src} alt="" style={{ ...forma, objectFit: 'cover', background: 'var(--gris-suave)' }} />;
  }

  return (
    <div style={{
      ...forma,
      background: colorAvatar(id || nombre), color: '#fff',
      fontSize: tam * 0.34, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{iniciales(nombre)}</div>
  );
}

/* ── Estado vacío ───────────────────────────────────────────────────────── */
/* Un feed o un mapa vacío es una invitación a publicar, no un error. */
export function Vacio({ titulo, texto, accion }) {
  return (
    <div style={{
      textAlign: 'center', padding: '54px 24px',
      background: 'var(--panel)', border: '1px solid var(--borde)',
      borderRadius: 'var(--r-lg)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <Isotipo tam={52} />
      </div>
      <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17, marginBottom: 7 }}>
        {titulo}
      </div>
      <p style={{ margin: '0 auto 18px', maxWidth: 420, fontSize: 14, color: 'var(--texto)', lineHeight: 1.6 }}>
        {texto}
      </p>
      {accion}
    </div>
  );
}

/* ── Carga y error ──────────────────────────────────────────────────────── */
export function Cargando({ texto = 'Cargando…' }) {
  return (
    <div style={{ padding: 48, textAlign: 'center', color: 'var(--texto-suave)', fontSize: 14 }}>
      {texto}
    </div>
  );
}

export function Aviso({ tono = 'alerta', children, style }) {
  const paleta = {
    alerta: { borde: 'var(--alerta)', fondo: '#FFFDF6' },
    error:  { borde: 'var(--error)',  fondo: 'var(--error-fondo)' },
    exito:  { borde: 'var(--exito)',  fondo: 'var(--exito-fondo)' },
    info:   { borde: 'var(--info)',   fondo: 'var(--info-fondo)' },
  }[tono];
  return (
    <div role={tono === 'error' ? 'alert' : undefined} style={{
      border: `1.5px solid ${paleta.borde}`, background: paleta.fondo,
      borderRadius: 'var(--r-lg)', padding: 16, fontSize: 13.5,
      color: 'var(--tinta)', lineHeight: 1.55, ...style,
    }}>{children}</div>
  );
}

/* ── Foto ───────────────────────────────────────────────────────────────── */
export function Foto({ src, alto = 150, radio = 'var(--r-md)', alt = '', texto = 'foto' }) {
  if (src) {
    return (
      <img src={src} alt={alt} loading="lazy" style={{
        width: '100%', height: alto, objectFit: 'cover',
        borderRadius: radio, display: 'block', background: 'var(--gris-suave)',
      }} />
    );
  }
  return (
    <div aria-hidden style={{
      width: '100%', height: alto, borderRadius: radio,
      background: 'var(--gris-suave)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      color: 'var(--texto-suave)', fontSize: 12,
    }}>{texto}</div>
  );
}

/* ── Íconos (trazo 2, viewBox 24 — los de la maqueta) ───────────────────── */
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const Icono = {
  // Los cuatro tipos, con el ícono que los identifica en todo el sitio.
  lupa:      (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" {...P}><circle cx="10.5" cy="10.5" r="6.5" /><path d="M20 20l-4.8-4.8" /></svg>,
  ojo:       (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></svg>,
  huella:    (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><ellipse cx="12" cy="16.2" rx="4.7" ry="3.9" /><circle cx="5.9" cy="10.6" r="2.1" /><circle cx="9.5" cy="6.8" r="2.1" /><circle cx="14.5" cy="6.8" r="2.1" /><circle cx="18.1" cy="10.6" r="2.1" /></svg>,
  corazon:   (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0112 7.4 4.3 4.3 0 0119.5 10c0 5.4-7.5 10-7.5 10z" /></svg>,
  casa:      (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M4 11l8-6.5 8 6.5V19a1 1 0 01-1 1H5a1 1 0 01-1-1z" /><path d="M9.5 20v-5.5h5V20" /></svg>,
  // Navegación
  mapa:      (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M9 4.5L3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5z" /><path d="M9 4.5v13M15 6.5v13" /></svg>,
  mas:       (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M12 5v14M5 12h14" /></svg>,
  avisos:    (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" {...P}><rect x="4" y="3.5" width="16" height="17" rx="2.5" /><path d="M8 8.5h8M8 12.5h8M8 16.5h5" /></svg>,
  usuario:   (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" {...P}><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20c1.2-3.6 4-5.2 7.5-5.2s6.3 1.6 7.5 5.2" /></svg>,
  atras:     (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M15 5l-7 7 7 7" /></svg>,
  adelante:  (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M9 5.5l6.5 6.5L9 18.5" /></svg>,
  cerrar:    (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M6 6l12 12M18 6L6 18" /></svg>,
  // Acciones y señales
  compartir: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M12 3.5v11" /><path d="M7.5 8L12 3.5 16.5 8" /><path d="M5 12.5V19a1.5 1.5 0 001.5 1.5h11A1.5 1.5 0 0019 19v-6.5" /></svg>,
  pin:       (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 10-13 0c0 5.4 6.5 11 6.5 11z" /><circle cx="12" cy="10" r="2.3" /></svg>,
  escudo:    (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z" /><path d="M12 8v4.5M12 15.8v.2" /></svg>,
  info:      (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" {...P}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 7.8v.2" /></svg>,
  reloj:     (s = 17) => <svg width={s} height={s} viewBox="0 0 24 24" {...P}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>,
  tilde:     (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" {...P} strokeWidth="2.6"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>,
  externo:   (s = 13) => <svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M14 4h6v6" /><path d="M20 4l-8 8" /><path d="M18 14.5V19a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h4.5" /></svg>,
};

/**
 * Enlace que sale del sitio: siempre con el cuadrado-y-flecha y con
 * `rel="noopener noreferrer"` (sin `noopener`, la página que se abre puede
 * manipular la nuestra por `window.opener`).
 */
export function EnlaceExterno({ href, children, style, ...resto }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...style }}
      {...resto}
    >
      {children}
      <span aria-hidden="true" style={{ display: 'flex', opacity: .75 }}>{Icono.externo()}</span>
      <span className="solo-lectores">(se abre en otra pestaña)</span>
    </a>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Ventana modal
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Ventana que baja sobre la pantalla actual, con el fondo opaco. Se cierra con
 * Escape, con la X y tocando el fondo (en `mousedown`: con `click`, arrastrar
 * para seleccionar texto y soltar afuera la cerraba).
 *
 * `onCerrar` va por ref y NO en las dependencias del efecto: en bagayí, con la
 * función en las dependencias, cada tecla re-ejecutaba el efecto y devolvía
 * el foco a la ✕ («cada vez que escribo algo me lleva a la cruz»).
 */
export function Modal({ abierto, onCerrar, titulo, ancho = 520, children }) {
  const panel = useRef(null);
  const alCerrar = useRef(onCerrar);
  alCerrar.current = onCerrar;

  useEffect(() => {
    if (!abierto) return undefined;

    const conTecla = (e) => { if (e.key === 'Escape') alCerrar.current(); };
    window.addEventListener('keydown', conTecla);

    const previoOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const foco = document.activeElement;
    // El foco entra al diálogo y no a un control: enfocar el primer campo
    // abre el teclado solo en el teléfono.
    panel.current?.focus();

    return () => {
      window.removeEventListener('keydown', conTecla);
      document.body.style.overflow = previoOverflow;
      if (foco instanceof HTMLElement) foco.focus();
    };
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div className="modal-fondo" onMouseDown={onCerrar}>
      <div
        ref={panel}
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        style={{ maxWidth: ancho, outline: 'none' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 18px', borderBottom: '1px solid var(--borde)',
        }}>
          <h2 style={{ margin: 0, fontSize: 17, flex: 1 }}>{titulo}</h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar"
            style={{
              background: 'none', border: 0, cursor: 'pointer', padding: 6,
              display: 'flex', color: 'var(--texto-suave)',
            }}>{Icono.cerrar(18)}</button>
        </div>
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    </div>
  );
}

/**
 * Una `i` que despliega una explicación corta. Se abre con click Y con tap:
 * un tooltip que sólo responde a `:hover` no existe en un teléfono.
 */
export function PistaInfo({ etiqueta = 'Ver el detalle', children }) {
  const [abierta, setAbierta] = useState(false);

  return (
    <span style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle' }}>
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-label={etiqueta}
        aria-expanded={abierta}
        title={etiqueta}
        style={{
          background: 'none', border: 0, padding: 0, marginLeft: 5, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center',
          color: abierta ? 'var(--marca)' : 'var(--texto-suave)',
        }}
      >
        {Icono.info(15)}
      </button>

      {abierta && (
        <>
          {/* Capa transparente para cerrar tocando afuera. */}
          <span onClick={() => setAbierta(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <span
            role="tooltip"
            style={{
              position: 'absolute', zIndex: 41, right: 0, top: 'calc(100% + 7px)',
              width: 250, padding: '10px 12px',
              background: 'var(--panel)', border: '1px solid var(--borde)',
              borderRadius: 'var(--r-sm)', boxShadow: '0 6px 20px rgba(35,26,21,.13)',
              fontSize: 12.5, lineHeight: 1.55, color: 'var(--texto)',
              fontWeight: 400, textAlign: 'left', whiteSpace: 'normal',
            }}
          >
            {children}
          </span>
        </>
      )}
    </span>
  );
}

/* ── Encabezados ────────────────────────────────────────────────────────── */
/** El título de una pantalla, con su bajada y sus acciones. */
export function Encabezado({ titulo, bajada, acciones, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 14, flexWrap: 'wrap',
      }}>
        <h1 style={{ flex: 1, minWidth: 0 }}>{titulo}</h1>
        {acciones}
      </div>
      {bajada && (
        <p style={{
          margin: '7px 0 0', fontSize: 14.5, color: 'var(--texto)',
          lineHeight: 1.5, maxWidth: '62ch',
        }}>{bajada}</p>
      )}
      {children}
    </div>
  );
}

/** El título de una sección dentro de una pantalla, con su enlace a la derecha. */
export function SeccionTitulo({ titulo, a, texto, Enlace }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      gap: 16, marginBottom: 14,
    }}>
      <h2>{titulo}</h2>
      {a && Enlace && (
        <Enlace to={a} style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {texto}
        </Enlace>
      )}
    </div>
  );
}
