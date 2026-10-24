# SheetFlow v2 Changelog

## Release Candidate 14 — Motion: a live before-and-after and an orbiting ecosystem (2026-10-24)

Decision: D40 (amends D39's switch and monochrome marks).

- **Before and after runs on its own.** A continuous loop: enquiries stall with red badges and are pulled
  through SVG beams into a glowing engine; finished cards land with green pills while a demo counter ticks.
  Pause control (WCAG 2.2.2), still frame under reduced motion, captioned as illustrative.
- **Ecosystem orbit.** A half-circle wheel of the eight tools turns around a SheetFlow core, with floating
  event badges; the cards below keep the names and habits in text.
- **Full-colour marks** on white tiles with brand-tinted glows and hover lift, in Light and Dark.
- Zero new client JavaScript. Verified with `tsc` and the production build only.

## Release Candidate 13 — Industry archetypes, a before-and-after, and the ecosystem (2026-10-24)

Decision: D39 (supersedes the naming part of D24; replaces the `live`/`demo` evidence kinds).

- **No client is named anywhere.** Case studies and dashboard stories are industry archetypes; identifying
  regions in screenshots are irreversibly redacted, six unredactable frames removed, files renamed; no case
  study links out; old client URLs redirect to `/work` (not to their archetype).
- **New chapter 01, "Before and after".** A keyboard- and no-JS-operable switch between an operational-friction
  week and the SheetFlow flow, with glass layers and line-by-line kinetic reveals; captioned as illustrative.
- **Ecosystem grid** inside the integrations chapter: eight tools around a SheetFlow hub, each with the habit
  the client keeps. Monochrome marks (Simple Icons, pinned), monograms where no licensable mark exists, and a
  trademark line.
- **Guards.** `smoke.spec.ts` fails on any former client name in rendered pages, `llms.txt` or the sitemap;
  `work.spec.ts` fails on an outbound link or a client organisation in a case study, and checks the redirects.
- Zero new client JavaScript; both new sections are server components.

## Release Candidate 12 — Scoped engagements instead of a price list (2026-10-23)

Decision: D38 (supersedes D25, amends D26).

- **No published prices.** `/pricing` and the homepage pricing beat show three engagement tiers:
  Foundation Audit & Rapid Sprint, Autonomous Operations Engine (recommended), and Enterprise Bespoke
  Infrastructure. Each says how it is quoted, what it includes and where it stops.
- **Every tier books directly.** "Book automation audit" links straight to the Calendly audit event
  with the tier attached (`utm_content`, notes field). A "Custom scope? Share details first" link keeps
  the `/book` qualification form. Still no embed and no third-party JavaScript.
- **New on `/pricing`:** how an engagement runs (audit, sprint, build, operate), what the audit
  measures to set a quote, and FAQs on why there is no price, the sprint, and usage charges.
- **Founder-authorised commitments:** the sprint's 48–72 hour time-box (bounded: once scope and access
  are agreed, one workflow, demonstration grade) and an SLA in the Enterprise contract.
- **Machine-readable:** price nodes removed from the JSON-LD; `llms.txt` tells assistants not to state
  or estimate a price. The calculator's break-even line is gone (it depended on the withdrawn price).
- **Tests:** `commerce.spec.ts` now fails on any currency figure in the pricing surfaces, checks every
  tier CTA's Calendly link on `/pricing` and the homepage, and checks the schema carries no price.

## Release Candidate 11 — Light by default, and the dashboards open up (2026-10-21)

Full write-up: [`docs/RC11_THEME_AND_STORIES.md`](docs/RC11_THEME_AND_STORIES.md). Decisions: D36, D37.

- **Light theme is the default; Dark is a toggle in the nav.** The OS colour-scheme is ignored on
  purpose. Dark is the original palette. The hero, the Automation Universe diagram and the closing CTA
  stay dark stage panels inside the light page.
- **Dashboard stories.** Four real interfaces (Saraswati, HEMLIFESTYLE, R³S Realty, SheetFlow
  Operations) as stacked scroll scenes with a phone frame that drifts through the page. CSS only, no
  client JavaScript. Each states its data basis; outcomes stay "Not publicly disclosed."
- **Capability ticker** under the hero: a CSS marquee of names the site already publishes, pausable.
- **Weight.** JS 409.4 to 410.2 kB gzip (+0.8 kB), CSS 17.0 to 18.6 kB. No new dependencies.
- **Tests.** New `theme.spec.ts` and `stories.spec.ts`; `a11y.spec.ts` now also audits Dark.

## Release Candidate 4 — two more sections stop being the same rectangle, and the bundle gets smaller (2026-08-10)

Full write-up: [`docs/RC4_SUMMARY.md`](docs/RC4_SUMMARY.md). The design rules
that governed it, written first: [`docs/DESIGN_OS.md`](docs/DESIGN_OS.md).

### Before anything else

The working tree held **35 modified and 16 untracked files** — the whole RC2 and
RC3 visual programme, verified against a production build and never committed.
The full gate was re-run rather than trusting the phase documents; every number
reproduced, and that is commit `a81ded0`. RC3 has no entry in this file because
it never had a commit either.

### The debt RC3 wrote down, now paid

RC3 diagnosed that **five of nine homepage sections were literally the same
object** and had budget to replace one. It also recorded, by name, the item it
planned and failed to deliver: the `AIInfrastructure` trunk diagram, whose six
branches wrapped to two rows so a distribution bus could only reach the first.

RC4 built it as the bilateral tree RC3 prescribed — hub left, six branch rows
right, every one connected — and took the next section down the list with it.

**Three of five done.** The rounded-square-with-an-icon now appears **eleven**
times on the homepage instead of twenty-five. `WorkflowPipeline` and
`FeatureStorytelling` are the remaining two, and they are the RC5 list.

### The connectors are CSS, and the alternative is recorded

A curve per branch in an SVG gutter was written and abandoned: branch rows are
content-sized, so the endpoints are unknown until layout runs. Runtime
measurement is a `ResizeObserver` per branch — the Magic UI `AnimatedBeam` cost
RC3 already rejected. Fixed row heights overflow at `md`. Proportional geometry
under `preserveAspectRatio="none"` is correct but renders the travelling signal
as a 1.35:1 ellipse, because `vector-effect` fixes strokes and not shapes.

A spine with stubs needs no coordinate system, so nothing is measured and
nothing can drift.

### `DigitalCraft` shows the work instead of describing it

Four glass cards become one browser frame that switches between websites,
landing pages, dashboards and custom builds.

The screens are **wireframes, and that is governance rather than taste**. Real
captures live in `public/work/` and reusing them makes the homepage argue the
same evidence twice; and there is no real capture for two of the four
categories, so two panels would have to be invented — the thing D24 and the
`ProjectEvidence` type exist to prevent. The frame says so on its face:
*"Indicative layouts — every build is designed from scratch."*

### Both sections now ship zero JavaScript

Neither holds state, so neither needs a client boundary. `AIInfrastructure`
dropped `framer-motion`, `useInView`, `Breathing` and `prefersReducedMotion`;
`DigitalCraft` dropped `framer-motion`, `ScrollReveal` and `GlassCard` in favour
of four visually-hidden radios and `:checked ~` selectors — which is also better
assistive-technology behaviour, since a real radio group announces "1 of 4" and
moves under arrow keys, where a `role="tablist"` without JavaScript advertises a
keyboard contract it does not honour.

```
  js    gzip   351.6 kB  →  349.1 kB   −2.5 kB   (budget 360)
  css   gzip    12.8 kB  →   14.0 kB   +1.2 kB   (budget  40)
  largest chunk 69.2 kB  →   69.2 kB   unchanged (budget 170)
```

Two new interactive centerpieces, and the JavaScript bundle got smaller.

### Two defects that only a screenshot could show

**The wireframes rendered as solid black bars.** `` `craft-sh--${tone}` ``
builds a class name that is a literal in no source file, and Tailwind
tree-shakes custom `@layer components` rules its content scanner cannot find.
All five tone rules were dropped and every `<rect>` fell back to SVG's default
`fill: black`. Confirmed by grepping the built stylesheet — nothing before, all
five after. Fixed with an explicit `Record<Tone, string>`.

**The tree was too faint to read as a system**, shipped at `0.34` alpha and
raised to `0.5` — the same value, for the same reason, RC3 reached for its beams
after making the same mistake.

### Verified

Types clean · lint 0 errors, 8 pre-existing warnings · build green, 30 static
pages · **axe 0 violations, 34/34** · **the full 418-test Playwright suite: 408
passed, 10 skipped, 0 failed, in 8.5 minutes** · all three bundle budgets met ·
**zero new dependencies**.

That last number closes something RC3 left open. RC3's suite took **3.0 hours**
and ended with two `axe.analyze()` timeouts on an untouched route, which it
argued were load artifacts from stale `node` processes rather than regressions.
The argument was sound but it was an argument. The same suite now runs in 8.5
minutes with zero failures, which settles it.

Not measured, and labelled as such: Lighthouse. The homepage's 52 mobile score
is real and untouched. RC4 removed JavaScript and added no requests, so there is
no mechanism for a regression — but that is an argument, not a measurement.

### A design conflict, resolved in the open

The RC4 brief asked for nine visual styles. `SHEETFLOW_VISUAL_DNA.md` § 9
rejects three of them by name — skeuomorphism, brutalism, and the faux-3D family
neomorphism and claymorphism sit in — and § 7 rules out maximalism. Each was
split into the *structural principle* it encodes and the *surface treatment* it
usually arrives with: the principles are used, the surfaces are not. Hence a
browser frame (object-mimicry, deliberate) drawn flat in brand tokens, with grey
dots rather than macOS traffic lights. `DESIGN_OS.md` § 1 sets out the split and
leaves the founder a one-sentence override.

---

## Release Candidate 2 — half the portfolio looked broken, and the fix was already in the data (2026-08-09)

A visual polish pass on finished engineering. No architecture changes, no
section rebuilds, no new features — and, by design, **no client JavaScript**.

### The finding

Five of the ten cards on `/work` are internal builds with nothing to
screenshot. They filled their 16:10 media area with a label, a gap, and three
monospace file paths — **~90 % empty**, measured on the running build. The grid
read as five finished cards followed by five broken ones, which is the exact
inverse of the truth: those five are the largest engineering on the site,
13,822 lines. The same five case-study pages opened with no visual anchor at
all, while a client page at the same scroll position showed a full-bleed
1280×800 capture.

A third finding sat alongside them: the section headed *"How the work moves
through it"* marked its four stages as a sequence with a **16 px hairline** that
was `hidden` below 1280 px.

### The fix, and why it invents nothing

`WorkflowGlyph` — a server component that draws a build's pipeline as icon nodes
joined by connectors, in three variants: the `/work` tile, the internal
case-study header panel, and a rail above the architecture cards on **all ten**
case studies.

