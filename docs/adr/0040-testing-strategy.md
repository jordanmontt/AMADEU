# 0040. Testing strategy: four levels, isolated and mandatory

- **Status:** Accepted; supersedes [0036](0036-minimal-ci-quality.md)
- **Date:** 2026-11-24
- **Requirements:** RT-50, RT-53

## Context

The code may be handed over to another engineer, so tests are the main safety net and the executable specification.

## Decision

Four levels: **unit** (Vitest) for all logic in `src/lib/`; **content integrity** over the real content (references exist, unique slugs, reserved routes, mandatory `alt`); **component** tests with the Astro Container API and fixtures; **end-to-end** (Playwright) for critical journeys, with automated accessibility checks (axe). Tests are isolated: no network, own fixtures, no dependency on the archive outside the repository. Every PR includes its tests; CI blocks merging on failure; coverage ≥ 90 % for `src/lib/`.

## Consequences

Makes behaviour explicit, protects against regressions from editors and future developers, and documents intent.

## Rejected alternatives

Minimal CI only (0036); E2E-only testing (slow and imprecise).
