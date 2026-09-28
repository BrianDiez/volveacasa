import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook mínimo de lectura: corre `fn` cuando cambian las `deps` y expone
 * { datos, cargando, error, recargar }. Evita setState tras desmontar y
 * descarta respuestas de peticiones que quedaron viejas.
 */
export function useQuery(fn, deps = [], { inicial = null, activo = true } = {}) {
  const [datos, setDatos] = useState(inicial);
  const [cargando, setCargando] = useState(activo);
  const [error, setError] = useState(null);
  const corrida = useRef(0);
  const montado = useRef(true);

  // OJO: hay que volver a marcar `montado` en CADA montaje, no sólo limpiarlo
  // al desmontar. En React 18 StrictMode el ciclo de desarrollo es
  // montar → limpiar → montar de nuevo sobre las MISMAS refs: si sólo se
  // ponía en false al limpiar, quedaba en false para siempre y todos los
  // setDatos/setCargando posteriores se descartaban en silencio. Resultado:
  // la app entera clavada en "Cargando…" aunque la consulta respondiera bien.
  useEffect(() => {
    montado.current = true;
    return () => { montado.current = false; };
  }, []);

  const correr = useCallback(async () => {
    if (!activo) { setCargando(false); return; }
    const mia = ++corrida.current;
    setCargando(true);
    setError(null);
    try {
      const r = await fn();
      if (montado.current && mia === corrida.current) setDatos(r);
    } catch (e) {
      if (montado.current && mia === corrida.current) setError(e);
    } finally {
      if (montado.current && mia === corrida.current) setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo, ...deps]);

  useEffect(() => { correr(); }, [correr]);

  return { datos, cargando, error, recargar: correr, setDatos };
}
