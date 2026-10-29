/**
 * Tests for the Calendly webhook relay (D45): `src/lib/calendly-relay.ts`.
 *
 *   node scripts/test-calendly-relay.mjs
 *
 * Plain Node 24 (it strips the TypeScript types on import), no server, no
 * network: the route's handler is driven with real `Request` objects and a
 * stubbed fetch standing in for n8n. Every key and secret below is a dummy.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import {
  parseSignatureHeader,
  verifySignature,
  shouldForward,
  readConfig,
  handleCalendlyWebhook,
  MAX_BODY_BYTES,
} from '../src/lib/calendly-relay.ts';

const KEY = 'test-signing-key-not-a-real-one';
const NOW = 1_800_000_000;
const ENV = {
  CALENDLY_WEBHOOK_SIGNING_KEY: KEY,
  SF_INTAKE_URL: 'https://tunnel.example.test/webhook/sf-discovery-intake',
  SF_INTAKE_SECRET: 'x'.repeat(40),
};
const CREATED = JSON.stringify({
  event: 'invitee.created',
  created_at: '2026-10-29T10:00:00.000000Z',
  created_by: 'https://api.calendly.com/users/TEST',
  payload: { email: 'test@example.test', name: 'Test Person', questions_and_answers: [] },
});
const CANCELED = JSON.stringify({ event: 'invitee.canceled', payload: {} });

function sign(body, t = NOW, key = KEY) {
  const v1 = createHmac('sha256', key).update(`${t}.${body}`).digest('hex');
  return `t=${t},v1=${v1}`;
}

function post(body, signature, extraHeaders = {}) {
  const headers = { 'content-type': 'application/json', ...extraHeaders };
  if (signature !== undefined) headers['Calendly-Webhook-Signature'] = signature;
  return new Request('https://sheetflow.click/api/calendly', { method: 'POST', headers, body });
}

/** Stub n8n: records every call, answers with `status` (or throws `error`). */
function stubFetch({ status = 200, error } = {}) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init });
    if (error) throw error;
    return new Response('{}', { status });
  };
  return { fn, calls };
}

function run(request, { env = ENV, fetchStub = stubFetch(), now = NOW } = {}) {
  const lines = [];
  return handleCalendlyWebhook(request, {
    env,
    fetch: fetchStub.fn,
    now: () => now,
    log: (l) => lines.push(l),
  }).then((res) => ({ res, lines, calls: fetchStub.calls }));
}

// --- parseSignatureHeader -------------------------------------------------

test('parses a well-formed header, tolerating spaces and unknown keys', () => {
  const v1 = 'a'.repeat(64);
  assert.deepEqual(parseSignatureHeader(`t=123, v1=${v1}`), { t: 123, v1: [v1] });
  assert.deepEqual(parseSignatureHeader(`t=123,v0=zz,v1=${v1.toUpperCase()}`), { t: 123, v1: [v1] });
});

test('rejects malformed headers', () => {
  const v1 = 'a'.repeat(64);
  for (const bad of [
    undefined,
    null,
    '',
    'garbage',
    `v1=${v1}`, // no t
    't=123', // no v1
    `t=abc,v1=${v1}`,
    `t=123,v1=${'a'.repeat(63)}`,
    `t=123,v1=${'g'.repeat(64)}`,
    `t=1,t=2,v1=${v1}`,
    `t=123,v1=${v1},junk`,
    `t=123,v1=${v1},${'x'.repeat(1100)}`,
  ]) {
    assert.equal(parseSignatureHeader(bad), null, `should reject: ${String(bad).slice(0, 40)}`);
  }
});

// --- verifySignature ------------------------------------------------------

test('accepts a valid signature', () => {
  assert.deepEqual(verifySignature(CREATED, sign(CREATED), KEY, NOW), { ok: true });
});

test('accepts any of several v1 values (key rotation)', () => {
  const good = sign(CREATED).split(',v1=')[1];
  const header = `t=${NOW},v1=${'0'.repeat(64)},v1=${good}`;
  assert.deepEqual(verifySignature(CREATED, header, KEY, NOW), { ok: true });
});

