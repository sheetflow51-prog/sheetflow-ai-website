/**
 * Feature flags — build-time gates for sections whose real content is not yet
 * available.
 *
 * A section behind a flag is fully implemented and production-ready. The flag
 * only answers "may this render publicly yet?", which for the proof sections
 * means "do we have verified, permissioned customer evidence?".
 *
 * Flipping a flag must never require a component change. If enabling a flag
 * would force a redesign, the architecture is wrong — fix the component, not
 * the flag.
 *
 * Flags read from `NEXT_PUBLIC_*` env vars so a preview deployment can enable a
 * section without a code change. Absent env var → the safe default below.
 */

/** `true` only when the env var is explicitly the string `"true"`. */
function envFlag(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value === 'true';
}

export const features = {
  /**
   * Customer case studies with named companies and outcomes.
   * OFF: no case study has been verified and permissioned for publication.
   */
  caseStudies: envFlag(process.env.NEXT_PUBLIC_FEATURE_CASE_STUDIES, false),

  /**
   * Direct customer quotes attributed to a named person or role.
   * OFF: no testimonial has been collected with written permission.
   */
  testimonials: envFlag(process.env.NEXT_PUBLIC_FEATURE_TESTIMONIALS, false),

  /**
   * Client logo strip in the Hero.
   * OFF: no client has granted written logo usage permission.
   */
  trustLogos: envFlag(process.env.NEXT_PUBLIC_FEATURE_TRUST_LOGOS, false),

  /**
   * Aggregate outcome metrics ("X% more bookings", "Y hours saved").
   * OFF: no aggregate figure has been measured against a defined methodology.
   */
  results: envFlag(process.env.NEXT_PUBLIC_FEATURE_RESULTS, false),
} as const;

export type FeatureName = keyof typeof features;
