# 0054. Animations on watercolours: a handwriting layer, washes and windows; "Cordillera Real" on the home page

- **Status:** Accepted; refines [0051](0051-raster-layer-animations.md)
- **Date:** 2026-11-24
- **Requirements:** RF-11, RF-50 to RF-52

## Context

RF-11 asks for a home page with an animated drawing of Marcelo and a reference to La Paz and the Illimani. The developer chose "Cordillera Real" (cuadro-2): the snow-capped range of La Paz under a large sky, with the small man in the top hat and the verse "Estos gigantes de nieve".

It is a watercolour on hatched green paper. The technique of ADR 0051 assumed ink on white paper. It painted moving parts out in white, and covered the handwriting with white boxes that slid away. On a watercolour both would show as white patches.

## Decision

- **Handwriting as a layer.** The handwriting is lifted onto its own layer. The background has it filled in, and each line of the layer is revealed left to right with `clip-path`. Neither method depends on the paper's colour.
- **Fill.** Each drawing says what fills in what moved:
  - `paper`: white, for ink on white;
  - `wash`: the scan with a wide median filter and a blur, for watercolours.
  - A `paperSample`, a clean strip of the paper, is repeated over the handwriting so the hatched paper keeps its texture.
- **Windows and fades.** A part may move only inside a `window`, such as the sky inside the painted frame, and its edge may fade (`feather`). The fade stays **inside** the outline: a fade spreading outwards took the frame's green paint and carried it into the sky. A `drift` can set its `distance`. The clouds of "Cordillera Real" slide 1 % with a wide fade, because a longer slide showed where the band of clouds was cut.
- **Trigger.** `playing` moves the parts only while a song plays, as with "Alcalde de la canción". `always` moves them from the start, as on the home page.
- **Writing timing and the boundary between interleaved lines** are computed in `src/lib/animations/drawing-animation.ts` (`writingLines`) and unit-tested.
- **Home page.** It opens with the title and the animated painting side by side (`HOME_DRAWING`). Until the painting's rights are cleared, the work's cover is shown still.

## Consequences

- One technique for ink drawings and watercolours. Every layer is still cut by `scripts/animations/build.ts` and checked by tests.
- At the far end of the slide, a strip about 18 scan pixels wide of the wash shows next to the frame. That is about 5 px on screen, soft, and it was judged acceptable on a composite at full size.
- Before the verse is written, a faint repetition of the paper sample can be seen for a few seconds.
- The browser keeps processed images by URL during `astro dev`. After re-cutting layers, reload with the cache emptied to see them.

## Rejected alternatives

- **Keeping the white covers:** they show as white boxes on tinted paper.
- **Moving the whole sky:** the frame and the peaks would move with it.
- **A generated video:** heavier and less faithful (ADR 0004).
