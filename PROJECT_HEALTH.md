# Project Health — SheetFlow v2

> Single-snapshot dashboard. Regenerated after every phase.
> **Last updated: 2026-08-07** · Phase G (content architecture) · branch `feat/m01-foundation`

Scores below are **measured or verifiable**, never estimated. Where a number
cannot be measured honestly it says so — a confident percentage nobody computed
is how this project got a retracted performance finding.

---

## Overall

| | Status |
|---|---|
| **Production ready?** | ⚠️ **No — one hard blocker (B1) and one undeployed branch (D2)** |
| **Build** | ✅ green, **19 routes** (was 10) |
| **Verification** | ✅ **144 tests passing** (was 74) |
| **Deployed to production** | ❌ awaiting founder approval |

**Completion is deliberately not given as a single %.** The build is
functionally complete; what is missing is *permission-gated*, not
engineering-gated. A "94%" here would imply the remaining 6% is work I can do,
and it is not.

| Area | State | Evidence |
|---|---|---|
| Homepage build | ✅ complete | 10 sections, 3 breakpoints verified via `npm run shots` |
| Design system | ✅ complete | `brand-os/`, tokens mirrored in `tailwind.config.ts` |
| Accessibility | ✅ AA | Lighthouse 100, axe 0 violations (default + reduced-motion) |
| SEO | ✅ 100 | Lighthouse SEO 100 |
| GEO / answer-engine | ✅ strong | see below |
| Performance | ⚠️ **homepage 59** desktop / 50 mobile · **service routes 96–97** | The new routes are near-perfect. The homepage cost is its specific decorative composition, not the brand language — see below |
| Customer proof | ⛔ **blocked** | B1 — needs written permission |
| Production deploy | ⛔ **blocked** | needs founder approval |

---

## Lighthouse — 2026-08-07, three routes measured in one batch

Production build, desktop, `npm run audit:lh`, **median of 5**, warm-up
discarded. Run back-to-back on one machine, which is what makes them comparable
to each other.

| Route | Perf | A11y | BP | SEO | LCP | **TBT** | CLS | SI |
|---|---|---|---|---|---|---|---|---|
| `/` | **59** | 100 | 96 | 100 | 1.2 s | **1,600 ms** | 0 | 3.9 s |
| `/services` | **96** | 100 | 96 | 100 | 0.9 s | **30 ms** | 0 | 1.8 s |
| `/services/whatsapp-automation` | **97** | 100 | 96 | 100 | 0.9 s | **10 ms** | 0 | 1.7 s |

### Mobile — first full baseline, and it is the weak surface

Mobile preset (4× CPU **and** simulated Slow 4G), median of 5.

| Route | Perf | LCP | TBT | SI |
|---|---|---|---|---|
| `/` | **48 — fails the ≥50 gate** | 4.5 s | 4,170 ms | 7.2 s |
| `/services` | pass | 4.3 s | 570 ms | 4.8 s |
| `/services/whatsapp-automation` | 59 | 4.4 s | 970 ms | 4.9 s |

**Desktop 97 implied nothing about mobile** — the same page drops to 59, and the
homepage fails its own gate.

**Mobile is bandwidth-bound; desktop is paint-bound (D23).** Slow 4G at
1.6 Mbps against ~340 kB gzipped JS plus 228 kB of preloaded fonts is ≈2.9 s of
transfer before anything paints. LCP measured 4.3–4.5 s across three routes
whose payloads differ by an order of magnitude — a metric that will not move
with content is not measuring content. **The desktop conclusion does not
transfer:** resolving A2 toward a lighter composition helps desktop and does
comparatively little here, where the lever is bytes.

### The finding: the brand language is not the cost

**A page in the identical visual language scores 97 while the homepage scores
59 — same machine, same build, minutes apart. TBT differs by over two orders of
magnitude.**

That exonerates everything the routes share: the tokens, the fonts, the glass
and gradient treatments, `framer-motion`, `gsap`, Lenis, the cursor, and
`DeferredAtmosphere` — which mounts from the root layout on **every** route,
including the ones scoring 97. What is left is the homepage's specific
decorative composition: the video hero, `ParticleField`, `AIDashboard`,
`WorkflowUniverse`, and the large translucent gradient stack.

