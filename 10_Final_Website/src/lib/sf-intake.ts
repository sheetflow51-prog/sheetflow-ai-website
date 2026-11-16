/**
 * The shared target and forwarder for the n8n intake workflow SF-I1 (D46).
 *
 * Two routes feed SF-I1 (`POST /webhook/sf-discovery-intake`): `/api/intake`,
 * which captures the lead from the /book form before the visitor picks a slot,
 * and `/api/cal-webhook`, which relays Cal.com booking events after it. Both
 * send the same kind of JSON envelope (`schema: 'sf.intake.v1'`, documented in
 * `docs/INTAKE_HYBRID.md`) with the same secret header, so the target, the
 * header rules and the HTTP call live here once.
 *
 * `readIntakeTarget` deliberately repeats `readConfig` in `calendly-relay.ts`
 * (D45) rule for rule instead of importing it: that module is frozen until the
 * Cal.com cutover, and the two must agree on what a valid target is, which
 * `scripts/test-sf-intake.mjs` checks case by case.
 *
 * Dependency-free and plain Node (24+ strips the types), so the tests import
 * this file directly without a server.
 */

export const INTAKE_PATH = '/webhook/sf-discovery-intake';
export const DEFAULT_INTAKE_HEADER_NAME = 'X-SF-Intake';
export const MIN_INTAKE_SECRET_LENGTH = 32;
export const ENVELOPE_SCHEMA = 'sf.intake.v1';

/** Sent on every forward so ngrok's free-plan browser interstitial never answers in n8n's place. */
export const NGROK_SKIP_WARNING_HEADER = 'ngrok-skip-browser-warning';
/** A non-browser user agent, for the same reason, and so n8n's logs show who called. */
export const RELAY_USER_AGENT = 'sheetflow-site-relay/1';

export type IntakeTarget = {
  url: string;
  headerName: string;
  secret: string;
};

/** The keys every SF-I1 envelope starts with; each route adds its own body on top. */
export type EnvelopeHeader = {
  schema: typeof ENVELOPE_SCHEMA;
  event: string;
  eventId: string;
  occurredAt: string;
  source: string;
  leadId: string | null;
};

export type ForwardResult = { ok: boolean; outcome: string };

export type ForwardOptions = {
  /** Injected so tests can stub n8n; defaults to the global fetch. */
  fetch?: typeof fetch;
  timeoutMs: number;
};

/**
 * Header names the secret may not travel under: ones the HTTP stack or this
 * module sets itself, and the inbound signature headers of both booking tools,
 * so a misconfiguration can never make the secret look like a signature.
 */
const RESERVED_HEADER_NAMES = new Set([
  'host',
  'content-type',
  'content-length',
  'connection',
  'transfer-encoding',
  'user-agent',
  NGROK_SKIP_WARNING_HEADER,
  'calendly-webhook-signature',
  'x-cal-signature-256',
]);

/**
 * Reads and validates the SF-I1 target. Returns null when anything is missing
 * or invalid, and the caller then forwards nothing.
 *
 *   SF_INTAKE_URL          https://<tunnel host>/webhook/sf-discovery-intake
 *   SF_INTAKE_HEADER_NAME  optional, default X-SF-Intake (must match n8n)
 *   SF_INTAKE_SECRET       the Header Auth value in n8n (32+ printable ASCII)
 *
 * Values are trimmed, because a pasted env var often carries a trailing
 * newline. The URL must be https, carry no credentials or fragment, and end in
 * the SF-I1 production path (not `/webhook-test/`), so a typo cannot send leads
 * and the secret somewhere else.
 */
export function readIntakeTarget(env: Record<string, string | undefined>): IntakeTarget | null {
  const rawUrl = env.SF_INTAKE_URL?.trim() ?? '';
  const headerName = env.SF_INTAKE_HEADER_NAME?.trim() || DEFAULT_INTAKE_HEADER_NAME;
  const secret = env.SF_INTAKE_SECRET?.trim() ?? '';

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
  if (secret.length < MIN_INTAKE_SECRET_LENGTH || !/^[!-~]+$/.test(secret)) return null;

  return { url: url.toString(), headerName, secret };
}

