'use client';

import { useState } from 'react';
import {
  BellRing,
  MessageCircle,
  CalendarCheck,
  BarChart3,
  RefreshCw,
  Receipt,
} from 'lucide-react';

/**
 * The Automation Universe diagram — six systems on one orbit, feeding one core.
 *
 * ## Why this is its own file
 *
 * RC5 put every homepage section inside `Chapter`, a **server** component. This
 * diagram is the one on the page that genuinely holds state — which node is
 * active — so importing `Chapter` here would have dragged `Chapter`, `Ambient`
 * and `Spine` across the client boundary with it, and the chapter head's copy
 * with them. Splitting the file keeps the boundary where the interactivity
 * actually starts: the client bundle gets the diagram, and the headline,
 * description and atmosphere stay on the server.
 *
 * ## RC6 — the geometry was wrong, and it was measurably wrong
 *
 * This shipped on an **ellipse**: `RADIUS = { x: 336, y: 232 }`. Six nodes at
 * exact 60° intervals on an ellipse do *not* sit at a constant distance from
 * the centre, so the layout that reads as "hand-positioned" was, dimensionally,
 * hand-positioned:
 *
 * ```
 *   node   angle    orbital radius   beam length
 *   0      -90°          232.0            92.0
 *   1      -30°          313.3           173.3     <- 88% longer
 *   2       30°          313.3           173.3
 *   3       90°          232.0            92.0
 *   4      150°          313.3           173.3
 *   5      210°          313.3           173.3
 * ```
 *
 * The four diagonal connectors were **88% longer** than the top and bottom
 * pair. The file's own comment records the symptom without naming the cause —
 * "at 205 the top and bottom beams were visibly stubbier than the four
 * diagonals" — and answers it by stretching `y` from 205 to 232, which reduces
 * the disparity from 148% to 88% and cannot ever reach zero, because no ellipse
 * has a constant radius.
 *
 * The fix is the only one available: **a true circle.** `ORBIT_R` is one
 * scalar. Every node is 344 user units from the centre, every connector spans
 * exactly 168 units, and because each connector is bowed by the same fraction
 * of the same length, all six are literally **rotations of one another** —
 * congruent, not merely similar. The orbit ring drawn through the six node
 * centres is the visible proof, and it is the one shape that could not be
 * drawn at all before.
 *
 * ## Why the hexagon is flat-top, and why the order is the lifecycle
 *
 * Angles are 0°/60°/…/300° rather than the old −90° start. That puts vertices
 * at due left and due right, which makes the composition wider than tall
 * (2R by √3·R) instead of taller than wide — a section is a wide box. It is
 * also the arrangement the brief specifies.
 *
 * The six are then ordered **clockwise from the top-right in lifecycle order**:
 *
 * ```
 *        reports 240° ◇       ◇ 300° lead alerts
 *                      \     /
 *       invoices 180° ◇  CORE  ◇ 0° whatsapp
 *                      /     \
 *       crm-sync 120° ◇       ◇ 60° booking
 * ```
 *
 * A lead arrives (300°), is answered (0°), books (60°), is recorded (120°),
 * is invoiced (180°), and is reported back to you (240°) — and the ambient
 * signals fire in that same clockwise stagger. The ring stops being six things
 * arranged around a disc and becomes **the loop the business runs**, which is
 * the claim the section is making in prose two paragraphs above it. The mobile
 * column renders the identical array top-to-bottom, so it tells the same story
 * without the geometry.
 *
 * ## Why no motion library
 *
 * `framer-motion` is already in the bundle and importing it would be free. It
 * is still not imported, because the only things JavaScript holds are *which
 * node is active* and *whether the reader is engaging with the diagram at all*.
 * Every beam, every glow, the travelling signals, the dimming and each
 * transition is CSS driven by two data attributes.
 *
 * Continuous motion is capped at three simultaneous animations
 * (`VISUAL_DNA.md` § 2), and all three are transform/opacity only:
 * the travelling signals, the core pulse, and the dashed orbit trace. Per-node
 * "breathing" was designed and cut — it would have been a fourth, running on
 * six elements, for an effect no reader can name.
 *
 * ## Accessibility
 *
 * The `<svg>` is decoration and is `aria-hidden`. Every piece of meaning is in
 * the `<ul>` of real `<button>`s, which is rendered **once** and re-laid-out by
 * CSS: absolutely positioned on the orbit at md+, a plain stacked column below
 * it, where a six-node radial diagram would be illegible at 360 px. Hover,
 * focus and click all set the same state, so pointer and keyboard reach
 * identical results, and the detail panel is `aria-live="polite"`. The
 * dimming of unselected nodes is decorative only — it never drops a node below
 * readable contrast, and it is skipped entirely under reduced motion.
 */

