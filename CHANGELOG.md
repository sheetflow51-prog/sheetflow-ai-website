# SheetFlow v2 Changelog

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
