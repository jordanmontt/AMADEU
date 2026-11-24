# Glossary

Project terms, one line each. Spanish words in parentheses are what the Foundation and the site use.

- **Archive** (archivo): the whole public website and its content.
- **Work** (obra): a book-level unit such as *Sangre y Sueño*. Has an explicit, permanent slug and an ordered list of sections. Status: `published`, `upcoming` ("próximamente") or `draft`.
- **Section** (sección): an ordered part of a work, e.g. "Relatos poéticos", "Libro de canciones".
- **Text** (texto): a poem or a song's lyrics, placed in a section of a work with an explicit order.
- **Recording** (grabación): an audio file linked to zero or more texts (a song version, a recital, a reading, an interview).
- **Primary recording** (grabación principal): the version of a text shown first; the others are "other versions".
- **Artwork** (imagen / pieza de la galería): a drawing, watercolour, painting, photo, document or poster.
- **Sheet / panel** (hoja / panel): a scanned page with several drawings, and each drawing cut from it. A panel points to its sheet.
- **Illustration** (ilustración): an artwork whose `texts` field points to a text.
- **Facsimile** (facsímil): scanned pages of a printed text, listed in order on the text.
- **Record** (ficha): the visible archival description of an item, based on Dublin Core.
- **Rights status** (estado de derechos): `cleared` (autorizado), `pending` (pendiente) or `restricted` (restringido). Only `cleared` items are published.
- **Publication filter**: the build-time rule that decides what is public (`publishedCollections`).
- **Catalog**: the read model of the published archive (`src/lib/catalog.ts`); pages query it.
- **Entry id**: an entry's file name; permanent, unique across page-bearing collections.
- **Permalink** (enlace permanente): `/id/<id>/`, which always leads to the entry's current URL.
- **Provisional text** (texto provisional): text taken from Tomo I (2012) until the canonical edition exists.
- **Canonical text** (texto canónico): the edited text of the commemorative edition, in preparation.
- **Content integrity**: cross-entry rules (references exist, unique URLs, reserved routes) checked in CI.
- **Fixture content**: the small content set in `tests/fixtures/content/` used by E2E tests.
- **Review** (qué falta revisar): an optional field on texts, recordings, artworks and videos saying what still has to be checked. Listed among the pending tasks until removed.
- **Notes** (notas): permanent archival notes about an item. Never a to-do.
- **Pending tasks** (pendientes): what the Foundation still has to do, computed from the content and shown at `/admin/pendientes/`.
- **Import manifest**: a versioned list in `scripts/import/data/` with every source file and the decisions about it, read by an import script.
