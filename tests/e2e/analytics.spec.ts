import { type Page } from '@playwright/test';
import { expect, test } from './support/test';

/**
 * Visits are counted without cookies, including after client-side navigation, and the
 * statistics are public (RF-62). The fixture site is built with a GoatCounter code; the
 * counter script is replaced by a stand-in that records what it is asked to count.
 */

async function countedPaths(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as unknown as { counted?: string[] }).counted ?? []);
}

test.describe('visit statistics', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://gc.zgo.at/count.js', (route) =>
      route.fulfill({
        contentType: 'text/javascript',
        body: 'window.goatcounter = { count: (options) => { (window.counted ||= []).push(options.path); } };',
      }),
    );
  });

  test('counts the first page and every page reached by navigation, once each (RF-62)', async ({
    page,
  }) => {
    await page.goto('/sangre-y-sueno/?ref=qr');
    await expect.poll(() => countedPaths(page)).toEqual(['/sangre-y-sueno/?ref=qr']);

    await page
      .getByRole('navigation', { name: 'Principal' })
      .getByRole('link', { name: 'Galería' })
      .click();

    await expect.poll(() => countedPaths(page)).toEqual(['/sangre-y-sueno/?ref=qr', '/galeria/']);
  });

  test('sets no cookie (RF-62)', async ({ page, context }) => {
    await page.goto('/');
    await expect.poll(() => countedPaths(page)).toEqual(['/']);

    expect(await context.cookies()).toEqual([]);
  });

  test('links to the public statistics (RF-62)', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('link', { name: /Estadísticas públicas de visitas/ }),
    ).toHaveAttribute('href', 'https://archivo-prueba.goatcounter.com/');
  });

  test('does not count the pending tasks page (RF-62)', async ({ page }) => {
    await page.goto('/admin/pendientes/');

    await expect(page.locator('script[data-goatcounter]')).toHaveCount(0);
  });
});
