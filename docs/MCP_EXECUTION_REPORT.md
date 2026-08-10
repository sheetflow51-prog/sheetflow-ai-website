# MCP Execution Report

> **Session: 2026-08-08 — Phase M (evidence re-audit).**
> Phase X requires that every installed MCP either materially improved the
> project or carries a documented reason why it did not. This file is that
> accounting.
>
> The standard applied is **"did it change an output?"** — not "was it called".
> A server that returned data nobody acted on is recorded as *not used*, because
> calling a tool and shipping nothing is the tool theatre this project's own
> health doc named in an earlier phase.

---

## 1. Availability — what this session actually had

`.mcp.json` declares six servers. **Three of them did not expose any tools to
this session**, which is a material constraint on what Phase X could execute.

| Declared in `.mcp.json` | Tools exposed? | Consequence |
|---|---|---|
| `context7` | ❌ **No** | **The Phase X Context7 mandate could not be executed.** See §4.1 |
| `chrome-devtools` | ❌ **No** | Profiling fell back to the repo's own CDP tooling |
| `sequential-thinking` | ❌ **No** | No impact — native reasoning covers it |
| `playwright` | ✅ Yes | Available; see §3.1 for why the repo's own suite was used instead |
| `filesystem` | ✅ Yes | Not used — native Read/Grep/Glob are strictly better here |
| `github` | ⛔ **Auth required** | Non-interactive session cannot run OAuth. `gh` CLI used instead |

Additionally connected via claude.ai: Airtable, Calendly, Vercel, Netlify,
Adobe, Canva, Figma, Notion, Slack, Gmail, Google Drive/Calendar, ElevenLabs,
Emergent, Trimble.

**Needing authorization and therefore unavailable:** Autodesk Product Help,
Roboflow, Vaisala Xweather, `github`. None is relevant to this project except
`github`, whose work `gh` covered completely.

---

## 2. Servers that changed an output this session

### 2.1 Airtable MCP — ✅ used, and it produced the session's most important finding

| | |
|---|---|
| **Tools called** | `list_bases`, `list_tables_for_base` |
| **Why chosen** | The founder supplied an Airtable URL as portfolio evidence. A raw fetch returns a sign-in wall and tells you nothing about what the base *is*. The MCP is authenticated as the founder and can read the schema |
| **Files improved** | `docs/EVIDENCE_MATRIX.md` §2.7 |

**What it established that nothing else could:**

1. The account holds **exactly one base** — `Saraswati Dental Clinic CRM`. The
   founder's brief said *"I have built multiple CRMs inside my SheetFlow Google
   account"*; on Airtable there is one. Anything else lives elsewhere.
2. The base is a genuine four-table CRM (Leads / Appointments / Follow-up Log /
   Settings), not a spreadsheet with a nice view.
3. The `Last Modified` field carries a description naming **n8n WF3 and WF5** as
   its consumers — first-party evidence that the automation layer is real and
   wired, which no screenshot could establish.
4. 🔐 **A security finding.** The `Settings` table stores `WhatsApp Access
   Token` and `n8n Webhook URL` as plain `singleLineText`.

**Outcome:** the Airtable URL was **rejected as publishable proof** (it
auth-walls for every visitor), while the schema became publishable *description*.
The credential finding is escalated to the founder in `PROJECT_STATUS.md`.

### 2.2 WebFetch — ✅ used

Resolved what `sites.google.com/view/elevate-wpc/elevatewpc` actually is: a
**Google Sites** build for a bulk WPC door and PVC wall-panel supplier in Agra,
four product lines, contractor/builder audience.

**Why it mattered:** this is the evidence behind Evidence Matrix §2.5 — the
business is real, but the site is *Google Sites*, so **SheetFlow's authorship is
not established** and no case study may claim it. A tool call that prevented a
false claim is worth more here than one that produced a page.

### 2.3 Direct HTTP (`curl`) — ✅ used, and it caught a fabrication risk

