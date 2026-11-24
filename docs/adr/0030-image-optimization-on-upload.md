# 0030. Images optimized on upload; masters on Internet Archive

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RF-67, RT-23

## Context

Without IIIF tiles, images only need a good web version.

## Decision

On upload, the admin converts the image to ~2400 px WebP before sending it to R2. TIFF masters are uploaded by the Foundation to Internet Archive and linked from the record. **To verify:** that the transformation works with R2 storage; otherwise a GitHub Action resizes.

## Consequences

Serverless; nothing technical for the editor.

## Rejected alternatives

Asking the editor to prepare images by hand; an Action that generates tiles.
