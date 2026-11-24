/**
 * Shared I/O helpers for the one-off import scripts (`scripts/import/`).
 * The digitized archive lives outside the repository; ARCHIVE_DIR points to it.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

export const archiveDir = resolve(process.env.ARCHIVE_DIR ?? '../Archivos Digitales');
export const contentRoot = resolve('src/content');
export const overwrite = process.argv.includes('--force');

export function archivePath(relative: string): string {
  const path = join(archiveDir, relative);
  if (!existsSync(path)) {
    throw new Error(`Not found in the archive: ${path} (set ARCHIVE_DIR)`);
  }
  return path;
}

/**
 * Writes a content file unless it already exists: once imported, entries belong to the
 * editors, so re-running an import never overwrites their changes (unless --force).
 */
export function writeContentFile(path: string, contents: string | Uint8Array): 'written' | 'kept' {
  if (existsSync(path) && !overwrite) {
    return 'kept';
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
  return 'written';
}
