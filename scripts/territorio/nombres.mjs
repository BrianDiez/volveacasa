import { DEPARTAMENTOS } from '../../src/lib/constants.js';

/*
 * Los nombres del INE llegan en mayúsculas y sin tildes («PQUE BATLLE VILLA
 * DOLORES»). Los departamentos y los barrios se traducen con tablas; si
 * aparece uno que no está, la carga frena: mejor agregarlo a mano que mostrar
 * un nombre roto en cada aviso de ese barrio.
 */

const sinTildes = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
export const clave = (s) => sinTildes(String(s)).toUpperCase().replace(/[_\s]+/g, ' ').trim();

const ISO = {
  'UY-AR': 'Artigas', 'UY-CA': 'Canelones', 'UY-CL': 'Cerro Largo', 'UY-CO': 'Colonia',
  'UY-DU': 'Durazno', 'UY-FS': 'Flores', 'UY-FD': 'Florida', 'UY-LA': 'Lavalleja',
  'UY-MA': 'Maldonado', 'UY-MO': 'Montevideo', 'UY-PA': 'Paysandú', 'UY-RN': 'Río Negro',
  'UY-RV': 'Rivera', 'UY-RO': 'Rocha', 'UY-SA': 'Salto', 'UY-SJ': 'San José',
  'UY-SO': 'Soriano', 'UY-TA': 'Tacuarembó', 'UY-TT': 'Treinta y Tres',
};

export function nombreDepartamento(valor) {
  const v = String(valor ?? '').trim();
  // El INE escribe el código sin guion («UYAR»); la norma ISO, con («UY-AR»).
  const iso = v.toUpperCase().replace(/^UY-?/, 'UY-');
  if (ISO[iso]) return ISO[iso];
  const hallado = DEPARTAMENTOS.find((d) => clave(d) === clave(v));
  if (!hallado) throw new Error(`Departamento desconocido: «${valor}»`);
  return hallado;
}

/**
 * Los 62 barrios de Montevideo del INE, con su nombre para mostrar. La clave es
 * el nombre del Censo 2023 pasado por `clave()`: sin tildes, pero con las comas
 * y las abreviaturas del INE («PQUE. BATLLE, V. DOLORES»).
 */
export const BARRIOS = {
  'AGUADA': 'Aguada',
  'AIRES PUROS': 'Aires Puros',
  'ATAHUALPA': 'Atahualpa',
  'BARRIO SUR': 'Barrio Sur',
  'BANADOS DE CARRASCO': 'Bañados de Carrasco',
  'BELVEDERE': 'Belvedere',
  'BRAZO ORIENTAL': 'Brazo Oriental',
  'BUCEO': 'Buceo',
  'CAPURRO, BELLA VISTA': 'Capurro, Bella Vista',
  'CARRASCO': 'Carrasco',
  'CARRASCO NORTE': 'Carrasco Norte',
  'CASABO, PAJAS BLANCAS': 'Casabó, Pajas Blancas',
  'CASAVALLE': 'Casavalle',
  'CASTRO, P. CASTELLANOS': 'Castro, Pérez Castellanos',
  'CENTRO': 'Centro',
  'CERRITO': 'Cerrito',
  'CERRO': 'Cerro',
  'CIUDAD VIEJA': 'Ciudad Vieja',
  'COLON CENTRO Y NOROESTE': 'Colón Centro y Noroeste',
  'COLON SURESTE, ABAYUBA': 'Colón Sureste, Abayubá',
  'CONCILIACION': 'Conciliación',
  'CORDON': 'Cordón',
  'FLOR DE MARONAS': 'Flor de Maroñas',
  'ITUZAINGO': 'Ituzaingó',
  'JACINTO VERA': 'Jacinto Vera',
  'JARDINES DEL HIPODROMO': 'Jardines del Hipódromo',
  'LA BLANQUEADA': 'La Blanqueada',
  'LA COMERCIAL': 'La Comercial',
  'LA FIGURITA': 'La Figurita',
  'LA PALOMA, TOMKINSON': 'La Paloma, Tomkinson',
  'LA TEJA': 'La Teja',
  'LARRANAGA': 'Larrañaga',
  'LAS ACACIAS': 'Las Acacias',
  'LAS CANTERAS': 'Las Canteras',
  'LEZICA, MELILLA': 'Lezica, Melilla',
  'MALVIN': 'Malvín',
  'MALVIN NORTE': 'Malvín Norte',
  'MANGA': 'Manga',
  'MANGA, TOLEDO CHICO': 'Manga, Toledo Chico',
  'MARONAS, PARQUE GUARANI': 'Maroñas, Parque Guaraní',
  'MERCADO MODELO, BOLIVAR': 'Mercado Modelo y Bolívar',
  'NUEVO PARIS': 'Nuevo París',
  'PALERMO': 'Palermo',
  'PARQUE RODO': 'Parque Rodó',
  'PASO DE LA ARENA': 'Paso de la Arena',
  'PASO DE LAS DURANAS': 'Paso de las Duranas',
  'PENAROL, LAVALLEJA': 'Peñarol, Lavalleja',
  'PIEDRAS BLANCAS': 'Piedras Blancas',
  'POCITOS': 'Pocitos',
  'PQUE. BATLLE, V. DOLORES': 'Parque Batlle, Villa Dolores',
  'PRADO, NUEVA SAVONA': 'Prado, Nueva Savona',
  'PTA. RIELES, BELLA ITALIA': 'Punta de Rieles, Bella Italia',
  'PUNTA CARRETAS': 'Punta Carretas',
  'PUNTA GORDA': 'Punta Gorda',
  'REDUCTO': 'Reducto',
  'SAYAGO': 'Sayago',
  'TRES CRUCES': 'Tres Cruces',
  'TRES OMBUES, VICTORIA': 'Tres Ombúes, Pueblo Victoria',
  'UNION': 'Unión',
  'VILLA ESPANOLA': 'Villa Española',
  'VILLA GARCIA, MANGA RUR.': 'Villa García, Manga Rural',
  'VILLA MUNOZ, RETIRO': 'Villa Muñoz, Retiro',
};

export function nombreBarrio(valor) {
  const nombre = BARRIOS[clave(valor)];
  if (!nombre) {
    throw new Error(`Barrio «${valor}» sin nombre para mostrar: agregalo a BARRIOS en scripts/territorio/nombres.mjs`);
  }
  return nombre;
}

const MINUSCULAS = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'en']);

/** «CIUDAD DE LA COSTA» → «Ciudad de la Costa». Las tildes que no trae el INE no se inventan. */
export function nombreLocalidad(valor) {
  return String(valor).trim().toLowerCase().split(/\s+/)
    .map((p, i) => (i > 0 && MINUSCULAS.has(p) ? p : p.replace(/\p{L}/u, (c) => c.toUpperCase())))
    .join(' ');
}

/** El valor de la primera columna de la lista que tenga la fila, sin importar mayúsculas. */
export function campo(fila, candidatas) {
  const porClave = Object.fromEntries(Object.entries(fila).map(([k, v]) => [k.toLowerCase(), v]));
  for (const c of candidatas) {
    const v = porClave[c.toLowerCase()];
    if (v !== undefined && v !== null && String(v).trim() !== '') return v;
  }
  throw new Error(`Ninguna de las columnas ${candidatas.join(', ')} está en la fila. Columnas: ${Object.keys(fila).join(', ')}`);
}
