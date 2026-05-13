'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TraceProps {
  /** Path orientation. */
  orientation?: 'horizontal' | 'vertical';
  /** Length in px (the path travel). */
  length?: number;
  /** Number of nodes along the trace. */
  nodes?: number;
  /** Where to place the bright "live" node — 0..nodes-1, default last. */
  active?: number;
  /** Animate the path-draw and node arrivals. */
  animate?: boolean;
  className?: string;
}

/**
 * Trace — signature line-with-nodes motif.
 *
 * A 1px gradient line punctuated by small nodes, with one node lit as
 * "active." Visualises the brand's core mental model: data flows through
 * the intelligence layer, with one node currently *receiving signal*.
 *
 * Recurring memory motif (see SHEETFLOW_VISUAL_DNA.md § 10.2). Drop into
 * any section that benefits from a quiet "the system is operating" cue.
 */
export function Trace({
  orientation = 'horizontal',
  length = 240,
  nodes = 5,
  active,
  animate = true,
  className,
}: TraceProps) {
  const isH = orientation === 'horizontal';
  const activeIdx = active ?? nodes - 1;

  const wrapStyle: React.CSSProperties = isH
    ? { width: length, height: 12 }
    : { width: 12, height: length };

  const drawTransition = {
    duration: 1.4,
    ease: [0.16, 1, 0.3, 1],
    delay: 0.2,
  };

  return (
    <div
      aria-hidden="true"
      className={cn('relative', className)}
      style={wrapStyle}
    >
      {/* The line itself */}
      <motion.div
        className="absolute"
        style={
          isH
            ? {
                left: 0,
                right: 0,
                top: '50%',
                height: 1,
                transform: 'translateY(-50%)',
                background:
                  'linear-gradient(90deg, transparent, rgba(165,180,252,0.5) 30%, rgba(165,180,252,0.5) 70%, transparent)',
                transformOrigin: 'left',
              }
            : {
                top: 0,
                bottom: 0,
                left: '50%',
                width: 1,
                transform: 'translateX(-50%)',
                background:
                  'linear-gradient(180deg, transparent, rgba(165,180,252,0.5) 30%, rgba(165,180,252,0.5) 70%, transparent)',
                transformOrigin: 'top',
              }
        }
        initial={animate ? (isH ? { scaleX: 0 } : { scaleY: 0 }) : false}
        whileInView={animate ? (isH ? { scaleX: 1 } : { scaleY: 1 }) : undefined}
        viewport={{ once: true, margin: '-15%' }}
        transition={drawTransition}
      />

      {/* Nodes */}
      {Array.from({ length: nodes }).map((_, i) => {
        const t = nodes === 1 ? 0.5 : i / (nodes - 1);
        const isActive = i === activeIdx;
        const nodeStyle: React.CSSProperties = isH
          ? {
              left: `${t * 100}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }
          : {
              top: `${t * 100}%`,
              left: '50%',
              transform: 'translate(-50%, -50%)',
            };
        return (
          <motion.span
            key={i}
            className="absolute block rounded-full"
            style={{
              ...nodeStyle,
              width: isActive ? 6 : 4,
              height: isActive ? 6 : 4,
              background: isActive ? '#A5B4FC' : 'rgba(165, 180, 252, 0.45)',
              boxShadow: isActive ? '0 0 12px rgba(165,180,252,0.8)' : 'none',
            }}
            initial={animate ? { opacity: 0, scale: 0.4 } : false}
            whileInView={animate ? { opacity: 1, scale: 1 } : undefined}
            viewport={{ once: true, margin: '-15%' }}
            transition={{
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1],
              delay: 0.4 + t * 0.4,
            }}
          />
        );
      })}

      {/* Active-node breathing pulse */}
      {animate && (
        <motion.span
          aria-hidden="true"
          className="absolute rounded-full"
          style={
            isH
              ? {
                  left: `${(activeIdx / Math.max(nodes - 1, 1)) * 100}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 14,
                  height: 14,
                  background:
                    'radial-gradient(circle, rgba(165,180,252,0.5), transparent 70%)',
                }
              : {
                  top: `${(activeIdx / Math.max(nodes - 1, 1)) * 100}%`,
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 14,
                  height: 14,
                  background:
                    'radial-gradient(circle, rgba(165,180,252,0.5), transparent 70%)',
                }
          }
          animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
}
