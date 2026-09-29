-- Avisos (spec §5.1, §5.1.1 y §5.4).
--
-- Un aviso se publica al instante (§2.10). Lo que el navegador no decide
-- —autor, estado, vigencia, fechas— lo pisa la base en el alta; en la edición,
-- el autor no toca el oculto, la vigencia, el autor, el tipo ni las fechas.
-- La vigencia se cambia sólo renovando (`renovar_aviso`).
--
-- Lo privado no está acá: el WhatsApp va en `contactos_aviso`, que el público
-- no lee (lo entrega /api/contacto en la fase 3), y el punto exacto no se
-- guarda (tarea 9).

create type public.tipo_aviso as enum ('perdido', 'encontrado', 'adopcion');
create type public.estado_aviso as enum ('activo', 'resuelto', 'vencido', 'oculto');
create type public.especie as enum ('perro', 'gato', 'otro');
create type public.sexo_animal as enum ('macho', 'hembra', 'no_se');
create type public.tamano_animal as enum ('chico', 'mediano', 'grande');
create type public.quien_oculto as enum ('admin', 'denuncias');
create type public.cuanto_ayudo as enum ('si', 'un_poco', 'no');

create table public.avisos (
  id uuid primary key default gen_random_uuid(),
  id_corto text generated always as (left(id::text, 8)) stored,
  autor_id uuid not null references public.perfiles (id) on delete cascade,
  tipo public.tipo_aviso not null,
  estado public.estado_aviso not null default 'activo',
  oculto_por public.quien_oculto,
  especie public.especie not null,
  nombre text check (nombre is null or length(btrim(nombre)) between 1 and 40),
  sexo public.sexo_animal not null default 'no_se',
  tamano public.tamano_animal,
  edad_aprox text check (edad_aprox is null or length(edad_aprox) <= 40),
  color text check (color is null or length(color) <= 60),
  senas text check (senas is null or length(senas) <= 600),
  historia text check (historia is null or length(historia) <= 2000),
  fecha_hecho date not null,
  punto extensions.geography(Point, 4326) not null,
  departamento text not null references public.departamentos (nombre),
  zona text not null,
  recompensa boolean not null default false,
  vence_en timestamptz not null,
  resuelto_en timestamptz,
  ayudo_sitio public.cuanto_ayudo,
  ayudo_avistamiento boolean,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint recompensa_solo_en_perdidos check (not recompensa or tipo = 'perdido'),
  constraint oculto_dice_quien check ((estado = 'oculto') = (oculto_por is not null)),
  constraint resuelto_tiene_fecha check (estado <> 'resuelto' or resuelto_en is not null)
);
create unique index avisos_id_corto_idx on public.avisos (id_corto);
create index avisos_punto_idx on public.avisos using gist (punto);
create index avisos_listado_idx on public.avisos (estado, tipo, creado_en desc);
create index avisos_autor_idx on public.avisos (autor_id, creado_en desc);

create table public.fotos_aviso (
  aviso_id uuid not null references public.avisos (id) on delete cascade,
  orden smallint not null check (orden between 0 and 5),
  path text not null,
  primary key (aviso_id, orden),
  constraint path_de_su_carpeta check (path like ('avisos/' || aviso_id::text || '/%'))
);

create table public.contactos_aviso (
  aviso_id uuid primary key references public.avisos (id) on delete cascade,
  whatsapp text not null check (whatsapp ~ '^\+[1-9][0-9]{7,14}$'),
  consentido_en timestamptz not null default now()
);

alter table public.avisos enable row level security;
alter table public.fotos_aviso enable row level security;
alter table public.contactos_aviso enable row level security;
revoke all on public.contactos_aviso from anon;

-- ── Policies ─────────────────────────────────────────────────────────────────
-- Los vencidos se leen: su link circula por WhatsApp (spec §5.1.1). Los saca
-- del feed y del mapa la consulta, no la RLS.

create policy avisos_lectura on public.avisos for select
  using (estado <> 'oculto' or autor_id = (select auth.uid()) or privado.es_admin());
create policy avisos_alta on public.avisos for insert to authenticated
  with check (autor_id = (select auth.uid()));
create policy avisos_editar on public.avisos for update to authenticated
  using (autor_id = (select auth.uid()) or privado.es_admin())
  with check (autor_id = (select auth.uid()) or privado.es_admin());
create policy avisos_borrar on public.avisos for delete to authenticated
  using (autor_id = (select auth.uid()) or privado.es_admin());

-- Las fotos se ven cuando se ve su aviso: la RLS de avisos vale adentro del exists.
create policy fotos_lectura on public.fotos_aviso for select
  using (exists (select 1 from public.avisos a where a.id = fotos_aviso.aviso_id));
create policy fotos_del_autor on public.fotos_aviso for all to authenticated
  using (exists (select 1 from public.avisos a where a.id = fotos_aviso.aviso_id
                  and (a.autor_id = (select auth.uid()) or privado.es_admin())))
  with check (exists (select 1 from public.avisos a where a.id = fotos_aviso.aviso_id
                       and (a.autor_id = (select auth.uid()) or privado.es_admin())));

create policy contactos_del_autor on public.contactos_aviso for all to authenticated
  using (exists (select 1 from public.avisos a where a.id = contactos_aviso.aviso_id
                  and (a.autor_id = (select auth.uid()) or privado.es_admin())))
  with check (exists (select 1 from public.avisos a where a.id = contactos_aviso.aviso_id
                       and (a.autor_id = (select auth.uid()) or privado.es_admin())));

-- ── Blindaje ─────────────────────────────────────────────────────────────────
-- `volveacasa.operacion` la ponen funciones de la base (`renovar_aviso`, el
-- trigger de denuncias). El navegador no la puede escribir: PostgREST no expone
-- set_config.

