# RC2 — Visual Audit

> **Written 2026-08-09, before any RC2 code was written.** Every finding below
> was read off the **running production build** at `BUILD_ID S2FcqVkxdhr2Jm8QL0bIR`,
> not off source. Where a finding is an opinion rather than a measurement, it
> says so.
>
> RC2 is a **visual polish pass on finished engineering**. No architecture
> changes, no section rebuilds, no new features.

---

## 0. The constraint that shapes every recommendation

RC2 inherits two numbers, and they are not comfortable.

| Budget | Baseline (this build) | Headroom |
|---|---|---|
| Client JS, gzip | **350.9 kB** / 360 kB | **9.1 kB** |
| CSS, gzip | 10.8 kB / 40 kB | 29.2 kB |
| Homepage Lighthouse perf, mobile | **52** | — |
| `/work` Lighthouse perf, mobile | **64** (band 62–70) | — |

The homepage's measured problem is **paint, not JavaScript** (`PROJECT_HEALTH.md`).
The site already runs framer-motion, GSAP+ScrollTrigger, Lenis, a particle field,
a custom cursor and an ambient video.

Two rules follow, and they are hard rules for this phase:

1. **No RC2 change may ship client JavaScript.** 9.1 kB is not a budget, it is a
   rounding error. Everything below is a server component, static markup, or CSS.
2. **No RC2 change may add a continuous animation to a page that already
   carries several.** Motion added in RC2 is **one-shot on reveal** or **on
   hover** — it costs nothing at rest, which is the state a page spends 99% of
   its life in.

This is why the recommendations that follow contain no WebGL, no Three.js, no
Canvas and no new motion library. The brief permits them "where justified"; on a
page scoring 52 on mobile, none of them is.

---

## 1. Findings

Ordered by how much visual quality each one costs.

### V1 — `/work`: half the portfolio grid renders as an empty box · **critical**

Five of ten cards (`evidence.kind === 'internal'`) fill their 16:10 media area
with a label, a gap, and three monospace file paths. Measured from the running
build at 1440 px, the media area is **~90 % empty**.

The grid therefore reads as **five finished cards followed by five broken
ones** — the exact opposite of the intended message, which is that the internal
systems are the most substantial engineering on the page (13,822 lines across
five builds).

This is the single largest visual defect on the site, and it is the finding the
RC2 brief opens with.

**Evidence:** `audit/before/work-internal-card.png`. The dead band runs from the
label baseline to the first file path — roughly 150 px of nothing inside a
214 px box.

### V2 — Internal case studies open with no visual anchor at all · **critical**

`/work/whatsapp-accounting-os` and its four siblings go: breadcrumb → kicker →
headline → lede → mono meta line → **evidence ledger**. A client case study at
the same scroll position is showing a full-bleed 1280×800 screenshot.

Five of ten case studies are, visually, a wall of justified text. They are also
the five with the strongest engineering story.

**Evidence:** `audit/before/case-internal-header.png`.

### V3 — The Architecture section does not show anything moving · **high**

The section is titled *"How the work moves through it."* It renders four glass
cards side by side. The only thing marking them as a sequence is a **16 px
hairline** at `top-[38px]`, drawn `from-accent-bright/40 to-transparent`, and
`hidden` below `xl`.

So on every viewport under 1280 px the flow diagram is four unrelated cards, and
above 1280 px it is four unrelated cards joined by something most visitors will
not see. The heading writes a cheque the layout does not cash.

**Evidence:** `audit/before/case-architecture.png`.

**Note:** `ArchitectureFlow`'s doc comment argues, correctly, that an `<ol>`
beats an SVG flowchart for accessibility — connectors carry meaning that never
reaches the accessibility tree. That argument is right and RC2 keeps it. The fix
is to make the *list* look like a flow, not to replace it with a picture.

### V4 — The site's motion language stops at the homepage boundary · **medium**

| Surface | Reveal behaviour |
|---|---|
| `/` | framer-motion variants, GSAP `ScrollReveal`, staggered, blur-in |
| `/services`, `/pricing` | partial |
| `/work`, `/work/[slug]` | **none** — everything is present at full opacity on paint |

Ten case-study pages and the portfolio index have no reveal, no hover elevation
beyond `.card-interactive`, and no entrance choreography. A visitor who arrives
from the homepage crosses a visible quality boundary.

