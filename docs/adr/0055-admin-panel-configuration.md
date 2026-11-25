# 0055. Admin panel: a static Sveltia configuration checked against the schemas

- **Status:** Accepted; implements [0028](0028-sveltia-cms.md) and [0029](0029-admin-username-password.md)
- **Date:** 2026-11-24
- **Requirements:** RF-65 to RF-71, RT-30 to RT-36

## Context

The Foundation edits the archive in Sveltia CMS. What the admin lets an editor save must be what the site accepts: the Zod schemas of `src/lib/content/schemas.ts` validate every build, and a build that fails publishes nothing (RF-71).

Facts verified on 2026-11-24 in Sveltia's documentation and source:
- **Configuration:** `public/admin/index.html` and `public/admin/config.yml`, as in Sveltia's Astro guide, which advises against loading the CMS from an Astro page.
- **Language:** Sveltia has Spanish UIs (es-ES, es-CO). It follows each browser's language or the user's setting. A `locale` option is ignored.
- **Login:** username and password without a GitHub account comes from **Sveltia CMS Additions**, MIT, a Cloudflare Worker on the free plan registered as a GitHub App. The administrator adds people with a temporary password, which they change on first sign-in, and the Worker makes the commits. Additions 1.0 was released on 2026-11-22. Sveltia supports it (`auth_type: additions`) since 0.271.0, released 2026-11-23.

## Decision

- **A static `config.yml`** with Spanish labels and hints. Its collections are the content collections, with the same names, so the pending tasks' links open the right entry. File collections hold the biography and the timeline; the timeline is a list at the file's root (`root: true`).
- **Ids never change.** New entries get a lowercase ASCII file name from their title (`slug.encoding: ascii`, `clean_accents`). The file name can be chosen only when creating (`editable: [create]`), because it is the entry's permanent id (RT-11).
- **Media.** Each image and audio field has its own folder, relative to its collection: images in `src/content/media/images/` (stored as `../media/images/<file>`, which Astro's `image()` resolves), audio in `src/content/media/audio/`. The upload limits are 10 MiB for images and 95 MiB for audio (RT-23).
- **`tests/content/admin-config.test.ts`** compares the configuration with the schemas:
  - the same fields at every depth;
  - the same required fields;
  - the same select values;
  - number and checkbox types;
  - relations to existing collections;
  - the same accepted and refused dates and ids;
  - the folders the site reads.
- **Pinned version.** Sveltia 0.262.1 (2026-11-08). Login with Additions needs 0.271.0 or later: the version is raised together with `auth_type: additions` and `base_url` when the Worker is deployed (H7).
- **Trying it out before H7.** At `localhost`, "Work with Local Repository" in a Chromium browser edits the working copy (no commits by default).

## Consequences

- A schema change that the admin does not follow fails the tests, not the editor.
- Sveltia itself validates the configuration when it loads. Loading the page once after a change is part of changing it; CONTRIBUTING explains how. The first try caught a global `public_folder` that must be absolute.
- **To verify by hand before H7**, since Sveltia's documentation does not say it:
  - the value Sveltia stores for an uploaded audio file. The schema expects the bare file name;
  - the value it stores for a relation into the works' sections.
- **Risk:** the login depends on releases two days old. Their maturity is checked again in H7, before the Foundation depends on them.

## Rejected alternatives

- **Generating the configuration from the schemas:** it would still need every label, hint and widget written by hand, and Sveltia's guide recommends a static file. A test that compares the two gives the same guarantee with less machinery.
- **Self-hosting the Sveltia script:** it loads its fonts and translations from CDNs anyway. A pinned CDN URL is what its documentation shows.
