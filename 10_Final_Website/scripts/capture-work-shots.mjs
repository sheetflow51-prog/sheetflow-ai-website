/**
 * Capture the case-study screenshots served on `/work` and `/work/[slug]`.
 *
 *   node scripts/capture-work-shots.mjs
 *
 * Writes `public/work/<slug>.jpg` — one above-the-fold frame per live client
 * build, at a fixed 1280×800 so every card in the grid shares an aspect ratio
 * and the layout cannot shift when one image is taller than another.
 *
 * ## Why these are committed rather than generated at build time
 *
 * The sources are third-party deployments. Fetching them during `next build`
 * would make the build depend on someone else's uptime and would silently
 * change published imagery whenever those sites change. Committing the frames
 * pins what we publish to what was reviewed.
 *
 * ## Why JPEG and not WebP
 *
 * Playwright encodes PNG or JPEG only. Rather than add an image-processing
 * dependency to convert, the JPEG is served through `next/image`, which already
 * emits AVIF and WebP with a 30-day cache under the existing config. The stored
 * format is an input, not what a visitor downloads.
 *
 * Re-run after a client site is redesigned, and review the diff before
 * committing — these are published assets, not build artifacts.
 */

import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'work');

/**
 * Must stay in sync with `shot.src` in `src/content/work.ts` — every project
 * whose evidence is `live` or `demo`, in the order they appear there.
 *
 * The demonstration builds are captured by the same script and the same rules
 * as the client work. They are ours and they are reachable; the distinction
 * between the two is a publishing question, not a capture one.
 */
const TARGETS = [
  ['saraswati-dental-clinic', 'https://saraswati-dental-clinic.vercel.app'],
  ['sparc-physiotherapy', 'https://sparc-physiotherapy.vercel.app'],
  ['r3s-realty', 'https://r3s-realty-agra.vercel.app'],
  ['ak-dental-diagnostic-centre', 'https://ak-dental-demo.netlify.app'],
  ['align-dental-system', 'https://sheetflow51-prog.github.io/dental-demo/'],
  // Companion surfaces — a second page of an engagement already listed above.
  [
    'saraswati-dental-clinic-dashboard',
    'https://saraswati-dental-clinic.vercel.app/dashboard.html',
  ],
];

const VIEWPORT = { width: 1280, height: 800 };

/**
 * Freeze motion before capture. Two of the three builds animate on scroll
 * (GSAP ScrollTrigger, Framer Motion); an unfrozen capture catches elements
 * mid-transition and differs on every run.
 */
const FREEZE = `*, *::before, *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
  scroll-behavior: auto !important;
}`;

async function main() {
  mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({
    args: ['--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'],
  });

  let failed = 0;

  for (const [slug, url] of TARGETS) {
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 1,
      // These are third-party sites; a reduced-motion preference gives the most
      // stable first frame and respects the same signal we honour on our own.
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
      const status = response?.status() ?? 0;
      if (status !== 200) {
        throw new Error(`expected HTTP 200, got ${status}`);
      }

      // One of the three is a client-rendered SPA: `networkidle` fires while
      // the root div is still empty. Wait for real content rather than a timer.
      await page.waitForFunction(
        () => (document.body.innerText ?? '').trim().length > 200,
        undefined,
        { timeout: 30_000 },
      );

      await page.addStyleTag({ content: FREEZE });
      // Web fonts land after first paint on every one of these; capturing
      // before they do produces a fallback-font frame.
      await page.evaluate(() => document.fonts.ready);

      const file = join(OUT, `${slug}.jpg`);
      await page.screenshot({ path: file, type: 'jpeg', quality: 82 });
      console.log(`  ok   ${slug}  ${status}  ${url}`);
    } catch (error) {
      failed += 1;
      console.error(`  FAIL ${slug}  ${url}\n       ${error.message}`);
    } finally {
      await context.close();
    }
  }

  await browser.close();

  if (failed > 0) {
    console.error(`\n${failed} capture(s) failed. Published imagery was not updated for those.`);
    process.exit(1);
  }
  console.log(`\nWrote ${TARGETS.length} frames to public/work/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
