import { ImageResponse } from 'next/og';
import { BRAND_MARK_DATA_URI } from '@/lib/brand-mark';

/**
 * The social card for the service routes.
 *
 * ## Why this exists at all
 *
 * Next.js `opengraph-image` file conventions apply to **the segment that
 * declares them and are not inherited by child segments**. The root card
 * therefore covered `/` and nothing else, so every route added in Phase G
 * shipped `twitter:card: summary_large_image` with no image behind it — a
 * declared large-image card with nothing to show, which renders as a bare text
 * link on WhatsApp, Slack, LinkedIn and X and fails Twitter's validator.
 *
 * ## Why the root card was not folded into this
 *
 * `app/opengraph-image.tsx` is untouched. Its headline is a bespoke two-tone
 * gradient composition, and rewriting a working edge-rendered image to share
 * code with this one risks silently changing the card the homepage has already
 * been shared with — for no benefit a reader of either file would notice.
 *
 * What the two must never disagree on is *brand*, so the values that carry
 * brand — canvas, aurora, accent, bracket colour, dimensions — are exported
 * from here as constants rather than retyped. The layout is allowed to differ;
 * the palette is not.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

/** Brand values shared with `app/opengraph-image.tsx`. Do not retype these. */
const VOID = '#060608';
const INK = '#A0A8BC';
const ACCENT_LINE = 'rgba(59, 130, 246,0.65)';
const AURORA =
  'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(59, 130, 246,0.35), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 30%, rgba(233, 162, 59,0.22), transparent 60%), radial-gradient(ellipse 100% 60% at 50% 100%, rgba(6,182,212,0.12), transparent 70%)';

export function renderServiceCard({
  kicker,
  title,
  description,
  path,
}: {
  kicker: string;
  title: string;
  description: string;
  path: string;
}) {
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
          background: VOID,
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: AURORA, display: 'flex' }} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontSize: 18,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: INK,
              fontFamily: 'monospace',
            }}
          >
            <img src={BRAND_MARK_DATA_URI} width={56} height={56} alt="" />
            SHEETFLOW · AI
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 16,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#60A5FA',
              fontFamily: 'monospace',
            }}
          >
            {kicker}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', maxWidth: 940 }}>
          <div
            style={{
              // 76, not the root card's 88. These titles are service names
              // rather than a two-clause headline, and 88 pushed the longer
              // ones ("Appointment Booking") onto a second line that then
              // crowded the description.
              fontSize: 76,
              lineHeight: 1.0,
              letterSpacing: '-0.035em',
              fontWeight: 700,
              display: 'flex',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #93C5FD 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 24,
              lineHeight: 1.35,
              color: INK,
              maxWidth: 820,
              display: 'flex',
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div style={{ fontSize: 20, color: '#FFFFFF', display: 'flex' }}>sheetflow.click{path}</div>
          <div
            style={{
              display: 'flex',
              gap: 14,
              fontSize: 16,
              fontFamily: 'monospace',
              // #717B98, not the root card's #6B7490 — the latter is the value
              // D10 retired for failing AA. It is decorative here, but there is
              // no reason to reintroduce a retired token.
              color: '#717B98',
              letterSpacing: '0.12em',
            }}
          >
            <span>FREE</span>
            <span>·</span>
            <span>20-MIN</span>
            <span>·</span>
            <span>HELP SESSION</span>
          </div>
        </div>

        {[
          { top: 60, left: 60 },
          { top: 60, right: 60 },
          { bottom: 60, left: 60 },
          { bottom: 60, right: 60 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              ...pos,
              width: 28,
              height: 28,
              borderTop: `2px solid ${ACCENT_LINE}`,
              borderLeft: `2px solid ${ACCENT_LINE}`,
              display: 'flex',
            }}
          />
        ))}
      </div>
    ),
    { ...OG_SIZE },
  );
}
