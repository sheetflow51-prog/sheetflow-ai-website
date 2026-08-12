/**
 * ReleaseManager — git state, readiness, and the three documents.
 *
 * ## The rule that shapes every table in here
 *
 * Each report has a column for things that were **not** measured, and it is
 * never empty when something was skipped. That is a deliberate inversion of how
 * status documents usually work: the normal failure of a green dashboard is not
 * that it lies about a failing check, it is that it silently omits the check
 * that never ran. On this box that omission is guaranteed rather than possible
 * — a browser gate is refused whenever free memory is under its measured floor,
 * and during RC7.1 that refusal fired repeatedly on a machine holding 5.5 GB in
 * applications unrelated to this project.
 *
 * So `verdictOf` treats `skipped` and `unknown` as amber, the reports print the
 * reason next to every skip, and a run where nothing was measured produces an
 * amber report rather than a green one.
 *
 * ## Why the reports are Markdown at the repository root
 *
 * They sit beside `ENVIRONMENT_STATUS.md` and `VISUAL_OPERATING_SYSTEM.md`,
 * which are the documents this project already reads. A status page nobody
 * opens has the same value as a check nobody runs.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO, REPORTS, rel } from './paths.ts';
import { forensicsMarkdown } from './ResourceMonitor.ts';
import type { Forensics } from './ResourceMonitor.ts';
import { isGreen, verdictOf, worst } from './types.ts';
import type { Finding, GateResult, Status, Verdict } from './types.ts';

/* ------------------------------------------------------------------ *
 * Git
 * ------------------------------------------------------------------ */

export interface GitState {
  branch: string;
  head: string;
  dirty: string[];
  untracked: string[];
  ahead: number;
  behind: number;
  recent: string[];
  available: boolean;
}

function git(args: string[]): string {
  return execFileSync('git', ['-C', REPO, ...args], { encoding: 'utf8', windowsHide: true }).trim();
}

export function gitState(): GitState {
  const empty: GitState = { branch: '', head: '', dirty: [], untracked: [], ahead: 0, behind: 0, recent: [], available: false };
  try {
    const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
    const head = git(['rev-parse', '--short', 'HEAD']);
    const status = git(['status', '--porcelain']).split('\n').filter(Boolean);
    const dirty = status.filter((l) => !l.startsWith('??')).map((l) => l.slice(3));
    const untracked = status.filter((l) => l.startsWith('??')).map((l) => l.slice(3));
    let ahead = 0;
    let behind = 0;
    try {
      const counts = git(['rev-list', '--left-right', '--count', `origin/${branch}...HEAD`]).split(/\s+/);
      behind = Number(counts[0] ?? 0);
      ahead = Number(counts[1] ?? 0);
    } catch {
      // No upstream is a normal state for a local feature branch.
    }
    const recent = git(['log', '--oneline', '-5']).split('\n').filter(Boolean);
    return { branch, head, dirty, untracked, ahead, behind, recent, available: true };
  } catch {
    return empty;
  }
}

/* ------------------------------------------------------------------ *
 * Readiness
 * ------------------------------------------------------------------ */

export interface Readiness {
  verdict: Verdict;
  blockers: Finding[];
  unmeasured: Array<{ what: string; why: string }>;
  summary: string;
}

export function assess(gates: GateResult[], findings: Finding[]): Readiness {
  const statuses = [...gates.map((g) => g.status), ...findings.map((f) => f.status)];
  const verdict = verdictOf(statuses);

  const blockers = [
    ...gates.filter((g) => g.status === 'fail' || g.status === 'blocked').map((g) => ({
      check: g.gate,
      status: g.status,
      detail: g.detail,
    })),
    ...findings.filter((f) => f.status === 'fail' || f.status === 'blocked'),
  ];

  const unmeasured = [
    ...gates.filter((g) => g.status === 'skipped' || g.status === 'unknown').map((g) => ({
      what: g.gate,
      why: g.reason ?? g.detail,
    })),
    ...findings.filter((f) => f.status === 'skipped' || f.status === 'unknown').map((f) => ({
      what: f.check,
      why: f.detail,
    })),
  ];

  const passed = gates.filter((g) => isGreen(g.status)).length;
  const summary =
    verdict === 'green'
      ? `${passed} of ${gates.length} gates green, nothing unmeasured.`
      : verdict === 'blocked'
        ? `Blocked: ${blockers.length} condition(s) need a human decision.`
        : verdict === 'red'
          ? `${blockers.length} failing gate(s) or finding(s).`
          : `${passed} of ${gates.length} gates green, ${unmeasured.length} check(s) not measured — the gap, not the pass rate, is the story.`;

  return { verdict, blockers, unmeasured, summary };
}

