# The Visual Operating System

> **2026-08-10.** Reusable primitives that sections *compose*, not components
> that sections *duplicate*.
>
> Governed by [`VISUAL_DNA_V2.md`](./VISUAL_DNA_V2.md). Every engine below
> exists to make one of its rules the path of least resistance, because a rule
> that lives only in a document is a rule that gets violated by the next person
> in a hurry.
>
> **The whole system's client-JavaScript cost is zero.** Every engine is a
> server component or a pure constant.

---

## 1. Why engines rather than components

The site already had components. It shipped five homepage sections that were
the same object anyway.

That is the failure this system is built against, and the cause was not laziness
— it was that `GlassCard` + `lucide icon` + `grid-cols` was the cheapest path,
so it was the path. Nothing made "draw the subject" easier than "put it in a
card".

An engine differs from a component in three ways that matter here:

1. **It encodes a rule, not a look.** `Artifact` cannot be rendered without
   declaring provenance. `Surface` has five tiers because three within 1.5%
   alpha was measured not to read as depth.
2. **It is composed, not configured.** A section builds its centerpiece from
   `Spine` + `Artifact` + `Surface`; it does not pass `variant="pipeline"` to
   something that already knows what a pipeline looks like.
3. **It has no opinion about the section.** Which is what lets nine sections
   look different while sharing one grammar.

---

## 2. The roster

Honest status, per the house rule that a document which overstates its subject
is worse than no document.

| Engine | Status | File | Used by |
|---|---|---|---|
| **Motion Choreography** | ✅ implemented, in use | `lib/choreography.ts` | The Run; available site-wide |
| **Ambient Background** | ✅ implemented, in use | `vos/Ambient.tsx` | The Run |
| **Premium Card** | ✅ implemented, in use | `vos/Surface.tsx` | The Run, via `Artifact` |
| **Animated Pipeline** | ✅ implemented, in use | `vos/Spine.tsx` | The Run |
| **Evidence Overlay** | ✅ implemented, in use | `vos/Artifact.tsx` | The Run |
| **Device Mockup** | ✅ implemented, in use | `vos/Frames.tsx` | The Run, stage 02 |
| **Scroll Storytelling** | ✅ implemented, in use | `globals.css` — `.reveal-view` + `.vos-spine--traced` | The Run, `/work` |
| **Browser Mockup** | ⚠️ **exists, not extracted** | inline in `sections/DigitalCraft.tsx` | DigitalCraft |
| **Workflow** | ⚠️ **exists, not extracted** | `components/work/WorkflowGlyph.tsx` | 10 case studies |

The two ⚠️ rows are working code in the product that has not been lifted into
`vos/` yet, because the sections that own them were out of scope for this
iteration. They are items 1 and 2 of § 6.

---

## 3. The engines

### 3.1 Motion Choreography — `lib/choreography.ts`

The timing authority. `lib/motion.ts` remains the **JavaScript** language
(bezier tuples for framer-motion); this is the shared source for the CSS side,
so the two cannot drift.

It also owns the one calculation that had been hand-derived three times:

```ts
cadence(count, cycle) // → { cycle, step }
```

`VISUAL_DNA_V2.md` § 7.1 caps active motion at three per viewport. A rail with
N travelling packets blows that unless each finishes before the next departs,
which is `step = cycle / count`. Three components had derived it independently
— Automation Universe (6 × 0.53s), Infrastructure bus (6 × 0.60s), Workflow
glyph (4 × 0.42s) — and the fourth is where somebody rounds it wrong and four
packets fly at once.

### 3.2 Ambient Background — `<Ambient tier tone grid />`

```tsx
<Ambient tier="standard" tone="dual" grid />
```

`tier`: `full | standard | quiet`. `tone`: `accent | gold | dual`.

Implements § 8.3, which replaced v1's *"every page has all four atmospheric
layers; removing any one breaks the brand"* with a budget. v1 mandated a cost it
never priced — paint is 73–91% of this site's main thread. The emotional arc is
now carried by the **sequence of tiers** down the page rather than by every
section paying the maximum.

### 3.3 Premium Card — `<Surface elevation beam live />`

Five tiers: `0 recessed · 1 flush · 2 raised · 3 lifted · 4 presented`.

Alpha, blur **and** shadow move together, because one property alone does not
read as depth — which is precisely why `.glass`, `.glass-strong` and
`.glass-subtle`, sitting within ~1.5% alpha of each other, never formed a
hierarchy and RC3 had to invent a fourth tier mid-phase.

