/**
 * BuildCoordinator — one heavy thing at a time, and never into a wall.
 *
 * ## The two rules this enforces, both bought with an incident
 *
 * **1. Serialise.** ENVIRONMENT_STATUS § 5 records it as a standing risk in one
 * line: "Serialise heavy work: build → test → capture, never concurrently, and
 * never with the MCP browser open alongside the runner." That is not caution.
 * It was measured: the a11y smoke spec took 16.4 s alone and timed out at 90 s
 * with the Playwright MCP browser open — same test, same server, same build. A
 * lock file is the only thing that makes that rule survive two terminals.
 *
 * **2. Release `.next` before building.** `next start` holds the build
 * directory, and `npm run build` then dies with `EPERM: unlink
 * .next/static/<BUILD_ID>`. That failure hit twice in one session before it was
 * automated away, and the workspace sitting inside OneDrive — which takes its
 * own file handles during sync — makes it more likely, not less.
 *
 * ## Why it aborts a running command
 *
 * Admission control answers the question at t=0. The RC6 crashes happened at
 * t≈7 min, across three separately-launched workers, each entering a machine
 * that had degraded since the run began. So every command here runs under a
 * `MemoryGuard.watch`, and crossing the blocking floor mid-run kills the child
 * *before* Chromium raises `0xE0000008`. Killing a build costs a build. Letting
 * it OOM cost the build, the browser, and the artifacts that would have
 * explained it.
 */

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet } from 'node:http';
import { join } from 'node:path';
import { ROOT, STATE_DIR, SUPERVISOR_SCRIPT } from './paths.ts';
import { ABORT_ON_FLOOR, BLOCK_FREE_GB, admit, watch } from './MemoryGuard.ts';
import type { TaskKind } from './MemoryGuard.ts';
import { finding, tail } from './types.ts';
import type { Finding, Status } from './types.ts';

/* ------------------------------------------------------------------ *
 * The lock
 * ------------------------------------------------------------------ */

interface Lock {
  pid: number;
  task: string;
  startedAt: string;
}

const LOCK_PATH = () => join(STATE_DIR, 'coordinator.lock');

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error: any) {
    return error?.code === 'EPERM'; // exists but owned by another user
  }
}

export function readLock(): Lock | null {
  const p = LOCK_PATH();
  if (!existsSync(p)) return null;
  try {
    const lock = JSON.parse(readFileSync(p, 'utf8')) as Lock;
    // A lock whose holder is gone is debris from a crash, not a claim. Clearing
    // it is safe precisely because the process it named no longer exists.
    if (!alive(lock.pid)) {
      rmSync(p, { force: true });
      return null;
    }
    return lock;
  } catch {
    rmSync(p, { force: true });
    return null;
  }
}

function acquire(task: string): { ok: boolean; heldBy?: Lock } {
  const held = readLock();
  if (held) return { ok: false, heldBy: held };
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(LOCK_PATH(), JSON.stringify({ pid: process.pid, task, startedAt: new Date().toISOString() }, null, 2));
  return { ok: true };
}

function release(): void {
  const held = readLock();
  if (held && held.pid === process.pid) rmSync(LOCK_PATH(), { force: true });
}

/* ------------------------------------------------------------------ *
 * Running a command
 * ------------------------------------------------------------------ */

export interface RunOptions {
  /** Which memory budget applies. Drives admission and the abort floor. */
  needs: TaskKind;
  /** Milliseconds. A command that exceeds it is killed and reported as failed. */
  timeoutMs?: number;
  /** Skip the serialisation lock — only for read-only commands. */
  concurrent?: boolean;
  env?: Record<string, string>;
  topConsumers?: Array<{ ProcessName: string; MB: number }>;
}

export interface RunResult {
  name: string;
  command: string;
  status: Status;
  exitCode: number | null;
  ms: number;
  output: string;
  detail: string;
  /** Set when the run was stopped because free memory crossed the floor. */
  abortedForMemory?: boolean;
  minFreeGB?: number;
}

