# SheetFlow V2

## Current Milestone

M01

## Current Status

**Ready.**

M00 is closed, committed, tagged `v2-m00-foundation`, and pushed to
`origin/feat/m00-foundation`. The full verification suite is green and the
working tree is clean.

M01 has **not** been started, scoped, or planned. Its definition lives in the
external Execution Contract (Claude CoWork). Awaiting founder authorisation
before any M01 work begins.

## Completed Tasks

None for M01 — not yet started.

M00's completed task list is recorded in `CHANGELOG.md` and sealed at tag
`v2-m00-foundation`.

## Current Blockers

None.

## Open Decisions

Carried forward from M00. None block the start of M01, but all remain unresolved.

**D1 — Fabricated marketing claims are still live in production.** Two distinct
generations exist: the deployed set (`Strata Ops` $847K, `Northfield Capital`
92%, `Parallel Logistics` 4s, MRR +18.4%) and the newer set in the working tree
(`North Clinic` +38%, `Oakwood Realty` <1 min, `Summit Coaching` 12 hrs) under a
kicker reading "Real Results". Shipping the repository as-is would swap one set
of invented claims for another, not remove them. **Highest-priority open item.**

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

## Next Milestone

M02 — not defined in this repository.

## Latest Commit

`5b3b8ba` — `chore(m00): archive reference material, repair index links and build`

Branch `feat/m00-foundation`, tagged `v2-m00-foundation`. A follow-up commit
finalises `CHANGELOG.md` and this file.

## Current Lighthouse

Not measured. Requires serving the production build and a browser audit harness.
No dated measurement exists anywhere in the repository — treat `DEPLOYMENT.md`'s
targets as aspirations, not results.

## Current Bundle Size

**13 client JS chunks, 1.00 MB raw (uncompressed)** in `.next/static/chunks`,
from the green Turbopack build.

Not comparable to the ~165 kB "First Load JS" figure in `DEPLOYMENT.md`, which is
a per-route gzipped metric. Next 16 no longer prints per-route sizes in default
build output, so that documented baseline remains **unverified**.

## Notes

**Repository shape:** root holds 5 directories — `10_Final_Website/` (the Next.js
app and Vercel root), `Documentation/` (`Approved/` pointer + `Archive/`),
`brand-os/`, `docs/`, `.claude/`.

**Test infrastructure:** none exists. No unit, integration, or e2e harness. This
is the single largest structural gap carried into M01.

**Accessibility:** the M00 Hero change lifted subhead contrast on `void #060608`
from ~8.4:1 to ~14.9:1. No systematic audit has been performed.

**Lint debt:** 9 warnings — 7 `react-hooks/set-state-in-effect` (deliberately
downgraded with documented rationale in `eslint.config.mjs`) and 2 unused disable
directives in `layout.tsx`.

---

*No conflict with the Constitution or Decision Register was detected during M00.
M01 not begun; awaiting founder authorisation.*