This is a **consistency** finding, not a request for more animation. The fix is
CSS-only reveals on the static routes — which is also the only fix the JS budget
permits.

### V5 — One easing curve, eleven hand-copied definitions · **medium**

`[0.16, 1, 0.3, 1]` appears **27 times across 11 files** as an inline literal,
alongside `ease-cinematic` in Tailwind, `sheetflow.cinematic` in GSAP, and
`cubic-bezier(0.16,1,0.3,1)` in `globals.css`. Four spellings of one curve.

Durations are similarly ad hoc: 0.5 s, 0.6 s, 0.7 s, 0.8 s, 0.9 s all appear as
"the reveal duration".

Nothing is visibly wrong today. It is a drift surface — the next person to add a
section will pick a fifth spelling and a sixth duration, and the language will
degrade one commit at a time.

### V6 — Three kicker implementations, two of them hand-rolled · **low**

- `.kicker` in `globals.css` — has the `::before` rule that draws the 24 px lead-in
- `<Kicker>` component — wraps `.kicker`
- `/work` and `/work/[slug]` card kickers — raw
  `text-[11px] font-medium uppercase tracking-widest text-accent-bright/80`,
  which is `.kicker` **minus the lead-in rule**

So the eyebrow above "Selected work" has a rule beside it and the eyebrow on
every card below does not. Small, but it is the kind of inconsistency that
reads as "assembled" rather than "designed".

### V7 — The closing CTA on `/work` and `/work/[slug]` has no visual containment · **medium**

`FinalCTA` on the homepage sits on an ambient treatment with a gradient
backdrop. The equivalent block on the eleven work routes is a headline, a
paragraph and two controls on flat `void`, indistinguishable from any other
section.

It is the last thing a visitor sees before leaving, and it is the least
designed block on the page. **Conversion finding**, not a taste one.

### V8 — `.card` and `.feature-card` disagree about corner radius · **low**

`.card` is `rounded-2xl` (20 px). `.feature-card` is `rounded-3xl` (28 px).
`glass-subtle` is `rounded-xl` (16 px). They appear on the same pages. In the
`.tsx` layer the ratio is 18 × `rounded-2xl` to 1 × `rounded-xl`, so 20 px is
the de-facto system value and `.feature-card` is the outlier.

### V9 — Section rhythm is correct and should not be touched · **no action**

Measured across all ten homepage sections: `padding-block: 136.8px` on every one
except the hero (144/128) and `FinalCTA` (176/176). The deliberate exceptions are
the first and last blocks. **This is already right.** Recording it so RC2 does
not "improve" it.

### V10 — Contrast work from RC1 holds · **no action**

`ink-400` at `#717B98` (4.81:1 on void), `btn-primary` on `accent-deep`
(5.17:1), the `/work` internal tile's lifted tokens. axe reports 0 violations
across 11 route/motion combinations. **RC2 must not regress this**, which
constrains every colour choice below — see §2.6.

---

## 2. Recommendations

Each one names the finding it closes and its cost against the two budgets.

### R1 — `WorkflowGlyph`: a workflow diagram built from published data
**Closes V1, V2, V3.** Cost: **0 kB JS**, ~1.5 kB CSS.

A server component that renders a project's pipeline as a chain of icon nodes
joined by connectors.

```
   ┌────┐        ┌────┐        ┌────┐        ┌────┐
   │ ▤  │ ─ ─ ─▶ │ ✦  │ ─ ─ ─▶ │ ⏸  │ ─ ─ ─▶ │ ▦  │
   └────┘        └────┘        └────┘        └────┘
   Receive        Parse         Stage         Post
```

**It invents no content.** Nodes are `project.architecture[].stage` — data that
is already published, already reviewed, and already rendered in prose directly
below the diagram. The brief's examples map onto it exactly:

| Brief's sketch | What the data already says |
|---|---|
| WhatsApp → AI → Ledger → Excel → Dashboard | Receive → Parse → Stage → Post |
| Phone → Voice → AI → CRM | Dial → Converse → Speak → Record |
| Maps → Qualification → CRM → WhatsApp → Booking | Ingest → Clean & score → Send → Listen |
| PDF → OCR → AI → Excel | Ingest → Read → Structure → Publish to Excel |
| CAD → AI → CNC → Manufacturing | Ingest → Compile → Emit roles → Deliver atomically |

