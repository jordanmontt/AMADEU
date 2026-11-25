import { describe, expect, it } from 'vitest';
import { editionNotes, undefinedCalls, verseParts } from './footnotes';

describe('verseParts', () => {
  it('separates the note calls from the text of a verse', () => {
    expect(verseParts('te ensucian los sueños, querida[^4] ciudad')).toEqual([
      { text: 'te ensucian los sueños, querida' },
      { note: 4 },
      { text: ' ciudad' },
    ]);
  });

  it('keeps a verse without calls whole', () => {
    expect(verseParts('Mi grito es un animal')).toEqual([{ text: 'Mi grito es un animal' }]);
  });

  it('reads a call at the start or at the end of a verse', () => {
    expect(verseParts('[^1]Sí[^2]')).toEqual([{ note: 1 }, { text: 'Sí' }, { note: 2 }]);
  });
});

describe('editionNotes', () => {
  it('reads numbered notes, one per paragraph', () => {
    expect(editionNotes('[^1]: Primera nota.\n\n[^2]: Segunda\nnota.')).toEqual([
      { number: 1, text: 'Primera nota.' },
      { number: 2, text: 'Segunda\nnota.' },
    ]);
  });

  it('keeps a plain note without a number', () => {
    expect(editionNotes('*Recreación en castellano del poema.')).toEqual([
      { text: '*Recreación en castellano del poema.' },
    ]);
  });

  it('gives no note for empty notes', () => {
    expect(editionNotes('\n \n')).toEqual([]);
  });
});

describe('undefinedCalls', () => {
  it('names the calls whose note is missing', () => {
    expect(undefinedCalls('uno[^1]\ndos[^2][^2]', '[^1]: Nota.')).toEqual([2]);
  });

  it('finds nothing when every call has its note', () => {
    expect(undefinedCalls('uno[^1]', '[^1]: Nota.')).toEqual([]);
    expect(undefinedCalls('sin llamadas', undefined)).toEqual([]);
  });
});
