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
| Adobe, Figma, Canva | ✅ connected | Not used — DEC-302 makes `logo.png` canonical, so external design tooling would only add drift |
| Notion, Slack, Gmail, Drive, Calendar, Airtable, Calendly | ✅ connected | Not used by the build |
| ElevenLabs | ✅ connected | Candidate for the dormant audio system (`public/audio/`) |

### Requested but unavailable

| Capability | Status | Substitute in use |
|---|---|---|
| Chrome DevTools MCP | not installed | Lighthouse + Playwright tracing |
| Playwright MCP | not installed | Playwright directly — strictly more capable here |
| Context7 | not installed | — |
| 21st.dev | not installed | — |
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
