'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/utils';

/**
 * AmbientBackground — page-wide gradient atmosphere that drifts
 * at low frequency and reacts to the cursor position.
 * Sits behind every section as a single fixed layer.
 */
export default function AmbientBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const node = ref.current;
    if (!node) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let curX = mouseX;
    let curY = mouseY;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const tick = () => {
      curX += (mouseX - curX) * 0.04;
      curY += (mouseY - curY) * 0.04;
      const px = (curX / window.innerWidth) * 100;
      const py = (curY / window.innerHeight) * 100;
      node.style.setProperty('--ax', `${px}%`);
      node.style.setProperty('--ay', `${py}%`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={
        {
          background: `
            radial-gradient(ellipse 70% 50% at var(--ax, 30%) var(--ay, 30%), rgba(99, 102, 241, 0.18), transparent 60%),
            radial-gradient(ellipse 60% 50% at calc(100% - var(--ax, 30%)) calc(100% - var(--ay, 30%)), rgba(139, 92, 246, 0.10), transparent 60%),
            radial-gradient(ellipse 100% 60% at 50% 100%, rgba(6, 182, 212, 0.05), transparent 70%)
          `,
        } as React.CSSProperties
      }
    />
  );
}
