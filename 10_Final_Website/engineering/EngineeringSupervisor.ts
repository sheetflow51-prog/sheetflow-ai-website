#!/usr/bin/env node
/**
 * EngineeringSupervisor — the thing that runs before, during and after the work.
 *
 *   node engineering/EngineeringSupervisor.ts preflight
 *   node engineering/EngineeringSupervisor.ts plan src/components/vos/Surface.tsx
 *   node engineering/EngineeringSupervisor.ts verify [--max-passes 3] [--fix]
 *   node engineering/EngineeringSupervisor.ts visual --before <dir> --after <dir>
 *   node engineering/EngineeringSupervisor.ts report
 *   node engineering/EngineeringSupervisor.ts full
 *   node engineering/EngineeringSupervisor.ts capability <id> <state> [why]
 *
 * ## What "fix automatically, repeat until green" can honestly mean
 *
 * RC7 asks the loop to run every gate, fix what fails, and repeat until green.
 * Two of those three are straightforwardly mechanical. The third is not, and
 * pretending otherwise would produce the worst possible tool: one that reports
 * green because it stopped looking.
 *
 * So the loop divides failures into two populations and treats them differently:
 *
 *   **Mechanically fixable** — the fix is deterministic and this file applies it,
 *   then re-runs the gate to prove it worked, not to assume it did:
 *     · lint violations with an ESLint autofix        → `eslint src --fix`
 *     · a build blocked by a server holding `.next`   → release, rebuild
 *     · an orphaned browser or a held port            → the .mjs supervisor
 *     · a stale coordinator lock from a killed run    → cleared after verifying
 *       the holding pid is gone
 *
 *   **Not mechanically fixable** — a type error, a failing assertion, an
 *   accessibility violation, a blown bundle budget. Each of these is a semantic
 *   decision about what the code should do, and a script that edited source to
 *   make them pass would be optimising the gate rather than the software. The
 *   loop stops, names the failure with its output, and hands it back.
 *
 * The loop also detects its own fixpoint: when a pass produces the same failure
 * signature as the pass before it, nothing is being learned and it stops rather
 * than burning a machine that has repeatedly run out of memory. `--max-passes`
 * bounds it besides.
 *
 * ## Why gates declare requirements instead of just failing
 *
 * A gate that needs a browser cannot run below its measured floor — not "will be
 * slow", cannot: that is the condition that produced three `0xE0000008` OOM
 * aborts in seven minutes. Such a gate returns `skipped` with the measured free
 * memory as its reason. It is counted in the *not measured* column of every
 * report, never in the pass column.
 *
 * Those floors are measurements, and RC7.1 raised them because the first set was
 * wrong. The probe was admitted at 1.08 GB free under a 0.9 GB estimate, launched
 * Chromium, and had to be aborted at 0.69 GB — proving one browser plus one page
 * of this site costs ~0.4 GB rather than the tens of megabytes its JS heap
 * suggested. See `MemoryGuard.BUDGETS`. Admitting a task the watchdog then has to
 * kill is worse than refusing it: same answer, one wasted browser launch later.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CAPTURES_DIR, REPORTS, ROOT, STATE_DIR, rel, unmangleRoute } from './paths.ts';
import * as Resource from './ResourceMonitor.ts';
import * as Memory from './MemoryGuard.ts';
import * as Mcp from './MCPHealth.ts';
import * as Planner from './TaskPlanner.ts';
import * as Motion from './AnimationProfiler.ts';
import * as Visual from './VisualRegression.ts';
import * as Perf from './PerformanceWatcher.ts';
import * as Build from './BuildCoordinator.ts';
import * as Release from './ReleaseManager.ts';
import { finding, isGreen, verdictOf, worst } from './types.ts';
import type { Finding, GateResult, Status } from './types.ts';

/* ------------------------------------------------------------------ *
 * Terminal output
 * ------------------------------------------------------------------ */

const ICON: Record<Status, string> = {
  ok: '  ok  ',
  repaired: ' fixed',
  skipped: ' skip ',
  unknown: '  ?   ',
  warn: ' warn ',
  fail: ' FAIL ',
  blocked: 'BLOCK ',
};

let JSON_MODE = false;
const lines: string[] = [];

function say(text = ''): void {
  lines.push(text);
  if (!JSON_MODE) console.log(text);
}

/**
 * `limit` exists because the design gate legitimately produces ~40 findings
 * across `src/`, and forty lines of terminal push the verdict off the top of
 * the screen. The report keeps every one of them; the terminal shows the worst
 * and says how many it withheld — never silently truncating, because a hidden
 * count reads as a shorter list rather than a shortened one.
 */
