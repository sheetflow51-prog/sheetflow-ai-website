# Project Health — SheetFlow v2

> Single-snapshot dashboard. Regenerated after every phase.
> **Last updated: 2026-08-08** · Phase K (portfolio, pricing, booking) · branch `feat/m01-foundation`

Scores below are **measured or verifiable**, never estimated. Where a number
cannot be measured honestly it says so — a confident percentage nobody computed
is how this project got a retracted performance finding.

---

## Overall

| | Status |
|---|---|
| **Production ready?** | ⚠️ **Engineering complete — two founder blockers remain (B2 domain, D2 branch)** |
| **Build** | ✅ green, **28 routes** (was 19) |
| **Verification** | ✅ **264 tests passing** (was 152) |
| **Deployed to production** | ❌ awaiting founder approval |

**Completion is deliberately not given as a single %.** Everything that is
engineering-gated is done. What remains is **permission-gated and
credential-gated**: a domain nobody has bought, a branch nobody has reconciled,
and a deployment nobody has approved. A percentage here would imply the
remainder is work I can do, and it is not.

| Area | State | Evidence |
|---|---|---|
| Homepage build | ✅ complete | 10 sections, 3 breakpoints verified via `npm run shots` |
| Design system | ✅ complete | `brand-os/`, tokens mirrored in `tailwind.config.ts` |
| **Portfolio / case studies** | ✅ **complete** | **B1 closed (D24).** 3 case studies at `/work`, each linking to a live deployment. Elevate WPC omitted — no verifiable artifact (D27) |
| **Pricing** | ✅ **complete** | `/pricing` — ₹19,999 / ₹4,999-mo published under D25, machine-readable, comparison table, 7 FAQs, honest calculator |
| **Booking** | ✅ **complete** | `/book` — 4-question qualification → Calendly prefill, **zero third-party JS**, works without JavaScript (D26) |
| Accessibility | ✅ AA | Lighthouse 100 on every route, axe 0 violations across 6 route/motion combinations |
| SEO | ✅ 100 | Lighthouse SEO 100 on every route |
| GEO / answer-engine | ✅ strong | see below |
| Performance | ⚠️ **homepage 52 mobile / ~59–65 desktop** · **new routes 65–76 mobile** | Homepage unchanged despite gaining 3 images. New routes are the fast ones. See below |
| Customer **outcome** metrics | ⛔ **still blocked** | No engagement has a measured, client-confirmed result. Correctly absent |
| Production deploy | ⛔ **blocked** | needs founder approval |

---

## Lighthouse — 2026-08-08, mobile preset, median of 5

Production build, `npm run audit:lh` with `LH_PRESET=mobile` (4× CPU **and**
simulated Slow 4G), warm-up discarded, run back to back on one machine.

Mobile is reported first this phase because it is the stricter test and it is
where the audience for a WhatsApp-automation business actually is.

| Route | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | SI |
|---|---|---|---|---|---|---|---|---|---|
| `/` | **52** | 100 | 96 | 100 | 0.9 s | 3.9 s | 4,300 ms | 0 | 7.1 s |
| `/work` | **65** | 100 | 96 | 100 | 0.9 s | 4.2 s | 910 ms | 0 | 2.8 s |
| `/pricing` | **66** | 100 | 96 | 100 | 2.1 s | 5.0 s | 480 ms | 0 | 3.4 s |
| `/book` | **76** | 100 | 96 | 100 | 1.3 s | 3.7 s | 510 ms | 0 | 2.8 s |

**The homepage did not regress, and that was the risk worth measuring.** It
gained three case-study images this phase and scored **52** — the exact
median-of-9 baseline recorded in Phase J, and the centre of its documented
48–54 band. Read this as *no detectable change*, **not** as confirmation that
images are free: a one-point move on this machine is noise, and the honest claim
is that any cost is below what this instrument can resolve.

**`/pricing` per-run: 55/58/66/67/74.** A 19-point spread on an unchanged build
in one batch. The median is trustworthy; any single run is not. This is the same
machine-load effect documented in Phase J and it has not gone away.

**The new routes are the fast ones**, as the service routes were. Everything
they share with the homepage — tokens, fonts, glass, `framer-motion`, `gsap`,
Lenis, cursor, `DeferredAtmosphere` — is exonerated again. The homepage cost
remains its own decorative composition (A2).

