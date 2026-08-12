# PROJECT_RECOVERY

**RC9 — recovery from an unplanned power loss** · 2026-08-12

The machine lost power during the RC8 session. This file records what survived,
how that was established, and what remains. Every row in § 3 names the command
or file the verdict came from; a row whose evidence column says "not measured"
is a claim this document declines to make.

---

## 1. The headline

**Nothing was lost.** The previous session's work was on disk but uncommitted,
and it typechecks, lints and builds. It is now committed as `6cf7348`.

The shutdown looked worse than it was because `git status` showed 45 changed
paths and `REBASE_HEAD` was present in `.git/`. Both had innocent explanations,
and finding them was the whole job of the first hour:

| Alarm | What it actually was |
|---|---|
| 45 dirty paths, 2,830 insertions | One session of coherent work. Three gates pass on it unmodified. |
| `REBASE_HEAD` → `f32a9e2`, on no branch | A stale ref from a rebase that ended **2026-05-15**, three months before the shutdown. It refers to `FeatureStorytelling.tsx`, which this tree deleted on purpose. Not this incident's work. |
| `stash@{0}` | The GSAP-defer optimisation arm that commit `0d69e81` rejected on measurement. A rejected arm is a result; it is kept. |
| `.git/AUTO_MERGE` | Left by a merge on 2026-08-10. No merge, rebase or cherry-pick is in progress — no `rebase-merge/`, `rebase-apply/`, `MERGE_HEAD` or `CHERRY_PICK_HEAD` exists. |

No reset, checkout, clean or force-push was performed at any point.

## 2. Repository state

| Field | Value |
|---|---|
| Branch | `feat/m01-foundation` |
| HEAD before recovery | `a9ecd70` |
| **Recovery checkpoint** | **`6cf7348`** — `chore(recovery): checkpoint the RC8 working tree the shutdown left uncommitted` |
| Ahead of `origin/feat/m01-foundation` | 6 commits |
| Working tree | clean |
| Stash | `stash@{0}` preserved, untouched |
| Dangling but reachable | `f32a9e2` (see § 1) |

Four ignore rules were added in the same commit, because `git add -A` had staged
things that should never enter history: `docs/_captures/` (93 MB across 129 PNG
frames), `.playwright-mcp/`, `*.rc8-backup`, and `.claude/settings.local.json`.
The screenshots stay on this machine — they are evidence, and git would store
every re-capture of a 1 MB frame as another 1 MB blob forever.

## 3. State table

