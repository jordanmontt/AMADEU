# Registro de decisiones

Cada decisión de diseño se documenta en un archivo corto con cuatro partes: contexto, decisión, por qué y alternativas descartadas (formato ADR).

- Las decisiones **no se borran**. Si cambian, se escribe una nueva y la anterior se marca como «Reemplazada por NNNN».
- Los números son correlativos y no se reutilizan.

| N.º | Decisión | Estado |
|---|---|---|
| [0001](0001-alcance-v1-sangre-y-sueno.md) | Alcance de la v1: solo el universo Sangre y Sueño | aceptada |
| [0002](0002-organizacion-por-obra.md) | Organización por obra, con vistas por tipo de medio | aceptada |
| [0003](0003-texto-transcrito-y-facsimil.md) | Texto transcrito como lectura principal y facsímil opcional | aceptada |
| [0004](0004-animaciones-artesanales-svg.md) | Dibujos animados de forma artesanal con SVG | aceptada |
| [0005](0005-prototipo-demostrativo.md) | El prototipo también es una demostración para financiadores | aceptada |
| [0006](0006-android-un-solo-libro-sin-bloqueo.md) | La app Android contiene un solo libro, sin bloqueo | aceptada |
| [0007](0007-solo-espanol-preparado-ingles.md) | Solo español en la v1, preparado para inglés | aceptada |
| [0008](0008-sin-base-de-datos.md) | Sin base de datos: el repositorio es la base de datos | aceptada |
| [0009](0009-medios-fuera-de-github.md) | Medios pesados fuera de GitHub: R2, YouTube e Internet Archive | aceptada |
| [0010](0010-identidad-visual-editorial.md) | Identidad visual editorial-archivística | aceptada |
| [0011](0011-reproductor-persistente.md) | Reproductor de audio persistente con cola | aceptada |
| [0012](0012-versiones-de-una-cancion.md) | Una versión principal y otras versiones de cada canción | aceptada |
| [0013](0013-ficha-dublin-core.md) | Ficha archivística visible basada en Dublin Core | aceptada |
| [0014](0014-buscador-en-el-navegador.md) | Buscador estático en el navegador (Pagefind) | aceptada |
| [0015](0015-zoom-normal-sin-iiif.md) | Zoom normal en la galería; zoom profundo (IIIF) para el futuro | aceptada |
| [0016](0016-videos-seccion-propia-todos.md) | Sección de videos con todos los videos disponibles | aceptada |
| [0017](0017-derechos-por-pieza.md) | Estado de derechos por pieza; solo se publica lo autorizado | aceptada |
| [0018](0018-astro-pwa-capacitor.md) | Astro + PWA; Android con el mismo proyecto empaquetado con Capacitor | aceptada |
| [0019](0019-cloudflare-pages-y-dominio.md) | Cloudflare Pages y dominio de la Fundación | aceptada |
| [0020](0020-cuentas-a-nombre-de-la-fundacion.md) | Cuentas a nombre de la Fundación (excepto el repo, por ahora) | aceptada |
| [0021](0021-texto-provisional-tomo-i.md) | Texto provisional del Tomo I hasta que exista el canónico | aceptada |
| [0022](0022-id-permanente-y-redirecciones.md) | ID permanente, títulos alternativos, orden explícito y redirecciones | parcialmente reemplazada por 0037 |
| [0023](0023-estructura-generica-de-obra.md) | Estructura genérica de obra: obra → secciones → textos | aceptada |
| [0024](0024-carga-inicial-automatizada.md) | Carga inicial automatizada; la Fundación cura los datos | aceptada |
| [0025](0025-goatcounter.md) | Estadísticas con GoatCounter | aceptada |
| [0026](0026-accesibilidad-wcag-aa.md) | Accesibilidad WCAG 2.2 AA | aceptada |
| [0027](0027-documentacion-y-convenciones.md) | Documentación en español, código en inglés | aceptada |
| [0028](0028-sveltia-cms.md) | Sveltia CMS como panel de administración | aceptada |
| [0029](0029-login-usuario-contrasena.md) | Login del admin con usuario y contraseña (Sveltia CMS Additions) | aceptada |
| [0030](0030-optimizacion-imagenes-al-subir.md) | Imágenes optimizadas al subirlas; originales en Internet Archive | aceptada |
| [0031](0031-publicacion-directa.md) | Publicación directa sin aprobación | aceptada |
| [0032](0032-un-solo-qr.md) | Un solo QR para todo el libro | aceptada |
| [0033](0033-pwa-sin-conexion-textos.md) | PWA: textos sin conexión, medios en línea | aceptada |
| [0034](0034-canciones-sin-grabacion.md) | Canciones sin grabación se muestran con una nota | aceptada |
| [0035](0035-licencias.md) | Licencias: código MIT, contenido con todos los derechos reservados | aceptada |
| [0036](0036-calidad-ci-minima.md) | Calidad mínima automatizada en CI | aceptada |
| [0037](0037-enlace-permanente-por-id.md) | Enlace permanente por ID, sin historial de redirecciones | aceptada |
| [0038](0038-obras-en-la-raiz.md) | Las obras viven en la raíz de la URL | aceptada |
