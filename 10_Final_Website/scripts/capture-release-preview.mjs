/**
 * Release Candidate screenshot matrix.
 *
 *   npm start                        # production server on :3000
 *   node scripts/capture-release-preview.mjs
 *
 * Writes `release-preview/<breakpoint>/<route>-{hero,full}.png` — every content
 * route at every breakpoint the site claims to support.
 *
 * ## Why this exists alongside `capture-screens.mjs`
 *
 * That script captures **one route** (whatever `AUDIT_URL` points at) across
 * three viewports, for design review of a single page. This one sweeps the
 * whole site at five widths, because the question a release asks is different:
 * not "is this page right" but "is any page wrong anywhere".
 *
 * ## Determinism, inherited from `capture-screens.mjs`
 *
 * The same three pins, for the same reasons — they were each learned from a
 * capture that lied:
 *
 *   1. Every section reveals on IntersectionObserver, so the page is scrolled
 *      end to end before capture. A naive full-page shot catches them all
 *      hidden.
 *   2. Animations are frozen *after* that scroll, so reveals have played and
 *      elements sit at their final state rather than mid-fade. This is the same
 *      failure the a11y suite hit in Phase Z, where a fixed wait sampled a
 *      wrapper at opacity 0.583.
 *   3. Renderer backgrounding is disabled, or headless Chromium stops
 *      compositing and writes a half-painted frame.
 *
 * Device descriptors are used rather than bare viewport sizes: a 390px-wide
 * desktop Chromium reports `pointer: fine`, so the custom cursor mounts and
 * parks a ring over the copy. That read as a site bug the first time and was a
 * defect in the capture harness.
 *
 * Full-page shots are taken only at the widest and narrowest breakpoints. The
 * homepage is ~15,000 CSS px tall on a phone; capturing that at five widths
 * costs minutes and tells you nothing the two extremes do not.
 */

import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from '@playwright/test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, process.env.SHOTS_DIR ?? 'release-preview');
const BASE = process.env.AUDIT_URL ?? 'http://localhost:3000';

/** Every content route, plus the two the nav does not link to. */
const ROUTES = [
  ['homepage', '/'],
  ['services', '/services'],
  ['service-whatsapp-automation', '/services/whatsapp-automation'],
  ['pricing', '/pricing'],
  ['portfolio', '/work'],
  ['case-study-client', '/work/saraswati-dental-clinic'],
  ['case-study-demo', '/work/ak-dental-diagnostic-centre'],
  ['case-study-internal', '/work/whatsapp-accounting-os'],
  ['booking', '/book'],
  ['booking-confirmed', '/book/confirmed'],
];

/**
 * Five widths, named for what they represent rather than for a device.
 *
 * `large-mobile` is 430px — the iPhone 16 Pro Max class — and it is included
 * because it is the width where a two-column mobile layout is most likely to be
 * attempted and most likely to be cramped.
 */
const BREAKPOINTS = [
  ['desktop', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, true],
  ['laptop', { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 }, false],
  ['tablet', { ...devices['iPad (gen 7)'], deviceScaleFactor: 1 }, false],
  ['large-mobile', { ...devices['iPhone 15 Pro Max'], deviceScaleFactor: 1 }, false],
  ['mobile', { ...devices['Pixel 7'], deviceScaleFactor: 1 }, true],
];

/**
 * Freeze motion, and hide the custom cursor.
 *
 * The cursor is a real part of the desktop experience and not a defect — but a
 * screenshot has no pointer, so it renders wherever the synthetic mouse was
 * last left, which is the middle of the viewport. In the first RC1 capture pass
 * that parked a ring and dot on top of the "Structured data" label of a
 * case-study spec table, which reads as a rendering bug in a deliverable that
 * people will look at without this context.
 *
 * `z-[9999]` and `position: fixed` are the two properties that make it
 * unmissable, and they are what this targets.
 */
const FREEZE = `*, *::before, *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
}
.fixed.z-\\[9999\\] { opacity: 0 !important; }`;

const browser = await chromium.launch({
  args: [
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    '--disable-features=CalculateNativeWinOcclusion',
  ],
});

let written = 0;
let failed = 0;

for (const [bpName, target, wantsFullPage] of BREAKPOINTS) {
  const dir = join(OUT, bpName);
  mkdirSync(dir, { recursive: true });

  for (const [routeName, path] of ROUTES) {
    const page = await browser.newPage(target);
    try {
      const response = await page.goto(`${BASE}${path}`, {
        waitUntil: 'load',
        timeout: 60_000,
      });
      const status = response?.status() ?? 0;
      if (status !== 200) throw new Error(`HTTP ${status}`);

      // The atmosphere mounts on load + requestIdleCallback(timeout 3000).
      await page.waitForTimeout(3800);

      // Reveal every section before freezing, then settle at the top.
      await page.evaluate(async () => {
        const step = Math.round(window.innerHeight * 0.6);
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 80));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 600));
      });

      await page.addStyleTag({ content: FREEZE });
      // Finish anything framer-motion is still driving through the Web
      // Animations API — a CSS override does not touch those, which is exactly
      // what made the Phase Z accessibility failure look like a site defect.
      await page.evaluate(async () => {
        for (const animation of document.getAnimations()) {
          try {
            animation.finish();
          } catch {
            animation.cancel();
          }
        }
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      });
      await page.evaluate(() => document.fonts.ready);

      await page.screenshot({ path: join(dir, `${routeName}-hero.png`) });
      written += 1;

      if (wantsFullPage) {
        await page.screenshot({ path: join(dir, `${routeName}-full.png`), fullPage: true });
        written += 1;
      }

      console.log(`  ok   ${bpName.padEnd(13)} ${routeName}`);
    } catch (error) {
      failed += 1;
      console.error(`  FAIL ${bpName.padEnd(13)} ${routeName}  ${error.message}`);
    } finally {
      await page.close();
    }
  }
}

await browser.close();

console.log(`\n${written} images written to ${OUT}`);
if (failed > 0) {
  console.error(`${failed} capture(s) failed.`);
  process.exit(1);
}
