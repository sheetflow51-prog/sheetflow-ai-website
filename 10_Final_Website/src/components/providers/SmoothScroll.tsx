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
    if (prefersReducedMotion()) {
      // Lenis never mounts here, and setScrollProgress is otherwise only
      // ever called from Lenis's own 'scroll' event below — without this,
      // ScrollProgress's top gradient bar is permanently frozen at 0% for
      // every reduced-motion user, for the entire session.
      const onNativeScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(max > 0 ? window.scrollY / max : 0);
      };
      onNativeScroll();
      window.addEventListener('scroll', onNativeScroll, { passive: true });
      return () => window.removeEventListener('scroll', onNativeScroll);
    }

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

    // Route same-page anchor links (nav, footer, CTA buttons) through Lenis
    // instead of the browser's native jump-scroll, so in-page navigation
    // matches the smooth-scroll feel everywhere else on the site.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -84 });
    };
    document.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', onClick);
      lenis.destroy();
    };
  }, [setScrollProgress]);

  return <>{children}</>;
}
