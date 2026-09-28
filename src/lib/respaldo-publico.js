/**
 * La URL y la clave pública del proyecto de Supabase, como respaldo cuando no
 * llegan por variables de entorno. Ver `config-publico.js`: por qué están en el
 * código y por qué es seguro (son públicas, viajan en el JavaScript del sitio).
 *
 * Es el proyecto `volveacasa` (ref blyyywzroyydnusqpzfq, sa-east-1), propio y
 * separado de bagayí (BRIEF §3.2). La clave es la publicable nueva
 * (`sb_publishable_…`), que reemplaza a la anon: el nombre `anon` se conserva
 * para que el código copiado de bagayí ande sin tocarlo.
 *
 * Aparte y sin `import.meta` a propósito: también la puede importar el
 * servidor (`/api`), que corre en Node sin Vite.
 */
export const RESPALDO = {
  url: 'https://blyyywzroyydnusqpzfq.supabase.co',
  anon: 'sb_publishable_OzjvRMOfmTL_BVDKJekfEQ_HQM4La6d',
};
