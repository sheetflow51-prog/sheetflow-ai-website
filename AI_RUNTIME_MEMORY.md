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

**Turbopack hashes source maps independently of their chunks.**
`060wcmibf9..8.js` ships next to `17bf.tm-de06b.js.map`. Deriving the map name
by appending `.map` finds nothing and silently degrades attribution to chunk
URLs — which looks like it worked. Always read the chunk's trailing
`//# sourceMappingURL=` comment. `scripts/profile-main-thread.mjs` does this and
prints `N/M chunks source-mapped` so a silent failure is visible.

**`prefers-reduced-motion` is a free A/B switch for the whole animation
system.** Every decorative layer already gates on it, so emulating it in
Playwright turns all motion off *in the identical build* — no code change, no
rebuild, no confound. This is what finally attributed TBT. Reach for an existing
runtime switch before editing components to measure something.

**MCP servers attach at session start.** Adding one to `.mcp.json` mid-session
does not make it callable in that session, no matter how the config looks.
Install, verify with a real `initialize` + `tools/list` handshake, and use it
next session. A server that starts is *configured*; only one that has answered
a question is *usable*.

**…and session timing was not why these were unusable.** The line above was
written to explain why five installed servers could not be called, and it
predicted they would work "next session". They did not. Two sessions later all
six still reported `⏸ Pending approval`. The real gate is **folder trust**:
`~/.claude.json` carries `hasTrustDialogAccepted: false` for this project, and
Claude Code will not launch `.mcp.json` servers from an untrusted directory.
`enabledMcpjsonServers` in `.claude/settings.local.json` does not override it —
that was tested, not assumed. Only answering the trust prompt in an interactive
`claude` session does.

The generalisable lesson: **a plausible explanation that predicts an outcome is
worth checking against that outcome.** "MCP attaches at session start" is true,
and it was still the wrong diagnosis; it survived a session only because nobody
re-ran `claude mcp list` to see whether the prediction came true. Verify the fix
landed, not just that the reasoning sounded right.

**A bimodal result is a broken instrument, not a noisy one.** Steady-state task
time clustered at ~370 ms and ~1,300 ms with almost nothing between — two clean
modes, not a spread. The cause was a race: `DeferredAtmosphere` mounts on `load`
then `requestIdleCallback(..., {timeout: 3000})`, and both profilers used a
hard-coded 3,000 ms load/steady boundary, so the measurement window opened at
the exact instant the thing being measured appeared. The same arm scored −64%
and −2% on identical code. **No amount of extra runs fixes a race.** When a
distribution has two peaks, find what differs between them before increasing N.

**The profiler perturbs what it measures.** Sampling at 100 µs is 10,000
samples/second and that overhead lands inside the tasks being timed. Changing
only the interval to Chrome's 1,000 µs default moved steady-state blocking from
1,182 ms to 555 ms on identical code. Load phase barely moved (488 vs 489) —
per-task overhead inflates many small tasks, not a few large ones, and that
asymmetry is the tell. Use counters (`Performance.getMetrics`) for magnitudes
and the sampler only for attribution. **When a sampler and a counter disagree,
the counter wins** — the sampler once reported more blocking time than there was
total task time, which is impossible.

**Check the impossible arms before believing the plausible one.** Five
experiment arms all measured *higher* than baseline while claiming to remove
work. That is physically impossible, and it invalidated every arm — including
the one that had confirmed the hypothesis. An experiment that only gets audited
when it disagrees with you is not an experiment.

**A negation in `.gitignore` is not optional when a rule broadens.** `vercel
link` appended `.env*` to the repo root, four lines below a comment explicitly
warning not to do exactly that. It shadowed the tracked `.env.example`, which
survived only because it was already in the index — a fresh clone adding one
would have lost it silently. `git check-ignore -v` is ambiguous here (it prints
the negation and its exit code reads as "matched"); the reliable test is to
untrack the file and see whether `git status` still lists it.

---

**Unsaved editor buffers are detectable, not guessable.** VSCode persists dirty
buffers to `%APPDATA%\Code\Backups\<workspace>\file\<hash>`, first line being
the source URI plus metadata. To answer "is anything unsaved", enumerate those,
extract the content after line 1, and diff it against disk — `git status` alone
cannot see an unsaved buffer, and neither can any file read.

**Mobile and desktop are different problems here — do not use one as a proxy.**
Desktop is paint-bound; **mobile is bandwidth-bound**, because the Lighthouse
mobile preset simulates Slow 4G at 1.6 Mbps and this site sends ~340 kB gzipped
JS plus 228 kB of preloaded fonts — ≈2.9 s of transfer before anything paints. A
page scoring 97 on desktop scored 59 on mobile. Fixing the composition helps one
and barely touches the other.

