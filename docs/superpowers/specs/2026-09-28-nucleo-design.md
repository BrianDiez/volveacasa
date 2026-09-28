# Volvé a casa — spec del núcleo

> **Estado: aprobado por el dueño el 2026-09-28** (BRIEF §2, paso 3). Al
> aprobarlo pidió que la zona social tuviera su sección: es el §8.1.
> Junta los §3 a §8 del brief, lo que decidió la maqueta aprobada el 2026-09-28
> y lo que decidió el dueño ese día. Donde este documento cambia el brief, lo
> dice. Las cinco preguntas que quedaban abiertas ya están respondidas (§10).
>
> Fuente visual: `design-src/Maqueta.html` (las pantallas se citan por su número:
> «M04» es la 04 de la maqueta). Colores: `src/styles/tokens.css`.

---

## 1 · Qué entra en el núcleo

El sitio de avisos de mascotas **perdidas, encontradas y en adopción** más los
**avistamientos**, con el **mapa** como herramienta de búsqueda y **compartir**
como motor, el **panel del admin** con moderación y módulos, y el **vencimiento**
automático. Veterinarias, servicios, productos, la zona de historias y la
publicación automática en redes existen como **módulos o flags apagados**, sin
pantallas públicas; cada uno tiene su spec después (§8).

---

## 2 · Decisiones cerradas

Las del BRIEF §3, con los cambios que ya decidió el dueño.

1. **Uruguay, y la ubicación es un punto en el mapa.** La base lo redondea según
   el tipo antes de guardarlo; el departamento y la zona salen del punto. **Nunca
   se guarda el punto exacto** (§5.3).
2. **Base propia:** proyecto Supabase `volveacasa`, separado de bagayí. Vloas se
   pausó el 2026-09-28.
3. **Primera entrega = el núcleo** con mapa y avistamientos, más el panel de
   módulos.
4. **Productos: checkout propio con Mercado Pago**, como módulo secundario que
   nunca aparece en el inicio, el mapa ni el feed.
5. **Stack de bagayí:** React 18, Vite 8, react-router 7, Supabase con PostGIS,
   Vercel y Vitest, con las mismas versiones mayores.
6. **Mobile-first**, con la estructura de bagayí y la paleta propia.
7. **Paleta aprobada con la maqueta.** *Cambio respecto del brief:* la marca es
   **frambuesa `#BE185D`**, no terracota: medida con ΔE2000, la terracota quedaba
   a 3,5 de AVISTADO. Las medidas están en `design-src/TOKENS.md`.
   - La marca va sólo en acciones; los colores de estado, sólo en cintas,
     insignias y marcadores, siempre con texto e ícono (lupa, ojo, huella,
     corazón, casita).
   - Tipografía de bagayí: Archivo (títulos, cifras, y angosta al 68–80 % en
     cintas, afiches e imágenes) e Instrument Sans (cuerpo).
8. **Login sin contraseña** con código de 6 dígitos por email (OTP de Supabase).
   El código por WhatsApp va detrás del flag `login_whatsapp`, apagado.
9. **Primero se publica, la cuenta viene después.** El borrador vive en el
   navegador. **Cargar un avistamiento también pide sesión** (decisión del
   2026-09-28), con el código al final.
10. **Avisos y avistamientos se publican al instante;** la moderación es por
    denuncia. Los negocios de los módulos esperan aprobación manual.
11. **Nunca se venden animales:** los avisos no tienen precio, y «pide plata» es
    motivo de denuncia.
12. **Todo vence.** Perdido y encontrado a los 30 días, adopción a los 60; se
    renuevan con un toque. **Un avistamiento dura 24 horas desde `visto_en`**, no
    se renueva, sale del mapa al vencer y sigue, atenuado, en el recorrido del
    perdido. Un vencido sale del feed y del mapa, pero su link sigue andando.
13. **Lo resuelto se celebra:** «¡Volvió a casa!» y «¡Encontró familia!». El
    resuelto queda visible sin contacto, sale del mapa y alimenta el contador del
    inicio, que aparece recién cuando el número pasa el umbral.
14. **El WhatsApp de quien publica no viaja en ninguna consulta pública:** lo
    entrega `/api/contacto` al tocar «Contactar», con límite por IP y el aviso
    fijo contra estafas.
15. **Las fotos se achican en el navegador** (~1600 px, WebP o JPEG), lo que
    además borra el EXIF con el GPS.
16. **La recompensa es un botón al marcar «Perdí»** (M04): sí o no, sin monto.
    Sólo existe en perdidos. *Nuevo, del dueño.*

---

## 3 · Pantallas

