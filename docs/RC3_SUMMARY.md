# RC3 — Visual Masterpiece

> **2026-08-10.** Branch `feat/m01-foundation`. Every number below was measured
> on a production build this session. **Nothing was deployed and nothing was
> pushed.**
>
> Planning documents, written before any RC3 code:
> [`RC3_MOODBOARD.md`](./RC3_MOODBOARD.md) · [`RC3_COMPONENT_PLAN.md`](./RC3_COMPONENT_PLAN.md)

---

## 1. The diagnosis, and the one thing it demanded

The brief set a single KPI: does this read as a premium AI company to an Apple /
Stripe / Vercel / Linear / Framer designer. The honest answer for the site as it
stood was **"good template, competent execution"** — and the cause was
measurable, not aesthetic.

**Five of the nine homepage sections were the same object.** `WorkflowUniverse`,
`FeatureStorytelling`, `DigitalCraft`, `AIInfrastructure` and `WorkflowPipeline`
each rendered a lucide icon in a rounded square, a title, a body paragraph and a
corner gradient glow, in a grid. A visitor scrolling the page met that rectangle
**more than twenty-five times.** All five import `lucide-react`; four instantiate
`GlassCard`; `grid-cols` + `.map()` is the layout in every one.

Worse, the most inherently visual product category imaginable — **systems that
move data through stages** — was being sold entirely in body copy.

So RC3's direction was one sentence: **make the system visible.**

---

## 2. The constraint that chose the medium

Measured before writing code:

```
  js    gzip   351.0 kB / 360 kB   →   9.0 kB headroom
  css   gzip    11.6 kB /  40 kB   →  28.4 kB headroom
```

Two findings changed the whole plan:

**`audit-bundle.mjs` sums every emitted chunk, not first-load.** So "lazy-load
the heavy module" — which the brief offers as the escape hatch — buys real
perceived performance but **zero budget**. A dynamic import counts exactly as a
static one.

**three.js is installed but ships in zero chunks.** `@react-three/fiber`,
`drei`, `postprocessing`, `three` and `@splinetool/*` are all in `package.json`,
but `AICore` and `IntelligenceCore` are imported by no route. Verified two ways:
no chunk contains `THREE` or `WebGLRenderer`, and the entire JS output is 1,087 kB
raw — three.js alone exceeds that. WebGL was therefore **not** already paid for;
it was a ~150 kB gzip first-time cost against 9.0 kB of headroom.

**Conclusion: SVG + CSS, and that is an upgrade rather than a concession.** The
CSS budget had 28.4 kB spare — about 2.5× the entire stylesheet. It is also what
three of the five named juries actually ship: Linear's and Vercel's signature
graphics are SVG and CSS, and Stripe's diagrams are SVG. A WebGL canvas would
additionally be opaque to screen readers, risking a frozen constraint
(accessibility, 100) to draw what a `<path>` draws better.

> **One word overrules this.** If the 3D wow-factor matters more than the budget
> gate, say so: RC3 will ship an R3F Automation Universe and raise
> `BUDGET_JS_KB` deliberately, with the number recorded. Absent that
> instruction, the gate held.

---

## 3. What shipped

### 3.1 The Automation Universe — the signature section

[`components/sections/AutomationUniverse.tsx`](../10_Final_Website/src/components/sections/AutomationUniverse.tsx)
replaces `WorkflowUniverse` entirely. Six automations, drawn as six systems
feeding one intelligence core, with signal travelling the beams.

**The geometry is a module-scope constant.** Magic UI's `AnimatedBeam` — whose
full source was retrieved and evaluated — measures each beam with
`getBoundingClientRect` in an effect and re-measures under a `ResizeObserver`,
one SVG and one observer *per beam*. RC3 computes a polar layout once at module
load, so the SVG is correct on first paint, with no observer, no measurement and
no post-hydration reflow.

**It imports no motion library.** `framer-motion` is already in the bundle and
would have been free; it still is not imported, because the only thing JS holds
is *which node is active*. Every beam, glow, transition and travelling signal is
CSS driven by one `data-active` attribute.

**The travelling signal costs nothing extra.** Each beam's `d` string is used
twice — as the SVG `<path d>` and as the CSS `offset-path` of a 5px dot. Moving
the dot repaints the dot, **not the path's bounding box** — which is precisely
the cost that ruled out `stroke-dashoffset` path-draw in RC2. Six signals are
staggered at 0.53 s across a 3.2 s cycle, so exactly one is in flight at a time,
honouring `VISUAL_DNA.md` § 2's cap of three simultaneous motions.

**Accessibility.** The `<svg>` is `aria-hidden` decoration. Every meaning lives
in a `<ul>` of real `<button>`s rendered **once** and re-laid-out by CSS —
absolutely positioned on the ellipse at `md+`, a vertical spine with a trunk
connector below it, because a six-node radial diagram is illegible at 360 px.
Hover, focus and click set the same state; the detail panel is `aria-live`.