/* ------------------------------------------------------------------ *
 * Markdown helpers
 * ------------------------------------------------------------------ */

const ICON: Record<Status, string> = {
  ok: '✅',
  repaired: '🔧',
  skipped: '⏭️',
  unknown: '❔',
  warn: '⚠️',
  fail: '❌',
  blocked: '⛔',
};

const VERDICT_LINE: Record<Verdict, string> = {
  green: '**Status: GREEN.** Every gate that ran passed, and every gate ran.',
  amber: '**Status: AMBER.** Nothing is failing, but something was not measured. Read the *not measured* table before treating this as a pass.',
  red: '**Status: RED.** At least one gate failed.',
  blocked: '**Status: BLOCKED.** The environment cannot support the work; a human decision is needed.',
};

const esc = (s: string) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

function findingsTable(findings: Finding[]): string {
  if (!findings.length) return '_No findings._\n';
  const rows = findings.map(
    (f) => `| ${ICON[f.status]} | \`${esc(f.check)}\` | ${esc(f.detail)} | ${f.where ? `\`${esc(f.where)}\`` : '—'} |`,
  );
  return ['| | Check | Detail | Where |', '|---|---|---|---|', ...rows].join('\n') + '\n';
}

function unmeasuredTable(items: Array<{ what: string; why: string }>): string {
  if (!items.length) return '_Everything in scope was measured._\n';
  const rows = items.map((i) => `| \`${esc(i.what)}\` | ${esc(i.why)} |`);
  return ['| Not measured | Why |', '|---|---|', ...rows].join('\n') + '\n';
}

const stamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

/* ------------------------------------------------------------------ *
 * The three documents
 * ------------------------------------------------------------------ */

export interface ReportInput {
  gates: GateResult[];
  environment: Finding[];
  mcp: Finding[];
  visual: Finding[];
  motion: Finding[];
  performance: Finding[];
  plan?: string;
  actions: string[];
  snapshotNote?: string;
}

export function writeEngineeringStatus(input: ReportInput, git: GitState, readiness: Readiness): string {
  const { gates } = input;
  const gateRows = gates.map(
    (g) =>
      `| ${ICON[g.status]} | \`${g.gate}\` | ${g.ms ? `${(g.ms / 1000).toFixed(1)} s` : '—'} | ${esc(g.detail)}${g.autoFixed ? ' _(auto-fixed, re-run)_' : ''} |`,
  );

  const body = `# ENGINEERING_STATUS

**RC7 — Engineering Supervisor** · generated ${stamp()} by \`engineering/EngineeringSupervisor.ts\`

${VERDICT_LINE[readiness.verdict]}

${readiness.summary}

---

## 1. Gates

${gates.length ? ['| | Gate | Time | Result |', '|---|---|---|---|', ...gateRows].join('\n') : '_No gates ran._'}

## 2. Not measured

A gate that did not run is not a gate that passed. Each row below is a claim this
report is **not** making.

${unmeasuredTable(readiness.unmeasured)}

## 3. Blockers

${readiness.blockers.length ? findingsTable(readiness.blockers as Finding[]) : '_None._\n'}

## 4. Performance

${findingsTable(input.performance)}

## 5. Motion and animation

${findingsTable(input.motion)}

${input.plan ? `## 6. Plan\n\n\`\`\`\n${input.plan}\n\`\`\`\n` : ''}

## ${input.plan ? '7' : '6'}. Repository

| Field | Value |
|---|---|
| Branch | \`${git.branch || 'unknown'}\` |
| HEAD | \`${git.head || 'unknown'}\` |
| Tracked changes | ${git.dirty.length} |
| Untracked | ${git.untracked.length} |
| Ahead / behind upstream | ${git.ahead} / ${git.behind} |

${git.recent.length ? '```\n' + git.recent.join('\n') + '\n```' : ''}

${input.actions.length ? `## Actions taken\n\n${input.actions.map((a) => `- ${a}`).join('\n')}\n` : ''}
`;
  writeFileSync(REPORTS.engineering, body, 'utf8');
  return REPORTS.engineering;
}

export function writeVisualStatus(
  input: ReportInput,
  scores: Array<{ url: string; overall: number | null; dimensions: Record<string, number | null>; deductions: Array<{ dimension: string; points: number; why: string }>; notMeasured: string[] }>,
  regression: Finding[],
): string {
  const dimensionNames = [
    'spacing', 'alignment', 'typography', 'contrast', 'depth',
    'glass', 'elevation', 'motion', 'responsive', 'hierarchy', 'vitals',
  ];

  const header = `| Page | Overall | ${dimensionNames.join(' | ')} |`;
  const divider = `|---|---|${dimensionNames.map(() => '---').join('|')}|`;
  const rows = scores.map((s) => {
    const cells = dimensionNames.map((d) => {
      const v = s.dimensions[d];
      return v === null || v === undefined ? '—' : String(v);
    });
    return `| \`${esc(s.url)}\` | **${s.overall ?? '—'}** | ${cells.join(' | ')} |`;
  });

  const deductions = scores
    .flatMap((s) => s.deductions.map((d) => ({ ...d, url: s.url })))
    .sort((a, b) => b.points - a.points)
    .slice(0, 25);

  const body = `# VISUAL_STATUS

**RC7 — Engineering Supervisor** · generated ${stamp()}

Scores are the mean of the dimensions that could be measured on each page. A
dimension shown as \`—\` was **not measured**; it is excluded from the mean rather
than counted as zero, because an unmeasured contrast pass is not a page with bad
contrast. Weights are equal across dimensions, which is arbitrary and says so —
any other weighting would be a claim about relative importance that nobody here
has measured.

---

## 1. Page quality

${scores.length ? [header, divider, ...rows].join('\n') : '_No page audits recorded. Run the in-page probe against a live server — it needs a browser, and MemoryGuard admits one at 1.4 GB free._'}

## 2. What cost the most points

${deductions.length
      ? ['| Points | Page | Dimension | Why |', '|---|---|---|---|', ...deductions.map((d) => `| −${Math.round(d.points)} | \`${esc(d.url)}\` | ${d.dimension} | ${esc(d.why)} |`)].join('\n')
      : '_No deductions recorded._'}

