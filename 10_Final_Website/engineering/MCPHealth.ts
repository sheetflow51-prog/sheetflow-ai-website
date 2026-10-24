/**
 * MCPHealth — the capability roster, and an honest answer for every gap.
 *
 * ## What this module can and cannot know
 *
 * There is a hard boundary here that the design has to respect rather than
 * paper over. A Node script can read the *configuration* of an MCP server and
 * see its *process*, but it cannot know whether the agent's client actually
 * completed a handshake with it — that state lives inside Claude Code, not on
 * the filesystem. During RC6.1, `context7` and `chrome-devtools` had healthy
 * npx processes and had still never completed a connection that session.
 *
 * So this module reports three independent facts and never conflates them:
 *
 *   1. **configured** — present in `.mcp.json` / enabled in settings.local.json
 *   2. **running**    — a live process whose command line matches the server
 *   3. **observed**   — what the agent last recorded via `record()`
 *
 * A server can be configured and running and still unusable. Saying "running"
 * when the question was "usable" is exactly the fabrication this project's
 * evidence rules forbid, so `observed` is the only field allowed to claim
 * usability, it carries a timestamp, and it goes stale.
 *
 * ## Why non-MCP capabilities are in the same roster
 *
 * The instruction was "actively use every available local capability", and the
 * named list mixes three different mechanisms: stdio MCP servers from
 * `.mcp.json`, claude.ai connectors authorised per-account, and Claude Code
 * *skills*, which are not MCP at all. A roster that only covered `.mcp.json`
 * would silently answer "21st.dev: unavailable" and "UI/UX Pro Max:
 * unavailable" with the same words, when the first is genuinely not installed
 * and the second is installed and callable as a skill. The `kind` field keeps
 * them apart.
 *
 * ## What this module will never do
 *
 * Kill an MCP process. The .mjs supervisor has the same rule for the same
 * reason: those servers are the agent's own tooling, and terminating them
 * mid-task severs the connection the task depends on. Duplicates are reported
 * with the megabytes they hold and left alone.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO, STATE_DIR } from './paths.ts';
import { finding, worst } from './types.ts';
import type { Finding, Status } from './types.ts';
import type { ProcRow } from './ResourceMonitor.ts';
import { isMcpProcess } from './ResourceMonitor.ts';

/* ------------------------------------------------------------------ *
 * The roster
 * ------------------------------------------------------------------ */

export type CapabilityKind = 'mcp-stdio' | 'mcp-http' | 'mcp-connector' | 'skill';

export interface Capability {
  id: string;
  label: string;
  kind: CapabilityKind;
  /** What this project would actually use it for. Blank means "nothing yet". */
  usedFor: string;
  /** Matches the process command line, for stdio servers. */
  processMatch?: RegExp;
}

/**
 * The capabilities RC7 named, plus the ones this repository already depends on.
 *
 * `usedFor` is not decoration — a capability with no stated use is one nobody
 * will ever reach for, and the roster is supposed to prevent exactly that.
 */
export const ROSTER: Capability[] = [
  {
    id: 'playwright',
    label: 'Playwright MCP',
    kind: 'mcp-stdio',
    processMatch: /@playwright[\\/]mcp/i,
    usedFor: 'driving a real browser for the in-page visual audit and console capture',
  },
  {
    id: 'chrome-devtools',
    label: 'Chrome DevTools MCP',
    kind: 'mcp-stdio',
    processMatch: /chrome-devtools-mcp/i,
    usedFor: 'performance traces, Lighthouse runs and heap snapshots without a second runner',
  },
  {
    id: 'filesystem',
    label: 'Filesystem MCP',
    kind: 'mcp-stdio',
    processMatch: /server-filesystem/i,
    usedFor: 'bulk reads across the workspace outside the agent’s own file tools',
  },
  {
    id: 'context7',
    label: 'Context7',
    kind: 'mcp-stdio',
    processMatch: /context7/i,
    usedFor: 'current Next 16 / React 19 / Tailwind docs instead of recalled API shapes',
  },
  {
    id: 'sequential-thinking',
    label: 'Sequential Thinking MCP',
    kind: 'mcp-stdio',
    processMatch: /sequential-thinking/i,
    usedFor: 'structured decomposition of a multi-phase design change',
  },
  {
    id: 'github',
    label: 'GitHub MCP',
    kind: 'mcp-http',
    usedFor: 'PR and issue state for ReleaseManager',
  },
  {
    id: 'adobe',
    label: 'Adobe for creativity',
    kind: 'mcp-connector',
    usedFor: 'font recommendation, image adjustment and vectorisation for brand assets',
  },
  {
    id: 'figma',
    label: 'Figma',
    kind: 'mcp-connector',
    usedFor: 'design-system tokens and screenshots to diff the built page against',
  },
  {
    id: 'vercel',
    label: 'Vercel',
    kind: 'mcp-connector',
    usedFor: 'deployment state, runtime errors and web analytics for ReleaseManager',
  },
  {
    id: 'ui-ux-pro-max',
    label: 'UI/UX Pro Max',
    kind: 'skill',
    usedFor: 'style, palette, typography-pairing and GSAP motion references for visual work',
  },
  {
    id: 'ui-styling',
    label: 'ui-styling',
    kind: 'skill',
    usedFor: 'shadcn/Radix component and accessibility patterns',
  },
  {
    id: 'design-system',
    label: 'design-system',
    kind: 'skill',
    usedFor: 'three-layer token architecture, which the VOS surface ladder already follows',
  },
  {
    id: 'dataviz',
    label: 'dataviz',
    kind: 'skill',
    usedFor: 'any chart or metric tile added to a page',
  },
  {
    id: 'code-review',
    label: 'code-review',
    kind: 'skill',
    usedFor: 'the correctness pass the automated gates cannot perform',
  },
  {
    id: '21st-dev',
    label: '21st.dev',
    kind: 'mcp-stdio',
    processMatch: /21st|magic-mcp/i,
    usedFor: 'component generation — named in RC7 but not present in this workspace',
  },
  {
    id: 'magic-mcp',
    label: 'Magic MCP',
    kind: 'mcp-stdio',
    processMatch: /@21st-dev[\\/]magic|magic-mcp/i,
    usedFor: 'component generation — named in RC7 but not present in this workspace',
  },
];