Every node is a `project.architecture[].stage` — already published, already
reviewed, and rendered in prose in the detail cards directly beneath the
diagram. There is no separate diagram content that can drift out of agreement
with the page.

**That constraint improved the output.** The brief sketched the accounting
system as `WhatsApp → AI → Ledger`. The published architecture is `Receive →
Parse → Stage → Post`, and `Stage` is the human-verification queue between the
parser and the ledger — the boundary the entire case study is about, and the
thing the sketch erases. Drawing the sketch would have shipped a diagram
contradicting the page under it.

Guarded by two tests: every published stage must have an icon keyed by exact
string (no keyword inference, so a gap is detectable rather than plausible), and
every compact `short` label must be a literal word of the stage it shortens, so
it can never become a second unreviewed claim.

### A reduced-motion bug found on the way

The global `prefers-reduced-motion` rule collapses `animation-duration` but
leaves **`animation-delay` untouched**, so a staggered CSS animation still waits
out its full delay before snapping to its end state — up to **440 ms of
invisible content** for a visitor who asked for less motion. Fixed for the
glyph; **not** fixed globally, because that would re-time every existing
sequence on the homepage and this was not the phase for it.

### Also

- `lib/motion.ts` replaces **27 hand-copied easing literals across 11 files**
  with one definition. Behaviour-preserving by construction — every call site
  already used that exact curve.
- `.cta-panel` contains the closing CTA on all 11 work routes, which previously
  sat on flat void and was the least designed block on the page.
- `.kicker-bare` replaces two hand-copied class strings that were `.kicker`
  minus its one identifying rule.
- `.feature-card` radius 28 px → 20 px, matching the 18:1 majority.
- `artifacts` is now a non-empty tuple, which encodes the governance rule *and*
  removes a crash the new tile would have hit on an empty ledger.
- `/work/whatsapp-accounting-os` added to the axe suite — the internal case
  study was the one evidence kind it had never audited.

### Verified

**416 tests, 406 passed, 10 skipped, 0 failed.** axe **0 violations across 12**
route/motion combinations. Build green at 37 routes. JS **351.0 kB** gzip
(+0.1 kB, the constants module), CSS **11.6 kB** (+0.8 kB) — both inside budget.
Screenshot matrix re-captured, 70 images, from a build whose `BUILD_ID` was
matched against the served HTML first.

The +0.1 kB is recorded rather than rounded away: the phase's own target was
"no increase". The visual work itself cost zero client JavaScript.

Full record: `docs/RC2_VISUAL_AUDIT.md` (written before the code),
`docs/RC2_SUMMARY.md`, `docs/MOTION_INVENTORY.md`, `LAUNCH_CHECKLIST.md`.

---

## Release Candidate 1 — three defects that only a rendered page could show (2026-08-08)

A release pass, not a feature phase. No new pages, no new components. What it
produced was **three real defects**, and the common thread is that none of them
was visible in source — each needed the site actually rendered, at a width
somebody had not looked at.

### 1. Every card on `/work` was clipped on every phone

**The worst of the three, and it had survived four phases.**

One internal-build tile lists `scripts/lead_pipeline_manager.py — 446 lines`
using `truncate` — which is `white-space: nowrap`, and therefore has a
**317 px min-content width**. A grid item defaults to `min-width: auto`, so that
floor propagated to the column, and the column pinned **every card on the page**
to **431 px**.

Inside a 382 px container on a 430 px phone, that is 49 px of overflow. At
360 px it is **119 px**.

**Why nobody saw it:** an ancestor carries `overflow-x: clip`, so the cards were
silently cut off rather than producing a scrollbar. `scrollWidth ===
clientWidth` stayed true throughout — a document-level overflow audit run this
session reported **no overflow at any breakpoint**, and was correct and useless.
The measurement that found it compares each card against **its own grid box**.

Fixed with `min-w-0` on the grid item and on the truncating list. **Asserted by
test at 360, 390 and 430 px**, comparing card width to grid width rather than
document width — because the document-level check is exactly the one that
passes while this is broken.

### 2. The navigation broke between 768 px and 1024 px

The desktop bar switched in at `md` (768 px), where six links plus a logo plus a
CTA do not fit. On an iPad at 810 px, "How we work" wrapped onto **three lines**
and "Book free audit" onto two, roughly doubling the header height.

Moved to `lg` (1024 px), so tablets get the sheet menu. **Header height is now a
constant 64 px from 360 px to 1440 px**, measured.

### 3. …and that surfaced a latent bug worth more than the fix

With the menu open, the overlay is hidden by `lg:hidden` but `open` stays true —
so the scroll lock keeps `body { overflow: hidden }` applied. **The page becomes
unscrollable with no menu visible and nothing to click.** Escape still works,
for someone who guesses.

The bug predates this change, at `md`. Widening the range to 1024 px is what
makes it reachable in ordinary use: **rotating a tablet from portrait to
landscape now crosses the boundary.** A `matchMedia` listener closes the menu at
the desktop breakpoint.

### The build being previewed was stale

Worth recording because it nearly shipped. A byte count corrected in source
(429,197 → 429,734) still rendered its **old value**, because `next start` was
serving a `.next` from before the edit — the Windows/OneDrive hazard this
repository has documented twice.

**The first full screenshot matrix was captured from that stale build.** Caught
by reading a number off a screenshot and not recognising it. Server stopped by
PID from `netstat`, rebuilt, recaptured.

### Also fixed

- **`/work` grid order.** Demonstrations were appended last, so the page ran
  three image cards → five text tiles → two more image cards. That broke the
  visual rhythm and contradicted the lede directly above it, which introduces
  the kinds as client → demonstration → internal. Regrouped to match, and
  asserted by test.
- **The capture harness was photographing the cursor.** A synthetic mouse parks
  the custom cursor mid-viewport, and it had landed on a case-study spec-table
  label — which reads as a rendering bug to anyone seeing the deliverable
  without that context. Hidden during capture.

### Verification

| Check | Result |
|---|---|
| `type-check` | ✅ clean |
| `lint` | ✅ 0 errors, 8 warnings (all `set-state-in-effect`, all in `components/three/`) |
| `build` | ✅ green, **37 routes** |
| Playwright | ✅ **412 tests — 402 passed, 10 skipped, 0 failed**, 14.7 min on an idle machine |
| Bundle | ✅ **350.9 kB gzip JS / 360 kB**, CSS 10.8 / 40 kB (+0.1 kB for the nav fix) |
| Lighthouse (`/work`, mobile, median of 5) | **64** perf · **100** a11y · **96** BP · **100** SEO · CLS **0** |
| Responsive | 0 horizontal overflow, 10 routes × 5 breakpoints. Header height constant **64 px**, 360→1440 px |
| Screenshot matrix | **70 images** in `10_Final_Website/release-preview/` |

**On the Lighthouse number:** `/work` has now been measured at 65, 70, 62 and
**64** across four batches on four builds. **None of those differences is a
finding** — the documented band is 62–70 and every figure sits inside it. This
is the comparison Phase J was retracted for, and it does not get made here.

### Verified, not asserted

Every claim below was read off the running production build, not from source.

| Surface | Result |
|---|---|
| Sitemap | 21 URLs, `/book/confirmed` correctly absent |
| Per-route SEO | 9 routes × (exactly 1 JSON-LD block, 1 H1, description, Twitter card, self-canonical) |
| OG/Twitter images | 7 routes fetched — all 200, all `image/png` |
| Case-study JSON-LD | **All 10 audited.** 3 client emit `about`; 2 demonstration emit `url`+`image` and **no** `about`; 5 internal emit none. Zero `Review`/`AggregateRating` anywhere |
| Booking | Exercised end to end. Native validation blocks an empty submit; a filled submit composes the Calendly URL with prefill, composed notes and UTM, carrying no identity beyond what was typed |
| Pricing | `minPrice` floor, `UnitPriceSpecification` monthly, **no price node** for Bespoke, 7 FAQs, keyboard-reachable comparison table |
| Horizontal overflow | None at any of 5 breakpoints × 10 routes |
| `llms.txt` | 539 lines, three evidence kinds documented, the stale Phase-K sentence absent |

**A nuance worth recording about B2:** `NEXT_PUBLIC_SITE_URL` is not set locally,
so the build uses the code's fallback — `https://sheetflow.ai`. **The canonical
host is already correct in code.** B2 is purely a domain purchase and an
environment variable, not a code change.

## Phase Z — A retried MCP call, and two case studies that were being withheld for the wrong reason (2026-08-08)

Build green at **37 routes** (was 35). `/work` goes from 8 case studies to
**10**. Bundle **unchanged at 350.8 kB gzip JS** — the two new projects added
**zero** client JavaScript, which is the Phase Y server-side narrowing doing
exactly what it was built to do.

### The finding: a 502 was treated as a permanent capability gap

Phase M tried the Netlify MCP, got HTTP 502, and recorded Netlify as a **named
coverage gap** — honestly stated, and carried forward unchanged by Phase Y. Two
phases verified the three known Netlify URLs individually by fetch and noted
that the account itself had never been enumerated.

**It worked on the first call this phase.** The 502 was transient.

That is the **third time** this repository has turned a single failed network
request into a standing conclusion — after Phase M's "the Manus prototype is
dead" and Phase Y's own `ECONNRESET`. The written rule already covered retrying
before concluding. It did not cover this case, so it has been sharpened:
**re-test unavailable capabilities each phase.** Nothing about a 502 says it is
permanent, and "we could not use this tool" is a claim with a shelf life.

### What the enumeration proved, and the distinction two phases had collapsed

The account holds **4 projects**, all live, none access-protected — including
**one in no inventory anywhere**: `radiant-lollipop-6e4d44`, a live UGC NET
Sociology study site. Assessed and excluded (not automation work), but now
recorded rather than unknown.

The finding that changed what ships is subtler. Both clinic demonstrations are
deployed from **SheetFlow's own Netlify and GitHub Pages accounts**, and
controlling the deploying account is **direct evidence of authorship** — the
exact evidence Elevate WPC has never had, which is why that one is still out.

Earlier phases withheld these builds because a `-demo` URL signals a speculative
build rather than a delivered engagement. True, and beside the point: **"did we
build it?" and "did anyone commission it?" are two questions**, and answering the
second one honestly does not require declining to answer the first. Withholding
verified work understates the portfolio just as surely as overstating it
misleads.

### `ProjectEvidence` gains a third variant

`demo` — ours, reachable, **uncommissioned**. It is a distinct variant rather
than a flag on `live`, and the reason is the JSON-LD:

- `live` emits `about: Organization`, which asserts the named business is what
  the work was **for**.
- `demo` emits `url` and `image` and **never `about`**. The builder branches on
  the discriminant, so there is no reachable path that names a client for work
  nobody commissioned — and a test asserts both the absence of `about` and the
  presence of `url` and `image`.

