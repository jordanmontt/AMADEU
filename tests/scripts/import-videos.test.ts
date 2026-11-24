import { describe, expect, it } from 'vitest';
import { videoData } from '../../scripts/lib/import-videos';
import { videoSchema } from '../../src/lib/content/schemas';

describe('videoData', () => {
  it('fills date and what to review for series programmes and starts every video as pending', () => {
    const data = videoData(
      {
        source: 'x.mp4',
        id: 'altiplano',
        title: 'Altiplano boliviano',
        series: 'Los Caminos del Hombre',
      },
      1234.4,
    );

    expect(data).toMatchObject({
      title: 'Altiplano boliviano',
      series: 'Los Caminos del Hombre',
      date: '1985',
      durationSeconds: 1234,
      texts: [],
      rights: 'pending',
    });
    expect(data.review).toMatch(/por confirmar/);
    expect(videoSchema.safeParse(data).success).toBe(true);
  });

  it('keeps the item’s own date, notes and review, and omits what is unknown', () => {
    expect(
      videoData(
        { source: 'x.mp4', id: 'p', title: 'Presentación', date: '1996', notes: 'N', review: 'R' },
        60,
      ),
    ).toEqual({
      title: 'Presentación',
      date: '1996',
      durationSeconds: 60,
      texts: [],
      notes: 'N',
      review: 'R',
      rights: 'pending',
    });
    expect(videoData({ source: 'x.mp4', id: 'q', title: 'Sin datos' }, 60)).toEqual({
      title: 'Sin datos',
      durationSeconds: 60,
      texts: [],
      rights: 'pending',
    });
  });
});
