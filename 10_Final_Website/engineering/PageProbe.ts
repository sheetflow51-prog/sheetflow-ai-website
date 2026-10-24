/**
 * PageProbe — the caller that RC7 was missing.
 *
 * ## The gap this closes
 *
 * RC7 shipped `VisualRegression.PAGE_AUDIT_SOURCE` and `VITALS_INIT_SOURCE` as
 * strings with **no caller anywhere in the codebase**. They were exercised once,
 * by hand, by pasting them through an MCP `browser_evaluate` call. That is not
 * an automated visual gate; it is a manual step with a gate-shaped hole next to
 * it, and the `visual` gate consequently reported `skipped` on every run that
 * nobody had manually primed.
 *
 * This module is the missing half. It owns a real browser, installs the vitals
 * observer *before* navigation, runs the audit, and writes the JSON the gate
 * reads. After this, `eng:verify` measures the pages by itself.
 *
 * ## Why the init script has to run before navigation
 *
 * LCP and CLS are lifetime metrics. An observer attached after load sees a
 * buffered LCP but a CLS of zero for every shift whose sources have already
 * unmounted — which is the exact failure mode `scripts/probe-cls.mjs` was
 * written to work around, when Lighthouse reported 0.103 of layout shift and
 * attributed it to no element at all. A zero there would be a *fabricated pass*,
 * which is worse than the honest `null` this system reports when the metric was
 * not observed.
 *
 * ## Why it uses Playwright directly rather than the Playwright MCP
 *
 * The MCP browser is the agent's interactive session. Driving the gate through
 * it means the gate cannot run unattended, and — measured during RC6.1 — a live
 * MCP browser alongside a test runner turns a 16.4 s spec into a >90 s timeout.
 * `@playwright/test` is already a devDependency and exports `chromium`, so the
 * gate gets its own short-lived browser and closes it.
 *
 * ## Reduced motion is a second pass, not a flag
 *
 * `PAGE_AUDIT_SOURCE` reports `reducedMotionRespected: null` unless the media
 * feature is actually set, because it cannot check compliance with a preference
 * that is not expressed. `--reduced` runs the same probe in a context with
 * `reducedMotion: 'reduce'`, which is the only way that field becomes a
 * boolean instead of an admission that it was not measured.
 */

import { chromium } from '@playwright/test';
import type { Browser } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROUTES, STATE_DIR, rel, unmangleRoute } from './paths.ts';
import { PAGE_AUDIT_SOURCE, VITALS_INIT_SOURCE, score, scoreFindings } from './VisualRegression.ts';
import type { PageAudit } from './VisualRegression.ts';
import { forensics as captureForensics, writeGpuCache } from './ResourceMonitor.ts';
import type { Forensics } from './ResourceMonitor.ts';
import { admit, freeGB, watch } from './MemoryGuard.ts';
import { record as recordPerf } from './PerformanceWatcher.ts';
import { finding, worst } from './types.ts';
import type { Finding, Status } from './types.ts';

/* ------------------------------------------------------------------ *
 * Viewports
 * ------------------------------------------------------------------ */

/**
 * Matched to `playwright.config.ts`, deliberately.
 *
 * The e2e suite runs `Desktop Chrome` and `Pixel 7`. Auditing at different
 * dimensions would produce visual findings that no test could ever reproduce,
 * and a finding nobody can reproduce is a finding nobody fixes.
 */
export const VIEWPORTS = {
  desktop: { width: 1280, height: 720, deviceScaleFactor: 1, isMobile: false },
  mobile: { width: 412, height: 915, deviceScaleFactor: 2.625, isMobile: true },
};

export type ViewportName = keyof typeof VIEWPORTS;

export interface ProbeOptions {
  baseUrl?: string;
  routes?: string[];
  viewports?: ViewportName[];
  /** Additionally run every route/viewport with prefers-reduced-motion: reduce. */
  reducedMotion?: boolean;
  /** Milliseconds to let the page settle after load before measuring. */
  settleMs?: number;
  outDir?: string;
  /** Attempt the launch even when admission refuses it, to produce evidence. */
  force?: boolean;
}

