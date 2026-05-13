'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import * as React from 'react';
import { cn, isTouchDevice, prefersReducedMotion } from '@/lib/utils';

interface TiltCardProps {
  children: React.ReactNode;
  /** Maximum tilt angle in degrees. */
  max?: number;
  /** Glow follow opacity at full intensity. */
  glow?: number;
  /** Z-axis lift on hover, in px. */
  lift?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * TiltCard — depth-reactive 3D card.
 * Tilts toward the cursor + projects a soft radial highlight that tracks the
 * pointer in real time. Works as a wrapper around any content.
 */
export function TiltCard({
  children,
  max = 8,
  glow = 0.18,
  lift = 14,
  className,
  style,
}: TiltCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const z = useMotionValue(0);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);

  const srx = useSpring(rx, { stiffness: 240, damping: 24 });
  const sry = useSpring(ry, { stiffness: 240, damping: 24 });
  const sz = useSpring(z, { stiffness: 240, damping: 24 });

  const background = useTransform([mx, my], (latest) => {
    const [x, y] = latest as number[];
    return `radial-gradient(circle at ${x}% ${y}%, rgba(165, 180, 252, ${glow}), transparent 55%)`;
  });

  React.useEffect(() => {
    if (prefersReducedMotion() || isTouchDevice()) return;
    const node = ref.current;
    if (!node) return;

    const onMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      rx.set((0.5 - py) * max * 2);
      ry.set((px - 0.5) * max * 2);
      mx.set(px * 100);
      my.set(py * 100);
      z.set(lift);
    };
    const onLeave = () => {
      rx.set(0);
      ry.set(0);
      z.set(0);
    };

    node.addEventListener('mousemove', onMove);
    node.addEventListener('mouseleave', onLeave);
    return () => {
      node.removeEventListener('mousemove', onMove);
      node.removeEventListener('mouseleave', onLeave);
    };
  }, [lift, max, mx, my, rx, ry, z]);

  return (
    <motion.div
      ref={ref}
      className={cn('relative', className)}
      style={{
        rotateX: srx,
        rotateY: sry,
        z: sz,
        transformStyle: 'preserve-3d',
        perspective: 1000,
        ...style,
      }}
    >
      {children}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-screen"
        style={{ background }}
        aria-hidden="true"
      />
    </motion.div>
  );
}
