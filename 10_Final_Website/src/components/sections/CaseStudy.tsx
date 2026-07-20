'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Quote } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

const STUDIES = [
  {
    company: 'North Clinic',
    industry: 'Dental clinic · 3 locations',
    metric: '+38%',
    metricLabel: 'more bookings in 60 days',
    quote: 'Patients now book themselves on WhatsApp. We stopped losing appointments to voicemail — and our front desk got their afternoons back.',
    role: 'Practice Manager',
    accent: 'from-accent-bright/15 via-transparent to-transparent',
  },
  {
    company: 'Oakwood Realty',
    industry: 'Real estate agency',
    metric: '< 1 min',
    metricLabel: 'average reply time to new leads',
    quote: 'Every lead now gets a personal reply within a minute, day or night. Our conversion rate doubled in the first quarter.',
    role: 'Founder',
    accent: 'from-violet/15 via-transparent to-transparent',
  },
  {
    company: 'Summit Coaching',
    industry: 'Coaching business',
    metric: '12 hrs',
    metricLabel: 'saved per week on admin',
    quote: 'CRM updates, follow-ups, invoice nudges — all handled. I went from drowning in admin to running calls full-time again.',
    role: 'Owner',
    accent: 'from-signal-info/15 via-transparent to-transparent',
  },
];

export function CaseStudy() {
  return (
    <section id="customers" className="section relative">
      <div className="container-edge">
        <div className="mb-12 max-w-3xl md:mb-16">
          <SectionHeader
            kicker="Real Results"
            title={
              <>
                Quiet automations.{' '}
                <span className="text-ink-300">Loud results.</span>
              </>
            }
            description="Clinics, agencies, coaches and service businesses use SheetFlow to capture more leads, book more clients, and reclaim hours every week."
          />
        </div>

        <div className="grid gap-3.5 md:grid-cols-3">
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
