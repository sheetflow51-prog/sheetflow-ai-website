/**
 * SheetFlow brand asset generator.
 *
 *   node scripts/build-brand-assets.mjs      (or: npm run brand)
 *
 * ---------------------------------------------------------------------------
 * Brand Decision DEC-301
 * ---------------------------------------------------------------------------
 * `public/logo.png` is the canonical brand identity. Everything here is its
 * engineering implementation, never a redesign. Where a judgement call arises,
 * the PNG wins.
 *
 * That decision sets the architecture of this script:
 *
 *   1. EVERY RASTER EXPORT IS CUT FROM THE ORIGINAL PNG. Favicons, PWA icons,
 *      apple-icon and social avatars are crops and resamples of the canonical
 *      artwork, so they carry the real ribbon flow, the real sphere and the
 *      real emotional feel — not an approximation of them.
 *
 *   2. VECTOR IS USED ONLY WHERE SCALABILITY IS REQUIRED — print, embroidery,
 *      monochrome reproduction, large-format. The SVG masters are a faithful
 *      but inexact reconstruction: a flat vector cannot reproduce a 3D render's
 *      ribbon interleaving. They must not be substituted for the raster on the
 *      website, where a resample of the original is always available.
 *
 * An earlier revision had this backwards — it rebuilt the mark as vector and
 * used that everywhere, which drifted the silhouette, oversized the sphere by
 * 31%, and invented a glowing core the original does not have.
 *
 * Emits raster to public/brand/raster/ and public/brand/social/, SVG masters to
 * public/brand/, and the Next.js app-dir icons to src/app/.
 * See brand-os/09_logo-system/LOGO_SYSTEM.md.
 */

import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BRAND = join(ROOT, 'public', 'brand');
const RASTER = join(BRAND, 'raster');
const SOCIAL = join(BRAND, 'social');
const APP = join(ROOT, 'src', 'app');
const SOURCE = join(ROOT, 'public', 'logo.png');

/* ------------------------------------------------------------------ */
/* Measurement — read from the PNG on every run                         */
/* ------------------------------------------------------------------ */

/**
 * DEC-302 clause 5: replacing `public/logo.png` must be enough on its own, with
 * the generator regenerating every derivative automatically.
 *
 * That rules out hard-coded pixel constants. An earlier revision inlined the
 * bounds of this specific render, which meant a new master with different
 * dimensions or composition would have been cropped against stale numbers —
 * silently producing wrong assets, or crashing on an out-of-bounds extract.
 *
 * So the geometry is recovered from whatever PNG is present, each run, by
 * classifying its pixels:
 *
 *   background  the modal corner colour, or transparency
 *   badge       everything that is not background
 *   sphere      saturated pixels (the coloured ribbons)
 *   wordmark    the first row below the sphere carrying a run of near-white,
 *               low-saturation pixels — enough of them to be type rather than
 *               a sparkle
 *
 * Every result is sanity-checked below. On a master this classifier cannot
 * read, the build fails loudly rather than emitting a broken asset set.
 */
