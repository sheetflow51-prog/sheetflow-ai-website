# SheetFlow v2 Changelog

## Phase B - Layout Stability and Measurement Rigour (2026-08-06)

### Fixed

- **Cumulative Layout Shift eliminated: 0.079 -> 0.000.** The boot flourish
  animated `top` from 50% to 0% to 100%, driving a layout on every frame. It
  was the site's entire CLS. Now animates `y`, which compiles to a compositor
  transform. Verified with a live `PerformanceObserver`, not just Lighthouse.
- Particle field's connection pass rewritten from an all-pairs O(n²) scan
  (8,385 distance checks per frame) to a uniform spatial grid, and throttled
  from 60fps to 30fps. Squared-distance comparison removes a `sqrt` per
  candidate pair.
- The decorative layer — particles, aurora, cursor, grain, scroll rail, boot
  flourish, dormant audio engine — moved off the critical path into
  `DeferredAtmosphere`. It mounts after `load` and idle, is excluded from the
  server payload, and is never downloaded at all under `prefers-reduced-motion`.

### Measurement

The harness was producing numbers that could not be trusted. Five consecutive
runs of an *unchanged* build reported Total Blocking Times of 11,121 / 586 /
655 / 538 / 701 ms; one contended sample read as a catastrophic regression and
was noise.

`npm run audit:lh` now discards a warm-up pass, launches a cold browser per
run, and reports the median of N. `LH_PRESET=mobile` adds the 4x-CPU / slow-4G
profile. Added `scripts/probe-cls.mjs` for layout-shift attribution, which
found the `top` keyframe that Lighthouse could not attribute.

### Honest result

Measured against the previous commit with identical methodology (median of 5):

| Metric | Before | After |
|---|---|---|
| CLS | 0.079 | **0.000** |
| Performance | 62 | 60-63 |
| Total Blocking Time | 700 ms | 950 ms |
| LCP | 1.3 s | 1.2-1.3 s |

**CLS is fixed. TBT did not improve.** The O(n²) rewrite and the deferral are
sound engineering — strictly less work, and off the critical path — but neither
was the dominant cost on this hardware, and the run-to-run spread (443-1,223 ms)
exceeds any delta between them. Reported as measured rather than as intended.

An interim revision made TBT genuinely worse by mounting the deferred layer in
a `requestIdleCallback`, which fires inside the window TBT measures. Corrected
to gate on `load` first.

## Phase A - Verification Harness (2026-08-06)

The project had no test infrastructure of any kind, and none of the mandated
quality gates could run. Built the harness first, then measured.

### Added

- Playwright 1.62 against the **production** build, desktop + mobile.
  50 tests: smoke, heading order, metadata, in-page anchor integrity,
  external-link safety, brand-asset serving, DEC-302 compliance, a
  fabricated-content guard, axe WCAG 2.1 AA (default *and* reduced-motion),
  focus indicators, image alt text, 5-viewport overflow, tap-target sizing.
- `scripts/audit-lighthouse.mjs` — reuses Playwright's Chromium over CDP
  instead of adding a second browser download.
- `scripts/audit-bundle.mjs` — gzip-accurate budgets that fail the build.
- `@next/bundle-analyzer`, which `npm run analyze` had always referenced but
  which was never installed; the script silently no-opped.
- `AI_RUNTIME_MEMORY.md` and `TOOLING_MANIFEST.md`.
- `npm run verify` — preflight + e2e + bundle.

### Fixed (found by the new gates)

- **Accessibility 100.** `ink.400` was `#6B7490`, measuring 4.26:1 on void —
  under the AA floor — and axe flagged it across nav, section captions and
  footer. Retuned to `#717B98` (4.81:1 on void, 4.70:1 on glass), fixing all
  21 usages at the token.
- Primary button was white on `#3B82F6` = 3.68:1, and its hover *lightened* to
  `#60A5FA` = 2.54:1 — the state a user is most likely reading was the least
  legible. Base moved to `accent-deep` (5.17:1); hover now lifts and brightens
  the glow instead of the fill.
- Footer links were 16px tall, under WCAG 2.2 SC 2.5.8's 24px pointer-target
  floor.
- Footer group headings were `h4` directly under the section `h2`, skipping a
  level and breaking screen-reader outline navigation.

### Baseline (first ever measured)

