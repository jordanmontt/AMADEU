// @ts-check
import { defineConfig } from 'astro/config';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  output: 'static',
  // Builds from another content folder (the E2E fixtures) keep their own content cache, so
  // entries from one content set never linger in the other's build.
  cacheDir: process.env.CONTENT_DIR
    ? './node_modules/.astro-content-fixtures'
    : './node_modules/.astro',
  trailingSlash: 'always',
});