The Liquid Glass details that actually matter (§ 4.2):

- `saturate(180%)` behind the blur — glass that does not saturate is fog, and
  this is the single largest difference between cheap and expensive glass.
- A specular top edge, `inset 0 1px 0`, alpha scaling with tier.
- A **graded border**, achieved with a two-layer background — fill on
  `padding-box`, edge gradient on `border-box`. Flat borders read as strokes;
  graded borders read as edges catching light.

`live` applies the 4px scan line, demoted by § 3.3 from v1's "mandatory on every
surface" to a mark meaning exactly one thing: the system is writing here.

### 3.4 Animated Pipeline — `<Spine />` + `<SpineNode />`

**The idea is Aceternity UI's Tracing Beam. The implementation is not.**

Theirs: `useScroll` + two `useTransform`s + two `useSpring`s (stiffness 500,
damping 90) + a `useState`/`useEffect` pair measuring content height to size the
SVG viewBox, re-rendering React every scroll frame to push new gradient
coordinates.

Ours: one `scaleY` driven by `animation-timeline: view()`. No scroll listener,
no springs, no measurement, no re-render — and **no JavaScript**, so it cannot
compete with paint for the main thread. Support is Chrome/Edge 115+, Firefox
132+, Safari 18+ (~84% globally).

Two implementation details that are load-bearing rather than tidy:

- **The beam rests at `scaleY(1)`**, and the 0→1 animation lives inside
  `@supports (animation-timeline: view())`. Where the feature is missing the
  rule never matches and the rail renders complete and static. Defaulting to
  `scaleY(0)` would leave it **invisible** on every unsupported browser.
- **No `overflow: hidden` on the rail.** `overflow: hidden` makes an element a
  scroll container, so `view()` on the beam inside it resolved against *that*
  box instead of the document — a degenerate timeline that froze the animation
  at a constant progress. Measured at `scaleY(0.7)` at every scroll position on
  the first build, and invisible in any screenshot because the capture harness
  freezes animations.

### 3.5 Evidence Overlay — `<Artifact provenance ... />`

```tsx
<Artifact provenance="illustrative" shapes={SHAPES} elevation={4} live />
```

**`provenance` is a required prop.** `VISUAL_DNA_V2.md` § 6 promotes evidence
from a content rule to a visual one, and this is where it is enforced: there is
no way to render an artifact through this engine without declaring what it is,
and the caption is emitted by the engine rather than written by the caller — so
it cannot be forgotten and cannot drift into marketing language.

`indicative | illustrative | seeded | capture`. Only `capture` needs no
caption, because a photograph of a shipped thing is self-evidencing.

Shapes are data (`[x, y, w, h, tone?, radius?]`), because five artifacts of
twenty elements each is a hundred near-identical JSX tags — the block nobody
re-reads and where a wrong coordinate hides indefinitely.

**The register is the point.** These wireframes are coarse on purpose:
*convincing is the failure mode.* A schematic claims nothing; a photorealistic
dashboard full of invented metrics claims a customer.

### 3.6 Device Mockup — `<DeviceFrame />`

A phone's silhouette — proportions, corner radius, notch — drawn flat in brand
tokens, with none of the gloss, bevel or chrome bezel that would make it the
pastiche `VISUAL_DNA.md` § 9 rejects. § 3.2 assigns one silhouette per object
class; a stage whose published copy says *"answers on WhatsApp"* is showing a
phone, and showing it in a browser window would be the wrong object.

### 3.7 Scroll Storytelling — `.reveal-view` + `.vos-spine--traced`

Not a component; two CSS behaviours that share one contract:

1. Pure CSS behind `@supports`. No IntersectionObserver, no hydration cost.
2. **Never on an LCP candidate** — an `opacity: 0` headline delays LCP by the
   reveal delay, which is why RC2 abandoned reveals on `/work` (LCP 4.7s there).
3. Always degrades to the **finished** state, never a stranded one.

---

## 4. What was taken from the ecosystem, and what was not

