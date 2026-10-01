-- Carga de departamentos y zonas desde los GeoJSON publicados en el sitio
-- (fase 1, tarea 8). Se corre por partes con execute_sql, como postgres.
-- Es repetible: `on conflict do update` reemplaza lo que había.
--
-- Los tres archivos del INE vienen en EPSG:4326 (metadatos del Censo 2023);
-- igual se lee el `srid` del archivo, por si una versión futura cambia.
--
-- Cada pieza se valida ANTES de unirla: la simplificación (Douglas-Peucker)
-- no cuida la topología y deja algún anillo que se cruza a sí mismo (pasó en
-- Montevideo, Paso de la Arena, Parque Rodó y Cerro Largo). Con eso, st_union
-- frena con «TopologyException: side location conflict».

-- ── Parte 1: pedir los tres archivos. Anotar los tres id. ───────────────────
select 'departamentos' as capa, net.http_get('https://volveacasa-henna.vercel.app/datos/territorio/departamentos.geojson', timeout_milliseconds := 60000) as id
union all
select 'barrios', net.http_get('https://volveacasa-henna.vercel.app/datos/territorio/barrios.geojson', timeout_milliseconds := 60000)
union all
select 'localidades', net.http_get('https://volveacasa-henna.vercel.app/datos/territorio/localidades.geojson', timeout_milliseconds := 60000);

-- ── Parte 2 (unos segundos después): que hayan llegado bien. ─────────────────
select id, status_code, length(content) as largo, error_msg
  from net._http_response where id in (:id_departamentos, :id_barrios, :id_localidades);

-- ── Parte 3: departamentos. Si un nombre viene en varios polígonos, se unen ──
-- (el INE trae el Límite Contestado aparte, con el código de Artigas).
with fuente as (
  select content::jsonb as j from net._http_response where id = :id_departamentos
), piezas as (
  select f -> 'properties' ->> 'nombre' as nombre,
         extensions.st_collectionextract(extensions.st_makevalid(
           extensions.st_transform(extensions.st_setsrid(extensions.st_geomfromgeojson(f -> 'geometry'), (j ->> 'srid')::int), 4326)
         ), 3) as g
    from fuente, jsonb_array_elements(j -> 'features') as f
), unidos as (
  select nombre, extensions.st_multi(extensions.st_collectionextract(extensions.st_makevalid(extensions.st_union(g)), 3)) as geom
    from piezas group by nombre
)
insert into public.departamentos (nombre, geom, centroide)
select nombre, geom, extensions.st_pointonsurface(geom) from unidos
on conflict (nombre) do update set geom = excluded.geom, centroide = excluded.centroide;

-- ── Parte 4: barrios y localidades (dos veces, una por id). ──────────────────
with fuente as (
  select content::jsonb as j from net._http_response where id = :id_zona
), piezas as (
  select f -> 'properties' ->> 'nombre' as nombre,
         f -> 'properties' ->> 'departamento' as departamento,
         extensions.st_collectionextract(extensions.st_makevalid(
           extensions.st_transform(extensions.st_setsrid(extensions.st_geomfromgeojson(f -> 'geometry'), (j ->> 'srid')::int), 4326)
         ), 3) as g
    from fuente, jsonb_array_elements(j -> 'features') as f
), unidos as (
  select nombre, departamento,
         extensions.st_multi(extensions.st_collectionextract(extensions.st_makevalid(extensions.st_union(g)), 3)) as geom
    from piezas group by nombre, departamento
)
insert into public.zonas (nombre, tipo, departamento, geom, centroide, fuente)
select nombre, :tipo::public.tipo_zona, departamento, geom, extensions.st_pointonsurface(geom), 'INE, Censo 2023'
  from unidos
on conflict (departamento, tipo, nombre) do update set geom = excluded.geom, centroide = excluded.centroide;
-- :id_zona = id de barrios con :tipo = 'barrio'; después id de localidades con :tipo = 'localidad'.

-- ── Parte 5: verificar. ──────────────────────────────────────────────────────
select (select count(*) from public.departamentos) as departamentos,
       (select count(*) from public.zonas where tipo = 'barrio') as barrios,
       (select count(*) from public.zonas where tipo = 'localidad') as localidades,
       (select count(*) from public.departamentos where not extensions.st_isvalid(geom)) +
       (select count(*) from public.zonas where not extensions.st_isvalid(geom)) as invalidos,
       (select string_agg(nombre, ', ') from public.zonas where tipo = 'barrio' and nombre in ('Pocitos', 'Cordón', 'Malvín')) as muestra;
