import { describe, expect, it } from 'vitest';
import { aText, aVideo, aWork, anArtwork, collections } from '../../tests/support/builders';
import { Catalog } from './catalog';
import {
  MARCELO,
  artworkJsonLd,
  jsonLdScript,
  pageUrl,
  robotsTxt,
  sitemapPaths,
  sitemapXml,
  textJsonLd,
  videoJsonLd,
} from './seo';

const sys = aWork('sys', { slug: 'sangre-y-sueno', title: 'Sangre y Sueño' });
const song = aText('cordillera', {
  work: 'sys',
  title: 'Cordillera Real',
  altTitles: [{ title: 'Cordillera de los Andes', source: 'LP 1984' }],
});
const poem = aText('romance', { work: 'sys', title: 'Romance', kind: 'poem', order: 2 });
const catalog = Catalog.published(
  collections({
    works: [sys, aWork('futura', { status: 'upcoming' })],
    texts: [song, poem, aText('oculto', { work: 'sys', rights: 'pending' })],
    artworks: [anArtwork('dibujo-93')],
    videos: [aVideo('documental')],
  }),
);
const site = new URL('https://archivo.example/');

describe('sitemap (RT-44)', () => {
  it('lists every public page and nothing private or unpublished', () => {
    const paths = sitemapPaths(catalog);

    expect(paths).toContain('/');
    expect(paths).toContain('/escuchar/');
    expect(paths).toContain('/sangre-y-sueno/cordillera-real/');
    expect(paths).toContain('/galeria/dibujo-93/');
    expect(paths).toContain('/videos/documental/');
    expect(paths.some((path) => path.includes('oculto') || path.includes('futura'))).toBe(false);
    expect(paths.some((path) => /^\/(admin|id|audio)\//.test(path))).toBe(false);
  });

  it('writes absolute addresses, and nothing when the site address is unknown', () => {
    expect(sitemapXml(site, ['/', '/a&b/'])).toContain(
      '<url><loc>https://archivo.example/</loc></url><url><loc>https://archivo.example/a&amp;b/</loc></url>',
    );
    expect(sitemapXml(undefined, ['/'])).not.toContain('<url>');
  });
});

describe('robots.txt (RT-44)', () => {
  it('keeps the admin, permanent links and audio out, and points to the sitemap', () => {
    const robots = robotsTxt(site);

    expect(robots).toContain('Disallow: /admin/');
    expect(robots).toContain('Disallow: /id/');
    expect(robots).toContain('Disallow: /audio/');
    expect(robots).toContain('Sitemap: https://archivo.example/sitemap.xml');
    expect(robotsTxt(undefined)).not.toContain('Sitemap');
  });
});

describe('structured data (RT-44)', () => {
  it('describes a song as a composition by Marcelo, with its other titles', () => {
    expect(textJsonLd(catalog, song, 'https://archivo.example/x/')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'MusicComposition',
      name: 'Cordillera Real',
      alternateName: ['Cordillera de los Andes'],
      author: MARCELO,
      inLanguage: 'es',
      isPartOf: { '@type': 'Book', name: 'Sangre y Sueño' },
      url: 'https://archivo.example/x/',
    });
  });

  it('describes a poem as poetry, leaving out what it does not have', () => {
    const data = textJsonLd(catalog, poem, '/romance/');

    expect(data['@type']).toBe('CreativeWork');
    expect(data.genre).toBe('Poesía');
    expect(data).not.toHaveProperty('alternateName');
  });

  it('describes an artwork by Marcelo, and a photograph without claiming he made it', () => {
    const drawing = artworkJsonLd(
      anArtwork('d', { technique: 'Tinta', date: '1993', alt: 'Un hombre' }),
      '/galeria/d/',
      'https://archivo.example/d.jpg',
    );
    const photo = artworkJsonLd(anArtwork('f', { kind: 'photo' }), '/galeria/f/');

    expect(drawing).toMatchObject({
      '@type': 'VisualArtwork',
      creator: MARCELO,
      artMedium: 'Tinta',
      dateCreated: '1993',
      description: 'Un hombre',
      image: 'https://archivo.example/d.jpg',
    });
    expect(photo['@type']).toBe('Photograph');
    expect(photo).not.toHaveProperty('creator');
  });

  it('describes a video with its duration and privacy-enhanced embed', () => {
    const data = videoJsonLd(
      aVideo('v', { durationSeconds: 1500.4, youtubeId: 'dQw4w9WgXcQ' }),
      '/videos/v/',
    );

    expect(data.duration).toBe('PT1500S');
    expect(data.embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });

  it('cannot close its script element, whatever the content', () => {
    expect(jsonLdScript({ name: '</script><script>alert(1)</script>' })).not.toContain('</script>');
  });
});

describe('pageUrl', () => {
  it('is absolute when the site address is known, the path otherwise', () => {
    expect(pageUrl(site, '/galeria/')).toBe('https://archivo.example/galeria/');
    expect(pageUrl(undefined, '/galeria/')).toBe('/galeria/');
  });
});