async function measure() {
  const { data, info } = await sharp(SOURCE)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: CH } = info;
  const at = (x, y) => {
    const i = (y * W + x) * CH;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  };

  // Background: assume the corners are it. Transparent counts too.
  const [br, bg_, bb] = at(0, 0);
  const isBackground = (r, g, b, a) =>
    a < 24 ||
    (Math.abs(r - br) < 14 && Math.abs(g - bg_) < 14 && Math.abs(b - bb) < 14);

  const box = () => ({ x0: Infinity, y0: Infinity, x1: -1, y1: -1, n: 0 });
  const grow = (t, x, y) => {
    if (x < t.x0) t.x0 = x;
    if (x > t.x1) t.x1 = x;
    if (y < t.y0) t.y0 = y;
    if (y > t.y1) t.y1 = y;
    t.n++;
  };

  const badge = box();
  const sphere = box();
  const brightRows = new Array(H).fill(0);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const [r, g, b, a] = at(x, y);
      if (isBackground(r, g, b, a)) continue;
      grow(badge, x, y);

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if (max - min > 45 && max > 90) grow(sphere, x, y);
      if (r > 195 && g > 195 && b > 195 && max - min < 30) brightRows[y]++;
    }
  }

  const badgeW = badge.x1 - badge.x0 + 1;
  const badgeH = badge.y1 - badge.y0 + 1;
  const sphereCx = (sphere.x0 + sphere.x1) / 2;
  const sphereCy = (sphere.y0 + sphere.y1) / 2;
  const sphereD = (sphere.x1 - sphere.x0 + 1 + (sphere.y1 - sphere.y0 + 1)) / 2;

  /*
   * Wordmark: first row below the sphere with enough near-white pixels to be
   * type. The threshold is a fraction of badge width so it scales with the
   * master, and it is high enough that the sparkle field cannot trip it.
   */
  const minRun = Math.max(6, Math.round(badgeW * 0.05));
  let wordmarkTop = null;
  for (let y = Math.ceil(sphereCy); y < badge.y1; y++) {
    if (brightRows[y] >= minRun) {
      wordmarkTop = y;
      break;
    }
  }

  const fail = (msg) => {
    throw new Error(
      `Cannot read ${SOURCE}: ${msg}\n` +
        `Measured badge ${badgeW}x${badgeH} at (${badge.x0},${badge.y0}), ` +
        `sphere d=${sphereD.toFixed(1)} at (${sphereCx.toFixed(1)},${sphereCy.toFixed(1)}).\n` +
        `DEC-302 expects a circular badge carrying a saturated mark. If the ` +
        `master's composition changed, the classifier in measure() must be ` +
        `updated to match it — do not hand-write the numbers back in.`,
    );
  };

  if (badge.n === 0 || sphere.n === 0) fail('found no artwork');
  if (Math.abs(badgeW - badgeH) > badgeW * 0.08) fail('badge is not square');
  if (badgeW < W * 0.5) fail('badge occupies less than half the canvas');
  if (sphereD < badgeW * 0.15 || sphereD > badgeW * 0.95) {
    fail('sphere is an implausible fraction of the badge');
  }

  return {
    canvas: { W, H },
    badge: {
      left: badge.x0,
      top: badge.y0,
      size: Math.min(badgeW, badgeH),
      cx: (badge.x0 + badge.x1) / 2,
      cy: (badge.y0 + badge.y1) / 2,
    },
    sphere: { cx: sphereCx, cy: sphereCy, d: sphereD, bottom: sphere.y1 },
    wordmarkTop,
  };
}

const M = await measure();

/** sphere diameter over badge diameter */
const SPHERE_RATIO = M.sphere.d / M.badge.size;

/**
 * The icon crop stops just above the wordmark, so the sphere is taken as large
 * as it can be without pulling in a sliver of type. Where the master carries no
 * wordmark, the sphere's own extent is the limit. Clamped to the canvas so the
 * extract can never run out of bounds.
 */
const ICON_R = Math.floor(
  Math.min(
    M.wordmarkTop === null ? M.sphere.d / 2 + 4 : M.wordmarkTop - 1 - M.sphere.cy,
    M.sphere.cy,
    M.sphere.cx,
    M.canvas.W - M.sphere.cx,
    M.canvas.H - M.sphere.cy,
  ),
);

if (ICON_R < 8) {
  throw new Error(
    `Icon crop radius resolved to ${ICON_R}px, which is unusable. The sphere ` +
      `sits too close to the wordmark or to the canvas edge in ${SOURCE}.`,
  );
}

/* ------------------------------------------------------------------ */
/* Raster — cut from the original                                       */
/* ------------------------------------------------------------------ */

const circleMask = (size) =>
  Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
  );

