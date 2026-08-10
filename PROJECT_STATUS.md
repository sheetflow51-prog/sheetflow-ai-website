# SheetFlow V2

## Current Milestone

M01 · **Release Candidate 2 — Visual Polish & Launch Candidate**

## Current Status

**RC2 is complete and running locally. Awaiting founder decisions to ship.**

RC2 was a visual polish pass on finished engineering — no architecture changes,
no section rebuilds, and **no client JavaScript**, because the phase opened with
9.1 kB of headroom against a 360 kB budget.

It fixed the site's largest visual defect. Five of the ten cards on `/work` are
internal builds with no deployment to screenshot; their 16:10 media area was
**~90 % empty**, so half the portfolio grid read as broken cards beside five
finished ones — the inverse of the truth, since those five are the largest
engineering on the site. The same five case-study pages opened with no visual
anchor at all.

**The fix was already in the repository.** `WorkflowGlyph` draws each build's
pipeline from `architecture[].stage` — data already published, already reviewed,
and already rendered in prose directly below the diagram — so RC2 introduced no
new claim about any build. Two tests keep it that way: every published stage
must have an icon keyed by exact string, and every compact label must be a
literal word of the stage it shortens.

It also found a **reduced-motion bug**: the global rule collapses
`animation-duration` but not `animation-delay`, holding the last element of a
staggered animation invisible for up to 440 ms for a visitor who asked for less
motion. Fixed for the glyph, deliberately not fixed globally.

Verified at **416 tests — 406 passed, 10 skipped, 0 failed**, axe **0 violations
across 12** route/motion combinations, build green at 37 routes, JS **351.0 kB**
gzip and CSS **11.6 kB**, both inside budget. Screenshot matrix re-captured at
70 images from a build whose `BUILD_ID` was matched against the served HTML
first.

Deliverables: `docs/RC2_VISUAL_AUDIT.md` (written before any RC2 code),
`docs/RC2_SUMMARY.md`, `docs/MOTION_INVENTORY.md`, `LAUNCH_CHECKLIST.md`.

Everything below this line is the RC1 record, retained for context.

---

**RC1 was complete and running locally.**

RC1 was a release pass, not a feature phase: no new pages, no new components.
It found **three real defects**, and the common thread is that none of them was
visible in source. Each needed the site rendered, at a width nobody had looked
at.

1. **Every card on `/work` was clipped on every phone** — and had been for four
   phases. A `truncate` file path (`white-space: nowrap`, 317 px min-content)
   propagated through a grid item's default `min-width: auto` and pinned all ten
   cards to 431 px. On a 360 px phone that is **119 px of overflow**. An
   ancestor's `overflow-x: clip` swallowed it, so no scrollbar ever appeared.
2. **The navigation broke between 768 px and 1024 px** — six links plus a CTA in
   a space that cannot hold them, wrapping the header to roughly double height
   on an iPad.
3. **A latent scroll-lock bug**, surfaced by fixing (2): with the menu open,
   crossing the breakpoint hides the overlay but leaves `body { overflow:
   hidden }` — an unscrollable page with nothing to click. Rotating a tablet now
   triggers it.

All three are fixed, and the two that can regress silently are **asserted by
test**.

**A fourth finding was about process, not code.** The first screenshot matrix —
66 images — was captured from a **stale build**: `next start` was serving a
`.next` that predated a correction already made in source. It was caught by
reading a byte count off a screenshot.

Build is green at **37 routes**, bundle **350.9 kB gzip JS** within a 360 kB
budget, and the full suite is green.

What remains is unchanged and is not engineering: a domain nobody has bought
(B2), a branch nobody has reconciled (D2), a deployment nobody has approved, and
three credentials only the founder can rotate. All of it is in `BLOCKERS.md`.

**B2 turns out to be cheaper than recorded.** `NEXT_PUBLIC_SITE_URL` is unset
locally, so every consumer falls back to `https://sheetflow.ai` — the canonical
host is **already correct in code**. B2 is a purchase, a DNS attachment, and one
environment variable, with no code change at all.

Production deployment has **not** been performed and awaits explicit approval.

## Release Candidate 1 — readiness audit

Every RC1 item, classified before any code was written this session. Only
**READY** and **PARTIAL** items were worked on.

