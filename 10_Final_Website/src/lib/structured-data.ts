/**
 * The site's entity graph.
 *
 * ## Why this moved out of `layout.tsx`
 *
 * The graph used to be emitted from the root layout, which was correct while
 * the site was one route and became wrong the moment it was not: every page
 * would have claimed to be the homepage (`WebPage` pinned to `/#webpage`) and
 * carried the homepage's FAQ. Sub-pages need their own `WebPage`, their own
 * questions and their own breadcrumb.
 *
 * ## One block per page, not one block per node
 *
 * Each route emits a **single** `<script type="application/ld+json">` holding
 * one `@graph`. Consumers resolve the whole entity set — organisation, site,
 * page, service, questions — in one pass, instead of guessing how four loose
 * blocks relate. `seo.spec.ts` asserts the "exactly one block" invariant on
 * every route, because a second block is how this silently regresses.
 *
 * The organisation and website nodes are repeated on every page. That is
 * deliberate and is how schema.org graphs are meant to work: each page is
 * independently resolvable, and identical `@id`s let a consumer merge them.
 */

import { faqs } from '@/content/faq';
import { services, type ServicePage } from '@/content/services';
import { projects, type WorkProject } from '@/content/work';
import { tiers, pricingFaqs } from '@/content/pricing';
import { BOOKING_URL, WHATSAPP_NUMBER } from '@/lib/contact';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sheetflow.click';

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

type Node = Record<string, unknown>;

/**
 * The service catalogue. `content/services.ts` mirrors four of these into full
 * pages and a test asserts the `name`/`serviceType` pairs still match — if the
 * two drift, the graph advertises services the pages do not describe.
 */
const OFFER_CATALOGUE = [
  {
    name: 'Missed Lead Alerts',
    description:
      'Instant notifications the moment a lead comes in — so nothing waits 24 hours for a reply.',
    serviceType: 'Lead capture automation',
  },
  {
    name: 'WhatsApp Follow-Ups',
    description:
      'An AI assistant that answers questions, qualifies leads, and books calls on WhatsApp — 24/7.',
    serviceType: 'WhatsApp automation',
  },
  {
    name: 'Appointment Booking',
    description:
      'A self-serve booking flow that syncs to your calendar and CRM. No back-and-forth.',
    serviceType: 'Appointment booking automation',
  },
  {
    name: 'Daily Business Reports',
    description:
      'A clean morning email with leads, bookings, revenue and what needs your attention today.',
    serviceType: 'Business reporting automation',
  },
  {
    name: 'CRM Auto-Updates',
    description:
      'Forms, calls and chats flow into HubSpot, Pipedrive or GoHighLevel automatically. No manual entry.',
    serviceType: 'CRM automation',
  },
  {
    name: 'Invoice Reminders',
    description:
      'Polite, automated nudges that get invoices paid faster — without you chasing clients.',
    serviceType: 'Invoice reminder automation',
  },
] as const;

/** Slug for a catalogued service that has a page; `undefined` if it has none. */
function pageForOffer(serviceType: string): ServicePage | undefined {
  return services.find((s) => s.serviceType === serviceType);
}

