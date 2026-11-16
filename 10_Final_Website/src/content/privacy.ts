/**
 * The privacy notice: its version, the decisions only the founder can make,
 * and the wording the /book form shares with the /privacy page (D47).
 *
 * ## Why the notice is versioned
 *
 * Every lead `/api/intake` captures records `PRIVACY_NOTICE_VERSION` next to
 * the AI-training choice (`lead.consent.noticeVersion`), because India's DPDP
 * Act puts the burden of proving what a person was told on us (s.6(10)). Bump
 * the version, and the effective date, whenever the meaning of the /book notice,
 * the checkbox or the /privacy page changes. A typo fix needs no bump.
 *
 * ## Why some values are placeholders, and what stops them shipping
 *
 * The notice must name a Grievance Officer with contact details and an address
 * (IT Act SPDI Rules 2011, r.5(9) and r.5(3)(d), in force today) and state how
 * long records are kept. Those are the founder's decisions, so nothing here is
 * guessed: each one holds `PLACEHOLDER` until he fills it in. Local and preview
 * builds render a visible "[To be confirmed by SheetFlow: ...]" marker in its
 * place. The site has no CI, so the Vercel production build is the only gate:
 * the /privacy page calls `assertPrivacyDecisionsComplete(process.env)` when
 * its module loads, and that throws while `VERCEL_ENV` is `production` and any
 * decision is unfilled, which fails the build before a placeholder can be
 * published.
 *
 * ## Why the guard also checks CAL_BOOKING_URL
 *
 * The notice names Cal.com, Inc. as the booking page and the company that
 * receives each booking. While `CAL_BOOKING_URL` is unset or invalid,
 * `/api/intake` sends every visitor, with their name, email and answers in the
 * link, to the Calendly fallback instead, and the notice would name the wrong
 * company. A comment asking for the order "Cal.com first, then the decisions"
 * is not enough when the build is the only gate, so the guard runs the same
 * `readCalBookingUrl` check `/api/intake` uses and fails the production build
 * until it passes. Vercel exposes the project's environment variables to the
 * build, so setting it for Production is enough.
 *
 * The vendor facts the page states (retention periods, where data is
 * processed) were read from each provider's documentation on 13 November 2026;
 * re-check them before publishing.
 *
 * The drafting follows the DPDP Act 2023 and Rules 2025, and the SPDI Rules
 * 2011, as researched for D47. That research is not legal advice, and neither
 * is this file; a lawyer's review is the founder's call.
 *
 * Its one import is relative and itself import-free, on purpose:
 * `scripts/test-privacy-guard.mjs` loads this module in plain Node, which
 * cannot resolve the `@/` alias, and the client /book form imports it too.
 */
import { readCalBookingUrl } from '../lib/cal-booking-url.ts';

/**
 * Every version of the notice a /book form has been rendered with, oldest
 * first; the last one is current. To change the notice, append a new version:
 * never edit or remove an old one, because `/api/intake` records a form's own
 * version only when it is in this list (a tab left open across a deploy still
 * proves what its visitor read). Format: the effective date, then a counter
 * for that day.
 */
export const PRIVACY_NOTICE_VERSIONS: readonly string[] = ['2026-11-15.1'];
/** The current version: what the form shows and the page states. */
export const PRIVACY_NOTICE_VERSION = PRIVACY_NOTICE_VERSIONS[PRIVACY_NOTICE_VERSIONS.length - 1];
export const PRIVACY_EFFECTIVE_DATE = '15 November 2026';
/** When the provider facts on /privacy were last read from the providers' own documentation. */
export const PROVIDER_FACTS_CHECKED = '13 November 2026';

/**
 * The value every unfilled decision holds. Deliberately loud, so a search for
 * it finds every decision still open.
 */
export const PLACEHOLDER = 'TO_BE_CONFIRMED_BY_SHEETFLOW';

/**
 * What only the founder can decide. Each value is either his answer or
 * `PLACEHOLDER`; nothing is defaulted on his behalf, except the language offer,
 * which stays off unless he can actually deliver it.
 */
