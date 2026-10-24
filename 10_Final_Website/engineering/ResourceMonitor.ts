/**
 * ResourceMonitor — what the machine can tell you about itself before you ask
 * it to do work.
 *
 * ## Its relationship to `scripts/session-supervisor.mjs`
 *
 * The .mjs supervisor is wired to `SessionStart` and `UserPromptSubmit`, so it
 * runs on *every prompt*. That budget — one PowerShell round-trip, ~1 s — is a
 * hard constraint, and it is why that script checks processes, ports, `.next`
 * and memory and stops there.
 *
 * This module is the deep probe, run before a major engineering task rather
 * than before every sentence. It does **not** reimplement the cheap layer: it
 * shells out to `session-supervisor.mjs --json` and adopts its findings whole.
 * Two implementations of "is this server orphaned" would drift within a week,
 * and the .mjs version is the one that has already had two bugs found in it by
 * testing (the highest-PID kill rule, the detail-hashing dedupe). Reuse the
 * scar tissue.
 *
 * What this module adds on top, all of it new signal the hook cannot afford:
 *
 *   • disk headroom on C:
 *   • Windows Event Log — application crashes, resource-exhaustion diagnoses,
 *     display-driver TDRs — over a rolling window
 *   • the GPU adapter inventory, including the discrete-present/integrated-in-use
 *     case that this box is actually in
 *   • a full node process inventory, which MCPHealth reads rather than taking
 *     its own round-trip
 *   • Playwright session counting, separated from generic browser counting
 *
 * ## Why the event log is not optional
 *
 * The RC6 diagnosis exists *only* because Windows kept records the cleanup did
 * not delete. `0xE0000008` is Chromium's own out-of-memory exception code, and
 * Event 2004 is Windows independently diagnosing low virtual memory in the same
 * second. Reading those two logs is the difference between "the browser died"
 * and "the browser reported an allocation failure on a machine Windows had
 * already flagged". This module reads them every run so the next incident is
 * diagnosed in seconds instead of reconstructed.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, STATE_DIR, SUPERVISOR_SCRIPT, QUARANTINE } from './paths.ts';
import { arr, finding, worst } from './types.ts';
import type { Finding, Status } from './types.ts';

/* ------------------------------------------------------------------ *
 * Raw shapes
 * ------------------------------------------------------------------ */

export interface ProcRow {
  ProcessId: number;
  Name: string;
  CommandLine: string | null;
  WorkingSetSize: number;
}

export interface CrashRow {
  at: string;
  app: string;
  module: string;
  code: string;
}

export interface Snapshot {
  at: string;
  memory: { freePhysicalGB: number; totalPhysicalGB: number; freeCommitGB: number };
  disk: { freeGB: number; sizeGB: number };
  gpus: Array<{ name: string; driver: string; status: string; ramMB: number }>;
  /**
   * Grouped by executable name and summed, not per-process.
   *
   * The first version listed the eight largest *processes*, which on this host
   * put five VS Code renderers at ~250 MB each into the list and reported the
   * editor as a 250 MB item. It holds 1474 MB across 18 processes. Since this
   * list is what ranks the reclaim advice, the ungrouped version pointed at the
   * wrong target: it recommended shutting down WSL — worth 3.2 GB during the
   * RC6 incident, worth 16 MB now — while the actual largest reclaimable block
   * was never named.
   */
  processes: ProcRow[];
  listeners: Array<{ LocalPort: number; OwningProcess: number }>;
  topConsumers: Array<{ ProcessName: string; MB: number; N: number }>;
  crashes: CrashRow[];
  exhaustion: string[];
  tdr: string[];
  probeMs: number;
}

export interface MonitorResult {
  snapshot: Snapshot | null;
  findings: Finding[];
  actions: string[];
  status: Status;
}

/* ------------------------------------------------------------------ *
 * The probe
 * ------------------------------------------------------------------ */

/** Hours of Event Log to read back. 12 covers "what happened while I slept". */
const EVENT_WINDOW_HOURS = Number(process.env.ENG_EVENT_HOURS ?? 12);

