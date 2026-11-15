import { createHash, randomBytes, randomUUID } from 'node:crypto';

import {
  ENVELOPE_SCHEMA,
  forwardToIntake,
  readBodyCapped,
  readIntakeTarget,
  stripControls,
  type EnvelopeHeader,
} from './sf-intake.ts';

/**
 * `POST /api/intake`: lead capture before the slot is picked (D46, D47).
 *
 * The /book form posts here (D47). The lead is validated, sent to the n8n
 * intake SF-I1 in an `sf.intake.v1` envelope, and the visitor is then
 * redirected to the Cal.com booking page with their answers prefilled.
 * Capturing first means a visitor who leaves at the slot picker is still a
 * lead; redirecting (never embedding) keeps D26 true: zero third-party
 * JavaScript on our pages.
 *
 * ## Consent
 *
 * Booking needs no tick-box: the visitor gives these details so that we can
 * arrange the session they asked for, and the notice above the submit button
 * says so (a voluntary provision for a specified purpose, DPDP Act s.7(a)).
 * The one separate purpose, using de-identified answers to improve our AI
 * assistants, needs its own optional checkbox, `ai_training`. Its value is
 * recorded in the envelope as `lead.consent.aiTraining`, together with the
 * version of the privacy notice the form showed, because the Act puts the
 * burden of proving consent on us (s.6(10)). It never changes whether or where
 * the visitor is redirected: consent that changes the service is not free.
 *
 * ## The visitor is never blocked by our side
 *
 * n8n runs on the founder's machine behind a tunnel, so it will sometimes be
 * down. A valid submission gets its booking URL whatever happened to the
 * forward: the outcome is logged, and `captured` in JSON mode says whether it
 * landed. The forward is awaited (with a 6-second timeout) rather than moved
 * into `after()`, because work in `after()` cannot change the response and a
 * lost lead would then be invisible.
 *
 * ## Two response modes
 *
 * - FORM mode, for the /book form's native `<form method="post">`, which is
 *   what runs with or without JavaScript: every answer is a 303 See Other.
 *   Never 302 or 307: a 307 makes the browser re-POST the whole lead form to
 *   Cal.com, and 302 only "may" switch to GET.
 * - JSON mode, when the body is JSON or `Accept` prefers JSON, for a future
 *   enhanced form that wants to show its own messages. Nothing uses it today.
 *
 * ## What leaves this server
 *
 * Name, email, the two answers, notes, the consent record (the AI-training
 * choice and the notice version), UTM attribution, the page, and a two-letter
 * country from Vercel's geo header. Never the IP address or the user agent.
 * Logs carry one outcome label and the lead id, never a name, email, note, IP,
 * URL or secret.
 *
 * Everything is injected (env, lists, notes composer, fallback link builder,
 * notice version, fetch, clock, ids, logger, rate limiter), so
 * `scripts/test-intake.mjs` drives it with real `Request` objects and no
 * server. The route only wires it up.
 */

export const MAX_INTAKE_BODY_BYTES = 16 * 1024;
export const INTAKE_FORWARD_TIMEOUT_MS = 6000;
export const LEAD_SOURCE = 'site:/book';
/** The Cal.com URL-metadata key that carries the lead id into the booking webhook. */
export const LEAD_METADATA_KEY = 'sf_lead_id';
/**
 * Upper bound for the prefilled booking URL. Notes in Devanagari grow about
 * ninefold when percent-encoded, and request lines much past 8 KB are refused
 * by common servers and CDNs, so a long note is shortened in the URL only (the
 * full text is already in the envelope). The exact limit on Cal.com's side is
 * not documented; this is a conservative guess.
 */
export const MAX_BOOKING_URL_LENGTH = 6000;
export const INTAKE_RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000, maxKeys: 5000 } as const;

export const NAME_MAX = 120;
export const EMAIL_MAX = 254;
export const NOTES_MAX = 1500;
export const UTM_MAX = 120;
export const PAGE_MAX = 200;

