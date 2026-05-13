/**
 * SheetFlow AI — Motion Operating System
 *
 * Plug-and-play Framer Motion variants + GSAP timelines that inherit
 * the cinematic Constitution. Every motion in any future asset (web,
 * dashboard, app, ad, reel) routes through these primitives.
 *
 * The motion vocabulary is exactly five verbs:
 *   ENTER · SETTLE · BREATHE · TRAVEL · TRACE
 *
 * If a proposed motion is not one of these, it is not in the system.
 */

import type { Variants, Transition } from 'framer-motion';
import { tokens } from '../01_design-tokens/tokens';

const { duration, easing } = tokens;
const ms = (n: number) => n / 1000;

// ============================================================================
// SHARED TRANSITIONS
// ============================================================================

export const transition = {
  cinematic: (d: number = duration.scene): Transition => ({
    duration: ms(d),
    ease: easing.cinematic,
  }),
  spring: (d: number = duration.base): Transition => ({
    duration: ms(d),
    ease: easing.spring,
  }),
  intelligence: (d: number = duration.breath): Transition => ({
    duration: ms(d),
    ease: easing.intelligence,
  }),
  stagger: (
    childMs: number = duration.scene,
    staggerMs: number = duration.stagger,
    delayMs: number = 0
  ): Transition => ({
    duration: ms(childMs),
    ease: easing.cinematic,
    delayChildren: ms(delayMs),
    staggerChildren: ms(staggerMs),
  }),
} as const;

// ============================================================================
// VERB 1 — ENTER (translate up + fade + de-blur)
// ============================================================================

export const enter = {
  /** Standard section reveal — body content, cards, copy */
  base: {
    hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: transition.cinematic(duration.scene),
    },
  } satisfies Variants,

  /** Headline reveal — slower, cinematic, more travel */
  headline: {
    hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: transition.cinematic(900),
    },
  } satisfies Variants,

  /** Monumental — for cinematic moments (Awakening, Final CTA) */
  monumental: {
    hidden: { opacity: 0, y: 60, scale: 0.96, filter: 'blur(12px)' },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: transition.cinematic(duration.cinematic),
    },
  } satisfies Variants,

  /** Subtle — kicker, small text, dividers */
  whisper: {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: transition.cinematic(duration.reveal),
    },
  } satisfies Variants,
} as const;

// ============================================================================
// VERB 2 — SETTLE (overshoot + decay)
// ============================================================================

export const settle = {
  /** Click bounceback */
  click: {
    initial: { scale: 1 },
    pressed: { scale: 0.97, transition: transition.spring(duration.fast) },
    released: { scale: 1, transition: transition.spring(duration.base) },
  } satisfies Variants,

  /** Magnetic settle — return to rest after cursor leaves */
  magnetic: {
    rest: {
      x: 0,
      y: 0,
      transition: { type: 'spring', stiffness: 220, damping: 20, mass: 0.6 },
    },
  } satisfies Variants,
} as const;

// ============================================================================
// VERB 3 — BREATHE (sine cycle on scale or opacity)
// ============================================================================

export const breathe = {
  /** Idle hum — ±2% scale, 6s sine */
  idle: {
    animate: {
      scale: [1, 1.02, 1],
      transition: {
        duration: ms(duration.breath),
        ease: easing.intelligence,
        repeat: Infinity,
      },
    },
  } satisfies Variants,

  /** Live pulse — 1 → 0.85 scale + opacity, 2s sine */
  livePulse: {
    animate: {
      scale: [1, 0.85, 1],
      opacity: [1, 0.5, 1],
      transition: {
        duration: ms(duration.pulseLive),
        ease: easing.intelligence,
        repeat: Infinity,
      },
    },
  } satisfies Variants,

  /** Glow breathe — for halo elements */
  glow: {
    animate: {
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: ms(4000),
        ease: easing.intelligence,
        repeat: Infinity,
      },
    },
  } satisfies Variants,
} as const;

// ============================================================================
// VERB 4 — TRAVEL (scroll-coupled translation/rotation)
// ============================================================================

export const travel = {
  /** Parallax depth coefficients — multiply against scroll progress */
  parallax: {
    deep: -0.15,    // far layer, drifts up slowly as you scroll down
    mid: -0.08,
    near: -0.04,
    front: 0,        // text never moves
    foreground: 0.06, // counter-direction for hero ornaments
  },

  /** ScrollReveal threshold — when to fire enter variants */
  reveal: {
    thresholdViewport: 0.8, // 80% in view
    rootMargin: '-10% 0px',
    once: true,             // never re-fire
  },
} as const;

// ============================================================================
// VERB 5 — TRACE (path-draw via strokeDasharray)
// ============================================================================

export const trace = {
  /** SVG path-draw — divider, connector lines */
  draw: {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: ms(duration.cinematic), ease: easing.cinematic },
        opacity: { duration: ms(duration.fast) },
      },
    },
  } satisfies Variants,

  /** Bracket reveal — corner brackets draw in from inside corner */
  bracket: {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number = 0) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: ms(duration.scene), ease: easing.cinematic },
        opacity: { duration: ms(duration.fast) },
        delay: ms(i * duration.stagger),
      },
    }),
  } satisfies Variants,
} as const;

