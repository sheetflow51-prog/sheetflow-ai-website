import { handleIntake, createRateLimiter, INTAKE_RATE_LIMIT } from '@/lib/intake';
import { BOTTLENECKS, SECTORS, buildBookingUrl, composeNotes } from '@/lib/booking';

/**
 * `POST /api/intake`: captures a /book lead for the n8n intake SF-I1, then
 * sends the visitor on to the booking page (D46).
 *
 * Node runtime, because the rate limiter hashes addresses with `node:crypto`;
 * never cached, because every submission is a distinct lead. 15 seconds is
 * ample for the 6-second SF-I1 timeout. All logic lives in `lib/intake.ts`,
 * tested without a server (`node scripts/test-intake.mjs`).
 *
 * The lists and the notes composer are the ones the form itself uses, so the
 * server accepts exactly what the form offers. Until CAL_BOOKING_URL is set,
 * visitors are sent to today's Calendly link, built by the same function the
 * form uses now.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 15;

/** One limiter per function instance: best effort, see `createRateLimiter`. */
const rateLimiter = createRateLimiter(INTAKE_RATE_LIMIT);

export function POST(request: Request) {
  return handleIntake(request, {
    env: process.env,
    allowed: { sectors: SECTORS, bottlenecks: BOTTLENECKS },
    composeNotes,
    fallbackBookingUrl: (answers) => buildBookingUrl(answers),
    rateLimiter,
  });
}

/** Only the /book form posts here; nothing is served to a browser or crawler. */
export function GET() {
  return new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), {
    status: 405,
    headers: { allow: 'POST', 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