/** Disk floors, GB. A Next build plus a capture matrix is ~100 MB of writes, but
 *  Windows itself starts failing allocations and paging badly well before 0. */
const DISK_WARN_GB = 5;
const DISK_BLOCK_GB = 2;

const DEEP_PROBE = `
$ErrorActionPreference='SilentlyContinue'
$t0 = [datetime]::UtcNow
$os = Get-CimInstance Win32_OperatingSystem
$disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
$gpu = Get-CimInstance Win32_VideoController |
  Select-Object Name, DriverVersion, Status, @{n='ramMB';e={[math]::Round($_.AdapterRAM/1MB,0)}}
$procs = Get-CimInstance Win32_Process -Filter "Name='node.exe' OR Name='chrome-headless-shell.exe' OR Name='chrome.exe'" |
  Select-Object ProcessId, Name, CommandLine, WorkingSetSize
$listeners = Get-NetTCPConnection -State Listen | Select-Object LocalPort, OwningProcess -Unique
$top = Get-Process | Group-Object ProcessName | ForEach-Object {
  [pscustomobject]@{
    ProcessName = $_.Name
    MB = [math]::Round((($_.Group | Measure-Object WorkingSet64 -Sum).Sum)/1MB,0)
    N  = $_.Count
  }
} | Sort-Object MB -Descending | Select-Object -First 8
$since = (Get-Date).AddHours(-${EVENT_WINDOW_HOURS})
$crashes = Get-WinEvent -FilterHashtable @{LogName='Application'; Id=1000; StartTime=$since} -MaxEvents 25 |
  Select-Object TimeCreated, @{n='app';e={$_.Properties[0].Value}}, @{n='module';e={$_.Properties[3].Value}}, @{n='code';e={$_.Properties[6].Value}}
$exhaust = Get-WinEvent -FilterHashtable @{LogName='System'; Id=2004; StartTime=$since} -MaxEvents 15 | Select-Object TimeCreated
$tdr = Get-WinEvent -FilterHashtable @{LogName='System'; Id=4101; StartTime=$since} -MaxEvents 15 | Select-Object TimeCreated
[pscustomobject]@{
  freePhysicalGB  = [math]::Round($os.FreePhysicalMemory*1KB/1GB,2)
  totalPhysicalGB = [math]::Round($os.TotalVisibleMemorySize*1KB/1GB,2)
  freeCommitGB    = [math]::Round($os.FreeVirtualMemory*1KB/1GB,2)
  diskFreeGB      = [math]::Round($disk.FreeSpace/1GB,2)
  diskSizeGB      = [math]::Round($disk.Size/1GB,2)
  gpus            = @($gpu)
  processes       = @($procs)
  listeners       = @($listeners)
  topConsumers    = @($top)
  crashes         = @($crashes)
  exhaustion      = @($exhaust)
  tdr             = @($tdr)
  probeMs         = [math]::Round(([datetime]::UtcNow-$t0).TotalMilliseconds)
} | ConvertTo-Json -Depth 5 -Compress
`;

/** PowerShell serialises DateTime as `/Date(epochMillis)/`. */
function psDate(v: unknown): string {
  if (typeof v !== 'string') return String(v ?? '');
  const m = /\/Date\((\d+)\)\//.exec(v);
  return m ? new Date(Number(m[1])).toISOString() : v;
}

