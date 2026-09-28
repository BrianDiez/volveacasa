# Volvé a casa · núcleo — hoja de ruta

> **Para agentes:** esto no se ejecuta tarea por tarea: es el índice. Cada fase
> tiene su propio plan detallado en `docs/superpowers/plans/`, que se escribe
> con `superpowers:writing-plans` al terminar la fase anterior (el de cada fase
> usa lo que dejó la anterior). El de la fase 1 ya está:
> [`2026-09-28-fase-1-base.md`](2026-09-28-fase-1-base.md).

**Objetivo:** construir el núcleo del spec aprobado
([`../specs/2026-09-28-nucleo-design.md`](../specs/2026-09-28-nucleo-design.md))
en siete fases, cada una desplegable, sin dejar nunca la suite en rojo.

**Por qué un plan por fase y no uno solo** (lo pide `writing-plans` cuando un
spec abarca varios subsistemas): las siete fases dependen en cadena, y el
código de la 3 se escribe mejor mirando lo que de verdad quedó de la 2. Un plan
único con el código de todo quedaría viejo antes de llegar a la mitad.

---

## Cómo se trabaja cada fase (BRIEF §2, paso 5)

1. Rama propia desde `main` (`fase-N-<nombre>`).
2. Tareas con TDD: el test que falla primero, después el código.
3. Las reglas de la base se prueban de dos formas:
   - **estática**, con Vitest, leyendo las migraciones del disco (el patrón de
     `bagayi/src/lib/siempre-un-admin-base.test.js`): que una migración
     posterior no saque un renglón que importa;
   - **en vivo**, por MCP, con los casos de `supabase/pruebas/<tema>.sql`: cada
     caso corre como un usuario real (`set role` + `request.jwt.claims`) dentro
     de un bloque que se deshace solo, y captura el `SQLERRM`. No deja nada
     escrito en la base (técnica probada el 2026-09-28).
4. Al cerrar la fase: `npm test`, `npm run build` y `npm audit` limpios; cada
   pantalla nueva abierta en el browser pane a 375 y 1280 px; los advisors de
   Supabase sin alertas nuevas; el HANDOFF al día; PR (o merge `--no-ff` si
   todavía no hay cómo abrir PR, HANDOFF §4) y deploy verificado.

---

## Las fases

| Fase | Deja desplegado | Plan |
|---|---|---|
| 1 · Base | el esquema con sus reglas, los polígonos cargados, el bucket, y las rutas de los módulos diciendo «Todavía no está disponible» | [escrito](2026-09-28-fase-1-base.md) |
| 2 · Publicar | login por código, Publicar en 7 pasos con el borrador en el navegador, las fotos achicadas, Mis avisos (renovar, resolver), Cuenta, legales y consentimiento | se escribe al cerrar la 1 |
| 3 · Ver y contactar | feed con filtros en la URL, tarjeta, detalle, `/api/contacto`, denunciar, parecidos, página de protectora, contador | se escribe al cerrar la 2 |
| 4 · Compartir | vista previa por aviso, imagen 1200×630, historia 1080×1920, los tres afiches, el componente `Compartir` con la marca de canal | se escribe al cerrar la 3 |
| 5 · Mapa y avistamientos | MapLibre con OpenFreeMap, «Lo vi», el recorrido en el detalle, el mail a la familia | se escribe al cerrar la 4 |
| 6 · Admin | tablero, moderación (descartar devuelve a activo, mail al ocultar), usuarios, módulos y flags | se escribe al cerrar la 5 |
| 7 · Vencimiento | `pg_cron` cada hora, recordatorios por mail | se escribe al cerrar la 6 |

---

## Cobertura: cada pantalla del spec §3, con su fase, su tarea y su test

