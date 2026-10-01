import { describe, expect, it } from 'vitest';
import { cabecerasDeFunciones, sqlDeMigraciones, tabla, tablasPublicas } from '../pruebas/migraciones.js';

/*
 * Auditoría de la base, sobre las migraciones del disco. Es la «auditoría 3»
 * de bagayí (HANDOFF §4.3) hecha test: se repite sola en cada `npm test`.
 */
const sql = sqlDeMigraciones();

describe('auditoría de la base', () => {
  it('toda tabla de public tiene RLS', () => {
    const sinRls = tablasPublicas(sql).filter(
      (t) => !new RegExp(`alter table public\\.${t} enable row level security`, 'i').test(sql),
    );
    expect(sinRls).toEqual([]);
  });

  // Sin search_path fijo, una función security definer resuelve nombres con el
  // search_path de quien la llama: alguien crea un `public.now()` propio y la
  // función lo usa con los permisos del dueño.
  it('toda función security definer fija el search_path', () => {
    const sinPath = cabecerasDeFunciones(sql)
      .filter((f) => /security definer/i.test(f.cabecera) && !/set search_path/i.test(f.cabecera))
      .map((f) => f.nombre);
    expect(sinPath).toEqual([]);
  });

  // PostgREST publica toda función de un esquema expuesto. Una de trigger no
  // tiene por qué ser un endpoint (bagayí 055): se le saca el execute.
  it('ninguna función de trigger se puede llamar desde la API', () => {
    const expuestas = cabecerasDeFunciones(sql)
      .filter((f) => /returns trigger/i.test(f.cabecera))
      .map((f) => f.nombre)
      .filter((n) => !new RegExp(`revoke (all|execute) on function ${n.replace('.', '\\.')}\\(\\) from public, anon, authenticated`, 'i').test(sql));
    expect(expuestas).toEqual([]);
  });

  // La regla que manda sobre el mapa (spec §5.3): el punto exacto no se guarda.
  it('ninguna columna guarda un punto exacto', () => {
    expect(sql).not.toMatch(/punto_(exacto|original|real)/i);
  });

  // Sin índice, borrar una fila madre (una cuenta, un aviso) recorre la tabla
  // hija entera, y los topes por día cuentan sin índice. Es el advisor
  // «unindexed_foreign_keys» de Supabase, hecho test.
  it('toda clave foránea tiene un índice que empieza por ella', () => {
    const sinIndice = [];
    for (const t of tablasPublicas(sql)) {
      const bloque = tabla(sql, t);
      const pk = bloque.match(/primary key \(([a-z_]+)/)?.[1] ?? bloque.match(/^\s+([a-z_]+) [^\n]*primary key/m)?.[1];
      for (const [, col] of bloque.matchAll(/^\s+([a-z_]+) [^\n]*references /gm)) {
        const indice = new RegExp(`create (unique )?index \\w+ on public\\.${t} (using \\w+ )?\\(${col}[,)]`);
        if (col !== pk && !indice.test(sql)) sinIndice.push(`${t}.${col}`);
      }
    }
    expect(sinIndice).toEqual([]);
  });

  // Dos policies permisivas para el mismo rol y la misma acción se evalúan las
  // dos en cada consulta (advisor «multiple_permissive_policies»). Se recorren
  // en orden, así un `drop policy` posterior saca la vieja.
  it('ninguna tabla tiene dos policies permisivas para el mismo rol y acción', () => {
    const vigentes = new Map();
    const sentencias = /(create|drop) policy (?:if exists )?([a-z_]+) on public\.([a-z_]+)(?: for (select|insert|update|delete|all))?(?: to ([a-z_, ]+?))?(?=\s+(?:using|with)|;)/gi;
    for (const [, que, nombre, t, accion = 'all', roles] of sql.matchAll(sentencias)) {
      if (que.toLowerCase() === 'drop') vigentes.delete(`${t}.${nombre}`);
      else vigentes.set(`${t}.${nombre}`, { nombre, t, accion, roles });
    }
    const porClave = {};
    for (const { nombre, t, accion, roles } of vigentes.values()) {
      const acciones = accion === 'all' ? ['select', 'insert', 'update', 'delete'] : [accion];
      const quienes = roles ? roles.split(',').map((r) => r.trim()) : ['anon', 'authenticated'];
      for (const a of acciones) for (const r of quienes) (porClave[`${t} ${a} ${r}`] ??= []).push(nombre);
    }
    expect(Object.entries(porClave).filter(([, n]) => n.length > 1)).toEqual([]);
  });
});
