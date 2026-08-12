/**
 * MemoryGuard — admission control for work that can kill the machine.
 *
 * ## The one number this whole system exists to respect
 *
 * On 2026-08-10 three `chrome-headless-shell.exe` processes died inside seven
 * minutes with exception `0xE0000008` — Chromium's own out-of-memory code,
 * raised deliberately by its `OnNoMemory` handler — while Windows independently
 * logged Event 2004, "successfully diagnosed a low virtual memory condition",
 * in the same second. The machine has 7.88 GB physical. The three largest
 * consumers at the time were `vmmem` (3.23 GB), `Code.exe` (1.19 GB) and
 * `ChatGPT Classic.exe` (1.08 GB) — 5.5 GB committed by processes that have
 * nothing to do with this repository, before Node, Next or Chromium allocated a
 * byte.
 *
 * That is why this module exists as something other than a warning printer:
 *
 *   • The pressure is **not caused by this project**, so it cannot be fixed by
 *     killing this project's processes. Every other detector in the system can
 *     repair its own finding. This one can only refuse to proceed.
 *
 *   • Refusing to proceed is *cheaper than proceeding*. A refused Playwright run
 *     costs zero seconds. An admitted one on a saturated box costs the run, the
 *     browser, and — as happened — the forensic artifacts that would have
 *     explained it.
 *
 * ## Why per-task budgets rather than one floor
 *
 * The .mjs supervisor has a single pair of thresholds because it runs on every
 * prompt and must answer one question: is it safe to do *anything*. This module
 * runs before a specific task, so it can ask the sharper question. `tsc` needs
 * a few hundred MB; a two-project Playwright run spawns workers that each
 * allocated ~200 MB when they crashed; Lighthouse launches its own Chrome *and*
 * keeps a trace in memory. Holding all three to the same floor either blocks
 * type-checking pointlessly or admits a Lighthouse run into an OOM.
 *
 * The figures below are floors *of free physical memory at admission*, derived
 * from the incident and from measured working sets in ENVIRONMENT_STATUS.md
 * (project Node 156.7 MB, MCP servers 338.6 MB, browser JS heap 10.3 MB on a
 * loaded homepage), not chosen for roundness.
 */

import { freemem, totalmem } from 'node:os';
import { finding } from './types.ts';
import type { Finding, Status } from './types.ts';

/* ------------------------------------------------------------------ *
 * Policy
 * ------------------------------------------------------------------ */

export type TaskKind =
  | 'typecheck'
  | 'lint'
  | 'static'
  | 'build'
  | 'server'
  | 'probe'
  | 'playwright-serial'
  | 'playwright'
  | 'lighthouse'
  | 'capture';

