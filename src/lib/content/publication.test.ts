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
import { publishedCollections } from './publication';

const ids = (entries: readonly { id: string }[]): string[] => entries.map((entry) => entry.id);

describe('publishedCollections', () => {
  it('hides draft works and keeps upcoming ones for the "próximamente" cards', () => {
    const published = publishedCollections(
      collections({
        works: [
          aWork('live'),
          aWork('soon', { status: 'upcoming' }),
          aWork('hidden', { status: 'draft' }),
        ],
      }),
    );

    expect(ids(published.works)).toEqual(['live', 'soon']);
  });

  it('publishes only texts with cleared rights whose work is published', () => {
    const published = publishedCollections(
      collections({
        works: [aWork('live'), aWork('soon', { status: 'upcoming' })],
        texts: [
          aText('cleared', { work: 'live' }),
          aText('pending', { work: 'live', rights: 'pending' }),
          aText('restricted', { work: 'live', rights: 'restricted' }),
          aText('in-upcoming-work', { work: 'soon' }),
        ],
      }),
    );

    expect(ids(published.texts)).toEqual(['cleared']);
  });

  it('publishes only media with cleared rights', () => {
    const published = publishedCollections(
      collections({
        recordings: [aRecording('r-ok'), aRecording('r-no', { rights: 'pending' })],
        artworks: [anArtwork('a-ok'), anArtwork('a-no', { rights: 'restricted' })],
        videos: [aVideo('v-ok'), aVideo('v-no', { rights: 'pending' })],
      }),
    );

    expect(ids(published.recordings)).toEqual(['r-ok']);
    expect(ids(published.artworks)).toEqual(['a-ok']);
    expect(ids(published.videos)).toEqual(['v-ok']);
  });

  it('keeps every person, since people are only shown as credits', () => {
    const published = publishedCollections(collections({ people: [aPerson('einar-guillen')] }));

    expect(ids(published.people)).toEqual(['einar-guillen']);
  });
});
