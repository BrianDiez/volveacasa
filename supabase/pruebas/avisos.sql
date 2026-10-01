-- Avisos (spec §5.1, §5.1.1 y §5.4).
create or replace function pg_temp.probar()
returns table (caso text, ok boolean, obtenido text)
language plpgsql as $$
declare
  a uuid; b uuid; aviso uuid; n bigint; v text; p extensions.geography;
begin
  p := pg_temp.punto_en('Pocitos');

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    perform pg_temp.como(a);
    insert into public.avisos (autor_id, tipo, especie, fecha_hecho, punto, estado, vence_en)
    values (gen_random_uuid(), 'perdido', 'perro', current_date, p, 'resuelto', now() + interval '10 years')
    returning (autor_id = a and estado = 'activo'
               and vence_en between now() + interval '29 days' and now() + interval '31 days')::text into v;
    raise exception 'FIN:%', v;
  exception when others then
    caso := 'el alta pone el autor, el estado y la vigencia'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:true'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    aviso := pg_temp.aviso(a);
    select (pg_temp.en_grilla(punto, 400) and departamento = 'Montevideo' and zona = 'Pocitos')::text
      into v from public.avisos where id = aviso;
    raise exception 'FIN:%', v;
  exception when others then
    caso := 'un perdido queda en la grilla de 400 m y en su barrio'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:true'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    aviso := pg_temp.aviso(a, 'adopcion');
    select pg_temp.en_grilla(punto, 1000)::text into v from public.avisos where id = aviso;
    raise exception 'FIN:%', v;
  exception when others then
    caso := 'una adopción queda en la grilla de 1 km'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:true'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    insert into public.avisos (autor_id, tipo, especie, fecha_hecho, punto, recompensa)
    values (a, 'encontrado', 'perro', current_date, p, true);
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'la recompensa es sólo de los perdidos'; obtenido := sqlerrm;
    ok := obtenido like '%recompensa_solo_en_perdidos%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    b := pg_temp.usuario('b@prueba.invalid');
    aviso := pg_temp.aviso(a);
    perform pg_temp.como(b);
    update public.avisos set nombre = 'Otro' where id = aviso;
    get diagnostics n = row_count;
    raise exception 'FIN:%', n;
  exception when others then
    caso := 'nadie edita el aviso de otro'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:0'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    aviso := pg_temp.aviso(a);
    perform pg_temp.como(a);
    update public.avisos set vence_en = now() + interval '1 year' where id = aviso;
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'el autor no alarga la vigencia a mano'; obtenido := sqlerrm;
    ok := obtenido like '%renovalo desde Mis avisos%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    aviso := pg_temp.aviso(a);
    perform pg_temp.como(a);
    update public.avisos set estado = 'oculto' where id = aviso;
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'el autor no oculta su aviso'; obtenido := sqlerrm;
    ok := obtenido like '%Sólo el equipo puede ocultar%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    aviso := pg_temp.aviso(a);
    update public.avisos set estado = 'oculto' where id = aviso;
    perform pg_temp.como(a);
    update public.avisos set estado = 'activo' where id = aviso;
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'el autor no se saca el oculto'; obtenido := sqlerrm;
    ok := obtenido like '%está en revisión%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    aviso := pg_temp.aviso(a);
    update public.avisos set estado = 'oculto' where id = aviso;
    select oculto_por::text into v from public.avisos where id = aviso;
    perform pg_temp.como_anon();
    select count(*) into n from public.avisos where id = aviso;
    raise exception 'FIN:%/%', v, n;
  exception when others then
    caso := 'lo que oculta el servidor dice admin y el público no lo ve'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:admin/0'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    aviso := pg_temp.aviso(a);
    update public.avisos set estado = 'vencido', vence_en = now() - interval '1 day' where id = aviso;
    perform pg_temp.como_anon();
    select count(*) into n from public.avisos where id = aviso;
    raise exception 'FIN:%', n;
  exception when others then
    caso := 'un vencido se sigue leyendo (su link circula)'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:1'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    aviso := pg_temp.aviso(a);
    perform pg_temp.como(a);
    update public.avisos set estado = 'resuelto', resuelto_en = '2000-01-01', ayudo_sitio = 'si' where id = aviso;
    select (resuelto_en > now() - interval '1 minute')::text into v from public.avisos where id = aviso;
    raise exception 'FIN:%', v;
  exception when others then
    caso := 'el autor lo resuelve y la base pone la fecha'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:true'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    aviso := pg_temp.aviso(a);
    update public.avisos set estado = 'resuelto' where id = aviso;
    perform pg_temp.como(a);
    update public.avisos set estado = 'activo' where id = aviso;
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'un resuelto no se reabre'; obtenido := sqlerrm;
    ok := obtenido like '%no se reabre%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    aviso := pg_temp.aviso(a);
    update public.avisos set estado = 'vencido', vence_en = now() - interval '1 day' where id = aviso;
    perform pg_temp.como(a);
    perform public.renovar_aviso(aviso);
    select (estado = 'activo' and vence_en > now() + interval '29 days')::text into v from public.avisos where id = aviso;
    raise exception 'FIN:%', v;
  exception when others then
    caso := 'renovar vuelve a activo por el plazo del tipo'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:true'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    b := pg_temp.usuario('b@prueba.invalid');
    aviso := pg_temp.aviso(a);
    perform pg_temp.como(b);
    perform public.renovar_aviso(aviso);
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'nadie renueva el aviso de otro'; obtenido := sqlerrm;
    ok := obtenido like '%No encontramos ese aviso%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    update public.perfiles_privados set suspendido = true where id = a;
    perform pg_temp.como(a);
    insert into public.avisos (autor_id, tipo, especie, fecha_hecho, punto) values (a, 'perdido', 'perro', current_date, p);
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'un suspendido no publica'; obtenido := sqlerrm;
    ok := obtenido like '%no puede publicar%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    perform pg_temp.como(a);
    for i in 1..6 loop
      insert into public.avisos (autor_id, tipo, especie, fecha_hecho, punto) values (a, 'perdido', 'perro', current_date, p);
    end loop;
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'hay un tope de avisos por día'; obtenido := sqlerrm;
    ok := obtenido like '%máximo de avisos por día%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    aviso := pg_temp.aviso(a);
    insert into public.contactos_aviso (aviso_id, whatsapp) values (aviso, '+59899123456');
    perform pg_temp.como_anon();
    select count(*) into n from public.contactos_aviso;
    raise exception 'FIN:%', n;
  exception when others then
    caso := 'anon no lee ningún WhatsApp'; obtenido := sqlerrm;
    ok := obtenido like '%permission denied%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    b := pg_temp.usuario('b@prueba.invalid');
    aviso := pg_temp.aviso(a);
    insert into public.contactos_aviso (aviso_id, whatsapp) values (aviso, '+59899123456');
    perform pg_temp.como(b);
    select count(*) into n from public.contactos_aviso where aviso_id = aviso;
    raise exception 'FIN:%', n;
  exception when others then
    caso := 'nadie lee el WhatsApp de otro'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:0'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    aviso := pg_temp.aviso(a);
    perform pg_temp.como(a);
    insert into public.contactos_aviso (aviso_id, whatsapp) values (aviso, '099123456');
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'el WhatsApp va en formato internacional'; obtenido := sqlerrm;
    ok := obtenido like '%contactos_aviso_whatsapp_check%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    b := pg_temp.usuario('b@prueba.invalid');
    aviso := pg_temp.aviso(a);
    perform pg_temp.como(b);
    insert into public.fotos_aviso (aviso_id, orden, path) values (aviso, 0, 'avisos/' || aviso || '/x.webp');
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'nadie agrega fotos al aviso de otro'; obtenido := sqlerrm;
    ok := obtenido like '%row-level security%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    aviso := pg_temp.aviso(a);
    perform pg_temp.como(a);
    insert into public.fotos_aviso (aviso_id, orden, path) values (aviso, 0, 'avisos/' || aviso || '/a.webp');
    update public.fotos_aviso set path = 'avisos/' || aviso || '/b.webp' where aviso_id = aviso and orden = 0;
    get diagnostics n = row_count;
    delete from public.fotos_aviso where aviso_id = aviso;
    raise exception 'FIN:%/%', n, (select count(*) from public.fotos_aviso where aviso_id = aviso);
  exception when others then
    caso := 'el autor agrega, cambia y borra las fotos de su aviso'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:1/0'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    b := pg_temp.usuario('b@prueba.invalid');
    aviso := pg_temp.aviso(a);
    insert into public.fotos_aviso (aviso_id, orden, path) values (aviso, 0, 'avisos/' || aviso || '/a.webp');
    perform pg_temp.como(b);
    select count(*) into n from public.fotos_aviso where aviso_id = aviso;
    raise exception 'FIN:%', n;
  exception when others then
    caso := 'otra cuenta ve las fotos de un aviso visible'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:1'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    aviso := pg_temp.aviso(a);
    insert into public.fotos_aviso (aviso_id, orden, path) values (aviso, 6, 'avisos/' || aviso || '/x.webp');
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'un aviso tiene hasta 6 fotos'; obtenido := sqlerrm;
    ok := obtenido like '%fotos_aviso_orden_check%'; return next;
  end;
end $$;
