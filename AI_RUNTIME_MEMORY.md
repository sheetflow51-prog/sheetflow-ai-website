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

**One Lighthouse run is not a measurement.** On this machine, five consecutive
runs of an *unchanged* build produced Total Blocking Times of 11,121 / 586 /
655 / 538 / 701 ms. A single sample once read as a catastrophic regression and
was pure noise. `npm run audit:lh` therefore discards a warm-up pass and
reports the median of N. Never compare two single runs and never report a
delta smaller than the observed spread.

**Compare like with like.** To claim an improvement, measure the previous
commit with the *same* methodology — `git stash`, build, audit, restore. A
"before" taken with a different instrument is not a baseline. Doing this is
what revealed that Phase B fixed CLS but did nothing measurable for TBT.

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
`EPERM: unlink '.next/static/...'`. Not a code fault. `rm -rf .next` and
rebuild. **Stop the server first** — `rm -rf .next` against a running server
fails with "Device or resource busy", the build then silently uses stale
output, and the audit that follows reports zeros.

**Animate transforms, never layout properties.** A `top` keyframe in the boot
flourish was the site's entire Cumulative Layout Shift. `top`/`left`/`width`/
`height` drive layout every frame; `x`/`y`/`scale` compile to compositor
transforms and cost nothing. Any keyframe touching a layout property is a bug.

**Deferring work does not remove it.** Moving the decorative layer behind
`requestIdleCallback` made TBT *worse*, because idle callbacks fire inside the
very window TBT measures. Gate on `load` first if the intent is to leave the
metric's window; better still, make the work cheaper.

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

**Unsaved editor buffers are detectable, not guessable.** VSCode persists dirty
buffers to `%APPDATA%\Code\Backups\<workspace>\file\<hash>`, first line being
the source URI plus metadata. To answer "is anything unsaved", enumerate those,
extract the content after line 1, and diff it against disk — `git status` alone
cannot see an unsaved buffer, and neither can any file read.

**Check for a better capability before hand-authoring UI.** The order to try,
and why each usually loses on this project, is in `TOOLING_MANIFEST.md` under
"Capability selection for UI work". Record the choice — including when the
answer is "hand-author", and including when a review finds nothing.

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

**B1 — Three of four named engagements are now CORROBORATED as real work.**
`vercel project ls` lists them as deployed projects under the founder's own
Vercel account, and three are live:

| Project | URL | State |
|---|---|---|
| Sparc Physiotherapy | `sparc-physiotherapy.vercel.app` | HTTP 200 |
| Saraswati Dental | `saraswati-dental-clinic.vercel.app` | HTTP 200 |
| R3S Realty | `r3s-realty.vercel.app` | HTTP 200 |
| R3S Realty Agra | `r3s-realty-agra.vercel.app` | unreachable |
| Elevate WPC | — | not on Vercel |

**This establishes existence, not permission.** These are sites the founder
built; nothing here shows they are paying clients, that outcomes were measured,
or that anyone consented to be named publicly. Publishing a name or a metric
still needs founder sign-off — "portfolio permission" and "customer proof" are
both explicit stop conditions. The entries stay `pending` until then.

What would unblock: for each, written permission to name them, and either a
measured outcome with methodology or agreement to show the work with no metric
attached.

**D2 — `origin/main` diverged.** Never reconciled.

**D3 — RESOLVED for deployment, open for the MCP.** The Vercel **CLI** (58.7.0)
is installed and authenticated as `sheetflow51-prog`; `.vercel/project.json`
links the project. Deploy previews with `vercel deploy` from the repo root.

The Vercel **MCP connector** still returns 403: it is authenticated to a
different account than the one owning this project (`scope
"sheetflow51-progs-projects"`). Re-authorising the claude.ai connector against
that scope would restore programmatic access to build logs and project
settings. Not required for deployments.

**A1 — Is the Spline/3D direction still live?** `src/components/three/` is
imported by nothing and the bundle carries zero Three.js symbols, yet six
dependencies remain installed for it — and they are what forces
`--legacy-peer-deps` on every install. Retiring them is an architectural
decision, so it has not been taken autonomously.

---

## Next

**Total Blocking Time is still the weakness** — ~950 ms desktop, ~2,080 ms on a
4x-throttled mobile profile. Phase B eliminated CLS but did not move TBT.

What Phase B ruled out: the particle field's O(n²) connection pass (now a
spatial grid) and the decorative layer's position on the critical path (now
deferred). Neither was the dominant cost.

What remains unexamined: framer-motion's hydration cost across every section,
GSAP + Lenis in `SmoothScroll`/`GsapProvider` (still eager, and scroll
behaviour depends on them), and the ~91 kB of shipped-but-unused JS. The next
attempt should profile a real trace and attribute the long tasks to modules
before changing anything — Phase B changed code first and measured second, and
two of its three changes turned out not to matter.
