# RC11: Light by default, dashboards as stories

2026-10-21. Branch `feat/storytelling-motion`, built from the RC10 commit (`1dea8ad`). Decisions D36 and D37.

## The brief

1. Light mode loads by default, ignoring the OS setting, with a smooth Dark toggle in the nav.
2. The hero and the other 3D sections stay high-contrast dark "stage" panels inside the light page.
3. Saraswati Dental Clinic, HEMLIFESTYLE, R³S Realty and SheetFlow Operations appear as real dashboards in a storytelling format.
4. Borrow the best of wantace.com's motion and layout flow, without adding weight.
5. Keep all existing work.

## What changed

| Area | Files |
|---|---|
| Theme tokens (light default, original dark preserved) | `src/app/globals.css` ("THEME TOKENS", "THEME BEHAVIOUR"), `tailwind.config.ts` |
| Theme logic and toggle | `src/lib/theme.ts`, `src/lib/use-theme.ts`, `src/components/ui/ThemeToggle.tsx`, `src/app/layout.tsx` (inline head script), `src/components/layout/Navigation.tsx` |
| Dark stages | `Hero.tsx`, `UniverseStage.tsx`, `FinalCTA.tsx` (one `data-theme="dark" data-stage` attribute each) |
| Atmosphere | `DeferredAtmosphere.tsx` (particles and grain not mounted in Light) |
| Colour literals to tokens | 16 component files, mechanically (inline `rgba()` to `rgb(var(--...) / a)`) |
| Dashboard stories | `src/content/dashboards.ts`, `src/components/sections/DashboardStories.tsx`, `public/work/story/*.webp`, wired into `CaseStudy.tsx` (home) and `app/work/page.tsx` |
| Ticker | `src/components/sections/CapabilityTicker.tsx`, wired into `app/page.tsx` |
| Tests | `tests/e2e/theme.spec.ts`, `tests/e2e/stories.spec.ts`, `tests/e2e/a11y.spec.ts` (Dark block) |

Nothing was removed. `content/work.ts` and every existing case study are untouched.

## Theme: how it works

- `<html data-theme="light">` in the served HTML. An inline script in `<head>` applies a *saved* choice before first paint; it never reads `prefers-color-scheme`.
- Every colour is a CSS variable. Light values are new; dark values are the original palette. `[data-theme="dark"]` matches any element, which is how the stages stay dark.
- To change the default: `DEFAULT_THEME` in `src/lib/theme.ts`. `?theme=dark|light` is a QA hook.
- The nav keeps the dark palette while the homepage hero is behind it, then follows the page.

## Stories: how they work

Server-rendered, no client JavaScript. From 1024px each desktop scene is `position: sticky` with a per-scene offset, so the next scene slides over the last (wantace.com's process-card technique). Phone frames show the top of a tall page and, as they scroll through the viewport, drift to the bottom (`animation-timeline: view()`); browsers without it, and visitors with reduced motion, see the static top. Images are `next/image`, lazy.

## Motion borrowed from wantace.com

Sticky stacking, a logo-strip style ticker with faded edges (applied to capabilities the site already publishes, pausable and stopped by reduced motion), a spring-style appear on scene copy (opacity from 0.001, 10px rise), and scroll-linked reveals. Smooth scroll, glass and bento cards were already in the site.

## Weight

| | before | after |
|---|---|---|
| JS gzip | 409.4 kB | 410.2 kB (+0.8) |
| CSS gzip | 17.0 kB | 18.6 kB (+1.6) |
| New dependencies | | none |
| New images | | 12 WebP, 863 KB in total, lazy, optimized per request by `next/image` |

(The 360 kB JS budget was already exceeded before this work; this branch does not change that, and does not make it worse by more than 0.2%.)

## Verification

Run on 2026-10-21 against a production build made with the same flags as Vercel (`next build --webpack`).

| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| `next build --webpack` | succeeds |
| `eslint src` | 0 errors, 6 warnings, all in files this work did not touch (`SplineScene.tsx` and similar, `react-hooks/set-state-in-effect`) |
| Playwright, your 7 specs plus 2 new ones (`theme`, `stories`), desktop and Pixel 7, installed Chrome | **443 passed, 0 failed** on the final build (249 in `a11y`/`theme`/`stories`/`payload`/`work`, 194 in `smoke`/`seo`/`responsive`/`commerce`) |
| axe, WCAG 2.1 AA | 0 violations in **Light and Dark** on `/`, `/work`, `/pricing` and every route the existing a11y spec covers, including the reduced-motion variants |
| Light is the default with the OS set to dark | verified in the served HTML, in desktop and mobile, and by test |

**The first full run found nine failures, all fixed.** Small blue labels and the nav links failed WCAG contrast in the new Light palette (tokens corrected: `--color-accent-bright`, plus theme-aware alpha for nav and loading text). One existing test assumed the particle canvas runs in the default theme (it now selects Dark, and a new test asserts there is no canvas in Light). Four failures were mistakes in my new stories tests. Two mobile case-study tests timed out only because the machine was also running screenshots and lint.

**Not measured:** Lighthouse scores, Safari and Firefox (scroll-driven animation is progressive enhancement, and the static layout is the fallback), real devices.

## Known limits and open items

- About six translucent overlay colours in `globals.css` were snapped to the nearest token so they could theme; in Dark they differ from the old literals by at most 7/255.
- The OG share images are static brand cards and stay dark.
- `ParticleField` draws on a canvas with literal colours; it only runs in Dark, where those colours were designed.
- "Creative media / video production" is not published anywhere on the site today, so it is not in the ticker or the stories. Add it to `content/services.ts` once the wording is confirmed.
- Not deployed. The branch is local until reviewed.
