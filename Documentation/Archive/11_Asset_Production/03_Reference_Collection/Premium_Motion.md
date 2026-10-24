# Premium Motion References

Motion that earns its presence. If you can remove it without losing meaning,
remove it.

---

## Anchor references

- **Apple keynote scene transitions** — physics-correct, slow, confident.
- **Linear's loading and panel transitions** — the modern benchmark for SaaS motion.
- **Vercel deployment animation** — utility that became a brand moment.
- **Arc browser tab swap** — opinionated, slightly slow, premium feel.
- **Rauno Freiberg's portfolio** — the patron saint of restrained interaction.
- **Family iPhone app launch animation** — texture on simple geometry.

---

## What to learn

- **Easing is identity.** A brand's motion personality lives in its curves.
- **Timing is taste.** 200ms is functional. 320ms with cubic-bezier is premium.
- **Mass and weight matter.** Heavy elements move slower; light ones, snappier.
- **Stagger is dramatic.** 60–80ms stagger across siblings reads as choreography.
- **Spring physics over linear.** Linear is a giveaway you didn't tune it.

---

## SheetFlow motion grammar

| Surface             | Duration | Easing                                     |
|---------------------|----------|--------------------------------------------|
| Micro (button hover)| 180ms    | cubic-bezier(0.32, 0.72, 0.0, 1.0)         |
| Standard (panel in) | 320ms    | cubic-bezier(0.16, 1.0, 0.3, 1.0)          |
| Cinematic (hero)    | 800ms    | cubic-bezier(0.22, 1.0, 0.36, 1.0)         |
| Page transition     | 480ms    | spring(stiffness=240, damping=28)          |

---

## What to avoid

- Bounce easing on professional surfaces (consumer-only)
- Anything labeled "ease" without thinking — that's `cubic-bezier(0.25, 0.1, 0.25, 1)`
  and it screams default
- Linear for anything except progress bars
- Auto-playing carousels
- Parallax that never stops
- Transitions that delay the user from doing what they came to do
- Loading spinners that spin forever
- Scroll-jacking

---

## What fits SheetFlow

- **Reveal-on-scroll** with 80–120ms stagger across siblings
- **Cursor-following highlights** at heavy ease (1.2s cubic-out)
- **Page transitions** as a brand surface, not a hidden detail
- **Subtle floating elements** at 0.06–0.12 rad/s, perlin-noise drift
- **Reduced-motion respect** — everything has a flat fallback

---

## Cinematic observations

- The eye doesn't see motion — it sees **change**. Animate the change, not
  the object.
- The first 100ms of any animation is the personality. The rest is follow-through.
- A great motion designer adds anticipation (a tiny pre-move) that you'd never
  consciously notice.
- "Premium" almost always means "slightly slower than the platform default."
- If two animations fight for attention, kill one. Always.
