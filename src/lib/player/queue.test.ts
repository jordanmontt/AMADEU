import { describe, expect, it } from 'vitest';
import { PlayQueue, previousRestarts, RESTART_THRESHOLD_SECONDS } from './queue';
import type { Track } from './track';

function aTrack(id: string): Track {
  return { id, title: `Track ${id}`, src: `/audio/${id}.mp3`, durationSeconds: 60 };
}

const [a, b, c, d] = ['a', 'b', 'c', 'd'].map(aTrack) as [Track, Track, Track, Track];

function queueOf(tracks: readonly Track[], start = 0): PlayQueue {
  const queue = new PlayQueue();
  queue.replace(tracks, start);
  return queue;
}

const ids = (queue: PlayQueue): string[] => queue.tracks().map((track) => track.id);

describe('PlayQueue', () => {
  it('starts empty, with nothing to play', () => {
    const queue = new PlayQueue();

    expect(queue.isEmpty()).toBe(true);
    expect(queue.current()).toBeUndefined();
    expect(queue.hasNext()).toBe(false);
    expect(queue.hasPrevious()).toBe(false);
  });

  describe('replace (play a list, e.g. "listen to the whole work")', () => {
    it('plays the list from the chosen track', () => {
      const queue = queueOf([a, b, c], 1);

      expect(ids(queue)).toEqual(['a', 'b', 'c']);
      expect(queue.current()).toBe(b);
      expect(queue.position()).toBe(1);
    });

    it('drops repeated tracks and still starts at the chosen one', () => {
      const queue = queueOf([a, b, a, c], 3);

      expect(ids(queue)).toEqual(['a', 'b', 'c']);
      expect(queue.current()).toBe(c);
    });

    it('starts at the first track when the chosen position does not exist', () => {
      expect(queueOf([a, b], 7).current()).toBe(a);
    });
  });

  describe('append (add to queue)', () => {
    it('adds tracks at the end without changing the current one', () => {
      const queue = queueOf([a]);

      expect(queue.append([b, c])).toBe(2);
      expect(ids(queue)).toEqual(['a', 'b', 'c']);
      expect(queue.current()).toBe(a);
    });

    it('ignores tracks that are already queued', () => {
      const queue = queueOf([a, b]);

      expect(queue.append([b, c, c])).toBe(1);
      expect(ids(queue)).toEqual(['a', 'b', 'c']);
    });

    it('makes the first added track current when the queue was empty', () => {
      const queue = new PlayQueue();
      queue.append([b]);

      expect(queue.current()).toBe(b);
    });
  });

  describe('moving through the queue', () => {
    it('goes forward and back, stopping at both ends', () => {
      const queue = queueOf([a, b]);

      expect(queue.previous()).toBeUndefined();
      expect(queue.next()).toBe(b);
      expect(queue.next()).toBeUndefined();
      expect(queue.current()).toBe(b);
      expect(queue.previous()).toBe(a);
    });

    it('jumps to any queued track', () => {
      const queue = queueOf([a, b, c]);

      expect(queue.jumpTo(2)).toBe(c);
      expect(queue.current()).toBe(c);
    });

    it('refuses to jump outside the queue', () => {
      expect(() => queueOf([a]).jumpTo(1)).toThrow(RangeError);
    });
  });

  describe('remove', () => {
    it('keeps playing the current track when another one is removed', () => {
      const queue = queueOf([a, b, c, d], 2);

      queue.remove(0);
      expect(queue.current()).toBe(c);
      queue.remove(2);
      expect(queue.current()).toBe(c);
      expect(ids(queue)).toEqual(['b', 'c']);
    });

    it('moves on to the following track when the current one is removed', () => {
      const queue = queueOf([a, b, c], 1);

      queue.remove(1);

      expect(queue.current()).toBe(c);
    });

    it('moves back to the previous track when the current last one is removed', () => {
      const queue = queueOf([a, b], 1);

      queue.remove(1);

      expect(queue.current()).toBe(a);
    });

    it('empties the queue when its only track is removed', () => {
      const queue = queueOf([a]);

      queue.remove(0);

      expect(queue.isEmpty()).toBe(true);
      expect(queue.current()).toBeUndefined();
    });

    it('refuses to remove a track that is not queued', () => {
      expect(() => {
        queueOf([a]).remove(3);
      }).toThrow(RangeError);
    });
  });
});

describe('previousRestarts', () => {
  it('restarts the track once it has played for a few seconds', () => {
    expect(previousRestarts(RESTART_THRESHOLD_SECONDS + 1, queueOf([a, b], 1))).toBe(true);
  });

  it('goes back to the previous track at the very start of a track', () => {
    expect(previousRestarts(1, queueOf([a, b], 1))).toBe(false);
  });

  it('restarts the first track, since there is nothing before it', () => {
    expect(previousRestarts(1, queueOf([a, b]))).toBe(true);
  });
});
