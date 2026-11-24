# 0031. Direct publishing without approval

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RF-70, RF-71, RT-35

## Context

Content could be published on save, or go through draft → review → publish.

## Decision

Saving in the admin publishes directly; CI prevents invalid content from being published.

## Consequences

Simpler for a very small team; Git history allows reverting any change.

## Rejected alternatives

Sveltia's editorial workflow (branches and pull requests).