Navegación del BRIEF §4, validada por la maqueta: barra inferior de cinco
(Inicio · Mapa · **Publicar** · Mis avisos · Cuenta) y, en escritorio, header
con Mapa · Perdidos · Encontrados · Adopción, «Publicar aviso» y la cuenta. El
pie de las páginas públicas dice **«Un proyecto de bagayí» con el logo chico de
bagayí** (*nuevo, del dueño*) y lleva a bagayí con UTM. Nada de bagayí arriba.

| Pantalla | Maqueta | Notas que agregó la maqueta |
|---|---|---|
| Inicio / feed | M01, M18 | las cuatro entradas con su línea de diferencia; filtros en la URL; tira «Volvieron a casa»; filtros al costado en escritorio y en hoja en el teléfono |
| Mapa | M02, M19 | chips de tipo con contador, «Cerca mío», hoja con «N en esta zona»; lista y mapa sincronizados en escritorio; selector de departamento y zona (barrio o localidad) para centrar |
| Tarjeta | sección «La tarjeta» | la **cinta** de estado pegada sobre la foto; cinco estados |
| Detalle | M03, M20 | Contactar (WhatsApp) y Compartir fijos abajo en el teléfono; avistamientos en mini mapa con recorrido numerado, el vencido atenuado; parecidos incluye avistamientos sueltos |
| Publicar | M04–M08 | una pregunta por pantalla, 7 pasos; el círculo de lo que se va a ver; la nota de que se borra el GPS de las fotos; consentimiento explícito del WhatsApp; aviso contra estafas para quien publica |
| Listo para compartir | M09 | la vista previa tal como sale en WhatsApp; WhatsApp, historia, Facebook, copiar link, afiche; parecidos |
| Lo vi | M10–M13 | 3 pasos; «cuándo» sólo dentro de las 24 h; «Gracias» confirma que la familia ya lo recibió y ofrece publicar un encontrado |
| Mis avisos | M14, M15 | estado, avistamientos nuevos, renovar en un toque; al resolver, las preguntas opcionales |
| Cuenta | — | nombre, WhatsApp por defecto, salir y borrar la cuenta (anonimiza, como `BorrarCuenta` de bagayí) |
| Página de protectora | — | `/p/<nombre>-<id_corto>`: nombre, insignia *Protectora verificada*, sus avisos |
| Denunciar | — | ventana, sobre un aviso o un avistamiento, con los motivos del brief |
| Ayuda y legales | — | qué hacer si perdiste o encontraste; términos y privacidad (los redacta el dueño) |
| Admin | M16, M17 | tablero, moderación, usuarios, módulos con confirmación en palabras de la gente |

**Enganche con la zona de historias** (*nuevo, del dueño*): al marcar una
adopción como «¡Encontró familia!», la pantalla invita a quien adoptó o a la
protectora a contar cómo le va. Mientras el módulo `historias` esté apagado, la
invitación no se muestra (§8).

---

## 4 · Compartir: el motor

Como el BRIEF §6, con estos cambios de la maqueta:

- **URL** `/a/<nombre>-<zona>-<id_corto>`; lo que resuelve es el id corto. El id
  corto es el de bagayí: los primeros 8 caracteres hexadecimales del uuid, con
  índice único (`src/lib/slug.js` ya lo resuelve y tiene tests).
- **Vista previa:** `vercel.json` reescribe `/a/:slug` a una función que inyecta
  `<title>`, `og:*` y `twitter:card=summary_large_image` en el `index.html` del
  mismo deploy, con `s-maxage` de minutos. Esa reescritura va antes del
  catch-all de la SPA.
- **Imágenes** con `@vercel/og`: 1200×630 (M21) e historia 1080×1920 (M22), con la
  cinta según el estado (SE BUSCA / ENCONTRADO / EN ADOPCIÓN / ¡VOLVIÓ A CASA!),
  el dominio y «Un proyecto de bagayí» con su logo. La historia deja libres las
  franjas que tapa Instagram.
- **Afiches A4 para los tres tipos** (M23; *cambio del dueño*):
  - se busca, encontrado y en adopción, cada uno con su título en su color;
  - **sin tiritas para arrancar**: la foto, el nombre, el teléfono y el QR ganan
    ese lugar;
  - el de encontrado se guarda una seña para comprobar al dueño;
  - sin fondos de color (la mayoría de las impresoras no los imprime); portal al
    `<body>` y `display: none` al resto (bagayí §6.88).
- **Un solo componente `Compartir`** (tarjeta, detalle, Listo): `navigator.share`
  con la imagen como archivo cuando se puede; si no, WhatsApp, Facebook, copiar
  y descargar. Cada uso queda en `eventos`.