const SUPPORTED_TYPES = new Set(['application/x-www-form-urlencoded', 'multipart/form-data', 'application/json']);
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const HONEYPOT_FIELD = 'website';
/** The optional, unticked checkbox on /book (D47). */
const AI_TRAINING_FIELD = 'ai_training';
/**
 * Fields this endpoint reads. Anything else in a submission is ignored,
 * including the `consent` field D46 accepted before the form existed: a
 * leftover or forged `consent=on` must never be read as AI-training consent.
 */
const KNOWN_FIELDS = new Set<string>([
  'name',
  'email',
  'sector',
  'bottleneck',
  'notes',
  'a1',
  'page',
  AI_TRAINING_FIELD,
  HONEYPOT_FIELD,
  ...UTM_KEYS,
]);
/** What a ticked checkbox can send: `on` without a value attribute, `yes` with ours. */
const CHECKBOX_YES = new Set(['on', 'true', 'yes', '1']);

const PRODUCTION_ORIGINS = ['https://sheetflow.click', 'https://www.sheetflow.click'];
const LOCAL_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const VERCEL_HOST_VARS = ['VERCEL_URL', 'VERCEL_BRANCH_URL', 'VERCEL_PROJECT_PRODUCTION_URL'] as const;

type Env = Record<string, string | undefined>;
type AttributionKey = (typeof UTM_KEYS)[number] | 'page';

/** The same shape as `QualificationAnswers` in `lib/booking.ts`, so its helpers plug straight in. */
export type IntakeAnswers = {
  name: string;
  email: string;
  sector: string;
  bottleneck: string;
  notes: string;
};

export type Submission = {
  answers: IntakeAnswers;
  /** True only when the optional `ai_training` checkbox was ticked. */
  aiTraining: boolean;
  attribution: Partial<Record<AttributionKey, string>>;
  /** True when the hidden honeypot field came back filled in. */
  honeypot: boolean;
};

export type ValidationResult = { ok: true; submission: Submission } | { ok: false; fields: string[] };

/**
 * The consent record kept with every lead. Always present, so n8n never has to
 * tell "not ticked" from "not recorded": `aiTraining` is the checkbox, and
 * `noticeVersion` names the privacy notice the visitor was shown.
 */
export type LeadConsent = { aiTraining: boolean; noticeVersion: string };

export type LeadEnvelope = EnvelopeHeader & {
  event: 'lead.submitted';
  leadId: string;
  contact: { name: string; email: string };
  lead: { sector: string; bottleneck: string; notes: string; consent: LeadConsent };
  attribution?: Partial<Record<AttributionKey, string>>;
  geo?: { country: string };
};

export type RateLimiter = {
  /** Counts one hit for `key` and says whether it is still within the limit. */
  hit(key: string, nowMs: number): boolean;
  /** Keys currently held; bounded by `maxKeys`. */
  size(): number;
};

export type IntakeDeps = {
  env: Env;
  allowed: { sectors: readonly string[]; bottlenecks: readonly string[] };
  /** Folds the answers into the one notes field the booking page offers (`composeNotes` in `lib/booking.ts`). */
  composeNotes: (answers: IntakeAnswers) => string;
  /** Today's Calendly link builder, used until CAL_BOOKING_URL holds a valid Cal.com link. */
  fallbackBookingUrl: (answers: IntakeAnswers) => string;
  /**
   * The version of the privacy notice the form shows (`PRIVACY_NOTICE_VERSION`
   * in `content/privacy.ts`), recorded with each lead as proof of what the
   * visitor was told.
   */
  noticeVersion: string;
  /** Injected so tests can stub n8n; defaults to the global fetch. */
  fetch?: typeof fetch;
  randomId?: () => string;
  now?: () => Date;
  /** Receives one line per request; never personal data. */
  log?: (line: string) => void;
  /** Without one, nothing is rate limited (tests); the route always passes one. */
  rateLimiter?: RateLimiter;
};

