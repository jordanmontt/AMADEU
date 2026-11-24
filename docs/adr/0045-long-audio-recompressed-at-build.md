# 0045. Audio over 25 MiB is recompressed at build time (known limitation)

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RF-25, RF-67, RT-21

## Context

Cloudflare Pages rejects files over 25 MiB. About 8 recordings in the archive exceed it: recitals of 43–46 minutes and spoken poetry of ~31 minutes (≈ 30–45 MB at 128 kbps). The editor must be able to upload any recording without preparing it by hand ([ADR 0044](0044-media-in-the-repository.md)).

## Decision

- The editor uploads the audio as it is (up to GitHub's 100 MB limit). The repository keeps that file.
- During the build, the pipeline re-encodes **only the published copy** of every audio file larger than 25 MiB to **mono MP3 at 64 kbps** with ffmpeg. Files at or under 25 MiB are published unchanged.
- The build fails if a re-encoded file is still over 25 MiB (≈ 52 minutes at 64 kbps), naming the file, so nothing is published silently broken.

## Consequences

- **Known limitation:** long recordings are published at reduced quality (mono, 64 kbps). For voice and guitar the difference is small, but it is audible on music with several instruments. The full-quality file stays in the repository and, as a master, on Internet Archive; the record links to it.
- **Known limitation:** a single recording longer than ≈ 52 minutes cannot be published; it must be split.
- The build needs ffmpeg (available on GitHub's Ubuntu runners; documented in CONTRIBUTING for local builds).
- Future improvement: split long recitals into one track per song (the inventory lists the Goethe-Institut 1981 recital's tracks), which is better for listening and lets each track link to its lyrics. Requires marking timestamps by hand.

## Rejected alternatives

- Asking the editor to compress long files by hand (breaks the editor's independence).
- Re-encoding the files stored in the repository (loses the uploaded quality).
- Serving audio from GitHub Pages (100 MB per file) instead of Cloudflare Pages: tied to the developer's personal account and with a bandwidth soft limit.
