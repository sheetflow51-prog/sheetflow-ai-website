'use client';

import { ArrowUpRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProofPlaceholder } from '@/components/ui/ProofPlaceholder';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { publishedCaseStudies } from '@/content/proof';

/* Colour washes are presentation, not content, so they live here and are
   assigned by position rather than stored against a customer record. */
const ACCENTS = [
  'from-accent-bright/15 via-transparent to-transparent',
  'from-violet/15 via-transparent to-transparent',
  'from-violet/15 via-transparent to-transparent',
];

export function CaseStudy() {
  const studies = publishedCaseStudies();
  const hasStudies = studies.length > 0;

  return (
    <section id="customers" className="section relative">
      <div className="container-edge">
        <div className="mb-12 max-w-3xl md:mb-16">
          <SectionHeader
            kicker={hasStudies ? 'Customer Results' : 'Proof, When It Is Real'}
            title={
              hasStudies ? (
                <>
                  Quiet automations.{' '}
                  <span className="text-ink-300">Loud results.</span>
                </>
              ) : (
                <>
                  We publish results{' '}
                  <span className="text-ink-300">only once we can prove them.</span>
                </>
              )
            }
            description={
              hasStudies
                ? 'Clinics, agencies, coaches and service businesses use SheetFlow to capture more leads, book more clients, and reclaim hours every week.'
                : 'Every number on this site is measured and confirmed with the customer before it appears. Nothing here is illustrative, projected, or borrowed from an industry average.'
            }
          />
        </div>

        {hasStudies ? (
          <ScrollReveal className="grid gap-3.5 md:grid-cols-3" y={30} duration={0.7} stagger={0.1}>
            {studies.map((s, i) => (
              <div key={s.slug}>
                <GlassCard variant="feature" className="group h-full" interactive>
                  <div className="flex h-full flex-col gap-6">
                    {/* Living colour wash — a slow opacity breathe keeps a faint
                        pulse after reveal (opacity-only, reduced-motion gated). */}
                    <div
                      className={`pointer-events-none absolute inset-0 animate-glow-breathe bg-gradient-to-br ${ACCENTS[i % ACCENTS.length]} opacity-50`}
                      style={{ animationDuration: '7.5s', animationDelay: `${i * 1.1}s` }}
                      aria-hidden="true"
                    />

                    {/* Refined "running" highlight on hover — one travelling sheen
                        along the top edge. */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    >
                      <div className="h-full w-full animate-none bg-[linear-gradient(90deg,transparent_0%,rgba(147,197,253,0.7)_50%,transparent_100%)] bg-[length:200%_100%] group-hover:animate-shimmer" />
                    </div>

                    <div className="relative flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-[18px] font-semibold text-white">
                          {s.company}
                        </h3>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
                          {s.sector} · {s.context}
                        </p>
                      </div>
                      <ArrowUpRight
                        className="h-5 w-5 text-ink-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-bright"
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                    </div>

                    <p className="relative text-[15px] leading-relaxed text-white/85 text-balance">
                      {s.summary}
                    </p>

                    <div className="relative mt-auto border-t border-white/[0.06] pt-5">
                      <div className="font-display text-3xl font-semibold text-accent-gradient">
                        {s.metric}
                      </div>
                      <p className="mt-1 text-[12px] text-ink-300">{s.metricLabel}</p>
                      {/* The measurement basis travels with the number. A metric
                          that cannot state its methodology does not ship. */}
                      <p className="mt-2 text-[11px] leading-snug text-ink-400">
                        {s.verification.methodology}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            ))}
          </ScrollReveal>
        ) : (
          <ScrollReveal y={30} duration={0.7}>
            <ProofPlaceholder
              title="Customer results"
              body="We are early, and the businesses we work with are still measuring. When the first results are confirmed — and we have written permission to share them — they will appear here with the method behind every figure."
            />
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
