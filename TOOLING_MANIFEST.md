# Tooling Manifest

> What this project can actually do, verified rather than assumed.
> Maintained automatically. Last verified: **2026-08-08** (Phase K).

Every row below was tested in the session that wrote it. "Connected" means a
health check passed. **"Usable" means a capability was exercised and returned
real data** — a server that starts but has never answered a question is
`configured`, not `usable`.

---

## Phase K — what was exercised, 2026-08-08

The standard applied here is the one at the top of this file: **"usable" means a
capability was exercised and returned real data.** A server that merely connects
is `configured`.

### Used, and load-bearing

| Capability | What it actually did | Why it mattered |
|---|---|---|
| **Calendly MCP** (`users-get_current_user`, `event_types-list_event_types`) | Read the live event type: `Free Automation Audit`, slug `30min`, 30 minutes, Google Meet, free, active — and **one custom question at position 0**, type `text`, optional | The position-0 fact is what makes `a1` the correct prefill parameter. Everything in `lib/booking.ts` rests on it. Without this call the hand-off would have been built on a guess, and a wrong parameter fails **silently** — Calendly renders its normal page with the field empty, so there is no error to observe |
| **Vercel CLI** (`projects ls`, `env ls`, `domains ls`) | Enumerated **5 projects**; established that **Elevate WPC is not among them**. Confirmed `NEXT_PUBLIC_SITE_URL` is set for Production and Preview. Confirmed **0 domains** | `projects ls` is the evidence behind **D27** — the reason Elevate WPC was omitted rather than invented. `domains ls` re-confirmed **B2** |
| **Playwright, direct** | Captured three third-party deployments for `public/work/`; rendered and screenshotted the four new routes; ran the 264-test suite | The capture script waits on real content and `document.fonts.ready` rather than a timer, because one of the three is a client-rendered SPA where `networkidle` fires with an empty root |
| **axe-core via Playwright** | 6 route/motion combinations | Found the **serious WCAG 2.1.1** defect on `/pricing`, visible only on the mobile profile |
| **Lighthouse** (`scripts/audit-lighthouse.mjs`) | 4 routes × 5 runs, mobile preset | Confirmed the homepage did not regress after gaining three images |
| **Direct HTTP (`curl`) + Node parsing** | Read every technical claim in the case studies off the live deployments; measured the R³S chunk sizes byte-exactly | The alternative was describing what a build of that kind "would" contain, which is the failure mode the case studies exist to avoid |
| **PowerShell (`Get-NetTCPConnection`)** | Stopped the Next server by listening port | See "The `pkill` trap" below — the Bash tool could not do this |

### Available, deliberately not used

Recorded because an unexplained absence is indistinguishable from an oversight.

| Capability | Why not |
|---|---|
| **chrome-devtools MCP** | This project already drives CDP through Playwright in its own tooling (`npm run trace`, `npm run profile`), and those instruments are calibrated — one of them was rebuilt in Phase D specifically to remove an observer effect. A second path to the same protocol would produce numbers that cannot be compared with the recorded baselines |
| **context7 MCP** | Its value is current documentation for unfamiliar APIs. Everything touched here — `next/image`, `opengraph-image` conventions, schema.org `Offer`/`PriceSpecification`, Calendly prefill — was either already documented in-repo from prior phases or read directly from the live Calendly API, which is more authoritative than any doc |
| **sequential-thinking MCP** | The work decomposed cleanly into vertical slices. Reaching for a reasoning scaffold on a well-understood task is tool theatre |
| **filesystem MCP** | Native Read/Write/Edit cover it, with better diff behaviour |
| **Figma / Adobe / Canva** | DEC-302 — `logo.png` is canonical and `public/brand/` is generated. Routing assets through an external editor reintroduces exactly the drift those decisions exist to prevent. The case-study imagery is captured from live deployments, which is a measurement, not a design task |
| **Airtable / Notion / Slack / Gmail / Drive / ElevenLabs** | No build or verification need arose |

### Failing, with the actual reason

| Server | Status | Detail |
|---|---|---|
| **GitHub MCP** | ⛔ fails | *"Incompatible auth server: does not support dynamic client registration."* This is an OAuth capability mismatch, **not** a missing login and **not** the folder-trust gate that blocked earlier phases. `gh` covers GitHub work meanwhile |
| **Netlify MCP** | ⛔ fails | HTTP 502 from the origin (`netlify-mcp.netlify.app`). Irrelevant to this project, which deploys to Vercel |
| **Roboflow, Vaisala Xweather, Autodesk Product Help** | ⛔ need authentication | Non-interactive session; OAuth cannot be completed here. None is relevant to this project, so none was pursued |
| **Vercel MCP** | ⚠️ connected, wrong account (D3) | `list_teams` returns empty. The **CLI** works and was used instead |

### The `pkill` trap — worth keeping

`pkill -f "next-server"` reports success and **does not stop the Next server on
Windows**. The consequence is worse than a no-op: the surviving process keeps
serving the *previous* build, so a rebuilt schema change is invisible over HTTP.

This presented as three failing tests asserting a `CreativeWork` node that was
demonstrably present in source and absent from the response — which reads as a
code defect and is not one. It also produced the `EPERM … unlink
'.next/server/app/book'` build failure, because the live process held the
directory.

