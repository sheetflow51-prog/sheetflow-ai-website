'use client';

import { useEffect } from 'react';

import { withoutQueryOrHash } from '@/lib/url-privacy';

/**
 * Removes the query string from the address bar as soon as the page mounts
 * (D47), keeping the history entry and any fragment.
 *
 * Cal.com's "Redirect on booking" can forward the booker's name, email and
 * the booking uid to the page it redirects to. The uid is enough to cancel or
 * reschedule the booking, so it must not sit in the address bar, where it is
 * copied with the link, kept in browser history, or seen by someone looking
 * over a shoulder. The founder action on `/book/confirmed` turns forwarding
 * off at the source; this is the second line for a setting that can be turned
 * back on without touching this code.
 *
 * `replaceState` rather than a navigation: nothing reloads, nothing is sent
 * anywhere, and the history entry keeps its state object, which Next's router
 * keeps there.
 */
export function StripQueryString() {
  useEffect(() => {
    const { href, hash } = window.location;
    if (!window.location.search) return;
    window.history.replaceState(window.history.state, '', `${withoutQueryOrHash(href)}${hash}`);
  }, []);
  return null;
}
