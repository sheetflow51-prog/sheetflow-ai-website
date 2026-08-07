# SheetFlow v2 Changelog

## Phase I — The mobile gate closes, on a font nobody could see (2026-08-07)

Phase H left the homepage failing its own ≥50 mobile gate and named the lever as
"bytes". Both halves needed correcting: the biggest byte was not the one anyone
was looking at, and bytes alone were not enough.

### Shipped

- **Dropped the italic style from Fraunces.** `layout.tsx` declared
  `style: ['normal', 'italic']`; the only occurrence of "italic" anywhere in
  `src/` was that declaration. Because the font is layout-declared, Next
  **preloaded** the italic face: **81,704 bytes, `rel="preload"`, the largest of
  four preloaded fonts and 36% of the 228,864-byte preloaded payload**, for a
  face with no way to reach the screen. Result: **19 → 16 woff2, 607,148 →
  431,728 bytes; preloads 4 → 3, 228,864 → 147,160 bytes.**
- **The site-wide particle canvas no longer mounts on touch devices.**
  `ParticleField` is mounted `reactive` — its per-particle inner loop is cursor
  repulsion. Without a pointer that force never fires, leaving a full-viewport
  canvas repainting 130 particles and their links at 30fps for a drift nobody
  can interact with. `CustomCursor` already early-returns on `pointer: coarse`;
  this applies the same established test to the other pointer-driven layer. The
  chunk is now never requested where there is no cursor.
- **The hero's 2.7 MB ambient clip is desktop-only**, with Save-Data and 2G
  honoured at any width. Mobile gets the poster it already showed under reduced
  motion. **This does not move the Lighthouse score and is not claimed to** —
  see below.
- **8 new payload tests** (152 total, was 144), asserting each saving in *both*
  directions: no italic face and ≤3 preloads; the clip absent on mobile **and
  still present on desktop**; the canvas absent on touch **and still mounting on
  desktop**. A one-line revert of any of these looks like tidying in a diff.

### Measured — before and after, one machine, one batch

Mobile preset, median of 5, warm-up discarded.

| `/` mobile | Perf | LCP | TBT | SI | Transfer |
|---|---|---|---|---|---|
| Before | **45** | 4.8 s | 5,240 ms | 7.9 s | 591 KiB |
| After | **50 — passes** | 4.2 s | 3,180 ms | 6.7 s | 508 KiB |

Per-run scores 44/46/43/45/46 → 49/51/48/50/53. **The distributions do not
overlap**, so the direction is not in doubt — but the median sits *exactly* on
the gate and single runs still dip to 48. This is "stopped failing", not
headroom.

### Two corrections to Phase H

- **The 2.7 MB video is not the mobile bottleneck**, and assuming it was would
  have credited it with the font's work. Lighthouse's `network-requests` records
  **627 bytes transferred** for it (HTTP 206 metadata range): `preload="metadata"`
  holds, and `autoPlay` is applied post-hydration so playback never begins inside
  the measured window. Total transfer was 591 KiB *including* the video. The
  gate is kept anyway — Lighthouse stops observing at load and a phone does not,
  so a real visitor still streams and loops 2.7 MB of decoration on a metered
  plan. A true cost that no score will ever argue for.
- **D23 is amended: mobile is paint-bound as well as bandwidth-bound.**
  `mainthread-work-breakdown` reads **"Other" 8,179 ms and Style & Layout
  2,604 ms against Script Evaluation 2,476 ms** of a 14,200 ms main thread —
  the desktop finding amplified by the 4× CPU throttle. Bytes move LCP and Speed
  Index; paint moves TBT. Clearing five points needed one of each.

### The lesson worth keeping

Phase H established that trimming font *weights* changes nothing, because
`next/font` emits one file per **subset**. That is true, and it is what hid this
win for a phase: a **style is a separate `@font-face` with its own `src`**, so
styles behave nothing like weights. *"X changed nothing" is a fact about X, not
about the category X belongs to.*

### Not done, and why

- **Unused JavaScript (0.45 s, 44 KiB)** — the only remaining opportunity
  Lighthouse reports. Reaching it means code-splitting the motion libraries:
  a refactor with real regression surface for a fraction of the last change,
  and speculative until something says which chunk hurts.
