import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './lib/config-publico';

const raiz = createRoot(document.getElementById('root'));

/**
 * Chequeo de configuración ANTES de importar la app (el patrón de bagayí).
 *
 * `src/lib/supabase.js` tira si falta la configuración, y lo hace al evaluarse
 * el módulo, antes de que React monte nada: el ErrorBoundary no puede
 * atraparlo y el resultado es una pantalla en blanco. Por eso `App` se importa
 * dinámicamente, después de este chequeo, y la pantalla dice qué falta.
 *
 * Se chequea la config RESUELTA (variable de entorno o el respaldo de
 * config-publico.js), no la variable cruda: si no, esta pantalla saltaría en
 * todo deploy de Vercel, que descarta los .env*.
 */
const faltan = [
  ['VITE_SUPABASE_URL', SUPABASE_URL],
  ['VITE_SUPABASE_ANON_KEY', SUPABASE_ANON_KEY],
].filter(([, valor]) => !valor).map(([nombre]) => nombre);

if (faltan.length) {
  raiz.render(<SinConfigurar faltan={faltan} />);
} else {
  // `.then()` y no `await`: el target de build por defecto de Vite no soporta
  // top-level await.
  import('./App.jsx').then(({ default: App }) => {
    raiz.render(<React.StrictMode><App /></React.StrictMode>);
  });
}

/** Pantalla de configuración faltante. No usa el kit: el kit importa supabase.js. */
function SinConfigurar({ faltan }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: 'var(--fondo-canvas, #EFEBE3)',
      fontFamily: '"Instrument Sans", system-ui, sans-serif', color: 'var(--tinta, #231A15)',
    }}>
      <div style={{
        background: 'var(--panel, #FFF)', border: '1px solid var(--borde, #E8E4DC)',
        borderRadius: 12, padding: 26, maxWidth: 520,
      }}>
        <h1 style={{ fontSize: 20, margin: '0 0 10px' }}>Volvé a casa no está configurado</h1>
        <p style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.6, color: 'var(--texto, #6B5E55)' }}>
          Al compilar faltaron {faltan.length === 1 ? 'esta variable' : 'estas variables'} de entorno,
          así que la app no puede hablar con la base:
        </p>
        <ul style={{ margin: '0 0 14px', paddingLeft: 18, fontSize: 13.5, lineHeight: 1.9 }}>
          {faltan.map((n) => <li key={n}><code>{n}</code></li>)}
        </ul>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--texto-suave, #7A6D65)' }}>
          Vite las inyecta en tiempo de build, no en runtime: cargalas en el entorno
          (en local <code>.env</code>, en Vercel las Environment Variables del proyecto)
          y volvé a desplegar. Recargar esta página no alcanza.
        </p>
      </div>
    </div>
  );
}
