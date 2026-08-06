# AI Runtime Memory

> Durable engineering context for SheetFlow v2. Read this first, every session.
> Everything here is a lesson that cost something to learn.
> Last updated: **2026-08-06**.

---

## Read order

1. This file
2. `TOOLING_MANIFEST.md` — what the project can actually do
3. `PROJECT_STATUS.md` — where things stand
4. `CHANGELOG.md` — what happened
5. Governance: `brand-os/07_governance/DEC-301`, `DEC-302`,
   `EXPERIENCE_GOVERNANCE.md`, `brand-os/09_logo-system/LOGO_SYSTEM.md`

The Constitution, North Star, Truth Matrix, Decision Register and Execution
Contract live **outside this repository**, in the founder's Claude CoWork
project. `Documentation/Approved/README.md` is a pointer, deliberately holding
no content. Their absence from disk is expected and is not a blocker.

---

## Standing rules

**Never fabricate customer evidence.** No invented names, metrics, quotes,
logos or certifications. `src/content/proof.ts` enforces this in the type
system: `pending` entries have no field to put a metric in, and only the
`published*()` selectors reach the UI. A Playwright test asserts the removed
names never return.

**`public/logo.png` is canon (DEC-301/302).** Every raster is cut from it.
SVG masters are scalability-only approximations and must never stand in for it
on the site, in metadata, or in exports. `public/brand/` is build output —
regenerate with `npm run brand`, never hand-edit.

**Measure, don't assert.** This project accumulated years of documented
performance "targets" that had never been run. Numbers in docs must carry the
date they were measured and the command that produced them.

---

## Hard-won lessons

**Verify against the production build.** `next dev` ships unminified bundles
and dev-only React warnings. Accessibility and performance numbers taken there
describe a build nobody ships.

**Rotating an SVG element rotates its paint.** `<ellipse transform="rotate()">`
turned a horizontal blue→gold gradient diagonal, putting gold at the top of the
logo instead of the right. Bake rotation into the path's arc
`x-axis-rotation` so the gradient stays in user space.

**Measure ratios against the right dimension.** A diameter-over-diameter ratio
used as a radius silently doubled the logo's sphere. Name the variable for what
it measures.

**Reconciliation has a direction.** `brand-os/tokens.ts` and
`tailwind.config.ts` had drifted. The naive fix — make Tailwind match the
"source of truth" — would have reverted an approved rebrand. The shipped values
were correct and the source-of-truth file was stale. Establish which side is
authoritative *before* syncing.

**Generators must not hard-code what they can measure.** Inlining the logo's
pixel bounds made "replace the PNG and rerun" silently false. The generator now
classifies the image each run and aborts loudly if it cannot.

**Windows/OneDrive locks `.next`.** Builds intermittently fail with
`EPERM: unlink '.next/static/...'`. Not a code fault. `rm -rf .next` and rebuild.

**Kill dev servers by port, not by name.** `pkill -f "next start"` does not work
here; a stale server keeps serving the old build and you will debug a
already-fixed bug. Use
`Get-NetTCPConnection -LocalPort 3000 | Stop-Process -Force`.

**PowerShell here-strings are not Bash.** The Bash tool needs heredocs or
`git commit -F <file>`. `@'...'@` is a syntax error there.

**Grepping minified chunks for package names proves nothing.** Bundlers strip
them. To test whether a library ships, grep for a distinctive runtime symbol
(`WebGLRenderer`, `BufferGeometry`) or trace the import graph in `src/`.

---

## Architecture notes

**Proof architecture** — `src/config/features.ts` (env-backed flags, all
default `false`) + `src/content/proof.ts` (discriminated union on `status`) +
`src/components/ui/ProofPlaceholder.tsx`. Enabling real proof is a content
change: set `status: 'verified'`, add the `verification` block, flip the flag.
No component changes at any step.

**Brand pipeline** — `scripts/build-brand-assets.mjs` measures `logo.png`,
cuts two crops (full lockup ≥180px, sphere-only for 16–96px where the wordmark
would be illegible), and emits every raster plus vector masters plus
`src/lib/brand-mark.ts` (a data URI, because the OG routes run on the edge
runtime and have no filesystem).

**Design tokens** — `brand-os/01_design-tokens/` is the source; `tailwind.config.ts`
mirrors it. The palette is the logo's blue + gold. `violet` is a **deprecated
alias of `gold`**, retained so 34 existing usages resolve; do not use it in new
code.

---

## Open founder decisions

**B1 — Four named engagements are unverifiable.** R3S Realty, Saraswati Dental,
Sparc Physiotherapy, Elevate WPC have no corroborating record in this repo or
the workspace. Held as `pending`, rendering nothing. Each needs scope, a
measured outcome with methodology, and written permission.

**D2 — `origin/main` diverged.** Never reconciled.

**D3 — No Vercel control-plane access.** `list_teams` returns empty. Preview
deployments cannot be created or verified from here.

**A1 — Is the Spline/3D direction still live?** `src/components/three/` is
imported by nothing and the bundle carries zero Three.js symbols, yet six
dependencies remain installed for it — and they are what forces
`--legacy-peer-deps` on every install. Retiring them is an architectural
decision, so it has not been taken autonomously.

---

## Next

**Performance.** Baseline is 65, dragged by 490 ms Total Blocking Time and
0.103 CLS. Main-thread script evaluation is 660 ms and roughly 91 kB of shipped
JS goes unused. That is the highest-value engineering work outstanding.
