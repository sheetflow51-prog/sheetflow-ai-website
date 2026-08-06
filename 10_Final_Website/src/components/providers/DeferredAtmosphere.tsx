'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { prefersReducedMotion } from '@/lib/utils';

/**
 * DeferredAtmosphere — the decorative layer, loaded off the critical path.
 *
 * Everything here is atmosphere: a particle wallpaper, an aurora wash, a
 * custom cursor, film grain, a scroll rail, the boot flourish and a dormant
 * audio engine. None of it carries meaning, and none of it is needed for the
 * page to be read, understood or acted on.
 *
 * Previously all of it was imported statically into the root layout, so its
 * JavaScript parsed and hydrated before the browser could respond to input.
 * Three of these components also run their own requestAnimationFrame loop.
 * Together they were the bulk of a 490 ms Total Blocking Time.
 *
 * Two gates now stand in front of them:
 *
 *   1. `ssr: false` keeps them out of the server payload entirely. They are
 *      canvas- and pointer-driven, so they render nothing on the server
 *      anyway — shipping their markup was pure cost.
 *
 *   2. Mounting waits for the browser to go idle. Hydration finishes first,
 *      the page becomes interactive, and only then does the atmosphere fade
 *      in. On a fast connection the gap is imperceptible; on a slow device it
 *      is the difference between a page that responds and one that does not.
 *
 * Under `prefers-reduced-motion` none of it loads at all. Each component
 * already early-returned for those users, but it still paid to download and
 * hydrate them first. Now the chunks are never requested.
 */

const ParticleField = dynamic(() => import('./ParticleField'), { ssr: false });
const AmbientBackground = dynamic(() => import('./AmbientBackground'), { ssr: false });
const CustomCursor = dynamic(() => import('./CustomCursor'), { ssr: false });
const NoiseTexture = dynamic(() => import('./NoiseTexture'), { ssr: false });
const ScrollProgress = dynamic(() => import('./ScrollProgress'), { ssr: false });
const AudioProvider = dynamic(() => import('./AudioProvider'), { ssr: false });
const Awakening = dynamic(() => import('@/components/signature/Awakening'), { ssr: false });

/**
 * Resolves after the page has finished loading AND the browser is idle.
 *
 * Waiting on `requestIdleCallback` alone was not enough: idle callbacks fire
 * while the page is still settling, which is precisely the window Total
 * Blocking Time measures. Mounting the whole atmosphere there moved the cost
 * into the metric instead of out of it. Gating on `load` first puts this work
 * past the point the page is interactive.
 */
function useDeferredMount() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let idleId: number | undefined;
    let timerId: number | undefined;

    // The reduced-motion check lives here rather than in its own effect so
    // that state is only ever set from inside a callback. Setting it
    // synchronously in an effect body triggers a second render pass for every
    // visitor, including the ones this component then renders nothing for.
    const arm = () => {
      if (cancelled || prefersReducedMotion()) return;
      setReady(true);
    };

    const schedule = () => {
      const ric = window.requestIdleCallback;
      if (typeof ric === 'function') {
        idleId = ric(arm, { timeout: 3000 });
      } else {
        // Safari has no requestIdleCallback; a short timer is the honest
        // fallback.
        timerId = window.setTimeout(arm, 300);
      }
    };

    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener('load', schedule);
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, []);

  return ready;
}

export default function DeferredAtmosphere() {
  // Resolves only when the page has loaded, the browser is idle, and the
  // visitor has not asked for reduced motion.
  const ready = useDeferredMount();

  if (!ready) return null;

  return (
    <>
      <Awakening />
      <CustomCursor />
      <AmbientBackground />
      {/* Site-wide living wallpaper: the geometric data-network that drifts on
          a flow-field and reacts to the cursor. One fixed canvas behind every
          section. */}
      <ParticleField fixed reactive className="z-0 opacity-80" />
      <NoiseTexture />
      <ScrollProgress />
      {/* Not a context provider despite the name — it renders its children
          untouched and only attaches listeners, so it sits here as a sibling
          rather than wrapping the tree. The engine stays dormant until a user
          gesture enables it. */}
      <AudioProvider>{null}</AudioProvider>
    </>
  );
}
