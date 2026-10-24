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
  // Both hero CTAs, separated by a `variant` property rather than by two event
  // names: 'audit' is the conversion journey, 'work' the proof one, and the
  // question worth asking is their ratio. Two names made that a join.
  //
  // This replaces `hero_demo_click`, which was wrong twice over — the button it
  // named showed no demo, and it had no `href`, so every event it ever recorded
  // was a click that went nowhere. There is no continuity worth preserving in a
  // metric that only ever counted a dead end.
  | 'hero_cta_click'          // Either hero CTA — see `variant`
  | 'final_cta_click'         // Primary CTA in FinalCTA
  | 'final_case_studies_click'// "See our work" in FinalCTA
  | 'form_submit'           // Inquiry form submission
  | 'audio_enabled'         // User enables audio
  | 'nav_cta_click'         // Nav bar CTA
  | 'mobile_menu_open'      // Mobile nav opened
  // The booking funnel's one measurable step on our side. Everything after
  // this happens on Calendly, so this is the last event we can observe —
  // `booking_qualified` over `/book` views is the conversion rate we own.
  // Properties carry the two select answers, never the name or email:
  // attribution is not identity, and PII must not enter the analytics stream.
  | 'booking_qualified';

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
