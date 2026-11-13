import { createHmac, timingSafeEqual } from 'node:crypto';

import {
  ENVELOPE_SCHEMA,
  capText,
  forwardToIntake,
  readBodyCapped,
  readIntakeTarget,
  stripControls,
  type EnvelopeHeader,
  type IntakeTarget,
} from './sf-intake.ts';

/**
 * `POST /api/cal-webhook`: Cal.com booking webhooks relayed to SF-I1 (D46).
 *
 * After a visitor has been captured by `/api/intake` and picked a slot,
 * Cal.com reports the booking here. This module proves the delivery came from
 * Cal.com, reduces it to the few fields the CRM needs, and forwards one
 * `sf.intake.v1` envelope to the n8n intake SF-I1 with the secret header.
 * Cal.com never learns the secret, and n8n never sees Cal.com's raw payload.
 *
 * Facts this relies on (research of 2026-11-13, from Cal.com's docs and the
 * last public source snapshot, calcom/cal.diy@a17f28e9; hosted Cal.com has been
 * closed source since 2026-04-15 and may differ):
 *
 * - `X-Cal-Signature-256` is the lowercase hex HMAC-SHA256 of the raw body,
 *   keyed with the webhook's secret. No timestamp is signed, so there is no
 *   replay window to check; replays are absorbed downstream by deduplicating
 *   on `eventId`. A webhook saved without a secret sends the literal
 *   `no-secret-provided`, which is refused.
 * - The body is `{ triggerEvent, createdAt, payload }`. `PING` is the test
 *   button in Cal.com's settings and carries no booking.
 * - Deliveries are at most once: Cal.com does not retry a non-2xx, and it
 *   awaits the delivery inside the booker's own request with no timeout. So
 *   the route answers at once and forwards inside `after()`; the booker's
 *   confirmation never waits on the tunnel. A lost forward is logged and has
 *   to be reconciled from the Cal.com API (see docs/INTAKE_HYBRID.md).
 * - A reschedule is a new booking: `uid` is new and `rescheduleUid` names the
 *   old one. An organiser's "request reschedule" arrives as BOOKING_CANCELLED
 *   with `requestReschedule: true`.
 *
 * Logs carry the trigger and an outcome label only. The booking uid is never
 * logged: it works like a password for the attendee's cancel and reschedule
 * links.
 */

export const CAL_SIGNATURE_HEADER = 'x-cal-signature-256';
export const NO_SECRET_SIGNATURE = 'no-secret-provided';
export const MAX_CAL_BODY_BYTES = 256 * 1024;
export const CAL_FORWARD_TIMEOUT_MS = 8000;
export const MIN_CAL_SECRET_LENGTH = 16;
export const CAL_SOURCE = 'cal.com';
/** Must match `LEAD_METADATA_KEY` in `lib/intake.ts`, which writes it into the booking link. */
export const CAL_LEAD_METADATA_KEY = 'sf_lead_id';

type BookingEventName = 'booking.created' | 'booking.rescheduled' | 'booking.cancelled';

/** The three triggers SF-I1 acts on. A Map, so a trigger such as `constructor` can never match. */
const BOOKING_EVENTS: ReadonlyMap<string, BookingEventName> = new Map([
  ['BOOKING_CREATED', 'booking.created'],
  ['BOOKING_RESCHEDULED', 'booking.rescheduled'],
  ['BOOKING_CANCELLED', 'booking.cancelled'],
]);

/** Caps per field, generous for real data and small enough for a Sheet cell. */
const CAP = {
  name: 200,
  email: 254,
  title: 300,
  notes: 2000,
  reason: 1000,
  answer: 1000,
  slug: 200,
  url: 2048,
  status: 32,
  timeZone: 64,
} as const;
const MAX_ANSWERS = 20;
const MAX_ANSWER_ITEMS = 20;

export type CalConfig = { secret: string; target: IntakeTarget };