### 3.2 Living pipelines on all ten case studies

RC2 shipped `WorkflowGlyph` static and on five pages. RC3:

- **A signal packet travels each connector**, staggered by stage index so the
  pipeline reads left-to-right. Painted as a background on a full-width
  pseudo-element and moved with `translateX` — transform-only and composited.
- **The large `panel` variant now renders on all ten case studies**, closing
  RC2 § 6 item 4. On client and demonstration work it *follows* the screenshot
  rather than replacing it: the capture proves the thing shipped, the diagram
  explains what it does.

Verified in the DOM, not assumed — every case study reports `panel=1 rail=1`
with 3–4 animated connectors.

**Cost: 0 kB JS.** `WorkflowGlyph` remains a server component.

### 3.3 The depth system — `globals.css`

| Addition | What it is |
|---|---|
| `.glass-elevated` | A fourth elevation tier. The existing three sit within ~1.5 % alpha of each other and do not read as a hierarchy. |
| `.border-beam` | Magic UI's Border Beam look, rebuilt as a rotating `conic-gradient` behind a padding-box mask. Theirs uses `offset-path: rect()`, Tailwind **v4** syntax and `motion/react` — none of which compile here (this repo is Tailwind 3.4 + framer-motion v11). |
| `.reveal-view` | The `/work` scroll choreography RC2 abandoned. |
| `@property --beam-angle` | Registered so the angle interpolates instead of jumping 0°→360° in one step. |

**The border beam travels only on hover/focus.** A conic gradient rotating on a
loop repaints its element every frame for the life of the page, including far
off-screen — the permanent-compositor-load pattern `MOTION_INVENTORY.md` § 2
already flags. At rest it is a lit gradient edge; motion is spent on
interaction, which is the rule the RC2 glyph hover established.

### 3.4 How `.reveal-view` avoided the trap that stopped RC2

RC2 planned entrance reveals for `/work` and abandoned them mid-implementation:
an `opacity: 0` headline **delays LCP by the reveal delay**, and `/work`
measures LCP at 4.7 s on mobile. Three rules make it safe:

1. **Pure CSS behind `@supports (animation-timeline: view())`.** No JavaScript,
   no IntersectionObserver, no hydration cost — and no path on which an element
   is stranded invisible, because where the feature is unsupported the rule
   never applies at all.
2. **Never on an LCP candidate.** The headline is not the only one: the first
   cards carry 1280×800 screenshots and the top row can straddle the fold. The
   **first two cards are excluded** and render exactly as before.
3. Reduced motion zeroes the delay as well as the duration.

---

## 4. Verification

Against a production build, this session.

| Gate | Baseline (RC2) | RC3 | |
|---|---|---|---|
| `tsc --noEmit` | clean | **clean** | ✅ |
| `eslint src` | 0 errors, 8 warnings | **0 errors, 8 warnings** | ✅ same warnings, all pre-existing in `components/three/` |
| Build | green | **green**, 30 static pages | ✅ |
| JS gzip | 350.9–351.0 kB | **351.6 kB** / 360 | ✅ **+0.6 kB** |
| CSS gzip | 11.6 kB | **12.8 kB** / 40 | ✅ +1.2 kB |
| Largest chunk | 69.2 kB | **69.2 kB** / 170 | ✅ unchanged |
| axe WCAG 2.1 AA | 0 violations | **0 violations, 34/34** | ✅ |
| New dependencies | — | **zero** | ✅ |

**On the +0.6 kB.** A signature interactive section, a new elevation tier, an
animated border, scroll choreography and travelling signals on eleven routes
cost **six-tenths of a kilobyte** of JavaScript. That is not luck: the section it
replaced was itself a client component importing `framer-motion`,
`ScrollReveal` and `GlassCard`, and its replacement imports none of them.

### The full Playwright run, reported as it happened

**418 tests — 406 passed, 10 skipped, 2 failed.** Both failures were
`Test timeout of 90000ms exceeded` inside `axe.analyze()` on
`/services/whatsapp-automation`, a route RC3 does not touch.

They were **load artifacts, not regressions**, and that is evidenced rather than
asserted:

- The suite took **3.0 hours** against a 9.8-minute RC2 baseline — the machine
  was thrashing, with a dozen stale `node` processes left over from previous
  sessions.
- The same two tests **pass in isolation on the same build in 5.4 s and 6.7 s**,
  against a 90 s limit.
- The failure mode is a timeout, not a violation.
- Both had already passed in a dedicated a11y run on this build (34/34).

After the `<figure>` fix in § 5, the eight `/work` accessibility tests were
re-run and all pass.

**The 3.0-hour figure is reported because a suite that slow is itself a finding
about the machine, and burying it would make the two failures look mysterious.**

