# Apple Motion References

> Apple is the strongest reference for this brand. Their patterns are studied closely — not to copy, but to internalize the *grammar*.

---

## What Apple does that nobody else does

### 1. Static-first hero
Apple heroes are *static* on first impression. The product doesn't bounce in. It's already there.

The motion happens after — the headline lifts ~20px after page load with a 700ms cubic ease, the device floats in a 6-second sine breath. **Nothing arrives. Everything settles.**

**Translation**: Our hero AI core uses R3F `Float` (low intensity), and the headline animates from a 32px translate + 8px blur. We resist the urge to "reveal" the core; it just *is*.

### 2. The 100ms law
Apple's stagger between adjacent elements is almost always 100ms. Not 80, not 120. 100.

**Why**: 100ms is the threshold below which sequential motion feels simultaneous. Apple uses it to say "these things are *together*, but not *the same thing*."

**Translation**: Our `SectionHeader` staggers kicker → headline → sub at 80ms. We chose slightly less than Apple's 100ms because dark UI requires faster cohesion (the eye reads dark slower).

### 3. Scroll-locked cinematography
On `/iphone`, the device rotates as you scroll. Not on a fixed scroll-jacked timeline — but proportionally. 1px scroll = ~0.1deg rotation, smoothed via a spring damper (~stiffness 100, damping 30).

**Translation**: Hero's `Parallax` wrapper uses `useScroll` with a spring smoother (stiffness 120, damping 24) — the AI core moves *because* you scroll, not before or after.

### 4. The "settling" motion
When something Apple-animated stops, it doesn't snap. It overshoots ~2-4% and decays.

**Settings**: ~`spring(0.7, 0.5, 0.5)` — overshoot 8%, decay 1.2s.

**Translation**: Our `Magnetic` and `TiltCard` springs use stiffness 220, damping 22 (mass 0.6) — a deliberate, gentle overshoot. Springiness makes things feel real.

### 5. Easing through motion
Apple essentially uses **two eases** site-wide:
- `cubic-bezier(0.4, 0, 0.2, 1)` for entering elements
- `cubic-bezier(0.16, 1, 0.3, 1)` for cinematic reveals

That's it. Two curves for an entire site.

**Translation**: We've adopted both as `sheetflow.enter` and `sheetflow.cinematic` in `lib/gsap.ts`. We added one more (`sheetflow.spring`) for return-to-rest after interactive states. Anything beyond three is a smell.

---

## Apple anti-patterns (why we don't copy everything)

Apple sometimes uses:

- **Parallax-locked horizontal scroll** for product galleries → Beautiful on Apple, often broken everywhere else. Skipped.
- **Letter-by-letter character drops** for headlines → Too "splashy" for our voice. The brand is calm; it doesn't perform.
- **Long video heroes** (autoplay 12s loops) → Heavy bandwidth, high CO₂. Replaced with R3F + canvas particles.

---

## What we've adopted explicitly from Apple grammar

| Apple pattern | Where in our code |
|---|---|
| Headline: translate + blur entry | `Hero.tsx`, `SectionHeader.tsx` |
| Sine-breath floating | R3F `Float` on AI core |
| Cubic-bezier(0.16,1,0.3,1) cinematic ease | `tailwind.config.ts → ease-cinematic`; `gsap.ts → sheetflow.cinematic` |
| 100ms-or-less stagger | `SectionHeader.tsx` (80ms) |
| Scroll-coupled spring (not jack) | `Parallax.tsx` |
| Settling overshoot | `Magnetic.tsx`, `TiltCard.tsx` |

---

*Reference: `/05_Motion_References/gsap/gsap_motion_system.md`*
