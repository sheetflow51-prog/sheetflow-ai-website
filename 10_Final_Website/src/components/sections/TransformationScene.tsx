import { Chapter } from '@/components/vos';
import { beat } from '@/content/narrative';

/**
 * Before and after — chapter 01, the *shift* beat (RC13 D39, reworked in D40).
 *
 * ## Why it sits here
 *
 * The hero makes the promise and chapter 02 onward shows the machinery. What the
 * page never showed was the week *before* SheetFlow — the friction a visitor
 * actually recognises. This beat is that hinge, so it comes first.
 *
 * ## How the loop runs with no JavaScript
 *
 * D40 replaces the click-to-toggle switch with one continuous pipeline, so a
 * visitor sees both states without finding a control: stalled enquiries on the
 * left, the engine in the middle, finished work on the right. Every moving part
 * shares one period (`--flow-t` in globals.css). Each enquiry is pulled into the
 * engine late in its own cycle and the matching card lands just after, so the
 * four staggered pairs read as a sequence. Negative delays mean the loop is
 * already mid-flight on first paint. Only `transform` and `opacity` animate.
 *
 * The pipeline is decoration (`aria-hidden`): the two lists under it carry the
 * same content in words. It moves for longer than five seconds, so a Pause
 * control stops it (WCAG 2.2.2), and with reduced motion it rests on a still
 * frame with every card shown.
 *
 * Server component. Zero JavaScript.
 *
 * ## What the figures are
 *
 * "5 seconds", "48 hours" and the counter are the founder's illustration of a
 * typical week, not measurements, and the caption under the stage says so in
 * plain text (D39). Nothing here is a SheetFlow outcome claim.
 */

const BEFORE = [
  'Leads scattered across spreadsheets and chat threads',
  'A WhatsApp enquiry at 11:40 pm, unread until morning',
  'A 48-hour lag before anyone replies',
  'Leads that go quiet and are never chased',
  'Tracking by hand, reconciled on Fridays',
];

const AFTER = [
  'The enquiry is answered and qualified by AI in 5 seconds',
  'A real-time alert lands in Slack and the CRM',
  'The visit is booked into the calendar automatically',
  'One dashboard that reports itself every morning',
];

/** The drawn enquiries on the left; index i pairs with OUTCOMES[i]. */
const STALLED = [
  { what: 'Price enquiry', via: 'WhatsApp · 11:40 pm', badge: 'Lost in WhatsApp' },
  { what: 'Callback request', via: 'Phone · 6:15 pm', badge: 'Missed call' },
  { what: 'Website form', via: 'Inbox · Tuesday', badge: '48h delayed' },
  { what: 'Follow-up due', via: 'Sheet · row 214', badge: 'Never chased' },
];

const OUTCOMES = [
  { what: 'Price enquiry answered', via: 'WhatsApp', pill: 'Replied in 5s' },
  { what: 'Lead scored and tagged', via: 'AI qualification', pill: 'Qualified' },
  { what: 'Record created, team alerted', via: 'CRM and Slack', pill: 'Synced to CRM' },
  { what: 'Site visit scheduled', via: 'Google Calendar', pill: 'Calendar booked' },
];

const SHEET = [
  ['Lead A', 'Pending'],
  ['Lead B', '—'],
  ['Lead C', 'Call back?'],
  ['Lead D', 'Pending'],
];

/** Beam curves, drawn once for the desktop row and once for the mobile column. */
const BEAMS_IN_ROW = ['M0 30 C60 30 60 100 120 100', 'M0 100 L120 100', 'M0 170 C60 170 60 100 120 100'];
const BEAMS_OUT_ROW = ['M0 100 C60 100 60 30 120 30', 'M0 100 L120 100', 'M0 100 C60 100 60 170 120 170'];
const BEAMS_IN_COL = ['M40 0 C40 40 100 40 100 80', 'M100 0 L100 80', 'M160 0 C160 40 100 40 100 80'];
const BEAMS_OUT_COL = ['M100 0 C100 40 40 40 40 80', 'M100 0 L100 80', 'M100 0 C100 40 160 40 160 80'];

function Beams({ paths, dir, view, grad }: { paths: string[]; dir: 'row' | 'col'; view: string; grad: string }) {
  return (
    <svg
      className={dir === 'row' ? 'flow-beams flow-beams--row' : 'flow-beams flow-beams--col'}
      viewBox={view}
      preserveAspectRatio="none"
      focusable="false"
    >
      {paths.map((d) => (
        <g key={d}>
          <path d={d} className="flow-beam-track" />
          <path d={d} pathLength={100} className="flow-beam-dash" stroke={`url(#${grad})`} />
          <path d={d} pathLength={100} className="flow-beam-pulse" stroke={`url(#${grad})`} />
        </g>
      ))}
    </svg>
  );
}

