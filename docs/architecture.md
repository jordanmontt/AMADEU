# Architecture

This document follows a reduced [arc42](https://arc42.org) template with [C4](https://c4model.com) diagrams written in Mermaid ([ADR 0043](adr/0043-architecture-documentation.md)). Requirements are in [02-technical-requirements.md](02-technical-requirements.md); the reasons behind each choice are in the [ADRs](adr/README.md).

## 1. Goals and constraints

**Goal:** a public, citable digital archive of Marcelo de Urioste's work. v1 covers *Sangre y Sueño*; more works are added later from an admin panel.

| Constraint | Consequence |
|---|---|
| Near-zero budget | Static site, free tiers only, no own servers or database |
| One developer today, possibly another tomorrow | Few moving parts, strict types, tests at four levels, documented decisions |
| Non-technical editor | Git-based CMS with a form UI; content validated before publishing |
| Heavy media (≈ 6.6 GB) | Media outside Git: R2, YouTube, Internet Archive |
| Future Android app for one book | Same codebase, no server-only features |

**Quality goals, in priority order:** correctness of the archive (nothing unpublished leaks, nothing breaks silently), maintainability by a new engineer, accessibility (WCAG 2.2 AA), performance on low-end phones.

## 2. Context (C4 level 1)

```mermaid
flowchart LR
  reader([Reader / book owner])
  editor([Foundation editor])
  dev([Developer])
  subgraph amadeu[AMADEU]
    site[Public website + PWA]
    admin[Admin panel /admin]
  end
  gh[(GitHub repository)]
  r2[(Cloudflare R2: audio, images)]
  yt[(YouTube: videos)]
  ia[(Internet Archive: masters)]
  gc[GoatCounter: analytics]

  reader -- "reads, listens (QR code in the book)" --> site
  editor -- "edits content" --> admin
  dev -- "code, reviews" --> gh
  admin -- "commits content" --> gh
  admin -- "uploads media" --> r2
  site -- "streams audio, images" --> r2
  site -- "embeds on click" --> yt
  site -- "links masters" --> ia
  site -- "page views" --> gc
```

## 3. Containers (C4 level 2)

```mermaid
flowchart TB
  subgraph github[GitHub]
    repo[(Repository: code + content files)]
    actions[GitHub Actions: check, test, build, deploy]
  end
  subgraph cloudflare[Cloudflare - Foundation account]
    pages[Cloudflare Pages: static site + PWA]
    worker[Worker: Sveltia CMS Additions - editor login]
    r2[(R2 bucket amadeu-media)]
  end
  browser[Reader's browser]
  cms[Sveltia CMS SPA in the editor's browser]

  repo -- push --> actions
  actions -- "deploy dist/" --> pages
  browser -- HTML, JS, CSS --> pages
  browser -- "audio / images" --> r2
  cms -- "login" --> worker
  worker -- "GitHub API (commits)" --> repo
  cms -- "direct upload" --> r2
```

| Container | Technology | Responsibility |
|---|---|---|
| Static site | Astro 7, TypeScript | Pages generated at build time from content files |
| PWA layer | `@vite-pwa/astro` (Workbox) | Install, offline texts and search |
| Admin | Sveltia CMS + Additions Worker | Form-based editing, media upload to R2 |
| Content store | Markdown/YAML in `src/content/` | The archive's data ("the repository is the database") |
| Media store | Cloudflare R2 | Audio, web images, thumbnails |
| Pipeline | GitHub Actions | Quality gate and deployment |

## 4. Components (C4 level 3, the static site)

```mermaid
flowchart TB
  files[(src/content/*: YAML, Markdown)]
  config[src/content.config.ts: Astro collections]
  schemas[src/lib/content/schemas.ts: Zod schemas]
  loader[src/data/catalog.ts: reads astro:content]
  publication[src/lib/content/publication.ts: rights and status filter]
  catalog[src/lib/catalog.ts: Catalog read model]
  routes[src/lib/routes.ts: URLs]
  integrity[src/lib/content/integrity.ts: cross-entry rules]
  pages[src/pages/*: routes]
  components[src/components/*]
  i18n[src/i18n/es.ts: UI strings]

  files --> config
  schemas --> config
  config --> loader
  loader --> publication --> catalog
  catalog --> routes
  pages --> loader
  pages --> catalog
  pages --> components
  components --> routes
  pages --> i18n
  components --> i18n
  files -. "content integrity tests" .-> integrity
```

Rules that keep the code testable and replaceable:

- **`src/lib/` is framework-free.** It never imports `astro:*` modules. It holds all domain logic (publication rules, ordering, relations, URLs, integrity) and is unit-tested with ≥ 90 % coverage.
- **`src/data/catalog.ts` is the only reader of `astro:content`.** It turns collections into plain data and builds the `Catalog`.
- **Pages ask the `Catalog`; they never sort, filter or join collections themselves.**
- **Components receive plain data as props** and render it; they are tested with the Astro Container API.
- **UI text comes from `src/i18n/es.ts`**, never hard-coded.

### 4.1 Content model

```mermaid
erDiagram
  WORK ||--o{ SECTION : "sections[] (ordered)"
  WORK ||--o{ TEXT : "text.work"
  SECTION ||--o{ TEXT : "text.section (ordered)"
  TEXT |o--o| RECORDING : "text.primaryRecording"
  RECORDING }o--o{ TEXT : "recording.texts[]"
  ARTWORK }o--o{ TEXT : "artwork.texts[] (illustrations)"
  TEXT }o--o{ ARTWORK : "text.facsimile[] (ordered pages)"
  ARTWORK }o--o| ARTWORK : "panel.sheet"
  VIDEO }o--o{ TEXT : "video.texts[]"
  RECORDING }o--o{ PERSON : "credits[]"
  VIDEO }o--o{ PERSON : "credits[]"
```

- An entry's **id is its file name** and never changes. Relations store ids.
- **Each relation is stored on one side only:** media point to texts; a panel points to its sheet. The `Catalog` derives the other direction, so the two sides can never disagree.
- Rights (`cleared` / `pending` / `restricted`) live on texts, recordings, artworks and videos.

## 5. Runtime views

### 5.1 Build and publish

```mermaid
sequenceDiagram
  participant E as Editor (Sveltia CMS)
  participant G as GitHub
  participant A as GitHub Actions
  participant P as Cloudflare Pages
  E->>G: commit content change on main
  G->>A: trigger CI
  A->>A: astro check, lint, unit + content integrity + component tests
  A->>A: astro build (publication filter applied), Pagefind index
  A->>A: E2E tests (Chromium, Firefox, WebKit) on the fixture build
  alt every step passed
    A->>P: deploy dist/
  else a step failed
    A-->>E: nothing published, previous site stays online
  end
```

### 5.2 Publication filter

At build time, `publishedCollections()` keeps only entries that may be public (RF-57):

- works that are not `draft` (`upcoming` works only get a card);
- texts with `cleared` rights whose work is `published`;
- recordings, artworks and videos with `cleared` rights.

Relations to filtered-out entries stay in the data; the `Catalog` simply does not find them.

### 5.3 Permanent links

`/id/<id>/` pages are generated from `Catalog.permalinks()` as static redirect pages (`Astro.redirect` in static output produces a `meta refresh` page). This works on any static host and inside the future Android app. On Cloudflare, a `_redirects` file can be added later for an instant HTTP redirect.

## 6. Deployment

| Environment | Site | Media (`PUBLIC_MEDIA_BASE_URL`) | Content |
|---|---|---|---|
| Local | `npm run dev` | git-ignored `media/` folder | `src/content/` |
| E2E | `npm run build:e2e` + `astro preview` | fixture media | `tests/fixtures/content/` |
| Prototype | `*.pages.dev` | R2 `r2.dev` URL | `src/content/` |
| Production | Foundation domain | `media.<domain>` on R2 | `src/content/` |

## 7. Cross-cutting concepts

- **Testing** ([ADR 0040](adr/0040-testing-strategy.md)): unit (`src/lib/**/*.test.ts`), content integrity (`tests/content/`), component (`src/components/**/*.test.ts`), E2E with axe (`tests/e2e/`). Test data comes from builders (`tests/support/builders.ts`) that parse through the real schemas.
- **Accessibility:** baseline rules in `src/styles/base.css` (target size, focus), lint rules (`jsx-a11y`), automated axe checks per page.
- **i18n:** `src/i18n/es.ts`; Astro i18n routing when English is added.
- **Configuration:** environment variables `CONTENT_DIR` and `PUBLIC_MEDIA_BASE_URL` (see `.env.example`).

## 8. Risks and technical debt

| Item | Mitigation |
|---|---|
| iOS Safari may interrupt persistent audio | WebKit E2E run; fallback design in H3 |
| Sveltia image transformation with R2 unverified | Fallback: resize in a GitHub Action (RT-23) |
| GoatCounter is maintained by one person | Migrate to Cloudflare Web Analytics if needed |
| `.astro` imports are untyped for plain TypeScript tooling | Local declaration `src/astro-modules.d.ts` (see CONTRIBUTING); logged upstream |
| Static redirect pages wait ~2 s (Astro default) | Add Cloudflare `_redirects` at deployment (H7) |
