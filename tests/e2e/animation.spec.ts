import { type Locator, type Page } from '@playwright/test';
import { expect, test } from './support/test';

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

/** The hand's current position on screen, as the browser computes it. */
function handTransform(page: Page): Promise<string> {
  return drawing(page)
    .locator('[data-part="hand"]')
    .evaluate((element) => getComputedStyle(element).transform);
}

/**
 * Whether every handwritten line shows all of its handwriting: its clip is the "written" one.
 * Both are read back through the browser, which writes clip values in its own format.
 */
function allWritten(page: Page): Promise<boolean> {
  return drawing(page)
    .first()
    .locator('.ink-line')
    .evaluateAll((lines) =>
      lines.every((line) => {
        // A fresh element per line: the browser may keep a reused one's first value.
        const probe = document.createElement('div');
        probe.style.clipPath = getComputedStyle(line).getPropertyValue('--written').trim();
        document.body.append(probe);
        const same = getComputedStyle(line).clipPath === getComputedStyle(probe).clipPath;
        probe.remove();
        return same;
      }),
    );
}

async function playAlcalde(page: Page): Promise<void> {
  await page
    .getByRole('list', { name: 'Grabaciones' })
    .getByRole('button', { name: 'Escuchar «Alcalde de la canción»' })
    .click();
}

test.describe('animated drawing', () => {
  test('is shown on its song page with its description, still while nothing sounds (RF-51)', async ({
    page,
  }) => {
    await page.goto('/sangre-y-sueno/alcalde-de-la-cancion/');

    await expect(drawing(page).getByRole('img', { name: /sombrero de copa/ })).toBeVisible();
    expect(await animationOf(page, 'hand')).toBe('none');
  });

  test('strums while a song plays, and stops when it pauses (RF-51) @phone', async ({ page }) => {
    await page.goto('/sangre-y-sueno/alcalde-de-la-cancion/');

    await playAlcalde(page);

    await expect(drawing(page)).toHaveAttribute('data-moving');
    expect(await animationOf(page, 'hand')).toBe('strum');
    expect(await animationOf(page, 'feather')).toBe('sway');
    // The hand really moves: its position on screen changes while the song plays.
    const first = await handTransform(page);
    await expect.poll(() => handTransform(page)).not.toBe(first);

    await page
      .getByRole('region', { name: 'Reproductor' })
      .getByRole('button', { name: 'Pausar' })
      .click();

    await expect(drawing(page)).not.toHaveAttribute('data-moving');
    expect(await animationOf(page, 'hand')).toBe('none');
    expect(await handTransform(page)).toBe('none');
  });

  test('strums at once when reached while a song is already playing (RF-51)', async ({ page }) => {
    await page.goto('/escuchar/');
    await page
      .getByRole('list', { name: 'LP Discolandia 1984' })
      .getByRole('button', { name: 'Escuchar «Cordillera Real»' })
      .click();
    await page
      .getByRole('navigation', { name: 'Principal' })
      .getByRole('link', { name: 'Galería' })
      .click();
    // Escuchar also links to "Alcalde de la canción" (its lyrics): wait for the gallery first.
    await expect(page).toHaveURL('/galeria/');

    await page.getByRole('link', { name: /Alcalde de la canción/ }).click();

    await expect(page).toHaveURL('/galeria/dibujo-93/');
    await expect(drawing(page)).toHaveAttribute('data-moving');
  });

  test('writes its handwriting once, the first time it is seen (RF-50)', async ({ page }) => {
    await page.goto('/galeria/dibujo-93/');

    await expect(drawing(page)).toHaveAttribute('data-written', '', { timeout: 15_000 });
    expect(await allWritten(page)).toBe(true);
  });

  test('moves nothing and hides nothing with "reduce motion" (RF-52)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/sangre-y-sueno/alcalde-de-la-cancion/');

    await playAlcalde(page);

    await expect(drawing(page)).toHaveAttribute('data-moving');
    expect(await animationOf(page, 'hand')).toBe('none');
    expect(await allWritten(page)).toBe(true);
  });

  test('is a plain picture in the gallery grid (RF-50)', async ({ page }) => {
    await page.goto('/galeria/');

    await expect(
      page.getByRole('img', { name: /sombrero de copa toca la guitarra frente/ }),
    ).toBeVisible();
    await expect(drawing(page)).toHaveCount(0);
  });
});