export type CalVerifyResult =
  | { ok: true }
  | { ok: false; reason: 'missing' | 'no_secret' | 'malformed' | 'mismatch' };

export type BookingDetails = {
  uid: string;
  bookingId?: number;
  eventSlug?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  timeZone?: string;
  meetUrl?: string;
  status?: string;
  notes?: string;
  answers?: Record<string, string | string[]>;
  previousUid?: string;
  previousStartTime?: string;
  previousEndTime?: string;
  rescheduledBy?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  requestReschedule?: boolean;
};

export type BookingEnvelope = EnvelopeHeader & {
  event: BookingEventName;
  contact: { name?: string; email?: string };
  booking: BookingDetails;
};

export type CalWebhookDeps = {
  env: Record<string, string | undefined>;
  /** Injected so tests can stub n8n; defaults to the global fetch. */
  fetch?: typeof fetch;
  now?: () => Date;
  /** Receives one line per request: trigger and outcome, never a payload value. */
  log?: (line: string) => void;
  /**
   * Runs the forward after the response is sent; the route passes Next's
   * `after`. Without it the forward is awaited and its result decides the
   * status code, which is how the tests see upstream failures.
   */
  defer?: (task: () => Promise<void>) => void;
};

/**
 * Reads the webhook secret and the SF-I1 target. Either one missing or invalid
 * returns null, and the route answers 503 without reading the request.
 *
 *   CAL_WEBHOOK_SECRET  the secret typed into Cal.com's webhook form (16+ printable ASCII)
 *   SF_INTAKE_*         as for every SF-I1 forward (see lib/sf-intake.ts)
 */
export function readCalConfig(env: Record<string, string | undefined>): CalConfig | null {
  const secret = env.CAL_WEBHOOK_SECRET?.trim() ?? '';
  if (secret.length < MIN_CAL_SECRET_LENGTH || !/^[!-~]+$/.test(secret)) return null;
  const target = readIntakeTarget(env);
  if (!target) return null;
  return { secret, target };
}

/**
 * Checks `X-Cal-Signature-256` against the raw body exactly as received.
 *
 * The HMAC runs over the bytes, never over re-serialised JSON, which could
 * reorder keys or re-escape characters and fail a genuine delivery. Uppercase
 * hex is accepted (hex is case-insensitive; Cal.com sends lowercase). The
 * comparison is constant-time over two 32-byte buffers: the regex fixes the
 * length, so `timingSafeEqual` cannot throw.
 */
export function verifyCalSignature(
  rawBody: string | Uint8Array,
  header: string | null | undefined,
  secret: string,
): CalVerifyResult {
  if (header === null || header === undefined || header === '') return { ok: false, reason: 'missing' };
  if (header === NO_SECRET_SIGNATURE) return { ok: false, reason: 'no_secret' };
  if (!/^[0-9a-f]{64}$/i.test(header)) return { ok: false, reason: 'malformed' };
  const expected = createHmac('sha256', secret).update(rawBody).digest();
  const received = Buffer.from(header, 'hex');
  return timingSafeEqual(expected, received) ? { ok: true } : { ok: false, reason: 'mismatch' };
}

// --- Normalisation ---------------------------------------------------------

type Json = Record<string, unknown>;

function record(value: unknown): Json | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Json) : null;
}

/** A cleaned, capped, non-empty string, or null. */
function text(value: unknown, max: number, multiline = false): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = capText(stripControls(value, multiline).trim(), max);
  return cleaned.length > 0 ? cleaned : null;
}

const UID = /^[A-Za-z0-9_-]{1,128}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?(?:Z|[+-](\d{2}):(\d{2}))$/;

function uid(value: unknown): string | null {
  return typeof value === 'string' && UID.test(value) ? value : null;
}

/** An IANA zone name such as `Asia/Kolkata` or `Etc/GMT+5`. */
function timeZone(value: unknown): string | null {
  return typeof value === 'string' && /^[A-Za-z0-9_+\-/]{1,64}$/.test(value) ? value : null;
}

