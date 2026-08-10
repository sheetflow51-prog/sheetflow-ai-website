# The Design Operating System

> **Written 2026-08-10, during RC4.** One primary visual language per section,
> and the reasoning that assigns it.
>
> This document exists because "make each section feel different" and "make the
> site feel like one product" pull against each other, and without a written
> rule the second one always loses — section by section, each change locally
> defensible, until the page is a sampler.

---

## 1. The conflict this document had to resolve first

The RC4 brief asks for a design system combining nine named styles: Spatial UI,
Liquid Glass, Glassmorphism, Neomorphism, Skeuomorphism, Claymorphism,
Minimalism, Maximalism and Brutalism.

**`SHEETFLOW_VISUAL_DNA.md` § 9 rejects three of those by name**, and § 7 rules
out a fourth:

| Style asked for | Standing constraint |
|---|---|
| **Skeuomorphism** | § 9: *"Skeuomorphism 2.0 (faux 3D buttons, wood textures, leather) — reads as nostalgic"* |
| **Brutalism** | § 9: *"Brutalist tech (Helvetica + raw HTML + sharp grid) — reads as anti-design, anti-luxury"* |
| **Neomorphism / Claymorphism** | Not named, but both are soft-extruded faux-3D — the same family § 9 rejects, and adjacent to its *"Healthcare-soft"* row |
| **Maximalism** | § 7 Rule 7: *"Restraint is louder than loudness"*; § 2 caps simultaneous active motion at three |

§ 9 also states the test that decides all four: *"Does this aesthetic predate or
exceed luxury? If predates (skeuomorphism, brutalist), it's regressive."*

**This was not resolved by picking a side.** Each rejected style was split into
the *structural principle* it encodes and the *surface treatment* it is
usually delivered with. The principles are used. The surfaces are not.

| Style | Principle kept | Surface refused |
|---|---|---|
| Skeuomorphism | Depict an object the visitor already recognises, so no legend is needed | Faux-3D bevels, glossy plastic, macOS traffic lights, textures |
| Brutalism | Structural honesty — hard rules, mono labels, no decoration where none is earned | Raw-HTML look, unstyled type, deliberate ugliness |
| Neomorphism / Claymorphism | Surfaces should read as *lifted* rather than drawn | Extruded pillows, dual-shadow embossing, pastel |
| Maximalism | Density is allowed where density is the message | Competing simultaneous motion, colour riot |

The clearest case is § 7 of this document's own subject: `DigitalCraft` renders
a **browser window**, which is object-mimicry — the skeuomorphic principle,
used deliberately. Its window chrome is drawn flat in brand tokens, and its
three dots are grey rather than red/amber/green, because the coloured version is
the macOS pastiche § 9 names.

> **One sentence overrules this.** If the founder wants the literal nine-style
> brief — including faux-3D surfaces and a brutalist section — say so and § 9 is
> amended rather than worked around. Absent that, the written constraint wins,
> because it is the older and more considered of the two instructions, and
> because it is reversible in a way that a brand drift is not.

---

## 2. The assignment

One primary language per section. A section may borrow a *token* from another
(everything shares the palette and the easing curve), but never a second
language.

| # | Section | Primary language | Centerpiece | State |
|---|---|---|---|---|
| 1 | `Hero` | **Atmospheric minimalism** — type-led, four ambient depth layers | The headline, the Brackets/Trace signature | Shipped, pre-RC3 |
| 2 | `AutomationUniverse` | **Spatial UI** — objects arranged in depth, orbiting one core | Radial constellation, six beams, travelling signal | **RC3** |
| 3 | `AIDashboard` | **Glassmorphism** — the one section where glass *is* the metaphor | Live metric surface, tilt, counters | Shipped, pre-RC3 |
| 4 | `WorkflowPipeline` | **Diagrammatic** — a directed sequence, read left to right | Five stages, packet on the connectors | ⚠ still a card grid |
| 5 | `FeatureStorytelling` | **Bento density** (restrained maximalism) — six pillars, unequal weight | Asymmetric bento | ⚠ still a card grid |
| 6 | `CaseStudy` | **Editorial minimalism** — photograph first, claim second | Real client screenshots | Shipped, pre-RC3 |
| 7 | `DigitalCraft` | **Device framing** (skeuomorphic principle, flat surface) | Browser frame, four wireframes, one address bar | **RC4** |
| 8 | `AIInfrastructure` | **Blueprint** — hub, bus, stubs; a systems drawing | Bilateral distribution tree | **RC4** |
| 9 | `Faq` | **Structural minimalism** (brutalist principle, luxury surface) | Hard rules, no glass, type only | Shipped, pre-RC3 |
| 10 | `FinalCTA` | **Atmospheric minimalism** — deliberately rhymes with the Hero | Brackets/Trace closing vignette | Shipped, pre-RC3 |

