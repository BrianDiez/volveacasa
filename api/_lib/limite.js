/**
 * Rate limiting para /api.
 *
 * El contador vive en la base y no en memoria porque cada invocación
 * serverless puede caer en otra lambda: un Map local no se comparte entre
 * instancias y no limita absolutamente nada.
 */

/**
 * IP del cliente. Puro, para poder testearlo.
 *
 * Detrás de un proxy, `x-forwarded-for` es una lista "cliente, proxy1, proxy2":
 * el primero es el cliente. Lo escribe el proxy, así que no es confiable si
 * alguien llega directo al origen; en Vercel lo reescribe la plataforma.
 */
export function ipDeLaPeticion(req) {
  const xff = req.headers?.['x-forwarded-for'];
  if (typeof xff === 'string' && xff.trim()) return xff.split(',')[0].trim();
  if (Array.isArray(xff) && xff.length) return String(xff[0]).split(',')[0].trim();
  return req.headers?.['x-real-ip'] ?? req.socket?.remoteAddress ?? 'desconocida';
}

/**
 * Clave de cuota: por usuario si hay sesión, por IP si no.
 *
 * Por usuario es más justo — varias personas pueden compartir una IP y una
 * sola persona puede rotarla —, pero sin sesión la IP es lo único que hay.
 */
export function claveDeCuota({ endpoint, usuario, req }) {
  return usuario?.id
    ? `${endpoint}:u:${usuario.id}`
    : `${endpoint}:ip:${ipDeLaPeticion(req)}`;
}

/**
 * Consume una unidad de cuota. Devuelve { permitido, reinicia }.
 *
 * OJO con el nombre de la función: tiene que ser la de `public`. La
 * implementación vive en `privado`, pero PostgREST sólo resuelve funciones de
 * los esquemas que expone, así que apuntar a `privado` devuelve PGRST202, cae
 * en la rama de error de abajo y deja el rate limiting muerto sin avisar.
 *
 * Si el contador falla se DEJA PASAR a propósito: es preferible no limitar un
 * rato antes que voltear el checkout entero por un problema del contador.
 */
export async function dentroDeCuota(db, { clave, limite, ventanaSeg }) {
  const { data, error } = await db.rpc('consumir_cuota', {
    p_clave: clave,
    p_limite: limite,
    p_ventana_seg: ventanaSeg,
  });

  if (error) {
    console.warn('rate limit: no se pudo consultar la cuota, se deja pasar -', error.message);
    return { permitido: true, degradado: true };
  }

  return { permitido: data?.permitido !== false, reinicia: data?.reinicia };
}
