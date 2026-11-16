import { test, expect, type BrowserContext, type Page, type Route } from '@playwright/test';

import { AI_TRAINING_LABEL, PRIVACY_NOTICE_VERSION } from '../../src/content/privacy';
import { tiers } from '../../src/content/pricing';
import { BOTTLENECKS, SECTORS, tierBookingUrl } from '../../src/lib/booking';

/**
 * The /book submission, end to end against the production build (D47).
 *
 * The form POSTs to our own /api/intake, which captures the lead and answers
 * 303 to the booking page. These tests drive that with a real browser, with and
 * without JavaScript, and never let it reach the booking host.
 *
 * ## How the booking host is kept out of reach
 *
 * Playwright does not route the request a redirect leads to, so a stub on
 * calendly.com or cal.com alone would not stop the browser following the 303
 * for real. Each submission is therefore caught at /api/intake itself: the
 * test forwards the browser's exact request to the real local server with
 * `route.fetch({ maxRedirects: 0 })`, reads the 303 it answers, and gives the
 * browser a local stub page instead of the redirect. A catch-all route stubs or
 * aborts any other request to another host, and every test asserts that no
 * request to another host was made at all.
 *
 * The suite runs with SF_INTAKE_* and CAL_BOOKING_URL unset, so the server logs
 * `not_configured` and redirects to the Calendly fallback; the assertions
 * accept the Cal.com shape too, in case CAL_BOOKING_URL is ever set locally.
 */

const FIELDS = {
  name: 'Asha Verma',
  email: 'asha.verma@example.com',
  sector: SECTORS[1],
  bottleneck: BOTTLENECKS[0],
  notes: 'Two clinics, enquiries mostly on WhatsApp.',
};
const BOOKING_HOSTS = /(^|\.)(calendly\.com|cal\.com)$/i;
const isLocal = (url: URL) => url.hostname === 'localhost' || url.hostname === '127.0.0.1';

type Capture = {
  /** Bodies of the POSTs that reached /api/intake, in order. */
  posts: string[];
  /** The Location of each 303 the server answered. */
  locations: string[];
  /** Every request the browser tried to make to another host. */
  external: string[];
};

/**
 * Keeps the context on this machine: records every attempt to reach another
 * host, stubs the booking hosts, aborts the rest, and catches the intake
 * response before the browser can follow its redirect.
 */
async function guard(context: BrowserContext, options: { delayMs?: number } = {}): Promise<Capture> {
  const capture: Capture = { posts: [], locations: [], external: [] };
  context.on('request', (request) => {
    if (!isLocal(new URL(request.url()))) capture.external.push(request.url());
  });
  await context.route(
    (url) => !isLocal(url),
    async (route: Route) => {
      const host = new URL(route.request().url()).hostname;
      if (BOOKING_HOSTS.test(host)) {
        await route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>stub</title><h1>Booking page stub</h1>' });
      } else {
        await route.abort();
      }
    },
  );
  await context.route('**/api/intake', async (route: Route) => {
    capture.posts.push(route.request().postData() ?? '');
    if (options.delayMs) await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    const response = await route.fetch({ maxRedirects: 0 });
    const location = response.headers()['location'] ?? '';
    capture.locations.push(location);
    const target = new URL(location, route.request().url());
    if (response.status() === 303 && isLocal(target)) {
      // A redirect back to our own site (the invalid path) is safe to follow.
      await route.fulfill({ response });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `<!doctype html><title>stub</title><h1>Booking page stub</h1><p id="status">${response.status()}</p>`,
    });
  });
  return capture;
}

async function fill(page: Page, fields = FIELDS) {
  await page.locator('input[name="name"]').fill(fields.name);
  await page.locator('input[name="email"]').fill(fields.email);
  await page.locator('select[name="sector"]').selectOption(fields.sector);
  await page.locator('select[name="bottleneck"]').selectOption(fields.bottleneck);
  await page.locator('textarea[name="notes"]').fill(fields.notes);
}

/** The prefill a booking link carries, read the same way for Calendly (`a1`) and Cal.com (`notes`). */
function prefill(location: string) {
  const url = new URL(location);
  return {
    host: url.hostname,
    name: url.searchParams.get('name'),
    email: url.searchParams.get('email'),
    notes: url.searchParams.get('notes') ?? url.searchParams.get('a1') ?? '',
  };
}