interface Automation {
  id: string;
  title: string;
  body: string;
  impact: string;
  /** The node's one-line transformation. Event on the left, outcome on the right. */
  flow: string;
  /** The mechanism, in four beats — revealed on hover/focus. */
  steps: [string, string, string, string];
  Icon: typeof BellRing;
  /** Icon + status-dot colour. A token class, never a raw hex. */
  tint: string;
  dot: string;
}

/**
 * The six automations, **in lifecycle order** — see the file header.
 *
 * `title`, `body` and `impact` are carried over verbatim from the RC3 array:
 * every one of those strings is already published and already reviewed, so
 * nothing here needs content sign-off and the diagram cannot drift out of
 * agreement with the page it sits on. `flow` and `steps` are new, and are
 * strictly *mechanism* — what the automation does, in order. Neither carries a
 * metric, a customer or an outcome claim, because this file is not a place
 * where evidence can be introduced.
 */
const AUTOMATIONS: Automation[] = [
  {
    id: 'lead-alerts',
    title: 'Missed Lead Alerts',
    body: 'Instant notifications the moment a lead comes in — so nothing waits 24 hours for a reply.',
    impact: 'Reply in under 60s',
    flow: 'Enquiry → Alert',
    steps: ['Enquiry lands', 'Source identified', 'Owner alerted', 'Clock starts'],
    Icon: BellRing,
    tint: 'text-signal-warning',
    dot: 'bg-signal-warning',
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp Follow-Ups',
    body: 'An AI assistant that answers questions, qualifies leads, and books calls on WhatsApp — 24/7.',
    impact: 'Always on, always polite',
    flow: 'Lead → Message',
    steps: ['Lead detected', 'AI qualifies', 'WhatsApp sent', 'CRM updated'],
    Icon: MessageCircle,
    tint: 'text-signal-success',
    dot: 'bg-signal-success',
  },
  {
    id: 'booking',
    title: 'Appointment Booking',
    body: 'A self-serve booking flow that syncs to your calendar and CRM. No back-and-forth.',
    impact: 'Calendar fills itself',
    flow: 'Intent → Booked',
    steps: ['Slot requested', 'Calendar checked', 'Booking held', 'Confirmations sent'],
    Icon: CalendarCheck,
    tint: 'text-accent-light',
    dot: 'bg-accent-light',
  },
  {
    id: 'crm-sync',
    title: 'CRM Auto-Updates',
    body: 'Forms, calls and chats flow into HubSpot, Pipedrive or GoHighLevel automatically. No manual entry.',
    impact: 'Zero data entry',
    flow: 'Contact → Record',
    steps: ['Form or call ends', 'Fields mapped', 'Record written', 'Duplicates merged'],
    Icon: RefreshCw,
    tint: 'text-gold-bright',
    dot: 'bg-gold-bright',
  },
  {
    id: 'invoices',
    title: 'Invoice Reminders',
    body: 'Polite, automated nudges that get invoices paid faster — without you chasing clients.',
    impact: 'Get paid sooner',
    flow: 'Due → Reminder',
    steps: ['Invoice issued', 'Due date watched', 'Nudge sent', 'Payment matched'],
    Icon: Receipt,
    tint: 'text-accent',
    dot: 'bg-accent',
  },
  {
    id: 'reports',
    title: 'Daily Business Reports',
    body: 'A clean morning email with leads, bookings, revenue and what needs your attention today.',
    impact: 'Clarity by 9am',
    flow: 'Activity → Digest',
    steps: ['Day closes', 'Sources collected', 'Digest composed', 'Inbox by 9am'],
    Icon: BarChart3,
    tint: 'text-accent-bright',
    dot: 'bg-accent-bright',
  },
];

/* ------------------------------------------------------------------ */
/* Geometry — one circle, computed once, at module load                */
/* ------------------------------------------------------------------ */

