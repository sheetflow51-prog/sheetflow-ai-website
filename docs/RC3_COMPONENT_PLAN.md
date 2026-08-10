# RC3 — Component Plan

> Follows [`RC3_MOODBOARD.md`](./RC3_MOODBOARD.md). Written before implementation.
> Budget at plan time: **JS 351.0 / 360 kB (9.0 kB headroom) · CSS 11.6 / 40 kB
> (28.4 kB headroom)**. Zero new dependencies.

---

## The cost model that shapes every decision

`audit-bundle.mjs` sums **all** emitted chunks, so lazy-loading buys perceived
performance but no budget. The design consequence:

> **Geometry and motion go in CSS. JavaScript buys only state that CSS cannot
> hold.**

Concretely — the Automation Universe imports **no motion library**. Framer
Motion is already shipped and would be free to import, but it is not needed:
the only thing JS must track is *which node is active*. Everything else — the
beams, the traveling signal, the core rings, every transition — is CSS driven by
one data attribute. That is what keeps a signature interactive section inside
single-digit kilobytes.

---

## 1. `AutomationUniverse` — the signature section

**Replaces** `sections/WorkflowUniverse.tsx` (6-card grid).
**Closes** brief requirements 1, 3, 4, 6.

### Geometry

A hub-and-spoke network. One intelligence core at the centre; the six published
automations on an ellipse around it; a beam from each node to the core.

Layout is computed **at module scope** from polar coordinates — not measured
from the DOM:

```
viewBox 0 0 1000 620 · centre (500, 310) · radius (330, 210)
node i at angle = -90° + i × 60°
beam  i = quadratic Bézier from node centre to core edge,
          control point pulled 12 % toward the centre normal
```

Because the geometry is a constant, the SVG is **correct on first paint**, has
no `ResizeObserver`, no `getBoundingClientRect`, and no post-hydration reflow.
This is the specific improvement over Magic UI's `AnimatedBeam`, which measures
every beam in an effect and re-measures on every resize.

### The traveling signal — 0 kB JS

Each beam's `d` string is generated once and used **twice**: as the SVG
`<path d>`, and as the CSS `offset-path: path("…")` of a small glowing dot.

```css
.universe-signal {
  offset-path: path(var(--beam));   /* identical geometry, one source */
  animation: universe-travel 3.2s cubic-bezier(0.16,1,0.3,1) infinite;
  animation-delay: calc(var(--i) * 0.53s);   /* 6 × 0.53 ≈ one at a time */
}
```

Animating `offset-distance` moves a ~6 px dot: the repaint is the dot, not the
path's bounding box. This is the objection that killed `stroke-dashoffset`
path-draw in RC2 (`MOTION_INVENTORY.md` § 6), and this technique does not have
it. The stagger keeps **one** signal visible at a time, honouring
`VISUAL_DNA.md` § 2 — *total active motion budget: 3 simultaneous, ever*.

### Interaction and accessibility

- The six nodes are real `<button>`s inside a `<ul>`, rendered **once**.
- On `md+` they are absolutely positioned at the polar coordinates, overlaying
  the SVG. Below `md` they become a static flex column joined by a CSS trunk —
  a 6-node radial diagram is illegible at 360 px, so mobile gets a layout that
  reads, with **the same DOM and the same copy**.
- The `<svg>` is `aria-hidden` decoration. All meaning lives in the buttons and
  the detail panel.
- Active node is React state (`useState<number>`); hover, focus and click all
  set it, so pointer and keyboard reach identical states.
- The detail panel is `aria-live="polite"` and renders the selected
  automation's existing `title` / `body` / `impact` — **verbatim from the
  current `WORKFLOWS` array**. RC3 writes no new marketing copy, so nothing here
  needs content review.

### Cost

React state + a `<ul>` + one inline SVG. No motion library. **Target ≤ 3 kB
gzip JS**, ~2 kB CSS. Net JS change is close to zero, because the component it
replaces was itself a client component importing `framer-motion`,
`ScrollReveal` and `GlassCard`.

---

## 2. `WorkflowGlyph` — living pipelines

**Closes** brief requirement 2: *every case study must have a custom animated
workflow visualization.*

RC2 shipped the glyph static. RC3 adds motion and widens its reach.

