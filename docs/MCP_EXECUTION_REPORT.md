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
