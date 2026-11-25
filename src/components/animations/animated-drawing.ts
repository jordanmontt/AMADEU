/**
 * `<animated-drawing>`: brings a layered drawing to life (RF-50 to RF-52, ADR 0051, ADR 0054).
 *
 * It only sets attributes; the movements are CSS (AnimatedDrawing.astro), so with "reduce
 * motion" nothing moves and the drawing stays as Marcelo drew it:
 * - `data-moving`: the parts move. With `data-trigger="playing"` only while the player
 *   sounds (the hand strums with the music); with `"always"` from the start.
 * - `data-writing` the first time the drawing is seen and loaded: the handwriting appears as
 *   if being written, then `data-written` once it is done.
 */
import { PLAYER_CHANGE_EVENT, type PlayerChange } from '../../lib/player/events';

class AnimatedDrawing extends HTMLElement {
  readonly #onPlayerChange = (event: Event): void => {
    this.toggleAttribute('data-moving', (event as CustomEvent<PlayerChange>).detail.playing);
  };
  #observer: IntersectionObserver | undefined;

  connectedCallback(): void {
    if (this.dataset.trigger === 'always') {
      this.setAttribute('data-moving', '');
    } else {
      // Shown while a song already plays (after navigating): the player says so on its element.
      const player = document.querySelector('amadeu-player');
      this.toggleAttribute('data-moving', player?.hasAttribute('data-playing') ?? false);
      document.addEventListener(PLAYER_CHANGE_EVENT, this.#onPlayerChange);
    }
    this.#watchForFirstView();
  }

  disconnectedCallback(): void {
    document.removeEventListener(PLAYER_CHANGE_EVENT, this.#onPlayerChange);
    this.#observer?.disconnect();
  }

  #watchForFirstView(): void {
    if (this.hasAttribute('data-writing')) {
      return;
    }
    this.#observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.#observer?.disconnect();
          // Write over the drawing, not over an image still loading. A broken image is
          // shown at once: there is nothing to write over.
          const background = this.querySelector('img');
          void (background?.decode() ?? Promise.resolve()).finally(() => {
            this.#write();
          });
        }
      },
      { threshold: 0.25 },
    );
    this.#observer.observe(this);
  }

  #write(): void {
    this.setAttribute('data-writing', '');
    const last = [...this.querySelectorAll('.ink-line')].at(-1);
    if (last === undefined) {
      this.setAttribute('data-written', '');
      return;
    }
    last.addEventListener(
      'animationend',
      () => {
        this.setAttribute('data-written', '');
      },
      { once: true },
    );
  }
}

customElements.define('animated-drawing', AnimatedDrawing);