Desktop was not re-measured this phase. The documented band is 59–65 and nothing
shipped here touches the desktop render path; quoting a fresh number from a
different batch would invite exactly the invalid between-batch comparison Phase J
was retracted for.

---

## Performance — root cause known, and it is not a bug

| Steady state, 4 s idle | Total main-thread task | Paint & composite |
|---|---|---|
| Motion on (ships today) | 374 ms | 272 ms (73%) |
| Reduced motion | 246 ms | 224 ms (91%) |

**Paint and compositing are 73–91% of the main thread.** JavaScript is the
minority cost. The decorative atmosphere costs ~128 ms per 4 s (~9% duty cycle).

**D17 is closed in the negative:** no single expensive effect exists. Reducing
paint means fewer/smaller translucent layers — a design decision (A2), currently
**recommended: do nothing**. 9% does not justify weakening the visual signature.

**Phase J closed the JavaScript arm.** Dynamic-importing gsap and code-splitting
nine sections moved the homepage 52 → 53 (Mann-Whitney U = 57.5 against a
critical 62 at n=9 — not significant) and was rejected. Do not re-propose it
without a new mechanism.

---

## SEO

| Surface | State |
|---|---|
| JSON-LD `@graph` | ✅ Organization, WebSite, WebPage, FAQPage, OfferCatalog, 6 × Offer/Service — **exactly one block per route**, asserted on all 9 content routes |
| **`OfferCatalog` with real prices** | ✅ **new** — `minPrice` for the "from" tier (a floor, not a fixed fee), `UnitPriceSpecification` for the monthly, **no price node** for the quoted tier. A test asserts the schema price equals the rendered price per tier |
| **`CreativeWork` per case study** | ✅ **new** — `creator` SheetFlow, `about` the client, `url` the live deployment. **Typed `CreativeWork`, not `WebSite`**, after the rendered graph showed two `WebSite` nodes competing to name the site |
| **`Service` + zero-price `Offer` on `/book`** | ✅ **new** — "free" stated machine-readably rather than left to be inferred from the word, plus a `ReserveAction` naming the booking surface |
| Title / description / canonical | ✅ per route, asserted |
| OpenGraph + Twitter Cards | ✅ **on all 9 content routes** — per-project and per-service edge-rendered cards. Every declared image is fetched in-test and must return 200 with an `image/*` type |
| `robots.txt` | ✅ names AI crawlers explicitly, points at sitemap |
| `sitemap.xml` | ✅ generated from the content modules; `/book/confirmed` deliberately excluded |
| Semantic HTML / heading order | ✅ single H1 per route, no skipped levels, asserted |
| Image optimisation | ✅ AVIF + WebP via `next/image`, 30-day cache |
| **BreadcrumbList** | ✅ on `/services`, `/work` and all sub-pages; every crumb target fetched in-test. Still absent from the homepage, which has no ancestors — asserted |
| **LocalBusiness** | ⛔ **Refused** — requires a `PostalAddress`; none is published. Inventing one violates the first standing rule *and* Google's policy. Asserted by test |
| **Review / AggregateRating** | ⛔ **Absent by design, now asserted on every content route.** Permission to be named is not a review, and no review has been collected |

## GEO — generative engine optimisation

| Signal | State |
|---|---|
| `/llms.txt` | ✅ served, **rewritten this phase** — see below |
| AI crawler rules | ✅ GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended named |
| FAQ coverage | ✅ 8 site + 12 service + **9 project + 7 pricing = 36 Q&A**, markup/copy parity asserted per page |
| Per-answer deep links | ✅ each answer individually linkable |
| Entity graph | ✅ linked `@graph` with resolvable `@id` |
| `knowsAbout` expertise signal | ✅ 9 entities, each mapped to a service actually sold |
| `contactPoint` | ✅ reachable sales contact + booking URL |
| **Published prices in structured data** | ✅ **new, and the highest-value GEO surface on the site.** "How much does WhatsApp automation cost" is a question assistants are asked constantly and can almost never answer, because agencies publish "contact us" |
| **Named client work** | ✅ **new** — 3 case studies with resolvable live URLs, giving assistants something citable about delivered work |
| Topic clusters | ✅ 4 service pages + 3 case studies, each with its own questions and two-way internal links |