export interface ProbeResult {
  audits: PageAudit[];
  findings: Finding[];
  status: Status;
  written: string[];
  consoleErrors: Array<{ url: string; text: string }>;
  /** Populated whenever the run failed or was forced — the proof, not the claim. */
  forensics: Forensics | null;
}

const slug = (route: string, viewport: string, reduced: boolean) =>
  `${route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '-')}-${viewport}${reduced ? '-reduced' : ''}`;

/* ------------------------------------------------------------------ *
 * GPU
 * ------------------------------------------------------------------ */

/**
 * Ask the browser what it is actually rendering with.
 *
 * This is the only way to distinguish hardware acceleration from SwiftShader,
 * and `ResourceMonitor.checkGpu` has been reporting `unknown` on every run
 * because nothing ever called `writeGpuCache`. One `WEBGL_debug_renderer_info`
 * read costs nothing while a browser is already open, and it is the difference
 * between "the VOS glass ladder renders on the GPU" and "every backdrop-filter
 * is a CPU blur and no paint measurement on this machine means anything".
 */
const GPU_QUERY = String.raw`
(() => {
  const out = { renderer: 'unavailable', vendor: 'unavailable', supportsBackdropFilter: false, supportsViewTimeline: false };
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        out.renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
        out.vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
      } else {
        out.renderer = gl.getParameter(gl.RENDERER);
        out.vendor = gl.getParameter(gl.VENDOR);
      }
    }
  } catch (e) { out.renderer = 'error: ' + e.message; }
  try { out.supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(1px)'); } catch (e) {}
  try { out.supportsViewTimeline = CSS.supports('animation-timeline', 'view()'); } catch (e) {}
  return out;
})()
`;

/* ------------------------------------------------------------------ *
 * The probe
 * ------------------------------------------------------------------ */

