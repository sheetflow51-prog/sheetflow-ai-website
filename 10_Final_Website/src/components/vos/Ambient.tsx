/**
 * Ambient Background Engine.
 *
 * `VISUAL_DNA_V2.md` § 8.3 replaces v1's *"every page has all four atmospheric
 * layers active; removing any one breaks the brand"* with a budget. v1 mandated
 * a cost it never priced: paint and compositing measure 73–91% of the main
 * thread, and the homepage scores 52 on mobile Lighthouse, attributed to the
 * hero's ambient layers.
 *
 * A section now declares the atmosphere it needs, and the emotional arc v1
 * § 6.7 describes is carried by the *sequence of tiers* down the page rather
 * than by every section paying for the maximum.
 *
 * Zero JavaScript: one `aria-hidden` div, everything else in the stylesheet.
 */

import { cn } from '@/lib/utils';

/** How much atmosphere this section is paying for. */
export type AmbientTier = 'full' | 'standard' | 'quiet';

/** Which direction the light comes from, and in which brand colour. */
export type AmbientTone = 'accent' | 'gold' | 'dual';

/**
 * Class names are written out rather than interpolated.
 *
 * Tailwind tree-shakes custom rules in `@layer components` whose selectors its
 * content scanner cannot find, and a template literal produces a class name
 * that is a literal in no source file. RC4 shipped exactly that bug: five
 * wireframe fill rules were dropped from the stylesheet and every shape fell
 * back to SVG's default black. It compiled and type-checked; only a screenshot
 * showed it.
 */
const TIER_CLASS: Record<AmbientTier, string> = {
  full: 'vos-ambient--full',
  standard: 'vos-ambient--standard',
  quiet: 'vos-ambient--quiet',
};

const TONE_CLASS: Record<AmbientTone, string> = {
  accent: 'vos-ambient--accent',
  gold: 'vos-ambient--gold',
  dual: 'vos-ambient--dual',
};

export interface AmbientProps {
  tier?: AmbientTier;
  tone?: AmbientTone;
  /** Adds the page-wide grid backdrop behind the wash. */
  grid?: boolean;
  className?: string;
}

export function Ambient({
  tier = 'standard',
  tone = 'accent',
  grid = false,
  className,
}: AmbientProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'vos-ambient',
        TIER_CLASS[tier],
        TONE_CLASS[tone],
        grid && 'vos-ambient--grid',
        className,
      )}
    />
  );
}
