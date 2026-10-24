/**
 * Dashboard stories: the visual half of the proof chapter.
 *
 * Each story walks a visitor through a real interface in two or three scenes
 * (a screenshot, what it shows, and one sentence on why it is built that way).
 * It sits beside `content/work.ts`, not inside it, because it answers a different
 * question: not "is this engagement real" but "what does the thing actually look
 * like when you open it".
 *
 * ## The same rules as work.ts, enforced the same way
 *
 * D39 removes every client identity from the site: no business name, person
 * name, phone number, address, identifying locality, domain or brand mark
 * appears in a story's text or in its pixels. Client builds are named by
 * archetype, exactly as in `content/work.ts`, and every frame below was
 * redacted before it was saved. The ban on invented outcomes stands. So:
 *
 *   - `basis` is **mandatory** and is rendered with every story. A screenshot of a
 *     pipeline with names in it says nothing about whose names they are; the
 *     type refuses a story that does not say. Three bases exist because the four
 *     stories have three different relationships to their data (D34 requires the
 *     clinical operations dashboard to say its data is seeded, and it does).
 *   - `OUTCOME_LABEL` is the only outcome text a story can show. There is no
 *     field a number can be typed into.
 *   - `kind` separates a client build from an engineering showcase from an
 *     internal tool, so a prototype can never be presented as a paid
 *     engagement. The luxury retail flow is a `showcase`: a full-stack
 *     prototype, by the founder's own classification (2026-10-21).
 *   - `link` only ever points inside this site. A link to a deployment would be
 *     the business's identity in another form, which is why the retail
 *     showcase no longer links to its storefront.
 *
 * ## How the frames were made (so they can be remade)
 *
 * Captured with headless Chrome, 1600x1000 (phone frames 390 CSS px at 2x):
 *   - Healthcare (1440x900): re-rendered from the CRM snapshot, whose data is the
 *     seeded demonstration set documented in D34 (invented patients, placeholder
 *     numbers). As a second guard every patient field was still overwritten with a
 *     placeholder *before* the screenshot and blurred on top, so the published pixels
 *     contain no patient-looking values at all. The practice name is redacted from
 *     the header.
 *   - Luxury retail: a local run of the project on seeded mock data, signed in
 *     with a throwaway test account. Phone numbers masked and the brand wordmark
 *     and order references redacted before capture.
 *   - Real estate: the public site, after every lazy image had loaded, with the
 *     developer's name, logo, headline and contact details redacted. Two earlier
 *     frames (a projects section and a phone view) were retired under D39.
 *   - SheetFlow Operations: the real internal dashboard with lead counts,
 *     third-party business names, credential hints and file paths removed, and
 *     the rendered text scanned for leaks before any frame was saved.
 */

export type DataBasis =
  | { kind: 'seeded'; note: string }
  | { kind: 'live-site'; note: string }
  | { kind: 'sanitized'; note: string };

/** The line every story renders about its data. */
export const BASIS_LABEL: Record<DataBasis['kind'], string> = {
  seeded: 'Seeded demonstration data, not real customers',
  'live-site': 'Captured from the live site, identifying details redacted',
  sanitized: 'Internal tool, sanitized before capture',
};

export type StoryKind = 'client' | 'showcase' | 'internal';

export const KIND_LABEL: Record<StoryKind, string> = {
  client: 'Client build',
  showcase: 'Engineering showcase · prototype, not a client engagement',
  internal: 'Internal tool',
};

/** The single outcome string every story renders. There is no field for a figure. */
export const OUTCOME_LABEL = 'Not publicly disclosed.';

