# 02 — Technical requirements

> Status: approved for v1 (prototype). Date: 2026-11-24.
> Implements the [functional requirements](01-requerimientos-funcionales.md) (Spanish, `RF-…`). Every choice is justified in an [ADR](adr/README.md). The structural view (components, data flows, deployment) is in [architecture.md](architecture.md).

## 1. Principles

- **RT-01. Near-zero cost.** The only planned expense is the domain (~10–15 USD/year). Everything else runs on free tiers.
- **RT-02. Maintainable by one engineer, transferable to another.** Prefer the option with the fewest moving parts: no own servers, no database, few dependencies. Code, tests and documentation must let a new engineer take over without the original developer ([ADR 0039](adr/0039-language-split.md), [0040](adr/0040-testing-strategy.md), [0043](adr/0043-architecture-documentation.md)).
- **RT-03. Static and light.** HTML is generated at build time. JavaScript only for interactive islands: audio player, animations, search, image viewer and the CMS.
- **RT-04. Durability.** No dependency on paid services; content in open formats (Markdown/YAML); masters preserved on Internet Archive.
- **RT-05. Reuse.** The same project builds the website and, later, the Android app.

## 2. Architecture overview

See [architecture.md](architecture.md) for C4 diagrams. In short:

- Static Astro site + PWA on **Cloudflare Pages**.
- Content as files in this repository, edited with **Sveltia CMS** at `/admin` (login through **Sveltia CMS Additions** on a Cloudflare Worker).
- Images and audio **in this repository**, uploaded from the admin; images optimized by Astro at build time ([ADR 0044](adr/0044-media-in-the-repository.md)). Video on **YouTube**; preservation masters on **Internet Archive**. No service needs a payment card.
- **GitHub Actions** validate, test, build and deploy on every change.
- **GoatCounter** for cookie-free analytics.

## 3. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Astro 7** (`output: 'static'`) | Content collections with Zod schemas; islands only where needed. |
| Language | **TypeScript 6.0.x**, strict | Pinned to the 6.0 line: required by `@astrojs/check` and `typescript-eslint` ([ADR 0042](adr/0042-code-quality-tooling.md)). |
| Runtime | **Node 24 LTS** | Pinned in `.nvmrc` and `engines`. |
| Interactivity | TypeScript, no UI framework (Web Components / plain modules) | The player and animations do not need React. Re-evaluate (e.g. Preact) only if a component justifies it. |
| Persistent navigation | Astro View Transitions (`<ClientRouter />`) + `transition:persist` | Keeps the player alive across pages (RF-47, [ADR 0049](adr/0049-persistent-player-implementation.md)). |
| PWA | **Workbox** (`workbox-build`), run after the build and Pagefind | Manifest, install, offline cache including the search index (RF-53, RF-54, [ADR 0052](adr/0052-service-worker-after-the-build.md)). |
| Search | **Pagefind** | Static index built after `astro build` (`npm run build` runs both); default UI themed with the design tokens (RF-35). |
| Image viewer | PhotoSwipe (MIT) or an equivalent light library | Zoom and pan (RF-27). |
| Animations | Raster layers cut from the scan with `sharp`, moved with CSS | No heavy libraries, no new tools (RF-50, [ADR 0051](adr/0051-raster-layer-animations.md)). |
| Fonts | Young Serif and Literata, self-hosted with Fontsource | No requests to third parties; available offline ([ADR 0048](adr/0048-watercolour-visual-identity.md)). |
| Styles | Plain CSS with design tokens (`src/styles/tokens.css`) and component-scoped styles | No CSS framework. |
| Image processing | Astro assets (`astro:assets`, `sharp`) | Responsive WebP at build time; `sharp` also used by import scripts. |
| Audio processing | ffmpeg | Build step that re-encodes audio over 25 MiB ([ADR 0045](adr/0045-long-audio-recompressed-at-build.md)); `ffprobe` in import scripts. |
| CMS | **Sveltia CMS** + **Sveltia CMS Additions** | See §6. |
| Hosting | **Cloudflare Pages** | Free plan. |
| Media | Files in this repository | See §5. |
| Video | **YouTube** (Foundation channel) | `youtube-nocookie.com`, loaded on click. |
| Preservation | **Internet Archive** | Original-quality masters. |
| Analytics | **GoatCounter** | Cookie-free, public dashboard (RF-62). |
| Unit / component tests | **Vitest** + Astro Container API | See §9. |
| E2E tests | **Playwright** (Chromium, Firefox, WebKit) + `@axe-core/playwright` | See §9. |
| Lint / format | ESLint (typescript-eslint strict, `eslint-plugin-astro`, jsx-a11y) + Prettier | |
| CI/CD | **GitHub Actions** | See §9. |
| Package manager | npm | Lockfile committed. |

