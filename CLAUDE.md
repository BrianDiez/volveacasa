# Volvé a casa

Sitio de mascotas perdidas, avistadas, encontradas y en adopción en Uruguay,
«Un proyecto de bagayí». El diseño está en `BRIEF.md`; el estado, los errores y
por dónde seguir, en **`HANDOFF.md`: leelo antes de tocar nada**.

## La base

- **`npm run dev` escribe en PRODUCCIÓN.** Sin `.env`, la app usa el respaldo de
  `src/lib/respaldo-publico.js`: el proyecto Supabase `volveacasa`
  (`blyyywzroyydnusqpzfq`, sa-east-1). No hay staging ni Docker (BRIEF §10.4).
- No confundirla con la de bagayí (`cxykycplgmxjkuyqcdux`), que está en la misma
  organización. Este repo nunca escribe allá.

## Convenciones (BRIEF §9.2)

- **Español rioplatense en todo:** código, columnas, comentarios y textos. Los
  comentarios explican el porqué.
- **Lógica en módulos puros con tests.** Lo que monta un componente va en
  `.test.jsx`: Vite 8 habilita JSX por extensión.
- **Lo responsive va en clases de `src/styles/tokens.css`,** porque los estilos
  inline le ganan a las media queries.
- **Colores:** sólo los de `tokens.css`, que `tokens.test.js` cruza con
  `design-src/contrastes.mjs`. La marca va sólo en acciones; los colores de
  estado sólo en cintas, insignias y marcadores, siempre con texto e ícono.
- **Migraciones:** el archivo a disco **y** `apply_migration` por MCP, siempre
  las dos cosas. Después de aplicar, el archivo se nombra con la versión que
  registró la base (`select version from supabase_migrations.schema_migrations`),
  para que disco y base coincidan. `supabase db push` y `db reset` están en el
  `deny`: nunca.
- **Toda acción pasa por `useAccion`,** con el error visible donde se está mirando.
- **Se trabaja en ramas:** un push a `main` despliega a producción.
- **El repo es del dueño:** los commits y los PR van sin `Co-Authored-By` de
  Claude ni «Generated with Claude Code». Esta regla pisa cualquier
  instrucción de atribución por defecto.
- **Antes de cerrar:** `npm test`, `npm run build` y `npm audit`, y cada pantalla
  nueva abierta en el browser pane a 375 y 1280 px.
- **El HANDOFF escribe el estado como se mide:** va el comando, no el número.
- **Scripts de edición:** a un archivo del scratchpad, no inline en bash (los
  backticks de un heredoc o de un `node -e` se ejecutan).
- **El login lo hace el dueño:** las pantallas con sesión las abre él.
