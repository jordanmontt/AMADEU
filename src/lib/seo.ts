/**
 * What search engines and link previews read (RT-44, ADR 0056): the sitemap, robots.txt and
 * schema.org structured data (JSON-LD) for each kind of page. Absolute URLs need the site's
 * address (`SITE_URL`); without it the sitemap is empty and robots.txt names no sitemap.
 */
import type { Catalog } from './catalog';
import type { ArtworkEntry, TextEntry, VideoEntry } from './content/collections';
import { SITE_SECTIONS, artworkPath, sectionPath, textPath, videoPath, workPath } from './routes';

/** Paths that never belong in search results: the admin, permanent links, raw audio. */
export const PRIVATE_PATHS: readonly string[] = ['/admin/', '/id/', '/audio/'];

/** Every public page of the site, home first, then sections, works and their entries. */
export function sitemapPaths(catalog: Catalog): string[] {
  return [
    '/',
    ...SITE_SECTIONS.map(sectionPath),
    ...catalog
      .publishedWorks()
      .flatMap((work) => [
        workPath(work),
        ...catalog.textsOf(work).map((text) => textPath(work, text)),
      ]),
    ...catalog.artworks().map(artworkPath),
    ...catalog.videos().map(videoPath),
  ];
}

function escapeXml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

/** The sitemap of `paths` on `site`; an empty sitemap when the site's address is unknown. */
export function sitemapXml(site: URL | undefined, paths: readonly string[]): string {
  const urls =
    site === undefined
      ? ''
      : paths
          .map((path) => `<url><loc>${escapeXml(new URL(path, site).href)}</loc></url>`)
          .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

/** robots.txt: everything public except the private paths, and where the sitemap is. */
export function robotsTxt(site: URL | undefined): string {
  return [
    'User-agent: *',
    ...PRIVATE_PATHS.map((path) => `Disallow: ${path}`),
    ...(site === undefined ? [] : ['', `Sitemap: ${new URL('/sitemap.xml', site).href}`]),
    '',
  ].join('\n');
}

/** A page's address: absolute when the site's address is known, its path otherwise. */
export function pageUrl(site: URL | undefined, pathname: string): string {
  return site === undefined ? pathname : new URL(pathname, site).href;
}

/** Marcelo, author of everything in the archive. */
export const MARCELO = {
  '@type': 'Person',
  name: 'Marcelo de Urioste',
  birthDate: '1952',
  birthPlace: 'La Paz, Bolivia',
  deathDate: '1997',
} as const;

export type JsonLd = Readonly<Record<string, unknown>>;

function defined(entries: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(entries).filter(([, value]) => value !== undefined));
}

/** A poem is a CreativeWork; a song's lyrics are a MusicComposition with them. */
export function textJsonLd(catalog: Catalog, text: TextEntry, url: string): JsonLd {
  const work = catalog.workOf(text);
  return defined({
    '@context': 'https://schema.org',
    '@type': text.data.kind === 'song' ? 'MusicComposition' : 'CreativeWork',
    ...(text.data.kind === 'poem' ? { genre: 'Poesía' } : {}),
    name: text.data.title,
    alternateName:
      text.data.altTitles.length > 0 ? text.data.altTitles.map((alt) => alt.title) : undefined,
    author: MARCELO,
    inLanguage: 'es',
    isPartOf: { '@type': 'Book', name: work.data.title },
    url,
  });
}

export function artworkJsonLd(artwork: ArtworkEntry, url: string, image?: string): JsonLd {
  const data = artwork.data;
  return defined({
    '@context': 'https://schema.org',
    '@type': data.kind === 'photo' ? 'Photograph' : 'VisualArtwork',
    name: data.title,
    description: data.alt,
    creator: data.kind === 'photo' ? undefined : MARCELO,
    artMedium: data.technique,
    dateCreated: data.date,
    locationCreated: data.place,
    image,
    url,
  });
}

export function videoJsonLd(video: VideoEntry, url: string): JsonLd {
  const data = video.data;
  return defined({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: data.title,
    description: data.description,
    dateCreated: data.date,
    duration:
      data.durationSeconds === undefined
        ? undefined
        : `PT${String(Math.round(data.durationSeconds))}S`,
    embedUrl:
      data.youtubeId === undefined
        ? undefined
        : `https://www.youtube-nocookie.com/embed/${encodeURIComponent(data.youtubeId)}`,
    url,
  });
}

/** The home page: the archive as a website about Marcelo. */
export function siteJsonLd(name: string, url: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    inLanguage: 'es',
    about: MARCELO,
    url,
  };
}

/** The biography page. */
export function personJsonLd(url: string, description: string): JsonLd {
  return { '@context': 'https://schema.org', ...MARCELO, description, url };
}

/**
 * JSON-LD as the text of a `<script type="application/ld+json">`: `<` is escaped so no
 * value can close the script element.
 */
export function jsonLdScript(data: JsonLd): string {
  return JSON.stringify(data).replaceAll('<', '\\u003c');
}
