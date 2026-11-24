# 0014. Static client-side search (Pagefind)

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RF-35, RF-36

## Context

Search is needed without a server and should work offline.

## Decision

**Pagefind** builds the index at build time; the PWA precaches the index.

## Consequences

Free, serverless, fast and offline-capable.

## Rejected alternatives

Algolia (external service with limits); a self-hosted search server.
