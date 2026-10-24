/**
 * Paint / layout / style attribution — the half of the main thread a CPU
 * profiler cannot see.
 *
 *   npm start                 # production server
 *   npm run trace             # baseline
 *   npm run trace:all         # every experiment arm, one table
 *
 * WHY THIS EXISTS
 *
 * `npm run profile` established that `(program)` — everything the main thread
 * does outside JavaScript — is ~65% of its time, and that the decorative motion
 * system accounts for ~63% of TBT and 100% of steady-state blocking. It could
 * not say *what* inside `(program)`: V8's sampler reports one opaque bucket for
 * style, layout, paint and compositing alike.
 *
 * Four CSS experiments then failed to separate above the noise floor, so the
 * leading hypothesis — that `mix-blend-mode` on the ambient sheen and cursor
 * glow forces backdrop read-back every frame — stayed unproven (D17).
 *
 * This answers it with CDP's `Performance.getMetrics`, which exposes **cumulative
 * counters** rather than samples:
 *
 *   RecalcStyleDuration   style recalculation
 *   LayoutDuration        layout / reflow
 *   ScriptDuration        JavaScript
 *   TaskDuration          all main-thread task time
 *
 * `TaskDuration - (Script + Layout + RecalcStyle)` is the paint/composite
 * remainder. Counters do not sample, so they do not inherit the sampler's
 * variance — which is exactly why the earlier experiment arms were unreadable.
 *
 * Diagnostic only. Not part of `npm run verify`.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '.lighthouse');
const URL_ = process.env.AUDIT_URL ?? 'http://localhost:3000';

const CPU_THROTTLE = Number(process.env.TRACE_CPU ?? 1);
const LOAD_PHASE_MS = Number(process.env.TRACE_LOAD_PHASE ?? 3000);
/** Steady-state window, sampled with the page idle after the load phase. */
const STEADY_MS = Number(process.env.TRACE_STEADY ?? 4000);
const RUNS = Number(process.env.TRACE_RUNS ?? 5);
const WARMUP = process.env.TRACE_WARMUP === 'false' ? 0 : 1;

/**
 * Experiment arms. Each neutralises one suspected cost before first paint, so
 * its price is measured against the same build with no component edited.
 *
 * These are measurements, not proposals — several change how the page looks,
 * and whether that trade is worth making is a design decision (A2).
 */
const EXPERIMENTS = {
  none: '',
  'no-blend': `[style*="mix-blend"], .ambient-sheen { mix-blend-mode: normal !important; }`,
  'no-sheen': `.ambient-sheen { display: none !important; }`,
  'no-ambient-anim': `.ambient-spin-a, .ambient-spin-b, .ambient-breathe, .ambient-sheen { animation: none !important; }`,
  'no-ambient': `.ambient-spin-a, .ambient-spin-b, .ambient-breathe, .ambient-sheen { display: none !important; }`,
  'no-backdrop-blur': `* { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }`,
  'no-particles': `canvas[aria-hidden="true"] { display: none !important; }`,

  // ── Decomposition of the ambient keyframes ────────────────────────────────
  // `no-ambient-anim` removed 72% of steady-state work, so the cost is in these
  // four animations. Each is isolated below to find which.
  'no-breathe': `.ambient-breathe { animation: none !important; }`,
  'no-spin': `.ambient-spin-a, .ambient-spin-b { animation: none !important; }`,
  'no-sheen-anim': `.ambient-sheen { animation: none !important; }`,

  // ── The candidate fix ─────────────────────────────────────────────────────
  // `.ambient-breathe` animates transform: scale() and carries no layer
  // promotion, while its three children each declare `will-change: transform`
  // and so are promoted. Scaling an un-promoted ancestor of composited layers
  // forces those layers to re-rasterise every frame — and each child is a
  // 150%-of-viewport radial gradient, so that is ~3 × 2.25 viewport-areas of
  // gradient re-rastered per frame.
  //
  // Promoting the breathing wrapper should move the scale onto the compositor.
  // This changes no pixel of the intended design — only how it is composited.
  'breathe-will-change': `.ambient-breathe { will-change: transform; }`,

  /**
   * The candidate that should actually work.
   *
   * `breathe-will-change` failed because the wrapper was already composited —
   * a bare `transform` keyframe auto-promotes in Chrome. The cost is not the
   * wrapper failing to promote, it is that a promoted *ancestor* changing scale
   * forces every promoted *descendant* to re-rasterise, and the descendants
   * here are three 150%-of-viewport radial gradients.
   *
   * So move the breathing onto the children instead, using CSS's standalone
   * `scale` property, which composes independently of the `transform` their
   * spin keyframes already animate. Uniform scale and rotation commute, so the
   * rendered result is identical to scaling the parent — but now each child
   * animates its own transform on the compositor and nothing scales a promoted
   * subtree.
   */
  'breathe-on-children': `
    .ambient-breathe { animation: none !important; }
    @keyframes sf-breathe { 0%, 100% { scale: 1; } 50% { scale: 1.07; } }
    .ambient-spin-a { animation: ambient-spin-a 90s linear infinite, sf-breathe 16s ease-in-out infinite !important; }
    .ambient-spin-b { animation: ambient-spin-b 130s linear infinite, sf-breathe 16s ease-in-out infinite !important; }
  `,
};

