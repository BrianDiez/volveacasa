-- pg_net: la base hace pedidos HTTP. Lo usa la carga del territorio (fase 1) y
-- después los webhooks de los mails (fases 5 y 6). Sus funciones viven en el
-- esquema `net`, que PostgREST no expone.
create extension if not exists pg_net with schema extensions;
