# 0002. Organize by work, with cross-cutting media views

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RF-05 to RF-08

## Context

The original proposal organized the app by media type (Listen, Gallery, Read, Sound archive). With more books coming, that hides the relation between a poem, its song and its drawings.

## Decision

The backbone is **work → sections → texts**. Listen, Gallery and Read are cross-cutting filtered views. Videos have their own section because they are not tied to poems.

## Consequences

Everything about a poem lives on one page, and the model scales to future works.

## Rejected alternatives

Media-type-only organization, as in the original proposal.
