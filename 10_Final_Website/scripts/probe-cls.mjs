/**
 * Layout-shift attribution probe.
 *
 *   node scripts/probe-cls.mjs
 *
 * Lighthouse reported CLS 0.103 but attributed it to no element, which happens
 * when the shift sources are removed from the DOM before the audit collects
 * them — exactly what an unmounting loading screen does. A live
 * PerformanceObserver captures each shift's sources at the moment it happens.
 *
 * Diagnostic only; not part of the gate.
 */

import { chromium } from '@playwright/test';

const URL = process.env.AUDIT_URL ?? 'http://localhost:3000';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1350, height: 940 } });

await page.addInitScript(() => {
  // @ts-ignore
  window.__shifts = [];
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const e = /** @type {any} */ (entry);
      if (e.hadRecentInput) continue;
      // @ts-ignore
      window.__shifts.push({
        value: e.value,
        time: Math.round(e.startTime),
        sources: (e.sources ?? []).map((s) => {
          const n = s.node;
          if (!n) return '(node gone)';
          const el = n.nodeType === 1 ? n : n.parentElement;
          if (!el) return '(text)';
          const cls = typeof el.className === 'string' ? el.className.split(' ').slice(0, 3).join('.') : '';
          return `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}`;
        }),
      });
    }
  }).observe({ type: 'layout-shift', buffered: true });
});

await page.goto(URL, { waitUntil: 'load' });
await page.waitForTimeout(6000);

const shifts = await page.evaluate(() => window.__shifts);
const total = shifts.reduce((t, s) => t + s.value, 0);

console.log(`\nLayout shifts — ${URL}\n`);
console.log(`  total CLS  ${total.toFixed(4)}   (${shifts.length} shifts)\n`);
for (const s of shifts.sort((a, b) => b.value - a.value).slice(0, 12)) {
  console.log(`  ${s.value.toFixed(4)}  @${String(s.time).padStart(5)}ms  ${s.sources.join(', ') || '(no sources)'}`);
}
console.log('');

await browser.close();
