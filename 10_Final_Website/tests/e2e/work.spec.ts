import { test, expect } from '@playwright/test';
import {
  projects,
  confidentialProjects,
  NOT_DISCLOSED_LABEL,
  INTERNAL_ONLY_LABEL,
  DEMO_BUILD_LABEL,
  CONFIDENTIAL_CLIENT_LABEL,
} from '../../src/content/work';
import { services } from '../../src/content/services';
import { KNOWN_STAGES } from '../../src/components/work/WorkflowGlyph';

/**
 * The case-study routes.
 *
 * Since D39 these pages describe real client work without naming the client,
 * which makes them the highest-consequence surface on the site: a regression
 * here either misrepresents someone else's business or quietly re-identifies
 * it. The assertions below are correspondingly strict about what may and may
 * not appear.
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

  test('groups the grid by evidence kind: client, then demonstration, then internal', async () => {
    // The lede directly above the grid introduces the three kinds in this
    // order, so a differently-ordered grid contradicts the sentence beside it.
    // It is also a visual constraint: interleaving means image cards and
    // text-only artifact tiles alternate, which is how RC1's screenshot pass
    // found the problem — two image cards stranded below five text tiles.
    const rank = (p: (typeof projects)[number]) =>
      p.evidence.kind === 'internal' ? 2 : p.evidence.origin === 'demonstration' ? 1 : 0;
    const seen = projects.map(rank);

    expect(
      seen,
      `grid is interleaved: ${projects.map((p) => `${p.slug}=${rank(p)}`).join(', ')}`,
    ).toEqual([...seen].sort((a, b) => a - b));
  });

  test('every published architecture stage has a WorkflowGlyph icon', async () => {
    /*
     * `WorkflowGlyph` keys its icons by the exact published stage string, and
     * falls back to a neutral mark for anything unkeyed. That fallback is a
     * safety net, not a rendering path: an unkeyed stage produces a diagram
     * where one node silently means nothing, on a page whose entire argument is
     * that its claims are checkable.
     *
     * Keying by exact string rather than by keyword inference is what makes the
     * gap detectable at all — a matcher would hand any new stage a
     * wrong-but-plausible icon and nothing would ever fail.
     */
    const published = [...new Set(projects.flatMap((p) => p.architecture.map((a) => a.stage)))];
    const unkeyed = published.filter((stage) => !KNOWN_STAGES.includes(stage));

    expect(
      unkeyed,
      `these architecture stages render the fallback icon: ${unkeyed.join(', ')}`,
    ).toEqual([]);
  });

  test('a compact stage label never contradicts the stage it shortens', async () => {
    /*
     * `short` exists so a long stage name fits under a 44px node. It is a
     * truncation of a published label, never a different claim — so it must
     * remain a recognisable prefix-word of the full name. "Publish to Excel" →
     * "Excel" is fine; "Publish to Excel" → "Export" would be a second,
     * unreviewed assertion about what the build does, rendered in the one place
     * a reader is most likely to skim.
     */
    for (const project of projects) {
      for (const stage of project.architecture) {
        if (!stage.short) continue;
        const words = stage.stage.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/);
        expect(
          words,
          `${project.slug}: short label "${stage.short}" is not a word of "${stage.stage}"`,
        ).toContain(stage.short.toLowerCase());
      }
    }
  });

  test('no card is wider than the grid that holds it, at any phone width', async ({ page }) => {
    /*
     * A document-level overflow check would NOT catch this, and that is the
     * point of asserting it here.
     *
     * One internal-build tile lists `scripts/lead_pipeline_manager.py — 446
     * lines` with `truncate`, i.e. `white-space: nowrap`. That gave the card a
     * 317px min-content; a grid item's default `min-width: auto` propagated it
     * to the column; and every card on the page was then pinned at 431px inside
     * a 382px container on a 430px phone. An ancestor's `overflow-x: clip`
     * swallowed the result, so `scrollWidth === clientWidth` stayed true and
     * the cards were simply cut off with no scrollbar to reveal it.
     *
     * Comparing each card against its own grid box is what makes the failure
     * visible.
     */
    for (const width of [360, 390, 430]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/work');

      const overflowing = await page.evaluate(() => {
        const grid = document.querySelector('div.grid');
        if (!grid) return ['no grid found'];
        const gridWidth = grid.getBoundingClientRect().width;
        return [...document.querySelectorAll('article')]
          .filter((card) => card.getBoundingClientRect().width > gridWidth + 1)
          .map((card) => {
            const href = card.querySelector('a')?.getAttribute('href') ?? '?';
            const w = Math.round(card.getBoundingClientRect().width);
            return `${href} is ${w}px in a ${Math.round(gridWidth)}px grid`;
          });
      });

      expect(overflowing, `cards overflow their grid at ${width}px`).toEqual([]);
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
      test('renders its heading, its disclosure and every section', async ({ page }) => {
        await page.goto(`/work/${project.slug}`);

        const h1 = page.locator('h1');
        await expect(h1).toHaveCount(1);
        await expect(h1).toHaveText(project.headline);

        // An anonymized build's argument is its disclosure, in words, above
        // the fold. An internal build's is its artifact ledger.
        if (project.evidence.kind === 'confidential') {
          await expect(
            page.getByText(project.evidence.disclosure, { exact: false }).first(),
            'the disclosure is not on the page',
          ).toBeVisible();
        } else {
          for (const artifact of project.evidence.artifacts) {
            await expect(
              page.getByText(artifact.name, { exact: false }).first(),
              `artifact "${artifact.name}" is not on the page`,
            ).toBeVisible();
          }
        }

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
        // Internal builds have no screenshot by construction — the `internal`
        // evidence variant has no `shot` field to point at an asset.
        const shot = project.evidence.kind === 'confidential' ? project.evidence.shot : undefined;
        test.skip(!shot, 'no screenshot exists for this build');
        if (!shot) return;

        await page.goto(`/work/${project.slug}`);
        const img = page.locator(`img[alt="${shot.alt}"]`).first();
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
        // No build links out any more (D39): a client deployment would name the
        // client, and internal builds have none.
        expect(work!.url).toBeUndefined();
        expect(work!.about).toBeUndefined();

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

        // Retried once. These are edge-rendered at ~2.3s each and the suite
        // requests them in parallel across two projects; RC1 hit `ECONNRESET`
        // here while direct fetches of the same route succeeded six times out
        // of six. Same rule as the reachability check below — one failed
        // request is not a finding.
        for (const src of declared) {
          const target = new URL(src).pathname;
          let response = await request.get(target).catch(() => null);
          if (!response || response.status() !== 200) {
            response = await request.get(target, { timeout: 45_000 });
          }
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

  test('anonymized builds link nowhere and name no client (D39)', async ({ page }) => {
    // The failure this guards against is re-identification by the back door:
    // an outbound link to the deployment, a client organisation in the graph,
    // or an old client slug resurfacing. Every confidential build is checked,
    // client and demonstration alike.
    const builds = confidentialProjects();
    expect(builds.length, 'no anonymized builds to check').toBeGreaterThan(0);

    for (const project of builds) {
      await page.goto(`/work/${project.slug}`);

      await expect(
        page
          .getByText(
            project.evidence.origin === 'demonstration' ? DEMO_BUILD_LABEL : CONFIDENTIAL_CLIENT_LABEL,
            { exact: false },
          )
          .first(),
        `${project.slug} does not state what kind of build it is`,
      ).toBeVisible();

      // No link inside the case study may leave the site.
      const external = await page.$$eval('main a[href^="http"]', (as) =>
        as
          .map((a) => (a as HTMLAnchorElement).href)
          .filter((h) => !h.startsWith(window.location.origin)),
      );
      expect(external, `${project.slug} links out: ${external.join(', ')}`).toEqual([]);

      const nodes = await graph(page);
      const work = byType(nodes, 'CreativeWork')!;
      expect(work.url, `${project.slug} emitted a deployment URL`).toBeUndefined();
      expect(work.about, `${project.slug} named a client organisation`).toBeUndefined();
    }
  });

  test('old client URLs redirect to the work index, not to their archetype', async ({ page }) => {
    // A one-to-one redirect would publish the mapping anonymization removes.
    for (const old of [
      'saraswati-dental-clinic',
      'sparc-physiotherapy',
      'r3s-realty',
      'ak-dental-diagnostic-centre',
      'align-dental-system',
    ]) {
      const response = await page.goto(`/work/${old}`);
      expect(response?.ok(), `/work/${old} did not resolve`).toBe(true);
      expect(new URL(page.url()).pathname, `/work/${old} landed somewhere other than /work`).toBe('/work');
    }
  });

  test('demonstration builds stay labelled as demonstrations', async ({ page }) => {
    // D32's distinction survives anonymization: an uncommissioned build must
    // never drift into reading as client work.
    const demos = confidentialProjects().filter((p) => p.evidence.origin === 'demonstration');
    expect(demos.length, 'no demonstration builds to check').toBeGreaterThan(0);

    for (const project of demos) {
      await page.goto(`/work/${project.slug}`);
      await expect(
        page.getByText(DEMO_BUILD_LABEL, { exact: false }).first(),
        `${project.slug} does not state that it is a demonstration build`,
      ).toBeVisible();
      const work = byType(await graph(page), 'CreativeWork')!;
      expect(String(work.name)).toContain('demonstration build');
    }
  });

  test('internal builds publish no outbound project link and no client entity', async ({
    page,
  }) => {
    // The failure this guards against is an internal build drifting into
    // looking like client work: an external link a visitor cannot open, or a
    // schema `about` naming an organisation that never commissioned anything.
    for (const project of projects.filter((p) => p.evidence.kind === 'internal')) {
      await page.goto(`/work/${project.slug}`);

      await expect(
        page.getByText(INTERNAL_ONLY_LABEL, { exact: false }).first(),
        `${project.slug} does not state that it is an internal build`,
      ).toBeVisible();

      const nodes = await graph(page);
      const work = byType(nodes, 'CreativeWork')!;
      expect(work.url, `${project.slug} emitted a project URL`).toBeUndefined();
      expect(work.about, `${project.slug} named a client organisation`).toBeUndefined();
      expect(work.image, `${project.slug} referenced a screenshot it has none of`).toBeUndefined();
    }
  });
});
