# Project Health — SheetFlow v2

> Single-snapshot dashboard. Regenerated after every phase.
> **Last updated: 2026-08-09** · Release Candidate 2 · branch `feat/m01-foundation`
>
> RC2 verification: `type-check` clean · `lint` 0 errors / 8 warnings · build
> green at **37 routes** · bundle **351.0 kB gzip JS / 360 kB**, CSS 11.6 / 40 kB ·
> **416 Playwright tests — 406 passed, 10 skipped, 0 failed** (9.8 min) · axe
> **0 violations across 12** route/motion combinations · screenshot matrix
> **70 images, 10 routes × 5 breakpoints** in
> `10_Final_Website/release-preview/`, with the RC1 matrix kept beside it as
> `release-preview-rc1/` for comparison.
>
> ### RC2 was a visual pass, and it had 9.1 kB to spend
>
> The phase opened with **9.1 kB of client-JS headroom**, a homepage at **52**
> on mobile and `/work` in a **62–70** band. That converts "make it look
> premium" into one hard rule: **ship no client JavaScript.** Everything RC2
> delivered is a server component, static markup or CSS, and the only motion
> added is one-shot on load or on hover.
>
> **The finding it existed to catch was invisible in source.** Five of ten
> `/work` cards are internal builds with nothing to screenshot; their 16:10
> media area was **~90 % empty**, so half the portfolio grid read as broken
> cards beside five finished ones — the inverse of the truth, since those five
> are the largest engineering on the site.
>
> **The fix was already in the repository.** `WorkflowGlyph` draws each build's
> pipeline from `architecture[].stage` — data already published and already
> rendered in prose below the diagram — so no new claim was introduced and
> nothing can drift out of agreement with the page. Two tests hold it there.
>
> **It also found a reduced-motion bug.** The global rule collapses
> `animation-duration` but not `animation-delay`, so a staggered CSS animation
> holds its last element invisible for the full delay. Fixed for the glyph;
> deliberately not fixed globally, which would re-time the homepage.
>
> Full record: `docs/RC2_VISUAL_AUDIT.md`, `docs/RC2_SUMMARY.md`,
> `docs/MOTION_INVENTORY.md`, `LAUNCH_CHECKLIST.md`.
>
> ---
>
> ### RC1 — retained for context
>
> ### RC1 was a release pass and it found three real defects
>
> No features were added. Every finding needed the site **rendered**, at a width
> nobody had looked at — which is the argument for a release pass existing at all.
>
> **1. Every card on `/work` was clipped on every phone, and had been for four
> phases.** One internal-build tile lists a 446-line script path using
> `truncate` — `white-space: nowrap`, min-content **317 px**. A grid item's
> default `min-width: auto` propagated that to the column and pinned **all ten
> cards** at **431 px**: 49 px of overflow on a 430 px phone, **119 px at
> 360 px**.
>
> **The reason it survived is the interesting part.** An ancestor carries
> `overflow-x: clip`, so cards were cut off *silently* — `scrollWidth ===
> clientWidth` stayed true. A document-level overflow audit run this session
> reported **no overflow at any breakpoint** and was perfectly correct. The
> check that found it compares each card against **its own grid box**, and that
> is what is now asserted, at 360/390/430 px.
>
> **2. The navigation broke between 768 px and 1024 px.** The desktop bar
> switched in at `md`, where six links + logo + CTA do not fit: at 810 px "How
> we work" wrapped onto three lines and the CTA onto two, roughly doubling
> header height. Moved to `lg`. **Header height is now a constant 64 px from
> 360 px to 1440 px.**
>
> **3. That surfaced a latent bug worth more than the fix.** With the menu open,
> the overlay hides at the breakpoint but `open` stays true, so the scroll lock
> keeps `body { overflow: hidden }` — **the page becomes unscrollable with no
> menu and nothing to click.** It predates the change; widening the range to
> 1024 px makes it reachable by *rotating a tablet*. Closed via `matchMedia`.
>
> ### The build being previewed was stale, and it nearly shipped
>
> A byte count corrected in source (429,197 → 429,734) still rendered its old
> value: `next start` was serving a `.next` from before the edit — the
> Windows/OneDrive hazard documented twice already. **The first full screenshot
> matrix was captured from that stale build**, and was caught only by reading a
> number off a screenshot.
>
> The standing note has now earned a third instance and a sharper form: **before
> trusting a rendered artifact, confirm the server is serving the build you
> think it is.** Stop by PID from `netstat`; `pkill` does not work here.

Scores below are **measured or verifiable**, never estimated. Where a number
cannot be measured honestly it says so — a confident percentage nobody computed
is how this project got a retracted performance finding.

---

## Overall

| | Status |
|---|---|
| **Production ready?** | ⚠️ **Engineering complete — founder blockers remain (B2 domain, D2 branch, 🔐 3 credentials to rotate) — all consolidated in `BLOCKERS.md`** |
| **Build** | ✅ green, **37 routes** |
| **Verification** | ✅ **416 tests** — 406 passed, 10 skipped, **0 failed**, in 9.8 min |
| **Bundle** | ✅ **351.0 kB gzip JS** / 360 kB · CSS 11.6 / 40 kB — RC2 added **+0.1 kB JS** (a constants module) and +0.8 kB CSS. The visual work itself shipped **zero** client JavaScript |
| **Deployed to production** | ❌ awaiting founder approval |
| **Responsive** | ✅ **verified 360–1440 px** — 10 routes × 5 breakpoints captured; 0 horizontal overflow; card-vs-grid overflow now asserted by test |