/**
 * Magic UI's `AnimatedBeam` (evaluated in `RC3_MOODBOARD.md` § 3) measures each
 * beam with `getBoundingClientRect` inside an effect and re-measures under a
 * `ResizeObserver` — one SVG and one observer per beam. Twelve beams is twelve
 * observers, beams that pop in a frame after paint, and layout thrash on every
 * resize.
 *
 * Here the layout is polar and known at build time, so everything below is
 * computed once when the module loads. The SVG is correct on first paint, there
 * is no observer, no measurement, and no post-hydration reflow.
 */
const VIEW = { w: 1080, h: 880 };
const CENTRE = { x: 540, y: 440 };

/** One scalar. This is the whole point — see the file header. */
const ORBIT_R = 344;

const CORE_R = 96;
/**
 * Where a connector starts and stops, along its ray.
 *
 * The start is inset past the core's edge, not flush to it — flush, a signal at
 * low `offset-distance` sits on top of the core disc and reads as a stray dot
 * inside the mark instead of as something leaving it. The end stops clear of
 * the node plate's circumradius so no connector is ever drawn underneath a
 * node. Both insets are constants, so all six spans are identical.
 */
const PLATE_R = 56;
const BEAM_START = CORE_R + 14;
const BEAM_END = ORBIT_R - (PLATE_R + 10);

/** The first node sits at −60° (top-right); the rest follow clockwise. */
const ANGLE_0 = -60;
const STEP = 360 / AUTOMATIONS.length;

