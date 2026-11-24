/**
 * Turns an item of `scripts/import/data/recordings.yml` into a recording entry (RF-59).
 */
export interface RecordingManifestItem {
  /** Path of the source file inside the archive. */
  readonly source: string;
  readonly id: string;
  readonly title: string;
  readonly kind: string;
  readonly texts: readonly string[];
  /** This recording is the primary version of its (first) text. */
  readonly primary?: boolean;
  readonly collection?: string;
  readonly date?: string;
  readonly venue?: string;
  readonly rights: 'cleared' | 'pending' | 'restricted';
  readonly notes?: string;
  readonly review?: string;
}

/** File name of the published audio: always MP3, named after the entry id. */
export function audioFileName(item: RecordingManifestItem): string {
  return `${item.id}.mp3`;
}

/** Source files that are not MP3 (audio-only MP4s) must be converted on import. */
export function needsConversion(item: RecordingManifestItem): boolean {
  return !item.source.toLowerCase().endsWith('.mp3');
}

export function recordingData(
  item: RecordingManifestItem,
  durationSeconds: number,
): Record<string, unknown> {
  const optional = (key: 'collection' | 'date' | 'venue' | 'notes' | 'review') =>
    item[key] === undefined ? {} : { [key]: item[key] };
  return {
    title: item.title,
    texts: [...item.texts],
    kind: item.kind,
    ...optional('date'),
    ...optional('collection'),
    ...optional('venue'),
    durationSeconds: Math.round(durationSeconds),
    audio: audioFileName(item),
    ...optional('notes'),
    ...optional('review'),
    rights: item.rights,
  };
}
