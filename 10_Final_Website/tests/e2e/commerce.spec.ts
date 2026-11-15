import { test, expect } from '@playwright/test';
import { tiers, comparison, pricingFaqs, engagementSteps } from '../../src/content/pricing';
import { projects } from '../../src/content/work';
import { services } from '../../src/content/services';
import {
  buildBookingUrl,
  composeNotes,
  INTAKE_ACTION,
  NOTES_PARAM,
  tierBookingUrl,
} from '../../src/lib/booking';
import { BOOKING_URL } from '../../src/lib/contact';

/**
 * The two commercial surfaces: `/pricing` and `/book`.
 *
 * Both publish commitments — what each engagement includes and how it is
 * quoted, and a booking hand-off to a third party. A regression on either is a
 * commercial fault rather than a cosmetic one: a price reappearing is a quote
 * nobody authorised (D38), and a broken hand-off loses the conversion the
 * whole site exists to produce.
 *
 * The submission itself (the POST to /api/intake, its 303 and what the
 * browser does with it) is driven end to end in `booking-intake.spec.ts`.
 */

async function graph(page: import('@playwright/test').Page) {
  const blocks = await page.$$eval('script[type="application/ld+json"]', (els) =>
    els.map((e) => e.textContent ?? ''),
  );
  expect(blocks.length, 'expected exactly one JSON-LD block').toBe(1);
  return JSON.parse(blocks[0])['@graph'] as Array<Record<string, unknown>>;
}

const byType = (nodes: Array<Record<string, unknown>>, type: string) =>
  nodes.find((n) => n['@type'] === type);

