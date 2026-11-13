/**
 * Tests for the Cal.com webhook relay (D46): `src/lib/cal-webhook.ts`.
 *
 *   node scripts/test-cal-webhook.mjs
 *
 * Plain Node 24 (it strips the TypeScript types on import), no server, no
 * network: the handler is driven with real `Request` objects and a stubbed
 * fetch standing in for n8n. The payloads are reconstructed from Cal.com's
 * documented webhook shapes (see the research notes cited in the module), with
 * dummy people, ids and links throughout. Every secret below is a dummy.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import {
  readCalConfig,
  verifyCalSignature,
  normalizeCalEvent,
  isoTimestamp,
  handleCalWebhook,
  MAX_CAL_BODY_BYTES,
  CAL_FORWARD_TIMEOUT_MS,
  NO_SECRET_SIGNATURE,
} from '../src/lib/cal-webhook.ts';

const SECRET = 'test-cal-webhook-secret-not-real';
const INTAKE_SECRET = 'test-intake-secret-'.padEnd(40, 'x');
const ENV = {
  CAL_WEBHOOK_SECRET: SECRET,
  SF_INTAKE_URL: 'https://tunnel.example.test/webhook/sf-discovery-intake',
  SF_INTAKE_SECRET: INTAKE_SECRET,
};
const LEAD = '6f1c2b9e-3d4a-4f5b-8c7d-112233445566';
const NOW = new Date('2026-11-13T12:00:00.000Z');
const MEET = 'https://meet.google.com/abc-defg-hij';

const ORGANIZER = {
  id: 1,
  name: 'Organiser Person',
  email: 'organiser@example.test',
  username: 'organiser',
  timeZone: 'Asia/Kolkata',
  language: { locale: 'en' },
  timeFormat: 'h:mma',
  utcOffset: 330,
};
const ATTENDEE = {
  email: 'priya@example.test',
  name: 'Priya Sharma',
  firstName: 'Priya',
  lastName: 'Sharma',
  timeZone: 'Asia/Kolkata',
  language: { locale: 'en' },
  utcOffset: 330,
};
const GUEST = { email: 'guest@example.test', name: '', timeZone: 'Asia/Kolkata', language: { locale: 'en' } };
const PREFILLED_NOTES = 'Business: Real estate. Biggest gap: Invoices need chasing. Leads come in on WhatsApp.';

const CREATED_PAYLOAD = {
  bookerUrl: 'https://cal.com',
  type: 'discovery-20',
  title: '20 Min Discovery between Organiser Person and Priya Sharma',
  description: PREFILLED_NOTES,
  additionalNotes: PREFILLED_NOTES,
  customInputs: {},
  startTime: '2026-11-20T10:00:00Z',
  endTime: '2026-11-20T10:20:00Z',
  organizer: ORGANIZER,
  attendees: [ATTENDEE, GUEST],
  responses: {
    name: { label: 'your_name', value: 'Priya Sharma', isHidden: false },
    email: { label: 'email_address', value: 'priya@example.test', isHidden: false },
    location: { label: 'location', value: { optionValue: '', value: 'integrations:google:meet' } },
    notes: { label: 'additional_notes', value: PREFILLED_NOTES, isHidden: false },
    guests: { label: 'additional_guests', value: ['guest@example.test'] },
  },
  userFieldsResponses: {
    company: { label: 'Company', value: 'Sharma Realty' },
    team_size: { label: 'Team size', value: ['2-5'] },
    budget: { label: 'Budget', value: { optionValue: '', value: 'x' } },
  },
  location: MEET,
  destinationCalendar: null,
  iCalUID: 'ical-uid-not-real@Cal.com',
  iCalSequence: 0,
  requiresConfirmation: false,
  eventTypeId: 123,
  uid: 'bkgCreatedUid1',
  conferenceData: { createRequest: { requestId: 'conference-request-id-not-real' } },
  appsStatus: [{ appName: 'Google Calendar', type: 'google_calendar', success: 1, failures: 0, errors: [] }],
  eventTitle: '20 Min Discovery',
  eventDescription: '',
  price: 0,
  currency: 'usd',
  length: 20,
  bookingId: 100,
  metadata: { videoCallUrl: MEET, sf_lead_id: LEAD },
  status: 'ACCEPTED',
  attendeeIcsContent: 'BEGIN:VCALENDAR\nATTENDEE-ICS-NOT-REAL\nEND:VCALENDAR',
  organizerIcsContent: 'BEGIN:VCALENDAR\nORGANISER-ICS-NOT-REAL\nEND:VCALENDAR',
};
const CREATED = { triggerEvent: 'BOOKING_CREATED', createdAt: '2026-11-13T09:00:01.123Z', payload: CREATED_PAYLOAD };

const RESCHEDULED = {
  triggerEvent: 'BOOKING_RESCHEDULED',
  createdAt: '2026-11-14T08:30:00.456Z',
  payload: {
    ...CREATED_PAYLOAD,
    uid: 'bkgReschedUid2',
    bookingId: 101,
    startTime: '2026-11-21T11:00:00Z',
    endTime: '2026-11-21T11:20:00Z',
    rescheduleId: 100,
    rescheduleUid: 'bkgCreatedUid1',
    rescheduleStartTime: '2026-11-20T10:00:00Z',
    rescheduleEndTime: '2026-11-20T10:20:00Z',
    rescheduledBy: 'priya@example.test',
    iCalSequence: 1,
    // A reschedule carries only the new request's URL metadata: the lead id is gone.
    metadata: { videoCallUrl: MEET },
  },
};

const CANCELLED_PAYLOAD = {
  type: 'discovery-20',
  title: '20 Min Discovery between Organiser Person and Priya Sharma',
  startTime: '2026-11-21T11:00:00+00:00',
  endTime: '2026-11-21T11:20:00+00:00',
  organizer: ORGANIZER,
  attendees: [{ name: 'Priya Sharma', email: 'priya@example.test', timeZone: 'Asia/Kolkata', phoneNumber: null }],
  responses: { name: { label: 'your_name', value: 'Priya Sharma' }, email: { label: 'email_address', value: 'priya@example.test' } },
  uid: 'bkgReschedUid2',
  bookingId: 101,
  eventTypeId: 123,
  location: 'integrations:google:meet',
  iCalUID: 'ical-uid-not-real@Cal.com',
  iCalSequence: 2,
  cancellationReason: 'I am no longer able to attend this session.',
  cancelledBy: 'priya@example.test',
  eventTitle: '20 Min Discovery',
  eventDescription: null,
  price: null,
  currency: 'usd',
  length: 20,
  requestReschedule: false,
  status: 'CANCELLED',
};
const CANCELLED = { triggerEvent: 'BOOKING_CANCELLED', createdAt: '2026-11-15T07:00:00.000Z', payload: CANCELLED_PAYLOAD };

/** The organiser's "request reschedule": a BOOKING_CANCELLED with no status. */
const { status: _dropped, ...REQUEST_RESCHEDULE_PAYLOAD } = {
  ...CANCELLED_PAYLOAD,
  requestReschedule: true,
  cancellationReason: 'Please reschedule. A site visit clashes.',
  cancelledBy: 'organiser@example.test',
};
const REQUEST_RESCHEDULE = { triggerEvent: 'BOOKING_CANCELLED', createdAt: '2026-11-15T07:05:00.000Z', payload: REQUEST_RESCHEDULE_PAYLOAD };

