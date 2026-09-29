-- Avistamientos (spec §2.9, §2.12 y §5.4).
--
-- Alguien vio un animal suelto y no lo tiene. Pide sesión (decisión del
-- 2026-09-28), no lleva datos de contacto de quien lo carga, y dura
-- `vigencia_avistamiento_horas` desde que el animal fue visto: no se renueva.
-- Vencido, sale del mapa (lo decide la consulta, `vence_en > now()`) y sigue
-- en el recorrido del perdido. Del lado del autor, sólo se editan la nota y la
-- foto.

create type public.estado_avistamiento as enum ('activo', 'vencido', 'oculto');

create table public.avistamientos (
  id uuid primary key default gen_random_uuid(),
  id_corto text generated always as (left(id::text, 8)) stored,
  aviso_id uuid references public.avisos (id) on delete set null,
  autor_id uuid not null references public.perfiles (id) on delete cascade,
  especie public.especie not null,
  nota text check (nota is null or length(nota) <= 140),
  foto text,
  punto extensions.geography(Point, 4326) not null,
  visto_en timestamptz not null,
  departamento text not null references public.departamentos (nombre),
  zona text not null,
  estado public.estado_avistamiento not null default 'activo',
  oculto_por public.quien_oculto,
  vence_en timestamptz not null,
  creado_en timestamptz not null default now(),
  constraint foto_de_su_carpeta check (foto is null or foto like ('avistamientos/' || id::text || '/%')),
  constraint oculto_dice_quien check ((estado = 'oculto') = (oculto_por is not null))
);
create unique index avistamientos_id_corto_idx on public.avistamientos (id_corto);
create index avistamientos_punto_idx on public.avistamientos using gist (punto);
create index avistamientos_aviso_idx on public.avistamientos (aviso_id, visto_en);
create index avistamientos_vigentes_idx on public.avistamientos (vence_en);

alter table public.avistamientos enable row level security;

create policy avistamientos_lectura on public.avistamientos for select
  using (estado <> 'oculto' or autor_id = (select auth.uid()) or privado.es_admin());
create policy avistamientos_alta on public.avistamientos for insert to authenticated
  with check (autor_id = (select auth.uid()));
create policy avistamientos_editar on public.avistamientos for update to authenticated
  using (autor_id = (select auth.uid()) or privado.es_admin())
  with check (autor_id = (select auth.uid()) or privado.es_admin());
create policy avistamientos_borrar on public.avistamientos for delete to authenticated
  using (autor_id = (select auth.uid()) or privado.es_admin());

create or replace function privado.avistamientos_blindar()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  yo uuid := auth.uid();
  vigencia numeric := privado.config_numero('vigencia_avistamiento_horas');
  destino public.avisos;
begin
  if tg_op = 'INSERT' then
    if yo is not null then
      new.autor_id := yo;
      new.estado := 'activo';
      new.oculto_por := null;
      new.creado_en := now();
      if new.visto_en > now() + interval '5 minutes' then
        raise exception 'La hora en que lo viste no puede ser en el futuro.' using errcode = 'check_violation';
      end if;
      if new.visto_en < now() - make_interval(hours => vigencia::integer) then
        raise exception 'Sólo se cargan avistamientos de las últimas % horas.', vigencia
          using errcode = 'check_violation';
      end if;
      if (select count(*) from public.avistamientos v
           where v.autor_id = yo and v.creado_en > now() - interval '24 hours')
         >= privado.config_numero('tope_avistamientos_por_dia') then
        raise exception 'Llegaste al máximo de avistamientos por día.' using errcode = 'check_violation';
      end if;
    end if;
    new.vence_en := new.visto_en + make_interval(hours => vigencia::integer);

    if new.aviso_id is not null then
      select * into destino from public.avisos where id = new.aviso_id;
      if destino.id is null or destino.tipo <> 'perdido' or destino.estado <> 'activo' then
        raise exception 'Sólo se puede avisar que lo viste en un aviso de perdido que siga activo.'
          using errcode = 'check_violation';
      end if;
    end if;
    if not privado.puede_publicar(new.autor_id) then
      raise exception 'Esta cuenta no puede cargar avistamientos. Si creés que es un error, escribinos.'
        using errcode = 'check_violation';
    end if;
    return new;
  end if;

  -- Edición: el servidor (el cron que marca vencidos), el admin y el trigger
  -- de denuncias pasan; el autor sólo toca la nota y la foto.
  if new.estado = 'oculto' and old.estado <> 'oculto' and new.oculto_por is null then
    new.oculto_por := 'admin';
  end if;
  if new.estado <> 'oculto' then
    new.oculto_por := null;
  end if;
  if yo is null or privado.es_admin()
     or current_setting('volveacasa.operacion', true) = 'ocultar_por_denuncias' then
    return new;
  end if;
  if (new.id, new.aviso_id, new.autor_id, new.especie, new.punto::text, new.visto_en,
      new.estado, new.oculto_por, new.vence_en, new.creado_en)
     is distinct from
     (old.id, old.aviso_id, old.autor_id, old.especie, old.punto::text, old.visto_en,
      old.estado, old.oculto_por, old.vence_en, old.creado_en) then
    raise exception 'De un avistamiento sólo se puede cambiar la nota y la foto.' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;
revoke all on function privado.avistamientos_blindar() from public, anon, authenticated;

create trigger avistamientos_a_blindar before insert or update on public.avistamientos
  for each row execute function privado.avistamientos_blindar();
create trigger avistamientos_b_ubicar before insert or update on public.avistamientos
  for each row execute function privado.ubicar_y_redondear();
