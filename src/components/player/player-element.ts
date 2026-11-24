/**
 * The persistent audio player (RF-47 to RF-49, ADR 0011, ADR 0049).
 *
 * `<amadeu-player>` lives in the page layout with `transition:persist`, so Astro's client
 * router keeps this very element, and the sound, across page changes. The audio element is
 * never attached to the document, so moving the player between pages cannot interrupt it.
 *
 * Pages talk to it only through buttons with `data-player-action` (see PlayerButton.astro).
 * One click listener on the document handles them, so buttons in newly loaded pages work
 * without running any script. The player announces every change of track or of play state
 * as a `amadeu:player-change` event on the document (also used by the drawing animations).
 */
import { es } from '../../i18n/es';
import { formatDuration } from '../../lib/format';
import { PLAYER_CHANGE_EVENT, type PlayerChange } from '../../lib/player/events';
import { PlayQueue, previousRestarts } from '../../lib/player/queue';
import { parseTracks, type Track } from '../../lib/player/track';

/** How long a confirmation such as "added to the queue" stays visible. */
const STATUS_SECONDS = 4;

class PlayerElement extends HTMLElement {
  readonly #audio = new Audio();
  readonly #queue = new PlayQueue();
  #wired = false;
  #statusTimer: number | undefined;

  connectedCallback(): void {
    // Persisting the element across pages reconnects it: wire it only once.
    if (this.#wired) {
      return;
    }
    this.#wired = true;
    this.#audio.preload = 'none';
    this.#part('[data-toggle]', HTMLElement).addEventListener('click', () => {
      this.toggle();
    });
    this.#part('[data-previous]', HTMLElement).addEventListener('click', () => {
      this.previous();
    });
    this.#part('[data-next]', HTMLElement).addEventListener('click', () => {
      this.next();
    });
    this.#part('[data-queue-toggle]', HTMLElement).addEventListener('click', () => {
      this.#toggleQueuePanel();
    });
    this.#seek().addEventListener('input', () => {
      this.#audio.currentTime = Number(this.#seek().value);
    });
    this.#part('[data-queue-list]', HTMLElement).addEventListener('click', (event) => {
      this.#onQueueClick(event);
    });
    this.#audio.addEventListener('play', () => {
      this.#renderState();
    });
    this.#audio.addEventListener('pause', () => {
      this.#renderState();
    });
    this.#audio.addEventListener('timeupdate', () => {
      this.#renderProgress();
    });
    this.#audio.addEventListener('loadedmetadata', () => {
      this.#renderProgress();
    });
    this.#audio.addEventListener('ended', () => {
      this.#onEnded();
    });
    this.#audio.addEventListener('error', () => {
      this.#onError();
    });
    this.#wireMediaSession();
  }

  /** Replaces the queue with `tracks` and plays from `start`. */
  play(tracks: readonly Track[], start: number): void {
    this.#queue.replace(tracks, start);
    this.#load();
    this.#start();
  }

  /** Adds `tracks` to the queue; with nothing queued before, loads the first without playing. */
  enqueue(tracks: readonly Track[]): void {
    const wasEmpty = this.#queue.isEmpty();
    const added = this.#queue.append(tracks);
    if (wasEmpty && added > 0) {
      this.#load();
    }
    this.#renderQueue();
    this.#showStatus(es.player.added(added));
  }

  /** Plays or pauses the current track. */
  toggle(): void {
    if (this.#audio.paused) {
      this.#start();
    } else {
      this.#audio.pause();
    }
  }

  /** Whether `trackId` is the current track and is sounding. */
  isPlaying(trackId: string): boolean {
    return this.#queue.current()?.id === trackId && !this.#audio.paused;
  }

  previous(): void {
    if (previousRestarts(this.#audio.currentTime, this.#queue)) {
      this.#audio.currentTime = 0;
      return;
    }
    this.#queue.previous();
    this.#load();
    this.#start();
  }

  next(): void {
    if (this.#queue.next() === undefined) {
      return;
    }
    this.#load();
    this.#start();
  }

  #onEnded(): void {
    if (this.#queue.next() === undefined) {
      this.#audio.currentTime = 0;
      this.#renderState();
      return;
    }
    this.#load();
    this.#start();
  }

  #onError(): void {
    this.#audio.pause();
    const track = this.#queue.current();
    // The browser's reason (MediaError code 1 aborted, 2 network, 3 decode, 4 unsupported)
    // goes to the console for whoever investigates; the visitor gets a plain message.
    const { error } = this.#audio;
    console.error(
      `Audio error ${String(error?.code)} on ${this.#audio.currentSrc} at ${this.#audio.currentTime.toFixed(1)} s: ${error?.message ?? ''}`,
    );
    if (track !== undefined) {
      // Audio is not kept offline (RF-54): say so rather than a vague failure.
      const message = navigator.onLine
        ? es.player.loadError(track.title)
        : es.player.offline(track.title);
      this.#showStatus(message, { error: true });
    }
    this.#renderState();
  }

  #onQueueClick(event: Event): void {
    const button = (event.target as Element).closest<HTMLButtonElement>('button[data-index]');
    if (button === null) {
      return;
    }
    const index = Number(button.dataset.index);
    if (button.dataset.remove === undefined) {
      this.#queue.jumpTo(index);
      this.#load();
      this.#start();
      return;
    }
    this.#remove(index);
  }

  #remove(index: number): void {
    const before = this.#queue.current();
    this.#queue.remove(index);
    if (this.#queue.isEmpty()) {
      this.#audio.pause();
      this.#audio.removeAttribute('src');
      this.hidden = true;
      this.#renderState();
      return;
    }
    if (this.#queue.current() !== before) {
      const wasPlaying = !this.#audio.paused;
      this.#load();
      if (wasPlaying) {
        this.#start();
      }
    }
    this.#renderQueue();
    // Keep the keyboard where it was: on the row that took the removed one's place.
    const rows = this.#part('[data-queue-list]', HTMLElement).querySelectorAll<HTMLButtonElement>(
      'button[data-remove]',
    );
    (
      rows[Math.min(index, rows.length - 1)] ?? this.#part('[data-queue-toggle]', HTMLElement)
    ).focus();
  }

  /** Points the audio at the current track and shows it. */
  #load(): void {
    const track = this.#queue.current();
    if (track === undefined) {
      return;
    }
    this.hidden = false;
    this.#audio.src = track.src;
    this.#clearStatus();
    // The title links to the lyrics (RF-49) when the recording is a version of a text.
    const title = document.createElement(track.href === undefined ? 'span' : 'a');
    title.textContent = track.title;
    if (title instanceof HTMLAnchorElement && track.href !== undefined) {
      title.href = track.href;
      title.title = es.player.lyrics;
    }
    this.#part('[data-title]', HTMLElement).replaceChildren(title);
    this.#part('[data-collection]', HTMLElement).textContent = track.collection ?? '';
    this.#seek().value = '0';
    this.#renderProgress();
    this.#renderQueue();
    this.#renderState();
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: 'Marcelo de Urioste',
        ...(track.collection === undefined ? {} : { album: track.collection }),
      });
    }
  }

  #start(): void {
    // A rejected play() (for example, the file is missing) is reported by the error event.
    this.#audio.play().catch(() => undefined);
  }

  #renderState(): void {
    const playing = !this.#audio.paused;
    const toggle = this.#part('[data-toggle]', HTMLElement);
    toggle.setAttribute('aria-label', playing ? es.player.pause : es.player.play);
    toggle.toggleAttribute('data-playing', playing);
    this.#part('[data-previous]', HTMLButtonElement).disabled = this.#queue.isEmpty();
    this.#part('[data-next]', HTMLButtonElement).disabled = !this.#queue.hasNext();
    this.toggleAttribute('data-playing', playing);
    const change: PlayerChange = { trackId: this.#queue.current()?.id, playing };
    document.dispatchEvent(new CustomEvent(PLAYER_CHANGE_EVENT, { detail: change }));
  }

  #renderProgress(): void {
    const total = this.#duration();
    const elapsed = Math.min(this.#audio.currentTime, total);
    const seek = this.#seek();
    seek.max = String(Math.round(total));
    seek.value = String(Math.floor(elapsed));
    seek.style.setProperty('--progress', `${String(total > 0 ? (elapsed / total) * 100 : 0)}%`);
    seek.setAttribute(
      'aria-valuetext',
      es.player.positionText(formatDuration(elapsed), formatDuration(total)),
    );
    this.#part('[data-elapsed]', HTMLElement).textContent = formatDuration(elapsed);
    this.#part('[data-total]', HTMLElement).textContent = formatDuration(total);
  }

  /** The real duration once known, the catalogued one until then. */
  #duration(): number {
    const known = this.#audio.duration;
    return Number.isFinite(known) && known > 0
      ? known
      : (this.#queue.current()?.durationSeconds ?? 0);
  }

  #renderQueue(): void {
    const tracks = this.#queue.tracks();
    this.#part('[data-queue-count]', HTMLElement).textContent = String(tracks.length);
    this.#part('[data-queue-unit]', HTMLElement).textContent = es.player.queueUnit(tracks.length);
    this.#part('[data-queue-list]', HTMLElement).replaceChildren(
      ...tracks.map((track, index) => this.#queueRow(track, index)),
    );
  }

  #queueRow(track: Track, index: number): HTMLLIElement {
    const row = document.createElement('li');
    const current = index === this.#queue.position();
    if (current) {
      row.setAttribute('aria-current', 'true');
    }
    const jump = document.createElement('button');
    jump.type = 'button';
    jump.dataset.index = String(index);
    jump.className = 'jump';
    const title = document.createElement('span');
    title.className = 'row-title';
    title.textContent = track.title;
    const details = document.createElement('span');
    details.className = 'row-details';
    details.textContent = [
      current ? es.player.nowPlaying : undefined,
      track.collection,
      formatDuration(track.durationSeconds),
    ]
      .filter((part) => part !== undefined)
      .join(', ');
    jump.append(title, details);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.dataset.index = String(index);
    remove.dataset.remove = '';
    remove.className = 'remove';
    remove.setAttribute('aria-label', es.player.remove(track.title));
    remove.textContent = '×';
    row.append(jump, remove);
    return row;
  }

  #toggleQueuePanel(): void {
    const toggle = this.#part('[data-queue-toggle]', HTMLElement);
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    this.#part('[data-queue]', HTMLElement).hidden = !open;
  }

  #showStatus(message: string, { error = false } = {}): void {
    const status = this.#part('[data-status]', HTMLElement);
    status.textContent = message;
    status.toggleAttribute('data-error', error);
    window.clearTimeout(this.#statusTimer);
    if (!error) {
      this.#statusTimer = window.setTimeout(() => {
        this.#clearStatus();
      }, STATUS_SECONDS * 1000);
    }
  }

  #clearStatus(): void {
    window.clearTimeout(this.#statusTimer);
    this.#part('[data-status]', HTMLElement).textContent = '';
  }

  /** Lock-screen and headset controls on phones. */
  #wireMediaSession(): void {
    if (!('mediaSession' in navigator)) {
      return;
    }
    const session = navigator.mediaSession;
    session.setActionHandler('play', () => {
      this.#start();
    });
    session.setActionHandler('pause', () => {
      this.#audio.pause();
    });
    session.setActionHandler('previoustrack', () => {
      this.previous();
    });
    session.setActionHandler('nexttrack', () => {
      this.next();
    });
  }

  #seek(): HTMLInputElement {
    return this.#part('[data-seek]', HTMLInputElement);
  }

  /** The element of the player markup matching `selector`, checked to be a `type`. */
  #part<T extends HTMLElement>(selector: string, type: new () => T): T {
    const element = this.querySelector(selector);
    if (!(element instanceof type)) {
      throw new Error(`The player markup has no ${type.name} ${selector}`);
    }
    return element;
  }
}

