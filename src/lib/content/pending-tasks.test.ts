import { describe, expect, it } from 'vitest';
import { aRecording, aText, aVideo, anArtwork, collections } from '../../../tests/support/builders';
import { groupPendingTasks, pendingTasks } from './pending-tasks';

const summary = (content: Parameters<typeof pendingTasks>[0]): string[] =>
  pendingTasks(content).map((task) => `${task.kind} ${task.collection}/${task.id}`);

/** Content with nothing left to do, to which each test adds one problem. */
const done = {
  texts: [aText('song', { kind: 'song' })],
  recordings: [aRecording('take', { texts: ['song'], kind: 'song' })],
  artworks: [anArtwork('drawing', { inventoryCode: 'ADLC-01' })],
  videos: [aVideo('clip', { youtubeId: 'abcdefghijk' })],
};

describe('pendingTasks', () => {
  it('finds nothing to do in complete content', () => {
    expect(summary(collections(done))).toEqual([]);
  });

  it('asks to confirm rights of every pending entry, but not of restricted ones', () => {
    const content = collections({
      ...done,
      texts: [...done.texts, aText('t', { kind: 'poem', rights: 'pending' })],
      recordings: [...done.recordings, aRecording('r', { texts: ['song'], rights: 'pending' })],
      artworks: [anArtwork('a', { inventoryCode: 'X', rights: 'pending' })],
      videos: [aVideo('v', { youtubeId: 'abcdefghijk', rights: 'restricted' })],
    });

    expect(summary(content)).toEqual([
      'rights-pending texts/t',
      'rights-pending recordings/r',
      'rights-pending artworks/a',
    ]);
  });

  it('lists what editors marked for review, with their words', () => {
    const content = collections({
      ...done,
      artworks: [anArtwork('a', { inventoryCode: 'X', review: 'Confirmar la canción.' })],
    });

    expect(pendingTasks(content)).toEqual([
      {
        kind: 'review',
        collection: 'artworks',
        id: 'a',
        title: 'Artwork a',
        detail: 'Confirmar la canción.',
      },
    ]);
  });

  it('finds songs without any recording, counting unpublished recordings as found', () => {
    const content = collections({
      ...done,
      texts: [
        ...done.texts,
        aText('missing', { kind: 'song' }),
        aText('poem', { kind: 'poem' }),
        aText('pending-audio', { kind: 'song' }),
      ],
      recordings: [
        ...done.recordings,
        aRecording('p', { texts: ['pending-audio'], rights: 'pending' }),
      ],
    });

    expect(summary(content)).toContain('song-without-recording texts/missing');
    expect(summary(content)).not.toContain('song-without-recording texts/poem');
    expect(summary(content)).not.toContain('song-without-recording texts/pending-audio');
  });

  it('finds music recordings not linked to a text, but not recitals or interviews', () => {
    const content = collections({
      ...done,
      recordings: [
        ...done.recordings,
        aRecording('track', { kind: 'song', texts: [] }),
        aRecording('guitar', { kind: 'instrumental', texts: [] }),
        aRecording('recital', { kind: 'recital', texts: [] }),
      ],
    });

    expect(summary(content)).toEqual([
      'recording-without-text recordings/track',
      'recording-without-text recordings/guitar',
    ]);
  });

  it('finds provisional texts, videos not on YouTube and artworks without inventory code', () => {
    const content = collections({
      texts: [aText('t', { kind: 'poem', provisional: true })],
      videos: [aVideo('v')],
      artworks: [anArtwork('a')],
    });

    expect(summary(content)).toEqual([
      'provisional-text texts/t',
      'video-without-youtube videos/v',
      'artwork-without-inventory-code artworks/a',
    ]);
  });
});

describe('groupPendingTasks', () => {
  it('groups by kind in display order, sorts by title and omits empty groups', () => {
    const groups = groupPendingTasks(
      pendingTasks(
        collections({
          texts: [aText('b', { kind: 'poem', title: 'Zafiro', rights: 'pending' })],
          videos: [
            aVideo('a', { title: 'Álamo', rights: 'pending' }),
            aVideo('c', { title: 'Mar' }),
          ],
        }),
      ),
    );

    expect(groups.map((group) => [group.kind, group.tasks.map((task) => task.title)])).toEqual([
      ['rights-pending', ['Álamo', 'Zafiro']],
      ['video-without-youtube', ['Álamo', 'Mar']],
    ]);
  });
});
