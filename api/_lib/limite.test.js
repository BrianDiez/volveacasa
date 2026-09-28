import { describe, expect, it, vi } from 'vitest';
import { claveDeCuota, dentroDeCuota, ipDeLaPeticion } from './limite.js';

const pedido = (headers = {}, socket = {}) => ({ headers, socket });

/** Base falsa: sólo necesita .rpc(). Se inyecta, no se mockea el módulo. */
function baseFalsa(respuesta) {
  const llamadas = [];
  return {
    llamadas,
    rpc: (nombre, params) => {
      llamadas.push({ nombre, params });
      return Promise.resolve(respuesta);
    },
  };
}

describe('ipDeLaPeticion', () => {
  it('toma el primero de x-forwarded-for, que es el cliente', () => {
    expect(ipDeLaPeticion(pedido({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1, 10.0.0.2' })))
      .toBe('1.2.3.4');
  });

  it('acepta x-forwarded-for como arreglo', () => {
    expect(ipDeLaPeticion(pedido({ 'x-forwarded-for': ['5.6.7.8, 10.0.0.1'] }))).toBe('5.6.7.8');
  });

  it('cae a x-real-ip si no hay forwarded-for', () => {
    expect(ipDeLaPeticion(pedido({ 'x-real-ip': '9.9.9.9' }))).toBe('9.9.9.9');
  });

  it('cae al socket como último recurso', () => {
    expect(ipDeLaPeticion(pedido({}, { remoteAddress: '7.7.7.7' }))).toBe('7.7.7.7');
  });

  it('no rompe cuando no hay ninguna pista de la IP', () => {
    expect(ipDeLaPeticion(pedido())).toBe('desconocida');
  });

  it('ignora un x-forwarded-for vacío', () => {
    expect(ipDeLaPeticion(pedido({ 'x-forwarded-for': '   ', 'x-real-ip': '8.8.8.8' })))
      .toBe('8.8.8.8');
  });
});

describe('claveDeCuota', () => {
  it('usa el id del usuario cuando hay sesión', () => {
    const c = claveDeCuota({ endpoint: 'crear', usuario: { id: 'u1' }, req: pedido() });
    expect(c).toBe('crear:u:u1');
  });

  it('usa la IP cuando no hay sesión', () => {
    const c = claveDeCuota({ endpoint: 'crear', usuario: null, req: pedido({ 'x-forwarded-for': '1.2.3.4' }) });
    expect(c).toBe('crear:ip:1.2.3.4');
  });

  it('separa la cuota por endpoint', () => {
    const a = claveDeCuota({ endpoint: 'crear', usuario: { id: 'u1' }, req: pedido() });
    const b = claveDeCuota({ endpoint: 'liberar', usuario: { id: 'u1' }, req: pedido() });
    expect(a).not.toBe(b);
  });
});

describe('dentroDeCuota', () => {
  it('deja pasar cuando la base dice que hay cuota', async () => {
    const db = baseFalsa({ data: { permitido: true }, error: null });
    expect((await dentroDeCuota(db, { clave: 'k', limite: 5, ventanaSeg: 60 })).permitido).toBe(true);
  });

  it('corta cuando la base dice que se pasó', async () => {
    const db = baseFalsa({ data: { permitido: false }, error: null });
    expect((await dentroDeCuota(db, { clave: 'k', limite: 5, ventanaSeg: 60 })).permitido).toBe(false);
  });

  // Regresión: la implementación apuntaba a privado.consumir_cuota, y PostgREST
  // sólo resuelve funciones de `public`. La llamada devolvía PGRST202, caía en
  // la rama de error y el rate limiting quedaba MUERTO dejando pasar todo.
  it('llama a la función de public, que es la única que PostgREST resuelve', async () => {
    const db = baseFalsa({ data: { permitido: true }, error: null });
    await dentroDeCuota(db, { clave: 'k', limite: 5, ventanaSeg: 60 });
    expect(db.llamadas[0].nombre).toBe('consumir_cuota');
    expect(db.llamadas[0].params).toEqual({ p_clave: 'k', p_limite: 5, p_ventana_seg: 60 });
  });

  it('deja pasar si el contador falla: mejor no limitar un rato que voltear el checkout', async () => {
    const aviso = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const db = baseFalsa({ data: null, error: { message: 'se cayó la base' } });
    const r = await dentroDeCuota(db, { clave: 'k', limite: 5, ventanaSeg: 60 });
    expect(r).toMatchObject({ permitido: true, degradado: true });
    aviso.mockRestore();
  });
});