**This reframes A2** (below) from *"how much visual identity do we give up"* to
*"which specific components do we reconsider"* — a materially easier decision,
and still the founder's.

**Do not read `/` at 59 as a regression against yesterday's 65.** Nothing
shipped this phase touches the homepage render path; the documented TBT spread
on this machine is 270–6,049 ms; and this batch ran straight after a 5-minute
Playwright suite. Absolute figures are depressed by load — **the within-batch
comparison is the valid one**, which is precisely why `/` was re-measured
alongside rather than quoted from yesterday.

---

## Performance — root cause known, and it is not a bug

| Steady state, 4 s idle | Total main-thread task | Paint & composite |
|---|---|---|
| Motion on (ships today) | 374 ms | 272 ms (73%) |
| Reduced motion | 246 ms | 224 ms (91%) |

**Paint and compositing are 73–91% of the main thread.** JavaScript is the
minority cost. The decorative atmosphere costs ~128 ms per 4 s (~9% duty cycle).

**D17 is closed in the negative:** no single expensive effect exists. Every
isolating arm measured *higher* than baseline, which invalidated all of them.
Reducing paint means fewer/smaller translucent layers — a design decision (A2),
currently **recommended: do nothing**. 9% does not justify weakening the visual
signature.

---

## SEO

| Surface | State |
|---|---|
| JSON-LD `@graph` | ✅ Organization, WebSite, WebPage, FAQPage, OfferCatalog, 6 × Offer/Service |
| Title / description / canonical | ✅ |
| OpenGraph + Twitter Cards | ✅ **on all 6 content routes** — per-service edge-rendered cards added 2026-08-07 after the sub-pages shipped without any. Every declared image is fetched in-test and must return 200 with an `image/*` type |
| `robots.txt` | ✅ names AI crawlers explicitly, points at sitemap |
| `sitemap.xml` | ✅ well-formed |
| Semantic HTML / heading order | ✅ single H1, no skipped levels, asserted by test |
| Image optimisation | ✅ AVIF + WebP via `next/image`, 30-day cache |
| **BreadcrumbList** | ✅ **new** — emitted on `/services` and all four service pages, `Home › Services › <Service>`. Still deliberately **absent from the homepage**, which has no ancestors; a test asserts that absence. Every crumb target is fetched in-test and must return 200. |
| **LocalBusiness** | ⛔ **Refused** — requires a `PostalAddress`; none is published. Inventing one violates the first standing rule *and* Google's policy. Asserted by test. |
| **Review / AggregateRating** | ⛔ **Blocked by B1**, correctly. |

## GEO — generative engine optimisation

| Signal | State |
|---|---|
| `/llms.txt` | ✅ served, with explicit citation guidance |
| AI crawler rules | ✅ GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended named |
| FAQ coverage | ✅ 8 Q&A, markup/copy parity asserted, answers in DOM without interaction |
| Per-answer deep links | ✅ each answer individually linkable |
| Entity graph | ✅ linked `@graph` with resolvable `@id` |
| **`knowsAbout` expertise signal** | ✅ **new** — 9 entities, each mapped to a service actually sold |
| **`contactPoint`** | ✅ **new** — reachable sales contact + booking URL |
| Clear service definitions | ✅ 6 named services with descriptions and `serviceType` |
| Citation-friendly structure | ✅ answers are self-contained and quotable |
| **Topic clusters** | ✅ **new** — four service pages, each with its own `Service` node, its own 3 Q&A, and internal links both ways |
| **Per-service `FAQPage`** | ✅ **new** — 12 further Q&A pairs, markup/copy parity asserted per page |
| **`/llms.txt` names the sub-pages** | ✅ **new** — each service listed with its URL and its questions, with instructions to cite the specific page over the homepage |

**What changed:** the previous revision said "topical authority is thin because
the site is one page… no amount of schema substitutes for pages that cover a
topic." Four pages that cover a topic now exist, which is the fix that entry
asked for.