| Item | State | Evidence / why |
|---|---|---|
| Build | **READY** | Green, 37 routes, rebuilt this session |
| Typecheck | **READY** | Clean |
| Lint | **READY** | 0 errors, 8 warnings, all in `components/three/` (A1 may delete the directory) |
| Bundle budgets | **READY** | 350.8 kB gzip JS / 360 kB; CSS 10.7 / 40 kB |
| Playwright suite | **READY** | Re-run this session after the content reorder |
| Accessibility | **READY** | axe 0 violations, 11 route/motion combinations |
| SEO surface | **READY** | Sitemap 21 URLs, robots, canonicals, OG/Twitter, JSON-LD, breadcrumbs — all verified against the running build |
| Case-study correctness | **READY** | All 10 audited: 3 client emit `about`, 2 demo emit `url`+`image` and **no** `about`, 5 internal emit none. Zero `Review`/`AggregateRating` |
| Booking flow | **READY** | Exercised end to end: native validation blocks empty submit, prefill and UTM verified on the composed Calendly URL |
| Pricing | **READY** | `minPrice` floor, `UnitPriceSpecification` monthly, no price node for Bespoke, 7 FAQs, keyboard-reachable comparison table |
| `/work` grid order | **PARTIAL → fixed** | Demonstrations rendered last, stranding 2 image cards below 5 text tiles and contradicting the page's own lede. Reordered and asserted by test |
| Served build freshness | **FAILED → fixed** | The server was serving a **pre-correction build** — a byte count corrected in source still rendered its old value. Stopped by PID, rebuilt |
| Capture fidelity | **PARTIAL → fixed** | The custom cursor was being captured mid-viewport, occluding a spec-table label. Hidden during capture |
| Screenshot matrix | **READY** | 10 routes × 5 breakpoints in `10_Final_Website/release-preview/` |
| Lighthouse | **READY** | Re-measured this session |
| **Remote preview URL** | **BLOCKED** | Vercel MCP cannot reach the founder's org even with an explicit `teamId` (D3). Deploying is founder-gated. **Local preview is the deliverable** |
| **`sheetflow.ai` attached** | **BLOCKED** | B2 — 0 domains. Founder purchase/DNS |
| **Branch reconciliation** | **BLOCKED** | D2 — 13 ahead / 1 behind, no fast-forward |
| **Credential rotation** | **BLOCKED** | 3 credentials, founder-only |
| GitHub MCP | **BLOCKED** | OAuth capability mismatch; non-interactive session cannot complete it |
| Context7 / Magic / 21st.dev / chrome-devtools MCP | **N/A** | Not exposed to this session, or nothing to apply them to. See `docs/MCP_EXECUTION_REPORT.md` §13 |

## Completed Tasks

M01 phase 1 — proof architecture, design-token reconciliation, accessibility.

M01 phase 2 — toolchain build-out and the first real performance attribution.
TBT attributed to paint rather than JavaScript for the first time.

M01 phase 3 (Phase G) — content architecture. `/services` plus four service
pages as genuine topic clusters.

M01 phase 4 (Phase H) — mobile measured for the first time; the open-source
audit found two registries materially mislabelled.

M01 phase 5 (Phase J) — **nothing shipped, and that was the finding.** The
JavaScript optimisation arm was built, measured at n=9, and rejected as not
significant (Mann-Whitney U = 57.5 against a critical 62).

M01 phase 6 (Phase K) — **the site becomes a business.** `/work` with three
case studies, `/pricing` with real published figures, `/book` with a
qualification step that ships zero third-party JavaScript. **B1 is closed.**

M01 phase 7 (Phase L) — **catalogue parity and return messaging.** The two
catalogued services that had no page now have one; the pricing calculator
gained a break-even line.

M01 phase 8 (Phase M) — **the evidence re-audit.** `docs/EVIDENCE_MATRIX.md`
built before any case study was written. Excel-first repositioning shipped.

M01 phase 9 (Phase Y) — **the final evidence sweep.** Five internal systems
found and published; two Phase M conclusions corrected; two credential
exposures found. `WorkProject` gained the discriminated union Phase M had
identified and deliberately not built.

M01 phase 10 (Phase Z) — **the evidence unlock.** The Netlify coverage gap
closed on a retry; two withheld demonstrations published under a third evidence
variant; the queued CRM dashboard shipped; a flaky accessibility test diagnosed
and fixed; `BLOCKERS.md` consolidated.

