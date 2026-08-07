import { test, expect } from '@playwright/test';
import { projects, NOT_DISCLOSED_LABEL } from '../../src/content/work';
import { services } from '../../src/content/services';

/**
 * The case-study routes.
 *
 * These pages publish third-party company names under a written permission
 * (D24), which makes them the highest-consequence surface on the site: a
 * regression here misrepresents someone else's business, not just ours. The
 * assertions below are correspondingly strict about what may and may not
 * appear.
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

test.describe('work index', () => {
  test('lists every project and links to each case study', async ({ page }) => {
    await page.goto('/work');
    await expect(page.locator('h1')).toHaveText('Built, deployed, and still running.');

    for (const project of projects) {
      const link = page.locator(`a[href="/work/${project.slug}"]`).first();
      await expect(link, `no link to /work/${project.slug}`).toBeVisible();
    }
  });

  test('emits a CollectionPage whose parts resolve to the project nodes', async ({ page }) => {
    await page.goto('/work');
    const nodes = await graph(page);
    const collection = byType(nodes, 'CollectionPage');
    expect(collection, 'missing CollectionPage').toBeTruthy();

    const parts = collection!.hasPart as Array<{ '@id': string }>;
    expect(parts).toHaveLength(projects.length);
    for (const part of parts) {
      expect(part['@id']).toMatch(/\/work\/[a-z0-9-]+#project$/);
    }
  });
});

test.describe('case studies', () => {
  for (const project of projects) {
    test.describe(project.slug, () => {
      test('renders its heading, live link and every section', async ({ page }) => {
        await page.goto(`/work/${project.slug}`);

        const h1 = page.locator('h1');
        await expect(h1).toHaveCount(1);
        await expect(h1).toHaveText(project.headline);

        // The live link is the page's entire verifiability argument.
        await expect(
          page.locator(`a[href="${project.liveUrl}"]`).first(),
          'no link to the live deployment',
        ).toBeVisible();

        for (const stage of project.architecture) {
          await expect(page.getByRole('heading', { name: stage.stage, exact: true })).toBeVisible();
        }
        for (const decision of project.decisions) {
          await expect(
            page.getByRole('heading', { name: decision.title, exact: true }),
          ).toBeVisible();
        }
      });

      test('the screenshot loads and is not a broken image', async ({ page }) => {
        await page.goto(`/work/${project.slug}`);
        const img = page.locator(`img[alt="${project.shot.alt}"]`).first();
        await expect(img).toBeVisible();

        // `next/image` renders an <img> even when the source 404s; only
        // naturalWidth distinguishes a decoded image from a broken one.
        await expect
          .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth), {
            message: 'screenshot decoded to zero width — the asset is missing',
            timeout: 15_000,
          })
          .toBeGreaterThan(0);
      });

      test('emits one graph with a CreativeWork, and exactly one WebSite', async ({ page }) => {
        await page.goto(`/work/${project.slug}`);
        const nodes = await graph(page);

        const work = byType(nodes, 'CreativeWork');
        expect(work, 'missing CreativeWork node for the project').toBeTruthy();
        expect(work!.url).toBe(project.liveUrl);

        // Regression guard. The project node was originally typed `WebSite`,
        // which put two WebSite entities in one graph — Google reads that type
        // to resolve site name and sitelinks, so the second one is an
        // ambiguity with no upside.
        const websites = nodes.filter((n) => n['@type'] === 'WebSite');
        expect(websites, 'more than one WebSite node in the graph').toHaveLength(1);
      });

      test('breadcrumb trail is Home › Work › project, and every crumb resolves', async ({
        page,
        request,
      }) => {
        await page.goto(`/work/${project.slug}`);
        const nodes = await graph(page);
        const crumb = byType(nodes, 'BreadcrumbList')!;
        const items = crumb.itemListElement as Array<{ position: number; name: string; item: string }>;

        expect(items.map((i) => i.name)).toEqual(['Home', 'Work', project.shortLabel]);
        expect(items.map((i) => i.position)).toEqual([1, 2, 3]);

        for (const item of items) {
          const path = new URL(item.item).pathname;
          const response = await request.get(path);
          expect(response.status(), `breadcrumb target ${path} is not reachable`).toBe(200);
        }
      });

      test('declares a canonical pointing at itself', async ({ page }) => {
        await page.goto(`/work/${project.slug}`);
        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
        expect(canonical, 'canonical missing').toBeTruthy();
        expect(new URL(canonical!).pathname).toBe(`/work/${project.slug}`);
      });

      test('its social image is declared and actually served', async ({ page, request }) => {
        await page.goto(`/work/${project.slug}`);
        const declared = await page
          .locator('meta[property="og:image"], meta[name="twitter:image"]')
          .evaluateAll((els) =>
            els.map((e) => e.getAttribute('content')).filter((v): v is string => !!v),
          );
        expect(declared.length, 'no social image declared').toBeGreaterThan(0);

        for (const src of declared) {
          const response = await request.get(new URL(src).pathname);
          expect(response.status(), `${src} did not return 200`).toBe(200);
          expect(response.headers()['content-type']).toMatch(/^image\//);
        }
      });

      test('FAQ markup matches the rendered answers exactly', async ({ page }) => {
        await page.goto(`/work/${project.slug}`);
        const nodes = await graph(page);
        const faqNode = byType(nodes, 'FAQPage')!;
        const questions = faqNode.mainEntity as Array<{
          name: string;
          acceptedAnswer: { text: string };
        }>;

        expect(questions).toHaveLength(project.faqs.length);

        // Answers must be in the DOM without interaction — an answer engine
        // quoting the page never clicks a disclosure widget.
        for (const q of questions) {
          await expect(
            page.getByText(q.acceptedAnswer.text, { exact: false }).first(),
            `answer not rendered: ${q.name}`,
          ).toBeVisible();
        }
      });
    });
  }
});

test.describe('governance — the permission boundary', () => {
  for (const project of projects) {
    test(`${project.slug} publishes no outcome figure it has not measured`, async ({ page }) => {
      await page.goto(`/work/${project.slug}`);

      if (project.outcome.disclosure === 'not-disclosed') {
        await expect(
          page.getByText(NOT_DISCLOSED_LABEL, { exact: false }).first(),
          'an undisclosed outcome must say so on the page',
        ).toBeVisible();
      }

      // The founder's permission (D24) is explicit that revenue, conversion,
      // ROI and customer metrics must not be fabricated. This scans the
      // rendered page for the shapes those claims take. It is a heuristic, and
      // it is deliberately loud: a genuine measured outcome arrives with a
      // `Verification`, and this assertion is updated with it.
      const body = (await page.locator('main').innerText()).toLowerCase();

      const forbidden: Array<[RegExp, string]> = [
        [/[+-]\s?\d+(\.\d+)?\s?%/, 'a signed percentage (e.g. "+38%")'],
        [/\b\d+(\.\d+)?x\s+(more|faster|higher|increase)/, 'a multiplier claim (e.g. "3x more")'],
        [/\b(increased|boosted|grew|doubled|tripled)\b/, 'an outcome verb'],
        [/\broi\b/, 'a return-on-investment claim'],
        [/\b\d+\s?(leads|bookings|patients|enquiries)\s+(per|a)\s+(day|week|month)/, 'a volume claim'],
      ];

      for (const [pattern, description] of forbidden) {
        expect(
          body,
          `case study appears to publish ${description}, which requires a verified measurement`,
        ).not.toMatch(pattern);
      }
    });
  }

  test('no Review, Rating or AggregateRating markup exists anywhere', async ({ page }) => {
    // Self-serving review markup is a Google manual-action risk, and no review
    // has been collected. Asserted on every content route rather than one,
    // because it only takes one page to earn the penalty.
    const routes = ['/', '/work', '/pricing', '/book', '/services', ...projects.map((p) => `/work/${p.slug}`)];

    for (const route of routes) {
      await page.goto(route);
      const html = await page.content();
      expect(html, `${route} contains review or rating markup`).not.toMatch(
        /"@type"\s*:\s*"(Review|AggregateRating|Rating)"/,
      );
    }
  });

  test('every service a project claims to use actually exists', async () => {
    // Drift here would have a case study advertising a service with no page —
    // an internal link to nothing, and a capability claim made in passing.
    const known = new Set(services.map((s) => s.slug));
    for (const project of projects) {
      for (const slug of project.services) {
        expect(known.has(slug), `${project.slug} references unknown service "${slug}"`).toBe(true);
      }
    }
  });

  test('every published live URL is reachable', async ({ request }) => {
    // These are third-party deployments we link to by name. If one goes down
    // or is replaced, the case study is making a claim about something that is
    // no longer there.
    for (const project of projects) {
      const response = await request.get(project.liveUrl, { timeout: 30_000 });
      expect(
        response.status(),
        `${project.client}: ${project.liveUrl} returned ${response.status()}`,
      ).toBe(200);
    }
  });
});
