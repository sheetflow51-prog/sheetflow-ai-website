import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ExternalLink } from 'lucide-react';

import { JsonLd } from '@/components/seo/JsonLd';
import { ServiceBreadcrumb } from '@/components/sections/ServiceBreadcrumb';
import { Button } from '@/components/ui/Button';
import { SectionHandoff } from '@/components/signature/SectionHandoff';
import { WorkflowGlyph } from '@/components/work/WorkflowGlyph';
import { projects, INTERNAL_ONLY_LABEL } from '@/content/work';

/** The short marker a card carries, by evidence kind and origin. */
function cardMarker(p: (typeof projects)[number]): string {
  if (p.evidence.kind === 'internal') return INTERNAL_ONLY_LABEL;
  return p.evidence.origin === 'demonstration' ? 'Demonstration · not commissioned' : 'Client build · not named';
}
import { dashboardStories } from '@/content/dashboards';
import { DashboardStories } from '@/components/sections/DashboardStories';
import { workIndexGraph } from '@/lib/structured-data';
import { cn } from '@/lib/utils';

/**
 * `/work` — the case study index.
 *
 * ## What this page is allowed to say
 *
 * Publication permission was granted by the founder on 2026-08-07 with an
 * explicit boundary (D24): company names, screenshots, project links,
 * architecture and implementation detail are permitted; revenue, conversion,
 * ROI, customer metrics, testimonials and timelines are not. The boundary is
 * enforced in `content/work.ts` by the `ProjectOutcome` union — an undisclosed
 * outcome has no field a number can be written into.
 *
 * The consequence for this page is that it sells on **engineering**, not on
 * results. Every card leads with what was built and links to the running
 * deployment, so a visitor can verify the claim by clicking it rather than
 * trusting a figure.
 */

export const metadata: Metadata = {
  title: 'Client work',
  description:
    'Production websites and automation systems SheetFlow has built and deployed, presented as industry archetypes — the architecture, the stack and the engineering decisions behind each one. Client identities are withheld.',
  alternates: { canonical: '/work' },
  openGraph: {
    title: 'Client work · SheetFlow AI',
    description:
      'Production websites and automation systems SheetFlow has built and deployed, with the architecture and engineering decisions behind each.',
    url: '/work',
    type: 'website',
  },
};

