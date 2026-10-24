# Motion Inventory

> **RC2 deliverable, 2026-08-09.** Every animation the site runs, what drives
> it, when it stops, and what happens under `prefers-reduced-motion: reduce`.
>
> Compiled by enumerating the source, not from memory: `repeat: Infinity`
> occurrences, `animate-*` utility usage, CSS `@keyframes`, and every
> `prefersReducedMotion` guard. Counts below are greppable.

---

## 1. The house language

One curve, three durations, one stagger. Defined once in
[`src/lib/motion.ts`](../10_Final_Website/src/lib/motion.ts) as of RC2.

| Token | Value | Used for |
|---|---|---|
| `EASE` | `cubic-bezier(0.16, 1, 0.3, 1)` | Everything that reveals, moves or settles |
| `EASE_SPRING` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Press affordances only (`.btn`) |
| `DUR.fast` | 0.5 s | Kickers, captions, supporting elements |
| `DUR.base` | 0.6 s | Body copy, cards |
| `DUR.slow` | 0.9 s | Headlines, hero-scale entrances |
| `STAGGER` | 0.08 s | Between siblings in a revealed group |

The same curve necessarily exists in four syntaxes — `ease-cinematic`
(Tailwind), `sheetflow.cinematic` (GSAP), `cubic-bezier(0.16,1,0.3,1)`
(`globals.css`), and `EASE` (framer-motion). What RC2 removed were the **27
hand-copied literals across 11 component files** that were drifting away from
all four.

---

## 2. Continuous motion — runs until the page is closed

These are the expensive ones. **All eight live on the homepage or the global
chrome. No content route added one in RC2, and RC2 added none anywhere.**

| # | What | Where | Driver | Guarded by |
|---|---|---|---|---|
| 1 | Hero CTA sheen sweep | `Hero.tsx` | framer, `repeatDelay: 4.5` | `runMotion` state |
| 2 | Hero scroll-indicator beam | `Hero.tsx` | framer | mounted only when motion OK |
| 3 | Hero bottom-edge signal beam | `Hero.tsx` | framer, `repeatDelay: 1.4` | `runMotion` state |
| 4 | Dashboard ticker + chart pulse | `AIDashboard.tsx` ×2 | framer | `prefersReducedMotion()` |
| 5 | Integrations trunk signal | `AIInfrastructure.tsx` | framer | `flow` gate |
| 6 | Final-CTA ambient pair | `FinalCTA.tsx` ×2 | framer | `prefersReducedMotion()` |
| 7 | Pipeline flow marker | `WorkflowPipeline.tsx` | framer | `prefersReducedMotion()` |
| 8 | Trace node pulse | `Trace.tsx` | framer | `prefersReducedMotion()` |
| 9 | `Breathing` scale loop | `Breathing.tsx` | framer | `prefersReducedMotion()` |

Plus three CSS utilities, all `infinite`:

| Utility | Instances | Where |
|---|---|---|
| `animate-pulse-live` | 4 | live badges, hero status dot |
| `animate-float` | 4 | ambient decoration |
| `animate-shimmer` | 3 | loading/gradient sheens |

Also continuous by nature: the ambient hero video (desktop, non-Save-Data
only), `ParticleField`, `AmbientBackground`, and the Lenis scroll loop — each
behind its own gate in `providers/`.

---

## 3. Scroll-driven motion — runs while scrolling

| What | Where | Driver |
|---|---|---|
| Hero core parallax | `Parallax.tsx` | `useScroll` + `useSpring` |
| Section handoff velocity glow | `SectionHandoff.tsx` | `useVelocity(scrollY)` |
| Section reveals (GSAP) | `ScrollReveal.tsx` | ScrollTrigger, `once: true` |
| Section reveals (framer) | 9 files via `whileInView` | `viewport.once: true` |
| Smooth scroll | `SmoothScroll.tsx` | Lenis |

`once: true` everywhere — no reveal re-fires on scroll-back.

---

## 4. Interaction motion — costs nothing at rest

