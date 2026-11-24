# 0032. A single QR code for the whole book

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RF-60, RF-61, RT §7.3

## Context

One QR code per song or one for the whole book.

## Decision

One QR code to `/sangre-y-sueno/?ref=qr`. That route is a permanent contract. The QR code is generated only when the developer asks for it.

## Consequences

Simpler for printing and book design; leaves internal routes free to change.

## Rejected alternatives

One QR code per song with a recording.