- **CSP:** todo origen nuevo va explícito en `vercel.json` y se prueba desplegado.

---

## 5 · Datos y reglas en la base

Las reglas viven en la base, con triggers `BEFORE INSERT OR UPDATE`; la UI las
repite para dar buenos mensajes. PostGIS está en el esquema `extensions`.

### 5.1 · Tablas

| Tabla | Columnas | Lectura |
|---|---|---|
| `perfiles` | `id` → auth.users, `id_corto`, `nombre`, `tipo` (`persona` \| `protectora`), `verificada`, `eliminado_en`, fechas | pública |
| `perfiles_privados` | `id` → perfiles, `whatsapp_por_defecto` (E.164), `rol` (`usuario` \| `admin`), `suspendido`. Aparte porque la RLS es por fila: en `perfiles` cualquier `select=*` traería el WhatsApp y diría quién es admin (bagayí 005). *Ajuste del plan de la fase 1.* | su dueño y el admin |
| `avisos` | `id`, `id_corto`, `autor_id`, `tipo` (`perdido` \| `encontrado` \| `adopcion`), `estado` (`activo` \| `resuelto` \| `vencido` \| `oculto`), `especie` (`perro` \| `gato` \| `otro`), `nombre`, `sexo`, `tamano`, `edad_aprox`, `color`, `senas`, `historia`, `fecha_hecho`, `punto` (geography Point, ya redondeado), `departamento`, `zona`, `recompensa` (sólo perdido), `vence_en`, `resuelto_en` (el cartel sale del tipo: «¡Volvió a casa!» o «¡Encontró familia!»), `ayudo_sitio`, `ayudo_avistamiento`, `oculto_por` (`admin` \| `denuncias`, sólo si está oculto), fechas | activos, resueltos y vencidos: pública (§5.1.1); ocultos: autor y admin |
| `avistamientos` | `id`, `id_corto`, `aviso_id` (opcional), `autor_id`, `especie`, `nota` (≤ 140), `foto`, `punto` (redondeado), `visto_en`, `departamento`, `zona`, `estado` (`activo` \| `vencido` \| `oculto`; el vencido lo marca el cron para ordenar, lo vigente lo decide `vence_en`), `oculto_por`, `vence_en`, fechas. **Sin datos de contacto de quien lo carga** | vigentes y vencidos: pública (§5.1.1); ocultos: autor y admin |
| `fotos_aviso` | `aviso_id`, `path`, `orden` (0–5) | como su aviso |
| `contactos_aviso` | `aviso_id`, `whatsapp` (E.164), `consentido_en` | **ninguna pública**: la lee `/api/contacto` con la service role |
| `departamentos` | `nombre` (como `DEPARTAMENTOS`), polígono, centroide | pública, sólo lectura |
| `zonas` | `nombre`, `tipo` (`barrio` \| `localidad`), `departamento`, polígono, centroide, `fuente` | pública, sólo lectura |
| `denuncias` | objetivo (aviso **o** avistamiento, `CHECK` de exactamente uno), `autor_id`, `motivo`, `detalle`, estado y resolución | autor y admin |
| `modulos` | `clave`, `activo`, `cambiado_por`, `cambiado_en` + `modulo_activo(clave)` | pública |
| `configuracion` | `clave`, `valor` (jsonb), `actualizado_en` | pública; escribe sólo el admin |
| `consentimientos` | patrón de bagayí | autor |
| `eventos` | `tipo` (`contacto` \| `compartir` \| `mapa` \| `llegada` \| `bagayi`), `canal`, `aviso_id`, fecha. Sin datos personales ni IP; sólo se inserta, y sólo por la función `registrar_evento` (§7) | admin |
| `cuotas` | el contador de `consumir_cuota` de bagayí, para el límite por IP | ninguna |

Bucket público **`fotos`**, una carpeta por aviso o avistamiento, con tope de
tamaño (3 MB) y de tipo (WebP y JPEG), con el patrón de bagayí 20260827001200.

#### 5.1.1 · Lo que la RLS puede y no puede hacer

La RLS decide **qué filas** ve cada uno, no **desde qué pantalla** se piden
(bagayí §10). Por eso:

- **Los vencidos son legibles**, no «sólo por su link»: no son secretos (el link
  circula por WhatsApp) y la RLS no sabe de links. Lo que los saca del feed, del
  mapa y de los parecidos es la consulta (`vence_en > now()`, `estado = activo`).
  Lo mismo los avistamientos vencidos, que el recorrido del perdido sí muestra.
