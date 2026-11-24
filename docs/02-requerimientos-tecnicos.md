# 02 — Requerimientos técnicos

> Estado: aprobado para la v1 (prototipo). Fecha: 2026-11-24.
> Implementa los [requerimientos funcionales](01-requerimientos-funcionales.md). Cada elección está justificada en [decisiones/](decisiones/README.md).

## 1. Principios

- **RT-01. Costo casi cero.** El único gasto previsto es el dominio, unos 10–15 USD al año. Todo lo demás usa planes gratuitos.
- **RT-02. Un solo desarrollador.** Se elige siempre la opción con menos piezas que mantener: sin servidores propios, sin base de datos y con pocas dependencias.
- **RT-03. Estático y ligero.** HTML generado en la compilación. Solo llevan JavaScript las partes interactivas: reproductor, animaciones, buscador, visor de imágenes y CMS.
- **RT-04. Durabilidad.** Sin dependencias de servicios de pago. El contenido está en formatos abiertos (Markdown/YAML) y los originales se preservan en Internet Archive.
- **RT-05. Reutilización.** El mismo proyecto genera el sitio web y, más adelante, la app Android.

## 2. Arquitectura

```
                    ┌──────────────── GitHub (repo AMADEU) ───────────────┐
 Editor (admin) ──► │  Sveltia CMS (/admin) ── commit ──► src/content/*.md │
   │                │                                     src/content/*.yml│
   │ sube audio /   │  GitHub Actions: validar → build → deploy            │
   │ imágenes       └───────────────────────────┬──────────────────────────┘
   ▼                                            ▼
 Cloudflare R2  ◄── URLs en el contenido ── Cloudflare Pages (sitio estático + PWA)
 (audio, imágenes web)                          │
                                                ├─► YouTube (videos, nocookie, al clic)
 Internet Archive (originales TIFF/WAV/video)  ◄┘   (enlazados desde la ficha)
 Sveltia CMS Additions (Cloudflare Worker): usuario/contraseña del admin, credenciales R2
 GoatCounter: estadísticas sin cookies, panel público
```

## 3. Stack

| Capa | Elección | Notas |
|---|---|---|
| Framework | **Astro** (salida `static`) | Colecciones de contenido con esquemas Zod; JavaScript solo en islas. |
| Lenguaje | **TypeScript** (estricto) | Todo el código y los nombres del esquema en inglés. |
| Interactividad | TypeScript sin framework / Web Components | El reproductor y las animaciones no necesitan React. Si un componente lo justifica, se evalúa Preact. |
| Navegación persistente | Astro View Transitions + `transition:persist` | Mantiene vivo el reproductor al cambiar de página (RF-47). |
| PWA | `@vite-pwa/astro` (Workbox) | Manifiesto, instalación y caché sin conexión (RF-53, RF-54). |
| Buscador | **Pagefind** | Índice estático generado en la compilación, sin servidor (RF-35). |
| Visor de imágenes | PhotoSwipe (MIT) o equivalente ligero | Zoom y desplazamiento (RF-27). |
| Animaciones | SVG + CSS / Web Animations API | Sin librerías pesadas ni After Effects (RF-50). |
| CMS | **Sveltia CMS** + **Sveltia CMS Additions** | Ver §6. |
| Hosting | **Cloudflare Pages** | Plan gratuito. |
| Medios | **Cloudflare R2** | Audio e imágenes web. Ver §5. |
| Video | **YouTube** (canal de la Fundación) | Incrustado con `youtube-nocookie.com`, cargado al hacer clic. |
| Preservación | **Internet Archive** | Originales en máxima calidad. |
| Estadísticas | **GoatCounter** | Sin cookies, panel público (RF-62). |
| CI/CD | **GitHub Actions** | Ver §9. |
| Gestor de paquetes | npm | Por simplicidad. |

## 4. Modelo de contenido

### 4.1 Principios

- **RT-10. El repositorio es la base de datos.** El contenido son archivos en `src/content/` validados por esquemas Zod en la compilación. No hay base de datos ni servidor.
- **RT-11. Identidad permanente.** Cada entrada tiene un `id` que **nunca cambia** y no depende del título ni del orden (RF-58). Las relaciones entre colecciones usan siempre `id`, nunca el título ni el slug.
  - Las entradas nuevas creadas en el admin reciben un ID corto generado automáticamente.
  - La carga inicial usa IDs legibles con prefijo, por ejemplo `sys-t-0012` para un texto de *Sangre y Sueño*.