- **The 1,850 ms boot overlay on mobile** — the largest remaining LCP lever on
  this route, and squarely brand identity (first impression, once per session).
  Shortening or skipping it on phones is a founder call under
  `EXPERIENCE_GOVERNANCE.md`, not an optimisation to take quietly.
- **A2 is untouched.** The particle gate sits at its edge and is flagged rather
  than smuggled: it changes what a phone sees, and nothing about desktop.

## Phase H — Mobile measured, and two hypotheses killed (2026-08-07)

### Unblocked

- **`gh` is authenticated** (`sheetflow51-prog`) and **the five stdio MCP
  servers now report `✔ Connected`.** The folder-trust gate is cleared. The MCP
  *tools* still are not callable in the session that observed it — servers
  attach at startup — but this time "live next session" is the correct claim
  rather than the wrong one recorded twice before.
- **GitHub MCP still fails**, now with a different and more specific error:
  *"Incompatible auth server: does not support dynamic client registration."*
  That is not the trust gate; it needs its own investigation.

### Searched — the open-source-first order, finally run

With `gh` working, the seven named registries were looked up rather than
recalled. **Two are materially different from their reputation:**

- **Origin UI** — `origin-space/originui` now redirects to `cosscom/coss`,
  Cal.com's design system, licensed **AGPL-3.0**. Strong copyleft. Copying from
  it into a commercial site is a legal question, not a developer's judgement.
- **React Bits** — GitHub reports **NOASSERTION**; its licence could not be
  verified. Unverified terms are a stop for commercial reuse.
- `21st-dev/magic-mcp` has **no LICENSE file** at all.
- shadcn/ui, Magic UI, Radix and Motion Primitives are confirmed **MIT**.

This file previously described all of them as "mixed MIT" on reputation. That
was wrong, and finding out is what the search was for. Nothing was imported —
every registry ships *visual components*, and the page in question fails its
mobile gate because it already sends too much.

### Measured — first mobile baseline for the service routes

| Route | Perf | LCP | TBT | SI |
|---|---|---|---|---|
| `/` | **48 — fails the ≥50 gate** | 4.5 s | 4,170 ms | 7.2 s |
| `/services` | pass | 4.3 s | 570 ms | 4.8 s |
| `/services/whatsapp-automation` | 59 | 4.4 s | 970 ms | 4.9 s |

**Desktop 97 implied nothing about mobile** — the same page drops to 59.

**Mobile is bandwidth-bound; desktop is paint-bound (D23).** The mobile preset
simulates Slow 4G at 1.6 Mbps, and ~340 kB gzipped JS plus 228 kB of preloaded
fonts is ≈2.9 s of transfer before anything paints. LCP sat at 4.3–4.5 s across
three routes whose payloads differ by an order of magnitude — a metric that will
not move with content is not measuring content.

### Two hypotheses tested and rejected

Recorded because a wrong guess that was checked is worth more than a right one
that was not.

1. **"Six declared Inter weights are six files on the critical path."** Trimmed
   300/700/800, all verified unused. Result: **byte-identical** — 607,148 bytes,
   19 files, 4 preloads, before and after. Inter is a *variable* font, so
   `next/font` emits one file per **subset**, not per weight. Kept as hygiene,
   explicitly not claimed as an optimisation.

2. **"The full-screen boot overlay pins LCP."** Plausible — it ran ~1,850 ms on
   every route from the root layout, and a fixed timer would explain an LCP that
   ignores content. Gated to the homepage, same route re-measured:
   **Speed Index 4.9 s → 3.3 s. LCP unmoved.** The overlay delayed *visual
   progress*, not the largest paint.

### Changed

- **The boot sequence runs on the homepage only (D22).** Kept on the Speed Index
  result and on an experience argument that needs no metric: a service page is a
  search landing surface, and nobody arriving from a query should watch a brand
  boot animation first. Untouched on the homepage. **Touches the brand
  experience — flagged for review, reversible in one line.**

## Phase G.1 — Social cards, and the environment audit (2026-08-07)

Build green at **19 routes**, suite at **144 tests**.

### Fixed

