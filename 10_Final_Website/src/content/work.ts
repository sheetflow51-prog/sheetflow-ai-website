/**
 * Case studies — the content source for `/work` and `/work/[slug]`.
 *
 * ## The decision this file operates under (D39)
 *
 * An earlier permission (D24) allowed client names, screenshots and project
 * links. The founder's decision recorded as D39 withdraws all of it: **every
 * client identity is removed from the site.** No business name, person name,
 * registration number, phone number, address, identifying locality, client
 * domain, tagline or brand monogram appears anywhere in this file — in code or
 * in comments. Client engagements are published as industry archetypes: the
 * system and the problem it solves, never whose business it runs.
 *
 * What D24 forbade, D39 still forbids:
 *
 * > Do NOT fabricate: revenue, conversion improvements, ROI, customer metrics,
 * > testimonials, timelines. If measurable business outcomes are unavailable,
 * > clearly label them as "Not publicly disclosed."
 *
 * That boundary is enforced by the `ProjectOutcome` union below rather than by
 * reviewer discipline, in the same spirit as `content/proof.ts`: the
 * `not-disclosed` variant **has no field a number can be typed into**. Writing
 * a metric for a project without a `Verification` is a type error, not a code
 * review finding.
 *
 * ## The evidence rule
 *
 * Every technical statement about a client or demonstration build was read off
 * its production deployment on 2026-08-07/08, or from source where the source
 * is ours; every statement about an internal build was read from the code and
 * outputs on disk. Nothing here is inferred from what a build of this kind
 * "would" contain. Where a detail could not be observed, it is absent rather
 * than assumed.
 *
 * Anonymisation changes who can check, not what was checked. A reader can no
 * longer open the deployment, so each decision's `evidence` states what was
 * inspected and when, rather than inviting the reader to inspect it.
 *
 * Specifically **not** present, because none of it could be verified:
 * engagement dates, delivery timelines, contract values, traffic, enquiry
 * volumes, conversion rates, or any before/after comparison.
 *
 * ## Two kinds of evidence, and why the type separates them
 *
 * Phase Y's forensic audit surfaced substantial systems that are **real, but
 * not reachable** — a double-entry accounting engine, a CNC production
 * pipeline, an outbound engine. They became the `internal` variant, which
 * **has no field a URL can be typed into** and carries an `artifacts` ledger of
 * what was inspected instead.
 *
 * D39 then took the URL away from client and demonstration work too, for a
 * different reason: a link to a client deployment *is* the client's identity,
 * and so is an unredacted screenshot of it. The former `live` and `demo`
 * variants collapsed into one `confidential` variant which, like `internal`,
 * has no URL field at all:
 *
 *   - `confidential` carries an `origin` (client or demonstration), a mandatory
 *     `disclosure` sentence, and an optional redacted `shot`.
 *   - `internal` carries an `artifacts` ledger, and renders no screenshot.
 *
 * Nothing on `/work` links out to any project. That is held by the type, not by
 * whoever edits this file next — the same technique as `ProjectOutcome` below,
 * applied to identity rather than to metrics.
 *
 * ## Why old slugs redirect to `/work`, not to their new slug
 *
 * Every slug that used to carry a client's name now redirects to the `/work`
 * index. An old→new mapping would be a public lookup table from each client's
 * name to its archetype, and would undo the anonymisation for anyone holding an
 * old link. The redirect map lives with the routing, not here.
 *
 * ## Excluded builds
 *
 * One further build stays excluded: authorship unverified (D27).
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
/* Evidence                                                            */
/* ------------------------------------------------------------------ */

/**
 * A captured frame of a running deployment, stored under `public/work/`.
 * Every identifying detail — name, wordmark, contact line, headline where it
 * named the business — is redacted before a frame is stored (D39).
 */
export interface ProjectShot {
  src: string;
  width: number;
  height: number;
  alt: string;
}

/**
 * One inspectable artifact behind an internal build.
 *
 * This is what replaces "click the link and check" for work a visitor cannot
 * open. It is deliberately specific — a filename and a line count, a named
 * output, a test count — because a vague claim about unreachable work is
 * exactly the kind of thing that cannot be challenged, and therefore should
 * not be made.
 */
export interface InternalArtifact {
  /** The artifact, named as it exists on disk. */
  name: string;
  /** What it contains, stated so it could be contradicted if wrong. */
  detail: string;
}

/**
 * On what basis this project is published, and what of it can be shown.
 *
 * Neither variant carries **a URL field of any kind**. `internal` has nothing
 * to open; `confidential` has something to open that would name the client.
 * Either way `/work` links out to nothing, and the guarantee is held by the
 * type rather than by whoever edits this file next.
 *
 * ## Why `origin` exists, and why it is not a separate variant
 *
 * D32 separated commissioned client work from SheetFlow's own uncommissioned
 * demonstration builds: presenting a demonstration as a client engagement
 * asserts a commercial relationship that does not exist. Before D39 that took
 * two variants, because the client one emitted an organisation node naming the
 * business and a demonstration had to be structurally unable to. D39 removed
 * the name, so the structural difference went with it — but the provenance
 * claim did not, and it still has to be stated honestly.
 *
 * `origin` carries it, and selects which label renders —
 * `CONFIDENTIAL_CLIENT_LABEL` or `DEMO_BUILD_LABEL` — so a demonstration
 * cannot be labelled as commissioned by forgetting to check a flag.
 *
 * The cases are therefore: `confidential` + `client` (commissioned, unnamed),
 * `confidential` + `demonstration` (ours, uncommissioned, unnamed), and
 * `internal` (ours, nothing to open).
 */
export type ProjectEvidence =
  | {
      kind: 'confidential';
      /** Commissioned by a client, or SheetFlow's own uncommissioned demonstration build. D32's distinction survives anonymization. */
      origin: 'client' | 'demonstration';
      /** Why the business is unnamed and nothing is linked, in the page's own voice. Required: there is no way to add one without writing it. */
      disclosure: string;
      /** A redacted screenshot. Omitted where no frame could be redacted honestly. */
      shot?: ProjectShot;
    }
  | {
      kind: 'internal';
      /** Why there is nothing to open, in the page's own voice. */
      reason: string;
      /**
       * What was inspected to write this case study — **at least one**.
       *
       * A non-empty tuple rather than an array, for the same reason `disclosure`
       * is a mandatory string on a confidential build: a case study about work nobody
       * can open earns its place only by being specific, and an internal build
       * with an empty ledger would be a page asserting engineering with nothing
       * behind it. The type refuses it rather than a reviewer having to notice.
       *
       * It also removes a live crash. Since RC2 the `/work` tile renders
       * `artifacts[0].name` directly, and `noUncheckedIndexedAccess` is off in
       * this project — so an empty array would type-check and then throw at
       * render. Now it cannot be written.
       */
      artifacts: [InternalArtifact, ...InternalArtifact[]];
    };

/** The single string every internal build renders in place of a live link. */
export const INTERNAL_ONLY_LABEL = 'Internal build — no public deployment.';

/** The single string every demonstration build renders. Asserted by test. */
export const DEMO_BUILD_LABEL = 'Demonstration build — not a commissioned engagement.';

/** The single string every confidential client build renders (D39). */
export const CONFIDENTIAL_CLIENT_LABEL = 'Client build — the business is not named and the deployment is not linked.';

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
  /**
   * A shorter label for the compact `WorkflowGlyph` nodes, where the full
   * `stage` name does not fit under a 44px icon.
   *
   * Set this **only** when `stage` is more than one short word. It is a
   * truncation of an already-published label, never a different claim: the full
   * `stage` string remains the source of truth and still renders in the
   * architecture detail cards directly below the glyph. `WorkflowGlyph` falls
   * back to `stage` when this is absent, so an omission degrades to a long
   * label rather than to a wrong one.
   */
  short?: string;
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
  /** What was inspected to establish it, and when — a reader can no longer open the deployment (D39). */
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
  /**
   * The archetype name for a confidential build ("Healthcare & Clinical
   * Operations Engine"), or the system's own name where the build is
   * SheetFlow's (`evidence.kind === 'internal'`). Never a third party's name —
   * client or otherwise (D39).
   */
  client: string;
  /** Sector label. */
  sector: string;
  /** A non-identifying context ("Dental practice, India"), never a locality that identifies a client. */
  location: string;
  /** Short crumb/card label where `client` is too long. */
  shortLabel: string;

  metaTitle: string;
  metaDescription: string;

  kicker: string;
  /** The page's single H1. */
  headline: string;
  lede: string;

  /** On what basis this is published, and the proof behind it. */
  evidence: ProjectEvidence;

  /** What the build had to solve, observable from the finished artifact. */
  brief: string[];

  /** Data flow, as implemented. */
  architecture: ArchitectureStage[];

  /** Observed stack facts. Every row read from the deployment or its source. */
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

/**
 * Array order is the render order of `/work`, and it is grouped by evidence
 * kind: **client (3) → demonstration (2) → internal (5).**
 *
 * This is not alphabetical or chronological, and it is not arbitrary.
 *
 * Two things go wrong when it drifts. The first is editorial: the `/work` lede
 * introduces the kinds in exactly this order, so a grid in a different order
 * contradicts the sentence directly above it. The second is visual, and it is
 * how the problem was first found — during the RC1 screenshot pass the
 * demonstrations sat last, which split the image-bearing cards around a run of
 * text-only tiles. The rhythm broke in the middle and the strongest imagery
 * landed where fewest people would scroll to it.
 *
 * Under D39 two of the five confidential builds carry a redacted screenshot
 * and three carry none, because no frame of them could be redacted honestly.
 * The grid is no longer pictures-then-text, but keeping the confidential work
 * together still keeps every screenshot in the first half of the page.
 *
 * If you add a project, insert it in its kind's group rather than appending.
 */
