/**
 * Configuración pública del cliente, con respaldo en el código.
 *
 * ── Por qué existe este archivo ──────────────────────────────────────────────
 *
 * Vite inyecta las `VITE_*` en tiempo de BUILD, no de runtime. Si no están en
 * el entorno donde se compila, el bundle sale sin ellas y no hay nada que el
 * navegador pueda hacer: hay que recompilar.
 *
 * El intento obvio —commitear un `.env.production`— NO funciona en Vercel:
 * descarta los archivos `.env*` del código fuente antes de construir, porque su
 * modelo es que las variables vengan de las Environment Variables del proyecto.
 * Verificado sobre el build real: con `.env.production` commiteado, el bundle
 * salió de 145.51 kB, exactamente el mismo tamaño que sin variables (el que las
 * lleva adentro pesa 145.76 kB).
 *
 * Un módulo `.js` común no lo puede descartar nadie. Por eso los valores están
 * acá y no en un archivo de entorno.
 *
 * ── Por qué es seguro ────────────────────────────────────────────────────────
 *
 * Estas dos cosas no son secretas ni pueden serlo: viajan dentro del JavaScript
 * que se descarga el navegador, así que cualquiera que abra el sitio y mire el
 * código fuente ya las tiene. La anon key no da acceso a nada por sí sola — lo
 * que protege los datos son las policies de RLS, que la base evalúa fila por
 * fila con el JWT de quien consulta.
 *
 * ── Lo que NO va acá ─────────────────────────────────────────────────────────
 *
 * `SUPABASE_SERVICE_ROLE_KEY` saltea la RLS por completo, y las credenciales de
 * Mercado Pago mueven plata. Esas viven SÓLO en las Environment Variables de
 * Vercel y las lee `/api`, que corre en el servidor. Nunca las toca el browser,
 * así que nunca entran en un archivo del que se genere el bundle. Si alguna vez
 * dudás si un valor va acá, la respuesta es que no.
 *
 * Las variables de entorno, si están, ganan: así un deploy contra otro proyecto
 * de Supabase se configura sin tocar el código.
 */

// En su propio módulo, sin `import.meta`, para que también lo lea el servidor.
import { RESPALDO } from './respaldo-publico.js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || RESPALDO.url;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || RESPALDO.anon;
