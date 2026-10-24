/**
 * TaskPlanner — what a change touches, before it is made.
 *
 * ## The question this answers
 *
 * "Edit `Surface.tsx`" sounds like one file. It is not. `Surface` is one of the
 * VOS engines, and the whole point of the engine model (VISUAL_OPERATING_SYSTEM
 * § 1) is that a section does not own its own card treatment — it composes one.
 * So a change to the elevation ladder inside `Surface` lands on every section
 * that renders one, on every route those sections appear on, and on every e2e
 * spec that visits those routes.
 *
 * A planner that cannot state that blast radius before the edit is decoration.
 * This one computes it from the import graph rather than asking anyone to
 * remember it.
 *
 * ## Why regex imports and not a real parser
 *
 * TypeScript's own compiler API is in `node_modules` and would give exact
 * module resolution. It is not used here, deliberately: loading `typescript`
 * costs ~80 MB of heap, and this module's entire reason to exist is to run
 * *before* expensive work on a machine that has repeatedly run out of memory.
 * The regex reader handles static imports, `export … from`, dynamic `import()`
 * and `require()`, which is the complete set this codebase uses — verified by
 * counting: every import line in `src/` matches one of those four forms. When
 * it cannot resolve a specifier it records it as unresolved rather than
 * dropping it, so the gap is visible instead of silently shrinking the graph.
 *
 * ## Design conflicts are project rules, not lint rules
 *
 * ESLint already catches what ESLint catches. The conflicts detected here are
 * the ones written down in `VISUAL_OPERATING_SYSTEM.md` and encoded in
 * `globals.css` and nowhere else — a raw hex where a token exists, a
 * `backdrop-filter` applied outside the surface ladder, two `--e4` surfaces in
 * one view when the system says at most one per viewport. Those are the rules
 * that make the system a system, and they are invisible to every other tool in
 * the pipeline.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve, sep } from 'node:path';
import { ROOT, SRC, TESTS } from './paths.ts';
import { finding } from './types.ts';
import type { Finding } from './types.ts';

/* ------------------------------------------------------------------ *
 * Walking the source
 * ------------------------------------------------------------------ */

const SOURCE_EXT = new Set(['.ts', '.tsx', '.mts', '.js', '.jsx']);
const IGNORED_DIRS = new Set(['node_modules', '.next', '.git', '.engineering', '.env-quarantine']);

export function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (SOURCE_EXT.has(extname(e.name))) out.push(p);
  }
  return out;
}

const norm = (p: string) => relative(ROOT, p).split(sep).join('/');

/* ------------------------------------------------------------------ *
 * The import graph
 * ------------------------------------------------------------------ */

/** Static `from '…'`, bare `import '…'`, dynamic `import('…')`, `require('…')`. */
const IMPORT_RE = /(?:from\s*|import\s*\(|require\s*\(\s*)['"]([^'"]+)['"]|^\s*import\s+['"]([^'"]+)['"]/gm;

export interface Module {
  path: string;
  loc: number;
  source: string;
  isClient: boolean;
  imports: string[];
  /** Specifiers that resolved to nothing on disk — bare packages and typos alike. */
  external: string[];
}

export interface Graph {
  modules: Map<string, Module>;
  /** importer → imported */
  edges: Map<string, Set<string>>;
  /** imported → importers. The one the blast radius is computed from. */
  reverse: Map<string, Set<string>>;
}

/** Resolves a specifier the way the bundler does: alias, extension, index file. */
function resolveSpecifier(fromFile: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith('@/')) base = join(SRC, spec.slice(2));
  else if (spec.startsWith('.')) base = resolve(join(fromFile, '..'), spec);
  else return null; // a package, not a file in this repo

  const candidates = [
    base,
    ...['.tsx', '.ts', '.jsx', '.js', '.mts'].map((e) => base + e),
    ...['.tsx', '.ts', '.jsx', '.js'].map((e) => join(base, 'index' + e)),
  ];
  for (const c of candidates) {
    try {
      if (existsSync(c) && statSync(c).isFile()) return c;
    } catch {
      /* unreadable is unresolved */
    }
  }
  return null;
}

export function buildGraph(roots: string[] = [SRC, TESTS]): Graph {
  const files = roots.flatMap((r) => walk(r));
  const modules = new Map<string, Module>();
  const edges = new Map<string, Set<string>>();
  const reverse = new Map<string, Set<string>>();

  for (const file of files) {
    let source = '';
    try {
      source = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const key = norm(file);
    const imports: string[] = [];
    const external: string[] = [];

    IMPORT_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = IMPORT_RE.exec(source))) {
      const spec = m[1] ?? m[2];
      if (!spec) continue;
      const resolved = resolveSpecifier(file, spec);
      if (resolved) imports.push(norm(resolved));
      else external.push(spec);
    }

    modules.set(key, {
      path: key,
      loc: source.split('\n').length,
      source,
      isClient: /^\s*['"]use client['"]/m.test(source),
      imports,
      external,
    });
    edges.set(key, new Set(imports));
    for (const dep of imports) {
      if (!reverse.has(dep)) reverse.set(dep, new Set());
      reverse.get(dep)!.add(key);
    }
  }
  return { modules, edges, reverse };
}

/** Everything that transitively imports the targets. Cycle-safe. */
export function dependents(graph: Graph, targets: string[]): string[] {
  const seen = new Set<string>();
  const queue = [...targets];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const importer of graph.reverse.get(cur) ?? []) {
      if (seen.has(importer)) continue;
      seen.add(importer);
      queue.push(importer);
    }
  }
  return [...seen].sort();
}

