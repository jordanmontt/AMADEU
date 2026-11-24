import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { backgroundOverlay, cutLayers, partMask } from '../../scripts/lib/animation-layers';
import type { DrawingAnimation } from '../../src/lib/animations/drawing-animation';

/** A 40 × 20 white scan with a black square at (5..15, 5..15) and one at (25..35, 5..15). */
async function aScan(): Promise<Buffer> {
  const square = await sharp({
    create: { width: 10, height: 10, channels: 3, background: '#000' },
  })
    .png()
    .toBuffer();
  return sharp({ create: { width: 40, height: 20, channels: 3, background: '#fff' } })
    .composite([
      { input: square, left: 5, top: 5 },
      { input: square, left: 25, top: 5 },
    ])
    .png()
    .toBuffer();
}

const animation: DrawingAnimation = {
  artworkId: 'dibujo-prueba',
  width: 40,
  height: 20,
  parts: [
    {
      name: 'square',
      outline: [
        [20, 0],
        [40, 0],
        [40, 20],
        [20, 20],
      ],
      pivot: [20, 10],
      motion: 'sway',
      seconds: 2,
    },
  ],
  repairs: '<rect x="0" y="18" width="40" height="2" fill="#000"/>',
  writing: [],
};

async function pixel(image: Buffer, x: number, y: number): Promise<number[]> {
  const { data, info } = await sharp(image)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const at = (y * info.width + x) * 4;
  return [...data.subarray(at, at + 4)];
}

describe('cutLayers', () => {
  it('keeps a moving part on its own layer, transparent everywhere else', async () => {
    const { parts } = await cutLayers(await aScan(), animation);
    const square = parts.get('square');

    expect(square).toBeDefined();
    if (square !== undefined) {
      expect(await pixel(square, 30, 10)).toEqual([0, 0, 0, 255]);
      expect(await pixel(square, 22, 2)).toEqual([255, 255, 255, 255]);
      expect((await pixel(square, 10, 10))[3]).toBe(0);
    }
  });

  it('paints the moving parts out of the background and draws the repairs only there', async () => {
    const { background } = await cutLayers(await aScan(), animation);

    expect((await pixel(background, 10, 10)).slice(0, 3)).toEqual([0, 0, 0]);
    expect((await pixel(background, 30, 10)).slice(0, 3)).toEqual([255, 255, 255]);
    expect((await pixel(background, 30, 19)).slice(0, 3)).toEqual([0, 0, 0]);
    expect((await pixel(background, 10, 19)).slice(0, 3)).toEqual([255, 255, 255]);
  });

  it('refuses a scan of another size than the one the outlines were traced on', async () => {
    const other = await sharp({
      create: { width: 80, height: 40, channels: 3, background: '#fff' },
    })
      .png()
      .toBuffer();

    await expect(cutLayers(other, animation)).rejects.toThrow(
      /40 × 20 scan, but the scan is 80 × 40/,
    );
  });

  it('refuses an unsound description before reading the scan', async () => {
    const still = animation.parts.map((part) => ({ ...part, seconds: 0 }));

    await expect(cutLayers(await aScan(), { ...animation, parts: still })).rejects.toThrow(
      /never moves/,
    );
  });
});

describe('layer masks', () => {
  it('draws the outline of a part, and refuses an unknown part', () => {
    expect(partMask(animation, 'square').toString()).toContain('d="M20 0L40 0L40 20L20 20Z"');
    expect(() => partMask(animation, 'hand')).toThrow(/no part "hand"/);
  });

  it('clips the repairs to the parts painted out', () => {
    const overlay = backgroundOverlay(animation).toString();

    expect(overlay).toContain('<g clip-path="url(#parts)"><rect');
  });
});
