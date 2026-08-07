/**
 * Pricing — the content source for `/pricing`.
 *
 * ## Where these figures come from
 *
 * Published under founder authorisation on 2026-08-07 (D25). The figures are
 * not invented for this page: **₹19,999** is the price already quoted to
 * prospects in `AAA-Client-Work/call-script-simple.txt`, and **₹4,999/month**
 * is the recurring figure carried in the pipeline ledger. Publishing what is
 * already quoted verbally is a disclosure, not a new claim.
 *
 * ## What may go in here
 *
 * The same rule as `content/faq.ts` and `content/services.ts`. Every line
 * below must be checkable against something the site already commits to:
 *
 *   - Every feature must map to a service in the `hasOfferCatalog` block in
 *     `lib/structured-data.ts`, or to something demonstrably delivered in a
 *     case study in `content/work.ts`. A test asserts the catalogue mapping.
 *   - No tool may be named here that is not already in the integrations answer
 *     in `content/faq.ts`.
 *
 * Deliberately absent, and each for a specific reason:
 *
 *   - **Delivery timelines.** No measured baseline exists. "Live in two weeks"
 *     would be a promise nobody has ever timed.
 *   - **Outcome claims.** "Pays for itself in a month" is an ROI assertion, and
 *     no outcome has been measured for any engagement (see `content/work.ts`).
 *   - **Discount anchoring.** Struck-through "was ₹40,000" pricing invents a
 *     price nobody was ever charged.
 *   - **Client counts or seats sold.** Unverified.
 *
 * ## On the currency
 *
 * Prices are stated in INR and labelled as such. The audience for these figures
 * is the market the founder actually sells into; a converted USD figure would
 * imply a USD price list that does not exist.
 */

export type PriceShape =
  | { kind: 'from'; amount: number; currency: 'INR'; unit: 'one-time' }
  | { kind: 'recurring'; amount: number; currency: 'INR'; unit: 'per month'; plusSetup: true }
  | { kind: 'quoted' };

export interface PricingTier {
  /** Stable id — DOM anchor and React key. */
  id: string;
  name: string;
  /** One line on who this is for. */
  audience: string;
  price: PriceShape;
  /** What the tier is, in one sentence. */
  summary: string;
  /** Included capability lines. Each maps to a catalogued service. */
  includes: string[];
  /** The honest limit of this tier — what it deliberately does not cover. */
  limit: string;
  cta: { label: string; href: string };
  /** Visually and programmatically marked as the common choice. */
  featured: boolean;
}

/** Formats a tier price for display. One place, so the page cannot disagree. */
export function formatPrice(price: PriceShape): { lead: string; note: string } {
  switch (price.kind) {
    case 'from':
      return { lead: `from ₹${price.amount.toLocaleString('en-IN')}`, note: 'one-time' };
    case 'recurring':
      return {
        lead: `₹${price.amount.toLocaleString('en-IN')}`,
        note: 'per month, plus one-time setup',
      };
    case 'quoted':
      return { lead: 'Quoted', note: 'scoped on a call' };
  }
}

export const tiers: PricingTier[] = [
  {
    id: 'foundation',
    name: 'Foundation',
    audience: 'A business whose enquiries currently arrive by phone and nowhere else.',
    price: { kind: 'from', amount: 19999, currency: 'INR', unit: 'one-time' },
    summary:
      'The site and the intake that captures an enquiry while the visitor is still on the page, and routes it to a channel you actually read.',
    includes: [
      'A production website, built and deployed',
      'Structured enquiry intake with validation and spam trapping',
      'Instant alerts the moment an enquiry lands',
      'WhatsApp hand-off carrying the reason for contact',
      'Structured data so search engines and AI assistants can read your business',
      'Built in accounts you own, and yours to keep',
    ],
    limit:
      'No recurring automation. Enquiries reach you fast, but the follow-up after that is still yours to send.',
    cta: { label: 'Book a free audit', href: '/book' },
    featured: false,
  },
  {
    id: 'automation',
    name: 'Automation',
    audience: 'A business losing revenue between the first enquiry and the booked appointment.',
    price: { kind: 'recurring', amount: 4999, currency: 'INR', unit: 'per month', plusSetup: true },
    summary:
      'Everything in Foundation, plus the systems that answer, qualify, book and record without anyone remembering to.',
    includes: [
      'Everything in Foundation',
      'AI assistant that replies and qualifies on WhatsApp, around the clock',
      'Self-serve appointment booking, synced to your calendar',
      'CRM kept up to date automatically — HubSpot, Pipedrive or GoHighLevel',
      'Automated invoice reminders',
      'One daily report covering leads, bookings and what needs you',
      'Ongoing monitoring and changes as your process changes',
    ],
    limit:
      'Scoped to one location and one core workflow set. Multi-branch routing and bespoke integrations sit in Bespoke.',
    cta: { label: 'Book a free audit', href: '/book' },
    featured: true,
  },
  {
    id: 'bespoke',
    name: 'Bespoke',
    audience: 'Multiple locations, an unusual stack, or a workflow nobody sells off the shelf.',
    price: { kind: 'quoted' },
    summary:
      'A scoped engagement for systems that do not fit a tier — because the honest answer is that they need to be looked at first.',
    includes: [
      'Everything in Automation',
      'Multi-location and multi-team routing',
      'Custom integrations against any API or webhook',
      'Bespoke internal tooling and reporting',
      'Direct line for changes',
    ],
    limit:
      'Priced only after the audit. Quoting this without seeing the systems would be a number invented to fill a column.',
    cta: { label: 'Talk it through', href: '/book' },
    featured: false,
  },
];

