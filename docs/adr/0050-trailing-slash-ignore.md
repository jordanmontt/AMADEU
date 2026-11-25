# 0050. URLs end in a slash by convention, not by the `trailingSlash` setting

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RT-21, RT-58

## Context

Pages are built as folders (`/obras/index.html`), and every link the site writes ends in `/` (`src/lib/routes.ts`). Astro's `trailingSlash: 'always'` also makes `astro dev` answer 404 to any URL without the final slash, which catches links written wrongly.

The audio endpoint publishes files at `/audio/<file>.mp3`. With astro 7.4.13, `astro dev` answers 404 there too: it serves the audio only at `/audio/<file>.mp3/`. The build is correct, since it writes `dist/audio/<file>.mp3` and `astro preview` serves it. So under `astro dev` no recording could be played. The gap is logged as an upstream issue candidate for Astro.

## Decision

`trailingSlash: 'ignore'`. Links keep ending in `/`, because `routes.ts` builds them and its tests check them.

## Consequences

- Audio plays under `npm run dev`.
- The build output is unchanged: the same folders and the same links. On Cloudflare Pages, a URL without the slash is redirected to the folder, as before.
- `astro dev` no longer reports a link that lacks its final slash. Such a link still works, because the host redirects it. Links are built by `routes.ts`, whose unit tests check the slash.
- Return to `'always'` once Astro's dev server exempts endpoints with a file extension.

## Rejected alternatives

- **Keep `'always'` and play audio only in a build** (`astro preview`): it slows down every change that touches the player or the recordings.
- **Serve audio at `/audio/<file>.mp3/`:** a file URL with a final slash is wrong, and it would differ from the build.
- **A dev-only server middleware for `/audio/`:** more code, to work around a bug in a tool.