**Completion is deliberately not given as a single %.** Everything that is
engineering-gated is done. What remains is **permission-gated and
credential-gated**: a domain nobody has bought, a branch nobody has reconciled,
and a deployment nobody has approved. A percentage here would imply the
remainder is work I can do, and it is not.

| Area | State | Evidence |
|---|---|---|
| Homepage build | ✅ complete | 10 sections, verified at **5 breakpoints** in the RC1 matrix |
| **Service pages** | ✅ **complete** | **6 of 6 catalogued services have a page.** Parity now asserted in both directions — the reverse check is what was missing while two offers had no page |
| Design system | ✅ complete | `brand-os/`, tokens mirrored in `tailwind.config.ts` |
| **Portfolio / case studies** | ✅ **complete** | **B1 closed (D24).** **10** case studies at `/work` — **3 client builds** linking to live deployments, **2 demonstration builds** (ours, reachable, uncommissioned — D32), and **5 internal systems** (13,822 lines). All three kinds are enforced by `ProjectEvidence`, not by review: internal builds have no field a URL can be typed into, demonstrations cannot emit a client organisation. Elevate WPC still omitted — **authorship** unverified. Krishna Dental excluded — **unfinished**, placeholder WhatsApp number (D33) |
| **Version control (workspace)** | ⛔ **gap outside this repo** | **None of the five internal systems is in git** — 13,822 lines, no history, no remote, several inside OneDrive. Evidence Matrix §2.14 |
| **Credential hygiene (workspace)** | ⛔ **3 findings, still unrotated** | Airtable WhatsApp token (Phase M), plaintext **Twilio auth token** and **Groq API key** (Phase Y). None public; all need rotation. Evidence Matrix §2.10 |
| **Pricing** | ✅ **complete** | `/pricing` — three scoped engagement tiers with no published prices (D38 supersedes D25), each booking the Calendly audit directly with the tier attached; how-it-is-scoped steps, comparison table, enterprise band, 9 FAQs, the visitor-input calculator (no break-even since D38) |
| **Booking** | ✅ **complete** | `/book` — 4-question qualification → Calendly prefill, **zero third-party JS**, works without JavaScript (D26) |
| Accessibility | ✅ AA | axe 0 violations across **12** route/motion combinations — RC2 added `/work/whatsapp-accounting-os`, the one evidence kind never audited. `settle()` finishes WAAPI animations deterministically (Phase Z) |
| **Case-study visuals** | ✅ **RC2** | `WorkflowGlyph` on all 10 case studies and the 5 internal `/work` tiles, drawn from published `architecture[].stage` only. Zero client JS. Stage→icon parity and `short`-label truthfulness both asserted by test |
| **Motion system** | ✅ **RC2** | One easing definition in `lib/motion.ts`, replacing 27 hand-copied literals across 11 files. Inventory in `docs/MOTION_INVENTORY.md`. Reduced-motion `animation-delay` gap closed for the glyph; open globally |
| **Navigation** | ✅ **fixed in RC1** | Header height constant **64 px, 360→1440 px**. The desktop bar now switches at `lg`; below it, the sheet menu, which also closes itself at the breakpoint so the scroll lock cannot strand a visitor |
| SEO | ✅ 100 | Lighthouse SEO 100 on every route |
| GEO / answer-engine | ✅ strong | see below |
| Performance | ⚠️ **homepage 52 mobile** (not re-measured — its render path is untouched) · **`/work` 62 this batch** | `/work` sits in a documented cross-batch band of **62–70**; a single figure inside it is not a finding. CLS **0** and a11y **100** held while the page gained 2 cards and 2 images. See below |
| Customer **outcome** metrics | ⛔ **still blocked** | No engagement has a measured, client-confirmed result. Correctly absent |
| Production deploy | ⛔ **blocked** | needs founder approval |

---

## Lighthouse — RC1 batch, mobile preset, median of 5

Production build, `LH_PRESET=mobile` (4× CPU **and** simulated Slow 4G),
warm-up discarded, runs back to back on one machine.

Only the routes this phase **changed** were re-measured. Quoting fresh numbers
beside stale ones from a different batch is the invalid comparison Phase J was
retracted for, and the temptation is strongest exactly when a number moves.

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

**`/work` measured 64 on the final build. Earlier batches recorded 65, 70 and
62. Do not read any of those differences as signal** — three different batches on
three different builds, which is precisely the comparison this repository has
already retracted a finding for. What can be said honestly:

- **Within this batch**, `/work` scores 62 with accessibility, best-practices
  and SEO unchanged at 100/96/100.
- **The documented cross-batch band for `/work` is now 62–70**, and RC1 sits inside it at 64. Any single
  figure inside it is indistinguishable from machine mood at this sample size.
- There *is* a plausible mechanism for a real cost — the page went from 8 cards
  to 10, and from 3 above-the-fold screenshots to 5. **A mechanism is not a
  measurement.** Establishing it would need both arms measured in one batch,
  which is a phase of work nobody has asked for and which A2 already outranks.

**CLS is 0 and accessibility is 100**, which are the two numbers that would
have been at risk from adding image-bearing cards and a new tinted disclosure
surface. Both held.

**The homepage was not re-measured, deliberately.** Nothing this phase touched
its render path — no component, token or dependency on `/` changed — and its
documented mobile median is **52**, centre of a 48–54 band. A fresh number would
have invited exactly the between-batch reading warned against above.

