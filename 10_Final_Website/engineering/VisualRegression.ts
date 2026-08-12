/**
 * VisualRegression — pixel diffing, and a quality score that shows its working.
 *
 * ## Why there is a PNG decoder in this file
 *
 * `sharp` is present in `node_modules`, but only transitively — nothing in
 * `package.json` asks for it, so `npm ci` on a different lockfile resolution
 * can remove it without anything failing until the day someone needs a visual
 * diff. `pixelmatch` and `pngjs` are bundled inside `playwright-core` and not
 * exported. Adding a dependency to compare two PNGs is a poor trade on a box
 * that is already short of disk and memory.
 *
 * So the decoder is here: ~120 lines over `zlib.inflateSync`, covering the
 * 8-bit non-interlaced colour types Chromium emits. It has no dependencies, it
 * cannot be uninstalled, and it is exactly as fast as it needs to be for a few
 * dozen screenshots.
 *
 * ## Why the diff is perceptual rather than exact
 *
 * An exact byte comparison reports every screenshot of this site as changed,
 * every time. The homepage animates continuously — the ambient sheen, the
 * border beam, the spine trace — so two captures a second apart differ in
 * thousands of pixels while being visually identical. The YIQ colour-distance
 * metric below (the one `pixelmatch` uses) weights luminance far above
 * chrominance, matching how human vision works, and the threshold is what
 * separates "the beam moved 3 px" from "the card lost its border".
 *
 * ## Why the quality score is never a bare number
 *
 * A page scoring 84 tells nobody what to do. Every score here carries the list
 * of deductions that produced it, each with an element count and a selector, so
 * the number is a summary of findings rather than a substitute for them. A
 * dimension that could not be measured scores `null`, not zero — an unmeasured
 * contrast pass is not a page with bad contrast.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, join, relative, sep } from 'node:path';
import { inflateSync } from 'node:zlib';
import { finding, pct, worst } from './types.ts';
import type { Finding, Status } from './types.ts';

/* ================================================================== *
 * 1 · PNG
 * ================================================================== */

export interface Bitmap {
  width: number;
  height: number;
  /** RGBA, 4 bytes per pixel, row-major. */
  data: Uint8Array;
}

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Channel count per PNG colour type. */
const CHANNELS: Record<number, number> = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

export function decodePng(buf: Buffer): Bitmap {
  for (let i = 0; i < 8; i++) {
    if (buf[i] !== PNG_SIG[i]) throw new Error('not a PNG');
  }

  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  let palette: Buffer | null = null;
  let transparency: Buffer | null = null;
  const idat: Buffer[] = [];

  let off = 8;
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    off += 12 + len; // length + type + data + crc

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'PLTE') palette = Buffer.from(data);
    else if (type === 'tRNS') transparency = Buffer.from(data);
    else if (type === 'IDAT') idat.push(Buffer.from(data));
    else if (type === 'IEND') break;
  }

  if (bitDepth !== 8) throw new Error(`unsupported PNG bit depth ${bitDepth} (only 8 is handled)`);
  if (interlace !== 0) throw new Error('interlaced PNG is not supported');
  const channels = CHANNELS[colorType];
  if (!channels) throw new Error(`unsupported PNG colour type ${colorType}`);

  const raw = inflateSync(Buffer.concat(idat));
  const bpp = channels; // bit depth is 8, so one byte per channel
  const stride = width * bpp;
  const out = new Uint8Array(width * height * 4);
  const line = new Uint8Array(stride);
  const prev = new Uint8Array(stride);

  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    for (let x = 0; x < stride; x++) {
      const rawByte = raw[pos + x];
      const a = x >= bpp ? line[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      let value: number;
      switch (filter) {
        case 0: value = rawByte; break;
        case 1: value = rawByte + a; break;
        case 2: value = rawByte + b; break;
        case 3: value = rawByte + ((a + b) >> 1); break;
        case 4: value = rawByte + paeth(a, b, c); break;
        default: throw new Error(`unknown PNG filter ${filter} on row ${y}`);
      }
      line[x] = value & 0xff;
    }
    pos += stride;

    // Expand this scanline to RGBA.
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      const i = x * bpp;
      if (colorType === 6) {
        out[o] = line[i]; out[o + 1] = line[i + 1]; out[o + 2] = line[i + 2]; out[o + 3] = line[i + 3];
      } else if (colorType === 2) {
        out[o] = line[i]; out[o + 1] = line[i + 1]; out[o + 2] = line[i + 2]; out[o + 3] = 255;
      } else if (colorType === 0) {
        out[o] = out[o + 1] = out[o + 2] = line[i]; out[o + 3] = 255;
      } else if (colorType === 4) {
        out[o] = out[o + 1] = out[o + 2] = line[i]; out[o + 3] = line[i + 1];
      } else {
        // Palette
        const idx = line[i];
        out[o] = palette ? palette[idx * 3] : 0;
        out[o + 1] = palette ? palette[idx * 3 + 1] : 0;
        out[o + 2] = palette ? palette[idx * 3 + 2] : 0;
        out[o + 3] = transparency && idx < transparency.length ? transparency[idx] : 255;
      }
    }
    prev.set(line);
  }

  return { width, height, data: out };
}