## 3. Not measured

${unmeasuredTable(scores.flatMap((s) => s.notMeasured.map((n) => ({ what: s.url, why: n }))))}

## 4. Visual regression

${findingsTable(regression)}

## 5. Motion and glass

${findingsTable(input.motion)}

## 6. Design-system conflicts

${findingsTable(input.visual)}
`;
  writeFileSync(REPORTS.visual, body, 'utf8');
  return REPORTS.visual;
}

export function writeSystemHealth(input: ReportInput, snapshotSummary: string[]): string {
  const body = `# SYSTEM_HEALTH

**RC7 — Engineering Supervisor** · generated ${stamp()}

The host, as it was at the moment of this run. Every figure below was read from
the OS, not inferred.

---

## 1. Machine

${snapshotSummary.length ? snapshotSummary.map((s) => `- ${s}`).join('\n') : '_The deep probe did not run._'}

## 2. Environment

${findingsTable(input.environment)}

## 3. Capabilities — MCP servers, connectors and skills

Three separate facts are tracked and never conflated: **configured** (present in
\`.mcp.json\`), **running** (a live process), and **observed** (the agent recorded
a working call). A server can be configured and running and still unusable —
that was exactly the state of \`context7\` and \`chrome-devtools\` during the RC6.1
recovery. Only \`observed\` claims usability, and it expires after six hours.

${findingsTable(input.mcp)}

${input.actions.length ? `## 4. Recovery actions\n\n${input.actions.map((a) => `- ${a}`).join('\n')}\n` : '## 4. Recovery actions\n\n_None needed._\n'}

## 5. Standing risks

These do not change between runs. They are properties of the host, not of any
one build.

1. **The box is the bottleneck.** 4 cores, 7.88 GB. The RC6 crash was capacity,
   and capacity has not changed. Serialise: build → test → capture, never
   concurrently, and never with the Playwright MCP browser open alongside the
   runner (measured: 16.4 s becomes >90 s).
2. **\`next start\` locks \`.next\`.** A rebuild while the server runs fails with
   \`EPERM: unlink\`. \`npm run preflight\` releases it first.
3. **The workspace is inside OneDrive**, which holds file handles during sync
   and is a plausible contributor to the same \`EPERM\` class of failure.
4. **The discrete GPU is idle.** Chromium renders on the integrated adapter,
   whose memory comes from the same pool the OOM exhausted.
`;
  writeFileSync(REPORTS.system, body, 'utf8');
  return REPORTS.system;
}