- **Los ocultos no son legibles** para el público. Para que su link no diga «no
  existe», la página del aviso consulta la RPC `estado_publico(id_corto)`, que
  devuelve sólo un estado, sin nada del contenido: `en_revision` si lo ocultaron
  las denuncias, `no_disponible` si lo ocultó el admin, o `no_existe`.
- **Lo que de verdad es privado** (el WhatsApp, el punto exacto) no está en
  ninguna fila legible: va en `contactos_aviso` y `perfiles_privados`, o no se
  guarda.

### 5.2 · Configuración inicial

| Clave | Valor | Para |
|---|---|---|
| `vence_perdido_dias`, `vence_encontrado_dias` | 30 | §2.12 |
| `vence_adopcion_dias` | 60 | §2.12 |
| `vigencia_avistamiento_horas` | 24 | §2.12 |
| `grilla_perdido_m`, `grilla_encontrado_m` | 400 | §5.3 |
| `grilla_adopcion_m` | 1000 | §5.3 |
| `grilla_avistamiento_m` | 100 | §5.3 |
| `tope_avisos_por_dia`, `tope_avistamientos_por_dia` | 5, 20 | anti-spam |
| `parecidos_km`, `parecidos_dias` | 3, 15 | Parecidos |
| `umbral_contador` | 50 | el contador del inicio |
| `redes_vence_horas` | 12 | §9: lo que no se aprueba en ese plazo no sale (se usa cuando se prenda `redes_automaticas`) |
| `denuncias_para_ocultar` | 3 | §5.4, moderación |
| `antiguedad_denunciante_horas` | 24 | §5.4: debajo de esto, la denuncia no cuenta para ocultar |

### 5.3 · El punto: la regla que manda

- El cliente manda el punto que marcó la persona; un trigger `BEFORE INSERT OR
  UPDATE` lo redondea **antes de guardarlo**, así que el exacto no llega a ninguna
  columna (la RLS es por fila: si existiera, se filtraría; bagayí §10).
- Redondeo en metros: se proyecta a UTM 21S (EPSG:32721), `ST_SnapToGrid` con la
  grilla del tipo, y vuelve a 4326. El este del país cae en la zona 22; la
  distorsión de usar la 21 ahí es chica frente a una grilla de 100 m o más.
- `departamento` y `zona` se calculan en el mismo trigger **con el punto que
  mandó la persona, antes de redondearlo** (redondeado, un punto de la rambla
  puede caer al agua). El punto exacto se usa ahí y se descarta.
- **La zona, en tres niveles** (decisión del dueño, 2026-09-28):
  1. dentro de Montevideo, el **barrio** (`zonas` tipo `barrio`);
  2. en el resto del país, dentro de una localidad del INE, la **localidad**
     (`zonas` tipo `localidad`);
  3. fuera de toda localidad, **«Zona rural de <departamento>»**.
  El texto queda guardado en `zona`, así la tarjeta, el afiche y el slug de la
  URL no hacen otra consulta.
- **Un punto fuera del país:** si no cae en ningún departamento (en el agua, o
  del otro lado del río), se toma el departamento más cercano a menos de 1 km;
  más lejos, la base lo rechaza con «El punto tiene que estar en Uruguay».
- **Criterio de terminado:** una consulta SQL confirma que ningún punto guardado
  tiene más precisión que la de su grilla.

### 5.4 · Reglas

- **Estados de los avisos:** `activo` → `resuelto` o `vencido`; `vencido` →
  `activo` al renovar; `resuelto` es final salvo para el admin; `oculto` lo pone
  el admin o el trigger de denuncias, y lo saca sólo el admin. El autor nunca.
- **Edición:** sólo el autor o un admin. El autor no toca `estado = oculto`,
  `vence_en`, `autor_id`, `id_corto` ni las fechas. Nadie se cambia a sí mismo
  `rol`, `verificada` ni `suspendido`, y siempre queda un admin (bagayí, `siempre_un_admin`).
- **Avistamientos:** `visto_en` no puede estar en el futuro ni ser anterior a la
  vigencia; `vence_en` lo pone la base (`visto_en` + vigencia); `aviso_id` sólo
  apunta a un perdido activo. Al ligarse, un webhook de la base llama a `/api`
  con un secreto y sale el mail a la familia en minutos.
- **Topes** por usuario y por día, y 6 fotos por aviso. Un suspendido no publica
  ni carga avistamientos.
- **Lo vigente lo decide la consulta** (`vence_en > now()`), no un estado que
  actualiza un cron. `pg_cron` corre cada hora: marca los vencidos para ordenar y
  dispara los recordatorios de avisos por vencer, por un endpoint con secreto
  (bagayí 087 + `api/mp/tareas.js`).
- **Mails que no son de login** (avistamiento, recordatorio) salen por la API del
  proveedor de mail, con otro remitente que el del login.
