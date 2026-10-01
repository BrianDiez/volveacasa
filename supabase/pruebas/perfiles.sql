-- Perfiles: quién ve y quién cambia qué (spec §5.1, §5.1.1 y §5.4).
create or replace function pg_temp.probar()
returns table (caso text, ok boolean, obtenido text)
language plpgsql as $$
declare
  a uuid; b uuid; adm uuid; n bigint;
begin
  begin
    a := pg_temp.usuario('a@prueba.invalid');
    raise exception 'FIN:%/%',
      (select count(*) from public.perfiles where id = a),
      (select count(*) from public.perfiles_privados where id = a);
  exception when others then
    caso := 'el alta crea el perfil y el perfil privado'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:1/1'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    perform pg_temp.como_anon();
    select count(*) into n from public.perfiles_privados;
    raise exception 'FIN:%', n;
  exception when others then
    caso := 'anon no lee nada de perfiles_privados'; obtenido := sqlerrm;
    ok := obtenido like '%permission denied%' or obtenido = 'FIN:0'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    b := pg_temp.usuario('b@prueba.invalid');
    perform pg_temp.como(a);
    select count(*) into n from public.perfiles_privados where id = b;
    raise exception 'FIN:%', n;
  exception when others then
    caso := 'nadie ve el rol ni el WhatsApp de otro'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:0'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    perform pg_temp.como(a);
    update public.perfiles_privados set rol = 'admin' where id = a;
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'nadie se hace admin a sí mismo'; obtenido := sqlerrm;
    ok := obtenido like '%No podés cambiar tu rol%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    update public.perfiles_privados set suspendido = true where id = a;
    perform pg_temp.como(a);
    update public.perfiles_privados set suspendido = false where id = a;
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'un suspendido no se levanta la suspensión'; obtenido := sqlerrm;
    ok := obtenido like '%No podés cambiar tu rol ni tu suspensión%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    perform pg_temp.como(a);
    update public.perfiles set tipo = 'protectora', verificada = true where id = a;
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'nadie se marca protectora verificada'; obtenido := sqlerrm;
    ok := obtenido like '%Sólo el equipo marca las protectoras%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    perform pg_temp.como(a);
    update public.perfiles set nombre = 'Lucía' where id = a;
    get diagnostics n = row_count;
    raise exception 'FIN:%', n;
  exception when others then
    caso := 'cada uno cambia su nombre'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:1'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    delete from public.perfiles_privados where id = a;
    perform pg_temp.como(a);
    insert into public.perfiles_privados (id) values (a);
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'nadie inserta perfiles a mano'; obtenido := sqlerrm;
    ok := obtenido like '%row-level security%'; return next;
  end;

  begin
    adm := pg_temp.admin('adm@prueba.invalid');
    -- Los demás admins (el dueño) dejan de serlo adentro del caso: así el de
    -- prueba es el único, y todo se deshace al salir.
    update public.perfiles_privados set rol = 'usuario' where rol = 'admin' and id <> adm;
    update public.perfiles_privados set rol = 'usuario' where id = adm;
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'el único admin no deja de serlo'; obtenido := sqlerrm;
    ok := obtenido like '%Es el único admin%'; return next;
  end;

  begin
    adm := pg_temp.admin('adm@prueba.invalid');
    update public.perfiles_privados set rol = 'usuario' where rol = 'admin' and id <> adm;
    delete from auth.users where id = adm;
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'al único admin no se lo borra'; obtenido := sqlerrm;
    ok := obtenido like '%Es el único admin%'; return next;
  end;

  begin
    adm := pg_temp.admin('adm@prueba.invalid');
    a := pg_temp.usuario('a@prueba.invalid');
    perform pg_temp.como(adm);
    update public.perfiles_privados set rol = 'admin' where id = a;
    get diagnostics n = row_count;
    raise exception 'FIN:%', n;
  exception when others then
    caso := 'un admin nombra a otro'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:1'; return next;
  end;
end $$;
