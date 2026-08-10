/**
 * Evidence Overlay Engine.
 *
 * ## Why this is a primitive and not a component
 *
 * `VISUAL_DNA_V2.md` § 6 promotes evidence from a content rule to a **visual**
 * rule: every artifact this site draws carries a visible provenance mark. Until
 * now that rule lived only in the type system (`ProjectEvidence`, D24) and in
 * one hand-written caption inside `DigitalCraft`.
 *
 * Here it is structural: **`provenance` is a required prop**. There is no way
 * to render an artifact through this engine without declaring what it is, and
 * the caption is emitted by the engine rather than by the caller — so it cannot
 * be forgotten, and it cannot drift into marketing language.
 *
 * ## The register, which is the point
 *
 * A drawn artifact may not contain a number, name, timestamp or message body
 * that is not already published elsewhere on the site. That is why these
 * wireframes are coarse: **convincing is the failure mode.** A schematic claims
 * nothing; a photorealistic dashboard full of invented metrics claims a
 * customer. The coarseness is the correct register, not a compromise.
 *
 * Server component. The shapes are data, so four artifacts of twenty elements
 * are four arrays rather than eighty near-identical JSX tags — the block nobody
 * re-reads and where a wrong coordinate hides indefinitely.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Surface, type Elevation } from './Surface';

export type ArtifactTone = 'dim' | 'line' | 'mid' | 'accent' | 'gold';

/** `[x, y, width, height, tone?, radius?]` */
export type Shape = [number, number, number, number, ArtifactTone?, number?];

/**
 * Literal map, not `` `vos-fill--${tone}` ``.
 *
 * RC4 shipped the interpolated version: Tailwind tree-shook all five rules out
 * of `@layer components` because its content scanner could not find the class
 * names, every `<rect>` fell back to SVG's default `fill: black`, and the
 * browser frame rendered as a stack of black bars. It compiled and type-checked.
 * Only a screenshot showed it.
 */
const TONE_CLASS: Record<ArtifactTone, string> = {
  dim: 'vos-fill--dim',
  line: 'vos-fill--line',
  mid: 'vos-fill--mid',
  accent: 'vos-fill--accent',
  gold: 'vos-fill--gold',
};

/**
 * What this artifact is. Required — see the module note.
 *
 * `capture` is the only kind that needs no caption, because a photograph of a
 * shipped thing is self-evidencing. Every other kind states itself.
 */
export type Provenance = 'indicative' | 'illustrative' | 'seeded' | 'capture';

const PROVENANCE_NOTE: Record<Provenance, string | null> = {
  indicative: 'Indicative layout',
  illustrative: 'Illustrative — drawn from published copy',
  seeded: 'Seeded demonstration data',
  capture: null,
};

export interface ArtifactProps {
  /** Required by design. `VISUAL_DNA_V2.md` § 6. */
  provenance: Provenance;
  /** Replaces the default provenance caption when a specific one is truer. */
  note?: string;
  /** Shape list for the schematic. Omit when supplying `children`. */
  shapes?: Shape[];
  /** viewBox dimensions for `shapes`. */
  view?: { w: number; h: number };
  elevation?: Elevation;
  /** Marks a surface the system is actively writing to. `Surface`'s scan line. */
  live?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function Artifact({
  provenance,
  note,
  shapes,
  view = { w: 640, h: 380 },
  elevation = 2,
  live = false,
  className,
  children,
}: ArtifactProps) {
  const caption = note ?? PROVENANCE_NOTE[provenance];

  return (
    <figure className={cn('vos-artifact', className)}>
      {/* A schematic needs a surface to sit on. A child that is already a frame
          — a device, a browser window — *is* the surface, and wrapping it in
          another one gives a frame inside a frame, which reads as a mistake and
          clips whatever the inner frame's shadow was doing. So the Surface is
          rendered only for the shapes case. */}
      {shapes ? (
        <Surface elevation={elevation} live={live} className="vos-artifact-body">
          <svg
            className="vos-artifact-svg"
            viewBox={`0 0 ${view.w} ${view.h}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
            focusable="false"
          >
            {shapes.map(([x, y, w, h, tone = 'dim', r = 4], i) => (
              <rect
                key={`${x}-${y}-${i}`}
                x={x}
                y={y}
                width={w}
                height={h}
                rx={r}
                className={TONE_CLASS[tone]}
              />
            ))}
          </svg>
        </Surface>
      ) : (
        children
      )}

      {/* Last child, never between the body and nothing: the HTML spec requires
          `figcaption` to be the figure's first or last child, and RC3 shipped an
          invalid `<figure>` by appending a panel after it. */}
      {caption ? <figcaption className="vos-artifact-note">{caption}</figcaption> : null}
    </figure>
  );
}
