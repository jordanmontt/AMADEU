# Fixture content

A small, fixed content set used by the E2E tests (`npm run build:e2e` builds the site from
this folder via `CONTENT_DIR`). It covers:

- section ordering (sections listed out of order in `works/sys.yml`);
- a work whose file name (`sys`, its id) differs from its URL slug (`sangre-y-sueno`);
- a text with a recording and one without (`Luna Andina`), a pending text that must not be
  published (and appears in the pending tasks);
- upcoming and draft works;
- media: `media/audio/silencio.mp3` (3 s of silence) and `media/images/dibujo-prueba.webp`;
- a video without YouTube id and one with an (invented) YouTube id;
- a biography page and a two-event timeline listed out of order;
- permanent links.

Change it only together with the tests that rely on it.