| Change | Detail |
|---|---|
| Traveling signal | A dot crosses each `.glyph-link` connector, staggered by stage index so the pipeline reads left-to-right, one packet at a time. `transform: translateX` only. |
| `panel` on **all 10** case studies | RC2 § 6 item 4 recorded that client studies never show the large variant. They now do — below the screenshot, not instead of it, so the photographic evidence still leads. |
| Scroll-triggered, not load-triggered | The rail sits mid-page; animating on load means it has finished before it is seen. |

**Cost: 0 kB JS.** All CSS. The component stays a server component.

---

## 3. The depth system — `globals.css`

Where the 28.4 kB of CSS headroom gets spent.

| Addition | What it does | Applied to |
|---|---|---|
| `.border-beam` | Animated gradient border: a rotating `conic-gradient` behind a `padding-box` mask. Magic UI's Border Beam look **without** `offset-path: rect()`, Tailwind v4 syntax, or a single byte of JS. | Primary CTA panels, the Universe core |
| `.glass-elevated` | A fourth, genuinely distinct elevation — the current three translucencies sit within 1.5 % alpha of each other and do not read as a hierarchy. | Universe detail panel, dashboard |
| `.depth-parallax` | Scroll-linked ambient drift via `animation-timeline: view()`, behind `@supports`. | Section ambient washes |
| `.reveal-view` | The `/work` entrance choreography RC2 abandoned. | `/work`, `/work/[slug]` — **below the fold only** |

### How `.reveal-view` avoids the trap that stopped RC2

RC2 abandoned scroll reveals because an `opacity: 0` headline **delays LCP by
the reveal delay**, and `/work` already measures LCP at 4.7 s on mobile. Two
rules make it safe:

1. **It is never applied to an LCP candidate.** No headline, no hero, nothing
   above the fold — only content that requires a scroll to reach.
2. **It is pure CSS behind `@supports (animation-timeline: view())`.** Browsers
   without scroll-driven animations get today's static page, which is already
   good. No JavaScript, no IntersectionObserver, no hydration cost, and no way
   for an element to be stranded invisible — if the `@supports` test fails the
   rule never applies at all.

Progressive enhancement, 0 kB, and the LCP objection cannot fire.

---

## 4. `AIInfrastructure` — the second grid broken

The homepage's repetition needs breaking in **two** places, or the Universe just
becomes the one good section among four identical ones.

`AIInfrastructure` is about integrations converging on a platform — already a
network, currently drawn as three columns of tool pills. It becomes a **trunk
diagram**: a spine with branch connectors into grouped tool clusters, reusing
the glyph node vocabulary so it reads as the same system, not a new one.

Content unchanged — the existing `BRANCHES` array, re-laid-out.

---

## 5. Reduced motion

Every RC3 animation is gated, and the gate includes the failure RC2 found: the
global rule collapses `animation-duration` but leaves **`animation-delay`**
alone, stranding staggered content invisible for its full delay.

```css
@media (prefers-reduced-motion: reduce) {
  .universe-signal        { display: none; }              /* not 0.01ms — gone */
  .glyph-signal           { display: none; }
  .border-beam::before    { animation: none; }
  .universe-node,
  .reveal-view            { animation-delay: 0s !important; }
}
```

Signals are **removed**, not run at 0.01 ms. `VISUAL_DNA.md` § 5: *reduced
motion is a kill switch, never a slow-mo.* A dot that teleports along a path in
0.01 ms is a flash of noise, which is worse than no dot.

---

## 6. Order of work, and the gate after each step

1. `globals.css` — depth system and animations (CSS only, no risk to JS budget)
2. `AutomationUniverse` + wire into `page.tsx`, delete `WorkflowUniverse`
3. `WorkflowGlyph` signal + `panel` on all 10 case studies
4. `AIInfrastructure` trunk diagram
5. `.reveal-view` on `/work` and `/work/[slug]`
6. `npm run type-check && npm run lint && npm run build && npm run audit:bundle`
7. Playwright + axe
8. Before/after capture and `RC3_SUMMARY.md`

Bundle is re-measured after step 2 and step 4. If JS crosses 360 kB, the
Universe loses its React state before anything else loses its geometry — the
diagram is the deliverable, the interaction is the enhancement.

---

## 7. What this plan does not touch

`src/app/**/route.ts` · `lib/structured-data.ts` · `content/*.ts` (except
re-laying-out existing arrays) · `QualificationForm` · `RecoveryCalculator` ·
any test assertion · any `<h1>`–`<h3>` text · every SEO/GEO surface.

Architecture, SEO, GEO, accessibility, testing and documentation are frozen per
the brief. RC3 changes how the site **looks**, using content it has already
published.