const METRICS = ['TaskDuration', 'ScriptDuration', 'LayoutDuration', 'RecalcStyleDuration'];

/** Pull the counters we care about, in ms. */
async function readMetrics(cdp) {
  const { metrics } = await cdp.send('Performance.getMetrics');
  const m = Object.fromEntries(metrics.map((x) => [x.name, x.value]));
  const out = {};
  for (const k of METRICS) out[k] = (m[k] ?? 0) * 1000; // seconds → ms
  out.LayoutCount = m.LayoutCount ?? 0;
  out.RecalcStyleCount = m.RecalcStyleCount ?? 0;
  return out;
}

const delta = (a, b) => {
  const out = {};
  for (const k of Object.keys(b)) out[k] = b[k] - (a[k] ?? 0);
  return out;
};

/**
 * Paint/composite is not exposed as its own counter. It is what is left of
 * total task time once script, layout and style are accounted for — which also
 * sweeps in compositing, decoding and hit testing. Named "paint & composite"
 * rather than "paint" so the residual nature stays visible.
 */
const paintOf = (d) =>
  Math.max(0, d.TaskDuration - d.ScriptDuration - d.LayoutDuration - d.RecalcStyleDuration);

/**
 * Rendering must not be throttled, or the measurement is bimodal and useless.
 *
 * Without these flags the same arm measured 353 ms and 2,528 ms of steady-state
 * task time — two distinct modes, not a spread. Headless Chromium backgrounds
 * the renderer and stops compositing when it believes the window is occluded,
 * so roughly half the runs were measuring a page that had simply stopped
 * animating. Medians then reported whichever mode a given arm happened to draw
 * more of, which is how `no-breathe` scored -64% in one pass and -2% in the
 * next on identical code.
 */
const NO_THROTTLE_ARGS = [
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  '--disable-features=CalculateNativeWinOcclusion',
];

async function runOnce(experiment, label) {
  const browser = await chromium.launch({ args: NO_THROTTLE_ARGS });
  const page = await browser.newPage({
    viewport: { width: 1350, height: 940 },
    reducedMotion: process.env.TRACE_REDUCED_MOTION === 'true' ? 'reduce' : 'no-preference',
  });
  const cdp = await page.context().newCDPSession(page);

  if (EXPERIMENTS[experiment]) {
    await page.addInitScript((css) => {
      const s = document.createElement('style');
      s.textContent = css;
      document.documentElement.appendChild(s);
    }, EXPERIMENTS[experiment]);
  }

  if (CPU_THROTTLE > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_THROTTLE });
  await cdp.send('Performance.enable');

  const t0 = await readMetrics(cdp);
  await page.goto(URL_, { waitUntil: 'load' });
  await page.waitForTimeout(LOAD_PHASE_MS);
  const t1 = await readMetrics(cdp);

  /**
   * Wait for the atmosphere to actually exist before timing steady state.
   *
   * This is the confound that made the metric bimodal. `DeferredAtmosphere`
   * mounts on `load` and then `requestIdleCallback(..., {timeout: 3000})` —
   * and the load window above is also 3000 ms, so the steady window began at
   * the exact moment the atmosphere appeared. Whether the animations were
   * running during measurement came down to milliseconds of jitter, producing
   * two clean modes (~370 ms and ~1,300 ms) rather than a spread, and medians
   * that reported whichever mode an arm happened to draw more of.
   *
   * Waiting for the element removes the race: steady state now always measures
   * a mounted, animating page.
   */
  let mounted = true;
  try {
    await page.waitForSelector('.ambient-breathe', { state: 'attached', timeout: 10_000 });
    // One frame for the first composited frame to land.
    await page.waitForTimeout(250);
  } catch {
    // Expected under reduced motion, where DeferredAtmosphere renders nothing.
    mounted = false;
  }

  // Re-baseline: whatever accrues from here is cost paid for as long as the
  // tab is open, with the atmosphere known to be present.
  const tSteadyStart = await readMetrics(cdp);
  await page.waitForTimeout(STEADY_MS);
  const t2 = await readMetrics(cdp);

  await browser.close();

  const load = delta(t0, t1);
  const steady = delta(tSteadyStart, t2);
  steady.mounted = mounted;
  const result = {
    load: { ...load, paint: paintOf(load) },
    steady: { ...steady, paint: paintOf(steady) },
  };

  process.stdout.write(
    `  ${label}  steady: task ${result.steady.TaskDuration.toFixed(0)} ms` +
      ` = paint ${result.steady.paint.toFixed(0)}` +
      ` + script ${result.steady.ScriptDuration.toFixed(0)}` +
      ` + style ${result.steady.RecalcStyleDuration.toFixed(0)}` +
      ` + layout ${result.steady.LayoutDuration.toFixed(0)}\n`,
  );
  return result;
}

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const pick = (runs, phase, key) => median(runs.map((r) => r[phase][key]));