**Remaining honest limit:** four clusters, one level deep. Depth beyond this
needs either more services covered or a second tier below them, and neither is
worth writing until there is evidence anyone is searching for it.

---

## Workspace hygiene

Scanned 2026-08-07.

| Check | Result |
|---|---|
| Merge conflicts / conflict markers | ✅ none |
| Unmerged paths | ✅ none |
| Unfinished merge / rebase / cherry-pick | ✅ none |
| `.orig` / `.rej` / backup artifacts in repo | ✅ none |
| Git working tree | ✅ clean |
| Local vs `origin` | ✅ in sync |
| Orphaned VSCode editor backups | ✅ none for this workspace |
| **Dirty editor buffers** | ✅ **resolved** — see below |

### The `probe-cls.mjs` save conflict — closed 2026-08-07

The buffer carried **59 prepended blank lines** and LF endings against a CRLF
file. Classified by extracting it from `%APPDATA%\Code\Backups\…` and diffing:
after stripping the blanks and normalising endings it was **byte-identical** to
disk (`sha256 f135f3b6…` both sides), so nothing semantic existed only in the
editor and there was nothing to merge. Root cause of the *conflict* specifically:
the disk file's mtime moved 35 minutes after the buffer snapshotted its base,
which is exactly the condition VSCode refuses to save through.

One residue outlived the discard. The file came back to disk as **LF** while
`core.autocrlf=true` expects CRLF, which leaves git permanently stat-dirty:
`git status` reported ` M` while `git diff HEAD` was empty, because the
normalised blob (`bb1582c9…`) matched HEAD on both sides. `git checkout --` on
the path restored the canonical CRLF worktree form. Working tree is clean and
`node --check` passes.

**Worth keeping:** *"`git status` says modified, `git diff` says nothing"* is
the signature of an EOL mismatch, not of a content change. `git ls-files --eol`
names it in one line — here, `i/lf w/lf` where `w/crlf` was expected.

---

## Capabilities actually used this phase

Honesty matters more here than a long list.

| Capability | Used? | Note |
|---|---|---|
| **Claude Skills — `ui-ux-pro-max`** | ✅ **used** | Matched the site to the *Trust & Authority + Conversion* pattern; drove the sticky-nav and anchor-offset checks below |
| **Playwright (direct)** | ✅ used | Screenshot capture, anchor-offset probe, touch-emulation probe, 72-test suite |
| **CDP via Playwright** | ✅ used | `Performance.getMetrics` paint attribution, CPU profiler |
| **Calendly connector** | ✅ used (prior phase) | Verified the booking URL is real and active |
| **Vercel CLI** | ✅ used (prior phase) | Preview deploys |
| chrome-devtools MCP | ⏳ **connected, live next session** | **Trust granted — resolved.** `claude mcp list` reports `✔ Connected`. Not callable in the session that observed it, because servers attach at startup; unlike the earlier claim, the gate that invalidated it is now actually gone. |
| context7 / sequential-thinking / filesystem / playwright MCP | ⏳ same | All four `✔ Connected`. |
| **`gh` CLI** | ✅ **authenticated** | `sheetflow51-prog`. **The open-source-first search finally ran** — and found two registries materially mislabelled. See OPEN_SOURCE_MANIFEST. |
| GitHub MCP | ⛔ **fails, new error** | *"Incompatible auth server: does not support dynamic client registration."* Not the trust gate, not a missing login — an OAuth capability mismatch needing its own investigation. `gh` covers GitHub work meanwhile. |
| **GitHub MCP + `gh` CLI** | ⛔ **blocked** | `gh auth status`: not logged in. **No GitHub repository research was performed.** |
| **21st.dev / Magic MCP** | ❌ **not available** | Not installed; requires a 21st.dev API key. See D15. |
| Figma / Adobe / Canva | ❌ not used | DEC-302 — `logo.png` is canonical, `public/brand/` is generated. Routing assets through external tools reintroduces the drift those decisions exist to prevent. |
| ElevenLabs, Notion, Slack, Gmail, Drive, Airtable | ❌ not used | No build or verification need. Using them would be tool theatre. |

