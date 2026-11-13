/**
 * Tests for the /api/intake lead capture (D46): `src/lib/intake.ts`.
 *
 *   node scripts/test-intake.mjs
 *
 * Plain Node 24 (it strips the TypeScript types on import), no server, no
 * network: the handler is driven with real `Request` objects, n8n is a stubbed
 * fetch, and the clock and lead id are pinned. Every secret, name and address
 * below is a dummy. The sector and bottleneck lists are short stand-ins for
 * the real ones in `lib/booking.ts`, which cannot be imported here (it uses
 * the `@/` path alias); the handler receives its lists by injection anyway.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  handleIntake,
  createRateLimiter,
  clientKey,
  rateLimitAddress,
  mediaType,
  prefersJson,
  allowedOrigins,
  isOriginAllowed,
  isSaneEmail,
  validateSubmission,
  buildLeadEnvelope,
  readCalBookingUrl,
  buildCalBookingUrl,
  MAX_INTAKE_BODY_BYTES,
  MAX_BOOKING_URL_LENGTH,
  INTAKE_RATE_LIMIT,
  INTAKE_FORWARD_TIMEOUT_MS,
  LEAD_METADATA_KEY,
} from '../src/lib/intake.ts';

const ENDPOINT = 'https://sheetflow.click/api/intake';
const LEAD = '6f1c2b9e-3d4a-4f5b-8c7d-112233445566';
const DECOY = '0b9a8c7d-1e2f-4a3b-9c4d-5e6f7a8b9c0d';
const NOW = new Date('2026-11-13T10:00:00.000Z');
const SECRET = 'test-intake-secret-'.padEnd(40, 'x');
const CAL = 'https://cal.com/sheetflow/discovery-20';
const CALENDLY = 'https://calendly.com/sheetflow51/free-automation-audit';
const IP = '203.0.113.7';
const UA = 'Mozilla/5.0 (TestBrowser)';
const ENV = {
  NODE_ENV: 'production',
  SF_INTAKE_URL: 'https://tunnel.example.test/webhook/sf-discovery-intake',
  SF_INTAKE_SECRET: SECRET,
  CAL_BOOKING_URL: CAL,
};
const ALLOWED = {
  sectors: ['Real estate', 'Something else'],
  bottlenecks: ['Invoices need chasing', 'Not sure yet — that is what I want to work out'],
};
const FIELDS = {
  name: 'Priya Sharma',
  email: 'priya@example.test',
  sector: 'Real estate',
  bottleneck: 'Invoices need chasing',
  notes: 'Leads come in on WhatsApp.',
};
const BROWSER_ACCEPT = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';

/** The same prose as `composeNotes` in lib/booking.ts. */
function composeNotes(a) {
  const parts = [];
  if (a.sector) parts.push(`Business: ${a.sector}.`);
  if (a.bottleneck) parts.push(`Biggest gap: ${a.bottleneck}.`);
  if (a.notes.trim()) parts.push(a.notes.trim());
  return parts.join(' ');
}

/** Stands in for `buildBookingUrl` (today's Calendly link). */
function calendlyUrl(a) {
  const url = new URL(CALENDLY);
  url.searchParams.set('name', a.name);
  url.searchParams.set('email', a.email);
  url.searchParams.set('a1', composeNotes(a));
  return url.toString();
}

function headersOf(base, extra) {
  const merged = { ...base, ...extra };
  for (const [k, v] of Object.entries(merged)) if (v === null) delete merged[k];
  return merged;
}

const BROWSER = { origin: 'https://sheetflow.click', 'x-real-ip': IP, 'user-agent': UA, accept: BROWSER_ACCEPT };

/** Drops keys set to undefined, which URLSearchParams and FormData would send as "undefined". */
function defined(fields) {
  return Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
}

function formPost(fields = FIELDS, extra = {}, url = ENDPOINT) {
  return new Request(url, {
    method: 'POST',
    headers: headersOf({ 'content-type': 'application/x-www-form-urlencoded', ...BROWSER }, extra),
    body: new URLSearchParams(defined(fields)).toString(),
  });
}

function jsonPost(data, extra = {}) {
  return new Request(ENDPOINT, {
    method: 'POST',
    headers: headersOf({ 'content-type': 'application/json', ...BROWSER, accept: 'application/json' }, extra),
    body: typeof data === 'string' ? data : JSON.stringify(data),
  });
}

function multipartPost(formData, extra = {}) {
  return new Request(ENDPOINT, { method: 'POST', headers: headersOf(BROWSER, extra), body: formData });
}

function formDataOf(fields) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(defined(fields))) fd.append(k, v);
  return fd;
}

/** Stub n8n: records every call, answers with `status`/`headers` (or throws `error`). */
function stubFetch({ status = 200, headers = {}, error } = {}) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init, envelope: JSON.parse(init.body) });
    if (error) throw error;
    return new Response('{}', { status, headers });
  };
  return { fn, calls };
}

async function run(request, { env = ENV, fetchStub = stubFetch(), rateLimiter, now = NOW, ids } = {}) {
  const lines = [];
  const fallbackCalls = [];
  const queue = ids ? [...ids] : null;
  const res = await handleIntake(request, {
    env,
    allowed: ALLOWED,
    composeNotes,
    fallbackBookingUrl: (a) => {
      fallbackCalls.push(a);
      return calendlyUrl(a);
    },
    fetch: fetchStub.fn,
    randomId: () => (queue ? queue.shift() : LEAD),
    now: () => now,
    log: (l) => lines.push(l),
    rateLimiter,
  });
  return { res, lines, calls: fetchStub.calls, fallbackCalls };
}

const EXPECTED_ENVELOPE = {
  schema: 'sf.intake.v1',
  event: 'lead.submitted',
  eventId: `lead.submitted:${LEAD}`,
  occurredAt: '2026-11-13T10:00:00.000Z',
  source: 'site:/book',
  leadId: LEAD,
  contact: { name: 'Priya Sharma', email: 'priya@example.test' },
  lead: {
    sector: 'Real estate',
    bottleneck: 'Invoices need chasing',
    notes: 'Leads come in on WhatsApp.',
    consent: false,
  },
};

const EXPECTED_NOTES = 'Business: Real estate. Biggest gap: Invoices need chasing. Leads come in on WhatsApp.';