Twelve URLs verified for status and byte size, plus **md5 comparison** of pairs.

That comparison is what caught the finding in Evidence Matrix §2.1: the
"Older Saraswati Build" and the current one are **byte-identical**
(`baf6589c1b7ff9cb185e0fe178b48674`). Listed as two portfolio entries they would
have implied an iteration history that never happened. **One artifact, two
hosts.**

It also established that the three R³S deployments are *not* mirrors — different
builds, different md5 — and that only `r3s-realty-agra.vercel.app` is
self-canonical and GSC-verified.

### 2.4 Vercel CLI and `gh` CLI — ✅ used (CLI, not MCP)

- `vercel projects ls` → **5 projects**. Confirms no Elevate WPC deployment
  exists under this account.
- `gh repo list` → **6 repositories**, one private. This surfaced
  **`sheetflow-ai-ca`**, which the founder's own inventory did not list.

**`gh` prevented a bad inclusion.** `sheetflow-ai-ca` has a genuinely compelling
description — *"AI Chartered Accountant for Indian cash-based businesses,
WhatsApp-first, Hindi/Hinglish, deterministic accounting engine"* — and
**1 KB of content: `README.md` and `.gitignore`.** No code. It is an intention,
and it is excluded (Evidence Matrix §2.8).

---

## 3. Available, deliberately not used

### 3.1 Playwright MCP — ❌ not used this session

The repository already drives Playwright directly: a **290-test suite**, plus
`npm run shots`, `npm run trace` and `scripts/capture-work-shots.mjs`, all
running against the production build with axe-core attached.

Driving a *second* browser through the MCP to observe the same pages would
produce screenshots not wired into any test and not committed by any script —
evidence with no assertion behind it. **The repo's own harness is the stronger
instrument**, and it is the one that gets rerun on every future phase.

**This is a deferral, not a dismissal.** The one place the MCP would add
something the suite cannot is capturing the *Saraswati dashboard* and the *WPC
toolpath output* as portfolio imagery. That is queued with the case-study work
those images belong to (§5).

### 3.2 Vercel MCP — ❌ not used

Authenticated to a different account than the one holding these projects (D3,
unchanged). The alternative, `deploy_to_vercel`, **creates a new project from a
file tree** — it would fork a duplicate rather than deploy the linked project.
The CLI is the correct instrument and was used.

### 3.3 Netlify MCP — ⛔ unusable, and it left a real coverage gap

Returned **HTTP 502** from the origin in the previous phase and there is no
Netlify CLI in this environment.

**This is not "irrelevant because we deploy to Vercel."** Three of the founder's
listed artifacts are Netlify deployments. They were verified individually **by
fetch**, but the **account was never enumerated** — so if further Netlify
deployments exist that the founder did not list, this session did not find them.
Recorded as a named gap in Evidence Matrix §3 rather than hidden.

### 3.4 Adobe / Canva / Figma — ❌ not used

DEC-302 stands: `logo.png` is canonical and `public/brand/` is generated from it.
Routing brand assets through an external editor reintroduces exactly the drift
those decisions exist to prevent.

Phase X permits Adobe "only where it genuinely improves quality". The candidate
was image optimisation for case-study screenshots — but `next/image` already
serves **AVIF + WebP** with a 30-day cache, and the shots are captured
deterministically by a committed script. An external round-trip would make a
reproducible asset unreproducible to save nothing measurable.

### 3.5 Calendly MCP — ❌ not re-read this session

Used decisively in Phase K, where `event_types-list_event_types` established the
`Free Automation Audit` event carries **one custom question at position 0** —
the fact that makes `a1` the correct prefill parameter. Nothing in the booking
flow changed this phase, so re-reading it would confirm a fact already pinned and
tested. **The adapter Phase X asks for already exists** (`lib/booking.ts`), and
the booking flow ships **zero third-party JavaScript**.