/* ------------------------------------------------------------------ *
 * Configuration
 * ------------------------------------------------------------------ */

interface McpConfig {
  mcpServers?: Record<string, { type?: string; command?: string; args?: string[]; url?: string }>;
}

function readJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch {
    return null;
  }
}

export function configuredServers(): { servers: Record<string, unknown>; enabled: string[] } {
  const mcp = readJson<McpConfig>(join(REPO, '.mcp.json'));
  const local = readJson<{ enabledMcpjsonServers?: string[] }>(join(REPO, '.claude', 'settings.local.json'));
  return {
    servers: mcp?.mcpServers ?? {},
    enabled: local?.enabledMcpjsonServers ?? [],
  };
}

/* ------------------------------------------------------------------ *
 * Observation — written by the agent, read by the report
 * ------------------------------------------------------------------ */

export type ObservedState = 'connected' | 'unavailable' | 'needs-auth' | 'not-installed';

export interface Observation {
  state: ObservedState;
  /** Required for anything other than `connected`. The report prints it verbatim. */
  why?: string;
  at: string;
}

const OBSERVED_PATH = () => join(STATE_DIR, 'capabilities.json');

export function readObservations(): Record<string, Observation> {
  return readJson<Record<string, Observation>>(OBSERVED_PATH()) ?? {};
}

/**
 * Record what the agent actually saw.
 *
 * This is the only path by which "usable" enters the system, and it is
 * deliberately a write from outside rather than something inferred here. If
 * nobody records an observation, the report says "not observed this session"
 * rather than guessing from the process table.
 */
export function record(id: string, state: ObservedState, why?: string): void {
  const all = readObservations();
  all[id] = { state, why, at: new Date().toISOString() };
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(OBSERVED_PATH(), JSON.stringify(all, null, 2));
}

/** Hours after which an observation stops being evidence about *now*. */
const OBSERVATION_TTL_H = 6;

/* ------------------------------------------------------------------ *
 * Assessment
 * ------------------------------------------------------------------ */

export interface CapabilityStatus {
  capability: Capability;
  configured: boolean;
  enabled: boolean;
  processes: number;
  heldMB: number;
  observed?: Observation;
  status: Status;
  detail: string;
}