const PING = {
  triggerEvent: 'PING',
  createdAt: '2026-11-13T09:05:00.000Z',
  payload: {
    type: 'Test',
    title: 'Test trigger event',
    startTime: '2026-11-13T09:05:00.000Z',
    endTime: '2026-11-13T09:05:00.000Z',
    attendees: [{ email: 'jdoe@example.com', name: 'John Doe', timeZone: 'Europe/London', language: { locale: 'en' } }],
    organizer: { name: 'Cal', email: 'no-reply@cal.com', timeZone: 'Europe/London', language: { locale: 'en' } },
  },
};

const EXPECTED_CREATED = {
  schema: 'sf.intake.v1',
  event: 'booking.created',
  eventId: 'booking.created:bkgCreatedUid1',
  occurredAt: '2026-11-13T09:00:01.123Z',
  source: 'cal.com',
  leadId: LEAD,
  contact: { name: 'Priya Sharma', email: 'priya@example.test' },
  booking: {
    uid: 'bkgCreatedUid1',
    bookingId: 100,
    eventSlug: 'discovery-20',
    title: '20 Min Discovery between Organiser Person and Priya Sharma',
    startTime: '2026-11-20T10:00:00Z',
    endTime: '2026-11-20T10:20:00Z',
    timeZone: 'Asia/Kolkata',
    meetUrl: MEET,
    status: 'ACCEPTED',
    notes: PREFILLED_NOTES,
    answers: { company: 'Sharma Realty', team_size: ['2-5'] },
  },
};

function sign(body, secret = SECRET) {
  return createHmac('sha256', secret).update(body).digest('hex');
}

function post(body, signature, extraHeaders = {}) {
  const raw = typeof body === 'string' ? body : JSON.stringify(body);
  const headers = { 'content-type': 'application/json', 'x-cal-webhook-version': '2021-10-20', ...extraHeaders };
  if (signature !== undefined) headers['X-Cal-Signature-256'] = signature;
  return new Request('https://sheetflow.click/api/cal-webhook', { method: 'POST', headers, body: raw });
}