- **Every route added in Phase G shipped without a social image.** Next.js
  `opengraph-image` file conventions apply to the segment that declares them and
  are **not inherited by child segments** — so the root card covered `/` and
  nothing else, while all five new routes still announced
  `twitter:card: summary_large_image` from the layout. A declared large-image
  card with no image renders as a bare text link on WhatsApp, Slack, LinkedIn
  and X, and fails Twitter's validator.

  Fixed with `lib/og-card.tsx` plus `opengraph-image`/`twitter-image` routes
  under `services/` and `services/[slug]/`, generating a per-service card from
  the same content module the page reads. Verified in the prerendered HTML for
  all five routes, and a test now fetches every declared image on every route —
  homepage included — and asserts a 200 with an `image/*` content type. A
  declared image that 404s is the same failure with extra steps.

  **The root card was deliberately left untouched.** Its two-tone gradient
  headline is a bespoke composition, and refactoring a working edge-rendered
  image to share code risks silently changing the card the homepage has already
  been shared with. What the two must not disagree on is brand, so the palette
  values are exported as constants; the layouts are allowed to differ.

- **First attempt did not build.** `generateStaticParams` on the `[slug]` image
  route failed with *"Edge runtime is not supported with
  `generateStaticParams`."* Dropping the enumeration and keeping edge matches
  how the root card already behaves (`ƒ /opengraph-image`), so both cards work
  the same way rather than one being a special case. The cost — a generic `alt`
  instead of a per-service one — is recorded in the file rather than glossed.

### Measured — and it reframes A2

The new routes had no baseline, so all three were measured in **one batch**
(desktop, median of 5, warm-up discarded), which is what makes them comparable:

| Route | Perf | TBT |
|---|---|---|
| `/` | 59 | 1,600 ms |
| `/services` | 96 | 30 ms |
| `/services/whatsapp-automation` | **97** | **10 ms** |

**A page in the identical visual language scores 97 while the homepage scores
59.** That exonerates everything the routes share — tokens, fonts, glass and
gradient treatments, `framer-motion`, `gsap`, Lenis, the cursor, and
`DeferredAtmosphere`, which mounts from the root layout on every route including
the ones scoring 97.

A2 was posed as *"does the cinematic identity survive its measured cost"*, with
the implied lever being how much identity to surrender. **That framing was
wrong.** The brand language is not the cost; the homepage's specific decorative
composition is. The decision becomes "which components", not "how much brand" —
and unlike D17's isolation arms, which could not be trusted, this is a
like-for-like comparison of two whole pages built the same way.

`/` at 59 against yesterday's 65 is **not** a regression: nothing this phase
touches the homepage render path, the documented TBT spread here is
270–6,049 ms, and the batch ran straight after a 5-minute Playwright suite.
Absolute figures are load-depressed; the within-batch comparison is the valid
one, which is why `/` was re-measured alongside rather than quoted.

### Also fixed, found by looking at the render

- **Two controls with the same label went to different places.** The service
  hero's secondary CTA read "How we work" and pointed at `/#faq`, while the
  nav's "How we work" points at `/#product`. Caught by reading a captured
  screenshot rather than by any test — worth noting, because no assertion in
  the suite would ever have flagged it.

- **The signature bracket motif now frames the service hero**, reusing
  `signature/Brackets` rather than re-drawing it. `SHEETFLOW_VISUAL_DNA` §10.2
  reserves it for regions meant to read as a *frame*, which is what a service
  page's opening statement is. Verified visually at desktop, tablet and mobile
  via `npm run shots`.

### Audited

- **Environment, every row verified by running the command.** Node 24.13.0, npm
  11.6.2, Claude Code 2.1.220, Vercel CLI 58.7.0 authenticated as
  `sheetflow51-prog`. **Docker is not installed.** `gh` still unauthenticated.

- **Two connector changes since 2026-08-06**, which is why the check is re-run
  rather than copied forward: **Vercel now connects** (was 403 — the account
  mismatch behind D3 appears resolved at the connector layer), and **Calendly
  now needs authentication** (was working, and was the connector that verified
  the booking URL is real — so the site's primary conversion path can no longer
  be re-verified programmatically).