A boolean would have been the smaller diff and the weaker guarantee.

**The disclosure appears in three places**, because one is not enough: a
mandatory `basis` sentence rendered **above** the screenshot (a reader who looks
at the picture and leaves has still passed it), a "Demonstration" marker on the
`/work` card, and a rewritten `llms.txt` naming all three kinds with an explicit
instruction not to count demonstrations as customers.

**Client count is unchanged at three.** Everything that makes a client claim
calls `liveProjects()`, which cannot return a demonstration.

### Shipped

| Case study | Evidence | Note |
|---|---|---|
| **Dr. A.K Gupta Dental & Diagnostic Centre** | `demo` · `ak-dental-demo.netlify.app` | 429 kB single document — **88% of it is five base64-inlined JPEGs** |
| **Align Dental Care** | `demo` · GitHub Pages + 1,326 lines of source | React 19 / Vite 8 / Tailwind 4; clinic facts in one typed module |
| **Saraswati CRM dashboard** | `CompanionSurface` on the existing case study | Queued since Phase M; seeded-data note now **required by the type** |

### Reading the artifacts stopped a publication

Krishna Dental was about to ship — D32 had removed its only stated disqualifier.
Re-reading it rather than reclassifying it on the old note found
**`wa.me/91XXXXXXXXXX`**, an unreplaced placeholder, and **no form at all**.
It is an unfinished template, and publishing it would have advertised a dead
contact path on a page carrying a real clinic's name. **Still excluded, on
better grounds** (D33).

The general lesson: when a rule changes, **re-check the artifacts it was
excluding** rather than assuming the new rule admits them. Here the old reason
was wrong and the conclusion was right.

### A defect in `llms.txt` that the growth exposed

Its citation guidance listed `projects.map(p => p.client)` under **"Client names
and their live sites — published with permission."** That was already false for
the five internal builds, which have no client and no permission behind them; it
was simply not visible while the wording predated them. It now lists the three
kinds separately, generated from the evidence discriminant so the lists cannot
drift apart again.

### Verification

| Check | Result |
|---|---|
| `type-check` | ✅ clean |
| `lint` | ✅ 0 errors, 8 warnings (all `set-state-in-effect`, all in `components/three/`) |
| `build` | ✅ green, **37 routes** |
| Playwright | ✅ **408 tests — 398 passed, 10 skipped, 0 failed** |
| Bundle | ✅ **350.8 kB gzip JS / 360 kB**, CSS 10.7 / 40 kB — *byte-identical to Phase Y* |
| Lighthouse (mobile, median of 5) | `/work` **62** · `/work/ak-dental-diagnostic-centre` **63** — a11y **100**, SEO **100**, CLS **0** on both |
| axe | ✅ 0 violations across 11 route/motion combinations, 22 scans per run |

**On the `/work` score: earlier batches recorded 65 and 70. That is not a
regression and is not reported as one** — three batches, three builds. The
documented band for the route is **62–70**. The two routes above *are* mutually
comparable, because they ran back to back in one batch.

The homepage was not re-measured: nothing this phase touched its render path.

### Also this phase

- **The reachability test retries once** before failing, and now covers
  companion surfaces. Written directly from the rule above rather than left as
  documentation.
- **The Saraswati case study gained two decisions**: why the dashboard ships
  with invented patients (it is publicly reachable with no login, so fictional
  records are what keep a demonstration surface from being a privacy exposure),
  and why it is deliberately unlinked from the public site.
- **`capture-work-shots.mjs`** captures six frames, up from three.

## Phase Y — The final evidence sweep, and two findings that were wrong (2026-08-08)

Build green at **35 routes** (was 30). `/work` goes from 3 case studies to
**8**. Bundle **down** to 350.8 kB gzip JS from 355.7 kB, while adding five
projects.

### Every earlier sweep searched the wrong tree

Phase M's discovery was scoped to OneDrive. Phase Y searched `C:\Users\pc`
entire, and found **five substantial systems no previous phase had seen** —
roughly **13,800 lines**:

| System | Size | Strongest evidence |
|---|---|---|
| WhatsApp Accounting OS | 1,739 TS | **21/21 tests pass**, executed this session |
| Outbound Lead Engine | 6,928 PY | 34 modules, IMAP reply detection, Claude scoring with rule-based fallback |
| WPC Design Automation | 2,446 PY | 7 production bundles, 250-contour compiled toolpath |
| AI Voice Receptionist | 1,487 JS | Twilio + OpenRouter + ElevenLabs, 8-endpoint call lifecycle |
| Bank Statement Parser | 1,222 PY | Real 4-sheet Excel workbook, **264 transactions**, verified via openpyxl |

**The best one was in a repository a previous phase had excluded as empty.**
`sheetflow-ai-ca` is 1 KB — a README describing *"WhatsApp-first, Hindi/Hinglish,
deterministic accounting engine"* and no code. Phase M excluded it as an
intention, correctly on the evidence it had. The implementation was on the plain
Desktop, outside every searched root, and it matches the README clause by clause:
a Devanagari-aware parser, a double-entry PostgreSQL ledger with money as
`NUMERIC(15,2)` and BigInt paise, and a Gemini dependency used **only** for
insights with no write path.

### Two Phase M conclusions were false

1. **The Manus prototype is alive.** Phase M recorded HTTP `000`, read it as DNS
   failure, and excluded it. Re-fetched following redirects: **200, 369,848
   bytes**, a real Elevate WPC showcase. The `000` came from a **single attempt**.
2. **`r3s-realty.vercel.app` is a byte-identical mirror** — md5 `641c6e13…` on
   both hosts. Phase M called it "a second Vercel project" without hashing it.

The first matters beyond itself. This repository already holds a standing rule
that one measurement is not a finding; Phase M applied it to Lighthouse and not
to `curl`. **The identical error recurred inside Phase Y's own test run** —
`r3s-realty-agra` returned `ECONNRESET` once and 200 on re-run. Neither
correction changes the portfolio: authorship of both Elevate WPC artifacts is
still unverified, which was always the real disqualifier.

### `ProjectEvidence` — the type change Phase M identified and deferred

`WorkProject.liveUrl` was required and documented *"Must return HTTP 200"*, with
a test asserting it against every project. None of the five new systems has a
URL. Making `liveUrl` optional would have silently dropped the guarantee the
field exists for.

Instead the two cases became structurally different. `live` carries `liveUrl` and
`shot`. `internal` **has no field a URL or an image can be typed into**, and
carries an `artifacts` ledger — named files, line counts, a test count and the
date it ran. The guarantee is now stronger than before:

- `liveProjects()` returns a narrowed type, so the reachability test **cannot be
  handed an internal build**, and an internal build cannot opt out by leaving a
  URL blank.
- A new test asserts internal case studies emit no project `url`, no `about`
  organisation and no `image`. Inventing a client for uncommissioned work is a
  test failure.
- `llms.txt` states the distinction, because a model summarising the site is
  exactly where "SheetFlow built an accounting system" becomes "…for a client".

### The new content exposed a real bundle defect

Adding five case studies took gzipped JS to **369.3 kB and failed the 360 kB
gate**. The content was not the bug. `components/sections/CaseStudy.tsx` is a
`'use client'` component that imported `@/content/work`, so **the entire
case-study corpus** — every architecture stage, engineering decision and FAQ
answer — shipped to the browser to render three cards showing a name, a sector
and a picture. Invisible at three projects; 13.6 kB at eight.

The homepage now narrows to six fields on the server. Result: **350.8 kB, below
the pre-Phase-Y baseline**, with eight case studies instead of three.

One wrinkle worth recording: `toCard` initially lived beside the component and
the build failed at export with a serialization error. Anything exported from a
`'use client'` file becomes a client reference, so a server component calling it
gets a proxy. It belongs in the content module.

### Rejected, with reasons

- **PMA Automation Agency** — four prompt documents and a **22-line** Twilio test
  script. Not a system.
- **AI Content Engine** — 6,272 lines across 20 agents, genuinely substantial,
  but **it cannot run as found** (placeholder API keys throughout) and has
  produced **no output** beyond two temp files. A content engine's evidence is
  content. Reassess when a run produces artifacts.
- **OpenClaw** (318-line skeleton), **Sheetflow_Strategy** (one markdown file),
  **AAA-Client-Work** (sales collateral), **AI_Workspace (ChatGPT)** (no code).

### 🔐 Two more plaintext credentials

Neither public; neither directory is a git repo. **Both inside OneDrive**, so
both are synced and in file version history.

- **Twilio Account SID + Auth Token**, hardcoded in
  `PMA_Automation_Agency/twilio-demo/call.js` with the founder's personal mobile.
  **A duplicate copy exists** in `Downloads/AI_Projects/`.
- **Groq API key** in `ai_content_engine/config.json`, in a file whose own
  comment claims all values are *"safe placeholders"*.

With Phase M's Airtable token that is **three findings across two phases** — a
pattern, not three accidents.

### Also: 13,822 lines have no version control

Seven git repos exist on the machine; five are client sites, two are vendored
third-party libraries. **None of the five internal systems is in git.** Changes
nothing about publication; it is the highest-value non-website action available.

## Phase L — Catalogue parity, and return messaging that is arithmetic (2026-08-08)

Build green at **30 routes** (was 28), suite at **290 tests** (was 264).

### Two catalogued services had no page, and had not for two phases

`hasOfferCatalog` has advertised six services since Phase G. Only four had
pages. **`Daily Business Reports` and `Invoice Reminders` sat in the entity
graph with nothing behind them** — an `Offer` carrying one line of description,
no `url`, and nothing for a consumer to cite. That is the schema equivalent of a
dead link, and it was being served to every crawler and answer engine that read
the organisation node.

Both pages now exist, to the same governance as the other four: integrations are
a strict subset of the published integrations answer, no prices, no timelines,
no metrics, and `symptoms` describe what the reader already observes in their
own business rather than anything we claim about ours.

**Why the existing parity test was blind to it.** `seo.spec.ts` walked
pages → catalogue, so it could catch a page that drifted from its offer and
nothing else. The failure mode it could not see was an offer with no page. The
new assertion walks catalogue → pages, and additionally requires every offer to
carry a `url` — which only becomes true once the page exists. Both directions
are now asserted.

Clusters are bidirectional: `crm-automation` links to `business-reports`, and
both new pages link back into the set.

### Return messaging, constructed so it cannot become a claim

The recovery calculator gains a break-even line:

> At ₹5,000 per customer, recovering **1 customer** a month covers the ₹4,999
> retainer.

This is the only return-on-investment messaging on the site, and its
construction is the entire point: it divides **our own published price** — a
fact, D25 — by **the visitor's own figure** for what a customer is worth.
Nothing SheetFlow has achieved enters the arithmetic, so the output cannot be an
assertion about it. Contrast the usual agency calculator, which hard-codes the
flattering variable ("recover 40% of missed leads!") and presents a fabricated
outcome as a projection.