customElements.define('amadeu-player', PlayerElement);

function player(): PlayerElement | null {
  return document.querySelector<PlayerElement>('amadeu-player');
}

/** Handles every `[data-player-action]` button of every page (see PlayerButton.astro). */
document.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('button[data-player-action]');
  const target = player();
  if (button === null || target === null) {
    return;
  }
  const { playerAction, playerTracks = '[]', playerStart = '0', playerTrack } = button.dataset;
  if (playerTrack !== undefined && target.isPlaying(playerTrack)) {
    target.toggle();
    return;
  }
  const tracks = parseTracks(playerTracks);
  if (playerAction === 'enqueue') {
    target.enqueue(tracks);
  } else {
    target.play(tracks, Number(playerStart));
  }
});

/** Shows on every toggling button whether its recording is the one sounding. */
function syncButtons(change: PlayerChange): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>('button[data-player-track]')) {
    const playing = change.playing && button.dataset.playerTrack === change.trackId;
    button.toggleAttribute('data-playing', playing);
    const label = playing ? button.dataset.labelPause : button.dataset.labelPlay;
    if (label !== undefined) {
      button.setAttribute('aria-label', label);
    }
  }
}

let lastChange: PlayerChange = { trackId: undefined, playing: false };
document.addEventListener(PLAYER_CHANGE_EVENT, (event) => {
  lastChange = (event as CustomEvent<PlayerChange>).detail;
  syncButtons(lastChange);
});
// A newly loaded page renders its buttons as "play": mark the one that is sounding.
document.addEventListener('astro:page-load', () => {
  syncButtons(lastChange);
});
