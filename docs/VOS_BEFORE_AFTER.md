# The Run — before and after

> **2026-08-10.** One homepage section, `#how-it-works`, redesigned onto the
> [Visual Operating System](../VISUAL_OPERATING_SYSTEM.md) under
> [Visual DNA v2](../VISUAL_DNA_V2.md). No other section was touched.
>
> Every number was measured on a production build this session. Nothing was
> deployed and nothing was pushed.

---

## 1. What was wrong, measured rather than felt

The before is five `GlassCard`s in an `lg:flex-row`, each with a lucide icon in
a rounded square, a 17px title, a 13px paragraph and a status line.

| Symptom | Measurement |
|---|---|
| **Card width** | **~197px**, read off the 1440px capture (cards at x≈120–317, 371–568, …) |
| **Text measure** | ~141px inside the card's padding |
| **Consequence** | Published titles wrapped mid-phrase: *"New lead / arrives"*, *"AI replies & / qualifies"* |
| **Body type** | 13px in a 141px measure ≈ **20–22 characters per line** |
| **Repetition** | 1 of the 5 sections RC3 identified as the same object |
| **Sequence signal** | A 1px connector with a `ChevronRight`, at 40% alpha |
| **Emphasis** | None. All five stages identical weight |

The deeper failure is structural rather than cosmetic: **a section about a
sequence in time was rendered as a grid of equals.** Five identical rectangles
side by side say *"five features"*. Nothing in the composition said *then*, and
nothing said which stage mattered — even though the section's own headline names
one: *"From first contact to **booked**."*

---

## 2. What it is now

An asymmetric editorial narrative (`VISUAL_DNA_V2.md` § 8.2): a **held left
chapter** carrying the headline, and a **scrolling right sequence** of five
stages, each with a drawn artifact, joined by a spine the reader's own scroll
traces.

| Decision | Rule it satisfies |
|---|---|
| Sticky chapter column | § 7.3 — pinning permitted; *scroll-jacking* still forbidden. Nothing is intercepted. |
| 44–56px between stages | § 8.1 — the 12px constant is repealed; the gap *is* the passage of time |
| 27px display titles, 15px body at 46ch | § 8.2 — editorial measure instead of a 22-character column |
| One tier-4 surface: the calendar | § 4.1 — at most one *presented* surface |
| One gold element: the booked slot | § 2 — gold marks an outcome, and this is the headline's word |
| `live` scan line on CRM only | § 3.3 — the mark means "the system is writing here" |
| Every artifact captioned | § 6 — provenance is a required prop, the engine emits the caption |
| Traced spine, not a looping dot | § 7.2 — scroll-coupled motion authored in CSS |

### Type and measure

| | Before | After |
|---|---|---|
| Stage title | 17px semibold | **27px display** (23px < lg) |
| Body | 13px | **15px** |
| Line measure | ~20–22 characters | **~46 characters** (`max-width: 46ch`) |
| Text column | ~141px | **~600px** |

---

## 3. Screenshots

Captured from a production build whose `BUILD_ID` was matched against the served
HTML first, at 1440×900 and Pixel 7.

| Frame | What it shows |
|---|---|
| `before/desktop.png` | Five identical cards, cramped titles, near-invisible connectors |
| `final/desktop-view-1.png` | The held chapter beside stages 01–02 |
| `final/desktop-view-2.png` | The chapter still held; the gold booked slot is the only focal point on screen |
| `final/desktop-view-3.png` | End of the sequence |
| `final/desktop-full.png` | The whole section as one still |
| `final/mobile-view-*.png` | The sticky column collapsed to normal flow; spine and artifacts intact at 412px |

**The capture harness needed fixing before it could tell the truth**, and that is
worth recording because the first pass lied twice:

1. `animation-duration: 0s` — the freeze this repo uses for deterministic
   captures — is **meaningless for a scroll-driven animation** and suppressed it
   entirely. The first "after" frames showed the traced spine inert.
