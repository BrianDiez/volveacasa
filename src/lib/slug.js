/**
 * URLs que se pueden leer y mandar por WhatsApp.
 *
 * Antes un producto vivía en `/producto/5beac740-92e2-4e4b-9535-ec85ef7b3961` y
 * un vendedor en `/vendedor-perfil/22222222-2222-2222-2222-222222222222`. Un
 * link así no dice nada de lo que hay del otro lado: el que lo recibe no sabe
 * si le están mandando un whisky o una estafa, y el que lo manda no puede
 * revisar que sea el correcto antes de mandarlo.
 *
 * Ahora quedan así:
 *
 *     /producto/whisky-old-parr-12-anos-1-l-5beac740
 *     /vendedor-perfil/supermercado-pampeiro-22222222
 *
 * ── Por qué el id va igual, al final ────────────────────────────────────────
 *
 * Tentaba dejar sólo el nombre. No se puede, por dos motivos que no se arreglan
 * con un sufijo aleatorio en la colisión:
 *
 *   1. **Dos vendedores venden el mismo whisky.** No es un caso raro: es el
 *      modelo del marketplace. Con slug puro, uno de los dos queda con un
 *      sufijo feo para siempre, y cuál de los dos depende de quién publicó
 *      primero.
 *
 *   2. **El vendedor corrige el nombre.** Si el slug es la identidad, el link
 *      que alguien compartió por WhatsApp ayer hoy da 404. Y corregir un nombre
 *      mal escrito es de las cosas más normales que hace un vendedor.
 *
 * Con el id corto al final, **el nombre es decorativo**: se puede cambiar todas
 * las veces que haga falta y los links viejos siguen funcionando, porque lo que
 * resuelve son los últimos 8 caracteres. Es la misma idea del `/dp/ASIN` de
 * Amazon, en un solo segmento.
 *
 * Ocho caracteres hexadecimales son 4.300 millones de combinaciones. La base
 * igual resuelve por una columna `id_corto` con índice único, así que la
 * unicidad no depende de que esa cuenta dé bien.
 */

/** Cuántos caracteres del uuid van al final de la URL. */
export const LARGO_ID_CORTO = 8;

/*
 * Las que `normalize('NFD')` no separa sola. La ñ va aparte a propósito: se
 * podría descomponer en n + tilde, pero entonces "año" y "ano" serían la misma
 * URL, y en rioplatense esa confusión es peor que un carácter menos.
 */
const ESPECIALES = { ñ: 'n', Ñ: 'n', ß: 'ss', æ: 'ae', œ: 'oe', ø: 'o', đ: 'd', ł: 'l' };

/**
 * Un texto convertido en algo que se puede poner en una URL.
 *
 * Saca tildes ("Pilão" → "pilao"), pasa a minúsculas, y todo lo que no sea
 * letra o número se vuelve un guion. Los guiones no se repiten ni quedan en las
 * puntas.
 */
export function aSlug(texto) {
  if (texto === null || texto === undefined) return '';

  return String(texto)
    .replace(/[ñÑßæœøđł]/g, (c) => ESPECIALES[c] ?? c)
    // NFD separa la letra de su tilde; el rango ̀-ͯ son las tildes.
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Los primeros 8 del uuid: lo que de verdad identifica. */
export function idCorto(id) {
  if (!id) return '';
  return String(id).replace(/-/g, '').slice(0, LARGO_ID_CORTO).toLowerCase();
}

/**
 * El segmento completo de la URL: nombre legible + id corto.
 *
 * Si no hay nombre, devuelve sólo el id: una URL fea es mejor que una URL rota,
 * y un producto sin nombre igual tiene que poder abrirse.
 */
export function slugDe(id, nombre) {
  const corto = idCorto(id);
  const legible = aSlug(nombre);
  if (!corto) return legible;
  return legible ? `${legible}-${corto}` : corto;
}

/**
 * Saca el id corto de un segmento de URL.
 *
 * Acepta las tres formas que pueden llegar, porque las tres van a existir:
 *
 *   · `whisky-old-parr-5beac740` — la nueva
 *   · `5beac740-92e2-4e4b-9535-ec85ef7b3961` — un uuid completo, que es lo que
 *     tienen los links viejos ya compartidos. Se siguen resolviendo: romperlos
 *     sería cambiar una molestia por una pérdida.
 *   · `5beac740` — el id corto pelado
 *
 * Devuelve `null` si no encuentra nada con forma de id, para que la pantalla
 * muestre "no existe" en vez de consultar la base con basura.
 */
export function idCortoDeSlug(segmento) {
  if (!segmento) return null;

  const limpio = String(segmento).trim().toLowerCase();

  // Un uuid completo: los primeros 8, sin los guiones.
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(limpio)) {
    return limpio.slice(0, LARGO_ID_CORTO);
  }

  // La forma nueva: lo último después del último guion. También cubre el id
  // pelado, donde no hay guion y el "último trozo" es todo.
  const ultimo = limpio.split('-').pop();
  return /^[0-9a-f]{8}$/.test(ultimo) ? ultimo : null;
}

/*
 * Las rutas, armadas en un solo lugar.
 *
 * Sin esto, cada `<Link>` repite el `/producto/${...}` a mano y basta que uno
 * se olvide del nombre para que esa tarjeta siga generando URLs con uuid pelado
 * mientras el resto ya no. Es un enlace que funciona, así que nada falla y
 * nadie se entera.
 *
 * Si el nombre no está a mano, `slugDe` devuelve sólo el id corto y el link
 * anda igual: fea, pero nunca rota.
 */
/*
 * En Volvé a casa (BRIEF §6) el aviso vive en /a/<nombre>-<zona>-<id_corto> y
 * la protectora en /p/<nombre>-<id_corto>. El nombre y la zona son
 * decorativos: un link que circuló ayer por WhatsApp sigue andando aunque el
 * aviso cambie de nombre, porque lo que resuelve es el id corto del final.
 * El largo y el alfabeto del id corto los cierra el spec del núcleo.
 */
export const rutaAviso = (id, nombre, zona) =>
  `/a/${slugDe(id, [nombre, zona].filter(Boolean).join(' '))}`;
export const rutaProtectora = (id, nombre) => `/p/${slugDe(id, nombre)}`;