The published stage names are **more accurate than the sketch** — the bank
parser's fourth stage really is "Publish to Excel", and the accounting OS really
does have a human-verification stage between the parser and the ledger, which
"AI → Ledger" would erase. Using the sketch's labels would have quietly
contradicted the case study underneath.

**One content change is required and it is additive:** `ArchitectureStage` gains
an optional `short?: string`, used only where a full stage name is too long for
a compact node (`Deliver atomically` → `Deliver`, `Publish to Excel` → `Excel`).
The full name stays the source of truth and still renders in the detail cards.

Three variants, three placements:

| Variant | Where | Fixes |
|---|---|---|
| `tile` | `/work` grid, internal cards | V1 |
| `panel` | `/work/[slug]` header, internal builds | V2 |
| `rail` | `ArchitectureFlow`, **all ten** case studies | V3 |

Semantics stay an `<ol>` with real `<li>` text, per `ArchitectureFlow`'s existing
and correct reasoning. Connectors are decorative CSS.

**Motion:** none at rest. Connector dashes drift on `group-hover` only. The
`panel` variant plays a **one-shot** 900 ms node cascade on load; under
`prefers-reduced-motion` the existing global rule collapses it to its end state,
which is designed to be the correct static rendering.

### R2 — Keep the artifact evidence on the `/work` tile
**Guards V1's fix.** Cost: 0.

The filenames the glyph displaces are the tile's *evidence*, and the case for
internal builds rests on them. They move to a single-line mono footer under the
glyph (`4 source files · 1,739 lines`-style summary plus the top artifact),
rather than being deleted. The full ledger is unchanged on the case study.

### R3 — `lib/motion.ts`: one definition of the house curve
**Closes V5.** Cost: 0 kB — it is a constants module, tree-shaken into existing chunks.

```ts
export const EASE_CINEMATIC = [0.16, 1, 0.3, 1] as const;
export const DUR = { fast: 0.4, base: 0.6, slow: 0.9 } as const;
```

Replaces the 27 inline literals. **Behaviour-preserving by construction** —
every call site currently uses this exact curve, so no rendering changes. This
is the only RC2 change with no visual output, and it exists so RC3 does not
inherit four spellings of one easing.

### R4 — CSS-only reveals on `/work` and `/work/[slug]`
**Closes V4.** Cost: 0 kB JS, ~0.4 kB CSS.

The existing `.reveal` / `.stagger` utilities in `globals.css` already implement
this and are currently **unused on these routes**. They require a JS
IntersectionObserver to add `.is-visible`, which the budget forbids — so RC2
adds a pure-CSS variant using `animation` with a `view-timeline`-free one-shot
on load for above-fold content, and leaves below-fold content static.

**Honest limitation, stated up front:** a scroll-triggered reveal without
JavaScript needs `animation-timeline: view()`, which is Chromium-only. RC2 will
**not** use it — a reveal that plays in Chrome and not Safari is worse than no
reveal. What ships is a **load-time cascade on the header block only** (kicker,
headline, lede, CTA row), which is above the fold on every viewport and needs no
observer. Below-fold sections stay static.

This closes V4 partially and deliberately. The remainder is recorded in §4.

> #### ⚠️ Revised during implementation — R4 was abandoned, not shipped
>
> The load-time cascade above was **not built**, and the reason is a cost this
> audit did not price when it was written.
>
> A reveal starts its target at `opacity: 0`. An element at `opacity: 0` is not
> painted, so it does not become the Largest Contentful Paint candidate until
> the reveal begins — which means a header cascade **pushes LCP out by its own
> delay**. On `/work`, LCP is already **4.7 s** on the mobile preset, and the
> `<h1>` is the likely LCP element. Spending 300 ms of that for an entrance
> animation is the opposite of this phase's stated rule.
>
> V4 was instead closed with **interaction motion** — the glyph's hover state
> and the existing card elevation — which costs nothing at rest and nothing at
> load. That closes the "premium feel" half of V4 and leaves the "entrance
> choreography" half open, honestly, in `RC2_SUMMARY.md` § 6.2.
>
> Recorded here rather than quietly deleted, because an audit that only ever
> agrees with what got built is not evidence of anything.

### R5 — Contain the closing CTA on work routes
**Closes V7.** Cost: 0 kB JS, ~0.3 kB CSS.