export function probe(): Snapshot {
  const out = execFileSync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-Command', DEEP_PROBE],
    { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, windowsHide: true },
  );
  const raw = JSON.parse(out);
  return {
    at: new Date().toISOString(),
    memory: {
      freePhysicalGB: raw.freePhysicalGB,
      totalPhysicalGB: raw.totalPhysicalGB,
      freeCommitGB: raw.freeCommitGB,
    },
    disk: { freeGB: raw.diskFreeGB, sizeGB: raw.diskSizeGB },
    gpus: arr<any>(raw.gpus).map((g) => ({
      name: String(g.Name ?? 'unknown'),
      driver: String(g.DriverVersion ?? ''),
      status: String(g.Status ?? ''),
      ramMB: Number(g.ramMB ?? 0),
    })),
    processes: arr<any>(raw.processes).map((p) => ({
      ProcessId: Number(p.ProcessId),
      Name: String(p.Name),
      CommandLine: p.CommandLine ?? null,
      WorkingSetSize: Number(p.WorkingSetSize ?? 0),
    })),
    listeners: arr<any>(raw.listeners).map((l) => ({
      LocalPort: Number(l.LocalPort),
      OwningProcess: Number(l.OwningProcess),
    })),
    topConsumers: arr<any>(raw.topConsumers).map((t) => ({
      ProcessName: String(t.ProcessName),
      MB: Number(t.MB ?? 0),
      N: Number(t.N ?? 1),
    })),
    crashes: arr<any>(raw.crashes).map((c) => ({
      at: psDate(c.TimeCreated),
      app: String(c.app ?? ''),
      module: String(c.module ?? ''),
      code: String(c.code ?? '').toLowerCase(),
    })),
    exhaustion: arr<any>(raw.exhaustion).map((e) => psDate(e.TimeCreated)),
    tdr: arr<any>(raw.tdr).map((e) => psDate(e.TimeCreated)),
    probeMs: Number(raw.probeMs ?? 0),
  };
}

/* ------------------------------------------------------------------ *
 * The cheap layer, delegated
 * ------------------------------------------------------------------ */

/**
 * Runs the proven .mjs supervisor and adopts its findings.
 *
 * `heal: false` passes `--check`, which makes it detect-only — it will name a
 * process it *would* stop without stopping it. Anything the supervisor repairs
 * arrives here as an action string, so the caller reports the repair rather
 * than silently benefiting from it.
 */
export function runSessionSupervisor(heal: boolean): { findings: Finding[]; actions: string[] } {
  if (!existsSync(SUPERVISOR_SCRIPT)) {
    return {
      findings: [
        finding(
          'session-supervisor',
          'unknown',
          'scripts/session-supervisor.mjs is missing — the per-prompt environment layer is not installed',
          { fix: 'restore it from git: git checkout -- 10_Final_Website/scripts/session-supervisor.mjs' },
        ),
      ],
      actions: [],
    };
  }
  const args = ['scripts/session-supervisor.mjs', '--json'];
  if (!heal) args.push('--check');
  try {
    const out = execFileSync(process.execPath, args, {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 8 * 1024 * 1024,
      windowsHide: true,
      // Exit 1 means "blocked", which is a result, not a failure to produce one.
    });
    const parsed = JSON.parse(out);
    return { findings: arr<Finding>(parsed.findings), actions: arr<string>(parsed.actions) };
  } catch (error: any) {
    // execFileSync throws on non-zero exit; the JSON is still on stdout.
    const stdout = String(error?.stdout ?? '');
    try {
      const parsed = JSON.parse(stdout);
      return { findings: arr<Finding>(parsed.findings), actions: arr<string>(parsed.actions) };
    } catch {
      return {
        findings: [
          finding('session-supervisor', 'unknown', `could not run the per-prompt supervisor: ${error?.message ?? error}`),
        ],
        actions: [],
      };
    }
  }
}

/* ------------------------------------------------------------------ *
 * Detectors this module owns
 * ------------------------------------------------------------------ */

export const isOurs = (cmd: string | null): boolean => !!cmd && cmd.includes('SheetFlow_AI_Website');
export const isMcpProcess = (cmd: string | null): boolean =>
  !!cmd &&
  /server-filesystem|@playwright[\\/]mcp|modelcontextprotocol|mcp-server|sequential-thinking|context7|chrome-devtools-mcp/i.test(
    cmd,
  );

/** 1 · Disk. Cheap to check, and it silently breaks builds when it runs out. */
function checkDisk(s: Snapshot): Finding {
  const { freeGB, sizeGB } = s.disk;
  if (freeGB < DISK_BLOCK_GB) {
    return finding('disk', 'blocked', `${freeGB} GB free on C: of ${sizeGB} GB — under the ${DISK_BLOCK_GB} GB floor`, {
      fix: 'a Next build writes ~30 MB and a capture matrix ~80 MB, but Windows pages badly this low. Clear space before building.',
      evidence: s.disk,
    });
  }
  if (freeGB < DISK_WARN_GB) {
    return finding('disk', 'warn', `${freeGB} GB free on C: of ${sizeGB} GB — thin`, {
      fix: 'reclaim with: npm run env:heal (quarantine), or clear .next/ and .lighthouse/',
      evidence: s.disk,
    });
  }
  return finding('disk', 'ok', `${freeGB} GB free on C: of ${sizeGB} GB`, { evidence: s.disk });
}

