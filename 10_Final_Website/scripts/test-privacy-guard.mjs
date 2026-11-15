/**
 * Tests for the privacy notice's production guard and its helpers (D47):
 * `src/content/privacy.ts` and `src/lib/url-privacy.ts`.
 *
 *   node scripts/test-privacy-guard.mjs
 *
 * Plain Node 24, no server. The guard is what stops an accidental merge from
 * publishing "[To be confirmed by SheetFlow: ...]" as the live privacy notice:
 * the site has no CI, so the Vercel production build is the only gate. These
 * tests drive the guard with injected decisions, so they keep passing after
 * the founder fills in the real ones; the real build-time behaviour is checked
 * separately by running `VERCEL_ENV=production npx next build --webpack`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  FOUNDER_DECISIONS,
  DECISION_LABELS,
  PLACEHOLDER,
  PRIVACY_NOTICE_VERSION,
  PRIVACY_EFFECTIVE_DATE,
  assertPrivacyDecisionsComplete,
  isUnfilled,
  pendingMarker,
  unfilledDecisions,
} from '../src/content/privacy.ts';
import { withoutQueryOrHash } from '../src/lib/url-privacy.ts';

const REQUIRED = ['grievanceOfficerName', 'privacyEmail', 'postalAddress', 'retentionMonths', 'aiTrainingRemovalDays'];

/** Every decision still open, as the file ships today. */
const OPEN = {
  grievanceOfficerName: PLACEHOLDER,
  privacyEmail: PLACEHOLDER,
  postalAddress: PLACEHOLDER,
  retentionMonths: PLACEHOLDER,
  aiTrainingRemovalDays: PLACEHOLDER,
  otherLanguagesOnRequest: false,
};

/** Dummy answers: a test fixture, not a suggestion for the real values. */
const FILLED = {
  grievanceOfficerName: 'Test Person',
  privacyEmail: 'privacy@example.test',
  postalAddress: '1 Test Road, Test City 000000',
  retentionMonths: 12,
  aiTrainingRemovalDays: 30,
  otherLanguagesOnRequest: false,
};

test('the guard throws on a production build while any decision is open, naming every open one', () => {
  assert.throws(
    () => assertPrivacyDecisionsComplete({ VERCEL_ENV: 'production' }, OPEN),
    (error) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /^\[privacy\] Production build stopped/);
      assert.match(error.message, /src\/content\/privacy\.ts/);
      for (const key of REQUIRED) {
        assert.ok(error.message.includes(key), `message does not name ${key}`);
        assert.ok(error.message.includes(DECISION_LABELS[key]), `message does not explain ${key}`);
      }
      return true;
    },
  );
});

test('the guard names only what is still open', () => {
  const partly = { ...FILLED, privacyEmail: PLACEHOLDER, retentionMonths: PLACEHOLDER };
  assert.throws(
    () => assertPrivacyDecisionsComplete({ VERCEL_ENV: 'production' }, partly),
    (error) => {
      assert.match(error.message, /privacyEmail/);
      assert.match(error.message, /retentionMonths/);
      for (const key of ['grievanceOfficerName', 'postalAddress', 'aiTrainingRemovalDays']) {
        assert.equal(error.message.includes(key), false, `${key} is filled but was reported`);
      }
      return true;
    },
  );
});

test('the guard does nothing outside a Vercel production build', () => {
  for (const env of [{}, { VERCEL_ENV: 'preview' }, { VERCEL_ENV: 'development' }, { VERCEL_ENV: '' }, { VERCEL_ENV: 'Production' }, { NODE_ENV: 'production' }, { VERCEL: '1' }]) {
    assert.doesNotThrow(() => assertPrivacyDecisionsComplete(env, OPEN), JSON.stringify(env));
  }
});

test('the guard passes a production build once every decision is filled', () => {
  assert.doesNotThrow(() => assertPrivacyDecisionsComplete({ VERCEL_ENV: 'production' }, FILLED));
  // The language offer is not a required decision: off is a valid, safe answer.
  assert.doesNotThrow(() => assertPrivacyDecisionsComplete({ VERCEL_ENV: 'production' }, { ...FILLED, otherLanguagesOnRequest: true }));
});

