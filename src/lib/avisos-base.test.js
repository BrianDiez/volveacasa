import { describe, expect, it } from 'vitest';
import { sqlDeMigraciones, tabla, ultimaFuncion } from '../pruebas/migraciones.js';

/* Avisos (spec §5.1 y §5.4). */
const sql = sqlDeMigraciones();

describe('avisos', () => {
  it('el WhatsApp no está en avisos: va en contactos_aviso, que anon no lee', () => {
    expect(tabla(sql, 'avisos')).not.toMatch(/whatsapp|telefono/i);
    expect(tabla(sql, 'contactos_aviso')).toMatch(/whatsapp text not null/);
    expect(sql).toMatch(/revoke all on public\.contactos_aviso from anon;/);
  });

  it('nunca se venden animales: no hay precio', () => {
    expect(tabla(sql, 'avisos')).not.toMatch(/precio|monto/i);
  });

  it('blindar corre antes que ubicar, en el alta y en la edición', () => {
    expect(sql).toMatch(/create trigger avisos_a_blindar before insert or update on public\.avisos/);
    expect(sql).toMatch(/create trigger avisos_b_ubicar before insert or update on public\.avisos\s+for each row execute function privado\.ubicar_y_redondear\(\)/);
  });

  it('en el alta con sesión, la base pisa autor, estado y vigencia', () => {
    const f = ultimaFuncion(sql, 'privado.avisos_blindar');
    expect(f).toMatch(/new\.autor_id := yo;/);
    expect(f).toMatch(/new\.estado := 'activo';/);
    expect(f).toMatch(/new\.vence_en := now\(\) \+ plazo;/);
  });

  it('renovar es la única puerta para cambiar la vigencia', () => {
    const f = ultimaFuncion(sql, 'privado.avisos_blindar');
    expect(f).toMatch(/operacion = 'renovar'/);
    expect(f).toMatch(/renovalo desde Mis avisos/);
    expect(ultimaFuncion(sql, 'public.renovar_aviso')).toMatch(/security invoker/);
  });

  it('las fotos van en la carpeta de su aviso', () => {
    expect(tabla(sql, 'fotos_aviso')).toMatch(/path like \('avisos\/' \|\| aviso_id::text \|\| '\/%'\)/);
  });
});
