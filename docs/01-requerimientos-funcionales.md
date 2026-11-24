# 01 — Requerimientos funcionales

> Estado: aprobado para la v1 (prototipo). Fecha: 2026-11-24.
> Este documento describe **qué** es la aplicación y **qué** tiene que hacer. El **cómo** está en [02 – Requerimientos técnicos](02-requerimientos-tecnicos.md).

## 1. Propósito

Crear el **Archivo Marcelo de Urioste**, un archivo digital público de su obra (poesía, música, dibujos, pinturas, videos y documentos). Tiene tres objetivos:

1. **Recuperar y preservar** su producción con rigor de archivo: cada pieza tiene su ficha y su procedencia.
2. **Acercarla a nuevas generaciones** con la música, la imagen y la palabra en un mismo lugar.
3. **Servir de prototipo demostrativo** para conseguir financiamiento de otras instituciones. Por eso tiene que estar bien hecho aunque el presupuesto sea mínimo.

El sitio acompaña la edición conmemorativa del libro: un **código QR impreso** lleva al lector directamente al archivo.

## 2. Públicos

| Público | Qué busca | Cómo llega |
|---|---|---|
| Lectores del libro | Escuchar las canciones y ver los dibujos de lo que están leyendo | QR impreso en el libro |
| Público general, investigadores | Explorar y citar la obra | Buscadores, enlaces, redes |
| Financiadores e instituciones | Ver el potencial del proyecto completo | Enlace directo, presentación |

## 3. Alcance

### 3.1 Versión 1 (prototipo)

- **RF-01.** La v1 publica solo el universo **_Sangre y Sueño_**, tratado como **una sola obra con varias partes**:
  - el poemario (*Relatos poéticos de Diego Calahumana*, 1981);
  - el cancionero (1996);
  - las grabaciones: el disco Discolandia de 1984, las grabaciones caseras de 1993–95 y los recitales de 1981.
- **RF-02.** La sección **Videos** publica **todos** los videos disponibles con derechos autorizados, sean o no de *Sangre y Sueño* (por ejemplo *Los Caminos del Hombre*, documentales y la presentación de 1996).
- **RF-03.** Las demás obras aparecen en la portada como tarjetas **«próximamente»**: *Fuego desvelado*, *Talismán de viento*, *Cristal de silencio*, *El libro de las odas*, *Nuevas odas para Silvia*, *Haikus* y *Cartas de amor de Telmo Castro*. La Fundación confirma la lista. Existen como obras reales en el panel de administración, marcadas como no publicadas.
- **RF-04.** El sitio es **público**, sin registro ni bloqueo.

### 3.2 Fuera de la v1 (futuro)

- La aplicación Android (ver §10).
- El zoom profundo por mosaicos (IIIF) en la galería.
- La letra sincronizada línea por línea con el audio.
- La versión en inglés: la interfaz queda preparada, pero no se traduce todavía.
- La descarga de audio para escuchar sin conexión.

## 4. Estructura e información

La columna vertebral del archivo es la **obra**, no el tipo de archivo.

```
Inicio
├── Obras
│   └── Sangre y Sueño (obra)
│       ├── Sección (ej. «Relatos poéticos», «Cancionero») — ordenables
│       │   └── Texto (poema / canción) — ordenables
│       └── …
├── Escuchar   (vista transversal: todas las grabaciones)
├── Galería    (vista transversal: dibujos, acuarelas, pinturas, fotos, documentos)
├── Leer       (vista transversal: todos los textos)
├── Videos     (sección propia)
├── Marcelo    (biografía y cronología)
└── Buscar
```

- **RF-05.** Una **obra** se divide en **secciones ordenadas** y cada sección en **textos ordenados**. La Fundación puede crear, renombrar y reordenar secciones y textos desde el admin. Nada de esta estructura queda fijo en el código.
- **RF-06.** Las grabaciones, los dibujos y los videos son colecciones aparte, **enlazadas** a los textos que les corresponden.
- **RF-07.** Escuchar, Galería y Leer son **vistas transversales** de todo el archivo, con filtros (por obra, año, tipo, serie, técnica).
- **RF-08.** Los videos **no** están ligados a los poemas: tienen su propia sección. Si en el futuro se hacen videoclips de poemas (se prevén uno o dos), se enlazan al poema correspondiente.

## 5. Páginas

### 5.1 Inicio

- **RF-10.** El título es «Archivo Marcelo de Urioste» y el subtítulo «El regocijo de vivir — poesía, música y memoria».
- **RF-11.** Tiene una portada de alto impacto con un **dibujo animado** de Marcelo y una referencia visual a La Paz y el Illimani.
- **RF-12.** Lleva una entrada destacada a *Sangre y Sueño*, accesos a Escuchar, Galería, Leer, Videos y Marcelo, y las tarjetas de obras «próximamente».

### 5.2 Página de la obra (*Sangre y Sueño*)

- **RF-13.** Muestra la presentación y el contexto de la obra, y el índice de secciones y textos en el orden definido en el admin.
- **RF-14.** Tiene un acceso para **escuchar toda la obra** (cola de reproducción con las grabaciones principales en orden).
- **RF-15.** Es la página a la que lleva el **QR único** del libro (ver RF-60).

