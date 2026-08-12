'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/utils';

/**
 * AmbientBackground — page-wide living atmosphere behind every section.
 *
 * All continuous motion is CSS keyframe animation on `transform` only, so the
 * background stays alive even when the pointer is still and the GPU never
 * repaints the full viewport per frame (each layer's gradient is painted once
 * to its own composited layer, then rotated / translated / scaled):
 *   1. Two large radial aurora blobs (blue + gold), offset inside oversized
 *      counter-rotating wrappers, so they slowly *orbit* — the ambient weather.
 *   2. A gentle breathing scale on the whole aurora group.
 *   3. A soft diagonal light sheen that drifts across and fades.
 *   4. A subtle, additive (plus-lighter) cursor glow that follows the pointer
 *      — low opacity, small, starts invisible; only adds a whisper of light,
 *      never sits on content as an opaque disc.
 *
 * Under prefers-reduced-motion: JS early-returns (no listeners / RAF, the glow
 * never fades in) and the CSS media query disables every keyframe animation.
 */
export default function AmbientBackground() {
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const g = glow.current;
    if (!g) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let gx = mouseX;
    let gy = mouseY;
    let shown = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!shown) {
        shown = true;
        g.style.opacity = '1';
      }
    };

    const tick = () => {
      // Soft lerp — trails the pointer without ever snapping to a hard disc.
      gx += (mouseX - gx) * 0.1;
      gy += (mouseY - gy) * 0.1;
      g.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
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
      <style>{ambientCss}</style>

      {/* Breathing group holds the orbiting + central aurora layers. */}
      <div className="ambient-breathe absolute inset-0">
        {/* Azure aurora — orbits clockwise. Oversized wrapper (-inset-1/4) so
            the rotating rectangle's corners never enter the viewport. */}
        <div className="ambient-spin-a absolute -inset-1/4 will-change-transform">
          <div
            className="absolute left-[12%] top-[8%] h-[68%] w-[68%]"
            style={{
              background:
                'radial-gradient(circle at center, rgba(59, 130, 246, 0.30), rgba(96, 165, 250, 0.12) 38%, transparent 64%)',
            }}
          />
        </div>

        {/* Gold aurora — counter-orbits slower, positioned opposite.
            RC6: 0.22 → 0.07. This layer is *fixed to the viewport*, so it was
            painting over all ten chapters at an alpha nearly double the
            strongest wash any chapter is allowed to spend — the atmosphere
            budget in `content/narrative.ts` was being set on a canvas that had
            already ignored it.
            The visible symptom was worse than the accounting one: gold at 0.22
            over `--color-void` (#060608), next to the azure layer, resolves to
            a desaturated olive. Read off the 1440 capture, that haze covered
            the right third of frames 02–14. Gold is now what § 2 of the DNA
            says it is — the mark on an outcome — rather than the colour of the
            page's air. */}
        <div className="ambient-spin-b absolute -inset-1/4 will-change-transform">
          <div
            className="absolute bottom-[10%] right-[14%] h-[60%] w-[60%]"
            style={{
              background:
                'radial-gradient(circle at center, rgba(233, 162, 59, 0.07), rgba(244, 192, 99, 0.035) 40%, transparent 66%)',
            }}
          />
        </div>

        {/* Central aurora — always present so mid-page sections are never a
            flat void; it breathes with the group and gently rotates so the
            middle of every screen stays alive as you scroll.
            RC6: its gold mid-stop is gone. It sat at the centre of every
            viewport, which is exactly where the reader is, so it was the layer
            doing the most to make white text sit on a warm grey rather than on
            void. Cool the middle and the type gets its contrast back for free. */}
        <div className="ambient-spin-b absolute -inset-1/4 will-change-transform">
          <div
            className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.13), rgba(96, 165, 250, 0.05) 45%, transparent 68%)',
            }}
          />
        </div>
      </div>

      {/* Diagonal light sheen — drifts across and fades, mix-blend adds light. */}
      <div
        className="ambient-sheen absolute -inset-1/4 will-change-transform"
        style={{
          background:
            'linear-gradient(115deg, transparent 38%, rgba(147, 197, 253, 0.06) 50%, transparent 62%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Cyan horizon — static "signal-info" moment anchored at the bottom edge.
          0.08 → 0.05: cyan is a third hue on a page whose palette is two, and
          at the old value it tinted the footer green wherever the gold layer
          reached it. It is a horizon, not a light source. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 60% at 50% 100%, rgba(6, 182, 212, 0.05), transparent 70%)',
        }}
      />

      {/* Cursor glow — small, additive, starts invisible. Centered on the
          pointer via -180px margins; JS ramps opacity to 1 on first move.
          `plus-lighter` means it only ADDS light, so it can never read as an
          opaque blob covering the headline or CTAs. */}
      <div
        ref={glow}
        className="absolute left-0 top-0 -ml-[260px] -mt-[260px] h-[520px] w-[520px] rounded-full opacity-0 will-change-transform"
        style={{
          /* Single-hue since RC6. `plus-lighter` *adds*, so a gold mid-stop
             under the pointer was painting warm light onto whatever the reader
             was looking at — the one place on the page a colour cast is least
             affordable. */
          background:
            'radial-gradient(circle, rgba(96, 165, 250, 0.20) 0%, rgba(147, 197, 253, 0.07) 42%, transparent 70%)',
          mixBlendMode: 'plus-lighter',
          transition: 'opacity 700ms ease-out',
        }}
      />
    </div>
  );
}

const ambientCss = `
@keyframes ambient-spin-a { to { transform: rotate(360deg); } }
@keyframes ambient-spin-b { to { transform: rotate(-360deg); } }
@keyframes ambient-breathe {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.07); }
}
@keyframes ambient-sheen {
  0%   { transform: translate3d(-22%, 0, 0); opacity: 0; }
  25%  { opacity: 1; }
  75%  { opacity: 1; }
  100% { transform: translate3d(22%, 0, 0); opacity: 0; }
}
.ambient-spin-a { animation: ambient-spin-a 90s linear infinite; }
.ambient-spin-b { animation: ambient-spin-b 130s linear infinite; }
.ambient-breathe { animation: ambient-breathe 16s ease-in-out infinite; }
.ambient-sheen { animation: ambient-sheen 26s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .ambient-spin-a, .ambient-spin-b, .ambient-breathe, .ambient-sheen {
    animation: none !important;
  }
  .ambient-sheen { opacity: 0 !important; }
}
`;
