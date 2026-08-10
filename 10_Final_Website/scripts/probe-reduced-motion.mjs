/**
 * Reduced-motion probe.
 *
 *   npm start
 *   node scripts/probe-reduced-motion.mjs ./out
 *
 * `VISUAL_DNA.md` § 5 makes reduced motion a kill switch, not a slow-mo, and
 * `MOTION_INVENTORY.md` § 7 records the trap: the global rule collapses
 * `animation-duration` but leaves `animation-delay`, so a staggered animation
 * can hold an element invisible. RC4 added three animations (two travelling
 * signals and a breathing hub glow) and one opacity-driven tab control, and the
 * failure mode that matters is *content stranded invisible* — which no axe rule
 * catches and no build error reports.
 *
 * This asserts the opposite of what the visual capture asserts: that with
 * motion off, everything meaningful is still on screen.
 */
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3000';
const browser = await chromium.launch();
const page = await browser.newPage({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });

const result = await page.evaluate(() => {
  const op = (el) => (el ? getComputedStyle(el).opacity : 'MISSING');
  const disp = (el, pseudo) =>
    el ? getComputedStyle(el, pseudo).display : 'MISSING';

  const branch = document.querySelector('.infra-branch');
  const hub = document.querySelector('.infra-hub');
  const panels = [...document.querySelectorAll('.craft-panel')];
  const urls = [...document.querySelectorAll('.craft-url')];
  const captions = [...document.querySelectorAll('.craft-caption')];
  const radios = [...document.querySelectorAll('.craft-radio')];

  return {
    // Signals must be gone, not teleporting.
    infraSignalDisplay: disp(branch, '::after'),
    sheenDisplay: disp(document.querySelector('.craft-sheen'), null),
    // The structural connectors must remain — they are not motion.
    infraStubDisplay: disp(branch, '::before'),
    hubGlowOpacity: op(hub) === 'MISSING' ? 'MISSING' : getComputedStyle(hub, '::before').opacity,
    hubGlowAnimation: hub ? getComputedStyle(hub, '::before').animationName : 'MISSING',
    // Exactly one panel/url/caption visible, and it must be the checked one.
    panelOpacities: panels.map(op),
    urlOpacities: urls.map(op),
    captionOpacities: captions.map(op),
    checkedIndex: radios.findIndex((r) => r.checked),
    // The radios must still be focusable.
    radioDisplays: radios.map((r) => getComputedStyle(r).display),
    branchCount: document.querySelectorAll('.infra-branch').length,

    // --- The Run (Visual OS) ---
    // The traced spine is scroll-driven, and the failure mode is a rail
    // stranded at zero height with five stages hanging off nothing. Its
    // resting state must be *fully traced*, not un-traced.
    spineScaleY: (() => {
      const el = document.querySelector('.vos-spine-beam');
      if (!el) return 'MISSING';
      const t = getComputedStyle(el).transform;
      if (!t || t === 'none') return 1;
      const m = t.match(/matrix\(([^)]+)\)/);
      return m ? Math.round(Number(m[1].split(',')[3]) * 1000) / 1000 : 'UNPARSED';
    })(),
    // `.reveal-view` must not hold a stage invisible when motion is off.
    stageOpacities: [...document.querySelectorAll('.run-stage')].map((el) =>
      getComputedStyle(el).opacity,
    ),
    stageCount: document.querySelectorAll('.run-stage').length,
    nodeCount: document.querySelectorAll('.run-node').length,
  };
});

const visible = (arr) => arr.filter((o) => Number(o) > 0.5).length;
const checks = [
  ['infra signal removed', result.infraSignalDisplay === 'none'],
  ['craft sheen removed', result.sheenDisplay === 'none'],
  ['infra stub still drawn', result.infraStubDisplay !== 'none'],
  ['hub glow not animating', result.hubGlowAnimation === 'none'],
  ['hub glow at rest opacity 0.72', result.hubGlowOpacity === '0.72'],
  ['six branches present', result.branchCount === 6],
  ['exactly one panel visible', visible(result.panelOpacities) === 1],
  ['exactly one url visible', visible(result.urlOpacities) === 1],
  ['exactly one caption visible', visible(result.captionOpacities) === 1],
  ['visible panel is the checked one', Number(result.panelOpacities[result.checkedIndex]) > 0.5],
  ['radios still in layout (focusable)', result.radioDisplays.every((d) => d !== 'none')],
  ['spine rests fully traced, not at zero', result.spineScaleY === 1],
  ['five stages present', result.stageCount === 5],
  ['five spine nodes present', result.nodeCount === 5],
  ['no stage held invisible', result.stageOpacities.every((o) => Number(o) > 0.99)],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}
console.log('\nraw:', JSON.stringify(result, null, 2));

await page.locator('#integrations').screenshot({ path: process.argv[2] + '/reduced-infra.png' });
await page.locator('#build').screenshot({ path: process.argv[2] + '/reduced-craft.png' });

await browser.close();
console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
