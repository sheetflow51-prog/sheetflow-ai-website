# Engineering Supervisor

An autonomous engineering system for this workspace: it inspects the machine
before work starts, plans a change before it is made, gates the result
afterwards, and writes down what it could and could not measure.

It runs on Node 24's native TypeScript support — no build step, no `tsx`, no new
dependency. `node engineering/EngineeringSupervisor.ts <command>` is the whole
entry point.

## Commands

```bash
npm run eng:preflight     # environment, capabilities, per-task memory admission
npm run eng:plan -- src/components/vos/Surface.tsx   # blast radius before editing
npm run eng:verify        # the gate loop: run, repair what is mechanical, repeat
npm run eng:probe         # drive a browser, audit the routes, write the JSON
npm run eng:visual -- --before <dir> --after <dir>   # perceptual screenshot diff
npm run eng:report        # write the five status documents
npm run eng:full          # verify + report
npm run eng:types         # type-check this directory (its own tsconfig)
```

Flags: `--json`, `--verbose`, `--no-fix`, `--no-heal`, `--max-passes N`, `--skip-build`.

## The gate set

Ordered cheap → expensive. Each declares what it needs; anything it cannot get
makes it `skipped` with the measured reason, never `ok`.

| # | Gate | Needs | What it proves |
|---|---|---|---|
| 1 | `types` | — | `tsc --noEmit` over the app |
| 2 | `lint` | — | `eslint src` |
| 3 | `motion` | — | animation cost classes, glass budget, reduced-motion coverage |
| 4 | `design` | — | VOS conflicts and performance risks across `src/` |
| 5 | `build` | 1.0 GB | `next build`, after releasing `.next` |
| 6 | `bundle` | a build | gzipped JS/CSS against budget |
| 7 | `a11y` | 1.45 GB + server | axe-core accessibility suite |
| 8 | `e2e` | 1.45 GB + server | the full Playwright suite |
| 9 | `seo+geo` | 1.45 GB + server | JSON-LD `@graph`, `llms.txt`, AI-crawler robots, sitemap |
| 10 | `lighthouse` | 2.0 GB + server | Core Web Vitals, ingested into the baseline |
| 11 | `probe` | 1.2 GB + server | drives a browser, writes the page audits |
| 12 | `visual` | audits on disk | scores each page and names every deduction |
| 13 | `performance` | — | bundle and vitals against budget *and* baseline |

The order is not arbitrary. Cheap static gates run first so a type error fails in
seconds rather than after a build. `build` precedes everything that reads
`.next`. Lighthouse runs *after* the Playwright suites and never beside them —
two browsers contending on 4 cores is the configuration that turned a 16.4 s
spec into a 90 s timeout. `visual` follows `probe` because it scores what the
probe wrote, and `performance` is last because the gates above it are what
populate the baseline it compares against.

Memory floors are **measured**, and RC7.1 raised them after the first set proved
too low: the probe was admitted at 1.08 GB free under a 0.9 GB estimate and had
to be aborted at 0.69 GB. One Chromium plus one page of this site costs ~0.4 GB.

The loop manages the server itself: the `build` gate releases `.next` (stopping
whatever held it), and the gates after it start `next start` and wait for it to
answer. A server that was already listening is adopted, not restarted — and if
the build gate displaced one that was running beforehand, a replacement is left
running rather than the operator being left worse off than before the check.

Recording an observation the script cannot make for itself:

```bash
node engineering/EngineeringSupervisor.ts capability playwright connected "browser_evaluate exercised against :3000"
node engineering/EngineeringSupervisor.ts perf:ingest --scope /
```

## The modules

| File | Responsibility |
|---|---|
| `EngineeringSupervisor.ts` | Orchestrator and CLI. Owns the gate list and the repair loop. |
| `ResourceMonitor.ts` | Deep host probe: disk, GPU adapters, Windows Event Log, process inventory. Delegates the per-prompt layer to `scripts/session-supervisor.mjs`. |
| `MemoryGuard.ts` | Per-task admission control and the in-flight watchdog. |
| `MCPHealth.ts` | Capability roster. Keeps *configured*, *running* and *observed* separate. |
| `TaskPlanner.ts` | Import graph, blast radius, complexity, design conflicts, performance risks, ordered task list. |
| `AnimationProfiler.ts` | Which properties animate and what class of cost each carries. |
| `VisualRegression.ts` | Dependency-free PNG decoder, perceptual diff, the in-page audit *source*, quality scoring. |
| `PageProbe.ts` | Owns a real browser and runs that source against the routes. The caller RC7 was missing. |
| `PerformanceWatcher.ts` | Budgets and a median-with-spread baseline. Refuses to call noise a regression. |
| `BuildCoordinator.ts` | One heavy task at a time, no shell, memory-watched subprocesses. |
| `ReleaseManager.ts` | Git state, readiness verdict, and the three Markdown reports. |
| `types.ts` / `paths.ts` | Shared vocabulary and resolved paths. |

## Two rules the whole system is built around

**A check that did not run is not a check that passed.** `skipped` and `unknown`
are first-class statuses, they rank *above* `ok` in severity, and every report
has a "not measured" table that is never empty when something was skipped. A run
in which nothing could be measured produces an amber verdict, not a green one.

**Refuse rather than reproduce the incident.** On 2026-08-10 three
`chrome-headless-shell.exe` processes died inside seven minutes with exception
`0xE0000008` — Chromium's own out-of-memory code — while Windows logged Event
2004 in the same second. Every browser-launching gate is admission-controlled
against free physical memory, and a refused gate reports `skipped` with the
measured figure rather than running and hoping.

## What the loop will and will not fix

Mechanically fixable, applied and then re-verified: ESLint autofixes, a `.next`
directory held by a running server, orphaned browsers and held ports, a stale
coordinator lock.

Not fixable by a script, and handed back with its output: type errors, failing
assertions, accessibility violations, blown budgets. Each is a decision about
what the code should do; a script that edited source until the gate passed would
be optimising the gate rather than the software.

The loop also stops when a pass fails identically to the one before it — nothing
is being learned, and this machine has no spare capacity to burn proving it.

## State

`.engineering/` holds baselines, locks, caches and saved page audits. It is
gitignored: a performance baseline is a claim about *this* host — 4 cores, Intel
HD 620, 7.88 GB — and committing it would let another machine's numbers silently
become this machine's budget.

## The in-page probe

`VisualRegression.PAGE_AUDIT_SOURCE` is a string, not a function, because it has
to cross into a browser this process is not linked to. `PageProbe.ts` is what
runs it: its own short-lived Chromium, one context per viewport, the vitals
observer installed on the context so it is in place **before** navigation.

That ordering is the whole reason the probe is split in two. Playwright's own
documentation for `browserContext.addInitScript` states the script runs "after
the document is created but before any page scripts are executed" — which is the
only window in which LCP and CLS can be observed for their whole lifetime. An
observer attached after load reads zero for CLS, and a zero there would be a
fabricated pass rather than a measurement.

```bash
npm run eng:probe -- --routes /,/work --viewport desktop --reduced --settle 3000
```

`--reduced` runs a second pass with `reducedMotion: 'reduce'`. Without it the
probe reports `reducedMotionRespected: null`, because it will not claim
compliance with a preference that was never expressed.

Results land in `.engineering/audits/*.json` and the `visual` gate scores them.
Desktop vitals are also written into the `PerformanceWatcher` baseline keyed by
route, so the visual pass feeds the performance pass instead of measuring
LCP and CLS and then discarding them.