/* ================================================================== *
 * 2 · Diff
 * ================================================================== */

/** YIQ luminance/chrominance, the basis of the perceptual distance below. */
const rgb2y = (r: number, g: number, b: number) => r * 0.29889531 + g * 0.58662247 + b * 0.11448223;
const rgb2i = (r: number, g: number, b: number) => r * 0.59597799 - g * 0.2741761 - b * 0.32180189;
const rgb2q = (r: number, g: number, b: number) => r * 0.21147017 - g * 0.52261711 + b * 0.31114694;

/** Maximum possible YIQ distance, used to normalise the threshold to 0…1. */
const MAX_YIQ_DELTA = 35215;

function blendOnWhite(r: number, g: number, b: number, a: number): [number, number, number] {
  if (a === 255) return [r, g, b];
  const k = a / 255;
  return [255 + (r - 255) * k, 255 + (g - 255) * k, 255 + (b - 255) * k];
}

export interface DiffResult {
  width: number;
  height: number;
  changedPixels: number;
  ratio: number;
  /** 16 x 16 grid of change density, so the report can say *where*. */
  regions: Array<{ col: number; row: number; ratio: number }>;
  maxDelta: number;
}

/**
 * `threshold` is the fraction of maximum perceptual distance at which two
 * pixels count as different. 0.1 is the value pixelmatch defaults to and the
 * value this project's animated captures need: below ~0.05 the ambient sheen
 * alone registers as a regression on every run.
 */
export function diff(a: Bitmap, b: Bitmap, threshold = 0.1): DiffResult {
  if (a.width !== b.width || a.height !== b.height) {
    // Callers handle this before reaching here; `compareDirs` turns it into a
    // size-change finding, which is more useful than a per-pixel comparison of
    // two differently-shaped images would have been.
    throw new Error(`dimension mismatch: ${a.width}x${a.height} vs ${b.width}x${b.height}`);
  }
  const cutoff = MAX_YIQ_DELTA * threshold * threshold;
  const GRID = 16;
  const cells = new Array(GRID * GRID).fill(0);
  const cellW = a.width / GRID;
  const cellH = a.height / GRID;

  let changed = 0;
  let maxDelta = 0;

  for (let y = 0; y < a.height; y++) {
    for (let x = 0; x < a.width; x++) {
      const o = (y * a.width + x) * 4;
      const [ar, ag, ab] = blendOnWhite(a.data[o], a.data[o + 1], a.data[o + 2], a.data[o + 3]);
      const [br, bg, bb] = blendOnWhite(b.data[o], b.data[o + 1], b.data[o + 2], b.data[o + 3]);
      const dy = rgb2y(ar, ag, ab) - rgb2y(br, bg, bb);
      const di = rgb2i(ar, ag, ab) - rgb2i(br, bg, bb);
      const dq = rgb2q(ar, ag, ab) - rgb2q(br, bg, bb);
      const delta = 0.5053 * dy * dy + 0.299 * di * di + 0.1957 * dq * dq;
      if (delta > maxDelta) maxDelta = delta;
      if (delta > cutoff) {
        changed++;
        const col = Math.min(GRID - 1, Math.floor(x / cellW));
        const row = Math.min(GRID - 1, Math.floor(y / cellH));
        cells[row * GRID + col]++;
      }
    }
  }

  const perCell = cellW * cellH;
  const regions = cells
    .map((n, i) => ({ col: i % GRID, row: Math.floor(i / GRID), ratio: n / perCell }))
    .filter((r) => r.ratio > 0.02)
    .sort((x, y) => y.ratio - x.ratio)
    .slice(0, 8);

  return {
    width: a.width,
    height: a.height,
    changedPixels: changed,
    ratio: changed / (a.width * a.height),
    regions,
    maxDelta: Math.round(maxDelta),
  };
}

/* ================================================================== *
 * 3 · Comparing two capture directories
 * ================================================================== */

export interface Comparison {
  name: string;
  status: Status;
  detail: string;
  diff?: DiffResult;
}

/** Change ratios above which a capture is flagged. */
const MOVED_RATIO = 0.005; // 0.5% of pixels — beyond continuous ambient motion
const REDESIGNED_RATIO = 0.08; // 8% — a structural change, not a tweak

function pngsIn(dir: string): Map<string, string> {
  const found = new Map<string, string>();
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop()!;
    if (!existsSync(cur)) continue;
    for (const e of readdirSync(cur, { withFileTypes: true })) {
      const p = join(cur, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (extname(e.name).toLowerCase() === '.png') {
        found.set(relative(dir, p).split(sep).join('/'), p);
      }
    }
  }
  return found;
}