Lighthouse desktop: **performance 65, accessibility 100, best-practices 96,
SEO 100**. FCP 0.4s, LCP 1.4s, TBT 490ms, CLS 0.103, SI 3.0s.
Bundle: 321.3 kB JS gzip (1024 kB raw, 16 files), 9.6 kB CSS.

### Found, not acted on

- `src/components/three/` is imported by nothing and the bundle contains zero
  Three.js symbols. Six dependencies exist solely for it, and they are what
  forces `--legacy-peer-deps` on every install. Retiring them retires the
  planned Spline direction — an architectural decision, escalated not taken.

## M01 - Production Foundation (in progress)

Branch `feat/m01-foundation`, cut from `feat/m00-foundation` at `66f5059`.

### Proof architecture — resolves D1

- Added `src/config/features.ts`: env-backed flags for `caseStudies`,
  `testimonials`, `trustLogos`, `results`. All default to `false`.
- Added `src/content/proof.ts`: the single source of truth for customer-facing
  claims. Entries are a discriminated union on `status`; only `'verified'`
  entries carry claim fields, so an unverified metric has nowhere to be typed.
  The `published*()` selectors are the only surface the UI reads.
- Added `src/components/ui/ProofPlaceholder.tsx`.
- Removed every fabricated trust signal: the six invented trust-strip names and
  the three invented case studies with their invented metrics and quotes.
- Relabelled the AIDashboard mock from "Live / Updated 2s ago" to
  "Product preview / Sample data".

### Design system

- Ran the `TOKENS.md` drift check for the first time. `brand-os/tokens.ts` was
  the stale file: it still held the pre-rebrand indigo/violet palette while the
  site had moved to the logo's blue + gold under `0920b03`. Corrected the
  source-of-truth files to the shipped values.
- Added a correctly named `gold` scale and the missing `cyan` scale. `violet`
  retained as a deprecated alias so all 34 existing usages keep resolving.

### Accessibility

- Raised the new proof components' small-label contrast from 4.26:1 to 8.31:1.

### Commits

| Hash | Description |
|---|---|
| `a197efc` | `feat(m01): proof architecture with verification enforced in the type system` |
| `44440e6` | `fix(design-system): reconcile brand-os tokens with the shipped palette` |
| `e5cbb3b` | `fix(a11y): raise label contrast to AA in the new proof components` |

### Verification

- `npm run type-check` — exit 0
- `npm run lint` — exit 0 (9 pre-existing warnings, none introduced)
- `npm run build` — exit 0, 8/8 routes
- Bundle: 1,048,349 bytes across 13 client chunks (321 kB gzipped) — unchanged
  from the M00 baseline
- Build output confirmed free of every removed name

### Deliberately not done

- The four founder-named engagements (R3S Realty, Saraswati Dental, Sparc
  Physiotherapy, Elevate WPC) were not published. They could not be
  corroborated anywhere in this repository or the surrounding workspace, and
  are held as `pending` entries carrying no claims.
- No client logo assets were generated. Generating one for an unverified
  company would convert a text placeholder into a forged endorsement.
- The 34 `violet-*` usages were not migrated to `gold-*`.
- 14 pre-existing `ink-400` small-text call sites still measure below AA.

## M00 - Foundation
- Created backup branch
- Created feature branch
- Repository inventory completed
- Repository structure reviewed
- Execution contract adopted (external governance)
- Archived 11 reference folders into `Documentation/Archive/` (118 files, all renames, no content change)
- Added `Documentation/Approved/` as a pointer to external CoWork governance
- Added root `.gitignore` and `CHANGELOG.md`
- Repaired 30 broken link targets in `MASTER_INDEX.md`
- Repaired the build so `npm run build` passes with no manual flags

### Commits

| Hash | Description |
|---|---|
| `5e8ef5d` | `fix(hero): raise headline legibility over background video` |
| `5b3b8ba` | `chore(m00): archive reference material, repair index links and build` |

Tagged: `v2-m00-foundation`

### Verification at close of M00

- `npm run type-check` — exit 0
- `npm run lint` — exit 0 (9 pre-existing warnings, none introduced)
- `npm run build` — exit 0, 19.8s, 8/8 routes, default Turbopack path

### Deliberately not done in M00

- `10_Final_Website/` was not relocated, to preserve the Vercel root directory setting
- `.eslintrc.json` retained pending the tooling milestone
- Deployment reconciliation deferred by founder instruction
- Fabricated marketing claims remain unresolved and still live in production
