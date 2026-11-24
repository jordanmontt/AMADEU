/**
 * Imports video records listed in scripts/import/data/videos.yml (RT §10, step 4).
 * Usage: npx tsx scripts/import/videos.ts [--force]
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { archivePath, contentRoot, writeContentFile } from '../lib/archive';
import { yamlEntry } from '../lib/content-files';
import { type VideoManifestItem, videoData } from '../lib/import-videos';

const items = parse(readFileSync('scripts/import/data/videos.yml', 'utf8')) as VideoManifestItem[];

let written = 0;
for (const item of items) {
  const duration = Number(
    execFileSync('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'csv=p=0',
      archivePath(item.source),
    ])
      .toString()
      .trim(),
  );
  const entry = join(contentRoot, 'videos', `${item.id}.yml`);
  if (writeContentFile(entry, yamlEntry(videoData(item, duration))) === 'written') {
    written += 1;
  }
}
console.log(`videos: ${items.length} items (${written} entries written)`);
