/**
 * Pricing — the content source for `/pricing` and the homepage pricing beat.
 *
 * ## Why there is no price on this page any more
 *
 * D25 (2026-08-08) published ₹19,999 one-time and ₹4,999/month. D38
 * (2026-10-23) withdraws both, on the founder's instruction: a fixed figure
 * printed before anyone has seen the client's systems was arbitrary, and it
 * mis-sold a bespoke engagement as a price list. Each tier is now an
 * **engagement shape** — what it includes, where it stops, how it is quoted —
 * and every quote is given in writing after the audit call.
 *
 * Nothing on this page may state, imply or anchor a number in its place: no
 * "from", no range, no struck-through figure, no "typical cost" borrowed from
 * a market rate card. `tests/e2e/commerce.spec.ts` fails on a currency figure.
 *
 * ## What may go in here
 *
 * The same rule as `content/faq.ts` and `content/services.ts`. Every line
 * below must be checkable against something the site already commits to:
 *
 *   - Every feature must map to a service in the `hasOfferCatalog` block in
 *     `lib/structured-data.ts`, or to something demonstrably delivered in a
 *     case study in `content/work.ts` or `content/dashboards.ts`.
 *   - No tool may be named here that is not already in the integrations answer
 *     in `content/faq.ts`.
 *
 * ## Two commitments the founder authorised in D38
 *
 *   - **The 48–72 hour time-box on the Rapid Sprint's proof of concept.** It is
 *     a limit the founder sets on the build work once the scope is agreed, not
 *     a measured average, and the copy says so. Production builds still carry
 *     no published timeline.
 *   - **A service-level agreement in the Enterprise tier.** Its terms are
 *     agreed per contract; nothing here states a response time.
 *
 * Still deliberately absent: outcome or ROI claims (no outcome has been
 * measured — D24), discount anchoring, client counts, and "most popular"
 * badging (the featured tier is the one we *recommend*).
 */

/** How a tier is quoted. Rendered in place of a price. */
export interface Engagement {
  /** The shape of the engagement, e.g. "Fixed-scope sprint". */
  model: string;
  /** How and when it is quoted. */
  quote: string;
}

export interface PricingTier {
  /** Stable id — DOM anchor, React key, schema `@id` fragment, booking attribution. */
  id: string;
  name: string;
  /** One line on who this is for. */
  audience: string;
  engagement: Engagement;
  /** What the tier is, in one sentence. */
  summary: string;
  /** Included capability lines. Each maps to a catalogued service or a delivered build. */
  includes: string[];
  /** The honest limit of this tier — what it deliberately does not cover. */
  limit: string;
  /** Booking CTA label. The href is built per tier by `tierBookingUrl` in `lib/booking.ts`. */
  cta: string;
  /** Visually and programmatically marked as the one we recommend. */
  featured: boolean;
}

export const tiers: PricingTier[] = [
  {
    id: 'foundation',
    name: 'Foundation Audit & Rapid Sprint',
    audience: 'A business that wants proof on one workflow before committing to a build.',
    engagement: {
      model: 'Fixed-scope sprint',
      quote: 'Fixed fee, quoted in writing after the audit call',
    },
    summary:
      'We audit the tools you already run, map where enquiries arrive, stall and drop, and build a working proof of concept of the workflow that matters most.',
    includes: [
      'Architecture audit of the tools and accounts you already run',
      'A workflow map: where enquiries arrive, where they stall, where they are lost',
      'A working proof of concept on one workflow, time-boxed to 48–72 hours of build time once scope and access are agreed',
      'A written build plan with the scope and a fixed quote for the next step',
      'Built in accounts you own, and yours to keep',
    ],
    limit:
      'One workflow, proven end to end. A production rollout across the business is the Operations Engine.',
    cta: 'Book automation audit',
    featured: false,
  },
  {
    id: 'operations',
    name: 'Autonomous Operations Engine',
    audience: 'A business losing revenue between the first enquiry and the booked appointment.',
    engagement: {
      model: 'Build + monthly operations',
      quote: 'Scoped from the audit, operations month to month',
    },
    summary:
      'The systems that answer, qualify, book, record and report across your channels, built to production and kept running without anyone remembering to.',
    includes: [
      'Everything in the Foundation sprint',
      'AI assistant that replies and qualifies on WhatsApp, around the clock',
      'CRM kept in sync automatically — HubSpot, Pipedrive or GoHighLevel',
      'Self-serve appointment booking, synced to your calendar',
      'Missed-lead alerts and automated invoice reminders',
      'A custom operations dashboard, plus one daily report',
      'Monitoring and changes as your process changes',
    ],
    limit:
      'Scoped to one business and one core workflow set. Multiple locations, custom agents and contractual service levels sit in Enterprise.',
    cta: 'Book automation audit',
    featured: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Bespoke Infrastructure',
    audience: 'Multiple locations or teams, an unusual stack, or a workflow nobody sells off the shelf.',
    engagement: {
      model: 'Bespoke engagement',
      quote: 'Scoped at proposal, service levels set in the contract',
    },
    summary:
      'Custom agents and dedicated pipelines built around your own processes, run under a written service-level agreement and improved on a schedule.',
    includes: [
      'Everything in the Operations Engine',
      'Custom AI agents built around your own processes',
      'Dedicated automation pipelines per location or team',
      'Custom integrations against any API or webhook',
      'A service-level agreement written into the contract',
      'Continuous optimisation: scheduled reviews, then changes',
    ],
    limit:
      'Quoted only after the audit maps every location and system. Service levels are agreed in writing per engagement, not promised from a page.',
    cta: 'Book automation audit',
    featured: false,
  },
];

