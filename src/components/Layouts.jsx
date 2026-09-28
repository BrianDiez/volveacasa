import { Link, NavLink, Outlet } from 'react-router-dom';
import { Icono } from '../ui/kit';
import { CreditoBagayi, Logo } from '../ui/marca';

/*
 * La navegación, escrita una sola vez (BRIEF §4).
 *
 * Barra inferior del teléfono: cinco como máximo. Un sexto tab los aprieta a
 * 46 px y rompe el área táctil (bagayí §7); `Layouts.test.jsx` lo verifica.
 * «Adoptar» no es tab: es una entrada del inicio y un filtro.
 */
export const TABS = [
  { a: '/', etiqueta: 'Inicio', icono: Icono.casa, fin: true },
  { a: '/mapa', etiqueta: 'Mapa', icono: Icono.mapa },
  { a: '/publicar', etiqueta: 'Publicar', icono: Icono.mas, destacado: true },
  { a: '/mis-avisos', etiqueta: 'Mis avisos', icono: Icono.avisos },
  { a: '/cuenta', etiqueta: 'Cuenta', icono: Icono.usuario },
];

/* Header de escritorio. Los tres últimos son el feed filtrado: los filtros
   van en la URL para que un filtro también se pueda compartir. */
export const SECCIONES = [
  { a: '/mapa', etiqueta: 'Mapa' },
  { a: '/?tipo=perdido', etiqueta: 'Perdidos' },
  { a: '/?tipo=encontrado', etiqueta: 'Encontrados' },
  { a: '/?tipo=adopcion', etiqueta: 'Adopción' },
];

export const ENLACES_PIE = [
  { a: '/ayuda', etiqueta: 'Qué hacer si perdiste o encontraste' },
  { a: '/terminos', etiqueta: 'Términos' },
  { a: '/privacidad', etiqueta: 'Privacidad' },
];

function Tabbar() {
  return (
    <nav className="tabbar" aria-label="Navegación principal">
      {TABS.map((t) => (
        <NavLink key={t.a} to={t.a} end={t.fin}
          className={t.destacado ? 'tab tab--publicar' : 'tab'}>
          {t.destacado
            ? <span className="burbuja">{t.icono(24)}</span>
            : t.icono(23)}
          {t.etiqueta}
        </NavLink>
      ))}
    </nav>
  );
}

function Cabecera() {
  return (
    <header className="cabecera">
      <div className="contenedor cabecera__fila">
        <Link to="/" aria-label="Volvé a casa, inicio" style={{ color: '#fff', textDecoration: 'none' }}>
          <Logo tam={32} tamTexto={20} />
        </Link>
        <nav aria-label="Secciones">
          {SECCIONES.map((s) => (
            s.a.includes('?')
              ? <Link key={s.a} to={s.a}>{s.etiqueta}</Link>
              : <NavLink key={s.a} to={s.a}>{s.etiqueta}</NavLink>
          ))}
        </nav>
        <div className="cabecera__der">
          <Link to="/publicar" style={{
            height: 42, padding: '0 16px', borderRadius: 999, background: 'var(--marca)',
            color: '#fff', fontWeight: 600, fontSize: 14, display: 'inline-flex',
            alignItems: 'center', gap: 7, textDecoration: 'none',
          }}>{Icono.mas(17)}Publicar aviso</Link>
          <Link to="/cuenta" aria-label="Tu cuenta" style={{
            width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center',
            background: 'rgba(255,255,255,.1)', color: '#fff',
          }}>{Icono.usuario(20)}</Link>
        </div>
      </div>
    </header>
  );
}

/* El pie de todas las páginas públicas: «Un proyecto de bagayí», discreto. */
function Pie() {
  return (
    <footer className="pie con-tabbar">
      <div className="contenedor pie__fila">
        <Logo tam={26} tamTexto={16} />
        <CreditoBagayi />
        <nav className="pie__enlaces" aria-label="Institucional">
          {ENLACES_PIE.map((e) => <Link key={e.a} to={e.a}>{e.etiqueta}</Link>)}
        </nav>
      </div>
    </footer>
  );
}

export function LayoutPublico() {
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <Cabecera />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Pie />
      <Tabbar />
    </div>
  );
}
