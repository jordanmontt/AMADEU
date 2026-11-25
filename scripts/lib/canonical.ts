/**
 * Splits the canonical edition of *Sangre y Sueño* (a PDF exported from a word processor,
 * read with pdf.js) into texts with their footnotes (ADR 0057).
 *
 * Layout rules observed in "Texto canónico – Sangre y Sueño 2027":
 * - every text starts on a new page with a bold title line (its first letter is sometimes
 *   regular);
 * - verses are set at 10 pt; a stanza break is a gap clearly larger than the line spacing
 *   (12.5 pt); a text continues on the next pages until the next title, and a page break
 *   is not a stanza break;
 * - lines right after the title that are indented or in parentheses are a dedication or an
 *   epigraph;
 * - a note call is a 6.5 pt number raised 2.5 pt above the baseline;
 * - the notes are at the foot of the page: a 6 pt number followed by 9 pt text;
 * - the page number is a 9 pt line at the top of the page.
 */

/** A piece of text as pdf.js gives it, in points from the bottom-left corner. */
export interface PdfItem {
  readonly text: string;
  readonly x: number;
  /** Baseline. */
  readonly y: number;
  readonly size: number;
  readonly bold: boolean;
}

export interface PdfPage {
  readonly number: number;
  readonly items: readonly PdfItem[];
}

/** A line of the text column, with its note calls written as `[^n]`. */
export interface TextLine {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly bold: boolean;
}

export interface CanonicalText {
  /** The title as printed, without its note calls. */
  readonly title: string;
  readonly page: number;
  /** Notes called from the title or from the dedication, which have no verse to point from. */
  readonly headerCalls: readonly number[];
  readonly dedication: string | null;
  /** Verses with their note calls, `[^n]`, numbered as in the whole book. */
  readonly stanzas: readonly (readonly string[])[];
  /** The text of each note this text calls, by its number in the whole book. */
  readonly notes: ReadonlyMap<number, string>;
}

const BODY_SIZE = 9.5;
const CALL_SIZE = 8;
const NOTE_NUMBER_SIZE = 6.25;
/** A note call is printed this much above the baseline of its verse. */
const CALL_RISE = 2.5;
/** Items closer than this to a line's baseline belong to that line. */
const SAME_LINE = 1.5;
/** A gap between baselines above which a new stanza starts (verses are 12.5 pt apart). */
const STANZA_GAP = 18;
/** Page numbers sit above this baseline. */
const PAGE_NUMBER_Y = 560;
/** Verses start at the left margin; header lines further right are a dedication. */
const INDENTED_X = 100;
/** A verse is never longer than this; a longer line is prose (a paragraph). */
export const LONGEST_VERSE = 60;

const isNumber = (text: string): boolean => /^\d+$/.test(text.trim());
const CALL = /\[\^(\d+)\]/g;

/** The numbers of the notes a piece of text calls, in reading order. */
export function callsIn(text: string): number[] {
  return [...text.matchAll(CALL)].map((match) => Number(match[1]));
}

function withoutCalls(text: string): string {
  return text.replace(CALL, '').trim();
}

function boldShare(pieces: readonly PdfItem[]): number {
  const length = (each: readonly PdfItem[]): number =>
    each.reduce((sum, piece) => sum + piece.text.trim().length, 0);
  const total = length(pieces);
  return total === 0 ? 0 : length(pieces.filter((piece) => piece.bold)) / total;
}

/** The lines of the text column of a page, top to bottom, with note calls as `[^n]`. */
export function textLines(page: PdfPage): TextLine[] {
  const pieces = page.items
    .filter((item) => item.text !== '')
    .filter(
      (item) => item.size >= BODY_SIZE || (item.size >= NOTE_NUMBER_SIZE && item.size < CALL_SIZE),
    )
    .map((item) => ({ ...item, baseline: item.size >= BODY_SIZE ? item.y : item.y - CALL_RISE }))
    .sort((a, b) => b.baseline - a.baseline || a.x - b.x);
  const lines: { baseline: number; pieces: typeof pieces }[] = [];
  for (const piece of pieces) {
    const line = lines.find((each) => Math.abs(each.baseline - piece.baseline) < SAME_LINE);
    if (line === undefined) {
      lines.push({ baseline: piece.baseline, pieces: [piece] });
    } else {
      line.pieces.push(piece);
    }
  }
  return lines
    .map(({ baseline, pieces: linePieces }) => {
      const ordered = [...linePieces].sort((a, b) => a.x - b.x);
      const words = ordered.filter((piece) => piece.size >= BODY_SIZE);
      const text = ordered
        .map((piece) =>
          piece.size < CALL_SIZE && isNumber(piece.text) ? `[^${piece.text.trim()}]` : piece.text,
        )
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
      return {
        text,
        x: words[0]?.x ?? ordered[0]?.x ?? 0,
        y: baseline,
        // Most of the line, not all of it: the first letter of a title is sometimes regular.
        bold: boldShare(words) > 0.5,
      };
    })
    .filter((line) => withoutCalls(line.text) !== '' || callsIn(line.text).length > 0);
}