function expectedCalUrl(leadId = LEAD, fields = FIELDS) {
  const url = new URL(CAL);
  url.searchParams.set('name', fields.name);
  url.searchParams.set('email', fields.email);
  if (leadId) url.searchParams.set('metadata[sf_lead_id]', leadId);
  url.searchParams.set('notes', composeNotes({ ...fields, notes: fields.notes ?? '' }));
  return url.toString();
}

function paramsOf(location) {
  return Object.fromEntries(new URL(location).searchParams);
}

// --- FORM mode: the native <form method="post"> ---------------------------

test('FORM: a valid lead is forwarded, then 303 to the prefilled Cal.com link', async () => {
  const { res, lines, calls } = await run(formPost());
  assert.equal(res.status, 303, 'must be 303, never 302 or 307 (307 re-POSTs the lead to Cal.com)');
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.equal(await res.text(), '');

  const location = res.headers.get('location');
  const url = new URL(location);
  assert.equal(`${url.origin}${url.pathname}`, CAL);
  assert.deepEqual(paramsOf(location), {
    name: 'Priya Sharma',
    email: 'priya@example.test',
    'metadata[sf_lead_id]': LEAD,
    notes: EXPECTED_NOTES,
  });

  assert.equal(calls.length, 1);
  const { url: target, init, envelope } = calls[0];
  assert.equal(target, ENV.SF_INTAKE_URL);
  assert.equal(init.method, 'POST');
  assert.equal(init.headers['X-SF-Intake'], SECRET);
  assert.equal(init.headers['ngrok-skip-browser-warning'], '1');
  assert.equal(init.headers['user-agent'], 'sheetflow-site-relay/1');
  assert.equal(init.redirect, 'error');
  assert.deepEqual(envelope, EXPECTED_ENVELOPE);
  assert.deepEqual(lines, [`[intake] outcome=forwarded lead=${LEAD}`]);
  assert.equal(INTAKE_FORWARD_TIMEOUT_MS, 6000);
});

test('FORM: still 303 to the booking link when n8n is down or not configured', async () => {
  const timeout = Object.assign(new Error('timed out'), { name: 'TimeoutError' });
  const cases = [
    [{ fetchStub: stubFetch({ status: 500 }) }, 'upstream_500'],
    [{ fetchStub: stubFetch({ status: 404 }) }, 'upstream_404'],
    [{ fetchStub: stubFetch({ status: 404, headers: { 'ngrok-error-code': 'ERR_NGROK_3200' } }) }, 'ngrok_ERR_NGROK_3200'],
    [{ fetchStub: stubFetch({ error: timeout }) }, 'upstream_timeout'],
    [{ fetchStub: stubFetch({ error: new TypeError('fetch failed') }) }, 'upstream_unreachable'],
    [{ env: { NODE_ENV: 'production', CAL_BOOKING_URL: CAL } }, 'not_configured'],
    [{ env: { ...ENV, SF_INTAKE_URL: 'http://tunnel.example.test/webhook/sf-discovery-intake' } }, 'not_configured'],
  ];
  for (const [opts, outcome] of cases) {
    const { res, lines } = await run(formPost(), opts);
    assert.equal(res.status, 303, outcome);
    assert.equal(res.headers.get('location'), expectedCalUrl(), outcome);
    assert.deepEqual(lines, [`[intake] outcome=${outcome} lead=${LEAD}`]);
  }
});

test('FORM: the first value of a repeated field wins; unknown fields are ignored', async () => {
  const body = new URLSearchParams([
    ...Object.entries(FIELDS),
    ['name', 'Someone Else'],
    ['metadata[videoCallUrl]', 'https://evil.example.test/'],
    ['role', 'admin'],
  ]);
  const request = new Request(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', ...BROWSER },
    body: body.toString(),
  });
  const { res, calls } = await run(request);
  assert.equal(calls[0].envelope.contact.name, 'Priya Sharma');
  assert.deepEqual(calls[0].envelope, EXPECTED_ENVELOPE);
  assert.equal(res.headers.get('location'), expectedCalUrl());
});

// --- JSON mode ---------------------------------------------------------------

test('JSON: a JSON body answers 200 with leadId, captured and bookingUrl', async () => {
  const { res, calls, lines } = await run(jsonPost(FIELDS));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.equal(res.headers.get('content-type'), 'application/json');
  assert.deepEqual(await res.json(), { ok: true, leadId: LEAD, captured: true, bookingUrl: expectedCalUrl() });
  assert.deepEqual(calls[0].envelope, EXPECTED_ENVELOPE);
  assert.deepEqual(lines, [`[intake] outcome=forwarded lead=${LEAD}`]);
});

test('JSON: captured is false, and the booking link still comes back, when n8n is down', async () => {
  const { res } = await run(jsonPost(FIELDS), { fetchStub: stubFetch({ status: 502 }) });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, leadId: LEAD, captured: false, bookingUrl: expectedCalUrl() });
});

test('JSON mode also follows Accept for a form body; a browser stays in FORM mode', async () => {
  const viaAccept = await run(formPost(FIELDS, { accept: 'application/json' }));
  assert.equal(viaAccept.res.status, 200);
  assert.equal((await viaAccept.res.json()).ok, true);

  const multipart = await run(multipartPost(formDataOf(FIELDS), { accept: 'application/json, text/plain;q=0.5' }));
  assert.equal(multipart.res.status, 200);

  const browser = await run(formPost(FIELDS, { accept: BROWSER_ACCEPT }));
  assert.equal(browser.res.status, 303);
  const lowJson = await run(formPost(FIELDS, { accept: 'application/json;q=0.5, text/html' }));
  assert.equal(lowJson.res.status, 303);
  const none = await run(formPost(FIELDS, { accept: null }));
  assert.equal(none.res.status, 303);
});

test('prefersJson and mediaType', () => {
  assert.equal(prefersJson('application/json'), true);
  assert.equal(prefersJson('application/json, text/html'), true);
  assert.equal(prefersJson('text/html, application/json;q=0.9'), false);
  assert.equal(prefersJson('application/json;q=0'), false);
  assert.equal(prefersJson('*/*'), false);
  assert.equal(prefersJson(BROWSER_ACCEPT), false);
  assert.equal(prefersJson(null), false);
  assert.equal(prefersJson('APPLICATION/JSON;Q=1'), true);
  assert.equal(mediaType('Application/JSON; charset=utf-8'), 'application/json');
  assert.equal(mediaType('multipart/form-data; boundary=x'), 'multipart/form-data');
  assert.equal(mediaType(null), '');
});

