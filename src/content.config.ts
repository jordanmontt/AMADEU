/**
 * Astro content collections. Each collection is a folder of files under CONTENT_DIR
 * (default `src/content`; the E2E tests build from `tests/fixtures/content`).
 * An entry's id is its file name. The schemas live in `src/lib/content/schemas.ts`; only
 * the artwork image is added here, with Astro's `image()` helper (path relative to the
 * entry file, e.g. `../media/images/dibujo-93.webp`), so Astro validates and optimizes it.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  artworkSchema,
  personSchema,
  recordingSchema,
  textSchema,
  videoSchema,
  workSchema,
} from './lib/content/schemas';
import { contentDir } from './content-dir';

/**
 * The entry id is always the file name. Astro's default would use a `slug` field when
 * present (works have one), which would change the id whenever an editor changes the slug.
 */
function fileNameId({ entry }: { entry: string }): string {
  return entry.replace(/\.(ya?ml|md)$/, '');
}

function yamlFolder(folder: string) {
  return glob({ pattern: '*.{yml,yaml}', base: `${contentDir}/${folder}`, generateId: fileNameId });
}

export const collections = {
  works: defineCollection({ loader: yamlFolder('works'), schema: workSchema }),
  texts: defineCollection({
    loader: glob({ pattern: '*.md', base: `${contentDir}/texts`, generateId: fileNameId }),
    schema: textSchema,
  }),
  recordings: defineCollection({ loader: yamlFolder('recordings'), schema: recordingSchema }),
  artworks: defineCollection({
    loader: yamlFolder('artworks'),
    schema: ({ image }) => artworkSchema.extend({ image: image() }),
  }),
  videos: defineCollection({ loader: yamlFolder('videos'), schema: videoSchema }),
  people: defineCollection({ loader: yamlFolder('people'), schema: personSchema }),
};
