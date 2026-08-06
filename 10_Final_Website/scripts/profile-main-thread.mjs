/**
 * Main-thread CPU profile, attributed to source modules.
 *
 *   PROFILE_SOURCEMAPS=true npm run build      # once — emits .map files
 *   npm start                                  # production server
 *   npm run profile                            # desktop, 1x CPU
 *   npm run profile:mobile                     # 4x CPU slowdown
 *
 * WHY THIS EXISTS
 *
 * Total Blocking Time has been this site's weakest metric for the whole
 * project (~610 ms desktop, ~2,080 ms at 4x). Two prior attempts changed code
 * first and measured second; two of their three changes turned out not to
 * matter. Lighthouse says *how much* the main thread blocked but not *which
 * module* did it — its "Reduce JavaScript execution time" audit attributes to
 * chunk URLs, and a Next chunk is fifty modules wide.
 *
 * This samples the V8 CPU profiler through CDP and resolves every sample's
 * call frame back through the chunk's source map to the original file. The
 * output is a ranked list of modules by main-thread self time, which is the
 * evidence needed to decide what to change.
 *
 * Diagnostic only. Not part of `npm run verify` — it needs a source-mapped
 * build, and it measures, it does not gate.
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '.lighthouse');
const URL_ = process.env.AUDIT_URL ?? 'http://localhost:3000';

/** Lighthouse's mobile preset uses 4x. Matching it makes the numbers comparable. */
const CPU_THROTTLE = Number(process.env.PROFILE_CPU ?? 1);

/** How long to keep sampling after `load`, in ms — long enough to catch deferred work. */
const SETTLE_MS = Number(process.env.PROFILE_SETTLE ?? 5000);

/** V8's default is 1000µs, which is too coarse to separate modules. */
const SAMPLE_INTERVAL_US = Number(process.env.PROFILE_INTERVAL ?? 100);

/**
 * Boundary between "still loading" and "sitting there animating", in ms from
 * profiler start. Everything after this is cost the page pays forever, which is
 * a different problem with a different fix.
 */
const LOAD_PHASE_MS = Number(process.env.PROFILE_LOAD_PHASE ?? 3000);

/** Runs to sample, and a discarded warm-up. See the comment in `main()`. */
const RUNS = Number(process.env.PROFILE_RUNS ?? 5);
const WARMUP = process.env.PROFILE_WARMUP === 'false' ? 0 : 1;

/**
 * Named experiments — `PROFILE_EXPERIMENT=no-blend npm run profile`.
 *
 * Each injects CSS before first paint to neutralise one suspected cost, so its
 * price can be measured against the same build without editing a component.
 * These are measurements, not proposals: several change how the page looks, and
 * whether that trade is acceptable is a design decision, not a profiling one.
 */
const EXPERIMENTS = {
  none: '',
  // Blend modes stop an element compositing independently — the GPU must read
  // back and re-blend the backdrop wherever they apply.
  'no-blend': `[style*="mix-blend"], .ambient-sheen { mix-blend-mode: normal !important; }`,
  // backdrop-filter re-rasterises everything behind the element.
  'no-backdrop-blur': `* { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }`,
  // The always-running aurora keyframes.
  'no-ambient-anim': `.ambient-spin-a, .ambient-spin-b, .ambient-breathe, .ambient-sheen { animation: none !important; }`,
  // The full-viewport drifting sheen specifically.
  'no-sheen': `.ambient-sheen { display: none !important; }`,
};