export async function probePages(options: ProbeOptions = {}): Promise<ProbeResult> {
  const baseUrl = options.baseUrl ?? process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
  const routes = options.routes ?? [...ROUTES];
  const viewports = options.viewports ?? (['desktop', 'mobile'] as ViewportName[]);
  const settleMs = options.settleMs ?? 2500;
  const outDir = options.outDir ?? join(STATE_DIR, 'audits');

  const startedAt = new Date();

  // Admission first. A refused probe returns `skipped`, never an empty pass.
  //
  // `force` overrides the refusal, and exists for exactly one purpose: turning
  // "this gate could not run" from an assertion into evidence. Admission
  // control refuses *before* launching, which is the right default — it saves a
  // browser launch to reach a foregone conclusion — but it also means no
  // artefact is ever produced to prove the refusal was warranted. Under
  // `force`, the launch is attempted, memory is sampled throughout, and
  // whatever happens is captured with the Windows Event Log alongside it.
  //
  // The override is recorded in the findings either way. A probe that only
  // succeeded because someone bypassed the guard must not read as a clean pass.
  const admission = admit('probe');
  if (!admission.admitted && !options.force) {
    return {
      audits: [],
      findings: [
        finding('probe', admission.freeGB < 0.8 ? 'blocked' : 'skipped', admission.reason, {
          fix: admission.advice.join(' · '),
        }),
      ],
      status: admission.freeGB < 0.8 ? 'blocked' : 'skipped',
      written: [],
      consoleErrors: [],
      forensics: null,
    };
  }
  const forced = !admission.admitted && !!options.force;

  const findings: Finding[] = [];
  const audits: PageAudit[] = [];
  const written: string[] = [];
  const consoleErrors: Array<{ url: string; text: string }> = [];
  let browser: Browser | null = null;

  // The watchdog aborts the probe if the machine degrades mid-run — the same
  // t≈7min failure the RC6 incident took, where each worker entered a machine
  // that had got worse since the run started.
  let aborted = false;
  const freeAtLaunch = freeGB();
  let lowWater = freeAtLaunch;
  const sampler = setInterval(() => {
    const f = freeGB();
    if (f < lowWater) lowWater = f;
  }, 250);
  sampler.unref?.();

  /**
   * Under `force`, the in-flight watchdog observes but does not abort.
   *
   * This was found by running it. With free memory already below the 0.8 GB
   * floor at launch, the watchdog fired on its first tick, closed the browser,
   * and every route loop hit `if (aborted) break` — so the run produced zero
   * audits, no exception, and no finding saying why. Forcing admission
   * accomplished nothing, because the *second* guard killed it regardless.
   *
   * That makes `force` meaningless unless it also relaxes this one. The whole
   * purpose of the mode is to observe what the machine actually does, up to and
   * including a genuine `0xE0000008` — which the forensic capture is built to
   * record. Aborting pre-emptively is right for a routine gate and wrong for an
   * investigation.
   */
  const memory = watch(
    async () => {
      aborted = true;
      try {
        await browser?.close();
      } catch {
        /* closing a dying browser is best-effort */
      }
    },
    2000,
    options.force ? null : undefined,
  );

  try {
    browser = await chromium.launch({ headless: true });
    let gpuRecorded = false;

    const passes: Array<{ reduced: boolean }> = options.reducedMotion
      ? [{ reduced: false }, { reduced: true }]
      : [{ reduced: false }];

    for (const pass of passes) {
      for (const viewportName of viewports) {
        const viewport = VIEWPORTS[viewportName];
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          deviceScaleFactor: viewport.deviceScaleFactor,
          isMobile: viewport.isMobile,
          hasTouch: viewport.isMobile,
          reducedMotion: pass.reduced ? 'reduce' : 'no-preference',
        });
        // Installed on the context, so it applies to every navigation in it —
        // and, critically, before any of them.
        await context.addInitScript(VITALS_INIT_SOURCE);

        for (const route of routes) {
          if (aborted) break;
          const page = await context.newPage();
          const url = new URL(route, baseUrl).toString();

          // Defence in depth against the mangling above. A `file:` URL here
          // means the route was rewritten by the shell and the probe is about
          // to audit the local filesystem — which it did once, returning a
          // 100/100 score for a Chrome directory listing. Refusing is the only
          // safe response: measurements of the wrong document are worse than no
          // measurements, because they are indistinguishable from real ones.
          if (!/^https?:$/.test(new URL(url).protocol)) {
            findings.push(
              finding('probe:bad-url', 'fail', `refusing to audit ${url} — not an http(s) URL. The route "${route}" was almost certainly rewritten by the shell (Git Bash converts a leading "/" to the MSYS root).`, {
                fix: 'pass routes as --routes=/work or run from PowerShell',
              }),
            );
            await page.close();
            continue;
          }

          page.on('console', (msg) => {
            if (msg.type() === 'error') consoleErrors.push({ url, text: msg.text().slice(0, 300) });
          });
          page.on('pageerror', (error) => consoleErrors.push({ url, text: `uncaught: ${error.message}`.slice(0, 300) }));

          try {
            await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
            // `networkidle` is unreliable on a page with continuous animation;
            // a fixed settle is honest about being a heuristic and does not hang.
            await page.waitForTimeout(settleMs);

            if (!gpuRecorded) {
              const gpu = (await page.evaluate(GPU_QUERY)) as {
                renderer: string;
                vendor: string;
                supportsBackdropFilter: boolean;
                supportsViewTimeline: boolean;
              };
              writeGpuCache(gpu);
              gpuRecorded = true;
              findings.push(
                finding(
                  'probe:gpu',
                  /swiftshader|llvmpipe|software/i.test(gpu.renderer) ? 'fail' : 'ok',
                  `renderer ${gpu.renderer} · backdrop-filter ${gpu.supportsBackdropFilter ? 'supported' : 'UNSUPPORTED'} · animation-timeline: view() ${gpu.supportsViewTimeline ? 'supported' : 'UNSUPPORTED'}`,
                  { evidence: gpu },
                ),
              );
            }

            const audit = (await page.evaluate(PAGE_AUDIT_SOURCE)) as PageAudit;
            audits.push(audit);

            mkdirSync(outDir, { recursive: true });
            const file = join(outDir, `${slug(route, viewportName, pass.reduced)}.json`);
            writeFileSync(file, JSON.stringify(audit, null, 2));
            written.push(rel(file));

            if (audit.errors.length) {
              findings.push(
                finding('probe:internal', 'warn', `${audit.errors.length} probe section(s) threw on ${url}: ${audit.errors.join('; ')}`, {
                  where: url,
                }),
              );
            }

            // Vitals go into the baseline, keyed by route — the link that was
            // missing between the visual probe and PerformanceWatcher, without
            // which LCP and CLS were measured and then discarded.
            //
            // The scope is prefixed `probe:` rather than being the bare route,
            // and that prefix is load-bearing. Lighthouse records the same
            // metric names for the same route under the bare scope, but it
            // measures a *different thing*: `audit-lighthouse.mjs` runs Chrome
            // under 4x CPU throttling and simulated network, where this probe
            // measures the page at full speed. Writing both into one series
            // would produce a median drawn from two populations and a spread
            // that reflects the methodology gap rather than any variance in the
            // site — and every comparison against it afterwards would be noise
            // wearing the shape of a signal.
            if (!pass.reduced && viewportName === 'desktop' && (audit.vitals.lcp !== null || audit.vitals.cls !== null)) {
              recordPerf({
                at: new Date().toISOString(),
                scope: `probe:${route}`,
                metrics: {
                  ...(audit.vitals.lcp !== null ? { lcp: audit.vitals.lcp } : {}),
                  ...(audit.vitals.cls !== null ? { cls: audit.vitals.cls } : {}),
                  ...(audit.vitals.inp !== null ? { inp: audit.vitals.inp } : {}),
                },
                freeGB: freeGB(),
                note: `PageProbe ${viewportName}`,
              });
            }
          } catch (error: any) {
            findings.push(
              finding('probe:navigation', 'fail', `${url} — ${error?.message ?? error}`, {
                where: url,
                fix: 'is the server running? npm run build && npm run start',
              }),
            );
          } finally {
            await page.close();
          }
        }
        await context.close();
      }
    }
  } catch (error: any) {
    findings.push(
      finding('probe', aborted ? 'blocked' : 'fail', aborted ? 'aborted: free memory crossed the floor mid-probe' : `browser failed: ${error?.message ?? error}`),
    );
  } finally {
    memory.stop();
    clearInterval(sampler);
    try {
      await browser?.close();
    } catch {
      /* already gone */
    }
  }

  // Console errors, with the known-benign pair called out rather than counted.
  // Those two 404s are injected by the Vercel platform at the edge and do not
  // exist outside a Vercel deployment; they 404 on every local `next start` and
  // always have. Counting them as failures would make the gate cry wolf on
  // every single local run.
  const vercelNoise = consoleErrors.filter((e) => /_vercel\/(insights|speed-insights)/.test(e.text) || /MIME type \('text\/html'\)/.test(e.text));
  const realErrors = consoleErrors.filter((e) => !vercelNoise.includes(e));
  findings.push(
    realErrors.length
      ? finding('probe:console', 'fail', `${realErrors.length} application console error(s): ${[...new Set(realErrors.map((e) => e.text))].slice(0, 3).join(' | ')}`, {
          evidence: realErrors.slice(0, 10),
        })
      : finding('probe:console', 'ok', `no application console errors${vercelNoise.length ? ` (${vercelNoise.length} Vercel-platform 404s ignored — they do not exist outside a Vercel deployment)` : ''}`),
  );

  for (const audit of audits) findings.push(...scoreFindings(score(audit)));

  // An abort must never be silent. The first version set `aborted` and let the
  // loops break, which produced "no page audits produced" with nothing saying
  // the watchdog had killed the browser two seconds in — a result that looks
  // like a mystery instead of the specific, explainable event it was.
  if (aborted) {
    findings.push(
      finding('probe:aborted', 'blocked', `the in-flight memory watchdog closed the browser mid-run: free memory reached ${lowWater} GB, below the 0.8 GB Chromium OOM floor`, {
        fix: 'this is the guard working, not a probe defect. Free memory before re-running, or pass --force to observe the failure instead of pre-empting it.',
        evidence: { freeAtLaunch, lowWater, floorGB: 0.8 },
      }),
    );
  }

  // Memory cost of the browser, measured rather than assumed. This is the
  // number that corrected the `probe` budget from 0.9 GB to 1.2 GB, and it is
  // re-measured on every run so the budget stays tied to observation.
  //
  // Meaningless when the browser was killed before it allocated: the first
  // forced run reported "~0.01 GB", which was true and useless — it measured
  // how much a browser allocates in the two seconds before being killed.
  const cost = Math.round((freeAtLaunch - lowWater) * 100) / 100;
  findings.push(
    aborted || !audits.length
      ? finding('probe:cost', 'unknown', `browser cost not measurable — the run produced ${audits.length} audit(s); the ${cost} GB delta reflects a browser that never finished loading a page`, {
          evidence: { freeAtLaunch, lowWater, audits: audits.length },
        })
      : finding('probe:cost', 'ok', `browser cost ~${cost} GB across ${audits.length} page load(s): ${freeAtLaunch} GB free at launch, low-water ${lowWater} GB`, {
          evidence: { freeAtLaunch, lowWater, costGB: cost, budgetGB: admission.requiredGB },
        }),
  );

  if (forced) {
    findings.push(
      finding('probe:forced', 'warn', `admission was overridden: ${admission.reason}`, {
        fix: 'this run is evidence, not a clean pass — the guard would have refused it',
      }),
    );
  }

  findings.push(
    audits.length
      ? finding('probe', 'ok', `${audits.length} page audit(s) written to ${rel(outDir)}`, { evidence: written })
      : finding('probe', 'fail', 'no page audits produced'),
  );

  const status = worst(findings.map((f) => f.status));
  // Forensics whenever it did not cleanly succeed, or whenever the guard was
  // overridden — those are exactly the cases where a reader is entitled to the
  // underlying measurements rather than a summary sentence.
  const forensicsReport = status === 'ok' && !forced ? null : captureForensics(startedAt);

  return { audits, findings, status, written, consoleErrors, forensics: forensicsReport };
}

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */

