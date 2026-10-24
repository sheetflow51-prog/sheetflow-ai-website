/**
 * Premium Card Engine — the Liquid Glass elevation ladder.
 *
 * ## The defect this replaces
 *
 * `GlassCard` offers `default | feature | subtle | strong`, and RC3 measured
 * that three of those sit **within ~1.5% alpha of one another**. Stacking them
 * does not read as a hierarchy, which is why RC3 had to invent `.glass-elevated`
 * mid-phase to get one surface to look lifted. Four names, one depth.
 *
 * `VISUAL_DNA_V2.md` § 4.1 defines five tiers where alpha, blur **and** shadow
 * move together — one property alone does not read as depth — and § 4.2 defines
 * what makes the glass liquid rather than foggy:
 *
 *   1. `saturate(180%)` behind the blur. Glass that does not saturate is fog,
 *      and this is the single biggest difference between cheap and expensive.
 *   2. A specular top edge (`inset 0 1px 0`), alpha scaling with tier.
 *   3. A *graded* border — lighter at the top than the bottom. Flat borders
 *      read as strokes; graded borders read as edges.
 *
 * ## The one-tier-4 rule
 *
 * § 4.1: at most one `presented` surface per viewport. If two things are being
 * presented, nothing is. This is not enforceable in a type, so it is checked in
 * review — but the tier is named `presented` precisely so that writing two of
 * them in one section feels wrong while you are writing it.
 *
 * Server component. Zero JavaScript — `GlassCard`'s cursor-tracked highlight
 * needs a client boundary and a `mousemove` handler; this does not.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

/** 0 recessed · 1 flush · 2 raised · 3 lifted · 4 presented. */
export type Elevation = 0 | 1 | 2 | 3 | 4;

/** Literal map, not interpolation — see the note in `Ambient.tsx`. */
const ELEVATION_CLASS: Record<Elevation, string> = {
  0: 'vos-surface--e0',
  1: 'vos-surface--e1',
  2: 'vos-surface--e2',
  3: 'vos-surface--e3',
  4: 'vos-surface--e4',
};

export interface SurfaceProps extends React.HTMLAttributes<HTMLElement> {
  elevation?: Elevation;
  /** Animated border, travelling on hover/focus only. */
  beam?: boolean;
  /**
   * The 4px scan line. `VISUAL_DNA_V2.md` § 3.3 demotes this from v1's
   * "mandatory on every surface" to a mark meaning exactly one thing: a surface
   * the system is actively writing to.
   */
  live?: boolean;
  /** Renders as something other than a `div` — `article`, `li`, `figure`. */
  as?: 'div' | 'article' | 'section' | 'li' | 'figure';
}

export function Surface({
  elevation = 2,
  beam = false,
  live = false,
  as: Tag = 'div',
  className,
  children,
  ...props
}: SurfaceProps) {
  return (
    <Tag
      className={cn(
        'vos-surface',
        ELEVATION_CLASS[elevation],
        beam && 'border-beam',
        live && 'vos-surface--live',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