**Liquid Glass** is not assigned to a section. It is the *elevation ladder*
(`.glass-subtle` → `.glass` → `.glass-strong` → `.glass-elevated`) that every
section draws from, which is what stops ten languages becoming ten unrelated
pages.

---

## 3. What binds ten languages into one product

Four things are constant everywhere, and they are the entire reason the page
does not read as a sampler:

1. **One palette.** Blue `#3B82F6` family plus gold `#E9A23B`, on `#060608`.
   Token classes only, never a raw hex in a component.
2. **One easing curve.** `cubic-bezier(0.16, 1, 0.3, 1)`, in every transition in
   every section.
3. **One motion budget.** Three simultaneous active motions, ever
   (`VISUAL_DNA.md` § 2). Every travelling signal on this site is staggered so
   exactly one is in flight: six Universe beams at 0.53s across 3.2s, six
   infrastructure stubs at 0.6s across 3.6s.
4. **One brand mark.** The three stacked rules — spreadsheet rows,
   `VISUAL_DNA.md` § 6.1 — appear inside the Universe core *and* the
   infrastructure hub. It is what makes them the same company's two drawings
   rather than two drawings.

The infrastructure hub is a **plate**, not a disc, specifically because the
Universe already owns the glowing circle. Two radial cores on one page would be
the repetition RC3 exists to remove, reintroduced one section later.

---

## 4. Open-source study, and what was actually taken

The brief says to adapt mature open-source implementations before writing UI.
Recorded honestly, including where the answer was "read it, then didn't use it":

| Source | Component | Outcome |
|---|---|---|
| **Magic UI** | `AnimatedBeam` | Full source read (RC3). **Rejected on cost**: `getBoundingClientRect` per beam inside an effect, re-measured under a `ResizeObserver`. Twelve beams is twelve observers and a frame of pop-in. Replaced by module-scope polar geometry that is correct on first paint. |
| **Magic UI** | `Border Beam` | **Adapted.** Its `offset-path: rect()` + `motion/react` + Tailwind v4 syntax compile in none of this repo (Tailwind 3.4, framer-motion v11). Rebuilt as a rotating `conic-gradient` behind a padding-box mask — same look, zero JS. |
| **Magic UI** | `Safari` | Full registry source retrieved and read (RC4). **Structure adapted, surface refused.** Kept: constant-derived screen box, `aspect-ratio` wrapper, no measurement. Dropped: the `safariPunch` mask (it exists to put injected media behind SVG chrome; nothing is injected here), and the photoreal macOS toolbar per § 9. |
| **21st.dev / Magic MCP** | — | ⛔ not installed, needs an API key. Nothing was wanted from it. |
| **Aceternity / React Bits / Motion Primitives** | — | Surveyed. Every candidate for these two sections is WebGL, Lottie or a motion-library scroll effect — all three ruled out by § 5 below. |
| **shadcn/ui registry** | — | Not applicable: this repo has its own primitives (`GlassCard`, `Button`, `Badge`) and no Radix dependency. Adding one to draw a diagram would be a dependency for nothing. |

**Zero new dependencies were added in RC3 or RC4.**

---

## 5. The constraint that chose SVG and CSS over everything fashionable

Measured before RC4 wrote any code:

```
  js    gzip   351.6 kB / 360 kB   →   8.4 kB headroom
  css   gzip    12.8 kB /  40 kB   →  27.2 kB headroom
```

`audit-bundle.mjs` sums **every emitted chunk**, not first-load. So the brief's
own escape hatch — "lazy-load heavier modules" — buys real perceived
performance and **zero budget**: a dynamic import counts exactly as a static
one. Three.js is in `package.json` and ships in zero chunks, so WebGL was never
already paid for; it is a ~150 kB gzip first-time cost against 8.4 kB.