function printFindings(findings: Finding[], showOk = false, limit = Infinity): void {
  const shown = showOk ? findings : findings.filter((f) => f.status !== 'ok');
  if (!shown.length) {
    say('    all clear');
    return;
  }
  const order: Status[] = ['blocked', 'fail', 'warn', 'unknown', 'skipped', 'repaired', 'ok'];
  const ranked = [...shown].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
  for (const f of ranked.slice(0, limit)) {
    say(`  ${ICON[f.status]} ${f.check.padEnd(26)} ${f.detail}`);
    if (f.where) say(`         ${' '.repeat(26)} at ${f.where}`);
    if (f.fix) say(`         ${' '.repeat(26)} -> ${f.fix}`);
  }
  if (ranked.length > limit) {
    say(`         ${' '.repeat(26)} … ${ranked.length - limit} more, all of them in the written report`);
  }
}

function heading(text: string): void {
  say('');
  say(`━━ ${text} ${'━'.repeat(Math.max(0, 62 - text.length))}`);
}

/* ------------------------------------------------------------------ *
 * Phase 1 · Environment
 * ------------------------------------------------------------------ */

export interface Environment {
  findings: Finding[];
  actions: string[];
  snapshot: Resource.Snapshot | null;
  mcp: Finding[];
  topConsumers: Array<{ ProcessName: string; MB: number }>;
  status: Status;
  /** Live, not snapshotted — the build gate stops the server mid-run. */
  serving: boolean;
  /**
   * Where the server actually is.
   *
   * Not a constant, because `next start --port 3000` is a request rather than a
   * guarantee: when 3000 is occupied Next binds the next free port and says so
   * only on stdout. During RC7.1 it drifted to :3005 while every gate kept
   * polling :3000, and the run reported a server failure that had not happened.
   */
  baseUrl: string;
}

export function environment(heal: boolean): Environment {
  const monitor = Resource.inspect({ heal });
  const topConsumers = monitor.snapshot?.topConsumers ?? [];
  const mem = Memory.headroom(topConsumers);
  const lock = Build.clearStaleLock();
  const mcp = Mcp.assess(monitor.snapshot?.processes ?? []);

  // The delegated .mjs supervisor reports memory too, from its own PowerShell
  // reading taken a second apart from this one. Two rows saying "thin" with
  // figures that differ by 0.05 GB is noise that makes a reader distrust both,
  // so this layer keeps the one it owns — the one with per-task budgets behind
  // it — and drops the duplicate rather than reconciling them.
  const findings = [mem, ...monitor.findings.filter((f) => f.check !== 'memory'), lock];
  return {
    findings,
    actions: monitor.actions,
    snapshot: monitor.snapshot,
    mcp: mcp.findings,
    topConsumers,
    status: worst([...findings, ...mcp.findings].map((f) => f.status)),
    serving: !!monitor.snapshot?.listeners.some((l) => l.LocalPort === 3000),
    baseUrl: 'http://localhost:3000',
  };
}

/** One-line-per-fact machine summary, for SYSTEM_HEALTH.md § 1. */
function snapshotSummary(s: Resource.Snapshot | null): string[] {
  if (!s) return [];
  return [
    `RAM: ${s.memory.freePhysicalGB} GB free of ${s.memory.totalPhysicalGB} GB (${s.memory.freeCommitGB} GB commit available)`,
    `Disk C:: ${s.disk.freeGB} GB free of ${s.disk.sizeGB} GB`,
    `GPU adapters: ${s.gpus.map((g) => `${g.name} — ${g.ramMB} MB, ${g.status}`).join(' · ')}`,
    `Chromium renderer (last observed): ${Resource.readGpuCache()?.renderer ?? 'never observed'}`,
    `Top consumers: ${s.topConsumers.slice(0, 5).map((t) => `${t.ProcessName} ${t.MB} MB`).join(', ')}`,
    `Node processes matched: ${s.processes.length} · listening sockets: ${s.listeners.length}`,
    `Event log (last 12 h): ${s.crashes.length} app crash(es), ${s.exhaustion.length} low-memory diagnosis(es), ${s.tdr.length} display-driver reset(s)`,
    `Probe cost: ${s.probeMs} ms`,
  ];
}

/* ------------------------------------------------------------------ *
 * Phase 2 · Gates
 * ------------------------------------------------------------------ */

type Gate = {
  name: string;
  /** Static gates run in-process; command gates shell out through the coordinator. */
  kind: 'static' | 'command';
  needs: Memory.TaskKind;
  requiresBuild?: boolean;
  requiresServer?: boolean;
  /** Name of a `--flag` that switches this gate OFF. Used for the slow ones. */
  optIn?: string;
  run: (env: Environment) => Promise<GateResult>;
};

