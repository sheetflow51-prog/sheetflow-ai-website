/**
 * Parallax Engine — depth without a scroll listener.
 *
 * ## What it replaces
 *
 * `components/motion/Parallax.tsx` is `useScroll` + `useSpring` (stiffness 120,
 * damping 24) + three `useTransform`s, re-rendering React on every scroll frame
 * to push a new `y`. On the hero it wrapped the full-bleed ambient core, so the
 * single largest painted element on the site was being repositioned from the
 * main thread — which is already 73–91% paint on this build.
 *
 * This is the same visual from `animation-timeline: view()` driving a
 * `translateY`. No listener, no spring, no measurement, no re-render, and no
 * JavaScript: the compositor owns it, so it cannot compete with paint.
 * `VISUAL_DNA_V2.md` § 7.2 makes that the rule rather than a one-off.
 *
 * ## The degradation, which is the opposite of `Spine`'s
 *
 * `Spine` rests **finished**, because a rail stranded at `scaleY(0)` is an
 * invisible rail. This rests **neutral** — `translateY(0)` — because the
 * finished state of a parallax is an element pushed off its layout position,
 * and shipping that statically to every unsupported browser would misalign the
 * composition rather than merely un-animate it.
 *
 * Both are the same principle applied honestly: degrade to the state that is
 * *correct without motion*, which is not always the animation's end frame.
 *
 * Server component. Zero JavaScript.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DriftProps {
  /**
   * Total vertical travel across the element's pass through the viewport, in
   * px. Positive drifts downward (the element lags the scroll, reading as
   * *behind*); negative drifts upward (it leads, reading as *in front*).
   *
   * Kept small on purpose. § 7.1's motion budget is per viewport, and a
   * background layer travelling far enough to notice is a background layer
   * competing with the text in front of it.
   */
  range?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function Drift({ range = 80, className, style, children }: DriftProps) {
  return (
    <div
      className={cn('vos-drift', className)}
      style={
        {
          '--vos-drift-from': `${range / 2}px`,
          '--vos-drift-to': `${-range / 2}px`,
          ...style,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
