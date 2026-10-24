'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { prefersReducedMotion } from '@/lib/utils';
import { EASE } from '@/lib/motion';

/**
 * Intelligence Boot Sequence.
 * Stages:
 *   0 — mark draws (SVG line trace, 600ms)
 *   1 — wordmark drops in (300ms)
 *   2 — status text cycles + progress fills (700ms)
 *   3 — clip-path reveal (300ms)
 * Total ≈ 1600ms.
 *
 * ## Homepage only — and this was a measured decision, not a taste one
 *
 * This renders `fixed inset-0 z-[100] bg-void`: an opaque overlay across the
 * whole viewport, held ~1,850 ms before the reveal starts. It lived in the root
 * layout, so once the site gained routes it played on **every** one of them.
 *
 * That pinned Largest Contentful Paint to a timer instead of to content. Mobile
 * LCP measured **4.3–4.5 s on three routes with wildly different payloads** —
 * the homepage and two service pages, one of which scores 97 on desktop. A
 * metric that refuses to move with content is not measuring content. FCP stayed
 * fast (0.8–0.9 s) throughout, because the thing painting quickly *was* this
 * overlay.
 *
 * It is also the wrong experience off the homepage. A service page is a search
 * landing surface; someone arriving from a Google result for "whatsapp
 * automation" should not sit through a brand boot animation before reading the
 * answer they clicked for.
 *
 * The sequence is kept exactly as designed where it was designed to live — the
 * homepage, first impression, once per session. Everywhere else it marks the
 * app booted immediately and renders nothing.
 *
 * Reverting is one line: drop the `isHome` guard. Doing so also reverts the
 * measured LCP improvement recorded in TOOLING_MANIFEST.
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
  const isHome = usePathname() === '/';

  useEffect(() => {
    if (hasBooted) return;
    // Off the homepage there is no boot sequence — mark the app booted so any
    // consumer gated on `hasBooted` proceeds immediately.
    if (!isHome) { setBooted(true); return; }
    // Reduced-motion: skip the cinematic boot sequence entirely.
    if (prefersReducedMotion()) { setBooted(true); return; }
    const t1 = setTimeout(() => setStage(1), 600);
    const t2 = setTimeout(() => setStage(2), 900);
    const t3 = setTimeout(() => setStatusIndex(1), 1100);
    const t4 = setTimeout(() => setStatusIndex(2), 1400);
    const t5 = setTimeout(() => setStage(3), 1500);
    const t6 = setTimeout(() => setBooted(true), 1850);
    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, [hasBooted, setBooted, isHome]);

  // Short-circuit the render, not just the timers. The effect above runs after
  // the first paint, so relying on it alone would flash a full-screen opaque
  // overlay for one frame on every sub-page — which is the exact thing being
  // removed, briefly.
  if (!isHome) return null;

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
          transition={{ duration: 0.5, ease: EASE }}
          aria-hidden="true"
        >
          <div className="relative flex flex-col items-center gap-7">
            {/* Brand logo — scales up and settles as the system boots */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.82, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              {/* Soft brand glow behind the mark */}
              <div
                className="absolute inset-0 -m-8 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgb(var(--color-accent) / 0.4), transparent 70%)',
                  filter: 'blur(24px)',
                }}
                aria-hidden="true"
              />
              {/* The full canonical lockup, cut from logo.png per DEC-301.
                  A fixed 112px slot needs no vector. */}
              <Image
                src="/brand/raster/lockup-256.png"
                alt="SheetFlow"
                width={112}
                height={112}
                priority
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
                  transition={{ duration: 0.7, ease: EASE }}
                />
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={statusIndex}
                  className="font-mono text-[10px] uppercase tracking-widest text-white/[var(--load-a)]"
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