// --- Invalid input -----------------------------------------------------------

const INVALID_CASES = [
  ['missing name', { ...FIELDS, name: undefined }, ['name']],
  ['blank name', { ...FIELDS, name: ' \t  ' }, ['name']],
  ['name too long', { ...FIELDS, name: 'n'.repeat(121) }, ['name']],
  ['missing email', { ...FIELDS, email: undefined }, ['email']],
  ['email without a dot', { ...FIELDS, email: 'priya@localhost' }, ['email']],
  ['email with a space', { ...FIELDS, email: 'priya sharma@example.test' }, ['email']],
  ['email in angle brackets', { ...FIELDS, email: '<priya@example.test>' }, ['email']],
  ['two emails', { ...FIELDS, email: 'priya@example.test,eve@example.test' }, ['email']],
  ['two @', { ...FIELDS, email: 'priya@@example.test' }, ['email']],
  ['email too long', { ...FIELDS, email: `${'a'.repeat(60)}@${'b'.repeat(190)}.test` }, ['email']],
  ['header injection in email', { ...FIELDS, email: 'priya@example.test\nBcc: eve@example.test' }, ['email']],
  ['sector outside the list', { ...FIELDS, sector: 'Plumbing' }, ['sector']],
  ['sector in the wrong case', { ...FIELDS, sector: 'real estate' }, ['sector']],
  ['missing sector', { ...FIELDS, sector: undefined }, ['sector']],
  ['bottleneck outside the list', { ...FIELDS, bottleneck: 'Everything' }, ['bottleneck']],
  ['notes too long', { ...FIELDS, notes: 'n'.repeat(1501) }, ['notes']],
  ['nothing at all', {}, ['name', 'email', 'sector', 'bottleneck']],
];

const withoutUndefined = defined;

test('FORM: invalid input redirects 303 back to /book?intake=invalid and forwards nothing', async () => {
  for (const [name, fields] of INVALID_CASES) {
    const { res, calls, lines } = await run(formPost(withoutUndefined(fields)));
    assert.equal(res.status, 303, name);
    assert.equal(res.headers.get('location'), 'https://sheetflow.click/book?intake=invalid', name);
    assert.equal(calls.length, 0, name);
    assert.deepEqual(lines, ['[intake] outcome=invalid lead=-'], name);
  }
});

test('FORM: the invalid redirect stays on the origin that was posted to', async () => {
  const preview = 'https://sheetflow-git-x-team.vercel.app';
  const { res } = await run(
    formPost({ ...FIELDS, email: 'nope' }, { origin: preview }, `${preview}/api/intake`),
    { env: { ...ENV, VERCEL_BRANCH_URL: 'sheetflow-git-x-team.vercel.app' } },
  );
  assert.equal(res.headers.get('location'), `${preview}/book?intake=invalid`);
});

test('JSON: invalid input answers 400 with field names only, never values', async () => {
  for (const [name, fields, expected] of INVALID_CASES) {
    const { res, calls } = await run(jsonPost(withoutUndefined(fields)));
    assert.equal(res.status, 400, name);
    const text = await res.text();
    assert.deepEqual(JSON.parse(text), { ok: false, error: 'invalid', fields: expected }, name);
    for (const value of Object.values(fields)) {
      if (typeof value === 'string' && value.trim().length > 2) assert.equal(text.includes(value), false, `${name} echoes a value`);
    }
    assert.equal(calls.length, 0, name);
  }
});

test('valid edge cases pass: limits, trimming, Unicode, the "Not sure yet" option', async () => {
  const fields = {
    name: `  ${'n'.repeat(120)}  `,
    email: '  priya+leads@example.test ',
    sector: ' Something else ',
    bottleneck: 'Not sure yet — that is what I want to work out',
    notes: 'n'.repeat(1500),
  };
  const { res, calls } = await run(formPost(fields));
  assert.equal(res.status, 303);
  assert.equal(calls[0].envelope.contact.name, 'n'.repeat(120));
  assert.equal(calls[0].envelope.contact.email, 'priya+leads@example.test');
  assert.equal(calls[0].envelope.lead.sector, 'Something else');

  const hindi = await run(formPost({ ...FIELDS, name: 'प्रिया शर्मा', email: 'priya@उदाहरण.भारत' }));
  assert.equal(hindi.calls[0].envelope.contact.name, 'प्रिया शर्मा');
  assert.equal(hindi.calls[0].envelope.contact.email, 'priya@उदाहरण.भारत');
});

test('isSaneEmail', () => {
  for (const good of ['a@b.co', 'first.last+tag@example.test', "o'brien@example.test", 'x@sub.example.co.in', 'priya@उदाहरण.भारत']) {
    assert.equal(isSaneEmail(good), true, good);
  }
  for (const bad of [
    '', 'a', '@b.co', 'a@', 'a@b', 'a@b.', 'a@.b.co', 'a@b..co', 'a@-b.co', 'a@b-.co', 'a@b.12',
    '.a@b.co', 'a.@b.co', 'a..b@b.co', 'a b@c.co', 'a@b c.co', '"a"@b.co', 'a<b@c.co', 'a@b.co>',
    'a,b@c.co', 'a;b@c.co', 'a@b@c.co', `${'a'.repeat(65)}@b.co`, `a@${'b'.repeat(250)}.co`,
  ]) {
    assert.equal(isSaneEmail(bad), false, bad);
  }
});

// --- Body limits and types ---------------------------------------------------

