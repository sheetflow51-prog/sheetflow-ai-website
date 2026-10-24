import { ecosystem, ecosystemTool } from '@/content/ecosystem';
import { EcosystemDefs, EcosystemMark } from './EcosystemMark';

/**
 * The ecosystem orbit — the second stage of chapter 02 (`#integrations`), D40.
 *
 * ## The orbit
 *
 * A wheel twice the stage's height sits with its centre on the stage's bottom
 * edge, so only the upper half shows (the stage clips the rest). Each tool is
 * an *arm*: a zero-size box rotated to its angle and pushed out by the radius.
 * The wheel turns with one linear keyframe and every tile turns the opposite
 * way at the same rate, so the logos stay upright while they travel the arc.
 * This is the Wantace "Arm" construction, done in CSS instead of Framer Motion.
 *
 * ## Accessibility
 *
 * The orbit and its floating badges are decoration (`aria-hidden`); the list
 * of cards below carries every tool name and habit in text. The orbit moves
 * for longer than five seconds, so a Pause control (a native checkbox, the
 * capability ticker's pattern) stops it (WCAG 2.2.2). With reduced motion the
 * wheel rests still and nothing bobs.
 *
 * Server component. Zero JavaScript.
 */

/** Illustrative events for the floating badges. Decoration, not data. */
const BADGES: { tool: string; text: string; at: React.CSSProperties; wide: boolean }[] = [
  { tool: 'whatsapp', text: 'New enquiry received', at: { left: '3%', top: '9%' }, wide: false },
  { tool: 'n8n', text: 'Workflow ran', at: { left: '6%', top: '56%' }, wide: true },
  { tool: 'supabase', text: 'Row saved', at: { right: '3%', top: '17%' }, wide: true },
  { tool: 'slack', text: 'Alert sent to #sales', at: { right: '4%', top: '62%' }, wide: false },
];

export function EcosystemGrid() {
  return (
    <div className="eco chapter-stage">
      <EcosystemDefs />

      <h3 id="eco-heading" className="eco-title">
        Your team keeps its tools.{' '}
        <span className="text-ink-300">SheetFlow is the glue between them.</span>
      </h3>

      <input
        id="eco-pause"
        type="checkbox"
        className="motion-toggle sr-only"
        aria-label="Pause the orbiting logos"
      />
      <div className="eco-orbit" aria-hidden="true">
        <label htmlFor="eco-pause" className="motion-btn">
          <span className="motion-btn-pause">Pause</span>
          <span className="motion-btn-play">Play</span>
        </label>

        <span className="eco-glow" />
        <div className="eco-wheel">
          <span className="eco-track eco-track--outer" />
          <span className="eco-track eco-track--mid" />
          <span className="eco-track eco-track--inner" />

          <div className="eco-spin">
            {ecosystem.map((tool, i) => (
              <span
                key={tool.id}
                className="eco-arm"
                style={{ '--a': `${i * 45}deg` } as React.CSSProperties}
              >
                <span className="eco-chip" style={{ '--brand': tool.brand } as React.CSSProperties}>
                  <span className="eco-chip-face">
                    <EcosystemMark tool={tool} />
                  </span>
                </span>
              </span>
            ))}
          </div>

          <div className="eco-spin eco-spin--sparks">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="eco-spark"
                style={{ '--a': `${i * 90 + 20}deg` } as React.CSSProperties}
              />
            ))}
          </div>
        </div>

        <div className="eco-core">
          <span className="eco-core-pulse" />
          <span className="eco-core-pulse eco-core-pulse--late" />
          <span className="eco-core-name">SheetFlow</span>
          <span className="eco-core-sub">AI core</span>
        </div>

        {BADGES.map((badge, i) => {
          const tool = ecosystemTool(badge.tool);
          return (
            <span
              key={badge.tool}
              className="eco-badge"
              data-wide={badge.wide || undefined}
              style={{ ...badge.at, '--i': i, '--brand': tool.brand } as React.CSSProperties}
            >
              <span className="eco-badge-mark">
                <EcosystemMark tool={tool} />
              </span>
              {badge.text}
            </span>
          );
        })}
      </div>

      <p className="eco-hub-line">
        No rip-and-replace. We connect what you run today, and every workflow stays in accounts
        you own.
      </p>

      <ul className="eco-grid" aria-labelledby="eco-heading">
        {ecosystem.map((tool, i) => (
          <li
            key={tool.id}
            className="eco-tile"
            style={{ '--i': i, '--brand': tool.brand } as React.CSSProperties}
          >
            <span className="eco-mark" aria-hidden="true">
              <EcosystemMark tool={tool} />
            </span>
            <p className="eco-group">{tool.group}</p>
            <p className="eco-name">{tool.name}</p>
            <p className="eco-habit">{tool.habit}</p>
          </li>
        ))}
      </ul>

      <p className="eco-legal">
        Product names and logos are trademarks of their respective owners and are shown only to
        identify the tools SheetFlow connects. No partnership or endorsement is implied.
      </p>
    </div>
  );
}
