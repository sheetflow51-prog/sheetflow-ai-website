/**
 * SheetFlow brand asset generator.
 *
 * One source of geometry, every variant derived from it. Hand-maintaining nine
 * SVGs that each redeclare the same arcs guarantees drift the first time a
 * curve is nudged; this script makes that structurally impossible.
 *
 *   node scripts/build-brand-assets.mjs
 *
 * Emits SVG masters to public/brand/, raster exports to public/brand/raster/
 * and public/brand/social/, and the Next.js app-dir icons to src/app/.
 *
 * The mark is a flat production vector of the 3D brand render. It is not a new
 * mark: badge, blue+gold ribbons, sphere, core and sparkles are all carried
 * over. See brand-os/09_logo-system/LOGO_SYSTEM.md.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BRAND = join(ROOT, 'public', 'brand');
const RASTER = join(BRAND, 'raster');
const SOCIAL = join(BRAND, 'social');
const APP = join(ROOT, 'src', 'app');

/* ------------------------------------------------------------------ */
/* Palette — mirrors brand-os/01_design-tokens                          */
/* ------------------------------------------------------------------ */

const C = {
  badgeTop: '#16294D',
  badgeEdge: '#070B14',
  ballTop: '#31589F',
  ballEdge: '#0A1329',
  goldLight: '#F6D089',
  gold: '#E9A23B',
  goldDeep: '#C4832A',
  blueLight: '#93C5FD',
  blue: '#3B82F6',
  blueDeep: '#2563EB',
  white: '#FFFFFF',
  ink: '#070B14',
};

/**
 * Ribbon paths, in the canonical 256x256 frame with the sphere centred at
 * (128,128) r=86.
 *
 * Each ribbon is a lune: inside the sphere circle but outside a second circle
 * of radius 76 whose centre is offset by (-24,+12) for gold and (+24,-12) for
 * blue. The offset is what makes a ribbon taper to a point at one end; a
 * concentric inner circle would hold constant width and read as a pie chart
 * rather than as flow. Opposing offsets make the two ribbons interlock.
 *
 * Endpoints are the circle-circle intersections, solved once and inlined.
 */
const RIBBON_GOLD =
  'M55.86 81.20 A86 86 0 1 1 122.16 213.80 A76 76 0 1 0 55.86 81.20 Z';
const RIBBON_BLUE =
  'M200.14 174.80 A86 86 0 1 1 133.84 42.20 A76 76 0 1 0 200.14 174.80 Z';
const RIM_LIGHT =
  'M148.31 211.58 A86 86 0 1 1 194.39 73.32 A80 80 0 1 0 148.31 211.58 Z';

const SPARKLES = [
  { x: 54, y: 70, r: 2.6, c: C.white, o: 0.85 },
  { x: 198, y: 186, r: 2.8, c: C.white, o: 0.6 },
  { x: 168, y: 32, r: 1.7, c: C.white, o: 0.55 },
  { x: 30, y: 140, r: 1.6, c: C.white, o: 0.4 },
  { x: 204, y: 78, r: 2.2, c: C.goldLight, o: 0.8 },
  { x: 88, y: 38, r: 1.5, c: C.goldLight, o: 0.5 },
  { x: 58, y: 182, r: 2.0, c: C.blueLight, o: 0.7 },
  { x: 226, y: 132, r: 1.5, c: C.blueLight, o: 0.45 },
];

/* ------------------------------------------------------------------ */
/* Fragments                                                            */
/* ------------------------------------------------------------------ */

const defs = ({ flat = false } = {}) =>
  flat
    ? ''
    : `
    <radialGradient id="sfBadge" cx="50%" cy="38%" r="75%">
      <stop offset="0%" stop-color="${C.badgeTop}"/>
      <stop offset="100%" stop-color="${C.badgeEdge}"/>
    </radialGradient>
    <radialGradient id="sfHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${C.blue}" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="${C.blue}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="sfBall" cx="34%" cy="28%" r="84%">
      <stop offset="0%" stop-color="${C.ballTop}"/>
      <stop offset="100%" stop-color="${C.ballEdge}"/>
    </radialGradient>
    <linearGradient id="sfGold" x1="196" y1="52" x2="118" y2="206" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${C.goldLight}"/>
      <stop offset="52%" stop-color="${C.gold}"/>
      <stop offset="100%" stop-color="${C.goldDeep}"/>
    </linearGradient>
    <linearGradient id="sfBlue" x1="60" y1="196" x2="150" y2="46" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${C.blueDeep}"/>
      <stop offset="48%" stop-color="${C.blue}"/>
      <stop offset="100%" stop-color="${C.blueLight}"/>
    </linearGradient>
    <radialGradient id="sfCore" cx="40%" cy="36%" r="72%">
      <stop offset="0%" stop-color="#F2F7FF"/>
      <stop offset="60%" stop-color="#9CC4FA"/>
      <stop offset="100%" stop-color="${C.blue}"/>
    </radialGradient>`;

const clip = `<clipPath id="sfSphere"><circle cx="128" cy="128" r="86"/></clipPath>`;