const invokedDirectly = process.argv[1]?.replace(/\\/g, '/').endsWith('PageProbe.ts');
if (invokedDirectly) {
  const argv = process.argv.slice(2);
  const flag = (name: string) => {
    const i = argv.indexOf(`--${name}`);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const routesArg = flag('routes');
  probePages({
    baseUrl: flag('base'),
    routes: routesArg ? routesArg.split(',').map((r) => unmangleRoute(r.trim()) ?? r.trim()) : undefined,
    viewports: (flag('viewport')?.split(',') as ViewportName[]) ?? undefined,
    reducedMotion: argv.includes('--reduced'),
    settleMs: flag('settle') ? Number(flag('settle')) : undefined,
    force: argv.includes('--force'),
  })
    .then((result) => {
      for (const f of result.findings) {
        if (f.status === 'ok' && !argv.includes('--verbose')) continue;
        console.log(`  ${f.status.padEnd(8)} ${f.check.padEnd(24)} ${f.detail}`);
      }
      console.log(`\n  ${result.audits.length} audit(s), status ${result.status}`);
      // The forensic block is written to disk, not just printed, so the reports
      // can embed it verbatim instead of paraphrasing it.
      if (result.forensics) {
        mkdirSync(STATE_DIR, { recursive: true });
        writeFileSync(join(STATE_DIR, 'probe-forensics.json'), JSON.stringify(result.forensics, null, 2));
        console.log(`  forensics: ${result.forensics.memory.freeGB} GB free, ` +
          `${result.forensics.crashesSince.filter((c) => c.code === 'e0000008').length} Chromium OOM abort(s) — written to .engineering/probe-forensics.json`);
      }
      process.exit(result.status === 'fail' || result.status === 'blocked' ? 1 : 0);
    })
    .catch((error) => {
      console.error(`PageProbe: ${error?.stack ?? error}`);
      process.exit(1);
    });
}
