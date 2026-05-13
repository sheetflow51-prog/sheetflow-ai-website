# SheetFlow Brand OS — Phase 8: Exportable Brand System

> The OS becomes useful when other surfaces — landing pages, dashboards, mobile apps, ad systems, partner integrations — can *consume* it as a package, not as a copy-paste artifact.
>
> This phase prepares the system for distribution.

---

## The export model

The Brand OS exports as a **single source-of-truth package**, mirrored across three formats so every consumer can speak its native language:

| Consumer | Format | Source |
|---|---|---|
| Web (Next.js, React, Vite) | `@sheetflow/brand-os` (npm) | `01_design-tokens/tokens.ts` + `02_motion-os/motion.ts` |
| Mobile (React Native) | `@sheetflow/brand-os/native` | Same TS, RN-shimmed adapters |
| Design (Figma) | `Figma Tokens Studio` JSON | `01_design-tokens/tokens.json` |
| Motion graphics (After Effects) | `.jsx` script + JSON keyframes | Generated from `motion.ts` |
| PDF / presentations | Style guide PDF + theme files | Static export of all phases |

A change in the source updates every consumer. A change in a consumer that does not flow back to the source is a brand violation.

---

## Proposed package structure

```
@sheetflow/brand-os/
├── package.json
├── README.md                          (links to all 8 phases)
├── src/
│   ├── tokens.ts                      ← Phase 1
│   ├── tokens.json
│   ├── motion.ts                      ← Phase 2
│   ├── components/                    ← Phase 3
│   │   ├── atoms/
│   │   │   ├── Kicker.tsx
│   │   │   ├── MonoLabel.tsx
│   │   │   ├── GradientText.tsx
│   │   │   ├── LivePulse.tsx
│   │   │   └── Bracket.tsx
│   │   ├── molecules/
│   │   │   ├── SheetCard.tsx
│   │   │   ├── BracketContainer.tsx
│   │   │   ├── TraceDivider.tsx
│   │   │   ├── SignatureCTA.tsx
│   │   │   ├── HoloPanel.tsx
│   │   │   └── IntelligenceState.tsx
│   │   ├── organisms/
│   │   │   ├── IntelligencePanel.tsx
│   │   │   ├── DashboardModule.tsx
│   │   │   ├── CinematicModal.tsx
│   │   │   └── HeroFrame.tsx
│   │   └── templates/
│   │       ├── MarketingPage.tsx
│   │       ├── ProductShell.tsx
│   │       └── DocsLayout.tsx
│   ├── content/                       ← Phase 4
│   │   ├── lexicon.ts                 (banned + approved words as data)
│   │   └── headlineLinter.ts          (validates against headline structures)
│   ├── motion-graphics/               ← Phase 5
│   │   ├── templates/
│   │   │   ├── the-watch.aep.json
│   │   │   ├── the-awakening.aep.json
│   │   │   └── the-architecture.aep.json
│   │   └── timing-presets.ts
│   ├── product/                       ← Phase 6
│   │   ├── dashboardGrid.ts
│   │   ├── intelligenceStates.ts
│   │   └── chartPalette.ts
│   └── governance/                    ← Phase 7
│       ├── checklist.md
│       ├── antiPatterns.ts            (machine-readable for linting)
│       └── auditTemplate.md
├── eslint-plugin-sheetflow/           (enforces tokens, motion, copy)
├── figma-sync/
│   └── tokens.figma.json
├── after-effects/
│   └── sheetflow-presets.jsx
└── docs/
    └── (rendered HTML version of all phases)
```

The directory mirrors the phase numbering of this Brand OS, so any contributor moving between the docs and the package gets zero cognitive friction.

---

## Token export — primary surface

`tokens.ts` is the **source**. Every other token format is generated from it.

### Build pipeline

```
tokens.ts ─┬─→ tokens.json           (platform-agnostic mirror)
           ├─→ tokens.css            (custom properties for non-Tailwind consumers)
           ├─→ tokens.figma.json     (Figma Tokens Studio import)
           ├─→ tokens.swift          (iOS — future)
           ├─→ tokens.kt             (Android — future)
           └─→ tokens.ae.jsx         (After Effects expressions)
```

A single `npm run build:tokens` command refreshes all six. Drift between formats is impossible because they are downstream artifacts.