M01 phase 11 (**Release Candidate 1**) — **the release pass.** No features.
Three rendered-only defects found and fixed: every `/work` card clipped on every
phone, the navigation broken between 768 and 1024 px, and a scroll lock that
survived its own breakpoint. Two regression tests added, a 10 × 5 screenshot
matrix generated, and the whole published surface re-verified against the
running build.

## Phase Z — what changed

### A 502 became a permanent conclusion, and it should not have

Phase M called the Netlify MCP, received HTTP 502, and recorded Netlify as a
**named coverage gap** — honestly stated, and carried forward unchanged by Phase
Y. Both phases verified the three known URLs individually and noted the account
itself had never been enumerated.

It answered immediately this phase. **The 502 was transient.**

That is the **third time** this repository has turned one failed network request
into a standing conclusion, after Phase M's "the Manus prototype is dead" and
Phase Y's own `ECONNRESET`. The existing rule covered retrying before
concluding; it did not cover this case, so it now reads: **re-test unavailable
capabilities each phase.** "We could not use this tool" is a claim with a shelf
life.

### What the account held

**4 projects, all live**, including **one in no inventory anywhere** —
`radiant-lollipop-6e4d44`, a UGC NET Sociology study site. Assessed and excluded
as not automation work, but recorded rather than unknown.

The finding that changed what ships is subtler. Both clinic demonstrations are
deployed from **SheetFlow's own accounts**, and controlling the deploying
account is **direct evidence of authorship** — precisely what Elevate WPC has
never had, which is why that one is still excluded.

Earlier phases withheld these builds because a `-demo` URL signals a speculative
build rather than a delivered engagement. That is true, and it answers a
different question. **"Did we build it?" and "did anyone commission it?" are two
questions**, and declining to answer the first was not required in order to
answer the second honestly. Withholding verified work understates the portfolio
as surely as overstating it misleads.

### `ProjectEvidence` gained a third variant

`demo` — ours, reachable, **uncommissioned**. A distinct variant rather than a
flag on `live`, because of the JSON-LD: `live` emits `about: Organization`,
which asserts the named business is what the work was *for*. `demo` emits `url`
and `image` and **never `about`**, so there is no reachable code path that names
a client for work nobody commissioned. A test asserts the absence — and asserts
that `url` and `image` survive, because the build is still ours and still
reachable.

The disclosure appears in **three** places: a mandatory `basis` sentence
rendered *above* the screenshot, a "Demonstration" marker on the `/work` card,
and `llms.txt` naming all three kinds with an explicit instruction not to count
demonstrations as customers.

**Client count is unchanged at three.** Everything making a client claim calls
`liveProjects()`, which cannot return a demonstration.

### Shipped this phase

| Case study | Kind | Note |
|---|---|---|
| **Dr. A.K Gupta Dental & Diagnostic Centre** | `demo` | 429 kB single document — **88% is five base64-inlined JPEGs** |
| **Align Dental Care** | `demo` | React 19 / Vite 8 / Tailwind 4; 1,326 lines; clinic facts in one typed module |
| **Saraswati CRM dashboard** | companion surface | Queued since Phase M; the seeded-data note is now **required by the type** |

### Reading the artifact stopped a publication

Krishna Dental was about to ship — the new variant had removed its only stated
disqualifier. Re-reading it rather than reclassifying it on the old note found
**`wa.me/91XXXXXXXXXX`**, an unreplaced placeholder, and **no form at all**.
Publishing it would have advertised a dead contact path on a page carrying a
real clinic's name. **Still excluded, on better grounds** (D33).

The general lesson: when a rule changes, **re-check the artifacts it was
excluding** rather than assuming the new rule admits them.

### The accessibility failure was in the test, not the site

One test failed on the first full run: `[serious] color-contrast` on the
homepage's primary CTA, mobile, under reduced motion.

**The button passes.** White on `#2563EB` is **5.17:1** against a 4.5:1
threshold. Measured directly on the failing profile, the wrapper around it sits
at **opacity 0.583 at exactly the 600 ms mark the harness sampled**, reaching
1.0 by ~1200 ms.

The `settle()` helper zeroed CSS animation and transition durations — but this
reveal is driven by framer-motion through the **Web Animations API**, which a
CSS override does not touch. The freeze never applied to the thing that was
moving, and the fixed 600 ms wait landed mid-fade.

Raising the timeout would have re-tuned the race rather than removed it.
`settle()` now **finishes** every in-flight animation, which is deterministic.
The a11y spec went green and got roughly **3× faster** (6.2 min → 1.9 min), and
a demonstration case study was added to the audited routes because it renders
two new tinted text surfaces.