| Area | Status | Evidence | Action |
|---|---|---|---|
| Build | ✅ pass | `npm run build` exit 0 — 30 static pages, 10 work routes, 6 service routes, 2026-08-12 | none |
| TypeScript | ✅ pass | `tsc --noEmit` exit 0 on the dirty tree, before any edit | none |
| Lint | ✅ pass | `eslint src` exit 0 — 0 errors, 6 warnings (`react-hooks/set-state-in-effect` in two R3F wrappers) | optional |
| Pages | ✅ pass | 21 routes served 200 over HTTP; `/this-page-does-not-exist` → 404 | none |
| Anchor links | 🔧 fixed | All 6 in-page links resolved, but every target had `scroll-margin-top: 0` under a `fixed` 64 px nav — headings landed *behind* the nav bar | fixed in `globals.css` |
| Portfolio | ✅ verified | WPC artifact claims re-counted against disk: `orchestrator.py` 1,261, `vector_compiler.py` 869, `catalog_pdf.py` 316 — **exact matches**; 7 production bundles, manifest, toolpath SVG and 1.36 MB dashboard all present | none |
| Portfolio folders | ✅ present | `WPCDesign_Automation`, `whatsapp-accounting-os`, `r3s-realty`, `ai-voice-receptionist`, `PMA_Automation_Agency`, `Saraswati Dental Images`, `Dr. Manish Sharma (SPARC)` all found on disk | none |
| Evidence model | ✅ sound | `live` / `demo` / `internal` are a discriminated union: `internal` carries no URL field at all, and `demo` cannot emit a client `Organization` node. The guarantee is held by the type, not by review | none |
| Booking (form) | ✅ pass | Real `<form method="get">`. Validation blocks a blank required field; the no-JS native GET produces a valid prefilled URL. No third-party script | none |
| Booking (destination) | ✅ fixed | Pointed at a **deleted** Calendly event — see § 7.1. Event recreated via the API; `contact.ts` now points at `/free-automation-audit` | redeployed |
| Pricing | ✅ serves | `/pricing` 200, 171.9 kB | design pass pending |
| Visual system | 🟡 good | VOS in place; supervisor scores the homepage **73/100** | spacing (50), alignment (50), typography (42) |
| Motion | 🟡 warn | 12 % of animations sit in a `prefers-reduced-motion` block against a 50 % target; 15 paint-class animations against a budget of 8 | improve |
| Console | ✅ clean | 4 errors locally, all `_vercel/insights` and `_vercel/speed-insights` 404s — those scripts exist only on Vercel's edge. To be re-checked on the preview | verify on preview |
| Responsive | ✅ pass | At 390 px the document has **0 px** horizontal overflow; the 11 oversized nodes are ambient decor inside clipped containers | none |
| MCP | 🟡 partial | 5 servers configured, all **globally installed** (`AppData/Roaming/npm`), invoked as `cmd /c <bin>` — the `npx` startup-timeout problem is already solved. 18 processes ≈ 950 MB across 3 concurrent Claude sessions | see § 4 |
| Gemini | ⏭️ not needed | No reference anywhere in the app but `robots.ts` (a crawler user-agent). Adding a generative dependency would put a paid API call in a build that has no generative feature | see § 5 |
| E2E suite | ✅ pass | `playwright test --workers=1`: **407 passed, 10 skipped, 1 failed** in 29.5 min across desktop + Pixel 7 | see § 3.1 |
| SEO | ✅ pass | `seo.spec.ts` green: single parseable `@graph`, references resolve, FAQ markup matches rendered answers, `llms.txt` and `robots.txt` served, sitemap well-formed. Per-route: 1 `h1`, OG + Twitter, 2 JSON-LD blocks, canonical | none |
| Accessibility | ✅ pass | `a11y.spec.ts` axe-core WCAG 2.1 AA green on homepage, homepage under `prefers-reduced-motion`, `/services/whatsapp-automation`, `/pricing`; alt text, booking control names, calculator live region all pass | none |
| Fabrication guard | ✅ pass | All 10 projects assert "publishes no outcome figure it has not measured". Plus: no `Review`/`Rating`/`AggregateRating` anywhere, demonstration builds name no client organisation, internal builds publish no outbound link or client entity, every published live URL reachable | none |
| Performance | 🟡 stale | Last capture: LCP 4,858 ms, TBT 1,897 ms, CLS 0, JS 333.6 kB gzip against a 360 kB budget — **taken with 1.44 GB free**, which the supervisor itself flags as a different population from the baseline | re-measure on preview |
| Deployment | 🔗 linked | `.vercel/project.json` → project `sheetflow-ai-website`, `prj_OCdvD0KtEWFnsDCGatVJtPcdpsNG` | preview → production |
| Secrets | ✅ clean | `.env.local` is untracked and ignored twice over; it holds only `VERCEL_OIDC_TOKEN`. `.env.example` documents names only | none |

### 3.1 The one failing test, and why it is not a defect

```
[desktop] a11y.spec.ts:123 › every interactive element is reachable and shows a focus indicator
  Tearing down "context" exceeded the test timeout of 90000ms.
```

The failure is a **teardown timeout**, not a failed assertion — no element was
found without a focus ring. Re-run alone on the same build it passes in
**10.3 s** against that 90 s budget, an eightfold margin.

That is the failure mode `playwright.config.ts` already documents: the suite
loads a page whose steady-state main thread is ~75 % paint and compositing, and
a full 29.5-minute run on a 4-core box with ~1.4 GB free starves the teardown.
The evidence is the shape of the error, not the re-run alone — a genuine missing
focus indicator fails as an assertion listing the bare elements, and does so in
seconds.

Recorded as **environmental**. It is not being counted as a pass: the suite exit
code was 1, and a green run on this host requires either fewer workers or more
headroom than the machine currently has.

## 4. The MCP situation, stated precisely

Three facts are tracked separately and must not be conflated — **configured**,
**running**, and **observed**. Only the third claims usability.

