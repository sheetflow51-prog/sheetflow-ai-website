'use client';

import { Fragment, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Inbox,
  MessageCircle,
  CalendarCheck,
  RefreshCw,
  BarChart3,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { prefersReducedMotion } from '@/lib/utils';

interface Stage {
  id: string;
  num: string;
  title: string;
  detail: string;
  status: string;
  Icon: typeof Inbox;
  /** Corner glow gradient — token classes only (indigo/violet + one sparse signal). */
  accent: string;
  /** Icon color — token class, never raw hex. */
  tint: string;
  /** Status-dot color — token class. */
  dot: string;
}

// One concrete end-to-end journey a business owner recognises, told as a
// left-to-right sequence. Distinct from AIInfrastructure's radial "what
// connects" constellation — this is the linear "what happens, in order".
// Every colour is a Tailwind token (accent/violet + a single sparse
// signal-success for the WhatsApp step), never a raw hex.
const STAGES: Stage[] = [
  {
    id: 'lead',
    num: '01',
    title: 'New lead arrives',
    detail: 'A web form, WhatsApp message or missed call — every enquiry lands in one place.',
    status: 'Captured',
    Icon: Inbox,
    accent: 'from-accent-bright/25 to-violet/15',
    tint: 'text-accent-bright',
    dot: 'bg-accent-bright',
  },
  {
    id: 'reply',
    num: '02',
    title: 'AI replies & qualifies',
    detail: 'An assistant answers on WhatsApp in seconds and asks the right questions.',
    status: 'Replied · <60s',
    Icon: MessageCircle,
    accent: 'from-signal-success/25 to-accent/15',
    tint: 'text-signal-success',
    dot: 'bg-signal-success',
  },
  {
    id: 'book',
    num: '03',
    title: 'Appointment booked',
    detail: 'Qualified leads get a link and land straight on your calendar.',
    status: 'Scheduled',
    Icon: CalendarCheck,
    accent: 'from-accent-light/25 to-violet/15',
    tint: 'text-accent-light',
    dot: 'bg-accent-light',
  },
  {
    id: 'crm',
    num: '04',
    title: 'CRM updated',
    detail: 'Contact details, notes and status sync across automatically. No typing.',
    status: 'Synced',
    Icon: RefreshCw,
    accent: 'from-violet-bright/25 to-accent/15',
    tint: 'text-violet-bright',
    dot: 'bg-violet-bright',
  },
  {
    id: 'report',
    num: '05',
    title: 'Daily report sent',
    detail: 'You wake up to a clean summary of leads, bookings and what needs you.',
    status: 'Delivered · 8am',
    Icon: BarChart3,
    accent: 'from-accent/25 to-violet/15',
    tint: 'text-accent',
    dot: 'bg-accent',
  },
];

// One hop per second-and-a-bit keeps every packet inside the 1100–1600ms
// cinematic band. The chain is choreographed so only ONE packet is ever
// mid-flight: connector k starts at k*SEGMENT and repeats a full cycle
// later — the signal appears to travel the whole chain, then rests.
const SEGMENT = 1.3;
const CHAIN_GAP = 1.5;

/**
 * PipelineConnector — the directional link between two stages.
 * Renders a horizontal rail on desktop (lg+) and a vertical rail on
 * mobile/tablet, each with a single indigo "packet" that travels toward the
 * next stage. The packet only mounts when `flowActive` (reduced-motion + in
 * view guarded), so at rest it's a static gradient line with a direction cue.
 */
function PipelineConnector({
  index,
  flowActive,
  cycle,
}: {
  index: number;
  flowActive: boolean;
  cycle: number;
}) {
  const transition = {
    duration: SEGMENT,
    ease: 'easeInOut' as const,
    repeat: Infinity,
    repeatDelay: cycle - SEGMENT,
    delay: index * SEGMENT,
  };

  return (
    <div
      aria-hidden="true"
      className="flex w-full shrink-0 items-center justify-center py-1 lg:w-14 lg:py-0"
    >
      {/* Horizontal rail — desktop */}
      <div className="relative hidden h-4 w-full lg:block">
        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 rounded-full bg-gradient-to-r from-accent-bright/5 via-accent-bright/40 to-accent-bright/5" />
        <ChevronRight
          className="absolute right-[-2px] top-1/2 h-3 w-3 -translate-y-1/2 text-accent-bright/40"
          strokeWidth={2.5}
        />
        {flowActive && (
          <motion.span
            className="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-light"
            style={{ boxShadow: '0 0 8px 2px rgba(165, 180, 252, 0.55)' }}
            initial={{ opacity: 0 }}
            animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
            transition={transition}
          />
        )}
      </div>

      {/* Vertical rail — mobile / tablet */}
      <div className="relative h-9 w-4 lg:hidden">
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 rounded-full bg-gradient-to-b from-accent-bright/5 via-accent-bright/40 to-accent-bright/5" />
        <ChevronDown
          className="absolute bottom-[-2px] left-1/2 h-3 w-3 -translate-x-1/2 text-accent-bright/40"
          strokeWidth={2.5}
        />
        {flowActive && (
          <motion.span
            className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-light"
            style={{ boxShadow: '0 0 8px 2px rgba(165, 180, 252, 0.55)' }}
            initial={{ opacity: 0 }}
            animate={{ top: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
            transition={transition}
          />
        )}
      </div>
    </div>
  );
}

export function WorkflowPipeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-10%' });
  const flowActive = inView && !prefersReducedMotion();

  const connectors = STAGES.length - 1;
  const cycle = connectors * SEGMENT + CHAIN_GAP;

  return (
    <section ref={sectionRef} id="how-it-works" className="section relative">
      {/* Background grid — echoes AIInfrastructure's intelligence canvas */}
      <div className="absolute inset-0 -z-10 grid-backdrop opacity-30" aria-hidden="true" />

      <div className="container-edge">
        <SectionHeader
          kicker="How It Works"
          title={
            <>
              From first contact to booked{' '}
              <span className="text-ink-300">— automatically.</span>
            </>
          }
          description="One lead, start to finish. Follow a single enquiry through the system — replied to, qualified, booked, logged and reported — without anyone lifting a finger."
          align="center"
          className="mx-auto items-center text-center"
        />

        {/* The pipeline: stacked vertically on mobile/tablet, a left-to-right
            chain on desktop. Stages reveal in sequence (staggered, cinematic
            bezier) as the section enters view, and a single signal packet
            travels the connectors — one motion in flight at a time. */}
        <div
          role="list"
          aria-label="Automation pipeline: five stages from new lead to daily report"
          className="mt-14 flex flex-col items-stretch lg:mt-20 lg:flex-row lg:items-stretch"
        >
          {STAGES.map((s, i) => {
            const Icon = s.Icon;
            return (
              <Fragment key={s.id}>
                <motion.div
                  role="listitem"
                  aria-label={`Stage ${i + 1} of ${STAGES.length}: ${s.title}. ${s.detail}`}
                  className="w-full lg:flex-1"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-12%' }}
                  transition={{ duration: 0.7, delay: i * 0.14, ease: [0.16, 1, 0.3, 1] }}
                >
                  <GlassCard variant="feature" className="group relative h-full min-h-[184px]">
                    {/* Per-stage accent glow — token gradient, not raw hex */}
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-gradient-to-br ${s.accent} opacity-50 blur-3xl transition-opacity duration-500 group-hover:opacity-80`}
                    />

                    <div className="relative flex h-full flex-col">
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-md">
                          <Icon className={`h-4 w-4 ${s.tint}`} strokeWidth={2.2} aria-hidden="true" />
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
                          {s.num}
                        </span>
                      </div>

                      <h3 className="mt-5 text-[17px] font-semibold leading-[1.2] tracking-tight text-white">
                        {s.title}
                      </h3>

                      <p className="mt-2 text-[13px] leading-relaxed text-ink-300/95">
                        {s.detail}
                      </p>

                      <div className="mt-auto flex items-center gap-2 pt-5">
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
                          {s.status}
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>

                {i < STAGES.length - 1 && (
                  <PipelineConnector index={i} flowActive={flowActive} cycle={cycle} />
                )}
              </Fragment>
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
          One journey shown here. The same system runs every lead, every day.
        </motion.p>
      </div>
    </section>
  );
}