- **RT-12. Slug separado del ID.** El slug de la URL se deriva del título y puede cambiar. El enlace estable es `/id/<id>/` (ver §7.2).
- **RT-13. Orden explícito.** Las secciones y los textos tienen un campo `order` editable. Nunca se ordena alfabéticamente por defecto.
- **RT-14. Nombres en inglés.** Los campos y las carpetas van en inglés; las etiquetas que ve el editor en el admin van en español.

### 4.2 Colecciones

```
src/content/
├── works/        obra (YAML)        — Sangre y Sueño, obras «próximamente»
├── texts/        texto (Markdown)   — poemas y canciones; el cuerpo es el texto
├── recordings/   grabación (YAML)   — audio en R2
├── artworks/     imagen (YAML)      — dibujos, acuarelas, pinturas, fotos, documentos; imagen en R2
├── videos/       video (YAML)       — YouTube
├── people/       persona (YAML)     — créditos (músicos, ingenieros, editores)
└── pages/        páginas (Markdown) — biografía, presentación, créditos del sitio
src/data/
└── timeline.yml  cronología
```

Campos principales. `ref(x)` es una referencia por `id` a la colección `x` y `[]` indica una lista.

**`works`**: `id`, `title`, `subtitle`, `slug`, `status` (`published` | `upcoming` | `draft`), `year`, `description`, `cover` (artwork ref), `sections[]` (`{ id, title, slug, order, description }`), `order`.

**`texts`**:
- Identificación: `id`, `title`, `altTitles[]` (`{ title, source }`), `slug`.
- Ubicación: `work` (ref works), `section` (id de la sección dentro de la obra), `order`.
- Contenido: `kind` (`poem` | `song`), cuerpo Markdown (el texto), `criticalNotes` (Markdown opcional), `facsimile[]` (artwork ref).
- Fuente: `edition` (`{ name, year, publisher, pages }`), `provisional` (booleano).
- Medios relacionados: `primaryRecording` (ref recordings), `illustrations[]` (ref artworks).
- Derechos: `rights`, `license`.

**`recordings`**:
- Identificación: `id`, `title`, `altTitles[]`, `texts[]` (ref texts; puede estar vacío, por ejemplo en una entrevista).
- Tipo: `kind` (`song` | `recital` | `reading` | `interview` | `lecture` | `instrumental`).
- Fecha y procedencia: `date`, `collection` (por ejemplo «LP Discolandia 1984», «Grabación casera 1993–95», «Recital Goethe-Institut 1981»), `venue`.
- Créditos: `performers[]`, `credits[]` (`{ person: ref people, role }`).
- Audio: `durationSeconds`, `audioUrl` (R2), `originalUrl` (Internet Archive).
- Otros: `trackNumber`, `notes`, `rights`, `license`.

**`artworks`**:
- Identificación: `id`, `inventoryCode` (por ejemplo `ADLC-01`), `title`, `inscription` (versos manuscritos).
- Descripción: `kind` (`drawing` | `watercolor` | `painting` | `photo` | `document` | `poster`), `technique`, `dimensions`, `date`, `place`, `series`.
- Hojas y paneles: `sheet` (ref artworks, la hoja a la que pertenece un panel), `panels[]` (ref artworks).
- Relaciones: `texts[]` (ref texts que ilustra).
- Imagen: `imageUrl` (WebP en R2), `width`, `height`, `originalUrl` (Internet Archive), `sourceFile` (nombre del archivo en el archivo digitalizado).
- Otros: `rating` (1–3, del inventario), `animated` (booleano), `rights`, `license`, `alt` (texto alternativo, obligatorio).

**`videos`**:
- Identificación: `id`, `title`, `series` (por ejemplo «Los Caminos del Hombre»), `episode`.
- Datos: `date`, `durationSeconds`, `description`, `credits[]`.
- Medios: `youtubeId`, `thumbnailUrl`, `originalUrl` (Internet Archive), `texts[]` (para futuros videoclips de poemas).
- Derechos: `rights`, `license`.

**Campos comunes de derechos**:
- `rights`: `cleared` | `pending` | `restricted`. **Solo se publica `cleared`** (RF-57).
- `rightsHolder`: el titular de los derechos.
- `license`: `all-rights-reserved` por defecto, o un código CC.

### 4.3 Correspondencia con Dublin Core (RF-41)