/** Everything the targets transitively import, within this repo. */
export function dependencies(graph: Graph, targets: string[]): string[] {
  const seen = new Set<string>();
  const queue = [...targets];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const dep of graph.edges.get(cur) ?? []) {
      if (seen.has(dep)) continue;
      seen.add(dep);
      queue.push(dep);
    }
  }
  return [...seen].sort();
}

/* ------------------------------------------------------------------ *
 * Routes and their test coverage
 * ------------------------------------------------------------------ */

/** `src/app/work/page.tsx` → `/work`; `src/app/work/[slug]/page.tsx` → `/work/[slug]`. */
export function routeOf(modulePath: string): string | null {
  const m = /^src\/app\/(.*)page\.tsx$/.exec(modulePath);
  if (!m) return null;
  const segments = m[1]
    .split('/')
    .filter(Boolean)
    .filter((s) => !s.startsWith('(') && !s.startsWith('@'));
  return '/' + segments.join('/');
}

export function routesTouched(graph: Graph, affected: string[]): string[] {
  const set = new Set<string>();
  for (const p of affected) {
    const r = routeOf(p);
    if (r) set.add(r);
  }
  return [...set].sort();
}

/**
 * Which e2e specs visit the touched routes.
 *
 * Matched by reading the specs for literal paths rather than by naming
 * convention, because `work.spec.ts` covering `/work` is a coincidence of
 * naming that will eventually stop being true.
 */
