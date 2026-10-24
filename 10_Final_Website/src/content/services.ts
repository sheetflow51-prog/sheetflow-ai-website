/**
 * Service pages — the content source for `/services` and `/services/[slug]`.
 *
 * ## Why this file exists
 *
 * The homepage is a single route, which caps how much topical authority the
 * site can carry: one page cannot be the best answer to six different
 * questions. These entries turn **all six** catalogued services into genuine
 * topic clusters, each with its own URL, its own `Service` node, and its own
 * questions.
 *
 * ## Catalogue parity — why the last two were not optional
 *
 * Four of the six shipped in Phase G; `Daily Business Reports` and
 * `Invoice Reminders` did not. That left the entity graph advertising two
 * services with **no page behind them** — `hasOfferCatalog` named them, and a
 * consumer following the catalogue found an `Offer` with no `url`, no
 * description beyond one line, and nothing to cite. An advertised service with
 * no page is the schema equivalent of a dead link.
 *
 * The parity is now total and `seo.spec.ts` asserts it in both directions: every
 * catalogue entry has a page, and every page has a catalogue entry.
 *
 * It is also what finally makes `BreadcrumbList` honest. A breadcrumb on a
 * one-route site is schema spam; `Home › Services › WhatsApp Automation` is a
 * real ancestor chain, and every level of it resolves.
 *
 * ## What may go in here
 *
 * The same rule as `content/faq.ts`, and for the same reason — these pages are
 * *more* quotable than the homepage, because each one is narrowly on-topic.
 * Every claim below must already be true somewhere the site states it:
 *
 *   - `name` and `serviceType` must match the matching `Offer` in the
 *     `hasOfferCatalog` block in `lib/structured-data.ts`. If the two drift,
 *     the entity graph describes two different businesses. A test asserts this.
 *   - `integrations` may only name tools already listed in the integrations
 *     answer in `content/faq.ts`. Adding one here would be a new capability
 *     claim made in passing.
 *   - `steps` specialise the published five-step process; they do not invent a
 *     different methodology.
 *
 * Deliberately absent, exactly as on the homepage: prices, delivery timelines,
 * customer names, counts, metrics, outcomes, certifications.
 *
 * `symptoms` describe what a visitor already observes in their own business.
 * That is deliberate — it is the one kind of specificity available without
 * making a claim about SheetFlow's results.
 */

export interface ServiceStep {
  title: string;
  detail: string;
}

export interface ServiceFaq {
  /** Stable id — the DOM anchor, so an answer is directly linkable. */
  id: string;
  question: string;
  /** Plain prose, no markup. Extracted verbatim by answer engines. */
  answer: string;
}

export interface ServicePage {
  /** URL segment. Also the breadcrumb's last-item identity. */
  slug: string;
  /**
   * Must equal the `name` of the corresponding `Offer` in the organisation's
   * catalogue. Asserted by `seo.spec.ts`.
   */
  name: string;
  /** schema.org `serviceType`. Must equal the catalogue entry's. Asserted. */
  serviceType: string;
  /** Breadcrumb and card label, where `name` is too long to read as a crumb. */
  shortLabel: string;
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  /** The page's single H1. */
  headline: string;
  lede: string;
  /** Observable symptoms in the reader's business — never our claimed results. */
  symptoms: string[];
  steps: ServiceStep[];
  /** Strict subset of the tools named in `content/faq.ts`. Asserted. */
  integrations: string[];
  faqs: ServiceFaq[];
  /** Sibling slugs, for the internal links that make this a cluster. */
  related: string[];
}

