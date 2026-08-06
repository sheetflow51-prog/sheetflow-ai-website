/**
 * Bundle budget.
 *
 *   npm run audit:bundle          (reads the existing .next build)
 *
 * `npm run analyze` opens the interactive treemap for a human. This is the
 * machine-readable half: it measures what the browser actually downloads and
 * fails when a budget is exceeded, so a regression is caught at commit time
 * rather than noticed in a Lighthouse run three phases later.
 *
 * Budgets are expressed in GZIPPED bytes, because that is what ships. Raw size
 * is reported for context only — it is roughly 3x the transferred figure and
 * comparing against it flatters every measurement.
 */

import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STATIC = join(ROOT, '.next', 'static');

/**
 * Set from the measured baseline, with headroom. A budget nobody has ever met
 * is a broken gate, and a broken gate gets ignored.
 */
const BUDGETS = {
  jsGzipKB: Number(process.env.BUDGET_JS_KB ?? 360),
  cssGzipKB: Number(process.env.BUDGET_CSS_KB ?? 40),
  largestChunkGzipKB: Number(process.env.BUDGET_CHUNK_KB ?? 170),
};

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

if (!existsSync(STATIC)) {
  console.error('No .next/static found. Run `npm run build` first.');
  process.exit(1);
}

const files = walk(STATIC).filter((f) => ['.js', '.css'].includes(extname(f)));
if (!files.length) {
  console.error('No JS or CSS emitted — the build looks empty.');
  process.exit(1);
}

const measured = files.map((f) => {
  const buf = readFileSync(f);
  return {
    path: f.replace(ROOT, '').replace(/\\/g, '/'),
    ext: extname(f),
    raw: statSync(f).size,
    gzip: gzipSync(buf, { level: 9 }).length,
  };
});

const kb = (n) => n / 1024;
const sum = (list, k) => list.reduce((t, x) => t + x[k], 0);

const js = measured.filter((m) => m.ext === '.js');
const css = measured.filter((m) => m.ext === '.css');
const largest = [...measured].sort((a, b) => b.gzip - a.gzip).slice(0, 8);

const totals = {
  jsGzipKB: kb(sum(js, 'gzip')),
  cssGzipKB: kb(sum(css, 'gzip')),
  largestChunkGzipKB: kb(largest[0]?.gzip ?? 0),
};

console.log('\nBundle — .next/static\n');
console.log(`  files            ${js.length} js, ${css.length} css`);
console.log(`  js    raw ${kb(sum(js, 'raw')).toFixed(0).padStart(6)} kB   gzip ${totals.jsGzipKB.toFixed(1).padStart(7)} kB   budget ${BUDGETS.jsGzipKB} kB`);
console.log(`  css   raw ${kb(sum(css, 'raw')).toFixed(0).padStart(6)} kB   gzip ${totals.cssGzipKB.toFixed(1).padStart(7)} kB   budget ${BUDGETS.cssGzipKB} kB`);

console.log('\n  largest chunks (gzip)');
console.log('  ─────────────────────────────────────────────');
for (const f of largest) {
  console.log(`  ${kb(f.gzip).toFixed(1).padStart(7)} kB  ${f.path.replace('/.next/static/', '')}`);
}

const failures = Object.entries(BUDGETS)
  .filter(([k, limit]) => totals[k] > limit)
  .map(([k, limit]) => `${k} ${totals[k].toFixed(1)} kB > ${limit} kB`);

if (failures.length) {
  console.error(`\nBundle budget exceeded:\n  ${failures.join('\n  ')}\n`);
  process.exitCode = 1;
} else {
  console.log('\n  all budgets met\n');
}
