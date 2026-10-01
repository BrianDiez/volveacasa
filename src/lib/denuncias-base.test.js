import { describe, expect, it } from 'vitest';
import { sqlDeMigraciones, ultimaFuncion } from '../pruebas/migraciones.js';

/* Ocultar por denuncias, con los tres resguardos (spec §5.4). */
const sql = sqlDeMigraciones();

describe('denuncias', () => {
  it('cuentan personas distintas, abiertas, con antigüedad', () => {
    const f = ultimaFuncion(sql, 'privado.ocultar_por_denuncias');
    expect(f).toMatch(/count\(distinct d\.denunciante_id\)/);
    expect(f).toMatch(/d\.estado = 'abierta'/);
    expect(f).toMatch(/d\.cuenta_para_ocultar/);
    expect(f).toMatch(/privado\.config_numero\('denuncias_para_ocultar'\)/);
  });

  it('la antigüedad la calcula la base, no el navegador', () => {
    const f = ultimaFuncion(sql, 'privado.denuncia_valida');
    expect(f).toMatch(/new\.cuenta_para_ocultar := /);
    expect(f).toMatch(/'antiguedad_denunciante_horas'/);
  });

  it('una protectora verificada no se oculta sola', () => {
    expect(ultimaFuncion(sql, 'privado.ocultar_por_denuncias')).toMatch(/privado\.es_protectora_verificada\(/);
  });

  it('lo oculta como denuncias, no como admin', () => {
    expect(ultimaFuncion(sql, 'privado.ocultar_por_denuncias')).toMatch(/oculto_por = 'denuncias'/);
  });

  it('el estado público no devuelve nada del contenido', () => {
    const f = ultimaFuncion(sql, 'privado.estado_publico');
    expect(f).toMatch(/returns text/);
    expect(f).toMatch(/'en_revision'/);
    expect(f).toMatch(/'no_existe'/);
  });

  // Lo que la API publica es invoker; lo que necesita saltear la RLS (ver un
  // oculto para decir «en revisión») vive en `privado`, que PostgREST no
  // expone. Advisors 0028 y 0029 de Supabase.
  it('la API publica estado_publico como invoker y lo privilegiado vive en privado', () => {
    expect(ultimaFuncion(sql, 'public.estado_publico')).toMatch(/security invoker/);
    expect(ultimaFuncion(sql, 'public.estado_publico')).toMatch(/privado\.estado_publico\(/);
    expect(ultimaFuncion(sql, 'privado.estado_publico')).toMatch(/security definer/);
  });
});
