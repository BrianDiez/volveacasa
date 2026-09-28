# Volvé a casa — spec del núcleo

> **Estado: borrador, esperando la aprobación del dueño** (BRIEF §2, paso 3).
> Junta los §3 a §8 del brief, lo que decidió la maqueta aprobada el 2026-09-28
> y lo que decidió el dueño ese día. Donde este documento cambia el brief, lo
> dice. Lo que sigue abierto está en el §10, con una recomendación cada uno, y
> se le pregunta al dueño de a una pregunta.
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
| Mapa | M02, M19 | chips de tipo con contador, «Cerca mío», hoja con «N en esta zona»; lista y mapa sincronizados en escritorio; selector de departamento y barrio para centrar |
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
| `perfiles` | `id` → auth.users, `nombre`, `tipo` (`persona` \| `protectora`), `verificada`, `rol` (`usuario` \| `admin`), `suspendido`, fechas | pública |
| `perfiles_privados` | `id` → perfiles, `whatsapp_por_defecto` (E.164). Aparte porque la RLS es por fila: en `perfiles` lo traería cualquier `select=*` | sólo su dueño |
| `avisos` | `id`, `id_corto`, `autor_id`, `tipo` (`perdido` \| `encontrado` \| `adopcion`), `estado` (`activo` \| `resuelto` \| `vencido` \| `oculto`), `especie` (`perro` \| `gato` \| `otro`), `nombre`, `sexo`, `tamano`, `edad_aprox`, `color`, `senas`, `historia`, `fecha_hecho`, `punto` (geography Point, ya redondeado), `departamento`, `zona`, `recompensa` (sólo perdido), `vence_en`, `resuelto_en`, `resolucion`, `ayudo_sitio`, `ayudo_avistamiento`, fechas | activos y resueltos: pública; vencidos: sólo por su link; ocultos: autor y admin |
| `avistamientos` | `id`, `id_corto`, `aviso_id` (opcional), `autor_id`, `especie`, `nota` (≤ 140), `foto`, `punto` (redondeado), `visto_en`, `departamento`, `zona`, `estado` (`activo` \| `vencido` \| `oculto`; el vencido lo marca el cron para ordenar, lo vigente lo decide `vence_en`), `vence_en`, fechas. **Sin datos de contacto de quien lo carga** | vigentes: pública; vencidos: sólo dentro del recorrido de su aviso |
| `fotos_aviso` | `aviso_id`, `path`, `orden` (0–5) | como su aviso |
| `contactos_aviso` | `aviso_id`, `whatsapp` (E.164), `consentido_en` | **ninguna pública**: la lee `/api/contacto` con la service role |
| `departamentos`, `zonas` | nombre, polígono, centroide | pública, sólo lectura |
| `denuncias` | objetivo (aviso **o** avistamiento, `CHECK` de exactamente uno), `autor_id`, `motivo`, `detalle`, estado y resolución | autor y admin |
| `modulos` | `clave`, `activo`, `cambiado_por`, `cambiado_en` + `modulo_activo(clave)` | pública |
| `configuracion` | `clave`, `valor` (jsonb), `actualizado_en` | pública; escribe sólo el admin |
| `consentimientos` | patrón de bagayí | autor |
| `eventos` | `tipo` (`contacto` \| `compartir` \| `mapa`), `canal`, `aviso_id`, fecha. Sin datos personales; sólo se inserta | admin |
| `cuotas` | el contador de `consumir_cuota` de bagayí, para el límite por IP | ninguna |

Bucket público **`fotos`**, una carpeta por aviso o avistamiento, con tope de
tamaño (3 MB) y de tipo (WebP y JPEG), con el patrón de bagayí 20260827001200.

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
| `denuncias_para_ocultar` | ver §10 | moderación |

### 5.3 · El punto: la regla que manda

- El cliente manda el punto que marcó la persona; un trigger `BEFORE INSERT OR
  UPDATE` lo redondea **antes de guardarlo**, así que el exacto no llega a ninguna
  columna (la RLS es por fila: si existiera, se filtraría; bagayí §10).
- Redondeo en metros: se proyecta a UTM 21S (EPSG:32721), `ST_SnapToGrid` con la
  grilla del tipo, y vuelve a 4326. El este del país cae en la zona 22; la
  distorsión de usar la 21 ahí es chica frente a una grilla de 100 m o más.
- `departamento` y `zona` se completan con `ST_Contains` contra los polígonos.
- **Criterio de terminado:** una consulta SQL confirma que ningún punto guardado
  tiene más precisión que la de su grilla.

### 5.4 · Reglas