### Components reused from GitHub / 21st.dev

**Zero — and the reason is now evidence rather than an excuse.**

The earlier version of this entry gave two reasons, one of which was that `gh`
was unauthenticated so the search never happened. **It has now happened.** The
seven named registries were looked up on GitHub directly, and the result is in
`OPEN_SOURCE_MANIFEST.md`:

- **Origin UI** — repo now redirects to Cal.com's `cosscom/coss`, **AGPL-3.0**.
  Strong copyleft; a legal question, not a developer's judgement.
- **React Bits** — **NOASSERTION**; licence unverifiable.
- **`21st-dev/magic-mcp`** — no LICENSE file at all.
- shadcn/ui, Magic UI, Radix, Motion Primitives — confirmed **MIT**.

All three of those problems were previously recorded here as "mixed MIT" on
reputation. Finding out is what the search was for.

Nothing was imported, for a reason specific to this phase: every registry ships
*visual components*, and the page in question fails its mobile gate because it
already sends too much. Adding components to fix a bandwidth problem moves the
number the wrong way.

---

## Shipped this phase — Phase G, content architecture

| What | Detail |
|---|---|
| `/services` index | `CollectionPage`, hub for the four pages, and the intermediate crumb that makes the breadcrumb honest |
| `/services/[slug]` × 4 | Lead Capture, WhatsApp Automation, Appointment Booking, CRM Automation — statically generated, `dynamicParams = false` so an unknown slug 404s rather than rendering an empty shell |
| `content/services.ts` | Typed content module; one source for pages, graph, sitemap and `/llms.txt` |
| `lib/structured-data.ts` | The entity graph, moved out of the root layout |
| 58 new tests | Graph shape, breadcrumb order and resolvability, per-page canonicals, FAQ parity, heading order, sitemap, `/llms.txt`, plus axe on the new routes |

### The architectural change worth knowing about

The entity graph used to be emitted from `layout.tsx`. That was correct for a
one-route site and would have been **wrong the moment a second route existed**:
every sub-page would have declared `@id: /#webpage` — claiming to *be* the
homepage — and carried the homepage's FAQ. It moved to `lib/structured-data.ts`
with a per-route builder, so each page emits one complete, self-consistent
`@graph`. The "exactly one JSON-LD block" invariant is unchanged and still
asserted, now on every route.

Same class of latent bug in navigation: every nav and footer link was a bare
fragment (`#faq`), which resolves against *the current page*. From
`/services/...` all of them pointed at sections that route does not contain.
Now root-relative (`/#faq`). On the homepage the browser still treats that as a
same-document fragment, so scroll behaviour there is unchanged.

### Governance, asserted rather than trusted

Two tests exist because both failures are invisible in a diff review:

- **Catalogue parity** — every service page's `name` and `serviceType` must
  match its `Offer` in the organisation's catalogue, and the offer must link to
  the page. Drift means the graph advertises services no page describes.
- **No new integration claims** — every tool named on a service page must
  already appear in the published integrations answer in `content/faq.ts`.
  Adding one here would be a new capability claim made in passing, during what
  looks like a copy edit.

No prices, timelines, customer names, metrics or certifications were added.
`symptoms` describe what the reader already observes in their own business —
the one kind of specificity available without making a claim about our results.

## Fixed this phase

