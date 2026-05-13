'use client';

import { AnimatePresence, motion } from 'framer-motion';
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
  'Initializing Intelligence...',
  'Loading systems...',
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
          <div className="relative flex flex-col items-center gap-8">
            {/* Logo mark — drawn by SVG */}
            <motion.svg
              width="56"
              height="56"
              viewBox="0 0 56 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="overflow-visible"
            >
              <motion.path
                d="M14 18 L42 18 M14 28 L42 28 M14 38 L42 38"
                stroke="url(#bootGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.circle
                cx="28"
                cy="28"
                r="22"
                stroke="url(#bootGrad)"
                strokeWidth="1"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              />
              <defs>
                <linearGradient id="bootGrad" x1="0" y1="0" x2="56" y2="56">
                  <stop offset="0%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#A78BFA" />
                </linearGradient>
              </defs>
            </motion.svg>

            {/* Wordmark */}
            <motion.div
              className="font-display text-2xl font-semibold tracking-tight"
              initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
              animate={
                stage >= 1
                  ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                  : { opacity: 0, y: 8, filter: 'blur(8px)' }
              }
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              SheetFlow<span className="text-accent-bright">.</span>AI
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
