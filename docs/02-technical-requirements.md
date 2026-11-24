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
- Audio and web images on **Cloudflare R2**; video on **YouTube**; preservation masters on **Internet Archive**.
- **GitHub Actions** validate, test, build and deploy on every change.
- **GoatCounter** for cookie-free analytics.

## 3. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Astro 7** (`output: 'static'`) | Content collections with Zod schemas; islands only where needed. |
| Language | **TypeScript 6.0.x**, strict | Pinned to the 6.0 line: required by `@astrojs/check` and `typescript-eslint` ([ADR 0042](adr/0042-code-quality-tooling.md)). |
| Runtime | **Node 24 LTS** | Pinned in `.nvmrc` and `engines`. |
| Interactivity | TypeScript, no UI framework (Web Components / plain modules) | The player and animations do not need React. Re-evaluate (e.g. Preact) only if a component justifies it. |
| Persistent navigation | Astro View Transitions (`<ClientRouter />`) + `transition:persist` | Keeps the player alive across pages (RF-47). |
| PWA | `@vite-pwa/astro` (Workbox) | Manifest, install, offline cache (RF-53, RF-54). |
| Search | **Pagefind** | Static index built after `astro build` (RF-35). |
| Image viewer | PhotoSwipe (MIT) or an equivalent light library | Zoom and pan (RF-27). |
| Animations | SVG + CSS / Web Animations API | No heavy libraries (RF-50). |
| Image processing | `sharp` (bundles libvips) | Import scripts and CI; no system install. |
| CMS | **Sveltia CMS** + **Sveltia CMS Additions** | See §6. |
| Hosting | **Cloudflare Pages** | Free plan. |
| Media | **Cloudflare R2** | See §5. |
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
  - Entries created in the admin get an auto-generated short ID.
  - The initial import uses readable prefixed IDs, e.g. `sys-t-0012` for a *Sangre y Sueño* text.
- **RT-12. Slug separate from ID.** The URL slug derives from the title and may change. The stable link is `/id/<id>/` (§7.2).
- **RT-13. Explicit order.** Sections and texts have an editable `order` field; nothing is sorted alphabetically by default.
- **RT-14. English names.** Fields and folders are in English; admin labels are in Spanish ([ADR 0039](adr/0039-language-split.md)).
- **RT-15. Reserved routes.** Work slugs must not equal a reserved route: `obras`, `escuchar`, `galeria`, `leer`, `videos`, `marcelo`, `buscar`, `admin`, `id` ([ADR 0038](adr/0038-works-at-root-path.md)). Enforced by the content integrity tests.

### 4.2 Collections

```
src/content/
├── works/        work (YAML)        — Sangre y Sueño, "coming soon" works
├── texts/        text (Markdown)    — poems and songs; the body is the text
├── recordings/   recording (YAML)   — audio in R2
├── artworks/     image (YAML)       — drawings, watercolours, paintings, photos, documents; image in R2
├── videos/       video (YAML)       — YouTube
├── people/       person (YAML)      — credits (musicians, engineers, editors)
└── pages/        page (Markdown)    — biography, presentation, site credits
src/data/
└── timeline.yml  biography timeline
```

Main fields. `ref(x)` is a reference by `id` to collection `x`; `[]` is a list.

**`works`**: `id`, `title`, `subtitle`, `slug`, `status` (`published` | `upcoming` | `draft`), `year`, `description`, `cover` (ref artworks), `sections[]` (`{ id, title, slug, order, description }`), `order`.

**`texts`**:
- Identity: `id`, `title`, `altTitles[]` (`{ title, source }`), `slug`.
- Placement: `work` (ref works), `section` (section id within the work), `order`.
- Content: `kind` (`poem` | `song`), Markdown body (the text), `criticalNotes` (optional Markdown), `facsimile[]` (ref artworks).
- Source: `edition` (`{ name, year, publisher, pages }`), `provisional` (boolean).
- Related media: `primaryRecording` (ref recordings), `illustrations[]` (ref artworks).
- Rights: `rights`, `rightsHolder`, `license`.

**`recordings`**:
- Identity: `id`, `title`, `altTitles[]`, `texts[]` (ref texts; may be empty, e.g. an interview).
- Kind: `kind` (`song` | `recital` | `reading` | `interview` | `lecture` | `instrumental`).
- Date and provenance: `date`, `collection` (e.g. "LP Discolandia 1984", "Grabación casera 1993–95", "Recital Goethe-Institut 1981"), `venue`.
- Credits: `performers[]`, `credits[]` (`{ person: ref people, role }`).
- Audio: `durationSeconds`, `audioUrl` (R2), `originalUrl` (Internet Archive).
- Other: `trackNumber`, `notes`, `rights`, `rightsHolder`, `license`.

