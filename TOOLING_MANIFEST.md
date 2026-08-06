# Tooling Manifest

> What this project can actually do, verified rather than assumed.
> Maintained automatically. Last verified: **2026-08-06**.

---

## Verification toolchain

| Capability | Tool | Command | Status |
|---|---|---|---|
| Types | TypeScript 5.6 | `npm run type-check` | ✅ |
| Lint | ESLint 9 (flat config) | `npm run lint` | ✅ 9 known warnings |
| Build | Next.js 16.2.6 (Turbopack) | `npm run build` | ✅ 8/8 routes |
| E2E + a11y + SEO | Playwright 1.62 + axe-core 4.12 | `npm run test:e2e` | ✅ 70 tests |
| Lighthouse | lighthouse 13.4 | `npm run audit:lh` | ✅ median of N |
| CLS attribution | Playwright + PerformanceObserver | `node scripts/probe-cls.mjs` | ✅ |
| Bundle budget | custom, gzip-accurate | `npm run audit:bundle` | ✅ |
| Bundle treemap | `@next/bundle-analyzer` | `npm run analyze` | ✅ |
| Brand assets | sharp 0.34 / libvips 8.17 | `npm run brand` | ✅ |
| Everything | — | `npm run verify` | ✅ |

`npm run audit:lh` reuses Playwright's Chromium over CDP rather than adding
`chrome-launcher` and a second browser download, so audits and tests measure the
same engine.

Playwright runs against the **production** build (`npm start`). Dev-mode
accessibility and performance numbers describe a build nobody ships.

---

## Available integrations

| Integration | State | Notes |
|---|---|---|
| GitHub | ✅ `gh` 2.96.0 | Repo ops, PRs |
| **Vercel CLI** | ✅ **58.7.0, authenticated** | Logged in as `sheetflow51-prog`, scope `sheetflow51-progs-projects`. Project linked via `.vercel/project.json`. **This is the working path for deployments.** |
| Vercel MCP | ⛔ **403 Forbidden** | Authenticated to a *different* account than the one owning this project: `Not authorized ... under scope "sheetflow51-progs-projects". You must re-authenticate to this scope.` Re-authorise the claude.ai Vercel connector against that scope to use it. Until then, use the CLI. |
| **Calendly** | ✅ **used** | Verifies the site's primary conversion path. `contact.ts` points at `calendly.com/sheetflow51/30min`; the API confirms that exact `scheduling_url`, `active: true`, `duration: 30`, `is_paid: false`, name "Free Automation Audit". The CTA and the FAQ's "free 30-minute audit" answer are both factually true. |
| Adobe, Figma, Canva | ✅ connected, **not used** | DEC-302 makes `logo.png` canonical and `public/brand/` generated. Routing brand assets through external design tooling would reintroduce exactly the drift DEC-301/302 exist to prevent. Figma would earn its place only if a Figma file became a design source; none exists. |
| ElevenLabs | ✅ connected, **not used** | Could produce the five UI sounds `public/audio/README.md` specifies. Not done: the audio system is deliberately dormant, ships no files, and autoplays never. Adding ~285 kB of audio for a feature no visitor triggers fails the "every asset must justify its existence" test. Reconsider if audio is switched on. |
| Notion, Slack, Gmail, Drive, Calendar, Airtable | ✅ connected, **not used** | No build or verification need. Using them would be tool theatre. |

### Requested but unavailable

| Capability | Status | Substitute in use |
|---|---|---|
| Chrome DevTools MCP | not installed | Lighthouse (median-of-N) + Playwright tracing + `probe-cls.mjs`. These already produce the traces, CWV numbers and shift attribution the MCP would. Install: `claude mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest` |
| Playwright MCP | not installed | Playwright directly — strictly more capable here, since the suite needs fixtures, projects and a `webServer`, none of which the MCP exposes |
| Context7 | not installed | Would supply live framework docs. Not blocking: this is a single Next.js 16 app on a stable API surface, and no phase has stalled on documentation. Install: `claude mcp add context7 -- npx -y @upstash/context7-mcp@latest` |
| 21st.dev | not installed | Supplies premium React components. **Deliberately declined**: the component language is already defined in `brand-os/03_component-language` and implemented against the design tokens. Importing third-party components would fork the design system, which is the drift DEC-302 exists to prevent. |

## Capability selection for UI work

**Before writing any new UI, check whether an existing capability produces a
better result than hand-authoring. Record the choice and the reason.**

Ask in this order, stopping at the first that applies:

| # | Capability | Use it when | Why it usually loses here |
|---|---|---|---|
| 1 | **Figma MCP** | A Figma file is the design source — implement from the real frames rather than re-deriving them | Account is **starter tier, View seat**, and no SheetFlow design file exists. Nothing to read. |
| 2 | **`ui-ux-pro-max`** | Reviewing UI against WCAG/UX rules, or choosing patterns for a genuinely new surface | Good for *review*. Its style/colour/typography recommendations must not override `EXPERIENCE_GOVERNANCE.md`, `SHEETFLOW_VISUAL_DNA.md` or DEC-301/302. |
| 3 | **`design-system` skill** | Token architecture, component specs, drift checks | Already applied (Phase 4 reconciliation). |
| 4 | **GitHub search (`gh`)** | A well-solved primitive exists (focus traps, disclosure, virtual lists) — read a proven implementation before inventing one | Fine, but licence and design-system fit must be checked before copying. |
| 5 | **21st.dev** | Need a premium component fast and no design system exists | **Not installed, and declined**: `brand-os/03_component-language` already defines the component language. Importing third-party components forks the design system — the drift DEC-302 exists to prevent. |
| 6 | **Chrome DevTools MCP** | Deep runtime profiling beyond Lighthouse | Not installed. Lighthouse (median-of-N), Playwright tracing and `probe-cls.mjs` already cover traces, CWV and shift attribution. |
| 7 | **Context7** | Blocked on a library's current API | Not installed. Never been the blocker: `node_modules` carries the exact installed types, which is more authoritative than a docs index, and behaviour is verified empirically (build output, rendered HTML, tests). |
| 8 | **Adobe / Canva** | Producing raster or vector marketing assets | DEC-302 makes `logo.png` canonical and `public/brand/` generated. Routing brand assets through external tools reintroduces drift. |
| 9 | Hand-author | Nothing above applies | The usual outcome here, because the design system is already defined in code and governed. |

