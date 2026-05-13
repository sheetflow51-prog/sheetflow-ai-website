'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BracketsProps {
  /** Inset from the edges of the parent container, in px. */
  inset?: number;
  /** Length of each L-arm, in px. */
  size?: number;
  /** Stroke width, in px. */
  thickness?: number;
  /** Color override; defaults to accent-bright/40. */
  color?: string;
  /** Animate in on mount/in-view. */
  animate?: boolean;
  /** Which corners to render. Default all four. */
  corners?: Array<'tl' | 'tr' | 'bl' | 'br'>;
  className?: string;
}

/**
 * Brackets — signature L-corner motif.
 *
 * Four 1px L-shapes that mark a region as "framed by intelligence."
 * One of the brand's recurring memory triggers (see SHEETFLOW_VISUAL_DNA.md
 * § 10.2). Used to bracket the hero, the final CTA, and any region the
 * brand wants the user to remember as a *frame*, not a card.
 *
 * Pure SVG, no JS-driven layout, sub-1KB.
 */
export function Brackets({
  inset = 16,
  size = 18,
  thickness = 1,
  color = 'rgba(165, 180, 252, 0.45)',
  animate = true,
  corners = ['tl', 'tr', 'bl', 'br'],
  className,
}: BracketsProps) {
  const reveal = animate
    ? { initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 } }
    : {};

  const arm = (orientation: 'tl' | 'tr' | 'bl' | 'br') => {
    const styles: Record<string, React.CSSProperties> = {
      tl: { top: inset, left: inset, borderTop: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}` },
      tr: { top: inset, right: inset, borderTop: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` },
      bl: { bottom: inset, left: inset, borderBottom: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}` },
      br: { bottom: inset, right: inset, borderBottom: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` },
    };
    return (
      <motion.span
        key={orientation}
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ width: size, height: size, ...styles[orientation] }}
        {...reveal}
      />
    );
  };

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0', className)}
    >
      {corners.map(arm)}
    </div>
  );
}
