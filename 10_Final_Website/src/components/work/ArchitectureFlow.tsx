import { cn } from '@/lib/utils';
import { WorkflowGlyph } from './WorkflowGlyph';
import type { ArchitectureStage } from '@/content/work';

/**
 * The automation architecture diagram.
 *
 * ## Why this is not a client component
 *
 * The homepage's measured problem is paint, not JavaScript (see
 * `PROJECT_HEALTH.md`), and the case-study routes are the fast ones — 96–97 on
 * desktop. A diagram is the obvious place to reach for animation, and doing so
 * would spend the one budget these pages have going for them. This renders as
 * static markup with no `'use client'`, no motion library, and no runtime
 * cost beyond layout.
 *
 * ## Why it is a list, not an SVG
 *
 * An SVG flowchart is an image to a screen reader — the connectors carry the
 * meaning and none of it is in the accessibility tree. An ordered list *is* the
 * semantics: stages happen in sequence, and each has named parts. The arrows
 * are decorative CSS on top of correct markup, rather than markup drawn to look
 * correct.
 *
 * The connector is hidden below `md` because the stages stack vertically there
 * and a horizontal arrow between them would point the wrong way.
 *
 * ## The rail, added in RC2
 *
 * This section is headed *"How the work moves through it"* and, before RC2,
 * rendered four cards whose only mark of sequence was a **16px hairline** that
 * was `hidden` below 1280px. On every viewport under `xl` the flow diagram was
 * four unrelated cards; above it, four unrelated cards joined by something most
 * visitors would never notice (`docs/RC2_VISUAL_AUDIT.md` § V3).
 *
 * The fix keeps the argument above intact — the `<ol>` still carries the
 * semantics — and adds a `WorkflowGlyph` rail that shows the whole pipeline at
 * a glance before the detail. The rail is `aria-hidden`: it restates the stage
 * names the cards below already announce, and a screen reader gaining the same
 * four labels twice is noise, not access.
 */
export function ArchitectureFlow({
  stages,
  className,
}: {
  stages: ArchitectureStage[];
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <div
        aria-hidden="true"
        className="rounded-2xl glass-subtle relative overflow-hidden px-5 py-7 sm:px-8"
      >
        <div className="pointer-events-none absolute inset-0 signature-grid opacity-70" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 120% at 50% 0%, rgba(59,130,246,0.10), transparent 70%)',
          }}
        />
        {/* Deliberately narrower than the card grid below, and centred.
            Full-width, the rail's four nodes landed ~30px off the four card
            centres — close enough to read as a misalignment rather than as a
            separate object. Exact alignment is not available either: the detail
            grid is `xl:grid-cols-4` regardless of stage count, so a five-stage
            project wraps 4 + 1 and no rail can track it. Centring at a visibly
            different width makes the rail a summary of the section rather than
            a header for its columns. */}
        <WorkflowGlyph stages={stages} variant="rail" className="relative mx-auto max-w-3xl" />
      </div>

      <ol className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stages.map((stage, i) => (
          <li key={stage.stage} className="relative flex">
            {/* Connector to the next stage. Decorative: the <ol> already encodes
                order. Only drawn between siblings on one row, never after the
                last stage. */}
            {i < stages.length - 1 && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-full top-[38px] z-10 hidden h-px w-4 -translate-x-2 bg-gradient-to-r from-accent-bright/40 to-transparent xl:block"
              />
            )}

            <div className="flex w-full flex-col gap-4 rounded-2xl glass p-6">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent-bright/30 font-mono text-[11px] text-accent-bright/80"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <h3 className="font-display text-[17px] font-semibold text-white">{stage.stage}</h3>
              </div>

              <p className="text-[14px] leading-relaxed text-ink-200 text-pretty">{stage.detail}</p>

              <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
                {stage.nodes.map((node) => (
                  <li
                    key={node}
                    className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2 py-1 font-mono text-[10px] leading-none text-ink-300"
                  >
                    {node}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