function signed(body, extraHeaders) {
  const raw = typeof body === 'string' ? body : JSON.stringify(body);
  return post(raw, sign(raw), extraHeaders);
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

async function run(request, { env = ENV, fetchStub = stubFetch(), defer, lines = [] } = {}) {
  const res = await handleCalWebhook(request, { env, fetch: fetchStub.fn, now: () => NOW, log: (l) => lines.push(l), defer });
  return { res, lines, calls: fetchStub.calls };
}

// --- readCalConfig ---------------------------------------------------------

test('reads a valid config, trimming pasted whitespace', () => {
  const config = readCalConfig({ ...ENV, CAL_WEBHOOK_SECRET: ` ${SECRET}\n` });
  assert.deepEqual(config, {
    secret: SECRET,
    target: { url: ENV.SF_INTAKE_URL, headerName: 'X-SF-Intake', secret: INTAKE_SECRET },
  });
});

test('returns null when the webhook secret or the SF-I1 target is missing or invalid', () => {
  const cases = {
    'empty env': {},
    'no secret': { ...ENV, CAL_WEBHOOK_SECRET: undefined },
    'short secret': { ...ENV, CAL_WEBHOOK_SECRET: 's'.repeat(15) },
    'secret with a space': { ...ENV, CAL_WEBHOOK_SECRET: `${'s'.repeat(10)} ${'s'.repeat(10)}` },
    'secret with non-ASCII': { ...ENV, CAL_WEBHOOK_SECRET: `${'s'.repeat(16)}é` },
    'no intake url': { ...ENV, SF_INTAKE_URL: undefined },
    'http intake url': { ...ENV, SF_INTAKE_URL: 'http://tunnel.example.test/webhook/sf-discovery-intake' },
    'short intake secret': { ...ENV, SF_INTAKE_SECRET: 'x'.repeat(31) },
    'reserved header name': { ...ENV, SF_INTAKE_HEADER_NAME: 'X-Cal-Signature-256' },
  };
  for (const [name, env] of Object.entries(cases)) assert.equal(readCalConfig(env), null, name);
  assert.notEqual(readCalConfig({ ...ENV, CAL_WEBHOOK_SECRET: 's'.repeat(16) }), null, '16 characters is enough');
});

// --- verifyCalSignature ------------------------------------------------------

const RAW_CREATED = JSON.stringify(CREATED);

test('accepts a valid signature over the raw body, as a string or as bytes', () => {
  assert.deepEqual(verifyCalSignature(RAW_CREATED, sign(RAW_CREATED), SECRET), { ok: true });
  assert.deepEqual(verifyCalSignature(new TextEncoder().encode(RAW_CREATED), sign(RAW_CREATED), SECRET), { ok: true });
});

test('accepts uppercase hex', () => {
  assert.deepEqual(verifyCalSignature(RAW_CREATED, sign(RAW_CREATED).toUpperCase(), SECRET), { ok: true });
});

test('rejects the wrong key, a tampered body and a re-serialised body', () => {
  assert.deepEqual(verifyCalSignature(RAW_CREATED, sign(RAW_CREATED, 'another-secret-entirely'), SECRET), { ok: false, reason: 'mismatch' });
  const tampered = RAW_CREATED.replace('Priya Sharma', 'Mallory');
  assert.deepEqual(verifyCalSignature(tampered, sign(RAW_CREATED), SECRET), { ok: false, reason: 'mismatch' });
  const pretty = JSON.stringify(JSON.parse(RAW_CREATED), null, 2);
  assert.deepEqual(verifyCalSignature(pretty, sign(RAW_CREATED), SECRET), { ok: false, reason: 'mismatch' });
});

test("rejects 'no-secret-provided', a missing header and malformed ones", () => {
  assert.equal(NO_SECRET_SIGNATURE, 'no-secret-provided');
  assert.deepEqual(verifyCalSignature(RAW_CREATED, 'no-secret-provided', SECRET), { ok: false, reason: 'no_secret' });
  for (const missing of [null, undefined, '']) {
    assert.deepEqual(verifyCalSignature(RAW_CREATED, missing, SECRET), { ok: false, reason: 'missing' });
  }
  const good = sign(RAW_CREATED);
  for (const bad of [good.slice(0, 63), `${good}0`, `${good.slice(0, 63)}g`, `sha256=${good}`, ` ${good}`, 'zz']) {
    assert.deepEqual(verifyCalSignature(RAW_CREATED, bad, SECRET), { ok: false, reason: 'malformed' }, bad);
  }
});

test('signs non-ASCII bodies over their UTF-8 bytes', () => {
  const body = JSON.stringify({ triggerEvent: 'BOOKING_CREATED', payload: { title: 'प्रिया शर्मा, पुणे' } });
  assert.deepEqual(verifyCalSignature(body, sign(body), SECRET), { ok: true });
  assert.deepEqual(verifyCalSignature(new TextEncoder().encode(body), sign(body), SECRET), { ok: true });
});

// --- normalizeCalEvent -------------------------------------------------------

test('BOOKING_CREATED: lead id, Meet link from metadata.videoCallUrl, attendee, custom answers', () => {
  assert.deepEqual(normalizeCalEvent(CREATED, NOW), EXPECTED_CREATED);
});

test('meetUrl: falls back to an https location, and is absent for integrations:google:meet', () => {
  const noMetadataLink = { ...CREATED, payload: { ...CREATED_PAYLOAD, metadata: { sf_lead_id: LEAD } } };
  assert.equal(normalizeCalEvent(noMetadataLink, NOW).booking.meetUrl, MEET);

  const noLink = {
    ...CREATED,
    payload: { ...CREATED_PAYLOAD, location: 'integrations:google:meet', metadata: { sf_lead_id: LEAD } },
  };
  assert.equal('meetUrl' in normalizeCalEvent(noLink, NOW).booking, false);

  const httpMetadata = { ...CREATED, payload: { ...CREATED_PAYLOAD, metadata: { videoCallUrl: 'http://meet.example.test/x' } } };
  assert.equal(normalizeCalEvent(httpMetadata, NOW).booking.meetUrl, MEET);

  const scripted = {
    ...CREATED,
    payload: { ...CREATED_PAYLOAD, location: 'javascript:alert(1)', metadata: { videoCallUrl: 'javascript:alert(1)' } },
  };
  assert.equal('meetUrl' in normalizeCalEvent(scripted, NOW).booking, false);

  // Only metadata has a link (for example the confirmation path): it is used.
  const metadataOnly = { ...CREATED, payload: { ...CREATED_PAYLOAD, location: 'integrations:google:meet' } };
  assert.equal(normalizeCalEvent(metadataOnly, NOW).booking.meetUrl, MEET);

  // A visitor who edits metadata[videoCallUrl] into the link does not beat Cal.com's own location.
  const tampered = { ...CREATED, payload: { ...CREATED_PAYLOAD, metadata: { videoCallUrl: 'https://evil.example.test/' } } };
  assert.equal(normalizeCalEvent(tampered, NOW).booking.meetUrl, MEET);
});

test('BOOKING_RESCHEDULED: the new uid, and the old one as previousUid', () => {
  assert.deepEqual(normalizeCalEvent(RESCHEDULED, NOW), {
    schema: 'sf.intake.v1',
    event: 'booking.rescheduled',
    eventId: 'booking.rescheduled:bkgReschedUid2',
    occurredAt: '2026-11-14T08:30:00.456Z',
    source: 'cal.com',
    leadId: null,
    contact: { name: 'Priya Sharma', email: 'priya@example.test' },
    booking: {
      ...EXPECTED_CREATED.booking,
      uid: 'bkgReschedUid2',
      bookingId: 101,
      startTime: '2026-11-21T11:00:00Z',
      endTime: '2026-11-21T11:20:00Z',
      previousUid: 'bkgCreatedUid1',
      previousStartTime: '2026-11-20T10:00:00Z',
      previousEndTime: '2026-11-20T10:20:00Z',
      rescheduledBy: 'priya@example.test',
    },
  });
});

test('BOOKING_CANCELLED: +00:00 times kept verbatim, no metadata, requestReschedule false', () => {
  assert.deepEqual(normalizeCalEvent(CANCELLED, NOW), {
    schema: 'sf.intake.v1',
    event: 'booking.cancelled',
    eventId: 'booking.cancelled:bkgReschedUid2',
    occurredAt: '2026-11-15T07:00:00.000Z',
    source: 'cal.com',
    leadId: null,
    contact: { name: 'Priya Sharma', email: 'priya@example.test' },
    booking: {
      uid: 'bkgReschedUid2',
      bookingId: 101,
      eventSlug: 'discovery-20',
      title: '20 Min Discovery between Organiser Person and Priya Sharma',
      startTime: '2026-11-21T11:00:00+00:00',
      endTime: '2026-11-21T11:20:00+00:00',
      timeZone: 'Asia/Kolkata',
      status: 'CANCELLED',
      cancellationReason: 'I am no longer able to attend this session.',
      cancelledBy: 'priya@example.test',
      requestReschedule: false,
    },
  });
});

test('BOOKING_CANCELLED from "request reschedule": requestReschedule true, no status', () => {
  const { booking } = normalizeCalEvent(REQUEST_RESCHEDULE, NOW);
  assert.equal(booking.requestReschedule, true);
  assert.equal('status' in booking, false);
  assert.equal(booking.cancellationReason, 'Please reschedule. A site visit clashes.');
  assert.equal(booking.cancelledBy, 'organiser@example.test');
});

test('sf_lead_id is kept only when it is a UUID (lower-cased)', () => {
  const withLead = (value) => normalizeCalEvent({ ...CREATED, payload: { ...CREATED_PAYLOAD, metadata: { sf_lead_id: value } } }, NOW);
  assert.equal(withLead(LEAD.toUpperCase()).leadId, LEAD);
  for (const bad of ['lead_abc123', `${LEAD}x`, ` ${LEAD}`, 42, null, '', '6f1c2b9e3d4a4f5b8c7d112233445566']) {
    assert.equal(withLead(bad).leadId, null, String(bad));
  }
  assert.equal(normalizeCalEvent({ ...CREATED, payload: { ...CREATED_PAYLOAD, metadata: 'x' } }, NOW).leadId, null);
});

test('contact falls back to responses when there is no usable attendee', () => {
  const noAttendee = { ...CREATED, payload: { ...CREATED_PAYLOAD, attendees: [] } };
  assert.deepEqual(normalizeCalEvent(noAttendee, NOW).contact, { name: 'Priya Sharma', email: 'priya@example.test' });
  const split = {
    ...CREATED,
    payload: {
      ...CREATED_PAYLOAD,
      attendees: 'not a list',
      responses: { name: { value: { firstName: 'Priya', lastName: 'Sharma' } }, email: { value: 'priya@example.test' } },
    },
  };
  assert.deepEqual(normalizeCalEvent(split, NOW).contact, { email: 'priya@example.test' });
  const nothing = { ...CREATED, payload: { ...CREATED_PAYLOAD, attendees: undefined, responses: undefined } };
  assert.deepEqual(normalizeCalEvent(nothing, NOW).contact, {});
});

test('notes fall back to additionalNotes when responses.notes has no text', () => {
  const fallback = { ...CREATED, payload: { ...CREATED_PAYLOAD, responses: { notes: { value: '' } }, additionalNotes: 'From additionalNotes' } };
  assert.equal(normalizeCalEvent(fallback, NOW).booking.notes, 'From additionalNotes');
});

test('nothing else of the payload leaks: no organiser, iCal, appsStatus, ICS, guests or raw payload', () => {
  const envelope = normalizeCalEvent(CREATED, NOW);
  assert.deepEqual(Object.keys(envelope), ['schema', 'event', 'eventId', 'occurredAt', 'source', 'leadId', 'contact', 'booking']);
  const raw = JSON.stringify(envelope);
  for (const leak of [
    'organiser@example.test', 'Organiser Person"', '"organiser"', 'ical-uid-not-real', 'Google Calendar', 'ICS-NOT-REAL',
    'guest@example.test', 'conference-request-id', 'bookerUrl', 'eventTypeId', 'utcOffset', 'payload', 'Budget',
  ]) {
    assert.equal(raw.includes(leak), false, leak);
  }
});

test('every string is cleaned and capped; custom answers are bounded', () => {
  const answers = {};
  for (let i = 0; i < 25; i += 1) answers[`q${String(i).padStart(2, '0')}`] = { value: `answer ${i}` };
  const payload = {
    ...CREATED_PAYLOAD,
    title: `Title\u0007 ${'t'.repeat(400)}`,
    responses: { ...CREATED_PAYLOAD.responses, notes: { value: `Line 1\r\nLine 2 ${'n'.repeat(2500)}` } },
    attendees: [{ ...ATTENDEE, name: 'n'.repeat(300), email: `${'e'.repeat(300)}@example.test`, timeZone: 'Not a zone; DROP' }],
    cancellationReason: 'r'.repeat(1500),
    userFieldsResponses: {
      'bad slug': { value: 'dropped' },
      constructor: { value: 'dropped' },
      long: { value: 'a'.repeat(1500) },
      list: { value: [...Array.from({ length: 30 }, (_, i) => `item${i}`), 7, null] },
      empty: { value: '   ' },
      ...answers,
    },
  };
  // JSON.parse makes "__proto__" an own key, exactly as a hostile payload would arrive.
  const raw = JSON.stringify({ ...CREATED, payload }).replace(
    '"userFieldsResponses":{',
    '"userFieldsResponses":{"__proto__":{"value":"dropped"},',
  );
  assert.ok(raw.includes('"__proto__"'));
  const { booking, contact } = normalizeCalEvent(JSON.parse(raw), NOW);
  assert.equal(booking.title.length, 300);
  assert.ok(booking.title.startsWith('Title t'), 'the control character is removed');
  assert.equal(booking.notes.length, 2000);
  assert.ok(booking.notes.startsWith('Line 1\nLine 2'), 'line breaks are kept as \\n');
  assert.equal(booking.cancellationReason.length, 1000);
  assert.equal(contact.name.length, 200);
  assert.equal(contact.email.length, 254);
  assert.equal('timeZone' in booking, false);
  const keys = Object.keys(booking.answers);
  assert.equal(keys.length, 20);
  for (const dropped of ['__proto__', 'constructor', 'bad slug', 'empty']) assert.equal(keys.includes(dropped), false, dropped);
  assert.equal(booking.answers.long.length, 1000);
  assert.equal(booking.answers.list.length, 20);
  assert.ok(booking.answers.list.every((item) => typeof item === 'string'));
  assert.equal(Object.getPrototypeOf(booking.answers), Object.prototype);
});

test('timestamps: kept as given when valid, never invented for the booking', () => {
  assert.equal(isoTimestamp('2026-11-20T10:00:00Z'), '2026-11-20T10:00:00Z');
  assert.equal(isoTimestamp('2026-11-21T11:00:00+00:00'), '2026-11-21T11:00:00+00:00');
  assert.equal(isoTimestamp('2026-11-13T09:00:01.123Z'), '2026-11-13T09:00:01.123Z');
  assert.equal(isoTimestamp('2026-11-13T09:00Z'), '2026-11-13T09:00Z');
  for (const bad of ['2026-02-30T00:00:00Z', '2026-13-01T00:00:00Z', '2026-11-20T24:00:00Z', '2026-11-20 10:00:00Z', '2026-11-20T10:00:00', 'yesterday', 1_800_000_000, null]) {
    assert.equal(isoTimestamp(bad), null, String(bad));
  }
  const odd = { ...CREATED, createdAt: 'yesterday', payload: { ...CREATED_PAYLOAD, startTime: 'soon', endTime: 1 } };
  const envelope = normalizeCalEvent(odd, NOW);
  assert.equal(envelope.occurredAt, NOW.toISOString(), 'occurredAt falls back to the time of receipt');
  assert.equal('startTime' in envelope.booking, false);
  assert.equal('endTime' in envelope.booking, false);
});

test('returns null without a usable uid or for a non-booking trigger', () => {
  for (const bad of [undefined, '', '../etc/passwd', 'a b', 'x'.repeat(129), 42]) {
    assert.equal(normalizeCalEvent({ ...CREATED, payload: { ...CREATED_PAYLOAD, uid: bad } }, NOW), null, String(bad));
  }
  assert.notEqual(normalizeCalEvent({ ...CREATED, payload: { ...CREATED_PAYLOAD, uid: 'x'.repeat(128) } }, NOW), null);
  for (const junk of [null, [], 'BOOKING_CREATED', { triggerEvent: 'BOOKING_CREATED' }, PING, { ...CREATED, triggerEvent: 'constructor' }]) {
    assert.equal(normalizeCalEvent(junk, NOW), null);
  }
});

// --- handleCalWebhook (the route's POST) -------------------------------------------

test('no defer: a signed BOOKING_CREATED is forwarded as the envelope, with the secret header', async () => {
  const { res, calls, lines } = await run(signed(CREATED));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await res.json(), { ok: true, forwarded: true });
  assert.equal(calls.length, 1);
  const { url, init, envelope } = calls[0];
  assert.equal(url, ENV.SF_INTAKE_URL);
  assert.deepEqual(envelope, EXPECTED_CREATED);
  assert.notEqual(init.body, RAW_CREATED, 'the raw payload is never forwarded');
  assert.equal(init.headers['X-SF-Intake'], INTAKE_SECRET);
  assert.equal(init.headers['ngrok-skip-browser-warning'], '1');
  assert.equal(init.headers['user-agent'], 'sheetflow-site-relay/1');
  assert.equal(init.redirect, 'error');
  const headerDump = JSON.stringify(init.headers).toLowerCase();
  assert.equal(headerDump.includes('x-cal-signature'), false);
  assert.equal(headerDump.includes(sign(RAW_CREATED)), false);
  assert.equal(headerDump.includes(SECRET), false, 'the Cal.com secret never travels');
  assert.deepEqual(lines, ['[cal-webhook] event=BOOKING_CREATED outcome=forwarded']);
  assert.equal(CAL_FORWARD_TIMEOUT_MS, 8000);
});

