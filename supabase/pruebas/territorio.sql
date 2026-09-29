-- El punto (spec §5.3): se redondea en metros y la zona sale del punto exacto.
create or replace function pg_temp.probar()
returns table (caso text, ok boolean, obtenido text)
language plpgsql as $$
declare
  p extensions.geography;
  r extensions.geography;
  u record;
begin
  p := pg_temp.punto_en('Pocitos');

  begin
    raise exception 'FIN:%', pg_temp.en_grilla(privado.redondear_punto(p, 400), 400)::text;
  exception when others then
    caso := 'redondear a 400 m deja el punto en la grilla'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:true'; return next;
  end;

  begin
    raise exception 'FIN:%', pg_temp.en_grilla(privado.redondear_punto(p, 100), 100)::text;
  exception when others then
    caso := 'redondear a 100 m deja el punto en la grilla'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:true'; return next;
  end;

  begin
    r := privado.redondear_punto(p, 400);
    -- La esquina más lejana de una celda de 400 m está a 283 m del centro.
    raise exception 'FIN:%', (extensions.st_distance(p, r) <= 283)::text;
  exception when others then
    caso := 'el punto redondeado no se va lejos'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:true'; return next;
  end;

  begin
    select * into u from privado.ubicar(pg_temp.punto_en('Pocitos')::extensions.geometry);
    raise exception 'FIN:%/%', u.departamento, u.zona;
  exception when others then
    caso := 'en Montevideo la zona es el barrio'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:Montevideo/Pocitos'; return next;
  end;

  begin
    select * into u from privado.ubicar(pg_temp.punto_en('Las Piedras')::extensions.geometry);
    raise exception 'FIN:%/%', u.departamento, u.zona;
  exception when others then
    caso := 'en el resto del país la zona es la localidad'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:Canelones/Las Piedras'; return next;
  end;

  begin
    -- Un punto de Tacuarembó que no cae en ninguna localidad.
    select * into u from privado.ubicar((
      select extensions.st_pointonsurface(extensions.st_difference(d.geom,
               coalesce((select extensions.st_union(z.geom) from public.zonas z where z.departamento = 'Tacuarembó'),
                        extensions.st_setsrid('POLYGON EMPTY'::extensions.geometry, 4326))))
        from public.departamentos d where d.nombre = 'Tacuarembó'));
    raise exception 'FIN:%/%', u.departamento, u.zona;
  exception when others then
    caso := 'fuera de toda localidad es zona rural'; obtenido := sqlerrm;
    ok := obtenido = 'FIN:Tacuarembó/Zona rural de Tacuarembó'; return next;
  end;

  begin
    -- El Obelisco de Buenos Aires.
    select * into u from privado.ubicar(extensions.st_setsrid(extensions.st_makepoint(-58.3816, -34.6037), 4326));
    raise exception 'FIN:%/%', u.departamento, u.zona;
  exception when others then
    caso := 'un punto fuera de Uruguay se rechaza'; obtenido := sqlerrm;
    ok := obtenido like '%El punto tiene que estar en Uruguay%'; return next;
  end;
end $$;