/** Crops a circular region of the original and returns it as a PNG buffer. */
async function cut({ cx, cy, r }) {
  const size = r * 2;
  const left = Math.round(cx - r);
  const top = Math.round(cy - r);
  return sharp(SOURCE)
    .extract({ left, top, width: size, height: size })
    .composite([{ input: circleMask(size), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

/** Full lockup: badge, sphere and wordmark — the complete canonical mark. */
const lockupSource = () =>
  cut({
    cx: M.badge.cx,
    cy: M.badge.cy,
    r: M.badge.size / 2,
  });

/**
 * Icon: the sphere alone, for sizes where the wordmark cannot render legibly.
 * Below roughly 64px the lockup's type turns to mush, which is a worse
 * violation of "never simplify beyond recognizability" than dropping it.
 */
const iconSource = () => cut({ cx: M.sphere.cx, cy: M.sphere.cy, r: ICON_R });

const resample = (buf, size, dest) =>
  sharp(buf)
    .resize(size, size, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toFile(dest);

/** Maskable icons must keep their content inside the central 80% safe zone. */
async function maskable(buf, size, dest) {
  const inner = Math.round(size * 0.8);
  const pad = Math.round((size - inner) / 2);
  const mark = await sharp(buf).resize(inner, inner, { kernel: 'lanczos3' }).png().toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: '#070B14' },
  })
    .composite([{ input: mark, top: pad, left: pad }])
    .png({ compressionLevel: 9 })
    .toFile(dest);
}

/* ------------------------------------------------------------------ */
/* Vector masters — scalability-only                                    */
/* ------------------------------------------------------------------ */

const C = {
  badgeTop: '#16294D',
  badgeEdge: '#070B14',
  ballTop: '#152A4F',
  ballEdge: '#080F20',
  white: '#FFFFFF',
  ink: '#070B14',
};

const F = 256;
const BADGE_C = F / 2;
const BADGE_R = F / 2;
const SPHERE_R = +((SPHERE_RATIO * F) / 2).toFixed(2);
const SPHERE_CX = +(BADGE_C + ((M.sphere.cx - M.badge.cx) / M.badge.size) * F).toFixed(2);
const SPHERE_CY = +(BADGE_C + ((M.sphere.cy - M.badge.cy) / M.badge.size) * F).toFixed(2);

/**
 * The original's sphere is a ribbon wound around a ball on a tilted axis.
 * Under orthographic projection a circle of radius r in a plane with unit
 * normal a, centred at R*cos(B)*a, becomes an ellipse with semi-major r and
 * semi-minor r*|az|, the major axis perpendicular to a's projection.
 */
const AXIS = { x: -0.731, y: -0.512, z: 0.45 };
const RING_ROT = +((Math.atan2(-AXIS.x, AXIS.y) * 180) / Math.PI).toFixed(2);
const TURNS = [34, 62, 90, 118, 146];

/**
 * A full ellipse as a path, tilt baked into the arc's x-axis-rotation.
 * Not `<ellipse transform="rotate()">`: an element transform rotates the paint
 * too, which tipped the blue-to-gold gradient off its horizontal axis.
 */
function ellipsePath(cx, cy, rx, ry, rot) {
  const t = (rot * Math.PI) / 180;
  const dx = rx * Math.cos(t);
  const dy = rx * Math.sin(t);
  const f = (n) => n.toFixed(2);
  return (
    `M${f(cx - dx)} ${f(cy - dy)} A${f(rx)} ${f(ry)} ${rot} 0 1 ${f(cx + dx)} ${f(cy + dy)}` +
    ` A${f(rx)} ${f(ry)} ${rot} 0 1 ${f(cx - dx)} ${f(cy - dy)} Z`
  );
}

const rings = (R, cx, cy) =>
  TURNS.map((deg) => {
    const b = (deg * Math.PI) / 180;
    const r = R * Math.sin(b);
    const d = R * Math.cos(b);
    return { cx: cx + d * AXIS.x, cy: cy + d * AXIS.y, rx: r, ry: r * AXIS.z, depth: d };
  }).sort((p, q) => p.depth - q.depth); // painter's algorithm

const gradients = () => {
  const x0 = SPHERE_CX - SPHERE_R;
  const x1 = SPHERE_CX + SPHERE_R;
  return `
    <radialGradient id="sfBadge" cx="50%" cy="38%" r="75%">
      <stop offset="0%" stop-color="${C.badgeTop}"/><stop offset="100%" stop-color="${C.badgeEdge}"/>
    </radialGradient>
    <radialGradient id="sfHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#3B82F6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="sfBall" cx="34%" cy="26%" r="86%">
      <stop offset="0%" stop-color="${C.ballTop}"/><stop offset="100%" stop-color="${C.ballEdge}"/>
    </radialGradient>
    <linearGradient id="sfRibbon" x1="${x0}" y1="0" x2="${x1}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1E40AF"/><stop offset="16%" stop-color="#2563EB"/>
      <stop offset="32%" stop-color="#3B82F6"/><stop offset="45%" stop-color="#60A5FA"/>
      <stop offset="55%" stop-color="#F6D089"/><stop offset="72%" stop-color="#E9A23B"/>
      <stop offset="100%" stop-color="#C4832A"/>
    </linearGradient>
    <linearGradient id="sfEdge" x1="${x0}" y1="0" x2="${x1}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#93C5FD"/><stop offset="40%" stop-color="#DBEAFE"/>
      <stop offset="60%" stop-color="#FFF6DF"/><stop offset="100%" stop-color="#F6D089"/>
    </linearGradient>`;
};

const clip = `<clipPath id="sfSphere"><circle cx="${SPHERE_CX}" cy="${SPHERE_CY}" r="${SPHERE_R}"/></clipPath>`;

function sphere({ mono = null } = {}) {
  const turns = rings(SPHERE_R, SPHERE_CX, SPHERE_CY);
  const w = SPHERE_R * 0.28;
  const stroke = mono || 'url(#sfRibbon)';
  const body = mono
    ? ''
    : `<circle cx="${SPHERE_CX}" cy="${SPHERE_CY}" r="${SPHERE_R}" fill="url(#sfBall)"/>`;
  const coil = turns
    .map(
      (r) =>
        `\n    <path d="${ellipsePath(r.cx, r.cy, r.rx, r.ry, RING_ROT)}" fill="none" stroke="${stroke}" stroke-width="${w.toFixed(2)}"/>`,
    )
    .join('');
  const spec = mono
    ? ''
    : turns
        .map(
          (r) =>
            `\n    <path d="${ellipsePath(r.cx - 1.6, r.cy - 2.4, r.rx, r.ry, RING_ROT)}" fill="none" stroke="url(#sfEdge)" stroke-width="${(w * 0.26).toFixed(2)}" opacity="0.8"/>`,
        )
        .join('');
  return `\n  <g clip-path="url(#sfSphere)">${body}${coil}${spec}\n  </g>`;
}

const SPARKS = [
  [54, 62, 2.6, C.white, 0.85], [196, 168, 2.4, C.white, 0.55],
  [172, 34, 1.7, C.white, 0.5], [34, 122, 1.6, C.white, 0.4],
  [206, 74, 2.1, '#F6D089', 0.75], [92, 30, 1.5, '#F6D089', 0.5],
  [62, 172, 2.0, '#93C5FD', 0.65], [222, 124, 1.5, '#93C5FD', 0.45],
];
const sparkles = () =>
  `\n  <g>${SPARKS.map(([x, y, r, c, o]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${o}"/>`).join('')}</g>`;

const badge = () => `
  <circle cx="${BADGE_C}" cy="${BADGE_C}" r="${BADGE_R}" fill="url(#sfBadge)"/>
  <circle cx="${SPHERE_CX}" cy="${SPHERE_CY}" r="${(SPHERE_R * 1.55).toFixed(1)}" fill="url(#sfHalo)"/>`;

const centreSphere = `translate(${(BADGE_C - SPHERE_CX).toFixed(2)} ${(BADGE_C - SPHERE_CY).toFixed(2)})`;
const placeBadge = (cx, cy, r) =>
  `translate(${cx} ${cy}) scale(${(r / BADGE_R).toFixed(5)}) translate(${-BADGE_C} ${-BADGE_C})`;

/**
 * Wordmark as live text, deliberately not outlined: there is no font-to-path
 * toolchain here, and an eyeballed trace would drift from the original
 * lettering, which DEC-301 forbids. No shipped raster depends on it — every
 * bitmap is cut from the PNG.
 */
const wordmark = ({ x, y, size, fill = C.white, anchor = 'middle' }) =>
  `\n  <text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}"
    font-family="Inter, 'Inter var', 'Helvetica Neue', Arial, sans-serif"
    font-size="${size}" font-weight="700" letter-spacing="${(-0.02 * size).toFixed(2)}"
  >SheetFlow</text>`;

const doc = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="SheetFlow">
  <title>SheetFlow</title>
  <defs>${gradients()}${clip}</defs>${body}
</svg>
`;

