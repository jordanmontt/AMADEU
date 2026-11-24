# 0011. Persistent audio player with a queue

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RF-47 to RF-49, RT-03

## Context

Music is central and listening should not stop when navigating.

## Decision

A fixed mini-player that keeps playing across pages, with a queue and visible lyrics. No line-by-line lyric sync in v1.

## Consequences

Expected behaviour in a music archive; line-by-line sync needs heavy manual work per song.

## Rejected alternatives

One player per page; synchronized lyrics from v1.
