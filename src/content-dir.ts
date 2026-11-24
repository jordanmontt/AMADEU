/**
 * Folder that holds the content collections and their media. Defaults to `src/content`;
 * the E2E tests build the site from `tests/fixtures/content` instead.
 */
export const contentDir = process.env.CONTENT_DIR ?? 'src/content';