export const organizationNode: Node = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'SheetFlow AI',
  url: SITE_URL,
  // Square 512 cut of the canonical render. Google's structured-data guidance
  // expects a logo it can crop predictably; the raw 248x252 source was neither
  // square nor large enough.
  logo: `${SITE_URL}/brand/raster/lockup-512.png`,
  description:
    'AI automation agency for growing businesses — lead capture, WhatsApp follow-ups, appointment booking, CRM and reporting automation.',
  sameAs: [
    'https://x.com/sheetflow51',
    'https://www.instagram.com/sheetflow51',
    'https://www.linkedin.com/in/sheet-flow-1173563a7',
    // GitHub removed in D39: the profile's public repositories are named after
    // former clients. Restore once they are private or renamed.
  ],
  /**
   * NOT typed as `LocalBusiness`. That subtype requires a `PostalAddress`, and
   * SheetFlow publishes no street address or locality anywhere — inventing one
   * to satisfy a schema would be fabricated business information, which both
   * this project's first standing rule and Google's own structured-data policy
   * forbid. `Organization` is the accurate type for a remote service business.
   * Revisit only if a real registered address is provided.
   */
  telephone: `+${WHATSAPP_NUMBER}`,
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: `+${WHATSAPP_NUMBER}`,
      url: BOOKING_URL,
      availableLanguage: ['en', 'hi'],
    },
  ],
  /**
   * GEO signal. `knowsAbout` is how an assistant answering "who does WhatsApp
   * automation for clinics" decides whether this entity is relevant, and it is
   * read directly rather than inferred from prose. Every entry below maps to a
   * service the site actually sells (see `hasOfferCatalog`) or a tool named in
   * the integrations section — nothing aspirational, or it becomes a claim.
   */
  knowsAbout: [
    'Business process automation',
    'AI workflow automation',
    'Lead capture automation',
    'WhatsApp Business API automation',
    'Appointment booking automation',
    'CRM automation',
    'Automated business reporting',
    'Invoice reminder automation',
    'n8n workflow orchestration',
    'Lead qualification automation',
    'CRM data synchronisation',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'AI Automation Services',
    itemListElement: OFFER_CATALOGUE.map((offer) => {
      const page = pageForOffer(offer.serviceType);
      return {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          // A service with a page gets that page's @id, so the catalogue entry
          // and the page's own Service node are the same entity rather than
          // two unrelated nodes describing the same thing.
          ...(page ? { '@id': `${SITE_URL}/services/${page.slug}#service` } : {}),
          name: offer.name,
          description: offer.description,
          serviceType: offer.serviceType,
          provider: { '@id': ORG_ID },
          ...(page ? { url: `${SITE_URL}/services/${page.slug}` } : {}),
        },
      };
    }),
  },
};

export const websiteNode: Node = {
  '@type': 'WebSite',
  '@id': SITE_ID,
  name: 'SheetFlow AI',
  url: SITE_URL,
  publisher: { '@id': ORG_ID },
  inLanguage: 'en',
};

/**
 * FAQPage built from a supplied question set.
 *
 * Google's guidance requires FAQPage markup to match on-page content; markup
 * answering questions the page does not is treated as spam. Both the markup
 * and the rendered disclosure come from one array, which makes that class of
 * mismatch impossible — and a test asserts the rendered copy still matches.
 *
 * This is also each page's primary answer-engine surface: AI Overviews,
 * Perplexity and ChatGPT browsing quote question/answer pairs far more readily
 * than prose, and they quote them verbatim.
 */
