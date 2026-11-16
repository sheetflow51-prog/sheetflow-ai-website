import { after } from 'next/server';

import { handleCalWebhook } from '@/lib/cal-webhook';

/**
 * `POST /api/cal-webhook`: Cal.com booking webhooks relayed to the n8n intake
 * SF-I1 (D46).
 *
 * Node runtime, because the signature check uses `node:crypto`; never cached,
 * because every delivery is a distinct event. Cal.com waits for this answer
 * inside the booker's own request, so the route answers at once and forwards
 * in `after()`; 30 seconds covers the 8-second SF-I1 timeout with room to
 * spare. All logic lives in `lib/cal-webhook.ts`, tested without a server
 * (`node scripts/test-cal-webhook.mjs`).
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function POST(request: Request) {
  return handleCalWebhook(request, { env: process.env, defer: after });
}

/** Only Cal.com posts here; nothing is served to a browser or crawler. */
export function GET() {
  return new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), {
    status: 405,
    headers: { allow: 'POST', 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