/** Cal.com's own status words: ACCEPTED, CANCELLED, and so on. */
function bookingStatus(value: unknown): string | null {
  return typeof value === 'string' && /^[A-Z_]{1,32}$/.test(value) ? value : null;
}

/**
 * An ISO 8601 date-time returned exactly as given, or null. CREATED sends
 * `...Z` and CANCELLED `...+00:00`; both are kept verbatim, because rewriting
 * one into the other is a change n8n did not ask for. The calendar fields are
 * range-checked too, since `Date.parse` quietly rolls 30 February into March.
 */
export function isoTimestamp(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 40) return null;
  const m = ISO_DATE_TIME.exec(value);
  if (!m) return null;
  const [year, month, day, hour, minute] = [m[1], m[2], m[3], m[4], m[5]].map(Number);
  const second = m[6] === undefined ? 0 : Number(m[6]);
  const calendar = new Date(Date.UTC(year, month - 1, day));
  if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() !== month - 1 || calendar.getUTCDate() !== day) {
    return null;
  }
  if (hour > 23 || minute > 59 || second > 59) return null;
  if (m[7] !== undefined && (Number(m[7]) > 14 || Number(m[8]) > 59)) return null;
  return Number.isNaN(Date.parse(value)) ? null : value;
}

function httpsUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const candidate = value.trim();
  if (candidate.length === 0 || candidate.length > CAP.url) return null;
  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' && !url.username && !url.password ? candidate : null;
  } catch {
    return null;
  }
}

/**
 * True for the links Cal.com itself writes into `metadata.videoCallUrl`:
 * Google Meet, and Cal Video (`https://app.cal.com/video/<uid>`).
 */
function isCalMeetingLink(link: string): boolean {
  const url = new URL(link);
  if (url.hostname === 'meet.google.com') return true;
  return (url.hostname === 'app.cal.com' || url.hostname === 'cal.com') && url.pathname.startsWith('/video/');
}

/**
 * The meeting link, https only, so `integrations:google:meet` (no Google
 * Calendar connected, so no link) gives nothing.
 *
 * `location` is read first. Whenever Cal.com made a link it also sets
 * `location` to it (`metadata?.videoCallUrl || evt.location`), and it does so
 * before it spreads the booking link's `metadata[...]` parameters over
 * `metadata`. So in a normal booking the two hold the same link, and
 * `metadata.videoCallUrl` is the one value a visitor can write, by adding
 * `metadata[videoCallUrl]=...` to the link. That only matters when Cal.com
 * made no link and `location` is not a URL (Meet without a connected calendar,
 * a phone or in-person location), which is exactly when the visitor's value
 * would otherwise become the CRM's join link. The metadata value is therefore
 * a fallback only, and only for a Meet or Cal Video link, which keeps the
 * confirmation path working (its BOOKING_CREATED may carry Cal.com's link in
 * `metadata` alone). At worst a visitor can name another Meet room, which is
 * no worse than the call they booked.
 */
function meetingUrl(metadata: Json | null, location: unknown): string | null {
  const fromLocation = httpsUrl(location);
  if (fromLocation !== null) return fromLocation;
  const fromMetadata = httpsUrl(metadata?.videoCallUrl);
  return fromMetadata !== null && isCalMeetingLink(fromMetadata) ? fromMetadata : null;
}

/** Slugs that are valid identifiers but dangerous as object keys in n8n's own JavaScript. */
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * The event type's custom questions, from `userFieldsResponses`
 * (`{ <slug>: { label, value } }`). Only string and string-list answers are
 * kept, at most 20 of them, each value capped; anything else (radio JSON,
 * phone objects) is dropped rather than guessed at.
 */