// --- Rate limiting ---------------------------------------------------------

/**
 * In-memory fixed-window limiter, best effort by design.
 *
 * It lives in one function instance, so it resets on a cold start and each
 * concurrent instance counts on its own: it slows a flood from one address (an
 * IPv6 client counts by its /64, see `rateLimitAddress`), it is not a quota.
 * Memory is bounded by `maxKeys`: when full, expired windows are swept first
 * and then the oldest window is dropped.
 */
export function createRateLimiter(options: { limit: number; windowMs: number; maxKeys: number }): RateLimiter {
  const windows = new Map<string, { start: number; count: number }>();
  return {
    hit(key, nowMs) {
      const current = windows.get(key);
      if (current && nowMs - current.start < options.windowMs) {
        current.count += 1;
        return current.count <= options.limit;
      }
      // Re-inserting keeps the map in window-start order, so the first key is the oldest.
      if (current) windows.delete(key);
      if (windows.size >= options.maxKeys) {
        for (const [k, w] of windows) {
          if (nowMs - w.start >= options.windowMs) windows.delete(k);
        }
        while (windows.size >= options.maxKeys) {
          const oldest = windows.keys().next();
          if (oldest.done) break;
          windows.delete(oldest.value);
        }
      }
      windows.set(key, { start: nowMs, count: 1 });
      return options.limit >= 1;
    },
    size: () => windows.size,
  };
}

/**
 * A per-process random salt, so the limiter's keys cannot be turned back into
 * addresses even by someone holding a memory dump (an unsalted SHA-256 of an
 * IPv4 address falls to enumerating 2^32 values).
 */
const KEY_SALT = randomBytes(16);

/**
 * The eight groups of an IPv6 address, `::` expanded and leading zeros
 * dropped, or null when it does not parse. A dotted IPv4 tail
 * (`::ffff:203.0.113.7`) is folded into the last two groups.
 */
