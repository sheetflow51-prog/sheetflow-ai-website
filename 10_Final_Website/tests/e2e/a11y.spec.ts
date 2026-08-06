import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility — axe-core against the production build.
 *
 * Run at both themes of motion preference. The site drives a lot of motion,
 * and the reduced-motion path renders different markup in several components,
 * so auditing only the default path leaves half the site unmeasured.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * Freezes every animation and transition at its final state before scanning.
 *
 * Without this the suite is flaky: under parallel load the reveal animations
 * are still in flight when axe runs, and it samples elements mid-fade — an
 * element at opacity 0.4 fails contrast on its way to passing. The failures
 * moved between runs and disappeared when the spec ran alone, which is the
 * signature of a timing artefact rather than a defect.
 *
 * Forcing animations to completion tests the state a user actually reads. It
 * does not weaken the audit: the finished frame is the one that has to pass.
 */
async function settle(page: import('@playwright/test').Page) {
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
    }`,
  });
  // Let framer-motion's JS-driven values land on their targets.
  await page.waitForTimeout(600);
}

/** Formats violations so a failure explains itself without opening a report. */
function summarise(violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) {
  return violations
    .map((v) => {
      const where = v.nodes.slice(0, 3).map((n) => `      ${n.target.join(' ')}`).join('\n');
      return `  [${v.impact}] ${v.id} — ${v.help}\n${where}`;
    })
    .join('\n\n');
}

test.describe('accessibility', () => {
  /**
   * Playwright's 30 s default is too tight for this spec, and the failure mode
   * was misleading: on a quiet machine these tests take 13–15 s and pass; run
   * alongside the rest of the suite they took 28–38 s and timed out, which
   * reads as an accessibility regression and is not one.
   *
   * axe walks the full DOM twice per assertion, across two device profiles in
   * parallel, on a page whose decorative layers repaint continuously — profiling
   * measured ~65% of the main thread going to paint (see TOOLING_MANIFEST.md).
   * The scan is genuinely slow, not stuck.
   *
   * Raised here rather than globally so a real hang elsewhere still fails fast.
   * 90 s is ~2.4x the worst observed run, which leaves headroom for a loaded
   * machine without letting a wedged test sit for minutes.
   */
  test.describe.configure({ timeout: 90_000 });

  test('homepage has no WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/');
    await settle(page);

    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(violations.length, `\n${summarise(violations)}\n`).toBe(0);
  });

  test('homepage has no violations under prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await settle(page);

    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(violations.length, `\n${summarise(violations)}\n`).toBe(0);
  });

  test('every interactive element is reachable and shows a focus indicator', async ({ page }) => {
    await page.goto('/');

    const focusable = page.locator(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const count = await focusable.count();
    expect(count).toBeGreaterThan(0);

    // A visible focus ring is the only way keyboard users track position.
    // outline:none with no replacement is the failure this catches.
    const bare: string[] = [];
    for (let i = 0; i < Math.min(count, 25); i++) {
      const el = focusable.nth(i);
      if (!(await el.isVisible())) continue;
      await el.focus();
      const styled = await el.evaluate((node) => {
        const s = getComputedStyle(node);
        const ring =
          (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) ||
          s.boxShadow !== 'none';
        return ring;
      });
      if (!styled) bare.push((await el.getAttribute('href')) ?? (await el.innerText()).slice(0, 40));
    }
    expect(bare, `no focus indicator on:\n${bare.join('\n')}`).toEqual([]);
  });

  test('images carry alt text and decorative ones are hidden', async ({ page }) => {
    await page.goto('/');
    const missing = await page.$$eval('img', (imgs) =>
      imgs
        .filter((i) => !i.hasAttribute('alt') && i.getAttribute('aria-hidden') !== 'true')
        .map((i) => i.getAttribute('src') ?? '(no src)'),
    );
    expect(missing, `images without alt:\n${missing.join('\n')}`).toEqual([]);
  });
});
