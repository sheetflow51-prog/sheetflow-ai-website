# SheetFlow V2

## Current Milestone

M01

## Current Status

**In progress — awaiting review.**

M01 was authorised by the founder and scoped as the production-foundation
rebuild. The first execution phase is complete, verified, committed, and pushed
to `origin/feat/m01-foundation`. Working tree clean apart from an untracked
`.gitignore` edit not made by this milestone.

Production deployment has **not** been performed and awaits explicit approval.

## Completed Tasks

M01 phase 1 — proof architecture, design-token reconciliation, and an
accessibility pass.

M01 phase 2 — **toolchain build-out and the first real performance
attribution.** Six MCP servers installed and handshake-verified; a
source-mapped main-thread profiler added; TBT attributed to its actual cause
for the first time in the project's history. Full detail in `CHANGELOG.md`.

M00's completed task list is recorded in `CHANGELOG.md` and sealed at tag
`v2-m00-foundation`.

## Headline finding — TBT is paint, not JavaScript

`npm run profile` (CDP CPU profiler + source maps, median of 9):

| Arm | Load-phase blocking | Steady state (3 s idle) |
|---|---|---|
| Motion on (ships today) | 453 ms (spread 233–843) | 1,232 ms (spread 0–3,428) |
| Reduced motion | 166 ms (spread 142–596) | **0 ms (spread 0–0)** |

The decorative motion system is **~63% of TBT and 100% of steady-state
blocking**. `(program)` — paint, layout, compositing — is **~65% of the main
thread**. Three previous optimisation phases targeted JavaScript, which is the
minority cost; that is why they did not move the number.

**Lighthouse never saw the steady-state cost** because TBT stops at
interactive. An idle page blocking ~1.2 s of every 3 s still costs battery,
scroll smoothness and INP.

**Which specific effect is responsible is NOT known** — see D17. Four narrower
experiments failed to separate above the noise floor. The next step is a
paint-level trace via chrome-devtools MCP, not a code change.

## Current Blockers

**B1 — Engagements corroborated; permission still required.** Vercel access
(gained 2026-08-06) confirms three of the four named projects are real, deployed
sites under the founder's own account: `sparc-physiotherapy.vercel.app`,
`saraswati-dental-clinic.vercel.app` and `r3s-realty.vercel.app`, all returning
HTTP 200. `r3s-realty-agra.vercel.app` is unreachable; "Elevate WPC" is not on
Vercel.

This resolves the *existence* question that blocked B1 — these are not invented.
It does not resolve publication. Nothing shows these are paying clients, that
any outcome was measured, or that anyone consented to be named. Both "customer
proof" and "portfolio permission" are founder decisions, so the entries remain
`pending` and render nothing.

**To unblock:** for each project, written permission to name it publicly, plus
either a measured outcome with stated methodology or agreement to show the work
with no metric attached. The architecture already supports the second case —
a case study can carry a summary without a metric.

## Decision Register

Decisions now live in **`DECISIONS.md`** (new this session), which consolidates
what was scattered across this file and `brand-os/07_governance/`. The summary
below is retained for continuity; `DECISIONS.md` is authoritative.

New this session: **D13** (`.gitignore` negation — resolved), **D14** (MCP
servers project-scoped), **D15** (component registries declined), **D16**
(source maps profiling-only), **D17** (which paint effect costs — open), **A2**
(does the cinematic identity survive its measured cost — founder call).

## Open Decisions

**D1 — RESOLVED.** Every fabricated trust signal has been removed and replaced
with an architecture that cannot publish an unverified claim. Enforcement lives
in the type system, not in reviewer discipline: `src/content/proof.ts` gives
`pending` entries nowhere to put a metric. Production still serves the old
build until a deployment is approved.

**D2 — Deployment reconciliation.** `origin/main` (`92057ca`) and the M00 branch
remain diverged: 13 ahead, 1 behind. No fast-forward path exists. Resolution
strategy (merge / rebase / discard `92057ca`) is undecided. A force push would
be required to overwrite `origin/main` and has not been attempted.

**D3 — No Vercel control-plane access.** `list_teams` returns empty and
`list_projects` fails, so the deployment cannot be disabled, rolled back, or
reconfigured programmatically. Any Vercel-side change is manual.

**D4 — `raw-loader` is now an unused devDependency.** Its only consumer was the
webpack rule deleted in M00. Removal requires founder approval for package
changes.

**D5 — `.eslintrc.json`** retained per founder decision, but inert: ESLint
9.39.4 uses flat config and ignores it. Slated for the tooling milestone.

**D6 — `typescript.ignoreBuildErrors: true`** remains set in `next.config.mjs`,
so `next build` does not gate on type errors. `npm run type-check` is the real
gate and passes independently.

