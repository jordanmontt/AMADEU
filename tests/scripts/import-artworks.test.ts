import { describe, expect, it } from 'vitest';
import { artworkData, imageFileName } from '../../scripts/lib/import-artworks';
import { artworkSchema } from '../../src/lib/content/schemas';

const item = {
  source: '000 ARCHIVO MARCELO 2/Imagenes/12A.tif',
  id: 'dibujo-12a',
  title: 'Sangre y sueño',
  kind: 'drawing',
  technique: 'Tinta sobre papel',
  inscription: 'Sangre y sueño',
  sheet: 'dibujo-12',
  texts: ['sangre-y-sueno'],
  alt: 'Viñeta a tinta de un bosque de pinos.',
  rights: 'cleared' as const,
};

describe('artwork import', () => {
  it('stores the web image as WebP named after the entry id', () => {
    expect(imageFileName(item)).toBe('dibujo-12a.webp');
  });

  it('builds a valid entry that points to its image relative to the entry file', () => {
    const data = artworkData(item);

    expect(data).toEqual({
      title: 'Sangre y sueño',
      kind: 'drawing',
      technique: 'Tinta sobre papel',
      inscription: 'Sangre y sueño',
      sheet: 'dibujo-12',
      texts: ['sangre-y-sueno'],
      image: '../media/images/dibujo-12a.webp',
      sourceFile: '12A.tif',
      alt: 'Viñeta a tinta de un bosque de pinos.',
      rights: 'cleared',
    });
    expect(artworkSchema.safeParse(data).success).toBe(true);
  });
});
