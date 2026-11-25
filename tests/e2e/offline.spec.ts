import { type Page } from '@playwright/test';
import { expect, test } from './support/test';

/**
 * Installable site, readable offline after the first visit (RF-53, RF-54, ADR 0052). The
 * service worker precaches every page and the search index; audio needs a connection.
 */

/** Visits the home page and waits until the service worker controls it, its precache done. */
async function firstVisit(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
}

test.describe('offline and installable', () => {
  test('describes the app and serves its icons (RF-53)', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest');
    const manifest = (await response.json()) as { name: string; icons: { src: string }[] };

    expect(response.headers()['content-type']).toContain('application/manifest+json');
    expect(manifest.name).toBe('Archivo Marcelo de Urioste');
    for (const icon of manifest.icons) {
      expect((await request.get(icon.src)).status()).toBe(200);
    }
  });

  test('opens pages never visited, without a connection (RF-36, RF-54) @phone', async ({
    page,
    context,
  }) => {
    await firstVisit(page);
    await context.setOffline(true);

    await page.goto('/sangre-y-sueno/romance-de-prueba/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Romance de prueba');

    await page
      .getByRole('navigation', { name: 'Principal' })
      .getByRole('link', { name: 'Galería' })
      .click();
    await expect(page).toHaveURL('/galeria/');
    await expect(page.getByRole('link', { name: /Dibujo de prueba/ })).toBeVisible();
  });

  test('searches without a connection (RF-54)', async ({ page, context }) => {
    await firstVisit(page);
    await context.setOffline(true);

    await page.goto('/buscar/');
    await page.getByRole('textbox', { name: 'Buscar' }).fill('Romance');

    await expect(page.getByRole('link', { name: 'Romance de prueba' })).toBeVisible();
  });

  test('says that a recording needs a connection (RF-54)', async ({ page, context }) => {
    await firstVisit(page);
    await page.goto('/sangre-y-sueno/cordillera-real/');
    await context.setOffline(true);

    await page.getByRole('button', { name: 'Escuchar «Cordillera Real»' }).first().click();

    await expect(page.getByRole('region', { name: 'Reproductor' }).getByRole('status')).toHaveText(
      /necesita conexión a internet/,
    );
  });
});