/**
 * 2 · GPU.
 *
 * There are two distinct "GPU fallback" conditions and they need separating,
 * because only one of them is a crisis:
 *
 *   a) Chromium falls back to SwiftShader — software rasterisation. Every
 *      backdrop-filter in the VOS surface ladder becomes a CPU blur. Only a
 *      running browser can report this, so it is read from the cached renderer
 *      string that the visual probe writes, and marked stale when old.
 *
 *   b) The discrete adapter exists but the integrated one is in use. **This box
 *      is in that state**: a GeForce 940MX with 2 GB sits idle while Chromium
 *      renders on Intel HD 620 with 1 GB of shared memory — shared with the
 *      same 7.88 GB of system RAM the OOM incident exhausted. That is not a
 *      fault to repair, it is a capacity fact to plan around, so it is a `warn`
 *      that names the trade rather than something this module tries to change.
 */
function checkGpu(s: Snapshot): Finding[] {
  const out: Finding[] = [];
  const names = s.gpus.map((g) => `${g.name} (${g.ramMB} MB, ${g.status})`).join('; ');
  const unhealthy = s.gpus.filter((g) => g.status && g.status !== 'OK');

  if (unhealthy.length) {
    out.push(
      finding('gpu-adapter', 'warn', `adapter not reporting OK: ${unhealthy.map((g) => `${g.name}=${g.status}`).join(', ')}`, {
        fix: 'check Device Manager — a degraded adapter forces Chromium to software rasterisation',
        evidence: s.gpus,
      }),
    );
  }

  const discrete = s.gpus.find((g) => /nvidia|radeon|geforce|rtx|gtx/i.test(g.name));
  const integrated = s.gpus.find((g) => /intel|uhd|iris/i.test(g.name));
  const cached = readGpuCache();

  if (cached?.renderer) {
    const soft = /swiftshader|llvmpipe|software/i.test(cached.renderer);
    const ageH = (Date.now() - Date.parse(cached.at)) / 3_600_000;
    const staleness = ageH > 24 ? ` — last observed ${Math.round(ageH)} h ago, may be stale` : '';
    out.push(
      soft
        ? finding('gpu-render', 'fail', `Chromium last rendered through SOFTWARE rasterisation: ${cached.renderer}${staleness}`, {
            fix: 'every backdrop-filter in the VOS surface ladder becomes a CPU blur here. Do not trust any paint measurement taken in this state.',
            evidence: cached,
          })
        : finding('gpu-render', 'ok', `Chromium last rendered hardware-accelerated: ${cached.renderer}${staleness}`, {
            evidence: cached,
          }),
    );
    if (discrete && integrated && new RegExp(integrated.name.split('(')[0].trim(), 'i').test(cached.renderer)) {
      out.push(
        finding(
          'gpu-selection',
          'warn',
          `discrete adapter present but unused — ${discrete.name} (${discrete.ramMB} MB dedicated) idle while Chromium renders on ${integrated.name} (${integrated.ramMB} MB shared)`,
          {
            fix: 'not a fault. It means GPU memory is drawn from the same 7.9 GB the OOM incident exhausted — budget backdrop-filter layers accordingly.',
            evidence: { discrete, integrated, renderer: cached.renderer },
          },
        ),
      );
    }
  } else {
    out.push(
      finding('gpu-render', 'unknown', `adapters present (${names}) but no browser has reported its renderer yet`, {
        fix: 'run the visual probe once with headroom available; it caches the renderer to .engineering/gpu.json',
        evidence: s.gpus,
      }),
    );
  }
  return out;
}

interface GpuCache {
  at: string;
  renderer: string;
  vendor?: string;
  supportsBackdropFilter?: boolean;
  supportsViewTimeline?: boolean;
}