### 3.6 Not used, no plausible application

Gmail, Slack, Notion, Google Drive/Calendar, ElevenLabs, Emergent, Trimble
SketchUp, Canva. No build, verification or content need this session.

---

## 4. Mandates in Phase X that could not be executed

Recorded plainly, because a completion gate that quietly skips its own
requirements is worthless.

### 4.1 Context7 — ⛔ **not executable this session**

Phase X §2 requires Context7 be used instead of memory wherever official
documentation is needed. **`context7` is declared in `.mcp.json` but exposed no
tools to this session** — it is not a case of choosing not to call it.

Mitigating fact: the session needed no unfamiliar library API. The work was URL
verification, schema reading, and content edits to existing typed modules. The
one documentation-shaped question — Microsoft Excel connectivity — is a *product
capability* claim, not an API-surface question (§6).

**This should be re-attempted in an interactive session**, where the stdio server
can start.

### 4.2 21st.dev / Magic MCP — ⛔ not installed

Neither is in `.mcp.json`; both require an API key (D15). Phase X §4–5 cannot be
executed. No UI component was replaced this session in any case.

### 4.3 GitHub MCP — ⛔ auth, but fully substituted

Requires OAuth, impossible in a non-interactive session. **`gh` CLI covered every
GitHub need** — repo enumeration, private-repo metadata, and a recursive tree
read that established `sheetflow-ai-ca` is empty.

### 4.4 Open-source reuse — evaluated, still zero, and the reason is unchanged

`OPEN_SOURCE_MANIFEST.md` records the Phase H audit: Origin UI is **AGPL-3.0**,
React Bits is **NOASSERTION**, `21st-dev/magic-mcp` ships no LICENSE;
shadcn/ui, Magic UI, Radix and Motion Primitives are confirmed **MIT**.

This session wrote **no new UI**. The changes were content-module edits and two
Markdown documents. There was nothing for a component library to supply.

---

## 5. What this report does *not* claim to have finished

The founder's brief asks for a full portfolio rebuild against the new evidence.
This session completed the **discovery and governance layer** — the gate the
brief itself requires before case studies are written — plus the Excel-first
repositioning (§6).

**Still outstanding**, and not represented as done:

1. **WPC Design Automation case study.** The evidence is strong (Evidence Matrix
   §2.4) but it needs a **type-level change first**: `WorkProject` requires a
   `liveUrl` that "must return HTTP 200", and a test asserts exactly that. WPC
   has no live URL. Adding it demands a discriminated union for internal work —
   the same pattern `ProjectOutcome` already uses for unmeasured outcomes — so
   that *no field an unverifiable link can be typed into* exists. That is a
   deliberate design task, not a data entry.
2. **Saraswati dashboard + CRM showcase** inside the existing case study,
   described as a **demonstration on seeded data** (Evidence Matrix §2.3).
3. **Screenshot capture** for both of the above (§3.1).
4. **Lighthouse and Playwright reruns.** `npm run type-check` passes; the full
   suite and Lighthouse have **not** been rerun since the content edits.

---

## 6. Excel-first repositioning — shipped this session

Phase X §11 and the founder's §5 require Microsoft Excel to become the default
record store in public-facing content, with Google Sheets demoted to optional.

**Before:** 9 "Google Sheets" references, **0** "Excel".

Changed across four files — `content/services.ts`, `content/faq.ts`,
`app/llms.txt/route.ts`, `components/sections/AIInfrastructure.tsx`:

- Every integration list now leads with **Microsoft Excel** and retains Google
  Sheets in the trailing optional position.
- Two service FAQs rewritten to state the actual adoption argument — Excel works
  from OneDrive, SharePoint or a plain file, and **needs no Google Workspace
  account**.
- `llms.txt` updated, so answer engines repeat the Excel-first ordering.

