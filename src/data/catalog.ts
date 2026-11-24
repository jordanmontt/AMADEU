/**
 * Builds the catalog of published content (and, for the admin, all content) from Astro's
 * content collections.
 *
 * This is the only place that reads `astro:content`; everything else works on plain data
 * (`src/lib/`), so it can be unit-tested without Astro. Covered by the build and E2E tests.
 */
import { getCollection } from 'astro:content';
import { Catalog } from '../lib/catalog';
import type { Collections } from '../lib/content/collections';

let cachedContent: Promise<Collections> | undefined;
let cachedCatalog: Promise<Catalog> | undefined;

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
