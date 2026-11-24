# 0017. Per-item rights status; only cleared items are published

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RF-57, RT-51

## Context

Some material belongs to third parties (TVB, Discolandia, Pro-Audio, Radio Cristal, Montgomery County, Plural).

## Decision

Each item has `rights` (`cleared` / `pending` / `restricted`). The build excludes everything that is not `cleared`. The Foundation handles permissions in parallel.

## Consequences

Avoids legal problems without blocking the launch.

## Rejected alternatives

Wait until everything is cleared.
