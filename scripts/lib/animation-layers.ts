/**
 * Cuts the raster layers of a drawing animation from its scan (ADR 0051, ADR 0054):
 *
 * - one layer per moving part: the scan inside the part's outline (its edge faded over
 *   `feather` pixels), transparent elsewhere;
 * - the handwriting: the scan inside the writing bands, transparent elsewhere;
 * - the background: the scan with the parts and the handwriting filled in (paper white, or a
 *   wash made from the scan) and the repairs drawn, clipped to the parts' outlines.
 *
 * Every layer has the size of the scan, so the component stacks them without offsets.
 */
import sharp from 'sharp';
import {
  type Band,
  type DrawingAnimation,
  animationProblems,
  outlinePath,
} from '../../src/lib/animations/drawing-animation';

/** Paper white of the scans. */
export const PAPER = '#ffffff';

/**
 * How strongly the scan is smoothed to make a wash: a median filter wide enough to remove
 * pen strokes and the paper's fine hatching, then a blur that softens what is left.
 */
const WASH_MEDIAN = 25;
const WASH_BLUR = 10;

function svg(animation: DrawingAnimation, body: string): Buffer {
  const { width, height } = animation;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${String(width)}" height="${String(height)}" viewBox="0 0 ${String(width)} ${String(height)}">${body}</svg>`,
  );
}

function rectPath({ left, top, right, bottom }: Band): string {
  return `M${String(left)} ${String(top)}H${String(right)}V${String(bottom)}H${String(left)}Z`;
}

/** An opaque mask of one part's outline: keeps the scan inside it. */
export function partMask(animation: DrawingAnimation, name: string): Buffer {
  const part = animation.parts.find((each) => each.name === name);
  if (part === undefined) {
    throw new Error(`Animation of "${animation.artworkId}" has no part "${name}"`);
  }
  return svg(animation, `<path d="${outlinePath(part.outline)}" fill="#000"/>`);
}

/** An opaque mask of the writing bands: keeps the handwriting. */
export function writingMask(animation: DrawingAnimation): Buffer {
  return svg(animation, `<path d="${animation.writing.map(rectPath).join('')}" fill="#000"/>`);
}

/** A mask of everything the background fills in: every part and every writing band. */
export function filledMask(animation: DrawingAnimation): Buffer {
  const outlines = [
    ...animation.parts.map((part) => outlinePath(part.outline)),
    ...animation.writing.map(rectPath),
  ].join('');
  return svg(animation, `<path d="${outlines}" fill="#000"/>`);
}

/** The repairs, drawn only inside the parts' outlines. */
export function repairsOverlay(animation: DrawingAnimation): Buffer {
  const outlines = animation.parts.map((part) => outlinePath(part.outline)).join('');
  return svg(
    animation,
    `<defs><clipPath id="parts"><path d="${outlines}"/></clipPath></defs>` +
      `<g clip-path="url(#parts)">${animation.repairs}</g>`,
  );
}

/** What replaces a part or a line on the background, as a full-size image. */
async function fillImage(scan: string | Buffer, animation: DrawingAnimation): Promise<Buffer> {
  if (animation.fill === 'paper') {
    return sharp({
      create: {
        width: animation.width,
        height: animation.height,
        channels: 3,
        background: PAPER,
      },
    })
      .png()
      .toBuffer();
  }
  // The median window must fit the image: the largest odd size up to WASH_MEDIAN.
  const fits = Math.min(animation.width, animation.height) - 1;
  const median = Math.min(WASH_MEDIAN, fits % 2 === 0 ? fits - 1 : fits);
  return sharp(scan).flatten({ background: PAPER }).median(median).blur(WASH_BLUR).png().toBuffer();
}

/**
 * `image` kept only where `mask` is drawn, faded over about `feather` pixels inside its
 * edge. The fade stays inside the mask, so nothing beyond it (a painted frame) is taken.
 */
async function masked(image: string | Buffer, mask: Buffer, feather = 0): Promise<Buffer> {
  const alpha =
    feather > 0
      ? await sharp(mask)
          .blur(feather / 2)
          .composite([{ input: mask, blend: 'dest-in' }])
          .png()
          .toBuffer()
      : mask;
  return sharp(image)
    .flatten({ background: PAPER })
    .ensureAlpha()
    .composite([{ input: alpha, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

/** Pixels over which the paper laid over the handwriting fades into the scan around it. */
const PAPER_FEATHER = 12;

/**
 * The clean paper sample repeated over each writing band, faded at the edges, as a
 * full-size image to lay over the scan.
 */
async function paperOverWriting(
  scan: string | Buffer,
  animation: DrawingAnimation,
  sample: Band,
): Promise<Buffer> {
  const paper = sharp(scan).flatten({ background: PAPER });
  const bands = await Promise.all(
    animation.writing.map(async (band) => {
      // The band and its fading edge, kept inside the drawing.
      const left = Math.max(band.left - PAPER_FEATHER, 0);
      const top = Math.max(band.top - PAPER_FEATHER, 0);
      const width = Math.min(band.right + PAPER_FEATHER, animation.width) - left;
      const height = Math.min(band.bottom + PAPER_FEATHER, animation.height) - top;
      // The sample, cut to the band's size where it is larger, repeated where it is smaller.
      const tile = await paper
        .clone()
        .extract({
          left: sample.left,
          top: sample.top,
          width: Math.min(sample.right - sample.left, width),
          height: Math.min(sample.bottom - sample.top, height),
        })
        .png()
        .toBuffer();
      return {
        input: await sharp({ create: { width, height, channels: 3, background: PAPER } })
          .composite([{ input: tile, tile: true }])
          .png()
          .toBuffer(),
        left,
        top,
      };
    }),
  );
  const papered = await sharp({
    create: { width: animation.width, height: animation.height, channels: 3, background: PAPER },
  })
    .composite(bands)
    .png()
    .toBuffer();
  const grown = svg(
    animation,
    `<path d="${animation.writing
      .map((band) =>
        rectPath({
          left: band.left - PAPER_FEATHER / 2,
          top: band.top - PAPER_FEATHER / 2,
          right: band.right + PAPER_FEATHER / 2,
          bottom: band.bottom + PAPER_FEATHER / 2,
        }),
      )
      .join('')}" fill="#000"/>`,
  );
  return masked(papered, grown, PAPER_FEATHER);
}

export interface Layers {
  readonly background: Buffer;
  readonly parts: ReadonlyMap<string, Buffer>;
  /** The handwriting, when the drawing has writing bands. */
  readonly writing: Buffer | undefined;
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
  const fill = await masked(await fillImage(scan, animation), filledMask(animation));
  const paper =
    animation.paperSample === undefined || animation.writing.length === 0
      ? []
      : [{ input: await paperOverWriting(scan, animation, animation.paperSample) }];
  const background = await sharp(scan)
    .flatten({ background: PAPER })
    .composite([{ input: fill }, ...paper, { input: repairsOverlay(animation) }])
    // The quality of the stored scans (scripts/import/artworks.ts); Astro re-encodes it for
    // each displayed size anyway.
    .webp({ quality: 82 })
    .toBuffer();
  const parts = new Map<string, Buffer>();
  for (const part of animation.parts) {
    const layer = await masked(scan, partMask(animation, part.name), part.feather);
    parts.set(part.name, await sharp(layer).webp({ quality: 90, alphaQuality: 100 }).toBuffer());
  }
  const writing =
    animation.writing.length === 0
      ? undefined
      : await sharp(await masked(scan, writingMask(animation)))
          .webp({ quality: 90, alphaQuality: 100 })
          .toBuffer();
  return { background, parts, writing };
}
