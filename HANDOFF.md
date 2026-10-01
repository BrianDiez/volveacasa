# Volvé a casa — traspaso de contexto

> Arrancado el 2026-09-28. Tiene la forma del de bagayí: qué es, estado medido,
> mapa, errores y cómo trabajar. **Si un dato se puede medir, va la forma de
> medirlo, no el número** (bagayí §4.3); cuando el número ayuda, va con fecha.

---

## 1 · Qué es

Un sitio de mascotas **perdidas, avistadas, encontradas y en adopción** en
Uruguay, presentado como *«Un proyecto de bagayí»*. Compartir es el motor (el
aviso sale listo para WhatsApp, Instagram y un afiche) y el mapa es la
herramienta de búsqueda. El diseño completo y las decisiones cerradas están en
[`BRIEF.md`](BRIEF.md); la fuente de verdad visual es
[`design-src/Maqueta.html`](design-src/Maqueta.html).

---

## 2 · Estado

### Por paso del BRIEF §2

| Paso | Estado | Cómo verificarlo |
|---|---|---|
| 1 · Maqueta y paleta | **Aprobado por el dueño el 2026-09-28**, con cambios ya aplicados | `design-src/Maqueta.html`; `node design-src/contrastes.mjs` sale con 0 |
| 2 · Infraestructura | **Hecho el 2026-09-28** | la tabla de abajo |
| 3 · Spec del núcleo | **Aprobado por el dueño el 2026-09-28** | `docs/superpowers/specs/2026-09-28-nucleo-design.md` |
| 4 · Plan | **Hecho el 2026-09-28**: hoja de ruta de las 7 fases (cada pantalla y regla con su tarea y su test) y el plan detallado de la fase 1; el de cada fase siguiente se escribe al cerrar la anterior | `docs/superpowers/plans/` |
| 5 · Ejecución | **En curso: fase 1 (Base) cerrada el 2026-09-30**, en la rama `fase-1-base`; falta el merge a `main` (§10) | `node scripts/prueba-sql.mjs todos` → `execute_sql`: todas las filas con `pasan = casos` |
| 6 · Antes de lanzar | Pendiente | BRIEF §2, paso 6 |

### Criterios del paso 2

| Criterio | Estado | Cómo medirlo |
|---|---|---|
| `npm run dev` muestra en `:5174` el layout con la paleta aprobada | ✅ 2026-09-28, abierto a 375 y 1280 | `npm run dev` y abrir `http://localhost:5174` |
| `npm test` y `npm run build` en verde | ✅ 2026-09-28 | `npm test && npm run build` |
| El push a `main` desplegó y la URL responde 200 | ✅ 2026-09-28 | `curl -s -o /dev/null -w "%{http_code}" https://volveacasa-henna.vercel.app/` |
| `select postgis_version()` por MCP contra el proyecto nuevo | ✅ 2026-09-28: PostGIS 3.3 | `select extensions.postgis_version();` |
| El HANDOFF dice contra qué base corre `npm run dev` | ✅ | §3 |

### Lo mecánico, para correr antes de creerle a este documento

```bash
npm test                              # conteo de tests y de archivos
npm run build
npm audit
ls supabase/migrations/*.sql | wc -l  # migraciones en disco
git log -1 --oneline origin/main      # qué está desplegado
```

