// Convierte los GeoPackage del INE (Censo 2023) a los GeoJSON que baja la base.
//
//   node scripts/territorio/convertir.mjs supabase/datos/territorio/crudo
//
// Escribe public/datos/territorio/{departamentos,barrios,localidades}.geojson,
// en el sistema de referencia de origen (va en `srid`): la base los pasa a 4326.
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { leerGpkg, poligonosDeWkb, wkbDeGpb } from './gpkg.mjs';
import { campo, nombreBarrio, nombreDepartamento, nombreLocalidad } from './nombres.mjs';
import { simplificarAnillo } from './simplificar.mjs';

const carpeta = process.argv[2];
if (!carpeta) {
  console.error('Uso: node scripts/territorio/convertir.mjs <carpeta con los .gpkg del INE>');
  process.exit(1);
}

const SALIDA = new URL('../../public/datos/territorio/', import.meta.url);
mkdirSync(SALIDA, { recursive: true });

const COL_DEPTO = ['nomdepto', 'nombre', 'departamento', 'cdepto_iso', 'codigo', 'depto'];
const COL_BARRIO = ['nombbarr', 'nombarrio', 'barrio', 'nombre'];
const COL_LOCALIDAD = ['nomloc', 'nombre', 'localidad'];

function aFeatures({ filas, columnaGeom }, propiedades) {
  return filas.map((fila) => {
    const poligonos = poligonosDeWkb(wkbDeGpb(fila[columnaGeom]));
    // En grados (|x| ≤ 180) la tolerancia es ~5 m en grados; si no, 5 m.
    const enGrados = Math.abs(poligonos[0][0][0][0]) <= 180;
    const tolerancia = enGrados ? 0.00005 : 5;
    const decimales = enGrados ? 1e6 : 10;
    const redondear = (v) => Math.round(v * decimales) / decimales;
    return {
      type: 'Feature',
      properties: propiedades(fila),
      geometry: {
        type: 'MultiPolygon',
        coordinates: poligonos.map((anillos) => anillos.map((a) => simplificarAnillo(a, tolerancia)
          .map(([x, y]) => [redondear(x), redondear(y)]))),
      },
    };
  });
}

function escribir(nombre, srid, features) {
  const ruta = new URL(`${nombre}.geojson`, SALIDA);
  writeFileSync(ruta, JSON.stringify({ type: 'FeatureCollection', srid, features }));
  console.log(`${nombre}: ${features.length} polígonos, ${(statSync(ruta).size / 1024).toFixed(0)} KB, EPSG:${srid}`);
}

const deptos = leerGpkg(join(carpeta, 'depto_23_pg.gpkg'));
escribir('departamentos', deptos.srid,
  aFeatures(deptos, (f) => ({ nombre: nombreDepartamento(campo(f, COL_DEPTO)) })));

const barrios = leerGpkg(join(carpeta, 'barrios_mvd_23_pg.gpkg'));
escribir('barrios', barrios.srid,
  aFeatures(barrios, (f) => ({ nombre: nombreBarrio(campo(f, COL_BARRIO)), departamento: 'Montevideo' })));

// En Montevideo la zona es el barrio: sus localidades no se cargan.
const locs = leerGpkg(join(carpeta, 'loc_23_pg.gpkg'));
const fueraDeMontevideo = locs.filas.filter((f) => nombreDepartamento(campo(f, COL_DEPTO)) !== 'Montevideo');
escribir('localidades', locs.srid, aFeatures({ ...locs, filas: fueraDeMontevideo }, (f) => ({
  nombre: nombreLocalidad(campo(f, COL_LOCALIDAD)),
  departamento: nombreDepartamento(campo(f, COL_DEPTO)),
})));
