'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/utils';

/**
 * AmbientBackground — page-wide gradient atmosphere that drifts
 * at low frequency and reacts to the cursor position.
 * Sits behind every section as a single fixed layer.
 *
 * Compositor-friendly: the two cursor-reactive gradients live on their
 * own absolutely-positioned "blob" layers and are moved with
 * transform: translate3d() (GPU composite, no repaint) instead of
 * animating gradient positions (full-viewport repaint every frame).
 */
export default function AmbientBackground() {
  const blobA = useRef<HTMLDivElement>(null);
  const blobB = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const a = blobA.current;
    const b = blobB.current;
    if (!a || !b) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let curX = mouseX;
    let curY = mouseY;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const tick = (time: number) => {
      // Same lerp feel as before (0.04).
      curX += (mouseX - curX) * 0.04;
      curY += (mouseY - curY) * 0.04;
      // Slow autonomous drift, independent of the cursor — otherwise the
      // atmosphere is completely frozen whenever the mouse isn't moving.
      const driftX = Math.sin(time * 0.00014) * 14;
      const driftY = Math.cos(time * 0.00011) * 12;
      const px = (curX / window.innerWidth) * 100 + driftX;
      const py = (curY / window.innerHeight) * 100 + driftY;
      // Blob A center was at (px%, py%); a viewport-sized layer centered at
      // 50% reaches that center by translating (px-50, py-50). Blob B mirrors it.
      a.style.transform = `translate3d(${px - 50}%, ${py - 50}%, 0)`;
      b.style.transform = `translate3d(${50 - px}%, ${50 - py}%, 0)`;
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
      {/* Indigo aurora — cursor-reactive. Rest position mirrors the old 30% 30%. */}
      <div
        ref={blobA}
        className="absolute inset-0 will-change-transform"
        style={{
          transform: 'translate3d(-20%, -20%, 0)',
          background:
            'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(99, 102, 241, 0.26), transparent 62%)',
        }}
      />
      {/* Violet aurora — counter-positioned, cursor-reactive. */}
      <div
        ref={blobB}
        className="absolute inset-0 will-change-transform"
        style={{
          transform: 'translate3d(20%, 20%, 0)',
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139, 92, 246, 0.16), transparent 62%)',
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
    </div>
  );
}
