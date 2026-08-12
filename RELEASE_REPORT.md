# RELEASE REPORT

**SheetFlow AI website · RC10 release hardening · 2026-08-13**

Status: **PASS** — no release-blocking defect found. No production code was
changed by this pass; every line below is a verification.

Full evidence, including the reasoning behind each verdict, is in
[`PROJECT_RECOVERY.md` § 8](PROJECT_RECOVERY.md).

---

## Production

| Field | Value |
|---|---|
| URL | https://sheetflow-ai-website.vercel.app |
| Second alias | `sheetflow-ai-website-sheetflow51-progs-projects.vercel.app` |
| Deployment | `dpl_4UXduQqrfCTvKx2hRJFsbThG4Nin` · `target: production` · `READY` |
| Deployed | 2026-08-13 00:04:07 IST |
| Vercel project | `sheetflow-ai-website` · `prj_OCdvD0KtEWFnsDCGatVJtPcdpsNG` |

## Deployed commit

| Field | Value |
|---|---|
| **Code commit in production** | **`0276c6a`** — `fix(hero,booking): give "See our work" somewhere to go, and booking a live event` |
| Repository HEAD | `74d853b` |
| Difference | `PROJECT_RECOVERY.md` only — **the deployed application code is identical to HEAD** |

The deployment was made with the Vercel CLI from the working tree, so it carries
no git SHA. Identity was established three ways instead: the deployment was
created 21 s after `0276c6a` was authored; production serves both changes unique
to that commit (hero → `/work`, booking → `/free-automation-audit`); and
`git diff --stat 0276c6a 74d853b` touches one documentation file.

## Test results

| Gate | Result |
|---|---|
| Focused suite (local production build) | **68/68 passed** — `playwright test smoke commerce --workers=1`, 1.8 min |
| Focused suite (against production) | 66/68 — 2 failures are a test-harness artefact, not a defect (see *Known warnings*) |
| TypeScript | **pass** — `tsc --noEmit` exit 0 |
| ESLint | **pass** — exit 0, 0 errors, 6 warnings |
| Next production build | **pass** — exit 0 at HEAD, 30 static pages, 10 work routes, 6 service routes, 44 s |

## Production sanity audit

| Check | Result |
|---|---|
| Sitemap URLs | **21/21 → 200**; unknown path → 404 |
| Core routes | `/`, `/services`, `/work`, `/pricing`, `/book`, `/book/confirmed` → 200 |
| Published work routes | 10/10 → 200 |
| `robots.txt` · `sitemap.xml` · `llms.txt` · `manifest.webmanifest` | 200, correct content types |
| Internal links | 32 unique same-origin links, **0 broken** |
| Images | 20 across five routes — **0 missing `alt`**, 0 missing `src`, 0 broken |
| Hydration errors | **none** |
| Headings | exactly one `h1` on `/` |
| Horizontal overflow | none (`scrollWidth` 1530 / viewport 1536) |
| Third-party scripts on `/book` | **none** — 14 `<script src>`, all same-origin `/_next/…` |
| Secrets in tracked files | **none** — no key-shaped strings across all 386 tracked files; `.env.local` untracked and ignored |

## Hero CTAs

| CTA | Destination | Verified |
|---|---|---|
| Primary — "Book a free automation audit" | `/book` | live DOM |
| Secondary — "See our work" | `/work` | live DOM |

The hero contains exactly these two links.

## Booking

| Check | Result |
|---|---|
| Destination | `https://calendly.com/sheetflow51/free-automation-audit` |
| Calendly event | **live and active** — `2a45325e-c622-40c8-879b-7d7765b0009d`, 30 min, Google Meet, one custom question at position 0 |
| Availability | 2026-08-14 offers 16 slots, `03:30Z`–`11:00Z` = **9:00am–4:30pm IST**; weekend correctly empty |
| Stale `/30min` | **0 occurrences** in served HTML; in the repo it survives only as explanatory prose in `contact.ts` |
| Required fields | form invalid when empty; `name`, `email`, `sector`, `bottleneck` required, `a1` optional |
| Prefill | **verified end to end** — driven to Calendly's invitee step: name, email and the `a1` custom question all populated; no booking was created |

## Known warnings

1. **ESLint — 6 warnings, 0 errors.** Five `react-hooks/set-state-in-effect` in
   `CustomCursor`, `FinalCTA`, `Hero`, `IntelligenceCore`, `SplineScene`; one
   unused eslint-disable directive at `Hero.tsx:151`. Unchanged baseline.
2. **Analytics beacon 404.** `/_vercel/insights/script.js` returns 404 on every
   page load, logging 2 console errors. It is the only console error on the
   site and the only deduction keeping Lighthouse Best Practices at 96.
3. **2 failures when the suite runs against production.**
   `commerce.spec.ts:173 › booking › loads no third-party script` defines
   first-party as `hostname.includes('localhost')`, so against a remote baseURL
   it counts the app's own Next.js chunks as third-party — every hostname it
   lists is `sheetflow-ai-website.vercel.app`. The underlying claim is true
   (zero external scripts on `/book`) and the same suite is 68/68 locally. Left
   unchanged deliberately; widening the check to "same origin as baseURL" is
   ordinary work for a branch, not a release edit.
4. **Known-stale figures.** Performance numbers in `PROJECT_RECOVERY.md` § 3 were
   taken on a memory-starved host and are explicitly not claimed as current.
   The visual-system score (73/100) and motion budget are unchanged and tracked.

## Remaining manual action

**Enable Vercel Web Analytics — Vercel → Project → Analytics → Enable.**
One dashboard toggle. No code change, no redeploy. It clears warning 2 above and
should take Best Practices to 100.

This cannot be done from the agent session: the Vercel MCP connector is
authenticated to a different scope and returns `403 forbidden` for this project
(re-confirmed this session on both `get_project` and `list_deployments`), and the
correctly-authenticated Vercel CLI exposes no analytics command.

## Rollback

| | Value |
|---|---|
| Current production | `dpl_4UXduQqrfCTvKx2hRJFsbThG4Nin` (code `0276c6a`) |
| Previous production | `dpl_BrfoiS1TkDCG841Z9YqECyemUp58`, `READY`, 2026-08-12 22:27:16 IST (code `5151dd6`) |
| Command | `vercel rollback dpl_BrfoiS1TkDCG841Z9YqECyemUp58` |

**Rolling back has a cost.** `5151dd6` predates the booking and hero fixes, so it
restores the dead `/30min` Calendly destination and the hero's
destination-less "See our work" button. Use it only for a catastrophic
regression; for anything narrower, fix forward.

Git-side recovery needs no rollback of its own: no history was rewritten, no
commit was deleted, `stash@{0}` is preserved untouched, and every commit in this
release is reachable from `feat/m01-foundation`.
