/**
 * Handcrafted animations of scanned drawings (RF-50 to RF-52, ADR 0004, ADR 0051).
 *
 * A drawing is split into raster layers cut from its scan: a still background, the parts
 * that move and the handwriting. Each moving part is a polygon on the scan, in scan pixels,
 * that turns around a pivot or slides. The background has the moving parts and the
 * handwriting filled in (with paper white, or with a wash made from the scan itself for
 * watercolours) and, where a part uncovers something when it moves, a small repair in ink.
 *
 * "Writing" bands are the handwritten lines; a layer with the original handwriting is
 * revealed band by band, left to right, once, as if the hand were writing them.
 *
 * The same description drives the layer script (`scripts/animations/`) and the component
 * that stacks the layers, so their positions can never disagree.
 */

/** A point on the scan, in pixels: `[x, y]`. */
export type Point = readonly [number, number];

/**
 * How a part moves. The movements themselves are defined once, in CSS
 * (AnimatedDrawing.astro):
 * - `strum`: a quick turn back and forth, like a hand strumming;
 * - `sway`: a slow turn back and forth, like a feather in the wind;
 * - `drift`: a slow slide sideways and back, like a cloud.
 */
export const MOTIONS = ['strum', 'sway', 'drift'] as const;
export type Motion = (typeof MOTIONS)[number];

export interface MovingPart {
  /** Used for the layer file name and its CSS class. */
  readonly name: string;
  /** Outline of the part on the scan; everything inside moves, painted out of the background. */
  readonly outline: readonly Point[];
  /** The point the part turns around. */
  readonly pivot: Point;
  readonly motion: Motion;
  /** Length of one cycle of the motion. */
  readonly seconds: number;
  /**
   * Where the part may show while it moves, e.g. the sky inside a painted frame, so a
   * sliding cloud never covers the frame. The whole drawing when left out.
   */
  readonly window?: Band;
  /** Pixels over which the part's edge fades into the background, for washes. */
  readonly feather?: number;
  /** How far a `drift` slides, in percent of the drawing's width; 2.5 when left out. */
  readonly distance?: number;
}

/** How far a `drift` slides when its part does not say, in percent of the drawing's width. */
export const DEFAULT_DRIFT_DISTANCE = 2.5;

