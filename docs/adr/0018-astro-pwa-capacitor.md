# 0018. Astro + PWA; Android from the same project via Capacitor

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RT-03, RT-60 to RT-62

## Context

The site must be static, light and maintainable, and the code should be reusable for Android.

## Decision

**Astro** with static output, TypeScript and a PWA. Android will reuse the same project, built with a work filter and packaged with **Capacitor** (Astro itself does not compile to Android; Capacitor wraps the built site in a native app).

## Consequences

Near-zero JavaScript, typed content collections, one codebase for web and Android.

## Rejected alternatives

Next.js (heavier, server-oriented); native Kotlin/Flutter app (second codebase); TWA (needs a connection and would show the whole site).