/**
 * The sphere, in canonical coordinates.
 * @param simple drops the rim light and shrinks detail, for <=32px rendering.
 * @param flat   solid fills instead of gradients.
 * @param mono   single colour; ribbons filled, core knocked out.
 */
function sphere({ simple = false, flat = false, mono = null } = {}) {
  if (mono) {
    return `
  <g clip-path="url(#sfSphere)">
    <path d="${RIBBON_BLUE}" fill="${mono}" opacity="0.55"/>
    <path d="${RIBBON_GOLD}" fill="${mono}"/>
  </g>
  <circle cx="124" cy="124" r="26" fill="${mono}"/>`;
  }

  const ball = flat ? C.ballEdge : 'url(#sfBall)';
  const gold = flat ? C.gold : 'url(#sfGold)';
  const blue = flat ? C.blue : 'url(#sfBlue)';
  const core = flat ? C.blueLight : 'url(#sfCore)';

  return `
  <g clip-path="url(#sfSphere)">
    <circle cx="128" cy="128" r="86" fill="${ball}"/>
    <path d="${RIBBON_BLUE}" fill="${blue}"/>
    <path d="${RIBBON_GOLD}" fill="${gold}"/>${
      simple || flat
        ? ''
        : `
    <path d="${RIM_LIGHT}" fill="${C.white}" opacity="0.30"/>`
    }
    <circle cx="124" cy="124" r="${simple ? 30 : 26}" fill="${core}"/>
  </g>`;
}

const badge = ({ flat = false } = {}) => `
  <circle cx="128" cy="128" r="128" fill="${flat ? C.badgeEdge : 'url(#sfBadge)'}"/>${
    flat
      ? ''
      : `
  <circle cx="128" cy="124" r="112" fill="url(#sfHalo)"/>`
  }`;

const sparkles = () =>
  `\n  <g>${SPARKLES.map(
    (s) =>
      `<circle cx="${s.x}" cy="${s.y}" r="${s.r}" fill="${s.c}" opacity="${s.o}"/>`,
  ).join('')}</g>`;

/**
 * Placement helpers.
 *
 * Both map the canonical 256x256 frame onto a target centre, but they differ
 * in what `r` measures, because the two nested circles have different
 * canonical radii: the sphere is r=86 and the badge is r=128. Using the sphere
 * helper to place a badge scales it by 128/86 and overflows the canvas.
 */
const placeSphere = (cx, cy, rSphere) =>
  `translate(${cx} ${cy}) scale(${(rSphere / 86).toFixed(5)}) translate(-128 -128)`;

const placeBadge = (cx, cy, rBadge) =>
  `translate(${cx} ${cy}) scale(${(rBadge / 128).toFixed(5)}) translate(-128 -128)`;

/**
 * Wordmark as live text.
 *
 * Deliberately not outlined: outlining requires a font-to-path toolchain this
 * repo does not have, and a wrong-by-eye trace is worse than live text. Every
 * raster export below is icon-only, so no shipped bitmap depends on the host
 * having Inter. Consumers who need outlined text should open the SVG in a
 * vector editor and convert; the guide says so.
 */
const wordmark = ({ x, y, size, fill = C.white, anchor = 'middle' }) =>
  `\n  <text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}"
    font-family="Inter, 'Inter var', 'Helvetica Neue', Arial, sans-serif"
    font-size="${size}" font-weight="700" letter-spacing="${(-0.02 * size).toFixed(2)}"
  >SheetFlow</text>`;

const doc = (w, h, body, label = 'SheetFlow') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}">
  <title>${label}</title>
  <defs>${defs()}${clip}</defs>${body}
</svg>
`;

/* ------------------------------------------------------------------ */
/* Variants                                                             */
/* ------------------------------------------------------------------ */

const variants = {};

// 1. Icon — badge + sphere + sparkles.
variants['sheetflow-icon.svg'] = doc(
  256,
  256,
  `${badge()}${sphere()}${sparkles()}`,
);

// 2. Icon, small-size optimised — no sparkles, no rim light, larger core.
variants['sheetflow-icon-small.svg'] = doc(
  256,
  256,
  `${badge()}${sphere({ simple: true })}`,
);

// 3. Flat — solid fills, no gradients. For print, embroidery, single-pass output.
variants['sheetflow-icon-flat.svg'] =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-label="SheetFlow">
  <title>SheetFlow</title>
  <defs>${clip}</defs>${badge({ flat: true })}${sphere({ flat: true })}
</svg>
`;

// 4. Primary — the vertical lockup, matching the original render's composition.
variants['sheetflow-primary.svg'] = doc(
  256,
  256,
  `${badge()}
  <g transform="${placeSphere(128, 100, 60)}">${sphere()}</g>${wordmark({
    x: 128,
    y: 198,
    size: 33,
  })}`,
  'SheetFlow',
);

