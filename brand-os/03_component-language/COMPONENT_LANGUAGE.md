# SheetFlow Brand OS — Phase 3: Component Language System

> Components are the brand's vocabulary. Every primitive carries the Constitution's DNA — invisibly, automatically, by default.
>
> If a developer can build a SheetFlow surface *without thinking about the Constitution*, the system has succeeded.

---

## Principle: inheritance over imposition

A SheetFlow component does not enforce the brand by warning developers. It enforces it by being *the only ergonomic option*. Wrong is harder than right.

- ✅ `<SheetCard>` ships with grain, scan, glass, and inner highlight by default.
- ❌ Documenting "remember to add grain" — that document will be ignored within a quarter.

---

## The component tier system

| Tier | Examples | Purpose |
|---|---|---|
| **Atoms** | `<Kicker>`, `<MonoLabel>`, `<LivePulse>`, `<GradientText>`, `<Bracket>` | Single-purpose primitives that encode a signature behavior |
| **Molecules** | `<SheetCard>`, `<TraceDivider>`, `<SignatureCTA>`, `<HoloPanel>` | Compositions of atoms that form recurring brand units |
| **Organisms** | `<IntelligencePanel>`, `<DashboardModule>`, `<CinematicModal>`, `<HeroFrame>` | Section- or screen-level structures |
| **Templates** | `<MarketingPage>`, `<ProductShell>`, `<DocsLayout>` | Whole-page chassis that compose organisms |

Each tier consumes only its own and lower tiers. An atom never imports a molecule.

---

## Core primitives — the brand's twenty most-used parts

### Atoms

#### `<Kicker>`
Mono uppercase, 11px, tracking 0.12em, color `ink.400`. The brand's eyebrow voice. Always above a headline; never alone.

#### `<MonoLabel>`
Mono regular, used for any text that the AI itself would generate: status, data, log lines, code, file paths. The mono *is the AI's voice*.

#### `<GradientText>`
Wraps a phrase in `gradient.headline` (white→55%) by default, or `gradient.accent` (indigo→violet→cyan) when the prop `tone="accent"` is set. Used only on proper-noun emphasis: *finally alive*, *let it watch itself*.

#### `<LivePulse>`
6px green `signal.success` dot, 2s sine 1→0.85 scale + 1→0.5 opacity. The brand's "alive" indicator. Wraps a `MonoLabel` saying `LIVE` / `WATCHING` / `ACTIVE`.

#### `<Bracket>`
SVG corner bracket. Geometry from `tokens.bracket`. `direction="tl|tr|bl|br"`. Composes into `<BracketContainer>`.

#### `<TraceLine>`
SVG path that draws via `motion.trace.draw` when in view. Used for dividers, connectors, the section handoff stroke.

### Molecules

#### `<SheetCard>`
The card system. Three variants:
- `glass` — `surface.1` + backdrop blur + grain + 1px hairline + inner highlight
- `holo` — adds the 4px scan-line `::after` overlay (marks as holographic)
- `panel` — `surface.2` + sharper hairline, no scan (used for dashboard modules)

All three inherit `glow.card` rest, `glow.cardHover` on `hover.consideration`. `radius.lg` (12px). Padding `space.6` (24px) minimum.

#### `<BracketContainer>`
Renders four `<Bracket>` corners around its children. `tone="indigo"|"violet"|"quiet"`. Used to mark *something the AI is currently inspecting* — the bracket is the brand's selection cursor.

#### `<TraceDivider>`
Section break: 1px gradient line (`gradient.divider`) that draws on enter. Used at section boundaries instead of hard rules.

#### `<SignatureCTA>`
The single CTA primitive. Three variants:
- `primary` — indigo halo + magnetic + spring (`hover.decision`)
- `ghost` — outlined, no halo, scan tier
- `arrow` — text + arrow that travels right on hover

`primary` is reserved for the *one* button per section that drives the funnel. Never two primaries on the same screen.

#### `<HoloPanel>`
A `SheetCard variant="holo"` with a `<TraceDivider>` header strip and a `<Kicker>` slot. The base unit of any "intelligence surface" (dashboard tile, AI inspector, log feed).

#### `<IntelligenceState>`
Renders one of: `idle | watching | thinking | resolved | alert`. Each state has a defined glyph + color + motion:
- `idle`: ghost dot, no motion
- `watching`: green pulse
- `thinking`: violet shimmer (3s shimmer loop)
- `resolved`: indigo, 1s fade-in checkmark
- `alert`: amber, 2s pulse with brackets

