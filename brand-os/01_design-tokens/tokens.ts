/**
 * SheetFlow AI — Design Tokens (Source of Truth)
 *
 * Production-grade tokens derived from the SheetFlow Visual DNA Constitution.
 * Consumed by:
 *   - tailwind.config.ts (web)
 *   - React Native StyleSheet (mobile)
 *   - Figma variable sync (design)
 *   - Motion graphics (After Effects JSON export)
 *   - PDF / presentation templates
 *
 * RULE: Never hardcode a value that exists here. If a value is missing,
 *       add it to the system; do not invent a one-off.
 */

// ============================================================================
// 1. COLOR TOKENS
// ============================================================================

export const color = {
  // The canvas
  void: '#060608',

  // Surfaces — Z-stack ascending from canvas
  surface: {
    0: '#060608', // canvas
    1: '#0A0B0F', // base card
    2: '#0F1117', // raised card
    3: '#141720', // panel
    4: '#1A1F2E', // floating modal / popover
  },

  // Ink — type, icons, dividers
  ink: {
    50: '#FFFFFF', // pure white — type only
    100: '#F5F7FA', // headlines
    200: '#D6DCE8', // body strong
    300: '#A0A8BC', // body
    400: '#6B7490', // muted
    500: '#3D4460', // hint
    600: '#2A3045', // dividers strong
    700: '#1E2435', // dividers
    800: '#141720', // surface alias
    900: '#0F1117',
    950: '#0A0B0F',
  },

  // Intelligence — the brand's living color
  accent: {
    DEFAULT: '#6366F1', // Indigo 500 — primary
    bright: '#818CF8', // Indigo 400 — gradient start
    light: '#A5B4FC', // Indigo 300 — quiet hover
    deep: '#4F46E5', // Indigo 600 — pressed
    glow: 'rgba(99, 102, 241, 0.15)', // halo base
  },

  violet: {
    DEFAULT: '#8B5CF6',
    bright: '#A78BFA', // gradient mid
    deep: '#7C3AED',
  },

  cyan: {
    DEFAULT: '#06B6D4', // gradient end / horizon
    bright: '#22D3EE',
  },

  // Status signals — never decoration
  signal: {
    success: '#10B981', // live / watching
    warning: '#F59E0B',
    danger: '#F43F5E',
    info: '#06B6D4',
  },
} as const;

// ============================================================================
// 2. ATMOSPHERE TOKENS
//    The four-layer stack: VOID → AIR → FILM → HUM → FRONT
// ============================================================================

export const atmosphere = {
  // AIR — aurora wash, cursor-tracked
  aurora: {
    keyAlpha: 0.18,    // indigo blob, top-left
    fillAlpha: 0.12,   // violet blob, bottom-right
    rimAlpha: 0.06,    // cyan horizon
    cursorLerp: 0.04,  // mouse follow strength
  },

  // FILM — fractal noise grain
  grain: {
    alpha: 0.035,
    blendMode: 'overlay' as const,
    baseFrequency: 0.9, // SVG fractalNoise
    numOctaves: 3,
  },

  // HUM — pulses & ambient breath
  hum: {
    pulseScaleMin: 0.85,
    pulseScaleMax: 1.0,
    breathScaleAmplitude: 0.02, // ±2%
  },

  // Page chapter atmospheres (the emotional arc)
  chapter: {
    awakening:    { voidPct: 0.80, accentBoost: 1.4, grain: 0.045 },
    ambient:     { voidPct: 0.65, accentBoost: 1.0, grain: 0.035 },
    descent:      { voidPct: 0.55, accentBoost: 1.2, grain: 0.040 },
    quietMiddle:  { voidPct: 0.70, accentBoost: 0.7, grain: 0.030 },
    finalClose:   { voidPct: 0.75, accentBoost: 1.5, grain: 0.045 },
  },
} as const;

// ============================================================================
// 3. SPACING TOKENS — doubling scale
// ============================================================================

export const space = {
  px: 1,
  '0_5': 2,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
  24: 96,
  32: 128,
  48: 192,
  64: 256,
} as const;

export const layout = {
  sectionPaddingMin: 80,    // px
  sectionPaddingMax: 160,
  headlineIsolationFactor: 2,  // ≥2× line-height of breathing room
  cardGap: 12,                 // never 8, never 16
  headlineToSub: 28,
  subToCta: 40,
  bodyLineHeight: { min: 1.55, max: 1.65 },
  containerMaxWidth: 1280,
} as const;

