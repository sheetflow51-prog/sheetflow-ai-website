'use client';

import { Lock } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

interface ProofPlaceholderProps {
  /** What will occupy this slot, e.g. "Customer results". */
  title: string;
  /** Why it is not here yet. Written for a visitor, not for the team. */
  body: string;
  /** Optional count of skeleton cards to lay out. Defaults to 3. */
  cards?: number;
}

/**
 * ProofPlaceholder — occupies a proof section while its content awaits
 * verification.
 *
 * This is a deliberate design position, not a stub. SheetFlow is early enough
 * that it has no permissioned customer evidence, and inventing some would be
 * worse than saying so. The placeholder states that plainly and preserves the
 * section's rhythm so the page still reads as finished.
 *
 * It renders no company names, no metrics, and no quotes — including from
 * `pending` pipeline entries, which never reach the UI.
 */
export function ProofPlaceholder({ title, body, cards = 3 }: ProofPlaceholderProps) {
  return (
    <div className="grid gap-3.5 md:grid-cols-3">
      {Array.from({ length: cards }, (_, i) => (
        <GlassCard
          key={i}
          variant="subtle"
          className="relative flex min-h-[220px] flex-col justify-between overflow-hidden"
          // Only the first card carries the message; the rest are quiet
          // structure. Hiding them from AT avoids three identical readings.
          aria-hidden={i > 0 ? 'true' : undefined}
        >
          {i === 0 ? (
            <>
              {/* ink-300, not the ink-400 used for muted labels elsewhere:
                  at 10px on this surface ink-400 measures 4.26:1, under the
                  4.5:1 AA floor. ink-300 measures 8.31:1. */}
              <div className="flex items-center gap-2 text-ink-300">
                <Lock className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
                <span className="font-mono text-[10px] uppercase tracking-widest">
                  {title}
                </span>
              </div>
              <p className="text-[15px] leading-relaxed text-ink-300 text-pretty">
                {body}
              </p>
            </>
          ) : (
            /* Structural ghost — conveys the shape of what will land here.
               Bars are static: an animated skeleton would read as loading. */
            <div className="flex h-full flex-col justify-between opacity-[0.35]">
              <div className="h-3 w-24 rounded-full bg-white/[0.06]" />
              <div className="flex flex-col gap-2">
                <div className="h-2.5 w-full rounded-full bg-white/[0.05]" />
                <div className="h-2.5 w-4/5 rounded-full bg-white/[0.05]" />
                <div className="h-2.5 w-2/3 rounded-full bg-white/[0.05]" />
              </div>
              <div className="h-6 w-20 rounded-md bg-white/[0.05]" />
            </div>
          )}
        </GlassCard>
      ))}
    </div>
  );
}