```sql
-- Migraciones aplicadas: tienen que ser las mismas versiones que los
-- nombres de archivo de supabase/migrations.
select version, name from supabase_migrations.schema_migrations order by version;
select extensions.postgis_version();

-- El territorio cargado (2026-09-30: 19 departamentos; zonas: 62 barrios y
-- 651 localidades). Se recarga con supabase/datos/territorio/cargar.sql.
select (select count(*) from public.departamentos) as departamentos;
select tipo, count(*) from public.zonas group by tipo;

-- Ningún punto guardado con más precisión que su grilla (spec §5.3). Tiene
-- que dar 0 siempre; se corre al cerrar cada fase.
select count(*) as con_mas_precision_que_su_grilla
  from (
    select a.punto, c.valor from public.avisos a
      join public.configuracion c on c.clave = 'grilla_' || a.tipo || '_m'
    union all
    select v.punto, c.valor from public.avistamientos v
      join public.configuracion c on c.clave = 'grilla_avistamiento_m'
  ) t
 where not (
   abs(extensions.st_x(extensions.st_transform(t.punto::extensions.geometry, 32721)) / (t.valor #>> '{}')::numeric
       - round(extensions.st_x(extensions.st_transform(t.punto::extensions.geometry, 32721)) / (t.valor #>> '{}')::numeric)) < 1e-6
   and abs(extensions.st_y(extensions.st_transform(t.punto::extensions.geometry, 32721)) / (t.valor #>> '{}')::numeric
       - round(extensions.st_y(extensions.st_transform(t.punto::extensions.geometry, 32721)) / (t.valor #>> '{}')::numeric)) < 1e-6
 );
```

Las reglas de la base, en vivo: `node scripts/prueba-sql.mjs todos` arma
`supabase/pruebas/.armado.sql` con todos los temas; se pasa entero a
`execute_sql` y devuelve una fila por tema (`pasan`, `casos`, `fallan`). Un
tema solo: `node scripts/prueba-sql.mjs <tema>`. No deja nada escrito.

---

## 3 · Contra qué base corre cada cosa

- **`npm run dev` → producción.** Sin `.env`, `src/lib/config-publico.js` cae al
  respaldo de `src/lib/respaldo-publico.js`: el proyecto Supabase `volveacasa`,
  ref `blyyywzroyydnusqpzfq`, sa-east-1, organización `mvxfxhemyepswsjrxjcq`
  (useaside.app). Es la única base: no hay staging ni Docker en esta máquina. Qué
  hacer después de lanzar lo decide el dueño (BRIEF §10.4).
- La clave del cliente es la **publicable nueva** (`sb_publishable_…`), no la anon
  JWT de bagayí. Es pública por diseño; lo que protege los datos es la RLS.
- **El Vloas** se pausó el 2026-09-28, a pedido del dueño, para liberar el cupo de
  dos proyectos activos del plan gratis. Se restaura con un clic durante 90 días;
  después sólo queda bajar el backup (BRIEF §3.2).
- **Costo del proyecto nuevo:** 0 USD por mes (plan gratis), confirmado con la
  herramienta de Supabase al crearlo.

---

## 4 · Repo, deploy y herramientas

- **GitHub:** `BrianDiez/volveacasa`, privado. Lo creó el dueño el 2026-09-28 (en
  esta máquina no hay `gh` y el conector de GitHub no está autorizado). El push
  anda con el administrador de credenciales de Git.
- **Vercel:** proyecto `volveacasa` (`prj_OkuXgLFaBmPwvNaYxDUqAPHhAo4Z`) en el team
  *brian diez's projects* (`team_rOEiOvTu6ppAWtHVhFEOTXVQ`), conectado al repo,
  rama de producción `main`. **Un push a `main` despliega a producción.**
- **URL:** https://volveacasa-henna.vercel.app (hasta que haya dominio, BRIEF §2
  paso 6). Qué está desplegado se mide con el conector de Vercel
  (`list_deployments` del proyecto) o con `git log -1 origin/main`.
- **La CSP y `Permissions-Policy` sólo se aplican desplegado** (`npm run dev` no
  lee `vercel.json`). Verificado el 2026-09-28: la home carga fuentes y chunks
  sin violaciones, y `geolocation=(self)` llega en los headers.
- **PR:** al cerrar la fase 1 (2026-09-30) la sesión seguía sin `gh` y sin un
  conector de GitHub (el plugin `engineering:github` figura sin autorizar). El
  dueño dijo haber conectado GitHub; si el conector aparece en una sesión
  nueva, la rama se cierra con PR; si no, con `merge --no-ff` (hoja de ruta,
  «Cómo se trabaja»). Instalar `gh` y hacer `gh auth login` también lo resuelve.
- **Los datos del territorio están en `main`** desde el 2026-09-29
  (`public/datos/territorio/`, commit «Datos del territorio … para cargar en la
  base»): la base los baja por HTTP y los preview de Vercel piden login.