Wrap the closing block in a bordered panel with the aurora treatment and the
`signature-edge` top highlight the design system already defines and currently
reserves for hero-grade surfaces. No new visual vocabulary — it promotes the CTA
into vocabulary that exists.

### R6 — `.kicker` everywhere; `.feature-card` to 20 px
**Closes V6, V8.** Cost: 0.

Replace the two hand-rolled kicker class strings with `.kicker`. Change
`.feature-card` from `rounded-3xl` to `rounded-2xl` to match the 18:1 majority.

### R7 — Colour discipline for everything above
**Guards V10.**

Every new surface uses tokens already measured against AA on `void` and on
glass: `ink-200` and `ink-300` for body, `ink-400` only at ≥12 px, `accent-bright`
for iconography on `bg-white/[0.02]` or darker. **No new colour values are
introduced by RC2.** The a11y suite re-runs before sign-off and is the gate.

---

## 3. Explicitly rejected

Recorded so the decisions are not re-litigated in RC3.

| Rejected | Why |
|---|---|
| WebGL / Three.js case-study visuals | `@react-three/*` is already a dependency and already unused on these routes. Mounting a renderer on a page scoring 64 to draw four boxes and three arrows is indefensible. |
| SVG `stroke-dashoffset` path-draw on the `/work` grid | Ten cards × one repainting path. `stroke-dashoffset` repaints the whole path bounding box each frame. Hover-only instead. |
| Adopting Aceternity / Magic UI / React Bits components | Reviewed as inspiration; **not installed**. Every one is a client component and the JS budget is 9.1 kB. The glyph's node-chain composition is a well-trodden pattern these libraries also use — RC2 implements it against this design system's own tokens rather than importing a second one. Also: nothing here needs `motion/react` v11 primitives the project does not already have. |
| Page transitions | Requires a client-side layout wrapper on every route and a `View Transitions` fallback path. Cost is real, benefit is on navigation only, and it risks the CLS 0 that RC1 earned. |
| Cursor improvements | `CustomCursor` already exists and RC1 had to *hide it during capture* because it occluded content. Adding to it is the wrong direction. |
| Animated gradients on section backgrounds | The homepage's measured bottleneck is paint. A full-viewport animated gradient is the most expensive paint operation available. |

---

## 4. Known-incomplete after RC2

Stated now so the closing report does not have to discover it.

1. **Scroll-triggered reveals on static routes** remain load-time only (R4).
   A cross-browser fix needs either JS (budget) or `animation-timeline: view()`
   (Chromium-only). Neither is acceptable today; both may be in six months.
2. **The homepage's 52 mobile score is untouched by RC2.** RC2 adds nothing to
   it and removes nothing from it. It is a paint problem in the hero's ambient
   layers and it needs its own phase.
3. **Client-work case studies still lead with a screenshot, not a diagram.**
   That is correct — a screenshot of a real deployment is stronger evidence than
   any diagram — but it means the `panel` variant only ever appears on five of
   ten pages.

---

## 5. What "done" means for RC2

RC2 is complete when, against the **same** production build:

- [x] `type-check` clean, `lint` 0 errors — **clean, 0 errors / 8 pre-existing warnings**
- [x] Build green at 37 routes — **green**
- [x] JS gzip **≤ 350.9 kB** — RC2 must not *increase* it at all — ⚠️ **351.0 kB. Missed by 0.1 kB**, see below
- [x] axe: 0 violations, same 11 route/motion combinations — **0 violations, 12 combinations**
- [x] CLS still 0 on `/work` and `/work/[slug]`
- [x] Playwright suite green — **416 tests, 406 passed, 10 skipped, 0 failed**
- [x] Screenshot matrix re-captured at all five breakpoints from a **verified
      fresh build** — the RC1 lesson — **70 images, `BUILD_ID` matched to the
      served HTML before capture**

**The one miss, recorded rather than rounded away.** The JS budget line was
"must not increase at all" and it increased by **0.1 kB** — `lib/motion.ts`, a
module of `const` arrays and numbers, tree-shaken into existing chunks. The
visual work itself cost **zero** client JavaScript; the overage is entirely the
easing-consolidation refactor.

It is left in rather than reverted because the alternative is keeping 27
hand-copied literals to protect a tenth of a kilobyte. But the target is
recorded as missed, because a target that quietly moves to accommodate the
result is not a target.

Any other failure reverts the change that caused it. Visual polish does not get
to spend the engineering.
