import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/*
 * Las migraciones leídas del disco, para los tests `*-base`. Es el patrón de
 * bagayí (`siempre-un-admin-base.test.js`): comparar contra el código fuente y
 * no contra la memoria de uno. Corre en Node, sin base y sin red.
 *
 * Se leen en orden de nombre: las ya aplicadas llevan la versión de la base
 * (`2026…`) y las que todavía no, `pendiente_…`, que ordena después.
 */
const DIR = join(process.cwd(), 'supabase', 'migrations');

/** Todas las migraciones, en orden, pegadas en un solo texto. */
export function sqlDeMigraciones() {
  return readdirSync(DIR).filter((n) => n.endsWith('.sql')).sort()
    .map((n) => readFileSync(join(DIR, n), 'utf8')).join('\n');
}

/**
 * La última definición de una función, hasta su `$$;` de cierre, o '' si no
 * existe (así el test que la use falla en vez de explotar).
 */
export function ultimaFuncion(sql, nombre) {
  const i = sql.toLowerCase().lastIndexOf(`create or replace function ${nombre.toLowerCase()}(`);
  if (i === -1) return '';
  const fin = sql.indexOf('$$;', sql.indexOf('$$', i) + 2);
  return sql.slice(i, fin === -1 ? undefined : fin + 3);
}

/** El nombre y la cabecera (lo que va antes del cuerpo) de cada función. */
export function cabecerasDeFunciones(sql) {
  return [...sql.matchAll(/create or replace function ([a-z_]+\.[a-z_]+)\(([\s\S]*?)\$\$/gi)]
    .map((m) => ({ nombre: m[1].toLowerCase(), cabecera: m[0] }));
}

/** Las tablas creadas en el esquema public. */
export function tablasPublicas(sql) {
  return [...sql.matchAll(/create table (?:if not exists )?public\.([a-z_]+)/gi)].map((m) => m[1]);
}

/** El bloque `create table public.<tabla> (…);` o '' si no está. */
export function tabla(sql, nombre) {
  const i = sql.search(new RegExp(`create table (if not exists )?public\\.${nombre} \\(`, 'i'));
  if (i === -1) return '';
  return sql.slice(i, sql.indexOf('\n);', i) + 3);
}
