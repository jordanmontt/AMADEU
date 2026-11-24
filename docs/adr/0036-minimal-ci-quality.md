# 0036. Minimal automated quality in CI

- **Status:** Superseded by [0040](0040-testing-strategy.md)
- **Date:** 2026-11-24
- **Requirements:** RF-71, RT-50

## Context

One developer, and a non-technical editor who publishes directly.

## Decision

On every change, an Action validates types and schemas, checks references, builds and checks links before deploying. No heavy test suite.

## Consequences

Protects the site from editor mistakes at low maintenance cost.

## Rejected alternatives

No validation; an extensive test suite.
