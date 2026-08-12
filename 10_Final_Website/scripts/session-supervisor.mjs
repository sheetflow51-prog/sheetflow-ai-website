/**
 * Session Supervisor — make the development environment self-healing.
 *
 *   node scripts/session-supervisor.mjs            # detect + recover (default)
 *   node scripts/session-supervisor.mjs --check    # detect only, never kill
 *   node scripts/session-supervisor.mjs --json     # machine-readable, for hooks
 *   node scripts/session-supervisor.mjs --verbose  # show every probe, even clean ones
 *
 * ## Why this exists, precisely
 *
 * On 2026-08-10 `chrome-headless-shell.exe` crashed three times inside seven
 * minutes and took a Playwright run with it. The cause is not a guess — it is in
 * the Windows logs:
 *
 *   Application/1000  22:05:20  chrome-headless-shell.exe  exc 0x80000003
 *                                 (STATUS_BREAKPOINT — Chromium IMMEDIATE_CRASH)
 *   Application/1000  22:12:06  KERNELBASE.dll +0x25369    exc 0xE0000008
 *   Application/1000  22:12:27  KERNELBASE.dll +0x25369    exc 0xE0000008
 *   System/2004       22:05:20  "Windows successfully diagnosed a low virtual
 *                                memory condition"
 *
 * `0xE0000008` is Chromium's own out-of-memory exception code, raised
 * deliberately from `RaiseException` by its `OnNoMemory` handler. The browser
 * did not fault; it *reported* that an allocation failed, in the same second
 * Windows independently diagnosed the machine as out of virtual memory.
 *
 * The three biggest consumers Windows named were **not** this project:
 * `vmmem` (the WSL2/Docker utility VM) at 3.23 GB, `Code.exe` at 1.19 GB and
 * `ChatGPT Classic.exe` at 1.08 GB — 5.5 GB of 7.88 GB physical committed before
 * Node, Next or Chromium allocated a byte.
 *
 * **That is the single most important thing this file encodes.** The obvious
 * supervisor checks for stale servers, held ports and orphan browsers, and every
 * one of those was *clean* at the moment of the crash. A supervisor that only
 * hunted orphans would have declared the environment healthy and then watched it
 * die again. So `memory` is a first-class detector here, it is the one that can
 * return a `blocked` verdict, and it names the offending processes whether or not
 * they belong to this repository.
 *
 * ## Design constraints
 *
 * 1. **Do not become the problem.** The diagnosis is resource exhaustion, so this
 *    must be cheap: it shells out to PowerShell exactly *once* for a single
 *    consolidated CIM query, rather than spawning a probe per check. Two
 *    processes total, ~1s. It never launches a browser, never starts a server and
 *    never spawns an MCP client to inspect anything.
 *
 * 2. **Never kill what it does not own.** Process selection is by command line
 *    matched against this workspace path. MCP servers, the operator's editor and
 *    the operator's browser are reported, never terminated — killing the MCP
 *    servers would sever the agent's own tooling mid-task.
 *
 * 3. **Preserve forensics before deleting.** The RC6.1 recovery deleted
 *    `test-results/` and `.playwright-mcp/`, which is where Playwright keeps its
 *    traces and console logs — so the crash had to be reconstructed from Windows
 *    Event Log alone. Anything this script removes is moved to `.env-quarantine/`
 *    first, not unlinked.
 *
 * Exit codes:  0 healthy (or repaired)   ·   1 blocked, human decision needed
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, renameSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const QUARANTINE = join(ROOT, '.env-quarantine');

const argv = new Set(process.argv.slice(2));
const CHECK_ONLY = argv.has('--check');
const AS_JSON = argv.has('--json');
const VERBOSE = argv.has('--verbose');
/** Say nothing at all when there is nothing to say. For the pre-task hook,
 *  which runs on every prompt and must not narrate its own health. */
const QUIET = argv.has('--quiet');

/** Ports this project is entitled to. 9222 is CDP; Playwright uses a pipe, so a
 *  listener there means something is running with --remote-debugging-port. */
const PORTS = [3000, 3001, 9222];