/* ------------------------------------------------------------------ */
/* Comparison                                                          */
/* ------------------------------------------------------------------ */

export interface ComparisonRow {
  /** Capability name. Must map to a catalogued service or a delivered build. */
  capability: string;
  /** Per-tier availability, keyed by tier id. */
  availability: Record<string, boolean>;
}

/**
 * The comparison table.
 *
 * Rows are capabilities, not adjectives — "Priority support" and "Dedicated
 * success manager" are the kind of row that exists to fill a grid rather than
 * to describe a difference, so there are none.
 */
export const comparison: ComparisonRow[] = [
  {
    capability: 'Production website, built and deployed',
    availability: { foundation: true, automation: true, bespoke: true },
  },
  {
    capability: 'Enquiry intake with validation and spam trapping',
    availability: { foundation: true, automation: true, bespoke: true },
  },
  {
    capability: 'Missed lead alerts',
    availability: { foundation: true, automation: true, bespoke: true },
  },
  {
    capability: 'Structured data and AI-assistant readability',
    availability: { foundation: true, automation: true, bespoke: true },
  },
  {
    capability: 'WhatsApp follow-ups, answered and qualified',
    availability: { foundation: false, automation: true, bespoke: true },
  },
  {
    capability: 'Appointment booking synced to your calendar',
    availability: { foundation: false, automation: true, bespoke: true },
  },
  {
    capability: 'CRM auto-updates',
    availability: { foundation: false, automation: true, bespoke: true },
  },
  {
    capability: 'Invoice reminders',
    availability: { foundation: false, automation: true, bespoke: true },
  },
  {
    capability: 'Daily business report',
    availability: { foundation: false, automation: true, bespoke: true },
  },
  {
    capability: 'Multi-location and multi-team routing',
    availability: { foundation: false, automation: false, bespoke: true },
  },
  {
    capability: 'Custom integrations against any API or webhook',
    availability: { foundation: false, automation: false, bespoke: true },
  },
];

/* ------------------------------------------------------------------ */
/* Pricing FAQ                                                         */
/* ------------------------------------------------------------------ */

export interface PricingFaq {
  id: string;
  question: string;
  answer: string;
}

export const pricingFaqs: PricingFaq[] = [
  {
    id: 'pricing-whats-included',
    question: 'What does the ₹19,999 actually cover?',
    answer:
      'A production website, built and deployed, with a structured enquiry intake that validates what visitors type, drops automated spam, alerts you the moment a real enquiry lands, and hands off to WhatsApp with the reason for contact already written. It also covers the structured data that lets search engines and AI assistants read your business correctly. It is a one-time fee, and ₹19,999 is the starting point rather than a fixed price — scope changes it.',
  },
  {
    id: 'pricing-monthly',
    question: 'What is the ₹4,999 per month for?',
    answer:
      'The automations that keep running after the site is live: an AI assistant answering and qualifying on WhatsApp around the clock, appointment booking synced to your calendar, your CRM updated without manual entry, invoice reminders, and a daily report. It also covers monitoring and changes as your process changes. There is a one-time setup fee alongside it, scoped on the audit call.',
  },
  {
    id: 'pricing-why-no-timeline',
    question: 'How long does it take to go live?',
    answer:
      'We do not publish a delivery timeline, because we have not measured one across enough projects to state honestly. You will get a specific date on the audit call, once the scope is known. A published figure that no engagement was ever timed against would be a guess dressed as a commitment.',
  },
  {
    id: 'pricing-results',
    question: 'What return should I expect?',
    answer:
      'We do not publish a return figure. No outcome has been measured against a stated method and confirmed with a client, so any number we printed here would be invented. The calculator on this page uses your figures and your own estimate of what you would recover — it is your arithmetic, not our claim. If you want a projection grounded in your actual numbers, that is what the audit produces.',
  },
  {
    id: 'pricing-ownership',
    question: 'Do I own what you build?',
    answer:
      'Yes. Everything is built inside your own accounts — your CRM, your calendar, your messaging tools, your automation platform. If we stop working together, the systems keep running and you retain full access to them.',
  },
  {
    id: 'pricing-contract',
    question: 'Am I locked into a contract?',
    answer:
      'The monthly automation plan runs month to month. Because the systems live in accounts you own, ending the plan does not switch anything off — you keep the automations and the data, and you lose the monitoring and the ongoing changes.',
  },
  {
    id: 'pricing-currency',
    question: 'Do you work with businesses outside India?',
    answer:
      'Yes. The prices on this page are quoted in Indian rupees because that is the market these figures were set for. For work billed in another currency, the scope and the equivalent price are agreed on the audit call.',
  },
];
