# 0022. Permanent ID, alternative titles, explicit order and redirects

- **Status:** Accepted; the redirect part is superseded by [0037](0037-permalink-by-id.md)
- **Date:** 2026-11-24
- **Requirements:** RF-58, RT-11 to RT-13, RT §7.2

## Context

The canonical text will change titles and order, so a title cannot be an identity.

## Decision

Each entry has an immutable `id`, used by every relation. The slug derives from the title and may change. `altTitles` keeps previous titles and titles from other sources, and search finds them. `order` is explicit. A slug history generates 301 redirects, and `/id/<id>/` is a permanent citation route.

## Consequences

Editorial changes do not break links or relations.

## Rejected alternatives

Using the title or slug as identity.