- **`vercel dev` en el 3001:** no está instalado; el proxy de `/api` ya apunta
  ahí (`vite.config.js`). Hace falta recién cuando haya funciones en `/api`.

---

## 5 · Mapa de archivos

### De dónde salió cada cosa

| Archivo | Origen | Qué cambió |
|---|---|---|
| `package.json`, `vite.config.js`, `vitest.setup.js` | bagayí | nombre, puerto 5174 (`strictPort`), proxy a 3001 |
| `src/styles/tokens.css` | bagayí | la paleta aprobada; alias `--error`, `--alerta`, `--info`, `--exito` sobre los colores de estado; `.cinta`, `.insignia`, `t-*`, entradas del inicio, header y pie; sin las clases propias de bagayí; `@media print` para el afiche |
| `src/ui/kit.jsx` | bagayí | secundario con borde neutro (maqueta), botón `whatsapp`, alturas de 48/38; sin Estrellas ni FotoPrivada |
| `src/ui/marca.jsx` | nuevo | `Isotipo` provisorio (casita con huella, §10.2), `LogoBagayi` con el vectorial de bagayí, `CreditoBagayi` con UTM |
| `src/lib/useQuery.js`, `useAccion.js`, `useMedia.js`, `config-publico.js`, `fechas.js`, `format.js` | bagayí | nada |
| `src/lib/slug.js` | bagayí | las rutas: `rutaAviso` (`/a/`) y `rutaProtectora` (`/p/`) |
| `src/lib/supabase.js` | bagayí | sin cambio de clave (el login es por código) ni URLs firmadas; límites del bucket `fotos` |
| `src/lib/configuracion.js` | bagayí | sólo la parte genérica; base de `useModulo` |
| `src/lib/respaldo-publico.js` | bagayí | el proyecto nuevo |
| `src/lib/constants.js` | bagayí | sólo `DEPARTAMENTOS` |
| `src/components/ErrorBoundary.jsx` | bagayí | nada |
| `src/components/Layouts.jsx` | nuevo, con la estructura de bagayí | la navegación del §4: 5 tabs, header de escritorio, pie con crédito |
| `api/_lib/limite.js`, `entorno.js` (+ tests) | bagayí | nada |
| `src/pruebas/dobles.js` | bagayí | sin auth ni vendedor todavía |
| `vercel.json` | bagayí | la CSP con el ref nuevo; `geolocation=(self)` |
| `.claude/settings.json` | bagayí | el `deny` igual; `autoMode.environment` de este proyecto |

### Lo que el §9.1 del brief lista y todavía NO se copió, a propósito

- `Denunciar.jsx`, `BorrarCuenta.jsx`, `EtiquetaEnvio.jsx` (→ afiche) y las
  migraciones de patrón: dependen del esquema y entran en su fase (BRIEF §2, paso 4).
- `src/pruebas/fixtures.js`: lee las columnas de las migraciones para no mentir
  sobre el esquema (bagayí §6.73–75). Entra con la primera pantalla que lea
  tablas (fase 2): la fase 1 no tuvo pantallas con datos.
- El patrón de `siempre-un-admin-base.test.js` ya está, repartido: cada regla de
  la base tiene su `src/lib/*-base.test.js` (abajo).

### Fase 1 · lo nuevo

| Archivo | Qué hace |
|---|---|
| `src/pruebas/migraciones.js` | lee las migraciones del disco para los tests `*-base` |
| `supabase/pruebas/00-ayudas.sql` + `<tema>.sql` | el arnés en vivo: usuarios de prueba, `como()`, `como_anon()`, avisos, grilla; cada tema define `pg_temp.probar()` |
| `scripts/prueba-sql.mjs` | arma un tema, o `todos`, en `supabase/pruebas/.armado.sql` para `execute_sql` |
| `src/lib/modulos.js`, `src/pages/ModuloApagado.jsx` | el registro único de módulos y flags; sus rutas dicen «Todavía no está disponible» |
| `scripts/territorio/*.mjs` | leer los GeoPackage del INE con `node:sqlite`, simplificar y escribir GeoJSON |
| `public/datos/territorio/*.geojson` + `LEEME.txt` | los polígonos simplificados, públicos, con la atribución al INE |
| `supabase/datos/territorio/cargar.sql` | la carga con `pg_net`, por partes; repetible |
| `supabase/datos/territorio/crudo/` | el zip del INE y lo que trae (ignorado por git; se baja de nuevo con la URL del plan, tarea 8) |

