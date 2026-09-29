import { describe, expect, it } from 'vitest';
import { poligonosDeWkb, wkbDeGpb } from './gpkg.mjs';

/** WKB little-endian de un polígono de un anillo. */
function wkbPoligono(anillo, tipo = 3) {
  const b = Buffer.alloc(1 + 4 + 4 + 4 + anillo.length * 16);
  let o = b.writeUInt8(1, 0);
  o = b.writeUInt32LE(tipo, o);
  o = b.writeUInt32LE(1, o);
  o = b.writeUInt32LE(anillo.length, o);
  for (const [x, y] of anillo) { o = b.writeDoubleLE(x, o); o = b.writeDoubleLE(y, o); }
  return b;
}

const cuadrado = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]];

describe('wkbDeGpb', () => {
  it('saltea el encabezado GeoPackage con su envolvente', () => {
    const wkb = wkbPoligono(cuadrado);
    // 'GP', versión 0, flags: little-endian (bit 0) con envolvente XY (código 1, bits 1-3).
    const encabezado = Buffer.from([0x47, 0x50, 0, 0b0000_0011, 0, 0, 0, 0]);
    const gpb = Buffer.concat([encabezado, Buffer.alloc(32), wkb]);
    expect(wkbDeGpb(gpb).equals(wkb)).toBe(true);
  });

  it('rechaza lo que no es GeoPackage', () => {
    expect(() => wkbDeGpb(Buffer.from([1, 2, 3, 4]))).toThrow(/no es una geometría GeoPackage/);
  });
});

describe('poligonosDeWkb', () => {
  it('lee un polígono', () => {
    expect(poligonosDeWkb(wkbPoligono(cuadrado))).toEqual([[cuadrado]]);
  });

  it('lee un multipolígono de dos', () => {
    const uno = wkbPoligono(cuadrado);
    const cabeza = Buffer.alloc(9);
    cabeza.writeUInt8(1, 0);
    cabeza.writeUInt32LE(6, 1);
    cabeza.writeUInt32LE(2, 5);
    expect(poligonosDeWkb(Buffer.concat([cabeza, uno, uno]))).toEqual([[cuadrado], [cuadrado]]);
  });
});
