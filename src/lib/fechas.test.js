import { describe, expect, it } from 'vitest';
import { aFecha, diasOrdenados } from './fechas.js';

describe('aFecha', () => {
  it('convierte un ISO', () => {
    expect(aFecha('2026-09-10T12:00:00Z').toISOString()).toBe('2026-09-10T12:00:00.000Z');
  });

  it('deja pasar un Date tal cual', () => {
    const d = new Date('2026-09-10T12:00:00Z');
    expect(aFecha(d)).toBe(d);
  });

  it('acepta un timestamp', () => {
    expect(aFecha(0).toISOString()).toBe('1970-01-01T00:00:00.000Z');
  });

  /*
   * El caso que originó el módulo. `new Date(null)` devuelve 1970-01-01 y no
   * NaN, así que sin la guarda explícita un campo nulo se convertía en una
   * fecha válida en el pasado — y una fecha en el pasado abre cualquier ventana
   * de vencimiento. Si alguien "simplifica" este módulo borrando la primera
   * línea, este test es el que lo frena.
   */
  it('null NO es 1970: es null', () => {
    expect(aFecha(null)).toBeNull();
  });

  it.each([undefined, '', 'cualquier cosa', 'NaN', {}, []])('%s no es una fecha', (valor) => {
    expect(aFecha(valor)).toBeNull();
  });

  it('el 0 sí es una fecha, pero null no: no se confunden', () => {
    expect(aFecha(0)).not.toBeNull();
    expect(aFecha(null)).toBeNull();
  });
});

describe('diasOrdenados', () => {
  // 0=Domingo … 6=Sábado, la convención de Date.getDay() que usa DIAS.
  it('ordena de lunes a domingo, no por el número crudo', () => {
    // El caso real que se reportó: "miércoles, lunes, martes, jueves, viernes".
    expect(diasOrdenados([3, 1, 2, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });

  /*
   * El que discrimina de verdad. Un `.sort()` a secas pondría el domingo
   * primero, porque vale 0. Acá la semana se lee de lunes a domingo.
   */
  it('el domingo va ÚLTIMO, no primero', () => {
    expect(diasOrdenados([0, 1])).toEqual([1, 0]);
    expect(diasOrdenados([6, 0, 1])).toEqual([1, 6, 0]);
    expect(diasOrdenados([0, 6, 3])).toEqual([3, 6, 0]);
  });

  it('la semana entera queda lunes → domingo', () => {
    expect(diasOrdenados([0, 1, 2, 3, 4, 5, 6])).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });

  it('no muta el arreglo que recibe: viene del estado de React', () => {
    const original = [3, 1, 2];
    const copia = [...original];
    diasOrdenados(original);
    expect(original).toEqual(copia);
  });

  it('tolera lo que no es una lista en vez de romper la pantalla', () => {
    expect(diasOrdenados(null)).toEqual([]);
    expect(diasOrdenados(undefined)).toEqual([]);
    expect(diasOrdenados([])).toEqual([]);
  });
});
