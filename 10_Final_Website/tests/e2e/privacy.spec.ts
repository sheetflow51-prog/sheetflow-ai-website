import { test, expect } from '@playwright/test';

import {
  FOUNDER_DECISIONS,
  PRIVACY_EFFECTIVE_DATE,
  PRIVACY_NOTICE_VERSION,
  pendingMarker,
  unfilledDecisions,
} from '../../src/content/privacy';

/**
 * `/privacy` (D47): the notice the /book form links to.
 *
 * The headings below are the sections the notice has to carry under the DPDP
 * Act and the SPDI Rules, as drafted for D47. They are listed here by hand,
 * not imported from the page, so dropping a section fails a test instead of
 * quietly shrinking the list it is checked against.
 *
 * The suite runs against a local (non-production) build, where unfilled
 * founder decisions render as visible "[To be confirmed by SheetFlow: ...]"
 * markers. A production Vercel build refuses to build while any remain; that
 * is checked by `scripts/test-privacy-guard.mjs` and by building with
 * `VERCEL_ENV=production`.
 */

const SECTIONS: Array<[id: string, heading: string]> = [
  ['contact', 'Who we are and how to contact us'],
  ['what-we-collect', 'What we collect'],
  ['why', 'Why we use it'],
  ['providers', 'Who else handles your details'],
  ['retention', 'How long we keep it'],
  ['your-rights', 'Your rights'],
  ['security', 'How we keep it safe'],
  ['breaches', 'If something goes wrong'],
  ['children', 'Children'],
  ['law', 'The law we follow'],
  ['changes', 'Changes to this notice'],
];

test.describe('privacy notice', () => {
  test('is an indexable page with its own title and canonical', async ({ page }) => {
    const res = await page.goto('/privacy');
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/^Privacy notice · SheetFlow AI$/);
    await expect(page.locator('h1')).toHaveText('Privacy notice');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(new URL(canonical!).pathname).toBe('/privacy');
    const robots = (await page.locator('meta[name="robots"]').getAttribute('content')) ?? '';
    expect(robots).not.toContain('noindex');
  });

  test('renders every required section heading, in order, each linkable', async ({ page }) => {
    await page.goto('/privacy');
    const ids = await page.locator('main h2[id]').evaluateAll((els) => els.map((el) => el.id));
    const expected = SECTIONS.map(([id]) => id);
    if (FOUNDER_DECISIONS.otherLanguagesOnRequest) expected.splice(expected.indexOf('law'), 0, 'languages');
    expect(ids).toEqual(expected);
    for (const [id, heading] of SECTIONS) {
      await expect(page.locator(`h2#${id}`)).toHaveText(heading);
      // The on-page contents list links each one.
      await expect(page.locator(`nav[aria-label="On this page"] a[href="#${id}"]`)).toHaveCount(1);
    }
    // The purposes, including the optional AI-training one the /book form links to.
    await expect(page.locator('h3#purpose-booking')).toBeVisible();
    await expect(page.locator('h3#purpose-attribution')).toBeVisible();
    await expect(page.locator('h3#ai-training')).toHaveText('To improve our AI assistants, only if you agree');
    await expect(page.getByRole('heading', { name: 'Grievance Officer / privacy contact', level: 3 })).toBeVisible();
    // Languages are offered only when the founder says they can be delivered.
    await expect(page.locator('#languages')).toHaveCount(FOUNDER_DECISIONS.otherLanguagesOnRequest ? 1 : 0);
  });

  test('shows a visible marker for every founder decision still open (non-production build)', async ({ page }) => {
    await page.goto('/privacy');
    const open = unfilledDecisions();
    for (const key of open) {
      const marker = page.locator(`[data-pending-decision="${key}"]`).first();
      await expect(marker, `no marker for ${key}`).toBeVisible();
      await expect(marker).toHaveText(pendingMarker(key));
    }
    const shown = await page.locator('[data-pending-decision]').evaluateAll((els) => [
      ...new Set(els.map((el) => el.getAttribute('data-pending-decision'))),
    ]);
    expect(shown.sort()).toEqual([...open].sort());
    if (open.length > 0) await expect(page.getByText('[To be confirmed by SheetFlow:').first()).toBeVisible();
  });

  test('states its version and effective date, and names the providers by entity', async ({ page }) => {
    await page.goto('/privacy');
    const text = await page.locator('main').innerText();
    expect(text).toContain(`Version ${PRIVACY_NOTICE_VERSION}`);
    expect(text).toContain(`Effective ${PRIVACY_EFFECTIVE_DATE}`);
    for (const entity of ['Vercel Inc.', 'Vercel Web Analytics', 'Vercel Speed Insights', 'ngrok, Inc.', 'Google LLC', 'Cal.com, Inc.', 'WhatsApp']) {
      expect(text, `providers do not name ${entity}`).toContain(entity);
    }
    // A label followed by text that holds an HTML entity once lost its space in
    // the compiled JSX ("Vercel Inc.hosts"); these pin the rendered sentences.
    for (const sentence of ['Vercel Inc. hosts this website.', 'Vercel Web Analytics counts visits.', 'What we use: your answers']) {
      expect(text, `missing or run together: ${sentence}`).toContain(sentence);
    }
    expect(text).toContain('These providers are based in the United States');
    expect(text).toContain('We do not sell your personal data.');
    expect(text).toContain('We reply within 30 days.');
    expect(text).toContain('Data Protection Board of India');
  });

  test('makes no claim the research ruled out', async ({ page }) => {
    await page.goto('/privacy');
    const text = await page.locator('main').innerText();
    for (const banned of [
      /Data Protection Officer/i,
      /DPDP[- ]compliant|compliant with the DPDP/i,
      /certified|certification/i,
      /\bGDPR\b|\bCCPA\b/,
      /bank[- ]grade|military[- ]grade|100% (secure|safe)|fully secure/i,
      /never leaves India/i,
      /72 hours/i,
      /\banonymous\b/i,
    ]) {
      expect(text, `the notice says ${banned}`).not.toMatch(banned);
    }
    // No Board website or portal: none has been verified.
    const hrefs = await page.locator('main a[href]').evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''));
    expect(hrefs.filter((h) => /meity|dpb|dataprotection/i.test(h))).toEqual([]);
    // Speed Insights is never described as cookie-free: Vercel's docs are silent on it.
    const speed = await page.locator('li', { hasText: 'Vercel Speed Insights' }).innerText();
    expect(speed).not.toMatch(/cookie/i);
  });

  test('is in the sitemap and linked from the footer of every page', async ({ page, request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).toMatch(/<loc>[^<]*\/privacy<\/loc>/);
    for (const path of ['/', '/book', '/privacy']) {
      await page.goto(path);
      const link = page.locator('footer a[href="/privacy"]');
      await expect(link, `${path} footer has no Privacy link`).toHaveCount(1);
      await expect(link).toHaveText('Privacy');
    }
  });
});