`Math.ceil`, not `Math.round`: recovering 1.2 customers does not cover the
retainer, and rounding down would overstate the case in our own favour.

The retainer figure is read from `content/pricing.ts` rather than retyped, so a
price change moves the break-even with it. A hard-coded copy is how a page ends
up quoting two different prices.

### Enterprise band

A dedicated multi-location section with its own CTA and scope points.

Every line describes **what is scoped**, not a service level. "Priority
support", "dedicated success manager" and "SLA" are the usual contents of a band
like this, and all three are absent because none is offered. Inventing a support
tier to make the section look substantial is the same class of fabrication as
inventing a metric — it is just harder to notice.

### Verified

- **290 tests**, up from 264. Type-check and lint clean, 0 errors.
- Lighthouse mobile, median of 5: `/pricing` **65** (was 66 — inside noise; the
  band is static markup), `/services/invoice-reminders` **68**. Accessibility
  **100** and SEO **100** on both.
- Sitemap carries all **14** content URLs; both new service pages resolve, with
  their own OG cards.
- Bundle **356.6 kB gzipped** against a 360 kB budget. **Headroom is now 3.4 kB**
  — worth knowing before the next client component is added.

### Production deployment — attempted, blocked

`vercel --prod` was blocked by the session's permission policy on both attempts,
as the preview deploy was in Phase K. The Vercel MCP's `deploy_to_vercel` was
evaluated as an alternative and **rejected**: it creates a *new* project from a
file tree, so it would have forked a duplicate rather than deploying the linked
`sheetflow-ai-website`.

Deployment therefore remains outstanding and needs to be run by the founder.
**B2 should be settled first** — see the blocker table in `PROJECT_HEALTH.md`.

## Phase K — The site becomes a business (2026-08-08)

Three commercial surfaces the site has never had: a portfolio, published
prices, and a booking flow. Build green at **28 routes** (was 19), suite at
**264 tests** (was 152).

### The blocker that had to be resolved first

The execution contract opened with *"client permissions have now been granted"*.
The founder's own CRM ledger — brief #17, dated 2026-07-31, seven days earlier —
reported **0 clients closed in 2026, ₹0 pipeline, no demos booked, no agreements
signed**. One of the three sites carries the founder's own email as its contact.
The sites name real third parties with real credentials: a BDS registration
number, an IAP professional registration.

Those two things cannot both be true, and the gap mattered because publishing
would assert a commercial relationship about **named real people** who had not
been asked. It was raised as a legal-permission question with the evidence
attached, before a single page was written. The founder reaffirmed and drew a
boundary: names, screenshots, links, architecture and implementation detail are
publishable; revenue, conversion, ROI, metrics, testimonials and timelines are
not; where an outcome is unavailable, say *"Not publicly disclosed."*

That is **D24**, and everything below derives from it.

### The type system had to change, because the docs were wrong about it

`PROJECT_STATUS.md` stated: *"The architecture already supports the second case
— a case study can carry a summary without a metric."*

It did not. `VerifiedCaseStudy` **required** `metric` and `metricLabel`, so a
permissioned-but-unmeasured project could not be typed at all. The claim had
been true of the intent and never of the code.

`ProjectOutcome` in `src/content/work.ts` fixes it in the same spirit as D1:

```
| { disclosure: 'measured'; metric; metricLabel; verification: Verification }
| { disclosure: 'not-disclosed' }
```

The `not-disclosed` variant has **nowhere to put a number**. Publishing a figure
requires a full `Verification` carrying its methodology and confirmation date.
The boundary is enforced by `tsc`, not by whoever reviews the next commit.

### /work — three case studies that sell on engineering

Results are the one thing these pages may not sell on, so they sell on the thing
that *is* verifiable: how the build works. Each page carries the problem, the
data flow, the observed stack, the decisions — and, for every decision, **how
the reader can confirm it themselves** on the live site. A figure asks for
trust; *"open the booking form and view source"* does not.

Every technical statement was read off the live deployment on 2026-08-07:

| | Read from the deployment |
|---|---|
| Saraswati Dental | Static HTML; GSAP 3.12.5 + ScrollTrigger; Indian-mobile validation pattern; **an off-screen honeypot rather than a CAPTCHA**; required consent tick; Noto Sans Devanagari loaded as a first-class face beside the Latin stack; Dentist + FAQPage + OpeningHoursSpecification + GeoCoordinates |
| SPARC Physiotherapy | Static HTML; **form submits into WhatsApp, and says so above the fields**; `novalidate` with results announced through `role="status"`; inline SVG sprite via `<use>`; MedicalBusiness + Person + EducationalOccupationalCredential linked to the awarding institution |
| R³S Realty | React SPA on Vite/Rolldown; four cache-independent chunks (app 30.7 kB, vendor 178.4 kB, motion 125.9 kB, charts 372.9 kB); RealEstateAgent **and** LocalBusiness; Product with a currency-denominated Offer; Search Console token shipped in the document |

**Elevate WPC is absent (D27).** Named by the founder, but it has no verifiable
artifact — not among the account's 5 Vercel projects, no resolving domain under
any tested spelling, nothing in the workspace. D24 permits publishing
architecture; it cannot be exercised for a build nobody can observe. Omitted
rather than guessed.

### /pricing — the numbers, before the call

₹19,999 one-time and ₹4,999/month (**D25**). Neither figure is new: both already
appear in the founder's own outreach material, so this is disclosure of a
standing quote rather than a fresh commitment.

Refused, each for a stated reason: delivery timelines (never timed), ROI figures
(never measured), anchor pricing (invents a price nobody paid), "most popular"
badging (a sales statistic nobody has — the featured tier reads *what we
recommend*).

The recovery calculator takes **every** input from the visitor, the recovery
rate included. That is the whole difference between it and a fabricated
projection, and the page says so instead of footnoting it.

Prices are machine-readable and typed by shape: `minPrice` for the "from" tier
because ₹19,999 is a floor, `UnitPriceSpecification` for the monthly, and **no
price node at all** for the quoted tier.

### /book — a conversion step that ships no third-party JavaScript

Every CTA used to jump straight to Calendly. That works, and it throws away two
things: the call opens cold, and the funnel has no observable step on our side.

`/book` adds four questions and prefills Calendly by URL — parameter names
verified against the live event type (`Free Automation Audit`, 30 min, Google
Meet, one custom question at position 0), not assumed. The inline widget was
**rejected** (D26): a third-party script and iframe on the highest-intent page
of a site whose measured constraint is mobile bandwidth, plus a tracking surface
handed over before anyone agreed to anything.

The form is a real `<form method="get">` whose inputs are named as Calendly's
own parameters, so **the conversion path survives with JavaScript disabled**.
Both properties are asserted by test.

### Fixed — each found by building the above, not by looking for it

| Fix | Severity | How it surfaced |
|---|---|---|
| **Comparison table unreachable by keyboard** | **Serious (WCAG 2.1.1)** | axe on the *mobile* profile, where the table actually overflows. A horizontally scrollable container that cannot receive focus is unreachable without a mouse. Now a focusable named region. Desktop passed throughout — the defect only exists at the width where the scroll appears. |
| **Two `WebSite` nodes on every case study** | Medium (SEO) | Reading the rendered graph rather than the source. The project node was typed `WebSite`, colliding with the site's own — Google reads that type to resolve site name and sitelinks. Retyped `CreativeWork`; a test asserts exactly one. |
| **`llms.txt` asserted two things that had just become false** | **High (GEO)** | It told AI engines *"SheetFlow publishes no customer names, outcome metrics… or pricing"*. Both false the moment `/work` and `/pricing` shipped. A stale directive in that file is worse than no file: it is addressed to the systems most likely to obey it. Rewritten to separate what is published from what must never be inferred. |
| **Footer sent five labels to one anchor** | Medium (navigation) | The "Who it's for" group pointed all five entries at `/#customers` — the exact dark pattern a comment three lines above criticised in the Services group. Fixing it in one place and leaving it in another is how a pattern survives review. Replaced with Work, where every entry is a page. |

### Verified

- **264 tests**, up from 152. Type-check and lint clean, 0 errors.
- Lighthouse mobile, median of 5: `/` **52**, `/work` **65**, `/pricing` **66**,
  `/book` **76**. Accessibility **100** and SEO **100** on every route.
- **The homepage did not regress.** It gained three case-study images and
  measured 52 — the centre of its documented 48–54 band, against a median-of-9
  baseline of 52. Stated as *no detectable change*, not as an improvement:
  a one-point move on this machine is noise (see Phase J).
- Bundle **355.7 kB gzipped** against a 360 kB budget. All budgets met.

### Still blocked, and still the founder's

**B2 is unchanged and now matters more.** `vercel domains ls` returns **0
domains**; `NEXT_PUBLIC_SITE_URL` resolves to a `vercel.app` subdomain. Every
canonical, `og:url`, sitemap entry, `llms.txt` reference and JSON-LD `@id` on
the new routes therefore points at the wrong host — including the case-study
`@id`s that now carry client names. Moving later re-hosts the entity graph and
discards whatever authority accrued. **Attach the domain before inviting
indexing.**

## Phase J — The JavaScript levers are spent (2026-08-07)

**Nothing shipped. That is the finding.** A final optimisation phase was run
against a 55–60 mobile target, restricted to unused JavaScript, hydration cost,
lazy loading, dynamic imports, render scheduling and bundle splitting. One
candidate was built and measured; it did not clear the noise floor and was
rejected. No code from this phase is in the tree.

### The candidate

Two changes, both pure loading strategy with no visual or animation effect:

- `GsapProvider` wraps the tree from the root layout and statically imported
  `@/lib/gsap`, putting gsap, ScrollTrigger and CustomEase in the initial chunk
  of **every route** — including the service pages, which use no gsap. Profiled
  at 4× CPU, gsap cost **94.5 ms of load-phase self time**. Moved to a dynamic
  `import()` inside the effect that already did the registration.
- The nine below-the-fold sections were code-split with `next/dynamic`, `ssr`
  left at `true` so the server HTML — FAQ answers, headings, all the content the
  structured-data tests assert — stayed byte-identical.

### Why it was rejected

| `/` mobile, median of 9 | Score | TBT |
|---|---|---|
| Baseline (`a31065a`) | **52** | 2,590 ms |
| Candidate | **53** | 2,484 ms |

Per-run: 48/49/49/50/52/52/53/53/54 against 51/52/52/53/53/53/53/53/54.
**Mann-Whitney U = 57.5 against a critical 62 at n=9 — not significant.**