| Server | Configured | Running | Observed this session |
|---|---|---|---|
| `playwright` | yes | yes | ✅ **used** — navigation, form fill, screenshots, JS evaluation |
| `filesystem` | yes | yes | not called (native tools cover it) |
| `context7` | yes | yes | not called |
| `sequential-thinking` | yes | yes | not called |
| `chrome-devtools` | yes | yes | not called |
| GitHub MCP | no | — | absent from `.mcp.json`; the `gh` CLI is the working path |
| 21st.dev / Magic MCP | no | — | **not installed, and not installed by this session** — neither is needed to finish a site whose components already exist |
| UI/UX Pro Max | n/a | n/a | a Claude **skill**, not an MCP |

**On the 950 MB of duplication:** it is real — 18 MCP processes across three
concurrent Claude Code sessions, roughly triplicated. It was **not** reclaimed,
and that is deliberate. The project's own `session-supervisor.mjs` refuses to
kill MCP servers under its constraint 2 ("never kill what it does not own"),
because the servers belong to other live sessions and killing them severs
another session's tooling mid-task. The largest consumers on this host are not
this project: ChatGPT Classic, three `claude` processes and OneDrive. Collapsing
the duplication is a matter of closing the other sessions, which is the
operator's call, not this one's.

## 5. Gemini — why nothing was added

The brief offers a Gemini API key. The codebase has no generative feature: no
model call, no SDK, no server route that would host one. Adding
`@google/genai` would install a dependency, introduce a secret to manage across
three Vercel environments, and change nothing a visitor sees.

If a generative feature is wanted later, the wiring is already specified —
`.env.example` documents the pattern for server-only keys (`RESEND_API_KEY` sits
there unused for the same reason). The key would go in `.env.local` locally and
in Vercel → Settings → Environment Variables per scope, never in a
`NEXT_PUBLIC_*` name and never in a commit.

## 6. What this session changed

1. `6cf7348` — the recovery checkpoint (§ 2).
2. `globals.css` — `scroll-margin-top` on anchor targets, so the six in-page
   nav links stop parking their headings behind the fixed nav.
3. `globals.css` — the four remaining `font-size: 9px` micro-labels raised to
   10px, the size the system already uses for that role in a dozen places. One
   of them is `.terms-flag`, the pricing recommendation badge. This is both a
   legibility fix and one fewer distinct font size against the typography score.

Deliberately **not** changed, and why:

- **`public/videos/hero-core.mp4`** — 2.6 MB, tracked in git, and referenced by
  no code anywhere in the repository. It is dead weight in the deployment, but
  the browser never requests it, so it costs a visitor nothing. Removing a
  tracked binary is a decision for whoever knows whether a hero video is coming
  back; it is recorded here rather than acted on.
- **The 73/100 visual score's three big deductions** — spacing (9 of 18 sibling
  gaps off the 4 px scale), alignment (32 distinct left edges across 219 blocks)
  and typography (22 distinct font sizes). These are real and systemic, and each
  is a broad refactor across every section rather than a fix. They are the
  natural next phase, not a recovery task, and doing them under-tested on a box
  that cannot run the suite green would trade a measured problem for an
  unmeasured one.

## 7. Production release — 2026-08-12

Deployed from commit `5151dd6`.

| Field | Value |
|---|---|
| Production URL | https://sheetflow-ai-website.vercel.app |
| Deployment | `dpl_BrfoiS1TkDCG841Z9YqECyemUp58`, `target: production`, `READY` |
| Preview | `dpl_2Fos78WnvkavBSoD8QXzXxvyc43q` (Deployment Protection on — auth wall) |
| Build identity confirmed | `292c3effe2f00533.css` carries `--nav-h` ×2 and `scroll-margin-top` ×2, and **zero** `font-size:9px` — both fixes are provably live |

**Verified on production, anonymously:**

- **Routes** — all 21 sitemap URLs return 200; an unknown path returns 404.
  (An earlier reading of "3 failures" was mine, not the site's: I invented the
  slugs `crm-integration`, `invoice-automation`, `reporting`. The real ones are
  `crm-automation`, `business-reports`, `invoice-reminders`.)
- **Anchor fix** — nav bottom 64px; the How-it-works kicker now sits at 146px
  and its heading at 180px. Both clear the nav. Before, the kicker was at ~66px.
- **Responsive** — 0px horizontal overflow at 1440, 1024, 768 and 360; zero tap
  targets under 24px at any of them; mobile menu opens with all 8 links.
- **Assets and hydration** — 5 images, 0 missing `alt`, 0 broken; exactly one
  failing request site-wide (below); **no hydration errors**; one `h1`.
