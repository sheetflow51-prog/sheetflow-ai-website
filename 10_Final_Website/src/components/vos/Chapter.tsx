/**
 * Narrative Engine — the chapter, and the line that runs through all of them.
 *
 * ## The defect this exists against
 *
 * RC3 measured that five homepage sections were the same *object*. RC5 measured
 * the level above that: the homepage was nine **self-contained pages** stacked
 * on one route. Read off the 1440px capture, before this engine:
 *
 *   - Section joins carried **~275px of empty void** — two `.section` blocks
 *     each paying `clamp(64px, 9.5vw, 160px)` of symmetric padding, back to
 *     back, with a 1px divider in the middle that is invisible at rest.
 *   - Half the sections opened **centred** (Automation Universe, Infrastructure)
 *     and half opened **left** (Dashboard, Case Study, Craft), so the eye had no
 *     stable place to return to and the page had no reading order.
 *   - Nothing crossed a section boundary. Each ambient wash began and ended
 *     inside its own section, so every join read as a scene ending rather than
 *     as a scene changing.
 *
 * The consequence is the one the RC5 brief names: a visitor feels they are
 * moving between separate templates. That is a **page-level** failure, and no
 * amount of per-section redesign fixes it — which is why this is an engine
 * rather than nine more edits.
 *
 * ## What it does
 *
 * One rail runs down the page at the content column's left edge, crossing every
 * section boundary, and each chapter mounts a numbered node on it. The rail is
 * the same `Spine` engine `WorkflowPipeline` uses for its five stages — so the
 * line that numbers the chapters and the line the workflow stages hang off are
 * literally the same object, drawn by the same code. That is what makes the
 * page read as one continuous system rather than as nine drawings of one.
 *
 * The rail is **traced by the reader's own scroll progress**, per chapter, on
 * the compositor. Segments abut exactly because the rail spans each section's
 * full height *including its padding*, so consecutive chapters produce one
 * unbroken line rather than a dashed one.
 *
 * ## Why the head is owned here and not by the caller
 *
 * Every chapter opens identically — mark, kicker, headline, description, in
 * that order and that position — because the alternative was measured: nine
 * sections each composing their own header is exactly how the page ended up
 * with two different alignments and no shared rhythm. A rule in a document did
 * not prevent that. A component that emits the opening does.
 *
 * `VISUAL_DNA_V2.md` § 8.2 (editorial layout for narrative), § 8.3 (atmosphere
 * is budgeted, and the emotional arc is carried by the *sequence of tiers* down
 * the page — which is a property only something page-level can own).
 *
 * Server component. Zero JavaScript: the rail is CSS scroll-driven, the reveal
 * is `.reveal-view`, and the atmosphere is two radial gradients.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Ambient, type AmbientTier, type AmbientTone } from './Ambient';
import { Spine, SpineNode } from './Spine';

export interface ChapterProps {
  /** Fragment target. Kept from the pre-RC5 sections — these are linked. */
  id: string;
  /**
   * Two-digit chapter mark. Omitted by the two ends of the arc: the hero is the
   * title card and the closing CTA is the resolution, and numbering either
   * would imply the narrative continues past the thing that closes it.
   */
  mark?: string;
  kicker: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  tier?: AmbientTier;
  tone?: AmbientTone;
  grid?: boolean;
  /**
   * Suppresses the entrance reveal on the head.
   *
   * `.reveal-view` must never sit on an LCP candidate — an `opacity: 0`
   * headline delays LCP by the reveal delay, which is why RC2 abandoned reveals
   * on `/work`. Every chapter on the homepage is below the fold, so the default
   * is safe; this is the escape hatch for any placement that is not.
   */
  still?: boolean;
  /** Extra classes on the content column, not on the section. */
  className?: string;
  children: React.ReactNode;
}

export function Chapter({
  id,
  mark,
  kicker,
  title,
  description,
  tier = 'standard',
  tone = 'accent',
  grid = false,
  still = false,
  className,
  children,
}: ChapterProps) {
  /**
   * Every chapter is a *named* region, not a bare `<section>`.
   *
   * A `<section>` with no accessible name is generic to assistive technology —
   * it does not appear in a screen reader's landmark list at all, so a page of
   * nine of them offers no structural navigation. Before RC5 exactly one
   * homepage section carried `aria-labelledby`, hand-written; deriving the id
   * from the chapter's own `id` makes it true of all of them and impossible to
   * forget. `faq` still resolves to `faq-heading`, which is the id the FAQ
   * section wrote by hand, so nothing that referenced it has moved.
   */
  const headingId = `${id}-heading`;

  return (
    <section id={id} className="chapter" aria-labelledby={headingId}>
      <Ambient tier={tier} tone={tone} grid={grid} />

      {/* Spans the section's full height *including* its padding, which is the
          whole point: the rail has to cross the join, or the page is back to
          being a stack of separate drawings with a gap between each. */}
      <Spine variant="traced" className="chapter-rail" />

      <div className="container-edge">
        <div className={cn('chapter-content', className)}>
          <header className={cn('chapter-head', !still && 'reveal-view')}>
            <p className="chapter-kicker">
              {/* The node sits on the rail, not beside it. Same engine as the
                  workflow stations, so a chapter mark and a pipeline stage are
                  visibly the same kind of thing at two scales. */}
              <SpineNode className="chapter-node" />
              {mark ? <span className="chapter-mark">{mark}</span> : null}
              <span className="chapter-kicker-text">{kicker}</span>
            </p>

            <h2 id={headingId} className="chapter-title">
              {title}
            </h2>

            {description ? <p className="chapter-lede">{description}</p> : null}
          </header>

          {children}
        </div>
      </div>
    </section>
  );
}