test('no defer: RESCHEDULED and CANCELLED are forwarded too', async () => {
  for (const [body, event] of [[RESCHEDULED, 'booking.rescheduled'], [CANCELLED, 'booking.cancelled'], [REQUEST_RESCHEDULE, 'booking.cancelled']]) {
    const { res, calls } = await run(signed(body));
    assert.equal(res.status, 200);
    assert.equal(calls[0].envelope.event, event);
    assert.deepEqual(calls[0].envelope, normalizeCalEvent(body, NOW));
  }
});

test('no defer: 502 upstream_failed when n8n or the tunnel fails', async () => {
  const timeout = Object.assign(new Error('timed out'), { name: 'TimeoutError' });
  const cases = [
    [stubFetch({ status: 500 }), 'upstream_500'],
    [stubFetch({ status: 404 }), 'upstream_404'],
    [stubFetch({ status: 404, headers: { 'ngrok-error-code': 'ERR_NGROK_3200' } }), 'ngrok_ERR_NGROK_3200'],
    [stubFetch({ error: timeout }), 'upstream_timeout'],
    [stubFetch({ error: new TypeError('fetch failed') }), 'upstream_unreachable'],
  ];
  for (const [fetchStub, outcome] of cases) {
    const { res, lines } = await run(signed(CREATED), { fetchStub });
    assert.equal(res.status, 502, outcome);
    assert.deepEqual(await res.json(), { ok: false, error: 'upstream_failed' });
    assert.deepEqual(lines, [`[cal-webhook] event=BOOKING_CREATED outcome=${outcome}`]);
  }
});

