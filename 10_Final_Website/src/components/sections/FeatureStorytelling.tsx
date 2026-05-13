'use client';

import { motion } from 'framer-motion';
import { Eye, Zap, Bell, Brain, GitMerge, ShieldCheck } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

const FEATURES = [
  {
    Icon: Eye,
    kicker: 'Watching',
    title: 'It sees what changes — and what changes mean.',
    body: 'Continuous monitoring across every cell, every formula, every dependency. SheetFlow AI knows the difference between a value that grew and a value that\'s wrong.',
    accent: 'from-accent-bright/30 to-violet/20',
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    Icon: Zap,
    kicker: 'Acting',
    title: 'Workflows that fire before you ask.',
    body: 'When a threshold breaks, a report is due, or an integration needs a nudge — it just happens.',
    accent: 'from-signal-info/30 to-accent/15',
    span: 'md:col-span-2',
  },
  {
    Icon: Bell,
    kicker: 'Signaling',
    title: 'Calm by default. Urgent when it matters.',
    body: 'A notification is a tax. A signal is a service. SheetFlow AI is opinionated about which one to send.',
    accent: 'from-signal-warning/25 to-accent/10',
    span: 'md:col-span-2',
  },
  {
    Icon: Brain,
    kicker: 'Understanding',
    title: 'Natural language that means business.',
    body: '"Alert me when MRR drops below $150K every Monday at 8am." — that\'s the entire setup. SheetFlow AI builds, runs, and maintains it.',
    accent: 'from-accent/30 to-violet/30',
    span: 'md:col-span-2',
  },
  {
    Icon: GitMerge,
    kicker: 'Connecting',
    title: 'Lives where your data already lives.',
    body: 'Google Sheets. Excel. Airtable. Notion. The intelligence layer doesn\'t demand migration — it bonds with what you already trust.',
    accent: 'from-signal-success/25 to-accent/15',
    span: 'md:col-span-2',
  },
  {
    Icon: ShieldCheck,
    kicker: 'Protecting',
    title: 'Audit-grade by default.',
    body: 'Every signal logged. Every action timestamped. Compliance teams approve before they ask.',
    accent: 'from-violet/25 to-accent/15',
    span: 'md:col-span-2',
  },
];

export function FeatureStorytelling() {
  return (
    <section id="product" className="section relative">
      <div className="container-edge">
        <div className="mb-20 max-w-3xl">
          <SectionHeader
            kicker="The Capability Surface"
            title={
              <>
                Six instincts.{' '}
                <span className="text-ink-300">One quiet intelligence.</span>
              </>
            }
            description="SheetFlow AI doesn't add features to your spreadsheets. It adds awareness — six instincts that compound into operational intelligence you didn't know was possible."
          />
        </div>

        <div className="grid auto-rows-[minmax(220px,_auto)] grid-cols-1 gap-3 md:grid-cols-4">
          {FEATURES.map((f, i) => {
            const Icon = f.Icon;
            return (
              <motion.div
                key={f.title}
                className={`relative ${f.span ?? ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <GlassCard variant="feature" className="h-full">
                  <div className="flex h-full flex-col">
                    {/* Accent glow blob */}
                    <div
                      className={`pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-gradient-to-br ${f.accent} opacity-60 blur-3xl`}
                      aria-hidden="true"
                    />

                    <div className="relative flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-md">
                        <Icon className="h-4 w-4 text-accent-bright" strokeWidth={2.2} />
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-accent-bright/80">
                        {f.kicker}
                      </span>
                    </div>
                    <h3 className="mt-6 max-w-md text-balance text-[22px] font-semibold leading-[1.15] tracking-tight text-white md:text-2xl">
                      {f.title}
                    </h3>
                    <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-300">{f.body}</p>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
