'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/utils';

/**
 * AmbientBackground — page-wide living atmosphere behind every section.
 *
 * Three layers, all moved with transform: translate3d() (GPU composite, no
 * per-frame repaint):
 *   1. Two large aurora blobs (blue + gold) that slowly drift on their own
 *      AND react to the cursor — the ambient "weather".
 *   2. A tighter, brighter spotlight that tracks the cursor closely, so the
 *      page visibly responds to the pointer everywhere, not just the hero.
 * Under prefers-reduced-motion it renders a calm static frame (no listeners).
 */
export default function AmbientBackground() {
  const blobA = useRef<HTMLDivElement>(null);
  const blobB = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const a = blobA.current;
    const b = blobB.current;
    const s = spot.current;
    if (!a || !b || !s) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    // Slow-following aurora centers (as % of viewport).
    let curX = mouseX;
    let curY = mouseY;
    // Tight-following spotlight center (in px).
    let spotX = mouseX;
    let spotY = mouseY;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const tick = (time: number) => {
      // Aurora: gentle lerp + slow autonomous drift so it breathes even when idle.
      curX += (mouseX - curX) * 0.04;
      curY += (mouseY - curY) * 0.04;
      const driftX = Math.sin(time * 0.00014) * 14;
      const driftY = Math.cos(time * 0.00011) * 12;
      const px = (curX / window.innerWidth) * 100 + driftX;
      const py = (curY / window.innerHeight) * 100 + driftY;
      a.style.transform = `translate3d(${px - 50}%, ${py - 50}%, 0)`;
      b.style.transform = `translate3d(${50 - px}%, ${50 - py}%, 0)`;

      // Spotlight: tighter lerp → clearly tracks the pointer.
      spotX += (mouseX - spotX) * 0.12;
      spotY += (mouseY - spotY) * 0.12;
      s.style.transform = `translate3d(${spotX}px, ${spotY}px, 0)`;

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
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Indigo→azure aurora — cursor-reactive weather. */}
      <div
        ref={blobA}
        className="absolute inset-0 will-change-transform"
        style={{
          transform: 'translate3d(-20%, -20%, 0)',
          background:
            'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(59, 130, 246, 0.28), transparent 62%)',
        }}
      />
      {/* Gold aurora — counter-positioned, cursor-reactive. */}
      <div
        ref={blobB}
        className="absolute inset-0 will-change-transform"
        style={{
          transform: 'translate3d(20%, 20%, 0)',
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(233, 162, 59, 0.18), transparent 62%)',
        }}
      />
      {/* Cyan horizon — static "signal-info" moment anchored at the bottom edge. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 60% at 50% 100%, rgba(6, 182, 212, 0.08), transparent 70%)',
        }}
      />
      {/* Cursor spotlight — a 720px glow centered on the pointer (via -360px
          margins) that follows it closely, making the whole page feel live. */}
      <div
        ref={spot}
        className="absolute left-0 top-0 -ml-[360px] -mt-[360px] h-[720px] w-[720px] rounded-full will-change-transform"
        style={{
          background:
            'radial-gradient(circle, rgba(96, 165, 250, 0.14) 0%, rgba(244, 192, 99, 0.06) 40%, transparent 70%)',
        }}
      />
    </div>
  );
}
