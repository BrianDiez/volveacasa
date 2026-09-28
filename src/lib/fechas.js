/**
 * Convertir a `Date` sin que un dato roto se convierta en una fecha válida.
 *
 * Esto existía copiado en tres módulos de lógica —cancelación, consentimiento y
 * reportes— y en los tres tenía el mismo agujero:
 *
 *     const d = valor instanceof Date ? valor : new Date(valor);
 *     return Number.isNaN(d.getTime()) ? null : d;
 *
 * El problema es que **`new Date(null)` no es una fecha inválida: es
 * 1970-01-01**. (`new Date('')` y `new Date(undefined)` sí dan NaN, lo cual
 * hace la trampa peor, porque dos de los tres casos nulos funcionan bien y el
 * tercero pasa desapercibido.) Así que un campo nulo no devolvía `null` como el
 * código creía: devolvía una fecha real, cincuenta años en el pasado.
 *
 * Dónde importa: en `reporte-logica.js` un `creado_en` nulo producía un
 * vencimiento en 1970 —o sea ya vencido— y la guarda que impide liberar el pago
 * dejaba pasar. Un dato roto ABRÍA la guarda en vez de cerrarla. En los otros
 * dos módulos el mismo bug cae del lado seguro, pero por suerte, no por diseño.
 *
 * La regla general, que vale para todo el proyecto: **la ausencia de un dato no
 * se lee como "todo bien"**. Cuando del otro lado hay plata, no saber tiene que
 * alcanzar para no mover nada. Es el mismo error que los advisors de Supabase
 * encontraron en SQL —`if o.buyer_id <> auth.uid()` no protege sin sesión,
 * porque comparar contra NULL da NULL— sólo que en JavaScript.
 *
 * Se llama `aFecha` y no `fecha` a propósito: `format.js` ya exporta un
 * `fecha()` que es de presentación y devuelve un string. Son cosas distintas y
 * no tienen que poder confundirse en un import.
 */
export function aFecha(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  const d = valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

/* ── Los días de la semana, en el orden en que se leen ──────────────────────── */

/**
 * Ordena días de despacho de LUNES a DOMINGO.
 *
 * `dias_despacho` es un `smallint[]` que guarda los días en el orden en que el
 * vendedor los fue tildando, y las pantallas lo pintaban tal cual. El resultado
 * era "Despacha los miércoles, lunes, martes, jueves, viernes" — todos los días
 * correctos y una frase que nadie puede leer de un vistazo.
 *
 * ⚠️ **No alcanza con `.sort()`.** `DIAS` está indexado con la convención de
 * JavaScript, donde `0` es DOMINGO porque así lo devuelve `Date.getDay()`.
 * Ordenar por el número crudo pone el domingo PRIMERO, que no es como se lee
 * una semana acá: va de lunes a domingo. Por eso el domingo se mapea a 7.
 *
 * Se devuelve un array nuevo: `sort` muta, y estos valores llegan derecho de la
 * fila del vendedor que tiene el estado de React.
 */
export const ORDEN_SEMANA = (dia) => (dia === 0 ? 7 : dia);

export function diasOrdenados(dias) {
  if (!Array.isArray(dias)) return [];
  return [...dias].sort((a, b) => ORDEN_SEMANA(a) - ORDEN_SEMANA(b));
}