**Fix:** stop the listener by port
(`Get-NetTCPConnection -LocalPort 3000 | Stop-Process`), then rebuild. **Tell:**
if a rendered-output assertion contradicts the source, check what the server is
serving before debugging the code.

---

## Verification toolchain

| Capability | Tool | Command | Status |
|---|---|---|---|
| Types | TypeScript 5.6 | `npm run type-check` | ✅ |
| Lint | ESLint 9 (flat config) | `npm run lint` | ✅ 9 known warnings |
| Build | Next.js 16.2.6 (Turbopack) | `npm run build` | ✅ 10 routes |
| E2E + a11y + SEO | Playwright 1.62 + axe-core 4.12 | `npm run test:e2e` | ✅ 70 tests |
| Lighthouse | lighthouse 13.4 | `npm run audit:lh` | ✅ median of N |
| **Main-thread CPU profile** | **CDP + source maps** | **`npm run profile`** | ✅ **median of N, module-attributed** |
| **Paint / layout / style split** | **CDP `Performance.getMetrics` (new)** | **`npm run trace`** · **`trace:all`** | ✅ **counters, no observer effect** |
| CLS attribution | Playwright + PerformanceObserver | `node scripts/probe-cls.mjs` | ✅ |
| Bundle budget | custom, gzip-accurate | `npm run audit:bundle` | ✅ |
| Bundle treemap | `@next/bundle-analyzer` | `npm run analyze` | ✅ |
| Brand assets | sharp 0.34 / libvips 8.17 | `npm run brand` | ✅ |
| Everything | — | `npm run verify` | ✅ |

`npm run audit:lh` reuses Playwright's Chromium over CDP rather than adding
`chrome-launcher` and a second browser download, so audits and tests measure the
same engine. `scripts/profile-main-thread.mjs` follows the same rule and decodes
source maps with ~40 lines of Base64-VLQ instead of taking a dependency.

Playwright runs against the **production** build (`npm start`). Dev-mode
accessibility and performance numbers describe a build nobody ships.

---

## Local MCP servers — installed 2026-08-06

Declared in **`.mcp.json`** (project scope, committed). All five stdio servers
were smoke-tested with a real `initialize` + `tools/list` handshake, not just
added to config.

| Server | Version | Installed | Connected | Auth | Usable | Tools |
|---|---|---|---|---|---|---|
| **chrome-devtools** | 1.6.0 | ✅ | ✅ **Connected** | n/a | ⏳ next session | 29 |
| **context7** | 3.2.5 | ✅ | ✅ **Connected** | none needed | ⏳ next session | 2 |
| **sequential-thinking** | 0.2.0 | ✅ | ✅ **Connected** | n/a | ⏳ next session | 1 |
| **playwright** | 1.63.0-alpha | ✅ | ✅ **Connected** | n/a | ⏳ next session | 24 |
| **filesystem** | 0.2.0 | ✅ | ✅ **Connected** | n/a | ⏳ next session | 14 |
| **github** (remote HTTP) | — | ✅ configured | ⛔ **fails** | ⛔ see below | ❌ | — |

> **Resolved 2026-08-07 (later).** The trust gate is cleared and all five stdio
> servers now report `✔ Connected` in `claude mcp list`. **`gh` is also
> authenticated** as `sheetflow51-prog`.
>
> The `⏳` above is the *original* correct claim finally being true: servers
> attach at session start, and the session that observed them connecting had
> begun while they were still blocked. Unlike the earlier version of this file,
> this is not a prediction being asserted as a fact — the gate that invalidated
> it last time is gone, and `claude mcp list` confirms the connection today.
>
> **GitHub MCP still fails, with a new and more specific error:**
> *"Incompatible auth server: does not support dynamic client registration."*
> That is not the trust gate and not a missing login — it is an OAuth
> capability mismatch against `api.githubcopilot.com/mcp/`, and it needs its own
> investigation. **`gh` CLI covers GitHub work in the meantime and is what the
> registry licence audit was run through.**

> **⚠ Correction (2026-08-07).** The previous revision of this table said the
> servers were "live from the next session onward; nothing further is
> required." **That was wrong.** A later session confirmed all six still report
> `⏸ Pending approval` in `claude mcp list`, and the cause is not session
> timing.

### Why they are not connected — root cause, measured

The gate is **project trust**, not the `.mcp.json` config, which is correct.
`~/.claude.json` records one entry per project directory:

```
untrusted  enabled=[]  c:/Users/pc/OneDrive/Desktop/AI_MASTER_WORKSPACE/SheetFlow_AI_Website
```

`hasTrustDialogAccepted: false`. Comparing every project entry on this machine,
this is one of only two untrusted directories and the **only** one carrying a
`.mcp.json` — so the correlation is exact. Claude Code will not start executable
config from a folder whose trust prompt has never been answered, which is the
right posture for `npx`-launched servers declared in a checked-in file.

`.claude/settings.local.json` now carries `enabledMcpjsonServers` naming all
six. That pre-answers *which* servers are approved, so no per-server prompt
follows — but it does **not** substitute for folder trust, which was verified:
adding the key left all six still pending.

**To unblock — founder, one time, ~5 seconds.** The trust flag was deliberately
not flipped programmatically. Its entire purpose is a human confirming they
trust this folder's executable config; an agent setting its own execution
permission by editing an internal state file defeats the control.

```bash
cd "c:/Users/pc/OneDrive/Desktop/AI_MASTER_WORKSPACE/SheetFlow_AI_Website"
claude          # answer the trust prompt, then /mcp to authorise github
```

