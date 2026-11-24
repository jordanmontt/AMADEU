/**
 * Imports the drawings, paintings, photos and posters listed in
 * scripts/import/data/artworks.yml (RT §10, step 3): stores a ≤ 2400 px WebP of each scan in
 * src/content/media/images/ and writes one entry each.
 * Usage: npx tsx scripts/import/artworks.ts [--force]
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { parse } from 'yaml';
import { archivePath, contentRoot, overwrite, writeContentFile } from '../lib/archive';
import { yamlEntry } from '../lib/content-files';
import {
  type ArtworkManifestItem,
  STORED_IMAGE_MAX_SIDE,
  artworkData,
  imageFileName,
} from '../lib/import-artworks';

const items = parse(
  readFileSync('scripts/import/data/artworks.yml', 'utf8'),
) as ArtworkManifestItem[];
const imageDir = join(contentRoot, 'media', 'images');
mkdirSync(imageDir, { recursive: true });

let written = 0;
for (const item of items) {
  const target = join(imageDir, imageFileName(item));
  if (!existsSync(target) || overwrite) {
    // The scans are trusted local files of up to 342 MB: lift libvips' safety limits.
    await sharp(archivePath(item.source), { limitInputPixels: false, unlimited: true })
      .rotate()
      .resize(STORED_IMAGE_MAX_SIDE, STORED_IMAGE_MAX_SIDE, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toColourspace('srgb')
      .webp({ quality: 82 })
      .toFile(target);
  }
  const entry = join(contentRoot, 'artworks', `${item.id}.yml`);
  if (writeContentFile(entry, yamlEntry(artworkData(item))) === 'written') {
    written += 1;
  }
}
console.log(`artworks: ${items.length} items (${written} entries written)`);