export function readGpuCache(): GpuCache | null {
  const p = join(STATE_DIR, 'gpu.json');
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

export function writeGpuCache(info: Omit<GpuCache, 'at'>): void {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(join(STATE_DIR, 'gpu.json'), JSON.stringify({ at: new Date().toISOString(), ...info }, null, 2));
}

/**
 * 3 · Windows crash and exhaustion records.
 *
 * Codes are matched, not just counted, because the code *is* the diagnosis:
 *   0xe0000008 — Chromium's own OOM exception, raised from its OnNoMemory handler
 *   0x80000003 — STATUS_BREAKPOINT, a deliberate Chromium CHECK/IMMEDIATE_CRASH
 *   0xc0000005 — a genuine access violation, which would mean a real bug
 */
function checkCrashes(s: Snapshot): Finding[] {
  const out: Finding[] = [];
  const oom = s.crashes.filter((c) => c.code === 'e0000008');
  const checks = s.crashes.filter((c) => c.code === '80000003');
  const av = s.crashes.filter((c) => c.code === 'c0000005');
  const browserCrashes = s.crashes.filter((c) => /chrome|msedge|playwright/i.test(c.app));

  if (oom.length) {
    // Recency changes what this means. An OOM abort twenty minutes ago says the
    // machine is *currently* in the failing state; the same record from this
    // morning is history, and reporting history as an active failure is how a
    // report earns the right to be ignored. `fail` is reserved for the live case.
    const newest = Math.max(...oom.map((c) => Date.parse(c.at)));
    const agoH = (Date.now() - newest) / 3_600_000;
    // 30 minutes. Wider than that and the sentence "happening now" stops being
    // true — an abort 1.7 h ago describes what this machine does under load,
    // which the memory row already says better and with a current reading.
    const recent = agoH < 0.5;
    const when = agoH < 1 ? `${Math.round(agoH * 60)} min ago` : `${agoH.toFixed(1)} h ago`;
    out.push(
      finding(
        'event-oom',
        recent ? 'fail' : 'warn',
        `${oom.length} Chromium out-of-memory abort(s) (0xE0000008), most recent ${when}: ${oom.map((c) => `${c.app} @ ${c.at.slice(11, 19)}Z`).join(', ')}${recent ? '' : ' — historical within the 12 h window, not an active failure'}`,
        {
          fix: recent
            ? 'this is the RC6 failure mode, happening now. Do not launch a browser until MemoryGuard admits it.'
            : 'the RC6 failure mode. It says what this machine does under pressure, not that it is under pressure right now — check the memory row for that.',
          evidence: oom,
        },
      ),
    );
  }
  if (checks.length) {
    out.push(
      finding('event-check', 'warn', `${checks.length} deliberate Chromium abort(s) (0x80000003 STATUS_BREAKPOINT) in the last ${EVENT_WINDOW_HOURS} h`, {
        fix: 'a CHECK() fired inside the browser — usually the first symptom of the same pressure that produces 0xE0000008',
        evidence: checks,
      }),
    );
  }
  if (av.length) {
    out.push(
      finding('event-av', 'warn', `${av.length} access violation(s) (0xC0000005) in the last ${EVENT_WINDOW_HOURS} h: ${av.map((c) => `${c.app}/${c.module}`).join(', ')}`, {
        fix: 'unlike the OOM codes this is a genuine fault, not a reported allocation failure. Worth reading the WER report.',
        evidence: av,
      }),
    );
  }
  if (s.exhaustion.length) {
    out.push(
      finding('event-exhaustion', 'warn', `Windows diagnosed low virtual memory ${s.exhaustion.length}x in the last ${EVENT_WINDOW_HOURS} h (latest ${s.exhaustion[0]?.slice(11, 19)}Z)`, {
        fix: 'independent corroboration of memory pressure — it is the OS saying so, not this tool inferring it',
        evidence: s.exhaustion,
      }),
    );
  }
  if (s.tdr.length) {
    out.push(
      finding('event-tdr', 'warn', `${s.tdr.length} display-driver reset(s) (Event 4101) in the last ${EVENT_WINDOW_HOURS} h`, {
        fix: 'the GPU hung and was restarted. Heavy backdrop-filter or WebGL work is the usual trigger on integrated graphics.',
        evidence: s.tdr,
      }),
    );
  }
  if (!out.length) {
    out.push(
      finding('event-log', 'ok', `no application crashes, exhaustion diagnoses or driver resets in the last ${EVENT_WINDOW_HOURS} h`, {
        evidence: { crashes: s.crashes.length, browserCrashes: browserCrashes.length },
      }),
    );
  }
  return out;
}

/**
 * 4 · Playwright sessions, counted separately from browsers.
 *
 * The rule this enforces was measured during RC6.1, not assumed: the a11y smoke
 * test timed out at 90 s with the Playwright **MCP** browser open and passed in
 * 16.4 s immediately after it closed. Same test, same server, same build. So a
 * live MCP browser session concurrent with a runner is a first-class finding.
 */
function checkPlaywrightSessions(s: Snapshot): Finding {
  const mcpBrowsers = s.processes.filter((p) => isMcpProcess(p.CommandLine) && /@playwright[\\/]mcp/i.test(p.CommandLine ?? ''));
  const runners = s.processes.filter(
    (p) => isOurs(p.CommandLine) && /playwright/i.test(p.CommandLine ?? '') && !isMcpProcess(p.CommandLine),
  );
  const shells = s.processes.filter((p) => p.Name === 'chrome-headless-shell.exe');

  if (runners.length && shells.length && mcpBrowsers.length) {
    return finding(
      'playwright-contention',
      'fail',
      `a Playwright runner (${runners.length}) and the Playwright MCP browser (${mcpBrowsers.length} process(es)) are both live with ${shells.length} headless shell(s)`,
      {
        fix: 'close the MCP browser (browser_close) before running the suite. Measured: 16.4 s becomes >90 s under this contention.',
        evidence: { runners: runners.length, mcpBrowsers: mcpBrowsers.length, shells: shells.length },
      },
    );
  }
  if (shells.length > 4) {
    return finding('playwright-contention', 'warn', `${shells.length} headless Chrome shells alive — more than a 2-project run needs`, {
      fix: 'npm run env:heal kills shells with no runner driving them',
      evidence: { shells: shells.length },
    });
  }
  return finding('playwright-contention', 'ok', `${runners.length} runner(s), ${shells.length} shell(s), ${mcpBrowsers.length} MCP browser process(es) — no contention`, {
    evidence: { runners: runners.length, shells: shells.length, mcpBrowsers: mcpBrowsers.length },
  });
}

/* ------------------------------------------------------------------ *
 * Public entry
 * ------------------------------------------------------------------ */

export interface MonitorOptions {
  /** Allow the delegated supervisor to kill orphans and free ports. */
  heal?: boolean;
}

export function inspect(options: MonitorOptions = {}): MonitorResult {
  let snapshot: Snapshot | null = null;
  const findings: Finding[] = [];
  const actions: string[] = [];

  try {
    snapshot = probe();
  } catch (error: any) {
    findings.push(
      finding('probe', 'unknown', `deep environment probe failed: ${error?.message ?? error}`, {
        fix: 'PowerShell may be restricted. The cheap layer below still ran; disk, GPU and event-log signal is missing from this report.',
      }),
    );
  }

  // The cheap layer first — it is what actually repairs things.
  const cheap = runSessionSupervisor(options.heal ?? false);
  findings.push(...cheap.findings);
  actions.push(...cheap.actions);

  if (snapshot) {
    findings.push(checkDisk(snapshot));
    findings.push(...checkGpu(snapshot));
    findings.push(...checkCrashes(snapshot));
    findings.push(checkPlaywrightSessions(snapshot));

    // Persist, so the next incident opens with a before-picture rather than a
    // reconstruction. Processes are dropped: command lines contain absolute
    // paths and this file is written on every run.
    try {
      mkdirSync(STATE_DIR, { recursive: true });
      writeFileSync(
        join(STATE_DIR, 'resource-last.json'),
        JSON.stringify({ ...snapshot, processes: snapshot.processes.length }, null, 2),
      );
    } catch {
      /* logging must never be the thing that fails a run */
    }
  }

  return { snapshot, findings, actions, status: worst(findings.map((f) => f.status)) };
}

/** Where the .mjs supervisor puts things it preserved rather than deleted. */
export const quarantineDir = QUARANTINE;

/* ------------------------------------------------------------------ *
 * Forensics — proving why something could not run
 * ------------------------------------------------------------------ */

export interface Forensics {
  at: string;
  memory: { freeGB: number; totalGB: number; commitFreeGB: number; percentUsed: number };
  processTable: Array<{ name: string; totalMB: number; procs: number }>;
  browserProcesses: Array<{ name: string; pid: number; mb: number }>;
  /** Application-crash records since the given time, matched to their codes. */
  crashesSince: CrashRow[];
  exhaustionSince: string[];
  interpretation: string;
}

/**
 * Capture everything needed to prove a browser failure, after it has happened.
 *
 * This exists because "the gate could not run" is an assertion, and an
 * assertion is not evidence. The RC6 diagnosis was only possible because
 * Windows kept records the cleanup had not deleted — `0xE0000008` is Chromium's
 * own out-of-memory code, raised from its `OnNoMemory` handler, and Event 2004
 * is the OS independently diagnosing low virtual memory. Together they turn
 * "it crashed" into "the browser reported an allocation failure on a machine
 * the OS had already flagged", which is a different claim entirely.
 *
 * `since` scopes the event query to this run, so a crash from this morning
 * cannot be presented as evidence about a launch that happened a minute ago.
 */
export function forensics(since: Date): Forensics {
  const sinceIso = since.toISOString();
  const script = `
$ErrorActionPreference='SilentlyContinue'
$os = Get-CimInstance Win32_OperatingSystem
$table = Get-Process | Group-Object ProcessName | ForEach-Object {
  [pscustomobject]@{ name=$_.Name; totalMB=[math]::Round((($_.Group | Measure-Object WorkingSet64 -Sum).Sum)/1MB,0); procs=$_.Count }
} | Sort-Object totalMB -Descending | Select-Object -First 15
$browsers = Get-Process chrome-headless-shell,chrome,msedge -ErrorAction SilentlyContinue |
  Select-Object ProcessName, Id, @{n='mb';e={[math]::Round($_.WorkingSet64/1MB,0)}}
$since = [datetime]::Parse('${sinceIso}').ToLocalTime()
$crashes = Get-WinEvent -FilterHashtable @{LogName='Application'; Id=1000; StartTime=$since} -MaxEvents 20 |
  Select-Object TimeCreated, @{n='app';e={$_.Properties[0].Value}}, @{n='module';e={$_.Properties[3].Value}}, @{n='code';e={$_.Properties[6].Value}}
$exhaust = Get-WinEvent -FilterHashtable @{LogName='System'; Id=2004; StartTime=$since} -MaxEvents 10 | Select-Object TimeCreated
[pscustomobject]@{
  freeGB       = [math]::Round($os.FreePhysicalMemory*1KB/1GB,2)
  totalGB      = [math]::Round($os.TotalVisibleMemorySize*1KB/1GB,2)
  commitFreeGB = [math]::Round($os.FreeVirtualMemory*1KB/1GB,2)
  processTable = @($table)
  browsers     = @($browsers)
  crashes      = @($crashes)
  exhaustion   = @($exhaust)
} | ConvertTo-Json -Depth 5 -Compress
`;
  let raw: any = {};
  try {
    raw = JSON.parse(
      execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
        encoding: 'utf8',
        maxBuffer: 8 * 1024 * 1024,
        windowsHide: true,
      }),
    );
  } catch {
    /* a failed forensic probe must not mask the failure it was investigating */
  }

  const crashes: CrashRow[] = arr<any>(raw.crashes).map((c) => ({
    at: psDate(c.TimeCreated),
    app: String(c.app ?? ''),
    module: String(c.module ?? ''),
    code: String(c.code ?? '').toLowerCase(),
  }));
  const exhaustion = arr<any>(raw.exhaustion).map((e) => psDate(e.TimeCreated));
  const oom = crashes.filter((c) => c.code === 'e0000008');
  const checks = crashes.filter((c) => c.code === '80000003');

  const freeGB = Number(raw.freeGB ?? 0);
  const totalGB = Number(raw.totalGB ?? 0);

  let interpretation: string;
  if (oom.length) {
    interpretation =
      `Chromium raised its own out-of-memory exception (0xE0000008) ${oom.length} time(s) during this window. ` +
      `That code comes from Chromium's OnNoMemory handler via RaiseException — the browser did not fault, it reported that an allocation failed. ` +
      (exhaustion.length ? `Windows independently diagnosed low virtual memory ${exhaustion.length} time(s) in the same window, which corroborates it.` : '');
  } else if (checks.length) {
    interpretation =
      `Chromium aborted deliberately via CHECK/IMMEDIATE_CRASH (0x80000003) ${checks.length} time(s). This is usually the first symptom of the same pressure that produces 0xE0000008.`;
  } else if (exhaustion.length) {
    interpretation = `No browser crash was logged, but Windows diagnosed low virtual memory ${exhaustion.length} time(s) during the window.`;
  } else {
    interpretation =
      'No Chromium allocation failure and no OS low-memory diagnosis were logged in this window. ' +
      'If a gate did not run, it was refused before launch by admission control rather than failing during execution — which is the designed outcome, not a fault.';
  }

  return {
    at: new Date().toISOString(),
    memory: {
      freeGB,
      totalGB,
      commitFreeGB: Number(raw.commitFreeGB ?? 0),
      percentUsed: totalGB ? Math.round((1 - freeGB / totalGB) * 1000) / 10 : 0,
    },
    processTable: arr<any>(raw.processTable).map((t) => ({
      name: String(t.name),
      totalMB: Number(t.totalMB ?? 0),
      procs: Number(t.procs ?? 1),
    })),
    browserProcesses: arr<any>(raw.browsers).map((b) => ({
      name: String(b.ProcessName),
      pid: Number(b.Id),
      mb: Number(b.mb ?? 0),
    })),
    crashesSince: crashes,
    exhaustionSince: exhaustion,
    interpretation,
  };
}