test('defer: answers 200 accepted before forwarding, then forwards and logs the outcome', async () => {
  const tasks = [];
  const fetchStub = stubFetch();
  const { res, calls, lines } = await run(signed(CREATED), { fetchStub, defer: (task) => tasks.push(task) });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, accepted: true });
  assert.equal(calls.length, 0, 'nothing forwarded before the response');
  assert.deepEqual(lines, []);
  assert.equal(tasks.length, 1);

  await tasks[0]();
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].envelope, EXPECTED_CREATED);
  assert.deepEqual(lines, ['[cal-webhook] event=BOOKING_CREATED outcome=forwarded']);
});

test('defer: an upstream failure is logged, the delivery was already acknowledged', async () => {
  const tasks = [];
  const { res, lines } = await run(signed(CANCELLED), {
    fetchStub: stubFetch({ status: 404, headers: { 'ngrok-error-code': 'ERR_NGROK_3200' } }),
    defer: (task) => tasks.push(task),
  });
  assert.equal(res.status, 200);
  await tasks[0]();
  assert.deepEqual(lines, ['[cal-webhook] event=BOOKING_CANCELLED outcome=ngrok_ERR_NGROK_3200']);
});

test('defer: if after() refuses (outside a request scope), the forward runs inline', async () => {
  const { res, calls } = await run(signed(CREATED), {
    defer: () => {
      throw new Error('after() was called outside a request scope');
    },
  });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, forwarded: true });
  assert.equal(calls.length, 1);
});