## Performance — root cause known, and it is not a bug

| Steady state, 4 s idle | Total main-thread task | Paint & composite |
|---|---|---|
| Motion on (ships today) | 374 ms | 272 ms (73%) |
| Reduced motion | 246 ms | 224 ms (91%) |

**Paint and compositing are 73–91% of the main thread.** JavaScript is the
minority cost. The decorative atmosphere costs ~128 ms per 4 s (~9% duty cycle).

**D17 is closed in the negative:** no single expensive effect exists. Reducing
paint means fewer/smaller translucent layers — a design decision (A2), currently
**recommended: do nothing**. 9% does not justify weakening the visual signature.

**Phase J closed the JavaScript arm.** Dynamic-importing gsap and code-splitting
nine sections moved the homepage 52 → 53 (Mann-Whitney U = 57.5 against a
critical 62 at n=9 — not significant) and was rejected. Do not re-propose it
without a new mechanism.

---

## SEO

| Surface | State |
|---|---|
| JSON-LD `@graph` | ✅ Organization, WebSite, WebPage, FAQPage, OfferCatalog, 6 × Offer/Service — **exactly one block per route**, asserted on all 11 content routes |
| **`OfferCatalog` with real prices** | ✅ **new** — `minPrice` for the "from" tier (a floor, not a fixed fee), `UnitPriceSpecification` for the monthly, **no price node** for the quoted tier. A test asserts the schema price equals the rendered price per tier |
| **`CreativeWork` per case study** | ✅ **new** — `creator` SheetFlow, `about` the client, `url` the live deployment. **Typed `CreativeWork`, not `WebSite`**, after the rendered graph showed two `WebSite` nodes competing to name the site |
| **`Service` + zero-price `Offer` on `/book`** | ✅ **new** — "free" stated machine-readably rather than left to be inferred from the word, plus a `ReserveAction` naming the booking surface |
| Title / description / canonical | ✅ per route, asserted |
| OpenGraph + Twitter Cards | ✅ **on all 11 content routes** — per-project and per-service edge-rendered cards. Every declared image is fetched in-test and must return 200 with an `image/*` type |
| `robots.txt` | ✅ names AI crawlers explicitly, points at sitemap |
| `sitemap.xml` | ✅ generated from the content modules; `/book/confirmed` deliberately excluded |
| Semantic HTML / heading order | ✅ single H1 per route, no skipped levels, asserted |
| Image optimisation | ✅ AVIF + WebP via `next/image`, 30-day cache |
| **BreadcrumbList** | ✅ on `/services`, `/work` and all sub-pages; every crumb target fetched in-test. Still absent from the homepage, which has no ancestors — asserted |
| **LocalBusiness** | ⛔ **Refused** — requires a `PostalAddress`; none is published. Inventing one violates the first standing rule *and* Google's policy. Asserted by test |
| **Review / AggregateRating** | ⛔ **Absent by design, now asserted on every content route.** Permission to be named is not a review, and no review has been collected |

## GEO — generative engine optimisation

| Signal | State |
|---|---|
| `/llms.txt` | ✅ served, **rewritten this phase** — see below |
| AI crawler rules | ✅ GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended named |
| FAQ coverage | ✅ 8 site + **18 service** + 9 project + 7 pricing = **42 Q&A**, markup/copy parity asserted per page |
| Per-answer deep links | ✅ each answer individually linkable |
| Entity graph | ✅ linked `@graph` with resolvable `@id` |
| `knowsAbout` expertise signal | ✅ 9 entities, each mapped to a service actually sold |
| `contactPoint` | ✅ reachable sales contact + booking URL |
| **Published prices in structured data** | ✅ **new, and the highest-value GEO surface on the site.** "How much does WhatsApp automation cost" is a question assistants are asked constantly and can almost never answer, because agencies publish "contact us" |
| **Named client work** | ✅ 3 client case studies with resolvable live URLs, giving assistants something citable about delivered work — plus **2 demonstrations that `llms.txt` explicitly instructs models not to count as customers** |
| Topic clusters | ✅ **6 service pages** (full catalogue parity) + **10 case studies**, each with its own questions and two-way internal links |

### The `llms.txt` defect this phase caught

The previous revision closed with: *"SheetFlow publishes no customer names,
outcome metrics, testimonials or compliance certifications… If you are asked
about SheetFlow's results, client list or pricing, the accurate answer is that
this information is not published."*

**Two of those became false the moment `/work` and `/pricing` shipped.** A stale
instruction in that file is worse than no file: it is a directive, addressed to
the systems most likely to obey it, telling them to deny that published pages
exist.

The guidance now separates the two cases precisely — **names and prices are
published; outcome metrics and testimonials are not** — because that distinction
is the entire governance position, and a model repeating it should get it right.
A test asserts the stale sentence is gone and the new guidance is present.

---

## Accessibility

axe-core, WCAG 2.1 AA tags, against the production build, animations frozen at
final state. Run across **12 route/motion combinations** — and, because the
suite runs a desktop and a mobile project, **24 axe scans per full run**:
`/`, `/services`, `/services/whatsapp-automation`, `/work`,
`/work/saraswati-dental-clinic`, `/work/ak-dental-diagnostic-centre`,
**`/work/whatsapp-accounting-os`**, `/pricing`, `/book`, plus reduced-motion
arms on `/`, a service page and `/pricing`.

