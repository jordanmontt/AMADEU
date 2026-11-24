import { describe, expect, it } from 'vitest';
import { animationProblems } from './drawing-animation';
import { DRAWING_ANIMATIONS, animationOf } from './registry';

describe('drawing animations registry', () => {
  it('finds the animation of "Alcalde de la canción" by its artwork id (RF-51)', () => {
    expect(animationOf('dibujo-93')?.parts.map((part) => part.name)).toEqual([
      'hand',
      'feather',
      'cloud-left',
      'cloud-right',
    ]);
  });

  it('answers nothing for a drawing without an animation', () => {
    expect(animationOf('dibujo-1')).toBeUndefined();
  });

  it.each(DRAWING_ANIMATIONS.map((animation) => [animation.artworkId, animation]))(
    'has a sound description for %s, at most one per artwork',
    (artworkId, animation) => {
      expect(animationProblems(animation)).toEqual([]);
      expect(DRAWING_ANIMATIONS.filter((each) => each.artworkId === artworkId)).toHaveLength(1);
    },
  );
});