A SheetFlow product **never** uses a generic spinner. It uses an `IntelligenceState`.

### Organisms

#### `<IntelligencePanel>`
Composes `<HoloPanel>` + `<IntelligenceState>` + `<MonoLabel>` data feed + optional `<BracketContainer>` highlight. The canonical "AI is watching this" surface.

#### `<DashboardModule>`
Grid-friendly tile (12-col grid, span configurable). Composes `<HoloPanel>` + chart primitives + `<LivePulse>`. All dashboard tiles use this — never a one-off card.

#### `<CinematicModal>`
Modal that uses `enter.monumental` instead of standard scale-in. Backdrop is `vignette` gradient. Closes with reverse cinematic. Used for: confirmation flows, paywalls, product detail. Never for trivial popovers.

#### `<HeroFrame>`
Full-bleed hero chassis. Composes: aurora layer + grain layer + content slot + Awakening overlay slot. Every marketing top-of-page uses this; the inner content varies.

### Templates

#### `<MarketingPage>`
`<HeroFrame>` → N × `<Section>` (each declaring a `chapter` prop) → `<FinalCTA>` → `<Footer>`. Sections inherit pacing from chapter via `motion.pacing`.

#### `<ProductShell>`
Sidebar + top-strip + content area. Contains: command-palette mount, AI status indicator (`<IntelligenceState>`), keyboard shortcut overlay. The base of every dashboard.

#### `<DocsLayout>`
Three-column: TOC, content, page-anchor strip. Mono kicker per section. The brand still applies — but at 60% atmosphere intensity (read-heavy contexts dim ambient motion).

---

## Composition rules

### 1. Surface stacking
Surfaces compose Z-stack ascending: a `level-2` panel may sit on a `level-1` card, but never the reverse. **Glass-on-glass is forbidden** — it muddies the depth signal. Use elevation instead.

### 2. Hairlines, not borders
A SheetFlow card uses a 1px inset highlight (`glow.innerHighlight`) plus the surface contrast. Hard borders (`border: 1px solid`) are forbidden on glass surfaces. They flatten the depth.

### 3. One primary per section
Exactly one `SignatureCTA variant="primary"` per visible section. A second primary is a brand violation.

### 4. Mono is the AI's voice
Any text generated by the system, any data, any status, any code — `<MonoLabel>`. Sans is for prose. Mono is for the AI.

### 5. The kicker is mandatory above section headlines
Marketing sections begin with `<Kicker>` → `<headline>`. Naked headlines without a kicker read as "blog post," not "intelligence system."

---

## Component contract

Every SheetFlow component must:

1. **Inherit tokens**, never hardcode values. (`tokens.color.accent.DEFAULT`, never `'#6366F1'`.)
2. **Inherit motion**, never write fresh transitions. (`motion.enter.base`, never `{ duration: 0.6 }`.)
3. **Respect reduced motion**. The component must remain functional and beautiful with motion disabled.
4. **Declare its tier** — atom / molecule / organism / template. Listed in the component's JSDoc.
5. **Default to brand-correct**. No prop should be required to make the component look like SheetFlow. Required props are *content*, not *style*.
6. **Reject unbranded variants**. There is no `<SheetCard variant="flat">` — flat is not part of the brand.

---

## Anti-pattern list (component-specific)

- ❌ `<Card>` with no scan, no grain, no hairline (use `<SheetCard>`)
- ❌ `<Button>` without tier classification (use `<SignatureCTA>` or scan-tier link)
- ❌ Status indicated by a generic `<Spinner>` (use `<IntelligenceState>`)
- ❌ Modals that use `scale: 0.95 → 1` without `enter.monumental` choreography
- ❌ Section headers without `<Kicker>`
- ❌ Two primaries on one screen
- ❌ Borders on glass surfaces
- ❌ Custom cursors per-component (the global cursor *is* the cursor)

---

## Where these live in the website

| Component | Existing path |
|---|---|
| `<Brackets>` | `src/components/signature/Brackets.tsx` |
| `<SignatureFrame>` | `src/components/signature/SignatureFrame.tsx` |
| `<Trace>` | `src/components/signature/Trace.tsx` |
| `<SectionHandoff>` | `src/components/signature/SectionHandoff.tsx` |
| `<Awakening>` | `src/components/signature/Awakening.tsx` |
| `<Magnetic>` / `<TiltCard>` | `src/components/motion/` |
| `<ScrollReveal>` / `<Parallax>` / `<Breathing>` | `src/components/motion/` |

Future additions land in `src/components/brand/` and re-export from `@/brand-os/components`.
