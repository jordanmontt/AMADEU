/**
 * What the persistent player tells the rest of the page (ADR 0049): every change of track
 * or of play state is dispatched on the document as a `PLAYER_CHANGE_EVENT` whose detail is
 * a `PlayerChange`. Buttons and drawing animations listen to it.
 */

export const PLAYER_CHANGE_EVENT = 'amadeu:player-change';

export interface PlayerChange {
  /** The current track's recording id; undefined when the queue is empty. */
  readonly trackId: string | undefined;
  readonly playing: boolean;
}
