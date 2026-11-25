/**
 * Every drawing that has a handcrafted animation (RF-50). An artwork is animated exactly
 * when its id appears here; its layers live in src/assets/animations/<artwork id>/.
 */
import { alcaldeDeLaCancion } from './alcalde-de-la-cancion';
import { cordilleraReal } from './cordillera-real';
import type { DrawingAnimation } from './drawing-animation';

export const DRAWING_ANIMATIONS: readonly DrawingAnimation[] = [alcaldeDeLaCancion, cordilleraReal];

/** The drawing that opens the home page, animated (RF-11). */
export const HOME_DRAWING = cordilleraReal.artworkId;

/** The animation of an artwork, if it has one. */
export function animationOf(artworkId: string): DrawingAnimation | undefined {
  return DRAWING_ANIMATIONS.find((animation) => animation.artworkId === artworkId);
}
