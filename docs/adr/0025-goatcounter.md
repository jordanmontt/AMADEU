# 0025. Analytics with GoatCounter

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RF-62

## Context

Usage must be measured without cookies, with data that can be shown to funders.

## Decision

**GoatCounter** with a public dashboard. The QR code carries `?ref=qr`.

## Consequences

Free for non-commercial use, open source, cookie-free, and its dashboard can be shared publicly.

## Rejected alternatives

Cloudflare Web Analytics (no public dashboard, 6-month retention); Google Analytics (cookies and consent banner). Accepted risk: GoatCounter is maintained by one person; if it disappears, migrate to Cloudflare Web Analytics.
