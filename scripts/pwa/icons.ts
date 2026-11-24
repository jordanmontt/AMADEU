/**
 * Writes the app icons and the favicon into public/ (RF-53, ADR 0052) from a scan of
 * Marcelo's self-portrait in a top hat, the Foundation's logo. The scan lives outside the
 * repository, with the other source material.
 * Usage: npx tsx scripts/pwa/icons.ts "<path to the logo scan>"
 */
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';
import { APP_BACKGROUND } from '../../src/lib/pwa/manifest';

const [logo] = process.argv.slice(2);
if (logo === undefined) {
  console.error('Usage: npx tsx scripts/pwa/icons.ts <logo scan>');
  process.exit(1);
}

/** The drawing alone, trimmed of the paper around it. */
const drawing = await sharp(logo).flatten({ background: APP_BACKGROUND }).trim().toBuffer();

/** The drawing centred on a white square, filling `fill` of its height. */
async function icon(size: number, fill: number, file: string): Promise<void> {
  const inner = Math.round(size * fill);
  const resized = await sharp(drawing)
    .resize({ height: inner, width: inner, fit: 'inside' })
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 3, background: APP_BACKGROUND },
  })
    .composite([{ input: resized, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toFile(file);
}

mkdirSync('public/icons', { recursive: true });
await icon(192, 0.86, 'public/icons/icon-192.png');
await icon(512, 0.86, 'public/icons/icon-512.png');
// Launchers crop maskable icons to a circle or a rounded square: keep within the inner 80 %.
await icon(512, 0.66, 'public/icons/maskable-512.png');
await icon(180, 0.8, 'public/icons/apple-touch-icon.png');
await icon(64, 0.94, 'public/favicon.png');
console.log('Wrote public/icons/ and public/favicon.png');
