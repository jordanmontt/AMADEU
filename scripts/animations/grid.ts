/**
 * Draws a pixel grid over a crop of a scan, to read the coordinates of the outlines, pivots
 * and bands of a drawing animation (ADR 0051). Lines every `step` scan pixels, labelled,
 * stronger every 100 px.
 * Usage: npx tsx scripts/animations/grid.ts <scan> <out.png> <left> <top> <width> <height> [scale=3] [step=20]
 */
import sharp from 'sharp';

const [scan, out, ...numbers] = process.argv.slice(2);
const [left = NaN, top = NaN, width = NaN, height = NaN, scale = 3, step = 20] =
  numbers.map(Number);
if (scan === undefined || out === undefined || [left, top, width, height].some(Number.isNaN)) {
  console.error(
    'Usage: npx tsx scripts/animations/grid.ts <scan> <out.png> <left> <top> <width> <height> [scale] [step]',
  );
  process.exit(1);
}

const outWidth = Math.round(width * scale);
const outHeight = Math.round(height * scale);
let lines = '';
for (let x = Math.ceil(left / step) * step; x < left + width; x += step) {
  const at = (x - left) * scale;
  lines += `<line x1="${String(at)}" y1="0" x2="${String(at)}" y2="${String(outHeight)}" stroke="${x % 100 === 0 ? '#e00' : '#f88'}"/>`;
  lines += `<text x="${String(at + 2)}" y="12" font-size="11" fill="#c00">${String(x)}</text>`;
}
for (let y = Math.ceil(top / step) * step; y < top + height; y += step) {
  const at = (y - top) * scale;
  lines += `<line x1="0" y1="${String(at)}" x2="${String(outWidth)}" y2="${String(at)}" stroke="${y % 100 === 0 ? '#00e' : '#88f'}"/>`;
  lines += `<text x="2" y="${String(at - 2)}" font-size="11" fill="#00c">${String(y)}</text>`;
}
const grid = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${String(outWidth)}" height="${String(outHeight)}">${lines}</svg>`,
);
await sharp(scan)
  .extract({ left, top, width, height })
  .resize(outWidth, outHeight)
  .composite([{ input: grid }])
  .png()
  .toFile(out);
console.log(`Wrote ${out}`);
