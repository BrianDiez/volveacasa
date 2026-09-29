import { Link } from 'react-router-dom';
import { Vacio } from '../ui/kit';
import { MODULOS } from '../lib/modulos';

/*
 * La ruta de un módulo apagado (spec §8). En la fase 1 todos lo están y ninguno
 * tiene pantallas: cada spec de módulo reemplaza esto por su página cuando se
 * prende.
 */
export function ModuloApagado({ clave }) {
  const { nombre } = MODULOS[clave];
  return (
    <div className="contenedor pagina">
      <Vacio
        titulo="Todavía no está disponible"
        texto={`Estamos preparando ${nombre}. Mientras tanto, podés buscar o publicar un aviso.`}
        accion={<Link to="/">Ir al inicio</Link>}
      />
    </div>
  );
}