**`artworks`**:
- Identity: `id`, `inventoryCode` (e.g. `ADLC-01`), `title`, `inscription` (handwritten verses).
- Description: `kind` (`drawing` | `watercolor` | `painting` | `photo` | `document` | `poster`), `technique`, `dimensions`, `date`, `place`, `series`.
- Sheets and panels: `sheet` (ref artworks: the sheet a panel belongs to), `panels[]` (ref artworks).
- Relations: `texts[]` (ref texts it illustrates).
- Image: `imageUrl` (WebP in R2), `width`, `height`, `originalUrl` (Internet Archive), `sourceFile` (file name in the digitized archive).
- Other: `rating` (1–3, from the inventory), `animated` (boolean), `rights`, `rightsHolder`, `license`, `alt` (alternative text, **mandatory**).

**`videos`**:
- Identity: `id`, `title`, `series` (e.g. "Los Caminos del Hombre"), `episode`.
- Data: `date`, `durationSeconds`, `description`, `credits[]`.
- Media: `youtubeId`, `thumbnailUrl`, `originalUrl` (Internet Archive), `texts[]` (for future poem video clips).
- Rights: `rights`, `rightsHolder`, `license`.

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

- **RT-20. GitHub holds only code and text.** GitHub blocks files over 100 MB and recommends repositories under 1 GB; Cloudflare Pages rejects files over 25 MiB, and recitals reach ~45 MB ([ADR 0009](adr/0009-heavy-media-outside-github.md)).
- **RT-21. Audio on R2.** MP3s are served as they are (128 kbps, 44.1 kHz), without re-encoding. The whole archive's audio is ~400 MB, well within the 10 GB free tier, and R2 has no egress fees.
- **RT-22. Images on R2.** A web version as **~2400 px WebP** (longest side), plus thumbnails. TIFF masters (11–342 MB) are **not** published.
- **RT-23. Optimization on upload** (RF-67). Sveltia should convert the image in the browser to ~2400 px WebP before sending it to R2. **To verify:** that this transformation works with R2 storage. If not, a GitHub Action converts new unoptimized images in R2 with `sharp`.
- **RT-24. Videos on YouTube** (Foundation channel), embedded via `youtube-nocookie.com` behind a facade (thumbnail + button) that loads the iframe only on click (RF-31). Duplicates are removed before upload ("America Precolombina" exists 8 times).
- **RT-25. Preservation on Internet Archive.** Masters (TIFF, master audio, video) go to a Foundation collection; the record stores `originalUrl`. In v1 the Foundation (or the developer during the initial import) uploads them outside the CMS.
- **RT-26. R2 layout.** Bucket `amadeu-media` with prefixes `audio/`, `images/`, `thumbs/`. File names are normalized (lowercase, no accents, no spaces).
- **RT-27. Media base URL.** Content stores media paths relative to a base URL given by `PUBLIC_MEDIA_BASE_URL`:
  - **Local development:** a git-ignored `media/` folder served locally.
  - **Prototype:** the R2 `r2.dev` URL (rate-limited; testing only).
  - **Production:** a custom subdomain such as `media.marcelodeurioste.org`.

  Switching environments never touches content.

## 6. Admin panel

- **RT-30. Sveltia CMS** served as a static SPA at `/admin` (`public/admin/index.html` + `config.yml`) ([ADR 0028](adr/0028-sveltia-cms.md)).
- **RT-31. Authentication with Sveltia CMS Additions** (free Cloudflare Worker): the editor logs in with a **username and password** created by the administrator; no GitHub account. The administrator configures the R2 credentials once; the editor never sees them ([ADR 0029](adr/0029-admin-username-password.md)).
- **RT-32. Direct upload to R2** via `media_libraries.cloudflare_r2`, with an R2 token scoped to the bucket (object read/write only) and a CORS policy allowing `GET`, `PUT`, `DELETE`, `HEAD` from the site origin, exposing `ETag`.
- **RT-33. Spanish UI** (`es`). Every field label, hint and message is in Spanish.
- **RT-34. Relations** use Sveltia `relation` fields that store `id`s, and `reference()` in the Astro schemas.
- **RT-35. Direct publishing** (RF-70). No editorial workflow: every save is a commit on `main` that triggers the pipeline ([ADR 0031](adr/0031-direct-publishing.md)).
- **RT-36. Astro compatibility.** Follow Sveltia's official Astro guide: collection folders match the `glob()` loader `base`; `omit_empty_optional_fields: true`; R2 URLs validated as strings, not with `image()`.

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
- **`/id/<id>/`** always leads to the item's current URL. Each build regenerates Cloudflare Pages `_redirects` from current content, one line per item (`/id/<id>/ → current URL`, status 302).
- The record shows the permalink under "how to cite".
- A slug history can be added later without rework if old URLs need preserving.

### 7.3 QR code

- Planned target: `https://marcelodeurioste.org/sangre-y-sueno/?ref=qr` (domain to be confirmed).
- `/sangre-y-sueno/` is a **permanent contract** (RF-61).
- **The QR code is generated only when the developer asks for it.** When that happens: vector format (SVG/PDF) for print, error correction level M or higher.

