# Inventario del archivo digitalizado

> Relevamiento hecho el 2026-11-24 sobre la carpeta `Archivos Digitales/`, que está fuera del repo. Solo lectura; no se modificó nada.
> Es un diagnóstico para planificar, no un catálogo. El catálogo definitivo se construye en el CMS.

## 1. Resumen

El archivo son cuatro carpetas, `000 ARCHIVO MARCELO` y las numeradas 2, 3 y 4. Son **partes distintas de un mismo archivo**, sin duplicarse entre sí. Cada una es el contenido de un zip (`001.zip`–`004.zip`, 5,4 GB en total), así que los zips son copias de respaldo.

| Tipo | Archivos | Tamaño | Formato |
|---|---|---|---|
| Audio | 81 MP3 | ≈ 400 MB | MP3 128 kbps CBR, 44,1 kHz estéreo, sin etiquetas ID3 |
| Video | 17 videos reales + 3 MP4 solo de audio + 1 MP3 | ≈ 3,8 GB | 15 en MPEG-4 Part 2 a 704/720×480 (programas TVB); 2 en H.264 a 320×240 |
| Imágenes | 58 (52 TIFF + 6 JPG/JPEG) | ≈ 2,45 GB | Escaneos a 1200 dpi; pinturas fotografiadas en 16 bits |
| Textos | 2 PDF | 3,5 MB | Nativos digitales (InDesign): texto extraíble |
| Inventario | 2 DOCX | 146 KB | Tablas en Word |

**Ruido a ignorar:** archivos `.DS_Store` y el archivo de bloqueo de Word `~$queleto Archivo.docx`.

## 2. Material de *Sangre y Sueño*

### 2.1 Textos

- **`000 ARCHIVO MARCELO 3/Textos marcelo/El Regocijo de Vivir-Tomo I.pdf`** (Plural editores, 2012, 389 págs.):
  - **«sangre y sueño – Libro de canciones (1996)»**, págs. 11–98: unas 70 letras en orden alfabético, de «Alcalde de la canción» a «Una simple declaración de amor». El poema «Sangre y sueño» (págs. 96–98) **no figura en el índice del PDF**.
  - **«sangre y sueño – Relatos Poéticos de Diego Calahumana»**, págs. 103–239: unos 50 romances.
  - Después siguen *Fuego desvelado* (1995), *Talismán de viento* (1987) y *Cristal de silencio* (1995).
- **`Tomo II.pdf`** (132 págs.): *El libro de las odas*, *Nuevas odas para Silvia*, *Haikus* y *Cartas de amor de Telmo Castro*. No incluye nada de *Sangre y Sueño*.
- **No hay escaneo** de la edición original de 1981 (José Martí).
- El texto se extrae bien con Ghostscript `txtwrite`. `pdftotext` no está instalado.
- **Ojo:** el texto canónico que se está elaborando tendrá **otro orden y otros títulos** (ver [decisión 0021](../decisiones/0021-texto-provisional-tomo-i.md)).

### 2.2 Grabaciones

- Los **80 MP3 de canciones** (carpetas Audios de las partes 2, 3 y 4) corresponden al ítem 7 del inventario: la **grabación casera de *Sangre y Sueño*, 52 canciones con guitarra y voz, 1993–95**. **No** son el LP de estudio de Discolandia de 1984.
- `000 ARCHIVO MARCELO 4/Audios Marcelo/Sangre y Sueño.mp3`: la canción del título (2:11).
- Hay audio de 9 de los 12 temas del LP de 1984:
  - **Presentes:** Cordillera Real, Quiero decir que faltas, Ayer nomás, El más tierno esplendor, Canción serena, Juglar amador, Nuestra Señora de La Paz (Chuquiago Marka), Prisionero del amor y Sangre y Sueño.
  - **Faltan:** *Luna Andina*, *La clara melodía del amor* y *Lago Sagrado (Titicaca)*.
  - **También faltan** títulos del cancionero: Altiplano, Aquel antiguo deseo de llorar, Claro de luna, Diosa terrestre, Cordillera de los Andes y Titicaca.
- **Recitales** (MP3 largos): Goethe-Institut 1981 (46:25), Alianza Francesa 1981 (43:27, incluye «Sangre y Sueño») e Inauguración del Espacio Portales (15:18).
- **Poesía sonora:** *Cristal de Silencio* 1.ª y 2.ª parte (unos 31 min cada una), *Fuego Desvelado* (31 min) y *Talismán de Viento* (31 min, más una copia «1986»).
- La carpeta `000 ARCHIVO MARCELO 2/Audios Marcelo/000 Sangre y Sueño/` está **vacía**, también dentro del zip.

### 2.3 Video

- `000 ARCHIVO MARCELO/Videos Marcelo/El Regocijo de Vivir Los Relatos Poeticos y Sangre y Sueño 1996.mp4` (55:50, 704×480): probablemente la presentación del libro de 1996.

