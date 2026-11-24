/**
 * Spanish UI strings (RF-55, RT-43). Components never hard-code UI text: they read it from
 * here, so an English file can be added later with the same keys.
 */
export const es = {
  site: {
    name: 'Archivo Marcelo de Urioste',
    /** Under the icon of the installed app, where space is short. */
    shortName: 'Marcelo de Urioste',
    tagline: 'El regocijo de vivir — poesía, música y memoria',
    skipToContent: 'Saltar al contenido',
    mainNavigation: 'Principal',
    footer:
      'Archivo digital de la obra de Marcelo de Urioste Nardín (La Paz, 1952 – Washington D. C., 1997). ' +
      'Los textos, grabaciones, dibujos y videos tienen todos los derechos reservados, salvo que la ficha indique otra licencia.',
    footerFoundation: 'Una edición de la Fundación Marcelo de Urioste.',
  },
  nav: {
    obras: 'Obras',
    escuchar: 'Escuchar',
    galeria: 'Galería',
    leer: 'Leer',
    videos: 'Videos',
    marcelo: 'Marcelo',
    buscar: 'Buscar',
  },
  home: {
    title: 'El regocijo de vivir',
    subtitle: 'Poesía, música y memoria',
    lede: 'Poesía, canciones, dibujos y voz de Marcelo de Urioste (La Paz, 1952 – Washington D. C., 1997).',
    enterWork: 'Entrar a',
    worksHeading: 'Obras',
    upcoming: 'Próximamente',
    listenHeading: 'Para empezar a escuchar',
    listenAll: 'Todas las grabaciones',
    galleryHeading: 'Del cuaderno de dibujos',
    galleryAll: 'Toda la galería',
  },
  works: {
    title: 'Obras',
    intro:
      'Los libros, discos y cuadernos de Marcelo de Urioste. Las obras marcadas «próximamente» se irán sumando al archivo.',
  },
  work: {
    contentsHeading: 'Contenido',
    textCount: (count: number) => (count === 1 ? '1 texto' : `${count} textos`),
  },
  text: {
    backToWork: 'Volver a la obra',
    recordingsHeading: 'Grabaciones',
    recordingUnavailable: 'Grabación no disponible en el archivo.',
    provisionalNote:
      'Texto provisional, tomado de la edición indicada en la ficha. Será reemplazado por el texto de la edición conmemorativa.',
    dedicationLabel: 'Dedicatoria',
    notesHeading: 'Notas de la edición',
    criticalNotesHeading: 'Notas críticas',
    illustrationsHeading: 'Dibujos',
    facsimileHeading: 'Página original',
    recordHeading: 'Ficha',
    page: (pages: string) => `p. ${pages}`,
  },
  recording: {
    play: (title: string) => `Escuchar «${title}»`,
    pause: (title: string) => `Pausar «${title}»`,
    enqueue: (title: string) => `Agregar «${title}» a la cola`,
    enqueueShort: 'A la cola',
    primary: 'Versión principal',
  },
  player: {
    label: 'Reproductor',
    play: 'Reproducir',
    pause: 'Pausar',
    previous: 'Anterior',
    next: 'Siguiente',
    position: 'Posición en la grabación',
    positionText: (elapsed: string, total: string) => `${elapsed} de ${total}`,
    queue: 'Cola',
    queueHeading: 'Cola de reproducción',
    /** Read after the count on the queue button: "Cola 2 grabaciones". */
    queueUnit: (count: number) => (count === 1 ? 'grabación' : 'grabaciones'),
    remove: (title: string) => `Quitar «${title}» de la cola`,
    nowPlaying: 'Sonando',
    lyrics: 'Ver la letra',
    added: (count: number) =>
      count === 0
        ? 'Ya estaba en la cola.'
        : count === 1
          ? 'Agregada a la cola.'
          : `${String(count)} grabaciones agregadas a la cola.`,
    loadError: (title: string) => `No se pudo cargar «${title}».`,
    offline: (title: string) =>
      `«${title}» necesita conexión a internet: las grabaciones no se guardan para escuchar sin conexión.`,
    playWork: 'Escuchar toda la obra',
    playWorkSummary: (count: number, duration: string) =>
      `${String(count)} ${count === 1 ? 'grabación' : 'grabaciones'}, ${duration}`,
  },
  listen: {
    title: 'Escuchar',
    intro:
      'Todas las grabaciones del archivo: canciones, recitales y lecturas de Marcelo de Urioste.',
    noCollection: 'Otras grabaciones',
    versionOf: 'Versión de',
  },
  gallery: {
    title: 'Galería',
    intro: 'Dibujos, acuarelas, pinturas y documentos de Marcelo de Urioste.',
    sheetHeading: 'Hoja completa',
    panelsHeading: 'Viñetas de esta hoja',
    illustratesHeading: 'Ilustra',
    viewLarge: 'Ver la imagen en tamaño grande',
  },
  read: {
    title: 'Leer',
    intro: 'Todos los textos publicados, obra por obra.',
  },
  videos: {
    title: 'Videos',
    intro: 'Programas de televisión, documentales y presentaciones.',
    empty:
      'Los videos se publicarán cuando estén en el canal de la Fundación y tengan sus autorizaciones.',
    play: (title: string) => `Reproducir «${title}» (se carga desde YouTube)`,
    notYetOnYouTube: 'Este video todavía no está publicado en YouTube.',
  },
  marcelo: {
    title: 'Marcelo de Urioste',
    timelineHeading: 'Cronología',
  },
  search: {
    title: 'Buscar',
    intro: 'Busca en títulos, letras, poemas y fichas de todo el archivo.',
    noScript: 'El buscador necesita JavaScript.',
  },
  kinds: {
    poem: 'Poema',
    song: 'Canción',
    recital: 'Recital',
    reading: 'Lectura',
    interview: 'Entrevista',
    lecture: 'Conferencia',
    instrumental: 'Instrumental',
    drawing: 'Dibujo',
    watercolor: 'Acuarela',
    painting: 'Pintura',
    photo: 'Fotografía',
    document: 'Documento',
    poster: 'Afiche',
  },
  record: {
    fields: {
      work: 'Obra',
      section: 'Sección',
      kind: 'Tipo',
      date: 'Fecha',
      place: 'Lugar',
      technique: 'Técnica',
      dimensions: 'Medidas',
      duration: 'Duración',
      collection: 'Colección',
      venue: 'Lugar',
      series: 'Serie',
      inscription: 'Inscripción',
      source: 'Fuente',
      inventoryCode: 'Código de inventario',
      rightsHolder: 'Titular de derechos',
      license: 'Derechos',
      original: 'Original',
      permalink: 'Enlace para citar',
    },
    licenses: {
      'all-rights-reserved': 'Todos los derechos reservados',
    } as Readonly<Record<string, string>>,
    originalLink: 'Ver en Internet Archive',
  },
  permalink: {
    redirecting: 'Redirigiendo…',
  },
  pendingTasks: {
    title: 'Pendientes de la Fundación',
    intro:
      'Esta lista se calcula a partir del contenido del archivo cada vez que se publica. ' +
      'Una tarea desaparece sola cuando el contenido ya no la necesita: por ejemplo, al marcar ' +
      'los derechos como autorizados o al borrar el campo «Qué falta revisar».',
    nothingPending: 'No hay pendientes.',
    edit: 'Editar',
    total: (count: number) => (count === 1 ? '1 pendiente' : `${count} pendientes`),
    kinds: {
      'rights-pending': {
        title: 'Confirmar derechos',
        help: 'Piezas con derechos pendientes: no se publican hasta marcarlas como autorizadas.',
      },
      review: {
        title: 'Revisar',
        help: 'Dudas anotadas en el campo «Qué falta revisar».',
      },
      'song-without-recording': {
        title: 'Canciones sin grabación',
        help: 'Canciones sin ninguna grabación en el archivo.',
      },
      'recording-without-text': {
        title: 'Grabaciones sin canción',
        help: 'Grabaciones de música que todavía no están relacionadas con su letra.',
      },
      'video-without-youtube': {
        title: 'Videos sin publicar en YouTube',
        help: 'Falta subir el video al canal de la Fundación y anotar su identificador.',
      },
      'provisional-text': {
        title: 'Textos provisionales',
        help: 'Textos tomados del Tomo I (2012) que se reemplazarán por el texto canónico.',
      },
      'artwork-without-inventory-code': {
        title: 'Imágenes sin código de inventario',
        help: 'Falta relacionar la imagen con su código del inventario de dibujos.',
      },
    },
    collections: {
      works: 'Obra',
      texts: 'Texto',
      recordings: 'Grabación',
      artworks: 'Imagen',
      videos: 'Video',
      people: 'Persona',
    },
  },
} as const;

export type UiStrings = typeof es;
