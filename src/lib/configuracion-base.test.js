import { describe, expect, it } from 'vitest';
import { sqlDeMigraciones, ultimaFuncion } from '../pruebas/migraciones.js';

/* Configuración (spec §5.2) y módulos (spec §8). */
const sql = sqlDeMigraciones();

const CLAVES = [
  'vence_perdido_dias', 'vence_encontrado_dias', 'vence_adopcion_dias',
  'vigencia_avistamiento_horas',
  'grilla_perdido_m', 'grilla_encontrado_m', 'grilla_adopcion_m', 'grilla_avistamiento_m',
  'tope_avisos_por_dia', 'tope_avistamientos_por_dia',
  'parecidos_km', 'parecidos_dias', 'umbral_contador', 'redes_vence_horas',
  'denuncias_para_ocultar', 'antiguedad_denunciante_horas',
];

describe('configuración', () => {
  it('siembra las 16 claves del spec', () => {
    for (const c of CLAVES) expect(sql).toMatch(new RegExp(`\\('${c}', '`));
  });

  // Una grilla chica es un punto que se acerca a la casa de alguien.
  it('ninguna grilla puede bajar de 50 metros', () => {
    const f = ultimaFuncion(sql, 'privado.configuracion_valida');
    expect(f).toMatch(/like 'grilla_%'/);
    expect(f).toMatch(/< 50/);
  });

  it('una clave que falta frena en vez de inventar un valor', () => {
    expect(ultimaFuncion(sql, 'privado.config_numero')).toMatch(/raise exception 'Falta la configuración/);
  });

  it('las filas las siembra la migración: sin insert ni delete por la API', () => {
    expect(sql).not.toMatch(/on public\.(configuracion|modulos) for (insert|delete|all)\b/);
  });
});