### A defect in `llms.txt` the growth exposed

Its citation guidance listed every project under *"Client names and their live
sites — published with permission."* That was **already false** for the five
internal builds, which have no client and no permission behind them; the wording
simply predated them. It now lists the three kinds separately, generated from
the evidence discriminant so they cannot drift apart again.

## Phase Y — what the second sweep found

### Five systems nobody had discovered

Every earlier sweep was scoped to OneDrive. These sit outside it, or in a
directory no glob had reached.

| System | Size | Evidence | Now at |
|---|---|---|---|
| **WhatsApp Accounting OS** | 1,739 TS | **21/21 tests pass**, run this session | `/work/whatsapp-accounting-os` |
| **Outbound Lead Engine** | 6,928 PY | 34 modules, IMAP reply detection, Claude scoring | `/work/outbound-lead-engine` |
| **WPC Design Automation** | 2,446 PY | 7 production bundles, 1.4 MB generated gallery | `/work/wpc-design-automation` |
| **AI Voice Receptionist** | 1,487 JS | Twilio + OpenRouter + ElevenLabs, 8 endpoints | `/work/ai-voice-receptionist` |
| **Bank Statement Parser** | 1,222 PY | Real 4-sheet workbook, **264 transactions**, verified | `/work/bank-statement-parser` |

**The Accounting OS is the strongest engineering in the workspace** and it was
sitting in a repo the previous phase had excluded as empty. `sheetflow-ai-ca`'s
README described *"WhatsApp-first, Hindi/Hinglish, deterministic accounting
engine"*; Phase M found no code and excluded it as an intention. The
implementation was at `C:\Users\pc\Desktop\whatsapp-accounting-os` — a path
outside every searched root. It matches the README clause by clause, and it is
the only system here whose behaviour was verified by execution rather than by
reading.

### Two Phase M findings were wrong

1. **The Manus prototype is alive.** Phase M recorded HTTP `000`, called it a DNS
   failure, and excluded it. Re-fetched with redirects: **200, 369,848 bytes**,
   a real Elevate WPC showcase. The `000` was a transient connection failure
   recorded as fact from **one attempt**.
2. **`r3s-realty.vercel.app` is a byte-identical mirror**, not "a second Vercel
   project" — both hosts return md5 `641c6e13…`. Phase M listed it without
   hashing it.

The first one matters beyond itself. This repository has a standing rule that a
single measurement is not a finding, and Phase M applied it to Lighthouse scores
but not to HTTP requests. **The same error recurred inside Phase Y's own test
run** — `r3s-realty-agra` returned `ECONNRESET` once and 200 on re-run. Network
checks now get a retry before they get a conclusion.

Neither correction changes the portfolio: **SheetFlow's authorship of both
Elevate WPC artifacts is still unverified**, which was always the real
disqualifier.

### Rejected, with reasons

- **PMA Automation Agency** — four prompt documents and a **22-line** Twilio test
  script. Not a system.
- **AI Content Engine** — 6,272 lines across 20 agents, genuinely substantial,
  but it **cannot run as found** (placeholder API keys throughout) and has
  produced **no output**. A content engine's evidence is content. Reassess when
  a run produces artifacts.
- **OpenClaw** (318 lines, skeleton), **Sheetflow_Strategy** (one markdown file),
  **AAA-Client-Work** (sales collateral), **AI_Workspace (ChatGPT)** (no code).

## 🔐 Security — two more credentials, and this is now a pattern

Neither is public. Neither directory is a git repository, so nothing was pushed.
**Both should still be rotated**, because both sit **inside OneDrive** and are
therefore synced to Microsoft's servers and present in file version history.

| Credential | Where |
|---|---|
| **Twilio Account SID + Auth Token** | `PMA_Automation_Agency/twilio-demo/call.js`, hardcoded as string literals, alongside the founder's personal mobile number. **A duplicate copy exists** in `Downloads/AI_Projects/` |
| **Groq API key** | `ai_content_engine/config.json`, in a file whose own comment claims *"All YOUR_\* values are safe placeholders"* |

With the Airtable WhatsApp token from Phase M, that is **three credential
findings across two phases**. That is a pattern rather than three accidents. The
standing habit worth adopting: no key in any file that is not `.env`, and `.env`
in `.gitignore` before the first key goes in.

