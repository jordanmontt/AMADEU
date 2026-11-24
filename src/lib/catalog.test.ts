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

const ids = (entries: readonly { id: string }[]): string[] => entries.map((entry) => entry.id);

const sangreYSueno = aWork('sys', {
  slug: 'sangre-y-sueno',
  sections: [
    { id: 'songs', title: 'Cancionero', slug: 'cancionero', order: 2 },
    { id: 'tales', title: 'Relatos poéticos', slug: 'relatos-poeticos', order: 1 },
  ],
});

describe('Catalog', () => {
  describe('works', () => {
    it('lists works in editorial order, then by title', () => {
      const catalog = Catalog.published(
        collections({
          works: [
            aWork('b', { order: 2 }),
            aWork('a2', { order: 1, title: 'Zafiro' }),
            aWork('a1', { order: 1, title: 'Álamo' }),
          ],
        }),
      );

      expect(ids(catalog.works())).toEqual(['a1', 'a2', 'b']);
    });

    it('separates works with a page from upcoming ones', () => {
      const catalog = Catalog.published(
        collections({ works: [aWork('live'), aWork('soon', { status: 'upcoming', order: 2 })] }),
      );

      expect(ids(catalog.publishedWorks())).toEqual(['live']);
      expect(ids(catalog.upcomingWorks())).toEqual(['soon']);
    });
  });

  describe('texts of a work', () => {
    const catalog = Catalog.published(
      collections({
        works: [sangreYSueno],
        texts: [
          aText('song-b', { work: 'sys', section: 'songs', order: 2 }),
          aText('song-a', { work: 'sys', section: 'songs', order: 1 }),
          aText('tale', { work: 'sys', section: 'tales', order: 1 }),
          aText('hidden', { work: 'sys', section: 'songs', order: 0, rights: 'pending' }),
        ],
      }),
    );

    it('orders sections by their explicit order, not alphabetically', () => {
      expect(catalog.sectionsOf(sangreYSueno).map((section) => section.id)).toEqual([
        'tales',
        'songs',
      ]);
    });

    it('lists published texts section by section, each in its explicit order', () => {
      expect(ids(catalog.textsOf(sangreYSueno))).toEqual(['tale', 'song-a', 'song-b']);
    });

    it('finds the work of a text', () => {
      const [text] = catalog.textsOf(sangreYSueno);

      expect(text && catalog.workOf(text).id).toBe('sys');
    });

    it('refuses to answer the work of a text whose work is not in the catalog', () => {
      const orphanCatalog = new Catalog(
        collections({ texts: [aText('orphan', { work: 'gone' })] }),
      );
      const orphan = aText('orphan', { work: 'gone' });

      expect(() => orphanCatalog.workOf(orphan)).toThrow(/missing/);
    });
  });

  describe('recording versions of a text', () => {
    const song = aText('cordillera-real', { work: 'sys', section: 'songs' });

    it('reports that no recording is available (RF-18)', () => {
      const catalog = Catalog.published(collections({ works: [sangreYSueno], texts: [song] }));

      expect(catalog.recordingVersions(song)).toEqual({ kind: 'unavailable' });
    });

    it('puts the designated primary recording first and the others by date', () => {
      const catalog = Catalog.published(
        collections({
          works: [sangreYSueno],
          texts: [
            aText('cordillera-real', { work: 'sys', section: 'songs', primaryRecording: 'lp' }),
          ],
          recordings: [
            aRecording('home', { texts: ['cordillera-real'], date: '1994' }),
            aRecording('lp', { texts: ['cordillera-real'], date: '1984' }),
            aRecording('recital', { texts: ['cordillera-real'], date: '1981' }),
            aRecording('other-song', { texts: ['luna-andina'] }),
          ],
        }),
      );
      const versions = catalog.recordingVersions(
        aText('cordillera-real', { work: 'sys', section: 'songs', primaryRecording: 'lp' }),
      );

      expect(versions.kind).toBe('available');
      if (versions.kind === 'available') {
        expect(versions.primary.id).toBe('lp');
        expect(ids(versions.others)).toEqual(['recital', 'home']);
      }
    });

    it('falls back to the oldest recording when the primary one is not published', () => {
      const text = aText('cordillera-real', {
        work: 'sys',
        section: 'songs',
        primaryRecording: 'lp',
      });
      const catalog = Catalog.published(
        collections({
          works: [sangreYSueno],
          texts: [text],
          recordings: [
            aRecording('lp', { texts: ['cordillera-real'], rights: 'pending' }),
            aRecording('home', { texts: ['cordillera-real'], date: '1994' }),
            aRecording('undated', { texts: ['cordillera-real'] }),
          ],
        }),
      );
      const versions = catalog.recordingVersions(text);

      expect(versions.kind === 'available' && versions.primary.id).toBe('home');
      expect(versions.kind === 'available' && ids(versions.others)).toEqual(['undated']);
    });
  });

  describe('artworks', () => {
    const song = aText('alcalde', {
      work: 'sys',
      section: 'songs',
      facsimile: ['p2', 'p1', 'gone'],
    });
    const catalog = Catalog.published(
      collections({
        works: [sangreYSueno],
        texts: [song],
        artworks: [
          anArtwork('final', { texts: ['alcalde'], date: '1990' }),
          anArtwork('sketch', { texts: ['alcalde'], date: '1985' }),
          anArtwork('unrelated'),
          anArtwork('sheet-8', { title: 'Tengo miedo (hoja)' }),
          anArtwork('panel-b', { sheet: 'sheet-8', title: 'B' }),
          anArtwork('panel-a', { sheet: 'sheet-8', title: 'A' }),
          anArtwork('p1'),
          anArtwork('p2'),
        ],
      }),
    );

    it('finds the illustrations of a text, oldest first', () => {
      expect(ids(catalog.illustrationsOf(song))).toEqual(['sketch', 'final']);
    });

    it('keeps the facsimile pages in the order listed on the text, skipping unpublished ones', () => {
      expect(ids(catalog.facsimileOf(song))).toEqual(['p2', 'p1']);
    });

    it('derives the panels of a sheet from each panel pointing to it', () => {
      const sheet = anArtwork('sheet-8');

      expect(ids(catalog.panelsOf(sheet))).toEqual(['panel-a', 'panel-b']);
    });
  });

  describe('media lists', () => {
    it('lists artworks, videos and recordings oldest first, undated last', () => {
      const catalog = Catalog.published(
        collections({
          artworks: [anArtwork('a-undated'), anArtwork('a-1990', { date: '1990' })],
          videos: [aVideo('v-1996', { date: '1996' }), aVideo('v-1985', { date: '1985-03' })],
          recordings: [aRecording('r-undated'), aRecording('r-1981', { date: '1981-06-12' })],
        }),
      );

      expect(ids(catalog.artworks())).toEqual(['a-1990', 'a-undated']);
      expect(ids(catalog.videos())).toEqual(['v-1985', 'v-1996']);
      expect(ids(catalog.recordings())).toEqual(['r-1981', 'r-undated']);
    });
  });

  describe('permalinks', () => {
    it('links every page-bearing entry to its current URL', () => {
      const catalog = Catalog.published(
        collections({
          works: [sangreYSueno, aWork('soon', { status: 'upcoming' })],
          texts: [aText('t-12', { work: 'sys', section: 'songs', title: 'Cordillera Real' })],
          artworks: [anArtwork('alcalde')],
          videos: [aVideo('america')],
          recordings: [aRecording('lp')],
        }),
      );

      expect(catalog.permalinks()).toEqual([
        { id: 'sys', path: '/id/sys/', target: '/sangre-y-sueno/' },
        { id: 't-12', path: '/id/t-12/', target: '/sangre-y-sueno/cordillera-real/' },
        { id: 'alcalde', path: '/id/alcalde/', target: '/galeria/alcalde/' },
        { id: 'america', path: '/id/america/', target: '/videos/america/' },
      ]);
    });
  });
});
