# RC4 — The Blueprint and the Stage

> **2026-08-10.** Branch `feat/m01-foundation`. Every number below was measured
> on a production build this session. **Nothing was deployed and nothing was
> pushed.**
>
> Design reasoning, written before any RC4 code:
> [`DESIGN_OS.md`](./DESIGN_OS.md)

---

## 1. What this phase was for

RC3 closed with a debt it wrote down rather than hid
([`RC3_SUMMARY.md`](./RC3_SUMMARY.md) § 7):

> **`AIInfrastructure` trunk diagram — the one planned item not delivered.** Its
> six branches wrap to two rows at `lg:grid-cols-3`, so a distribution bus can
> only connect the first row. […] **Top of the RC4 list.**

That is what RC4 built, plus the next section down the same list.

RC3's diagnosis was that **five of nine homepage sections were the same
object** — a lucide icon in a rounded square, a title, a paragraph and a corner
glow, in a grid — and it had budget to replace one. RC4 replaces two more.

**Running count: three of five done.** A visitor now meets that rectangle
**eleven** times on the homepage rather than twenty-five.

---

## 2. Before anything else: RC2 and RC3 had never been committed

The working tree held **35 modified files and 16 untracked ones** — the entire
RC2 and RC3 visual programme, verified against a production build and never
recorded in git. The last commit was two days older than the work.

RC4 re-ran the full gate before committing any of it, rather than trusting the
phase documents, and the numbers reproduced exactly: types clean, lint 0 errors
/ 8 pre-existing warnings, build green, **351.6 kB** JS, **12.8 kB** CSS, 69.2 kB
largest chunk. That is commit `a81ded0`.

---

## 3. What shipped

### 3.1 `AIInfrastructure` — the distribution bus

Hub on the left, six branch rows on the right, every one of them genuinely
connected by a trunk, a spine and a stub. This is the bilateral tree RC3
prescribed and could not fit into a wrapping grid.

**There is no SVG in it, and that was a decision with a rejected alternative.**
The obvious build is a curve per branch in a gutter column. It was written and
abandoned: branch rows are content-sized — a category with six tool chips is
taller than one with two — so the curve endpoints are unknown until layout runs.
Each escape costs something real:

| Escape | Cost |
|---|---|
| Measure at runtime | `getBoundingClientRect` under a `ResizeObserver` per branch — precisely the Magic UI `AnimatedBeam` cost model RC3 already rejected |
| Fix the row heights | Chips overflow at `md`, where the branch column is narrowest |
| `preserveAspectRatio="none"` + proportional geometry | The near-miss. Correct endpoints, but non-uniform scale renders the 4px travelling signal as a **1.35:1 ellipse**. `vector-effect` fixes strokes, not shapes |

A spine with stubs needs **no coordinate system at all**, so nothing is measured
and nothing can drift. It is also how this diagram is drawn everywhere it is
drawn for real — n8n, Zapier, AWS architecture diagrams — a bus and stubs, not a
fan of curves.

**The hub is a plate, not a disc**, because the Automation Universe already owns
the glowing circle on this page. Two radial cores would reintroduce the exact
repetition RC3 exists to remove, one section later. Both carry the logo's three
stacked rules, which is what makes them one family rather than two drawings.

### 3.2 `DigitalCraft` — the device stage

Four `GlassCard`s become one browser frame that switches between four builds:
websites, landing pages, dashboards, custom assets. The address bar changes with
the panel.

**The screens are wireframes, and that is a governance decision, not an
aesthetic one.** Real captures live in `public/work/`, and reusing them here
would make the homepage argue the same evidence twice. Worse, there is no real
capture for "Landing Pages" or "Custom Digital Assets" — two of four panels would
have to be invented, which is what D24 and the `ProjectEvidence` type exist to
prevent. A wireframe claims nothing: it is legibly a layout sketch rather than a
photograph of something that shipped. It also costs zero image bytes.

The frame carries a stated caption — *"Indicative layouts — every build is
designed from scratch"* — because a visitor should not have to work out that
these are not screenshots.

### 3.3 Both sections ship zero JavaScript

Neither holds state, so neither needs a client boundary:

- `AIInfrastructure` dropped `framer-motion`, `useInView`, `Breathing` and
  `prefersReducedMotion`. Its three animations play on their own schedule, which
  is what CSS is for.
- `DigitalCraft` dropped `framer-motion`, `ScrollReveal` and `GlassCard`.
  Selecting one of four panels is a one-of-N choice, which is what a **radio
  group** is: four visually-hidden radios and `:checked ~` sibling selectors.

The radio group is also better assistive-technology behaviour than the
alternative. A real radio is announced as "1 of 4" and moves under arrow keys
natively; a `role="tablist"` without JavaScript would advertise a keyboard
contract the component does not honour.

---

## 4. Verification

Against a production build, this session.

| Gate | RC3 baseline | RC4 | |
|---|---|---|---|
| `tsc --noEmit` | clean | **clean** | ✅ |
| `eslint src` | 0 errors, 8 warnings | **0 errors, 8 warnings** | ✅ same warnings, all pre-existing in `components/three/` |
| Build | green | **green**, 30 static pages | ✅ |
| JS gzip | 351.6 kB | **349.1 kB** / 360 | ✅ **−2.5 kB** |
| CSS gzip | 12.8 kB | **14.0 kB** / 40 | ✅ +1.2 kB |
| Largest chunk | 69.2 kB | **69.2 kB** / 170 | ✅ unchanged |
| axe WCAG 2.1 AA | 0 violations | **0 violations, 34/34** | ✅ |
| Playwright | 406 passed / 10 skipped / **2 failed** (3.0 h) | **408 passed / 10 skipped / 0 failed** (8.5 min) | ✅ full suite, 418 tests |
| New dependencies | — | **zero** | ✅ |

