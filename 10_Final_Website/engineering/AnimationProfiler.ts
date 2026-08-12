/**
 * AnimationProfiler — which properties this site animates, and what they cost.
 *
 * ## Why a static profiler when a trace exists
 *
 * `scripts/trace-paint.mjs` measures the real thing, and its ablation list
 * (`none,no-blend,no-sheen,no-ambient-anim,no-ambient,no-backdrop-blur,
 * no-particles`) exists precisely because paint cost on this project is not
 * guessable. So why analyse the source at all?
 *
 * Because the trace needs a browser, and the browser is the thing that keeps
 * running out of memory. A profiler that only works when the machine is healthy
 * is unavailable exactly when the machine is unhealthy — and "the page feels
 * heavy" is usually reported when things are already bad. This module answers
 * the cheap half of the question from the stylesheet: *which* properties are
 * animated, how many of them force layout or paint rather than staying on the
 * compositor, how many run forever, and how many are exempted under
 * `prefers-reduced-motion`. None of that needs a GPU.
 *
 * The expensive half — how many milliseconds it actually costs on an Intel HD
 * 620 — still needs the trace, and this module reads that trace when it is
 * present rather than estimating it. Where no trace exists, it says so.
 *
 * ## The classification that matters
 *
 * A compositor-only animation (`transform`, `opacity`) is handed to the GPU and
 * costs the main thread nothing per frame. Everything else does not:
 *
 *   • **layout** — `width`, `height`, `top`, `margin`, `font-size`: forces a
 *     reflow of the subtree on every frame of the animation
 *   • **paint** — `box-shadow`, `background-color`, `border-radius`, `filter`:
 *     no reflow, but the layer is re-rasterised every frame
 *
 * On a page whose steady state is already ~75% paint and compositing, adding a
 * paint-class animation is adding to the majority cost, not the minority one.
 *
 * ## `backdrop-filter` is counted separately
 *
 * It is neither of the above. Each one forces a readback of everything painted
 * behind it, and they compound when stacked. The VOS surface ladder assigns a
 * blur radius per elevation (4/12/20/28/36 px across e0–e4), which is a
 * deliberate budget; this module counts how many of them a page can hold at
 * once, because the ladder governs the radius but nothing governs the count.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { LIGHTHOUSE_DIR, ROOT, SRC } from './paths.ts';
import { finding, worst } from './types.ts';
import type { Finding, Status } from './types.ts';
import { walk } from './TaskPlanner.ts';

/* ------------------------------------------------------------------ *
 * Property classification
 * ------------------------------------------------------------------ */

export type Cost = 'composited' | 'paint' | 'layout' | 'unknown';

const LAYOUT_PROPS = new Set([
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'top', 'right', 'bottom', 'left', 'inset',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'font-size', 'line-height', 'letter-spacing', 'border-width', 'flex', 'flex-basis', 'gap',
]);

const PAINT_PROPS = new Set([
  'background', 'background-color', 'background-position', 'background-size', 'background-image',
  'box-shadow', 'text-shadow', 'border-color', 'border-radius', 'color', 'fill', 'stroke',
  'filter', 'outline-color', 'text-decoration-color', 'clip-path', 'mask',
]);

const COMPOSITED_PROPS = new Set(['transform', 'opacity', 'translate', 'rotate', 'scale', 'offset-distance']);

export function classify(prop: string): Cost {
  const p = prop.trim().toLowerCase();
  if (COMPOSITED_PROPS.has(p)) return 'composited';
  if (LAYOUT_PROPS.has(p)) return 'layout';
  if (PAINT_PROPS.has(p)) return 'paint';
  if (p === 'all') return 'layout'; // `transition: all` animates whatever changes, including layout
  if (p.startsWith('--')) return 'unknown'; // a custom property; cost depends on where it is used
  return 'unknown';
}

/* ------------------------------------------------------------------ *
 * A minimal CSS reader
 * ------------------------------------------------------------------ */

/**
 * Tracks the at-rule stack so a declaration knows whether it sits inside
 * `@media (prefers-reduced-motion: reduce)`. That context is the entire point:
 * `animation: none` inside a reduce block is an exemption, and the identical
 * declaration outside one is a bug. A regex over the flat file cannot tell them
 * apart, which is why this walks braces instead.
 */