| Pantalla | Fase | Tarea | Test |
|---|---|---|---|
| Rutas de módulos apagados | 1 | Registro de módulos y `RutaDeModulo` | `src/lib/modulos.test.js`, `src/pages/ModuloApagado.test.jsx` |
| Publicar (7 pasos, M04–M08) | 2 | Borrador en el navegador; un paso por pantalla; recompensa al marcar «Perdí» | `src/lib/publicar-logica.test.js`, `src/pages/Publicar.test.jsx` |
| Fotos (M05) | 2 | Achicar a ~1600 px y borrar el EXIF en el navegador | `src/lib/fotos-logica.test.js` |
| Email y código (M08) | 2 | Login por OTP de 6 dígitos al final del flujo | `src/lib/sesion-logica.test.js`, `src/components/CodigoPorMail.test.jsx` |
| Mis avisos (M14, M15) | 2 | Lista con estado; renovar; resolver con las preguntas opcionales; la invitación a Historias sólo con el módulo prendido | `src/pages/MisAvisos.test.jsx` |
| Cuenta | 2 | Nombre, WhatsApp por defecto, salir, borrar (anonimiza) | `src/pages/Cuenta.test.jsx`, `supabase/pruebas/cuenta.sql` |
| Ayuda y legales | 2 | Páginas de ayuda, términos y privacidad (textos del dueño) | `src/pages/Legales.test.jsx` |
| Inicio / feed (M01, M18) | 3 | Cuatro entradas, feed con filtros en la URL, tira «Volvieron a casa», contador con umbral | `src/lib/feed-logica.test.js`, `src/pages/Inicio.test.jsx` |
| Tarjeta (5 estados) | 3 | Componente `Tarjeta` con la cinta | `src/components/Tarjeta.test.jsx` |
| Detalle (M03, M20) | 3 | Datos, Contactar por WhatsApp con el aviso contra estafas, Compartir fijo, estado del link (`estado_publico`) | `src/pages/Detalle.test.jsx` |
| Página de protectora | 3 | `/p/<nombre>-<id_corto>` con la insignia y sus avisos | `src/pages/Protectora.test.jsx` |
| Denunciar | 3 | Ventana con los cinco motivos | `src/components/Denunciar.test.jsx` |
| Parecidos | 3 | RPC `parecidos(aviso)` y su bloque en Detalle y Listo | `supabase/pruebas/parecidos.sql`, `src/components/Parecidos.test.jsx` |
| Listo para compartir (M09) | 4 | Vista previa como en WhatsApp y las opciones de compartir | `src/pages/Listo.test.jsx` |
| Vista previa del link | 4 | Función de `/a/:slug` que inyecta las `og:*` | `api/aviso-og.test.js` |
| Imagen y historia (M21, M22) | 4 | `@vercel/og` con la cinta según el estado | `api/imagen.test.js` |
| Afiches A4 (M23) | 4 | Tres afiches, sin tiritas, por portal al `<body>` | `src/components/Afiche.test.jsx` |
| Mapa (M02, M19) | 5 | MapLibre + OpenFreeMap lazy, chips, «Cerca mío», hoja con la lista accesible, `puntos_en_mapa` | `src/lib/mapa-logica.test.js`, `src/pages/Mapa.test.jsx`, `supabase/pruebas/mapa.sql` |
| Lo vi (M10–M13) | 5 | Tres pasos; «cuándo» dentro de las 24 h; «Gracias» | `src/pages/LoVi.test.jsx` |
| Recorrido en el detalle | 5 | Mini mapa con los avistamientos numerados y los vencidos atenuados | `src/components/Recorrido.test.jsx` |
| Admin (M16, M17) | 6 | Tablero, moderación, usuarios, módulos con confirmación | `src/pages/admin/*.test.jsx`, `supabase/pruebas/admin.sql` |

## Cobertura: cada regla del spec, con su fase, su tarea y su test

