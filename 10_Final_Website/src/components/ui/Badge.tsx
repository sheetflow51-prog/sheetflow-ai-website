import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'live' | 'ai' | 'new' | 'plain';
}

export function Badge({ variant = 'plain', className, children, ...props }: BadgeProps) {
  const cls =
    variant === 'live' ? 'badge badge-live' :
    variant === 'ai' ? 'badge badge-ai' :
    variant === 'new' ? 'badge badge-new' :
    'badge bg-white/5 border border-white/10 text-white/70';

  return (
    <div className={cn(cls, className)} {...props}>
      {children}
    </div>
  );
}