export type FounderDecisions = {
  /** The person named as Grievance Officer / privacy contact (SPDI r.5(9) requires a name). */
  grievanceOfficerName: string;
  /** The email address privacy requests and grievances go to. */
  privacyEmail: string;
  /** The postal address published for the business (SPDI r.5(3)(d)). Not a home address unless he decides so. */
  postalAddress: string;
  /** How many months enquiry and booking records are kept after the last contact. A whole number. */
  retentionMonths: number | typeof PLACEHOLDER;
  /** How many days after a withdrawal the answers leave the AI-training set. A whole number. */
  aiTrainingRemovalDays: number | typeof PLACEHOLDER;
  /**
   * True only if SheetFlow can really provide this notice in Hindi or another
   * Indian language on request (DPDP s.5(3)). Only then does /privacy offer it.
   */
  otherLanguagesOnRequest: boolean;
};

export const FOUNDER_DECISIONS: FounderDecisions = {
  // Decided by the founder on 2026-11-15.
  grievanceOfficerName: 'Yashu Sharma',
  privacyEmail: 'sheetflow51@gmail.com',
  postalAddress: 'S.R. Super Market, NH-19, Etmadpur, Agra, Uttar Pradesh 283202',
  retentionMonths: 24,
  aiTrainingRemovalDays: 30,
  otherLanguagesOnRequest: false,
};

/** The decisions that must be filled before production. The language offer has a safe default. */
export type RequiredDecision = Exclude<keyof FounderDecisions, 'otherLanguagesOnRequest'>;

/** How each decision is named in the page markers and in the build error. */
export const DECISION_LABELS: Record<RequiredDecision, string> = {
  grievanceOfficerName: 'Grievance Officer name',
  privacyEmail: 'privacy contact email',
  postalAddress: 'postal address',
  retentionMonths: 'how many months records are kept after the last contact',
  aiTrainingRemovalDays: 'how many days until withdrawn answers leave the training set',
};

const REQUIRED_DECISIONS = Object.keys(DECISION_LABELS) as RequiredDecision[];

/**
 * Text that still reads as a stand-in: the sentinel in any case or padding, or
 * the wording of the page marker ("[To be confirmed by SheetFlow: ...]"), which
 * is what someone copying from a preview build would paste.
 */
const STAND_IN_TEXT = /to[\s_-]*be[\s_-]*confirmed/i;

/**
 * True when a decision has no usable answer: the placeholder itself (also
 * padded, re-cased or pasted from the page marker), a blank string, or a count
 * that is not a whole number above zero. A value blanked or half-filled by
 * mistake must stop the production build just as the placeholder does.
 */
export function isUnfilled(value: unknown): boolean {
  if (value === PLACEHOLDER || value === undefined || value === null) return true;
  if (typeof value === 'string') {
    const text = value.trim();
    return text.length === 0 || text.toUpperCase() === PLACEHOLDER || STAND_IN_TEXT.test(text);
  }
  if (typeof value === 'number') return !(Number.isInteger(value) && value > 0);
  return true;
}

const COUNT_DECISIONS: ReadonlySet<RequiredDecision> = new Set(['retentionMonths', 'aiTrainingRemovalDays']);

/**
 * The required decisions that are still unfilled, in a stable order. A value of
 * the wrong kind counts too (a count typed as text, a privacy email that does
 * not look like an address), since the page would otherwise publish a period
 * or a contact nobody can rely on.
 */
