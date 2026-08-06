import { test, expect } from '@playwright/test';
import { faqs } from '../../src/content/faq';

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
