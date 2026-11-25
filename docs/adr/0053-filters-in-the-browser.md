# 0053. Filters of Escuchar, Galería and Leer run in the browser, kept in the URL

- **Status:** Accepted
- **Date:** 2026-11-24
- **Requirements:** RF-07, RF-24, RF-26, RT-03

## Context

The cross-cutting views must be filterable:
- Escuchar by work, kind, year and source;
- Galería by kind, technique, series, year and work;
- Leer by work and kind.

The site is static, and the lists are short: about a hundred items each.

## Decision

- **All items in the page.** Each page renders every item with its values (`data-filter-values`) and one `<select>` per facet. `<filter-bar>` hides the items that do not match and the groups left empty, and says how many remain. Matching, the facets and the URL format live in `src/lib/filters.ts`. Each view's facets live in `src/lib/view-filters.ts`. Both are unit-tested.
- **Only useful facets.** A facet with fewer than two values is not offered. Today Sangre y Sueño is the only work, so "Obra" appears once a second work is published.
- **The choice is kept in the URL,** in Spanish (`/escuchar/?tipo=lectura&anio=1981`), so a filtered list can be shared and the back button works with client-side navigation.
- **Without JavaScript** the bar stays hidden and the whole list is shown.
- **The zoom viewer (RF-27)** is PhotoSwipe (MIT), loaded on the gallery record when first opened. Its texts are in Spanish. Without JavaScript the link opens the image itself.

## Consequences

- No server, no index to build, and the filtered lists also work offline.
- A page carries all its items. That is fine at this size; with thousands of items the lists would need paging or Pagefind's filters.

## Rejected alternatives

- **One static page per filter combination:** too many pages for little gain.
- **Pagefind filters:** made for search results, not for browsing a whole list.
