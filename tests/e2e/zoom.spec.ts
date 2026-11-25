import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './support/test';

/**
 * Each artwork can be seen large, with zoom and pan (RF-27), in PhotoSwipe's viewer, which
 * speaks Spanish and gives the focus back when it closes. The fixture sheet is 2400 px wide,
 * larger than the screen, so there is something to zoom into.
 */

test.describe('image zoom', () => {
  test('opens the artwork large, zooms in and closes with Escape (RF-27) @phone', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/galeria/hoja-prueba/');
    const open = page.getByRole('link', { name: 'Ampliar la imagen: Hoja de dibujos de prueba' });

    // A keyboard user on a computer, a finger on a phone.
    if (isMobile) {
      await open.click();
    } else {
      await open.focus();
      await page.keyboard.press('Enter');
    }

    const viewer = page.getByRole('dialog');
    await expect(viewer).toBeVisible();
    await expect(viewer.locator('img.pswp__img').first()).toBeVisible();
    await viewer.getByRole('button', { name: 'Acercar o alejar' }).click();
    await expect(page.locator('.pswp--zoomed-in')).toHaveCount(1);

    await page.keyboard.press('Escape');

    await expect(viewer).toBeHidden();
    // Keyboard users find themselves where they were; phones have no keyboard focus.
    if (!isMobile) {
      await expect(open).toBeFocused();
    }
  });

  test('the open viewer is accessible (RF-27)', async ({ page }) => {
    await page.goto('/galeria/dibujo-prueba/');
    await page.getByRole('link', { name: 'Ampliar la imagen: Dibujo de prueba' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include('.pswp')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('the link opens the image itself (RF-27)', async ({ page }) => {
      await page.goto('/galeria/dibujo-prueba/');

      await expect(
        page.getByRole('link', { name: 'Ampliar la imagen: Dibujo de prueba' }),
      ).toHaveAttribute('href', /\.webp$/);
    });
  });
});
