'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import * as React from 'react';

interface ParallaxProps {
  children: React.ReactNode;
  /** Total Y travel range in px from top to bottom of viewport. Negative = upward. */
  range?: number;
  /** Optional rotational drift in degrees across the same range. */
  rotate?: number;
  /** Optional scale travel across the range (1 = no scale). */
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-hidden'?: boolean | 'true' | 'false';
}

/**
 * Parallax — wraps an element with scroll-driven depth.
 * Layered on hero & section backgrounds to create cinematic stacking.
 */
export function Parallax({
  children,
  range = 80,
  rotate = 0,
  scale = 1,
  className,
  style,
  ...props
}: ParallaxProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.5 });

  const y = useTransform(smooth, [0, 1], [range / 2, -range / 2]);
  const r = useTransform(smooth, [0, 1], [-rotate / 2, rotate / 2]);
  const s = useTransform(smooth, [0, 0.5, 1], [scale, 1, scale]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y, rotate: r, scale: s, ...style }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
