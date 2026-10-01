// Arma una prueba de la base para pasarla a execute_sql del MCP de Supabase:
// las ayudas, el tema y la consulta que corre los casos.
//
//   node scripts/prueba-sql.mjs perfiles
//   node scripts/prueba-sql.mjs todos     (todos los temas, para cerrar una fase)
//
// Deja el resultado en supabase/pruebas/.armado.sql (ignorado por git).
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

const tema = process.argv[2];
if (!tema) {
  console.error('Uso: node scripts/prueba-sql.mjs <tema|todos>   (un archivo de supabase/pruebas/)');
  process.exit(1);
}

const DIR = new URL('../supabase/pruebas/', import.meta.url);
const ruta = (nombre) => new URL(`${nombre}.sql`, DIR);
const ayudas = readFileSync(ruta('00-ayudas'), 'utf8');

let sql;
if (tema === 'todos') {
  // Cada tema define su `pg_temp.probar()`: se renombra a `probar_<tema>` para
  // que convivan en una sola consulta. Sale una fila por tema, con los casos
  // que fallaron; una migración nueva no puede romper la regla de una vieja
  // sin que se vea acá.
  const temas = readdirSync(DIR).filter((n) => n.endsWith('.sql') && !n.startsWith('00-') && !n.startsWith('.'))
    .map((n) => n.slice(0, -4)).sort();
  const funciones = temas.map((t) => readFileSync(ruta(t), 'utf8')
    .replace(/pg_temp\.probar\(\)/g, `pg_temp.probar_${t}()`));
  const corridas = temas.map((t) => `select '${t}' as tema, * from pg_temp.probar_${t}()`).join('\n  union all\n  ');
  sql = [
    ayudas,
    ...funciones,
    `select tema, count(*) filter (where ok) as pasan, count(*) as casos,
       string_agg(case when not ok then caso || ' → ' || obtenido end, ' | ') as fallan
  from (
  ${corridas}
  ) r group by tema order by tema;`,
  ].join('\n\n');
} else {
  if (!existsSync(ruta(tema))) {
    console.error(`No existe supabase/pruebas/${tema}.sql`);
    process.exit(1);
  }
  sql = [
    ayudas,
    readFileSync(ruta(tema), 'utf8'),
    'select caso, ok, obtenido from pg_temp.probar() order by ok, caso;',
  ].join('\n\n');
}

writeFileSync(new URL('../supabase/pruebas/.armado.sql', import.meta.url), sql);
console.log(`listo: supabase/pruebas/.armado.sql (${sql.length} caracteres). Pasalo entero a execute_sql.`);
