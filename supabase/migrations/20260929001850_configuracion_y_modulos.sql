-- Configuración del sitio y módulos (spec §5.2 y §8).
--
-- `configuracion` guarda los plazos, topes, umbrales y grillas que el admin
-- puede cambiar sin desplegar (patrón de bagayí 017). La leen los triggers con
-- `privado.config_numero`, que frena si falta una clave: un plazo inventado es
-- peor que un error.
--
-- `modulos` es el interruptor de cada módulo y de cada flag. El registro de
-- nombres, rutas y textos vive en `src/lib/modulos.js`; `modulos.test.js`
-- cruza las claves.
--
-- Las filas las siembra esta migración y después sólo se actualizan: no hay
-- policy de insert ni de delete (bagayí 017).

create table public.configuracion (
  clave text primary key check (clave ~ '^[a-z_]+$'),
  valor jsonb not null,
  descripcion text,
  actualizado_en timestamptz not null default now()
);
alter table public.configuracion enable row level security;

create policy configuracion_lectura on public.configuracion for select using (true);
create policy configuracion_editar on public.configuracion for update to authenticated
  using (privado.es_admin()) with check (privado.es_admin());

insert into public.configuracion (clave, valor, descripcion) values
  ('vence_perdido_dias', '30', 'Días que se ve un aviso de perdido antes de vencer.'),
  ('vence_encontrado_dias', '30', 'Días que se ve un aviso de encontrado antes de vencer.'),
  ('vence_adopcion_dias', '60', 'Días que se ve un aviso de adopción antes de vencer.'),
  ('vigencia_avistamiento_horas', '24', 'Horas que un avistamiento se ve en el mapa, contadas desde que el animal fue visto.'),
  ('grilla_perdido_m', '400', 'Metros a los que se redondea el punto de un perdido: se ve como una zona.'),
  ('grilla_encontrado_m', '400', 'Metros a los que se redondea el punto de un encontrado.'),
  ('grilla_adopcion_m', '1000', 'Metros a los que se redondea el punto de una adopción.'),
  ('grilla_avistamiento_m', '100', 'Metros a los que se redondea un avistamiento: es la calle.'),
  ('tope_avisos_por_dia', '5', 'Avisos que una cuenta puede publicar en 24 horas.'),
  ('tope_avistamientos_por_dia', '20', 'Avistamientos que una cuenta puede cargar en 24 horas.'),
  ('parecidos_km', '3', 'Distancia máxima de un aviso parecido.'),
  ('parecidos_dias', '15', 'Días de diferencia máxima de un aviso parecido.'),
  ('umbral_contador', '50', 'Resueltos que hacen falta para mostrar el contador del inicio.'),
  ('redes_vence_horas', '12', 'Horas para aprobar un aviso en la cola de redes antes de que venza.'),
  ('denuncias_para_ocultar', '3', 'Denuncias de cuentas distintas que ocultan algo hasta que el equipo lo revise.'),
  ('antiguedad_denunciante_horas', '24', 'Antigüedad mínima de una cuenta para que su denuncia cuente para ocultar.')
on conflict (clave) do nothing;

create or replace function privado.configuracion_valida()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  new.clave := old.clave;
  new.actualizado_en := now();
  if jsonb_typeof(new.valor) <> 'number' or (new.valor #>> '{}')::numeric <= 0 then
    raise exception '«%» tiene que ser un número positivo.', new.clave using errcode = 'check_violation';
  end if;
  if new.clave like 'grilla_%' and (new.valor #>> '{}')::numeric < 50 then
    raise exception 'Una grilla no puede bajar de 50 metros: el punto quedaría cerca de la casa de alguien.'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;
revoke all on function privado.configuracion_valida() from public, anon, authenticated;
create trigger configuracion_a_validar before update on public.configuracion
  for each row execute function privado.configuracion_valida();

create or replace function privado.config_numero(p_clave text)
returns numeric language plpgsql stable security definer set search_path = public as $$
declare
  v numeric;
begin
  select (valor #>> '{}')::numeric into v from public.configuracion where clave = p_clave;
  if v is null then
    raise exception 'Falta la configuración «%».', p_clave using errcode = 'check_violation';
  end if;
  return v;
end;
$$;
revoke all on function privado.config_numero(text) from public, anon, authenticated;

-- ── Módulos y flags ──────────────────────────────────────────────────────────

create type public.tipo_interruptor as enum ('modulo', 'flag');

create table public.modulos (
  clave text primary key,
  tipo public.tipo_interruptor not null,
  activo boolean not null default false,
  cambiado_por uuid references public.perfiles (id) on delete set null,
  cambiado_en timestamptz
);
alter table public.modulos enable row level security;

create policy modulos_lectura on public.modulos for select using (true);
create policy modulos_editar on public.modulos for update to authenticated
  using (privado.es_admin()) with check (privado.es_admin());

insert into public.modulos (clave, tipo) values
  ('veterinarias', 'modulo'),
  ('marketplace_servicios', 'modulo'),
  ('marketplace_productos', 'modulo'),
  ('historias', 'modulo'),
  ('login_whatsapp', 'flag'),
  ('redes_automaticas', 'flag')
on conflict (clave) do nothing;

create or replace function privado.modulos_registrar()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  new.clave := old.clave;
  new.tipo := old.tipo;
  if new.activo is distinct from old.activo then
    new.cambiado_por := auth.uid();
    new.cambiado_en := now();
  else
    new.cambiado_por := old.cambiado_por;
    new.cambiado_en := old.cambiado_en;
  end if;
  return new;
end;
$$;
revoke all on function privado.modulos_registrar() from public, anon, authenticated;
create trigger modulos_a_registrar before update on public.modulos
  for each row execute function privado.modulos_registrar();

-- Las tablas de cada módulo la van a pedir en sus policies (spec §8): la
-- tienen que poder llamar anon y authenticated.
create or replace function privado.modulo_activo(p_clave text)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select activo from public.modulos where clave = p_clave), false);
$$;
grant execute on function privado.modulo_activo(text) to anon, authenticated, service_role;
