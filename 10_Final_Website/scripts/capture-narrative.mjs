/**
 * Homepage narrative capture — the RC5 before/after harness.
 *
 *   npm start                                          # production server on :3000
 *   NARRATIVE_DIR=release-preview-rc5/before node scripts/capture-narrative.mjs
 *
 * ## Why a third capture script
 *
 * `capture-screens.mjs` shoots one route at three widths for design review, and
 * `capture-release-preview.mjs` sweeps every route at five widths to answer "is
 * any page wrong anywhere". Neither answers the question RC5 asks, which is
 * about **one page read top to bottom**: does the homepage hold together as a
 * single narrative, and does each chapter hand off to the next?
 *
 * That question needs *sequential viewport frames down one route* — a reader's
 * path — rather than one hero shot and one enormous full-page strip. So this
 * walks the page in viewport-height steps and writes a numbered frame at each,
 * plus the full strip for the overview.
 *
 * ## Determinism
 *
 * The three pins are inherited from `capture-release-preview.mjs` and each was
 * learned from a capture that lied:
 *
 *   1. Scroll the whole page before capturing, so every reveal has fired. A
 *      naive shot catches them all hidden.
 *   2. Freeze animations *after* that scroll, and `finish()` every WAAPI
 *      animation — a CSS `animation-duration: 0s` override does not touch a
 *      JS-scheduled animation, which is what made a Phase Z a11y failure look
 *      like a site defect.
 *   3. Disable renderer backgrounding, or headless Chromium stops compositing
 *      and writes a half-painted frame.
 *
 * There is a fourth pin specific to this script. **Scroll-driven animations are
 * frozen by the same override**, and this page's narrative rail, section reveals
 * and parallax are all `animation-timeline: view()`. Freezing them at the top of
 * the page would capture every below-fold element at its *entry* state — which
 * is exactly the invisible-beam class of defect the VOS notes warn about. So the
 * freeze is applied **at each scroll position**, after settling there, and
 * removed before moving on.
 */

import { mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from '@playwright/test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, process.env.NARRATIVE_DIR ?? 'release-preview-rc5/after');
const BASE = process.env.AUDIT_URL ?? 'http://localhost:3000';
const ROUTE = process.env.NARRATIVE_ROUTE ?? '/';

/** Frames per pass. Enough to cover a ~12,000px page at 900px steps. */
const MAX_FRAMES = Number(process.env.NARRATIVE_FRAMES ?? 14);

const TARGETS = [
  ['desktop', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }],
  ['mobile', { ...devices['Pixel 7'], deviceScaleFactor: 1 }],
];

const FREEZE_ID = 'narrative-freeze';

/**
 * Applied and removed per frame rather than once. See the module note: this
 * page's motion is scroll-driven, so a freeze applied at scrollY 0 pins every
 * below-fold element at its entry state.
 */
const FREEZE = `*, *::before, *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
}
.fixed.z-\\[9999\\] { opacity: 0 !important; }`;

/**
 * Refuse to capture a server that is not running this build.
 *
 * This is not defensive tidiness — it caught a real, silent, expensive failure
 * on its first run. `npm start` was launched while a previous `next start` was
 * still holding port 3000, so the new server exited and the **old process kept
 * answering** — out of a `.next` directory that had since been overwritten by a
 * fresh build. Every chunk URL in its cached HTML 404ed, so the page rendered
 * with no stylesheet at all: 23,000px tall, `sr-only` text visible on screen,
 * and every layout gone.
 *
 * That is indistinguishable, in a screenshot, from having catastrophically
 * broken the CSS. Comparing `BUILD_ID` against the served HTML turns twenty
 * minutes of debugging a phantom into one line of output.
 */
async function assertFreshServer() {
  const buildId = readFileSync(join(ROOT, '.next', 'BUILD_ID'), 'utf8').trim();
  const response = await fetch(`${BASE}${ROUTE}`);
  const html = await response.text();

  if (!html.includes(buildId)) {
    throw new Error(
      `The server at ${BASE} is not serving this build.\n` +
        `  .next/BUILD_ID is ${buildId}, and the served HTML does not contain it.\n` +
        `  A stale 'next start' is almost certainly still holding the port. Kill it and retry.`,
    );
  }
  console.log(`  build ${buildId} confirmed on ${BASE}`);
}

await assertFreshServer();

const browser = await chromium.launch({
  args: [
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    '--disable-features=CalculateNativeWinOcclusion',
  ],
});

let written = 0;
let failed = 0;

for (const [name, target] of TARGETS) {
  const dir = join(OUT, name);
  mkdirSync(dir, { recursive: true });

  const page = await browser.newPage(target);
  try {
    const response = await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'load', timeout: 60_000 });
    const status = response?.status() ?? 0;
    if (status !== 200) throw new Error(`HTTP ${status}`);

    // The deferred atmosphere mounts on load + requestIdleCallback(timeout 3000).
    await page.waitForTimeout(3800);
    await page.evaluate(() => document.fonts.ready);

    // Warm every reveal once, top to bottom, then return to the start.
    const height = await page.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.6);
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 70));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 500));
      return document.body.scrollHeight;
    });

    const viewportHeight = target.viewport?.height ?? 900;
    const frames = Math.min(MAX_FRAMES, Math.ceil(height / viewportHeight));

    for (let i = 0; i < frames; i += 1) {
      await page.evaluate(
        async ([y]) => {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 420));
        },
        [i * viewportHeight],
      );

      const handle = await page.addStyleTag({ content: FREEZE });
      await page.evaluate(async () => {
        for (const animation of document.getAnimations()) {
          // A scroll-driven animation has no finite time to finish to; calling
          // `finish()` on one throws. Those are already at the right progress
          // for this scroll position, so they are simply left alone.
          try {
            if (animation.timeline instanceof AnimationTimeline && 'currentTime' in animation) {
              animation.finish();
            }
          } catch {
            /* scroll-driven, or already finished. Correct as it stands. */
          }
        }
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      });

      const label = String(i + 1).padStart(2, '0');
      await page.screenshot({ path: join(dir, `frame-${label}.png`) });
      written += 1;

      await handle.evaluate((el) => el.remove());
    }

    // The whole page as one strip, for the overview.
    await page.evaluate(async () => {
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 400));
    });
    await page.addStyleTag({ content: FREEZE, ...{ id: FREEZE_ID } });
    await page.screenshot({ path: join(dir, 'full.png'), fullPage: true });
    written += 1;

    console.log(`  ok   ${name.padEnd(8)} ${frames} frames + full  (${height}px)`);
  } catch (error) {
    failed += 1;
    console.error(`  FAIL ${name.padEnd(8)} ${error.message}`);
  } finally {
    await page.close();
  }
}

await browser.close();

console.log(`\n${written} images written to ${OUT}`);
if (failed > 0) {
  console.error(`${failed} capture(s) failed.`);
  process.exit(1);
}