- **Ocultar por denuncias** (decisión del dueño, 2026-09-28):
  - Un aviso o un avistamiento se oculta solo cuando junta
    `denuncias_para_ocultar` (3) denuncias abiertas de **usuarios distintos**.
  - **No cuentan** las denuncias de cuentas con menos de
    `antiguedad_denunciante_horas` (24): crear cuentas para bajar un aviso no
    sirve. La denuncia igual se guarda y llega a la cola.
  - **Los avisos de protectoras verificadas nunca se ocultan solos:** van a la
    cola del admin, como cualquier denuncia.
  - Lo decide un trigger sobre `denuncias` en la base, no la UI. Pone
    `estado = oculto` y `oculto_por = denuncias`, para distinguirlo de lo que
    oculta el admin a mano (`oculto_por = admin`).
  - Al ocultarse, sale un mail al admin en el momento (el mismo camino que el
    mail de avistamiento: webhook de la base a `/api` con secreto).
  - El autor ve su aviso en Mis avisos como **«En revisión»**, con una línea que
    explica que recibió denuncias y que alguien lo va a mirar; su link público
    dice que el aviso está en revisión, no «no existe» (`estado_publico`,
    §5.1.1).
  - Si el admin descarta las denuncias, el aviso vuelve a `activo` y esas
    denuncias no vuelven a contar.
  - Ataques a probar: una persona con tres denuncias; tres cuentas recién
    creadas; denunciar un aviso de protectora verificada; el autor intentando
    sacarse el `oculto` a sí mismo.
- **INSERT blindado además del UPDATE,** y los ataques de cada fase probados por
  MCP con `set role` y `request.jwt.claims` (BRIEF §9.3).

---

## 6 · Mapa y avistamientos

Como el BRIEF §7, con esto cerrado:

- **Qué muestra:** avisos activos de perdidos, encontrados y adopción (como zona
  del tamaño de su grilla) y avistamientos vigentes (como punto). Los resueltos
  no van: van a «Volvieron a casa». Mismos filtros que el feed, en la URL.
- **Librería: MapLibre GL.** Es vectorial y se tiñe con la paleta, que es lo que
  mostró la maqueta. Pesa más que Leaflet, pero va en un chunk lazy: quien no
  abre el mapa no lo descarga. Pide `worker-src blob:` en la CSP.
- **Proveedor de tiles: OpenFreeMap** (decisión del dueño, 2026-09-28; la
  comparación está en el §10.1). Tiles vectoriales, sin clave ni registro, con uso
  comercial permitido y sin tope de vistas.
  - Estilo: uno de los de OpenFreeMap, teñido con la paleta (tierra
    `--mapa-tierra`, agua `--mapa-agua`) para que los marcadores tengan el
    contraste medido.
  - CSP: el dominio `tiles.openfreemap.org` en `connect-src` e `img-src`, más
    `worker-src blob:` para MapLibre. Se prueba en un deploy de preview.
  - Atribución obligatoria: «OpenFreeMap © OpenMapTiles Data from
    OpenStreetMap». MapLibre la agrega sola; se suma la de los polígonos.
  - Plan B, si el servicio público falla o se vuelve lento: Protomaps (un
    PMTiles de Uruguay servido por nosotros), con el mismo MapLibre. El cambio es
    la URL del estilo, que vive en un solo lugar.
  - OpenFreeMap vive de donaciones: al lanzar, conviene que la marca aporte.
- **Polígonos:** *ajuste del plan de la fase 1*, una sola fuente para los tres:
  el paquete **Unidades Geoestadísticas del Censo 2023 del INE** (un zip de 57 MB
  con `depto_23_pg.gpkg`, `barrios_mvd_23_pg.gpkg` y `loc_23_pg.gpkg`). Son de
  la misma fecha y encajan entre sí, y el INE los publica **de uso libre citando
  al INE** como fuente (se confirma en los PDF de metadatos del mismo zip antes
  de cargarlos).
  - Los barrios de Montevideo son los 62 del INE; los nombres llegan en
    mayúsculas y sin tildes, y se muestran con una tabla propia («Parque Batlle,
    Villa Dolores»).
  - Las localidades del resto del país se muestran en tipo título; las tildes
    que el INE no trae quedan para una mejora posterior.
  - Respaldo, si el zip cambiara: los límites departamentales del IGM por el WFS
    de la IDE y los barrios por el WFS de la Intendencia (licencias verificadas
    el 2026-09-28).
  - La atribución de OpenFreeMap y del INE va en el pie del mapa.