- **Claude Skills: 7 installed, all active, all byte-identical to their MIT
  source repo** (`nextlevelbuilder/ui-ux-pro-max-skill` @ `14ddef5`). No drift,
  nothing obsolete, nothing to activate. Two have been used on this project;
  five are deliberately idle because the visual language is frozen.

- **10 requested MCP packages confirmed to exist on npm**, versions read from
  the registry rather than assumed. **None installed** — see D21.

### Added

- **`OPEN_SOURCE_MANIFEST.md`** — every third-party implementation the project
  reuses, every one it declined and why, and the custom code written instead
  with the alternative that was considered for each. It records the
  uncomfortable part plainly: the GitHub search step of the open-source-first
  order **has never been performed on this project**, because `gh` is
  unauthenticated. "We reused nothing and here is why" is only credible if the
  search actually happened.

### Decided

- **D21 — no MCP server is added while the folder is untrusted.** All six
  already declared in `.mcp.json` are inert; adding eight more would grow a
  config file of things that do not run.

## Phase G — Content architecture (2026-08-07)

The site stopped being one route. Build green at **15 routes**, suite at **132
tests** (was 74), bundle **334.0 kB gzip JS** against a 360 kB budget.

### Added

- **`/services` and `/services/[slug]` × 4** — Lead Capture, WhatsApp
  Automation, Appointment Booking, CRM Automation. Statically generated via
  `generateStaticParams`, with `dynamicParams = false` so an unknown slug 404s
  instead of rendering an empty shell at request time.

  This is the fix for the one GEO gap the previous phase could name but not
  close: *"topical authority is thin because the site is one page… no amount of
  schema substitutes for pages that cover a topic."* Each page is a real topic
  cluster — its own `Service` node, its own three Q&A, internal links to its
  siblings and back up.

- **`content/services.ts`** — one typed source feeding the pages, the entity
  graph, the sitemap and `/llms.txt`. Four copies of the same facts would drift;
  one cannot.

- **`BreadcrumbList`, finally legitimate.** `Home › Services › <Service>` on the
  five new routes. Still absent from the homepage, which has no ancestors — and
  a test asserts that absence so it stays a decision rather than an oversight.
  Every crumb target is fetched in-test and must return 200; a trail naming a
  URL nobody built is worse than no trail.

- **`/llms.txt` now names the sub-pages**, each with its URL, description and
  questions, and tells a retriever to cite the specific page over the homepage.

- **58 tests.** Per-page graph shape, breadcrumb order and resolvability,
  per-page canonicals, visible-trail/markup parity, FAQ parity, single-`h1` and
  heading order, sitemap and `/llms.txt` coverage, axe on the new routes in both
  motion paths.

- **Two content-governance assertions** (D20). Every service page's
  `name`/`serviceType` must match its `Offer` in the catalogue, and every
  integration it names must already appear in the published integrations answer.
  D1 put fabricated *customer proof* beyond expression in the type system; prose
  is the hole that leaves. A new tool name is valid TypeScript and reads as a
  copy edit — on the pages most likely to be quoted verbatim.

### Fixed

- **Every nav and footer link broke off the homepage.** They were bare
  fragments (`#faq`), which resolve against *the current page* — so from
  `/services/...` the entire navigation pointed at sections that route does not
  contain. Now root-relative (`/#faq`); on the homepage the browser still treats
  that as a same-document fragment, so scroll behaviour there is unchanged.
  Latent for as long as the site had one route, and invisible until it did not.

- **The footer sent four different service labels to one `#workflows` anchor.**
  They now point at the four real pages.

- **Step numerals failed AA contrast** (WCAG 1.4.3), in a component written this
  phase. `accent-bright/70` composited on void computes to **4.27:1**, under the
  4.5:1 floor. The ratios were computed rather than guessed — `/80` is 5.33:1 —
  and `/80` was chosen because `.kicker` already uses it, so no one-off value
  entered the design system.

### Changed

- **The entity graph moved out of `layout.tsx`** into `lib/structured-data.ts`,
  with a builder per route (**D18**). Emitting it from the layout was correct
  for a one-route site and would have been actively wrong with a second: every
  sub-page would have carried `@id: <site>/#webpage`, asserting that it *is* the
  homepage, plus the homepage's FAQ. The "exactly one JSON-LD block per page"
  rule is unchanged and is now asserted on every route.