| Fix | Severity | How it was found |
|---|---|---|
| **All five new routes shipped with no social image** | **High (distribution)** | Grepping the prerendered HTML for `og:image` after building the routes. Next.js `opengraph-image` conventions are **not inherited by child segments**, so the root card covered `/` only — while the layout still announced `summary_large_image` everywhere. Any service link pasted into WhatsApp, Slack, LinkedIn or X would have rendered as a bare text card. Fixed with per-service cards; a test now fetches every declared image on every route and asserts 200 + `image/*`. |
| **Step numerals failed AA contrast** | Medium (WCAG 1.4.3) | axe, on a component written this phase. `accent-bright/70` on void computes to **4.27:1**, under the 4.5:1 floor. Fixed at `/80` (**5.33:1**) — the opacity `.kicker` already uses, so no one-off value entered the system. Ratios computed, not eyeballed. |
| **Every nav and footer link broke off the homepage** | Medium (navigation) | Building the first sub-page. Bare `#faq` fragments resolve against the current page, so on `/services/...` the whole nav pointed at nothing. Latent for as long as the site had one route. |
| **Hero video ignored `prefers-reduced-motion`** | **High (WCAG 2.2.2)** | Manual audit — the global CSS reduced-motion rule neutralises CSS animation only, so a looping video kept playing for exactly the visitors who asked motion to stop. The one motion layer missed when every other was audited. |
| **Hero core clipped to a visible rounded rectangle** | Medium (visual) | Screenshot review — the vignette never reached the container edge at 1440px, so the "ambient glow" terminated in a hard seam across the headline. Now masked to a radial falloff. |
| **"One quietly run business."** | Medium (copy) | DOM heading extraction — ungrammatical H2 on a premium site. Now "One quietly running business." |
| Capture script reported false mobile rendering | Medium (tooling) | A 390px desktop viewport is not a phone — it reports `pointer: fine`, so the custom cursor mounted and parked a dot over the copy. Looked like a site bug; was a script bug. Now uses real device descriptors. |

### Verified and already correct

Recorded because "we checked and it was fine" is a result.

- **Anchor targets clear the fixed nav.** No `scroll-margin-top` is declared
  anywhere, which usually means anchors land under a fixed header. Measured all
  6 nav anchors: every one lands at 182px against a 64px nav, because sections
  carry their own top padding. No change needed.
- **`CustomCursor` correctly disabled on touch** — `pointer: coarse` guard
  confirmed live; `cursor-none-all` never applied on a real device profile.

---

## Open bugs

**None known.** Every defect found this phase was fixed and verified.

## Open blockers

| # | Blocker | Owner | Unblocks |
|---|---|---|---|
| **B2** | **`sheetflow.ai` is not attached to this Vercel project.** `vercel domains ls` returns **0 domains**, and `NEXT_PUBLIC_SITE_URL` (set for Production *and* Preview) resolves to `sheetflow-ai-website.vercel.app` — verified on the preview, whose canonical reads `https://sheetflow-ai-website.vercel.app/services/whatsapp-automation`. **Every canonical, `og:url`, sitemap `<loc>`, `llms.txt` reference and JSON-LD `@id` therefore points at a vercel.app subdomain.** The code default is `https://sheetflow.ai` and every document here describes that as canonical; the deployment disagrees. Moving later re-hosts the whole entity graph and discards whatever authority accrued — which is precisely the cost the `@id` architecture exists to avoid. **Attach the domain and set the env var before any indexing is invited.** | **Founder** (domain purchase/DNS) | Correct canonicals, a stable entity graph, production launch |
| **B1** | Portfolio permission — 3 engagements corroborated as real deployed sites, but nothing shows they are paying clients, that outcomes were measured, or that anyone consented to be named | **Founder** | Case studies, `Review`/`AggregateRating` schema, trust logos, the single biggest conversion lever on the page |
| **D2** | `origin/main` diverged, 13 ahead / 1 behind, no fast-forward path | **Founder** | Production deploy |
| — | Production deployment approval | **Founder** | Going live |
| — | `gh auth login` | **Founder** (credentials) | GitHub research, GitHub MCP |
| **D12** | Preview deployments are SSO-protected | **Founder** (security setting) | Automated verification against a preview URL |
| **A1** | Is the Spline/3D direction still live? 6 unused deps force `--legacy-peer-deps` | **Founder** (architecture) | Dependency cleanup, resolves D6 |

## Remaining work (not blocked)

1. ~~**Topic clusters / sub-pages**~~ — **done this phase.** Four service pages
   shipped; BreadcrumbList now has a legitimate use.
