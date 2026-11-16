/**
 * Tests for the shared SF-I1 target and forwarder (D46): `src/lib/sf-intake.ts`.
 *
 *   node scripts/test-sf-intake.mjs
 *
 * Plain Node 24 (it strips the TypeScript types on import), no server, no
 * network: n8n is a stubbed fetch. Every secret below is a dummy.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  readIntakeTarget,
  forwardToIntake,
  readBodyCapped,
  stripControls,
  capText,
  INTAKE_PATH,
  DEFAULT_INTAKE_HEADER_NAME,
  MIN_INTAKE_SECRET_LENGTH,
  ENVELOPE_SCHEMA,
  RELAY_USER_AGENT,
} from '../src/lib/sf-intake.ts';
import { readConfig } from '../src/lib/calendly-relay.ts';

const ENV = {
  SF_INTAKE_URL: 'https://tunnel.example.test/webhook/sf-discovery-intake',
  SF_INTAKE_SECRET: 'x'.repeat(40),
};
const TARGET = { url: ENV.SF_INTAKE_URL, headerName: 'X-SF-Intake', secret: ENV.SF_INTAKE_SECRET };
const ENVELOPE = {
  schema: ENVELOPE_SCHEMA,
  event: 'lead.submitted',
  eventId: 'lead.submitted:00000000-0000-4000-8000-000000000001',
  occurredAt: '2026-11-13T10:00:00.000Z',
  source: 'site:/book',
  leadId: '00000000-0000-4000-8000-000000000001',
};

/** Stub n8n: records every call; answers with `status`/`headers`, or throws `error`. */
function stubFetch({ status = 200, headers = {}, error, body = '{}' } = {}) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init });
    if (error) throw error;
    return new Response(body, { status, headers });
  };
  return { fn, calls };
}

// --- constants ------------------------------------------------------------

test('exports the SF-I1 contract constants', () => {
  assert.equal(INTAKE_PATH, '/webhook/sf-discovery-intake');
  assert.equal(DEFAULT_INTAKE_HEADER_NAME, 'X-SF-Intake');
  assert.equal(MIN_INTAKE_SECRET_LENGTH, 32);
  assert.equal(ENVELOPE_SCHEMA, 'sf.intake.v1');
});

// --- readIntakeTarget ------------------------------------------------------

test('reads a valid target and applies the header-name default', () => {
  assert.deepEqual(readIntakeTarget(ENV), TARGET);
  assert.equal(readIntakeTarget({ ...ENV, SF_INTAKE_HEADER_NAME: 'X-Custom-Auth' }).headerName, 'X-Custom-Auth');
  assert.equal(readIntakeTarget({ ...ENV, SF_INTAKE_HEADER_NAME: '  ' }).headerName, 'X-SF-Intake');
});

test('trims pasted whitespace', () => {
  const target = readIntakeTarget({
    SF_INTAKE_URL: ` ${ENV.SF_INTAKE_URL}\n`,
    SF_INTAKE_SECRET: `${ENV.SF_INTAKE_SECRET}\r\n`,
  });
  assert.deepEqual(target, TARGET);
});