/**
 * BUILD_STATUS.md — what was compiled, how big it came out, and on what.
 *
 * Split from ENGINEERING_STATUS because they answer different questions for
 * different readers. "Did the gates pass" is a review question; "what artefact
 * exists on disk right now, from which commit, at what size" is a release
 * question, and burying the second inside the first is how a release gets cut
 * from a build nobody checked the identity of.
 */
export function writeBuildStatus(input: ReportInput, git: GitState, build: BuildFacts): string {
  const g = input.gates;
  const gate = (name: string) => g.find((x) => x.gate === name);
  const row = (name: string, label: string) => {
    const r = gate(name);
    if (!r) return `| ${ICON.unknown} | ${label} | not in the gate set |`;
    return `| ${ICON[r.status]} | ${label} | ${esc(r.detail)}${r.ms ? ` _(${(r.ms / 1000).toFixed(1)} s)_` : ''} |`;
  };

  const body = `# BUILD_STATUS

**RC7.1 — Stabilisation** · generated ${stamp()}

---

## 1. Compilation

| | Step | Result |
|---|---|---|
${row('types', 'TypeScript (`tsc --noEmit`)')}
${row('lint', 'ESLint (`eslint src`)')}
${row('build', 'Next build')}
${row('bundle', 'Bundle budgets')}

## 2. Artefact

| Field | Value |
|---|---|
| \`.next/BUILD_ID\` | ${build.buildId ? `\`${build.buildId}\`` : '_no build on disk_'} |
| \`.next/static\` present | ${build.hasStatic ? 'yes' : '**no**'} |
| JS shipped (gzipped) | ${build.jsGzipKB !== undefined ? `${build.jsGzipKB} kB against a ${build.budgetJsKB} kB budget` : '_not measured_'} |
| CSS shipped (gzipped) | ${build.cssGzipKB !== undefined ? `${build.cssGzipKB} kB against a ${build.budgetCssKB} kB budget` : '_not measured_'} |
| Served build (:3000) | ${build.servedBuildId ? `\`${build.servedBuildId}\`${build.servedBuildId !== build.buildId ? ' — **stale, does not match disk**' : ' — matches disk'}` : '_nothing serving_'} |

## 3. Source

| Field | Value |
|---|---|
| Branch | \`${git.branch || 'unknown'}\` |
| HEAD | \`${git.head || 'unknown'}\` |
| Uncommitted (tracked) | ${git.dirty.length} file(s) |
| Untracked | ${git.untracked.length} file(s) |

${git.dirty.length ? `A build taken from a dirty tree describes the working tree, not the commit. ${git.dirty.length} tracked file(s) differ from \`${git.head}\`.\n` : ''}
## 4. Toolchain

| Tool | Version |
|---|---|
| Node | ${process.version} |
| Platform | ${process.platform} ${process.arch} |
${build.toolVersions.map((t) => `| ${t.name} | ${t.version} |`).join('\n')}

## 5. Build output

${gate('build')?.output ? '```\n' + tailLines(gate('build')!.output!, 30) + '\n```' : '_The build gate produced no captured output in this run._'}
`;
  writeFileSync(REPORTS.build, body, 'utf8');
  return REPORTS.build;
}

export interface BuildFacts {
  buildId: string | null;
  hasStatic: boolean;
  servedBuildId: string | null;
  jsGzipKB?: number;
  cssGzipKB?: number;
  budgetJsKB?: number;
  budgetCssKB?: number;
  toolVersions: Array<{ name: string; version: string }>;
}

function tailLines(text: string, n: number): string {
  const lines = text.split(/\r?\n/);
  return lines.length <= n ? text : lines.slice(-n).join('\n');
}

/**
 * Embed the forensic capture written by the last browser attempt.
 *
 * A gate that did not run must be explained with measurements, not with a
 * sentence. When PageProbe fails or is forced it writes
 * `.engineering/probe-forensics.json` — free RAM, the grouped process table,
 * live Chromium processes, and any `0xE0000008` allocation failures or Event
 * 2004 low-memory diagnoses the OS logged during the attempt. This lifts that
 * file into the ledger verbatim so the reader sees the evidence rather than a
 * summary of it.
 *
 * Only included when something actually failed or was skipped; on a clean run
 * a forensic dump is noise.
 */
function forensicsSection(anythingUnproven: boolean): string {
  if (!anythingUnproven) return '';
  const p = join(REPO, '10_Final_Website', '.engineering', 'probe-forensics.json');
  if (!existsSync(p)) {
    return [
      '### Forensic capture',
      '',
      '_No browser attempt recorded forensics in this run. A gate listed above as',
      '“not run” was refused by admission control **before** any browser launched —',
      'so there is no Chromium allocation failure to show, because nothing was',
      'launched to fail. The measured free-memory figure in its row is the whole',
      'evidence._',
    ].join('\n');
  }
  try {
    const f = JSON.parse(readFileSync(p, 'utf8')) as Forensics;
    return `### Forensic capture\n\n${forensicsMarkdown(f, 'Measured during the last browser attempt')}`;
  } catch (error: any) {
    return `### Forensic capture\n\n_Present at \`${rel(p)}\` but unreadable: ${esc(String(error?.message ?? error))}._`;
  }
}

