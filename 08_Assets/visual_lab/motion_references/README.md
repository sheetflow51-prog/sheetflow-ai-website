# Motion References — Annotated motion breakdowns

> Where we reverse-engineer the movement language of sites and products that move better than ours.

---

## The breakdown framework

Every motion observation is captured in this format:

```
**Source**: linear.app (2026-05-06)
**Trigger**: scroll into Features section
**Layers** (top → bottom):
  - kicker text — fade up, +12px, blur 8→0, 400ms, ease (0.16,1,0.3,1), delay 0
  - headline — fade up, +28px, blur 12→0, 700ms, same ease, delay 80ms
  - sub — fade up, +16px, 600ms, same ease, delay 200ms
  - card row — stagger 80ms each, 600ms each, scale 0.96→1
**Total scene length**: ~1100ms
**What it does emotionally**: Builds anticipation, then resolves with a quick, confident card cascade
**Risk if copied directly**: Stagger delay > 100ms feels slow; we capped at 80ms
```

The three things to capture every time:
1. **Easing curves** (cubic-bezier, named ease, or a frame-by-frame description)
2. **Stagger** (between-item delay)
3. **Layer choreography** (which thing leads, which follows)

---

## Current observations

### Stripe — section reveals
- **Source**: stripe.com (homepage, 2026-04-28)
- **Pattern**: Headlines reveal with translation only (~16px), no scale, no rotate. Every other layer (sub, ctas, illustration) trails by exactly 100ms.
- **Easing**: Looks like cubic `(0.2, 0.8, 0.2, 1)` — exit-out style, no bounce.
- **Why it works**: The motion vocabulary is tiny. One verb (translate). One delay (100ms). The brand reads as "calm" because the system reads as "small."
- **SheetFlow status**: Adopted in `SectionHeader.tsx`. We allow blur 8→0 because dark UIs need a focus cue translation alone can't provide.

### Linear — page transitions
- **Source**: linear.app (any nav between marketing pages)
- **Pattern**: Old page fades + blurs ~8px, exit duration 250ms; new page enters from y+12 with blur 12→0, 350ms. Net total: 600ms.
- **Why it works**: The blur sells "this is a real surface, not a teleport." It also masks layout shift if any exists.
- **SheetFlow status**: Reproduced in `LoadingScreen.tsx` (clip-path collapse on exit) and noted for future page transitions.

### Apple — hero hold
- **Source**: apple.com/iphone (hero section)
- **Pattern**: After the hero image lands, the device floats with a 6-second sine breath at ±2px. Headline doesn't move at all.
- **Why it works**: The static text vs. moving subject creates a focal hierarchy that rewards continued looking — most other sites would re-trigger micro-animations on scroll, breaking that hold.
- **SheetFlow status**: Adopted as the AI core's Float wrapper (R3F `Float` with low intensity).

### Vercel — globe rotation handoff
- **Source**: vercel.com (homepage globe)
- **Pattern**: Globe rotates at constant velocity. As the user scrolls, the globe also receives a slight scroll-driven extra rotation, creating "the page is steering it."
- **Why it works**: Constant ambient motion = aliveness. Scroll-coupled motion = agency. Together: feels reactive without being pushy.
- **SheetFlow status**: Adopted. Hero AI Core has a low ambient breath + mouse-driven orbit + scroll-driven Y parallax (`Parallax.tsx`).

---

## Anti-patterns observed

- **Bounce on entry** — almost always reads as cheap. Save spring for the *return* of an interactive element (e.g. magnetic button release), never the first appearance of content.
- **Stagger > 120ms between siblings** — feels slow at content scale; cards visibly arrive late.
- **Multiple eases in one scene** — confuses the rhythm. One scene, one ease.
- **Animation that depends on the user noticing it** — if it has to be observed to make sense, it's decoration. Cut it.

---

*See also: `/05_Motion_References/` for the prescriptive timing system.*
