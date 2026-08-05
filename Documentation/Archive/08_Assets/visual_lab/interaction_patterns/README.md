# Interaction Patterns

> The micro-physics of "this UI feels alive."

---

## The library we ship

| Pattern | Component | What it feels like |
|---|---|---|
| **Magnetic hover** | `motion/Magnetic.tsx` | Buttons drift toward the cursor and overshoot back to rest |
| **Depth-reactive tilt** | `motion/TiltCard.tsx` | Cards rotate toward the cursor with a soft radial highlight |
| **Mouse-tracked highlight** | `lib/hooks/useMouseTrack.ts` + `.feature-card` | A radial sheen follows the cursor inside cards |
| **Cursor variant on hover** | `providers/CustomCursor.tsx` | Ring expands and shifts color on interactive elements |
| **Scroll-driven parallax** | `motion/Parallax.tsx` | Elements drift on Y as the section scrolls |
| **GSAP scroll reveal** | `motion/ScrollReveal.tsx` | Children fade up + de-blur when the wrapper enters view |

---

## The physics rules we follow

### 1. Spring, never linear (for return motion)
A magnetic button drifts toward the cursor with a spring (stiffness 220, damping 22, mass 0.6). Linear easing on return reads as cheap; spring reads as physical.

### 2. Lerp, never spring (for cursor tracking)
The cursor itself uses a flat lerp coefficient (0.14 ring, 0.40 dot). A spring on cursor tracking causes oscillation — the dot starts vibrating around the cursor position. Lerp avoids that.

### 3. Reduced motion is a hard kill switch, not a slow-mo
When `prefers-reduced-motion: reduce` is set:
- Magnetic disables completely (no drift)
- TiltCard disables completely (no rotation)
- Parallax disables completely (no Y travel)
- Reveals snap to visible (no animation)

We do *not* simply slow these down. Halving the duration is still motion sickness for someone with vestibular disorder.

### 4. Touch devices get the dignified version
On `pointer: coarse`:
- Custom cursor disabled
- Magnetic disabled (there's no cursor to chase)
- TiltCard disabled (no hover state)
- Parallax kept (scroll-based, not pointer-based)

These checks live in `lib/utils.ts` (`isTouchDevice`, `prefersReducedMotion`).

---

## Micro-interactions we still have to ship

### Click signal burst
On primary CTA click, a 12-particle starburst from the click point. Documented in `04_3D_Concepts/particles/particle_philosophy.md`. Implementation pending.

### Live data tooltip
On stat counter hover, a small tooltip appears with the data source. Pending.

### Section handoff (the "cinematic seam")
Currently, sections transition with a subtle `<Divider />` line. The next polish pass should make the divider react to scroll velocity — slow scroll = imperceptible line, fast scroll = the line momentarily glows as a "scene break" cue. Not yet built.

### Hover-into-deep-state
On `.card-interactive` hover for >1.5s, the card could elevate further (lift to 8px, glow intensifies). Currently we stop at the first tier. Worth prototyping.

---

## Anti-patterns that look interactive but aren't

- **Random hover scale on everything.** Reads as "the dev discovered :hover."
- **Animated cursor trails.** Cool for 3 seconds, exhausting for 30.
- **Hover-trigger sound effects.** Always rejected on a marketing site.
- **Click-to-replay animation buttons.** "Click to see the animation again" → the animation isn't important enough to be primary then.
- **Particle bursts on every click.** Reserve for the most consequential clicks (primary CTA, success state).

---

## The cardinal rule

> **Interactivity costs attention. Spend it on actions that matter.**

Every magnetic, every tilt, every glow is an attention spend. Use them on:
- Primary CTAs
- Cards the user is meant to consider individually
- Status indicators that prove the system is alive

Do *not* use them on:
- Body text
- Footer links
- Navigation labels (we use a quiet color shift only)
- Card grids where the user is supposed to scan, not consider

---

*Hooks live in `src/lib/hooks/`. Motion components live in `src/components/motion/`.*
