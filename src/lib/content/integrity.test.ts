import { describe, expect, it } from 'vitest';
import {
  aPerson,
  aRecording,
  aText,
  aVideo,
  aWork,
  anArtwork,
  collections,
} from '../../../tests/support/builders';
import { findIntegrityProblems } from './integrity';

const messages = (content: Parameters<typeof findIntegrityProblems>[0]): string[] =>
  findIntegrityProblems(content).map(
    (problem) => `${problem.collection}/${problem.id}: ${problem.message}`,
  );

describe('findIntegrityProblems', () => {
  it('accepts consistent content, including relations to unpublished entries', () => {
    const content = collections({
      works: [aWork('work', { cover: 'cover' })],
      texts: [aText('song', { primaryRecording: 'lp', facsimile: ['page'] })],
      recordings: [
        aRecording('lp', { texts: ['song'], credits: [{ person: 'einar', role: 'dirección' }] }),
      ],
      artworks: [
        anArtwork('cover', { rights: 'pending' }),
        anArtwork('page'),
        anArtwork('sheet'),
        anArtwork('panel', { sheet: 'sheet', texts: ['song'] }),
      ],
      videos: [aVideo('clip', { texts: ['song'], credits: [{ person: 'einar', role: 'cámara' }] })],
      people: [aPerson('einar')],
    });

    expect(messages(content)).toEqual([]);
  });

  it('reports relations that point to missing entries', () => {
    const content = collections({
      works: [aWork('work', { cover: 'no-cover' })],
      texts: [aText('song', { facsimile: ['no-page'], primaryRecording: 'no-recording' })],
      recordings: [
        aRecording('lp', { texts: ['no-text'], credits: [{ person: 'nobody', role: 'voz' }] }),
      ],
      artworks: [anArtwork('panel', { sheet: 'no-sheet', texts: ['no-text'] })],
      videos: [
        aVideo('clip', { texts: ['no-text'], credits: [{ person: 'nobody', role: 'voz' }] }),
      ],
    });

    expect(messages(content)).toEqual([
      'works/work: cover points to missing artworks entry "no-cover"',
      'texts/song: facsimile points to missing artworks entry "no-page"',
      'texts/song: primaryRecording points to missing recordings entry "no-recording"',
      'recordings/lp: texts points to missing texts entry "no-text"',
      'recordings/lp: credits points to missing people entry "nobody"',
      'artworks/panel: texts points to missing texts entry "no-text"',
      'artworks/panel: sheet points to missing artworks entry "no-sheet"',
      'videos/clip: texts points to missing texts entry "no-text"',
      'videos/clip: credits points to missing people entry "nobody"',
    ]);
  });

  it('reports a text whose work or section does not exist', () => {
    const content = collections({
      works: [aWork('work')],
      texts: [aText('lost', { work: 'nowhere' }), aText('misplaced', { section: 'nowhere' })],
    });

    expect(messages(content)).toEqual([
      'texts/lost: work points to missing works entry "nowhere"',
      'texts/misplaced: section "nowhere" does not exist in work "work"',
    ]);
  });

  it('reports a verse that calls a note the text does not have (RF-21)', () => {
    const content = collections({
      works: [aWork('work')],
      texts: [
        aText('song', { notes: '[^1]: Una nota.' }, 'Verso uno[^1]\nVerso dos[^2]'),
        aText('plain', {}, 'Verso[^1]'),
      ],
    });

    expect(messages(content)).toEqual([
      'texts/song: calls note 2, which its notes do not define',
      'texts/plain: calls note 1, which its notes do not define',
    ]);
  });

  it('reports a primary recording that is not a version of the text', () => {
    const content = collections({
      works: [aWork('work')],
      texts: [aText('song', { primaryRecording: 'other' })],
      recordings: [aRecording('other', { texts: [] })],
    });

    expect(messages(content)).toEqual([
      'texts/song: primaryRecording "other" does not list this text',
    ]);
  });

  it('reports work slugs that are reserved routes or used twice', () => {
    const content = collections({
      works: [
        aWork('one', { slug: 'galeria' }),
        aWork('two', { slug: 'same' }),
        aWork('three', { slug: 'same' }),
      ],
    });

    expect(messages(content)).toEqual([
      'works/one: slug "galeria" is a reserved route',
      'works/two: slug "same" is used by several works',
      'works/three: slug "same" is used by several works',
    ]);
  });

  it('reports repeated section ids or slugs inside a work', () => {
    const content = collections({
      works: [
        aWork('work', {
          sections: [
            { id: 'a', title: 'A', slug: 'same', order: 1 },
            { id: 'a', title: 'B', slug: 'same', order: 2 },
          ],
        }),
      ],
    });

    expect(messages(content)).toEqual([
      'works/work: section id "a" is used more than once',
      'works/work: section slug "same" is used more than once',
    ]);
  });

  it('reports texts of the same work that would share a URL, or have none', () => {
    const content = collections({
      works: [aWork('work')],
      texts: [
        aText('one', { title: 'Canción serena' }),
        aText('two', { title: 'Cancion Serena' }),
        aText('three', { title: '¡…!' }),
      ],
    });

    expect(messages(content)).toEqual([
      'texts/three: title gives an empty URL slug',
      'texts/one: URL "work/cancion-serena" is shared with another text of the same work',
      'texts/two: URL "work/cancion-serena" is shared with another text of the same work',
    ]);
  });

  it('allows the same text title in different works', () => {
    const content = collections({
      works: [aWork('w1'), aWork('w2', { order: 2 })],
      texts: [
        aText('a', { work: 'w1', title: 'Haiku' }),
        aText('b', { work: 'w2', title: 'Haiku' }),
      ],
    });

    expect(messages(content)).toEqual([]);
  });

  it('reports ids shared by several page-bearing collections, since /id/<id>/ must be unique', () => {
    const content = collections({
      works: [aWork('work')],
      texts: [aText('alcalde')],
      artworks: [anArtwork('alcalde')],
    });

    expect(messages(content)).toEqual([
      'texts/alcalde: id is used by several collections (texts, artworks)',
      'artworks/alcalde: id is used by several collections (texts, artworks)',
    ]);
  });
});
