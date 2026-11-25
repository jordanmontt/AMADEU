/**
 * The committed layers of every drawing animation (ADR 0051) exist and match the scan their
 * outlines were traced on. A failure means `npx tsx scripts/animations/build.ts` was not run
 * after a change, or the scan was replaced and the outlines must be traced again.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { DRAWING_ANIMATIONS } from '../../src/lib/animations/registry';

describe.each(DRAWING_ANIMATIONS.map((animation) => [animation.artworkId, animation] as const))(
  'animation of %s',
  (artworkId, animation) => {
    const layers = [
      'background',
      ...animation.parts.map((part) => part.name),
      ...(animation.writing.length > 0 ? ['writing'] : []),
    ];

    it('animates an artwork of the archive, whose scan has the traced size', async () => {
      const scan = join('src/content/media/images', `${artworkId}.webp`);

      expect(existsSync(join('src/content/artworks', `${artworkId}.yml`))).toBe(true);
      const { width, height } = await sharp(scan).metadata();
      expect([width, height]).toEqual([animation.width, animation.height]);
    });

    it.each(layers)('has its %s layer, the size of the scan', async (layer) => {
      const file = join('src/assets/animations', artworkId, `${layer}.webp`);

      expect(existsSync(file)).toBe(true);
      const { width, height } = await sharp(file).metadata();
      expect([width, height]).toEqual([animation.width, animation.height]);
    });
  },
);
