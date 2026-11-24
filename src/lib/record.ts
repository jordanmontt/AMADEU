/**
 * The archival record ("ficha") of each item (RF-40, RF-41): which fields to show, in which
 * order, mapped to Dublin Core. Values stay raw here (codes, ISO dates); components turn
 * them into Spanish with `src/i18n/es.ts` and `src/lib/format.ts`.
 */
import type { Catalog } from './catalog';
import type { ArtworkEntry, RecordingEntry, TextEntry, VideoEntry } from './content/collections';
import { permalinkPath } from './routes';

export type RecordFieldKey =
  | 'work'
  | 'section'
  | 'kind'
  | 'date'
  | 'place'
  | 'technique'
  | 'dimensions'
  | 'duration'
  | 'collection'
  | 'venue'
  | 'series'
  | 'inscription'
  | 'source'
  | 'inventoryCode'
  | 'rightsHolder'
  | 'license'
  | 'original'
  | 'permalink';

/** The Dublin Core element each field maps to (RT §4.3). */
export const DUBLIN_CORE: Readonly<Record<RecordFieldKey, string>> = {
  work: 'dcterms:isPartOf',
  section: 'dcterms:isPartOf',
  kind: 'dc:type',
  date: 'dc:date',
  place: 'dcterms:spatial',
  technique: 'dc:format',
  dimensions: 'dcterms:extent',
  duration: 'dcterms:extent',
  collection: 'dc:source',
  venue: 'dcterms:spatial',
  series: 'dcterms:isPartOf',
  inscription: 'dc:description',
  source: 'dc:source',
  inventoryCode: 'dc:identifier',
  rightsHolder: 'dcterms:rightsHolder',
  license: 'dc:rights',
  original: 'dcterms:hasFormat',
  permalink: 'dc:identifier',
};

export interface RecordField {
  readonly key: RecordFieldKey;
  readonly value: string;
  /** For fields that are links (the original on Internet Archive, the permalink). */
  readonly href?: string;
}

type Optional = string | number | undefined;

function fields(entries: readonly (readonly [RecordFieldKey, Optional])[]): RecordField[] {
  return entries.flatMap(([key, value]) =>
    value === undefined ? [] : [{ key, value: String(value) }],
  );
}

function links(id: string, originalUrl: string | undefined): RecordField[] {
  return [
    ...(originalUrl === undefined
      ? []
      : [{ key: 'original' as const, value: originalUrl, href: originalUrl }]),
    { key: 'permalink', value: permalinkPath(id), href: permalinkPath(id) },
  ];
}

export function textRecord(catalog: Catalog, text: TextEntry): RecordField[] {
  const edition = text.data.edition;
  const source =
    edition === undefined
      ? undefined
      : [edition.name, edition.publisher, edition.year, edition.pages && `p. ${edition.pages}`]
          .filter((part) => part !== undefined && part !== '')
          .join(', ');
  return [
    ...fields([
      ['work', catalog.workOf(text).data.title],
      ['section', catalog.sectionOf(text).title],
      ['kind', text.data.kind],
      ['source', source],
      ['rightsHolder', text.data.rightsHolder],
      ['license', text.data.license],
    ]),
    ...links(text.id, undefined),
  ];
}

export function recordingRecord(recording: RecordingEntry): RecordField[] {
  const data = recording.data;
  return [
    ...fields([
      ['kind', data.kind],
      ['collection', data.collection],
      ['date', data.date],
      ['venue', data.venue],
      ['duration', data.durationSeconds],
      ['rightsHolder', data.rightsHolder],
      ['license', data.license],
    ]),
    ...(data.originalUrl === undefined
      ? []
      : [{ key: 'original' as const, value: data.originalUrl, href: data.originalUrl }]),
  ];
}

export function artworkRecord(artwork: ArtworkEntry): RecordField[] {
  const data = artwork.data;
  return [
    ...fields([
      ['kind', data.kind],
      ['technique', data.technique],
      ['date', data.date],
      ['place', data.place],
      ['dimensions', data.dimensions],
      ['series', data.series],
      ['inscription', data.inscription],
      ['inventoryCode', data.inventoryCode],
      ['rightsHolder', data.rightsHolder],
      ['license', data.license],
    ]),
    ...links(artwork.id, data.originalUrl),
  ];
}

export function videoRecord(video: VideoEntry): RecordField[] {
  const data = video.data;
  return [
    ...fields([
      ['series', data.series],
      ['date', data.date],
      ['duration', data.durationSeconds],
      ['rightsHolder', data.rightsHolder],
      ['license', data.license],
    ]),
    ...links(video.id, data.originalUrl),
  ];
}
