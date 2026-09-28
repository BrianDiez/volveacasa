import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/*
 * Los colores del sitio contra los que se midieron.
 *
 * `design-src/contrastes.mjs` mide cada par de colores que se usa (contraste
 * WCAG y cuánto se parece la marca a los estados) y la maqueta se aprobó con
 * esas medidas. Si alguien cambia un color en `tokens.css` sin tocar el
 * script, el sitio deja de ser lo que se midió y nada lo avisa. Esto sí.
 *
 * Se leen los dos archivos del disco, como hace bagayí con las migraciones:
 * comparar contra el código fuente y no contra la memoria de uno.
 */
const leer = (ruta) => readFileSync(new URL(ruta, import.meta.url), 'utf8');

const css = leer('./tokens.css');
const script = leer('../../design-src/contrastes.mjs');

/** `--nombre: #RRGGBB` del bloque :root. */
const tokensDeCss = () => {
  const raiz = css.match(/:root \{([\s\S]*?)\n\}/)[1];
  return Object.fromEntries(
    [...raiz.matchAll(/--([a-z-]+):\s*(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2].toUpperCase()]),
  );
};

/** Los que mide el script: la base más la marca aprobada (frambuesa). */
const tokensMedidos = () => {
  const bloque = (patron) => Object.fromEntries(
    [...script.match(patron)[1].matchAll(/'?([a-z-]+)'?: '(#[0-9A-F]{6})'/g)].map((m) => [m[1], m[2]]),
  );
  return {
    ...bloque(/const base = \{([\s\S]*?)\};/),
    ...bloque(/frambuesa: \{([\s\S]*?)\}/),
  };
};

describe('tokens.css', () => {
  it('tiene exactamente los colores que se midieron para la maqueta aprobada', () => {
    const enCss = tokensDeCss();
    const medidos = tokensMedidos();
    delete medidos.blanco; // es #FFFFFF, no un token

    const distintos = Object.entries(medidos)
      .filter(([nombre, valor]) => enCss[nombre] !== valor)
      .map(([nombre, valor]) => `--${nombre}: css ${enCss[nombre] ?? 'falta'}, medido ${valor}`);

    expect(distintos).toEqual([]);
  });

  it('la marca es la frambuesa aprobada, no la terracota descartada', () => {
    expect(tokensDeCss().marca).toBe('#BE185D');
  });
});