2. A full-element screenshot of a section built on `view()` reveals renders
   stage 05 at `opacity: 0`, because its timeline says it never entered. The
   still now forces reveals to their finished state and neutralises `sticky`;
   the narrative is shown with real viewport frames instead.

---

## 4. Bundle

`scripts/audit-bundle.mjs`, production build, both sides.

| | Before (RC4) | After (VOS) | Δ |
|---|---|---|---|
| **JS gzip** | 349.1 kB | **347.5 kB** | **−1.6 kB** |
| **CSS gzip** | 14.0 kB | **15.1 kB** | +1.1 kB |
| Largest chunk | 69.2 kB | **69.2 kB** | unchanged |
| Budgets | 360 / 40 / 170 kB | **all met** | — |
| Dependencies added | — | **zero** | — |

**Seven engines and a fully redesigned flagship section, and the JavaScript
bundle got smaller.** The section it replaced was a client component importing
`framer-motion`, `useInView` and `useRef` to run an entrance stagger and a
travelling dot. Both are now CSS, so the section is a server component and the
whole Visual OS ships **zero client JavaScript**.

Running total across three phases: **351.6 → 349.1 → 347.5 kB**, while replacing
three card grids with three distinct centerpieces.

---

## 5. Accessibility

Frozen as a constraint, verified not assumed.

| Gate | Before | After |
|---|---|---|
| axe WCAG 2.1 AA | 0 violations, 34/34 | **0 violations, 34/34** |
| Lighthouse accessibility | 100 | **100** (mobile and desktop) |
| Reduced-motion probe | 11/11 | **15/15** (4 new checks for this section) |
| Full Playwright suite | 408 passed / 10 skipped / 0 failed | **408 passed / 10 skipped / 0 failed** (418 tests, 10.3 min) |
| Focus indicators | pass | pass |

### The markup got better, not just different

| | Before | After |
|---|---|---|
| List semantics | `<div role="list">` + `<div role="listitem">` | **real `<ol>` / `<li>`** |
| Position in set | synthetic `aria-label="Stage 1 of 5: …"` on every item | **native** — conveyed by `<ol>` |
| Artifacts | none | `<figure>` + `<figcaption>` carrying provenance |
| Decoration | mixed into content | every drawn element `aria-hidden` |

Replacing a hand-written *"Stage 1 of 5"* with an `<ol>` is a small thing that
matters: the synthetic label had to be kept in sync with the array by hand, and
the native one cannot drift.

### The four new reduced-motion checks

The traced spine is the first scroll-driven animation on the homepage, and its
failure mode is a rail stranded at zero height with five stages hanging off
nothing. It is checked directly:

```
PASS  spine rests fully traced, not at zero
PASS  five stages present
PASS  five spine nodes present
PASS  no stage held invisible
```

---

## 6. Motion, and its cost

| | Before | After |
|---|---|---|
| Mechanism | `framer-motion` — `useInView`, `useRef`, per-stage `motion.div` | CSS `animation-timeline` |
| Client JS for motion | yes | **none** |
| Runs on | main thread | **compositor** |
| Simultaneous motions | 5 staggered reveals + 1 looping packet | **1 traced spine + reveals** |
| Reduced motion | JS early-return | rule never matches; static finished state |

Two implementation notes worth carrying forward, both of which cost a build to
learn:

- **`overflow: hidden` makes an element a scroll container.** With it on the
  rail, `view()` on the beam inside resolved against *that* box rather than the
  document — a degenerate timeline that froze the animation at a constant.
  Measured at `scaleY(0.7)` at every scroll position, and invisible in every
  screenshot because the harness freezes animations. Found by probing the
  computed transform at eleven scroll positions, not by looking.
- **A 1px rail is not enough.** At 1px the traced portion and the untraced track
  were within a hair of each other on a capture — the beam was working and the
  eye could not tell. 2px, plus a glow.

After the fix, measured:

```
  scrollY    scaleY
    2451     0
    3138     0.163
    3825     0.539
    4512     0.914
    4855     1
  monotonic non-decreasing: true      range 0 → 1      TRACING
```

