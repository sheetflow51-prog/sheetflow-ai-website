# SHEETFLOW AI — BRAND OPERATING SYSTEM

> The master operational intelligence layer behind every SheetFlow asset, surface, and product.
>
> Where the Constitution defines *what we believe*, the Brand OS defines *how every future thing inherits it.*

---

## North Star

> **A luxury intelligence system from the future.**

Every token, every motion, every component, every word, every frame of video — derives from this sentence. If a decision does not contribute to it, the decision is wrong.

---

## What this is

The SheetFlow website is shipped. Its DNA is captured in [`SHEETFLOW_VISUAL_DNA.md`](./SHEETFLOW_VISUAL_DNA.md) — the Constitution.

The Brand OS is the **operational layer** that turns the Constitution into a reusable cinematic intelligence ecosystem. It allows a new landing page, dashboard, mobile app, ad, reel, presentation, or PDF to inherit the same DNA — automatically, by default, without re-deciding.

The Brand OS is not documentation. It is **code, conventions, and contracts** organized so that wrong is harder than right.

---

## Architecture — the eight phases

```
brand-os/
├── 01_design-tokens/          The atoms: color, motion, atmosphere, geometry
├── 02_motion-os/              The verbs: enter, settle, breathe, travel, trace
├── 03_component-language/     The vocabulary: cards, panels, CTAs, modals
├── 04_content-dna/            The voice: cadence, lexicon, headline structures
├── 05_social-video/           The motion-graphics surface: reels, ads, trailers
├── 06_product-ui/             The working register: dashboards, AI panels, charts
├── 07_governance/             The defense layer: checklists, audits, anti-patterns
└── 08_exportable/             The distribution layer: package, sync, versioning
```

Each phase has its own document. This master file is the **index, the reading order, and the operational protocol**.

---

## The eight phases — at a glance

### Phase 1 — Design Token System
**File:** [`brand-os/01_design-tokens/TOKENS.md`](./brand-os/01_design-tokens/TOKENS.md)
**Source:** [`tokens.ts`](./brand-os/01_design-tokens/tokens.ts) · [`tokens.json`](./brand-os/01_design-tokens/tokens.json)

Production-grade tokens covering color, atmosphere, spacing, glow, timing, easing, blur, opacity, signature gradients, scan textures, bracket geometry, typography, z-index, and breakpoints. **No hardcoded values are permitted in any consumer.** A missing value is added to the system, never improvised.

The token system is the contract every other phase consumes. It enforces the Constitution's color, motion, and atmospheric laws *by being the only ergonomic option*.

### Phase 2 — Motion Operating System
**File:** [`brand-os/02_motion-os/MOTION_OS.md`](./brand-os/02_motion-os/MOTION_OS.md)
**Source:** [`motion.ts`](./brand-os/02_motion-os/motion.ts)

The cinematic motion library. Encodes the **five-verb law** (enter, settle, breathe, travel, trace), the **two-and-a-half curve doctrine**, the **one-second universe** (1600ms ceiling), the **80ms stagger**, and the **3-simultaneous-active-motion budget**.

Includes plug-and-play Framer Motion variants, hover choreography by interaction tier, emotional pacing presets per chapter, environmental motion (aurora, particles, scan drift), and the reduced-motion contract.

### Phase 3 — Component Language System
**File:** [`brand-os/03_component-language/COMPONENT_LANGUAGE.md`](./brand-os/03_component-language/COMPONENT_LANGUAGE.md)

The reusable cinematic primitives organized by tier (atoms → molecules → organisms → templates). Twenty canonical components — `<Kicker>`, `<MonoLabel>`, `<GradientText>`, `<LivePulse>`, `<Bracket>`, `<SheetCard>`, `<TraceDivider>`, `<SignatureCTA>`, `<HoloPanel>`, `<IntelligenceState>`, `<IntelligencePanel>`, `<DashboardModule>`, `<CinematicModal>`, `<HeroFrame>`, etc.

Every component inherits the Constitution by default and rejects unbranded variants by design.