test.describe('pricing', () => {
  test('renders every tier with how it is quoted', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('h1')).toHaveText('Scoped to your systems, not to a price list.');

    expect(tiers.map((t) => t.name)).toEqual([
      'Foundation Audit & Rapid Sprint',
      'Autonomous Operations Engine',
      'Enterprise Bespoke Infrastructure',
    ]);
    for (const tier of tiers) {
      const section = page.locator(`#${tier.id}`);
      await expect(section, `missing tier section #${tier.id}`).toBeVisible();
      await expect(section.getByRole('heading', { name: tier.name, exact: true })).toBeVisible();
      await expect(section.getByText(tier.engagement.model, { exact: true })).toBeVisible();
      await expect(section.getByText(tier.engagement.quote, { exact: true })).toBeVisible();
    }
  });

  test('publishes no price, range or currency figure anywhere a tier is shown (D38)', async ({
    page,
    request,
  }) => {
    // The failure this prevents: a figure creeping back into copy, schema or
    // llms.txt after the founder withdrew every published price.
    const money = /(₹|rs\.?\s?\d|inr\s?\d|\$\s?\d|\d[\d,]*\s?(\/|per)\s?month|\bfrom\s+\d)/i;
    for (const path of ['/pricing', '/']) {
      await page.goto(path);
      const text = path === '/'
        ? await page.locator('#pricing-beat').innerText()
        : await page.locator('main').innerText();
      // The calculator on /pricing labels the visitor's own figures in rupees;
      // it is the one place a currency symbol is allowed, so it is excluded.
      const withoutCalculator = path === '/pricing'
        ? text.replace(await page.locator('[aria-labelledby="calculator-heading"]').innerText(), '')
        : text;
      expect(withoutCalculator, `${path} states a price`).not.toMatch(money);
    }
    const llms = await (await request.get('/llms.txt')).text();
    const pricingSection = llms.slice(llms.indexOf('## Pricing'), llms.indexOf('## Work'));
    expect(pricingSection, 'llms.txt states a price').not.toMatch(money);
  });

  test('every tier CTA goes through /book, tagged with the tier (D47)', async ({ page }) => {
    // D38 linked these straight to the scheduler, which skipped the lead
    // capture. Now each one lands on /book, and the tier travels as utm_content.
    await page.goto('/pricing');
    for (const tier of tiers) {
      const section = page.locator(`#${tier.id}`);
      const book = section.getByRole('link', { name: tier.cta });
      await expect(book).toHaveAttribute('href', tierBookingUrl(tier));
      const href = (await book.getAttribute('href'))!;
      expect(href.startsWith('/book?'), `${tier.id} CTA leaves the site: ${href}`).toBe(true);
      expect(new URL(href, 'http://x.test').searchParams.get('utm_content')).toBe(`tier-${tier.id}`);
      // The secondary path keeps the qualification form reachable.
      await expect(section.locator('a[href="/book"]')).toHaveCount(1);
    }
    // No link on the page reaches a scheduler directly.
    await expect(page.locator('a[href*="calendly.com"], a[href*="cal.com"]')).toHaveCount(0);
    // The homepage beat books through the same links, so the two cannot drift.
    await page.goto('/');
    for (const tier of tiers) {
      await expect(page.locator(`#pricing-beat a[href="${tierBookingUrl(tier)}"]`)).toHaveCount(1);
    }
    await expect(page.locator('a[href*="calendly.com"], a[href*="cal.com"]')).toHaveCount(0);
  });

  test('shows how an engagement runs', async ({ page }) => {
    await page.goto('/pricing');
    const steps = page.locator('[aria-labelledby="scope-heading"] ol > li');
    await expect(steps).toHaveCount(engagementSteps.length);
    for (const step of engagementSteps) {
      await expect(steps.getByRole('heading', { name: step.name, exact: true })).toBeVisible();
    }
  });

  test('the schema carries one Offer per tier and no price node', async ({ page }) => {
    // The failure this prevents: a price left in the graph after the page
    // stopped stating one, so search results advertise a figure the page
    // does not contain (D38).
    await page.goto('/pricing');
    const nodes = await graph(page);
    const catalogue = byType(nodes, 'OfferCatalog')!;
    const offers = catalogue.itemListElement as Array<Record<string, any>>;

    expect(offers).toHaveLength(tiers.length);

    for (const tier of tiers) {
      const offer = offers.find((o) => o['@id']?.endsWith(`#${tier.id}`));
      expect(offer, `no Offer node for ${tier.id}`).toBeTruthy();
      expect(offer!.priceSpecification, `${tier.id} must carry no price node`).toBeUndefined();
      expect(offer!.price, `${tier.id} must carry no price`).toBeUndefined();
      expect(offer!.description).toContain(tier.engagement.quote);
    }
  });

  test('the comparison table is a real table with scoped headers', async ({ page }) => {
    await page.goto('/pricing');
    const table = page.locator('table');
    await expect(table).toHaveCount(1);

    // Column headers, one per tier plus the capability column.
    await expect(table.locator('thead th')).toHaveCount(tiers.length + 1);
    // Row headers — `th[scope=row]`, not `td`, or the capability name is not
    // associated with its cells for a screen reader.
    await expect(table.locator('tbody th[scope="row"]')).toHaveCount(comparison.length);
  });

  test('publishes no delivery timeline or return promise', async ({ page }) => {
    await page.goto('/pricing');
    const body = (await page.locator('main').innerText()).toLowerCase();

    // Both are explicitly refused in `content/pricing.ts`. The page must say
    // it does not publish them — and must not then publish them.
    expect(body).toContain('we do not publish a delivery timeline');
    expect(body).toContain('we do not publish a return figure');
    expect(body, 'a delivery promise appeared').not.toMatch(
      /\b(live|delivered|ready|launch(ed)?)\s+in\s+\d+\s*(day|week|month)/,
    );
  });

  test('every pricing FAQ is answered in the DOM without interaction', async ({ page }) => {
    await page.goto('/pricing');
    const nodes = await graph(page);
    const faqNode = byType(nodes, 'FAQPage')!;
    const questions = faqNode.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>;

    expect(questions).toHaveLength(pricingFaqs.length);
    for (const q of questions) {
      await expect(page.getByText(q.acceptedAnswer.text, { exact: false }).first()).toBeVisible();
    }
  });
});

test.describe('recovery calculator', () => {
  test('multiplies the visitor’s own inputs and updates live', async ({ page }) => {
    await page.goto('/pricing');

    const missed = page.getByLabel('Enquiries you miss or answer late, per week');
    const value = page.getByLabel('What one converted customer is worth to you');
    const recovery = page.getByLabel('Share of those you think you would recover');

    await missed.fill('10');
    await value.fill('1000');
    await recovery.fill('100');

    // 10 × 4.33 × 1000 × 1.00 = 43,300
    const live = page.locator('[aria-live="polite"]');
    await expect(live).toContainText('43,300');

    // Halving the recovery rate must halve the figure — proving the output is
    // a function of the inputs rather than a decorative constant.
    await recovery.fill('50');
    await expect(live).toContainText('21,650');
  });

  test('states that the output is not a SheetFlow claim', async ({ page }) => {
    // The single line that separates this from a fabricated ROI projection.
    await page.goto('/pricing');
    const body = await page.locator('main').innerText();
    expect(body).toContain('not a forecast');
    expect(body.toLowerCase()).toContain('your estimate');
  });
});