test('a body over 16 KB is refused by its declared length and by its actual size', async () => {
  assert.equal(MAX_INTAKE_BODY_BYTES, 16 * 1024);
  const big = { ...FIELDS, notes: 'x'.repeat(MAX_INTAKE_BODY_BYTES) };

  const byHeader = await run(formPost(FIELDS, { 'content-length': String(MAX_INTAKE_BODY_BYTES + 1) }));
  assert.equal(byHeader.res.status, 303);
  assert.equal(byHeader.res.headers.get('location'), 'https://sheetflow.click/book?intake=invalid');
  assert.deepEqual(byHeader.lines, ['[intake] outcome=too_large lead=-']);

  // The declared length lies: only counting the bytes catches it. Every field is
  // valid and the bulk sits in an ignored field, so if the bytes were not counted
  // this lead would be forwarded, not refused as invalid.
  const padded = { ...FIELDS, pad: 'x'.repeat(MAX_INTAKE_BODY_BYTES + 1024) };
  const byBody = await run(formPost(padded, { 'content-length': '100' }));
  assert.equal(byBody.res.status, 303);
  assert.equal(byBody.res.headers.get('location'), 'https://sheetflow.click/book?intake=invalid');
  assert.deepEqual(byBody.lines, ['[intake] outcome=too_large lead=-']);
  assert.equal(byBody.calls.length, 0);

  const jsonHeader = await run(jsonPost(FIELDS, { 'content-length': String(MAX_INTAKE_BODY_BYTES + 1) }));
  assert.equal(jsonHeader.res.status, 413);
  assert.deepEqual(await jsonHeader.res.json(), { ok: false, error: 'too_large' });

  const encoder = new TextEncoder();
  const chunked = new Request(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...BROWSER },
    duplex: 'half',
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(JSON.stringify(big)));
        controller.close();
      },
    }),
  });
  const jsonBody = await run(chunked);
  assert.equal(jsonBody.res.status, 413);
  assert.equal(jsonBody.calls.length, 0);
});

test('anything but urlencoded, multipart or JSON is 415', async () => {
  for (const contentType of ['text/plain', 'application/xml', 'application/jsonx', null]) {
    const request = new Request(ENDPOINT, {
      method: 'POST',
      headers: headersOf(BROWSER, { 'content-type': contentType }),
      body: new URLSearchParams(FIELDS).toString(),
    });
    // A string body gets text/plain by default; force the header off for the null case.
    if (contentType === null) request.headers.delete('content-type');
    const { res, calls, lines } = await run(request);
    assert.equal(res.status, 415, String(contentType));
    assert.equal(res.headers.get('content-type'), 'text/plain; charset=utf-8');
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.equal(calls.length, 0);
    assert.deepEqual(lines, ['[intake] outcome=unsupported_type lead=-']);
  }
  const jsonClient = await run(
    new Request(ENDPOINT, { method: 'POST', headers: { ...BROWSER, 'content-type': 'text/plain', accept: 'application/json' }, body: 'x' }),
  );
  assert.equal(jsonClient.res.status, 415);
  assert.deepEqual(await jsonClient.res.json(), { ok: false, error: 'unsupported_type' });
});

test('multipart: text fields work; any File value makes the lead invalid', async () => {
  const ok = await run(multipartPost(formDataOf(FIELDS)));
  assert.equal(ok.res.status, 303);
  assert.deepEqual(ok.calls[0].envelope, EXPECTED_ENVELOPE);

  const withFile = formDataOf({ ...FIELDS, notes: undefined });
  withFile.delete('notes');
  withFile.append('notes', new Blob(['%PDF-1.7']), 'brief.pdf');
  const form = await run(multipartPost(withFile));
  assert.equal(form.res.status, 303);
  assert.equal(form.res.headers.get('location'), 'https://sheetflow.click/book?intake=invalid');
  assert.equal(form.calls.length, 0);

  const json = await run(multipartPost(withFile, { accept: 'application/json' }));
  assert.deepEqual(await json.res.json(), { ok: false, error: 'invalid', fields: ['notes'] });

  const stray = formDataOf(FIELDS);
  stray.append('upload_x', new Blob(['x']), 'x.bin');
  const strayRes = await run(multipartPost(stray, { accept: 'application/json' }));
  assert.deepEqual(await strayRes.res.json(), { ok: false, error: 'invalid', fields: ['file'] });
});

test('malformed bodies are 400 bad_request', async () => {
  for (const body of ['{', '[]', '"just a string"', 'null', '42']) {
    const { res, calls, lines } = await run(jsonPost(body));
    assert.equal(res.status, 400, body);
    assert.deepEqual(await res.json(), { ok: false, error: 'bad_request' }, body);
    assert.equal(calls.length, 0);
    assert.deepEqual(lines, ['[intake] outcome=bad_request lead=-']);
  }
  const noBoundary = new Request(ENDPOINT, {
    method: 'POST',
    headers: { ...BROWSER, 'content-type': 'multipart/form-data' },
    body: '--x\r\nContent-Disposition: form-data; name="name"\r\n\r\nPriya\r\n--x--\r\n',
  });
  const { res } = await run(noBoundary);
  assert.equal(res.status, 400);
  assert.equal(res.headers.get('content-type'), 'text/plain; charset=utf-8');
});

test('JSON: a known field that is not a string is invalid; unknown ones are ignored', async () => {
  const { res } = await run(jsonPost({ ...FIELDS, name: 42, extra: { nested: true }, list: [1, 2] }));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { ok: false, error: 'invalid', fields: ['name'] });

  const ok = await run(jsonPost({ ...FIELDS, extra: { nested: true } }));
  assert.equal(ok.res.status, 200);
});

// --- Honeypot ----------------------------------------------------------------

test('honeypot: looks exactly like success, forwards nothing', async () => {
  const form = await run(formPost({ ...FIELDS, website: 'https://spam.example.test' }), { ids: [DECOY] });
  assert.equal(form.res.status, 303);
  assert.equal(form.res.headers.get('location'), expectedCalUrl(DECOY));
  assert.equal(form.calls.length, 0);
  assert.deepEqual(form.lines, ['[intake] outcome=honeypot lead=-']);

  const json = await run(jsonPost({ ...FIELDS, website: 'x' }), { ids: [DECOY] });
  assert.equal(json.res.status, 200);
  const body = await json.res.json();
  assert.deepEqual(Object.keys(body).sort(), ['bookingUrl', 'captured', 'leadId', 'ok']);
  assert.deepEqual(body, { ok: true, leadId: DECOY, captured: true, bookingUrl: expectedCalUrl(DECOY) });
  assert.equal(json.calls.length, 0);

  const nonString = await run(jsonPost({ ...FIELDS, website: 1 }));
  assert.equal(nonString.calls.length, 0, 'a non-string honeypot value still counts as filled');
  assert.equal(nonString.res.status, 200);
});

test('honeypot: an empty or whitespace-only value is not a bot', async () => {
  for (const website of ['', '   ']) {
    const { res, calls } = await run(formPost({ ...FIELDS, website }));
    assert.equal(res.status, 303);
    assert.equal(calls.length, 1, JSON.stringify(website));
  }
});

