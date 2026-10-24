'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { SPLINE_SCENES, type SplineSceneKey } from '@/lib/spline-scenes';
import { isTouchDevice, prefersReducedMotion } from '@/lib/utils';

/**
 * IntelligenceCore — the brand's central 3D surface.
 *
 * Progressive enhancement: if NEXT_PUBLIC_SPLINE_SCENE_<KEY> is set,
 * the Spline scene mounts with AICore as the poster / loading fallback.
 * If the env var is empty (the default), AICore renders directly.
 * The site is fully shippable in either state.
 *
 * The R3F fallback path is gated the same way SplineScene already gates
 * itself (reduced-motion bypass, optional skip-on-touch, lazy IntersectionObserver
 * mount) — previously it had none of this, so the Canvas + Bloom pipeline ran
 * unconditionally from first paint, on mobile too, even while off-screen
 * (e.g. FinalCTA's instance, which sits at the bottom of the page for most
 * of a session).
 *
 * Spline integration notes (SPLINE_CINEMATIC_EXECUTION_SYSTEM.md §6):
 *   • @splinetool/react-spline is ESM-only. Its `exports` field declares
 *     only `types` + `import` conditions, which Next 15's webpack
 *     resolver rejects out of the box. Fixed in next.config.mjs by
 *     extending `resolve.conditionNames` with `import` + `default` and
 *     listing both Spline packages under `transpilePackages`.
 *   • Env vars must be prefixed NEXT_PUBLIC_ and set in both .env.local
 *     and Vercel → Settings → Environment Variables (per scope).
 *   • Empty string = R3F fallback. This is a valid production state.
 */

const AICore = dynamic(() => import('./AICore'), {
  ssr: false,
  loading: () => null,
});

const SplineScene = dynamic(() => import('./SplineScene'), {
  ssr: false,
  loading: () => null,
});

export interface IntelligenceCoreProps {
  /** Which Spline scene to load (maps to NEXT_PUBLIC_SPLINE_SCENE_<KEY>). */
  scene?: SplineSceneKey;
  /** Disable pointer events on the 3D canvas. Recommended for decorative scenes. */
  disableInteraction?: boolean;
  /** Skip mounting on touch/mobile devices to preserve battery. */
  skipOnTouch?: boolean;
  className?: string;
  label?: string;
}

/**
 * Static, no-WebGL glow shown instead of a live AICore instance whenever
 * motion should genuinely be reduced — mounting a real R3F Canvas here would
 * defeat the point of the reduced-motion bypass.
 */
function StaticCoreGlow({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex h-full w-full items-center justify-center ${className}`} aria-hidden="true">
      <div
        className="h-2/3 w-2/3 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(96, 165, 250,0.35), transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
    </div>
  );
}

export default function IntelligenceCore({
  scene = 'hero',
  disableInteraction = false,
  skipOnTouch = false,
  className = '',
  label = 'Intelligence core',
}: IntelligenceCoreProps) {
  const sceneUrl = SPLINE_SCENES[scene];
  const wrapRef = useRef<HTMLDivElement>(null);
  const [bypass, setBypass] = useState(false);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion() || (skipOnTouch && isTouchDevice())) {
      setBypass(true);
      return;
    }
    const node = wrapRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldMount(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [skipOnTouch]);

  // Spline path already implements this exact gating internally (including
  // its own poster fade-in) — hand off to it unchanged when a scene is set.
  if (sceneUrl) {
    return (
      <SplineScene
        scene={sceneUrl}
        disableInteraction={disableInteraction}
        skipOnTouch={skipOnTouch}
        className={className}
        label={label}
        poster={<AICore className={className} />}
      />
    );
  }

  return (
    <div ref={wrapRef} className={`relative h-full w-full ${className}`} role="img" aria-label={label}>
      {bypass ? (
        <StaticCoreGlow />
      ) : shouldMount ? (
        <AICore className={className} />
      ) : null}
    </div>
  );
}
