import { useState } from 'react';

/**
 * Correr una operación contra la base y no perder el error si falla.
 *
 * ── Por qué existe ──────────────────────────────────────────────────────────
 *
 * El patrón `api.algo(id).then(recargar)` estaba repetido por todo el proyecto,
 * siempre sin `.catch`. Cuando la operación fallaba —la RLS rechazaba, se
 * cortaba la red— no pasaba absolutamente nada visible: la lista quedaba igual,
 * sin un mensaje, y el usuario deducía que el botón no andaba y volvía a
 * apretarlo. En "Pausar producto" eso significa que el vendedor cree que sacó
 * de la venta algo que sigue publicado.
 *
 * La cuenta escrita a mano en cada pantalla es la forma en que este proyecto ya
 * se equivocó cinco veces con los métodos de envío (§6.68): mientras cada
 * pantalla decida sola si maneja el error, va a haber una que no lo haga. Por
 * eso esto es un solo lugar y no un `catch` agregado en cada lado.
 *
 * ── Cómo se usa ─────────────────────────────────────────────────────────────
 *
 *   const { error, ocupado, correr } = useAccion(recargar);
 *   ...
 *   {error && <Aviso tono="rojo">{error}</Aviso>}
 *   <button onClick={() => correr(() => productos.borrar(id))} disabled={ocupado}>
 *
 * `alTerminar` corre SÓLO si la operación salió bien: normalmente `recargar`.
 * `correr` devuelve true/false por si quien llama necesita seguir decidiendo
 * (cerrar un formulario, navegar), y nunca tira: el error ya quedó a la vista.
 *
 * OJO: el `<Aviso>` tiene que estar donde se vea. Un error que se setea en una
 * sección que está cerrada es el mismo silencio que no tener catch.
 */
export function useAccion(alTerminar) {
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  async function correr(operacion) {
    setError(null);
    setOcupado(true);
    try {
      await operacion();
      alTerminar?.();
      return true;
    } catch (e) {
      setError(e?.message ?? 'No pudimos completar la operación.');
      return false;
    } finally {
      setOcupado(false);
    }
  }

  return { error, ocupado, correr, limpiarError: () => setError(null) };
}