function ipv6Groups(address: string): string[] | null {
  let text = address;
  const dotted = /^(.*:)(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(text);
  if (dotted) {
    const [a, b, c, d] = dotted.slice(2, 6).map(Number);
    if ([a, b, c, d].some((octet) => octet > 255)) return null;
    text = `${dotted[1]}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const halves = text.split('::');
  if (halves.length > 2) return null;
  const split = (part: string) => (part === '' ? [] : part.split(':'));
  const head = split(halves[0]);
  const tail = halves.length === 2 ? split(halves[1]) : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 2 ? missing < 1 : missing !== 0) return null;
  const groups = [...head, ...Array<string>(halves.length === 2 ? missing : 0).fill('0'), ...tail];
  if (!groups.every((group) => /^[0-9a-f]{1,4}$/.test(group))) return null;
  return groups.map((group) => group.replace(/^0+(?=.)/, ''));
}

/**
 * The part of a client address the rate limit counts.
 *
 * An IPv4 address counts whole. An IPv6 client normally holds a whole /64 and
 * can take a fresh address in it for every request, which would give one
 * machine a fresh allowance each time, so IPv6 counts by its /64 prefix (the
 * first four groups). An IPv4-mapped address (`::ffff:203.0.113.7`) counts as
 * the IPv4 address it carries, so IPv4 visitors never share one bucket.
 * Anything that does not parse counts as given.
 */
export function rateLimitAddress(raw: string): string {
  const address = raw.trim().toLowerCase();
  if (!address.includes(':')) return address;
  // Brackets and a zone id (`%eth0`) are not part of the address.
  const groups = ipv6Groups(address.replace(/^\[|\]$/g, '').split('%')[0]);
  if (groups === null) return address;
  if (groups.slice(0, 5).every((group) => group === '0') && groups[5] === 'ffff') {
    const [high, low] = [parseInt(groups[6], 16), parseInt(groups[7], 16)];
    return `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`;
  }
  return `${groups.slice(0, 4).join(':')}::/64`;
}

/**
 * The rate-limit key for a request: a salted SHA-256 of the client address
 * (for IPv6, of its /64; see `rateLimitAddress`). `x-real-ip` is set by Vercel
 * and cannot be spoofed there; the first `x-forwarded-for` hop is the
 * fallback; without either (local dev) every request shares the 'unknown'
 * bucket. The raw address is never stored.
 */
export function clientKey(headers: Headers): string {
  const realIp = headers.get('x-real-ip')?.trim();
  const firstHop = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const address = rateLimitAddress((realIp || firstHop || 'unknown').slice(0, 100));
  return createHash('sha256').update(KEY_SALT).update(address).digest('hex');
}

// --- Request shape ---------------------------------------------------------

/** The lowercased media type of a content-type header, without parameters. */
export function mediaType(header: string | null): string {
  return (header ?? '').split(';')[0].trim().toLowerCase();
}

/**
 * True when `Accept` ranks application/json at least as high as text/html.
 * Only explicit entries count: a browser's form navigation sends `*\/*` but
 * never names application/json, so it stays in FORM mode.
 */
export function prefersJson(accept: string | null): boolean {
  if (!accept) return false;
  let json = 0;
  let html = 0;
  for (const entry of accept.slice(0, 1024).split(',')) {
    const [type, ...params] = entry.split(';').map((part) => part.trim().toLowerCase());
    let q = 1;
    for (const param of params) {
      if (param.startsWith('q=')) {
        const value = Number(param.slice(2));
        q = Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : 0;
      }
    }
    if (type === 'application/json') json = Math.max(json, q);
    else if (type === 'text/html') html = Math.max(html, q);
  }
  return json > 0 && json >= html;
}

/**
 * The origins a submission may come from.
 *
 * This is an abuse gate, not CSRF protection: there is no session or cookie to
 * protect. It stops other sites and scripts that forge no Origin from feeding
 * the CRM. Preview deployments are covered through Vercel's system env vars
 * (bare hostnames).
 *
 * Localhost is allowed whenever the code is not running on Vercel, which sets
 * `VERCEL=1` for every build and function. The test is not `NODE_ENV`: a local
 * `next start` runs with `NODE_ENV=production`, and the end-to-end suite posts
 * the real form from `http://localhost:3000` against exactly that server. On
 * Vercel a localhost Origin can only be forged, so it stays blocked there.
 */
export function allowedOrigins(env: Env): Set<string> {
  const origins = new Set(PRODUCTION_ORIGINS);
  const site = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) {
    try {
      const url = new URL(site);
      if (url.protocol === 'https:') origins.add(url.origin);
    } catch {
      // Not a URL: contributes nothing.
    }
  }
  for (const name of VERCEL_HOST_VARS) {
    const host = env[name]?.trim();
    if (host && /^[A-Za-z0-9.-]{1,253}$/.test(host)) origins.add(`https://${host.toLowerCase()}`);
  }
  if (env.VERCEL !== '1') for (const origin of LOCAL_ORIGINS) origins.add(origin);
  return origins;
}

/**
 * Checks `Origin` exactly; falls back to the origin of `Referer` when the
 * browser sent no Origin; blocks when both are absent. The literal `null`
 * (sandboxed frames, file pages, some cross-origin redirects) is refused.
 */
export function isOriginAllowed(headers: Headers, env: Env): boolean {
  const allowed = allowedOrigins(env);
  const origin = headers.get('origin');
  if (origin) return origin !== 'null' && allowed.has(origin);
  const referer = headers.get('referer');
  if (!referer) return false;
  try {
    return allowed.has(new URL(referer).origin);
  } catch {
    return false;
  }
}

// --- Fields ----------------------------------------------------------------

type ParsedFields = { ok: true; values: Map<string, string>; badFields: string[] } | { ok: false };

/**
 * Turns the raw body into string fields. The body was read once as bytes (see
 * `readBodyCapped`), so form bodies are re-parsed from that copy through
 * `Response.formData()`, which handles urlencoded and multipart exactly as
 * `request.formData()` would. The first value of a repeated field wins.
 *
 * `badFields` names known fields whose value is not a string (a File in a
 * form, a number in JSON). A File anywhere makes the submission invalid,
 * since nothing here accepts uploads; one in a field we do not know is
 * reported as `file`, so an attacker-chosen name is never echoed back. The
 * honeypot's name is never echoed either: any non-empty value there, string or
 * not, simply counts as filled.
 */
async function parseFields(type: string, rawContentType: string, text: string): Promise<ParsedFields> {
  const values = new Map<string, string>();
  const badFields = new Set<string>();

  if (type === 'application/json') {
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return { ok: false };
    }
    if (typeof data !== 'object' || data === null || Array.isArray(data)) return { ok: false };
    for (const [key, value] of Object.entries(data)) {
      if (!KNOWN_FIELDS.has(key)) continue;
      if (typeof value === 'string') values.set(key, value);
      else if (key === HONEYPOT_FIELD) values.set(key, value === null || value === false ? '' : 'filled');
      else badFields.add(key);
    }
    return { ok: true, values, badFields: [...badFields] };
  }

  let form: FormData;
  try {
    form = await new Response(text, { headers: { 'content-type': rawContentType } }).formData();
  } catch {
    return { ok: false };
  }
  const fileFields: string[] = [];
  form.forEach((value, key) => {
    if (typeof value !== 'string') {
      fileFields.push(key);
      return;
    }
    if (KNOWN_FIELDS.has(key) && !values.has(key)) values.set(key, value);
  });
  for (const key of fileFields) {
    badFields.add(KNOWN_FIELDS.has(key) && key !== HONEYPOT_FIELD ? key : 'file');
  }
  return { ok: true, values, badFields: [...badFields] };
}

/** One-line fields: control characters removed, ends trimmed. */
function cleanLine(value: string): string {
  return stripControls(value).trim();
}

/** Notes keep their line breaks as `\n`. */
function cleanText(value: string): string {
  return stripControls(value, true).trim();
}

const EMAIL_LOCAL = /^[^\s@<>,;:"()[\]\\]{1,64}$/u;
/** `\p{M}` because Indic labels carry combining vowel signs, as in `भारत`. */
const EMAIL_LABEL = /^[\p{L}\p{N}](?:[\p{L}\p{M}\p{N}-]{0,61}[\p{L}\p{M}\p{N}])?$/u;

/**
 * A sanity check, not RFC 5322: one address, one @, no whitespace, angle
 * brackets, commas or quotes (which is how a header-injection or a second
 * recipient gets smuggled in), a dotted domain whose last label has a letter.
 * Unicode domains pass, because the visitor typed them; the mail system that
 * eventually uses the address will convert them.
 */
export function isSaneEmail(email: string): boolean {
  if (email.length === 0 || email.length > EMAIL_MAX) return false;
  const at = email.indexOf('@');
  if (at < 1 || at !== email.lastIndexOf('@')) return false;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!EMAIL_LOCAL.test(local) || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  const labels = domain.split('.');
  if (labels.length < 2 || !labels.every((label) => EMAIL_LABEL.test(label))) return false;
  return /\p{L}/u.test(labels[labels.length - 1]);
}

/**
 * Validates and normalises one submission. Returns the names of the fields
 * that failed (names only: values are never echoed). Optional attribution that
 * fails its pattern is dropped rather than failing the lead, because the
 * visitor cannot fix it.
 */
export function validateSubmission(
  values: ReadonlyMap<string, string>,
  allowed: IntakeDeps['allowed'],
): ValidationResult {
  const failed: string[] = [];
  const get = (key: string) => values.get(key) ?? '';

  const name = cleanLine(get('name')).replace(/\s+/g, ' ');
  if (name.length < 1 || name.length > NAME_MAX) failed.push('name');

  const email = cleanLine(get('email'));
  if (!isSaneEmail(email)) failed.push('email');

  const sector = cleanLine(get('sector'));
  if (!allowed.sectors.includes(sector)) failed.push('sector');

  const bottleneck = cleanLine(get('bottleneck'));
  if (!allowed.bottlenecks.includes(bottleneck)) failed.push('bottleneck');

  // The form sends `notes` (D47). `a1`, the textarea's name while the form
  // posted straight to Calendly, is still read so a page cached from before
  // the switch keeps working.
  const notesRaw = cleanText(get('notes'));
  const notes = notesRaw || cleanText(get('a1'));
  if (notes.length > NOTES_MAX) failed.push('notes');

  if (failed.length > 0) return { ok: false, fields: failed };

  const attribution: Partial<Record<AttributionKey, string>> = {};
  for (const key of UTM_KEYS) {
    const value = cleanLine(get(key));
    if (value && value.length <= UTM_MAX && /^[\w.\-~%+ ]*$/.test(value)) attribution[key] = value;
  }
  // A path on our own site, and only the path: a query or fragment can carry ad
  // click ids or an email address, which the CRM has no use for. '//host' is a
  // protocol-relative URL, and browsers read a backslash as a slash, so '/\host'
  // is one too; any backslash is refused.
  const page = cleanLine(get('page'));
  const path = page.split(/[?#]/, 1)[0];
  if (page.length <= PAGE_MAX && /^\/(?!\/)[^\s\\]*$/.test(path)) attribution.page = path;

  return {
    ok: true,
    submission: {
      answers: { name, email, sector, bottleneck, notes },
      // An unticked checkbox sends nothing at all, so absent means no.
      aiTraining: CHECKBOX_YES.has(cleanLine(get(AI_TRAINING_FIELD)).toLowerCase()),
      attribution,
      honeypot: cleanLine(get(HONEYPOT_FIELD)).length > 0,
    },
  };
}

// --- Envelope and booking link ---------------------------------------------

/**
 * The `lead.submitted` envelope. Attribution keys are present only when they
 * carry a value, and the country only when Vercel's header holds a plain
 * ISO 3166-1 alpha-2 code. Nothing else about the request travels. The consent
 * record is always present (see `LeadConsent`).
 */
export function buildLeadEnvelope(
  submission: Submission,
  context: { leadId: string; occurredAt: Date; country: string | null; noticeVersion: string },
): LeadEnvelope {
  const { answers } = submission;
  const envelope: LeadEnvelope = {
    schema: ENVELOPE_SCHEMA,
    event: 'lead.submitted',
    eventId: `lead.submitted:${context.leadId}`,
    occurredAt: context.occurredAt.toISOString(),
    source: LEAD_SOURCE,
    leadId: context.leadId,
    contact: { name: answers.name, email: answers.email },
    lead: {
      sector: answers.sector,
      bottleneck: answers.bottleneck,
      notes: answers.notes,
      consent: { aiTraining: submission.aiTraining, noticeVersion: context.noticeVersion },
    },
  };
  if (Object.keys(submission.attribution).length > 0) envelope.attribution = { ...submission.attribution };
  if (context.country !== null && /^[A-Z]{2}$/.test(context.country)) envelope.geo = { country: context.country };
  return envelope;
}

/**
 * Validates CAL_BOOKING_URL: the public link of one Cal.com event type,
 * `https://cal.com/<user>/<event>`. Anything else (another host, http,
 * credentials, a query or fragment, fewer than two path segments) returns null
 * and the Calendly fallback is used, so this can ship before the switch.
 */
export function readCalBookingUrl(env: Env): string | null {
  const raw = env.CAL_BOOKING_URL?.trim() ?? '';
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.port || url.username || url.password) return null;
  if (url.hostname !== 'cal.com' && url.hostname !== 'app.cal.com') return null;
  if (url.search || url.hash || raw.includes('?') || raw.includes('#')) return null;
  const segments = url.pathname.replace(/\/$/, '').slice(1).split('/');
  if (segments.length < 2 || segments.some((segment) => segment.length === 0)) return null;
  return url.toString();
}

/**
 * The prefilled Cal.com link. `URL.searchParams` encodes every value, so a
 * `+` in an email arrives as `%2B` and survives (a raw `+` would decode to a
 * space).
 *
 * The lead id travels as `metadata[sf_lead_id]`, which Cal.com stores on the
 * booking and returns in the webhook. The key is namespaced on purpose: Cal.com
 * spreads URL metadata over its own `videoCallUrl`, so a key of that name would
 * overwrite the Meet link.
 */
export function buildCalBookingUrl(
  base: string,
  answers: IntakeAnswers,
  composeNotes: IntakeDeps['composeNotes'],
  leadId: string | null,
): string {
  const url = new URL(base);
  url.searchParams.set('name', answers.name);
  url.searchParams.set('email', answers.email);
  if (leadId) url.searchParams.set(`metadata[${LEAD_METADATA_KEY}]`, leadId);

  const notes = composeNotes(answers).trim();
  if (!notes) return url.toString();
  url.searchParams.set('notes', notes);
  if (url.toString().length <= MAX_BOOKING_URL_LENGTH) return url.toString();

  // Too long once encoded: keep the longest prefix (whole code points) that fits.
  const chars = Array.from(notes);
  let low = 0;
  let high = chars.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    url.searchParams.set('notes', `${chars.slice(0, mid).join('')}…`);
    if (url.toString().length <= MAX_BOOKING_URL_LENGTH) low = mid;
    else high = mid - 1;
  }
  if (low === 0) url.searchParams.delete('notes');
  else url.searchParams.set('notes', `${chars.slice(0, low).join('')}…`);
  return url.toString();
}

// --- Responses -------------------------------------------------------------

const NO_STORE = { 'cache-control': 'no-store' };

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...NO_STORE },
  });
}