### Tests

| Archivo | Qué defiende |
|---|---|
| `src/styles/tokens.test.js` | que `tokens.css` tenga los colores que se midieron y la marca aprobada |
| `src/components/Layouts.test.jsx` | cinco tabs con Publicar al centro, el pie con UTM, nada de bagayí en el header |
| `src/lib/slug.test.js`, `fechas.test.js`, `api/_lib/*.test.js` | los de bagayí, que vienen con sus módulos |
| `src/lib/auditoria-base.test.js` | toda tabla con RLS, todo `security definer` con `search_path`, ninguna función de trigger ejecutable por la API, ningún punto exacto |
| `src/lib/{perfiles,configuracion,territorio,punto,avisos,avistamientos,denuncias,fotos}-base.test.js` | que ninguna migración posterior saque un renglón de cada regla |
| `src/lib/modulos.test.js`, `src/pages/ModuloApagado.test.jsx` | el registro del código contra las filas que siembra la base; la página apagada |
| `scripts/territorio/*.test.js` | nombres del INE (2023), lectura de GPB/WKB, simplificación |
| `supabase/pruebas/*.sql` (en vivo, 78 casos el 2026-09-30) | cada regla corriendo como un usuario real: `node scripts/prueba-sql.mjs todos` |

### Base de datos

| Migración (versión = la registrada en la base) | Qué hace |
|---|---|
| `20260928182924_postgis.sql` | PostGIS en el esquema `extensions` |
| `20260929001625_perfiles.sql` | `perfiles` (público) y `perfiles_privados` (rol, suspensión, WhatsApp); alta desde `auth.users`; blindaje; siempre un admin; esquema `privado` con `es_admin` y compañía |
| `20260929001850_configuracion_y_modulos.sql` | las 16 claves editables (ninguna grilla bajo 50 m) y el interruptor de cada módulo y flag, apagados |
| `20260929002908_territorio.sql` | `departamentos` y `zonas` (barrio o localidad), sólo lectura desde la API |
| `20260929004111_pg_net.sql` | `pg_net`, para que la base haga pedidos HTTP |
| `20260929004502_punto.sql` | `redondear_punto` (UTM 21S), `ubicar` (barrio, localidad o zona rural; fuera de Uruguay se rechaza) y el trigger `ubicar_y_redondear` |
| `20260929004811_avisos.sql` | `avisos`, `fotos_aviso`, `contactos_aviso` (anon no lee), blindaje, `renovar_aviso` |
| `20260929005039_avistamientos.sql` | `avistamientos`: vigencia desde que el animal fue visto, sólo a perdidos activos, el autor edita nota y foto |
| `20260929005310_denuncias.sql` | `denuncias`, ocultar con los tres resguardos, `estado_publico` |
| `20261001014504_bucket_fotos.sql` | el bucket `fotos` (3 MB, WebP o JPEG, público) con carpetas por dueño |

---

## 6 · Errores encontrados y cómo se resolvieron

- **2026-09-28 · La terracota se confundía con AVISTADO.** Medida con ΔE2000 daba
  3,5: lado a lado cuesta distinguirlas. El brief preveía pasar a frambuesa; el
  dueño lo aprobó. `design-src/contrastes.mjs` lo mide y `tokens.test.js` impide
  que vuelva sin querer.
- **2026-09-28 · El pie del teléfono sin margen lateral.** `.pie__fila` tenía
  `padding: 22px 0` y pisaba el `padding: 0 16px` de `.contenedor` (mismo peso,
  declarada después). Ahora sólo pone padding vertical. Es el tipo de choque de
  especificidad que el build no ve: sólo se ve abriendo la pantalla a 375.
