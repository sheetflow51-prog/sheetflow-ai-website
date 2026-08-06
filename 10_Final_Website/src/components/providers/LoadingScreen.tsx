'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { prefersReducedMotion } from '@/lib/utils';

/**
 * Intelligence Boot Sequence.
 * Stages:
 *   0 — mark draws (SVG line trace, 600ms)
 *   1 — wordmark drops in (300ms)
 *   2 — status text cycles + progress fills (700ms)
 *   3 — clip-path reveal (300ms)
 * Total ≈ 1600ms.
 */
const STATUS_LINES = [
  'Loading automations...',
  'Connecting your stack...',
  'Ready.',
];

export default function LoadingScreen() {
  const [stage, setStage] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const setBooted = useStore((s) => s.setBooted);
  const hasBooted = useStore((s) => s.hasBooted);

  useEffect(() => {
    if (hasBooted) return;
    // Reduced-motion: skip the cinematic boot sequence entirely.
    if (prefersReducedMotion()) { setBooted(true); return; }
    const t1 = setTimeout(() => setStage(1), 600);
    const t2 = setTimeout(() => setStage(2), 900);
    const t3 = setTimeout(() => setStatusIndex(1), 1100);
    const t4 = setTimeout(() => setStatusIndex(2), 1400);
    const t5 = setTimeout(() => setStage(3), 1500);
    const t6 = setTimeout(() => setBooted(true), 1850);
    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, [hasBooted, setBooted]);

  return (
    <AnimatePresence>
      {!hasBooted && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-void"
          initial={{ clipPath: 'inset(0 0 0 0)' }}
          animate={
            stage >= 3
              ? { clipPath: 'inset(0 0 100% 0)' }
              : { clipPath: 'inset(0 0 0 0)' }
          }
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        >
          <div className="relative flex flex-col items-center gap-7">
            {/* Brand logo — scales up and settles as the system boots */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.82, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Soft brand glow behind the mark */}
              <div
                className="absolute inset-0 -m-8 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(59,130,246,0.4), transparent 70%)',
                  filter: 'blur(24px)',
                }}
                aria-hidden="true"
              />
              {/* Primary lockup — the badge carries its own wordmark, which is
                  what the boot moment should show. */}
              <Image
                src="/brand/sheetflow-primary.svg"
                alt="SheetFlow"
                width={112}
                height={112}
                priority
                unoptimized
                className="relative"
              />
            </motion.div>

            {/* Status + progress */}
            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0 }}
              animate={stage >= 2 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="h-px w-44 overflow-hidden bg-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent-bright to-violet-bright"
                  initial={{ width: '0%' }}
                  animate={stage >= 2 ? { width: '100%' } : { width: '0%' }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={statusIndex}
                  className="font-mono text-[10px] uppercase tracking-widest text-white/40"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                >
                  {STATUS_LINES[statusIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