/** Free physical GB required to admit each task, and why that number. */
export const BUDGETS: Record<TaskKind, { gb: number; because: string }> = {
  static: { gb: 0.2, because: 'file reads and zlib only; no child browser, no build' },
  lint: { gb: 0.4, because: 'ESLint holds the whole src/ AST set in one process' },
  typecheck: { gb: 0.6, because: 'tsc over ~200 files with incremental build info' },
  build: { gb: 1.0, because: 'next build forks workers per route; 30 routes on 4 cores' },
  server: { gb: 0.4, because: 'next start measured at 109 MB working set in ENVIRONMENT_STATUS §4' },
  /**
   * One browser, one tab, one page — the in-page visual audit.
   *
   * **This number was measured, not estimated, and the estimate was wrong.**
   *
   * The first version set it to 0.9 GB by reasoning from the page's 10.3 MB JS
   * heap (ENVIRONMENT_STATUS § 4). On the first unattended run the probe was
   * admitted at 1.08 GB free, launched Chromium, and the watchdog aborted it
   * when free memory reached **0.69 GB** — below the 0.8 GB OOM floor. So one
   * Chromium plus one loaded page on this site costs **~0.4 GB**, not the tens
   * of megabytes the JS heap figure suggested. The heap is the JavaScript
   * objects; it says nothing about the renderer process, the GPU process, or
   * the compositor layers this particular page allocates — and this page holds
   * 101 composited layers and 10 blur layers.
   *
   * Admission must therefore leave the *floor* plus the *cost*: 0.8 + 0.4.
   * Anything less admits a task that the watchdog will then have to kill, which
   * is worse than refusing it — it burns a browser launch and a minute of
   * wall-clock to arrive at the same answer.
   */
  probe: { gb: 1.2, because: 'measured: one Chromium plus this site’s page cost ~0.4 GB, on top of the 0.8 GB OOM floor' },
  capture: { gb: 1.4, because: 'one Chromium plus PNG encoding for a route matrix' },
  /**
   * The suite with `--workers=1`.
   *
   * This is a genuinely smaller job, not the same job admitted under a softer
   * rule. The 1.6 GB figure below is arithmetic on *concurrency*: two device
   * projects times parallel workers, each of which had allocated ~200 MB when
   * they crashed. Pin the runner to one worker and there is one browser at a
   * time, so the requirement falls with it.
   *
   * The supervisor has been giving this exact advice since RC6.1 — "run the
   * test suite with --workers=1" is what the `memory` warning says. Until now
   * nothing acted on it, so the suite was refused outright on a machine that
   * could have run it serially. Refusing work the host can actually do is its
   * own kind of dishonesty.
   *
   * The trade is wall-clock: serial is roughly 2–3x slower. The gate reports
   * which mode it used, because "passed" means something different in each.
   */
  /**
   * Revised upward for the same reason as `probe`, and by the same measurement.
   *
   * 1.1 GB was built on the ~200 MB figure from the crashed workers, which was
   * the working set Windows reported for a *worker process* — not the whole
   * browser it drives. The probe run put one Chromium plus one page at ~0.4 GB.
   * Serial mode needs that, plus the test runner (~0.15 GB), plus `next start`
   * (measured at 109 MB in ENVIRONMENT_STATUS § 4), on top of the 0.8 GB floor.
   */
  /**
   * Raised again, from the suite's own low-water marks.
   *
   * Three serial runs of the accessibility suite were observed:
   *   · passed 34/34, standalone
   *   · passed 34/34 in-pipeline, admitted at ~1.87 GB, **low-water 1.03 GB**
   *   · aborted mid-run at **0.74 GB**, admitted under the 1.45 GB floor
   *
   * The completed run consumed ~0.84 GB. Staying above the 0.8 GB Chromium OOM
   * floor therefore needs ~1.65 GB at admission, and 1.45 was low enough to let
   * the third run in and then have to kill it. The pattern is now familiar: the
   * estimate is always cheaper than the measurement, because a browser's cost
   * is dominated by compositor and renderer memory that no heap figure predicts.
   */
  'playwright-serial': {
    gb: 1.65,
    because: 'measured: the serial suite consumed ~0.84 GB (low-water 1.03 GB from a 1.87 GB start), above the 0.8 GB floor',
  },
  playwright: {
    gb: 2.2,
    because: '2 device projects in parallel — two of the above browser+worker pairs at once',
  },
  lighthouse: {
    gb: 2.0,
    because: 'launches its own Chrome, throttles it, and holds a full trace in the runner',
  },
};

/**
 * Absolute floors, inherited from the .mjs supervisor so the two layers cannot
 * disagree about when the machine is unusable.
 */
export const WARN_FREE_GB = 1.5;
export const BLOCK_FREE_GB = 0.8;

/**
 * Reclaim advice, ranked by how much it actually frees on *this* host.
 *
 * Ordered by measured size, not by how much the process annoys anyone. The
 * ordering matters: an earlier draft of the recovery blamed the MCP servers,
 * and deduplicating every one of them would have freed 339 MB — roughly a tenth
 * of what `wsl --shutdown` frees in one command.
 */
const RECLAIM: Array<{ match: RegExp; gb: number; how: string }> = [
  { match: /^vmmem/i, gb: 3.2, how: 'wsl --shutdown   (WSL2/Docker utility VM — the single biggest win on this host)' },
  { match: /ChatGPT/i, gb: 1.0, how: 'close the ChatGPT desktop app' },
  { match: /^Code$/i, gb: 1.2, how: 'close unused VS Code windows, or restart the extension host' },
  { match: /^msedge/i, gb: 0.4, how: 'close idle Edge tabs' },
  { match: /^chrome$/i, gb: 0.4, how: 'close idle Chrome tabs' },
];

/* ------------------------------------------------------------------ *
 * Reading memory
 * ------------------------------------------------------------------ */

