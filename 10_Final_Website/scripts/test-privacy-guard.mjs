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
 *
 * The guard also refuses a production build while CAL_BOOKING_URL is not a
 * valid Cal.com link, since the notice names Cal.com as the booking page and
 * `/api/intake` would otherwise send visitors to Calendly. `PROD` below is a
 * production build with a dummy valid link, so the decision tests test only
 * the decisions.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  FOUNDER_DECISIONS,
  DECISION_LABELS,
  PLACEHOLDER,
  PRIVACY_NOTICE_VERSION,
  PRIVACY_NOTICE_VERSIONS,
  PRIVACY_EFFECTIVE_DATE,
  BOOK_NOTICE,
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

/** A production build whose Cal.com link is set (a dummy link, not the real one). */
const PROD = { VERCEL_ENV: 'production', CAL_BOOKING_URL: 'https://cal.com/test-user/test-session' };

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
    () => assertPrivacyDecisionsComplete(PROD, OPEN),
    (error) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /^\[privacy\] Production build stopped/);
      assert.match(error.message, /src\/content\/privacy\.ts/);
      for (const key of REQUIRED) {
        assert.ok(error.message.includes(key), `message does not name ${key}`);
        assert.ok(error.message.includes(DECISION_LABELS[key]), `message does not explain ${key}`);
      }
      assert.equal(error.message.includes('CAL_BOOKING_URL'), false, 'the Cal.com link is set, so it is not reported');
      return true;
    },
  );
});

test('the guard names only what is still open', () => {
  const partly = { ...FILLED, privacyEmail: PLACEHOLDER, retentionMonths: PLACEHOLDER };
  assert.throws(
    () => assertPrivacyDecisionsComplete(PROD, partly),
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
  assert.doesNotThrow(() => assertPrivacyDecisionsComplete(PROD, FILLED));
  assert.doesNotThrow(() => assertPrivacyDecisionsComplete({ ...PROD, CAL_BOOKING_URL: 'https://app.cal.com/test-user/test-session/' }, FILLED));
  // The language offer is not a required decision: off is a valid, safe answer.
  assert.doesNotThrow(() => assertPrivacyDecisionsComplete(PROD, { ...FILLED, otherLanguagesOnRequest: true }));
});

test('the guard stops a production build while CAL_BOOKING_URL is not a valid Cal.com link, even with every decision filled', () => {
  // The review finding this pins: with the decisions filled and no Cal.com
  // link, the build used to pass while every visitor went to Calendly under a
  // notice that names only Cal.com.
  for (const link of [
    undefined,
    '',
    'https://calendly.com/sheetflow51/free-automation-audit',
    'http://cal.com/test-user/test-session',
    'https://cal.com/test-user',
    'https://cal.com/test-user/test-session?x=1',
    'https://evil.example.test/cal.com/test-user/test-session',
  ]) {
    const env = { VERCEL_ENV: 'production', CAL_BOOKING_URL: link };
    assert.throws(
      () => assertPrivacyDecisionsComplete(env, FILLED),
      (error) => {
        assert.match(error.message, /^\[privacy\] Production build stopped/);
        assert.match(error.message, /CAL_BOOKING_URL/);
        assert.match(error.message, /Calendly/);
        for (const key of REQUIRED) assert.equal(error.message.includes(`${key} (`), false, `${key} is filled but was reported`);
        return true;
      },
      String(link),
    );
  }
  // Both problems at once are both named.
  assert.throws(
    () => assertPrivacyDecisionsComplete({ VERCEL_ENV: 'production' }, OPEN),
    (error) => /CAL_BOOKING_URL/.test(error.message) && REQUIRED.every((key) => error.message.includes(key)),
  );
  // Outside production a missing link is fine: previews and local builds are for review.
  for (const env of [{}, { VERCEL_ENV: 'preview' }, { VERCEL: '1', VERCEL_ENV: 'development' }]) {
    assert.doesNotThrow(() => assertPrivacyDecisionsComplete(env, FILLED), JSON.stringify(env));
  }
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
    // Placeholder look-alikes: padded, re-cased, or the page marker pasted back in.
    { grievanceOfficerName: `${PLACEHOLDER} ` },
    { grievanceOfficerName: ` ${PLACEHOLDER}` },
    { grievanceOfficerName: PLACEHOLDER.toLowerCase() },
    { grievanceOfficerName: '[To be confirmed by SheetFlow: Grievance Officer name]' },
    { postalAddress: 'To be confirmed' },
    { postalAddress: `${PLACEHOLDER}\n` },
    { privacyEmail: 'to_be_confirmed@example.test' },
  ];
  for (const change of broken) {
    const decisions = { ...FILLED, ...change };
    const [key] = Object.keys(change);
    assert.deepEqual(unfilledDecisions(decisions), [key], JSON.stringify(change));
    assert.throws(() => assertPrivacyDecisionsComplete(PROD, decisions), JSON.stringify(change));
  }
});