function faqNode(
  pageUrl: string,
  entries: ReadonlyArray<{ id: string; question: string; answer: string }>,
): Node {
  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    isPartOf: { '@id': SITE_ID },
    mainEntity: entries.map((f) => ({
      '@type': 'Question',
      '@id': `${pageUrl}#${f.id}`,
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

/**
 * BreadcrumbList.
 *
 * Absent from this site for its whole life, and correctly so: a breadcrumb
 * trail for a page with no ancestors is schema spam and a rich-result risk.
 * The service tree gives it real ancestors, so it is emitted **only** on pages
 * that have them. The homepage still carries none.
 */
function breadcrumbNode(pageUrl: string, trail: Array<{ name: string; url: string }>): Node {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/** Homepage — unchanged from what shipped, minus the move out of the layout. */
export function homeGraph(): Node[] {
  const webPage: Node = {
    '@type': 'WebPage',
    '@id': `${SITE_URL}/#webpage`,
    url: SITE_URL,
    name: 'SheetFlow AI — AI automation agency for growing businesses.',
    isPartOf: { '@id': SITE_ID },
    about: { '@id': ORG_ID },
    primaryImageOfPage: `${SITE_URL}/brand/raster/lockup-512.png`,
    inLanguage: 'en',
  };
  return [organizationNode, websiteNode, webPage, faqNode(`${SITE_URL}/`, faqs)];
}

/** `/services` — a CollectionPage whose members are the four service pages. */
export function servicesIndexGraph(): Node[] {
  const url = `${SITE_URL}/services`;
  const collection: Node = {
    '@type': 'CollectionPage',
    '@id': `${url}#webpage`,
    url,
    name: 'AI automation services',
    isPartOf: { '@id': SITE_ID },
    about: { '@id': ORG_ID },
    inLanguage: 'en',
    hasPart: services.map((s) => ({ '@id': `${SITE_URL}/services/${s.slug}#service` })),
  };
  return [
    organizationNode,
    websiteNode,
    collection,
    breadcrumbNode(url, [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Services', url },
    ]),
  ];
}

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

/**
 * `/pricing` — an OfferCatalog of the three engagement tiers, plus the pricing FAQ.
 *
 * ## Why there is no price in the graph
 *
 * Until D38 this graph carried `priceSpecification` nodes for the D25 prices,
 * because a machine-readable price is what gets an agency quoted by assistants.
 * D38 withdrew those prices: every tier is now quoted in writing after the
 * audit. A price node here would advertise a figure the page no longer states,
 * so each Offer carries the tier, its summary and how it is quoted, and nothing
 * numeric. `llms.txt` tells assistants the same thing in prose.
 */
export function pricingGraph(): Node[] {
  const url = `${SITE_URL}/pricing`;

  const offers = tiers.map((tier) => {
    const offer: Node = {
      '@type': 'Offer',
      '@id': `${url}#${tier.id}`,
      name: `${tier.name} — ${'SheetFlow AI'}`,
      description: `${tier.summary} ${tier.engagement.quote}.`,
      url,
      category: tier.name,
      seller: { '@id': ORG_ID },
      availability: 'https://schema.org/InStock',
    };

    // No priceSpecification, on purpose (D38): every tier is quoted after the
    // audit, so any price node would advertise a figure the page does not
    // state. An Offer without a price is valid schema.org; it is simply not
    // eligible for price-bearing rich results, which is the honest outcome.
    return offer;
  });

  const webPage: Node = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: 'Pricing',
    description:
      'SheetFlow engagements — a Foundation Audit & Rapid Sprint, an Autonomous Operations Engine and Enterprise Bespoke Infrastructure, each quoted in writing after a free automation audit.',
    isPartOf: { '@id': SITE_ID },
    about: { '@id': ORG_ID },
    inLanguage: 'en',
  };

  const catalogue: Node = {
    '@type': 'OfferCatalog',
    '@id': `${url}#catalog`,
    name: 'SheetFlow pricing',
    provider: { '@id': ORG_ID },
    itemListElement: offers,
  };

  return [
    organizationNode,
    websiteNode,
    webPage,
    catalogue,
    breadcrumbNode(url, [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Pricing', url },
    ]),
    faqNode(url, pricingFaqs),
  ];
}

/* ------------------------------------------------------------------ */
/* Booking                                                             */
/* ------------------------------------------------------------------ */

/**
 * `/book` — the audit as a `Service` with a zero-price offer, plus a
 * `ReserveAction` naming the booking surface.
 *
 * The free audit is the site's single conversion goal, and "free" is a claim a
 * consumer should be able to read rather than infer from the word. A `price: 0`
 * offer states it unambiguously.
 */
export function bookingGraph(): Node[] {
  const url = `${SITE_URL}/book`;

  const auditService: Node = {
    '@type': 'Service',
    '@id': `${url}#audit`,
    name: 'Free automation audit',
    serviceType: 'Business automation consultation',
    description:
      'A 30-minute call mapping where enquiries arrive, where they stall, and which steps are worth automating first. No commitment.',
    provider: { '@id': ORG_ID },
    url,
    offers: {
      '@type': 'Offer',
      price: 0,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: BOOKING_URL,
    },
  };

  const webPage: Node = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: 'Book a free automation audit',
    description:
      'Book a free 30-minute automation audit with SheetFlow. We map where your enquiries arrive, where they stall, and what is worth automating first.',
    isPartOf: { '@id': SITE_ID },
    about: { '@id': `${url}#audit` },
    inLanguage: 'en',
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: BOOKING_URL,
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform',
        ],
      },
      result: { '@type': 'Reservation', name: 'Free automation audit' },
    },
  };

  return [
    organizationNode,
    websiteNode,
    auditService,
    webPage,
    breadcrumbNode(url, [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Book an audit', url },
    ]),
  ];
}

/* ------------------------------------------------------------------ */
/* Work / case studies                                                 */
/* ------------------------------------------------------------------ */

/**
 * `/work` — a CollectionPage whose members are the case studies.
 *
 * Note what is deliberately **absent**: no `Review`, no `AggregateRating`, no
 * `Rating` anywhere in this subtree. Both types assert an evaluation, and
 * SheetFlow has published no measured outcome for any of these projects. A
 * `Review` node with no review behind it is exactly the fabricated trust signal
 * the proof architecture exists to prevent — and Google's structured-data
 * policy treats self-serving review markup as a manual-action risk. A test
 * asserts these types never appear.
 */
