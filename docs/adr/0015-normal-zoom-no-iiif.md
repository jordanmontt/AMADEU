# 0015. Normal zoom in the gallery; deep zoom (IIIF) later

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RF-27

## Context

Deep zoom was first requested for v1, then dropped because the gallery only holds drawings for now.

## Decision

v1 shows ~2400 px WebP images with zoom and pan. IIIF tiled deep zoom is deferred.

## Consequences

Less storage and no extra processing step when uploading.

## Rejected alternatives

Static IIIF with libvips and OpenSeadragon from v1.