// --- Origin gate -------------------------------------------------------------

test('origin: the production, preview and site origins are allowed', () => {
  const origins = allowedOrigins({
    NODE_ENV: 'production',
    NEXT_PUBLIC_SITE_URL: 'https://preview.sheetflow.example/',
    VERCEL_URL: 'sheetflow-abc123-team.vercel.app',
    VERCEL_BRANCH_URL: 'sheetflow-git-feat-team.vercel.app',
    VERCEL_PROJECT_PRODUCTION_URL: 'SheetFlow.vercel.app',
  });
  assert.deepEqual([...origins].sort(), [
    'https://preview.sheetflow.example',
    'https://sheetflow-abc123-team.vercel.app',
    'https://sheetflow-git-feat-team.vercel.app',
    'https://sheetflow.click',
    'https://sheetflow.vercel.app',
    'https://www.sheetflow.click',
  ]);
  const ignored = allowedOrigins({
    NODE_ENV: 'production',
    NEXT_PUBLIC_SITE_URL: 'http://sheetflow.click',
    VERCEL_URL: 'evil.example.test/path',
    VERCEL_BRANCH_URL: 'user@evil.example.test',
  });
  assert.deepEqual([...ignored].sort(), ['https://sheetflow.click', 'https://www.sheetflow.click']);
});

test('origin: localhost only outside production', () => {
  const dev = { ...ENV, NODE_ENV: 'development' };
  assert.equal(isOriginAllowed(new Headers({ origin: 'http://localhost:3000' }), dev), true);
  assert.equal(isOriginAllowed(new Headers({ origin: 'http://127.0.0.1:3000' }), dev), true);
  assert.equal(isOriginAllowed(new Headers({ origin: 'http://localhost:3000' }), { ...ENV, NODE_ENV: undefined }), true);
  assert.equal(isOriginAllowed(new Headers({ origin: 'http://localhost:3000' }), ENV), false);
  assert.equal(isOriginAllowed(new Headers({ origin: 'http://localhost:4000' }), dev), false);
});

test('origin: blocked requests get 403 and nothing is read or forwarded', async () => {
  const blocked = [
    { origin: 'https://evil.example.test' },
    { origin: 'null' },
    { origin: 'http://sheetflow.click' },
    { origin: 'https://sheetflow.click.evil.example.test' },
    { origin: 'https://SHEETFLOW.click' },
    { origin: 'http://localhost:3000' },
    { origin: null },
    { origin: null, referer: 'https://evil.example.test/book' },
    { origin: null, referer: 'not a url' },
  ];
  for (const extra of blocked) {
    const request = formPost(FIELDS, extra);
    const { res, calls, lines } = await run(request);
    assert.equal(res.status, 403, JSON.stringify(extra));
    assert.equal(res.headers.get('content-type'), 'text/plain; charset=utf-8');
    assert.equal(await res.text(), 'Forbidden');
    assert.equal(calls.length, 0);
    assert.equal(request.bodyUsed, false, 'the body is never read for a blocked origin');
    assert.deepEqual(lines, ['[intake] outcome=blocked_origin lead=-']);
  }
  const json = await run(jsonPost(FIELDS, { origin: 'https://evil.example.test' }));
  assert.equal(json.res.status, 403);
  assert.deepEqual(await json.res.json(), { ok: false, error: 'forbidden' });
});

test('origin: Referer is the fallback when Origin is absent', async () => {
  const { res, calls } = await run(formPost(FIELDS, { origin: null, referer: 'https://www.sheetflow.click/book?x=1' }));
  assert.equal(res.status, 303);
  assert.equal(calls.length, 1);
  // Origin wins when both are present.
  const both = await run(formPost(FIELDS, { origin: 'https://evil.example.test', referer: 'https://sheetflow.click/book' }));
  assert.equal(both.res.status, 403);
});

test('origin: a preview deployment and local dev are accepted where configured', async () => {
  const preview = await run(formPost(FIELDS, { origin: 'https://sheetflow-abc123-team.vercel.app' }), {
    env: { ...ENV, VERCEL_URL: 'sheetflow-abc123-team.vercel.app' },
  });
  assert.equal(preview.res.status, 303);
  const local = await run(formPost(FIELDS, { origin: 'http://localhost:3000' }), { env: { ...ENV, NODE_ENV: 'development' } });
  assert.equal(local.res.status, 303);
});

// --- Rate limit --------------------------------------------------------------

test('rate limit: the 6th lead in 10 minutes from one address still books, but is not captured', async () => {
  assert.deepEqual({ ...INTAKE_RATE_LIMIT }, { limit: 5, windowMs: 600_000, maxKeys: 5000 });
  const rateLimiter = createRateLimiter(INTAKE_RATE_LIMIT);
  const fetchStub = stubFetch();
  for (let i = 0; i < 5; i += 1) {
    const { res } = await run(formPost(), { rateLimiter, fetchStub });
    assert.equal(res.status, 303);
  }
  assert.equal(fetchStub.calls.length, 5);

  const sixth = await run(formPost(), { rateLimiter, fetchStub });
  assert.equal(sixth.res.status, 303);
  assert.equal(fetchStub.calls.length, 5, 'not forwarded');
  assert.deepEqual(sixth.lines, ['[intake] outcome=rate_limited lead=-']);
  // Same prefilled booking page, but no lead id: no lead row exists to join to.
  assert.equal(sixth.res.headers.get('location'), expectedCalUrl(null));

  const json = await run(jsonPost(FIELDS), { rateLimiter, fetchStub });
  assert.equal(json.res.status, 429);
  assert.deepEqual(await json.res.json(), { ok: false, error: 'rate_limited', bookingUrl: expectedCalUrl(null) });

  const otherAddress = await run(formPost(FIELDS, { 'x-real-ip': '198.51.100.20' }), { rateLimiter, fetchStub });
  assert.equal(otherAddress.lines[0], `[intake] outcome=forwarded lead=${LEAD}`);

  const later = await run(formPost(), { rateLimiter, fetchStub, now: new Date(NOW.getTime() + 600_000) });
  assert.equal(later.lines[0], `[intake] outcome=forwarded lead=${LEAD}`, 'a new window starts after 10 minutes');
});

