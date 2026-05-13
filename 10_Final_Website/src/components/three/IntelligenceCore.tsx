'use client';

import dynamic from 'next/dynamic';
import { SPLINE_SCENES, type SplineSceneKey } from '@/lib/spline-scenes';

/**
 * IntelligenceCore — the brand's central 3D surface.
 *
 * Progressive enhancement: if NEXT_PUBLIC_SPLINE_SCENE_<KEY> is set,
 * the Spline scene mounts with AICore as the poster / loading fallback.
 * If the env var is empty (the default), AICore renders directly.
 * The site is fully shippable in either state.
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

export default function IntelligenceCore({
  scene = 'hero',
  disableInteraction = false,
  skipOnTouch = false,
  className = '',
  label = 'Intelligence core',
}: IntelligenceCoreProps) {
  const sceneUrl = SPLINE_SCENES[scene];

  // No URL configured → render R3F AICore directly (R3F is the spec-compliant fallback)
  if (!sceneUrl) {
    return <AICore className={className} />;
  }

  // URL configured → mount Spline scene with AICore as the poster while loading
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