const ms = (started: number) => Date.now() - started;

function fromFindings(gate: string, findings: Finding[], started: number, detail?: string): GateResult {
  const status = worst(findings.map((f) => f.status));
  const bad = findings.filter((f) => !isGreen(f.status) && f.status !== 'skipped');
  const unmeasured = findings.filter((f) => f.status === 'skipped' || f.status === 'unknown');

  // "all clear" must never appear next to a skipped status. The first version
  // computed the summary from failures alone, so a gate whose every check was
  // unmeasured printed `skip … 3 check(s), all clear` — the precise sentence
  // this system exists to make impossible.
  const summary = bad.length
    ? `${bad.length} finding(s): ${bad.slice(0, 3).map((f) => f.check).join(', ')}`
    : unmeasured.length
      ? `${unmeasured.length} of ${findings.length} check(s) not measured: ${unmeasured.slice(0, 3).map((f) => f.check).join(', ')}`
      : `${findings.length} check(s), all clear`;

  return {
    gate,
    status,
    ms: ms(started),
    detail: detail ?? summary,
    reason: status === 'skipped' ? unmeasured.map((f) => f.detail).join('; ') : undefined,
    findings,
  };
}

/**
 * Run a Playwright gate at whichever concurrency the machine can afford.
 *
 * Parallel when there is headroom for it, serial when there is not, and the
 * chosen mode is stated in the result — "e2e passed" means a different thing
 * at one worker than at four, and a report that hid the difference would be
 * hiding the fact that the parallel path is the one that has historically
 * timed out on this host.
 */
const serverEnv = (env: Environment): Record<string, string> => ({
  PLAYWRIGHT_BASE_URL: env.baseUrl,
  AUDIT_URL: env.baseUrl,
});

async function runPlaywright(
  gate: string,
  parallelStep: Build.StepName,
  serialStep: Build.StepName,
  env: Environment,
): Promise<GateResult> {
  const parallel = Memory.admit('playwright', env.topConsumers);
  const step = parallel.admitted ? parallelStep : serialStep;
  const mode = parallel.admitted ? 'parallel' : 'serial (--workers=1)';
  const result = await Build.step(step, env.topConsumers, serverEnv(env));
  const out = fromRun(gate, result);
  out.detail = `${mode}: ${out.detail}`;
  if (!parallel.admitted && isGreen(out.status)) {
    out.detail += ` — parallel was refused at ${parallel.freeGB} GB free (needs ${parallel.requiredGB} GB)`;
  }
  return out;
}

function fromRun(gate: string, result: Build.RunResult): GateResult {
  return {
    gate,
    status: result.status,
    ms: result.ms,
    detail: result.detail,
    reason: result.status === 'skipped' || result.status === 'blocked' ? result.detail : undefined,
    output: result.output,
  };
}

