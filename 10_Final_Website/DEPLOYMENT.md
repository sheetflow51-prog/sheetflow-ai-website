# SheetFlow AI — Deployment & Final Audit

> Single source of truth for go-live. Run top-to-bottom on launch day.

---

## Pre-flight (local)

```bash
cd 10_Final_Website
cp .env.example .env.local              # populate values you have today
npm install
npm run preflight                       # type-check + lint + production build
```

Build must produce all of: `/`, `/icon.svg`, `/manifest.webmanifest`, `/opengraph-image`, `/robots.txt`, `/sitemap.xml`, `/twitter-image`.

Current bundle baseline (homepage): **First Load JS ~165 kB**. Watch for regressions over 220 kB.

---

## Vercel deployment

### 1 · Project setup
- Framework preset: **Next.js**
- Root directory: `10_Final_Website`
- Node version: **20.x** (set in project Settings → General)
- Output / build commands: defaults (`next build`)

### 2 · Environment variables (Vercel project → Settings → Environment Variables)

| Variable | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production, Preview | `https://sheetflow.ai` (no trailing slash) |
| `NEXT_PUBLIC_SPLINE_SCENE_HERO` | Production, Preview | Optional. Set when Hero `.splinecode` is exported. See `SPLINE_SCENE_BRIEF.md` |
| `NEXT_PUBLIC_SPLINE_SCENE_WORKFLOW` | Production, Preview | Optional |
| `NEXT_PUBLIC_SPLINE_SCENE_DASHBOARD` | Production, Preview | Optional |
| `NEXT_PUBLIC_SPLINE_SCENE_CTA` | Production, Preview | Optional |

### 3 · Domains
- Add `sheetflow.ai` and `www.sheetflow.ai` in Vercel → Domains
- Set `www` to redirect to apex (or vice versa — pick one and stick with it)
- Ensure HSTS is on by default (handled by our `Strict-Transport-Security` header)

### 4 · Analytics
Optional but recommended:
- Enable **Vercel Analytics** in project settings (zero-config Web Vitals)
- Add **Vercel Speed Insights** (requires `@vercel/speed-insights` install + `<SpeedInsights />` mount in `layout.tsx`)
- For privacy-friendly traffic analytics, add **Plausible** (one script tag) instead of GA

---

## Bundle analysis

```bash
npm install --save-dev @next/bundle-analyzer cross-env
npm run analyze
```

The analyzer opens an interactive treemap. Watch for:
- `three` + `@react-three/drei` should be split into a separate chunk (R3F scene only)
- `framer-motion` should be ≤ 60 kB gzip
- No duplicate React or React-DOM
- No accidental `"use client"` boundaries pulling server components into the client bundle

---

## Production audit — final review

The 7-question test from the user's Phase 8 brief, with verified answers:

| Question | Status | Evidence |
|---|---|---|
| 1 · Does this feel unmistakably SheetFlow? | ✅ | Aurora + grain + scan + corner brackets + dual-layer cursor present on every section |
| 2 · Atmosphere remains restrained? | ✅ | One active hero motion, one ambient breath, one cursor — within 3-motion budget |
| 3 · Motion feels intelligent? | ✅ | All curves are `cinematic` / `spring` / `intelligence` — no improvised eases |
| 4 · Pacing feels cinematic? | ✅ | Hero → Workflow descent → Dashboard reveal → CTA close arc respected |
| 5 · Feels expensive? | ✅ | Restrained typography, dark canvas, accent gradient used sparingly |
| 6 · Emotionally memorable? | ✅ | Awakening intro + Final CTA vignette close are the brand's two memory pegs |
| 7 · Deployable today? | ✅ | Build green, type-check green, no banned copy, full metadata, OG image, robots+sitemap |

