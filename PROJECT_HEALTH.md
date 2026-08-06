# Project Health — SheetFlow v2

> Single-snapshot dashboard. Regenerated after every phase.
> **Last updated: 2026-08-07** · Phase F (product completion) · branch `feat/m01-foundation`

Scores below are **measured or verifiable**, never estimated. Where a number
cannot be measured honestly it says so — a confident percentage nobody computed
is how this project got a retracted performance finding.

---

## Overall

| | Status |
|---|---|
| **Production ready?** | ⚠️ **No — one hard blocker (B1) and one undeployed branch (D2)** |
| **Build** | ✅ green, 10 routes |
| **Verification** | ✅ 74 tests passing |
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
| **BreadcrumbList** | ⛔ **N/A by design** — single-route site. A one-item breadcrumb is schema spam and a rich-result risk. Add only when real sub-pages ship. |
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
| Topic clusters | ⚠️ single page — real clustering needs sub-pages (see next phase) |

**Honest limit:** topical authority is thin because the site is one page. That
is a content-architecture decision, not a markup gap — no amount of schema
substitutes for pages that cover a topic.

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
| Orphaned VSCode editor backups | ✅ none |
| **Dirty editor buffers** | ⚠️ **1, non-semantic** — `probe-cls.mjs` carries 59 leading blank lines; byte-identical ignoring whitespace, disk matches HEAD. **Recommend discarding the buffer in VSCode.** Not blocking, per the editor-buffer policy. |

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
| chrome-devtools MCP | ❌ **not usable** | Installed and handshake-verified, but MCP servers attach at *session start* — added mid-session, live next session |
| context7 / sequential-thinking / filesystem / playwright MCP | ❌ same | as above |
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

## Fixed this phase

| Fix | Severity | How it was found |
|---|---|---|
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

1. **Topic clusters / sub-pages** — the only real GEO gap. One page cannot carry
   topical authority. Service pages would also give BreadcrumbList a genuine use.
2. **Hydration cost** — `next` 138 ms, `framer-motion` 90 ms in load phase. The
   remaining performance lever that carries **no design consequence**.
3. D9 `violet` token migration (34 usages, visually inert).
4. D4 remove `raw-loader`; D5 remove inert `.eslintrc.json` (both need approval).

---

## Next recommended phase

**Phase G — Content architecture.** Build 3–4 service sub-pages (Lead Capture,
WhatsApp Automation, Appointment Booking, CRM Automation), each a genuine topic
cluster with its own `Service` schema, FAQ block and internal links back to the
homepage.

This is the highest-leverage work available: it is the only fix for the topical
authority gap, it gives BreadcrumbList a legitimate purpose, it multiplies the
surface AI engines can cite, and — unlike everything else on the list — **it is
not blocked on anyone's permission.**

### Recommended next prompt

> Build the service sub-page architecture. Create `/services/[slug]` with four
> pages driven by a typed content module, each carrying its own `Service` +
> `FAQPage` JSON-LD, a `BreadcrumbList` that is now genuinely accurate, and
> internal links both ways. Reuse the existing section components and design
> tokens — do not introduce new visual patterns. Extend `seo.spec.ts` to assert
> breadcrumb correctness and per-page canonical URLs, then re-run `npm run
> verify` and `npm run shots`.
