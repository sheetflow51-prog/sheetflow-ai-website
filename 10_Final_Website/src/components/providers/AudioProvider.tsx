'use client';

import { useEffect } from 'react';
import { getAudioEngine } from '@/lib/audio';
import { useStore } from '@/lib/store';

/**
 * AudioProvider — registers the sound library, gates the engine behind
 * a user gesture, and connects the global mute toggle to the engine.
 *
 * NEVER autoplays. Engine is dormant until {audioEnabled} flips true
 * AND a user-gesture-listener resumes the AudioContext.
 *
 * Sound files referenced here are placeholders — drop real assets into
 * `public/audio/` to activate them. Until they exist, calls no-op silently.
 */

const SOUND_LIBRARY = [
  // UI
  { id: 'ui.hover', url: '/audio/ui-hover.mp3', category: 'ui', volume: 0.25 },
  { id: 'ui.click', url: '/audio/ui-click.mp3', category: 'ui', volume: 0.35 },
  // Signals
  { id: 'signal.notify', url: '/audio/signal-notify.mp3', category: 'signal', volume: 0.4 },
  { id: 'signal.success', url: '/audio/signal-success.mp3', category: 'signal', volume: 0.4 },
  // Ambient
  { id: 'ambient.atmos', url: '/audio/ambient-atmos.mp3', category: 'ambient', volume: 0.18, loop: true },
] as const;

export default function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioEnabled = useStore((s) => s.audioEnabled);
  const audioInitialized = useStore((s) => s.audioInitialized);
  const setAudioInitialized = useStore((s) => s.setAudioInitialized);

  // Register the sound library once
  useEffect(() => {
    const engine = getAudioEngine();
    if (!engine) return;
    SOUND_LIBRARY.forEach((s) =>
      engine.register({
        id: s.id,
        url: s.url,
        category: s.category as 'ui' | 'signal' | 'ambient',
        volume: s.volume,
        loop: 'loop' in s ? s.loop : false,
      }),
    );
  }, []);

  // Gate engine init behind a user gesture (any first click/keydown anywhere).
  // We DO NOT auto-init — we only attach a single one-shot listener.
  useEffect(() => {
    if (audioInitialized) return;
    const onGesture = async () => {
      const engine = getAudioEngine();
      await engine?.init();
      setAudioInitialized(true);
    };
    window.addEventListener('pointerdown', onGesture, { once: true });
    window.addEventListener('keydown', onGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
    };
  }, [audioInitialized, setAudioInitialized]);

  // Mute toggle: when audioEnabled flips, start/stop ambient loop.
  useEffect(() => {
    if (!audioInitialized) return;
    const engine = getAudioEngine();
    if (!engine) return;
    if (audioEnabled) {
      engine.play('ambient.atmos');
    } else {
      engine.stop('ambient.atmos');
    }
  }, [audioEnabled, audioInitialized]);

  return <>{children}</>;
}