// 5. Horizontal lockup — icon left, wordmark right.
// Badge r=32 centred at (36,40): spans x 4..68, clear of the canvas edge.
variants['sheetflow-horizontal.svg'] = doc(
  320,
  80,
  `
  <g transform="${placeBadge(36, 40, 32)}">${badge()}${sphere()}${sparkles()}</g>${wordmark({
    x: 82,
    y: 52,
    size: 32,
    anchor: 'start',
  })}`,
);

// 6/7. Monochrome lockups.
for (const [name, fill] of [
  ['sheetflow-mono-white.svg', C.white],
  ['sheetflow-mono-black.svg', C.ink],
]) {
  variants[name] =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="320" height="80" role="img" aria-label="SheetFlow">
  <title>SheetFlow</title>
  <defs>${clip}</defs>
  <g transform="${placeBadge(36, 40, 32)}">
    <circle cx="128" cy="128" r="124" fill="none" stroke="${fill}" stroke-width="8"/>${sphere(
      { mono: fill },
    )}
  </g>${wordmark({ x: 82, y: 52, size: 32, fill, anchor: 'start' })}
</svg>
`;
}

// 8/9. Monochrome icons.
for (const [name, fill] of [
  ['sheetflow-icon-mono-white.svg', C.white],
  ['sheetflow-icon-mono-black.svg', C.ink],
]) {
  variants[name] =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-label="SheetFlow">
  <title>SheetFlow</title>
  <defs>${clip}</defs>
  <circle cx="128" cy="128" r="124" fill="none" stroke="${fill}" stroke-width="8"/>${sphere(
    { mono: fill },
  )}
</svg>
`;
}

/* ------------------------------------------------------------------ */
/* Emit                                                                 */
/* ------------------------------------------------------------------ */

for (const dir of [BRAND, RASTER, SOCIAL]) mkdirSync(dir, { recursive: true });

for (const [name, svg] of Object.entries(variants)) {
  writeFileSync(join(BRAND, name), svg, 'utf8');
  console.log('svg  ', name);
}

const render = (src, size, dest, density = 1200) =>
  sharp(join(BRAND, src), { density }).resize(size, size).png({ compressionLevel: 9 }).toFile(dest);

/** Maskable icons need their content inside the central 80% safe zone. */
async function maskable(size, dest) {
  const inner = Math.round(size * 0.8);
  const pad = Math.round((size - inner) / 2);
  const mark = await sharp(join(BRAND, 'sheetflow-icon.svg'), { density: 1200 })
    .resize(inner, inner)
    .png()
    .toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: C.badgeEdge,
    },
  })
    .composite([{ input: mark, top: pad, left: pad }])
    .png({ compressionLevel: 9 })
    .toFile(dest);
}

const jobs = [
  // Favicon package. <=32px uses the simplified master.
  ['sheetflow-icon-small.svg', 16, join(RASTER, 'favicon-16.png')],
  ['sheetflow-icon-small.svg', 32, join(RASTER, 'favicon-32.png')],
  ['sheetflow-icon-small.svg', 48, join(RASTER, 'favicon-48.png')],
  ['sheetflow-icon.svg', 180, join(APP, 'apple-icon.png')],
  ['sheetflow-icon.svg', 192, join(RASTER, 'icon-192.png')],
  ['sheetflow-icon.svg', 512, join(RASTER, 'icon-512.png')],
  // Social avatars.
  ['sheetflow-icon.svg', 400, join(SOCIAL, 'avatar-400.png')],
  ['sheetflow-icon.svg', 800, join(SOCIAL, 'avatar-800.png')],
  ['sheetflow-icon.svg', 1024, join(SOCIAL, 'avatar-1024.png')],
];

for (const [src, size, dest] of jobs) {
  await render(src, size, dest);
  console.log('png  ', dest.replace(ROOT, '').replace(/\\/g, '/'), `${size}x${size}`);
}

await maskable(512, join(RASTER, 'icon-maskable-512.png'));
console.log('png   /public/brand/raster/icon-maskable-512.png 512x512 (maskable)');

// The app-dir favicon: the real mark, replacing the unrelated arc device.
writeFileSync(join(APP, 'icon.svg'), variants['sheetflow-icon-small.svg'], 'utf8');
console.log('svg   src/app/icon.svg');

/*
 * The OG/Twitter images run on the edge runtime, which has no filesystem, so
 * they cannot read the SVG masters at request time. Emitting the mark as a
 * data URI keeps them on the same geometry as every other variant instead of
 * carrying a hand-copied duplicate that would drift.
 */
const dataUri = `data:image/svg+xml;base64,${Buffer.from(
  variants['sheetflow-icon.svg'],
).toString('base64')}`;

writeFileSync(
  join(ROOT, 'src', 'lib', 'brand-mark.ts'),
  `/**
 * GENERATED by scripts/build-brand-assets.mjs — do not edit.
 *
 * The brand icon as a self-contained data URI, for renderers that cannot read
 * from disk (the edge-runtime OG image routes).
 */

export const BRAND_MARK_DATA_URI =
  '${dataUri}';
`,
  'utf8',
);
console.log('ts    src/lib/brand-mark.ts');

console.log('\nBrand assets rebuilt.');
