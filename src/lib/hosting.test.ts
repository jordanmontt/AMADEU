import { describe, expect, it } from 'vitest';
import { HEADERS, redirects } from './hosting';

describe('redirects (RT-12)', () => {
  it('answers each permanent link with a permanent redirect to its current page', () => {
    expect(
      redirects([
        { id: 't-1', path: '/id/t-1/', target: '/sangre-y-sueno/cordillera-real/' },
        { id: 'dibujo-93', path: '/id/dibujo-93/', target: '/galeria/dibujo-93/' },
      ]),
    ).toBe(
      '/id/t-1/ /sangre-y-sueno/cordillera-real/ 301\n/id/dibujo-93/ /galeria/dibujo-93/ 301\n',
    );
  });
});

describe('headers', () => {
  /** The header lines of the block that starts with `path`. */
  function block(path: string): string[] {
    const [, ...lines] =
      HEADERS.split('\n\n')
        .find((each) => each.startsWith(`${path}\n`))
        ?.split('\n') ?? [];
    return lines.map((line) => line.trim()).filter((line) => line !== '');
  }

  it('keeps hashed build files a year, and always rechecks the service worker', () => {
    expect(block('/_astro/*')).toEqual(['Cache-Control: public, max-age=31536000, immutable']);
    expect(block('/sw.js')).toEqual(['Cache-Control: no-cache']);
  });

  it('keeps the admin out of search engines and protects every page', () => {
    expect(block('/admin/*')).toEqual(['X-Robots-Tag: noindex, nofollow']);
    expect(block('/*')).toContain('X-Content-Type-Options: nosniff');
  });
});
