/**
 * PerformanceWatcher — budgets, baselines, and the discipline that makes a
 * "regression" mean something.
 *
 * ## Why every number here is a median with a spread
 *
 * This box has 4 logical cores and 7.88 GB of RAM, and the pages under test
 * spend roughly three-quarters of their steady-state main thread in paint and
 * compositing. Under those conditions a single run of anything is noise: the
 * project's own Playwright config carries a 90 s timeout because specs that
 * take 4–15 s standalone reach 28–38 s when two device projects run in
 * parallel. The same variance applies to LCP and INP.
 *
 * So a single measurement is never allowed to be a result. `record()` appends
 * runs, `stat()` reduces them to median plus min–max plus n, and `compare()`
 * refuses to call a change a regression when the delta sits inside the spread
 * the baseline itself exhibits. `n=1` is reported as "single run, not a
 * measurement" in the prose helper, deliberately, so it cannot be quoted as
 * though it were one.
 *
 * ## Why the baseline is machine-local and gitignored
 *
 * A baseline is a claim about *this hardware*: Intel HD 620, 4 cores, 7.88 GB,
 * with the discrete GeForce sitting idle. Committing it would let a CI runner's
 * numbers — or a faster laptop's — silently become the budget this box is
 * measured against, and every subsequent "regression" would be an artefact of
 * where the number came from. `.engineering/` is in `.gitignore` for that
 * reason and not by accident.
 *
 * ## Budgets are inherited, not invented
 *
 * The bundle budgets already exist in `scripts/audit-bundle.mjs`, set from a
 * measured baseline with headroom, for the stated reason that "a budget nobody
 * has ever met is a broken gate, and a broken gate gets ignored". This module
 * does not restate them — it runs that script and reads its verdict. The Core
 * Web Vitals budgets below are Google's published thresholds, which is the one
 * place an external number is more defensible than a local one.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { LIGHTHOUSE_DIR, NEXT_DIR, ROOT, STATE_DIR } from './paths.ts';
import { finding, statText, summarise, worst } from './types.ts';
import type { Finding, Sample, Stat, Status } from './types.ts';

/* ------------------------------------------------------------------ *
 * Budgets
 * ------------------------------------------------------------------ */

export const VITALS_BUDGET = {
  lcp: { limit: 2500, unit: 'ms', label: 'Largest Contentful Paint' },
  cls: { limit: 0.1, unit: '', label: 'Cumulative Layout Shift' },
  inp: { limit: 200, unit: 'ms', label: 'Interaction to Next Paint' },
  tbt: { limit: 300, unit: 'ms', label: 'Total Blocking Time' },
  fcp: { limit: 1800, unit: 'ms', label: 'First Contentful Paint' },
};

export type VitalKey = keyof typeof VITALS_BUDGET;

/* ------------------------------------------------------------------ *
 * The baseline store
 * ------------------------------------------------------------------ */

export interface Run {
  at: string;
  /**
   * What was measured, *and how*.
   *
   * A bare route (`/`) means Lighthouse: 4x CPU throttling, simulated network.
   * `probe:/` means PageProbe: the same route at full speed through a plain
   * Chromium. They are separate series on purpose. Merging them would build a
   * median out of two populations, and the resulting spread would describe the
   * difference between two tools rather than any variance in the site.
   */
  scope: string;
  metrics: Partial<Record<VitalKey, number>>;
  /** Free physical GB at the time. A run taken under pressure is a different
   *  population from one taken with headroom, and mixing them poisons a median. */
  freeGB?: number;
  note?: string;
}

const HISTORY_PATH = () => join(STATE_DIR, 'perf-history.json');

/** How many recent runs form the baseline. Small enough to track real change,
 *  large enough that one bad run cannot move the median. */
const BASELINE_WINDOW = 9;