export function compareDirs(beforeDir: string, afterDir: string, threshold = 0.1): {
  comparisons: Comparison[];
  findings: Finding[];
  status: Status;
} {
  if (!existsSync(beforeDir) || !existsSync(afterDir)) {
    const missing = [!existsSync(beforeDir) ? beforeDir : null, !existsSync(afterDir) ? afterDir : null].filter(Boolean);
    return {
      comparisons: [],
      findings: [
        finding('visual:regression', 'skipped', `capture directory missing: ${missing.join(', ')}`, {
          fix: 'npm run shots (or scripts/capture-release-preview.mjs) against a running server, once memory admits a browser',
        }),
      ],
      status: 'skipped',
    };
  }

  const before = pngsIn(beforeDir);
  const after = pngsIn(afterDir);
  const comparisons: Comparison[] = [];

  for (const [name, beforePath] of before) {
    const afterPath = after.get(name);
    if (!afterPath) {
      comparisons.push({ name, status: 'warn', detail: 'present before, missing after — a view was removed or renamed' });
      continue;
    }
    try {
      const beforeImg = decodePng(readFileSync(beforePath));
      const afterImg = decodePng(readFileSync(afterPath));

      // A full-page capture that changes height is not a failed comparison —
      // it is the comparison's most useful single result. Reporting it as
      // "could not compare" throws away the finding: `desktop/full.png` going
      // from 11992 px to 11076 px means the page lost 916 px of content, which
      // is exactly what a reviewer wants told to them first.
      if (beforeImg.width !== afterImg.width || beforeImg.height !== afterImg.height) {
        const dh = afterImg.height - beforeImg.height;
        const dw = afterImg.width - beforeImg.width;
        comparisons.push({
          name,
          status: 'warn',
          detail:
            `size changed ${beforeImg.width}x${beforeImg.height} → ${afterImg.width}x${afterImg.height}` +
            (dh ? ` (${dh > 0 ? '+' : ''}${dh} px tall, ${((dh / beforeImg.height) * 100).toFixed(1)}%)` : '') +
            (dw ? ` (${dw > 0 ? '+' : ''}${dw} px wide)` : '') +
            ' — pixel diff needs equal dimensions, so only the size change is measured here',
        });
        continue;
      }

      const d = diff(beforeImg, afterImg, threshold);
      const percent = d.ratio * 100;
      const where = d.regions.length
        ? ` — concentrated at ${d.regions.slice(0, 3).map((r) => `r${r.row}c${r.col}`).join(', ')} of a 16x16 grid`
        : '';
      const status: Status = d.ratio > REDESIGNED_RATIO ? 'warn' : d.ratio > MOVED_RATIO ? 'warn' : 'ok';
      comparisons.push({
        name,
        status,
        detail:
          d.ratio > REDESIGNED_RATIO
            ? `${percent.toFixed(2)}% of pixels changed — structural${where}`
            : d.ratio > MOVED_RATIO
              ? `${percent.toFixed(2)}% of pixels changed${where}`
              : `${percent.toFixed(3)}% changed — within continuous-motion noise`,
        diff: d,
      });
    } catch (error: any) {
      comparisons.push({ name, status: 'unknown', detail: `could not compare: ${error?.message ?? error}` });
    }
  }

  for (const [name] of after) {
    if (!before.has(name)) comparisons.push({ name, status: 'ok', detail: 'new view, no baseline to compare against' });
  }

  const changed = comparisons.filter((c) => c.diff && c.diff.ratio > MOVED_RATIO);
  const findings: Finding[] = [];

  findings.push(
    changed.length
      ? finding('visual:regression', 'warn', `${changed.length} of ${comparisons.length} view(s) changed beyond motion noise`, {
          fix: 'review each: a change here is only a regression if it was not the point of the edit',
          evidence: changed.slice(0, 12).map((c) => ({ view: c.name, percent: +(c.diff!.ratio * 100).toFixed(2) })),
        })
      : finding('visual:regression', 'ok', `${comparisons.length} view(s) compared, none beyond motion noise`, {
          evidence: { compared: comparisons.length, threshold },
        }),
  );

  const missing = comparisons.filter((c) => c.status === 'warn' && !c.diff);
  if (missing.length) {
    findings.push(
      finding('visual:missing-views', 'warn', `${missing.length} view(s) in the baseline have no counterpart`, {
        evidence: missing.map((m) => m.name),
      }),
    );
  }

  return { comparisons, findings, status: worst(findings.map((f) => f.status)) };
}

