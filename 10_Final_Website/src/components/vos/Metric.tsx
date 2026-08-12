/**
 * Live Metrics Engine.
 *
 * ## The rule this enforces, and why it is in the type
 *
 * `VISUAL_DNA_V2.md` § 6: *a drawn artifact may never contain a number, a name,
 * a timestamp or a message body that is not already published elsewhere on the
 * site.* A metric readout is the single most dangerous thing this site can
 * draw, because a figure in a dashboard **is** a claim about a customer, and it
 * looks like a claim even when the surrounding copy says otherwise.
 *
 * So, exactly as with `Artifact`, **`provenance` is required** — on the group,
 * where it belongs, since one caption governing four readouts is the honest
 * arrangement and four separate ones would be noise. `MetricGroup` emits the
 * mark itself, so it cannot be forgotten and cannot be rewritten into
 * marketing language by a caller in a hurry.
 *
 * ## Why nothing counts up
 *
 * The revision this replaces animated each figure from 0 to its value over
 * 1.4s, driven by `framer-motion`'s `animate` under a `useInView` gate — three
 * hooks and a client boundary per readout.
 *
 * It is removed rather than reimplemented in CSS, and the reason is not cost.
 * **A number that counts up asserts it is being computed**, live, from
 * something. On seeded demonstration data that is precisely the "convincing is
 * the failure mode" trap § 6 exists to close: the animation makes a sample
 * figure behave like a measured one. The honest signal that a surface is live
 * is the one the system already has — `Surface`'s scan line, which means
 * exactly one thing: the system is writing here.
 *
 * What remains moving is the sparkline's endpoint, which is one 2px element on
 * a 6s opacity loop, and the trace, which is scroll-driven and therefore free.
 *
 * Server component. Zero JavaScript, where the revision it replaces was
 * `'use client'` and pulled in `animate`, `useInView`, `useState`, `useEffect`
 * and `useRef`.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Surface, type Elevation } from './Surface';
import type { Provenance } from './Artifact';

const PROVENANCE_NOTE: Record<Provenance, string | null> = {
  indicative: 'Indicative layout',
  illustrative: 'Illustrative — drawn from published copy',
  seeded: 'Seeded demonstration data — not a customer account',
  capture: null,
};

export interface MetricProps {
  /**
   * The figure, pre-formatted, as a string.
   *
   * A string rather than a number, deliberately: formatting a number here would
   * put locale and separator decisions inside the engine, and a readout whose
   * grouping changes with the server's locale is a figure that renders
   * differently to different visitors.
   */
  value: string;
  label: string;
  /** Change alongside the figure — "+12". Rendered with a direction glyph. */
  delta?: string;
  direction?: 'up' | 'down';
  /**
   * `gold` marks this readout as the composition's outcome.
   *
   * `VISUAL_DNA_V2.md` § 2: blue is the system working, gold is the system
   * *having worked*, one per composition. In a row of figures that means the
   * one the business is actually trying to move — the booking, not the traffic.
   */
  tone?: 'default' | 'gold';
  className?: string;
}

export function Metric({
  value,
  label,
  delta,
  direction = 'up',
  tone = 'default',
  className,
}: MetricProps) {
  return (
    <div className={cn('vos-metric', className)}>
      <p className={cn('vos-metric-value', tone === 'gold' && 'vos-metric-value--gold')}>{value}</p>
      <p className="vos-metric-foot">
        <span className="vos-metric-label">{label}</span>
        {delta ? (
          <span className={cn('vos-metric-delta', `vos-metric-delta--${direction}`)}>
            {/* A glyph, not a lucide import: two arrows would pull an icon
                component into a purely typographic row, and the direction is
                already carried by the colour class for anyone who can see it
                and by the sign in the string for anyone who cannot. */}
            <span aria-hidden="true">{direction === 'up' ? '↑' : '↓'}</span>
            {delta}
          </span>
        ) : null}
      </p>
    </div>
  );
}

export interface SparklineProps {
  /** The series. Normalised to the viewBox here; callers pass raw values. */
  series: number[];
  /** Marks the leading edge with the one continuously-moving element. */
  live?: boolean;
  className?: string;
}

const SPARK = { w: 100, h: 100 };

/**
 * Builds the polyline once, on the server.
 *
 * `preserveAspectRatio="none"` is correct here and is not the distortion trap
 * `AIInfrastructure` documents: a sparkline has no round elements and no
 * travelling dot, so non-uniform scale changes only the slope — which is what
 * a sparkline stretched to its container is supposed to do.
 */
function sparkPath(series: number[]): { line: string; area: string } | null {
  if (series.length < 2) return null;

  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;

  const line = series
    .map((p, i) => {
      const x = Math.round((i / (series.length - 1)) * SPARK.w * 10) / 10;
      const y = Math.round((SPARK.h - ((p - min) / range) * SPARK.h) * 10) / 10;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return { line, area: `${line} L ${SPARK.w} ${SPARK.h} L 0 ${SPARK.h} Z` };
}

export function Sparkline({ series, live = false, className }: SparklineProps) {
  const path = sparkPath(series);
  if (!path) return null;

  return (
    <div className={cn('vos-spark', className)}>
      <svg
        className="vos-spark-svg"
        viewBox={`0 0 ${SPARK.w} ${SPARK.h}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {/* Scoped id. A second sparkline on one page sharing `sparkFill`
              would have both resolve to whichever `<defs>` the document parsed
              last — a bug that only appears once a page has two of something. */}
          <linearGradient id="vos-spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(96,165,250)" stopOpacity="0.34" />
            <stop offset="100%" stopColor="rgb(96,165,250)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="vos-spark-area" d={path.area} fill="url(#vos-spark-fill)" />
        {/* `vector-effect` keeps the stroke 1.4px after the non-uniform scale
            above; without it the line thins horizontally and thickens
            vertically with the container's aspect. */}
        <path className="vos-spark-line" d={path.line} vectorEffect="non-scaling-stroke" />
      </svg>
      {live ? <span className="vos-spark-tip" aria-hidden="true" /> : null}
    </div>
  );
}

export interface MetricGroupProps {
  /** Required by design. See the module note. */
  provenance: Provenance;
  /** Replaces the default provenance caption when a specific one is truer. */
  note?: string;
  /** Small mono label on the surface's header row. */
  title?: string;
  elevation?: Elevation;
  /** The scan line — the system is writing to this surface. */
  live?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function MetricGroup({
  provenance,
  note,
  title,
  elevation = 3,
  live = false,
  className,
  children,
}: MetricGroupProps) {
  const caption = note ?? PROVENANCE_NOTE[provenance];

  return (
    <figure className={cn('vos-metrics', className)}>
      <Surface elevation={elevation} live={live} className="vos-metrics-body">
        {title ? <p className="vos-metrics-title">{title}</p> : null}
        {children}
      </Surface>

      {/* Last child — the HTML spec requires `figcaption` to be the figure's
          first or last child, and RC3 shipped an invalid `<figure>` by
          appending a panel after one. */}
      {caption ? <figcaption className="vos-artifact-note">{caption}</figcaption> : null}
    </figure>
  );
}
