/*
 * Dobles de las fronteras que toda pantalla arrastra al importarse (el patrón
 * de `bagayi/src/pruebas/dobles.js`).
 *
 * Montar una pantalla importa su archivo, y `lib/supabase.js` crea el cliente
 * al evaluarse. En un test eso aparece como un error críptico sobre un export
 * que falta en el mock, con el stack apuntando a un módulo que uno ni pensaba
 * tocar. Por eso el doble está acá y no copiado en cada archivo.
 *
 * Uso, desde un test (la fábrica de `vi.mock` puede ser async):
 *
 *   vi.mock('../lib/supabase', async () =>
 *     (await import('../pruebas/dobles')).supabaseFalso());
 *
 * Los fixtures de filas (`fixtures.js` de bagayí, que lee las columnas de las
 * migraciones para no mentir sobre el esquema) llegan con la fase Base, cuando
 * haya migraciones de donde leerlas (bagayí §6.73–75).
 */

/**
 * Reemplaza `lib/supabase` entero. Sin red y sin cliente real: devuelve vacío
 * para todo, que alcanza para que los módulos con efectos al importar sigan.
 */
export function supabaseFalso() {
  const consulta = () => {
    const encadenable = new Proxy(Promise.resolve({ data: [], error: null }), {
      get: (destino, prop) => (prop in destino
        ? Reflect.get(destino, prop).bind?.(destino) ?? Reflect.get(destino, prop)
        : () => encadenable),
    });
    return encadenable;
  };

  return {
    supabase: { from: consulta, rpc: consulta, storage: { from: consulta } },
    q: async () => [],
    subirArchivo: async () => '',
    urlPublica: (bucket, path) => path ?? '',
    tokenDeSesion: async () => 'token-de-prueba',
  };
}
