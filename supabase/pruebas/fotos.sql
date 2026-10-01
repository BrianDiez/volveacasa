-- El bucket `fotos` (spec §5.1): tope, tipos y carpetas por dueño.
create or replace function pg_temp.probar()
returns table (caso text, ok boolean, obtenido text)
language plpgsql as $$
declare
  a uuid; b uuid; aviso uuid; n bigint;
begin
  begin
    raise exception 'FIN:%', (select file_size_limit || '/' || array_to_string(allowed_mime_types, ',') || '/' || public
                                from storage.buckets where id = 'fotos');
  exception when others then
    caso := 'el bucket tiene tope, tipos y es público'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:3145728/image/webp,image/jpeg/true'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    aviso := pg_temp.aviso(a);
    perform pg_temp.como(a);
    insert into storage.objects (bucket_id, name) values ('fotos', 'avisos/' || aviso || '/1.webp');
    get diagnostics n = row_count;
    raise exception 'FIN:%', n;
  exception when others then
    caso := 'el autor sube a la carpeta de su aviso'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:1'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    b := pg_temp.usuario('b@prueba.invalid');
    aviso := pg_temp.aviso(a);
    perform pg_temp.como(b);
    insert into storage.objects (bucket_id, name) values ('fotos', 'avisos/' || aviso || '/1.webp');
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'nadie sube a la carpeta del aviso de otro'; obtenido := sqlerrm;
    ok := obtenido like '%row-level security%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    perform pg_temp.como(a);
    insert into storage.objects (bucket_id, name) values ('fotos', 'cualquiera/1.webp');
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'nadie sube fuera de las carpetas de avisos y avistamientos'; obtenido := sqlerrm;
    ok := obtenido like '%row-level security%'; return next;
  end;
end $$;
