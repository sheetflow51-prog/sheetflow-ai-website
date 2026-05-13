'use client';

import * as React from 'react';
import { Brackets } from './Brackets';
import { cn } from '@/lib/utils';

interface SignatureFrameProps {
  children: React.ReactNode;
  /** Bracket inset from the frame edge, in px. */
  inset?: number;
  /** Bracket size, in px. */
  size?: number;
  /** Add inner padding so content doesn't crash into brackets. */
  padded?: boolean;
  className?: string;
}

/**
 * SignatureFrame — wraps a region with the proprietary L-bracket motif.
 *
 * Used to mark a region as "framed by intelligence" — a recurring brand
 * memory trigger from SHEETFLOW_VISUAL_DNA.md § 10.2.
 *
 * Use sparingly. Two uses per page max — usually the hero composition
 * and the final CTA. Overuse dilutes the signature.
 */
export function SignatureFrame({
  children,
  inset = 16,
  size = 18,
  padded = false,
  className,
}: SignatureFrameProps) {
  return (
    <div
      className={cn(
        'relative',
        padded && 'p-10 md:p-14',
        className,
      )}
    >
      <Brackets inset={inset} size={size} />
      {children}
    </div>
  );
}
