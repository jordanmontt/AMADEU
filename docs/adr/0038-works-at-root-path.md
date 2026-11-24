# 0038. Works live at the root of the URL

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RF-60, RT-15, RT §7.1

## Context

A book page could live right after the domain (`/sangre-y-sueno/`) or under a prefix (`/obras/sangre-y-sueno/`). The `/obras/` listing exists either way.

## Decision

Each work uses its slug at the root: `/<work-slug>/` and `/<work-slug>/<text-slug>/`. Work slugs must not collide with reserved site routes (`obras`, `escuchar`, `galeria`, `leer`, `videos`, `marcelo`, `buscar`, `admin`, `id`); CI enforces it.

## Consequences

Shorter, more memorable URLs that look cleaner in a QR code and on the book cover.

## Rejected alternatives

Works under `/obras/<work-slug>/`: tidier and collision-free, but longer.
