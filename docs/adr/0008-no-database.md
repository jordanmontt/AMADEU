# 0008. No database: the repository is the database

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RT-10

## Context

Structured, editable content is needed at zero cost and with no servers to maintain.

## Decision

Content is Markdown/YAML files in `src/content/`, validated by schemas at build time and edited through a Git-based CMS.

## Consequences

Free change history and backup, no server, and the same content can be reused by the Android app.

## Rejected alternatives

A headless CMS with a database (Directus, Strapi) needs a server; WordPress needs more maintenance and security work.
