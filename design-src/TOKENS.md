# Tokens de Volvé a casa

> **Estado: propuesta, esperando la aprobación del dueño** (BRIEF §2, paso 1).
> Cuando la apruebe, este archivo pasa a decir «aprobados el <fecha>» y los
> valores van tal cual a `src/styles/tokens.css`.

La fuente de verdad visual es [`Maqueta.html`](Maqueta.html): sus `:root` son
estos tokens. Las medidas de abajo salen de un comando, no de una planilla:

```bash
node design-src/contrastes.mjs
```

Sale con código 1 si algún par usado queda por debajo de su mínimo: 4,5 para
texto (AA) y 3 para un marcador contra la tierra o el agua del mapa (WCAG 1.4.11).

## La marca: frambuesa, no terracota

El brief proponía la terracota `#C2410C` y pedía pasar a frambuesa si se
confundía con PERDIDO o con AVISTADO. Medido con ΔE2000, **la terracota queda a
3,5 de AVISTADO** (lado a lado cuesta distinguirlas) y a 9,1 de PERDIDO. La
separación de usos (marca en acciones, estados en cintas e insignias) no
alcanza: en el mapa el botón *Cerca mío* queda al lado de los avistamientos.
La frambuesa queda a 29,0 y 20,0, y todos sus textos pasan AA.

La maqueta tiene un selector para ver cada pantalla con las dos.

## Tokens

| Token | Valor | Uso |
|---|---|---|
| `--marca` | `#BE185D` | botones, links y navegación, nada más |
| `--marca-hover` | `#9D174D` | hover del botón primario |
| `--marca-tenue` | `#FCE7F3` | botón suave (*Lo vi*), burbujas de las entradas |
| `--marca-fondo` | `#FDF2F8` | opción elegida, fila elegida de la lista del mapa |
| `--marca-sobre-oscuro` | `#F472B6` | pestaña activa sobre la barra espresso |
| `--tinta` | `#231A15` | títulos, barra, pie, grupo del mapa |
| `--texto` | `#6B5E55` | texto corriente |
| `--texto-suave` | `#7A6D65` | texto secundario (el de bagayí no pasaba AA acá) |
| `--fondo` / `--panel` | `#F7F5F0` / `#FFFFFF` | los de bagayí |
| `--borde` / `--borde-fuerte` | `#E8E4DC` / `#D6D0C3` | los de bagayí |
| `--perdido` / `-fondo` | `#B42318` / `#FEE4E2` | lupa |
| `--avistado` / `-fondo` | `#B54708` / `#FEF0C7` | ojo |
| `--encontrado` / `-fondo` | `#175CD3` / `#D1E9FF` | huella |
| `--adopcion` / `-fondo` | `#6941C6` / `#EBE9FE` | corazón |
| `--resuelto` / `-fondo` | `#067647` / `#DCFAE6` | casita; no va al mapa |
| `--whatsapp` / `-texto` | `#25D366` / `#0B3D2E` | sólo el botón de WhatsApp |
| `--mapa-tierra` / `--mapa-agua` | `#F2EFE9` / `#D8E6EC` | contra estos se miden los marcadores |

Tipografía: Archivo (títulos y cifras; su eje de ancho al 68–80 % para cintas,
afiche e imágenes) e Instrument Sans (cuerpo), las de bagayí.

## Medidas

Salida de `node design-src/contrastes.mjs` el 2026-09-28:

### Marca terracota (#C2410C)