**Truthfulness check.** These lists are *capability* claims, not delivered-work
claims, and they sit at the same epistemic level as the HubSpot, Pipedrive and
GoHighLevel entries already published — none of which has a shipped case study
either. Excel automation via the Microsoft Graph API is a standard, real
integration path (n8n ships a Microsoft Excel node). The claim is honest.

`npm run type-check` passes.

---

# Phase Y — 2026-08-08

> Second session, same standard: **did it change an output?**

## 7. Phase Y availability

| Server | Status | Consequence |
|---|---|---|
| `filesystem` | ✅ connected | **Not used** — native Read/Grep/Glob/Bash are strictly better for a whole-disk sweep, and `find` with exclusion filters is the only practical way to census source lines across 13,000+ files |
| `playwright` | ✅ connected | **Not used directly** — the repo's own suite was run instead (§8.3) |
| `chrome-devtools` | ✅ connected | Not used — no profiling work this phase |
| `context7` | ✅ **connected this session** | Not used — see §9.1 |
| `sequential-thinking` | ✅ connected | Not used — native reasoning covers it |
| `github` | ⛔ **auth required** | Substituted by `gh` CLI, as in Phase M |
| Autodesk, Roboflow, Vaisala Xweather | ⛔ auth required | None relevant to this project |

**Authorization note for the founder:** `github`, Autodesk Product Help,
Roboflow and Vaisala Xweather all need OAuth, which a non-interactive session
cannot perform. Only `github` matters here, and `gh` covers it completely. To
authorize the rest: claude.ai connector settings for the claude.ai connectors,
or `/mcp` in an interactive session.

## 8. What changed an output in Phase Y

### 8.1 `gh` CLI + `git` — ✅ used, established a negative that mattered

`gh repo list` (6 repos) and a `find`-driven enumeration of every `.git`
directory on the machine with its remote, branch and commit count.

**The finding is an absence, and it is the useful kind.** All seven local
repositories were *already known*. No hidden project, no abandoned branch with
shippable work. That converts "we might be missing something in version control"
from an open worry into a checked box — and simultaneously produced Evidence
Matrix §2.14: **the five best internal systems have no repository at all.**

### 8.2 Direct HTTP (`curl`) — ✅ used, and it overturned a Phase M finding

Nine URLs re-verified for status, byte size and md5, **with redirects followed
this time**.

- **Corrected the Manus prototype from dead to live** (200, 369,848 B). Phase M
  recorded `000` from a single attempt and excluded it (Evidence Matrix §2.12).
- **Confirmed `r3s-realty.vercel.app` is a byte-identical mirror** of
  `r3s-realty-agra.vercel.app` — both `641c6e13…`. Phase M listed it as "a second
  Vercel project" without hashing it, which left a duplicate unreconciled.

### 8.3 The repository's own Playwright suite — ✅ used, and it caught the same class of error

Ran `work.spec.ts` across desktop and mobile: **129 passed, 10 skipped, 1
failed** — and the failure was `ECONNRESET` fetching `r3s-realty-agra`, which
**passed on re-run**.

That is worth recording rather than quietly re-running: it is the identical
failure mode that produced Phase M's false "dead site" conclusion, reproduced
inside the same session that corrected it. The 10 skips are the screenshot tests
for the five internal builds, which have no screenshot by construction.

### 8.4 Direct execution — ✅ used, the strongest evidence obtained this phase

Two claims were verified by **running the code**, not by reading it:

- `npm run test:staging` in `whatsapp-accounting-os` → **21 passed, 0 failed**.
- `openpyxl` read of `bank_statement_analysis.xlsx` → **4 sheets**, Transactions
  at **265 rows × 9 columns** (264 transactions plus header).

A passing test suite is the only evidence in this entire audit that a system
*behaves* rather than merely *exists*. It is why the Accounting OS case study
can cite a test count and the other four cannot.

## 9. Available, deliberately not used in Phase Y

### 9.1 Context7 — ✅ available, ❌ not needed