That is why both RC4 sections are SVG and CSS. It is also why both ended up
**cheaper than what they replaced**:

```
  js    gzip   351.6 kB  →  349.1 kB    −2.5 kB
  css   gzip    12.8 kB  →   14.0 kB    +1.2 kB
```

Two client components became server components. `AIInfrastructure` dropped
`framer-motion`, `useInView`, `Breathing` and `prefersReducedMotion`;
`DigitalCraft` dropped `framer-motion`, `ScrollReveal` and `GlassCard`. Neither
holds state: a distribution bus animates on its own schedule, and a
one-of-four choice is what a radio group is.

---

## 6. MCP availability, re-tested this session

`BLOCKERS.md` carries a standing instruction: re-test every ⛔ row before
repeating its conclusion. Done, and **it changed two rows.**

| Server | Configured | This session | Note |
|---|---|---|---|
| **context7** | ✅ `.mcp.json` | ⛔ **did not connect** | Previously recorded *"✅ available, not needed"*. That is now stale. Substituted by `WebFetch` against the Magic UI registry, which is how the `Safari` source was retrieved. |
| **chrome-devtools** | ✅ `.mcp.json` | ⛔ **did not connect** | Previously *"❌ not exposed"*; it is configured, and still unavailable. No impact — `npm run trace` / `npm run profile` are the repo's own CDP tooling. |
| **playwright** | ✅ `.mcp.json` | ⛔ **did not connect** | No impact whatsoever: the repo's own `@playwright/test` devDependency ran all 198 tests and every screenshot in this phase. |
| **sequential-thinking** | ✅ `.mcp.json` | ⛔ did not connect | No impact. |
| **filesystem** | ✅ `.mcp.json` | ⛔ did not connect | No impact — built-in file tools cover it. |
| **github** | ✅ `.mcp.json` | ⛔ needs auth | Non-interactive session cannot complete OAuth. `gh` CLI substitutes. |
| Vercel | connector | ✅ available | Not used: still authenticated to a principal that cannot see this org (D3). |
| Netlify, Figma, Canva, Notion, Slack, Airtable, Calendly, Adobe, ElevenLabs, Google Workspace | connector | ✅ available | **Deliberately unused.** The deliverable is production React and CSS in an existing repository, not a design file, a page, or a message. |
| Roboflow, Vaisala, Autodesk | connector | ⛔ need auth | None relevant. |

**The honest summary: every stdio MCP this project configures is currently
dead, and none of them blocked anything.** Five of six were already fully
substituted by tooling inside the repo — which is the argument for that tooling
existing.

---

## 7. What is still a card grid

Stated plainly, because RC3's diagnosis named five repetitive sections and this
is the running count.

| Section | State |
|---|---|
| `WorkflowUniverse` | ✅ replaced — RC3 |
| `DigitalCraft` | ✅ replaced — RC4 |
| `AIInfrastructure` | ✅ replaced — RC4 |
| **`WorkflowPipeline`** | ⚠ **five `GlassCard`s in a row.** Its language is already assigned (diagrammatic) and its connectors already animate; what remains is that each stage is still an icon-in-a-rounded-square. **Top of the RC5 list.** |
| **`FeatureStorytelling`** | ⚠ **six `GlassCard`s in a bento.** The least offensive of the five — the bento spans already break the grid rhythm — but still the same object six times. |

Three of five done. A visitor now meets the rounded-square-with-an-icon
**eleven** times on the homepage rather than twenty-five.

---

## 8. Rules for adding a section

1. **Name its language before writing markup.** If the answer is "glass cards",
   the section does not have a language yet.
2. **The centerpiece must be describable in one sentence to someone who has not
   seen it.** "Six systems feeding one core." "A browser window that switches
   between four kinds of build." If it needs two sentences, it is decoration.
3. **Draw the thing, don't describe it.** Every section that sells a *system*
   must show the system.
4. **Check the budget before choosing the medium**, not after.
5. **Look at a screenshot before believing it works.** RC3 shipped beams at an
   alpha that made them invisible; RC4 shipped wireframes that Tailwind
   tree-shook into solid black rectangles. Both compiled, both type-checked,
   and both were obvious in a capture and invisible in the editor.