- **Consulta:** RPC `puntos_en_mapa(recuadro, tipos, especie, desde)`, sólo campos
  públicos, índice GIST y tope de puntos. La lista es el equivalente accesible
  del mapa: todo lo del mapa se alcanza por teclado y lector de pantalla.
- **Sin búsqueda por dirección** en la primera entrega: se centra con «Cerca mío»
  o con las listas de departamento y zona (centroides): al elegir un
  departamento se listan sus barrios o sus localidades.
- **Permisos:** `Permissions-Policy: geolocation=(self)` ya está desplegado; el
  dominio de tiles se suma a la CSP en la fase del mapa.

---

## 7 · Métricas

Las del BRIEF §12, **medidas sólo con datos propios**: sin servicios de
analítica externos, sin cookies y sin datos personales, así que no hace falta
cartel de consentimiento (decisión del dueño, 2026-09-28).

| Métrica | De dónde sale |
|---|---|
| **Estrella:** avisos resueltos por mes | `avisos.resuelto_en` y `resolucion` |
| Avistamientos por semana; % de perdidos con al menos uno; cuántos de esos volvieron a casa | `avistamientos` y `avisos` (más `ayudo_avistamiento`) |
| % de avisos compartidos al menos una vez; compartidos por canal | `eventos` tipo `compartir`, con `canal` |
| Clics en Contactar | `eventos` tipo `contacto` (lo registra `/api/contacto`) |
| Sesiones que abren el mapa | `eventos` tipo `mapa`: **uno por sesión** (se marca en `sessionStorage`), no uno por cada movimiento |
| Visitas que llegan por links compartidos | `eventos` tipo `llegada`: el componente `Compartir` agrega al link una marca corta de canal (`?c=wa`, `?c=ig`, `?c=fb`, `?c=link`, `?c=qr` en los afiches) y la visita que entra con ella se registra una vez por sesión |
| Clics a bagayí desde el pie | `eventos` tipo `bagayi` (además del UTM, que mide bagayí de su lado) |

- **Nada de eventos por INSERT directo:** la tabla no tiene policy de insert. Se
  escribe sólo con la RPC `registrar_evento(tipo, canal, aviso_id)`, que valida
  tipo y canal contra una lista, verifica que el aviso exista y aplica un límite
  por IP con `consumir_cuota`. La IP se usa para el límite y no se guarda en el
  evento.
- **Tamaño:** cada fila son unos cien bytes; el plan gratis tiene 500 MB de base.
  Si algún día pesa, se agrega por día y se borra el detalle viejo.
- Si la tabla se queda corta (páginas vistas, de dónde viene la gente), se suma
  después una analítica sin cookies (Plausible, Umami o la de Vercel).

---

## 8 · Módulos y flags

Un solo registro en código, `src/lib/modulos.js`: de ahí salen las rutas (lazy),
la navegación y el pie. `useModulo(clave)` lee la tabla una vez por carga. La
base respalda el apagado: las tablas de cada módulo exigen `modulo_activo()` a
quien no es admin. Apagar no borra nada.

| Clave | Qué es | En el núcleo |
|---|---|---|
| `veterinarias` | directorio en el mapa, con aprobación manual | apagado, sin pantallas |
| `marketplace_servicios` | paseadores y peluquería por zona | apagado, sin pantallas |
| `marketplace_productos` | tienda con Mercado Pago | apagado, sin pantallas |
| `historias` | *nuevo, del dueño.* Zona **pública**: se ven las fotos y los nombres de los animales adoptados, y al tocar uno, su historia y cómo le va con su familia. Incentiva la adopción responsable (§8.1) | apagado; el núcleo deja el enganche del §3 y lo del §8.1 |

### 8.1 · Historias (módulo `historias`)

*Nuevo, del dueño (2026-09-28): una zona social que presente a cada animal y
cuente cómo le va con su familia, para incentivar la adopción responsable.* Es
un módulo aparte con su propio spec después del núcleo; esta sección fija lo que
el dueño ya decidió y lo que el núcleo tiene que dejar preparado.

**Lo que ya está decidido:**

- **Es pública.** Sin cuenta se ve todo: una grilla con la **foto y el nombre**
  de cada animal, y al tocar uno, **su historia**. Rutas `/historias` y
  `/historias/<nombre>-<id_corto>`, con vista previa para compartir como un aviso.
- **La página de un animal** cuenta de dónde viene (el aviso de adopción, con su
  foto de entonces), cómo llegó a su familia, y cómo le va: texto y fotos nuevas,
  que se pueden sumar con el tiempo («a los 3 meses», «al año»). Muestra hace
  cuánto está en casa.
- **Lo que no muestra:** ni la ubicación de la familia (a lo sumo, la zona) ni
  datos de las personas. Es la historia del animal. Las fotos se achican y
  pierden el EXIF como las demás.

