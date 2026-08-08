# SheetFlow V2

## Current Milestone

M01

## Current Status

**Engineering complete for this milestone — awaiting founder decisions.**

Phase K shipped the three commercial surfaces the site had never had: a
portfolio, published prices, and a booking flow. Build is green at **30
routes**, the suite is at **290 tests**, and every new route scores
accessibility 100 and SEO 100.

What remains is not engineering. It is a domain nobody has bought (B2), a branch
nobody has reconciled (D2), and a deployment nobody has approved.

Production deployment has **not** been performed and awaits explicit approval.

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
Full detail in `CHANGELOG.md`.

M01 phase 7 (Phase L) — **catalogue parity and return messaging.** The two
catalogued services that had no page — `Daily Business Reports` and
`Invoice Reminders` — now have one, closing a gap where the entity graph
advertised services with nothing behind them. The pricing calculator gained a
break-even line built from our published price and the visitor's own figure.

M01 phase 8 (Phase M) — **the evidence re-audit.** The founder supplied a full
project inventory and instructed that it be treated as verified. It was
re-verified anyway, artifact by artifact, because "treat as verified" is an
instruction about *permission*, not about whether a URL resolves. The result is
`docs/EVIDENCE_MATRIX.md`, built before any case study was written, and
`docs/MCP_EXECUTION_REPORT.md`. Four findings changed what may be published —
see below. Excel-first repositioning shipped.

## Phase M — what the re-audit found

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

**New in the inventory, not previously assessed:** two further named clinics
with live demo builds — **Dr. A.K Gupta Dental** (`ak-dental-demo.netlify.app`)
and **Krishna Dental Clinic** (`keen-griffin-feb211.netlify.app`) — plus
`align-dental` (`sheetflow51-prog.github.io/dental-demo/`). All live. Both
clinic URLs signal **demo status** (one is named `-demo`; the other still sits
on Netlify's auto-generated subdomain), so neither is evidence of a delivered
engagement. Full detail in `docs/EVIDENCE_MATRIX.md`.

**Outcome metrics remain blocked**, and that is a different question from B1. No
engagement has a measured, client-confirmed result, so every case study reads
*"Not publicly disclosed."* and `Review`/`AggregateRating` stay absent —
now asserted by test on every content route.

**B2 — `sheetflow.ai` is not attached, and it now matters more.** `vercel
domains ls` returns **0 domains**; `NEXT_PUBLIC_SITE_URL` resolves to a
`vercel.app` subdomain. Every canonical, `og:url`, sitemap `<loc>`, `llms.txt`
reference and JSON-LD `@id` points at the wrong host — **including the three
case-study `@id`s that now carry client names**. Moving later re-hosts the whole
entity graph and discards whatever authority accrued, which is precisely the
cost the `@id` architecture exists to avoid. **Attach the domain before
inviting indexing.**

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

## Next engineering task — the one Phase M deliberately did not do

**The WPC Design Automation case study needs a type change before it can exist.**

`WorkProject.liveUrl` is required and documented *"Must return HTTP 200"*, and a
test asserts exactly that against every published project. WPC has **no live
URL** — it is Internal Only.

Adding it therefore means a discriminated union on evidence, mirroring what
`ProjectOutcome` already does for unmeasured outcomes: a `live` variant carrying
a fetchable `liveUrl`, and an `internal` variant with **no field a URL can be
typed into**. That keeps the guarantee the current type provides — that nothing
on `/work` links to something a visitor cannot open — instead of weakening it to
fit one project in.

Queued with it: the **Saraswati dashboard and CRM showcase** (described as a
demonstration on seeded data), screenshot capture for both, and a Lighthouse
rerun once a render path actually changes.

## Next Milestone

M02 — not defined in this repository.

## Latest Commit

`c285052` — `feat(services,pricing): close the catalogue gap, and add break-even
ROI messaging`

Branch `feat/m01-foundation`.

## Latest Preview

**Not deployed this phase.** The preview deploy was attempted and blocked by the
session's permission policy, which treats deploying as an outward-facing action.
Verification was therefore run against the identical production build locally —
the same channel used in earlier phases because previews are SSO-gated (D12)
and cannot be audited anonymously.

The last recorded preview remains
`https://sheetflow-ai-website-3moimh5xb-sheetflow51-progs-projects.vercel.app`
(2026-08-07, commit `dbea5f4`) and **predates every route in Phase K**.

## Current Lighthouse

Measured **2026-08-08** on commit `6e2d752`, production build, `npm run
audit:lh` with `LH_PRESET=mobile`, median of 5, warm-up discarded.

| Route | Perf | A11y | BP | SEO |
|---|---|---|---|---|
| `/` | **52** | 100 | 96 | 100 |
| `/work` | **65** | 100 | 96 | 100 |
| `/pricing` | **66** | 100 | 96 | 100 |
| `/book` | **76** | 100 | 96 | 100 |

**The homepage did not regress** despite gaining three case-study images: 52
against a median-of-9 baseline of 52, inside its documented 48–54 band. Read as
*no detectable change*, not as evidence that images are free.

**Read single runs with care.** `/pricing` scored 55/58/66/67/74 across five
runs of one unchanged build. The median is trustworthy; any single run is not.

Desktop was not re-measured; the documented band is 59–65 and nothing this phase
touches the desktop render path. Quoting a fresh desktop number from a different
batch would invite the invalid between-batch comparison Phase J was retracted
for.

## Current Bundle Size

**355.7 kB gzipped JS** (31 files, 1,101 kB raw) plus 10.5 kB gzipped CSS,
against budgets of 360 kB and 40 kB. **All budgets met.**

Up from 321 kB gzipped before Phase K — four new routes, a client-side
calculator and a client-side form. 4.3 kB of headroom remains against the JS
budget, which is worth knowing before the next feature.

## Notes

**Routes (30):** `/`, `/book`, `/book/confirmed`, `/pricing`, `/services`,
`/services/[slug]` × 6, `/work`, `/work/[slug]` × 3, plus `llms.txt`,
`robots.txt`, `sitemap.xml`, `manifest.webmanifest`, the icon routes, and
**eight** edge-runtime OG/Twitter image routes.

**Test infrastructure:** Playwright 1.62 + axe-core, **290 tests** across desktop
and mobile, running against the production build.

**Accessibility:** axe reports zero WCAG 2.1 AA violations across 6 route/motion
combinations. One serious defect (WCAG 2.1.1) was found and fixed this phase,
visible only on the mobile profile.

**Lint debt:** 9 warnings, 0 errors — 7 `react-hooks/set-state-in-effect`
(deliberately downgraded with documented rationale) and 2 unused disable
directives in `layout.tsx`.

---

*No conflict with the Constitution or Decision Register was detected during
Phase K. The one apparent conflict — portfolio permission against the CRM
ledger — was escalated to the founder and resolved as D24.*
