# 0019. Cloudflare Pages and a Foundation-owned domain

- **Status:** Accepted; the R2 part is superseded by [0044](0044-media-in-the-repository.md)
- **Date:** 2026-11-24
- **Requirements:** RT-52, RT §11

## Context

Free hosting and a permanent domain for the QR code are needed. The Foundation has no domain yet.

## Decision

Cloudflare Pages in the same account as R2. Domain bought at Cloudflare Registrar in the Foundation's name (planned: `marcelodeurioste.org`). The prototype goes to `*.pages.dev` first; the domain is attached later.

## Consequences

One free provider, at-cost domain, ownership with the Foundation.

## Rejected alternatives

Vercel or Netlify (a second provider besides R2); a domain in the developer's name.