const EXPERIMENT = process.env.PROFILE_EXPERIMENT ?? 'none';
if (!(EXPERIMENT in EXPERIMENTS)) {
  console.error(`Unknown PROFILE_EXPERIMENT "${EXPERIMENT}". Options: ${Object.keys(EXPERIMENTS).join(', ')}`);
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Source maps
//
// Only the `mappings` field is needed, and only its first three fields per
// segment (generated column, source index, source line). Decoding it is ~40
// lines of Base64-VLQ, which is cheaper than taking on a dependency for a
// diagnostic script — the same reasoning that keeps `chrome-launcher` out of
// audit-lighthouse.mjs.
// ─────────────────────────────────────────────────────────────────────────────

const B64 =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const B64_INDEX = new Map([...B64].map((c, i) => [c, i]));

/** Decode one Base64-VLQ run into signed integers. */
function decodeVlq(str) {
  const out = [];
  let value = 0;
  let shift = 0;
  for (const ch of str) {
    const digit = B64_INDEX.get(ch);
    if (digit === undefined) return out;
    value += (digit & 31) << shift;
    if (digit & 32) {
      shift += 5;
      continue;
    }
    // Bit 0 is the sign; the rest is magnitude.
    out.push(value & 1 ? -(value >> 1) : value >> 1);
    value = 0;
    shift = 0;
  }
  return out;
}

/**
 * Build a lookup of generated position -> source file.
 *
 * Returns `lines`, indexed by generated line, each a column-sorted array of
 * `[generatedColumn, sourceIndex]`. Names and original line/column are decoded
 * to keep the running deltas correct but discarded; module-level attribution
 * is the question being asked.
 */
function parseSourceMap(raw) {
  const map = JSON.parse(raw);
  const lines = [];
  let srcIdx = 0;
  let srcLine = 0;
  let srcCol = 0;
  let nameIdx = 0;

  const generatedLines = map.mappings.split(';');
  for (let i = 0; i < generatedLines.length; i++) {
    let genCol = 0;
    const segments = generatedLines[i].split(',').filter(Boolean);
    const entries = [];
    for (const seg of segments) {
      const f = decodeVlq(seg);
      if (f.length === 0) continue;
      genCol += f[0];
      if (f.length >= 4) {
        srcIdx += f[1];
        srcLine += f[2];
        srcCol += f[3];
        if (f.length >= 5) nameIdx += f[4];
        entries.push([genCol, srcIdx]);
      }
    }
    entries.sort((a, b) => a[0] - b[0]);
    lines[i] = entries;
  }
  return { lines, sources: map.sources ?? [] };
}

/** Greatest mapping at or before `col` on `line`. */
function lookup(parsed, line, col) {
  const entries = parsed.lines[line];
  if (!entries || entries.length === 0) return null;
  let lo = 0;
  let hi = entries.length - 1;
  let best = null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (entries[mid][0] <= col) {
      best = entries[mid];
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best ? (parsed.sources[best[1]] ?? null) : null;
}

/**
 * Collapse a source path to the unit a decision would be made about: an npm
 * package, or a file under src/. `framer-motion/dist/es/render/dom/motion.mjs`
 * and its ninety siblings are one line item, because the only lever available
 * is "keep or drop framer-motion".
 */
function bucket(source) {
  if (!source) return null;
  const clean = source.replace(/^(webpack|turbopack):\/\/[^/]*\//, '').replace(/^\.\//, '');
  const nm = clean.lastIndexOf('node_modules/');
  if (nm !== -1) {
    const rest = clean.slice(nm + 'node_modules/'.length);
    const parts = rest.split('/');
    return parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
  }
  const srcAt = clean.indexOf('src/');
  if (srcAt !== -1) return clean.slice(srcAt);
  return clean;
}

// ─────────────────────────────────────────────────────────────────────────────

const mapCache = new Map();

/**
 * Resolve a chunk URL's source map off disk.
 *
 * The map filename cannot be derived from the chunk's: Turbopack content-hashes
 * each independently, so `060wcmibf9..8.js` ships alongside `17bf.tm-de06b.js.map`.
 * The only reliable link is the chunk's trailing `sourceMappingURL` comment.
 */
function sourceMapFor(url) {
  if (mapCache.has(url)) return mapCache.get(url);
  let parsed = null;
  try {
    const path = new global.URL(url).pathname; // /_next/static/chunks/foo.js
    if (path.startsWith('/_next/')) {
      const chunkFile = join(ROOT, '.next', path.slice('/_next/'.length));
      if (existsSync(chunkFile)) {
        const js = readFileSync(chunkFile, 'utf8');
        const m = /[#@]\s*sourceMappingURL=(\S+)\s*$/.exec(js.slice(-2048));
        if (m) {
          const mapFile = join(dirname(chunkFile), decodeURIComponent(m[1]));
          if (existsSync(mapFile)) parsed = parseSourceMap(readFileSync(mapFile, 'utf8'));
        }
      }
    }
  } catch {
    parsed = null;
  }
  mapCache.set(url, parsed);
  return parsed;
}

const pad = (s, n) => String(s).padEnd(n);
const ms = (n) => `${n.toFixed(1)} ms`.padStart(10);

async function runOnce(label) {
  const browser = await chromium.launch();
  // `PROFILE_REDUCED_MOTION=true` is a controlled experiment, not an accessibility
  // check. Every decorative layer (ParticleField, AmbientBackground, CustomCursor,
  // Parallax, SmoothScroll, DeferredAtmosphere) already gates on this query, so
  // toggling it turns the whole animation system off *in the same build* — which
  // isolates what the decoration costs without changing a line of code.
  const page = await browser.newPage({
    viewport: { width: 1350, height: 940 },
    reducedMotion: process.env.PROFILE_REDUCED_MOTION === 'true' ? 'reduce' : 'no-preference',
  });
  const cdp = await page.context().newCDPSession(page);

  if (EXPERIMENTS[EXPERIMENT]) {
    await page.addInitScript((css) => {
      // Runs at document-create, before any page script or first paint.
      const s = document.createElement('style');
      s.textContent = css;
      document.documentElement.appendChild(s);
    }, EXPERIMENTS[EXPERIMENT]);
  }

  // Long tasks have to be observed in-page; CDP has no equivalent event.
  await page.addInitScript(() => {
    window.__longTasks = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        window.__longTasks.push({ start: Math.round(e.startTime), dur: Math.round(e.duration) });
      }
    }).observe({ type: 'longtask', buffered: true });
  });

  if (CPU_THROTTLE > 1) {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_THROTTLE });
  }

  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: SAMPLE_INTERVAL_US });
  await cdp.send('Profiler.start');

  await page.goto(URL_, { waitUntil: 'load' });
  await page.waitForTimeout(SETTLE_MS);

  const { profile } = await cdp.send('Profiler.stop');
  const longTasks = await page.evaluate(() => window.__longTasks ?? []);
  await browser.close();

  // ── self time per node, split by phase ────────────────────────────────────
  //
  // timeDeltas[i] is the interval preceding samples[i], in microseconds. Summing
  // per sampled node gives self time; anything else double-counts the stack.
  //
  // The split matters more than the total. Lighthouse's TBT only counts blocking
  // between FCP and interactive, so a profile that runs for seconds after load
  // mixes two different costs: one-off hydration, and whatever the page burns
  // every frame forever. They have opposite fixes — the first is a code-splitting
  // problem, the second is an animation-budget problem — so they are reported
  // separately rather than as one misleading number.
  const selfByNode = new Map(); // id -> [loadPhaseUs, steadyStateUs]
  const { samples = [], timeDeltas = [], nodes = [] } = profile;
  let elapsedUs = 0;
  for (let i = 0; i < samples.length; i++) {
    const id = samples[i];
    const dt = timeDeltas[i] ?? 0;
    elapsedUs += dt;
    const phase = elapsedUs / 1000 <= LOAD_PHASE_MS ? 0 : 1;
    const cur = selfByNode.get(id) ?? [0, 0];
    cur[phase] += dt;
    selfByNode.set(id, cur);
  }

  const byModule = new Map();
  const byModuleSteady = new Map();
  const byFunction = new Map();
  let total = 0;
  let idleOrGc = 0;

  for (const node of nodes) {
    const [loadUs, steadyUs] = selfByNode.get(node.id) ?? [0, 0];
    const self = loadUs / 1000; // → ms, load phase
    const selfSteady = steadyUs / 1000;
    if (self <= 0 && selfSteady <= 0) continue;
    total += self;

    const { functionName, url, lineNumber, columnNumber } = node.callFrame;

    // (program)/(idle)/(garbage collector) are V8 pseudo-frames, not modules.
    // `(program)` is everything the main thread does outside JS — style, layout,
    // paint, compile — so it is reported but never blamed on a module.
    if (!url || url.startsWith('(') || functionName.startsWith('(')) {
      idleOrGc += self;
      if (functionName !== '(idle)') {
        const k = functionName || '(anonymous native)';
        byModule.set(k, (byModule.get(k) ?? 0) + self);
        byModuleSteady.set(k, (byModuleSteady.get(k) ?? 0) + selfSteady);
      }
      continue;
    }

    const map = sourceMapFor(url);
    const source = map ? lookup(map, lineNumber, columnNumber) : null;
    const key = bucket(source) ?? url.replace(/^https?:\/\/[^/]+/, '');
    byModule.set(key, (byModule.get(key) ?? 0) + self);
    byModuleSteady.set(key, (byModuleSteady.get(key) ?? 0) + selfSteady);

    const fnKey = `${functionName || '(anonymous)'} — ${key}`;
    byFunction.set(fnKey, (byFunction.get(fnKey) ?? 0) + self);
  }


  // TBT is the portion of each long task beyond 50 ms, which is the definition
  // Lighthouse uses. Computing it here confirms the profile caught the same
  // blocking the audit reports rather than a different page load.
  const blocking = (list) => list.reduce((t, x) => t + Math.max(0, x.dur - 50), 0);
  const loadTasks = longTasks.filter((x) => x.start <= LOAD_PHASE_MS);
  const steadyTasks = longTasks.filter((x) => x.start > LOAD_PHASE_MS);

  const result = {
    scriptMs: total - idleOrGc,
    loadBlockingMs: blocking(loadTasks),
    steadyBlockingMs: blocking(steadyTasks),
    loadTaskCount: loadTasks.length,
    steadyTaskCount: steadyTasks.length,
    byModule,
    byModuleSteady,
    byFunction,
    longTasks,
  };
  process.stdout.write(
    `  ${label}  load ${String(result.loadBlockingMs).padStart(5)} ms` +
      `   steady ${String(result.steadyBlockingMs).padStart(5)} ms\n`,
  );
  return result;
}