create or replace function privado.avisos_blindar()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  yo uuid := auth.uid();
  operacion text := coalesce(current_setting('volveacasa.operacion', true), '');
  plazo interval := make_interval(days => privado.config_numero('vence_' || new.tipo || '_dias')::integer);
begin
  new.actualizado_en := now();

  if tg_op = 'INSERT' then
    if yo is not null then
      new.autor_id := yo;
      new.estado := 'activo';
      new.oculto_por := null;
      new.resuelto_en := null;
      new.ayudo_sitio := null;
      new.ayudo_avistamiento := null;
      new.vence_en := now() + plazo;
      new.creado_en := now();
      if (select count(*) from public.avisos a
           where a.autor_id = yo and a.creado_en > now() - interval '24 hours')
         >= privado.config_numero('tope_avisos_por_dia') then
        raise exception 'Llegaste al máximo de avisos por día. Probá de nuevo mañana.'
          using errcode = 'check_violation';
      end if;
    else
      new.vence_en := coalesce(new.vence_en, now() + plazo);
    end if;
    if not privado.puede_publicar(new.autor_id) then
      raise exception 'Esta cuenta no puede publicar. Si creés que es un error, escribinos.'
        using errcode = 'check_violation';
    end if;
    if new.fecha_hecho > current_date + 1 then
      raise exception 'La fecha no puede ser futura.' using errcode = 'check_violation';
    end if;
    return new;
  end if;

  -- ── Edición: lo que vale para todos ──
  if new.estado = 'oculto' and old.estado <> 'oculto' and new.oculto_por is null then
    new.oculto_por := 'admin';
  end if;
  if new.estado <> 'oculto' then
    new.oculto_por := null;
  end if;
  if new.estado = 'resuelto' and old.estado <> 'resuelto' then
    new.resuelto_en := now();
  end if;

  -- Renovar: vale para el autor y para el admin (va antes de la salida del admin).
  if operacion = 'renovar' then
    if old.estado not in ('activo', 'vencido') then
      raise exception 'Sólo se renueva un aviso activo o vencido.' using errcode = 'check_violation';
    end if;
    new.estado := 'activo';
    new.vence_en := now() + plazo;
    return new;
  end if;

  -- El servidor, el admin y el trigger de denuncias pasan.
  if yo is null or privado.es_admin() or operacion = 'ocultar_por_denuncias' then
    return new;
  end if;

  -- ── Edición del autor ──
  new.id := old.id;
  new.autor_id := old.autor_id;
  new.tipo := old.tipo;
  new.creado_en := old.creado_en;
  new.oculto_por := old.oculto_por;

  if new.vence_en is distinct from old.vence_en then
    raise exception 'La vigencia la pone el sitio: renovalo desde Mis avisos.' using errcode = 'check_violation';
  end if;

  if new.estado is distinct from old.estado then
    if old.estado = 'oculto' then
      raise exception 'Este aviso está en revisión: sólo el equipo lo puede volver a mostrar.'
        using errcode = 'check_violation';
    elsif new.estado = 'oculto' then
      raise exception 'Sólo el equipo puede ocultar un aviso.' using errcode = 'check_violation';
    elsif old.estado = 'resuelto' then
      raise exception 'Un aviso resuelto no se reabre. Si hace falta, publicá uno nuevo.'
        using errcode = 'check_violation';
    elsif not (old.estado = 'activo' and new.estado = 'resuelto') then
      raise exception 'Ese cambio de estado no se puede hacer desde acá.' using errcode = 'check_violation';
    end if;
  end if;

  if new.resuelto_en is distinct from old.resuelto_en
     and not (old.estado = 'activo' and new.estado = 'resuelto') then
    new.resuelto_en := old.resuelto_en;
  end if;
  return new;
end;
$$;
revoke all on function privado.avisos_blindar() from public, anon, authenticated;

create trigger avisos_a_blindar before insert or update on public.avisos
  for each row execute function privado.avisos_blindar();
create trigger avisos_b_ubicar before insert or update on public.avisos
  for each row execute function privado.ubicar_y_redondear();

-- ── Renovar en un toque (§2.12) ──────────────────────────────────────────────
-- Security invoker: corre con la RLS de quien llama, así que sólo alcanza sus
-- avisos (o todos, si es admin). El valor de vence_en que manda es de relleno:
-- lo reemplaza el trigger con el plazo del tipo.

create or replace function public.renovar_aviso(p_aviso uuid)
returns public.avisos language plpgsql security invoker set search_path = public, pg_temp as $$
declare
  fila public.avisos;
begin
  perform set_config('volveacasa.operacion', 'renovar', true);
  update public.avisos set vence_en = now() where id = p_aviso returning * into fila;
  perform set_config('volveacasa.operacion', '', true);
  if fila.id is null then
    raise exception 'No encontramos ese aviso entre los tuyos.' using errcode = 'no_data_found';
  end if;
  return fila;
end;
$$;
revoke all on function public.renovar_aviso(uuid) from public, anon;
grant execute on function public.renovar_aviso(uuid) to authenticated;

-- ── El consentimiento del WhatsApp lleva la fecha del servidor ───────────────

create or replace function privado.contactos_consentimiento()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if tg_op = 'UPDATE' then
    new.aviso_id := old.aviso_id;
    if new.whatsapp is not distinct from old.whatsapp then
      new.consentido_en := old.consentido_en;
      return new;
    end if;
  end if;
  new.consentido_en := now();
  return new;
end;
$$;
revoke all on function privado.contactos_consentimiento() from public, anon, authenticated;
create trigger contactos_a_consentimiento before insert or update on public.contactos_aviso
  for each row execute function privado.contactos_consentimiento();