| Dublin Core | Campo |
|---|---|
| `dc:identifier` | `id`, `inventoryCode` |
| `dc:title` / `dcterms:alternative` | `title` / `altTitles` |
| `dc:creator` | Marcelo de Urioste (implícito) + `credits` |
| `dc:date` | `date` |
| `dc:type` | `kind` |
| `dc:format` / `dcterms:extent` | `technique`, `dimensions`, `durationSeconds` |
| `dc:description` | `description`, `inscription` |
| `dc:source` | `edition`, `collection`, `sourceFile` |
| `dc:relation` / `dcterms:isPartOf` | `texts`, `work`, `sheet` |
| `dc:rights` | `rights`, `rightsHolder`, `license` |

Cada ficha incluye además metadatos `schema.org` en JSON-LD (`CreativeWork`, `MusicRecording`, `VisualArtwork`, `VideoObject`) para buscadores.

## 5. Medios

- **RT-20. GitHub solo guarda código y texto.** Los motivos:
  - GitHub bloquea archivos de más de 100 MB y recomienda repos de menos de 1 GB.
  - Cloudflare Pages no acepta archivos de más de 25 MiB, y los recitales pesan hasta unos 45 MB.
- **RT-21. Audio en R2.**
  - Los MP3 se sirven tal cual (128 kbps, 44,1 kHz), sin recodificar.
  - El audio de todo el archivo ocupa unos 400 MB, dentro de los 10 GB gratuitos.
  - R2 no cobra por tráfico de salida.
- **RT-22. Imágenes en R2.**
  - Versión web en **WebP de unos 2400 px** en el lado mayor, más miniaturas generadas en la compilación o con transformaciones.
  - Los TIFF maestros (de 11 a 342 MB) **no** se publican.
- **RT-23. Optimización al subir** (RF-67). La intención es que Sveltia convierta la imagen en el navegador a WebP de unos 2400 px antes de enviarla a R2.
  - **Falta verificar** que la transformación funcione con el almacenamiento R2.
  - Si no funciona, una GitHub Action detecta imágenes nuevas sin optimizar en R2 y las convierte con libvips/sharp.
- **RT-24. Videos en YouTube**, en el canal de la Fundación.
  - Se incrustan con `youtube-nocookie.com`, detrás de una fachada (miniatura + botón) que carga el iframe solo al hacer clic (RF-31).
  - Antes de subir, se eliminan los duplicados: «America Precolombina» aparece 8 veces.
- **RT-25. Preservación en Internet Archive.**
  - Los originales (TIFF, MP3/WAV maestros y video) se suben a una colección de la Fundación.
  - La ficha guarda `originalUrl`.
  - En la v1 la subida la hace la Fundación (o el desarrollador en la carga inicial), fuera del CMS.
- **RT-26. Estructura de R2.** Un bucket `amadeu-media` con prefijos `audio/`, `images/` y `thumbs/`.
  - Los nombres de archivo van normalizados: minúsculas, sin acentos ni espacios.
  - En el prototipo se usa la URL pública `r2.dev`, que tiene límite de tráfico y es solo para pruebas. En producción se usa un subdominio propio, por ejemplo `media.marcelodeurioste.org`.

## 6. Panel de administración

- **RT-30. Sveltia CMS** servido como SPA estática en `/admin` (`public/admin/index.html` + `config.yml`).
- **RT-31. Autenticación con Sveltia CMS Additions** (Cloudflare Worker gratuito).
  - El editor entra con **usuario y contraseña** creados por el administrador, sin cuenta de GitHub.
  - Las credenciales de R2 las configura el administrador una sola vez; el editor nunca las ve.
- **RT-32. Subida directa a R2** con `media_libraries.cloudflare_r2`:
  - un token de R2 limitado a ese bucket, con lectura y escritura de objetos;
  - una política CORS que permita `GET`, `PUT`, `DELETE` y `HEAD` desde el origen del sitio, exponiendo `ETag`.
- **RT-33. Interfaz en español** (`es`). Todas las etiquetas, ayudas y mensajes de los campos están en español.
- **RT-34. Relaciones** con campos `relation` de Sveltia que guardan `id`, y `reference()` en los esquemas de Astro.
- **RT-35. Publicación directa** (RF-70). Sin flujo editorial: cada guardado es un commit en `main` que dispara el despliegue.
- **RT-36. Compatibilidad con Astro.** Se sigue la guía oficial de Sveltia para Astro:
  - las carpetas de las colecciones coinciden con `base` del loader `glob()`;
  - `omit_empty_optional_fields: true`;
  - las URLs de R2 se validan con `z.string().url()`, no con `image()`.