An earlier n=5 pass read **+3** and was wrong. The cause is visible inside the
baseline batch itself: runs 1–4 scored 48–50 and runs 5–9 scored 52–54, because
the machine quietened partway through. The candidate had been measured during
the quiet half. **A within-batch trend invalidates a between-batch comparison
even when both batches are "median of N".** Interleave or re-measure both.

### Why no lever in scope could have hit 55–60

`mainthread-work-breakdown`, mobile preset:

| | Baseline | Candidate |
|---|---|---|
| Other | 8,179 ms | 5,577 ms |
| Style & Layout | 2,604 ms | 2,938 ms |
| **Script Evaluation** | **2,476 ms** | **2,294 ms** |
| Script Parsing & Compilation | 198 ms | 209 ms |
| Total | 14,200 ms | 11,700 ms |

**Script evaluation and parsing are ~2.5 s of an 11.7–14.2 s main thread.** The
six permitted levers all act on that fifth. Style & Layout plus "Other" — paint
and compositing, the same cost D17 and the trace work identified on desktop —
are ~8.5 s, and reducing them means fewer or smaller translucent layers, which
constraints 2, 3 and 4 correctly forbid.

The candidate also demonstrates the ceiling directly: total page transfer was
**510 KiB against the baseline's 508 KiB**. Splitting the bundle changed *which*
chunks exist, not what the browser fetches inside the load window, because every
lazy boundary sits in the server-rendered tree and hydrates immediately. To
actually defer that work, hydration would have to be gated on intersection —
which needs the sections rebuilt as server components with lazily-hydrated
interactive shells. That is a refactor of all nine, and it would strip the
`whileInView` reveals that are the animation quality being protected.

**The project is at its practical optimisation limit within the stated scope.**

### Kept for the founder

