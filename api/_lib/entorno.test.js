import { describe, expect, it } from 'vitest';
import { numeroDeEntorno, textoDeEntorno } from './entorno.js';

/*
 * Estas pruebas nacen de un caso real medido en producción.
 *
 * En Vercel las variables MP_* y PUBLIC_SITE_URL existían pero estaban VACÍAS.
 * `process.env.X ?? porDefecto` no las cubre: `??` sólo cae al respaldo con
 * null o undefined, y un string vacío pasa derecho. El respaldo no protege.
 *
 * Medido contra https://bagayo.vercel.app: `/api/mp/oauth?action=url` devolvía
 * un redirect_uri de "/api/mp/oauth", sin host, porque SITIO quedaba en "".
 */

describe('textoDeEntorno', () => {
  it('usa el respaldo cuando la variable está VACÍA (el caso de producción)', () => {
    expect(textoDeEntorno('', 'http://localhost:5173')).toBe('http://localhost:5173');
  });

  it('usa el respaldo cuando la variable es sólo espacios', () => {
    expect(textoDeEntorno('   ', 'http://localhost:5173')).toBe('http://localhost:5173');
  });

  it('usa el respaldo cuando la variable no está definida', () => {
    expect(textoDeEntorno(undefined, 'http://localhost:5173')).toBe('http://localhost:5173');
  });

  it('respeta el valor cuando la variable está bien puesta', () => {
    expect(textoDeEntorno('https://bagayo.vercel.app', 'http://localhost:5173'))
      .toBe('https://bagayo.vercel.app');
  });

  it('le saca los espacios de los costados', () => {
    expect(textoDeEntorno('  https://bagayo.vercel.app  ', 'x')).toBe('https://bagayo.vercel.app');
  });
});

describe('numeroDeEntorno', () => {
  it('NO convierte una variable vacía en cero: es la comisión del marketplace', () => {
    // Number('') es 0. Con eso bagayí cobraría 0% en cada venta, en silencio.
    expect(numeroDeEntorno('', 8)).toBe(8);
  });

  it('NO convierte una variable vacía en cero para el timeout de MP', () => {
    // AbortSignal.timeout(0) aborta la llamada al instante.
    expect(numeroDeEntorno('', 15000)).toBe(15000);
  });

  it('respeta un cero puesto a propósito', () => {
    // Una comisión de 0% es una decisión válida; vacío no lo es.
    expect(numeroDeEntorno('0', 8)).toBe(0);
  });

  it('usa el respaldo cuando el valor no es un número', () => {
    expect(numeroDeEntorno('ocho', 8)).toBe(8);
  });

  it('usa el respaldo cuando la variable no está definida', () => {
    expect(numeroDeEntorno(undefined, 8)).toBe(8);
  });

  it('convierte un número bien puesto', () => {
    expect(numeroDeEntorno('8', 0)).toBe(8);
    expect(numeroDeEntorno('  6.5  ', 0)).toBe(6.5);
  });
});