export interface Declaration {
  prop: string;
  value: string;
  line: number;
  selector: string;
  atRules: string[];
}

export function readDeclarations(css: string): Declaration[] {
  const out: Declaration[] = [];
  const atStack: string[] = [];
  const selectorStack: string[] = [];
  let buffer = '';
  let line = 1;
  let inComment = false;

  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === '\n') line++;

    if (inComment) {
      if (c === '*' && css[i + 1] === '/') {
        inComment = false;
        i++;
      }
      continue;
    }
    if (c === '/' && css[i + 1] === '*') {
      inComment = true;
      i++;
      continue;
    }

    if (c === '{') {
      const head = buffer.trim();
      buffer = '';
      if (head.startsWith('@')) atStack.push(head);
      else selectorStack.push(head);
      // Keep the stacks aligned in depth so `}` can pop the right one.
      if (!head.startsWith('@')) atStack.push('');
      else selectorStack.push('');
      continue;
    }
    if (c === '}') {
      buffer = '';
      atStack.pop();
      selectorStack.pop();
      continue;
    }
    if (c === ';') {
      const decl = buffer.trim();
      buffer = '';
      const colon = decl.indexOf(':');
      if (colon > 0) {
        out.push({
          prop: decl.slice(0, colon).trim(),
          value: decl.slice(colon + 1).trim(),
          line,
          selector: [...selectorStack].filter(Boolean).join(' '),
          atRules: [...atStack].filter(Boolean),
        });
      }
      continue;
    }
    buffer += c;
  }
  return out;
}

const inReduceBlock = (d: Declaration) =>
  d.atRules.some((a) => /prefers-reduced-motion\s*:\s*reduce/.test(a));
const inNoPreferenceBlock = (d: Declaration) =>
  d.atRules.some((a) => /prefers-reduced-motion\s*:\s*no-preference/.test(a));

/* ------------------------------------------------------------------ *
 * The profile
 * ------------------------------------------------------------------ */

export interface AnimatedProperty {
  prop: string;
  cost: Cost;
  where: string;
  selector: string;
  duration?: number;
  infinite?: boolean;
  guarded: boolean;
}

export interface Profile {
  file: string;
  properties: AnimatedProperty[];
  keyframes: Array<{ name: string; props: string[]; worstCost: Cost; line: number }>;
  backdropFilters: Array<{ line: number; selector: string; saturated: boolean }>;
  willChange: Array<{ line: number; value: string; selector: string }>;
  infiniteCount: number;
  guardedCount: number;
}

/** `transition: border-color 0.3s ease, transform 0.4s cubic-bezier(...)` */
function parseTransition(value: string): Array<{ prop: string; seconds: number }> {
  // Split on commas that are not inside parentheses — cubic-bezier() has three.
  const parts: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(cur);
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) parts.push(cur);

  return parts
    .map((part) => {
      const tokens = part.trim().split(/\s+/);
      const prop = tokens[0] ?? '';
      const time = tokens.find((t) => /^\d*\.?\d+m?s$/.test(t));
      const seconds = time ? (time.endsWith('ms') ? parseFloat(time) / 1000 : parseFloat(time)) : 0;
      return { prop, seconds };
    })
    .filter((t) => t.prop && !/^(cubic-bezier|ease|linear|steps|\d)/.test(t.prop));
}

