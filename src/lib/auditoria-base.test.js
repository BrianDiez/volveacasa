import { describe, expect, it } from 'vitest';
import { cabecerasDeFunciones, sqlDeMigraciones, tablasPublicas } from '../pruebas/migraciones.js';

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
});