- **Estados de los avisos:** `activo` → `resuelto` o `vencido`; `vencido` →
  `activo` al renovar; `resuelto` es final salvo para el admin; `oculto` lo pone y
  lo saca sólo el admin.
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
- **Proveedor de tiles:** ver §10, pregunta 1.
- **Polígonos:**
  - Departamentos: *Límites Departamentales* de la IDE Uruguay (producto del
    Servicio Geográfico Militar, escala 1:50.000), GeoJSON en EPSG:4326, con la
    **Licencia de Datos Abiertos Uruguay**.
  - Barrios de Montevideo: *Barrios de Montevideo según INE*, que distribuye el
    Servicio de Geomática de la Intendencia, **de uso libre según la resolución
    640/10**. Vienen en EPSG:32721 y se reproyectan a 4326 al cargarlos.
  - Fuera de Montevideo: ver §10, pregunta 5.
  - La atribución de las tres fuentes y la del mapa van en el pie del mapa.
- **Consulta:** RPC `puntos_en_mapa(recuadro, tipos, especie, desde)`, sólo campos
  públicos, índice GIST y tope de puntos. La lista es el equivalente accesible
  del mapa: todo lo del mapa se alcanza por teclado y lector de pantalla.
- **Sin búsqueda por dirección** en la primera entrega: se centra con «Cerca mío»
  o con las listas de departamento y barrio (centroides).
- **Permisos:** `Permissions-Policy: geolocation=(self)` ya está desplegado; el
  dominio de tiles se suma a la CSP en la fase del mapa.

---

## 7 · Métricas

Las del BRIEF §12. Ver §10, pregunta 4, sobre de dónde salen.

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
| `historias` | *nuevo, del dueño.* Zona **pública**: se ven las fotos y los nombres de los animales adoptados, y al tocar uno, su historia y cómo le va con su familia. Incentiva la adopción responsable | apagado; el núcleo sólo deja el enganche del §3 |

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
- **Moderación antes de salir:** ver §10, pregunta 3.

---

## 10 · Preguntas abiertas (se hacen de a una)

1. **Proveedor de tiles** (BRIEF §10.8). Criterios del brief: que el plan gratis
   permita este uso (lo patrocina una marca), su tope y qué pasa al pasarlo.

   | Opción | Uso comercial gratis | Tope | Al pasarlo |
   |---|---|---|---|
   | **OpenFreeMap** | sí | sin límite de vistas ni pedidos, sin clave | no corta; vive de donaciones |
   | MapTiler (FREE) | **no** | 5.000 sesiones/mes | se pausa hasta el mes siguiente |
   | Stadia Maps (free) | **no** | 200.000 créditos/mes | sin uso adicional |
   | Mapbox | según licencia | 50.000 cargas/mes | cobra (USD 5 cada 1.000) |
   | Protomaps (PMTiles propio) | sí | lo que aguante el hosting | lo pagamos nosotros |

   **Recomendación: MapLibre + OpenFreeMap**, con Protomaps servido por nosotros
   como plan B si el servicio público falla. Atribución obligatoria:
   «OpenFreeMap © OpenMapTiles Data from OpenStreetMap».
2. **Ocultar por denuncias** (BRIEF §10.3). Propuesta del brief: 3 denuncias de
   usuarios distintos ocultan un aviso o un avistamiento hasta la revisión.
3. **Moderación de la publicación en redes.** Opciones: sale directo; sale sólo
   lo de protectoras verificadas; o pasa por una cola que el admin aprueba con un
   toque. **Recomendación: la cola**, porque lo que sale ahí lleva la marca.
4. **Analítica** (BRIEF §10.7). **Recomendación:** empezar sólo con la tabla
   `eventos` propia (sin cookies ni datos personales), que cubre las métricas del
   brief, y sumar una analítica sin cookies después si hace falta.
5. **Zona fuera de Montevideo.** Sólo Montevideo tiene barrios oficiales.
   **Recomendación:** usar las localidades del INE para el resto del país (Ciudad
   de la Costa, Las Piedras, Maldonado…), así un aviso de Canelones no queda sólo
   con «Canelones».

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

---

## 12 · Fases (para el plan)

Las del BRIEF §2, paso 4; cada una deja algo desplegable, en su rama.

1. **Base:** esquema con PostGIS, redondeo del punto, polígonos, RLS, reglas,
   bucket, `modulos` y `configuracion`, admin, y los tests `*-base`.
2. **Publicar:** selector de ubicación, código por email, borrador en el
   navegador, recompensa, Mis avisos.
3. **Ver y contactar:** feed, detalle, `/api/contacto`, denunciar, parecidos.
4. **Compartir:** vista previa por aviso, imagen, historia, los tres afiches.
5. **Mapa y avistamientos:** mapa, «Lo vi», recorrido, mail a la familia.
6. **Admin:** tablero, moderación, usuarios, módulos y flags.
7. **Vencimiento:** automático, con recordatorios por cron.

Después del núcleo, cada uno con su spec: `redes_automaticas`, `historias`,
`veterinarias`, `marketplace_servicios`, `marketplace_productos`.