interface Node {
  /** Percent of the viewBox — the HTML layer positions on the same numbers. */
  left: string;
  top: string;
  /** Connector, and its faint return rail. */
  d: string;
  dAlt: string;
  /** Labels always sit on the side facing away from the core. */
  above: boolean;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * A quadratic Bézier from the core's edge to the node's edge, bowed
 * perpendicular by a fixed fraction of the span.
 *
 * Because `BEAM_START` and `BEAM_END` are constants and `bow` is derived from
 * them rather than from anything per-node, the six paths are exact rotations of
 * one another about the centre. Straight spokes read as a bicycle wheel; a
 * curve reads as flow — and 3.96° of angular deviation against 60° of node
 * spacing means two connectors cannot approach one another, let alone cross.
 */
function beam(rad: number, curve: number): string {
  const ux = Math.cos(rad);
  const uy = Math.sin(rad);

  const sx = CENTRE.x + ux * BEAM_START;
  const sy = CENTRE.y + uy * BEAM_START;
  const ex = CENTRE.x + ux * BEAM_END;
  const ey = CENTRE.y + uy * BEAM_END;

  const bow = (BEAM_END - BEAM_START) * curve;
  const cx = (sx + ex) / 2 - uy * bow;
  const cy = (sy + ey) / 2 + ux * bow;

  return `M ${r1(sx)} ${r1(sy)} Q ${r1(cx)} ${r1(cy)} ${r1(ex)} ${r1(ey)}`;
}

const NODES: Node[] = AUTOMATIONS.map((_, i) => {
  const rad = ((ANGLE_0 + STEP * i) * Math.PI) / 180;
  const x = CENTRE.x + ORBIT_R * Math.cos(rad);
  const y = CENTRE.y + ORBIT_R * Math.sin(rad);
  return {
    left: `${r1((x / VIEW.w) * 100)}%`,
    top: `${r1((y / VIEW.h) * 100)}%`,
    /* Both rails bow the same way; the second bows less, so they run roughly
       parallel and read as a channel. Mirroring the second (bow `-0.16`) was
       the first attempt and produced two symmetric arcs meeting at both ends —
       an eye rather than a conduit. */
    d: beam(rad, 0.16),
    dAlt: beam(rad, 0.075),
    above: Math.sin(rad) < -0.1,
  };
});

/* ------------------------------------------------------------------ */

export function UniverseStage() {
  const [active, setActive] = useState(0);
  /**
   * Whether the reader is *engaging* with the diagram, as opposed to a node
   * merely being selected — which one always is, so that the detail panel is
   * never empty. Only engagement dims the other five: at rest the diagram is a
   * system with one node lit, and a resting state that permanently suppresses
   * five of its six subjects would be a worse drawing, not a calmer one.
   */
  const [engaged, setEngaged] = useState(false);

  // `active` is never out of range: it is only ever set from a map index.
  const current = AUTOMATIONS[active] as Automation;

  const engage = (i: number) => {
    setActive(i);
    setEngaged(true);
  };

  return (
    <>
      <div
        data-theme="dark"
        data-stage="panel"
        className="universe chapter-stage"
        data-engaged={engaged ? 'true' : undefined}
        /* The canvas ratio and the stage's unit scale are both published from
           `VIEW` rather than hard-coded in CSS. The node buttons are laid out
           in `--u` — one viewBox user unit, as a length — so the HTML layer and
           the SVG layer share a single coordinate system and resolve to the
           same pixel at every width. If the stylesheet's ratio and this
           constant ever drifted apart, every node would sit slightly off its
           own connector: a failure that looks like a rendering bug and is very
           hard to trace back to a number in a different file. One source, no
           drift. */
        style={
          {
            '--universe-ratio': `${VIEW.w} / ${VIEW.h}`,
            '--universe-units': VIEW.w,
          } as React.CSSProperties
        }
        onMouseLeave={() => setEngaged(false)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as globalThis.Node | null)) {
            setEngaged(false);
          }
        }}
      >
        {/* Decorative geometry. Every label it appears to carry is really
            rendered by the button list below, which sits on top of it. */}
        <svg
          aria-hidden="true"
          className="universe-canvas"
          viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="universe-core-fill" cx="50%" cy="42%" r="62%">
              <stop offset="0%" stopColor="rgb(var(--color-accent-bright))" stopOpacity="0.30" />
              <stop offset="55%" stopColor="rgb(var(--color-accent))" stopOpacity="0.12" />
              <stop offset="100%" stopColor="rgb(var(--color-accent))" stopOpacity="0" />
            </radialGradient>
            {/* The core lights from within. Filled flat, it read as a hole
                punched in the composition rather than as a source. */}
            <radialGradient id="universe-core-inner" cx="50%" cy="34%" r="76%">
              <stop offset="0%" stopColor="rgb(var(--color-accent))" stopOpacity="0.34" />
              <stop offset="46%" stopColor="rgb(var(--color-accent-deep))" stopOpacity="0.14" />
              <stop offset="100%" stopColor="rgb(var(--color-bg))" stopOpacity="0.05" />
            </radialGradient>
          </defs>

          {/* The orbit. Drawn through all six node centres, which is only
              possible because the radius is a scalar — on the ellipse this
              shape did not exist. The dashed copy above it rotates, which is
              the diagram's slowest movement and the only one that reads as
              orbital rather than as traffic. */}
          <circle className="universe-orbit" cx={CENTRE.x} cy={CENTRE.y} r={ORBIT_R} />
          <circle className="universe-orbit-trace" cx={CENTRE.x} cy={CENTRE.y} r={ORBIT_R} />

          {/* Connectors. The lit copy is a third path over the resting pair, so
              activating a node changes opacity only — no geometry is recomputed
              and nothing reflows. `dAlt` is a shallower rail alongside, which
              turns each spoke into a channel rather than a wire. */}
          {NODES.map((n, i) => (
            <g
              key={AUTOMATIONS[i]?.id ?? i}
              className="universe-link"
              data-lit={active === i ? 'true' : undefined}
            >
              <path className="universe-beam-alt" d={n.dAlt} />
              <path className="universe-beam" d={n.d} />
              <path className="universe-beam-lit" d={n.d} />
            </g>
          ))}

          {/* Core: the halo, the pulse, the orbital rings and the three stacked
              rules from the logo mark (SHEETFLOW_VISUAL_DNA.md § 6.1). */}
          <circle cx={CENTRE.x} cy={CENTRE.y} r={CORE_R + 62} fill="url(#universe-core-fill)" />
          <circle className="universe-pulse" cx={CENTRE.x} cy={CENTRE.y} r={CORE_R} />
          <circle className="universe-ring" cx={CENTRE.x} cy={CENTRE.y} r={CORE_R + 30} />
          <circle className="universe-ring" cx={CENTRE.x} cy={CENTRE.y} r={CORE_R + 12} />
          <circle className="universe-core" cx={CENTRE.x} cy={CENTRE.y} r={CORE_R} />
          <circle cx={CENTRE.x} cy={CENTRE.y} r={CORE_R - 1} fill="url(#universe-core-inner)" />

          {[
            [-40, 26],
            [-28, 34],
            [-16, 26],
          ].map(([dy, half]) => (
            <line
              key={dy}
              className="universe-rule"
              x1={CENTRE.x - (half as number)}
              x2={CENTRE.x + (half as number)}
              y1={CENTRE.y + (dy as number)}
              y2={CENTRE.y + (dy as number)}
            />
          ))}

          {/* The core says what it is. RC5 left the centre as an unlabelled
              mark, so the one element the whole composition points at was the
              only one carrying no information. Inside the `aria-hidden` layer
              deliberately: the section's own `<h2>` already names this to a
              screen reader, and a second announcement would be noise. */}
          <text className="universe-core-name" x={CENTRE.x} y={CENTRE.y + 18}>
            SHEETFLOW
          </text>
          <text className="universe-core-role" x={CENTRE.x} y={CENTRE.y + 40}>
            AUTOMATION ENGINE
          </text>
          <circle className="universe-core-dot" cx={CENTRE.x} cy={CENTRE.y + 62} r={3.5} />

          {/* The travelling signals. One dot per connector, staggered in
              lifecycle order so exactly one is in flight at a time and the ring
              is traced clockwise. `offset-path` reuses the identical `d`
              string, so a dot cannot drift off its own connector. */}
          {NODES.map((n, i) => (
            <circle
              key={`signal-${AUTOMATIONS[i]?.id ?? i}`}
              className="universe-signal"
              r={5}
              style={
                {
                  offsetPath: `path("${n.d}")`,
                  '--i': i,
                } as React.CSSProperties
              }
            />
          ))}
        </svg>

        {/* The single source of meaning. Absolutely positioned onto the orbit
            at md+, a plain column below it. */}
        <ul className="universe-nodes">
          {/* The engine, as the head of the mobile column. Below md there is no
              core in the composition at all, so the six automations read as a
              list of features rather than as things wired into something. This
              is that missing anchor, and it is `aria-hidden` because the
              chapter heading above already establishes it. */}
          <li className="universe-origin" aria-hidden="true">
            <span className="universe-origin-mark" />
            <span className="universe-origin-text">
              <span className="universe-origin-name">SheetFlow</span>
              <span className="universe-origin-role">Automation engine</span>
            </span>
          </li>

          {AUTOMATIONS.map((a, i) => {
            const n = NODES[i] as Node;
            const Icon = a.Icon;
            return (
              <li
                key={a.id}
                className="universe-slot"
                data-above={n.above ? 'true' : undefined}
                style={{ '--x': n.left, '--y': n.top } as React.CSSProperties}
              >
                <button
                  type="button"
                  className="universe-node"
                  data-active={active === i ? 'true' : undefined}
                  aria-pressed={active === i}
                  onClick={() => engage(i)}
                  onMouseEnter={() => engage(i)}
                  onFocus={() => engage(i)}
                >
                  {/* A flat-top hexagon, in the same orientation as the orbit
                      it sits on — vertices due left and due right. The rounded
                      square this replaced is the single most repeated shape on
                      the AI-agency web; the hexagon is the diagram's own
                      geometry, at node scale. Two stacked clips rather than a
                      border, because `clip-path` does not respect the box
                      model and a clipped border does not exist. */}
                  <span className="universe-plate">
                    <span className="universe-plate-face" aria-hidden="true" />
                    <Icon
                      className={`universe-plate-icon ${a.tint}`}
                      strokeWidth={1.9}
                      aria-hidden="true"
                    />
                    <span
                      className={`universe-plate-dot ${a.dot}`}
                      aria-hidden="true"
                    />
                  </span>

                  <span className="universe-node-text">
                    <span className="universe-node-label">{a.title}</span>
                    <span className="universe-node-flow">{a.flow}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* One panel, updated in place — six stacked panels would be six more
          rectangles, which is the problem this section exists to solve. */}
      <div className="universe-detail glass-elevated border-beam" aria-live="polite">
        <p className="universe-detail-title">{current.title}</p>
        <p className="universe-detail-body">{current.body}</p>

        {/* The mechanism, in four beats. Keyed on the automation so React
            remounts the list and the entrance stagger replays on every change —
            the reveal *is* the sequence, which is the one thing four static
            words in a row cannot convey. Ordered, because the order is the
            content. */}
        <ol className="universe-steps" key={current.id}>
          {current.steps.map((step, i) => (
            <li
              className="universe-step"
              key={step}
              style={{ '--i': i } as React.CSSProperties}
            >
              {step}
            </li>
          ))}
        </ol>

        <p className="universe-detail-impact">
          <span className={`universe-detail-dot ${current.dot}`} aria-hidden="true" />
          {current.impact}
        </p>
      </div>
    </>
  );
}
