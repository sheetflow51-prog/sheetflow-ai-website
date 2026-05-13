'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

/**
 * AudioToggle — small, discreet control to opt into audio.
 *
 * Off by default. Once toggled on, the global ambient loop starts
 * (assuming the corresponding asset exists at `/audio/ambient-atmos.mp3`).
 *
 * Place in the navigation, footer, or fixed in a corner — wherever
 * the brand tone calls for it.
 */
export function AudioToggle({ className }: { className?: string }) {
  const enabled = useStore((s) => s.audioEnabled);
  const setEnabled = useStore((s) => s.setAudioEnabled);

  return (
    <button
      type="button"
      onClick={() => setEnabled(!enabled)}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/55 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white/95',
        enabled && 'border-accent/40 bg-accent/10 text-accent-bright',
        className,
      )}
      aria-pressed={enabled}
      aria-label={enabled ? 'Mute ambient audio' : 'Enable ambient audio'}
      data-cursor="hover"
    >
      {enabled ? (
        <Volume2 className="h-4 w-4" strokeWidth={1.6} />
      ) : (
        <VolumeX className="h-4 w-4" strokeWidth={1.6} />
      )}
    </button>
  );
}
