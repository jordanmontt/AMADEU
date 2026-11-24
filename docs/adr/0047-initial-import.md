# 0047. Initial import from reviewable manifests, with initial rights statuses

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RF-57, RF-59, RT §10

## Context

The prototype needs the *Sangre y Sueño* material as structured content: 117 texts in a PDF, 83 audio files with inconsistent names, 53 scans with no titles, and video records. Some decisions in that conversion are judgement calls (which recording belongs to which song, what a drawing shows, which song it illustrates), and every item needs an initial rights status, because only `cleared` items are published.

## Decision

- **Scripts plus manifests.** Each import script (`scripts/import/`) reads a manifest in `scripts/import/data/` that lists every source file and the decisions about it (id, title, links, rights, `review`). The manifests are versioned, so every judgement can be reviewed and corrected in one place. Pure logic is unit-tested.
- **Texts** are split automatically from the PDF's layout (fonts, sizes and line positions), not by hand.
- **Never overwrite editors' work.** A script skips entries that already exist unless run with `--force`.
- **Initial rights statuses**, decided by the developer for the prototype:
  - `cleared`: Marcelo's own work: texts, the 1993–95 home recordings, the 1981 recitals, his readings, his drawings and paintings.
  - `pending`: third-party or uncertain material: audio of unknown provenance (the `TRACK…` files and the audio-only MP4s), the photograph and the 2018 poster, and every video (TVB programmes and the 1996 presentation).
- Doubts found during the import (a recording that may be mislabelled, a song title absent from Tomo I, a proposed drawing-to-song link) are recorded in `review`, so they appear in the Foundation's pending tasks ([ADR 0046](0046-pending-tasks-derived-from-content.md)).

## Consequences

- The prototype shows the songbook with audio and drawings from day one; nothing from third parties is published until the Foundation confirms it.
- The Foundation sees every open question in `/admin/pendientes/` instead of in a report.
- The 1984 Discolandia LP is not in the archive as audio; the songs are published with the home recordings.

## Rejected alternatives

- Everything `cleared`: risks publishing third-party material without permission.
- Everything `pending`: the prototype would be empty.
- Matching recordings and drawings automatically without a manifest: wrong links would be invisible and hard to correct.
