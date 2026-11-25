# Fixture content

A small, fixed content set used by the E2E tests (`npm run build:e2e` builds the site from
this folder via `CONTENT_DIR`). It covers:

- section ordering (sections listed out of order in `works/sys.yml`);
- a work whose file name (`sys`, its id) differs from its URL slug (`sangre-y-sueno`);
- a text with a recording and one without (`Luna Andina`), a pending text that must not be
  published (and appears in the pending tasks);
- a text with everything a text page can show (`Cordillera Real`): an alternative title,
  its source edition, critical notes, a facsimile page, and two versions, the primary one
  with performers and credits;
- upcoming and draft works;
- a drawing sheet (2400 px wide, to zoom into) with one panel cut from it (`hoja-prueba`,
  `panel-prueba`), a document and a photograph of Marcelo (`foto-prueba`);
- the animated drawing "Alcalde de la canción" (`dibujo-93`) and its song;
- audio: quiet tones of 60 s (`silencio.mp3`, `cordillera-casera.mp3`) to check the player
  while it sounds, and of 2 s (`alcalde.mp3`) to see it move on to the next track;
- a video without YouTube id and one with an (invented) YouTube id;
- a biography page and a two-event timeline listed out of order;
- permanent links.

Change it only together with the tests that rely on it.