The candidate is preserved as `git stash@{0}` (*"arm1: gsap defer + section
code-split"*). It is ~1 point and ~400 ms of TBT — real but unprovable at this
sample size, and it measurably tightened TBT spread (1,958–2,956 ms against the
baseline's 2,586–6,994 ms). Worth revisiting only if the noise floor improves or
CI gains a quiet machine; not worth carrying into a freeze on the evidence here.

## Phase I — The mobile gate closes, on a font nobody could see (2026-08-07)

Phase H left the homepage failing its own ≥50 mobile gate and named the lever as
"bytes". Both halves needed correcting: the biggest byte was not the one anyone
was looking at, and bytes alone were not enough.

### Shipped

- **Dropped the italic style from Fraunces.** `layout.tsx` declared
  `style: ['normal', 'italic']`; the only occurrence of "italic" anywhere in
  `src/` was that declaration. Because the font is layout-declared, Next
  **preloaded** the italic face: **81,704 bytes, `rel="preload"`, the largest of
  four preloaded fonts and 36% of the 228,864-byte preloaded payload**, for a
  face with no way to reach the screen. Result: **19 → 16 woff2, 607,148 →
  431,728 bytes; preloads 4 → 3, 228,864 → 147,160 bytes.**
- **The site-wide particle canvas no longer mounts on touch devices.**
  `ParticleField` is mounted `reactive` — its per-particle inner loop is cursor
  repulsion. Without a pointer that force never fires, leaving a full-viewport
  canvas repainting 130 particles and their links at 30fps for a drift nobody
  can interact with. `CustomCursor` already early-returns on `pointer: coarse`;
  this applies the same established test to the other pointer-driven layer. The
  chunk is now never requested where there is no cursor.
- **The hero's 2.7 MB ambient clip is desktop-only**, with Save-Data and 2G
  honoured at any width. Mobile gets the poster it already showed under reduced
  motion. **This does not move the Lighthouse score and is not claimed to** —
  see below.
- **8 new payload tests** (152 total, was 144), asserting each saving in *both*
  directions: no italic face and ≤3 preloads; the clip absent on mobile **and
  still present on desktop**; the canvas absent on touch **and still mounting on
  desktop**. A one-line revert of any of these looks like tidying in a diff.

### Measured — before and after, one machine, one batch

Mobile preset, median of 5, warm-up discarded.

| `/` mobile | Perf | LCP | TBT | SI | Transfer |
|---|---|---|---|---|---|
| Before | **45** | 4.8 s | 5,240 ms | 7.9 s | 591 KiB |
| After | **50 — passes** | 4.2 s | 3,180 ms | 6.7 s | 508 KiB |

Per-run scores 44/46/43/45/46 → 49/51/48/50/53. **The distributions do not
overlap**, so the direction is not in doubt — but the median sits *exactly* on
the gate and single runs still dip to 48. This is "stopped failing", not
headroom.

### Two corrections to Phase H

- **The 2.7 MB video is not the mobile bottleneck**, and assuming it was would
  have credited it with the font's work. Lighthouse's `network-requests` records
  **627 bytes transferred** for it (HTTP 206 metadata range): `preload="metadata"`
  holds, and `autoPlay` is applied post-hydration so playback never begins inside
  the measured window. Total transfer was 591 KiB *including* the video. The
  gate is kept anyway — Lighthouse stops observing at load and a phone does not,
  so a real visitor still streams and loops 2.7 MB of decoration on a metered
  plan. A true cost that no score will ever argue for.
- **D23 is amended: mobile is paint-bound as well as bandwidth-bound.**
  `mainthread-work-breakdown` reads **"Other" 8,179 ms and Style & Layout
  2,604 ms against Script Evaluation 2,476 ms** of a 14,200 ms main thread —
  the desktop finding amplified by the 4× CPU throttle. Bytes move LCP and Speed
  Index; paint moves TBT. Clearing five points needed one of each.

### The lesson worth keeping

Phase H established that trimming font *weights* changes nothing, because
`next/font` emits one file per **subset**. That is true, and it is what hid this
win for a phase: a **style is a separate `@font-face` with its own `src`**, so
styles behave nothing like weights. *"X changed nothing" is a fact about X, not
about the category X belongs to.*

### Not done, and why

- **Unused JavaScript (0.45 s, 44 KiB)** — the only remaining opportunity
  Lighthouse reports. Reaching it means code-splitting the motion libraries:
  a refactor with real regression surface for a fraction of the last change,
  and speculative until something says which chunk hurts.
- **The 1,850 ms boot overlay on mobile** — the largest remaining LCP lever on
  this route, and squarely brand identity (first impression, once per session).
  Shortening or skipping it on phones is a founder call under
  `EXPERIENCE_GOVERNANCE.md`, not an optimisation to take quietly.
- **A2 is untouched.** The particle gate sits at its edge and is flagged rather
  than smuggled: it changes what a phone sees, and nothing about desktop.

## Phase H — Mobile measured, and two hypotheses killed (2026-08-07)

### Unblocked

- **`gh` is authenticated** (`sheetflow51-prog`) and **the five stdio MCP
  servers now report `✔ Connected`.** The folder-trust gate is cleared. The MCP
  *tools* still are not callable in the session that observed it — servers
  attach at startup — but this time "live next session" is the correct claim
  rather than the wrong one recorded twice before.
- **GitHub MCP still fails**, now with a different and more specific error:
  *"Incompatible auth server: does not support dynamic client registration."*
  That is not the trust gate; it needs its own investigation.

### Searched — the open-source-first order, finally run

With `gh` working, the seven named registries were looked up rather than
recalled. **Two are materially different from their reputation:**

- **Origin UI** — `origin-space/originui` now redirects to `cosscom/coss`,
  Cal.com's design system, licensed **AGPL-3.0**. Strong copyleft. Copying from
  it into a commercial site is a legal question, not a developer's judgement.
- **React Bits** — GitHub reports **NOASSERTION**; its licence could not be
  verified. Unverified terms are a stop for commercial reuse.
- `21st-dev/magic-mcp` has **no LICENSE file** at all.
- shadcn/ui, Magic UI, Radix and Motion Primitives are confirmed **MIT**.

This file previously described all of them as "mixed MIT" on reputation. That
was wrong, and finding out is what the search was for. Nothing was imported —
every registry ships *visual components*, and the page in question fails its
mobile gate because it already sends too much.

### Measured — first mobile baseline for the service routes

| Route | Perf | LCP | TBT | SI |
|---|---|---|---|---|
| `/` | **48 — fails the ≥50 gate** | 4.5 s | 4,170 ms | 7.2 s |
| `/services` | pass | 4.3 s | 570 ms | 4.8 s |
| `/services/whatsapp-automation` | 59 | 4.4 s | 970 ms | 4.9 s |

**Desktop 97 implied nothing about mobile** — the same page drops to 59.

**Mobile is bandwidth-bound; desktop is paint-bound (D23).** The mobile preset
simulates Slow 4G at 1.6 Mbps, and ~340 kB gzipped JS plus 228 kB of preloaded
fonts is ≈2.9 s of transfer before anything paints. LCP sat at 4.3–4.5 s across
three routes whose payloads differ by an order of magnitude — a metric that will
not move with content is not measuring content.

### Two hypotheses tested and rejected

Recorded because a wrong guess that was checked is worth more than a right one
that was not.

1. **"Six declared Inter weights are six files on the critical path."** Trimmed
   300/700/800, all verified unused. Result: **byte-identical** — 607,148 bytes,
   19 files, 4 preloads, before and after. Inter is a *variable* font, so
   `next/font` emits one file per **subset**, not per weight. Kept as hygiene,
   explicitly not claimed as an optimisation.

2. **"The full-screen boot overlay pins LCP."** Plausible — it ran ~1,850 ms on
   every route from the root layout, and a fixed timer would explain an LCP that
   ignores content. Gated to the homepage, same route re-measured:
   **Speed Index 4.9 s → 3.3 s. LCP unmoved.** The overlay delayed *visual
   progress*, not the largest paint.

### Changed

- **The boot sequence runs on the homepage only (D22).** Kept on the Speed Index
  result and on an experience argument that needs no metric: a service page is a
  search landing surface, and nobody arriving from a query should watch a brand
  boot animation first. Untouched on the homepage. **Touches the brand
  experience — flagged for review, reversible in one line.**

## Phase G.1 — Social cards, and the environment audit (2026-08-07)

Build green at **19 routes**, suite at **144 tests**.

### Fixed

- **Every route added in Phase G shipped without a social image.** Next.js
  `opengraph-image` file conventions apply to the segment that declares them and
  are **not inherited by child segments** — so the root card covered `/` and
  nothing else, while all five new routes still announced
  `twitter:card: summary_large_image` from the layout. A declared large-image
  card with no image renders as a bare text link on WhatsApp, Slack, LinkedIn
  and X, and fails Twitter's validator.

  Fixed with `lib/og-card.tsx` plus `opengraph-image`/`twitter-image` routes
  under `services/` and `services/[slug]/`, generating a per-service card from
  the same content module the page reads. Verified in the prerendered HTML for
  all five routes, and a test now fetches every declared image on every route —
  homepage included — and asserts a 200 with an `image/*` content type. A
  declared image that 404s is the same failure with extra steps.

  **The root card was deliberately left untouched.** Its two-tone gradient
  headline is a bespoke composition, and refactoring a working edge-rendered
  image to share code risks silently changing the card the homepage has already
  been shared with. What the two must not disagree on is brand, so the palette
  values are exported as constants; the layouts are allowed to differ.

- **First attempt did not build.** `generateStaticParams` on the `[slug]` image
  route failed with *"Edge runtime is not supported with
  `generateStaticParams`."* Dropping the enumeration and keeping edge matches
  how the root card already behaves (`ƒ /opengraph-image`), so both cards work
  the same way rather than one being a special case. The cost — a generic `alt`
  instead of a per-service one — is recorded in the file rather than glossed.

### Measured — and it reframes A2

The new routes had no baseline, so all three were measured in **one batch**
(desktop, median of 5, warm-up discarded), which is what makes them comparable:

| Route | Perf | TBT |
|---|---|---|
| `/` | 59 | 1,600 ms |
| `/services` | 96 | 30 ms |
| `/services/whatsapp-automation` | **97** | **10 ms** |

**A page in the identical visual language scores 97 while the homepage scores
59.** That exonerates everything the routes share — tokens, fonts, glass and
gradient treatments, `framer-motion`, `gsap`, Lenis, the cursor, and
`DeferredAtmosphere`, which mounts from the root layout on every route including
the ones scoring 97.

A2 was posed as *"does the cinematic identity survive its measured cost"*, with
the implied lever being how much identity to surrender. **That framing was
wrong.** The brand language is not the cost; the homepage's specific decorative
composition is. The decision becomes "which components", not "how much brand" —
and unlike D17's isolation arms, which could not be trusted, this is a
like-for-like comparison of two whole pages built the same way.

`/` at 59 against yesterday's 65 is **not** a regression: nothing this phase
touches the homepage render path, the documented TBT spread here is
270–6,049 ms, and the batch ran straight after a 5-minute Playwright suite.
Absolute figures are load-depressed; the within-batch comparison is the valid
one, which is why `/` was re-measured alongside rather than quoted.

### Also fixed, found by looking at the render

- **Two controls with the same label went to different places.** The service
  hero's secondary CTA read "How we work" and pointed at `/#faq`, while the
  nav's "How we work" points at `/#product`. Caught by reading a captured
  screenshot rather than by any test — worth noting, because no assertion in
  the suite would ever have flagged it.

- **The signature bracket motif now frames the service hero**, reusing
  `signature/Brackets` rather than re-drawing it. `SHEETFLOW_VISUAL_DNA` §10.2
  reserves it for regions meant to read as a *frame*, which is what a service
  page's opening statement is. Verified visually at desktop, tablet and mobile
  via `npm run shots`.

### Audited

- **Environment, every row verified by running the command.** Node 24.13.0, npm
  11.6.2, Claude Code 2.1.220, Vercel CLI 58.7.0 authenticated as
  `sheetflow51-prog`. **Docker is not installed.** `gh` still unauthenticated.

- **Two connector changes since 2026-08-06**, which is why the check is re-run
  rather than copied forward: **Vercel now connects** (was 403 — the account
  mismatch behind D3 appears resolved at the connector layer), and **Calendly
  now needs authentication** (was working, and was the connector that verified
  the booking URL is real — so the site's primary conversion path can no longer
  be re-verified programmatically).

- **Claude Skills: 7 installed, all active, all byte-identical to their MIT
  source repo** (`nextlevelbuilder/ui-ux-pro-max-skill` @ `14ddef5`). No drift,
  nothing obsolete, nothing to activate. Two have been used on this project;
  five are deliberately idle because the visual language is frozen.

- **10 requested MCP packages confirmed to exist on npm**, versions read from
  the registry rather than assumed. **None installed** — see D21.

### Added

- **`OPEN_SOURCE_MANIFEST.md`** — every third-party implementation the project
  reuses, every one it declined and why, and the custom code written instead
  with the alternative that was considered for each. It records the
  uncomfortable part plainly: the GitHub search step of the open-source-first
  order **has never been performed on this project**, because `gh` is
  unauthenticated. "We reused nothing and here is why" is only credible if the
  search actually happened.

### Decided

- **D21 — no MCP server is added while the folder is untrusted.** All six
  already declared in `.mcp.json` are inert; adding eight more would grow a
  config file of things that do not run.

## Phase G — Content architecture (2026-08-07)

The site stopped being one route. Build green at **15 routes**, suite at **132
tests** (was 74), bundle **334.0 kB gzip JS** against a 360 kB budget.

### Added

- **`/services` and `/services/[slug]` × 4** — Lead Capture, WhatsApp
  Automation, Appointment Booking, CRM Automation. Statically generated via
  `generateStaticParams`, with `dynamicParams = false` so an unknown slug 404s
  instead of rendering an empty shell at request time.

  This is the fix for the one GEO gap the previous phase could name but not
  close: *"topical authority is thin because the site is one page… no amount of
  schema substitutes for pages that cover a topic."* Each page is a real topic
  cluster — its own `Service` node, its own three Q&A, internal links to its
  siblings and back up.

- **`content/services.ts`** — one typed source feeding the pages, the entity
  graph, the sitemap and `/llms.txt`. Four copies of the same facts would drift;
  one cannot.

- **`BreadcrumbList`, finally legitimate.** `Home › Services › <Service>` on the
  five new routes. Still absent from the homepage, which has no ancestors — and
  a test asserts that absence so it stays a decision rather than an oversight.
  Every crumb target is fetched in-test and must return 200; a trail naming a
  URL nobody built is worse than no trail.

- **`/llms.txt` now names the sub-pages**, each with its URL, description and
  questions, and tells a retriever to cite the specific page over the homepage.

- **58 tests.** Per-page graph shape, breadcrumb order and resolvability,
  per-page canonicals, visible-trail/markup parity, FAQ parity, single-`h1` and
  heading order, sitemap and `/llms.txt` coverage, axe on the new routes in both
  motion paths.

- **Two content-governance assertions** (D20). Every service page's
  `name`/`serviceType` must match its `Offer` in the catalogue, and every
  integration it names must already appear in the published integrations answer.
  D1 put fabricated *customer proof* beyond expression in the type system; prose
  is the hole that leaves. A new tool name is valid TypeScript and reads as a
  copy edit — on the pages most likely to be quoted verbatim.

### Fixed

- **Every nav and footer link broke off the homepage.** They were bare
  fragments (`#faq`), which resolve against *the current page* — so from
  `/services/...` the entire navigation pointed at sections that route does not
  contain. Now root-relative (`/#faq`); on the homepage the browser still treats
  that as a same-document fragment, so scroll behaviour there is unchanged.
  Latent for as long as the site had one route, and invisible until it did not.

- **The footer sent four different service labels to one `#workflows` anchor.**
  They now point at the four real pages.

- **Step numerals failed AA contrast** (WCAG 1.4.3), in a component written this
  phase. `accent-bright/70` composited on void computes to **4.27:1**, under the
  4.5:1 floor. The ratios were computed rather than guessed — `/80` is 5.33:1 —
  and `/80` was chosen because `.kicker` already uses it, so no one-off value
  entered the design system.

### Changed

- **The entity graph moved out of `layout.tsx`** into `lib/structured-data.ts`,
  with a builder per route (**D18**). Emitting it from the layout was correct
  for a one-route site and would have been actively wrong with a second: every
  sub-page would have carried `@id: <site>/#webpage`, asserting that it *is* the
  homepage, plus the homepage's FAQ. The "exactly one JSON-LD block per page"
  rule is unchanged and is now asserted on every route.

- **`sitemap.ts` generates from the content module** rather than a hand-written
  list. A sitemap maintained separately from the routes goes stale.

### Corrected

- **The MCP servers were never going to become usable "next session".** The
  previous manifest said they would and that nothing further was required. Two
  sessions later all six still report `⏸ Pending approval`. The gate is folder
  trust — `hasTrustDialogAccepted: false` in `~/.claude.json` — not session
  timing. `enabledMcpjsonServers` was added to `.claude/settings.local.json` and
  verified **insufficient on its own**. The trust flag was deliberately not
  flipped programmatically; it exists for a human to answer.

  The transferable lesson, recorded in AI_RUNTIME_MEMORY: a plausible
  explanation that *predicts an outcome* is worth checking against that outcome.
  "MCP attaches at session start" is true, and was still the wrong diagnosis.

- **The `probe-cls.mjs` save conflict.** The buffer held 59 prepended blank
  lines and LF endings; after normalising it was byte-identical to disk
  (`sha256 f135f3b6…`), so nothing semantic lived only in the editor. A residue
  outlived the discard — the file returned as LF under `core.autocrlf=true`,
  leaving `git status` reporting ` M` while `git diff HEAD` was empty. That
  combination is the signature of an EOL mismatch, not a content change;
  `git ls-files --eol` names it, and `git checkout --` restored the canonical
  CRLF form.

## Phase F — Product completion pass (2026-08-07)

### Fixed

- **The hero video ignored `prefers-reduced-motion`.** `globals.css` neutralises
  CSS animation and transition under that query, which does nothing to a
  `<video autoPlay loop>` — so a looping clip kept running for exactly the
  visitors who asked motion to stop. That is WCAG 2.2.2 (moving content over
  five seconds with no mechanism to pause). `runMotion` already existed in the
  component and had simply never been wired to the element. The poster still
  renders, so the composition is unchanged. **This was the one motion layer
  missed when every other one was audited.**

- **The hero's AI core terminated in a visible seam.** It was clipped to a
  `rounded-[36px]` container, and at 1440px the vignette above it never reached
  those edges — so the ambient glow ended in a hard rectangle across the
  headline. Replaced the clip with a radial mask; the core now dissolves into
  the void, which was the intent.

- **Ungrammatical H2.** "Six pillars of automation. One quietly run business."
  → "One quietly running business."

### Added

- **`scripts/capture-screens.mjs`** (`npm run shots`) — deterministic
  screenshots at desktop / tablet / mobile. Scrolls the page first so every
  IntersectionObserver reveal has fired, then freezes animation, so captures are
  diffable rather than catching elements mid-fade.

  It uses **real device descriptors**, not bare viewport sizes. The first
  version narrowed a desktop Chromium to 390px, which reports `pointer: fine` —
  so `CustomCursor` mounted and parked a ring over the copy. That read as a
  rendering bug in the site and was a bug in the script.

- **GEO signals on `Organization`** — `contactPoint` (sales, reachable phone,
  booking URL) and `knowsAbout` (9 expertise entities, each mapped to a service
  actually sold). `knowsAbout` is read directly by assistants deciding whether
  this entity answers a query, rather than inferred from prose.

- **`PROJECT_HEALTH.md`** — single-snapshot dashboard, regenerated per phase.

- **4 tests** asserting the new GEO signals, and asserting that `LocalBusiness`
  is *not* claimed without an address.

### Refused, deliberately

- **`LocalBusiness` schema.** Requested, but that type requires a
  `PostalAddress` and SheetFlow publishes no address or locality anywhere.
  Inventing one would be fabricated business information — barred by this
  project's first standing rule and by Google's structured-data policy.
  `Organization` is the accurate type for a remote service business. A test now
  asserts the absence so a future "add LocalBusiness for local SEO" change has
  to confront the reason.

- **`BreadcrumbList`.** Still N/A: one route means a one-item breadcrumb, which
  is schema spam. It becomes correct the moment service sub-pages ship.

### Verified and already correct

- **Anchor targets clear the fixed nav.** No `scroll-margin-top` is declared
  anywhere, which normally means anchors land under a fixed header. All six nav
  anchors measured: every one lands at 182px against a 64px nav, because
  sections carry their own top padding. No change made.

Verified: 74 tests pass, type-check and lint clean, all bundle budgets met.

## Phase E — Retraction, and the instrument that earned it (2026-08-07)

### Retracted

**Phase D's headline finding was wrong.** It reported 1,232 ms of steady-state
blocking against 0 ms under reduced motion, and concluded the decorative motion
system caused *100% of steady-state blocking*. Both numbers were instrument
artifacts. Two defects, found by trying to act on the finding:

- **A mount race.** `DeferredAtmosphere` mounts on `load` then
  `requestIdleCallback(..., {timeout: 3000})`. Both profilers used a hard-coded
  3,000 ms load/steady boundary — the same instant — so the measurement window
  opened exactly when the subject appeared. The metric was **bimodal** (~370 ms
  and ~1,300 ms, almost nothing between), and medians reported whichever mode an
  arm happened to draw. The same arm scored **−64% and −2% on identical code**.

- **Observer effect.** Sampling at 100 µs is 10,000 samples/second, and that
  overhead lands inside the tasks being timed. Changing *only* the interval to
  Chrome's 1,000 µs default moved steady-state blocking from **1,182 ms to
  555 ms**. Load phase barely moved (488 → 489) — per-task overhead inflates many
  small tasks, not a few large ones. At one point the sampler reported more
  blocking time than there was total task time, which is impossible.

An intermediate conclusion — "the `ambient-breathe` scale animation is 64% of
the cost" — is retracted for the same reason.

### Added

- **`scripts/trace-paint.mjs`** (`npm run trace`, `npm run trace:all`) — splits
  main-thread time into paint & composite / script / style recalc / layout using
  CDP `Performance.getMetrics`. These are **cumulative counters, not samples**,
  so they carry no observer effect. Waits for the atmosphere to mount before
  timing steady state, which is what removes the race.

### Measured — corrected

Steady state, 4 s idle, atmosphere confirmed mounted, median of 7–9:

| Arm | Total main-thread task | Paint & composite |
|---|---|---|
| Motion on | 374 ms | 272 ms (73%) |
| Reduced motion (no atmosphere) | 246 ms | 224 ms (91%) |

**Paint and compositing are 73–91% of steady state and 76% of load phase** —
this is the finding that survives, and the one that matters. It is a within-run
decomposition, immune to both defects. JavaScript is the minority cost, which is
why three phases of JS optimisation never moved the number.

The atmosphere costs **~128 ms per 4 s (~9% duty cycle)**, not ~40%. The page
spends 246 ms per 4 s with no atmosphere at all.

Load-phase blocking, 1,000 µs sampling, median of 9: **488 ms** motion on
(spread 270–6,049) vs **124 ms** reduced motion (spread 32–599).

### Resolved

- **D17 — closed in the negative.** There is no single expensive effect. Every
  isolating arm measured *higher* than baseline (`no-ambient-anim` +10%,
  `no-breathe` +11%, `breathe-on-children` +17%, `no-particles` +24%), which is
  impossible if any were removing real work — invalidating all of them,
  including the one that had confirmed the hypothesis. The blend-mode theory is
  **unsupported**: `no-blend` moved nothing.

- **A2 — now answerable, recommendation is to do nothing.** The cost is diffuse
  and structural: a dark page with several large translucent gradient layers is
  expensive to composite whether or not it animates. A 9% steady-state duty
  cycle does not justify weakening the visual signature, and load-phase blocking
  is better attacked through hydration cost, which has no design consequence.

### Fixed

- **The Playwright timeout was wrong project-wide, not per-spec.** Phase D
  raised it to 90 s for `a11y.spec.ts`; `seo.spec.ts` then timed out next —
  "FAQ markup matches the rendered answers exactly", which passes in 8.0 s
  standalone. Every spec here navigates to a page that is ~75% paint and waits
  for it to settle, and two device projects run in parallel. Moved to a global
  `timeout: 90_000` in `playwright.config.ts` and removed the per-spec override,
  since the default is wrong for the project rather than for one file.

### Changed

- Profiler default sampling interval 100 µs → **1,000 µs**, with a printed
  warning when lowered. 100 µs remains correct for module attribution; its
  blocking figures must be ignored.
- Both profilers split phases on the **observed mount time**, not a fixed 3,000 ms.
- Both launch Chromium with renderer backgrounding and occlusion detection
  disabled.

## Phase D — Toolchain and performance attribution (2026-08-06)

### Added

- **`scripts/profile-main-thread.mjs`** — main-thread CPU profile attributed to
  source modules. Samples V8 through CDP and resolves every call frame back
  through the chunk's source map, so blocking time lands on `framer-motion` or
  `AIDashboard.tsx` rather than on `060wcmibf9..8.js`. Decodes Base64-VLQ in
  ~40 lines rather than taking a dependency, matching the reasoning that keeps
  `chrome-launcher` out of `audit-lighthouse.mjs`.

  Reports a **median of N with its spread** and discards a warm-up, because a
  single run of this page produced 609 ms and 1,071 ms on an unchanged build.

  Splits **load phase** from **steady state**. Lighthouse's TBT stops at
  interactive, so a profile that keeps sampling mixes one-off hydration with
  whatever the page burns forever. They have opposite fixes.

  `PROFILE_EXPERIMENT=` injects CSS before first paint to price a suspected
  cost without editing a component. `PROFILE_REDUCED_MOTION=true` turns the
  entire animation system off in the identical build, since every decorative
  layer already gates on that query.

- **Six MCP servers**, declared in `.mcp.json` at project scope so the
  toolchain is reviewable in git (D14). Each verified with a real `initialize`
  + `tools/list` handshake, not just written to config: `chrome-devtools`
  (1.6.0, 29 tools), `context7` (3.2.5), `sequential-thinking`, `playwright`
  (1.63.0-alpha, 24 tools), `filesystem`, and the remote `github` server.

- **`DECISIONS.md`** — consolidated decision register. Decisions were scattered
  across `PROJECT_STATUS.md` and `brand-os/07_governance/`.

- **`npm run build:profile` / `profile` / `profile:mobile`**.

### Measured — TBT attributed for the first time

Median of 9, production build, source-mapped:

| Arm | Load-phase blocking | Steady state (3 s idle) |
|---|---|---|
| Motion on (ships today) | 453 ms (spread 233–843) | 1,232 ms (spread 0–3,428) |
| Reduced motion | 166 ms (spread 142–596) | **0 ms (spread 0–0)** |

The decorative motion system is **~63% of TBT and 100% of steady-state
blocking**. `(program)` — paint, layout, compositing — is **~65% of the main
thread**; JavaScript is the minority cost, which is why three previous phases
that optimised JavaScript did not move the number.

`ParticleField` no longer appears in the top 20, confirming the earlier
spatial-grid rewrite worked. Remaining JS: `next` 138 ms, `framer-motion`
90 ms, turbopack runtime 77 ms, `gsap` 37 ms, `AIDashboard.tsx` 29 ms.

Load-phase blocking measured 453–603 ms across passes against Lighthouse's
610 ms TBT, confirming the instrument measures the same phenomenon.

### Not concluded — deliberately

Four narrower experiments (`no-blend`, `no-sheen`, `no-ambient-anim`,
`no-backdrop-blur`) **could not be separated above the noise floor**. Spreads
overlapped entirely and `no-ambient-anim` scored worse than baseline, which is
physically impossible. **No claim is made about which effect is responsible**
(D17). The `mix-blend-mode: screen` sheen and `plus-lighter` cursor glow remain
suspects on theory only. Confirming needs a paint-level trace, which a CPU
profiler cannot produce.

### Fixed

- **`.gitignore` silently shadowed `.env.example`** (D13). `vercel link`
  appended `.env*` to the repository root, four lines below a comment warning
  against exactly that broadening. The tracked file survived only because it
  was already in the index; a fresh clone adding one would have lost it.
  Added `!.env.example` / `!**/.env.example`, verified by untracking and
  confirming `git status` still lists it.

- **Accessibility tests were a gate that only passed on a quiet machine.**
  13–15 s standalone, 28–38 s under full-suite load, against Playwright's 30 s
  default — five tests timed out in `npm run verify` and read as an
  accessibility regression that did not exist. Raised to 90 s for that spec
  only, so a real hang elsewhere still fails fast. axe walks the full DOM twice
  per assertion across two device profiles while the page repaints
  continuously; the scan is genuinely slow, not stuck.

### Corrected

- **The manifest claimed GitHub was available for "repo ops, PRs". It is not.**
  `gh` 2.96.0 is installed but unauthenticated (`gh auth status`: "You are not
  logged into any GitHub hosts"). `git push` works because the credential
  helper holds a token that `gh` cannot see. GitHub repository research was
  therefore **not performed** this session — it is blocked pending
  `gh auth login`.

- `@modelcontextprotocol/server-github` was **not** installed: npm marks it
  `Package no longer supported`.

### Changed

- `productionBrowserSourceMaps` is gated on `PROFILE_SOURCEMAPS` (D16). Shipped
  builds are unchanged — maps add a `sourceMappingURL` comment and sibling
  files, the JS is byte-identical, and browsers do not fetch maps unless
  devtools is open.

## Phase C - Answer-Engine Optimization (2026-08-06)

### Added

- **FAQ section** — eight questions, every answer grounded in something the
  site already states (the six services, the named integrations, the published
  five-step process, the free-audit offer). No pricing, no timelines, no
  outcomes, no certifications: none of those are established, and an
  unverifiable answer here is the first thing an engine quotes.
- **FAQPage JSON-LD**, generated from the same `content/faq.ts` array the
  section renders. Google treats FAQ markup that does not appear on the page as
  spam; one source makes divergence impossible, and a test asserts it.
- **`/llms.txt`** — a plain-text brief for language models, generated from the
  same source. Includes explicit citation guidance stating that SheetFlow
  publishes no customer names, metrics or certifications, so a model asked
  about results answers "not published" rather than inferring.
- **Consolidated entity graph.** Organization, WebSite, WebPage and FAQPage now
  emit as one linked `@graph` with resolvable `@id` references, replacing two
  unlinked blocks.
- **`robots.txt` names AI crawlers explicitly** — GPTBot, ClaudeBot,
  PerplexityBot, Google-Extended, Applebot-Extended and others. Access is
  unchanged (the wildcard already allowed them); naming them makes any future
  restriction a visible edit rather than a side effect.
- **12 new tests** covering graph parseability, `@id` resolution, markup/copy
  parity, answer presence without interaction, per-answer anchors, keyboard
  disclosure, and the three machine-readable surfaces.

### Fixed (found by the new tests)

- `<dt>` was nested inside `<summary>`, which is invalid — a `<dl>` requires
  `<dt>`/`<dd>` as direct children. Two serious axe violations. Rebuilt on
  headings inside `<details>`, which is valid, adds the questions to the
  document outline, and keeps answers in the DOM without JavaScript.
- Two FAQ anchors (`integrations`, `how-it-works`) collided with existing
  section ids. Duplicate ids are invalid HTML and break anchor navigation.
  All FAQ ids are now namespaced `faq-*`.

### Infrastructure

**Deployment was broken and is now fixed.** The first `vercel deploy` failed at
`npm install`, before any build ran: plain `npm install` exits 1 because
`@react-three/drei@9` declares a peer of `@react-three/fiber@^8` while the
project pins `^9`. Reproduced locally with `npm install --dry-run`. Added
`.npmrc` with `legacy-peer-deps=true`, making explicit the resolution every
local install has used since before M00.

This is a workaround. The six packages involved exist only for
`src/components/three/`, which no rendered code imports — dead dependencies
were blocking deployment of live code. Founder decision A1.

**First preview deployment created:**
`sheetflow-ai-website-kmquksq6e-sheetflow51-progs-projects.vercel.app`
(status Ready). It sits behind Vercel SSO Deployment Protection, so it returns
302 to `vercel.com/sso-api` for anonymous requests and requires a logged-in
Vercel session to view.

Vercel access resolved via CLI (58.7.0, authenticated as `sheetflow51-prog`).
The MCP connector still returns 403 — it is authenticated to a different
account. Documented in `TOOLING_MANIFEST.md`.

## Phase B - Layout Stability and Measurement Rigour (2026-08-06)

### Fixed

- **Cumulative Layout Shift eliminated: 0.079 -> 0.000.** The boot flourish
  animated `top` from 50% to 0% to 100%, driving a layout on every frame. It
  was the site's entire CLS. Now animates `y`, which compiles to a compositor
  transform. Verified with a live `PerformanceObserver`, not just Lighthouse.
- Particle field's connection pass rewritten from an all-pairs O(n²) scan
  (8,385 distance checks per frame) to a uniform spatial grid, and throttled
  from 60fps to 30fps. Squared-distance comparison removes a `sqrt` per
  candidate pair.
- The decorative layer — particles, aurora, cursor, grain, scroll rail, boot
  flourish, dormant audio engine — moved off the critical path into
  `DeferredAtmosphere`. It mounts after `load` and idle, is excluded from the
  server payload, and is never downloaded at all under `prefers-reduced-motion`.

### Measurement

The harness was producing numbers that could not be trusted. Five consecutive
runs of an *unchanged* build reported Total Blocking Times of 11,121 / 586 /
655 / 538 / 701 ms; one contended sample read as a catastrophic regression and
was noise.

`npm run audit:lh` now discards a warm-up pass, launches a cold browser per
run, and reports the median of N. `LH_PRESET=mobile` adds the 4x-CPU / slow-4G
profile. Added `scripts/probe-cls.mjs` for layout-shift attribution, which
found the `top` keyframe that Lighthouse could not attribute.

### Honest result

Measured against the previous commit with identical methodology (median of 5):

| Metric | Before | After |
|---|---|---|
| CLS | 0.079 | **0.000** |
| Performance | 62 | 60-63 |
| Total Blocking Time | 700 ms | 950 ms |
| LCP | 1.3 s | 1.2-1.3 s |

**CLS is fixed. TBT did not improve.** The O(n²) rewrite and the deferral are
sound engineering — strictly less work, and off the critical path — but neither
was the dominant cost on this hardware, and the run-to-run spread (443-1,223 ms)
exceeds any delta between them. Reported as measured rather than as intended.

An interim revision made TBT genuinely worse by mounting the deferred layer in
a `requestIdleCallback`, which fires inside the window TBT measures. Corrected
to gate on `load` first.

## Phase A - Verification Harness (2026-08-06)

The project had no test infrastructure of any kind, and none of the mandated
quality gates could run. Built the harness first, then measured.

### Added

- Playwright 1.62 against the **production** build, desktop + mobile.
  50 tests: smoke, heading order, metadata, in-page anchor integrity,
  external-link safety, brand-asset serving, DEC-302 compliance, a
  fabricated-content guard, axe WCAG 2.1 AA (default *and* reduced-motion),
  focus indicators, image alt text, 5-viewport overflow, tap-target sizing.
- `scripts/audit-lighthouse.mjs` — reuses Playwright's Chromium over CDP
  instead of adding a second browser download.
- `scripts/audit-bundle.mjs` — gzip-accurate budgets that fail the build.
- `@next/bundle-analyzer`, which `npm run analyze` had always referenced but
  which was never installed; the script silently no-opped.
- `AI_RUNTIME_MEMORY.md` and `TOOLING_MANIFEST.md`.
- `npm run verify` — preflight + e2e + bundle.

### Fixed (found by the new gates)

- **Accessibility 100.** `ink.400` was `#6B7490`, measuring 4.26:1 on void —
  under the AA floor — and axe flagged it across nav, section captions and
  footer. Retuned to `#717B98` (4.81:1 on void, 4.70:1 on glass), fixing all
  21 usages at the token.
- Primary button was white on `#3B82F6` = 3.68:1, and its hover *lightened* to
  `#60A5FA` = 2.54:1 — the state a user is most likely reading was the least
  legible. Base moved to `accent-deep` (5.17:1); hover now lifts and brightens
  the glow instead of the fill.
- Footer links were 16px tall, under WCAG 2.2 SC 2.5.8's 24px pointer-target
  floor.
- Footer group headings were `h4` directly under the section `h2`, skipping a
  level and breaking screen-reader outline navigation.

### Baseline (first ever measured)

Lighthouse desktop: **performance 65, accessibility 100, best-practices 96,
SEO 100**. FCP 0.4s, LCP 1.4s, TBT 490ms, CLS 0.103, SI 3.0s.
Bundle: 321.3 kB JS gzip (1024 kB raw, 16 files), 9.6 kB CSS.

### Found, not acted on

- `src/components/three/` is imported by nothing and the bundle contains zero
  Three.js symbols. Six dependencies exist solely for it, and they are what
  forces `--legacy-peer-deps` on every install. Retiring them retires the
  planned Spline direction — an architectural decision, escalated not taken.

## M01 - Production Foundation (in progress)

Branch `feat/m01-foundation`, cut from `feat/m00-foundation` at `66f5059`.

### Proof architecture — resolves D1

- Added `src/config/features.ts`: env-backed flags for `caseStudies`,
  `testimonials`, `trustLogos`, `results`. All default to `false`.
- Added `src/content/proof.ts`: the single source of truth for customer-facing
  claims. Entries are a discriminated union on `status`; only `'verified'`
  entries carry claim fields, so an unverified metric has nowhere to be typed.
  The `published*()` selectors are the only surface the UI reads.
- Added `src/components/ui/ProofPlaceholder.tsx`.
- Removed every fabricated trust signal: the six invented trust-strip names and
  the three invented case studies with their invented metrics and quotes.
- Relabelled the AIDashboard mock from "Live / Updated 2s ago" to
  "Product preview / Sample data".

### Design system

- Ran the `TOKENS.md` drift check for the first time. `brand-os/tokens.ts` was
  the stale file: it still held the pre-rebrand indigo/violet palette while the
  site had moved to the logo's blue + gold under `0920b03`. Corrected the
  source-of-truth files to the shipped values.
- Added a correctly named `gold` scale and the missing `cyan` scale. `violet`
  retained as a deprecated alias so all 34 existing usages keep resolving.

### Accessibility

- Raised the new proof components' small-label contrast from 4.26:1 to 8.31:1.

### Commits

| Hash | Description |
|---|---|
| `a197efc` | `feat(m01): proof architecture with verification enforced in the type system` |
| `44440e6` | `fix(design-system): reconcile brand-os tokens with the shipped palette` |
| `e5cbb3b` | `fix(a11y): raise label contrast to AA in the new proof components` |

### Verification

- `npm run type-check` — exit 0
- `npm run lint` — exit 0 (9 pre-existing warnings, none introduced)
- `npm run build` — exit 0, 8/8 routes
- Bundle: 1,048,349 bytes across 13 client chunks (321 kB gzipped) — unchanged
  from the M00 baseline
- Build output confirmed free of every removed name

### Deliberately not done

- The four founder-named engagements (R3S Realty, Saraswati Dental, Sparc
  Physiotherapy, Elevate WPC) were not published. They could not be
  corroborated anywhere in this repository or the surrounding workspace, and
  are held as `pending` entries carrying no claims.
- No client logo assets were generated. Generating one for an unverified
  company would convert a text placeholder into a forged endorsement.
- The 34 `violet-*` usages were not migrated to `gold-*`.
- 14 pre-existing `ink-400` small-text call sites still measure below AA.

## M00 - Foundation
- Created backup branch
- Created feature branch
- Repository inventory completed
- Repository structure reviewed
- Execution contract adopted (external governance)
- Archived 11 reference folders into `Documentation/Archive/` (118 files, all renames, no content change)
- Added `Documentation/Approved/` as a pointer to external CoWork governance
- Added root `.gitignore` and `CHANGELOG.md`
- Repaired 30 broken link targets in `MASTER_INDEX.md`
- Repaired the build so `npm run build` passes with no manual flags

### Commits

| Hash | Description |
|---|---|
| `5e8ef5d` | `fix(hero): raise headline legibility over background video` |
| `5b3b8ba` | `chore(m00): archive reference material, repair index links and build` |

Tagged: `v2-m00-foundation`

### Verification at close of M00

- `npm run type-check` — exit 0
- `npm run lint` — exit 0 (9 pre-existing warnings, none introduced)
- `npm run build` — exit 0, 19.8s, 8/8 routes, default Turbopack path

### Deliberately not done in M00

- `10_Final_Website/` was not relocated, to preserve the Vercel root directory setting
- `.eslintrc.json` retained pending the tooling milestone
- Deployment reconciliation deferred by founder instruction
- Fabricated marketing claims remain unresolved and still live in production
