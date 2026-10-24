import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import {
  Chapter,
  Metric,
  MetricGroup,
  Sparkline,
  Surface,
} from '@/components/vos';
import { beat } from '@/content/narrative';

/**
 * The report — chapter 06, the *Results* beat.
 *
 * ## What this replaces
 *
 * A `'use client'` section importing `motion`, `animate`, `useInView`,
 * `useEffect`, `useRef`, `useState`, `GlassCard`, `TiltCard`, `Breathing`,
 * `Badge` and `prefersReducedMotion`, to render: two counters that animated
 * from zero, a chart whose path drew itself, a card that tilted under the
 * cursor, a scan bar on a 5.5s loop, a shimmer on a progress bar, and two
 * absolutely-positioned cards overhanging the container by 74px and 58px.
 *
 * Every one of those is now CSS or gone, and the section is a server component.
 *
 * ## What went, and why — this is the part that is a judgement, not a port
 *
 * **The counters.** Removed rather than reimplemented. A number that counts up
 * asserts it is being *computed*, live, from something. These figures are
 * seeded demonstration data, and the animation made them behave like measured
 * ones — which is the "convincing is the failure mode" trap `VISUAL_DNA_V2.md`
 * § 6 exists to close. The section's own header said *"Sample data"* while its
 * primary motion said the opposite.
 *
 * **The tilt.** `TiltCard` tracks `mousemove` to rotate a card in 3D. It is
 * pointer-only, so it does not exist for half the visitors, and it needed a
 * 56px symmetric gutter reserved around the card purely so the rotation would
 * not push content past the grid column. Depth is now expressed the way § 4.3
 * says to express it — elevation tier, saturation and blur — which reads at
 * every input device and costs no gutter.
 *
 * **The two floating cards.** Kept, verbatim, but placed rather than
 * overhung. They were positioned at `-top-[74px]` and `-bottom-[58px]` with a
 * `hidden md:block` because there was no width at which they fitted; that is a
 * layout working around itself. They are now the CONTEXT plane beside the
 * SUBJECT (§ 4.3), which is what they always were.
 *
 * ## The evidence position is unchanged and is stated in the markup
 *
 * Every figure below is already published on this page and is carried over
 * **verbatim**. `MetricGroup` requires `provenance`, and this is `seeded`, so
 * the engine emits *"Seeded demonstration data — not a customer account"*
 * beneath the surface. That caption cannot be forgotten and cannot be softened
 * by a caller, which is the whole reason the prop is required.
 */

/**
 * Fourteen days of leads, as a shape.
 *
 * No axis, no figures, and deliberately so: a line with a slope is a shape, a
 * line with numbers beside it is a claim. The published copy says
 * *"Trending up"*, and an ascending line is that sentence drawn.
 */
const LEADS_14D = [22, 28, 26, 34, 31, 42, 38, 48, 52, 49, 58, 64, 60, 72, 78];

export function AIDashboard() {
  const { mark, tier, tone, grid } = beat('reports');

  return (
    <Chapter
      id="reports"
      mark={mark}
      tier={tier}
      tone={tone}
      grid={grid}
      kicker="What lands on your desk"
      title={
        <>
          One clean dashboard for{' '}
          <span className="text-ink-300">leads, bookings, revenue.</span>
        </>
      }
      description="No more scattered spreadsheets. We build you a single view of your business — leads in, follow-ups out, appointments booked, money in the bank. Delivered to your inbox every morning."
    >
      <div className="chapter-stage report">
        {/* SUBJECT — the one presented surface in this chapter (§ 4.1), and the
            only one carrying the scan line, which means exactly one thing: the
            system is writing here (§ 3.3). */}
        <MetricGroup
          provenance="seeded"
          title="Weekly overview"
          elevation={4}
          live
          className="report-main"
        >
          <div className="report-figures">
            <Metric value="184" label="New leads" delta="+12" />
            {/* The one gold element on this composition. § 2: gold marks an
                outcome, and a confirmed booking is the outcome this whole page
                is about — "From first contact to booked". */}
            <Metric value="47" label="Bookings confirmed" delta="+8" tone="gold" />
          </div>

          <div className="report-chart">
            <p className="report-chart-head">
              <span>Leads · last 14 days</span>
              <span className="report-trend">
                <TrendingUp className="h-3 w-3" aria-hidden="true" />
                Trending up
              </span>
            </p>
            <Sparkline series={LEADS_14D} live />
          </div>
        </MetricGroup>

        {/* CONTEXT — tier 2, less saturated, sitting behind the subject in the
            z-grammar rather than overhanging it in the layout. */}
        <div className="report-notes">
          <Surface elevation={2} className="report-note report-note--success">
            <p className="report-note-head">
              <CheckCircle2 className="h-4 w-4 text-signal-success" strokeWidth={2.4} aria-hidden="true" />
              Lead followed up
            </p>
            <p className="report-note-body">
              WhatsApp reply sent in 38s. Booked a call for Friday 2pm.
            </p>
            <p className="report-note-foot report-note-foot--success">Auto · No staff needed</p>
          </Surface>

          <Surface elevation={2} className="report-note">
            <p className="report-note-head">
              <AlertCircle className="h-3.5 w-3.5 text-accent-bright" strokeWidth={2.4} aria-hidden="true" />
              Today&rsquo;s goal
            </p>
            <p className="report-note-body">20 leads contacted · 13 done</p>
            {/* 13 of 20 is 65%, and the bar is set from that arithmetic rather
                than from the hand-tuned 64% the previous revision animated to.
                A progress bar that disagrees with the sentence above it is a
                small lie that costs nothing to avoid. */}
            <span className="report-bar" aria-hidden="true">
              <span className="report-bar-fill" style={{ width: '65%' }} />
            </span>
          </Surface>
        </div>
      </div>
    </Chapter>
  );
}
