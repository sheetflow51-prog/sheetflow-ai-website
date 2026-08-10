'use client';

import { animate, motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TiltCard } from '@/components/motion/TiltCard';
import { Breathing } from '@/components/motion/Breathing';
import { prefersReducedMotion } from '@/lib/utils';
import { EASE } from '@/lib/motion';

/**
 * useReduced — SSR-safe reduced-motion gate.
 * Defaults to `true` so the server render and first client paint emit NO
 * ambient motion (avoids a hydration mismatch / flash); flips to the real
 * preference after mount. Continuous decorative motion is opt-in only.
 */
function useReduced() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);
  return reduced;
}

/**
 * ScanBeam — a single soft light bar that travels top→bottom of the dashboard,
 * echoing the WorkflowPipeline "traveling packet". Pure transform (translateY),
 * clipped by the card's `overflow-hidden`. Disabled under reduced-motion.
 */
function ScanBeam() {
  const reduced = useReduced();
  if (reduced) return null;
  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 top-0 h-1/3"
      aria-hidden="true"
      style={{
        background:
          'linear-gradient(180deg, transparent 0%, rgba(96,165,250,0.10) 50%, transparent 100%)',
      }}
      initial={{ y: '-120%' }}
      animate={{ y: ['-120%', '360%'] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
    />
  );
}

function StatCounter({
  value,
  label,
  prefix = '',
  suffix = '',
  delta,
  positive = true,
}: {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  delta?: string;
  positive?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    // Reduced-motion: snap to final value — no counting animation.
    if (prefersReducedMotion()) { setCount(value); return; }
    const controls = animate(0, value, {
      duration: 1.4,
      ease: EASE,
      onUpdate: (latest) => setCount(Math.floor(latest)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <div ref={ref}>
      <div className="font-display text-4xl font-semibold text-white md:text-5xl">
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-[12px]">
        <span className="text-ink-400">{label}</span>
        {delta && (
          <span
            className={`inline-flex items-center gap-0.5 ${positive ? 'text-signal-success' : 'text-signal-danger'}`}
          >
            {positive ? <ArrowUp className="h-3 w-3" aria-hidden="true" /> : <ArrowDown className="h-3 w-3" aria-hidden="true" />}
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

function MiniChart() {
  const points = [22, 28, 26, 34, 31, 42, 38, 48, 52, 49, 58, 64, 60, 72, 78];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min;
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 100 - ((p - min) / range) * 100;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  return (
    <div className="relative h-24 w-full">
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={`${path} L 100 100 L 0 100 Z`}
          fill="url(#chartFill)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
        />
        <motion.path
          d={path}
          stroke="#93C5FD"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: EASE }}
        />
      </svg>
      {/* Live endpoint — the one pixel that stays alive after the one-time
          reveal, so the "live" chart doesn't freeze. */}
      <Breathing period={6} className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2">
        <span
          className="block h-2 w-2 rounded-full bg-accent-light"
          style={{ boxShadow: '0 0 8px 2px rgba(147, 197, 253, 0.7)' }}
        />
      </Breathing>
    </div>
  );
}

export function AIDashboard() {
  // Gate the goal-bar shimmer on the same SSR-safe reduced-motion check.
  const reduced = useReduced();

  return (
    <section id="reports" className="section relative">
      <div className="container-edge">
        <div className="grid gap-12 md:gap-16 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <SectionHeader
            kicker="Reporting Dashboards"
            title={
              <>
                One clean dashboard for{' '}
                <span className="text-accent-gradient">leads, bookings, revenue.</span>
              </>
            }
            description="No more scattered spreadsheets. We build you a single view of your business — leads in, follow-ups out, appointments booked, money in the bank. Delivered to your inbox every morning."
            align="left"
          />

          {/*
            Symmetric horizontal gutter (md:px-14 = 56px each side) creates a
            SAFE ZONE the floating accent cards overhang into, so nothing spills
            past the grid column at 1280px and up. The TiltCard's 3D tilt also
            rotates inside this gutter → no horizontal page scroll.
          */}
          <motion.div
            className="relative pb-6 pl-0 md:px-14 md:pb-16 md:pt-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.9, ease: EASE }}
            style={{
              perspective: '2000px',
            }}
          >
            <TiltCard max={6} lift={10} glow={0.14} className="relative">
              {/* Main dashboard card */}
              <GlassCard variant="strong" className="relative overflow-hidden">
                {/* This card is a product preview, not a customer account. The
                    figures below are sample data chosen to show the layout, so
                    the header says so rather than implying a live tenant. */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="plain">Product preview</Badge>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
                      Weekly Overview
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-ink-400">Sample data</span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-6">
                  <StatCounter value={184} label="New leads" delta="+12" positive />
                  <StatCounter value={47} label="Bookings confirmed" delta="+8" positive />
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-[11px] text-ink-400">
                    <span className="font-mono uppercase tracking-widest">Leads · last 14 days</span>
                    <span className="inline-flex items-center gap-1 text-signal-success">
                      <TrendingUp className="h-3 w-3" aria-hidden="true" />
                      Trending up
                    </span>
                  </div>
                  <MiniChart />
                </div>

                {/* Continuous "live" scan — one traveling light bar, transform-only,
                    clipped by this card's overflow-hidden. Reduced-motion-guarded. */}
                <ScanBeam />

                {/* Scan line overlay */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 4px)',
                  }}
                  aria-hidden="true"
                />
              </GlassCard>

              {/* Floating signal card — peeks from ABOVE the card's top edge
                  (mostly outside) so it can never cover the header row, at any
                  column width. Hidden on mobile. */}
              <motion.div
                className="absolute hidden -top-[74px] right-2 w-[230px] md:block"
                initial={{ opacity: 0, x: 30, y: -10 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.7, ease: EASE }}
                style={{ transform: 'translateZ(40px)' }}
              >
                <GlassCard variant="strong" className="border-signal-success/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-signal-success/15 p-1.5">
                      <CheckCircle2 className="h-4 w-4 text-signal-success" strokeWidth={2.4} aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-medium text-white">Lead followed up</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-ink-300">
                        WhatsApp reply sent in 38s. Booked a call for Friday 2pm.
                      </p>
                      <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-signal-success">
                        Auto · No staff needed
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Floating alert card — peeks from BELOW the card's bottom edge
                  (mostly outside) so it clears all interior content. */}
              <motion.div
                className="absolute hidden -bottom-[58px] left-2 w-[220px] md:block"
                initial={{ opacity: 0, x: -30, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.85, duration: 0.7, ease: EASE }}
                style={{ transform: 'translateZ(60px)' }}
              >
                <GlassCard variant="strong" className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-accent-bright" strokeWidth={2.4} aria-hidden="true" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-accent-bright">
                      Today's goal
                    </span>
                  </div>
                  <p className="mt-2 text-[12px] text-white">
                    20 leads contacted · 13 done
                  </p>
                  <div className="relative mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full bg-accent-bright"
                      initial={{ width: '0%' }}
                      whileInView={{ width: '64%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 1.2 }}
                    />
                    {/* Continuous soft shimmer travelling the goal bar — transform-only,
                        clipped by the bar's overflow-hidden. Reduced-motion-guarded. */}
                    {!reduced && (
                      <motion.div
                        className="pointer-events-none absolute inset-y-0 left-0 w-1/3"
                        aria-hidden="true"
                        style={{
                          background:
                            'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                        }}
                        initial={{ x: '-100%' }}
                        animate={{ x: ['-100%', '320%'] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.9 }}
                      />
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            </TiltCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
