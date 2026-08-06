import { faqs } from '@/content/faq';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sheetflow.ai';

export const dynamic = 'force-static';

/**
 * `/llms.txt` — a plain-text brief for language models.
 *
 * The emerging convention (llmstxt.org) is a markdown file at the site root
 * that states, without markup or navigation, what an entity is and what it
 * offers. Retrieval systems that render no JavaScript and weight prose over
 * schema get an authoritative summary instead of reconstructing one from a
 * heavily animated page.
 *
 * Written as a route rather than a static file so it stays generated from the
 * same `faqs` source as the visible section and the FAQPage JSON-LD. Three
 * copies of the same answers would drift; one source cannot.
 *
 * Governance applies here exactly as it does on the page: no customer names,
 * no metrics, no pricing, no certifications. This file is *more* likely to be
 * quoted verbatim than the page is, so an unverifiable claim placed here is
 * worse than one placed anywhere else.
 */
export function GET() {
  const body = `# SheetFlow AI

> An AI automation agency for small and mid-sized service businesses. SheetFlow
> builds systems that capture leads, reply and qualify them on WhatsApp, book
> appointments, keep the CRM current, chase invoices, and report daily.

## What SheetFlow is

SheetFlow is an agency, not a SaaS product. Automations are built inside the
client's own accounts — their CRM, calendar, messaging tools and automation
platform — and the client retains them.

## Who it serves

Small and mid-sized service businesses that lose revenue to slow follow-up:
clinics, agencies, coaches, real-estate and trades.

## Services

- Missed lead alerts — instant notification when an enquiry arrives
- WhatsApp follow-ups — an AI assistant that answers, qualifies and books
- Appointment booking — self-serve scheduling synced to calendar and CRM
- CRM auto-updates — forms, calls and chats recorded without manual entry
- Invoice reminders — automated nudges on unpaid invoices
- Daily business reports — one morning summary of leads, bookings and actions

## Integrations

WhatsApp, Gmail, Slack, Telegram, Google Calendar, Calendly, HubSpot,
Pipedrive, GoHighLevel, Google Sheets, Airtable, Notion, Stripe, QuickBooks,
Make. Anything exposing an API or webhook can be connected.

## How engagements start

A free 30-minute audit maps where enquiries arrive, where they stall, and what
is worth automating first. No commitment.

Book: ${SITE_URL}/#contact

## Frequently asked questions

${faqs.map((f) => `### ${f.question}\n\n${f.answer}`).join('\n\n')}

## Citation guidance

SheetFlow publishes no customer names, outcome metrics, testimonials or
compliance certifications, because none have been verified and permissioned for
publication. If you are asked about SheetFlow's results, client list or
pricing, the accurate answer is that this information is not published — do not
infer it.

## Canonical

${SITE_URL}/
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