**Lo que el núcleo deja preparado:**

- El aviso de adopción resuelto no se borra nunca: conserva fotos, nombre y
  datos para que la historia lo enlace.
- La pantalla de resolver (M15), con el módulo prendido, invita a contar cómo le
  va; apagado, no dice nada.
- La entrada `historias` en `src/lib/modulos.js` y en la tabla `modulos`,
  apagada.

**Lo que decide su spec** (con recomendación, para no perderlas):

1. **Quién la escribe.** Quien publicó la adopción (muchas veces una protectora)
   no es quien adoptó. *Recomendación:* la escribe la protectora o quien publicó,
   y puede mandarle a quien adoptó un link de invitación para que sume fotos
   desde su cuenta.
2. **Moderación.** Son fotos y textos públicos con la marca. *Recomendación:*
   aprobación manual del admin antes de publicarse, como los negocios de los otros
   módulos; cada foto nueva también.
3. **¿Aparece en el inicio?** Los módulos no van en el inicio ni en el feed, pero
   esa regla se pensó para lo comercial. *Recomendación:* sí, una tira de
   «Encontraron familia» como la de «Volvieron a casa».
4. **¿Entran también los reencuentros** (perdidos que volvieron), o sólo las
   adopciones? *Recomendación:* empezar por las adopciones, que es el objetivo, y
   sumar reencuentros si funciona.

**Datos (boceto para su spec):** `historias` (aviso de adopción, autor, texto,
estado `en_revision` \| `publicada` \| `oculta`), `actualizaciones_historia`
(texto y fecha) y sus fotos en el bucket `fotos`. Las tablas exigen
`modulo_activo('historias')` a quien no es admin, como todo módulo.

**Flags que no son módulos** (misma pantalla del admin, otra sección):

| Clave | Qué hace |
|---|---|
| `login_whatsapp` | código por WhatsApp; apagado hasta que haya un remitente aprobado por Meta |
| `redes_automaticas` | *nuevo, del dueño.* Publica **sólo los perdidos** en las cuentas de Volvé a casa (§9) |

---

## 9 · Publicación automática en redes (flag `redes_automaticas`)

*Nuevo, del dueño: «podemos subir los animales perdidos, no todos».* Queda
diseñado y apagado; su fase va después de Compartir.

- **Qué se publica:** sólo avisos de **perdidos**, con la historia de 1080×1920 y,
  si se usa el feed, la imagen de 1200×630. **Nunca el afiche**, que lleva el
  teléfono.
- **Dónde:** la cuenta profesional de Instagram de Volvé a casa y su página de
  Facebook, por la API de Meta. Los grupos de Facebook no se pueden (Meta cerró
  la API de grupos) y los estados o canales de WhatsApp tampoco tienen API.
- **Requisitos del lado del dueño:** cuenta de Instagram profesional ligada a una
  página de Facebook, una app de Meta con el permiso de publicar aprobado y el
  negocio verificado. Es un trámite de semanas, como el del remitente de WhatsApp.
- **Técnica:** Instagram pide JPEG en una URL pública; `@vercel/og` genera PNG, así
  que hace falta convertir. Se registra qué se publicó y dónde, para poder
  borrarlo al resolverse u ocultarse el aviso donde la API lo permita.
- **Consentimiento:** una casilla en Publicar, registrada en `consentimientos`.
  El texto dice que el aviso **puede** salir en las redes de Volvé a casa, no que
  va a salir: depende de la aprobación.
- **Moderación antes de salir** (decisión del dueño, 2026-09-28):
  - Los perdidos de **personas** entran en una **cola** que el admin aprueba o
    descarta con un toque, desde el teléfono: le llega un aviso con la historia
    armada y los dos botones.
  - Los perdidos de **protectoras verificadas** salen directo, sin cola.
  - Si nadie aprueba en `redes_vence_horas` (12, en `configuracion`), el pedido
    vence y no sale: no se publica algo viejo que quizás ya se resolvió.
  - Tampoco sale si, al momento de publicar, el aviso ya no está `activo`
    (resuelto, vencido u oculto por denuncias).
  - Tabla `publicaciones_redes`: aviso, red, estado (`en_cola` \| `aprobada` \|
    `publicada` \| `descartada` \| `vencida` \| `fallida`), quién decidió y
    cuándo, el id de la publicación en la red. Sólo la lee y la escribe el admin
    (y el servidor).
- **Por verificar en el spec del módulo:** si la API de Instagram deja borrar
  una publicación hecha por API. Si no deja, un aviso resuelto se marca en la
  historia siguiente como «¡Volvió a casa!» en lugar de borrarse.

