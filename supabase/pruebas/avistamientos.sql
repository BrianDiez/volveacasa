-- Avistamientos (spec §2.12 y §5.4).
create or replace function pg_temp.probar()
returns table (caso text, ok boolean, obtenido text)
language plpgsql as $$
declare
  a uuid; aviso uuid; vis uuid; n bigint; v text; p extensions.geography;
begin
  p := pg_temp.punto_en('Pocitos');

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    perform pg_temp.como(a);
    insert into public.avistamientos (autor_id, especie, punto, visto_en, vence_en)
    values (gen_random_uuid(), 'perro', p, now() - interval '1 hour', now() + interval '1 year')
    returning (autor_id = a and vence_en = visto_en + interval '24 hours')::text into v;
    raise exception 'FIN:%', v;
  exception when others then
    caso := 'el alta pone el autor y vence 24 h después de visto'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:true'; return next;
  end;

  -- La grilla se mide como postgres: las ayudas pg_temp no se llaman después
  -- de pasar a authenticated (00-ayudas.sql).
  begin
    a := pg_temp.usuario('a@prueba.invalid');
    insert into public.avistamientos (autor_id, especie, punto, visto_en)
    values (a, 'perro', p, now()) returning id into vis;
    select pg_temp.en_grilla(punto, 100)::text into v from public.avistamientos where id = vis;
    raise exception 'FIN:%', v;
  exception when others then
    caso := 'un avistamiento queda en la grilla de 100 m'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:true'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    perform pg_temp.como(a);
    insert into public.avistamientos (autor_id, especie, punto, visto_en) values (a, 'perro', p, now() + interval '1 hour');
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'no se carga un avistamiento en el futuro'; obtenido := sqlerrm;
    ok := obtenido like '%futuro%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    perform pg_temp.como(a);
    insert into public.avistamientos (autor_id, especie, punto, visto_en) values (a, 'perro', p, now() - interval '25 hours');
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'no nace vencido'; obtenido := sqlerrm;
    ok := obtenido like '%últimas 24 horas%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    aviso := pg_temp.aviso(a, 'encontrado');
    perform pg_temp.como(a);
    insert into public.avistamientos (autor_id, aviso_id, especie, punto, visto_en) values (a, aviso, 'perro', p, now());
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'sólo se liga a un perdido activo'; obtenido := sqlerrm;
    ok := obtenido like '%perdido que siga activo%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    aviso := pg_temp.aviso(a, 'perdido');
    perform pg_temp.como(a);
    insert into public.avistamientos (autor_id, aviso_id, especie, punto, visto_en) values (a, aviso, 'perro', p, now());
    get diagnostics n = row_count;
    raise exception 'FIN:%', n;
  exception when others then
    caso := 'se liga a un perdido activo'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:1'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    perform pg_temp.como(a);
    insert into public.avistamientos (autor_id, especie, punto, visto_en) values (a, 'perro', p, now()) returning id into vis;
    update public.avistamientos set visto_en = now() - interval '2 hours' where id = vis;
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'el autor no cambia cuándo lo vio'; obtenido := sqlerrm;
    ok := obtenido like '%sólo se puede cambiar la nota y la foto%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    perform pg_temp.como(a);
    insert into public.avistamientos (autor_id, especie, punto, visto_en) values (a, 'perro', p, now()) returning id into vis;
    update public.avistamientos set nota = 'Iba hacia la rambla' where id = vis;
    get diagnostics n = row_count;
    raise exception 'FIN:%', n;
  exception when others then
    caso := 'el autor cambia la nota'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:1'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    insert into public.avistamientos (autor_id, especie, punto, visto_en) values (a, 'perro', p, now() - interval '3 days') returning id into vis;
    perform pg_temp.como_anon();
    select count(*) into n from public.avistamientos where id = vis;
    raise exception 'FIN:%', n;
  exception when others then
    caso := 'un vencido se sigue leyendo (el recorrido lo muestra)'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:1'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    insert into public.avistamientos (autor_id, especie, punto, visto_en) values (a, 'perro', p, now()) returning id into vis;
    update public.avistamientos set estado = 'oculto' where id = vis;
    perform pg_temp.como_anon();
    select count(*) into n from public.avistamientos where id = vis;
    raise exception 'FIN:%', n;
  exception when others then
    caso := 'un oculto no se ve'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:0'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    update public.perfiles_privados set suspendido = true where id = a;
    perform pg_temp.como(a);
    insert into public.avistamientos (autor_id, especie, punto, visto_en) values (a, 'perro', p, now());
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'un suspendido no carga avistamientos'; obtenido := sqlerrm;
    ok := obtenido like '%no puede cargar avistamientos%'; return next;
  end;
end $$;
