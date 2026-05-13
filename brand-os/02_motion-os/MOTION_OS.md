# SheetFlow Brand OS — Phase 2: Motion Operating System

> Motion is not decoration. Motion is *how the system reveals its intelligence.*
>
> Source of truth: [`motion.ts`](./motion.ts) · Tokens: [`../01_design-tokens/tokens.ts`](../01_design-tokens/tokens.ts)

---

## The five-verb law

Every motion in any SheetFlow asset — web, dashboard, app, ad, reel — is one of exactly **five verbs**. If a proposed motion does not fit, it is rejected.

| Verb | Form | When |
|---|---|---|
| **ENTER** | translate up + fade + de-blur | First appearance of any element on screen |
| **SETTLE** | overshoot + decay (spring) | Return-to-rest after interaction |
| **BREATHE** | sine cycle on scale or opacity | Idle, ambient, "alive" indicators |
| **TRAVEL** | scroll-coupled translation/rotation | Camera dolly via user scroll |
| **TRACE** | path-draw (SVG strokeDasharray) | Brackets, dividers, connector lines |

Verbs are nouns, too: every motion file is named for its verb.

---

## The one-second universe

```
micro-interaction      100–250ms
scene reveal           600–1000ms
cinematic moment      1100–1600ms ← absolute ceiling
```

Beyond 1600ms is performance, not interface. Performance lives in video, not on a website.

---

## The two-and-a-half curve doctrine

```ts
easing.cinematic     // (0.16, 1, 0.3, 1)        — almost everything
easing.spring        // (0.34, 1.56, 0.64, 1)    — return-to-rest only
easing.intelligence  // (0.4, 0, 0.2, 1)         — ambient breath only
```

The half-curve is `intelligence`. It exists for one reason — to make idle motion feel *thoughtful* — and is not used for any interactive event.

---

## Stagger cadence

`80ms`. Universal. Not per-component, not "feels right" — encoded once in `duration.stagger` and inherited everywhere. Apple's law is 100ms; on dark UI we found the eye reads 20% faster, so we accelerate.

---

## Hover choreography by tier

The most-violated rule in any design system. Each interactive element is exactly one tier — never two:

| Tier | Surface | Treatment |
|---|---|---|
| **Decision** | Primary CTAs | `hover.decision` — magnetic + glow + spring |
| **Consideration** | Cards under evaluation | `hover.consideration` — lift + accent border |
| **Scan** | Feature lists, footer links | `hover.scan` — color shift only |
| **Glance** | Body text, captions | **No interaction**. None. |

Mixing tiers is the most common interaction failure mode.

---

## Section choreography

Every section follows the same skeleton:

```tsx
<motion.section
  variants={choreography.staggerContainer}
  initial="hidden"
  whileInView="visible"
  viewport={travel.reveal}
>
  <motion.span variants={enter.whisper}>{kicker}</motion.span>
  <motion.h2  variants={enter.headline}>{title}</motion.h2>
  <motion.p   variants={enter.base}>{body}</motion.p>
  <motion.div variants={enter.base}>{cta}</motion.div>
</motion.section>
```

The container provides stagger; children declare their own enter variant. No section reinvents this pattern.

---

## Emotional pacing presets

Sections inherit a *chapter* (defined in `tokens.atmosphere.chapter`). The chapter selects a `pacing.*` preset which controls headline/sub/CTA delays and stagger cadence.

```
chapter        headlineDelay  subDelay  ctaDelay  childMs   stagger
────────────────────────────────────────────────────────────────────
awakening         400           900      1300     1200      120
ambient             0           100       200      900       80
descent           200           500       800      900      100
finalClose        300           800      1200     1200      140
```

The arc — establish, intensify, resolve — is encoded numerically, not vibes-based.

---

## Environmental motion

Three persistent ambient layers that move *without* user input:

1. **Aurora** — three radial gradients, cursor-tracked at `lerp 0.04`. Idle drift over 20s.
2. **Particles** — passive atmospheric field, density scaled by breakpoint (mobile 40%, tablet 70%, desktop 100%).
3. **Scan drift** — holographic surfaces drift their scan layer 4px over 3s, linear.

These three together are the *atmosphere clock*. They are never disabled except by reduced-motion.

---

## Section handoff

Between adjacent sections, a 1px gradient divider draws + the outgoing section dims slightly + incoming wakes. This is the brand's "chapter break" — implemented in `choreography.handoff`. Never a hard cut.

---

## Reduced-motion contract

Reduced motion is a **kill switch**, never slow-mo. Half-speed motion is still vestibular hostile.

When `prefers-reduced-motion: reduce`:

```ts
reducedMotion.disabled = ['cursor', 'particles', 'breathe', 'parallax', 'lenis', 'magnetic']
```

The site remains functional and beautiful at standstill. Headlines fade in at `duration: 0`. The page is *static* — and the static state already passes the static-first test (Rule 4 of the Constitution).

---

## Total simultaneous motion budget

**Three active motions at any time. Ever.**

Ambient motion (breathing badges, drifting aurora) counts at half-weight. Active motion (reveals, magnetic hover, scroll-pinned scenes) counts at full weight. If a screen has more than three things actively moving, the screen has failed.

---

## Cross-platform mapping

| Web | Mobile (Reanimated) | After Effects | Lottie |
|---|---|---|---|
| `enter.headline` | `withTiming(value, { duration: 900, easing })` | Bezier(0.16,1,0.3,1) keyframe | Cubic bezier values |
| `breathe.livePulse` | `withRepeat(withTiming(...))` | Loop expression | Repeat enabled |
| `hover.decision` | `Pressable` + `useAnimatedStyle` | n/a | n/a |
| `trace.bracket` | `Skia` path with `Length` clip | Trim Paths | Path animation |

The vocabulary is identical across platforms. Only the runtime adapter changes.

---

## Adding new motion

A new motion is acceptable only if:

1. It is one of the five verbs (or it is rejected).
2. It uses one of the three approved curves (or it is rejected).
3. It fits within `duration.cinematicMax` (or it is rejected).
4. It composes from existing primitives in `motion.ts` (or it is moved into `motion.ts` first).
5. The PR description states *which feeling* on the user it produces (Awakening / Descent / Invitation / Intelligence — see DNA §10.3).

If any answer is "no," the motion is wrong.
