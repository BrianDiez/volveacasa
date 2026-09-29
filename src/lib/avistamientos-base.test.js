import { describe, expect, it } from 'vitest';
import { sqlDeMigraciones, tabla, ultimaFuncion } from '../pruebas/migraciones.js';

/* Avistamientos (spec §2.12 y §5.4). */
const sql = sqlDeMigraciones();

describe('avistamientos', () => {
  it('no guardan datos de contacto de quien los carga', () => {
    expect(tabla(sql, 'avistamientos')).not.toMatch(/whatsapp|telefono|email/i);
  });

  it('vencen a las N horas de visto, no de cargado', () => {
    expect(ultimaFuncion(sql, 'privado.avistamientos_blindar'))
      .toMatch(/new\.vence_en := new\.visto_en \+ make_interval\(hours => vigencia::integer\)/);
  });

  it('usan el mismo trigger del punto que los avisos, después del blindaje', () => {
    expect(sql).toMatch(/create trigger avistamientos_a_blindar before insert or update on public\.avistamientos/);
    expect(sql).toMatch(/create trigger avistamientos_b_ubicar before insert or update on public\.avistamientos\s+for each row execute function privado\.ubicar_y_redondear\(\)/);
  });

  it('si el aviso se borra, el avistamiento queda suelto', () => {
    expect(tabla(sql, 'avistamientos')).toMatch(/aviso_id uuid references public\.avisos \(id\) on delete set null/);
  });
});
