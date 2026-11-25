import { type Page } from '@playwright/test';
import { expect, test } from './support/test';

/**
 * Everything works with the keyboard alone, with a visible focus (RF-56, WCAG 2.1.1, 2.4.7).
 * Safari moves focus to links only with Option+Tab; the other browsers with Tab.
 */

/** Presses Tab until the element named `name` has the focus; fails after `limit` presses. */
async function tabTo(page: Page, name: string | RegExp, tab: string, limit = 60): Promise<void> {
  for (let presses = 0; presses < limit; presses += 1) {
    await page.keyboard.press(tab);
    const focused = await page.evaluate(() => {
      const element = document.activeElement;
      return element === null
        ? ''
        : (element.getAttribute('aria-label') ?? element.textContent).trim();
    });
    if (typeof name === 'string' ? focused === name : name.test(focused)) {
      return;
    }
  }
  throw new Error(`Could not reach "${String(name)}" with ${tab}`);
}

async function expectVisibleFocus(page: Page): Promise<void> {
  const outline = await page.evaluate(() => {
    const element = document.activeElement;
    return element === null ? 'none' : getComputedStyle(element).outlineStyle;
  });
  expect(outline).not.toBe('none');
}

test.describe('keyboard only', () => {
  let tab = 'Tab';
  test.beforeEach(({ browserName }) => {
    tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
  });

  test('the first key press offers to skip to the content (RF-56)', async ({ page }) => {
    await page.goto('/sangre-y-sueno/');

    await page.keyboard.press(tab);

    await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
    await expectVisibleFocus(page);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#content$/);
  });

  test('plays, pauses, seeks and manages the queue from the keyboard (RF-48, RF-56)', async ({
    page,
  }) => {
    await page.goto('/escuchar/');
    const player = page.getByRole('region', { name: 'Reproductor' });

    await tabTo(page, 'Escuchar «Alcalde de la canción»', tab);
    await expectVisibleFocus(page);
    await page.keyboard.press('Enter');
    await expect(page.locator('amadeu-player')).toHaveAttribute('data-playing');

    // Playing from a collection queues the whole collection, so the next recording of
    // "Grabación casera" is already there.
    await tabTo(page, 'Agregar «Cordillera Real» a la cola', tab);
    await page.keyboard.press('Enter');
    await expect(player.getByRole('status')).toHaveText('Ya estaba en la cola.');

    await tabTo(page, 'Pausar', tab);
    await expectVisibleFocus(page);
    await page.keyboard.press('Space');
    await expect(page.locator('amadeu-player')).not.toHaveAttribute('data-playing');

    const slider = player.getByRole('slider', { name: 'Posición en la grabación' });
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveValue('1');

    await tabTo(page, /^Cola 2/, tab);
    await page.keyboard.press('Enter');
    await expect(player.getByRole('heading', { name: 'Cola de reproducción' })).toBeVisible();
    await tabTo(page, 'Quitar «Alcalde de la canción» de la cola', tab);
    await page.keyboard.press('Enter');

    await expect(player.getByRole('list').getByRole('listitem')).toHaveCount(1);
    // The focus stays in the queue, on the row that took the removed one's place.
    await expect(
      player.getByRole('button', { name: 'Quitar «Cordillera Real» de la cola' }),
    ).toBeFocused();
  });

  test('opens a text from the work page and comes back (RF-13, RF-56)', async ({ page }) => {
    await page.goto('/sangre-y-sueno/');

    await tabTo(page, 'Cordillera Real', tab);
    await expectVisibleFocus(page);
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL('/sangre-y-sueno/cordillera-real/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cordillera Real');
  });
});
