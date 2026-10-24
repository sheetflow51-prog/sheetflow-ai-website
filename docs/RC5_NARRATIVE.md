# RC5 — the homepage as one narrative

> **2026-08-10.** The homepage rebuilt as a single continuous narrative on a
> page-level extension of the [Visual Operating System](../VISUAL_OPERATING_SYSTEM.md),
> under [Visual DNA v2](../VISUAL_DNA_V2.md).
>
> Every number below was measured on a production build in this session.
> Nothing was deployed and nothing was pushed.
>
> ⚠️ **These figures and screenshots are as-of-RC5 and are already one phase
> stale.** An **RC6** pass landed on top of this work while it was being written
> — it retunes the fixed viewport aurora, four wireframe neutrals, the chapter
> join spacing, the chapter head at `lg`, and puts the FAQ and the closing CTA
> on `Surface`. It explicitly revises RC5's own numbers (see `globals.css:2454`,
> *"RC6 tightens it again… RC5 set these numbers against"*).
>
> What that means for this document: § 5's **332.9 kB** and the frames in
> `release-preview-rc5/after/` are a faithful record of **RC5 alone**, and are
> deliberately not refreshed — re-capturing them now would file RC6's visual
> changes under RC5's before/after. The post-RC6 build measures 332.7 kB with a
> different chunk split. RC5's engines (`Chapter`, `narrative.ts`, `Metric`,
> `Drift`, `page.tsx`) are untouched by RC6, and the combined tree type-checks.

---

## 1. The defect, measured rather than felt

RC3 measured that five homepage sections were the same *object*. RC5 measured
the level above that: the homepage was **nine self-contained pages stacked on
one route**.

| Symptom | Measurement |
|---|---|
| **Dead space at section joins** | **~275px**, read off the 1440px capture. Two `.section` blocks each paying `clamp(64px, 9.5vw, 160px)` on both edges, back to back |
| **What crossed a join** | Nothing. Each ambient wash began and ended inside its own section, so every boundary terminated in a visible horizontal seam |
| **The divider that was supposed to join them** | `SectionHandoff` — a **client component** running `useScroll` + `useVelocity` + `useSpring` + three `useTransform`s, rendered **nine times**, to glow a 1px line in proportion to scroll velocity. Invisible at rest; at speed, behind the thing the reader is moving past |
| **Header alignment** | Split. Automation Universe and Infrastructure opened **centred**; Dashboard, Case Study and Craft opened **left**. No stable place for the eye to return to |
| **Reading order** | Not derivable. Nothing on the page said which beat this was or how many remained |
| **Page height** | **14,042px** desktop |
| **Duplicate argument** | `FeatureStorytelling`'s six pillars — capture, respond, book, sync, report — restated chapter 01's six automations and chapter 03's five stages for a third time, as six rectangles |

The consequence is exactly the one the brief names: a visitor feels they are
moving between separate templates. It is a **page-level** failure, and no amount
of per-section redesign fixes it — which is why RC5's centrepiece is an engine
rather than nine more edits.

---

## 2. The narrative, and the three order changes

```
        Hero            what this is                     full     ████████
   01   Universe        what we automate                 standard ████
   02   Infrastructure  wired into your stack            quiet    ██
   03   The Run         one lead, end to end             standard ████
   04   Case studies    proof                            quiet    ██
   05   Digital Craft   everything else we build         standard ████
   06   The report      results                          quiet    ██
   07   The terms       pricing                          standard ████  ← gold
   08   Questions       the objections                   quiet    ██
        Final CTA       booking                          full     ████████
```

The arc is the brief's: what SheetFlow is → how the automation works → proof →
results → pricing → booking.

### 2.1 Infrastructure moved up, eighth → second

*"Which of my tools does this touch"* is asked **before** *"how does it work"*,
not after the case studies. It was also the section immediately before the FAQ,
so the page answered a technical objection and then invited more objections.

### 2.2 The report moved down, third → sixth

