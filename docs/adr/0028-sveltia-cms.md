# 0028. Sveltia CMS as the admin panel

- **Status:** Accepted; media upload to R2 is superseded by [0044](0044-media-in-the-repository.md) (uploads go to the repository)
- **Date:** 2026-11-24
- **Requirements:** RT-30 to RT-36

## Context

The Git-based CMS must be free, available in Spanish and **upload media directly to R2**.

## Decision

**Sveltia CMS** at `/admin`, using its native Cloudflare R2 media storage. Uploads go from the browser to R2 without passing through GitHub or Pages limits.

## Consequences

Free (MIT), very active, Spanish UI, official Astro guide, relation fields. The only free option with native R2 support.

## Rejected alternatives

Decap CMS (R2 only on a paid plan or via a custom widget); Pages CMS (media in the repository only); TinaCMS and Keystatic (need a server or paid plan).
