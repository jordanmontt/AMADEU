import { describe, expect, it } from 'vitest';
import {
  aPerson,
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

    it('orders sections by their explicit order, not alphabetically (RF-05)', () => {
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

    it("includes Marcelo's readings of a poem among its versions (RF-23)", () => {
      const poem = aText('romance', { work: 'sys', section: 'tales', kind: 'poem' });
      const catalog = Catalog.published(
        collections({
          works: [sangreYSueno],
          texts: [poem],
          recordings: [aRecording('lectura', { kind: 'reading', texts: ['romance'] })],
        }),
      );
      const versions = catalog.recordingVersions(poem);

      expect(versions.kind === 'available' && versions.primary.id).toBe('lectura');
    });

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

  describe('credits of a recording (RF-17)', () => {
    it("names each credited person with their role, in the recording's order", () => {
      const recording = aRecording('lp', {
        credits: [
          { person: 'ana', role: 'dirección musical' },
          { person: 'luis', role: 'grabación' },
        ],
      });
      const catalog = Catalog.published(
        collections({
          recordings: [recording],
          people: [aPerson('luis', { name: 'Luis Rojas' }), aPerson('ana', { name: 'Ana Pérez' })],
        }),
      );

      expect(catalog.creditsOf(recording)).toEqual([
        { role: 'dirección musical', name: 'Ana Pérez' },
        { role: 'grabación', name: 'Luis Rojas' },
      ]);
    });

    it('refuses to name a credited person who is missing', () => {
      const recording = aRecording('lp', { credits: [{ person: 'nadie', role: 'voz' }] });
      const catalog = Catalog.published(collections({ recordings: [recording] }));

      expect(() => catalog.creditsOf(recording)).toThrow(/credits person "nadie"/);
    });
  });

  describe('artwork', () => {
    it('finds a published artwork by its id, and nothing for an unpublished one', () => {
      const catalog = Catalog.published(
        collections({
          artworks: [anArtwork('cuadro-2'), anArtwork('oculto', { rights: 'pending' })],
        }),
      );

      expect(catalog.artwork('cuadro-2')?.id).toBe('cuadro-2');
      expect(catalog.artwork('oculto')).toBeUndefined();
    });
  });

  describe('photographs (RF-34)', () => {
    it('gives the published photos and posters for the biography, oldest first', () => {
      const catalog = Catalog.published(
        collections({
          artworks: [
            anArtwork('afiche', { kind: 'poster', date: '2018' }),
            anArtwork('microfono', { kind: 'photo', date: '1985' }),
            anArtwork('sin-autorizar', { kind: 'photo', rights: 'pending' }),
            anArtwork('dibujo', { kind: 'drawing' }),
          ],
        }),
      );

      expect(ids(catalog.photographs())).toEqual(['microfono', 'afiche']);
    });
  });

  describe('playlist of a work (RF-14)', () => {
    it('plays the primary recording of each text that has one, in editorial order', () => {
      const catalog = Catalog.published(
        collections({
          works: [sangreYSueno],
          texts: [
            aText('song-2', { work: 'sys', section: 'songs', order: 2 }),
            aText('song-1', { work: 'sys', section: 'songs', order: 1, primaryRecording: 'lp' }),
            aText('silent', { work: 'sys', section: 'songs', order: 3 }),
            aText('tale', { work: 'sys', section: 'tales', order: 1 }),
          ],
          recordings: [
            aRecording('home', { texts: ['song-1'], date: '1994' }),
            aRecording('lp', { texts: ['song-1'], date: '1984' }),
            aRecording('song-2-home', { texts: ['song-2'] }),
            aRecording('tale-reading', { texts: ['tale'] }),
          ],
        }),
      );

      const playlist = catalog.playlistOf(sangreYSueno);

      expect(playlist.map((item) => [item.text.id, item.recording.id])).toEqual([
        ['tale', 'tale-reading'],
        ['song-1', 'lp'],
        ['song-2', 'song-2-home'],
      ]);
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

  describe('relations used by the record pages', () => {
    const catalog = Catalog.published(
      collections({
        works: [sangreYSueno],
        texts: [
          aText('song-b', { work: 'sys', section: 'songs', order: 2 }),
          aText('tale', { work: 'sys', section: 'tales', order: 1 }),
          aText('hidden', { work: 'sys', section: 'songs', rights: 'pending' }),
        ],
        recordings: [aRecording('take', { texts: ['song-b', 'hidden', 'tale'] })],
        artworks: [
          anArtwork('sheet'),
          anArtwork('panel', { sheet: 'sheet', texts: ['song-b', 'tale'] }),
          anArtwork('orphan-panel', { sheet: 'unpublished-sheet' }),
        ],
      }),
    );
    const [take] = catalog.recordings();
    const panel = catalog.artworks().find((artwork) => artwork.id === 'panel');
    const orphan = catalog.artworks().find((artwork) => artwork.id === 'orphan-panel');

    it('finds the section of a text', () => {
      const [tale] = catalog.textsOf(sangreYSueno);

      expect(tale && catalog.sectionOf(tale).title).toBe('Relatos poéticos');
    });

    it('refuses to answer the section of a text whose section is missing', () => {
      const lost = aText('lost', { work: 'sys', section: 'nowhere' });

      expect(() => catalog.sectionOf(lost)).toThrow(/missing/);
    });

    it('lists the published texts of a recording and of an artwork in editorial order (RF-06)', () => {
      expect(take && ids(catalog.textsOfRecording(take))).toEqual(['tale', 'song-b']);
      expect(panel && ids(catalog.textsIllustratedBy(panel))).toEqual(['tale', 'song-b']);
    });

    it('finds the sheet of a panel only when the sheet is published', () => {
      expect(panel && catalog.sheetOf(panel)?.id).toBe('sheet');
      expect(orphan && catalog.sheetOf(orphan)).toBeUndefined();
      expect(catalog.sheetOf(anArtwork('loose'))).toBeUndefined();
    });
  });

  describe('covers', () => {
    it('finds the published cover of a work, if any', () => {
      const catalog = Catalog.published(
        collections({
          works: [
            aWork('a', { cover: 'lunita' }),
            aWork('b', { cover: 'pending', order: 2 }),
            aWork('c', { order: 3 }),
          ],
          artworks: [anArtwork('lunita'), anArtwork('pending', { rights: 'pending' })],
        }),
      );
      const [a, b, c] = catalog.works();

      expect(a && catalog.coverOf(a)?.id).toBe('lunita');
      expect(b && catalog.coverOf(b)).toBeUndefined();
      expect(c && catalog.coverOf(c)).toBeUndefined();
    });
  });

  describe('recordingsByCollection', () => {
    it('groups recordings by collection, oldest collection first, loose recordings last', () => {
      const catalog = Catalog.published(
        collections({
          recordings: [
            aRecording('home-1', { collection: 'Casera', date: '1993/1995' }),
            aRecording('loose', {}),
            aRecording('goethe', { collection: 'Recitales', date: '1981' }),
            aRecording('home-2', { collection: 'Casera', date: '1993/1995' }),
          ],
        }),
      );

      expect(
        catalog.recordingsByCollection().map((group) => [group.collection, ids(group.recordings)]),
      ).toEqual([
        ['Recitales', ['goethe']],
        ['Casera', ['home-1', 'home-2']],
        [undefined, ['loose']],
      ]);
    });
  });

  describe('showcaseTexts', () => {
    it('keeps the texts that have both a recording and an illustration, in editorial order', () => {
      const catalog = Catalog.published(
        collections({
          works: [sangreYSueno],
          texts: [
            aText('both-late', { work: 'sys', section: 'songs', order: 2 }),
            aText('both-early', { work: 'sys', section: 'songs', order: 1 }),
            aText('audio-only', { work: 'sys', section: 'songs', order: 3 }),
            aText('drawing-only', { work: 'sys', section: 'songs', order: 4 }),
          ],
          recordings: [aRecording('r', { texts: ['both-late', 'both-early', 'audio-only'] })],
          artworks: [anArtwork('a', { texts: ['both-late', 'both-early', 'drawing-only'] })],
        }),
      );

      expect(ids(catalog.showcaseTexts(sangreYSueno))).toEqual(['both-early', 'both-late']);
    });
  });
});
