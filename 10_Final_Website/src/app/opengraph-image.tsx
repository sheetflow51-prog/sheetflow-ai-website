import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SheetFlow AI — AI automation agency for growing businesses.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Branded OG image rendered at the edge — no static asset to maintain.
 * Mirrors the site's hero aesthetic: void canvas, indigo aurora, gradient headline.
 */
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: '#060608',
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Aurora */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(59, 130, 246,0.35), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 30%, rgba(233, 162, 59,0.22), transparent 60%), radial-gradient(ellipse 100% 60% at 50% 100%, rgba(6,182,212,0.12), transparent 70%)',
            display: 'flex',
          }}
        />
        {/* Top bar — kicker + brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 18,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#A0A8BC',
              fontFamily: 'monospace',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 999, background: '#10B981', display: 'flex' }} />
            SHEETFLOW · AI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#A0A8BC', fontSize: 18, letterSpacing: '0.12em', fontFamily: 'monospace' }}>
            v1.0
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', maxWidth: 920 }}>
          <div
            style={{
              fontSize: 96,
              lineHeight: 1.0,
              letterSpacing: '-0.035em',
              fontWeight: 700,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.25em',
            }}
          >
            <span style={{ color: '#FFFFFF' }}>Stop doing the busywork.</span>
            <span
              style={{
                background: 'linear-gradient(135deg, #60A5FA 0%, #F4C063 50%, #06B6D4 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Let SheetFlow run it.
            </span>
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 26,
              lineHeight: 1.4,
              color: '#A0A8BC',
              maxWidth: 720,
              display: 'flex',
            }}
          >
            AI automations for leads, WhatsApp follow-ups, bookings, and CRM — built for clinics, agencies, coaches and service businesses.
          </div>
        </div>

        {/* Bottom: bracket + URL */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ fontSize: 20, color: '#FFFFFF', display: 'flex' }}>sheetflow.ai</div>
          <div
            style={{
              display: 'flex',
              gap: 14,
              fontSize: 16,
              fontFamily: 'monospace',
              color: '#6B7490',
              letterSpacing: '0.12em',
            }}
          >
            <span>CAPTURE</span>
            <span>·</span>
            <span>FOLLOW UP</span>
            <span>·</span>
            <span>BOOK</span>
          </div>
        </div>

        {/* Corner brackets */}
        {[
          { top: 60, left: 60, transform: '' },
          { top: 60, right: 60, transform: 'scaleX(-1)' },
          { bottom: 60, left: 60, transform: 'scaleY(-1)' },
          { bottom: 60, right: 60, transform: 'scale(-1, -1)' },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              ...pos,
              width: 28,
              height: 28,
              borderTop: '2px solid rgba(59, 130, 246,0.65)',
              borderLeft: '2px solid rgba(59, 130, 246,0.65)',
              display: 'flex',
            }}
          />
        ))}
      </div>
    ),
    { ...size },
  );
}
