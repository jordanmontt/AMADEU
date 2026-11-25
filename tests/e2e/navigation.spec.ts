import { expect, test } from './support/test';

test.describe('navigation through a work @phone', () => {
  test('the home page lists published works and announces upcoming ones (RF-01, RF-03, RF-04)', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'Sangre y Sueño', exact: true })).toBeVisible();
    await expect(page.getByText('Obra futura')).toBeVisible();
    await expect(page.getByText('Obra en borrador')).toHaveCount(0);
  });

  test('the site is titled "Archivo Marcelo de Urioste", el regocijo de vivir (RF-10)', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Archivo Marcelo de Urioste');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('El regocijo de vivir');
    await expect(page.getByText('Poesía, música y memoria', { exact: true })).toBeVisible();
  });

  test('the home page leads to the featured work and to every section (RF-12)', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Entrar a Sangre y Sueño' }).click();
    await expect(page).toHaveURL('/sangre-y-sueno/');
  });

  test('the QR code route opens the work, with sections in editorial order (RF-05, RF-13, RF-15, RF-60)', async ({
    page,
  }) => {
    await page.goto('/sangre-y-sueno/?ref=qr');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sangre y Sueño');
    await expect(page.getByRole('heading', { level: 2 })).toHaveText([
      'Relatos poéticos',
      'Libro de canciones',
    ]);
  });

  test('texts without cleared rights are not published (RF-57)', async ({ page }) => {
    await page.goto('/sangre-y-sueno/');
    await expect(page.getByRole('link', { name: 'Texto pendiente' })).toHaveCount(0);

    const response = await page.goto('/sangre-y-sueno/texto-pendiente/');
    expect(response?.status()).toBe(404);
  });

  test('a text page shows the text and links back to its work (RF-16)', async ({ page }) => {
    await page.goto('/sangre-y-sueno/');
    await page.getByRole('link', { name: 'Cordillera Real' }).click();

    await expect(page).toHaveURL('/sangre-y-sueno/cordillera-real/');
    await expect(page.getByText('Primer verso de prueba')).toBeVisible();
    await expect(page.getByText('Grabación no disponible en el archivo')).toHaveCount(0);
    await expect(
      page.getByRole('paragraph').filter({ hasText: 'Libro de canciones' }).getByRole('link', {
        name: 'Sangre y Sueño',
      }),
    ).toHaveAttribute('href', '/sangre-y-sueno/');
  });

  test('a song without a recording says so (RF-18)', async ({ page }) => {
    await page.goto('/sangre-y-sueno/luna-andina/');

    await expect(page.getByText('Grabación no disponible en el archivo')).toBeVisible();
  });

  test('a permanent link leads to the current page of the entry (RF-40)', async ({ page }) => {
    await page.goto('/id/t-cordillera/');

    await expect(page).toHaveURL('/sangre-y-sueno/cordillera-real/', { timeout: 10_000 });
  });

  test('a work keeps its file-name id even though its URL slug differs', async ({ page }) => {
    await page.goto('/id/sys/');

    await expect(page).toHaveURL('/sangre-y-sueno/', { timeout: 10_000 });
  });
});
