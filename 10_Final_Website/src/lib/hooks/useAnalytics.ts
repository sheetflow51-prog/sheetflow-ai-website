/**
 * useAnalytics — lightweight funnel event tracking hook.
 *
 * Wraps Vercel Analytics `track()` with SheetFlow-specific event names.
 * Falls back to a no-op in environments where analytics is not configured
 * (local dev, test). Zero dependencies beyond @vercel/analytics.
 *
 * Funnel: hero_cta_click → final_cta_click → form_submit
 * (Verified via DEPLOYMENT.md §5.9 post-launch observation checklist)
 *
 * Usage:
 *   const { track } = useAnalytics();
 *   track('hero_cta_click', { variant: 'activate' });
 */

import { useCallback } from 'react';

type EventName =
  | 'hero_cta_click'        // Primary CTA in Hero
  | 'hero_demo_click'       // "Watch the demo" in Hero
  | 'final_cta_click'       // Primary CTA in FinalCTA
  | 'final_strategist_click'// "Talk to a strategist" in FinalCTA
  | 'form_submit'           // Inquiry form submission
  | 'audio_enabled'         // User enables audio
  | 'nav_cta_click'         // Nav bar CTA
  | 'mobile_menu_open';     // Mobile nav opened

type EventProperties = Record<string, string | number | boolean>;

// Tree-shakeable: only import track if analytics package is present.
async function safeTrack(event: EventName, props?: EventProperties) {
  try {
    const { track } = await import('@vercel/analytics');
    track(event, props);
  } catch {
    // Analytics not installed or not in browser — silent no-op.
    if (process.env.NODE_ENV === 'development') {
      // Helpful dev-only log to verify events are firing correctly.
      // eslint-disable-next-line no-console
      console.log('[analytics]', event, props ?? '');
    }
  }
}

export function useAnalytics() {
  const track = useCallback((event: EventName, props?: EventProperties) => {
    // Fire-and-forget — never block UI interaction on analytics.
    void safeTrack(event, props);
  }, []);

  return { track };
}
