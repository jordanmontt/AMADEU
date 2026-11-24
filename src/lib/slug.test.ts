import { describe, expect, it } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
  it('removes accents and the tilde', () => {
    expect(slugify('Sangre y Sueño')).toBe('sangre-y-sueno');
    expect(slugify('Canción serena')).toBe('cancion-serena');
  });

  it('turns punctuation into single separators and trims them', () => {
    expect(slugify('¿Quién eres, Diego?')).toBe('quien-eres-diego');
    expect(slugify('Nuestra Señora de La Paz (Chuquiago Marka)')).toBe(
      'nuestra-senora-de-la-paz-chuquiago-marka',
    );
  });

  it('keeps digits', () => {
    expect(slugify('Recital Goethe-Institut 1981')).toBe('recital-goethe-institut-1981');
  });

  it('gives an empty slug for a title without letters or digits', () => {
    expect(slugify('¡¿…?!')).toBe('');
  });
});