### Applied 2026-08-06

Selected **`ui-ux-pro-max`** to review the homepage rather than to design
anything — the only option that adds value without overriding approved
decisions. It surfaced two High-severity rules worth checking:

- *Reduced Motion* — respect `prefers-reduced-motion`
- *Motion Sensitivity* — parallax and scroll-jacking cause nausea; do not force
  scroll effects

Audited against the implementation: `SmoothScroll` (Lenis), `Parallax`,
`ParticleField`, `AmbientBackground`, `CustomCursor` and `DeferredAtmosphere`
all guard on `prefersReducedMotion()`, with a global CSS fallback, and focus
indicators are asserted by an existing test. **No violations, so no UI change
was made.** Recorded because "we checked and it was already correct" is a
result, not a non-event.

### Skills

`design-system` was used (Phase 4 token reconciliation). `ui-ux-pro-max`,
`brand`, `design`, `banner-design`, `slides` and `ui-styling` are installed and
**not used**: the visual language is frozen by `EXPERIENCE_GOVERNANCE.md`,
`SHEETFLOW_VISUAL_DNA.md` and DEC-301/302, and a generic design database's
recommendations would conflict with approved decisions rather than improve
them. No banners or slide decks are required by this project.
| Autodesk, Roboflow, Vaisala | ⚠️ unauthenticated | Not relevant to this project |

Servers needing auth must be authorised from claude.ai connector settings, or
via `claude mcp` / `/mcp` in an interactive session. Not possible from here.

---

## Baseline — 2026-08-06

First quantitative measurement in the project's history. Every prior figure in
the repo was an aspiration.

### Lighthouse (production build, median of N, warm-up discarded)

| Category | Desktop | Mobile 4x | Gate |
|---|---|---|---|
| Performance | **60** | **50** | ≥50 |
| Accessibility | **100** | — | ≥90 |
| Best practices | **96** | — | ≥90 |
| SEO | **100** | — | ≥90 |

| Metric | Desktop | Mobile 4x |
|---|---|---|
| First Contentful Paint | 0.4 s | — |
| Largest Contentful Paint | 1.3 s | 4.3 s |
| **Total Blocking Time** | **~950 ms** | **~2,080 ms** |
| Cumulative Layout Shift | **0.000** | 0.000 |
| Speed Index | 3.7 s | — |

**TBT is noisy on this machine** — 443–1,223 ms across runs of an unchanged
build. Treat any delta under ~800 ms as unmeasurable. This is why the runner
discards a warm-up and reports a median.

### Bundle

| | gzip | raw | budget |
|---|---|---|---|
| JS (17 files) | **327.4 kB** | 1031 kB | 360 kB |
| CSS (1 file) | **9.6 kB** | 56 kB | 40 kB |

Up 6 kB from Phase A: code-splitting the deferred atmosphere adds chunk
overhead. The trade is deliberate — the largest single chunk fell from 96.9 kB
to 69.2 kB, and the atmosphere is no longer on the critical path.
| Largest chunk | 96.9 kB | — | 170 kB |

### Tests

70 passing — desktop + mobile. Smoke, heading order, metadata, anchor
integrity, external-link safety, brand-asset serving, DEC-302 compliance,
fabricated-content guard, axe WCAG 2.1 AA (default + reduced-motion), focus
indicators, image alt text, 5 viewport overflow checks, tap-target sizing,
JSON-LD graph parseability and `@id` resolution, FAQ markup/copy parity,
answers present without interaction, per-answer anchors, keyboard disclosure,
`/llms.txt`, `robots.txt` AI-crawler rules, sitemap well-formedness.

---

## Known issues

**Dependency graph is broken.** `@react-three/drei@9.122` requires
`@react-three/fiber@^8`; the project pins `^9`. Every install needs
`--legacy-peer-deps`. Pre-existing.

**Six dependencies ship nothing.** `src/components/three/` — `AICore`,
`IntelligenceCore`, `SplineScene` — is imported by no rendered code, and the
bundle contains zero Three.js symbols. That makes `three`,
`@react-three/{fiber,drei,postprocessing}`, `@splinetool/{react-spline,runtime}`
and `@types/three` dead weight, and they are the cause of the peer conflict
above. Removing them is an **architectural decision** (it retires the planned
Spline direction documented in `SPLINE_SCENE_BRIEF.md`) and is not taken
autonomously.

**`raw-loader`** is an unused devDependency (D4), left from a webpack rule
deleted in M00.

**npm audit**: 6 vulnerabilities (5 high, 1 low) in `next`, `postcss`,
`js-yaml`, `brace-expansion`, `sharp`, `@babel/core` — all transitive. The
Next.js advisory (middleware/proxy bypass) **does not apply**: this app has no
middleware and no locale config, both verified.

---

## Conventions

- Verification runs against the production build, never `next dev`.
- Budgets and thresholds start at the measured baseline and only ratchet up. A
  gate that has never been met gets ignored, which is worse than no gate.
- `public/brand/` is build output. Never hand-edit — see DEC-302.
- Installs need `--legacy-peer-deps` until the drei/fiber conflict is resolved.
