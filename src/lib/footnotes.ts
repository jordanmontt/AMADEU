/**
 * Footnotes of a printed edition (ADR 0057). A verse calls a note with a Markdown footnote
 * reference, `[^3]`, and the text's `notes` field defines each note as a paragraph starting
 * with `[^3]: `, the same syntax Markdown uses. Notes written before the canonical edition
 * are plain paragraphs without a number.
 */

/** A piece of a verse: plain text, or the call to note `note`. */
export type VersePart = { readonly text: string } | { readonly note: number };

/** A note of the edition; `number` is absent for a plain, unnumbered note. */
export interface EditionNote {
  readonly number?: number;
  readonly text: string;
}

const CALL = /\[\^(\d+)\]/g;
const DEFINITION = /^\[\^(\d+)\]:\s*/;

/** Splits a verse into its text and its note calls, in reading order. */
export function verseParts(verse: string): VersePart[] {
  const parts: VersePart[] = [];
  let last = 0;
  for (const match of verse.matchAll(CALL)) {
    if (match.index > last) {
      parts.push({ text: verse.slice(last, match.index) });
    }
    parts.push({ note: Number(match[1]) });
    last = match.index + match[0].length;
  }
  if (last < verse.length) {
    parts.push({ text: verse.slice(last) });
  }
  return parts;
}

/** The notes of a text, one per paragraph, numbered when they start with `[^n]: `. */
export function editionNotes(notes: string): EditionNote[] {
  return notes
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== '')
    .map((paragraph) => {
      const definition = DEFINITION.exec(paragraph);
      return definition === null
        ? { text: paragraph }
        : { number: Number(definition[1]), text: paragraph.slice(definition[0].length) };
    });
}

/** Note numbers a body calls that its notes never define: a typo an editor must fix. */
export function undefinedCalls(body: string, notes: string | undefined): number[] {
  const defined = new Set(editionNotes(notes ?? '').map((note) => note.number));
  const called = [...body.matchAll(CALL)].map((match) => Number(match[1]));
  return [...new Set(called)].filter((number) => !defined.has(number));
}