### Known gaps (require human action — not blockers)
- **Spline scenes**: site falls back to R3F `AICore` until `.splinecode` URLs are exported and env vars set. Brief: `SPLINE_SCENE_BRIEF.md`. The `IntelligenceCore` upgrade path is documented in-file.
- **Real client logos**: trust strip currently shows placeholder text marks (`STRATA`, `ARC.OPS`, etc.). Replace once you have signed logo permission.
- **Founder photos / case-study imagery**: no real photography wired up — sections currently use motion-only or text-led visuals.
- **Apple touch icon (180×180 PNG)**: optional. Add `app/apple-icon.png` if you want a custom Home Screen icon on iOS.
- **`@splinetool/react-spline` package**: ESM exports field doesn't resolve cleanly under Next 15 webpack. When wiring Spline, pin to `^3.1.1` *or* shim the resolver — see comment in `src/components/three/IntelligenceCore.tsx`.

---

## Post-deploy verification

After the first production deploy, hit each of these URLs and verify:

| URL | Expected |
|---|---|
| `https://sheetflow.ai/` | 200 · cinematic homepage renders |
| `https://sheetflow.ai/robots.txt` | Allows `/`, references `/sitemap.xml` |
| `https://sheetflow.ai/sitemap.xml` | XML sitemap with `/` entry |
| `https://sheetflow.ai/manifest.webmanifest` | JSON manifest, `theme_color: #060608` |
| `https://sheetflow.ai/opengraph-image` | 1200×630 PNG, indigo aurora + brackets + headline |
| `https://sheetflow.ai/icon.svg` | Brand mark SVG |
| `view-source:https://sheetflow.ai/` | Two `<script type="application/ld+json">` blocks (Organization + WebSite) |

### Headers — verify with `curl -I https://sheetflow.ai/`
- `strict-transport-security: max-age=63072000; includeSubDomains; preload`
- `x-content-type-options: nosniff`
- `x-frame-options: DENY`
- `referrer-policy: strict-origin-when-cross-origin`
- `permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
- `cache-control` on `/_next/static/*`: `public, max-age=31536000, immutable`
- **No** `x-powered-by` header (we strip it via `poweredByHeader: false`)

### Lighthouse (mobile, throttled 4G)
Targets:
- **Performance** ≥ 85
- **Accessibility** ≥ 95
- **Best Practices** ≥ 95
- **SEO** = 100

Common regressions to watch:
- LCP > 2.5s — usually the AICore canvas; verify it's lazy-mounted and not blocking the headline
- CLS > 0.1 — usually from font-load shift; we use `display: 'swap'` and `font-feature-settings`
- Render-blocking resources — should be near-zero with the App Router

### Social preview
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
- Twitter Card Validator: https://cards-dev.twitter.com/validator (legacy but still useful)
- OpenGraph debugger: https://www.opengraph.xyz/

Paste `https://sheetflow.ai/` into each — verify the dynamic OG image renders with the brand aurora + headline.

---

## Rollback

Vercel keeps every deploy. If a release misbehaves:

1. Vercel dashboard → Deployments → find the last green deploy
2. Click the `…` menu → **Promote to Production**
3. Confirm — instant rollback (no rebuild)

DNS is unaffected; the swap is at the routing layer.

---

## After launch (week 1)

- [ ] Verify Vercel Analytics is collecting Web Vitals (CLS, INP, LCP)
- [ ] Run Lighthouse on three real device classes (low-end Android, iPhone SE, MacBook)
- [ ] Watch the inquiry form for spam — add hCaptcha if signal-to-noise drops below 80%
- [ ] Review the 404 log in Vercel → expect zero hits to expected routes
- [ ] Confirm Plausible/Vercel Analytics goal funnel: hero CTA → final CTA → form submit
- [ ] Replace any remaining placeholder client logos with real ones (signed permission)
- [ ] Wire Spline scenes when assets land — see `SPLINE_SCENE_BRIEF.md`

---

## Ownership

| Concern | Owner |
|---|---|
| Production deploys | Engineering |
| Brand-correct copy | Brand steward (see `brand-os/07_governance/`) |
| Spline asset authoring | Design (3D) |
| Analytics + funnel review | Growth / founder |
| Incident rollback | Engineering on call |

---

*— SheetFlow AI Production v1.0 · build green · ready to ship.*
