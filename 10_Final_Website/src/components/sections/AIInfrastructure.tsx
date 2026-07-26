'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MessageCircle, Users, CalendarClock, Workflow, CreditCard, Boxes } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Breathing } from '@/components/motion/Breathing';
import { prefersReducedMotion } from '@/lib/utils';

interface Branch {
  id: string;
  label: string;
  Icon: typeof MessageCircle;
  tint: string;
  tools: string[];
}

// Grouped into a hierarchy (root → category → tools) so the layout is pure
// flow/grid — alignment is automatic and cannot drift, unlike a radial where
// every node's position was hand-computed. This is the mindmap the client
// asked for: one hub, clear branches, tools hanging off each branch.
const BRANCHES: Branch[] = [
  {
    id: 'messaging',
    label: 'Messaging & Leads',
    Icon: MessageCircle,
    tint: 'text-accent-bright',
    tools: ['WhatsApp', 'Instagram', 'Gmail', 'Slack', 'Mailchimp', 'Twilio'],
  },
  {
    id: 'crm',
    label: 'CRM & Pipeline',
    Icon: Users,
    tint: 'text-violet-bright',
    tools: ['HubSpot', 'Pipedrive', 'GoHighLevel', 'Airtable'],
  },
  {
    id: 'scheduling',
    label: 'Scheduling',
    Icon: CalendarClock,
    tint: 'text-accent-light',
    tools: ['Google Cal', 'Calendly'],
  },
  {
    id: 'automation',
    label: 'Automation & AI',
    Icon: Workflow,
    tint: 'text-accent',
    tools: ['n8n', 'Zapier', 'Make', 'Claude', 'Google Sheets'],
  },
  {
    id: 'payments',
    label: 'Payments',
    Icon: CreditCard,
    tint: 'text-violet',
    tools: ['Stripe', 'QuickBooks'],
  },
  {
    id: 'more',
    label: 'Custom & More',
    Icon: Boxes,
    tint: 'text-accent-light',
    tools: ['Notion', 'Google Drive', 'Telegram', 'Webhooks', '+40 more'],
  },
];

export function AIInfrastructure() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  const flow = inView && !prefersReducedMotion();

  return (
    <section ref={ref} id="integrations" className="section relative">
      <div className="absolute inset-0 -z-10 grid-backdrop opacity-30" aria-hidden="true" />

      <div className="container-edge">
        <SectionHeader
          kicker="Plays Nicely With Your Stack"
          title={
            <>
              One hub, wired into{' '}
              <span className="text-ink-300">every tool you already use.</span>
            </>
          }
          description="No rip-and-replace. SheetFlow sits at the centre and branches out into your messaging, CRM, calendar, automation and billing — orchestrating what's already in place."
          align="center"
          className="mx-auto items-center text-center"
        />

        {/* ROOT NODE */}
        <div className="mt-14 flex flex-col items-center md:mt-16">
          <div className="relative">
            <div
              className="absolute inset-0 -m-8 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4), transparent 70%)', filter: 'blur(22px)' }}
              aria-hidden="true"
            />
            <Breathing period={6} amount={0.03}>
              <div
                className="relative flex h-24 w-24 items-center justify-center rounded-full border border-accent-bright/50 bg-surface-1/85 backdrop-blur-xl"
                style={{ boxShadow: '0 0 44px rgba(59,130,246,0.5), inset 0 1px 0 rgba(255,255,255,0.12)' }}
              >
                <div className="text-center">
                  <p className="font-display text-[12px] font-semibold tracking-tight text-white">SheetFlow</p>
                  <p className="font-mono text-[8px] uppercase tracking-widest text-accent-bright">Automation</p>
                </div>
              </div>
            </Breathing>
          </div>

          {/* Trunk — vertical line down from the root, with a signal that
              travels it on a loop (the "running" motif). */}
          <div className="relative mt-3 h-10 w-px overflow-hidden bg-gradient-to-b from-accent-bright/60 to-accent-bright/10">
            {flow && (
              <motion.span
                className="absolute left-1/2 h-3 w-px -translate-x-1/2 bg-accent-light"
                style={{ boxShadow: '0 0 8px 1px rgba(147,197,253,0.8)' }}
                initial={{ top: '-20%', opacity: 0 }}
                animate={{ top: ['-20%', '120%'], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
              />
            )}
          </div>
        </div>

        {/* BRANCHES — a responsive grid so every card aligns perfectly (root →
            trunk → balanced 2×3 grid of branch cards). */}
        <div className="relative">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BRANCHES.map((b, i) => {
              const Icon = b.Icon;
              return (
                <motion.div
                  key={b.id}
                  className="group relative flex flex-col rounded-2xl border border-white/[0.08] bg-surface-1/50 p-4 backdrop-blur-md transition-colors hover:border-accent/40"
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10%' }}
                  transition={{ duration: 0.6, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* branch header */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                      <Icon className={`h-4 w-4 ${b.tint}`} strokeWidth={2.2} aria-hidden="true" />
                    </div>
                    <p className="text-[13px] font-semibold leading-tight tracking-tight text-white">{b.label}</p>
                  </div>

                  {/* tools */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {b.tools.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-accent/25 bg-surface-2/70 px-2.5 py-1 text-[11px] font-medium text-white/85 transition-colors group-hover:border-accent/45"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.p
          className="mx-auto mt-10 max-w-md text-center text-[13px] text-ink-400 md:mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          50+ integrations supported · Custom connections built on request · Your stack stays yours
        </motion.p>
      </div>
    </section>
  );
}