## 7. Rutas y URLs

### 7.1 Rutas públicas (en español)

| Ruta | Página |
|---|---|
| `/` | Inicio |
| `/obras/` | Listado de obras |
| `/sangre-y-sueno/` | Obra; destino del QR (RF-60) |
| `/sangre-y-sueno/<slug-texto>/` | Poema o canción |
| `/escuchar/` | Todas las grabaciones |
| `/galeria/` · `/galeria/<slug>/` | Galería · ficha de imagen |
| `/leer/` | Todos los textos |
| `/videos/` · `/videos/<slug>/` | Videos · ficha de video |
| `/marcelo/` | Biografía y cronología |
| `/buscar/` | Buscador |
| `/admin/` | Panel de administración (sin indexar) |

**Obras en la raíz** ([decisión 0038](decisiones/0038-obras-en-la-raiz.md)): cada obra usa su propio slug directamente después del dominio (`/<slug-obra>/`), no bajo `/obras/`. Las obras futuras siguen el mismo patrón. Por eso:

- **RT-15.** Los slugs de obra **no pueden coincidir** con las rutas reservadas del sitio: `obras`, `escuchar`, `galeria`, `leer`, `videos`, `marcelo`, `buscar`, `admin`, `id`. La CI rechaza la publicación si hay coincidencia.

### 7.2 Enlaces permanentes (RT-12, RF-58)

[Decisión 0037](decisiones/0037-enlace-permanente-por-id.md), que reemplaza el historial de slugs de la decisión 0022.

- El slug de una pieza se deriva de su título y **puede cambiar**. Si cambia, la URL anterior deja de existir; **no** se guarda historial de slugs.
- Para citar y enlazar de forma estable existe la ruta permanente **`/id/<id>/`**, que siempre lleva a la URL actual de la pieza. En cada compilación se genera el archivo `_redirects` de Cloudflare Pages con una línea por pieza (`/id/<id>/ → URL actual`, 302), a partir del contenido actual, sin historial ni commits automáticos.
- La ficha de cada pieza muestra su enlace permanente en «cómo citar».
- Si más adelante hace falta conservar URLs antiguas, se puede agregar un historial de slugs sin rehacer nada.

### 7.3 QR

- Destino previsto: `https://marcelodeurioste.org/sangre-y-sueno/?ref=qr`, con el dominio por confirmar.
- La ruta `/sangre-y-sueno/` se considera **contrato permanente** (RF-61).
- **El QR se genera solo cuando el desarrollador lo solicite.** Cuando llegue ese momento: formato vectorial (SVG/PDF) para la imprenta, con corrección de errores nivel M o superior.

## 8. PWA, rendimiento, accesibilidad, idiomas

- **RT-40. PWA** (RF-53, RF-54):
  - manifiesto con nombre, íconos derivados del logo y colores de la identidad;
  - service worker con Workbox que **precachea** la estructura, las páginas de texto y el índice de Pagefind;
  - las imágenes se cachean al visitarlas (*stale-while-revalidate*);
  - el audio y el video **no** se cachean.
- **RT-41. Presupuesto de rendimiento:** páginas de texto con menos de 100 KB de JS, Lighthouse Performance ≥ 90 en móvil, imágenes con `loading="lazy"`, dimensiones explícitas y `srcset`.
- **RT-42. Accesibilidad WCAG 2.2 AA** (RF-56):
  - `alt` obligatorio en el esquema de `artworks`;
  - controles del reproductor accesibles por teclado y con ARIA;
  - `prefers-reduced-motion` desactiva las animaciones;
  - foco visible y contraste verificado.
- **RT-43. Internacionalización** (RF-55): los textos de la interfaz se centralizan en `src/i18n/es.ts`, sin texto fijo en los componentes. El enrutamiento i18n de Astro se activa cuando se agregue inglés.
- **RT-44. SEO:** sitemap, metadatos Open Graph por pieza, JSON-LD y `robots.txt` que excluye `/admin/`.

## 9. Calidad, CI/CD y despliegue

