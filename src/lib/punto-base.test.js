import { describe, expect, it } from 'vitest';
import { sqlDeMigraciones, ultimaFuncion } from '../pruebas/migraciones.js';

/* El punto: la regla que manda sobre el mapa (spec §5.3). */
const sql = sqlDeMigraciones();

describe('el punto', () => {
  // En grados, «400 m» no mide lo mismo en todo el país: se redondea en UTM 21S.
  it('se redondea en metros, en UTM 21S', () => {
    const f = ultimaFuncion(sql, 'privado.redondear_punto');
    expect(f).toMatch(/st_transform\(p::extensions\.geometry, 32721\)/);
    expect(f).toMatch(/st_snaptogrid/);
  });

  // Redondeado, un punto de la rambla puede caer al agua.
  it('la zona se calcula con el punto exacto, antes de redondearlo', () => {
    const f = ultimaFuncion(sql, 'privado.ubicar_y_redondear');
    expect(f.indexOf('privado.ubicar(')).toBeGreaterThan(-1);
    expect(f.indexOf('privado.ubicar(')).toBeLessThan(f.indexOf('privado.redondear_punto('));
    expect(f).toMatch(/new\.punto := privado\.redondear_punto\(/);
  });

  it('la grilla sale de la configuración, según el tipo', () => {
    const f = ultimaFuncion(sql, 'privado.ubicar_y_redondear');
    expect(f).toMatch(/privado\.config_numero\(/);
    expect(f).toMatch(/'grilla_avistamiento_m'/);
  });

  it('fuera de Uruguay se rechaza y fuera de toda localidad es zona rural', () => {
    const f = ultimaFuncion(sql, 'privado.ubicar');
    expect(f).toMatch(/El punto tiene que estar en Uruguay/);
    expect(f).toMatch(/'Zona rural de '/);
  });
});
