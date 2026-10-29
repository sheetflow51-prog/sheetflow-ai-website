import { handleCalendlyWebhook } from '@/lib/calendly-relay';

/**
 * `POST /api/calendly` — Calendly webhook relay to the n8n intake SF-I1 (D45).
 *
 * Node runtime, because the signature check uses `node:crypto`; never cached,
 * because every delivery is a distinct event. All logic lives in
 * `lib/calendly-relay.ts`, which is tested without a server
 * (`node scripts/test-calendly-relay.mjs`).
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function POST(request: Request) {
  return handleCalendlyWebhook(request, { env: process.env });
}

/** Only Calendly posts here; nothing is served to a browser or crawler. */
export function GET() {
  return new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), {
    status: 405,
    headers: { allow: 'POST', 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
