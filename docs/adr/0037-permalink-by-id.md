# 0037. Permanent link by ID, no redirect history

- **Status:** Accepted; supersedes the redirect part of [0022](0022-permanent-id-and-redirects.md)
- **Date:** 2026-11-24
- **Requirements:** RF-40, RF-58, RT-12, RT §7.2

## Context

Decision 0022 planned a slug history (`slug-history.json`) to redirect old URLs when a title changes. Because publishing runs in a throwaway GitHub Action, the history would have to be committed back automatically. The big title changes will happen when the canonical text arrives, probably before the site is widely shared, and the QR code points to the book page, which does not change.

## Decision

No slug history and no automatic commits; when a title changes, the old URL stops working. Every item has a **permanent link `/id/<id>/`** that always leads to its current URL, regenerated on every build as one `_redirects` line per item. The record shows it under "how to cite". The rest of 0022 (immutable ID, alternative titles, explicit order) still applies.

## Consequences

Fewer moving parts, no bot commits, and it covers the important case: stable citation. A slug history can be added later without rework.

## Rejected alternatives

Slug history with automatic commits from the Action (original 0022).