/**
 * Memory floors, in GB. Derived from the incident rather than picked: the crash
 * happened with ~1.6 GB physical free and the machine has a 25.5 GB commit
 * limit, so an absolute commit floor is meaningless here — physical headroom is
 * what ran out.
 */
const MEM_WARN_FREE_GB = 1.5;
const MEM_BLOCK_FREE_GB = 0.8;

const findings = [];
const actions = [];

function report(check, status, detail, fix) {
  /**
   * Nothing is ever "repaired" in `--check` mode.
   *
   * Every detector reports its verdict and *then* acts, which reads naturally
   * and was quietly wrong: under `--check` the `kill`/`quarantine` calls
   * correctly do nothing, but the already-queued `repaired` status still
   * printed as ` fixed`. A dry run that claims to have fixed things is worse
   * than no dry run — it is the one mode whose entire purpose is to be
   * believed about what it did not do.
   *
   * Downgrading here rather than at each call site means a detector added
   * later cannot reintroduce the lie by forgetting to check the flag.
   */
  const effective = CHECK_ONLY && status === 'repaired' ? 'warn' : status;
  findings.push({ check, status: effective, detail, ...(fix ? { fix } : {}) });
}

/* ------------------------------------------------------------------ *
 * One PowerShell round-trip for everything the OS has to tell us.
 * ------------------------------------------------------------------ */

const PROBE = `
$ErrorActionPreference='SilentlyContinue'
$os = Get-CimInstance Win32_OperatingSystem
$procs = Get-CimInstance Win32_Process -Filter "Name='node.exe' OR Name='chrome-headless-shell.exe' OR Name='chrome.exe'" |
  Select-Object ProcessId, Name, CommandLine, CreationDate, WorkingSetSize
$listeners = Get-NetTCPConnection -State Listen | Select-Object LocalPort, OwningProcess -Unique
$top = Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 5 |
  Select-Object ProcessName, @{n='MB';e={[math]::Round($_.WorkingSet64/1MB,0)}}
[pscustomobject]@{
  freePhysicalGB  = [math]::Round($os.FreePhysicalMemory*1KB/1GB,2)
  totalPhysicalGB = [math]::Round($os.TotalVisibleMemorySize*1KB/1GB,2)
  freeCommitGB    = [math]::Round($os.FreeVirtualMemory*1KB/1GB,2)
  processes       = @($procs)
  listeners       = @($listeners)
  topConsumers    = @($top)
} | ConvertTo-Json -Depth 5 -Compress
`;

function probe() {
  const out = execFileSync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-Command', PROBE],
    { encoding: 'utf8', maxBuffer: 12 * 1024 * 1024, windowsHide: true },
  );
  return JSON.parse(out);
}

/** PowerShell's ConvertTo-Json emits a bare object, not an array, for one item. */
const arr = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);

function kill(pid, why) {
  if (CHECK_ONLY) {
    actions.push(`would stop pid ${pid} (${why})`);
    return false;
  }
  try {
    process.kill(pid, 'SIGKILL');
    actions.push(`stopped pid ${pid} (${why})`);
    return true;
  } catch (error) {
    if (error.code === 'ESRCH') return true; // already gone; that is the goal
    actions.push(`FAILED to stop pid ${pid}: ${error.message}`);
    return false;
  }
}

/** Moves rather than deletes — see constraint 3. */
function quarantine(relPath, why) {
  const src = join(ROOT, relPath);
  if (!existsSync(src)) return false;
  if (CHECK_ONLY) {
    actions.push(`would quarantine ${relPath} (${why})`);
    return false;
  }
  mkdirSync(QUARANTINE, { recursive: true });
  // Stamped, so repeated runs never collide and never overwrite older evidence.
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  renameSync(src, join(QUARANTINE, `${relPath.replace(/[\\/]/g, '_')}-${stamp}`));
  actions.push(`quarantined ${relPath} -> .env-quarantine/ (${why})`);
  return true;
}

/* ------------------------------------------------------------------ *
 * Detectors
 * ------------------------------------------------------------------ */