**Order of action:** rotate the Twilio auth token, revoke the Groq key, move both
to `.env`, delete the duplicate `PMA_Automation_Agency` copy.

## Also worth knowing — 13,822 lines have no version control

Seven git repositories exist on the machine: five founder projects (all client
sites) and two vendored third-party libraries. **None of the five internal
systems is under version control** — no history, no branches, no remote, and
several of them live in OneDrive where a sync conflict is the closest thing to a
backup.

This changes nothing about what may be published. It is the highest-value
non-website engineering action currently available.

## Phase M — what the first re-audit found

Five things were true that the inventory did not say. Each one would have put a
false claim on the site.

1. **The two Saraswati builds are byte-identical** — md5
   `baf6589c1b7ff9cb185e0fe178b48674` on both hosts. The one listed as the
   "Older Saraswati Build" is not older; it is **the same file mirrored**.
   Publishing both as separate entries would have implied an iteration history
   that never happened.
2. **The Saraswati dashboard runs on fictional seed data** — a hardcoded `LEADS`
   array with placeholder names and sequential fake numbers. It is a real CRM
   surface (Chart.js, six-column Kanban, appointments) and it must be described
   as a **demonstration**. Separately: shipping it with fictional data was the
   *correct* call, because the page is publicly reachable with **no
   authentication** and real patient records there would be a DPDP exposure.
3. **WPC Design Automation is strong work and is not a client engagement.**
   2,446 lines of Python compiling one image into a 15-size CNC door matrix,
   with atomic staged delivery and bundle verification. But
   `SamplePass_Outreach.md` is a **prospecting kit** with `[Name]` placeholders —
   a sales asset to a prospect who has not replied. Publishable as SheetFlow's
   own capability; **not** as delivered client work.
4. **Elevate WPC — D27 is half wrong and half right.** The business is real and
   live (Google Sites, four product lines, Agra). The Manus prototype is
   **dead** — DNS does not resolve. And **SheetFlow's authorship is unverified**:
   the live site is Google Sites, matching nothing in this account.
5. **`sheetflow-ai-ca` is a README.** A private repo with a genuinely compelling
   description and **1 KB of content — no code**. Excluded.

## 🔐 Security — needs founder action

The Airtable base `Saraswati Dental Clinic CRM` stores **`WhatsApp Access
Token`** and **`n8n Webhook URL`** in its `Settings` table as plain
`singleLineText`.

An anonymous fetch of that base showed **no token-shaped string**, so nothing is
leaking publicly and **there is no live incident**. But a Meta WhatsApp Business
API token in a CRM table is readable by every base collaborator and every
automation holding base scope. It belongs in n8n's credential store.

**The URL supplied in the founder's inventory points directly at that table.**
It is an authenticated workspace URL, not a public share — it auth-walls for
visitors, which is also why it **cannot be used as portfolio proof**. Worth
knowing before it is shared with anyone again.

## The blocker that had to be resolved before any of Phase K

The execution contract stated that client permission had been granted. The
founder's **own CRM ledger** — `AAA-Client-Work/daily-log.md`, brief #17, dated
2026-07-31 — reported *"Clients closed in 2026 to date: 0"* and *"₹0 active — no
demos booked, no proposals out, no agreements signed"*. One of the three sites
carries the founder's own email as its contact address. All three name **real
third parties with real credentials**, including a BDS registration number and
an IAP professional registration.

Those cannot both be true, and it mattered because publishing would assert a
commercial relationship about **named real people who had not been asked**. It
was raised as a legal-permission question with the evidence attached, before any
page was written. The founder reaffirmed and set a boundary: names, screenshots,
links, architecture and implementation detail are publishable; revenue,
conversion, ROI, metrics, testimonials and timelines are not.

That is **D24**. It is the founder's call and it was made with the evidence in
front of them. **Reopen it if any named client objects**, since consent came
from the founder rather than from the clients directly.

## Correction — a claim in the previous revision of this file was false

The previous revision stated:

> The architecture already supports the second case — a case study can carry a
> summary without a metric.

**It did not.** `VerifiedCaseStudy` in `src/content/proof.ts` *required*
`metric` and `metricLabel`, so a permissioned-but-unmeasured project could not
be typed at all. The claim was true of the intent and never of the code, and it
was discovered by trying to use it.

`ProjectOutcome` in `src/content/work.ts` now provides what that sentence
promised: a `not-disclosed` variant with **no field a number can be typed
into**, and a `measured` variant that cannot exist without a full `Verification`
carrying methodology and confirmation date.