// ============================================================================
// 4. GLOW TOKENS
// ============================================================================

export const glow = {
  none: 'none',
  sm:    '0 0 20px rgba(99, 102, 241, 0.15)',
  DEFAULT: '0 0 40px rgba(99, 102, 241, 0.20)',
  lg:    '0 0 80px rgba(99, 102, 241, 0.30)',
  xl:    '0 0 120px rgba(99, 102, 241, 0.40)',

  violet: '0 0 60px rgba(139, 92, 246, 0.25)',
  cyan:   '0 0 60px rgba(6, 182, 212, 0.20)',
  success:'0 0 24px rgba(16, 185, 129, 0.30)',

  // Composite shadows
  card:       '0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 24px rgba(0,0,0,0.3)',
  cardHover:  '0 1px 0 rgba(255,255,255,0.08) inset, 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.10), 0 0 40px rgba(99,102,241,0.10)',
  cardPress:  '0 1px 0 rgba(255,255,255,0.05) inset, 0 4px 12px rgba(0,0,0,0.4)',

  innerHighlight: '0 1px 0 rgba(255,255,255,0.08) inset',
} as const;

// ============================================================================
// 5. TIMING TOKENS — the one-second universe
// ============================================================================

export const duration = {
  instant: 0,
  micro: 100,    // hover settle
  fast: 180,     // click bounce
  base: 250,     // micro-interaction max
  reveal: 600,   // section enter (min)
  scene: 900,    // headline reveal
  sceneMax: 1000,
  cinematic: 1200, // cinematic descent
  cinematicMax: 1600, // ABSOLUTE CAP

  // Ambient
  pulseLive: 2000,    // 2s sine
  breath: 6000,       // 6s sine
  shimmer: 3000,
  float: 6000,

  // Stagger
  stagger: 80,        // universal element stagger
} as const;

// ============================================================================
// 6. EASING TOKENS — exactly 3 curves, no exceptions
// ============================================================================

export const easing = {
  /** Primary scene + scroll motion. Almost everything uses this. */
  cinematic: [0.16, 1, 0.3, 1] as const,

  /** Return-to-rest after interaction. Spring overshoot. */
  spring: [0.34, 1.56, 0.64, 1] as const,

  /** Ambient breathing only. Slow-in, slow-out. */
  intelligence: [0.4, 0.0, 0.2, 1.0] as const,

  // CSS strings
  cinematicCss: 'cubic-bezier(0.16, 1, 0.3, 1)',
  springCss: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  intelligenceCss: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
} as const;

// ============================================================================
// 7. BLUR TOKENS
// ============================================================================

export const blur = {
  none: '0px',
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px',
  '2xl': '40px',

  // Backdrop filters (glass surfaces)
  glassLight:  'blur(12px) saturate(140%)',
  glassMedium: 'blur(16px) saturate(160%)',
  glassDeep:   'blur(24px) saturate(180%)',
} as const;

// ============================================================================
// 8. OPACITY SYSTEM — discrete steps
// ============================================================================

export const opacity = {
  hidden: 0,
  ghost: 0.04,    // grain, scan
  whisper: 0.08,
  hint: 0.12,
  quiet: 0.20,
  muted: 0.40,
  base: 0.60,
  strong: 0.80,
  full: 1.0,
} as const;

// ============================================================================
// 9. SIGNATURE GRADIENTS — the brand's color moves
// ============================================================================

export const gradient = {
  /** Headline fade — every monumental headline */
  headline: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.55) 100%)',

  /** Accent gradient — proper-noun emphasis only ("finally alive") */
  accent: 'linear-gradient(135deg, #818CF8 0%, #A78BFA 50%, #06B6D4 100%)',

  /** Aurora ambient atmosphere — page-wide */
  aurora:
    'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(99,102,241,0.18), transparent 60%), ' +
    'radial-gradient(ellipse 60% 50% at 80% 30%, rgba(139,92,246,0.12), transparent 60%), ' +
    'radial-gradient(ellipse 100% 60% at 50% 100%, rgba(6,182,212,0.08), transparent 70%)',

  /** Radial glow halo — around CTAs, AI core */
  radialGlow: 'radial-gradient(circle at center, rgba(99,102,241,0.25), transparent 60%)',

  /** Section handoff — 1px gradient divider */
  divider: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.4) 50%, transparent 100%)',

  /** Vignette close — Final CTA descent */
  vignette: 'radial-gradient(ellipse 100% 80% at 50% 50%, transparent 30%, rgba(6,6,8,0.85) 100%)',

  /** Grid fade — atmospheric overlays */
  gridFade: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
} as const;

