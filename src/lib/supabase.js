import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config-publico';

// Las variables de entorno ganan si están; si no, cae al respaldo del código
// (ver config-publico.js: Vercel descarta los .env* al construir).
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY, y config-publico.js '
    + 'tampoco tiene valores de respaldo.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

/** Envuelve una query de Supabase y tira el error en vez de devolverlo. */
export async function q(builder) {
  const { data, error } = await builder;
  if (error) throw error;
  return data;
}

/**
 * Límites por bucket. Son un espejo de lo que aplica Storage del lado del
 * servidor (la migración de buckets de la fase Base, con el patrón de
 * bagayí 20260827001200) — acá están sólo para dar un mensaje entendible antes
 * de subir por nada. La restricción de verdad es la del servidor: el `accept`
 * del input se saltea cambiando el filtro del diálogo.
 *
 * Las fotos llegan ya achicadas en el navegador (~1600 px, WebP o JPEG; BRIEF
 * §3.15), así que el tope es holgado para eso y corto para cualquier otra cosa.
 */
const LIMITES = {
  fotos: { mb: 3, tipos: ['image/webp', 'image/jpeg'] },
};

const NOMBRE_TIPO = { 'image/jpeg': 'JPG', 'image/webp': 'WebP' };

/** Sube un archivo y devuelve el path guardado (no la URL). */
export async function subirArchivo(bucket, path, file) {
  const limite = LIMITES[bucket];
  if (limite) {
    if (!limite.tipos.includes(file.type)) {
      const aceptados = limite.tipos.map((t) => NOMBRE_TIPO[t] ?? t).join(', ');
      throw new Error(`Ese archivo no se puede subir. Aceptamos ${aceptados}.`);
    }
    if (file.size > limite.mb * 1024 * 1024) {
      const pesa = (file.size / 1024 / 1024).toFixed(1);
      throw new Error(`El archivo pesa ${pesa} MB y el máximo es ${limite.mb} MB.`);
    }
  }

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return path;
}

export function urlPublica(bucket, path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/**
 * Token de la sesión actual, para las llamadas a `/api`.
 *
 * En bagayí los llamadores hacían `(await getSession()).data.session.access_token`
 * sin chequear nada, y cuando la sesión vencía la persona leía un
 * "Cannot read properties of null" tal cual. Acá el mensaje se entiende.
 */
export async function tokenDeSesion() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session?.access_token) {
    throw new Error('Tu sesión venció. Entrá de nuevo y volvé a intentar.');
  }
  return data.session.access_token;
}
