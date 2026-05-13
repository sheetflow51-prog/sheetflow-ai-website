/**
 * Audio engine — modular, opt-in, never autoplay.
 *
 * The engine wraps the WebAudio API. It does NOT initialize until the user
 * either toggles audio on or performs a real interaction (click/keydown).
 * Browsers require this gesture before AudioContext can resume.
 *
 * Sounds are registered (not preloaded) and only fetched when first played.
 *
 * Categories:
 *   - 'ui'      : button click, hover (one-shot, low cost)
 *   - 'signal'  : intelligence event tones (one-shot, mid)
 *   - 'ambient' : atmospheric loops (controlled by store.audioEnabled)
 */

export type SoundCategory = 'ui' | 'signal' | 'ambient';

export interface SoundDef {
  id: string;
  url: string;
  category: SoundCategory;
  /** Default volume 0..1 */
  volume?: number;
  /** Loop if ambient */
  loop?: boolean;
}

interface LoadedSound extends SoundDef {
  buffer?: AudioBuffer;
  source?: AudioBufferSourceNode;
  gain?: GainNode;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private categories: Record<SoundCategory, GainNode | null> = {
    ui: null,
    signal: null,
    ambient: null,
  };
  private sounds = new Map<string, LoadedSound>();
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the audio context. Must be called from a user-gesture handler.
   * Safe to call multiple times.
   */
  async init() {
    if (this.ctx) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      const Ctx =
        (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
          .AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.6;
      this.master.connect(this.ctx.destination);
      (['ui', 'signal', 'ambient'] as SoundCategory[]).forEach((cat) => {
        if (!this.ctx || !this.master) return;
        const g = this.ctx.createGain();
        g.gain.value = cat === 'ambient' ? 0.2 : cat === 'signal' ? 0.5 : 0.4;
        g.connect(this.master);
        this.categories[cat] = g;
      });
    })();
    return this.initPromise;
  }

  /** Register a sound — does not load it. */
  register(def: SoundDef) {
    this.sounds.set(def.id, { ...def });
  }

  setMasterVolume(v: number) {
    if (this.master) this.master.gain.value = Math.max(0, Math.min(1, v));
  }

  setCategoryVolume(cat: SoundCategory, v: number) {
    const g = this.categories[cat];
    if (g) g.gain.value = Math.max(0, Math.min(1, v));
  }

  private async load(id: string): Promise<AudioBuffer | undefined> {
    const s = this.sounds.get(id);
    if (!s || !this.ctx) return;
    if (s.buffer) return s.buffer;
    try {
      const res = await fetch(s.url);
      const arr = await res.arrayBuffer();
      const buf = await this.ctx.decodeAudioData(arr);
      s.buffer = buf;
      return buf;
    } catch {
      return undefined;
    }
  }

  /** Play a one-shot sound. Safe to call before init (no-ops). */
  async play(id: string, opts?: { volume?: number; rate?: number }) {
    if (!this.ctx) return;
    const s = this.sounds.get(id);
    if (!s) return;
    const buf = await this.load(id);
    if (!buf || !this.ctx) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = !!s.loop;
    src.playbackRate.value = opts?.rate ?? 1;
    const gain = this.ctx.createGain();
    gain.gain.value = (opts?.volume ?? s.volume ?? 1);
    src.connect(gain);
    gain.connect(this.categories[s.category] ?? this.master ?? this.ctx.destination);
    src.start();
    s.source = src;
    s.gain = gain;
  }

  stop(id: string) {
    const s = this.sounds.get(id);
    if (s?.source) {
      try { s.source.stop(); } catch { /* already stopped */ }
      s.source = undefined;
    }
  }

  isReady() {
    return !!this.ctx;
  }
}

let engine: AudioEngine | null = null;
export function getAudioEngine() {
  if (typeof window === 'undefined') return null;
  if (!engine) engine = new AudioEngine();
  return engine;
}
