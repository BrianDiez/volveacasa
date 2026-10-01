import { describe, expect, it } from 'vitest';
import { sqlDeMigraciones } from '../pruebas/migraciones.js';

/*
 * El bucket `fotos` es público: sin tope de tipo, un .html subido se serviría
 * desde el dominio del proyecto (bagayí 012). Las fotos llegan achicadas del
 * navegador, así que 3 MB y WebP o JPEG alcanzan.
 */
const sql = sqlDeMigraciones();

describe('bucket fotos', () => {
  it('tiene tope de tamaño y de tipo', () => {
    expect(sql).toMatch(/values \('fotos', 'fotos', true, 3 \* 1024 \* 1024, array\['image\/webp', 'image\/jpeg'\]\)/);
  });

  it('el límite del cliente dice lo mismo que el del servidor', async () => {
    const { readFileSync } = await import('node:fs');
    const cliente = readFileSync(new URL('./supabase.js', import.meta.url), 'utf8');
    expect(cliente).toMatch(/fotos: \{ mb: 3, tipos: \['image\/webp', 'image\/jpeg'\] \}/);
  });
});
