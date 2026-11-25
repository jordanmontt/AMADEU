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
  RecordingEntry,
  TextEntry,
  VideoEntry,
  WorkEntry,
} from './content/collections';
import { slugify } from './slug';

/** The sections in the main navigation, in display order. Labels live in `src/i18n/es.ts`. */
export const SITE_SECTIONS = [
  'obras',
  'escuchar',
  'galeria',
  'leer',
  'videos',
  'marcelo',
  'buscar',
] as const;
export type SiteSection = (typeof SITE_SECTIONS)[number];

/** Top-level routes owned by the site; no work slug may use one of them (RT-15). */
export const RESERVED_ROUTES: readonly string[] = [...SITE_SECTIONS, 'admin', 'id', 'audio'];

export function sectionPath(section: SiteSection): string {
  return `/${section}/`;
}

/**
 * The navigation section a page belongs to. Work and text pages (`/<work>/…`) belong to
 * "obras"; the home page and technical routes belong to none.
 */
export function currentSection(pathname: string): SiteSection | null {
  const [first = ''] = pathname.split('/').filter((part) => part !== '');
  if (first === '' || first === 'admin' || first === 'id' || first === 'audio') {
    return null;
  }
  const section = SITE_SECTIONS.find((each) => each === first);
  return section ?? 'obras';
}

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

/** Where the audio of a published recording is served (RT-21). */
export function audioPath(recording: RecordingEntry): string {
  return `/audio/${recording.data.audio}`;
}

export function permalinkPath(entryId: string): string {
  return `/id/${entryId}/`;
}

/** Where an entry is edited in the admin panel (Sveltia CMS). */
export function adminEditPath(collection: CollectionName, entryId: string): string {
  return `/admin/#/collections/${collection}/entries/${entryId}`;
}
