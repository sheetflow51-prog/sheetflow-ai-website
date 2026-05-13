'use client';

import * as React from 'react';
import { useMouseTrack } from '@/lib/hooks/useMouseTrack';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'feature' | 'subtle' | 'strong';
  interactive?: boolean;
}

/**
 * GlassCard — the project's primary surface primitive.
 * - default: rest card with glass blur
 * - feature: bento card with mouse-tracked highlight
 * - strong: floating modals / nav-level
 * - subtle: light card, low elevation
 */
export function GlassCard({
  variant = 'default',
  interactive = false,
  className,
  children,
  ...props
}: GlassCardProps) {
  const ref = useMouseTrack<HTMLDivElement>();

  const base =
    variant === 'feature'
      ? 'feature-card'
      : variant === 'strong'
        ? 'glass-strong rounded-2xl p-7'
        : variant === 'subtle'
          ? 'glass-subtle rounded-xl p-5'
          : 'card';

  return (
    <div
      ref={variant === 'feature' ? ref : undefined}
      className={cn(base, interactive && 'card-interactive', className)}
      {...props}
    >
      {children}
    </div>
  );
}