**The `⏳ next session` framing in AI_RUNTIME_MEMORY is also wrong** for the
same reason and is corrected there. The original lesson — *a server that starts
is configured; only one that has answered a question is usable* — stands, and
this is a second illustration of it: five servers were recorded as installed and
handshake-verified, and none of them has ever answered a question in this repo.

### Why each earns its place

| Server | Recommendation | Reasoning |
|---|---|---|
| **chrome-devtools** | **Use it.** Highest value of the five. | It carries `performance_start_trace` / `performance_analyze_insight` / `lighthouse_audit`. TBT has been this project's weakest metric for its whole life and two attempts failed for want of a real trace. `npm run profile` now covers module attribution; this covers the paint/layout half that a *CPU* profile cannot see, which — per the measurement below — is where the cost actually is. |
| **context7** | **Use it for Next 16 / React 19 questions.** | Next 16 is recent enough that pretrained knowledge is unreliable, and this project already hit one such gap (Turbopack rejecting a `webpack()` key). `node_modules` types remain more authoritative for *signatures*; Context7 is for *guidance and migration*. |
| **sequential-thinking** | Situational. | Useful for genuinely multi-branch architecture decisions (A1, D2). Not for routine work — it adds latency without adding correctness. |
| **playwright** | Situational. | The repo's own Playwright suite is strictly more capable for testing (fixtures, projects, `webServer`). The MCP wins only for *ad-hoc* exploration where writing a spec is overkill. |
| **filesystem** | **Redundant here. Documented, not recommended.** | Its 14 tools duplicate the harness's native Read/Write/Glob/Grep, which are faster and better integrated. Installed because it was requested; it earns its place only for work outside the project root, which its sandbox argument forbids anyway. |
| **github** | Blocked on auth. | See below. |

### GitHub — the one genuine blocker

Three independent things are all unauthenticated:

- **`gh` CLI 2.96.0** — installed, `gh auth status` → *"You are not logged into
  any GitHub hosts."* A previous version of this manifest recorded GitHub as
  "✅ Repo ops, PRs". **That was wrong and is corrected here.**
- **GitHub MCP** — configured against `https://api.githubcopilot.com/mcp/`,
  needs an OAuth flow this session cannot run.
- **`@modelcontextprotocol/server-github`** — **deliberately not installed.**
  npm marks it `Package no longer supported`. The remote server above replaces it.

`git push` works because the credential helper holds a token; that token is not
exposed to `gh` or the MCP.

**To unblock (interactive session, one time):**

```bash
gh auth login                 # unblocks gh: repo search, PRs, issues
claude mcp list               # then /mcp in Claude Code to authorise github
```

---

## claude.ai connectors

18 remote connectors are attached. Health-checked 2026-08-06 via `claude mcp list`.

| Integration | State | Used? | Notes |
|---|---|---|---|
| **Vercel CLI** | ✅ 58.7.0, authenticated | ✅ | `sheetflow51-prog`, scope `sheetflow51-progs-projects`. **The working deployment path.** |
| Vercel MCP | ⛔ 403 | ❌ | Authenticated to a *different* account than the one owning this project. Re-authorise against that scope, or keep using the CLI. |
| **Calendly** | ✅ | ✅ | Verifies the site's primary conversion path: `contact.ts` points at `calendly.com/sheetflow51/30min`; the API confirms that exact `scheduling_url`, `active: true`, `duration: 30`. The CTA and the FAQ's "free 30-minute audit" are factually true. |
| Adobe, Figma, Canva | ✅ connected | ❌ | DEC-302 makes `logo.png` canonical and `public/brand/` generated. Routing brand assets through external tooling reintroduces exactly the drift DEC-301/302 exist to prevent. Figma earns its place only if a Figma file becomes a design source; none exists, and the account is starter tier / View seat. |
| ElevenLabs | ✅ connected | ❌ | Could produce the five UI sounds `public/audio/README.md` specifies. The audio system is deliberately dormant, ships no files and never autoplays. ~285 kB for a feature no visitor triggers fails the "every asset must justify its existence" test. |
| Netlify | ✅ connected | ❌ | The project deploys to Vercel. Two deployment targets is a footgun. |
| Notion, Slack, Gmail, Drive, Calendar, Airtable, Emergent, SketchUp | ✅ connected | ❌ | No build or verification need. Using them would be tool theatre. |
| Autodesk, Roboflow, Vaisala Xweather | ⚠️ needs auth | ❌ | Not relevant to this project. Leave unauthenticated. |

Servers needing auth must be authorised from claude.ai connector settings, or
via `claude mcp` / `/mcp` in an interactive session. Not possible from a
non-interactive run.

---

## Environment audit — 2026-08-07

Every row verified by running the command, not by inspecting config.

| Capability | Version | State | Verified by |
|---|---|---|---|
| Node | v24.13.0 | ✅ | `node -v` |
| npm | 11.6.2 | ✅ | `npm -v` |
| Claude Code CLI | 2.1.220 | ✅ | `claude --version` |
| **Vercel CLI** | 58.7.0 | ✅ **authenticated** as `sheetflow51-prog` | `vercel whoami` |
| **`gh` CLI** | 2.96.0 | ✅ **authenticated** as `sheetflow51-prog` | `gh api user`, 4995/5000 rate limit remaining |
| Docker | — | ❌ **not installed** | `docker --version` → command not found |
| Local MCP servers | — | ✅ **5 of 6 Connected**; github fails on OAuth capability | `claude mcp list` |
| claude.ai connectors | 18 | mixed — see below | `claude mcp list` |
| Claude Skills | 7 | ✅ installed and active | `~/.claude/skills` |

