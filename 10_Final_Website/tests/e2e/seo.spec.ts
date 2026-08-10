import { test, expect } from '@playwright/test';
import { faqs } from '../../src/content/faq';
import { services } from '../../src/content/services';

/**
 * Structured data and discoverability.
 *
 * These assert the invariants that make the page citable: that the entity
 * graph parses, that markup matches visible copy, and that the machine-readable
 * surfaces are actually served. All are silent failure modes — a malformed
 * @graph or an FAQ answer that drifts from its markup costs rich results
 * without breaking a single render.
 */

async function graph(page: import('@playwright/test').Page) {
  const blocks = await page.$$eval('script[type="application/ld+json"]', (els) =>
    els.map((e) => e.textContent ?? ''),
  );
  expect(blocks.length, 'expected exactly one JSON-LD block').toBe(1);
  const parsed = JSON.parse(blocks[0]);
  return parsed['@graph'] as Array<Record<string, unknown>>;
}

const byType = (nodes: Array<Record<string, unknown>>, type: string) =>
  nodes.find((n) => n['@type'] === type);

test.describe('structured data', () => {
  test('emits a single parseable @graph with the expected entities', async ({ page }) => {
    await page.goto('/');
    const nodes = await graph(page);

    for (const type of ['Organization', 'WebSite', 'WebPage', 'FAQPage']) {
      expect(byType(nodes, type), `missing ${type} node`).toBeTruthy();
    }
  });

  test('entity references resolve within the graph', async ({ page }) => {
    await page.goto('/');
    const nodes = await graph(page);
    const ids = new Set(nodes.map((n) => n['@id']).filter(Boolean));

    // A dangling @id reference makes the graph unresolvable — the exact
    // failure that silently costs rich results.
    const org = byType(nodes, 'Organization')!;
    const site = byType(nodes, 'WebSite')!;
    const web = byType(nodes, 'WebPage')!;

    expect(ids.has((site.publisher as { '@id': string })['@id'])).toBe(true);
    expect(ids.has((web.about as { '@id': string })['@id'])).toBe(true);
    expect(ids.has((web.isPartOf as { '@id': string })['@id'])).toBe(true);
    expect(org['@id']).toBeTruthy();
  });

  test('FAQ markup matches the rendered answers exactly', async ({ page }) => {
    await page.goto('/');
    const nodes = await graph(page);
    const faqNode = byType(nodes, 'FAQPage')!;
    const questions = faqNode.mainEntity as Array<{
      name: string;
      acceptedAnswer: { text: string };
    }>;

    expect(questions).toHaveLength(faqs.length);

    // Google treats FAQPage markup that does not appear on the page as spam.
    //
    // textContent, not innerText: the panels are collapsed by default, and
    // innerText returns only *visible* text, so it would report the answers as
    // missing when they are present in the markup. Content behind a disclosure
    // widget satisfies the guidance as long as it ships in the HTML — which is
    // exactly what a crawler parses.
    const bodyText = await page.locator('#faq').evaluate((el) => el.textContent ?? '');
    for (const q of questions) {
      expect(bodyText, `question not rendered: ${q.name}`).toContain(q.name);
      expect(bodyText, `answer not rendered: ${q.name}`).toContain(q.acceptedAnswer.text);
    }
  });

  test('Organization advertises its services', async ({ page }) => {
    await page.goto('/');
    const org = byType(await graph(page), 'Organization')!;
    const catalog = org.hasOfferCatalog as { itemListElement: unknown[] };
    expect(catalog.itemListElement.length).toBeGreaterThanOrEqual(6);
  });

  /**
   * GEO signals an assistant reads directly rather than inferring from prose.
   * Asserted so they cannot be dropped in a refactor without a failing test.
   */
  test('Organization carries reachable contact and expertise signals', async ({ page }) => {
    await page.goto('/');
    const org = byType(await graph(page), 'Organization')!;

    const contactPoints = org.contactPoint as Array<Record<string, unknown>>;
    expect(Array.isArray(contactPoints)).toBe(true);
    expect(contactPoints[0].telephone).toMatch(/^\+\d{10,15}$/);
    expect(String(contactPoints[0].url)).toContain('calendly.com');

    const knowsAbout = org.knowsAbout as string[];
    expect(knowsAbout.length).toBeGreaterThanOrEqual(6);
    // Every advertised service must be represented in the expertise signal,
    // or the two halves of the graph describe different businesses.
    expect(knowsAbout.join(' ').toLowerCase()).toContain('whatsapp');
    expect(knowsAbout.join(' ').toLowerCase()).toContain('crm');
  });

  /**
   * LocalBusiness requires a PostalAddress. SheetFlow publishes no address, so
   * claiming the type would fabricate business information — see the comment in
   * layout.tsx. This asserts the *absence* deliberately, so a future "add
   * LocalBusiness for local SEO" change has to confront the reason.
   */
  test('does not claim LocalBusiness without a verifiable address', async ({ page }) => {
    await page.goto('/');
    const nodes = await graph(page);
    const local = nodes.filter((n) =>
      String(n['@type']).match(/LocalBusiness|ProfessionalService/),
    );
    for (const node of local) {
      expect(node.address, 'LocalBusiness requires a real address').toBeTruthy();
    }
  });
});