export function assess(processes: ProcRow[] = []): {
  capabilities: CapabilityStatus[];
  findings: Finding[];
  status: Status;
} {
  const { servers, enabled } = configuredServers();
  const observed = readObservations();
  const mcpProcs = processes.filter((p) => isMcpProcess(p.CommandLine));

  const capabilities: CapabilityStatus[] = ROSTER.map((cap) => {
    const configured = cap.kind === 'skill' || cap.kind === 'mcp-connector' ? true : cap.id in servers;
    const isEnabled = cap.kind === 'mcp-stdio' || cap.kind === 'mcp-http' ? enabled.includes(cap.id) : true;
    const own = cap.processMatch ? mcpProcs.filter((p) => cap.processMatch!.test(p.CommandLine ?? '')) : [];
    const heldMB = Math.round(own.reduce((sum, p) => sum + p.WorkingSetSize, 0) / 1048576);

    const obs = observed[cap.id];
    const fresh = obs && (Date.now() - Date.parse(obs.at)) / 3_600_000 < OBSERVATION_TTL_H;

    let status: Status;
    let detail: string;

    if (!configured) {
      status = 'skipped';
      detail = `not configured in .mcp.json — ${cap.usedFor}`;
    } else if (fresh && obs.state === 'connected') {
      status = 'ok';
      // The recorded note is printed verbatim and never summarised away. "Adobe
      // — connected" reads as "a call succeeded"; the note is where "tools
      // available, not exercised" survives, and the difference between those
      // two sentences is the difference between evidence and assumption.
      detail = `connected${own.length ? `, ${own.length} process(es) / ${heldMB} MB` : ''} — ${cap.usedFor}${obs.why ? `. Observed: ${obs.why}` : ''}`;
    } else if (fresh && obs.state === 'needs-auth') {
      status = 'warn';
      detail = `requires authorisation — ${obs.why ?? 'OAuth not completed'}`;
    } else if (fresh && (obs.state === 'unavailable' || obs.state === 'not-installed')) {
      status = 'warn';
      detail = obs.why ?? 'reported unavailable, no reason recorded';
    } else if (own.length) {
      // Configured, alive, unobserved. This is the exact RC6.1 context7 case.
      status = 'unknown';
      detail = `${own.length} process(es) alive holding ${heldMB} MB, but no connection observed this session — a live process is not a completed handshake`;
    } else if (!isEnabled) {
      status = 'skipped';
      detail = 'configured but not in enabledMcpjsonServers';
    } else if (cap.kind === 'skill') {
      // A skill has no process and no handshake. It is invoked by the agent and
      // is therefore only ever knowable by observation — saying "no process
      // seen" about one would be measuring the wrong thing and reporting the
      // answer as if it meant something.
      status = 'unknown';
      detail = `installed as a Claude Code skill; usability is only knowable when the agent invokes it — ${cap.usedFor}`;
    } else if (cap.kind === 'mcp-connector') {
      status = 'unknown';
      detail = `claude.ai connector — runs remotely, so no local process exists to observe; state is only knowable from a call — ${cap.usedFor}`;
    } else {
      status = 'unknown';
      detail = 'configured, no process seen and no connection observed';
    }

    return { capability: cap, configured, enabled: isEnabled, processes: own.length, heldMB, observed: obs, status, detail };
  });

  const findings: Finding[] = capabilities.map((c) =>
    finding(`mcp:${c.capability.id}`, c.status, `${c.capability.label} — ${c.detail}`, {
      evidence: { processes: c.processes, heldMB: c.heldMB, observed: c.observed ?? null },
    }),
  );

  findings.push(duplicateFinding(mcpProcs));

  const unused = capabilities.filter((c) => c.status === 'ok' && !c.capability.usedFor);
  if (unused.length) {
    findings.push(
      finding('mcp:unused', 'warn', `${unused.length} connected capability with no stated use: ${unused.map((c) => c.capability.label).join(', ')}`),
    );
  }

  return { capabilities, findings, status: worst(findings.map((f) => f.status)) };
}

/**
 * Duplicate sessions, reported in megabytes.
 *
 * `npx` launches a wrapper plus the real server, so two processes per server is
 * normal and three or more is duplication. RC6.1 measured 339 MB held by
 * duplicated sessions on a box with 2.4 GB free — worth reclaiming, and still
 * a tenth of what `wsl --shutdown` returns, which is why this is a `warn` and
 * not a blocker.
 */
export function duplicateFinding(mcpProcs: ProcRow[]): Finding {
  if (!mcpProcs.length) return finding('mcp:duplicates', 'ok', 'no MCP server processes seen');

  const byServer = new Map<string, ProcRow[]>();
  for (const p of mcpProcs) {
    const m = /server-filesystem|@playwright[\\/]mcp|sequential-thinking|context7|chrome-devtools-mcp|mcp-server-([a-z-]+)/i.exec(
      p.CommandLine ?? '',
    );
    const key = (m?.[0] ?? 'mcp').toLowerCase().replace(/[\\/]/g, '-');
    byServer.set(key, [...(byServer.get(key) ?? []), p]);
  }

  const dupes = [...byServer.entries()].filter(([, ps]) => ps.length > 2);
  const totalMB = Math.round(mcpProcs.reduce((s, p) => s + p.WorkingSetSize, 0) / 1048576);

  if (!dupes.length) {
    return finding('mcp:duplicates', 'ok', `${mcpProcs.length} MCP process(es) holding ${totalMB} MB, one instance per server`);
  }
  const wastedMB = dupes.reduce(
    (sum, [, ps]) => sum + Math.round(ps.slice(2).reduce((s, p) => s + p.WorkingSetSize, 0) / 1048576),
    0,
  );
  // Process counts, not a derived instance count. `npx` launches a wrapper plus
  // the real server, so 3 processes is one full instance and one orphaned half;
  // dividing by two and printing "x1" implies a tidiness the process table does
  // not have.
  return finding(
    'mcp:duplicates',
    'warn',
    `duplicated MCP sessions: ${dupes.map(([k, ps]) => `${k} ${ps.length} processes (2 expected)`).join(', ')} — ~${wastedMB} MB of ${totalMB} MB reclaimable`,
    {
      fix: 'restart the MCP client to collapse to one instance per server. This system will not kill the agent’s own tooling.',
      evidence: Object.fromEntries(dupes.map(([k, ps]) => [k, ps.length])),
    },
  );
}
