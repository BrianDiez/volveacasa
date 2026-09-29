import { describe, expect, it } from 'vitest';
import { sqlDeMigraciones, tabla } from '../pruebas/migraciones.js';
import { DEPARTAMENTOS } from './constants.js';

/*
 * Los departamentos de la base contra los del código: los filtros eligen de
 * `DEPARTAMENTOS`, y si las listas se separan («Paysandu» sin tilde) el filtro
 * ofrece un valor que no trae nada (bagayí, constants-departamentos.test.js).
 */
const sql = sqlDeMigraciones();

describe('territorio', () => {
  it('departamentos acepta exactamente los 19 del código', () => {
    const t = tabla(sql, 'departamentos');
    const lista = [...t.matchAll(/'([^']+)'/g)].map((m) => m[1]).sort();
    expect(lista).toEqual([...DEPARTAMENTOS].sort());
  });

  it('las zonas son barrios o localidades de un departamento', () => {
    expect(sql).toMatch(/create type public\.tipo_zona as enum \('barrio', 'localidad'\)/);
    expect(tabla(sql, 'zonas')).toMatch(/departamento text not null references public\.departamentos \(nombre\)/);
  });

  it('los polígonos sólo se leen: los carga el servidor', () => {
    expect(sql).not.toMatch(/on public\.(departamentos|zonas) for (insert|update|delete|all)\b/);
  });
});
