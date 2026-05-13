'use client';

import { useCallback } from 'react';
import { getAudioEngine } from '@/lib/audio';
import { useStore } from '@/lib/store';

/**
 * useSound — call from any component to trigger a one-shot sound.
 *
 * Returns a `play(id, opts)` function. Silently no-ops if:
 *   - audio is disabled (master toggle)
 *   - audio engine hasn't been gestured awake yet
 *   - the sound isn't registered or the file is missing
 *
 * Example:
 *   const play = useSound();
 *   <button onClick={() => play('ui.click')}>Go</button>
 */
export function useSound() {
  const enabled = useStore((s) => s.audioEnabled);
  const ready = useStore((s) => s.audioInitialized);

  return useCallback(
    (id: string, opts?: { volume?: number; rate?: number }) => {
      if (!enabled || !ready) return;
      const engine = getAudioEngine();
      void engine?.play(id, opts);
    },
    [enabled, ready],
  );
}
