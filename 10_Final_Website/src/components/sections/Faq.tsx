'use client';

import { Plus } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { faqs } from '@/content/faq';

/**
 * Faq — the answers, in the markup answer engines can actually read.
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
  return (
    <section id="faq" className="section relative" aria-labelledby="faq-heading">
      <div className="container-edge">
        <div className="mb-12 max-w-3xl md:mb-16">
          <SectionHeader
            kicker="Questions"
            title={
              <span id="faq-heading">
                The things people ask{' '}
                <span className="text-ink-300">before they book.</span>
              </span>
            }
            description="Straight answers. If something here is unclear, the audit call is the place to dig into it."
          />
        </div>

        {/* Not a <dl>. A definition list requires <dt>/<dd> as direct children
            of the list (or of a <div> inside it), and a disclosure widget puts
            the question inside <summary> — which axe flags as two serious
            violations. Headings inside <summary> are valid, convey the same
            structure to assistive tech, and add the questions to the document
            outline, which is what a screen-reader user actually navigates. */}
        <ScrollReveal className="mx-auto max-w-3xl" y={24} duration={0.6} stagger={0.05}>
          <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {faqs.map((item) => (
              <details
                key={item.id}
                id={item.id}
                className="group py-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary
                  className="flex cursor-pointer list-none items-start justify-between gap-6 rounded-sm text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-bright"
                  data-cursor="hover"
                >
                  <h3 className="font-display text-[17px] font-semibold leading-snug text-white md:text-[19px]">
                    {item.question}
                  </h3>
                  <Plus
                    className="mt-1 h-4 w-4 shrink-0 text-ink-300 transition-transform duration-300 ease-cinematic group-open:rotate-45"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 max-w-2xl pr-10 text-[15px] leading-relaxed text-ink-200 text-pretty">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