export function workIndexGraph(): Node[] {
  const url = `${SITE_URL}/work`;
  const collection: Node = {
    '@type': 'CollectionPage',
    '@id': `${url}#webpage`,
    url,
    name: 'Client work',
    description:
      'Production websites and automation systems SheetFlow has built and deployed, with the architecture and engineering decisions behind each.',
    isPartOf: { '@id': SITE_ID },
    about: { '@id': ORG_ID },
    inLanguage: 'en',
    hasPart: projects.map((p) => ({ '@id': `${SITE_URL}/work/${p.slug}#project` })),
  };
  return [
    organizationNode,
    websiteNode,
    collection,
    breadcrumbNode(url, [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Work', url },
    ]),
  ];
}

/**
 * `/work/[slug]` — CreativeWork + WebPage + BreadcrumbList + the page's FAQs.
 *
 * ## Why the project is a `CreativeWork` and not a `WebSite`
 *
 * The page already carries SheetFlow's own `WebSite` node, pinned to
 * `SITE_ID`; a second one would hand Google a choice of site names.
 * `CreativeWork` carries what matters without the collision: `creator` is
 * SheetFlow and `mainEntityOfPage` is the case study.
 *
 * ## What an anonymized build may not emit (D39)
 *
 * A `confidential` project names no business and links nothing, so its node
 * carries **no `url`** (that would be the client's deployment) and **no
 * `about: Organization`** (that would name, or invent, the client). Its name
 * says what kind of work it is ("client build" or "demonstration build"), so
 * the distinction survives a machine that never renders the page. `image`
 * appears only when a redacted frame exists.
 *
 * ## Internal builds emit a deliberately smaller node
 *
 * No deployment, no client organisation, no screenshot: `url`, `about` and
 * `image` are omitted rather than filled with a substitute, and the name is
 * the system's own.
 */
export function workProjectGraph(project: WorkProject): Node[] {
  const url = `${SITE_URL}/work/${project.slug}`;
  // Narrowed inline rather than through an alias: an alias does not carry the
  // discriminant to the property accesses below.
  const shotUrl =
    project.evidence.kind === 'confidential' && project.evidence.shot
      ? `${SITE_URL}${project.evidence.shot.src}`
      : undefined;

  const projectNode: Node = {
    '@type': 'CreativeWork',
    '@id': `${url}#project`,
    name:
      project.evidence.kind === 'confidential'
        ? `${project.client} — ${project.evidence.origin === 'demonstration' ? 'demonstration build' : 'client build'}`
        : project.client,
    description: project.metaDescription,
    inLanguage: 'en',
    creator: { '@id': ORG_ID },
    mainEntityOfPage: { '@id': `${url}#webpage` },
    ...(shotUrl ? { image: shotUrl } : {}),
  };
  const webPage: Node = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: project.metaTitle,
    description: project.metaDescription,
    isPartOf: { '@id': SITE_ID },
    about: { '@id': `${url}#project` },
    ...(shotUrl ? { primaryImageOfPage: shotUrl } : {}),
    inLanguage: 'en',
  };
  return [
    organizationNode,
    websiteNode,
    projectNode,
    webPage,
    breadcrumbNode(url, [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Work', url: `${SITE_URL}/work` },
      { name: project.shortLabel, url },
    ]),
    faqNode(url, project.faqs),
  ];
}

/** `/services/[slug]` — Service + WebPage + BreadcrumbList + the page's FAQs. */
export function serviceGraph(service: ServicePage): Node[] {
  const url = `${SITE_URL}/services/${service.slug}`;
  const serviceNode: Node = {
    '@type': 'Service',
    '@id': `${url}#service`,
    name: service.name,
    serviceType: service.serviceType,
    description: service.metaDescription,
    url,
    provider: { '@id': ORG_ID },
    // The audience the homepage already names. Stated rather than left to be
    // inferred from prose, for the same reason knowsAbout is.
    areaServed: { '@type': 'Country', name: 'Worldwide' },
    audience: {
      '@type': 'BusinessAudience',
      name: 'Small and mid-sized service businesses',
    },
  };
  const webPage: Node = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: service.metaTitle,
    description: service.metaDescription,
    isPartOf: { '@id': SITE_ID },
    about: { '@id': `${url}#service` },
    inLanguage: 'en',
  };
  return [
    organizationNode,
    websiteNode,
    serviceNode,
    webPage,
    breadcrumbNode(url, [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Services', url: `${SITE_URL}/services` },
      { name: service.shortLabel, url },
    ]),
    faqNode(`${url}`, service.faqs),
  ];
}
