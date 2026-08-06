/**
 * Deterministic screenshot capture, for design review and visual regression.
 *
 *   npm start                 # production server
 *   npm run shots             # writes .shots/<viewport>-{full,hero}.png
 *
 * Reviewing a design from source is guesswork. This produces the actual
 * rendered page at each breakpoint so spacing, rhythm and hierarchy can be
 * judged on what a visitor sees.
 *
 * Determinism matters more than fidelity here — a capture that differs run to
 * run cannot be diffed. Three things are pinned:
 *
 *   1. Animations and transitions are zeroed *after* load, so reveals have
 *      already played and every element sits at its final state rather than
 *      mid-fade.
 *   2. The page is scrolled end to end first, because every section reveals on
 *      IntersectionObserver — a naive full-page shot catches them all still
 *      hidden.
 *   3. Renderer backgrounding is disabled, or headless Chromium stops
 *      compositing and captures a half-painted frame.
 *
 * Output is gitignored; these are review artifacts, not build output.
 */

import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from '@playwright/test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, process.env.SHOTS_DIR ?? '.shots');
const URL_ = process.env.AUDIT_URL ?? 'http://localhost:3000';

/**
 * Real device descriptors, not bare viewport sizes.
 *
 * A 390px-wide desktop Chromium is not a phone: it reports `pointer: fine`, so
 * `isTouchDevice()` returns false and the custom cursor mounts, parking a ring
 * and dot over the copy at `z-[9999]`. The first capture run showed exactly
 * that and it read as a rendering bug in the site — it was a defect in this
 * script. Device descriptors carry touch, hover, DPR and user agent, so the
 * capture matches what the Playwright suite and a real visitor get.
 */
const TARGETS = [
  ['desktop', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }],
  // deviceScaleFactor forced to 1. The descriptors ship DPR 2–3, and this page
  // is ~15,000 CSS px tall on a phone, so a full-page shot would rasterise
  // ~45,000 device pixels and time out. Touch, hover, isMobile and the user
  // agent — the properties that actually change what renders — are preserved.
  ['tablet', { ...devices['iPad (gen 7)'], deviceScaleFactor: 1 }],
  ['mobile', { ...devices['Pixel 7'], deviceScaleFactor: 1 }],
];

const FREEZE = `*, *::before, *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
}`;

const browser = await chromium.launch({
  args: [
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    '--disable-features=CalculateNativeWinOcclusion',
  ],
});

mkdirSync(OUT, { recursive: true });

for (const [name, target] of TARGETS) {
  const page = await browser.newPage(target);
  await page.goto(URL_, { waitUntil: 'load' });

  // The atmosphere mounts on load + requestIdleCallback(timeout 3000).
  await page.waitForTimeout(4000);

  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 700));
  });

  // Freeze last: reveals have played, so this pins the finished frame.
  await page.addStyleTag({ content: FREEZE });
  await page.waitForTimeout(500);

  await page.screenshot({ path: join(OUT, `${name}-hero.png`) });
  await page.screenshot({ path: join(OUT, `${name}-full.png`), fullPage: true, timeout: 120000 });

  const { w, h } = await page.evaluate(() => ({
    w: document.body.scrollWidth,
    h: document.body.scrollHeight,
  }));
  const touch = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);
  console.log(
    `  ${name.padEnd(8)} ${String(target.viewport.width).padStart(5)}px  touch=${String(touch).padEnd(5)}  page ${w}×${h}`,
  );

  await page.close();
}

await browser.close();
console.log(`\n  written: ${OUT.replace(ROOT, '.')}\n`);