Connected this session, unlike Phase M. **Not called, because no unfamiliar
library API was touched.** The work was a discriminated union over existing
types, edits to typed content modules, and Markdown. Calling it to satisfy a
mandate would be the tool theatre this report exists to prevent.

Phase M's §4.1 gap — "should be re-attempted in an interactive session" — is
therefore **closed by availability**, not by use.

### 9.2 Adobe MCP — ❌ not used, and the reason is now structural

Phase Y §9 asks Adobe to be used where it improves screenshots, portfolio
images, PDF exports, graphics or optimisation, or for the reason to be
documented. **The reason is stronger than it was in Phase M**, because this phase
established what the portfolio's images are *for*.

1. **The three client screenshots are evidence, not decoration.** Their value is
   that a visitor can open the live site and see the same thing. Any
   enhancement — retouching, colour work, generative expansion — makes the image
   diverge from the artifact it is evidence of. Improving them would degrade
   them.
2. **The five internal builds have no image by design, not by omission.** A
   screenshot of a live deployment is checkable; a screenshot of a file on a
   developer's laptop is an assertion with a picture attached. The `internal`
   evidence variant therefore carries an **artifact ledger** — named files, line
   counts, a test count — because those are claims a reader could contradict.
   Generating imagery for them would add exactly the unverifiable decoration the
   type change exists to prevent.
3. **Optimisation is already handled.** `next/image` serves AVIF and WebP with a
   30-day cache; the three JPEGs are ~100 KB each and captured by a committed,
   deterministic script. An external round-trip would make a reproducible asset
   unreproducible to save nothing measurable.
4. **The one image that could have been captured was declined on privacy
   grounds.** The Bank Statement Parser's output workbook is genuine, which is
   precisely why it cannot be shown — real counterparty names, real UPI
   identifiers, real balances (Evidence Matrix §2.10 standing condition 7).

**Conclusion: Adobe MCP was unnecessary, and using it would have made the
portfolio weaker.** Same conclusion for Canva and Figma, same reasoning, plus
DEC-302 on brand assets.

### 9.3 Airtable, Calendly, Vercel, Netlify MCP — ❌ not re-read

Airtable and Calendly were read decisively in earlier phases and nothing this
phase changed the CRM schema or the booking event. Vercel MCP remains
authenticated to the wrong account (D3); the CLI was used. Netlify remains
unusable — **the account is still not enumerated**, and that gap is carried
forward in Evidence Matrix §3.1 rather than quietly dropped.

### 9.4 Not used, no plausible application

Gmail, Slack, Notion, Google Drive/Calendar, ElevenLabs, Emergent, Trimble
SketchUp. No build, verification or content need this phase.

**ElevenLabs deserves one line**, since it is newly relevant: the AI Voice
Receptionist uses the ElevenLabs *API* directly in its own source. The MCP here
manages conversational agents in a claude.ai-connected account, which is a
different system from the founder's Node service and would tell us nothing about
it. Not used, correctly.

## 10. Open-source reuse in Phase Y

`OPEN_SOURCE_MANIFEST.md` is unchanged in its licensing findings, and the reason
is the same as Phase M: **no new UI was written.** The five case studies are data
in a typed content module; the two new UI branches — the internal-build card
tile and the artifact ledger — are ~40 lines of Tailwind reusing the existing
`glass`, `card-interactive` and `font-mono` primitives already in the design
system.

Importing a component library to render a definition list would add a dependency,
a licence obligation and a second visual language, to replace markup that already
matches every other card on the site. **The manifest records the evaluation; the
answer is still zero.**

---

## 11. Phase Z — the retry that closed a standing gap

**Session: 2026-08-08 — Phase Z (production release pass).**

### 11.1 Netlify MCP — ✅ used, and it closed a gap two phases had carried