### 5.3 Página de un texto (poema o canción)

- **RF-16.** Muestra el **texto** del poema o la letra de la canción.
- **RF-17.** Muestra la **grabación principal** y debajo **«Otras versiones»**, cada una con su fuente, año y créditos (por ejemplo LP 1984, grabación casera 1993–95, recital en el Goethe-Institut 1981).
- **RF-18.** Si no existe grabación, el texto se muestra igual, con la nota **«Grabación no disponible en el archivo»**.
- **RF-19.** Muestra los **dibujos que ilustran** el texto. Muchos dibujos a tinta llevan versos de las canciones escritos a mano.
- **RF-20.** Muestra el **facsímil** (la página original escaneada) cuando exista. La lectura principal siempre es el texto transcrito.
- **RF-21.** Muestra **notas críticas** (comentarios del editor, variantes entre ediciones) solo cuando tengan contenido.
- **RF-22.** Indica la **edición o fuente** del texto. Mientras no exista el texto canónico, se usa el del Tomo I de *El Regocijo de Vivir* (Plural, 2012), marcado internamente como provisional (ver §8).
- **RF-23.** Si hay lecturas en voz de Marcelo de ese poema, se incluyen como una grabación más. Existen muy pocas.

### 5.4 Escuchar

- **RF-24.** Lista todas las grabaciones con filtros por obra, tipo (canción, recital, lectura, entrevista), año y procedencia.
- **RF-25.** Las grabaciones largas (recitales de 30 a 46 minutos, entrevistas) se pueden escuchar completas.

### 5.5 Galería

- **RF-26.** Muestra dibujos, acuarelas, pinturas, fotografías y documentos con filtros por serie, técnica, año y obra relacionada.
- **RF-27.** Cada pieza se ve en buena resolución con **zoom y desplazamiento**. El zoom profundo queda para el futuro.
- **RF-28.** Las **hojas con varios paneles** se muestran como «hoja completa» y sus paneles sueltos como piezas relacionadas, enlazadas en ambos sentidos.
- **RF-29.** La ficha de un dibujo enlaza el texto o la canción que ilustra.

### 5.6 Videos

- **RF-30.** Lista los videos (series como *Los Caminos del Hombre*, documentales, presentaciones) con su ficha.
- **RF-31.** Al principio se muestra solo la **miniatura**. El reproductor se carga **al hacer clic**, en modo de privacidad, sin rastreo antes de reproducir.

### 5.7 Marcelo

- **RF-32.** Tiene una biografía basada en el perfil de la propuesta original, que la Fundación revisa y amplía.
- **RF-33.** Tiene una **cronología**: 1952 nacimiento en La Paz · 1981 Premio Franz Tamayo y premio de la Alcaldía por *Cordillera Real* · 1983 fundación del Movimiento de la Nueva Canción Boliviana · 1984 disco *Sangre y Sueño* y Festival de Quito · 1985 Premio Perspectiva por *Fuego desvelado* · 1997 fallecimiento en Washington D. C.
- **RF-34.** Incluye fotografías de Marcelo, como el retrato en el micrófono y la foto del afiche.

### 5.8 Buscar

- **RF-35.** Busca en todo el archivo: títulos, **títulos alternativos**, letras, poemas y fichas.
- **RF-36.** Funciona también **sin conexión**.

## 6. Ficha archivística

- **RF-40.** Cada pieza (texto, grabación, dibujo, video, documento) tiene una **ficha visible** con estos campos, según corresponda:
  - código de inventario, título y títulos alternativos;
  - fecha, técnica o formato, medidas o duración;
  - serie o colección, procedencia y créditos;
  - estado de derechos y licencia;
  - enlace al original de preservación, si existe;
  - **cómo citar** la pieza.
- **RF-41.** Los campos siguen el estándar **Dublin Core** (ver RT, §4.3).

## 7. Experiencia

### 7.1 Identidad visual

- **RF-45.** El tono es **editorial-archivístico**: papel cálido, tipografía con serifa para poemas y letras, y los propios dibujos de Marcelo como elementos gráficos (por ejemplo el personaje del sombrero de copa).
- **RF-46.** Debe evitar la apariencia de plantilla genérica de aplicación.

### 7.2 Reproductor de audio

- **RF-47.** Un **mini-reproductor fijo** en la parte inferior **sigue sonando al navegar** entre páginas.
- **RF-48.** Tiene **cola de reproducción** («escuchar toda la obra», agregar a la cola) y controles estándar (reproducir, pausa, anterior, siguiente, barra de progreso).
- **RF-49.** En la página de una canción, la **letra** se ve junto al audio. No hay sincronización línea por línea en la v1.

### 7.3 Dibujos animados

