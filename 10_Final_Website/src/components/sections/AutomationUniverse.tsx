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
import { SectionHeader } from '@/components/ui/SectionHeader';

/**
 * The Automation Universe — the site's signature section.
 *
 * ## What it replaces, and why
 *
 * `WorkflowUniverse` rendered these same six automations as six identical
 * cards: a lucide icon in a rounded square, a title, a body paragraph and a
 * corner gradient glow. Four other homepage sections render the *same object*
 * (`docs/RC3_MOODBOARD.md` § 1), so a visitor scrolling the page met that
 * rectangle more than twenty-five times. The copy changed; the visual system
 * did not.
 *
 * This shows the automations as what they actually are — six systems feeding
 * one intelligence core — instead of describing them in prose.
 *
 * ## Why the geometry is a module-scope constant
 *
 * Magic UI's `AnimatedBeam` (evaluated in `RC3_MOODBOARD.md` § 3) measures each
 * beam with `getBoundingClientRect` inside an effect and re-measures under a
 * `ResizeObserver` — one SVG and one observer per beam. Twelve beams is twelve
 * observers, beams that pop in a frame after paint, and layout thrash on every
 * resize.
 *
 * Here the layout is polar and known at build time, so `BEAMS` is computed once
 * when the module loads. The SVG is correct on first paint, there is no
 * observer, no measurement, and no post-hydration reflow. The viewBox scales the
 * whole diagram; nothing needs to be recalculated because nothing was ever
 * measured.
 *
 * ## Why no motion library
 *
 * `framer-motion` is already in the bundle and importing it would be free. It
 * is still not imported, because the only thing JavaScript needs to hold is
 * *which node is active*. Every beam, every glow, the traveling signal and each
 * transition is CSS driven by one `data-active` attribute. See
 * `RC3_COMPONENT_PLAN.md` § "The cost model".
 *
 * ## Accessibility
 *
 * The `<svg>` is decoration and is `aria-hidden`. Every piece of meaning is in
 * the `<ul>` of real `<button>`s, which is rendered **once** and re-laid-out by
 * CSS: absolutely positioned on the ellipse at `md+`, a plain stacked column
 * below it, where a six-node radial diagram would be illegible at 360 px.
 * Hover, focus and click all set the same state, so pointer and keyboard reach
 * identical results, and the detail panel is `aria-live="polite"`.
 */

interface Automation {
  id: string;
  title: string;
  body: string;
  impact: string;
  Icon: typeof BellRing;
  /** Icon + status-dot colour. A token class, never a raw hex. */
  tint: string;
  dot: string;
}

/**
 * The six automations, carried over from `WorkflowUniverse` **verbatim**.
 *
 * RC3 is a visual phase and writes no marketing copy: every string below is
 * already published and already reviewed, so nothing here needs content sign-off
 * and no diagram can drift out of agreement with the page it sits on. Same rule
 * RC2 used for `WorkflowGlyph`.
 */
const AUTOMATIONS: Automation[] = [
  {
    id: 'lead-alerts',
    title: 'Missed Lead Alerts',
    body: 'Instant notifications the moment a lead comes in — so nothing waits 24 hours for a reply.',
    impact: 'Reply in under 60s',
    Icon: BellRing,
    tint: 'text-signal-warning',
    dot: 'bg-signal-warning',
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp Follow-Ups',
    body: 'An AI assistant that answers questions, qualifies leads, and books calls on WhatsApp — 24/7.',
    impact: 'Always on, always polite',
    Icon: MessageCircle,
    tint: 'text-signal-success',
    dot: 'bg-signal-success',
  },
  {
    id: 'booking',
    title: 'Appointment Booking',
    body: 'A self-serve booking flow that syncs to your calendar and CRM. No back-and-forth.',
    impact: 'Calendar fills itself',
    Icon: CalendarCheck,
    tint: 'text-accent-light',
    dot: 'bg-accent-light',
  },
  {
    id: 'reports',
    title: 'Daily Business Reports',
    body: 'A clean morning email with leads, bookings, revenue and what needs your attention today.',
    impact: 'Clarity by 9am',
    Icon: BarChart3,
    tint: 'text-accent-bright',
    dot: 'bg-accent-bright',
  },
  {
    id: 'crm-sync',
    title: 'CRM Auto-Updates',
    body: 'Forms, calls and chats flow into HubSpot, Pipedrive or GoHighLevel automatically. No manual entry.',
    impact: 'Zero data entry',
    Icon: RefreshCw,
    tint: 'text-gold-bright',
    dot: 'bg-gold-bright',
  },
  {
    id: 'invoices',
    title: 'Invoice Reminders',
    body: 'Polite, automated nudges that get invoices paid faster — without you chasing clients.',
    impact: 'Get paid sooner',
    Icon: Receipt,
    tint: 'text-accent',
    dot: 'bg-accent',
  },
];

