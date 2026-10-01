import { describe, expect, it } from 'vitest';
import { sqlDeMigraciones, tabla, ultimaFuncion } from '../pruebas/migraciones.js';

/*
 * Perfiles (spec §5.1). Lo público y lo privado de una cuenta van en tablas
 * separadas porque la RLS es por fila: si el rol o el WhatsApp estuvieran en
 * `perfiles`, un `select=*` público los traería (bagayí 005 y §10).
 */
const sql = sqlDeMigraciones();

describe('perfiles', () => {
  it('perfiles no tiene nada privado', () => {
    const t = tabla(sql, 'perfiles');
    expect(t).not.toBe('');
    expect(t).not.toMatch(/\b(rol|suspendido|whatsapp\w*)\b/);
  });

  it('el rol, la suspensión y el WhatsApp viven en perfiles_privados', () => {
    const t = tabla(sql, 'perfiles_privados');
    expect(t).toMatch(/\brol public\.rol_perfil\b/);
    expect(t).toMatch(/\bsuspendido boolean\b/);
    expect(t).toMatch(/\bwhatsapp_por_defecto text\b/);
  });

  it('anon no tiene ningún permiso sobre perfiles_privados', () => {
    expect(sql).toMatch(/revoke all on public\.perfiles_privados from anon;/);
  });

  it('nadie inserta perfiles desde la API: no hay policy de insert', () => {
    expect(sql).not.toMatch(/on public\.perfiles(_privados)? for (insert|all)\b/);
  });

  it('las dos filas las crea el alta en auth.users', () => {
    expect(sql).toMatch(/create trigger auth_alta_de_perfil after insert on auth\.users/);
  });

  it('es_admin mira el rol y que la cuenta no esté borrada', () => {
    const f = ultimaFuncion(sql, 'privado.es_admin');
    expect(f).toMatch(/pp\.rol = 'admin'/);
    expect(f).toMatch(/p\.eliminado_en is null/);
  });

  // Como en bagayí: la regla vale también para quien opera la base a mano.
  it('siempre un admin no le abre la puerta a nadie', () => {
    const f = ultimaFuncion(sql, 'privado.siempre_un_admin');
    expect(f).toMatch(/raise exception 'Es el único admin/);
    expect(f).not.toMatch(/auth\.uid\(\)/);
  });

  it('los blindajes corren antes que siempre un admin', () => {
    expect(sql).toMatch(/create trigger perfiles_a_blindar before update on public\.perfiles/);
    expect(sql).toMatch(/create trigger perfiles_b_siempre_un_admin\s+before update of eliminado_en or delete on public\.perfiles/);
    expect(sql).toMatch(/create trigger privados_a_blindar before update on public\.perfiles_privados/);
    expect(sql).toMatch(/create trigger privados_b_siempre_un_admin\s+before update of rol or delete on public\.perfiles_privados/);
  });
});
