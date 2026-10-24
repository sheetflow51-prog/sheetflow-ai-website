import { test, expect } from '@playwright/test';

/**
 * Payload guards — what the page is allowed to send, per form factor.
 *
 * Every assertion here protects a saving that is invisible in a diff review and
 * silently reversible by a one-line edit. A font style re-added, a `canvasOk`
 * guard dropped, a `<video>` moved back out of its branch: all of them look
 * like tidying, all of them cost bytes or main-thread time only on devices the
 * author is not looking at.
 *
 * These are deliberately assertions about *requests and declarations*, not
 * about Lighthouse scores. A score moves with machine load; whether a font file
 * was declared does not.
 */

const isMobile = () => test.info().project.name === 'mobile';

test.describe('font payload', () => {
  /**
   * Fraunces italic was declared in `layout.tsx` and rendered nowhere. Because
   * it is a layout-declared font, Next preloaded it: 81,704 bytes on the
   * critical path of every route, 36% of the preloaded font payload, for a face
   * with no way to appear on screen.
   *
   * Note this is a *style*, not a weight. Trimming weights is documented in
   * `layout.tsx` as changing nothing — `next/font` emits one file per subset —
   * and that remains true. A style is a separate `@font-face` with its own
   * `src`, so the two behave differently and only one of them is worth doing.
   */
  test('no italic face is declared for the display font', async ({ page }) => {
    await page.goto('/');

    const italicFaces = await page.evaluate(() =>
      Array.from(document.styleSheets)
        .flatMap((sheet) => {
          try {
            return Array.from(sheet.cssRules);
          } catch {
            return []; // cross-origin sheet; nothing of ours lives there
          }
        })
        .filter(
          (rule): rule is CSSFontFaceRule =>
            rule instanceof CSSFontFaceRule &&
            rule.style.getPropertyValue('font-style').trim() === 'italic',
        )
        .map((rule) => rule.style.getPropertyValue('font-family')),
    );

    expect(
      italicFaces,
      `italic @font-face declared for: ${italicFaces.join(', ')}.\n` +
        'Nothing in src/ renders italic. If that changed, update this test — ' +
        'but a declared style costs a preloaded file whether or not it is used.',
    ).toEqual([]);
  });

  test('at most three fonts are preloaded', async ({ page }) => {
    await page.goto('/');

    const preloaded = await page.$$eval(
      'link[rel="preload"][as="font"]',
      (links) => links.map((l) => (l as HTMLLinkElement).href.split('/').pop() ?? ''),
    );

    // One per family: Inter, Fraunces, JetBrains Mono. A fourth means a family
    // or a style was added — which may be right, but should be a decision.
    expect(
      preloaded.length,
      `preloaded font files: ${preloaded.join(', ')}`,
    ).toBeLessThanOrEqual(3);
  });
});

test.describe('decorative payload is form-factor aware', () => {
  /**
   * The hero's ambient clip is 2.7 MB. Lighthouse never sees the full cost —
   * `preload="metadata"` plus post-hydration `autoPlay` means the audit records
   * 627 bytes — so no score will defend this. A real phone, left on the page,
   * streams and loops the whole thing on a metered plan.
   *
   * Asserted in both directions: absent on mobile, and still present on
   * desktop, because "fixed the mobile cost" and "deleted the hero" are the
   * same diff if only the negative is checked.
   */
  test('hero video is requested on desktop and never on mobile', async ({ page }) => {
    const videoRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('.mp4')) videoRequests.push(req.url());
    });

    await page.goto('/');
    await page.waitForLoadState('load');
    // The <video> renders from a post-hydration effect, so a request that is
    // going to happen has not necessarily happened at `load`.
    await page.waitForTimeout(1500);

    if (isMobile()) {
      expect(
        videoRequests,
        'mobile requested the 2.7 MB ambient clip; it should render the poster instead',
      ).toEqual([]);
    } else {
      expect(
        videoRequests.length,
        'desktop stopped requesting the hero clip — the ambient core is part of the desktop composition',
      ).toBeGreaterThan(0);
    }
  });

  /**
   * `ParticleField` is mounted `reactive`; its inner loop is cursor repulsion.
   * On a touch device that force can never fire, leaving a full-viewport canvas
   * repainting 130 particles and their links at 30fps for a drift nobody can
   * interact with — while Lighthouse's mobile profile runs a 4x CPU throttle.
   *
   * Same precedent as `CustomCursor`, which already early-returns on
   * `pointer: coarse`.
   */
  test('the particle canvas mounts on desktop and not on touch', async ({ page }) => {
    // The particle field is Dark-theme atmosphere (D36): it is not mounted at all in Light, which is the
    // default. This test therefore selects Dark, so it keeps measuring the form-factor gate it was written for.
    await page.goto('/?theme=dark');
    await page.waitForLoadState('load');
    // The atmosphere mounts on `load` then requestIdleCallback(timeout: 3000).
    // This wait must clear that timeout, or "absent" would just mean "early".
    await page.waitForTimeout(4000);

    const canvases = await page.locator('canvas').count();

    if (isMobile()) {
      expect(canvases, 'a decorative canvas mounted on a touch device').toBe(0);
    } else {
      expect(
        canvases,
        'the particle canvas did not mount on desktop — if this is intentional, ' +
          'the mobile assertion above is no longer measuring anything',
      ).toBeGreaterThan(0);
    }
  });

  test('in Light, the default theme, no decorative canvas is mounted at all', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForTimeout(4000);
    expect(await page.locator('canvas').count(), 'the particle canvas should not run in Light').toBe(0);
  });
});