## Headline finding — TBT is paint, not JavaScript

Measured with `npm run trace` (CDP `Performance.getMetrics` counters), 4 s idle:

| Arm | Total main-thread task | Paint & composite |
|---|---|---|
| Motion on (ships today) | 374 ms | 272 ms (73%) |
| Reduced motion (no atmosphere) | 246 ms | 224 ms (91%) |

**Paint and compositing are 73–91% of steady state.** JavaScript is the minority
cost — which is why three optimisation phases targeting JavaScript never moved
the number, and why Phase J's JavaScript arm was rejected on measurement.

**D17 is RESOLVED — in the negative.** There is no single expensive effect. The
cost is diffuse and structural, so reducing it is a design question (**A2**).
Current recommendation on A2: **do nothing yet**.

## Current Blockers

**B1 — CLOSED (2026-08-08).** Permission granted with a boundary (D24). Three
case studies ship.

**D27 — CORRECTED (Phase M).** The previous entry said Elevate WPC had "no
verifiable artifact … nothing in the workspace". **Both halves were wrong, and
in opposite directions:**

- A live artifact *does* exist — `sites.google.com/view/elevate-wpc/elevatewpc`,
  200, 257,632 bytes. Earlier phases tested domain spellings and Vercel, and
  never tested the Google Sites URL.
- Work *does* exist in the workspace — `C:\Users\pc\Desktop\WPCDesign_Automation`,
  2,446 lines. Earlier searches missed it because it sits on the **plain
  Desktop**, not under OneDrive, and every prior sweep was scoped to OneDrive.

What remains true is that **SheetFlow's authorship of the Elevate WPC site is
unverified** — it is a Google Sites build matching nothing in this account. A
case study claiming SheetFlow built it is still unsupported. The WPC automation
pipeline is a separate and much stronger candidate.

**RESOLVED in Phase Z — the three demo builds.** The paragraph that stood here
said Dr. A.K Gupta Dental, Krishna Dental and `align-dental` were live but that
their URLs signalled demo status, so *"neither is evidence of a delivered
engagement"*. That reasoning was sound and the conclusion drawn from it was too
broad: it treated "not a delivered engagement" as a reason to publish nothing,
when the actual constraint was only on claiming a client.

Phase Z enumerated the Netlify account, established authorship from account
ownership, and added the `demo` evidence variant. **Two of the three now ship**
— `/work/ak-dental-diagnostic-centre` and `/work/align-dental-system` — as
demonstrations, with no client organisation asserted anywhere in markup or
schema.

**Krishna Dental remains excluded**, on new evidence rather than the old
reasoning: its WhatsApp link is `wa.me/91XXXXXXXXXX`, an unreplaced placeholder,
and it contains no form. It is an unfinished template (D33). Full detail in
`docs/EVIDENCE_MATRIX.md` §2.16.

**Outcome metrics remain blocked**, and that is a different question from B1. No
engagement has a measured, client-confirmed result, so every case study reads
*"Not publicly disclosed."* and `Review`/`AggregateRating` stay absent —
now asserted by test on every content route.

**B2 — `sheetflow.ai` is not attached.** `vercel domains ls` returns **0
domains**.

**RC1 corrected the scope of this.** `NEXT_PUBLIC_SITE_URL` is **unset locally**,
so every consumer falls back to `https://sheetflow.ai` — the canonical host is
already correct in code, in all ten case-study `@id`s included. What is blocked
is (a) the domain does not exist yet, and (b) the Vercel environment sets that
variable to a `vercel.app` value which **overrides** the correct fallback.

So B2 is a purchase, a DNS attachment, and one environment variable — possibly
just *deleting* it. **No code change.** Attach it before inviting indexing:
moving after indexing re-hosts the entity graph and discards accrued authority.

**All blockers are now consolidated in `BLOCKERS.md`**, with the exact blocker,
why it blocks, and the resolution options ranked for each.

## Open Decisions

**D2 — Deployment reconciliation.** `origin/main` and the M01 branch remain
diverged: 13 ahead, 1 behind. No fast-forward path. Resolution strategy is
undecided; a force push would be required and has not been attempted.

**D3 — No Vercel control-plane access via MCP.** The CLI works and was used this
phase; the MCP integration is authenticated to the wrong account.

**D4 — `raw-loader` is an unused devDependency.** Removal needs approval.

**D5 — `.eslintrc.json`** retained but inert under ESLint 9 flat config.