test('rejects a signature made with the wrong key', () => {
  const header = sign(CREATED, NOW, 'some-other-signing-key-123');
  assert.deepEqual(verifySignature(CREATED, header, KEY, NOW), { ok: false, reason: 'mismatch' });
});

test('rejects a tampered body', () => {
  const tampered = CREATED.replace('Test Person', 'Mallory');
  assert.deepEqual(verifySignature(tampered, sign(CREATED), KEY, NOW), { ok: false, reason: 'mismatch' });
});

test('rejects a body re-serialised with different whitespace', () => {
  const pretty = JSON.stringify(JSON.parse(CREATED), null, 2);
  assert.equal(verifySignature(pretty, sign(CREATED), KEY, NOW).ok, false);
});

test('rejects a stale or future timestamp, accepts the edge of the window', () => {
  assert.deepEqual(verifySignature(CREATED, sign(CREATED, NOW - 181), KEY, NOW), { ok: false, reason: 'stale' });
  assert.deepEqual(verifySignature(CREATED, sign(CREATED, NOW + 181), KEY, NOW), { ok: false, reason: 'stale' });
  assert.deepEqual(verifySignature(CREATED, sign(CREATED, NOW - 180), KEY, NOW), { ok: true });
  assert.deepEqual(verifySignature(CREATED, sign(CREATED, NOW - 30), KEY, NOW, 10), { ok: false, reason: 'stale' });
});

test('reports a missing or malformed header', () => {
  assert.deepEqual(verifySignature(CREATED, null, KEY, NOW), { ok: false, reason: 'missing' });
  assert.deepEqual(verifySignature(CREATED, '', KEY, NOW), { ok: false, reason: 'missing' });
  assert.deepEqual(verifySignature(CREATED, 't=1,v1=xyz', KEY, NOW), { ok: false, reason: 'malformed' });
});

test('signs non-ASCII bodies over their UTF-8 bytes', () => {
  const body = JSON.stringify({ event: 'invitee.created', payload: { name: 'Priya Sharma, Pune' } });
  assert.deepEqual(verifySignature(body, sign(body), KEY, NOW), { ok: true });
});

// --- shouldForward --------------------------------------------------------

test('forwards only invitee.created', () => {
  assert.equal(shouldForward(JSON.parse(CREATED)), true);
  for (const event of ['invitee.canceled', 'invitee_no_show.created', 'routing_form_submission.created', 'INVITEE.CREATED']) {
    assert.equal(shouldForward({ event }), false, event);
  }
  for (const junk of [null, undefined, 'invitee.created', 42, [], {}]) {
    assert.equal(shouldForward(junk), false);
  }
});

// --- readConfig -----------------------------------------------------------

test('reads a valid config and applies the header-name default', () => {
  assert.deepEqual(readConfig(ENV), {
    signingKey: KEY,
    intakeUrl: ENV.SF_INTAKE_URL,
    headerName: 'X-SF-Intake',
    secret: ENV.SF_INTAKE_SECRET,
  });
  assert.equal(readConfig({ ...ENV, SF_INTAKE_HEADER_NAME: 'X-Custom-Auth' }).headerName, 'X-Custom-Auth');
  assert.equal(readConfig({ ...ENV, SF_INTAKE_HEADER_NAME: '  ' }).headerName, 'X-SF-Intake');
});

test('trims pasted whitespace', () => {
  const cfg = readConfig({ ...ENV, SF_INTAKE_SECRET: `${ENV.SF_INTAKE_SECRET}\n`, SF_INTAKE_URL: ` ${ENV.SF_INTAKE_URL} ` });
  assert.equal(cfg.secret, ENV.SF_INTAKE_SECRET);
  assert.equal(cfg.intakeUrl, ENV.SF_INTAKE_URL);
});

