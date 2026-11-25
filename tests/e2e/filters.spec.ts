import { expect, test } from './support/test';

/**
 * Filters of the cross-cutting views (RF-07, RF-24, RF-26). The fixture recordings come
 * from two collections and two years; the artworks are drawings and a document; the texts
 * are songs and a poem.
 */

test.describe('filters', () => {
  test('Escuchar filters recordings by year and shows how many remain (RF-24) @phone', async ({
    page,
  }) => {
    await page.goto('/escuchar/');
    const filters = page.getByRole('form', { name: 'Filtrar las grabaciones' });
    await expect(filters.getByRole('status')).toHaveText('3 grabaciones');

    await filters.getByLabel('Año').selectOption('1994');

    await expect(filters.getByRole('status')).toHaveText('2 grabaciones');
    await expect(page.getByRole('heading', { name: 'Grabación casera' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'LP Discolandia 1984' })).toBeHidden();
    await expect(page).toHaveURL('/escuchar/?anio=1994');
  });

  test('a filtered list can be shared by its address, and cleared (RF-24)', async ({ page }) => {
    await page.goto('/escuchar/?procedencia=lp-discolandia-1984');
    const filters = page.getByRole('form', { name: 'Filtrar las grabaciones' });

    await expect(filters.getByLabel('Procedencia')).toHaveValue('lp-discolandia-1984');
    await expect(filters.getByRole('status')).toHaveText('1 grabación');

    await filters.getByRole('button', { name: 'Quitar filtros' }).click();

    await expect(filters.getByRole('status')).toHaveText('3 grabaciones');
    await expect(page).toHaveURL('/escuchar/');
    await expect(filters.getByRole('button', { name: 'Quitar filtros' })).toBeHidden();
  });

  test('Galería filters artworks by kind (RF-26)', async ({ page }) => {
    await page.goto('/galeria/');
    const filters = page.getByRole('form', { name: 'Filtrar la galería' });

    await filters.getByLabel('Tipo').selectOption('documento');

    await expect(filters.getByRole('status')).toHaveText('1 imagen');
    await expect(
      page.getByRole('link', { name: /Página impresa de Cordillera Real/ }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /Dibujo de prueba|toca la guitarra/ })).toHaveCount(
      0,
    );
  });

  test('Leer filters texts by poem or song, hiding empty sections (RF-07)', async ({ page }) => {
    await page.goto('/leer/');
    const filters = page.getByRole('form', { name: 'Filtrar los textos' });

    await filters.getByLabel('Tipo').selectOption('poema');

    await expect(filters.getByRole('status')).toHaveText('1 texto');
    await expect(page.getByRole('link', { name: 'Romance de prueba' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Libro de canciones' })).toBeHidden();
  });
});

test.describe('filters without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('show the whole list and no filter controls (RF-07)', async ({ page }) => {
    await page.goto('/escuchar/');

    await expect(page.getByRole('form', { name: 'Filtrar las grabaciones' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'LP Discolandia 1984' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Grabación casera' })).toBeVisible();
  });
});