function plain(status: number, message: string): Response {
  return new Response(message, { status, headers: { 'content-type': 'text/plain; charset=utf-8', ...NO_STORE } });
}

/** 303, so the browser follows with a GET and the form body goes nowhere else. */
function seeOther(location: string): Response {
  return new Response(null, { status: 303, headers: { location, ...NO_STORE } });
}

/** Lead ids go into logs, so only a plain id is printed. */
function leadLabel(leadId: string | null): string {
  return leadId !== null && /^[A-Za-z0-9-]{1,64}$/.test(leadId) ? leadId : '-';
}

// --- The POST flow ---------------------------------------------------------

/**
 * Where FORM mode sends a submission it cannot accept.
 *
 * The query tells the /book form (with JavaScript) to show its "didn't go
 * through" message. The fragment is for a browser without JavaScript: /book is
 * a static page and cannot read its query on the server, but the message's
 * element has this id and CSS shows it when it is the `:target`. The id is
 * repeated in `QualificationForm.tsx`, which cannot import this module (it uses
 * `node:crypto`); `scripts/test-intake.mjs` checks that the two match.
 */
export const INVALID_REDIRECT_PATH = '/book?intake=invalid#intake-invalid';

/**
 * The whole POST flow, independent of Next:
 *
 *   Origin/Referer not ours       -> 403, nothing read
 *   not urlencoded/multipart/json -> 415
 *   body over 16 KB               -> FORM 303 /book?intake=invalid, JSON 413
 *   malformed body                -> 400
 *   invalid fields                -> FORM 303 /book?intake=invalid, JSON 400 + field names
 *   honeypot filled               -> looks like success, nothing forwarded
 *   over the rate limit           -> FORM 303 to the booking page, JSON 429; nothing forwarded
 *   valid                         -> forwarded to SF-I1 (awaited), then
 *                                    FORM 303 to the booking page, JSON 200
 *
 * The optional AI-training choice is recorded in the envelope and plays no
 * part in any of these outcomes.
 */