test('returns null for missing or invalid config', () => {
  const cases = {
    'empty env': {},
    'no signing key': { ...ENV, CALENDLY_WEBHOOK_SIGNING_KEY: undefined },
    'short signing key': { ...ENV, CALENDLY_WEBHOOK_SIGNING_KEY: 'short' },
    'no url': { ...ENV, SF_INTAKE_URL: undefined },
    'not a url': { ...ENV, SF_INTAKE_URL: 'tunnel/webhook/sf-discovery-intake' },
    'http url': { ...ENV, SF_INTAKE_URL: 'http://tunnel.example.test/webhook/sf-discovery-intake' },
    'wrong path': { ...ENV, SF_INTAKE_URL: 'https://tunnel.example.test/webhook/other' },
    'n8n test-webhook path': { ...ENV, SF_INTAKE_URL: 'https://tunnel.example.test/webhook-test/sf-discovery-intake' },
    'credentials in url': { ...ENV, SF_INTAKE_URL: 'https://u:p@tunnel.example.test/webhook/sf-discovery-intake' },
    'fragment in url': { ...ENV, SF_INTAKE_URL: 'https://tunnel.example.test/webhook/sf-discovery-intake#x' },
    'no secret': { ...ENV, SF_INTAKE_SECRET: undefined },
    'short secret': { ...ENV, SF_INTAKE_SECRET: 'x'.repeat(31) },
    'secret with a space': { ...ENV, SF_INTAKE_SECRET: `${'x'.repeat(20)} ${'x'.repeat(20)}` },
    'header name with a space': { ...ENV, SF_INTAKE_HEADER_NAME: 'X SF' },
    'reserved header name': { ...ENV, SF_INTAKE_HEADER_NAME: 'Content-Type' },
    'signature header name': { ...ENV, SF_INTAKE_HEADER_NAME: 'Calendly-Webhook-Signature' },
  };
  for (const [name, env] of Object.entries(cases)) {
    assert.equal(readConfig(env), null, name);
  }
});

// --- handleCalendlyWebhook (the route's POST) -----------------------------

test('forwards a signed invitee.created with the original body and the secret header', async () => {
  const fetchStub = stubFetch({ status: 200 });
  const { res, lines, calls } = await run(post(CREATED, sign(CREATED)), { fetchStub });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, forwarded: true });
  assert.equal(calls.length, 1);
  const { url, init } = calls[0];
  assert.equal(url, ENV.SF_INTAKE_URL);
  assert.equal(init.method, 'POST');
  assert.equal(init.body, CREATED, 'body must be forwarded byte-for-byte');
  assert.equal(init.headers['content-type'], 'application/json');
  assert.equal(init.headers['X-SF-Intake'], ENV.SF_INTAKE_SECRET);
  assert.equal(Object.keys(init.headers).some((h) => h.toLowerCase() === 'calendly-webhook-signature'), false);
  assert.equal(init.redirect, 'error');
  assert.ok(init.signal instanceof AbortSignal);
  assert.deepEqual(lines, ['[calendly-relay] event=invitee.created outcome=forwarded']);
});

test('uses a custom header name', async () => {
  const fetchStub = stubFetch();
  await run(post(CREATED, sign(CREATED)), { env: { ...ENV, SF_INTAKE_HEADER_NAME: 'X-Hook-Key' }, fetchStub });
  assert.equal(fetchStub.calls[0].init.headers['X-Hook-Key'], ENV.SF_INTAKE_SECRET);
});

test('acknowledges other events without forwarding', async () => {
  const { res, calls, lines } = await run(post(CANCELED, sign(CANCELED)));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, forwarded: false });
  assert.equal(calls.length, 0);
  assert.deepEqual(lines, ['[calendly-relay] event=invitee.canceled outcome=ignored']);
});

test('answers 503 and does nothing else when config is missing', async () => {
  const { res, calls } = await run(post(CREATED, sign(CREATED)), { env: {} });
  assert.equal(res.status, 503);
  assert.equal(calls.length, 0);
});

