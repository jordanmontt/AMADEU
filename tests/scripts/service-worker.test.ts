import { describe, expect, it } from 'vitest';
import { serviceWorkerOptions } from '../../scripts/lib/service-worker';

describe('serviceWorkerOptions', () => {
  const options = serviceWorkerOptions('dist');

  it('writes the service worker into the built site', () => {
    expect(options.globDirectory).toBe('dist');
    expect(options.swDest).toBe('dist/sw.js');
  });

  it('keeps every page, script, style and the search index offline (RF-54)', () => {
    expect(options.globPatterns).toEqual(
      expect.arrayContaining(['**/*.{html,js,css}', 'pagefind/**/*', 'manifest.webmanifest']),
    );
    expect(options.directoryIndex).toBe('index.html');
  });

  it("finds Pagefind's files whatever its cache-busting parameter", () => {
    expect(options.ignoreURLParametersMatching?.some((pattern) => pattern.test('ts'))).toBe(true);
  });

  it('never keeps audio or the admin offline', () => {
    expect(options.globIgnores).toEqual(expect.arrayContaining(['audio/**', 'admin/**']));
    const cached = (options.runtimeCaching ?? []).map((route) => route.urlPattern);
    for (const pattern of cached) {
      expect(pattern).toBeInstanceOf(RegExp);
      expect((pattern as RegExp).test('/audio/cordillera-real.mp3')).toBe(false);
    }
  });

  it('keeps images and fonts once seen', () => {
    const routes = (options.runtimeCaching ?? []).map((route) => ({
      handler: route.handler,
      matches: ['/_astro/dibujo-93.Ab1.webp', '/_astro/literata.Cd2.woff2'].filter((url) =>
        (route.urlPattern as RegExp).test(url),
      ),
    }));

    expect(routes).toEqual([
      { handler: 'StaleWhileRevalidate', matches: ['/_astro/dibujo-93.Ab1.webp'] },
      { handler: 'CacheFirst', matches: ['/_astro/literata.Cd2.woff2'] },
    ]);
  });
});
