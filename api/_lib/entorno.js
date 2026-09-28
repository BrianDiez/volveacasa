/**
 * Lectura de variables de entorno donde "vacía" cuenta como "ausente".
 *
 * ── Por qué existe ───────────────────────────────────────────────────────────
 *
 * El patrón obvio, `process.env.X ?? porDefecto`, tiene un agujero: `??` sólo
 * cae al respaldo con `null` o `undefined`. Una variable DEFINIDA PERO VACÍA
 * pasa derecho, y el respaldo no protege nada.
 *
 * No es teórico. En Vercel las variables de Mercado Pago y PUBLIC_SITE_URL
 * estaban creadas con valor vacío, y se midió contra el sitio en vivo que
 * `/api/mp/oauth?action=url` devolvía un `redirect_uri` de "/api/mp/oauth",
 * sin host: `SITIO` había quedado en "".
 *
 * Con números es peor, porque el fallo es SILENCIOSO y no rompe nada visible:
 *
 *   Number('' ?? 8)      === 0   → comisión del marketplace en 0% por venta
 *   Number('' ?? 15000)  === 0   → AbortSignal.timeout(0) aborta al instante
 *
 * Una variable mal configurada tiene que caer al respaldo, no convertirse en un
 * cero que parece una decisión.
 */

/** El texto de la variable, o `porDefecto` si está vacía o no está. */
export function textoDeEntorno(valor, porDefecto) {
  if (valor == null) return porDefecto;
  const limpio = String(valor).trim();
  return limpio === '' ? porDefecto : limpio;
}

/**
 * El número de la variable, o `porDefecto` si está vacía, no está, o no es un
 * número. Un `0` explícito SÍ se respeta: es una decisión, un vacío no.
 */
export function numeroDeEntorno(valor, porDefecto) {
  const texto = textoDeEntorno(valor, null);
  if (texto === null) return porDefecto;
  const n = Number(texto);
  return Number.isFinite(n) ? n : porDefecto;
}