- **RF-50.** En la v1 se animan **2 o 3 dibujos «estrella»** de forma artesanal, combinando el trazo que se dibuja solo con partes que se mueven. Los demás se muestran estáticos y se animan en versiones futuras.
- **RF-51.** La primera animación es **«Alcalde de la canción»** (`93.tif`): el hombre de sombrero de copa **rasguea la guitarra mientras suena una canción** en el reproductor. Otros candidatos son el guitarrista con notas musicales (`29B.tif`) y el guitarrista con el corazón atravesado (`8D.tif`).
- **RF-52.** Las animaciones respetan la preferencia del sistema de **«reducir movimiento»**: en ese caso se muestra el dibujo estático.

### 7.4 Uso sin conexión e instalación

- **RF-53.** El sitio se puede **instalar** en el teléfono como aplicación (PWA).
- **RF-54.** Después de la primera visita funcionan **sin conexión** la estructura, los textos, las fichas y el buscador. El audio y el video requieren conexión.

### 7.5 Idioma

- **RF-55.** La interfaz y el contenido están **solo en español** en la v1, preparados para agregar inglés sin rehacer el sitio.

### 7.6 Accesibilidad

- **RF-56.** El sitio cumple **WCAG 2.2 AA**:
  - contraste suficiente y navegación completa con teclado;
  - texto alternativo en las imágenes y lectura correcta con lectores de pantalla;
  - transcripciones de las entrevistas cuando existan.

## 8. Contenido y derechos

- **RF-57.** **Solo se publica** lo que tiene el estado de derechos **«autorizado»**. Cada pieza tiene un campo de derechos (autorizado / pendiente / restringido). La Fundación gestiona las autorizaciones en paralelo y el sitio sale con lo autorizado que haya en ese momento.
- **RF-58.** El **texto canónico** de *Sangre y Sueño* está en elaboración. Hasta entonces se usa el del Tomo I (2012) como provisional. El canónico **cambiará el orden y el título de muchos poemas**, así que:
  - cada texto tiene una **identidad permanente** que no depende de su título ni de su posición;
  - guarda sus **títulos alternativos** (el del Tomo I, el del disco y el de la grabación), que el buscador también encuentra;
  - su **orden** es explícito y editable;
  - si cambia el título y con él la URL, la dirección anterior **redirige** automáticamente a la nueva.
- **RF-59.** La carga inicial de *Sangre y Sueño* se hace de forma automatizada. Después, la Fundación completa y corrige las fichas desde el admin.

## 9. QR, medición y panel de administración

### 9.1 QR

- **RF-60.** Hay **un solo QR** para todo el libro. Apunta a la página de *Sangre y Sueño* en el dominio de la Fundación (previsto: `marcelodeurioste.org/sangre-y-sueno`) y lleva una marca para medir cuántas visitas llegan desde el libro.
- **RF-61.** La dirección del QR **no cambia nunca**, aunque cambie la aplicación.

### 9.2 Estadísticas

- **RF-62.** El sitio mide las visitas **sin cookies** y sin banner de consentimiento. Hay un **panel público** de estadísticas que se puede compartir con financiadores.

### 9.3 Panel de administración (`/admin`)

- **RF-65.** Lo usa una persona **sin conocimientos de informática**. La interfaz está en español y entra con **usuario y contraseña**, sin cuenta de GitHub.
- **RF-66.** Permite **crear y editar** obras, secciones, textos, grabaciones, dibujos y otras imágenes, videos, la biografía y la cronología, **incluidas obras nuevas además de *Sangre y Sueño***.
- **RF-67.** Permite **subir audio e imágenes** directamente desde el formulario. Las imágenes se optimizan solas al subirlas.
- **RF-68.** Permite **relacionar** piezas: este dibujo ilustra esta canción, esta grabación es una versión de esta canción, este panel pertenece a esta hoja.
- **RF-69.** Permite **reordenar** secciones y textos.
- **RF-70.** Lo que se guarda **se publica directamente**, en uno o dos minutos, sin paso de aprobación.
- **RF-71.** Si una ficha tiene un error grave (falta un campo obligatorio o un enlace roto), la publicación se detiene y el sitio anterior sigue en línea.

## 10. Aplicación Android (futuro)

- **RF-80.** Más adelante habrá una aplicación Android **dedicada solo a *Sangre y Sueño***, que acompaña al libro.
- **RF-81.** «Restringida» significa que **contiene un solo libro**, no que esté bloqueada: no requiere código ni compra.
- **RF-82.** La app debería poder leer los textos sin conexión. La descarga de audio para escuchar sin conexión se evaluará en ese momento.

## 11. Pendientes de contenido

Son tareas de la Fundación o de los editores, no decisiones de diseño. El detalle está en el [inventario](inventario/README.md).

- El texto canónico de *Sangre y Sueño*, que está en elaboración.
- El escaneo de un ejemplar de la edición de 1981, para el facsímil.
- Las autorizaciones de derechos: TVB/Bolivisión, Discolandia, Pro-Audio, Radio Cristal, Montgomery County y Plural editores (texto).
- El audio de los temas del LP de 1984 que faltan: *Luna Andina*, *La clara melodía del amor* y *Lago Sagrado (Titicaca)*.
- Resolver los duplicados y los nombres dudosos del archivo.
- Relacionar los códigos del inventario de dibujos con los nombres de archivo.
- Tener el logo en formato vectorial.
- Comprar el dominio y crear las cuentas de la Fundación.
