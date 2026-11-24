import { type Locator, type Page } from '@playwright/test';
import { expect, test } from './support/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * The persistent player (RF-47, RF-48). Most fixture recordings last 60 s, so a test can
 * check the player while it sounds without racing the end of the track. "Alcalde de la
 * canción" lasts 2 s, to see the player move on to the next track.
 *
 * Firefox needs a sound card to play anything; the CI workflow gives the Linux runner a
 * virtual one (see .github/workflows/ci.yml).
 */

function player(page: Page): Locator {
  return page.getByRole('region', { name: 'Reproductor' });
}

async function expectSounding(page: Page, title: string): Promise<void> {
  await expect(player(page).locator('[data-title]')).toHaveText(title);
  await expect(page.locator('amadeu-player')).toHaveAttribute('data-playing');
}

test.describe('persistent player', () => {
  test('stays hidden until something is played', async ({ page }) => {
    await page.goto('/sangre-y-sueno/cordillera-real/');

    await expect(player(page)).toBeHidden();
  });

  test('plays a song, links to its lyrics and keeps sounding across pages', async ({ page }) => {
    await page.goto('/sangre-y-sueno/cordillera-real/');
    await page.evaluate(() => {
      (window as unknown as { notReloaded: boolean }).notReloaded = true;
    });

    await page.getByRole('button', { name: 'Escuchar «Cordillera Real»' }).first().click();

    await expectSounding(page, 'Cordillera Real');
    await expect(player(page).getByRole('link', { name: 'Cordillera Real' })).toHaveAttribute(
      'href',
      '/sangre-y-sueno/cordillera-real/',
    );
    await expect(page.getByRole('button', { name: 'Pausar «Cordillera Real»' })).toBeVisible();

    await page
      .getByRole('navigation', { name: 'Principal' })
      .getByRole('link', { name: 'Galería' })
      .click();

    await expect(page).toHaveURL('/galeria/');
    await expectSounding(page, 'Cordillera Real');
    expect(await page.evaluate(() => 'notReloaded' in window)).toBe(true);
  });

  test('a playing recording can be paused from its own button and from the player', async ({
    page,
  }) => {
    await page.goto('/escuchar/');
    const discolandia = page.getByRole('list', { name: 'LP Discolandia 1984' });
    await discolandia.getByRole('button', { name: 'Escuchar «Cordillera Real»' }).click();
    await expectSounding(page, 'Cordillera Real');

    await discolandia.getByRole('button', { name: 'Pausar «Cordillera Real»' }).click();

    await expect(page.locator('amadeu-player')).not.toHaveAttribute('data-playing');
    await expect(player(page).getByRole('button', { name: 'Reproducir' })).toBeVisible();

    await player(page).getByRole('button', { name: 'Reproducir' }).click();

    await expect(player(page).getByRole('button', { name: 'Pausar' })).toBeVisible();
  });

  test('a collection plays on by itself, in order', async ({ page }) => {
    await page.goto('/escuchar/');
    const home = page.getByRole('list', { name: 'Grabación casera' });

    await home.getByRole('button', { name: 'Escuchar «Alcalde de la canción»' }).click();

    // The 2-second first track ends, and the player goes on with the next one by itself.
    await expect(player(page).locator('[data-title]')).toHaveText('Cordillera Real', {
      timeout: 15_000,
    });
    await expectSounding(page, 'Cordillera Real');
    await expect(player(page).getByRole('button', { name: 'Siguiente' })).toBeDisabled();
    await expect(player(page).getByRole('button', { name: 'Anterior' })).toBeEnabled();
  });

  test('"listen to the whole work" queues the primary recording of each song', async ({ page }) => {
    await page.goto('/sangre-y-sueno/');
    await expect(page.getByText('2 grabaciones, 1 min')).toBeVisible();

    await page.getByRole('button', { name: 'Escuchar toda la obra' }).click();

    await expectSounding(page, 'Cordillera Real');
    await expect(player(page).locator('[data-collection]')).toHaveText('LP Discolandia 1984');
    await player(page).getByRole('button', { name: 'Cola 2 grabaciones' }).click();
    const queue = player(page).getByRole('list');
    await expect(queue.getByRole('listitem')).toHaveCount(2);
    await expect(queue.getByRole('listitem').nth(1)).toContainText('Alcalde de la canción');
  });

  test('recordings can be added to the queue, played from it and removed', async ({ page }) => {
    await page.goto('/escuchar/');
    const home = page.getByRole('list', { name: 'Grabación casera' });
    const status = player(page).getByRole('status');

    await home.getByRole('button', { name: 'Agregar «Alcalde de la canción» a la cola' }).click();
    await expect(status).toHaveText('Agregada a la cola.');
    await expect(player(page).locator('[data-title]')).toHaveText('Alcalde de la canción');
    await expect(page.locator('amadeu-player')).not.toHaveAttribute('data-playing');

    await home.getByRole('button', { name: 'Agregar «Cordillera Real» a la cola' }).click();
    await home.getByRole('button', { name: 'Agregar «Cordillera Real» a la cola' }).click();
    await expect(status).toHaveText('Ya estaba en la cola.');

    await player(page).getByRole('button', { name: 'Cola 2 grabaciones' }).click();
    const queue = player(page).getByRole('list');
    await queue.getByRole('button', { name: /^Cordillera Real/ }).click();
    await expectSounding(page, 'Cordillera Real');
    await expect(queue.getByRole('listitem').nth(1)).toHaveAttribute('aria-current', 'true');

    await queue.getByRole('button', { name: 'Quitar «Alcalde de la canción» de la cola' }).click();

    await expect(queue.getByRole('listitem')).toHaveCount(1);
    await expectSounding(page, 'Cordillera Real');

    await queue.getByRole('button', { name: 'Quitar «Cordillera Real» de la cola' }).click();

    await expect(player(page)).toBeHidden();
  });

  test('the home page plays a song from its drawing', async ({ page }) => {
    await page.goto('/');

    await page
      .getByRole('region', { name: 'Para empezar a escuchar' })
      .getByRole('button', { name: 'Escuchar «Cordillera Real»' })
      .click();

    await expectSounding(page, 'Cordillera Real');
  });

  test('the open player and its queue are accessible (WCAG 2.2 AA)', async ({
    page,
    browserName,
  }) => {
    await page.goto('/escuchar/');
    await page
      .getByRole('list', { name: 'Grabación casera' })
      .getByRole('button', { name: 'Escuchar «Alcalde de la canción»' })
      .click();
    await player(page).getByRole('button', { name: /^Cola/ }).click();

    const results = await new AxeBuilder({ page })
      .include('amadeu-player')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      // Playwright's Firefox crashes while axe's target-size rule inspects the open queue
      // (logged upstream, not yet narrowed down). Chromium and WebKit still check it.
      .disableRules(browserName === 'firefox' ? ['target-size'] : [])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