/**
 * POSTs one envelope to SF-I1 and reports what happened. Never throws and never
 * logs: each caller writes its own single log line from `outcome`.
 *
 * Outcomes:
 *   forwarded              n8n answered 2xx
 *   ngrok_ERR_NGROK_<n>    ngrok answered for n8n, e.g. ERR_NGROK_3200 (agent
 *                          offline, sent as HTTP 404) or a free-plan quota error
 *   upstream_<status>      any other non-2xx, e.g. upstream_404 when the
 *                          workflow is inactive
 *   upstream_timeout       no answer within `timeoutMs`
 *   upstream_unreachable   anything else that throws: DNS, TLS, a refused
 *                          redirect, an envelope that cannot be serialised
 *
 * The ngrok code is read from the `ngrok-error-code` response header, because
 * an offline tunnel, a traffic-policy deny and an unregistered n8n webhook all
 * look like a plain 404 otherwise. Only a code of the documented shape is
 * echoed, so a hostile upstream cannot write into our logs through it.
 */
export async function forwardToIntake(
  target: IntakeTarget,
  envelope: EnvelopeHeader,
  options: ForwardOptions,
): Promise<ForwardResult> {
  const doFetch = options.fetch ?? fetch;
  try {
    const body = JSON.stringify(envelope);
    const res = await doFetch(target.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        [target.headerName]: target.secret,
        [NGROK_SKIP_WARNING_HEADER]: '1',
        'user-agent': RELAY_USER_AGENT,
      },
      body,
      // A redirect would carry the secret header to wherever it points.
      redirect: 'error',
      cache: 'no-store',
      signal: AbortSignal.timeout(options.timeoutMs),
    });
    // Nothing in the reply is needed; release the connection either way.
    await res.body?.cancel().catch(() => {});
    if (res.status >= 200 && res.status < 300) return { ok: true, outcome: 'forwarded' };
    const ngrokCode = res.headers.get('ngrok-error-code');
    if (ngrokCode !== null && /^ERR_NGROK_\d{1,5}$/.test(ngrokCode)) {
      return { ok: false, outcome: `ngrok_${ngrokCode}` };
    }
    return { ok: false, outcome: `upstream_${res.status}` };
  } catch (err) {
    const name = err instanceof Error ? err.name : '';
    return { ok: false, outcome: name === 'TimeoutError' ? 'upstream_timeout' : 'upstream_unreachable' };
  }
}

/**
 * Removes control characters (C0, DEL and C1) from text bound for the CRM.
 *
 * Both envelopes end up in the same Google Sheet, so they are cleaned by the
 * same rule. Whitespace controls (tab, line breaks, NEL) become a space, so
 * "Priya\tSharma" does not turn into "PriyaSharma". With `multiline`, line
 * breaks are kept as `\n` instead (CRLF and lone CR normalised first, since
 * browsers submit textarea lines as CRLF). Written as a loop over char codes
 * rather than a regex, because a control-character range in a regex literal is
 * exactly what eslint's `no-control-regex` exists to flag.
 */
export function stripControls(value: string, multiline = false): string {
  const text = multiline ? value.replace(/\r\n?/g, '\n') : value;
  let out = '';
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code === 0x0a && multiline) {
      out += '\n';
    } else if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) {
      if ((code >= 0x09 && code <= 0x0d) || code === 0x85) out += ' ';
    } else {
      out += text[i];
    }
  }
  return out;
}

/**
 * Shortens to at most `max` UTF-16 units without leaving half of a surrogate
 * pair at the end (which would turn into a replacement character downstream).
 */
export function capText(value: string, max: number): string {
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  const last = cut.charCodeAt(cut.length - 1);
  return last >= 0xd800 && last <= 0xdbff ? cut.slice(0, -1) : cut;
}

export type BodyReadResult =
  | { ok: true; bytes: Uint8Array }
  | { ok: false; reason: 'too_large' | 'unreadable' };

/**
 * Reads a request body once, as bytes, stopping as soon as it passes
 * `maxBytes`.
 *
 * `content-length` is checked first so an honest oversize request is refused
 * without reading anything, but it is never trusted on its own: the declared
 * length can be absent (chunked) or simply wrong, so the bytes actually
 * received are counted too. Reading stops at the cap rather than buffering the
 * whole body and measuring it afterwards.
 */
export async function readBodyCapped(request: Request, maxBytes: number): Promise<BodyReadResult> {
  const declared = request.headers.get('content-length');
  if (declared !== null) {
    const length = Number(declared);
    if (Number.isFinite(length) && length > maxBytes) return { ok: false, reason: 'too_large' };
  }
  if (request.body === null) return { ok: true, bytes: new Uint8Array(0) };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => {});
        return { ok: false, reason: 'too_large' };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, reason: 'unreadable' };
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, bytes };
}
