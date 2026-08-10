# RC3 — Visual Moodboard

> **2026-08-10.** Branch `feat/m01-foundation`. Written **before any RC3 code**,
> as the brief requires. Every number here was measured on the current build
> this session, not recalled.
>
> RC3's brief freezes architecture, SEO, GEO, accessibility, testing and
> documentation, and sets exactly one KPI: **does this look like a premium AI
> company to an Apple / Stripe / Vercel / Linear / Framer designer.**

---

## 1. The five-second verdict on the site as it stands

Put the homepage in front of that jury and the first reaction is not "premium AI
company." It is **"good template, competent execution."** That is a specific
failure with a specific cause, and it is not a matter of taste.

### The measured cause: the homepage is one component, repeated

Nine sections. **Five of them are the same object.**

| Section | Cards | The object |
|---|---|---|
| `WorkflowUniverse` | 6 | lucide icon in a rounded square → title → body → corner gradient glow |
| `FeatureStorytelling` | 6 | lucide icon in a rounded square → kicker → title → body → corner gradient glow |
| `DigitalCraft` | 4 | lucide icon in a rounded square → title → body → corner gradient glow |
| `AIInfrastructure` | 3-col | lucide icon → title → tool pills |
| `WorkflowPipeline` | stages | lucide icon in a `GlassCard` → title → body |

Greppable: all five import `lucide-react`, four instantiate `GlassCard`, and
`grid-cols` + `.map()` is the layout in every one. Only `AIDashboard` breaks the
rhythm, with a two-column split.

A visitor scrolling the homepage sees the same rectangle **25+ times**. The copy
changes; the visual system does not. Restraint — which this brand correctly
prizes — has decayed into repetition. `SHEETFLOW_VISUAL_DNA.md` § 7 Rule 1 asks
for *one big idea per scene*; what is actually shipping is *one shape per site*.

### The second cause: the product is never shown, only described

SheetFlow sells **systems that move data through stages**. That is inherently a
diagram. Yet on the homepage, every one of those systems is delivered as a
paragraph of prose inside a rounded rectangle. The single most visual product
category imaginable is being sold in body copy.

RC2 already proved the fix works: `WorkflowGlyph` turned five ~90 %-empty
`/work` tiles into pipeline diagrams using content the site had already
published, at **zero** JS cost. RC3 is that argument applied to the homepage.

### What is genuinely strong, and must not be touched

This is not a rescue. The foundation is better than most funded startups':

- A real token system — blue `#3B82F6` / gold `#E9A23B`, four surface tiers, one
  documented easing curve, a 4→256 doubling spacing scale.
- Signature primitives that already exist and are used: `.signature-edge`,
  `.signature-scan`, `.signature-grid`, `.cta-panel`, the aurora wash, film grain.
- `WorkflowGlyph` — a genuinely distinctive, accessible, zero-JS diagram.
- Type: a clamp-based cinematic scale with a gradient fade on headlines.
- Accessibility at **100**, axe clean across 12 combinations, **CLS 0.0000**.

RC3 adds to this vocabulary. It does not replace it.

---

## 2. The constraint that decides the medium

The brief says *"Do not increase bundle size unnecessarily. Lazy-load heavier
visual modules."* Measured against the current build, that sentence has sharper
teeth than it looks.

```
  js    gzip   351.0 kB  /  360 kB budget      →   9.0 kB headroom
  css   gzip    11.6 kB  /   40 kB budget      →  28.4 kB headroom
  largest chunk 69.2 kB  /  170 kB budget
```

Two facts change everything:

**1. `audit-bundle.mjs` sums _every_ emitted chunk, not first-load.** So
lazy-loading buys real user-perceived performance but **zero budget headroom**. A
dynamically imported module counts against the 360 kB exactly as a static one
does. "Lazy-load it" is not an escape hatch here.

**2. three.js is installed but _not shipped_.** `@react-three/fiber`, `drei`,
`postprocessing`, `three` and `@splinetool/*` are all in `package.json`, but
`AICore` and `IntelligenceCore` are imported by **no route**. Verified two ways:
no chunk contains `THREE` or `WebGLRenderer`, and the entire JS output is 1,087 kB
raw across 31 files — three.js alone is larger than that.

So the WebGL option is not "already paid for." It is a **~150 kB gzip
first-time cost against 9 kB of headroom** — a 42 % budget increase for one
section.

### Therefore: **SVG + CSS is RC3's medium, and that is an upgrade, not a concession**