/**
 * QUALITY_GATE.md — the pass/warn/fail ledger, and nothing else.
 *
 * One row per gate, with the evidence that produced the verdict. The
 * "Not run" section is not an appendix: on this host the browser gates are
 * refused whenever free memory is under their floor, and a ledger that showed
 * only the gates that happened to run would read as a full pass every time the
 * machine was too loaded to test anything.
 */
export function writeQualityGate(input: ReportInput, readiness: Readiness): string {
  const g = input.gates;
  const ran = g.filter((x) => x.status !== 'skipped');
  const skipped = g.filter((x) => x.status === 'skipped');
  const passed = ran.filter((x) => isGreen(x.status));
  const failed = ran.filter((x) => x.status === 'fail' || x.status === 'blocked');
  const warned = ran.filter((x) => x.status === 'warn');

  const legend = (s: Status) => (isGreen(s) ? '✔ Passed' : s === 'warn' ? '⚠ Warning' : s === 'skipped' ? '— Not run' : s === 'unknown' ? '❔ Unknown' : '✖ Failed');

  const body = `# QUALITY_GATE

**RC7.1 — Stabilisation** · generated ${stamp()}

${VERDICT_LINE[readiness.verdict]}

**${passed.length} passed · ${warned.length} warning · ${failed.length} failed · ${skipped.length} not run** — of ${g.length} gates.

---

## 1. Ledger

| Verdict | Gate | Time | Evidence |
|---|---|---|---|
${g.map((x) => `| ${legend(x.status)} | \`${x.gate}\` | ${x.ms ? `${(x.ms / 1000).toFixed(1)} s` : '—'} | ${esc(x.detail)} |`).join('\n')}

## 2. Failures, in full

${failed.length
      ? failed
          .map(
            (x) =>
              `### ✖ \`${x.gate}\`\n\n${esc(x.detail)}\n\n${x.output ? '```\n' + tailLines(x.output, 25) + '\n```' : '_No captured output._'}`,
          )
          .join('\n\n')
      : '_No gate failed._'}

## 3. Warnings

${warned.length
      ? ['| Gate | Detail |', '|---|---|', ...warned.map((x) => `| \`${x.gate}\` | ${esc(x.detail)} |`)].join('\n')
      : '_No warnings._'}

## 4. Not run — and why

A gate that did not run is **not** a gate that passed. Each row is a claim this
ledger declines to make.

${skipped.length
      ? ['| Gate | Why it did not run |', '|---|---|', ...skipped.map((x) => `| \`${x.gate}\` | ${esc(x.reason ?? x.detail)} |`)].join('\n')
      : '_Every gate ran._'}

${forensicsSection(skipped.length + failed.length > 0)}

## 5. What was repaired automatically

${input.actions.length ? input.actions.map((a) => `- ${esc(a)}`).join('\n') : '_Nothing needed repair._'}
`;
  writeFileSync(REPORTS.quality, body, 'utf8');
  return REPORTS.quality;
}

/** Writes every report and returns their paths. */
export function writeAll(
  input: ReportInput,
  scores: Parameters<typeof writeVisualStatus>[1],
  regression: Finding[],
  snapshotSummary: string[],
  build: BuildFacts,
): { paths: string[]; readiness: Readiness; git: GitState } {
  const g = gitState();
  const readiness = assess(input.gates, [
    ...input.environment,
    ...input.mcp,
    ...input.visual,
    ...input.motion,
    ...input.performance,
  ]);
  const paths = [
    writeEngineeringStatus(input, g, readiness),
    writeVisualStatus(input, scores, regression),
    writeSystemHealth(input, snapshotSummary),
    writeBuildStatus(input, g, build),
    writeQualityGate(input, readiness),
  ];
  return { paths, readiness, git: g };
}

export const overallStatus = (gates: GateResult[]): Status => worst(gates.map((g) => g.status));
