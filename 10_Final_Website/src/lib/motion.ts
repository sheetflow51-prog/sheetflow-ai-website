/**
 * The house motion language, in one place.
 *
 * ## Why this module exists
 *
 * Before RC2, `[0.16, 1, 0.3, 1]` appeared **27 times across 11 files** as an
 * inline literal, alongside three other spellings of the same curve:
 * `ease-cinematic` in `tailwind.config.ts`, `sheetflow.cinematic` registered
 * with GSAP in `lib/gsap.ts`, and `cubic-bezier(0.16,1,0.3,1)` in
 * `globals.css`. Durations were similarly ad hoc — 0.5s, 0.6s, 0.7s, 0.8s and
 * 0.9s all appeared as "the reveal duration", chosen per component.
 *
 * Nothing rendered wrong. It was a drift surface: the next person to add a
 * section picks a fifth spelling and a sixth duration, and the language decays
 * one commit at a time until "the site's motion" is a description of history
 * rather than of a decision.
 *
 * ## What it does not do
 *
 * It does not change any timing. Every call site that now imports `EASE` was
 * already using this exact curve, so adopting it is behaviour-preserving by
 * construction — which is the only reason a refactor like this belongs in a
 * visual-polish phase at all.
 *
 * It also ships no runtime: these are `const` arrays and numbers, tree-shaken
 * into the chunks that reference them. RC2 opened with 9.1 kB of JS headroom
 * and could not have afforded anything else.
 *
 * ## The four spellings that remain, and why
 *
 * CSS, Tailwind, GSAP and framer-motion each need the curve in their own
 * syntax; a single literal cannot serve all four. What this fixes is the
 * **hand-copied** fifth, sixth and seventh instances inside component files.
 * The three platform-level definitions stay where they are, and this file is
 * the record that they are the same curve.
 */

/**
 * The house easing — a strong ease-out that decelerates late.
 *
 * Mirrors `ease-cinematic` (Tailwind), `sheetflow.cinematic` (GSAP) and the
 * `cubic-bezier(0.16,1,0.3,1)` used throughout `globals.css`. Typed as a
 * 4-tuple rather than `number[]` so framer-motion accepts it without a cast.
 */
export const EASE: readonly [number, number, number, number] = [0.16, 1, 0.3, 1];

/** A spring-like overshoot. Buttons and other press affordances only. */
export const EASE_SPRING: readonly [number, number, number, number] = [0.34, 1.56, 0.64, 1];

/**
 * The three reveal durations, in seconds.
 *
 * `fast` for supporting elements (kickers, captions), `base` for body copy and
 * cards, `slow` for headlines and hero-scale entrances. Anything outside these
 * three wants a reason in a comment beside it.
 */
export const DUR = {
  fast: 0.5,
  base: 0.6,
  slow: 0.9,
} as const;

/**
 * Stagger between siblings in a revealed group, in seconds.
 *
 * Matches the 80ms steps in the `.stagger` utility in `globals.css`, so a
 * JS-driven group and a CSS-driven one read as the same gesture.
 */
export const STAGGER = 0.08;

/**
 * The standard "rise and sharpen" reveal, as framer-motion variants.
 *
 * `custom` is the sibling index — pass it through `custom={i}` to stagger a
 * group without a parent orchestrator.
 */
export const revealVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: DUR.slow, ease: EASE, delay: i * STAGGER },
  }),
};