- **`sitemap.ts` generates from the content module** rather than a hand-written
  list. A sitemap maintained separately from the routes goes stale.

### Corrected

- **The MCP servers were never going to become usable "next session".** The
  previous manifest said they would and that nothing further was required. Two
  sessions later all six still report `⏸ Pending approval`. The gate is folder
  trust — `hasTrustDialogAccepted: false` in `~/.claude.json` — not session
  timing. `enabledMcpjsonServers` was added to `.claude/settings.local.json` and
  verified **insufficient on its own**. The trust flag was deliberately not
  flipped programmatically; it exists for a human to answer.

  The transferable lesson, recorded in AI_RUNTIME_MEMORY: a plausible
  explanation that *predicts an outcome* is worth checking against that outcome.
  "MCP attaches at session start" is true, and was still the wrong diagnosis.

- **The `probe-cls.mjs` save conflict.** The buffer held 59 prepended blank
  lines and LF endings; after normalising it was byte-identical to disk
  (`sha256 f135f3b6…`), so nothing semantic lived only in the editor. A residue
  outlived the discard — the file returned as LF under `core.autocrlf=true`,
  leaving `git status` reporting ` M` while `git diff HEAD` was empty. That
  combination is the signature of an EOL mismatch, not a content change;
  `git ls-files --eol` names it, and `git checkout --` restored the canonical
  CRLF form.

## Phase F — Product completion pass (2026-08-07)

### Fixed

- **The hero video ignored `prefers-reduced-motion`.** `globals.css` neutralises
  CSS animation and transition under that query, which does nothing to a
  `<video autoPlay loop>` — so a looping clip kept running for exactly the
  visitors who asked motion to stop. That is WCAG 2.2.2 (moving content over
  five seconds with no mechanism to pause). `runMotion` already existed in the
  component and had simply never been wired to the element. The poster still
  renders, so the composition is unchanged. **This was the one motion layer
  missed when every other one was audited.**

- **The hero's AI core terminated in a visible seam.** It was clipped to a
  `rounded-[36px]` container, and at 1440px the vignette above it never reached
  those edges — so the ambient glow ended in a hard rectangle across the
  headline. Replaced the clip with a radial mask; the core now dissolves into
  the void, which was the intent.

- **Ungrammatical H2.** "Six pillars of automation. One quietly run business."
  → "One quietly running business."

### Added

- **`scripts/capture-screens.mjs`** (`npm run shots`) — deterministic
  screenshots at desktop / tablet / mobile. Scrolls the page first so every
  IntersectionObserver reveal has fired, then freezes animation, so captures are
  diffable rather than catching elements mid-fade.

  It uses **real device descriptors**, not bare viewport sizes. The first
  version narrowed a desktop Chromium to 390px, which reports `pointer: fine` —
  so `CustomCursor` mounted and parked a ring over the copy. That read as a
  rendering bug in the site and was a bug in the script.

- **GEO signals on `Organization`** — `contactPoint` (sales, reachable phone,
  booking URL) and `knowsAbout` (9 expertise entities, each mapped to a service
  actually sold). `knowsAbout` is read directly by assistants deciding whether
  this entity answers a query, rather than inferred from prose.

- **`PROJECT_HEALTH.md`** — single-snapshot dashboard, regenerated per phase.

- **4 tests** asserting the new GEO signals, and asserting that `LocalBusiness`
  is *not* claimed without an address.

### Refused, deliberately

- **`LocalBusiness` schema.** Requested, but that type requires a
  `PostalAddress` and SheetFlow publishes no address or locality anywhere.
  Inventing one would be fabricated business information — barred by this
  project's first standing rule and by Google's structured-data policy.
  `Organization` is the accurate type for a remote service business. A test now
  asserts the absence so a future "add LocalBusiness for local SEO" change has
  to confront the reason.

- **`BreadcrumbList`.** Still N/A: one route means a one-item breadcrumb, which
  is schema spam. It becomes correct the moment service sub-pages ship.

### Verified and already correct

