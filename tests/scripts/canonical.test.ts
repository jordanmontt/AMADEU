/**
 * The canonical edition import (ADR 0057): how a page of the PDF becomes a text with its
 * stanzas and notes, and how the manifest applies it to the archive's texts (RF-58, RF-59).
 */
import { describe, expect, it } from 'vitest';
import {
  type CanonicalText,
  type PdfItem,
  type PdfPage,
  bodyAndNotes,
  isInVerses,
  splitCanonical,
} from '../../scripts/lib/canonical';
import {
  type ExistingText,
  type Manifest,
  planCanonical,
} from '../../scripts/lib/import-canonical';
import { textSchema } from '../../src/lib/content/schemas';

/** A verse line at 10 pt; `{ call }` pieces are 6.5 pt note calls raised 2.5 pt. */
function line(y: number, ...pieces: (string | { call: number })[]): PdfItem[] {
  let x = 34;
  return pieces.map((piece) => {
    const item =
      typeof piece === 'string'
        ? { text: piece, x, y, size: 10, bold: false }
        : { text: String(piece.call), x, y: y + 2.5, size: 6.5, bold: false };
    x += item.text.length * 5;
    return item;
  });
}

const title = (y: number, text: string, call?: number): PdfItem[] => [
  { text, x: 34, y, size: 10, bold: true },
  ...(call === undefined
    ? []
    : [{ text: String(call), x: 120, y: y + 2.5, size: 6.5, bold: true }]),
];

const note = (y: number, number: number, ...texts: string[]): PdfItem[] => [
  { text: String(number), x: 34, y, size: 6, bold: false },
  ...texts.map((text, index) => ({ text, x: 42, y: y - 2 - index * 11, size: 9, bold: false })),
];

const pageNumber = (number: number): PdfItem => ({
  text: String(number),
  x: 461,
  y: 569,
  size: 9,
  bold: false,
});

const alcalde: PdfPage = {
  number: 8,
  items: [
    pageNumber(8),
    ...title(557, 'Alcalde de la Canción', 13),
    { text: 'Para Guillermo Bedregal', x: 329, y: 539, size: 10, bold: false },
    ...line(526, 'El Gremio de los Juglares', { call: 14 }),
    ...line(514, 'me ha nombrado Fundador'),
    ...line(489, 'Me nombran solemnemente'),
    ...note(
      100,
      13,
      'Primera de las canciones en las ediciones de 1994 y 2013,',
      'por orden alfabético.',
    ),
    ...note(80, 14, 'En 1994 se eliminan las altibajas. Cfr. nota 13'),
  ],
};
const continuation: PdfPage = {
  number: 9,
  items: [pageNumber(9), ...line(557, 'Alcalde de la Canción'), ...line(545, 'del corazón')],
};

function firstText(pages: PdfPage[]): CanonicalText {
  const [text] = splitCanonical(pages);
  if (text === undefined) {
    throw new Error('no text');
  }
  return text;
}

describe('splitCanonical', () => {
  it('reads the title, dedication, stanzas, note calls and notes of a text (RF-58)', () => {
    const [text] = splitCanonical([alcalde]);

    expect(text?.title).toBe('Alcalde de la Canción');
    expect(text?.page).toBe(8);
    expect(text?.dedication).toBe('Para Guillermo Bedregal');
    expect(text?.headerCalls).toEqual([13]);
    expect(text?.stanzas).toEqual([
      ['El Gremio de los Juglares[^14]', 'me ha nombrado Fundador'],
      ['Me nombran solemnemente'],
    ]);
    expect(text?.notes.get(13)).toBe(
      'Primera de las canciones en las ediciones de 1994 y 2013, por orden alfabético.',
    );
  });

  it('continues a text on the next page without starting a new stanza', () => {
    const [text, ...others] = splitCanonical([alcalde, continuation]);

    expect(others).toEqual([]);
    expect(text?.stanzas.at(-1)).toEqual([
      'Me nombran solemnemente',
      'Alcalde de la Canción',
      'del corazón',
    ]);
  });

  it('starts a new text at each title, even when its first letter is not bold', () => {
    const page: PdfPage = {
      number: 4,
      items: [
        { text: 'P', x: 34, y: 557, size: 10, bold: false },
        { text: 'oética', x: 40, y: 557, size: 10, bold: true },
        ...line(539, 'El Poema no es palabras'),
      ],
    };

    expect(splitCanonical([page]).map((text) => text.title)).toEqual(['Poética']);
  });
});

describe('isInVerses', () => {
  const text = (verses: string[]): CanonicalText => ({
    title: 'T',
    page: 1,
    headerCalls: [],
    dedication: null,
    stanzas: [verses],
    notes: new Map(),
  });

  it('tells verses from paragraphs of prose', () => {
    expect(isInVerses(text(['Hoy vi dos aparapitas', 'trepando tus cuestas[^3]']))).toBe(true);
    expect(
      isInVerses(
        text(['Pasó algo terrible. No hay más que decir. Mi ciudad tiene miedo y quiere partir.']),
      ),
    ).toBe(false);
    expect(isInVerses(text([]))).toBe(false);
  });
});