export interface StoryFrame {
  /** Under `public/work/story/`. */
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface StoryScene {
  id: string;
  title: string;
  /** What the frame shows, in terms a reader can check by looking at it. */
  body: string;
  device: 'desktop' | 'phone';
  frame: StoryFrame;
}

export interface DashboardStory {
  slug: string;
  /** The archetype or system name. Never a third party's name (D39). */
  client: string;
  sector: string;
  kind: StoryKind;
  summary: string;
  basis: DataBasis;
  /** At least one scene, so a story can never render as an empty shell. */
  scenes: [StoryScene, ...StoryScene[]];
  /** Only a destination on this site that a visitor can actually open. */
  link?: { href: string; label: string; external: boolean };
}

const F = (name: string, width: number, height: number, alt: string): StoryFrame => ({
  src: `/work/story/${name}.webp`,
  width,
  height,
  alt,
});

export const dashboardStories: DashboardStory[] = [
  {
    slug: 'healthcare-clinical-operations',
    client: 'Healthcare & Clinical Operations Engine',
    sector: 'Healthcare · dental practice',
    kind: 'client',
    summary:
      'A clinical operations CRM for a dental practice: every enquiry, the treatment it asked about, the stage it is at and the next appointment, tracked on one page from first enquiry to treated.',
    basis: {
      kind: 'seeded',
      note: 'The dashboard runs on seeded demonstration data (invented patients, placeholder numbers). Names and numbers were also overwritten and blurred for this capture, and the practice name is redacted.',
    },
    link: { href: '/work/healthcare-clinical-operations-engine', label: 'Read the case study', external: false },
    scenes: [
      {
        id: 'overview',
        title: 'The whole clinic at a glance',
        body: 'Four numbers lead the page: total leads, this month, converted and pending follow-up. Below them, leads by stage and by source.',
        device: 'desktop',
        frame: F('healthcare-1', 1440, 900, 'Clinical operations CRM, practice name redacted: four summary tiles, a bar chart of leads by status and a pie chart of leads by source'),
      },
      {
        id: 'pipeline',
        title: 'Watch each enquiry move',
        // The six status names (New … Treated … Closed) are read off healthcare-2.webp.
        body: 'A six-column pipeline from New through Treated to Closed shows the treatment each person asked about, and the upcoming appointments carry their status.',
        device: 'desktop',
        frame: F('healthcare-2', 1440, 900, 'Clinical operations CRM: a six-column lead pipeline and a list of upcoming appointments with their status, patient details blurred'),
      },
      {
        id: 'phone',
        title: 'The same page, on a phone',
        body: 'The layout folds to a single column, so the front desk can check the pipeline without a laptop.',
        device: 'phone',
        frame: F('healthcare-phone', 780, 3400, 'The clinical operations CRM on a phone: summary tiles, charts and the start of the pipeline in one column, practice name redacted'),
      },
    ],
  },
  {
    slug: 'luxury-retail-flow',
    client: 'E-Commerce & Luxury Retail Flow',
    sector: 'E-commerce · luxury retail storefront and executive CRM',
    kind: 'showcase',
    summary:
      'A luxury retail storefront with an executive CRM behind it, built end to end as a full-stack prototype to show what a custom back office can be. It is an engineering showcase, not a client engagement.',
    basis: {
      kind: 'seeded',
      note: 'Every order, buyer and figure here is generated by the project’s own seed script. Phone numbers are masked and the brand wordmark is redacted.',
    },
    scenes: [
      {
        id: 'overview',
        title: 'Sales performance in one view',
        body: 'Total sales, orders, unique buyers and average order value, a twelve-month revenue curve and a breakdown of orders by shipping city.',
        device: 'desktop',
        frame: F('retail-1', 1600, 1000, 'Executive retail CRM, brand wordmark redacted: sales tiles, a revenue growth chart and an orders-by-city table on a dark gold interface'),
      },
      {
        id: 'operations',
        title: 'Operations the way a store runs',
        // Privilege codes and the WhatsApp contact on atelier requests are read off retail-2.webp.
        body: 'An order pipeline from pending to delivered: each order moves through Pending, Processing, Shipped and Delivered one click at a time. Privilege codes switch on and off at checkout, and bespoke atelier requests queue alongside, each with a WhatsApp contact.',
        device: 'desktop',
        frame: F('retail-2', 1600, 1000, 'Executive retail CRM operations: an order table with stage controls and masked phone numbers, a coupon engine with two active privilege codes, and atelier requests with WhatsApp contact links'),
      },
      {
        id: 'phone',
        title: 'Built for the phone too',
        body: 'The CRM reflows into a single column of tiles, charts and tables.',
        device: 'phone',
        frame: F('retail-phone', 780, 3400, 'The executive retail CRM on a phone: stacked sales tiles, a revenue chart and the city table'),
      },
    ],
  },
  {
    slug: 'real-estate-acquisition',
    client: 'High-Ticket Real Estate Acquisition Engine',
    sector: 'Real estate · plotted development',
    kind: 'client',
    summary:
      'A plotted-development site for a developer: the offer, the land itself, and a path from first look to a site-visit request or a WhatsApp enquiry.',
    basis: {
      kind: 'live-site',
      note: 'Captured from the public site as it renders, with the developer’s name, logo, headline and contact details redacted.',
    },
    link: { href: '/work/real-estate-acquisition-engine', label: 'Read the case study', external: false },
    scenes: [
      {
        id: 'offer',
        title: 'Open on the offer',
        body: 'The first screen sets the development against its road and offers two actions: schedule a site visit or view the projects. A book-site-visit button stays in the header and a WhatsApp button in the corner.',
        device: 'desktop',
        frame: F('realestate-1', 1600, 1000, 'Real estate site hero over a plotted development road, with Schedule site visit and View projects buttons; the developer’s name, headline and contact details are redacted'),
      },
      {
        id: 'land',
        title: 'Show the ground',
        body: 'A photo gallery, each tile labelled with a buyer reassurance (approvals, planning, location, title), shows buyers the ground before they visit.',
        device: 'desktop',
        frame: F('realestate-2', 1600, 1000, 'Real estate site gallery: a grid of site photographs with short reassurance labels; the developer’s logo and intro line are redacted'),
      },
    ],
  },
  {
    slug: 'sheetflow-operations',
    client: 'SheetFlow Operations',
    sector: 'Our own control tower',
    kind: 'internal',
    summary:
      'The page we run our own agency from. It says what is running, what is stopped and what waits for a person, and how each line was checked.',
    basis: {
      kind: 'sanitized',
      note: 'Lead data, third-party business names, credential details and file paths were removed before this capture, and the rendered text was scanned for leaks.',
    },
    scenes: [
      {
        id: 'overview',
        title: 'Honest by design',
        body: 'A banner states the rule (drafts only, a person reviews and sends) and the tiles count what was saved, what was sent and what is held.',
        device: 'desktop',
        frame: F('ops-1', 1600, 1000, 'SheetFlow Operations: a draft-only notice and three tiles counting drafts saved, messages sent and items held for review'),
      },
      {
        id: 'automations',
        title: 'What is actually running',
        body: 'Every automation shows its state, how it was checked (a live probe, a file check or a dated observation) and what happens next.',
        device: 'desktop',
        frame: F('ops-2', 1600, 1000, 'SheetFlow Operations: a list of automations with a state badge, a plain description and the method and time of each check'),
      },
    ],
  },
];

/** The two stories shown on the homepage; `/work` shows all of them. */
export function featuredStories(): DashboardStory[] {
  return dashboardStories.filter((s) => s.slug === 'healthcare-clinical-operations' || s.slug === 'luxury-retail-flow');
}
