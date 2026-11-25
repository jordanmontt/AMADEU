import { expect, test } from './support/test';

/**
 * Everything a text page can show (RF-16 to RF-22), on "Cordillera Real", which has all of
 * it in the fixture content, and on "Luna Andina", which has none of the optional parts.
 */

test.describe('text page @phone', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sangre-y-sueno/cordillera-real/');
  });

  test('shows the verses of the text (RF-16)', async ({ page }) => {
    await expect(page.getByText('Primer verso de prueba')).toBeVisible();
    await expect(page.getByText('Segundo verso de prueba')).toBeVisible();
  });

  test('shows the primary version first and the other versions with source and year (RF-17)', async ({
    page,
  }) => {
    const versions = page.getByRole('list', { name: 'Grabaciones' }).getByRole('listitem');

    await expect(versions).toHaveCount(2);
    await expect(versions.nth(0)).toContainText('Versión principal');
    await expect(versions.nth(0)).toContainText('LP Discolandia 1984, 1984');
    await expect(versions.nth(1)).toContainText('Grabación casera, 1994');
    await expect(versions.nth(1)).not.toContainText('Versión principal');
  });

  test('credits the performers and the people behind each version (RF-17)', async ({ page }) => {
    const primary = page.getByRole('list', { name: 'Grabaciones' }).getByRole('listitem').first();

    await expect(primary).toContainText(
      'Marcelo de Urioste (voz y guitarra). Dirección musical: Persona de prueba.',
    );
  });

  test('shows the facsimile of the printed page (RF-20)', async ({ page }) => {
    const facsimile = page.getByRole('region', { name: 'Página original' });

    await expect(
      facsimile.getByRole('img', { name: /Página impresa de Cordillera Real/ }),
    ).toBeVisible();
  });

  test('shows the critical notes when there are some (RF-21)', async ({ page }) => {
    const notes = page.getByRole('region', { name: 'Notas críticas' });

    await expect(notes).toContainText('variante del segundo verso');
  });

  test('links each note call in the verses to its note of the edition, and back (RF-21)', async ({
    page,
  }) => {
    const notes = page.getByRole('region', { name: 'Notas de la edición' });

    await page.getByRole('link', { name: 'Nota 1', exact: true }).click();

    await expect(page).toHaveURL(/#nota-1$/);
    await expect(notes.locator(':target')).toContainText('sobre el segundo verso');
    await expect(notes).toContainText('Nota de prueba sobre el título.');

    await notes.getByRole('link', { name: 'Volver al verso de la nota 1' }).click();

    await expect(page).toHaveURL(/#llamada-1$/);
  });

  test('names the edition the text comes from and says it is provisional (RF-22)', async ({
    page,
  }) => {
    const record = page.getByRole('region', { name: 'Ficha' });

    await expect(record).toContainText('Tomo I de El regocijo de vivir');
    await expect(record).toContainText('Plural');
    await expect(page.getByText(/Texto provisional/)).toBeVisible();
  });

  test('gives its other titles (RF-35)', async ({ page }) => {
    await expect(
      page.getByText('También titulado «Cordillera de los Andes» (LP Discolandia 1984).'),
    ).toBeVisible();
  });

  test('leaves out the optional parts a text does not have (RF-18, RF-20, RF-21)', async ({
    page,
  }) => {
    await page.goto('/sangre-y-sueno/luna-andina/');

    await expect(page.getByText('Grabación no disponible en el archivo.')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Notas críticas' })).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Página original' })).toHaveCount(0);
    await expect(page.getByText(/También titulado/)).toHaveCount(0);
  });
});

test.describe('drawing sheets', () => {
  test('a sheet shows its panels, and a panel links back to its sheet (RF-28)', async ({
    page,
  }) => {
    await page.goto('/galeria/hoja-prueba/');
    const panels = page.getByRole('region', { name: 'Viñetas de esta hoja' });

    await panels.getByRole('link', { name: /recortado de la hoja/ }).click();

    await expect(page).toHaveURL('/galeria/panel-prueba/');
    await expect(
      page
        .getByRole('region', { name: 'Hoja completa' })
        .getByRole('link', { name: /varios dibujos pequeños/ }),
    ).toBeVisible();
  });
});
