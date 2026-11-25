# Contributing

Start with [docs/architecture.md](docs/architecture.md) (how it fits together), [docs/02-technical-requirements.md](docs/02-technical-requirements.md) (what it must do) and the [GLOSSARY](GLOSSARY.md). Every non-obvious choice has an [ADR](docs/adr/README.md).

## Setup

Requirements: Node 24 LTS (see `.nvmrc`), npm, and ffmpeg (the build re-encodes audio over 25 MiB, [ADR 0045](docs/adr/0045-long-audio-recompressed-at-build.md)).

```bash
npm ci
npx playwright install chromium firefox webkit   # browsers for E2E tests
cp .env.example .env                              # optional, local settings
npm run dev                                       # http://localhost:4321
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build into `dist/`: Astro, then the Pagefind index, then the service worker |
| `npm run check` | Type-check, including `.astro` files (`astro check`) |
| `npm run lint` | ESLint (typescript-eslint strict, Astro, accessibility rules) |
| `npm run format` / `format:check` | Prettier |
| `npm test` | Unit, content integrity and component tests (Vitest) |
| `npm run test:coverage` | Same, enforcing ≥ 90 % coverage of `src/lib/` |
| `npm run test:e2e` | Builds the fixture site and runs Playwright in Chromium, Firefox and WebKit |
| `npm run verify` | Everything CI runs before E2E |

## Where things go

| Path | Contents |
|---|---|
| `src/lib/` | Framework-free domain logic. Never import `astro:*` here. Every module has a `*.test.ts` next to it. |
| `src/data/catalog.ts` | The only reader of `astro:content`. |
| `src/content/` | Real content, edited by the Foundation through the admin. One folder per collection; file name = entry id. Images in `media/images/`, audio in `media/audio/` ([ADR 0044](docs/adr/0044-media-in-the-repository.md)). |
| `scripts/import/` | One-off import scripts and their manifests (`data/`); logic in `scripts/lib/`, tested in `tests/scripts/` ([ADR 0047](docs/adr/0047-initial-import.md)). |
| `src/content.config.ts` | Astro collections; schemas come from `src/lib/content/schemas.ts`. |
| `src/pages/` | Routes. Pages ask the `Catalog` and pass plain data to components. |
| `src/components/` | Presentational components, tested with the Astro Container API. |
| `src/i18n/es.ts` | All UI strings. |
| `tests/support/` | Test builders and the content loader used by integrity tests. |
| `tests/content/` | Content integrity tests over real and fixture content. |
| `tests/fixtures/content/` | Fixed content for E2E tests. |
| `tests/e2e/` | Playwright specs, including axe accessibility checks. |

## Testing rules

See [ADR 0040](docs/adr/0040-testing-strategy.md).

- Every change comes with tests for the behaviour it adds or changes. Name tests after behaviour ("hides draft works"), not implementation.
- Tests are isolated: no network, no files outside the repository, no shared state. Build test data with `tests/support/builders.ts`, which parses through the real schemas.
- E2E tests run against `tests/fixtures/content/`, never the real content. If a test needs a new case, add it to the fixtures and update `tests/fixtures/content/README.md`.
- New logic goes into `src/lib/` so it can be unit-tested; keep pages and components thin.
- **Name the requirement a test checks** in its title: "shows the critical notes (RF-21)". `tests/requirements/coverage.test.ts` fails if a requirement of `docs/01-requerimientos-funcionales.md` is named by no test and is not in its "not checked yet" list (with the reason). When you implement a listed requirement, tag its tests and remove it from the list.
- **Check what the visitor gets, not the code's own state:** that the audio position moves forward, not only that the player says it plays; that the hand moves on screen, not only that it has an animation.
- **E2E tests import `test` from `tests/e2e/support/test.ts`.** It attaches the browser console to the report when a test fails, which explains failures that only happen in CI.
- **Phones:** tests tagged `@phone` also run on a Pixel 7 and an iPhone 14 screen (`phone-chromium`, `phone-webkit`); `tests/e2e/phone.spec.ts` checks the layout and accessibility at that size. Tag the main journeys of new features.
- **Keyboard:** `tests/e2e/keyboard.spec.ts` uses the site with the keyboard alone. Safari moves focus to links only with Option+Tab, which the tests use in WebKit.

## Adding a content collection or field

1. Add or change the Zod schema in `src/lib/content/schemas.ts` (field names in English).
2. Register the collection in `src/content.config.ts` and in `tests/support/load-content.ts`.
3. Add cross-entry rules to `src/lib/content/integrity.ts`, with tests.
4. Expose what pages need through the `Catalog`, with tests.
5. Add the field to the Sveltia CMS configuration with a Spanish label (milestone H6).
6. Update section 4 of `docs/02-technical-requirements.md` and the ER diagram in `docs/architecture.md`.

## Changing the admin panel

The admin is Sveltia CMS, configured in `public/admin/config.yml` ([ADR 0055](docs/adr/0055-admin-panel-configuration.md)).

- When you change a schema in `src/lib/content/schemas.ts`, change the matching collection in `config.yml`: `tests/content/admin-config.test.ts` fails until both agree.
- After changing `config.yml`, open `http://localhost:4321/admin/index.html` with `npm run dev` running. Sveltia validates the configuration and shows any error instead of the sign-in screen.
- To edit content locally, choose "Work with Local Repository" in a Chromium browser and pick this repository's folder. Sveltia edits the working copy; review the changes with `git diff` before committing.
- Raise the pinned Sveltia version in `public/admin/index.html` on purpose, after reading its release notes.