function expectBookingLink(location: string) {
  const link = prefill(location);
  expect(link.host, `not a booking host: ${location}`).toMatch(BOOKING_HOSTS);
  expect(link.name).toBe(FIELDS.name);
  expect(link.email).toBe(FIELDS.email);
  expect(link.notes).toContain(FIELDS.sector);
  expect(link.notes).toContain(FIELDS.bottleneck);
  expect(link.notes).toContain(FIELDS.notes);
}

test.describe('booking submission', () => {
  test('with no JavaScript: the browser POSTs, the server answers 303 to the prefilled booking page', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const capture = await guard(context);
    const page = await context.newPage();
    await page.goto('/book');
    await fill(page);
    await page.getByRole('button', { name: 'Choose a time' }).click();
    await expect(page.locator('h1')).toHaveText('Booking page stub');

    expect(capture.posts).toHaveLength(1);
    const body = new URLSearchParams(capture.posts[0]);
    expect(body.get('name')).toBe(FIELDS.name);
    expect(body.get('email')).toBe(FIELDS.email);
    expect(body.get('notes')).toBe(FIELDS.notes);
    expect(body.get('website'), 'the honeypot is sent empty').toBe('');
    expect(body.has('ai_training'), 'an unticked checkbox sends nothing').toBe(false);
    // The notice version is static HTML, so it is sent without JavaScript too.
    expect(body.get('notice_version')).toBe(PRIVACY_NOTICE_VERSION);
    // No JavaScript, so no attribution inputs exist to send.
    expect(body.has('page')).toBe(false);

    expect(capture.locations).toHaveLength(1);
    expectBookingLink(capture.locations[0]);
    expect(capture.external, `requests left this machine: ${capture.external.join(', ')}`).toEqual([]);
    await context.close();
  });

  test('with JavaScript: the same POST, one submission and one analytics event on a double click', async ({ browser }) => {
    const context = await browser.newContext();
    // The intake answer is held back, so the page stays alive mid-submit.
    const capture = await guard(context, { delayMs: 3000 });
    const page = await context.newPage();
    await page.goto('/book?utm_source=newsletter&utm_campaign=nov-2026&gclid=TEST123');
    await fill(page);

    // While a form navigation is pending, Playwright's locators wait for it to
    // finish, so the in-flight state is reported by the page itself instead:
    // every submit event (and whether it was cancelled), every change to the
    // form, and every analytics event, as console lines.
    const lines: string[] = [];
    page.on('console', (message) => lines.push(message.text()));
    await page.evaluate(() => {
      const form = document.querySelector('form')!;
      const button = form.querySelector('button[type="submit"]')!;
      const report = () =>
        console.log(`state:${JSON.stringify({ busy: form.getAttribute('aria-busy'), label: button.textContent })}`);
      new MutationObserver(report).observe(form, { attributes: true, subtree: true, childList: true, characterData: true });
      // Read once the event has finished dispatching, after React's handler ran.
      form.addEventListener('submit', (event) => setTimeout(() => console.log(`submit:${event.defaultPrevented}`), 0));
      const w = window as unknown as { va?: (...args: unknown[]) => void };
      const original = w.va;
      w.va = (...args: unknown[]) => {
        if (args[0] === 'event') console.log(`va-event:${JSON.stringify(args[1])}`);
        return original?.(...args);
      };
    });

    await page.locator('form button[type="submit"]').dblclick();
    await expect(page.locator('h1')).toHaveText('Booking page stub', { timeout: 15_000 });

    expect(capture.posts, 'a double click must not send the lead twice').toHaveLength(1);
    expect(lines.filter((l) => l.startsWith('submit:')), 'the second submit must be cancelled').toEqual([
      'submit:false',
      'submit:true',
    ]);
    const states = lines.filter((l) => l.startsWith('state:')).map((l) => JSON.parse(l.slice(6)));
    expect(states).toContainEqual({ busy: 'true', label: 'Taking you to the calendar…' });
    const events = lines.filter((l) => l.startsWith('va-event:')).map((l) => JSON.parse(l.slice(9)));
    expect(events.filter((e) => e.name === 'booking_qualified')).toHaveLength(1);
    // The two select answers only: never the name, email or notes. This is
    // exactly what the /book notice and /privacy disclose for site analytics.
    expect(events[0].data).toEqual({ sector: FIELDS.sector, bottleneck: FIELDS.bottleneck, has_notes: true });
    expect(JSON.stringify(events)).not.toMatch(/Asha|example\.com|WhatsApp/);

    const body = new URLSearchParams(capture.posts[0]);
    expect(body.get('name')).toBe(FIELDS.name);
    expect(body.get('notes')).toBe(FIELDS.notes);
    // Attribution: the campaign tags this page arrived with, and the path only.
    expect(body.get('utm_source')).toBe('newsletter');
    expect(body.get('utm_campaign')).toBe('nov-2026');
    expect(body.get('page')).toBe('/book');
    expect(capture.posts[0]).not.toContain('gclid');
    expectBookingLink(capture.locations[0]);
    expect(capture.external, `requests left this machine: ${capture.external.join(', ')}`).toEqual([]);
    await context.close();
  });

  test('the AI-training box is unticked and optional, and booking is identical either way', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const capture = await guard(context);
    const page = await context.newPage();

    await page.goto('/book');
    const box = page.getByLabel(AI_TRAINING_LABEL);
    await expect(box).toHaveAttribute('type', 'checkbox');
    await expect(box).not.toBeChecked();
    await expect(box).not.toHaveAttribute('required', /.*/);
    await fill(page);
    await page.getByRole('button', { name: 'Choose a time' }).click();
    await expect(page.locator('h1')).toHaveText('Booking page stub');

    await page.goto('/book');
    await fill(page);
    await page.getByLabel(AI_TRAINING_LABEL).check();
    await page.getByRole('button', { name: 'Choose a time' }).click();
    await expect(page.locator('h1')).toHaveText('Booking page stub');

    expect(capture.posts).toHaveLength(2);
    expect(new URLSearchParams(capture.posts[0]).has('ai_training')).toBe(false);
    expect(new URLSearchParams(capture.posts[1]).get('ai_training')).toBe('yes');
    // Same answers, same booking link: the choice never changes the service.
    expect(capture.locations).toHaveLength(2);
    expect(capture.locations[1]).toBe(capture.locations[0]);
    expectBookingLink(capture.locations[1]);
    expect(capture.external).toEqual([]);
    await context.close();
  });

  for (const javaScriptEnabled of [false, true]) {
    const mode = javaScriptEnabled ? 'with JavaScript' : 'without JavaScript';

    test(`an answer the server refuses comes back to /book with a message clear of the header (${mode})`, async ({ browser }) => {
      // `asha..verma@example.com` passes the browser's own email check and the
      // form's pattern, but not the server's (two dots in a row), so this
      // exercises the real 303 back. It starts from a pricing-tier link, whose
      // tag must survive the round trip (with JavaScript, the only way it is sent).
      const context = await browser.newContext({ javaScriptEnabled });
      const capture = await guard(context);
      const page = await context.newPage();
      await page.goto('/book?utm_source=sheetflow-site&utm_medium=pricing&utm_content=tier-growth');
      await fill(page, { ...FIELDS, email: 'asha..verma@example.com' });
      await page.getByRole('button', { name: 'Choose a time' }).click();

      await expect(page).toHaveURL(/\/book\?intake=invalid(&[^#]*)?#intake-invalid$/);
      const alert = page.getByRole('alert').filter({ hasText: 'Something in the form' });
      await expect(alert).toBeVisible();
      await expect(alert).toContainText('Something in the form didn’t go through.');

      // The browser scrolls the fragment's target to the top of the window; the
      // fixed header must not cover it (toBeVisible ignores occlusion).
      const placement = () =>
        page.evaluate(() => {
          const box = document.getElementById('intake-invalid')!.getBoundingClientRect();
          const header = [...document.querySelectorAll('header')].find((el) => getComputedStyle(el).position === 'fixed');
          const hit = document.elementFromPoint(box.left + box.width / 2, box.top + Math.min(box.height / 2, 12));
          return {
            clear: box.top >= (header?.getBoundingClientRect().bottom ?? 0),
            onTop: !!hit && document.getElementById('intake-invalid')!.contains(hit),
          };
        });
      await expect.poll(placement).toEqual({ clear: true, onTop: true });

      if (javaScriptEnabled) {
        expect(new URL(page.url()).searchParams.get('utm_content')).toBe('tier-growth');
        await expect(page.locator('form input[type="hidden"][name="utm_content"]')).toHaveValue('tier-growth');
      }
      expect(capture.posts).toHaveLength(1);
      expect(capture.external).toEqual([]);
      await context.close();
    });

    test(`an address with no dot in its domain is stopped in the browser and nothing typed is lost (${mode})`, async ({ browser }) => {
      // `type="email"` alone accepts `name@gmail`; the server does not, and a
      // refusal there comes back to an emptied form. The pattern stops it first.
      const context = await browser.newContext({ javaScriptEnabled });
      const capture = await guard(context);
      const page = await context.newPage();
      await page.goto('/book');
      await fill(page, { ...FIELDS, email: 'probe.person@gmail' });
      await page.getByRole('button', { name: 'Choose a time' }).click();

      const email = page.locator('input[name="email"]');
      await expect.poll(() => email.evaluate((el) => (el as HTMLInputElement).validity.patternMismatch)).toBe(true);
      // Give a submission that should not happen the time to start.
      await page.waitForTimeout(750);
      expect(capture.posts, 'the form must not reach the server').toEqual([]);
      expect(new URL(page.url()).pathname).toBe('/book');
      await expect(email).toHaveValue('probe.person@gmail');
      await expect(page.locator('input[name="name"]')).toHaveValue(FIELDS.name);
      await expect(page.locator('textarea[name="notes"]')).toHaveValue(FIELDS.notes);
      expect(capture.external).toEqual([]);
      await context.close();
    });
  }
});

test.describe('the /book form', () => {
  test('?intake=invalid shows a polite alert above the form; a plain visit does not', async ({ page }) => {
    await page.goto('/book?intake=invalid');
    // Next's own route announcer is also role=alert (and empty), so filter by text.
    const alert = page.getByRole('alert').filter({ hasText: 'Something in the form' });
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText(
      'Something in the form didn’t go through. Please check your answers and try again, or message us on WhatsApp.',
    );
    await expect(alert.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', /^https:\/\/wa\.me\//);
    const alertBox = (await alert.boundingBox())!;
    const formBox = (await page.locator('form').boundingBox())!;
    expect(alertBox.y + alertBox.height).toBeLessThanOrEqual(formBox.y);

    await page.goto('/book');
    await expect(page.locator('#intake-invalid')).toBeHidden();
  });

  test('the honeypot is invisible, out of the tab order and out of the accessibility tree', async ({ page }) => {
    await page.goto('/book');
    const trap = page.locator('input[name="website"]');
    await expect(trap).toHaveCount(1);
    await expect(trap).toHaveAttribute('tabindex', '-1');
    await expect(trap).toHaveAttribute('autocomplete', 'off');
    await expect(trap.locator('xpath=ancestor::div[@aria-hidden="true"]')).toHaveCount(1);
    await expect(trap).not.toBeInViewport();

    await expect(page.getByRole('textbox', { name: 'Leave this field empty' })).toHaveCount(0);
    expect(await page.locator('form').ariaSnapshot()).not.toContain('Leave this field empty');

    // Walk the tab order from the first field to the submit button.
    await page.locator('input[name="name"]').focus();
    const visited: string[] = [];
    for (let i = 0; i < 20; i += 1) {
      await page.keyboard.press('Tab');
      const where = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        return el ? `${el.tagName.toLowerCase()}:${el.getAttribute('name') ?? el.getAttribute('type') ?? el.textContent?.trim().slice(0, 30)}` : '';
      });
      visited.push(where);
      if (where.startsWith('button:submit')) break;
    }
    expect(visited, visited.join(' → ')).toContain('button:submit');
    expect(visited.some((v) => v.includes('website')), visited.join(' → ')).toBe(false);
  });

  test('the notice sits directly above the submit button, stands on its own and links /privacy', async ({ page }) => {
    await page.goto('/book');
    const notice = page.locator('p', { hasText: 'to arrange and hold your free 20-minute session' });
    await expect(notice).toHaveCount(1);
    for (const phrase of [
      'name, email, answers and notes',
      'which page or link brought you here',
      'approximate country',
      'to see where enquiries come from',
      'we don’t save the IP',
      'site analytics also count your two multiple-choice answers, never your name, email or notes',
      'Cal.com, which runs the booking page',
      'don’t include health, financial or password details',
      'corrected or deleted',
    ]) {
      await expect(notice, `the notice does not say "${phrase}"`).toContainText(phrase);
    }
    await expect(notice.locator('a[href="/privacy"]')).toHaveCount(1);

    const submit = page.locator('form button[type="submit"]');
    const noticeBox = (await notice.boundingBox())!;
    const submitBox = (await submit.boundingBox())!;
    expect(noticeBox.y + noticeBox.height, 'the notice must be above the button').toBeLessThanOrEqual(submitBox.y);
    // Nothing else the visitor has to answer sits between them.
    const between = await page.evaluate(() => {
      const p = [...document.querySelectorAll('form p')].find((el) => el.textContent?.includes('to arrange and hold'))!;
      const button = document.querySelector('form button[type="submit"]')!;
      return [...document.querySelectorAll('form input:not([type=hidden]), form select, form textarea')].filter(
        (el) => p.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING && el.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).length;
    });
    expect(between).toBe(0);
    // Screen readers hear the notice with the button.
    const id = await notice.getAttribute('id');
    await expect(submit).toHaveAttribute('aria-describedby', id!);
    // The withdrawal route is one click from the checkbox.
    await expect(page.locator('form a[href="/privacy#ai-training"]')).toHaveCount(1);
    // Both privacy links open a new tab, so reading the notice never loses the typed answers.
    for (const href of ['/privacy', '/privacy#ai-training']) {
      const a = page.locator(`form a[href="${href}"]`);
      await expect(a).toHaveAttribute('target', '_blank');
      await expect(a).toHaveAttribute('rel', /noopener/);
      await expect(a).toContainText('(opens in a new tab)');
    }
  });

  test('a pricing tier CTA lands on /book and its tag reaches the form', async ({ page }) => {
    const tier = tiers[0];
    await page.goto('/pricing');
    await page.locator(`#${tier.id}`).getByRole('link', { name: tier.cta }).click();
    await expect(page).toHaveURL(new RegExp(`/book\\?.*utm_content=tier-${tier.id}`));
    expect(new URL(page.url()).pathname + new URL(page.url()).search).toBe(tierBookingUrl(tier));
    await expect(page.locator('form input[type="hidden"][name="utm_content"]')).toHaveValue(`tier-${tier.id}`);
    await expect(page.locator('form input[type="hidden"][name="utm_medium"]')).toHaveValue('pricing');
    await expect(page.locator('form input[type="hidden"][name="page"]')).toHaveValue('/book');
  });
});