test('rate limit: invalid and honeypot submissions do not use up the allowance', async () => {
  const rateLimiter = createRateLimiter({ limit: 1, windowMs: 600_000, maxKeys: 10 });
  for (let i = 0; i < 5; i += 1) {
    await run(formPost({ ...FIELDS, email: 'bad' }), { rateLimiter });
    await run(formPost({ ...FIELDS, website: 'spam' }), { rateLimiter });
  }
  const { lines } = await run(formPost(), { rateLimiter });
  assert.deepEqual(lines, [`[intake] outcome=forwarded lead=${LEAD}`]);
});

test('rate limit: keys are salted SHA-256 hashes, never the raw address', async () => {
  const seen = [];
  const inner = createRateLimiter(INTAKE_RATE_LIMIT);
  const recording = { hit: (key, now) => (seen.push(key), inner.hit(key, now)), size: () => inner.size() };
  await run(formPost(), { rateLimiter: recording });
  await run(formPost(FIELDS, { 'x-real-ip': null, 'x-forwarded-for': '198.51.100.9, 10.0.0.1' }), { rateLimiter: recording });
  assert.equal(seen.length, 2);
  for (const key of seen) {
    assert.match(key, /^[0-9a-f]{64}$/);
    for (const raw of [IP, '198.51.100.9', '10.0.0.1']) assert.equal(key.includes(raw), false);
  }
  const plainSha = (await import('node:crypto')).createHash('sha256').update(IP).digest('hex');
  assert.notEqual(seen[0], plainSha, 'salted, so the hash cannot be matched against a table of addresses');

  const viaRealIp = clientKey(new Headers({ 'x-real-ip': '198.51.100.9' }));
  assert.equal(seen[1], viaRealIp, 'the first x-forwarded-for hop is the fallback address');
  assert.equal(clientKey(new Headers({ 'x-real-ip': IP, 'x-forwarded-for': '198.51.100.9' })), clientKey(new Headers({ 'x-real-ip': IP })));
  assert.equal(clientKey(new Headers()), clientKey(new Headers({ 'x-real-ip': ' ' })), "no address shares the 'unknown' bucket");
});

test('rate limit: an IPv6 client counts by its /64, so rotating addresses inside it does not help', async () => {
  const rateLimiter = createRateLimiter(INTAKE_RATE_LIMIT);
  const fetchStub = stubFetch();
  for (let i = 0; i < 5; i += 1) {
    await run(formPost(FIELDS, { 'x-real-ip': `2001:db8:1234:5678::${(i + 1).toString(16)}` }), { rateLimiter, fetchStub });
  }
  assert.equal(fetchStub.calls.length, 5);
  const rotated = await run(formPost(FIELDS, { 'x-real-ip': '2001:db8:1234:5678:a:b:c:d' }), { rateLimiter, fetchStub });
  assert.deepEqual(rotated.lines, ['[intake] outcome=rate_limited lead=-']);
  assert.equal(rotated.res.status, 303, 'still sent to book');
  const otherNetwork = await run(formPost(FIELDS, { 'x-real-ip': '2001:db8:1234:5679::1' }), { rateLimiter, fetchStub });
  assert.equal(otherNetwork.lines[0], `[intake] outcome=forwarded lead=${LEAD}`);
});

test('rateLimitAddress: IPv4 whole, IPv6 by /64 in any spelling, IPv4-mapped as IPv4', () => {
  const prefix = '2001:db8:1234:5678::/64';
  for (const address of [
    '2001:db8:1234:5678::1',
    '2001:DB8:1234:5678:ffff:1:2:3',
    '2001:0db8:1234:5678:0:0:0:9',
    '[2001:db8:1234:5678::1]',
    '2001:db8:1234:5678::1%eth0',
    '2001:db8:1234:5678::203.0.113.7',
  ]) {
    assert.equal(rateLimitAddress(address), prefix, address);
  }
  assert.equal(rateLimitAddress('2001:db8::1'), '2001:db8:0:0::/64');
  assert.equal(rateLimitAddress('::1'), '0:0:0:0::/64');
  assert.equal(rateLimitAddress('203.0.113.7'), '203.0.113.7');
  assert.equal(rateLimitAddress('::ffff:203.0.113.7'), '203.0.113.7');
  assert.equal(rateLimitAddress('::FFFF:cb00:7107'), '203.0.113.7');
  assert.notEqual(rateLimitAddress('::ffff:198.51.100.9'), rateLimitAddress('::ffff:203.0.113.7'), 'mapped IPv4 clients stay apart');
  for (const odd of ['unknown', '1:2:3', '1::2::3', 'g::1', '::ffff:300.1.1.1']) {
    assert.equal(rateLimitAddress(odd), odd, odd);
  }
  assert.equal(
    clientKey(new Headers({ 'x-real-ip': '2001:db8:1234:5678::1' })),
    clientKey(new Headers({ 'x-real-ip': '2001:db8:1234:5678::2' })),
  );
  assert.equal(clientKey(new Headers({ 'x-real-ip': '::ffff:203.0.113.7' })), clientKey(new Headers({ 'x-real-ip': IP })));
});

test('rate limiter: fixed window, bounded memory', () => {
  const limiter = createRateLimiter({ limit: 2, windowMs: 1000, maxKeys: 3 });
  assert.equal(limiter.hit('a', 0), true);
  assert.equal(limiter.hit('a', 10), true);
  assert.equal(limiter.hit('a', 20), false);
  assert.equal(limiter.hit('a', 999), false);
  assert.equal(limiter.hit('a', 1000), true, 'new window');
  for (let i = 0; i < 50; i += 1) limiter.hit(`k${i}`, 1500);
  assert.ok(limiter.size() <= 3, `size ${limiter.size()}`);
  // Expired windows are swept before anything live is dropped.
  const sweep = createRateLimiter({ limit: 1, windowMs: 100, maxKeys: 2 });
  sweep.hit('old', 0);
  sweep.hit('live', 150);
  sweep.hit('new', 160);
  assert.equal(sweep.hit('live', 170), false, 'the live window survived; only the expired one was dropped');
});

// --- Booking link ------------------------------------------------------------

