import { describe, expect, it } from 'vitest';
import { aText, aVideo, aWork, anArtwork } from '../../tests/support/builders';
import { artworkPath, permalinkPath, textPath, videoPath, workPath } from './routes';

describe('routes', () => {
  const work = aWork('sys', { slug: 'sangre-y-sueno' });

  it('places a work at the root, using its explicit slug', () => {
    expect(workPath(work)).toBe('/sangre-y-sueno/');
  });

  it('places a text under its work, with a slug from its current title', () => {
    const text = aText('t-0012', { title: 'Cordillera Real' });

    expect(textPath(work, text)).toBe('/sangre-y-sueno/cordillera-real/');
  });

  it('changes a text URL when its title changes (no history, ADR 0037)', () => {
    const renamed = aText('t-0012', { title: 'Cordillera de los Andes' });

    expect(textPath(work, renamed)).toBe('/sangre-y-sueno/cordillera-de-los-andes/');
  });

  it('places gallery images and videos at their permanent id', () => {
    expect(artworkPath(anArtwork('alcalde-de-la-cancion'))).toBe('/galeria/alcalde-de-la-cancion/');
    expect(videoPath(aVideo('america-precolombina'))).toBe('/videos/america-precolombina/');
  });

  it('builds the permanent link of an id', () => {
    expect(permalinkPath('t-0012')).toBe('/id/t-0012/');
  });
});