### Phase 4 — Content DNA System
**File:** [`brand-os/04_content-dna/SHEETFLOW_CONTENT_DNA.md`](./brand-os/04_content-dna/SHEETFLOW_CONTENT_DNA.md)

The voice: *a quiet operator that knows your spreadsheet better than you do.*

Three speaker modes (Statement / System / Body), three approved headline structures, four CTA verbs, the approved + banned lexicon, emotional pacing arc (Awakening → Descent → Invitation), and the five-screen rule. Includes the copy-review checklist and a brief scaffold for new surfaces.

### Phase 5 — Social + Video System
**File:** [`brand-os/05_social-video/SOCIAL_VIDEO_SYSTEM.md`](./brand-os/05_social-video/SOCIAL_VIDEO_SYSTEM.md)

The cinematic identity transfer to motion graphics. Format specs per surface (feed, reel, short, hero trailer, display ad), the four approved cinematic transitions, the legibility law for text timing, atmospheric rules for video (camera-tracked aurora, mandatory grain, three icosahedron lighting states), audio mood direction (texture not melody), and the three approved reel templates: *The Watch*, *The Awakening*, *The Architecture*.

### Phase 6 — Product UI Expansion
**File:** [`brand-os/06_product-ui/PRODUCT_UI_EXPANSION.md`](./brand-os/06_product-ui/PRODUCT_UI_EXPANSION.md)

The brand in working register. Defines what product UI inherits, drops, and gains relative to the website. The 12-column dashboard grid grammar, the canonical Inspector AI panel, the five intelligence states (idle / watching / thinking / resolved / alert) replacing generic spinners, futuristic empty states, the alert language ladder (info / warning / danger), the chart palette + chart-type vocabulary, and the 30%-faster product motion timing.

### Phase 7 — Experience Governance
**File:** [`brand-os/07_governance/EXPERIENCE_GOVERNANCE.md`](./brand-os/07_governance/EXPERIENCE_GOVERNANCE.md)

The defense layer. Four governance instruments: the **approval checklist** (per-surface gate), the **anti-pattern detector** (live registry of rejected patterns), the **quarterly visual + motion audit**, and the **atmosphere integrity framework** (page-level invariants).

Includes the "does this feel like SheetFlow?" 30-second evaluation, the decision protocol when in doubt, role assignments, and the amendment process for evolving the Brand OS.

### Phase 8 — Exportable Brand System
**File:** [`brand-os/08_exportable/EXPORTABLE_BRAND_SYSTEM.md`](./brand-os/08_exportable/EXPORTABLE_BRAND_SYSTEM.md)

The distribution layer. Package structure for `@sheetflow/brand-os`, the build pipeline (Style Dictionary → web/mobile/Figma/AE), motion adapters (GSAP, Reanimated, Lottie), component export tree, semver discipline, machine-readable governance enforcement (ESLint plugin), distribution channels, and the contributor onboarding path.

The Brand OS becomes a *consumable package*, not a copy-paste artifact.

---

## Inheritance map — how an asset is built

A new SheetFlow asset is composed top-down through the phases:

```
1. Tokens         → palette, timing, geometry
2. Motion OS      → which verbs apply, what curves, what stagger
3. Components     → the building blocks compose the layout
4. Content        → the words inside, the cadence, the CTA verb
5. Surface-specific:
     5a. Social/Video — if motion graphics
     5b. Product UI   — if working tool
6. Governance     → checked against the gate before shipping
7. Export         → packaged version pinned, linter passing
```

A team that follows this chain in order produces a brand-correct surface on the first attempt.

---

## The four canonical feelings

Every SheetFlow surface produces *one* of these on the user. A surface producing a fifth, undefined feeling is rejected.

| Feeling | Where it lives | Triggered by |
|---|---|---|
| **Awakening** | Hero of any marketing surface, signup completion | Cinematic flourish, quiet then bright |
| **Descent** | Workflow / explanation surfaces, dashboards | Atmosphere intensifies, the user feels they are *entering* something |
| **Invitation** | Final CTAs, conversion modals, onboarding handoffs | Vignette closes around the offer; the moment is *held* |
| **Intelligence** | Always present (cursor on web, Inspector on product) | Dual-layer cursor, mono register, AI watching honestly |