const INVALID = {
  'empty env': {},
  'no url': { ...ENV, SF_INTAKE_URL: undefined },
  'not a url': { ...ENV, SF_INTAKE_URL: 'tunnel/webhook/sf-discovery-intake' },
  'http url': { ...ENV, SF_INTAKE_URL: 'http://tunnel.example.test/webhook/sf-discovery-intake' },
  'wrong path': { ...ENV, SF_INTAKE_URL: 'https://tunnel.example.test/webhook/other' },
  'n8n test-webhook path': { ...ENV, SF_INTAKE_URL: 'https://tunnel.example.test/webhook-test/sf-discovery-intake' },
  'credentials in url': { ...ENV, SF_INTAKE_URL: 'https://u:p@tunnel.example.test/webhook/sf-discovery-intake' },
  'username only in url': { ...ENV, SF_INTAKE_URL: 'https://u@tunnel.example.test/webhook/sf-discovery-intake' },
  'fragment in url': { ...ENV, SF_INTAKE_URL: 'https://tunnel.example.test/webhook/sf-discovery-intake#x' },
  'no secret': { ...ENV, SF_INTAKE_SECRET: undefined },
  'short secret': { ...ENV, SF_INTAKE_SECRET: 'x'.repeat(31) },
  'secret with a space': { ...ENV, SF_INTAKE_SECRET: `${'x'.repeat(20)} ${'x'.repeat(20)}` },
  'secret with a newline inside': { ...ENV, SF_INTAKE_SECRET: `${'x'.repeat(20)}\n${'x'.repeat(20)}` },
  'secret with a tab inside': { ...ENV, SF_INTAKE_SECRET: `${'x'.repeat(20)}\t${'x'.repeat(20)}` },
  'secret with non-ASCII': { ...ENV, SF_INTAKE_SECRET: `${'x'.repeat(40)}é` },
  'header name with a space': { ...ENV, SF_INTAKE_HEADER_NAME: 'X SF' },
  'header name with a colon': { ...ENV, SF_INTAKE_HEADER_NAME: 'X-SF:' },
  'header name too long': { ...ENV, SF_INTAKE_HEADER_NAME: `X-${'a'.repeat(63)}` },
  'reserved: Content-Type': { ...ENV, SF_INTAKE_HEADER_NAME: 'Content-Type' },
  'reserved: host': { ...ENV, SF_INTAKE_HEADER_NAME: 'host' },
  'reserved: Content-Length': { ...ENV, SF_INTAKE_HEADER_NAME: 'Content-Length' },
  'reserved: Connection': { ...ENV, SF_INTAKE_HEADER_NAME: 'Connection' },
  'reserved: Transfer-Encoding': { ...ENV, SF_INTAKE_HEADER_NAME: 'Transfer-Encoding' },
  'reserved: User-Agent': { ...ENV, SF_INTAKE_HEADER_NAME: 'User-Agent' },
  'reserved: ngrok-skip-browser-warning': { ...ENV, SF_INTAKE_HEADER_NAME: 'Ngrok-Skip-Browser-Warning' },
  'reserved: Calendly signature': { ...ENV, SF_INTAKE_HEADER_NAME: 'Calendly-Webhook-Signature' },
  'reserved: Cal.com signature': { ...ENV, SF_INTAKE_HEADER_NAME: 'X-Cal-Signature-256' },
};

test('returns null for missing or invalid targets', () => {
  for (const [name, env] of Object.entries(INVALID)) {
    assert.equal(readIntakeTarget(env), null, name);
  }
});

test('agrees with the Calendly relay (D45) on every shared rule', () => {
  // The names this module reserves on top of D45's list are the only intended difference.
  const added = new Set(['reserved: User-Agent', 'reserved: ngrok-skip-browser-warning', 'reserved: Cal.com signature']);
  const KEY = 'test-signing-key-not-a-real-one';
  const cases = { valid: ENV, 'custom header': { ...ENV, SF_INTAKE_HEADER_NAME: 'X-Hook-Key' }, ...INVALID };
  for (const [name, env] of Object.entries(cases)) {
    const mine = readIntakeTarget(env);
    const theirs = readConfig({ ...env, CALENDLY_WEBHOOK_SIGNING_KEY: KEY });
    if (added.has(name)) {
      assert.equal(mine, null, name);
      assert.notEqual(theirs, null, `${name} is accepted by D45`);
      continue;
    }
    assert.equal(mine === null, theirs === null, name);
    if (mine && theirs) {
      assert.deepEqual(mine, { url: theirs.intakeUrl, headerName: theirs.headerName, secret: theirs.secret }, name);
    }
  }
});

// --- forwardToIntake -------------------------------------------------------

test('posts the envelope as JSON with the secret, ngrok and user-agent headers', async () => {
  const stub = stubFetch({ status: 200 });
  const result = await forwardToIntake(TARGET, ENVELOPE, { fetch: stub.fn, timeoutMs: 1000 });
  assert.deepEqual(result, { ok: true, outcome: 'forwarded' });
  assert.equal(stub.calls.length, 1);
  const { url, init } = stub.calls[0];
  assert.equal(url, TARGET.url);
  assert.equal(init.method, 'POST');
  assert.equal(init.body, JSON.stringify(ENVELOPE));
  assert.deepEqual(init.headers, {
    'content-type': 'application/json',
    'X-SF-Intake': TARGET.secret,
    'ngrok-skip-browser-warning': '1',
    'user-agent': RELAY_USER_AGENT,
  });
  assert.equal(RELAY_USER_AGENT, 'sheetflow-site-relay/1');
  assert.equal(init.redirect, 'error');
  assert.equal(init.cache, 'no-store');
  assert.ok(init.signal instanceof AbortSignal);
});

