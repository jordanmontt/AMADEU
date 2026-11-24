# 0006. The Android app contains one book and is not locked

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RF-80 to RF-82, RT-60

## Context

A future Android app is "restricted" to *Sangre y Sueño*. It was unclear whether that meant content unlocked with a code printed in the book.

## Decision

"Restricted" means the app **contains only *Sangre y Sueño***. The website stays public and complete; the app has no lock.

## Consequences

No code or account system is needed, and the website can show everything.

## Rejected alternatives

Unlock the app with a code from the book and hide that content on the website.