export default function WorkIndexPage() {
  return (
    <>
      <JsonLd graph={workIndexGraph()} />

      <section className="section pt-28 md:pt-36" aria-labelledby="work-heading">
        <div className="container-edge">
          <ServiceBreadcrumb
            trail={[
              { name: 'Home', href: '/' },
              { name: 'Work', href: '/work' },
            ]}
          />

          <div className="max-w-4xl">
            <span className="kicker">Selected work</span>
            <h1 id="work-heading" className="headline-cinematic text-fade text-balance mt-5">
              Built, deployed, and still running.
            </h1>
            <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-ink-200 text-pretty md:text-[19px]">
              Client systems shown as industry archetypes, with the business unnamed and every
              identifying detail redacted; demonstration builds we made uncommissioned; and the
              internal systems behind them — a double-entry ledger, a CNC production pipeline,
              an outbound engine. Each case study covers the architecture, the stack and the
              decisions, and says plainly which of the three it is.
            </p>
          </div>

          {/* `min-w-0` on the grid item is load-bearing below 480px.
              A grid item defaults to `min-width: auto`, so the column cannot
              size below the widest item's min-content — and one internal-build
              tile lists `scripts/lead_pipeline_manager.py — 446 lines` with
              `truncate`, which is `white-space: nowrap` and therefore has a
              317px min-content. That pinned the whole column at 431px, so on a
              390px phone **every card** on this page overflowed its container
              by 89px and was silently cut off by an ancestor's `overflow-x:
              clip`. No scrollbar appeared, which is why it survived four
              phases of review. */}
          <div className="mt-16 grid gap-5 lg:grid-cols-2">
            {projects.map((p, i) => (
              /* RC3: `reveal-view` is the entrance choreography RC2 planned and
                 abandoned. Its objection stands and is designed around rather
                 than ignored.

                 RC2's finding was that an `opacity: 0` headline delays LCP by
                 the reveal delay, and `/work` already measures LCP at 4.7s on
                 mobile. The headline is not the only LCP candidate here: the
                 first cards carry 1280×800 screenshots, and the top row can
                 straddle the fold. So the first two cards — the whole top row at
                 `lg:grid-cols-2`, and more than a phone shows — are excluded and
                 render exactly as they do today. Nothing that can be painted in
                 the initial viewport ever starts transparent.

                 The rest is pure CSS behind `@supports (animation-timeline:
                 view())`: no JavaScript, no observer, and no path on which an
                 element is stranded invisible, because where the feature is
                 unsupported the rule never applies at all. See `globals.css`. */
              <article key={p.slug} className={cn('group min-w-0', i >= 2 && 'reveal-view')}>
                <Link
                  href={`/work/${p.slug}`}
                  className="card-interactive flex h-full flex-col overflow-hidden"
                  data-cursor="hover"
                  aria-labelledby={`work-card-${p.slug}`}
                >
                  {/* Fixed aspect ratio across every card, so the grid cannot
                      reflow when one screenshot is taller than another. The
                      stored frames are all 1280x800; this enforces it in CSS
                      as well, rather than trusting the assets to stay uniform. */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-white/[0.06]">
                    {p.evidence.kind === 'confidential' && p.evidence.shot ? (
                      <>
                        <Image
                          src={p.evidence.shot.src}
                          alt={p.evidence.shot.alt}
                          fill
                          sizes="(min-width: 1024px) 46vw, 92vw"
                          className="object-cover object-top transition-transform duration-700 ease-cinematic group-hover:scale-[1.02]"
                        />
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent"
                        />
                        {/* The demonstration marker rides on the card, not just
                            the case study. A visitor scanning the grid should
                            not have to open a page to learn that this build was
                            never commissioned — that is exactly the impression
                            a portfolio grid creates by default. */}
                        <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-void/80 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur-sm">
                          {p.evidence.origin === 'demonstration' ? 'Demonstration' : 'Client · not named'}
                        </span>
                      </>
                    ) : (
                      /* Internal builds have no screenshot, by construction —
                         there is no deployment to capture. Rather than staging
                         a mockup of a system that has no interface, the tile
                         draws the pipeline the system runs and names what it is
                         made of. Every figure here comes from the artifact
                         ledger on the case study.

                         RC2 replaced a three-line file list in an otherwise
                         empty box. Measured on the running build, that layout
                         left the 16:10 media area ~90% empty, so five of the
                         ten cards on this page read as broken beside five
                         finished ones — see `docs/RC2_VISUAL_AUDIT.md` § V1. The
                         evidence was not dropped for the diagram: the artifact
                         count and the top file still render below it. */
                      /* Colours here are contrast-constrained, not chosen. The
                         first version used `text-ink-400` and
                         `text-accent-bright/70` — the same tokens the homepage
                         card uses — and axe failed it at [serious]. The
                         `bg-white/[0.02]` tint raises the background luminance,
                         which lowers the ratio for light text rather than
                         raising it. Both were lifted to tokens that clear AA
                         on this surface. */
                      <div className="relative flex h-full flex-col justify-between bg-white/[0.02] p-6 sm:p-7">
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 signature-grid opacity-60"
                        />
                        <span className="relative font-mono text-[10px] uppercase tracking-widest text-ink-200">
                          {cardMarker(p)}
                        </span>

                        {/* The glyph centres in whatever space the label and
                            the artifact line leave, rather than being one of
                            three items a `justify-between` spreads to the
                            edges — which left ~90px of dead box under the
                            labels and reproduced, in miniature, the emptiness
                            this diagram was added to fix. */}
                        <div className="relative flex flex-1 items-center py-4">
                          <WorkflowGlyph
                            stages={p.architecture}
                            variant="tile"
                            label={`${p.client} pipeline stages`}
                          />
                        </div>

                        {/* `min-w-0` for the same reason one level down:
                            `truncate` cannot ellipsis until its box is allowed
                            to be narrower than its text. Without it this line
                            sets the card's min-content instead of adapting to
                            it, which is what once forced the column to 431px
                            and clipped every card on every phone. */}
                        <p className="relative min-w-0 truncate font-mono text-[11px] text-accent-bright">
                          {p.evidence.kind === 'internal'
                            ? `${p.evidence.artifacts.length} source artifacts · ${p.evidence.artifacts[0].name}`
                            : `${p.sector} · screenshot withheld`}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-7">
                    <span className="kicker-bare">
                      {p.kicker}
                    </span>
                    <h2
                      id={`work-card-${p.slug}`}
                      className="font-display text-[22px] font-semibold leading-snug text-white"
                    >
                      {p.client}
                    </h2>
                    <p className="text-[15px] leading-relaxed text-ink-300 text-pretty">
                      {p.lede}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-3 text-[13px] text-white/80">
                      Read the case study
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-300 ease-cinematic group-hover:translate-x-1"
                        strokeWidth={2.2}
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* Stated on the index rather than only on each case study. A visitor
              scanning the grid for numbers should find out here why there are
              none, instead of concluding we simply forgot to include them. */}
          <p className="mt-12 max-w-2xl border-l border-white/[0.08] pl-5 text-[13px] leading-relaxed text-ink-300">
            No outcome figures appear on these pages. SheetFlow publishes a result only once it
            has been measured against a stated method and confirmed with the client in writing.
            Where that has not happened, the case study says{' '}
            <span className="text-white/80">Not publicly disclosed</span> rather than estimating.
          </p>
        </div>
      </section>

      <SectionHandoff />

      {/* Dashboards, shown as they run. One story per interface; each carries its own data-basis line. */}
      <section id="dashboards" className="section" aria-labelledby="stories-heading">
        <div className="container-edge">
          <span className="kicker">Inside the dashboards</span>
          <h2 id="stories-heading" className="headline-section text-fade text-balance mt-5 max-w-3xl">
            Four interfaces, shown as they run.
          </h2>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-300 text-pretty">
            A clinic CRM, a luxury storefront&apos;s back office, a developer&apos;s site and our own control
            tower. Each says whose data it is, and none of them shows a result we have not measured.
          </p>
          <div className="mt-14">
            <DashboardStories stories={dashboardStories} />
          </div>
        </div>
      </section>

      <SectionHandoff />

      <section className="section" aria-labelledby="work-cta-heading">
        <div className="container-edge">
          <div className="cta-panel">
            <h2 id="work-cta-heading" className="headline-section text-fade text-balance max-w-3xl">
              Your business, running the same way.
            </h2>
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-300 text-pretty">
              Just connect with us. Don&rsquo;t worry about the complex tech: we&rsquo;re here to
              help you map out and solve your operational bottlenecks, like true partners. Free,
              20 minutes, no commitment.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="lg" href="/book">
                Book your free 20-minute session
              </Button>
              <Link
                href="/pricing"
                className="inline-flex min-h-[24px] items-center gap-2 text-[14px] text-ink-300 transition-colors hover:text-white"
                data-cursor="hover"
              >
                See pricing
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
