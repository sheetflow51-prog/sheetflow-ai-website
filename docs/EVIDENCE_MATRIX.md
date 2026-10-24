# Evidence Matrix

> Built **2026-08-08** (Phase M), before any case study was written, as the
> founder instructed. **Extended and corrected 2026-08-08 (Phase Y)** after a
> second forensic sweep that searched the whole workstation rather than the
> project folder, and **again in Phase Z** after the Netlify account was
> enumerated for the first time — see §0b.
>
> Every row was verified by direct HTTP fetch, CLI query, MCP call or filesystem
> read. Nothing here is recalled from a previous phase without re-checking —
> which is how Phase Y found that **two Phase M conclusions were wrong**.
>
> **Proof status vocabulary**
> - **Verified** — a live artifact returns 200, SheetFlow's authorship is
>   corroborated by a repository or deployment under the founder's own account,
>   and the technical claims are readable from the artifact itself.
> - **Partially Verified** — the artifact is live and real, but at least one of
>   *authorship*, *engagement status* or *currency* could not be confirmed from
>   evidence available to this session.
> - **Internal Only** — real work, real artifacts, but nothing a visitor can
>   open. Publishable as description; not publishable as a link.
> - **Excluded** — did not meet the bar. Reason given.

---

## 0. Phase Y — what the second sweep changed

Phase M searched OneDrive. Phase Y searched `C:\Users\pc` entire, and the
difference is **five substantial systems that no previous phase had seen**,
totalling roughly **13,800 lines** of production-shaped code.

Two Phase M findings were also **overturned**:

| Phase M said | Phase Y found | How |
|---|---|---|
| Manus prototype is **dead**, DNS does not resolve | **HTTP 200, 369,848 bytes**, real Elevate WPC showcase | Re-fetched with redirects followed. The original `000` was a transient connection failure recorded as fact from one attempt |
| `sheetflow-ai-ca` is *"a stated intention, not a system"* | The system **exists on disk** — 1,739 lines, 21 passing tests | Found at `C:\Users\pc\Desktop\whatsapp-accounting-os`, outside every previously searched path |

The Manus error is worth naming precisely, because this repository has a
standing rule about it: **a single failed measurement is not a finding.** Phase M
applied that discipline to Lighthouse scores and not to HTTP requests. The same
class of error recurred inside Phase Y's own test run — `r3s-realty-agra`
returned `ECONNRESET` once and 200 on re-run — which is the evidence that this
is a property of the network, not of the sites.

---

## 0b. Phase Z — the Netlify account, and what owning the host proves

Phase M recorded Netlify as a **named coverage gap**: the MCP returned 502, no
CLI existed, and the three known URLs were verified individually by fetch. The
gap was stated honestly and left open.