export const projects: WorkProject[] = [
  {
    slug: 'healthcare-clinical-operations-engine',
    client: 'Healthcare & Clinical Operations Engine',
    sector: 'Healthcare · dental practice',
    location: 'India',
    shortLabel: 'Clinical Operations',
    metaTitle: 'Healthcare & Clinical Operations Engine — treatment-led intake and a tracked follow-up pipeline',
    metaDescription:
      'A client build for a dental practice: treatment-led intake through a validated appointment form with spam trapping and consent, WhatsApp hand-off with pre-filled intent, a CRM pipeline from first enquiry to treated, and a Dentist entity graph.',
    kicker: 'Healthcare · Client build',
    headline: 'A clinic site that takes the booking, not just the call.',
    lede: 'A busy dental practice needed the enquiry captured before the visitor left the page — tagged with the treatment the patient chose, and routed somewhere the practice actually reads. The build pairs a validated intake form with a WhatsApp hand-off that arrives already knowing what the patient asked for, and a dashboard that lays out the follow-up pipeline from first enquiry to treated.',
    evidence: {
      kind: 'confidential',
      origin: 'client',
      disclosure:
        'A client build. At SheetFlow’s decision the practice is not named and the deployment is not linked. The screenshot is the engagement’s CRM dashboard with its header redacted, and it runs on seeded demonstration data — invented patient names, placeholder numbers and sequential record IDs — so no real patient appears in it. That is deliberate: the dashboard is reachable without a login, so real patient records on it would be a data-protection exposure rather than a better demo. Read it as a working surface, not as a real pipeline.',
      shot: {
        src: '/work/healthcare-operations-dashboard.jpg',
        width: 1280,
        height: 800,
        alt: 'Clinical operations CRM dashboard, practice name redacted — four summary tiles for total leads, this month, converted (treated) and pending follow-up, above a bar chart of the lead pipeline by status, a pie chart of leads by source, and the start of the kanban pipeline.',
      },
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
          'A structured, treatment-led intake sits in the page rather than behind a mailto link, so the enquiry is typed — and tagged with the treatment the patient chose — while intent is highest.',
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
        stage: 'Track',
        // Status names (NEW … TREATED … CLOSED) and the "converted (treated)" tile are read off the
        // committed dashboard frames, not inferred.
        detail:
          'A separate dashboard turns captured enquiries into a worked pipeline — four summary tiles, two charts, and a kanban running the six statuses from new enquiry through treated and follow-up to closed.',
        nodes: ['Summary tiles', 'Pipeline by status', 'Leads by source', 'Kanban board'],
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
      { label: 'Motion', value: 'GSAP with ScrollTrigger' },
      { label: 'Typefaces', value: 'Serif display faces, a sans body face, and a Devanagari face' },
      { label: 'Structured data', value: 'Dentist, FAQPage, AggregateRating, OpeningHoursSpecification, GeoCoordinates, PostalAddress' },
      { label: 'Contact channels', value: 'In-page form, WhatsApp click-to-chat, direct dial, Maps directions' },
      { label: 'CRM dashboard', value: 'Chart.js charts, six-column kanban, appointment list — seeded data' },
    ],
    decisions: [
      {
        title: 'The phone field validates the format the practice can actually ring',
        rationale:
          'A booking with an unreachable number is not a booking. The field constrains input to a valid Indian mobile — ten digits opening 6–9, with an optional country code — and explains the rule in place instead of failing silently after submission.',
        evidence:
          'Read from the production booking form on 2026-08-07: the phone input carries a pattern attribute, a numeric inputmode, and its own error message element.',
      },
      {
        title: 'A honeypot, not a CAPTCHA',
        rationale:
          'A public clinic form attracts bot submissions, and a CAPTCHA taxes every real patient to stop them. An off-screen field that humans never see and scripts routinely fill costs the patient nothing and drops the automated traffic.',
        evidence:
          'Read from the production booking form on 2026-08-07: a visually hidden, aria-hidden field with tabindex -1 and autocomplete off, labelled to be ignored.',
      },
      {
        title: 'Consent is a gate, not a footnote',
        rationale:
          'The practice contacts patients on WhatsApp afterwards. Making the tick a submission requirement means every record it holds was volunteered on the record, rather than assumed from a pre-checked box.',
        evidence:
          'Read from the production booking form on 2026-08-07: the consent checkbox is required, and the form will not submit without it.',
      },
      {
        title: 'The CRM dashboard ships with invented patients, on purpose',
        rationale:
          'The dashboard is reachable at a public URL with no login. Seeding it with real enquiry records would have made a demonstration surface into a data-protection exposure — names, phone numbers and treatments for identifiable people, served to anyone who guessed the path. Fictional records make the surface reviewable without putting a single real patient on the open web. The constraint the page is actually under is privacy, not fidelity.',
        evidence:
          'Read from the production dashboard on 2026-08-07: invented patient names, placeholder numbers and sequential record IDs throughout.',
      },
      {
        title: 'The dashboard is not linked from the public site',
        rationale:
          'It is an internal surface for the practice, not a page for patients, so it earns no navigation entry and no sitemap presence. Reachable by URL for whoever is given it; absent from the path a visitor takes.',
        evidence:
          'Searched in the production site’s source on 2026-08-07: the public pages contain no reference to the dashboard’s path — zero matches.',
      },
      {
        title: 'Devanagari is loaded as a first-class face',
        rationale:
          'Serving Hindi through a fallback renders it visibly worse than the English beside it. Noto Sans Devanagari ships alongside the Latin faces so both scripts are set deliberately.',
        evidence:
          'Read from the production document on 2026-08-07: the Google Fonts request includes Noto Sans Devanagari with the Latin families.',
      },
    ],
    outcome: { disclosure: 'not-disclosed' },
    faqs: [
      {
        id: 'healthcare-clinical-operations-engine-what-was-built',
        question: 'What did SheetFlow build for this dental practice?',
        answer:
          'A treatment-led clinic website with an in-page appointment intake, WhatsApp click-to-chat hand-off carrying a pre-filled message, direct dial and map directions, and a structured-data entity graph describing the practice, its opening hours and its treatment questions — plus a CRM dashboard that tracks every enquiry from first contact to treated. The practice is not named and the deployment is not linked, at SheetFlow’s decision.',
      },
      {
        id: 'healthcare-clinical-operations-engine-booking-flow',
        question: 'How does the appointment booking work?',
        answer:
          'A visitor selects a treatment, gives a name and mobile number, optionally picks a preferred date, and ticks a consent box. The number is validated against Indian mobile format before submission, and a hidden honeypot field drops automated submissions. Visitors who prefer to message instead get a WhatsApp link that opens with the reason for contact already written.',
      },
      {
        id: 'healthcare-clinical-operations-engine-dashboard',
        question: 'What does the clinical operations CRM dashboard do?',
        answer:
          'It turns captured enquiries into a worked pipeline: four summary tiles covering total leads, this month, converted and pending follow-up; a bar chart of the pipeline by status and a pie chart of leads by source; a kanban running the six statuses from new enquiry through treated and follow-up to closed; and an upcoming-appointments list. Every record on it is seeded demonstration data, not a real patient — the page is publicly reachable with no login, so fictional records are what keeps a demonstration surface from becoming a privacy exposure.',
      },
      {
        id: 'healthcare-clinical-operations-engine-results',
        question: 'What business results did this project produce?',
        answer:
          'Not publicly disclosed. SheetFlow publishes outcome figures only once they have been measured against a stated method and confirmed with the client in writing. No such measurement has been published for this project, so no figure is claimed.',
      },
    ],
    related: ['rehab-clinic-intake-engine', 'real-estate-acquisition-engine'],
    services: ['appointment-booking', 'whatsapp-automation', 'lead-capture'],
  },
  {
    slug: 'rehab-clinic-intake-engine',
    client: 'Rehabilitation Clinic Intake Engine',
    sector: 'Healthcare · physiotherapy and rehab',
    location: 'India',
    shortLabel: 'Rehab Intake',
    metaTitle: 'Rehabilitation Clinic Intake Engine — a rehab clinic site that books into WhatsApp',
    metaDescription:
      'A client build for a neuro and orthopaedic rehab clinic: a nine-service intake that submits straight into WhatsApp, an accessible live status region, and a verifiable credential graph.',
    kicker: 'Physiotherapy · Client build',
    headline: 'Rehab is chosen on credentials. So the site publishes them.',
    lede: 'Someone choosing a neuro-rehab clinician checks qualifications before price. The clinic needed those credentials stated where both a patient and a search engine could verify them — and an intake that reaches the clinic on the channel it already answers.',
    evidence: {
      kind: 'confidential',
      origin: 'client',
      disclosure:
        'A client build. At SheetFlow’s decision the clinic is not named and the deployment is not linked. There is no screenshot: every frame of the site identified the clinic or its clinician, so none could be redacted honestly.',
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
      { label: 'Typefaces', value: 'A serif display face with a geometric sans' },
      { label: 'Structured data', value: 'MedicalBusiness, Person, EducationalOccupationalCredential, CollegeOrUniversity, ItemList, AggregateRating, FAQPage' },
      { label: 'Contact channels', value: 'Form-to-WhatsApp, direct dial, Maps embed, Instagram' },
    ],
    decisions: [
      {
        title: 'The form submits into WhatsApp, and says so before you fill it',
        rationale:
          'The clinic answers WhatsApp and not email, so a form that sent email would have captured requests nobody read. Routing the intake to the channel the clinic actually monitors is worth more than owning the submission — and telling the visitor up front means the app switch is expected rather than jarring.',
        evidence:
          'Read from the production booking form on 2026-08-07: the hint above it states that the request opens in WhatsApp, straight to the clinic.',
      },
      {
        title: 'Credentials modelled as entities, not adjectives',
        rationale:
          '“Award-winning” is unverifiable and search engines treat it as such. A qualification linked to the institution that granted it, plus a professional registration number, is a checkable claim — which is what a patient comparing clinicians is looking for.',
        evidence:
          'Read from the production structured data on 2026-08-07: an EducationalOccupationalCredential linked to a CollegeOrUniversity, with the registration stated in the credentials section.',
      },
      {
        title: 'Validation is custom, and its result is announced',
        rationale:
          'Native validation bubbles are inconsistent across browsers and invisible to screen readers once dismissed. Turning them off and reporting into an ARIA live region means the same message reaches a sighted user and a screen-reader user.',
        evidence:
          'Read from the production booking form on 2026-08-07: the form carries novalidate, and its status paragraph is marked role="status".',
      },
      {
        title: 'Icons inline as one sprite',
        rationale:
          'A rehab site needs a large icon set for nine programmes. Inlining them as a single referenced sprite removes an entire class of network request and eliminates the icon-swap flash on first paint.',
        evidence:
          'Read from the production document on 2026-08-07: icons are <use> references to symbol ids defined once in the document.',
      },
    ],
    outcome: { disclosure: 'not-disclosed' },
    faqs: [
      {
        id: 'rehab-clinic-intake-engine-what-was-built',
        question: 'What did SheetFlow build for this rehabilitation clinic?',
        answer:
          'A rehabilitation clinic website covering nine treatment programmes, with a booking intake that submits directly into WhatsApp, accessible custom form validation, an inline SVG icon system, and a structured-data graph publishing the clinician, their qualification, the awarding institution and their professional registration. The clinic is not named and the deployment is not linked, at SheetFlow’s decision.',
      },
      {
        id: 'rehab-clinic-intake-engine-booking-flow',
        question: 'How does the rehab clinic booking form work?',
        answer:
          'The patient gives a name and phone number, selects one of nine programmes — neuro rehabilitation, orthopaedic, sports injury, post-operative, paediatric, geriatric, antenatal and postnatal, cardio-pulmonary, or a home visit — and can add a note describing their condition. Submitting composes the request and opens WhatsApp to the clinic, which the form states before it is filled in.',
      },
      {
        id: 'rehab-clinic-intake-engine-results',
        question: 'What business results did this project produce?',
        answer:
          'Not publicly disclosed. SheetFlow publishes outcome figures only once they have been measured against a stated method and confirmed with the client in writing. No such measurement has been published for this project, so no figure is claimed.',
      },
    ],
    related: ['healthcare-clinical-operations-engine', 'real-estate-acquisition-engine'],
    services: ['appointment-booking', 'whatsapp-automation'],
  },
  {
    slug: 'real-estate-acquisition-engine',
    client: 'High-Ticket Real Estate Acquisition Engine',
    sector: 'Real estate · plotted development',
    location: 'Highway corridor development, India',
    shortLabel: 'Real Estate Acquisition',
    metaTitle: 'High-Ticket Real Estate Acquisition Engine — a plot-discovery site built for local property search',
    metaDescription:
      'A client build for a plotted-development developer on a highway corridor: a code-split React application, a RealEstateAgent and Product entity graph with its inventory published as structured data, site-visit calls to action and WhatsApp enquiry routing.',
    kicker: 'Real estate · Client build',
    headline: 'Land is searched for by place. The site was built to be found by it.',
    lede: 'Plot buyers search corridors and landmarks, not developer names. The developer needed a site that answered locality queries directly, published its inventory in a form search engines can read, and moved an interested buyer towards a site visit or a WhatsApp conversation in one tap.',
    evidence: {
      kind: 'confidential',
      origin: 'client',
      disclosure:
        'A client build. At SheetFlow’s decision the developer is not named and the deployment is not linked. The screenshot is the production hero with the developer’s name, contact details and headline redacted.',
      shot: {
        src: '/work/real-estate-acquisition.jpg',
        width: 1280,
        height: 800,
        alt: 'Real estate acquisition site — a hero over a plotted development road with “Schedule site visit” and “View projects” buttons; the developer’s name, contact details and headline are redacted.',
      },
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
        short: 'Publish',
        detail:
          'The project is modelled as a product with a priced offer and availability, so the inventory is machine-readable rather than image text.',
        nodes: ['Product', 'Offer', 'RealEstateAgent', 'LocalBusiness'],
      },
      {
        stage: 'Route',
        detail:
          'Site-visit calls to action lead the first screen, and an interested buyer moves to WhatsApp in one tap, which is how this market transacts.',
        nodes: ['Site-visit calls to action', 'WhatsApp click-to-chat', 'Direct dial'],
      },
    ],
    build: [
      { label: 'Framework', value: 'React, single-page application' },
      { label: 'Bundler', value: 'Vite' },
      { label: 'Hosting', value: 'Vercel edge CDN' },
      { label: 'Code splitting', value: 'Split into separate chunks, plus a stylesheet' },
      { label: 'Typefaces', value: 'Serif display faces with a sans body face' },
      { label: 'Structured data', value: 'RealEstateAgent, LocalBusiness, Product + Offer, FAQPage, PostalAddress, GeoCoordinates' },
      { label: 'Installability', value: 'Web app manifest, SVG favicon, theme colour' },
    ],
    decisions: [
      {
        title: 'The route bundle is split by concern, not shipped as one file',
        rationale:
          'Charting and motion are the two heaviest dependencies in this build. Splitting them into their own chunks lets the browser cache them independently of application code, so a content change does not invalidate the vendor payload.',
        evidence:
          'Read from the production document on 2026-08-07: it module-preloads four separate chunks — application, vendor, motion and charts — alongside a small runtime.',
      },
      {
        title: 'Inventory published as a priced Offer',
        rationale:
          'A price rendered inside a hero image is invisible to every consumer that is not a human eye. Modelling the project as a Product with a currency-denominated Offer and an availability state makes the listing readable by search engines and assistants.',
        evidence:
          'Read from the production JSON-LD on 2026-08-07: a Product node whose offers carry priceCurrency, price and availability.',
      },
      {
        title: 'The entity is typed twice, deliberately',
        rationale:
          'RealEstateAgent describes what the business does; LocalBusiness carries the address and opening hours that local search reads. Publishing both, with a shared address, satisfies both consumers without either claim being untrue.',
        evidence:
          'Read from the production JSON-LD on 2026-08-07: both a RealEstateAgent and a LocalBusiness node for the same organisation.',
      },
      {
        title: 'Search Console verified at build time',
        rationale:
          'A property site lives or dies on local search. Shipping the verification token in the document means indexing coverage is observable from day one rather than after someone remembers to connect it.',
        evidence:
          'Read from the production document head on 2026-08-07: a google-site-verification meta tag is present.',
      },
    ],
    outcome: { disclosure: 'not-disclosed' },
    faqs: [
      {
        id: 'real-estate-acquisition-engine-what-was-built',
        question: 'What did SheetFlow build for this real estate developer?',
        answer:
          'A property discovery website for plots and highway shops on a highway corridor, built as a code-split React application. It publishes the developer, the project inventory as a priced offer, and the five questions plot buyers ask most as structured data, leads with site-visit calls to action, and routes enquiries to WhatsApp and direct dial. The developer is not named and the deployment is not linked, at SheetFlow’s decision.',
      },
      {
        id: 'real-estate-acquisition-engine-seo-approach',
        question: 'How was the site built to be found in local search?',
        answer:
          'Locality and corridor terms are targeted directly rather than the developer brand, an India-scoped language alternate keeps the page aimed at its market, the business is published as both a RealEstateAgent and a LocalBusiness with a full postal address and coordinates, inventory is modelled as a Product with a priced Offer, and the five most common buyer questions ship as a FAQPage.',
      },
      {
        id: 'real-estate-acquisition-engine-results',
        question: 'What business results did this project produce?',
        answer:
          'Not publicly disclosed. SheetFlow publishes outcome figures only once they have been measured against a stated method and confirmed with the client in writing. No such measurement has been published for this project, so no figure is claimed.',
      },
    ],
    related: ['healthcare-clinical-operations-engine', 'rehab-clinic-intake-engine'],
    services: ['lead-capture', 'whatsapp-automation'],
  },

  /* ---------------------------------------------------------------- */
  /* Demonstration builds — ours, uncommissioned, unnamed              */
  /* ---------------------------------------------------------------- */
  {
    slug: 'clinic-site-demonstration',
    client: 'Dental Clinic Demonstration Site',
    sector: 'Healthcare · demonstration build',
    location: 'Built as a sales demonstration',
    shortLabel: 'Clinic Site Demo',
    metaTitle: 'Dental Clinic Demonstration Site — a single-file clinic demonstration build',
    metaDescription:
      'A demonstration clinic site for a dental practice with in-house imaging: ten sections, WhatsApp and dial routing on every screen, and the entire build — photography included — delivered as one self-contained HTML document.',
    kicker: 'Healthcare · Demonstration build',
    headline: 'One file. No build step. Ten sections and the photography inside it.',
    lede: 'A demonstration build for a dental practice with an in-house diagnostics centre, put together to show the practice what its site could be. The interesting constraint was delivery: the whole thing is a single HTML document with the clinic photography embedded in it, so it runs from any host — or from a USB stick — with nothing to install.',
    evidence: {
      kind: 'confidential',
      origin: 'demonstration',
      disclosure:
        'SheetFlow’s own uncommissioned demonstration build, deployed from SheetFlow’s own hosting account (enumerated 2026-08-08) — which is how authorship is established. It was made to show a practice what is possible; it is not a client engagement, and no fee, brief or agreement sits behind it. The practice is not named and the deployment is not linked, at SheetFlow’s decision, and there is no screenshot because every frame carried the practice’s identity.',
    },
    brief: [
      'The practice pairs a dental clinic with an in-house OPG imaging centre — a real differentiator that no template accounts for.',
      'A demonstration has to survive being forwarded, opened on a phone, and viewed with no explanation attached.',
      'Patients in the catchment reach a clinic by phone or WhatsApp, so every screen had to offer both without scrolling back.',
    ],
    architecture: [
      {
        stage: 'Deliver',
        detail:
          'The build is one HTML document with styles, scripts and photography embedded, so there is no asset pipeline and nothing to break when it is moved between hosts.',
        nodes: ['Single document', 'Inlined CSS', 'Base64 photography'],
      },
      {
        stage: 'Persuade',
        detail:
          'Ten sections take a visitor from the treatment they searched for to the clinician who provides it, with the in-house diagnostics centre given a section of its own.',
        nodes: ['Hero', 'Services', 'In-house diagnostics', 'Gallery', 'Location'],
      },
      {
        stage: 'Route',
        detail:
          'Click-to-chat and direct-dial links repeat through the page, so the contact action is always within reach of the section that prompted it.',
        nodes: ['WhatsApp click-to-chat ×6', 'Direct dial ×6', 'Booking form'],
      },
      {
        stage: 'Capture',
        detail:
          'An in-page appointment form takes the name, a telephone number and a preferred date, so an enquiry can be left outside calling hours.',
        nodes: ['Name', 'Telephone input', 'Date picker'],
      },
    ],
    build: [
      { label: 'Delivery', value: 'Static HTML, single document of about 0.4 MB' },
      { label: 'Hosting', value: 'Static hosting' },
      { label: 'Photography', value: 'Clinic images base64-inlined (most of the document)' },
      { label: 'Typefaces', value: 'A sans body face with a serif display face' },
      { label: 'Motion', value: 'GSAP; three.js from a CDN' },
      { label: 'Contact channels', value: 'WhatsApp click-to-chat, direct dial, in-page appointment form' },
      { label: 'Structured data', value: 'None — see the decisions below' },
    ],
    decisions: [
      {
        title: 'The photography is inside the document, and that is a trade, not a free win',
        rationale:
          'Embedding the clinic images as base64 makes the build a single portable file: it opens from any host, any folder, or an email attachment, with no broken image paths. The cost is real and worth stating — most of the payload, close to nine-tenths, is images that a browser cannot cache separately, cannot serve responsively, and must download before the page is complete. For a demonstration that gets forwarded, portability won. For a production build it would not.',
        evidence:
          'Read from the production document on 2026-08-08: five img elements carry src="data:image/jpeg;base64,…"; the remaining four are Unsplash URLs standing in as placeholders.',
      },
      {
        title: 'The diagnostics centre gets its own section rather than a service row',
        rationale:
          'In-house OPG imaging is the reason a patient would choose this practice over the one nearer to them — it means the scan and the treatment happen in one visit. Listing it as a sixth bullet among treatments would have buried the single thing that is not interchangeable.',
        evidence:
          'Read from the production document on 2026-08-08: the services section carries a dedicated OPG centre entry under its own diagnostics heading.',
      },
      {
        title: 'Contact repeats six times instead of sitting in a header',
        rationale:
          'On a phone, a sticky header costs vertical space on every screen of a long page. Repeating the WhatsApp and dial links at the end of each persuasive section instead puts the action next to the reason for taking it, and costs nothing when the visitor is not ready.',
        evidence:
          'Counted in the production document on 2026-08-08: six wa.me links and six tel: links, one pair per major section.',
      },
      {
        title: 'No structured data, and it is a gap rather than a decision',
        rationale:
          'The commissioned clinical operations build publishes a full Dentist entity graph; this one publishes none, and has no meta description either. Naming it here rather than quietly omitting the row is the point: this is a demonstration of the visual and conversion layer, and the discoverability work that a production clinic site needs was not part of it.',
        evidence:
          'Read from the production document on 2026-08-08: no application/ld+json block and no meta name="description".',
      },
    ],
    outcome: { disclosure: 'not-disclosed' },
    faqs: [
      {
        id: 'clinic-site-demonstration-what-is-it',
        question: 'Is this clinic site a client project?',
        answer:
          'No. It is a demonstration build — SheetFlow made it to show a practice what its site could be, and it is published here on that basis. It is unambiguously our work, deployed from our own hosting account, but no fee, brief or agreement sits behind it and no commercial relationship is implied. The practice is not named and the build is not linked.',
      },
      {
        id: 'clinic-site-demonstration-single-file',
        question: 'Why is this clinic build a single 429 kB HTML file?',
        answer:
          'So it survives being forwarded. Everything — styles, scripts and five clinic photographs — is embedded in one document, which means it opens correctly from any host, any folder, or an email attachment with no broken paths and nothing to install. The trade is that about 88% of that payload is images the browser cannot cache separately or serve responsively, which is acceptable for a demonstration and would not be for a production build.',
      },
      {
        id: 'clinic-site-demonstration-results',
        question: 'What business results has this demonstration build produced?',
        answer:
          'Not publicly disclosed, and in this case there are none to disclose. It is a demonstration that was not commissioned, so there is no engagement behind it and no outcome has been measured or claimed.',
      },
    ],
    related: ['multi-speciality-clinic-demonstration', 'healthcare-clinical-operations-engine'],
    services: ['appointment-booking', 'whatsapp-automation', 'lead-capture'],
  },
  {
    slug: 'multi-speciality-clinic-demonstration',
    client: 'Multi-Speciality Clinic System',
    sector: 'Healthcare · demonstration build',
    location: 'Built as a sales demonstration',
    shortLabel: 'Clinic System Demo',
    metaTitle: 'Multi-Speciality Clinic System — a componentised clinic build on React 19 and Vite',
    metaDescription:
      'A demonstration clinic site built as a typed React 19 application: every piece of clinic content lives in one typed module, so the same system re-points at another practice by editing data rather than markup.',
    kicker: 'Healthcare · Demonstration build',
    headline: 'The second clinic build is where you find out what was a template.',
    lede: 'Built after the single-file demonstrations, and deliberately not like them. Every clinic-specific fact — name, address, treatments, hours, contact links — sits in one typed module, separate from the fourteen components that render it. Re-pointing the system at a different practice is a data edit, not a rebuild.',
    evidence: {
      kind: 'confidential',
      origin: 'demonstration',
      disclosure:
        'SheetFlow’s own uncommissioned demonstration build, deployed from SheetFlow’s own hosting account, with the source in this workspace — about 1,300 lines of TypeScript and CSS across 20 files, inspected 2026-08-08. The build says so itself: its hero carries a badge identifying it as a sales demonstration. It was not commissioned and no commercial relationship is implied. The practice it was made for is not named and the deployment is not linked, at SheetFlow’s decision. There is no screenshot: the page’s own headline and copy are distinctive enough to find the deployment by search.',
    },
    brief: [
      'A third clinic build in the same sector is where copy-paste stops being cheaper than structure.',
      'Clinic facts — hours, address, treatment list, contact numbers — are exactly the content that goes stale, and they were scattered through the markup of the earlier builds.',
      'The practice presents itself as a premium, multi-speciality clinic, so the interface had to carry that without stock-template styling.',
    ],
    architecture: [
      {
        stage: 'Model',
        detail:
          'One typed module holds every clinic-specific fact — identity, address, hours, treatments, gallery, testimonials and the contact links built from the number.',
        nodes: ['Typed clinic data module', 'Service type', 'Testimonial type', 'Gallery image type'],
      },
      {
        stage: 'Compose',
        detail:
          'Fourteen section components read that module and know nothing else about the practice, so none of them has to change when the practice does.',
        nodes: ['HeroSection', 'ServicesSection', 'TrustSection', 'BookingSection', 'ContactSection'],
      },
      {
        stage: 'Route',
        detail:
          'Contact actions are derived from the single stored number rather than written per link, so one edit changes every call, chat and directions target on the site.',
        nodes: ['WhatsApp link', 'Call link', 'Directions link'],
      },
      {
        stage: 'Reach',
        detail:
          'A floating WhatsApp control and a sticky booking action persist as the visitor scrolls, so the two actions that matter are never more than a tap away.',
        nodes: ['Floating WhatsApp button', 'Sticky booking button'],
      },
    ],
    build: [
      { label: 'Framework', value: 'React (SPA) on Vite' },
      { label: 'Language', value: 'TypeScript, strict project references' },
      { label: 'Styling', value: 'Tailwind CSS' },
      { label: 'Motion', value: 'framer-motion' },
      { label: 'Icons', value: 'lucide-react' },
      { label: 'Source size', value: 'About 1,300 lines across 20 files — 14 section components, one data module' },
      { label: 'Hosting', value: 'Static hosting' },
    ],
    decisions: [
      {
        title: 'Clinic content is a typed module, not markup',
        rationale:
          'The recurring failure in clinic sites is stale detail — an old number, last year’s hours, a treatment no longer offered — because those facts are scattered across the markup and only some get updated. Putting them in one typed object makes the update a single edit, and makes a missing field a compile error rather than a blank space on a live page.',
        evidence: 'The clinic data lives in one typed module of about 160 lines, exporting the service, testimonial and gallery types alongside the clinic object the components consume.',
      },
      {
        title: 'Contact links are derived from the number, not written beside it',
        rationale:
          'A clinic that changes its phone number changes it once. Storing the number and building the wa.me, tel: and Maps targets from it removes the class of bug where the header dials the new number and the footer dials the old one.',
        evidence: 'The WhatsApp, call and directions links are all built from one stored phone number and one stored map query.',
      },
      {
        title: 'Fourteen small components rather than one page file',
        rationale:
          'The earlier clinic demonstrations were single documents, which is the right call for something that gets forwarded and the wrong one for something that gets extended. Sections that are separately named and separately typed can be reordered, dropped or reused for the next practice without reading the whole file.',
        evidence: 'src/components/ holds 14 .tsx files; App.tsx is 38 lines and does nothing but order them.',
      },
      {
        title: 'The Google rating on the page is the clinic’s, and is not ours to claim',
        rationale:
          'The build renders a rating and a review count taken from the practice’s own public Google listing. That is the clinic’s data, displayed on the clinic’s own site as it would be anywhere else. It is not a SheetFlow outcome metric, and it is not offered here as evidence of anything we did — which is why no figure from it appears on this page.',
        evidence: 'The values originate in the practice’s public Google Business listing, stored in the data module as a rating and a review count.',
      },
    ],
    outcome: { disclosure: 'not-disclosed' },
    faqs: [
      {
        id: 'multi-speciality-clinic-demonstration-what-is-it',
        question: 'Is the multi-speciality clinic site a client project?',
        answer:
          'No. It is a demonstration build, made to show a practice what its site could be and published here on that basis. The source is ours and it is deployed from our own hosting account, but it was not commissioned and no commercial relationship is implied. The practice is not named and the build is not linked.',
      },
      {
        id: 'multi-speciality-clinic-demonstration-vs-single-file',
        question: 'Why is this build structured differently from the other clinic demonstrations?',
        answer:
          'Because it is the third one. The single-file builds are portable and ideal for something that gets forwarded, but every clinic-specific fact is embedded in the markup, so re-pointing one at another practice means editing prose in a 400 kB document. Here the practice details live in one typed module that fourteen components read, which makes the same job a data edit — and makes a missing field a compile error instead of a gap on a live page.',
      },
      {
        id: 'multi-speciality-clinic-demonstration-results',
        question: 'What business results has this demonstration build produced?',
        answer:
          'Not publicly disclosed, and none exist to disclose. It is an uncommissioned demonstration, so there is no engagement behind it and no outcome has been measured or claimed. The rating shown on the build itself is the practice’s own public Google listing data, not a result of ours.',
      },
    ],
    related: ['clinic-site-demonstration', 'healthcare-clinical-operations-engine'],
    services: ['appointment-booking', 'whatsapp-automation', 'lead-capture'],
  },

  /* ---------------------------------------------------------------- */
  /* Internal builds — real systems, nothing a visitor can open        */
  /* ---------------------------------------------------------------- */
  {
    slug: 'whatsapp-accounting-os',
    client: 'WhatsApp Accounting OS',
    sector: 'Financial systems',
    location: 'SheetFlow internal build',
    shortLabel: 'Accounting OS',
    metaTitle: 'WhatsApp Accounting OS — a double-entry ledger fed by Hinglish messages',
    metaDescription:
      'A SheetFlow internal build: a PostgreSQL double-entry accounting engine that accepts bookkeeping over WhatsApp in English, Hindi and Hinglish, stages every entry for human verification, and never lets a parser write to the ledger.',
    kicker: 'Financial systems · Internal build',
    headline: 'Bookkeeping by WhatsApp, without letting the parser touch the ledger.',
    lede: 'Indian cash businesses already record their day in messages — “आज ₹25,000 cement kharida”. The hard part is not reading that sentence. It is making sure a machine that half-understood it can never write a wrong number into the books.',
    evidence: {
      kind: 'internal',
      reason:
        'This is a back-office system with no public surface. It runs against a PostgreSQL database and a WhatsApp webhook, so there is no page to open — the evidence is the code and its test suite.',
      artifacts: [
        {
          name: 'src/ledger/engine.ts — 438 lines',
          detail:
            'The single sanctioned write path into the ledger. Posts a journal entry, both balancing legs, both cached balances and the staging status flip inside one transaction, all-or-nothing.',
        },
        {
          name: 'src/parser/index.ts — 258 lines',
          detail:
            'Extracts amount, direction, payment mode, counterparty and category from mixed-script messages. Normalises Devanagari digits and applies Indian-scale multipliers (k, hazaar, lakh, crore) as exact BigInt paise.',
        },
        {
          name: 'src/staging/service.ts — 290 lines',
          detail:
            'The verification queue every inbound message lands in. Nothing reaches the ledger without a human confirming it.',
        },
        {
          name: 'src/parser/parser.test.ts — 21 tests, all passing',
          detail:
            'Run on 2026-08-08 with `npm run test:staging`: 21 pass, 0 fail. Four of them assert the parser refuses to guess rather than filling a field it did not see evidence for.',
        },
      ],
    },
    brief: [
      'The people keeping these books type in three languages at once, and will not switch to an accounting app to do it.',
      'A language model reading a money message will sometimes be confident and wrong, which is the one failure mode a ledger cannot absorb.',
      'Rupee amounts in floating point silently lose precision, and a ledger that does not balance is worse than no ledger.',
    ],
    architecture: [
      {
        stage: 'Receive',
        detail:
          'A WhatsApp webhook accepts the message exactly as sent — mixed script, shorthand amounts, no required format.',
        nodes: ['Express webhook', 'WhatsApp gateway', 'Raw message store'],
      },
      {
        stage: 'Parse',
        detail:
          'Tokens are extracted into a structured entry, and anything not clearly evidenced is reported as UNKNOWN rather than guessed.',
        nodes: ['Devanagari normalisation', 'BigInt paise arithmetic', 'Direction & mode detection'],
      },
      {
        stage: 'Stage',
        detail:
          'Every parsed entry lands in a verification queue as Pending Verification. This is a hard architectural boundary, not a workflow preference.',
        nodes: ['Staging tables', 'Pending Verification', 'Operator correction'],
      },
      {
        stage: 'Post',
        detail:
          'Only a human-confirmed entry is promoted into the double-entry ledger, as one atomic transaction that either lands completely or not at all.',
        nodes: ['journal_entries', 'ledger_lines', 'Cached balances', 'Chart of accounts'],
      },
    ],
    build: [
      { label: 'Language', value: 'TypeScript, ES modules — 1,739 lines across 11 source files' },
      { label: 'Database', value: 'PostgreSQL, with money held as NUMERIC(15, 2)' },
      { label: 'Money arithmetic', value: 'BigInt paise in the parser; NUMERIC in the database. No amount becomes a JavaScript number.' },
      { label: 'Language model', value: 'Google Generative AI, for insight generation only — never on the write path' },
      { label: 'Concurrency', value: 'SELECT … FOR UPDATE row locking on the staging entry' },
      { label: 'Tests', value: '21 parser tests via the Node test runner, all passing' },
    ],
    decisions: [
      {
        title: 'The parser is structurally forbidden from writing to the ledger',
        rationale:
          'A model that misreads one message in fifty is useful for drafting and unacceptable for posting. Rather than trying to raise its accuracy to the point where direct writes would be safe, the write path was closed: parser output can only reach a staging table, and only a human-confirmed row can be promoted. The system is then allowed to be wrong, because being wrong is recoverable.',
        evidence:
          'The ledger engine accepts a staging id and user-confirmed values, and re-derives nothing from the parsed row. There is no other function that inserts into journal_entries.',
      },
      {
        title: 'Money never becomes a floating-point number',
        rationale:
          'IEEE-754 doubles cannot represent every two-decimal value, so a rupee amount that round-trips through a float has already lost. Amounts are parsed into BigInt paise, carried as exact decimal strings, and bound straight to PostgreSQL NUMERIC, which does the arithmetic.',
        evidence:
          'Amounts are typed as `string` throughout, and the posting path validates them against a NUMERIC(15, 2) pattern before binding — leading signs and exponent notation are rejected outright.',
      },
      {
        title: 'A blank field beats a confident guess',
        rationale:
          'Every parsed field is headed for a human verification queue. A field left UNKNOWN costs the operator a glance; a field confidently filled with the wrong direction gets approved by a tired person and lands in the books. The parser therefore refuses to infer a direction or a payment mode it did not see evidence for.',
        evidence:
          'Four of the 21 tests assert exactly this — the parser reports UNKNOWN when both directions appear, when neither appears, and when a payment mode is unstated, and it declines to file a category it cannot support.',
      },
      {
        title: 'Two people tapping “verify” at once cannot double-post',
        rationale:
          'The verification step is a message a human taps, and a message can be tapped twice. Locking the staging row for update means the second transaction blocks until the first commits, then reads the committed status and refuses — rather than interleaving past the check and posting the same entry twice.',
        evidence:
          'The posting routine opens by locking the staging entry FOR UPDATE, and the status check runs inside that lock.',
      },
    ],
    outcome: { disclosure: 'not-disclosed' },
    faqs: [
      {
        id: 'accounting-os-what-it-is',
        question: 'What is the WhatsApp Accounting OS?',
        answer:
          'A SheetFlow internal build: a double-entry accounting engine on PostgreSQL that accepts bookkeeping entries sent over WhatsApp in English, Hindi or Hinglish. Messages are parsed into a staging queue, a human confirms or corrects each one, and only confirmed entries are posted to the ledger. It is not a deployed product and has no public URL.',
      },
      {
        id: 'accounting-os-accuracy',
        question: 'How does it stop an AI mistake from corrupting the books?',
        answer:
          'The parser cannot write to the ledger at all. Its output goes only to a staging table marked Pending Verification, and the single function that writes to the ledger takes human-confirmed values rather than parsed ones. An AI misreading is therefore a queue item somebody corrects, never a wrong entry in the accounts.',
      },
      {
        id: 'accounting-os-results',
        question: 'What business results has the WhatsApp Accounting OS produced?',
        answer:
          'Not publicly disclosed. It is an internal build with no client engagement behind it, so there is no measured business outcome to report and none is claimed.',
      },
    ],
    related: ['bank-statement-parser', 'outbound-lead-engine'],
    services: ['whatsapp-automation', 'business-reports'],
  },
  {
    slug: 'wpc-design-automation',
    client: 'WPC Design Automation',
    sector: 'Manufacturing · CNC design automation',
    location: 'SheetFlow internal build',
    shortLabel: 'WPC Automation',
    metaTitle: 'WPC Design Automation — one image compiled into a 15-size CNC production matrix',
    metaDescription:
      'A SheetFlow internal build: a Python pipeline that compiles a single door design into 15 manufacturing sizes, emitting CNC toolpaths, print files, spot-UV varnish masks and catalogue PDFs as atomically verified production bundles.',
    kicker: 'Manufacturing AI · Internal build',
    headline: 'One design in. Sixty production files out, or none at all.',
    lede: 'A WPC door design has to exist in every size a customer might order, in four different file formats, each named exactly the way the CNC operator expects. Done by hand it is an afternoon of exacting, error-prone work per design — and a single mistyped size reaches the router as scrapped material.',
    evidence: {
      kind: 'internal',
      reason:
        'A manufacturing pipeline that runs on an operator’s machine and writes production bundles to disk. There is no hosted surface — the evidence is the source, the generated bundles and the run manifest.',
      artifacts: [
        {
          name: 'orchestrator.py — 1,261 lines',
          detail:
            'Drives the run: size matrix expansion, staged delivery, bundle verification, idempotency checks and legacy artifact migration.',
        },
        {
          name: 'vector_compiler.py — 869 lines',
          detail:
            'Converts the source image into closed-contour toolpath geometry and generates the spot-UV varnish mask via HSV band segmentation.',
        },
        {
          name: 'catalog_pdf.py — 316 lines',
          detail: 'Renders the per-size catalogue PDF that ships inside each bundle.',
        },
        {
          name: 'outputs/ — 7 production bundles',
          detail:
            'Seven completed `*_Production_Bundle.zip` archives plus `latest_run_manifest.json`, which records the naming contract and the full 15-entry size matrix in millimetres.',
        },
        {
          name: 'SheetFlow_ComplexJali_914x2134mm_Toolpath.svg',
          detail:
            'A compiled sample: 250 closed contours at 914.4 × 2133.6 mm, ready for the router.',
        },
        {
          name: 'dashboard.html — 1.4 MB',
          detail:
            'A generated single-file production gallery titled “Sheetflow WPC Production Gallery”, embedding the compiled previews inline so it opens with no server and no asset directory.',
        },
      ],
    },
    brief: [
      'Every design must ship in 15 sizes — three widths by five heights — and each size needs four different production roles.',
      'CNC operators consume files by filename, so an inconsistent name is a production error rather than a cosmetic one.',
      'Runs get interrupted, and a half-written bundle that looks complete is worse than an obviously missing one.',
    ],
    architecture: [
      {
        stage: 'Ingest',
        detail:
          'A single source design image enters the pipeline with a per-design configuration describing how its varnish bands should be segmented.',
        nodes: ['Source image', 'Per-design config', 'Change detection'],
      },
      {
        stage: 'Compile',
        detail:
          'The image is vectorised into closed-contour geometry and scaled across the size matrix at one uniform factor on both axes, so proportions never drift between sizes.',
        nodes: ['Contour extraction', '15-size matrix', 'Uniform scaling'],
      },
      {
        stage: 'Emit roles',
        short: 'Emit',
        detail:
          'Each size produces four artifacts under a documented naming contract: the CNC toolpath, the print file, the spot-UV varnish mask and the catalogue page.',
        nodes: ['Toolpath.svg', 'Print.jpg', 'Varnish.png', 'Catalog.pdf'],
      },
      {
        stage: 'Deliver atomically',
        short: 'Deliver',
        detail:
          'The bundle is staged to a partial file, verified, and only then renamed into place — so an interrupted run can never replace a good production pack with a truncated one.',
        nodes: ['.partial staging', 'verify_bundle()', 'Atomic rename', 'Run manifest'],
      },
    ],
    build: [
      { label: 'Language', value: 'Python — 2,446 lines across three modules' },
      { label: 'Size matrix', value: '15 sizes: 30/32/36 in widths × 72–84 in heights, recorded in millimetres' },
      { label: 'CNC target', value: 'VCarve / ArtCAM, 6 mm tool at 3 mm cut depth' },
      { label: 'Varnish masking', value: 'Spot-UV masks via a multiband HSV segmentation engine, configured per design' },
      { label: 'Naming contract', value: '{CleanDesignName}_{CleanSize}_{Role}{ext} — ASCII letters and digits only, no spaces in any path segment' },
      { label: 'Safety', value: 'Idempotent re-runs, `preview_only` dry-run on every destructive path, atomic staged delivery' },
    ],
    decisions: [
      {
        title: 'A bundle is renamed into place only after it verifies',
        rationale:
          'Production packs are overwritten on every re-run, and a run can die halfway — a lost connection, a full disk, an operator closing the terminal. Writing directly to the destination means a truncated archive silently replaces a good one, and nobody finds out until the router does. Staging to a partial file and renaming only after verification makes an interrupted run leave the previous good bundle untouched.',
        evidence:
          'Bundles are written to a `.partial` path and renamed only after `verify_bundle()` passes; the seven archives in `outputs/` are all complete.',
      },
      {
        title: 'The filename is treated as a machine interface',
        rationale:
          'The CNC operator finds files by name, and tooling downstream parses them. That makes the filename an interface, not a label — so it is specified as a contract with a fixed field order, a fixed separator and an ASCII-only charset, and written into the run manifest rather than living in someone’s head.',
        evidence:
          '`latest_run_manifest.json` carries the naming contract explicitly: pattern, field separator, the four role suffixes, archive layout and charset.',
      },
      {
        title: 'Every destructive path has a dry run',
        rationale:
          'The pipeline deletes and overwrites production output. A dry-run flag threaded through every such path means an operator can see exactly what a run would do before it does it, which is the difference between a tool people trust with a full rebuild and one they only ever run on a copy.',
        evidence: 'Destructive operations take a `preview_only` parameter throughout the orchestrator.',
      },
      {
        title: 'Unchanged designs are skipped, not recompiled',
        rationale:
          'Compiling 15 sizes × 4 roles is expensive, and most runs re-process a catalogue where one design changed. Change detection means a re-run costs roughly what the change costs, which is what makes running it routinely practical.',
        evidence: 'The orchestrator gates work behind `is_new_or_changed()` and `bundle_covers()` checks.',
      },
    ],
    outcome: { disclosure: 'not-disclosed' },
    faqs: [
      {
        id: 'wpc-what-it-is',
        question: 'What is WPC Design Automation?',
        answer:
          'A SheetFlow internal build: a Python pipeline that takes one WPC door design image and compiles it into a 15-size production matrix, emitting a CNC toolpath, a print file, a spot-UV varnish mask and a catalogue PDF for every size, packaged as verified production bundles. It is a manufacturing tool with no public deployment.',
      },
      {
        id: 'wpc-client-work',
        question: 'Was WPC Design Automation built for a client?',
        answer:
          'No. It is SheetFlow’s own capability, built to demonstrate what design automation can do for WPC manufacturing. No client commissioned it and no engagement is claimed. It is published here as an example of the engineering, not as delivered client work.',
      },
      {
        id: 'wpc-results',
        question: 'What business results has WPC Design Automation produced?',
        answer:
          'Not publicly disclosed. There is no client engagement behind it and no measured production outcome has been confirmed, so no figure is claimed.',
      },
    ],
    related: ['whatsapp-accounting-os', 'bank-statement-parser'],
    services: ['business-reports'],
  },
  {
    slug: 'outbound-lead-engine',
    client: 'Outbound Lead Engine',
    sector: 'Sales automation',
    location: 'SheetFlow internal build',
    shortLabel: 'Lead Engine',
    metaTitle: 'Outbound Lead Engine — a spreadsheet-driven outreach pipeline with reply detection',
    metaDescription:
      'A SheetFlow internal build: a Python outbound engine that cleans a lead spreadsheet, scores each lead with Claude, personalises and sends across rotating mailboxes, then reads the inbox back over IMAP to stop following up anyone who replied.',
    kicker: 'Sales automation · Internal build',
    headline: 'The follow-up stops the moment somebody replies.',
    lede: 'Most outreach tooling is good at sending and bad at listening, which is how a prospect who answered on Tuesday gets chased again on Thursday. This engine treats the inbox as part of the pipeline: replies come back in, and the sequence for that lead stops.',
    evidence: {
      kind: 'internal',
      reason:
        'An operator-run pipeline that drives real mailboxes and a live spreadsheet. It has no hosted interface, and its outputs are somebody’s inbox — so the evidence is the source and the configuration.',
      artifacts: [
        {
          name: 'scripts/system_orchestrator.py — 204 lines',
          detail:
            'The single command surface: pipeline, apify-import, campaign, replies, status, cycle, daily and a full dry run.',
        },
        {
          name: 'scripts/lead_pipeline_manager.py — 446 lines',
          detail:
            'Standardises raw lead rows, validates addresses, removes duplicates and writes the clean outreach dataset.',
        },
        {
          name: 'scripts/reply_detector.py — 380 lines',
          detail:
            'Reads mailboxes over IMAP, matches replies to campaign rows, and marks those leads so no further follow-up is scheduled.',
        },
        {
          name: 'agents/claude_scorer.py — 274 lines',
          detail:
            'Scores each lead through the Claude API with a rule-based scorer as fallback, and degrades to that fallback rather than failing the run when the API is unreachable.',
        },
        {
          name: 'config/system_config.json',
          detail:
            'The operational limits, in the repository rather than in someone’s memory: 40 emails per account per day, a 30-minute reply-check interval, and automatic reply sending switched off.',
        },
      ],
    },
    brief: [
      'Lead lists arrive from several sources in several shapes, and none of them are clean enough to send from.',
      'Sending everything from one mailbox gets that mailbox filtered, which ends the channel rather than the campaign.',
      'A follow-up sent to somebody who already replied is the single most damaging thing an outreach system can do.',
    ],
    architecture: [
      {
        stage: 'Ingest',
        detail:
          'Rows arrive from scraped exports and lead sources into a raw sheet, with no cleaning assumed and nothing sent from them.',
        nodes: ['Raw lead sheet', 'Source importers', 'Spreadsheet data plane'],
      },
      {
        stage: 'Clean & score',
        short: 'Score',
        detail:
          'Rows are standardised, addresses validated and duplicates dropped; each surviving lead is scored and bucketed by priority.',
        nodes: ['Validation', 'Deduplication', 'Claude scoring', 'Hot / warm / cold'],
      },
      {
        stage: 'Send',
        detail:
          'Each campaign personalises its first touch, rotates across sender accounts under a per-account daily cap, and schedules its own follow-ups.',
        nodes: ['Personalisation', 'Account rotation', 'Daily cap', 'Follow-up scheduler'],
      },
      {
        stage: 'Listen',
        detail:
          'Mailboxes are read back over IMAP; a detected reply is classified by intent, written to the campaign log, and stops that lead’s remaining sequence.',
        nodes: ['IMAP reply detection', 'Intent classification', 'Sequence halt', 'Draft suggestion'],
      },
    ],
    build: [
      { label: 'Language', value: 'Python — 6,928 lines across 34 modules' },
      { label: 'Data plane', value: 'A spreadsheet: raw leads, processed leads and an outreach log as the shared state' },
      { label: 'Scoring', value: 'Claude API with a deterministic rule-based scorer as fallback' },
      { label: 'Sending', value: 'SMTP across rotating accounts, capped at 40 per account per day' },
      { label: 'Listening', value: 'IMAP reply detection on a 30-minute interval' },
      { label: 'Safety', value: 'Dry-run mode across every campaign; automatic reply sending disabled by default' },
    ],
    decisions: [
      {
        title: 'The inbox is an input, not a destination',
        rationale:
          'A sequence that only sends will keep chasing someone who already answered — the most expensive mistake in outbound, because it converts an interested reply into an annoyed one. Reading the mailbox back over IMAP and halting the sequence on a detected reply makes the system aware of the conversation it started.',
        evidence:
          'The reply detector scans configured mailboxes, matches replies against campaign logs, and marks those leads so the follow-up scheduler skips them.',
      },
      {
        title: 'A spreadsheet is the data plane, deliberately',
        rationale:
          'The operator needs to see the pipeline, sort it, and correct a row by hand at nine in the evening. A database would be tidier and would put every one of those actions behind a tool nobody wants to build. Keeping raw leads, processed leads and the outreach log as sheets means the state is inspectable and editable by the person accountable for it.',
        evidence:
          'A dedicated 692-line sheets module is the persistence layer; the status command reads its live counts.',
      },
      {
        title: 'Scoring degrades instead of failing',
        rationale:
          'A model API is a network dependency in the middle of a batch job. Treating an outage as fatal means one bad afternoon stops the pipeline; falling back to a deterministic rule-based score means the run completes with slightly worse prioritisation, which is a far better failure.',
        evidence:
          'The Claude scorer imports a rule-based `score_lead` as fallback and walks a list of candidate models before giving up.',
      },
      {
        title: 'Automatic replies are built and switched off',
        rationale:
          'The system can draft a reply from a classified intent, and sending those unattended is exactly where outbound automation earns its reputation. The capability ships; the switch is off in the committed configuration, so turning it on is a deliberate decision by a person.',
        evidence:
          '`auto_send_replies` is `false` in `config/system_config.json`, and the responder generates drafts rather than sending.',
      },
    ],
    outcome: { disclosure: 'not-disclosed' },
    faqs: [
      {
        id: 'lead-engine-what-it-is',
        question: 'What is the Outbound Lead Engine?',
        answer:
          'A SheetFlow internal build: a Python pipeline that cleans and deduplicates lead spreadsheets, scores each lead with Claude, sends personalised campaigns across rotating mailboxes under a daily cap, and reads replies back over IMAP so anyone who answers drops out of the follow-up sequence. It is an internal operator tool with no public deployment.',
      },
      {
        id: 'lead-engine-spam',
        question: 'How does it avoid being spam?',
        answer:
          'Sending is capped at 40 messages per account per day and rotated across accounts, every campaign can be dry-run before it sends, replies stop the sequence for that lead immediately, and automatic reply sending is disabled in the committed configuration so nothing goes out unattended.',
      },
      {
        id: 'lead-engine-results',
        question: 'What business results has the Outbound Lead Engine produced?',
        answer:
          'Not publicly disclosed. No campaign outcome has been measured against a stated method, so no figure is claimed — including any figure about replies, meetings or clients acquired.',
      },
    ],
    related: ['ai-voice-receptionist', 'whatsapp-accounting-os'],
    services: ['lead-capture', 'crm-automation'],
  },
  {
    slug: 'ai-voice-receptionist',
    client: 'AI Voice Receptionist',
    sector: 'Voice AI · Telephony',
    location: 'SheetFlow internal build',
    shortLabel: 'Voice Receptionist',
    metaTitle: 'AI Voice Receptionist — an outbound calling agent that books appointments',
    metaDescription:
      'A SheetFlow internal build: a Node.js telephony agent that places outbound calls over Twilio, holds a conversation through a language model with streamed neural speech, books an appointment, and logs the outcome of every call.',
    kicker: 'Voice AI · Internal build',
    headline: 'A phone call is a latency budget with a conversation inside it.',
    lede: 'Text agents get to think. A voice agent has roughly a second before the silence sounds wrong and the person on the other end says “hello?”. Everything in this build — the model choice, the speech cache, the turn handling — is spending that budget.',
    evidence: {
      kind: 'internal',
      reason:
        'A telephony service that answers Twilio webhooks and places real calls. Exposing it publicly would mean anyone could make it dial a number, so it is not hosted for demonstration.',
      artifacts: [
        {
          name: 'src/server.js — 458 lines',
          detail:
            'Eight endpoints covering the full call lifecycle: initiation, greeting, each spoken turn, no-response handling, call status and audio delivery.',
        },
        {
          name: 'src/ai.js — 177 lines',
          detail:
            'Builds the conversation prompt from business configuration and drives a four-phase call structure — opener, discovery, bridge, book — with explicit end and booked signals.',
        },
        {
          name: 'src/tts.js — 100 lines',
          detail:
            'Speech synthesis with an in-memory audio cache served from a dedicated endpoint, expiring on a five-minute TTL swept every minute.',
        },
        {
          name: 'src/sheets.js — 98 lines',
          detail:
            'Writes the outcome of every call — timestamp, name, phone, reason, what the person said — to a spreadsheet log.',
        },
        {
          name: 'railway.json · Procfile · DEPLOY-NOW.md',
          detail:
            'Deployment configuration and a written runbook; the project was prepared for hosting rather than left as a script.',
        },
      ],
    },
    brief: [
      'A synthesised voice that pauses too long stops sounding like a person, and the call is lost in the first few seconds.',
      'Telephony is stateful and HTTP is not — each spoken turn arrives as a separate webhook with no memory of the last.',
      'A call that goes well and is not written down anywhere has produced nothing.',
    ],
    architecture: [
      {
        stage: 'Dial',
        detail:
          'Contacts are read from a CSV and placed as outbound calls, each carrying its own reason for calling into the conversation.',
        nodes: ['Contact list', 'Twilio outbound', 'Per-call context'],
      },
      {
        stage: 'Converse',
        detail:
          'Each turn arrives as a webhook: speech is transcribed by the telephony layer, answered by the language model, and spoken back.',
        nodes: ['Speech capture', 'Language model turn', 'Session store'],
      },
      {
        stage: 'Speak',
        detail:
          'Replies are synthesised to audio, cached in memory and served from a URL the telephony platform plays, rather than re-generated per playback.',
        nodes: ['Neural TTS', 'In-memory cache', 'Audio endpoint'],
      },
      {
        stage: 'Record',
        detail:
          'The call ends on an explicit end or booked signal, and the outcome is appended to a spreadsheet log with what the person actually said.',
        nodes: ['End / booked signals', 'Call status webhook', 'Outcome log'],
      },
    ],
    build: [
      { label: 'Runtime', value: 'Node.js with Express 5 — 1,487 lines across 11 modules' },
      { label: 'Telephony', value: 'Twilio programmable voice, outbound' },
      { label: 'Language model', value: 'OpenRouter, defaulting to GPT-4o-mini and switchable by environment variable' },
      { label: 'Speech', value: 'ElevenLabs Flash v2.5, with a text fallback when no key is configured' },
      { label: 'Logging', value: 'Spreadsheet call log — timestamp, name, number, reason, transcript summary' },
      { label: 'Deployment', value: 'Railway configuration, Procfile, and an optional tunnel for local testing' },
    ],
    decisions: [
      {
        title: 'The model was chosen for time-to-first-token, not for reasoning',
        rationale:
          'On a phone call the strongest model is the wrong model if it thinks for two seconds. The default is a small fast one, and the choice is written down in the source next to the alternatives it was picked over — so the next person changing it knows the constraint they are trading against.',
        evidence:
          'The model constant carries a comment comparing three candidates on speed against naturalness, and reads from an environment variable so it can be changed without a code edit.',
      },
      {
        title: 'Synthesised audio is cached and served, not regenerated',
        rationale:
          'The telephony platform fetches the audio it plays, and can fetch it more than once. Generating speech per fetch pays the synthesis latency again inside the call and bills for it twice. Caching in memory behind an audio endpoint means each utterance is synthesised once, with a short TTL because a call is over in minutes.',
        evidence:
          'Generated audio is stored against an id and served from `/audio/:id`, with a five-minute expiry swept on a one-minute interval.',
      },
      {
        title: 'Missing speech credentials degrade to text, not to a dropped call',
        rationale:
          'If synthesis is unavailable the call can still happen through the telephony platform’s own voice. Falling back keeps the appointment bookable at lower quality rather than failing the call outright, which is the right trade for a missed configuration.',
        evidence:
          'The speech module returns a fallback text payload rather than throwing when no API key is present.',
      },
      {
        title: 'The conversation has explicit exit signals',
        rationale:
          'A voice agent without a defined ending keeps talking, and an open-ended call is both a cost and a bad experience. The prompt structures the call into four phases and requires the model to emit an explicit end or booked marker, so the server decides when to hang up on a signal rather than on a guess.',
        evidence:
          'The prompt defines opener, discovery, bridge and booking phases, and the server terminates the loop on the end and booked markers.',
      },
    ],
    outcome: { disclosure: 'not-disclosed' },
    faqs: [
      {
        id: 'voice-what-it-is',
        question: 'What is the AI Voice Receptionist?',
        answer:
          'A SheetFlow internal build: a Node.js service that places outbound phone calls over Twilio, holds a natural conversation using a language model with neural speech synthesis, works towards booking a consultation, and logs the outcome of every call to a spreadsheet. It is not publicly hosted.',
      },
      {
        id: 'voice-why-not-live',
        question: 'Why is there no live demo of the voice agent?',
        answer:
          'Because a public endpoint for a system whose function is to place phone calls is a system anyone can make dial any number, at our cost and under our caller ID. The deployment configuration exists and the service runs; it is not exposed for demonstration.',
      },
      {
        id: 'voice-results',
        question: 'What business results has the AI Voice Receptionist produced?',
        answer:
          'Not publicly disclosed. No call-outcome measurement has been confirmed against a stated method, so no figure is claimed — including connection rates, conversation length or appointments booked.',
      },
    ],
    related: ['outbound-lead-engine', 'whatsapp-accounting-os'],
    services: ['appointment-booking', 'lead-capture'],
  },
  {
    slug: 'bank-statement-parser',
    client: 'Bank Statement Parser',
    sector: 'Document AI · Excel automation',
    location: 'SheetFlow internal build',
    shortLabel: 'Statement Parser',
    metaTitle: 'Bank Statement Parser — scanned PDF statements compiled into an Excel workbook',
    metaDescription:
      'A SheetFlow internal build: a Python pipeline that reads scanned bank statement PDFs with OCR, extracts and categorises every transaction, and writes a four-sheet Excel workbook with a clean ledger and a financial summary.',
    kicker: 'Document AI · Internal build',
    headline: 'A scanned statement is not data until something reads it.',
    lede: 'The statement arrives as a photograph of a page. Somewhere in it are three hundred transactions that a business needs in a spreadsheet — and typing them out is how a Saturday disappears. This pipeline reads the scan and hands back the workbook.',
    evidence: {
      kind: 'internal',
      reason:
        'The pipeline runs locally against real bank statements, and its output contains genuine account activity. It is described here and deliberately not screenshotted — the sample workbook holds real financial data belonging to a real person.',
      artifacts: [
        {
          name: 'parser.py — 1,222 lines',
          detail:
            'The full pipeline: dependency bootstrap, PDF rendering, OCR, transaction extraction, categorisation and workbook generation.',
        },
        {
          name: 'output/bank_statement_analysis.xlsx',
          detail:
            'A real generated workbook, verified on 2026-08-08: four sheets — Transactions (264 rows × 9 columns), Clean Ledger, Expense Categories and Financial Summary.',
        },
        {
          name: 'input/ — two scanned statement PDFs',
          detail:
            'The actual inputs the sample output was produced from: 1.5 MB and 551 KB scans, each a photographed multi-page statement rather than a digital export.',
        },
      ],
    },
    brief: [
      'The source is a photograph, not a text PDF, so nothing can be extracted without optical character recognition.',
      'A transaction line that OCR mangles becomes a wrong number in a financial record, which is worse than a missing one.',
      'The output has to land somewhere the business already works, which is a spreadsheet — not a dashboard nobody opens.',
    ],
    architecture: [
      {
        stage: 'Ingest',
        detail:
          'Scanned statement PDFs are dropped into an input folder; the pipeline picks up whatever is there with no per-file configuration.',
        nodes: ['input/ folder', 'Multi-file batch', 'Page rendering'],
      },
      {
        stage: 'Read',
        detail:
          'Each page is read twice — by direct text extraction where the PDF has a text layer, and by OCR where it does not — so digital and photographed statements both work.',
        nodes: ['OCR engine', 'Text-layer extraction', 'Page images'],
      },
      {
        stage: 'Structure',
        detail:
          'Recognised lines are parsed into dated transactions with debit, credit and running balance, each tagged with the file it came from.',
        nodes: ['Transaction parsing', 'Debit / credit split', 'Balance tracking', 'Source attribution'],
      },
      {
        stage: 'Publish to Excel',
        short: 'Excel',
        detail:
          'The result is written as a four-sheet workbook: every transaction, a cleaned ledger, spend grouped by category, and a summary.',
        nodes: ['Transactions', 'Clean Ledger', 'Expense Categories', 'Financial Summary'],
      },
    ],
    build: [
      { label: 'Language', value: 'Python — 1,222 lines, single-file pipeline' },
      { label: 'OCR', value: 'PaddleOCR over rendered pages, with pdfplumber for statements carrying a text layer' },
      { label: 'Categorisation', value: 'Anthropic API for transaction categorisation' },
      { label: 'Output', value: 'Excel workbook via openpyxl — four sheets, one file' },
      { label: 'Verified output', value: '264 transactions across two scanned statements, written on 2026-03-11' },
      { label: 'Setup', value: 'Missing dependencies are detected and installed on first run' },
    ],
    decisions: [
      {
        title: 'Excel is the destination, not a dashboard',
        rationale:
          'The people who need this already live in spreadsheets — that is where their accountant wants the file and where they will filter, annotate and total it. A web dashboard would be a better demo and a worse tool: it would mean exporting to a spreadsheet anyway, with one more step in between.',
        evidence:
          'The pipeline writes a single `.xlsx` with four sheets and no other output surface; the sample workbook opens with 264 rows in the Transactions sheet.',
      },
      {
        title: 'Two extraction paths, because statements arrive both ways',
        rationale:
          'Some statements are digital exports with a real text layer; most that arrive from a small business are photographs taken on a phone. Running text extraction where it works and OCR where it does not means one pipeline handles both, instead of failing on whichever kind it was not built for.',
        evidence:
          'Both pdfplumber and an OCR engine are required dependencies, and each transaction row records the source file it was read from.',
      },
      {
        title: 'The sample output is described here and not shown',
        rationale:
          'The verified workbook is genuine, which is exactly why it cannot be a screenshot. It contains real counterparty names, real UPI identifiers and real balances. Publishing a picture of it to prove the pipeline works would leak somebody’s finances to prove a point about engineering.',
        evidence:
          'This case study cites row and column counts and the sheet names rather than any transaction content, and no image of the workbook appears anywhere on this site.',
      },
      {
        title: 'The run installs what it needs',
        rationale:
          'This is operated by the business owner, not by a developer with a working Python toolchain. Detecting missing packages and installing them on first run removes the single most common reason a tool like this gets abandoned before it is ever used.',
        evidence:
          'The pipeline checks each required import at startup and installs any that are missing before continuing.',
      },
    ],
    outcome: { disclosure: 'not-disclosed' },
    faqs: [
      {
        id: 'parser-what-it-is',
        question: 'What is the Bank Statement Parser?',
        answer:
          'A SheetFlow internal build: a Python pipeline that reads scanned bank statement PDFs using OCR, extracts every transaction with its date, debit, credit and running balance, categorises spending, and writes a four-sheet Excel workbook. A verified sample run produced 264 transactions from two scanned statements.',
      },
      {
        id: 'parser-excel',
        question: 'Why does it output Excel rather than a dashboard?',
        answer:
          'Because that is where the work continues. The workbook goes to an accountant, gets filtered and annotated, and totals get checked by hand. A dashboard would have required exporting to a spreadsheet as an extra step, so the spreadsheet is the product.',
      },
      {
        id: 'parser-results',
        question: 'What business results has the Bank Statement Parser produced?',
        answer:
          'Not publicly disclosed. It is an internal build with no client engagement behind it, and no time-saving or accuracy figure has been measured against a stated method, so none is claimed.',
      },
    ],
    related: ['whatsapp-accounting-os', 'wpc-design-automation'],
    services: ['business-reports', 'invoice-reminders'],
  },

];