## Animating a drawing

Animations are handcrafted ([ADR 0051](docs/adr/0051-raster-layer-animations.md)); "Alcalde de la canción" (`src/lib/animations/alcalde-de-la-cancion.ts`) is the example to follow.

1. Trace the parts on the stored scan (`src/content/media/images/<id>.webp`). `npx tsx scripts/animations/grid.ts` draws a labelled pixel grid over a crop of it, to read the coordinates. Each part needs an outline, a pivot, a motion (`strum`, `sway`, `drift`) and the length of a cycle; a part that slides near a painted frame also needs a `window` and a `feather`. Choose the `fill` (`paper` for ink on white, `wash` for watercolours, with a `paperSample` for tinted paper) and the `trigger` (`playing` or `always`). Add repairs where moving a part would uncover bare paper, and writing bands over handwritten lines ([ADR 0054](docs/adr/0054-animations-on-watercolour.md)).
2. Add the description to `src/lib/animations/registry.ts`.
3. Cut the layers: `npx tsx scripts/animations/build.ts`. Commit the files in `src/assets/animations/<id>/`.
4. Check the parts at both ends of their motion, zoomed in: compose the layers at the far end of the motion with `sharp`, or in the browser after emptying its cache (it keeps processed images by URL under `astro dev`). Look for leftover lines, paper uncovered by the motion, and seams where a sliding part was cut.

## Conventions

- **Language** ([ADR 0039](docs/adr/0039-language-split.md)): code, comments, tests, technical docs and commit messages in English; UI strings, admin labels and public URLs in Spanish.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`).
- **Branches:** one branch and pull request per milestone; `main` is always deployable and protected by CI.
- **Decisions:** a new design decision gets an ADR in `docs/adr/`; a changed decision gets a new ADR that supersedes the old one. Never delete an ADR.
- **Browser scripts:** navigation is client-side (`<ClientRouter />`), so a page is often shown without a full load. Code that sets up a page listens to `astro:page-load`, never `DOMContentLoaded`; prefer custom elements and document-level listeners, which need no setup per page ([ADR 0049](docs/adr/0049-persistent-player-implementation.md)). Links that leave the Astro site (the admin) carry `data-astro-reload`.
- **Dependencies:** TypeScript stays on the 6.0 line until `@astrojs/check` and `typescript-eslint` support a newer one ([ADR 0042](docs/adr/0042-code-quality-tooling.md)).

## Known tooling notes

- **Astro auto-backgrounds `astro dev` / `astro preview` when run by an AI coding agent.** The Playwright config sets `ASTRO_PREVIEW_BACKGROUND=0` (Astro's documented opt-out) so the preview server stays in the foreground.
- **`eslint-plugin-jsx-a11y` does not support ESLint 10 yet**; the project uses the drop-in `eslint-plugin-jsx-a11y-x`, as documented by `eslint-plugin-astro`.
- **`src/jsx.d.ts`** narrows Astro's JSX element type so type-aware lint rules work in `.astro` files (documented by `eslint-plugin-astro`).
- **`src/astro-modules.d.ts`** declares `.astro` modules for plain TypeScript tooling (`tsc`, typescript-eslint), which Astro 7 no longer types outside `astro check`. Component tests therefore do not type-check component props; `astro check` still checks every real usage. Remove the file once Astro ships an equivalent declaration.
- **After changing `src/content.config.ts`, restart `astro dev`.** The dev server keeps a content cache; a stale one shows errors such as `LocalImageUsedWrongly` that a clean build does not have.
- **`trailingSlash` is `'ignore'`, not `'always'`,** because `astro dev` answers 404 to `/audio/<file>.mp3` under `'always'` although the build serves it ([ADR 0050](docs/adr/0050-trailing-slash-ignore.md)). Links still end in `/`; build them with `src/lib/routes.ts`.
- **Firefox skips axe's `target-size` rule on the player's open queue:** Playwright's Firefox crashes while that rule runs there (logged upstream). Chromium and WebKit still check it.
- **The service worker exists only in a build** (`npm run build`, or `npm run build:e2e` for the tests). `astro dev` never registers it. To try offline reading, run `npm run build && npm run preview`, open the site once, then go offline in the browser's developer tools ([ADR 0052](docs/adr/0052-service-worker-after-the-build.md)).
- **App icons and favicon** are generated from the logo scan outside the repository: `npx tsx scripts/pwa/icons.ts "<path to the logo>"`.
