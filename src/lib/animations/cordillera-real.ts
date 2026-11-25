/**
 * "Cordillera Real" (cuadro-2): the snow-capped Cordillera Real of La Paz, where the
 * Illimani stands, under a large sky, with the small man in the top hat and the verse
 * "Estos gigantes de nieve". On the home page (RF-11) its low clouds drift slowly over the
 * peaks and its title and verse are written the first time it is seen.
 *
 * Coordinates are pixels of `src/content/media/images/cuadro-2.webp` (1798 × 2400), read on
 * a grid over the scan (scripts/animations/grid.ts).
 */
import type { DrawingAnimation } from './drawing-animation';

/** The sky inside the green frame painted around the scene. */
const SKY = { left: 272, top: 380, right: 1586, bottom: 1600 };

/** The band of low clouds, across the whole sky. */
const CLOUDS = { left: SKY.left, top: 1200, right: SKY.right, bottom: 1545 };

export const cordilleraReal: DrawingAnimation = {
  artworkId: 'cuadro-2',
  width: 1798,
  height: 2400,
  // A watercolour on tinted paper: what moves is filled in with a wash made from the scan.
  fill: 'wash',
  // Hatched paper between the title and the frame, laid over the handwriting.
  paperSample: { left: 400, top: 250, right: 1500, bottom: 325 },
  // On the home page it moves all the time, not only while a song plays.
  trigger: 'always',
  parts: [
    {
      // The band of grey clouds resting on the peaks.
      name: 'clouds',
      // Its edge fades inward only, so the frame's paint is never part of it.
      outline: [
        [CLOUDS.left, CLOUDS.top],
        [CLOUDS.right, CLOUDS.top],
        [CLOUDS.right, CLOUDS.bottom],
        [CLOUDS.left, CLOUDS.bottom],
      ],
      pivot: [929, 1372],
      motion: 'drift',
      seconds: 18,
      window: SKY,
      // A watercolour sky has no edges: a short slide and a wide fade keep the band of
      // clouds from showing where it was cut.
      feather: 160,
      distance: 1,
    },
  ],
  repairs: '',
  writing: [
    // The title, then the five lines of the verse, top to bottom.
    { left: 480, top: 135, right: 1345, bottom: 240 },
    { left: 350, top: 2070, right: 965, bottom: 2137 },
    { left: 350, top: 2137, right: 930, bottom: 2200 },
    { left: 350, top: 2200, right: 910, bottom: 2263 },
    { left: 345, top: 2263, right: 1105, bottom: 2322 },
    { left: 345, top: 2322, right: 1220, bottom: 2392 },
  ],
};
