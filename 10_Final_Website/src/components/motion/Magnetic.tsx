'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import * as React from 'react';
import { isTouchDevice, prefersReducedMotion } from '@/lib/utils';

interface MagneticProps {
  children: React.ReactNode;
  /** Maximum offset in pixels at the corner. */
  strength?: number;
  /** Inner content scaling factor (1 = no scale). */
  inner?: number;
  className?: string;
}

/**
 * Magnetic — wrap any element to give it elastic magnetic hover.
 * The element itself drifts toward the cursor; the {children} receive
 * a stronger drift, creating a depth-of-field illusion.
 */
export function Magnetic({ children, strength = 18, inner = 1.4, className }: MagneticProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 220, damping: 22, mass: 0.6 });
  const innerX = useTransform(sx, (v) => v * inner);
  const innerY = useTransform(sy, (v) => v * inner);

  React.useEffect(() => {
    if (prefersReducedMotion() || isTouchDevice()) return;
    const node = ref.current;
    if (!node) return;

    const onMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      x.set(dx * strength);
      y.set(dy * strength);
    };
    const onLeave = () => {
      x.set(0);
      y.set(0);
    };

    node.addEventListener('mousemove', onMove);
    node.addEventListener('mouseleave', onLeave);
    return () => {
      node.removeEventListener('mousemove', onMove);
      node.removeEventListener('mouseleave', onLeave);
    };
  }, [strength, x, y]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy, display: 'inline-block' }}
    >
      <motion.div style={{ x: innerX, y: innerY }}>{children}</motion.div>
    </motion.div>
  );
}