## 4. Content model

### 4.1 Principles

- **RT-10. The repository is the database.** Content lives in `src/content/` and is validated by Zod schemas at build time. No database, no server ([ADR 0008](adr/0008-no-database.md)).
- **RT-11. Permanent identity.** Every entry has an `id` that **never changes** and does not depend on title or order (RF-58). Relations between collections always use `id`, never a title or slug.
  - An entry's id is its **file name** (without extension), lowercase kebab-case. It is set once, when the entry is created (by the import script or the admin), and never renamed afterwards. `src/content.config.ts` passes a `generateId` to Astro's `glob()` loader, because Astro would otherwise use a `slug` field as the id.
  - Ids are unique across page-bearing collections (works, texts, artworks, videos), because `/id/<id>/` must be unambiguous. Enforced by the content integrity tests.
- **RT-12. Slug separate from ID.** A text's URL slug derives from its current title and may change; works have an explicit permanent slug; gallery images and videos use their id in the URL. The stable link for everything is `/id/<id>/` (§7.2).
- **RT-13. Explicit order.** Sections and texts have an editable `order` field; nothing is sorted alphabetically by default.
- **RT-14. English names.** Fields and folders are in English; admin labels are in Spanish ([ADR 0039](adr/0039-language-split.md)).
- **RT-15. Reserved routes.** Work slugs must not equal a reserved route: `obras`, `escuchar`, `galeria`, `leer`, `videos`, `marcelo`, `buscar`, `admin`, `id` ([ADR 0038](adr/0038-works-at-root-path.md)). Enforced by the content integrity tests.

### 4.2 Collections

```
src/content/
├── works/        work (YAML)        — Sangre y Sueño, "coming soon" works
├── texts/        text (Markdown)    — poems and songs; the body is the text
├── recordings/   recording (YAML)
├── artworks/     image (YAML)       — drawings, watercolours, paintings, photos, documents
├── media/audio/  MP3 files          — published at /audio/<file> (RT-21)
├── media/images/ image files        — optimized by Astro
├── videos/       video (YAML)       — YouTube
├── people/       person (YAML)      — credits (musicians, engineers, editors)
├── pages/        page (Markdown)    — free-text pages, such as the biography (marcelo.md)
└── timeline.yml  timeline events    — the biography's timeline (RF-33)
src/data/
├── catalog.ts    the only reader of astro:content
└── audio.ts      audio publication (ADR 0045)
```

Main fields. `ref(x)` is a reference by `id` to collection `x`; `[]` is a list.

Every entry also has its `id` (the file name), which is not a field.

**`works`**: `title`, `subtitle`, `slug`, `status` (`published` | `upcoming` | `draft`), `year`, `description`, `cover` (ref artworks), `sections[]` (`{ id, title, slug, order, description }`), `order`.

**`texts`**:
- Identity: `title`, `altTitles[]` (`{ title, source }`). The URL slug is derived from `title`.
- Placement: `work` (ref works), `section` (section id within the work), `order`.
- Content: `kind` (`poem` | `song`), the body (the verses: one verse per line, stanzas separated by a blank line), `dedication`, `notes` (notes printed with the text in its source edition), `criticalNotes` (optional Markdown written for this archive), `facsimile[]` (ref artworks).
- Source: `edition` (`{ name, year, publisher, pages }`), `provisional` (boolean).
- Related media: `primaryRecording` (ref recordings): which of the recordings pointing to this text is shown first. Recordings, illustrations and videos are linked from their own side (see below).
- Rights: `rights`, `rightsHolder`, `license`. Review: `review` (see below).

**`recordings`**:
- Identity: `title`, `altTitles[]`, `texts[]` (ref texts; may be empty, e.g. an interview).
- Kind: `kind` (`song` | `recital` | `reading` | `interview` | `lecture` | `instrumental`).
- Date and provenance: `date`, `collection` (e.g. "LP Discolandia 1984", "Grabación casera 1993–95", "Recital Goethe-Institut 1981"), `venue`.
- Credits: `performers[]`, `credits[]` (`{ person: ref people, role }`).
- Audio: `durationSeconds`, `audio` (file name in `media/audio/`, e.g. `cordillera-real-casera.mp3`), `originalUrl` (Internet Archive).
- Other: `trackNumber`, `notes`, `rights`, `rightsHolder`, `license`.

