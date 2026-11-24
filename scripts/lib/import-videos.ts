/**
 * Turns an item of `scripts/import/data/videos.yml` into a video entry (RF-59).
 * Videos are published from YouTube, so nothing is copied; every imported video starts as
 * `pending` until the Foundation confirms its rights and adds its YouTube id.
 */
export interface VideoManifestItem {
  readonly source: string;
  readonly id: string;
  readonly title: string;
  readonly series?: string;
  readonly date?: string;
  readonly texts?: readonly string[];
  readonly notes?: string;
  readonly review?: string;
}

/** Programmes produced for TVB (Bolivisión) in 1985, according to the inventory. */
const SERIES_DEFAULTS: Readonly<Record<string, { date: string; review: string }>> = {
  'Los Caminos del Hombre': {
    date: '1985',
    review:
      'Programa producido para TVB (1985) según el inventario; serie, fecha y derechos por confirmar.',
  },
};

export function videoData(
  item: VideoManifestItem,
  durationSeconds: number,
): Record<string, unknown> {
  const defaults = item.series === undefined ? undefined : SERIES_DEFAULTS[item.series];
  const date = item.date ?? defaults?.date;
  const review = item.review ?? defaults?.review;
  return {
    title: item.title,
    ...(item.series === undefined ? {} : { series: item.series }),
    ...(date === undefined ? {} : { date }),
    durationSeconds: Math.round(durationSeconds),
    texts: [...(item.texts ?? [])],
    ...(item.notes === undefined ? {} : { notes: item.notes }),
    ...(review === undefined ? {} : { review }),
    rights: 'pending',
  };
}
