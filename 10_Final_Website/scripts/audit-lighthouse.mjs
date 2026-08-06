/**
 * Lighthouse audit against the production build.
 *
 *   npm run audit:lh                      (starts nothing; expects a server)
 *   npm run audit                         (build + start + audit + stop)
 *
 * Reuses Playwright's Chromium rather than pulling in chrome-launcher and a
 * second browser download. Playwright is already a dependency for the e2e
 * suite, and the binary it manages is the one those tests run against — so the
 * audit and the tests measure the same engine.
 *
 * Writes JSON + HTML to .lighthouse/ and prints a scored summary. Exits
 * non-zero when a category falls below its threshold, so it can gate a commit.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import lighthouse from 'lighthouse';
import { chromium } from '@playwright/test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '.lighthouse');
const URL = process.env.AUDIT_URL ?? 'http://localhost:3000';

/**
 * Thresholds are a ratchet, not an aspiration: they start at the measured
 * baseline and only ever move up. A number here that has never been met is
 * a broken gate, and a broken gate gets ignored.
 */
const THRESHOLDS = {
  performance: Number(process.env.LH_MIN_PERF ?? 0.5),
  accessibility: Number(process.env.LH_MIN_A11Y ?? 0.9),
  'best-practices': Number(process.env.LH_MIN_BP ?? 0.9),
  seo: Number(process.env.LH_MIN_SEO ?? 0.9),
};

const PORT = 9222;

const pct = (n) => (n === null || n === undefined ? '  n/a' : `${Math.round(n * 100)}`.padStart(5));
const ms = (n) => (n === null || n === undefined ? 'n/a' : `${(n / 1000).toFixed(2)}s`);

async function main() {
  mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({
    args: [`--remote-debugging-port=${PORT}`],
  });

  try {
    const result = await lighthouse(
      URL,
      {
        port: PORT,
        output: ['json', 'html'],
        logLevel: 'error',
        // Desktop: the hero carries video and 3D, and a throttled mobile run
        // alone would hide which of the two dominates.
        formFactor: 'desktop',
        screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
        throttling: { rttMs: 40, throughputKbps: 10 * 1024, cpuSlowdownMultiplier: 1 },
      },
      undefined,
    );

    if (!result) throw new Error('Lighthouse returned no result');

    const { lhr, report } = result;
    writeFileSync(join(OUT, 'report.json'), report[0], 'utf8');
    writeFileSync(join(OUT, 'report.html'), report[1], 'utf8');

    const a = lhr.audits;
    console.log(`\nLighthouse — ${URL}  (desktop)\n`);
    console.log('  category            score   min');
    console.log('  ─────────────────────────────────');

    let failed = [];
    for (const [key, min] of Object.entries(THRESHOLDS)) {
      const score = lhr.categories[key]?.score;
      const ok = score !== null && score >= min;
      if (!ok) failed.push(`${key} ${Math.round((score ?? 0) * 100)} < ${Math.round(min * 100)}`);
      console.log(
        `  ${key.padEnd(18)} ${pct(score)}   ${String(Math.round(min * 100)).padStart(3)}  ${ok ? '' : '  FAIL'}`,
      );
    }

    console.log('\n  metric                value');
    console.log('  ─────────────────────────────────');
    for (const [label, id] of [
      ['First Contentful Paint', 'first-contentful-paint'],
      ['Largest Contentful Paint', 'largest-contentful-paint'],
      ['Total Blocking Time', 'total-blocking-time'],
      ['Cumulative Layout Shift', 'cumulative-layout-shift'],
      ['Speed Index', 'speed-index'],
    ]) {
      const v = a[id];
      console.log(`  ${label.padEnd(24)} ${v?.displayValue ?? 'n/a'}`);
    }

    // The opportunities worth a human reading, largest first.
    const opps = Object.values(a)
      .filter((x) => x.details?.type === 'opportunity' && (x.numericValue ?? 0) > 100)
      .sort((x, y) => (y.numericValue ?? 0) - (x.numericValue ?? 0))
      .slice(0, 6);

    if (opps.length) {
      console.log('\n  top opportunities');
      console.log('  ─────────────────────────────────');
      for (const o of opps) console.log(`  ${ms(o.numericValue).padStart(7)}  ${o.title}`);
    }

    console.log(`\n  report: .lighthouse/report.html\n`);

    if (failed.length) {
      console.error(`Lighthouse gate failed: ${failed.join(', ')}\n`);
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
  }
}

await main();
