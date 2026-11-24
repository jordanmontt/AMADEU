/**
 * Cuts the raster layers of a drawing animation from its scan (ADR 0051):
 *
 * - one layer per moving part: the scan inside the part's outline, transparent elsewhere;
 * - the background: the scan with every moving part painted out in paper white, and the
 *   repairs drawn on top, inside the hand-drawn outlines only.
 *
 * Every layer has the size of the scan, so the component stacks them without offsets.
 */
import sharp from 'sharp';
import {
  type DrawingAnimation,
  animationProblems,
  outlinePath,
} from '../../src/lib/animations/drawing-animation';

/** Paper white of the scans: what a moving part leaves behind on the background. */
export const PAPER = '#ffffff';

function svg(animation: DrawingAnimation, body: string): Buffer {
  const { width, height } = animation;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${String(width)}" height="${String(height)}" viewBox="0 0 ${String(width)} ${String(height)}">${body}</svg>`,
  );
}

/** An opaque mask of one outline: keeps the scan inside it. */
export function partMask(animation: DrawingAnimation, name: string): Buffer {
  const part = animation.parts.find((each) => each.name === name);
  if (part === undefined) {
    throw new Error(`Animation of "${animation.artworkId}" has no part "${name}"`);
  }
  return svg(animation, `<path d="${outlinePath(part.outline)}" fill="#000"/>`);
}

/** What is drawn over the scan to make the background: paper over the parts, then repairs. */
export function backgroundOverlay(animation: DrawingAnimation): Buffer {
  const outlines = animation.parts.map((part) => outlinePath(part.outline)).join('');
  return svg(
    animation,
    `<defs><clipPath id="parts"><path d="${outlines}"/></clipPath></defs>` +
      `<path d="${outlines}" fill="${PAPER}"/>` +
      `<g clip-path="url(#parts)">${animation.repairs}</g>`,
  );
}

export interface Layers {
  readonly background: Buffer;
  readonly parts: ReadonlyMap<string, Buffer>;
}

/** Cuts the layers of `animation` from the scan at `scan`, as WebP images. */
export async function cutLayers(
  scan: string | Buffer,
  animation: DrawingAnimation,
): Promise<Layers> {
  const problems = animationProblems(animation);
  if (problems.length > 0) {
    throw new Error(`Animation of "${animation.artworkId}": ${problems.join('; ')}`);
  }
  const { width, height } = await sharp(scan).metadata();
  if (width !== animation.width || height !== animation.height) {
    throw new Error(
      `Animation of "${animation.artworkId}" was traced on a ${String(animation.width)} × ${String(animation.height)} scan, ` +
        `but the scan is ${String(width)} × ${String(height)}: trace its outlines again`,
    );
  }
  const background = await sharp(scan)
    .flatten({ background: PAPER })
    .composite([{ input: backgroundOverlay(animation) }])
    // The quality of the stored scans (scripts/import/artworks.ts); Astro re-encodes it for
    // each displayed size anyway.
    .webp({ quality: 82 })
    .toBuffer();
  const parts = new Map<string, Buffer>();
  for (const part of animation.parts) {
    parts.set(
      part.name,
      await sharp(scan)
        .flatten({ background: PAPER })
        .ensureAlpha()
        .composite([{ input: partMask(animation, part.name), blend: 'dest-in' }])
        .webp({ lossless: true })
        .toBuffer(),
    );
  }
  return { background, parts };
}
