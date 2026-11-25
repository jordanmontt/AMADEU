import { expect, test } from './support/test';

/**
 * Performance budget (RT-41): a text page loads less than 100 KB of JavaScript, counted as
 * the bytes of every script the browser receives (uncompressed, so the real figure on the
 * wire is lower).
 */
test('a song page loads less than 100 KB of JavaScript (RT-41)', async ({ page }) => {
  const sizes = new Map<string, number>();
  page.on('response', async (response) => {
    if (response.request().resourceType() === 'script') {
      sizes.set(response.url(), (await response.body()).byteLength);
    }
  });

  await page.goto('/sangre-y-sueno/cordillera-real/');
  await page.waitForLoadState('networkidle');

  const total = [...sizes.values()].reduce((sum, size) => sum + size, 0);
  expect(sizes.size).toBeGreaterThan(0);
  expect(total, [...sizes].map(([url, size]) => `${url}: ${String(size)}`).join('\n')).toBeLessThan(
    100 * 1024,
  );
});