---

## 7. Performance

Measured on this build, median of 5, one machine, warm-up discarded, taken
**after** the test suite finished so nothing was competing for the CPU.

### Homepage — mobile preset

| | Score |
|---|---|
| **Performance** | **53** |
| **Accessibility** | **100** |
| Best practices | 96 |
| **SEO** | **100** |

| Metric | Value |
|---|---|
| First Contentful Paint | 0.9 s |
| Largest Contentful Paint | 3.9 s |
| **Cumulative Layout Shift** | **0** |
| Total Blocking Time | 3,280 ms |
| Speed Index | 6.4 s |
| Top opportunity | 0.45 s — reduce unused JavaScript |

### Homepage — desktop preset

Performance **74** · Accessibility **100** · Best practices 96 · SEO **100** ·
FCP 0.4 s · LCP 1.2 s · CLS **0** · TBT 390 ms.

### What can and cannot be concluded

**CLS is 0, and that is a real result rather than a survival.** This phase added
a sticky column, five scroll-driven reveals and a scroll-driven spine — three
categories of change that routinely cost layout shift. Measured on this build,
on both presets, it did not.

**Accessibility 100 and SEO 100 hold.** Those are the frozen constraints, and
they were verified rather than assumed.

**The 53 is not a delta.** `LAUNCH_CHECKLIST.md` § G records a mobile
performance score of **52** for this route, and 53 sits beside it — but that
number came from a different batch, on a different day, and this repo's standing
rule is *never compare a fresh number to a number from a different batch.* The
"before" build no longer exists on disk, so a genuine A/B would mean rebuilding
both sides and measuring them back to back.

What the two numbers do jointly support is the weaker, safer claim: **the
redesign did not move the homepage's mobile performance out of its known band.**
Given what was added, "no visible regression" was the outcome worth checking,
and it is the outcome.

**Why a regression was unlikely anyway**, stated as mechanism rather than
measurement:

| Change | Direction |
|---|---|
| −1.6 kB JS, one fewer client-component boundary | less to parse, less to hydrate |
| 5 framer-motion `whileInView` observers removed | less main-thread work on scroll |
| Motion moved to the compositor | less contention with paint, already 73–91% of this site's main thread |
| +1.1 kB CSS, one more `backdrop-filter` tier in use | more paint, in 5 surfaces in one below-fold section |

**The homepage's mobile score remains its own phase.** TBT of 3.28 s and the
0.45 s of unused JavaScript are hero and third-party costs, not this section's —
`#how-it-works` is far below the fold and is an LCP candidate on no viewport.

---

## 8. Governance

Nothing in this phase weakened the evidence boundary; the redesign tightened it.

- **Every string is published copy carried over verbatim** — title, detail and
  status alike. A visual phase writes no marketing copy.
- **Every artifact label is a literal word of the sentence above it**: "web
  form", "WhatsApp", "missed call"; "contact details, notes and status";
  "leads, bookings".
- **No artifact contains a number, name, timestamp or message body.** The report
  card has bars with lengths and no figures — *a bar with a length is a shape; a
  bar with a number beside it is a claim.* The phone's bubbles hold line shapes,
  because there is no published transcript to quote.
- **Provenance is enforced by the type system.** `Artifact` cannot render
  without declaring what it is, and the engine emits the caption, so it cannot
  be forgotten or reworded.

---

## 9. What this iteration did not do

| Not done | Why |
|---|---|
| The other eight sections | The brief said redesign one. Migration order is `VISUAL_OPERATING_SYSTEM.md` § 6. |
| Extract `BrowserFrame` from `DigitalCraft` | It is item 1 of the migration, and doing it would have meant touching a section this iteration was told to leave alone. |
| A Lighthouse A/B | § 7. Would have required rebuilding both sides into one batch; the result would otherwise be a comparison across batches, which this repo does not publish. |
| Any change to tests, SEO, architecture or docs outside these three files | Frozen by the brief. |