| Par | Colores | Contraste | Mínimo | Uso |
|---|---|---|---|---|
| `blanco` / `marca` | #FFFFFF / #C2410C | 5.18 | 4.5 | botón primario |
| `blanco` / `marca-hover` | #FFFFFF / #9A3412 | 7.31 | 4.5 | botón primario, hover |
| `marca` / `fondo` | #C2410C / #F7F5F0 | 4.75 | 4.5 | link sobre el fondo |
| `marca` / `panel` | #C2410C / #FFFFFF | 5.18 | 4.5 | link sobre una tarjeta |
| `marca` / `marca-tenue` | #C2410C / #FFF1E8 | 4.69 | 4.5 | botón suave |
| `marca-sobre-oscuro` / `tinta` | #F97316 / #231A15 | 6.09 | 4.5 | acción sobre la barra oscura |
| `tinta` / `fondo` | #231A15 / #F7F5F0 | 15.67 | 4.5 | títulos |
| `texto` / `fondo` | #6B5E55 / #F7F5F0 | 5.74 | 4.5 | texto |
| `texto` / `panel` | #6B5E55 / #FFFFFF | 6.25 | 4.5 | texto en tarjeta |
| `texto-suave` / `fondo` | #7A6D65 / #F7F5F0 | 4.59 | 4.5 | texto suave |
| `texto-suave` / `panel` | #7A6D65 / #FFFFFF | 5.00 | 4.5 | texto suave en tarjeta |
| `blanco` / `tinta` | #FFFFFF / #231A15 | 17.07 | 4.5 | texto sobre la barra y el pie |
| `perdido` / `perdido-fondo` | #B42318 / #FEE4E2 | 5.45 | 4.5 | insignia PERDIDO |
| `avistado` / `avistado-fondo` | #B54708 / #FEF0C7 | 4.78 | 4.5 | insignia AVISTADO |
| `encontrado` / `encontrado-fondo` | #175CD3 / #D1E9FF | 4.79 | 4.5 | insignia ENCONTRADO |
| `adopcion` / `adopcion-fondo` | #6941C6 / #EBE9FE | 5.55 | 4.5 | insignia EN ADOPCIÓN |
| `resuelto` / `resuelto-fondo` | #067647 / #DCFAE6 | 5.11 | 4.5 | insignia ¡VOLVIÓ A CASA! |
| `blanco` / `perdido` | #FFFFFF / #B42318 | 6.57 | 4.5 | cinta sobre la foto |
| `blanco` / `avistado` | #FFFFFF / #B54708 | 5.43 | 4.5 | cinta sobre la foto |
| `blanco` / `encontrado` | #FFFFFF / #175CD3 | 5.99 | 4.5 | cinta sobre la foto |
| `blanco` / `adopcion` | #FFFFFF / #6941C6 | 6.62 | 4.5 | cinta sobre la foto |
| `blanco` / `resuelto` | #FFFFFF / #067647 | 5.69 | 4.5 | cinta sobre la foto |
| `whatsapp-texto` / `whatsapp` | #0B3D2E / #25D366 | 6.15 | 4.5 | botón Contactar por WhatsApp |
| `perdido` / `mapa-tierra` | #B42318 / #F2EFE9 | 5.73 | 3 | marcador sobre tierra |
| `perdido` / `mapa-agua` | #B42318 / #D8E6EC | 5.15 | 3 | marcador sobre agua |
| `avistado` / `mapa-tierra` | #B54708 / #F2EFE9 | 4.73 | 3 | marcador sobre tierra |
| `avistado` / `mapa-agua` | #B54708 / #D8E6EC | 4.25 | 3 | marcador sobre agua |
| `encontrado` / `mapa-tierra` | #175CD3 / #F2EFE9 | 5.22 | 3 | marcador sobre tierra |
| `encontrado` / `mapa-agua` | #175CD3 / #D8E6EC | 4.69 | 3 | marcador sobre agua |
| `adopcion` / `mapa-tierra` | #6941C6 / #F2EFE9 | 5.77 | 3 | marcador sobre tierra |
| `adopcion` / `mapa-agua` | #6941C6 / #D8E6EC | 5.19 | 3 | marcador sobre agua |
| `grupo` / `mapa-tierra` | #231A15 / #F2EFE9 | 14.88 | 3 | marcador sobre tierra |
| `grupo` / `mapa-agua` | #231A15 / #D8E6EC | 13.37 | 3 | marcador sobre agua |
| `blanco` / `grupo` | #FFFFFF / #231A15 | 17.07 | 4.5 | número del grupo |

| Marca contra | ΔE2000 | Lectura |
|---|---|---|
| perdido #B42318 | 9.1 | se confunden de un vistazo |
| avistado #B54708 | 3.5 | se confunden lado a lado |
| adopcion #6941C6 | 46.2 | distintos |
| resuelto #067647 | 56.3 | distintos |

### Marca frambuesa (#BE185D)

