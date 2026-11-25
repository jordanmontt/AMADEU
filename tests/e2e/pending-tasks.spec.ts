import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './support/test';

test.describe('pending tasks for the Foundation', () => {
  test('lists tasks derived from the content, linked to the admin editor (RF-72)', async ({
    page,
  }) => {
    await page.goto('/admin/pendientes/');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pendientes de la Fundación');
    const rights = page.getByRole('region', { name: /Confirmar derechos/ });
    await expect(rights.getByRole('link', { name: 'Texto: Texto pendiente' })).toHaveAttribute(
      'href',
      '/admin/#/collections/texts/entries/t-pendiente',
    );
    await expect(page.getByRole('region', { name: /Canciones sin grabación/ })).toContainText(
      'Luna Andina',
    );
  });

  test('is kept out of search engines and accessible', async ({ page }) => {
    await page.goto('/admin/pendientes/');

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