| Regla (spec) | Fase | Tarea | Test |
|---|---|---|---|
| El punto se redondea por tipo y el exacto no se guarda (§5.3) | 1 | Punto: redondear y ubicar | `supabase/pruebas/territorio.sql`, `src/lib/punto-base.test.js` |
| Zona en tres niveles; fuera de Uruguay se rechaza (§5.3) | 1 | Punto: redondear y ubicar | `supabase/pruebas/territorio.sql` |
| Nadie se cambia rol, verificada ni suspendido; siempre un admin (§5.4) | 1 | Perfiles | `supabase/pruebas/perfiles.sql`, `src/lib/perfiles-base.test.js` |
| El WhatsApp y el rol no son legibles por el público (§5.1.1) | 1 | Perfiles; Avisos (`contactos_aviso`) | `supabase/pruebas/perfiles.sql`, `supabase/pruebas/avisos.sql` |
| Estados de los avisos y quién los cambia (§5.4) | 1 | Avisos | `supabase/pruebas/avisos.sql`, `src/lib/avisos-base.test.js` |
| Edición: el autor no toca oculto, vence_en, autor, tipo ni fechas (§5.4) | 1 | Avisos | `supabase/pruebas/avisos.sql` |
| Renovar en un toque (§2.12) | 1 (base), 2 (botón) | Avisos (`renovar_aviso`); Mis avisos | `supabase/pruebas/avisos.sql`, `src/pages/MisAvisos.test.jsx` |
| Recompensa sólo en perdidos (§2.16) | 1 (base), 2 (botón) | Avisos; Publicar | `supabase/pruebas/avisos.sql`, `src/pages/Publicar.test.jsx` |
| Topes por día y suspendido no publica (§5.4) | 1 | Avisos; Avistamientos | `supabase/pruebas/avisos.sql`, `supabase/pruebas/avistamientos.sql` |
| Avistamiento: `visto_en` dentro de la vigencia, `vence_en` de la base, sólo a perdidos activos (§5.4) | 1 | Avistamientos | `supabase/pruebas/avistamientos.sql` |
| Ocultar por denuncias con los tres resguardos (§5.4) | 1 | Denuncias | `supabase/pruebas/denuncias.sql`, `src/lib/denuncias-base.test.js` |
| El link de un oculto dice «en revisión» (§5.1.1) | 1 (RPC), 3 (pantalla) | Denuncias (`estado_publico`); Detalle | `supabase/pruebas/denuncias.sql`, `src/pages/Detalle.test.jsx` |
| Bucket `fotos` con tope y tipo, carpetas por dueño | 1 | Bucket | `supabase/pruebas/fotos.sql`, `src/lib/fotos-base.test.js` |
| Módulos: registro único y apagado respaldado por la base (§8) | 1 | Configuración y módulos; Registro de módulos | `supabase/pruebas/configuracion.sql`, `src/lib/modulos.test.js` |
| Toda tabla con RLS; todo `security definer` con `search_path`; ningún trigger ejecutable por la API | 1 | Auditoría estática | `src/lib/auditoria-base.test.js` |
| Consentimiento con versión y fecha del servidor | 2 | Consentimientos | `supabase/pruebas/consentimientos.sql` |
| Fotos achicadas sin EXIF (§2.15) | 2 | Fotos en el navegador | `src/lib/fotos-logica.test.js` |
| Lo vigente lo decide la consulta (§5.4) | 3 y 5 | Feed; `puntos_en_mapa` | `supabase/pruebas/feed.sql`, `supabase/pruebas/mapa.sql` |
| `/api/contacto`: sólo avisos activos, límite por IP, `wa.me` con texto (§2.14) | 3 | Contacto | `api/contacto.test.js`, `supabase/pruebas/cuotas.sql` |
| Funciones de Vercel en `gru1` | 3 | Contacto (la primera de `/api`) | `api/funciones-vercel.test.js` |
| Métricas con `registrar_evento`, sin INSERT directo (§7) | 3, 4 y 5 | Eventos | `supabase/pruebas/eventos.sql` |
| Mail a la familia al ligar un avistamiento (§5.4) | 5 | Webhook de avistamientos | `api/avistamiento-mail.test.js` |
| Descartar denuncias devuelve a activo; mail al admin al ocultar (§5.4) | 6 | Moderación | `supabase/pruebas/admin.sql`, `api/aviso-admin.test.js` |
| Vencidos marcados por cron y recordatorios (§5.4) | 7 | Vencimiento | `supabase/pruebas/vencimiento.sql`, `api/tareas.test.js` |

## Lo que queda fuera del núcleo, con su spec aparte

`redes_automaticas` (§9), `historias` (§8.1), `veterinarias`,
`marketplace_servicios` y `marketplace_productos`.