| Par | Colores | Contraste | Mínimo | Uso |
|---|---|---|---|---|
| `blanco` / `marca` | #FFFFFF / #BE185D | 6.04 | 4.5 | botón primario |
| `blanco` / `marca-hover` | #FFFFFF / #9D174D | 7.88 | 4.5 | botón primario, hover |
| `marca` / `fondo` | #BE185D / #F7F5F0 | 5.54 | 4.5 | link sobre el fondo |
| `marca` / `panel` | #BE185D / #FFFFFF | 6.04 | 4.5 | link sobre una tarjeta |
| `marca` / `marca-tenue` | #BE185D / #FCE7F3 | 5.14 | 4.5 | botón suave |
| `marca-sobre-oscuro` / `tinta` | #F472B6 / #231A15 | 6.45 | 4.5 | acción sobre la barra oscura |
| `tinta` / `fondo` | #231A15 / #F7F5F0 | 15.67 | 4.5 | títulos |
| `texto` / `fondo` | #6B5E55 / #F7F5F0 | 5.74 | 4.5 | texto |
| `texto` / `panel` | #6B5E55 / #FFFFFF | 6.25 | 4.5 | texto en tarjeta |
| `texto-suave` / `fondo` | #7A6D65 / #F7F5F0 | 4.59 | 4.5 | texto suave |
| `texto-suave` / `panel` | #7A6D65 / #FFFFFF | 5.00 | 4.5 | texto suave en tarjeta |
| `blanco` / `tinta` | #FFFFFF / #231A15 | 17.07 | 4.5 | texto sobre la barra y el pie |
| `perdido` / `perdido-fondo` | #B42318 / #FEE4E2 | 5.45 | 4.5 | insignia PERDIDO |
| `avistado` / `avistado-fondo` | #B54708 / #FEF0C7 | 4.78 | 4.5 | insignia AVISTADO |
| `encontrado` / `encontrado-fondo` | #175CD3 / #D1E9FF | 4.79 | 4.5 | insignia ENCONTRADO |
| `adopcion` / `adopcion-fondo` | #6941C6 / #EBE9FE | 5.55 | 4.5 | insignia EN ADOPCIÓN |
| `resuelto` / `resuelto-fondo` | #067647 / #DCFAE6 | 5.11 | 4.5 | insignia ¡VOLVIÓ A CASA! |
| `blanco` / `perdido` | #FFFFFF / #B42318 | 6.57 | 4.5 | cinta sobre la foto |
| `blanco` / `avistado` | #FFFFFF / #B54708 | 5.43 | 4.5 | cinta sobre la foto |
| `blanco` / `encontrado` | #FFFFFF / #175CD3 | 5.99 | 4.5 | cinta sobre la foto |
| `blanco` / `adopcion` | #FFFFFF / #6941C6 | 6.62 | 4.5 | cinta sobre la foto |
| `blanco` / `resuelto` | #FFFFFF / #067647 | 5.69 | 4.5 | cinta sobre la foto |
| `whatsapp-texto` / `whatsapp` | #0B3D2E / #25D366 | 6.15 | 4.5 | botón Contactar por WhatsApp |
| `perdido` / `mapa-tierra` | #B42318 / #F2EFE9 | 5.73 | 3 | marcador sobre tierra |
| `perdido` / `mapa-agua` | #B42318 / #D8E6EC | 5.15 | 3 | marcador sobre agua |
| `avistado` / `mapa-tierra` | #B54708 / #F2EFE9 | 4.73 | 3 | marcador sobre tierra |
| `avistado` / `mapa-agua` | #B54708 / #D8E6EC | 4.25 | 3 | marcador sobre agua |
| `encontrado` / `mapa-tierra` | #175CD3 / #F2EFE9 | 5.22 | 3 | marcador sobre tierra |
| `encontrado` / `mapa-agua` | #175CD3 / #D8E6EC | 4.69 | 3 | marcador sobre agua |
| `adopcion` / `mapa-tierra` | #6941C6 / #F2EFE9 | 5.77 | 3 | marcador sobre tierra |
| `adopcion` / `mapa-agua` | #6941C6 / #D8E6EC | 5.19 | 3 | marcador sobre agua |
| `grupo` / `mapa-tierra` | #231A15 / #F2EFE9 | 14.88 | 3 | marcador sobre tierra |
| `grupo` / `mapa-agua` | #231A15 / #D8E6EC | 13.37 | 3 | marcador sobre agua |
| `blanco` / `grupo` | #FFFFFF / #231A15 | 17.07 | 4.5 | número del grupo |

| Marca contra | ΔE2000 | Lectura |
|---|---|---|
| perdido #B42318 | 20.0 | distintos |
| avistado #B54708 | 29.0 | distintos |
| adopcion #6941C6 | 28.0 | distintos |
| resuelto #067647 | 70.5 | distintos |