/**
 * Every command is a Node process invoked directly. No shell, ever.
 *
 * The obvious implementation is `npm run <script>`, and it was the first one
 * here. On Windows that means spawning `npm.cmd`, which Node will not do
 * without `shell: true` — and `shell: true` with an argument array emits
 * DEP0190, because the arguments are concatenated into a command line rather
 * than escaped. That deprecation is pointing at a real hazard: any argument
 * containing a space, a quote or an `&` would be reinterpreted by cmd.exe.
 *
 * Resolving each tool's JavaScript entry point and running it through
 * `process.execPath` removes the shell from the picture entirely. The argument
 * vector reaches the child exactly as written, and one process is saved per
 * step besides — npm would otherwise fork a shell, which forks the tool.
 *
 * The cost is a dependency on `node_modules` layout, which is why `resolveBin`
 * checks the file exists and returns a legible failure instead of a spawn error
 * three frames deep.
 */
const BINARIES = {
  eslint: join('node_modules', 'eslint', 'bin', 'eslint.js'),
  next: join('node_modules', 'next', 'dist', 'bin', 'next'),
  playwright: join('node_modules', '@playwright', 'test', 'cli.js'),
  tsc: join('node_modules', 'typescript', 'bin', 'tsc'),
};

export type BinaryName = keyof typeof BINARIES;

/**
 * Absolute paths, and that is load-bearing — not a style preference.
 *
 * `scripts/session-supervisor.mjs` decides whether a process belongs to this
 * project by testing its command line for the workspace path, and it kills
 * :3000 listeners that fail that test as "foreign". Spawning with a relative
 * path produces a command line like
 *
 *   "C:\Program Files\nodejs\node.exe" node_modules\next\dist\bin\next start
 *
 * which contains no workspace path at all. Every child this coordinator spawned
 * was therefore invisible to `isOurs()` — and during the RC7.1 verification run
 * the per-prompt hook did exactly what it was built to do and killed the
 * pipeline's own `next start` (pid 9460) mid-suite, between the accessibility
 * gate and the e2e gate.
 *
 * The two layers were each correct in isolation. The bug was that this one did
 * not identify itself in a way the other could recognise. An absolute path
 * fixes it at the source and makes every gate process self-identifying in any
 * process listing, which is worth having regardless.
 */
export function resolveBin(name: BinaryName): string | null {
  const p = join(ROOT, BINARIES[name]);
  return existsSync(p) ? p : null;
}

export function binCommand(name: BinaryName, args: string[]): { cmd: string; args: string[]; shell: boolean } | null {
  const bin = resolveBin(name);
  return bin ? { cmd: process.execPath, args: [bin, ...args], shell: false } : null;
}

export function nodeScript(relPath: string, args: string[] = []): { cmd: string; args: string[]; shell: boolean } {
  return { cmd: process.execPath, args: [join(ROOT, relPath), ...args], shell: false };
}