/* ------------------------------------------------------------------ */
/* Geometry — computed once, at module load                            */
/* ------------------------------------------------------------------ */

const VIEW = { w: 1000, h: 620 };
const CENTRE = { x: 500, y: 310 };
/**
 * An ellipse, because the section is far wider than it is tall.
 *
 * `y` is deliberately not much smaller than `x`: at 205 the top and bottom
 * beams were visibly stubbier than the four diagonals, which read as a drawing
 * error rather than as perspective.
 */
const RADIUS = { x: 336, y: 232 };
/**
 * Where a beam starts and stops, in user units.
 *
 * The start is inset past the core's edge, not flush to it — flush, a signal at
 * low `offset-distance` sits on top of the core disc and reads as a stray dot
 * inside the mark instead of as something leaving it.
 */
const CORE_R = 86;
const BEAM_INSET = 12;
const NODE_R = 42;

interface Point {
  x: number;
  y: number;
}

function nodeAt(i: number, count: number): Point {
  const angle = ((-90 + (360 / count) * i) * Math.PI) / 180;
  return {
    x: CENTRE.x + RADIUS.x * Math.cos(angle),
    y: CENTRE.y + RADIUS.y * Math.sin(angle),
  };
}

/**
 * A quadratic Bézier from the core's edge to the node's edge.
 *
 * The control point is the midpoint pushed along the perpendicular, so beams
 * bow outward instead of radiating as six straight spokes — straight lines read
 * as a bicycle wheel, curves read as flow. Both endpoints are inset by the
 * respective radii so no beam is ever drawn underneath a node or the core.
 */
function beamPath(p: Point): string {
  const dx = p.x - CENTRE.x;
  const dy = p.y - CENTRE.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;

  const sx = CENTRE.x + ux * (CORE_R + BEAM_INSET);
  const sy = CENTRE.y + uy * (CORE_R + BEAM_INSET);
  const ex = p.x - ux * NODE_R;
  const ey = p.y - uy * NODE_R;

  const bow = len * 0.16;
  const cx = (sx + ex) / 2 - uy * bow;
  const cy = (sy + ey) / 2 + ux * bow;

  const r = (n: number) => Math.round(n * 10) / 10;
  return `M ${r(sx)} ${r(sy)} Q ${r(cx)} ${r(cy)} ${r(ex)} ${r(ey)}`;
}

const NODES: Point[] = AUTOMATIONS.map((_, i) => nodeAt(i, AUTOMATIONS.length));
const BEAMS: string[] = NODES.map(beamPath);

/* ------------------------------------------------------------------ */