### The `llms.txt` defect this phase caught

The previous revision closed with: *"SheetFlow publishes no customer names,
outcome metrics, testimonials or compliance certifications… If you are asked
about SheetFlow's results, client list or pricing, the accurate answer is that
this information is not published."*

**Two of those became false the moment `/work` and `/pricing` shipped.** A stale
instruction in that file is worse than no file: it is a directive, addressed to
the systems most likely to obey it, telling them to deny that published pages
exist.

The guidance now separates the two cases precisely — **names and prices are
published; outcome metrics and testimonials are not** — because that distinction
is the entire governance position, and a model repeating it should get it right.
A test asserts the stale sentence is gone and the new guidance is present.

---

## Accessibility

axe-core, WCAG 2.1 AA tags, against the production build, animations frozen at
final state. Run across **6 route/motion combinations**: `/`, `/services`,
`/services/whatsapp-automation`, `/work`, `/work/saraswati-dental-clinic`,
`/pricing`, `/book`, plus reduced-motion arms on `/`, a service page and
`/pricing`.

**Zero violations.** Lighthouse accessibility is **100** on every route.

Beyond axe, asserted directly because axe cannot see them:

- **Every booking control resolves from its visible label.** axe catches a
  missing label; it does not catch a label attached to the wrong control, which
  reads correctly in a diff and is wrong in a screen reader.
- **The calculator announces its result** through a single `aria-live="polite"`,
  `aria-atomic` region — without it, the figure changes in silence.
- **Case-study alt text is descriptive, not a filename**, and longer than 20
  characters. These images are the evidence the pages rest on.
- **The comparison table is a real table** with `th[scope="row"]` row headers,
  not a div grid.

### Fixed this phase — WCAG 2.1.1, and only visible on mobile

The `/pricing` comparison table scrolls horizontally below `md`. Its container
was `overflow-x-auto` **without `tabindex`**, so a keyboard-only user could not
reach or scroll it — axe `scrollable-region-focusable`, impact **serious**.

**Desktop passed throughout.** The defect only exists at the width where the
scroll actually appears, which is why the mobile axe arm added this phase is
what caught it. A single-viewport accessibility audit would have shipped it.

---

## Workspace hygiene

Scanned 2026-08-08.

| Check | Result |
|---|---|
| Merge conflicts / conflict markers | ✅ none |
| Unfinished merge / rebase / cherry-pick | ✅ none |
| `.orig` / `.rej` / backup artifacts in repo | ✅ none |
| Git working tree | ✅ clean at commit time |
| Orphaned VSCode editor backups | ✅ none for this workspace |

**A Windows/OneDrive `.next` contention recurred and is worth naming.** Two
consecutive builds failed with `EPERM … unlink '.next/server/app/book'` while
`next start` held the directory. `pkill -f` does **not** stop the Next server on
Windows — the process survived and kept serving a stale build, which briefly
looked like a code defect (three tests failed asserting a schema change that was
present in source and absent from the response). Stopping the listener by port
and removing `.next` cleared it. **If a schema assertion fails but the source is
right, check what the server is actually serving before debugging the code.**

---

## Capabilities actually used this phase

Honesty matters more here than a long list.

