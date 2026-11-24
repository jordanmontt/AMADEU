import { describe, expect, it } from 'vitest';
import {
  type Page,
  type PageLine,
  parsePageXml,
  splitIntoTexts,
  verseBody,
} from '../../scripts/lib/tomo';

const verse = (y: number, text: string): PageLine => ({
  y,
  font: 'JansonText-Roman',
  size: 11,
  text,
});
const title = (y: number, text: string): PageLine => ({
  y,
  font: 'JansonText-Bold',
  size: 14,
  text,
});
const small = (y: number, text: string): PageLine => ({
  y,
  font: 'JansonText-Roman',
  size: 9,
  text,
});
const page = (number: number, lines: PageLine[]): Page => ({ number, lines });

describe('parsePageXml', () => {
  it('reads each line with its baseline, font (without subset prefix), size and text', () => {
    const xml = `<page><block><line>
<span bbox="212 121 270 121" font="YYEAFL+JansonText-Bold" size="14.0000">
<char bbox="212 121 222 121" c="A"/><char bbox="222 121 226 121" c="&#xf1;"/>
<char bbox="226 121 231 121" c=" "/><char bbox="226 121 231 121" c="&amp;"/>
</span></line></block>
<block><line><span bbox="133 288 322 288" font="DMCEXB+JansonText-Roman" size="11.0000">
<char bbox="1 1 1 1" c=" "/><char bbox="1 1 1 1" c="o"/><char bbox="1 1 1 1" c=" "/>
</span></line></block></page>`;

    expect(parsePageXml(xml)).toEqual([
      { y: 121, font: 'JansonText-Bold', size: 14, text: 'Añ &' },
      { y: 288, font: 'JansonText-Roman', size: 11, text: 'o' },
    ]);
  });
});

describe('splitIntoTexts', () => {
  it('starts a text at each bold title and drops page numbers', () => {
    const texts = splitIntoTexts([
      page(12, [title(121, 'Altiplano'), verse(273, 'Hacia arriba'), small(633, '12')]),
      page(13, [title(121, 'América'), verse(273, 'Ella es indócil')]),
    ]);

    expect(texts.map((text) => [text.title, text.page])).toEqual([
      ['Altiplano', 12],
      ['América', 13],
    ]);
  });

  it('splits stanzas at large vertical gaps', () => {
    const [text] = splitIntoTexts([
      page(12, [
        title(121, 'Altiplano'),
        verse(273, 'uno'),
        verse(288, 'dos'),
        verse(318, 'tres'),
        verse(333, 'cuatro'),
      ]),
    ]);

    expect(text?.stanzas).toEqual([
      ['uno', 'dos'],
      ['tres', 'cuatro'],
    ]);
  });

  it('continues a text on the next page without inventing a stanza break', () => {
    const [text] = splitIntoTexts([
      page(15, [title(121, 'Amiga mía'), verse(574, 'uno'), verse(590, 'dos')]),
      page(16, [verse(65, 'tres'), verse(81, 'cuatro'), small(633, '16')]),
    ]);

    expect(text?.stanzas).toEqual([['uno', 'dos', 'tres', 'cuatro']]);
  });

  it('reads small print after the title as a dedication and later small print as notes', () => {
    const [text] = splitIntoTexts([
      page(37, [
        title(121, 'En la melodía de un viejo cantor'),
        small(149, 'Para Aquiles Nazoa'),
        verse(273, 'Yo lo vi.'),
        small(600, '*Recreación en castellano'),
      ]),
    ]);

    expect(text?.dedication).toBe('Para Aquiles Nazoa');
    expect(text?.notes).toEqual(['*Recreación en castellano']);
  });

  it('ignores lines before the first title and empty lines', () => {
    const texts = splitIntoTexts([
      page(9, [{ y: 100, font: 'JansonText-Roman-SC850', size: 17, text: 'sangre y sueño' }]),
      page(11, [title(121, 'Alcalde'), verse(200, ''), verse(273, 'uno')]),
    ]);

    expect(texts).toEqual([
      { title: 'Alcalde', page: 11, dedication: null, stanzas: [['uno']], notes: [] },
    ]);
  });
});

describe('verseBody', () => {
  it('puts verses on lines and separates stanzas with a blank line', () => {
    expect(
      verseBody({
        title: 'T',
        page: 1,
        dedication: null,
        stanzas: [['uno', 'dos'], ['tres']],
        notes: [],
      }),
    ).toBe('uno\ndos\n\ntres\n');
  });
});