**D7 — Stray `C:\Users\pc\package-lock.json`** (81 bytes) makes Next infer the
wrong workspace root. Outside the repository; deletion is the founder's call.

**D8 — `.claude/` directory** is untracked and not ignored.

**D12 — Preview deployments are SSO-protected.** Latest preview
`sheetflow-ai-website-muphh4vl9-sheetflow51-progs-projects.vercel.app`
(Ready, 2026-08-06). Like the first, it returns 302 to
`vercel.com/sso-api` for anonymous requests. A logged-in Vercel session opens
it normally. Automated verification against a preview URL would need either a
protection-bypass secret or protection relaxed — both are security settings and
therefore founder decisions. Verification is currently run against the
identical production build locally.

**D9 — `violet` token migration.** `violet` is now a deprecated alias holding
gold values. 34 usages remain on the old name. Migration is mechanical and
visually inert (both names resolve to identical hex), but has not been done.

**D10 — RESOLVED.** `ink.400` retuned from `#6B7490` (4.26:1) to `#717B98`
(4.81:1 on void, 4.70:1 on glass), fixing all usages at the token. Lighthouse
accessibility is 100 and axe reports zero WCAG 2.1 AA violations in both the
default and reduced-motion paths.

**A1 — Is the Spline/3D direction still live?** `src/components/three/`
(`AICore`, `IntelligenceCore`, `SplineScene`) is imported by no rendered code,
and the shipped bundle contains zero Three.js symbols. Six dependencies —
`three`, `@react-three/{fiber,drei,postprocessing}`,
`@splinetool/{react-spline,runtime}` — exist only for it, and their peer
conflict (`drei@9` wants `fiber@^8`, project pins `^9`) is what forces
`--legacy-peer-deps` on every install. Removing them retires the direction
documented in `SPLINE_SCENE_BRIEF.md`, so it is a founder decision.

**D11 — `.gitignore` was modified outside this milestone** (adding `.vercel`
and `.env*`) and is left unstaged. Sensible, but unattributed.

## Next Milestone

M02 — not defined in this repository.

## Latest Commit

`e5cbb3b` — `fix(a11y): raise label contrast to AA in the new proof components`

Branch `feat/m01-foundation`, pushed to `origin/feat/m01-foundation`. A
follow-up commit finalises `CHANGELOG.md` and this file.

## Current Lighthouse

Measured **2026-08-06**, production build, via `npm run audit:lh`
(median of N, warm-up discarded, cold browser per run).

| Category | Desktop | Mobile (4x CPU) |
|---|---|---|
| Performance | **65** | **50** |
| Accessibility | **100** | — |
| Best practices | **96** | — |
| SEO | **100** | — |

Desktop: FCP 0.4s · LCP 1.2s · **TBT ~610ms** · **CLS 0.000** · SI 3.4s
Mobile: LCP 4.3s · TBT ~2,080ms · CLS 0.000 (measured Phase B; not re-run)

**Read TBT with care.** Run-to-run spread on this machine is 443–1,223 ms for
an unchanged build. Only differences larger than that are real. Phase B
eliminated CLS but did not move TBT.

`DEPLOYMENT.md`'s targets remain aspirations and should be read as such.

## Current Bundle Size

**13 client JS chunks, 1,048,349 bytes raw (1.00 MB), 321 kB gzipped** in
`.next/static/chunks`, from the green Turbopack build. Byte-identical to the
M00 baseline after M01 phase 1.

Not comparable to the ~165 kB "First Load JS" figure in `DEPLOYMENT.md`, which is
a per-route gzipped metric. Next 16 no longer prints per-route sizes in default
build output, so that documented baseline remains **unverified**.

## Notes

**Repository shape:** root holds 5 directories — `10_Final_Website/` (the Next.js
app and Vercel root), `Documentation/` (`Approved/` pointer + `Archive/`),
`brand-os/`, `docs/`, `.claude/`.

**Test infrastructure:** Playwright 1.62 + axe-core, 50 tests across desktop and
mobile, running against the production build. Lighthouse and gzip-accurate
bundle budgets wired as `npm run audit:lh` / `audit:bundle`; `npm run verify`
runs the lot. This closes the largest structural gap carried into M01.

**Accessibility:** the M00 Hero change lifted subhead contrast on `void #060608`
from ~8.4:1 to ~14.9:1. No systematic audit has been performed.

**Lint debt:** 9 warnings — 7 `react-hooks/set-state-in-effect` (deliberately
downgraded with documented rationale in `eslint.config.mjs`) and 2 unused disable
directives in `layout.tsx`.

---

*No conflict with the Constitution or Decision Register was detected during M00.
M01 not begun; awaiting founder authorisation.*