### 2.4 Imágenes

- `Afiche Concierto MDU 2018.JPG` (392×598, baja resolución): afiche del concierto homenaje «Sangre y Sueño», con una **foto** de Marcelo tocando la guitarra.
- Muchos dibujos a tinta llevan **versos manuscritos de las canciones**, así que ilustran el cancionero (ver §3).

## 3. Imágenes: catálogo preliminar

Hay dos grupos técnicos:

- **Escaneos numerados** (8, 9, 10…, con variantes como 12A o 15D): 44 archivos a 1200 dpi, **grises de 8 bits**, TIFF sin comprimir, de 11 a 137 MB. Son dibujos a pluma, en su mayoría del personaje del sombrero de copa (alter ego de Marcelo) con versos de las canciones. Excepciones en RGB: `12.tif`, `1A.tif` e `img20250501_22212983.tif`.
- **`cuadro1`–`cuadro20`** (13 archivos): acuarelas y pinturas fotografiadas con Canon EOS 7D Mk II, **RGB de 16 bits** a 300 dpi. `cuadro17` pesa 342 MB, probablemente porque conserva capas.

Las **hojas de varios paneles** (8, 9, 10, 11, 13, 14, `Copia de 12`) se componen de los paneles sueltos (8B, 8C, 8D, 10A…).

### 3.1 Dibujos con guitarra o músicos (candidatos a animar)

| Archivo | Descripción | Para animar |
|---|---|---|
| `000 ARCHIVO MARCELO 2/Imagenes/93.tif` | «Alcalde de la canción»: el hombre de sombrero de copa toca la guitarra frente a una iglesia colonial. Trazo limpio y terminado | **Primera animación** |
| `000 ARCHIVO MARCELO 4/Imagenes/1A.tif` | «Alcalde de la canción», boceto | Referencia |
| `000 ARCHIVO MARCELO 4/Imagenes/29B.tif` | Guitarrista entre notas musicales, «Quiero romper el dolor, darle un sentido cantando» | Candidato |
| `000 ARCHIVO MARCELO 2/Imagenes/8D.tif` | Guitarrista con el corazón atravesado, «…mi nueva canción» | Candidato |
| `000 ARCHIVO MARCELO 2/Imagenes/8.tif` | Hoja de 4 paneles «Tengo miedo»; incluye el guitarrista de 8D | — |
| `000 ARCHIVO MARCELO 2/Imagenes/15B.tif` | Tres figuras con trompetas (boceto) | — |
| `000 ARCHIVO MARCELO/Imagenes/cuadro17.tif` | Pintura «Sangre de mi propia sangre», con una guitarra flotando | No (color) |
| `000 ARCHIVO MARCELO 3/Imagenes/cuadro5.tif` | Acuarela «Canción serena para esposos hechizados», con instrumentos | No (color) |
| `000 ARCHIVO MARCELO 4/Imagenes/cuadro19.tif` | Pintura del hombre del sombrero tocando el violín | No (color) |

### 3.2 Dibujos con versos de canciones (relaciones probables)

Estas relaciones se confirman al cargar el contenido.

| Archivo(s) | Verso / título | Canción probable |
|---|---|---|
| `93.tif`, `1A.tif` | «Alcalde de la canción» | Alcalde de la canción |
| `9.tif`, `9B.tif` | «Ayer nomás… capitán del porvenir» | Ayer nomás |
| `8.tif`, `14.tif`, `14A.tif`, `14B.tif` | «Tengo miedo del encuentro con mi propio corazón» | Tengo miedo |
| `13.tif`, `13A.tif` | «Árbol de fuego» | Árbol de fuego |
| `12A.tif`, `Copia de 12.tif` | «Sangre y sueño» | Sangre y Sueño |
| `12E.tif` | «…peñascos de una altiva cordillera» | Cordillera Real (?) |
| `11.tif`, `11A.tif`, `11B.tif` | «Balada del amor imposible», «me hirió la espina de un gran amor» | Balada del amor imposible |
| `10.tif` | «Salva tu forma de ser» | Salva tu forma de ser (?) |
| `cuadro2.tif` | «Cordillera Real» (acuarela) | Cordillera Real |
| `cuadro5.tif` | «Canción serena para esposos hechizados» | Canción serena |

Las miniaturas de todas las imágenes se generaron en una carpeta temporal fuera del repo, que no se conserva. El script de carga inicial las vuelve a generar.

### 3.3 Duplicados de imágenes

- `000 ARCHIVO MARCELO 2/Imagenes/12.jpg` y `000 ARCHIVO MARCELO 3/Imagenes/12.tif` son el mismo retrato («Locura y arte», 1985).
- Los 4 JPEG de WhatsApp son fotos o recortes de `cuadro10.tif`, de baja calidad, y se descartan.
- `Copia de 12.tif` (parte 2) y `12.tif` (parte 3) son imágenes **distintas** a pesar del nombre.

