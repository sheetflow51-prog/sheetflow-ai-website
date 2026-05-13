# SheetFlow Brand OS — Phase 6: Product UI Expansion

> The website *promises* a luxury intelligence system. The product must *be* one.
>
> This phase translates the cinematic brand into the working register: dashboards, control panels, AI surfaces, dense data interfaces — without losing the DNA.

---

## What product UI inherits

| From the website | Adopted in product |
|---|---|
| Indigo accent + `signal.success` for live state | ✅ |
| Mono register for AI-generated text and data | ✅ |
| `surface.0–4` Z-stack (glass cards, hairline highlights) | ✅ |
| Live pulse for any "watching" indicator | ✅ |
| Icosahedron motif on the AI command center | ✅ |
| Cinematic curves on UI motion (`easing.cinematic`) | ✅ (sped up 30%) |

## What product UI drops

| From the website | Why it's dropped |
|---|---|
| Aurora gradient | Too distracting in a working tool — replaced with a static tint |
| Magnetic CTAs | Too playful for repeated use — one mag-hover per session is delightful, fifty are annoying |
| Full-page reveals | Working users hate reveals on every nav |
| Awakening intro | Plays once at signup, never again |
| Cinematic 1100–1600ms motion | Capped at 400ms in product context |

## What product UI gains

- Functional density — multi-panel layouts, tabular data, sticky toolbars
- Keyboard-first ergonomics — every primary action has a shortcut
- AI status as a first-class surface (`<IntelligenceState>` everywhere)
- Empty / loading / error states defined as part of the brand, not as engineering details
- Data visualization styling that matches the brand without becoming "chartjunk"

---

## Dashboard grammar

### The 12-column grid
All dashboards use a 12-column grid with `12px` (`tokens.layout.cardGap`) gutters. Modules span 3, 4, 6, 8, or 12 columns — never 5, 7, 9, 11. This constraint produces visual rhythm by elimination.

### Module hierarchy
Three module sizes, three roles:

| Span | Role | Examples |
|---|---|---|
| **12 cols** (full) | Hero data — the one number that matters today | Reconciliation health, system status |
| **6 cols** (half) | Comparison pairs — two views of the same truth | Today vs. last week, automated vs. flagged |
| **3–4 cols** (tile) | Quick-glance metrics, action surfaces | Cell counts, last activity, shortcut launchers |

Mixing tile sizes within a row is forbidden. A row is uniform: 4×3, 3×4, 2×6, or 1×12.

### Module composition
Every dashboard module is a `<HoloPanel>` containing:
1. **Header strip** — kicker (mono, label) + optional `<IntelligenceState>` + optional action menu
2. **Content** — the data, chart, or interactive surface
3. **Footer strip** (optional) — last-updated mono timestamp + drill-down link

---

## AI panel hierarchy

The product has **one** AI panel — the *Inspector* — that follows the user across screens. Its hierarchy:

| Level | Element |
|---|---|
| **Anchor** | The AI core glyph (icosahedron, 24px) — always pulses softly |
| **State** | `<IntelligenceState>`: idle / watching / thinking / resolved / alert |
| **Subject** | What the AI is currently watching (sheet name, range, action) |
| **Output** | The most recent observation or suggestion (mono register) |
| **Action** | A `<SignatureCTA variant="ghost">` to act, dismiss, or expand |

The Inspector does not float as a chatbot. It docks to the right rail (or bottom on mobile) and is visually a *member* of the workspace — never a guest.

---

## Intelligence states — the canonical five

Every "the AI is doing something" moment renders one of these. Generic spinners are forbidden.

| State | Visual | Color | Motion | Copy register |
|---|---|---|---|---|
| `idle` | Hollow ring | `ink.500` | None | `READY` |
| `watching` | 6px dot + breathing ring | `signal.success` | Live pulse | `WATCHING N CELLS` |
| `thinking` | Indigo shimmer over icosahedron | `accent` | 3s shimmer loop | `RESOLVING …` |
| `resolved` | Indigo checkmark fade-in | `accent.bright` | 1s fade-in | `RESOLVED · {time}` |
| `alert` | Brackets snap around target + amber pulse | `signal.warning` | 2s pulse | `NEEDS REVIEW` |

These states have **fixed durations and motions** so users learn them as language, not as decoration.

---

## Futuristic empty states

A SheetFlow empty state is never a cartoon illustration with a "Get started" button. It is:

```
┌──────────────────────────────────────┐
│        [icosahedron, dormant]        │
│                                      │
│    SYSTEM IDLE                       │
│    No workbook is being watched.     │
│                                      │
│    [Open a workbook →]               │
│                                      │
│  ── Last activity 14:32 · 412 cells  │
└──────────────────────────────────────┘
```

The empty state is itself an opportunity to demonstrate intelligence. It tells the user *why* it's empty (no workbook attached) and *what was last true* (the most recent activity), turning emptiness into context.

---

## Alert language

Three levels, each with strict copy and visual rules:

### `info` — the AI noticed something
- Color: `signal.info` (cyan)
- Verb: *Noticed* — *"Noticed a duplicate in column F."*
- Action: dismissable, never blocking

### `warning` — the AI suggests review
- Color: `signal.warning` (amber)
- Verb: *Flagged* — *"Flagged 3 cells in row 14 for review."*
- Action: requires acknowledgment, brackets snap around target

### `danger` — the AI cannot proceed
- Color: `signal.danger` (rose)
- Verb: *Stopped* — *"Stopped reconciliation: source workbook missing."*
- Action: blocking, with a clear remedy CTA

Forbidden alert language: *"Oops!"*, *"Something went wrong"*, *"Whoops"*, *"Try again later"*. The AI does not panic, does not apologize cutely, and does not say *"please."*

---

## Data visualization styling

### The chart palette
Charts use a *restrained* fork of the brand palette. The accent ladder, in order:

```
1. accent.DEFAULT  (#6366F1)  — primary series
2. violet.DEFAULT  (#8B5CF6)  — comparison series
3. cyan.DEFAULT    (#06B6D4)  — tertiary series
4. ink.300         (#A0A8BC)  — baseline / reference
5. signal.success  (#10B981)  — "good" outcome
6. signal.warning  (#F59E0B)  — "needs attention"
7. signal.danger   (#F43F5E)  — "issue"
```

Beyond 4 simultaneous data series in a single chart, **redesign the chart** — never add a 5th color.

### Chart type vocabulary
- **Line** — for time-series of one or two metrics. Stroke 2px, glow halo on hover.
- **Area** — for cumulative trends. 0.18 alpha fill matching stroke.
- **Bar** — for categorical comparisons. 4px corner radius, hairline base.
- **Sparkline** — for tile-sized embedded trends. 1px stroke, no axis labels.

Forbidden charts: pie (always), donut (almost always), 3D anything, exploded slices, gradient-filled bars without semantic meaning.

### Axis and label rules
- Axis labels: mono, `ink.400`, 11px
- Gridlines: `ink.700`, 1px, only when essential — prefer no gridlines and let the data float
- Tooltips: `surface.3` glass card, mono inside, `enter.whisper` on appear

---

## Interaction rhythm

Product UI motion is **30% faster** than marketing motion — repeated interactions need to feel responsive, not cinematic.

| Marketing duration | Product duration |
|---|---|
| `duration.scene` (900ms) | 600ms |
| `duration.reveal` (600ms) | 400ms |
| `duration.base` (250ms) | 180ms |
| `duration.fast` (180ms) | 120ms |

Curves stay the same: `easing.cinematic` for everything except settle (still `easing.spring`).

Stagger drops to **40ms** in product context (half the marketing 80ms) so dense lists don't feel sluggish.

---

## Keyboard ergonomics

Every primary action has a keyboard shortcut. The product surfaces them via:

- A **command palette** (`⌘K` / `Ctrl+K`), styled as a `<CinematicModal variant="palette">`
- A **shortcut overlay** (`?` to open) showing the full map
- Inline `<MonoLabel>` hints next to menu items: `Open · ⌘O`

The shortcuts are *visible* — the brand believes power users deserve cinematic ergonomics, not hidden ones.

---

## Mobile product UI

Mobile inherits the desktop product DNA with three modifications:

1. **Atmospheric particle density** drops to `breakpoint.atmosphereDensity.sm` (40%)
2. **Inspector** docks to the bottom drawer (`<IntelligencePanel variant="dock">`)
3. **Hover-tier interactions degrade** to tap (no `hover.consideration` — direct to `tap`)

Mobile does *not* drop: grain, scan, accent palette, mono register, kickers, intelligence states. Those are non-negotiable.

---

## The product-UI promise

After 60 seconds in the product, a user must feel:

1. **Watched** — the Inspector is always present, always honest about its state.
2. **Calm** — no surface flashes, no sound effects, no surprise modals.
3. **In control** — every action is reversible, every shortcut is visible, every alert is actionable.
4. **Premium** — even an empty state feels considered.

If any of these four feelings is missing, the product UI has failed to extend the brand.