It is the *result* of the run, and it was being shown **two chapters before the
run existed**. Chapter 03's last stage is *"Daily report sent"*; chapter 06 is
that report. They are now adjacent and in causal order.

### 2.3 `FeatureStorytelling` was removed — the one content decision here

This is the only change in RC5 that removes published copy from the site, so it
is stated plainly rather than buried.

Five of its six pillars restated chapters 01 and 03. The sixth — *"Built
carefully. Yours to own."* and its paragraph about read-only access, logging,
no lock-in and no platform tax — said something no other section said, and it is
a statement about **terms**. It moved **verbatim** into chapter 07.

Nothing else from that section is lost, because nothing else in it was unique.
The nav's *"How we work"* and `/services/[slug]`'s matching button both moved
from `/#product` to `/#how-it-works`, which is what the label was always
describing.

**This is reversible.** Restoring the section means re-adding the file and one
line in `page.tsx`; the arc table in `content/narrative.ts` is where it would
need a beat.

### 2.4 One beat is new

`Terms` (chapter 07). The brief names pricing as part of the narrative, and the
page went from a case study straight to *"book a free audit"* — so the question
every visitor has between those two was answered on a different route, or not
before the form. Every figure in it is imported from `content/pricing.ts`;
nothing is authored in the component.

---

## 3. The engine: what makes it one page

### 3.1 One rail, and it is the same rail

The single decision the whole phase rests on: **the line that numbers the
chapters is the line the workflow stages hang off.** They are the same `Spine`
engine, drawn by the same code, on the same vertical axis.

RC4 gave The Run a private rail and a sticky chapter column of its own. Both are
gone. A private rail inside a page that already has one reads as two systems;
one rail reads as the page zooming in.

The rail is positioned against the **section**, not the container, so it spans
the padding and meets its neighbours exactly — consecutive chapters produce one
unbroken line rather than a dashed one. Its `left` is computed from the same
three numbers `.container-edge` uses, so it cannot drift off the content column
at any width.

It is traced by the reader's own scroll progress, per chapter, on the
compositor. **Eight rails, zero JavaScript.**

### 3.2 The head is owned by the engine

Every chapter opens identically — mark, kicker, headline, description, in that
order and that position — because the alternative was measured. Nine sections
each composing their own header is exactly how the page ended up with two
alignments and no rhythm, and a rule in a document did not prevent it.

Every chapter is also now a **named region**: `Chapter` derives
`aria-labelledby` from the chapter id. Before RC5 exactly one section carried
one, hand-written, so eight of nine were generic to a screen reader's landmark
list.

### 3.3 Atmosphere fades at its own edges

Each tone is a radial gradient whose value at the section's top edge is
non-zero, so without a mask the wash terminates in a visible horizontal seam at
the boundary — measured at y≈250 on the 1440px capture. A seam at every join is
the page telling the reader a scene has ended, nine times. `.vos-ambient` now
masks itself out over its first and last 14%.

### 3.4 The arc lives in one file

`content/narrative.ts` holds the ten beats in reading order with their ambient
tiers. § 8.3 promises the emotional arc is carried by the *sequence* of tiers,
and a sequence is not a property of any one section: if each section declares
its own tier beside its own copy, nobody is ever looking at the sequence, and
the failure is silent because every individual choice looks reasonable.

`beat(id)` **throws** on an unknown id rather than defaulting. A section that
has quietly dropped out of the arc would otherwise render with plausible
atmosphere and no chapter mark, which looks like a styling accident rather than
the missing table row it is. On a statically rendered route that is a build
failure.

---

## 4. Engines added or completed

