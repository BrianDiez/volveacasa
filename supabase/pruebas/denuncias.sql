-- Denuncias (spec §5.4, decisión del 2026-09-28) y estado público (§5.1.1).
--
-- Para denunciar como varias personas seguidas, el caso cambia de usuario con
-- set_config directo: una vez `authenticated`, no se vuelve a postgres.
create or replace function pg_temp.probar()
returns table (caso text, ok boolean, obtenido text)
language plpgsql as $$
declare
  a uuid; b uuid; c uuid; d uuid; aviso uuid; vis uuid; v text; n bigint;
begin
  begin
    a := pg_temp.usuario('a@prueba.invalid');
    b := pg_temp.usuario('b@prueba.invalid'); c := pg_temp.usuario('c@prueba.invalid'); d := pg_temp.usuario('d@prueba.invalid');
    aviso := pg_temp.aviso(a);
    perform pg_temp.como(b);
    insert into public.denuncias (aviso_id, motivo) values (aviso, 'falso');
    perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
    insert into public.denuncias (aviso_id, motivo) values (aviso, 'falso');
    perform set_config('request.jwt.claims', json_build_object('sub', d, 'role', 'authenticated')::text, true);
    insert into public.denuncias (aviso_id, motivo) values (aviso, 'estafa');
    raise exception 'FIN:%', public.estado_publico(left(aviso::text, 8));
  exception when others then
    caso := 'tres denuncias de cuentas con antigüedad lo ponen en revisión'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:en_revision'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    b := pg_temp.usuario('b@prueba.invalid'); c := pg_temp.usuario('c@prueba.invalid');
    d := pg_temp.usuario('d@prueba.invalid', 1);  -- cuenta de hace una hora
    aviso := pg_temp.aviso(a);
    perform pg_temp.como(b);
    insert into public.denuncias (aviso_id, motivo) values (aviso, 'falso');
    perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
    insert into public.denuncias (aviso_id, motivo) values (aviso, 'falso');
    perform set_config('request.jwt.claims', json_build_object('sub', d, 'role', 'authenticated')::text, true);
    insert into public.denuncias (aviso_id, motivo) values (aviso, 'falso');
    raise exception 'FIN:%', public.estado_publico(left(aviso::text, 8));
  exception when others then
    caso := 'la denuncia de una cuenta nueva no cuenta para ocultar'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:activo'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    update public.perfiles set tipo = 'protectora', verificada = true where id = a;
    b := pg_temp.usuario('b@prueba.invalid'); c := pg_temp.usuario('c@prueba.invalid'); d := pg_temp.usuario('d@prueba.invalid');
    aviso := pg_temp.aviso(a, 'adopcion');
    perform pg_temp.como(b);
    insert into public.denuncias (aviso_id, motivo) values (aviso, 'falso');
    perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
    insert into public.denuncias (aviso_id, motivo) values (aviso, 'falso');
    perform set_config('request.jwt.claims', json_build_object('sub', d, 'role', 'authenticated')::text, true);
    insert into public.denuncias (aviso_id, motivo) values (aviso, 'falso');
    raise exception 'FIN:%', public.estado_publico(left(aviso::text, 8));
  exception when others then
    caso := 'una protectora verificada no se oculta sola'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:activo'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    b := pg_temp.usuario('b@prueba.invalid');
    aviso := pg_temp.aviso(a);
    perform pg_temp.como(b);
    insert into public.denuncias (aviso_id, motivo) values (aviso, 'falso');
    insert into public.denuncias (aviso_id, motivo) values (aviso, 'estafa');
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'nadie denuncia dos veces lo mismo'; obtenido := sqlerrm;
    ok := obtenido like '%denuncia_abierta_por_aviso%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    aviso := pg_temp.aviso(a);
    perform pg_temp.como(a);
    insert into public.denuncias (aviso_id, motivo) values (aviso, 'falso');
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'nadie denuncia lo propio'; obtenido := sqlerrm;
    ok := obtenido like '%lo que publicaste vos%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    b := pg_temp.usuario('b@prueba.invalid');
    aviso := pg_temp.aviso(a);
    insert into public.avistamientos (autor_id, especie, punto, visto_en)
    values (a, 'perro', pg_temp.punto_en('Pocitos'), now()) returning id into vis;
    perform pg_temp.como(b);
    insert into public.denuncias (aviso_id, avistamiento_id, motivo) values (aviso, vis, 'falso');
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'una denuncia apunta a una sola cosa'; obtenido := sqlerrm;
    ok := obtenido like '%un_solo_objetivo%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    b := pg_temp.usuario('b@prueba.invalid');
    aviso := pg_temp.aviso(a);
    perform pg_temp.como(b);
    insert into public.denuncias (aviso_id, motivo) values (aviso, 'otro');
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'el motivo «otro» pide detalle'; obtenido := sqlerrm;
    ok := obtenido like '%otro_exige_detalle%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    b := pg_temp.usuario('b@prueba.invalid');
    aviso := pg_temp.aviso(a);
    insert into public.denuncias (aviso_id, denunciante_id, motivo) values (aviso, b, 'falso');
    perform pg_temp.como(a);
    raise exception 'FIN:%', (select count(*) from public.denuncias where aviso_id = aviso);
  exception when others then
    caso := 'el denunciado no ve quién lo denunció'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:0'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    aviso := pg_temp.aviso(a);
    update public.avisos set estado = 'oculto' where id = aviso;
    raise exception 'FIN:%', public.estado_publico(left(aviso::text, 8));
  exception when others then
    caso := 'lo que oculta el equipo figura como no disponible'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:no_disponible'; return next;
  end;

  begin
    raise exception 'FIN:%', public.estado_publico('zzzzzzzz');
  exception when others then
    caso := 'lo que no existe figura como no existe'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:no_existe'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    b := pg_temp.usuario('b@prueba.invalid'); c := pg_temp.usuario('c@prueba.invalid'); d := pg_temp.usuario('d@prueba.invalid');
    insert into public.avistamientos (autor_id, especie, punto, visto_en)
    values (a, 'perro', pg_temp.punto_en('Pocitos'), now()) returning id into vis;
    perform pg_temp.como(b);
    insert into public.denuncias (avistamiento_id, motivo) values (vis, 'falso');
    perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
    insert into public.denuncias (avistamiento_id, motivo) values (vis, 'falso');
    perform set_config('request.jwt.claims', json_build_object('sub', d, 'role', 'authenticated')::text, true);
    insert into public.denuncias (avistamiento_id, motivo) values (vis, 'falso');
    -- Quien denunció ya no lo ve...
    select count(*) into n from public.avistamientos where id = vis;
    -- ...y el autor, que sí ve lo suyo oculto, lo encuentra oculto por denuncias.
    -- (Antes esto era `estado || '/' || oculto_por`: con oculto_por nulo, o sea
    -- SIN ocultar, daba NULL y el caso pasaba igual.)
    perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
    select estado || '/' || coalesce(oculto_por::text, '-') into v from public.avistamientos where id = vis;
    raise exception 'FIN:%/%', n, v;
  exception when others then
    caso := 'tres denuncias ocultan un avistamiento'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:0/oculto/denuncias'; return next;
  end;
end $$;
