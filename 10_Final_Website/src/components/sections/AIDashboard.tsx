'use client';

import { animate, motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TiltCard } from '@/components/motion/TiltCard';
import { prefersReducedMotion } from '@/lib/utils';

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
    // Was a hand-rolled 1800ms RAF loop with its own cubic curve — exceeded
    // the documented 1600ms cinematic-moment ceiling and used a fourth
    // easing curve nobody else in the codebase does. Framer's own `animate`
    // reuses the same cinematic bezier as every other whileInView entrance.
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
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
            {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
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
    <svg viewBox="0 0 100 100" className="h-24 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818CF8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
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
        stroke="#A5B4FC"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

export function AIDashboard() {
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

          <motion.div
            className="relative pb-6 pl-0 md:pb-10 md:pl-12"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              perspective: '2000px',
            }}
          >
            <TiltCard max={6} lift={10} glow={0.14} className="relative">
              {/* Main dashboard card */}
              <GlassCard variant="strong" className="relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="live">Live</Badge>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
                      This Week · Overview
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-ink-400">Updated 2s ago</span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-6">
                  <StatCounter value={184} label="New leads" delta="+12" positive />
                  <StatCounter value={47} label="Bookings confirmed" delta="+8" positive />
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-[11px] text-ink-400">
                    <span className="font-mono uppercase tracking-widest">Leads · last 14 days</span>
                    <span className="inline-flex items-center gap-1 text-signal-success">
                      <TrendingUp className="h-3 w-3" />
                      Trending up
                    </span>
                  </div>
                  <MiniChart />
                </div>

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

              {/* Floating signal card — hidden on mobile to avoid clipping */}
              <motion.div
                className="absolute hidden -right-10 -top-8 w-[260px] md:block"
                initial={{ opacity: 0, x: 30, y: -10 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ transform: 'translateZ(40px)' }}
              >
                <GlassCard variant="strong" className="border-signal-success/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-signal-success/15 p-1.5">
                      <CheckCircle2 className="h-4 w-4 text-signal-success" strokeWidth={2.4} />
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

              {/* Floating alert card — hidden on mobile to avoid clipping */}
              <motion.div
                className="absolute hidden -bottom-6 -left-12 w-[240px] md:block"
                initial={{ opacity: 0, x: -30, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.85, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ transform: 'translateZ(60px)' }}
              >
                <GlassCard variant="strong" className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-accent-bright" strokeWidth={2.4} />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-accent-bright">
                      Today's goal
                    </span>
                  </div>
                  <p className="mt-2 text-[12px] text-white">
                    20 leads contacted · 13 done
                  </p>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full bg-accent-bright"
                      initial={{ width: '0%' }}
                      whileInView={{ width: '64%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 1.2 }}
                    />
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