### claude.ai connectors — health-checked 2026-08-07

Changes since the 2026-08-06 check are marked. This is why the check is re-run
rather than copied forward.

| Connector | State | Change |
|---|---|---|
| Vercel | ✅ Connected | **was 403** — the account mismatch behind D3 appears resolved at the connector layer |
| Figma, Canva, Adobe, Notion, Slack, Airtable, Gmail, Drive, Calendar, SketchUp, Autodesk, Emergent, ElevenLabs | ✅ Connected | — |
| **Calendly** | ⚠️ **Needs authentication** | **regressed** — was working and was the connector that verified the booking URL is real. The site's primary conversion path can no longer be re-verified programmatically |
| Netlify | ⛔ HTTP 502 | upstream outage; irrelevant, the project deploys to Vercel |
| Roboflow, Vaisala Xweather | ⚠️ needs auth | not relevant to this project |

## MCP availability matrix — verified against npm, 2026-08-07

Every package below was confirmed to exist and its version read from the
registry (`npm view <pkg> version`). **None were added to `.mcp.json`**, and the
reason is the same for all of them: the six servers already declared there
cannot start, so adding more would grow a config file of things that do not run.
That is the "tool theatre" this manifest exists to prevent.

| Requested | Package | Exists | Why not installed |
|---|---|---|---|
| 21st.dev / Magic MCP | `@21st-dev/magic` | ✅ 0.2.2 | Declined by **D15**; also needs `TWENTY_FIRST_API_KEY` |
| Figma | `figma-developer-mcp` | ✅ 0.13.2 | No SheetFlow design file exists; account is starter tier / View seat. Nothing to read |
| Firecrawl | `firecrawl-mcp` | ✅ 3.23.4 | `WebFetch` covers current needs; paid key required |
| Exa | `exa-mcp-server` | ✅ 3.4.0 | `WebSearch` covers current needs; paid key required |
| Browserbase | `@browserbasehq/mcp-server-browserbase` | ✅ 2.4.3 | Redundant — Playwright already runs locally against the production build |
| Supabase | `@supabase/mcp-server-supabase` | ✅ 0.9.0 | **No consumer** — static site, no database, no API routes, no auth |
| Cloudflare | `@cloudflare/mcp-server-cloudflare` | ✅ 0.2.0 | **No consumer** — deploys to Vercel; a second control plane is a footgun |
| Docker | — | n/a | `docker` is not installed on this machine and the project has no containers |
| Browser MCP | `@browsermcp/mcp` | ✅ 0.1.3 | Needs a Chrome extension plus a local bridge — too much machinery to install unattended |
| Memory MCP | `@modelcontextprotocol/server-memory` | ✅ 2026.7.4 | **Conflict — needs a founder decision.** Previously declined because `AI_RUNTIME_MEMORY.md` is deliberately a *reviewable* memory in git; an opaque parallel store splits the source of truth. It appears on the latest requested list. Not installed pending an explicit call |

**Update — trust is now granted, and the conclusion is unchanged.** Five of the
six configured servers connect. The "they cannot start" argument is gone; the
merits argument was always the stronger one and still holds. Supabase,
Cloudflare and Docker have no consumer here. Firecrawl, Exa, 21st.dev and Figma
need paid keys or a design file that does not exist. **Revisit per-server when a
real need appears, not as a batch.**

## Requested but deliberately not installed

| Capability | Decision | Reasoning |
|---|---|---|
| **21st.dev, Magic UI, Aceternity, Origin UI, React Bits, Motion Primitives, HyperUI** | **Declined** | `brand-os/03_component-language` already defines the component language, implemented against the design tokens. Importing third-party components forks the design system — the exact drift DEC-302 exists to prevent. This is a governance decision, not a capability gap. |
| **shadcn / Radix registry** | **Declined for now** | Radix would be a real win for one thing only: replacing hand-rolled focus management if a modal or combobox is ever added. The site currently has no such surface. Revisit when one appears — do not pre-install. |
| **Memory MCP** | Declined | The harness already has file-based memory, and `AI_RUNTIME_MEMORY.md` is the project's durable memory by design — reviewable in git. A parallel opaque store would split the source of truth. |
| **Fetch MCP** | Declined | `WebFetch` is built in. |
| **Puppeteer MCP** | Declined | Superseded by `playwright` + `chrome-devtools`, both installed. Adding a third browser driver adds a third Chromium download. |
| **BrowserTools MCP** | Not auto-installed | Requires a Chrome extension plus a local middleware server — too much moving machinery to install unattended. Command if wanted: `claude mcp add browser-tools -- npx -y @agentdeskai/browser-tools-mcp@latest` |
| **Vercel AI SDK / OpenAI SDK / Anthropic SDK** | **Not applicable** | Audited: this is a **static marketing site**. It has no API routes, no server actions and no LLM calls. Adding an AI SDK would add a dependency with no consumer. If a chat or lead-qualification surface is ever built, `@anthropic-ai/sdk` is the fit — it is not one today. |

---