| Engine | Status before RC5 | After |
|---|---|---|
| **Narrative / Chapter** | did not exist | `vos/Chapter.tsx` — the page-level tier |
| **Browser Mockup** | ⚠️ inline in `sections/DigitalCraft.tsx` | `vos/Frames.tsx` → `BrowserFrame` |
| **Live Metrics** | did not exist | `vos/Metric.tsx` — `Metric`, `Sparkline`, `MetricGroup` |
| **Parallax** | `motion/Parallax` — `useScroll` + `useSpring` + 3 `useTransform`s | `vos/Drift.tsx` — CSS, zero JS |
| **Evidence Overlay** | ✅, but its renderer was duplicated | `Schematic` exported; the second copy in `DigitalCraft` deleted |

`DigitalCraft` carried a private copy of the wireframe renderer **and** its own
five-entry tone map with different alphas, so the same vocabulary rendered two
ways depending on which section drew it. Both are now the engine's.

### The two judgement calls in `Metric`

**Nothing counts up.** The revision it replaces animated each figure 0 → value
over 1.4s. It is removed rather than reimplemented in CSS, and the reason is not
cost: *a number that counts up asserts it is being computed, live, from
something.* These figures are seeded demonstration data, so the animation made a
sample figure behave like a measured one — the "convincing is the failure mode"
trap § 6 exists to close. The section's header said *"Sample data"* while its
primary motion said the opposite.

**`provenance` is required on the group**, as it is on `Artifact`. The engine
emits *"Seeded demonstration data — not a customer account"* and a caller cannot
soften it.

Also removed: `TiltCard`'s `mousemove` 3D rotation, which was pointer-only — it
did not exist for half the visitors — and needed a 56px symmetric gutter
reserved around the card purely so the rotation would not push content past the
grid column. Depth is now expressed the way § 4.3 says to: elevation tier,
saturation and blur.

---

## 5. What it cost

Measured on production builds, this session.

```
                  before RC5      after RC5
  js  gzip          347.5 kB       332.9 kB      −14.6 kB   (budget 360)
  css gzip           15.1 kB        15.5 kB       +0.4 kB   (budget  40)
  largest            69.2 kB        69.2 kB       unchanged (budget 170)
  deps                     —              —       zero added
  page height    14,042 px      11,991 px      −2,051 px  (desktop, 1440)
                 13,985 px      13,691 px        −294 px  (mobile, Pixel 7)
```

**Nine sections rebuilt, a tenth added, five engines added or completed — and
the JavaScript bundle got 14.6 kB smaller.**

Where it went:

| Removed from the client bundle | Why |
|---|---|
| 9 × `SectionHandoff` | the rail crosses the join instead |
| `SectionHeader` (client, used by 8 sections) | `Chapter` emits the head on the server |
| `ScrollReveal` from `CaseStudy`, `Faq` | `.reveal-view` |
| `TiltCard`, `Breathing`, `StatCounter`, `ScanBeam` from `AIDashboard` | the Metric engine |
| `motion/Parallax` from `Hero` | `Drift` |
| `useScroll` + spring + 5 `useTransform`s from `FinalCTA` | one CSS `view()` ramp |
| `AutomationUniverse`'s copy | split — only the interactive diagram crosses the client boundary now |
| `FeatureStorytelling` entirely | § 2.3 |

Three sections became **server components**: `CaseStudy`, `Faq`, `AIDashboard`.

---

## 6. Verification

| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| `eslint src` | 0 errors (6 pre-existing warnings, all in `components/three/`, which no route imports) |
| Bundle budgets | all met — see § 5 |
| Reduced-motion probe | **27/27 pass**, up from 15 checks |
| Playwright suite | **403 passed, 10 skipped, 5 failed** on the first run — then 1 real defect fixed and 3 confirmed as load timeouts. See § 6.1 |
| axe | **0 violations.** `a11y.spec.ts` passed in full on both projects, and Lighthouse scores accessibility **100** on both presets |
| Lighthouse | § 6.2 — measured against a like-for-like baseline built from `HEAD` in a separate worktree, on this machine, in this session |

### 6.1 The five Playwright failures

