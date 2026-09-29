-- El punto (spec §5.3): la regla que manda sobre todo lo demás del mapa.
--
-- El navegador manda el punto que marcó la persona. Un trigger calcula el
-- departamento y la zona con ese punto exacto (redondeado, uno de la rambla
-- puede caer al agua) y después lo redondea con la grilla del tipo, antes de
-- guardarlo: el exacto no llega a ninguna columna. La RLS es por fila, así que
-- si estuviera guardado, se filtraría (bagayí §10).
--
-- `privado.ubicar_y_redondear` es la función de trigger que usan avisos y
-- avistamientos (tareas 10 y 11).

create or replace function privado.redondear_punto(p extensions.geography, metros numeric)
returns extensions.geography language sql immutable set search_path = extensions, pg_temp as $$
  -- En grados, «400 m» no mide lo mismo en todo el país: se redondea en UTM 21S
  -- (EPSG:32721). El este cae en la zona 22; la distorsión de usar la 21 ahí es
  -- chica frente a una grilla de 100 m o más.
  select extensions.st_transform(
           extensions.st_snaptogrid(extensions.st_transform(p::extensions.geometry, 32721), metros::float8),
           4326
         )::extensions.geography;
$$;
revoke all on function privado.redondear_punto(extensions.geography, numeric) from public, anon, authenticated;

create or replace function privado.ubicar(p extensions.geometry)
returns table (departamento text, zona text)
language plpgsql stable security definer set search_path = public, extensions, pg_temp as $$
declare
  d text;
  z text;
begin
  select dp.nombre into d from public.departamentos dp where st_contains(dp.geom, p) limit 1;
  if d is null then
    -- En la costa, el borde simplificado puede dejar un punto de la playa
    -- afuera: se toma el departamento más cercano, hasta 1 km.
    select dp.nombre into d from public.departamentos dp
     where st_dwithin(dp.geom::geography, p::geography, 1000)
     order by st_distance(dp.geom::geography, p::geography) limit 1;
  end if;
  if d is null then
    raise exception 'El punto tiene que estar en Uruguay.' using errcode = 'check_violation';
  end if;

  select zn.nombre into z from public.zonas zn
   where zn.departamento = d and st_contains(zn.geom, p)
   order by (zn.tipo = 'barrio') desc limit 1;

  if z is null and d = 'Montevideo' then
    -- Entre dos barrios simplificados puede quedar una rendija: el más cercano.
    select zn.nombre into z from public.zonas zn
     where zn.departamento = d and zn.tipo = 'barrio' and st_dwithin(zn.geom::geography, p::geography, 300)
     order by st_distance(zn.geom::geography, p::geography) limit 1;
  end if;

  departamento := d;
  zona := coalesce(z, 'Zona rural de ' || d);
  return next;
end;
$$;
revoke all on function privado.ubicar(extensions.geometry) from public, anon, authenticated;

create or replace function privado.ubicar_y_redondear()
returns trigger language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare
  u record;
  grilla numeric;
begin
  -- Si el punto no cambió, ya está redondeado y ubicado.
  if tg_op = 'UPDATE' and new.punto::text = old.punto::text then
    return new;
  end if;

  select * into u from privado.ubicar(new.punto::extensions.geometry);
  new.departamento := u.departamento;
  new.zona := u.zona;

  grilla := privado.config_numero(case tg_table_name
    when 'avistamientos' then 'grilla_avistamiento_m'
    else 'grilla_' || (to_jsonb(new) ->> 'tipo') || '_m'
  end);
  new.punto := privado.redondear_punto(new.punto, grilla);
  return new;
end;
$$;
revoke all on function privado.ubicar_y_redondear() from public, anon, authenticated;