test.describe('query strings that may carry personal data', () => {
  test('/book/confirmed removes its query string and names no scheduler', async ({ page }) => {
    // What Cal.com's "Forward parameters" would append. The uid is enough to
    // cancel or reschedule a booking.
    await page.goto('/book/confirmed?name=Asha%20Verma&email=asha%40example.com&uid=abc123XYZ#top');
    await expect.poll(() => new URL(page.url()).search).toBe('');
    expect(new URL(page.url()).pathname).toBe('/book/confirmed');
    expect(new URL(page.url()).hash).toBe('#top');
    await expect(page.locator('h1')).toHaveText('You are booked.');
    const text = await page.locator('main').innerText();
    expect(text).not.toMatch(/calendly|cal\.com/i);
    expect(text).toContain('The confirmation email and calendar invite, with the Google Meet link, are in your inbox.');
    expect(text).not.toContain('Asha');
  });

  test('analytics and speed measurements send the path only', async ({ page }) => {
    // Off Vercel the two scripts are never served, so their queues keep the
    // beforeSend hooks the layout registered. Calling them is calling exactly
    // what would run on Vercel before an event is sent.
    await page.goto('/book?utm_source=x&email=asha%40example.com#section');
    const hooks = () =>
      page.evaluate(() => {
        const w = window as unknown as { vaq?: unknown[][]; siq?: unknown[][] };
        const find = (queue?: unknown[][]) =>
          queue?.find((entry) => entry[0] === 'beforeSend')?.[1] as ((event: { type: string; url: string }) => { url: string } | null) | undefined;
        const analytics = find(w.vaq);
        const speed = find(w.siq);
        return {
          analytics: analytics?.({ type: 'pageview', url: location.href })?.url ?? null,
          event: analytics?.({ type: 'event', url: location.href })?.url ?? null,
          speed: speed?.({ type: 'vital', url: location.href })?.url ?? null,
          href: location.href,
        };
      });
    await expect.poll(async () => (await hooks()).speed !== null && (await hooks()).analytics !== null).toBe(true);
    const result = await hooks();
    const expected = new URL('/book', result.href).toString();
    expect(result.href).toContain('?');
    expect(result.analytics).toBe(expected);
    expect(result.event).toBe(expected);
    expect(result.speed).toBe(expected);
  });
});