test('defer is not used for PING, ignored triggers or rejected deliveries', async () => {
  const tasks = [];
  const defer = (task) => tasks.push(task);
  await run(signed(PING), { defer });
  await run(signed({ triggerEvent: 'BOOKING_REQUESTED', payload: {} }), { defer });
  await run(post(RAW_CREATED, 'f'.repeat(64)), { defer });
  assert.equal(tasks.length, 0);
});

test('PING answers 200 ping and forwards nothing', async () => {
  const { res, calls, lines } = await run(signed(PING));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, ping: true });
  assert.equal(calls.length, 0);
  assert.deepEqual(lines, ['[cal-webhook] event=PING outcome=ping']);
});

test('other triggers are acknowledged, not forwarded', async () => {
  for (const triggerEvent of ['BOOKING_REQUESTED', 'BOOKING_REJECTED', 'BOOKING_PAID', 'MEETING_ENDED', 'booking_created']) {
    const { res, calls, lines } = await run(signed({ triggerEvent, createdAt: '2026-11-13T09:00:00Z', payload: CREATED_PAYLOAD }));
    assert.equal(res.status, 200, triggerEvent);
    assert.deepEqual(await res.json(), { ok: true, forwarded: false });
    assert.equal(calls.length, 0);
    const label = /^[A-Z_]+$/.test(triggerEvent) ? triggerEvent : 'unknown';
    assert.deepEqual(lines, [`[cal-webhook] event=${label} outcome=ignored`]);
  }
  for (const junk of ['[]', '"x"', 'null', '{}', '{"triggerEvent":42}']) {
    const { res, lines } = await run(signed(junk));
    assert.equal(res.status, 200, junk);
    assert.deepEqual(lines, ['[cal-webhook] event=unknown outcome=ignored']);
  }
});

