import { test, expect } from '@playwright/test';
import {
  BASIS_LABEL,
  KIND_LABEL,
  OUTCOME_LABEL,
  dashboardStories,
  featuredStories,
} from '../../src/content/dashboards';

/**
 * Dashboard stories obey the same evidence rules as the case studies (D24, D34, D37).
 *
 * The content module's types make a story without a data basis impossible to write;
 * these tests check the *page*: that what the types guarantee is what a visitor reads,
 * that no figure a story did not measure appears in its text, and that every frame
 * is a real, described image.
 */

test.describe('dashboard stories', () => {
  test('/work shows all four stories, each stating its data basis and the one outcome line', async ({ page }) => {
    await page.goto('/work');
    const stories = page.locator('#dashboards article.story');
    await expect(stories).toHaveCount(dashboardStories.length);

    for (const s of dashboardStories) {
      const story = page.locator(`article[aria-labelledby="story-${s.slug}"]`);
      await expect(story).toContainText(s.client);
      await expect(story).toContainText(KIND_LABEL[s.kind]);
      await expect(story).toContainText(BASIS_LABEL[s.basis.kind]);
      await expect(story).toContainText(s.basis.note);
      await expect(story).toContainText(`Outcome: ${OUTCOME_LABEL}`);
    }
  });

  test('the homepage shows the two featured stories', async ({ page }) => {
    await page.goto('/');
    const stories = page.locator('#customers article.story');
    await expect(stories).toHaveCount(featuredStories().length);
  });

  test('the luxury retail flow is presented as an engineering showcase, never as a client engagement', async ({ page }) => {
    await page.goto('/work');
    const hem = page.locator('article[aria-labelledby="story-luxury-retail-flow"]');
    await expect(hem).toContainText('Engineering showcase');
    await expect(hem).toContainText('not a client engagement');
    await expect(hem).toContainText('Seeded demonstration data');
  });

  test('no story invents a result: no percentages, uplifts or money in the narrative text', async ({ page }) => {
    await page.goto('/work');
    const text = await page.locator('#dashboards .scene-copy, #dashboards .story-summary').allInnerTexts();
    const joined = text.join('\n');
    expect(joined).not.toMatch(/\d+\s?%/);
    expect(joined).not.toMatch(/[+↑]\s?\d/);
    expect(joined).not.toMatch(/[₹$€]\s?\d/);
  });

  test('every frame is a loaded image with a real description', async ({ page }) => {
    await page.goto('/work');
    // lazy images: scroll the stories region through the viewport so they all load
    await page.evaluate(async () => {
      const el = document.querySelector('#dashboards') as HTMLElement;
      const top = el.getBoundingClientRect().top + window.scrollY;
      for (let y = top; y < top + el.offsetHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
    });
    const total = dashboardStories.reduce((n, s) => n + s.scenes.length, 0);
    // Lazy images decode asynchronously after they enter the viewport; poll instead of sampling once.
    await expect
      .poll(
        () => page.$$eval('#dashboards .scene-img', (els) => els.filter((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0).length),
        { timeout: 30_000, message: 'every story frame should finish loading' },
      )
      .toBe(total);
    const alts = await page.$$eval('#dashboards .scene-img', (els) => els.map((i) => (i as HTMLImageElement).alt));
    expect(alts.length).toBe(total);
    for (const alt of alts) expect(alt.length).toBeGreaterThan(25);
  });

  test('external story links open safely and internal ones resolve', async ({ page, request }) => {
    await page.goto('/work');
    for (const s of dashboardStories) {
      if (!s.link) continue;
      const a = page.locator(`article[aria-labelledby="story-${s.slug}"] a.story-link`);
      await expect(a).toHaveAttribute('href', s.link.href);
      if (s.link.external) {
        await expect(a).toHaveAttribute('rel', /noopener/);
        await expect(a).toHaveAttribute('target', '_blank');
      } else {
        expect((await request.get(s.link.href)).status()).toBe(200);
      }
    }
  });

  test('desktop scenes stack (sticky) from 1024px up', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'stacking is a desktop layout');
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/work');
    const pos = await page.$$eval('#dashboards .scene[data-device="desktop"]', (els) =>
      els.map((e) => getComputedStyle(e).position),
    );
    expect(pos.length).toBeGreaterThan(0);
    expect(new Set(pos)).toEqual(new Set(['sticky']));
  });

  test('the sanitized internal story leaks nothing: no paths, secrets, e-mail addresses or lead counts', async ({ page }) => {
    await page.goto('/work');
    const ops = page.locator('article[aria-labelledby="story-sheetflow-operations"]');
    // The basis note may *name* what was removed ("credential details and file paths"); what must never appear is the
    // removed material itself, in the narrative text or in a frame's description.
    const narrative = (await ops.locator('.story-summary, .scene-copy').allInnerTexts()).join('\n');
    const text = narrative + (await ops.locator('img').evaluateAll((els) => els.map((e) => (e as HTMLImageElement).alt).join(' ')));
    expect(text).not.toMatch(/[A-Za-z]:\\/);
    expect(text).not.toMatch(/secret|token|credential|password|api key/i);
    expect(text).not.toMatch(/@[a-z0-9.-]+\.[a-z]{2,}/i);
    expect(text).not.toMatch(/scrap|unverified/i);
  });
});
