import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Calendly webhook relay to the n8n intake workflow SF-I1 (D45).
 *
 * Calendly webhook subscriptions cannot carry custom headers, and SF-I1
 * (`POST /webhook/sf-discovery-intake`) only answers requests that carry the
 * secret header of its Header Auth credential. This module sits between the two:
 * it proves a delivery came from Calendly, keeps only new bookings, and forwards
 * the original body with the secret header added. The secret never reaches a
 * browser and Calendly never learns it.
 *
 * Signature scheme, verified against Calendly's developer docs on 2026-10-29:
 * https://developer.calendly.com/api-docs/overview/webhooks/webhook-signatures
 *
 *   Calendly-Webhook-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256>
 *   v1 = HMAC-SHA256(signing key, "<t>.<raw request body>")
 *
 * with a three-minute tolerance on `t`. The HMAC runs over the raw body exactly
 * as received: re-serialising parsed JSON (as Calendly's own Node sample does)
 * can reorder or re-escape characters and fail a genuine delivery.
 *
 * Retries (https://developer.calendly.com/api-docs/overview/webhooks/webhook-errors):
 * any 3xx/4xx/5xx makes Calendly retry with back-off for 24 hours, after which
 * the subscription is disabled. So a 502 when n8n is unreachable is deliberate,
 * and a booking survives a short tunnel outage.
 *
 * Everything here is dependency-free and runs as plain Node (24+ strips the
 * types), so `scripts/test-calendly-relay.mjs` tests it without a server. The
 * route file only wires `handleCalendlyWebhook` to `process.env`.
 */

export const SIGNATURE_HEADER = 'calendly-webhook-signature';
export const DEFAULT_TOLERANCE_SEC = 180;
export const MAX_BODY_BYTES = 64 * 1024;
export const FORWARD_TIMEOUT_MS = 8000;
export const INTAKE_PATH = '/webhook/sf-discovery-intake';
export const DEFAULT_INTAKE_HEADER_NAME = 'X-SF-Intake';
export const MIN_SECRET_LENGTH = 32;
export const MIN_SIGNING_KEY_LENGTH = 16;

/** The only event SF-I1 acts on. Cancellations and no-shows are acknowledged, not forwarded. */
export const FORWARDED_EVENT = 'invitee.created';

export type ParsedSignature = { t: number; v1: string[] };

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: 'missing' | 'malformed' | 'stale' | 'mismatch' };

export type RelayConfig = {
  signingKey: string;
  intakeUrl: string;
  headerName: string;
  secret: string;
};

/**
 * Parses `t=<seconds>,v1=<hex>`. Returns null for anything else.
 *
 * More than one `v1` is accepted (all are tried) so a signing-key rotation that
 * sends two signatures still verifies; unknown keys are ignored, as in
 * Calendly's samples. A missing or duplicated `t` is malformed.
 */
export function parseSignatureHeader(header: string | null | undefined): ParsedSignature | null {
  if (typeof header !== 'string' || header.length === 0 || header.length > 1024) return null;

  let t: number | null = null;
  const v1: string[] = [];
  for (const part of header.split(',')) {
    const eq = part.indexOf('=');
    if (eq === -1) return null;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key === 't') {
      if (t !== null || !/^\d{1,12}$/.test(value)) return null;
      t = Number(value);
    } else if (key === 'v1') {
      if (!/^[0-9a-fA-F]{64}$/.test(value)) return null;
      v1.push(value.toLowerCase());
    }
  }
  if (t === null || v1.length === 0) return null;
  return { t, v1 };
}

/**
 * Checks a delivery's signature and age.
 *
 * The comparison is constant-time over two 32-byte buffers (the header regex
 * guarantees the length, so `timingSafeEqual` never throws). The age check is
 * symmetric: a timestamp further than `toleranceSec` in the future is as
 * suspect as one too far in the past. A captured delivery replayed later fails
 * here even though its signature is genuine.
 */
export function verifySignature(
  rawBody: string,
  header: string | null | undefined,
  signingKey: string,
  nowSec: number,
  toleranceSec: number = DEFAULT_TOLERANCE_SEC,
): VerifyResult {
  if (header === null || header === undefined || header === '') return { ok: false, reason: 'missing' };
  const parsed = parseSignatureHeader(header);
  if (!parsed) return { ok: false, reason: 'malformed' };

  const expected = createHmac('sha256', signingKey).update(`${parsed.t}.`).update(rawBody, 'utf8').digest();
  const matched = parsed.v1.some((candidate) => timingSafeEqual(expected, Buffer.from(candidate, 'hex')));
  if (!matched) return { ok: false, reason: 'mismatch' };

  if (Math.abs(nowSec - parsed.t) > toleranceSec) return { ok: false, reason: 'stale' };
  return { ok: true };
}

/** True only for a new booking. Takes the parsed delivery body; anything malformed is false. */
export function shouldForward(event: unknown): boolean {
  return (
    typeof event === 'object' &&
    event !== null &&
    (event as { event?: unknown }).event === FORWARDED_EVENT
  );
}

/** Header names the relay sets itself, or that would leak Calendly's signature onwards. */
const RESERVED_HEADER_NAMES = new Set([
  'host',
  'content-type',
  'content-length',
  'connection',
  'transfer-encoding',
  SIGNATURE_HEADER,
]);