export async function run(
  name: string,
  spec: { cmd: string; args: string[]; shell?: boolean },
  options: RunOptions,
): Promise<RunResult> {
  const commandText = `${spec.cmd} ${spec.args.join(' ')}`;

  // 1 · Admission. A refusal is a result, and it is `skipped`, never `ok`.
  const admission = admit(options.needs, options.topConsumers ?? []);
  if (!admission.admitted) {
    return {
      name,
      command: commandText,
      status: admission.freeGB < 0.8 ? 'blocked' : 'skipped',
      exitCode: null,
      ms: 0,
      output: '',
      detail: admission.reason,
    };
  }

  // 2 · Serialisation.
  let locked = false;
  if (!options.concurrent) {
    const got = acquire(name);
    if (!got.ok) {
      return {
        name,
        command: commandText,
        status: 'skipped',
        exitCode: null,
        ms: 0,
        output: '',
        detail: `another heavy task holds the coordinator lock: "${got.heldBy!.task}" (pid ${got.heldBy!.pid}, since ${got.heldBy!.startedAt.slice(11, 19)}Z). Running both concurrently is what turns a 16 s spec into a 90 s timeout.`,
      };
    }
    locked = true;
  }

  const started = Date.now();
  let abortedForMemory = false;

  try {
    return await new Promise<RunResult>((resolve) => {
      const child = spawn(spec.cmd, spec.args, {
        cwd: ROOT,
        shell: spec.shell ?? false,
        windowsHide: true,
        env: { ...process.env, ...options.env },
      });

      let out = '';
      const capture = (chunk: Buffer) => {
        out += chunk.toString();
        // Bound the buffer: a Next build is verbose and this must not become a
        // memory consumer in a module about not consuming memory.
        if (out.length > 512 * 1024) out = out.slice(-256 * 1024);
      };
      child.stdout?.on('data', capture);
      child.stderr?.on('data', capture);

      // Only browser-launching tasks are aborted on the floor. Everything else
      // is watched for its low-water mark and left alone — see the note on
      // ABORT_ON_FLOOR for why killing a type-check on a memory dip is a
      // strictly worse outcome than letting it page.
      const floor = ABORT_ON_FLOOR.includes(options.needs) ? BLOCK_FREE_GB : null;
      const memory = watch(
        (free) => {
          abortedForMemory = true;
          out += `\n[BuildCoordinator] free memory crossed the floor at ${free} GB — aborting before the allocation fails.\n`;
          child.kill('SIGKILL');
        },
        2000,
        floor,
      );

      const timer = options.timeoutMs
        ? setTimeout(() => {
            out += `\n[BuildCoordinator] timed out after ${options.timeoutMs} ms\n`;
            child.kill('SIGKILL');
          }, options.timeoutMs)
        : null;

      child.on('error', (error) => {
        if (timer) clearTimeout(timer);
        const w = memory.stop();
        resolve({
          name,
          command: commandText,
          status: 'fail',
          exitCode: null,
          ms: Date.now() - started,
          output: tail(out),
          detail: `could not start: ${error.message}`,
          minFreeGB: w.minFreeGB,
        });
      });

      child.on('close', (code) => {
        if (timer) clearTimeout(timer);
        const w = memory.stop();
        const status: Status = abortedForMemory ? 'blocked' : code === 0 ? 'ok' : 'fail';
        resolve({
          name,
          command: commandText,
          status,
          exitCode: code,
          ms: Date.now() - started,
          output: tail(out),
          detail: abortedForMemory
            ? `aborted: free memory fell to ${w.minFreeGB} GB mid-run, below the 0.8 GB floor`
            : code === 0
              ? `passed in ${((Date.now() - started) / 1000).toFixed(1)} s (min free ${w.minFreeGB} GB)`
              : `exited ${code} after ${((Date.now() - started) / 1000).toFixed(1)} s`,
          abortedForMemory,
          minFreeGB: w.minFreeGB,
        });
      });
    });
  } finally {
    if (locked) release();
  }
}

/* ------------------------------------------------------------------ *
 * Build preparation
 * ------------------------------------------------------------------ */

/**
 * Stop whatever holds `.next`, so the build does not die on `EPERM: unlink`.
 *
 * Delegated to the .mjs supervisor's `--release-next`, which already knows how
 * to identify the holder by command line rather than by killing every Node
 * process — a distinction that matters, because six of the ten Node processes
 * during RC6.1 were the agent's own MCP servers.
 */
export function releaseNext(): Finding {
  if (!existsSync(SUPERVISOR_SCRIPT)) {
    return finding('build:next-lock', 'unknown', 'session-supervisor.mjs is missing; cannot release .next automatically');
  }
  const res = spawnSync(process.execPath, ['scripts/session-supervisor.mjs', '--release-next', '--json'], {
    cwd: ROOT,
    encoding: 'utf8',
    windowsHide: true,
  });
  const out = String(res.stdout ?? '');
  try {
    const parsed = JSON.parse(out);
    const actions: string[] = parsed.actions ?? [];
    const stopped = actions.filter((a) => a.includes('releasing .next'));
    return stopped.length
      ? finding('build:next-lock', 'repaired', `released .next: ${stopped.join('; ')}`)
      : finding('build:next-lock', 'ok', '.next was not held; the build can write freely');
  } catch {
    return finding('build:next-lock', 'unknown', `could not read the supervisor's response: ${tail(out, 4)}`);
  }
}