export const services: ServicePage[] = [
  {
    slug: 'lead-capture',
    name: 'Missed Lead Alerts',
    serviceType: 'Lead capture automation',
    shortLabel: 'Lead Capture',
    metaTitle: 'Lead capture automation — never lose an enquiry to a slow reply',
    metaDescription:
      'Every enquiry, from every channel, in one place — with an instant alert the moment it arrives. Lead capture automation built into the tools you already run.',
    kicker: 'Lead capture',
    headline: 'The lead you lost was answered by someone faster.',
    lede: 'Enquiries arrive on a form, a phone, a DM and a WhatsApp thread, and each one lives somewhere different. SheetFlow puts them in a single stream and tells you the moment one lands — before it goes cold.',
    symptoms: [
      'Enquiries arrive in four places and nobody owns all four.',
      'A form submission sits unread in an inbox until the end of the day.',
      'You find out a lead went elsewhere when they say so.',
    ],
    steps: [
      {
        title: 'Every channel routes to one stream',
        detail:
          'Forms, WhatsApp, calls and chats are wired into a single intake, so there is one place to look instead of four.',
      },
      {
        title: 'The alert fires on arrival',
        detail:
          'A notification reaches whoever is on duty as the enquiry lands — not on a polling interval, and not at the end of the day.',
      },
      {
        title: 'Context travels with it',
        detail:
          'Where the lead came from, what they asked and what they already told you arrive together, so the first reply does not start from nothing.',
      },
      {
        title: 'Nothing depends on someone remembering',
        detail:
          'An enquiry that has not been answered stays visible instead of disappearing below the fold of an inbox.',
      },
    ],
    integrations: ['WhatsApp', 'Gmail', 'Slack', 'Telegram', 'Microsoft Excel', 'Airtable', 'Notion', 'Google Sheets'],
    faqs: [
      {
        id: 'faq-lead-capture-channels',
        question: 'Which channels can enquiries be captured from?',
        answer:
          'Anything that can send a webhook or expose an API. In practice that covers website forms, WhatsApp, email, Slack, Telegram, and the lead forms built into ad platforms. If a channel you depend on has no integration path at all, we will say so during the audit rather than ask you to move off it.',
      },
      {
        id: 'faq-lead-capture-existing-forms',
        question: 'Do I have to replace my current forms?',
        answer:
          'No. Capture is wired into the forms and inboxes you already use. The change is where the enquiry goes after it is submitted, not what your visitors fill in.',
      },
      {
        id: 'faq-lead-capture-ownership',
        question: 'Where does the lead data live?',
        answer:
          'In your own accounts — your CRM, your spreadsheet, your database. SheetFlow builds inside the systems you already own, so if we stop working together the capture keeps running and you keep full access to everything in it.',
      },
    ],
    related: ['whatsapp-automation', 'crm-automation'],
  },
  {
    slug: 'whatsapp-automation',
    name: 'WhatsApp Follow-Ups',
    serviceType: 'WhatsApp automation',
    shortLabel: 'WhatsApp Automation',
    metaTitle: 'WhatsApp automation — an assistant that replies, qualifies and books',
    metaDescription:
      'An AI assistant on WhatsApp that answers questions, qualifies enquiries and books calls around the clock — inside your own WhatsApp Business account.',
    kicker: 'WhatsApp automation',
    headline: 'Most enquiries arrive on WhatsApp. Most replies do not.',
    lede: 'WhatsApp is where your customers already are, and it is the channel least likely to be staffed at 9pm on a Sunday. SheetFlow builds an assistant that answers on the spot, works out whether someone is a fit, and books the ones who are.',
    symptoms: [
      'Messages arrive after hours and are answered the next working day.',
      'The same five questions get typed out by hand, every week.',
      'Qualifying happens on a call that should never have been booked.',
    ],
    steps: [
      {
        title: 'It replies immediately',
        detail:
          'The first response goes out when the message arrives, at any hour, instead of when someone next opens the app.',
      },
      {
        title: 'It answers what it can answer',
        detail:
          'The recurring questions — what you do, how it works, what happens next — are handled without a person, because the answers do not change.',
      },
      {
        title: 'It qualifies before it books',
        detail:
          'The assistant establishes fit first, so the calls that reach your calendar are the ones worth taking.',
      },
      {
        title: 'It hands over cleanly',
        detail:
          'Anything needing judgement goes to a person with the whole conversation attached. Your team keeps the conversations that need them.',
      },
    ],
    integrations: ['WhatsApp', 'Google Calendar', 'Calendly', 'HubSpot', 'Pipedrive', 'GoHighLevel', 'Slack'],
    faqs: [
      {
        id: 'faq-whatsapp-account',
        question: 'Whose WhatsApp account does this run on?',
        answer:
          'Yours. The assistant is built inside your own WhatsApp Business account, so the conversation history, the number and the relationship stay with you. If we stop working together, the account and everything in it remain yours.',
      },
      {
        id: 'faq-whatsapp-replace-team',
        question: 'Will customers be talking to a bot instead of a person?',
        answer:
          'For the mechanical part of the conversation, yes — the first reply, the recurring questions, the booking. Anything that needs judgement is handed to a person with the full thread attached. The usual outcome is that the same team handles more enquiries, not that fewer people are needed.',
      },
      {
        id: 'faq-whatsapp-booking',
        question: 'Can it book directly into my calendar?',
        answer:
          'Yes. Once someone qualifies, the assistant books into your calendar through Google Calendar or Calendly and the appointment is recorded in your CRM with the conversation that produced it.',
      },
    ],
    related: ['appointment-booking', 'lead-capture'],
  },
  {
    slug: 'appointment-booking',
    name: 'Appointment Booking',
    serviceType: 'Appointment booking automation',
    shortLabel: 'Appointment Booking',
    metaTitle: 'Appointment booking automation — self-serve scheduling, synced both ways',
    metaDescription:
      'A booking flow customers can complete themselves, synced to your calendar and CRM. No back-and-forth, no double-bookings, no manual entry afterwards.',
    kicker: 'Appointment booking',
    headline: 'Six messages to agree on a time nobody kept.',
    lede: 'Scheduling by conversation costs both sides a day and still produces no-shows. SheetFlow gives customers a flow they can finish on their own, and puts the result in your calendar and your CRM at the same time.',
    symptoms: [
      'Booking a single appointment takes a thread of back-and-forth.',
      'Two people are pencilled into the same slot.',
      'The appointment exists in the calendar but never reaches the CRM.',
    ],
    steps: [
      {
        title: 'Customers book themselves',
        detail:
          'Real availability, shown live, bookable without asking anyone. The back-and-forth disappears because there is nothing to negotiate.',
      },
      {
        title: 'The calendar is the source of truth',
        detail:
          'Availability is read from the calendar you already keep, so a slot that is taken is never offered.',
      },
      {
        title: 'The CRM updates at the same moment',
        detail:
          'The booking, the contact and the context land in your CRM as the appointment is made — not in a batch later, and not by hand.',
      },
      {
        title: 'Reminders go out on their own',
        detail:
          'The follow-up nobody got to is automated, on the same channel the customer used to book.',
      },
    ],
    integrations: ['Google Calendar', 'Calendly', 'WhatsApp', 'Gmail', 'HubSpot', 'Pipedrive', 'GoHighLevel'],
    faqs: [
      {
        id: 'faq-booking-calendar',
        question: 'Does it work with the calendar I already use?',
        answer:
          'Yes. Availability is read from your existing calendar through Google Calendar or Calendly rather than kept in a second system. There is no separate schedule to maintain, which is what prevents the two from disagreeing.',
      },
      {
        id: 'faq-booking-double',
        question: 'How are double-bookings prevented?',
        answer:
          'Slots are offered from live calendar availability at the moment someone looks, so a time that has been taken is never shown. Because there is only one calendar and it is yours, there is no second copy to fall out of sync.',
      },
      {
        id: 'faq-booking-crm',
        question: 'Does the booking reach my CRM?',
        answer:
          'Yes — the appointment, the contact and the context that produced it are written to HubSpot, Pipedrive or GoHighLevel as the booking is made, so there is no manual entry step afterwards.',
      },
    ],
    related: ['whatsapp-automation', 'crm-automation'],
  },
  {
    slug: 'crm-automation',
    name: 'CRM Auto-Updates',
    serviceType: 'CRM automation',
    shortLabel: 'CRM Automation',
    metaTitle: 'CRM automation — a pipeline that is accurate without anyone updating it',
    metaDescription:
      'Forms, calls and chats flow into HubSpot, Pipedrive or GoHighLevel automatically. No manual entry, no stale pipeline, no reporting built on a guess.',
    kicker: 'CRM automation',
    headline: 'A CRM is only worth what the last person bothered to type into it.',
    lede: 'Manual entry is the step that gets skipped when things are busy — which is exactly when the record matters. SheetFlow writes to the CRM as things happen, so the pipeline reflects the business rather than someone’s memory of it.',
    symptoms: [
      'Deals sit in a stage they left two weeks ago.',
      'The same contact exists three times, spelled three ways.',
      'Nobody trusts the pipeline report enough to act on it.',
    ],
    steps: [
      {
        title: 'Records are written as things happen',
        detail:
          'A form submitted, a call taken, a message answered — each one updates the CRM at the moment it occurs, not at the end of a week nobody had time in.',
      },
      {
        title: 'Context comes with the record',
        detail:
          'What the enquiry asked and where it came from are attached to the contact, so the next person to open it is not starting cold.',
      },
      {
        title: 'Stages move on evidence',
        detail:
          'A booking made or a reply received advances the deal, so the stage reflects what actually happened rather than a manual judgement nobody made.',
      },
      {
        title: 'The reporting stops being fiction',
        detail:
          'Because the pipeline is written by the system that did the work, the daily summary is describing the business rather than the data-entry backlog.',
      },
    ],
    integrations: ['HubSpot', 'Pipedrive', 'GoHighLevel', 'Microsoft Excel', 'Airtable', 'Notion', 'Gmail', 'WhatsApp', 'Google Sheets'],
    faqs: [
      {
        id: 'faq-crm-which',
        question: 'Which CRMs are supported?',
        answer:
          'HubSpot, Pipedrive and GoHighLevel are the ones most commonly connected. Where a business keeps its records in Microsoft Excel instead — on OneDrive, SharePoint or a plain file — that is wired the same way and needs no Google Workspace account. Airtable, Notion and Google Sheets are supported equally. Anything exposing an API or webhook can be connected.',
      },
      {
        id: 'faq-crm-migrate',
        question: 'Do I have to migrate to a different CRM?',
        answer:
          'No. The automation is built around the CRM you already run rather than replacing it. If the tool you depend on has no integration path at all, we will tell you during the audit instead of asking you to migrate.',
      },
      {
        id: 'faq-crm-manual-entry',
        question: 'Does this remove manual data entry entirely?',
        answer:
          'It removes the mechanical part — the entry that follows automatically from a form, a booking or a message. Notes that require a judgement call are still worth a person writing, and those stay with your team.',
      },
    ],
    related: ['lead-capture', 'business-reports'],
  },

  {
    slug: 'business-reports',
    name: 'Daily Business Reports',
    serviceType: 'Business reporting automation',
    shortLabel: 'Business Reports',
    metaTitle: 'Automated business reports — one morning email instead of five dashboards',
    metaDescription:
      'Leads, bookings, revenue and what needs your attention today, assembled overnight and delivered as one email. No dashboard to remember to open.',
    kicker: 'Business reporting',
    headline: 'A dashboard nobody opens is not reporting.',
    lede: 'Every tool you run has its own dashboard, and checking five of them is a job nobody has time for. SheetFlow assembles the handful of numbers that change a decision and sends them to you once, in the place you already look first.',
    symptoms: [
      'The numbers exist in four tools and have never been in one place.',
      'You find out something went wrong when a customer tells you.',
      'Someone spends an hour every Monday rebuilding the same spreadsheet.',
    ],
    steps: [
      {
        title: 'The sources are read where they already live',
        detail:
          'Bookings from the calendar, enquiries from the intake, deals from the CRM, payments from the payment tool — pulled from the systems that already hold them rather than re-entered anywhere.',
      },
      {
        title: 'Only what changes a decision is included',
        detail:
          'A report that lists everything gets skimmed. This carries the figures worth acting on and the exceptions that need you, and leaves the rest in the tools that own it.',
      },
      {
        title: 'It arrives where you already look',
        detail:
          'Email, Slack or WhatsApp — delivered to the surface you open anyway, so reading it is not a separate habit you have to build.',
      },
      {
        title: 'Exceptions are called out, not buried',
        detail:
          'An enquiry with no reply, a booking with no confirmation, an invoice past its date. The report names what is stuck instead of leaving you to notice its absence.',
      },
    ],
    integrations: ['Gmail', 'Slack', 'WhatsApp', 'Microsoft Excel', 'Airtable', 'Notion', 'HubSpot', 'Pipedrive', 'Google Calendar', 'Stripe', 'Google Sheets'],
    faqs: [
      {
        id: 'faq-reports-whats-in-it',
        question: 'What is actually in the daily report?',
        answer:
          'The figures that change a decision — new enquiries, bookings made, deals moved, payments received — followed by the exceptions that need you: an enquiry with no reply, a booking unconfirmed, an invoice past its date. It is built around what your business tracks, so the exact contents are agreed during the audit rather than fixed in advance.',
      },
      {
        id: 'faq-reports-where',
        question: 'Where does the report arrive?',
        answer:
          'Wherever you already look first — email, Slack or WhatsApp. The point of the report is that reading it does not require a new habit, so it goes to a surface you open anyway rather than to a dashboard you would have to remember.',
      },
      {
        id: 'faq-reports-frequency',
        question: 'Can I get it more or less often than daily?',
        answer:
          'Yes. Daily suits most service businesses because it matches the rhythm of enquiries and bookings, but the same assembly runs weekly or on a schedule you choose. Exception alerts can also fire immediately rather than waiting for the next report.',
      },
      {
        id: 'faq-reports-excel-output',
        question: 'Can the report arrive as an Excel workbook rather than an email?',
        answer:
          'Yes, and for anything an accountant will touch it is usually the better answer. The email is for reading; a workbook is for filtering, annotating and totalling, which is what actually happens to a set of figures once someone needs to work with them. Reports can be written as a multi-sheet Excel file — a detail sheet, a cleaned ledger and a summary — delivered to OneDrive, SharePoint or as an attachment, with no Google Workspace account involved. Both can run from the same assembly, so the email stays as the daily glance and the workbook accumulates the record.',
      },
    ],
    related: ['crm-automation', 'lead-capture'],
  },

  {
    slug: 'invoice-reminders',
    name: 'Invoice Reminders',
    serviceType: 'Invoice reminder automation',
    shortLabel: 'Invoice Reminders',
    metaTitle: 'Automated invoice reminders — get paid without chasing anyone',
    metaDescription:
      'Polite, automatic follow-ups on unpaid invoices, sent on a schedule and stopped the moment payment lands. Nobody has to decide whether today is the day to chase.',
    kicker: 'Invoice reminders',
    headline: 'Most unpaid invoices are not refused. They are forgotten.',
    lede: 'Chasing payment is uncomfortable, so it gets postponed, and the longer it waits the more uncomfortable it becomes. Automating the reminder removes the decision entirely — the follow-up goes on schedule, in your tone, and stops the moment the money arrives.',
    symptoms: [
      'You are not sure which invoices are currently unpaid without going to look.',
      'Chasing feels rude, so it happens late or not at all.',
      'A client has paid and someone chased them anyway.',
    ],
    steps: [
      {
        title: 'Unpaid invoices are tracked automatically',
        detail:
          'Status is read from the tool that issued the invoice, so what counts as outstanding is the payment system’s answer rather than someone’s recollection.',
      },
      {
        title: 'Reminders go on a schedule you set',
        detail:
          'A sequence agreed once — before the due date, on it, and after — so the timing is a decision you made calmly rather than one made every time under discomfort.',
      },
      {
        title: 'The wording stays yours',
        detail:
          'Reminders read as your business, not as a collections notice. The tone is agreed up front, because a reminder that damages the relationship costs more than the invoice.',
      },
      {
        title: 'Payment stops the sequence immediately',
        detail:
          'The moment an invoice is marked paid the follow-ups stop. Chasing someone who has already paid is the failure mode that makes businesses abandon reminders entirely.',
      },
    ],
    integrations: ['Stripe', 'QuickBooks', 'WhatsApp', 'Gmail', 'Microsoft Excel', 'Make', 'Google Sheets'],
    faqs: [
      {
        id: 'faq-invoices-tone',
        question: 'Will automated reminders annoy my clients?',
        answer:
          'That depends entirely on the wording and the schedule, which is why both are agreed with you rather than defaulted. Reminders read as your business rather than as a collections notice, and the sequence stops the instant an invoice is marked paid — chasing someone who has already paid is what actually damages a relationship.',
      },
      {
        id: 'faq-invoices-tools',
        question: 'Which invoicing tools does this work with?',
        answer:
          'Stripe and QuickBooks are the ones most commonly connected. Where invoices are tracked in a Microsoft Excel workbook instead — which is where most Indian businesses already keep them — that works the same way, with no Google Workspace account required. Google Sheets is supported on the same footing. Anything exposing an API or webhook can be connected, and the payment status is always read from the system that issued the invoice rather than maintained separately.',
      },
      {
        id: 'faq-invoices-control',
        question: 'Can I stop a reminder for a specific client?',
        answer:
          'Yes. Individual clients or invoices can be excluded from the sequence, which matters when a payment plan has been agreed or a conversation is already underway. The automation handles the default case so that your attention goes to the exceptions.',
      },
    ],
    related: ['business-reports', 'crm-automation'],
  },
];

export const serviceSlugs = services.map((s) => s.slug);

export function getService(slug: string): ServicePage | undefined {
  return services.find((s) => s.slug === slug);
}
