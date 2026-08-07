/**
 * Case studies — the content source for `/work` and `/work/[slug]`.
 *
 * ## The permission this file operates under
 *
 * The founder granted publication permission on 2026-08-07 with an explicit
 * boundary, recorded verbatim in `DECISIONS.md` (D24):
 *
 * > You may use company names, screenshots, project links, architecture
 * > diagrams and implementation details. Do NOT fabricate: revenue, conversion
 * > improvements, ROI, customer metrics, testimonials, timelines. If measurable
 * > business outcomes are unavailable, clearly label them as
 * > "Not publicly disclosed."
 *
 * That boundary is enforced by the `ProjectOutcome` union below rather than by
 * reviewer discipline, in the same spirit as `content/proof.ts`: the
 * `not-disclosed` variant **has no field a number can be typed into**. Writing
 * a metric for a project without a `Verification` is a type error, not a code
 * review finding.
 *
 * ## The evidence rule
 *
 * Every technical statement in this file was read off the live deployment on
 * 2026-08-07 and is independently checkable by opening `liveUrl` and viewing
 * source. Nothing here is inferred from what a build of this kind "would"
 * contain. Where a detail could not be observed, it is absent rather than
 * assumed.
 *
 * Specifically **not** present, because none of it could be verified:
 * engagement dates, delivery timelines, contract values, traffic, enquiry
 * volumes, conversion rates, or any before/after comparison.
 *
 * ## Elevate WPC
 *
 * Named by the founder as a fourth project. It has **no verifiable artifact** —
 * absent from the Vercel account (5 projects; it is not among them), no
 * resolving domain under any tested spelling, and nothing in the workspace.
 * A case study describing its architecture would be invention of exactly the
 * kind the permission above forbids, so it is not listed. Adding it is a
 * data-only change once a URL or repository exists: append an entry here.
 */

import type { Verification } from '@/content/proof';

/* ------------------------------------------------------------------ */
/* Outcome                                                             */
/* ------------------------------------------------------------------ */

/**
 * A published business outcome, or the explicit absence of one.
 *
 * `measured` requires a full `Verification` — the same record `content/proof.ts`
 * demands — so a number cannot appear without the method that produced it and
 * the date it was confirmed with the client.
 *
 * `not-disclosed` is the honest default and carries no metric field. The UI
 * renders the label below; there is no code path that renders a figure for it.
 */
export type ProjectOutcome =
  | {
      disclosure: 'measured';
      /** Headline figure, e.g. "+38%". Must be covered by `verification`. */
      metric: string;
      /** What it measures, including the window. */
      metricLabel: string;
      verification: Verification;
    }
  | { disclosure: 'not-disclosed' };

/** The single string every undisclosed outcome renders. Asserted by test. */
export const NOT_DISCLOSED_LABEL = 'Not publicly disclosed.';

/* ------------------------------------------------------------------ */
/* Project shape                                                       */
/* ------------------------------------------------------------------ */

export interface BuildFact {
  /** Short label, e.g. "Framework". */
  label: string;
  /** Observed value, e.g. "React (SPA)". */
  value: string;
}

export interface ArchitectureStage {
  /** Stage name in the data flow, e.g. "Capture". */
  stage: string;
  /** What happens here, in one sentence. */
  detail: string;
  /** The concrete surfaces involved, as observed. */
  nodes: string[];
}

export interface EngineeringDecision {
  /** The decision, phrased as what was chosen. */
  title: string;
  /** Why — the constraint that made it the right call. */
  rationale: string;
  /** How a reader can confirm it on the live site. */
  evidence: string;
}

export interface WorkFaq {
  id: string;
  question: string;
  answer: string;
}

export interface WorkProject {
  /** URL segment and breadcrumb identity. */
  slug: string;
  /** Client name, published under the permission recorded above. */
  client: string;
  /** Sector label. */
  sector: string;
  /** City/region, as stated on the client's own site. */
  location: string;
  /** Short crumb/card label where `client` is too long. */
  shortLabel: string;