/** Label for the secondary path under every tier: qualify first, then book. */
export const CUSTOM_SCOPE_LABEL = 'Custom scope? Share details first';

/* ------------------------------------------------------------------ */
/* How an engagement runs, and what sets the quote                     */
/* ------------------------------------------------------------------ */

export interface EngagementStep {
  id: string;
  name: string;
  detail: string;
}

/**
 * The stage gates every engagement passes through. Each ends in something the
 * client keeps and a decision the client makes — which is why only the first
 * step can be free and why later steps are quoted, not listed.
 */
export const engagementSteps: EngagementStep[] = [
  {
    id: 'audit',
    name: 'Audit call',
    detail: 'Free, 30 minutes. We map your tools and where enquiries stall. You leave with the map either way.',
  },
  {
    id: 'sprint',
    name: 'Rapid Sprint',
    detail: 'A fixed-fee proof of concept on one workflow, time-boxed to 48–72 hours of build time once the scope is agreed and access to your accounts is granted.',
  },
  {
    id: 'build',
    name: 'Build',
    detail: 'The production system, against a written scope and a fixed quote you approve first.',
  },
  {
    id: 'operate',
    name: 'Operate',
    detail: 'Monitoring and changes, month to month — or under a contract with agreed service levels.',
  },
];

/**
 * What moves a quote. Published so that a page without a number reads as
 * "scoped", not "hidden": the visitor can see exactly what the audit measures.
 */
export const scopeDrivers: string[] = [
  'How many tools and accounts need connecting',
  'How many locations, teams and WhatsApp numbers are involved',
  'Message and enquiry volume',
  'How much of the workflow is unusual to your business',
  'The level of monitoring and the service levels you need',
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
    capability: 'Architecture audit and workflow map',
    availability: { foundation: true, operations: true, enterprise: true },
  },
  {
    capability: 'Proof of concept on one workflow',
    availability: { foundation: true, operations: true, enterprise: true },
  },
  {
    capability: 'WhatsApp follow-ups, answered and qualified',
    availability: { foundation: false, operations: true, enterprise: true },
  },
  {
    capability: 'CRM auto-updates',
    availability: { foundation: false, operations: true, enterprise: true },
  },
  {
    capability: 'Appointment booking synced to your calendar',
    availability: { foundation: false, operations: true, enterprise: true },
  },
  {
    capability: 'Missed-lead alerts and invoice reminders',
    availability: { foundation: false, operations: true, enterprise: true },
  },
  {
    capability: 'Custom operations dashboard and daily report',
    availability: { foundation: false, operations: true, enterprise: true },
  },
  {
    capability: 'Monitoring and ongoing changes',
    availability: { foundation: false, operations: true, enterprise: true },
  },
  {
    capability: 'Custom AI agents',
    availability: { foundation: false, operations: false, enterprise: true },
  },
  {
    capability: 'Multi-location and multi-team pipelines',
    availability: { foundation: false, operations: false, enterprise: true },
  },
  {
    capability: 'Custom integrations against any API or webhook',
    availability: { foundation: false, operations: false, enterprise: true },
  },
  {
    capability: 'Service-level agreement in the contract',
    availability: { foundation: false, operations: false, enterprise: true },
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
    id: 'pricing-why-no-price',
    question: 'Why is there no price on this page?',
    answer:
      'Because the price depends on things we cannot see from here: how many tools need connecting, how many locations and WhatsApp numbers are involved, how much volume runs through them, and how much of your process is unusual. A number printed before seeing those would be invented to fill a column. The audit call maps them, and you get a written quote before any work starts.',
  },
  {
    id: 'pricing-sprint',
    question: 'What is the Rapid Sprint?',
    answer:
      'The paid first step after the free audit. We audit the tools you already run, map one workflow end to end, and build a working proof of concept of it, time-boxed to 48–72 hours of build time once the scope is agreed and access to your accounts is granted. It is a demonstration-grade build of that one workflow, not a production rollout. It is a fixed fee, quoted before it starts, and you keep the workflow map, the proof of concept and the written build plan whether or not you go further.',
  },
  {
    id: 'pricing-monthly',
    question: 'What does the monthly part of the Operations Engine cover?',
    answer:
      'Keeping the systems running and changing with you: monitoring, fixes when a connected tool changes, and adjustments as your process changes. It is part of the written quote, sized to the workflows and channels it covers.',
  },
  {
    id: 'pricing-why-no-timeline',
    question: 'How long does a full build take?',
    answer:
      'We do not publish a delivery timeline for production builds, because we have not measured one across enough projects to state honestly. The one fixed time on this page is the Rapid Sprint’s 48–72 hour time-box, which is a limit we set on our own work rather than an average we have measured. You get a specific build date on the audit call, once the scope is known.',
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
      'The monthly operations in the Operations Engine run month to month. Because the systems live in accounts you own, ending them does not switch anything off — you keep the automations and the data, and you lose the monitoring and the ongoing changes. Enterprise engagements run on a written contract, with the service levels agreed in it.',
  },
  {
    id: 'pricing-currency',
    question: 'Do you work with businesses outside India?',
    answer:
      'Yes. Quotes are in Indian rupees by default. For work billed in another currency, the scope and the price are agreed in that currency on the audit call.',
  },
  {
    id: 'pricing-usage-costs',
    question: 'Are WhatsApp and AI usage charges included in the quote?',
    answer:
      'No, and they are never marked up. Usage-based charges — WhatsApp message fees from Meta, AI model usage, hosting — are billed by those providers directly to your own accounts, because that is where everything is built. The audit tells you which ones apply to your setup before you approve anything.',
  },
];
