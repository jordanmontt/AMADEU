import { expect, test } from './support/test';

test.describe('site sections', () => {
  test('the main navigation marks the current section', async ({ page }) => {
    await page.goto('/sangre-y-sueno/cordillera-real/');

    const nav = page.getByRole('navigation', { name: 'Principal' });
    await expect(nav.getByRole('link', { name: 'Obras' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'Galería' })).not.toHaveAttribute('aria-current');
  });

  test('a song page lists its recordings and shows its drawing and record', async ({ page }) => {
    await page.goto('/sangre-y-sueno/cordillera-real/');

    const recordings = page.getByRole('list', { name: 'Grabaciones' });
    await expect(recordings.getByRole('listitem').first()).toContainText('Versión principal');
    await expect(recordings.getByRole('listitem').first()).toContainText('LP Discolandia 1984');
    await expect(recordings.getByRole('listitem')).toHaveCount(2);
    await expect(page.getByRole('img', { name: /toca la guitarra/ })).toBeVisible();
    await expect(page.getByText('Enlace para citar')).toBeVisible();
    await expect(page.getByText(/\/id\/t-cordillera\/$/)).toBeVisible();
  });

  test('the published audio is served as MP3', async ({ request }) => {
    const response = await request.get('/audio/silencio.mp3');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('audio/mpeg');
  });

  test('the listen page groups recordings by collection', async ({ page }) => {
    await page.goto('/escuchar/');

    await expect(page.getByRole('heading', { name: 'LP Discolandia 1984' })).toBeVisible();
  });

  test('the gallery links each artwork to its record, which links back to its song', async ({
    page,
  }) => {
    await page.goto('/galeria/');
    await page.getByRole('link', { name: /Dibujo de prueba/ }).click();

    await expect(page).toHaveURL('/galeria/dibujo-prueba/');
    await expect(page.getByRole('region', { name: 'Ilustra' }).getByRole('link')).toHaveText(
      'Cordillera Real',
    );
  });

  test('the read page lists every published text by work', async ({ page }) => {
    await page.goto('/leer/');

    await expect(page.getByRole('link', { name: 'Romance de prueba' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Texto pendiente' })).toHaveCount(0);
  });

  test('a published video not yet on YouTube says so, and loads nothing from YouTube', async ({
    page,
  }) => {
    const youtube: string[] = [];
    page.on('request', (request) => {
      if (/youtube|ytimg|google/.test(new URL(request.url()).hostname)) youtube.push(request.url());
    });
    await page.goto('/videos/');
    await page.getByRole('link', { name: 'Video de prueba' }).click();

    await expect(page.getByText('Este video todavía no está publicado en YouTube.')).toBeVisible();
    expect(youtube).toEqual([]);
  });

  test('the biography shows its timeline oldest first', async ({ page }) => {
    await page.goto('/marcelo/');

    await expect(page.locator('.timeline li .date')).toHaveText(['1952', '1984']);
  });

  test('the search box also starts when the search page is opened directly', async ({ page }) => {
    await page.goto('/buscar/');
    await page.getByRole('textbox', { name: 'Buscar' }).fill('Romance');

    await expect(page.getByRole('link', { name: 'Romance de prueba' })).toBeVisible();
  });

  test('the search finds texts by their words', async ({ page }) => {
    await page.goto('/');
    // Reached by client-side navigation, as visitors do: the search box must still start.
    await page
      .getByRole('navigation', { name: 'Principal' })
      .getByRole('link', { name: 'Buscar' })
      .click();
    await expect(page).toHaveURL('/buscar/');
    await page.getByRole('textbox', { name: 'Buscar' }).fill('verso de prueba');

    await expect(page.getByRole('link', { name: 'Cordillera Real' })).toBeVisible();
  });

  test('a YouTube video loads its privacy-enhanced player only after a click', async ({ page }) => {
    const external: string[] = [];
    const isExternal = (url: URL): boolean => /youtube|ytimg|google/.test(url.hostname);
    await page.route(isExternal, async (route) => {
      external.push(route.request().url());
      await route.abort();
    });
    await page.goto('/videos/video-con-youtube/');

    expect(external).toEqual([]);
    await expect(page.locator('iframe')).toHaveCount(0);

    await page.getByRole('button', { name: /Reproducir «Video con YouTube»/ }).click();

    await expect(page.locator('iframe')).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/abcdefghijk?autoplay=1&rel=0',
    );
  });
});