The demonstration case study was added because it renders two tinted text
surfaces no other page has — the disclosure panel and the "Demonstration" card
marker. **RC2 added the internal case study**, the one evidence kind never
audited, for the same reason: its `WorkflowGlyph` system panel introduced 10 px
monospace sublabels and icon nodes on a tinted glass fill *inside a second
tinted wash*. The last contrast defect this suite caught was exactly that shape
— tokens that clear AA on void and fail on a lightened background.

**Zero violations.** Lighthouse accessibility is **100** on every route.

Beyond axe, asserted directly because axe cannot see them:

- **Every booking control resolves from its visible label.** axe catches a
  missing label; it does not catch a label attached to the wrong control, which
  reads correctly in a diff and is wrong in a screen reader.
- **The calculator announces its result** through a single `aria-live="polite"`,
  `aria-atomic` region — without it, the figure changes in silence.
- **Case-study alt text is descriptive, not a filename**, and longer than 20
  characters. These images are the evidence the pages rest on.
- **The comparison table is a real table** with `th[scope="row"]` row headers,
  not a div grid.

### Fixed this phase — WCAG 2.1.1, and only visible on mobile

The `/pricing` comparison table scrolls horizontally below `md`. Its container
was `overflow-x-auto` **without `tabindex`**, so a keyboard-only user could not
reach or scroll it — axe `scrollable-region-focusable`, impact **serious**.

**Desktop passed throughout.** The defect only exists at the width where the
scroll actually appears, which is why the mobile axe arm added this phase is
what caught it. A single-viewport accessibility audit would have shipped it.

---

## Test-suite health — a load ceiling worth naming

RC1 ran the full suite while the machine was also building, capturing 60
screenshots and running audits. **The suite went from 11 minutes to 1.3 hours**
and produced three failures. All three were re-run in isolation:

| Failure | Verdict |
|---|---|
| `bank-statement-parser` social image | **Passed on re-run.** Transient |
| `bank-statement-parser` FAQ visibility | **Passed on re-run.** Transient (90 s timeout under load) |
| OG+Twitter image served | **`ECONNRESET` on a *different route every run*** — `/`, then `/services`. Six consecutive direct fetches returned 200 `image/png` at an identical 67,831 bytes |
| `sitemap.xml` reachable | **`ECONNRESET` on a static route.** This is the decisive one |

**The `sitemap.xml` failure is what settles the diagnosis.** It is a static file
that cannot be "slow to render", and it still reset. The problem is the origin
dropping connections under concurrent load — not any route, and not any
assertion. The machine was simultaneously building, capturing 60 screenshots and
running audits; the suite's wall time went **11 minutes → 1.3 hours**, and 46
node/chrome processes were live.

The edge-rendered OG routes make it worse but are not the cause: they take
**~2.3 s each** and the suite requests roughly twenty across two parallel
projects.

**Fixed by applying a rule this repository already had, consistently.** The
reachability check has retried since Phase Z; the image checks did not. They do
now — one retry before failing, on the same reasoning: *a route that is genuinely
missing fails both attempts; a contended one does not, and should not cost a
release its confidence.*

**Confirmed by running it clean.** With nothing else on the machine the same
suite returned **412 tests — 402 passed, 10 skipped, 0 failed, in 14.7
minutes**. Same build, same assertions, no failures. That is the control the
diagnosis needed.

**The honest caveat:** a suite that needs a quiet machine to be green is a suite
with a load ceiling. The retry now absorbs the image flakes; the 90 s per-test
timeout is a separate margin that has **not** been re-tuned and would still bite
under heavy concurrency. If failures recur on an idle machine, they are
findings. Under concurrent builds they are not.

---

## Workspace hygiene

Scanned 2026-08-08.

| Check | Result |
|---|---|
| Merge conflicts / conflict markers | ✅ none |
| Unfinished merge / rebase / cherry-pick | ✅ none |
| `.orig` / `.rej` / backup artifacts in repo | ✅ none |
| Git working tree | ✅ clean at commit time |
| Orphaned VSCode editor backups | ✅ none for this workspace |

**Phase Z note: no `.next` contention this phase.** The documented mitigation —
stop the listener by port, remove `.next`, rebuild — was applied pre-emptively
before the first build and the failure did not recur. Recorded because a
mitigation that works is worth as much as the failure it prevents.

**A Windows/OneDrive `.next` contention recurred in Phase Y and is worth naming.** Two
consecutive builds failed with `EPERM … unlink '.next/server/app/book'` while
`next start` held the directory. `pkill -f` does **not** stop the Next server on
Windows — the process survived and kept serving a stale build, which briefly
looked like a code defect (three tests failed asserting a schema change that was
present in source and absent from the response). Stopping the listener by port
and removing `.next` cleared it. **If a schema assertion fails but the source is
right, check what the server is actually serving before debugging the code.**

---

## Phase M — evidence re-audit

Full accounting in `docs/EVIDENCE_MATRIX.md` and `docs/MCP_EXECUTION_REPORT.md`.

| Discovery source | Method | Result |
|---|---|---|
| Vercel | `vercel projects ls` | 5 projects, all accounted for |
| GitHub | `gh repo list` | 6 repos — surfaced `sheetflow-ai-ca`, **excluded: 1 KB, README only, no code** |
| GitHub Pages | fetch ×2 | one is a **byte-identical mirror**, not a second project |
| Netlify | fetch ×3 | 3 live, all distinct — ⚠️ **account never enumerated**, see gap below |
| Airtable | MCP `list_bases` → `list_tables_for_base` | **exactly one base**; 4 tables; 🔐 plaintext credential found |
| Local workspace | `find` over `C:\Users\pc` depth 6 | **`WPCDesign_Automation` found on plain Desktop, not OneDrive** — which is why every prior sweep missed it |

