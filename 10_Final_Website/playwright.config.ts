import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright runs against the PRODUCTION build, not `next dev`.
 *
 * Dev mode ships unminified bundles, no route pre-rendering and React's
 * development warnings, so accessibility and performance numbers taken there
 * describe a build nobody ships. `npm start` is what Vercel serves.
 *
 * The suite is deliberately small and behavioural. It exists to catch
 * regressions the type checker cannot see: broken links, console errors,
 * accessibility violations, layout overflow.
 */
export default defineConfig({
  testDir: './tests/e2e',

  /**
   * 90 s, not Playwright's 30 s default.
   *
   * Any spec here navigates to a page whose steady-state main thread is ~75%
   * paint and compositing (see TOOLING_MANIFEST.md), then waits for it to
   * settle. Standalone those tests take 4–15 s and pass. Run as a full suite —
   * two device projects, parallel workers, all loading the same heavy page —
   * they reach 28–38 s and hit the default, which reads as an accessibility or
   * markup regression that does not exist.
   *
   * This was first patched per-spec on a11y, and seo timed out next, which is
   * the tell that the default is wrong for this project rather than for one
   * file. 90 s is ~2.4x the worst observed run: enough headroom for a loaded
   * machine, still short enough that a genuinely wedged test fails rather than
   * hanging for minutes.
   */
  timeout: 90_000,

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run start',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        // A cold Next start on Windows can exceed the 60s default.
        timeout: 180_000,
      },
});
