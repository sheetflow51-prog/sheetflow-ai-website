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
