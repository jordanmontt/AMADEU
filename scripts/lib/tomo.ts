/**
 * Splits the text of a printed book (Ghostscript `txtwrite -dTextFormat=1` XML, one file
 * per page) into texts: poems or songs with their title, dedication, stanzas and notes.
 *
 * Layout rules observed in *El Regocijo de Vivir, Tomo I* (Plural, 2012):
 * - a text starts with a bold title line (14–16 pt);
 * - verses are set at 11 pt (the first one at 24 pt, a drop cap);
 * - page numbers are 9 pt lines with digits only;
 * - other 9 pt lines are a dedication (right after the title) or a note (later);
 * - a stanza break is a vertical gap clearly larger than the line spacing (15 pt);
 * - a text continues on the next pages until the next title.
 */

export interface PageLine {
  /** Baseline, in points from the top of the page. */
  readonly y: number;
  readonly font: string;
  readonly size: number;
  readonly text: string;
}

export interface Page {
  /** Page number in the PDF (equal to the printed page number in Tomo I). */
  readonly number: number;
  readonly lines: readonly PageLine[];
}

export interface BookText {
  readonly title: string;
  readonly page: number;
  readonly dedication: string | null;
  readonly stanzas: readonly (readonly string[])[];
  readonly notes: readonly string[];
}

/** Gap between baselines above which a new stanza starts (body lines are 15 pt apart). */
const STANZA_GAP = 22;
const SMALL_PRINT = 10;

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Reads the lines of one page from Ghostscript's XML text output. */
export function parsePageXml(xml: string): PageLine[] {
  const lines: PageLine[] = [];
  for (const [, lineXml = ''] of xml.matchAll(/<line>([\s\S]*?)<\/line>/g)) {
    const span = /<span bbox="\d+ (\d+) \d+ \d+" font="([^"]+)" size="([\d.]+)">/.exec(lineXml);
    if (span === null) {
      continue;
    }
    const [, y = '0', font = '', size = '0'] = span;
    const text = [...lineXml.matchAll(/ c="([^"]*)"/g)]
      .map(([, char = '']) => decodeEntities(char))
      .join('');
    lines.push({
      y: Number(y),
      font: font.replace(/^[A-Z]{6}\+/, ''),
      size: Number(size),
      text: text.replace(/\s+/g, ' ').trim(),
    });
  }
  return lines;
}

function isTitle(line: PageLine): boolean {
  return line.font.includes('Bold') && line.size >= 13;
}

function isSmallPrint(line: PageLine): boolean {
  return line.size < SMALL_PRINT;
}

function isPageNumber(line: PageLine): boolean {
  return isSmallPrint(line) && /^\d+$/.test(line.text);
}

interface Draft {
  title: string;
  page: number;
  dedication: string | null;
  stanzas: string[][];
  notes: string[];
  lastVerseY: number | null;
}

function finish(draft: Draft): BookText {
  return {
    title: draft.title,
    page: draft.page,
    dedication: draft.dedication,
    stanzas: draft.stanzas.filter((stanza) => stanza.length > 0),
    notes: draft.notes,
  };
}

/**
 * Splits consecutive pages into texts. Lines before the first title (section headings,
 * the end of a previous text) are ignored.
 */
export function splitIntoTexts(pages: readonly Page[]): BookText[] {
  const texts: BookText[] = [];
  let draft: Draft | null = null;
  for (const page of pages) {
    if (draft !== null) {
      draft.lastVerseY = null; // a new page never opens with a measurable stanza gap
    }
    for (const line of page.lines) {
      if (line.text === '' || isPageNumber(line)) {
        continue;
      }
      if (isTitle(line)) {
        if (draft !== null) {
          texts.push(finish(draft));
        }
        draft = {
          title: line.text,
          page: page.number,
          dedication: null,
          stanzas: [[]],
          notes: [],
          lastVerseY: null,
        };
        continue;
      }
      if (draft === null) {
        continue;
      }
      if (isSmallPrint(line)) {
        const beforeFirstVerse = draft.stanzas.every((stanza) => stanza.length === 0);
        if (beforeFirstVerse && draft.dedication === null) {
          draft.dedication = line.text;
        } else {
          draft.notes.push(line.text);
        }
        continue;
      }
      const current = draft.stanzas.at(-1) ?? [];
      if (
        draft.lastVerseY !== null &&
        line.y - draft.lastVerseY > STANZA_GAP &&
        current.length > 0
      ) {
        draft.stanzas.push([line.text]);
      } else {
        current.push(line.text);
      }
      draft.lastVerseY = line.y;
    }
  }
  if (draft !== null) {
    texts.push(finish(draft));
  }
  return texts;
}

/** The text body as stored in content files: verses on lines, stanzas separated by a blank line. */
export function verseBody(text: BookText): string {
  return `${text.stanzas.map((stanza) => stanza.join('\n')).join('\n\n')}\n`;
}
