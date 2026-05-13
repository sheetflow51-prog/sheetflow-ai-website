'use client';

import { useStore } from '@/lib/store';

/**
 * ScrollProgress — thin gradient line at the top of the viewport
 * that fills as the user scrolls. Aware of Lenis-driven progress value.
 */
export default function ScrollProgress() {
  const progress = useStore((s) => s.scrollProgress);
  return (
    <div
      className="fixed left-0 top-0 z-[80] h-px w-full bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-accent-bright via-violet-bright to-signal-info"
        style={{
          width: `${(progress * 100).toFixed(2)}%`,
          boxShadow: '0 0 12px rgba(99,102,241,0.6)',
          transition: 'width 80ms linear',
        }}
      />
    </div>
  );
}