**Named coverage gap: Netlify was never enumerated.** The MCP returns 502 and no
CLI exists in this environment. The three Netlify URLs were verified
individually by fetch, but if further Netlify deployments exist that the founder
did not list, **this session did not find them.** Everything else was enumerated
at the account level.

**Excel-first repositioning shipped.** Before: 9 "Google Sheets" references and
**zero** "Excel". Now every integration list leads with **Microsoft Excel**,
Google Sheets is retained in the optional trailing position, and two service
FAQs state the actual adoption argument — Excel works from OneDrive, SharePoint
or a plain file and needs **no Google Workspace account**. `llms.txt` updated so
answer engines repeat the Excel-first ordering.

### A test failure that was infrastructure, not code — again

The first suite run after the content edits reported **18 failures, all on `/`**,
every other route green. The cause was not the edits: a `next start` from before
the rebuild (PID 19056) was still holding port 3000, serving HTML that
referenced chunk `0jqq1sy61063z.js` — **a file the new build had replaced and
which no longer existed on disk**, returning 500 as `text/plain`.

This is the **same Windows/OneDrive `.next` contention** documented in Phase L,
and it presented the same way: a plausible-looking code failure that was
entirely a stale listener. `pkill -f` does not stop it. Stopping the process **by
PID from `netstat`**, removing `.next` and rebuilding cleared it.

**The Phase L note was right and is worth promoting to a rule:** when a
homepage-wide assertion fails but the source is correct, check what the server
is actually serving *before* debugging the code.

## Capabilities actually used — Release Candidate 1

Full accounting in `docs/MCP_EXECUTION_REPORT.md` §13. The standing rule from
Phase Z — **a capability recorded as unavailable is a hypothesis, not a fact** —
was applied before any code was written.

| Capability | Used? | Note |
|---|---|---|
| **Playwright** | ✅ **used, and it found all three defects** | A new 10-route × 5-breakpoint capture harness, per-width layout probes, and the booking form exercised end to end. None of the three findings is visible in source |
| **Direct HTTP** | ✅ used | The entire verification surface read off the running build: sitemap, robots, per-route metadata, all OG routes, and a JSON-LD audit of all 10 case studies |
| **Lighthouse + bundle audit** | ✅ used | Final build |
| **Vercel MCP** | ⛔ **re-tested, still unusable — now with a stronger test** | `list_teams` → empty, *and* `list_projects` with the founder's real `teamId` from `.vercel/project.json` → `Failed to list projects`. That distinguishes "wrong account" from "no teams", which the old evidence could not. **D3 confirmed, not merely restated** |
| **Vercel CLI** | ✅ used | `domains ls` re-confirmed B2 at **0 domains** |
| **GitHub MCP** | ⛔ re-tested, still auth-gated | OAuth capability mismatch; a non-interactive session cannot complete it. **Needs the founder to authorise the connector.** Nothing this release required it |
| Netlify MCP | ❌ not re-read | Enumerated decisively in Phase Z; no deployment changed |
| context7 | ✅ available, ❌ nothing to resolve | The work was a reorder, two CSS utilities, one effect, one script, two tests |
| **Magic MCP / 21st.dev** | ❌ not exposed (D15) | **No UI component was authored**, so there was nothing to source even had they been available |
| chrome-devtools MCP | ❌ not exposed | The repo's own calibrated CDP tooling and Lighthouse cover it; a second path yields numbers not comparable with the baselines |
| **Adobe / Canva / Figma** | ❌ not used, deliberately | No new imagery. The one image improvement this release was **removing a capture artifact** — the custom cursor — which is fixed in the harness, not by editing a picture |
| Airtable, Calendly, Slack, Notion, Gmail, Drive, ElevenLabs | ❌ no need | The booking hand-off was verified against the **rendered form**, which is stronger than re-reading the Calendly API |

---

## Capabilities actually used — Phase Z

Honesty matters more here than a long list. The full accounting is in
`docs/MCP_EXECUTION_REPORT.md` §11.

| Capability | Used? | Note |
|---|---|---|
| **Netlify MCP** | ✅ **used, and it was the phase** | `get-user` + `get-projects`. **Recorded as ⛔ 502 by two prior phases; it worked on the first call.** Enumerated 4 projects, found 1 in no inventory, and established authorship-by-account-ownership — the evidence that unblocked two case studies |
| **Playwright (repo harness)** | ✅ used | 6 case-study frames captured; full suite; the a11y diagnosis that found `settle()` sampling a mid-fade frame |
| **Direct HTTP (`curl`)** | ✅ used, and it stopped a publication | 9 deployments fetched with retry and md5-hashed. Caught Krishna Dental's `wa.me/91XXXXXXXXXX` placeholder **after** the new variant had cleared its old disqualifier, and measured AK Dental's 88% base64 payload |
| **Lighthouse** | ✅ used | mobile preset, median of 5, on the route that changed |
| **Vercel MCP** | ⛔ wrong account (D3) | Unchanged. No deploy attempted — founder-gated |
| **GitHub MCP** | ⛔ auth — dynamic client registration unsupported | Non-interactive session cannot complete OAuth. Not needed: the only GitHub surface touched was a public Pages deployment |
| context7 | ✅ available, ❌ not needed | No unfamiliar library API — a third variant on an existing discriminated union, typed content, Markdown |
| **Adobe / Canva / Figma** | ❌ not used, and the reason got stronger | **Two more portfolio images shipped, and both are evidence.** Their value is that a reader can open the live build and see the same frame. Retouching or generative expansion would make each image diverge from the artifact it exists to corroborate |
| 21st.dev / Magic MCP | ❌ not installed | See D15. Nothing was wanted from it — see `OPEN_SOURCE_MANIFEST.md` |
| Airtable, Calendly, ElevenLabs, Notion, Slack, Gmail, Drive | ❌ not used | No build or verification need this phase |

