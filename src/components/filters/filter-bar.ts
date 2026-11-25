/**
 * `<filter-bar>`: shows only the items of the page that have every chosen value (RF-07,
 * RF-24, RF-26). Matching and the URL format live in src/lib/filters.ts.
 */
import { es } from '../../i18n/es';
import {
  type Facet,
  type FacetValues,
  type Selection,
  matches,
  queryOf,
  selectionFromQuery,
} from '../../lib/filters';

export type FilterView = 'listen' | 'gallery' | 'read';

const COUNTS: Readonly<Record<FilterView, (count: number) => string>> = {
  listen: es.listen.count,
  gallery: es.gallery.count,
  read: es.read.count,
};

class FilterBar extends HTMLElement {
  #facets: readonly Facet[] = [];

  connectedCallback(): void {
    this.#facets = JSON.parse(this.dataset.facets ?? '[]') as Facet[];
    const form = this.#form();
    form.addEventListener('change', () => {
      this.#apply();
    });
    // A reset clears the choices after this event: apply on the next task.
    form.addEventListener('reset', () => {
      setTimeout(() => {
        this.#apply();
        form.querySelector('select')?.focus();
      });
    });
    const shared = selectionFromQuery(window.location.search, this.#facets);
    for (const [key, value] of Object.entries(shared)) {
      const select = form.elements.namedItem(key);
      if (select instanceof HTMLSelectElement) {
        select.value = value;
      }
    }
    this.hidden = false;
    this.#apply();
  }

  #form(): HTMLFormElement {
    const form = this.querySelector('form');
    if (form === null) {
      throw new Error('<filter-bar> has no form');
    }
    return form;
  }

  #selection(): Selection {
    const selection: Record<string, string> = {};
    for (const select of this.#form().querySelectorAll('select')) {
      if (select.value !== '') {
        selection[select.name] = select.value;
      }
    }
    return selection;
  }

  #apply(): void {
    const selection = this.#selection();
    let shown = 0;
    for (const item of document.querySelectorAll<HTMLElement>('[data-filter-values]')) {
      const values = JSON.parse(item.dataset.filterValues ?? '{}') as FacetValues;
      const visible = matches(values, selection);
      item.hidden = !visible;
      shown += Number(visible);
    }
    for (const group of document.querySelectorAll<HTMLElement>('[data-filter-group]')) {
      group.hidden = group.querySelector('[data-filter-values]:not([hidden])') === null;
    }
    const view = (this.dataset.view ?? 'listen') as FilterView;
    const count = this.querySelector('[data-count]');
    if (count !== null) {
      count.textContent = COUNTS[view](shown);
    }
    const none = this.querySelector<HTMLElement>('[data-none]');
    if (none !== null) {
      none.hidden = shown > 0;
    }
    const clear = this.querySelector<HTMLElement>('button[type="reset"]');
    if (clear !== null) {
      clear.hidden = Object.keys(selection).length === 0;
    }
    // Keep the router's state: replacing it would break going back with client navigation.
    const url = `${window.location.pathname}${queryOf(selection, this.#facets)}`;
    window.history.replaceState(window.history.state, '', url);
  }
}

customElements.define('filter-bar', FilterBar);
