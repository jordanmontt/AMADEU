import { describe, expect, it } from 'vitest';
import {
  type DrawingAnimation,
  type MovingPart,
  animationProblems,
  insetOf,
  outlinePath,
  percent,
  pivotOrigin,
  WRITING_REACH,
  writingLines,
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
    fill: 'paper',
    trigger: 'playing',
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

  it('clips the drawing to a rectangle', () => {
    expect(insetOf(anAnimation(), { left: 20, top: 300, right: 120, bottom: 340 })).toBe(
      'inset(75% 40% 15% 10%)',
    );
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

describe('writingLines', () => {
  const lines = writingLines(
    anAnimation({
      height: 1000,
      writing: [
        { left: 0, top: 100, right: 100, bottom: 200 },
        { left: 0, top: 200, right: 50, bottom: 300 },
        { left: 0, top: 500, right: 100, bottom: 600 },
      ],
    }),
  );

  it('writes the lines one after the other, longer lines taking longer', () => {
    expect(lines.map((line) => line.delayMs)).toEqual([0, 360, 665]);
    expect(lines.map((line) => line.durationMs)).toEqual([110, 55, 110]);
  });

  it('moves the boundary between touching lines up, so tall strokes come with their line', () => {
    const boundary = `${String((200 - WRITING_REACH) / 10)}%`;

    expect(lines[0]?.written).toBe(
      `inset(10% 50% ${String(100 - (200 - WRITING_REACH) / 10)}% 0%)`,
    );
    expect(lines[1]?.written).toBe(`inset(${boundary} 75% 70% 0%)`);
    expect(lines[2]?.written).toBe('inset(50% 50% 40% 0%)');
  });

  it('starts each line blank at its left edge', () => {
    expect(lines[2]?.blank).toBe('inset(50% 100% 40% 0%)');
  });
});

describe('animationProblems of windows and samples', () => {
  it('reports a window or a paper sample outside the scan, and a negative feather', () => {
    const problems = animationProblems(
      anAnimation({
        parts: [{ ...hand, window: { left: 0, top: 0, right: 300, bottom: 10 }, feather: -1 }],
        paperSample: { left: 10, top: 10, right: 10, bottom: 20 },
      }),
    );

    expect(problems).toEqual([
      'part "hand" has an empty window or one outside the scan',
      'part "hand" has a negative feather',
      'the paper sample is empty or outside the scan',
    ]);
  });
});