**D6 — `typescript.ignoreBuildErrors: true`** remains set in `next.config.mjs`.
`npm run type-check` is the real gate and passes independently.

**D7 — Stray `C:\Users\pc\package-lock.json`** makes Next infer the wrong
workspace root. Outside the repository.

**D8 — `.claude/` directory** is untracked and not ignored.

**D9 — `violet` token migration.** 34 usages on a deprecated alias. Mechanical
and visually inert.

**D12 — Preview deployments are SSO-protected.** Automated verification against
a preview URL needs a bypass secret or relaxed protection — both security
settings, both founder decisions.

**D26 follow-up — Calendly's post-booking redirect is unset.** `/book/confirmed`
is built but unwired. Setting it before deployment would send real bookers to a
URL that does not exist yet. Founder action in the Calendly dashboard after
deploy.

**A1 — Is the Spline/3D direction still live?** `src/components/three/` is
imported by no rendered code and the bundle contains zero Three.js symbols, yet
six dependencies exist for it and their peer conflict forces
`--legacy-peer-deps` on every install.

**A2 — Does the homepage's decorative composition survive its measured cost?**
Now framed as *which components*, not *how much brand* — a page in the identical
visual language scores far higher.

## The type change Phase M queued — shipped in Phase Y

Phase M identified the blocker and deliberately left it: `WorkProject.liveUrl`
was required and documented *"Must return HTTP 200"*, with a test asserting
exactly that, so an internal build could not be typed at all.

`ProjectEvidence` now does for reachability what `ProjectOutcome` already did for
metrics. The `internal` variant has **no field a URL can be typed into** and no
`shot` field either; it carries an `artifacts` ledger instead — named files, line
counts, a test count and the date it ran.

The guarantee is therefore **stronger** than before rather than relaxed to fit
five projects in:

- `liveProjects()` returns a narrowed type, so the reachability test cannot be
  handed an internal build, and an internal build cannot opt out by leaving a URL
  blank — it is a different shape.
- A test asserts internal case studies emit **no** project `url`, **no** `about`
  organisation and **no** `image` in their JSON-LD. Naming a client for work
  nobody commissioned is now a test failure.
- `llms.txt` states the distinction explicitly, because a model summarising the
  site is exactly where *"SheetFlow built an accounting system"* would quietly
  become *"…for a client"*.

**Still queued, unchanged:** the Saraswati dashboard and CRM showcase inside the
existing case study, described as a demonstration on seeded data.

## Next Milestone

M02 — not defined in this repository.

## Latest Commit

`e340a8e` — `docs(evidence),feat(content): re-audit the portfolio inventory, and
put Excel first`

**Phase Y, Phase Z and RC1 work is uncommitted in the working tree** at the
time of writing. Branch `feat/m01-foundation`.

## Latest Preview

**Local production preview — `http://localhost:3000`** (running now).

```
cd 10_Final_Website
npm run build && npm start
```

That is the artifact every test, bundle measurement and Lighthouse figure in
this document was taken against, and it is byte-for-byte what a deploy would
upload.

**Screenshot matrix:** `10_Final_Website/release-preview/` —
**10 routes × 5 breakpoints** (desktop 1440, laptop 1280, tablet 810,
large-mobile 430, mobile 412), with full-page captures at the widest and
narrowest. Regenerate with `node scripts/capture-release-preview.mjs`.

**No remote preview URL exists, and RC1 established that more firmly than
before.** D3 previously rested on `list_teams` returning empty — equally
consistent with "wrong account" and "no teams". RC1 passed the founder's real
org ID directly to `list_projects` and got `Failed to list projects`: the Vercel
MCP is authenticated to a principal that **cannot see this org at all**.
Deploying via the CLI is outward-facing and founder-gated (`BLOCKERS.md`).

Previews are also SSO-gated (D12), so a preview URL could not be audited
anonymously even if one existed — which is why local verification has been the
honest channel for five phases.

## Current Lighthouse

**RC1 batch** — measured against the final local production build,
`LH_PRESET=mobile`, **median of 5**, warm-up discarded.

Only the route this phase changed was re-measured.

| Route | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | SI |
|---|---|---|---|---|---|---|---|---|---|
| `/work` | **64** | 100 | 96 | 100 | 1.4 s | 4.7 s | 740 ms | 0 | 3.2 s |
| `/work/ak-dental-diagnostic-centre` | **63** | 100 | 96 | 100 | 0.9 s | 4.2 s | 1,120 ms | 0 | 3.0 s | *(Phase Z batch)*

