# SheetFlow Brand OS — Phase 1: Design Token System

> Tokens are the smallest, most stable unit of the brand. They outlive components, frameworks, and platforms.
>
> Source of truth: [`tokens.ts`](./tokens.ts) · Platform-agnostic mirror: [`tokens.json`](./tokens.json)

---

## Operating principle

**One value, one name, one place.** If a color, duration, or shadow exists in the system, it is referenced — never copied. A hardcoded hex in a component is a brand violation.

The token layer answers: *"what is allowed?"* Components answer: *"how is it composed?"*

---

## Token families

| Family | Purpose | Reference |
|---|---|---|
| **Color** | The palette: void, surface stack, ink scale, intelligence accents, status signals | `color.*` |
| **Atmosphere** | Aurora wash, film grain, hum (pulses), chapter atmospherics | `atmosphere.*` |
| **Spacing** | Doubling scale (4 → 8 → … → 256) + layout constants | `space.*`, `layout.*` |
| **Glow** | Indigo / violet / cyan halos, card shadows, inner highlights | `glow.*` |
| **Timing** | The one-second universe (100ms → 1600ms cap) + ambient cycles | `duration.*` |
| **Easing** | Three approved curves only: `cinematic`, `spring`, `intelligence` | `easing.*` |
| **Blur** | Backdrop blur stack + glass surface presets | `blur.*` |
| **Opacity** | Discrete ladder (`hidden` → `full`) — no improvised alphas | `opacity.*` |
| **Gradient** | The signature color moves: headline fade, accent ramp, aurora, vignette | `gradient.*` |
| **Texture** | 4px scan, fractal-noise grain — the holographic substrate | `texture.*` |
| **Bracket** | Corner-bracket geometry: arm length, stroke, inset, color | `bracket.*` |
| **Typography** | Cinematic scale + family stack (sans / display / mono) | `typography.*` |
| **Z-index** | Strict elevation stack (cursor always wins at 100) | `z.*` |
| **Breakpoint** | Viewport ladder + atmospheric density modifiers | `breakpoint.*` |

---

## Color token contract

The palette is **not negotiable per-feature**. Every color must come from the system.

- **`void` (`#060608`)** — the canvas. Never replaced; only layered over.
- **`surface.0–4`** — Z-stack. A surface at level *n* may only sit atop one at level *n−1*. Glass-on-glass is forbidden.
- **`ink.50–950`** — type and dividers. Body text uses `ink.300`, headlines `ink.50`, muted `ink.400`. Never below `ink.500` for text on `void`.
- **`accent.*`** — indigo. The brand's living signal. `bright` for gradient starts, `deep` for pressed states, `glow` for halo composition.
- **`violet.*`** — secondary intelligence light. Only as gradient-mid or as fill-aurora.
- **`cyan.*`** — horizon light. Only as gradient end-stop or rim aurora.
- **`signal.*`** — status only. **Never decoration.** A green that is not "live" is a bug.

### Forbidden color moves
- Gradients with hard color stops (always include `transparent` waypoints)
- White light from a non-text source (reads as broken)
- Two greens, two indigos, etc. — the ladder defines them

---

## Atmosphere tokens

The four-layer stack is encoded numerically so it can be reproduced across platforms:

```
chapter:    voidPct  accentBoost  grain
─────────────────────────────────────────
awakening    0.80      1.4         0.045
ambient      0.65      1.0         0.035
descent      0.55      1.2         0.040
quietMiddle  0.70      0.7         0.030
finalClose   0.75      1.5         0.045
```

Any scene composed in this OS picks a chapter and inherits these triples. A new section without a chapter assignment is rejected at review.

---

## Timing & easing — the immutable trio

Three curves, no exceptions:

| Token | Bezier | When |
|---|---|---|
| `easing.cinematic` | `(0.16, 1, 0.3, 1)` | All scene reveals, scroll motion, headline appearances |
| `easing.spring` | `(0.34, 1.56, 0.64, 1)` | Return-to-rest after interaction |
| `easing.intelligence` | `(0.4, 0, 0.2, 1)` | Ambient breath only |

Duration tokens enforce the one-second universe — `1600ms` is an absolute ceiling. Anything beyond is cinema, not interface.

---

## Bracket geometry

The corner-bracket is a brand artifact. Its geometry is parameterized:

- `size` — arm length (12 / 16 / 24 / 32px)
- `thickness` — stroke (1 or 2px)
- `inset` — distance from container edge (8px standard)
- `color` — `rgba(99,102,241,0.65)` indigo at 65%
- `cornerRadius` — `0` (brackets are sharp)

Used in: `Brackets`, `SignatureFrame`, future dashboard panels, credential tiles, premium tier callouts.

---

## Scan & grain

Two textures, both mandatory on holographic surfaces:

1. **Scan line** — `4px` repeating linear gradient at `0.04` alpha. Marks a surface as *holographic*.
2. **Film grain** — fractal-noise SVG at `0.035` alpha + `mix-blend-mode: overlay`. Page-wide.

Removing either breaks the brand. They are not optional polish; they are substrate.

---

## Cross-platform mapping

| Token | Web (Tailwind / CSS) | Mobile (RN) | Figma | Motion (AE) |
|---|---|---|---|---|
| `color.accent.DEFAULT` | `bg-accent`, `text-accent` | `colors.accent` | Variable: `accent/default` | Solid color expression |
| `easing.cinematic` | `cubic-bezier(...)` | `Easing.bezier(...)` | n/a | Bezier keyframe |
| `glow.cardHover` | `shadow-card-hover` | `shadowColor + offset` | Effect: drop shadow | Layer style |
| `texture.scanLine` | `::after` repeating gradient | `<LinearGradient>` tile | Pattern fill | Track matte |
| `gradient.aurora` | `bg-aurora` | `<RadialGradient>` x3 | Multi-fill | Adjustment layer |

---

## Adoption checklist

When integrating tokens into the existing `10_Final_Website`:

1. `tailwind.config.ts` already mirrors most tokens — confirm no drift exists by diffing against `tokens.ts`.
2. New components must `import { tokens } from '@/brand-os/tokens'` (or the published package once exported).
3. Use Tailwind utility classes for static styling. Drop to `tokens.*` only for dynamic / motion values.
4. CSS-in-JS for motion (Framer/GSAP) reads `tokens.duration.*` and `tokens.easing.*` directly.
5. Any `style={{ color: '#...' }}` in a PR is auto-rejected.