const variants = {};

variants['sheetflow-primary.svg'] = doc(
  F, F,
  `${badge()}${sphere()}${sparkles()}${wordmark({ x: BADGE_C, y: 196, size: 33 })}`,
);

const iconBody = `
  <circle cx="${BADGE_C}" cy="${BADGE_C}" r="${BADGE_R}" fill="url(#sfBadge)"/>
  <g transform="${centreSphere}">
    <circle cx="${SPHERE_CX}" cy="${SPHERE_CY}" r="${(SPHERE_R * 1.55).toFixed(1)}" fill="url(#sfHalo)"/>${sphere()}
  </g>${sparkles()}`;

variants['sheetflow-icon.svg'] = doc(F, F, iconBody);

variants['sheetflow-icon-flat.svg'] =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${F} ${F}" width="${F}" height="${F}" role="img" aria-label="SheetFlow">
  <title>SheetFlow</title>
  <defs>${gradients()}${clip}</defs>
  <circle cx="${BADGE_C}" cy="${BADGE_C}" r="${BADGE_R}" fill="${C.badgeEdge}"/>
  <g transform="${centreSphere}">${sphere()}</g>
</svg>
`;

variants['sheetflow-horizontal.svg'] = doc(
  320, 80,
  `\n  <g transform="${placeBadge(36, 40, 32)}">${iconBody}</g>${wordmark({ x: 82, y: 52, size: 32, anchor: 'start' })}`,
);

for (const [name, fill] of [
  ['sheetflow-mono-white.svg', C.white],
  ['sheetflow-mono-black.svg', C.ink],
]) {
  variants[name] =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="320" height="80" role="img" aria-label="SheetFlow">
  <title>SheetFlow</title>
  <defs>${clip}</defs>
  <g transform="${placeBadge(36, 40, 32)}">
    <circle cx="${BADGE_C}" cy="${BADGE_C}" r="${BADGE_R - 4}" fill="none" stroke="${fill}" stroke-width="8"/>
    <g transform="${centreSphere}">${sphere({ mono: fill })}</g>
  </g>${wordmark({ x: 82, y: 52, size: 32, fill, anchor: 'start' })}
</svg>
`;
}