/**
 * Remove `.next` before a build, tolerating a transient lock.
 *
 * `releaseNext` handles the *known* holder: a `next start` process. It is not
 * enough. During RC7.1 a build failed in 5.5 s with
 *
 *   EPERM: operation not permitted, unlink '.next/static/P-xMe4owaKDqTUbWVL6-z'
 *
 * while `releaseNext` correctly reported `.next was not held` — no server owned
 * it, and no project process was alive at all. Seconds later the same directory
 * deleted without complaint on the second attempt.
 *
 * That is a transient handle, and this workspace has a standing reason for one:
 * it lives inside OneDrive, which takes handles on files it is syncing
 * (ENVIRONMENT_STATUS § 5, risk 4). A killed build leaves freshly-written
 * chunks for OneDrive to pick up at exactly the moment the next build wants to
 * delete them.
 *
 * So the retry is not papering over a race — it is the correct response to a
 * lock held by a process that will release it on its own and that we must not
 * kill. Deleting the whole directory rather than letting Next unlink file by
 * file also shrinks the window: one operation instead of thousands.
 */
export function clearNextDir(attempts = 4): Finding {
  const dir = join(ROOT, '.next');
  if (!existsSync(dir)) return finding('build:clean', 'ok', '.next absent — the build starts from nothing');

  const errors: string[] = [];
  for (let i = 1; i <= attempts; i++) {
    try {
      rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 250 });
      if (!existsSync(dir)) {
        return finding(
          'build:clean',
          i === 1 ? 'ok' : 'repaired',
          i === 1 ? 'removed .next before building' : `removed .next before building, on attempt ${i} of ${attempts} (a transient lock cleared)`,
          { evidence: { attempts: i, errors } },
        );
      }
    } catch (error: any) {
      errors.push(`attempt ${i}: ${error?.code ?? ''} ${error?.message ?? error}`.trim());
      // Give whatever holds it — OneDrive, an antivirus scan — time to let go.
      const until = Date.now() + 750;
      while (Date.now() < until) {
        /* spin: this must stay synchronous, and the wait is sub-second */
      }
    }
  }
  return finding('build:clean', 'warn', `could not remove .next after ${attempts} attempts — the build will try to unlink file by file and may hit EPERM`, {
    fix: 'a handle is held outside this project. OneDrive is the usual cause on this host; pausing sync releases it.',
    evidence: errors,
  });
}

/* ------------------------------------------------------------------ *
 * The standard pipeline steps
 * ------------------------------------------------------------------ */

/**
 * Each step mirrors the npm script of the same name in `package.json`, but
 * spawns the tool directly. `tsc --noEmit` is `npm run type-check`; `eslint src`
 * is `npm run lint`; the Playwright steps carry the same project filter the
 * scripts do. Where a step wraps one of this repo's own `.mjs` scripts, it runs
 * that file rather than reimplementing it.
 */
