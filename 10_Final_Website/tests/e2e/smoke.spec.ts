import { test, expect } from '@playwright/test';

/**
 * Smoke — the page renders, its metadata is intact, and nothing throws.
 *
 * These assert behaviour the type checker cannot see. Copy is matched by role
 * and structure rather than by exact wording so that editorial changes do not
 * fail the build; anything asserting specific words is asserting a governance
 * rule, and says so.
 */

test.describe('homepage', () => {
  test('renders without console errors or failed requests', async ({ page }) => {
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];

    /**
     * `/_vercel/insights/*` and `/_vercel/speed-insights/*` are injected by
     * @vercel/analytics and are only served by Vercel's edge. Off-platform they
     * 404, which is expected and says nothing about the app. Everything else is
     * a real error.
     */
    const isVercelTelemetry = (s: string) => s.includes('/_vercel/');

    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const text = msg.text();
      if (isVercelTelemetry(text)) return;
      // The 404 above also surfaces as a bare "Failed to load resource" line
      // with the URL only on the request, so drop that pairing too.
      if (text.startsWith('Failed to load resource') && msg.location().url.includes('/_vercel/')) return;
      consoleErrors.push(text);
    });
    page.on('requestfailed', (req) => {
      // Media can legitimately abort when the element unmounts mid-flight.
      if (req.resourceType() === 'media') return;
      if (isVercelTelemetry(req.url())) return;
      failedRequests.push(`${req.url()} — ${req.failure()?.errorText ?? 'unknown'}`);
    });

    await page.goto('/', { waitUntil: 'load' });
    await expect(page.locator('main')).toBeVisible();

    expect(consoleErrors, `console errors:\n${consoleErrors.join('\n')}`).toEqual([]);
    expect(failedRequests, `failed requests:\n${failedRequests.join('\n')}`).toEqual([]);
  });

  test('has exactly one h1 and a coherent heading order', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toHaveCount(1);

    // Heading levels may descend by any amount but must not jump down by more
    // than one — screen-reader users navigate by this structure.
    const levels = await page.$$eval('h1,h2,h3,h4,h5,h6', (nodes) =>
      nodes
        .filter((n) => (n as HTMLElement).offsetParent !== null || n.tagName === 'H1')
        .map((n) => Number(n.tagName[1])),
    );

    for (let i = 1; i < levels.length; i++) {
      const jump = levels[i] - levels[i - 1];
      expect(jump, `h${levels[i - 1]} is followed by h${levels[i]}`).toBeLessThanOrEqual(1);
    }
  });

  test('serves title, description and canonical metadata', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/sheetflow/i);
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /.{60,}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  });

  test('every in-page anchor resolves to a real section', async ({ page }) => {
    await page.goto('/');

    const hrefs = await page.$$eval('a[href^="#"]', (as) =>
      as.map((a) => a.getAttribute('href')!).filter((h) => h.length > 1),
    );
    expect(hrefs.length, 'expected at least one in-page anchor').toBeGreaterThan(0);

    for (const href of [...new Set(hrefs)]) {
      await expect(page.locator(href), `${href} has no target`).toHaveCount(1);
    }
  });

  test('external links are safe and the booking CTA points at Calendly', async ({ page }) => {
    await page.goto('/');

    // target=_blank without rel=noopener leaks window.opener to the target.
    const unsafe = await page.$$eval('a[target="_blank"]', (as) =>
      as
        .filter((a) => !(a.getAttribute('rel') ?? '').includes('noopener'))
        .map((a) => a.getAttribute('href')!),
    );
    expect(unsafe, `missing rel=noopener:\n${unsafe.join('\n')}`).toEqual([]);

    await expect(page.locator('a[href*="calendly.com"]').first()).toBeAttached();
  });
});

test.describe('brand assets', () => {
  /**
   * DEC-302: every raster is cut from public/logo.png, and no reconstructed
   * SVG may stand in for it. A 404 here means the generator did not run.
   */
  const required = [
    '/icon.png',
    '/apple-icon.png',
    '/manifest.webmanifest',
    '/brand/raster/icon-96.png',
    '/brand/raster/lockup-256.png',
    '/brand/raster/lockup-512.png',
    '/brand/raster/icon-maskable-512.png',
  ];

  for (const path of required) {
    test(`${path} is served`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status(), `${path} returned ${res.status()}`).toBe(200);
    });
  }

  test('manifest declares installable icon sizes', async ({ request }) => {
    const manifest = await (await request.get('/manifest.webmanifest')).json();
    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true);
  });

  test('no reconstructed SVG is served as the favicon', async ({ request }) => {
    expect((await request.get('/icon.svg')).status()).toBe(404);
  });
});

test.describe('proof architecture', () => {
  /**
   * The removed names must not reappear. This is the automated half of the
   * rule that src/content/proof.ts enforces in the type system.
   */
  const fabricated = [
    'North Clinic', 'Oakwood', 'Summit Coaching', 'BrightPath',
    'Lumen Agency', 'Kinetik', 'Strata', 'Northfield', 'Obsidian',
  ];

  test('no fabricated customer names are rendered', async ({ page }) => {
    await page.goto('/');
    const text = (await page.locator('body').innerText()).toLowerCase();
    const found = fabricated.filter((n) => text.includes(n.toLowerCase()));
    expect(found, `fabricated names on the page: ${found.join(', ')}`).toEqual([]);
  });
});
