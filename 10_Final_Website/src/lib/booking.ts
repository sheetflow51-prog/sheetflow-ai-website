/**
 * The booking hand-off.
 *
 * ## The lead is captured before the slot (D46, D47)
 *
 * The /book form is a native `<form method="post">` aimed at our own
 * `/api/intake` (`INTAKE_ACTION`). The server validates the answers, records
 * the lead in our booking records through the n8n intake, and only then
 * answers `303 See Other` to the booking page with the visitor's name, email
 * and notes prefilled. A visitor who leaves at the slot picker is therefore
 * still a lead we can follow up, and every way into a booking goes through
 * that capture: the pricing tiers link to /book (`tierBookingUrl`), and so does
 * the structured data. With JavaScript disabled the browser's own POST and the
 * server's 303 do the whole job.
 *
 * ## Why we redirect to the booking page instead of embedding it (D26)
 *
 * A scheduler's inline widget loads a third-party script and an iframe that
 * runs its own React tree. On the one metric this site is measured against, a
 * homepage that fails its mobile budget at 1.6 Mbps (D23), adding a
 * third-party bundle to the conversion page is the wrong trade twice over: it
 * costs bytes on the page a visitor reaches with the highest intent, and it
 * hands a tracking surface to a third party before anyone has agreed to
 * anything. Prefilling by URL gets the same outcome for zero third-party
 * JavaScript.
 *
 * ## The Calendly fallback
 *
 * The booking page is Cal.com once `CAL_BOOKING_URL` is set (D46). Until then
 * `/api/intake` redirects to the Calendly link `buildBookingUrl` makes, whose
 * prefill names are Calendly's, read from its API on 2026-08-07 for the event
 * behind `BOOKING_URL`:
 *
 *   - `name`  — the invitee name field
 *   - `email` — the invitee email field
 *   - `a1`    — the event's single custom question, at position 0:
 *               *"Please share anything that will help prepare for our
 *               meeting."* — type `text`, optional.
 *
 * If the question at position 0 is **removed** in Calendly, `a1` is silently
 * dropped: the booking still works, the context is lost. No test here can see
 * a change made in the Calendly dashboard.
 */

import { BOOKING_URL } from '@/lib/contact';

/** Where the /book form posts. The route lives at `src/app/api/intake/route.ts`. */
export const INTAKE_ACTION = '/api/intake';

/** Calendly's prefill parameter for the event's first custom question (fallback only). */
export const NOTES_PARAM = 'a1';

export interface QualificationAnswers {
  name: string;
  email: string;
  /** Business sector, from a fixed list. */
  sector: string;
  /** Where the visitor says enquiries are being lost. */
  bottleneck: string;
  /** Free-text detail. Optional. */
  notes: string;
}

/**
 * Composes the structured answers into the single notes field the booking page
 * gives us, so the call starts with context rather than with discovery
 * questions. Used on the server by `/api/intake`, for both Cal.com and the
 * Calendly fallback; the form itself no longer composes anything.
 *
 * Kept as prose rather than `key=value` lines: this text is read by a human in
 * a calendar invite, not parsed.
 */
export function composeNotes(answers: QualificationAnswers): string {
  const parts: string[] = [];
  if (answers.sector) parts.push(`Business: ${answers.sector}.`);
  if (answers.bottleneck) parts.push(`Biggest gap: ${answers.bottleneck}.`);
  if (answers.notes.trim()) parts.push(answers.notes.trim());
  return parts.join(' ');
}

/**
 * Builds the prefilled Calendly URL: the fallback `/api/intake` redirects to
 * while `CAL_BOOKING_URL` is unset or invalid. No page links to it directly.
 *
 * Empty values are omitted rather than sent blank — Calendly treats an empty
 * prefill as "prefilled with nothing", which disables the field's own
 * validation prompt.
 *
 * `utm_*` values are attribution, not identity: they record which page sent
 * the visitor, and carry nothing about who they are.
 */
export function buildBookingUrl(
  answers: QualificationAnswers,
  attribution?: { source?: string; medium?: string; campaign?: string },
): string {
  const url = new URL(BOOKING_URL);

  const set = (key: string, value: string | undefined) => {
    const trimmed = value?.trim();
    if (trimmed) url.searchParams.set(key, trimmed);
  };

  set('name', answers.name);
  set('email', answers.email);
  set(NOTES_PARAM, composeNotes(answers));

  set('utm_source', attribution?.source ?? 'sheetflow-site');
  set('utm_medium', attribution?.medium ?? 'book-page');
  set('utm_campaign', attribution?.campaign);

  return url.toString();
}

/**
 * The link behind each pricing tier's CTA: /book, tagged with the tier (D47).
 *
 * D38 pointed these straight at Calendly. That link skipped the form, so a
 * tier booking reached the calendar with no lead captured and none of the
 * qualification answers. Now the tier goes through /book like every other CTA:
 * the form copies the `utm_*` tags from its own address into the lead, so the
 * CRM row says which tier the visitor was looking at. Relative on purpose, so
 * it works on preview deployments and never names an external host. The tags
 * say where the click came from, never who made it.
 */
export function tierBookingUrl(tier: { id: string }): string {
  const params = new URLSearchParams({
    utm_source: 'sheetflow-site',
    utm_medium: 'pricing',
    utm_content: `tier-${tier.id}`,
  });
  return `/book?${params.toString()}`;
}

/**
 * The sectors offered in the qualification step.
 *
 * These mirror the audience the site names in `content/faq.ts` (any sector,
 * B2B or B2C, since D42 / 2026-10-29), listing the sectors we lead with first.
 * Adding one here without adding it there would make the form advertise an
 * audience the copy does not.
 */
export const SECTORS = [
  'Manufacturing or industrial',
  'Real estate',
  'Education or coaching',
  'Clinic or healthcare practice',
  'E-commerce or D2C brand',
  'Agency or consultancy',
  'Trades or home services',
  'Something else',
] as const;

/**
 * The bottleneck options.
 *
 * Each maps to a catalogued service, so the answer routes directly to what we
 * would actually build. "Not sure yet" is deliberately present and first-class:
 * a visitor who does not know is the session's ideal caller, and forcing them to
 * pick a wrong answer loses them.
 */
export const BOTTLENECKS = [
  'Enquiries go unanswered too long',
  'Follow-up stops after the first message',
  'Booking is too much back-and-forth',
  'The CRM is never up to date',
  'Invoices need chasing',
  'Not sure yet — that is what I want to work out',
] as const;
