# SheetFlow Brand OS — Phase 7: Experience Governance

> A brand erodes when nobody is watching. Governance is the operational layer that prevents drift across people, projects, and time.
>
> If a contributor cannot get a brand-correct surface to ship by following this document, the document has failed.

---

## Governance principle

Three forces erode a brand: **time, scale, and good intentions.**

- *Time* — every quarter, conventions slip. Nobody remembers why a value is what it is.
- *Scale* — every new contributor invents a "small" exception that compounds.
- *Good intentions* — the most dangerous. A well-meaning improvement that doesn't fit becomes a permanent inconsistency.

The Brand OS resists all three by replacing memory with **artifact**. Decisions live in this repository, not in heads.

---

## The four governance instruments

| Instrument | Purpose | Mechanism |
|---|---|---|
| **Approval checklist** | Before a surface ships | Reviewer-completed gate |
| **Anti-pattern detector** | During development | Lint rules + manual signals |
| **Visual + motion audit** | Quarterly | Sampled review of live surfaces |
| **Atmosphere integrity framework** | Continuous | Page-level invariant tests |

Each instrument runs at a different cadence. Together they form a defense-in-depth.

---

## 1. Approval checklist

Before any new surface ships — a marketing page, a dashboard, an email template, a social asset, a product screen — it must pass this gate. Every checkbox is a hard requirement.

### A. Tokens & color
- [ ] Every color value comes from `tokens.color.*` (no hardcoded hex)
- [ ] Surface stack respects Z-rules (no glass-on-glass)
- [ ] Status colors are used **only** for status (no decorative greens/ambers)
- [ ] White light only from text or status — never from a non-text source

### B. Typography
- [ ] Headlines use sentence case (not Title Case, not ALL CAPS)
- [ ] Sans for prose, mono for AI-generated text and data — never blurred
- [ ] Each section begins with a `<Kicker>` (or has explicit reason not to)
- [ ] No italic display headlines except the accent-gradient emphasis phrase
- [ ] Headline ≤ word count budget for chapter (hero ≤6, mid ≤9, final ≤7)

### C. Motion
- [ ] Every motion uses one of `easing.cinematic` / `spring` / `intelligence`
- [ ] No animation exceeds `duration.cinematicMax` (1600ms)
- [ ] Stagger is `80ms` (marketing) or `40ms` (product)
- [ ] Total simultaneous active motion ≤ 3
- [ ] Reduced-motion mode renders the surface functional and beautiful

### D. Atmosphere
- [ ] Surface declares a chapter (`awakening | ambient | descent | quietMiddle | finalClose`)
- [ ] Aurora + grain layers are present (or explicitly justified absence — product UI only)
- [ ] Holographic surfaces include the 4px scan overlay
- [ ] Grain is at `0.035` alpha — never re-tuned

### E. Component language
- [ ] All cards are `<SheetCard>` (or a documented derivative)
- [ ] All CTAs are `<SignatureCTA>` with a declared tier
- [ ] Exactly one `variant="primary"` CTA per visible section
- [ ] Status indicators use `<IntelligenceState>` — no generic spinners
- [ ] No custom borders on glass surfaces (use elevation)

### F. Copy
- [ ] No banned word from §4 ("revolutionary", "seamless", "supercharge", etc.)
- [ ] One idea per headline; period not exclamation
- [ ] CTA verb is one of: `Watch | Begin | Open | Read`
- [ ] CTA is two words maximum
- [ ] Mono register used for any number, status, file path, system value

### G. The "feels like SheetFlow" test
- [ ] At a 2-second glance, the surface is unmistakable as SheetFlow
- [ ] The surface produces one of the four canonical feelings: Awakening / Descent / Invitation / Intelligence
- [ ] If you removed the logo, the brand would still be recognizable

If any item fails, the surface does not ship. There is no partial pass.

---

## 2. Anti-pattern detector

A live registry of patterns that have been tried and rejected. Reviewers consult this before approving anything novel.

### Visual anti-patterns
- ❌ Lens flare
- ❌ Animated gradient color shifting (we animate position only)
- ❌ Hard color stops in gradients
- ❌ ALL CAPS or italic display headlines (kickers excepted)
- ❌ Border on top of border
- ❌ Glass on glass
- ❌ Pure white from a non-text source
- ❌ Hard-edge shadows (we use ambient drops)
- ❌ More than 4 simultaneous data-series colors in a chart

### Motion anti-patterns
- ❌ Bounce on first impression
- ❌ Cursor trails / particle ribbons
- ❌ Letter-by-letter character drops
- ❌ Glitch RGB-offset on hover
- ❌ Animation that requires re-watching to be understood
- ❌ Scroll-jacked horizontal sections
- ❌ Parallax that drifts text slower than its background
- ❌ Hover sound effects (ever)
- ❌ Random hover scale on every element
- ❌ Motion exceeding `duration.cinematicMax`
- ❌ Slow-mo as a reduced-motion fallback

### Copy anti-patterns
- ❌ *revolutionary, seamless, leverage, AI-powered, unleash, supercharge, next-gen, cutting-edge, frictionless, empower*
- ❌ Lists of three adjectives in headlines
- ❌ Question headlines
- ❌ Generic SaaS bullet points
- ❌ Title-cased headlines
- ❌ Exclamation marks
- ❌ "Get started" / "Try free" / "Sign up" / "Learn more"

### Atmosphere anti-patterns
- ❌ Removing grain "for performance"
- ❌ Removing aurora on lower-tier breakpoints
- ❌ A section without a chapter declaration
- ❌ Two adjacent sections with the same chapter (handoff is lost)