/**
 * Free physical GB, from `node:os` rather than PowerShell.
 *
 * This matters more than it looks. The whole diagnosis is that the machine is
 * short of memory, so the guard must not be expensive to consult — a PowerShell
 * round-trip is ~1 s and its own ~30 MB. `os.freemem()` is a syscall. That lets
 * `watch()` below sample every two seconds during a long build without becoming
 * a second source of the pressure it is watching for.
 */
export function freeGB(): number {
  return Math.round((freemem() / 1024 ** 3) * 100) / 100;
}

/**
 * Free memory as a median of several readings, for admission decisions.
 *
 * `freemem()` on Windows reports memory that is *available right now*, and that
 * figure swings violently as the OS trims working sets under pressure. This is
 * not a theory: during RC7.1 the accessibility suite was measured at **0.26 GB
 * free immediately before it started** and **2.10 GB free when it finished**,
 * having passed 34/34 in the interval. A single instantaneous read taken during
 * one of those troughs refuses a task the machine can comfortably run.
 *
 * That is the same error this project already refuses to make about LCP — one
 * sample is not a measurement — applied to the guard itself. Admission now
 * takes the median of a short burst, which rejects the transient dip without
 * hiding a genuine, sustained shortage: if memory is really gone, every sample
 * in the burst says so.
 *
 * Deliberately synchronous and short. The alternative — sampling across
 * seconds — would add real latency to a check that runs before every gate.
 */
export function freeGBStable(samples = 5, spacingMs = 60): number {
  const readings: number[] = [];
  const started = Date.now();
  for (let i = 0; i < samples; i++) {
    readings.push(freemem() / 1024 ** 3);
    // Busy-wait briefly: this must stay synchronous so `admit()` keeps its
    // simple signature, and the total cost is a few hundred milliseconds.
    const until = Date.now() + spacingMs;
    while (Date.now() < until && Date.now() - started < 2000) {
      /* spin */
    }
  }
  readings.sort((a, b) => a - b);
  return Math.round(readings[Math.floor(readings.length / 2)] * 100) / 100;
}

export function totalGB(): number {
  return Math.round((totalmem() / 1024 ** 3) * 100) / 100;
}

/* ------------------------------------------------------------------ *
 * Admission
 * ------------------------------------------------------------------ */

export interface Admission {
  task: TaskKind;
  admitted: boolean;
  freeGB: number;
  requiredGB: number;
  reason: string;
  advice: string[];
}

/**
 * Decide whether a task may run.
 *
 * `topConsumers` comes from ResourceMonitor's snapshot when available. It is
 * optional because the guard must still work when the deep probe failed —
 * degraded advice is better than a guard that cannot answer.
 */
export function admit(
  task: TaskKind,
  topConsumers: Array<{ ProcessName: string; MB: number }> = [],
): Admission {
  // Median of a burst, not a single instant — see `freeGBStable`. A transient
  // trough must not refuse a task the machine can actually run.
  const free = freeGBStable();
  const need = BUDGETS[task].gb;
  const advice: string[] = [];

  // Rank the advice by what is actually running and how much it holds, so the
  // first line is always the biggest available win rather than a generic list.
  const seen = new Set<string>();
  for (const c of [...topConsumers].sort((a, b) => b.MB - a.MB)) {
    const hit = RECLAIM.find((r) => r.match.test(c.ProcessName));
    if (!hit || seen.has(hit.how)) continue;
    seen.add(hit.how);
    advice.push(`${c.ProcessName} holds ${c.MB} MB → ${hit.how}`);
  }
  if (!advice.length) {
    advice.push('wsl --shutdown   (frees ~3.2 GB on this host when the WSL2 VM is up)');
  }

  if (free >= need) {
    return {
      task,
      admitted: true,
      freeGB: free,
      requiredGB: need,
      reason: `${free} GB free ≥ ${need} GB required (${BUDGETS[task].because})`,
      advice: [],
    };
  }
  return {
    task,
    admitted: false,
    freeGB: free,
    requiredGB: need,
    reason:
      `${free} GB free of ${totalGB()} GB, below the ${need} GB this task needs — ${BUDGETS[task].because}. ` +
      (need >= BUDGETS.capture.gb
        ? 'Launching a browser here reproduces the 0xE0000008 OOM abort.'
        : 'Running it here risks the same allocation failure at a smaller scale.'),
    advice,
  };
}

