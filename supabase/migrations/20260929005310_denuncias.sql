-- Denuncias (spec §5.4, decisión del dueño del 2026-09-28) y el estado público
-- de un aviso (§5.1.1). Patrón de bagayí 20260902000200.
--
-- Un aviso o un avistamiento se oculta solo cuando junta
-- `denuncias_para_ocultar` denuncias abiertas de personas distintas, con tres
-- resguardos: no cuentan las cuentas de menos de `antiguedad_denunciante_horas`,
-- lo de una protectora verificada nunca se oculta solo, y lo oculto queda como
-- `oculto_por = denuncias`, para que su link diga «en revisión». El mail al
-- admin y descartar las denuncias llegan con la fase 6.
--
-- El denunciado no ve quién lo denunció: si lo viera, nadie denunciaría.

create type public.motivo_denuncia as enum ('estafa', 'venta', 'falso', 'maltrato', 'otro');
create type public.estado_denuncia as enum ('abierta', 'aceptada', 'descartada');

create table public.denuncias (
  id uuid primary key default gen_random_uuid(),
  aviso_id uuid references public.avisos (id) on delete cascade,
  avistamiento_id uuid references public.avistamientos (id) on delete cascade,
  denunciante_id uuid not null references public.perfiles (id) on delete cascade,
  motivo public.motivo_denuncia not null,
  detalle text check (detalle is null or length(btrim(detalle)) <= 1000),
  estado public.estado_denuncia not null default 'abierta',
  cuenta_para_ocultar boolean not null default false,
  revisado_por uuid references public.perfiles (id) on delete set null,
  revisado_en timestamptz,
  creada_en timestamptz not null default now(),
  constraint un_solo_objetivo check (num_nonnulls(aviso_id, avistamiento_id) = 1),
  constraint otro_exige_detalle check (motivo <> 'otro' or length(btrim(coalesce(detalle, ''))) >= 10),
  constraint resuelta_deja_rastro check (estado = 'abierta' or (revisado_por is not null and revisado_en is not null))
);
-- Una denuncia abierta por persona y por cosa: si no, una sola persona llena la cola.
create unique index denuncia_abierta_por_aviso on public.denuncias (aviso_id, denunciante_id)
  where estado = 'abierta' and aviso_id is not null;
create unique index denuncia_abierta_por_avistamiento on public.denuncias (avistamiento_id, denunciante_id)
  where estado = 'abierta' and avistamiento_id is not null;
create index denuncias_cola_idx on public.denuncias (estado, creada_en) where estado = 'abierta';

alter table public.denuncias enable row level security;

create policy denuncias_propia_o_admin on public.denuncias for select to authenticated
  using (denunciante_id = (select auth.uid()) or privado.es_admin());
create policy denuncias_alta on public.denuncias for insert to authenticated
  with check (denunciante_id = (select auth.uid()) and estado = 'abierta');
create policy denuncias_resolver_admin on public.denuncias for update to authenticated
  using (privado.es_admin()) with check (privado.es_admin());

create or replace function privado.denuncia_valida()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  yo uuid := auth.uid();
  autor uuid;
begin
  if yo is not null then
    new.denunciante_id := yo;
    new.estado := 'abierta';
    new.revisado_por := null;
    new.revisado_en := null;
  end if;
  new.creada_en := now();

  if new.aviso_id is not null then
    select a.autor_id into autor from public.avisos a where a.id = new.aviso_id;
  else
    select v.autor_id into autor from public.avistamientos v where v.id = new.avistamiento_id;
  end if;
  if autor is null then
    raise exception 'Lo que querés denunciar no existe.' using errcode = 'check_violation';
  end if;
  if autor = new.denunciante_id then
    raise exception 'No podés denunciar lo que publicaste vos.' using errcode = 'check_violation';
  end if;

  -- Crear cuentas para bajar un aviso no sirve: las nuevas no cuentan.
  new.cuenta_para_ocultar := exists (
    select 1 from public.perfiles p
     where p.id = new.denunciante_id
       and p.creado_en <= now() - make_interval(hours => privado.config_numero('antiguedad_denunciante_horas')::integer)
  );
  return new;
end;
$$;
revoke all on function privado.denuncia_valida() from public, anon, authenticated;
create trigger denuncias_a_validar before insert on public.denuncias
  for each row execute function privado.denuncia_valida();

create or replace function privado.ocultar_por_denuncias()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  cuantas integer;
  autor uuid;
begin
  if new.aviso_id is not null then
    select count(distinct d.denunciante_id) into cuantas from public.denuncias d
     where d.aviso_id = new.aviso_id and d.estado = 'abierta' and d.cuenta_para_ocultar;
    select a.autor_id into autor from public.avisos a where a.id = new.aviso_id;
  else
    select count(distinct d.denunciante_id) into cuantas from public.denuncias d
     where d.avistamiento_id = new.avistamiento_id and d.estado = 'abierta' and d.cuenta_para_ocultar;
    select v.autor_id into autor from public.avistamientos v where v.id = new.avistamiento_id;
  end if;

  if cuantas < privado.config_numero('denuncias_para_ocultar') or privado.es_protectora_verificada(autor) then
    return null;
  end if;

  -- Quien denuncia no es el autor ni el admin: la operación le abre el
  -- blindaje sólo para esto.
  perform set_config('volveacasa.operacion', 'ocultar_por_denuncias', true);
  if new.aviso_id is not null then
    update public.avisos set estado = 'oculto', oculto_por = 'denuncias'
     where id = new.aviso_id and estado <> 'oculto';
  else
    update public.avistamientos set estado = 'oculto', oculto_por = 'denuncias'
     where id = new.avistamiento_id and estado <> 'oculto';
  end if;
  perform set_config('volveacasa.operacion', '', true);
  return null;
end;
$$;
revoke all on function privado.ocultar_por_denuncias() from public, anon, authenticated;
create trigger denuncias_b_ocultar after insert on public.denuncias
  for each row execute function privado.ocultar_por_denuncias();

-- El estado de un aviso sin nada de su contenido, para que el link de uno
-- oculto diga «en revisión» y no «no existe» (spec §5.1.1).
create or replace function public.estado_publico(p_id_corto text)
returns text language sql stable security definer set search_path = public as $$
  select coalesce((
    select case
             when a.estado = 'oculto' and a.oculto_por = 'denuncias' then 'en_revision'
             when a.estado = 'oculto' then 'no_disponible'
             else a.estado::text
           end
      from public.avisos a where a.id_corto = lower(p_id_corto)
  ), 'no_existe');
$$;
revoke all on function public.estado_publico(text) from public;
grant execute on function public.estado_publico(text) to anon, authenticated;