### Forbidden aesthetics (whole-system veto)
- ❌ Cyberpunk (Tokyo neon, glitch, scanline TV)
- ❌ RGB gamer (rainbow accents, sharp angles, tribal motifs)
- ❌ Memphis / postmodern (squiggles, primary chaos)
- ❌ Skeuomorphism (faux 3D, wood, leather)
- ❌ Brutalist tech (raw HTML, sharp grids)
- ❌ Generic AI startup (gradient blobs, "Powered by AI", emojis)
- ❌ Crypto / Web3 (chrome 3D, hot-pink → cyan, Y2K revival)
- ❌ Healthcare-soft (rounded squares, mint green, illustrated people)

A surface that references any of these reads as the wrong brand — even if individual decisions look fine in isolation.

---

## 3. Visual + motion audit (quarterly)

Every 90 days, sample 10 live surfaces (a mix of marketing pages, dashboards, social assets, emails) and complete:

### Visual audit
| Check | Pass / Fail |
|---|---|
| Aurora + grain layers present | |
| 60 / 30 / 10 dark / mid / bright average | |
| Indigo-led, violet-supported, cyan-deep, green-status order respected | |
| All `<SheetCard>` derivatives — no rogue card components | |
| Z-stack discipline maintained | |
| Kicker → headline pattern present in marketing surfaces | |
| Scan overlay on every holographic surface | |
| One primary CTA per section | |

### Motion audit
| Check | Pass / Fail |
|---|---|
| All curves are one of the three approved | |
| All durations within 100–1600ms | |
| Stagger consistent with surface type (80ms marketing / 40ms product) | |
| `prefers-reduced-motion` respected on every surface | |
| No more than 3 simultaneous active motions | |
| Section handoffs use `<TraceDivider>` or `choreography.handoff` — no hard cuts | |
| `<IntelligenceState>` used wherever the AI is "doing" something | |

A failing surface gets a remediation ticket with a 30-day deadline. After 90 days unaddressed, the surface is removed or rebuilt.

---

## 4. Atmosphere integrity framework

The atmospheric layers are *invariants*: they must hold across every page, every device, every release.

### Page-level invariants

```
∀ page p in the production system:
   p has aurora layer with cursor/camera tracking      (unless product UI)
   p has grain layer at 0.035 alpha overlay
   p declares a chapter
   p respects the 60/30/10 dark/mid/bright average
   p contains zero hardcoded hex colors
   p contains zero non-token timing values
```

These can be enforced with automated checks:
- ESLint rule: forbid hex literals in `*.tsx` (allow only inside `tokens.ts`)
- ESLint rule: forbid `transition: '...ms'` strings outside `motion.ts`
- Visual regression testing against approved baselines (per-chapter)
- Lighthouse + custom atmosphere score on every PR

### The four feelings test

Every surface, after build, should produce **one** of the four canonical feelings on the user:

| Feeling | Where it lives |
|---|---|
| **Awakening** | Hero of any marketing surface, signup completion |
| **Descent** | Workflow / explanation surfaces, dashboards |
| **Invitation** | Final CTAs, conversion modals, onboarding handoffs |
| **Intelligence** | Always present (cursor on web, Inspector on product) |

If a new surface produces *none* of the four — or worse, produces a fifth, undefined feeling — the surface is rejected.

---

## "Does this feel like SheetFlow?" — the 30-second evaluation

For any new surface (page, ad, screenshot, mockup, prototype), run this evaluation:

1. **2-second test** — Show the surface for 2 seconds. Is it unmistakably SheetFlow?
2. **Logo-removed test** — Hide the logo. Is the brand still identifiable from atmosphere alone?
3. **Adjacent test** — Place the surface next to a competitor's. Which feels more *premium*? More *intelligent*?
4. **Memory test** — A week later, what does the viewer remember? An *idea* (good) or a *gimmick* (bad)?
5. **Feeling test** — Does the surface produce one of the four canonical feelings?

A surface that fails any of the five must be reworked or rejected. **No surface ships on intuition alone.**

---

## Decision protocol — when in doubt

If a contributor faces a question this OS does not directly answer, follow this order:

1. **Check the Constitution** — `SHEETFLOW_VISUAL_DNA.md`. Is the answer there?
2. **Check the OS phase docs** — Phases 1–8 of `brand-os/`. Is the answer there?
3. **Check existing implementations** — `10_Final_Website/src/`. What does the production system already do?
4. **Compose, don't invent** — combine existing primitives before adding new ones.
5. **Amend the OS** — if a new pattern is genuinely needed, propose it in writing, get it ratified, and *then* add it. Never both at once.

A new pattern shipped without ratification is a brand violation, regardless of how good it looks.

---

## Roles & responsibilities

| Role | Owns |
|---|---|
| **Brand steward** | This document, Constitution amendments, anti-pattern updates |
| **Reviewer** | Approval checklist on every PR touching a surface |
| **Auditor** | Quarterly visual + motion audit |
| **Contributor** | Following the decision protocol; not inventing |

A team can have one person playing multiple roles — but never zero people on any role. An unowned role is where drift accumulates.

---

## Amending the Brand OS

The OS is not frozen. It evolves — but slowly, deliberately, and on the record.

An amendment requires:
1. **Written proposal** — what's changing, why, and what it replaces
2. **One precedent** — at least one existing surface that the amendment is responding to
3. **Brand steward sign-off**
4. **Patch commit** to this directory tagged `brand-os/amendment/<short-name>`

Amendments are not patches to live code. They are revisions to *how the brand thinks*. Code changes follow.