---

## 5. Two defects found and fixed during the work

Recorded because both were introduced or exposed by RC3, and finding your own is
worth stating plainly.

**Invalid `<figure>` markup — mine.** The system panel was first appended
*inside* `<figure>`, after `<figcaption>`. The HTML spec requires `figcaption`
to be the figure's first or last child, so that made every client and
demonstration case study invalid. Caught before capture; the panel is now a
sibling after the figure.

**A stale claim in the test suite.** `a11y.spec.ts` documented that "an internal
build is the only case study that renders the `WorkflowGlyph` system panel" as
the reason `/work/whatsapp-accounting-os` is audited. RC3 made that false. The
comment is corrected and the route kept, with the new reason stated. **No
assertion was changed** — testing is frozen, and a comment that contradicts the
code is a defect, not documentation.

### A measurement that overruled a judgement

The beams first shipped at `rgba(147,197,253,0.22)`. On a capture they were
effectively invisible over the section's ambient wash — the network existed in
the DOM and not on screen. A probe that froze every signal at `offset-distance:
60%` confirmed the geometry was exact, and the beams went to `0.5`. The core
fill also went from `0.92` to `0.985`, because `ParticleField` was visibly
drifting **through** the brand mark.

None of that was visible in the editor. All of it was obvious in a screenshot.

---

## 6. Before / after

| | Directory | Build |
|---|---|---|
| **Before** | `10_Final_Website/release-preview/` | RC2 |
| **After** | `10_Final_Website/release-preview-rc3/` | RC3 |

Desktop 1440 and Pixel 7, full-page, same determinism pins as the release
matrix — scrolled end to end so every reveal has fired, then frozen so nothing
is sampled mid-fade.

| Frame | What changed, and why it helps |
|---|---|
| `*/homepage-full.png` | Six identical cards → an interactive network. The one section a visitor can describe to someone else. **Trust:** it shows the product instead of claiming it. |
| `*/case-study-client-full.png` | The pipeline diagram now follows the screenshot. **Storytelling:** the photograph proves it shipped, the diagram explains what it does — previously only half of that argument was made. |
| `*/case-study-internal-full.png` | The RC2 static panel now carries a travelling signal. **Conversion:** a system that visibly runs reads as operational, not as an illustration. |
| `*/portfolio-full.png` | Cards from the third onward rise as they enter. **Storytelling:** the motion language no longer stops dead at the homepage boundary. |

Only the changed frames were re-captured, not the full 70-image matrix —
`scripts/capture-release-preview.mjs` remains the full sweep, and it was not
re-run because the machine was in the state § 4 describes.

---

## 7. What RC3 did not do

| Not done | Why |
|---|---|
| **`AIInfrastructure` trunk diagram** (Moodboard "Move 4") | **The one planned item not delivered.** Its six branches wrap to two rows at `lg:grid-cols-3`, so a distribution bus can only connect the first row — a half-connected diagram reads worse than a clean grid. Doing it properly means a bilateral tree (hub left, branches right), which is a layout change, not a polish change. It is also already the least card-like of the five sections: it has a hub, a trunk and a live signal. **Top of the RC4 list.** |
| WebGL / R3F / OGL / Spline | § 2. ~150 kB gzip against 9.0 kB headroom, and opaque to assistive tech. |
| Lottie / Rive | 35–80 kB gzip runtime for motion that cannot respond to hover, focus or scroll. |
| Letter-by-letter reveals, glitch, cursor trails | `VISUAL_DNA.md` § 8 forbids all three by name. |
| Page transitions | Needs a client wrapper on every route and risks the CLS 0.0000 RC1 earned. |
| The homepage's 52 mobile score | Real, and a **performance** phase. The brief freezes performance; this is not that phase. |
| Lighthouse re-measurement | Would have been invalid. The machine that produced a 3.0-hour test suite cannot produce a trustworthy performance number, and this repo does not publish measurements it does not trust. RC3 added **zero** network requests and **+0.6 kB** of JS, so there is no mechanism for a regression — but that is an argument, not a measurement, and is labelled as one. |

---

## 8. Status

**Engineering: ready.** Types, lint, build, all three bundle budgets, axe across
every audited combination, and 406 passing tests — with the only two failures
demonstrated to be load artifacts on an untouched route.

**Launch: still blocked, and still not on engineering.** D1 domain, D2 env var,
D4 deploy approval, D5 branch divergence, D6 credential rotation — all
unchanged, all in [`../BLOCKERS.md`](../BLOCKERS.md), none of them mine to
close.

**Against the brief's own test** — *"if the first reaction is not 'this looks
like a premium AI company', you have failed"* — the homepage no longer opens
into a stack of identical rectangles. It opens into a system that visibly runs,
and every case study now shows its pipeline moving. That was bought for
six-tenths of a kilobyte and zero new dependencies.