test.describe('answer-engine surfaces', () => {
  test('/llms.txt is served and carries the citation guidance', async ({ request }) => {
    const res = await request.get('/llms.txt');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('text/plain');

    const body = await res.text();
    expect(body).toContain('# SheetFlow AI');
    // The guardrail that stops a model inventing results on our behalf.
    expect(body).toContain('do not');
    for (const f of faqs) expect(body, `llms.txt missing: ${f.question}`).toContain(f.question);
  });

  test('robots.txt names AI crawlers and points at the sitemap', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text();
    for (const agent of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
      expect(body, `robots.txt does not mention ${agent}`).toContain(agent);
    }
    expect(body).toContain('Sitemap:');
  });

  test('sitemap.xml is well-formed and lists the canonical URL', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('<urlset');
    expect(body).toMatch(/<loc>https?:\/\/[^<]+<\/loc>/);
  });
});

test.describe('FAQ section', () => {
  test('answers are in the DOM without interaction', async ({ page }) => {
    await page.goto('/');
    // Crawlers and LLM retrievers do not click. Native <details> keeps the
    // text present whether or not the panel is open.
    const html = await page.locator('#faq').innerHTML();
    for (const f of faqs) expect(html).toContain(f.answer.slice(0, 60));
  });

  test('each answer is individually linkable', async ({ page }) => {
    await page.goto('/');
    for (const f of faqs) {
      await expect(page.locator(`#${f.id}`), `#${f.id} missing`).toHaveCount(1);
    }
  });

  test('disclosure is keyboard operable', async ({ page }) => {
    await page.goto('/');
    const first = page.locator('#faq details').first();
    await expect(first).not.toHaveAttribute('open', '');
    await first.locator('summary').press('Enter');
    await expect(first).toHaveAttribute('open', '');
  });
});

/**
 * Service sub-pages — the topic clusters.
 *
 * These assert the invariants that a multi-route site can break and a
 * single-route one could not: a sub-page declaring the homepage canonical (and
 * so asking to be de-indexed), a breadcrumb naming a URL that 404s, or a
 * `Service` node advertising something no page describes.
 */
