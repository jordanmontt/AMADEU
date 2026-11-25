import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { cutLayers, partMask, repairsOverlay } from '../../scripts/lib/animation-layers';
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
  fill: 'paper',
  trigger: 'playing',
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

  it('lifts the handwriting onto its own layer and fills it in on the background', async () => {
    const writing = {
      ...animation,
      parts: [],
      writing: [{ left: 0, top: 0, right: 20, bottom: 20 }],
    };
    const layers = await cutLayers(await aScan(), writing);

    expect(layers.writing).toBeDefined();
    if (layers.writing !== undefined) {
      expect(await pixel(layers.writing, 10, 10)).toEqual([0, 0, 0, 255]);
      expect((await pixel(layers.writing, 30, 10))[3]).toBe(0);
    }
    // The background is stored lossy: allow a little noise around white and black.
    expect(Math.min(...(await pixel(layers.background, 10, 10)).slice(0, 3))).toBeGreaterThan(245);
    expect(Math.max(...(await pixel(layers.background, 30, 10)).slice(0, 3))).toBeLessThan(10);
  });

  it('has no handwriting layer for a drawing without writing bands', async () => {
    expect((await cutLayers(await aScan(), animation)).writing).toBeUndefined();
  });

  it('fills a watercolour with a wash of its own colours, not with white', async () => {
    const blue = await sharp({
      create: { width: 40, height: 20, channels: 3, background: '#4080c0' },
    })
      .png()
      .toBuffer();
    const { background } = await cutLayers(blue, { ...animation, fill: 'wash' });
    const [red = 0, green = 0, bluePart = 0] = await pixel(background, 30, 10);

    expect(Math.abs(red - 0x40)).toBeLessThan(6);
    expect(Math.abs(green - 0x80)).toBeLessThan(6);
    expect(Math.abs(bluePart - 0xc0)).toBeLessThan(6);
  });

  it('fades the edge of a feathered part inward only', async () => {
    const soft = await cutLayers(await aScan(), {
      ...animation,
      parts: animation.parts.map((part) => ({ ...part, feather: 6 })),
    });
    const square = soft.parts.get('square');

    expect(square).toBeDefined();
    if (square !== undefined) {
      const [, , , edge = 0] = await pixel(square, 21, 10);
      expect(edge).toBeGreaterThan(0);
      expect(edge).toBeLessThan(255);
      // The fade stays inside the outline: nothing beyond it (a painted frame) is taken.
      const [, , , outside = 255] = await pixel(square, 18, 10);
      expect(outside).toBe(0);
    }
  });

  it('lays a sample of clean paper over the handwriting, keeping its texture', async () => {
    // Paper striped with a light grey line every other row; the ink to remove is the square.
    const stripes = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20" fill="#fff"/>${Array.from(
        { length: 10 },
        (_, row) => `<rect y="${String(row * 2)}" width="40" height="1" fill="#ccc"/>`,
      ).join('')}<rect x="5" y="5" width="10" height="10" fill="#000"/></svg>`,
    );
    const scan = await sharp(stripes).png().toBuffer();
    const { background } = await cutLayers(scan, {
      ...animation,
      parts: [],
      fill: 'wash',
      paperSample: { left: 20, top: 0, right: 40, bottom: 20 },
      writing: [{ left: 4, top: 4, right: 16, bottom: 16 }],
    });

    const [inkGone = 0] = await pixel(background, 10, 9);
    expect(inkGone).toBeGreaterThan(150);
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
    const overlay = repairsOverlay(animation).toString();

    expect(overlay).toContain('<g clip-path="url(#parts)"><rect');
  });
});
