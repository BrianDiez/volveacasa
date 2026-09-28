import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LayoutPublico } from './components/Layouts';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Cargando } from './ui/kit';

/* Las pantallas se cargan por demanda: quien no abre el mapa no descarga el
   mapa (BRIEF §7), y un módulo apagado ni se descarga (§8). */

/* Marca de que ya recargamos por un chunk faltante. En sessionStorage y no en
   una variable: la recarga borra la memoria del módulo. */
const CLAVE_RECARGA = 'volveacasa.recarga-por-chunk';

const pagina = (cargar, nombre) => lazy(async () => {
  try {
    const mod = await cargar();
    // Cargó bien: se limpia la marca para que un deploy FUTURO pueda volver a
    // recargar. Sin esto, la protección servía una sola vez por pestaña.
    try { sessionStorage.removeItem(CLAVE_RECARGA); } catch { /* modo privado */ }
    return { default: mod[nombre] };
  } catch (err) {
    /*
     * El chunk no está. Casi siempre es un DEPLOY NUEVO: la pestaña que quedó
     * abierta tiene el index.js viejo apuntando a hashes que ya no existen
     * (bagayí §6.71). Recargar trae el index.js nuevo, así que lo hacemos
     * nosotros. La marca evita el bucle: si después de recargar el chunk sigue
     * sin aparecer, ya no es un deploy y que lo agarre el ErrorBoundary.
     */
    let yaRecargamos = true;
    try { yaRecargamos = !!sessionStorage.getItem(CLAVE_RECARGA); } catch { /* modo privado */ }

    if (!yaRecargamos) {
      try { sessionStorage.setItem(CLAVE_RECARGA, '1'); } catch { /* modo privado */ }
      window.location.reload();
      return { default: () => null };
    }
    throw err;
  }
});

const Inicio       = pagina(() => import('./pages/Inicio'), 'Inicio');
const NoEncontrado = pagina(() => import('./pages/NoEncontrado'), 'NoEncontrado');

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<Cargando />}>
          <Routes>
            <Route element={<LayoutPublico />}>
              <Route index element={<Inicio />} />
              <Route path="*" element={<NoEncontrado />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