### Tooling
- **Style Dictionary** (Amazon's open token transformer) — runs the pipeline
- **Figma Tokens Studio plugin** — pulls `tokens.figma.json` on demand
- **Custom AE script** — converts JSON keyframes into AE expressions

---

## Motion export

`motion.ts` exports Framer-Motion-compatible variants. For non-Framer consumers:

| Consumer | Adapter |
|---|---|
| GSAP | `motion-gsap.ts` — translates verbs to `gsap.timeline()` calls |
| React Native Reanimated | `motion-rn.ts` — translates verbs to `withTiming` + curves |
| Lottie | `motion-lottie.ts` — emits Lottie-compatible bezier values |
| After Effects | `motion-ae.jsx` — emits AE keyframe assistants and expressions |

Every adapter passes a conformance test ensuring identical perceived motion on a reference scene.

---

## Component export

Components ship as a tree-shakeable React package. No global CSS, no theme provider required (tokens are inlined). Three import styles supported:

```tsx
// Atomic (preferred for product UI)
import { Kicker, MonoLabel } from '@sheetflow/brand-os/atoms';

// Composite
import { SheetCard, SignatureCTA } from '@sheetflow/brand-os/molecules';

// Whole-template (preferred for marketing pages)
import { MarketingPage } from '@sheetflow/brand-os/templates';
```

### Versioning

Semver is followed strictly:
- **Patch** (`1.0.x`) — bug fixes, no visual change
- **Minor** (`1.x.0`) — new components, new tokens, no breaking changes
- **Major** (`x.0.0`) — token rename, motion contract change, removed component, **Constitution amendment ratified**

Major versions require the brand-steward sign-off described in Phase 7.

---

## Implementation standards

Every consumer of `@sheetflow/brand-os` must:

1. **Pin the version** — the brand evolves; consumers should opt in to evolution explicitly
2. **Run the linter** — the package ships an ESLint plugin enforcing tokens, motion curves, and banned words
3. **Pass the approval checklist** before shipping any new surface
4. **Subscribe to brand-os/amendments** — major changes are RFC'd before release

A consumer that bypasses tokens, ignores the linter, or ships without the checklist is *not* using the Brand OS — it is using a snapshot of it. Snapshots drift.

---

## Governance enforcement (machine-readable)

`@sheetflow/brand-os/governance/antiPatterns.ts` exports the anti-pattern list as data:

```ts
export const bannedWords = ['revolutionary', 'seamless', 'leverage', /* … */] as const;
export const bannedColors = ['#FF0000', '#00FF00', /* … */] as const;
export const bannedAesthetics = ['cyberpunk', 'rgb-gamer', 'memphis', /* … */] as const;
```

The ESLint plugin reads these arrays. A PR that introduces a banned word in copy fails CI before reaching review.

---

## Distribution channels

| Channel | Audience | Cadence |
|---|---|---|
| **npm** (`@sheetflow/brand-os`) | engineering | per release |
| **Figma library** (synced via plugin) | design | per release |
| **Style guide PDF** (rendered docs) | partners, vendors, leadership | per minor release |
| **Brand portal** (static site) | external collaborators (agencies, freelancers) | continuous |
| **Internal wiki link** to `brand-os/` source | every employee | live |

Documentation is *not* a separate artifact. The phase markdown files in this directory ARE the documentation, rendered to HTML for the brand portal.

---

## Onboarding new contributors

A new designer or engineer can be productive on the SheetFlow brand in **one day** by following:

1. **Read the Constitution** (`SHEETFLOW_VISUAL_DNA.md`, ~30 minutes)
2. **Skim the 8 phases** of this Brand OS (~60 minutes)
3. **Install `@sheetflow/brand-os`** in a sandbox repo (10 minutes)
4. **Build a "test surface"** — one section that uses ≥3 components, declares a chapter, and passes the approval checklist (~3 hours)
5. **Submit the test surface** for brand-steward review

Surfaces that pass on the first attempt indicate a contributor ready to ship. Surfaces that need >2 revisions indicate the contributor needs a deeper read of the Constitution before continuing.

---

## Future extensions

The Brand OS is built to absorb new mediums without architectural change:

| Future medium | What it inherits | What it adds |
|---|---|---|
| **Voice / TTS** | Mono register cadence, the three speaker modes | Synthesized voice character (whispered, processed) |
| **AR / spatial** | Atmosphere layers, lighting, geometric language | 3D camera + ambient occlusion specs |
| **CLI / terminal** | Mono register, status colors, the four feelings | Glyph set, prompt formatting |
| **Hardware product** | Material language (TBD), color palette, brand mark | Industrial design tokens |

Each future medium gets its own phase document. The pattern is set: inherit, drop, gain. The five-verb law and the three approved curves *never* drop.

---

## The package's promise

`@sheetflow/brand-os` exists so that:

- A new landing page is brand-correct **by default**
- A new dashboard component cannot ship without an `<IntelligenceState>` for its async surface
- A new ad campaign cannot ship with a banned word
- A new partner integration looks like SheetFlow even when SheetFlow's team didn't build it

The package is not a style guide. It is **operational brand DNA, embedded in code, enforced at build time**.