2. **Hydration cost** — `next` 138 ms, `framer-motion` 90 ms in load phase. The
   remaining performance lever that carries **no design consequence**, and now
   the highest-value unblocked work.
3. ~~**The new routes have no measured performance baseline**~~ — **done.**
   Measured 96 and 97; the prediction that they would be "lighter" understated
   it considerably.
4. ~~**`npm run shots` has not been run against the new routes**~~ — **done**,
   desktop/tablet/mobile. It caught a defect no test would have: two controls
   labelled "How we work" pointing at different anchors.
5. **Mobile 4× has not been re-measured** since 2026-08-06 (last figure: 50),
   and the service routes have no mobile number at all. Desktop 97 does not
   imply a good mobile score — the homepage's desktop/mobile gap is 15 points.
6. D9 `violet` token migration (34 usages, visually inert).
7. D4 remove `raw-loader`; D5 remove inert `.eslintrc.json` (both need approval).

### A tooling flake worth naming

`npm run audit:bundle` immediately after `npm run test:e2e` once reported *"No
JS or CSS emitted — the build looks empty"* against a `.next` that demonstrably
had 25 chunks; re-running it passed unchanged. This is the documented
Windows/OneDrive `.next` contention, now seen in a new place — it sits inside
`npm run verify`, whose last step is exactly that sequence. **A red `verify`
should be re-run once before it is believed.** Not investigated further; it is
environmental, not a code fault.

---

## Next recommended phase

**Phase I — Reduce mobile bytes, and take the A2 decision.**

Phase H established the constraint: **mobile is bandwidth-bound (D23)**, and the
homepage fails its own ≥50 gate at 48. The lever is bytes — 19 woff2 files
totalling 607 kB with 228 kB preloaded, plus Lighthouse's own "reduce unused
JavaScript" at 0.64 s.

**Two cautions carried forward from this phase**, where two plausible
hypotheses were both falsified by measurement:

- Font *weight* trimming does nothing — `next/font` emits per **subset**, not
  per weight. The lever is typefaces and subsets, not weights.
- Read the LCP element from `report.json` before theorising about it.

Reducing typefaces is a design decision under `SHEETFLOW_VISUAL_DNA.md`, so it
needs the founder. A2 is still open and now answerable on evidence.

### Recommended next prompt

> Cut mobile bytes, measuring each change on its own. Start by reporting what
> the three typefaces actually cost — per typeface and per subset — and what
> Lighthouse's "unused JavaScript" 0.64 s resolves to by chunk. Propose the
> smallest change that moves the homepage above the 50 gate, measure it in
> isolation (mobile preset, median of 5, same route before and after), and
> report the delta with its spread — including if it is noise. Do not trim font
> weights: verified to change nothing. Do not touch typeface *choice* without
> founder sign-off; that is `SHEETFLOW_VISUAL_DNA.md` territory.

---

## Superseded — Phase H as originally scoped

**Take the A2 decision on evidence, and close the mobile gap.**

The baseline is no longer the missing piece; it exists, and it changed the
question. A2 has been the project's largest open design decision for three
phases, and it was stuck because the cost looked inseparable from the identity.
It is not — a page in the same visual language scores 97. Someone can now
decide *which components* rather than *how much brand*.

**That decision is the founder's and should be taken before more engineering.**
Optimising components that may be removed is wasted work.

The unblocked engineering meanwhile is mobile. Desktop 97 says nothing about
mobile: the homepage's own desktop/mobile gap is 15 points, and mobile is where
the audience actually is for a WhatsApp-automation business.

### Recommended next prompt

> Measure the mobile picture properly, then act on A2. Run `npm run audit:lh`
> with `LH_PRESET=mobile` against `/`, `/services` and one service page, median
> of 5 — the service routes have no mobile number at all and the homepage's is
> from 2026-08-06. Report each with its spread and say plainly which deltas are
> noise-bound. Then, if the founder has answered A2, act on the named
> components; if not, take the hydration lever instead (`next` 138 ms,
> `framer-motion` 90 ms), measuring the previous commit with the identical
> method for the before.
