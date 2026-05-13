import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

/**
 * Logo — geometric mark inspired by stacked rows of a sheet,
 * bound by an orbital ring (the intelligence layer).
 */
export function Logo({ size = 28, showWordmark = true, className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center gap-2.5 font-display text-[15px] font-semibold tracking-tight text-white',
        className,
      )}
      data-cursor="hover"
      aria-label="SheetFlow AI — Home"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
        <circle cx="14" cy="14" r="12.5" stroke="url(#logoGrad)" strokeWidth="1" opacity="0.45" />
        <path d="M7 9 L21 9 M7 14 L21 14 M7 19 L21 19" stroke="url(#logoGrad)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="14" cy="14" r="2" fill="url(#logoGrad)" />
      </svg>
      {showWordmark && (
        <span>
          SheetFlow<span className="text-accent-bright">.</span>AI
        </span>
      )}
    </Link>
  );
}
