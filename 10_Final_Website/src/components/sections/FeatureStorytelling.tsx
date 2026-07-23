'use client';

import { Eye, Zap, Bell, Brain, GitMerge, ShieldCheck } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

const FEATURES = [
  {
    Icon: Eye,
    kicker: 'Capture',
    title: 'Every lead caught — from every channel.',
    body: 'Web forms, WhatsApp, Instagram DMs, missed calls, Google Ads — all funneled into one place automatically. No lead ever sits unread.',
    accent: 'from-accent-bright/30 to-violet/20',
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    Icon: Zap,
    kicker: 'Respond',
    title: 'Reply in 60 seconds — even at 2am.',
    body: 'An AI assistant that answers, qualifies and books — so leads never go cold while you\'re sleeping or in a meeting.',
    accent: 'from-violet/30 to-accent/15',
    span: 'md:col-span-2',
  },
  {
    Icon: Bell,
    kicker: 'Book',
    title: 'Appointments confirmed without you lifting a finger.',
    body: 'Self-serve scheduling, reminders sent on WhatsApp, no-shows reduced. Your calendar fills itself.',
    accent: 'from-signal-warning/25 to-accent/10',
    span: 'md:col-span-2',
  },
  {
    Icon: Brain,
    kicker: 'Sync',
    title: 'Your CRM updates itself.',
    body: 'Every conversation, form, call and booking flows into HubSpot, Pipedrive or GoHighLevel — automatically. Manual data entry is over.',
    accent: 'from-accent/30 to-violet/30',
    span: 'md:col-span-2',
  },
  {
    Icon: GitMerge,
    kicker: 'Report',
    title: 'A clear picture of your business — every morning.',
    body: 'Leads, bookings, revenue, follow-ups — one calm email at 8am tells you exactly where things stand and what needs attention.',
    accent: 'from-signal-success/25 to-accent/15',
    span: 'md:col-span-2',
  },
  {
    Icon: ShieldCheck,
    kicker: 'Trust',
    title: 'Built carefully. Yours to own.',
    body: 'Read-only access by default. Every action logged. We hand over the keys — no lock-in, no platform tax. Cancel anytime.',
    accent: 'from-violet/25 to-accent/15',
    span: 'md:col-span-4',
  },
];

export function FeatureStorytelling() {
  return (
    <section id="product" className="section relative">
      <div className="container-edge">
        <div className="mb-14 max-w-3xl md:mb-20">
          <SectionHeader
            kicker="How We Work"
            title={
              <>
                Six pillars of automation.{' '}
                <span className="text-ink-300">One quietly run business.</span>
              </>
            }
            description="We don't sell tools — we install systems. Six everyday operations, automated end-to-end, so your team can focus on the work only humans can do."
          />
        </div>

        <ScrollReveal
          className="grid auto-rows-[minmax(220px,_auto)] grid-cols-1 gap-3.5 md:grid-cols-4"
          y={30}
          duration={0.7}
          stagger={0.06}
        >
          {FEATURES.map((f, i) => {
            const Icon = f.Icon;
            return (
              <div key={f.title} className={`relative ${f.span ?? ''}`}>
                <GlassCard variant="feature" className="group h-full">
                  <div className="flex h-full flex-col">
                    {/* Accent glow blob — a slow continuous drift keeps the
                        corner light alive after reveal (transform-only). */}
                    <div
                      className={`pointer-events-none absolute right-0 top-0 h-40 w-40 animate-float rounded-full bg-gradient-to-br ${f.accent} opacity-60 blur-3xl`}
                      style={{ animationDuration: '15s', animationDelay: `${i * 0.8}s` }}
                      aria-hidden="true"
                    />

                    {/* Refined "running" highlight on hover — one travelling
                        sheen along the top edge. */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    >
                      <div className="h-full w-full animate-none bg-[linear-gradient(90deg,transparent_0%,rgba(147,197,253,0.7)_50%,transparent_100%)] bg-[length:200%_100%] group-hover:animate-shimmer" />
                    </div>

                    <div className="relative flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-md">
                        <Icon className="h-4 w-4 text-accent-bright" strokeWidth={2.2} aria-hidden="true" />
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-accent-bright/80">
                        {f.kicker}
                      </span>
                    </div>
                    <h3 className="mt-5 max-w-md text-balance text-[20px] font-semibold leading-[1.18] tracking-tight text-white md:mt-6 md:text-[24px] md:leading-[1.15]">
                      {f.title}
                    </h3>
                    <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-300/95">{f.body}</p>
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </ScrollReveal>
      </div>
    </section>
  );
}