**It was a single failed request.** Retried this phase, the same MCP answered
immediately — `get-user` then `get-projects`. That is the third time this
repository has recorded a transient network result as a standing conclusion
(§2.12, and Phase Y's own `ECONNRESET`). The rule was already written down. It
now has a third instance behind it, and the lesson is narrower than "retry":
**a capability recorded as unavailable should be re-tested each phase**, because
nothing about the earlier failure said it was permanent.

### The account

`sheetflow51@gmail.com` · "Sheet Flow" · account `69da02b03c37820d217518b9` ·
**4 projects**, all current, none password- or SSO-protected:

| Netlify project | Primary URL | State | Known before? |
|---|---|---|---|
| `ak-dental-demo` | `ak-dental-demo.netlify.app` | ready | yes (§2.6) |
| `keen-griffin-feb211` | `keen-griffin-feb211.netlify.app` | ready | yes (§2.6) |
| `r3s-realty` | `r3s-realty.netlify.app` | ready | yes (§2.2) |
| **`radiant-lollipop-6e4d44`** | `radiant-lollipop-6e4d44.netlify.app` | ready | **no — in no inventory** |

**The coverage gap is closed.** Every Netlify deployment belonging to this
workspace is now enumerated at the account level rather than guessed at from a
supplied list, and the enumeration found exactly one artifact the founder's own
inventory had omitted.

### `radiant-lollipop-6e4d44` — found, assessed, excluded

HTTP 200, 72,685 bytes, `<title>UGC NET Sociology · Master Prep</title>` — a
study-preparation site. Real and live, and **not portfolio material for an
automation business**: it is neither client work nor a business system, and it
exercises no service SheetFlow sells. Recorded here so the next sweep does not
have to rediscover it and wonder.

### What account ownership actually proves — and what it does not

This is the finding that changed what may be published.

Authorship has been the binding constraint throughout. It is why Elevate WPC
stays off `/work` despite two live artifacts (§2.5): the Google Sites build
matches **nothing in any account under the founder's control**, so there is no
evidence connecting it to SheetFlow beyond assertion.

The clinic demos are the opposite case. They are **deployed from SheetFlow's own
Netlify and GitHub Pages accounts** — control of the deploying account is direct
evidence of authorship, and it is exactly the evidence Elevate WPC lacks.

What it does **not** prove is a commission. Hosting a build says who made it, and
says nothing about whether anyone asked for it or paid for it. Those are two
separate questions, and Phase M/Y collapsed them: because the demos could not be
shown to be *engagements*, they were withheld entirely, which understated the
portfolio by omitting verified work rather than by overstating it.

**Both questions are now answered separately in the type system.** `ProjectEvidence`
carries a third variant, `demo`: reachable and ours, with no commission implied.
It emits `url` and `image` and **no `about` Organization** — the node that would
assert the named practice engaged us — and a test asserts that absence. See §2.16.

### 2.16 — the two demonstration builds now published, and the one still not

| Build | Evidence of authorship | Complete? | Shipped |
|---|---|---|---|
| **Dr. A.K Gupta Dental** | Netlify project `ak-dental-demo`, own account | ✅ real contact number, working form | ✅ `/work/ak-dental-diagnostic-centre` |
| **Align Dental Care** | Own GitHub Pages + 1,326 lines of source on disk | ✅ real number, address, full data model | ✅ `/work/align-dental-system` |
| **Krishna Dental Clinic** | Netlify project `keen-griffin-feb211`, own account | ❌ **no** — see below | ❌ still excluded |

**Krishna Dental is excluded on new evidence, and on better grounds than before.**
Phase Y excluded it because its URL was an auto-generated subdomain — a signal
about *engagement status*, which the `demo` variant now handles. That reason no
longer disqualifies it. This one does:

- Its WhatsApp link is **`wa.me/91XXXXXXXXXX`** — an unreplaced placeholder. A
  visitor who clicks it reaches nothing.
- It contains **no form** (`<form>` count: 0), where AK Dental has a working one.

It is an unfinished template rather than a finished demonstration, and publishing
it would advertise a broken contact path on a page carrying a real clinic's name.
Revisit if the placeholder is replaced.

**Two new technical findings**, both read off the live artifacts this phase:

- **AK Dental is 88% photograph.** Of 429,734 bytes served, **379,084 are five
  base64-inlined JPEGs**; styles are 22 kB and scripts 8 kB. The build is a
  genuinely single portable file, at the cost of images no browser can cache
  separately or serve responsively. Published with the trade-off stated, not
  hidden.
- **Align Dental labels itself.** Its hero carries a badge reading *"Premium
  website demo for clinic sales"*. The build's own words corroborate the
  classification — the strongest available evidence that calling it a
  demonstration is a description rather than a hedge.

---

## 1. The matrix

**Legend** — Cat: category · Auto: automation · AI: AI components · Arch:
architecture documented · Doc: written documentation · Portfolio: shipped state.

### 1.1 Live artifacts

| # | Project | Cat | Live URL | HTTP | GitHub | Shots | Dash | CRM | Auto | AI | Arch | Doc | Proof | Portfolio | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Saraswati Dental Clinic** | Client site | `saraswati-dental-clinic.vercel.app` | ✅ 200 · 117,931 B | ✅ public | ✅ | ✅ | ✅ Airtable | ✅ n8n | — | ✅ | ✅ | **Verified** | ✅ `/work/saraswati-dental-clinic` | Dashboard runs on **seeded data** — must be called a demonstration (§2.3). Mirrored on GitHub Pages (§2.1) |
| 2 | **SPARC Physiotherapy** | Client site | `sparc-physiotherapy.vercel.app` | ✅ 200 · 56,143 B | ✅ public | ✅ | — | — | — | — | ✅ | ✅ | **Verified** | ✅ `/work/sparc-physiotherapy` | Source repo lives in `Downloads/Dr. Manish Sharma (SPARC)/website` |
| 3 | **R³S Realty** | Client site | `r3s-realty-agra.vercel.app` | ✅ 200 · 7,324 B | ✅ public | ✅ | — | — | — | — | ✅ | ✅ | **Verified** | ✅ `/work/r3s-realty` | Canonical of **three** hosts. GSC-verified. See §2.13 |
| 4 | **Elevate WPC (Google Sites)** | Client site | `sites.google.com/view/elevate-wpc` | ✅ 200 · 257,632 B | ❌ | ❌ | — | — | — | — | ❌ | ❌ | **Partially Verified** | ❌ **authorship unverified** | Google Sites build matching nothing in this account |
| 5 | **Elevate WPC — Manus prototype** | Prototype | `elevatewpc-gd3vgq9r.manus.space` | ✅ **200 · 369,848 B** | ❌ | ❌ | — | — | — | — | ❌ | ❌ | **Partially Verified** | ❌ **authorship unverified** | **Phase M called this dead. It is not** (§2.12) |
| 6 | **Dr. A.K Gupta Dental** | Demo | `ak-dental-demo.netlify.app` | ✅ 200 · 429,734 B | ❌ | ✅ | — | — | — | — | ✅ | ✅ | **Verified — demo** | ✅ `/work/ak-dental-diagnostic-centre` | **Authorship established Phase Z**: Netlify project `ak-dental-demo` on SheetFlow's own account. Uncommissioned — ships as `demo`. 88% base64 photography (§2.16) |
| 7 | **Krishna Dental Clinic** | Demo | `keen-griffin-feb211.netlify.app` | ✅ 200 · 30,367 B | ❌ | ❌ | — | — | — | — | ⚠️ | ❌ | **Partially Verified** | ❌ **incomplete build** | Authorship established (own Netlify account), but **`wa.me/91XXXXXXXXXX` placeholder and no form** — unfinished, not publishable (§2.16) |
| 8 | **Align Dental Care** | Demo | `sheetflow51-prog.github.io/dental-demo/` | ✅ 200 · 498 B HTML + **381 kB assets** | ✅ public | ✅ | — | — | — | — | ✅ | ✅ | **Verified — demo** | ✅ `/work/align-dental-system` | Real Vite SPA, 1,326 lines of source at `C:\Users\pc\Align Dental`. **Self-labelled** "Premium website demo for clinic sales" (§2.16) |
| 8b | **UGC NET Sociology Prep** | Other | `radiant-lollipop-6e4d44.netlify.app` | ✅ 200 · 72,685 B | ❌ | ❌ | — | — | — | — | ❌ | ❌ | **Excluded** | ❌ not automation work | **Found by Phase Z account enumeration; in no inventory.** Real and live, but neither client work nor a business system (§0b) |

### 1.2 Internal builds — real systems, nothing a visitor can open

| # | Project | Cat | Code | Tests | Dash | CRM | Auto | AI | Arch | Doc | Git | Proof | Portfolio | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 9 | **WhatsApp Accounting OS** | Financial systems | **1,739 TS** | ✅ **21/21 pass** | — | — | ✅ | ✅ Gemini | ✅ | ✅ `CLAUDE.md` | ❌ | **Internal Only** | ✅ `/work/whatsapp-accounting-os` | **Strongest engineering found.** The implementation of the repo excluded in §2.8 (§2.9) |
| 10 | **WPC Design Automation** | Manufacturing AI | **2,446 PY** | ❌ none | ✅ 1.4 MB gallery | — | ✅ **strong** | — | ✅ | ✅ manifest | ❌ | **Internal Only** | ✅ `/work/wpc-design-automation` | Not a client engagement — outreach kit, not a delivery note (§2.4) |
| 11 | **Outbound Lead Engine** | Sales automation | **6,928 PY** | ⚠️ `tests/` present, **not run** | — | ✅ sheet CRM | ✅ **strong** | ✅ Claude | ✅ | ✅ 2 system docs | ❌ | **Internal Only** | ✅ `/work/outbound-lead-engine` | Sends from real mailboxes; `auto_send_replies` is `false` in committed config |
| 12 | **AI Voice Receptionist** | Voice AI | **1,487 JS** | ❌ none | — | — | ✅ | ✅ OpenRouter + ElevenLabs | ✅ | ✅ deploy runbook | ❌ | **Internal Only** | ✅ `/work/ai-voice-receptionist` | **README is stale** — claims Polly + Gemini; code uses ElevenLabs + GPT-4o-mini. Case study describes the code |
| 13 | **Bank Statement Parser** | Document AI | **1,222 PY** | ❌ none | — | — | ✅ | ✅ OCR + Anthropic | ✅ | ⚠️ docstring | ❌ | **Internal Only** | ✅ `/work/bank-statement-parser` | 🔐 Output holds **real financial PII** — described, never screenshotted (§4.7) |
| 14 | **Saraswati Airtable CRM** | CRM | — | — | — | ✅ **4 tables** | ✅ n8n | — | ✅ | — | — | **Internal Only** | ❌ auth-walled | 🔐 Plaintext WhatsApp token in `Settings` (§2.7) |

### 1.3 Evaluated and rejected

| # | Project | Cat | Evidence found | Proof | Why rejected |
|---|---|---|---|---|---|
| 15 | **AI Content Engine** | Content automation | 6,272 PY, 20 agents | **Internal Only** | Real code, but **unrunnable as found** and 🔐 ships a live API key — see §2.11 |
| 16 | **PMA Automation Agency** | Sales collateral | 4 prompt docs + **22-line** demo | **Excluded** | Not a system. 🔐 Hardcoded live Twilio credentials — see §2.10 |
| 17 | **OpenClaw** | Agent scaffold | 318 lines across 16 files | **Excluded** | Skeleton — config and empty module structure, no working pipeline |
| 18 | **Sheetflow_Strategy** | Strategy doc | 1 markdown file | **Excluded** | A document, not a build |
| 19 | **AAA-Client-Work** | Sales collateral | Outreach scripts, prospect list | **Excluded** | Internal sales material. Also the source of the CRM ledger contradiction (D24) |
| 20 | **AI_Workspace (ChatGPT)** | Context store | `context/` only | **Excluded** | No code |
| 21 | **`sheetflow-ai-ca`** | Repo | 1 KB — README and `.gitignore` | **Excluded as a repo** | Empty. **But its subject matter exists as #9** — see §2.9 |
| 22 | **Align Dental** | Client site source | React/Vite source for #8 | **Merged into #8** | Source of the `dental-demo` deployment, not a separate project |

---

## 2. Findings that change what may be published

### 2.1 The two Saraswati builds are the same file, not an old one and a new one

The founder listed `sheetflow51-prog.github.io/saraswati-dental-clinic/` as the
"Older Saraswati Build". It is not older. Both hosts return **md5
`baf6589c1b7ff9cb185e0fe178b48674`** — byte-for-byte identical.

It is **one artifact on two hosts**, and presenting it as a second project, or
as evidence of iteration over time, would be a fabricated claim about work that
did not happen. It is recorded here as a mirror.

### 2.2 R³S Realty exists in three places, and only one is canonical

| Host | Bytes | md5 | Note |
|---|---|---|---|
| `r3s-realty-agra.vercel.app` | 7,324 | `641c6e13…` | **Canonical.** Declares `<link rel="canonical">` to itself, carries a Google Search Console verification token |
| `r3s-realty.netlify.app` | 70,146 | `5924740a…` | **A different build** — different `<title>`, different markup |
| `r3s-realty.vercel.app` | — | — | Second Vercel project, same account |

These are not mirrors; the Netlify build is a genuinely different artifact. The
shipped case study links the **canonical, GSC-verified** one, which is correct
and should not change.

### 2.3 The Saraswati dashboard runs on fictional data — and that is the right call

The dashboard at `/dashboard.html` is a real CRM surface: Chart.js status and
source charts, a six-column Kanban lead pipeline (New → Contacted → Appointment
Booked → Treated → Follow-up → Closed), and an appointments list.

Its data is **hardcoded in a `LEADS` array** with placeholder names (Priya
Sharma, Rahul Verma…) and sequential fake phone numbers (`9012345678`,
`9898989898`, `9111112345`).

This matters twice:

1. **The case study must call it a demonstration.** It is not a live system
   managing real patients, and describing it as one would be the exact
   fabrication the standing rule forbids.
2. **Shipping it with fictional data was the correct engineering decision.** The
   page is publicly reachable at a guessable URL with **no authentication**. Had
   it carried real patient names, phone numbers and treatment types, that would
   be a live personal-data exposure under the DPDP Act. It does not. This is
   worth stating in the case study as a security decision, because it reads as a
   shortcut and is actually the opposite.

### 2.4 WPC Design Automation is strong work, and it is not a client engagement

`C:\Users\pc\Desktop\WPCDesign_Automation` — **2,446 lines of Python** across
`orchestrator.py` (1,261), `vector_compiler.py` (869) and `catalog_pdf.py` (316).

Verified capability, read from the code and the run manifest:

- Compiles one source image into a **15-size door matrix** (30/32/36 in widths ×
  72–84 in heights), at a single uniform scale factor across both axes
- Emits four production roles per size — `Toolpath.svg`, `Print.jpg`,
  `Varnish.png`, `Catalog.pdf` — under an explicit, documented naming contract
- Targets **VCarve / ArtCAM**, 6 mm tool at 3 mm cut depth
- **Spot-UV varnish masking** with a `multiband` HSV band-segmentation engine,
  configured per design
- **Atomic delivery**: bundles stage to `.partial` and are renamed into place
  only after `verify_bundle()` passes, so an interrupted run never overwrites a
  good production pack with a truncated one
- **Idempotent**: `is_new_or_changed()` / `bundle_covers()` skip unchanged work
- **Dry-run throughout**: every destructive path takes `preview_only`
- Legacy artifact migration, with the rationale written into the constant

Seven production bundles exist in `outputs/`, plus a real compiled sample:
`SheetFlow_ComplexJali_914x2134mm_Toolpath.svg` — **250 closed contours** at
914.4 × 2133.6 mm.

**But `_SamplePass_ComplexJali/SamplePass_Outreach.md` is a prospecting kit**,
not a delivery note. It contains `[Name]` and `[day/date]` placeholders and opens
*"following up on my message from…"*. This is a sales asset addressed to a
prospect who has not replied.

**Therefore:** publishable as **SheetFlow's own capability**, with the artifacts
as evidence. **Not** publishable as work delivered for a named client. That
distinction is consistent with the founder's own CRM ledger (0 clients closed)
and is the boundary D24 already draws.

### 2.5 Elevate WPC — D27 is partly resolved, and partly not

The founder's earlier position (D27) was that Elevate WPC had *no verifiable
artifact*. That is now **false in one direction and still true in the other**:

- ✅ The business is **real and live**: a Google Sites presence for a bulk WPC
  door and PVC wall-panel supplier in Agra, with four product lines.
- ❌ The Manus prototype is **dead** — `elevatewpc-gd3vgq9r.manus.space` fails
  DNS resolution entirely (curl exit, HTTP `000`).
- ❌ **SheetFlow's authorship is unverified.** The live site is built on *Google
  Sites*, not on anything in this account's repositories or deployments, and
  nothing found this session establishes who assembled it.

A case study claiming SheetFlow *built* Elevate WPC cannot be supported by
current evidence. What **can** be supported is the WPC Design Automation
pipeline (§2.4), which is the same product domain and is genuinely SheetFlow's.

### 2.6 Two additional named clinics exist, and both URLs say "demo"

| Business | Host | Bytes |
|---|---|---|
| **Dr. A.K Gupta Dental & Diagnostic Centre**, Tundla UP | `ak-dental-demo.netlify.app` | 429,734 |
| **Krishna Dental Clinic**, Tundla Agra | `keen-griffin-feb211.netlify.app` | 30,367 |

Both are live, distinct builds naming **real third parties**. Two cautions:

1. The first is literally named `…-demo`; the second still sits on Netlify's
   **auto-generated subdomain** (`keen-griffin-feb211`), which is what a project
   looks like when nobody ever came back to name it. Neither is evidence of a
   delivered, accepted engagement.
2. D24 recorded founder permission covering the **three shipped** case studies.
   These are **two further named businesses**. The founder's instruction of
   2026-08-08 extends that permission and is recorded as such — but the consent
   still comes **from the founder, not from the clinics**. §4 keeps that
   reopenable.

### 2.7 The Airtable CRM is real, is not linkable, and holds a credential in plaintext

Base `appuxtTu2dcwAj6nE` — **Saraswati Dental Clinic CRM**, four tables:

| Table | Purpose |
|---|---|
| **Leads** | Full pipeline — WhatsApp number, source, status, assigned-to, follow-up dates, WhatsApp history, and a `Last Modified` formula field **explicitly documented as the n8n Airtable Trigger for WF3 (status change) and WF5 (post-treatment)** |
| **Appointments** | Confirmed bookings |
| **Follow-up Log** | Automation history — action, channel, message sent, status |
| **Settings** | Clinic configuration **and integration credentials** |

Two consequences:

1. **The URL cannot be published as proof.** The link the founder supplied is an
   authenticated *workspace* URL (`airtable.com/app…/tbl…/viw…`), not a public
   share (`airtable.com/shr…`). Fetched anonymously it returns a sign-in wall.
   A visitor clicking it from the portfolio sees a login screen, not evidence.
2. 🔐 **Security — worth the founder's attention.** The `Settings` table stores
   **`WhatsApp Access Token`** and **`n8n Webhook URL`** as plain
   `singleLineText`. The anonymous fetch showed **no token-shaped string**, so
   nothing is leaking publicly today and there is no live incident. But a Meta
   WhatsApp Business API token sitting in a CRM table is readable by every base
   collaborator and every automation with base scope. It belongs in n8n's
   credential store. **The link the founder pasted points directly at this
   table** — worth knowing before it is shared with anyone again.

### 2.8 Excluded, with reasons

| Item | Why excluded |
|---|---|
| **`sheetflow-ai-ca`** (private repo) | **1 KB total — `README.md` and `.gitignore`, no code, no languages detected.** The repository is empty and stays excluded *as a repository*. **But see §2.9: the system it describes was found implemented elsewhere.** |
| **Elevate WPC Manus prototype** | ~~Dead — DNS does not resolve.~~ **This was wrong. Corrected in §2.12.** |

---

### 2.9 The empty repo describes a system that exists — 1,739 lines of it

`sheetflow-ai-ca`'s README describes *"AI Chartered Accountant for Indian
cash-based businesses. WhatsApp-first, Hindi/Hinglish support, deterministic
accounting engine with AI insights."* Phase M read that, found no code in the
repo, and excluded it as an intention.

**The implementation is at `C:\Users\pc\Desktop\whatsapp-accounting-os`** — a
path no earlier sweep covered. It matches the description clause by clause:

| README claim | Implementation |
|---|---|
| WhatsApp-first | `src/webhook/index.ts` — 197 lines, Express gateway |
| Hindi/Hinglish | `src/parser/index.ts` — Devanagari digit normalisation, Indian-scale multipliers (`k`/`hazaar`/`lakh`), `ko`/`se` counterparty constructions |
| Deterministic accounting engine | `src/ledger/engine.ts` — 438 lines, double-entry, PostgreSQL `NUMERIC(15,2)`, BigInt paise, no float on the money path |
| AI insights | `@google/generative-ai` — and **only** for insights; the model has no write path |

**Verified by execution**, not by reading: `npm run test:staging` on 2026-08-08
returned **21 passing, 0 failing** across 5 suites.

The engineering is the strongest in the workspace. Three things stand out:

1. **The Shadow Staging Rule.** Parser output can only reach a staging table.
   The single function that writes to the ledger takes *human-confirmed* values
   and re-derives nothing from the parsed row. An AI misreading is a queue item,
   never a ledger entry.
2. **Money never becomes a float.** BigInt paise in the parser, exact decimal
   strings across the boundary, `NUMERIC` arithmetic in PostgreSQL. The amount
   pattern rejects signs and exponent notation so a malformed value fails in
   application code rather than as a database cast error.
3. **`SELECT … FOR UPDATE` on the staging row.** Two verification taps on the
   same message cannot double-post; the loser blocks, then reads `COMMITTED` and
   refuses.

**Published as `/work/whatsapp-accounting-os`**, labelled an internal build.
No client, no engagement, no metric.

---

### 2.10 🔐 Security — two live credentials found in plaintext on disk

Neither is a public leak. Both are in files on the founder's machine, and
neither directory is a git repository, so nothing has been pushed anywhere.
**Both should still be rotated**, because a credential in a file is a credential
in every backup, sync target and screen share that file has ever been in — and
one of these directories is inside OneDrive.

| Credential | Location | Risk |
|---|---|---|
| **Twilio Account SID + Auth Token** | `OneDrive/Desktop/PMA_Automation_Agency/twilio-demo/call.js` — hardcoded as string literals | A live auth token permits placing calls and SMS billed to the account. The file also contains the founder's **personal mobile number**. **Also present in a second copy** at `Downloads/AI_Projects/PMA_Automation_Agency` |
| **Groq API key** | `OneDrive/Desktop/AI_MASTER_WORKSPACE/ai_content_engine/config.json` — `llm.api_key`, alongside a comment reading *"All YOUR_* values are safe placeholders"* | A real key sitting where the file's own comment implies only placeholders live. Also `data/youtube_client_secrets.json` holds OAuth client secrets |

Both sit **inside OneDrive** and are therefore synced to Microsoft's servers and
present in file version history.

**Recommended, in order:** rotate the Twilio auth token in the Twilio console;
revoke the Groq key; move both to `.env` files; delete the duplicate
`PMA_Automation_Agency` copy in Downloads.

This is the **third** credential-handling finding across two phases — the
Airtable WhatsApp token (§2.7) was the first. That is a pattern rather than
three accidents, and it is worth a standing habit: no key in any file that is
not `.env`, and `.env` in `.gitignore` before the first key goes in.

---

### 2.11 AI Content Engine — real code, and it does not run as found

`ai_content_engine` is **6,272 lines of Python across 20 agents** — trend
scraping, scripting, SEO, media generation, thumbnails, shorts, distribution,
engagement, analytics and an optimiser, behind an 11-step pipeline with a
documented CLI covering per-step and per-mode execution. On line count it is the
second-largest system in the workspace.

It is **not published**, for reasons that are about the artifact and not about
ambition:

1. **It cannot run as found.** `config.json` still carries `YOUR_YOUTUBE_API_KEY`,
   `YOUR_TWITTER_API_KEY` and the rest as literal placeholders. Only the LLM key
   is populated — and that one should not be (§2.10).
2. **There is no output to show.** `outputs/` holds two temporary `concat_*.txt`
   files. No video, no thumbnail, no published post. A content engine's evidence
   is content, and there is none.
3. **The claim it would make is a claim about distribution**, and publishing an
   unrun pipeline as portfolio work would assert a capability whose only proof is
   that the code compiles.

**Reassess when a run produces artifacts.** The architecture is genuinely
substantial and this exclusion is about evidence, not quality.

---

### 2.12 Correction — the Manus prototype is alive

Phase M recorded `elevatewpc-gd3vgq9r.manus.space` as **dead**, citing DNS
failure and HTTP `000`, and excluded it on that basis.

**Re-tested 2026-08-08 with redirects followed:**

```
http=200  size=369848  redirect=(none)  time=2.29s
<title>Elevate WPC - Premium WPC Products Showcase</title>
```

It is a live Vite-built single-page showcase with a PWA manifest, hosted on the
Manus platform. The `000` in Phase M was a **transient connection failure
recorded as a finding from a single attempt.**

What this does *not* change: **SheetFlow's authorship is still unverified.** The
build carries Manus platform instrumentation and nothing tying it to this
account. Both Elevate WPC artifacts stay out of the portfolio for the same
reason as before — not because they are dead, but because we cannot show we
built them.

**The lesson is the transferable part.** This repository already holds a
standing rule that a single measurement is not a finding; Phase M applied it to
Lighthouse and not to `curl`. Phase Y hit the identical failure mode again when
`r3s-realty-agra` returned `ECONNRESET` in the test suite and 200 on re-run.
**Network checks now get a retry before they get a conclusion.**

---

### 2.13 Duplicate deployments, reconciled

| Artifact | Hosts | md5 | Reconciliation |
|---|---|---|---|
| **Saraswati Dental** | `saraswati-dental-clinic.vercel.app`, `sheetflow51-prog.github.io/saraswati-dental-clinic/` | both `baf6589c…` | **Byte-identical mirror.** Vercel is canonical (§2.1) |
| **R³S Realty** | `r3s-realty-agra.vercel.app`, `r3s-realty.vercel.app` | both `641c6e13…` | **Byte-identical mirror — newly confirmed this phase.** Phase M listed the second as "a second Vercel project" without hashing it |
| **R³S Realty (Netlify)** | `r3s-realty.netlify.app` | `5924740a…` | **A genuinely different build**, 70,146 B against 7,324 B. Not a mirror. Superseded — the Vercel build carries the canonical tag and the Search Console token |
| **PMA Automation Agency** | OneDrive Desktop + `Downloads/AI_Projects/` | identical trees | Duplicate copy. Both excluded; both carry the Twilio credential (§2.10) |

**Portfolio links only the canonical of each.** No mirror is presented as a
separate project.

---

### 2.14 Byte size is the wrong measure for a single-page app

`align-dental` was recorded in Phase M as **"✅ 200 · 498 B"** and carried into
Phase Y's first draft as a *"498-byte shell"*. Both readings were wrong, and the
cause is methodological rather than careless.

498 bytes is exactly what a correct Vite `index.html` weighs. Fetching the
referenced assets:

| Asset | Status | Bytes |
|---|---|---|
| `assets/index-B4SAIiX_.js` | 200 | **349,811** |
| `assets/index-BLqF-mwx.css` | 200 | **31,419** |

It is a **real React application of roughly 381 kB**, which renders entirely
client-side. The document is small *because* the app is a SPA.

**The general fault:** this audit verified deployments by `curl` + byte count,
which measures the HTML document only. For a server-rendered page that
approximates the content. For a client-rendered page it measures the loader and
reports the application as empty. Every "bytes" figure in §1.1 should be read as
*document size*, not as *content size* — and the two static-HTML clinic sites are
the only rows where those coincide.

**What it does not change:** align-dental stays out of the portfolio. It carries
no client name (its `<title>` is the slug `align-dental`), and it is a demo. That
was always the disqualifier; "empty shell" was a wrong reason attached to a right
conclusion, which is its own kind of error.

### 2.15 Version control — five substantial systems have none

Seven git repositories exist on the machine. Five are the founder's project
repos (all client sites), two are vendored third-party skill libraries.

**None of the five internal systems is under version control** — not
`whatsapp-accounting-os`, `WPCDesign_Automation`, `AI_Workspace`,
`ai_content_engine` or `ai-voice-receptionist`. That is **13,822 lines with no
history, no branches and no remote**, several of which sit in OneDrive where a
sync conflict is the only thing resembling a backup.

Not a portfolio finding — it changes nothing about what may be published. It is
the highest-value non-website engineering action available, and it is named here
because Phase Y is the phase that counted the lines.

---

## 3. Discovery coverage — what was actually searched

| Source | Method | Result |
|---|---|---|
| **Vercel** | `vercel projects ls` | **5 projects**, all accounted for above. No Elevate WPC — D27's original finding stands for Vercel |
| **GitHub** | `gh repo list` (authenticated as `sheetflow51-prog`) | **6 repos** — 5 public, 1 private. The private one is `sheetflow-ai-ca` (excluded, §2.8) |
| **GitHub Pages** | direct fetch ×2 | Both live; one is a byte-identical mirror (§2.1) |
| **Netlify** | direct fetch ×3 (MCP unavailable) | 3 live deployments, all distinct artifacts |
| **Airtable** | MCP `list_bases` → `list_tables_for_base` | **Exactly one base** — the Saraswati CRM (§2.7) |
| **Local workspace** | `find` over `C:\Users\pc` to depth 6 | `WPCDesign_Automation` found on **`C:\Users\pc\Desktop`**, *not* under OneDrive — which is why earlier phases missed it. Also `C:\Users\pc\Downloads\ELEVATE Videos` (not yet assessed) |

**Netlify has no CLI or working MCP in this session**, so the three Netlify URLs
were verified by fetch but the account was **not enumerated**. If further Netlify
deployments exist that the founder did not list, this session did not see them.
That is a real gap in coverage and is named rather than glossed.

### 3.1 Phase Y coverage — the second sweep

| Source | Method | Result |
|---|---|---|
| **Whole-user filesystem** | `find` over `C:\Users\pc` for project-shaped directories, then a source-line census per candidate excluding `node_modules`, `dist`, venvs and site-packages | **Five previously unseen systems**, 13,822 lines. Two roots no prior phase had opened: `C:\Users\pc\Desktop` and `C:\Users\pc` itself |
| **Git repositories** | `find` for `.git`, then `remote get-url` + branch + commit count on each | **7 repos.** 5 founder projects, 2 vendored third-party. **No unknown work** — every founder repo was already in the matrix. The new systems have no repos at all (§2.14) |
| **Vercel** | `vercel projects ls` | **5 projects**, unchanged from Phase M |
| **GitHub** | `gh repo list` | **6 repos** — 5 public, 1 private. Unchanged |
| **Deployments** | `curl` with `-L`, status + byte size + md5 on 9 URLs | **8 live, 1 corrected from dead to live** (§2.12). Two mirror pairs confirmed by hash (§2.13) |
| **Execution** | `npm run test:staging`; `openpyxl` read of the generated workbook | 21/21 tests pass; workbook confirmed as 4 sheets × 264 transactions |

**What Phase Y did not cover**, stated rather than implied:

- **Netlify is still not enumerated.** No CLI, no working MCP. Same gap as
  Phase M.
- **`C:\Users\pc\Downloads\ELEVATE Videos`** remains unassessed — video assets,
  not code, and nothing in the portfolio depends on them.
- **n8n workflows were not read.** `n8n_backup_20260601_203620` exists at the
  user root and the Airtable schema references WF3 and WF5 by name, but the
  workflow definitions themselves were not opened. The automation claims in the
  Saraswati case study rest on the Airtable field descriptions (§2.7), which is
  weaker first-party evidence than the workflows would be.
- **`AI_Workspace/tests/`** exists but was not run. The Outbound Lead Engine's
  test coverage is therefore recorded as *present*, not as *passing* — unlike
  the Accounting OS, whose 21 passes were observed.

---

## 4. Standing conditions

1. **Consent is second-hand.** Every named third party — Saraswati, SPARC, R³S,
   Dr. A.K Gupta, Krishna Dental, Elevate WPC — is named under the *founder's*
   permission, not the client's own. **Reopen on any objection from a named
   party.** This is D24 unchanged, extended to cover the projects added
   2026-08-08.
2. **No outcome metric is published anywhere**, because none has been measured
   and client-confirmed. Every case study reads *"Not publicly disclosed."*
   `Review` and `AggregateRating` remain absent and asserted absent by test.
3. **"Demo" means demo.** Where the artifact's own URL or state indicates a
   speculative build (§2.6), the portfolio must not imply a commissioned
   engagement.
4. **Internal Only means describable, not linkable.** §2.4 and §2.7 may be
   written about and screenshotted. Neither may carry a link presented as proof
   a visitor can check.

   **This is now enforced by the type system**, not by review. `ProjectEvidence`
   in `src/content/work.ts` gives the `internal` variant **no field a URL can be
   typed into**, and a test asserts that internal case studies emit no project
   `url`, no `about` organisation and no `image` in their JSON-LD. Adding a link
   to an internal build is a compile error.

5. **An internal build is never described as client work.** The five systems in
   §1.2 were commissioned by nobody. Each case study says so in its own FAQ, the
   `/work` index distinguishes the two kinds in its opening paragraph, and
   `llms.txt` instructs answer engines not to conflate them — because a model
   summarising the site is exactly where "SheetFlow built an accounting system"
   would quietly become "SheetFlow built an accounting system for a client".

6. **One failed request is not a finding.** Retry before concluding an artifact
   is dead (§2.12). Phase M's Manus exclusion and Phase Y's own `ECONNRESET`
   were the same error twice.

7. **No screenshot of the Bank Statement Parser output.** The verified workbook
   contains real counterparty names, real UPI identifiers and real balances. It
   is cited by row and column count only, and no image of it exists anywhere in
   this repository.

---

## 5. Standing conditions added in Phase Z

8. **A demonstration build may be published; a client claim may not.** Work that
   is ours and reachable but **uncommissioned** ships under `ProjectEvidence`'s
   `demo` variant. It renders a mandatory `basis` sentence **above** the
   screenshot, carries a marker on the `/work` card, and emits **no `about`
   Organization** in its JSON-LD — asserted by test. Naming a practice as a
   client for work nobody commissioned is a test failure, not a review finding.

   The rule this encodes: **"did we build it?" and "did anyone commission it?"
   are separate questions.** Answering the second honestly never required
   declining to answer the first, and treating them as one understated the
   portfolio for two phases.

9. **Account ownership is authorship evidence. It is not commission evidence.**
   Control of the deploying account (Netlify, Vercel, GitHub Pages) establishes
   who made an artifact. It says nothing about who asked for it. Elevate WPC
   fails the first test and is excluded; the clinic demos pass the first and
   fail the second, which is what `demo` exists to express.

10. **Re-test capabilities recorded as unavailable, every phase.** Netlify was
    recorded as ⛔ 502 by Phase M, carried unchanged by Phase Y, and **worked on
    the first call in Phase Z**. A tool failure is a fact about one moment, not
    a property of the tool. This is the same error as §2.12 in a different
    costume, and the third instance in this repository.

11. **When an exclusion rule changes, re-read the artifacts it was excluding.**
    Krishna Dental's stated disqualifier was removed by condition 8, and it was
    still not publishable — for a reason nobody had looked for, because the old
    reason had made looking unnecessary. Reclassifying on a stale note would
    have shipped a real clinic's name above a dead WhatsApp link.

12. **A published figure must come from the artifact, not from a convenient
    read of it.** AK Dental's payload was first recorded as 429,197 bytes — the
    length of the document after newline normalisation by the tool that read it,
    not the 429,734 bytes actually served. Corrected before publication. Byte
    counts are cited from the HTTP response.


---

## 6. Release Candidate 1 — verification of the published surface

RC1 added no evidence and changed no classification. It **re-verified the
published surface against the running production build**, because everything in
§1 is a claim this site makes in public and a claim is only as good as its last
check.

| Surface | Method | Result |
|---|---|---|
| Case-study JSON-LD | Parsed the rendered `@graph` on all **10** routes | 3 client emit `about`; **2 demonstration emit `url` + `image` and no `about`**; 5 internal emit none. Exactly as §2.16 requires |
| `Review` / `AggregateRating` | Regex over all 10 rendered pages | **Zero.** Absent by design, still absent |
| Outbound project links | Sitemap + per-route fetch | 21 sitemap URLs; `/book/confirmed` correctly excluded |
| Social imagery | Fetched 7 OG/Twitter routes | All 200, all `image/png` |
| Per-route metadata | 9 content routes | Exactly 1 JSON-LD block, 1 H1, 1 description, 1 Twitter card, self-canonical — on every one |
| `llms.txt` | Fetched and read | 539 lines; three evidence kinds documented; the stale Phase-K sentence absent |

### The canonical host is already correct in code

Worth recording because it changes what B2 costs. **`NEXT_PUBLIC_SITE_URL` is
not set locally**, so the build falls back to the value hard-coded in
`layout.tsx`, `sitemap.ts`, `robots.ts`, `llms.txt/route.ts` and
`structured-data.ts`: **`https://sheetflow.ai`**.

Every canonical, `og:url`, sitemap `<loc>` and JSON-LD `@id` in the local
production build therefore already points at the intended domain. B2 is a
**domain purchase and one environment variable** — not a code change, and not a
rewrite of the entity graph. See `BLOCKERS.md`.

### Standing condition added

13. **A rendered artifact is evidence only if you know which build rendered it.**
    RC1's first screenshot matrix — 66 images — was captured from a `.next`
    that predated a correction already made in source, because `next start` was
    still serving the old build. It was caught by reading a byte count off a
    screenshot. Before treating any capture, Lighthouse run or manual check as
    evidence, confirm the server is serving the build under test. Stop it by PID
    from `netstat`; `pkill` does not work on this platform.