## 4. Videos

- **15 programas de TVB**, en su mayoría de la serie ***Los Caminos del Hombre*** (1985), de 17 a 31 minutos cada uno. El inventario habla de 50 cortometrajes, así que **faltan digitalizar** muchos.
- 2 videos en H.264 a 320×240: *América Latina en el Siglo de las Luces* y *América Latina Siglo XIX*.
- **«America Precolombina» está 8 veces**, byte a byte idéntica (≈ 218 MB cada copia, ≈ 1,5 GB sobrantes). Se publica una sola.
- **Solo tienen audio** (MP4 sin imagen): «Alcalde de la Cancion.mp4», «America.mp4» y «Amasar el viejo pan…mp4». Se tratan como grabaciones, no como videos.

## 5. Audio: duplicados y dudas

- «Inauguracion del Espacio Portales en La Paz.mp3» está duplicado en la parte 2 (carpeta de videos) y en la parte 3.
- **«Juglar Amador.mp3» (parte 2) y «Navigari Neccesse Est….mp3» (parte 4)** tienen el mismo tamaño y la misma duración, pero el audio es distinto. **Hay que escucharlos** para saber si uno está mal nombrado.
- Hay casi duplicados por nombre: «Talismán de Viento» frente a «Talisman de Viento 1986», tomas «con 1 2 3 al inicio» y dos archivos «Porque hoy me agredió…».

## 6. Los documentos de inventario

- `000 ARCHIVO MARCELO 3/INVENTARIO/Inventario Archivo.docx`: borrador anterior, más extenso.
- `000 ARCHIVO MARCELO 4/INVENTARIO/000 Inventario OK.docx`: versión depurada. Numera **001 Publicaciones** (16 obras), **002 Audiovisuales** (150 archivos) y **003 Dibujos** (349 obras).

Datos útiles:

- **001-1** *Sangre y Sueño* libro (José Martí, 1981) y **001-2** *Sangre y Sueño* disco (Discolandia, sello MCB, 1984).
- **Archivos digitalizados**, 31 ítems con columnas N.º, Archivo, Año, Contenido y Duración. La mayoría de las duraciones están en un valor de relleno, «2:35». Destacan:
  - el ítem 1, LP de 1984, con créditos completos (Einar Guillén, dirección musical; Licindo Gómez, ingeniero de grabación) y la lista de temas;
  - el ítem 2, *Canciones para Sylvia* (Pro-Audio 1995, CD, 56 temas);
  - el ítem 7, grabaciones caseras 1993–95 (52 canciones con voz y guitarra más 37 instrumentales).
- **Dibujos y acuarelas:** 21 series, con columnas Serie, Descripción, Medidas, Técnica, Orientación, Calificación (1–3) y Código. **Solo las 5 primeras series están completas** (códigos ACUG, ACUM, CPS, ACUMX, ADLC).
- **Los códigos de inventario no corresponden a los nombres de archivo** (8.tif, cuadro4.tif…). Esa correspondencia hay que construirla y se guarda en los campos `inventoryCode` y `sourceFile`.

## 7. Logos

La carpeta `Logos/` tiene 3 JPEG de WhatsApp (612 KB): la autocaricatura con sombrero de copa, la misma caricatura con el texto «CIC – Marcelo de Urioste – Centro de Investigación Cultural», y el retrato «Locura y arte». **No hay versión vectorial ni en alta resolución.**

## 8. Pendientes de contenido

| # | Pendiente | Responsable | Bloquea |
|---|---|---|---|
| 1 | Texto canónico de *Sangre y Sueño* | Editores | No (se usa el Tomo I provisional) |
| 2 | Escaneo de la edición de 1981 para el facsímil | Fundación | No |
| 3 | Autorizaciones: TVB/Bolivisión, Discolandia, Pro-Audio, Radio Cristal, Montgomery County y Plural | Fundación | Publicación de las piezas afectadas |
| 4 | Audio de *Luna Andina*, *La clara melodía del amor* y *Lago Sagrado* (LP 1984) | Fundación | No (nota «no disponible») |
| 5 | Digitalizar el resto de *Los Caminos del Hombre* (≈ 35 de 50) | Fundación | No |
| 6 | Escuchar «Juglar Amador» frente a «Navigari Neccesse Est» | Fundación | No |
| 7 | Relacionar los códigos de inventario con los archivos de imagen | Fundación | No |
| 8 | Confirmar las relaciones dibujo–canción de §3.2 | Fundación | No |
| 9 | Logo en vectorial (vectorizar la caricatura) | Desarrollador / diseñador | Identidad visual final |
| 10 | Comprar el dominio y crear las cuentas de la Fundación | Fundación + desarrollador | Paso a producción |
| 11 | Confirmar la lista de obras «próximamente» | Fundación | No |
| 12 | Subir los originales a Internet Archive | Fundación | No |
