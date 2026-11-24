import { expect, test } from '@playwright/test';

test.describe('navigation through a work', () => {
  test('the home page lists published works and announces upcoming ones', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'Sangre y Sueño' })).toBeVisible();
    await expect(page.getByText('Obra futura')).toBeVisible();
    await expect(page.getByText('Obra en borrador')).toHaveCount(0);
  });

  test('the QR code route opens the work, with sections in editorial order', async ({ page }) => {
    await page.goto('/sangre-y-sueno/?ref=qr');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sangre y Sueño');
    await expect(page.getByRole('heading', { level: 2 })).toHaveText([
      'Relatos poéticos',
      'Libro de canciones',
    ]);
  });

  test('texts without cleared rights are not published', async ({ page }) => {
    await page.goto('/sangre-y-sueno/');
    await expect(page.getByRole('link', { name: 'Texto pendiente' })).toHaveCount(0);

    const response = await page.goto('/sangre-y-sueno/texto-pendiente/');
    expect(response?.status()).toBe(404);
  });

  test('a text page shows the text and links back to its work', async ({ page }) => {
    await page.goto('/sangre-y-sueno/');
    await page.getByRole('link', { name: 'Cordillera Real' }).click();

    await expect(page).toHaveURL('/sangre-y-sueno/cordillera-real/');
    await expect(page.getByText('Primer verso de prueba')).toBeVisible();
    await expect(page.getByText('Grabación no disponible en el archivo')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Volver a la obra/ })).toHaveAttribute(
      'href',
      '/sangre-y-sueno/',
    );
  });

  test('a song without a recording says so', async ({ page }) => {
    await page.goto('/sangre-y-sueno/luna-andina/');

    await expect(page.getByText('Grabación no disponible en el archivo')).toBeVisible();
  });

  test('a permanent link leads to the current page of the entry', async ({ page }) => {
    await page.goto('/id/t-cordillera/');

    await expect(page).toHaveURL('/sangre-y-sueno/cordillera-real/', { timeout: 10_000 });
  });
});
