/**
 * Builds the catalog of published content (and, for the admin, all content) from Astro's
 * content collections.
 *
 * This is the only place that reads `astro:content`; everything else works on plain data
 * (`src/lib/`), so it can be unit-tested without Astro. Covered by the build and E2E tests.
 */
import type { ImageMetadata } from 'astro';
import { getCollection, getEntry, render } from 'astro:content';
import { Catalog } from '../lib/catalog';
import type { ArtworkEntry, Collections } from '../lib/content/collections';

let cachedContent: Promise<Collections> | undefined;
let cachedCatalog: Promise<Catalog> | undefined;
let cachedImages: Promise<Map<string, ImageMetadata>> | undefined;

async function loadCollections(): Promise<Collections> {
  const [works, texts, recordings, artworks, videos, people] = await Promise.all([
    getCollection('works'),
    getCollection('texts'),
    getCollection('recordings'),
    getCollection('artworks'),
    getCollection('videos'),
    getCollection('people'),
  ]);
  return {
    works,
    texts: texts.map((text) => ({ id: text.id, data: text.data, body: text.body ?? '' })),
    recordings,
    artworks,
    videos,
    people,
  };
}

/** All content, published or not. Only for admin pages (e.g. the pending tasks). */
export function allContent(): Promise<Collections> {
  cachedContent ??= loadCollections();
  return cachedContent;
}

/** The published catalog, loaded once per build. */
export function catalog(): Promise<Catalog> {
  cachedCatalog ??= allContent().then((all) => Catalog.published(all));
  return cachedCatalog;
}

/**
 * The image of an artwork, as resolved by Astro's `image()` schema helper. Kept apart from
 * the catalog because `src/lib/` does not know about Astro images.
 */
export async function artworkImage(artwork: ArtworkEntry): Promise<ImageMetadata> {
  cachedImages ??= getCollection('artworks').then(
    (entries) => new Map(entries.map((entry) => [entry.id, entry.data.image])),
  );
  const image = (await cachedImages).get(artwork.id);
  if (image === undefined) {
    throw new Error(`Artwork "${artwork.id}" has no image`);
  }
  return image;
}

/** The biography page and its timeline, oldest event first (RF-32, RF-33). */
export async function biography() {
  const page = await getEntry('pages', 'marcelo');
  if (page === undefined) {
    throw new Error('The biography page (pages/marcelo.md) is missing');
  }
  const events = (await getCollection('timeline')).sort((a, b) =>
    a.data.date.localeCompare(b.data.date),
  );
  const { Content } = await render(page);
  return { page: page.data, Content, events: events.map((event) => event.data) };
}