test('503 and nothing read when not configured', async () => {
  for (const env of [{}, { ...ENV, CAL_WEBHOOK_SECRET: undefined }, { ...ENV, SF_INTAKE_SECRET: undefined }]) {
    const request = signed(CREATED);
    const { res, calls, lines } = await run(request, { env });
    assert.equal(res.status, 503);
    assert.deepEqual(await res.json(), { ok: false, error: 'not_configured' });
    assert.equal(calls.length, 0);
    assert.equal(request.bodyUsed, false);
    assert.deepEqual(lines, ['[cal-webhook] event=unknown outcome=not_configured']);
  }
});

test('413 for a body over 256 KB, by header or by actual size', async () => {
  assert.equal(MAX_CAL_BODY_BYTES, 256 * 1024);
  const big = JSON.stringify({ ...CREATED, pad: 'x'.repeat(MAX_CAL_BODY_BYTES) });
  const byActual = await run(post(big, sign(big), { 'content-length': '100' }));
  assert.equal(byActual.res.status, 413);
  assert.equal(byActual.calls.length, 0);
  const byHeader = await run(signed(CREATED, { 'content-length': String(MAX_CAL_BODY_BYTES + 1) }));
  assert.equal(byHeader.res.status, 413);
  assert.deepEqual(byHeader.lines, ['[cal-webhook] event=unknown outcome=too_large']);
});

