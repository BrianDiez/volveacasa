import { Link } from 'react-router-dom';
import { Icono } from '../ui/kit';

/*
 * Inicio provisorio del Paso 2: las cuatro entradas de la maqueta (01 y 18),
 * sin datos. El feed, el contador y «Volvieron a casa» llegan con la fase
 * «Ver y contactar», cuando existan los avisos.
 *
 * La diferencia entre «Encontré» (lo tengo) y «Vi» (lo vi y no lo tengo) va
 * explicada en una línea debajo de cada entrada: es la confusión que más
 * ensucia los datos en los grupos de Facebook.
 */
export const ENTRADAS = [
  { a: '/publicar?tipo=perdido', icono: Icono.lupa, titulo: 'Perdí a mi mascota', bajada: 'Armá el aviso y compartilo en dos minutos.' },
  { a: '/publicar?tipo=encontrado', icono: Icono.huella, titulo: 'Encontré una mascota', bajada: 'La tengo conmigo y busco a su familia.' },
  { a: '/lo-vi', icono: Icono.ojo, titulo: 'Vi un animal suelto', bajada: 'Lo vi en la calle, pero no lo tengo.' },
  { a: '/?tipo=adopcion', icono: Icono.corazon, titulo: 'Quiero adoptar', bajada: 'Perros y gatos que buscan una familia.' },
];

export function Inicio() {
  return (
    <div className="contenedor pagina">
      <h1 style={{ marginBottom: 16 }}>¿Qué pasó?</h1>
      <div className="entradas">
        {ENTRADAS.map((e) => (
          <Link key={e.titulo} to={e.a} className="entrada">
            <span className="entrada__ico">{e.icono(22)}</span>
            <span>
              <span className="entrada__titulo">{e.titulo}</span>
              <span className="entrada__bajada">{e.bajada}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
