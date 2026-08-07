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
  // Timeout is set globally in playwright.config.ts — axe is slow here because
  // it walks the full DOM twice per assertion on a continuously repainting
  // page, and it is not the only spec affected.

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

  /**
   * The service routes.
   *
   * Every service page renders from one component with different content, so
   * the *structure* under audit is identical across the four. Auditing all of
   * them in both motion paths would be eight more axe runs re-testing the same
   * DOM; the index plus one representative page covers the two distinct
   * layouts, and the reduced-motion arm is run once for the same reason.
   *
   * The per-page markup that *does* differ — heading order, breadcrumb, FAQ
   * disclosure — is asserted for all four in `seo.spec.ts`, which is cheap.
   */
  for (const path of ['/services', '/services/whatsapp-automation']) {
    test(`${path} has no WCAG 2.1 AA violations`, async ({ page }) => {
      await page.goto(path);
      await settle(page);

      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(violations.length, `\n${summarise(violations)}\n`).toBe(0);
    });
  }

  test('/services/whatsapp-automation has no violations under prefers-reduced-motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/services/whatsapp-automation');
    await settle(page);

    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(violations.length, `\n${summarise(violations)}\n`).toBe(0);
  });

  /**
   * The work, pricing and booking routes.
   *
   * Unlike the four service pages, these are four genuinely different layouts:
   * an image grid, a long-form case study, a pricing table, and a form. None
   * of them re-tests another's DOM, so all four are audited.
   *
   * `/book` matters most. It is the only page on the site with real form
   * controls, and form accessibility failures — an unlabelled input, a select
   * with no accessible name, an error nobody announces — are the class axe
   * catches best and reviewers catch worst.
   */
  for (const path of ['/work', '/work/saraswati-dental-clinic', '/pricing', '/book']) {
    test(`${path} has no WCAG 2.1 AA violations`, async ({ page }) => {
      await page.goto(path);
      await settle(page);

      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(violations.length, `\n${summarise(violations)}\n`).toBe(0);
    });
  }

  test('/pricing has no violations under prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/pricing');
    await settle(page);

    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(violations.length, `\n${summarise(violations)}\n`).toBe(0);
  });

  test('every booking control has an accessible name', async ({ page }) => {
    // axe catches a missing label; it does not catch a label that is present
    // but attached to the wrong control, which reads correctly in a review and
    // is wrong in a screen reader. Resolving each control by its visible text
    // asserts the association rather than the existence.
    await page.goto('/book');

    const named = [
      'Your name',
      'Email',
      'What kind of business?',
      'Where are you losing the most?',
    ];
    for (const label of named) {
      await expect(
        page.getByLabel(label, { exact: false }),
        `no control resolves from the label "${label}"`,
      ).toHaveCount(1);
    }
  });

  test('the calculator announces its result', async ({ page }) => {
    // The figure changes without any DOM the user navigated to, so without a
    // live region a screen-reader user gets silence while the number moves.
    await page.goto('/pricing');
    const live = page.locator('[aria-live="polite"]');
    await expect(live).toHaveCount(1);
    await expect(live).toHaveAttribute('aria-atomic', 'true');
  });

  test('case study images carry descriptive alt text, not filenames', async ({ page }) => {
    // These images are the evidence the page rests on. An empty or filename
    // alt makes the entire argument invisible to a screen reader.
    await page.goto('/work');
    const alts = await page.$$eval('main img', (imgs) =>
      imgs.map((i) => i.getAttribute('alt') ?? ''),
    );
    expect(alts.length).toBeGreaterThan(0);
    for (const alt of alts) {
      expect(alt.length, 'an empty alt on a content image').toBeGreaterThan(20);
      expect(alt, 'alt text looks like a filename').not.toMatch(/\.(jpg|png|webp|avif)$/i);
    }
  });
});