/** The admission decision as a Finding, for reports. */
export function admissionFinding(a: Admission): Finding {
  const status: Status = a.admitted ? 'ok' : a.freeGB < BLOCK_FREE_GB ? 'blocked' : 'skipped';
  return finding(`memory:${a.task}`, status, a.reason, {
    fix: a.advice.length ? a.advice.join(' · ') : undefined,
    evidence: { freeGB: a.freeGB, requiredGB: a.requiredGB },
  });
}

/** The standing state of the machine, independent of any one task. */
export function headroom(topConsumers: Array<{ ProcessName: string; MB: number }> = []): Finding {
  const free = freeGBStable();
  const total = totalGB();
  const top = topConsumers
    .slice(0, 5)
    .map((t) => `${t.ProcessName} ${t.MB}MB`)
    .join(', ');

  if (free < BLOCK_FREE_GB) {
    return finding('memory', 'blocked', `${free} GB physical free of ${total} GB — below the ${BLOCK_FREE_GB} GB floor${top ? `. Top: ${top}` : ''}`, {
      fix: admit('playwright', topConsumers).advice.join(' · '),
      evidence: { freeGB: free, totalGB: total, topConsumers },
    });
  }
  if (free < WARN_FREE_GB) {
    return finding('memory', 'warn', `${free} GB physical free of ${total} GB — thin for a browser run${top ? `. Top: ${top}` : ''}`, {
      fix: 'serialise: build, then test, then capture. Never with the Playwright MCP browser open alongside the runner.',
      evidence: { freeGB: free, totalGB: total, topConsumers },
    });
  }
  return finding('memory', 'ok', `${free} GB physical free of ${total} GB`, {
    evidence: { freeGB: free, totalGB: total },
  });
}

/* ------------------------------------------------------------------ *
 * Watching a task in flight
 * ------------------------------------------------------------------ */

export interface Watch {
  stop(): { samples: number; minFreeGB: number; endFreeGB: number; crossedFloor: boolean };
}

/**
 * Tasks whose failure mode at low memory is a *hard abort* rather than slowness.
 *
 * This distinction was not in the first version of this module, and testing
 * found the omission immediately: the watcher killed a `tsc --noEmit` and an
 * `eslint src` because free memory dipped to 0.7 GB during them, turning two
 * gates that were about to pass into a `blocked` verdict.
 *
 * That was wrong, and the reason is specific. 0.8 GB is Chromium's floor —
 * below it, `OnNoMemory` raises `0xE0000008` and the browser is gone, taking
 * the run and its artifacts with it. Killing it first is strictly better than
 * letting it die. `tsc` and `eslint` have no such cliff: under pressure they
 * page and get slower, and a slow type-check that finishes is worth far more
 * than a fast one that was executed by its own supervisor. Worse, a dip *during*
 * a compile is the expected shape of a compile — it is the tool allocating,
 * which is the thing it was admitted to do.
 *
 * So the abort applies to the browser-launching tasks only. For everything else
 * the watcher still samples and still reports the low-water mark, because the
 * number is worth having; it simply does not act on it.
 */
export const ABORT_ON_FLOOR: TaskKind[] = ['probe', 'playwright-serial', 'playwright', 'lighthouse', 'capture'];

/**
 * Sample free memory while something long-running executes.
 *
 * Admission is a decision made at t=0, and the incident happened at t≈7 min —
 * three separate workers, each launched into a machine that had degraded since
 * the run started. `onFloor` fires the moment free memory crosses `floorGB`,
 * which lets BuildCoordinator abort a browser run *before* Chromium raises the
 * OOM rather than after, preserving both the artifacts and the diagnosis.
 *
 * Passing `floorGB: null` observes without ever firing — the correct mode for
 * any task that degrades rather than aborts.
 */
export function watch(
  onFloor?: (free: number) => void,
  intervalMs = 2000,
  floorGB: number | null = BLOCK_FREE_GB,
): Watch {
  let samples = 0;
  let minFree = freeGB();
  let fired = false;

  const timer = setInterval(() => {
    const f = freeGB();
    samples += 1;
    if (f < minFree) minFree = f;
    if (floorGB !== null && !fired && f < floorGB) {
      fired = true;
      onFloor?.(f);
    }
  }, intervalMs);
  // Never hold the event loop open on account of the watcher.
  timer.unref?.();

  return {
    stop() {
      clearInterval(timer);
      const end = freeGB();
      return { samples, minFreeGB: minFree, endFreeGB: end, crossedFloor: fired };
    },
  };
}
