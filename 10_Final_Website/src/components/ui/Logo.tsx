import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

/**
 * Logo — real brand mark (public/logo.jpg), paired with the ".AI" wordmark
 * so the mark reads distinctly from the icon's own baked-in "SheetFlow" text.
 */
export function Logo({ size = 32, showWordmark = true, className }: LogoProps) {
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
      <Image
        src="/logo.jpg"
        alt="SheetFlow"
        width={size}
        height={size}
        className="rounded-full"
        priority
      />
      {showWordmark && (
        <span>
          SheetFlow<span className="text-accent-bright">.</span>AI
        </span>
      )}
    </Link>
  );
}
