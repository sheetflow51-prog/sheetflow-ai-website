# Launch Checklist

> **Release Candidate 2 — Visual Polish & Launch Candidate.**
> Last verified 2026-08-09 against a production build on branch
> `feat/m01-foundation`.
>
> **This checklist does not deploy anything.** Every item marked ⛔ needs a
> person with credentials, a payment method, or the authority to publish. None
> of them is engineering work that was skipped.
>
> Ticks below mean *measured on the running build this session*, not *believed
> to be true*.

---

## A · Engineering gates — all green

| | Gate | State | Evidence |
|---|---|---|---|
| A1 | TypeScript | ✅ clean | `tsc --noEmit`, 0 errors |
| A2 | Lint | ✅ 0 errors | 8 warnings, all pre-existing in `components/three/` |
| A3 | Production build | ✅ green | 37 routes |
| A4 | JS bundle | ✅ **351.0 kB** gzip / 360 kB | `scripts/audit-bundle.mjs` |
| A5 | CSS bundle | ✅ **11.6 kB** gzip / 40 kB | same |
| A6 | Largest chunk | ✅ 69.2 kB / 170 kB | same |
| A7 | Playwright suite | ✅ see `RC2_SUMMARY.md` | full run, this build |
| A8 | axe — WCAG 2.1 AA | ✅ 0 violations | 12 route/motion combinations |
| A9 | CLS | ✅ **0.0000, 0 shifts** on `/work` and `/work/whatsapp-accounting-os` | `scripts/probe-cls.mjs`, live `PerformanceObserver`, this build |
| A9b | Lighthouse, changed routes | ✅ perf **64 / 64**, a11y **100 / 100**, SEO **100 / 100** | mobile preset, median of 5, one batch with an unchanged control route |
| A10 | Responsive | ✅ 360–1440 px | 10 routes × 5 breakpoints captured |
| A11 | Reduced motion | ✅ honoured | 21 guarded files + global CSS rule; glyph delay gap closed in RC2 |

**A4 note, stated rather than rounded away:** RC2 opened at 350.9 kB and closed
at 351.0 kB. The +0.1 kB is `lib/motion.ts`, a constants module. The phase's
own target was "no increase"; it increased by one tenth of a kilobyte. Recorded
because a target that quietly moves is not a target.

---

## B · Content and governance gates — all green

| | Gate | State | Notes |
|---|---|---|---|
| B1 | Case studies published | ✅ 10 | 3 client, 2 demonstration, 5 internal |
| B2 | Evidence-kind boundary enforced | ✅ by type | `ProjectEvidence` — an internal build has no field a URL fits in |
| B3 | No unverified outcome figures | ✅ | `ProjectOutcome` union; undisclosed outcomes state why |
| B4 | Demonstration builds disclosed above the fold | ✅ | `DemoNotice`, mandatory `basis` string |
| B5 | Third-party permission recorded | ✅ | D24, 2026-08-07 |
| B6 | Seeded demo data labelled | ✅ | `CompanionSurface.note`, type-mandatory |
| B7 | **Diagram claims match page claims** | ✅ **RC2** | `WorkflowGlyph` renders published `architecture[].stage` only; asserted by test |
| B8 | Services ↔ pages parity | ✅ 6/6 | asserted both directions |
| B9 | Pricing published | ✅ | ₹19,999 / ₹4,999-mo under D25 |
| B10 | Booking flow works without JS | ✅ | D26 |

---

## C · SEO and answer-engine gates — green, pending a domain

| | Gate | State | Notes |
|---|---|---|---|
| C1 | Lighthouse SEO | ✅ 100 every route | |
| C2 | Sitemap | ✅ 21 URLs | |
| C3 | robots.txt | ✅ | **see D3 before inviting crawlers** |
| C4 | Canonicals | ✅ correct **in code** | fallback is `https://sheetflow.ai` |
| C5 | OG / Twitter cards | ✅ per route | |
| C6 | JSON-LD `@graph` | ✅ one block per route | 10 case-study `@id`s |
| C7 | `llms.txt` | ✅ | |
| C8 | Breadcrumbs | ✅ | |

---

## D · Founder-gated — ⛔ blocks launch

These are the launch. Everything above is ready and waiting on them.

