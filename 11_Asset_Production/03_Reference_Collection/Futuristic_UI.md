# Futuristic UI References

Interfaces that will still look right in five years.

---

## Anchor references

- **Apple Vision OS** — depth, glass, restraint. The new gold standard.
- **Foundation (TV)** holographic panels — *don't* use the rotating ring tropes,
  but absorb the panel material treatment.
- **Severance Lumon terminal** — clinical UI as character.
- **Devs (FX) algorithm visualizations** — math made cinematic.
- **Linear command palette** — the most copied modern UI pattern, for reason.
- **Stripe checkout** — utility raised to art.
- **Arc browser tabs** — opinionated motion that earned the right to exist.
- **Raycast** — keyboard-first density that breathes.

---

## What to learn

- **Glass needs context.** Frosted panels only work when there's something behind.
- **Type carries the UI.** Geometric sans (Inter, GT America, Söhne) > custom display fonts.
- **Motion explains state, never decorates.** A 240ms ease-out tells the user something happened.
- **Depth via blur, not shadow.** Stack z-layers with backdrop blur for premium feel.
- **One accent color.** The accent earns meaning by being rare.

---

## What to avoid

- Holographic blue grids overlaid on everything
- Circular HUD elements (Iron Man tropes)
- "Scanning" line animations
- Floating menus with no anchor
- Glassmorphism with no light source
- Skeuomorphic chrome (knobs, dials, gauges)
- Excessive iconography (icons for every label)

---

## What fits SheetFlow

- **Layered glass with real depth** — panels that read as glass, not as plastic.
- **Editorial typography** — display sizes, generous tracking on caps.
- **Subtle data visualization** — charts as compositions, not infographics.
- **Hover is a privilege** — restrained hover states. Most things don't react.
- **Empty states that feel intentional** — calm, not apologetic.

---

## Cinematic observations on UI

- A UI feels expensive when **nothing is moving**. Stillness > animation.
- Density is luxury when proportion is right. Density is noise when it isn't.
- Real glass blurs what's behind it AND has its own surface noise. Both.
- The cursor matters. A custom cursor on the right surface elevates everything.
- Loading states are an opportunity. Apple, Linear, and Stripe all treat them as design.

---

## Material recipe for SheetFlow UI surfaces

```
Glass panel:
  background:   rgba(20, 24, 28, 0.55)
  backdrop:     blur(24px) saturate(140%)
  border:       1px solid rgba(255,255,255,0.06)
  inner glow:   inset 0 1px 0 rgba(255,255,255,0.08)
  shadow:       0 32px 80px rgba(0,0,0,0.45)

Solid card:
  background:   #14181C
  border:       1px solid #20262C
  hover lift:   translateY(-2px), shadow grows 18%
```