test('a value blanked or mistyped by hand still stops the build', () => {
  const broken = [
    { grievanceOfficerName: '' },
    { grievanceOfficerName: '   ' },
    { postalAddress: '' },
    { privacyEmail: 'not an email' },
    { privacyEmail: 'privacy@localhost' },
    { retentionMonths: 0 },
    { retentionMonths: -3 },
    { retentionMonths: 1.5 },
    { retentionMonths: Number.NaN },
    { aiTrainingRemovalDays: '30' },
    { aiTrainingRemovalDays: undefined },
  ];
  for (const change of broken) {
    const decisions = { ...FILLED, ...change };
    const [key] = Object.keys(change);
    assert.deepEqual(unfilledDecisions(decisions), [key], JSON.stringify(change));
    assert.throws(() => assertPrivacyDecisionsComplete({ VERCEL_ENV: 'production' }, decisions), JSON.stringify(change));
  }
});

test('isUnfilled and unfilledDecisions', () => {
  for (const value of [PLACEHOLDER, '', ' ', undefined, null, 0, -1, 2.5, Number.NaN, Infinity, {}, true]) {
    assert.equal(isUnfilled(value), true, String(value));
  }
  for (const value of ['Someone', 'privacy@example.test', 1, 12, 365]) {
    assert.equal(isUnfilled(value), false, String(value));
  }
  assert.deepEqual(unfilledDecisions(OPEN), REQUIRED, 'a stable order: the order of the labels');
  assert.deepEqual(unfilledDecisions(FILLED), []);
  assert.deepEqual(Object.keys(DECISION_LABELS), REQUIRED);
});

test('the shipped decisions: the defaults read FOUNDER_DECISIONS, and the guard agrees with the report', () => {
  // No assumption about which decisions the founder has made by now, so this
  // keeps passing once he fills them in.
  const open = unfilledDecisions();
  assert.deepEqual(open, unfilledDecisions(FOUNDER_DECISIONS));
  for (const key of open) assert.ok(REQUIRED.includes(key), key);
  assert.equal(typeof FOUNDER_DECISIONS.otherLanguagesOnRequest, 'boolean');
  if (open.length > 0) {
    assert.throws(() => assertPrivacyDecisionsComplete({ VERCEL_ENV: 'production' }));
  } else {
    assert.doesNotThrow(() => assertPrivacyDecisionsComplete({ VERCEL_ENV: 'production' }));
  }
  assert.doesNotThrow(() => assertPrivacyDecisionsComplete({ VERCEL_ENV: 'preview' }));
});

test('the page marker names the decision in plain words', () => {
  assert.equal(pendingMarker('privacyEmail'), '[To be confirmed by SheetFlow: privacy contact email]');
  for (const key of REQUIRED) assert.match(pendingMarker(key), /^\[To be confirmed by SheetFlow: .+\]$/);
});

test('the notice version and effective date agree', () => {
  assert.match(PRIVACY_NOTICE_VERSION, /^\d{4}-\d{2}-\d{2}\.\d+$/);
  const [y, m, d] = PRIVACY_NOTICE_VERSION.split('.')[0].split('-').map(Number);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  assert.equal(PRIVACY_EFFECTIVE_DATE, `${d} ${months[m - 1]} ${y}`);
});

test('the /privacy page module calls the guard when it loads, with the real environment', async () => {
  const src = await readFile(new URL('../src/app/privacy/page.tsx', import.meta.url), 'utf8');
  // At the top level (column 0), not inside a component, so it runs during `next build`.
  assert.match(src, /^assertPrivacyDecisionsComplete\(process\.env\);$/m);
  assert.match(src, /from '@\/content\/privacy'/);
  assert.doesNotMatch(src, /export const dynamic = 'force-dynamic'/, 'the page must stay static, so the guard runs at build time');
  // Never the statutory title this business does not hold, and no compliance
  // claims, in the copy itself (the comments explain why, so they are left out).
  const copy = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  assert.doesNotMatch(copy, /Data Protection Officer|DPDP[- ]compliant|certified|GDPR|CCPA|bank-grade|100% secure/i);
});

test('withoutQueryOrHash keeps the origin and path, drops the query and fragment', () => {
  const cases = [
    ['https://sheetflow.click/book?utm_source=x&email=a%40b.test#top', 'https://sheetflow.click/book'],
    ['https://sheetflow.click/book/confirmed?name=A&email=a%40b.test&uid=abc', 'https://sheetflow.click/book/confirmed'],
    ['https://sheetflow.click/', 'https://sheetflow.click/'],
    ['https://sheetflow.click', 'https://sheetflow.click/'],
    ['http://localhost:3000/pricing?x=1', 'http://localhost:3000/pricing'],
    ['https://sheetflow.click/work/a-b#faq', 'https://sheetflow.click/work/a-b'],
    ['/book?utm_source=x', '/book'],
    ['/book#x', '/book'],
    ['', ''],
  ];
  for (const [input, expected] of cases) assert.equal(withoutQueryOrHash(input), expected, input);
});