test('isUnfilled and unfilledDecisions', () => {
  for (const value of [
    PLACEHOLDER, `  ${PLACEHOLDER}  `, 'to_be_confirmed_by_sheetflow', pendingMarker('postalAddress'), 'TBC: to be confirmed',
    '', ' ', undefined, null, 0, -1, 2.5, Number.NaN, Infinity, {}, true,
  ]) {
    assert.equal(isUnfilled(value), true, String(value));
  }
  for (const value of ['Someone', 'privacy@example.test', '12 Confirmed Lane, Test City', 1, 12, 365]) {
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
    assert.doesNotThrow(() => assertPrivacyDecisionsComplete(PROD));
  }
  assert.doesNotThrow(() => assertPrivacyDecisionsComplete({ VERCEL_ENV: 'preview' }));
});

test('the page marker names the decision in plain words', () => {
  assert.equal(pendingMarker('privacyEmail'), '[To be confirmed by SheetFlow: privacy contact email]');
  for (const key of REQUIRED) assert.match(pendingMarker(key), /^\[To be confirmed by SheetFlow: .+\]$/);
});

test('the published notice versions: append-only, well formed, the current one last', () => {
  assert.ok(PRIVACY_NOTICE_VERSIONS.length >= 1);
  assert.equal(PRIVACY_NOTICE_VERSION, PRIVACY_NOTICE_VERSIONS.at(-1));
  assert.equal(new Set(PRIVACY_NOTICE_VERSIONS).size, PRIVACY_NOTICE_VERSIONS.length, 'no version listed twice');
  for (const version of PRIVACY_NOTICE_VERSIONS) assert.match(version, /^\d{4}-\d{2}-\d{2}\.\d+$/);
  const sorted = [...PRIVACY_NOTICE_VERSIONS].sort((a, b) => {
    const [da, na] = a.split('.');
    const [db, nb] = b.split('.');
    return da === db ? Number(na) - Number(nb) : da.localeCompare(db);
  });
  assert.deepEqual([...PRIVACY_NOTICE_VERSIONS], sorted, 'oldest first');
});

test('the /book notice gives each item its own purpose and names the analytics count', () => {
  // The booking purpose covers what the visitor types; attribution and country
  // have their own purpose, as on /privacy (a review finding: one purpose for all).
  assert.match(BOOK_NOTICE, /name, email, answers and notes to arrange and hold your free 20-minute session/);
  assert.match(BOOK_NOTICE, /which page or link brought you here and your approximate country, to see where enquiries come from\./);
  // The `booking_qualified` analytics event carries the two select answers.
  assert.match(BOOK_NOTICE, /site analytics also count your two multiple-choice answers, never your name, email or notes/);
  assert.match(BOOK_NOTICE, /Cal\.com, which runs the booking page/);
  // A few short sentences: none over 30 words.
  for (const sentence of BOOK_NOTICE.split(/(?<=\.)\s+/)) {
    assert.ok(sentence.split(/\s+/).length <= 30, `too long: ${sentence}`);
  }
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