- **2026-09-28 · Disco y base con versiones distintas.** `apply_migration` registra
  la migración con su propia hora (la de PostGIS quedó `20260928182924`); el
  archivo se llamaba `…000100`. Es el desfase que bagayí arrastra (su §4). Acá se
  renombró el archivo y la regla quedó en `CLAUDE.md`.

### Fase 1 (2026-09-28 al 30)

- **Una función `language sql` se valida al crearla.** `pg_temp.punto_en` leía
  `public.zonas` y las ayudas se cargan con todos los temas, también antes de
  que exista la tabla: «relation public.zonas does not exist». Va en plpgsql,
  que resuelve la tabla recién al llamarla.
- **RAISE escribe un boolean como `t`, no `true`.** Usa la función de salida del
  tipo; `::text` da `true`. Los casos que pasaban un boolean crudo daban falso
  negativo: todos llevan `::text`.
- **Un regex que leía el `enum` como si fuera un módulo.** `modulos.test.js`
  tomaba `create type … as enum ('modulo', 'flag')` como la clave `modulo`. Se
  ancló a las filas del insert.
- **Los nombres del INE de 2023 no eran los del plan.** Los barrios vienen con
  comas y abreviaturas («PQUE. BATLLE, V. DOLORES») en `NOMBARRIOINE`; hay un
  polígono «N/A» (0,24 km², sin viviendas, una isla) que no se carga; y una
  fila «LIMITE CONTESTADO» con el código de Artigas (§7). Se miró el archivo
  real antes de convertir (columnas y nombres) en vez de adivinar.
- **`st_union` frenó con «TopologyException: side location conflict».** La
  simplificación (Douglas-Peucker) deja algún anillo cruzado (Montevideo, Paso
  de la Arena, Parque Rodó, Cerro Largo). `st_makevalid` iba DESPUÉS de unir;
  ahora va en cada pieza, antes. Quedaron 0 geometrías inválidas.
- **`length()` no es el tamaño del archivo.** Sobre `text` cuenta caracteres; los
  bytes son `octet_length()`. La diferencia eran justo las letras con tilde.
- **Un caso en vivo que pasaba aunque la regla no anduviera.** «Tres denuncias
  ocultan un avistamiento» armaba `estado || '/' || oculto_por`: sin ocultar,
  `oculto_por` es NULL y todo da NULL, que el `coalesce` volvía «no se ve». Ahora
  lo confirma el autor (`oculto/denuncias`) y se probó con un control de dos
  denuncias que tiene que fallar (`FIN:1/activo/-`). Regla: **ningún caso nuevo
  se da por bueno sin haberlo visto fallar.**
- **La sesión se cortó en medio de un `apply_migration`.** Antes de repetirlo se
  miró `list_migrations` y el catálogo: no se había aplicado. Nunca repetir una
  migración sin mirar primero.
- **El clasificador del modo automático frenó el chequeo del deploy de Vercel**
  después del push a `main`. El dueño confirmó a mano que el GeoJSON se servía.

---

## 7 · Decisiones del dueño que todavía no están en el brief

Se escriben en el spec del núcleo (paso 3). Anotadas el 2026-09-28:

- **Marca frambuesa** y **nombre «Volvé a casa»** aprobados.
- **Afiche sin tiritas para arrancar** («nadie se las lleva»): la foto y el
  teléfono ganan ese lugar. **Hay afiche para los tres tipos:** se busca,
  encontrado y en adopción.
- **«Un proyecto de bagayí» lleva el logo de bagayí**, chico.
- **La recompensa es un botón al marcar «Perdí»**, sí o no, sin monto.
- **Publicación automática en las redes de Volvé a casa: sólo los perdidos.** Va
  en el spec detrás de un flag apagado. Abierto: cómo se modera antes de salir.
- **Una zona social:** el animal presentado, con cómo le va con su familia, para
  incentivar la adopción responsable. **Decidido:** es un módulo aparte, con su
  propio spec después del núcleo, y **público**: quien entra ve las fotos y los
  nombres de los animales, y al tocar uno lee su historia. El núcleo deja el
  enganche: al marcar «¡Encontró familia!», invita a contar cómo le va.