function customAnswers(value: unknown): Record<string, string | string[]> | null {
  const fields = record(value);
  if (!fields) return null;
  const answers: [string, string | string[]][] = [];
  for (const [slug, entry] of Object.entries(fields)) {
    if (answers.length >= MAX_ANSWERS) break;
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(slug) || UNSAFE_KEYS.has(slug)) continue;
    const raw = record(entry)?.value;
    if (typeof raw === 'string') {
      const answer = text(raw, CAP.answer, true);
      if (answer !== null) answers.push([slug, answer]);
    } else if (Array.isArray(raw)) {
      const items = raw
        .slice(0, MAX_ANSWER_ITEMS)
        .map((item) => text(item, CAP.answer))
        .filter((item): item is string => item !== null);
      if (items.length > 0) answers.push([slug, items]);
    }
  }
  return answers.length > 0 ? Object.fromEntries(answers) : null;
}

/** Copies only the keys that hold a value: n8n then never has to tell null from absent. */
function compact<T extends Record<string, unknown>>(entries: { [K in keyof T]: T[K] | null }): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(entries) as (keyof T)[]) {
    const value = entries[key];
    if (value !== null && value !== undefined) out[key] = value as T[typeof key];
  }
  return out;
}

/**
 * Reduces one Cal.com delivery to the CRM envelope, or null when it is not a
 * booking event with a usable `uid` (the route then answers 422).
 *
 * Built field by field from an allow-list, so nothing else of the payload can
 * leak: no organiser details, no iCal data, no `appsStatus`, no ICS content,
 * no other attendees. `leadId` is the `metadata[sf_lead_id]` that
 * `/api/intake` put in the booking link, kept only if it is a UUID. It is a
 * join hint, not proof of identity: the visitor can edit the link.
 */
export function normalizeCalEvent(body: unknown, now: Date = new Date()): BookingEnvelope | null {
  const envelope = record(body);
  if (!envelope || typeof envelope.triggerEvent !== 'string') return null;
  const event = BOOKING_EVENTS.get(envelope.triggerEvent);
  const payload = record(envelope.payload);
  if (event === undefined || !payload) return null;

  const bookingUid = uid(payload.uid);
  if (bookingUid === null) return null;

  const metadata = record(payload.metadata);
  const rawLeadId = metadata?.[CAL_LEAD_METADATA_KEY];
  const leadId = typeof rawLeadId === 'string' && UUID.test(rawLeadId) ? rawLeadId.toLowerCase() : null;

  const attendee = Array.isArray(payload.attendees) ? record(payload.attendees[0]) : null;
  const responses = record(payload.responses);
  const responseValue = (slug: string) => record(responses?.[slug])?.value;

  const contact = compact<{ name: string; email: string }>({
    name: text(attendee?.name, CAP.name) ?? text(responseValue('name'), CAP.name),
    email: text(attendee?.email, CAP.email) ?? text(responseValue('email'), CAP.email),
  });

  const booking = compact<BookingDetails>({
    uid: bookingUid,
    bookingId: Number.isSafeInteger(payload.bookingId) ? (payload.bookingId as number) : null,
    // An organiser's "request reschedule" cancellation is built by another
    // factory, which names the slug `eventSlug` instead of `type`.
    eventSlug: text(payload.type, CAP.slug) ?? text(payload.eventSlug, CAP.slug),
    title: text(payload.title, CAP.title),
    startTime: isoTimestamp(payload.startTime),
    endTime: isoTimestamp(payload.endTime),
    timeZone: timeZone(attendee?.timeZone),
    meetUrl: meetingUrl(metadata, payload.location),
    status: bookingStatus(payload.status),
    notes: text(responseValue('notes'), CAP.notes, true) ?? text(payload.additionalNotes, CAP.notes, true),
    answers: customAnswers(payload.userFieldsResponses),
    previousUid: uid(payload.rescheduleUid),
    previousStartTime: isoTimestamp(payload.rescheduleStartTime),
    previousEndTime: isoTimestamp(payload.rescheduleEndTime),
    rescheduledBy: text(payload.rescheduledBy, CAP.email),
    cancellationReason: text(payload.cancellationReason, CAP.reason, true),
    cancelledBy: text(payload.cancelledBy, CAP.email),
    requestReschedule: typeof payload.requestReschedule === 'boolean' ? payload.requestReschedule : null,
  });

  return {
    schema: ENVELOPE_SCHEMA,
    event,
    eventId: `${event}:${bookingUid}`,
    occurredAt: isoTimestamp(envelope.createdAt) ?? now.toISOString(),
    source: CAL_SOURCE,
    leadId,
    contact,
    booking: { ...booking, uid: bookingUid },
  };
}

