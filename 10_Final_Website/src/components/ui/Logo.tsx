import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

/**
 * Logo — the icon-only brand mark paired with a live-text wordmark.
 *
 * Per DEC-301 this is a crop of the canonical `logo.png`, not the vector
 * reconstruction: the nav needs no scalability that a 96px raster cannot give,
 * so the original wins. The crop excludes the render's baked-in "SheetFlow",
 * which would otherwise print the name twice beside the wordmark.
 *
 * Served at 96px so it stays sharp at 3x DPR.
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
        src="/brand/raster/icon-96.png"
        alt=""
        width={size}
        height={size}
        priority
        aria-hidden="true"
      />
      {showWordmark && (
        <span>
          SheetFlow<span className="text-accent-bright">.</span>AI
        </span>
      )}
    </Link>
  );
}