/** Lists what is available to compare against, so the CLI can suggest a pair. */
export function availableCaptures(root: string): Array<{ name: string; views: number; at: string }> {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      const dir = join(root, e.name);
      return { name: e.name, views: pngsIn(dir).size, at: statSync(dir).mtime.toISOString() };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/* ================================================================== *
 * 4 · The in-page audit
 * ================================================================== */

/**
 * The result shape the browser-side probe returns. Every numeric field is a
 * count of real elements, and `samples` carries selectors, so a score can
 * always be walked back to the nodes that caused it.
 */
export interface PageAudit {
  url: string;
  viewport: { width: number; height: number };
  spacing: { gaps: number; offScale: number; scale: number[]; samples: string[] };
  alignment: { blocks: number; distinctLeftEdges: number; strays: string[] };
  typography: { sizes: number[]; families: string[]; weights: number[]; minSize: number; longLines: number; samples: string[] };
  contrast: { checked: number; failures: Array<{ selector: string; ratio: number; fg: string; bg: string; size: number }> };
  depth: { shadows: string[]; distinctShadows: number; zIndexes: number[] };
  glass: { count: number; unsaturated: number; areaPct: number; stacked: number };
  skeuomorphic: { clay: number; neo: number; liquid: number; mixedOnOneElement: number };
  elevation: { e0: number; e1: number; e2: number; e3: number; e4: number };
  motion: { running: number; infinite: number; reducedMotionRespected: boolean | null };
  overdraw: { compositedLayers: number; blurLayers: number; stackedBlurArea: number };
  responsive: { horizontalOverflow: boolean; scrollWidth: number; clientWidth: number; overflowing: string[] };
  hierarchy: { h1Count: number; headingOrderBreaks: number; headings: Array<{ level: number; size: number; text: string }> };
  vitals: { lcp: number | null; cls: number | null; inp: number | null };
  errors: string[];
}

/**
 * The probe, as source, for injection through Playwright's `browser_evaluate`
 * or Chrome DevTools' `evaluate_script`.
 *
 * It is a string rather than a function because it must cross into a browser
 * this process is not linked to. It has no imports, touches no globals it does
 * not create, and mutates nothing on the page — it may be run against a live
 * session without changing what is being measured.
 *
 * Pair it with `VITALS_INIT_SOURCE` below, which must run *before* navigation:
 * LCP and CLS are only observable from the start of the page's lifetime, and a
 * probe injected after load reads zero for both, which would be a fabricated
 * pass rather than a measurement.
 */
export const PAGE_AUDIT_SOURCE = String.raw`
(() => {
  const SCALE = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192, 256];
  const sel = (el) => {
    if (!el || !el.tagName) return '(none)';
    const id = el.id ? '#' + el.id : '';
    const cls = typeof el.className === 'string' && el.className
      ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
      : '';
    return el.tagName.toLowerCase() + id + cls;
  };
  const errors = [];
  const guard = (name, fn, fallback) => {
    try { return fn(); } catch (e) { errors.push(name + ': ' + e.message); return fallback; }
  };

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const all = Array.from(document.querySelectorAll('body *')).filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });

  /* ---- spacing: vertical gaps between consecutive visible siblings ---- */
  const spacing = guard('spacing', () => {
    const gaps = [];
    const samples = [];
    const containers = Array.from(document.querySelectorAll('main, section, article, header, footer'));
    for (const c of containers) {
      const kids = Array.from(c.children).filter((k) => k.getBoundingClientRect().height > 0);
      for (let i = 1; i < kids.length; i++) {
        const prev = kids[i - 1].getBoundingClientRect();
        const cur = kids[i].getBoundingClientRect();
        const gap = Math.round(cur.top - prev.bottom);
        if (gap < 0 || gap > 400) continue;
        gaps.push(gap);
        if (!SCALE.includes(gap) && samples.length < 12) samples.push(sel(kids[i]) + ' gap ' + gap + 'px');
      }
    }
    return { gaps: gaps.length, offScale: gaps.filter((g) => !SCALE.includes(g)).length, scale: SCALE, samples };
  }, { gaps: 0, offScale: 0, scale: SCALE, samples: [] });

  /* ---- alignment: how many distinct left edges the content uses ---- */
  const alignment = guard('alignment', () => {
    const blocks = all.filter((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > vw * 0.25 && r.height > 20 && cs.display !== 'inline' && cs.position !== 'absolute' && cs.position !== 'fixed';
    });
    const edges = new Map();
    for (const el of blocks) {
      const left = Math.round(el.getBoundingClientRect().left);
      edges.set(left, (edges.get(left) || 0) + 1);
    }
    const sorted = Array.from(edges.entries()).sort((a, b) => b[1] - a[1]);
    const dominant = sorted.slice(0, 3).map((e) => e[0]);
    const strays = blocks
      .filter((el) => !dominant.some((d) => Math.abs(Math.round(el.getBoundingClientRect().left) - d) <= 2))
      .slice(0, 10)
      .map((el) => sel(el) + ' @ ' + Math.round(el.getBoundingClientRect().left) + 'px');
    return { blocks: blocks.length, distinctLeftEdges: edges.size, strays };
  }, { blocks: 0, distinctLeftEdges: 0, strays: [] });

  /* ---- typography ---- */
  const typography = guard('typography', () => {
    const textEls = all.filter((el) => {
      const t = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
      return t;
    });
    const sizes = new Set();
    const families = new Set();
    const weights = new Set();
    let longLines = 0;
    const samples = [];
    for (const el of textEls) {
      const cs = getComputedStyle(el);
      const size = Math.round(parseFloat(cs.fontSize) * 10) / 10;
      sizes.add(size);
      families.add(cs.fontFamily.split(',')[0].replace(/["']/g, '').trim());
      weights.add(parseInt(cs.fontWeight, 10) || 400);
      if (size < 12 && samples.length < 10) samples.push(sel(el) + ' at ' + size + 'px');
      const text = el.textContent.trim();
      const width = el.getBoundingClientRect().width;
      const approxChars = width / (size * 0.5);
      if (text.length > 120 && approxChars > 95) longLines++;
    }
    const sizeList = Array.from(sizes).sort((a, b) => a - b);
    return {
      sizes: sizeList,
      families: Array.from(families),
      weights: Array.from(weights).sort((a, b) => a - b),
      minSize: sizeList.length ? sizeList[0] : 0,
      longLines,
      samples,
    };
  }, { sizes: [], families: [], weights: [], minSize: 0, longLines: 0, samples: [] });

  /* ---- contrast ----
     The effective background is found by walking ancestors for the first
     non-transparent background-color. That is an approximation, and it is
     stated as one: a gradient, an image or a backdrop-filter behind the text
     will not be resolved this way, and this site uses all three. Failures are
     therefore candidates to look at, not a verdict.                        */
  const contrast = guard('contrast', () => {
    const parse = (c) => {
      const m = /rgba?\(([^)]+)\)/.exec(c);
      if (!m) return null;
      const p = m[1].split(/[, /]+/).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const lum = (c) => {
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const bgOf = (el) => {
      let n = el;
      while (n && n !== document.documentElement) {
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c && c.a > 0.5) return c;
        n = n.parentElement;
      }
      return { r: 6, g: 6, b: 8, a: 1 };
    };
    const failures = [];
    let checked = 0;
    const textEls = all.filter((el) =>
      Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 2));
    for (const el of textEls) {
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.1) continue;
      const fg = parse(cs.color);
      if (!fg) continue;
      const bg = bgOf(el);
      checked++;
      const l1 = lum(fg);
      const l2 = lum(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const size = parseFloat(cs.fontSize);
      const bold = (parseInt(cs.fontWeight, 10) || 400) >= 700;
      const large = size >= 24 || (size >= 18.66 && bold);
      const required = large ? 3 : 4.5;
      if (ratio < required && failures.length < 25) {
        failures.push({ selector: sel(el), ratio: Math.round(ratio * 100) / 100, fg: cs.color, bg: 'rgb(' + bg.r + ',' + bg.g + ',' + bg.b + ')', size: Math.round(size) });
      }
    }
    return { checked, failures };
  }, { checked: 0, failures: [] });

  /* ---- depth, glass, and the skeuomorphic families ---- */
  const shadowInfo = guard('depth', () => {
    const shadows = new Map();
    const zIndexes = new Set();
    let clay = 0, neo = 0, liquid = 0, mixed = 0;
    for (const el of all) {
      const cs = getComputedStyle(el);
      if (cs.boxShadow && cs.boxShadow !== 'none') {
        shadows.set(cs.boxShadow, (shadows.get(cs.boxShadow) || 0) + 1);
        const s = cs.boxShadow;
        const hasInset = s.includes('inset');
        const layers = s.split(/,(?![^(]*\))/).length;
        const blurs = Array.from(s.matchAll(/(\d+(?:\.\d+)?)px/g)).map((m) => parseFloat(m[1]));
        const maxBlur = blurs.length ? Math.max.apply(null, blurs) : 0;
        const isClay = hasInset && maxBlur >= 24;
        const isNeo = layers >= 2 && !hasInset && maxBlur >= 8 && maxBlur < 40;
        const isLiquid = hasInset && cs.backdropFilter && cs.backdropFilter !== 'none';
        if (isClay) clay++;
        if (isNeo) neo++;
        if (isLiquid) liquid++;
        if ([isClay, isNeo, isLiquid].filter(Boolean).length > 1) mixed++;
      }
      const z = parseInt(cs.zIndex, 10);
      if (!isNaN(z)) zIndexes.add(z);
    }
    return {
      shadows: Array.from(shadows.keys()).slice(0, 10),
      distinctShadows: shadows.size,
      zIndexes: Array.from(zIndexes).sort((a, b) => a - b),
      clay, neo, liquid, mixed,
    };
  }, { shadows: [], distinctShadows: 0, zIndexes: [], clay: 0, neo: 0, liquid: 0, mixed: 0 });

  const glass = guard('glass', () => {
    const glassy = all.filter((el) => {
      const cs = getComputedStyle(el);
      const bf = cs.backdropFilter || cs.webkitBackdropFilter;
      return bf && bf !== 'none';
    });
    let area = 0;
    let unsaturated = 0;
    let stacked = 0;
    const rects = [];
    for (const el of glassy) {
      const cs = getComputedStyle(el);
      const bf = cs.backdropFilter || cs.webkitBackdropFilter;
      if (!/saturate/.test(bf)) unsaturated++;
      const r = el.getBoundingClientRect();
      const visW = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
      const visH = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      area += visW * visH;
      for (const other of rects) {
        if (r.left < other.right && r.right > other.left && r.top < other.bottom && r.bottom > other.top) stacked++;
      }
      rects.push(r);
    }
    return {
      count: glassy.length,
      unsaturated,
      areaPct: Math.round((area / (vw * vh)) * 100),
      stacked,
    };
  }, { count: 0, unsaturated: 0, areaPct: 0, stacked: 0 });

  /* ---- the VOS elevation ladder ---- */
  const elevation = guard('elevation', () => {
    const count = (n) => document.querySelectorAll('.vos-surface--e' + n).length;
    return { e0: count(0), e1: count(1), e2: count(2), e3: count(3), e4: count(4) };
  }, { e0: 0, e1: 0, e2: 0, e3: 0, e4: 0 });

  /* ---- motion ---- */
  const motion = guard('motion', () => {
    const anims = document.getAnimations ? document.getAnimations() : [];
    const running = anims.filter((a) => a.playState === 'running').length;
    const infinite = anims.filter((a) => {
      const t = a.effect && a.effect.getTiming ? a.effect.getTiming() : null;
      return t && (t.iterations === Infinity || t.iterations > 1000);
    }).length;
    let respected = null;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      respected = running === 0;
    }
    return { running, infinite, reducedMotionRespected: respected };
  }, { running: 0, infinite: 0, reducedMotionRespected: null });

  /* ---- overdraw proxy ---- */
  const overdraw = guard('overdraw', () => {
    let composited = 0;
    let blurLayers = 0;
    for (const el of all) {
      const cs = getComputedStyle(el);
      if ((cs.willChange && cs.willChange !== 'auto') || cs.transform !== 'none' || parseFloat(cs.opacity) < 1) composited++;
      if ((cs.filter && cs.filter.includes('blur')) || (cs.backdropFilter && cs.backdropFilter !== 'none')) blurLayers++;
    }
    return { compositedLayers: composited, blurLayers, stackedBlurArea: glass.stacked };
  }, { compositedLayers: 0, blurLayers: 0, stackedBlurArea: 0 });

  /* ---- responsive ---- */
  const responsive = guard('responsive', () => {
    const de = document.documentElement;
    const overflowing = all
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.right > vw + 1 && r.width < vw * 3;
      })
      .slice(0, 10)
      .map((el) => sel(el) + ' right ' + Math.round(el.getBoundingClientRect().right) + 'px');
    return {
      horizontalOverflow: de.scrollWidth > de.clientWidth + 1,
      scrollWidth: de.scrollWidth,
      clientWidth: de.clientWidth,
      overflowing,
    };
  }, { horizontalOverflow: false, scrollWidth: 0, clientWidth: 0, overflowing: [] });

  /* ---- hierarchy ---- */
  const hierarchy = guard('hierarchy', () => {
    const hs = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
    const headings = hs.map((h) => ({
      level: parseInt(h.tagName[1], 10),
      size: Math.round(parseFloat(getComputedStyle(h).fontSize)),
      text: h.textContent.trim().slice(0, 60),
    }));
    let breaks = 0;
    for (let i = 1; i < headings.length; i++) {
      if (headings[i].level > headings[i - 1].level + 1) breaks++;
    }
    return { h1Count: hs.filter((h) => h.tagName === 'H1').length, headingOrderBreaks: breaks, headings };
  }, { h1Count: 0, headingOrderBreaks: 0, headings: [] });

  const vitals = guard('vitals', () => {
    const v = window.__engVitals || {};
    return {
      lcp: typeof v.lcp === 'number' ? Math.round(v.lcp) : null,
      cls: typeof v.cls === 'number' ? Math.round(v.cls * 1000) / 1000 : null,
      inp: typeof v.inp === 'number' ? Math.round(v.inp) : null,
    };
  }, { lcp: null, cls: null, inp: null });

  return {
    url: location.href,
    viewport: { width: vw, height: vh },
    spacing,
    alignment,
    typography,
    contrast,
    depth: { shadows: shadowInfo.shadows, distinctShadows: shadowInfo.distinctShadows, zIndexes: shadowInfo.zIndexes },
    glass,
    skeuomorphic: { clay: shadowInfo.clay, neo: shadowInfo.neo, liquid: shadowInfo.liquid, mixedOnOneElement: shadowInfo.mixed },
    elevation,
    motion,
    overdraw,
    responsive,
    hierarchy,
    vitals,
    errors,
  };
})()
`;

/**
 * Must be installed *before* navigation — `page.addInitScript` or CDP
 * `Page.addScriptToEvaluateOnNewDocument`.
 *
 * LCP and CLS are lifetime metrics. A probe that arrives after load sees a
 * buffered LCP but a CLS of zero for every shift whose sources have already
 * unmounted — which is exactly the failure `scripts/probe-cls.mjs` was written
 * to work around when Lighthouse attributed 0.103 of shift to no element at
 * all. INP needs a real interaction and stays null until one happens; it is
 * reported as null rather than as zero, because zero would read as perfect.
 */
export const VITALS_INIT_SOURCE = String.raw`
(() => {
  const v = { lcp: null, cls: 0, inp: null };
  window.__engVitals = v;
  try {
    new PerformanceObserver((l) => {
      const entries = l.getEntries();
      const last = entries[entries.length - 1];
      if (last) v.lcp = last.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {}
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) v.cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  } catch (e) {}
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        const d = e.duration;
        if (v.inp === null || d > v.inp) v.inp = d;
      }
    }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
  } catch (e) {}
})()
`;

/* ================================================================== *
 * 5 · Scoring
 * ================================================================== */

export interface Deduction {
  dimension: string;
  points: number;
  why: string;
}

export interface QualityScore {
  url: string;
  overall: number | null;
  dimensions: Record<string, number | null>;
  deductions: Deduction[];
  notMeasured: string[];
}

/**
 * Turns an audit into a score.
 *
 * Weights are equal across dimensions on purpose. Any other weighting is a
 * claim about which of spacing, contrast and motion matters most on this
 * specific site, and nobody has measured that. Equal weights are honest about
 * being arbitrary; a weighted set would look precise while being no better
 * founded.
 */
export function score(a: PageAudit): QualityScore {
  const deductions: Deduction[] = [];
  const notMeasured: string[] = [];
  const dims: Record<string, number | null> = {};

  const take = (dimension: string, points: number, why: string) => {
    if (points > 0) deductions.push({ dimension, points, why });
    return points;
  };

  // spacing — proportion of gaps that land off the 4px scale
  if (a.spacing.gaps >= 5) {
    const off = pct(a.spacing.offScale, a.spacing.gaps);
    dims.spacing = Math.round(Math.max(0, 100 - take('spacing', Math.min(60, off), `${a.spacing.offScale} of ${a.spacing.gaps} sibling gaps are off the 4px scale`)));
  } else {
    dims.spacing = null;
    notMeasured.push('spacing — fewer than 5 measurable sibling gaps on this page');
  }

  // alignment — how many left edges the layout uses beyond a sane grid
  if (a.alignment.blocks >= 5) {
    const excess = Math.max(0, a.alignment.distinctLeftEdges - 4);
    dims.alignment = Math.round(Math.max(0, 100 - take('alignment', Math.min(50, excess * 5), `${a.alignment.distinctLeftEdges} distinct left edges across ${a.alignment.blocks} blocks`)));
  } else {
    dims.alignment = null;
    notMeasured.push('alignment — fewer than 5 block-level elements wide enough to measure');
  }

  // typography — scale discipline plus a floor on legibility
  {
    let d = 0;
    d += take('typography', Math.min(30, Math.max(0, a.typography.sizes.length - 10) * 3), `${a.typography.sizes.length} distinct font sizes`);
    d += take('typography', Math.min(20, Math.max(0, a.typography.families.length - 2) * 10), `${a.typography.families.length} font families`);
    if (a.typography.minSize && a.typography.minSize < 12) {
      d += take('typography', 15, `smallest rendered text is ${a.typography.minSize}px`);
    }
    if (a.typography.longLines) {
      d += take('typography', Math.min(15, a.typography.longLines * 3), `${a.typography.longLines} paragraph(s) beyond ~95 characters per line`);
    }
    dims.typography = Math.max(0, 100 - d);
  }

  // contrast — the only dimension with a legal floor attached to it
  if (a.contrast.checked >= 5) {
    const failRate = pct(a.contrast.failures.length, a.contrast.checked);
    dims.contrast = Math.round(Math.max(0, 100 - take('contrast', Math.min(80, failRate * 4), `${a.contrast.failures.length} of ${a.contrast.checked} text nodes below WCAG AA (approximate — background walked from ancestors)`)));
  } else {
    dims.contrast = null;
    notMeasured.push('contrast — fewer than 5 text nodes with resolvable colour');
  }

  // depth — a ladder, not a collection
  {
    let d = 0;
    d += take('depth', Math.min(40, Math.max(0, a.depth.distinctShadows - 6) * 4), `${a.depth.distinctShadows} distinct box-shadow signatures (the VOS ladder defines 5)`);
    if (a.skeuomorphic.mixedOnOneElement) {
      d += take('depth', Math.min(20, a.skeuomorphic.mixedOnOneElement * 5), `${a.skeuomorphic.mixedOnOneElement} element(s) mix clay, neo and liquid shadow idioms`);
    }
    const highZ = a.depth.zIndexes.filter((z) => z > 100);
    if (highZ.length) d += take('depth', Math.min(15, highZ.length * 3), `z-index values above 100: ${highZ.join(', ')}`);
    dims.depth = Math.max(0, 100 - d);
  }

  // glass — the ladder governs radius; nothing governs count, so this does
  {
    let d = 0;
    if (a.glass.unsaturated) d += take('glass', Math.min(30, a.glass.unsaturated * 6), `${a.glass.unsaturated} blurred surface(s) without saturate() — fog, not glass (VOS § 4.2)`);
    if (a.glass.areaPct > 40) d += take('glass', Math.min(30, (a.glass.areaPct - 40)), `${a.glass.areaPct}% of the viewport is backdrop-filtered`);
    if (a.glass.stacked) d += take('glass', Math.min(25, a.glass.stacked * 5), `${a.glass.stacked} overlapping glass surface(s) — each readback compounds`);
    dims.glass = Math.max(0, 100 - d);
  }

  // elevation — the explicit rule from the design system
  {
    let d = 0;
    if (a.elevation.e4 > 1) d += take('elevation', Math.min(40, (a.elevation.e4 - 1) * 20), `${a.elevation.e4} elevation-4 surfaces in one viewport; the system allows one`);
    const total = a.elevation.e0 + a.elevation.e1 + a.elevation.e2 + a.elevation.e3 + a.elevation.e4;
    if (total === 0) {
      dims.elevation = null;
      notMeasured.push('elevation — no VOS surfaces rendered on this view');
    } else {
      dims.elevation = Math.max(0, 100 - d);
    }
  }

  // motion
  {
    let d = 0;
    if (a.motion.infinite > 12) d += take('motion', Math.min(30, (a.motion.infinite - 12) * 3), `${a.motion.infinite} infinite animations running`);
    if (a.motion.reducedMotionRespected === false) d += take('motion', 50, `${a.motion.running} animations still running under prefers-reduced-motion: reduce`);
    if (a.motion.reducedMotionRespected === null) notMeasured.push('motion — reduced-motion compliance needs a second pass with the media feature emulated');
    dims.motion = Math.max(0, 100 - d);
  }

  // responsive
  {
    let d = 0;
    if (a.responsive.horizontalOverflow) {
      d += take('responsive', 50, `document scrolls horizontally: ${a.responsive.scrollWidth}px content in ${a.responsive.clientWidth}px viewport`);
    }
    if (a.responsive.overflowing.length) {
      d += take('responsive', Math.min(30, a.responsive.overflowing.length * 6), `${a.responsive.overflowing.length} element(s) extend past the right edge`);
    }
    dims.responsive = Math.max(0, 100 - d);
  }

  // hierarchy
  {
    let d = 0;
    if (a.hierarchy.h1Count !== 1) d += take('hierarchy', 25, `${a.hierarchy.h1Count} h1 elements; exactly one is expected`);
    if (a.hierarchy.headingOrderBreaks) d += take('hierarchy', Math.min(30, a.hierarchy.headingOrderBreaks * 10), `${a.hierarchy.headingOrderBreaks} heading level skip(s)`);
    dims.hierarchy = a.hierarchy.headings.length ? Math.max(0, 100 - d) : null;
    if (!a.hierarchy.headings.length) notMeasured.push('hierarchy — no headings found');
  }

  // web vitals, measured or absent
  {
    let d = 0;
    let any = false;
    if (a.vitals.lcp !== null) { any = true; if (a.vitals.lcp > 2500) d += take('vitals', Math.min(40, (a.vitals.lcp - 2500) / 50), `LCP ${a.vitals.lcp} ms against a 2500 ms budget`); }
    else notMeasured.push('vitals:LCP — the init probe did not run before navigation');
    if (a.vitals.cls !== null) { any = true; if (a.vitals.cls > 0.1) d += take('vitals', Math.min(40, (a.vitals.cls - 0.1) * 200), `CLS ${a.vitals.cls} against a 0.1 budget`); }
    else notMeasured.push('vitals:CLS — the init probe did not run before navigation');
    if (a.vitals.inp !== null) { any = true; if (a.vitals.inp > 200) d += take('vitals', Math.min(30, (a.vitals.inp - 200) / 10), `INP ${a.vitals.inp} ms against a 200 ms budget`); }
    else notMeasured.push('vitals:INP — no interaction occurred, so INP is unmeasured (not zero)');
    dims.vitals = any ? Math.max(0, 100 - d) : null;
  }

  const measured = Object.values(dims).filter((v): v is number => v !== null);
  const overall = measured.length ? Math.round(measured.reduce((s, v) => s + v, 0) / measured.length) : null;

  return { url: a.url, overall, dimensions: dims, deductions, notMeasured };
}

/** Score as findings, for the gate and the report. */
export function scoreFindings(s: QualityScore): Finding[] {
  const out: Finding[] = [];
  if (s.overall === null) {
    return [finding('visual:score', 'skipped', `${s.url} — nothing measurable on this page`, { evidence: s.notMeasured })];
  }
  const status: Status = s.overall >= 85 ? 'ok' : s.overall >= 70 ? 'warn' : 'fail';
  const measuredCount = Object.values(s.dimensions).filter((v) => v !== null).length;
  out.push(
    finding('visual:score', status, `${s.url} — ${s.overall}/100 across ${measuredCount} measured dimension(s)`, {
      evidence: { dimensions: s.dimensions, notMeasured: s.notMeasured },
    }),
  );
  for (const d of [...s.deductions].sort((a, b) => b.points - a.points).slice(0, 10)) {
    out.push(finding(`visual:${d.dimension}`, d.points >= 25 ? 'fail' : 'warn', `-${Math.round(d.points)} · ${d.why}`, { where: s.url }));
  }
  if (s.notMeasured.length) {
    out.push(finding('visual:not-measured', 'skipped', `${s.notMeasured.length} dimension(s) not measured on ${s.url}`, { evidence: s.notMeasured }));
  }
  return out;
}

/** Reads audits the agent has saved, so the report can be built without a browser. */
export function readSavedAudits(dir: string): PageAudit[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      try {
        return JSON.parse(readFileSync(join(dir, f), 'utf8')) as PageAudit;
      } catch {
        return null;
      }
    })
    .filter((a): a is PageAudit => !!a && typeof a.url === 'string');
}
