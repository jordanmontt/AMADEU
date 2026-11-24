/**
 * Spanish UI strings (RF-55, RT-43). Components never hard-code UI text: they read it from
 * here, so an English file can be added later with the same keys.
 */
export const es = {
  site: {
    name: 'Archivo Marcelo de Urioste',
    tagline: 'El regocijo de vivir — poesía, música y memoria',
    skipToContent: 'Saltar al contenido',
  },
  home: {
    worksHeading: 'Obras',
    upcomingHeading: 'Próximamente',
  },
  work: {
    contentsHeading: 'Contenido',
  },
  text: {
    backToWork: 'Volver a la obra',
    recordingUnavailable: 'Grabación no disponible en el archivo',
    provisionalNote: 'Texto provisional',
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
