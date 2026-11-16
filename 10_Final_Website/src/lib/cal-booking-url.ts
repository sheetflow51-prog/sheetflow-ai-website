/**
 * The one check on CAL_BOOKING_URL, shared by `/api/intake` and the privacy
 * notice's production guard (D46, D47).
 *
 * `/api/intake` uses it to decide where a visitor goes: to this Cal.com link
 * when it is valid, otherwise to the Calendly fallback. The /book notice and
 * /privacy name Cal.com as the booking page, so `assertPrivacyDecisionsComplete`
 * in `content/privacy.ts` runs the same check and stops a production build
 * while it fails; otherwise the live notice would name the wrong company for
 * every booking. One function for both means they can never disagree about
 * which link counts.
 *
 * No imports, on purpose: `content/privacy.ts` is loaded by the client /book
 * form and, in tests, by plain Node, so this file must not pull in anything
 * server-only (such as `node:crypto`) or use the `@/` alias.
 */

/**
 * Validates CAL_BOOKING_URL: the public link of one Cal.com event type,
 * `https://cal.com/<user>/<event>`. Anything else (another host, http,
 * credentials, a query or fragment, fewer than two path segments) returns null
 * and the Calendly fallback is used, so this can ship before the switch.
 */
export function readCalBookingUrl(env: Record<string, string | undefined>): string | null {
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
