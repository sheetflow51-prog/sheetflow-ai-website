# Tooling Manifest

> What this project can actually do, verified rather than assumed.
> Maintained automatically. Last verified: **2026-08-06**.

Every row below was tested in the session that wrote it. "Connected" means a
health check passed. **"Usable" means a capability was exercised and returned
real data** — a server that starts but has never answered a question is
`configured`, not `usable`.

---

## Verification toolchain

| Capability | Tool | Command | Status |
|---|---|---|---|
| Types | TypeScript 5.6 | `npm run type-check` | ✅ |
| Lint | ESLint 9 (flat config) | `npm run lint` | ✅ 9 known warnings |
| Build | Next.js 16.2.6 (Turbopack) | `npm run build` | ✅ 10 routes |
| E2E + a11y + SEO | Playwright 1.62 + axe-core 4.12 | `npm run test:e2e` | ✅ 70 tests |
| Lighthouse | lighthouse 13.4 | `npm run audit:lh` | ✅ median of N |
| **Main-thread CPU profile** | **CDP + source maps (new)** | **`npm run profile`** | ✅ **median of N, module-attributed** |
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
| **chrome-devtools** | 1.6.0 | ✅ | ✅ handshake | n/a | ⏳ next session | 29 |
| **context7** | 3.2.5 | ✅ | ✅ handshake | none needed | ⏳ next session | 2 |
| **sequential-thinking** | 0.2.0 | ✅ | ✅ handshake | n/a | ⏳ next session | 1 |
| **playwright** | 1.63.0-alpha | ✅ | ✅ handshake | n/a | ⏳ next session | 24 |
| **filesystem** | 0.2.0 | ✅ | ✅ handshake | n/a | ⏳ next session | 14 |
| **github** (remote HTTP) | — | ✅ configured | ⛔ | ⛔ **needs OAuth** | ❌ | — |

**⏳ is not a hedge — it is how MCP works.** Servers attach at session start.
They were added mid-session, so the session that installed them could not call
them. They are live from the next session onward; nothing further is required.

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

### Applied 2026-08-06 (session 2)

**No new UI was built, so the gate resolved to "no UI capability needed."** The
session's work was measurement and tooling. Recording this because a gate that
is only logged when it fires is a gate nobody trusts.

`ui-ux-pro-max` was applied in session 1 to *review* the homepage; it surfaced
*Reduced Motion* and *Motion Sensitivity* as High severity, both already
satisfied. That review is what made the reduced-motion profiling arm below
possible — every decorative layer already gates on `prefersReducedMotion()`.

### Skills

`design-system` was used (Phase 4 token reconciliation). `ui-ux-pro-max` was
used for review. `brand`, `design`, `banner-design`, `slides` and `ui-styling`
are installed and **not used**: the visual language is frozen by
`EXPERIENCE_GOVERNANCE.md`, `SHEETFLOW_VISUAL_DNA.md` and DEC-301/302, and a
generic design database's recommendations would conflict with approved
decisions rather than improve them.

---

## Baseline — 2026-08-06

### Lighthouse (production build, median of N, warm-up discarded)

| Category | Desktop | Mobile 4x | Gate |
|---|---|---|---|
| Performance | **65** | **50** | ≥50 |
| Accessibility | **100** | — | ≥90 |
| Best practices | **96** | — | ≥90 |
| SEO | **100** | — | ≥90 |

Desktop: FCP 0.4 s · LCP 1.2 s · **TBT ~610 ms** · **CLS 0.000** · SI 3.4 s

### Main-thread profile — first module-level attribution in the project's history

`npm run profile`, production build, source-mapped, median of 9, warm-up discarded.

| Arm | Load-phase blocking | Steady-state blocking (3 s, page idle) |
|---|---|---|
| **Motion on (ships today)** | **453 ms** (spread 233–843) | **1,232 ms** (spread 0–3,428) |
| **Reduced motion** | **166 ms** (spread 142–596) | **0 ms** (spread 0–0) |

Two findings, at very different confidence levels.

**1. The instrument is calibrated.** Load-phase blocking measured 603 ms in one
5-run pass and 453 ms in a 9-run pass, against Lighthouse's 610 ms TBT. It is
measuring the same phenomenon Lighthouse reports.

**2. The decorative motion system is the dominant cost — high confidence.**
Steady-state is the decisive result: with motion on, an idle page blocks the
main thread for ~1.2 s of every 3 s. With reduced motion, **zero long tasks in
all nine runs (spread 0–0)**. That is categorical, not marginal. Load-phase
blocking falls ~63% (453 → 166 ms), reproduced across independent 5-run and
9-run passes.

**Lighthouse never sees the steady-state cost**, because TBT stops at
interactive. It is nonetheless real: battery drain, scroll jank, and INP risk on
every device that stays on the page.

### Where the time goes

`(program)` — paint, layout, style, compositing — is **~65% of the main thread**
in both phases. JS is the minority cost. Ranked JS self-time, load phase:

| Module | Load | Steady |
|---|---|---|
| `next` (React runtime + hydration) | 138 ms | 217 ms |
| `framer-motion` | 90 ms | 45 ms |
| turbopack chunk runtime | 77 ms | 52 ms |
| `gsap` | 37 ms | 17 ms |
| `src/components/sections/AIDashboard.tsx` | 29 ms | 14 ms |

`ParticleField` no longer appears in the top 20 — the spatial-grid rewrite
worked. **The remaining cost is not JavaScript. It is paint.**

### What could NOT be shown

Four narrower experiments — `no-blend`, `no-sheen`, `no-ambient-anim`,
`no-backdrop-blur` (`PROFILE_EXPERIMENT=` in the profiler) — **failed to
separate above the noise floor.** Spreads overlapped completely, and
`no-ambient-anim` scored *worse* than baseline, which is physically implausible.

**No conclusion may be drawn about which specific effect is responsible.** The
`mix-blend-mode: screen` sheen and the `plus-lighter` cursor glow remain the
leading suspects on theory — blend modes defeat layer isolation and force
backdrop read-back — but that is a hypothesis, not a measurement. Confirming it
needs a paint-level trace, which is exactly what **chrome-devtools MCP** provides
and a CPU profiler cannot.

### Bundle

| | gzip | raw | budget |
|---|---|---|---|
| JS (17 files) | **327.4 kB** | 1031 kB | 360 kB |
| CSS (1 file) | **9.6 kB** | 56 kB | 40 kB |
| Largest chunk | 69.2 kB | — | 170 kB |

### Tests

70 passing — desktop + mobile. Smoke, heading order, metadata, anchor
integrity, external-link safety, brand-asset serving, DEC-302 compliance,
fabricated-content guard, axe WCAG 2.1 AA (default + reduced-motion), focus
indicators, image alt text, 5 viewport overflow checks, tap-target sizing,
JSON-LD graph parseability and `@id` resolution, FAQ markup/copy parity,
answers present without interaction, per-answer anchors, keyboard disclosure,
`/llms.txt`, `robots.txt` AI-crawler rules, sitemap well-formedness.

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
- **Never report a single run.** Load-phase blocking spans 233–843 ms on an
  unchanged build. Report a median of N with its spread, and treat any delta
  inside the spread as unmeasured.
- Budgets and thresholds start at the measured baseline and only ratchet up.
- `public/brand/` is build output. Never hand-edit — see DEC-302.
- Installs need `--legacy-peer-deps` until the drei/fiber conflict is resolved.
- Source maps ship **off**. `npm run build:profile` turns them on for profiling
  only; the emitted JS is byte-identical either way.
