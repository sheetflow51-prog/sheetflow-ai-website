'use client';

import { motion } from 'framer-motion';
import * as React from 'react';
import { prefersReducedMotion } from '@/lib/utils';

interface BreathingProps {
  children: React.ReactNode;
  /** Breath period in seconds. Default 6s — Apple-tier slow. */
  period?: number;
  /** How much it breathes (0.04 = ±2% scale). */
  amount?: number;
  /** What property breathes — 'scale' | 'opacity' | 'glow'. */
  prop?: 'scale' | 'opacity' | 'glow';
  className?: string;
}

/**
 * Breathing — wraps an element with imperceptible ambient life.
 *
 * The brand standard: ambient motion is *felt, not seen*. Use this on
 * status indicators, the AI core idle, badges that should "be alive."
 *
 * Period 6s = one full inhale-exhale cycle. Slower than human breath
 * by ~2x — feels less like an organism, more like a system humming.
 *
 * Disabled under prefers-reduced-motion.
 */
export function Breathing({
  children,
  period = 6,
  amount = 0.04,
  prop = 'scale',
  className,
}: BreathingProps) {
  const reduced = typeof window !== 'undefined' && prefersReducedMotion();

  if (reduced) {
    return <span className={className}>{children}</span>;
  }

  const animate =
    prop === 'opacity'
      ? { opacity: [1, 1 - amount * 4, 1] }
      : prop === 'glow'
        ? {
            filter: [
              `drop-shadow(0 0 12px rgba(129,140,248,${0.3 - amount * 2}))`,
              `drop-shadow(0 0 18px rgba(129,140,248,${0.3 + amount * 4}))`,
              `drop-shadow(0 0 12px rgba(129,140,248,${0.3 - amount * 2}))`,
            ],
          }
        : { scale: [1, 1 + amount, 1] };

  return (
    <motion.span
      className={className}
      style={{ display: 'inline-block' }}
      animate={animate}
      transition={{ duration: period, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.span>
  );
}
