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
 * Uses `sheetflow-icon.svg`, not the original `logo.png`, because that render
 * has "SheetFlow" baked into it: pairing it with the wordmark printed the name
 * twice in the navigation. The icon variant exists precisely for lockups where
 * the wordmark is set in live text.
 *
 * `unoptimized` because the Next image optimizer rejects SVG unless
 * `dangerouslyAllowSVG` is set. The file is a 2.7 KB static asset, so there is
 * nothing to optimise.
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
        src="/brand/sheetflow-icon.svg"
        alt=""
        width={size}
        height={size}
        priority
        unoptimized
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
