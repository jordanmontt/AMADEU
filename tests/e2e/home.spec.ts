import { type Page } from '@playwright/test';
import { expect, test } from './support/test';

/**
 * The home page opens with "Cordillera Real", animated (RF-11): the snow-capped range of La
 * Paz, where the Illimani stands. Its clouds drift on their own, without any song, and its
 * title and verse are written the first time it is seen.
 */

function hero(page: Page) {
  return page.locator('.hero animated-drawing');
}

function cloudsTransform(page: Page): Promise<string> {
  return hero(page)
    .locator('[data-part="clouds"]')
    .evaluate((element) => getComputedStyle(element).transform);
}

test.describe('home page', () => {
  test('opens with "Cordillera Real", whose clouds drift on their own (RF-11) @phone', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(hero(page).getByRole('img', { name: /cielo y montañas/ })).toBeVisible();
    await expect(hero(page)).toHaveAttribute('data-moving');
    const first = await cloudsTransform(page);
    await expect.poll(() => cloudsTransform(page), { timeout: 10_000 }).not.toBe(first);
  });

  test('writes the title and verse of the painting (RF-11, RF-50)', async ({ page }) => {
    await page.goto('/');

    await expect(hero(page)).toHaveAttribute('data-written', '', { timeout: 20_000 });
  });

  test('credits the painting and links to its record (RF-11)', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /«Cordillera Real», acuarela/ }).click();

    await expect(page).toHaveURL('/galeria/cuadro-2/');
  });

  test('stays still with "reduce motion" (RF-52)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    await expect(hero(page).getByRole('img', { name: /cielo y montañas/ })).toBeVisible();
    expect(await cloudsTransform(page)).toBe('none');
  });
});
