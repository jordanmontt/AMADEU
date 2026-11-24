/**
 * Astro content collections. Each collection is a folder of files under CONTENT_DIR
 * (default `src/content`; the E2E tests build from `tests/fixtures/content`).
 * An entry's id is its file name. The schemas live in `src/lib/content/schemas.ts`.
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

const contentDir = process.env.CONTENT_DIR ?? 'src/content';

function yamlFolder(folder: string) {
  return glob({ pattern: '*.{yml,yaml}', base: `${contentDir}/${folder}` });
}

export const collections = {
  works: defineCollection({ loader: yamlFolder('works'), schema: workSchema }),
  texts: defineCollection({
    loader: glob({ pattern: '*.md', base: `${contentDir}/texts` }),
    schema: textSchema,
  }),
  recordings: defineCollection({ loader: yamlFolder('recordings'), schema: recordingSchema }),
  artworks: defineCollection({ loader: yamlFolder('artworks'), schema: artworkSchema }),
  videos: defineCollection({ loader: yamlFolder('videos'), schema: videoSchema }),
  people: defineCollection({ loader: yamlFolder('people'), schema: personSchema }),
};