/**
 * Reads and validates the four env vars. Returns null when any is missing or
 * invalid, and the route then answers 503 without touching the request.
 *
 *   CALENDLY_WEBHOOK_SIGNING_KEY  the subscription's signing key (16+ chars)
 *   SF_INTAKE_URL                 https://<tunnel host>/webhook/sf-discovery-intake
 *   SF_INTAKE_HEADER_NAME         optional, default X-SF-Intake (must match n8n)
 *   SF_INTAKE_SECRET              the Header Auth value in n8n (32+ printable ASCII)
 *
 * Values are trimmed, because a pasted env var often carries a trailing newline.
 * The URL must be https, carry no credentials or fragment, and end in the SF-I1
 * path, so a typo cannot send bookings and the secret somewhere else.
 */
export function readConfig(env: Record<string, string | undefined>): RelayConfig | null {
  const signingKey = env.CALENDLY_WEBHOOK_SIGNING_KEY?.trim() ?? '';
  const rawUrl = env.SF_INTAKE_URL?.trim() ?? '';
  const headerName = env.SF_INTAKE_HEADER_NAME?.trim() || DEFAULT_INTAKE_HEADER_NAME;
  const secret = env.SF_INTAKE_SECRET?.trim() ?? '';

  if (signingKey.length < MIN_SIGNING_KEY_LENGTH) return null;

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.hash) return null;
  if (!url.pathname.endsWith(INTAKE_PATH)) return null;

  if (!/^[A-Za-z0-9-]{1,64}$/.test(headerName)) return null;
  if (RESERVED_HEADER_NAMES.has(headerName.toLowerCase())) return null;

  // Printable ASCII only: a header value cannot hold control characters, and
  // anything else would be mangled in transit.
  if (secret.length < MIN_SECRET_LENGTH || !/^[!-~]+$/.test(secret)) return null;

  return { signingKey, intakeUrl: url.toString(), headerName, secret };
}

export type HandlerDeps = {
  env: Record<string, string | undefined>;
  /** Injected so tests can stub n8n; defaults to the global fetch. */
  fetch?: typeof fetch;
  /** Unix seconds; injected so tests can pin the clock. */
  now?: () => number;
  /** Receives one line per request: event type and outcome, never the body or a header value. */
  log?: (line: string) => void;
};

function json(status: number, body: Record<string, unknown>, extra?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...extra },
  });
}

/** Event names go into logs, so only a plain Calendly-shaped name is printed. */
function eventLabel(event: unknown): string {
  const name = typeof event === 'object' && event !== null ? (event as { event?: unknown }).event : undefined;
  return typeof name === 'string' && /^[a-z_.]{1,64}$/.test(name) ? name : 'unknown';
}

/**
 * The whole POST flow, independent of Next so it can be tested with a plain
 * `Request`:
 *
 *   config missing/invalid  -> 503, nothing read, nothing forwarded
 *   body over 64 KB         -> 413
 *   bad/missing/stale sig   -> 401
 *   signed but not JSON     -> 400
 *   any event but created   -> 200 { ok: true, forwarded: false }
 *   invitee.created         -> original body to SF-I1 with the secret header;
 *                              200 when n8n answers 2xx, else 502 (Calendly retries)
 */
export async function handleCalendlyWebhook(request: Request, deps: HandlerDeps): Promise<Response> {
  const log = deps.log ?? ((line: string) => console.info(line));
  const say = (event: string, outcome: string) => log(`[calendly-relay] event=${event} outcome=${outcome}`);

  const config = readConfig(deps.env);
  if (!config) {
    say('unknown', 'not_configured');
    return json(503, { ok: false, error: 'not_configured' });
  }

  const declared = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    say('unknown', 'too_large');
    return json(413, { ok: false, error: 'too_large' });
  }
  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await request.arrayBuffer());
  } catch {
    say('unknown', 'unreadable');
    return json(400, { ok: false, error: 'bad_request' });
  }
  if (bytes.byteLength > MAX_BODY_BYTES) {
    say('unknown', 'too_large');
    return json(413, { ok: false, error: 'too_large' });
  }
  const rawBody = new TextDecoder().decode(bytes);

  const now = deps.now ?? (() => Math.floor(Date.now() / 1000));
  const verdict = verifySignature(rawBody, request.headers.get(SIGNATURE_HEADER), config.signingKey, now());
  if (!verdict.ok) {
    say('unknown', `rejected_${verdict.reason}`);
    return json(401, { ok: false, error: 'invalid_signature' });
  }

  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    say('unknown', 'not_json');
    return json(400, { ok: false, error: 'bad_request' });
  }
  const label = eventLabel(event);

  if (!shouldForward(event)) {
    say(label, 'ignored');
    return json(200, { ok: true, forwarded: false });
  }

  const doFetch = deps.fetch ?? fetch;
  try {
    const res = await doFetch(config.intakeUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json', [config.headerName]: config.secret },
      body: rawBody,
      // A redirect would carry the secret header to wherever it points.
      redirect: 'error',
      cache: 'no-store',
      signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
    });
    // Nothing in n8n's reply is needed; release the connection.
    await res.body?.cancel().catch(() => {});
    if (res.status >= 200 && res.status < 300) {
      say(label, 'forwarded');
      return json(200, { ok: true, forwarded: true });
    }
    say(label, `upstream_${res.status}`);
  } catch (err) {
    const name = err instanceof Error ? err.name : 'error';
    say(label, name === 'TimeoutError' ? 'upstream_timeout' : 'upstream_unreachable');
  }
  return json(502, { ok: false, error: 'upstream_failed' });
}
