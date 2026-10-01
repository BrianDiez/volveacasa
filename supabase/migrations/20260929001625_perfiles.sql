-- Perfiles (spec §5.1, §5.1.1 y §5.4).
--
-- `perfiles` es lo público de una cuenta: nombre, si es persona o protectora, y
-- si la protectora está verificada. `perfiles_privados` es lo que no ve
-- cualquiera: el WhatsApp por defecto, el rol y la suspensión. Van separados
-- porque la RLS es por fila y no por columna: en una sola tabla, un `select=*`
-- público traería el WhatsApp y diría quién es admin (bagayí 005).
--
-- Las dos filas las crea la base cuando se da de alta la cuenta en auth.users.
-- Nadie las inserta desde la API: no hay policy de insert.

create schema if not exists privado;
grant usage on schema privado to anon, authenticated, service_role;

create type public.tipo_perfil as enum ('persona', 'protectora');
create type public.rol_perfil as enum ('usuario', 'admin');

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  id_corto text generated always as (left(id::text, 8)) stored,
  nombre text check (nombre is null or length(btrim(nombre)) between 1 and 80),
  tipo public.tipo_perfil not null default 'persona',
  verificada boolean not null default false,
  eliminado_en timestamptz,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint verificada_es_de_protectora check (not verificada or tipo = 'protectora')
);
create unique index perfiles_id_corto_idx on public.perfiles (id_corto);

create table public.perfiles_privados (
  id uuid primary key references public.perfiles (id) on delete cascade,
  whatsapp_por_defecto text check (whatsapp_por_defecto is null or whatsapp_por_defecto ~ '^\+[1-9][0-9]{7,14}$'),
  rol public.rol_perfil not null default 'usuario',
  suspendido boolean not null default false,
  actualizado_en timestamptz not null default now()
);

alter table public.perfiles enable row level security;
alter table public.perfiles_privados enable row level security;
-- Además de la RLS: anon no tiene nada que hacer acá.
revoke all on public.perfiles_privados from anon;

-- ── Ayudas para las policies y los triggers ─────────────────────────────────
-- En `privado` y no en `public`: PostgREST no las publica como endpoints, y
-- las policies las pueden llamar igual (bagayí 005).

create or replace function privado.es_admin(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.perfiles_privados pp join public.perfiles p on p.id = pp.id
     where pp.id = uid and pp.rol = 'admin' and p.eliminado_en is null
  );
$$;
grant execute on function privado.es_admin(uuid) to anon, authenticated, service_role;

create or replace function privado.puede_publicar(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.perfiles p join public.perfiles_privados pp on pp.id = p.id
     where p.id = uid and p.eliminado_en is null and not pp.suspendido
  );
$$;
revoke all on function privado.puede_publicar(uuid) from public, anon, authenticated;

create or replace function privado.es_protectora_verificada(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.perfiles p
     where p.id = uid and p.tipo = 'protectora' and p.verificada and p.eliminado_en is null
  );
$$;
revoke all on function privado.es_protectora_verificada(uuid) from public, anon, authenticated;

-- ── Policies ─────────────────────────────────────────────────────────────────

create policy perfiles_lectura on public.perfiles for select
  using (eliminado_en is null or id = (select auth.uid()) or privado.es_admin());
create policy perfiles_editar on public.perfiles for update to authenticated
  using (id = (select auth.uid()) or privado.es_admin())
  with check (id = (select auth.uid()) or privado.es_admin());

create policy privados_lectura on public.perfiles_privados for select to authenticated
  using (id = (select auth.uid()) or privado.es_admin());
create policy privados_editar on public.perfiles_privados for update to authenticated
  using (id = (select auth.uid()) or privado.es_admin())
  with check (id = (select auth.uid()) or privado.es_admin());

-- ── Alta ─────────────────────────────────────────────────────────────────────

create or replace function privado.alta_de_perfil()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, nullif(left(btrim(coalesce(new.raw_user_meta_data ->> 'nombre', '')), 80), ''));
  insert into public.perfiles_privados (id) values (new.id);
  return new;
