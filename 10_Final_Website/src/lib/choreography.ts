/**
 * Motion Choreography Engine — the Visual OS's timing authority.
 *
 * ## Why this exists alongside `lib/motion.ts`
 *
 * `motion.ts` is the **JavaScript** motion language: bezier tuples and second
 * values in the shapes framer-motion wants. It is correct and unchanged.
 *
 * `VISUAL_DNA_V2.md` § 7.2 moves scroll-coupled and ambient motion out of
 * JavaScript entirely — CSS scroll-driven animations run on the compositor and
 * cost no bundle — so the timing decisions now have to be expressible in CSS
 * too, and the two must not drift. This module is the shared source: it exports
 * the same curve in CSS syntax, and it owns the one calculation that has been
 * hand-derived in three separate components so far.
 *
 * Ships no runtime beyond consts and one pure function.
 */

import { EASE, EASE_SPRING, DUR, STAGGER } from '@/lib/motion';

/** The house curves, in CSS syntax. Same numbers as `motion.ts`, by construction. */
export const CSS_EASE = {
  cinematic: `cubic-bezier(${EASE.join(',')})`,
  spring: `cubic-bezier(${EASE_SPRING.join(',')})`,
  /** Slow-in slow-out. Ambient breathing only — never for a reveal. */
  intelligence: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

/** `VISUAL_DNA_V2.md` § 7.1 — the three duration bands, in ms. */
export const BAND = {
  micro: { min: 100, max: 250 },
  reveal: { min: 600, max: 1000 },
  cinematic: { min: 1100, max: 1600 },
} as const;

export { DUR, STAGGER };

export interface Cadence {
  /** Full cycle length, seconds. */
  cycle: number;
  /** Delay between adjacent signals, seconds. */
  step: number;
}

/**
 * The one-signal-in-flight solver.
 *
 * `VISUAL_DNA_V2.md` § 7.1 caps simultaneous active motion at three per
 * viewport. A rail with N travelling packets blows that instantly unless the
 * stagger is chosen so that each packet has finished before the next departs.
 *
 * The rule is simply `step = cycle / count`: with N signals evenly spaced
 * across one cycle, exactly one is mid-flight at any moment, provided each
 * signal's visible portion is shorter than a step. Every travelling signal on
 * this site already obeys it, and every one of them derived it by hand:
 *
 *   Automation Universe   6 beams  × 0.53s ≈ 3.2s cycle
 *   Infrastructure bus    6 stubs  × 0.60s  = 3.6s cycle
 *   Workflow glyph        4 links  × 0.42s ≈ 2.8s cycle
 *
 * Three hand-derivations of one formula is two too many, and the fourth is
 * where someone rounds it wrong and four packets fly at once.
 *
 * @param count  number of signals on the rail
 * @param cycle  full cycle length in seconds
 */
export function cadence(count: number, cycle: number): Cadence {
  if (count <= 0) return { cycle, step: 0 };
  return { cycle, step: Math.round((cycle / count) * 100) / 100 };
}

/**
 * Per-index reveal delay for a staggered group, in seconds.
 *
 * Capped deliberately. An un-capped stagger on a long list makes the last item
 * arrive a second and a half after the first, which stops reading as one
 * gesture and starts reading as a slow page. Six steps is the ceiling; beyond
 * that the group re-uses the last delay.
 */
export function stagger(index: number, step: number = STAGGER): number {
  return Math.min(index, 6) * step;
}
