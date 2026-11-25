/**
 * "Alcalde de la canción" (scan 93.tif): the man in the top hat strums his guitar while a
 * song plays (RF-51). Coordinates are pixels of `src/content/media/images/dibujo-93.webp`
 * (1490 × 2400), traced on a grid over the scan.
 */
import type { DrawingAnimation } from './drawing-animation';

export const alcaldeDeLaCancion: DrawingAnimation = {
  artworkId: 'dibujo-93',
  width: 1490,
  height: 2400,
  parts: [
    {
      // The strumming hand on the guitar, from the cuff of the sleeve to the fingertips.
      name: 'hand',
      outline: [
        [570, 1388],
        [586, 1352],
        [600, 1322],
        [614, 1302],
        [636, 1290],
        [660, 1287],
        [682, 1295],
        [693, 1312],
        [695, 1340],
        [689, 1366],
        [676, 1384],
        [650, 1392],
        [620, 1397],
        [592, 1399],
        [578, 1395],
      ],
      pivot: [576, 1394],
      motion: 'strum',
      seconds: 0.5,
    },
    {
      // The feather on the hat, turning around the brooch that pins it to the hat band.
      name: 'feather',
      outline: [
        [650, 1068],
        [652, 1035],
        [668, 1000],
        [700, 960],
        [740, 925],
        [790, 893],
        [830, 883],
        [870, 884],
        [884, 898],
        [874, 932],
        [852, 962],
        [820, 988],
        [770, 1003],
        [720, 1022],
        [682, 1042],
        [662, 1068],
      ],
      pivot: [646, 1062],
      motion: 'sway',
      seconds: 2.6,
    },
    {
      name: 'cloud-left',
      outline: [
        [274, 406],
        [452, 406],
        [452, 504],
        [274, 504],
      ],
      pivot: [363, 455],
      motion: 'drift',
      seconds: 14,
    },
    {
      name: 'cloud-right',
      outline: [
        [1038, 344],
        [1252, 344],
        [1252, 458],
        [1038, 458],
      ],
      pivot: [1145, 401],
      motion: 'drift',
      seconds: 19,
    },
  ],
  // The strings run on under the hand, so that strumming never uncovers bare paper. They
  // continue the four strings of the neck, which cross x = 690 at these heights with a
  // slope of -0.95 (measured on the scan).
  repairs: [1264, 1280.5, 1296.5, 1312.5]
    .map((y) => {
      const at = (x: number): string => String(Math.round((y - 0.95 * (x - 690)) * 10) / 10);
      return `<line x1="705" y1="${at(705)}" x2="590" y2="${at(590)}" stroke="#111" stroke-width="3" stroke-linecap="round"/>`;
    })
    .join(''),
  writing: [
    // The title, then the five handwritten verses, top to bottom: the ink of each line
    // (measured on the scan) plus 8 px, kept clear of the frame line drawn around the scene.
    { left: 215, top: 140, right: 1225, bottom: 248 },
    { left: 76, top: 1880, right: 975, bottom: 1985 },
    { left: 63, top: 1985, right: 1080, bottom: 2072 },
    { left: 47, top: 2072, right: 842, bottom: 2168 },
    { left: 30, top: 2168, right: 643, bottom: 2240 },
    { left: 27, top: 2240, right: 1413, bottom: 2340 },
  ],
};