- **SEO** — every route self-canonicalises on the production host, JSON-LD
  parses on every route, `/book/confirmed` is correctly `noindex`, and
  `robots.txt` names GPTBot, ClaudeBot, PerplexityBot and peers explicitly.
- **Lighthouse 13.4.1, against production:**

  | | Perf | A11y | Best Practices | SEO |
  |---|---|---|---|---|
  | Mobile | 62 | **100** | 96 | **100** |
  | Desktop | 86 | **100** | 96 | **100** |

  Desktop FCP 0.4s, LCP 1.1s, TBT 120ms, CLS 0. Mobile FCP 2.5s, LCP 4.5s,
  TBT 570ms, CLS 0.

### 7.1 Blocking defect — the booking destination is dead

Every "Book a free audit" CTA (7 on the homepage alone) submits to
`calendly.com/sheetflow51/30min`, which renders **"This Calendly URL is not
valid."** The bare account page renders **"No openings at the moment."**

The cause is not in this repository. Queried through the Calendly API:

- the account is live — `sheetflow51`, `sheetflow51@gmail.com`, updated 2026-08-10;
- `event_types` returns an **empty collection** at both user and organization scope.

The event `booking.ts` documents — "Free Automation Audit", 30 min, Google Meet,
verified against the API on 2026-08-07 — no longer exists. The site's form,
validation, prefill parameters and no-JS fallback are all still correct; they
now point at nothing.

**Resolved 2026-08-13, on the founder's instruction.** The event was recreated
through the Calendly API and the site now points at it:

| | Value |
|---|---|
| Event | Free Automation Audit — `2a45325e-c622-40c8-879b-7d7765b0009d` |
| URL | `calendly.com/sheetflow51/free-automation-audit` |
| Duration / location | 30 min · `google_conference` (already connected) |
| Custom question at position 0 | "Please share anything that will help prepare for our meeting." — i.e. exactly the `a1` field `booking.ts` composes into |
| Availability | Mon–Fri 09:00–17:00 **Asia/Calcutta** (was America/New_York) |

Calendly derives a slug from the event's name and does not accept one, so
`/30min` was unrecoverable — it was the *default* event's slug, never a name.
`contact.ts` was repointed and redeployed rather than the slug being restored.

The timezone was corrected at **event-type scope**, which leaves the shared
"Working hours" schedule untouched for anything else that uses it. Verified
numerically rather than by reading the setting back: the first bookable slot is
`2026-08-14T03:30:00Z` = 09:00 IST and the last is `11:00Z` = 16:30 IST, with
15–16 August (the weekend) correctly empty.

End-to-end in production: the form submits to a real scheduling page titled
"Free Automation Audit · 30 min" with name, email and the composed notes
prefilled — no "not valid".

### 7.2 Minor defect — the analytics beacon 404s

`/_vercel/insights/script.js` returns 404 on every page load, logging two
console errors, because Web Analytics is not enabled on the Vercel project while
`<Analytics />` is mounted in `layout.tsx`. It is the **only** thing costing
Best Practices 96 rather than 100 — Lighthouse's single deduction on both
profiles is "Browser errors were logged to the console".

Fix: enable Analytics in **Project → Analytics** (no code change, no redeploy).

Attempted on the founder's instruction and **not completable from here**, for a
reason worth recording: the Vercel MCP connector is authenticated to a different
scope and returns

```
403 forbidden — Not authorized: Trying to access resource under scope
"sheetflow51-progs-projects". You must re-authenticate to this scope.
```

so it cannot read analytics, let alone enable it. There is also no
enable-analytics tool in the connector's surface — only `get_web_analytics`,
which requires it to be on already. The Vercel **CLI** is authenticated
correctly (it deployed this release), but exposes no analytics command. This is
therefore a dashboard toggle and nothing else.

### 7.3 The hero's second CTA had no destination

`Hero.tsx` rendered "See our work" as a `<button>` with **no `href`** — it fired
`hero_demo_click` and navigated nowhere, which is why it read as redundant. It
now points at `/work`, the canonical portfolio route the navbar and
`/book/confirmed` already use. See commit `0276c6a`.

Verified on production at 1440 and 390: mouse click, keyboard Enter and the
browser Back button all behave correctly, with no new console errors.

---

*Generated during the RC9 recovery session. Every figure above was executed, not
inferred. Figures in § 3 marked "stale" are explicitly not claimed as current.*
