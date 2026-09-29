-- Departamentos y zonas (spec §5.1, §5.3 y §6).
--
-- De acá sale el departamento y la zona de cada aviso: la base los calcula con
-- el punto antes de redondearlo. Las zonas son los 62 barrios de Montevideo y
-- las localidades del INE del resto del país; fuera de toda localidad, la zona
-- es «Zona rural de <departamento>».
--
-- Los polígonos los carga el servidor con supabase/datos/territorio/cargar.sql
-- (fuente: INE, Censo 2023). Desde la API sólo se leen.

create table public.departamentos (
  nombre text primary key check (nombre in (
    'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno', 'Flores', 'Florida',
    'Lavalleja', 'Maldonado', 'Montevideo', 'Paysandú', 'Río Negro', 'Rivera', 'Rocha',
    'Salto', 'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres'
  )),
  geom extensions.geometry(MultiPolygon, 4326) not null,
  centroide extensions.geometry(Point, 4326) not null
);
create index departamentos_geom_idx on public.departamentos using gist (geom);

create type public.tipo_zona as enum ('barrio', 'localidad');

create table public.zonas (
  id bigint generated always as identity primary key,
  nombre text not null,
  tipo public.tipo_zona not null,
  departamento text not null references public.departamentos (nombre),
  geom extensions.geometry(MultiPolygon, 4326) not null,
  -- Un punto seguro adentro (ST_PointOnSurface): sirve para centrar el mapa.
  centroide extensions.geometry(Point, 4326) not null,
  fuente text not null,
  unique (departamento, tipo, nombre)
);
create index zonas_geom_idx on public.zonas using gist (geom);
create index zonas_departamento_idx on public.zonas (departamento, tipo);

alter table public.departamentos enable row level security;
alter table public.zonas enable row level security;
create policy departamentos_lectura on public.departamentos for select using (true);
create policy zonas_lectura on public.zonas for select using (true);
