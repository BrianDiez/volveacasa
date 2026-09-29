/*
 * Douglas-Peucker sobre un anillo cerrado. Los bordes del INE tienen un punto
 * cada pocos metros; para decidir en qué barrio cae un punto que después se
 * redondea a 100 m o más, 5 m de tolerancia sobran y el archivo baja a una
 * fracción.
 */

function distancia2AlSegmento([px, py], [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)) : 0;
  const x = ax + t * dx - px;
  const y = ay + t * dy - py;
  return x * x + y * y;
}

/** Conserva la primera y la última coordenada; un anillo nunca queda con menos de 4. */
export function simplificarAnillo(puntos, tolerancia) {
  if (puntos.length <= 4) return puntos;
  const conservar = new Uint8Array(puntos.length);
  conservar[0] = 1;
  conservar[puntos.length - 1] = 1;
  const t2 = tolerancia * tolerancia;
  const pila = [[0, puntos.length - 1]];
  while (pila.length) {
    const [i, j] = pila.pop();
    let max = 0;
    let k = -1;
    for (let m = i + 1; m < j; m += 1) {
      const d = distancia2AlSegmento(puntos[m], puntos[i], puntos[j]);
      if (d > max) { max = d; k = m; }
    }
    if (k !== -1 && max > t2) {
      conservar[k] = 1;
      pila.push([i, k], [k, j]);
    }
  }
  const salida = puntos.filter((_, n) => conservar[n]);
  return salida.length >= 4 ? salida : puntos;
}
