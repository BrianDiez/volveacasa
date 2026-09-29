// Arma una prueba de la base para pasarla a execute_sql del MCP de Supabase:
// las ayudas, el tema y la consulta que corre los casos.
//
//   node scripts/prueba-sql.mjs perfiles
//
// Deja el resultado en supabase/pruebas/.armado.sql (ignorado por git).
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const tema = process.argv[2];
if (!tema) {
  console.error('Uso: node scripts/prueba-sql.mjs <tema>   (un archivo de supabase/pruebas/)');
  process.exit(1);
}

const ruta = (nombre) => new URL(`../supabase/pruebas/${nombre}.sql`, import.meta.url);
if (!existsSync(ruta(tema))) {
  console.error(`No existe supabase/pruebas/${tema}.sql`);
  process.exit(1);
}

const sql = [
  readFileSync(ruta('00-ayudas'), 'utf8'),
  readFileSync(ruta(tema), 'utf8'),
  'select caso, ok, obtenido from pg_temp.probar() order by ok, caso;',
].join('\n\n');

writeFileSync(new URL('../supabase/pruebas/.armado.sql', import.meta.url), sql);
console.log(`listo: supabase/pruebas/.armado.sql (${sql.length} caracteres). Pasalo entero a execute_sql.`);
