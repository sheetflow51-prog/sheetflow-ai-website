'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  BellRing,
  MessageCircle,
  CalendarCheck,
  BarChart3,
  RefreshCw,
  Receipt,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface Workflow {
  id: string;
  title: string;
  body: string;
  impact: string;
  Icon: typeof BellRing;
  accent: string;
}

// Six real automation examples a business owner instantly recognises.
const WORKFLOWS: Workflow[] = [
  {
    id: 'lead-alerts',
    title: 'Missed Lead Alerts',
    body: 'Instant notifications the moment a lead comes in — so nothing waits 24 hours for a reply.',
    impact: 'Reply in under 60s',
    Icon: BellRing,
    accent: '#F59E0B',
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp Follow-Ups',
    body: 'An AI assistant that answers questions, qualifies leads, and books calls on WhatsApp — 24/7.',
    impact: 'Always on, always polite',
    Icon: MessageCircle,
    accent: '#34D399',
  },
  {
    id: 'booking',
    title: 'Appointment Booking',
    body: 'A self-serve booking flow that syncs to your calendar and CRM. No back-and-forth.',
    impact: 'Calendar fills itself',
    Icon: CalendarCheck,
    accent: '#A5B4FC',
  },
  {
    id: 'reports',
    title: 'Daily Business Reports',
    body: 'A clean morning email with leads, bookings, revenue and what needs your attention today.',
    impact: 'Clarity by 9am',
    Icon: BarChart3,
    accent: '#818CF8',
  },
  {
    id: 'crm-sync',
    title: 'CRM Auto-Updates',
    body: 'Forms, calls and chats flow into HubSpot, Pipedrive or GoHighLevel automatically. No manual entry.',
    impact: 'Zero data entry',
    Icon: RefreshCw,
    accent: '#A78BFA',
  },
  {
    id: 'invoices',
    title: 'Invoice Reminders',
    body: 'Polite, automated nudges that get invoices paid faster — without you chasing clients.',
    impact: 'Get paid sooner',
    Icon: Receipt,
    accent: '#FBBF24',
  },
];

export function WorkflowUniverse() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const intensity = useSpring(
    useTransform(scrollYProgress, [0.15, 0.5, 0.85], [0, 1, 0.6]),
    { stiffness: 100, damping: 30, mass: 0.8 },
  );
  const veilOpacity = useTransform(intensity, [0, 0.5, 1], [0, 0.35, 0.55]);

  return (
    <section ref={sectionRef} id="workflows" className="section relative">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(99,102,241,0.06), transparent 70%)',
          opacity: veilOpacity,
        }}
      />
      <div className="container-edge">
        <SectionHeader
          kicker="What We Automate"
          title={
            <>
              Six automations that quietly{' '}
              <span className="text-ink-300">run your business.</span>
            </>
          }
          description="Real systems for real businesses — not abstract AI. Each one removes hours of manual work every week and gives you back focus, customers, and revenue."
          align="center"
          className="mx-auto items-center text-center"
        />

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-20 md:gap-5 lg:grid-cols-3">
          {WORKFLOWS.map((w, i) => {
            const Icon = w.Icon;
            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{
                  duration: 0.7,
                  delay: 0.08 * i,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <GlassCard variant="feature" className="group h-full" interactive>
                  {/* Subtle accent glow per card */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
                    style={{
                      background: `radial-gradient(circle, ${w.accent}55, transparent 70%)`,
                    }}
                  />

                  <div className="relative flex h-full flex-col">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-md"
                      style={{
                        boxShadow: `0 0 18px ${w.accent}22, inset 0 1px 0 rgba(255,255,255,0.06)`,
                      }}
                    >
                      <Icon
                        className="h-4 w-4"
                        style={{ color: w.accent }}
                        strokeWidth={2.2}
                      />
                    </div>

                    <h3 className="mt-6 text-[19px] font-semibold leading-[1.2] tracking-tight text-white md:text-[20px]">
                      {w.title}
                    </h3>

                    <p className="mt-2.5 text-[14px] leading-relaxed text-ink-300/95">
                      {w.body}
                    </p>

                    <div className="mt-6 flex items-center gap-2 border-t border-white/[0.06] pt-4">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: w.accent }}
                      />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
                        {w.impact}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          className="mx-auto mt-10 max-w-md text-center text-[13px] text-ink-400 md:mt-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Need something specific? We build custom automations around how your team already works.
        </motion.p>
      </div>
    </section>
  );
}