test('answers 401 for a missing, wrong, tampered or stale signature', async () => {
  const cases = [
    post(CREATED, undefined),
    post(CREATED, 'nonsense'),
    post(CREATED, sign(CREATED, NOW, 'some-other-signing-key-123')),
    post(CREATED.replace('Test Person', 'Mallory'), sign(CREATED)),
    post(CREATED, sign(CREATED, NOW - 600)),
  ];
  for (const request of cases) {
    const { res, calls } = await run(request);
    assert.equal(res.status, 401);
    assert.equal(calls.length, 0);
  }
});

test('answers 413 for a body over 64 KB, by header or by actual size', async () => {
  const big = JSON.stringify({ event: 'invitee.created', pad: 'x'.repeat(MAX_BODY_BYTES) });
  const byActual = await run(post(big, sign(big)));
  assert.equal(byActual.res.status, 413);
  assert.equal(byActual.calls.length, 0);

  const byHeader = await run(post(CREATED, sign(CREATED), { 'content-length': String(MAX_BODY_BYTES + 1) }));
  assert.equal(byHeader.res.status, 413);
});

test('answers 400 for a signed body that is not JSON', async () => {
  const body = 'not json';
  const { res, calls } = await run(post(body, sign(body)));
  assert.equal(res.status, 400);
  assert.equal(calls.length, 0);
});

test('answers 502 when n8n fails, so Calendly retries', async () => {
  for (const status of [401, 404, 500, 302]) {
    const { res, lines } = await run(post(CREATED, sign(CREATED)), { fetchStub: stubFetch({ status }) });
    assert.equal(res.status, 502, `n8n ${status}`);
    assert.deepEqual(lines, [`[calendly-relay] event=invitee.created outcome=upstream_${status}`]);
  }
  const timeout = Object.assign(new Error('timed out'), { name: 'TimeoutError' });
  const t = await run(post(CREATED, sign(CREATED)), { fetchStub: stubFetch({ error: timeout }) });
  assert.equal(t.res.status, 502);
  assert.deepEqual(t.lines, ['[calendly-relay] event=invitee.created outcome=upstream_timeout']);
  const down = await run(post(CREATED, sign(CREATED)), { fetchStub: stubFetch({ error: new TypeError('fetch failed') }) });
  assert.equal(down.res.status, 502);
  assert.deepEqual(down.lines, ['[calendly-relay] event=invitee.created outcome=upstream_unreachable']);
});

test('never logs the body, the secret or the signature', async () => {
  const all = [];
  const requests = [
    post(CREATED, sign(CREATED)),
    post(CANCELED, sign(CANCELED)),
    post(CREATED, 'nonsense'),
  ];
  for (const request of requests) all.push(...(await run(request)).lines);
  const sig = sign(CREATED).split('v1=')[1];
  for (const line of all) {
    for (const leak of [ENV.SF_INTAKE_SECRET, KEY, sig, 'test@example.test', 'Test Person', 'nonsense']) {
      assert.equal(line.includes(leak), false, `log line leaks: ${line}`);
    }
  }
});

test('an unexpected event name is logged as unknown', async () => {
  const body = JSON.stringify({ event: 'evil\nINJECTED line' });
  const { lines } = await run(post(body, sign(body)));
  assert.deepEqual(lines, ['[calendly-relay] event=unknown outcome=ignored']);
});

// --- route module ---------------------------------------------------------

test('the route file exports POST + GET, nodejs runtime, force-dynamic', async () => {
  const { readFile } = await import('node:fs/promises');
  const src = await readFile(new URL('../src/app/api/calendly/route.ts', import.meta.url), 'utf8');
  assert.match(src, /export const runtime = 'nodejs';/);
  assert.match(src, /export const dynamic = 'force-dynamic';/);
  assert.match(src, /export function POST\(request: Request\)/);
  assert.match(src, /export function GET\(\)[\s\S]*status: 405/);
  assert.match(src, /env: process\.env/);
});
