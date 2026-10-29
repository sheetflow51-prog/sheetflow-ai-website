import { Plus } from 'lucide-react';
import { Chapter, Surface } from '@/components/vos';
import { beat } from '@/content/narrative';
import { faqs } from '@/content/faq';

/**
 * Faq — chapter 08. The answers, in the markup answer engines can actually read.
 *
 * Server-rendered as of RC5. It was `'use client'` only for `ScrollReveal`, and
 * an accordion whose entire value is that *"the answer text is in the DOM
 * whether or not JavaScript ran"* had no business needing JavaScript to fade
 * itself in.
 *
 * Built on native `<details>/<summary>` rather than a JS disclosure widget:
 *
 *   - The answer text is in the DOM whether or not the panel is open, and
 *     whether or not JavaScript ran, so crawlers and LLM retrievers see it.
 *   - Keyboard support, focus handling and the expanded/collapsed state are
 *     the browser's, so they cannot drift out of sync with ARIA the way a
 *     hand-rolled accordion does.
 *   - Find-in-page opens the matching panel automatically.
 *
 * The matching FAQPage JSON-LD is emitted from the same `faqs` array in
 * layout.tsx, so structured data and visible copy cannot disagree.
 *
 * Each item carries a stable id, making individual answers linkable — which is
 * also what lets a search result deep-link to one.
 */
export function Faq() {
  const { mark, tier, tone, grid } = beat('faq');

  return (
    <Chapter
      id="faq"
      mark={mark}
      tier={tier}
      tone={tone}
      grid={grid}
      kicker="Questions"
      /* The `faq-heading` id this section used to write by hand is now emitted
         by `Chapter`, derived from the chapter id — so it is unchanged here and
         true of the other eight chapters too. */
      title={
        <>
          The things people ask{' '}
          <span className="text-ink-300">before they book.</span>
        </>
      }
      description="Straight answers. If something here is unclear, just ask us in a free 20-minute session and we will work through it with you."
    >
      {/* Not a <dl>. A definition list requires <dt>/<dd> as direct children
          of the list (or of a <div> inside it), and a disclosure widget puts
          the question inside <summary> — which axe flags as two serious
          violations. Headings inside <summary> are valid, convey the same
          structure to assistive tech, and add the questions to the document
          outline, which is what a screen-reader user actually navigates. */}
      {/* On a `Surface`, as of RC6.

          The markup is unchanged — this is still eight `<details>` and the
          reasons above still hold. What changed is that the list was a
          hairline-divided column sitting directly on the void, which is the
          one chapter subject on the page with no surface of its own. Next to
          the pricing cards immediately above it, the section that answers
          every remaining objection read as the least finished thing on the
          page, and the eight rows read as text rather than as controls.

          `elevation={1}` deliberately, not higher: § 4.1 allows one presented
          surface per viewport and the recommended tier three hundred pixels
          up is already spending it. A flush surface is enough to make the
          block an object. */}
      <Surface elevation={1} className="chapter-stage reveal-view faq-panel max-w-3xl">
        {faqs.map((item) => (
          <details
            key={item.id}
            id={item.id}
            className="faq-item group [&_summary::-webkit-details-marker]:hidden"
          >
            <summary
              className="flex cursor-pointer list-none items-start justify-between gap-6 rounded-sm text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-bright"
              data-cursor="hover"
            >
              <h3 className="font-display text-[17px] font-semibold leading-snug text-white transition-colors duration-200 group-hover:text-accent-light md:text-[19px]">
                {item.question}
              </h3>
              <Plus
                className="mt-1 h-4 w-4 shrink-0 text-ink-300 transition-[transform,color] duration-300 ease-cinematic group-hover:text-accent-bright group-open:rotate-45"
                strokeWidth={2}
                aria-hidden="true"
              />
            </summary>
            <p className="mt-3 max-w-2xl pr-10 text-[15px] leading-relaxed text-ink-200 text-pretty">
              {item.answer}
            </p>
          </details>
        ))}
      </Surface>
    </Chapter>
  );
}
