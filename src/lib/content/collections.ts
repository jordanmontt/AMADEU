/**
 * The archive's content as plain data: one list of entries per collection.
 *
 * This mirrors what Astro's `getCollection()` returns (an `id` plus the parsed `data`), so
 * the domain logic in `src/lib/` can be used and tested without Astro.
 */
import type { Artwork, Person, Recording, Text, Video, Work } from './schemas';

export interface Entry<T> {
  readonly id: string;
  readonly data: T;
}

/** A text entry also carries its Markdown body: the poem or the lyrics. */
export interface TextEntry extends Entry<Text> {
  readonly body: string;
}

export type WorkEntry = Entry<Work>;
export type RecordingEntry = Entry<Recording>;
export type ArtworkEntry = Entry<Artwork>;
export type VideoEntry = Entry<Video>;
export type PersonEntry = Entry<Person>;

export type CollectionName = keyof Collections;

export interface Collections {
  readonly works: readonly WorkEntry[];
  readonly texts: readonly TextEntry[];
  readonly recordings: readonly RecordingEntry[];
  readonly artworks: readonly ArtworkEntry[];
  readonly videos: readonly VideoEntry[];
  readonly people: readonly PersonEntry[];
}