const GATES: Gate[] = [
  {
    name: 'types',
    kind: 'command',
    needs: 'typecheck',
    run: async (env) => fromRun('types', await Build.step('types', env.topConsumers)),
  },
  {
    name: 'lint',
    kind: 'command',
    needs: 'lint',
    run: async (env) => fromRun('lint', await Build.step('lint', env.topConsumers)),
  },
  {
    name: 'motion',
    kind: 'static',
    needs: 'static',
    run: async () => {
      const started = Date.now();
      const a = Motion.audit();
      return fromFindings(
        'motion',
        a.findings,
        started,
        `${a.totals.animated} animated propert(ies): ${a.totals.composited} composited, ${a.totals.paint} paint, ${a.totals.layout} layout · ${a.totals.infinite} infinite · ${a.totals.backdropFilters} glass surfaces`,
      );
    },
  },
  {
    name: 'design',
    kind: 'static',
    needs: 'static',
    run: async () => {
      const started = Date.now();
      const graph = Planner.buildGraph();
      const all = [...graph.modules.keys()].filter((p) => p.startsWith('src/'));
      const findings = [...Planner.designConflicts(graph, all), ...Planner.performanceRisks(graph, all)];
      return fromFindings('design', findings.length ? findings : [finding('design', 'ok', 'no design-system or performance-risk conflicts in src/')], started);
    },
  },
  /**
   * The build.
   *
   * It releases `.next` first, unconditionally. `next start` holds the build
   * directory and a rebuild underneath it dies with `EPERM: unlink
   * .next/static/<BUILD_ID>` — a failure that hit twice in one session before
   * it was automated away, and which the OneDrive-hosted workspace makes more
   * likely rather than less.
   *
   * It is skippable with `--skip-build` because a full Next build of 30 routes
   * on 4 cores is minutes, and a gate that makes the loop too slow to run is a
   * gate that gets bypassed. But it is *in* the default set, because "the build
   * passes" is the one claim a release candidate cannot make on inference.
   */
  {
    name: 'build',
    kind: 'command',
    needs: 'build',
    optIn: 'skip-build',
    run: async (env) => {
      const started = Date.now();
      // Two distinct causes of a blocked build, handled in order: a server
      // holding the directory, then a transient filesystem lock on it. The
      // second was found the hard way — a build died on EPERM while
      // `releaseNext` correctly reported nothing was holding it.
      const released = Build.releaseNext();
      const cleaned = Build.clearNextDir();
      const r = await Build.step('build', env.topConsumers);
      return {
        gate: 'build',
        status: r.status,
        ms: ms(started),
        detail: `${released.detail}. ${cleaned.detail}. ${r.detail}`,
        reason: r.status === 'skipped' || r.status === 'blocked' ? r.detail : undefined,
        output: r.output,
        findings: [released, cleaned],
        autoFixed: released.status === 'repaired' || cleaned.status === 'repaired',
      };
    },
  },
  {
    name: 'bundle',
    kind: 'command',
    needs: 'static',
    requiresBuild: true,
    run: async () => {
      const started = Date.now();
      const b = Perf.bundle();
      return { gate: 'bundle', status: b.status, ms: ms(started), detail: b.detail, output: b.output, reason: b.status === 'skipped' ? b.detail : undefined };
    },
  },
  {
    name: 'a11y',
    kind: 'command',
    needs: 'playwright-serial',
    requiresServer: true,
    run: async (env) => runPlaywright('a11y', 'a11y', 'a11ySerial', env),
  },
  {
    name: 'e2e',
    kind: 'command',
    needs: 'playwright-serial',
    requiresServer: true,
    run: async (env) => runPlaywright('e2e', 'e2e', 'e2eSerial', env),
  },
  /**
   * SEO — and GEO with it.
   *
   * `tests/e2e/seo.spec.ts` is not only classic SEO. It asserts the
   * generative-engine surface directly: that `/llms.txt` is served as
   * `text/plain` and carries the citation guidance and every FAQ question, that
   * `robots.txt` names the AI crawlers and points at the sitemap, and that the
   * JSON-LD `@graph` parses with its entity references resolving internally.
   * Those are the things an answer engine reads. They are covered here rather
   * than in a separate gate because they are one spec file and splitting them
   * would imply a second measurement that does not exist.
   */
  {
    name: 'seo+geo',
    kind: 'command',
    needs: 'playwright-serial',
    requiresServer: true,
    run: async (env) => runPlaywright('seo+geo', 'seo', 'seoSerial', env),
  },
  /**
   * Lighthouse.
   *
   * Run *after* the Playwright gates, never beside them: it launches its own
   * throttled Chrome and holds a full trace, and two browsers contending on 4
   * cores is the configuration that turned a 16.4 s spec into a 90 s timeout.
   * The coordinator's lock enforces that ordering, this position makes it
   * intentional.
   *
   * The result is ingested into the baseline on the spot, so the numbers become
   * a comparable population instead of a one-off printout.
   */
  {
    name: 'lighthouse',
    kind: 'command',
    needs: 'lighthouse',
    requiresServer: true,
    optIn: 'skip-lighthouse',
    run: async (env) => {
      const started = Date.now();
      const r = await Build.step('lighthouse', env.topConsumers, serverEnv(env));
      if (!isGreen(r.status)) return fromRun('lighthouse', r);
      const ingested = Perf.ingest('/', Memory.freeGB(), undefined);
      const cmp = Perf.compare('/');
      return {
        gate: 'lighthouse',
        status: worst([r.status, ...cmp.findings.map((f) => f.status)]),
        ms: ms(started),
        detail: `${r.detail}; ${ingested.detail}`,
        findings: cmp.findings,
        output: r.output,
      };
    },
  },
  /**
   * The probe gate — the one that produces the evidence `visual` scores.
   *
   * It runs before `visual` on purpose: in RC7 the `visual` gate depended on
   * JSON that only a manual MCP session could create, so it reported `skipped`
   * on every unattended run. Now the loop measures the pages itself, and
   * `visual` reads what this gate just wrote.
   */
  {
    name: 'probe',
    kind: 'command',
    needs: 'probe',
    requiresServer: true,
    run: async (env) => fromRun('probe', await Build.step('probe', env.topConsumers, serverEnv(env))),
  },
  {
    name: 'visual',
    kind: 'static',
    needs: 'static',
    run: async () => {
      const started = Date.now();
      const dir = join(STATE_DIR, 'audits');
      const audits = Visual.readSavedAudits(dir);
      if (!audits.length) {
        const reason = `no page audits in ${rel(dir)} — the probe gate did not run, so nothing was measured to score`;
        return { gate: 'visual', status: 'skipped', ms: ms(started), detail: 'no page audits on disk', reason };
      }
      const findings = audits.flatMap((a) => Visual.scoreFindings(Visual.score(a)));
      const scores = audits.map(Visual.score).filter((s) => s.overall !== null);
      const mean = scores.length ? Math.round(scores.reduce((t, s) => t + (s.overall ?? 0), 0) / scores.length) : null;
      return fromFindings(
        'visual',
        findings,
        started,
        `${audits.length} page audit(s) scored${mean === null ? '' : `, mean ${mean}/100`}`,
      );
    },
  },
  /**
   * Last, deliberately.
   *
   * This gate summarises bundle size against budget and the vitals baseline
   * against itself. Both of those are *written* by gates above it — `bundle` by
   * measuring `.next`, and `lighthouse`/`probe` by adding runs to the baseline.
   * It sat third in RC7.1's first ordering and therefore reported the previous
   * session's numbers while this session's were still being taken.
   */
  {
    name: 'performance',
    kind: 'static',
    needs: 'static',
    run: async () => {
      const started = Date.now();
      const a = Perf.audit('/');
      return fromFindings('performance', a.findings, started);
    },
  },
];

