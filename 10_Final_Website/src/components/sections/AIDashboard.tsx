'use client';

import { motion, useInView } from 'framer-motion';
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
    let raf = 0;
    const start = performance.now();
    const duration = 1800;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.floor(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
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
    <section id="intelligence" className="section relative">
      <div className="container-edge">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.3fr] lg:gap-24">
          <SectionHeader
            kicker="Operational Intelligence"
            title={
              <>
                You wake up to{' '}
                <span className="text-accent-gradient">resolved problems.</span>
              </>
            }
            description="While you slept, SheetFlow AI watched 47 spreadsheets, caught a $40,000 billing error, and filed the correction before the business day started. This isn't a dashboard. It's a colleague who never sleeps."
            align="left"
          />

          <motion.div
            className="relative"
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
                      Q3 Revenue Tracker
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-ink-400">Updated 2s ago</span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-6">
                  <StatCounter value={2847000} label="MRR" prefix="$" delta="+18.4%" positive />
                  <StatCounter value={147} label="New customers" delta="+12" positive />
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-[11px] text-ink-400">
                    <span className="font-mono uppercase tracking-widest">Trend · 14 days</span>
                    <span className="inline-flex items-center gap-1 text-signal-success">
                      <TrendingUp className="h-3 w-3" />
                      Anomaly: positive
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

              {/* Floating signal card */}
              <motion.div
                className="absolute -right-4 -top-8 w-[260px] md:-right-10"
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
                      <p className="text-[12px] font-medium text-white">Anomaly resolved</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-ink-300">
                        Row 412 outlier auto-flagged. Procurement notified at 03:14.
                      </p>
                      <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-signal-success">
                        Saved · $12,400
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Floating alert card */}
              <motion.div
                className="absolute -bottom-6 -left-4 w-[240px] md:-left-12"
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
                      Watching
                    </span>
                  </div>
                  <p className="mt-2 text-[12px] text-white">
                    Pipeline coverage drift detected
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
