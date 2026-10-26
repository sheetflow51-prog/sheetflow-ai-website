/**
 * FAQ content — the single source for both the rendered section and the
 * FAQPage JSON-LD.
 *
 * ## Why one source
 *
 * Structured data that disagrees with the visible page is a spam signal to
 * every search and answer engine, and Google's guidance is explicit that
 * FAQPage markup must match on-page content. Deriving both from this array
 * makes divergence impossible.
 *
 * ## What may go in here
 *
 * Answers must be verifiable from the product itself. Every claim below is
 * grounded in something the site already states — the six services in the
 * Organization schema, the named integrations, the published process, and the
 * booking offer.
 *
 * Deliberately absent, because none of it is established:
 *   - prices or contract terms      (founder decision)
 *   - delivery timelines            (no measured baseline exists)
 *   - customer names, counts, metrics, or outcomes  (see content/proof.ts)
 *   - security certifications       (none held)
 *
 * An answer that cannot be checked against the product does not belong here.
 * It would also be the first thing an answer engine quotes.
 */

export interface FaqEntry {
  /** Stable id — used as the DOM anchor so answers are directly linkable. */
  id: string;
  question: string;
  /**
   * Plain prose, no markup. Answer engines extract this verbatim, so it must
   * read as a complete answer on its own, away from the page.
   */
  answer: string;
}

export const faqs: FaqEntry[] = [
  {
    id: 'faq-what-is-sheetflow',
    question: 'What does SheetFlow actually do?',
    answer:
      'SheetFlow is an AI automation agency. We build the systems that run the repetitive parts of a business: capturing new leads, replying and qualifying them on WhatsApp, booking appointments into your calendar, keeping your CRM up to date, chasing unpaid invoices, and sending you a daily summary of what happened. The work is delivered as automations connected to the tools you already use, not as another dashboard to log into.',
  },
  {
    id: 'faq-who-is-it-for',
    question: 'Who is SheetFlow built for?',
    answer:
      'Small and mid-sized service businesses that lose revenue to slow follow-up — clinics, agencies, coaches, real-estate and trades. The common pattern is a business where enquiries arrive faster than a small team can answer them, and where a lead going cold overnight is a direct loss.',
  },
  {
    id: 'faq-how-it-works',
    question: 'How does the automation work, step by step?',
    answer:
      'Five steps. A new lead arrives from any channel. An AI assistant replies immediately and qualifies them. If they are a fit, an appointment is booked straight into your calendar. Your CRM is updated automatically with the full context. At the end of the day you receive one report covering leads, bookings and anything needing your attention.',
  },
  {
    id: 'faq-integrations',
    question: 'Which tools does SheetFlow integrate with?',
    answer:
      'SheetFlow connects to the tools most small businesses already run: WhatsApp, Gmail, Slack and Telegram for messaging; Google Calendar and Calendly for scheduling; Google Workspace for mail, calendars and documents; HubSpot, Pipedrive and GoHighLevel for CRM; Microsoft Excel, Airtable, Notion and Google Sheets for records — Excel first, because almost every Indian business already has it and it needs no Google Workspace subscription; Stripe and QuickBooks for payments and invoicing; Make and n8n for orchestration; Supabase and AWS for data and hosting; and NotebookLM for working from your own documents. Anything with an API or a webhook can be connected.',
  },
  {
    id: 'faq-replace-my-team',
    question: 'Will this replace my staff?',
    answer:
      'No. SheetFlow handles the mechanical work — the first reply, the reminder, the data entry, the follow-up nobody got to. Your team keeps the conversations that need judgement. The usual outcome is that the same people handle more enquiries, not that fewer people are needed.',
  },
  {
    id: 'faq-getting-started',
    question: 'How do I start?',
    answer:
      'Book a free 30-minute audit. We map where enquiries currently arrive, where they stall, and which steps are worth automating first. There is no commitment, and you leave with the map whether or not you work with us.',
  },
  {
    id: 'faq-own-the-system',
    question: 'Do I own the automations you build?',
    answer:
      'Yes. Everything is built inside your own accounts — your CRM, your calendar, your messaging tools, your automation platform. If we stop working together, the systems keep running and you retain full access to them.',
  },
  {
    id: 'faq-existing-tools',
    question: 'Do I have to change the software I already use?',
    answer:
      'No. SheetFlow is built around your existing stack rather than replacing it. If a tool you depend on has no integration path at all, we will say so during the audit instead of asking you to migrate.',
  },
  // Buyer-intent questions (GEO). Phrased the way people ask answer engines, and
  // answered with how the work is done, never with a speed, price or outcome.
  {
    id: 'faq-whatsapp-follow-up-india',
    question: 'How do I automate WhatsApp lead follow-ups for my business in India?',
    answer:
      'Use the official WhatsApp Business Platform (the Cloud API) on a number registered to your business, rather than a tool that automates WhatsApp Web, which puts the number at risk of a ban. A working setup has four parts: a trigger that fires when an enquiry arrives on WhatsApp or a website form; a step that asks your qualifying questions and decides when a person should take over; a reply or booking link sent inside the conversation; and an update to your CRM or sheet. Customers must have opted in, and any message you start, rather than reply to, has to use a template Meta has approved. SheetFlow builds this inside your own accounts, often on n8n, and maps it with you on a free 30-minute audit first.',
  },
  {
    id: 'faq-n8n-crm-sync',
    question: 'Can SheetFlow build n8n workflows that keep my CRM in sync?',
    answer:
      'Yes. n8n is one of the orchestration platforms SheetFlow builds on. A CRM sync workflow takes a lead from wherever it arrives — WhatsApp, a web form, a call log or a spreadsheet — and creates or updates the matching record in HubSpot, Pipedrive, GoHighLevel, Airtable or Google Sheets, so nobody re-types it. Workflows are built in your own n8n instance, self-hosted or on n8n Cloud, with guard rails such as a pause switch, sending limits and a log of what ran, and you keep them if we stop working together.',
  },
  {
    id: 'faq-whatsapp-app-vs-api',
    question: 'What is the difference between the WhatsApp Business app and the WhatsApp Business API?',
    answer:
      'The WhatsApp Business app is a phone app for chatting with customers by hand, with quick replies and away messages. The WhatsApp Business Platform, usually called the API, connects your business number to software, so replies, qualification, bookings and CRM updates can run without someone holding the phone. It needs a Meta business account and approved templates for messages you start, and it is the route Meta supports for automating WhatsApp.',
  },
];