  metaTitle: string;
  metaDescription: string;

  kicker: string;
  /** The page's single H1. */
  headline: string;
  lede: string;

  /** The deployment this case study describes. Must return HTTP 200. */
  liveUrl: string;

  /** Screenshot of the live build, under `public/work/`. */
  shot: { src: string; width: number; height: number; alt: string };

  /** What the build had to solve, observable from the finished site. */
  brief: string[];

  /** Data flow, as implemented. */
  architecture: ArchitectureStage[];

  /** Observed stack facts. Every row checkable by viewing source. */
  build: BuildFact[];

  /** Notable implementation choices, each with how to verify it. */
  decisions: EngineeringDecision[];

  /** Business outcome, or its explicit absence. */
  outcome: ProjectOutcome;

  faqs: WorkFaq[];

  /** Sibling slugs, for internal linking. */
  related: string[];

  /** SheetFlow service slugs this project exercises. Must exist in services.ts. */
  services: string[];
}

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export const projects: WorkProject[] = [
  {
    slug: 'saraswati-dental-clinic',
    client: 'Saraswati Dental Clinic',
    sector: 'Dental practice',
    location: 'Etmadpur, Agra',
    shortLabel: 'Saraswati Dental',
    metaTitle: 'Saraswati Dental Clinic — clinic site with a validated booking intake',
    metaDescription:
      'A treatment-led clinic site for Saraswati Dental, Agra: a validated appointment form with spam trapping and consent, WhatsApp hand-off with pre-filled intent, and a Dentist entity graph.',
    kicker: 'Dental practice · Agra',
    headline: 'A clinic site that takes the booking, not just the call.',
    lede: 'Saraswati Dental needed the enquiry captured before the visitor left the page — and routed somewhere a busy practice actually reads. The build pairs a validated intake form with a WhatsApp hand-off that arrives already knowing what the patient asked for.',
    liveUrl: 'https://saraswati-dental-clinic.vercel.app',
    shot: {
      src: '/work/saraswati-dental-clinic.jpg',
      width: 1280,
      height: 800,
      alt: 'Saraswati Dental Clinic homepage — an editorial hero reading “Your Smile, Our Masterpiece.” above a Hindi subhead, with the clinician’s name and registration number.',
    },
    brief: [
      'Enquiries arrived by phone during treatment hours, when nobody could answer.',
      'A dental audience searches by treatment — implants, root canal, orthodontics — not by clinic name.',
      'The practice serves a bilingual catchment, so the page had to set Devanagari as competently as Latin.',
    ],
    architecture: [
      {
        stage: 'Capture',
        detail:
          'A structured intake sits in the page rather than behind a mailto link, so the enquiry is typed while intent is highest.',
        nodes: ['Appointment form', 'Treatment selector', 'Preferred date'],
      },
      {
        stage: 'Qualify',
        detail:
          'The form validates an Indian mobile number and requires an explicit consent tick before it will submit, so what leaves the page is reachable and permissioned.',
        nodes: ['Mobile-number pattern', 'Consent checkbox', 'Honeypot spam trap'],
      },
      {
        stage: 'Route',
        detail:
          'Click-to-chat links carry an intent-specific pre-filled message, so the thread opens with the reason for contact already written.',
        nodes: ['WhatsApp hand-off', 'Direct dial', 'Maps directions'],
      },
      {
        stage: 'Be found',
        detail:
          'A Dentist entity graph publishes the practice, its hours, its coordinates and its treatment questions in a form search engines and assistants read directly.',
        nodes: ['Dentist', 'FAQPage', 'OpeningHoursSpecification', 'GeoCoordinates'],
      },
    ],
    build: [
      { label: 'Delivery', value: 'Static HTML, single document' },
      { label: 'Hosting', value: 'Vercel edge CDN' },
      { label: 'Motion', value: 'GSAP 3.12.5 + ScrollTrigger' },
      { label: 'Typefaces', value: 'Playfair Display, Cormorant Garamond, Inter, Noto Sans Devanagari' },
      { label: 'Structured data', value: 'Dentist, FAQPage, AggregateRating, OpeningHoursSpecification, GeoCoordinates, PostalAddress' },
      { label: 'Contact channels', value: 'In-page form, WhatsApp click-to-chat, direct dial, Maps directions' },
    ],
    decisions: [
      {
        title: 'The phone field validates the format the practice can actually ring',
        rationale:
          'A booking with an unreachable number is not a booking. The field constrains input to a valid Indian mobile — ten digits opening 6–9, with an optional country code — and explains the rule in place instead of failing silently after submission.',
        evidence:
          'View source on the booking form: the phone input carries a pattern attribute, a numeric inputmode, and its own error message element.',
      },
      {
        title: 'A honeypot, not a CAPTCHA',
        rationale:
          'A public clinic form attracts bot submissions, and a CAPTCHA taxes every real patient to stop them. An off-screen field that humans never see and scripts routinely fill costs the patient nothing and drops the automated traffic.',
        evidence:
          'The form contains a visually hidden, aria-hidden field with tabindex -1 and autocomplete off, labelled to be ignored.',
      },
      {
        title: 'Consent is a gate, not a footnote',
        rationale:
          'The practice contacts patients on WhatsApp afterwards. Making the tick a submission requirement means every record it holds was volunteered on the record, rather than assumed from a pre-checked box.',
        evidence: 'The consent checkbox is required; the form will not submit without it.',
      },
      {
        title: 'Devanagari is loaded as a first-class face',
        rationale:
          'Serving Hindi through a fallback renders it visibly worse than the English beside it. Noto Sans Devanagari ships alongside the Latin faces so both scripts are set deliberately.',
        evidence: 'The Google Fonts request includes Noto Sans Devanagari with the Latin families.',
      },
    ],
    outcome: { disclosure: 'not-disclosed' },
    faqs: [
      {
        id: 'saraswati-what-was-built',
        question: 'What did SheetFlow build for Saraswati Dental Clinic?',
        answer:
          'A treatment-led clinic website with an in-page appointment intake, WhatsApp click-to-chat hand-off carrying a pre-filled message, direct dial and map directions, and a structured-data entity graph describing the practice, its opening hours and its treatment questions. The site is live at saraswati-dental-clinic.vercel.app.',
      },
      {
        id: 'saraswati-booking-flow',
        question: 'How does the appointment booking work on the Saraswati Dental site?',
        answer:
          'A visitor selects a treatment, gives a name and mobile number, optionally picks a preferred date, and ticks a consent box. The number is validated against Indian mobile format before submission, and a hidden honeypot field drops automated submissions. Visitors who prefer to message instead get a WhatsApp link that opens with the reason for contact already written.',
      },
      {
        id: 'saraswati-results',
        question: 'What business results did the Saraswati Dental project produce?',
        answer:
          'Not publicly disclosed. SheetFlow publishes outcome figures only once they have been measured against a stated method and confirmed with the client in writing. No such measurement has been published for this project, so no figure is claimed.',
      },
    ],
    related: ['sparc-physiotherapy', 'r3s-realty'],
    services: ['appointment-booking', 'whatsapp-automation', 'lead-capture'],
  },

  {
    slug: 'sparc-physiotherapy',
    client: 'SPARC Physiotherapy Centre',
    sector: 'Physiotherapy clinic',
    location: 'Nagasandra, Bengaluru',
    shortLabel: 'SPARC Physiotherapy',
    metaTitle: 'SPARC Physiotherapy — a rehab clinic site that books into WhatsApp',
    metaDescription:
      'A neuro and orthopaedic rehab site for SPARC Physiotherapy, Bengaluru: a nine-service intake that submits straight into WhatsApp, an accessible live status region, and a verifiable credential graph.',
    kicker: 'Physiotherapy · Bengaluru',
    headline: 'Rehab is chosen on credentials. So the site publishes them.',
    lede: 'Someone choosing a neuro-rehab clinician checks qualifications before price. SPARC needed those credentials stated where both a patient and a search engine could verify them — and an intake that reaches the clinic on the channel it already answers.',
    liveUrl: 'https://sparc-physiotherapy.vercel.app',
    shot: {
      src: '/work/sparc-physiotherapy.jpg',
      width: 1280,
      height: 800,
      alt: 'SPARC Physiotherapy Centre homepage — hero reading “Repair. Regain. Restore.”',
    },
    brief: [
      'Nine distinct rehab programmes, from paediatric to cardio-pulmonary, each with a different patient.',
      'Clinical credentials are the deciding factor and were not stated anywhere machine-readable.',
      'The clinic answers WhatsApp reliably and email rarely, so the intake had to land there.',
    ],
    architecture: [
      {
        stage: 'Capture',
        detail:
          'One intake covers all nine programmes, so a patient self-selects their pathway instead of the clinic triaging a generic message.',
        nodes: ['Booking form', '9 programme options', 'Free-text condition note'],
      },
      {
        stage: 'Route',
        detail:
          'Submission composes the request and opens WhatsApp directly, which is stated on the form so the visitor is not surprised by the channel switch.',
        nodes: ['WhatsApp hand-off', 'Direct dial'],
      },
      {
        stage: 'Confirm',
        detail:
          'Validation runs in the page and reports through a live region, so the outcome is announced rather than only shown.',
        nodes: ['Custom validation', 'ARIA status region'],
      },
      {
        stage: 'Be found',
        detail:
          'The clinician, the qualification, the awarding institution and the professional registration are published as linked entities, alongside the nine programmes as an item list.',
        nodes: ['MedicalBusiness', 'Person', 'EducationalOccupationalCredential', 'ItemList', 'FAQPage'],
      },
    ],
    build: [
      { label: 'Delivery', value: 'Static HTML, single document' },
      { label: 'Hosting', value: 'Vercel edge CDN' },
      { label: 'Icons', value: 'Inline SVG sprite, referenced by <use> — no icon requests' },
      { label: 'Typefaces', value: 'Fraunces, Manrope' },
      { label: 'Structured data', value: 'MedicalBusiness, Person, EducationalOccupationalCredential, CollegeOrUniversity, ItemList, AggregateRating, FAQPage' },
      { label: 'Contact channels', value: 'Form-to-WhatsApp, direct dial, Maps embed, Instagram' },
    ],
    decisions: [
      {
        title: 'The form submits into WhatsApp, and says so before you fill it',
        rationale:
          'The clinic answers WhatsApp and not email, so a form that sent email would have captured requests nobody read. Routing the intake to the channel the clinic actually monitors is worth more than owning the submission — and telling the visitor up front means the app switch is expected rather than jarring.',
        evidence:
          'The hint above the form reads that the request opens in WhatsApp, straight to the clinic.',
      },
      {
        title: 'Credentials modelled as entities, not adjectives',
        rationale:
          '“Award-winning” is unverifiable and search engines treat it as such. A qualification linked to the institution that granted it, plus a professional registration number, is a checkable claim — which is what a patient comparing clinicians is looking for.',
        evidence:
          'The structured data includes an EducationalOccupationalCredential linked to a CollegeOrUniversity, and the registration is stated in the credentials section.',
      },
      {
        title: 'Validation is custom, and its result is announced',
        rationale:
          'Native validation bubbles are inconsistent across browsers and invisible to screen readers once dismissed. Turning them off and reporting into an ARIA live region means the same message reaches a sighted user and a screen-reader user.',
        evidence:
          'The form carries novalidate, and its status paragraph is marked role="status".',
      },
      {
        title: 'Icons inline as one sprite',
        rationale:
          'A rehab site needs a large icon set for nine programmes. Inlining them as a single referenced sprite removes an entire class of network request and eliminates the icon-swap flash on first paint.',
        evidence: 'Icons are <use> references to symbol ids defined once in the document.',
      },
    ],
    outcome: { disclosure: 'not-disclosed' },
    faqs: [
      {
        id: 'sparc-what-was-built',
        question: 'What did SheetFlow build for SPARC Physiotherapy Centre?',
        answer:
          'A rehabilitation clinic website covering nine treatment programmes, with a booking intake that submits directly into WhatsApp, accessible custom form validation, an inline SVG icon system, and a structured-data graph publishing the clinician, their qualification, the awarding institution and their professional registration. The site is live at sparc-physiotherapy.vercel.app.',
      },
      {
        id: 'sparc-booking-flow',
        question: 'How does the SPARC Physiotherapy booking form work?',
        answer:
          'The patient gives a name and phone number, selects one of nine programmes — neuro rehabilitation, orthopaedic, sports injury, post-operative, paediatric, geriatric, antenatal and postnatal, cardio-pulmonary, or a home visit — and can add a note describing their condition. Submitting composes the request and opens WhatsApp to the clinic, which the form states before it is filled in.',
      },
      {
        id: 'sparc-results',
        question: 'What business results did the SPARC Physiotherapy project produce?',
        answer:
          'Not publicly disclosed. SheetFlow publishes outcome figures only once they have been measured against a stated method and confirmed with the client in writing. No such measurement has been published for this project, so no figure is claimed.',
      },
    ],
    related: ['saraswati-dental-clinic', 'r3s-realty'],
    services: ['appointment-booking', 'whatsapp-automation'],
  },

  {
    slug: 'r3s-realty',
    client: 'R³S Realty & Developers',
    sector: 'Real estate developer',
    location: 'Etmadpur, Agra — NH-19 corridor',
    shortLabel: 'R³S Realty',
    metaTitle: 'R³S Realty — a plot-discovery site built for local property search',
    metaDescription:
      'A property discovery site for R³S Realty on the NH-19 corridor near Agra: a code-split React application, a RealEstateAgent and Product entity graph with priced inventory, and WhatsApp enquiry routing.',
    kicker: 'Real estate · Agra',
    headline: 'Land is searched for by place. The site was built to be found by it.',
    lede: 'Plot buyers search corridors and landmarks, not developer names. R³S needed a site that answered locality queries directly, published its inventory in a form search engines can read, and moved an interested buyer to WhatsApp in one tap.',
    liveUrl: 'https://r3s-realty-agra.vercel.app',
    shot: {
      src: '/work/r3s-realty.jpg',
      width: 1280,
      height: 800,
      alt: 'R³S Realty homepage — a hero reading “Where roots meet rising horizons.” over a plotted development road, with residential plots on NH-19 starting at ₹8.99L.',
    },
    brief: [
      'Buyers search by locality and highway, so the page had to target places rather than the brand.',
      'Title clarity is the first objection in a plot purchase and had to be answered before contact.',
      'Enquiries needed to reach the developer directly, without a form sitting in an unread inbox.',
    ],
    architecture: [
      {
        stage: 'Be found',
        detail:
          'Locality and corridor terms are targeted explicitly, and an India-scoped language alternate keeps the page pointed at its actual market.',
        nodes: ['Locality targeting', 'hreflang en-IN', 'Search Console verification'],
      },
      {
        stage: 'Answer',
        detail:
          'The five questions a plot buyer asks first — titles, price, location, distance, amenities — are published as structured questions rather than buried in prose.',
        nodes: ['FAQPage', '5 Q&A'],
      },
      {
        stage: 'Publish inventory',
        detail:
          'The project is modelled as a product with a priced offer and availability, so listings are machine-readable rather than image text.',
        nodes: ['Product', 'Offer', 'RealEstateAgent', 'LocalBusiness'],
      },
      {
        stage: 'Route',
        detail:
          'An interested buyer moves to WhatsApp in one tap, which is how this market transacts.',
        nodes: ['WhatsApp click-to-chat', 'Direct dial'],
      },
    ],
    build: [
      { label: 'Framework', value: 'React, single-page application' },
      { label: 'Bundler', value: 'Vite with the Rolldown runtime' },
      { label: 'Hosting', value: 'Vercel edge CDN' },
      { label: 'Code splitting', value: 'Four chunks — app, vendor, motion, charts — plus a separate stylesheet' },
      { label: 'Typefaces', value: 'DM Serif Display, Cormorant Garamond, DM Sans' },
      { label: 'Structured data', value: 'RealEstateAgent, LocalBusiness, Product + Offer, FAQPage, PostalAddress, GeoCoordinates' },
      { label: 'Installability', value: 'Web app manifest, SVG favicon, theme colour' },
    ],
    decisions: [
      {
        title: 'The route bundle is split by concern, not shipped as one file',
        rationale:
          'Charting and motion are the two heaviest dependencies in this build. Splitting them into their own chunks lets the browser cache them independently of application code, so a content change does not invalidate the vendor payload.',
        evidence:
          'The document module-preloads four separate chunks — application, vendor, motion and charts — alongside a small runtime.',
      },
      {
        title: 'Inventory published as a priced Offer',
        rationale:
          'A price rendered inside a hero image is invisible to every consumer that is not a human eye. Modelling the project as a Product with a currency-denominated Offer and an availability state makes the listing readable by search engines and assistants.',
        evidence:
          'The JSON-LD graph contains a Product node whose offers carry priceCurrency, price and availability.',
      },
      {
        title: 'The entity is typed twice, deliberately',
        rationale:
          'RealEstateAgent describes what the business does; LocalBusiness carries the address and opening hours that local search reads. Publishing both, with a shared address, satisfies both consumers without either claim being untrue.',
        evidence:
          'The graph contains both a RealEstateAgent and a LocalBusiness node for the same organisation.',
      },
      {
        title: 'Search Console verified at build time',
        rationale:
          'A property site lives or dies on local search. Shipping the verification token in the document means indexing coverage is observable from day one rather than after someone remembers to connect it.',
        evidence: 'A google-site-verification meta tag is present in the head.',
      },
    ],
    outcome: { disclosure: 'not-disclosed' },
    faqs: [
      {
        id: 'r3s-what-was-built',
        question: 'What did SheetFlow build for R³S Realty & Developers?',
        answer:
          'A property discovery website for plots and highway shops on the NH-19 corridor near Agra, built as a code-split React application. It publishes the developer, the project inventory as a priced offer, and the five questions plot buyers ask most as structured data, and routes enquiries to WhatsApp and direct dial. The site is live at r3s-realty-agra.vercel.app.',
      },
      {
        id: 'r3s-seo-approach',
        question: 'How was the R³S Realty site built to be found in local search?',
        answer:
          'Locality and corridor terms are targeted directly rather than the developer brand, an India-scoped language alternate keeps the page aimed at its market, the business is published as both a RealEstateAgent and a LocalBusiness with a full postal address and coordinates, inventory is modelled as a Product with a priced Offer, and the five most common buyer questions ship as a FAQPage.',
      },
      {
        id: 'r3s-results',
        question: 'What business results did the R³S Realty project produce?',
        answer:
          'Not publicly disclosed. SheetFlow publishes outcome figures only once they have been measured against a stated method and confirmed with the client in writing. No such measurement has been published for this project, so no figure is claimed.',
      },
    ],
    related: ['saraswati-dental-clinic', 'sparc-physiotherapy'],
    services: ['lead-capture', 'whatsapp-automation'],
  },
];

/* ------------------------------------------------------------------ */
/* Selectors                                                           */
/* ------------------------------------------------------------------ */

export function getProject(slug: string): WorkProject | undefined {
  return projects.find((p) => p.slug === slug);
}

export function relatedProjects(project: WorkProject): WorkProject[] {
  return project.related
    .map(getProject)
    .filter((p): p is WorkProject => p !== undefined);
}
