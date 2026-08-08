# Evidence Matrix

> Built **2026-08-08**, before any case study was written, as the founder
> instructed. Every row was verified this session by direct HTTP fetch, CLI
> query, MCP call or filesystem read. Nothing here is recalled from a previous
> phase without re-checking.
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

## 1. The matrix

| # | Project | Live URL | HTTP | GitHub | Shots | Dashboard | CRM | Automation | Arch. | Proof |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Saraswati Dental Clinic** | `saraswati-dental-clinic.vercel.app` | ✅ 200 · 117,931 B | ✅ public | ✅ shipped | ✅ **yes** | ✅ Airtable | ✅ n8n | ✅ | **Verified** |
| 2 | **SPARC Physiotherapy** | `sparc-physiotherapy.vercel.app` | ✅ 200 · 56,143 B | ✅ public | ✅ shipped | — | — | — | ✅ | **Verified** |
| 3 | **R³S Realty** | `r3s-realty-agra.vercel.app` | ✅ 200 · 7,324 B | ✅ public | ✅ shipped | — | — | — | ✅ | **Verified** |
| 4 | **WPC Design Automation** | *none* | — | ❌ none | ⚠️ local | ✅ generated | — | ✅ **strong** | ✅ | **Internal Only** |
| 5 | **Elevate WPC** | `sites.google.com/view/elevate-wpc` | ✅ 200 · 257,632 B | ❌ | ❌ | — | — | — | ❌ | **Partially Verified** |
| 6 | **Dr. A.K Gupta Dental** | `ak-dental-demo.netlify.app` | ✅ 200 · 429,734 B | ❌ none found | ❌ | — | — | — | ⚠️ | **Partially Verified** |
| 7 | **Krishna Dental Clinic** | `keen-griffin-feb211.netlify.app` | ✅ 200 · 30,367 B | ❌ none found | ❌ | — | — | — | ⚠️ | **Partially Verified** |
| 8 | **align-dental** | `sheetflow51-prog.github.io/dental-demo/` | ✅ 200 · 498 B | ✅ public | ❌ | — | — | — | ⚠️ | **Partially Verified** |
| 9 | **Saraswati Airtable CRM** | *auth-walled* | 🔒 login | — | ❌ | — | ✅ **4 tables** | ✅ n8n | ✅ | **Internal Only** |
| 10 | **Elevate WPC — Manus prototype** | `elevatewpc-gd3vgq9r.manus.space` | ❌ **000 dead** | ❌ | ❌ | — | — | — | ❌ | **Excluded** |
| 11 | **sheetflow-ai-ca** | *none* | — | 🔒 private | ❌ | — | — | — | ❌ | **Excluded** |

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
| **`sheetflow-ai-ca`** (private repo) | **1 KB total — `README.md` and `.gitignore`, no code, no languages detected.** The description is genuinely compelling ("AI Chartered Accountant… WhatsApp-first, Hindi/Hinglish, deterministic accounting engine"), but it is a stated intention, not a system. Publishing it as portfolio work would assert an implementation that does not exist. |
| **Elevate WPC Manus prototype** | Dead — DNS does not resolve. Nothing to inspect, nothing a visitor could open. |

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