| | |
|---|---|
| **Tools called** | `netlify-user-services-reader` (`get-user`), `netlify-project-services-reader` (`get-projects`) |
| **Why chosen** | Netlify was the **one named coverage gap** left open by Phase M and carried forward unchanged by Phase Y. Both phases recorded it as unusable — HTTP 502 — and verified the three known URLs individually by fetch instead |
| **Files improved** | `docs/EVIDENCE_MATRIX.md` §0b, §1.1 rows 6–8b, §2.16 · `src/content/work.ts` · `PROJECT_STATUS.md` · `PROJECT_HEALTH.md` |

**It worked on the first call this phase.** The 502 was transient, and both
earlier phases had recorded a single failed request as a standing capability
finding — the third instance of exactly the error this repository already had a
written rule about (Evidence Matrix §2.12). The rule has been sharpened
accordingly: **re-test unavailable capabilities each phase**, because nothing
about a 502 says it is permanent.

**What it established that nothing else could:**

1. **The account holds exactly 4 projects**, enumerated at account level rather
   than inferred from a supplied list. The gap is closed.
2. **One project appears in no inventory** — `radiant-lollipop-6e4d44`, a live
   UGC NET Sociology study site. Assessed and excluded as not automation work,
   but now *recorded* rather than unknown.
3. **Ownership of the deploying account, which is authorship evidence.** This is
   the finding that changed what ships. `ak-dental-demo` and `keen-griffin-feb211`
   sit on SheetFlow's own account (`sheetflow51@gmail.com`) — direct evidence of
   authorship, and precisely the evidence Elevate WPC lacks. It does **not**
   evidence a commission, and the new `demo` variant keeps those two questions
   separate rather than collapsing them as earlier phases did.
4. **No project is password- or SSO-protected**, so every published URL is
   anonymously checkable — which matters because the reachability test fetches
   them unauthenticated.

**This is the clearest case in the whole report of an MCP changing an output.**
Two case studies ship that were previously withheld, and the reason they were
withheld was a question only account-level enumeration could answer.

### 11.2 Playwright (repo suite + capture script) — ✅ used

Six case-study frames captured from live deployments, including the two new
demonstrations and the Saraswati CRM dashboard companion surface. The full
suite ran against the production build. Unchanged rationale from §3.1: the
repository's own harness drives CDP already, and a second path to the same
protocol would be tool theatre.

### 11.3 Direct HTTP (`curl`) — ✅ used, and it stopped a publication

Nine deployments fetched with a retry and md5-hashed. Two findings changed
what shipped:

- **Krishna Dental carries `wa.me/91XXXXXXXXXX`** — an unreplaced placeholder —
  and contains no form. It was about to be published under the new `demo`
  variant, which had removed its previous disqualifier. Reading the artifact
  rather than trusting the classification is what caught it. **Still excluded**,
  on better grounds.
- **AK Dental is 88% base64 photography** (379,084 of 429,197 bytes across five
  inlined JPEGs), which is the technical spine of its case study and is stated
  there with its downside rather than as a boast.

### 11.4 Vercel MCP — ❌ not used

Unchanged from D3: authenticated to the wrong account. No deployment was
attempted this phase in any case — that is founder-gated and remains so.

### 11.5 Context7, Adobe, Canva, Figma, Airtable, Calendly, and the rest — ❌ not used

Reasons unchanged from §9.1–§9.4 and materially strengthened for Adobe by this
phase's work: **two more portfolio images were added, and both are evidence.**
The AK Dental and Align Dental frames are published so a reader can open the
live build and see the same thing. Retouching, colour work or generative
expansion would make each image diverge from the artifact it exists to
corroborate. The same argument now covers the Saraswati dashboard frame, where
the screenshot's entire purpose is to show a surface a reader can go and check.

No unfamiliar library API was touched — the work was a third variant on an
existing discriminated union, typed content, and Markdown — so Context7 had
nothing to resolve.

### 11.6 GitHub MCP — ⛔ still auth-gated