- **Anchor targets clear the fixed nav.** No `scroll-margin-top` is declared
  anywhere, which normally means anchors land under a fixed header. All six nav
  anchors measured: every one lands at 182px against a 64px nav, because
  sections carry their own top padding. No change made.

Verified: 74 tests pass, type-check and lint clean, all bundle budgets met.

## Phase E — Retraction, and the instrument that earned it (2026-08-07)

### Retracted

**Phase D's headline finding was wrong.** It reported 1,232 ms of steady-state
blocking against 0 ms under reduced motion, and concluded the decorative motion
system caused *100% of steady-state blocking*. Both numbers were instrument
artifacts. Two defects, found by trying to act on the finding:

- **A mount race.** `DeferredAtmosphere` mounts on `load` then
  `requestIdleCallback(..., {timeout: 3000})`. Both profilers used a hard-coded
  3,000 ms load/steady boundary — the same instant — so the measurement window
  opened exactly when the subject appeared. The metric was **bimodal** (~370 ms
  and ~1,300 ms, almost nothing between), and medians reported whichever mode an
  arm happened to draw. The same arm scored **−64% and −2% on identical code**.

- **Observer effect.** Sampling at 100 µs is 10,000 samples/second, and that
  overhead lands inside the tasks being timed. Changing *only* the interval to
  Chrome's 1,000 µs default moved steady-state blocking from **1,182 ms to
  555 ms**. Load phase barely moved (488 → 489) — per-task overhead inflates many
  small tasks, not a few large ones. At one point the sampler reported more
  blocking time than there was total task time, which is impossible.

An intermediate conclusion — "the `ambient-breathe` scale animation is 64% of
the cost" — is retracted for the same reason.

### Added

- **`scripts/trace-paint.mjs`** (`npm run trace`, `npm run trace:all`) — splits
  main-thread time into paint & composite / script / style recalc / layout using
  CDP `Performance.getMetrics`. These are **cumulative counters, not samples**,
  so they carry no observer effect. Waits for the atmosphere to mount before
  timing steady state, which is what removes the race.

### Measured — corrected

Steady state, 4 s idle, atmosphere confirmed mounted, median of 7–9:

| Arm | Total main-thread task | Paint & composite |
|---|---|---|
| Motion on | 374 ms | 272 ms (73%) |
| Reduced motion (no atmosphere) | 246 ms | 224 ms (91%) |

**Paint and compositing are 73–91% of steady state and 76% of load phase** —
this is the finding that survives, and the one that matters. It is a within-run
decomposition, immune to both defects. JavaScript is the minority cost, which is
why three phases of JS optimisation never moved the number.

The atmosphere costs **~128 ms per 4 s (~9% duty cycle)**, not ~40%. The page
spends 246 ms per 4 s with no atmosphere at all.

Load-phase blocking, 1,000 µs sampling, median of 9: **488 ms** motion on
(spread 270–6,049) vs **124 ms** reduced motion (spread 32–599).

### Resolved

- **D17 — closed in the negative.** There is no single expensive effect. Every
  isolating arm measured *higher* than baseline (`no-ambient-anim` +10%,
  `no-breathe` +11%, `breathe-on-children` +17%, `no-particles` +24%), which is
  impossible if any were removing real work — invalidating all of them,
  including the one that had confirmed the hypothesis. The blend-mode theory is
  **unsupported**: `no-blend` moved nothing.

- **A2 — now answerable, recommendation is to do nothing.** The cost is diffuse
  and structural: a dark page with several large translucent gradient layers is
  expensive to composite whether or not it animates. A 9% steady-state duty
  cycle does not justify weakening the visual signature, and load-phase blocking
  is better attacked through hydration cost, which has no design consequence.

### Fixed

- **The Playwright timeout was wrong project-wide, not per-spec.** Phase D
  raised it to 90 s for `a11y.spec.ts`; `seo.spec.ts` then timed out next —
  "FAQ markup matches the rendered answers exactly", which passes in 8.0 s
  standalone. Every spec here navigates to a page that is ~75% paint and waits
  for it to settle, and two device projects run in parallel. Moved to a global
  `timeout: 90_000` in `playwright.config.ts` and removed the per-spec override,
  since the default is wrong for the project rather than for one file.

### Changed