## 8. PWA, performance, accessibility, i18n, SEO

- **RT-40. PWA** (RF-53, RF-54):
  - manifest with name, icons derived from the logo, and identity colours;
  - Workbox service worker that **precaches** the shell, text pages and the Pagefind index;
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
- **RT-44. SEO:** sitemap, per-item Open Graph metadata, JSON-LD, `robots.txt` excluding `/admin/`.

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

### 9.2 Code quality ([ADR 0042](adr/0042-code-quality-tooling.md))

- **RT-54.** Strict TypeScript; `astro check`; ESLint (typescript-eslint strict, `eslint-plugin-astro`, jsx-a11y rules); Prettier.
- **RT-55.** Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`).
- **RT-56.** One branch and pull request per milestone; `main` is always deployable.

### 9.3 Pipeline (GitHub Actions)

- **RT-57.** On every pull request and every push to `main`:
  1. Install (`npm ci`), then `astro check`, ESLint and Prettier check.
  2. Unit, content integrity and component tests, with coverage thresholds.
  3. `astro build` + Pagefind index + `_redirects` for permalinks.
  4. E2E tests in Chromium, Firefox and WebKit against the fixture build.
  5. Only on `main`, and only if every previous step passed: deploy to Cloudflare Pages.

  If any step fails, nothing is published and the previous site stays online (RF-71). Branch protection on `main` requires the pipeline to pass.

### 9.4 Environments

- **RT-58.** **Local:** `npm run dev` with `media/` served locally. **Prototype:** `*.pages.dev` + `r2.dev`. **Production:** the Foundation's domain + `media.` subdomain on R2. Media URLs depend only on `PUBLIC_MEDIA_BASE_URL` (RT-27).

## 10. Initial content import (RF-59)

TypeScript scripts in `scripts/import/`, run once locally (`tsx`). Each script's pure logic (parsing, matching, normalization) lives in `src/lib/` or `scripts/lib/` and is unit-tested; the scripts themselves only do I/O.

1. **Texts.** Extract text from the Tomo I PDF (pp. 11–98 songbook; pp. 103–239 poetic tales) with Ghostscript `txtwrite`, segment by poem, and generate `texts/*.md` with `provisional: true`, `edition` and `altTitles`.
2. **Recordings.** Read the MP3s, get durations with `ffprobe`, normalize names, copy to `media/audio/` (later synced to R2), and generate `recordings/*.yml`. Link to texts by fuzzy title matching, then review by hand.
3. **Images.** Convert TIFFs to ~2400 px WebP and thumbnails with `sharp`, copy to `media/images/` and `media/thumbs/`, and generate `artworks/*.yml` with `sourceFile`. Inventory codes and text relations are completed by hand or by the Foundation.
4. **Videos.** Generate `videos/*.yml` from the inventory; `youtubeId` is filled in after uploading.

Scripts read the digitized archive from a configurable path outside the repository (`ARCHIVE_DIR`) and **never** commit media.

## 11. Accounts and ownership

| Service | Owner |
|---|---|
| GitHub repository | Developer (for now) |
| Cloudflare (domain, Pages, R2, Workers) | Foundation (Foundation email); developer invited as administrator |
| YouTube | Foundation |
| Internet Archive | Foundation |
| GoatCounter | Foundation |

Credentials and secrets (R2 tokens, Cloudflare API token, Additions Worker secrets) live in GitHub Actions secrets and Cloudflare settings, **never** in the repository.

## 12. Estimated costs

| Item | Cost |
|---|---|
| `.org` domain at Cloudflare Registrar | ≈ 10–15 USD/year |
| Cloudflare Pages, Workers, R2 (≤ 10 GB) | 0 (R2 requires a payment method on file) |
| GitHub, GitHub Actions (public repository) | 0 |
| YouTube, Internet Archive, GoatCounter | 0 |
| R2 beyond 10 GB | 0.015 USD/GB-month |

## 13. Android app (future)

- **RT-60.** The **same Astro project**, built with a work filter (`BUILD_WORK=sangre-y-sueno`) that includes only that work and its related items, packaged with **Capacitor** as an Android app ([ADR 0018](adr/0018-astro-pwa-capacitor.md)).
- **RT-61.** Texts, records and images ship **inside** the app for offline use. Audio is still served from R2; offline audio is evaluated then.
- **RT-62.** To keep that door open, v1 avoids server-only APIs: no server functions in the public site; paths relative to a configurable base. `/id/<id>/` links rely on Cloudflare `_redirects`; inside the app they are resolved by the app itself.

## 14. Open technical checks

- Sveltia image transformation works with R2 storage (RT-23).
- Sveltia CMS Additions works with shared R2 credentials.
- `transition:persist` keeps audio playing without gaps on iOS Safari (covered by the WebKit E2E run).
- `marcelodeurioste.org` is available.