**One was real, and mine.** `responsive.spec.ts` — *tap targets on mobile meet
the 24px minimum* — failed on `See what each tier includes, line by line` at
**312×21**. A 14px link's content box is 21px tall, and WCAG 2.5.8 sets 24×24 as
the floor. `.terms-more` now carries `min-height: 24px`. Fixed and re-run green
on both projects.

**Three were load timeouts**, all reporting *"Test timeout of 90000ms exceeded
while setting up page"* — a browser-context creation failure, not a page defect.
The suite took **28.8 minutes** wall-clock across two device projects. All three
pass on re-run.

**One is load-sensitive and is left alone.** `payload.spec.ts` — *the particle
canvas mounts on desktop and not on touch* — waits **4000ms** for a mount
scheduled by `requestIdleCallback(..., { timeout: 3000 })`. That is 1000ms of
headroom on a machine running two parallel Chromium projects against a page
whose main thread is ~75% paint. Measured: **3/3 pass in isolation** (6.4s, 7.4s,
6.9s); fails under full-suite contention.

It is not a regression — `git status` shows nothing in the mount path
(`providers/DeferredAtmosphere.tsx`, `ParticleField`, `layout.tsx`) was touched
— and the test was **not** loosened to make it green, because widening a wait to
hide contention is how a suite stops catching the thing it was written for.
`playwright.config.ts` already carries a long note about this project's timeouts
being wrong by default for exactly this reason; this test's internal wait is the
next instance of it, and it is recorded here rather than quietly patched.

### 6.2 Lighthouse, against a measured baseline

The repo records a mobile performance gate of **≥50**. RC5 scores **48**, which
is a gate failure — so the question is whether RC5 caused it. It did not: the
baseline, built from `HEAD` and measured on the same machine minutes apart,
**also fails**.

```
  mobile (median of 3)          baseline HEAD      RC5        delta
  ─────────────────────────────────────────────────────────────────────
  performance                        49            48        −1    (noise)
  total blocking time             7,200 ms      2,232 ms    −69%   ← 3.2× better
  speed index                        7.9 s         6.3 s    −1.6 s
  largest contentful paint           4.1 s         4.9 s    +0.8 s ← worse
  cumulative layout shift               0             0      unchanged

  desktop (median of 3)         baseline HEAD      RC5        delta
  ─────────────────────────────────────────────────────────────────────
  performance                        59            57        −2     ← slightly worse
  total blocking time               930 ms      1,040 ms    +110 ms
  speed index                        3.8 s         4.2 s    +0.4 s
  largest contentful paint           1.4 s         1.5 s    +0.1 s
  cumulative layout shift               0             0      unchanged

  both presets, both builds:  accessibility 100 · best-practices 96 · seo 100
```

**Read honestly, and the two presets do not agree.**

On **mobile** the blocking time — the metric that most directly reflects the
JavaScript this phase removed — improved **3.2×**, and Speed Index improved
1.6s. The score is flat within noise, and *both* builds miss the ≥50 gate on
this machine, which has been running builds, servers and a 29-minute browser
suite all session. So the gate failure is not RC5's.

On **desktop** RC5 is **2 points lower**, with a little more blocking time and
0.4s more Speed Index. The per-run ranges overlap (RC5 57–60, baseline 59–60),
so this is at the edge of noise — but it leans consistently the wrong way, and
the direction is the opposite of mobile's, which is what makes it worth writing
down rather than averaging away.

**Two deltas are unexplained, and neither is argued away:**

1. **Mobile LCP, +0.8s.** One observation per run on a 4× CPU throttle.
2. **Desktop paint, +0.4s Speed Index.** The plausible cause is that RC5 traded
   JavaScript for *compositing*: the page now carries ~20 `animation-timeline:
   view()` animations (eight chapter rails, the reveals, the sparkline, the
   drift, the descent) and nine `mask-image`d ambient layers where it previously
   had none. That is the right trade on a 4× throttled phone and may be a losing
   one on desktop, where JavaScript was never the constraint. It is a
   hypothesis, not a measurement — `npm run trace` on a quiet machine is the way
   to settle it, and that is the first thing to do next.

