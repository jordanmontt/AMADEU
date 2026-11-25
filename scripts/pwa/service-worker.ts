/**
 * Writes <site>/sw.js after `astro build` and Pagefind (ADR 0052).
 * Usage: npx tsx scripts/pwa/service-worker.ts <site folder, e.g. dist>
 */
import { generateSW } from 'workbox-build';
import { serviceWorkerOptions } from '../lib/service-worker';

const [siteDir] = process.argv.slice(2);
if (siteDir === undefined) {
  console.error('Usage: npx tsx scripts/pwa/service-worker.ts <site folder>');
  process.exit(1);
}
const { count, size, warnings } = await generateSW(serviceWorkerOptions(siteDir));
for (const warning of warnings) {
  console.warn(warning);
}
console.log(
  `Service worker: ${String(count)} files precached (${(size / 1024 / 1024).toFixed(1)} MB)`,
);