- Profiler default sampling interval 100 µs → **1,000 µs**, with a printed
  warning when lowered. 100 µs remains correct for module attribution; its
  blocking figures must be ignored.
- Both profilers split phases on the **observed mount time**, not a fixed 3,000 ms.
- Both launch Chromium with renderer backgrounding and occlusion detection
  disabled.

## Phase D — Toolchain and performance attribution (2026-08-06)

### Added

- **`scripts/profile-main-thread.mjs`** — main-thread CPU profile attributed to
  source modules. Samples V8 through CDP and resolves every call frame back
  through the chunk's source map, so blocking time lands on `framer-motion` or
  `AIDashboard.tsx` rather than on `060wcmibf9..8.js`. Decodes Base64-VLQ in
  ~40 lines rather than taking a dependency, matching the reasoning that keeps
  `chrome-launcher` out of `audit-lighthouse.mjs`.

  Reports a **median of N with its spread** and discards a warm-up, because a
  single run of this page produced 609 ms and 1,071 ms on an unchanged build.

  Splits **load phase** from **steady state**. Lighthouse's TBT stops at
  interactive, so a profile that keeps sampling mixes one-off hydration with
  whatever the page burns forever. They have opposite fixes.

  `PROFILE_EXPERIMENT=` injects CSS before first paint to price a suspected
  cost without editing a component. `PROFILE_REDUCED_MOTION=true` turns the
  entire animation system off in the identical build, since every decorative
  layer already gates on that query.

- **Six MCP servers**, declared in `.mcp.json` at project scope so the
  toolchain is reviewable in git (D14). Each verified with a real `initialize`
  + `tools/list` handshake, not just written to config: `chrome-devtools`
  (1.6.0, 29 tools), `context7` (3.2.5), `sequential-thinking`, `playwright`
  (1.63.0-alpha, 24 tools), `filesystem`, and the remote `github` server.

- **`DECISIONS.md`** — consolidated decision register. Decisions were scattered
  across `PROJECT_STATUS.md` and `brand-os/07_governance/`.

- **`npm run build:profile` / `profile` / `profile:mobile`**.

### Measured — TBT attributed for the first time

Median of 9, production build, source-mapped:

| Arm | Load-phase blocking | Steady state (3 s idle) |
|---|---|---|
| Motion on (ships today) | 453 ms (spread 233–843) | 1,232 ms (spread 0–3,428) |
| Reduced motion | 166 ms (spread 142–596) | **0 ms (spread 0–0)** |

The decorative motion system is **~63% of TBT and 100% of steady-state
blocking**. `(program)` — paint, layout, compositing — is **~65% of the main
thread**; JavaScript is the minority cost, which is why three previous phases
that optimised JavaScript did not move the number.

`ParticleField` no longer appears in the top 20, confirming the earlier
spatial-grid rewrite worked. Remaining JS: `next` 138 ms, `framer-motion`
90 ms, turbopack runtime 77 ms, `gsap` 37 ms, `AIDashboard.tsx` 29 ms.

Load-phase blocking measured 453–603 ms across passes against Lighthouse's
610 ms TBT, confirming the instrument measures the same phenomenon.

### Not concluded — deliberately

Four narrower experiments (`no-blend`, `no-sheen`, `no-ambient-anim`,
`no-backdrop-blur`) **could not be separated above the noise floor**. Spreads
overlapped entirely and `no-ambient-anim` scored worse than baseline, which is
physically impossible. **No claim is made about which effect is responsible**
(D17). The `mix-blend-mode: screen` sheen and `plus-lighter` cursor glow remain
suspects on theory only. Confirming needs a paint-level trace, which a CPU
profiler cannot produce.

### Fixed

- **`.gitignore` silently shadowed `.env.example`** (D13). `vercel link`
  appended `.env*` to the repository root, four lines below a comment warning
  against exactly that broadening. The tracked file survived only because it
  was already in the index; a fresh clone adding one would have lost it.
  Added `!.env.example` / `!**/.env.example`, verified by untracking and
  confirming `git status` still lists it.