export function specsCovering(routes: string[]): { spec: string; routes: string[] }[] {
  const specs = walk(TESTS).filter((f) => f.endsWith('.spec.ts'));
  const out: { spec: string; routes: string[] }[] = [];
  for (const file of specs) {
    let src = '';
    try {
      src = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const hits = routes.filter((r) => {
      if (r === '/') return /goto\(\s*['"`]\/?['"`]/.test(src) || /goto\(\s*['"`]\/\s*['"`]/.test(src);
      return src.includes(`'${r}`) || src.includes(`"${r}`) || src.includes('`' + r);
    });
    if (hits.length) out.push({ spec: norm(file), routes: hits });
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Complexity
 * ------------------------------------------------------------------ */

export interface Complexity {
  path: string;
  loc: number;
  jsxElements: number;
  hooks: number;
  branches: number;
  isClient: boolean;
  /** Repo-internal modules that import this one, transitively. */
  dependentCount: number;
  score: number;
}

const HOOK_RE = /\buse[A-Z]\w*\s*\(/g;
const JSX_RE = /<[A-Z][\w.]*/g;
const BRANCH_RE = /\b(if|else if|switch|case|\?\?|&&|\|\||\?)/g;

export function complexityOf(graph: Graph, path: string): Complexity | null {
  const mod = graph.modules.get(path);
  if (!mod) return null;
  const count = (re: RegExp) => (mod.source.match(re) ?? []).length;
  const dependentCount = dependents(graph, [path]).length;

  // Weighted so that reach dominates size. A 40-line engine imported by 20
  // sections is a bigger change than a 400-line leaf page nothing imports —
  // which is the mistake a raw line count makes every time.
  const score =
    mod.loc / 100 + count(JSX_RE) / 20 + count(HOOK_RE) / 5 + count(BRANCH_RE) / 30 + dependentCount * 0.6;

  return {
    path,
    loc: mod.loc,
    jsxElements: count(JSX_RE),
    hooks: count(HOOK_RE),
    branches: count(BRANCH_RE),
    isClient: mod.isClient,
    dependentCount,
    score: Math.round(score * 10) / 10,
  };
}

export type Size = 'S' | 'M' | 'L' | 'XL';

export function sizeOf(total: number): Size {
  if (total < 6) return 'S';
  if (total < 18) return 'M';
  if (total < 45) return 'L';
  return 'XL';
}

/* ------------------------------------------------------------------ *
 * Design conflicts — the rules only this project has
 * ------------------------------------------------------------------ */

/** The spacing scale declared in globals.css `:root`. */
const SPACE_SCALE = new Set([0, 1, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192, 256]);

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
const RGB_LITERAL_RE = /\brgba?\(\s*\d+\s*[, ]\s*\d+\s*[, ]\s*\d+/g;
const ARBITRARY_TW_RE = /\b(?:[a-z-]+)-\[[^\]]+\]/g;
const ZINDEX_RE = /\bz-index\s*:\s*(\d+)|\bz-\[(\d+)\]/g;

export function designConflicts(graph: Graph, paths: string[]): Finding[] {
  const out: Finding[] = [];

  for (const p of paths) {
    const mod = graph.modules.get(p);
    if (!mod) continue;
    const src = mod.source;
    const at = (index: number) => `${p}:${src.slice(0, index).split('\n').length}`;

    // 1 · Raw colour literals where a token exists. globals.css is the one file
    //     allowed to name a colour, because that is where the tokens are defined.
    if (!p.endsWith('globals.css')) {
      const hexes = [...src.matchAll(HEX_RE)].filter((m) => !/^#(fff|000)f?f?$/i.test(m[0]));
      const rgbs = [...src.matchAll(RGB_LITERAL_RE)].filter((m) => !src.slice(m.index!, m.index! + 60).includes('var(--'));
      const literals = [...hexes, ...rgbs];
      if (literals.length) {
        out.push(
          finding(
            'design:raw-colour',
            'warn',
            `${literals.length} raw colour literal(s) — the palette lives in globals.css :root as --color-* tokens`,
            {
              where: at(literals[0].index!),
              fix: 'use rgb(var(--color-accent) / <alpha>) so a palette change reaches this too',
              evidence: literals.slice(0, 6).map((m) => m[0]),
            },
          ),
        );
      }
    }

    // 2 · Arbitrary Tailwind values. Each one is a value outside the scale that
    //     no token change will ever reach.
    const arbitrary = [...src.matchAll(ARBITRARY_TW_RE)];
    if (arbitrary.length > 3) {
      out.push(
        finding('design:arbitrary-tailwind', 'warn', `${arbitrary.length} arbitrary Tailwind values — each is outside the scale`, {
          where: at(arbitrary[0].index!),
          fix: 'promote a repeated arbitrary value to a token in tailwind.config.ts or globals.css',
          evidence: [...new Set(arbitrary.map((m) => m[0]))].slice(0, 8),
        }),
      );
    }

    // 3 · Off-scale pixel values in style objects and CSS.
    const px = [...src.matchAll(/(\d+)px/g)].map((m) => Number(m[1]));
    const offScale = [...new Set(px.filter((n) => n > 3 && !SPACE_SCALE.has(n)))];
    if (offScale.length > 4) {
      out.push(
        finding('design:off-scale-spacing', 'warn', `${offScale.length} distinct off-scale px values`, {
          where: p,
          fix: 'the scale is --space-1…--space-64 (4,8,12,16,20,24,32,40,48,64,80,96,128,160,192,256)',
          evidence: offScale.slice(0, 12),
        }),
      );
    }

    // 4 · Elevation ladder. VISUAL_OPERATING_SYSTEM § 3.3: at most one --e4 per
    //     viewport, because the accent bloom is what makes something the
    //     subject, and two subjects is none. Per-file is a proxy for per-view;
    //     it is stated as such rather than dressed up as exact.
    const e4 = [...src.matchAll(/vos-surface--e4|elevation=\{?["']?4/g)];
    if (e4.length > 1) {
      out.push(
        finding('design:two-subjects', 'warn', `${e4.length} elevation-4 surfaces in one module — the system allows one per viewport`, {
          where: at(e4[0].index!),
          fix: 'demote all but the subject to e2/e3. If they are genuinely in different viewports, this is a false positive worth a comment.',
          evidence: e4.length,
        }),
      );
    }

    // 5 · backdrop-filter outside the ladder. The surface ladder pairs blur with
    //     `saturate(180%)` on purpose — § 4.2 calls saturate "the whole
    //     difference between glass and fog". A bare blur is the fog.
    const blurs = [...src.matchAll(/backdrop-(?:filter|blur)/g)];
    if (blurs.length && !/vos-surface/.test(src) && !p.endsWith('globals.css')) {
      const saturated = /saturate\(/.test(src);
      out.push(
        finding(
          'design:glass-bypass',
          'warn',
          `${blurs.length} backdrop blur(s) outside the VOS surface ladder${saturated ? '' : ', with no saturate() — that renders as fog, not glass'}`,
          {
            where: at(blurs[0].index!),
            fix: 'compose <Surface elevation> instead of hand-rolling glass; the ladder carries blur, fill, edge and shadow together',
            evidence: { blurs: blurs.length, saturated },
          },
        ),
      );
    }

    // 6 · Raw z-index. A literal stack position is a depth decision made in
    //     isolation from every other depth decision.
    const zs = [...src.matchAll(ZINDEX_RE)].map((m) => Number(m[1] ?? m[2])).filter((n) => n > 10);
    if (zs.length) {
      out.push(
        finding('design:z-index', 'warn', `z-index literal(s) above 10: ${[...new Set(zs)].join(', ')}`, {
          where: p,
          fix: 'depth belongs to the elevation ladder; a bare z-index competes with it',
          evidence: [...new Set(zs)],
        }),
      );
    }
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Performance risks
 * ------------------------------------------------------------------ */

/** Packages whose cost lands in the client bundle. Gzipped KB, approximate. */
const HEAVY: Array<{ match: RegExp; kb: number; note: string }> = [
  { match: /^three$/, kb: 170, note: 'the single largest dependency in the tree' },
  { match: /^@react-three\//, kb: 60, note: 'pulls three with it' },
  { match: /^@splinetool\//, kb: 120, note: 'runtime + scene loader' },
  { match: /^gsap/, kb: 45, note: 'consider the CSS scroll-driven engines the VOS already uses' },
  { match: /^framer-motion$/, kb: 55, note: 'tree-shakes poorly when imported at module scope' },
  { match: /^lenis$/, kb: 12, note: 'smooth scroll; conflicts with animation-timeline: view()' },
  { match: /^lighthouse$/, kb: 0, note: 'dev-only — must never reach a client component' },
];

export function performanceRisks(graph: Graph, paths: string[]): Finding[] {
  const out: Finding[] = [];

  for (const p of paths) {
    const mod = graph.modules.get(p);
    if (!mod) continue;
    const src = mod.source;
    const at = (index: number) => `${p}:${src.slice(0, index).split('\n').length}`;

    // 1 · Heavy packages statically imported into a client component.
    if (mod.isClient) {
      const heavy = mod.external
        .map((spec) => ({ spec, hit: HEAVY.find((h) => h.match.test(spec)) }))
        .filter((x) => x.hit);
      // A dynamic import of the same specifier means it is already code-split.
      const staticHeavy = heavy.filter((h) => !new RegExp(`import\\(\\s*['"]${escapeRe(h.spec)}`).test(src));
      if (staticHeavy.length) {
        const kb = staticHeavy.reduce((s, h) => s + h.hit!.kb, 0);
        out.push(
          finding(
            'perf:heavy-client-import',
            'warn',
            `client component statically imports ${staticHeavy.map((h) => h.spec).join(', ')} — ~${kb} KB gzipped into this route's bundle`,
            {
              where: p,
              fix: 'next/dynamic with ssr:false, or move the work behind an interaction. Budget is 360 KB JS gzipped for the whole page.',
              evidence: staticHeavy.map((h) => ({ spec: h.spec, kb: h.hit!.kb, note: h.hit!.note })),
            },
          ),
        );
      }
    }

    // 2 · Effects with no dependency array: re-run on every render.
    const loose = [...src.matchAll(/useEffect\(\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*\)\s*;/g)];
    if (loose.length) {
      out.push(
        finding('perf:effect-no-deps', 'warn', `${loose.length} useEffect with no dependency array — runs after every render`, {
          where: at(loose[0].index!),
          fix: 'add a dependency array, even an empty one',
          evidence: loose.length,
        }),
      );
    }

    // 3 · Uncancelled animation loops. On a page whose steady-state main thread
    //     is ~75% paint and compositing, a leaked rAF is not a small leak.
    const raf = [...src.matchAll(/requestAnimationFrame\s*\(/g)];
    const cancels = [...src.matchAll(/cancelAnimationFrame\s*\(/g)];
    if (raf.length > cancels.length) {
      out.push(
        finding('perf:raf-leak', 'warn', `${raf.length} requestAnimationFrame call(s), ${cancels.length} cancel(s)`, {
          where: at(raf[0].index!),
          fix: 'return a cleanup that cancels the frame, or the loop survives unmount',
          evidence: { raf: raf.length, cancels: cancels.length },
        }),
      );
    }
    const intervals = [...src.matchAll(/setInterval\s*\(/g)];
    const clears = [...src.matchAll(/clearInterval\s*\(/g)];
    if (intervals.length > clears.length) {
      out.push(
        finding('perf:interval-leak', 'warn', `${intervals.length} setInterval, ${clears.length} clearInterval`, {
          where: at(intervals[0].index!),
          fix: 'clear it in the effect cleanup',
          evidence: { intervals: intervals.length, clears: clears.length },
        }),
      );
    }

    // 4 · Unoptimised images. next/image handles sizing, format and lazy
    //     loading; a bare <img> in this codebase is a CLS source.
    const imgs = [...src.matchAll(/<img\s/g)];
    if (imgs.length) {
      out.push(
        finding('perf:raw-img', 'warn', `${imgs.length} raw <img> — next/image gives sizing, AVIF/WebP and lazy loading`, {
          where: at(imgs[0].index!),
          fix: 'an <img> with no width/height is a layout-shift source, and CLS is already a tracked metric here',
          evidence: imgs.length,
        }),
      );
    }
  }
  return out;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* ------------------------------------------------------------------ *
 * The plan
 * ------------------------------------------------------------------ */

export interface Task {
  order: number;
  layer: string;
  description: string;
  files: string[];
}

export interface Plan {
  targets: string[];
  affected: string[];
  routes: string[];
  specs: { spec: string; routes: string[] }[];
  complexity: Complexity[];
  size: Size;
  totalScore: number;
  drivers: string[];
  conflicts: Finding[];
  risks: Finding[];
  tasks: Task[];
  findings: Finding[];
}

/**
 * Layers, in the order a change must move through them.
 *
 * This ordering is not stylistic. Tokens are consumed by engines, engines by
 * sections, sections by pages. Editing a section against a token you have not
 * defined yet means building the section twice, and RC5's migration is the
 * evidence: the sections that were rebuilt after the engines landed took one
 * pass, and the one rebuilt alongside them took three.
 */
const LAYERS: Array<{ name: string; match: RegExp; description: string }> = [
  { name: 'tokens', match: /globals\.css$|tailwind\.config|src\/config\//, description: 'define or adjust the tokens first — everything downstream reads them' },
  { name: 'engines', match: /src\/components\/vos\//, description: 'update the VOS engines so sections compose the new behaviour rather than reimplementing it' },
  { name: 'lib', match: /src\/lib\//, description: 'shared logic and choreography' },
  { name: 'content', match: /src\/content\//, description: 'copy and data' },
  { name: 'sections', match: /src\/components\/sections\//, description: 'apply the engines to the sections' },
  { name: 'components', match: /src\/components\//, description: 'remaining components' },
  { name: 'pages', match: /src\/app\//, description: 'compose the sections into routes' },
  { name: 'tests', match: /tests\//, description: 'extend the specs that cover the touched routes' },
];

export function plan(targets: string[], graph: Graph = buildGraph()): Plan {
  const normalised = targets.map((t) => norm(resolve(ROOT, t)));
  const known = normalised.filter((t) => graph.modules.has(t));
  const unknown = normalised.filter((t) => !graph.modules.has(t));

  const affected = [...new Set([...known, ...dependents(graph, known)])].sort();
  const routes = routesTouched(graph, affected);
  const specs = specsCovering(routes);
  const complexity = affected.map((p) => complexityOf(graph, p)).filter((c): c is Complexity => !!c);
  const totalScore = Math.round(complexity.reduce((s, c) => s + c.score, 0) * 10) / 10;

  const conflicts = designConflicts(graph, known);
  const risks = performanceRisks(graph, known);

  const drivers: string[] = [];
  if (affected.length > known.length) {
    drivers.push(`${affected.length - known.length} module(s) transitively affected beyond the ${known.length} edited`);
  }
  if (routes.length) drivers.push(`${routes.length} route(s) rendered from the affected set: ${routes.join(', ')}`);
  const clientHeavy = complexity.filter((c) => c.isClient && c.score > 4);
  if (clientHeavy.length) drivers.push(`${clientHeavy.length} client component(s) above the complexity threshold`);
  if (conflicts.length) drivers.push(`${conflicts.length} design-system conflict(s)`);
  if (risks.length) drivers.push(`${risks.length} performance risk(s)`);
  if (!specs.length && routes.length) drivers.push('no e2e spec visits the touched routes — regressions here are invisible to the suite');

  const tasks: Task[] = [];
  let order = 1;
  for (const layer of LAYERS) {
    const files = affected.filter((p) => layer.match.test(p));
    // A file matches the first layer it belongs to, so a page never also
    // appears under `components`.
    const claimed = tasks.flatMap((t) => t.files);
    const mine = files.filter((f) => !claimed.includes(f));
    if (mine.length) tasks.push({ order: order++, layer: layer.name, description: layer.description, files: mine });
  }
  if (specs.length) {
    tasks.push({
      order: order++,
      layer: 'verify',
      description: `re-run the specs that cover the touched routes: ${specs.map((s) => s.spec).join(', ')}`,
      files: specs.map((s) => s.spec),
    });
  }

  const findings: Finding[] = [...conflicts, ...risks];
  if (unknown.length) {
    findings.push(
      finding('plan:unknown-target', 'warn', `${unknown.length} target(s) are not in the module graph: ${unknown.join(', ')}`, {
        fix: 'a new file has no dependents yet, which is fine. A typo has none either — check the spelling.',
      }),
    );
  }
  if (routes.length && !specs.length) {
    findings.push(
      finding('plan:no-coverage', 'warn', `${routes.length} touched route(s) with no e2e spec visiting them`, {
        fix: `add a spec, or accept that a regression on ${routes.join(', ')} will only be caught by eye`,
        evidence: routes,
      }),
    );
  }

  return {
    targets: normalised,
    affected,
    routes,
    specs,
    complexity: complexity.sort((a, b) => b.score - a.score),
    size: sizeOf(totalScore),
    totalScore,
    drivers,
    conflicts,
    risks,
    tasks,
    findings,
  };
}

/** Human-readable plan, for the terminal and for ENGINEERING_STATUS.md. */
export function formatPlan(p: Plan): string {
  const lines: string[] = [];
  lines.push(`Plan — ${p.size} (score ${p.totalScore})`);
  lines.push(`  targets   ${p.targets.length}: ${p.targets.join(', ')}`);
  lines.push(`  affected  ${p.affected.length} module(s), ${p.routes.length} route(s)`);
  if (p.drivers.length) {
    lines.push('  drivers');
    for (const d of p.drivers) lines.push(`    · ${d}`);
  }
  if (p.complexity.length) {
    lines.push('  heaviest affected modules');
    for (const c of p.complexity.slice(0, 6)) {
      lines.push(
        `    ${c.score.toFixed(1).padStart(5)}  ${c.path}  (${c.loc} loc, ${c.hooks} hooks, ${c.dependentCount} dependents${c.isClient ? ', client' : ''})`,
      );
    }
  }
  if (p.tasks.length) {
    lines.push('  ordered tasks');
    for (const t of p.tasks) {
      lines.push(`    ${t.order}. [${t.layer}] ${t.description}`);
      for (const f of t.files.slice(0, 8)) lines.push(`         ${f}`);
      if (t.files.length > 8) lines.push(`         … and ${t.files.length - 8} more`);
    }
  }
  if (p.findings.length) {
    lines.push('  conflicts and risks');
    for (const f of p.findings) lines.push(`    ${f.status.padEnd(5)} ${f.check.padEnd(28)} ${f.detail}${f.where ? `  (${f.where})` : ''}`);
  }
  return lines.join('\n');
}
