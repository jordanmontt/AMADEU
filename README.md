# AMADEU — Archivo Marcelo de Urioste

Archivo digital público de la obra de **Marcelo de Urioste Nardín** (La Paz, 1952 – Washington D. C., 1997): poeta, músico, cantautor, dibujante, investigador y comunicador boliviano.

La primera versión (v1) publica el universo **_Sangre y Sueño_**: poemario, cancionero y grabaciones. Las demás obras aparecen como «próximamente» y se agregarán desde el panel de administración.

## Documentación

Toda la documentación está en español, en [`docs/`](docs/README.md):

- [Requerimientos funcionales](docs/01-requerimientos-funcionales.md): qué es la aplicación, qué contiene y cómo se ve.
- [Requerimientos técnicos](docs/02-requerimientos-tecnicos.md): arquitectura, tecnologías, modelo de datos y operación.
- [Registro de decisiones](docs/decisiones/README.md): cada decisión con su contexto, su porqué y las alternativas descartadas.
- [Inventario del archivo](docs/inventario/README.md): qué material existe y qué falta.

## Resumen técnico

- Sitio estático con [Astro](https://astro.build) e instalable como PWA, alojado en Cloudflare Pages.
- Sin base de datos: el contenido son archivos Markdown/YAML de este repositorio y se edita con [Sveltia CMS](https://github.com/sveltia/sveltia-cms) en `/admin`.
- Audio e imágenes en Cloudflare R2, videos en YouTube y originales de preservación en Internet Archive.
- El código está en inglés y la interfaz y las URLs en español.

## Licencias

- **Código:** MIT (ver [LICENSE](LICENSE)), © Sebastian Jordan Montaño.
- **Contenido** (la obra de Marcelo de Urioste: textos, grabaciones, dibujos, videos): todos los derechos reservados, salvo que la ficha de una pieza indique otra licencia.