- **Accessibility tests were a gate that only passed on a quiet machine.**
  13–15 s standalone, 28–38 s under full-suite load, against Playwright's 30 s
  default — five tests timed out in `npm run verify` and read as an
  accessibility regression that did not exist. Raised to 90 s for that spec
  only, so a real hang elsewhere still fails fast. axe walks the full DOM twice
  per assertion across two device profiles while the page repaints
  continuously; the scan is genuinely slow, not stuck.

### Corrected

- **The manifest claimed GitHub was available for "repo ops, PRs". It is not.**
  `gh` 2.96.0 is installed but unauthenticated (`gh auth status`: "You are not
  logged into any GitHub hosts"). `git push` works because the credential
  helper holds a token that `gh` cannot see. GitHub repository research was
  therefore **not performed** this session — it is blocked pending
  `gh auth login`.

- `@modelcontextprotocol/server-github` was **not** installed: npm marks it
  `Package no longer supported`.

### Changed

- `productionBrowserSourceMaps` is gated on `PROFILE_SOURCEMAPS` (D16). Shipped
  builds are unchanged — maps add a `sourceMappingURL` comment and sibling
  files, the JS is byte-identical, and browsers do not fetch maps unless
  devtools is open.

## Phase C - Answer-Engine Optimization (2026-08-06)

### Added

- **FAQ section** — eight questions, every answer grounded in something the
  site already states (the six services, the named integrations, the published
  five-step process, the free-audit offer). No pricing, no timelines, no
  outcomes, no certifications: none of those are established, and an
  unverifiable answer here is the first thing an engine quotes.
- **FAQPage JSON-LD**, generated from the same `content/faq.ts` array the
  section renders. Google treats FAQ markup that does not appear on the page as
  spam; one source makes divergence impossible, and a test asserts it.
- **`/llms.txt`** — a plain-text brief for language models, generated from the
  same source. Includes explicit citation guidance stating that SheetFlow
  publishes no customer names, metrics or certifications, so a model asked
  about results answers "not published" rather than inferring.
- **Consolidated entity graph.** Organization, WebSite, WebPage and FAQPage now
  emit as one linked `@graph` with resolvable `@id` references, replacing two
  unlinked blocks.
- **`robots.txt` names AI crawlers explicitly** — GPTBot, ClaudeBot,
  PerplexityBot, Google-Extended, Applebot-Extended and others. Access is
  unchanged (the wildcard already allowed them); naming them makes any future
  restriction a visible edit rather than a side effect.
- **12 new tests** covering graph parseability, `@id` resolution, markup/copy
  parity, answer presence without interaction, per-answer anchors, keyboard
  disclosure, and the three machine-readable surfaces.

### Fixed (found by the new tests)

- `<dt>` was nested inside `<summary>`, which is invalid — a `<dl>` requires
  `<dt>`/`<dd>` as direct children. Two serious axe violations. Rebuilt on
  headings inside `<details>`, which is valid, adds the questions to the
  document outline, and keeps answers in the DOM without JavaScript.
- Two FAQ anchors (`integrations`, `how-it-works`) collided with existing
  section ids. Duplicate ids are invalid HTML and break anchor navigation.
  All FAQ ids are now namespaced `faq-*`.

### Infrastructure

**Deployment was broken and is now fixed.** The first `vercel deploy` failed at
`npm install`, before any build ran: plain `npm install` exits 1 because
`@react-three/drei@9` declares a peer of `@react-three/fiber@^8` while the
project pins `^9`. Reproduced locally with `npm install --dry-run`. Added
`.npmrc` with `legacy-peer-deps=true`, making explicit the resolution every
local install has used since before M00.

This is a workaround. The six packages involved exist only for
`src/components/three/`, which no rendered code imports — dead dependencies
were blocking deployment of live code. Founder decision A1.

**First preview deployment created:**
`sheetflow-ai-website-kmquksq6e-sheetflow51-progs-projects.vercel.app`
(status Ready). It sits behind Vercel SSO Deployment Protection, so it returns
302 to `vercel.com/sso-api` for anonymous requests and requires a logged-in
Vercel session to view.

Vercel access resolved via CLI (58.7.0, authenticated as `sheetflow51-prog`).
The MCP connector still returns 403 — it is authenticated to a different
account. Documented in `TOOLING_MANIFEST.md`.

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