/* ------------------------------------------------------------------ */
/* Selectors                                                           */
/* ------------------------------------------------------------------ */

export function getProject(slug: string): WorkProject | undefined {
  return projects.find((p) => p.slug === slug);
}

/**
 * A client or demonstration build, published without its identity (D39).
 *
 * Neither origin carries a URL, so nothing in this set is fetched by test or
 * linked from a page. The narrowed type is still the point: callers that render
 * a disclosure or an origin label cannot be handed an internal build by a later
 * edit to the array above.
 */
export type ConfidentialProject = WorkProject & {
  evidence: Extract<ProjectEvidence, { kind: 'confidential' }>;
};

/** Every confidential build — client first, then demonstration, each in array order. */
export function confidentialProjects(): ConfidentialProject[] {
  const all = projects.filter(
    (p): p is ConfidentialProject => p.evidence.kind === 'confidential',
  );
  return [
    ...all.filter((p) => p.evidence.origin === 'client'),
    ...all.filter((p) => p.evidence.origin === 'demonstration'),
  ];
}

/**
 * Commissioned client engagements only.
 *
 * Callers that make a *client* claim — the client label, a client count —
 * cannot be handed a demonstration build by a later edit to the array above.
 * Use `confidentialProjects()` where the concern is anonymised work of either
 * origin.
 */
