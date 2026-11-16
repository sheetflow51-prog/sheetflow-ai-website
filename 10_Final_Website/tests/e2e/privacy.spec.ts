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
    // The Board's complaint route starts with the DPDP provisions in May 2027,
    // so it is not offered as available today (a review finding).
    expect(text).toMatch(/you will be able to complain to the Data Protection Board of India when it starts taking complaints, which the law provides for from May 2027\./);
    expect(text).not.toMatch(/you can complain to the Data Protection Board/);
  });

  test('discloses every recipient and purpose of the form answers, including site analytics', async ({ page }) => {
    await page.goto('/privacy');
    // The form's `booking_qualified` event sends the two select answers to Vercel Web Analytics.
    const analytics = await page.locator('section[aria-labelledby="providers"] li', { hasText: 'Vercel Web Analytics' }).innerText();
    expect(analytics).toContain(
      'When you send the booking form, it also records that a form was sent, with your two multiple-choice answers and whether you added notes, never your name, email or notes.',
    );
    const collected = await page.locator('section[aria-labelledby="what-we-collect"]').innerText();
    expect(collected).toContain('a count of booking-form submissions with the two multiple-choice answers');
    // The country has a stated purpose, the same one the /book notice gives it.
    const attribution = await page.locator('h3#purpose-attribution + p').innerText();
    expect(attribution).toContain('your approximate country are stored with your enquiry');
    expect(attribution).toContain('booking-form submissions');
  });

  test('the AI-training copy lives no longer than the enquiry records, so withdrawal can always be honoured', async ({ page }) => {
    await page.goto('/privacy');
    const text = await page.locator('main').innerText();
    // A review finding: "kept until you withdraw" and "records deleted after N
    // months" could not both be kept once the link to the copy was deleted.
    expect(text).not.toContain('stay in our training data until you withdraw');
    const retention = await page.locator('section[aria-labelledby="retention"]').innerText();
    expect(retention).toContain('the de-identified copy of your answers in our training data is deleted at the same time, or sooner if you withdraw.');
    const ai = await page.locator('h3#ai-training ~ ul').first().innerText();
    expect(ai).toContain('How long we keep them: only as long as your enquiry records');
    expect(ai).toContain('So you can withdraw for as long as we hold it.');
    await expect(page.locator('h3#ai-training ~ ul a[href="#retention"]')).toHaveCount(1);
    const rights = await page.locator('section[aria-labelledby="your-rights"]').innerText();
    expect(rights).toContain('to delete it, which also deletes any de-identified copy of your answers in our training data;');
    expect(text).toContain('The booking form records which version you were shown.');
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
