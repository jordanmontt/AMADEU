# 0009. Heavy media outside GitHub: R2, YouTube, Internet Archive

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RT-20 to RT-26

## Context

The archive is about 6.6 GB (3.8 GB video, 2.45 GB TIFF, 400 MB audio). GitHub blocks files over 100 MB and recommends repositories under 1 GB; Cloudflare Pages limits files to 25 MiB.

## Decision

Videos go to **YouTube**. Audio and web images go to **Cloudflare R2** (10 GB free, no egress fees). Preservation masters go to **Internet Archive**. GitHub holds only code and text.

## Consequences

Free or nearly free; YouTube provides adaptive streaming; Internet Archive provides long-term preservation.

## Rejected alternatives

Media in Git or Git LFS (limits and cost); video in R2 (no adaptive streaming, heavier); Google Drive (not suitable for web playback).
