import { Link } from 'react-router-dom';
import { Vacio } from '../ui/kit';

export function NoEncontrado() {
  return (
    <div className="contenedor pagina">
      <Vacio
        titulo="No encontramos esta página"
        texto="Puede que el link esté incompleto. Si buscabas un aviso, probá desde el inicio o el mapa."
        accion={<Link to="/">Ir al inicio</Link>}
      />
    </div>
  );
}
