import { useEffect, useState } from 'react';
import { q, supabase } from './supabase';

/**
 * Configuración del sitio, editable por el admin sin desplegar: plazos,
 * topes, umbrales y precisiones (BRIEF §5). Es el patrón de
 * `bagayi/src/lib/configuracion.js`, y la base de `useModulo`.
 *
 * Vive en la tabla `configuracion`: la lee cualquiera y sólo la escribe un
 * admin (la crea la fase Base). Se pide UNA vez por carga de página y se
 * comparte la promesa entre todos los que la consulten.
 *
 * IMPORTANTE: esto es sólo para la interfaz. Las reglas que dependen de estos
 * valores las aplica la base, que lee la misma tabla.
 */

let promesa = null;

export function cargarConfiguracion() {
  promesa ??= q(supabase.from('configuracion').select('clave, valor'))
    .then((filas) => Object.fromEntries((filas ?? []).map((f) => [f.clave, f.valor])))
    // Si la consulta falla no se rompe la pantalla: se sigue con los valores
    // por defecto de quien la usa.
    .catch(() => ({}));
  return promesa;
}

export function useConfiguracion() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    let vivo = true;
    cargarConfiguracion().then((c) => { if (vivo) setConfig(c); });
    return () => { vivo = false; };
  }, []);

  return config;
}

/** Guarda un valor. La RLS deja pasar sólo al admin. */
export async function guardarConfiguracion(clave, valor) {
  const { error } = await supabase
    .from('configuracion')
    .update({ valor, actualizado_en: new Date().toISOString() })
    .eq('clave', clave);
  if (error) throw new Error(error.message);
  // La caché quedó vieja: se descarta para que la próxima lectura la traiga.
  promesa = null;
}
