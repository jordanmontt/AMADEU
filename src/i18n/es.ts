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
} as const;

export type UiStrings = typeof es;
