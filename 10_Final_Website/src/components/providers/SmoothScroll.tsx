'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { useStore } from '@/lib/store';
import { prefersReducedMotion } from '@/lib/utils';

/**
 * SmoothScroll — Lenis-powered cinematic scroll.
 * Lenis exposes a normalized scroll value with smoothing,
 * which downstream GSAP ScrollTriggers and Framer scroll hooks read from.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const setScrollProgress = useStore((s) => s.setScrollProgress);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // ease-out-expo
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      lerp: 0.1,
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    lenis.on('scroll', ({ progress }: { progress: number }) => {
      setScrollProgress(progress);
    });

    // Expose globally for GSAP integration if needed
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [setScrollProgress]);

  return <>{children}</>;
}
