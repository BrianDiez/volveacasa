-- Configuración y módulos (spec §5.2 y §8).
create or replace function pg_temp.probar()
returns table (caso text, ok boolean, obtenido text)
language plpgsql as $$
declare
  a uuid; adm uuid; n bigint; v text;
begin
  begin
    perform pg_temp.como_anon();
    select count(*) into n from public.configuracion;
    -- «Al menos»: las fases siguientes suman claves.
    raise exception 'FIN:%', (n >= 16)::text;
  exception when others then
    caso := 'cualquiera lee la configuración'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:true'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    perform pg_temp.como(a);
    update public.configuracion set valor = '1' where clave = 'tope_avisos_por_dia';
    get diagnostics n = row_count;
    raise exception 'FIN:%', n;
  exception when others then
    caso := 'un usuario no cambia la configuración'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:0'; return next;
  end;

  begin
    adm := pg_temp.admin('adm@prueba.invalid');
    perform pg_temp.como(adm);
    update public.configuracion set valor = '7' where clave = 'tope_avisos_por_dia';
    get diagnostics n = row_count;
    raise exception 'FIN:%', n;
  exception when others then
    caso := 'el admin cambia la configuración'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:1'; return next;
  end;

  begin
    adm := pg_temp.admin('adm@prueba.invalid');
    perform pg_temp.como(adm);
    update public.configuracion set valor = '20' where clave = 'grilla_perdido_m';
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'ninguna grilla baja de 50 metros'; obtenido := sqlerrm;
    ok := obtenido like '%50 metros%'; return next;
  end;

  begin
    adm := pg_temp.admin('adm@prueba.invalid');
    perform pg_temp.como(adm);
    update public.configuracion set valor = '"mucho"' where clave = 'parecidos_km';
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'los valores son números positivos'; obtenido := sqlerrm;
    ok := obtenido like '%número positivo%'; return next;
  end;

  begin
    raise exception 'FIN:%', privado.config_numero('no_existe');
  exception when others then
    caso := 'una clave que falta frena, no inventa un valor'; obtenido := sqlerrm;
    ok := obtenido like '%Falta la configuración%'; return next;
  end;

  begin
    a := pg_temp.usuario('a@prueba.invalid');
    perform pg_temp.como(a);
    update public.modulos set activo = true where clave = 'veterinarias';
    get diagnostics n = row_count;
    raise exception 'FIN:%', n;
  exception when others then
    caso := 'un usuario no prende un módulo'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:0'; return next;
  end;

  begin
    adm := pg_temp.admin('adm@prueba.invalid');
    perform pg_temp.como(adm);
    update public.modulos set activo = true where clave = 'veterinarias';
    select (cambiado_por = adm and cambiado_en > now() - interval '1 minute')::text into v
      from public.modulos where clave = 'veterinarias';
    raise exception 'FIN:%', v;
  exception when others then
    caso := 'el admin prende un módulo y queda quién y cuándo'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:true'; return next;
  end;

  begin
    -- Contra la tabla y no contra «false»: el dueño puede prender uno en producción.
    raise exception 'FIN:%/%',
      (privado.modulo_activo('veterinarias') = (select activo from public.modulos where clave = 'veterinarias'))::text,
      privado.modulo_activo('no_existe')::text;
  exception when others then
    caso := 'modulo_activo lee el switch y lo desconocido está apagado'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:true/false'; return next;
  end;

  begin
    adm := pg_temp.admin('adm@prueba.invalid');
    perform pg_temp.como(adm);
    insert into public.modulos (clave, tipo) values ('inventado', 'modulo');
    raise exception 'FIN:sin error';
  exception when others then
    caso := 'nadie agrega módulos desde la API'; obtenido := sqlerrm;
    ok := obtenido like '%row-level security%'; return next;
  end;
end $$;