**The new demonstration case study measured 63** — and this comparison *is*
valid, because both routes were run in the same batch, back to back, on one
machine. That is the only kind of comparison this repository accepts.

A case study with a full-width screenshot, a disclosure panel, an architecture
flow and a FAQ costs the same as the index that links to it. **Accessibility is
100 and CLS is 0 on the newest surface on the site**, which is what the run was
for.

**Earlier batches recorded 65, 70 and 62 for this route. None of those
differences is a finding** — three batches, three
builds, and cross-batch comparison is exactly what Phase J was retracted for.
The honest statement is that **`/work` has a documented band of 62–70** across
four batches, and a single figure inside it is indistinguishable from machine
load. RC1's 64 is inside it.

A plausible *mechanism* for real cost does exist: the page went from 8 cards to
10, and from 3 above-the-fold screenshots to 5. **A mechanism is not a
measurement**, and establishing it would need both arms in one batch.

**CLS held at 0 and accessibility at 100** — the two numbers actually at risk
from adding image-bearing cards and a new tinted surface.

**The homepage was not re-measured.** No component, token or dependency on `/`
changed this phase. Its documented mobile median remains **52** (band 48–54),
desktop 59–65. `/pricing` and `/book` are unchanged at 66 and 76.

**Read single runs with care.** `/pricing` once scored 55/58/66/67/74 across five
runs of one unchanged build. The median is trustworthy; any single run is not.

## Current Bundle Size

**350.8 kB gzipped JS** (31 files, 1,087 kB raw) plus 10.7 kB gzipped CSS,
against budgets of 360 kB and 40 kB. **All budgets met. 9.2 kB of headroom.**

**Byte-identical to Phase Y, with two more case studies** — the two new projects
added **zero** client JavaScript, and that was the thing worth checking.

Phase Y's failure mode is the reason. Adding five case studies there first took
gzipped JS to **369.3 kB and failed the gate**, and the content was not the
cause: `components/sections/CaseStudy.tsx` is a `'use client'` component that
imported `@/content/work`, so the **entire case-study corpus** — every
architecture stage, engineering decision and FAQ answer — shipped to the browser
to render three cards showing a name, a sector and a picture. Harmless at three
projects, 13.6 kB at eight.

The fix was to narrow to six fields on the server (`toCard`). **Phase Z is the
evidence that the fix holds under growth**: the corpus grew again, the client
bundle did not move at all.

## Notes

**Screenshot matrix:** `10_Final_Website/release-preview/` — **70 images**
across desktop (1440), laptop (1280), tablet (810), large-mobile (430) and
mobile (412), covering all 10 content routes, with full-page captures at the
widest and narrowest. Gitignored as review output; regenerate with
`node scripts/capture-release-preview.mjs` against a production server.

**Routes (37):** `/`, `/book`, `/book/confirmed`, `/pricing`, `/services`,
`/services/[slug]` × 6, `/work`, `/work/[slug]` × **10**, plus `llms.txt`,
`robots.txt`, `sitemap.xml`, `manifest.webmanifest`, the icon routes, and
**ten** edge-runtime OG/Twitter image routes.

**Test infrastructure:** Playwright 1.62 + axe-core, running against the
production build across desktop and mobile. Two new governance tests this phase
— demonstration builds emit no client organisation, and the reachability check
retries once and now covers companion surfaces.

**Accessibility:** axe reports zero WCAG 2.1 AA violations across 11
route/motion combinations. Coverage includes a demonstration case study, which
renders two tinted text surfaces no other page has.

**Responsive:** verified 360–1440 px. Zero horizontal overflow on 10 routes × 5
breakpoints. Header height is a constant **64 px** across the whole range.
Card-versus-grid overflow on `/work` is now asserted by test at 360/390/430 px —
a document-level check does not catch it, which is why it went unseen for four
phases.

**Lint debt:** 8 warnings, 0 errors — all `react-hooks/set-state-in-effect`,
deliberately downgraded with documented rationale, and all in
`src/components/three/`, which A1 may remove entirely.

---

*No conflict with the Constitution or Decision Register was detected during
Phase Z. The one apparent conflict — publishing a real business name on work
nobody commissioned — was resolved in the type system rather than by judgement:
a demonstration build cannot assert a client relationship, and a test proves it.*
