# 0041. E2E tests in Chromium, Firefox and WebKit

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RT-50

## Context

The persistent audio player is the riskiest feature on iOS Safari, and the developer uses Firefox.

## Decision

Playwright runs the E2E suite in **Chromium, Firefox and WebKit**.

## Consequences

Covers the three browser engines; the suite is small, so the extra CI time is a few minutes on free runners.

## Rejected alternatives

Chromium only; Chromium + WebKit.
