/**
 * Proof content — the single source of truth for every customer-facing claim.
 *
 * ## The rule this file enforces
 *
 * SheetFlow publishes no customer name, logo, quote, or metric that has not
 * been verified with the customer and permissioned in writing. That rule is
 * encoded in the types, not left to reviewer discipline:
 *
 * - Entries are a discriminated union on `status`.
 * - Only `status: 'verified'` entries carry claim fields (metric, quote, logo).
 *   A `status: 'pending'` entry has nowhere to put a metric — the type has no
 *   such field, so an unverified number cannot be typed into this file.
 * - The `published*()` selectors below are the ONLY export the UI may read.
 *   They return verified + permissioned entries, and only when the matching
 *   feature flag is on.
 *
 * `pending` entries exist for internal pipeline tracking. They are never
 * returned by a selector and must never be rendered.
 *
 * ## Adding a real customer
 *
 * 1. Confirm the figure with the customer and record how it was measured.
 * 2. Obtain written permission to publish name, logo, and quote.
 * 3. Change `status` to `'verified'` and fill the required fields.
 * 4. Enable the matching flag in `src/config/features.ts`.
 *
 * No component changes are required at any step.
 */

import { features } from '@/config/features';

/* ------------------------------------------------------------------ */
/* Verification                                                        */
/* ------------------------------------------------------------------ */

export interface Verification {
  /** How the claim was established — e.g. "Client-confirmed Stripe export". */
  source: string;
  /** ISO-8601 date the claim was last confirmed with the customer. */
  verifiedOn: string;
  /** How the figure was measured, including the comparison window. */
  methodology: string;
  /** Written permission to publish the customer's name, logo, and quote. */
  permission: 'granted';
}

/* ------------------------------------------------------------------ */
/* Case studies                                                        */
/* ------------------------------------------------------------------ */

interface CaseStudyBase {
  /** Stable key. Safe to use in URLs and as a React key. */
  slug: string;
  /** Business sector, e.g. "Dental clinic". Never identifies the client. */
  sector: string;
}

export interface VerifiedCaseStudy extends CaseStudyBase {
  status: 'verified';
  company: string;
  /** Descriptive location/scale line, e.g. "3 locations". */
  context: string;
  /** Headline outcome, e.g. "+38%". Must be covered by `verification`. */
  metric: string;
  /** What the metric measures, e.g. "more bookings in 60 days". */
  metricLabel: string;
  /** What SheetFlow actually deployed. */
  summary: string;
  verification: Verification;
}

export interface PendingCaseStudy extends CaseStudyBase {
  status: 'pending';
  /**
   * Internal reference only. Never rendered. Deliberately not named
   * `company` so it cannot be dropped into a customer-facing slot by
   * autocomplete.
   */
  internalRef: string;
  /** What is still outstanding before this can be published. */
  blockedOn: string;
}

export type CaseStudyEntry = VerifiedCaseStudy | PendingCaseStudy;

/**
 * Delivery pipeline.
 *
 * The four entries below were named by the founder as real engagements. They
 * could not be corroborated anywhere in this repository or the surrounding
 * workspace, so they are recorded as `pending` and carry no claims. They will
 * not render until each is confirmed and permissioned.
 */
export const caseStudies: CaseStudyEntry[] = [
  {
    status: 'pending',
    slug: 'r3s-realty',
    sector: 'Real estate',
    internalRef: 'R3S Realty',
    blockedOn: 'Engagement scope, measured outcome, and written permission.',
  },
  {
    status: 'pending',
    slug: 'saraswati-dental',
    sector: 'Dental clinic',
    internalRef: 'Saraswati Dental',
    blockedOn: 'Engagement scope, measured outcome, and written permission.',
  },
  {
    status: 'pending',
    slug: 'sparc-physiotherapy',
    sector: 'Physiotherapy',
    internalRef: 'Sparc Physiotherapy',
    blockedOn: 'Engagement scope, measured outcome, and written permission.',
  },
  {
    status: 'pending',
    slug: 'elevate-wpc',
    sector: 'Building materials',
    internalRef: 'Elevate WPC',
    blockedOn: 'Engagement scope, measured outcome, and written permission.',
  },
];

/* ------------------------------------------------------------------ */
/* Testimonials                                                        */
/* ------------------------------------------------------------------ */

export interface VerifiedTestimonial {
  status: 'verified';
  slug: string;
  /** Verbatim. Never paraphrased, tightened, or composed. */
  quote: string;
  /** Attribution, e.g. "Practice Manager". */
  role: string;
  company: string;
  verification: Verification;
}

export interface PendingTestimonial {
  status: 'pending';
  slug: string;
  internalRef: string;
  blockedOn: string;
}

export type TestimonialEntry = VerifiedTestimonial | PendingTestimonial;

export const testimonials: TestimonialEntry[] = [];

/* ------------------------------------------------------------------ */
/* Trust logos                                                         */
/* ------------------------------------------------------------------ */

export interface VerifiedTrustLogo {
  status: 'verified';
  slug: string;
  name: string;
  /** Path under `public/trust/`. Monochrome SVG, paths on `currentColor`. */
  src: string;
  /** Intrinsic width/height, for layout stability. */
  width: number;
  height: number;
  /** Written logo-usage permission is mandatory. */
  verification: Verification;
}

export interface PendingTrustLogo {
  status: 'pending';
  slug: string;
  internalRef: string;
  blockedOn: string;
}

export type TrustLogoEntry = VerifiedTrustLogo | PendingTrustLogo;

export const trustLogos: TrustLogoEntry[] = [];

/* ------------------------------------------------------------------ */
/* Aggregate results                                                   */
/* ------------------------------------------------------------------ */

export interface VerifiedResult {
  status: 'verified';
  slug: string;
  /** e.g. "3,400" */
  value: string;
  /** e.g. "leads captured across all deployments" */
  label: string;
  verification: Verification;
}

export type ResultEntry = VerifiedResult;

export const results: ResultEntry[] = [];

/* ------------------------------------------------------------------ */
/* Selectors — the only surface the UI may consume                     */
/* ------------------------------------------------------------------ */

const isVerified = <T extends { status: string }>(
  entry: T,
): entry is Extract<T, { status: 'verified' }> => entry.status === 'verified';

export function publishedCaseStudies(): VerifiedCaseStudy[] {
  if (!features.caseStudies) return [];
  return caseStudies.filter(isVerified);
}

export function publishedTestimonials(): VerifiedTestimonial[] {
  if (!features.testimonials) return [];
  return testimonials.filter(isVerified);
}

export function publishedTrustLogos(): VerifiedTrustLogo[] {
  if (!features.trustLogos) return [];
  return trustLogos.filter(isVerified);
}

export function publishedResults(): VerifiedResult[] {
  if (!features.results) return [];
  return results.filter(isVerified);
}