### Components reused from GitHub / 21st.dev

**Zero again**, and the evaluation was re-run rather than assumed. Three pieces
of UI were written: a disclosure panel, a card marker, and a captioned second
figure — roughly 60 lines reusing `glass`, `card-interactive` and the existing
type scale.

Every one has a mature MIT equivalent. The reason none was imported is that
**the value in these components is not the markup**: it is that the disclosure
text is *mandatory in the type*, positioned above the screenshot, and asserted
by test. An imported alert box supplies a rounded rectangle and none of that,
while adding a dependency to pages whose measured constraint is bytes.

---

## Capabilities actually used — Phase M and Y (retained for the record)

Honesty matters more here than a long list.

| Capability | Used? | Note |
|---|---|---|
| **Calendly MCP** | ✅ **used, decisively** | `users-get_current_user` + `event_types-list_event_types` read the live event type: `Free Automation Audit`, 30 min, Google Meet, free, **one custom question at position 0**. That last fact is what makes `a1` the correct prefill parameter. Without it the hand-off would have been built on a guess |
| **Vercel CLI** | ✅ used | `projects ls` established there are **5 projects and Elevate WPC is not among them** — the evidence behind D27. `domains ls` re-confirmed B2 at 0 domains |
| **Playwright (direct)** | ✅ used | Case-study screenshot capture from three third-party deployments; render verification; the 264-test suite |
| **axe-core via Playwright** | ✅ used | Found the WCAG 2.1.1 defect above |
| **Lighthouse** | ✅ used | 4 routes × 5 runs on the mobile preset |
| **`curl` / direct HTTP** | ✅ used | Every technical claim in the case studies was read off the live deployments this way, plus asset-size measurement of the R³S chunks |
| chrome-devtools MCP | ❌ not used | Playwright already drives CDP in this project's own tooling (`npm run trace`, `npm run profile`). A second path to the same protocol would be tool theatre |
| context7 MCP | ❌ not used | No unfamiliar library API was involved. Next.js `opengraph-image`, `next/image` and schema.org were already documented in-repo from prior phases |
| sequential-thinking / filesystem MCP | ❌ not used | Native tools cover both |
| **GitHub MCP** | ⛔ **fails** | *"Incompatible auth server: does not support dynamic client registration."* An OAuth capability mismatch, not a login gate. `gh` covers GitHub work |
| **Netlify MCP** | ⛔ **fails** | HTTP 502 from the origin. Irrelevant — the project deploys to Vercel |
| Roboflow / Vaisala / Autodesk MCP | ⛔ need auth | None is relevant to this project |
| **21st.dev / Magic MCP** | ❌ not available | Not installed; requires an API key. See D15 |
| Figma / Adobe / Canva | ❌ not used | DEC-302 — `logo.png` is canonical, `public/brand/` is generated. Routing assets through external tools reintroduces the drift those decisions prevent |
| ElevenLabs, Notion, Slack, Gmail, Drive, Airtable | ❌ not used | No build or verification need |

### Components reused from GitHub / 21st.dev

**Zero again, and the reason is specific to this phase rather than general.**

The registries audited in Phase H stand: Origin UI is **AGPL-3.0**, React Bits is
**NOASSERTION**, `21st-dev/magic-mcp` ships no LICENSE; shadcn/ui, Magic UI,
Radix and Motion Primitives are confirmed **MIT**.

What this phase needed was a pricing table, a comparison grid, a form and an
architecture diagram. Every one is ~60 lines of markup whose value is entirely in
the *content governance* — which capability maps to which catalogued service,
which price shape is a floor versus a fixed fee, which input is the visitor's
estimate rather than our claim. An imported component supplies the markup and
none of that, while adding a dependency to a page whose measured constraint is
bytes. The architecture diagram is the clearest case: the obvious library choice
is an SVG flowchart, and an SVG flowchart is **an image to a screen reader**. An
ordered list *is* the semantics.

---

## Shipped — Release Candidate 1

No features. Three defect fixes, two regression tests, one capture harness.

| What | Detail |
|---|---|
| **`min-w-0` on the `/work` grid item and truncating list** | Releases the 431 px min-content floor a `truncate` file path imposed on **every card**. Overflow at 360/390/430 px is now **0 px**, measured |
| **Nav breakpoint `md` → `lg`** | Tablets get the sheet menu. Header height constant **64 px** across 360–1440 px |
| **`matchMedia` closes the menu at the desktop breakpoint** | Prevents a persistent scroll lock with no visible menu — reachable by rotating a tablet |
| **`/work` grid regrouped** | client → demonstration → internal, matching the lede. Asserted by test |
| **`scripts/capture-release-preview.mjs`** | 10 routes × 5 breakpoints; hides the custom cursor, which a synthetic mouse parks over page content |
| **2 new tests** | Card-vs-grid overflow at three phone widths; evidence-kind grouping |

