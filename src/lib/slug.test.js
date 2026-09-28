import { describe, expect, it } from 'vitest';
import { aSlug, idCorto, idCortoDeSlug, slugDe } from './slug.js';

const UUID = '5beac740-92e2-4e4b-9535-ec85ef7b3961';

describe('aSlug', () => {
  it('saca las tildes del catálogo real', () => {
    expect(aSlug('Café Pilão Tradicional 500 g')).toBe('cafe-pilao-tradicional-500-g');
    expect(aSlug('Whisky Old Parr 12 años 1 L')).toBe('whisky-old-parr-12-anos-1-l');
    expect(aSlug('Pañales Pampers Confort Sec XG x60')).toBe('panales-pampers-confort-sec-xg-x60');
  });

  it('no deja guiones repetidos ni en las puntas', () => {
    expect(aSlug('  ¡¡Oferta!!  —  2x1  ')).toBe('oferta-2x1');
    expect(aSlug('a///b')).toBe('a-b');
  });

  it('un nombre que no deja nada usable da cadena vacía, no un guion suelto', () => {
    expect(aSlug('!!!')).toBe('');
    expect(aSlug('   ')).toBe('');
    expect(aSlug(null)).toBe('');
    expect(aSlug(undefined)).toBe('');
  });

  /*
   * La ñ no se descompone: si se tratara como n+tilde, "12 años" y "12 anos"
   * darían la misma URL. En rioplatense esa no es una confusión aceptable.
   */
  it('la ñ se convierte en n, pero por la lista y no por descomposición', () => {
    expect(aSlug('ñandú')).toBe('nandu');
    expect(aSlug('Niño')).toBe('nino');
  });
});

describe('idCorto', () => {
  it('son los primeros 8 del uuid', () => {
    expect(idCorto(UUID)).toBe('5beac740');
  });

  it('sin id no explota', () => {
    expect(idCorto(null)).toBe('');
    expect(idCorto(undefined)).toBe('');
  });
});

describe('slugDe', () => {
  it('arma nombre + id, que es lo que va en la URL', () => {
    expect(slugDe(UUID, 'Whisky Old Parr 12 años 1 L'))
      .toBe('whisky-old-parr-12-anos-1-l-5beac740');
  });

  it('sin nombre queda sólo el id: fea pero funciona', () => {
    expect(slugDe(UUID, '')).toBe('5beac740');
    expect(slugDe(UUID, null)).toBe('5beac740');
  });
});

describe('idCortoDeSlug', () => {
  it('lee la forma nueva', () => {
    expect(idCortoDeSlug('whisky-old-parr-12-anos-1-l-5beac740')).toBe('5beac740');
  });

  /*
   * Lo que hace que el cambio no rompa nada: los links con uuid completo que ya
   * están compartidos por ahí se siguen resolviendo.
   */
  it('sigue resolviendo un uuid completo, que es lo que tienen los links viejos', () => {
    expect(idCortoDeSlug(UUID)).toBe('5beac740');
    expect(idCortoDeSlug('22222222-2222-2222-2222-222222222222')).toBe('22222222');
  });

  it('acepta el id corto pelado', () => {
    expect(idCortoDeSlug('5beac740')).toBe('5beac740');
  });

  it('es ida y vuelta con slugDe', () => {
    expect(idCortoDeSlug(slugDe(UUID, 'Café Pilão'))).toBe(idCorto(UUID));
  });

  /*
   * El nombre es decorativo: cambiarlo NO cambia a dónde va el link. Es el
   * motivo entero por el que el id va al final en vez de usar slug puro.
   */
  it('renombrar el producto no cambia a dónde resuelve', () => {
    const antes = slugDe(UUID, 'Whisky Old Parr 12 años');
    const despues = slugDe(UUID, 'Whisky Old Parr 12 años 1 L — edición especial');
    expect(antes).not.toBe(despues);
    expect(idCortoDeSlug(antes)).toBe(idCortoDeSlug(despues));
  });

  it('basura da null y no una consulta a la base', () => {
    expect(idCortoDeSlug('')).toBeNull();
    expect(idCortoDeSlug(null)).toBeNull();
    expect(idCortoDeSlug('whisky-old-parr')).toBeNull();
    expect(idCortoDeSlug('no-es-un-id-zzzzzzzz')).toBeNull();
    expect(idCortoDeSlug('../../etc/passwd')).toBeNull();
  });

  it('no confunde un trozo de nombre de 8 letras con un id', () => {
    // "elefante" tiene 8 caracteres pero no es hexadecimal.
    expect(idCortoDeSlug('animal-elefante')).toBeNull();
    // "decadaaa" sí es hexadecimal: acá no hay forma de distinguir, y por eso
    // el slug SIEMPRE se genera con `slugDe`, que garantiza el id al final.
    expect(idCortoDeSlug('animal-decadaaa')).toBe('decadaaa');
  });
});
