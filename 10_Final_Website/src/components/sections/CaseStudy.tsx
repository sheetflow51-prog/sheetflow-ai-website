'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Quote } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

const STUDIES = [
  {
    company: 'Strata Ops',
    industry: 'Series B SaaS',
    metric: '$847K',
    metricLabel: 'caught in surface anomalies',
    quote: 'SheetFlow AI monitors 47 spreadsheets for our operations team. It catches problems we didn\'t even know to look for.',
    role: 'Director of Operations',
    accent: 'from-accent-bright/15 via-transparent to-transparent',
  },
  {
    company: 'Northfield Capital',
    industry: 'Investment fund',
    metric: '92%',
    metricLabel: 'reduction in manual reporting time',
    quote: 'Our weekly board prep used to take a full day. Now the deck is in our inbox at 7am Monday — generated overnight.',
    role: 'Chief of Staff',
    accent: 'from-violet/15 via-transparent to-transparent',
  },
  {
    company: 'Parallel Logistics',
    industry: 'Supply chain ops',
    metric: '4 sec',
    metricLabel: 'time-to-detection on supplier outliers',
    quote: 'A human auditor might catch this in a monthly review. SheetFlow AI caught it in 4 seconds. The procurement team was notified before the next order.',
    role: 'VP of Operations',
    accent: 'from-signal-info/15 via-transparent to-transparent',
  },
];

export function CaseStudy() {
  return (
    <section id="customers" className="section relative">
      <div className="container-edge">
        <div className="mb-16 max-w-3xl">
          <SectionHeader
            kicker="In the Field"
            title={
              <>
                The teams who never miss a signal{' '}
                <span className="text-ink-300">use SheetFlow AI.</span>
              </>
            }
            description="From two-person startups to global operations teams — the intelligence layer has caught the silent errors, surfaced the hidden patterns, and compounded the saved hours."
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {STUDIES.map((s, i) => (
            <motion.div
              key={s.company}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlassCard variant="feature" className="group h-full" interactive>
                <div className="flex h-full flex-col gap-6">
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${s.accent} opacity-50`}
                    aria-hidden="true"
                  />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-[18px] font-semibold text-white">{s.company}</h3>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
                        {s.industry}
                      </p>
                    </div>
                    <ArrowUpRight
                      className="h-5 w-5 text-ink-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-bright"
                      strokeWidth={1.6}
                    />
                  </div>

                  <div className="relative">
                    <Quote className="mb-3 h-4 w-4 text-accent-bright/60" strokeWidth={1.5} />
                    <p className="text-[15px] leading-relaxed text-white/85 text-balance">
                      "{s.quote}"
                    </p>
                    <p className="mt-3 text-[12px] text-ink-400">— {s.role}</p>
                  </div>

                  <div className="relative mt-auto border-t border-white/[0.06] pt-5">
                    <div className="font-display text-3xl font-semibold text-accent-gradient">
                      {s.metric}
                    </div>
                    <p className="mt-1 text-[12px] text-ink-300">{s.metricLabel}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