/** Median, not mean: one contended run skews an average badly. */
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

/** Mean of a metric across runs, per map key. */
function meanByKey(maps) {
  const out = new Map();
  for (const m of maps) for (const [k, v] of m) out.set(k, (out.get(k) ?? 0) + v);
  for (const [k, v] of out) out.set(k, v / maps.length);
  return out;
}

async function main() {
  const reduced = process.env.PROFILE_REDUCED_MOTION === 'true';

  console.log(`\nMain-thread CPU profile — ${URL_}`);
  console.log(
    `  CPU throttle ${CPU_THROTTLE}x · sample ${SAMPLE_INTERVAL_US}µs · settle ${SETTLE_MS}ms` +
      `${reduced ? ' · REDUCED MOTION' : ''}` +
      `${EXPERIMENT !== 'none' ? ` · EXPERIMENT ${EXPERIMENT}` : ''}\n`,
  );

  // Same discipline as audit-lighthouse.mjs, and for the same reason: a single
  // run of this page produced load-phase blocking of 609 ms and 1,071 ms on an
  // unchanged build. Reporting either one alone would be reporting the machine's
  // mood. One warm-up is discarded because the first load after a server start
  // measures Next's route cache warming, not the frontend.
  for (let i = 0; i < WARMUP; i++) await runOnce('warm-up (discarded)');
  const runs = [];
  for (let i = 0; i < RUNS; i++) runs.push(await runOnce(`run ${i + 1}/${RUNS}     `));

  const mapped = [...mapCache.values()].filter(Boolean).length;
  const loadBlocking = median(runs.map((r) => r.loadBlockingMs));
  const steadyBlocking = median(runs.map((r) => r.steadyBlockingMs));
  const scriptMs = median(runs.map((r) => r.scriptMs));

  const byModule = meanByKey(runs.map((r) => r.byModule));
  const byModuleSteady = meanByKey(runs.map((r) => r.byModuleSteady));
  const byFunction = meanByKey(runs.map((r) => r.byFunction));
  const rank = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]);

  console.log(`\n  ${mapped}/${mapCache.size} chunks source-mapped`);
  if (mapped === 0) {
    console.log('  ⚠  No source maps. Rebuild with:  npm run build:profile\n');
  }

  const spread = (xs) => `${Math.min(...xs)}–${Math.max(...xs)}`;
  console.log(`\n  LOAD PHASE (0–${LOAD_PHASE_MS} ms)`);
  console.log(`    script execution         ${scriptMs.toFixed(0)} ms (median)`);
  console.log(
    `    blocking time            ${loadBlocking} ms (median of ${RUNS}, spread ` +
      `${spread(runs.map((r) => r.loadBlockingMs))})   ← comparable to Lighthouse TBT`,
  );

  console.log(`\n  STEADY STATE (${LOAD_PHASE_MS}+ ms, page idle on screen)`);
  console.log(
    `    blocking time            ${steadyBlocking} ms (median of ${RUNS}, spread ` +
      `${spread(runs.map((r) => r.steadyBlockingMs))})   ← cost paid forever`,
  );

  console.log(`\n  ${pad('module', 46)}${'load'.padStart(10)}${'steady'.padStart(11)}   (mean self time)`);
  console.log(`  ${'─'.repeat(78)}`);
  for (const [name, t] of rank(byModule).slice(0, 20)) {
    const s = byModuleSteady.get(name) ?? 0;
    if (t < 0.5 && s < 0.5) continue;
    console.log(`  ${pad(name.slice(0, 45), 46)}${ms(t)}${ms(s).slice(1)}`);
  }

  console.log(`\n  ${pad('function (load phase)', 60)}${'self'.padStart(10)}`);
  console.log(`  ${'─'.repeat(72)}`);
  for (const [name, t] of rank(byFunction).slice(0, 15)) {
    if (t < 0.5) continue;
    console.log(`  ${pad(name.slice(0, 59), 60)}${ms(t)}`);
  }

  mkdirSync(OUT, { recursive: true });
  const jsonPath = join(OUT, `profile-${CPU_THROTTLE}x${reduced ? "-reduced" : ""}${EXPERIMENT !== "none" ? "-" + EXPERIMENT : ""}.json`);
  writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        url: URL_,
        cpuThrottle: CPU_THROTTLE,
        reducedMotion: reduced,
        runs: RUNS,
        loadPhaseMs: LOAD_PHASE_MS,
        scriptMs,
        loadBlockingMs: loadBlocking,
        steadyBlockingMs: steadyBlocking,
        perRun: runs.map((r) => ({
          loadBlockingMs: r.loadBlockingMs,
          steadyBlockingMs: r.steadyBlockingMs,
          scriptMs: r.scriptMs,
        })),
        modules: rank(byModule).map(([name, selfMs]) => ({
          name,
          selfMs,
          steadyMs: byModuleSteady.get(name) ?? 0,
        })),
        functions: rank(byFunction).slice(0, 60).map(([name, selfMs]) => ({ name, selfMs })),
      },
      null,
      2,
    ),
    'utf8',
  );
  console.log(`\n  written: .lighthouse/${basename(jsonPath)}\n`);
}

await main();