const isOurs = (cmd) => !!cmd && cmd.includes('SheetFlow_AI_Website');
const isMcp = (cmd) =>
  !!cmd && (/server-filesystem|@playwright[\\/]mcp|modelcontextprotocol|mcp-server|sequential-thinking|context7/i).test(cmd);

/**
 * 1 · Stale npm / next servers belonging to this workspace.
 *
 * "Stale" is defined by **not holding a port**, not by age. The first draft of
 * this kept the highest PID and killed the rest, which is arbitrary and was
 * wrong the first time it was exercised: seeding a second server on :3001 made
 * it target the *working* :3000 server purely for being older. A server serving
 * a port is doing its job whatever its age; a server holding no port is by
 * definition orphaned — nothing can reach it and it will never exit.
 */
function checkStaleServers(nodes, listeners) {
  const servers = nodes.filter(
    (p) => isOurs(p.CommandLine) && !isMcp(p.CommandLine) && /next|npm-cli|npx-cli/i.test(p.CommandLine),
  );
  if (!servers.length) return report('stale-servers', 'ok', 'no project server processes running');

  // Every listening socket, not just the sanctioned ports — the distinction
  // matters and cost a second iteration to get right. Scoping the query to
  // 3000/3001/9222 made a server legitimately running on `PORT=4137 npm start`
  // look like it held no port at all, and the orphan rule would have killed a
  // process that was actively serving. Terminating live work is a far worse
  // failure than leaving a stray process for a human to notice.
  const portsByPid = new Map();
  for (const l of arr(listeners)) {
    const pid = Number(l.OwningProcess);
    if (!portsByPid.has(pid)) portsByPid.set(pid, new Set());
    portsByPid.get(pid).add(Number(l.LocalPort));
  }

  /**
   * Fail safe, not fail dangerous.
   *
   * The orphan test is "holds no port", which is only meaningful if the port
   * table was actually read. `Get-NetTCPConnection` can come back empty —
   * transient WMI/NSI failure, a hardened host, a race during teardown — and
   * with an empty map *every* server looks orphaned, so a supervisor whose job
   * is to protect the environment would terminate all of them at once. That is
   * the worst possible failure for this script and it is one bad query away.
   *
   * A host with a live server always has *something* listening, so an empty
   * table alongside running server processes is a broken probe rather than a
   * real observation. Report and touch nothing.
   *
   * This was not hypothetical: a production server exited at a turn boundary
   * and the first suspect was this function. `.env-quarantine/supervisor-last.json`
   * cleared it — `actions: []` — but only because the log existed. The bug it
   * ruled out was still real, and is closed here.
   */
  if (!portsByPid.size) {
    return report(
      'stale-servers',
      'warn',
      `${servers.length} project server process(es), but the port table came back empty — ` +
        'cannot tell orphaned from serving, so nothing was stopped',
      'run `npm run env:check` again; if it persists, Get-NetTCPConnection is failing on this host',
    );
  }

  // An npm wrapper never binds; its child does. Treat a wrapper as live, or
  // every run would kill the wrapper out from under a healthy server.
  const isWrapper = (p) => /npm-cli|npx-cli/i.test(p.CommandLine);
  const orphans = [];
  const strays = [];

  for (const p of servers) {
    if (isWrapper(p)) continue;
    const ports = portsByPid.get(Number(p.ProcessId));
    if (!ports || !ports.size) orphans.push(p);
    else if (![...ports].some((n) => PORTS.includes(n))) strays.push({ p, ports: [...ports] });
  }

  if (strays.length) {
    report(
      'stale-servers',
      'warn',
      `${strays.length} project server(s) on unsanctioned ports: ` +
        strays.map((s) => `pid ${s.p.ProcessId} :${s.ports.join(',')}`).join('; '),
      'left running — it is serving. Stop it by hand if it is a leftover.',
    );
  }

  if (!orphans.length) {
    if (!strays.length) report('stale-servers', 'ok', `${servers.length} project server process(es), all bound`);
    return;
  }
  report('stale-servers', 'repaired', `${orphans.length} project server(s) bound to no port at all — orphaned`);
  for (const p of orphans) kill(p.ProcessId, 'project server bound to no port');
}

