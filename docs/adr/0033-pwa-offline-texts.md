# 0033. PWA: texts offline, media online

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RF-53, RF-54, RT-40

## Context

The PWA could cache everything or only part of the site.

## Decision

Precache the shell, texts, records and search index. Audio and video need a connection.

## Consequences

Reading works without signal without filling the phone's storage.

## Rejected alternatives

Downloadable audio for offline listening (left for Android).
