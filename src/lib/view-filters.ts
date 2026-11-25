/**
 * The filters of each cross-cutting view and each item's values for them (RF-07, RF-24,
 * RF-26). Facet keys and values show in the URL, so they are Spanish and URL-safe: a work by
 * its slug, a kind or a collection by the slug of its Spanish name, a year as is.
 */
import type { Catalog } from './catalog';
import type { ArtworkEntry, RecordingEntry, TextEntry } from './content/collections';
import { type FacetDefinition, type FacetValues, yearOf } from './filters';
import { slugify } from './slug';

export interface FilterLabels {
  readonly work: string;
  readonly kind: string;
  readonly year: string;
  readonly collection: string;
  readonly technique: string;
  readonly series: string;
  /** Spanish names of the kinds of texts, recordings and artworks. */
  readonly kinds: Readonly<Record<string, string>>;
}

/** A facet whose values are the slugs of `names`, shown by their name. */
function namedFacet(key: string, label: string, names: Iterable<string>): FacetDefinition {
  const bySlug = new Map([...names].map((name) => [slugify(name), name]));
  return { key, label, labelOf: (slug) => bySlug.get(slug) ?? slug };
}

function slugOf(name: string | undefined): string[] {
  return name === undefined ? [] : [slugify(name)];
}

function workFacet(catalog: Catalog, labels: FilterLabels): FacetDefinition {
  const titles = new Map(catalog.works().map((work) => [work.data.slug, work.data.title]));
  return { key: 'obra', label: labels.work, labelOf: (slug) => titles.get(slug) ?? slug };
}

function kindFacet(labels: FilterLabels): FacetDefinition {
  return namedFacet('tipo', labels.kind, Object.values(labels.kinds));
}

function kindOf(kind: string, labels: FilterLabels): string[] {
  return slugOf(labels.kinds[kind] ?? kind);
}

function yearOfDate(date: string | undefined): string[] {
  const year = yearOf(date);
  return year === undefined ? [] : [year];
}

function yearFacet(labels: FilterLabels): FacetDefinition {
  return { key: 'anio', label: labels.year, sort: 'value' };
}

/** Escuchar: by work, kind, year and where the recording comes from (RF-24). */
export function recordingFacets(catalog: Catalog, labels: FilterLabels): FacetDefinition[] {
  const collections = catalog.recordings().flatMap((recording) => recording.data.collection ?? []);
  return [
    workFacet(catalog, labels),
    kindFacet(labels),
    yearFacet(labels),
    namedFacet('procedencia', labels.collection, collections),
  ];
}

export function recordingValues(
  catalog: Catalog,
  recording: RecordingEntry,
  labels: FilterLabels,
): FacetValues {
  const works = catalog.textsOfRecording(recording).map((text) => catalog.workOf(text).data.slug);
  return {
    obra: [...new Set(works)],
    tipo: kindOf(recording.data.kind, labels),
    anio: yearOfDate(recording.data.date),
    procedencia: slugOf(recording.data.collection),
  };
}

/** Galería: by kind, technique, series, year and the work it illustrates (RF-26). */
export function artworkFacets(catalog: Catalog, labels: FilterLabels): FacetDefinition[] {
  const artworks = catalog.artworks();
  return [
    kindFacet(labels),
    namedFacet(
      'tecnica',
      labels.technique,
      artworks.flatMap((artwork) => artwork.data.technique ?? []),
    ),
    namedFacet(
      'serie',
      labels.series,
      artworks.flatMap((artwork) => artwork.data.series ?? []),
    ),
    yearFacet(labels),
    workFacet(catalog, labels),
  ];
}

export function artworkValues(
  catalog: Catalog,
  artwork: ArtworkEntry,
  labels: FilterLabels,
): FacetValues {
  const works = catalog.textsIllustratedBy(artwork).map((text) => catalog.workOf(text).data.slug);
  return {
    tipo: kindOf(artwork.data.kind, labels),
    tecnica: slugOf(artwork.data.technique),
    serie: slugOf(artwork.data.series),
    anio: yearOfDate(artwork.data.date),
    obra: [...new Set(works)],
  };
}

/** Leer: by work and kind, poem or song (RF-07). */
export function textFacets(catalog: Catalog, labels: FilterLabels): FacetDefinition[] {
  return [workFacet(catalog, labels), kindFacet(labels)];
}

export function textValues(catalog: Catalog, text: TextEntry, labels: FilterLabels): FacetValues {
  return { obra: [catalog.workOf(text).data.slug], tipo: kindOf(text.data.kind, labels) };
}
