import { describe, expect, it } from 'vitest';
import { aRecording, aText, aWork, anArtwork, collections } from '../../tests/support/builders';
import { Catalog } from './catalog';
import { facetsOf } from './filters';
import {
  type FilterLabels,
  artworkFacets,
  artworkValues,
  recordingFacets,
  recordingValues,
  textFacets,
  textValues,
} from './view-filters';

const labels: FilterLabels = {
  work: 'Obra',
  kind: 'Tipo',
  year: 'Año',
  collection: 'Procedencia',
  technique: 'Técnica',
  series: 'Serie',
  kinds: {
    song: 'Canción',
    recital: 'Recital',
    poem: 'Poema',
    drawing: 'Dibujo',
    painting: 'Pintura',
  },
};

const sys = aWork('sys', { title: 'Sangre y Sueño', slug: 'sangre-y-sueno' });
const fuego = aWork('fuego', { title: 'Fuego desvelado', slug: 'fuego-desvelado' });
const song = aText('cordillera', { work: 'sys', title: 'Cordillera Real' });
const poem = aText('romance', { work: 'fuego', kind: 'poem', title: 'Romance' });
const lp = aRecording('lp', { texts: ['cordillera'], date: '1984', collection: 'LP 1984' });
const recital = aRecording('recital', {
  kind: 'recital',
  texts: ['cordillera', 'romance'],
  date: '1981-06-12',
  collection: 'Recitales',
});
const drawing = anArtwork('dibujo', { texts: ['cordillera'], technique: 'Tinta', date: '1993' });
const painting = anArtwork('cuadro', { kind: 'painting', technique: 'Óleo' });
const catalog = Catalog.published(
  collections({
    works: [sys, fuego],
    texts: [song, poem],
    recordings: [lp, recital],
    artworks: [drawing, painting],
  }),
);

describe('Escuchar filters (RF-24)', () => {
  it('gives each recording its works, kind, starting year and collection, in Spanish for the URL', () => {
    expect(recordingValues(catalog, recital, labels)).toEqual({
      obra: ['fuego-desvelado', 'sangre-y-sueno'],
      tipo: ['recital'],
      anio: ['1981'],
      procedencia: ['recitales'],
    });
    expect(recordingValues(catalog, lp, labels)).toMatchObject({
      tipo: ['cancion'],
      procedencia: ['lp-1984'],
    });
  });

  it('counts a work once for a recording of several of its texts', () => {
    const medley = aRecording('medley', { texts: ['cordillera', 'cordillera-2'] });
    const both = Catalog.published(
      collections({
        works: [sys],
        texts: [song, aText('cordillera-2', { work: 'sys', title: 'Otra', order: 2 })],
        recordings: [medley],
      }),
    );

    expect(recordingValues(both, medley, labels).obra).toEqual(['sangre-y-sueno']);
  });

  it('offers work titles and kind names, and years in time order', () => {
    const facets = facetsOf(
      recordingFacets(catalog, labels),
      [lp, recital].map((recording) => recordingValues(catalog, recording, labels)),
    );

    expect(facets.map((facet) => facet.key)).toEqual(['obra', 'tipo', 'anio', 'procedencia']);
    expect(facets[0]?.options.map((option) => option.label)).toEqual([
      'Fuego desvelado',
      'Sangre y Sueño',
    ]);
    expect(facets[1]?.options.map((option) => option.label)).toEqual(['Canción', 'Recital']);
    expect(facets[3]?.options.map((option) => option.label)).toEqual(['LP 1984', 'Recitales']);
    expect(facets[2]?.options.map((option) => option.value)).toEqual(['1981', '1984']);
  });
});

describe('Galería filters (RF-26)', () => {
  it('gives each artwork its kind, technique, year and the works it illustrates', () => {
    expect(artworkValues(catalog, drawing, labels)).toEqual({
      tipo: ['dibujo'],
      tecnica: ['tinta'],
      serie: [],
      anio: ['1993'],
      obra: ['sangre-y-sueno'],
    });
    expect(artworkValues(catalog, painting, labels).obra).toEqual([]);
  });

  it('offers only the facets that tell artworks apart', () => {
    const facets = facetsOf(
      artworkFacets(catalog, labels),
      [drawing, painting].map((artwork) => artworkValues(catalog, artwork, labels)),
    );

    expect(facets.map((facet) => facet.key)).toEqual(['tipo', 'tecnica']);
    expect(facets[1]?.options.map((option) => option.label)).toEqual(['Óleo', 'Tinta']);
  });
});

describe('Leer filters (RF-07)', () => {
  it('filters texts by work and by poem or song', () => {
    const facets = facetsOf(
      textFacets(catalog, labels),
      [song, poem].map((text) => textValues(catalog, text, labels)),
    );

    expect(textValues(catalog, poem, labels)).toEqual({
      obra: ['fuego-desvelado'],
      tipo: ['poema'],
    });
    expect(facets.map((facet) => facet.key)).toEqual(['obra', 'tipo']);
  });
});
