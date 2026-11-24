/**
 * Turns an item of `scripts/import/data/artworks.yml` into an artwork entry (RF-59).
 */
import { basename } from 'node:path';

export interface ArtworkManifestItem {
  readonly source: string;
  readonly id: string;
  readonly title: string;
  readonly kind: string;
  readonly technique: string;
  readonly inscription?: string;
  readonly date?: string;
  readonly place?: string;
  readonly sheet?: string;
  readonly texts: readonly string[];
  readonly alt: string;
  readonly rights: 'cleared' | 'pending' | 'restricted';
  readonly notes?: string;
  readonly review?: string;
}

/** Longest side of the stored web image (RT-22); Astro derives smaller sizes from it. */
export const STORED_IMAGE_MAX_SIDE = 2400;

export function imageFileName(item: ArtworkManifestItem): string {
  return `${item.id}.webp`;
}

export function artworkData(item: ArtworkManifestItem): Record<string, unknown> {
  const optional = (key: 'inscription' | 'date' | 'place' | 'sheet' | 'notes' | 'review') =>
    item[key] === undefined ? {} : { [key]: item[key] };
  return {
    title: item.title,
    kind: item.kind,
    technique: item.technique,
    ...optional('inscription'),
    ...optional('date'),
    ...optional('place'),
    ...optional('sheet'),
    texts: [...item.texts],
    image: `../media/images/${imageFileName(item)}`,
    sourceFile: basename(item.source),
    alt: item.alt,
    ...optional('notes'),
    ...optional('review'),
    rights: item.rights,
  };
}
