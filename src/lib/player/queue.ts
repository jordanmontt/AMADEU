/**
 * The play queue of the persistent player (RF-48): an ordered list of tracks and the one
 * being played. It knows nothing about audio; the player element asks it what to play.
 *
 * A track appears at most once: adding one that is already queued does nothing, so
 * "add to queue" can be pressed twice without effect.
 */
import type { Track } from './track';

/** Pressing "previous" later than this into a track restarts it, as music players do. */
export const RESTART_THRESHOLD_SECONDS = 3;

export class PlayQueue {
  #tracks: Track[] = [];
  #position = 0;

  /** The queued tracks, in play order. */
  tracks(): readonly Track[] {
    return this.#tracks;
  }

  /** Index of the current track; meaningless while the queue is empty. */
  position(): number {
    return this.#position;
  }

  current(): Track | undefined {
    return this.#tracks[this.#position];
  }

  isEmpty(): boolean {
    return this.#tracks.length === 0;
  }

  hasNext(): boolean {
    return this.#position < this.#tracks.length - 1;
  }

  hasPrevious(): boolean {
    return this.#position > 0;
  }

  /** Replaces the queue with `tracks` (duplicates dropped) and makes `start` current. */
  replace(tracks: readonly Track[], start = 0): void {
    const startId = tracks[start]?.id;
    this.#tracks = withoutDuplicates(tracks);
    const position = this.#tracks.findIndex((track) => track.id === startId);
    this.#position = Math.max(position, 0);
  }

  /** Adds the tracks that are not queued yet at the end; answers how many were added. */
  append(tracks: readonly Track[]): number {
    const queued = new Set(this.#tracks.map((track) => track.id));
    const added = withoutDuplicates(tracks).filter((track) => !queued.has(track.id));
    this.#tracks = [...this.#tracks, ...added];
    return added.length;
  }

  /** Moves to the next track and answers it, or answers undefined at the end of the queue. */
  next(): Track | undefined {
    if (!this.hasNext()) {
      return undefined;
    }
    this.#position += 1;
    return this.current();
  }

  /** Moves to the previous track and answers it, or answers undefined at the start. */
  previous(): Track | undefined {
    if (!this.hasPrevious()) {
      return undefined;
    }
    this.#position -= 1;
    return this.current();
  }

  /** Makes the track at `index` current. */
  jumpTo(index: number): Track {
    const track = this.#tracks[index];
    if (track === undefined) {
      throw new RangeError(`No track at position ${String(index)} of the queue`);
    }
    this.#position = index;
    return track;
  }

  /**
   * Removes the track at `index`. When it was the current one, the following track becomes
   * current (or the previous one, if it was the last).
   */
  remove(index: number): void {
    if (this.#tracks[index] === undefined) {
      throw new RangeError(`No track at position ${String(index)} of the queue`);
    }
    this.#tracks = this.#tracks.filter((_, each) => each !== index);
    if (index < this.#position || this.#position === this.#tracks.length) {
      this.#position = Math.max(this.#position - 1, 0);
    }
  }
}

/** Whether "previous" at `elapsedSeconds` into a track restarts it instead of going back. */
export function previousRestarts(elapsedSeconds: number, queue: PlayQueue): boolean {
  return elapsedSeconds > RESTART_THRESHOLD_SECONDS || !queue.hasPrevious();
}

function withoutDuplicates(tracks: readonly Track[]): Track[] {
  const seen = new Set<string>();
  return tracks.filter((track) => {
    if (seen.has(track.id)) {
      return false;
    }
    seen.add(track.id);
    return true;
  });
}