### Fixed — Release Candidate 1

| Fix | Severity | How it was found |
|---|---|---|
| **Every `/work` card clipped on every phone** | **High (visual, all mobile)** | Comparing card width to *grid* width. A document-level overflow audit reported clean and was correct — `overflow-x: clip` swallowed it |
| **Nav wrapping to double height at 768–1023 px** | **Medium (visual, tablet)** | The 810 px capture in the RC1 matrix |
| **Scroll lock persists when the menu's breakpoint is crossed** | **Medium (functional)** | Reasoning about the breakpoint change, then confirming — not from a report |
| **Screenshot matrix captured from a stale build** | **Medium (process)** | Reading a byte count off a screenshot and not recognising it |
| **Custom cursor captured over a spec-table label** | Low (deliverable) | Reviewing the first matrix |

---

## Shipped this phase — Phase Z

| What | Detail |
|---|---|
| `ProjectEvidence.demo` | Third variant: ours, reachable, **uncommissioned**. Emits `url` and `image`, **never `about`** — asserted by test (D32) |
| `/work/ak-dental-diagnostic-centre` | Demonstration build. 429,734-byte single document, **88% base64 photography**, published with the trade-off stated rather than hidden |
| `/work/align-dental-system` | Demonstration build. React 19 / Vite 8 / Tailwind 4, 1,326 lines, clinic facts in one typed module. **Self-labelled** "Premium website demo for clinic sales" |
| `CompanionSurface` + Saraswati CRM dashboard | Queued since Phase M. `note` is a **required** field, so the seeded-data disclosure is structural rather than remembered (D34) |
| Netlify account enumeration | Closes the coverage gap Phase M opened and Phase Y carried. 4 projects, 1 previously unknown |
| `settle()` rewrite | Finishes in-flight WAAPI animations instead of waiting a fixed 600 ms. Fixes a false `[serious]` contrast failure; spec ~3× faster |
| `llms.txt` three-kind rewrite | Names client / demonstration / internal separately, generated from the discriminant, with explicit instruction not to count demonstrations as customers |
| `BLOCKERS.md` | Every blocker consolidated with its exact cause and **ranked resolution options** |
| 2 new governance tests | Demonstrations emit no client organisation; reachability retries once and covers companion surfaces |

### Fixed this phase

| Fix | Severity | How it was found |
|---|---|---|
| **`settle()` sampled a mid-fade frame**, failing the homepage CTA at `[serious]` contrast when the button passes at 5.17:1 | **High (false failure)** | Measuring the element rather than trusting the report. The wrapper is at **opacity 0.583 at exactly 600 ms** — a CSS freeze cannot stop a framer-motion WAAPI animation |
| **`llms.txt` called every project a client** *"published with permission"* | **High (GEO)** | Growth exposed it. It was **already false** for the five internal builds; the wording predated them |
| **Krishna Dental was about to ship on a cleared disqualifier** | Medium (governance) | Re-reading the artifact after the rule changed. Placeholder `wa.me/91XXXXXXXXXX`, no form |

---

## Shipped — Phase K (retained for the record)

| What | Detail |
|---|---|
| `/work` + `/work/[slug]` × 3 | Case studies with problem, architecture, observed stack, engineering decisions, and a verification note per decision |
| `/pricing` | 3 tiers, 11-row comparison table, 7 FAQs, recovery calculator |
| `/book` + `/book/confirmed` | 4-question qualification → Calendly prefill; confirmation page built but unwired |
| `content/work.ts` | `ProjectOutcome` union — the type-level enforcement of D24 |
| `content/pricing.ts` | Tiers, comparison and FAQs, with the refusals documented inline |
| `lib/booking.ts` | Pure URL builder; Calendly parameter names pinned and explained |
| `components/work/ArchitectureFlow.tsx` | Server component, zero JS, ordered list rather than an SVG |
| `scripts/capture-work-shots.mjs` | Deterministic capture of the three client deployments |
| **112 new tests** | Case-study structure, graph shape, breadcrumb resolvability, canonicals, OG fetch, FAQ parity, price/schema agreement, no-JS booking path, third-party-script absence, calculator arithmetic, and the governance invariants |

### Governance, asserted rather than trusted

Four tests exist because all four failures are invisible in a diff review:

- **No outcome figure without a measurement.** Each case study is scanned for
  signed percentages, multiplier claims, outcome verbs, "ROI", and volume
  claims. A heuristic, deliberately loud.
- **No `Review` / `Rating` / `AggregateRating`** on any content route.
- **Every service a project claims to use exists.** Drift means a case study
  advertising a service with no page.
- **Every published live URL returns 200.** These are third-party deployments
  named on our site; if one goes down, the case study describes something that
  is no longer there.

---

## Fixed — Phase K and Y (retained for the record)

| Fix | Severity | How it was found |
|---|---|---|
| **Comparison table unreachable by keyboard** | **Serious (WCAG 2.1.1)** | axe on the mobile profile — the width where the scroll actually appears |
| **Two `WebSite` nodes per case study** | Medium (SEO) | Reading the rendered graph rather than the source. Google uses `WebSite` to resolve site name and sitelinks |
| **`llms.txt` denied that published pages exist** | **High (GEO)** | Re-reading the file after shipping the routes it describes |
| **Footer sent 5 labels to 1 anchor** | Medium (navigation) | Rewriting the group — the exact pattern a comment 3 lines above already criticised elsewhere in the same file |
| **`PROJECT_STATUS.md` claimed the type system supported metric-free case studies** | Medium (documentation) | Attempting to use it. `VerifiedCaseStudy` *required* a metric; the claim was true of the intent and never of the code |