/** The footnotes of a page, by number: a 6 pt number followed by 9 pt lines of text. */
export function pageNotes(page: PdfPage): Map<number, string> {
  const pieces = page.items
    .filter((item) => item.text !== '' && item.size < BODY_SIZE)
    .filter((item) => !(item.y > PAGE_NUMBER_Y && isNumber(item.text)))
    // Note numbers, and the note text with its spaces (italics are separate pieces).
    .filter((item) => (item.size < NOTE_NUMBER_SIZE ? isNumber(item.text) : item.size >= CALL_SIZE))
    .sort((a, b) => b.y - a.y || a.x - b.x);
  const notes = new Map<number, string>();
  let current: number | null = null;
  let lastY: number | null = null;
  for (const piece of pieces) {
    if (piece.size < NOTE_NUMBER_SIZE) {
      current = Number(piece.text.trim());
      notes.set(current, '');
      lastY = null;
      continue;
    }
    if (current === null) {
      continue;
    }
    const sameLine = lastY !== null && Math.abs(lastY - piece.y) < SAME_LINE;
    const text = notes.get(current) ?? '';
    notes.set(current, text === '' || sameLine ? text + piece.text : `${text} ${piece.text}`);
    lastY = piece.y;
  }
  return new Map([...notes].map(([number, text]) => [number, text.replace(/\s+/g, ' ').trim()]));
}

interface Draft {
  title: string;
  page: number;
  headerCalls: number[];
  dedication: string[];
  stanzas: string[][];
  inHeader: boolean;
  lastY: number | null;
  lastPage: number;
}

/** Splits consecutive pages into texts, each starting at a bold title. */
export function splitCanonical(pages: readonly PdfPage[]): CanonicalText[] {
  const drafts: Draft[] = [];
  const notes = new Map<number, string>();
  for (const page of pages) {
    for (const [number, text] of pageNotes(page)) {
      notes.set(number, text);
    }
    for (const line of textLines(page)) {
      if (line.bold) {
        drafts.push({
          title: withoutCalls(line.text),
          page: page.number,
          headerCalls: callsIn(line.text),
          dedication: [],
          stanzas: [],
          inHeader: true,
          lastY: line.y,
          lastPage: page.number,
        });
        continue;
      }
      const draft = drafts.at(-1);
      if (draft === undefined) {
        continue;
      }
      if (draft.inHeader && (line.x > INDENTED_X || line.text.startsWith('('))) {
        draft.dedication.push(withoutCalls(line.text));
        draft.headerCalls.push(...callsIn(line.text));
        draft.lastY = line.y;
        continue;
      }
      draft.inHeader = false;
      const samePage = draft.lastPage === page.number;
      const newStanza =
        draft.stanzas.length === 0 ||
        (samePage && draft.lastY !== null && draft.lastY - line.y > STANZA_GAP);
      if (newStanza) {
        draft.stanzas.push([line.text]);
      } else {
        draft.stanzas.at(-1)?.push(line.text);
      }
      draft.lastY = line.y;
      draft.lastPage = page.number;
    }
  }
  return drafts.map((draft) => {
    const calls = [...draft.headerCalls, ...draft.stanzas.flat().flatMap(callsIn)];
    return {
      title: draft.title,
      page: draft.page,
      headerCalls: draft.headerCalls,
      dedication: draft.dedication.length === 0 ? null : draft.dedication.join(' '),
      stanzas: draft.stanzas,
      notes: new Map(calls.map((number) => [number, notes.get(number) ?? ''])),
    };
  });
}

/** Whether the text is set in verses; a paragraph of prose has lines longer than any verse. */
export function isInVerses(text: CanonicalText): boolean {
  const verses = text.stanzas.flat();
  return verses.length > 0 && verses.every((verse) => withoutCalls(verse).length <= LONGEST_VERSE);
}

/**
 * The body and notes of a text for its Markdown file: notes renumbered from 1 in the order
 * the text calls them (title and dedication first), cross-references inside the notes
 * ("Cfr. nota 21") renumbered too. Notes called only from the title or the dedication keep
 * their number but no verse points to them.
 */
export function bodyAndNotes(text: CanonicalText): { body: string; notes: string | undefined } {
  const order = [...new Set([...text.headerCalls, ...text.stanzas.flat().flatMap(callsIn)])];
  const local = new Map(order.map((number, index) => [number, index + 1]));
  const renumber = (value: string): string =>
    value.replace(CALL, (call, number: string) => {
      const mapped = local.get(Number(number));
      return mapped === undefined ? call : `[^${String(mapped)}]`;
    });
  const body = `${text.stanzas.map((stanza) => stanza.map(renumber).join('\n')).join('\n\n')}\n`;
  const notes = order.map((number) => {
    const note = (text.notes.get(number) ?? '').replace(
      /nota (\d+)/gi,
      (reference, cited: string) => {
        const mapped = local.get(Number(cited));
        return mapped === undefined ? reference : reference.replace(cited, String(mapped));
      },
    );
    return `[^${String(local.get(number))}]: ${note}`;
  });
  return { body, notes: notes.length === 0 ? undefined : notes.join('\n\n') };
}
