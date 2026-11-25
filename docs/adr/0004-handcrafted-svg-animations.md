# 0004. Handcrafted SVG animations of drawings

- **Status:** Accepted; the vectorization part (Potrace, SVG layers) is superseded by [0051](0051-raster-layer-animations.md)
- **Date:** 2026-11-24
- **Requirements:** RF-50 to RF-52

## Context

Some drawings should come alive (e.g. the man playing guitar). Options: self-drawing strokes, moving parts, or a generated video loop (AI or an animator).

## Decision

v1 animates 2–3 drawings: vectorized (Potrace), split into layers by hand and animated with CSS / Web Animations API, combining self-drawing strokes and moving parts, synchronized with music where it makes sense. The developer builds them, starting with "Alcalde de la canción" (`93.tif`).

## Consequences

Lightweight, faithful to the original line work, no paid tools (After Effects), fully under project control.

## Rejected alternatives

Lottie via After Effects (paid licence); AI-generated video (heavier, less faithful); animating every drawing (not feasible for v1).