## Capability selection for UI work

**Before writing any new UI, check whether an existing capability produces a
better result than hand-authoring. Record the choice and the reason.**

Ask in this order, stopping at the first that applies:

| # | Capability | Use it when | Why it usually loses here |
|---|---|---|---|
| 1 | **Figma MCP** | A Figma file is the design source | Account is **starter tier, View seat**, and no SheetFlow design file exists. Nothing to read. |
| 2 | **`ui-ux-pro-max`** | Reviewing UI against WCAG/UX rules | Good for *review*. Its style recommendations must not override `EXPERIENCE_GOVERNANCE.md`, `SHEETFLOW_VISUAL_DNA.md` or DEC-301/302. |
| 3 | **`design-system` skill** | Token architecture, drift checks | Already applied (Phase 4 reconciliation). |
| 4 | **GitHub search** | A well-solved primitive exists (focus traps, disclosure) | **Currently blocked — `gh` is unauthenticated.** Licence and design-system fit must be checked before copying. |
| 5 | **Component registries** | Need a premium component and no design system exists | Declined — see the table above. |
| 6 | **chrome-devtools MCP** | Runtime profiling beyond Lighthouse | **Now installed.** Use it for the paint/layout question below. |
| 7 | **Context7** | Blocked on a library's current API | **Now installed.** |
| 8 | **Adobe / Canva** | Raster or vector marketing assets | DEC-302 makes `logo.png` canonical. |
| 9 | Hand-author | Nothing above applies | The usual outcome, because the design system is already defined in code and governed. |

### Applied 2026-08-07 (Phase G — service pages)

**Resolved to "hand-author", at gate 9, and the reasons are the recorded ones.**

| # | Capability | Verdict for this work |
|---|---|---|
| 1 | Figma MCP | No SheetFlow design file exists. Nothing to read. |
| 2 | `ui-ux-pro-max` | Not consulted for *layout*: the pages reuse `SectionHeader`, `Button`, `card`, `kicker`, `headline-cinematic` and the homepage's `<details>` FAQ pattern verbatim. No new visual pattern was introduced, so there was no new design decision for it to review. |
| 3 | `design-system` skill | Tokens already reconciled; these pages consume them unchanged. |
| 4 | **GitHub search** | **Still blocked — `gh auth status`: not logged in.** No repository research was performed. |
| 5 | Component registries | Declined per D15. |
| 6–7 | chrome-devtools / Context7 MCP | **Unusable — folder trust, see above.** Context7 would have been the natural check for Next 16's `generateStaticParams` + async `params` signature; `node_modules` types and a green `tsc` covered it instead. |
| 9 | Hand-author | The outcome. |

**One capability did earn its place and is worth recording: arithmetic.** The
step numerals were written at `accent-bright/70`, which axe rejected. Rather
than trying opacities until the tool went quiet, the composited ratios were
computed — `/70` = 4.27:1 (fails), `/80` = 5.33:1 (passes) — and `/80` was
chosen because `.kicker` already uses it. Measuring instead of guessing kept a
one-off value out of the design system.

### Applied 2026-08-06 (session 2)

**No new UI was built, so the gate resolved to "no UI capability needed."** The
session's work was measurement and tooling. Recording this because a gate that
is only logged when it fires is a gate nobody trusts.

`ui-ux-pro-max` was applied in session 1 to *review* the homepage; it surfaced
*Reduced Motion* and *Motion Sensitivity* as High severity, both already
satisfied. That review is what made the reduced-motion profiling arm below
possible — every decorative layer already gates on `prefersReducedMotion()`.

### Skills — inventory verified 2026-08-07