| | Item | Owner | Cost of delay |
|---|---|---|---|
| D1 | ⛔ **Buy `sheetflow.ai` and attach it in Vercel** | founder | Rising. 10 case-study `@id`s currently resolve to a host that does not exist. |
| D2 | ⛔ **Delete or correct `NEXT_PUBLIC_SITE_URL` on Vercel** | founder | The Vercel value *overrides* a correct code fallback, so a deploy today publishes the wrong host. **No code change needed.** |
| D3 | ⛔ **Do not invite indexing before D1** | founder | Indexing on `vercel.app` then re-hosting discards accrued authority — the one path that spends it and throws it away. |
| D4 | ⛔ **Approve and run `vercel --prod`** | founder | The verified artifact is the local production build; it is byte-for-byte what a deploy uploads. |
| D5 | ⛔ **Reconcile the branch** | founder | `feat/m01-foundation` is **47 ahead, 1 behind** `origin/main`. Inspect the one commit *before* choosing merge vs force. |
| D6 | ⛔ **Rotate 3 credentials** | founder | Twilio auth token, Groq API key, Airtable WhatsApp token. None public; all inside OneDrive, so all replicated to Microsoft and in version history. |
| D7 | ⚠️ Preview SSO bypass secret | founder | Optional. Without it no preview can be audited anonymously. |

**Order:** D6 (security, independent) → D5 (so there is one history to deploy) →
D1 → D2 → D4. D3 is a constraint on D4, not a step.

---

## E · Pre-flight, immediately before deploying

Run in this order. Every one has failed at least once in this project's history.

- [ ] **Confirm the server serves the build you think it does.**
      `cat .next/BUILD_ID` and grep it out of the served HTML. RC1's first
      66-image screenshot matrix was captured from a stale `.next` and was
      caught only by reading a byte count off a screenshot.
- [ ] Stop stale servers **by PID** (`Get-NetTCPConnection -LocalPort 3000`).
      `pkill` does not work in this environment.
- [ ] `npm run preflight` — typecheck, lint, build
- [ ] `npm run test:e2e` — full suite
- [ ] `node scripts/audit-bundle.mjs` — budgets
- [ ] `npm run audit:lh` — Lighthouse, mobile preset, **median of 5**, one
      machine, warm-up discarded. Never compare a fresh number to a number from
      a different batch.
- [ ] Re-capture `release-preview/` from the verified build
- [ ] Confirm `.env` holds no real credentials and is gitignored
- [ ] Delete scratch files (`.rc2-probe.mjs` and similar) before commit

---

## F · Immediately after deploying

- [ ] `sheetflow.ai` resolves and serves over HTTPS
- [ ] `curl -s https://sheetflow.ai | grep canonical` — the host is right
- [ ] `/sitemap.xml` and `/robots.txt` return 200 with the correct host
- [ ] Submit the sitemap in Search Console
- [ ] Open one case study of **each evidence kind** and confirm the disclosure
      renders: client, demonstration, internal
- [ ] Walk the booking flow end to end and confirm the Calendly prefill
- [ ] Re-run Lighthouse against production; record it as a **new batch**, do not
      compare it to local numbers
- [ ] Confirm the five outbound client links still resolve

---

## G · Known and accepted at launch

Not defects. Decisions, recorded so nobody rediscovers them as bugs.

| Item | Why it is acceptable |
|---|---|
| Homepage mobile Lighthouse **52** | A paint cost in the hero's ambient layers. Untouched by RC2, which added nothing to that route. Needs its own phase. |
| `/work` mobile Lighthouse **62–70 band** | A full-width screenshot, ten cards and an architecture flow cost what they cost. CLS is 0 and a11y is 100. |
| No outcome metrics anywhere | No engagement has a client-confirmed measured result. Publishing one would be fabrication; the pages say so explicitly. |
| No reveal animation on `/work` routes | An `opacity: 0` headline delays LCP, and `/work` measures LCP at 4.7 s. Interaction motion was used instead. See `MOTION_INVENTORY.md` § 6. |
| Trust-logo strip does not render | Requires written permission per business. An empty logo row reads as a broken asset, not as honesty. |
| 5 internal systems not in git | 13,822 lines outside this repo. Real, tracked in `BLOCKERS.md`, and not a website blocker. |
