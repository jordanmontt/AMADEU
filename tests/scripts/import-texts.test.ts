import { describe, expect, it } from 'vitest';
import { importedTexts, textId } from '../../scripts/lib/import-texts';
import { textSchema } from '../../src/lib/content/schemas';

const settings = {
  work: 'sangre-y-sueno',
  edition: { name: 'El Regocijo de Vivir, Tomo I', year: '2012', publisher: 'Plural editores' },
  titleCorrections: { 'Balada del amor imposile': 'Balada del amor imposible' },
  takenIds: new Set(['sangre-y-sueno']),
};
const song = { section: 'cancionero', kind: 'song' as const };

describe('importedTexts', () => {
  it('creates provisional, cleared entries with a slug id, spaced order and the source page (RF-58, RF-59)', () => {
    const [entry] = importedTexts(
      [{ title: 'Cordillera Real', page: 30, dedication: null, stanzas: [['uno']], notes: [] }],
      song,
      settings,
    );

    expect(entry?.id).toBe('cordillera-real');
    expect(entry?.body).toBe('uno\n');
    expect(entry?.data).toEqual({
      title: 'Cordillera Real',
      work: 'sangre-y-sueno',
      section: 'cancionero',
      order: 10,
      kind: 'song',
      edition: { ...settings.edition, pages: '30' },
      provisional: true,
      rights: 'cleared',
    });
    expect(textSchema.safeParse(entry?.data).success).toBe(true);
  });

  it('corrects misprinted titles and keeps the printed form as an alternative title', () => {
    const [entry] = importedTexts(
      [{ title: 'Balada del amor imposile', page: 21, dedication: null, stanzas: [], notes: [] }],
      song,
      settings,
    );

    expect(entry?.id).toBe('balada-del-amor-imposible');
    expect(entry?.data.altTitles).toEqual([
      { title: 'Balada del amor imposile', source: 'El Regocijo de Vivir, Tomo I (errata)' },
    ]);
  });

  it('keeps dedications and printed notes, and numbers texts in book order', () => {
    const entries = importedTexts(
      [
        { title: 'A', page: 1, dedication: 'Para Aquiles Nazoa', stanzas: [], notes: [] },
        { title: 'B', page: 2, dedication: null, stanzas: [], notes: ['*uno', 'dos'] },
      ],
      song,
      settings,
    );

    expect(entries[0]?.data.dedication).toBe('Para Aquiles Nazoa');
    expect(entries[1]?.data.notes).toBe('*uno\ndos');
    expect(entries.map((entry) => entry.data.order)).toEqual([10, 20]);
  });
});

describe('textId', () => {
  it('uses the title slug when it is free', () => {
    expect(textId('Cordillera de Los Andes', 'song', new Set())).toBe('cordillera-de-los-andes');
  });

  it('appends the kind when the slug is already taken (e.g. by the work)', () => {
    const taken = new Set(['sangre-y-sueno']);

    expect(textId('Sangre y sueño', 'song', taken)).toBe('sangre-y-sueno-cancion');
    expect(textId('Sangre y sueño', 'poem', taken)).toBe('sangre-y-sueno-poema');
  });
});
