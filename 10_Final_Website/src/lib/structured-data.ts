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
import { BOOKING_URL, WHATSAPP_NUMBER } from '@/lib/contact';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sheetflow.ai';

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
    'https://github.com/sheetflow51-prog',
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
