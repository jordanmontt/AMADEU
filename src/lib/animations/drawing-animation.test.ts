import { describe, expect, it } from 'vitest';
import {
  type DrawingAnimation,
  type MovingPart,
  animationProblems,
  bandBox,
  outlinePath,
  percent,
  pivotOrigin,
} from './drawing-animation';

const hand: MovingPart = {
  name: 'hand',
  outline: [
    [10, 10],
    [30, 10],
    [30, 40],
  ],
  pivot: [10, 40],
  motion: 'strum',
  seconds: 0.5,
};

function anAnimation(fields: Partial<DrawingAnimation> = {}): DrawingAnimation {
  return {
    artworkId: 'dibujo',
    width: 200,
    height: 400,
    parts: [hand],
    repairs: '',
    writing: [{ left: 20, top: 300, right: 120, bottom: 340 }],
    ...fields,
  };
}

describe('drawing animation geometry', () => {
  it('expresses scan pixels as CSS percentages', () => {
    expect(percent(50, 200)).toBe('25%');
    expect(percent(1, 3)).toBe('33.33%');
  });

  it('turns an outline into a closed SVG path', () => {
    expect(outlinePath(hand.outline)).toBe('M10 10L30 10L30 40Z');
  });

  it('refuses an outline that encloses nothing', () => {
    expect(() =>
      outlinePath([
        [0, 0],
        [1, 1],
      ]),
    ).toThrow(RangeError);
  });

  it('places the pivot of a part relative to the whole drawing', () => {
    expect(pivotOrigin(anAnimation(), hand)).toBe('5% 10%');
  });

  it('places a writing band over the drawing', () => {
    expect(bandBox(anAnimation(), { left: 20, top: 300, right: 120, bottom: 340 })).toEqual({
      left: '10%',
      top: '75%',
      width: '50%',
      height: '10%',
    });
  });
});

describe('animationProblems', () => {
  it('accepts a sound description', () => {
    expect(animationProblems(anAnimation())).toEqual([]);
  });

  it('reports parts defined twice, badly named or without a real outline', () => {
    const problems = animationProblems(
      anAnimation({
        parts: [
          hand,
          hand,
          { ...hand, name: 'Mano Derecha' },
          { ...hand, name: 'line', outline: [hand.outline[0] ?? [0, 0], [1, 1]] },
        ],
      }),
    );

    expect(problems).toEqual([
      'part "hand" is defined twice',
      'part "Mano Derecha" needs a lowercase name usable as a file name',
      'part "line" has fewer than 3 outline points',
    ]);
  });

  it('reports points, pivots and bands outside the scan, and motions that never move', () => {
    const problems = animationProblems(
      anAnimation({
        parts: [
          {
            ...hand,
            outline: [...hand.outline, [201, 10]],
            pivot: [10, -1],
            seconds: 0,
          },
        ],
        writing: [
          { left: 20, top: 300, right: 10, bottom: 340 },
          { left: 20, top: 300, right: 120, bottom: 401 },
        ],
      }),
    );

    expect(problems).toEqual([
      'part "hand" has outline points outside the scan',
      'part "hand" has its pivot outside the scan',
      'part "hand" has a motion that never moves',
      'writing band 0 is empty or outside the scan',
      'writing band 1 is empty or outside the scan',
    ]);
  });
});
