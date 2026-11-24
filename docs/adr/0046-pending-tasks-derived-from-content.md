# 0046. The Foundation's pending tasks are derived from the content

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RF-72, RT-37

## Context

The people at the Foundation need to see what is left to do (rights to confirm, recordings to find, doubts to resolve), without depending on the developer. A separate to-do list (a spreadsheet, an issue tracker, a document) would drift from the archive: someone confirms a right in the admin and forgets to tick the list, or the other way round. The developer asked for a single place that holds the truth, validated by code.

## Decision

- The pending tasks are **computed from the content** at build time (`src/lib/content/pending-tasks.ts`) and shown at `/admin/pendientes/`, grouped by kind, each linked to the entry in the admin.
- Every task is a fact about an entry:
  - rights `pending` → "Confirmar derechos";
  - a `review` field → "Revisar", showing its text;
  - a song with no recording at all → "Canciones sin grabación";
  - a music recording linked to no text → "Grabaciones sin canción";
  - a video without `youtubeId` → "Videos sin publicar en YouTube";
  - a `provisional` text → "Textos provisionales";
  - an artwork without `inventoryCode` → "Imágenes sin código de inventario".
- A new field, **`review`** ("Qué falta revisar"), records what an editor still has to check. It is separate from `notes`, which are permanent archival notes. Clearing `review` removes the task.
- The page is not linked from the public site and carries `noindex`. It shows titles of unpublished entries; none of them is sensitive.

## Consequences

- One source of truth: the archive itself. Fixing an entry removes its task at the next publication; nothing to keep in sync.
- New kinds of tasks are added in one function, with unit tests.
- Tasks that are not facts about the content (buying the domain, creating accounts, scanning the 1981 edition) stay in the [inventory document](../inventario/README.md).
- Missing preservation masters (`originalUrl`) are not listed yet, to keep the list focused; they can be added later as another kind.

## Rejected alternatives

- A separate task list (document, spreadsheet, issue tracker): drifts from the content.
- Using `notes` for to-dos: mixes permanent archival information with temporary work, and a note would never leave the list.
