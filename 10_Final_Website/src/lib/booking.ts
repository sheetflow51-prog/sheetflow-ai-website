/**
 * The booking hand-off.
 *
 * ## Why we redirect to Calendly instead of embedding it
 *
 * Calendly's inline widget loads a third-party script and an iframe that runs
 * its own React tree. On the one metric this site is measured against — a
 * homepage that fails its mobile budget at 1.6 Mbps (D23) — adding a
 * third-party bundle to the conversion page is the wrong trade twice over: it
 * costs bytes on the page a visitor reaches with the highest intent, and it
 * hands a tracking surface to a third party before anyone has agreed to
 * anything.
 *
 * Prefilling by URL gets the same outcome for **zero** third-party JavaScript.
 * The visitor answers our questions on our page, and arrives at Calendly with
 * every field already filled.
 *
 * ## Why the form still works with JavaScript disabled
 *
 * `QualificationForm` is a real `<form method="get">` pointed at
 * `BOOKING_URL`, with inputs named exactly as Calendly's prefill parameters.
 * With no JavaScript at all, the browser's native GET submission produces a
 * valid prefilled booking URL. JavaScript only *enriches* it — folding the
 * structured answers into the notes field and attaching attribution.
 *
 * ## The parameter names are Calendly's, verified against the live event type
 *
 * Read from the Calendly API on 2026-08-07 for event type
 * `aae20723-98a3-4eaf-b0c6-4dbd99ebb39d` ("Free Automation Audit", 30 min,
 * Google Meet, free):
 *
 *   - `name`  — the invitee name field
 *   - `email` — the invitee email field
 *   - `a1`    — the event's single custom question, at position 0:
 *               *"Please share anything that will help prepare for our
 *               meeting."* — type `text`, optional.
 *
 * If that event type gains a second custom question, `a1` stays correct and a
 * new `a2` becomes available. If the question at position 0 is **removed**,
 * `a1` is silently dropped by Calendly — the booking still works, the context
 * is lost. `booking.spec.ts` pins the parameter names so a rename here is
 * caught; it cannot detect a change made in the Calendly dashboard.
 */

import { BOOKING_URL } from '@/lib/contact';

/** Calendly's prefill parameter for the event's first custom question. */
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
 * Composes the structured answers into the single notes field Calendly gives
 * us, so the call starts with context rather than with discovery questions.
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
 * Builds the prefilled Calendly URL.
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
 * The direct Calendly link behind each pricing tier's CTA (D38).
 *
 * A plain link, not an embed, so D26 still holds: zero third-party JavaScript
 * on our pages. The tier travels two ways, because each is read by someone
 * different — `utm_content` lands in Calendly's booking reports, and the notes
 * field (`a1`) is what the founder reads in the calendar invite before the call.
 * Neither carries anything about who the visitor is.
 */
export function tierBookingUrl(tier: { id: string; name: string }): string {
  const url = new URL(BOOKING_URL);
  url.searchParams.set(NOTES_PARAM, `Interested in: ${tier.name}.`);
  url.searchParams.set('utm_source', 'sheetflow-site');
  url.searchParams.set('utm_medium', 'pricing');
  url.searchParams.set('utm_content', `tier-${tier.id}`);
  return url.toString();
}

/**
 * The sectors offered in the qualification step.
 *
 * These mirror the audience the site already names in `content/faq.ts`
 * ("clinics, agencies, coaches, real-estate and trades") plus the two sectors
 * with a published case study. Adding one here without adding it there would
 * make the form advertise an audience the copy does not.
 */
export const SECTORS = [
  'Clinic or healthcare practice',
  'Real estate',
  'Agency or consultancy',
  'Coaching or training',
  'Trades or home services',
  'Something else',
] as const;

/**
 * The bottleneck options.
 *
 * Each maps to a catalogued service, so the answer routes directly to what we
 * would actually build. "Not sure yet" is deliberately present and first-class:
 * a visitor who does not know is the audit's ideal caller, and forcing them to
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