- **RT-50. Pipeline en GitHub Actions** en cada push a `main`. Si cualquier paso falla, **no se publica** y el sitio anterior sigue en línea (RF-71). Los pasos:
  1. `astro check` (tipos) + validación de esquemas del contenido.
  2. Comprobación de integridad: toda referencia por `id` existe; todo texto publicado tiene obra y sección válidas; ningún slug de obra usa una ruta reservada (RT-15).
  3. `astro build` + índice Pagefind + `_redirects` de los enlaces `/id/<id>/`.
  4. Revisión de enlaces rotos internos. Las URLs de R2 se comprueban con `HEAD`.
  5. Despliegue a Cloudflare Pages.
- **RT-51. Filtro de publicación:** se excluyen de la compilación las entradas con `rights` ≠ `cleared` o con obra en `draft`. Las obras `upcoming` solo muestran su tarjeta.
- **RT-52. Entornos:**
  - **Prototipo:** `*.pages.dev` + `r2.dev`.
  - **Producción:** dominio de la Fundación + `media.` en R2. Las URLs de medios dependen de una variable de configuración (`PUBLIC_MEDIA_BASE_URL`), así que el cambio de dominio no toca el contenido.
- **RT-53. Sin suite de pruebas pesada.** Se agregan pruebas unitarias solo para la lógica no trivial: enlaces permanentes, ordenamiento y la cola del reproductor.

## 10. Carga inicial del contenido (RF-59)

Scripts en `scripts/` (TypeScript, ejecutados con `tsx`), que se corren una vez en local:

1. **Textos.** Extraer el texto del PDF del Tomo I (págs. 11–98 cancionero; págs. 103–239 relatos poéticos) con Ghostscript `txtwrite`, segmentar por poema y generar `texts/*.md` con `provisional: true`, `edition` y `altTitles`.
2. **Grabaciones.** Leer los MP3, obtener la duración con `ffprobe`, normalizar nombres, subir a R2 y generar `recordings/*.yml`. Se relacionan con los textos por coincidencia aproximada de título, que luego se revisa a mano.
3. **Imágenes.** Convertir los TIFF a WebP de unos 2400 px y miniaturas con libvips, subir a R2 y generar `artworks/*.yml` con `sourceFile`. Los `inventoryCode` y las relaciones con textos se completan a mano o los completa la Fundación.
4. **Videos.** Generar `videos/*.yml` a partir del inventario. El `youtubeId` se completa tras subir los videos.

Los scripts leen el archivo digitalizado desde una ruta configurable fuera del repo y **nunca** se versionan medios.

## 11. Cuentas y propiedad

| Servicio | Titular |
|---|---|
| Repositorio GitHub | Desarrollador (por ahora) |
| Cloudflare (dominio, Pages, R2, Workers) | Fundación (correo de la Fundación); desarrollador como miembro administrador |
| YouTube | Fundación |
| Internet Archive | Fundación |
| GoatCounter | Fundación |

Las credenciales y secretos (tokens de R2, de Cloudflare y del Worker de Additions) viven en los *secrets* de GitHub Actions y en la configuración de Cloudflare, **nunca** en el repo.

## 12. Costos estimados

| Concepto | Costo |
|---|---|
| Dominio `.org` en Cloudflare Registrar | ≈ 10–15 USD/año |
| Cloudflare Pages, Workers, R2 (≤ 10 GB) | 0 |
| GitHub, GitHub Actions (repo público) | 0 |
| YouTube, Internet Archive, GoatCounter | 0 |
| R2 por encima de 10 GB | 0,015 USD/GB-mes |

## 13. Aplicación Android (futuro)

- **RT-60.** Será el **mismo proyecto Astro** compilado con un filtro de obra (`BUILD_WORK=sangre-y-sueno`) que incluye solo esa obra y sus piezas relacionadas, empaquetado con **Capacitor** como app Android.
- **RT-61.** Los textos, fichas e imágenes van **dentro** de la app para funcionar sin conexión. El audio se sigue sirviendo desde R2; la descarga sin conexión se evaluará entonces.
- **RT-62.** Para no cerrar esa puerta, la v1 evita APIs que solo funcionan en un servidor web: sin funciones del servidor en el sitio público y con rutas relativas a una base configurable. Los enlaces `/id/<id>/` dependen de `_redirects` de Cloudflare; en la app se resuelven dentro de la propia app.

## 14. Pendientes técnicos a verificar en la implementación

- Que la transformación de imágenes de Sveltia funciona con almacenamiento R2 (RT-23).
- Que Sveltia CMS Additions es compatible con el almacenamiento R2 compartido.
- Que el patrón de *transition:persist* mantiene el audio sin cortes en iOS Safari.
- Que existe el dominio `marcelodeurioste.org` y está libre.
