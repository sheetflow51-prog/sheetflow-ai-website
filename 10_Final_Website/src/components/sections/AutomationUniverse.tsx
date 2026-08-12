import { Chapter } from '@/components/vos';
import { beat } from '@/content/narrative';
import { UniverseStage } from './UniverseStage';

/**
 * The Automation Universe — chapter 01, and the site's signature diagram.
 *
 * ## What it replaced
 *
 * `WorkflowUniverse` rendered these same six automations as six identical
 * cards: a lucide icon in a rounded square, a title, a body paragraph and a
 * corner gradient glow. Four other homepage sections rendered the *same object*
 * (`docs/RC3_MOODBOARD.md` § 1), so a visitor scrolling the page met that
 * rectangle more than twenty-five times. The copy changed; the visual system
 * did not.
 *
 * This shows the automations as what they actually are — six systems feeding
 * one intelligence core — instead of describing them in prose.
 *
 * ## What RC5 changed
 *
 * Two things, neither of them the diagram, which was already correct.
 *
 * **The head.** It opened centred, and half the page's other sections opened
 * left. `Chapter` now emits every head identically, so the reading order the
 * page is supposed to have has somewhere to start.
 *
 * **The boundary.** This file was `'use client'` in its entirety, so the
 * headline, the description and the six bodies of copy were all in the client
 * bundle in order that one `useState` could hold which node is lit. The
 * interactive diagram moved to `UniverseStage`; everything above it is now
 * server-rendered.
 */

export function AutomationUniverse() {
  const { mark, tier, tone, grid } = beat('workflows');

  return (
    <Chapter
      id="workflows"
      mark={mark}
      tier={tier}
      tone={tone}
      grid={grid}
      kicker="What we automate"
      title={
        <>
          Six automations that quietly{' '}
          <span className="text-ink-300">run your business.</span>
        </>
      }
      description="Real systems for real businesses — not abstract AI. Each one removes hours of manual work every week and gives you back focus, customers, and revenue."
    >
      <UniverseStage />

      <p className="mt-10 max-w-md text-[13px] text-ink-400">
        Need something specific? We build custom automations around how your team already works.
      </p>
    </Chapter>
  );
}