test.describe('service pages', () => {
  test('the homepage still carries no BreadcrumbList', async ({ page }) => {
    await page.goto('/');
    const nodes = await graph(page);
    // A breadcrumb trail for a page with no ancestors is schema spam. The
    // sub-pages earned one; the homepage did not, and asserting the absence
    // stops "add breadcrumbs everywhere" landing without a reason.
    expect(byType(nodes, 'BreadcrumbList')).toBeFalsy();
  });

  test('the services index links to every service', async ({ page }) => {
    await page.goto('/services');
    for (const s of services) {
      await expect(
        page.locator(`a[href="/services/${s.slug}"]`).first(),
        `index does not link to ${s.slug}`,
      ).toBeVisible();
    }
  });

  for (const service of services) {
    test(`${service.slug}: graph carries Service, WebPage, BreadcrumbList and FAQPage`, async ({
      page,
    }) => {
      await page.goto(`/services/${service.slug}`);
      const nodes = await graph(page);

      for (const type of ['Organization', 'WebSite', 'Service', 'WebPage', 'BreadcrumbList', 'FAQPage']) {
        expect(byType(nodes, type), `missing ${type} node`).toBeTruthy();
      }

      const svc = byType(nodes, 'Service')!;
      expect(svc.name).toBe(service.name);
      expect(svc.serviceType).toBe(service.serviceType);
      // The service must still be attributed to the organisation, or the page
      // describes an offering with no provider.
      const ids = new Set(nodes.map((n) => n['@id']).filter(Boolean));
      expect(ids.has((svc.provider as { '@id': string })['@id'])).toBe(true);
    });

    test(`${service.slug}: breadcrumb is ordered and every crumb resolves`, async ({
      page,
      request,
    }) => {
      await page.goto(`/services/${service.slug}`);
      const crumb = byType(await graph(page), 'BreadcrumbList')!;
      const items = crumb.itemListElement as Array<{ position: number; name: string; item: string }>;

      expect(items, 'expected Home / Services / <service>').toHaveLength(3);
      expect(items.map((i) => i.position)).toEqual([1, 2, 3]);
      expect(items[2].name).toBe(service.shortLabel);

      // The failure this exists for: a trail that names a URL nobody built.
      for (const item of items) {
        const res = await request.get(new URL(item.item).pathname);
        expect(res.status(), `breadcrumb target 404s: ${item.item}`).toBe(200);
      }

      // The visible trail must match the markup — schema without the rendered
      // trail is what gets breadcrumb markup flagged.
      const visible = await page.locator('nav[aria-label="Breadcrumb"]').innerText();
      for (const item of items) expect(visible).toContain(item.name);
    });

    test(`${service.slug}: declares its own canonical, not the homepage's`, async ({ page }) => {
      await page.goto(`/services/${service.slug}`);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical, 'no canonical emitted').toBeTruthy();
      expect(new URL(canonical!).pathname).toBe(`/services/${service.slug}`);
    });

    test(`${service.slug}: FAQ markup matches the rendered answers`, async ({ page }) => {
      await page.goto(`/services/${service.slug}`);
      const faqNode = byType(await graph(page), 'FAQPage')!;
      const questions = faqNode.mainEntity as Array<{
        name: string;
        acceptedAnswer: { text: string };
      }>;

      expect(questions).toHaveLength(service.faqs.length);

      const text = await page.locator('#faq').evaluate((el) => el.textContent ?? '');
      for (const q of questions) {
        expect(text, `question not rendered: ${q.name}`).toContain(q.name);
        expect(text, `answer not rendered: ${q.name}`).toContain(q.acceptedAnswer.text);
      }
    });

    test(`${service.slug}: has exactly one h1 and no skipped heading levels`, async ({ page }) => {
      await page.goto(`/services/${service.slug}`);
      await expect(page.locator('h1')).toHaveCount(1);

      const levels = await page.$$eval('h1,h2,h3,h4,h5,h6', (els) =>
        els.map((e) => Number(e.tagName[1])),
      );
      let previous = levels[0];
      for (const level of levels.slice(1)) {
        expect(level - previous, `heading jumped from h${previous} to h${level}`).toBeLessThanOrEqual(1);
        previous = level;
      }
    });
  }

  /**
   * Social cards.
   *
   * Next.js `opengraph-image` conventions apply to the segment that declares
   * them and are **not** inherited by children. Phase G therefore shipped five
   * routes announcing `summary_large_image` with no image behind it — a
   * declared large-image card with nothing to show, which renders as a bare
   * text link everywhere it is pasted and fails Twitter's validator.
   *
   * Asserted on every route, homepage included, because the failure is
   * invisible on the page itself.
   */
  for (const path of ['/', '/services', ...services.map((s) => `/services/${s.slug}`)]) {
    test(`${path}: declares an OG and Twitter image, and both are served`, async ({
      page,
      request,
    }) => {
      await page.goto(path);

      const og = await page.locator('meta[property="og:image"]').first().getAttribute('content');
      const tw = await page.locator('meta[name="twitter:image"]').first().getAttribute('content');
      expect(og, `${path} declares no og:image`).toBeTruthy();
      expect(tw, `${path} declares no twitter:image`).toBeTruthy();

      // A declared image that 404s is the same failure with extra steps.
      //
      // Retried, for the reason this repository has now recorded four times:
      // **one failed request is not a finding.** These are edge-rendered and
      // each takes ~2.3s to produce; the suite asks for roughly twenty of them
      // across two parallel projects, and the origin resets connections under
      // that load. RC1 saw exactly that — `ECONNRESET` on `/` in one run and on
      // `/services` in the next, while six consecutive direct fetches of the
      // same route returned 200 `image/png` at an identical 67,831 bytes.
      //
      // A route that is genuinely missing fails both attempts. A contended one
      // does not, and should not spend a release on being re-investigated.
      for (const url of [og!, tw!]) {
        const target = new URL(url).pathname + new URL(url).search;
        let res = await request.get(target).catch(() => null);
        if (!res || res.status() !== 200) {
          res = await request.get(target, { timeout: 45_000 });
        }
        expect(res.status(), `image does not resolve: ${url}`).toBe(200);
        expect(res.headers()['content-type']).toContain('image/');
      }

      // summary_large_image is what the layout declares site-wide; if a route
      // ever drops to `summary` this catches the mismatch rather than the card
      // just looking wrong in someone's DM.
      const card = await page.locator('meta[name="twitter:card"]').first().getAttribute('content');
      expect(card).toBe('summary_large_image');
    });
  }

  test('sitemap lists the index and every service route', async ({ request }) => {
    const body = await (await request.get('/sitemap.xml')).text();
    expect(body).toContain('/services</loc>');
    for (const s of services) {
      expect(body, `sitemap missing /services/${s.slug}`).toContain(`/services/${s.slug}</loc>`);
    }
  });

  test('llms.txt points answer engines at the service pages', async ({ request }) => {
    const body = await (await request.get('/llms.txt')).text();
    for (const s of services) {
      expect(body, `llms.txt missing ${s.slug}`).toContain(`/services/${s.slug}`);
      for (const f of s.faqs) {
        expect(body, `llms.txt missing question: ${f.question}`).toContain(f.question);
      }
    }
  });
});