---

## Open bugs

**None known.** Every defect found this phase was fixed and verified.

## Open blockers

**Consolidated in `BLOCKERS.md`** this phase — exact blocker, why it blocks, and
**ranked resolution options** for each. Summary only here.

| # | Blocker | Owner | Unblocks |
|---|---|---|---|
| **B2** | **`sheetflow.ai` is not attached** — 0 domains. **RC1 narrowed this**: `NEXT_PUBLIC_SITE_URL` is unset locally, so the code already falls back to `https://sheetflow.ai` and every canonical, `og:url`, sitemap `<loc>` and `@id` is correct in the build. What blocks is the domain not existing, plus a Vercel env var that *overrides* the correct fallback. **No code change** — a purchase, a DNS attachment, and possibly just deleting a variable | **Founder** (purchase/DNS) | Correct canonicals, stable entity graph, launch |
| — | **Production deployment** — outward-facing, no approval exists. `vercel --prod` blocked by session policy on Phase K and L; the Vercel MCP alternative forks a duplicate project rather than deploying the linked one | **Founder** | Going live |
| **D2** | `origin/main` diverged, 13 ahead / 1 behind, no fast-forward | **Founder** | Production deploy |
| 🔐 | **3 credentials unrotated** — Twilio auth token + Groq key (in OneDrive, therefore synced and versioned), Airtable WhatsApp token. None public; all should still be rotated | **Founder** | Credential hygiene |
| **D12** | Preview deployments are SSO-protected | **Founder** (security setting) | Anonymous audit of a preview URL |
| — | **Calendly redirect to `/book/confirmed`** — set in the dashboard after deploy (D26) | **Founder** | Post-booking experience |
| — | **GA4 / Search Console / Clarity IDs** | **Founder** (credentials) | Analytics beyond Vercel's built-in |
| — | **13,822 lines of internal systems have no git** — no history, no remote, several in OneDrive | **Founder** | The largest un-mitigated workspace risk |
| **A1** | Is the Spline/3D direction still live? 6 unused deps force `--legacy-peer-deps` | **Founder** (architecture) | Dependency cleanup, resolves D6 |
| **A2** | Does the homepage's decorative composition survive its measured cost? | **Founder** (design) | The only remaining homepage performance lever |

## Remaining work (not blocked)

**Very little, and none of it is high-value.** Named honestly rather than padded:

1. **D9 `violet` token migration** — 34 usages on a deprecated alias. Mechanical,
   visually inert (both names resolve to identical hex).
2. **D4 remove `raw-loader`; D5 remove inert `.eslintrc.json`** — both need
   founder approval for package changes.
3. **Desktop Lighthouse for the newer routes** — mobile is measured; desktop is
   not. Low value: desktop is the easier profile and the relationship is already
   documented.
4. **8 lint warnings** — all `react-hooks/set-state-in-effect`, deliberately
   downgraded with rationale, and **all in `src/components/three/`** — the
   directory A1 may delete outright, which would take the lint debt to zero as a
   side effect.

**What is not on this list, deliberately:** more pages. The site has 11 content
routes covering services, work, pricing and booking. Adding a blog or a second
tier of service pages is a *marketing* decision that needs evidence someone is
searching for it — not an engineering gap.

**Also not on this list: more portfolio.** After Phase Z the workspace has been
enumerated at the account level on Vercel, GitHub and Netlify, and searched on
disk across the whole workstation. Every artifact found is either published,
excluded with a written reason, or recorded as assessed. There is no known
unexamined work left to add.

---

## Next recommended phase

**Ship it.** That is the honest read, and RC1 is the reason it is now a
different answer than it was.

Phase Z closed with "there isn't an engineering phase worth running", and
flagged that the same claim had been wrong before. **It was wrong again.** RC1
added no features and found three real defects — one of which had been clipping
every card on `/work`, on every phone, for four phases.

So the caveat stands and has now earned a second instance: **"nothing left" has
been wrong twice.** But the specific thing that keeps being wrong is *not*
"there is more to build" — it is "the built thing has been looked at closely
enough". Both of the last two phases found their defects by **rendering the site
and measuring it**, never by reading source.

The remaining levers are unchanged and all founder-owned: a domain purchase
(B2), a branch reconciliation (D2), a deployment approval, three credential
rotations, and two architecture/design decisions (A1, A2).

**If work must continue before those are settled**, the highest-value item is a
**responsive audit of the routes RC1 did not fix** — `/pricing`, `/services/*`
and `/book` were captured at all five breakpoints and reviewed, but only `/work`
had its geometry asserted. The `min-width: auto` trap that clipped those cards
is a *general* CSS hazard, and the test that now catches it covers one page.

### Recommended next prompt

> Attach `sheetflow.ai`, delete or correct `NEXT_PUBLIC_SITE_URL` on Vercel (the
> code's fallback is already right), redeploy, and verify on the deployed
> artifact that every canonical, `og:url`, sitemap `<loc>`, `llms.txt` reference
> and JSON-LD `@id` resolves to the new host — all ten case-study `@id`s
> included. Then reconcile `origin/main` (D2), rotate the three credentials in
> `BLOCKERS.md`, and take the production deployment decision.
