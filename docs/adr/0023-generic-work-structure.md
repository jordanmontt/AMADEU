# 0023. Generic work structure: work → sections → texts

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RF-05, RT §4.2

## Context

The parts and order of the canonical text are not defined yet, and more books will follow.

## Decision

Nothing is hard-coded: sections are an ordered list inside each work, texts have `section` and `order`, and media are separate collections linked by `id`.

## Consequences

The same model fits any book, and the Foundation can reorganize it from the admin.

## Rejected alternatives

Hand-written pages and sections for *Sangre y Sueño*.