test('never forwards an inbound signature header', async () => {
  const stub = stubFetch();
  await forwardToIntake({ ...TARGET, headerName: 'X-Hook-Key' }, ENVELOPE, { fetch: stub.fn, timeoutMs: 1000 });
  const names = Object.keys(stub.calls[0].init.headers).map((h) => h.toLowerCase());
  assert.equal(stub.calls[0].init.headers['X-Hook-Key'], TARGET.secret);
  for (const forbidden of ['x-cal-signature-256', 'calendly-webhook-signature', 'x-sf-intake']) {
    assert.equal(names.includes(forbidden), false, forbidden);
  }
});

test('treats any 2xx as forwarded', async () => {
  for (const status of [200, 201, 202, 204]) {
    const result = await forwardToIntake(TARGET, ENVELOPE, {
      fetch: stubFetch({ status, body: status === 204 ? null : '{}' }).fn,
      timeoutMs: 1000,
    });
    assert.deepEqual(result, { ok: true, outcome: 'forwarded' }, String(status));
  }
});

test('labels n8n and ngrok failures apart', async () => {
  const cases = [
    [{ status: 404 }, 'upstream_404'], // n8n: workflow inactive or webhook not registered
    [{ status: 404, headers: { 'ngrok-error-code': 'ERR_NGROK_3200' } }, 'ngrok_ERR_NGROK_3200'], // tunnel offline
    [{ status: 429, headers: { 'ngrok-error-code': 'ERR_NGROK_727' } }, 'ngrok_ERR_NGROK_727'], // monthly quota
    [{ status: 401 }, 'upstream_401'],
    [{ status: 500 }, 'upstream_500'],
    [{ status: 502 }, 'upstream_502'],
    [{ status: 302 }, 'upstream_302'], // a stub that hands back a redirect instead of refusing it
    // Anything not shaped like an ngrok code is not echoed into the label.
    [{ status: 404, headers: { 'ngrok-error-code': 'ERR_NGROK_3200 injected' } }, 'upstream_404'],
    [{ status: 404, headers: { 'ngrok-error-code': 'err_ngrok_3200' } }, 'upstream_404'],
    [{ status: 404, headers: { 'ngrok-error-code': 'ERR_NGROK_123456' } }, 'upstream_404'],
  ];
  for (const [response, outcome] of cases) {
    const result = await forwardToIntake(TARGET, ENVELOPE, { fetch: stubFetch(response).fn, timeoutMs: 1000 });
    assert.deepEqual(result, { ok: false, outcome }, outcome);
  }
});

test('reports a real timeout as upstream_timeout', async () => {
  // A stub that never answers: only the AbortSignal.timeout ends it.
  const hang = (url, init) =>
    new Promise((resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(init.signal.reason));
    });
  const started = Date.now();
  const result = await forwardToIntake(TARGET, ENVELOPE, { fetch: hang, timeoutMs: 30 });
  assert.deepEqual(result, { ok: false, outcome: 'upstream_timeout' });
  assert.ok(Date.now() - started < 2000);
});

test('reports a network error, a refused redirect or a non-Error throw as upstream_unreachable', async () => {
  const down = await forwardToIntake(TARGET, ENVELOPE, {
    fetch: stubFetch({ error: new TypeError('fetch failed') }).fn,
    timeoutMs: 1000,
  });
  assert.deepEqual(down, { ok: false, outcome: 'upstream_unreachable' });

  // What fetch does with redirect: 'error' when the upstream answers 3xx.
  const calls = [];
  const refusing = async (url, init) => {
    calls.push(init);
    if (init.redirect === 'error') throw new TypeError('fetch failed: unexpected redirect');
    return new Response(null, { status: 302, headers: { location: 'https://elsewhere.example.test/' } });
  };
  const redirected = await forwardToIntake(TARGET, ENVELOPE, { fetch: refusing, timeoutMs: 1000 });
  assert.deepEqual(redirected, { ok: false, outcome: 'upstream_unreachable' });
  assert.equal(calls[0].redirect, 'error');

  const weird = await forwardToIntake(TARGET, ENVELOPE, {
    fetch: async () => {
      throw 'not an Error';
    },
    timeoutMs: 1000,
  });
  assert.deepEqual(weird, { ok: false, outcome: 'upstream_unreachable' });
});

test('never throws, even for an envelope that cannot be serialised', async () => {
  const stub = stubFetch();
  const result = await forwardToIntake(TARGET, { ...ENVELOPE, bad: 1n }, { fetch: stub.fn, timeoutMs: 1000 });
  assert.deepEqual(result, { ok: false, outcome: 'upstream_unreachable' });
  assert.equal(stub.calls.length, 0);
});

