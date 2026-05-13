'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { prefersReducedMotion } from '@/lib/utils';

/**
 * Awakening — Signature Moment #1: HERO AI AWAKENING.
 *
 * After the LoadingScreen exits, this component plays a single,
 * non-repeating cinematic flourish:
 *
 *   t=0     a faint indigo bloom expands from screen-center
 *   t=300   a thin radial halo sweeps outward (one ring)
 *   t=600   a soft particle wash fades through (signal arrival)
 *   t=1100  the bloom decays, leaving the steady hero state
 *
 * No bounce. No "ta-da". The system simply *comes online*.
 *
 * The component disposes itself once the timeline completes.
 */
export default function Awakening() {
  const hasBooted = useStore((s) => s.hasBooted);
  const setProgress = useStore((s) => s.setAwakeningProgress);
  const ranRef = useRef(false);

  useEffect(() => {
    if (!hasBooted) return;
    if (ranRef.current) return;
    ranRef.current = true;
    if (prefersReducedMotion()) {
      setProgress(1);
      return;
    }
    const start = performance.now();
    const duration = 1400;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hasBooted, setProgress]);

  return (
    <AnimatePresence>
      {hasBooted && (
        <motion.div
          key="awakening"
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 1.6,
            times: [0, 0.18, 0.7, 1],
            ease: [0.16, 1, 0.3, 1],
          }}
          onAnimationComplete={() => {
            // Once the awakening finishes, we let the component unmount
            // by toggling a state — but here we just stop animating.
          }}
        >
          {/* Central bloom */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.2, 1.6, 1.8], opacity: [0, 0.9, 0.6, 0] }}
            transition={{
              duration: 1.6,
              times: [0, 0.3, 0.6, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div
              className="h-[40vh] w-[40vh] rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(129,140,248,0.45) 0%, rgba(99,102,241,0.18) 40%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
          </motion.div>

          {/* Radial halo sweep */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-bright/60"
            initial={{ width: 80, height: 80, opacity: 0 }}
            animate={{
              width: ['80px', '70vmax'],
              height: ['80px', '70vmax'],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 1.2,
              delay: 0.3,
              times: [0, 0.3, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              boxShadow: '0 0 40px rgba(129,140,248,0.4)',
            }}
          />

          {/* Vertical wash — soft top-to-bottom indigo veil */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0] }}
            transition={{
              duration: 1.2,
              delay: 0.2,
              times: [0, 0.4, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              background:
                'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(99,102,241,0.18), transparent 60%)',
              mixBlendMode: 'screen',
            }}
          />

          {/* Whisper line — single horizontal scan, low opacity */}
          <motion.div
            className="absolute left-0 right-0 h-px"
            initial={{ top: '50%', opacity: 0 }}
            animate={{ top: ['50%', '0%', '100%'], opacity: [0, 0.4, 0] }}
            transition={{
              duration: 1.4,
              delay: 0.4,
              times: [0, 0.5, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(165,180,252,0.7), transparent)',
              boxShadow: '0 0 20px rgba(165,180,252,0.5)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
