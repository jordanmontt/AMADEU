# 0051. Drawing animations from raster layers cut from the scan

- **Status:** Accepted; supersedes the vectorization part of [0004](0004-handcrafted-svg-animations.md); refined by [0054](0054-animations-on-watercolour.md) (handwriting layer, washes, windows)
- **Date:** 2026-11-24
- **Requirements:** RF-50 to RF-52, RT-03, RT-41

## Context

[ADR 0004](0004-handcrafted-svg-animations.md) planned to vectorize the drawings with Potrace and split them into SVG layers. Installing Potrace on the developer's machine was not possible, and it would be one more tool for whoever maintains the site. The scans are already stored at up to 2400 px, enough for the sizes the site shows, and `sharp` is already a dependency.

## Decision

- **Description as data.** Each animated drawing is described in `src/lib/animations/` as plain data, with coordinates in pixels of the stored scan:
  - its **moving parts**: an outline, a pivot and a motion (`strum`, `sway` or `drift`) with the length of one cycle;
  - **repairs**: ink drawn where a part uncovers the paper when it moves, for example the guitar strings under the hand;
  - **writing bands**: the handwritten lines.
  `src/lib/animations/registry.ts` lists every animated drawing.
- **Layers cut with sharp.** `scripts/animations/build.ts` cuts the layers from the scan into `src/assets/animations/<artwork id>/`. The background has the parts painted out in paper white and the repairs drawn, clipped to the outlines. Each part is a layer with transparency. Every layer has the size of the scan, so they stack without offsets, and Astro produces responsive sizes of each.
- **Motion in CSS.** `AnimatedDrawing.astro` stacks the layers inside the green frame. The `<animated-drawing>` element only sets attributes:
  - `data-playing` while the player sounds (`amadeu:player-change`, [ADR 0049](0049-persistent-player-implementation.md)). The hand strums, the feather sways and the clouds drift.
  - `data-writing` the first time the drawing is seen and loaded. White covers over each handwritten line slide away from left to right, as if being written. This is the "self-drawing stroke" of RF-50.
- **Reduce motion.** Every movement lives in CSS under `prefers-reduced-motion: no-preference`. With "reduce motion" nothing moves and nothing is covered (RF-52). Without JavaScript nothing is covered either: the covers depend on `scripting: enabled`.
- **Where.** The animated version appears where the drawing is shown large: its song page and its gallery record (`FramedArtwork animate`). Thumbnails stay still.

## Consequences

- No new tools. The layers are re-cut with one command when a description or a scan changes. A content test checks that the committed layers exist and match the scan's size. When the Foundation replaces the scan with one of another size, that test fails until the outlines are traced again.
- Line quality is the scan's, as on the rest of the site. The lines are not infinitely sharp as vectors would be.
- Weight of "Alcalde de la canción": background 178 KB and four parts of 5–11 KB, before Astro resizes them.
- Tracing outlines is manual: a grid drawn over the scan gives the pixel coordinates. It is documented in CONTRIBUTING.
- The rest of ADR 0004 stands: handcrafted animations of two or three drawings, no paid tools, no generated video.

## Rejected alternatives

- **Potrace (as in ADR 0004):** a system tool to install, and its output is filled outlines rather than strokes, so even vectors would not "draw themselves" as real strokes.
- **The npm port of Potrace:** GPL-2.0 and little maintained.
- **An animation library (GSAP, Lottie):** more JavaScript for three motions that CSS covers.
