import { describe, expect, it } from 'vitest';
import { sqlDeMigraciones } from '../pruebas/migraciones.js';
import { FLAGS, MODULOS, estaActivo } from './modulos.js';

/*
 * El registro del código contra las filas que siembra la base. Si se separan,
 * el panel del admin muestra un switch que no hace nada, o un módulo prendido
 * no aparece en ningún lado (spec §8).
 */
// Anclado a las filas del insert (renglón que empieza con sangría y «(»): sin
// eso, `create type … as enum ('modulo', 'flag')` se leía como la clave «modulo».
const sembrados = [...sqlDeMigraciones().matchAll(/^\s+\('([a-z_]+)', '(modulo|flag)'\)/gm)]
  .map(([, clave, tipo]) => `${clave}:${tipo}`).sort();

describe('registro de módulos', () => {
  it('tiene exactamente las claves que siembra la base', () => {
    const enCodigo = [
      ...Object.keys(MODULOS).map((c) => `${c}:modulo`),
      ...Object.keys(FLAGS).map((c) => `${c}:flag`),
    ].sort();
    expect(enCodigo).toEqual(sembrados);
  });

  it('cada módulo tiene nombre, descripción y una ruta propia', () => {
    const rutas = Object.values(MODULOS).map((m) => m.ruta);
    expect(new Set(rutas).size).toBe(rutas.length);
    for (const m of Object.values(MODULOS)) {
      expect(m.ruta).toMatch(/^\/[a-z-]+$/);
      expect(m.nombre).toBeTruthy();
      expect(m.descripcion).toBeTruthy();
    }
  });
});

describe('estaActivo', () => {
  it('lo que no está, está apagado', () => {
    expect(estaActivo([], 'veterinarias')).toBe(false);
    expect(estaActivo(null, 'veterinarias')).toBe(false);
  });

  it('lee el switch de la fila', () => {
    const filas = [{ clave: 'veterinarias', activo: true }, { clave: 'historias', activo: false }];
    expect(estaActivo(filas, 'veterinarias')).toBe(true);
    expect(estaActivo(filas, 'historias')).toBe(false);
  });
});