test('401 for a missing, wrong, no-secret, tampered or re-serialised signature', async () => {
  const pretty = JSON.stringify(CREATED, null, 2);
  const cases = [
    [post(RAW_CREATED, undefined), 'rejected_missing'],
    [post(RAW_CREATED, 'no-secret-provided'), 'rejected_no_secret'],
    [post(RAW_CREATED, 'nonsense'), 'rejected_malformed'],
    [post(RAW_CREATED, sign(RAW_CREATED, 'another-secret-entirely')), 'rejected_mismatch'],
    [post(RAW_CREATED.replace('Priya Sharma', 'Mallory'), sign(RAW_CREATED)), 'rejected_mismatch'],
    [post(pretty, sign(RAW_CREATED)), 'rejected_mismatch'],
  ];
  for (const [request, outcome] of cases) {
    const { res, calls, lines } = await run(request);
    assert.equal(res.status, 401, outcome);
    assert.deepEqual(await res.json(), { ok: false, error: 'invalid_signature' });
    assert.equal(calls.length, 0);
    assert.deepEqual(lines, [`[cal-webhook] event=unknown outcome=${outcome}`]);
  }
  const upper = await run(post(RAW_CREATED, sign(RAW_CREATED).toUpperCase()));
  assert.equal(upper.res.status, 200, 'uppercase hex is accepted');
});

test('400 for a signed body that is not JSON', async () => {
  const body = 'not json';
  const { res, calls, lines } = await run(post(body, sign(body)));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { ok: false, error: 'bad_request' });
  assert.equal(calls.length, 0);
  assert.deepEqual(lines, ['[cal-webhook] event=unknown outcome=not_json']);
});

test('422 bad_payload for a booking event without a usable uid', async () => {
  for (const payload of [{ ...CREATED_PAYLOAD, uid: undefined }, { ...CREATED_PAYLOAD, uid: '../x' }, 'not an object']) {
    const { res, calls, lines } = await run(signed({ ...CREATED, payload }));
    assert.equal(res.status, 422);
    assert.deepEqual(await res.json(), { ok: false, error: 'bad_payload' });
    assert.equal(calls.length, 0);
    assert.deepEqual(lines, ['[cal-webhook] event=BOOKING_CREATED outcome=bad_payload']);
  }
});

test('logs carry the trigger and an outcome only: no uid, people, URLs, signature or secrets', async () => {
  const lines = [];
  const tasks = [];
  const requests = [
    [signed(CREATED), {}],
    [signed(RESCHEDULED), {}],
    [signed(CANCELLED), { defer: (t) => tasks.push(t) }],
    [signed(PING), {}],
    [post(RAW_CREATED, 'f'.repeat(64)), {}],
    [post(RAW_CREATED, 'no-secret-provided'), {}],
    [signed({ ...CREATED, payload: { ...CREATED_PAYLOAD, uid: '../x' } }), {}],
    [signed({ triggerEvent: 'evil\nINJECTED line', payload: CREATED_PAYLOAD }), {}],
    [signed(CREATED), { fetchStub: stubFetch({ status: 500 }) }],
  ];
  for (const [request, opts] of requests) await run(request, { ...opts, lines });
  assert.equal(tasks.length, 1);
  for (const task of tasks) await task();
  assert.equal(lines.length, requests.length, 'exactly one line per delivery, the deferred one included');
  const leaks = [
    'bkgCreatedUid1', 'bkgReschedUid2', 'Priya', 'priya@', 'Sharma', 'organiser', 'meet.google', 'https', LEAD,
    SECRET, INTAKE_SECRET, sign(RAW_CREATED), 'tunnel', 'INJECTED', 'discovery-20', 'WhatsApp',
  ];
  for (const line of lines) {
    assert.match(line, /^\[cal-webhook\] event=(?:[A-Z_]+|unknown) outcome=[A-Za-z0-9_]+$/, line);
    for (const leak of leaks) assert.equal(line.includes(leak), false, `log leaks ${leak}: ${line}`);
  }
});

// --- route module ----------------------------------------------------------------

test('the route file wires the handler: nodejs, force-dynamic, 30 s, after() as defer, GET 405', async () => {
  const { readFile } = await import('node:fs/promises');
  const src = await readFile(new URL('../src/app/api/cal-webhook/route.ts', import.meta.url), 'utf8');
  assert.match(src, /import \{ after \} from 'next\/server';/);
  assert.match(src, /export const runtime = 'nodejs';/);
  assert.match(src, /export const dynamic = 'force-dynamic';/);
  assert.match(src, /export const maxDuration = 30;/);
  assert.match(src, /handleCalWebhook\(request, \{ env: process\.env, defer: after \}\)/);
  assert.match(src, /export function POST\(request: Request\)/);
  assert.match(src, /export function GET\(\)[\s\S]*status: 405[\s\S]*allow: 'POST'/);
});