Anotadas al cerrar la fase 1 (2026-09-30):

- **El Límite Contestado va con Artigas**, como lo clasifica el INE (código
  02, UYAR): el convertidor lee el código ISO antes que el nombre. Tomado por
  defecto y avisado al dueño; si prefiere dejarlo afuera, se filtra esa fila en
  `scripts/territorio/convertir.mjs` y se recarga (un punto ahí pasaría a
  rechazarse como «fuera de Uruguay»).
- **Advisors de Supabase al cerrar la fase** (ninguno de nivel ERROR):
  - *Seguridad, WARN:* `public.estado_publico` es `security definer` y la
    pueden llamar anon y authenticated. **A propósito:** es lo que hace que el
    link de un aviso oculto diga «en revisión»; devuelve una palabra, nada del
    contenido.
  - *Rendimiento, WARN:* `fotos_aviso` tiene dos policies de SELECT para
    authenticated (`fotos_lectura` y `fotos_del_autor`, que es `for all`). Con
    pocas fotos no pesa; si crece, `fotos_del_autor` se parte en
    insert/update/delete.
  - *Rendimiento, INFO:* seis claves foráneas sin índice (entre ellas
    `avistamientos.autor_id` y `denuncias.denunciante_id`, que usan los topes
    por día) y seis índices sin usar (la base está vacía). Se revisan con datos
    reales, antes de lanzar.

---

## 8 · Cómo levantarlo

```bash
npm install
npm run dev        # http://localhost:5174 — contra PRODUCCIÓN (§3)
npm test
npm run build
```

La configuración de arranque para el browser pane está en `.claude/launch.json`.

---

## 9 · Cómo trabajar en esto

Las convenciones están en [`CLAUDE.md`](CLAUDE.md) y en el BRIEF §9.2; las
lecciones caras de bagayí, en el BRIEF §9.3. Lo que más cuesta olvidar:

- La RLS es por fila: lo privado va en su propia tabla o no se guarda.
- Blindar el INSERT además del UPDATE, y probar los ataques con `set role` más
  `request.jwt.claims`.
- El build no verifica la UI: cada pantalla se abre a 375 y 1280.

---

## 10 · Por dónde seguir

### Al cierre del 2026-09-28

1. Paso 2 cerrado: repo, Vercel y la URL respondiendo 200.
2. Paso 3 cerrado: el spec del núcleo, aprobado, con las cinco preguntas
   respondidas (proveedor de mapas, denuncias, redes, métricas y zonas) y la
   zona social descrita en su §8.1. Las decisiones del §7 de este documento ya
   están todas en el spec.
3. Paso 4 cerrado: `docs/superpowers/plans/2026-09-28-nucleo-hoja-de-ruta.md`
   y `2026-09-28-fase-1-base.md`. Al escribirlo se ajustó el spec (commit del
   plan): el rol y la suspensión pasan a `perfiles_privados`, los polígonos
   salen todos del paquete del INE del Censo 2023, y `consentimientos`,
   `eventos` y `cuotas` entran con las fases que los usan.
4. Paso 5: ejecutar la fase 1 (tarea 0 en adelante). La tarea 8 baja un zip
   de 57 MB del INE: se le pide permiso al dueño en ese paso.

### Al cierre del 2026-09-30

1. **Fase 1 (Base) hecha** en la rama `fase-1-base`: 10 migraciones aplicadas
   y con el nombre de su versión, el territorio cargado, 78 casos en vivo y 122
   tests en verde, build y `npm audit` limpios, `/veterinarias` y `/tienda`
   abiertas a 375 y 1280. Lo que cambió respecto del plan está en §6 y en la
   nota del plan (tarea 12).
2. **Falta el merge:** PR si hay conector de GitHub o `gh` (§4); si no,
   `merge --no-ff` a `main` y push, que despliega. Después, abrir
   https://volveacasa-henna.vercel.app/veterinarias a 375 y 1280: «Todavía no
   está disponible».
3. **Después:** escribir el plan de la fase 2 (Publicar) con
   `superpowers:writing-plans`, mirando lo que de verdad quedó de la 1.
