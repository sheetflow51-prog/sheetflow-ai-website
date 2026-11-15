/**
 * Removes the query string and the fragment from a URL (D47).
 *
 * Query strings on this site can carry personal data: Cal.com's "Redirect on
 * booking" can forward the booker's name, email and booking uid to
 * `/book/confirmed`, and campaign links carry tags that, joined with a visit,
 * say more about a person than a page count needs. Analytics events and the
 * confirmed page's address bar therefore keep the path only.
 *
 * Absolute URLs keep their origin and path; anything that does not parse as a
 * URL is cut at the first `?` or `#`, so a relative path is handled too.
 *
 * No imports, so `scripts/test-privacy-guard.mjs` can test it in plain Node.
 */
export function withoutQueryOrHash(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return url.split(/[?#]/, 1)[0];
  }
}
