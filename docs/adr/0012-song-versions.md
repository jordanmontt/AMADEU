# 0012. One primary version and other versions per song

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RF-17

## Context

A song can have several recordings: the 1984 LP, the home recording, a recital.

## Decision

Each text has a `primaryRecording`; other linked recordings appear as "Other versions" with their provenance.

## Consequences

Clear for listeners and rigorous for the archive.

## Rejected alternatives

Only one version; all versions with no hierarchy.