export function unfilledDecisions(decisions: FounderDecisions = FOUNDER_DECISIONS): RequiredDecision[] {
  return REQUIRED_DECISIONS.filter((key) => {
    const value: unknown = decisions[key];
    if (isUnfilled(value)) return true;
    if (COUNT_DECISIONS.has(key)) return typeof value !== 'number';
    if (typeof value !== 'string') return true;
    return key === 'privacyEmail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  });
}

/**
 * Stops a production build while the notice would be untrue: any decision
 * unfilled, or `CAL_BOOKING_URL` not a valid Cal.com link (see the header).
 * Does nothing anywhere else. `VERCEL_ENV` is set by Vercel to `production`,
 * `preview` or `development`, and is absent locally, so preview and local
 * builds still render the page with visible markers for review.
 */
export function assertPrivacyDecisionsComplete(
  env: Record<string, string | undefined>,
  decisions: FounderDecisions = FOUNDER_DECISIONS,
): void {
  if (env.VERCEL_ENV !== 'production') return;
  const problems: string[] = [];
  const missing = unfilledDecisions(decisions);
  if (missing.length > 0) {
    const list = missing.map((key) => `${key} (${DECISION_LABELS[key]})`).join('; ');
    problems.push(
      `It still has founder decisions to fill in src/content/privacy.ts (FOUNDER_DECISIONS): ${list}. ` +
        `Preview and local builds show "[To be confirmed by SheetFlow: ...]" in their place; a production page must not.`,
    );
  }
  if (readCalBookingUrl(env) === null) {
    problems.push(
      `CAL_BOOKING_URL is not set to a valid Cal.com event link (https://cal.com/<user>/<event>) for Production. ` +
        `The /book notice and /privacy name Cal.com as the booking page, but without that link /api/intake ` +
        `sends every visitor to the Calendly fallback.`,
    );
  }
  if (problems.length === 0) return;
  throw new Error(`[privacy] Production build stopped: the privacy notice is not ready to publish. ${problems.join(' Also, ')}`);
}

/** The visible stand-in for an unfilled decision on preview and local builds. */
export function pendingMarker(key: RequiredDecision): string {
  return `[To be confirmed by SheetFlow: ${DECISION_LABELS[key]}]`;
}

/** The ids of the /privacy sections other pages link to. */
export const PRIVACY_SECTION_IDS = {
  contact: 'contact',
  aiTraining: 'ai-training',
  rights: 'your-rights',
} as const;

/**
 * The short notice directly above the /book submit button.
 *
 * It has to make sense on its own, without the privacy page (DPDP Rules 2025,
 * r.3(a)): which details, what for, where they go, what not to share, and that
 * correction and deletion are available. The link to the full notice follows it.
 * Booking needs no tick-box: the visitor gives these details to get the
 * session, and this says what they are used for (DPDP s.7(a)).
 *
 * Each item sits with its real purpose, the same one /privacy gives it: the
 * typed details arrange the session; the page, campaign tags and country show
 * where enquiries come from and do nothing for the booking itself. The
 * analytics sentence is there because the form's `booking_qualified` event
 * sends the two multiple-choice answers to Vercel Web Analytics (never the
 * name, email or notes); a notice that listed only our records and Cal.com
 * would leave that recipient out.
 */
export const BOOK_NOTICE =
  'We use your name, email, answers and notes to arrange and hold your free 20-minute session and ' +
  'follow up about it. We also note which page or link brought you here and your approximate country, ' +
  'to see where enquiries come from. Our website host works out the country from your IP address; we ' +
  'don’t save the IP. These details go to our own booking records and automation, and to Cal.com, ' +
  'which runs the booking page. Our site analytics also count your two multiple-choice answers, never ' +
  'your name, email or notes. Please don’t include health, financial or password details in your ' +
  'notes. Tell us any time if you want your details corrected or deleted.';

/**
 * The optional AI-training checkbox's label. It names exactly what is used
 * (three answers, never the name or email) and for what, and says it can be
 * withdrawn, because a consent is only valid for the purpose it states (s.6(1)).
 */
export const AI_TRAINING_LABEL =
  'Optional: let SheetFlow use my answers (business type, biggest gap and notes), with my name and ' +
  'email removed, to improve its AI assistants. I can withdraw this at any time.';

/**
 * The line under the checkbox. The form follows it with "See how withdrawing
 * works", linked to /privacy#ai-training, where withdrawal is explained.
 */
export const AI_TRAINING_HELP = 'Your booking is the same either way. To withdraw later, just tell us.';