The recorded ≥50 mobile gate was achieved on a quieter machine. Nothing here
establishes that RC5 would miss it there — only that this machine cannot
currently reproduce it for **either** build, which is exactly why the comparison
was run rather than quoting a number from the repo.

### What the probe now covers

The narrative rail is the highest-stakes item on the list: one line running the
whole homepage, scroll-driven, and if it rests at `scaleY(0)` the page loses its
only structural through-line on every browser without scroll timelines — while
compiling, type-checking and looking correct in an editor. It is asserted to
rest **fully traced**, eight times.

`Drift` is asserted to rest **neutral**, which is the opposite rule and is
deliberate: the finished state of a parallax is an element pushed off its layout
position, so shipping that statically would misalign the composition rather than
merely un-animate it. Degrade to the state that is *correct without motion* —
which is not always the animation's end frame.

---

## 7. Two failures worth recording

Both cost real time and both are now impossible to repeat.

### 7.1 A capture that lied about the CSS

The first "after" capture showed a 23,099px page with `sr-only` text visible on
screen and every layout gone — indistinguishable, in a screenshot, from having
catastrophically broken the stylesheet.

The stylesheet was fine. `npm start` had been launched while a previous
`next start` still held port 3000, so the new server exited and **the old
process kept answering** — out of a `.next` directory that had since been
overwritten by a fresh build. Every chunk URL in its cached HTML 404ed.

`scripts/capture-narrative.mjs` now reads `.next/BUILD_ID` and refuses to
capture a server whose HTML does not contain it. One line of output instead of
twenty minutes.

### 7.2 A gap that was there and was not

`.run-stages` and `.terms` each carried `margin: 0`. Tailwind's preflight
already zeroes list margins, so those declarations did nothing — except shadow
`.chapter-stage`'s `margin-top`. Both are single-class selectors in the same
layer and these were later in the file, so they won, and the chapter head ran
into stage 01 with a 20px gap where 65 was intended.

It compiled, it type-checked, and it was only visible in a capture. That is the
third time this project has recorded that sentence, which is why
`VISUAL_OPERATING_SYSTEM.md` § 5 step 7 exists.

---

## 8. Screenshots

In `10_Final_Website/release-preview-rc5/`, gitignored under the existing
`release-preview*/` rule — regenerable review artifacts, not source.

```
  before/{desktop,mobile}/frame-01..16.png + full.png
  after/{desktop,mobile}/frame-01..16.png + full.png
```

Sequential viewport frames down one route, rather than one hero shot and one
enormous strip, because the question RC5 asks is about **one page read top to
bottom**: does it hold together, and does each chapter hand off to the next.

The freeze is applied **per frame**, after settling at each scroll position, and
removed before moving on. Freezing once at the top would pin every below-fold
element at its *entry* state — and on a page whose rail, reveals and parallax
are all `animation-timeline: view()`, that is the invisible-beam class of defect
the VOS notes already warn about, reintroduced by the harness meant to catch it.

---

## 9. Known, and not fixed here

- **The hero → chapter 01 seam.** A visible horizontal edge at the hero's bottom
  boundary, at y≈250 on the 1440px capture. It is **pre-existing and unchanged**
  — it appears at the same position in the before frames — and it is the hero's
  own vignette terminating at its section box rather than anything the chapter
  engine does. The chapter washes themselves now fade at their edges (§ 3.3).
- **`SectionHandoff` still ships** on `/book`, `/book/confirmed` and `/pricing`.
  The homepage no longer renders it. Those three routes are out of scope here.
- **`SectionHeader`, `ScrollReveal`, `TiltCard`, `Breathing`, `motion/Parallax`**
  are now unreferenced. They are left in the tree rather than deleted: removing
  a shared primitive is a separate change with its own blast radius, and an
  unreferenced module costs nothing in the bundle.