describe('bodyAndNotes', () => {
  it('numbers the notes from 1 in reading order, cross-references included', () => {
    expect(bodyAndNotes(firstText([alcalde]))).toEqual({
      body: 'El Gremio de los Juglares[^2]\nme ha nombrado Fundador\n\nMe nombran solemnemente\n',
      notes:
        '[^1]: Primera de las canciones en las ediciones de 1994 y 2013, por orden alfabético.\n\n' +
        '[^2]: En 1994 se eliminan las altibajas. Cfr. nota 1',
    });
  });
});

describe('planCanonical', () => {
  const manifest: Manifest = {
    work: 'sys',
    edition: { name: 'Edición conmemorativa', year: '2027' },
    replaces: ['cancionero'],
    sections: [
      {
        id: 'cancionero-1981',
        firstPage: 8,
        lastPage: 9,
        texts: [
          {
            printed: 'Alcalde de la Canción',
            id: 'alcalde',
            altTitles: [{ title: 'Alcalde', source: 'Ediciones posteriores' }],
            review: 'Confirmar el título.',
          },
          { printed: 'Patria', id: 'patria-vieja' },
          { printed: 'Distancias', skip: 'solo el título' },
        ],
      },
    ],
  };
  const prose: CanonicalText = {
    title: 'Patria',
    page: 42,
    headerCalls: [],
    dedication: null,
    stanzas: [
      ['Mi patria me está invadiendo con su magia impenetrable. Mi patria me está faltando.'],
    ],
    notes: new Map(),
  };
  const titleOnly: CanonicalText = { ...prose, title: 'Distancias', stanzas: [] };
  const alcaldeText = firstText([alcalde]);
  const printed = new Map([['cancionero-1981', [alcaldeText, prose, titleOnly]]]);
  const existing = new Map<string, ExistingText>([
    [
      'alcalde',
      {
        data: {
          title: 'Alcalde de la canción',
          work: 'sys',
          section: 'cancionero',
          order: 10,
          kind: 'song',
          edition: { name: 'Tomo I', year: '2012' },
          provisional: true,
          primaryRecording: 'r-alcalde',
          rights: 'cleared',
        },
        body: 'Tomo I\n',
      },
    ],
    [
      'patria-vieja',
      {
        data: {
          title: 'Mi patria',
          work: 'sys',
          section: 'cancionero',
          order: 20,
          kind: 'song',
          edition: { name: 'Tomo I', year: '2012' },
          provisional: true,
          rights: 'cleared',
        },
        body: 'Mi patria\nme está invadiendo\n',
      },
    ],
  ]);

  it('replaces a text set in verses with the canonical one, keeping what the edition does not decide (RF-58)', () => {
    const [alcaldeEntry] = planCanonical(manifest, printed, existing).texts;

    expect(alcaldeEntry?.change).toBe('replaced');
    expect(alcaldeEntry?.data).toMatchObject({
      title: 'Alcalde de la Canción',
      altTitles: [{ title: 'Alcalde', source: 'Ediciones posteriores' }],
      section: 'cancionero-1981',
      order: 10,
      dedication: 'Para Guillermo Bedregal',
      edition: { name: 'Edición conmemorativa', year: '2027', pages: '8' },
      provisional: false,
      primaryRecording: 'r-alcalde',
      review: 'Confirmar el título.',
    });
    expect(alcaldeEntry?.body).toContain('[^2]');
    expect(textSchema.safeParse(alcaldeEntry?.data).success).toBe(true);
  });

  it('keeps the earlier verses of a text the edition sets as prose, and its earlier title as an alternative', () => {
    const [, patria] = planCanonical(manifest, printed, existing).texts;

    expect(patria?.change).toBe('reordered');
    expect(patria?.body).toBe('Mi patria\nme está invadiendo\n');
    expect(patria?.data).toMatchObject({
      title: 'Patria',
      altTitles: [{ title: 'Mi patria', source: 'Tomo I, 2012' }],
      section: 'cancionero-1981',
      order: 20,
      provisional: true,
    });
  });

  it('reports the texts it cannot import yet', () => {
    expect(planCanonical(manifest, printed, existing).skipped).toEqual([
      { printed: 'Distancias', reason: 'solo el título' },
    ]);
  });

  it('refuses a manifest that does not match the PDF, or that leaves a text out', () => {
    const renamed = new Map([['cancionero-1981', [prose, alcaldeText, titleOnly]]]);
    const extra = new Map<string, ExistingText>([
      ...existing,
      ['huerfano', { data: { work: 'sys', section: 'cancionero' }, body: '' }],
    ]);

    expect(() => planCanonical(manifest, renamed, existing)).toThrow(/prints «Patria»/);
    expect(() => planCanonical(manifest, printed, extra)).toThrow(/does not place: huerfano/);
  });

  it('creates a text the archive does not have yet, cleared and not provisional', () => {
    const [section] = manifest.sections;
    if (section === undefined) {
      throw new Error('no section');
    }
    const onlyNew: Manifest = {
      ...manifest,
      sections: [{ ...section, texts: [{ printed: 'Alcalde de la Canción', id: 'nuevo' }] }],
    };
    const [created] = planCanonical(
      onlyNew,
      new Map([['cancionero-1981', [alcaldeText]]]),
      new Map(),
    ).texts;

    expect(created?.change).toBe('created');
    expect(created?.data).toMatchObject({
      kind: 'song',
      rights: 'cleared',
      provisional: false,
      work: 'sys',
    });
    expect(textSchema.safeParse(created?.data).success).toBe(true);
  });
});