**On the −2.5 kB.** Two new interactive centerpieces made the JavaScript bundle
*smaller*. That is not a trick: the sections they replaced were client
components importing a motion library to run animations that never needed state.

The a11y run includes *"every interactive element is reachable and shows a focus
indicator"*, which is the test that covers the new radio group — its focus ring
is borrowed by the label, since the input itself is invisible.

### A new permanent gate: `scripts/probe-reduced-motion.mjs`

RC4 added three animations and one opacity-driven control, and the failure mode
that matters for all four is **content stranded invisible** — which axe does not
catch, the build does not report, and a normal screenshot cannot show, because
it only appears for a visitor who asked for less motion.

`MOTION_INVENTORY.md` § 7 records that this has already happened once: the
global reduced-motion rule collapses `animation-duration` but leaves
`animation-delay`, so RC2 found an element held invisible for up to 440 ms.

The probe loads the page under `reducedMotion: 'reduce'` and asserts the
opposite of what a capture asserts — that with motion off, everything meaningful
is still on screen. **11/11 pass:**

```
PASS  infra signal removed          PASS  exactly one panel visible
PASS  craft sheen removed           PASS  exactly one url visible
PASS  infra stub still drawn        PASS  exactly one caption visible
PASS  hub glow not animating        PASS  visible panel is the checked one
PASS  hub glow at rest opacity      PASS  radios still in layout (focusable)
PASS  six branches present
```

The distinction the middle column encodes is the point: the *signals* are gone,
and the *stubs* are not. A connector is structure, not motion, and removing it
would leave a tree with nothing joining it.

---

## 5. Two defects found by looking at a screenshot

Both compiled. Both type-checked. Both were invisible in the editor and obvious
in a capture — the same lesson RC3 recorded, learned again.

**The wireframes rendered as solid black bars.** `` className={`craft-sh--${tone}`} ``
builds a class name that exists as a literal in no source file, and **Tailwind
tree-shakes custom rules in `@layer components` whose selectors its content
scanner cannot find**. All five `.craft-sh--*` rules were dropped from the
stylesheet, every `<rect>` fell back to SVG's default `fill: black`, and the
browser frame contained a stack of black rectangles.

Confirmed rather than guessed — `grep -o "craft-sh--[a-z]*" .next/static/chunks/*.css`
returned nothing before the fix and all five names after it. The fix is an
explicit `Record<Tone, string>` map, so every class name appears as a literal.

**The tree was too faint to read as a system.** The spine and stubs shipped at
`rgba(147,197,253,0.34)` and, over the section's ambient wash, the six branches
read as loose bars beside a plate. Raised to `0.5` — which is exactly the value,
and exactly the reasoning, RC3 arrived at for the Universe's beams after the
same mistake.

A third, smaller finding from the same capture: at 1440px the branch rows
stretched to ~925px while their chips filled about 40% of that, so every row
ended in a long empty gutter. `.infra` is now capped at 1040px and centred, the
same discipline `.universe` already applied at 980px.

---

## 6. What RC4 did not do

| Not done | Why |
|---|---|
| **`WorkflowPipeline` and `FeatureStorytelling`** | The remaining two of RC3's five. Both still render `GlassCard` grids. **Top of the RC5 list**, in that order — the pipeline is the more repetitive of the two. |
| WebGL / R3F / Spline / Lottie | ~150 kB gzip against 8.4 kB of headroom, and opaque to assistive tech. `DESIGN_OS.md` § 5. |
| Neomorphism, Claymorphism, faux-3D surfaces, a brutalist section | `SHEETFLOW_VISUAL_DNA.md` § 9 rejects them by name. The brief asked for them; the standing constraint won, and the split between each style's *principle* and its *surface* is set out in `DESIGN_OS.md` § 1 — with a one-sentence override left open to the founder. |
| Lighthouse re-measurement | The homepage's 52 mobile score is real and untouched. RC4 removed 2.5 kB of JavaScript and added no network requests, so there is no mechanism for a regression — **but that is an argument, not a measurement, and is labelled as one.** The homepage performance phase remains its own phase. |
| Re-capture of the full 70-image matrix | Only the two changed sections were captured, at desktop 1440 and Pixel 7, plus all four device-stage panels. `scripts/capture-release-preview.mjs` remains the full sweep. |

---

## 7. Status

**Engineering: ready.** Types, lint, build, all three bundle budgets, axe across
34 route/motion combinations, and the **full 418-test Playwright suite with zero
failures**.

RC3 could not say that: its run took 3.0 hours and ended with two
`axe.analyze()` timeouts, which it argued — correctly, but by argument — were
load artifacts rather than regressions. The same suite now completes in **8.5
minutes** with **0 failures**, which retires that argument by measurement. The
stale `node` processes RC3 blamed were the cause.

**Launch: still blocked, and still not on engineering.** D1 domain, D2 env var,
D4 deploy approval, D5 branch divergence, D6 credential rotation — all
unchanged, all in [`../BLOCKERS.md`](../BLOCKERS.md), none of them mine to close.