export const STEPS = {
  types: () => ({ spec: binCommand('tsc', ['--noEmit']), needs: 'typecheck' as TaskKind, timeoutMs: 300_000 }),
  lint: () => ({ spec: binCommand('eslint', ['src']), needs: 'lint' as TaskKind, timeoutMs: 300_000 }),
  lintFix: () => ({ spec: binCommand('eslint', ['src', '--fix']), needs: 'lint' as TaskKind, timeoutMs: 300_000 }),
  build: () => ({ spec: binCommand('next', ['build']), needs: 'build' as TaskKind, timeoutMs: 900_000 }),
  e2e: () => ({ spec: binCommand('playwright', ['test']), needs: 'playwright' as TaskKind, timeoutMs: 1_200_000 }),
  a11y: () => ({ spec: binCommand('playwright', ['test', 'a11y']), needs: 'playwright' as TaskKind, timeoutMs: 900_000 }),
  seo: () => ({ spec: binCommand('playwright', ['test', 'seo']), needs: 'playwright' as TaskKind, timeoutMs: 900_000 }),
  /* Serial variants. Same specs, one worker, a lower memory floor and a longer
   * clock. `--workers=1` is passed explicitly rather than left to the config,
   * which sets `workers: undefined` outside CI and therefore uses every core. */
  e2eSerial: () => ({ spec: binCommand('playwright', ['test', '--workers=1']), needs: 'playwright-serial' as TaskKind, timeoutMs: 2_400_000 }),
  a11ySerial: () => ({ spec: binCommand('playwright', ['test', 'a11y', '--workers=1']), needs: 'playwright-serial' as TaskKind, timeoutMs: 1_800_000 }),
  seoSerial: () => ({ spec: binCommand('playwright', ['test', 'seo', '--workers=1']), needs: 'playwright-serial' as TaskKind, timeoutMs: 1_800_000 }),
  /**
   * The in-page visual audit, as a subprocess.
   *
   * Run out-of-process rather than imported so the browser it owns lives and
   * dies with a child pid. An in-process Playwright launch inside the
   * supervisor would put a Chromium under the same process the memory watchdog
   * runs in — and if that watchdog then has to abort, it would be killing its
   * own parent.
   */
  probe: () => ({
    // `--reduced` adds a second pass with prefers-reduced-motion: reduce.
    // Without it the probe reports `reducedMotionRespected: null` on every page
    // — it will not claim compliance with a preference nobody expressed — so
    // the accessibility question the VOS most needs answered ("does the motion
    // actually stop?") would go unmeasured on every run.
    spec: nodeScript(join('engineering', 'PageProbe.ts'), ['--reduced']),
    needs: 'probe' as TaskKind,
    timeoutMs: 900_000,
  }),
  bundle: () => ({ spec: nodeScript(join('scripts', 'audit-bundle.mjs')), needs: 'static' as TaskKind, timeoutMs: 120_000 }),
  lighthouse: () => ({ spec: nodeScript(join('scripts', 'audit-lighthouse.mjs')), needs: 'lighthouse' as TaskKind, timeoutMs: 900_000 }),
  trace: () => ({ spec: nodeScript(join('scripts', 'trace-paint.mjs')), needs: 'capture' as TaskKind, timeoutMs: 900_000 }),
  shots: () => ({ spec: nodeScript(join('scripts', 'capture-screens.mjs')), needs: 'capture' as TaskKind, timeoutMs: 1_200_000 }),
};

export type StepName = keyof typeof STEPS;

export async function step(
  name: StepName,
  topConsumers: Array<{ ProcessName: string; MB: number }> = [],
  /**
   * Extra environment for the child — in practice the base URL.
   *
   * Required because the server may not be on :3000. `PLAYWRIGHT_BASE_URL` is
   * read by `playwright.config.ts` and by PageProbe; `AUDIT_URL` by
   * `audit-lighthouse.mjs`. Without threading the real port through, a run that
   * drifted to :3005 would point every browser gate at a dead :3000 and report
   * failures that describe nothing but the port number.
   */
  envVars: Record<string, string> = {},
): Promise<RunResult> {
  const s = STEPS[name]();
  if (!s.spec) {
    // A missing binary is `unknown`, not `fail`: the gate did not run, so it
    // has no verdict to report about the code.
    return {
      name,
      command: `(${name})`,
      status: 'unknown',
      exitCode: null,
      ms: 0,
      output: '',
      detail: `cannot run ${name}: its entry point is missing from node_modules. Run npm install.`,
    };
  }
  return run(name, s.spec, { needs: s.needs, timeoutMs: s.timeoutMs, topConsumers, env: envVars });
}

