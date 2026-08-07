import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ExternalLink } from 'lucide-react';

import { JsonLd } from '@/components/seo/JsonLd';
import { ServiceBreadcrumb } from '@/components/sections/ServiceBreadcrumb';
import { Button } from '@/components/ui/Button';
import { SectionHandoff } from '@/components/signature/SectionHandoff';
import { projects } from '@/content/work';
import { workIndexGraph } from '@/lib/structured-data';

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
    'Production websites and automation systems SheetFlow has built and deployed — the architecture, the stack and the engineering decisions behind each one. Every project links to the running site.',
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
              Every project below is live. Each case study covers the architecture, the stack
              and the decisions behind the build — and links to the site itself, so nothing here
              has to be taken on trust.
            </p>
          </div>

          <div className="mt-16 grid gap-5 lg:grid-cols-2">
            {projects.map((p) => (
              <article key={p.slug} className="group">
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
                    <Image
                      src={p.shot.src}
                      alt={p.shot.alt}
                      fill
                      sizes="(min-width: 1024px) 46vw, 92vw"
                      className="object-cover object-top transition-transform duration-700 ease-cinematic group-hover:scale-[1.02]"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent"
                    />
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-7">
                    <span className="text-[11px] font-medium uppercase tracking-widest text-accent-bright/80">
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

      <section className="section" aria-labelledby="work-cta-heading">
        <div className="container-edge">
          <h2 id="work-cta-heading" className="headline-section text-fade text-balance max-w-3xl">
            Your business, running the same way.
          </h2>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-300 text-pretty">
            The audit maps where your enquiries arrive, where they stall, and which steps are
            worth automating first. No commitment, and you leave with the map either way.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" href="/book">
              Book free audit
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
      </section>
    </>
  );
}