**`artworks`**:
- Identity: `inventoryCode` (e.g. `ADLC-01`), `title`, `inscription` (handwritten verses).
- Description: `kind` (`drawing` | `watercolor` | `painting` | `photo` | `document` | `poster`), `technique`, `dimensions`, `date`, `place`, `series`.
- Sheets and panels: `sheet` (ref artworks: the sheet a panel belongs to). A sheet's panels are derived.
- Relations: `texts[]` (ref texts it illustrates).
- Image: `image` (file in `src/content/media/images/`, validated and processed by Astro's `image()` schema helper, which also provides width and height), `originalUrl` (Internet Archive), `sourceFile` (file name in the digitized archive).
- Other: `rating` (1–3, from the inventory), `animated` (boolean), `rights`, `rightsHolder`, `license`, `alt` (alternative text, **mandatory**).

**`videos`**:
- Identity: `title`, `series` (e.g. "Los Caminos del Hombre"), `episode`.
- Data: `date`, `durationSeconds`, `description`, `credits[]`.
- Media: `youtubeId` (the thumbnail is derived from it), `originalUrl` (Internet Archive), `texts[]` (for future poem video clips).
- Rights: `rights`, `rightsHolder`, `license`.

**Relations are stored on one side only.** Media point to the texts they belong to (`recording.texts`, `artwork.texts`, `video.texts`) and a panel points to its sheet; the `Catalog` derives the other direction, so the two sides can never disagree. The only relation stored on a text is a choice among those (`primaryRecording`) or an ordered list (`facsimile`).

**Review field** (texts, recordings, artworks, videos): `review` says what the Foundation still has to check about the entry (a doubt, a missing date, a link to confirm). It is listed among the pending tasks (RT-37) until an editor removes it. `notes`, by contrast, are permanent archival notes about the item itself.

**Common rights fields**:
- `rights`: `cleared` | `pending` | `restricted`. **Only `cleared` is published** (RF-57).
- `rightsHolder`: who holds the rights.
- `license`: `all-rights-reserved` by default, or a Creative Commons code.

### 4.3 Dublin Core mapping (RF-41)

| Dublin Core | Field |
|---|---|
| `dc:identifier` | `id`, `inventoryCode` |
| `dc:title` / `dcterms:alternative` | `title` / `altTitles` |
| `dc:creator` | Marcelo de Urioste (implicit) + `credits` |
| `dc:date` | `date` |
| `dc:type` | `kind` |
| `dc:format` / `dcterms:extent` | `technique`, `dimensions`, `durationSeconds` |
| `dc:description` | `description`, `inscription` |
| `dc:source` | `edition`, `collection`, `sourceFile` |
| `dc:relation` / `dcterms:isPartOf` | `texts`, `work`, `sheet` |
| `dc:rights` | `rights`, `rightsHolder`, `license` |

Every record page also emits schema.org JSON-LD (`CreativeWork`, `MusicRecording`, `VisualArtwork`, `VideoObject`) for search engines.

## 5. Media

- **RT-20. Images and audio live in this repository** ([ADR 0044](adr/0044-media-in-the-repository.md)). No payment card is registered anywhere, and the editor must upload media on their own; Sveltia uploads into the repository it edits. Expected size after the full import: ≈ 500 MB (GitHub recommends < 1 GB and blocks files > 100 MB). Monitor it with `git count-objects -vH`; the migration path is a separate content repository read through `CONTENT_DIR`.
- **RT-21. Audio** is stored in `src/content/media/audio/`. A static endpoint (`src/pages/audio/[file].ts`) publishes the audio of every **published** recording at `/audio/<file>`; unpublished recordings' audio never reaches the site. Files ≤ 25 MiB are served unchanged (128 kbps, 44.1 kHz). **Known limitation:** files > 25 MiB (Cloudflare Pages' per-file limit) are re-encoded at build time to mono 64 kbps; recordings longer than ≈ 52 min cannot be published unsplit ([ADR 0045](adr/0045-long-audio-recompressed-at-build.md)).
- **RT-22. Images** are stored in `src/content/media/images/` at no more than ~2400 px on the longest side (the import scripts downscale TIFF scans; the admin limits upload size). Astro generates responsive WebP sizes and intrinsic dimensions at build time. TIFF masters (11–342 MB) are **not** stored in the repository.
- **RT-23. Upload limits in the admin** (RF-67): images ≤ 10 MB, audio ≤ 95 MB (under GitHub's 100 MB limit), with Spanish messages explaining the limit.
- **RT-24. Videos on YouTube** (Foundation channel), embedded via `youtube-nocookie.com` behind a facade (thumbnail + button) that loads the iframe only on click (RF-31). Duplicates are removed before upload ("America Precolombina" exists 8 times).
- **RT-25. Preservation on Internet Archive.** Masters (TIFF, master audio, video) go to a Foundation collection; the record stores `originalUrl`. In v1 the Foundation (or the developer during the initial import) uploads them outside the CMS.
- **RT-26. File names** are normalized (lowercase, no accents, no spaces), by the import scripts and by Sveltia's slug settings.
- **RT-27. Media live with the content** (`<content folder>/media/`): audio is published at `/audio/…` and images are resolved by Astro, so the site, its media and the future Android app always ship together and no media base URL is needed.

## 6. Admin panel

- **RT-30. Sveltia CMS** served as a static SPA at `/admin` (`public/admin/index.html` + `config.yml`) ([ADR 0028](adr/0028-sveltia-cms.md)).
- **RT-31. Authentication with Sveltia CMS Additions** (free Cloudflare Worker): the editor logs in with a **username and password** created by the administrator; no GitHub account. ([ADR 0029](adr/0029-admin-username-password.md)).
- **RT-32. Uploads into the repository** with Sveltia's default (internal) media library: per-field folders `src/content/media/images/` (images) and `src/content/media/audio/` (audio), with the upload limits of RT-23.
- **RT-33. Spanish UI.** Every field label, hint and message of `config.yml` is in Spanish. Sveltia's own menus follow each browser's language (it has es-ES and es-CO), or the editor's choice in its settings; it cannot be forced from the configuration ([ADR 0055](adr/0055-admin-panel-configuration.md)).
- **RT-34. Relations** use Sveltia `relation` fields that store `id`s, and `reference()` in the Astro schemas.
- **RT-35. Direct publishing** (RF-70). No editorial workflow: every save is a commit on `main` that triggers the pipeline ([ADR 0031](adr/0031-direct-publishing.md)).
- **RT-36. Astro compatibility.** Follow Sveltia's official Astro guide: collection folders match the `glob()` loader `base`; `output.omit_empty_optional_fields: true`; artwork images use Astro's `image()` helper. `tests/content/admin-config.test.ts` checks that the configuration matches the schemas field by field ([ADR 0055](adr/0055-admin-panel-configuration.md)).
- **RT-37. Pending tasks** (RF-72, [ADR 0046](adr/0046-pending-tasks-derived-from-content.md)). `/admin/pendientes/` lists what the Foundation still has to do, **computed from the content at build time** by `src/lib/content/pending-tasks.ts`: rights to confirm, `review` notes, songs without a recording, music recordings without a text, videos not on YouTube, provisional texts, artworks without an inventory code. Each task links to the entry in the admin. There is no separate task list: fixing the content removes the task. The page is not linked from the public site and is marked `noindex`; it shows titles of unpublished entries, which is acceptable because they are not sensitive.

## 7. Routes and URLs

### 7.1 Public routes (Spanish)

| Route | Page |
|---|---|
| `/` | Home |
| `/obras/` | List of works |
| `/sangre-y-sueno/` | Work page; QR target (RF-60) |
| `/sangre-y-sueno/<text-slug>/` | Poem or song |
| `/escuchar/` | All recordings |
| `/galeria/` · `/galeria/<slug>/` | Gallery · image record |
| `/leer/` | All texts |
| `/videos/` · `/videos/<slug>/` | Videos · video record |
| `/marcelo/` | Biography and timeline |
| `/buscar/` | Search |
| `/admin/` | Admin panel (not indexed) |
| `/id/<id>/` | Permanent link (redirect to the current URL) |

Works live at the root (`/<work-slug>/`, [ADR 0038](adr/0038-works-at-root-path.md)); see RT-15 for reserved routes.

### 7.2 Permanent links (RT-12, RF-58)

[ADR 0037](adr/0037-permalink-by-id.md):

- A slug derives from the title and **may change**. When it changes, the old URL stops existing; no slug history is kept.
- **`/id/<id>/`** always leads to the item's current URL. Each build generates one static redirect page per item from current content (`Astro.redirect` in static output writes a `meta refresh` page), so it works on any host and inside the Android app. At deployment (H7) a Cloudflare `_redirects` file can be added for an instant HTTP redirect.
- The record shows the permalink under "how to cite".
- A slug history can be added later without rework if old URLs need preserving.

### 7.3 QR code

- Planned target: `https://marcelodeurioste.org/sangre-y-sueno/?ref=qr` (domain to be confirmed).
- `/sangre-y-sueno/` is a **permanent contract** (RF-61).
- **The QR code is generated only when the developer asks for it.** When that happens: vector format (SVG/PDF) for print, error correction level M or higher.

## 8. PWA, performance, accessibility, i18n, SEO

- **RT-40. PWA** (RF-53, RF-54):
  - manifest with name, icons derived from the logo, and identity colours;
  - Workbox service worker that **precaches** every page and the Pagefind index ([ADR 0052](adr/0052-service-worker-after-the-build.md));
  - images cached on visit (stale-while-revalidate);
  - audio and video **not** cached.
- **RT-41. Performance budget:** < 100 KB of JavaScript on text pages; Lighthouse Performance ≥ 90 on mobile; images with `loading="lazy"`, explicit dimensions and `srcset`.
- **RT-42. Accessibility WCAG 2.2 AA** (RF-56):
  - `alt` mandatory in the `artworks` schema;
  - keyboard-accessible player controls with ARIA;
  - `prefers-reduced-motion` disables animations;
  - visible focus and verified contrast;
  - automated axe checks in E2E tests.
- **RT-43. i18n** (RF-55): UI strings centralized in `src/i18n/es.ts`; no hard-coded UI text in components. Astro i18n routing is enabled when English is added.
- **RT-44. SEO:** sitemap, per-item Open Graph metadata, JSON-LD, `robots.txt` excluding `/admin/` (`src/lib/seo.ts`; absolute addresses from `SITE_URL`, [ADR 0056](adr/0056-deployment-pipeline-and-hosting-files.md)).

## 9. Testing, quality and delivery

### 9.1 Testing strategy ([ADR 0040](adr/0040-testing-strategy.md))

| Level | Tool | Scope | Location |
|---|---|---|---|
| Unit | Vitest | All logic in `src/lib/`: ordering, permalinks, rights filtering, player queue, Dublin Core mapping, slug rules… | `src/lib/**/*.test.ts` |
| Content integrity | Vitest | Runs over the **real** content: every referenced `id` exists, unique IDs and slugs, reserved routes, mandatory `alt`, valid sections | `tests/content/` |
| Component | Vitest + Astro Container API | Each component renders the expected HTML for given fixtures | `src/components/**/*.test.ts` |
| End-to-end | Playwright (Chromium, Firefox, WebKit) + axe | Critical journeys: navigation, player persists across pages, search, offline, QR route, accessibility | `tests/e2e/` |

Rules:

- **RT-50. Isolation.** Tests never use the network or the archive outside the repository. Unit and component tests use their own fixtures (`tests/fixtures/`); E2E tests run against a build made from a fixture content set and fixture media, so results never depend on what the Foundation edits.
- **RT-51. Rights filter.** Entries whose `rights` ≠ `cleared` or whose work is `draft` are excluded from the build; `upcoming` works only show their card. Covered by unit tests.
- **RT-52. Coverage.** ≥ 90 % line and branch coverage for `src/lib/`, enforced in CI. No coverage target for components and pages; they are covered by component and E2E tests.
- **RT-53. Every pull request includes tests** for the behaviour it adds or changes. Test names describe behaviour, not implementation.
- **RT-53a. Requirement traceability.** Each functional requirement is named by at least one test title, or listed with its reason as not checked yet; a test enforces it (`tests/requirements/coverage.test.ts`).
- **RT-53b. Phones and keyboard.** The main journeys also run on phone screens (Android and iPhone emulation), and the site is used with the keyboard alone in Chromium, Firefox and WebKit.

### 9.2 Code quality ([ADR 0042](adr/0042-code-quality-tooling.md))

- **RT-54.** Strict TypeScript; `astro check`; ESLint (typescript-eslint strict, `eslint-plugin-astro`, jsx-a11y rules); Prettier.
- **RT-55.** Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`).
- **RT-56.** One branch and pull request per milestone; `main` is always deployable.

### 9.3 Pipeline (GitHub Actions)

- **RT-57.** On every pull request and every push to `main`:
  1. Install (`npm ci`), then `astro check`, ESLint and Prettier check.
  2. Unit, content integrity and component tests, with coverage thresholds.
  3. `astro build` (including permalink pages) + Pagefind index.
  4. E2E tests in Chromium, Firefox and WebKit against the fixture build.
  5. Only on `main`, and only if every previous step passed: deploy to Cloudflare Pages.

  If any step fails, nothing is published and the previous site stays online (RF-71). Branch protection on `main` requires the pipeline to pass. The steps that need the Foundation's accounts are in [docs/deployment.md](deployment.md).

### 9.4 Environments

- **RT-58.** **Local:** `npm run dev`. **Prototype:** `*.pages.dev`. **Production:** the Foundation's domain. Media always ship with the site (RT-27).

## 10. Initial content import (RF-59)

TypeScript scripts in `scripts/import/`, run once locally with `npx tsx scripts/import/<name>.ts` ([ADR 0047](adr/0047-initial-import.md)). Pure logic lives in `scripts/lib/` and is unit-tested in `tests/scripts/`; the scripts only do I/O. Each script reads a **reviewable manifest** in `scripts/import/data/`, reads the archive from `ARCHIVE_DIR` (default `../Archivos Digitales`), and **never overwrites an existing entry** unless run with `--force`, so editors' changes are safe.

1. **Texts** (`texts.ts`, `tomo-i.yml`). Ghostscript `txtwrite -dTextFormat=1` gives every line with its position, font and size. A bold 14–16 pt line starts a text; a vertical gap larger than the 15 pt line spacing starts a stanza; 9 pt lines are page numbers, dedications or printed notes. Result: 69 songs (pp. 11–98) and 48 poetic tales (pp. 103–239) with `provisional: true`, `edition` (with page) and spaced `order` values. Obvious misprints in titles are corrected, keeping the printed form in `altTitles`. A text's id is its title's slug, with `-cancion` / `-poema` appended when a work already uses it.
2. **Recordings** (`recordings.ts`, `recordings.yml`). One manifest item per source file, with its text links, collection, date, rights and `review`. Audio is copied (audio-only MP4s are converted to MP3) into `src/content/media/audio/`; durations come from `ffprobe`. Items marked `primary` set the text's `primaryRecording` when the text has none.
3. **Images** (`artworks.ts`, `artworks.yml`). Each scan is converted with `sharp` to a ≤ 2400 px WebP in `src/content/media/images/`. Titles, descriptions (`alt`), inscriptions, sheets/panels and proposed text links come from a visual review of each scan; proposed links carry a `review` to confirm.
4. **Videos** (`videos.ts`, `videos.yml`). Records only, with durations from `ffprobe`; all start as `pending` until rights are confirmed and the YouTube id is added.

The result of the first import (2026-11-24): 117 texts, 83 recordings (≈ 442 MB of audio), 53 artworks (≈ 16 MB of WebP), 9 videos.

## 11. Accounts and ownership

| Service | Owner |
|---|---|
| GitHub repository | Developer (for now) |
| Cloudflare (domain, Pages, Workers) | Foundation (Foundation email); developer invited as administrator |
| YouTube | Foundation |
| Internet Archive | Foundation |
| GoatCounter | Foundation |

Credentials and secrets (Cloudflare API token, Additions Worker secrets) live in GitHub Actions secrets and Cloudflare settings, **never** in the repository.

## 12. Estimated costs

| Item | Cost |
|---|---|
| `.org` domain at Cloudflare Registrar | ≈ 10–15 USD/year |
| Cloudflare Pages, Workers | 0 (no payment card registered) |
| GitHub, GitHub Actions (public repository) | 0 |
| YouTube, Internet Archive, GoatCounter | 0 |

## 13. Android app (future)

- **RT-60.** The **same Astro project**, built with a work filter (`BUILD_WORK=sangre-y-sueno`) that includes only that work and its related items, packaged with **Capacitor** as an Android app ([ADR 0018](adr/0018-astro-pwa-capacitor.md)).
- **RT-61.** Texts, records and images ship **inside** the app for offline use. Audio ships with the app too (≈ 400 MB); whether to bundle it or stream it from the website is decided then.
- **RT-62.** To keep that door open, v1 avoids server-only APIs: no server functions in the public site; paths relative to a configurable base. `/id/<id>/` links are static redirect pages, so they also work inside the app.

## 14. Open technical checks

- Repository size after the full import stays well under 1 GB (RT-20).
- `transition:persist` keeps audio playing without gaps on iOS Safari (covered by the WebKit E2E run).
- `marcelodeurioste.org` is available.