test.describe('booking', () => {
  test('the form posts to our own intake, with no JavaScript needed (D47)', async ({ browser }) => {
    // The conversion path must not depend on our JS executing. The form is a
    // native POST to /api/intake, which captures the lead and answers 303 to
    // the booking page; the server reads exactly these field names.
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/book');

    const form = page.locator('form');
    await expect(form).toHaveCount(1);
    await expect(form).toHaveAttribute('action', INTAKE_ACTION);
    await expect(form).toHaveAttribute('method', 'post');
    expect(INTAKE_ACTION).toBe('/api/intake');

    for (const selector of [
      'input[name="name"]',
      'input[name="email"]',
      'select[name="sector"]',
      'select[name="bottleneck"]',
      'textarea[name="notes"]',
      'input[type="checkbox"][name="ai_training"]',
      'input[name="website"]',
    ]) {
      await expect(form.locator(selector), `missing ${selector}`).toHaveCount(1);
    }
    // Calendly's `a1` is composed on the server now; the form no longer emits it.
    await expect(form.locator(`[name="${NOTES_PARAM}"]`)).toHaveCount(0);
    // Without JavaScript there is no attribution to copy: those inputs are absent.
    await expect(form.locator('input[type="hidden"]')).toHaveCount(0);

    await context.close();
  });

  test('required fields are marked required', async ({ page }) => {
    await page.goto('/book');
    for (const name of ['name', 'email']) {
      await expect(page.locator(`input[name="${name}"]`)).toHaveAttribute('required', '');
    }
    for (const name of ['sector', 'bottleneck']) {
      await expect(page.locator(`select[name="${name}"]`)).toHaveAttribute('required', '');
    }
  });

  test('loads no third-party script', async ({ page }) => {
    // The reason `/book` prefills by URL instead of embedding Calendly. If a
    // widget is ever added, this fails and the trade-off gets re-argued rather
    // than made by accident.
    const thirdParty: string[] = [];
    page.on('request', (r) => {
      const url = new URL(r.url());
      if (r.resourceType() === 'script' && !url.hostname.includes('localhost')) {
        thirdParty.push(url.hostname);
      }
    });

    await page.goto('/book', { waitUntil: 'networkidle' });
    expect(thirdParty, `third-party scripts loaded: ${thirdParty.join(', ')}`).toHaveLength(0);
  });

  test('emits a free 20-minute session Service offer and a ReserveAction aimed at /book', async ({ page }) => {
    await page.goto('/book');
    const nodes = await graph(page);
    const org = byType(nodes, 'Organization')!;
    const bookUrl = `${org.url}/book`;

    const service = byType(nodes, 'Service')!;
    expect(service.name).toBe('20-Minute Discovery & Help Session');
    const offer = service.offers as Record<string, unknown>;
    expect(offer.price).toBe(0);

    // Every booking surface in the graph points at /book, never at the
    // scheduler, so a booking started from search or an assistant still goes
    // through the lead capture (D47).
    const webPage = byType(nodes, 'WebPage')!;
    const action = webPage.potentialAction as Record<string, any>;
    expect(action['@type']).toBe('ReserveAction');
    expect(action.target.urlTemplate).toBe(bookUrl);
    expect(offer.url).toBe(bookUrl);
    expect(bookUrl).toMatch(/^https:\/\/[^/]+\/book$/);
    expect(JSON.stringify(nodes)).not.toContain(BOOKING_URL);
  });

  test('the old 30-minute audit offer is gone from the booking surfaces (D42)', async ({
    page,
    request,
  }) => {
    // The offer became the free 20-Minute Discovery & Help Session on
    // 2026-10-29. "Audit" alone is not banned: the paid Foundation Audit &
    // Rapid Sprint keeps its name. What must not come back is the free call
    // under its old name or length, including the old labels "Book automation
    // audit" (tier cards) and "Book an audit" (footer, breadcrumb).
    const oldOffer =
      /\b30[- ]?min|\bthirty minutes\b|\b(free|automation) audit\b|\b(an|your) audit\b|\baudit call\b/i;
    for (const path of ['/', '/book', '/book/confirmed', '/pricing', '/services', '/work']) {
      await page.goto(path);
      const text = await page.locator('body').innerText();
      expect(text, `${path} still offers the old audit`).not.toMatch(oldOffer);
    }
    const llms = await (await request.get('/llms.txt')).text();
    expect(llms, 'llms.txt still offers the old audit').not.toMatch(oldOffer);

    await page.goto('/book');
    await expect(page.getByText('20 minutes', { exact: true })).toBeVisible();
  });

  test('the confirmation page is noindex and absent from the sitemap', async ({ page, request }) => {
    await page.goto('/book/confirmed');
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots, '/book/confirmed must not be indexable').toContain('noindex');

    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).not.toContain('/book/confirmed');
  });
});