end;
$$;
-- Postgres pide EXECUTE al crear el trigger, no al dispararlo (bagayí 055).
revoke all on function privado.alta_de_perfil() from public, anon, authenticated;
create trigger auth_alta_de_perfil after insert on auth.users
  for each row execute function privado.alta_de_perfil();

-- ── Blindaje ─────────────────────────────────────────────────────────────────
-- Sin sesión (`auth.uid()` nulo) es el servidor o un SQL a mano, y pasa.
-- `volveacasa.operacion = 'borrar_cuenta'` lo pone la RPC de borrar la cuenta
-- (fase 2); el navegador no puede escribir esa variable.

create or replace function privado.perfiles_blindar()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  new.actualizado_en := now();
  if auth.uid() is null or privado.es_admin()
     or current_setting('volveacasa.operacion', true) = 'borrar_cuenta' then
    return new;
  end if;
  if new.tipo is distinct from old.tipo or new.verificada is distinct from old.verificada then
    raise exception 'Sólo el equipo marca las protectoras verificadas.' using errcode = 'check_violation';
  end if;
  if new.eliminado_en is distinct from old.eliminado_en then
    raise exception 'La cuenta se borra desde Cuenta.' using errcode = 'check_violation';
  end if;
  new.id := old.id;
  new.creado_en := old.creado_en;
  return new;
end;
$$;
revoke all on function privado.perfiles_blindar() from public, anon, authenticated;
create trigger perfiles_a_blindar before update on public.perfiles
  for each row execute function privado.perfiles_blindar();

create or replace function privado.privados_blindar()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  new.actualizado_en := now();
  if auth.uid() is null or privado.es_admin() then
    return new;
  end if;
  if new.rol is distinct from old.rol or new.suspendido is distinct from old.suspendido then
    raise exception 'No podés cambiar tu rol ni tu suspensión.' using errcode = 'check_violation';
  end if;
  new.id := old.id;
  return new;
end;
$$;
revoke all on function privado.privados_blindar() from public, anon, authenticated;
create trigger privados_a_blindar before update on public.perfiles_privados
  for each row execute function privado.privados_blindar();

-- ── Siempre queda un admin ──────────────────────────────────────────────────
-- El patrón de bagayí 078, repartido en las dos tablas: un admin vivo deja de
-- serlo si le sacan el rol (perfiles_privados), si lo dan de baja
-- (perfiles.eliminado_en) o si se borra la fila. A diferencia de los blindajes,
-- la regla vale también sin sesión: es para quien opera la base a mano.
-- Los BEFORE del mismo evento corren en orden alfabético: `*_a_blindar` fija lo
-- que el navegador no puede tocar y `*_b_siempre_un_admin` mira el resultado.

create or replace function privado.siempre_un_admin()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  era_admin boolean;
  sigue_admin boolean;
begin
  if tg_table_name = 'perfiles_privados' then
    era_admin := old.rol = 'admin'
      and exists (select 1 from public.perfiles p where p.id = old.id and p.eliminado_en is null);
    sigue_admin := tg_op = 'UPDATE' and new.rol = 'admin';
  else
    era_admin := old.eliminado_en is null
      and exists (select 1 from public.perfiles_privados pp where pp.id = old.id and pp.rol = 'admin');
    sigue_admin := tg_op = 'UPDATE' and new.eliminado_en is null;
  end if;

  if era_admin and not sigue_admin and not exists (
    select 1 from public.perfiles_privados pp join public.perfiles p on p.id = pp.id
     where pp.rol = 'admin' and p.eliminado_en is null and pp.id <> old.id
  ) then
    raise exception 'Es el único admin: antes de sacarle el rol o darlo de baja, hacé admin a otra cuenta.'
      using errcode = 'check_violation';
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function privado.siempre_un_admin() from public, anon, authenticated;

create trigger perfiles_b_siempre_un_admin
  before update of eliminado_en or delete on public.perfiles
  for each row execute function privado.siempre_un_admin();
create trigger privados_b_siempre_un_admin
  before update of rol or delete on public.perfiles_privados
  for each row execute function privado.siempre_un_admin();