test('releases the response body', async () => {
  for (const status of [200, 500]) {
    let cancelled = false;
    const stream = new ReadableStream({
      pull(controller) {
        controller.enqueue(new TextEncoder().encode('x'.repeat(1024)));
      },
      cancel() {
        cancelled = true;
      },
    });
    const fetchFn = async () => new Response(stream, { status });
    await forwardToIntake(TARGET, ENVELOPE, { fetch: fetchFn, timeoutMs: 1000 });
    assert.equal(cancelled, true, `body released on ${status}`);
  }
});

test('never logs anything itself', async () => {
  const printed = [];
  const original = { log: console.log, info: console.info, warn: console.warn, error: console.error };
  for (const level of Object.keys(original)) console[level] = (...args) => printed.push(args);
  try {
    await forwardToIntake(TARGET, ENVELOPE, { fetch: stubFetch({ status: 500 }).fn, timeoutMs: 1000 });
    await forwardToIntake(TARGET, ENVELOPE, { fetch: stubFetch({ error: new TypeError('x') }).fn, timeoutMs: 1000 });
  } finally {
    Object.assign(console, original);
  }
  assert.deepEqual(printed, []);
});

// --- readBodyCapped --------------------------------------------------------

function streamOf(chunks, { fail = false } = {}) {
  let i = 0;
  return new ReadableStream({
    pull(controller) {
      if (i < chunks.length) controller.enqueue(new TextEncoder().encode(chunks[i++]));
      else if (fail) controller.error(new Error('connection reset'));
      else controller.close();
    },
  });
}

function streamed(stream, headers = {}) {
  return new Request('https://sheetflow.click/api/x', { method: 'POST', body: stream, duplex: 'half', headers });
}

test('reads a body within the cap', async () => {
  const result = await readBodyCapped(new Request('https://sheetflow.click/api/x', { method: 'POST', body: 'héllo' }), 100);
  assert.equal(result.ok, true);
  assert.equal(new TextDecoder().decode(result.bytes), 'héllo');
  const empty = await readBodyCapped(new Request('https://sheetflow.click/api/x', { method: 'POST' }), 100);
  assert.deepEqual(empty, { ok: true, bytes: new Uint8Array(0) });
});

test('refuses by declared length without reading', async () => {
  let pulled = false;
  // highWaterMark 0: the stream only pulls when someone actually reads it.
  const stream = new ReadableStream(
    {
      pull(controller) {
        pulled = true;
        controller.close();
      },
    },
    { highWaterMark: 0 },
  );
  const result = await readBodyCapped(streamed(stream, { 'content-length': '101' }), 100);
  assert.deepEqual(result, { ok: false, reason: 'too_large' });
  assert.equal(pulled, false);
});

test('refuses by actual size when the declared length is absent or wrong', async () => {
  const chunked = await readBodyCapped(streamed(streamOf(['x'.repeat(60), 'x'.repeat(60)])), 100);
  assert.deepEqual(chunked, { ok: false, reason: 'too_large' });
  const lying = await readBodyCapped(
    new Request('https://sheetflow.click/api/x', { method: 'POST', body: 'x'.repeat(500), headers: { 'content-length': '5' } }),
    100,
  );
  assert.deepEqual(lying, { ok: false, reason: 'too_large' });
  const exact = await readBodyCapped(streamed(streamOf(['x'.repeat(50), 'x'.repeat(50)])), 100);
  assert.equal(exact.ok, true);
  assert.equal(exact.bytes.byteLength, 100);
});

test('reports a body that fails mid-stream as unreadable', async () => {
  const result = await readBodyCapped(streamed(streamOf(['abc'], { fail: true })), 100);
  assert.deepEqual(result, { ok: false, reason: 'unreadable' });
});

// --- text helpers ----------------------------------------------------------

test('stripControls removes control characters and keeps words apart', () => {
  assert.equal(stripControls('Priya\tSharma'), 'Priya Sharma');
  assert.equal(stripControls('a\u0000b\u0007c\u007fd\u009be'), 'abcde');
  assert.equal(stripControls('one\r\ntwo\nthree'), 'one  two three');
  assert.equal(stripControls('one\r\ntwo\rthree\nfour', true), 'one\ntwo\nthree\nfour');
  assert.equal(stripControls('tab\there', true), 'tab here');
  assert.equal(stripControls('प्रिया शर्मा ‍'), 'प्रिया शर्मा ‍', 'joiners used by Indic scripts are not control characters');
});

test('capText never splits a surrogate pair', () => {
  assert.equal(capText('abcdef', 3), 'abc');
  assert.equal(capText('ab😀', 3), 'ab');
  assert.equal(capText('ab😀', 4), 'ab😀');
  assert.equal(capText('short', 100), 'short');
});