| Capability | Used? | Note |
|---|---|---|
| **Calendly MCP** | ✅ **used, decisively** | `users-get_current_user` + `event_types-list_event_types` read the live event type: `Free Automation Audit`, 30 min, Google Meet, free, **one custom question at position 0**. That last fact is what makes `a1` the correct prefill parameter. Without it the hand-off would have been built on a guess |
| **Vercel CLI** | ✅ used | `projects ls` established there are **5 projects and Elevate WPC is not among them** — the evidence behind D27. `domains ls` re-confirmed B2 at 0 domains |
| **Playwright (direct)** | ✅ used | Case-study screenshot capture from three third-party deployments; render verification; the 264-test suite |
| **axe-core via Playwright** | ✅ used | Found the WCAG 2.1.1 defect above |
| **Lighthouse** | ✅ used | 4 routes × 5 runs on the mobile preset |
| **`curl` / direct HTTP** | ✅ used | Every technical claim in the case studies was read off the live deployments this way, plus asset-size measurement of the R³S chunks |
| chrome-devtools MCP | ❌ not used | Playwright already drives CDP in this project's own tooling (`npm run trace`, `npm run profile`). A second path to the same protocol would be tool theatre |
| context7 MCP | ❌ not used | No unfamiliar library API was involved. Next.js `opengraph-image`, `next/image` and schema.org were already documented in-repo from prior phases |
| sequential-thinking / filesystem MCP | ❌ not used | Native tools cover both |
| **GitHub MCP** | ⛔ **fails** | *"Incompatible auth server: does not support dynamic client registration."* An OAuth capability mismatch, not a login gate. `gh` covers GitHub work |
| **Netlify MCP** | ⛔ **fails** | HTTP 502 from the origin. Irrelevant — the project deploys to Vercel |
| Roboflow / Vaisala / Autodesk MCP | ⛔ need auth | None is relevant to this project |
| **21st.dev / Magic MCP** | ❌ not available | Not installed; requires an API key. See D15 |
| Figma / Adobe / Canva | ❌ not used | DEC-302 — `logo.png` is canonical, `public/brand/` is generated. Routing assets through external tools reintroduces the drift those decisions prevent |
| ElevenLabs, Notion, Slack, Gmail, Drive, Airtable | ❌ not used | No build or verification need |

### Components reused from GitHub / 21st.dev

**Zero again, and the reason is specific to this phase rather than general.**

The registries audited in Phase H stand: Origin UI is **AGPL-3.0**, React Bits is
**NOASSERTION**, `21st-dev/magic-mcp` ships no LICENSE; shadcn/ui, Magic UI,
Radix and Motion Primitives are confirmed **MIT**.

What this phase needed was a pricing table, a comparison grid, a form and an
architecture diagram. Every one is ~60 lines of markup whose value is entirely in
the *content governance* — which capability maps to which catalogued service,
which price shape is a floor versus a fixed fee, which input is the visitor's
estimate rather than our claim. An imported component supplies the markup and
none of that, while adding a dependency to a page whose measured constraint is
bytes. The architecture diagram is the clearest case: the obvious library choice
is an SVG flowchart, and an SVG flowchart is **an image to a screen reader**. An
ordered list *is* the semantics.

---

## Shipped this phase — Phase K

| What | Detail |
|---|---|
| `/work` + `/work/[slug]` × 3 | Case studies with problem, architecture, observed stack, engineering decisions, and a verification note per decision |
| `/pricing` | 3 tiers, 11-row comparison table, 7 FAQs, recovery calculator |
| `/book` + `/book/confirmed` | 4-question qualification → Calendly prefill; confirmation page built but unwired |
| `content/work.ts` | `ProjectOutcome` union — the type-level enforcement of D24 |
| `content/pricing.ts` | Tiers, comparison and FAQs, with the refusals documented inline |
| `lib/booking.ts` | Pure URL builder; Calendly parameter names pinned and explained |
| `components/work/ArchitectureFlow.tsx` | Server component, zero JS, ordered list rather than an SVG |
| `scripts/capture-work-shots.mjs` | Deterministic capture of the three client deployments |
| **112 new tests** | Case-study structure, graph shape, breadcrumb resolvability, canonicals, OG fetch, FAQ parity, price/schema agreement, no-JS booking path, third-party-script absence, calculator arithmetic, and the governance invariants |

### Governance, asserted rather than trusted

Four tests exist because all four failures are invisible in a diff review:

- **No outcome figure without a measurement.** Each case study is scanned for
  signed percentages, multiplier claims, outcome verbs, "ROI", and volume
  claims. A heuristic, deliberately loud.
- **No `Review` / `Rating` / `AggregateRating`** on any content route.
- **Every service a project claims to use exists.** Drift means a case study
  advertising a service with no page.
- **Every published live URL returns 200.** These are third-party deployments
  named on our site; if one goes down, the case study describes something that
  is no longer there.

---

## Fixed this phase