| Source | Component | Verdict |
|---|---|---|
| **Aceternity UI** | Tracing Beam | **Idea adopted, implementation replaced.** § 3.4. |
| **Magic UI** | Safari | **Structure adapted, surface refused** (RC4). Kept the constant-derived screen box and `aspect-ratio` wrapper; dropped the `safariPunch` mask (nothing is injected) and the photoreal macOS toolbar. |
| **Magic UI** | Border Beam | **Rebuilt** (RC3). Theirs needs `offset-path: rect()`, `motion/react` and Tailwind v4 — none compile here. A rotating `conic-gradient` behind a padding-box mask is the same look with zero JS. |
| **Magic UI** | AnimatedBeam | **Rejected twice** (RC3, RC4) — `getBoundingClientRect` per beam under a `ResizeObserver`. |
| **Motion Primitives** | scroll/stagger set | **Rejected.** Every primitive wraps `motion/react`. This phase was *removing* framer-motion from sections, not adding it. |
| **React Bits** | animated backgrounds | **Rejected.** Canvas/WebGL for effects the Ambient engine gets from two radial gradients. Licence is also NOASSERTION. |
| **Origin UI** | timeline | **Rejected.** The closest match to this section — and it is a static list with a border-left. It solves markup, and markup was not the problem. AGPL-3.0 besides. |
| **shadcn/ui registry** | — | **Not applicable.** No Radix dependency here; adding one to draw a diagram is a dependency for nothing. |
| **21st.dev / Magic MCP** | — | ⛔ not installed, needs an API key. |

**Zero dependencies added.** RC3, RC4 and this phase all shipped at zero.

The pattern across every row: **the ideas are good and the implementations are
priced for a different budget.** Almost all of them assume JavaScript is free.
This site measured that it is not — the constraint is 360 kB gzip and paint is
already three-quarters of the main thread — so an idea is worth adopting and an
implementation is usually worth replacing.

---

## 5. Applying the system to a new section

1. **Name the centerpiece** in one sentence (§ 5 of the DNA). If the sentence is
   "cards showing the features", stop.
2. **Check the silhouette** is not already used by another section's centerpiece
   (§ 3.2).
3. `<Ambient>` first — pick the tier from where the section sits in the arc.
4. Compose the centerpiece from `Spine` / `Artifact` / `Surface` / frames.
5. **One tier-4 surface. One gold element, marking an outcome.**
6. Every artifact declares `provenance`.
7. Run `scripts/probe-reduced-motion.mjs`, then **look at a screenshot.**

That last step is not ceremony. RC3 shipped beams at an invisible alpha, RC4
shipped wireframes Tailwind had tree-shaken into black bars, and this phase
shipped a scroll timeline frozen at a constant by an `overflow: hidden` three
lines away. All three compiled, all three type-checked, and none was visible in
an editor.

---

## 6. Migration order

The system is proven on one section. The rest migrate in this order — highest
duplication first, so each step deletes more than it adds.

| # | Section | What it gains |
|---|---|---|
| 1 | **`DigitalCraft`** | Extract its browser frame into `vos/Frames.tsx` as `BrowserFrame`; move its four wireframes onto `Artifact` (they already use the same shape-data format and hand-roll the provenance caption this engine emits). |
| 2 | **`WorkflowGlyph`** | Lift into `vos/Workflow.tsx`; its cadence becomes `cadence(4, 2.8)` instead of a hand-derived `0.42s`. |
| 3 | **`FeatureStorytelling`** | The last card grid. Needs a centerpiece decision before any engine helps — six bento cards is still six rectangles. |
| 4 | **`AutomationUniverse`, `AIInfrastructure`** | Adopt `Ambient` and `Surface`; keep their geometry, which is already correct. Cadences become `cadence()` calls. |
| 5 | **`AIDashboard`, `CaseStudy`, `Hero`, `FinalCTA`** | `Surface` + `Ambient` only. No composition change. |

**Nothing in this iteration touched sections 1–5.** The brief said redesign one
section and leave the others alone, and the point of proving a system on one
section is that the migration is then boring.

---

## 7. What the system cost

Measured on production builds, this session.

```
              before VOS      after VOS
  js  gzip      349.1 kB       347.5 kB      −1.6 kB   (budget 360)
  css gzip       14.0 kB        15.1 kB      +1.1 kB   (budget  40)
  largest        69.2 kB        69.2 kB      unchanged (budget 170)
  deps                 —              —      zero added
```

Verified alongside it: **axe 0 violations (34/34)**, the **full 418-test
Playwright suite green** (408 passed, 10 skipped, 0 failed), **CLS 0** on both
Lighthouse presets, and accessibility and SEO both **100**.

Seven engines and a fully redesigned flagship section, and the JavaScript
bundle **got smaller** — because the section it replaced was a client component
importing `framer-motion`, `useInView` and `useRef` to run an entrance stagger
and a travelling dot, and all of that is now CSS.

That is the argument for the whole system in one number: on this site, the
premium version is the cheap one.
