/**
 * Handcrafted animations of scanned drawings (RF-50 to RF-52, ADR 0004, ADR 0051).
 *
 * A drawing is split into raster layers cut from its scan: a still background and the parts
 * that move. Each moving part is a polygon on the scan, in scan pixels, and turns around a
 * pivot. The background has the moving parts painted out and, where a part uncovers
 * something when it moves, a small repair drawn in ink.
 *
 * "Writing" bands are the handwritten lines that are revealed left to right, once, as if
 * the hand were writing them.
 *
 * The same description drives the layer script (`scripts/animations/`) and the component
 * that stacks the layers, so their positions can never disagree.
 */

/** A point on the scan, in pixels: `[x, y]`. */
export type Point = readonly [number, number];

/**
 * How a part moves while a song plays. The movements themselves are defined once, in CSS
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
}

/** A rectangle on the scan, in pixels. */
export interface Band {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

export interface DrawingAnimation {
  /** The artwork entry this animation brings to life. */
  readonly artworkId: string;
  /** Size of the scan the outlines refer to. */
  readonly width: number;
  readonly height: number;
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

/** CSS position of a writing band over the drawing, as percentages. */
export function bandBox(
  animation: DrawingAnimation,
  band: Band,
): { left: string; top: string; width: string; height: string } {
  return {
    left: percent(band.left, animation.width),
    top: percent(band.top, animation.height),
    width: percent(band.right - band.left, animation.width),
    height: percent(band.bottom - band.top, animation.height),
  };
}

/**
 * Problems in an animation description: parts defined twice or badly named, outlines with
 * fewer than three points, points, pivots or bands outside the scan, motions without a
 * length. An empty list means it is usable.
 */
export function animationProblems(animation: DrawingAnimation): string[] {
  const problems: string[] = [];
  const inside = ([x, y]: Point): boolean =>
    x >= 0 && y >= 0 && x <= animation.width && y <= animation.height;
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
    if (!/^[a-z][a-z0-9-]*$/.test(part.name)) {
      problems.push(`part "${part.name}" needs a lowercase name usable as a file name`);
    }
  }
  animation.writing.forEach((band, index) => {
    if (
      band.left >= band.right ||
      band.top >= band.bottom ||
      !inside([band.left, band.top]) ||
      !inside([band.right, band.bottom])
    ) {
      problems.push(`writing band ${String(index)} is empty or outside the scan`);
    }
  });
  return problems;
}
