import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * "Alcalde de la canción" comes to life (RF-50 to RF-52): the hand strums while a song
 * plays, and the handwriting is written the first time the drawing is seen. With "reduce
 * motion", nothing moves.
 */

function drawing(page: Page): Locator {
  return page.locator('animated-drawing');
}

function animationOf(page: Page, part: string): Promise<string> {
  return drawing(page)
    .locator(`[data-part="${part}"]`)
    .evaluate((element) => getComputedStyle(element).animationName);
}

async function playAlcalde(page: Page): Promise<void> {
  await page
    .getByRole('list', { name: 'Grabaciones' })
    .getByRole('button', { name: 'Escuchar «Alcalde de la canción»' })
    .click();
}

test.describe('animated drawing', () => {
  test('is shown on its song page with its description, still while nothing sounds', async ({
    page,
  }) => {
    await page.goto('/sangre-y-sueno/alcalde-de-la-cancion/');

    await expect(drawing(page).getByRole('img', { name: /sombrero de copa/ })).toBeVisible();
    expect(await animationOf(page, 'hand')).toBe('none');
  });

  test('strums while a song plays, and stops when it pauses', async ({ page }) => {
    await page.goto('/sangre-y-sueno/alcalde-de-la-cancion/');

    await playAlcalde(page);

    await expect(drawing(page)).toHaveAttribute('data-playing');
    expect(await animationOf(page, 'hand')).toBe('strum');
    expect(await animationOf(page, 'feather')).toBe('sway');

    await page
      .getByRole('region', { name: 'Reproductor' })
      .getByRole('button', { name: 'Pausar' })
      .click();

    await expect(drawing(page)).not.toHaveAttribute('data-playing');
    expect(await animationOf(page, 'hand')).toBe('none');
  });

  test('strums at once when reached while a song is already playing', async ({ page }) => {
    await page.goto('/escuchar/');
    await page
      .getByRole('list', { name: 'LP Discolandia 1984' })
      .getByRole('button', { name: 'Escuchar «Cordillera Real»' })
      .click();
    await page
      .getByRole('navigation', { name: 'Principal' })
      .getByRole('link', { name: 'Galería' })
      .click();

    await page.getByRole('link', { name: /Alcalde de la canción/ }).click();

    await expect(page).toHaveURL('/galeria/dibujo-93/');
    await expect(drawing(page)).toHaveAttribute('data-playing');
  });

  test('writes its handwriting once, the first time it is seen', async ({ page }) => {
    await page.goto('/galeria/dibujo-93/');

    await expect(drawing(page)).toHaveAttribute('data-written', '', { timeout: 15_000 });
    await expect(drawing(page).locator('.ink-cover').first()).toBeHidden();
  });

  test('moves nothing and hides nothing with "reduce motion" (RF-52)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/sangre-y-sueno/alcalde-de-la-cancion/');

    await playAlcalde(page);

    await expect(drawing(page)).toHaveAttribute('data-playing');
    expect(await animationOf(page, 'hand')).toBe('none');
    await expect(drawing(page).locator('.ink-cover').first()).toBeHidden();
  });

  test('is a plain picture in the gallery grid', async ({ page }) => {
    await page.goto('/galeria/');

    await expect(
      page.getByRole('img', { name: /sombrero de copa toca la guitarra frente/ }),
    ).toBeVisible();
    await expect(drawing(page)).toHaveCount(0);
  });
});
