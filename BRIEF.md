# Volvé a casa — brief de arranque

> **Nombre provisorio** (§10.1). Este documento es el diseño armado con el dueño
> en la sesión de bagayí del 2026-09-27. Es la salida del brainstorming: no lo
> repitas. Leelo entero antes de tocar nada. Los pasos del §2 van en orden y
> cada uno termina en un criterio que tenés que poder verificar. Las
> decisiones del §3 están cerradas; las del §10 las toma el dueño.

---

## 1 · Qué es

Un sitio web de mascotas **perdidas, avistadas, encontradas y en adopción** en
Uruguay, presentado como *"Un proyecto de bagayí"*. Es la acción benéfica y de
marca de bagayí, el marketplace uruguayo de compra en frontera del mismo dueño
(`C:\Users\brian\OneDrive\Escritorio\bagayi`, en vivo en
https://bagayo.vercel.app). Tiene marca propia y **no se ve como un
marketplace**. La relación con bagayí es un pie discreto con link.

**Compartir es el motor.** Quien pierde un perro ya lo publica en grupos de
Facebook, estados de WhatsApp e Instagram. Ahí está la audiencia y no se la
vamos a sacar. El sitio gana si es **la forma más rápida de armar el aviso que
después circula por esos lugares**: se publica en dos minutos y se sale con un
link que en WhatsApp muestra la foto, una imagen para historias y un afiche
para pegar en el barrio. Cada pieza lleva el nombre del sitio y el pie de
bagayí. Ese es el retorno de marketing.

**El mapa es la herramienta de búsqueda.** En él se ve, por zona, lo perdido,
lo avistado, lo encontrado y lo que está en adopción. Cada "lo vi" que carga un
vecino queda en el mapa junto al aviso del perdido y le llega al dueño.

**Competencia**, relevada el 2026-09-27:

- **Taponto**: app uruguaya. A octubre de 2024 tenía 2.281 usuarios y 771
  animales publicados, de los que 614 se dieron de baja por adopción o
  reencuentro. Una marca de alimento les regala kits de bienvenida a quienes
  adoptan.
- **PetRadar**, **AdoptaPet**, **BuscandoteYa** y **animalesperdidosuy.com**.
- **mascotasperdidas.uy**: 9 reportes activos, sección de avistamientos y orden
  por cercanía, sin afiche.
- **Grupos de Facebook** como APYEU.

Donde se diferencia el sitio:

- **No hay que instalar nada**: es web.
- **Compartir está resuelto de entrada**: vista previa con foto, historia,
  afiche con QR.
- **Los avistamientos están ligados al perdido:** se ven como un recorrido en
  el mapa, y el dueño se entera en minutos.
- **Las protectoras son la fuente del contenido.** A las protectoras les cuesta
  el tiempo de cargar y actualizar: es la dificultad que registra la nota de
  prensa sobre Taponto. Publicar rápido y tener página propia es lo que las
  trae.

**Tono:** cálido, emotivo y esperanzado. Lo resuelto se celebra.

---

## 2 · Pasos

### Paso 1 · Maqueta y paleta (no necesita infraestructura)

1. Hacé `git init` en esta carpeta, con `main` como rama. El primer commit es este
   brief.
2. Armá la referencia visual en `design-src/`. Sirve un HTML estático
   autocontenido o la herramienta Artifact (`quickstart` con intent
   `design`). Lo que importa es que quede un archivo en el repo que haga de
   fuente de verdad visual, como `bagayi/design-src/*.dc.html` en bagayí.
   - Pantallas en teléfono (375 px): Inicio/feed, **Mapa**, Detalle, Publicar
     (paso a paso), **Lo vi** (avistamiento), **Listo para compartir**, Mis
     avisos y Admin → Módulos.
   - Inicio, Mapa y Detalle, además, en escritorio (1280 px).
   - La tarjeta del feed en sus cinco estados: perdido, avistado, encontrado,
     en adopción y ¡volvió a casa!
   - Los marcadores del mapa: los cuatro tipos, la zona aproximada y el grupo
     con número.
   - La imagen de compartir (1200×630), la historia (1080×1920) y el afiche A4.
3. Partí de la paleta del §3.7 y del formato de bagayí. Para ver el formato,
   leé con `grep` `bagayi/design-src/Mobile.dc.html` y `Comprador.dc.html`
   (pesan ~260 KB cada uno) y `bagayi/src/styles/tokens.css`.
4. Mostrásela al dueño en el browser pane o en un Artifact. Si la marca se
   confunde con PERDIDO o con AVISTADO, pasá la marca a frambuesa (§3.7) y volvé
   a mostrar.

**Terminado cuando** el dueño aprobó la maqueta en los dos anchos y los tokens
finales quedaron anotados en `design-src/` con sus contrastes medidos.

### Paso 2 · Infraestructura

**Requisitos:**

- el nombre confirmado (§10.1);
- Vloas pausado por el dueño desde el panel de Supabase (§3.2).

**Tareas:**

1. **GitHub:** repo privado bajo `BrianDiez`.
2. **Vercel:** proyecto nuevo en el team *brian diez's projects*, conectado al
   repo. Un push a `main` despliega, así que se trabaja en ramas.
3. **Supabase:** proyecto nuevo en la organización `useaside.app`
   (`mvxfxhemyepswsjrxjcq`), región `sa-east-1`, por MCP y con la confirmación
   de costo que pide la herramienta. Con la extensión PostGIS.
4. **App con Vite:** copiá lo del §9.1. El puerto es **5174**, porque bagayí
   ocupa el 5173 y los dos proyectos se trabajan a la par. `vercel dev` corre en
   el **3001**, con el proxy de `/api` apuntando ahí.
5. **`.claude/`:** `launch.json` con el puerto 5174 y `settings.json` con el
   `deny` de bagayí y un `autoMode.environment` escrito para este proyecto.
6. **`CLAUDE.md` corto:** las convenciones del §9.2, a qué base apunta el
   `.env` y un puntero a `HANDOFF.md`. En bagayí el contexto se pegaba a mano
   en cada chat; acá lo carga solo.
7. **`HANDOFF.md`:** arrancalo desde el día 1, con la estructura del de bagayí.

**Terminado cuando:**

- `npm run dev` muestra en `:5174` el layout con la paleta aprobada;
- `npm test` y `npm run build` están verdes;
- el push a `main` desplegó y la URL responde 200;
- un `select postgis_version()` por MCP contra el proyecto nuevo funciona;
- el HANDOFF dice contra qué base corre `npm run dev`.

### Paso 3 · Spec del núcleo

Escribí `docs/superpowers/specs/<fecha>-nucleo-design.md` con los §3 a §8 de
este brief más lo que decidió la maqueta. Si algo quedó abierto o se
contradice, preguntale al dueño, una pregunta por vez.

**Terminado cuando** el dueño lo aprobó y está commiteado.

### Paso 4 · Plan

Pasá el spec por `writing-plans`, que lo escribe en `docs/superpowers/plans/`.
Estas son fases sugeridas; cada una deja algo desplegable:

1. **Base:** esquema con PostGIS, el redondeo de puntos, los polígonos de
   departamentos y barrios, RLS, reglas, buckets, `modulos` y `configuracion`,
   admin, y los tests `*-base`.
2. **Publicar:** con el selector de ubicación en el mapa y el código por email,
   más Mis avisos.
3. **Ver y contactar:** feed, detalle, contacto por WhatsApp, denunciar y
   parecidos.
4. **Compartir:** vista previa por aviso, imagen OG, historia y afiche con QR
   (§6).
5. **Mapa y avistamientos:** la vista del mapa, "Lo vi", el recorrido en el
   detalle y el mail al dueño (§7).
6. **Admin:** tablero, moderación, usuarios y el panel de módulos.
7. **Vencimiento:** automático, con recordatorios por cron.

**Terminado cuando:**

- cada pantalla del §4 y cada regla del §5 tienen al menos una tarea y un test;
- ninguna tarea deja la suite en rojo. Si una función compartida cambia de
  contrato, sus llamadores van en la misma tarea (`bagayi/HANDOFF.md` §10).

### Paso 5 · Ejecución

Usá `subagent-driven-development` o `executing-plans`. Cada fase va en su rama y
hace el recorrido completo: tests, build, pantalla abierta en el navegador, PR,
merge (que despliega).

**Terminado, por fase, cuando:**

- `npm test`, `npm run build` y `npm audit` están limpios;
- cada pantalla nueva se abrió en el browser pane a 375 y 1280 px;
- los ataques a la base de esa fase se probaron por MCP (§9.3);
- el HANDOFF quedó al día.

### Paso 6 · Antes de lanzar

- [ ] **Dominio y SMTP propio:**
  - Resend o Brevo, con SPF, DKIM y DMARC;
  - remitente `no-reply@<dominio>` y el link tracking apagado;
  - en Auth → Rate Limits, subir el tope de mails (con SMTP propio arranca en
    30 por hora);
  - Site URL y Redirect URLs con el dominio nuevo, el mismo día (bagayí §8.4).
- [ ] **Plantilla del mail de login** con `{{ .Token }}`: un código de 6
  dígitos y nada de marketing.
- [ ] **Vista previa verificada:**
  - `curl -A "WhatsApp/2.23" https://<sitio>/a/<slug>` devuelve las `og:*` del
    aviso;
  - el Sharing Debugger de Facebook muestra la foto;
  - un link pegado en un chat real de WhatsApp muestra la foto y el título.
- [ ] **Mapa verificado desplegado** con los criterios del §7, y el plan del
  proveedor de tiles confirmado, con su tope mensual anotado.
- [ ] **Términos y privacidad:** los redacta el dueño con su abogada, como en
  bagayí (`bagayi/PLIEGO-LEGAL.md`). El sitio registra el consentimiento, y la
  política cuenta cómo se redondean las ubicaciones.
- [ ] **Entorno de desarrollo después de lanzar** (§10.4). En esta máquina no
  hay Docker, así que `npm run dev` pasaría a escribir en producción, que es lo
  que pasa hoy en bagayí.
- [ ] **Contenido inicial:** 20 a 30 avisos reales de 2 o 3 protectoras aliadas
  antes de anunciar. Un feed o un mapa vacío es un sitio muerto.

**Terminado cuando** cada ítem tiene su verificación anotada en el HANDOFF,
con fecha.

---

## 3 · Decisiones (cerradas al aprobarse este brief)

1. **Uruguay, y la ubicación es un punto en el mapa.**
   - La base lo redondea según el tipo antes de guardarlo (§7).
   - El departamento y el barrio salen del punto.
   - Las listas de departamentos (`DEPARTAMENTOS` de
     `bagayi/src/lib/constants.js`) y de barrios sirven para filtrar y para
     centrar el mapa.
   - **Nunca una dirección exacta:** el punto exacto no se guarda.
2. **Base propia.** Es un proyecto Supabase nuevo, separado de bagayí, y nada de
   mascotas vive en la base de bagayí. El dueño pausa Vloas para liberar el
   cupo gratis: en el plan gratis, un proyecto pausado no cuenta para el tope
   de 2 y se restaura con un clic durante 90 días. Después de eso solo se baja
   el backup.
3. **La primera entrega es el núcleo, con mapa y avistamientos, más los
   módulos.** Veterinarias, servicios y productos existen en el panel como
   módulos apagados, sin pantallas. Cada uno tiene su propio spec después
   (§11).
4. **Productos: checkout propio con Mercado Pago**, como módulo secundario. Lo
   primero es la ayuda a los animales, y la tienda nunca aparece en el inicio,
   en el mapa ni en el feed.
5. **El stack es el de bagayí.** SPA con React, Vite y react-router, más
   Supabase (con PostGIS), Vercel y Vitest, con las mismas versiones mayores
   que `bagayi/package.json`. Así lo que se copia de bagayí anda sin adaptar.
6. **Mobile-first, con la estructura de bagayí y la paleta propia.**
7. **Paleta.** La propuesta es esta; la valida la maqueta. Contrastes WCAG
   medidos el 2026-09-27. Los textos pasan AA (4.5) y los marcadores superan
   el 3:1 que se pide para gráficos contra un mapa claro (`#F2EFE9`) y contra
   el agua (`#D8E6EC`).

   ```
   marca        #C2410C terracota  · hover #9A3412 · tenue #FFF1E8 · fondo #FFF7F2
                 blanco encima 5.18 · sobre oscuro, #F97316
   respaldo     #BE185D frambuesa · blanco encima 6.04 (si la marca se confunde con un estado)
   tinta        #231A15 espresso (títulos, barra, pie) · 15.67 sobre el fondo
   texto        #6B5E55 · 5.74 sobre el fondo
   texto-suave  #7A6D65 · 4.59 sobre el fondo
   fondo        #F7F5F0 · panel #FFFFFF · bordes #E8E4DC / #D6D0C3  (los de bagayí)
   perdido      #B42318 sobre #FEE4E2 · 5.45 · marcador 5.73
   avistado     #B54708 sobre #FEF0C7 · 4.78 · marcador 4.73
   encontrado   #175CD3 sobre #D1E9FF · 4.79 · marcador 5.22
   en adopción  #6941C6 sobre #EBE9FE · 5.55 · marcador 5.77
   resuelto     #067647 sobre #DCFAE6 · 5.11 (no va al mapa)
   grupo        #231A15 con número blanco · marcador 14.88
   WhatsApp     fondo #25D366 con texto #0B3D2E · 6.15  (con texto blanco da 1.98: no)
   ```

   - **La marca va solo en acciones:** botones, links y navegación. Los colores
     de estado van solo en cintas, insignias y marcadores. La terracota queda
     entre el rojo de perdido y el ámbar de avistado, y esa separación de usos
     es lo que evita que se confundan.
   - La tipografía es la de bagayí: Archivo para títulos y cifras, Instrument
     Sans para el cuerpo.
   - Los nombres de token son los mismos donde el concepto es el mismo: el
     `--verde` de bagayí pasa a `--marca`.
   - Los grises de texto de bagayí **no se copian**: `#64748B` sobre `#F7F5F0`
     da 4.37 y `#8A939F` sobre blanco da 3.11.
   - El estado siempre se comunica con texto e ícono, además del color. En el
     mapa, cada tipo tiene su ícono.
8. **Login sin contraseña,** con un código de 6 dígitos por email (OTP de
   Supabase). El código por WhatsApp Supabase lo soporta solo con Twilio o
   Twilio Verify y un remitente de WhatsApp aprobado por Meta, que tarda y
   cobra por mensaje. Va detrás del flag `login_whatsapp`, apagado hasta que
   ese remitente exista.
9. **Primero se publica, la cuenta viene después.** El formulario se llena sin
   sesión y el borrador vive en el navegador, así sobrevive a ir a buscar el
   código al mail. Al final se pide el email, el código, y se publica. La base
   solo recibe escrituras autenticadas.
   - **Cargar un avistamiento también pide sesión** (decisión del dueño,
     2026-09-28), con el mismo orden: primero el avistamiento, al final el
     código. La sesión dura meses, así que desde el segundo avistamiento es
     inmediato. Y si alguien carga avistamientos falsos para engañar a un
     dueño, hay a quién bloquear.
10. **Avisos y avistamientos se publican al instante,** porque un perro perdido
    no espera moderación. La moderación es por denuncia. Los negocios de los
    módulos, en cambio, esperan aprobación manual.
11. **Nunca se venden animales.** Los avisos no tienen columna de precio, y
    "pide plata" es un motivo de denuncia. La tienda vende solo productos.
12. **Todo vence.** Perdido y encontrado a los 30 días, adopción a los 60. Los
    avisos se renuevan con un toque desde el aviso o desde el mail de
    recordatorio.
    - Un aviso vencido sale del feed y del mapa, pero **su link sigue andando**
      y dice "este aviso venció": ese link circula por WhatsApp.
    - **Un avistamiento dura 24 horas desde que el animal fue visto**
      (`visto_en`), no desde que se cargó: lo que importa es cuánto hace que
      alguien lo vio (decisión del dueño, 2026-09-28).
      - No se renueva.
      - Vencido, sale del mapa, pero sigue en el recorrido del perdido,
        atenuado y con su antigüedad.
      - Un avistamiento de hace días es ruido en el mapa general y señal en la
        historia de un perro puntual.
    - Los plazos viven en `configuracion`.
13. **Lo resuelto se celebra.** Los carteles son "¡Volvió a casa!" y "¡Encontró
    familia!". El aviso resuelto queda visible, sin el botón de contacto, sale
    del mapa y alimenta el contador del inicio. El contador aparece recién
    cuando el número suma: un número chico resta
    (`bagayi/src/pages/buyer/Home.jsx`, el comentario de ofertas). El umbral
    vive en `configuracion`.
14. **El WhatsApp de quien publica no viaja en ninguna consulta pública.** Se
    entrega recién al tocar "Contactar", por `/api/contacto`, con límite por IP
    (§5). Junto al botón va un aviso fijo contra estafas: *"Nunca pagues por
    adelantado ni pases códigos que te lleguen por SMS o WhatsApp."* Es la
    estafa conocida con mascotas perdidas: alguien dice tener al animal y pide
    plata o el código para robarte el WhatsApp.
15. **Las fotos se achican en el navegador** (canvas, ~1600 px, WebP o JPEG)
    antes de subir. Eso ahorra datos móviles y **borra el EXIF, que trae el GPS
    de la casa de quien sacó la foto**. La transformación de imágenes de
    Supabase no existe en el plan gratis.

---

## 4 · Pantallas del núcleo

**Barra inferior (≤ 860 px):** Inicio · **Mapa** · **Publicar** (al centro,
destacado) · Mis avisos · Cuenta. Cinco como máximo: un sexto tab los aprieta
a 46 px y rompe el área táctil (bagayí §7). "Adoptar" deja de ser tab y queda
como entrada del inicio y como filtro; esto lo valida la maqueta. En
escritorio, el header lleva el logo, Mapa · Perdidos · Encontrados · Adopción,
el botón "Publicar aviso" y la cuenta.

**Pie de todas las páginas públicas:** *Un proyecto de **bagayí***, con un
link a bagayí que lleva `?utm_source=<sitio>&utm_medium=referral&utm_campaign=un-proyecto-de-bagayi`.
Nada de bagayí en el header, en el feed ni en el mapa.

- **Inicio / feed**
  - Cuatro entradas grandes arriba: *Perdí a mi mascota*, *Encontré una
    mascota*, *Vi un animal suelto* y *Quiero adoptar*. Las dos primeras abren
    Publicar con el tipo ya elegido, la tercera abre "Lo vi" y la cuarta filtra
    el feed.
  - La diferencia entre *Encontré* (lo tengo conmigo) y *Vi* (lo vi y no lo
    tengo) se explica en una línea debajo de cada entrada.
  - El feed mezcla todo, ordenado por fecha, con filtros de tipo, especie
    (perro, gato u otro), departamento y barrio. Los filtros van en la URL,
    para que un filtro también se pueda compartir.
  - Una tira *Volvieron a casa* con los resueltos recientes.
- **Mapa:** se describe en el §7.
- **Tarjeta**
  - Foto destacada con la cinta de estado encima.
  - Nombre, o "Perro sin nombre".
  - Zona y hace cuánto.
  - Dos líneas de historia (en adopción) o de señas.
  - Botón de compartir.
- **Detalle** (`/a/<nombre>-<zona>-<id_corto>`)
  - Fotos, estado y datos: especie, sexo, tamaño, color, señas, fecha y zona.
  - La historia, en adopción.
  - En el teléfono, *Contactar por WhatsApp* (primario) y *Compartir* quedan
    fijos abajo, con el aviso contra estafas.
  - Autor: persona, o protectora con insignia.
  - En un perdido: **Avistamientos** en un mini mapa con el recorrido, del más
    viejo al más nuevo, con los vencidos atenuados, más el botón *Lo vi*.
  - *Parecidos*: avisos del tipo opuesto, misma especie, a menos de N km
    (configurable), ±15 días. En un perdido, también los avistamientos sueltos
    vigentes de la misma especie cerca. Es una consulta, y es lo que produce
    reencuentros.
  - *Denunciar*, discreto.
- **Publicar**, una pregunta por pantalla en el teléfono:
  1. Tipo.
  2. Fotos: de 1 a 6, achicadas en el navegador.
  3. El animal.
  4. Dónde y cuándo: un selector de ubicación en el mapa, con *Usar mi
     ubicación*. Muestra el círculo de lo que se va a ver y dice *"Se va a ver
     como una zona, no como tu dirección"*.
  5. Historia o señas.
  6. WhatsApp de contacto, con el consentimiento explícito de que lo va a ver
     quien toque Contactar.
  7. Email y código, si no hay sesión.
  8. **Listo**.
- **Lo vi (avistamiento).** Es un recorrido corto, porque quien ve un perro
  suelto tiene menos paciencia que su dueño:
  1. Dónde: el mapa arranca en tu ubicación.
  2. Cuándo: *ahora*, o hace cuánto, dentro de la vigencia (§3.12).
  3. Especie, una nota corta (color, collar, hacia dónde iba) y una foto
     opcional.
  4. Email y código, si no hay sesión (§3.9).
  5. *"Gracias"*. Si el avistamiento está ligado a un aviso, la pantalla
     agrega *"El dueño ya recibió tu avistamiento"*.
- **Listo para compartir** es la pantalla más importante después de publicar.
  - Dice *"Tu aviso está publicado"* y ofrece WhatsApp, historia de Instagram
    (descarga la imagen), Facebook, copiar el link y el afiche para imprimir.
  - Si hay parecidos, los muestra acá.
- **Mis avisos:** cada aviso con su estado, sus avistamientos, y acciones de
  editar, renovar, marcar como resuelto y borrar. Al resolver se pregunta
  *"¿volvió a casa?"* o *"¿lo adoptaron?"*, y opcionalmente *"¿te ayudó el
  sitio?"* y *"¿te sirvió algún avistamiento?"*.
- **Cuenta:** nombre, WhatsApp por defecto, salir y borrar la cuenta. El patrón
  es anonimizar, como `bagayi/src/components/BorrarCuenta.jsx`.
- **Página de protectora** (`/p/<nombre>-<id_corto>`): nombre, insignia
  *Protectora verificada* (la asigna el admin) y sus avisos.
- **Denunciar** (ventana), sobre un aviso o un avistamiento, con estos motivos:
  - estafa o pide plata;
  - venta de animales;
  - aviso o avistamiento falso;
  - maltrato o contenido sensible;
  - otro.
- **Ayuda y legales:** qué hacer si perdiste o encontraste una mascota (útil y
  bueno para buscadores), términos y privacidad.
- **Admin** (`/admin`, barra propia como en bagayí)
  - Tablero: activos por tipo, avistamientos de la semana, nuevos en 7 días,
    resueltos, denuncias abiertas y la más vieja sin mirar, negocios por
    aprobar.
  - Moderación: la cola de denuncias de avisos y avistamientos, con las
    acciones ocultar o descartar y un motivo.
  - Usuarios: buscar, ver sus avisos y avistamientos, marcar protectora
    verificada, suspender la publicación, hacer admin.
  - Módulos: los switches (§8).

---

## 5 · Datos y reglas en la base

Las reglas viven en la base, con triggers `BEFORE` en INSERT **y** UPDATE. La
UI las repite para dar buenos mensajes. Este esquema es un boceto; el spec lo
cierra.

- **`perfiles`**
  - Columnas: id → `auth.users`, nombre, `tipo` (`persona` | `protectora`),
    `verificada`, `rol` (`usuario` | `admin`), `suspendido`, fechas.
  - Nadie se cambia a sí mismo `rol`, `verificada` ni `suspendido`.
  - **Siempre queda un admin vivo**
    (`bagayi/supabase/migrations/20260925000800_siempre_un_admin.sql`).
- **`avisos`**
  - Columnas: `id_corto` generado, `autor_id`, `tipo` (`perdido` |
    `encontrado` | `adopcion`), `estado` (`activo` | `resuelto` | `vencido` |
    `oculto`), `especie`, nombre del animal, sexo, tamaño, edad aproximada,
    color, señas, historia, fecha del hecho, **`punto`** (`geography(Point)`,
    ya redondeado), `departamento` y `zona` (derivados del punto), `recompensa`
    (booleano sin monto), `vence_en`, `resuelto_en`, `resolucion` y fechas.
  - Las fechas y `vence_en` los pone la base (bagayí 085).
  - Lectura pública de activos y resueltos. Los vencidos se leen solo por su
    link. Los `oculto` los ven solo el autor y el admin.
- **`avistamientos`**
  - Columnas: `id_corto`, `aviso_id` (opcional), `autor_id`, `especie`, nota
    corta, foto opcional, `punto` (redondeado), `visto_en`, `departamento` y
    `zona` derivados, `estado` (`activo` | `vencido` | `oculto`) y `vence_en`.
  - **No lleva datos de contacto de quien lo carga.**
- **`departamentos` y `barrios`:** polígonos de solo lectura, de datos
  abiertos. Los departamentos salen de la IDE Uruguay o el INE, y los barrios
  de Montevideo de la Intendencia. La fuente y la licencia se verifican en el
  spec, y la atribución va en el pie del mapa.
- **`fotos_aviso`** (hasta 6 por aviso) y la foto opcional de cada
  avistamiento viven en un bucket público `fotos`, con una carpeta por aviso o
  por avistamiento. El bucket tiene tope de tamaño y de tipo MIME; el patrón es
  `bagayi/supabase/migrations/20260827001200_limites_de_buckets.sql`.
- **`contactos_aviso`** (el WhatsApp en formato E.164), **sin lectura pública.**
  - La RLS es por fila, no por columna: si el número estuviera en `avisos`, un
    `select=*` lo traería aunque ninguna pantalla lo muestre (bagayí §10).
  - Lo entrega `/api/contacto`, que verifica que el aviso esté activo, limita
    por IP con el patrón de `bagayi/api/_lib/limite.js`, registra el clic y
    devuelve el link `wa.me`.
  - El link lleva un texto precargado: *"Hola, te escribo por tu aviso de
    <nombre> en <sitio>: <link>"*.
- **`denuncias`**, con el patrón de
  `bagayi/supabase/migrations/20260902000200_denuncia_de_publicaciones.sql` y
  `bagayi/src/lib/denuncias-logica.js`.
  - Apunta a un aviso **o** a un avistamiento: un `CHECK` exige exactamente
    uno.
  - Se denuncia con sesión.
- **`modulos`** (clave, activo, quién y cuándo) con la función
  `modulo_activo(clave)`, más **`configuracion`** clave/valor para plazos,
  topes, umbrales y precisiones (patrón de
  `bagayi/supabase/migrations/20260827001700_configuracion_del_sitio.sql`).
- **`consentimientos`**, con el patrón de
  `bagayi/supabase/migrations/20260902000100_consentimiento_de_terminos.sql`.
- **`eventos`** para medir: `contacto`, `compartir` o `mapa`, el canal, el
  aviso y la fecha. Sin datos personales, y solo se inserta.

**Reglas:**

- **Estados de los avisos:**
  - `activo` pasa a `resuelto` o `vencido`;
  - `vencido` vuelve a `activo` al renovar;
  - `resuelto` es final, salvo para el admin;
  - `oculto` lo pone y lo saca solo el admin.
- **Edición:** solo el autor o un admin editan. El autor no toca `estado =
  oculto`, `vence_en`, `autor_id`, `id_corto` ni las fechas.
- **Punto:** un trigger `BEFORE INSERT OR UPDATE` redondea el punto con
  `ST_SnapToGrid`, con la grilla del tipo que está en `configuracion`, y
  completa `departamento` y `zona` con `ST_Contains` contra los polígonos. El
  cliente manda el punto que marcó la persona y la base guarda el redondeado.
- **Avistamientos:**
  - `visto_en` no puede estar en el futuro ni ser anterior a la vigencia
    (§3.12): un avistamiento no nace vencido.
  - `vence_en` lo pone la base: `visto_en` más la vigencia.
  - `aviso_id` solo puede apuntar a un aviso `perdido` y `activo`.
  - Al ligarse a un aviso, se le avisa al autor por mail en minutos. Un Database
    Webhook o `pg_net` llama a `/api` con un secreto; es el patrón de la 087 de
    bagayí.
- **Topes:** avisos y avistamientos por usuario por día (anti-spam) y fotos por
  aviso (6). Todo va en `configuracion`. Un usuario suspendido no publica ni
  carga avistamientos.
- **Vencimiento:**
  - **Lo vigente lo decide la consulta,** con `vence_en > now()`, no un
    `estado` que actualiza un cron. Con avistamientos de 24 horas, un cron
    diario los dejaría en el mapa hasta un día de más.
  - `pg_cron` corre cada hora: pone `estado = vencido` para ordenar y dispara
    los recordatorios de avisos por vencer. El patrón es la migración 087 de
    bagayí más `bagayi/api/mp/tareas.js`: un cron que llama a un endpoint con
    un secreto.
  - Los recordatorios salen por la API del proveedor de mail, con otro
    remitente que el del login: la documentación de Supabase pide no mezclar
    mails de autenticación con los demás.

---

## 6 · Compartir: el motor

- **URL:** `/a/<nombre>-<zona>-<id_corto>`. El nombre es decorativo y lo que
  resuelve es el id corto. Así, un link compartido ayer sigue andando aunque
  el aviso cambie de nombre (`bagayi/src/lib/slug.js`).
- **Vista previa**
  - WhatsApp, Facebook e Instagram **no ejecutan JavaScript**: una SPA sola les
    muestra el `index.html` genérico, sin la foto del perro.
  - `vercel.json` reescribe `/a/:slug` a una función que toma el `index.html`
    del mismo deploy, le inyecta `<title>`, las `og:*` y
    `twitter:card=summary_large_image` con los datos públicos del aviso, y lo
    devuelve. El navegador arranca la SPA igual.
  - Cache corta (`s-maxage` de minutos), para que un *¡Volvió a casa!* se vea
    pronto.
  - Esa reescritura va antes del catch-all de la SPA.
- **Imágenes:** una función con `@vercel/og` genera
  - un PNG de 1200×630 con la foto, la cinta (*SE BUSCA* / *ENCONTRADO* /
    *EN ADOPCIÓN* / *¡VOLVIÓ A CASA!*), el nombre, la zona, la fecha, el
    dominio y, chico, *Un proyecto de bagayí*;
  - la variante historia, de 1080×1920.
- **Afiche A4 imprimible:** foto grande, *SE BUSCA* enorme, señas, *visto por
  última vez* (zona y fecha), el teléfono (es el afiche de quien publicó, que
  eligió ponerlo), un QR al aviso y el sitio.
  - El patrón es `bagayi/src/components/EtiquetaEnvio.jsx` con el
    `@media print` de `bagayi/src/styles/tokens.css`: portal al `<body>` y
    `body > *:not(.afiche) { display: none }`.
  - Con `visibility: hidden` salían hojas en blanco (bagayí §6.88).
- **Un solo componente `Compartir`**, que se usa en la tarjeta, el detalle y
  Listo.
  - En el teléfono usa `navigator.share`, con la imagen como archivo si el
    navegador lo soporta.
  - Si no, ofrece WhatsApp (`wa.me/?text=`), Facebook, copiar el link y
    descargar la imagen.
  - Cada uso queda en `eventos`.
- **CSP:** todo origen nuevo (fuentes para la imagen OG, el Storage de
  Supabase, tiles del mapa) va explícito en `vercel.json`. `npm run dev` no
  aplica `vercel.json`, así que una violación de CSP aparece recién desplegado.

**Terminado cuando** se cumplen las tres verificaciones de vista previa del
Paso 6.

---

## 7 · Mapa y avistamientos

**Qué muestra el mapa:**

- los avisos activos de perdidos, encontrados y en adopción;
- los avistamientos vigentes (§3.12);
- cada tipo con su color y su ícono (§3.7).

Tiene los mismos filtros que el feed (tipo, especie, fecha), que van en la URL.
Los resueltos no van al mapa: van a *Volvieron a casa*.

**Qué es un avistamiento.** Alguien vio a un animal suelto y no lo tiene, que
es distinto de *encontrado* (lo tiene con él).

- Puede estar ligado a un perdido (*Lo vi*, desde el detalle) o suelto (*Vi un
  animal suelto*, desde el inicio o el mapa).
- Los avistamientos ligados se ven en el detalle del perdido como un recorrido,
  también después de vencer (§3.12).

**Privacidad del punto:** es la regla que manda sobre todo lo demás de esta
sección.

- El punto exacto no se guarda en ningún lado. Si estuviera en una columna, la
  RLS por fila lo entregaría (§9.3). La base guarda el punto redondeado (§5).
- La grilla se elige por tipo y vive en `configuracion`:

  | Tipo | Grilla | Por qué |
  |---|---|---|
  | perdido y encontrado | ~400 m | el punto suele ser la casa de alguien |
  | adopción | ~1 km | es la casa de quien da en adopción |
  | avistamiento | ~100 m | es la calle, y la precisión ayuda a buscar |

- El mapa dibuja perdido, encontrado y adopción como **zona** (un círculo del
  tamaño de la grilla) y el avistamiento como **punto**.

**En el teléfono:**

- el mapa ocupa la pantalla entera;
- arriba van los chips de tipo, con su contador;
- el botón *Cerca mío*;
- una hoja inferior con la lista de lo que se ve (*"9 en esta zona"*), que se
  desliza hacia arriba;
- tocar un marcador abre su tarjeta en la hoja;
- los marcadores cercanos se agrupan en uno con número.

**En escritorio:** la lista a la izquierda y el mapa a la derecha,
sincronizados.

**La lista es el equivalente accesible del mapa:** todo lo que está en el mapa
se alcanza desde la lista, con teclado y con lector de pantalla.

**Técnica:**

- **Librería:**
  - **Leaflet** con agrupación de marcadores es liviana y usa tiles raster;
  - **MapLibre** es vectorial y se puede teñir con la paleta, pero pesa más y
    pide `worker-src blob:` en la CSP.
  - En los dos casos, el chunk del mapa es lazy: quien no abre el mapa no lo
    descarga.
- **Proveedor de tiles:** se elige en el spec (§10.8). El servidor de tiles de
  OpenStreetMap es para uso liviano y puede cortar el acceso: no sirve de base
  para un sitio que se viraliza.
- **Sin búsqueda por dirección en la primera entrega:** el mapa se centra con
  *Cerca mío* o eligiendo departamento y barrio de las listas (con los
  centroides de los polígonos). El servicio gratuito de OpenStreetMap para
  buscar direcciones (Nominatim) no permite autocompletar.
- **Consulta:** la RPC `puntos_en_mapa(recuadro, tipos, especie, desde)`
  devuelve solo campos públicos del recuadro visible, con índice GIST y un
  tope de puntos.
- **Permisos y CSP:**
  - `Permissions-Policy: geolocation=(self)`, porque bagayí trae
    `geolocation=()`, que la bloquea;
  - el dominio de tiles, en la CSP.
  - Las dos cosas se aplican solo desplegado: se prueban en un deploy de
    preview, desde un teléfono.
- **Reuso:** el mismo componente de mapa sirve después para veterinarias
  (§11).

**Terminado cuando**, en un deploy de preview y desde un teléfono real:

- *Cerca mío* centra el mapa;
- los cuatro tipos se ven con su color y su ícono, y se filtran;
- un avistamiento cargado con *Lo vi* aparece en el mapa y en el detalle del
  perdido, y le llega el mail al autor;
- un avistamiento sale del mapa en el momento en que vence y sigue, atenuado,
  en el recorrido del perdido;
- una consulta SQL confirma que ningún punto guardado tiene más precisión que
  la de su grilla.

---

## 8 · Módulos y flags

- **Un solo registro en código,** `src/lib/modulos.js`, con las claves
  `veterinarias`, `marketplace_servicios` y `marketplace_productos`. Cada una
  lleva nombre, ruta base, ícono y descripción para el panel.
  - Del registro salen **todas** las menciones: las rutas (lazy, así un módulo
    apagado ni se descarga), la navegación y el pie.
  - Las pantallas preguntan con `useModulo(clave)`, que lee la tabla `modulos`
    una vez por carga, con el patrón de `bagayi/src/lib/configuracion.js`.
  - En bagayí, la misma regla escrita en N pantallas terminó olvidada en una,
    cinco veces (bagayí §6.68). Por eso el registro es único.
- **La base respalda el apagado.** Las tablas de cada módulo exigen
  `modulo_activo('<clave>')` en el INSERT y el UPDATE de quien no es admin.
  Apagar no borra nada: al prender, todo vuelve como estaba.
- **Un módulo apagado** muestra en su ruta *"Todavía no está disponible"*.
- **Los módulos viven en su propio espacio.** Van en el menú de Cuenta, en el
  header de escritorio y en el pie, nunca en el feed ni en el mapa del núcleo.
  La tienda va solo en el menú y en el pie.
- **El panel del admin** tiene un switch por módulo con su descripción y una
  confirmación que dice qué va a ver la gente. Los flags que no son módulos,
  como `login_whatsapp`, van en la misma pantalla, en otra sección.

---

## 9 · Lo que se hereda de bagayí

Todas las rutas son relativas a `C:\Users\brian\OneDrive\Escritorio\bagayi\`.

### 9.1 · Para copiar y adaptar

| De bagayí | Para qué | Qué cambia |
|---|---|---|
| `package.json`, `vite.config.js`, `vitest.setup.js` | versiones y los dos proyectos de test (`node` y `dom`) | el puerto 5174 y el proxy a 3001 |
| `src/styles/tokens.css` | estructura, clases responsive, modal, `@media print` | la paleta (§3.7); se sacan las clases propias de bagayí |
| `src/ui/kit.jsx` | Boton, Badge, Campo, Entrada, Area, Selector, Modal, Vacio, Aviso, Foto, Icono, EnlaceExterno, PistaInfo, Encabezado, SeccionTitulo | `Isotipo` pasa a ser la marca nueva |
| `src/lib/useQuery.js`, `useAccion.js`, `useMedia.js`, `supabase.js` | datos, acciones con error visible (bagayí §6.87), cortes de pantalla | nada |
| `src/lib/config-publico.js` + `respaldo-publico.js` | Vercel descarta los `.env*` commiteados; el porqué está en el archivo | el ref del proyecto nuevo |
| `src/lib/configuracion.js` | lectura única por carga, cache y guardado | la base de `useModulo` |
| `src/lib/slug.js`, `fechas.js`, `format.js`, `DEPARTAMENTOS` de `constants.js` | URLs para WhatsApp, fechas y formatos | nada |
| `src/components/ErrorBoundary.jsx` | recarga si falla un chunk después de un deploy (bagayí §6.71) | nada |
| `src/components/Layouts.jsx` | header, barra inferior, pie y barra del admin | la navegación del §4 |
| `src/components/Denunciar.jsx`, `BorrarCuenta.jsx`, `EtiquetaEnvio.jsx` | denuncia, baja por anonimización, impresión | los motivos, el afiche |
| `api/_lib/limite.js`, `api/_lib/entorno.js` | límite por IP con la base y lectura del entorno | nada |
| migraciones 012, 017, `id_corto_para_urls`, `denuncia_de_publicaciones`, `consentimiento_de_terminos`, `siempre_un_admin`, `helpers_a_esquema_privado`, `revocar_ejecucion_funciones`, `funciones_de_trigger_sin_execute` | patrones probados en producción | se leen como patrón, no se aplican tal cual |
| `src/lib/siempre-un-admin-base.test.js` | test que lee la última definición de una función en las migraciones | el patrón para cada regla de la base |
| `src/pruebas/fixtures.js`, `dobles.js` | dobles de Supabase | nada |
| `vercel.json` | headers de seguridad y la reescritura de la SPA | la CSP con el ref nuevo y el dominio de tiles; `Permissions-Policy` pasa de `geolocation=()` a `geolocation=(self)` |
| `.claude/settings.json` | `deny` de `db push` y `db reset`, y `autoMode` | el texto del entorno |
| `HANDOFF.md` | la forma: qué es, estado medido, mapa, errores y cómo trabajar | arrancar el propio |

### 9.2 · Convenciones

- **Español rioplatense en todo:** código, columnas, comentarios y textos. Los
  comentarios explican el porqué, como en bagayí.
- **Lógica en módulos puros con tests.** Lo que monta un componente va en
  `.test.jsx`, porque Vite 8 habilita JSX por extensión (bagayí §6.79).
- **Lo responsive va en clases de `tokens.css`,** porque los estilos inline le
  ganan a las media queries.
- **Migraciones:** el archivo a disco y `apply_migration` por MCP, siempre las
  dos cosas. `db push` y `db reset` quedan en el `deny`.
- **El HANDOFF escribe el estado como se mide:** va el comando, no el número
  (bagayí §4.3).
- **Antes de cerrar:** `npm test`, `npm run build` y `npm audit`.

### 9.3 · Lecciones que cuestan caro

Cada una tiene su § en `bagayi/HANDOFF.md`, con el detalle.

1. **La RLS es por fila.** Lo privado va en su propia tabla o no se guarda
   (§10). Acá eso aplica al WhatsApp y al punto exacto.
2. **Blindá el INSERT además del UPDATE.** La auditoría 3 del §4.3 cruza
   policies, triggers y columnas escribibles, y se puede repetir (§6.122–125).
3. **Probá los ataques contra la base:**
   - con `set role` más `request.jwt.claims`;
   - limpiando las claims al cambiar de rol;
   - capturando `SQLERRM`, no solo si pasó o falló (§10, §6.90, §6.92).
4. **Sacar la función de la UI deja la capacidad.** Lo que la policy permite se
   puede hacer desde la consola (§6.82).
5. **Una regla que se muestra en N pantallas va en un solo lugar** (§6.68).
6. **La identidad es una clave estable en la base.** El texto legible es solo
   para mostrar (§6.81).
7. **Toda acción pasa por `useAccion`,** con el error visible donde el usuario
   está mirando (§6.87).
8. **El build no verifica la UI.** Abrí cada pantalla a 375 y 1280, y en la
   franja donde colapsan las columnas (§6.76, §10).
9. **Los fixtures salen de la fábrica real.** Un fixture armado a mano prueba
   tu idea del sistema (§6.73–75).
10. **El SMTP de prueba de Supabase** mandó 2 mails por hora, y la
    documentación dice que solo entrega a miembros del equipo. El SMTP propio
    va antes del primer usuario real (§8.4).
11. **Nada de `sed -i` desde Git Bash.** Los scripts de edición se escriben a un
    archivo del scratchpad, porque los backticks de un heredoc se ejecutan
    (§10).
12. **El login lo hace el dueño.** Las pantallas con sesión las abre él en el
    browser pane; con código por email, el código le llega a él (§10).
13. **Si Token Optimizer frena un screenshot o una lectura "repetida",**
    verificá con `javascript_tool` leyendo el DOM, o con `Read` y
    offset/limit (§11).
14. **Plan gratis de Supabase: sin backups descargables y sin branching.**
    Migraciones aditivas, con `create or replace` y `drop … if exists`.
15. **Mercado Pago, para la tienda.**
    - Las cuentas de prueba no se borran y su cupo es por cuenta: usar la
      cuenta de MP de bagayí gasta su cupo.
    - El sufijo del access token dice de qué cuenta es.
    - El detalle está en la memoria de bagayí `bagayi-cuentas-prueba-mp` y en
      `bagayi/HANDOFF.md` §4.

---

## 10 · Abierto: lo decide el dueño

1. **Nombre y dominio.** Se consultó el DNS el 2026-09-27. Falta confirmar en
   NIC.uy o ANTEL, la marca en la DNPI y el usuario de Instagram.

   | Nombre | Dominios sin delegar | Por qué |
   |---|---|---|
   | **Volvé a casa** | volveacasa.uy, volveacasa.com.uy (.com tomado) | voseo, emotivo, y el final feliz dice el nombre: *¡Volvió a casa!* |
   | Te buscamos | tebuscamos.uy, .com.uy, .org | el barrio entero buscando |
   | Llevame a casa | llevameacasa.uy, .com.uy | la voz del animal; sirve para encontrado y adopción |

   `mascotasperdidas.uy` ya existe.
2. **Isotipo.** La maqueta propone uno simple, por ejemplo una casita con una
   huella. El vectorial final lo trae el dueño, como en bagayí.
3. **Ocultar por denuncias.** Propuesta: 3 denuncias de usuarios distintos
   ocultan un aviso o un avistamiento hasta la revisión. El riesgo es que se
   use para bajar avisos legítimos.
4. **Desarrollo después de lanzar:** instalar Docker para tener Supabase local,
   o Supabase Pro con branching.
5. **Protectoras aliadas** para el contenido inicial, y quién las contacta.
6. **Tipografía.** Si el dueño quiere más distancia de bagayí, se cambia solo la
   de títulos, en la maqueta.
7. **Analítica.** Una sin cookies evita el cartel de consentimiento; se elige en
   el spec.
8. **Proveedor de tiles.**
   - Criterios:
     - que el plan gratis permita este uso (el sitio lo patrocina una marca);
     - su tope mensual;
     - qué pasa al pasarlo: si corta o si cobra.
   - Candidatos a evaluar en su sitio: MapTiler, Stadia Maps, Mapbox, y
     Protomaps (un archivo PMTiles de Uruguay servido por nosotros).

---

## 11 · Después del núcleo: notas para cada spec

- **`veterinarias`**
  - Directorio sobre el mismo componente de mapa del núcleo.
  - Filtro por zona y servicio.
  - *Registrar mi veterinaria*: datos, matrícula, servicios, rango de costos y
    ubicación, con aprobación manual. El punto de un negocio no se redondea:
    es público a propósito.
  - El patrón es la verificación de vendedores de bagayí:
    `bagayi/docs/superpowers/specs/2026-09-13-revision-por-documento-design.md`.
- **`marketplace_servicios`**
  - Paseadores y peluquería móvil, con zona de cobertura por departamento y
    barrio.
  - Aprobación manual y sin pagos.
- **`marketplace_productos`**
  - Checkout propio con MP, en segundo plano.
  - La primera pregunta del spec es **quién vende**.
    - Si es una sola cuenta, alcanza Checkout Pro, sin split ni OAuth.
    - Si son varias tiendas, es split 1:1 con OAuth y `marketplace_fee`, como
      bagayí, con todo su §4 y el §6.89: la plata iba a la cuenta equivocada y
      no fallaba nada.
  - Idea: un *kit de adopción* (lo que Taponto hace con una marca de alimento)
    es la forma de vender sin volver comercial el sitio.
- **Del núcleo, más adelante:**
  - alertas por zona: un mail diario con lo nuevo dentro de un círculo que la
    persona marca en el mapa;
  - búsqueda por dirección;
  - carga en lote para protectoras (el patrón es `bagayi/src/pages/seller/ProductosLote.jsx`).

---

## 12 · Métricas

- **Estrella:** avisos resueltos por mes (volvieron a casa más adoptados).
- **Motor:** porcentaje de avisos compartidos al menos una vez, compartidos por
  canal y clics en Contactar.
- **Mapa:**
  - avistamientos por semana;
  - porcentaje de perdidos con al menos un avistamiento;
  - cuántos de esos terminaron en *volvió a casa*;
  - sesiones que abren el mapa.
- **Marca:** clics a bagayí desde el pie (UTM) y visitas que llegan por links
  compartidos.
