# Architecture Decision Records

Each design decision is recorded in a short file with context, decision, consequences and rejected alternatives ([ADR format](https://adr.github.io/)).

- Decisions are **never deleted**. When one changes, write a new ADR and mark the old one as "Superseded by NNNN".
- Numbers are sequential and never reused.
- ADRs are written in English (see [0039](0039-language-split.md)). Requirement IDs (`RF-…`, `RT-…`) point to the [functional](../01-requerimientos-funcionales.md) and [technical](../02-technical-requirements.md) requirements.

| # | Decision | Status |
|---|---|---|
| [0001](0001-v1-scope-sangre-y-sueno.md) | v1 scope: only the Sangre y Sueño universe | Accepted |
| [0002](0002-organize-by-work.md) | Organize by work, with cross-cutting media views | Accepted |
| [0003](0003-transcribed-text-and-facsimile.md) | Transcribed text first, facsimile optional | Accepted |
| [0004](0004-handcrafted-svg-animations.md) | Handcrafted SVG animations of drawings | Accepted |
| [0005](0005-prototype-as-funding-demo.md) | The prototype doubles as a funding demo | Accepted |
| [0006](0006-android-single-book-no-lock.md) | The Android app contains one book and is not locked | Accepted |
| [0007](0007-spanish-only-i18n-ready.md) | Spanish-only UI in v1, ready for English | Accepted |
| [0008](0008-no-database.md) | No database: the repository is the database | Accepted |
| [0009](0009-heavy-media-outside-github.md) | Heavy media outside GitHub: R2, YouTube, Internet Archive | Accepted |
| [0010](0010-editorial-visual-identity.md) | Editorial, archival visual identity | Accepted |
| [0011](0011-persistent-audio-player.md) | Persistent audio player with a queue | Accepted |
| [0012](0012-song-versions.md) | One primary version and other versions per song | Accepted |
| [0013](0013-dublin-core-record.md) | Visible archival record based on Dublin Core | Accepted |
| [0014](0014-client-side-search.md) | Static client-side search (Pagefind) | Accepted |
| [0015](0015-normal-zoom-no-iiif.md) | Normal zoom in the gallery; deep zoom (IIIF) later | Accepted |
| [0016](0016-videos-own-section.md) | Own video section with every available video | Accepted |
| [0017](0017-per-item-rights.md) | Per-item rights status; only cleared items are published | Accepted |
| [0018](0018-astro-pwa-capacitor.md) | Astro + PWA; Android from the same project via Capacitor | Accepted |
| [0019](0019-cloudflare-pages-and-domain.md) | Cloudflare Pages and a Foundation-owned domain | Accepted |
| [0020](0020-foundation-owned-accounts.md) | Accounts owned by the Foundation (except the repository, for now) | Accepted |
| [0021](0021-provisional-text-tomo-i.md) | Provisional text from Tomo I until the canonical text exists | Accepted |
| [0022](0022-permanent-id-and-redirects.md) | Permanent ID, alternative titles, explicit order and redirects | Partially superseded |
| [0023](0023-generic-work-structure.md) | Generic work structure: work → sections → texts | Accepted |
| [0024](0024-automated-initial-import.md) | Automated initial import; the Foundation curates | Accepted |
| [0025](0025-goatcounter.md) | Analytics with GoatCounter | Accepted |
| [0026](0026-accessibility-wcag-aa.md) | Accessibility: WCAG 2.2 AA | Accepted |
| [0027](0027-documentation-language.md) | Documentation in Spanish, code in English | Superseded |
| [0028](0028-sveltia-cms.md) | Sveltia CMS as the admin panel | Accepted |
| [0029](0029-admin-username-password.md) | Admin login with username and password (Sveltia CMS Additions) | Accepted |
| [0030](0030-image-optimization-on-upload.md) | Images optimized on upload; masters on Internet Archive | Accepted |
| [0031](0031-direct-publishing.md) | Direct publishing without approval | Accepted |
| [0032](0032-single-qr-code.md) | A single QR code for the whole book | Accepted |
| [0033](0033-pwa-offline-texts.md) | PWA: texts offline, media online | Accepted |
| [0034](0034-songs-without-recording.md) | Songs without a recording show a note | Accepted |
| [0035](0035-licences.md) | Licences: MIT for code, all rights reserved for content | Accepted |
| [0036](0036-minimal-ci-quality.md) | Minimal automated quality in CI | Superseded |
| [0037](0037-permalink-by-id.md) | Permanent link by ID, no redirect history | Accepted |
| [0038](0038-works-at-root-path.md) | Works live at the root of the URL | Accepted |
| [0039](0039-language-split.md) | Foundation-facing docs in Spanish; everything technical in English | Accepted |
| [0040](0040-testing-strategy.md) | Testing strategy: four levels, isolated and mandatory | Accepted |
| [0041](0041-e2e-browsers.md) | E2E tests in Chromium, Firefox and WebKit | Accepted |
| [0042](0042-code-quality-tooling.md) | Code quality tooling and conventions | Accepted |
| [0043](0043-architecture-documentation.md) | Architecture documented with arc42 and C4 (Mermaid) | Accepted |