export function history(): Run[] {
  const p = HISTORY_PATH();
  if (!existsSync(p)) return [];
  try {
    const raw = JSON.parse(readFileSync(p, 'utf8'));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function record(run: Run): void {
  const all = [...history(), run];
  // Keep a long tail for archaeology, not just the baseline window.
  const trimmed = all.slice(-200);
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(HISTORY_PATH(), JSON.stringify(trimmed, null, 2));
}

/** Samples for one metric within one scope, most recent `window` runs. */
export function sampleOf(scope: string, metric: VitalKey, window = BASELINE_WINDOW): Sample {
  const values = history()
    .filter((r) => r.scope === scope && typeof r.metrics[metric] === 'number')
    .slice(-window)
    .map((r) => r.metrics[metric] as number);
  return { metric, unit: VITALS_BUDGET[metric].unit, values };
}

export function stat(scope: string, metric: VitalKey, window = BASELINE_WINDOW): Stat {
  return summarise(sampleOf(scope, metric, window));
}

/* ------------------------------------------------------------------ *
 * Regression detection
 * ------------------------------------------------------------------ */

export interface Regression {
  metric: VitalKey;
  scope: string;
  latest: number;
  baseline: Stat;
  delta: number;
  /** True when |delta| is inside the baseline's own min–max spread. */
  withinNoise: boolean;
  overBudget: boolean;
}

/**
 * Compare the newest run against the runs before it.
 *
 * The `withinNoise` test is the whole point. Without it, a metric whose
 * baseline ranges 1800–2400 ms will be reported as a 400 ms regression roughly
 * half the time, purely from sampling — and a report that cries regression
 * every other run trains its reader to stop reading it, which is how the real
 * one gets missed.
 */
export function compare(scope: string): { regressions: Regression[]; findings: Finding[]; status: Status } {
  const runs = history().filter((r) => r.scope === scope);
  const findings: Finding[] = [];
  const regressions: Regression[] = [];

  if (!runs.length) {
    return {
      regressions: [],
      findings: [
        finding('perf:baseline', 'skipped', `no recorded runs for ${scope} — nothing to compare against`, {
          fix: 'npm run audit:lh, then eng perf:ingest, to seed a baseline (needs a browser)',
        }),
      ],
      status: 'skipped',
    };
  }

  const latest = runs.at(-1)!;
  const prior = runs.slice(0, -1).slice(-BASELINE_WINDOW);

  for (const key of Object.keys(VITALS_BUDGET) as VitalKey[]) {
    const value = latest.metrics[key];
    if (typeof value !== 'number') continue;
    const budget = VITALS_BUDGET[key];
    const baseline = summarise({
      metric: key,
      unit: budget.unit,
      values: prior.map((r) => r.metrics[key]).filter((v): v is number => typeof v === 'number'),
    });
    const overBudget = value > budget.limit;

    if (!baseline.n) {
      findings.push(
        finding(`perf:${key}`, overBudget ? 'warn' : 'ok', `${budget.label} ${value}${budget.unit} against a ${budget.limit}${budget.unit} budget — first recorded run, no baseline yet`, {
          evidence: { value, budget: budget.limit },
        }),
      );
      continue;
    }

    const delta = value - baseline.median;
    const withinNoise = Math.abs(delta) <= baseline.spread;
    regressions.push({ metric: key, scope, latest: value, baseline, delta, withinNoise, overBudget });

    const direction = delta > 0 ? 'slower' : 'faster';
    const noiseNote = withinNoise
      ? ` — inside the baseline spread (${statText(baseline, key === 'cls' ? 3 : 0)}), so this is not a signal`
      : '';

    let status: Status = 'ok';
    if (overBudget && !withinNoise && delta > 0) status = 'fail';
    else if (overBudget) status = 'warn';
    else if (!withinNoise && delta > 0) status = 'warn';

    findings.push(
      finding(
        `perf:${key}`,
        status,
        `${budget.label} ${value}${budget.unit} vs ${statText(baseline, key === 'cls' ? 3 : 0)} — ${Math.abs(delta).toFixed(key === 'cls' ? 3 : 0)}${budget.unit} ${direction}${noiseNote}${overBudget ? `. Over the ${budget.limit}${budget.unit} budget.` : ''}`,
        { evidence: { latest: value, baseline, delta, withinNoise, budget: budget.limit } },
      ),
    );
  }

  if (latest.freeGB !== undefined && latest.freeGB < 1.5) {
    findings.push(
      finding('perf:conditions', 'warn', `the latest run was taken with ${latest.freeGB} GB free — thin. Numbers from a pressured machine belong to a different population than the baseline.`, {
        fix: 'discard this run from the baseline, or re-run it with headroom before trusting a comparison',
      }),
    );
  }

  return { regressions, findings, status: worst(findings.map((f) => f.status)) };
}

/* ------------------------------------------------------------------ *
 * Ingesting measurements other tools produced
 * ------------------------------------------------------------------ */

/**
 * Reads `.lighthouse/report.json` if `npm run audit:lh` has been run.
 *
 * Returns null rather than a partial object when the file is absent, so the
 * caller states "not measured" instead of recording a run full of zeroes — a
 * zero CLS and a missing CLS look identical in a chart and mean opposite things.
 */
export function readLighthouse(): { metrics: Partial<Record<VitalKey, number>>; url: string; at: string } | null {
  const p = join(LIGHTHOUSE_DIR, 'report.json');
  if (!existsSync(p)) return null;
  try {
    const lh = JSON.parse(readFileSync(p, 'utf8'));
    const audits = lh.audits ?? {};
    const num = (id: string): number | undefined => {
      const v = audits[id]?.numericValue;
      return typeof v === 'number' ? Math.round(v * 1000) / 1000 : undefined;
    };
    const metrics: Partial<Record<VitalKey, number>> = {};
    const lcp = num('largest-contentful-paint');
    const cls = num('cumulative-layout-shift');
    const tbt = num('total-blocking-time');
    const fcp = num('first-contentful-paint');
    if (lcp !== undefined) metrics.lcp = Math.round(lcp);
    if (cls !== undefined) metrics.cls = cls;
    if (tbt !== undefined) metrics.tbt = Math.round(tbt);
    if (fcp !== undefined) metrics.fcp = Math.round(fcp);
    return { metrics, url: lh.finalDisplayedUrl ?? lh.finalUrl ?? lh.requestedUrl ?? 'unknown', at: lh.fetchTime ?? new Date().toISOString() };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Bundle
 * ------------------------------------------------------------------ */

export interface BundleResult {
  status: Status;
  jsGzipKB?: number;
  cssGzipKB?: number;
  budgetJsKB?: number;
  budgetCssKB?: number;
  detail: string;
  output: string;
}

/**
 * Delegates to `scripts/audit-bundle.mjs` rather than re-measuring.
 *
 * That script is the source of truth for what ships: it gzips every emitted
 * file at level 9 and compares against budgets set from a measured baseline.
 * Reimplementing it here would produce a second set of numbers that agree until
 * the day they do not.
 */
export function bundle(): BundleResult {
  if (!existsSync(join(NEXT_DIR, 'static'))) {
    return {
      status: 'skipped',
      detail: 'no .next/static — nothing has been built, so bundle size is unmeasured',
      output: '',
    };
  }
  let out = '';
  let failed = false;
  try {
    out = execFileSync(process.execPath, ['scripts/audit-bundle.mjs'], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 4 * 1024 * 1024,
      windowsHide: true,
    });
  } catch (error: any) {
    out = String(error?.stdout ?? '') + String(error?.stderr ?? '');
    failed = true;
  }

  const js = /js\s+raw\s+\d+\s*kB\s+gzip\s+([\d.]+)\s*kB\s+budget\s+(\d+)/.exec(out);
  const css = /css\s+raw\s+\d+\s*kB\s+gzip\s+([\d.]+)\s*kB\s+budget\s+(\d+)/.exec(out);

  return {
    status: failed ? 'fail' : 'ok',
    jsGzipKB: js ? Number(js[1]) : undefined,
    cssGzipKB: css ? Number(css[1]) : undefined,
    budgetJsKB: js ? Number(js[2]) : undefined,
    budgetCssKB: css ? Number(css[2]) : undefined,
    detail: js
      ? `JS ${js[1]} kB gzipped against a ${js[2]} kB budget${css ? `, CSS ${css[1]} kB against ${css[2]} kB` : ''}${failed ? ' — over budget' : ''}`
      : failed
        ? 'bundle budget exceeded (could not parse the totals from the script output)'
        : 'all bundle budgets met',
    output: out.trim(),
  };
}

/* ------------------------------------------------------------------ *
 * The audit entry point
 * ------------------------------------------------------------------ */

export function audit(scope = '/'): { findings: Finding[]; status: Status; bundle: BundleResult } {
  const findings: Finding[] = [];

  const b = bundle();
  findings.push(
    finding('perf:bundle', b.status, b.detail, {
      fix: b.status === 'fail' ? 'npm run analyze opens the treemap; the largest chunk is usually one heavy client import' : undefined,
      evidence: { jsGzipKB: b.jsGzipKB, cssGzipKB: b.cssGzipKB, budgetJsKB: b.budgetJsKB, budgetCssKB: b.budgetCssKB },
    }),
  );

  const cmp = compare(scope);
  findings.push(...cmp.findings);

  const lh = readLighthouse();
  findings.push(
    lh
      ? finding('perf:lighthouse', 'ok', `Lighthouse report on disk for ${lh.url} (${lh.at.slice(0, 19)})`, { evidence: lh.metrics })
      : finding('perf:lighthouse', 'skipped', 'no .lighthouse/report.json — Core Web Vitals are unmeasured on this build', {
          fix: 'npm run audit:lh   (needs a browser; MemoryGuard admits it at 2.0 GB free)',
        }),
  );

  return { findings, status: worst(findings.map((f) => f.status)), bundle: b };
}

/** Ingest whatever measurements exist on disk into the baseline. */
export function ingest(scope = '/', freeGB?: number, note?: string): Finding {
  const lh = readLighthouse();
  if (!lh) {
    return finding('perf:ingest', 'skipped', 'nothing to ingest — no Lighthouse report on disk');
  }
  const runs = history();
  if (runs.some((r) => r.note === lh.at)) {
    return finding('perf:ingest', 'ok', `already ingested the report from ${lh.at.slice(0, 19)}`);
  }
  record({ at: new Date().toISOString(), scope, metrics: lh.metrics, freeGB, note: note ?? lh.at });
  const keys = Object.keys(lh.metrics).join(', ');
  return finding('perf:ingest', 'ok', `recorded ${keys} for ${scope} — baseline now holds ${history().filter((r) => r.scope === scope).length} run(s)`, {
    evidence: lh.metrics,
  });
}