test('falls back to the Calendly builder when CAL_BOOKING_URL is missing or not a Cal.com link', async () => {
  const bad = [
    undefined,
    '',
    'http://cal.com/sheetflow/discovery-20',
    'https://cal.com.evil.example.test/sheetflow/discovery-20',
    'https://evilcal.com/sheetflow/discovery-20',
    'https://calendly.com/sheetflow51/free-automation-audit',
    'https://cal.com/sheetflow',
  ];
  for (const value of bad) {
    const { res, calls, fallbackCalls } = await run(formPost(), { env: { ...ENV, CAL_BOOKING_URL: value } });
    assert.equal(res.status, 303, String(value));
    assert.equal(res.headers.get('location'), calendlyUrl(FIELDS), String(value));
    assert.deepEqual(fallbackCalls, [FIELDS]);
    assert.deepEqual(calls[0].envelope, EXPECTED_ENVELOPE, 'the lead is captured either way');
  }
});

test('readCalBookingUrl', () => {
  const good = {
    'https://cal.com/sheetflow/discovery-20': 'https://cal.com/sheetflow/discovery-20',
    ' https://cal.com/sheetflow/discovery-20/ ': 'https://cal.com/sheetflow/discovery-20/',
    'https://app.cal.com/sheetflow/discovery-20': 'https://app.cal.com/sheetflow/discovery-20',
    'https://cal.com/team/sheetflow/discovery-20': 'https://cal.com/team/sheetflow/discovery-20',
  };
  for (const [raw, expected] of Object.entries(good)) assert.equal(readCalBookingUrl({ CAL_BOOKING_URL: raw }), expected, raw);
  for (const raw of [
    undefined,
    'not a url',
    'http://cal.com/a/b',
    'https://cal.com/a',
    'https://cal.com/',
    'https://cal.com//b',
    'https://cal.com/a/b?prefill=1',
    'https://cal.com/a/b?',
    'https://cal.com/a/b#x',
    'https://user:pw@cal.com/a/b',
    'https://cal.com:8443/a/b',
    'https://www.cal.com/a/b',
    'https://cal.com.evil.example.test/a/b',
  ]) {
    assert.equal(readCalBookingUrl({ CAL_BOOKING_URL: raw }), null, String(raw));
  }
});

test('the lead id travels as metadata[sf_lead_id], never as videoCallUrl', async () => {
  assert.equal(LEAD_METADATA_KEY, 'sf_lead_id');
  const { res } = await run(formPost({ ...FIELDS, 'metadata[videoCallUrl]': 'https://evil.example.test/' }));
  const location = res.headers.get('location');
  const keys = [...new URL(location).searchParams.keys()];
  assert.deepEqual(keys.sort(), ['email', 'metadata[sf_lead_id]', 'name', 'notes']);
  assert.equal(decodeURIComponent(location).toLowerCase().includes('videocallurl'), false);
});

test("a '+' in the email survives encoding; spaces round-trip", async () => {
  const fields = { ...FIELDS, email: 'priya+leads@example.test', name: 'Priya  Kumari Sharma' };
  const { res, calls } = await run(formPost(fields));
  const location = res.headers.get('location');
  assert.ok(location.includes('email=priya%2Bleads%40example.test'), location);
  const params = new URL(location).searchParams;
  assert.equal(params.get('email'), 'priya+leads@example.test');
  assert.equal(params.get('name'), 'Priya Kumari Sharma');
  assert.equal(calls[0].envelope.contact.email, 'priya+leads@example.test');
});

test('a very long non-Latin note is shortened in the link only, never in the envelope', async () => {
  const notes = 'क'.repeat(1500);
  const { res, calls } = await run(formPost({ ...FIELDS, notes }));
  const location = res.headers.get('location');
  assert.ok(location.length <= MAX_BOOKING_URL_LENGTH, `${location.length}`);
  const prefilled = new URL(location).searchParams.get('notes');
  assert.ok(prefilled.endsWith('…'));
  assert.ok(prefilled.startsWith('Business: Real estate.'));
  assert.equal(calls[0].envelope.lead.notes, notes);

  const short = buildCalBookingUrl(CAL, { ...FIELDS }, composeNotes, LEAD);
  assert.equal(short, expectedCalUrl());
  const empty = buildCalBookingUrl(CAL, { ...FIELDS, sector: '', bottleneck: '', notes: '' }, composeNotes, null);
  assert.deepEqual([...new URL(empty).searchParams.keys()], ['name', 'email']);
});

// --- Envelope ------------------------------------------------------------------

test('the envelope carries no IP address or user agent; country only when well-formed', async () => {
  const headers = { 'x-forwarded-for': `${IP}, 10.0.0.1`, 'x-vercel-ip-country': 'IN', 'x-vercel-ip-city': 'Pune' };
  const { calls } = await run(formPost(FIELDS, headers));
  const raw = calls[0].init.body;
  for (const leak of [IP, '10.0.0.1', UA, 'TestBrowser', 'Pune']) assert.equal(raw.includes(leak), false, leak);
  assert.deepEqual(calls[0].envelope, { ...EXPECTED_ENVELOPE, geo: { country: 'IN' } });

  for (const country of ['in', 'IND', 'I', '1N', 'I N', 'IN,US']) {
    const { calls: c } = await run(formPost(FIELDS, { 'x-vercel-ip-country': country }));
    assert.equal('geo' in c[0].envelope, false, country);
  }
  const none = await run(formPost());
  assert.equal('geo' in none.calls[0].envelope, false, 'no header, no geo');
});

test('normalisation: control characters, whitespace, a1 fallback, consent', async () => {
  const { calls } = await run(
    formPost({
      ...FIELDS,
      name: '  Priya \t  Sharma\u0007 ',
      notes: undefined,
      a1: 'Line one\r\nLine two\u0000\r\n\tindented',
      consent: 'on',
    }),
  );
  const { envelope } = calls[0];
  assert.equal(envelope.contact.name, 'Priya Sharma');
  assert.equal(envelope.lead.notes, 'Line one\nLine two\n indented');
  assert.equal(envelope.lead.consent, true);

  const precedence = await run(formPost({ ...FIELDS, notes: 'from notes', a1: 'from a1' }));
  assert.equal(precedence.calls[0].envelope.lead.notes, 'from notes');
  const blankNotes = await run(formPost({ ...FIELDS, notes: '   ', a1: 'from a1' }));
  assert.equal(blankNotes.calls[0].envelope.lead.notes, 'from a1');
  const noNotes = await run(formPost({ ...FIELDS, notes: undefined }));
  assert.equal(noNotes.calls[0].envelope.lead.notes, '');

  for (const [value, expected] of [['on', true], ['true', true], ['YES', true], ['1', true], ['no', false], ['0', false], ['', false], ['off', false]]) {
    const result = validateSubmission(new Map(Object.entries({ ...FIELDS, consent: value })), ALLOWED);
    assert.equal(result.submission.consent, expected, value);
  }
  assert.equal(validateSubmission(new Map(Object.entries(FIELDS)), ALLOWED).submission.consent, false);
});

