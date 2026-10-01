-- El bucket `fotos` (spec §5.1). Público, con una carpeta por aviso
-- (`avisos/<id>/…`) y por avistamiento (`avistamientos/<id>/…`). Sube, cambia
-- y borra sólo el autor de esa cosa, o el admin.
--
-- Tope de tamaño y de tipo del lado del servidor (bagayí 012): el `accept` del
-- input se saltea, y un .html en un bucket público es una página servida desde
-- el dominio del proyecto. Las fotos llegan achicadas del navegador (§2.15).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 3 * 1024 * 1024, array['image/webp', 'image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create or replace function privado.carpeta_de_fotos_propia(p_nombre text)
returns boolean language sql stable security definer set search_path = public as $$
  select case (storage.foldername(p_nombre))[1]
    when 'avisos' then exists (
      select 1 from public.avisos a
       where a.id::text = (storage.foldername(p_nombre))[2]
         and (a.autor_id = auth.uid() or privado.es_admin()))
    when 'avistamientos' then exists (
      select 1 from public.avistamientos v
       where v.id::text = (storage.foldername(p_nombre))[2]
         and (v.autor_id = auth.uid() or privado.es_admin()))
    else false
  end;
$$;
grant execute on function privado.carpeta_de_fotos_propia(text) to authenticated;

-- El select hace falta para `upsert` (subirArchivo lo usa). Leer las fotos del
-- público no pasa por acá: el bucket es público.
create policy fotos_leer_propias on storage.objects for select to authenticated
  using (bucket_id = 'fotos' and privado.carpeta_de_fotos_propia(name));
create policy fotos_subir_propias on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and privado.carpeta_de_fotos_propia(name));
create policy fotos_cambiar_propias on storage.objects for update to authenticated
  using (bucket_id = 'fotos' and privado.carpeta_de_fotos_propia(name))
  with check (bucket_id = 'fotos' and privado.carpeta_de_fotos_propia(name));
create policy fotos_borrar_propias on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and privado.carpeta_de_fotos_propia(name));
