'use client';

import { Moon, Sun } from 'lucide-react';
import { applyTheme } from '@/lib/theme';
import { useTheme } from '@/lib/use-theme';
import { cn } from '@/lib/utils';

/**
 * Light / Dark switch for the navigation.
 *
 * Shows the icon of the mode you would switch TO, as a pressed-state button with
 * an explicit label. The theme itself is set before paint by the inline script in
 * `layout.tsx`, so this component only ever reads it and flips it.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme();
  const dark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => applyTheme(dark ? 'light' : 'dark')}
      aria-pressed={dark}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      data-cursor="hover"
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.03] text-white/80 backdrop-blur transition-colors hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className,
      )}
    >
      {dark ? <Sun className="h-4 w-4" strokeWidth={2} aria-hidden="true" /> : <Moon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />}
    </button>
  );
}
