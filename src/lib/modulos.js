/**
 * El registro único de módulos y flags (spec §8). De acá salen TODAS las
 * menciones: las rutas, la navegación y el pie. En bagayí la misma regla
 * escrita en N pantallas terminó olvidada en una, cinco veces (§6.68).
 *
 * Las claves son las que siembra la migración de `modulos`; `modulos.test.js`
 * las cruza. El hook que lee el switch de la base (`useModulo`) llega con la
 * fase 2, que es la primera que lo necesita.
 */
export const MODULOS = {
  veterinarias: {
    nombre: 'Veterinarias',
    ruta: '/veterinarias',
    descripcion: 'Directorio en el mapa, con registro y aprobación manual.',
  },
  marketplace_servicios: {
    nombre: 'Servicios',
    ruta: '/servicios',
    descripcion: 'Paseadores y peluquería móvil por zona. Sin pagos.',
  },
  marketplace_productos: {
    nombre: 'Productos',
    ruta: '/tienda',
    descripcion: 'Tienda con Mercado Pago. Sólo en el menú y el pie.',
  },
  historias: {
    nombre: 'Historias',
    ruta: '/historias',
    descripcion: 'Los animales que encontraron familia, con su historia. Pública.',
  },
};

export const FLAGS = {
  login_whatsapp: {
    nombre: 'Código por WhatsApp',
    descripcion: 'Entrar con un código por WhatsApp además del mail.',
  },
  redes_automaticas: {
    nombre: 'Publicar en redes',
    descripcion: 'Los perdidos salen en las redes de Volvé a casa, con aprobación.',
  },
};

/** De las filas de `modulos`, si una clave está prendida. Lo que no está, está apagado. */
export function estaActivo(filas, clave) {
  return Boolean((filas ?? []).find((f) => f.clave === clave)?.activo);
}
