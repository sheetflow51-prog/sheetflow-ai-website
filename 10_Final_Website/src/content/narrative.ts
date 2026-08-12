/**
 * The homepage arc.
 *
 * ## Why this is one table and not nine props
 *
 * `VISUAL_DNA_V2.md` § 8.3 replaced v1's *"every page has all four atmospheric
 * layers active"* with a budget, and made a specific promise about what
 * replaces it: the emotional arc is *"carried by the **sequence of tiers**
 * down the page rather than by every section paying the maximum"*.
 *
 * A sequence is not a property of any one section. If each section declares its
 * own tier next to its own copy, nobody is ever looking at the sequence — and
 * the failure mode is silent, because every individual choice looks reasonable
 * and the page still ends up flat. So the tiers live here, in reading order,
 * where the arc is the thing you see.
 *
 * The copy stays with the section that publishes it. This table holds only what
 * is a statement about the *page*: where a beat sits, what it is numbered, and
 * how much atmosphere it is allowed to spend.
 *
 * ## Reading the arc
 *
 * ```
 *   hero        full    ████████
 *   01 automate standard ████
 *   02 stack    quiet    ██
 *   03 run      standard ████
 *   04 proof    quiet    ██
 *   05 build    standard ████
 *   06 results  quiet    ██
 *   07 terms    standard ████
 *   08 answers  quiet    ██
 *   close       full    ████████
 * ```
 *
 * Bright, then held, then bright — with the two `full` tiers at the ends, which
 * is the shape § 8.3 names ("Hero, Final CTA — the two ends of the arc"). The
 * alternation is what gives the page a pulse; nine `standard` sections would
 * satisfy the budget and read as one long corridor.
 *
 * ## Order
 *
 * What SheetFlow is → how the automation works → proof → results → pricing →
 * booking. Two beats changed position in RC5 and one was removed; both are
 * recorded in `docs/RC5_NARRATIVE.md` § 2 with the reasoning.
 */

import type { AmbientTier, AmbientTone } from '@/components/vos';

export interface Beat {
  /** Fragment target. These are linked from the nav, the footer and `/services`. */
  id: string;
  /**
   * The chapter mark, as published.
   *
   * Absent on the two ends: the hero is the title card and the closing CTA is
   * the resolution. Numbering either would imply the narrative continues past
   * the thing that closes it.
   */
  mark?: string;
  tier: AmbientTier;
  tone: AmbientTone;
  grid?: boolean;
}

const ARC: Beat[] = [
  { id: 'hero', tier: 'full', tone: 'accent' },
  { id: 'workflows', mark: '01', tier: 'standard', tone: 'accent', grid: true },
  { id: 'integrations', mark: '02', tier: 'quiet', tone: 'accent' },
  { id: 'how-it-works', mark: '03', tier: 'standard', tone: 'dual', grid: true },
  { id: 'customers', mark: '04', tier: 'quiet', tone: 'accent' },
  { id: 'build', mark: '05', tier: 'standard', tone: 'accent' },
  { id: 'reports', mark: '06', tier: 'quiet', tone: 'accent' },
  // The one gold-toned beat on the page. § 2: gold is the system having
  // worked — and the terms are where the visitor decides it has.
  { id: 'pricing-beat', mark: '07', tier: 'standard', tone: 'gold' },
  { id: 'faq', mark: '08', tier: 'quiet', tone: 'accent' },
  { id: 'contact', tier: 'full', tone: 'dual' },
];

const BY_ID = new Map(ARC.map((b) => [b.id, b]));

/**
 * The beat for a section.
 *
 * Throws on an unknown id rather than falling back to a default. A section that
 * has quietly dropped out of the arc — renamed, or added without being placed —
 * would otherwise render with plausible atmosphere and no chapter mark, which
 * looks like a styling accident rather than like the missing table row it is.
 * This is a build-time failure on a statically rendered route.
 */
export function beat(id: string): Beat {
  const found = BY_ID.get(id);
  if (!found) {
    throw new Error(
      `No narrative beat for section "${id}". Add it to ARC in content/narrative.ts, ` +
        `in the position it is read.`,
    );
  }
  return found;
}

/** The arc, in reading order. For the docs and the narrative test. */
export function arc(): readonly Beat[] {
  return ARC;
}