/** A rectangle on the scan, in pixels. */
export interface Band {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

/**
 * What fills the background where a part or the handwriting was:
 * - `paper`: paper white, for ink on white paper;
 * - `wash`: the scan itself with its fine lines removed and softened, for watercolours and
 *   tinted paper.
 */
export type Fill = 'paper' | 'wash';

/** When the parts move: while a song plays, or all the time (a drawing on the home page). */
export type Trigger = 'playing' | 'always';

export interface DrawingAnimation {
  /** The artwork entry this animation brings to life. */
  readonly artworkId: string;
  /** Size of the scan the outlines refer to. */
  readonly width: number;
  readonly height: number;
  readonly fill: Fill;
  /**
   * A clean piece of the paper, without ink, repeated to fill in the handwriting so the
   * paper keeps its texture (tinted or hatched paper). Without it, the fill is used.
   */
  readonly paperSample?: Band;
  readonly trigger: Trigger;
  readonly parts: readonly MovingPart[];
  /**
   * Ink drawn on the background where a moving part uncovers it, as SVG elements in scan
   * pixels (for example the strings under a strumming hand).
   */
  readonly repairs: string;
  /** Handwritten lines, top to bottom, revealed as if being written. */
  readonly writing: readonly Band[];
}

/** `value` as a percentage of `total`, rounded to 0.01 %, for CSS. */
export function percent(value: number, total: number): string {
  return `${String(Math.round((value / total) * 10_000) / 100)}%`;
}

/** The SVG path of a closed outline. */
export function outlinePath(outline: readonly Point[]): string {
  if (outline.length < 3) {
    throw new RangeError(`An outline needs at least 3 points, got ${String(outline.length)}`);
  }
  return `M${outline.map(([x, y]) => `${String(x)} ${String(y)}`).join('L')}Z`;
}

/** CSS `transform-origin` of a part's pivot, relative to the whole drawing. */
export function pivotOrigin(animation: DrawingAnimation, part: MovingPart): string {
  const [x, y] = part.pivot;
  return `${percent(x, animation.width)} ${percent(y, animation.height)}`;
}

/** CSS `clip-path` of a rectangle of the drawing: everything outside it is hidden. */
export function insetOf(animation: DrawingAnimation, band: Band): string {
  const { width, height } = animation;
  return `inset(${percent(band.top, height)} ${percent(width - band.right, width)} ${percent(height - band.bottom, height)} ${percent(band.left, width)})`;
}

/**
 * Scan pixels each handwritten line takes from the line above. Handwritten lines interleave:
 * the tall strokes of a line rise into the band of the line above. Moving the boundary up
 * reveals them with their own line, not earlier; a low stroke of the line above then shows
 * a moment later, which is far less visible.
 */
export const WRITING_REACH = 40;

/** Writing speed: milliseconds per scan pixel of a line, and the pause between lines. */
export const WRITING_MS_PER_PIXEL = 1.1;
export const WRITING_PAUSE_MS = 250;

export interface WritingLine {
  /** What of the handwriting layer this line shows once written. */
  readonly written: string;
  /** The same, before the pen starts: nothing, at the line's left edge. */
  readonly blank: string;
  readonly delayMs: number;
  readonly durationMs: number;
}

/** The handwritten lines in writing order, each with its clip and timing. */
export function writingLines(animation: DrawingAnimation): WritingLine[] {
  const { writing } = animation;
  let start = 0;
  return writing.map((band, index) => {
    const above = writing[index - 1];
    const below = writing[index + 1];
    const clip: Band = {
      ...band,
      top: above?.bottom === band.top ? band.top - WRITING_REACH : band.top,
      bottom: below?.top === band.bottom ? band.bottom - WRITING_REACH : band.bottom,
    };
    const durationMs = Math.round((band.right - band.left) * WRITING_MS_PER_PIXEL);
    const line: WritingLine = {
      written: insetOf(animation, clip),
      blank: insetOf(animation, { ...clip, right: clip.left }),
      delayMs: start,
      durationMs,
    };
    start += durationMs + WRITING_PAUSE_MS;
    return line;
  });
}

/**
 * Problems in an animation description: parts defined twice or badly named, outlines with
 * fewer than three points, points, pivots, windows or bands outside the scan, motions without
 * a length, negative feathers. An empty list means it is usable.
 */
export function animationProblems(animation: DrawingAnimation): string[] {
  const problems: string[] = [];
  const inside = ([x, y]: Point): boolean =>
    x >= 0 && y >= 0 && x <= animation.width && y <= animation.height;
  const bandInside = (band: Band): boolean =>
    band.left < band.right &&
    band.top < band.bottom &&
    inside([band.left, band.top]) &&
    inside([band.right, band.bottom]);
  const names = new Set<string>();
  for (const part of animation.parts) {
    if (names.has(part.name)) {
      problems.push(`part "${part.name}" is defined twice`);
    }
    names.add(part.name);
    if (part.outline.length < 3) {
      problems.push(`part "${part.name}" has fewer than 3 outline points`);
    }
    if (!part.outline.every(inside)) {
      problems.push(`part "${part.name}" has outline points outside the scan`);
    }
    if (!inside(part.pivot)) {
      problems.push(`part "${part.name}" has its pivot outside the scan`);
    }
    if (!(part.seconds > 0)) {
      problems.push(`part "${part.name}" has a motion that never moves`);
    }
    if (part.window !== undefined && !bandInside(part.window)) {
      problems.push(`part "${part.name}" has an empty window or one outside the scan`);
    }
    if (part.feather !== undefined && part.feather < 0) {
      problems.push(`part "${part.name}" has a negative feather`);
    }
    if (part.distance !== undefined && !(part.distance > 0 && part.distance < 20)) {
      problems.push(`part "${part.name}" drifts a distance outside 0–20 %`);
    }
    if (!/^[a-z][a-z0-9-]*$/.test(part.name)) {
      problems.push(`part "${part.name}" needs a lowercase name usable as a file name`);
    }
  }
  if (animation.paperSample !== undefined && !bandInside(animation.paperSample)) {
    problems.push('the paper sample is empty or outside the scan');
  }
  animation.writing.forEach((band, index) => {
    if (!bandInside(band)) {
      problems.push(`writing band ${String(index)} is empty or outside the scan`);
    }
  });
  return problems;
}
