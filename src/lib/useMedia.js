import { useEffect, useState } from 'react';

/**
 * Suscribe a una media query. Se usa para las pantallas donde el diseño mobile
 * no es el mismo layout achicado sino otra estructura (barra de tabs abajo,
 * sidebar del vendedor colapsado), que no se puede resolver sólo con CSS.
 */
export function useMedia(query) {
  const [coincide, setCoincide] = useState(
    () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false),
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const sincronizar = () => setCoincide(mq.matches);

    sincronizar();
    mq.addEventListener('change', sincronizar);
    // `change` alcanza en un navegador real. `resize` va como red de seguridad
    // para los entornos donde el viewport lo cambia algo externo y el evento
    // del MediaQueryList no llega (emulación por CDP, algún WebView). Como
    // sólo relee mq.matches, tenerlo de más no hace oscilar el estado.
    window.addEventListener('resize', sincronizar);

    return () => {
      mq.removeEventListener('change', sincronizar);
      window.removeEventListener('resize', sincronizar);
    };
  }, [query]);

  return coincide;
}

/** Punto de corte del teléfono, alineado con tokens.css. */
export const useEsMobile = () => useMedia('(max-width: 860px)');