/**
 * Content governance, asserted rather than trusted.
 *
 * Both of these are the kind of claim that gets added in passing during a copy
 * edit and never reviewed: a service the graph advertises but no page
 * describes, or an integration named on a service page that the site has never
 * claimed anywhere else. Neither is visible in a diff review.
 */
test.describe('service content governance', () => {
  test('every service page matches its entry in the offer catalogue', async ({ page }) => {
    await page.goto('/');
    const org = byType(await graph(page), 'Organization')!;
    const offers = (org.hasOfferCatalog as { itemListElement: Array<{ itemOffered: Record<string, unknown> }> })
      .itemListElement.map((o) => o.itemOffered);

    for (const s of services) {
      const match = offers.find((o) => o.serviceType === s.serviceType);
      expect(match, `catalogue has no offer for serviceType "${s.serviceType}"`).toBeTruthy();
      expect(match!.name, `name drift for ${s.slug}`).toBe(s.name);
      expect(match!.url, `catalogue offer for ${s.slug} does not link to its page`).toContain(
        `/services/${s.slug}`,
      );
    }
  });

  test('every catalogued service has a page — the other direction', async ({ page }) => {
    /**
     * The assertion above walks pages → catalogue, so it can only catch a page
     * that drifted from its offer. It is blind to the opposite failure, and
     * that failure had actually shipped: `Daily Business Reports` and
     * `Invoice Reminders` sat in `hasOfferCatalog` for two phases with **no
     * page behind them**. A consumer following the catalogue found an `Offer`
     * with no `url` and nothing to cite — the schema equivalent of a dead link,
     * and invisible to every test that started from the pages.
     */
    await page.goto('/');
    const org = byType(await graph(page), 'Organization')!;
    const offers = (org.hasOfferCatalog as { itemListElement: Array<{ itemOffered: Record<string, unknown> }> })
      .itemListElement.map((o) => o.itemOffered);

    const pagedTypes = new Set(services.map((s) => s.serviceType));
    const orphans = offers
      .filter((o) => !pagedTypes.has(o.serviceType as string))
      .map((o) => `${o.name} (${o.serviceType})`);

    expect(
      orphans,
      `catalogue advertises services with no page:\n  ${orphans.join('\n  ')}`,
    ).toEqual([]);

    // Every offer must also carry a resolvable url, which only holds once the
    // page exists — the two conditions are separate and both are required.
    for (const offer of offers) {
      expect(offer.url, `catalogue offer "${offer.name}" has no url`).toBeTruthy();
    }
  });

  test('service pages name no integration the site has not already claimed', () => {
    // The integrations answer on the homepage is the whole published list.
    // Anything outside it is a new capability claim made in passing.
    const published = faqs.find((f) => f.id === 'faq-integrations')!.answer;
    for (const s of services) {
      for (const tool of s.integrations) {
        expect(
          published,
          `${s.slug} claims "${tool}", which is not in the published integrations list`,
        ).toContain(tool);
      }
    }
  });
});
