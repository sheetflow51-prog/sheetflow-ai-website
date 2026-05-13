'use client';

import { motion, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';
import { useRef } from 'react';

/**
 * SectionHandoff — Signature scroll-aware divider.
 *
 * Replaces the static `<Divider />` between sections. Visibly:
 *   - Slow scroll: a calm 1px gradient line, almost invisible
 *   - Fast scroll: the line briefly glows + extends, marking a "scene cut"
 *
 * The effect is a cinematic seam — the user *feels* the section change
 * without being told. Subtle and only legible at speed; invisible at rest.
 */
export function SectionHandoff() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const v = useVelocity(scrollY);
  const sv = useSpring(useMotionValue(0), { stiffness: 200, damping: 28 });

  // Map abs velocity to a 0..1 "intensity"
  // Velocity is in px/sec — 1500 px/sec is a vigorous flick.
  const intensity = useTransform(v, (val) => {
    const abs = Math.min(Math.abs(val) / 1500, 1);
    sv.set(abs);
    return abs;
  });

  // The calm vs. cut visuals
  const glow = useTransform(sv, (val) => val * 0.6);
  const scaleX = useTransform(sv, (val) => 0.6 + val * 0.4);
  const opacity = useTransform(sv, (val) => 0.3 + val * 0.7);

  return (
    <div ref={ref} className="container-edge" aria-hidden="true">
      <div className="relative h-px overflow-visible">
        {/* Idle calm line */}
        <motion.div
          className="absolute inset-0 origin-center"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.10) 30%, rgba(255,255,255,0.10) 70%, transparent)',
            opacity,
            scaleX,
          }}
        />
        {/* Velocity glow */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(129,140,248,0.5) 50%, transparent)',
            opacity: glow,
            filter: 'blur(2px)',
          }}
        />
        {/* Read for accessibility tree only */}
        <span className="sr-only">section handoff</span>
        {/* Hidden but referenced — keeps `intensity` reading active */}
        <motion.div className="hidden" style={{ opacity: intensity }} />
      </div>
    </div>
  );
}
