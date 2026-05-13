import { cn } from '@/lib/utils';

interface KickerProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center';
}

/**
 * Kicker — section eyebrow label.
 * Used to introduce major sections in a cinematic, typed-out way.
 */
export function Kicker({ children, className, align = 'left' }: KickerProps) {
  return (
    <div
      className={cn(
        'kicker',
        align === 'center' && 'justify-center',
        className,
      )}
    >
      {children}
    </div>
  );
}
