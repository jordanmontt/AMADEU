# 0044. Images and audio live in this repository (no payment card)

- **Status:** Accepted; supersedes the R2 parts of [0009](0009-heavy-media-outside-github.md), [0019](0019-cloudflare-pages-and-domain.md), [0028](0028-sveltia-cms.md) and [0029](0029-admin-username-password.md), and replaces [0030](0030-image-optimization-on-upload.md)
- **Date:** 2026-11-24
- **Requirements:** RF-65 to RF-67, RT-20 to RT-27

## Context

Cloudflare R2 requires a payment method on file, even for its free tier, and the project will not register any payment card. At the same time, the Foundation's editor must be **fully independent**: they must be able to add and replace images **and audio** from the admin panel without the developer.

Facts that shaped the decision (checked 2026-11-24):

- Sveltia CMS uploads media without a third-party service only into the repository it edits.
- Astro can optimize images (WebP, several sizes, intrinsic dimensions) only when they are files available at build time.
- Size: all audio in the digitized archive is ≈ 400 MB and grows little (almost everything is already digitized); web images are ≈ 50–150 MB. GitHub recommends repositories under 1 GB and blocks files over 100 MB.
- Cloudflare Pages (free, no card, no bandwidth limit) rejects files over 25 MiB; ~8 long recordings exceed it (see [0045](0045-long-audio-recompressed-at-build.md)).

## Decision

**Everything lives in this repository:** code, content files, images and audio.

- **Images** are uploaded from the admin into the repository and optimized by Astro at build time (WebP, responsive sizes, width and height).
- **Audio** is uploaded from the admin into the repository and published as static files by Cloudflare Pages.
- **Videos** stay on YouTube and **preservation masters** on Internet Archive (unchanged).
- No service in the project needs a payment card. The Cloudflare account only uses Pages (and the Worker for the admin login).

## Consequences

- The editor adds and replaces images and audio alone, from the same form as the record.
- One repository, one pipeline, no external media service: fewer moving parts.
- Image optimization no longer depends on Sveltia's transformations (the open check in RT-23 disappears).
- **Cost: a heavier repository.** Expect ≈ 500 MB after the full import. Cloning takes longer, and every replaced file stays in Git history. Mitigations:
  - CI and the admin reject files over GitHub's limits; long audio is handled by [0045](0045-long-audio-recompressed-at-build.md).
  - Monitor repository size (`git count-objects -vH`); act before 1 GB.
- **Migration path if the repository grows too large:** move `src/content/` and its media to a separate content repository (option B below). The site already reads content from `CONTENT_DIR`, so no site code changes; only the pipeline does (checkout of both repositories and a cross-repository trigger).
- If the Foundation later accepts a payment card, media can move to R2 again; content would then store URLs instead of repository paths.

## Rejected alternatives

- **(B) Two repositories: code (`AMADEU`) and content (`amadeu-content`, with texts, images and audio).** Keeps the code repository light and lets the Foundation own its content repository. Rejected for now because it adds a cross-repository trigger (a token between repositories) and two checkouts for local development; it remains the migration path above.
- **(C) Content in this repository, media on Cloudinary** (free plan, no card, supported by Sveltia). Rejected because its 25 monthly credits are shared between storage and visitors' bandwidth, so listening traffic could exhaust it.
- **A separate media repository edited only by the developer.** Rejected because the Foundation could not upload audio on its own.
- **Cloudflare R2.** Requires a payment method.
- **Backblaze B2.** Requires a payment method to make a bucket public.
