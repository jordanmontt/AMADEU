import AxeBuilder from '@axe-core/playwright';
import { type Page } from '@playwright/test';
import { expect, test } from './support/test';

/**
 * The site on a phone screen (RF-53, RF-56): nothing wider than the screen, every section
 * reachable from the menu, the player usable, and no accessibility violations. Runs only in
 * the phone projects (Pixel 7, iPhone 14).
 */

const PAGES = [
  '/',
  '/sangre-y-sueno/',
  '/sangre-y-sueno/cordillera-real/',
  '/escuchar/',
  '/galeria/dibujo-93/',
];

async function overflowsSideways(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
}

test.describe('on a phone @phone', () => {
  for (const path of PAGES) {
    test(`${path} fits the screen and has no WCAG 2.2 AA violations (RF-56)`, async ({ page }) => {
      await page.goto(path);

      expect(await overflowsSideways(page)).toBe(false);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test('every section can be reached from the menu (RF-12)', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Principal' });

    for (const section of ['Obras', 'Escuchar', 'Galería', 'Leer', 'Videos', 'Marcelo', 'Buscar']) {
      const link = nav.getByRole('link', { name: section });
      await link.scrollIntoViewIfNeeded();
      await expect(link).toBeInViewport();
    }
  });

  test('the player fits the screen and opens its queue (RF-47, RF-48)', async ({ page }) => {
    await page.goto('/escuchar/');

    await page
      .getByRole('list', { name: 'Grabación casera' })
      .getByRole('button', { name: 'Escuchar «Alcalde de la canción»' })
      .click();
    const player = page.getByRole('region', { name: 'Reproductor' });
    await expect(player).toBeInViewport();
    expect(await overflowsSideways(page)).toBe(false);

    await player.getByRole('button', { name: /^Cola/ }).click();

    await expect(player.getByRole('heading', { name: 'Cola de reproducción' })).toBeInViewport();
    await expect(player.getByRole('button', { name: 'Pausar' })).toBeInViewport();
  });
});