export function AutomationUniverse() {
  const [active, setActive] = useState(0);
  // `active` is never out of range: it is only ever set from a map index.
  const current = AUTOMATIONS[active] as Automation;

  return (
    <section id="workflows" className="section relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(59,130,246,0.08), transparent 70%)',
        }}
      />

      <div className="container-edge relative">
        <SectionHeader
          kicker="What We Automate"
          title={
            <>
              Six automations that quietly{' '}
              <span className="text-ink-300">run your business.</span>
            </>
          }
          description="Real systems for real businesses — not abstract AI. Each one removes hours of manual work every week and gives you back focus, customers, and revenue."
          align="center"
          className="mx-auto items-center text-center"
        />

        {/* The canvas ratio is published from `VIEW` rather than hard-coded in
            CSS. The node buttons are positioned in percentages of the same
            viewBox, so if the stylesheet's ratio and this constant ever drifted
            apart, every node would sit slightly off its own beam — a failure
            that looks like a rendering bug and is very hard to trace back to a
            number in a different file. One source, no drift. */}
        <div
          className="universe mt-12 md:mt-16"
          style={{ '--universe-ratio': `${VIEW.w} / ${VIEW.h}` } as React.CSSProperties}
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
                <stop offset="0%" stopColor="rgb(96,165,250)" stopOpacity="0.30" />
                <stop offset="55%" stopColor="rgb(59,130,246)" stopOpacity="0.12" />
                <stop offset="100%" stopColor="rgb(59,130,246)" stopOpacity="0" />
              </radialGradient>
              {/* The core lights from within. Filled flat, it read as a hole
                  punched in the composition rather than as a source. */}
              <radialGradient id="universe-core-inner" cx="50%" cy="34%" r="76%">
                <stop offset="0%" stopColor="rgb(59,130,246)" stopOpacity="0.34" />
                <stop offset="46%" stopColor="rgb(37,99,235)" stopOpacity="0.14" />
                <stop offset="100%" stopColor="rgb(10,11,15)" stopOpacity="0.05" />
              </radialGradient>
            </defs>

            {/* Beams. The lit copy is a second path over the resting one so the
                active state changes opacity only — no geometry is recomputed. */}
            {BEAMS.map((d, i) => (
              <g key={AUTOMATIONS[i]?.id ?? i} data-lit={active === i ? 'true' : undefined}>
                <path className="universe-beam" d={d} />
                <path className="universe-beam-lit" d={d} />
              </g>
            ))}

            {/* Core: the orbital rings and the three stacked rules from the
                logo mark (SHEETFLOW_VISUAL_DNA.md § 6.1). */}
            <circle
              cx={CENTRE.x}
              cy={CENTRE.y}
              r={CORE_R + 54}
              fill="url(#universe-core-fill)"
            />
            <circle className="universe-ring" cx={CENTRE.x} cy={CENTRE.y} r={CORE_R + 30} />
            <circle className="universe-ring" cx={CENTRE.x} cy={CENTRE.y} r={CORE_R + 10} />
            <circle className="universe-core" cx={CENTRE.x} cy={CENTRE.y} r={CORE_R} />
            <circle
              cx={CENTRE.x}
              cy={CENTRE.y}
              r={CORE_R - 1}
              fill="url(#universe-core-inner)"
            />
            {[-16, 0, 16].map((dy, i) => (
              <line
                key={dy}
                className="universe-rule"
                x1={CENTRE.x - (i === 1 ? 34 : 26)}
                x2={CENTRE.x + (i === 1 ? 34 : 26)}
                y1={CENTRE.y + dy}
                y2={CENTRE.y + dy}
              />
            ))}

            {/* The traveling signal. One dot per beam, staggered so that only
                one is in flight at a time. `offset-path` reuses the identical
                `d` string, so the dot cannot drift off its beam. */}
            {BEAMS.map((d, i) => (
              <circle
                key={`signal-${AUTOMATIONS[i]?.id ?? i}`}
                className="universe-signal"
                r={5}
                style={
                  {
                    offsetPath: `path("${d}")`,
                    '--i': i,
                  } as React.CSSProperties
                }
              />
            ))}
          </svg>

          {/* The single source of meaning. Absolutely positioned onto the
              ellipse at md+, a plain column below it. */}
          <ul className="universe-nodes">
            {AUTOMATIONS.map((a, i) => {
              const p = NODES[i] as Point;
              const Icon = a.Icon;
              return (
                <li
                  key={a.id}
                  className="universe-slot"
                  style={
                    {
                      '--x': `${(p.x / VIEW.w) * 100}%`,
                      '--y': `${(p.y / VIEW.h) * 100}%`,
                    } as React.CSSProperties
                  }
                >
                  <button
                    type="button"
                    className="universe-node"
                    data-active={active === i ? 'true' : undefined}
                    aria-pressed={active === i}
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                  >
                    <span className="universe-node-badge">
                      <Icon className={`h-[18px] w-[18px] ${a.tint}`} strokeWidth={2.1} aria-hidden="true" />
                    </span>
                    <span className="universe-node-label">{a.title}</span>
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
          <p className="universe-detail-impact">
            <span className={`universe-detail-dot ${current.dot}`} aria-hidden="true" />
            {current.impact}
          </p>
        </div>

        <p className="mx-auto mt-10 max-w-md text-center text-[13px] text-ink-400">
          Need something specific? We build custom automations around how your team already works.
        </p>
      </div>
    </section>
  );
}
