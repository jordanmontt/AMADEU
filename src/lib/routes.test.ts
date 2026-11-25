import { describe, expect, it } from 'vitest';
import { aRecording, aText, aVideo, aWork, anArtwork } from '../../tests/support/builders';
import {
  adminEditPath,
  artworkPath,
  audioPath,
  currentSection,
  permalinkPath,
  sectionPath,
  textPath,
  videoPath,
  workPath,
} from './routes';

describe('routes', () => {
  const work = aWork('sys', { slug: 'sangre-y-sueno' });

  it('places a work at the root, using its explicit slug (RF-61)', () => {
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

  it('serves the audio of a recording under /audio/ by its file name', () => {
    expect(audioPath(aRecording('r-0001', { audio: 'cordillera-real-lp.mp3' }))).toBe(
      '/audio/cordillera-real-lp.mp3',
    );
  });

  it('builds the permanent link of an id', () => {
    expect(permalinkPath('t-0012')).toBe('/id/t-0012/');
  });

  it('builds the admin edit link of an entry', () => {
    expect(adminEditPath('artworks', 'dibujo-93')).toBe(
      '/admin/#/collections/artworks/entries/dibujo-93',
    );
  });

  it('builds section paths', () => {
    expect(sectionPath('galeria')).toBe('/galeria/');
  });
});

describe('currentSection', () => {
  it('finds the navigation section of a page', () => {
    expect(currentSection('/escuchar/')).toBe('escuchar');
    expect(currentSection('/galeria/dibujo-93/')).toBe('galeria');
  });

  it('places work and text pages under "obras"', () => {
    expect(currentSection('/sangre-y-sueno/')).toBe('obras');
    expect(currentSection('/sangre-y-sueno/cordillera-de-los-andes/')).toBe('obras');
    expect(currentSection('/obras/')).toBe('obras');
  });

  it('gives no section for the home page and technical routes', () => {
    expect(currentSection('/')).toBeNull();
    expect(currentSection('/admin/pendientes/')).toBeNull();
    expect(currentSection('/id/x/')).toBeNull();
    expect(currentSection('/audio/x.mp3')).toBeNull();
  });
});