/** Formats forensics as the Markdown block the reports embed. */
export function forensicsMarkdown(f: Forensics, context: string): string {
  const lines: string[] = [];
  lines.push(`**${context}**`, '');
  lines.push(`Captured ${f.at}.`, '');
  lines.push('| Measurement | Value |');
  lines.push('|---|---|');
  lines.push(`| Free physical RAM | **${f.memory.freeGB} GB** of ${f.memory.totalGB} GB (${f.memory.percentUsed}% used) |`);
  lines.push(`| Commit available | ${f.memory.commitFreeGB} GB |`);
  lines.push(`| Chromium processes alive | ${f.browserProcesses.length ? f.browserProcesses.map((b) => `${b.name} pid ${b.pid} — ${b.mb} MB`).join('; ') : 'none' } |`);
  lines.push(`| Chromium allocation failures (0xE0000008) | ${f.crashesSince.filter((c) => c.code === 'e0000008').length} |`);
  lines.push(`| Chromium deliberate aborts (0x80000003) | ${f.crashesSince.filter((c) => c.code === '80000003').length} |`);
  lines.push(`| OS low-virtual-memory diagnoses (Event 2004) | ${f.exhaustionSince.length} |`);
  lines.push('');
  if (f.crashesSince.length) {
    lines.push('| Time | Application | Faulting module | Exception |');
    lines.push('|---|---|---|---|');
    for (const c of f.crashesSince) lines.push(`| ${c.at.slice(11, 19)}Z | \`${c.app}\` | \`${c.module}\` | \`0x${c.code}\` |`);
    lines.push('');
  }
  lines.push('**Process table at capture (grouped by executable, top 12):**', '');
  lines.push('| Process | Total MB | Instances |');
  lines.push('|---|---|---|');
  for (const p of f.processTable.slice(0, 12)) lines.push(`| ${p.name} | ${p.totalMB} | ${p.procs} |`);
  lines.push('');
  lines.push(`**Interpretation.** ${f.interpretation}`);
  return lines.join('\n');
}
