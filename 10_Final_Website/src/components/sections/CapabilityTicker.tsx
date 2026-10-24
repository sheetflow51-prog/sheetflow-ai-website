import { services } from '@/content/services';

/**
 * A slow ticker of what SheetFlow builds, between the hero and chapter 01.
 *
 * Borrowed from wantace.com's logo strip: a marquee with faded edges is the
 * cheapest way to say "a lot of ground, covered" in one line. Here it is CSS only
 * (no client JavaScript, no dependency), and it lists only names the site already
 * publishes: the six automations from `content/services.ts` plus the three digital
 * builds in `DigitalCraft`. It adds no claim the rest of the page does not make.
 *
 * Moving content has to be stoppable (WCAG 2.2.2), so a visually small Pause
 * control sits at the right edge. It is a real checkbox, so it works from the
 * keyboard and for screen readers, and it needs no script. Reduced motion stops
 * the movement outright. The full list is also present as plain text for
 * assistive technology; the moving copy is `aria-hidden`.
 */

const DIGITAL = ['Websites', 'Landing pages', 'Dashboards'];

export function CapabilityTicker() {
  const items = [...services.map((s) => s.name), ...DIGITAL];

  return (
    <section className="ticker" aria-label="What we build">
      <p className="sr-only">{items.join(', ')}.</p>

      <input id="ticker-pause" type="checkbox" className="ticker-toggle sr-only" aria-label="Pause the scrolling list" />
      <label htmlFor="ticker-pause" className="ticker-btn" aria-hidden="true">
        <span className="ticker-btn-pause">Pause</span>
        <span className="ticker-btn-play">Play</span>
      </label>

      <div className="ticker-track" aria-hidden="true">
        {[0, 1].map((copy) => (
          <ul key={copy} className="ticker-list">
            {items.map((item) => (
              <li key={`${copy}-${item}`}>{item}</li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