for (const [name, fill] of [
  ['sheetflow-icon-mono-white.svg', C.white],
  ['sheetflow-icon-mono-black.svg', C.ink],
]) {
  variants[name] =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${F} ${F}" width="${F}" height="${F}" role="img" aria-label="SheetFlow">
  <title>SheetFlow</title>
  <defs>${clip}</defs>
  <circle cx="${BADGE_C}" cy="${BADGE_C}" r="${BADGE_R - 4}" fill="none" stroke="${fill}" stroke-width="8"/>
  <g transform="${centreSphere}">${sphere({ mono: fill })}</g>
</svg>
`;
}

/* ------------------------------------------------------------------ */
/* Emit                                                                 */
/* ------------------------------------------------------------------ */

for (const dir of [BRAND, RASTER, SOCIAL]) mkdirSync(dir, { recursive: true });

const lockup = await lockupSource();
const icon = await iconSource();

const rasterJobs = [
  // Lockup — every size where the wordmark still reads.
  [lockup, 1024, join(SOCIAL, 'avatar-1024.png')],
  [lockup, 800, join(SOCIAL, 'avatar-800.png')],
  [lockup, 400, join(SOCIAL, 'avatar-400.png')],
  [lockup, 512, join(RASTER, 'lockup-512.png')],
  [lockup, 256, join(RASTER, 'lockup-256.png')],
  [lockup, 192, join(RASTER, 'icon-192.png')],
  [lockup, 180, join(APP, 'apple-icon.png')],
  // Icon — sizes where it would not.
  [icon, 96, join(RASTER, 'icon-96.png')],
  [icon, 64, join(RASTER, 'icon-64.png')],
  [icon, 48, join(RASTER, 'favicon-48.png')],
  [icon, 32, join(APP, 'icon.png')],
  [icon, 32, join(RASTER, 'favicon-32.png')],
  [icon, 16, join(RASTER, 'favicon-16.png')],
];

for (const [buf, size, dest] of rasterJobs) {
  await resample(buf, size, dest);
  console.log('png  ', dest.replace(ROOT, '').replace(/\\/g, '/'), `${size}x${size}`);
}

await maskable(lockup, 512, join(RASTER, 'icon-maskable-512.png'));
console.log('png   /public/brand/raster/icon-maskable-512.png 512x512 (maskable)');

for (const [name, svg] of Object.entries(variants)) {
  writeFileSync(join(BRAND, name), svg, 'utf8');
  console.log('svg  ', name);
}

/*
 * The previous revision shipped a vector favicon. Browsers prefer an SVG icon
 * when one is offered, which would have put the least faithful asset in the
 * most visible slot. Removed so the PNG cut from the original is used.
 */
rmSync(join(APP, 'icon.svg'), { force: true });

/*
 * The OG routes run on the edge runtime, which has no filesystem. Inlining the
 * icon as a data URI keeps them on the canonical artwork rather than the vector
 * approximation.
 */
const ogMark = await sharp(icon).resize(96, 96, { kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toBuffer();
writeFileSync(
  join(ROOT, 'src', 'lib', 'brand-mark.ts'),
  `/**
 * GENERATED by scripts/build-brand-assets.mjs — do not edit.
 *
 * The brand icon, cut from public/logo.png, as a self-contained data URI for
 * renderers that cannot read from disk (the edge-runtime OG image routes).
 */

export const BRAND_MARK_DATA_URI =
  'data:image/png;base64,${ogMark.toString('base64')}';
`,
  'utf8',
);
console.log('ts    src/lib/brand-mark.ts', `(${(ogMark.length / 1024).toFixed(1)} kB source)`);

console.log(
  `\nMeasured from ${SOURCE.replace(ROOT, '').replace(/\\/g, '/')} this run:\n` +
    `  canvas       ${M.canvas.W}x${M.canvas.H}\n` +
    `  badge        d=${M.badge.size} at (${M.badge.cx.toFixed(1)}, ${M.badge.cy.toFixed(1)})\n` +
    `  sphere       d=${M.sphere.d.toFixed(1)} at (${M.sphere.cx.toFixed(1)}, ${M.sphere.cy.toFixed(1)})\n` +
    `  wordmark top ${M.wordmarkTop === null ? 'none detected' : `y=${M.wordmarkTop}`}\n` +
    `  sphere:badge ${SPHERE_RATIO.toFixed(4)}   icon crop r=${ICON_R}\n` +
    `\n  DEC-302: raster cut from the canonical PNG; vector is scalability-only.\n`,
);
