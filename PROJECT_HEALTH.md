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
| **Build** | ✅ green, **15 routes** (was 10) |
| **Verification** | ✅ **132 tests passing** (was 74) |
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
| Performance | ⚠️ 65 desktop / 50 mobile | paint-bound, structural — see A2 |
| Customer proof | ⛔ **blocked** | B1 — needs written permission |
| Production deploy | ⛔ **blocked** | needs founder approval |

---

## Lighthouse

Measured 2026-08-06, production build, `npm run audit:lh`, median of N.

| Category | Desktop | Mobile 4× | Gate |
|---|---|---|---|
| Performance | **65** | **50** | ≥50 ✅ |
| Accessibility | **100** | — | ≥90 ✅ |
| Best practices | **96** | — | ≥90 ✅ |
| SEO | **100** | — | ≥90 ✅ |

Desktop: FCP 0.4 s · LCP 1.2 s · TBT ~610 ms · **CLS 0.000** · SI 3.4 s

**Read TBT with care.** Spread is 270–6,049 ms on this machine. Only differences
larger than that are real.

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
| OpenGraph + Twitter Cards | ✅ incl. dynamic OG and Twitter image routes |
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
| chrome-devtools MCP | ❌ **not usable** | **Diagnosis corrected.** Not session timing — the project folder's trust prompt has never been answered (`hasTrustDialogAccepted: false`), so Claude Code will not launch any `.mcp.json` server here. See TOOLING_MANIFEST. Needs ~5 s of founder time. |
| context7 / sequential-thinking / filesystem / playwright MCP | ❌ same | Same single root cause. `enabledMcpjsonServers` was added to `.claude/settings.local.json` and verified **not** sufficient on its own. |
| **GitHub MCP + `gh` CLI** | ⛔ **blocked** | `gh auth status`: not logged in. **No GitHub repository research was performed.** |
| **21st.dev / Magic MCP** | ❌ **not available** | Not installed; requires a 21st.dev API key. See D15. |
| Figma / Adobe / Canva | ❌ not used | DEC-302 — `logo.png` is canonical, `public/brand/` is generated. Routing assets through external tools reintroduces the drift those decisions exist to prevent. |
| ElevenLabs, Notion, Slack, Gmail, Drive, Airtable | ❌ not used | No build or verification need. Using them would be tool theatre. |

### Components reused from GitHub / 21st.dev

**Zero — and that is the correct outcome, not a gap.**

Two independent reasons: `gh` is unauthenticated so GitHub search was
unavailable, and D15 records that importing third-party component libraries
forks a design system already defined in `brand-os/03_component-language` and
implemented against the project's tokens. The premium look here comes from the
token system and motion language, not from borrowed components.

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
3. **The new routes have no measured performance baseline.** They are lighter
   than the homepage — no atmosphere-heavy hero, fewer motion layers — but
   "lighter" is a prediction, not a measurement. `npm run audit:lh` has not been
   pointed at `/services/*`.
4. **`npm run shots` has not been run against the new routes**, so nothing has
   visually reviewed them at three breakpoints.
5. D9 `violet` token migration (34 usages, visually inert).
6. D4 remove `raw-loader`; D5 remove inert `.eslintrc.json` (both need approval).

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

**Phase H — Measure what shipped, then reduce hydration cost.**

Phase G added five routes and zero measurements of them. The order matters:
baseline first, because the hydration work in step 2 needs a "before" taken
with the same instrument (see the compare-like-with-like rule in
AI_RUNTIME_MEMORY).

### Recommended next prompt

> Baseline the new routes, then attack hydration. Run `npm run audit:lh` against
> `/services` and `/services/whatsapp-automation` (median of N, warm-up
> discarded) and `npm run shots` at all three breakpoints for both, and record
> both in TOOLING_MANIFEST. Then reduce load-phase hydration cost — `next`
> 138 ms and `framer-motion` 90 ms are the two ranked entries — measuring the
> previous commit with the identical method for the before. Do not touch the
> decorative layers: D17 closed in the negative and A2 is a founder decision.