export function profileCss(path: string): Profile {
  const css = readFileSync(path, 'utf8');
  const decls = readDeclarations(css);
  const rel = path.replace(ROOT, '').replace(/\\/g, '/').replace(/^\//, '');

  const properties: AnimatedProperty[] = [];
  const backdropFilters: Profile['backdropFilters'] = [];
  const willChange: Profile['willChange'] = [];

  for (const d of decls) {
    const prop = d.prop.toLowerCase();
    const guarded = inReduceBlock(d) || inNoPreferenceBlock(d);

    if (prop === 'transition' || prop === 'transition-property') {
      const parsed = prop === 'transition' ? parseTransition(d.value) : d.value.split(',').map((p) => ({ prop: p.trim(), seconds: 0 }));
      for (const t of parsed) {
        if (t.prop === 'none') continue;
        properties.push({
          prop: t.prop,
          cost: classify(t.prop),
          where: `${rel}:${d.line}`,
          selector: d.selector,
          duration: t.seconds,
          guarded,
        });
      }
    }

    if (prop === 'animation' || prop === 'animation-name') {
      if (/^\s*none\b/.test(d.value)) continue;
      const infinite = /\binfinite\b/.test(d.value);
      const time = /(\d*\.?\d+)(m?s)/.exec(d.value);
      properties.push({
        prop: `@${d.value.trim().split(/\s+/)[0]}`,
        cost: 'unknown', // resolved below from the keyframes it names
        where: `${rel}:${d.line}`,
        selector: d.selector,
        duration: time ? (time[2] === 'ms' ? parseFloat(time[1]) / 1000 : parseFloat(time[1])) : undefined,
        infinite,
        guarded,
      });
    }

    if (prop === 'backdrop-filter' || prop === '-webkit-backdrop-filter') {
      if (prop === 'backdrop-filter') {
        backdropFilters.push({ line: d.line, selector: d.selector, saturated: /saturate\(/.test(d.value) });
      }
    }

    if (prop === 'will-change') {
      willChange.push({ line: d.line, value: d.value, selector: d.selector });
    }
  }

  // Keyframes: which properties each named animation actually moves.
  const keyframes: Profile['keyframes'] = [];
  const kfRe = /@keyframes\s+([\w-]+)\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = kfRe.exec(css))) {
    const start = m.index + m[0].length;
    let depth = 1;
    let i = start;
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
      i++;
    }
    const body = css.slice(start, i - 1);
    const props = [...new Set([...body.matchAll(/([a-z-]+)\s*:/g)].map((x) => x[1].toLowerCase()))].filter(
      (p) => !p.startsWith('--'),
    );
    const costs = props.map(classify);
    const worstCost: Cost = costs.includes('layout') ? 'layout' : costs.includes('paint') ? 'paint' : costs.includes('composited') ? 'composited' : 'unknown';
    keyframes.push({ name: m[1], props, worstCost, line: css.slice(0, m.index).split('\n').length });
  }

  // Resolve `animation: text-shine …` to the cost of the `text-shine` keyframes.
  for (const p of properties) {
    if (!p.prop.startsWith('@')) continue;
    const kf = keyframes.find((k) => k.name === p.prop.slice(1));
    if (kf) p.cost = kf.worstCost;
  }

  return {
    file: rel,
    properties,
    keyframes,
    backdropFilters,
    willChange,
    infiniteCount: properties.filter((p) => p.infinite).length,
    guardedCount: properties.filter((p) => p.guarded).length,
  };
}

/* ------------------------------------------------------------------ *
 * Component-level motion
 * ------------------------------------------------------------------ */

/** Framer Motion props that move layout rather than the compositor. */
const FM_LAYOUT_KEYS = ['width', 'height', 'top', 'left', 'right', 'bottom', 'margin', 'padding', 'fontSize'];

