import { describe, expect, it } from 'vitest';
import { aRecording } from '../../../tests/support/builders';
import { InvalidTracksError, parseTracks, recordingTrack, type Track } from './track';

describe('recordingTrack', () => {
  it('describes a recording for the player, with the page of its lyrics', () => {
    const recording = aRecording('r-lp', {
      title: 'Cordillera Real',
      collection: 'LP Discolandia 1984',
      durationSeconds: 201,
      audio: 'cordillera-lp.mp3',
    });

    expect(recordingTrack(recording, '/sangre-y-sueno/cordillera-real/')).toEqual({
      id: 'r-lp',
      title: 'Cordillera Real',
      collection: 'LP Discolandia 1984',
      src: '/audio/cordillera-lp.mp3',
      durationSeconds: 201,
      href: '/sangre-y-sueno/cordillera-real/',
    });
  });

  it('leaves out the collection and the page when there are none', () => {
    const track = recordingTrack(aRecording('r-interview', { audio: 'interview.mp3' }));

    expect(track).not.toHaveProperty('collection');
    expect(track).not.toHaveProperty('href');
  });
});

describe('parseTracks', () => {
  const track: Track = {
    id: 'r-lp',
    title: 'Cordillera Real',
    collection: 'LP Discolandia 1984',
    src: '/audio/cordillera-lp.mp3',
    durationSeconds: 201,
    href: '/sangre-y-sueno/cordillera-real/',
  };

  it('reads back the tracks a page wrote', () => {
    const minimal: Track = { id: 'r-2', title: 'Luna', src: '/audio/luna.mp3', durationSeconds: 3 };

    expect(parseTracks(JSON.stringify([track, minimal]))).toEqual([track, minimal]);
  });

  it.each([
    ['text that is not JSON', '{', /not JSON/],
    ['a single track instead of a list', JSON.stringify(track), /not a list/],
    ['an item that is not an object', '[null]', /item 0 is not an object/],
    ['a track without a source', JSON.stringify([{ ...track, src: '' }]), /no "src"/],
    [
      'a collection that is not text',
      JSON.stringify([{ ...track, collection: 3 }]),
      /"collection"/,
    ],
    ['a missing duration', JSON.stringify([{ ...track, durationSeconds: undefined }]), /duration/],
    ['a zero duration', JSON.stringify([{ ...track, durationSeconds: 0 }]), /duration/],
  ])('rejects %s', (_, json, message) => {
    expect(() => parseTracks(json)).toThrow(InvalidTracksError);
    expect(() => parseTracks(json)).toThrow(message);
  });
});
