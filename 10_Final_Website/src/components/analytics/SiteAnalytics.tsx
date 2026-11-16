'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { withoutQueryOrHash } from '@/lib/url-privacy';

/**
 * Vercel Web Analytics and Speed Insights, with every event's URL reduced to
 * its path before it leaves the browser (D47).
 *
 * ## Why the query string is removed
 *
 * Campaign links arrive with `utm_*` tags, and Cal.com's "Redirect on booking"
 * can forward the booker's name, email and booking uid to `/book/confirmed`.
 * Web Analytics stores "query params (filtered)" by a rule Vercel does not
 * document, and Speed Insights records the URL with each measurement, so
 * neither is trusted to drop them. The privacy notice says we remove query
 * strings before anything is sent; that sentence is true because of this file.
 * Campaign attribution is not lost: the /book form copies the `utm_*` tags into
 * the lead itself, where the visitor can see the notice that explains them.
 *
 * ## Why this is its own client component
 *
 * `beforeSend` is a function, and a Server Component such as the root layout
 * cannot pass a function prop to a Client Component. Both Vercel components
 * are client components already, so wrapping them here adds no JavaScript
 * beyond the helper.
 *
 * Both libraries hand `beforeSend` an event with a `url` field (Analytics
 * 1.6.1: page views and custom events; Speed Insights 1.3.1: web vitals), so
 * one function serves both.
 */
function stripUrl<T extends { url: string }>(event: T): T {
  return { ...event, url: withoutQueryOrHash(event.url) };
}

export default function SiteAnalytics() {
  return (
    <>
      <Analytics beforeSend={stripUrl} />
      <SpeedInsights beforeSend={stripUrl} />
    </>
  );
}
