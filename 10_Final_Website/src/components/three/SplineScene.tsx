'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { isTouchDevice, prefersReducedMotion } from '@/lib/utils';

// react-spline is heavy; lazy-load to keep it out of the critical bundle.
// The package is ESM-only and its `exports` field declares no
// `require`/`default` conditions, so Next 15 webpack cannot resolve it
// out of the box. It is listed in `transpilePackages` (next.config.mjs)
// to route it through Next's loader chain instead of the bare resolver.
const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => null,
});

export interface SplineSceneProps {
  /** URL of the .splinecode export (e.g. https://prod.spline.design/.../scene.splinecode) */
  scene: string;
  /** Optional poster shown until the scene is loaded (and on reduced-motion devices). */
  poster?: React.ReactNode;
  /** Disable mouse interaction (some scenes look cleaner without orbit). */
  disableInteraction?: boolean;
  /** Mount only when the wrapper enters the viewport. Default true. */
  lazy?: boolean;
  /** Skip mounting on touch devices to save battery. Default false (still mounts). */
  skipOnTouch?: boolean;
  /** Wrapper class. */
  className?: string;
  /** Aria label for the scene. */
  label?: string;
  /** Optional callback once Spline has loaded the scene. */
  onLoaded?: () => void;
}

/**
 * SplineScene — production-grade Spline wrapper.
 *
 * - Lazy-mounts via IntersectionObserver
 * - Falls back to {poster} when reduced-motion is preferred
 * - Optionally skips on touch devices
 * - Eats pointer events when {disableInteraction}
 * - Fades in on load to avoid pop-in
 */
export default function SplineScene({
  scene,
  poster,
  disableInteraction = false,
  lazy = true,
  skipOnTouch = false,
  className = '',
  label = '3D scene',
  onLoaded,
}: SplineSceneProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(!lazy);
  const [loaded, setLoaded] = useState(false);
  const [bypass, setBypass] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setBypass(true);
      return;
    }
    if (skipOnTouch && isTouchDevice()) {
      setBypass(true);
      return;
    }
    if (!lazy) return;
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
  }, [lazy, skipOnTouch]);

  return (
    <div
      ref={wrapRef}
      className={`relative h-full w-full overflow-hidden ${className}`}
      role="img"
      aria-label={label}
    >
      {/* Poster / fallback layer */}
      {poster && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${loaded && !bypass ? 'opacity-0' : 'opacity-100'}`}
          aria-hidden={loaded ? 'true' : 'false'}
        >
          {poster}
        </div>
      )}

      {/* The Spline scene itself */}
      {!bypass && shouldMount && (
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ease-cinematic ${loaded ? 'opacity-100' : 'opacity-0'} ${disableInteraction ? 'pointer-events-none' : ''}`}
        >
          <Spline
            scene={scene}
            onLoad={() => {
              setLoaded(true);
              onLoaded?.();
            }}
          />
        </div>
      )}
    </div>
  );
}