The CSS budget has **28.4 kB of headroom — roughly 2.5× the entire current
stylesheet.** That is an enormous amount of unspent visual capability sitting in
the cheapest, most compatible, most accessible medium available.

And it is what the jury actually ships. Linear's and Vercel's signature graphics
are SVG and CSS. Stripe's diagrams are SVG. WebGL, on those sites, is reserved
for the one hero gradient — never for a diagram of labelled, readable stages.

A WebGL canvas would also be **opaque to screen readers**, which would put a
frozen constraint (accessibility, currently 100) at risk to gain nothing a
`<path>` cannot draw.

> **Founder's call, one word to overrule:** if the 3D wow-factor is wanted more
> than the budget gate, say so and RC3 will ship an R3F Automation Universe
> behind a dynamic import and raise `BUDGET_JS_KB` deliberately with the number
> recorded. Absent that instruction, RC3 holds the gate.

---

## 3. Reference evaluation — every library the brief named

Researched this session. "Adapted" means the idea ships, rewritten for this
codebase; "rejected" always carries the measurement that decided it.

| Source | What was evaluated | Verdict |
|---|---|---|
| **Magic UI — Animated Beam** | Full source retrieved. Per-beam `<svg>`, `getBoundingClientRect` + `ResizeObserver` per beam, `repeat: Infinity`. | **Adapted, re-engineered.** The idiom is exactly right for the Automation Universe. The implementation is not: 12 beams = 12 SVGs + 12 observers, measured after paint, so beams pop in late and re-thrash on resize. RC3 draws **one** SVG from a **declarative polar layout computed at module scope** — no DOM measurement, no observer, SSR-renderable, and correct on first paint. |
| **Magic UI — Border Beam** | Full source retrieved. `offset-path: rect()` + framer `offsetDistance`. | **Idea adapted, code rejected.** It is written in Tailwind **v4** syntax (`bg-linear-to-l`, `mask-intersect`, `border-(length:--x)`) and imports `motion/react`; this repo is Tailwind **3.4** + `framer-motion` v11, so it does not compile here. `offset-path: rect()` also has thin support. RC3 ships the same look as a **conic-gradient rotating mask — pure CSS, 0 kB JS**, universally supported. |
| **Aceternity UI** | Card Spotlight, Spotlight, Background Beams, Card Hover Effect. | **Partly already present.** `.feature-card::before` is already a mouse-tracked radial spotlight — Aceternity's Card Spotlight, shipped. Background Beams rejected: full-viewport animated SVG on a homepage measuring 52 on mobile. |
| **21st.dev** | Registry surface; largely a distribution layer over Magic UI / Aceternity primitives. | **No net-new adoption.** Same components as above, evaluated at source instead. |
| **Motion Primitives** | Animated cards, scroll animations, micro-interactions; shadcn-style copy-paste. | **Rejected as a dependency, one idea kept.** Its components assume Tailwind v4 + `motion`. Its *scroll-reveal choreography* is the pattern RC3 uses to close the `/work` gap. |
| **React Bits** | 110+ animated components, backgrounds and text effects. | **Rejected.** Its strengths are decorative backgrounds and text effects. `VISUAL_DNA.md` § 8 explicitly forbids the headline ones — letter-by-letter drops, glitch RGB, cursor trails. Adopting it would import an aesthetic this brand has already ratified against. |
| **Origin UI** | Radix-based forms and inputs. | **Rejected — wrong problem.** Form-focused. RC3 touches no forms; `QualificationForm` is frozen. |
| **shadcn/ui registry** | Used as the *retrieval mechanism* (`/r/<name>.json`) to read real source. | **Used for research, not installed.** Adding Radix + CVA plumbing to consume two components is not affordable at 9 kB. |
| **OGL** | Lightweight WebGL (~10–20 kB gzip vs three's ~150 kB). | **Rejected, and it was the closest call.** Genuinely affordable. But the Automation Universe is a diagram of *discrete, labelled, focusable* nodes — WebGL makes every one of those unreadable to assistive tech and adds a shader pipeline to draw what 40 lines of SVG draw better. |
| **React Three Fiber / Drei / postprocessing** | Already in `package.json`; **shipped in zero chunks.** | **Rejected — §2.** ~150 kB gzip against 9 kB headroom. |
| **GSAP** | **Already shipped** (`chunks/0a-vbyo~1530e.js`). `ScrollTrigger` already drives `ScrollReveal`. | **Adopted — free.** Marginal cost of more GSAP is ~0 kB. |
| **Framer Motion** | **Already shipped** across three chunks. | **Adopted — free.** |
| **Lottie** | JSON vector animation runtime. | **Rejected.** ~35 kB gzip runtime plus per-animation JSON, to play pre-baked motion that cannot respond to hover, focus or scroll. Everything RC3 needs is interactive. |
| **Rive** | Runtime + `.riv` assets. | **Rejected.** ~80 kB gzip runtime. Same objection as Lottie, at twice the price. |

**Net new dependencies added by RC3: zero.**

---

## 4. The visual direction

### The one sentence

> **Make the system visible.**

The brand promise is *a luxury intelligence system from the future*. Today the
site **describes** intelligence in prose. RC3 makes the site **show** it — the
same content, rendered as the diagram it always was.

Every RC3 move draws from data the site has **already published and reviewed**.
This is the RC2 rule, and it is why the visuals cannot drift from the truth:
there is no separate "diagram content" to fall out of sync, and no route by
which a diagram could invent a claim. It also keeps RC3 inside the frozen
content boundary — `DECISIONS.md` D24, and the `not-disclosed` union in
`content/work.ts` — without needing a single new sentence of copy.

### The four moves

**Move 1 — The Automation Universe.** A signature interactive network replacing
the six-card grid. A central intelligence core; input channels on the left arc
(WhatsApp, forms, calls, PDFs); outcomes on the right arc (calendar, CRM,
ledger, dashboard). Signal travels along real paths. Focusing or hovering a node
lights its route through the core and surfaces its detail. This is the section
the site does not currently have and the one the jury will remember.

**Move 2 — Living pipelines on every case study.** RC2's `WorkflowGlyph` is
static. RC3 sends a **signal packet down the pipeline** — one-shot, scroll-
triggered, CSS-only — and extends the large `panel` variant to **all ten** case
studies rather than the five internal ones (RC2 § 6, item 4).

**Move 3 — Depth, and light that responds.** Animated conic borders on decision
surfaces; an aurora that tracks scroll depth rather than sitting still; a real
glass elevation hierarchy instead of three near-identical translucencies; and
the scroll choreography `/work` never got — solved the way RC2 missed, by
revealing **only below-the-fold** content so the LCP headline is never held at
`opacity: 0`.

**Move 4 — Break the repetition.** At least one of the five identical grids
becomes a diagram, and every remaining section gains one memorable element that
is not another rounded rectangle.

### The atmospheric arc, preserved

`VISUAL_DNA.md` § 6.7 defines the emotional arc — *Awakening → Ambient →
Descent → Quiet → Close*. The Automation Universe lands in the **intensify**
phase, immediately after the hero. It is the loudest new thing on the site,
placed exactly where the arc already peaks. Nothing after it gets louder.

---

## 5. What RC3 refuses to build

Recorded here so each is a decision with a reason, not an oversight.

| Refused | The measurement that decided it |
|---|---|
| WebGL / R3F / Spline anything | ~150 kB gzip against **9.0 kB** headroom. §2. |
| OGL | Affordable, but makes labelled nodes unreadable to assistive tech. |
| Lottie / Rive | 35–80 kB gzip runtime for motion that cannot respond to input. |
| Full-viewport animated backgrounds | Homepage measures **52** on mobile; the cost is paint, and this is more paint. |
| Letter-by-letter text reveals, glitch, cursor trails | `VISUAL_DNA.md` § 8 forbids all three by name. |
| Page transitions | Needs a client wrapper on every route and risks the **CLS 0.0000** RC1 earned. |
| Reveal animation on any LCP headline | An `opacity: 0` headline delays LCP by the reveal delay. This is exactly what RC2 hit; RC3 does not repeat it. |
| Retuning homepage hero paint | The 52 is real, but it is a **performance** phase. The brief freezes performance and this is not that phase. |

---

## 6. How RC3 will be judged

| Question | Pass condition |
|---|---|
| Does the homepage still read as one repeated card? | No — at least two sections are diagrams, and no two adjacent sections share a layout. |
| Is there a section a visitor would describe to someone else? | The Automation Universe. |
| Does every case study show its system in motion? | All 10, animated, scroll-triggered. |
| Did the frozen gates hold? | types clean · lint 0 errors · **CSS ≤ 40 kB** · **JS ≤ 360 kB** · axe 0 violations · CLS 0 · 416 tests green. |
| Does reduced motion still work? | Every RC3 animation gated, including `animation-delay`. |
| New dependencies? | Zero. |

The plan that follows is [`RC3_COMPONENT_PLAN.md`](./RC3_COMPONENT_PLAN.md).