export function profileComponents(): Finding[] {
  const out: Finding[] = [];
  const files = walk(SRC).filter((f) => f.endsWith('.tsx'));

  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    const rel = file.replace(ROOT, '').replace(/\\/g, '/').replace(/^\//, '');
    const lineAt = (i: number) => src.slice(0, i).split('\n').length;

    // 1 · Framer Motion animating layout properties.
    const animateBlocks = [...src.matchAll(/(?:animate|whileHover|whileInView|initial)\s*=\s*\{\{([^}]*)\}\}/g)];
    for (const b of animateBlocks) {
      const hit = FM_LAYOUT_KEYS.filter((k) => new RegExp(`\\b${k}\\s*:`).test(b[1]));
      if (hit.length) {
        out.push(
          finding('motion:layout-animation', 'warn', `Framer Motion animates layout propert${hit.length > 1 ? 'ies' : 'y'} ${hit.join(', ')} — reflow every frame`, {
            where: `${rel}:${lineAt(b.index!)}`,
            fix: 'animate transform/opacity instead, or use layout animations which measure once rather than per frame',
            evidence: hit,
          }),
        );
      }
    }

    // 2 · will-change without a matching removal. A permanent will-change
    //     promotes a layer for the lifetime of the element; on an adapter with
    //     1 GB of *shared* memory that is a real allocation, not a hint.
    const wc = [...src.matchAll(/will-change-\w+|willChange\s*:/g)];
    if (wc.length > 4) {
      out.push(
        finding('motion:will-change-budget', 'warn', `${wc.length} will-change hints in one component — each promotes a compositor layer for the element's lifetime`, {
          where: `${rel}:${lineAt(wc[0].index!)}`,
          fix: 'Chromium ignores the hint past a layer budget anyway; keep it on the few elements that animate continuously',
          evidence: wc.length,
        }),
      );
    }

    // 3 · Motion with no reduced-motion path anywhere in the file.
    const animates = /animate\s*=|animation:|transition\s*=|useScroll|useTransform|gsap\./.test(src);
    const guards = /prefers-reduced-motion|useReducedMotion|shouldReduceMotion/.test(src);
    if (animates && !guards) {
      out.push(
        finding('motion:unguarded', 'warn', 'animates without any reduced-motion path', {
          where: rel,
          fix: 'useReducedMotion() from framer-motion, or gate the CSS in @media (prefers-reduced-motion: no-preference)',
        }),
      );
    }
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * The measured half — read, never estimated
 * ------------------------------------------------------------------ */

export interface TraceEvidence {
  file: string;
  experiments: Array<{ name: string; ms: number }>;
}

/**
 * Reads whatever `trace-paint.mjs` last wrote. Returns null rather than
 * inventing a number when no trace exists — the report then says "not
 * measured", which is the truthful state of a machine that could not launch a
 * browser.
 */
export function readTrace(): TraceEvidence | null {
  if (!existsSync(LIGHTHOUSE_DIR)) return null;
  const files = readdirSync(LIGHTHOUSE_DIR).filter((f) => f.startsWith('trace-paint-') && f.endsWith('.json'));
  if (!files.length) return null;
  try {
    const path = join(LIGHTHOUSE_DIR, files.sort().at(-1)!);
    const raw = JSON.parse(readFileSync(path, 'utf8'));
    const experiments = Object.entries(raw.results ?? {}).map(([name, v]: [string, any]) => ({
      name,
      ms: Number(v?.paintMs ?? v?.ms ?? v?.median ?? NaN),
    }));
    return { file: files.sort().at(-1)!, experiments };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Audit
 * ------------------------------------------------------------------ */

/** Budgets. Each is a count the page can hold before the cost stops being free. */
const BUDGET = {
  /** Non-composited animated properties. Zero is unrealistic; 8 is not. */
  nonComposited: 8,
  /** Animations that never stop. Each one keeps a layer live forever. */
  infinite: 12,
  /** Distinct backdrop-filter rules. Each is a readback of what is behind it. */
  backdropFilters: 20,
  /** Fraction of animations that must have a reduced-motion path. */
  guardedRatio: 0.5,
};

export interface AnimationAudit {
  profiles: Profile[];
  findings: Finding[];
  status: Status;
  totals: {
    animated: number;
    composited: number;
    paint: number;
    layout: number;
    infinite: number;
    backdropFilters: number;
    unsaturatedGlass: number;
  };
}

export function audit(): AnimationAudit {
  const cssFiles = [join(SRC, 'app', 'globals.css'), ...walk(join(ROOT, 'styles')).filter((f) => f.endsWith('.css'))].filter(
    (f) => existsSync(f),
  );
  const profiles = cssFiles.map(profileCss);
  const findings: Finding[] = [];

  const all = profiles.flatMap((p) => p.properties);
  const layout = all.filter((p) => p.cost === 'layout');
  const paint = all.filter((p) => p.cost === 'paint');
  const composited = all.filter((p) => p.cost === 'composited');
  const infinite = all.filter((p) => p.infinite);
  const glass = profiles.flatMap((p) => p.backdropFilters);
  const unsaturated = glass.filter((g) => !g.saturated);

  // 1 · Layout-class animations. The expensive class, named individually
  //     because each one is a specific line somebody can go and fix.
  if (layout.length) {
    findings.push(
      finding('motion:layout-class', layout.length > 3 ? 'fail' : 'warn', `${layout.length} animation(s) on layout-triggering properties: ${[...new Set(layout.map((l) => l.prop))].join(', ')}`, {
        where: layout[0].where,
        fix: 'these reflow the subtree every frame. transform/opacity stay on the compositor.',
        evidence: layout.slice(0, 8).map((l) => ({ prop: l.prop, where: l.where, selector: l.selector })),
      }),
    );
  } else {
    findings.push(finding('motion:layout-class', 'ok', 'no animations on layout-triggering properties'));
  }

  // 2 · Paint-class animations against the budget.
  findings.push(
    paint.length > BUDGET.nonComposited
      ? finding('motion:paint-class', 'warn', `${paint.length} paint-class animation(s) against a budget of ${BUDGET.nonComposited}: ${[...new Set(paint.map((p) => p.prop))].join(', ')}`, {
          where: paint[0].where,
          fix: 'the steady-state main thread here is already ~75% paint and compositing — this adds to the majority cost',
          evidence: [...new Set(paint.map((p) => p.prop))],
        })
      : finding('motion:paint-class', 'ok', `${paint.length} paint-class animation(s), within the budget of ${BUDGET.nonComposited}`),
  );

  // 3 · Infinite animations.
  findings.push(
    infinite.length > BUDGET.infinite
      ? finding('motion:infinite', 'warn', `${infinite.length} infinite animation(s) against a budget of ${BUDGET.infinite}`, {
          fix: 'each keeps a compositor layer live for the page lifetime; pause them off-screen with an IntersectionObserver',
          evidence: infinite.map((i) => ({ prop: i.prop, where: i.where })),
        })
      : finding('motion:infinite', 'ok', `${infinite.length} infinite animation(s), within the budget of ${BUDGET.infinite}`),
  );

  // 4 · Glass. Count against budget, and the saturate rule from § 4.2.
  findings.push(
    glass.length > BUDGET.backdropFilters
      ? finding('motion:glass-count', 'warn', `${glass.length} backdrop-filter rules against a budget of ${BUDGET.backdropFilters}`, {
          fix: 'each forces a readback of everything painted behind it, and they compound when stacked',
        })
      : finding('motion:glass-count', 'ok', `${glass.length} backdrop-filter rule(s), within the budget of ${BUDGET.backdropFilters}`),
  );
  if (unsaturated.length) {
    findings.push(
      finding('motion:glass-fog', 'warn', `${unsaturated.length} backdrop blur(s) with no saturate() — VOS § 4.2 calls saturate the whole difference between glass and fog`, {
        where: `${profiles[0]?.file}:${unsaturated[0].line}`,
        evidence: unsaturated.slice(0, 6),
      }),
    );
  }

  // 5 · Reduced-motion coverage.
  const guardedRatio = all.length ? all.filter((p) => p.guarded).length / all.length : 1;
  findings.push(
    guardedRatio < BUDGET.guardedRatio
      ? finding('motion:reduced-motion', 'warn', `${Math.round(guardedRatio * 100)}% of animations sit inside a prefers-reduced-motion block (target ${BUDGET.guardedRatio * 100}%)`, {
          fix: 'the global reduce block should switch off decorative motion; check that it reaches these selectors',
          evidence: { guarded: all.filter((p) => p.guarded).length, total: all.length },
        })
      : finding('motion:reduced-motion', 'ok', `${Math.round(guardedRatio * 100)}% of animations are inside a prefers-reduced-motion block`),
  );

  findings.push(...profileComponents());

  // 6 · Measured evidence, or its absence stated plainly.
  const trace = readTrace();
  findings.push(
    trace
      ? finding('motion:measured', 'ok', `paint trace present (${trace.file}): ${trace.experiments.map((e) => `${e.name} ${Math.round(e.ms)}ms`).join(', ')}`, {
          evidence: trace,
        })
      : finding('motion:measured', 'skipped', 'no paint trace on disk — the per-frame cost of the above is unmeasured', {
          fix: 'npm run trace   (needs a browser; MemoryGuard admits it at 1.4 GB free)',
        }),
  );

  return {
    profiles,
    findings,
    status: worst(findings.map((f) => f.status)),
    totals: {
      animated: all.length,
      composited: composited.length,
      paint: paint.length,
      layout: layout.length,
      infinite: infinite.length,
      backdropFilters: glass.length,
      unsaturatedGlass: unsaturated.length,
    },
  };
}