/** True when there is a build on disk for the build-dependent gates to read. */
export function hasBuild(): boolean {
  return existsSync(join(ROOT, '.next', 'static'));
}

/* ------------------------------------------------------------------ *
 * A managed production server
 * ------------------------------------------------------------------ */

export interface ServerHandle {
  /** True when this process started it, and is therefore responsible for it. */
  owned: boolean;
  port: number;
  buildId: string | null;
  stop(): void;
}

/** Resolves to the HTTP status of `/`, or null when nothing answers. */
function ping(port: number, timeoutMs = 2000): Promise<number | null> {
  return new Promise((resolve) => {
    const req = httpGet({ host: '127.0.0.1', port, path: '/', timeout: timeoutMs }, (res) => {
      res.resume();
      resolve(res.statusCode ?? null);
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

/**
 * Read the BUILD_ID out of the served HTML.
 *
 * This is the check that catches the failure RC6.1 actually hit: a stale
 * listener still holding :3000 and serving an *old* build, which looks
 * identical to a healthy server from the outside and makes every downstream
 * measurement describe code that is no longer on disk. Comparing the served ID
 * against `.next/BUILD_ID` is the only way to tell the difference.
 */
async function servedBuildId(port: number): Promise<string | null> {
  return new Promise((resolve) => {
    const req = httpGet({ host: '127.0.0.1', port, path: '/', timeout: 5000 }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => {
        body += c;
        if (body.length > 400_000) req.destroy();
      });
      res.on('end', () => {
        const m = /"buildId":"([^"]+)"/.exec(body) ?? /\/_next\/static\/([^/]+)\/_buildManifest/.exec(body);
        resolve(m ? m[1] : null);
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

/**
 * The BUILD_ID a live server is actually serving, or null if nothing answers.
 *
 * Public because BUILD_STATUS.md has to state it. A report that says "build
 * z6HKUtI is on disk" without saying what is being *served* cannot catch the
 * stale-listener failure — a server still holding :3000 from a previous build,
 * which is exactly what RC6.1 found on port 3000 and which makes every
 * measurement taken through it describe code that no longer exists.
 */
export async function probeServedBuildId(port = 3000): Promise<string | null> {
  if ((await ping(port, 1500)) === null) return null;
  return servedBuildId(port);
}

export function diskBuildId(): string | null {
  const p = join(ROOT, '.next', 'BUILD_ID');
  try {
    return existsSync(p) ? readFileSync(p, 'utf8').trim() : null;
  } catch {
    return null;
  }
}

/**
 * Ensure something is serving the current build on `port`.
 *
 * Adopts a healthy existing server rather than restarting it — restarting a
 * server somebody else is using is the kind of side effect a checking tool has
 * no business having. It only takes ownership when it had to start one, and
 * `owned` is what tells the caller whether it is allowed to stop it again.
 */
export async function ensureServer(port = 3000, timeoutMs = 180_000): Promise<{ handle: ServerHandle | null; finding: Finding }> {
  const existing = await ping(port);
  const onDisk = diskBuildId();

  if (existing !== null) {
    const served = await servedBuildId(port);
    const stale = !!(served && onDisk && served !== onDisk);
    return {
      handle: { owned: false, port, buildId: served, stop() {} },
      finding: stale
        ? finding('server', 'warn', `:${port} is serving build ${served} but ${onDisk} is on disk — the listener is stale`, {
            fix: `stop it and re-run, or measurements will describe code that is no longer in the working tree`,
            evidence: { served, onDisk },
          })
        : finding('server', 'ok', `:${port} already serving${served ? ` build ${served}` : ''} (not started by this run, so not stopped by it)`),
    };
  }

  if (!hasBuild()) {
    return {
      handle: null,
      finding: finding('server', 'skipped', `nothing on :${port} and no .next/static to serve`, {
        fix: 'the build gate must pass first',
      }),
    };
  }

  const spec = binCommand('next', ['start', '--port', String(port)]);
  if (!spec) {
    return { handle: null, finding: finding('server', 'unknown', 'next is not installed; cannot start a server') };
  }

  // stdout is piped, not ignored, because Next has to be *asked* which port it
  // bound — see below. `detached: false` keeps it in this process group.
  const child = spawn(spec.cmd, spec.args, { cwd: ROOT, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  const started = Date.now();

  /**
   * The port Next actually chose.
   *
   * `--port 3000` is a *request*, not a guarantee: when 3000 is occupied Next
   * silently increments and binds elsewhere, announcing it only on stdout. This
   * cost the RC7.1 verification dearly. A stale listener held :3000, Next bound
   * :3005, and this function polled :3000 for the full 180 s timeout and
   * declared failure — while a perfectly healthy server was serving the build
   * one port over.
   */
  let boundPort = port;
  let banner = '';
  const readBanner = (chunk: Buffer) => {
    banner += chunk.toString();
    const m = /http:\/\/(?:localhost|127\.0\.0\.1):(\d+)/.exec(banner);
    if (m) boundPort = Number(m[1]);
  };
  child.stdout?.on('data', readBanner);
  child.stderr?.on('data', readBanner);

  /**
   * Kill the whole tree, not the process we spawned.
   *
   * `next start` is a launcher: the server that holds the socket is
   * `next/dist/server/lib/start-server.js`, a *grandchild*. `child.kill()`
   * reaps the launcher and leaves the server running and unreferenced.
   *
   * That leak is what actually broke this run. Each timed-out attempt orphaned
   * a ~650 MB server; three attempts consumed the headroom that the remaining
   * gates were then refused for. The gates were not blocked by the machine
   * being small — they were blocked by this function littering it. On Windows
   * `taskkill /T` is the only reliable way to take the tree.
   */
  const killTree = () => {
    if (child.pid) {
      try {
        spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
      } catch {
        /* fall through to the direct kill below */
      }
    }
    try {
      child.kill('SIGKILL');
    } catch {
      /* already gone */
    }
  };

  while (Date.now() - started < timeoutMs) {
    if (child.exitCode !== null) {
      killTree();
      return {
        handle: null,
        finding: finding('server', 'fail', `next start exited ${child.exitCode} before answering`, {
          evidence: { tail: tail(banner, 15) },
        }),
      };
    }
    // Poll whichever port Next reported, falling back to the requested one.
    const status = (await ping(boundPort)) ?? (boundPort !== port ? await ping(port) : null);
    if (status !== null) {
      const served = await servedBuildId(boundPort);
      const drifted = boundPort !== port;
      return {
        handle: { owned: true, port: boundPort, buildId: served, stop: killTree },
        finding: finding(
          'server',
          drifted ? 'warn' : 'repaired',
          `started next start on :${boundPort}${served ? ` serving build ${served}` : ''} in ${((Date.now() - started) / 1000).toFixed(1)} s` +
            (drifted ? ` — NOTE: :${port} was occupied, so Next bound :${boundPort} instead` : ''),
          drifted
            ? { fix: `something else holds :${port}; the gates will use :${boundPort} for this run`, evidence: { requested: port, bound: boundPort } }
            : undefined,
        ),
      };
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  killTree();
  return {
    handle: null,
    finding: finding('server', 'fail', `next start did not answer on :${boundPort} within ${timeoutMs / 1000} s`, {
      fix: 'the process tree was killed, so no orphan is left holding memory',
      evidence: { tail: tail(banner, 15) },
    }),
  };
}

/** Frees a lock left behind by a killed process; safe because it verifies the pid. */
export function clearStaleLock(): Finding {
  const held = readLock();
  if (!held) return finding('build:lock', 'ok', 'no coordinator lock held');
  if (held.pid === process.pid) return finding('build:lock', 'ok', 'lock held by this process');
  return finding('build:lock', 'warn', `coordinator lock held by pid ${held.pid} running "${held.task}" since ${held.startedAt}`, {
    fix: 'wait for it, or stop that process — the lock clears itself once the holder is gone',
  });
}