All seven come from one MIT-licensed source,
[`nextlevelbuilder/ui-ux-pro-max-skill`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
(cloned at `C:/Users/pc/Claude_Skills/repo`, commit `14ddef5`), installed to
`~/.claude/skills/`. **Every installed copy was diffed against the repo and is
byte-identical — no local drift, and nothing to re-activate.** Full licensing
detail is in `OPEN_SOURCE_MANIFEST.md`.

| Skill | Active | Used on this project |
|---|---|---|
| `ui-ux-pro-max` | ✅ | ✅ session 1 — reviewed the homepage against WCAG/UX rules |
| `design-system` | ✅ | ✅ Phase 4 — token reconciliation |
| `design`, `brand`, `banner-design`, `slides`, `ui-styling` | ✅ | ❌ never |

**The five unused ones are installed, compatible and deliberately idle.** The
visual language is frozen by `EXPERIENCE_GOVERNANCE.md`,
`SHEETFLOW_VISUAL_DNA.md` and DEC-301/302; a generic design database's
recommendations would conflict with approved decisions rather than improve them.
None are obsolete — there is simply no work here they are the right tool for.
That is a correct outcome, not a gap to close.

---

## Baseline — 2026-08-07, all three routes in one batch

Production build, desktop preset, **median of 5**, warm-up discarded, cold
browser per run. Run back-to-back on one machine within a few minutes, which is
what makes the three **comparable to each other**.

| Route | Perf | A11y | BP | SEO | FCP | LCP | **TBT** | CLS | SI |
|---|---|---|---|---|---|---|---|---|---|
| `/` | **59** | 100 | 96 | 100 | 0.4 s | 1.2 s | **1,600 ms** | 0 | 3.9 s |
| `/services` | **96** | 100 | 96 | 100 | 0.3 s | 0.9 s | **30 ms** | 0 | 1.8 s |
| `/services/whatsapp-automation` | **97** | 100 | 96 | 100 | 0.3 s | 0.9 s | **10 ms** | 0 | 1.7 s |

### This is the strongest evidence yet on A2, and it arrived sideways

**A page in the identical visual language scores 97 while the homepage scores
59, on the same machine, minutes apart, from the same build.** TBT differs by
**more than two orders of magnitude** — 1,600 ms against 10 ms.

Everything the two share is therefore exonerated: the design tokens, the fonts,
the glass and gradient treatments, `framer-motion`, `gsap`, Lenis, the custom
cursor, and — critically — **`DeferredAtmosphere`, which mounts from the root
layout on every route including these**. None of it is what costs 1,600 ms.

What the homepage has and these do not is its specific decorative composition:
the video hero, `ParticleField`, `AIDashboard`, `WorkflowUniverse` and the large
translucent gradient layers stacked over a dark canvas.

**Why this reframes A2.** The decision was posed as *"does the cinematic
identity survive its measured cost"*, with the implied lever being "weaken the
visual signature". These numbers say the brand language is not the cost — a
handful of specific heavy components are, and a page can look unmistakably
SheetFlow at 97. The question becomes *which components*, not *how much
identity to give up*. **That is a materially different, and much easier,
decision.** It remains the founder's.

### Reading the homepage number honestly

`/` measured **59 here against 65 on 2026-08-06**. Do **not** read that as a
regression:

- Nothing shipped this phase touches the homepage's render path. The changes
  were link `href`s and moving the JSON-LD from the layout into the page — the
  same bytes, emitted from a different component.
- The documented run-to-run TBT spread on this machine is **270–6,049 ms**. A
  6-point score delta sits well inside it.
- This batch ran immediately after a 5-minute Playwright suite, with OneDrive
  active. The absolute figures are depressed by machine load.

**Cross-session absolute comparison is not valid here; the within-batch
comparison is.** That is exactly why `/` was re-measured in the same batch
rather than quoting yesterday's 65 — and it is the compare-like-with-like rule
being applied rather than recited.

## Mobile — first full baseline, 2026-08-07

Mobile preset (4× CPU **and** simulated Slow 4G), median of 5. The service
routes had never been measured on mobile at all.

| Route | Perf | FCP | LCP | TBT | CLS | SI |
|---|---|---|---|---|---|---|
| `/` | **48 — fails the ≥50 gate** | 0.9 s | 4.5 s | 4,170 ms | 0 | 7.2 s |
| `/services` | pass | 0.8 s | 4.3 s | 570 ms | 0 | 4.8 s |
| `/services/whatsapp-automation` | **59** | 0.9 s | 4.4 s | 970 ms | 0 | 4.9 s |

**The homepage fails its own mobile gate.** Desktop 97 implied nothing about
mobile, exactly as suspected — the service page drops 97 → 59 across form
factors.

### Mobile is bandwidth-bound. Desktop is paint-bound. They are different problems.

This took two falsified hypotheses to establish, both recorded below because a
wrong guess that was *checked* is worth more than a right one that was not.

LCP measured **4.3–4.5 s on all three routes** despite payloads that differ by
an order of magnitude. A metric that will not move with content is not measuring
content. Reading the report rather than guessing again: the LCP element on the
service page is the lede `<p>`, and the mobile preset simulates Slow 4G at
1.6 Mbps. **~340 kB gzipped JS plus 228 kB of preloaded fonts is roughly 2.9 s
of pure transfer before anything can paint.**

That is a different constraint from the desktop finding, and it means the
desktop conclusion does **not** transfer: on mobile the lever is bytes, not
composition.

### Two hypotheses tested and rejected

**1. "Six declared Inter weights are six woff2 files on the critical path."**
Trimmed 300/700/800 — all verified unused across `src`, with the only
`fontWeight: 700` living in the Satori OG routes that never touch this font.
Result: **607,148 bytes across 19 files, 4 preloaded totalling 228,864 bytes —
byte-identical before and after.** Inter is a *variable* font on Google Fonts,
so `next/font` emits one file per **subset**, not per weight. The weight array
never affected what shipped. The change was kept as hygiene and is explicitly
**not** claimed as an optimisation.

**2. "The full-screen boot overlay is what pins LCP."** It genuinely was
plausible: `LoadingScreen` renders `fixed inset-0 bg-void` for ~1,850 ms from
the root layout, so it played on every route, and a fixed timer would explain an
LCP that ignores content. Gated it to the homepage and re-measured the same
route with the same instrument:

| `/services/whatsapp-automation`, mobile | Before | After |
|---|---|---|
| Performance | 59 | 60 |
| **Speed Index** | 4.9 s | **3.3 s** |
| LCP | 4.4 s | 4.5 s |
| TBT | 970 ms | 1,190 ms |

**Speed Index improved 1.6 s — real and user-visible. LCP did not move.** So the
overlay was delaying *visual progress*, not the largest paint. The score change
(+1) and the TBT change are both inside this machine's spread and are noise.

**The change was kept**, on the Speed Index result and on an experience argument
that stands without any metric: a service page is a search landing surface, and
someone arriving from a query for "whatsapp automation" should not sit through a
brand boot animation before reading the answer they clicked for. The sequence is
untouched on the homepage, where it was designed to live.

### The next mobile lever, named but not taken

Bytes. Three typefaces (Inter, Fraunces, JetBrains Mono) produce **19 woff2
files, 607 kB total, 228 kB preloaded**, and Lighthouse's own top opportunity is
"reduce unused JavaScript" at 0.64 s. Reducing typefaces or subsets is a design
decision under `SHEETFLOW_VISUAL_DNA.md`, so it is **not** taken autonomously —
and after two falsified hypotheses in one session, the honest position is that
it should be *measured* before it is believed, not assumed because it sounds
right.

### Superseded

The 2026-08-06 desktop baseline was **65** (FCP 0.4 s · LCP 1.2 s · TBT ~610 ms
· CLS 0.000 · SI 3.4 s); mobile 4× was **50** and has **not** been re-run this
phase, so it remains the last measured mobile figure.

### Main-thread attribution

> **⚠ Corrected 2026-08-07.** An earlier revision of this file reported
> "1,232 ms of steady-state blocking, 0 ms under reduced motion" and concluded
> the decorative motion system caused *100% of steady-state blocking*. **That
> was an instrument artifact and is retracted.** Two defects produced it, both
> now fixed; the corrected numbers are below. The retraction is kept visible
> because a wrong number that was believed is more dangerous than no number.

#### The two defects

**1. A mount race made the metric bimodal.** `DeferredAtmosphere` mounts on
`load` then `requestIdleCallback(..., {timeout: 3000})`. Both instruments used a
hard-coded 3,000 ms load/steady boundary — the same instant. Whether the
atmosphere was animating during "steady state" came down to milliseconds of
jitter, producing two clean modes (~370 ms and ~1,300 ms) rather than a spread.
Medians then reported whichever mode an arm happened to draw more of. This is
how `no-breathe` scored **−64% in one pass and −2% in the next on identical
code**. Both scripts now split on the observed mount time.

**2. The CPU profiler inflated its own measurement.** Sampling at 100 µs is
10,000 samples/second, and that overhead lands inside the tasks being measured.
Changing *only* the interval to Chrome's 1,000 µs default moved steady-state
blocking from **1,182 ms → 555 ms** on identical code. Load-phase barely moved
(488 → 489), because it is dominated by a few large tasks rather than many small
ones — the signature of per-task observer overhead. The default is now 1,000 µs
and the script warns when it is lowered.

#### Corrected numbers

Steady state, 4 s with the page idle and the atmosphere confirmed mounted.
Measured with **CDP `Performance.getMetrics` counters**, which do not sample and
therefore carry no observer effect. Median of 7–9.

| Arm | Total main-thread task | Paint & composite |
|---|---|---|
| Motion on (ships today) | **374 ms** | 272 ms (73%) |
| Reduced motion (no atmosphere at all) | **246 ms** | 224 ms (91%) |

**The decorative atmosphere costs ~128 ms per 4 s — roughly a 9% duty cycle,
not the ~40% previously claimed.** The page burns 246 ms per 4 s even with no
atmosphere whatsoever, and 91% of that is paint.

Load-phase blocking, median of 9 at 1,000 µs sampling: **488 ms** motion on
(spread 270–6,049) vs **124 ms** reduced motion (spread 32–599), against
Lighthouse's 610 ms TBT. This gap is robust — reproduced at both sampling rates
— but it compares *mounting and running the whole atmosphere* against *never
creating it*, so it is not attributable to animation specifically.

#### What holds

**Paint and compositing dominate the main thread.** 76% of load-phase task time
and 73–91% of steady state. This is a within-run decomposition, unaffected by
either defect, and it is the finding that matters: **JavaScript is the minority
cost, which is why three phases of JS optimisation never moved the number.**

Ranked JS self-time, load phase — `next` (hydration) 138 ms, `framer-motion`
90 ms, turbopack chunk runtime 77 ms, `gsap` 37 ms, `AIDashboard.tsx` 29 ms.
`ParticleField` no longer appears in the top 20, so the earlier spatial-grid
rewrite genuinely worked.

#### What could NOT be shown

**No individual decorative effect is separable from the others.** On the fixed
instrument, every arm measured *higher* than baseline — `no-ambient-anim` +10%,
`no-breathe` +11%, `breathe-on-children` +17%, `no-particles` +24% — which is
impossible if any were removing real work. `no-blend`, `no-sheen` and
`no-backdrop-blur` were equally unseparable.

**So D17 is answered in the negative:** there is no single expensive effect to
find. The earlier "the breathing animation is 64% of the cost" conclusion was
the mount race, and the "blend modes defeat layer isolation" hypothesis is
unsupported — `no-blend` moved nothing.

The remaining paint cost is diffuse: a dark page with several large translucent
gradient layers is simply expensive to composite, with or without animation.
Reducing it is a design question (A2), not a bug hunt.

### Bundle — re-measured 2026-08-07 after Phase G.1

| | gzip | raw | budget |
|---|---|---|---|
| JS (28 files) | **338.4 kB** | 1057 kB | 360 kB |
| CSS (1 file) | **10.0 kB** | 58 kB | 40 kB |
| Largest chunk | 69.2 kB | — | 170 kB |

**The whole `/services` tree costs 11 kB gzipped JS** against the 327.4 kB
pre-Phase-G baseline — 6.6 kB for the four pages and the index, then 4.4 kB more
for the bracket motif. Cheap because the pages are server components reusing
existing client components; the OG card renderers add nothing to the client
bundle at all, since they run at the edge.

All budgets met, 21.6 kB of JS headroom.

### Tests

**144 passing** — desktop + mobile, against the production build. Smoke,
heading order, metadata, anchor integrity, external-link safety, brand-asset
serving, DEC-302 compliance, fabricated-content guard, axe WCAG 2.1 AA (default
+ reduced-motion, homepage **and** service routes), focus indicators, image alt
text, 5 viewport overflow checks, tap-target sizing, JSON-LD graph parseability
and `@id` resolution, FAQ markup/copy parity, answers present without
interaction, per-answer anchors, keyboard disclosure, `/llms.txt`, `robots.txt`
AI-crawler rules, sitemap well-formedness.

Added in G.1: every route's declared `og:image` and `twitter:image` is **fetched
and asserted to return 200 with an `image/*` type**, homepage included — a
declared image that 404s is the same failure as no image, with extra steps.

Added for the service routes: per-page graph shape (`Service`, `WebPage`,
`BreadcrumbList`, `FAQPage` all present and cross-referenced), breadcrumb order
plus **an HTTP fetch of every crumb target** so a trail cannot name a 404,
per-page canonicals (a sub-page declaring the homepage canonical asks to be
de-indexed), visible-trail/markup parity, per-page FAQ parity, single-`h1` and
heading-order checks, sitemap coverage, `/llms.txt` coverage, and two
content-governance assertions — catalogue parity and "no integration claim the
site has not already published".

### A `verify` flake to know about

`npm run audit:bundle` immediately after `npm run test:e2e` once reported *"No
JS or CSS emitted — the build looks empty"* against a `.next` that had 25
chunks on disk; re-running it passed, and a later full `npm run verify` passed
the identical sequence. Same Windows/OneDrive `.next` contention documented
above, in a new place — and it sits at the end of `verify`. **Re-run a red
`verify` once before believing it.**

---

## Discoverability surfaces — verified, not assumed

Asserted by `tests/e2e/seo.spec.ts` (10 tests), so drift breaks the build.

| Surface | State |
|---|---|
| JSON-LD `@graph` | ✅ `Organization`, `WebSite`, `WebPage`, `FAQPage`, `OfferCatalog`, 6 × `Offer`/`Service` — parseability and `@id` resolution asserted |
| `/llms.txt` | ✅ served, carries citation guidance |
| `robots.txt` | ✅ names AI crawlers, points at sitemap |
| `sitemap.xml` | ✅ well-formed, canonical URL |
| Canonical / OpenGraph / Twitter | ✅ + dynamic OG and Twitter image routes |
| FAQ | ✅ markup matches rendered copy exactly; answers in DOM without interaction; per-answer anchors; keyboard operable |
| **`BreadcrumbList`** | ⛔ **Not applicable.** Single-page site — one route plus asset routes. A breadcrumb trail for a page with no ancestors is schema spam and a rich-result risk. Add only if real sub-pages ship. |
| **`Review` / `AggregateRating`** | ⛔ **Blocked by B1, correctly.** Requires real, permissioned customer proof. Fabricating it violates the project's first standing rule and Google's policy. |

---

## Known issues

**Dependency graph is broken.** `@react-three/drei@9.122` requires
`@react-three/fiber@^8`; the project pins `^9`. Every install needs
`--legacy-peer-deps`. Pre-existing.

**Six dependencies ship nothing.** `src/components/three/` is imported by no
rendered code and the bundle contains zero Three.js symbols. That makes `three`,
`@react-three/{fiber,drei,postprocessing}`, `@splinetool/{react-spline,runtime}`
and `@types/three` dead weight, and they cause the peer conflict above. Removing
them retires the direction in `SPLINE_SCENE_BRIEF.md` — an architectural
decision (A1), not taken autonomously.

**`raw-loader`** is an unused devDependency (D4).

**npm audit**: 6 vulnerabilities (5 high, 1 low) in `next`, `postcss`,
`js-yaml`, `brace-expansion`, `sharp`, `@babel/core` — all transitive. The
Next.js advisory (middleware/proxy bypass) **does not apply**: this app has no
middleware and no locale config, both verified.

---

## Conventions

- Verification runs against the production build, never `next dev`.
- **Never report a single run.** Load-phase blocking spans 270–6,049 ms on an
  unchanged build. Report a median of N with its spread, and treat any delta
  inside the spread as unmeasured.
- **Prefer counters to samplers.** `Performance.getMetrics` is cumulative and
  carries no observer effect; a CPU sampler perturbs what it measures, badly at
  short intervals. When the two disagree, the counter wins.
- **A bimodal result is a broken instrument, not a noisy one.** Two clean modes
  mean a race, not variance, and no number of extra runs will fix it. Check
  what changes between the modes before reaching for a larger N.
- **Before believing a delta, check the impossible arms.** If removing work
  makes a number go *up*, the arms are measuring something other than what they
  claim, and none of them can be trusted — including the one that agreed with
  the hypothesis.
- Budgets and thresholds start at the measured baseline and only ratchet up.
- `public/brand/` is build output. Never hand-edit — see DEC-302.
- Installs need `--legacy-peer-deps` until the drei/fiber conflict is resolved.
- Source maps ship **off**. `npm run build:profile` turns them on for profiling
  only; the emitted JS is byte-identical either way.
