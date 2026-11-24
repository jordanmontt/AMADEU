# Agent instructions

Repository-wide facts and rules for any coding agent. Humans: see [CONTRIBUTING.md](CONTRIBUTING.md).

## Project

AMADEU is the static Astro 7 site (PWA) of the Marcelo de Urioste digital archive. v1 publishes only *Sangre y Sueño*. Read before designing anything:

- [docs/architecture.md](docs/architecture.md): structure and dependency rules.
- [docs/02-technical-requirements.md](docs/02-technical-requirements.md): technical requirements (`RT-…`).
- [docs/01-requerimientos-funcionales.md](docs/01-requerimientos-funcionales.md): functional requirements (`RF-…`, in Spanish).
- [docs/adr/](docs/adr/README.md): decisions. A changed decision needs a new ADR that supersedes the old one; never delete or rewrite an accepted ADR.

Source material (MP3s, TIFF scans, PDFs, inventory) lives **outside** the repository, in the parent folder. Never commit source masters (TIFF, WAV, full videos). Only web-sized images (`src/content/media/images/`, ≤ ~2400 px) and audio (`src/content/media/audio/`) belong in the repository ([ADR 0044](docs/adr/0044-media-in-the-repository.md)).

## Rules

- `src/lib/` must not import `astro:*` modules. Domain logic goes there, with tests next to it.
- `src/data/catalog.ts` is the only reader of `astro:content`. Pages query the `Catalog`.
- No hard-coded UI text: use `src/i18n/es.ts`.
- Code, comments, tests, technical docs and commit messages in English; UI, admin labels and URLs in Spanish.
- Every change includes tests. Tests are isolated: no network, no files outside the repository. Use `tests/support/builders.ts`.
- Conventional Commits. Do not push or open pull requests unless asked.

## Commands

```bash
npm run verify     # check + lint + format:check + test:coverage + build
npm run test:e2e   # Playwright (Chromium, Firefox, WebKit) on the fixture build
```

When starting `astro dev` or `astro preview` yourself, Astro runs them in the background for agents; stop them with `npx astro dev stop` / `npx astro preview stop`.
