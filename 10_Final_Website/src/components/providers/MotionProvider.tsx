'use client';

/**
 * MotionProvider — sets `reducedMotion="user"` on Framer Motion's MotionConfig
 * so every motion component in the tree automatically respects the OS-level
 * `prefers-reduced-motion` media query.
 *
 * Without this, Framer Motion ignores the system preference by default.
 * Placing it at the layout root means zero per-component boilerplate.
 */

import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { useStore } from '@/lib/store';

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  const setReducedMotion = useStore((s) => s.setReducedMotion);

  // MotionConfig's reducedMotion="user" only covers Framer's own declarative
  // animate/whileInView props. Anything driven by raw useTransform/useSpring
  // values in a style prop (Parallax, WorkflowUniverse's intensity, FinalCTA's
  // descent) bypasses it entirely, and every plain matchMedia() check elsewhere
  // in the app was a one-shot read with no live-update listener. This makes
  // store.reducedMotion an actually-reactive source those components can read.
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [setReducedMotion]);

  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
