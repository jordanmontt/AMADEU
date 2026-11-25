# 0049. Persistent player: client-side navigation, one custom element, data-attribute buttons

- **Status:** Accepted; implements [0011](0011-persistent-audio-player.md)
- **Date:** 2026-11-24
- **Requirements:** RF-14, RF-47 to RF-49, RT-03, RT-42

## Context

[ADR 0011](0011-persistent-audio-player.md) decided on a fixed mini-player that keeps playing across pages, with a queue. A static site reloads the page on every link, which stops any sound. The site has no UI framework (RT-03), and pages are plain Astro components.

## Decision

- **Client-side navigation.** The layout includes Astro's `<ClientRouter />`. Links load the next page and swap it in without a full reload, as long as the page is part of the site. Links to the admin (a separate application) carry `data-astro-reload`.
- **One persisted element.** The player is the custom element `<amadeu-player>` (`src/components/player/`), placed last in the layout with `transition:persist`. Astro keeps this same element, with its state, from page to page.
- **Detached audio.** The element plays through an `Audio` object that is never attached to the document. Moving the element between pages therefore cannot pause it.
- **Pages talk to the player through data attributes only.** `PlayerButton.astro` renders a `<button data-player-action="play|enqueue">` that carries its tracks as JSON. One click listener on the document handles every such button, so buttons on newly loaded pages work without running scripts. The player validates the JSON with `parseTracks` (`src/lib/player/track.ts`).
- **Queue semantics** (`src/lib/player/queue.ts`, framework-free and unit-tested):
  - "Play" replaces the queue with the list it carries and plays from the chosen track.
  - "Add to queue" appends without interrupting.
  - A track appears at most once.
  - "Previous" restarts the track after its first 3 seconds.
  - On a collection page, playing one recording goes on with the next ones, like an album. On a song page, each version plays on its own.
- **"Listen to the whole work"** plays the primary recording of each text in editorial order (`Catalog.playlistOf`).
- **State is broadcast.** Every change of track or play state is dispatched as `amadeu:player-change` on the document. Buttons that play one recording turn into "pause" buttons through this event, and H4's drawing animations will listen to it.
- **Phones.** The Media Session API provides lock-screen and headset controls.
- **Look.** The progress bar is a green band that forms the player's top edge. The bar is `position: sticky` at the bottom of the page, so it never covers the footer.

## Consequences

- Sound continues across every page of the site. A full reload still stops it and empties the queue. Full reloads happen when opening a `/id/` permanent link from outside, or on a manual reload. Restoring the queue from `sessionStorage` can be added later if visitors need it.
- Page scripts must expect client-side navigation. Code that runs on page load listens to `astro:page-load`, which fires on the first load and after each navigation; `DOMContentLoaded` fires only once. The search page loads Pagefind this way, because the router runs a page's inline scripts without waiting for its external scripts to load.
- No framework. The player script is 14 KB (5 KB compressed) and Astro's router 17 KB (6 KB compressed), measured on the fixture build: well within the 100 KB budget of RT-41.
- The lyrics are on the song page next to its recordings, and the player's title links to them (RF-49).

## Rejected alternatives

- **One native `<audio>` per recording:** sound stops at each navigation (the H2 interim solution).
- **Putting the site in an iframe or a single-page app** to keep the audio alive: it breaks URLs, history and accessibility.
- **A UI framework island (React or Preact)** for the player: more JavaScript and a second component model, for a single component.
- **Buttons with their own scripts:** they would have to re-register after every navigation. A single document listener does not.
