import { describe, expect, it } from 'vitest';
import {
  type FacetDefinition,
  type FacetValues,
  facetsOf,
  matches,
  queryOf,
  selectionFromQuery,
  yearOf,
} from './filters';

const kind: FacetDefinition = {
  key: 'tipo',
  label: 'Tipo',
  labelOf: (value) => ({ song: 'Canción', recital: 'Recital', reading: 'Lectura' })[value] ?? value,
};
const year: FacetDefinition = { key: 'anio', label: 'Año', sort: 'value' };
const work: FacetDefinition = { key: 'obra', label: 'Obra' };

const items: FacetValues[] = [
  { tipo: ['song'], anio: ['1993'], obra: ['sys'] },
  { tipo: ['song'], anio: ['1984'], obra: ['sys'] },
  { tipo: ['recital'], anio: ['1981'], obra: ['sys', 'fuego'] },
  { tipo: ['reading'], obra: ['sys'] },
];

describe('facetsOf', () => {
  it('offers each value with the number of items that have it, by label or by value', () => {
    const [kinds, years] = facetsOf([kind, year], items);

    expect(kinds).toEqual({
      key: 'tipo',
      label: 'Tipo',
      options: [
        { value: 'song', label: 'Canción', count: 2 },
        { value: 'reading', label: 'Lectura', count: 1 },
        { value: 'recital', label: 'Recital', count: 1 },
      ],
    });
    expect(years?.options.map((option) => option.value)).toEqual(['1981', '1984', '1993']);
  });

  it('counts an item once per value, even with several values', () => {
    const [works] = facetsOf([work], items);

    expect(works?.options).toEqual([
      { value: 'fuego', label: 'fuego', count: 1 },
      { value: 'sys', label: 'sys', count: 4 },
    ]);
  });

  it('leaves out a facet that would filter nothing (fewer than two values)', () => {
    expect(facetsOf([work], [{ obra: ['sys'] }, { obra: ['sys'] }])).toEqual([]);
  });
});

describe('matches', () => {
  it('keeps an item that has every chosen value', () => {
    expect(matches(items[2] ?? {}, { tipo: 'recital', obra: 'fuego' })).toBe(true);
  });

  it('drops an item missing one chosen value, or without that facet at all', () => {
    expect(matches(items[0] ?? {}, { tipo: 'song', anio: '1984' })).toBe(false);
    expect(matches(items[3] ?? {}, { anio: '1993' })).toBe(false);
  });

  it('keeps every item when nothing is chosen', () => {
    expect(items.every((item) => matches(item, {}))).toBe(true);
  });
});

describe('selection in the URL', () => {
  const facets = facetsOf([kind, year], items);

  it('writes the chosen values in facet order, and nothing when none is chosen', () => {
    expect(queryOf({ anio: '1981', tipo: 'recital' }, facets)).toBe('?tipo=recital&anio=1981');
    expect(queryOf({}, facets)).toBe('');
  });

  it('reads back a shared URL, ignoring unknown facets and values no item has', () => {
    expect(selectionFromQuery('?tipo=recital&anio=1950&color=rojo', facets)).toEqual({
      tipo: 'recital',
    });
  });
});

describe('yearOf', () => {
  it('takes the year an archive date starts in', () => {
    expect(yearOf('1993/1995')).toBe('1993');
    expect(yearOf('1981-06-12')).toBe('1981');
    expect(yearOf(undefined)).toBeUndefined();
  });
});
