'use client';

import { useEffect } from 'react';
import { ensureGsapRegistered, syncScrollTriggerWithLenis } from '@/lib/gsap';

/**
 * GsapProvider — registers plugins, installs custom eases,
 * and pipes Lenis's scroll value into ScrollTrigger.
 * Mount once near the root, after SmoothScroll.
 */
export default function GsapProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ensureGsapRegistered();
    // Defer Lenis sync until Lenis has registered itself on window
    const id = window.setTimeout(() => syncScrollTriggerWithLenis(), 0);
    return () => window.clearTimeout(id);
  }, []);

  return <>{children}</>;
}
