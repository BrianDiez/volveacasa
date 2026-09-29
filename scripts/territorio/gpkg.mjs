import { DatabaseSync } from 'node:sqlite';

/*
 * Leer un GeoPackage sin instalar nada: es un SQLite, y la geometría de cada
 * fila es un encabezado GeoPackage (GPB) seguido de WKB.
 */

/** La capa de features de un GeoPackage: sus filas, la columna de geometría y el SRID (EPSG). */
export function leerGpkg(ruta) {
  const db = new DatabaseSync(ruta, { readOnly: true });
  try {
    const capa = db.prepare("select table_name from gpkg_contents where data_type = 'features'").get();
    if (!capa) throw new Error(`${ruta}: no tiene una capa de features`);
    const geo = db.prepare('select column_name, srs_id from gpkg_geometry_columns where table_name = ?')
      .get(capa.table_name);
    const srs = db.prepare('select organization, organization_coordsys_id from gpkg_spatial_ref_sys where srs_id = ?')
      .get(geo.srs_id);
    if (String(srs.organization).toUpperCase() !== 'EPSG') {
      throw new Error(`${ruta}: el sistema de referencia no es EPSG (${srs.organization} ${srs.organization_coordsys_id})`);
    }
    const filas = db.prepare(`select * from "${capa.table_name}"`).all();
    return { capa: capa.table_name, srid: srs.organization_coordsys_id, columnaGeom: geo.column_name, filas };
  } finally {
    db.close();
  }
}

/** El WKB de adentro de una geometría GeoPackage: se saltea el encabezado y la envolvente. */
export function wkbDeGpb(dato) {
  const b = Buffer.from(dato);
  if (b.length < 8 || b[0] !== 0x47 || b[1] !== 0x50) throw new Error('no es una geometría GeoPackage');
  const envolvente = [0, 32, 48, 48, 64][(b[3] >> 1) & 0x07];
  if (envolvente === undefined) throw new Error('envolvente de GeoPackage inválida');
  return b.subarray(8 + envolvente);
}

/**
 * WKB de un Polygon o un MultiPolygon (con o sin Z/M, ISO o EWKB) a una lista
 * de polígonos: [[anillo, …], …], con cada anillo como [[x, y], …].
 */
export function poligonosDeWkb(wkb) {
  let o = 0;
  function leer() {
    const little = wkb[o] === 1;
    o += 1;
    const u32 = () => { const v = little ? wkb.readUInt32LE(o) : wkb.readUInt32BE(o); o += 4; return v; };
    const f64 = () => { const v = little ? wkb.readDoubleLE(o) : wkb.readDoubleBE(o); o += 8; return v; };

    let tipo = u32();
    let dims = 2 + (tipo & 0x80000000 ? 1 : 0) + (tipo & 0x40000000 ? 1 : 0);
    const conSrid = (tipo & 0x20000000) !== 0;
    tipo &= 0x0fffffff;
    if (tipo >= 1000) {
      dims = Math.floor(tipo / 1000) === 3 ? 4 : 3;
      tipo %= 1000;
    }
    if (conSrid) u32();

    if (tipo === 3) {
      const anillos = [];
      for (let r = u32(); r > 0; r -= 1) {
        const puntos = [];
        for (let p = u32(); p > 0; p -= 1) {
          const x = f64();
          const y = f64();
          for (let d = 2; d < dims; d += 1) f64();
          puntos.push([x, y]);
        }
        anillos.push(puntos);
      }
      return [anillos];
    }
    if (tipo === 6) {
      const poligonos = [];
      for (let n = u32(); n > 0; n -= 1) poligonos.push(...leer());
      return poligonos;
    }
    throw new Error(`tipo de geometría WKB ${tipo} no soportado`);
  }
  return leer();
}