test.describe('booking URL construction', () => {
  // Pure-function coverage. `buildBookingUrl` is the Calendly fallback
  // /api/intake redirects to while CAL_BOOKING_URL is unset, and a malformed
  // link loses the context silently — Calendly renders its normal page with
  // nothing filled in, so there is no error to observe.
  const answers = {
    name: 'Asha Verma',
    email: 'asha@example.com',
    sector: 'Clinic or healthcare practice',
    bottleneck: 'Enquiries go unanswered too long',
    notes: 'Two locations.',
  };

  test('prefills name, email and the notes parameter', () => {
    const url = new URL(buildBookingUrl(answers));
    expect(url.origin + url.pathname).toBe(BOOKING_URL);
    expect(url.searchParams.get('name')).toBe('Asha Verma');
    expect(url.searchParams.get('email')).toBe('asha@example.com');
    expect(url.searchParams.get(NOTES_PARAM)).toContain('Clinic or healthcare practice');
    expect(url.searchParams.get(NOTES_PARAM)).toContain('Two locations.');
  });

  test('omits empty values rather than sending them blank', () => {
    // A blank prefill suppresses Calendly's own validation prompt for the
    // field, which is worse than not prefilling it at all.
    const url = new URL(buildBookingUrl({ ...answers, email: '   ', notes: '' }));
    expect(url.searchParams.has('email')).toBe(false);
    expect(url.searchParams.get(NOTES_PARAM)).not.toContain('undefined');
  });

  test('carries attribution but never identity', () => {
    const url = new URL(buildBookingUrl(answers));
    expect(url.searchParams.get('utm_source')).toBe('sheetflow-site');
    expect(url.searchParams.get('utm_medium')).toBe('book-page');
    // The utm_* values must not leak who the person is.
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign']) {
      const v = url.searchParams.get(key) ?? '';
      expect(v).not.toContain('asha');
      expect(v).not.toContain('Asha');
    }
  });

  test('tierBookingUrl is a relative /book link that names the tier but never the visitor', () => {
    for (const tier of tiers) {
      const href = tierBookingUrl(tier);
      expect(href.startsWith('/book?'), href).toBe(true);
      const url = new URL(href, 'https://sheetflow.click');
      expect(url.pathname).toBe('/book');
      expect([...url.searchParams.keys()]).toEqual(['utm_source', 'utm_medium', 'utm_content']);
      expect(url.searchParams.get('utm_source')).toBe('sheetflow-site');
      expect(url.searchParams.get('utm_medium')).toBe('pricing');
      expect(url.searchParams.get('utm_content')).toBe(`tier-${tier.id}`);
      // The server keeps a utm value only if it matches its pattern.
      expect(url.searchParams.get('utm_content')).toMatch(/^[\w.\-~%+ ]{1,120}$/);
    }
  });

  test('composeNotes omits sections it has no answer for', () => {
    expect(composeNotes({ ...answers, sector: '', bottleneck: '', notes: '' })).toBe('');
    expect(composeNotes({ ...answers, notes: '' })).not.toContain('undefined');
  });
});

test.describe('discovery', () => {
  test('sitemap lists every content route', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    const expected = [
      '/',
      '/book',
      '/pricing',
      '/services',
      '/work',
      '/privacy',
      ...services.map((s) => `/services/${s.slug}`),
      ...projects.map((p) => `/work/${p.slug}`),
    ];
    for (const path of expected) {
      expect(xml, `sitemap is missing ${path}`).toContain(`<loc>`);
      expect(xml).toMatch(new RegExp(`<loc>[^<]*${path.replace(/\//g, '\\/')}<\\/loc>`));
    }
  });

  test('llms.txt describes the engagements and work, and forbids inventing prices or outcomes', async ({
    request,
  }) => {
    // This file is a directive addressed to the systems most likely to follow
    // it. Since D38 it must tell them there is no published price, and not to
    // estimate one.
    const body = await (await request.get('/llms.txt')).text();

    expect(body).toContain('does not publish fixed prices');
    for (const tier of tiers) expect(body).toContain(tier.name);
    expect(body).not.toContain('19,999');
    expect(body).not.toContain('4,999');
    for (const project of projects) {
      expect(body, `llms.txt does not mention ${project.client}`).toContain(project.client);
      expect(body).toContain(`/work/${project.slug}`);
    }
    expect(body).toContain('Not publicly disclosed.');
    expect(body.toLowerCase()).toContain('must not be inferred');

    // The stale claims must be gone.
    expect(body).not.toContain('SheetFlow publishes no customer names, outcome metrics');
  });

  test('the nav and footer reach the new routes', async ({ page }) => {
    await page.goto('/');
    for (const href of ['/work', '/pricing', '/book', '/privacy']) {
      await expect(
        page.locator(`a[href="${href}"]`).first(),
        `no link to ${href} from the homepage`,
      ).toBeAttached();
    }
  });
});