export function clientProjects(): ConfidentialProject[] {
  return confidentialProjects().filter((p) => p.evidence.origin === 'client');
}

/** A confidential build that carries a redacted screenshot. */
export type ShotProject = ConfidentialProject & { evidence: { shot: ProjectShot } };

/**
 * Confidential builds with a screenshot, in `confidentialProjects()` order.
 *
 * The correct input for anything that renders a picture: the homepage grid and
 * the screenshot check. A build whose every frame identified the client has no
 * `shot`, and so cannot reach a component that would render an empty frame.
 */
export function projectsWithShots(): ShotProject[] {
  return confidentialProjects().filter(
    (p): p is ShotProject => p.evidence.shot !== undefined,
  );
}

/**
 * The fields the homepage grid renders, and nothing else.
 *
 * Under D39 `client` holds the archetype name, never a business name, and
 * `location` holds a non-identifying context ("Dental practice, India"),
 * never a locality.
 *
 * ## Why this exists here rather than in the component
 *
 * `components/sections/CaseStudy.tsx` is a client component, and it used to
 * import this module directly. That put the **entire case-study corpus** into
 * the browser bundle — every architecture stage, engineering decision and FAQ
 * answer for all eight projects — to render a card showing a name, a sector and
 * a picture.
 *
 * It went unnoticed while `/work` held three projects. Phase Y took it to
 * eight, gzipped JS went 355.7 → 369.3 kB, and the 360 kB budget gate failed.
 * The narrowing therefore happens on the server, and the prose never enters the
 * client graph.
 *
 * `toCard` lives in this module and not next to the component because anything
 * exported from a `'use client'` file becomes a client reference — a server
 * component calling it gets a proxy, and the page fails to serialize at export.
 */
export interface CaseStudyCard {
  slug: string;
  client: string;
  sector: string;
  location: string;
  shot: { src: string; alt: string };
}

/** Narrows a confidential build with a screenshot to what the homepage grid needs. Server-side only. */
export function toCard(project: ShotProject): CaseStudyCard {
  return {
    slug: project.slug,
    client: project.client,
    sector: project.sector,
    location: project.location,
    shot: { src: project.evidence.shot.src, alt: project.evidence.shot.alt },
  };
}

export function relatedProjects(project: WorkProject): WorkProject[] {
  return project.related
    .map(getProject)
    .filter((p): p is WorkProject => p !== undefined);
}
