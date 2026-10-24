import { test, expect } from '@playwright/test';

/**
 * Theme: Light is the default, Dark is a choice.
 *
 * The founder's rule (2026-10-21, D36): the site loads in Light mode regardless
 * of the operating-system setting, with a Dark toggle in the navigation. These
 * tests pin that down, because the failure mode is silent: a `prefers-color-scheme`
 * rule added later would make the site open dark for half its visitors and no
 * other test would notice.
 */

const LIGHT_BG = 'rgb(246, 247, 250)';
const DARK_BG = 'rgb(6, 6, 8)';

test.describe('theme', () => {
  test('the served HTML is already Light, before any script runs', async ({ request }) => {
    const html = await (await request.get('/')).text();
    expect(html).toMatch(/<html[^>]*data-theme="light"/);
  });

  test('loads in Light even when the operating system prefers dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe(LIGHT_BG);
  });

  test('the toggle switches to Dark, remembers it across a reload, and switches back', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    await page.getByRole('button', { name: /switch to dark mode/i }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor))
      .toBe(DARK_BG);

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    const back = page.getByRole('button', { name: /switch to light mode/i });
    await expect(back).toHaveAttribute('aria-pressed', 'true');
    await back.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('a saved choice never leaks between visitors: a fresh context is Light again', async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await ctx.close();
  });

  test('the hero stays a dark stage inside the Light page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    const hero = page.locator('[data-stage="band"]').first();
    await expect(hero).toHaveAttribute('data-theme', 'dark');
    const bg = await hero.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe(DARK_BG);
  });

  test('the toggle is a real button with a name and a state', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /switch to dark mode/i });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});