export function TransformationScene() {
  const { mark, tier, tone, grid } = beat('shift');

  return (
    <Chapter
      id="shift"
      mark={mark}
      tier={tier}
      tone={tone}
      grid={grid}
      kicker="Before and after"
      title={
        <>
          Same enquiries.{' '}
          <span className="text-ink-300">A different week.</span>
        </>
      }
      description="What changes when the follow-up stops depending on someone being awake, at their desk and remembering."
    >
      <div className="flow chapter-stage">
        <input
          id="flow-pause"
          type="checkbox"
          className="motion-toggle sr-only"
          aria-label="Pause the before-and-after animation"
        />

        <div className="flow-stage" aria-hidden="true">
          <svg width="0" height="0" className="eco-defs" focusable="false">
            <defs>
              <linearGradient id="flow-grad-in" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" style={{ stopColor: 'rgb(var(--color-danger))' }} />
                <stop offset="1" style={{ stopColor: 'rgb(var(--color-accent-bright))' }} />
              </linearGradient>
              <linearGradient id="flow-grad-out" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" style={{ stopColor: 'rgb(var(--color-accent-bright))' }} />
                <stop offset="1" style={{ stopColor: 'rgb(var(--color-success))' }} />
              </linearGradient>
            </defs>
          </svg>

          <label htmlFor="flow-pause" className="motion-btn">
            <span className="motion-btn-pause">Pause</span>
            <span className="motion-btn-play">Play</span>
          </label>

          {/* Without SheetFlow: enquiries pile up, stall and get dragged in. */}
          <div className="flow-col flow-col--chaos">
            <p className="flow-tag flow-tag--chaos">Without SheetFlow</p>
            <p className="flow-col-title">Manual chaos</p>
            <div className="flow-pile">
              {STALLED.map((lead, i) => (
                <div key={lead.what} className="flow-lead" style={{ '--i': i } as React.CSSProperties}>
                  <span className="flow-lead-avatar" />
                  <span className="flow-lead-text">
                    <span className="flow-lead-what">{lead.what}</span>
                    <span className="flow-lead-via">{lead.via}</span>
                  </span>
                  <span className="flow-warn">{lead.badge}</span>
                </div>
              ))}
            </div>
            <div className="flow-sheet">
              {SHEET.map(([name, status], i) => (
                <div key={name} className="flow-row" style={{ '--i': i } as React.CSSProperties}>
                  <span>{name}</span>
                  <span className="flow-row-bar" />
                  <span className="flow-row-status">{status}</span>
                </div>
              ))}
            </div>
          </div>

          <Beams paths={BEAMS_IN_ROW} dir="row" view="0 0 120 200" grad="flow-grad-in" />
          <Beams paths={BEAMS_IN_COL} dir="col" view="0 0 200 80" grad="flow-grad-in" />

          {/* The engine. */}
          <div className="flow-core">
            <span className="flow-core-ring" />
            <span className="flow-core-pulse" />
            <span className="flow-core-pulse flow-core-pulse--late" />
            <span className="flow-core-face">
              <span className="flow-core-name">SheetFlow</span>
              <span className="flow-core-sub">AI engine</span>
              <span className="flow-core-status">
                <span className="flow-core-dot" />
                Processing
              </span>
            </span>
          </div>

          <Beams paths={BEAMS_OUT_ROW} dir="row" view="0 0 120 200" grad="flow-grad-out" />
          <Beams paths={BEAMS_OUT_COL} dir="col" view="0 0 200 80" grad="flow-grad-out" />

          {/* With SheetFlow: the same four enquiries, finished. */}
          <div className="flow-col flow-col--auto">
            <p className="flow-tag flow-tag--auto">With SheetFlow</p>
            <p className="flow-col-title">Autonomous flow</p>
            <div className="flow-dash">
              <span className="flow-dash-label">Enquiries answered today</span>
              <span className="flow-dash-count" />
              <span className="flow-dash-demo">Demo loop</span>
              <span className="flow-dash-bars">
                {[38, 52, 46, 64, 58, 76, 88].map((h, i) => (
                  <span
                    key={i}
                    className="flow-dash-bar"
                    style={{ height: `${h}%`, '--i': i } as React.CSSProperties}
                  />
                ))}
              </span>
            </div>
            <div className="flow-feed">
              {OUTCOMES.map((card, i) => (
                <div key={card.pill} className="flow-card" style={{ '--i': i } as React.CSSProperties}>
                  <span className="flow-card-text">
                    <span className="flow-card-what">{card.what}</span>
                    <span className="flow-card-via">{card.via}</span>
                  </span>
                  <span className="flow-ok">{card.pill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flow-compare">
          <div className="flow-compare-col">
            <p className="shift-tag">Before</p>
            <h3 id="shift-before-h" className="shift-title">
              Operational friction
            </h3>
            <ul className="shift-list">
              {BEFORE.map((item, i) => (
                <li key={item} style={{ '--i': i } as React.CSSProperties}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flow-compare-col">
            <p className="shift-tag shift-tag--after">With SheetFlow</p>
            <h3 id="shift-after-h" className="shift-title">
              Autonomous flow
            </h3>
            <ul className="shift-list shift-list--after">
              {AFTER.map((item, i) => (
                <li key={item} style={{ '--i': i } as React.CSSProperties}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="shift-note-caption">
          An illustrative loop, not live data or a measured result. Response and booking times
          depend on your channels, your volume and how your team works.
        </p>
      </div>
    </Chapter>
  );
}