| Fix | Severity | How it was found |
|---|---|---|
| **Comparison table unreachable by keyboard** | **Serious (WCAG 2.1.1)** | axe on the mobile profile — the width where the scroll actually appears |
| **Two `WebSite` nodes per case study** | Medium (SEO) | Reading the rendered graph rather than the source. Google uses `WebSite` to resolve site name and sitelinks |
| **`llms.txt` denied that published pages exist** | **High (GEO)** | Re-reading the file after shipping the routes it describes |
| **Footer sent 5 labels to 1 anchor** | Medium (navigation) | Rewriting the group — the exact pattern a comment 3 lines above already criticised elsewhere in the same file |
| **`PROJECT_STATUS.md` claimed the type system supported metric-free case studies** | Medium (documentation) | Attempting to use it. `VerifiedCaseStudy` *required* a metric; the claim was true of the intent and never of the code |

---

## Open bugs

**None known.** Every defect found this phase was fixed and verified.

## Open blockers

| # | Blocker | Owner | Unblocks |
|---|---|---|---|
| **B2** | **`sheetflow.ai` is not attached.** `vercel domains ls` returns **0 domains**; `NEXT_PUBLIC_SITE_URL` resolves to a `vercel.app` subdomain. Every canonical, `og:url`, sitemap `<loc>`, `llms.txt` reference and JSON-LD `@id` points at the wrong host — **now including the case-study `@id`s that carry client names**. Moving later re-hosts the entity graph and discards accrued authority. **Attach the domain and set the env var before any indexing is invited.** | **Founder** (domain purchase/DNS) | Correct canonicals, a stable entity graph, production launch |
| **D2** | `origin/main` diverged, 13 ahead / 1 behind, no fast-forward path | **Founder** | Production deploy |
| — | Production deployment approval | **Founder** | Going live |
| — | **Calendly redirect to `/book/confirmed`** — set in the Calendly dashboard after deploy, not from this codebase (D26) | **Founder** | Post-booking analytics and the confirmation experience |
| — | **GA4 / Search Console / Clarity IDs** | **Founder** (credentials) | Analytics beyond Vercel's built-in |
| **D12** | Preview deployments are SSO-protected | **Founder** (security setting) | Automated verification against a preview URL |
| **A1** | Is the Spline/3D direction still live? 6 unused deps force `--legacy-peer-deps` | **Founder** (architecture) | Dependency cleanup, resolves D6 |
| **A2** | Does the homepage's decorative composition survive its measured cost? | **Founder** (design) | The only remaining homepage performance lever |

## Remaining work (not blocked)

**Very little, and none of it is high-value.** Named honestly rather than padded:

1. **D9 `violet` token migration** — 34 usages on a deprecated alias. Mechanical,
   visually inert (both names resolve to identical hex).
2. **D4 remove `raw-loader`; D5 remove inert `.eslintrc.json`** — both need
   founder approval for package changes.
3. **Desktop Lighthouse for the four new routes** — mobile is measured; desktop
   is not. Low value: the service routes' desktop/mobile relationship is already
   documented, and desktop is the easier profile.
4. **9 lint warnings** — 7 `react-hooks/set-state-in-effect` deliberately
   downgraded with rationale, 2 unused disable directives in `layout.tsx`.

**What is not on this list, deliberately:** more pages. The site now has 9
content routes covering services, work, pricing and booking. Adding a blog or a
second tier of service pages is a *marketing* decision that needs evidence
someone is searching for it — not an engineering gap.

---

## Next recommended phase

**There isn't an engineering one worth running.** That is the honest read.

The remaining levers are: a design decision the founder owns (A2), an
architecture decision the founder owns (A1), a domain purchase (B2), a branch
reconciliation (D2), and a deployment approval. Every one is outside what
engineering can resolve, and three of them — B2 especially — should be settled
*before* more work is built on top of the current host.

If work must continue while those are pending, the highest-value item is
**desktop Lighthouse on the four new routes**, purely to complete the record.

### Recommended next prompt

> Attach `sheetflow.ai`, set `NEXT_PUBLIC_SITE_URL` to it, redeploy, and verify
> on the deployed artifact that every canonical, `og:url`, sitemap `<loc>`,
> `llms.txt` reference and JSON-LD `@id` resolves to the new host — including
> the three case-study `@id`s. Then reconcile `origin/main` (D2) and take the
> production deployment decision.
