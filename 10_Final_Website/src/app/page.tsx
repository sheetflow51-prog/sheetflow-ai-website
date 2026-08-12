import { Hero } from '@/components/sections/Hero';
import { AutomationUniverse } from '@/components/sections/AutomationUniverse';
import { AIInfrastructure } from '@/components/sections/AIInfrastructure';
import { WorkflowPipeline } from '@/components/sections/WorkflowPipeline';
import { CaseStudy } from '@/components/sections/CaseStudy';
import { DigitalCraft } from '@/components/sections/DigitalCraft';
import { AIDashboard } from '@/components/sections/AIDashboard';
import { Terms } from '@/components/sections/Terms';
import { Faq } from '@/components/sections/Faq';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { JsonLd } from '@/components/seo/JsonLd';
import { homeGraph } from '@/lib/structured-data';
import { liveProjects, toCard } from '@/content/work';

/**
 * The homepage — one narrative in ten beats.
 *
 * ## What this file used to be
 *
 * Nine sections in an order nobody could state, separated by nine
 * `<SectionHandoff />` elements. Each handoff was a client component running
 * `useScroll` + `useVelocity` + `useSpring` + three `useTransform`s to glow a
 * 1px line in proportion to scroll velocity — **nine scroll subscriptions on
 * one route**, for a divider that is invisible at rest and, at speed, is behind
 * whatever the reader is moving past.
 *
 * They are gone. The join between two chapters is now the narrative rail
 * crossing it, which is visible at every scroll velocity including zero, and
 * costs no JavaScript at all.
 *
 * ## The order, and why it changed
 *
 * The arc is the one the RC5 brief specifies: **what SheetFlow is → how the
 * automation works → proof → results → pricing → booking.** Read as chapters:
 *
 * ```
 *        Hero            what this is
 *   01   Universe        what we automate          ┐
 *   02   Infrastructure  wired into your stack     ├ how
 *   03   The Run         one lead, end to end      ┘
 *   04   Case studies    proof
 *   05   Digital Craft   everything else we build
 *   06   The report      results
 *   07   The terms       pricing
 *   08   Questions       the objections
 *        Final CTA       booking
 * ```
 *
 * Three changes from the pre-RC5 order, each recorded with its reasoning in
 * `docs/RC5_NARRATIVE.md` § 2:
 *
 *   1. **Infrastructure moved up**, from eighth to second. "Which of my tools
 *      does this touch" is a question asked *before* "how does it work", not
 *      after the case studies.
 *   2. **The report moved down**, from third to sixth. It is the *result* of
 *      the run, and it was being shown two chapters before the run existed.
 *   3. **`FeatureStorytelling` was removed.** Its six pillars — capture,
 *      respond, book, sync, report, trust — restated the six automations in
 *      chapter 01 and the five stages in chapter 03 for a third time, in a grid
 *      of six rectangles. Its one non-duplicate claim, about ownership and
 *      lock-in, moved verbatim into chapter 07, where it is a statement about
 *      terms rather than a sixth pillar.
 *
 * `Terms` is new, and is the beat the brief names that the page did not have.
 *
 * ## Atmosphere
 *
 * Each chapter's ambient tier comes from `content/narrative.ts`, which holds
 * the whole arc in reading order. That is deliberate: `VISUAL_DNA_V2.md` § 8.3
 * promises the emotional arc is carried by the *sequence* of tiers, and a
 * sequence is not a property of any one section.
 */

export default function HomePage() {
  return (
    <>
      {/* One linked @graph rather than four loose blocks. Every node carries an
          @id and references the others, so a consumer resolves the whole entity
          set — organisation, site, page, questions — in a single pass instead
          of guessing how separate blocks relate. Emitted per route, not from
          the layout: a sub-page needs its own WebPage and its own questions. */}
      <JsonLd graph={homeGraph()} />

      <Hero />

      <AutomationUniverse />
      <AIInfrastructure />
      <WorkflowPipeline />

      {/* Narrowed here, on the server, and kept that way now the section is no
          longer a client component: `/work`'s corpus is 100 kB of prose and
          this needs three cards from it. */}
      <CaseStudy cards={liveProjects().map(toCard)} />
      <DigitalCraft />

      <AIDashboard />
      <Terms />

      {/* Second to last, deliberately: objections are answered at the moment a
          visitor is deciding, and the section doubles as the page's
          answer-engine surface. */}
      <Faq />
      <FinalCTA />
    </>
  );
}
