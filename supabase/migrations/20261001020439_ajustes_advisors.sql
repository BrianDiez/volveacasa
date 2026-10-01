-- Los avisos de los advisors de Supabase al cerrar la fase 1 (HANDOFF §7).
-- `auditoria-base.test.js` y `denuncias-base.test.js` impiden que vuelvan.

-- ── estado_publico fuera de la API (advisors 0028 y 0029) ───────────────────
-- Tiene que ver los avisos ocultos para decir «en revisión», así que saltea la
-- RLS. Esa parte pasa a `privado`, que PostgREST no expone; lo que publica la
-- API es un envoltorio invoker que la llama. Lo que se ve desde afuera no
-- cambia: una palabra, nada del contenido.

create or replace function privado.estado_publico(p_id_corto text)
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
revoke all on function privado.estado_publico(text) from public;
grant execute on function privado.estado_publico(text) to anon, authenticated;

create or replace function public.estado_publico(p_id_corto text)
returns text language sql stable security invoker set search_path = public as $$
  select privado.estado_publico(p_id_corto);
$$;
revoke all on function public.estado_publico(text) from public;
grant execute on function public.estado_publico(text) to anon, authenticated;

-- ── fotos_aviso: una sola policy por rol y acción ───────────────────────────
-- `fotos_del_autor` era `for all` y se sumaba a `fotos_lectura` en cada SELECT
-- de authenticated. Leer ya lo cubre `fotos_lectura`; el autor sólo necesita
-- escribir.

drop policy fotos_del_autor on public.fotos_aviso;
create policy fotos_alta on public.fotos_aviso for insert to authenticated
  with check (exists (select 1 from public.avisos a where a.id = fotos_aviso.aviso_id
                       and (a.autor_id = (select auth.uid()) or privado.es_admin())));
create policy fotos_editar on public.fotos_aviso for update to authenticated
  using (exists (select 1 from public.avisos a where a.id = fotos_aviso.aviso_id
                  and (a.autor_id = (select auth.uid()) or privado.es_admin())))
  with check (exists (select 1 from public.avisos a where a.id = fotos_aviso.aviso_id
                       and (a.autor_id = (select auth.uid()) or privado.es_admin())));
create policy fotos_borrar on public.fotos_aviso for delete to authenticated
  using (exists (select 1 from public.avisos a where a.id = fotos_aviso.aviso_id
                  and (a.autor_id = (select auth.uid()) or privado.es_admin())));

-- ── Índices de las claves foráneas (advisor 0001) ───────────────────────────
-- El de avistamientos va con creado_en: es el que usa el tope por día.

create index avisos_departamento_idx on public.avisos (departamento);
create index avistamientos_autor_idx on public.avistamientos (autor_id, creado_en desc);
create index avistamientos_departamento_idx on public.avistamientos (departamento);
create index denuncias_denunciante_idx on public.denuncias (denunciante_id);
create index denuncias_revisado_por_idx on public.denuncias (revisado_por);
create index modulos_cambiado_por_idx on public.modulos (cambiado_por);