test('attribution: valid UTM values and page are kept, anything else is dropped', async () => {
  const { calls } = await run(
    formPost({
      ...FIELDS,
      utm_source: 'linkedin',
      utm_medium: 'social post',
      utm_campaign: 'nov-2026_launch%20a',
      utm_content: '<script>',
      utm_term: 't'.repeat(121),
      page: '/book?from=pricing',
    }),
  );
  assert.deepEqual(calls[0].envelope.attribution, {
    utm_source: 'linkedin',
    utm_medium: 'social post',
    utm_campaign: 'nov-2026_launch%20a',
    page: '/book',
  });
  const backslash = String.fromCharCode(92);
  for (const page of [
    'https://evil.example.test/',
    '//evil.example.test/x',
    `/${backslash}evil.example.test/login`,
    `/book${backslash}x`,
    'book',
    '?from=pricing',
    `/${'p'.repeat(200)}`,
    '/has space',
  ]) {
    const result = await run(formPost({ ...FIELDS, page }));
    assert.equal('attribution' in result.calls[0].envelope, false, page);
  }
});

test('attribution: page keeps the path only, never a query or fragment', async () => {
  for (const [page, expected] of [
    ['/book?gclid=Cj0-TEST&email=priya%40example.test', '/book'],
    ['/book#top', '/book'],
    ['/?fbclid=TEST', '/'],
    ['/pricing/', '/pricing/'],
  ]) {
    const { calls } = await run(formPost({ ...FIELDS, page }));
    assert.equal(calls[0].envelope.attribution.page, expected, page);
    assert.equal(new URL(expected, 'https://sheetflow.click/book').origin, 'https://sheetflow.click', page);
    const raw = JSON.stringify(calls[0].envelope);
    for (const leak of ['gclid', 'fbclid', 'priya%40', '#top']) assert.equal(raw.includes(leak), false, leak);
  }
});

test('buildLeadEnvelope is pure and omits empty extras', () => {
  const submission = validateSubmission(new Map(Object.entries(FIELDS)), ALLOWED).submission;
  const envelope = buildLeadEnvelope(submission, { leadId: LEAD, occurredAt: NOW, country: null });
  assert.deepEqual(envelope, EXPECTED_ENVELOPE);
  assert.deepEqual(Object.keys(envelope), ['schema', 'event', 'eventId', 'occurredAt', 'source', 'leadId', 'contact', 'lead']);
});

// --- Logs and headers across every path -----------------------------------------

test('logs carry an outcome and a lead id only, never personal data, URLs or secrets; every response is no-store', async () => {
  const lines = [];
  const responses = [];
  const rateLimiter = createRateLimiter({ limit: 1, windowMs: 600_000, maxKeys: 10 });
  const scenarios = [
    [formPost(), {}],
    [jsonPost(FIELDS), {}],
    [formPost({ ...FIELDS, email: 'priya@nowhere' }), {}],
    [jsonPost({ ...FIELDS, sector: 'Secret Sector' }), {}],
    [formPost({ ...FIELDS, website: 'spam' }), {}],
    [formPost(FIELDS, { origin: 'https://evil.example.test' }), {}],
    [formPost(FIELDS, { 'content-type': 'text/plain' }), {}],
    [formPost(FIELDS, { 'content-length': '999999' }), {}],
    [jsonPost('{'), {}],
    [formPost(), { fetchStub: stubFetch({ status: 404, headers: { 'ngrok-error-code': 'ERR_NGROK_3200' } }) }],
    [formPost(), { env: { NODE_ENV: 'production' } }],
    [formPost(), { rateLimiter }],
    [formPost(), { rateLimiter }],
  ];
  for (const [request, opts] of scenarios) {
    const result = await run(request, opts);
    lines.push(...result.lines);
    responses.push(result.res);
  }
  assert.equal(lines.length, scenarios.length, 'exactly one line per request');
  const leaks = [
    'Priya', 'Sharma', 'priya@', 'example.test', 'WhatsApp', 'Real estate', 'Invoices', 'Secret Sector',
    IP, UA, SECRET, 'cal.com', 'calendly', 'tunnel', 'sheetflow.click', 'evil', 'spam', 'http',
  ];
  for (const line of lines) {
    assert.match(line, /^\[intake\] outcome=[A-Za-z0-9_]+ lead=(?:[0-9a-f-]{36}|-)$/, line);
    for (const leak of leaks) assert.equal(line.toLowerCase().includes(leak.toLowerCase()), false, `log leaks ${leak}: ${line}`);
  }
  for (const res of responses) assert.equal(res.headers.get('cache-control'), 'no-store', String(res.status));
});

test('an injected id that is not a plain id is not printed', async () => {
  const { lines } = await run(formPost(), { ids: ['evil\nINJECTED'] });
  assert.deepEqual(lines, ['[intake] outcome=forwarded lead=-']);
});

// --- Route module ------------------------------------------------------------------

test('the route file wires the handler: nodejs, force-dynamic, 15 s, the form lists, one limiter, GET 405', async () => {
  const { readFile } = await import('node:fs/promises');
  const src = await readFile(new URL('../src/app/api/intake/route.ts', import.meta.url), 'utf8');
  assert.match(src, /export const runtime = 'nodejs';/);
  assert.match(src, /export const dynamic = 'force-dynamic';/);
  assert.match(src, /export const maxDuration = 15;/);
  assert.match(src, /from '@\/lib\/booking'/);
  assert.match(src, /allowed: \{ sectors: SECTORS, bottlenecks: BOTTLENECKS \}/);
  assert.match(src, /fallbackBookingUrl: \(answers\) => buildBookingUrl\(answers\)/);
  assert.match(src, /^const rateLimiter = createRateLimiter\(INTAKE_RATE_LIMIT\);$/m, 'one module-level limiter');
  assert.match(src, /env: process\.env/);
  assert.match(src, /export function POST\(request: Request\)/);
  assert.match(src, /export function GET\(\)[\s\S]*status: 405[\s\S]*allow: 'POST'/);
});
