import { describe, expect, it } from 'vitest';
import { simplificarAnillo } from './simplificar.mjs';

describe('simplificarAnillo', () => {
  it('saca los puntos que no cambian la forma', () => {
    const conSobrantes = [[0, 0], [5, 0.1], [10, 0], [10, 10], [5, 10.1], [0, 10], [0, 0]];
    expect(simplificarAnillo(conSobrantes, 1)).toEqual([[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]);
  });

  it('conserva lo que se aparta más que la tolerancia', () => {
    const conPico = [[0, 0], [5, 3], [10, 0], [10, 10], [0, 10], [0, 0]];
    expect(simplificarAnillo(conPico, 1)).toContainEqual([5, 3]);
  });

  it('nunca deja un anillo de menos de cuatro puntos', () => {
    const chiquito = [[0, 0], [0.1, 0], [0.1, 0.1], [0, 0.1], [0, 0]];
    expect(simplificarAnillo(chiquito, 10).length).toBeGreaterThanOrEqual(4);
  });
});
