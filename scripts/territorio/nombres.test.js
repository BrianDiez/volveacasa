import { describe, expect, it } from 'vitest';
import { BARRIOS, campo, clave, nombreBarrio, nombreDepartamento, nombreLocalidad } from './nombres.mjs';

describe('clave', () => {
  it('iguala mayúsculas, tildes y guiones bajos', () => {
    expect(clave('San José')).toBe(clave('SAN_JOSE'));
    expect(clave('Paysandú')).toBe('PAYSANDU');
  });
});

describe('nombreDepartamento', () => {
  it('acepta el nombre del INE o el código ISO', () => {
    expect(nombreDepartamento('SAN JOSE')).toBe('San José');
    expect(nombreDepartamento('TREINTA_Y_TRES')).toBe('Treinta y Tres');
    expect(nombreDepartamento('UY-RN')).toBe('Río Negro');
  });

  it('lo desconocido frena la carga', () => {
    expect(() => nombreDepartamento('ATLANTIDA')).toThrow(/Departamento desconocido/);
  });
});

describe('nombreBarrio', () => {
  it('traduce los 62 barrios del INE', () => {
    expect(Object.keys(BARRIOS)).toHaveLength(62);
    expect(nombreBarrio('PQUE BATLLE VILLA DOLORES')).toBe('Parque Batlle, Villa Dolores');
    expect(nombreBarrio('MALVIN')).toBe('Malvín');
    expect(nombreBarrio('Pocitos')).toBe('Pocitos');
  });

  it('un barrio sin traducción frena la carga', () => {
    expect(() => nombreBarrio('BARRIO NUEVO')).toThrow(/sin nombre para mostrar/);
  });
});

describe('nombreLocalidad', () => {
  it('pasa a tipo título con las partículas en minúscula', () => {
    expect(nombreLocalidad('LAS PIEDRAS')).toBe('Las Piedras');
    expect(nombreLocalidad('CIUDAD DE LA COSTA')).toBe('Ciudad de la Costa');
    expect(nombreLocalidad('PASO DE LOS TOROS')).toBe('Paso de los Toros');
    expect(nombreLocalidad('GRAL. ENRIQUE MARTINEZ')).toBe('Gral. Enrique Martinez');
    expect(nombreLocalidad('VILLA DEL CARMEN (DURAZNO)')).toBe('Villa del Carmen (Durazno)');
  });
});

describe('campo', () => {
  it('toma la primera columna que exista, sin importar mayúsculas', () => {
    expect(campo({ NOMLOC: 'SALTO', depto: '15' }, ['nombre', 'nomloc'])).toBe('SALTO');
  });

  it('si no está ninguna, dice cuáles había', () => {
    expect(() => campo({ a: 1 }, ['nomloc'])).toThrow(/Columnas: a/);
  });
});
