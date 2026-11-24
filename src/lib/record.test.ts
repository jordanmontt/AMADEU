import { describe, expect, it } from 'vitest';
import {
  aRecording,
  aText,
  aVideo,
  aWork,
  anArtwork,
  collections,
} from '../../tests/support/builders';
import { Catalog } from './catalog';
import { DUBLIN_CORE, artworkRecord, recordingRecord, textRecord, videoRecord } from './record';

const keys = (record: readonly { key: string }[]): string[] => record.map((field) => field.key);

describe('archival records', () => {
  const work = aWork('sys', {
    title: 'Sangre y Sueño',
    sections: [{ id: 'songs', title: 'Libro de canciones', slug: 'cancionero', order: 1 }],
  });
  const text = aText('alcalde', {
    work: 'sys',
    section: 'songs',
    edition: {
      name: 'El Regocijo de Vivir, Tomo I',
      publisher: 'Plural editores',
      year: '2012',
      pages: '11',
    },
  });
  const catalog = Catalog.published(collections({ works: [work], texts: [text] }));

  it('describes a text by its work, section, kind, source edition, licence and permalink', () => {
    expect(textRecord(catalog, text)).toEqual([
      { key: 'work', value: 'Sangre y Sueño' },
      { key: 'section', value: 'Libro de canciones' },
      { key: 'kind', value: 'song' },
      { key: 'source', value: 'El Regocijo de Vivir, Tomo I, Plural editores, 2012, p. 11' },
      { key: 'license', value: 'all-rights-reserved' },
      { key: 'permalink', value: '/id/alcalde/', href: '/id/alcalde/' },
    ]);
  });

  it('omits the source of a text without edition', () => {
    const bare = aText('bare', { work: 'sys', section: 'songs' });
    const withBare = Catalog.published(collections({ works: [work], texts: [bare] }));

    expect(keys(textRecord(withBare, bare))).not.toContain('source');
  });

  it('describes a recording, including its duration in seconds and its original', () => {
    const record = recordingRecord(
      aRecording('lp', {
        collection: 'Grabación casera',
        date: '1993/1995',
        durationSeconds: 146,
        originalUrl: 'https://archive.org/details/x',
      }),
    );

    expect(record).toEqual([
      { key: 'kind', value: 'song' },
      { key: 'collection', value: 'Grabación casera' },
      { key: 'date', value: '1993/1995' },
      { key: 'duration', value: '146' },
      { key: 'license', value: 'all-rights-reserved' },
      {
        key: 'original',
        value: 'https://archive.org/details/x',
        href: 'https://archive.org/details/x',
      },
    ]);
  });

  it('describes an artwork with only the fields it has', () => {
    expect(
      keys(
        artworkRecord(
          anArtwork('d', { technique: 'Tinta', inscription: 'Verso', rightsHolder: 'Fundación' }),
        ),
      ),
    ).toEqual(['kind', 'technique', 'inscription', 'rightsHolder', 'license', 'permalink']);
  });

  it('describes a video', () => {
    expect(
      keys(
        videoRecord(
          aVideo('v', { series: 'Los Caminos del Hombre', date: '1985', durationSeconds: 1200 }),
        ),
      ),
    ).toEqual(['series', 'date', 'duration', 'license', 'permalink']);
  });

  it('maps every field to a Dublin Core element', () => {
    expect(Object.values(DUBLIN_CORE).every((element) => /^dc(terms)?:\w+$/.test(element))).toBe(
      true,
    );
  });
});