// ============================================================================
// CHOREOGRAPHY — section-level orchestration
// ============================================================================

export const choreography = {
  /** Stagger container — children inherit `enter.base` */
  staggerContainer: {
    hidden: {},
    visible: {
      transition: transition.stagger(),
    },
  } satisfies Variants,

  /** Stagger container with delay (for delayed sections) */
  staggerDelayed: (delayMs: number) =>
    ({
      hidden: {},
      visible: { transition: transition.stagger(duration.scene, duration.stagger, delayMs) },
    }) satisfies Variants,

  /** Section handoff — outgoing dim + incoming wake */
  handoff: {
    outgoing: {
      opacity: [1, 0.6],
      y: [0, -20],
      transition: transition.cinematic(duration.reveal),
    },
    incoming: {
      opacity: [0.6, 1],
      y: [20, 0],
      transition: transition.cinematic(duration.scene),
    },
  },
} as const;

// ============================================================================
// HOVER CHOREOGRAPHY — by interaction tier
// ============================================================================

export const hover = {
  /** Tier 1: DECISION — primary CTAs (magnetic + glow + spring) */
  decision: {
    rest: { scale: 1, boxShadow: tokens.glow.sm },
    hover: {
      scale: 1.02,
      boxShadow: tokens.glow.lg,
      transition: transition.cinematic(duration.base),
    },
    tap: { scale: 0.97, transition: transition.spring(duration.fast) },
  } satisfies Variants,

  /** Tier 2: CONSIDERATION — feature cards (lift + accent border) */
  consideration: {
    rest: { y: 0, boxShadow: tokens.glow.card },
    hover: {
      y: -4,
      boxShadow: tokens.glow.cardHover,
      transition: transition.cinematic(duration.base),
    },
  } satisfies Variants,

  /** Tier 3: SCAN — feature lists (color shift only) */
  scan: {
    rest: { color: tokens.color.ink[300] },
    hover: {
      color: tokens.color.ink[100],
      transition: transition.cinematic(duration.micro),
    },
  } satisfies Variants,

  /** Tier 4: GLANCE — body text. NO interaction. */
  glance: undefined,
} as const;

// ============================================================================
// ENVIRONMENTAL MOTION — atmosphere
// ============================================================================

export const environmental = {
  /** Aurora drift — radial gradients tracked to cursor */
  aurora: {
    cursorLerp: tokens.atmosphere.aurora.cursorLerp,
    idleDrift: { duration: ms(20000), ease: 'linear', repeat: Infinity },
  },

  /** Particle field — passive atmospheric particles */
  particles: {
    densityByBreakpoint: tokens.breakpoint.atmosphereDensity,
    velocityRange: { min: 0.05, max: 0.15 },
    sizeRange: { min: 1, max: 2.5 },
    opacityRange: { min: 0.2, max: 0.6 },
  },

  /** Scan-line slow drift on holographic surfaces */
  scanDrift: {
    animate: { backgroundPositionY: ['0px', '4px'] },
    transition: { duration: ms(3000), ease: 'linear', repeat: Infinity },
  },
} as const;

// ============================================================================
// EMOTIONAL PACING PRESETS — chapter-level rhythm
// ============================================================================

export const pacing = {
  /** Awakening — cinematic flourish, slow then steady */
  awakening: {
    headlineDelay: 400,
    subheadDelay: 900,
    ctaDelay: 1300,
    childDuration: duration.cinematic,
    stagger: 120,
  },

  /** Ambient — steady, non-startling (mid-page) */
  ambient: {
    headlineDelay: 0,
    subheadDelay: 100,
    ctaDelay: 200,
    childDuration: duration.scene,
    stagger: duration.stagger,
  },

  /** Descent — intensifying, deliberate */
  descent: {
    headlineDelay: 200,
    subheadDelay: 500,
    ctaDelay: 800,
    childDuration: duration.scene,
    stagger: 100,
  },

  /** Final close — slow inhale before the CTA lands */
  finalClose: {
    headlineDelay: 300,
    subheadDelay: 800,
    ctaDelay: 1200,
    childDuration: duration.cinematic,
    stagger: 140,
  },
} as const;

// ============================================================================
// REDUCED-MOTION CONTRACT — kill switch, never slow-mo
// ============================================================================

export const reducedMotion = {
  /** Apply with: variants={shouldReduceMotion ? reducedMotion.skip : enter.base} */
  skip: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0 } },
  } satisfies Variants,

  /** Disable: cursor, particles, breath, parallax, lenis */
  disabled: ['cursor', 'particles', 'breathe', 'parallax', 'lenis', 'magnetic'] as const,
} as const;

// ============================================================================
// EXPORT
// ============================================================================

export const motion = {
  transition,
  enter,
  settle,
  breathe,
  travel,
  trace,
  choreography,
  hover,
  environmental,
  pacing,
  reducedMotion,
} as const;

export type Motion = typeof motion;
export default motion;