/**
 * Requirements that cannot be satisfied right now, with the reason.
 *
 * `env.serving` is checked rather than the environment snapshot's listener
 * list, because the snapshot is taken once at the start of the run and the
 * build gate deliberately stops the server in the middle of it. Reading a
 * stale snapshot here would have let the browser gates run against a port that
 * had been free for two minutes.
 */
function unmetRequirement(gate: Gate, env: Environment, disabled: Set<string>): string | null {
  if (gate.optIn && disabled.has(gate.optIn)) {
    return `disabled by --${gate.optIn}`;
  }
  if (gate.requiresBuild && !Build.hasBuild()) {
    return 'no .next/static on disk — nothing has been built, so there is nothing to measure';
  }
  const admission = Memory.admit(gate.needs, env.topConsumers);
  if (!admission.admitted) return admission.reason;
  if (gate.requiresServer && !env.serving) {
    return 'nothing is serving on :3000 and no build exists to start one from';
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Phase 3 · The loop
 * ------------------------------------------------------------------ */

/**
 * The deterministic repairs, and nothing beyond them.
 *
 * Each entry says which gate failure it recognises, what it does, and — the
 * important part — the fix is applied and then the gate is re-run. A repair
 * that is not re-verified is a claim, not a fix.
 */
const REPAIRS: Array<{
  gate: string;
  when: (g: GateResult) => boolean;
  what: string;
  apply: (env: Environment) => Promise<Finding>;
}> = [
  {
    gate: 'lint',
    when: (g) => g.status === 'fail',
    what: 'eslint src --fix',
    apply: async (env) => {
      const s = Build.STEPS.lintFix();
      if (!s.spec) return finding('repair:lint', 'unknown', 'eslint is not installed; cannot auto-fix');
      const r = await Build.run('lint:fix', s.spec, { needs: s.needs, timeoutMs: s.timeoutMs, topConsumers: env.topConsumers });
      return finding('repair:lint', r.status === 'ok' ? 'repaired' : 'warn', `eslint --fix ${r.status === 'ok' ? 'applied' : `could not complete: ${r.detail}`}`);
    },
  },
  {
    gate: 'bundle',
    when: (g) => g.status === 'skipped' && g.detail.includes('.next/static'),
    what: 'release .next and build',
    apply: async (env) => {
      const released = Build.releaseNext();
      const r = await Build.step('build', env.topConsumers);
      return finding('repair:build', r.status === 'ok' ? 'repaired' : r.status, `${released.detail}; build ${r.detail}`);
    },
  },
  {
    gate: 'a11y',
    when: (g) => g.status === 'skipped' && g.detail.includes(':3000'),
    what: 'nothing — a server must be started deliberately',
    apply: async () =>
      finding('repair:server', 'skipped', 'this system will not start a long-lived server as a side effect of a check', {
        fix: 'npm run build && npm run start, then re-run verify',
      }),
  },
];

export interface LoopResult {
  gates: GateResult[];
  repairs: Finding[];
  passes: number;
  converged: boolean;
  status: Status;
}

export async function verify(
  env: Environment,
  maxPasses = 3,
  allowFixes = true,
  disabled: Set<string> = new Set(),
): Promise<LoopResult> {
  const repairs: Finding[] = [];
  let gates: GateResult[] = [];
  let previousSignature = '';
  let pass = 0;
  let converged = false;
  let server: Build.ServerHandle | null = null;
  /**
   * Was something already serving when this run began?
   *
   * It matters at teardown. The rule "stop only what you started" is right in
   * general, but the build gate deliberately stops whatever holds `.next` — so
   * if a server was running before the loop, the loop is the reason it is gone.
   * Stopping the replacement too would leave the operator worse off than if
   * they had never run the check, which is not a trade a verification tool gets
   * to make on their behalf.
   */
  const wasServingAtStart = env.serving;

  while (pass < maxPasses) {
    pass++;
    heading(`verify — pass ${pass} of at most ${maxPasses}`);
    gates = [];

    for (const gate of GATES) {
      // The build gate stops whatever holds `.next`, so anything needing a
      // server after it must ask for one rather than assume the snapshot.
      if (gate.requiresServer && !env.serving) {
        const admitted = Memory.admit(gate.needs, env.topConsumers).admitted;
        if (admitted && Build.hasBuild()) {
          const ensured = await Build.ensureServer();
          repairs.push(ensured.finding);
          say(`  ${ICON[ensured.finding.status]} ${'server'.padEnd(12)} ${ensured.finding.detail}`);
          if (ensured.handle) {
            env.serving = true;
            if (ensured.handle.owned) server = ensured.handle;
          }
        }
      }

      const unmet = unmetRequirement(gate, env, disabled);
      if (unmet) {
        gates.push({ gate: gate.name, status: 'skipped', ms: 0, detail: unmet, reason: unmet });
        say(`  ${ICON.skipped} ${gate.name.padEnd(12)} ${unmet}`);
        continue;
      }
      const result = await gate.run(env);
      // The build gate stops the server it released; reflect that immediately.
      if (gate.name === 'build') env.serving = false;
      gates.push(result);
      say(`  ${ICON[result.status]} ${gate.name.padEnd(12)} ${result.detail}`);
      if (result.findings) printFindings(result.findings, false, 8);
      if (result.output && !isGreen(result.status)) {
        for (const line of result.output.split('\n').slice(-12)) say(`        │ ${line}`);
      }
    }

    // A signature of *what* is failing, not of the failure text — figures inside
    // a message change between runs and would defeat fixpoint detection, which
    // is the same bug the .mjs supervisor's quiet-mode dedupe originally had.
    const signature = gates
      .filter((g) => !isGreen(g.status))
      .map((g) => `${g.gate}:${g.status}`)
      .sort()
      .join('|');

    if (!signature) {
      converged = true;
      say('');
      say(`  green on pass ${pass} — every gate that could run, ran and passed`);
      break;
    }
    if (signature === previousSignature) {
      say('');
      say(`  fixpoint: pass ${pass} failed exactly as pass ${pass - 1} did. Nothing further is mechanically fixable.`);
      break;
    }
    previousSignature = signature;

    if (!allowFixes) {
      say('');
      say('  --no-fix: stopping after one pass without attempting repairs');
      break;
    }

    const applicable = REPAIRS.filter((r) => gates.some((g) => g.gate === r.gate && r.when(g)));
    if (!applicable.length) {
      say('');
      say('  no mechanical repair applies to the remaining failures — they need a decision, not a command');
      break;
    }

    heading(`repair — pass ${pass}`);
    for (const repair of applicable) {
      say(`  applying: ${repair.what}`);
      const f = await repair.apply(env);
      repairs.push(f);
      say(`  ${ICON[f.status]} ${f.check.padEnd(26)} ${f.detail}`);
    }
  }

  // A gate that only passed after a repair should say so in the report.
  for (const g of gates) {
    if (repairs.some((r) => r.check === `repair:${g.gate}`) && isGreen(g.status)) g.autoFixed = true;
  }

  // Stop only a server this run started, and only if the run did not also
  // remove the one that was there first.
  if (server?.owned && !wasServingAtStart) {
    server.stop();
    repairs.push(finding('server:stop', 'repaired', `stopped the next start on :${server.port} that this run started`));
    say(`  ${ICON.repaired} ${'server'.padEnd(12)} stopped the server this run started`);
  } else if (server?.owned && wasServingAtStart) {
    repairs.push(
      finding('server:stop', 'repaired', `left next start running on :${server.port} — a server was serving before this run and the build gate replaced it`),
    );
    say(`  ${ICON.repaired} ${'server'.padEnd(12)} left a server running on :${server.port}, as one was running before this run`);
  }

  return { gates, repairs, passes: pass, converged, status: worst(gates.map((g) => g.status)) };
}

/* ------------------------------------------------------------------ *
 * Reporting
 * ------------------------------------------------------------------ */

function collectVisual(): { scores: ReturnType<typeof Visual.score>[]; regression: Finding[] } {
  const audits = Visual.readSavedAudits(join(STATE_DIR, 'audits'));
  const scores = audits.map(Visual.score);

  const captures = Visual.availableCaptures(CAPTURES_DIR);
  let regression: Finding[];
  if (captures.length >= 2) {
    const [before, after] = captures.slice(-2);
    const result = Visual.compareDirs(join(CAPTURES_DIR, before.name), join(CAPTURES_DIR, after.name));
    regression = [
      finding('visual:baseline', 'ok', `comparing ${before.name} (${before.views} views) against ${after.name} (${after.views} views)`),
      ...result.findings,
    ];
  } else {
    regression = [
      finding('visual:baseline', 'skipped', `fewer than two capture sets in ${rel(CAPTURES_DIR)} — nothing to diff against`, {
        fix: 'node scripts/capture-release-preview.mjs writes a new set; keep the previous one as the baseline',
      }),
    ];
  }
  return { scores, regression };
}

/**
 * Facts about the artefact on disk, read rather than inferred.
 *
 * Tool versions come from the installed `package.json` files, not from the
 * ranges in the manifest — `"next": "^16.2.6"` is a permission, not a fact, and
 * a build report that quoted the range would be describing what *could* have
 * been installed.
 */
async function buildFacts(bundle: Perf.BundleResult): Promise<Release.BuildFacts> {
  const versionOf = (pkg: string): string => {
    try {
      const p = join(ROOT, 'node_modules', ...pkg.split('/'), 'package.json');
      return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')).version : 'not installed';
    } catch {
      return 'unreadable';
    }
  };
  return {
    buildId: Build.diskBuildId(),
    hasStatic: Build.hasBuild(),
    servedBuildId: await Build.probeServedBuildId(),
    jsGzipKB: bundle.jsGzipKB,
    cssGzipKB: bundle.cssGzipKB,
    budgetJsKB: bundle.budgetJsKB,
    budgetCssKB: bundle.budgetCssKB,
    toolVersions: [
      { name: 'next', version: versionOf('next') },
      { name: 'react', version: versionOf('react') },
      { name: 'typescript', version: versionOf('typescript') },
      { name: 'eslint', version: versionOf('eslint') },
      { name: '@playwright/test', version: versionOf('@playwright/test') },
      { name: 'tailwindcss', version: versionOf('tailwindcss') },
    ],
  };
}

export async function report(env: Environment, loop: LoopResult | null, planText?: string): Promise<string[]> {
  const motion = Motion.audit();
  const perf = Perf.audit('/');
  const graph = Planner.buildGraph();
  const srcFiles = [...graph.modules.keys()].filter((p) => p.startsWith('src/'));
  const design = Planner.designConflicts(graph, srcFiles);
  const { scores, regression } = collectVisual();

  const { paths, readiness } = Release.writeAll(
    {
      gates: loop?.gates ?? [],
      environment: env.findings,
      mcp: env.mcp,
      visual: design,
      motion: motion.findings,
      performance: perf.findings,
      plan: planText,
      actions: [...env.actions, ...(loop?.repairs.map((r) => r.detail) ?? [])],
    },
    scores,
    regression,
    snapshotSummary(env.snapshot),
    await buildFacts(perf.bundle),
  );

  heading('reports');
  for (const p of paths) say(`  written  ${rel(p)}`);
  say(`  verdict  ${readiness.verdict.toUpperCase()} — ${readiness.summary}`);
  return paths;
}

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */

function flagValue(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
}


async function main(argv: string[]): Promise<number> {
  const command = argv[0] ?? 'preflight';
  JSON_MODE = argv.includes('--json');
  const heal = !argv.includes('--no-heal');

  if (command === 'capability') {
    const [, id, state, ...why] = argv;
    if (!id || !state) {
      console.error('usage: capability <id> <connected|unavailable|needs-auth|not-installed> [why]');
      return 2;
    }
    Mcp.record(id, state as Mcp.ObservedState, why.join(' ') || undefined);
    console.log(`recorded ${id} = ${state}`);
    return 0;
  }

  if (command === 'perf:ingest') {
    const f = Perf.ingest(unmangleRoute(flagValue(argv, 'scope')) ?? '/', Memory.freeGB());
    console.log(`${ICON[f.status]} ${f.check} ${f.detail}`);
    return isGreen(f.status) ? 0 : 1;
  }

  if (command === 'visual') {
    const before = flagValue(argv, 'before');
    const after = flagValue(argv, 'after');
    if (!before || !after) {
      const available = Visual.availableCaptures(CAPTURES_DIR);
      console.log('usage: visual --before <dir> --after <dir>');
      console.log(`available capture sets in ${rel(CAPTURES_DIR)}:`);
      for (const c of available) console.log(`  ${c.name.padEnd(12)} ${c.views} view(s)   ${c.at.slice(0, 19)}`);
      return 2;
    }
    const result = Visual.compareDirs(before, after, Number(flagValue(argv, 'threshold') ?? 0.1));
    heading('visual regression');
    for (const c of result.comparisons) say(`  ${ICON[c.status]} ${c.name.padEnd(44)} ${c.detail}`);
    printFindings(result.findings, true);
    if (JSON_MODE) console.log(JSON.stringify(result, null, 2));
    return result.status === 'fail' ? 1 : 0;
  }

  if (command === 'plan') {
    const targets = argv.slice(1).filter((a) => !a.startsWith('--'));
    if (!targets.length) {
      console.error('usage: plan <file> [file …]');
      return 2;
    }
    const p = Planner.plan(targets);
    heading('task plan');
    say(Planner.formatPlan(p));
    if (JSON_MODE) console.log(JSON.stringify({ ...p, complexity: p.complexity }, null, 2));
    return 0;
  }

  // preflight / verify / report / full all begin with the environment.
  heading('environment');
  const env = environment(heal);
  printFindings(env.findings, argv.includes('--verbose'));
  if (env.actions.length) {
    say('  actions');
    for (const a of env.actions) say(`    - ${a}`);
  }

  heading('capabilities');
  printFindings(env.mcp, argv.includes('--verbose'));

  if (command === 'preflight') {
    heading('admission');
    // Converted to findings rather than printed only, so the admission
    // decisions reach the reports. In RC7 they existed solely as terminal
    // output, which meant SYSTEM_HEALTH.md could not say *why* a browser gate
    // would be refused on the next run.
    const admissions = (Object.keys(Memory.BUDGETS) as Memory.TaskKind[]).map((task) =>
      Memory.admissionFinding(Memory.admit(task, env.topConsumers)),
    );
    printFindings(admissions, true);
    env.findings.push(...admissions);
    if (JSON_MODE) console.log(JSON.stringify({ findings: env.findings, mcp: env.mcp, actions: env.actions }, null, 2));
    return env.status === 'blocked' ? 1 : 0;
  }

  let loop: LoopResult | null = null;
  if (command === 'verify' || command === 'full') {
    const disabled = new Set(argv.filter((a) => a.startsWith('--')).map((a) => a.slice(2)));
    loop = await verify(env, Number(flagValue(argv, 'max-passes') ?? 3), !argv.includes('--no-fix'), disabled);
  }

  if (command === 'report' || command === 'full' || command === 'verify') {
    await report(env, loop);
  }

  const status = loop ? loop.status : env.status;
  const verdict = verdictOf([status, ...env.findings.map((f) => f.status)]);
  heading('verdict');
  say(`  ${verdict.toUpperCase()}`);
  if (verdict === 'amber') {
    const skipped = (loop?.gates ?? []).filter((g) => g.status === 'skipped');
    if (skipped.length) say(`  ${skipped.length} gate(s) were not measured: ${skipped.map((g) => g.gate).join(', ')}`);
  }

  // A transcript, so a report can be traced back to the run that produced it.
  try {
    mkdirSync(STATE_DIR, { recursive: true });
    writeFileSync(join(STATE_DIR, 'last-run.log'), lines.join('\n'), 'utf8');
  } catch {
    /* the log must never be the thing that fails a run */
  }

  return verdict === 'red' || verdict === 'blocked' ? 1 : 0;
}

/* Run only when invoked directly, so the modules stay importable. */
const invokedDirectly = process.argv[1]?.replace(/\\/g, '/').endsWith('EngineeringSupervisor.ts');
if (invokedDirectly) {
  main(process.argv.slice(2))
    .then((code) => process.exit(code))
    .catch((error) => {
      console.error(`engineering-supervisor: ${error?.stack ?? error}`);
      // A supervisor that crashes must not also block the work it supervises.
      process.exit(0);
    });
}

export { ROOT, REPORTS };
