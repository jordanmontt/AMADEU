import { type Page } from '@playwright/test';
import { expect, test } from './support/test';

/**
 * What search engines and link previews read (RT-44). The fixture site is built with
 * SITE_URL set to the test server, so absolute addresses can be checked.
 */

async function meta(page: Page, property: string): Promise<string | null> {
  return page
    .locator(`meta[property="${property}"], meta[name="${property}"]`)
    .getAttribute('content');
}

async function structuredData(page: Page): Promise<Record<string, unknown>[]> {
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  return scripts.map((script) => JSON.parse(script) as Record<string, unknown>);
}

test.describe('search engines and link previews', () => {
  test('robots.txt keeps the admin out and points to the sitemap (RT-44)', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text();

    expect(robots).toContain('Disallow: /admin/');
    expect(robots).toContain('Sitemap: http://localhost:4329/sitemap.xml');
  });

  test('the sitemap lists public pages only (RT-44)', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();

    expect(sitemap).toContain('<loc>http://localhost:4329/sangre-y-sueno/cordillera-real/</loc>');
    expect(sitemap).toContain('<loc>http://localhost:4329/galeria/dibujo-93/</loc>');
    expect(sitemap).not.toContain('/admin/');
    expect(sitemap).not.toContain('texto-pendiente');
  });

  test('a song page can be shared with its title, a drawing and its address (RT-44)', async ({
    page,
  }) => {
    await page.goto('/sangre-y-sueno/cordillera-real/');

    expect(await meta(page, 'og:title')).toBe('Cordillera Real');
    expect(await meta(page, 'og:url')).toBe(
      'http://localhost:4329/sangre-y-sueno/cordillera-real/',
    );
    expect(await meta(page, 'og:image')).toMatch(/^http:\/\/localhost:4329\/.+\.jpe?g$/);
    expect(await meta(page, 'twitter:card')).toBe('summary_large_image');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'http://localhost:4329/sangre-y-sueno/cordillera-real/',
    );
    const image = await meta(page, 'og:image');
    expect((await page.request.get(image ?? '')).status()).toBe(200);
  });

  test('a song page describes the song for search engines (RT-44)', async ({ page }) => {
    await page.goto('/sangre-y-sueno/cordillera-real/');

    expect(await structuredData(page)).toEqual([
      expect.objectContaining({
        '@type': 'MusicComposition',
        name: 'Cordillera Real',
        alternateName: ['Cordillera de los Andes'],
        author: expect.objectContaining({ name: 'Marcelo de Urioste' }),
      }),
    ]);
  });

  test('artworks, videos, the biography and the home page have their own descriptions (RT-44)', async ({
    page,
  }) => {
    const expected: [string, string][] = [
      ['/galeria/dibujo-93/', 'VisualArtwork'],
      ['/videos/video-prueba/', 'VideoObject'],
      ['/marcelo/', 'Person'],
      ['/', 'WebSite'],
    ];
    for (const [path, type] of expected) {
      await page.goto(path);
      const [data] = await structuredData(page);
      expect(data?.['@type'], path).toBe(type);
    }
  });

  test('the pending tasks page is not described to search engines (RT-44)', async ({ page }) => {
    await page.goto('/admin/pendientes/');

    expect(await structuredData(page)).toEqual([]);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
  });
});