export async function handleIntake(request: Request, deps: IntakeDeps): Promise<Response> {
  const log = deps.log ?? ((line: string) => console.info(line));
  const say = (outcome: string, leadId: string | null = null) =>
    log(`[intake] outcome=${outcome} lead=${leadLabel(leadId)}`);
  const now = deps.now ?? (() => new Date());
  const randomId = deps.randomId ?? (() => randomUUID());

  const rawContentType = request.headers.get('content-type') ?? '';
  const type = mediaType(rawContentType);
  const jsonMode = type === 'application/json' || prefersJson(request.headers.get('accept'));
  const invalidUrl = () => new URL(INVALID_REDIRECT_PATH, request.url).toString();

  if (!isOriginAllowed(request.headers, deps.env)) {
    say('blocked_origin');
    return jsonMode ? json(403, { ok: false, error: 'forbidden' }) : plain(403, 'Forbidden');
  }

  if (!SUPPORTED_TYPES.has(type)) {
    say('unsupported_type');
    return jsonMode ? json(415, { ok: false, error: 'unsupported_type' }) : plain(415, 'Unsupported Media Type');
  }

  const body = await readBodyCapped(request, MAX_INTAKE_BODY_BYTES);
  if (!body.ok) {
    if (body.reason === 'too_large') {
      say('too_large');
      // A person who pasted a very long note gets the form back, not an error page.
      return jsonMode ? json(413, { ok: false, error: 'too_large' }) : seeOther(invalidUrl());
    }
    say('bad_request');
    return jsonMode ? json(400, { ok: false, error: 'bad_request' }) : plain(400, 'Bad Request');
  }

  const parsed = await parseFields(type, rawContentType, new TextDecoder().decode(body.bytes));
  if (!parsed.ok) {
    say('bad_request');
    return jsonMode ? json(400, { ok: false, error: 'bad_request' }) : plain(400, 'Bad Request');
  }

  const result = validateSubmission(parsed.values, deps.allowed);
  if (!result.ok || parsed.badFields.length > 0) {
    const fields = [...new Set([...parsed.badFields, ...(result.ok ? [] : result.fields)])];
    say('invalid');
    return jsonMode ? json(400, { ok: false, error: 'invalid', fields }) : seeOther(invalidUrl());
  }
  const { submission } = result;

  const calBase = readCalBookingUrl(deps.env);
  const bookingUrl = (leadId: string | null) =>
    calBase !== null
      ? buildCalBookingUrl(calBase, submission.answers, deps.composeNotes, leadId)
      : deps.fallbackBookingUrl(submission.answers);

  if (submission.honeypot) {
    // Indistinguishable from a captured lead, so a bot learns nothing from the reply.
    const decoyId = randomId();
    say('honeypot');
    const url = bookingUrl(decoyId);
    return jsonMode ? json(200, { ok: true, leadId: decoyId, captured: true, bookingUrl: url }) : seeOther(url);
  }

  if (deps.rateLimiter && !deps.rateLimiter.hit(clientKey(request.headers), now().getTime())) {
    // A real person behind a busy address must still be able to book; the lead is not captured.
    say('rate_limited');
    const url = bookingUrl(null);
    return jsonMode ? json(429, { ok: false, error: 'rate_limited', bookingUrl: url }) : seeOther(url);
  }

  const leadId = randomId();
  const envelope = buildLeadEnvelope(submission, {
    leadId,
    occurredAt: now(),
    country: request.headers.get('x-vercel-ip-country'),
    noticeVersion: deps.noticeVersion,
  });
  const target = readIntakeTarget(deps.env);
  const forward = target
    ? await forwardToIntake(target, envelope, { fetch: deps.fetch, timeoutMs: INTAKE_FORWARD_TIMEOUT_MS })
    : { ok: false, outcome: 'not_configured' };
  say(forward.outcome, leadId);

  const url = bookingUrl(leadId);
  return jsonMode ? json(200, { ok: true, leadId, captured: forward.ok, bookingUrl: url }) : seeOther(url);
}
