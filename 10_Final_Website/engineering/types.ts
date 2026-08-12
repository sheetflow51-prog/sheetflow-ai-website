/**
 * Shared vocabulary for the engineering supervisor.
 *
 * One rule governs every type in this file, and it is the reason `skipped` and
 * `unknown` exist as first-class statuses next to `ok` and `fail`:
 *
 *   **A check that did not run is never a check that passed.**
 *
 * The RC6 incident was diagnosed from evidence the previous cleanup had already
 * deleted. The counterpart failure — reporting green for a gate that never
 * executed because the box had no memory to execute it — is the same class of
 * mistake pointed the other way, and it is far easier to make. So a gate that
 * could not run carries `skipped` plus the precise reason, it never collapses
 * into the pass column, and `worst()` below deliberately ranks `unknown` above
 * `ok` so an unmeasured system can never summarise as healthy.
 */

/* ------------------------------------------------------------------ *
 * Status
 * ------------------------------------------------------------------ */

/**
 * `repaired` is distinct from `ok` on purpose: the environment reached a good
 * state, but something had to be done to it, and the report should say so.
 * `blocked` means a human decision is required — the supervisor will not act.
 */
export type Status =
  | 'ok'
  | 'repaired'
  | 'skipped'
  | 'unknown'
  | 'warn'
  | 'fail'
  | 'blocked';

/** Ascending severity. `skipped`/`unknown` sit above `ok`: absence of evidence. */
const SEVERITY: Record<Status, number> = {
  ok: 0,
  repaired: 1,
  skipped: 2,
  unknown: 3,
  warn: 4,
  fail: 5,
  blocked: 6,
};

export function worst(statuses: Status[]): Status {
  let out: Status = 'ok';
  for (const s of statuses) if (SEVERITY[s] > SEVERITY[out]) out = s;
  return out;
}

export function isGreen(s: Status): boolean {
  return s === 'ok' || s === 'repaired';
}

/** Rolls a set of statuses up to the word that goes at the top of a report. */
export type Verdict = 'green' | 'amber' | 'red' | 'blocked';

export function verdictOf(statuses: Status[]): Verdict {
  const w = worst(statuses);
  if (w === 'blocked') return 'blocked';
  if (w === 'fail') return 'red';
  if (w === 'ok' || w === 'repaired') return 'green';
  return 'amber';
}

/* ------------------------------------------------------------------ *
 * Findings
 * ------------------------------------------------------------------ */

/**
 * The atom every module emits. `fix` is an instruction a human or the agent can
 * execute verbatim; `evidence` is the raw measurement the detail sentence was
 * derived from, kept so a claim in a report can always be traced back to a
 * number rather than believed.
 */
export interface Finding {
  check: string;
  status: Status;
  detail: string;
  fix?: string;
  /** Where the finding lives, as `path` or `path:line`, when it has a location. */
  where?: string;
  evidence?: unknown;
}

export function finding(
  check: string,
  status: Status,
  detail: string,
  extra: Partial<Omit<Finding, 'check' | 'status' | 'detail'>> = {},
): Finding {
  return { check, status, detail, ...extra };
}

/* ------------------------------------------------------------------ *
 * Gates
 * ------------------------------------------------------------------ */

/**
 * What a gate needs before it is allowed to claim a result.
 *
 * `browser` is the expensive one and the one the incident was about: launching
 * Chromium under 0.8 GB of physical headroom reproduces the 0xE0000008 OOM
 * abort. A gate declaring `browser` is admission-controlled by MemoryGuard, and
 * when refused it returns `skipped`, never `ok`.
 */
export type Requirement = 'none' | 'build' | 'server' | 'browser' | 'captures';

export interface GateResult {
  gate: string;
  status: Status;
  /** Wall-clock, ms. 0 when the gate was skipped without executing. */
  ms: number;
  detail: string;
  /** Why a `skipped` gate was skipped. Mandatory in practice — see the header. */
  reason?: string;
  findings?: Finding[];
  /** Tail of the child process output, for gates that shell out. */
  output?: string;
  /** True when the supervisor mechanically repaired this and re-ran it. */
  autoFixed?: boolean;
}

/* ------------------------------------------------------------------ *
 * Measurements
 * ------------------------------------------------------------------ */

/**
 * A metric sample set, never a single number.
 *
 * Every performance figure in this system is reported as a median with the
 * observed spread and the sample count, because on a 4-core box a single run of
 * anything paint-bound is noise. `withinNoise` is what stops a report calling a
 * 40 ms LCP move a regression when run-to-run spread is 300 ms.
 */
export interface Sample {
  metric: string;
  unit: string;
  values: number[];
}

export interface Stat {
  metric: string;
  unit: string;
  n: number;
  median: number;
  min: number;
  max: number;
  /** max - min, the honest spread for small n. Not a standard deviation. */
  spread: number;
}

export function summarise(sample: Sample): Stat {
  const values = [...sample.values].sort((a, b) => a - b);
  const n = values.length;
  const median =
    n === 0 ? NaN : n % 2 ? values[(n - 1) / 2] : (values[n / 2 - 1] + values[n / 2]) / 2;
  return {
    metric: sample.metric,
    unit: sample.unit,
    n,
    median,
    min: n ? values[0] : NaN,
    max: n ? values[n - 1] : NaN,
    spread: n ? values[n - 1] - values[0] : NaN,
  };
}

/** Formats a stat the way it must always appear in prose: median, spread, n. */
export function statText(s: Stat, digits = 0): string {
  if (!s.n) return `${s.metric}: not measured`;
  const f = (v: number) => v.toFixed(digits);
  if (s.n === 1) return `${f(s.median)}${s.unit} (n=1 — single run, not a measurement)`;
  return `${f(s.median)}${s.unit} median (${f(s.min)}–${f(s.max)}, n=${s.n})`;
}

/* ------------------------------------------------------------------ *
 * Reports
 * ------------------------------------------------------------------ */

export interface PhaseReport {
  phase: string;
  status: Status;
  findings: Finding[];
  gates?: GateResult[];
  ms: number;
}

export interface SupervisorReport {
  at: string;
  verdict: Verdict;
  phases: PhaseReport[];
  actions: string[];
  /** Everything the run deliberately did not measure, and why. */
  notMeasured: Array<{ what: string; why: string }>;
}

/* ------------------------------------------------------------------ *
 * Small shared helpers
 * ------------------------------------------------------------------ */

/** PowerShell's ConvertTo-Json emits a bare object, not an array, for one item. */
export function arr<T>(v: T | T[] | null | undefined): T[] {
  return Array.isArray(v) ? v : v == null ? [] : [v];
}

export function pct(part: number, whole: number): number {
  return whole === 0 ? 0 : (part / whole) * 100;
}

/** Truncates child-process output to a readable tail without hiding the head. */
export function tail(text: string, lines = 40): string {
  const all = text.split(/\r?\n/);
  if (all.length <= lines) return text.trim();
  return `… ${all.length - lines} earlier line(s) omitted …\n` + all.slice(-lines).join('\n').trim();
}
