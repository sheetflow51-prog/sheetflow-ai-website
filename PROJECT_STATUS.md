# SheetFlow V2

## Current Milestone

M00 — Foundation. Restructuring, index repair, and build repair **complete and
staged**, awaiting founder review. Not committed.

## Current Status

Governance resolved: the seven governing documents are maintained externally in
the founder's Claude CoWork project, are approved and immutable, and are
deliberately absent from this repository. `Documentation/Approved/` holds a
pointer only — no contents reproduced.

The approved archive-only restructuring is complete. Two follow-on repairs
requested after review are also complete:

- **`MASTER_INDEX.md` is repaired.** All 30 link targets broken by the archive
  move now resolve. Only link targets changed; no prose was rewritten.
- **The build system is repaired.** `npm run build` now exits 0 with no manual
  flags, on Next 16's default Turbopack.

The full verification suite is green. One commit exists (Hero legibility); all
other work remains staged for founder review.

## Completed Tasks

**Committed**

- `5e8ef5d` — `fix(hero): raise headline legibility over background video`.
  Subhead contrast on `void #060608` improves from ~8.4:1 to ~14.9:1.

**Staged, not committed**

- Created `Documentation/Approved/` with a governance pointer README.
- Created `Documentation/Archive/`; moved 11 inert reference folders into it
  (118 files, all rename-detected at 100% similarity — zero content drift).
- Archived 3 legacy deploy scripts to `Documentation/Archive/legacy_scripts/`.
- Created root `.gitignore` (none previously existed) and `CHANGELOG.md`.
- Repointed one stale path comment in `10_Final_Website/src/lib/gsap.ts`.
- **Repaired 30 link targets in `MASTER_INDEX.md`** (30 lines changed, +660
  bytes = 30 × the 22-character `Documentation/Archive/` prefix, confirming no
  prose was touched).
- **Repaired `10_Final_Website/next.config.mjs`** (−9 lines net): removed the
  dead `webpack()` override and the Next-16-invalid `eslint` key.

## Verification

Full suite, re-run after all repairs:

| Check | Result |
|---|---|
| `npm run type-check` | **Pass** — exit 0 |
| `npm run lint` | **Pass** — exit 0, 9 warnings (unchanged, none new) |
| `npm run build` | **Pass** — exit 0, 19.8s, no flags, 8/8 routes |
| Rename integrity | 118/118 at R100 — byte-identical, history preserved |
| Tracked file count | 228 → 235 (+7 new, 0 lost) |
| `MASTER_INDEX.md` links | 30/30 resolve on disk; 0 broken |
| `.gitignore` shadowing | None — no tracked file newly ignored |
| `.env.example` still tracked | Yes |
| `.eslintrc.json` retained | Yes — untouched per decision 6 |
| Vercel root `10_Final_Website/` | Path unchanged; only config + 1 comment edited |

Build-time warnings remaining (all pre-existing, none introduced):
- Workspace-root inference from a stray 81-byte `C:\Users\pc\package-lock.json`
  (outside this repository — not touched).
- Custom `Cache-Control` on `/_next/static/:path*` — intentional, set by
  `headers()` in `next.config.mjs`.
- Edge runtime disables static generation for one route.

## Current Blockers

**None.** Both prior blockers are resolved:

- ~~B1 — `npm run build` fails~~ → **RESOLVED.** Root cause: Next 16 defaults to
  Turbopack, and a `webpack()` override with no `turbopack` config is a hard
  error. The override was dead weight — its raw-loader rule matched a file type
  the project does not contain (zero `.glsl/.vs/.fs/.vert/.frag` files), and its
  `resolve.conditionNames` patch was a webpack-resolver workaround that
  Turbopack does not need (`transpilePackages` is the load-bearing mechanism,
  per the comment in `SplineScene.tsx`). Deleting it lets the default path work.
- ~~B2 — 30 broken links in `MASTER_INDEX.md`~~ → **RESOLVED.**

## Open Decisions

**D1 — `raw-loader` is now an unused devDependency.** Its only consumer was the
deleted webpack rule. Removal is recommended but requires founder approval for
package changes; left in place.

**D2 — Deployment reconciliation.** Deferred by founder instruction.
`origin/main` (`92057ca`) and local remain diverged 13 ahead / 1 behind.

**D3 — Fabricated claims.** Unresolved and still live in two generations.
Carried forward; no action taken in M00.

**D4 — `.eslintrc.json`** retained per decision 6, but inert: ESLint 9.39.4 uses
flat config and ignores it. Slated for the tooling milestone.

**D5 — `.claude/` directory** untracked and not ignored. Not in the approved
manifest; left as-is.

**D6 — Stray `C:\Users\pc\package-lock.json`** makes Next infer the wrong
workspace root. Outside the repository; deletion is the founder's call.

## Next Milestone

M01 — not started, not scoped, gated on founder approval.

## Latest Commit

`5e8ef5d` — `fix(hero): raise headline legibility over background video`
on `feat/m00-foundation`. All other work staged and uncommitted.

## Current Lighthouse

Not measured. Requires serving the production build and a browser audit harness,
which is out of M00 scope. No dated measurement exists anywhere in the
repository — treat `DEPLOYMENT.md`'s targets as aspirations, not results.

## Current Bundle Size

From the green Turbopack build: **13 client JS chunks, 1.00 MB raw
(uncompressed)** in `.next/static/chunks`.

For comparison, the webpack build produced 28 chunks / 1.23 MB raw — Turbopack
emits fewer, smaller chunks here.

Neither figure is comparable to the ~165 kB "First Load JS" in `DEPLOYMENT.md`,
which is a per-route gzipped metric. Next 16 no longer prints per-route sizes in
default build output, so that documented baseline remains **unverified**.

## Notes

**Root before → after:** 15 directories → 5 (`10_Final_Website/`, `brand-os/`,
`docs/`, `Documentation/`, `.claude/`).

**Deliberately unchanged:** `10_Final_Website/` stays put to protect the Vercel
Root Directory setting, which cannot be edited without dashboard access
(`list_teams` empty, `list_projects` fails).

**`DEPLOY_FINAL.log` was not deleted.** Deletion was proposed but never
explicitly approved, and the file is untracked (unrecoverable if removed). The
root `.gitignore` covers `*.log`, so it is ignored in place.

**Self-review — debt carried, not silently fixed:** 9 ESLint warnings (7
`react-hooks/set-state-in-effect`, deliberately downgraded with rationale in
`eslint.config.mjs`; 2 unused disable directives in `layout.tsx`); dual ESLint
config; `typescript.ignoreBuildErrors: true` still set in `next.config.mjs`,
which means the build does not gate on type errors — `npm run type-check` is the
real gate and passes independently; no test infrastructure of any kind.

---

*No conflict with the Constitution or Decision Register was detected. All work
staged and awaiting founder review. M01 not begun.*