If a new surface produces none of the four, the surface is wrong — even if every individual decision passes review.

---

## What we never do — the master veto list

These vetoes apply across every phase, every medium, every team member.

### Forbidden words
*revolutionary · seamless · leverage · AI-powered · unleash · supercharge · next-gen · cutting-edge · frictionless · empower · transform · solution · workflow*

### Forbidden visual moves
*lens flare · animated gradient color shifting · hard color stops · ALL CAPS / italic display headlines · border-on-border · glass-on-glass · pure white from a non-text source · hard-edge shadows*

### Forbidden motion moves
*bounce on first impression · cursor trails · letter-by-letter drops · glitch RGB · scroll-jacked horizontal · parallax slower than its background · hover sounds · random hover scale · slow-mo as reduced-motion fallback*

### Forbidden audio moves
*autoplay · hover sounds default-on · click sounds louder than ambient · music with melody · trailer hits · synth risers · dry voice*

### Forbidden aesthetics
*cyberpunk · RGB gamer · Memphis / postmodern · skeuomorphism · brutalist tech · generic AI startup · crypto/Web3 · healthcare-soft*

A surface that touches any of these is not "off-brand at the margins" — it is *off-brand entirely* and is rebuilt or removed.

---

## Operational targets

The Brand OS exists to make the following true:

| Target | Status |
|---|---|
| **A new landing page is brand-correct by default** | Phase 1–4 in place |
| **A new component cannot ship without inheriting the Constitution** | Phase 3 contract |
| **A new ad cannot ship with a banned word** | Phase 4 + 8 (linter) |
| **A new dashboard cannot ship with a generic spinner** | Phase 6 (`<IntelligenceState>`) |
| **A new partner integration looks like SheetFlow without our team building it** | Phase 8 (exportable) |
| **A surface that drifts is caught quarterly** | Phase 7 (audit) |
| **A surface that drifts is caught at PR time** | Phase 7 + 8 (linter) |

Each target is binary — either the system enforces it or it doesn't. The Brand OS is judged by whether it makes these statements automatically true.

---

## Reading order

For a new contributor, read in this order:

1. [`SHEETFLOW_VISUAL_DNA.md`](./SHEETFLOW_VISUAL_DNA.md) — the Constitution. Read in full.
2. This file. Skim. Identify which phases your work touches.
3. The phase docs you need, in order. (Tokens always first.)
4. The phase you'll *contribute to* — read in full.
5. Phase 7 (Governance) — read before submitting any surface.

Total time to operational fluency: **one day**. Time to ship a brand-correct surface: **first attempt** if Phase 7's checklist passes.

---

## What this becomes

The Brand OS is the foundation for every future SheetFlow surface:

- 🌐 Marketing landing pages (other than the flagship)
- 📊 Dashboards and product UI
- 📱 Mobile apps (iOS, Android)
- 🎬 Reels, ads, trailers, motion graphics
- 📑 Presentations and PDFs
- ✉️ Onboarding emails and lifecycle communications
- 📡 Social media (Instagram, TikTok, YouTube, LinkedIn, X)
- 🔌 Partner integrations and embedded surfaces
- 🤝 Sales decks and investor materials

Every one of them inherits the same atmosphere, the same motion vocabulary, the same voice, the same restraint. Every one of them feels like *the same luxury intelligence system from the future*.

---

## Final principle

The Brand OS is not a constraint on creativity. It is the **container that makes creativity recognizable as SheetFlow.**

A constraint-free brand drifts into the average. A brand with the right constraints — fewer than people think — produces a singular thing, repeated across a thousand surfaces, and remembered.

> Restraint is the signature.
> Atmosphere is the substrate.
> Intelligence is the voice.
> Repeat. Repeat. Repeat.

---

*— SheetFlow Brand Operating System v1.0*
