import { test, expect } from '@playwright/test';

/**
 * Responsiveness — the failure mode this catches is horizontal overflow.
 *
 * A single element wider than the viewport makes the whole page scroll
 * sideways on mobile, which reads as broken. It is invisible on a desktop
 * monitor and invisible to the type checker, so it is asserted here.
 */

const VIEWPORTS = [
  { name: 'mobile-small', width: 320, height: 720 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'desktop-wide', width: 1920, height: 1080 },
];

test.describe('layout', () => {
  for (const vp of VIEWPORTS) {
    test(`${vp.name} (${vp.width}px) does not scroll horizontally`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForTimeout(700);

      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        // 1px of tolerance absorbs sub-pixel rounding in transformed elements.
        const offenders: string[] = [];
        document.querySelectorAll('*').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return;
          if (r.right > docWidth + 1) {
            const e = el as HTMLElement;
            offenders.push(
              `${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.split(' ').slice(0, 2).join('.') : ''} → right ${Math.round(r.right)} > ${docWidth}`,
            );
          }
        });
        return {
          scrolls: document.documentElement.scrollWidth > docWidth + 1,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: docWidth,
          offenders: offenders.slice(0, 8),
        };
      });

      expect(
        overflow.scrolls,
        `page scrolls horizontally (${overflow.scrollWidth} > ${overflow.clientWidth}).\n` +
          `Widest offenders:\n${overflow.offenders.join('\n')}`,
      ).toBe(false);
    });
  }

  test('tap targets on mobile meet the 24px minimum', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // WCAG 2.2 SC 2.5.8 sets 24x24 CSS px as the floor for pointer targets.
    const small = await page.$$eval('a[href], button:not([disabled])', (els) =>
      els
        .filter((el) => (el as HTMLElement).offsetParent !== null)
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { label: el.textContent?.trim().slice(0, 30) || el.getAttribute('aria-label') || el.tagName, w: Math.round(r.width), h: Math.round(r.height) };
        })
        .filter((t) => t.w > 0 && (t.w < 24 || t.h < 24)),
    );

    expect(
      small,
      `tap targets under 24px:\n${small.map((t) => `  ${t.label} — ${t.w}x${t.h}`).join('\n')}`,
    ).toEqual([]);
  });
});