/** 2 + 3 · Playwright runners and orphaned headless Chrome. */
function checkBrowsers(all) {
  const shells = all.filter((p) => p.Name === 'chrome-headless-shell.exe');
  const runners = all.filter((p) => isOurs(p.CommandLine) && /playwright/i.test(p.CommandLine) && !isMcp(p.CommandLine));

  if (!shells.length && !runners.length) {
    return report('browsers', 'ok', 'no headless Chrome or Playwright runner processes');
  }

  // A headless shell with no runner alive is an orphan by definition — nothing
  // is driving it and it will never exit on its own.
  if (shells.length && !runners.length) {
    report('browsers', 'repaired', `${shells.length} orphaned chrome-headless-shell (no runner alive)`);
    for (const p of shells) kill(p.ProcessId, 'orphaned headless Chrome');
    return;
  }
  report('browsers', 'ok', `${runners.length} runner(s), ${shells.length} shell(s) — a test run is in progress`);
}

/** 4 · Locked .next — the EPERM-on-unlink failure mode. */
function checkNextLock(nodes) {
  const nextDir = join(ROOT, '.next');
  if (!existsSync(nextDir)) return report('next-lock', 'ok', '.next absent (clean build will be created)');

  const holder = nodes.find((p) => isOurs(p.CommandLine) && /next["'\s]*start|next-server/i.test(p.CommandLine));
  if (!holder) return report('next-lock', 'ok', '.next present, no server holding it');

  // Not repaired automatically: a running server is usually *wanted*. This is a
  // warning aimed at the next `npm run build`, which is what actually fails.
  report(
    'next-lock',
    'warn',
    `.next is held by next start (pid ${holder.ProcessId}) — 'npm run build' will fail EPERM on unlink`,
    `stop pid ${holder.ProcessId} before building, or run: node scripts/session-supervisor.mjs --release-next`,
  );
  if (argv.has('--release-next')) {
    kill(holder.ProcessId, 'releasing .next for a build');
    findings.at(-1).status = 'repaired';
  }
}

/** 5 · Occupied ports. */
function checkPorts(listeners, nodes) {
  const byPid = new Map(nodes.map((p) => [Number(p.ProcessId), p]));
  // The probe returns every listening socket on the host now (see
  // `checkStaleServers`), so the narrowing that used to live in the query
  // happens here instead.
  const seen = new Set();
  const busy = arr(listeners).filter((l) => {
    if (!PORTS.includes(Number(l.LocalPort))) return false;
    // IPv4 and IPv6 bindings of one server are two rows and one fact.
    const key = `${l.LocalPort}:${l.OwningProcess}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (!busy.length) return report('ports', 'ok', `${PORTS.join(', ')} all free`);

  for (const l of busy) {
    const pid = Number(l.OwningProcess);
    const owner = byPid.get(pid);

    if (owner && isOurs(owner.CommandLine)) {
      report('ports', 'ok', `:${l.LocalPort} held by this project (pid ${pid})`);
      continue;
    }

    /**
     * Unidentified is not the same as foreign, and conflating them is how a
     * cleanup tool kills something it should not.
     *
     * `owner` is undefined whenever the probe could not read that process:
     * it is not a `node.exe` (so outside the probe's filter), it is running as
     * another user, or — the case actually observed — it is *mid-teardown* and
     * Win32_Process returns a null CommandLine. A dying Next server was
     * classified "foreign" on exactly this path. It happened to already be
     * exiting, so nothing was lost, but the same branch would terminate a
     * service running as SYSTEM that merely happens to hold the port.
     *
     * Only a process this script can positively identify as *not* ours is
     * killed. Everything else is surfaced for a human, who can see the whole
     * process table and this script cannot.
     */
    if (!owner) {
      report(
        'ports',
        'warn',
        `:${l.LocalPort} held by pid ${pid}, which this probe cannot identify — not touched`,
        `identify it first: Get-CimInstance Win32_Process -Filter "ProcessId=${pid}" | Select CommandLine`,
      );
      continue;
    }

    // Positively identified as a node process that is not this workspace's.
    const stopped = kill(pid, `foreign listener on :${l.LocalPort}`);
    report(
      'ports',
      stopped ? 'repaired' : 'warn',
      `:${l.LocalPort} held by a foreign node process (pid ${pid})`,
    );
  }
}

/** 6 · Duplicate Node processes for the same role. */
function checkDuplicateNode(nodes) {
  const ours = nodes.filter((p) => isOurs(p.CommandLine) && !isMcp(p.CommandLine));
  if (ours.length <= 2) {
    return report('duplicate-node', 'ok', `${ours.length} project node process(es)`);
  }
  report('duplicate-node', 'warn', `${ours.length} project node processes — more than a server + wrapper`,
    'inspect with: Get-CimInstance Win32_Process -Filter "Name=\'node.exe\'" | Select ProcessId,CommandLine');
}

/** 7 · Duplicate MCP sessions. Reported, never killed — see constraint 2. */
function checkDuplicateMcp(nodes) {
  const mcp = nodes.filter((p) => isMcp(p.CommandLine));
  if (!mcp.length) return report('duplicate-mcp', 'ok', 'no MCP server processes seen');

  const byServer = new Map();
  for (const p of mcp) {
    const m = /server-filesystem|@playwright[\\/]mcp|sequential-thinking|context7|mcp-server-([a-z-]+)/i.exec(p.CommandLine);
    const key = (m?.[0] ?? 'mcp').toLowerCase().replace(/[\\/]/g, '-');
    byServer.set(key, (byServer.get(key) ?? 0) + 1);
  }
  // npx launches a wrapper plus the real server, so two per server is normal.
  const dupes = [...byServer.entries()].filter(([, n]) => n > 2);
  const mb = Math.round(mcp.reduce((sum, p) => sum + Number(p.WorkingSetSize ?? 0), 0) / 1048576);

  if (!dupes.length) return report('duplicate-mcp', 'ok', `${mcp.length} MCP process(es), ${mb} MB, no duplication`);

  report(
    'duplicate-mcp',
    'warn',
    `duplicated MCP sessions holding ${mb} MB: ${dupes.map(([k, n]) => `${k}x${n / 2}`).join(', ')}`,
    'restart the MCP client to collapse to one instance per server — this script will not kill the agent\'s own tooling',
  );
}

/**
 * 8 · Memory headroom. The detector the incident actually demanded.
 *
 * This is the only check that can block, because it is the only one whose
 * failure mode is a Chromium OOM abort rather than something recoverable by
 * killing a process this repository owns.
 */
function checkMemory(p) {
  const free = p.freePhysicalGB;
  const top = arr(p.topConsumers).map((t) => `${t.ProcessName} ${t.MB}MB`).join(', ');

  if (free < MEM_BLOCK_FREE_GB) {
    return report(
      'memory',
      'blocked',
      `${free} GB physical free of ${p.totalPhysicalGB} GB — below the ${MEM_BLOCK_FREE_GB} GB floor. ` +
        `Launching Chromium here reproduces the 0xE0000008 OOM abort. Top: ${top}`,
      'close the largest non-essential consumer first — on this host that is usually vmmem (WSL2/Docker, ~3.2 GB): wsl --shutdown',
    );
  }
  if (free < MEM_WARN_FREE_GB) {
    return report(
      'memory',
      'warn',
      `${free} GB physical free of ${p.totalPhysicalGB} GB — thin for a browser run. Top: ${top}`,
      'run the test suite with --workers=1, and do not hold the Playwright MCP browser open alongside it',
    );
  }
  report('memory', 'ok', `${free} GB physical free of ${p.totalPhysicalGB} GB, ${p.freeCommitGB} GB commit available`);
}

/** 9 · Forensics that a previous cleanup would have destroyed. */
function checkForensics() {
  const results = join(ROOT, 'test-results');
  if (!existsSync(results)) return report('forensics', 'ok', 'no stale test-results/');
  let n = 0;
  try { n = readdirSync(results).length; } catch { /* unreadable is not fatal */ }
  if (!n) return report('forensics', 'ok', 'test-results/ empty');
  quarantine('test-results', `${n} failure artifact(s) from a previous run`);
  report('forensics', 'repaired', `preserved ${n} test-results artifact(s) instead of deleting them`);
}

/* ------------------------------------------------------------------ *
 * Run
 * ------------------------------------------------------------------ */

let snapshot;
try {
  snapshot = probe();
} catch (error) {
  const msg = `supervisor probe failed: ${error.message}`;
  if (AS_JSON) console.log(JSON.stringify({ verdict: 'unknown', error: msg }));
  else console.error(`  !! ${msg}`);
  // A supervisor that cannot see the machine must not block work on it.
  process.exit(0);
}

const all = arr(snapshot.processes);
const nodes = all.filter((p) => p.Name === 'node.exe');

checkMemory(snapshot);
checkStaleServers(nodes, snapshot.listeners);
checkBrowsers(all);
checkNextLock(nodes);
checkPorts(snapshot.listeners, nodes);
checkDuplicateNode(nodes);
checkDuplicateMcp(nodes);
checkForensics();

const blocked = findings.filter((f) => f.status === 'blocked');
const repaired = findings.filter((f) => f.status === 'repaired');
const warned = findings.filter((f) => f.status === 'warn');
const verdict = blocked.length ? 'blocked' : repaired.length ? 'repaired' : warned.length ? 'warn' : 'healthy';

if (AS_JSON) {
  console.log(JSON.stringify({ verdict, findings, actions }, null, 0));
} else {
  const ICON = { ok: '  ok  ', warn: ' warn ', repaired: ' fixed', blocked: 'BLOCK ' };
  const shown = VERBOSE ? findings : findings.filter((f) => f.status !== 'ok');

  if (!shown.length) {
    if (!QUIET) console.log('session-supervisor: environment healthy');
  } else if (QUIET && verdict === 'warn' && !actions.length) {
    // Warnings with nothing repaired are standing conditions (thin memory, a
    // held .next, duplicated MCP). Repeating them on every single prompt trains
    // the reader to ignore the one time it matters, so quiet mode states them
    // once per condition-set and then stops.
    // Signature is the *condition set*, never the detail text. The first
    // version hashed the detail, which embeds live figures — "1.27 GB free",
    // "321 MB" — so it differed on every run and the dedupe never once fired.
    // What should suppress a repeat is "the same checks are still unhappy",
    // which is exactly check+status and nothing else.
    const sig = shown.map((f) => `${f.check}:${f.status}`).sort().join('|');
    const seenPath = join(ROOT, '.env-quarantine', 'supervisor-lastwarn.txt');
    let prev = '';
    try { prev = existsSync(seenPath) ? String(readFileSync(seenPath)) : ''; } catch { /* first run */ }
    if (prev !== sig) {
      try { mkdirSync(join(ROOT, '.env-quarantine'), { recursive: true }); writeFileSync(seenPath, sig); } catch { /* non-fatal */ }
      console.log('session-supervisor');
      for (const f of shown) console.log(`  ${ICON[f.status]} ${f.check.padEnd(16)} ${f.detail}`);
    }
  } else {
    console.log('session-supervisor');
    for (const f of shown) {
      console.log(`  ${ICON[f.status]} ${f.check.padEnd(16)} ${f.detail}`);
      if (f.fix) console.log(`         ${' '.repeat(16)} -> ${f.fix}`);
    }
    if (actions.length) {
      console.log('  actions:');
      for (const a of actions) console.log(`    - ${a}`);
    }
  }
}

// A log, so a crash three hours from now has a before-picture to read.
try {
  mkdirSync(join(ROOT, '.env-quarantine'), { recursive: true });
  writeFileSync(
    join(ROOT, '.env-quarantine', 'supervisor-last.json'),
    JSON.stringify({ at: new Date().toISOString(), verdict, findings, actions, snapshot: { ...snapshot, processes: undefined } }, null, 2),
  );
} catch { /* logging must never be the thing that fails a run */ }

process.exit(verdict === 'blocked' ? 1 : 0);
