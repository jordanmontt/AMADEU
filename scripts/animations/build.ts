/**
 * Writes the raster layers of every drawing animation to src/assets/animations/<artwork id>/
 * (ADR 0051). Run it again when a drawing's scan or its animation description changes.
 * Usage: npx tsx scripts/animations/build.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DRAWING_ANIMATIONS } from '../../src/lib/animations/registry';
import { cutLayers } from '../lib/animation-layers';

for (const animation of DRAWING_ANIMATIONS) {
  const scan = join('src/content/media/images', `${animation.artworkId}.webp`);
  const target = join('src/assets/animations', animation.artworkId);
  mkdirSync(target, { recursive: true });
  const { background, parts, writing } = await cutLayers(scan, animation);
  writeFileSync(join(target, 'background.webp'), background);
  for (const [name, layer] of parts) {
    writeFileSync(join(target, `${name}.webp`), layer);
  }
  if (writing !== undefined) {
    writeFileSync(join(target, 'writing.webp'), writing);
  }
  console.log(
    `${animation.artworkId}: background, ${String(parts.size)} moving parts` +
      (writing === undefined ? '' : ' and the handwriting'),
  );
}