| What | Where | Trigger |
|---|---|---|
| Magnetic button drift | `Magnetic.tsx` | `mousemove`, non-touch only |
| Card tilt | `TiltCard.tsx` | pointer |
| Feature-card mouse highlight | `.feature-card::before` | `:hover` |
| Card lift + glow | `.card-interactive:hover` | `:hover` |
| Button lift / press | `.btn-primary:hover/:active` | `:hover`, `:active` |
| Arrow nudge | `.btn:hover .arrow` | `:hover` |
| Screenshot scale on work cards | `group-hover:scale-[1.02]` | `:hover` |
| **Glyph connector drift** ⟵ RC2 | `.group:hover .glyph-link` | `:hover` |
| **Glyph node glow** ⟵ RC2 | `.group:hover .glyph-node` | `:hover` |
| Custom cursor | `CustomCursor.tsx` | pointer, `pointer: fine` only |

---

## 5. One-shot motion — plays once, then stops

| What | Where | Duration |
|---|---|---|
| Hero entrance cascade | `Hero.tsx` | 0.9 s, staggered to ~2.0 s |
| Loading screen | `LoadingScreen.tsx` | ≤ 0.9 s |
| Awakening sequence | `Awakening.tsx` | one-shot |
| Bracket draw-in | `Brackets.tsx` | 0.9 s |
| Nav sheet open/close | `Navigation.tsx` | 0.25–0.5 s |
| **Glyph panel cascade** ⟵ RC2 | `.glyph-panel` | 0.62 s + 110 ms × index |

---

## 6. What RC2 added, in full

Two entries, both listed above:

1. **`.glyph-panel` cascade** — one-shot, CSS, on the case-study system panel.
   Nodes and connectors rise and fade in over 620 ms with a 110 ms per-index
   delay. Plays once on load; never repeats. **Five pages** (internal builds).
2. **`.glyph-link` / `.glyph-node` hover state** — CSS, `:hover` only.
   Connector dashes drift at 1.1 s/cycle while a pointer is on the card.
   **Zero cost at rest**, which is why five of them can sit on `/work`.

### What RC2 deliberately did not add

| Not added | Why |
|---|---|
| Continuous animation on any content route | `/work` measures 64 on mobile; the homepage 52. Neither has room. |
| SVG `stroke-dashoffset` path-draw | Repaints the full path bounding box every frame, ×10 cards. |
| Entrance reveals on `/work` and `/work/[slug]` | An `opacity: 0` headline **delays LCP by the reveal delay**, and `/work` already measures LCP at 4.7 s. Interaction motion was used instead. Recorded as a partially-closed finding in `RC2_VISUAL_AUDIT.md` § V4. |
| Page transitions | Needs a client wrapper on every route, and risks the CLS 0 that RC1 earned. |
| Three.js / WebGL case-study visuals | Mounting a renderer to draw four boxes on a page scoring 64. |

---

## 7. Reduced motion

**21 files** carry an explicit guard. The coverage is layered:

1. **`MotionProvider`** sets `MotionConfig reducedMotion="user"` at the layout
   root — covers every framer `animate` / `whileInView`.
2. **`prefersReducedMotion()`** in `lib/utils.ts` — covers the gap
   `MotionConfig` does not: `useTransform`/`useSpring` values applied through a
   `style` prop, which bypass `MotionConfig` entirely. `Parallax` ran
   unguarded for exactly this reason until it was fixed.
3. **A global CSS rule** in `globals.css` collapses `animation-duration` and
   `transition-duration` to 0.01 ms and forces `animation-iteration-count: 1`.

### The gap RC2 found and closed

That global rule collapses **duration** but leaves **`animation-delay`
untouched**. Any staggered CSS animation therefore still waits out its full
delay before snapping to its end state — for the glyph panel, up to **440 ms of
invisible content** for a visitor who asked for less motion, which is the exact
failure reduced-motion exists to prevent.

`globals.css` now zeroes `animation-delay` for `.glyph-panel` under
`prefers-reduced-motion`, and disables the hover drift outright rather than
running it at 0.01 ms.

**This gap is not unique to the glyph.** Any future staggered CSS animation
will inherit it. The general fix — adding `animation-delay: 0.01ms !important`
to the global rule — was **not** made in RC2, because it would alter timing on
every existing one-shot sequence on the site and RC2 is not the phase to
re-time the homepage. Recorded as a remaining opportunity.

### Verified, not assumed

`tests/e2e/a11y.spec.ts` runs axe across **11 route/motion combinations**,
including reduced-motion variants. The RC2 result is recorded in
`RC2_SUMMARY.md`.