Unchanged: *"Incompatible auth server: does not support dynamic client
registration."* Non-interactive sessions cannot run OAuth. No GitHub work was
required this phase beyond reading a public Pages deployment, which `curl` and
Playwright covered.

## 12. Open-source reuse in Phase Z

**Still zero, and the evaluation was run again rather than assumed.**

What this phase needed in new UI was: a demonstration badge on a card, a
disclosure panel, and a second figure with a caption. That is roughly 60 lines
of Tailwind reusing `glass`, `card-interactive` and the existing type scale.

The reasoning from §10 holds and gets sharper here. The *value* in these three
components is not the markup — it is that the disclosure text is mandatory in
the type, positioned above the fold, and asserted by test. An imported
component supplies markup and none of the governance, while adding a dependency
to pages whose measured constraint is bytes and whose purpose is to make an
honest distinction impossible to miss.

`OPEN_SOURCE_MANIFEST.md` records the evaluation. The answer is unchanged.

---

## 13. Release Candidate 1 — what was exercised, and what was re-tested

**Session: 2026-08-08 — RC1 (release pass).**

The standing rule added in Phase Z is that **a capability recorded as
unavailable is a hypothesis, not a fact**, and must be re-tested each phase.
This section is that re-test, run before any code was written.

### 13.1 Vercel MCP — ⛔ re-tested, still unusable, and now with a stronger test

| | |
|---|---|
| **Tools called** | `list_teams`, `list_projects` |
| **Result** | `list_teams` → `{"teams": []}`. `list_projects` with the **explicit** `teamId` read from `.vercel/project.json` (`team_AaJceK7wRwOKqcdhPOo2GrnS`) → `{"error": "Failed to list projects."}` |

D3 previously rested on a single observation — `list_teams` returns empty —
which is consistent with both "wrong account" and "no teams". Passing the
founder's real org ID directly **distinguishes those cases**: the MCP is
authenticated to a principal that cannot see this org at all. D3 is confirmed
rather than merely restated.

**Consequence for this release:** no remote preview URL can be produced from
this session. The Vercel **CLI** works (`domains ls` re-confirmed B2 at **0
domains**), but deploying is outward-facing and founder-gated. **The local
production preview is the deliverable**, and it is the identical artifact a
deploy would upload.

### 13.2 Playwright — ✅ used, and it found the release's two real defects

| | |
|---|---|
| **What it did** | A new `scripts/capture-release-preview.mjs` sweeping **10 routes × 5 breakpoints**; the full suite; end-to-end exercise of the booking form |
| **Files improved** | `src/content/work.ts` (grid order), `scripts/capture-release-preview.mjs`, `tests/e2e/work.spec.ts` |

Two findings, both of which only a rendered page could produce:

1. **The `/work` grid was interleaved wrong.** With demonstrations appended
   last, the page rendered three image cards → five text-only tiles → two more
   image cards. The rhythm broke in the middle, and the ordering contradicted
   the lede directly above it, which introduces the kinds as client →
   demonstration → internal. Reordered; **asserted by test** so it cannot drift.
2. **The served build was stale.** A byte count corrected in source
   (429,197 → 429,734) still rendered its old value. This is the
   Windows/OneDrive `next start` hazard this repository has documented twice,
   and it would have shipped a screenshot matrix of the *previous* build as the
   release preview. Stopped by PID from `netstat`, rebuilt, recaptured.

**The booking form was exercised rather than read**: native validation blocks an
empty submit and stays on `/book`; a filled submit composes
`?name=…&email=…&a1=<sector + bottleneck + notes>&utm_source=sheetflow-site`,
carrying attribution and no identity beyond what the visitor typed.

### 13.3 Direct HTTP — ✅ used for the whole verification surface

Every SEO and governance claim in the release notes was read off the running
build rather than from source: sitemap (21 URLs, `/book/confirmed` correctly
absent), robots, per-route canonical/description/OG/Twitter/H1 counts, all
OG image routes (200, `image/png`), icons, manifest, and a JSON-LD audit of
**all ten case studies** confirming the three evidence kinds behave differently
in exactly the intended way.