---

## 10 · Preguntas al dueño (se hacen de a una)

1. **Proveedor de tiles** (BRIEF §10.8). **Decidido el 2026-09-28: OpenFreeMap**
   (§6). Criterios del brief: que el plan gratis permita este uso (lo patrocina
   una marca), su tope y qué pasa al pasarlo.

   | Opción | Uso comercial gratis | Tope | Al pasarlo |
   |---|---|---|---|
   | **OpenFreeMap** | sí | sin límite de vistas ni pedidos, sin clave | no corta; vive de donaciones |
   | MapTiler (FREE) | **no** | 5.000 sesiones/mes | se pausa hasta el mes siguiente |
   | Stadia Maps (free) | **no** | 200.000 créditos/mes | sin uso adicional |
   | Mapbox | según licencia | 50.000 cargas/mes | cobra (USD 5 cada 1.000) |
   | Protomaps (PMTiles propio) | sí | lo que aguante el hosting | lo pagamos nosotros |

   Precios y condiciones leídos en el sitio de cada proveedor el 2026-09-28.
2. **Ocultar por denuncias** (BRIEF §10.3). **Decidido el 2026-09-28:** umbral
   de 3 denuncias de usuarios distintos, con tres resguardos: no cuentan las
   cuentas de menos de 24 horas, las protectoras verificadas nunca se ocultan
   solas, y al ocultarse sale un mail al admin y el autor ve «En revisión»
   (§5.4). La alternativa descartada: que las denuncias sólo llegaran a la cola.
3. **Moderación de la publicación en redes.** **Decidido el 2026-09-28:** una
   cola que el admin aprueba con un toque, con las protectoras verificadas
   saliendo directo; lo que no se aprueba en 12 horas no sale (§9). Descartadas:
   que saliera todo directo, o sólo lo de protectoras.
4. **Analítica** (BRIEF §10.7). **Decidido el 2026-09-28:** sólo la tabla
   `eventos` propia, sin servicios externos (§7). Una analítica sin cookies queda
   para después, si hace falta.
5. **Zona fuera de Montevideo.** **Decidido el 2026-09-28:** tres niveles, barrio
   en Montevideo, localidad del INE en el resto del país y «Zona rural de
   <departamento>» fuera de toda localidad (§5.3). Descartada: mostrar sólo el
   departamento fuera de Montevideo.

---

## 11 · Dependencias del dueño

- **Dominio** (`volveacasa.uy` o `.com.uy`, en NIC.uy o ANTEL): lo necesitan los
  mails de avistamiento y recordatorio de la fase 5, no sólo el lanzamiento.
- **Proveedor de mail** (Resend o Brevo) con SPF, DKIM y DMARC sobre ese dominio.
- **Términos y privacidad** con su abogada, contando cómo se redondean las
  ubicaciones.
- **Protectoras aliadas** para 20 a 30 avisos reales antes de anunciar.
- **Abrir PR** desde la sesión: autorizar el conector de GitHub o instalar `gh`
  (HANDOFF §4).
- **El plan de Vercel:** el plan Hobby es para uso personal no comercial. El
  núcleo no cobra nada, pero **antes de prender `marketplace_productos`** (que
  cobra con Mercado Pago) hay que revisar el plan del team, que es el mismo de
  bagayí.

---

## 12 · Fases (para el plan)

Las del BRIEF §2, paso 4; cada una deja algo desplegable, en su rama.

1. **Base:** esquema con PostGIS, redondeo del punto, polígonos, RLS, reglas,
   bucket, `modulos` y `configuracion`, admin, y los tests `*-base`. Antes de la
   primera función de `/api`: pasar las funciones de Vercel de `iad1` (donde
   quedaron por defecto) a `gru1`, São Paulo, al lado de la base. *Ajuste del
   plan:* `consentimientos` entra con la fase 2, que es la que lo usa, y
   `eventos` y `cuotas` con la 3.
2. **Publicar:** selector de ubicación, código por email, borrador en el
   navegador, recompensa, Mis avisos.
3. **Ver y contactar:** feed, detalle, `/api/contacto`, denunciar, parecidos.
4. **Compartir:** vista previa por aviso, imagen, historia, los tres afiches.
5. **Mapa y avistamientos:** mapa, «Lo vi», recorrido, mail a la familia.
6. **Admin:** tablero, moderación, usuarios, módulos y flags.
7. **Vencimiento:** automático, con recordatorios por cron.

Después del núcleo, cada uno con su spec: `redes_automaticas`, `historias`
(§8.1), `veterinarias`, `marketplace_servicios`, `marketplace_productos`.
