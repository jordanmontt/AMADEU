/**
 * Filters of the cross-cutting views: Escuchar, Galería and Leer (RF-07, RF-24, RF-26).
 *
 * Every item of a list carries its values for each facet (an item may have several, e.g. a
 * recording of two works). The page renders one choice per facet; the browser shows only the
 * items that have every chosen value. The same functions build the choices at build time
 * and match the items in the browser, and the choice is kept in the URL (`?tipo=recital`)
 * so a filtered list can be shared.
 */

/** An item's values, by facet key: `{ tipo: ['song'], obra: ['sys'] }`. */
export type FacetValues = Readonly<Record<string, readonly string[]>>;

/** One value chosen per facet, by facet key; facets left out are not filtered. */
export type Selection = Readonly<Record<string, string>>;

export interface FacetDefinition {
  /** Key in the items' values and in the URL; Spanish, since it shows in the URL. */
  readonly key: string;
  readonly label: string;
  /** How a value is shown; the value itself when left out. */
  readonly labelOf?: (value: string) => string;
  /** Order of the options: by label (default) or by value, e.g. years. */
  readonly sort?: 'label' | 'value';
}

export interface FacetOption {
  readonly value: string;
  readonly label: string;
  readonly count: number;
}

export interface Facet {
  readonly key: string;
  readonly label: string;
  readonly options: readonly FacetOption[];
}

/**
 * The facets worth offering for `items`: each with its values and how many items have them.
 * A facet with fewer than two values filters nothing, so it is left out.
 */
export function facetsOf(
  definitions: readonly FacetDefinition[],
  items: readonly FacetValues[],
): Facet[] {
  return definitions.flatMap((definition) => {
    const counts = new Map<string, number>();
    for (const item of items) {
      for (const value of new Set(item[definition.key] ?? [])) {
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }
    }
    const labelOf = definition.labelOf ?? ((value: string) => value);
    const options = [...counts]
      .map(([value, count]) => ({ value, label: labelOf(value), count }))
      .sort((a, b) =>
        definition.sort === 'value'
          ? a.value.localeCompare(b.value)
          : a.label.localeCompare(b.label, 'es'),
      );
    return options.length < 2 ? [] : [{ key: definition.key, label: definition.label, options }];
  });
}

/** Whether an item has every value chosen in `selection`. */
export function matches(item: FacetValues, selection: Selection): boolean {
  return Object.entries(selection).every(([key, value]) => item[key]?.includes(value) ?? false);
}

/** The selection written in a URL query, keeping only values that some facet offers. */
export function selectionFromQuery(query: string, facets: readonly Facet[]): Selection {
  const parameters = new URLSearchParams(query);
  const selection: Record<string, string> = {};
  for (const facet of facets) {
    const value = parameters.get(facet.key);
    if (value !== null && facet.options.some((option) => option.value === value)) {
      selection[facet.key] = value;
    }
  }
  return selection;
}

/** The URL query of a selection, in facet order: `?tipo=recital&anio=1981`, or `''`. */
export function queryOf(selection: Selection, facets: readonly Facet[]): string {
  const parameters = new URLSearchParams();
  for (const facet of facets) {
    const value = selection[facet.key];
    if (value !== undefined) {
      parameters.set(facet.key, value);
    }
  }
  const query = parameters.toString();
  return query === '' ? '' : `?${query}`;
}

/** The year an archive date starts in: `1993/1995` → `1993`, `1981-06-12` → `1981`. */
export function yearOf(date: string | undefined): string | undefined {
  return date === undefined ? undefined : date.slice(0, 4);
}
