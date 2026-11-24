/**
 * Public URLs of the site (docs/02-technical-requirements.md §7).
 *
 * - Works live at the root: `/<work-slug>/` (ADR 0038). Their slug is explicit and permanent.
 * - Texts live under their work, with a slug derived from the current title; it changes when
 *   the title changes (ADR 0037).
 * - Gallery images and videos use their entry id, which never changes.
 * - `/id/<id>/` is the permanent link of any page-bearing entry.
 */
import type {
  ArtworkEntry,
  CollectionName,
  TextEntry,
  VideoEntry,
  WorkEntry,
} from './content/collections';
import { slugify } from './slug';

/** Top-level routes owned by the site; no work slug may use one of them (RT-15). */
export const RESERVED_ROUTES: readonly string[] = [
  'obras',
  'escuchar',
  'galeria',
  'leer',
  'videos',
  'marcelo',
  'buscar',
  'admin',
  'id',
];

export function workPath(work: WorkEntry): string {
  return `/${work.data.slug}/`;
}

export function textSlug(text: TextEntry): string {
  return slugify(text.data.title);
}

export function textPath(work: WorkEntry, text: TextEntry): string {
  return `${workPath(work)}${textSlug(text)}/`;
}

export function artworkPath(artwork: ArtworkEntry): string {
  return `/galeria/${artwork.id}/`;
}

export function videoPath(video: VideoEntry): string {
  return `/videos/${video.id}/`;
}

export function permalinkPath(entryId: string): string {
  return `/id/${entryId}/`;
}

/** Where an entry is edited in the admin panel (Sveltia CMS). */
export function adminEditPath(collection: CollectionName, entryId: string): string {
  return `/admin/#/collections/${collection}/entries/${entryId}`;
}
