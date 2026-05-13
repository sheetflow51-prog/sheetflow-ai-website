'use client';

/**
 * MotionProvider — sets `reducedMotion="user"` on Framer Motion's MotionConfig
 * so every motion component in the tree automatically respects the OS-level
 * `prefers-reduced-motion` media query.
 *
 * Without this, Framer Motion ignores the system preference by default.
 * Placing it at the layout root means zero per-component boilerplate.
 */

import { MotionConfig } from 'framer-motion';

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