// --- The POST flow ---------------------------------------------------------

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

/** Trigger names go into logs, so only a plain Cal.com-shaped name is printed. */
function triggerLabel(body: unknown): string {
  const trigger = record(body)?.triggerEvent;
  return typeof trigger === 'string' && /^[A-Z_]{1,64}$/.test(trigger) ? trigger : 'unknown';
}

/**
 * The whole POST flow, independent of Next:
 *
 *   config missing/invalid  -> 503, nothing read
 *   body over 256 KB        -> 413
 *   signature not valid     -> 401
 *   signed but not JSON     -> 400
 *   PING                    -> 200 { ok, ping: true }, nothing forwarded
 *   other triggers          -> 200 { ok, forwarded: false }
 *   booking without a uid   -> 422 bad_payload
 *   booking event           -> with `defer`: 200 { ok, accepted: true } at once,
 *                              forward afterwards; without: forward, then
 *                              200 forwarded or 502 upstream_failed
 */
export async function handleCalWebhook(request: Request, deps: CalWebhookDeps): Promise<Response> {
  const log = deps.log ?? ((line: string) => console.info(line));
  const say = (event: string, outcome: string) => log(`[cal-webhook] event=${event} outcome=${outcome}`);

  const config = readCalConfig(deps.env);
  if (!config) {
    say('unknown', 'not_configured');
    return json(503, { ok: false, error: 'not_configured' });
  }

  const body = await readBodyCapped(request, MAX_CAL_BODY_BYTES);
  if (!body.ok) {
    say('unknown', body.reason === 'too_large' ? 'too_large' : 'bad_request');
    return body.reason === 'too_large'
      ? json(413, { ok: false, error: 'too_large' })
      : json(400, { ok: false, error: 'bad_request' });
  }

  const verdict = verifyCalSignature(body.bytes, request.headers.get(CAL_SIGNATURE_HEADER), config.secret);
  if (!verdict.ok) {
    say('unknown', `rejected_${verdict.reason}`);
    return json(401, { ok: false, error: 'invalid_signature' });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(body.bytes));
  } catch {
    say('unknown', 'not_json');
    return json(400, { ok: false, error: 'bad_request' });
  }
  const label = triggerLabel(parsed);

  if (label === 'PING') {
    say(label, 'ping');
    return json(200, { ok: true, ping: true });
  }
  if (!BOOKING_EVENTS.has(label)) {
    say(label, 'ignored');
    return json(200, { ok: true, forwarded: false });
  }

  const now = deps.now ?? (() => new Date());
  const envelope = normalizeCalEvent(parsed, now());
  if (!envelope) {
    say(label, 'bad_payload');
    return json(422, { ok: false, error: 'bad_payload' });
  }

  const forward = () =>
    forwardToIntake(config.target, envelope, { fetch: deps.fetch, timeoutMs: CAL_FORWARD_TIMEOUT_MS });

  if (deps.defer) {
    try {
      deps.defer(async () => {
        const result = await forward();
        say(label, result.outcome);
      });
      return json(200, { ok: true, accepted: true });
    } catch {
      // `after()` refuses to run outside a request scope; forward inline instead.
    }
  }

  const result = await forward();
  say(label, result.outcome);
  return result.ok
    ? json(200, { ok: true, forwarded: true })
    : json(502, { ok: false, error: 'upstream_failed' });
}
