-- El arnés se prueba a sí mismo: el caso cambia de rol y de usuario, y al
-- salir no queda ni el usuario ni el rol.
create or replace function pg_temp.probar()
returns table (caso text, ok boolean, obtenido text)
language plpgsql as $$
declare
  uid uuid := gen_random_uuid();
begin
  begin
    insert into auth.users (id, email, aud, role) values (uid, 'arnes@prueba.invalid', 'authenticated', 'authenticated');
    perform pg_temp.como(uid);
    -- `::text`: RAISE escribe un boolean con su función de salida («t»), no
    -- con la conversión a texto («true»). Vale para todos los temas.
    raise exception 'FIN:% %', current_user, (auth.uid() = uid)::text;
  exception when others then
    caso := 'adentro del caso se es el usuario'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:authenticated true'; return next;
  end;

  caso := 'al salir se vuelve a postgres'; obtenido := current_user;
  ok := obtenido = 'postgres'; return next;

  caso := 'al salir no queda el usuario de prueba';
  obtenido := (select count(*) from auth.users where id = uid)::text;
  ok := obtenido = '0'; return next;
end $$;