async function measure(experiment) {
  for (let i = 0; i < WARMUP; i++) await runOnce(experiment, 'warm-up (discarded)');
  const runs = [];
  for (let i = 0; i < RUNS; i++) runs.push(await runOnce(experiment, `run ${i + 1}/${RUNS}     `));

  const summarise = (phase) => ({
    task: pick(runs, phase, 'TaskDuration'),
    paint: pick(runs, phase, 'paint'),
    script: pick(runs, phase, 'ScriptDuration'),
    style: pick(runs, phase, 'RecalcStyleDuration'),
    layout: pick(runs, phase, 'LayoutDuration'),
    layoutCount: pick(runs, phase, 'LayoutCount'),
    styleCount: pick(runs, phase, 'RecalcStyleCount'),
    taskSpread: [
      Math.min(...runs.map((r) => r[phase].TaskDuration)),
      Math.max(...runs.map((r) => r[phase].TaskDuration)),
    ],
  });

  return { experiment, load: summarise('load'), steady: summarise('steady') };
}

const ms = (n) => `${n.toFixed(0)} ms`.padStart(9);

function printPhase(title, s) {
  console.log(`\n  ${title}`);
  console.log(`  ${'─'.repeat(66)}`);
  console.log(`    total main-thread task   ${ms(s.task)}   (spread ${s.taskSpread[0].toFixed(0)}–${s.taskSpread[1].toFixed(0)})`);
  console.log(`    ├─ paint & composite     ${ms(s.paint)}   ${((s.paint / s.task) * 100).toFixed(0)}%`);
  console.log(`    ├─ script                ${ms(s.script)}   ${((s.script / s.task) * 100).toFixed(0)}%`);
  console.log(`    ├─ style recalc          ${ms(s.style)}   ${((s.style / s.task) * 100).toFixed(0)}%   (${s.styleCount.toFixed(0)} recalcs)`);
  console.log(`    └─ layout                ${ms(s.layout)}   ${((s.layout / s.task) * 100).toFixed(0)}%   (${s.layoutCount.toFixed(0)} reflows)`);
}

async function main() {
  const arms = (process.env.TRACE_EXPERIMENTS ?? process.env.TRACE_EXPERIMENT ?? 'none')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const a of arms) {
    if (!(a in EXPERIMENTS)) {
      console.error(`Unknown arm "${a}". Options: ${Object.keys(EXPERIMENTS).join(', ')}`);
      process.exit(1);
    }
  }

  console.log(`\nPaint / layout / style attribution — ${URL_}`);
  console.log(
    `  CPU ${CPU_THROTTLE}x · load ${LOAD_PHASE_MS}ms · steady ${STEADY_MS}ms · median of ${RUNS}\n`,
  );
  console.log('  Counters, not samples — CDP Performance.getMetrics. Paint & composite');
  console.log('  is the residual: task − script − layout − style.\n');

  const results = [];
  for (const arm of arms) {
    console.log(`\n${'═'.repeat(70)}\n  ARM: ${arm}\n${'═'.repeat(70)}`);
    const r = await measure(arm);
    results.push(r);
    printPhase(`LOAD PHASE (0–${LOAD_PHASE_MS} ms)`, r.load);
    printPhase(`STEADY STATE (${STEADY_MS} ms, page idle)`, r.steady);
  }

  if (results.length > 1) {
    const base = results.find((r) => r.experiment === 'none') ?? results[0];
    console.log(`\n\n${'═'.repeat(70)}`);
    console.log(`  STEADY-STATE COMPARISON  (vs "${base.experiment}")`);
    console.log(`${'═'.repeat(70)}\n`);
    console.log(`  ${'arm'.padEnd(20)}${'task'.padStart(10)}${'paint'.padStart(10)}${'Δ task'.padStart(11)}${'Δ%'.padStart(8)}`);
    console.log(`  ${'─'.repeat(66)}`);
    for (const r of results) {
      const d = r.steady.task - base.steady.task;
      const pct = base.steady.task ? (d / base.steady.task) * 100 : 0;
      console.log(
        `  ${r.experiment.padEnd(20)}${ms(r.steady.task).slice(1)}${ms(r.steady.paint).slice(1)}` +
          `${(d >= 0 ? '+' : '') + d.toFixed(0) + ' ms'}`.padStart(11) +
          `${(pct >= 0 ? '+' : '') + pct.toFixed(0) + '%'}`.padStart(8),
      );
    }
    console.log('');
  }

  mkdirSync(OUT, { recursive: true });
  const path = join(OUT, `trace-paint-${CPU_THROTTLE}x.json`);
  writeFileSync(path, JSON.stringify({ url: URL_, runs: RUNS, results }, null, 2), 'utf8');
  console.log(`  written: .lighthouse/trace-paint-${CPU_THROTTLE}x.json\n`);
}

await main();