It also caught a nuance worth recording: **`NEXT_PUBLIC_SITE_URL` is not set
locally**, so the build uses the code's fallback, `https://sheetflow.ai`. The
canonical host is therefore already correct in code — B2 is purely an
environment and DNS matter, not a code change. See `BLOCKERS.md`.

### 13.4 Netlify MCP — ❌ not re-read

Enumerated decisively in Phase Z (§11.1) and nothing this session changed a
deployment. Re-calling it would be tool theatre.

### 13.5 GitHub MCP — ⛔ re-tested, still auth-gated

Unchanged: *"Incompatible auth server: does not support dynamic client
registration."* This is an OAuth capability mismatch, not a login prompt, and a
non-interactive session cannot complete it. **It requires the founder to
authorise the connector**; it is not something this session can route around.
No GitHub work was needed this release.

### 13.6 Context7 — ❌ available, nothing to resolve

The work was a content-array reordering, a capture script, one test, and
Markdown. No unfamiliar library API was touched. Calling it to satisfy a mandate
is the tool theatre this report exists to prevent.

### 13.7 Magic MCP / 21st.dev — ❌ not exposed to this session

Not installed; they require an API key (D15). **No UI component was authored
this release**, so there was nothing to source from them even had they been
available — the one change to `/work` was the *order* of existing cards.

### 13.8 chrome-devtools MCP — ❌ not exposed, and not needed

Performance work used the repository's own calibrated CDP tooling and
Lighthouse. A second path to the same protocol would produce numbers that cannot
be compared with the recorded baselines — the same reasoning as §3.1, unchanged.

### 13.9 Adobe / Canva / Figma — ❌ not used, deliberately

No new imagery was produced this release. The existing portfolio frames are
**evidence**: their value is that a reader can open the live build and see the
same thing, so any enhancement would make them diverge from the artifact they
corroborate. The one image change this session was the *removal* of a capture
artifact — the custom cursor, hidden during screenshotting because a synthetic
mouse parks it mid-viewport and it had landed on a spec-table label.

That is an image improvement made by fixing the capture, not by editing a
picture, which is the correct place to fix it.

### 13.10 Airtable, Calendly, Slack, Notion, Gmail, Drive, ElevenLabs — ❌ no need

Calendly was read decisively in Phase K and the event type is unchanged; the
booking hand-off was verified against the **rendered form** this session, which
is the stronger check. The rest have no build or verification role here.

## 14. Open-source reuse in RC1

**Zero, and there was nothing to evaluate.** No UI component was authored — the
release changed the order of existing cards, added one test, and added one
capture script. `OPEN_SOURCE_MANIFEST.md` records the standing evaluation and
its licensing findings are unchanged.


### 13.11 A note on what the tooling could *not* tell us

Three of RC1's four findings came from **rendering the site and measuring it**,
not from any MCP:

- The clipped `/work` cards were found by comparing a card's box to its grid's
  box at three phone widths. A document-level overflow audit — the obvious
  automated check, and one this session actually ran — reported **clean**,
  correctly, because `overflow-x: clip` had already swallowed the evidence.
- The broken tablet navigation was found by *looking at an 810px screenshot*.
- The stale-build problem was found by reading a byte count off an image and
  recognising it as the pre-correction value.

**None of these is reachable by adding a tool.** They are reachable by rendering
the artifact at widths nobody had rendered it at, and then measuring the right
thing. That is the argument for a release pass existing as a distinct phase,
and it is the honest counterweight to a report that otherwise enumerates
servers.

The one genuinely tool-shaped finding — that the Vercel MCP cannot see the
founder's org even when handed its ID — was a **re-test of a recorded failure**,
which is the discipline Phase Z added and the only reason it was attempted at
all.
