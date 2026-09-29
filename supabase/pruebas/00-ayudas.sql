-- Ayudas del arnés de pruebas de la base (hoja de ruta, «Cómo se trabaja»).
--
-- Cada caso de supabase/pruebas/<tema>.sql corre adentro de un bloque
-- BEGIN … EXCEPTION que termina SIEMPRE en una excepción: si el ataque falla, la
-- excepción es la del ataque; si no falla, es la nuestra, 'FIN:<valor>'. Al
-- salir por el EXCEPTION, Postgres deshace todo lo del bloque: los usuarios de
-- prueba, las filas, y también el `set role` y las claims. No queda nada
-- (probado el 2026-09-28 contra la base de producción).
--
-- Regla: las ayudas se llaman ANTES de `pg_temp.como()`. Una vez que el caso
-- es `authenticated`, cambiar de usuario se hace con set_config directo (ver
-- denuncias.sql): pasar a anon o volver a postgres desde ahí no se puede.

create or replace function pg_temp.usuario(p_email text, p_horas integer default 48)
returns uuid language plpgsql as $$
declare
  uid uuid := gen_random_uuid();
begin
  insert into auth.users (id, email, aud, role, created_at)
  values (uid, p_email, 'authenticated', 'authenticated', now() - make_interval(hours => p_horas));
  -- El perfil lo crea el trigger de alta; acá se le pone la antigüedad pedida.
  update public.perfiles set creado_en = now() - make_interval(hours => p_horas) where id = uid;
  return uid;
end $$;

create or replace function pg_temp.admin(p_email text)
returns uuid language plpgsql as $$
declare
  uid uuid := pg_temp.usuario(p_email);
begin
  update public.perfiles_privados set rol = 'admin' where id = uid;
  return uid;
end $$;

-- Actuar como un usuario con sesión: lo que hace PostgREST con un JWT válido.
create or replace function pg_temp.como(uid uuid)
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end $$;

-- Actuar como alguien sin sesión.
create or replace function pg_temp.como_anon()
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  perform set_config('role', 'anon', true);
end $$;

-- Un punto adentro de una zona cargada: su punto sobre la superficie.
-- En plpgsql y no en sql: una función sql se valida al crearla, y estas ayudas
-- se cargan con todos los temas, también con los que corren antes de que
-- exista public.zonas (tarea 6). plpgsql resuelve la tabla recién al llamarla.
create or replace function pg_temp.punto_en(p_zona text)
returns extensions.geography language plpgsql as $$
begin
  return (select centroide::extensions.geography from public.zonas where nombre = p_zona limit 1);
end $$;

-- Un aviso activo en una zona, creado por el servidor (sin sesión).
create or replace function pg_temp.aviso(p_autor uuid, p_tipo text default 'perdido', p_zona text default 'Pocitos')
returns uuid language plpgsql as $$
declare
  nuevo uuid;
begin
  insert into public.avisos (autor_id, tipo, especie, nombre, fecha_hecho, punto)
  values (p_autor, p_tipo::public.tipo_aviso, 'perro', 'Prueba', current_date, pg_temp.punto_en(p_zona))
  returning id into nuevo;
  return nuevo;
end $$;

-- ¿Las coordenadas del punto, en UTM 21S, son múltiplos de la grilla?
create or replace function pg_temp.en_grilla(p extensions.geography, p_metros numeric)
returns boolean language sql as $$
  select abs(extensions.st_x(g) / p_metros - round(extensions.st_x(g) / p_metros)) < 1e-6
     and abs(extensions.st_y(g) / p_metros - round(extensions.st_y(g) / p_metros)) < 1e-6
    from (select extensions.st_transform(p::extensions.geometry, 32721) as g) s;
$$;
