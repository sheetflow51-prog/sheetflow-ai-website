/**
 * Animated Pipeline Engine — the traced spine.
 *
 * ## The idea, and where it comes from
 *
 * Aceternity UI's **Tracing Beam** is the canonical "a beam traces the journey
 * as you scroll" pattern, and it is the right idea for any sequence a visitor
 * reads in order. Its implementation was retrieved and read.
 *
 * It runs on `useScroll` + two `useTransform`s + two `useSpring`s (stiffness
 * 500, damping 90), plus a `useState`/`useEffect` pair that measures the
 * content's height to size the SVG viewBox, and it re-renders React on every
 * scroll frame to push new `y1`/`y2` gradient coordinates.
 *
 * ## What this does instead
 *
 * The same visual, from `animation-timeline: view()` driving a `scaleY` on a
 * single element. That means:
 *
 *   - **no scroll listener** — the compositor owns it, so it cannot jank the
 *     main thread and does not compete with paint, which is already 73–91% of
 *     this site's main-thread time;
 *   - **no measurement** — `view()` derives its own range from the element's
 *     position in the scrollport, so there is no `svgHeight` state, no
 *     `ResizeObserver`, and nothing to re-measure when content reflows;
 *   - **no JavaScript at all** — this is a server component.
 *
 * `VISUAL_DNA_V2.md` § 7.2 makes this the rule rather than a one-off: scroll-
 * coupled motion is authored in CSS, and a scroll listener now needs written
 * justification. Support is Chrome/Edge 115+, Firefox 132+, Safari 18+.
 *
 * ## The degradation, which is the part that usually goes wrong
 *
 * The beam's resting state is **fully traced** (`scaleY(1)`), and the animation
 * — which starts at 0 — applies only inside `@supports (animation-timeline:
 * view())`. Where the feature is missing the rule never matches, so the spine
 * renders complete and static.
 *
 * This is deliberate and is the opposite of the usual mistake. Defaulting the
 * beam to `scaleY(0)` and animating it up would leave the rail **invisible** on
 * every unsupported browser — a section held permanently mid-reveal, which is
 * exactly the failure `MOTION_INVENTORY.md` § 7 documents from RC2.
 */

import { cn } from '@/lib/utils';

export interface SpineProps {
  /**
   * `traced` runs the scroll-driven beam. `static` draws the rail only — for
   * sequences short enough that the whole thing is on screen at once, where a
   * beam would trace something the eye has already finished reading.
   */
  variant?: 'traced' | 'static';
  className?: string;
}

const VARIANT_CLASS = {
  traced: 'vos-spine--traced',
  static: 'vos-spine--static',
} as const;

/**
 * The rail. Absolutely positioned — the consumer supplies a positioned
 * ancestor and the horizontal offset, because where the rail sits relative to
 * the content is a layout decision, not the engine's.
 */
export function Spine({ variant = 'traced', className }: SpineProps) {
  return (
    <span aria-hidden="true" className={cn('vos-spine', VARIANT_CLASS[variant], className)}>
      <span className="vos-spine-beam" />
    </span>
  );
}

/**
 * A station on the rail.
 *
 * Deliberately **not** animated. A traced beam plus a per-node reveal plus a
 * travelling packet is three motions on one object, which spends the entire
 * per-viewport budget (`VISUAL_DNA_V2.md` § 7.1) on a single rail and leaves
 * nothing for the section's ambient layer. The beam is the motion; the nodes
 * are structure.
 */
export function SpineNode({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('vos-spine-node', className)} />;
}