**A metric that will not move with content is not measuring content.** LCP sat
at 4.3–4.5 s across three routes whose payloads differ by an order of magnitude.
That flatness was the signal — it said "this is a fixed cost, stop looking at
the pages" — and reading the LCP element out of `report.json` beat two rounds of
guessing at it.

**Declaring fewer weights of a variable Google font changes nothing.**
`next/font` emits one file per **subset**, not per weight. Trimming Inter from
six weights to three produced a byte-identical build: 607,148 bytes, 19 files, 4
preloads. Verified, not assumed — and it was assumed first.

**Next.js `opengraph-image` is NOT inherited by child route segments.** It
applies to the segment that declares it. `app/opengraph-image.tsx` covered `/`
and nothing else, so five new routes shipped announcing
`twitter:card: summary_large_image` — inherited from the layout's `metadata`,
which *is* inherited — with no image behind it. The pages rendered perfectly;
the failure only exists in someone else's link preview. **Metadata and image
conventions have different inheritance rules, and the mismatch is silent.**
Grep the prerendered HTML in `.next/server/app/**.html` for `og:image` after
adding any route; a test asserting the tag exists *and* fetches it is cheap.

**A screenshot catches a class of defect no assertion will.** `npm run shots`
surfaced two controls both labelled "How we work" pointing at different
anchors. Every test passed — each link resolved, each had a focus ring, heading
order was clean. Nothing in a suite compares *label text against destination*
across components. Render it and look at it before believing it is done.

**Two whole pages beat isolation arms as an experiment.** D17 died because
every arm that removed work measured *higher* than baseline, so none could be
trusted. The service pages settled the same question by accident: same tokens,
fonts, motion libraries and `DeferredAtmosphere`, 97 against the homepage's 59.
There were no arms to distrust — just two real pages built the same way. **When
isolation is untrustworthy, look for a natural comparison already in the
product.**

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

**Measured 2026-08-07 — the homepage's cost is its composition, not the brand.**
Desktop, median of 5, one batch: `/` **59** (TBT 1,600 ms), `/services` **96**
(30 ms), `/services/whatsapp-automation` **97** (10 ms). Everything the routes
share is exonerated — tokens, fonts, glass and gradients, `framer-motion`,
`gsap`, Lenis, cursor, and `DeferredAtmosphere`, which mounts on every route
including the ones scoring 97. **A2 is therefore "which components", not "how
much identity".** Founder's call; see DECISIONS. The homepage's 59 vs
yesterday's 65 is machine load, not regression — nothing this phase touched its
render path and the spread here is 270–6,049 ms.

**TBT is paint, not JavaScript. The decorative layers cost far less than one
session of this project claimed.**

Measured with `npm run trace` (CDP `Performance.getMetrics` counters — no
sampling, no observer effect), 4 s idle, atmosphere confirmed mounted:

| Arm | Total main-thread task | Paint & composite |
|---|---|---|
| Motion on (ships today) | 374 ms | 272 ms (73%) |
| Reduced motion (no atmosphere) | 246 ms | 224 ms (91%) |

**Paint and compositing are 73–91% of steady state and 76% of load phase.** JS
is the minority cost, which is why three phases of JS optimisation never moved
the number. Ranked JS: `next` (hydration) 138 ms, `framer-motion` 90 ms,
turbopack runtime 77 ms, `gsap` 37 ms, `AIDashboard` 29 ms. `ParticleField` has
left the top 20 — the spatial-grid rewrite worked; nothing left to win there.

**The atmosphere costs ~128 ms per 4 s (374 vs 246), about a 9% duty cycle.**
An earlier revision of these docs claimed ~1,232 ms and "100% of steady-state
blocking". That was retracted on 2026-08-07 — see the retraction in
`TOOLING_MANIFEST.md`. Even with no atmosphere at all the page still spends
246 ms per 4 s, 91% of it paint.

**No individual effect is separable.** On the fixed instrument every arm
measured *higher* than baseline (`no-ambient-anim` +10%, `no-breathe` +11%,
`breathe-on-children` +17%, `no-particles` +24%), which is impossible if any
were removing real work. The blend-mode hypothesis is **unsupported** —
`no-blend` moved nothing. D17 is answered in the negative: there is no single
expensive effect to find.

**So the remaining cost is diffuse and structural**: a dark page carrying
several large translucent gradient layers is expensive to composite, animated or
not. Reducing it means fewer or smaller translucent layers, which is a design
question (A2) under `EXPERIENCE_GOVERNANCE.md` — not a bug hunt, and not
something to resolve by quietly deleting animation to win a metric.

**If more precision is ever needed**, `chrome-devtools` MCP (installed, live
next session) exposes real layerisation and raster records via
`performance_start_trace` / `performance_analyze_insight`, which is a level
below what `Performance.getMetrics` reports.