// ============================================================================
// 10. SCAN TEXTURE CONSTANTS — holographic surfaces
// ============================================================================

export const texture = {
  /** 4px-repeat horizontal scan — applied via ::after to holographic surfaces */
  scanLine: {
    repeat: 4,           // px
    lineWidth: 1,        // px
    alpha: 0.04,
    color: 'rgba(255,255,255,0.04)',
    css: `repeating-linear-gradient(
      0deg,
      rgba(255,255,255,0.04) 0px,
      rgba(255,255,255,0.04) 1px,
      transparent 1px,
      transparent 4px
    )`,
  },

  /** Page-wide film grain — fractalNoise SVG */
  filmGrain: {
    alpha: 0.035,
    baseFrequency: 0.9,
    numOctaves: 3,
    blendMode: 'overlay' as const,
    svg: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>`,
  },
} as const;

// ============================================================================
// 11. BRACKET GEOMETRY TOKENS — the corner-bracket signature
// ============================================================================

export const bracket = {
  size: { sm: 12, md: 16, lg: 24, xl: 32 },  // arm length
  thickness: { sm: 1, md: 1, lg: 2, xl: 2 }, // stroke width
  inset: 8,                                   // inset from container edge
  color: 'rgba(99,102,241,0.65)',
  glow: '0 0 8px rgba(99,102,241,0.4)',
  cornerRadius: 0,                            // brackets are sharp
} as const;

// ============================================================================
// 12. RADIUS TOKENS
// ============================================================================

export const radius = {
  none: 0,
  xs: 4,
  sm: 6,
  DEFAULT: 8,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 28,
  full: 999,
} as const;

// ============================================================================
// 13. TYPOGRAPHY TOKENS
// ============================================================================

export const typography = {
  family: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
  },

  // Cinematic scale — clamp() for responsive
  scale: {
    monument:  { size: 'clamp(64px, 9vw, 128px)',   leading: 0.95, tracking: '-0.04em', weight: 700 },
    cinematic: { size: 'clamp(48px, 6.5vw, 96px)',  leading: 0.98, tracking: '-0.035em', weight: 700 },
    headline:  { size: 'clamp(36px, 5vw, 64px)',    leading: 1.00, tracking: '-0.03em', weight: 700 },
    subhead:   { size: 'clamp(24px, 3vw, 36px)',    leading: 1.15, tracking: '-0.02em', weight: 600 },
    body:      { size: '17px',                       leading: 1.65, tracking: '0em',      weight: 400 },
    small:     { size: '14px',                       leading: 1.55, tracking: '0em',      weight: 400 },
    kicker:    { size: '11px',                       leading: 1.20, tracking: '0.12em',  weight: 500 }, // mono, uppercase
    code:      { size: '13px',                       leading: 1.50, tracking: '0em',      weight: 500 }, // mono
  },
} as const;

// ============================================================================
// 14. Z-INDEX TOKENS — strict elevation stack
// ============================================================================

export const z = {
  base: 0,
  surface: 10,
  raised: 20,
  sticky: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  toast: 70,
  cursor: 100,   // custom cursor always on top
} as const;

// ============================================================================
// 15. BREAKPOINTS — viewport-aware atmosphere scaling
// ============================================================================

export const breakpoint = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,

  // Atmosphere modifiers — particle density scales down on mobile
  atmosphereDensity: {
    sm: 0.4,
    md: 0.7,
    lg: 1.0,
  },
} as const;

// ============================================================================
// EXPORT — single namespace for ergonomic import
// ============================================================================

export const tokens = {
  color,
  atmosphere,
  space,
  layout,
  glow,
  duration,
  easing,
  blur,
  opacity,
  gradient,
  texture,
  bracket,
  radius,
  typography,
  z,
  breakpoint,
} as const;

export type Tokens = typeof tokens;
export default tokens;
